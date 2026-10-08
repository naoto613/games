// Event Animation（仕様 16/37/38 章）：イベント演出は Timeline Clip の集合。全キャラ共通の反応を再利用する。
// clip.type: FACE / EMOTE / ANIMATION / SPEECH / FX / WAIT。 params.body は描画側の体の動き、params.face は表情。

const c = (type, durationMs, params = {}) => ({ type, durationMs, params });

export const ANIMATIONS = {
  'react.surprised': [c('FACE', 150), c('EMOTE', 700, { icon: '❗', face: 'surprised', body: 'jump' })],
  'react.happy': [c('FACE', 150), c('EMOTE', 1100, { icon: '♪', face: 'happy', body: 'bounce' }), c('FX', 300, { kind: 'sparkle' })],
  'react.angry': [c('FACE', 150), c('EMOTE', 1200, { icon: '💢', face: 'angry', body: 'shake' })],
  'react.think': [c('FACE', 150), c('EMOTE', 1300, { icon: '💡', face: 'normal', body: 'nod' })],
  'react.sad': [c('FACE', 150), c('EMOTE', 1300, { icon: '💧', face: 'sad', body: 'droop' })],
  'react.scared': [c('FACE', 150), c('EMOTE', 1200, { icon: '😱', face: 'scared', body: 'tremble' })],
  'react.embarrassed': [c('FACE', 150), c('EMOTE', 1200, { icon: '💦', face: 'embarrassed', body: 'tremble' })],
  'react.laugh': [c('FACE', 150), c('EMOTE', 1200, { icon: '😆', face: 'happy', body: 'bounce' })],
  'react.love': [c('FACE', 150), c('EMOTE', 1200, { icon: '💕', face: 'happy', body: 'bounce' }), c('FX', 300, { kind: 'hearts' })],
  'react.eat': [c('FACE', 150), c('EMOTE', 1500, { icon: '😋', face: 'happy', body: 'eat' })],
  'react.drink': [c('FACE', 150), c('EMOTE', 1300, { icon: '🥤', face: 'happy', body: 'nod' })],
  'react.fall': [c('FACE', 100), c('EMOTE', 1300, { icon: '💫', face: 'surprised', body: 'fall' })],
  'react.run': [c('FACE', 100), c('EMOTE', 1200, { icon: '💨', face: 'scared', body: 'run' })],
  'react.spin': [c('FACE', 100), c('EMOTE', 1300, { icon: '🌀', face: 'surprised', body: 'spin' })],
  'react.sleep': [c('FACE', 100), c('EMOTE', 1500, { icon: '💤', face: 'sleep', body: 'droop' })],
  'react.wake': [c('FACE', 100), c('EMOTE', 900, { icon: '❗', face: 'surprised', body: 'jump' })],
  'react.sparkle': [c('FACE', 150), c('EMOTE', 1100, { icon: '✨', face: 'happy', body: 'grow' }), c('FX', 400, { kind: 'sparkle' })],
  'react.transform': [c('FACE', 150), c('FX', 500, { kind: 'smoke' }), c('EMOTE', 1200, { icon: '✨', face: 'surprised', body: 'spin' })],
  'react.splash': [c('FACE', 100), c('EMOTE', 1200, { icon: '💦', face: 'surprised', body: 'fall' }), c('FX', 500, { kind: 'splash' })],
  'react.fire': [c('FACE', 100), c('FX', 700, { kind: 'fire' }), c('EMOTE', 1200, { icon: '🔥', face: 'scared', body: 'tremble' })],
  'react.hit': [c('FACE', 100), c('EMOTE', 900, { icon: '💥', face: 'angry', body: 'shake' }), c('FX', 300, { kind: 'stars' })],
  'react.photo': [c('FACE', 150), c('FX', 300, { kind: 'flash' }), c('EMOTE', 1100, { icon: '📸', face: 'happy', body: 'bounce' })],
  'react.shrug': [c('FACE', 100), c('EMOTE', 700, { icon: '…', face: 'normal', body: 'none' })],
  'react.nothing': [c('EMOTE', 600, { icon: '…', face: 'normal', body: 'none' })],
  'react.terminal': [c('FACE', 200), c('EMOTE', 1200, { icon: '‼', face: 'surprised', body: 'jump' }), c('FX', 1800, { kind: 'big' }), c('WAIT', 1800)],
  'react.timeout': [c('FACE', 200), c('EMOTE', 1200, { icon: '⏰', face: 'surprised', body: 'shake' }), c('FX', 1500, { kind: 'smoke' }), c('WAIT', 1500)],
};

export function animDuration(id) {
  const clips = ANIMATIONS[id];
  if (!clips) return 1000;
  return clips.reduce((s, x) => s + x.durationMs, 0);
}
