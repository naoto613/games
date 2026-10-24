// スキルツリー（編纂系・観測系・干渉系）
import type { CharId } from './chars';

export interface SkillDef {
  id: string;
  name: string;
  owner: CharId;
  branch: '編纂' | '観測' | '干渉';
  sp: number;
  lv?: number;
  req?: string;
  ap?: number;
  target?: 'enemy' | 'ally' | 'self' | 'allEnemies';
  passive?: boolean;
  desc: string;
}

export const SKILLS: SkillDef[] = [
  // セイル：編纂系
  { id: 's_costdown', name: '余白の節約', owner: 'seil', branch: '編纂', sp: 1, lv: 2, passive: true, desc: '「接続」に必要な余白が1減る（最低1）。' },
  { id: 's_tolerance', name: '矛盾の受容', owner: 'seil', branch: '編纂', sp: 1, lv: 3, passive: true, desc: '矛盾の許容量が1増える。' },
  { id: 's_margin', name: '余白の器', owner: 'seil', branch: '編纂', sp: 1, lv: 4, passive: true, desc: '余白の上限が2増える。' },
  { id: 's_double', name: '二重編纂', owner: 'seil', branch: '編纂', sp: 2, lv: 5, req: 's_costdown', passive: true, desc: '戦闘中、1ターンに2回まで因果編集できる。' },
  { id: 's_rewrite', name: '条件書換', owner: 'seil', branch: '編纂', sp: 2, lv: 6, req: 's_tolerance', ap: 5, target: 'enemy', desc: '敵1体の予告行動を、その敵の最も弱い行動に書き換える。' },
  // セイル：観測系
  { id: 's_reveal', name: '隠れた記録', owner: 'seil', branch: '観測', sp: 1, lv: 2, passive: true, desc: '観測能力+4。隠された調査対象を見つけやすくなる。' },
  { id: 's_analyze', name: '分析', owner: 'seil', branch: '観測', sp: 1, lv: 3, ap: 2, target: 'enemy', desc: '敵1体の弱点を暴き（防御-40%・3ターン）、隠れた条件を表示する。' },
  { id: 's_predict', name: '予測精度', owner: 'seil', branch: '観測', sp: 1, lv: 4, req: 's_reveal', passive: true, desc: '編集の予測で「未調査の影響」の中身まで示唆する。' },
  { id: 's_condview', name: '条件の可視化', owner: 'seil', branch: '観測', sp: 1, lv: 5, req: 's_analyze', passive: true, desc: '敵の行動条件を観測能力に関係なくすべて表示する。' },
  { id: 's_hint', name: '未発見の示唆', owner: 'seil', branch: '観測', sp: 1, lv: 6, passive: true, desc: '記録画面で、まだ見つけていない記録のありかを示唆する。' },
  // セイル：干渉系
  { id: 's_strike', name: '綴じ打ち', owner: 'seil', branch: '干渉', sp: 1, lv: 2, ap: 3, target: 'enemy', desc: '威力1.6倍の攻撃。このターンに因果編集していれば威力2.4倍。' },
  { id: 's_echo', name: '余韻', owner: 'seil', branch: '干渉', sp: 1, lv: 4, passive: true, desc: '因果編集が成立するたび、敵全体に編集能力に応じた小ダメージ。' },
  { id: 's_link', name: '連携指示', owner: 'seil', branch: '干渉', sp: 2, lv: 5, req: 's_strike', ap: 3, target: 'ally', desc: '味方1人のこのターンの攻撃の威力を1.6倍にする。' },
  // ドラン
  { id: 'd_smash', name: '重撃', owner: 'dran', branch: '干渉', sp: 0, ap: 3, target: 'enemy', desc: '威力1.8倍の攻撃。' },
  { id: 'd_break', name: '崩し', owner: 'dran', branch: '干渉', sp: 1, ap: 3, target: 'enemy', desc: '敵の強化と溜めを解除し、2ターン「崩れ」状態にする（威力0.8倍）。' },
  { id: 'd_guard', name: '庇う', owner: 'dran', branch: '干渉', sp: 1, lv: 4, ap: 2, target: 'self', desc: 'このターン、仲間への単体攻撃を引き受け、防御が上がる。' },
  { id: 'd_wound', name: '裂傷', owner: 'dran', branch: '干渉', sp: 1, lv: 5, ap: 3, target: 'enemy', desc: '攻撃し、3ターン継続ダメージを与える。' },
  { id: 'd_followup', name: '追撃', owner: 'dran', branch: '干渉', sp: 2, lv: 6, passive: true, desc: '敵の行動が「条件不成立」で失敗したとき、ドランがその敵に追撃する。' },
  { id: 'd_veteran', name: '歴戦', owner: 'dran', branch: '観測', sp: 1, lv: 4, passive: true, desc: '最大HP+20%。戦場の違和感に気づき、観測+3。' },
  { id: 'd_interrupt', name: '割り込み', owner: 'dran', branch: '編纂', sp: 2, lv: 7, ap: 4, target: 'enemy', desc: '敵1体のこのターンの行動を次のターンに押し出す（行動順の変更）。' },
];

export const SKILL_MAP = new Map(SKILLS.map(s => [s.id, s]));
export const START_SKILLS: Record<CharId, string[]> = { seil: [], dran: ['d_smash'] };
