// 描画：やわらかい影・空の光・ACES トーンマップに、ジオラマ風のぼかし（チルトシフト）と周辺減光を重ねる。
import * as THREE from 'three';

export type Quality = 'high' | 'medium' | 'low';

const VERT = /* glsl */`varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;

export class Renderer {
  readonly renderer: THREE.WebGLRenderer;
  readonly scene = new THREE.Scene();
  readonly sun: THREE.DirectionalLight;
  readonly hemi: THREE.HemisphereLight;
  quality: Quality = 'high';
  private rt: THREE.WebGLRenderTarget | null = null;
  private half: THREE.WebGLRenderTarget | null = null;
  private quadScene = new THREE.Scene();
  private quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  private quad: THREE.Mesh;
  private down: THREE.ShaderMaterial;
  private comp: THREE.ShaderMaterial;
  private w = 1; private h = 1;
  focusY = 0.5;
  private floatOK = false;
  pixelRatio = 1;

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance', stencil: false });
    const r = this.renderer;
    r.shadowMap.enabled = true;
    r.shadowMap.type = THREE.PCFSoftShadowMap;
    r.toneMapping = THREE.ACESFilmicToneMapping;
    r.toneMappingExposure = 1.05;
    r.outputColorSpace = THREE.SRGBColorSpace;
    this.floatOK = r.extensions.has('EXT_color_buffer_float') || r.extensions.has('EXT_color_buffer_half_float');

    this.hemi = new THREE.HemisphereLight('#cfe8ff', '#6f7f45', 1.2);
    this.scene.add(this.hemi);
    this.sun = new THREE.DirectionalLight('#fff1d6', 2.8);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(2048, 2048);
    this.sun.shadow.bias = -0.0004;
    this.sun.shadow.normalBias = 0.035;
    this.sun.shadow.radius = 3;
    const sc = this.sun.shadow.camera;
    sc.left = -17; sc.right = 17; sc.top = 17; sc.bottom = -17; sc.near = 1; sc.far = 80;
    this.scene.add(this.sun, this.sun.target);
    this.scene.background = new THREE.Color('#bfe3f5');
    this.scene.fog = new THREE.Fog('#cfe6ee', 45, 110);

    this.down = new THREE.ShaderMaterial({
      uniforms: { tScene: { value: null }, uTexel: { value: new THREE.Vector2() } },
      vertexShader: VERT,
      fragmentShader: /* glsl */`
        uniform sampler2D tScene; uniform vec2 uTexel; varying vec2 vUv;
        void main(){
          vec3 c = texture2D(tScene, vUv + uTexel*vec2(-1.0,-1.0)).rgb + texture2D(tScene, vUv + uTexel*vec2(1.0,-1.0)).rgb
                 + texture2D(tScene, vUv + uTexel*vec2(-1.0,1.0)).rgb + texture2D(tScene, vUv + uTexel*vec2(1.0,1.0)).rgb;
          gl_FragColor = vec4(c*0.25, 1.0);
        }`,
      depthTest: false, depthWrite: false, toneMapped: false,
    });
    this.comp = new THREE.ShaderMaterial({
      uniforms: {
        tScene: { value: null }, tBlur: { value: null }, uTexel: { value: new THREE.Vector2() },
        uFocus: { value: 0.5 }, uBlur: { value: 1 }, uVig: { value: 0.32 }, uWarm: { value: 0.0 }, uSat: { value: 1.08 },
        uFade: { value: 0 }, uFlash: { value: 0 },
      },
      vertexShader: VERT,
      fragmentShader: /* glsl */`
        uniform sampler2D tScene; uniform sampler2D tBlur; uniform vec2 uTexel;
        uniform float uFocus; uniform float uBlur; uniform float uVig; uniform float uWarm; uniform float uSat; uniform float uFade; uniform float uFlash;
        varying vec2 vUv;
        void main(){
          vec3 sharp = texture2D(tScene, vUv).rgb;
          float d = abs(vUv.y - uFocus);
          float k = smoothstep(0.16, 0.55, d) * uBlur;
          vec3 b = vec3(0.0);
          vec2 o = uTexel * (1.0 + k * 3.0);
          b += texture2D(tBlur, vUv).rgb * 0.2;
          b += texture2D(tBlur, vUv + o*vec2( 1.5, 0.0)).rgb * 0.1;
          b += texture2D(tBlur, vUv + o*vec2(-1.5, 0.0)).rgb * 0.1;
          b += texture2D(tBlur, vUv + o*vec2( 0.0, 1.5)).rgb * 0.1;
          b += texture2D(tBlur, vUv + o*vec2( 0.0,-1.5)).rgb * 0.1;
          b += texture2D(tBlur, vUv + o*vec2( 1.1, 1.1)).rgb * 0.1;
          b += texture2D(tBlur, vUv + o*vec2(-1.1, 1.1)).rgb * 0.1;
          b += texture2D(tBlur, vUv + o*vec2( 1.1,-1.1)).rgb * 0.1;
          b += texture2D(tBlur, vUv + o*vec2(-1.1,-1.1)).rgb * 0.1;
          vec3 col = mix(sharp, b, clamp(k, 0.0, 1.0));
          // 色調：わずかに暖色・彩度
          float l = dot(col, vec3(0.299, 0.587, 0.114));
          col = mix(vec3(l), col, uSat);
          col *= vec3(1.0 + uWarm*0.06, 1.0 + uWarm*0.01, 1.0 - uWarm*0.05);
          gl_FragColor = vec4(col, 1.0);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
          vec2 q = vUv - 0.5;
          float vig = 1.0 - dot(q, q) * uVig * 2.2;
          gl_FragColor.rgb *= vig;
          gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(1.0), uFlash);
          gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(0.04,0.03,0.05), uFade);
        }`,
      depthTest: false, depthWrite: false,
    });
    this.quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.comp);
    this.quad.frustumCulled = false;
    this.quadScene.add(this.quad);
  }

  get fade() { return this.comp.uniforms.uFade.value as number; }
  set fade(v: number) { this.comp.uniforms.uFade.value = v; }
  set flash(v: number) { this.comp.uniforms.uFlash.value = v; }
  set warm(v: number) { this.comp.uniforms.uWarm.value = v; }

  setQuality(q: Quality) {
    this.quality = q;
    this.resize(this.w, this.h);
  }

  resize(w: number, h: number) {
    this.w = w; this.h = h;
    const dpr = window.devicePixelRatio || 1;
    this.pixelRatio = this.quality === 'high' ? Math.min(dpr, 2) : this.quality === 'medium' ? Math.min(dpr, 1.5) : Math.min(dpr, 1);
    const r = this.renderer;
    r.setPixelRatio(this.pixelRatio);
    r.setSize(w, h, false);
    this.sun.shadow.mapSize.setScalar(this.quality === 'low' ? 1024 : 2048);
    this.sun.shadow.map?.dispose();
    (this.sun.shadow as { map: unknown }).map = null;
    this.rt?.dispose(); this.half?.dispose();
    this.rt = this.half = null;
    if (this.quality !== 'low') {
      const W = Math.floor(w * this.pixelRatio), H = Math.floor(h * this.pixelRatio);
      const type = this.floatOK ? THREE.HalfFloatType : THREE.UnsignedByteType;
      this.rt = new THREE.WebGLRenderTarget(W, H, { type, samples: this.quality === 'high' ? 4 : 2, depthBuffer: true });
      this.half = new THREE.WebGLRenderTarget(Math.max(1, W >> 1), Math.max(1, H >> 1), { type, depthBuffer: false });
      this.down.uniforms.uTexel.value.set(0.5 / W, 0.5 / H);
      this.comp.uniforms.uTexel.value.set(1 / (W >> 1), 1 / (H >> 1));
    }
  }

  render(camera: THREE.Camera) {
    const r = this.renderer;
    if (!this.rt || !this.half) {
      r.setRenderTarget(null);
      r.render(this.scene, camera);
      return;
    }
    r.setRenderTarget(this.rt);
    r.render(this.scene, camera);
    this.quad.material = this.down;
    this.down.uniforms.tScene.value = this.rt.texture;
    r.setRenderTarget(this.half);
    r.render(this.quadScene, this.quadCam);
    this.quad.material = this.comp;
    this.comp.uniforms.tScene.value = this.rt.texture;
    this.comp.uniforms.tBlur.value = this.half.texture;
    this.comp.uniforms.uFocus.value = this.focusY;
    r.setRenderTarget(null);
    r.render(this.quadScene, this.quadCam);
  }

  /** 影の範囲を主人公の周りに合わせる（テクセル単位にそろえてちらつきを防ぐ） */
  followShadow(target: THREE.Vector3, dir: THREE.Vector3) {
    const s = this.sun;
    const span = (s.shadow.camera.right - s.shadow.camera.left) / s.shadow.mapSize.x;
    const tx = Math.round(target.x / span) * span, tz = Math.round(target.z / span) * span;
    s.target.position.set(tx, 0, tz);
    s.position.set(tx + dir.x * 40, dir.y * 40, tz + dir.z * 40);
    s.target.updateMatrixWorld();
  }
}
