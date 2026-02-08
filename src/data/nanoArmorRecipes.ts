// ============================================
// 纳米战甲制造配方
// 6部位：头盔、胸甲、肩甲、臂甲、腿甲、战靴
// ============================================

import { ItemRarity } from './types';

// 装备部位
export enum NanoArmorSlot {
  HELMET = 'helmet',      // 头盔
  CHEST = 'chest',        // 胸甲
  SHOULDER = 'shoulder',  // 肩甲
  ARM = 'arm',            // 臂甲
  LEG = 'leg',            // 腿甲
  BOOT = 'boot',          // 战靴
}

// 部位中文名称 - 纳米战甲科幻设定
export const NANO_ARMOR_SLOT_NAMES: Record<NanoArmorSlot, string> = {
  [NanoArmorSlot.HELMET]: '神经同步盔',
  [NanoArmorSlot.CHEST]: '核心反应炉',
  [NanoArmorSlot.SHOULDER]: '相位护盾肩',
  [NanoArmorSlot.ARM]: '脉冲力场臂',
  [NanoArmorSlot.LEG]: '推进悬浮腿',
  [NanoArmorSlot.BOOT]: '反重力战靴',
};

// 部位图标 - 科幻风格
export const NANO_ARMOR_SLOT_ICONS: Record<NanoArmorSlot, string> = {
  [NanoArmorSlot.HELMET]: '🧠',      // 神经同步盔 - 大脑/神经
  [NanoArmorSlot.CHEST]: '⚛️',       // 核心反应炉 - 原子/核心
  [NanoArmorSlot.SHOULDER]: '🛡️',   // 相位护盾肩 - 护盾
  [NanoArmorSlot.ARM]: '⚡',         // 脉冲力场臂 - 闪电/能量
  [NanoArmorSlot.LEG]: '🚀',        // 推进悬浮腿 - 火箭/推进
  [NanoArmorSlot.BOOT]: '👟',       // 反重力战靴 - 鞋子
};

// 品质等级
export enum ArmorQuality {
  STARDUST = 1,   // 星尘级 (灰白)
  ALLOY = 2,      // 合金级 (浅绿)
  CRYSTAL = 3,    // 晶核级 (科技蓝)
  QUANTUM = 4,    // 量子级 (暗紫)
  VOID = 5,       // 虚空级 (暗金/虚空紫)
}

// 品质名称
export const ARMOR_QUALITY_NAMES: Record<ArmorQuality, string> = {
  [ArmorQuality.STARDUST]: '星尘级',
  [ArmorQuality.ALLOY]: '合金级',
  [ArmorQuality.CRYSTAL]: '晶核级',
  [ArmorQuality.QUANTUM]: '量子级',
  [ArmorQuality.VOID]: '虚空级',
};

// 品质颜色
export const ARMOR_QUALITY_COLORS: Record<ArmorQuality, string> = {
  [ArmorQuality.STARDUST]: '#9ca3af',  // 灰白
  [ArmorQuality.ALLOY]: '#4ade80',     // 浅绿
  [ArmorQuality.CRYSTAL]: '#00d4ff',   // 科技蓝
  [ArmorQuality.QUANTUM]: '#a855f7',   // 暗紫
  [ArmorQuality.VOID]: '#f59e0b',      // 暗金
};

// 材料需求接口
export interface MaterialRequirement {
  itemId: string;
  name: string;
  count: number;
}

// 制造配方接口
export interface NanoArmorRecipe {
  id: string;
  slot: NanoArmorSlot;
  slotName: string;
  name: string;
  description: string;
  materials: MaterialRequirement[];
  baseStats: {
    attack?: number;
    defense: number;
    speed?: number;
    critRate?: number;
    critDamage?: number;
  };
}

// ============================================
// 1. 神经同步盔（感知/量子传感/虚空屏蔽）
// ============================================
export const RECIPE_HELMET: NanoArmorRecipe = {
  id: 'nano_helmet',
  slot: NanoArmorSlot.HELMET,
  slotName: '头盔',
  name: '神经同步盔',
  description: '集成神经接口与量子传感阵列，提供战场态势感知与虚空能量屏蔽',
  materials: [
    { itemId: 'mat_001', name: '星铁基础构件', count: 8 },
    { itemId: 'mat_002', name: '星铜传导组件', count: 6 },
    { itemId: 'mat_004', name: '战甲能量晶核', count: 3 },
    { itemId: 'mat_005', name: '稀土传感基质', count: 2 },
    { itemId: 'mat_006', name: '虚空防护核心', count: 1 },
    { itemId: 'mat_008', name: '纳米韧化纤维', count: 4 },
    { itemId: 'mat_010', name: '量子紧固组件', count: 2 },
  ],
  baseStats: {
    defense: 2,
    hp: 12,
    hit: 2,
  },
};

