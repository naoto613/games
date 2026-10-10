// 共有マテリアル。マットな質感を基本に、葉の揺れと「主人公の手前を透かす」ディザ処理をシェーダーに追加する。
import * as THREE from 'three';

export const shared = {
  uTime: { value: 0 },
  uWind: { value: 1 },
  uSeeCenter: { value: new THREE.Vector2(-9999, -9999) },
  uSeeRadius: { value: 120 },
  uSeeDepth: { value: 0 },
  uSeeOn: { value: 1 },
};

const BAYER = /* glsl */`
float bayer4(vec2 p){
  ivec2 q = ivec2(mod(p, 4.0));
  int i = q.x + q.y * 4;
  float m[16] = float[16](0.,8.,2.,10.,12.,4.,14.,6.,3.,11.,1.,9.,15.,7.,13.,5.);
  for(int k=0;k<16;k++){ if(k==i) return (m[k]+0.5)/16.0; }
  return 0.5;
}`;

function patch(mat: THREE.Material, opts: { wind?: boolean; see?: boolean }) {
  mat.onBeforeCompile = (sh) => {
    sh.uniforms.uTime = shared.uTime;
    sh.uniforms.uWind = shared.uWind;
    sh.uniforms.uSeeCenter = shared.uSeeCenter;
    sh.uniforms.uSeeRadius = shared.uSeeRadius;
    sh.uniforms.uSeeDepth = shared.uSeeDepth;
    sh.uniforms.uSeeOn = shared.uSeeOn;
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', `#include <common>
        attribute float aSway;
        uniform float uTime; uniform float uWind;
        varying float vViewZ;`)
      .replace('#include <begin_vertex>', `#include <begin_vertex>
        ${opts.wind ? `
        float ph = position.x * 0.35 + position.z * 0.27;
        #ifdef USE_INSTANCING
        ph += instanceMatrix[3].x * 0.35 + instanceMatrix[3].z * 0.27;
        #endif
        float w = sin(uTime * 1.6 + ph) * 0.6 + sin(uTime * 2.7 + ph * 1.7) * 0.4;
        transformed.x += w * aSway * 0.05 * uWind;
        transformed.z += cos(uTime * 1.3 + ph) * aSway * 0.03 * uWind;` : ''}`)
      .replace('#include <project_vertex>', `#include <project_vertex>
        vViewZ = -mvPosition.z;`);
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', `#include <common>
        uniform vec2 uSeeCenter; uniform float uSeeRadius; uniform float uSeeDepth; uniform float uSeeOn;
        varying float vViewZ;
        ${BAYER}`)
      .replace('void main() {', `void main() {
        ${opts.see ? `
        if (uSeeOn > 0.5) {
          vec2 d = (gl_FragCoord.xy - uSeeCenter) / uSeeRadius;
          d.y *= 0.8;
          float r = length(d);
          if (r < 1.0 && vViewZ < uSeeDepth - 1.2) {
            float a = smoothstep(1.0, 0.45, r);
            if (a * 0.9 > bayer4(gl_FragCoord.xy)) discard;
          }
        }` : ''}`);
  };
  mat.customProgramCacheKey = () => `mori-${opts.wind ? 1 : 0}${opts.see ? 1 : 0}`;
}

export const worldMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.86, metalness: 0 });
patch(worldMat, { wind: true, see: true });

/** 透過させない静的物（地面近くの小物など） */
export const propMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.82, metalness: 0 });
patch(propMat, { wind: true, see: false });

export const charMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.72, metalness: 0 });
export const glossyMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.25, metalness: 0 });

export const glowMat = new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false });

/** 葉の影も揺れに合わせる深度マテリアル */
export const worldDepthMat = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking });

export function fadeable(color: THREE.ColorRepresentation) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.85, transparent: false });
}

/** 草地の細かい模様（タイル状に繰り返すテクスチャ） */
export function makeGrassDetailTexture() {
  const s = 256;
  const c = document.createElement('canvas');
  c.width = c.height = s;
  const g = c.getContext('2d')!;
  g.fillStyle = '#d8d8d8';
  g.fillRect(0, 0, s, s);
  const r = mulberry(7);
  for (let i = 0; i < 2600; i++) {
    const x = r() * s, y = r() * s;
    const v = 170 + r() * 85;
    g.strokeStyle = `rgba(${v},${v},${v},0.55)`;
    g.lineWidth = 1 + r() * 1.5;
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x + (r() - 0.5) * 4, y - 3 - r() * 5);
    g.stroke();
  }
  for (let i = 0; i < 300; i++) {
    const x = r() * s, y = r() * s;
    g.fillStyle = `rgba(255,255,255,${0.1 + r() * 0.2})`;
    g.beginPath(); g.arc(x, y, 2 + r() * 5, 0, Math.PI * 2); g.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

function mulberry(a: number) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
