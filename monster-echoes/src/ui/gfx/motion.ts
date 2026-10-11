// 1まい絵の モンスターに つける 基本の うごき（仕様 13.2：待機・攻撃・被弾・戦闘不能。要確認事項 Q6）
// t は うごきが はじまってからの フレーム数。かえり値の とおりに ずらして・のばして 描く。

export type MotionKind = 'idle' | 'attack' | 'hit' | 'faint';
export type MotionPose = { dx: number; dy: number; sx: number; sy: number; flash: number; alpha: number };

/** うごきの ながさ（フレーム） */
export const MOTION_LENGTH: Record<MotionKind, number> = { idle: Infinity, attack: 16, hit: 14, faint: 26 };

export function motionPose(kind: MotionKind, t: number, phase = 0): MotionPose {
  const p: MotionPose = { dx: 0, dy: 0, sx: 1, sy: 1, flash: 0, alpha: 1 };
  switch (kind) {
    case 'idle': {
      // ゆっくり 上下に ゆれて、すこし 息を する
      const s = Math.sin((t + phase) / 14);
      p.dy = Math.round(s * 2);
      p.sy = 1 + s * 0.015;
      p.sx = 1 - s * 0.01;
      break;
    }
    case 'attack': {
      // いちど ためて（ちぢむ）→ まえに ふみこむ（大きく・下へ）→ もどる
      const k = Math.min(1, t / MOTION_LENGTH.attack);
      if (k < 0.25) { const q = k / 0.25; p.sy = 1 - q * 0.08; p.sx = 1 + q * 0.05; }
      else { const q = Math.sin(((k - 0.25) / 0.75) * Math.PI); p.dy = q * 12; p.sx = p.sy = 1 + q * 0.12; }
      break;
    }
    case 'hit': {
      // しろく ひかって、うしろへ はじかれ、もどる
      const k = Math.min(1, t / MOTION_LENGTH.hit);
      p.flash = t < 4 ? 1 : 0;
      p.dx = Math.round(Math.sin(k * Math.PI * 3) * (1 - k) * 6);
      p.dy = -Math.round((1 - k) * 3);
      break;
    }
    case 'faint': {
      // しずみこんで つぶれ、きえる
      const k = Math.min(1, t / MOTION_LENGTH.faint);
      p.dy = k * 14;
      p.sy = 1 - k * 0.45;
      p.sx = 1 + k * 0.15;
      p.alpha = 1 - k;
      p.flash = t < 3 ? 1 : 0;
      break;
    }
  }
  return p;
}

/** 足もと（bx, by）を 基準に、うごきを つけて 絵を 描く */
export function drawWithPose(g: CanvasRenderingContext2D, img: CanvasImageSource, flashImg: CanvasImageSource | null, bx: number, by: number, w: number, h: number, pose: MotionPose) {
  const dw = Math.round(w * pose.sx), dh = Math.round(h * pose.sy);
  const x = Math.round(bx - dw / 2 + pose.dx), y = Math.round(by - dh + pose.dy);
  g.save();
  g.globalAlpha *= pose.alpha;
  g.drawImage(pose.flash && flashImg ? flashImg : img, x, y, dw, dh);
  g.restore();
}
