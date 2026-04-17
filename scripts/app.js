// =============================================
// TENNIS CLUB SOCIAL MANAGER — app.js
// =============================================

// =============================================
// 1. STORAGE — Capa de acceso a localStorage
// =============================================

const KEYS = {
  posts:  'tcm_posts',
  ideas:  'tcm_ideas',
  events: 'tcm_events',
  media:  'tcm_media',
  tasks:  'tcm_tasks',
};

const Storage = {
  get(key) {
    try {
      return JSON.parse(localStorage.getItem(key)) || [];
    } catch {
      return [];
    }
  },
  save(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  },
};

// Genera un ID único basado en timestamp + random
function generateId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

// =============================================
// 2. DATA — Lógica de negocio
// =============================================

const Posts = {
  getAll()        { return Storage.get(KEYS.posts); },
  save(posts)     { Storage.save(KEYS.posts, posts); },

  // Posts publicados o programados en el mes actual
  getThisMonth() {
    const now = new Date();
    return this.getAll().filter(p => {
      const d = new Date(p.scheduledDate);
      return d.getFullYear() === now.getFullYear()
          && d.getMonth()    === now.getMonth();
    });
  },

  // Posts pendientes (draft o scheduled con fecha futura)
  getPending() {
    const today = new Date().toISOString().split('T')[0];
    return this.getAll().filter(p =>
      p.status === 'draft' ||
      (p.status === 'scheduled' && p.scheduledDate >= today)
    );
  },

  // Próximos 3 posts programados (fecha futura, ordenados)
  getUpcoming(limit = 3) {
    const today = new Date().toISOString().split('T')[0];
    return this.getAll()
      .filter(p => p.status === 'scheduled' && p.scheduledDate >= today)
      .sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate))
      .slice(0, limit);
  },
};

const Ideas = {
  getAll()    { return Storage.get(KEYS.ideas); },
  save(ideas) { Storage.save(KEYS.ideas, ideas); },

  // Las 3 ideas más recientes
  getRecent(limit = 3) {
    return this.getAll()
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, limit);
  },
};

const Events = {
  getAll()     { return Storage.get(KEYS.events); },
  save(events) { Storage.save(KEYS.events, events); },

  // Eventos desde hoy en adelante, ordenados, máximo 3
  getUpcoming(limit = 3) {
    const today = new Date().toISOString().split('T')[0];
    return this.getAll()
      .filter(e => e.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, limit);
  },
};

// =============================================
// 3. DASHBOARD — Conecta datos con el HTML
// =============================================

function formatDate(isoDate) {
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
}

function renderDashboard() {
  // --- Fecha actual en el topbar ---
  const dateEl = document.getElementById('current-date');
  if (dateEl) {
    dateEl.textContent = new Date().toLocaleDateString('es-AR', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  }

  // --- Stats ---
  document.getElementById('stat-posts-month').textContent  = Posts.getThisMonth().length;
  document.getElementById('stat-posts-pending').textContent = Posts.getPending().length;
  document.getElementById('stat-ideas').textContent         = Ideas.getAll().length;
  document.getElementById('stat-events').textContent        = Events.getUpcoming().length;

  // --- Lista: próximas publicaciones ---
  const postsList = document.getElementById('upcoming-posts-list');
  if (postsList) {
    const upcoming = Posts.getUpcoming();
    postsList.innerHTML = upcoming.length
      ? upcoming.map(p => `
          <li class="list-item">
            <span class="list-item__date">${formatDate(p.scheduledDate)}</span>
            <span class="list-item__title">${p.title}</span>
            <span class="list-item__platforms">${p.platform.join(' · ')}</span>
          </li>`).join('')
      : '<li class="posts-list__empty">No hay publicaciones programadas.</li>';
  }

  // --- Lista: ideas recientes ---
  const ideasList = document.getElementById('recent-ideas-list');
  if (ideasList) {
    const recent = Ideas.getRecent();
    ideasList.innerHTML = recent.length
      ? recent.map(i => `
          <li class="list-item">
            <span class="list-item__title">${i.title}</span>
            <span class="list-item__badge list-item__badge--${i.priority}">${i.priority}</span>
          </li>`).join('')
      : '<li class="ideas-list__empty">No hay ideas guardadas aún.</li>';
  }

  // --- Lista: eventos próximos ---
  const eventsList = document.getElementById('upcoming-events-list');
  if (eventsList) {
    const events = Events.getUpcoming();
    eventsList.innerHTML = events.length
      ? events.map(e => `
          <li class="list-item">
            <span class="list-item__date">${formatDate(e.date)}</span>
            <span class="list-item__title">${e.title}</span>
            <span class="list-item__type">${e.type}</span>
          </li>`).join('')
      : '<li class="events-list__empty">No hay eventos próximos.</li>';
  }
}

// =============================================
// INIT — Punto de entrada según la página
// =============================================

document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page;
  if (page === 'dashboard') renderDashboard();
});