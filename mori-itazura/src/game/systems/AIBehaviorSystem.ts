// NPC の行動（設計書 8）：日常のルーチンと、警戒・調査・追跡・帰還の状態遷移
import type { NPC } from '../entities/NPC';
import type { Player } from '../entities/Player';
import type { NavGrid } from '../world/NavGrid';
import type { GameContext } from '../core/Context';
import type { CampsiteObjects } from '../world/CampsiteObjects';
import { SuspicionSystem, SUSPICION } from './SuspicionSystem';
import { groundY } from '../world/Terrain';
import { CAMPSITE as L } from '../content/areas/campsite';
import { disguiseModifier } from '../content/characters/npcs';
import type { HumanAnim } from '../entities/HumanModel';

const rnd = (a: number, b: number) => a + Math.random() * (b - a);

export class AIBehaviorSystem {
  onCatch: ((n: NPC) => void) | null = null;
  private wanderT = new Map<string, { x: number; z: number; pause: number }>();

  constructor(private nav: NavGrid, private sus: SuspicionSystem, private ctx: () => GameContext, private objects: CampsiteObjects) {}

  witnesses(npcs: NPC[]) { return npcs.filter((n) => n.seesPlayer).map((n) => n.id); }

  update(dt: number, npcs: NPC[], p: Player, night: number) {
    for (const n of npcs) this.updateOne(dt, n, p, night, npcs);
  }

