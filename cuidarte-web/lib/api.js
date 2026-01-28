const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:3001';

async function handleResponse(resp) {
  let data = null;
  try {
    data = await resp.json();
  } catch (_) {}

  if (!resp.ok) {
    throw new Error(data?.error || data?.message || `HTTP ${resp.status}`);
  }

  return data;
}

export async function apiFetch(path, options = {}) {
  const url = path.startsWith('http')
    ? path
    : `${API_BASE}${path}`;

  const resp = await fetch(url, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  return handleResponse(resp);
}

export async function getMe() {
  const resp = await fetch(`${API_BASE}/api/usuarios/me`, {
    credentials: 'include',
  });

  if (!resp.ok) return null;
  return handleResponse(resp);
}
