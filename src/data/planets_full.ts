// 《星航荒宇》完整星球数据
// 32个星球：8个核心神域星 + 24个扩展星球

import {
  Planet,
  PlanetType,
  PlanetCategory,
  FactionType,
  GodDomain,
} from './types_new';

// ==================== 核心神域星（8个）====================

export const PLANET_HELIOS: Planet = {
  id: 'planet_helios',
  name: '赫利俄斯神域星',
  type: PlanetType.GOD_DOMAIN,
  category: PlanetCategory.MYTHOLOGY,
  level: 5,
  description: '太阳神赫利俄斯的藏身之处。这颗星球被一层黯淡的金光笼罩，地表布满锈蚀的青铜遗迹和断裂的太阳神雕像。',
  dangerLevel: 'medium',
  godId: 'god_helios',
  factionControl: FactionType.ORDER_GODS,
  resources: [
    { itemId: 'star_core_fragment', dropRate: 0.3, minAmount: 1, maxAmount: 3 },
    { itemId: 'bronze_alloy', dropRate: 0.5, minAmount: 2, maxAmount: 5 },
    { itemId: 'solar_essence', dropRate: 0.2, minAmount: 1, maxAmount: 2 },
  ],
  enemies: [
    { enemyId: 'void_worm', spawnRate: 0.4, minCount: 1, maxCount: 3 },
    { enemyId: 'bronze_guardian', spawnRate: 0.3, minCount: 1, maxCount: 2 },
  ],
  specialLoot: ['solar_chariot_fragment', 'helios_permission'],
  explorationTime: 30,
  requiredShipLevel: 3,
};

export const PLANET_OLYMPUS: Planet = {
  id: 'planet_olympus',
  name: '奥林匹斯中继星',
  type: PlanetType.GOD_DOMAIN,
  category: PlanetCategory.MYTHOLOGY,
  level: 15,
  description: '众神之王宙斯的藏身之处。曾是希腊诸神夺权前的核心据点，如今雕像残破、布满灰尘，失去了往日的神力光辉。',
  dangerLevel: 'high',
  godId: 'god_zeus',
  factionControl: FactionType.ORDER_GODS,
  resources: [
    { itemId: 'star_core', dropRate: 0.4, minAmount: 1, maxAmount: 3 },
    { itemId: 'divine_marble', dropRate: 0.3, minAmount: 1, maxAmount: 2 },
    { itemId: 'thunder_stone', dropRate: 0.25, minAmount: 1, maxAmount: 2 },
  ],
  enemies: [
    { enemyId: 'dark_flame_python', spawnRate: 0.3, minCount: 1, maxCount: 2 },
    { enemyId: 'lightning_servant', spawnRate: 0.4, minCount: 2, maxCount: 4 },
    { enemyId: 'void_predator', spawnRate: 0.2, minCount: 1, maxCount: 1 },
  ],
  specialLoot: ['olympus_flame', 'zeus_permission', 'divine_thunder'],
  explorationTime: 45,
  requiredShipLevel: 8,
};

export const PLANET_DELPHI: Planet = {
  id: 'planet_delphi',
  name: '德尔斐预言星',
  type: PlanetType.GOD_DOMAIN,
  category: PlanetCategory.MYTHOLOGY,
  level: 10,
  description: '光明与预言之神阿波罗的藏身之处。星球表面留存着当年神谕仪式的痕迹，地面布满祭祀纹路，神谕祭坛被碎石掩埋。',
  dangerLevel: 'medium',
  godId: 'god_apollo',
  factionControl: FactionType.ORDER_GODS,
  resources: [
    { itemId: 'prophecy_crystal', dropRate: 0.25, minAmount: 1, maxAmount: 2 },
    { itemId: 'sacred_scroll', dropRate: 0.35, minAmount: 1, maxAmount: 3 },
    { itemId: 'star_core_fragment', dropRate: 0.3, minAmount: 1, maxAmount: 2 },
  ],
  enemies: [
    { enemyId: 'prophecy_worm', spawnRate: 0.35, minCount: 1, maxCount: 3 },
    { enemyId: 'oracle_guardian', spawnRate: 0.3, minCount: 1, maxCount: 2 },
  ],
  specialLoot: ['prophecy_fragment', 'apollo_permission'],
  explorationTime: 35,
  requiredShipLevel: 5,
};

export const PLANET_POSEIDON: Planet = {
  id: 'planet_poseidon',
  name: '波塞冬风暴星',
  type: PlanetType.GOD_DOMAIN,
  category: PlanetCategory.MYTHOLOGY,
  level: 12,
  description: '海神波塞冬的藏身之处。建在一片干涸的伪海洋河床之上，布满破碎的礁石与锈蚀的航船残骸，常年刮着狂暴的海风。',
  dangerLevel: 'high',
  godId: 'god_poseidon',
  factionControl: FactionType.ORDER_GODS,
  resources: [
    { itemId: 'abyssal_pearl', dropRate: 0.2, minAmount: 1, maxAmount: 2 },
    { itemId: 'coral_alloy', dropRate: 0.4, minAmount: 2, maxAmount: 5 },
    { itemId: 'storm_crystal', dropRate: 0.25, minAmount: 1, maxAmount: 2 },
  ],
  enemies: [
    { enemyId: 'abyssal_leviathan', spawnRate: 0.25, minCount: 1, maxCount: 1 },
    { enemyId: 'storm_wraith', spawnRate: 0.35, minCount: 2, maxCount: 3 },
    { enemyId: 'coral_guardian', spawnRate: 0.3, minCount: 1, maxCount: 2 },
  ],
  specialLoot: ['trident_fragment', 'poseidon_permission', 'abyssal_scale'],
  explorationTime: 40,
  requiredShipLevel: 6,
};

