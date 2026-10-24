import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createMemoryDb } from '../src/repositories/db.js';
import { Repository, ValidationError } from '../src/repositories/repository.js';
import { createInitiative } from '../src/domain/initiative.js';

const base = { title: 'CRM', problemStatement: 'p', scope: 'CRM', desiredState: 'd', businessContext: 'b' };

test('検証に通らないデータは保存しない', async () => {
  const repo = new Repository(createMemoryDb());
  await assert.rejects(repo.save('initiatives', createInitiative({ title: '' })), ValidationError);
  assert.equal((await repo.listInitiatives()).length, 0);
});

test('案件の削除で関連データも削除される', async () => {
  const repo = new Repository(createMemoryDb());
  const a = await repo.save('initiatives', createInitiative(base));
  const b = await repo.save('initiatives', createInitiative({ ...base, title: 'B' }));
  await repo.save('observations', { initiativeId: a.id, content: 'x' });
  await repo.save('observations', { initiativeId: b.id, content: 'y' });
  await repo.deleteInitiative(a.id);
  assert.equal(await repo.get('initiatives', a.id), null);
  assert.equal((await repo.listAll('observations')).length, 1);
  assert.equal((await repo.loadBundle(b.id)).observations.length, 1);
});

test('設定に APIキーを保存しない', async () => {
  const repo = new Repository(createMemoryDb());
  await repo.saveSettings({ aiMode: 'backend', apiKey: 'sk-secret' });
  const s = await repo.getSettings();
  assert.equal(s.aiMode, 'backend');
  assert.equal(s.apiKey, undefined);
});
