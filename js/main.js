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

    target.innerHTML = data.map(t => `
      <div class="trainer">
        <img class="trainer-photo" src="${escapeHtml(t.photo_url || 'assets/placeholder-trainer.jpg')}" alt="${escapeHtml(t.name)}">
        <div class="trainer-name">${escapeHtml(t.name)}</div>
        <div class="trainer-role">${escapeHtml(t.role || '')}</div>
        <div class="trainer-bio">${escapeHtml(t.bio || '')}</div>
      </div>
    `).join('');
  } catch (err) {
    console.error('Could not load trainers:', err.message);
    target.innerHTML = `<p class="lede">Trainer profiles coming soon.</p>`;
  }
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
