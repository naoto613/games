// 第3章（カゼノ）で ひらく しくみ：そうび（アクセサリ）・扉間移動・耐性表示・系統べつ図鑑
import { describe, expect, it } from 'vitest';
import { createRng } from '../../src/core/Random';
import { Game, newGameState } from '../../src/application/Game';
import { EQUIPS, EQUIP_BY_ID } from '../../src/data/v2/equipment';
import { withEquipment } from '../../src/domain/monster/Equipment';
import { CHAPTERS } from '../../src/data/world/chapters';

const toStage = (g: Game, stage: string) => { for (const st of CHAPTERS.flatMap((c) => c.stages.map((x) => x.id))) { if (st === stage) break; g.clearStage(st); } };

describe('第3章の しくみ', () => {
  it('カゼノに 着くと 系統べつ図鑑・耐性表示・そうびが ひらく（扉間移動は 第3章クリア）', () => {
    const g = new Game(newGameState('テスト', createRng(1)), { rng: createRng(2) });
    toStage(g, '3-1');
    expect(g.hasFeature('equipment')).toBe(false);
    g.clearStage('3-1');
    for (const f of ['familyDex', 'resistView', 'equipment'] as const) expect(g.hasFeature(f), f).toBe(true);
    expect(g.hasFeature('doorWarp')).toBe(false);
    g.clearStage('3-2'); g.clearStage('3-3');
    expect(g.hasFeature('doorWarp')).toBe(true);
  });
  it('そうびは 1体に 1つ。かう・つける・はずす。にがすと もどる', () => {
    const g = new Game(newGameState('テスト', createRng(1)), { rng: createRng(2) });
    toStage(g, '3-2');
    g.state.player.gold = 1000;
    expect(g.buyEquip('powerring').ok).toBe(true);
    expect(g.state.player.gold).toBe(1000 - EQUIP_BY_ID.powerring.price);
    const a = g.state.monsters[0];
    g.acceptRecruit('m022', 10);
    const b = g.state.monsters[1];
    expect(g.equip(a.id, 'powerring').ok).toBe(true);
    expect(g.equipOf(a.id)?.id).toBe('powerring');
    // ひとつしか ないので ほかの こには つけられない
    expect(g.equip(b.id, 'powerring').ok).toBe(false);
    expect(g.equipFree('powerring')).toBe(0);
    // 戦闘では こうげきが あがる（個体の 能力は かわらない）
    const boosted = withEquipment(a, g.equipOf(a.id));
    expect(boosted.stats.attack).toBe(a.stats.attack + 6);
    expect(g.monster(a.id)!.stats.attack).toBe(a.stats.attack);
    const s = g.startWildBattle([{ speciesId: 'm022', level: 3 }]);
    expect(s.state.allies[0].attack).toBe(a.stats.attack + 6);
    g.finishBattle?.();
    // はずすと ほかの こへ
    expect(g.equip(a.id, null).ok).toBe(true);
    expect(g.equip(b.id, 'powerring').ok).toBe(true);
    // にがすと そうびは もどる
    g.setParty([a.id]);
    expect(g.release(b.id).ok).toBe(true);
    expect(g.equipFree('powerring')).toBe(1);
  });
  it('耐性の そうびは 3を こえない。HP・MP は ふえない', () => {
    for (const e of EQUIPS) { expect(e.stats).not.toHaveProperty('hp'); expect(e.stats).not.toHaveProperty('mp'); }
    const g = new Game(newGameState('テスト', createRng(1)), { rng: createRng(2) });
    const m = { ...g.state.monsters[0], resistances: { wind: 3 } };
    expect(withEquipment(m, EQUIP_BY_ID.windcharm).resistances.wind).toBe(3);
  });
  it('扉間移動：着いた ことの ある 町の 扉へ とべる', () => {
    const g = new Game(newGameState('テスト', createRng(1)), { rng: createRng(2) });
    toStage(g, '4-1');
    g.state.player.townMap = 'kazeno_shrine';
    expect(g.warpTargets().sort()).toEqual(['liefel', 'mizuna']);
    expect(g.warpTo('mizuna').ok).toBe(true);
    expect(g.state.player.townMap).toBe('mizuna_shrine');
    expect(g.warpTo('akaris').ok).toBe(false);
  });
});
