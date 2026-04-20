import { useState, useCallback } from 'react'
import { Events } from '../lib/data'

/**
 * useEvents
 * Encapsula el estado de la lista de eventos y las operaciones CRUD.
 * Llama a refresh() automáticamente después de cada mutación.
 *
 * Returns: { events, refresh, create, update, remove }
 */
export default function useEvents() {
  const [events, setEvents] = useState(() => Events.getAll())

  const refresh = useCallback(() => setEvents(Events.getAll()), [])

  const create = useCallback((values) => {
    const event = Events.create(values)
    refresh()
    return event
  }, [refresh])

  const update = useCallback((id, values) => {
    Events.update(id, values)
    refresh()
  }, [refresh])

  const remove = useCallback((id) => {
    Events.remove(id)
    refresh()
  }, [refresh])

  return { events, refresh, create, update, remove }
}
