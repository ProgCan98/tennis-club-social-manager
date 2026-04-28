import { getToken, clearAuth } from './auth'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

async function request(method, path, body = null) {
  const token = getToken()

  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const options = { method, headers }
  if (body) options.body = JSON.stringify(body)

  const res = await fetch(`${BASE_URL}${path}`, options)

  if (res.status === 403) {
    clearAuth()
    window.location.href = '/login'
    return
  }

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.error || 'Error en la solicitud')
  }

  return data
}

export const api = {
  get:    (path)       => request('GET',    path),
  post:   (path, body) => request('POST',   path, body),
  put:    (path, body) => request('PUT',    path, body),
  delete: (path)       => request('DELETE', path),
}