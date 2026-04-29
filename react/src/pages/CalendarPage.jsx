import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import Toast from '../components/Toast'
import useToast from '../hooks/useToast'
import useEvents from '../hooks/useEvents'
import usePosts from '../hooks/usePosts'

const MONTH_NAMES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const WEEKDAYS    = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']

const EVENT_TYPE_LABELS = { torneo: 'Torneo', clase: 'Clase', social: 'Social', feriado: 'Feriado', otro: 'Otro' }
const EVENT_TYPE_COLORS = { torneo: '#c62828', clase: '#1565c0', social: '#2e7d32', feriado: '#f57f17', otro: '#6b7280' }
const POST_COLOR        = '#9c27b0'

const EMPTY_FORM = { title: '', date: '', endDate: '', type: 'torneo', description: '' }

function CalendarPage() {
  const now = new Date()
  const [year,           setYear]           = useState(now.getFullYear())
  const [month,          setMonth]          = useState(now.getMonth())
  const [selectedDate,   setSelectedDate]   = useState(null)
  const { events, refresh: refreshEvents, create: createEvent, update: updateEvent, remove: removeEvent } = useEvents()
  const { posts: allPostsRaw, refresh: refreshPosts } = usePosts()

  useEffect(() => { refreshEvents(); refreshPosts() }, [refreshEvents, refreshPosts])
  const [modalOpen,      setModalOpen]      = useState(false)
  const [editingEvent,   setEditingEvent]   = useState(null)
  const [form,           setForm]           = useState(EMPTY_FORM)
  const [errorFieldId,   setErrorFieldId]   = useState(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const { toast, showToast, hideToast }     = useToast()

  // --- Navegación de meses ---
  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else             { setMonth(m => m - 1) }
    setSelectedDate(null)
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else              { setMonth(m => m + 1) }
    setSelectedDate(null)
  }

  // --- Datos del calendario ---
  const today       = new Date().toISOString().split('T')[0]
  const firstDay    = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const allPosts = allPostsRaw.filter(p => p.scheduledDate)
  const itemsByDate = {}
  events.forEach(e => {
    if (!itemsByDate[e.date]) itemsByDate[e.date] = []
    itemsByDate[e.date].push({ ...e, _kind: 'event' })
  })
  allPosts.forEach(p => {
    if (!itemsByDate[p.scheduledDate]) itemsByDate[p.scheduledDate] = []
    itemsByDate[p.scheduledDate].push({ ...p, _kind: 'post' })
  })

  function toDateStr(d) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
  }

  // --- Detalle del día ---
  const dayEvents = selectedDate ? events.filter(e => e.date === selectedDate) : []
  const dayPosts  = selectedDate ? allPostsRaw.filter(p => p.scheduledDate === selectedDate) : []

  function selectedDayLabel() {
    if (!selectedDate) return ''
    const [y, m, d] = selectedDate.split('-')
    return `${parseInt(d)} de ${MONTH_NAMES[parseInt(m) - 1]} ${y}`
  }

  // --- Form helpers ---
  function openNew() {
    setForm({ ...EMPTY_FORM, date: selectedDate ?? '' })
    setEditingEvent(null)
    setErrorFieldId(null)
    setModalOpen(true)
  }
  function openEdit(evt) {
    setForm({
      title:       evt.title,
      date:        evt.date,
      endDate:     evt.endDate ?? '',
      type:        evt.type,
      description: evt.description ?? '',
    })
    setEditingEvent(evt)
    setErrorFieldId(null)
    setModalOpen(true)
  }
  function closeModal() {
    setModalOpen(false)
    setEditingEvent(null)
    setErrorFieldId(null)
  }
  function setField(field, value) {
    setForm(f => ({ ...f, [field]: value }))
    if (errorFieldId) setErrorFieldId(null)
  }
  function validateForm() {
    if (!form.title.trim()) { setErrorFieldId('f-evt-title'); return 'El título es obligatorio.' }
    if (!form.date)          { setErrorFieldId('f-evt-date');  return 'La fecha es obligatoria.' }
    return null
  }
  function buildValues() {
    return {
      title:       form.title.trim(),
      event_date:  form.date,
      event_type:  form.type,
      description: form.description.trim(),
    }
  }
  function handleSave() {
    const error = validateForm()
    if (error) { showToast(error, 'warning'); return }
    const values = buildValues()
    if (editingEvent) {
      updateEvent(editingEvent.id, values)
      showToast('Evento actualizado', 'success')
    } else {
      createEvent(values)
      showToast('Evento creado', 'success')
    }
    closeModal()
  }
  function handleDelete() {
    removeEvent(confirmDeleteId)
    setConfirmDeleteId(null)
    showToast('Evento eliminado', 'info')
  }

  const confirmEvent = events.find(e => e.id === confirmDeleteId)

  return (
    <Layout
      title="Calendario"
      activePage="calendar"
      actions={<button className="btn btn--primary" onClick={openNew}>+ Nuevo evento</button>}
    >
      {/* Grilla mensual */}
      <section className="section calendar-section">
        <div className="calendar-nav">
          <button className="btn-icon calendar-nav__btn" onClick={prevMonth} title="Mes anterior">&#9664;</button>
          <h2 className="calendar-nav__title">{MONTH_NAMES[month]} {year}</h2>
          <button className="btn-icon calendar-nav__btn" onClick={nextMonth} title="Mes siguiente">&#9654;</button>
        </div>

        <div className="calendar-weekdays">
          {WEEKDAYS.map(d => <span key={d}>{d}</span>)}
        </div>

        <div className="calendar-grid">
          {/* Celdas vacías antes del día 1 */}
          {Array.from({ length: firstDay }, (_, i) => (
            <div key={`blank-${i}`} className="calendar-cell calendar-cell--empty" />
          ))}

          {/* Celdas de días */}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day   = i + 1
            const ds    = toDateStr(day)
            const items = itemsByDate[ds] ?? []
            return (
              <div
                key={ds}
                className={[
                  'calendar-cell',
                  ds === today        ? 'calendar-cell--today'    : '',
                  ds === selectedDate ? 'calendar-cell--selected' : '',
                  items.length        ? 'calendar-cell--has-items' : '',
                ].filter(Boolean).join(' ')}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedDate(ds)}
                onKeyDown={e => e.key === 'Enter' && setSelectedDate(ds)}
              >
                <span className="calendar-cell__day">{day}</span>
                <div className="calendar-cell__dots">
                  {items.map((item, idx) => (
                    <span
                      key={idx}
                      className="calendar-dot"
                      style={{ background: item._kind === 'event' ? (EVENT_TYPE_COLORS[item.type] ?? '#6b7280') : POST_COLOR }}
                      title={item.title}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Panel de detalle del día */}
      {selectedDate && (
        <section className="section" aria-labelledby="day-detail-heading">
          <h2 className="section__title" id="day-detail-heading">{selectedDayLabel()}</h2>
          <ul className="day-detail-list">
            {dayEvents.length === 0 && dayPosts.length === 0 ? (
              <li className="list-empty">No hay eventos ni publicaciones este día.</li>
            ) : (
              <>
                {dayEvents.map(e => (
                  <li key={e.id} className="day-detail-item day-detail-item--event">
                    <span className="day-detail-item__dot" style={{ background: EVENT_TYPE_COLORS[e.type] ?? '#6b7280' }} />
                    <div className="day-detail-item__body">
                      <strong>{e.title}</strong>
                      <span>{EVENT_TYPE_LABELS[e.type] ?? e.type}{e.description ? ` — ${e.description}` : ''}</span>
                    </div>
                    <div className="day-detail-item__actions">
                      <button className="btn-icon" onClick={() => openEdit(e)} title="Editar">&#9998;</button>
                      <button className="btn-icon" onClick={() => setConfirmDeleteId(e.id)} title="Eliminar">&#128465;</button>
                    </div>
                  </li>
                ))}
                {dayPosts.map(p => (
                  <li key={p.id} className="day-detail-item day-detail-item--post">
                    <span className="day-detail-item__dot" style={{ background: POST_COLOR }} />
                    <div className="day-detail-item__body">
                      <strong>{p.title}</strong>
                      <span>{p.platforms.join(' · ')}</span>
                    </div>
                  </li>
                ))}
              </>
            )}
          </ul>
        </section>
      )}

      {/* Modal formulario de evento */}
      <Modal
        isOpen={modalOpen}
        title={editingEvent ? 'Editar evento' : 'Nuevo evento'}
        onClose={closeModal}
        footer={
          <>
            <button className="btn btn--secondary" onClick={closeModal}>Cancelar</button>
            <button className="btn btn--primary" onClick={handleSave}>
              {editingEvent ? 'Guardar cambios' : 'Crear evento'}
            </button>
          </>
        }
      >
        <div className="form-group">
          <label className="form-label" htmlFor="f-evt-title">Título *</label>
          <input
            id="f-evt-title"
            className={`form-input${errorFieldId === 'f-evt-title' ? ' form-input--error' : ''}`}
            type="text"
            maxLength={120}
            placeholder="Ej: Torneo de Dobles"
            value={form.title}
            onChange={e => setField('title', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="f-evt-date">Fecha *</label>
          <input
            id="f-evt-date"
            className={`form-input${errorFieldId === 'f-evt-date' ? ' form-input--error' : ''}`}
            type="date"
            value={form.date}
            onChange={e => setField('date', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="f-evt-end-date">Fecha de fin (opcional)</label>
          <input
            id="f-evt-end-date"
            className="form-input"
            type="date"
            value={form.endDate}
            onChange={e => setField('endDate', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="f-evt-type">Tipo</label>
          <select
            id="f-evt-type"
            className="form-input form-select"
            value={form.type}
            onChange={e => setField('type', e.target.value)}
          >
            {Object.entries(EVENT_TYPE_LABELS).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="f-evt-desc">Descripción</label>
          <textarea
            id="f-evt-desc"
            className="form-input form-textarea"
            rows={3}
            placeholder="Detalles del evento..."
            value={form.description}
            onChange={e => setField('description', e.target.value)}
          />
        </div>
      </Modal>

      {/* Confirmar eliminación */}
      <ConfirmDialog
        isOpen={!!confirmDeleteId}
        title="Eliminar evento"
        message={<>¿Estás seguro que querés eliminar <strong>{confirmEvent?.title}</strong>?</>}
        confirmLabel="Eliminar"
        danger
        onConfirm={handleDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />

      <Toast {...toast} onHide={hideToast} />
    </Layout>
  )
}

export default CalendarPage
