import type { EnemyTier } from './types';
import { ArmorQuality, ARMOR_QUALITY_NAMES } from './nanoArmorRecipes';

// ============================================
// 敌人等级系统 - 保留用于战斗计算
// ============================================

// 敌人等级定义
export const ENEMY_TIERS: Record<EnemyTier, {
  name: string;
  hpMultiplier: number;
  attackMultiplier: number;
  defenseMultiplier: number;
  expMultiplier: number;
  lootQuality: number;
}> = {
  T1: {
    name: '普通级',
    hpMultiplier: 1.0,
    attackMultiplier: 1.0,
    defenseMultiplier: 1.0,
    expMultiplier: 1.0,
    lootQuality: 1,
  },
  'T1+': {
    name: '普通+级',
    hpMultiplier: 1.3,
    attackMultiplier: 1.2,
    defenseMultiplier: 1.2,
    expMultiplier: 1.3,
    lootQuality: 1.5,
  },
  T2: {
    name: '精英级',
    hpMultiplier: 1.6,
    attackMultiplier: 1.5,
    defenseMultiplier: 1.5,
    expMultiplier: 1.8,
    lootQuality: 2,
  },
  'T2+': {
    name: '精英+级',
    hpMultiplier: 2.0,
    attackMultiplier: 1.8,
    defenseMultiplier: 1.8,
    expMultiplier: 2.3,
    lootQuality: 2.5,
  },
  T3: {
    name: '首领级',
    hpMultiplier: 2.5,
    attackMultiplier: 2.2,
    defenseMultiplier: 2.2,
    expMultiplier: 3.0,
    lootQuality: 3,
  },
  'T3+': {
    name: '首领+级',
    hpMultiplier: 3.0,
    attackMultiplier: 2.6,
    defenseMultiplier: 2.6,
    expMultiplier: 4.0,
    lootQuality: 4,
  },
  'T3++': {
    name: '传说级',
    hpMultiplier: 3.5,
    attackMultiplier: 3.0,
    defenseMultiplier: 3.0,
    expMultiplier: 5.0,
    lootQuality: 5,
  },
  'T4': {
    name: '神话级',
    hpMultiplier: 4.0,
    attackMultiplier: 3.5,
    defenseMultiplier: 3.5,
    expMultiplier: 6.0,
    lootQuality: 6,
  },
  'T4+': {
    name: '神话+级',
    hpMultiplier: 4.5,
    attackMultiplier: 4.0,
    defenseMultiplier: 4.0,
    expMultiplier: 7.0,
    lootQuality: 7,
  },
  'T5': {
    name: '半神级',
    hpMultiplier: 5.0,
    attackMultiplier: 4.5,
    defenseMultiplier: 4.5,
    expMultiplier: 8.0,
    lootQuality: 8,
  },
  'T5+': {
    name: '半神+级',
    hpMultiplier: 5.5,
    attackMultiplier: 5.0,
    defenseMultiplier: 5.0,
    expMultiplier: 9.0,
    lootQuality: 9,
  },
  'T6': {
    name: '真神级',
    hpMultiplier: 6.0,
    attackMultiplier: 5.5,
    defenseMultiplier: 5.5,
    expMultiplier: 10.0,
    lootQuality: 10,
  },
  'T6+': {
    name: '真神+级',
    hpMultiplier: 6.5,
    attackMultiplier: 6.0,
    defenseMultiplier: 6.0,
    expMultiplier: 11.0,
    lootQuality: 11,
  },
  'T7': {
    name: '主神级',
    hpMultiplier: 7.0,
    attackMultiplier: 6.5,
    defenseMultiplier: 6.5,
    expMultiplier: 12.0,
    lootQuality: 12,
  },
  'T7+': {
    name: '主神+级',
    hpMultiplier: 7.5,
    attackMultiplier: 7.0,
    defenseMultiplier: 7.0,
    expMultiplier: 13.0,
    lootQuality: 13,
  },
  'T8': {
    name: '创世级',
    hpMultiplier: 8.0,
    attackMultiplier: 7.5,
    defenseMultiplier: 7.5,
    expMultiplier: 14.0,
    lootQuality: 14,
  },
};

// 基础敌人属性（T1级别基准）
export const BASE_ENEMY_STATS = {
  hp: 200,
  attack: 20,
  defense: 10,
  hitRate: 100,
  dodgeRate: 15,
  attackSpeed: 1.0,
  critRate: 0.05,
  penetration: 0,
  skillCoefficient: 1.0,
};

// 计算敌人实际属性
export function calculateEnemyStats(tier: EnemyTier, level: number = 1) {
  const tierData = ENEMY_TIERS[tier];
  const levelMultiplier = 1 + (level - 1) * 0.1; // 每级提升10%

  return {
    hp: Math.floor(BASE_ENEMY_STATS.hp * tierData.hpMultiplier * levelMultiplier),
    attack: Math.floor(BASE_ENEMY_STATS.attack * tierData.attackMultiplier * levelMultiplier),
    defense: Math.floor(BASE_ENEMY_STATS.defense * tierData.defenseMultiplier * levelMultiplier),
    hitRate: BASE_ENEMY_STATS.hitRate + (tierData.lootQuality * 5),
    dodgeRate: BASE_ENEMY_STATS.dodgeRate + (tierData.lootQuality * 3),
    attackSpeed: BASE_ENEMY_STATS.attackSpeed + (tierData.lootQuality * 0.05),
    critRate: Math.min(0.3, BASE_ENEMY_STATS.critRate + (tierData.lootQuality * 0.02)),
    penetration: tierData.lootQuality * 0.01,
    skillCoefficient: BASE_ENEMY_STATS.skillCoefficient + (tierData.lootQuality * 0.1),
    expReward: Math.floor(50 * tierData.expMultiplier * levelMultiplier),
  };
}

// ============================================
// 旧站台系统已删除
// 请使用新的星球探索系统（planets_full.ts）
// ============================================

// 保留空数组以保持向后兼容（如果有代码引用 LOCATIONS）
export const REGULAR_LOCATIONS: any[] = [];
export const LOCATIONS = REGULAR_LOCATIONS;

// 已弃用的函数 - 返回空值以保持兼容
export function calculateExplorationRewards(): any[] { return []; }
export function getRecommendedPower(): number { return 25; }
export function getEnemyTierInfo(): { normal: string; elite: string; boss: string } {
  return { normal: 'T1', elite: 'T1+', boss: 'T2' };
}
export function getRandomLoot(): string | null { return null; }
export function rollMaterialQuality(): ArmorQuality { return ArmorQuality.STARDUST; }
export function getQualityRatesForStation() { return {}; }