  private updateOne(dt: number, n: NPC, p: Player, night: number, all: NPC[]) {
    const c = this.ctx();
    n.stateTimer += dt;
    n.callCooldown -= dt; n.alertCooldown -= dt; n.repathTimer -= dt;
    n.sawTheft = Math.max(0, n.sawTheft - dt);

    if (n.talking) {
      n.speed = 0;
      n.turnTowards(Math.atan2(p.pos.x - n.pos.x, p.pos.z - n.pos.z), dt, 6);
      n.anim.play(n.seated ? (n.def.id === 'fisher' ? 'fish' : 'sit') : 'talk');
      this.place(n);
      n.updateIndicator('');
      return;
    }

    // 視界
    const v = this.sus.vision(n, p, night);
    n.seesPlayer = v.seen;
    const role = n.def.role;
    const dist = Math.hypot(p.pos.x - n.pos.x, p.pos.z - n.pos.z);
    if (v.seen) { n.lastSeen.x = p.pos.x; n.lastSeen.z = p.pos.z; }

    // 警戒度
    if (v.seen && role !== 'kid' && p.invuln <= 0) {
      const nearFood = role === 'family' && Math.hypot(p.pos.x - L.picnic.table1.pos[0], p.pos.z - L.picnic.table1.pos[1]) < 3.2;
      n.suspicion += this.sus.rate(n, p, v.d, v.range ?? n.def.vision.range, nearFood) * dt;
      n.lostTimer = 0;
    } else if (n.state !== 'Chasing') {
      n.lostTimer += dt;
      if (n.lostTimer > 1.5) n.suspicion -= (n.state === 'Investigating' ? 5 : 9) * dt;
    }
    n.suspicion = Math.max(0, Math.min(100, n.suspicion));

    // 子どもは どうぶつが だいすき
    if (role === 'kid' && v.seen && dist < 6 && n.alertCooldown <= 0 && !c.isDisguised()) {
      n.alertCooldown = 14;
      c.say(n, c.state.flag('teddy_returned') ? 'あっ、ともだちの どうぶつさん！' : 'わあ、どうぶつさんだ！', 2.5);
    }
    // 変装中のあいさつ
    if (role !== 'kid' && v.seen && dist < 3 && n.suspicion < 15 && c.isDisguised() && n.alertCooldown <= 0 && disguiseModifier(p.outfitId, role) < 0.5 && !n.seated) {
      n.alertCooldown = 30;
      c.say(n, ['こんにちは！', 'いい てんきだね', 'やあ、キャンパーさん'][Math.floor(Math.random() * 3)], 2);
    }

    // 状態ごとの処理
    switch (n.state) {
      case 'Idle': case 'Walking': case 'Interacting':
        if (n.suspicion >= SUSPICION.normal) this.enter(n, 'Suspicious');
        else this.routine(dt, n);
        break;
      case 'Suspicious': {
        n.speed = 0;
        if (n.suspicion >= SUSPICION.alert && n.seated) { n.seated = false; n.showProp(n.def.id !== 'mom'); }
        n.turnTowards(Math.atan2(n.lastSeen.x - n.pos.x, n.lastSeen.z - n.pos.z), dt, 5);
        n.anim.play(n.seated ? (n.anim.state === 'sitEat' || n.anim.state === 'read' || n.anim.state === 'strum' || n.anim.state === 'fish' ? n.anim.state : 'sit') : v.seen ? 'idle' : 'lookAround');
        if (n.stateTimer < 0.05 && role !== 'kid' && !c.isDisguised()) c.say(n, n.def.greet, 2, 'think');
        if (n.suspicion >= SUSPICION.chase) this.react(n, p, all);
        else if (n.suspicion >= SUSPICION.alert && n.stateTimer > 0.7 && (n.def.chase) && !v.seen) this.enter(n, 'Investigating');
        else if (n.suspicion < 12) this.enter(n, n.seated ? 'Interacting' : 'Returning');
        break;
      }
      case 'Investigating': {
        const arrived = this.moveTo(n, n.lastSeen.x, n.lastSeen.z, n.def.walkSpeed * 1.25, dt, 0.8);
        if (arrived) { n.speed = 0; n.anim.play('search'); }
        if (n.suspicion >= SUSPICION.chase && v.seen) this.react(n, p, all);
        else if ((arrived && n.stateTimer > 7) || n.stateTimer > 16 || n.suspicion < 10) {
          n.suspicion = Math.min(n.suspicion, 25);
          this.enter(n, 'Returning');
        }
        break;
      }
      case 'Chasing': {
        if (v.seen) n.lostTimer = 0; else n.lostTimer += dt;
        const leash = n.def.leash;
        const outOfLeash = leash && Math.hypot(n.pos.x - leash.center[0], n.pos.z - leash.center[1]) > leash.radius;
        const unreachable = p.inBoat;
        if (n.lostTimer > 3.2 || outOfLeash || (unreachable && n.stateTimer > 1.5)) {
          c.say(n, outOfLeash ? 'まったく、すばしっこい やつめ…' : unreachable ? 'ボートで にげるとは…！' : 'どこへ いった…？', 2.5, 'think');
          n.suspicion = 55;
          c.bus.emit('player:escaped', { npcId: n.id });
          this.enter(n, outOfLeash ? 'Returning' : 'Investigating');
          break;
        }
        const tx = v.seen ? p.pos.x : n.lastSeen.x, tz = v.seen ? p.pos.z : n.lastSeen.z;
        this.moveTo(n, tx, tz, n.def.runSpeed * (p.hunger < 12 ? 1.05 : 1), dt, 0.1, true);
        if (dist < 0.9 && p.invuln <= 0 && !p.inBoat && !p.hidden) this.onCatch?.(n);
        break;
      }
      case 'Returning': {
        const a = this.anchor(n);
        if (this.moveTo(n, a.x, a.z, n.def.walkSpeed, dt, 0.4)) { n.suspicion = Math.min(n.suspicion, 10); this.enter(n, 'Idle'); n.taskStarted = false; }
        if (n.suspicion >= SUSPICION.normal + 5 && v.seen) this.enter(n, 'Suspicious');
        break;
      }
    }

    // 扉を開ける（レンジャー）
    if (n.def.role === 'ranger') {
      const dx = n.pos.x - L.cabin.pos[0], dz = n.pos.z - (L.cabin.pos[1] + L.cabin.d / 2);
      if (Math.abs(dx) < 0.9 && Math.abs(dz) < 1.1 && !this.objects.isDoorOpen(c)) {
        this.objects.openDoorFor(c);
        c.noise(n.pos.x, n.pos.z, 3);
      }
    }

    // 家族はバスケットの中身が減ったことに気づく
    if (role === 'family' && n.seated) {
      const b = c.state.obj<Record<string, number>>('basket') ?? {};
      const t = Object.values(b).reduce((x, y) => x + y, 0) + (c.state.obj<number>('plate') ?? 0) + (c.state.obj<number>('blanketApples') ?? 0);
      if (n.knownFood >= 0 && t < n.knownFood && !v.seen) {
        c.say(n, 'あれっ？ ごはんが へってる！', 2.6, 'shout');
        n.suspicion = Math.max(n.suspicion, 42);
        n.lastSeen.x = L.picnic.table1.pos[0]; n.lastSeen.z = L.picnic.table1.pos[1] + 1.5;
        n.anim.play('surprise');
        this.enter(n, 'Suspicious');
      }
      n.knownFood = t;
    }

    this.place(n);
    const ind = n.state === 'Chasing' || n.suspicion >= SUSPICION.chase ? '!' : n.suspicion >= SUSPICION.normal || n.state === 'Investigating' ? '?' : role === 'kid' && v.seen && dist < 6 ? 'heart' : '';
    n.updateIndicator(ind);
  }

