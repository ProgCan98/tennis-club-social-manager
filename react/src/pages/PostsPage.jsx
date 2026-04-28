import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import Tabs from '../components/Tabs'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import Toast from '../components/Toast'
import useToast from '../hooks/useToast'
import usePosts from '../hooks/usePosts'
import { formatDate } from '../lib/data'

const STATUS_LABELS        = { draft: 'Borrador', scheduled: 'Programado', published: 'Publicado' }
const STATUS_NEXT          = { draft: 'scheduled', scheduled: 'published' }
const STATUS_ADVANCE_LABELS = { draft: 'programado', scheduled: 'publicado' }
const PLATFORMS            = ['instagram', 'facebook', 'twitter', 'whatsapp']

const ALL_TABS = [
  { value: 'all',       label: 'Todas' },
  { value: 'draft',     label: 'Borrador' },
  { value: 'scheduled', label: 'Programadas' },
  { value: 'published', label: 'Publicadas' },
]

const EMPTY_FORM = { title: '', body: '', platforms: [], status: 'draft', scheduledDate: '', tags: '' }

function PostsPage() {
  const { posts, refresh, create: createPost, update: updatePost, remove: removePost } = usePosts()

  useEffect(() => { refresh() }, [refresh])
  const [filter,          setFilter]          = useState('all')
  const [modalOpen,       setModalOpen]       = useState(false)
  const [editingPost,     setEditingPost]     = useState(null)
  const [form,            setForm]            = useState(EMPTY_FORM)
  const [errorFieldId,    setErrorFieldId]    = useState(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const { toast, showToast, hideToast }       = useToast()

  const filtered = (filter === 'all' ? posts : posts.filter(p => p.status === filter))
    .slice()
    .sort((a, b) => {
      if (a.scheduledDate && b.scheduledDate) return a.scheduledDate.localeCompare(b.scheduledDate)
      if (a.scheduledDate) return -1
      if (b.scheduledDate) return 1
      return b.createdAt.localeCompare(a.createdAt)
    })

  const tabs = ALL_TABS.map(t => ({
    ...t,
    count: t.value === 'all' ? posts.length : posts.filter(p => p.status === t.value).length,
  }))

  function openNew() {
    setForm(EMPTY_FORM)
    setEditingPost(null)
    setErrorFieldId(null)
    setModalOpen(true)
  }

  function openEdit(post) {
    setForm({
      title:         post.title,
      body:          post.body,
      platforms:     post.platforms,
      status:        post.status,
      scheduledDate: post.scheduledDate ?? '',
      tags:          post.tags.join(', '),
    })
    setEditingPost(post)
    setErrorFieldId(null)
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditingPost(null)
    setErrorFieldId(null)
  }

  function setField(field, value) {
    setForm(f => ({ ...f, [field]: value }))
    if (errorFieldId) setErrorFieldId(null)
  }

  function togglePlatform(platform) {
    setForm(f => ({
      ...f,
      platforms: f.platforms.includes(platform)
        ? f.platforms.filter(p => p !== platform)
        : [...f.platforms, platform],
    }))
    if (errorFieldId) setErrorFieldId(null)
  }

  function validateForm() {
    if (!form.title.trim())     { setErrorFieldId('f-title');           return 'El título es obligatorio.' }
    if (!form.platforms.length) { setErrorFieldId('f-platforms-group'); return 'Seleccioná al menos una plataforma.' }
    return null
  }

  function buildValues() {
    return {
      title:          form.title.trim(),
      body:           form.body.trim(),
      platforms:      form.platforms,
      status:         form.status,
      scheduled_date: form.scheduledDate || null,
      tags:           form.tags.split(',').map(t => t.trim()).filter(Boolean),
    }
  }

  function handleSave() {
    const error = validateForm()
    if (error) { showToast(error, 'warning'); return }
    const values = buildValues()
    if (editingPost) {
      updatePost(editingPost.id, values)
      showToast('Publicación actualizada', 'success')
    } else {
      createPost(values)
      showToast('Publicación creada', 'success')
    }
    closeModal()
  }

  function handleAdvance(id) {
    const post = posts.find(p => p.id === id)
    if (!post) return
    const next = STATUS_NEXT[post.status]
    if (!next) return
    updatePost(id, { ...post, status: next })
    showToast(`Publicación marcada como ${STATUS_ADVANCE_LABELS[post.status]}`, 'success')
  }

  function handleDelete() {
    removePost(confirmDeleteId)
    setConfirmDeleteId(null)
    showToast('Publicación eliminada', 'info')
  }

  const confirmPost = posts.find(p => p.id === confirmDeleteId)

  return (
    <Layout
      title="Publicaciones"
      activePage="posts"
      actions={<button className="btn btn--primary" onClick={openNew}>+ Nueva publicación</button>}
    >
      {/* Tabs de filtro */}
      <section className="section">
        <Tabs tabs={tabs} activeTab={filter} onChange={setFilter} />
      </section>

      {/* Lista */}
      <section className="section" aria-labelledby="posts-heading">
        <h2 id="posts-heading" className="section__title">
          Listado <span className="count-badge">{filtered.length}</span>
        </h2>
        <ul className="posts-full-list">
          {filtered.length ? filtered.map(p => (
            <li key={p.id} className="post-item">
              <div className="post-item__main">
                <span className={`post-item__status post-item__status--${p.status}`}>
                  {STATUS_LABELS[p.status] ?? p.status}
                </span>
                <span className="post-item__title">{p.title}</span>
              </div>
              <div className="post-item__meta">
                <span className="post-item__platforms">{p.platforms.join(' · ')}</span>
                <span className="post-item__date">{p.scheduledDate ? formatDate(p.scheduledDate) : '—'}</span>
              </div>
              <div className="post-item__actions">
                {p.status !== 'published' && (
                  <button
                    className="btn-icon btn-icon--advance"
                    onClick={() => handleAdvance(p.id)}
                    title={p.status === 'draft' ? 'Marcar como programado' : 'Marcar como publicado'}
                  >
                    {p.status === 'draft' ? '📅' : '✅'}
                  </button>
                )}
                <button className="btn-icon" onClick={() => openEdit(p)} title="Editar">✏️</button>
                <button className="btn-icon" onClick={() => setConfirmDeleteId(p.id)} title="Eliminar">🗑️</button>
              </div>
              <span className="post-item__title--mobile">{p.title}</span>
            </li>
          )) : (
            <li className="list-empty">No hay publicaciones para este filtro.</li>
          )}
        </ul>
      </section>

      {/* Modal formulario */}
      <Modal
        isOpen={modalOpen}
        title={editingPost ? 'Editar publicación' : 'Nueva publicación'}
        onClose={closeModal}
        footer={
          <>
            <button className="btn btn--secondary" onClick={closeModal}>Cancelar</button>
            <button className="btn btn--primary" onClick={handleSave}>
              {editingPost ? 'Guardar cambios' : 'Crear publicación'}
            </button>
          </>
        }
      >
        <div className="form-group">
          <label className="form-label" htmlFor="f-title">Título *</label>
          <input
            id="f-title"
            className={`form-input${errorFieldId === 'f-title' ? ' form-input--error' : ''}`}
            type="text"
            maxLength={120}
            placeholder="Ej: Apertura del torneo de verano"
            value={form.title}
            onChange={e => setField('title', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="f-body">Texto / Caption</label>
          <textarea
            id="f-body"
            className="form-input form-textarea"
            rows={4}
            placeholder="Escribí el texto del post..."
            value={form.body}
            onChange={e => setField('body', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Plataformas *</label>
          <div
            id="f-platforms-group"
            className={`form-checkboxes${errorFieldId === 'f-platforms-group' ? ' form-input--error' : ''}`}
          >
            {PLATFORMS.map(p => (
              <label key={p} className="form-checkbox">
                <input
                  type="checkbox"
                  value={p}
                  checked={form.platforms.includes(p)}
                  onChange={() => togglePlatform(p)}
                />
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </label>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="f-status">Estado</label>
          <select
            id="f-status"
            className="form-input form-select"
            value={form.status}
            onChange={e => setField('status', e.target.value)}
          >
            <option value="draft">Borrador</option>
            <option value="scheduled">Programado</option>
            <option value="published">Publicado</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="f-date">Fecha programada</label>
          <input
            id="f-date"
            className="form-input"
            type="date"
            value={form.scheduledDate}
            onChange={e => setField('scheduledDate', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="f-tags">Etiquetas (separadas por coma)</label>
          <input
            id="f-tags"
            className="form-input"
            type="text"
            placeholder="Ej: torneo, verano, juveniles"
            value={form.tags}
            onChange={e => setField('tags', e.target.value)}
          />
        </div>
      </Modal>

      {/* Confirmar eliminación */}
      <ConfirmDialog
        isOpen={!!confirmDeleteId}
        title="Eliminar publicación"
        message={<>¿Estás seguro que querés eliminar <strong>{confirmPost?.title}</strong>?</>}
        confirmLabel="Eliminar"
        danger
        onConfirm={handleDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />

      <Toast {...toast} onHide={hideToast} />
    </Layout>
  )
}

export default PostsPage
