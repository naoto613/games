// ダンジョンの 固有イベントの めじるし（きりかぶ・ひかる あしあと・ひかりの わ・かくし とびら・ほうもつこ）
import { E, P, Pix, R, RR, mix } from './Pix';

export type EventTileKind = 'story' | 'trail' | 'nest' | 'hidden' | 'vault';

const pulse = (f: number, k = 1, ph = 0) => 0.5 + 0.5 * Math.sin((f / 16) * Math.PI * 2 * k + ph);

/** 地面の うえに おく もの（下地は よびだしがわで ぬる） */
export function eventObject(p: Pix, kind: EventTileKind, f: number, base: string) {
  switch (kind) {
    case 'story': { // くろい もやを まとった きりかぶ
      p.part(E(8, 13.6, 6, 1.6), '#000000', { flat: true, noOl: true });
      p.part(RR(3.6, 6.4, 8.8, 8, 2), '#6a4a2a', { ol: '#2a1808', hi: '#9a7448' });
      p.part(E(8, 6.6, 4.6, 1.9), '#b08a5a', { ol: '#3a2410', hi: '#dcb884' });
      p.part(E(8, 6.6, 2.6, 0.9), '#8a6a40', { flat: true, noOl: true });
      for (let i = 0; i < 4; i++) {
        const t = ((f + i * 4) % 16) / 16;
        const a = 0.55 * (1 - t);
        p.part(E(5 + i * 2 + Math.sin(t * 6 + i) * 1.2, 7 - t * 7, 1.6 + t, 1.2 + t * 0.6), mix('#1a1030', '#6a3a9a', t), { flat: true, noOl: true });
        void a;
      }
      break;
    }
    case 'trail': { // ひかる あしあと
      const g = 0.55 + 0.45 * pulse(f);
      p.part(E(8, 8.5, 6.4, 5.2), mix(base, '#9aeaff', 0.18 * g), { flat: true, noOl: true });
      for (const [x, y, r] of [[5.4, 10.4, -0.2], [10.2, 5.6, 0.2]] as [number, number, number][]) {
        const c = mix('#7ae0ff', '#ffffff', 0.4 * g);
        p.part(E(x, y, 2, 2.6), c, { flat: true, noOl: true });
        for (const d of [-1.6, -0.55, 0.55, 1.6]) p.part(E(x + d + r, y - 3.4 + Math.abs(d) * 0.4, 0.62, 0.8), c, { flat: true, noOl: true });
      }
      for (let i = 0; i < 3; i++) { const t = ((f + i * 5) % 16) / 16; p.part(E(4 + i * 4, 12 - t * 9, 0.45, 0.45), '#ffffff', { flat: true, noOl: true }); }
      break;
    }
    case 'nest': { // ひかりの わ（なかに スライムの かげ）
      const g = 0.6 + 0.4 * pulse(f);
      p.part(E(8, 9, 7.2, 5.8), mix(base, '#b8a0ff', 0.28 * g), { flat: true, noOl: true });
      p.part(E(8, 9, 6, 4.6), mix(base, '#e8dcff', 0.18), { flat: true, ol: mix('#c8b0ff', '#ffffff', g * 0.6) });
      p.part(E(8, 9.4, 3.2, 2.8), '#c8b0f0', { ol: '#5a3a9a', hi: '#f4eaff' });
      p.part(P(8, 5.2, 9.2, 7, 6.8, 7), '#c8b0f0', { flat: true, noOl: true });
      p.part(E(7, 9.2, 0.5, 0.6), '#2a1a4a', { flat: true, noOl: true }); p.part(E(9, 9.2, 0.5, 0.6), '#2a1a4a', { flat: true, noOl: true });
      for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2 + f * 0.2; p.part(E(8 + Math.cos(a) * 6.2, 9 + Math.sin(a) * 4.6, 0.5, 0.5), '#ffffff', { flat: true, noOl: true }); }
      break;
    }
    case 'vault': { // ふるい ほうもつこ
      const g = 0.5 + 0.5 * pulse(f);
      p.part(E(8, 14, 6.6, 1.5), '#000000', { flat: true, noOl: true });
      p.part(E(8, 8, 7.4, 6.4), mix(base, '#ffe890', 0.2 * g), { flat: true, noOl: true });
      p.part(RR(1.8, 7, 12.4, 7.4, 1), '#3a4a7a', { ol: '#10162a', hi: '#6a7ab0' });
      p.part(RR(1.8, 3, 12.4, 5, 2.4), '#4a5c92', { ol: '#10162a', hi: '#8a9ad0' });
      for (const x of [3.2, 11.8]) p.part(R(x, 3.4, 1.4, 10.8), '#e8c040', { ol: '#6a4a08', hi: '#fff0a0' });
      p.part(RR(6.4, 7, 3.2, 3.6, 0.8), '#f0d050', { ol: '#6a4a08', hi: '#fff8c0' });
      p.part(E(8, 8.8, 0.5, 0.7), '#3a2a08', { flat: true, noOl: true });
      p.part(P(8, 1.4, 9, 3.2, 8, 4.6, 7, 3.2), '#8ae8ff', { ol: '#1a4a7a', hi: '#ffffff' });
      break;
    }
    default:
      break;
  }
}

/** かくし とびら（かべの うえから かさねる）。きの ねが からまり、おくの すきまから ひかりが もれる */
export function hiddenDoorOverlay(p: Pix, f: number) {
  const g = pulse(f, 1, 1.3);
  // おくへ つづく くらい あな
  p.part(RR(4.4, 3, 7.2, 12, 3.4), '#1a1208', { ol: '#0a0804' });
  p.part(R(7.2, 4.4, 1.6, 10), mix('#c89a40', '#fff6c0', g), { flat: true, noOl: true });
  p.part(RR(5.6, 5, 4.8, 9.4, 2), mix('#3a2a10', '#c89a40', 0.25 + 0.25 * g), { flat: true, noOl: true });
  p.part(R(7.2, 4.4, 1.6, 10), mix('#c89a40', '#fff6c0', 0.4 + 0.6 * g), { flat: true, noOl: true });
  // からみあう ねっこ
  const root = '#6a4a22', hi = '#9a7a44';
  p.line(1, 1.5, 4.6, 6, root, 1.5); p.line(4.6, 6, 3.4, 11, root, 1.3); p.line(3.4, 11, 5.4, 15.5, root, 1.3);
  p.line(15, 1.5, 11.4, 6, root, 1.5); p.line(11.4, 6, 12.6, 11, root, 1.3); p.line(12.6, 11, 10.6, 15.5, root, 1.3);
  p.line(4.6, 6, 8, 3.4, hi, 0.9); p.line(11.4, 6, 8, 3.4, hi, 0.9);
  p.line(5.6, 8.4, 8, 6.6, root, 0.9); p.line(10.4, 8.4, 8, 6.6, root, 0.9);
  for (const [x, y] of [[4.2, 8.8], [11.8, 9], [8, 2.8]]) p.part(E(x, y, 0.8, 0.6), '#4aa848', { flat: true, noOl: true });
}
