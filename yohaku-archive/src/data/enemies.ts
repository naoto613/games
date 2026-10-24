// 敵と戦闘の定義。敵は「行動」と「行動の成立条件（因果）」をデータとして持つ。
import type { NodeDef, LinkDef } from '../engine/causal';

export type IntentKind = 'attack' | 'aoe' | 'charge' | 'contra' | 'heal' | 'drain' | 'seal' | 'idle';

export interface IntentDef {
  id: string;
  name: string;
  kind: IntentKind;
  /** 成立条件となるノード（ローカルID）。無ければ常に成立 */
  node?: string;
  power?: number;
  desc: string;
}

export interface EnemyDef {
  id: string;
  name: string;
  art: 'eater' | 'moth' | 'beast' | 'sentinel' | 'shade' | 'attendant' | 'shelf' | 'king';
  hp: number;
  atk: number;
  def: number;
  exp: number;
  gold: number;
  margin: number;
  desc: string;
  rule?: string;
  nodes: NodeDef[];
  links: LinkDef[];
  intents: IntentDef[];
  drops?: { item: string; rate: number }[];
}

export const ENEMIES: EnemyDef[] = [
  {
    id: 'eater', name: '欠片喰い', art: 'eater', hp: 40, atk: 9, def: 2, exp: 12, gold: 8, margin: 0,
    desc: '欠因から這い出た、記録の欠片を食べる小さな獣。',
    rule: '見えている相手にだけ噛みつく。',
    nodes: [
      { id: 'see', label: 'セイルたちの姿が見えている', x: 20, y: 30, sensor: 'always' },
      { id: 'bite', label: '噛みつき', x: 80, y: 30, tag: 'intent' },
    ],
    links: [{ id: 'L1', from: 'see', to: 'bite', state: 'intact', ops: ['cut'], cost: { cut: 1 }, label: '見えていれば噛みつく' }],
    intents: [
      { id: 'bite', name: '噛みつき', kind: 'attack', node: 'bite', power: 1.2, desc: '単体に攻撃' },
      { id: 'wander', name: 'うろつく', kind: 'idle', desc: '何もしない' },
    ],
    drops: [{ item: 'potion', rate: 0.25 }],
  },
  {
    id: 'moth', name: '空白蛾', art: 'moth', hp: 32, atk: 8, def: 1, exp: 10, gold: 6, margin: 0,
    desc: '翅の模様が抜け落ちた蛾。鱗粉が周囲の因果をほつれさせる。',
    rule: '奇数のターンに、矛盾を撒く（矛盾が3つ未満のとき）。',
    nodes: [
      { id: 'odd', label: '奇数のターン', x: 15, y: 25, sensor: 'turnMod:2:1' },
      { id: 'room', label: '矛盾が3つ未満', x: 15, y: 55, sensor: 'contraLt:3' },
      { id: 'dust', label: '鱗粉を撒く', x: 75, y: 40, tag: 'intent', mode: 'all' },
    ],
    links: [
      { id: 'L1', from: 'odd', to: 'dust', state: 'intact', ops: ['cut'], cost: { cut: 1 }, label: '奇数の刻に羽ばたく' },
      { id: 'L2', from: 'room', to: 'dust', state: 'intact' },
    ],
    intents: [
      { id: 'dust', name: '鱗粉を撒く', kind: 'contra', node: 'dust', desc: '戦場の矛盾を1つ増やす' },
      { id: 'peck', name: '体当たり', kind: 'attack', power: 0.9, desc: '単体に攻撃' },
    ],
    drops: [{ item: 'ether', rate: 0.15 }],
  },
  {
    id: 'shade', name: '欠因の影', art: 'shade', hp: 80, atk: 13, def: 5, exp: 22, gold: 12, margin: 1,
    desc: '原因を失った結果が、形だけ残ったもの。',
    rule: '戦場に矛盾がある限り、倒れても蘇る（2回まで）。3ターンごとに余白を啜る。',
    nodes: [
      { id: 'anyc', label: '戦場に矛盾が存在する', x: 15, y: 25, sensor: 'contra>=1' },
      { id: 'revive', label: '倒れても蘇る', x: 75, y: 25, effect: ['revive'] },
      { id: 'thirst', label: '3ターン目ごと', x: 15, y: 60, sensor: 'turnMod:3:0' },
      { id: 'drain', label: '余白を啜る', x: 75, y: 60, tag: 'intent' },
    ],
    links: [
      { id: 'L1', from: 'anyc', to: 'revive', state: 'intact', ops: ['cut'], cost: { cut: 1 }, label: '矛盾が影を繋ぎ止める' },
      { id: 'L2', from: 'thirst', to: 'drain', state: 'intact', ops: ['cut'], cost: { cut: 1 } },
    ],
    intents: [
      { id: 'drain', name: '余白を啜る', kind: 'drain', node: 'drain', power: 0.8, desc: '単体に攻撃し、余白を1奪う' },
      { id: 'claw', name: '影の爪', kind: 'attack', power: 1.0, desc: '単体に攻撃' },
    ],
    drops: [{ item: 'crystal', rate: 0.08 }, { item: 'potion', rate: 0.2 }],
  },
  {
    id: 'beast', name: '断絶獣', art: 'beast', hp: 280, atk: 17, def: 7, exp: 40, gold: 25, margin: 1,
    desc: '矛盾を喰らって強くなる獣。',
    rule: '周囲の矛盾が強化を支え、矛盾が2つ以上かつ強化中なら全体攻撃。',
    nodes: [
      { id: 'many', label: '周囲に矛盾が2つ以上', x: 12, y: 18, sensor: 'contra>=2' },
      { id: 'anyc', label: '矛盾が存在する', x: 12, y: 48, sensor: 'contra>=1' },
      { id: 'buff', label: '断絶獣の強化（攻撃+40%）', x: 50, y: 48, effect: ['atkUp:40'] },
      { id: 'roar', label: '断絶の咆哮（全体攻撃）', x: 86, y: 30, tag: 'intent', mode: 'all' },
      { id: 'broken', label: '崩れている', x: 50, y: 70, sensor: 'status:broken' },
      { id: 'few', label: '矛盾が2つ未満', x: 86, y: 64, sensor: 'contraLt:2', obs: 10 },
    ],
    links: [
      { id: 'B1', from: 'anyc', to: 'buff', state: 'intact', ops: ['cut'], cost: { cut: 2 }, label: '矛盾が強化を支える' },
      { id: 'B2', from: 'many', to: 'roar', state: 'intact', ops: ['cut'], cost: { cut: 2 } },
      { id: 'B3', from: 'buff', to: 'roar', state: 'intact', ops: ['cut'], cost: { cut: 2 } },
      { id: 'B4', from: 'broken', to: 'buff', type: 'inhibit', state: 'intact', label: '崩れると強化が解ける' },
      { id: 'B5', from: 'anyc', to: 'p.atk', state: 'possible', ops: ['connect'], cost: { connect: 2 }, steals: 'B1', label: '矛盾を味方の力に繋ぎ替える（強化を奪う）' },
    ],
    intents: [
      { id: 'roar', name: '断絶の咆哮', kind: 'aoe', node: 'roar', power: 1.1, desc: '全体に攻撃' },
      { id: 'howl', name: '矛盾を呼ぶ', kind: 'contra', node: 'few', desc: '戦場の矛盾を1つ増やす' },
      { id: 'claw', name: '裂爪', kind: 'attack', power: 1.0, desc: '単体に攻撃' },
    ],
    drops: [{ item: 'crystal', rate: 0.2 }],
  },
  {
    id: 'sentinel', name: '時計仕掛けの番兵', art: 'sentinel', hp: 250, atk: 17, def: 12, exp: 45, gold: 30, margin: 1,
    desc: '鐘楼を守るゼンマイ仕掛け。鐘が鳴らなくなっても、決まった動きを繰り返す。',
    rule: '奇数のターンに力を溜め、溜めた力で強打する（習慣）。',
    nodes: [
      { id: 'tick', label: '奇数の刻', x: 12, y: 18, sensor: 'turnMod:2:1' },
      { id: 'wind', label: 'ゼンマイを巻く', x: 50, y: 18, tag: 'intent' },
      { id: 'charged', label: '力を溜めている', x: 12, y: 50, sensor: 'status:charged' },
      { id: 'strike', label: '定刻の強打', x: 84, y: 50, tag: 'intent' },
      { id: 'broken', label: '崩れている', x: 50, y: 70, sensor: 'status:broken' },
    ],
    links: [
      { id: 'S1', from: 'tick', to: 'wind', state: 'intact', ops: ['cut'], cost: { cut: 2 } },
      { id: 'S2', from: 'charged', to: 'strike', state: 'intact', ops: ['cut'], cost: { cut: 2 }, label: '溜めた力で打つ' },
      { id: 'S3', from: 'broken', to: 'strike', type: 'inhibit', state: 'intact', label: '崩れると打てない' },
    ],
    intents: [
      { id: 'strike', name: '定刻の強打', kind: 'attack', node: 'strike', power: 2.2, desc: '単体に大ダメージ' },
      { id: 'wind', name: 'ゼンマイを巻く', kind: 'charge', node: 'wind', desc: '力を溜める（次のターンに強打）' },
      { id: 'jab', name: '振り子打ち', kind: 'attack', power: 0.8, desc: '単体に攻撃' },
    ],
    drops: [{ item: 'ether', rate: 0.3 }],
  },
  {
    id: 'attendant', name: '沈黙の従者', art: 'attendant', hp: 150, atk: 14, def: 9, exp: 30, gold: 18, margin: 1,
    desc: '顔のない従者。仲間が打たれると、それを癒やす。',
    rule: '前のターンに仲間が攻撃を受けていれば、その仲間を癒やす。',
    nodes: [
      { id: 'seen', label: '仲間が攻撃を受けた', x: 15, y: 30, sensor: 'allyAttacked' },
      { id: 'mend', label: '沈黙の手当て', x: 80, y: 30, tag: 'intent' },
    ],
    links: [{ id: 'A1', from: 'seen', to: 'mend', state: 'intact', ops: ['cut'], cost: { cut: 2 }, label: '打たれた仲間を癒やす' }],
    intents: [
      { id: 'mend', name: '沈黙の手当て', kind: 'heal', node: 'mend', power: 50, desc: '仲間1体のHPを回復' },
      { id: 'hit', name: '無言の打擲', kind: 'attack', power: 1.0, desc: '単体に攻撃' },
    ],
    drops: [{ item: 'potion', rate: 0.3 }],
  },
  {
    id: 'shelf', name: '白紙の書架', art: 'shelf', hp: 95, atk: 10, def: 2, exp: 80, gold: 50, margin: 2,
    desc: '中身を失った本が積み重なった書架。頁がめくれるたびに膨らむ。',
    rule: '毎ターン頁がめくれて力が溜まり（攻撃+3）、2段以上積もると全体攻撃。',
    nodes: [
      { id: 'page', label: '頁がめくれる', x: 12, y: 18, sensor: 'always' },
      { id: 'power', label: '頁の力が溜まる（毎ターン攻撃+3）', x: 50, y: 18, effect: ['stackAtk'] },
      { id: 'thick', label: '頁が2段以上積もった', x: 12, y: 54, sensor: 'stacks>=2' },
      { id: 'storm', label: '白紙の嵐（全体攻撃）', x: 84, y: 54, tag: 'intent' },
    ],
    links: [
      { id: 'P1', from: 'page', to: 'power', state: 'intact', ops: ['cut'], cost: { cut: 2 }, label: 'めくれるたびに力が溜まる' },
      { id: 'P2', from: 'thick', to: 'storm', state: 'intact', ops: ['cut'], cost: { cut: 2 } },
    ],
    intents: [
      { id: 'storm', name: '白紙の嵐', kind: 'aoe', node: 'storm', power: 0.9, desc: '全体に攻撃' },
      { id: 'slam', name: '背表紙打ち', kind: 'attack', power: 1.1, desc: '単体に攻撃' },
    ],
  },
  {
    id: 'king', name: '沈黙の王', art: 'king', hp: 540, atk: 26, def: 12, exp: 300, gold: 200, margin: 3,
    desc: '切り離された「鐘の音」の原因を抱え込んだ、鐘楼の主。',
    rule: '攻撃されると防御が上がる……ように見える。',
    nodes: [
      { id: 'hit', label: '王が攻撃を受けた', x: 10, y: 12, sensor: 'attacked' },
      { id: 'known', label: '王の存在が認識される', x: 40, y: 12, requires: ['r_inscription'] },
      { id: 'stone', label: '王が石を纏う（毎ターン防御+5）', x: 74, y: 12, effect: ['stackDef'] },
      { id: 'heavy', label: '石が2層以上', x: 74, y: 38, sensor: 'stacks>=2' },
      { id: 'toll', label: '無音の鐘（全体攻撃）', x: 44, y: 40, tag: 'intent', ops: ['hold'], cost: { hold: 3 } },
      { id: 'silence', label: '沈黙（スキル封じ）', x: 12, y: 40, tag: 'intent' },
      { id: 'unseen', label: '誰にも打たれていない', x: 10, y: 66, sensor: 'notAttacked' },
      { id: 'half', label: '王が玉座に戻った（HP50%未満）', x: 42, y: 66, sensor: 'hpBelow:50' },
      { id: 'heal', label: '沈黙の再生', x: 76, y: 66, tag: 'intent', mode: 'all', ops: ['hold'], cost: { hold: 3 } },
    ],
    links: [
      { id: 'K1', from: 'hit', to: 'known', state: 'intact', label: '打たれて「在る」と知られる' },
      { id: 'K2', from: 'known', to: 'stone', state: 'intact', ops: ['cut'], cost: { cut: 3 }, requires: ['r_inscription'], label: '知られるたび石を纏う' },
      { id: 'K3', from: 'heavy', to: 'toll', state: 'intact', ops: ['cut'], cost: { cut: 2 } },
      { id: 'K4', from: 'known', to: 'silence', state: 'intact', ops: ['cut'], cost: { cut: 2 } },
      { id: 'K5', from: 'unseen', to: 'heal', state: 'intact', ops: ['cut'], cost: { cut: 2 } },
      { id: 'K6', from: 'half', to: 'heal', state: 'intact' },
    ],
    intents: [
      { id: 'toll', name: '無音の鐘', kind: 'aoe', node: 'toll', power: 1.0, desc: '全体に攻撃' },
      { id: 'heal', name: '沈黙の再生', kind: 'heal', node: 'heal', power: 70, desc: '自分のHPを回復' },
      { id: 'silence', name: '沈黙', kind: 'seal', node: 'silence', power: 0.6, desc: '単体に攻撃し、2ターンスキルを封じる' },
      { id: 'crush', name: '沈黙の鉄槌', kind: 'attack', power: 1.3, desc: '単体に大きな攻撃' },
    ],
  },
];

