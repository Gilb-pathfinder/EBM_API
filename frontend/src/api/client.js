const BASE = '/api'

function getToken() {
  return localStorage.getItem('vsdc_token')
}

export async function apiFetch(path, { method = 'GET', body, headers: extra } = {}) {
  const token = getToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...extra,
  }
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    ...(body != null && { body: JSON.stringify(body) }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw Object.assign(
      new Error(data?.message || data?.resultMsg || data?.errors?.[0]?.message || res.statusText),
      { status: res.status, data }
    )
  }
  return data
}

export const api = {
  get:   (path)       => apiFetch(path),
  post:  (path, body) => apiFetch(path, { method: 'POST', body }),
  patch: (path, body) => apiFetch(path, { method: 'PATCH', body }),
  put:   (path, body) => apiFetch(path, { method: 'PUT', body }),
  del:   (path)       => apiFetch(path, { method: 'DELETE' }),
}
