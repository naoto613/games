// 3D 空間上のキャラクターの上に出す吹き出し（DOM）。毎フレームの位置計算はエンジン側で行う。
import * as THREE from 'three';

interface Bubble { el: HTMLDivElement; anchor: () => { x: number; y: number; z: number }; until: number }

export class Bubbles {
  private list: Bubble[] = [];
  private v = new THREE.Vector3();
  constructor(private root: HTMLElement) {}

  say(anchor: () => { x: number; y: number; z: number }, text: string, sec: number, now: number, kind: 'say' | 'think' | 'shout' = 'say') {
    // 同じ人の古い吹き出しは消す
    for (const b of this.list) if (b.anchor === anchor) b.until = 0;
    const el = document.createElement('div');
    el.className = 'bubble ' + kind;
    el.textContent = text;
    this.root.appendChild(el);
    this.list.push({ el, anchor, until: now + sec });
    if (this.list.length > 6) this.list[0].until = 0;
  }

  update(now: number, camera: THREE.Camera, w: number, h: number) {
    this.list = this.list.filter((b) => {
      if (now > b.until) { b.el.remove(); return false; }
      const a = b.anchor();
      this.v.set(a.x, a.y + 0.25, a.z).project(camera);
      const x = (this.v.x * 0.5 + 0.5) * w, y = (-this.v.y * 0.5 + 0.5) * h;
      const off = this.v.z > 1;
      b.el.style.display = off ? 'none' : 'block';
      b.el.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px) translate(-50%, -100%)`;
      b.el.style.opacity = String(Math.min(1, (b.until - now) * 3));
      return true;
    });
  }

  clear() { for (const b of this.list) b.el.remove(); this.list = []; }
}