export const PLANET_VALHALLA: Planet = {
  id: 'planet_valhalla',
  name: '瓦尔哈拉英灵星',
  type: PlanetType.GOD_DOMAIN,
  category: PlanetCategory.MYTHOLOGY,
  level: 20,
  description: '北欧诸神之王奥丁的藏身之处。一座巨大的战争堡垒，曾是英灵战士的归宿，如今却笼罩在战争的阴影中。',
  dangerLevel: 'very_high',
  godId: 'god_odin',
  factionControl: FactionType.ORDER_GODS,
  resources: [
    { itemId: 'valkyrie_feather', dropRate: 0.2, minAmount: 1, maxAmount: 2 },
    { itemId: 'runic_stone', dropRate: 0.35, minAmount: 1, maxAmount: 3 },
    { itemId: 'warrior_soul', dropRate: 0.15, minAmount: 1, maxAmount: 1 },
  ],
  enemies: [
    { enemyId: 'valkyrie_shadow', spawnRate: 0.3, minCount: 1, maxCount: 2 },
    { enemyId: 'undead_warrior', spawnRate: 0.4, minCount: 2, maxCount: 4 },
    { enemyId: 'frost_giant', spawnRate: 0.2, minCount: 1, maxCount: 1 },
  ],
  specialLoot: ['gungnir_fragment', 'odin_permission', 'valkyrie_blessing'],
  explorationTime: 50,
  requiredShipLevel: 10,
};

export const PLANET_BIFROST: Planet = {
  id: 'planet_bifrost',
  name: '彩虹桥中转星',
  type: PlanetType.GOD_DOMAIN,
  category: PlanetCategory.MYTHOLOGY,
  level: 8,
  description: '雷神托尔的藏身之处。曾是连接九界的彩虹桥节点，如今只剩下残破的传送门和散落的雷电痕迹。',
  dangerLevel: 'medium',
  godId: 'god_thor',
  factionControl: FactionType.ORDER_GODS,
  resources: [
    { itemId: 'rainbow_crystal', dropRate: 0.3, minAmount: 1, maxAmount: 2 },
    { itemId: 'thunder_essence', dropRate: 0.25, minAmount: 1, maxAmount: 2 },
    { itemId: 'bifrost_shard', dropRate: 0.2, minAmount: 1, maxAmount: 1 },
  ],
  enemies: [
    { enemyId: 'thunder_spirit', spawnRate: 0.4, minCount: 2, maxCount: 3 },
    { enemyId: 'rainbow_serpent', spawnRate: 0.3, minCount: 1, maxCount: 2 },
  ],
  specialLoot: ['mjolnir_fragment', 'thor_permission'],
  explorationTime: 35,
  requiredShipLevel: 4,
};

export const PLANET_MIMIR: Planet = {
  id: 'planet_mimir',
  name: '密米尔智慧星',
  type: PlanetType.GOD_DOMAIN,
  category: PlanetCategory.MYTHOLOGY,
  level: 18,
  description: '智慧之神密米尔的藏身之处。星球上遍布古老的知识殿堂和神秘的符文石碑，蕴含着无尽的智慧。',
  dangerLevel: 'high',
  godId: 'god_mimir',
  factionControl: FactionType.ORDER_GODS,
  resources: [
    { itemId: 'wisdom_scroll', dropRate: 0.3, minAmount: 1, maxAmount: 2 },
    { itemId: 'ancient_rune', dropRate: 0.4, minAmount: 1, maxAmount: 3 },
    { itemId: 'knowledge_crystal', dropRate: 0.25, minAmount: 1, maxAmount: 2 },
  ],
  enemies: [
    { enemyId: 'knowledge_guardian', spawnRate: 0.35, minCount: 1, maxCount: 2 },
    { enemyId: 'rune_golem', spawnRate: 0.3, minCount: 1, maxCount: 2 },
    { enemyId: 'wisdom_wraith', spawnRate: 0.25, minCount: 1, maxCount: 1 },
  ],
  specialLoot: ['mimir_head_fragment', 'mimir_permission', 'wisdom_eye'],
  explorationTime: 45,
  requiredShipLevel: 9,
};

export const PLANET_HEL: Planet = {
  id: 'planet_hel',
  name: '赫尔冥界星',
  type: PlanetType.GOD_DOMAIN,
  category: PlanetCategory.MYTHOLOGY,
  level: 25,
  description: '死亡女神赫尔的藏身之处。这颗星球一半是冰封的死亡之地，一半是燃烧的毁灭领域，是亡者的归宿。',
  dangerLevel: 'extreme',
  godId: 'god_hel',
  factionControl: FactionType.CHAOS_GODS,
  resources: [
    { itemId: 'death_essence', dropRate: 0.2, minAmount: 1, maxAmount: 2 },
    { itemId: 'soul_crystal', dropRate: 0.15, minAmount: 1, maxAmount: 1 },
    { itemId: 'hel_frost', dropRate: 0.25, minAmount: 1, maxAmount: 2 },
  ],
  enemies: [
    { enemyId: 'death_knight', spawnRate: 0.3, minCount: 1, maxCount: 2 },
    { enemyId: 'soul_devourer', spawnRate: 0.25, minCount: 1, maxCount: 1 },
    { enemyId: 'hel_guardian', spawnRate: 0.2, minCount: 1, maxCount: 1 },
  ],
  specialLoot: ['hel_crown_fragment', 'hel_permission', 'death_scythe'],
  explorationTime: 60,
  requiredShipLevel: 12,
};

