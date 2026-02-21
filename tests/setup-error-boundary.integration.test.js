import test from 'node:test';
import assert from 'node:assert/strict';

import { createSetupRequestClient } from '../src/setup-request-client.js';
import { getErrorPresentation } from '../src/setup-error-boundary.js';

async function getRejectedError(run) {
  try {
    await run();
    throw new Error('Expected rejection');
  } catch (err) {
    return err;
  }
}

test('auth timeout flow maps to session-expired banner', async () => {
  const client = createSetupRequestClient({
    fetchImpl: async () => new Response('unauthorized', { status: 401 })
  });

  const err = await getRejectedError(() => client.requestJson('/setup/api/status', { maxRetries: 0 }));
  const presentation = getErrorPresentation(err, { sectionLabel: 'status panel' });

  assert.equal(err.category, 'auth');
  assert.equal(presentation.title, 'Session expired');
  assert.equal(presentation.ctaHref, '/auth/login');
});

test('5xx response maps to degraded-mode fallback banner', async () => {
  const client = createSetupRequestClient({
    fetchImpl: async () => new Response('temporarily unavailable', { status: 503 })
  });

  const err = await getRejectedError(() => client.requestJson('/setup/api/status', { maxRetries: 0 }));
  const presentation = getErrorPresentation(err, { sectionLabel: 'setup deployment' });

  assert.equal(err.category, 'server');
  assert.equal(presentation.safeMode, true);
  assert.match(presentation.message, /degraded mode/i);
});

test('validation error maps to user input guidance banner', async () => {
  const client = createSetupRequestClient({
    fetchImpl: async () => new Response('invalid value', { status: 422 })
  });

  const err = await getRejectedError(() => client.requestJson('/setup/api/config/raw', { maxRetries: 0 }));
  const presentation = getErrorPresentation(err, { sectionLabel: 'config editor' });

  assert.equal(err.category, 'validation');
  assert.equal(presentation.title, 'Please review your input');
  assert.match(presentation.message, /config editor/i);
});