// ============================================
// 2. 核心反应炉（聚变核心/能源/最强防护）
// ============================================
export const RECIPE_CHEST: NanoArmorRecipe = {
  id: 'nano_chest',
  slot: NanoArmorSlot.CHEST,
  slotName: '胸甲',
  name: '核心反应炉',
  description: '内置微型聚变核心，为全身战甲提供能源，具备最强防护性能',
  materials: [
    { itemId: 'mat_001', name: '星铁基础构件', count: 12 },
    { itemId: 'mat_002', name: '星铜传导组件', count: 8 },
    { itemId: 'mat_003', name: '钛钢外甲坯料', count: 6 },
    { itemId: 'mat_004', name: '战甲能量晶核', count: 4 },
    { itemId: 'mat_006', name: '虚空防护核心', count: 2 },
    { itemId: 'mat_008', name: '纳米韧化纤维', count: 6 },
    { itemId: 'mat_009', name: '陨铁缓冲衬垫', count: 3 },
    { itemId: 'mat_010', name: '量子紧固组件', count: 3 },
  ],
  baseStats: {
    defense: 3,
    hp: 18,
    speed: 0.5,
  },
};

// ============================================
// 3. 相位护盾肩（护盾/偏转/结构强化）
// ============================================
export const RECIPE_SHOULDER: NanoArmorRecipe = {
  id: 'nano_shoulder',
  slot: NanoArmorSlot.SHOULDER,
  slotName: '肩甲',
  name: '相位护盾肩',
  description: '搭载相位偏移护盾发生器，可偏转实体与能量攻击',
  materials: [
    { itemId: 'mat_001', name: '星铁基础构件', count: 7 },
    { itemId: 'mat_002', name: '星铜传导组件', count: 5 },
    { itemId: 'mat_003', name: '钛钢外甲坯料', count: 5 },
    { itemId: 'mat_006', name: '虚空防护核心', count: 1 },
    { itemId: 'mat_008', name: '纳米韧化纤维', count: 4 },
    { itemId: 'mat_009', name: '陨铁缓冲衬垫', count: 2 },
    { itemId: 'mat_010', name: '量子紧固组件', count: 2 },
  ],
  baseStats: {
    defense: 1,
    hp: 8,
    dodge: 1,
  },
};

// ============================================
// 4. 脉冲力场臂（力场/近战/精密关节）
// ============================================
export const RECIPE_ARM: NanoArmorRecipe = {
  id: 'nano_arm',
  slot: NanoArmorSlot.ARM,
  slotName: '臂甲',
  name: '脉冲力场臂',
  description: '覆盖脉冲力场发生器，增强近战攻击并保护精密关节',
  materials: [
    { itemId: 'mat_001', name: '星铁基础构件', count: 6 },
    { itemId: 'mat_002', name: '星铜传导组件', count: 7 },
    { itemId: 'mat_003', name: '钛钢外甲坯料', count: 4 },
    { itemId: 'mat_005', name: '稀土传感基质', count: 1 },
    { itemId: 'mat_008', name: '纳米韧化纤维', count: 5 },
    { itemId: 'mat_010', name: '量子紧固组件', count: 2 },
  ],
  baseStats: {
    attack: 5,
  },
};

// ============================================
// 5. 推进悬浮腿（反重力/机动/承重）
// ============================================
export const RECIPE_LEG: NanoArmorRecipe = {
  id: 'nano_leg',
  slot: NanoArmorSlot.LEG,
  slotName: '腿甲',
  name: '推进悬浮腿',
  description: '侧重推进燃料、承重结构、关节韧性',
  materials: [
    { itemId: 'mat_001', name: '星铁基础构件', count: 9 },
    { itemId: 'mat_002', name: '星铜传导组件', count: 6 },
    { itemId: 'mat_003', name: '钛钢外甲坯料', count: 5 },
    { itemId: 'mat_007', name: '推进模块燃料', count: 6 },
    { itemId: 'mat_008', name: '纳米韧化纤维', count: 5 },
    { itemId: 'mat_009', name: '陨铁缓冲衬垫', count: 2 },
    { itemId: 'mat_010', name: '量子紧固组件', count: 2 },
  ],
  baseStats: {
    defense: 2,
    hp: 6,
    dodge: 1,
  },
};

