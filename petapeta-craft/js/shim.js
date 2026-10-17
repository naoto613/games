/* あそびタウンの え（キャラ・どうぐ）を かりるための つなぎ。タウンの あそびルールは つかわないので からっぽに しておく */
'use strict';
(() => {
  const noop = () => {};
  PT.R = { add: noop, D: noop, h: {}, ROLES: {}, list: [] };
  PT.world = {};
  PT.FX = {};
  PT.stageById = () => null;
  PT.ROYAL_ODAI = [];
})();
