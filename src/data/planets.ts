// 《星航荒宇》星球数据定义
// 8个核心星球，对应8位神明

import {
  Planet,
  PlanetType,
  PlanetCategory,
  FactionType,
  GodDomain,
} from './types_new';

// ==================== 希腊神域星 ====================

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
    { itemId: 'mat_001', dropRate: 0.5, minAmount: 2, maxAmount: 5 },
    { itemId: 'mat_002', dropRate: 0.4, minAmount: 1, maxAmount: 3 },
    { itemId: 'mat_003', dropRate: 0.3, minAmount: 1, maxAmount: 2 },
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
    { itemId: 'mat_004', dropRate: 0.4, minAmount: 1, maxAmount: 3 },
    { itemId: 'mat_005', dropRate: 0.35, minAmount: 1, maxAmount: 2 },
    { itemId: 'mat_006', dropRate: 0.25, minAmount: 1, maxAmount: 2 },
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
    { itemId: 'mat_002', dropRate: 0.45, minAmount: 2, maxAmount: 4 },
    { itemId: 'mat_004', dropRate: 0.35, minAmount: 1, maxAmount: 3 },
    { itemId: 'mat_007', dropRate: 0.3, minAmount: 1, maxAmount: 2 },
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
    { itemId: 'mat_003', dropRate: 0.4, minAmount: 2, maxAmount: 5 },
    { itemId: 'mat_005', dropRate: 0.35, minAmount: 1, maxAmount: 3 },
    { itemId: 'mat_008', dropRate: 0.25, minAmount: 1, maxAmount: 2 },
  ],
  enemies: [
    { enemyId: 'storm_shark', spawnRate: 0.35, minCount: 1, maxCount: 3 },
    { enemyId: 'reef_puppet', spawnRate: 0.3, minCount: 2, maxCount: 4 },
  ],
  specialLoot: ['poseidon_scale', 'ocean_permission'],
  explorationTime: 40,
  requiredShipLevel: 6,
};

// ==================== 北欧神域星 ====================

export const PLANET_VALHALLA: Planet = {
  id: 'planet_valhalla',
  name: '瓦尔哈拉迷雾星',
  type: PlanetType.GOD_DOMAIN,
  category: PlanetCategory.MYTHOLOGY,
  level: 8,
  description: '诡计之神洛基管控的临时据点。并非真正的瓦尔哈拉英灵殿，雾气浓厚，能见度极低，隐藏着被遗忘的英灵残魂。',
  dangerLevel: 'medium',
  godId: 'god_loki',
  factionControl: FactionType.CHAOS_GODS,
  resources: [
    { itemId: 'mat_001', dropRate: 0.5, minAmount: 2, maxAmount: 5 },
    { itemId: 'mat_006', dropRate: 0.3, minAmount: 1, maxAmount: 2 },
    { itemId: 'mat_009', dropRate: 0.2, minAmount: 1, maxAmount: 2 },
  ],
  enemies: [
    { enemyId: 'fog_wolf', spawnRate: 0.4, minCount: 2, maxCount: 4 },
    { enemyId: 'resentful_spirit', spawnRate: 0.35, minCount: 1, maxCount: 3 },
  ],
  specialLoot: ['valhalla_oath', 'loki_permission'],
  explorationTime: 35,
  requiredShipLevel: 4,
};

export const PLANET_BIFROST: Planet = {
  id: 'planet_bifrost',
  name: '彩虹桥断裂星',
  type: PlanetType.GOD_DOMAIN,
  category: PlanetCategory.MYTHOLOGY,
  level: 18,
  description: '雷神托尔的藏身之处。由七彩水晶碎片搭建，部分区域断裂悬空，下方是翻滚的星际黑雾，空间极不稳定。',
  dangerLevel: 'extreme',
  godId: 'god_thor',
  factionControl: FactionType.ORDER_GODS,
  resources: [
    { itemId: 'mat_004', dropRate: 0.35, minAmount: 1, maxAmount: 3 },
    { itemId: 'mat_007', dropRate: 0.3, minAmount: 1, maxAmount: 2 },
    { itemId: 'mat_010', dropRate: 0.25, minAmount: 1, maxAmount: 2 },
  ],
  enemies: [
    { enemyId: 'thunder_griffin', spawnRate: 0.35, minCount: 1, maxCount: 2 },
    { enemyId: 'crystal_puppet', spawnRate: 0.4, minCount: 2, maxCount: 4 },
    { enemyId: 'void_beast', spawnRate: 0.15, minCount: 1, maxCount: 1 },
  ],
  specialLoot: ['space_crystal', 'thor_permission', 'rainbow_bridge_fragment'],
  explorationTime: 50,
  requiredShipLevel: 10,
};

