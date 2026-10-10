// 3D モデルからアイテムアイコン・顔アイコンを描き出す（UI と見た目をそろえる）
import * as THREE from 'three';
import { itemObject } from './ItemModels';
import { charMat } from './Materials';

export class IconRenderer {
  private scene = new THREE.Scene();
  private cam = new THREE.PerspectiveCamera(30, 1, 0.01, 50);
  private rt: THREE.WebGLRenderTarget;
  private buf: Uint8Array;
  private canvas = document.createElement('canvas');

  constructor(private r: THREE.WebGLRenderer, private size = 128) {
    this.rt = new THREE.WebGLRenderTarget(size, size, { samples: 4 });
    this.rt.texture.colorSpace = THREE.SRGBColorSpace;
    this.buf = new Uint8Array(size * size * 4);
    this.canvas.width = this.canvas.height = size;
    this.scene.add(new THREE.HemisphereLight('#fff8ee', '#a08870', 2.2));
    const d = new THREE.DirectionalLight('#ffffff', 2.4);
    d.position.set(1.5, 3, 2.5);
    this.scene.add(d);
  }

  render(obj: THREE.Object3D, view: 'item' | 'face' = 'item'): string {
    this.scene.add(obj);
    obj.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(obj);
    const c = box.getCenter(new THREE.Vector3());
    const s = box.getSize(new THREE.Vector3());
    const r = Math.max(s.x, s.y, s.z) * (view === 'face' ? 0.5 : 0.62);
    const dist = r / Math.tan(THREE.MathUtils.degToRad(15));
    if (view === 'face') this.cam.position.set(c.x + dist * 0.2, c.y + dist * 0.05, c.z + dist);
    else this.cam.position.set(c.x + dist * 0.45, c.y + dist * 0.55, c.z + dist * 0.75);
    this.cam.lookAt(c);
    const prev = this.r.getRenderTarget();
    const tm = this.r.toneMapping;
    this.r.setRenderTarget(this.rt);
    this.r.setClearColor(0x000000, 0);
    this.r.clear();
    this.r.render(this.scene, this.cam);
    this.r.readRenderTargetPixels(this.rt, 0, 0, this.size, this.size, this.buf);
    this.r.setRenderTarget(prev);
    this.r.toneMapping = tm;
    this.scene.remove(obj);
    const g = this.canvas.getContext('2d')!;
    const img = g.createImageData(this.size, this.size);
    for (let y = 0; y < this.size; y++) {
      const src = (this.size - 1 - y) * this.size * 4;
      img.data.set(this.buf.subarray(src, src + this.size * 4), y * this.size * 4);
    }
    g.putImageData(img, 0, 0);
    return this.canvas.toDataURL('image/png');
  }

  item(id: string) { return this.render(itemObject(id, charMat)); }

  dispose() { this.rt.dispose(); }
}
