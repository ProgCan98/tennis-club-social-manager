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
// 2. SEED — Carga mock data si localStorage está vacío
// =============================================

const MOCK_DATA = {
  posts: [
    {
      id: 'post_001',
      title: 'Apertura Torneo de Verano',
      body: 'Este sábado arranca el torneo más esperado del año 🏆',
      status: 'scheduled',
      platforms: ['instagram', 'facebook'],
      scheduledDate: '2026-05-10',
      publishedDate: null,
      eventId: 'evt_001',
      mediaIds: [],
      tags: ['torneo', 'verano'],
      createdAt: '2026-04-15T10:00:00Z',
      updatedAt: '2026-04-16T14:30:00Z',
    },
    {
      id: 'post_002',
      title: 'Tips: cómo mejorar tu revés',
      body: '3 ejercicios que podés hacer en casa para un revés más sólido 💪',
      status: 'draft',
      platforms: ['instagram'],
      scheduledDate: null,
      publishedDate: null,
      eventId: null,
      mediaIds: [],
      tags: ['tips', 'técnica'],
      createdAt: '2026-04-16T09:00:00Z',
      updatedAt: '2026-04-16T09:00:00Z',
    },
  ],
  ideas: [
    {
      id: 'idea_001',
      title: 'Recorrido virtual por las canchas',
      description: 'Video corto mostrando las instalaciones renovadas',
      priority: 'alta',
      status: 'aprobada',
      convertedPostId: null,
      tags: ['instalaciones', 'video'],
      createdAt: '2026-04-10T08:00:00Z',
    },
    {
      id: 'idea_002',
      title: 'Entrevista a jugador destacado del mes',
      description: 'Preguntas cortas + foto en cancha',
      priority: 'media',
      status: 'nueva',
      convertedPostId: null,
      tags: ['comunidad', 'entrevista'],
      createdAt: '2026-04-12T11:30:00Z',
    },
  ],
  events: [
    {
      id: 'evt_001',
      title: 'Torneo de Verano 2026',
      date: '2026-05-10',
      endDate: '2026-05-12',
      type: 'torneo',
      description: 'Categorías Sub-14, Sub-18 y Libre',
      createdAt: '2026-04-01T10:00:00Z',
    },
    {
      id: 'evt_002',
      title: 'Clínica de Dobles',
      date: '2026-05-20',
      endDate: null,
      type: 'clase',
      description: 'Clase abierta para socios, foco en estrategia de dobles',
      createdAt: '2026-04-05T15:00:00Z',
    },
  ],
  media: [],
  tasks: [],
};

function seedIfEmpty() {
  const isEmpty = [KEYS.posts, KEYS.ideas, KEYS.events].every(
    key => localStorage.getItem(key) === null
  );
  if (!isEmpty) return;

  Storage.save(KEYS.posts,  MOCK_DATA.posts);
  Storage.save(KEYS.ideas,  MOCK_DATA.ideas);
  Storage.save(KEYS.events, MOCK_DATA.events);
  Storage.save(KEYS.media,  MOCK_DATA.media);
  Storage.save(KEYS.tasks,  MOCK_DATA.tasks);
}

// =============================================
// 3. DATA — Lógica de negocio
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
// 7. UI — Sidebar
// =============================================

const NAV_ITEMS = [
  { page: 'dashboard', href: 'dashboard.html', icon: '📊', label: 'Dashboard'     },
  { page: 'posts',     href: 'posts.html',     icon: '📝', label: 'Publicaciones' },
  { page: 'ideas',     href: 'ideas.html',     icon: '💡', label: 'Ideas'         },
  { page: 'calendar',  href: 'calendar.html',  icon: '📅', label: 'Calendario'    },
];

function renderSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;

  const currentPage = document.body.dataset.page;

  sidebar.setAttribute('role', 'navigation');
  sidebar.setAttribute('aria-label', 'Menú principal');
  sidebar.classList.add('sidebar');

  sidebar.innerHTML = `
    <div class="sidebar__brand">
      <img src="../assets/icons/logo.svg" alt="Logo del club" class="sidebar__logo" />
      <h1 class="sidebar__title">Tennis Club</h1>
      <p class="sidebar__subtitle">Social Manager</p>
    </div>
    <nav class="sidebar__nav">
      <ul class="nav__list">
        ${NAV_ITEMS.map(item => `
          <li class="nav__item ${currentPage === item.page ? 'nav__item--active' : ''}">
            <a href="${item.href}" class="nav__link">
              <span class="nav__icon" aria-hidden="true">${item.icon}</span>
              ${item.label}
            </a>
          </li>
        `).join('')}
      </ul>
    </nav>
  `;
}

// =============================================
// 8. UI — Modal & Toast
// =============================================

