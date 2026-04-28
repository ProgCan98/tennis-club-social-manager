import { useState, useCallback } from 'react'
import { api } from '../lib/api'

export default function useIdeas() {
  const [ideas, setIdeas]     = useState([])
  const [loading, setLoading] = useState(false)

  function normalize(row) {
    return {
      ...row,
      createdAt:       row.created_at,
      convertedPostId: row.converted_post_id ?? null,
    }
  }

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const data = await api.get('/api/ideas')
      setIdeas(data.map(normalize))
    } finally {
      setLoading(false)
    }
  }, [])

  const create = useCallback(async (values) => {
    const idea = await api.post('/api/ideas', values)
    await refresh()
    return idea
  }, [refresh])

  const update = useCallback(async (id, values) => {
    await api.put(`/api/ideas/${id}`, values)
    await refresh()
  }, [refresh])

  const remove = useCallback(async (id) => {
    await api.delete(`/api/ideas/${id}`)
    await refresh()
  }, [refresh])

  const convert = useCallback(async (id) => {
    const result = await api.put(`/api/ideas/${id}/convert`)
    await refresh()
    return result
  }, [refresh])

  return { ideas, loading, refresh, create, update, remove, convert }
}