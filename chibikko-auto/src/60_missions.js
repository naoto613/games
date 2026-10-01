// ================================================================ missions
// each mission: {id, name, icon, start(), update(dt), cleanup()}
function placeVehicle(type, x, z, h, opts) {
  // free a slot if needed by recycling a far-away vehicle of that type
  let v = spawnVehicle(type, x, z, h, opts);
  if (!v) {
    const cand = VEH.filter(o => o.type === type && o.ai !== 'player' && !o.mission).sort((a, b) => distToPlayer(b) - distToPlayer(a))[0];
    if (cand) { removeVehicle(cand); v = spawnVehicle(type, x, z, h, opts); }
  }
  if (v) { v.ai = 'park'; v.driver = false; v.y = groundY(x, z); clearAround(v); }
  return v;
}
function clearAround(v) {
  // shove away other vehicles occupying the spot
  for (const o of VEH) if (o !== v && Math.hypot(o.x - v.x, o.z - v.z) < 7 && o.ai !== 'player') { if (o.ai === 'lane') { o.bumpT = 0; recycleToLane(o); } else if (!o.mission) recycleToLane(o); }
}
function sidewalkNear(x, z) {
  // nearest point on a block's sidewalk band
  const i = clamp(Math.floor((x + HALF) / P), 0, NB - 1), j = clamp(Math.floor((z + HALF) / P), 0, NB - 1), b = blockRect(i, j);
  const cx = clamp(x, b.x0 + 1.2, b.x1 - 1.2), cz = clamp(z, b.z0 + 1.2, b.z1 - 1.2);
  const d = [cx - b.x0, b.x1 - cx, cz - b.z0, b.z1 - cz], m = Math.min(...d);
  if (m === d[0]) return [b.x0 + 1.5, cz]; if (m === d[1]) return [b.x1 - 1.5, cz]; if (m === d[2]) return [cx, b.z0 + 1.5]; return [cx, b.z1 - 1.5];
}
function roadSpot(i, j, dx, dz, s, lo) {
  const [nx, nz] = nodePos(i, j); return { x: nx + dx * s + dz * (lo || 5.25), z: nz + dz * s - dx * (lo || 5.25), h: Math.atan2(dx, dz) };
}
function needVehicle(M, type, msg) {
  // returns true when player is in the mission vehicle
  if (PLAYER.veh === M.veh) { if (M.mk) { killMarker(M.mk); M.mk = null; } return true; }
  if (!M.vmk || M.vmk.target !== M.veh) { killMarker(M.vmk); M.vmk = makeMarker(M.veh.x, M.veh.z, { color: 0x5ab0ff, r: 0.6, h: 0.1, blipCol: '#5ab0ff', icon: '⬇️' }); M.vmk.target = M.veh; M.vmk.cyl.visible = false; M.vmk.ring.visible = false; }
  M.vmk.x = M.veh.x; M.vmk.z = M.veh.z; M.vmk.g.position.set(M.veh.x, M.veh.y + M.veh.T.H - 1.2, M.veh.z);
  GAME.obj(msg || `<b>${M.veh.T.label}</b>に のろう`);
  return false;
}

