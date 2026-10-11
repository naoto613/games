import { BALANCE } from '../../data/balance';
import { getSkill } from '../../data/skills';
import { err, ok, type Result } from '../../core/Result';
import type { MonsterInstance } from './types';

/** フィールド（メニュー）で使える特技か */
export const isFieldSkill = (id: string) => ['heal', 'revive', 'cure'].includes(getSkill(id).category);

/** フィールドでの回復量（戦闘と同じ式。ばらつきなし） */
export const fieldHealAmount = (skillId: string, caster: MonsterInstance) =>
  Math.floor(getSkill(skillId).power + caster.stats.wisdom * BALANCE.battle.healWisdomScale);

/**
 * フィールドで回復・蘇生の特技を使う。使い手の MP を減らし、対象の HP を回復した新しい一覧を返す。
 * targetId は全体回復なら null。
 */
export function useFieldSkill(party: MonsterInstance[], casterId: string, skillId: string, targetId: string | null): Result<{ party: MonsterInstance[]; healed: { id: string; amount: number; revived: boolean }[] }> {
  const caster = party.find((m) => m.id === casterId);
  if (!caster) return err('モンスターが みつかりません。');
  if (caster.hp <= 0) return err('たおれている モンスターは とくぎを つかえません。');
  if (!caster.skills.includes(skillId) || !isFieldSkill(skillId)) return err('その とくぎは ここでは つかえません。');
  const sk = getSkill(skillId);
  if (caster.mp < sk.mpCost) return err('MPが たりない！');
  const targets = sk.target === 'allAllies' ? party.filter((m) => m.hp > 0) : party.filter((m) => m.id === targetId);
  if (!targets.length) return err('あいてを えらんでください。');
  const healed: { id: string; amount: number; revived: boolean }[] = [];
  const next = party.map((m) => ({ ...m }));
  const get = (id: string) => next.find((m) => m.id === id)!;
  for (const t0 of targets) {
    const t = get(t0.id);
    if (sk.category === 'revive') {
      if (t.hp > 0) return err('たおれている モンスターに つかいましょう。');
      t.hp = Math.max(1, Math.floor((t.stats.hp * sk.power) / 100));
      healed.push({ id: t.id, amount: t.hp, revived: true });
    } else if (sk.category === 'heal') {
      if (t.hp <= 0) { if (sk.target !== 'allAllies') return err('たおれている モンスターは かいふく できません。'); continue; }
      const amt = Math.min(t.stats.hp - t.hp, fieldHealAmount(skillId, caster));
      t.hp += amt;
      healed.push({ id: t.id, amount: amt, revived: false });
    } else healed.push({ id: t.id, amount: 0, revived: false });
  }
  if (sk.category === 'heal' && healed.every((x) => x.amount === 0)) return err('HPは まんたんです。');
  get(caster.id).mp -= sk.mpCost;
  return ok({ party: next, healed });
}
