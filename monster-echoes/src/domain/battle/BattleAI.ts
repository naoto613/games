import { getSkill } from '../../data/skills';
import type { SkillDefinition, Tactic } from '../../data/types';
import type { Rng } from '../../core/Random';
import { BALANCE } from '../../data/balance';
import { elementMultiplier, rawDamage, statusMultiplier } from './DamageCalculator';
import type { BattleState, Combatant } from './types';

const ENEMY_HEAL = BALANCE.battle.enemyHeal;

export type AiChoice = { skillId: string; target?: string; score: number; reason: string };

const WEIGHTS: Record<Tactic, { damage: number; heal: number; support: number; mpPenalty: number }> = {
  attack: { damage: 1.2, heal: 0.7, support: 0.5, mpPenalty: 0.15 },
  skill: { damage: 1, heal: 1, support: 1, mpPenalty: 0 },
  support: { damage: 0.6, heal: 1.6, support: 1.3, mpPenalty: 0.05 },
  save: { damage: 1, heal: 0.9, support: 0.4, mpPenalty: 3 },
  nomagic: { damage: 1.2, heal: 0, support: 0, mpPenalty: 0 },
};

export const alive = (cs: Combatant[]) => cs.filter((c) => c.hp > 0);
export const opponentsOf = (s: BattleState, c: Combatant) => (c.side === 'ally' ? s.enemies : s.allies);
export const friendsOf = (s: BattleState, c: Combatant) => (c.side === 'ally' ? s.allies : s.enemies);

function expectedDamage(skill: SkillDefinition, a: Combatant, d: Combatant): number {
  const hits = skill.target === 'randomEnemies' ? 1 : (skill.hits ?? 1);
  let dmg = Math.max(1, rawDamage(skill, a, d) * elementMultiplier(d, skill.elementId)) * hits * skill.hitRate;
  if (a.charged && skill.category === 'physical') dmg *= 2;
  const capped = Math.min(dmg, d.hp);
  // とどめを させるなら少し高く評価
  return capped + (dmg >= d.hp ? 6 + d.level : 0);
}