// --- Modal ---

let _toastTimer = null;

function openModal({ title, contentHTML, footerHTML = '' }) {
  const modal   = document.getElementById('modal');
  const titleEl = document.getElementById('modal-title');
  const content = document.getElementById('modal-content');
  const footer  = document.getElementById('modal-footer');

  if (!modal) return;

  titleEl.textContent = title;
  content.innerHTML   = contentHTML;
  footer.innerHTML    = footerHTML;

  modal.classList.add('modal--open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  const modal = document.getElementById('modal');
  if (!modal) return;

  modal.classList.remove('modal--open');
  document.body.style.overflow = '';
}

function bindModalClose() {
  document.getElementById('modal-close')?.addEventListener('click', closeModal);
  document.getElementById('modal-overlay')?.addEventListener('click', closeModal);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
}

// --- Toast ---

function showToast(message, type = 'success') {
  const toast  = document.getElementById('toast');
  const iconEl = document.getElementById('toast-icon');
  const msgEl  = document.getElementById('toast-message');

  if (!toast) return;

  const icons = {
    success: '✅',
    error:   '❌',
    warning: '⚠️',
    info:    'ℹ️',
  };

  toast.className = 'toast';
  toast.classList.add(`toast--${type}`);

  iconEl.textContent = icons[type] ?? '';
  msgEl.textContent  = message;

  toast.classList.add('toast--visible');

  if (_toastTimer) clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => {
    toast.classList.remove('toast--visible');
    _toastTimer = null;
  }, 3000);
}

// =============================================
// 11. PAGE — Posts
// =============================================

const STATUS_LABELS = {
  draft:     'Borrador',
  scheduled: 'Programado',
  published: 'Publicado',
};

function renderPostsList(filter = 'all') {
  const list    = document.getElementById('posts-list');
  const countEl = document.getElementById('posts-count');
  if (!list) return;

  const all      = Posts.getAll();
  const filtered = filter === 'all' ? all : all.filter(p => p.status === filter);

  countEl.textContent = filtered.length;

  if (!filtered.length) {
    list.innerHTML = '<li class="list-empty">No hay publicaciones para este filtro.</li>';
    return;
  }

  list.innerHTML = filtered
    .sort((a, b) => {
      if (a.scheduledDate && b.scheduledDate) return a.scheduledDate.localeCompare(b.scheduledDate);
      if (a.scheduledDate) return -1;
      if (b.scheduledDate) return 1;
      return b.createdAt.localeCompare(a.createdAt);
    })
    .map(p => `
      <li class="post-item" data-id="${p.id}">
        <div class="post-item__main">
          <span class="post-item__status post-item__status--${p.status}">
            ${STATUS_LABELS[p.status] ?? p.status}
          </span>
          <span class="post-item__title">${p.title}</span>
        </div>
        <div class="post-item__meta">
          <span class="post-item__platforms">${p.platforms.join(' · ')}</span>
          <span class="post-item__date">${p.scheduledDate ? formatDate(p.scheduledDate) : '—'}</span>
        </div>
        <div class="post-item__actions">
          ${p.status !== 'published' ? `
            <button class="btn-icon btn-icon--advance" data-action="advance" data-id="${p.id}"
              title="${p.status === 'draft' ? 'Marcar como programado' : 'Marcar como publicado'}">
              ${p.status === 'draft' ? '📅' : '✅'}
            </button>` : ''}
          <button class="btn-icon" data-action="edit"   data-id="${p.id}" title="Editar">✏️</button>
          <button class="btn-icon" data-action="delete" data-id="${p.id}" title="Eliminar">🗑️</button>
        </div>
      </li>
    `).join('');
}

// --- Formulario de Post (crear y editar) ---

