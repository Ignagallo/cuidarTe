const LOCAL_API_BASE = 'http://localhost:3001';

export const API_BASE =
  process.env.NODE_ENV === 'development'
    ? LOCAL_API_BASE
    : process.env.NEXT_PUBLIC_API_BASE?.trim() || LOCAL_API_BASE;

export function apiAssetUrl(path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_BASE.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
}

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

export async function logout() {
  return apiFetch('/api/usuarios/logout', { method: 'POST' });
}

export async function uploadImage(file) {
  const formData = new FormData();
  formData.append('foto', file);
  const response = await fetch(`${API_BASE}/api/upload`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });
  return handleResponse(response);
}

export async function deleteUploadedImage(url) {
  const filename = url?.startsWith('/uploads/') ? url.slice('/uploads/'.length) : '';
  if (!filename) return;
  return apiFetch(`/api/upload/${encodeURIComponent(filename)}`, { method: 'DELETE' });
}
