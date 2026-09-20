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
});

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