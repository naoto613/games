// NPC：状態（設計書 8.2）・警戒度・頭上の表示
import * as THREE from 'three';
import { Character } from './Character';
import { buildHuman, HUMAN_CLIPS, HumanAnim } from './HumanModel';
import type { NpcDef } from '../content/characters/npcs';

export type NpcState = 'Idle' | 'Walking' | 'Interacting' | 'Suspicious' | 'Investigating' | 'Chasing' | 'Returning';

export class NPC extends Character<HumanAnim> {
  state: NpcState = 'Idle';
  suspicion = 0;
  routineIndex = 0;
  taskTimer = 0;
  taskStarted = false;
  path: { x: number; z: number }[] = [];
  pathTarget: { x: number; z: number } | null = null;
  repathTimer = 0;
  lastSeen = { x: 0, z: 0 };
  lostTimer = 0;
  stateTimer = 0;
  seesPlayer = false;
  sawTheft = 0;
  seated = false;
  talking = false;
  callCooldown = 0;
  alertCooldown = 0;
  lookAt: number | null = null;
  knownFood = -1;
  readonly indicator: THREE.Sprite;
  private indCanvas: HTMLCanvasElement;
  private indTex: THREE.CanvasTexture;
  private indKey = '';
  private propObjs: THREE.Object3D[] = [];

  constructor(readonly def: NpcDef) {
    super(buildHuman(def.look), HUMAN_CLIPS, 'idle', 1.0);
    this.height = 1.62 * (def.look.scale ?? 1);
    this.stride = 0.45;
    this.pos.set(def.start[0], 0, def.start[1]);
    this.indCanvas = document.createElement('canvas');
    this.indCanvas.width = this.indCanvas.height = 128;
    this.indTex = new THREE.CanvasTexture(this.indCanvas);
    this.indTex.colorSpace = THREE.SRGBColorSpace;
    this.indicator = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.indTex, depthTest: false, transparent: true }));
    this.indicator.scale.set(0.75, 0.75, 1);
    this.indicator.renderOrder = 10;
    this.indicator.visible = false;
    this.addProps();
  }

  get id() { return this.def.id; }

  private addProps() {
    const J = this.rig.joints;
    const mk = (geo: THREE.BufferGeometry, color: string) => {
      const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color, roughness: 0.7 }));
      m.castShadow = true;
      return m;
    };
    if (this.def.id === 'camper') {
      const g = new THREE.Group();
      const body = mk(new THREE.SphereGeometry(1, 18, 12), '#c9853f'); body.scale.set(0.17, 0.05, 0.2); g.add(body);
      const body2 = mk(new THREE.SphereGeometry(1, 18, 12), '#c9853f'); body2.scale.set(0.13, 0.045, 0.14); body2.position.z = 0.2; g.add(body2);
      const hole = mk(new THREE.CylinderGeometry(0.04, 0.04, 0.02, 12), '#3a2210'); hole.position.set(0, 0.04, 0.1); g.add(hole);
      const neck = mk(new THREE.BoxGeometry(0.05, 0.03, 0.42), '#5a3a24'); neck.position.set(0, 0.02, 0.5); g.add(neck);
      g.position.set(0.05, 0.05, 0.2); g.rotation.set(0.1, -0.5, -0.3);
      J.spine.add(g);
      this.propObjs.push(g);
    } else if (this.def.id === 'fisher') {
      const rod = mk(new THREE.CylinderGeometry(0.008, 0.016, 2.2, 6), '#b38a4a');
      rod.position.set(0, 0.0, 0.9); rod.rotation.x = Math.PI / 2 - 0.45;
      J.handR.add(rod);
      this.propObjs.push(rod);
    } else if (this.def.id === 'mom') {
      const book = mk(new THREE.BoxGeometry(0.22, 0.03, 0.16), '#3d77c4');
      book.position.set(-0.08, -0.04, 0.06); book.rotation.set(0.6, 0, 0);
      J.handR.add(book);
      this.propObjs.push(book);
    }
  }

  showProp(v: boolean) { for (const p of this.propObjs) p.visible = v; }

  /** 頭上のマーク（? や !）と警戒ゲージ */
  updateIndicator(kind: '' | '?' | '!' | '♪' | '…' | 'heart') {
    const lvl = Math.round(this.suspicion / 10);
    const key = kind + lvl;
    if (key === this.indKey) return;
    this.indKey = key;
    this.indicator.visible = kind !== '';
    if (!kind) return;
    const g = this.indCanvas.getContext('2d')!;
    g.clearRect(0, 0, 128, 128);
    const red = kind === '!';
    const col = red ? '#e5483b' : kind === '?' ? '#f2a93b' : kind === 'heart' ? '#f07aa0' : '#5aa4d6';
    // 吹き出し
    g.fillStyle = 'rgba(0,0,0,0.18)';
    g.beginPath(); g.arc(64, 60, 40, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#fffaf0';
    g.beginPath(); g.arc(64, 56, 40, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.moveTo(52, 90); g.lineTo(64, 112); g.lineTo(76, 90); g.fill();
    if (kind === '?' || kind === '!') {
      g.lineWidth = 9; g.strokeStyle = 'rgba(0,0,0,0.08)';
      g.beginPath(); g.arc(64, 56, 34, 0, Math.PI * 2); g.stroke();
      g.strokeStyle = col; g.lineCap = 'round';
      g.beginPath(); g.arc(64, 56, 34, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.min(1, this.suspicion / 100)); g.stroke();
    }
    g.fillStyle = col;
    if (kind === 'heart') {
      g.beginPath();
      g.moveTo(64, 78); g.bezierCurveTo(30, 54, 44, 26, 64, 44); g.bezierCurveTo(84, 26, 98, 54, 64, 78); g.fill();
    } else {
      g.font = '900 54px "Hiragino Maru Gothic ProN", "Arial Rounded MT Bold", sans-serif';
      g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText(kind, 64, 59);
    }
    this.indTex.needsUpdate = true;
  }
}