export const PLANET_MIMIR: Planet = {
  id: 'planet_mimir',
  name: '密米尔冰封星',
  type: PlanetType.GOD_DOMAIN,
  category: PlanetCategory.MYTHOLOGY,
  level: 14,
  description: '智慧之神密米尔的藏身之处。被永恒的寒冰覆盖，内部陈列着无数残破的卷轴，核心区域是冰封的智慧之泉。',
  dangerLevel: 'high',
  godId: 'god_mimir',
  factionControl: FactionType.ORDER_GODS,
  resources: [
    { itemId: 'mat_002', dropRate: 0.4, minAmount: 2, maxAmount: 4 },
    { itemId: 'mat_005', dropRate: 0.35, minAmount: 1, maxAmount: 3 },
    { itemId: 'mat_008', dropRate: 0.3, minAmount: 1, maxAmount: 2 },
  ],
  enemies: [
    { enemyId: 'ice_bear', spawnRate: 0.3, minCount: 1, maxCount: 2 },
    { enemyId: 'frozen_scroll_puppet', spawnRate: 0.35, minCount: 1, maxCount: 3 },
  ],
  specialLoot: ['mimir_tear', 'wisdom_permission'],
  explorationTime: 45,
  requiredShipLevel: 7,
};

export const PLANET_HEL: Planet = {
  id: 'planet_hel',
  name: '赫尔深渊星',
  type: PlanetType.GOD_DOMAIN,
  category: PlanetCategory.MYTHOLOGY,
  level: 20,
  description: '冥界女王赫尔的藏身之处。一半处于光明，一半陷入深渊，弥漫着腐朽的气息，深渊一侧不断有怪物灵魂涌出。',
  dangerLevel: 'extreme',
  godId: 'god_hel',
  factionControl: FactionType.ORDER_GODS,
  resources: [
    { itemId: 'mat_006', dropRate: 0.4, minAmount: 2, maxAmount: 4 },
    { itemId: 'mat_009', dropRate: 0.3, minAmount: 1, maxAmount: 2 },
    { itemId: 'mat_010', dropRate: 0.25, minAmount: 1, maxAmount: 2 },
  ],
  enemies: [
    { enemyId: 'abyss_monster', spawnRate: 0.3, minCount: 1, maxCount: 1 },
    { enemyId: 'soul_guardian', spawnRate: 0.4, minCount: 2, maxCount: 4 },
    { enemyId: 'void_ghost', spawnRate: 0.25, minCount: 1, maxCount: 3 },
  ],
  specialLoot: ['hel_core', 'underworld_permission'],
  explorationTime: 55,
  requiredShipLevel: 12,
};

// ==================== 科技星（新手区域）====================

export const PLANET_ALPHA: Planet = {
  id: 'planet_alpha',
  name: '阿尔法宜居星',
  type: PlanetType.TECH_STAR,
  category: PlanetCategory.REGULAR,
  level: 1,
  description: '银河联邦的首都星球，位于猎户座旋臂。这是联邦拓荒队员的出生地和主要休整地，拥有完善的科技体系和城市基建。',
  dangerLevel: 'safe',
  factionControl: FactionType.FEDERATION,
  resources: [
    { itemId: 'mat_001', dropRate: 0.6, minAmount: 3, maxAmount: 8 },
    { itemId: 'mat_002', dropRate: 0.5, minAmount: 2, maxAmount: 5 },
    { itemId: 'mat_003', dropRate: 0.4, minAmount: 2, maxAmount: 4 },
  ],
  enemies: [], // 安全区域无敌人
  specialLoot: ['federation_supplies'],
  explorationTime: 15,
  requiredShipLevel: 1,
};

// ==================== 废土星（资源区域）====================

