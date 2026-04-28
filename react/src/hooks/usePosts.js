import { useState, useCallback } from 'react'
import { api } from '../lib/api'

export default function usePosts() {
  const [posts, setPosts]   = useState([])
  const [loading, setLoading] = useState(false)

  // Normaliza los campos snake_case que devuelve la API a camelCase
  function normalize(row) {
    return {
      ...row,
      scheduledDate: row.scheduled_date ?? null,
      createdAt:     row.created_at,
    }
  }

  // Recarga la lista desde la API
  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const data = await api.get('/api/posts')
      setPosts(data.map(normalize))
    } finally {
      setLoading(false)
    }
  }, [])

  const create = useCallback(async (values) => {
    const post = await api.post('/api/posts', values)
    await refresh()
    return post
  }, [refresh])

  const update = useCallback(async (id, values) => {
    await api.put(`/api/posts/${id}`, values)
    await refresh()
  }, [refresh])

  const remove = useCallback(async (id) => {
    await api.delete(`/api/posts/${id}`)
    await refresh()
  }, [refresh])

  return { posts, loading, refresh, create, update, remove }
}