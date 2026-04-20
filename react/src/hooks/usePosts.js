import { useState, useCallback } from 'react'
import { Posts } from '../lib/data'

/**
 * usePosts
 * Encapsula el estado de la lista de posts y las operaciones CRUD.
 * Llama a refresh() automáticamente después de cada mutación.
 *
 * Returns: { posts, refresh, create, update, remove }
 */
export default function usePosts() {
  const [posts, setPosts] = useState(() => Posts.getAll())

  const refresh = useCallback(() => setPosts(Posts.getAll()), [])

  const create = useCallback((values) => {
    const post = Posts.create(values)
    refresh()
    return post
  }, [refresh])

  const update = useCallback((id, values) => {
    Posts.update(id, values)
    refresh()
  }, [refresh])

  const remove = useCallback((id) => {
    Posts.remove(id)
    refresh()
  }, [refresh])

  return { posts, refresh, create, update, remove }
}