function buildPostFormHTML(post = null) {
  const platforms = ['instagram', 'facebook', 'twitter', 'whatsapp'];
  return `
    <div class="form-group">
      <label class="form-label" for="f-title">Título *</label>
      <input class="form-input" id="f-title" type="text" maxlength="120"
        placeholder="Ej: Apertura del torneo de verano"
        value="${post ? post.title : ''}" required />
    </div>

    <div class="form-group">
      <label class="form-label" for="f-body">Texto / Caption</label>
      <textarea class="form-input form-textarea" id="f-body"
        rows="4" placeholder="Escribí el texto del post...">${post ? post.body : ''}</textarea>
    </div>

    <div class="form-group">
      <label class="form-label">Plataformas *</label>
      <div class="form-checkboxes">
        ${platforms.map(p => `
          <label class="form-checkbox">
            <input type="checkbox" value="${p}"
              ${post?.platforms?.includes(p) ? 'checked' : ''} />
            ${p.charAt(0).toUpperCase() + p.slice(1)}
          </label>
        `).join('')}
      </div>
    </div>

    <div class="form-group">
      <label class="form-label" for="f-status">Estado</label>
      <select class="form-input form-select" id="f-status">
        <option value="draft"     ${(!post || post.status === 'draft')     ? 'selected' : ''}>Borrador</option>
        <option value="scheduled" ${post?.status === 'scheduled'           ? 'selected' : ''}>Programado</option>
        <option value="published" ${post?.status === 'published'           ? 'selected' : ''}>Publicado</option>
      </select>
    </div>

    <div class="form-group">
      <label class="form-label" for="f-date">Fecha programada</label>
      <input class="form-input" id="f-date" type="date"
        value="${post?.scheduledDate ?? ''}" />
    </div>

    <div class="form-group">
      <label class="form-label" for="f-tags">Etiquetas (separadas por coma)</label>
      <input class="form-input" id="f-tags" type="text"
        placeholder="Ej: torneo, verano, juveniles"
        value="${post ? post.tags.join(', ') : ''}" />
    </div>
  `;
}

function getPostFormValues() {
  const platforms = [...document.querySelectorAll('.form-checkboxes input:checked')]
    .map(cb => cb.value);
  return {
    title:         document.getElementById('f-title').value.trim(),
    body:          document.getElementById('f-body').value.trim(),
    platforms,
    status:        document.getElementById('f-status').value,
    scheduledDate: document.getElementById('f-date').value || null,
    tags:          document.getElementById('f-tags').value
                     .split(',').map(t => t.trim()).filter(Boolean),
  };
}

function validatePostForm(values) {
  if (!values.title)            return 'El título es obligatorio.';
  if (!values.platforms.length) return 'Seleccioná al menos una plataforma.';
  return null;
}

function openPostForm(post = null) {
  const isEdit = post !== null;
  openModal({
    title:       isEdit ? 'Editar publicación' : 'Nueva publicación',
    contentHTML: buildPostFormHTML(post),
    footerHTML: `
      <button class="btn btn--secondary" onclick="closeModal()">Cancelar</button>
      <button class="btn btn--primary"   onclick="${isEdit ? `saveEditPost('${post.id}')` : 'saveNewPost()'}">
        ${isEdit ? 'Guardar cambios' : 'Crear publicación'}
      </button>
    `,
  });
}

function saveNewPost() {
  const values = getPostFormValues();
  const error  = validatePostForm(values);
  if (error) { showToast(error, 'warning'); return; }

  const now  = new Date().toISOString();
  const post = {
    id:            generateId('post'),
    ...values,
    publishedDate: values.status === 'published' ? now.split('T')[0] : null,
    eventId:       null,
    mediaIds:      [],
    createdAt:     now,
    updatedAt:     now,
  };

  const posts = Posts.getAll();
  posts.push(post);
  Posts.save(posts);

  closeModal();
  renderPostsList(getActiveFilter());
  showToast('Publicación creada', 'success');
}

function saveEditPost(id) {
  const values = getPostFormValues();
  const error  = validatePostForm(values);
  if (error) { showToast(error, 'warning'); return; }

  const posts = Posts.getAll();
  const index = posts.findIndex(p => p.id === id);
  if (index === -1) { showToast('No se encontró la publicación', 'error'); return; }

  posts[index] = {
    ...posts[index],
    ...values,
    publishedDate: values.status === 'published'
      ? (posts[index].publishedDate ?? new Date().toISOString().split('T')[0])
      : null,
    updatedAt: new Date().toISOString(),
  };

  Posts.save(posts);
  closeModal();
  renderPostsList(getActiveFilter());
  showToast('Publicación actualizada', 'success');
}

function getActiveFilter() {
  return document.querySelector('#posts-tabs .tab--active')?.dataset.filter ?? 'all';
}

const STATUS_NEXT = { draft: 'scheduled', scheduled: 'published' };
const STATUS_ADVANCE_LABELS = { draft: 'programado', scheduled: 'publicado' };

function advancePostStatus(id) {
  const posts = Posts.getAll();
  const index = posts.findIndex(p => p.id === id);
  if (index === -1) return;

  const current = posts[index].status;
  const next    = STATUS_NEXT[current];
  if (!next) return;

  posts[index] = {
    ...posts[index],
    status:        next,
    publishedDate: next === 'published' ? new Date().toISOString().split('T')[0] : posts[index].publishedDate,
    updatedAt:     new Date().toISOString(),
  };

  Posts.save(posts);
  renderPostsList(getActiveFilter());
  showToast(`Publicación marcada como ${STATUS_ADVANCE_LABELS[current]}`, 'success');
}

