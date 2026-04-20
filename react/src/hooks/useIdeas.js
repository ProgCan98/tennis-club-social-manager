import { useState, useCallback } from 'react'
import { Ideas } from '../lib/data'

/**
 * useIdeas
 * Encapsula el estado de la lista de ideas y las operaciones CRUD.
 * Llama a refresh() automáticamente después de cada mutación.
 *
 * Returns: { ideas, refresh, create, update, remove }
 */
export default function useIdeas() {
  const [ideas, setIdeas] = useState(() => Ideas.getAll())

  const refresh = useCallback(() => setIdeas(Ideas.getAll()), [])

  const create = useCallback((values) => {
    const idea = Ideas.create(values)
    refresh()
    return idea
  }, [refresh])

  const update = useCallback((id, values) => {
    Ideas.update(id, values)
    refresh()
  }, [refresh])

  const remove = useCallback((id) => {
    Ideas.remove(id)
    refresh()
  }, [refresh])

  return { ideas, refresh, create, update, remove }
}
