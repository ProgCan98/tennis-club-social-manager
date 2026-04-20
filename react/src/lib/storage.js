// Claves de localStorage para cada entidad
export const KEYS = {
  posts:  'tcm_posts',
  ideas:  'tcm_ideas',
  events: 'tcm_events',
  media:  'tcm_media',
  tasks:  'tcm_tasks',
}

// Capa de acceso a localStorage
export const Storage = {
  get(key) {
    try {
      return JSON.parse(localStorage.getItem(key)) || []
    } catch {
      return []
    }
  },
  save(key, data) {
    localStorage.setItem(key, JSON.stringify(data))
  },
}

// Genera un ID único basado en timestamp + random
export function generateId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}
