import type { Resistances, StatusId, Tactic } from '../../data/types';

export type Side = 'ally' | 'enemy';

export type StatusState = { sleep: number; paralysis: number; confusion: number; poison: boolean };

export type Combatant = {
  key: string;
  side: Side;
  slot: number;
  instanceId?: string;
  speciesId: string;
  name: string;
  level: number;
  maxHp: number;
  hp: number;
  maxMp: number;
  mp: number;
  attack: number;
  defense: number;
  speed: number;
  wisdom: number;
  stages: { attack: number; defense: number; speed: number };
  status: StatusState;
  charged: boolean;
  defending: boolean;
  skills: string[];
  resist: Resistances;
  wildness: number;
  /** なかま化のための好感度（にくで上がる） */
  affection: number;
  recruitable: boolean;
  recruitBase: number;
  expYield: number;
  goldYield: number;
  distorted: boolean;
  /** このモンスターの作戦（未設定ならパーティ全体の作戦） */
  tactic?: Tactic;
  /** この戦闘で回復・蘇生を使った回数（敵の回復しすぎを防ぐ） */
  healsUsed: number;
  /** 特技ごとの使用回数（敵が同じ補助特技を連発しないように） */
  used: Record<string, number>;
  /** 状態異常にかかった回数（かかるほど耐性がつく） */
  statusHits: number;
};

export type BattleKind = 'wild' | 'boss' | 'arena';

export type BattleState = {
  kind: BattleKind;
  allies: Combatant[];
  enemies: Combatant[];
  turn: number;
  tactic: Tactic;
  enemyTactic: Tactic;
  escapeTries: number;
  canEscape: boolean;
  canUseItems: boolean;
  canRecruit: boolean;
  outcome: null | 'win' | 'lose' | 'escape';
  /** AIの判断理由（デバッグ用） */
  aiLog: string[];
};

export type AllyCommand =
  | { kind: 'auto' }
  | { kind: 'attack'; target: string }
  | { kind: 'skill'; skillId: string; target?: string }
  | { kind: 'defend' };

export type PlayerAction = { kind: 'none' } | { kind: 'item'; itemId: string; target: string } | { kind: 'escape' };

export type TurnInput = {
  /** auto: 作戦どおりに戦う / command: 1体ずつ命令する */
  mode: 'auto' | 'command';
  commands?: AllyCommand[];
  player: PlayerAction;
};

export type BattleEvent =
  | { t: 'msg'; text: string }
  | { t: 'act'; actor: string; skillId: string; text: string }
  | { t: 'damage'; target: string; amount: number; hp: number; crit?: boolean; weak?: boolean; text: string }
  | { t: 'heal'; target: string; amount: number; hp: number; text: string }
  | { t: 'mp'; target: string; mp: number; text?: string }
  | { t: 'faint'; target: string; text: string }
  | { t: 'revive'; target: string; hp: number; text: string }
  | { t: 'status'; target: string; status: StatusId | 'buff'; on: boolean; text: string }
  | { t: 'miss'; target: string; text: string }
  | { t: 'item'; itemId: string; text: string }
  | { t: 'end'; outcome: 'win' | 'lose' | 'escape'; text: string };

export type TurnResult = { state: BattleState; events: BattleEvent[]; itemsUsed: Record<string, number> };
