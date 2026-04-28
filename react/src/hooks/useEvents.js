import { useState, useCallback } from 'react'
import { api } from '../lib/api'

export default function useEvents() {
  const [events, setEvents]   = useState([])
  const [loading, setLoading] = useState(false)

  function normalize(row) {
    return {
      ...row,
      date:      row.event_date ? row.event_date.split('T')[0] : null,
      endDate:   row.end_date   ? row.end_date.split('T')[0]   : null,
      type:      row.event_type,
      createdAt: row.created_at,
    }
  }

  const refresh = useCallback(async (month = null) => {
    setLoading(true)
    try {
      const path = month ? `/api/events?month=${month}` : '/api/events'
      const data = await api.get(path)
      setEvents(data.map(normalize))
    } finally {
      setLoading(false)
    }
  }, [])

  const create = useCallback(async (values) => {
    const event = await api.post('/api/events', values)
    await refresh()
    return event
  }, [refresh])

  const update = useCallback(async (id, values) => {
    await api.put(`/api/events/${id}`, values)
    await refresh()
  }, [refresh])

  const remove = useCallback(async (id) => {
    await api.delete(`/api/events/${id}`)
    await refresh()
  }, [refresh])

  return { events, loading, refresh, create, update, remove }
}