import test from 'node:test';
import assert from 'node:assert/strict';
import { createDraft, DRAFT_STORAGE_KEY, loadDraft, mergeDraftState, saveDraft } from '../src/setup-draft-store.js';

function createMemoryStorage() {
  const m = new Map();
  return {
    getItem(k) { return m.has(k) ? m.get(k) : null; },
    setItem(k, v) { m.set(k, String(v)); },
    removeItem(k) { m.delete(k); }
  };
}

test('stale draft TTL handling returns stale and does not load draft', () => {
  const storage = createMemoryStorage();
  const old = createDraft({ flow: 'quick' }, 1000);
  old.updatedAt = 1000;
  saveDraft(storage, old);

  const result = loadDraft(storage, { now: 1000 + 1000 * 60 * 60 * 25, ttlMs: 1000 * 60 * 60 * 24 });
  assert.equal(result.reason, 'stale');
  assert.equal(result.draft, null);
});

test('conflict-safe restore preserves existing non-empty user fields by default', () => {
  const currentState = {
    authSecret: 'already-entered',
    model: 'gpt-4o',
    telegramToken: ''
  };
  const draftState = {
    authSecret: 'draft-secret',
    model: 'gpt-4o-mini',
    telegramToken: 'draft-telegram-token'
  };

  const merged = mergeDraftState(currentState, draftState, { allowConflict: false });

  assert.equal(merged.applied, false);
  assert.deepEqual(merged.conflicts.sort(), ['authSecret', 'model']);
  assert.equal(merged.state.authSecret, 'already-entered');
  assert.equal(merged.state.model, 'gpt-4o');
  assert.equal(merged.state.telegramToken, 'draft-telegram-token');
});

test('force restore mode can intentionally overwrite conflicts', () => {
  const merged = mergeDraftState(
    { authSecret: 'existing' },
    { authSecret: 'draft' },
    { allowConflict: true }
  );

  assert.equal(merged.applied, true);
  assert.deepEqual(merged.conflicts, []);
  assert.equal(merged.state.authSecret, 'draft');
});
