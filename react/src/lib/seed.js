import { KEYS, Storage } from './storage'

const MOCK_DATA = {
  posts: [
    {
      id: 'post_001',
      title: 'Apertura Torneo de Verano',
      body: 'Este s\u00e1bado arranca el torneo m\u00e1s esperado del a\u00f1o',
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
      title: 'Tips: c\u00f3mo mejorar tu rev\u00e9s',
      body: '3 ejercicios que pod\u00e9s hacer en casa para un rev\u00e9s m\u00e1s s\u00f3lido',
      status: 'draft',
      platforms: ['instagram'],
      scheduledDate: null,
      publishedDate: null,
      eventId: null,
      mediaIds: [],
      tags: ['tips', 't\u00e9cnica'],
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
      description: 'Categor\u00edas Sub-14, Sub-18 y Libre',
      createdAt: '2026-04-01T10:00:00Z',
    },
    {
      id: 'evt_002',
      title: 'Cl\u00ednica de Dobles',
      date: '2026-05-20',
      endDate: null,
      type: 'clase',
      description: 'Clase abierta para socios, foco en estrategia de dobles',
      createdAt: '2026-04-05T15:00:00Z',
    },
  ],
  media: [],
  tasks: [],
}

// Carga los datos de ejemplo solo si localStorage está completamente vacío
export function seedIfEmpty() {
  const isEmpty = [KEYS.posts, KEYS.ideas, KEYS.events].every(
    key => localStorage.getItem(key) === null
  )
  if (!isEmpty) return

  Storage.save(KEYS.posts,  MOCK_DATA.posts)
  Storage.save(KEYS.ideas,  MOCK_DATA.ideas)
  Storage.save(KEYS.events, MOCK_DATA.events)
  Storage.save(KEYS.media,  MOCK_DATA.media)
  Storage.save(KEYS.tasks,  MOCK_DATA.tasks)
}
