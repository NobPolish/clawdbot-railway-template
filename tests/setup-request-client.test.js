import test from 'node:test';
import assert from 'node:assert/strict';
import { createSetupRequestClient, SetupRequestError } from '../src/setup-request-client.js';

test('classifies timeout errors and surfaces timeout category', async () => {
  const fetchImpl = (_url, opts) => new Promise((_resolve, reject) => {
    opts.signal.addEventListener('abort', () => reject(opts.signal.reason));
  });

  const client = createSetupRequestClient({ fetchImpl, defaultTimeoutMs: 15 });

  await assert.rejects(
    () => client.requestJson('/setup/api/status', { maxRetries: 0 }),
    (err) => {
      assert.ok(err instanceof SetupRequestError);
      assert.equal(err.category, 'timeout');
      assert.equal(err.retriable, true);
      return true;
    }
  );
});

test('retries network errors for idempotent requests and succeeds on second attempt', async () => {
  let calls = 0;
  const fetchImpl = async () => {
    calls += 1;
    if (calls === 1) {
      const err = new TypeError('fetch failed');
      throw err;
    }
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'content-type': 'application/json' }
    });
  };

  const client = createSetupRequestClient({ fetchImpl, defaultTimeoutMs: 1000 });
  const result = await client.requestJson('/setup/api/status', { maxRetries: 1, retryDelayMs: 1 });

  assert.equal(calls, 2);
  assert.deepEqual(result, { ok: true });
});

test('classifies HTTP status categories correctly', async () => {
  const mk = (status, body) => createSetupRequestClient({
    fetchImpl: async () => new Response(body, { status })
  });

  await assert.rejects(
    () => mk(400, 'bad input').requestJson('/setup/api/status', { maxRetries: 0 }),
    (err) => {
      assert.equal(err.category, 'validation');
      assert.equal(err.status, 400);
      return true;
    }
  );

  await assert.rejects(
    () => mk(401, 'unauthorized').requestJson('/setup/api/status', { maxRetries: 0 }),
    (err) => {
      assert.equal(err.category, 'auth');
      assert.equal(err.status, 401);
      return true;
    }
  );

  await assert.rejects(
    () => mk(503, 'down').requestJson('/setup/api/status', { maxRetries: 0 }),
    (err) => {
      assert.equal(err.category, 'server');
      assert.equal(err.status, 503);
      return true;
    }
  );
});