  private enter(n: NPC, s: NPC['state']) {
    if (n.state === s) return;
    if (s !== 'Interacting' && s !== 'Suspicious' && n.seated) { n.seated = false; }
    if (s === 'Investigating' || s === 'Chasing' || s === 'Returning') { n.path = []; n.pathTarget = null; n.seated = false; }
    n.state = s;
    n.stateTimer = 0;
  }

  /** 警戒が最大になったときの反応 */
  private react(n: NPC, p: Player, all: NPC[]) {
    const c = this.ctx();
    if (n.def.chase) {
      if (n.state !== 'Chasing') {
        c.say(n, n.def.greet, 2.2, 'shout');
        c.bus.emit('npc:chase', { npcId: n.id });
        this.enter(n, 'Chasing');
        n.lostTimer = 0;
        if (!p.busy && !p.inBoat) p.playAction('surprise', 0.5);
      }
      return;
    }
    if (n.def.callsRanger && n.callCooldown <= 0) {
      n.callCooldown = 15;
      c.say(n, 'レンジャーさーん！ どうぶつが いるよー！', 2.8, 'shout');
      n.anim.play('call');
      this.alertRanger(all, n.lastSeen.x, n.lastSeen.z);
      n.suspicion = 60;
      return;
    }
    if (n.def.role === 'shop' && n.callCooldown <= 0) {
      n.callCooldown = 10;
      c.say(n, 'しっしっ！ どうぶつは おことわり！', 2.5, 'shout');
      n.suspicion = 55;
      return;
    }
    if (n.def.role === 'fisher' && n.callCooldown <= 0) {
      n.callCooldown = 20;
      c.say(n, 'おやおや… いたずらは ほどほどにな', 2.5);
      n.suspicion = 30;
    }
  }

  alertRanger(all: NPC[], x: number, z: number) {
    const r = all.find((m) => m.def.role === 'ranger');
    if (!r || r.state === 'Chasing') return;
    r.suspicion = Math.max(r.suspicion, 62);
    r.lastSeen.x = x; r.lastSeen.z = z;
    r.seated = false;
    this.enter(r, 'Investigating');
    this.ctx().say(r, 'なにっ！ いま いく！', 2);
  }

  /** 物音への反応 */
  onNoise(npcs: NPC[], x: number, z: number, radius: number, outfitId: string) {
    for (const n of npcs) {
      const d = Math.hypot(n.pos.x - x, n.pos.z - z);
      if (d > radius || n.def.role === 'kid' || n.state === 'Chasing') continue;
      const mod = Math.max(0.45, disguiseModifier(outfitId, n.def.role));
      n.suspicion = Math.min(100, n.suspicion + 22 * (1 - d / radius) * mod);
      n.lastSeen.x = x; n.lastSeen.z = z;
      if (n.suspicion >= SUSPICION.normal && (n.state === 'Idle' || n.state === 'Walking' || n.state === 'Interacting')) {
        this.enter(n, 'Suspicious');
        this.ctx().say(n, 'ん？ いまの おとは…', 1.8, 'think');
      }
    }
  }