// ==================== 科技星（8个）====================

export const PLANET_ALPHA: Planet = {
  id: 'planet_alpha',
  name: '阿尔法宜居星',
  type: PlanetType.TECH_STAR,
  category: PlanetCategory.REGULAR,
  level: 1,
  description: '联邦拓荒队的主要基地。这是一颗类地行星，拥有适宜的大气层和丰富的水资源，是新手拓荒者的起点。',
  dangerLevel: 'low',
  factionControl: FactionType.FEDERATION,
  resources: [
    { itemId: 'basic_alloy', dropRate: 0.6, minAmount: 2, maxAmount: 5 },
    { itemId: 'energy_block', dropRate: 0.5, minAmount: 1, maxAmount: 3 },
    { itemId: 'coolant', dropRate: 0.4, minAmount: 1, maxAmount: 2 },
  ],
  enemies: [
    { enemyId: 'small_void_beast', spawnRate: 0.3, minCount: 1, maxCount: 2 },
  ],
  specialLoot: ['federation_supplies'],
  explorationTime: 20,
  requiredShipLevel: 1,
};

export const PLANET_BETA: Planet = {
  id: 'planet_beta',
  name: '贝塔工业星',
  type: PlanetType.TECH_STAR,
  category: PlanetCategory.REGULAR,
  level: 3,
  description: '联邦重要的工业基地。星球表面布满采矿设施和加工厂，出产大量基础合金和能源核心。',
  dangerLevel: 'low',
  factionControl: FactionType.FEDERATION,
  resources: [
    { itemId: 'basic_alloy', dropRate: 0.7, minAmount: 3, maxAmount: 6 },
    { itemId: 'energy_core', dropRate: 0.4, minAmount: 1, maxAmount: 2 },
    { itemId: 'machine_parts', dropRate: 0.3, minAmount: 1, maxAmount: 2 },
  ],
  enemies: [
    { enemyId: 'void_scavenger', spawnRate: 0.35, minCount: 1, maxCount: 3 },
    { enemyId: 'industrial_drone', spawnRate: 0.2, minCount: 1, maxCount: 2 },
  ],
  specialLoot: ['industrial_blueprint', 'mining_tools'],
  explorationTime: 25,
  requiredShipLevel: 2,
};

export const PLANET_GAMMA: Planet = {
  id: 'planet_gamma',
  name: '伽马研究星',
  type: PlanetType.TECH_STAR,
  category: PlanetCategory.REGULAR,
  level: 6,
  description: '联邦科学研究院所在地。拥有先进的实验室和观测站，专门研究虚空能量和神能技术。',
  dangerLevel: 'medium',
  factionControl: FactionType.FEDERATION,
  resources: [
    { itemId: 'research_data', dropRate: 0.4, minAmount: 1, maxAmount: 2 },
    { itemId: 'energy_core', dropRate: 0.5, minAmount: 1, maxAmount: 3 },
    { itemId: 'tech_blueprint', dropRate: 0.25, minAmount: 1, maxAmount: 1 },
  ],
  enemies: [
    { enemyId: 'experiment_gone_wrong', spawnRate: 0.3, minCount: 1, maxCount: 2 },
    { enemyId: 'void_researcher', spawnRate: 0.25, minCount: 1, maxCount: 1 },
  ],
  specialLoot: ['advanced_tech', 'research_notes'],
  explorationTime: 30,
  requiredShipLevel: 3,
};

export const PLANET_DELTA: Planet = {
  id: 'planet_delta',
  name: '德尔塔军事星',
  type: PlanetType.TECH_STAR,
  category: PlanetCategory.REGULAR,
  level: 9,
  description: '联邦军事要塞。拥有坚固的防御工事和先进的武器系统，是对抗虚空生物的前线基地。',
  dangerLevel: 'medium',
  factionControl: FactionType.FEDERATION,
  resources: [
    { itemId: 'weapon_parts', dropRate: 0.4, minAmount: 1, maxAmount: 2 },
    { itemId: 'armor_plate', dropRate: 0.35, minAmount: 1, maxAmount: 2 },
    { itemId: 'military_supplies', dropRate: 0.3, minAmount: 1, maxAmount: 2 },
  ],
  enemies: [
    { enemyId: 'void_soldier', spawnRate: 0.4, minCount: 2, maxCount: 4 },
    { enemyId: 'battle_drone', spawnRate: 0.3, minCount: 1, maxCount: 2 },
  ],
  specialLoot: ['military_blueprint', 'combat_gear'],
  explorationTime: 35,
  requiredShipLevel: 5,
};

export const PLANET_EPSILON: Planet = {
  id: 'planet_epsilon',
  name: '艾普西隆贸易星',
  type: PlanetType.TECH_STAR,
  category: PlanetCategory.REGULAR,
  level: 7,
  description: '银河系最大的贸易中心。来自各个势力的商人在此交易，可以买到稀有的物资和装备。',
  dangerLevel: 'low',
  factionControl: FactionType.FEDERATION,
  resources: [
    { itemId: 'trade_goods', dropRate: 0.5, minAmount: 2, maxAmount: 4 },
    { itemId: 'rare_materials', dropRate: 0.3, minAmount: 1, maxAmount: 2 },
    { itemId: 'luxury_items', dropRate: 0.2, minAmount: 1, maxAmount: 1 },
  ],
  enemies: [
    { enemyId: 'space_pirate', spawnRate: 0.25, minCount: 1, maxCount: 2 },
    { enemyId: 'smuggler', spawnRate: 0.2, minCount: 1, maxCount: 2 },
  ],
  specialLoot: ['trade_permit', 'rare_goods'],
  explorationTime: 25,
  requiredShipLevel: 4,
};