// ============================================
// 6. 反重力战靴（反重力/缓冲/静音移动）
// ============================================
export const RECIPE_BOOT: NanoArmorRecipe = {
  id: 'nano_boot',
  slot: NanoArmorSlot.BOOT,
  slotName: '战靴',
  name: '反重力战靴',
  description: '微型反重力引擎与缓冲力场，实现静音移动与高空着陆',
  materials: [
    { itemId: 'mat_001', name: '星铁基础构件', count: 5 },
    { itemId: 'mat_002', name: '星铜传导组件', count: 4 },
    { itemId: 'mat_007', name: '推进模块燃料', count: 5 },
    { itemId: 'mat_008', name: '纳米韧化纤维', count: 4 },
    { itemId: 'mat_009', name: '陨铁缓冲衬垫', count: 2 },
    { itemId: 'mat_010', name: '量子紧固组件', count: 2 },
  ],
  baseStats: {
    defense: 1,
    hp: 4,
    dodge: 2,
  },
};

// ============================================
// 所有配方集合
// ============================================
export const ALL_NANO_ARMOR_RECIPES: NanoArmorRecipe[] = [
  RECIPE_HELMET,
  RECIPE_CHEST,
  RECIPE_SHOULDER,
  RECIPE_ARM,
  RECIPE_LEG,
  RECIPE_BOOT,
];

// 根据部位获取配方
export function getRecipeBySlot(slot: NanoArmorSlot): NanoArmorRecipe | undefined {
  return ALL_NANO_ARMOR_RECIPES.find(recipe => recipe.slot === slot);
}

// 根据ID获取配方
export function getRecipeById(id: string): NanoArmorRecipe | undefined {
  return ALL_NANO_ARMOR_RECIPES.find(recipe => recipe.id === id);
}

// ============================================
// 整套「纳米战甲」总材料需求统计
// ============================================
export const TOTAL_MATERIALS_NEEDED = {
  'mat_001': { name: '星铁基础构件', count: 47 },
  'mat_002': { name: '星铜传导组件', count: 36 },
  'mat_003': { name: '钛钢外甲坯料', count: 20 },
  'mat_004': { name: '战甲能量晶核', count: 7 },
  'mat_005': { name: '稀土传感基质', count: 3 },
  'mat_006': { name: '虚空防护核心', count: 5 },
  'mat_007': { name: '推进模块燃料', count: 11 },
  'mat_008': { name: '纳米韧化纤维', count: 28 },
  'mat_009': { name: '陨铁缓冲衬垫', count: 10 },
  'mat_010': { name: '量子紧固组件', count: 14 },
};

// 品质合成配置
// 5个低品质 → 1个高品质
export const QUALITY_UPGRADE_CONFIG = {
  [ArmorQuality.STARDUST]: { next: ArmorQuality.ALLOY, required: 5 },
  [ArmorQuality.ALLOY]: { next: ArmorQuality.CRYSTAL, required: 5 },
  [ArmorQuality.CRYSTAL]: { next: ArmorQuality.QUANTUM, required: 5 },
  [ArmorQuality.QUANTUM]: { next: ArmorQuality.VOID, required: 5 },
  [ArmorQuality.VOID]: { next: null, required: 0 },
};

// 根据品质计算装备属性加成
export function calculateQualityMultiplier(quality: ArmorQuality): number {
  // 品质越高，属性加成越高
  const multipliers: Record<ArmorQuality, number> = {
    [ArmorQuality.STARDUST]: 1,     // 基础
    [ArmorQuality.ALLOY]: 1.2,      // +20%
    [ArmorQuality.CRYSTAL]: 1.5,    // +50%
    [ArmorQuality.QUANTUM]: 2,      // +100%
    [ArmorQuality.VOID]: 2.5,       // +150%
  };
  return multipliers[quality] || 1;
}

export default ALL_NANO_ARMOR_RECIPES;
