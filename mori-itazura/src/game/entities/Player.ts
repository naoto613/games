// 主人公：見た目（衣装・持っている物）と行動状態
import * as THREE from 'three';
import { Character } from './Character';
import { buildCritter, buildOutfit, CRITTER_CLIPS, CritterAnim } from './CritterModel';
import { itemObject } from '../render/ItemModels';
import { charMat } from '../render/Materials';

export class Player extends Character<CritterAnim> {
  sneaking = false;
  running = false;
  hidden = false;
  hideSpot: string | null = null;
  underTable = false;
  inBoat = false;
  insideCabin = false;
  outfitId = 'none';
  heldItem: string | null = null;
  actionTimer = 0;            // 一時的な動作中は移動できない
  private actionDone: (() => void) | null = null;
  recentTheft = 0;            // 盗んだ直後（秒）
  invuln = 0;                 // つかまった直後の無敵時間
  hunger = 70;
  private outfitObjs: THREE.Object3D[] = [];
  private heldObj: THREE.Object3D | null = null;
  seenTimer = 0;              // 誰かに見られている時間
  emote: THREE.Sprite | null = null;

  constructor() {
    super(buildCritter(), CRITTER_CLIPS, 'idle', 0.75);
    this.height = 0.8;
    this.stride = 0.3;
  }

  get busy() { return this.actionTimer > 0; }

  playAction(a: CritterAnim, dur: number, done?: () => void) {
    this.anim.play(a, 0.12);
    this.anim.stateTime = 0;
    this.actionTimer = dur;
    this.actionDone = done ?? null;
  }

  tickAction(dt: number) {
    if (this.actionTimer > 0) {
      this.actionTimer -= dt;
      if (this.actionTimer <= 0) {
        this.actionTimer = 0;
        const d = this.actionDone; this.actionDone = null;
        d?.();
      }
    }
  }

  setOutfit(id: string) {
    for (const o of this.outfitObjs) o.removeFromParent();
    this.outfitObjs = [];
    this.outfitId = id;
    if (id === 'none') return;
    const o = buildOutfit(id);
    if (o.hat) { this.rig.joints.hatSlot.add(o.hat); this.outfitObjs.push(o.hat); }
    if (o.face) { this.rig.joints.faceSlot.add(o.face); this.outfitObjs.push(o.face); }
    if (o.body) { this.rig.joints.bodySlot.add(o.body); this.outfitObjs.push(o.body); }
  }

  setHeld(itemId: string | null) {
    if (this.heldItem === itemId) return;
    this.heldObj?.removeFromParent();
    this.heldObj = null;
    this.heldItem = itemId;
    if (!itemId) return;
    const o = itemObject(itemId, charMat);
    if (itemId === 'fishing_rod') { o.rotation.set(0, Math.PI / 2, 0.9); o.position.set(0.12, 0, 0); }
    else o.scale.setScalar(itemId === 'teddy_bear' ? 1.2 : 1.4);
    this.rig.joints.holdSlot.add(o);
    this.heldObj = o;
  }
}