function confirmDeletePost(id) {
  const post = Posts.getAll().find(p => p.id === id);
  if (!post) return;

  openModal({
    title: 'Eliminar publicación',
    contentHTML: `
      <p>¿Estás seguro que querés eliminar <strong>${post.title}</strong>?</p>
      <p class="form-hint">Esta acción no se puede deshacer.</p>
    `,
    footerHTML: `
      <button class="btn btn--secondary" onclick="closeModal()">Cancelar</button>
      <button class="btn btn--danger"    onclick="deletePost('${id}')">Eliminar</button>
    `,
  });
}

function deletePost(id) {
  const posts    = Posts.getAll();
  const filtered = posts.filter(p => p.id !== id);

  if (filtered.length === posts.length) {
    showToast('No se encontró la publicación', 'error');
    return;
  }

  Posts.save(filtered);
  closeModal();
  renderPostsList(getActiveFilter());
  showToast('Publicación eliminada', 'info');
}

function renderPostsPage() {
  const dateEl = document.getElementById('current-date');
  if (dateEl) {
    dateEl.textContent = new Date().toLocaleDateString('es-AR', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  }

  renderPostsList('all');

  // Botón nueva publicación
  document.getElementById('btn-new-post')?.addEventListener('click', () => openPostForm());

  // Tabs
  document.getElementById('posts-tabs')?.addEventListener('click', (e) => {
    const tab = e.target.closest('[data-filter]');
    if (!tab) return;
    document.querySelectorAll('#posts-tabs .tab').forEach(t => t.classList.remove('tab--active'));
    tab.classList.add('tab--active');
    renderPostsList(tab.dataset.filter);
  });

  // Acciones inline (editar) — delegación de eventos
  document.getElementById('posts-list')?.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const { action, id } = btn.dataset;
    if (action === 'advance') {
      advancePostStatus(id);
    }
    if (action === 'edit') {
      const post = Posts.getAll().find(p => p.id === id);
      if (post) openPostForm(post);
    }
    if (action === 'delete') {
      confirmDeletePost(id);
    }
  });
}

// =============================================
// 12. PAGE — Ideas
// =============================================

const IDEA_STATUS_LABELS = {
  nueva:      'Nueva',
  aprobada:   'Aprobada',
  descartada: 'Descartada',
  convertida: 'Convertida',
};

const IDEA_PRIORITY_LABELS = {
  alta:  'Alta',
  media: 'Media',
  baja:  'Baja',
};

function renderIdeasList(filter = 'all') {
  const list    = document.getElementById('ideas-list');
  const countEl = document.getElementById('ideas-count');
  if (!list) return;

  const all      = Ideas.getAll();
  const filtered = filter === 'all' ? all : all.filter(i => i.status === filter);

  countEl.textContent = filtered.length;

  if (!filtered.length) {
    list.innerHTML = '<li class="list-empty">No hay ideas para este filtro.</li>';
    return;
  }

  list.innerHTML = filtered
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map(i => `
      <li class="idea-item" data-id="${i.id}">
        <div class="idea-item__main">
          <span class="idea-item__status idea-item__status--${i.status}">
            ${IDEA_STATUS_LABELS[i.status] ?? i.status}
          </span>
          <span class="idea-item__priority idea-item__priority--${i.priority}">
            ${IDEA_PRIORITY_LABELS[i.priority] ?? i.priority}
          </span>
          <span class="idea-item__title">${i.title}</span>
        </div>
        <div class="idea-item__actions">
          ${i.status !== 'convertida' && i.status !== 'descartada' ? `
            <button class="btn-icon" data-action="convert" data-id="${i.id}" title="Convertir en post">🔁</button>
          ` : ''}
          <button class="btn-icon" data-action="edit"   data-id="${i.id}" title="Editar">✏️</button>
          <button class="btn-icon" data-action="delete" data-id="${i.id}" title="Eliminar">🗑️</button>
        </div>
      </li>
    `).join('');
}