export const PLANET_ZETA: Planet = {
  id: 'planet_zeta',
  name: '泽塔能源星',
  type: PlanetType.TECH_STAR,
  category: PlanetCategory.REGULAR,
  level: 11,
  description: '拥有丰富能源矿藏的星球。地表布满能源采集设施和储能站，是整个星区的能源供应中心。',
  dangerLevel: 'medium',
  factionControl: FactionType.FEDERATION,
  resources: [
    { itemId: 'energy_crystal', dropRate: 0.6, minAmount: 2, maxAmount: 5 },
    { itemId: 'plasma_core', dropRate: 0.35, minAmount: 1, maxAmount: 2 },
    { itemId: 'fusion_material', dropRate: 0.25, minAmount: 1, maxAmount: 1 },
  ],
  enemies: [
    { enemyId: 'energy_leech', spawnRate: 0.4, minCount: 2, maxCount: 3 },
    { enemyId: 'plasma_beast', spawnRate: 0.3, minCount: 1, maxCount: 2 },
  ],
  specialLoot: ['energy_blueprint', 'power_cell'],
  explorationTime: 35,
  requiredShipLevel: 6,
};

export const PLANET_ETA: Planet = {
  id: 'planet_eta',
  name: '伊塔农业星',
  type: PlanetType.TECH_STAR,
  category: PlanetCategory.REGULAR,
  level: 4,
  description: '联邦的粮食生产基地。拥有先进的生态穹顶和水培农场，为整个星区提供食物供应。',
  dangerLevel: 'low',
  factionControl: FactionType.FEDERATION,
  resources: [
    { itemId: 'food_rations', dropRate: 0.7, minAmount: 3, maxAmount: 6 },
    { itemId: 'bio_materials', dropRate: 0.4, minAmount: 1, maxAmount: 3 },
    { itemId: 'seeds', dropRate: 0.3, minAmount: 1, maxAmount: 2 },
  ],
  enemies: [
    { enemyId: 'mutated_crop', spawnRate: 0.25, minCount: 1, maxCount: 2 },
    { enemyId: 'pest_swarm', spawnRate: 0.3, minCount: 2, maxCount: 4 },
  ],
  specialLoot: ['agricultural_tech', 'food_supplies'],
  explorationTime: 25,
  requiredShipLevel: 2,
};

export const PLANET_THETA: Planet = {
  id: 'planet_theta',
  name: '西塔医疗星',
  type: PlanetType.TECH_STAR,
  category: PlanetCategory.REGULAR,
  level: 8,
  description: '联邦最先进的医疗中心。拥有顶尖的医疗设施和药物研发中心，是伤员治疗的首选之地。',
  dangerLevel: 'low',
  factionControl: FactionType.FEDERATION,
  resources: [
    { itemId: 'medical_supplies', dropRate: 0.6, minAmount: 2, maxAmount: 4 },
    { itemId: 'healing_serum', dropRate: 0.4, minAmount: 1, maxAmount: 2 },
    { itemId: 'bio_samples', dropRate: 0.3, minAmount: 1, maxAmount: 2 },
  ],
  enemies: [
    { enemyId: 'medical_drone', spawnRate: 0.2, minCount: 1, maxCount: 2 },
    { enemyId: 'virus_carrier', spawnRate: 0.25, minCount: 1, maxCount: 1 },
  ],
  specialLoot: ['medical_blueprint', 'healing_tech'],
  explorationTime: 30,
  requiredShipLevel: 4,
};

// ==================== 废土星（8个）====================

export const PLANET_WITHERED: Planet = {
  id: 'planet_withered',
  name: '荒芜废土星',
  type: PlanetType.WASTELAND,
  category: PlanetCategory.REGULAR,
  level: 2,
  description: '一颗被虚空侵蚀的废弃星球。地表布满裂缝和废墟，曾经的城市如今只剩下断壁残垣。',
  dangerLevel: 'low',
  factionControl: FactionType.STAR_DEBRIS,
  resources: [
    { itemId: 'scrap_metal', dropRate: 0.5, minAmount: 2, maxAmount: 5 },
    { itemId: 'salvage_parts', dropRate: 0.4, minAmount: 1, maxAmount: 3 },
    { itemId: 'void_residue', dropRate: 0.2, minAmount: 1, maxAmount: 2 },
  ],
  enemies: [
    { enemyId: 'void_scavenger', spawnRate: 0.4, minCount: 1, maxCount: 3 },
    { enemyId: 'withered_beast', spawnRate: 0.3, minCount: 1, maxCount: 2 },
  ],
  specialLoot: ['salvage_tech', 'old_world_relic'],
  explorationTime: 25,
  requiredShipLevel: 1,
};

export const PLANET_RUINS: Planet = {
  id: 'planet_ruins',
  name: '遗迹废土星',
  type: PlanetType.WASTELAND,
  category: PlanetCategory.REGULAR,
  level: 5,
  description: '古代文明的遗迹遍布星球表面。虽然文明已经消亡，但遗迹中仍藏有珍贵的技术和知识。',
  dangerLevel: 'medium',
  factionControl: FactionType.STAR_DEBRIS,
  resources: [
    { itemId: 'ancient_tech', dropRate: 0.3, minAmount: 1, maxAmount: 2 },
    { itemId: 'relic_fragment', dropRate: 0.25, minAmount: 1, maxAmount: 1 },
    { itemId: 'unknown_alloy', dropRate: 0.4, minAmount: 1, maxAmount: 3 },
  ],
  enemies: [
    { enemyId: 'ruin_guardian', spawnRate: 0.35, minCount: 1, maxCount: 2 },
    { enemyId: 'ancient_construct', spawnRate: 0.25, minCount: 1, maxCount: 1 },
  ],
  specialLoot: ['ancient_blueprint', 'lost_knowledge'],
  explorationTime: 30,
  requiredShipLevel: 3,
};