export const ENEMY_MAP = new Map(ENEMIES.map(e => [e.id, e]));

export interface DeviceDef { id: string; name: string; desc: string; dmg: number; cooldown: number }

export interface BattleDef {
  id: string;
  enemies: string[];
  /** 戦場に最初からある矛盾の数（0〜3） */
  field?: number;
  devices?: DeviceDef[];
  boss?: boolean;
  bg: 'archive' | 'corridor' | 'town' | 'tower' | 'top' | 'east';
  tutorial?: 'first' | 'beast' | 'king';
}

export const BATTLES: BattleDef[] = [
  { id: 'b_tutorial', enemies: ['eater'], bg: 'archive', tutorial: 'first' },
  { id: 'b_corr1', enemies: ['moth', 'moth'], bg: 'corridor' },
  { id: 'b_corr2', enemies: ['eater', 'moth'], bg: 'corridor', field: 1 },
  { id: 'b_corr3', enemies: ['eater', 'eater'], bg: 'corridor' },
  { id: 'b_shelf', enemies: ['shelf'], bg: 'corridor', field: 1, boss: true },
  { id: 'b_corr_deep', enemies: ['beast', 'shade'], bg: 'corridor', field: 2 },
  { id: 'b_plaza', enemies: ['shade'], bg: 'town', field: 1 },
  { id: 'b_gate', enemies: ['shade', 'shade'], bg: 'town', field: 1 },
  { id: 'b_east1', enemies: ['moth', 'moth', 'moth'], bg: 'east' },
  { id: 'b_east2', enemies: ['beast'], bg: 'east', field: 2, tutorial: 'beast' },
  { id: 'b_east3', enemies: ['shade', 'moth'], bg: 'east', field: 1 },
  { id: 'b_t1a', enemies: ['sentinel'], bg: 'tower' },
  { id: 'b_t1b', enemies: ['shade', 'moth'], bg: 'tower', field: 1 },
  { id: 'b_t2a', enemies: ['attendant', 'sentinel'], bg: 'tower' },
  { id: 'b_t2b', enemies: ['beast', 'moth'], bg: 'tower', field: 2 },
  { id: 'b_t2flood', enemies: ['shade', 'shade', 'shade'], bg: 'tower', field: 1 },
  { id: 'b_t3', enemies: ['attendant', 'attendant'], bg: 'top' },
  {
    id: 'b_king', enemies: ['king', 'attendant'], bg: 'top', boss: true, tutorial: 'king',
    devices: [{ id: 'weight', name: '分銅を落とす', desc: '鐘楼の分銅を王の頭上に落とす。防御を無視して40ダメージ。「攻撃」とは見なされない。2ターンに1度。', dmg: 40, cooldown: 2 }],
  },
];

export const BATTLE_MAP = new Map(BATTLES.map(b => [b.id, b]));

export const FIELD_CONTRA_LABELS = ['影が光より先に落ちている', '足音だけが二度鳴る', '割れていない窓に破片が散る'];
