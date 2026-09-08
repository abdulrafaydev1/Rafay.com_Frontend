import assert from 'node:assert/strict';
import { afterEach, mock, test } from 'node:test';
import { adminRequest } from '../src/admin/api.js';

afterEach(() => mock.restoreAll());

const session = { admin: { email: 'admin@example.test' }, expiresAt: Date.now() + 60000, csrfToken: 'test-csrf-token' };
const respond = (status, data) => mock.method(globalThis, 'fetch', async () => new Response(
  status === 204 ? null : typeof data === 'string' ? data : JSON.stringify(data),
  { status },
));

for (const status of [401, 403]) {
  test(`session HTTP ${status} means logged out even with a non-JSON body`, async () => {
    respond(status, 'Unauthorized');
    assert.equal(await adminRequest('/session'), null);
  });
}

test('HTTP 200 authenticated=false means logged out', async () => {
  respond(200, { authenticated: false });
  assert.equal(await adminRequest('/session'), null);
});

test('both existing and explicit authenticated session contracts work', async () => {
  const fetch = respond(200, session);
  assert.deepEqual(await adminRequest('/session'), session);
  fetch.mock.mockImplementation(async () => Response.json({ ...session, authenticated: true }));
  assert.deepEqual(await adminRequest('/session'), { ...session, authenticated: true });
  assert.equal(fetch.mock.calls[0].arguments[1].credentials, 'include');
  assert.equal(fetch.mock.calls[0].arguments[1].cache, 'no-store');
});

test('unexpected HTTP failures remain errors with their actual status', async () => {
  const fetch = respond(500, '');
  for (const status of [404, 500, 502, 503]) {
    fetch.mock.mockImplementation(async () => new Response('', { status }));
    await assert.rejects(adminRequest('/session'), (error) => error.status === status);
  }
});

test('malformed successful session responses cannot unlock protected UI', async () => {
  const fetch = respond(200, {});
  for (const data of ['not JSON', null, [], {}, { authenticated: true }, { ...session, admin: null },
    { ...session, expiresAt: 'tomorrow' }, { ...session, csrfToken: '' }, { ...session, authenticated: 'false' }]) {
    fetch.mock.mockImplementation(async () => new Response(JSON.stringify(data), { status: 200 }));
    await assert.rejects(adminRequest('/session'));
  }
  fetch.mock.mockImplementation(async () => new Response(null, { status: 204 }));
  await assert.rejects(adminRequest('/session'));
});

test('login failures are still rejected and logged-out payloads cannot count as login', async () => {
  const fetch = respond(401, { message: 'Invalid email or password.' });
  await assert.rejects(adminRequest('/login', { method: 'POST', body: {} }), { status: 401, message: 'Invalid email or password.' });
  fetch.mock.mockImplementation(async () => Response.json({ authenticated: false }));
  await assert.rejects(adminRequest('/login', { method: 'POST', body: {} }));
});

test('login and logout send cookies and required request/CSRF headers', async () => {
  const fetch = respond(200, session);
  assert.deepEqual(await adminRequest('/login', { method: 'POST', body: { email: 'admin@example.test', password: 'test-only' } }), session);
  const login = fetch.mock.calls[0].arguments[1];
  assert.equal(login.credentials, 'include');
  assert.equal(login.headers['X-Admin-Request'], '1');
  assert.equal(login.headers['Content-Type'], 'application/json');
  fetch.mock.mockImplementation(async () => new Response(null, { status: 204 }));
  assert.equal(await adminRequest('/logout', { method: 'POST', body: {}, csrfToken: session.csrfToken }), null);
  assert.equal(fetch.mock.calls[1].arguments[1].headers['X-CSRF-Token'], session.csrfToken);
});

test('expired protected requests notify the application', async () => {
  const original = globalThis.window;
  const events = [];
  globalThis.window = { dispatchEvent: (event) => events.push(event.type) };
  try {
    respond(401, {});
    await assert.rejects(adminRequest('/overview'), { status: 401 });
    assert.deepEqual(events, ['admin-session-expired']);
  } finally {
    if (original === undefined) delete globalThis.window;
    else globalThis.window = original;
  }
});

test('network failures show a retryable error while cancellation stays cancellation', async () => {
  const fetch = mock.method(globalThis, 'fetch', async () => { throw new TypeError('Failed to fetch'); });
  await assert.rejects(adminRequest('/session'), /Unable to reach the admin service/);
  fetch.mock.mockImplementation(async () => { throw new DOMException('Aborted', 'AbortError'); });
  await assert.rejects(adminRequest('/session'), { name: 'AbortError' });
});