function buildIdeaFormHTML(idea = null) {
  return `
    <div class="form-group">
      <label class="form-label" for="f-idea-title">Título *</label>
      <input class="form-input" id="f-idea-title" type="text" maxlength="120"
        placeholder="Ej: Video del equipo infantil"
        value="${idea ? idea.title : ''}" required />
    </div>

    <div class="form-group">
      <label class="form-label" for="f-idea-desc">Descripción</label>
      <textarea class="form-input form-textarea" id="f-idea-desc"
        rows="3" placeholder="Detallá la idea...">${idea ? idea.description : ''}</textarea>
    </div>

    <div class="form-group">
      <label class="form-label" for="f-idea-priority">Prioridad</label>
      <select class="form-input form-select" id="f-idea-priority">
        <option value="alta"  ${(!idea || idea.priority === 'alta')  ? 'selected' : ''}>Alta</option>
        <option value="media" ${idea?.priority === 'media'           ? 'selected' : ''}>Media</option>
        <option value="baja"  ${idea?.priority === 'baja'            ? 'selected' : ''}>Baja</option>
      </select>
    </div>

    <div class="form-group">
      <label class="form-label" for="f-idea-status">Estado</label>
      <select class="form-input form-select" id="f-idea-status">
        <option value="nueva"      ${(!idea || idea.status === 'nueva')      ? 'selected' : ''}>Nueva</option>
        <option value="aprobada"   ${idea?.status === 'aprobada'             ? 'selected' : ''}>Aprobada</option>
        <option value="descartada" ${idea?.status === 'descartada'           ? 'selected' : ''}>Descartada</option>
      </select>
    </div>

    <div class="form-group">
      <label class="form-label" for="f-idea-tags">Etiquetas (separadas por coma)</label>
      <input class="form-input" id="f-idea-tags" type="text"
        placeholder="Ej: video, comunidad"
        value="${idea ? idea.tags.join(', ') : ''}" />
    </div>
  `;
}

function getIdeaFormValues() {
  return {
    title:       document.getElementById('f-idea-title').value.trim(),
    description: document.getElementById('f-idea-desc').value.trim(),
    priority:    document.getElementById('f-idea-priority').value,
    status:      document.getElementById('f-idea-status').value,
    tags:        document.getElementById('f-idea-tags').value
                   .split(',').map(t => t.trim()).filter(Boolean),
  };
}

function validateIdeaForm(values) {
  if (!values.title) return 'El título es obligatorio.';
  return null;
}

function openIdeaForm(idea = null) {
  const isEdit = idea !== null;
  openModal({
    title:       isEdit ? 'Editar idea' : 'Nueva idea',
    contentHTML: buildIdeaFormHTML(idea),
    footerHTML: `
      <button class="btn btn--secondary" onclick="closeModal()">Cancelar</button>
      <button class="btn btn--primary"   onclick="${isEdit ? `saveEditIdea('${idea.id}')` : 'saveNewIdea()'}">
        ${isEdit ? 'Guardar cambios' : 'Crear idea'}
      </button>
    `,
  });
}

function saveNewIdea() {
  const values = getIdeaFormValues();
  const error  = validateIdeaForm(values);
  if (error) { showToast(error, 'warning'); return; }

  const now  = new Date().toISOString();
  const idea = {
    id:              generateId('idea'),
    ...values,
    convertedPostId: null,
    createdAt:       now,
  };

  const ideas = Ideas.getAll();
  ideas.push(idea);
  Ideas.save(ideas);

  closeModal();
  renderIdeasList(getActiveIdeasFilter());
  showToast('Idea creada', 'success');
}

function saveEditIdea(id) {
  const values = getIdeaFormValues();
  const error  = validateIdeaForm(values);
  if (error) { showToast(error, 'warning'); return; }

  const ideas = Ideas.getAll();
  const index = ideas.findIndex(i => i.id === id);
  if (index === -1) { showToast('No se encontró la idea', 'error'); return; }

  ideas[index] = { ...ideas[index], ...values };
  Ideas.save(ideas);

  closeModal();
  renderIdeasList(getActiveIdeasFilter());
  showToast('Idea actualizada', 'success');
}

function confirmDeleteIdea(id) {
  const idea = Ideas.getAll().find(i => i.id === id);
  if (!idea) return;

  openModal({
    title: 'Eliminar idea',
    contentHTML: `
      <p>¿Estás seguro que querés eliminar <strong>${idea.title}</strong>?</p>
      <p class="form-hint">Esta acción no se puede deshacer.</p>
    `,
    footerHTML: `
      <button class="btn btn--secondary" onclick="closeModal()">Cancelar</button>
      <button class="btn btn--danger"    onclick="deleteIdea('${id}')">Eliminar</button>
    `,
  });
}

function deleteIdea(id) {
  const ideas    = Ideas.getAll();
  const filtered = ideas.filter(i => i.id !== id);

  if (filtered.length === ideas.length) {
    showToast('No se encontró la idea', 'error');
    return;
  }

  Ideas.save(filtered);
  closeModal();
  renderIdeasList(getActiveIdeasFilter());
  showToast('Idea eliminada', 'info');
}

