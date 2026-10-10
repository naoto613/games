// 湖の水面。岸からの距離で色を変え、岸に白い波打ちぎわ、水面にきらめきを描く。
import * as THREE from 'three';
import { lakeSdf, WATER_Y } from '../world/Terrain';
import { CAMPSITE as L } from '../content/areas/campsite';

export function buildWater(timeU: { value: number }) {
  const { c, rx, rz } = L.lake;
  const geo = new THREE.PlaneGeometry(rx * 2 + 6, rz * 2 + 6, 120, 96);
  geo.rotateX(-Math.PI / 2);
  geo.translate(c[0], WATER_Y, c[1]);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const shore = new Float32Array(pos.count);
  for (let i = 0; i < pos.count; i++) shore[i] = -lakeSdf(pos.getX(i), pos.getZ(i));
  geo.setAttribute('aShore', new THREE.BufferAttribute(shore, 1));
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      uTime: timeU,
      uDeep: { value: new THREE.Color('#1b7f93') },
      uShallow: { value: new THREE.Color('#5fd0c8') },
      uFoam: { value: new THREE.Color('#ffffff') },
      uSky: { value: new THREE.Color('#bfe6f2') },
      uLight: { value: 1 },
      uNight: { value: 0 },
    },
    vertexShader: /* glsl */`
      attribute float aShore;
      varying float vShore; varying vec3 vW;
      uniform float uTime;
      void main(){
        vShore = aShore;
        vec3 p = position;
        p.y += sin(p.x*0.8 + uTime*1.2)*0.015 + cos(p.z*0.9 + uTime*0.9)*0.015;
        vW = p;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p,1.0);
      }`,
    fragmentShader: /* glsl */`
      varying float vShore; varying vec3 vW;
      uniform float uTime; uniform vec3 uDeep; uniform vec3 uShallow; uniform vec3 uFoam; uniform vec3 uSky; uniform float uLight; uniform float uNight;
      float h(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
      float n(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
        return mix(mix(h(i),h(i+vec2(1,0)),f.x), mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x), f.y); }
      void main(){
        if (vShore < -0.2) discard;
        float d = clamp(vShore / 4.0, 0.0, 1.0);
        vec3 col = mix(uShallow, uDeep, smoothstep(0.0, 1.0, d));
        // ゆらぐ模様
        float w = n(vW.xz*0.8 + vec2(uTime*0.15, uTime*0.1)) * n(vW.xz*1.6 - vec2(uTime*0.12, 0.0));
        col = mix(col, uSky, smoothstep(0.35, 0.7, w) * 0.25);
        // 波打ちぎわ（岸に寄せる白い帯）
        float band = sin(vShore * 7.0 - uTime * 1.8 + n(vW.xz*1.2)*3.0);
        float foam = smoothstep(0.75, 1.0, band) * (1.0 - smoothstep(0.1, 1.3, vShore));
        foam += 1.0 - smoothstep(0.0, 0.22, vShore + n(vW.xz*1.5+uTime*0.3)*0.12);
        col = mix(col, uFoam, clamp(foam, 0.0, 1.0) * 0.9);
        // きらめき
        float sp = n(vW.xz*6.0 + vec2(uTime*0.6, -uTime*0.4));
        col += vec3(1.0) * smoothstep(0.94, 0.995, sp) * 0.3 * (1.0 - uNight*0.7);
        col *= uLight;
        float a = mix(0.82, 0.95, d);
        gl_FragColor = vec4(col, a);
        #include <colorspace_fragment>
      }`,
  });
  const m = new THREE.Mesh(geo, mat);
  m.receiveShadow = false;
  m.renderOrder = 1;
  return { mesh: m, mat };
}
