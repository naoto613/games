// 保存処理の窓口。正規化と検証を通したものだけを保存する
import { CHILD_STORES, STORES, DEFAULT_SETTINGS } from '../constants.js';
import { ENTITIES } from '../domain/entities.js';
import { nowIso } from '../domain/common.js';

export class ValidationError extends Error {
  constructor(errors, label = '') {
    super(`${label}の入力内容を確認してください：${Object.values(errors).join(' / ')}`);
    this.errors = errors;
  }
}

export class Repository {
  constructor(db) {
    this.db = db;
  }

  get persistent() {
    return this.db.persistent;
  }

  prepare(store, input) {
    const ent = ENTITIES[store];
    if (!ent) throw new Error(`不明なデータ種別：${store}`);
    const record = ent.normalize(input);
    const errors = ent.validate(record);
    if (Object.keys(errors).length) throw new ValidationError(errors, ent.label);
    return record;
  }

  async save(store, input) {
    const record = this.prepare(store, input);
    record.updatedAt = nowIso();
    await this.db.put(store, record);
    return record;
  }

  // 複数の保存を1トランザクションで行う（例：介入案の判断＋意思決定記録）
  async saveMany(items) {
    const records = items.map(({ store, record }) => ({ store, record: this.prepare(store, record) }));
    await this.db.batch(records.map((r) => ({ type: 'put', store: r.store, record: r.record })));
    return records.map((r) => r.record);
  }

  async remove(store, id) {
    await this.db.delete(store, id);
  }

  async get(store, id) {
    return this.db.get(store, id);
  }

  async listInitiatives() {
    const all = await this.db.getAll(STORES.initiatives);
    return all.sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
  }

  async listAll(store) {
    return this.db.getAll(store);
  }

  async loadBundle(initiativeId) {
    const initiative = await this.db.get(STORES.initiatives, initiativeId);
    if (!initiative) return null;
    const bundle = { initiative };
    await Promise.all(CHILD_STORES.map(async (s) => {
      const rows = await this.db.getByInitiative(s, initiativeId);
      bundle[s] = rows.sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)));
    }));
    return bundle;
  }

  // 全案件のバンドルを一括で読む（ホーム・知見一覧・全体エクスポート用。ストアごとに1回だけ読む）
  async loadAllBundles() {
    const initiatives = await this.listInitiatives();
    const map = new Map(initiatives.map((i) => [i.id, { initiative: i, ...Object.fromEntries(CHILD_STORES.map((s) => [s, []])) }]));
    await Promise.all(CHILD_STORES.map(async (s) => {
      const rows = await this.db.getAll(s);
      rows.sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)));
      for (const r of rows) map.get(r.initiativeId)?.[s].push(r);
    }));
    return [...map.values()];
  }

  // 案件の削除：関連データもまとめて削除する（JSONバックアップを促すのは画面側）
  async deleteInitiative(initiativeId) {
    const ops = [{ type: 'delete', store: STORES.initiatives, id: initiativeId }];
    for (const s of CHILD_STORES) {
      const rows = await this.db.getByInitiative(s, initiativeId);
      for (const r of rows) ops.push({ type: 'delete', store: s, id: r.id });
    }
    await this.db.batch(ops);
    return ops.length;
  }

  // 案件のタイムスタンプ更新（子データを変更したとき）
  async touch(initiativeId) {
    const i = await this.db.get(STORES.initiatives, initiativeId);
    if (i) {
      i.updatedAt = nowIso();
      await this.db.put(STORES.initiatives, i);
    }
  }

  async getSettings() {
    const s = await this.db.get(STORES.settings, 'app');
    return { ...DEFAULT_SETTINGS, ...(s || {}) };
  }

  async saveSettings(patch) {
    const current = await this.getSettings();
    const next = { ...current, ...patch, id: 'app' };
    // APIキーは保存しない（設計書 5.6 / 12）
    delete next.apiKey;
    await this.db.put(STORES.settings, next);
    return next;
  }

  async clearAll() {
    await this.db.clearAll();
  }
}