function convertIdeaToPost(id) {
  const ideas = Ideas.getAll();
  const index = ideas.findIndex(i => i.id === id);
  if (index === -1) return;

  const idea = ideas[index];
  const now  = new Date().toISOString();

  const newPost = {
    id:            generateId('post'),
    title:         idea.title,
    body:          idea.description,
    status:        'draft',
    platforms:     [],
    scheduledDate: null,
    publishedDate: null,
    eventId:       null,
    mediaIds:      [],
    tags:          idea.tags,
    createdAt:     now,
    updatedAt:     now,
  };

  const posts = Posts.getAll();
  posts.push(newPost);
  Posts.save(posts);

  ideas[index] = { ...idea, status: 'convertida', convertedPostId: newPost.id };
  Ideas.save(ideas);

  closeModal();
  renderIdeasList(getActiveIdeasFilter());
  showToast('Idea convertida en borrador de post', 'success');
}

function confirmConvertIdea(id) {
  const idea = Ideas.getAll().find(i => i.id === id);
  if (!idea) return;

  openModal({
    title: 'Convertir en post',
    contentHTML: `
      <p>Se creará un post en borrador con el título y texto de <strong>${idea.title}</strong>.</p>
      <p class="form-hint">Podés editarlo desde la sección Publicaciones.</p>
    `,
    footerHTML: `
      <button class="btn btn--secondary" onclick="closeModal()">Cancelar</button>
      <button class="btn btn--primary"   onclick="convertIdeaToPost('${id}')">Convertir</button>
    `,
  });
}

function getActiveIdeasFilter() {
  return document.querySelector('#ideas-tabs .tab--active')?.dataset.filter ?? 'all';
}

function renderIdeasPage() {
  const dateEl = document.getElementById('current-date');
  if (dateEl) {
    dateEl.textContent = new Date().toLocaleDateString('es-AR', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  }

  renderIdeasList('all');

  document.getElementById('btn-new-idea')?.addEventListener('click', () => openIdeaForm());

  document.getElementById('ideas-tabs')?.addEventListener('click', (e) => {
    const tab = e.target.closest('[data-filter]');
    if (!tab) return;
    document.querySelectorAll('#ideas-tabs .tab').forEach(t => t.classList.remove('tab--active'));
    tab.classList.add('tab--active');
    renderIdeasList(tab.dataset.filter);
  });

  document.getElementById('ideas-list')?.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const { action, id } = btn.dataset;
    if (action === 'edit')    { const idea = Ideas.getAll().find(i => i.id === id); if (idea) openIdeaForm(idea); }
    if (action === 'delete')  { confirmDeleteIdea(id); }
    if (action === 'convert') { confirmConvertIdea(id); }
  });
}

// =============================================
// =============================================
// 13. PAGE — Calendar
// =============================================

const EVENT_TYPE_LABELS = {
  torneo:  'Torneo',
  clase:   'Clase',
  social:  'Social',
  feriado: 'Feriado',
  otro:    'Otro',
};

const EVENT_TYPE_COLORS = {
  torneo:  '#c62828',
  clase:   '#1565c0',
  social:  '#2e7d32',
  feriado: '#f57f17',
  otro:    '#6b7280',
};

// Estado interno del calendario (mes visible)
let _calendarYear  = new Date().getFullYear();
let _calendarMonth = new Date().getMonth(); // 0-11
let _selectedDate  = null;

// --- #21 + #22: Grilla mensual + navegación ---

