// 一日の時間の流れと、それに合わせた光の色・強さ
import * as THREE from 'three';

interface Key { h: number; sun: string; sunI: number; sky: string; ground: string; hemiI: number; bg: string; fog: string; warm: number; glow: number; water: number }

const KEYS: Key[] = [
  { h: 0, sun: '#8fa4ff', sunI: 0.45, sky: '#34457a', ground: '#1c2233', hemiI: 0.75, bg: '#16203a', fog: '#1b2540', warm: -0.2, glow: 1.6, water: 0.45 },
  { h: 5, sun: '#8fa4ff', sunI: 0.45, sky: '#34457a', ground: '#1c2233', hemiI: 0.75, bg: '#1b2542', fog: '#202a48', warm: -0.2, glow: 1.6, water: 0.45 },
  { h: 6.3, sun: '#ffb08a', sunI: 1.3, sky: '#b5b9d8', ground: '#5a5236', hemiI: 0.9, bg: '#e7c3b0', fog: '#e2c7b8', warm: 0.6, glow: 0.9, water: 0.75 },
  { h: 8.5, sun: '#fff0d4', sunI: 2.7, sky: '#cfe6ff', ground: '#71834a', hemiI: 1.2, bg: '#bfe3f5', fog: '#cfe6ee', warm: 0.25, glow: 0.5, water: 1 },
  { h: 13, sun: '#fff6e8', sunI: 3.0, sky: '#d6ecff', ground: '#77894c', hemiI: 1.25, bg: '#bfe3f5', fog: '#d3e9f0', warm: 0.15, glow: 0.45, water: 1 },
  { h: 16.5, sun: '#ffdca8', sunI: 2.6, sky: '#d9e2f2', ground: '#7a7a48', hemiI: 1.15, bg: '#d6dfe6', fog: '#e2ddd0', warm: 0.55, glow: 0.5, water: 0.95 },
  { h: 18.3, sun: '#ff9157', sunI: 1.6, sky: '#d4a5a8', ground: '#5e4636', hemiI: 0.95, bg: '#f0b08e', fog: '#e9b49a', warm: 0.9, glow: 1.0, water: 0.8 },
  { h: 19.6, sun: '#9a8cff', sunI: 0.55, sky: '#4c4f86', ground: '#2a2638', hemiI: 0.8, bg: '#2e3360', fog: '#30365e', warm: 0.1, glow: 1.5, water: 0.55 },
  { h: 24, sun: '#8fa4ff', sunI: 0.45, sky: '#34457a', ground: '#1c2233', hemiI: 0.75, bg: '#16203a', fog: '#1b2540', warm: -0.2, glow: 1.6, water: 0.45 },
];

const ca = new THREE.Color(), cb = new THREE.Color();
function lerpCol(a: string, b: string, t: number, out: THREE.Color) { return out.copy(ca.set(a)).lerp(cb.set(b), t); }

export class TimeOfDay {
  /** 時刻 0〜24 */
  clock = 9.5;
  day = 1;
  speed = 1 / 45; // ゲーム内 1 時間 = 45 秒
  readonly sunColor = new THREE.Color();
  readonly sky = new THREE.Color();
  readonly ground = new THREE.Color();
  readonly bg = new THREE.Color();
  readonly fog = new THREE.Color();
  sunI = 3; hemiI = 1.2; warm = 0; glow = 0.5; water = 1;
  readonly sunDir = new THREE.Vector3(0.5, 0.8, 0.3);

  update(dt: number) {
    const fast = this.clock > 21 || this.clock < 5 ? 2.2 : 1;
    this.clock += dt * this.speed * fast;
    if (this.clock >= 24) { this.clock -= 24; this.day++; }
    this.apply();
  }

  apply() {
    const h = this.clock;
    let i = 0;
    while (i < KEYS.length - 2 && KEYS[i + 1].h <= h) i++;
    const a = KEYS[i], b = KEYS[i + 1];
    const t = THREE.MathUtils.smoothstep(h, a.h, b.h);
    lerpCol(a.sun, b.sun, t, this.sunColor);
    lerpCol(a.sky, b.sky, t, this.sky);
    lerpCol(a.ground, b.ground, t, this.ground);
    lerpCol(a.bg, b.bg, t, this.bg);
    lerpCol(a.fog, b.fog, t, this.fog);
    this.sunI = a.sunI + (b.sunI - a.sunI) * t;
    this.hemiI = a.hemiI + (b.hemiI - a.hemiI) * t;
    this.warm = a.warm + (b.warm - a.warm) * t;
    this.glow = a.glow + (b.glow - a.glow) * t;
    this.water = a.water + (b.water - a.water) * t;
    // 太陽（夜は月）の方向：東から昇り西へ。影が手前へ伸びすぎない角度に保つ
    const day = h >= 6 && h <= 19;
    const u = day ? (h - 6) / 13 : ((h + 24 - 19) % 24) / 11;
    const az = -0.9 + u * 1.8;
    const el = day ? 0.55 + Math.sin(u * Math.PI) * 0.55 : 0.9;
    this.sunDir.set(Math.sin(az) * Math.cos(el), Math.sin(el), -0.35 + Math.cos(az) * Math.cos(el) * 0.5).normalize();
  }

  /** 夜の度合い（0〜1） */
  get night() {
    const h = this.clock;
    if (h >= 20 || h < 5) return 1;
    if (h >= 18.3) return (h - 18.3) / 1.7;
    if (h < 6.5) return 1 - (h - 5) / 1.5;
    return 0;
  }

  label() {
    const h = Math.floor(this.clock), m = Math.floor((this.clock % 1) * 60);
    const part = h < 5 ? 'よる' : h < 10 ? 'あさ' : h < 16 ? 'ひる' : h < 19 ? 'ゆうがた' : 'よる';
    return `${this.day}にちめ ${part} ${h}:${String(m).padStart(2, '0')}`;
  }
}