export const PLANET_ABYSS: Planet = {
  id: 'planet_abyss',
  name: '深渊废土星',
  type: PlanetType.WASTELAND,
  category: PlanetCategory.REGULAR,
  level: 14,
  description: '星球表面布满深不见底的裂缝，虚空能量从裂缝中涌出，将一切生命吞噬。',
  dangerLevel: 'high',
  factionControl: FactionType.CHAOS_GODS,
  resources: [
    { itemId: 'abyssal_essence', dropRate: 0.3, minAmount: 1, maxAmount: 2 },
    { itemId: 'void_crystal', dropRate: 0.25, minAmount: 1, maxAmount: 2 },
    { itemId: 'dark_matter', dropRate: 0.15, minAmount: 1, maxAmount: 1 },
  ],
  enemies: [
    { enemyId: 'abyssal_horror', spawnRate: 0.35, minCount: 1, maxCount: 2 },
    { enemyId: 'void_tentacle', spawnRate: 0.3, minCount: 2, maxCount: 4 },
    { enemyId: 'dark_spawn', spawnRate: 0.25, minCount: 1, maxCount: 2 },
  ],
  specialLoot: ['abyssal_relic', 'void_blueprint'],
  explorationTime: 40,
  requiredShipLevel: 7,
};

export const PLANET_CORRUPTED: Planet = {
  id: 'planet_corrupted',
  name: '腐化废土星',
  type: PlanetType.WASTELAND,
  category: PlanetCategory.REGULAR,
  level: 16,
  description: '整颗星球被虚空腐化，地表覆盖着扭曲的有机物质，空气中弥漫着腐蚀性的气体。',
  dangerLevel: 'high',
  factionControl: FactionType.CHAOS_GODS,
  resources: [
    { itemId: 'corrupted_organism', dropRate: 0.4, minAmount: 1, maxAmount: 3 },
    { itemId: 'toxic_extract', dropRate: 0.3, minAmount: 1, maxAmount: 2 },
    { itemId: 'mutation_sample', dropRate: 0.2, minAmount: 1, maxAmount: 1 },
  ],
  enemies: [
    { enemyId: 'corrupted_beast', spawnRate: 0.4, minCount: 2, maxCount: 3 },
    { enemyId: 'toxic_swarm', spawnRate: 0.35, minCount: 3, maxCount: 5 },
    { enemyId: 'mutation_horror', spawnRate: 0.25, minCount: 1, maxCount: 1 },
  ],
  specialLoot: ['corruption_cure', 'bio_weapon'],
  explorationTime: 45,
  requiredShipLevel: 8,
};

export const PLANET_SHATTERED: Planet = {
  id: 'planet_shattered',
  name: '破碎废土星',
  type: PlanetType.WASTELAND,
  category: PlanetCategory.REGULAR,
  level: 19,
  description: '曾经繁荣的星球如今支离破碎，巨大的碎片漂浮在太空中，只剩下核心部分还在勉强维持。',
  dangerLevel: 'very_high',
  factionControl: FactionType.STAR_DEBRIS,
  resources: [
    { itemId: 'core_fragment', dropRate: 0.25, minAmount: 1, maxAmount: 2 },
    { itemId: 'planetary_debris', dropRate: 0.5, minAmount: 2, maxAmount: 5 },
    { itemId: 'gravity_crystal', dropRate: 0.2, minAmount: 1, maxAmount: 1 },
  ],
  enemies: [
    { enemyId: 'gravity_anomaly', spawnRate: 0.3, minCount: 1, maxCount: 2 },
    { enemyId: 'debris_collector', spawnRate: 0.35, minCount: 2, maxCount: 3 },
    { enemyId: 'core_guardian', spawnRate: 0.2, minCount: 1, maxCount: 1 },
  ],
  specialLoot: ['gravity_tech', 'planetary_core'],
  explorationTime: 50,
  requiredShipLevel: 10,
};

export const PLANET_FORSAKEN: Planet = {
  id: 'planet_forsaken',
  name: '遗弃废土星',
  type: PlanetType.WASTELAND,
  category: PlanetCategory.REGULAR,
  level: 13,
  description: '被所有势力遗弃的星球。曾经这里有过文明，如今只剩下空荡荡的城市和无尽的寂静。',
  dangerLevel: 'medium',
  factionControl: FactionType.STAR_DEBRIS,
  resources: [
    { itemId: 'abandoned_goods', dropRate: 0.45, minAmount: 1, maxAmount: 3 },
    { itemId: 'old_tech', dropRate: 0.35, minAmount: 1, maxAmount: 2 },
    { itemId: 'survivor_journal', dropRate: 0.15, minAmount: 1, maxAmount: 1 },
  ],
  enemies: [
    { enemyId: 'lone_survivor', spawnRate: 0.25, minCount: 1, maxCount: 1 },
    { enemyId: 'abandoned_drone', spawnRate: 0.3, minCount: 1, maxCount: 2 },
    { enemyId: 'void_stalker', spawnRate: 0.35, minCount: 1, maxCount: 2 },
  ],
  specialLoot: ['survivor_cache', 'abandoned_treasure'],
  explorationTime: 40,
  requiredShipLevel: 7,
};