const MISSIONS = [
  {
    id: 'drive', name: 'はじめての ドライブ', icon: '🚗', desc: 'くるまで ようちえんへ', reward: 100,
    where: () => ({ x: SPOTS.home.x - 7, z: SPOTS.home.z }),
    start(M) {
      const s = roadSpot(1, 6, 1, 0, 30, 5.25);
      const p = SPOTS.home; const v = placeVehicle('kei', p.x + 3, p.z - 2.5 + 3.4, Math.PI / 2, { mission: true }); setVehColor(v, 0xd94f45);
      M.veh = v; M.step = 0;
      GAME.say('ママ', 'きょうは はじめての ドライブ！ あかい くるまに のって、ようちえんまで いってみよう！');
    },
    update(M, dt) {
      if (!needVehicle(M, 'kei', '<b>あかい くるま</b>に のろう（くるまの そばで「のる」ボタン）')) return;
      if (M.step === 0) { M.step = 1; M.tgt = makeMarker(SPOTS.kinderRoad.x, SPOTS.kinderRoad.z + 0.0, { r: 3, icon: '🌻' }); GAME.say('ママ', 'じょうず！ ちずの <b>きいろい しるし</b>の ところまで うんてんしてね。'); }
      if (M.step === 1) {
        GAME.obj('<b>ようちえん</b>（🌻）まで うんてんしよう');
        if (inMarker(M.tgt, 3.5) && Math.abs(PLAYER.veh.vf) < 4) { M.step = 2; GAME.pass(M); }
      }
    },
    cleanup(M) { killMarker(M.tgt); killMarker(M.vmk); if (M.veh) M.veh.mission = false; }
  },
  {
    id: 'ice', name: 'アイスクリーム はいたつ', icon: '🍦', desc: 'みんなに アイスを とどけよう', reward: 200,
    where: () => SPOTS.ice,
    start(M) {
      const s = SPOTS.ice;
      M.veh = placeVehicle('ice', s.x - 3, s.z + 3.6, Math.PI / 2, { mission: true });
      M.kids = []; M.done = 0; M.time = 0;
      const pts = [[SPOTS.kinder.x - 8, SPOTS.kinder.z + 1.5], [SPOTS.fountain.x - 25, SPOTS.fountain.z + 23], [SPOTS.home.x - 10, SPOTS.home.z], [SPOTS.gas.x - 2, SPOTS.gas.z - 8], [SPOTS.tower.x + 26, SPOTS.tower.z + 25]];
      for (const [x, z] of pts) {
        const [sx, sz] = sidewalkNear(x, z);
        const p = spawnPed(sx, sz, { state: 'wave', s: 0.62, hat: true, home: 'wave', immune: true, shirt: pick([0x86bfe6, 0xf29ab0, 0xa8e08a]), speed: 1.2 });
        if (!p) continue;
        p.face = PLAYER; p.bubH = 1.4;
        M.kids.push({ p, mk: makeMarker(sx, sz, { r: 2.4, icon: '🍦', h: 1.6 }), done: false });
      }
      GAME.say('アイスやさん', 'たいへん！ アイスを まってる こどもが いっぱい！ アイスクリーム カーで とどけてくれる？');
    },
    update(M, dt) {
      if (!needVehicle(M, 'ice', '<b>アイスクリーム カー</b>に のろう')) { AU.siren(null); return; }
      M.time += dt; GAME.timer(M.time);
      PLAYER.veh.siren = false; AU.siren('ice');
      const left = M.kids.filter(k => !k.done).length;
      GAME.counter(`🍦 ${M.kids.length - left} / ${M.kids.length}`);
      GAME.obj(`アイスを まってる <b>こども</b>（🍦）の ところで とまろう`);
      for (const k of M.kids) {
        if (k.done) continue;
        if (Math.hypot(PLAYER.veh.x - k.p.x, PLAYER.veh.z - k.p.z) < 6.5 && Math.abs(PLAYER.veh.vf) < 3) {
          k.done = true; killMarker(k.mk); k.p.state = 'cheer'; k.p.home = 'cheer'; k.p.stateT = 0;
          bubble(pick(['ありがとう！', 'やったー！', 'おいしい〜！', 'いちごあじ だいすき！']), k.p, 2.5);
          AU.coin(); GAME.addMoney(30); fxConfetti(k.p.x, 1.2, k.p.z, 40);
          setTimeout(() => { k.p.state = 'idle'; }, 4000);
        }
      }
      if (!left) { const bonus = M.time < 150 ? 100 : 0; GAME.pass(M, bonus ? `はやかったね！ ボーナス +$${bonus}` : '', bonus); }
    },
    cleanup(M) { AU.siren(null); for (const k of M.kids || []) { killMarker(k.mk); const p = k.p; setTimeout(() => removePed(p), 4500); } killMarker(M.vmk); if (M.veh) M.veh.mission = false; GAME.timer(null); GAME.counter(null); }
  },
  {
    id: 'cat', name: 'まいごの こねこ', icon: '🐱', desc: 'こねこを 3びき さがそう', reward: 200,
    where: () => SPOTS.catLady,
    start(M) {
      const s = SPOTS.catLady;
      M.lady = spawnPed(s.x, s.z, { state: 'wave', home: 'wave', s: 1, shirt: 0xb05a8a, hair: 0x8a8a88, immune: true, pants: 0x5a4a6a });
      M.lady.face = PLAYER;
      const spots = [[SPOTS.pond.x - 8, SPOTS.pond.z - 6], [SPOTS.kinder.x - 4, SPOTS.kinder.z - 14], [SPOTS.tower.x - 12, SPOTS.tower.z + 12]];
      // one hidden in an alley between buildings
      for (let j = 0; j < NB && spots.length < 4; j++) for (let i = 0; i < NB; i++) if (blockType(i, j) === 'D' && (i + j) % 3 === 1) { const c = blockCenter(i, j); spots.push([c.x, c.z]); break; }
      M.cats = spots.slice(0, 3).map(([x, z], k) => {
        const g = makeKitten([0xd88a3a, 0x444444, 0xeeeeee][k]);
        g.position.set(x, groundY(x, z), z);
        return { g, x, z, got: false, mk: makeMarker(x, z, { r: 9, h: 0.1, color: 0xffd23f, blipCol: '#ffd23f', area: true }), ph: k };
      });
      for (const c of M.cats) { c.mk.cyl.visible = false; c.mk.ring.material.opacity = 0.25; }
      M.step = 0;
      GAME.say('ねこの おばあちゃん', 'こねこが 3びき まいごに なっちゃったの… ちずの <b>きいろい まる</b>の なかを さがして くれる？');
    },
    update(M, dt) {
      const t = performance.now() / 1000;
      const got = M.cats.filter(c => c.got).length;
      GAME.counter(`🐱 ${got} / 3`);
      let follow = PLAYER;
      M.cats.forEach((c, k) => {
        const g = c.g;
        if (!c.got) {
          g.rotation.y = Math.sin(t * 0.8 + k) * 1.2; g.userData.tail.rotation.z = Math.sin(t * 4 + k) * 0.4;
          const d = Math.hypot(PLAYER.x - c.x, PLAYER.z - c.z);
          if (d < 14 && Math.random() < dt * 0.7) { AU.meow(); bubble('にゃー', { x: c.x, y: g.position.y, z: c.z, bubH: 0.6 }, 1); }
          if (d < 1.6 && !PLAYER.veh) {
            c.got = true; killMarker(c.mk); AU.meow(); fxSpark(c.x, 0.5, c.z, 16, 0xffffff);
            GAME.help(`🐱 こねこを みつけた！ (${got + 1}/3)`, 2);
            if (got + 1 === 3) { M.home = makeMarker(SPOTS.catLady.x, SPOTS.catLady.z, { r: 1.8, icon: '👵' }); GAME.say('', 'ぜんぶ みつけた！ <b>おばあちゃん</b>の ところへ つれて かえろう'); }
          }
        } else {
          // follow in a line behind the player
          const o = PLAYER.veh || PLAYER, back = 0.7 + k * 0.55;
          const tx = o.x - Math.sin(o.h) * (PLAYER.veh ? 0 : back), tz = o.z - Math.cos(o.h) * (PLAYER.veh ? 0 : back);
          c.x = damp(c.x, tx, 6, dt); c.z = damp(c.z, tz, 6, dt);
          const sp = Math.hypot(tx - c.x, tz - c.z);
          g.visible = !PLAYER.veh;
          g.position.set(c.x, groundY(c.x, c.z), c.z);
          if (sp > 0.05) g.rotation.y = Math.atan2(tx - c.x, tz - c.z);
          for (let n = 0; n < 4; n++) g.userData.legs[n].rotation.x = Math.sin(t * 14 + n * Math.PI / 2) * Math.min(1, sp * 2) * 0.6;
          g.userData.tail.rotation.z = Math.sin(t * 6) * 0.3;
        }
      });
      if (got < 3) GAME.obj(`きいろい まるの なかで <b>こねこ</b>を さがそう（あるいて さがしてね）`);
      else {
        GAME.obj(`こねこを <b>おばあちゃん</b>（👵）の ところへ つれて いこう`);
        if (M.home && Math.hypot(PLAYER.x - M.lady.x, PLAYER.z - M.lady.z) < 2.5 && !PLAYER.veh) {
          M.lady.state = 'cheer'; M.lady.home = 'cheer'; bubble('ありがとう！ やさしい こね！', M.lady, 3);
          GAME.pass(M);
        }
      }
    },
    cleanup(M) {
      for (const c of M.cats || []) { killMarker(c.mk); const g = c.g; setTimeout(() => scene.remove(g), 5000); }
      killMarker(M.home); const l = M.lady; if (l) setTimeout(() => removePed(l), 5000); GAME.counter(null);
    }
  },
  {
    id: 'fire', name: 'しょうぼうしゃ しゅつどう', icon: '🚒', desc: 'まちの かじを けそう', reward: 300,
    where: () => SPOTS.fire,
    start(M) {
      const s = SPOTS.fire;
      M.veh = placeVehicle('fire', s.x, s.z - 1, Math.PI / 2, { mission: true });
      const pts = [[SPOTS.gas.x + 10, SPOTS.gas.z + 2], [SPOTS.fountain.x - 30, SPOTS.fountain.z - 33], [SPOTS.home.x + 34, SPOTS.home.z - 2]];
      M.fires = pts.map(([x, z]) => { const [sx, sz] = sidewalkNear(x, z); const f = makeFire(sx, sz, 1.1); f.mk = makeMarker(sx, sz, { r: 1.2, h: 0.1, icon: '🔥', blipCol: '#ff6a2a' }); f.mk.cyl.visible = false; return f; });
      GAME.say('しょうぼうたいちょう', 'かじだ！ しょうぼうしゃで しゅつどう！ ひの ちかくで <b>みず</b> ボタンを おしてね！');
    },
    update(M, dt) {
      const left = M.fires.filter(f => f.alive).length;
      GAME.counter(`🔥 のこり ${left}`);
      if (!needVehicle(M, 'fire', '<b>しょうぼうしゃ</b>に のろう')) { AU.water(false); AU.siren(null); return; }
      const v = PLAYER.veh; v.siren = true; AU.siren('fire');
      GAME.obj(`<b>かじ</b>（🔥）の ちかくで <b>みず</b>ボタン（H）を おしつづけよう`);
      // water cannon
      const spraying = IN.horn || IN.keys.has('KeyH');
      AU.water(spraying);
      if (spraying) {
        const [fx, fz] = vAxes(v);
        // aim: camera yaw while driving slowly so kids can point it
        const aim = CAM.userT < 2 ? CAM.yaw : v.h, ax = Math.sin(aim), az = Math.cos(aim);
        const nx = v.x + fx * 3.0, nz = v.z + fz * 3.0, ny = v.y + 3.1;
        fxWater(nx, ny, nz, ax * 16 + v.vx, 5, az * 16 + v.vz, 6, 1.2);
        for (const f of M.fires) {
          if (!f.alive) continue;
          const dx = f.x - nx, dz = f.z - nz, d = Math.hypot(dx, dz);
          if (d < 24 && (dx * ax + dz * az) / d > 0.82) {
            f.hp -= dt * 0.45; fxSmoke(f.x, f.y + 1, f.z, 1, false);
            if (f.hp <= 0) { removeFire(f); killMarker(f.mk); AU.coin(); GAME.addMoney(40); GAME.help('🔥 ひを けした！', 1.6); }
          }
        }
      }
      if (!left) { AU.water(false); GAME.pass(M); }
    },
    cleanup(M) { for (const f of M.fires || []) { if (f.alive) removeFire(f); killMarker(f.mk); } AU.water(false); AU.siren(null); killMarker(M.vmk); if (M.veh) { M.veh.mission = false; M.veh.siren = false; } GAME.counter(null); }
  },
  {
    id: 'thief', name: 'どろぼうを おいかけろ', icon: '🚓', desc: 'パトカーで どろぼうを つかまえよう', reward: 300,
    where: () => SPOTS.police,
    start(M) {
      const s = SPOTS.police;
      M.veh = placeVehicle('police', s.x, s.z, Math.PI / 2, { mission: true });
      M.step = 0; M.hits = 0;
      GAME.say('けいさつしょちょう', 'おかしやさんの <b>ケーキ どろぼう</b>が にげたぞ！ パトカーで おいかけて、<b>3かい ぶつけて</b> とめよう！');
    },
    update(M, dt) {
      if (!needVehicle(M, 'police', '<b>パトカー</b>に のろう')) { AU.siren(null); return; }
      const v = PLAYER.veh; v.siren = true; AU.siren('police');
      if (M.step === 0) {
        // spawn the thief car on a road ahead
        const r = VEH.find(o => o.mission === 'thief');
        let th = r;
        if (!th) {
          th = placeVehicle('sports', 0, 0, 0, { mission: 'thief' }); setVehColor(th, 0x6b2fb0);
          let ok = false;
          for (let k = 0; k < 60 && !ok; k++) { ok = randomLaneSpawn(th, null, null, 0); if (ok && (distToPlayer(th) < 50 || distToPlayer(th) > 120)) ok = false; }
          th.mission = 'thief'; th.cruise = 13; th.ignoreLights = true; th.driver = true;
          th.onBump = (o, imp) => { if (imp > 2.5 && o.hitCD <= 0) { o.hitCD = 1; M.hits++; o.bumpT = 1.2; AU.bump(10); fxSpark(o.x, 1, o.z, 20); bubble(['うわっ！', 'ひえ〜！', 'まいった〜！'][Math.min(2, M.hits - 1)], o, 1.6); } };
          th.hitCD = 0;
          th.routePrefer = d => { const ni = th.lane.i + th.lane.dx + d[0], nj = th.lane.j + th.lane.dz + d[1], [x, z] = nodePos(clamp(ni, 0, NB), clamp(nj, 0, NB)); return -Math.hypot(x - PLAYER.x, z - PLAYER.z) + RND() * 60; };
        }
        M.thief = th; M.step = 1;
        GAME.say('むせん', 'どろぼうの くるまは <b>むらさきいろ</b>！ ちずの <b>あかい しるし</b>を おいかけて！');
      }
      if (M.step === 1) {
        const th = M.thief; th.hitCD -= dt;
        th.cruise = M.hits >= 2 ? 11 : 13;
        GAME.counter(`🚓 ${M.hits} / 3`);
        GAME.obj(`<b>むらさきの くるま</b>に ぶつけて とめよう！`);
        if (Math.random() < dt * 0.4 && distToPlayer(th) < 30) bubble(pick(['つかまらないよ〜', 'ケーキは わたさない！', 'まて まて〜？']), th, 1.5);
        if (M.hits >= 3) {
          M.step = 2; th.ai = 'park'; th.lane = null; th.driver = false; th.vx = th.vz = 0;
          const [fx, fz] = vAxes(th);
          const p = spawnPed(th.x - fz * 2, th.z + fx * 2, { state: 'cheer', home: 'cheer', shirt: 0x222222, pants: 0x222222, immune: true, armCol: 0xf0f0f0, temp: true, life: 15 });
          if (p) { p.face = PLAYER; bubble('ごめんなさ〜い！ ケーキ かえします…', p, 3.5); }
          GAME.pass(M);
        }
      }
    },
    cleanup(M) { AU.siren(null); killMarker(M.vmk); if (M.veh) { M.veh.mission = false; M.veh.siren = false; } if (M.thief) { M.thief.mission = false; M.thief.onBump = null; M.thief.cruise = 10; M.thief.ignoreLights = false; M.thief.routePrefer = null; } GAME.counter(null); }
  },
  {
    id: 'bus', name: 'ようちえん バス', icon: '🚌', desc: 'おともだちを むかえに いこう', reward: 300,
    where: () => SPOTS.kinder,
    start(M) {
      const s = SPOTS.kinderRoad;
      M.veh = placeVehicle('bus', s.x - 14, s.z, Math.PI / 2, { mission: true });
      M.stops = []; M.on = 0;
      const pts = [[SPOTS.home.x, SPOTS.home.z], [SPOTS.tower.x - 20, SPOTS.tower.z + 26], [SPOTS.police.x + 8, SPOTS.police.z + 22], [SPOTS.jump.x - 10, SPOTS.jump.z - 26]];
      for (const [x, z] of pts) {
        const [sx, sz] = sidewalkNear(x, z);
        const kids = [];
        for (let n = 0; n < 2; n++) { const p = spawnPed(sx + n * 0.8, sz, { state: 'wave', home: 'wave', s: 0.6, hat: true, immune: true, shirt: pick([0x86bfe6, 0xf29ab0]) }); if (p) { p.face = PLAYER; kids.push(p); } }
        M.stops.push({ x: sx, z: sz, kids, mk: makeMarker(sx, sz, { r: 2.4, icon: '🙋', h: 1.6 }), done: false });
      }
      M.step = 0;
      GAME.say('えんちょう せんせい', 'おはよう！ きょうは バスの うんてんしゅさん、おねがいね。<b>おともだち</b>を むかえに いこう！');
    },
    update(M, dt) {
      if (!needVehicle(M, 'bus', '<b>ようちえん バス</b>に のろう')) return;
      const v = PLAYER.veh;
      const left = M.stops.filter(s => !s.done).length;
      GAME.counter(`🙋 ${M.on} にん のってるよ`);
      if (left) {
        GAME.obj(`バスていで まってる <b>おともだち</b>（🙋）の ところで とまろう`);
        for (const s of M.stops) {
          if (s.done) continue;
          if (Math.hypot(v.x - s.x, v.z - s.z) < 7 && Math.abs(v.vf) < 2.5) {
            s.done = true; killMarker(s.mk);
            for (const p of s.kids) { p.state = 'goto'; p.gx = v.x; p.gz = v.z; p.runSpeed = 2.2; p.onArrive = q => { q.hidden = true; }; bubble(pick(['おはよう〜！', 'のせて〜！', 'わーい バスだ！']), p, 1.8); }
            M.on += s.kids.length; AU.coin(); GAME.addMoney(30);
            v.bumpT = 0;
          }
        }
      } else {
        if (!M.goal) { M.goal = makeMarker(SPOTS.kinderRoad.x, SPOTS.kinderRoad.z, { r: 3.5, icon: '🌻' }); GAME.say('', 'みんな のったね！ <b>ようちえん</b>へ もどろう！'); }
        GAME.obj(`<b>ようちえん</b>（🌻）へ もどろう`);
        if (inMarker(M.goal, 4.5) && Math.abs(v.vf) < 3) {
          // kids pop out cheering
          const [fx, fz] = vAxes(v);
          for (const s of M.stops) for (const p of s.kids) { p.hidden = false; p.x = v.x + fz * 2 + rr(-1, 1); p.z = v.z - fx * 2 + rr(-1, 1); p.state = 'cheer'; p.home = 'cheer'; }
          GAME.pass(M);
        }
      }
      // bus doors: keep boarding kids chasing the bus
      for (const s of M.stops) for (const p of s.kids) if (p.state === 'goto') { p.gx = v.x; p.gz = v.z; }
    },
    cleanup(M) { for (const s of M.stops || []) { killMarker(s.mk); for (const p of s.kids) setTimeout(() => removePed(p), 6000); } killMarker(M.goal); killMarker(M.vmk); if (M.veh) M.veh.mission = false; GAME.counter(null); }
  },
  {
    id: 'race', name: 'タイム アタック', icon: '🏁', desc: 'スポーツカーで チェックポイントを まわろう', reward: 250,
    where: () => SPOTS.gas,
    start(M) {
      const s = SPOTS.gas;
      M.veh = VEH.find(o => o.type === 'sports' && o.ai === 'park' && Math.hypot(o.x - s.x, o.z - s.z) < 40) || placeVehicle('sports', s.x - 6, s.z + 6, Math.PI / 2, { mission: true });
      M.veh.mission = true;
      // checkpoint loop around the city on roads
      const route = [[3, 4], [3, 2], [5, 2], [5, 0], [2, 0], [0, 0], [0, 3], [1, 5], [3, 6], [5, 6], [5, 4], [4, 4]];
      M.cps = route.map(([i, j]) => nodePos(i, j)); M.k = 0; M.time = 0; M.step = 0;
      GAME.say('レースの おにいさん', 'チェックポイントを じゅんばんに まわって ゴールしよう！ <b>きんメダル</b>は 70びょう いないだよ！');
    },
    update(M, dt) {
      if (!needVehicle(M, 'sports', '<b>スポーツカー</b>に のろう')) return;
      if (M.step === 0) { M.step = 1; M.time = 0; GAME.big('スタート！', '', 'mission'); AU.whoosh(); }
      M.time += dt; GAME.timer(M.time);
      if (!M.cur) { const [x, z] = M.cps[M.k]; M.cur = makeMarker(x, z, { r: 5, h: 6, color: M.k === M.cps.length - 1 ? 0xffffff : 0xff4a3a, icon: M.k === M.cps.length - 1 ? '🏁' : null, blipCol: '#ff4a3a' }); }
      GAME.counter(`🏁 ${M.k} / ${M.cps.length}`);
      GAME.obj(`<b>あかい ゲート</b>を くぐろう`);
      if (inMarker(M.cur, 6.5)) {
        killMarker(M.cur); M.cur = null; M.k++; AU.coin();
        if (M.k >= M.cps.length) {
          const t = M.time, medal = t < 70 ? '🥇 きんメダル' : t < 95 ? '🥈 ぎんメダル' : '🥉 どうメダル', bonus = t < 70 ? 200 : t < 95 ? 100 : 30;
          const best = GAME.save.raceBest; if (!best || t < best) GAME.save.raceBest = t;
          GAME.pass(M, `${medal}  ${fmtTime(t)}  +$${bonus}`, bonus);
        }
      }
    },
    cleanup(M) { killMarker(M.cur); killMarker(M.vmk); if (M.veh) M.veh.mission = false; GAME.timer(null); GAME.counter(null); }
  }
];
function fmtTime(t) { const m = Math.floor(t / 60), s = t - m * 60; return `${m}:${s < 10 ? '0' : ''}${s.toFixed(1)}`; }
