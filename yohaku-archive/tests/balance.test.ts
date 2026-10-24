import { describe, it } from 'vitest';
import { BATTLE_MAP } from '../src/data/enemies';
import { startBattle, resolveTurn, checkBattleEdit, doBattleEdit, intentOf, type Command } from '../src/engine/battle';
import { newGame, joinParty, statsOf, marginMax } from '../src/engine/state';

// npx vitest run tests/balance で、各戦闘の勝率と平均ターン数を表示する（難易度調整の目安）
function sim(id: string, level: number, smart: boolean, dran: boolean, seed: number) {
  const s = newGame();
  s.members.seil!.level = level;
  if (dran) { joinParty(s, 'dran'); s.members.dran!.level = level; s.members.dran!.skills.push('d_break'); }
  for (const c of s.party) { const st = statsOf(s, c); s.members[c]!.hp = st.hp; s.members[c]!.ap = st.ap; }
  s.margin = marginMax(s); s.inv.potion = 3; s.records.push('r_inscription'); s.unlocked.push('invert', 'hold');
  const b = startBattle(BATTLE_MAP.get(id)!, s, seed);
  for (let t = 0; t < 40 && !b.result; t++) {
    if (smart) for (const e of b.enemies.filter(x => x.alive)) {
      const it = intentOf(e, b.planned[e.uid]!.intent)!;
      if (!it.node || it.kind === 'idle' || it.kind === 'charge') continue;
      for (const l of b.graph.links.filter(l => l.to === `${e.uid}.${it.node}` && (l.ops ?? []).includes('cut'))) {
        if (checkBattleEdit(b, s, { kind: 'link', id: l.id }, 'cut').ok) { doBattleEdit(b, s, { kind: 'link', id: l.id }, 'cut'); break; }
      }
    }
    if (smart && b.graph.links.some(l => l.id === 'e0.K2') && b.edit.links['e0.K2'] !== 'severed' && checkBattleEdit(b, s, { kind: 'link', id: 'e0.K2' }, 'cut').ok) doBattleEdit(b, s, { kind: 'link', id: 'e0.K2' }, 'cut');
    const target = b.enemies.filter(e => e.alive).sort((x, y) => x.hp - y.hp)[0];
    const cmds: Command[] = b.party.filter(p => p.alive).map(p => {
      if (p.hp < p.maxHp * 0.35 && (s.inv.potion ?? 0) > 0) return { actor: p.uid, kind: 'item', item: 'potion', target: p.uid };
      if (smart && b.def.devices && !b.deviceCd.weight && p.char === 'seil') return { actor: p.uid, kind: 'device', device: 'weight', target: 'e0' };
      if (p.char === 'dran' && p.ap >= 3) return { actor: p.uid, kind: 'skill', skill: 'd_smash', target: target.uid };
      return { actor: p.uid, kind: 'attack', target: target.uid };
    });
    resolveTurn(b, s, cmds);
  }
  return { win: b.result === 'win', turns: b.turn };
}

describe('難易度表', () => {
  it('表示', () => {
    const rows: string[] = [];
    const cases: [string, number, boolean][] = [
      ['b_tutorial', 1, false], ['b_corr1', 1, false], ['b_corr2', 2, false], ['b_shelf', 2, false], ['b_shelf', 3, false],
      ['b_plaza', 3, true], ['b_gate', 4, true], ['b_east2', 4, true], ['b_t1a', 5, true], ['b_t1b', 5, true], ['b_t2a', 6, true],
      ['b_t2b', 6, true], ['b_t2flood', 6, true], ['b_king', 6, true], ['b_king', 7, true], ['b_king', 8, true],
    ];
    for (const [id, lv, dran] of cases) {
      for (const smart of [false, true]) {
        let w = 0, t = 0;
        for (let seed = 1; seed <= 20; seed++) { const r = sim(id, lv, smart, dran, seed); if (r.win) w++; t += r.turns; }
        rows.push(`${id.padEnd(11)} Lv${lv} ${smart ? '編集あり' : '力押し  '} 勝率${String(w * 5).padStart(3)}% 平均${(t / 20).toFixed(1)}ターン`);
      }
    }
    console.log('\n' + rows.join('\n'));
  });
});
