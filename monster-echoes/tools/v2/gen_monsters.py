# 仕様書（docs/v2/SPEC_v2.md）の 200種の表から src/data/v2/monsters/*.ts を生成する。
# 生成後は データファイルを 手で なおしてよい（再生成すると 上書きされるので、なおした ときは この表の OVERRIDES に のせる）。
#   python3 tools/v2/gen_monsters.py
import os, re
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
spec = open(os.path.join(ROOT, 'docs', 'v2', 'SPEC_v2.md')).read()
rows = re.findall(r"^\| (\d{3}) \| ([^|]+?) \| ([^|]+?) \| ([^|]+?) \|$", spec, re.M)
assert len(rows) == 200, len(rows)

FAMILIES = ['slime', 'beast', 'plant', 'bug', 'bird', 'water', 'material', 'spirit', 'dragon', 'mystic']
EL = {'火': 'fire', '水': 'water', '風': 'wind', '地': 'earth', '雷': 'thunder', '氷': 'ice', '光': 'light', '影': 'shadow'}
# 要確認事項 Q1: 名前の重複を解消
RENAME = {93: 'クラウドウィング', 108: 'タイドサーペント'}

# スラッグ（スプライトのファイル名 mon_###_slug）
KANA = {}
def slug(no, name):
    return SLUGS.get(no) or f'm{no:03d}'

# 役割（特徴の文から決める。かっこの 中は 優先順位）
def role_of(note):
    rules = [
        ('special', ['反射', '吸収', '属性切替', '属性変化', '行動順', '封じ', '強化解除', '変身', '予測', '耐性切替', '行動妨害', '行動制御', '夢状態', '能力吸収', '複合']),
        ('support', ['回復', '支援', '補助', '蘇生', '万能']),
        ('tank', ['タンク', '防御', '高HP', '高耐性', '高耐久', '高防御', '魔法耐性', '超高HP']),
        ('status', ['毒', '麻痺', '睡眠', '状態異常', '弱体化', '拘束', '幻惑', '減速', '速度を低下']),
        ('caster', ['魔法']),
        ('speed', ['高速', '回避']),
        ('attacker', ['アタッカー', '物理', '高火力', '連続攻撃', '崩し', '範囲', '攻撃', '火力']),
    ]
    for role, kws in rules:
        if any(k in note for k in kws):
            return role
    return 'attacker'

LEGEND = {20, 40, 60, 80, 98, 99, 100, 120, 139, 140, 160, 180, 200}
# ボス由来・高位（ランク4）
HIGH = {97, 116, 118, 119, 175, 176, 177, 178, 179, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195, 196, 197, 198, 199, 15, 17, 158, 159, 138, 137, 136, 95, 59, 79, 78, 39, 38, 115, 174, 173}
def rank_of(no, pos, note):
    if no in LEGEND or '伝説' in note:
        return 5
    if no in HIGH or '高位' in note:
        return 4
    if pos <= 6:
        return 1
    if pos <= 12:
        return 2
    return 3

def growth_of(role, rank, note, no):
    if rank == 5:
        return 'late'
    if '成長' in note:
        return 'late'
    if role == 'special':
        return 'variable'
    if role == 'tank':
        return 'endure'
    if role in ('attacker', 'caster') and ('高火力' in note or '火力' in note or rank >= 4):
        return 'offense'
    if role == 'speed' or '序盤' in note or '初期' in note:
        return 'early'
    return 'balanced'

# 手で きめた スラッグ（英字）。ないものは m### に なる
SLUGS = {}
# 自動の きめかたが 合わない ものを 手で なおす（出現する 章・特徴に あわせる）
OVERRIDES = {
    13: {'rank': 1},                                   # ブロンズスライム：序盤の物理型
    20: {'role': 'support'},                           # エターナルスライム：成長型の伝説（万能すぎない支援寄り）
    27: {'role': 'attacker'},                          # サンドライオン：防御崩し
    42: {'role': 'attacker'},                          # リーフアント：物理補助
    46: {'role': 'tank'},                              # トゲボール：反撃型
    103: {'rank': 2}, 105: {'rank': 2}, 106: {'rank': 2},   # 第8章の 水棲
    123: {'rank': 2}, 124: {'rank': 2}, 125: {'rank': 2},   # 中盤の ゴーレム
    145: {'rank': 2}, 146: {'rank': 2},                # 第9章の 霊体
    161: {'rank': 2}, 162: {'rank': 2}, 163: {'rank': 2}, 164: {'rank': 2}, 165: {'rank': 2}, 166: {'rank': 2},
    167: {'rank': 3}, 168: {'rank': 3}, 169: {'rank': 3}, 170: {'rank': 3}, 171: {'rank': 3}, 172: {'rank': 3},
    175: {'role': 'attacker'},                         # 灰冠竜グレイヴ：物理・弱体化
    183: {'rank': 2}, 184: {'rank': 2}, 185: {'rank': 3},
}

out = {f: [] for f in FAMILIES}
for i, (no, name, note, el) in enumerate(rows):
    no = int(no)
    fam = FAMILIES[(no - 1) // 20]
    pos = (no - 1) % 20 + 1
    name = RENAME.get(no, name.strip())
    note = note.strip()
    role = role_of(note)
    rank = rank_of(no, pos, note)
    growth = growth_of(role, rank, note, no)
    elem = EL[el.strip()]
    o = OVERRIDES.get(no, {})
    out[fam].append(dict(no=no, name=name, note=note, role=o.get('role', role), rank=o.get('rank', rank), growth=o.get('growth', growth), el=o.get('el', elem)))

FAM_JA = {'slime': 'スライム系', 'beast': '獣系', 'plant': '植物系', 'bug': '虫系', 'bird': '鳥系', 'water': '水棲系', 'material': '物質系', 'spirit': '霊体系', 'dragon': '竜系', 'mystic': '神秘系'}
for fam, items in out.items():
    lines = [
        f"// {FAM_JA[fam]}（{items[0]['no']:03d}〜{items[-1]['no']:03d}）。tools/v2/gen_monsters.py で 仕様書の 表から 生成。",
        "// def(番号, 名前, 属性, 役割, ランク, 成長型, 特徴)",
        "import { def } from './def';",
        "",
        f"export const {fam.upper()} = [",
    ]
    for m in items:
        lines.append(f"  def({m['no']}, '{m['name']}', '{fam}', '{m['el']}', '{m['role']}', {m['rank']}, '{m['growth']}', '{m['note']}'),")
    lines.append("];")
    lines.append("")
    open(os.path.join(ROOT, 'src', 'data', 'v2', 'monsters', f'{fam}.ts'), 'w').write('\n'.join(lines))
print('ok')