export const PLANET_INFESTED: Planet = {
  id: 'planet_infested',
  name: '虫巢废土星',
  type: PlanetType.WASTELAND,
  category: PlanetCategory.REGULAR,
  level: 17,
  description: '整颗星球被虚空虫族占领。地表布满虫巢和隧道，虫族在地下建立了庞大的巢穴网络。',
  dangerLevel: 'high',
  factionControl: FactionType.CHAOS_GODS,
  resources: [
    { itemId: 'chitin_plate', dropRate: 0.5, minAmount: 2, maxAmount: 4 },
    { itemId: 'bug_venom', dropRate: 0.3, minAmount: 1, maxAmount: 2 },
    { itemId: 'hive_essence', dropRate: 0.2, minAmount: 1, maxAmount: 1 },
  ],
  enemies: [
    { enemyId: 'void_bug', spawnRate: 0.45, minCount: 3, maxCount: 6 },
    { enemyId: 'hive_guardian', spawnRate: 0.3, minCount: 1, maxCount: 2 },
    { enemyId: 'bug_queen', spawnRate: 0.15, minCount: 1, maxCount: 1 },
  ],
  specialLoot: ['hive_tech', 'bug_weapon'],
  explorationTime: 45,
  requiredShipLevel: 9,
};

export const PLANET_BURNT: Planet = {
  id: 'planet_burnt',
  name: '焦土废土星',
  type: PlanetType.WASTELAND,
  category: PlanetCategory.REGULAR,
  level: 15,
  description: '经历过毁灭性战争的星球。地表被烧成焦黑，空气中弥漫着灰烬和死亡的气息。',
  dangerLevel: 'high',
  factionControl: FactionType.STAR_DEBRIS,
  resources: [
    { itemId: 'ash_ore', dropRate: 0.55, minAmount: 2, maxAmount: 5 },
    { itemId: 'war_remnants', dropRate: 0.35, minAmount: 1, maxAmount: 3 },
    { itemId: 'heat_crystal', dropRate: 0.25, minAmount: 1, maxAmount: 2 },
  ],
  enemies: [
    { enemyId: 'ash_wraith', spawnRate: 0.35, minCount: 2, maxCount: 3 },
    { enemyId: 'war_machine', spawnRate: 0.3, minCount: 1, maxCount: 2 },
    { enemyId: 'phoenix_spawn', spawnRate: 0.2, minCount: 1, maxCount: 1 },
  ],
  specialLoot: ['war_tech', 'phoenix_ash'],
  explorationTime: 45,
  requiredShipLevel: 8,
};

// ==================== 混沌神域星（8个）====================

export const PLANET_TYPHON: Planet = {
  id: 'planet_typhon',
  name: '提丰混沌星',
  type: PlanetType.GOD_DOMAIN,
  category: PlanetCategory.MYTHOLOGY,
  level: 22,
  description: '混沌之神提丰的领地。这颗星球充满了混乱的能量，物理法则在这里经常失效，是最危险的区域之一。',
  dangerLevel: 'extreme',
  godId: 'god_typhon',
  factionControl: FactionType.CHAOS_GODS,
  resources: [
    { itemId: 'chaos_essence', dropRate: 0.3, minAmount: 1, maxAmount: 2 },
    { itemId: 'unstable_matter', dropRate: 0.25, minAmount: 1, maxAmount: 2 },
    { itemId: 'reality_shard', dropRate: 0.15, minAmount: 1, maxAmount: 1 },
  ],
  enemies: [
    { enemyId: 'chaos_spawn', spawnRate: 0.4, minCount: 2, maxCount: 4 },
    { enemyId: 'reality_warp', spawnRate: 0.3, minCount: 1, maxCount: 2 },
    { enemyId: 'chaos_champion', spawnRate: 0.2, minCount: 1, maxCount: 1 },
  ],
  specialLoot: ['chaos_relic', 'typhon_permission', 'reality_bender'],
  explorationTime: 55,
  requiredShipLevel: 11,
};

export const PLANET_LOKI: Planet = {
  id: 'planet_loki',
  name: '洛基诡计星',
  type: PlanetType.GOD_DOMAIN,
  category: PlanetCategory.MYTHOLOGY,
  level: 19,
  description: '诡计之神洛基的藏身之处。星球表面布满了幻象和陷阱，真实与虚假在这里难以分辨。',
  dangerLevel: 'very_high',
  godId: 'god_loki',
  factionControl: FactionType.CHAOS_GODS,
  resources: [
    { itemId: 'illusion_crystal', dropRate: 0.3, minAmount: 1, maxAmount: 2 },
    { itemId: 'trickster_token', dropRate: 0.25, minAmount: 1, maxAmount: 2 },
    { itemId: 'deception_essence', dropRate: 0.2, minAmount: 1, maxAmount: 1 },
  ],
  enemies: [
    { enemyId: 'illusion_beast', spawnRate: 0.4, minCount: 2, maxCount: 3 },
    { enemyId: 'trickster_clone', spawnRate: 0.35, minCount: 2, maxCount: 4 },
    { enemyId: 'deception_master', spawnRate: 0.2, minCount: 1, maxCount: 1 },
  ],
  specialLoot: ['loki_mask', 'loki_permission', 'illusion_gem'],
  explorationTime: 50,
  requiredShipLevel: 10,
};

