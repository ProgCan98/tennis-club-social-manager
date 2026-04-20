import { KEYS, Storage, generateId } from './storage'

// ----- Posts -----

export const Posts = {
  getAll()    { return Storage.get(KEYS.posts) },
  save(posts) { Storage.save(KEYS.posts, posts) },

  getThisMonth() {
    const now = new Date()
    return this.getAll().filter(p => {
      const d = new Date(p.scheduledDate)
      return d.getFullYear() === now.getFullYear()
          && d.getMonth()    === now.getMonth()
    })
  },

  getPending() {
    const today = new Date().toISOString().split('T')[0]
    return this.getAll().filter(p =>
      p.status === 'draft' ||
      (p.status === 'scheduled' && p.scheduledDate >= today)
    )
  },

  getUpcoming(limit = 3) {
    const today = new Date().toISOString().split('T')[0]
    return this.getAll()
      .filter(p => p.status === 'scheduled' && p.scheduledDate >= today)
      .sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate))
      .slice(0, limit)
  },

  create(values) {
    const now  = new Date().toISOString()
    const post = {
      id:            generateId('post'),
      ...values,
      publishedDate: values.status === 'published' ? now.split('T')[0] : null,
      eventId:       null,
      mediaIds:      [],
      createdAt:     now,
      updatedAt:     now,
    }
    const posts = this.getAll()
    posts.push(post)
    this.save(posts)
    return post
  },

  update(id, values) {
    const posts = this.getAll()
    const index = posts.findIndex(p => p.id === id)
    if (index === -1) return null
    posts[index] = {
      ...posts[index],
      ...values,
      publishedDate: values.status === 'published'
        ? (posts[index].publishedDate ?? new Date().toISOString().split('T')[0])
        : null,
      updatedAt: new Date().toISOString(),
    }
    this.save(posts)
    return posts[index]
  },

  remove(id) {
    const posts = this.getAll().filter(p => p.id !== id)
    this.save(posts)
  },
}

// ----- Ideas -----

export const Ideas = {
  getAll()    { return Storage.get(KEYS.ideas) },
  save(ideas) { Storage.save(KEYS.ideas, ideas) },

  getRecent(limit = 3) {
    return this.getAll()
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, limit)
  },

  create(values) {
    const idea = {
      id:              generateId('idea'),
      ...values,
      convertedPostId: null,
      createdAt:       new Date().toISOString(),
    }
    const ideas = this.getAll()
    ideas.push(idea)
    this.save(ideas)
    return idea
  },

  update(id, values) {
    const ideas = this.getAll()
    const index = ideas.findIndex(i => i.id === id)
    if (index === -1) return null
    ideas[index] = { ...ideas[index], ...values }
    this.save(ideas)
    return ideas[index]
  },

  remove(id) {
    const ideas = this.getAll().filter(i => i.id !== id)
    this.save(ideas)
  },
}

// ----- Events -----

export const Events = {
  getAll()     { return Storage.get(KEYS.events) },
  save(events) { Storage.save(KEYS.events, events) },

  getUpcoming(limit = 3) {
    const today = new Date().toISOString().split('T')[0]
    return this.getAll()
      .filter(e => e.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, limit)
  },

  create(values) {
    const event = {
      id:        generateId('evt'),
      ...values,
      createdAt: new Date().toISOString(),
    }
    const events = this.getAll()
    events.push(event)
    this.save(events)
    return event
  },

  update(id, values) {
    const events = this.getAll()
    const index  = events.findIndex(e => e.id === id)
    if (index === -1) return null
    events[index] = { ...events[index], ...values }
    this.save(events)
    return events[index]
  },

  remove(id) {
    const events = this.getAll().filter(e => e.id !== id)
    this.save(events)
  },
}

// ----- Helpers -----

export function formatDate(isoDate) {
  const [year, month, day] = isoDate.split('-')
  return `${day}/${month}/${year}`
}

export { generateId }