  /** 盗むところを見られた */
  onTheft(npcs: NPC[], witnesses: string[], owners: string[], p: Player) {
    const c = this.ctx();
    for (const id of witnesses) {
      const n = npcs.find((m) => m.id === id);
      if (!n) continue;
      n.sawTheft = 4;
      n.lastSeen.x = p.pos.x; n.lastSeen.z = p.pos.z;
      if (n.def.role === 'kid') {
        c.say(n, 'あー！ どうぶつさんが ごはん とってるー！', 2.6, 'shout');
        for (const m of npcs) if (m.def.role === 'family') {
          m.suspicion = Math.max(m.suspicion, 70);
          m.lastSeen.x = p.pos.x; m.lastSeen.z = p.pos.z;
          if (m.state !== 'Chasing') this.enter(m, 'Suspicious');
        }
        continue;
      }
      const owner = owners.includes(id) || n.def.role === 'ranger';
      n.suspicion = Math.max(n.suspicion, owner ? 92 : 70);
      if (n.state !== 'Chasing') this.enter(n, 'Suspicious');
      if (n.suspicion >= SUSPICION.chase) this.react(n, p, npcs);
      else c.say(n, 'いま… なにか とった？', 2, 'think');
    }
  }

  // ───────── ルーチン ─────────
  private routine(dt: number, n: NPC) {
    const R = n.def.routine;
    const task = R[n.routineIndex % R.length];
    const c = this.ctx();
    if (!n.taskStarted) {
      n.taskStarted = true;
      n.taskTimer = 'dur' in task ? rnd(task.dur[0], task.dur[1]) : 0;
      n.path = []; n.pathTarget = null;
      if (task.do !== 'sit') { n.seated = false; n.showProp(n.def.id === 'camper' || n.def.id === 'fisher' ? false : true); }
      if (task.do === 'wander') this.wanderT.delete(n.id);
    }
    const next = () => { n.routineIndex = (n.routineIndex + 1) % R.length; n.taskStarted = false; };
    switch (task.do) {
      case 'goto':
        n.state = 'Walking';
        if (this.moveTo(n, task.to[0], task.to[1], task.run ? n.def.runSpeed : n.def.walkSpeed, dt, 0.3)) next();
        break;
      case 'sit':
        if (!n.seated) {
          n.state = 'Walking';
          if (this.moveTo(n, task.at[0], task.at[1], n.def.walkSpeed, dt, 0.08)) {
            n.seated = true;
            n.pos.x = task.at[0]; n.pos.z = task.at[1];
            n.showProp(true);
          }
        } else {
          n.state = 'Interacting';
          n.speed = 0;
          n.turnTowards(task.face, dt, 6);
          n.anim.play(task.anim, 0.35);
          n.taskTimer -= dt;
          if (n.taskTimer <= 0) { n.seated = false; next(); }
        }
        break;
      case 'idle': {
        n.state = 'Interacting';
        n.speed = 0;
        if (task.face !== undefined) n.turnTowards(task.face, dt, 5);
        let a: HumanAnim = task.anim;
        if (a === 'sad' && c.state.flag('teddy_returned')) a = 'wave';
        n.anim.play(a, 0.3);
        n.taskTimer -= dt;
        if (n.taskTimer <= 0) next();
        break;
      }
      case 'wander': {
        n.taskTimer -= dt;
        let w = this.wanderT.get(n.id);
        if (!w) {
          for (let k = 0; k < 10; k++) {
            const a = Math.random() * Math.PI * 2, r = Math.random() * task.radius;
            const x = task.center[0] + Math.cos(a) * r, z = task.center[1] + Math.sin(a) * r;
            if (this.nav.walkable(x, z)) { w = { x, z, pause: rnd(0.8, 2.2) }; break; }
          }
          if (!w) w = { x: n.pos.x, z: n.pos.z, pause: 1 };
          this.wanderT.set(n.id, w);
        }
        n.state = 'Walking';
        const kidRun = n.def.role === 'kid' && Math.random() < 0.002;
        if (this.moveTo(n, w.x, w.z, kidRun ? n.def.runSpeed : n.def.walkSpeed * 1.1, dt, 0.3)) {
          n.speed = 0;
          n.anim.play(n.def.role === 'kid' && c.state.flag('teddy_returned') ? 'cheer' : 'idle', 0.3);
          w.pause -= dt;
          if (w.pause <= 0) this.wanderT.delete(n.id);
        }
        if (n.taskTimer <= 0) next();
        break;
      }
      case 'door':
        next();
        break;
    }
  }