export const PLANET_WITHERED: Planet = {
  id: 'planet_withered',
  name: '枯寂废土星',
  type: PlanetType.WASTELAND,
  category: PlanetCategory.REGULAR,
  level: 6,
  description: '原工业星，被虚空完全侵蚀。地表遍布虚空裂隙，大气中充斥着腐蚀性能量，但蕴藏着大量星核结晶。',
  dangerLevel: 'high',
  factionControl: undefined, // 无控制势力
  resources: [
    { itemId: 'mat_007', dropRate: 0.5, minAmount: 2, maxAmount: 6 },
    { itemId: 'mat_008', dropRate: 0.4, minAmount: 2, maxAmount: 5 },
    { itemId: 'mat_009', dropRate: 0.35, minAmount: 1, maxAmount: 3 },
  ],
  enemies: [
    { enemyId: 'void_crawler', spawnRate: 0.5, minCount: 2, maxCount: 5 },
    { enemyId: 'corrupted_drone', spawnRate: 0.3, minCount: 1, maxCount: 3 },
  ],
  specialLoot: ['purified_star_core'],
  explorationTime: 40,
  requiredShipLevel: 4,
};

// ==================== 星球集合 ====================

export const ALL_PLANETS: Planet[] = [
  PLANET_ALPHA,        // 新手安全区
  PLANET_HELIOS,       // 太阳神
  PLANET_VALHALLA,     // 诡计之神
  PLANET_DELPHI,       // 预言之神
  PLANET_POSEIDON,     // 海神
  PLANET_MIMIR,        // 智慧之神
  PLANET_OLYMPUS,      // 众神之王
  PLANET_BIFROST,      // 雷神
  PLANET_HEL,          // 冥界女王
  PLANET_WITHERED,     // 废土星
];

// ==================== 工具函数 ====================

/**
 * 根据ID获取星球
 */
export function getPlanetById(id: string): Planet | undefined {
  return ALL_PLANETS.find(planet => planet.id === id);
}

/**
 * 根据神明ID获取星球
 */
export function getPlanetByGodId(godId: string): Planet | undefined {
  return ALL_PLANETS.find(planet => planet.godId === godId);
}

/**
 * 获取指定类型的所有星球
 */
export function getPlanetsByType(type: PlanetType): Planet[] {
  return ALL_PLANETS.filter(planet => planet.type === type);
}

/**
 * 获取指定分类的所有星球
 */
export function getPlanetsByCategory(category: PlanetCategory): Planet[] {
  return ALL_PLANETS.filter(planet => planet.category === category);
}

/**
 * 获取指定势力控制的所有星球
 */
export function getPlanetsByFaction(faction: FactionType): Planet[] {
  return ALL_PLANETS.filter(planet => planet.factionControl === faction);
}

/**
 * 获取指定危险等级的所有星球
 */
export function getPlanetsByDangerLevel(dangerLevel: Planet['dangerLevel']): Planet[] {
  return ALL_PLANETS.filter(planet => planet.dangerLevel === dangerLevel);
}

/**
 * 获取玩家可探索的星球（满足航船等级要求）
 */
export function getAccessiblePlanets(shipLevel: number): Planet[] {
  return ALL_PLANETS.filter(planet => 
    (planet.requiredShipLevel || 1) <= shipLevel
  );
}

/**
 * 获取星球危险等级中文名称
 */
export function getDangerLevelName(dangerLevel: Planet['dangerLevel']): string {
  const names: Record<Planet['dangerLevel'], string> = {
    safe: '安全',
    low: '低危',
    medium: '中危',
    high: '高危',
    extreme: '极度危险',
  };
  return names[dangerLevel];
}

/**
 * 获取星球类型中文名称
 */
export function getPlanetTypeName(type: PlanetType): string {
  const names: Record<PlanetType, string> = {
    [PlanetType.TECH_STAR]: '科技星',
    [PlanetType.GOD_DOMAIN]: '神域星',
    [PlanetType.WASTELAND]: '废土星',
  };
  return names[type];
}

/**
 * 获取推荐探索等级范围
 */
export function getRecommendedLevelRange(planet: Planet): { min: number; max: number } {
  return {
    min: Math.max(1, planet.level - 3),
    max: planet.level + 5,
  };
}

export default ALL_PLANETS;