/** 使える行動を列挙して評価し、いちばん点の高い行動を選ぶ */
export function chooseAction(s: BattleState, actor: Combatant, tactic: Tactic, rng: Rng, noise = 3, whim = 0): AiChoice {
  const W = WEIGHTS[tactic];
  const foes = alive(opponentsOf(s, actor));
  const friends = friendsOf(s, actor);
  const living = alive(friends);
  const options: AiChoice[] = [];
  // 敵チーム全体で この戦闘に回復した回数
  const teamHeals = friends.reduce((a, c) => a + c.healsUsed, 0);
  const ids = ['attack', ...actor.skills];
  for (const id of ids) {
    const sk = getSkill(id);
    if (sk.mpCost > actor.mp) continue;
    // じゅもん つかうな: MPを使う特技は いっさい使わない
    if (tactic === 'nomagic' && sk.mpCost > 0) continue;
    const pen = sk.mpCost * W.mpPenalty;
    switch (sk.category) {
      case 'physical':
      case 'magic':
      case 'breath': {
        if (!foes.length) break;
        if (sk.target === 'allEnemies') {
          const v = foes.reduce((a, d) => a + expectedDamage(sk, actor, d), 0);
          options.push({ skillId: id, score: v * W.damage - pen, reason: `全体 ${v.toFixed(0)}` });
        } else if (sk.target === 'randomEnemies') {
          const per = foes.reduce((a, d) => a + expectedDamage(sk, actor, d), 0) / foes.length;
          const v = per * (sk.hits ?? 1);
          options.push({ skillId: id, score: v * W.damage - pen, reason: `ランダム ${v.toFixed(0)}` });
        } else {
          for (const d of foes) {
            const v = expectedDamage(sk, actor, d);
            options.push({ skillId: id, target: d.key, score: v * W.damage - pen, reason: `${d.name}へ ${v.toFixed(0)}` });
          }
        }
        break;
      }
      case 'heal': {
        // 敵は ひんしに なるまで回復せず、回復するたびに 回復したがらなくなる（戦闘が終わらなくなるのを防ぐ）
        const isEnemy = actor.side === 'enemy';
        const limit = isEnemy ? ENEMY_HEAL.threshold : 0.6;
        const damp = isEnemy ? ENEMY_HEAL.weight * Math.pow(ENEMY_HEAL.decay, teamHeals) : 1;
        if (sk.target === 'allAllies') {
          const v = living.reduce((a, t) => a + (t.hp / t.maxHp < limit + 0.15 ? Math.min(sk.power, t.maxHp - t.hp) : 0), 0);
          if (v > 0) options.push({ skillId: id, score: v * W.heal * 1.1 * damp - pen, reason: `全体回復 ${v}` });
        } else {
          for (const t of living) {
            const ratio = t.hp / t.maxHp;
            if (ratio >= limit) continue;
            const v = Math.min(sk.power, t.maxHp - t.hp) * (1.6 - ratio);
            options.push({ skillId: id, target: t.key, score: v * W.heal * damp - pen, reason: `${t.name}回復 ${v.toFixed(0)}` });
          }
        }
        break;
      }
      case 'revive': {
        const dead = friends.filter((c) => c.hp <= 0);
        const damp = actor.side === 'enemy' ? ENEMY_HEAL.weight * Math.pow(ENEMY_HEAL.decay, teamHeals) : 1;
        for (const t of dead) options.push({ skillId: id, target: t.key, score: (t.maxHp * 0.6 + 12) * W.heal * damp - pen, reason: `${t.name}蘇生` });
        break;
      }
      case 'cure': {
        for (const t of living) {
          const st = t.status;
          if (st.sleep || st.paralysis || st.confusion || st.poison)
            options.push({ skillId: id, target: t.key, score: (14 + t.level) * W.support - pen, reason: `${t.name}治療` });
        }
        break;
      }
      case 'buff': {
        if (!foes.length) break;
        if (sk.charge) {
          if (actor.charged) break;
          const best = Math.max(0, ...foes.map((d) => expectedDamage(getSkill('attack'), actor, d)));
          options.push({ skillId: id, score: best * 0.8 * W.support - pen, reason: 'ちからため' });
          break;
        }
        const b = sk.buff!;
        const ts = sk.target === 'self' ? [actor] : living;
        const room = ts.filter((t) => t.stages[b.stat] < BALANCE.battle.maxStage).length;
        if (!room) break;
        const v = (6 + actor.level * 0.8) * room * (s.turn <= 2 ? 1.3 : 0.8);
        options.push({ skillId: id, score: v * W.support - pen, reason: `強化x${room}` });
        break;
      }
      case 'debuff': {
        const b = sk.buff!;
        const ts = sk.target === 'allEnemies' ? foes : foes;
        const room = ts.filter((t) => t.stages[b.stat] > -BALANCE.battle.maxStage);
        if (!room.length) break;
        if (sk.target === 'allEnemies') {
          options.push({ skillId: id, score: (5 + actor.level * 0.6) * room.length * W.support - pen, reason: `弱体全体` });
        } else {
          for (const t of room) options.push({ skillId: id, target: t.key, score: (6 + t.level * 0.8) * W.support - pen, reason: `${t.name}弱体` });
        }
        break;
      }
      case 'status': {
        const st = sk.statusEffectId!;
        const free = (t: Combatant) => (st === 'poison' ? !t.status.poison : t.status[st] === 0);
        const val = (t: Combatant) => (sk.statusChance ?? 0) * statusMultiplier(t, st) * (st === 'sleep' || st === 'paralysis' ? 16 + t.level * 1.6 : 10 + t.level);
        const ts = foes.filter(free);
        if (!ts.length) break;
        if (sk.target === 'allEnemies') {
          const v = ts.reduce((a, t) => a + val(t), 0);
          options.push({ skillId: id, score: v * W.support - pen, reason: `${st}全体 ${v.toFixed(0)}` });
        } else {
          for (const t of ts) options.push({ skillId: id, target: t.key, score: val(t) * W.support - pen, reason: `${t.name}に${st}` });
        }
        break;
      }
    }
  }
  // 敵は同じ補助・状態異常の特技を続けて使いにくい
  if (actor.side === 'enemy')
    for (const o of options) {
      const cat = getSkill(o.skillId).category;
      if (['buff', 'debuff', 'status', 'cure'].includes(cat)) o.score *= Math.pow(BALANCE.battle.enemyRepeatFactor, actor.used[o.skillId] ?? 0);
    }
  if (!options.length) return { skillId: 'attack', target: foes[0]?.key, score: 0, reason: 'こうげきのみ' };
  for (const o of options) o.score += rng.next() * noise;
  options.sort((a, b) => b.score - a.score);
  if (whim > 0 && rng.next() < whim) {
    // 気まぐれ: 点数がプラスの行動から ランダムに選ぶ
    const ok = options.filter((o) => o.score > 0 && !['heal', 'revive'].includes(getSkill(o.skillId).category));
    if (ok.length) {
      const c = ok[Math.floor(rng.next() * ok.length)];
      return { ...c, reason: `きまぐれ(${c.reason})` };
    }
  }
  return options[0];
}
