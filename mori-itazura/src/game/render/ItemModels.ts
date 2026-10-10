// アイテムの 3D モデル（ワールドに置くものと、UI のアイコン画像の両方に使う）
import * as THREE from 'three';
import { GeoBuilder, ColorFn } from './Geo';
import { buildOutfit } from '../entities/CritterModel';

const C = (h: string) => new THREE.Color(h);

export function itemBuilder(id: string): GeoBuilder {
  const b = new GeoBuilder();
  switch (id) {
    case 'apple':
      b.sphere(1, '#d8332b', { pos: [0, 0.075, 0], scale: [0.08, 0.072, 0.08] });
      b.cyl(0.006, 0.008, 0.05, '#5a3a24', { pos: [0, 0.16, 0] }, 5);
      b.sphere(1, '#5f9a35', { pos: [0.025, 0.16, 0], scale: [0.03, 0.008, 0.016], rot: [0, 0, 0.4] });
      break;
    case 'sandwich': {
      b.slab([[-0.1, 0], [0.1, 0], [0, 0.17]], 0.035, '#f0d9a7', { pos: [0, 0.02, 0.04], rot: [-Math.PI / 2, 0, 0] });
      b.slab([[-0.1, 0], [0.1, 0], [0, 0.17]], 0.02, '#f6c9c5', { pos: [0, 0.048, 0.04], rot: [-Math.PI / 2, 0, 0] });
      b.slab([[-0.105, 0], [0.105, 0], [0, 0.175]], 0.012, '#7fc24a', { pos: [0, 0.06, 0.04], rot: [-Math.PI / 2, 0, 0] });
      b.slab([[-0.1, 0], [0.1, 0], [0, 0.17]], 0.035, '#f0d9a7', { pos: [0, 0.082, 0.04], rot: [-Math.PI / 2, 0, 0] });
      break;
    }
    case 'cookie':
      b.cyl(0.07, 0.07, 0.025, '#d29a52', { pos: [0, 0.013, 0] }, 16);
      for (let i = 0; i < 5; i++) b.sphere(0.012, '#4a2a1a', { pos: [Math.cos(i * 1.3) * 0.04, 0.027, Math.sin(i * 1.3) * 0.04] }, 6, 4);
      break;
    case 'watermelon': {
      const rind: ColorFn = (p) => C(p.y < 0.025 ? '#2f7a2c' : p.y < 0.04 ? '#e8f2c8' : '#ee4a4f');
      b.slab([[-0.11, 0], [0.11, 0], [0, 0.14]], 0.05, rind, { pos: [0, 0, 0], rot: [0, 0, 0] });
      for (let i = 0; i < 4; i++) b.sphere(0.008, '#1d1d1d', { pos: [-0.04 + i * 0.027, 0.07 + (i % 2) * 0.015, 0.027] }, 5, 4);
      break;
    }
    case 'corn':
    case 'grilled_corn': {
      const g = id === 'grilled_corn';
      const ker: ColorFn = (p) => C((Math.floor(p.y * 90) + Math.floor(Math.atan2(p.z, p.x) * 3)) % 2 ? (g ? '#d99a2b' : '#f5cf3a') : (g ? '#b8771f' : '#efc12a'));
      b.capsule(0.04, 0.15, ker, { pos: [0, 0.045, 0], rot: [0, 0, Math.PI / 2] });
      if (!g) for (const s of [-1, 1]) b.sphere(1, '#8fbf4a', { pos: [-0.05, 0.045 + s * 0.03, 0], scale: [0.09, 0.02, 0.04], rot: [0, 0, s * 0.3] });
      break;
    }
    case 'onigiri':
      b.slab([[-0.075, 0], [0.075, 0], [0.04, 0.1], [0, 0.12], [-0.04, 0.1]], 0.05, '#fbfbf6', { pos: [0, 0, 0] });
      b.box(0.07, 0.05, 0.056, '#1f2e22', { pos: [0, 0.025, 0] }, 0.005);
      break;
    case 'marshmallow':
    case 'roasted_marshmallow': {
      const r = id === 'roasted_marshmallow';
      b.cyl(0.006, 0.006, 0.3, '#a37748', { pos: [0, 0.04, 0.1], rot: [Math.PI / 2, 0, 0] }, 5);
      for (let i = 0; i < 2; i++) b.cyl(0.035, 0.035, 0.05, r ? '#c98a3e' : '#fdf8f0', { pos: [0, 0.04, -0.02 - i * 0.055], rot: [Math.PI / 2, 0, 0] }, 12);
      break;
    }
    case 'juice':
      b.box(0.07, 0.12, 0.05, '#f2c14e', { pos: [0, 0.06, 0] }, 0.01);
      b.sphere(0.025, '#d8332b', { pos: [0, 0.07, 0.027], scale: [1, 1, 0.3] });
      b.cyl(0.004, 0.004, 0.06, '#ffffff', { pos: [0.02, 0.14, 0], rot: [0, 0, 0.2] }, 4);
      break;
    case 'fish':
    case 'big_fish':
    case 'grilled_fish': {
      const s = id === 'big_fish' ? 1.5 : 1;
      const col = id === 'grilled_fish' ? '#b98345' : id === 'big_fish' ? '#5f88a6' : '#7aa7c4';
      const belly: ColorFn = (p) => C(p.y < 0.04 * s ? (id === 'grilled_fish' ? '#d9b47a' : '#e8eef0') : col);
      b.sphere(1, belly, { pos: [0, 0.045 * s, 0], scale: [0.12 * s, 0.045 * s, 0.035 * s] });
      b.cone(0.045 * s, 0.07 * s, col, { pos: [-0.14 * s, 0.045 * s, 0], rot: [0, 0, Math.PI / 2], scale: [1, 1, 0.3] }, 8);
      b.sphere(0.01 * s, '#111111', { pos: [0.08 * s, 0.055 * s, 0.03 * s] }, 6, 4);
      break;
    }
    case 'fishing_rod':
      b.cyl(0.006, 0.012, 0.8, '#c99b57', { pos: [0, 0.03, 0], rot: [0, 0, Math.PI / 2 - 0.1] }, 6);
      b.cyl(0.03, 0.03, 0.025, '#3f6b8a', { pos: [-0.25, 0.06, 0.02], rot: [Math.PI / 2, 0, 0] }, 12);
      break;
    case 'treasure_map':
      b.box(0.2, 0.012, 0.15, '#e9d7a8', { pos: [0, 0.006, 0] }, 0.004);
      b.box(0.03, 0.002, 0.008, '#c0392b', { pos: [0.04, 0.014, 0.02], rot: [0, 0.7, 0] }, 0.001);
      b.box(0.03, 0.002, 0.008, '#c0392b', { pos: [0.04, 0.014, 0.02], rot: [0, -0.7, 0] }, 0.001);
      b.cyl(0.012, 0.012, 0.16, '#c9a96b', { pos: [-0.1, 0.012, 0], rot: [Math.PI / 2, 0, 0] }, 8);
      break;
    case 'litter':
      b.cyl(0.03, 0.03, 0.1, '#c94f3a', { pos: [0, 0.03, 0], rot: [0, 0, Math.PI / 2 + 0.2] }, 10);
      b.ico(0.04, '#ecebe4', { pos: [0.06, 0.03, 0.04], jitter: 0.5, seed: 3 }, 1);
      break;
    case 'shiny_stone':
      b.ico(0.06, (p) => C(p.y > 0.05 ? '#bff2ff' : p.x > 0 ? '#9ad3ff' : '#d6b8ff'), { pos: [0, 0.05, 0], scale: [1, 1.2, 1] }, 0);
      break;
    case 'feather':
      b.sphere(1, '#3f86d6', { pos: [0, 0.015, 0], scale: [0.025, 0.008, 0.11], rot: [0, 0.4, 0] });
      b.cyl(0.003, 0.003, 0.24, '#e8e8e8', { pos: [0, 0.02, 0], rot: [Math.PI / 2, 0.4, 0] }, 4);
      break;
    case 'pinecone':
      for (let i = 0; i < 4; i++) b.cone(0.05 - i * 0.008, 0.05, i % 2 ? '#8a5a32' : '#a06c3c', { pos: [0, 0.03 + i * 0.03, 0], rot: [Math.PI, 0, 0] }, 9);
      break;
    case 'bottle_cap':
      b.cyl(0.03, 0.03, 0.012, '#d9d4c7', { pos: [0, 0.006, 0] }, 14);
      b.cyl(0.02, 0.02, 0.003, '#d8332b', { pos: [0, 0.013, 0] }, 12);
      break;
    case 'old_coin':
      b.cyl(0.04, 0.04, 0.01, '#c9ccd2', { pos: [0, 0.006, 0] }, 18);
      b.torus(0.032, 0.004, '#9da2aa', { pos: [0, 0.012, 0], rot: [Math.PI / 2, 0, 0] }, Math.PI * 2, 4, 16);
      break;
    case 'old_boot':
      b.box(0.08, 0.18, 0.09, '#2f5f4a', { pos: [0, 0.09, 0] }, 0.02);
      b.box(0.08, 0.06, 0.16, '#2f5f4a', { pos: [0, 0.03, 0.04] }, 0.025);
      break;
    case 'golden_acorn':
      b.sphere(1, '#f2c430', { pos: [0, 0.07, 0], scale: [0.06, 0.075, 0.06] });
      b.sphere(1, '#c58a1e', { pos: [0, 0.11, 0], scale: [0.068, 0.04, 0.068] });
      b.cyl(0.008, 0.008, 0.035, '#c58a1e', { pos: [0, 0.15, 0] }, 6);
      break;
    case 'teddy_bear': {
      const f = '#b9844f';
      b.sphere(1, f, { pos: [0, 0.1, 0], scale: [0.08, 0.09, 0.07] });
      b.sphere(0.075, f, { pos: [0, 0.22, 0.01] });
      for (const s of [-1, 1]) {
        b.sphere(0.03, f, { pos: [s * 0.055, 0.28, 0] });
        b.sphere(1, f, { pos: [s * 0.08, 0.12, 0.02], scale: [0.03, 0.05, 0.03] });
        b.sphere(1, f, { pos: [s * 0.045, 0.03, 0.03], scale: [0.035, 0.03, 0.045] });
        b.sphere(0.01, '#1b1210', { pos: [s * 0.028, 0.235, 0.075] }, 6, 4);
      }
      b.sphere(1, '#ead2ae', { pos: [0, 0.2, 0.07], scale: [0.035, 0.025, 0.02] });
      b.sphere(0.01, '#1b1210', { pos: [0, 0.21, 0.09] }, 6, 4);
      b.torus(0.045, 0.012, '#d8453b', { pos: [0, 0.155, 0.0], rot: [Math.PI / 2, 0, 0] }, Math.PI * 2, 6, 12);
      break;
    }
    case 'coin':
      b.cyl(0.05, 0.05, 0.012, '#f2c430', { pos: [0, 0.006, 0] }, 18);
      break;
    default:
      b.box(0.1, 0.1, 0.1, '#cccccc', { pos: [0, 0.05, 0] }, 0.02);
  }
  return b;
}

/** 衣装アイテムは帽子・めがね等をそのまま見せる */
export function itemObject(id: string, mat: THREE.Material): THREE.Object3D {
  const outfit = ['camper_outfit', 'straw_hat', 'sunglasses', 'ranger_hat'].includes(id);
  if (outfit) {
    const g = new THREE.Group();
    const o = buildOutfit(id);
    if (id === 'camper_outfit') {
      if (o.body) { o.body.position.set(0, 0.05, 0); g.add(o.body); }
      if (o.hat) { o.hat.position.set(0.0, 0.3, 0); g.add(o.hat); }
    } else if (id === 'sunglasses') {
      if (o.face) { o.face.position.set(0, 0.05, -0.03); g.add(o.face); }
    } else if (o.hat) { o.hat.position.set(0, 0.05, 0); o.hat.rotation.set(0, o.hat.rotation.y, 0); g.add(o.hat); }
    return g;
  }
  const m = new THREE.Mesh(itemBuilder(id).build(), mat);
  m.castShadow = true;
  return m;
}
