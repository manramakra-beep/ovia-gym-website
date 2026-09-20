// ==========================================================================
// OVIA GYM — shared front-end behavior
// ==========================================================================

// Mobile nav toggle
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.nav-toggle');
  const menu = document.querySelector('.nav ul');
  if (toggle && menu) {
    toggle.addEventListener('click', () => menu.classList.toggle('open'));
  }
  initStatsCounter();
  initClassRowAnimation();
});

// --------------------------------------------------------------------------
// STATS COUNTER — numbers count up from 0 when scrolled into view
// Expects markup like: <div class="num" data-target="1200" data-suffix="+">0+</div>
// --------------------------------------------------------------------------
function initStatsCounter() {
  const nums = document.querySelectorAll('.stat .num[data-target]');
  if (!nums.length) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    nums.forEach(el => { el.textContent = el.dataset.target + (el.dataset.suffix || ''); });
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  nums.forEach(el => observer.observe(el));
}

function animateCount(el) {
  const target = parseInt(el.dataset.target, 10);
  const suffix = el.dataset.suffix || '';
  const duration = 1600;
  const start = performance.now();

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    el.textContent = Math.round(target * eased) + suffix;
    if (progress < 1) requestAnimationFrame(tick);
    else el.textContent = target + suffix;
  }
  requestAnimationFrame(tick);
}

// --------------------------------------------------------------------------
// CLASS ROWS — rows fade/slide in one after another as you scroll to them
// --------------------------------------------------------------------------
function initClassRowAnimation() {
  const rows = document.querySelectorAll('.class-list .class-row');
  if (!rows.length) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    rows.forEach(r => r.classList.add('in-view'));
    return;
  }

  const rowList = Array.from(rows);
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const row = entry.target;
        const index = rowList.indexOf(row);
        row.style.transitionDelay = `${index * 0.15}s`;
        row.classList.add('in-view');
        observer.unobserve(row);
      }
    });
  }, { threshold: 0.2 });

  rowList.forEach(row => observer.observe(row));
}

// --------------------------------------------------------------------------
// OFFERS BANNER — shown on every public page if there are active offers
// Table: offers (id, title, active boolean, expires_at timestamptz)
// --------------------------------------------------------------------------
async function loadOffersBanner() {
  const banner = document.getElementById('offers-banner');
  const track = document.getElementById('offers-track');
  if (!banner || !track || typeof supabaseClient === 'undefined') return;

  try {
    const { data, error } = await supabaseClient
      .from('offers')
      .select('title')
      .eq('active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!data || data.length === 0) return;

    track.innerHTML = data.map(o => `<span>🔥 ${escapeHtml(o.title)}</span>`).join('');
    banner.classList.add('has-offers');
  } catch (err) {
    console.error('Could not load offers:', err.message);
  }
}

// --------------------------------------------------------------------------
// TRAINERS — Table: trainers (id, name, role, bio, photo_url, sort_order)
// --------------------------------------------------------------------------
async function loadTrainers(targetSelector, limit) {
  const target = document.querySelector(targetSelector);
  if (!target || typeof supabaseClient === 'undefined') return;

  try {
    let query = supabaseClient.from('trainers').select('*').order('sort_order', { ascending: true });
    if (limit) query = query.limit(limit);
    const { data, error } = await query;
    if (error) throw error;

    if (!data || data.length === 0) {
      target.innerHTML = `<p class="lede">Trainer profiles coming soon.</p>`;
      return;
    }

    target.classList.add('trainers-carousel');
    target.innerHTML = `<div class="trainers-track">${data.map(t => `
      <div class="trainer-card">
        <div class="trainer-box">
          <img class="trainer-photo" src="${escapeHtml(t.photo_url || 'assets/placeholder-trainer.jpg')}" alt="${escapeHtml(t.name)}">
          <div class="trainer-name">${escapeHtml(t.name)}</div>
          <div class="trainer-role">${escapeHtml(t.role || '')}</div>
          <div class="trainer-bio">${escapeHtml(t.bio || '')}</div>
        </div>
      </div>
    `).join('')}</div>`;

    initTrainerCarousel(target, data.length);
  } catch (err) {
    console.error('Could not load trainers:', err.message);
    target.innerHTML = `<p class="lede">Trainer profiles coming soon.</p>`;
  }
}

// How many trainer cards are visible at once, based on viewport width
function getVisibleTrainerCount() {
  const w = window.innerWidth;
  if (w <= 640) return 1;
  if (w <= 900) return 2;
  return 3;
}

// Auto-advances the trainer carousel one card at a time, smoothly, on a loop
function initTrainerCarousel(container, total) {
  const track = container.querySelector('.trainers-track');
  if (!track) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;
  if (total <= getVisibleTrainerCount()) return; // nothing to slide

  let index = 0;
  setInterval(() => {
    const visible = getVisibleTrainerCount();
    if (total <= visible) { track.style.transform = 'translateX(0)'; index = 0; return; }
    const maxIndex = total - visible;
    index = index >= maxIndex ? 0 : index + 1;
    track.style.transform = `translateX(-${(100 / visible) * index}%)`;
  }, 3500);
}

// --------------------------------------------------------------------------
// GALLERY — Table: gallery (id, image_url, caption, sort_order)
// --------------------------------------------------------------------------
async function loadGallery(targetSelector, limit) {
  const target = document.querySelector(targetSelector);
  if (!target || typeof supabaseClient === 'undefined') return;

  try {
    let query = supabaseClient.from('gallery').select('*').order('sort_order', { ascending: true });
    if (limit) query = query.limit(limit);
    const { data, error } = await query;
    if (error) throw error;

    if (!data || data.length === 0) {
      target.innerHTML = '';
      return;
    }

    target.innerHTML = data.map(g => `
      <img src="${escapeHtml(g.image_url)}" alt="${escapeHtml(g.caption || 'OVIA GYM')}">
    `).join('');
  } catch (err) {
    console.error('Could not load gallery:', err.message);
  }
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}