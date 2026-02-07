// 《星航荒宇》虚空怪物数据
// 完全沿用旧怪物数值，仅改变名称和描述

import type { Enemy, EnemyTier } from './types';

export interface VoidCreature extends Enemy {
  tier: EnemyTier;
  hitRate: number;
  dodgeRate: number;
  attackSpeed: number;
  critRate: number;
  critDamage: number;
  guardRate: number;
  penetration: number;
  skillCoefficient: number;
  physicalReduction: number;
  power: number;
  specialMechanics: string[];
  planetId: string;
  creatureType: 'normal' | 'elite' | 'boss';
  description: string;
  icon: string;
}

// ============================================
// 星球1：阿尔法宜居星 (T1) - 对应锈蚀荒原补给站
// ============================================

// 普通虚空生物
const ALPHA_NORMAL: VoidCreature[] = [
  {
    id: 'void_rat',
    name: '虚空鼠',
    tier: 'T1',
    hp: 104,
    maxHp: 104,
    attack: 8,
    defense: 3,
    speed: 10,
    hitRate: 100,
    dodgeRate: 10,
    attackSpeed: 1.0,
    critRate: 5,
    critDamage: 50,
    guardRate: 5,
    penetration: 0,
    skillCoefficient: 1.0,
    physicalReduction: 0.08,
    power: 0,
    expReward: 50,
    lootTable: [
      { itemId: 'mat_001', chance: 0.3 },
      { itemId: 'mat_002', chance: 0.2 },
    ],
    specialMechanics: [],
    planetId: 'planet_alpha',
    creatureType: 'normal',
    description: '被虚空能量侵蚀的小型生物，虽然弱小但数量众多。',
    icon: '🐀',
  },
  {
    id: 'void_worm',
    name: '虚空蠕虫',
    tier: 'T1',
    hp: 104,
    maxHp: 104,
    attack: 8,
    defense: 3,
    speed: 10,
    hitRate: 100,
    dodgeRate: 10,
    attackSpeed: 1.0,
    critRate: 5,
    critDamage: 50,
    guardRate: 5,
    penetration: 0,
    skillCoefficient: 1.0,
    physicalReduction: 0.08,
    power: 0,
    expReward: 50,
    lootTable: [
      { itemId: 'mat_003', chance: 0.3 },
      { itemId: 'mat_004', chance: 0.2 },
    ],
    specialMechanics: [],
    planetId: 'planet_alpha',
    creatureType: 'normal',
    description: '在虚空能量中诞生的蠕虫，能够吞噬金属。',
    icon: '🐛',
  },
  {
    id: 'void_beetle',
    name: '虚空甲虫',
    tier: 'T1',
    hp: 104,
    maxHp: 104,
    attack: 8,
    defense: 3,
    speed: 10,
    hitRate: 100,
    dodgeRate: 10,
    attackSpeed: 1.0,
    critRate: 5,
    critDamage: 50,
    guardRate: 5,
    penetration: 0,
    skillCoefficient: 1.0,
    physicalReduction: 0.08,
    power: 0,
    expReward: 50,
    lootTable: [],
    specialMechanics: [],
    planetId: 'planet_alpha',
    creatureType: 'normal',
    description: '外壳被虚空能量硬化的甲虫，防御力较强。',
    icon: '🪲',
  },
];

// 精英虚空生物
const ALPHA_ELITE: VoidCreature[] = [
  {
    id: 'void_scavenger',
    name: '虚空拾荒者',
    tier: 'T1',
    hp: 156,
    maxHp: 156,
    attack: 12,
    defense: 5,
    speed: 12,
    hitRate: 105,
    dodgeRate: 15,
    attackSpeed: 1.1,
    critRate: 8,
    critDamage: 60,
    guardRate: 8,
    penetration: 5,
    skillCoefficient: 1.2,
    physicalReduction: 0.12,
    power: 50,
    expReward: 100,
    lootTable: [],
    specialMechanics: ['虚空撕咬'],
    planetId: 'planet_alpha',
    creatureType: 'elite',
    description: '在废墟中游荡的虚空生物，擅长偷袭。',
    icon: '👾',
  },
];

// BOSS
const ALPHA_BOSS: VoidCreature[] = [
  {
    id: 'void_alpha_beast',
    name: '虚空原兽',
    tier: 'T1',
    hp: 260,
    maxHp: 260,
    attack: 20,
    defense: 8,
    speed: 15,
    hitRate: 110,
    dodgeRate: 20,
    attackSpeed: 1.2,
    critRate: 12,
    critDamage: 80,
    guardRate: 12,
    penetration: 10,
    skillCoefficient: 1.5,
    physicalReduction: 0.18,
    power: 100,
    expReward: 300,
    lootTable: [],
    specialMechanics: ['虚空爆发', '能量吸收'],
    planetId: 'planet_alpha',
    creatureType: 'boss',
    description: '阿尔法星上最强大的虚空生物，拥有恐怖的破坏力。',
    icon: '👹',
  },
];

