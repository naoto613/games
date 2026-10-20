// 風見の村カゼノ（3-1）：風の ふく 高原の 村（仕様 14.3：風見台／魔物研究所／宿屋／旅の扉／高原入口）。
// まんなかに 風車の ある 風見台と 広場、左に 魔物研究所、右に 宿屋、左下に 旅の扉、北東の アーチが 高原入口、南の 道が ミズナへ。
import { TownBuilder } from './builder';

const b = new TownBuilder(28, 22, ',');
// ---- 道と 広場
b.fill(13, 13, 2, 9, ':'); // 南の 道（ミズナへ）
b.circle(13.5, 11, 3.3, 'o');
b.fill(13, 7, 2, 2, '.'); // 風見台の 前
b.fill(3, 11, 8, 2, ':'); // 西の 道（研究所へ）
b.fill(5, 10, 1, 1, ':');
b.fill(17, 11, 8, 2, ':'); // 東の 道（宿屋へ）
b.fill(22, 10, 1, 1, ':');
b.fill(5, 19, 8, 1, ':'); // 旅の扉への 道
b.path([[17, 9], [19, 5], [21, 4], [21, 1]], ':', 1); // 高原入口へ
// ---- 建物
b.building('mill', 11, 1, 6, 6, 3, '風見台');
b.blades(14, 2);
b.building('lab', 2, 6, 6, 4, 3, '魔物研究所');
b.building('inn', 20, 6, 6, 4, 2, '宿屋');
b.building('dome', 3, 14, 5, 5, 2, '旅の扉', '#4a9ae0');
// ---- 高原入口（アーチ）
b.arch(20, 0, 3);
// ---- かざり
for (const [x, y] of [[10, 8], [17, 8], [10, 14], [17, 14]] as [number, number][]) b.lamp(x, y);
b.flowers(8, 9, 2); b.flowers(18, 9, 1); b.flowers(9, 15, 2); b.flowers(16, 16, 2);
b.bench(11, 15); b.bench(19, 14);
b.fence(0, 4, 2, 'h'); b.fence(26, 15, 2, 'h');
b.sign(15, 19);
b.barrel(25, 10); b.barrel(25, 13);
b.rock(9, 4); b.rock(23, 16); b.rock(18, 19); b.rock(1, 13);
b.well(20, 16);
// ---- 風に まがった 木（まわり）
b.windtrees(0, 0, 9, 2, 0.8); b.windtrees(24, 0, 4, 5, 0.9); b.windtrees(0, 2, 2, 2, 0.9);
b.windtrees(0, 5, 2, 6, 0.85); b.windtrees(26, 5, 2, 5, 0.9);
b.windtrees(0, 14, 2, 8, 0.85); b.windtrees(26, 17, 2, 5, 0.85);
b.windtrees(8, 20, 5, 2, 0.8); b.windtrees(15, 20, 11, 2, 0.8);
b.windtree(9, 2); b.windtree(18, 3); b.windtree(23, 19); b.windtree(9, 17);
b.bush(10, 5); b.bush(17, 5); b.bush(24, 14);
// ---- 人・はじまりの いち
b.mark(12, 18, '5'); // 見はりの ゴウ
b.mark(8, 12, '6'); // 村の子 フウ
b.mark(17, 13, '7'); // 行商人（装備）
b.mark(19, 11, '8'); // 村長 カザミ
b.mark(13, 19, 'P');

export const KAZENO = { rows: b.rows(), art: b.art() };