  /** ルーチンに戻るときの目標地点 */
  private anchor(n: NPC) {
    const R = n.def.routine;
    for (let k = 0; k < R.length; k++) {
      const t = R[(n.routineIndex + k) % R.length];
      if (t.do === 'goto') return { x: t.to[0], z: t.to[1] };
      if (t.do === 'sit') return { x: t.at[0], z: t.at[1] };
      if (t.do === 'wander') return { x: t.center[0], z: t.center[1] };
    }
    return { x: n.def.start[0], z: n.def.start[1] };
  }

  /** 経路にそって移動。着いたら true */
  private moveTo(n: NPC, tx: number, tz: number, speed: number, dt: number, arrive: number, chase = false): boolean {
    const d = Math.hypot(tx - n.pos.x, tz - n.pos.z);
    if (d <= arrive) { n.speed = 0; return true; }
    const needPath = !n.pathTarget || Math.hypot(n.pathTarget.x - tx, n.pathTarget.z - tz) > (chase ? 0.4 : 0.6) || (chase && n.repathTimer <= 0);
    if (needPath) {
      n.path = this.nav.find(n.pos.x, n.pos.z, tx, tz, chase ? 6000 : 12000) ?? [{ x: tx, z: tz }];
      n.pathTarget = { x: tx, z: tz };
      n.repathTimer = chase ? 0.35 : 3;
    }
    let step = speed * dt;
    while (step > 0 && n.path.length) {
      const t = n.path[0];
      const ex = t.x - n.pos.x, ez = t.z - n.pos.z;
      const l = Math.hypot(ex, ez);
      if (l < 0.05) { n.path.shift(); continue; }
      const s = Math.min(step, l);
      n.pos.x += (ex / l) * s; n.pos.z += (ez / l) * s;
      n.turnTowards(Math.atan2(ex, ez), dt, chase ? 12 : 8);
      step -= s;
      if (s >= l - 1e-4) n.path.shift();
    }
    n.speed = speed;
    n.stride = speed > 2.4 ? 0.9 : 0.45;
    n.anim.play(n.state === 'Chasing' ? 'chase' : speed > 2.4 ? 'run' : 'walk', 0.2);
    if (!n.path.length) { n.pathTarget = null; return Math.hypot(tx - n.pos.x, tz - n.pos.z) <= arrive + 0.05; }
    return false;
  }

  private place(n: NPC) {
    let y = groundY(n.pos.x, n.pos.z);
    const c = L.cabin;
    if (Math.abs(n.pos.x - c.pos[0]) < c.w / 2 && Math.abs(n.pos.z - c.pos[1]) < c.d / 2) y = 0.12;
    else if (Math.abs(n.pos.x - c.pos[0]) < c.w * 0.3 && n.pos.z > c.pos[1] + c.d / 2 && n.pos.z < c.pos[1] + c.d / 2 + 1.6) y = Math.max(y, 0.15);
    n.groundY = y;
    n.pos.y = y;
    n.indicator.position.set(n.pos.x, y + n.height + 0.45, n.pos.z);
  }
}
