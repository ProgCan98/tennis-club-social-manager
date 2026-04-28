import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import Tabs from '../components/Tabs'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import Toast from '../components/Toast'
import useToast from '../hooks/useToast'
import useIdeas from '../hooks/useIdeas'

const IDEA_STATUS_LABELS   = { nueva: 'Nueva', aprobada: 'Aprobada', descartada: 'Descartada', convertida: 'Convertida' }
const IDEA_PRIORITY_LABELS = { alta: 'Alta', media: 'Media', baja: 'Baja' }

const ALL_TABS = [
  { value: 'all',        label: 'Todas' },
  { value: 'nueva',      label: 'Nueva' },
  { value: 'aprobada',   label: 'Aprobada' },
  { value: 'descartada', label: 'Descartada' },
  { value: 'convertida', label: 'Convertida' },
]

const EMPTY_FORM = { title: '', description: '', priority: 'alta', status: 'nueva', tags: '' }

function IdeasPage() {
  const { ideas, refresh, create: createIdea, update: updateIdea, remove: removeIdea, convert } = useIdeas()

  useEffect(() => { refresh() }, [refresh])
  const [filter,           setFilter]           = useState('all')
  const [modalOpen,        setModalOpen]        = useState(false)
  const [editingIdea,      setEditingIdea]      = useState(null)
  const [form,             setForm]             = useState(EMPTY_FORM)
  const [errorFieldId,     setErrorFieldId]     = useState(null)
  const [confirmDeleteId,  setConfirmDeleteId]  = useState(null)
  const [confirmConvertId, setConfirmConvertId] = useState(null)
  const { toast, showToast, hideToast }         = useToast()

  const filtered = (filter === 'all' ? ideas : ideas.filter(i => i.status === filter))
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  const tabs = ALL_TABS.map(t => ({
    ...t,
    count: t.value === 'all' ? ideas.length : ideas.filter(i => i.status === t.value).length,
  }))

  function openNew() {
    setForm(EMPTY_FORM)
    setEditingIdea(null)
    setErrorFieldId(null)
    setModalOpen(true)
  }

  function openEdit(idea) {
    setForm({
      title:       idea.title,
      description: idea.description,
      priority:    idea.priority,
      status:      idea.status,
      tags:        idea.tags.join(', '),
    })
    setEditingIdea(idea)
    setErrorFieldId(null)
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditingIdea(null)
    setErrorFieldId(null)
  }

  function setField(field, value) {
    setForm(f => ({ ...f, [field]: value }))
    if (errorFieldId) setErrorFieldId(null)
  }

  function validateForm() {
    if (!form.title.trim()) { setErrorFieldId('f-idea-title'); return 'El título es obligatorio.' }
    return null
  }

  function buildValues() {
    return {
      title:       form.title.trim(),
      description: form.description.trim(),
      priority:    form.priority,
      status:      form.status,
      tags:        form.tags.split(',').map(t => t.trim()).filter(Boolean),
    }
  }

  function handleSave() {
    const error = validateForm()
    if (error) { showToast(error, 'warning'); return }
    const values = buildValues()
    if (editingIdea) {
      updateIdea(editingIdea.id, values)
      showToast('Idea actualizada', 'success')
    } else {
      createIdea(values)
      showToast('Idea creada', 'success')
    }
    closeModal()
  }

  function handleDelete() {
    removeIdea(confirmDeleteId)
    setConfirmDeleteId(null)
    showToast('Idea eliminada', 'info')
  }

  function handleConvert() {
    const idea = ideas.find(i => i.id === confirmConvertId)
    if (!idea) { setConfirmConvertId(null); return }
    convert(idea.id)
    setConfirmConvertId(null)
    showToast('Idea convertida en borrador de post', 'success')
  }

  const confirmDeleteIdea  = ideas.find(i => i.id === confirmDeleteId)
  const confirmConvertIdea = ideas.find(i => i.id === confirmConvertId)

  return (
    <Layout
      title="Ideas"
      activePage="ideas"
      actions={<button className="btn btn--primary" onClick={openNew}>+ Nueva idea</button>}
    >
      {/* Tabs de filtro */}
      <section className="section">
        <Tabs tabs={tabs} activeTab={filter} onChange={setFilter} />
      </section>

      {/* Lista */}
      <section className="section" aria-labelledby="ideas-heading">
        <h2 id="ideas-heading" className="section__title">
          Listado <span className="count-badge">{filtered.length}</span>
        </h2>
        <ul className="ideas-full-list">
          {filtered.length ? filtered.map(i => (
            <li key={i.id} className="idea-item">
              <div className="idea-item__main">
                <span className={`idea-item__status idea-item__status--${i.status}`}>
                  {IDEA_STATUS_LABELS[i.status] ?? i.status}
                </span>
                <span className={`idea-item__priority idea-item__priority--${i.priority}`}>
                  {IDEA_PRIORITY_LABELS[i.priority] ?? i.priority}
                </span>
                <span className="idea-item__title">{i.title}</span>
              </div>
              <div className="idea-item__actions">
                {i.status !== 'convertida' && i.status !== 'descartada' && (
                  <button
                    className="btn-icon"
                    onClick={() => setConfirmConvertId(i.id)}
                    title="Convertir en post"
                  >
                    🔁
                  </button>
                )}
                <button className="btn-icon" onClick={() => openEdit(i)} title="Editar">✏️</button>
                <button className="btn-icon" onClick={() => setConfirmDeleteId(i.id)} title="Eliminar">🗑️</button>
              </div>
              <span className="idea-item__title--mobile">{i.title}</span>
            </li>
          )) : (
            <li className="list-empty">No hay ideas para este filtro.</li>
          )}
        </ul>
      </section>

      {/* Modal formulario */}
      <Modal
        isOpen={modalOpen}
        title={editingIdea ? 'Editar idea' : 'Nueva idea'}
        onClose={closeModal}
        footer={
          <>
            <button className="btn btn--secondary" onClick={closeModal}>Cancelar</button>
            <button className="btn btn--primary" onClick={handleSave}>
              {editingIdea ? 'Guardar cambios' : 'Crear idea'}
            </button>
          </>
        }
      >
        <div className="form-group">
          <label className="form-label" htmlFor="f-idea-title">Título *</label>
          <input
            id="f-idea-title"
            className={`form-input${errorFieldId === 'f-idea-title' ? ' form-input--error' : ''}`}
            type="text"
            maxLength={120}
            placeholder="Ej: Video del equipo infantil"
            value={form.title}
            onChange={e => setField('title', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="f-idea-desc">Descripción</label>
          <textarea
            id="f-idea-desc"
            className="form-input form-textarea"
            rows={3}
            placeholder="Detallá la idea..."
            value={form.description}
            onChange={e => setField('description', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="f-idea-priority">Prioridad</label>
          <select
            id="f-idea-priority"
            className="form-input form-select"
            value={form.priority}
            onChange={e => setField('priority', e.target.value)}
          >
            <option value="alta">Alta</option>
            <option value="media">Media</option>
            <option value="baja">Baja</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="f-idea-status">Estado</label>
          <select
            id="f-idea-status"
            className="form-input form-select"
            value={form.status}
            onChange={e => setField('status', e.target.value)}
          >
            <option value="nueva">Nueva</option>
            <option value="aprobada">Aprobada</option>
            <option value="descartada">Descartada</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="f-idea-tags">Etiquetas (separadas por coma)</label>
          <input
            id="f-idea-tags"
            className="form-input"
            type="text"
            placeholder="Ej: video, comunidad"
            value={form.tags}
            onChange={e => setField('tags', e.target.value)}
          />
        </div>
      </Modal>

      {/* Confirmar eliminación */}
      <ConfirmDialog
        isOpen={!!confirmDeleteId}
        title="Eliminar idea"
        message={<>¿Estás seguro que querés eliminar <strong>{confirmDeleteIdea?.title}</strong>?</>}
        confirmLabel="Eliminar"
        danger
        onConfirm={handleDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />

      {/* Confirmar conversión */}
      <ConfirmDialog
        isOpen={!!confirmConvertId}
        title="Convertir en post"
        message={
          <>Se creará un post en borrador con el título y texto de <strong>{confirmConvertIdea?.title}</strong>. Podés editarlo desde la sección Publicaciones.</>
        }
        confirmLabel="Convertir"
        onConfirm={handleConvert}
        onCancel={() => setConfirmConvertId(null)}
      />

      <Toast {...toast} onHide={hideToast} />
    </Layout>
  )
}

export default IdeasPage
