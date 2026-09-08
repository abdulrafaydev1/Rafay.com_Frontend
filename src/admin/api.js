// Same-origin proxy keeps admin cookies first-party, including the existing Vercel deployment.
export async function adminRequest(path, { method = 'GET', body, csrfToken, signal } = {}) {
  let response;
  try {
    response = await fetch(`/api/admin${path}`, {
      method, credentials: 'same-origin', cache: 'no-store', signal,
      headers: {
        ...(method !== 'GET' ? { 'Content-Type': 'application/json', 'X-Admin-Request': '1' } : {}),
        ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new Error('Unable to reach the admin service. Please try again.', { cause: error });
  }
  const data = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(data?.message || 'Unable to complete this request. Please try again.');
    error.status = response.status;
    if (response.status === 401 && path !== '/login' && path !== '/session') window.dispatchEvent(new Event('admin-session-expired'));
    throw error;
  }
  if (response.status !== 204 && (!data || typeof data !== 'object')) throw new Error('Admin service is temporarily unavailable.');
  return data;
}

export function exportCsv(filename, headings, rows) {
  const escapeCell = (value) => {
    let text = String(value ?? '');
    if (/^[=+@\-\t\r]/.test(text)) text = `'${text}`;
    return `"${text.replaceAll('"', '""')}"`;
  };
  const csv = [headings, ...rows].map((row) => row.map(escapeCell).join(',')).join('\r\n');
  const url = URL.createObjectURL(new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8;' }));
  const anchor = document.createElement('a');
  anchor.href = url; anchor.download = filename;
  document.body.append(anchor); anchor.click(); anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
