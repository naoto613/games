# モンスター番号 → 英字スラッグ（スプライトのファイル名 mon_###_slug.png。仕様 13.3）
SLUGS = {
    1: 'luna_slime', 2: 'bubble_mini', 3: 'moss_jelly', 4: 'flare_jelly', 5: 'frost_jelly', 6: 'spark_jelly', 7: 'stone_jelly', 8: 'wind_jelly', 9: 'mist_jelly', 10: 'grass_jelly',
    11: 'iron_jelly', 12: 'shadow_jelly', 13: 'bronze_slime', 14: 'silver_slime', 15: 'gold_slime', 16: 'prism_slime', 17: 'metal_spirit', 18: 'king_jelly', 19: 'star_jelly', 20: 'eternal_slime',
    21: 'magma_dog', 22: 'wind_cat', 23: 'bark_boar', 24: 'snow_fox', 25: 'blade_wolf', 26: 'night_wolf', 27: 'sand_lion', 28: 'thunder_lynx', 29: 'cloud_mole', 30: 'flame_tiger',
    31: 'gray_bear', 32: 'icicle_deer', 33: 'sunrise_leo', 34: 'dusk_jackal', 35: 'storm_bison', 36: 'rune_fox', 37: 'abyss_panther', 38: 'celestial_wolf', 39: 'fenrir_guard', 40: 'moon_beast',
    41: 'moss_rat', 42: 'leaf_ant', 43: 'green_sprite', 44: 'kinoko_soldier', 45: 'blossom_witch', 46: 'thorn_ball', 47: 'sleep_flower', 48: 'bind_tree', 49: 'sunflower_guard', 50: 'poison_orchid',
    51: 'flame_lily', 52: 'frost_rose', 53: 'thunder_vine', 54: 'mist_mush', 55: 'forest_titan', 56: 'old_tree_keeper', 57: 'memory_fairy', 58: 'rune_blossom', 59: 'elder_dryad', 60: 'world_tree_spirit',
    61: 'storm_bee', 62: 'iron_beetle', 63: 'feather_moth', 64: 'flare_mantis', 65: 'frost_spider', 66: 'poison_cicada', 67: 'thunder_hornet', 68: 'cocoon_guard', 69: 'crystal_scorpion', 70: 'sand_worm',
    71: 'night_moth', 72: 'glass_dragonfly', 73: 'blaze_beetle', 74: 'mirage_butterfly', 75: 'abyss_centipede', 76: 'sky_hopper', 77: 'rune_spider', 78: 'ancient_scarab', 79: 'queen_arachne', 80: 'star_eater_beetle',
    81: 'feather_bat', 82: 'frost_bird', 83: 'ash_bat', 84: 'thunder_raven', 85: 'sky_mole', 86: 'mist_owl', 87: 'blade_eagle', 88: 'night_crow', 89: 'flame_phoenix', 90: 'ice_phoenix',
    91: 'lightning_hawk', 92: 'celestial_bird', 93: 'cloud_wing', 94: 'star_wisp', 95: 'astral_phoenix', 96: 'griffon', 97: 'wind_eater_griffon', 98: 'astra', 99: 'eternal_ice_bird', 100: 'primal_wing',
    101: 'crablin', 102: 'coral_snail', 103: 'atla_fish', 104: 'aqua_bat', 105: 'abyss_eel', 106: 'shell_knight', 107: 'deep_jelly', 108: 'tide_serpent', 109: 'nereid', 110: 'mizuchi',
    111: 'snow_crab', 112: 'blizzard_shark', 113: 'thunder_orca', 114: 'mirage_shell', 115: 'abyss_whale', 116: 'nereus', 117: 'rune_mermaid', 118: 'seabed_behemoth', 119: 'abyss_scale_king', 120: 'primal_sea_dragon',
    121: 'moss_golem', 122: 'stone_golem', 123: 'iron_golem', 124: 'crystal_golem', 125: 'lava_golem', 126: 'lantern_ghost', 127: 'rune_lantern', 128: 'armor_knight', 129: 'blade_knight', 130: 'mirror_mage',
    131: 'fortress', 132: 'mecha_beetle', 133: 'magnet_knight', 134: 'antique_doll', 135: 'clock_worker', 136: 'ancient_guardian', 137: 'stardust_soldier', 138: 'void_colossus', 139: 'primal_machine_god', 140: 'eternal_guardian_statue',
    141: 'ghost_bill', 142: 'mist_wraith', 143: 'night_wisp', 144: 'memory_ghost', 145: 'mirror_wraith', 146: 'eclipse_bat', 147: 'soul_lantern', 148: 'whisper', 149: 'grief_spirit', 150: 'ceremonial_ghost',
    151: 'rune_phantom', 152: 'abyss_wraith', 153: 'dream_eater', 154: 'memory_devourer', 155: 'memory_eater', 156: 'silence_spirit', 157: 'time_walker_ghost', 158: 'oblivion_queen', 159: 'eternal_guide', 160: 'primal_soul',
    161: 'fire_dragon', 162: 'ice_krill', 163: 'storm_dragon', 164: 'thunder_drake', 165: 'dark_dragon', 166: 'green_dragon', 167: 'sand_dragon', 168: 'mist_dragon', 169: 'snow_dragon', 170: 'tree_dragon',
    171: 'tide_dragon', 172: 'cloud_dragon', 173: 'chaos_beast', 174: 'rune_dragon', 175: 'grave', 176: 'volga', 177: 'mirage', 178: 'nox', 179: 'astrion', 180: 'primal_dragon',
    181: 'dark_eye', 182: 'rune_fairy', 183: 'prism_witch', 184: 'star_seeker', 185: 'spacetime_keeper', 186: 'star_eater_phoenix', 187: 'moonshadow_tuner', 188: 'primal_keeper', 189: 'sky_sage', 190: 'eternal_ice_emperor',
    191: 'infinite_shadow_king', 192: 'light_shadow_twins', 193: 'world_observer', 194: 'dream_goddess', 195: 'abyss_twinhead_king', 196: 'withered_tree_dragon', 197: 'infinite_mechanism', 198: 'star_king', 199: 'noctil', 200: 'lunafia_guardian',
}
assert len(SLUGS) == 200 and len(set(SLUGS.values())) == 200
