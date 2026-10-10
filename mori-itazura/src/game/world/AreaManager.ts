// エリアと、その中の場所（ゾーン）の管理。初期版はエリア「森のキャンプ場」のみ。
import { CAMPSITE as L } from '../content/areas/campsite';
import { lakeSdf, onDock } from './Terrain';

export interface Zone { id: string; name: string; test: (x: number, z: number) => boolean }

const near = (p: [number, number], r: number) => (x: number, z: number) => Math.hypot(x - p[0], z - p[1]) < r;

export const ZONES: Zone[] = [
  { id: 'cabin', name: 'レンジャーごや', test: (x, z) => Math.abs(x - L.cabin.pos[0]) < L.cabin.w / 2 + 1 && Math.abs(z - L.cabin.pos[1]) < L.cabin.d / 2 + 2 },
  { id: 'shop', name: 'ばいてん', test: near(L.shop.pos, 4.2) },
  { id: 'dock', name: 'さんばし', test: (x, z) => onDock(x, z, 1) },
  { id: 'lake', name: 'みずうみ', test: (x, z) => lakeSdf(x, z) < 0.5 },
  { id: 'picnic', name: 'ピクニックひろば', test: near([-9, 14.5], 7.5) },
  { id: 'campfire', name: 'たきびの ひろば', test: near(L.campfire.pos, 8) },
  { id: 'den', name: 'コロの おうち', test: near(L.den.pos, 5) },
  { id: 'entrance', name: 'いりぐち', test: (x, z) => z > 27 },
  { id: 'treasure', name: 'ほくとうの もり', test: (x, z) => x > 20 && z < -16 },
];

export class AreaManager {
  readonly areaId = L.id;
  readonly areaName = L.name;
  current: Zone | null = null;

  update(x: number, z: number) {
    const z0 = ZONES.find((zn) => zn.test(x, z)) ?? null;
    const changed = z0?.id !== this.current?.id;
    this.current = z0;
    return changed;
  }
  get placeName() { return this.current?.name ?? this.areaName; }
}