export const PLANET_SURTUR: Planet = {
  id: 'planet_surtur',
  name: '苏尔特尔炎魔星',
  type: PlanetType.GOD_DOMAIN,
  category: PlanetCategory.MYTHOLOGY,
  level: 24,
  description: '火焰巨人苏尔特尔的领地。整颗星球被永恒之火包围，地表温度极高，只有最坚韧的航船才能接近。',
  dangerLevel: 'extreme',
  godId: 'god_surtur',
  factionControl: FactionType.CHAOS_GODS,
  resources: [
    { itemId: 'eternal_flame', dropRate: 0.25, minAmount: 1, maxAmount: 2 },
    { itemId: 'magma_core', dropRate: 0.35, minAmount: 1, maxAmount: 2 },
    { itemId: 'fire_essence', dropRate: 0.3, minAmount: 1, maxAmount: 3 },
  ],
  enemies: [
    { enemyId: 'fire_giant', spawnRate: 0.35, minCount: 1, maxCount: 2 },
    { enemyId: 'magma_elemental', spawnRate: 0.4, minCount: 2, maxCount: 3 },
    { enemyId: 'flame_demon', spawnRate: 0.25, minCount: 1, maxCount: 1 },
  ],
  specialLoot: ['surtur_sword', 'surtur_permission', 'eternal_ember'],
  explorationTime: 60,
  requiredShipLevel: 12,
};

export const PLANET_JORMUNGANDR: Planet = {
  id: 'planet_jormungandr',
  name: '耶梦加得巨蛇星',
  type: PlanetType.GOD_DOMAIN,
  category: PlanetCategory.MYTHOLOGY,
  level: 21,
  description: '世界蛇耶梦加得的沉睡之地。星球表面布满巨大的蛇形痕迹，据说耶梦加得的身体环绕着整颗星球。',
  dangerLevel: 'very_high',
  godId: 'god_jormungandr',
  factionControl: FactionType.CHAOS_GODS,
  resources: [
    { itemId: 'serpent_scale', dropRate: 0.3, minAmount: 1, maxAmount: 3 },
    { itemId: 'venom_sac', dropRate: 0.25, minAmount: 1, maxAmount: 2 },
    { itemId: 'world_essence', dropRate: 0.2, minAmount: 1, maxAmount: 1 },
  ],
  enemies: [
    { enemyId: 'serpent_spawn', spawnRate: 0.4, minCount: 2, maxCount: 4 },
    { enemyId: 'venom_spitter', spawnRate: 0.35, minCount: 2, maxCount: 3 },
    { enemyId: 'world_guardian', spawnRate: 0.2, minCount: 1, maxCount: 1 },
  ],
  specialLoot: ['jormungandr_fang', 'jormungandr_permission', 'world_scale'],
  explorationTime: 55,
  requiredShipLevel: 11,
};

export const PLANET_FENRIR: Planet = {
  id: 'planet_fenrir',
  name: '芬里尔狼王星',
  type: PlanetType.GOD_DOMAIN,
  category: PlanetCategory.MYTHOLOGY,
  level: 23,
  description: '巨狼芬里尔的领地。这颗星球充满了野性和破坏的气息，据说芬里尔的嚎叫能够撕裂空间。',
  dangerLevel: 'extreme',
  godId: 'god_fenrir',
  factionControl: FactionType.CHAOS_GODS,
  resources: [
    { itemId: 'wolf_fang', dropRate: 0.3, minAmount: 1, maxAmount: 2 },
    { itemId: 'beast_pelt', dropRate: 0.35, minAmount: 1, maxAmount: 3 },
    { itemId: 'moon_essence', dropRate: 0.2, minAmount: 1, maxAmount: 1 },
  ],
  enemies: [
    { enemyId: 'dire_wolf', spawnRate: 0.45, minCount: 3, maxCount: 5 },
    { enemyId: 'beast_alpha', spawnRate: 0.3, minCount: 1, maxCount: 2 },
    { enemyId: 'moon_hunter', spawnRate: 0.2, minCount: 1, maxCount: 1 },
  ],
  specialLoot: ['fenrir_chain', 'fenrir_permission', 'moon_fang'],
  explorationTime: 55,
  requiredShipLevel: 12,
};

export const PLANET_HADES: Planet = {
  id: 'planet_hades',
  name: '哈迪斯冥王星',
  type: PlanetType.GOD_DOMAIN,
  category: PlanetCategory.MYTHOLOGY,
  level: 26,
  description: '冥王哈迪斯的领地。这颗星球是死者的归宿，冥河环绕着整颗星球，渡船人卡戎在河上摆渡亡灵。',
  dangerLevel: 'extreme',
  godId: 'god_hades',
  factionControl: FactionType.CHAOS_GODS,
  resources: [
    { itemId: 'styx_water', dropRate: 0.25, minAmount: 1, maxAmount: 2 },
    { itemId: 'soul_gem', dropRate: 0.2, minAmount: 1, maxAmount: 1 },
    { itemId: 'underworld_ore', dropRate: 0.35, minAmount: 1, maxAmount: 3 },
  ],
  enemies: [
    { enemyId: 'soul_collector', spawnRate: 0.35, minCount: 2, maxCount: 3 },
    { enemyId: 'styx_guardian', spawnRate: 0.3, minCount: 1, maxCount: 2 },
    { enemyId: 'cerberus_spawn', spawnRate: 0.2, minCount: 1, maxCount: 1 },
  ],
  specialLoot: ['hades_helmet', 'hades_permission', 'styx_coin'],
  explorationTime: 65,
  requiredShipLevel: 13,
};