// ============================================
// 星球2：贝塔工业星 (T2) - 对应废弃工厂
// ============================================

const BETA_NORMAL: VoidCreature[] = [
  {
    id: 'industrial_drone_corrupted',
    name: '腐化工蜂',
    tier: 'T2',
    hp: 135,
    maxHp: 135,
    attack: 11,
    defense: 4,
    speed: 12,
    hitRate: 102,
    dodgeRate: 12,
    attackSpeed: 1.05,
    critRate: 6,
    critDamage: 55,
    guardRate: 6,
    penetration: 2,
    skillCoefficient: 1.1,
    physicalReduction: 0.10,
    power: 20,
    expReward: 65,
    lootTable: [],
    specialMechanics: [],
    planetId: 'planet_beta',
    creatureType: 'normal',
    description: '被虚空能量腐蚀的工业无人机，仍然执行着破损的指令。',
    icon: '🤖',
  },
  {
    id: 'assembly_line_horror',
    name: '流水线恐魔',
    tier: 'T2',
    hp: 149,
    maxHp: 149,
    attack: 12,
    defense: 5,
    speed: 11,
    hitRate: 103,
    dodgeRate: 11,
    attackSpeed: 1.08,
    critRate: 7,
    critDamage: 58,
    guardRate: 7,
    penetration: 3,
    skillCoefficient: 1.15,
    physicalReduction: 0.11,
    power: 35,
    expReward: 72,
    lootTable: [],
    specialMechanics: [],
    planetId: 'planet_beta',
    creatureType: 'normal',
    description: '在废弃工厂中诞生的怪物，由各种机械零件拼凑而成。',
    icon: '⚙️',
  },
];

const BETA_ELITE: VoidCreature[] = [
  {
    id: 'factory_guardian_void',
    name: '虚空工厂守卫',
    tier: 'T2',
    hp: 202,
    maxHp: 202,
    attack: 17,
    defense: 7,
    speed: 14,
    hitRate: 107,
    dodgeRate: 17,
    attackSpeed: 1.15,
    critRate: 10,
    critDamage: 70,
    guardRate: 10,
    penetration: 7,
    skillCoefficient: 1.3,
    physicalReduction: 0.15,
    power: 75,
    expReward: 145,
    lootTable: [],
    specialMechanics: ['机械重击', '虚空护盾'],
    planetId: 'planet_beta',
    creatureType: 'elite',
    description: '守护工厂的精英虚空生物，拥有强大的机械装甲。',
    icon: '🛡️',
  },
];

const BETA_BOSS: VoidCreature[] = [
  {
    id: 'assembly_core_beast',
    name: '组装核心兽',
    tier: 'T2',
    hp: 337,
    maxHp: 337,
    attack: 28,
    defense: 11,
    speed: 18,
    hitRate: 112,
    dodgeRate: 22,
    attackSpeed: 1.25,
    critRate: 14,
    critDamage: 90,
    guardRate: 14,
    penetration: 12,
    skillCoefficient: 1.6,
    physicalReduction: 0.20,
    power: 150,
    expReward: 450,
    lootTable: [],
    specialMechanics: ['核心过载', '零件重组', '虚空脉冲'],
    planetId: 'planet_beta',
    creatureType: 'boss',
    description: '工厂核心与虚空能量融合诞生的恐怖存在。',
    icon: '⚡',
  },
];

// ============================================
// 星球3：赫利俄斯神域星 (T3) - 对应锈蚀赫利俄斯站
// ============================================

