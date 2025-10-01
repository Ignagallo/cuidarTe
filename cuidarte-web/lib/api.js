export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001";

export async function apiFetch(path, options = {}) {
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`;
  const resp = await fetch(url, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers||{}) },
    ...options,
  });
  const data = await resp.json().catch(()=>null);
  if (!resp.ok) throw new Error(data?.error || data?.message || `Error ${resp.status}`);
  return data;
}
