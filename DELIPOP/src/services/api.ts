const BASE_URL = 'http://localhost:3000/api'
const STORAGE_CURRENT_USER = 'delipop_current_user'

function getCurrentUserEmail() {
  try {
    const stored = localStorage.getItem(STORAGE_CURRENT_USER)
    if (!stored) return undefined
    const parsed = JSON.parse(stored)
    return parsed?.email as string | undefined
  } catch {
    return undefined
  }
}

async function request(path: string, options: RequestInit = {}) {
  const email = getCurrentUserEmail()

  const response = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(email ? { 'x-user-email': email } : {}),
      ...(options.headers || {}),
    },
    ...options,
  })

  const text = await response.text()
  const data = text ? JSON.parse(text) : null

  if (!response.ok) {
    throw new Error(data?.error || 'Error en la conexión con el servidor')
  }

  return data
}

async function requestFormData(path: string, formData: FormData, method: 'POST' | 'PUT' = 'POST') {
  const email = getCurrentUserEmail()
  
  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      ...(email ? { 'x-user-email': email } : {}),
    },
    body: formData,
  })

  const text = await response.text()
  const data = text ? JSON.parse(text) : null

  if (!response.ok) {
    throw new Error(data?.error || 'Error en la conexión con el servidor')
  }

  return data
}

export function apiGet(path: string) {
  return request(path, { method: 'GET' })
}

export function apiPost(path: string, body: unknown) {
  return request(path, { method: 'POST', body: JSON.stringify(body) })
}

export function apiPostFormData(path: string, formData: FormData) {
  return requestFormData(path, formData, 'POST')
}

export function apiPut(path: string, body: unknown) {
  return request(path, { method: 'PUT', body: JSON.stringify(body) })
}

export function apiPutFormData(path: string, formData: FormData) {
  return requestFormData(path, formData, 'PUT')
}

export function apiDelete(path: string) {
  return request(path, { method: 'DELETE' })
}