function renderCalendar() {
  const title = document.getElementById('calendar-month-title');
  const grid  = document.getElementById('calendar-grid');
  if (!grid) return;

  const monthNames = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                      'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  title.textContent = `${monthNames[_calendarMonth]} ${_calendarYear}`;

  const firstDay    = new Date(_calendarYear, _calendarMonth, 1).getDay(); // 0=Dom
  const daysInMonth = new Date(_calendarYear, _calendarMonth + 1, 0).getDate();
  const today       = new Date().toISOString().split('T')[0];

  // --- #23: Indexar eventos y posts por fecha ---
  const events = Events.getAll();
  const posts  = Posts.getAll().filter(p => p.scheduledDate);

  const eventsByDate = {};
  events.forEach(e => {
    if (!eventsByDate[e.date]) eventsByDate[e.date] = [];
    eventsByDate[e.date].push({ ...e, _kind: 'event' });
  });
  posts.forEach(p => {
    if (!eventsByDate[p.scheduledDate]) eventsByDate[p.scheduledDate] = [];
    eventsByDate[p.scheduledDate].push({ ...p, _kind: 'post' });
  });

  // Celdas vacías antes del día 1
  const blanks = Array(firstDay).fill('<div class="calendar-cell calendar-cell--empty"></div>');

  // Celdas de días
  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const day       = i + 1;
    const dateStr   = `${_calendarYear}-${String(_calendarMonth + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    const isToday   = dateStr === today;
    const isSelected = dateStr === _selectedDate;
    const items     = eventsByDate[dateStr] || [];

    const dots = items.map(item =>
      `<span class="calendar-dot" style="background:${item._kind === 'event' ? (EVENT_TYPE_COLORS[item.type] ?? '#6b7280') : '#9c27b0'}"
        title="${item.title}"></span>`
    ).join('');

    return `
      <div class="calendar-cell ${isToday ? 'calendar-cell--today' : ''} ${isSelected ? 'calendar-cell--selected' : ''} ${items.length ? 'calendar-cell--has-items' : ''}"
        data-date="${dateStr}" role="button" tabindex="0">
        <span class="calendar-cell__day">${day}</span>
        <div class="calendar-cell__dots">${dots}</div>
      </div>
    `;
  });

  grid.innerHTML = [...blanks, ...days].join('');
}

// --- #27: Click en día → panel de detalle ---

function renderDayDetail(dateStr) {
  const section = document.getElementById('day-detail-section');
  const heading = document.getElementById('day-detail-heading');
  const list    = document.getElementById('day-detail-list');
  if (!section) return;

  _selectedDate = dateStr;
  renderCalendar(); // re-render para marcar celda seleccionada

  const [year, month, day] = dateStr.split('-');
  const monthNames = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
    'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  heading.textContent = `${parseInt(day)} de ${monthNames[parseInt(month) - 1]} ${year}`;

  const dayEvents = Events.getAll().filter(e => e.date === dateStr);
  const dayPosts  = Posts.getAll().filter(p => p.scheduledDate === dateStr);

  if (!dayEvents.length && !dayPosts.length) {
    list.innerHTML = '<li class="list-empty">No hay eventos ni publicaciones este día.</li>';
  } else {
    list.innerHTML = [
      ...dayEvents.map(e => `
        <li class="day-detail-item day-detail-item--event">
          <span class="day-detail-item__dot" style="background:${EVENT_TYPE_COLORS[e.type] ?? '#6b7280'}"></span>
          <div class="day-detail-item__body">
            <strong>${e.title}</strong>
            <span>${EVENT_TYPE_LABELS[e.type] ?? e.type}${e.description ? ' — ' + e.description : ''}</span>
          </div>
          <div class="day-detail-item__actions">
            <button class="btn-icon" data-action="edit-event"   data-id="${e.id}" title="Editar">&#9998;</button>
            <button class="btn-icon" data-action="delete-event" data-id="${e.id}" title="Eliminar">&#128465;</button>
          </div>
        </li>`),
      ...dayPosts.map(p => `
        <li class="day-detail-item day-detail-item--post">
          <span class="day-detail-item__dot" style="background:#9c27b0"></span>
          <div class="day-detail-item__body">
            <strong>${p.title}</strong>
            <span>${p.platforms.join(' · ')}</span>
          </div>
        </li>`),
    ].join('');
  }

  section.hidden = false;
}

// --- #24 + #25: Formulario crear / editar evento ---

function buildEventFormHTML(event = null) {
  return `
    <div class="form-group">
      <label class="form-label" for="f-evt-title">Título *</label>
      <input class="form-input" id="f-evt-title" type="text" maxlength="120"
        placeholder="Ej: Torneo de Dobles"
        value="${event ? event.title : ''}" required />
    </div>

    <div class="form-group">
      <label class="form-label" for="f-evt-date">Fecha *</label>
      <input class="form-input" id="f-evt-date" type="date"
        value="${event?.date ?? ''}" required />
    </div>

    <div class="form-group">
      <label class="form-label" for="f-evt-end-date">Fecha de fin (opcional)</label>
      <input class="form-input" id="f-evt-end-date" type="date"
        value="${event?.endDate ?? ''}" />
    </div>

    <div class="form-group">
      <label class="form-label" for="f-evt-type">Tipo</label>
      <select class="form-input form-select" id="f-evt-type">
        ${Object.entries(EVENT_TYPE_LABELS).map(([val, label]) =>
          `<option value="${val}" ${event?.type === val ? 'selected' : ''}>${label}</option>`
        ).join('')}
      </select>
    </div>

    <div class="form-group">
      <label class="form-label" for="f-evt-desc">Descripción</label>
      <textarea class="form-input form-textarea" id="f-evt-desc"
        rows="3" placeholder="Detalles del evento...">${event?.description ?? ''}</textarea>
    </div>
  `;
}

function getEventFormValues() {
  return {
    title:       document.getElementById('f-evt-title').value.trim(),
    date:        document.getElementById('f-evt-date').value,
    endDate:     document.getElementById('f-evt-end-date').value || null,
    type:        document.getElementById('f-evt-type').value,
    description: document.getElementById('f-evt-desc').value.trim(),
  };
}

function validateEventForm(values) {
  if (!values.title) return 'El título es obligatorio.';
  if (!values.date)  return 'La fecha es obligatoria.';
  return null;
}

function openEventForm(event = null) {
  const isEdit = event !== null;
  openModal({
    title:       isEdit ? 'Editar evento' : 'Nuevo evento',
    contentHTML: buildEventFormHTML(event),
    footerHTML: `
      <button class="btn btn--secondary" onclick="closeModal()">Cancelar</button>
      <button class="btn btn--primary"   onclick="${isEdit ? `saveEditEvent('${event.id}')` : 'saveNewEvent()'}">
        ${isEdit ? 'Guardar cambios' : 'Crear evento'}
      </button>
    `,
  });
}

function saveNewEvent() {
  const values = getEventFormValues();
  const error  = validateEventForm(values);
  if (error) { showToast(error, 'warning'); return; }

  const event = {
    id:        generateId('evt'),
    ...values,
    createdAt: new Date().toISOString(),
  };

  const events = Events.getAll();
  events.push(event);
  Events.save(events);

  closeModal();
  renderCalendar();
  if (_selectedDate === event.date) renderDayDetail(_selectedDate);
  showToast('Evento creado', 'success');
}

function saveEditEvent(id) {
  const values = getEventFormValues();
  const error  = validateEventForm(values);
  if (error) { showToast(error, 'warning'); return; }

  const events = Events.getAll();
  const index  = events.findIndex(e => e.id === id);
  if (index === -1) { showToast('No se encontró el evento', 'error'); return; }

  events[index] = { ...events[index], ...values };
  Events.save(events);

  closeModal();
  renderCalendar();
  if (_selectedDate) renderDayDetail(_selectedDate);
  showToast('Evento actualizado', 'success');
}

// --- #26: Eliminar evento ---

function confirmDeleteEvent(id) {
  const event = Events.getAll().find(e => e.id === id);
  if (!event) return;

  openModal({
    title: 'Eliminar evento',
    contentHTML: `
      <p>¿Estás seguro que querés eliminar <strong>${event.title}</strong>?</p>
      <p class="form-hint">Esta acción no se puede deshacer.</p>
    `,
    footerHTML: `
      <button class="btn btn--secondary" onclick="closeModal()">Cancelar</button>
      <button class="btn btn--danger"    onclick="deleteEvent('${id}')">Eliminar</button>
    `,
  });
}

function deleteEvent(id) {
  const events   = Events.getAll();
  const filtered = events.filter(e => e.id !== id);

  if (filtered.length === events.length) {
    showToast('No se encontró el evento', 'error');
    return;
  }

  Events.save(filtered);
  closeModal();
  renderCalendar();
  if (_selectedDate) renderDayDetail(_selectedDate);
  showToast('Evento eliminado', 'info');
}

function renderCalendarPage() {
  const dateEl = document.getElementById('current-date');
  if (dateEl) {
    dateEl.textContent = new Date().toLocaleDateString('es-AR', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  }

  renderCalendar();

  // Navegación de meses
  document.getElementById('btn-prev-month')?.addEventListener('click', () => {
    _calendarMonth--;
    if (_calendarMonth < 0) { _calendarMonth = 11; _calendarYear--; }
    _selectedDate = null;
    document.getElementById('day-detail-section').hidden = true;
    renderCalendar();
  });

  document.getElementById('btn-next-month')?.addEventListener('click', () => {
    _calendarMonth++;
    if (_calendarMonth > 11) { _calendarMonth = 0; _calendarYear++; }
    _selectedDate = null;
    document.getElementById('day-detail-section').hidden = true;
    renderCalendar();
  });

  // Click en día
  document.getElementById('calendar-grid')?.addEventListener('click', (e) => {
    const cell = e.target.closest('[data-date]');
    if (!cell) return;
    renderDayDetail(cell.dataset.date);
  });

  // Acciones en el panel de detalle (editar/eliminar evento)
  document.getElementById('day-detail-list')?.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const { action, id } = btn.dataset;
    if (action === 'edit-event')   { const evt = Events.getAll().find(ev => ev.id === id); if (evt) openEventForm(evt); }
    if (action === 'delete-event') { confirmDeleteEvent(id); }
  });

  // Botón nuevo evento
  document.getElementById('btn-new-event')?.addEventListener('click', () => openEventForm());
}

// INIT — Punto de entrada según la página
// =============================================

document.addEventListener('DOMContentLoaded', () => {
  seedIfEmpty();    // siempre primero, en todas las páginas
  renderSidebar();  // sidebar compartido en todas las páginas
  bindModalClose(); // listeners de cierre del modal

  const page = document.body.dataset.page;
  if (page === 'dashboard') renderDashboard();
  if (page === 'posts')     renderPostsPage();
  if (page === 'ideas')     renderIdeasPage();
  if (page === 'calendar')  renderCalendarPage();
});