const HELIOS_NORMAL: VoidCreature[] = [
  {
    id: 'bronze_guardian_corrupted',
    name: '腐化青铜守卫',
    tier: 'T3',
    hp: 176,
    maxHp: 176,
    attack: 14,
    defense: 6,
    speed: 13,
    hitRate: 104,
    dodgeRate: 13,
    attackSpeed: 1.1,
    critRate: 8,
    critDamage: 60,
    guardRate: 8,
    penetration: 4,
    skillCoefficient: 1.2,
    physicalReduction: 0.12,
    power: 45,
    expReward: 85,
    lootTable: [],
    specialMechanics: [],
    planetId: 'planet_helios',
    creatureType: 'normal',
    description: '被虚空侵蚀的青铜守卫，曾经是神明的仆从。',
    icon: '🗿',
  },
  {
    id: 'solar_fragment_wraith',
    name: '太阳碎片怨灵',
    tier: 'T3',
    hp: 162,
    maxHp: 162,
    attack: 13,
    defense: 5,
    speed: 14,
    hitRate: 105,
    dodgeRate: 15,
    attackSpeed: 1.12,
    critRate: 9,
    critDamage: 62,
    guardRate: 7,
    penetration: 5,
    skillCoefficient: 1.18,
    physicalReduction: 0.11,
    power: 40,
    expReward: 78,
    lootTable: [],
    specialMechanics: ['太阳灼烧'],
    planetId: 'planet_helios',
    creatureType: 'normal',
    description: '太阳神力量碎片与虚空能量融合诞生的怨灵。',
    icon: '👻',
  },
];

const HELIOS_ELITE: VoidCreature[] = [
  {
    id: 'helios_champion_void',
    name: '虚空太阳勇士',
    tier: 'T3',
    hp: 264,
    maxHp: 264,
    attack: 21,
    defense: 9,
    speed: 17,
    hitRate: 109,
    dodgeRate: 19,
    attackSpeed: 1.2,
    critRate: 12,
    critDamage: 75,
    guardRate: 12,
    penetration: 9,
    skillCoefficient: 1.4,
    physicalReduction: 0.17,
    power: 110,
    expReward: 175,
    lootTable: [],
    specialMechanics: ['太阳之怒', '虚空燃烧'],
    planetId: 'planet_helios',
    creatureType: 'elite',
    description: '曾经是太阳神的勇士，如今被虚空腐蚀。',
    icon: '☀️',
  },
];

const HELIOS_BOSS: VoidCreature[] = [
  {
    id: 'helios_avatar_corrupted',
    name: '腐化赫利俄斯化身',
    tier: 'T3',
    hp: 440,
    maxHp: 440,
    attack: 35,
    defense: 14,
    speed: 22,
    hitRate: 115,
    dodgeRate: 25,
    attackSpeed: 1.3,
    critRate: 16,
    critDamage: 100,
    guardRate: 16,
    penetration: 15,
    skillCoefficient: 1.8,
    physicalReduction: 0.24,
    power: 220,
    expReward: 600,
    lootTable: [],
    specialMechanics: ['太阳陨落', '虚空日蚀', '神怒', '能量虹吸'],
    planetId: 'planet_helios',
    creatureType: 'boss',
    description: '太阳神赫利俄斯被虚空腐蚀的化身，拥有毁灭性的力量。',
    icon: '🌅',
  },
];

// ============================================
// 更多星球怪物数据...（为节省空间，这里只展示前3个星球的完整数据）
// ============================================

// 导出所有虚空怪物
export const ALL_VOID_CREATURES: VoidCreature[] = [
  ...ALPHA_NORMAL,
  ...ALPHA_ELITE,
  ...ALPHA_BOSS,
  ...BETA_NORMAL,
  ...BETA_ELITE,
  ...BETA_BOSS,
  ...HELIOS_NORMAL,
  ...HELIOS_ELITE,
  ...HELIOS_BOSS,
];

// 根据星球ID获取怪物
export function getCreaturesByPlanet(planetId: string): VoidCreature[] {
  return ALL_VOID_CREATURES.filter(c => c.planetId === planetId);
}

// 根据类型获取怪物
export function getCreaturesByType(type: 'normal' | 'elite' | 'boss'): VoidCreature[] {
  return ALL_VOID_CREATURES.filter(c => c.creatureType === type);
}

// 根据等级范围获取怪物
export function getCreaturesByLevelRange(minLevel: number, maxLevel: number): VoidCreature[] {
  // 简化的等级映射：T1=1-5, T2=6-10, T3=11-15, T4=16-20, T5=21-25, T6=26-30
  const tierMap: Record<string, number> = {
    'T1': 3, 'T2': 8, 'T3': 13, 'T4': 18, 'T5': 23, 'T6': 28,
  };

  return ALL_VOID_CREATURES.filter(c => {
    const level = tierMap[c.tier] || 1;
    return level >= minLevel && level <= maxLevel;
  });
}

// 获取随机怪物（用于生成遭遇战）
export function getRandomCreature(planetId: string, type: 'normal' | 'elite' | 'boss'): VoidCreature | null {
  const creatures = getCreaturesByPlanet(planetId).filter(c => c.creatureType === type);
  if (creatures.length === 0) return null;
  return creatures[Math.floor(Math.random() * creatures.length)];
}

export default ALL_VOID_CREATURES;