export const PLANET_EREBUS: Planet = {
  id: 'planet_erebus',
  name: '厄瑞玻斯黑暗星',
  type: PlanetType.GOD_DOMAIN,
  category: PlanetCategory.MYTHOLOGY,
  level: 20,
  description: '黑暗之神厄瑞玻斯的领地。这颗星球被永恒的黑暗笼罩，光线在这里会被吞噬，只有特殊的传感器才能导航。',
  dangerLevel: 'very_high',
  godId: 'god_erebus',
  factionControl: FactionType.CHAOS_GODS,
  resources: [
    { itemId: 'dark_essence', dropRate: 0.35, minAmount: 1, maxAmount: 3 },
    { itemId: 'shadow_crystal', dropRate: 0.3, minAmount: 1, maxAmount: 2 },
    { itemId: 'void_heart', dropRate: 0.15, minAmount: 1, maxAmount: 1 },
  ],
  enemies: [
    { enemyId: 'shadow_beast', spawnRate: 0.45, minCount: 2, maxCount: 4 },
    { enemyId: 'dark_stalker', spawnRate: 0.35, minCount: 1, maxCount: 2 },
    { enemyId: 'void_nightmare', spawnRate: 0.2, minCount: 1, maxCount: 1 },
  ],
  specialLoot: ['erebus_cloak', 'erebus_permission', 'dark_orb'],
  explorationTime: 50,
  requiredShipLevel: 10,
};

export const PLANET_NYX: Planet = {
  id: 'planet_nyx',
  name: '倪克斯夜女星',
  type: PlanetType.GOD_DOMAIN,
  category: PlanetCategory.MYTHOLOGY,
  level: 27,
  description: '黑夜女神倪克斯的领地。这颗星球是黑夜的起源，星辰在这里熄灭，只有最深沉的黑暗才能存在。',
  dangerLevel: 'extreme',
  godId: 'god_nyx',
  factionControl: FactionType.CHAOS_GODS,
  resources: [
    { itemId: 'night_essence', dropRate: 0.3, minAmount: 1, maxAmount: 2 },
    { itemId: 'star_dust', dropRate: 0.25, minAmount: 1, maxAmount: 2 },
    { itemId: 'dream_fragment', dropRate: 0.2, minAmount: 1, maxAmount: 1 },
  ],
  enemies: [
    { enemyId: 'night_mare', spawnRate: 0.4, minCount: 2, maxCount: 3 },
    { enemyId: 'dream_eater', spawnRate: 0.35, minCount: 1, maxCount: 2 },
    { enemyId: 'star_devourer', spawnRate: 0.2, minCount: 1, maxCount: 1 },
  ],
  specialLoot: ['nyx_veil', 'nyx_permission', 'night_pearl'],
  explorationTime: 65,
  requiredShipLevel: 13,
};

// ==================== 导出所有星球 ====================

export const ALL_PLANETS_FULL: Planet[] = [
  // 核心神域星（8个）
  PLANET_HELIOS,
  PLANET_OLYMPUS,
  PLANET_DELPHI,
  PLANET_POSEIDON,
  PLANET_VALHALLA,
  PLANET_BIFROST,
  PLANET_MIMIR,
  PLANET_HEL,
  
  // 科技星（8个）
  PLANET_ALPHA,
  PLANET_BETA,
  PLANET_GAMMA,
  PLANET_DELTA,
  PLANET_EPSILON,
  PLANET_ZETA,
  PLANET_ETA,
  PLANET_THETA,
  
  // 废土星（8个）
  PLANET_WITHERED,
  PLANET_RUINS,
  PLANET_ABYSS,
  PLANET_CORRUPTED,
  PLANET_SHATTERED,
  PLANET_FORSAKEN,
  PLANET_INFESTED,
  PLANET_BURNT,
  
  // 混沌神域星（8个）
  PLANET_TYPHON,
  PLANET_LOKI,
  PLANET_SURTUR,
  PLANET_JORMUNGANDR,
  PLANET_FENRIR,
  PLANET_HADES,
  PLANET_EREBUS,
  PLANET_NYX,
];

// 按等级排序的星球
export const PLANETS_BY_LEVEL = [...ALL_PLANETS_FULL].sort((a, b) => a.level - b.level);

// 按类型分类的星球
export const PLANETS_BY_TYPE = {
  [PlanetType.TECH_STAR]: ALL_PLANETS_FULL.filter(p => p.type === PlanetType.TECH_STAR),
  [PlanetType.GOD_DOMAIN]: ALL_PLANETS_FULL.filter(p => p.type === PlanetType.GOD_DOMAIN),
  [PlanetType.WASTELAND]: ALL_PLANETS_FULL.filter(p => p.type === PlanetType.WASTELAND),
};

// 按势力分类的星球
export const PLANETS_BY_FACTION = {
  [FactionType.FEDERATION]: ALL_PLANETS_FULL.filter(p => p.factionControl === FactionType.FEDERATION),
  [FactionType.ORDER_GODS]: ALL_PLANETS_FULL.filter(p => p.factionControl === FactionType.ORDER_GODS),
  [FactionType.CHAOS_GODS]: ALL_PLANETS_FULL.filter(p => p.factionControl === FactionType.CHAOS_GODS),
  [FactionType.STAR_DEBRIS]: ALL_PLANETS_FULL.filter(p => p.factionControl === FactionType.STAR_DEBRIS),
};

// 辅助函数
export function getPlanetById(id: string): Planet | undefined {
  return ALL_PLANETS_FULL.find(p => p.id === id);
}

export function getPlanetsByLevelRange(minLevel: number, maxLevel: number): Planet[] {
  return ALL_PLANETS_FULL.filter(p => p.level >= minLevel && p.level <= maxLevel);
}

export function getAccessiblePlanets(shipLevel: number): Planet[] {
  return ALL_PLANETS_FULL.filter(p => (p.requiredShipLevel || 1) <= shipLevel);
}

export function getPlanetsByDangerLevel(dangerLevel: Planet['dangerLevel']): Planet[] {
  return ALL_PLANETS_FULL.filter(p => p.dangerLevel === dangerLevel);
}

export default ALL_PLANETS_FULL;
