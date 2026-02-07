// ============================================
// 优化版装备制造系统
// 与探索系统深度联动，使用探索获得的材料
// ============================================

import { EquipmentSlot } from './equipmentTypes';
import { MaterialQuality, CraftingMaterialType, generateMaterialId, ALL_CRAFTING_MATERIALS } from './craftingMaterials';
import { ItemRarity } from './types';

// ============================================
// 装备部位与材料对应关系（优化版）
// ============================================

// 主材料映射 - 每个部位对应的主要材料
export const SLOT_PRIMARY_MATERIALS: Record<EquipmentSlot, CraftingMaterialType> = {
  [EquipmentSlot.HEAD]: CraftingMaterialType.IRON,      // 头盔 - 铁矿
  [EquipmentSlot.BODY]: CraftingMaterialType.IRON,      // 胸甲 - 铁矿
  [EquipmentSlot.LEGS]: CraftingMaterialType.LEATHER,   // 护腿 - 皮革
  [EquipmentSlot.FEET]: CraftingMaterialType.LEATHER,   // 战靴 - 皮革
  [EquipmentSlot.WEAPON]: CraftingMaterialType.IRON,    // 武器 - 铁矿
  [EquipmentSlot.ACCESSORY]: CraftingMaterialType.CRYSTAL, // 饰品 - 水晶
};

// 副材料映射 - 每个部位对应的辅助材料
export const SLOT_SECONDARY_MATERIALS: Record<EquipmentSlot, CraftingMaterialType> = {
  [EquipmentSlot.HEAD]: CraftingMaterialType.CRYSTAL,   // 头盔 - 水晶（增强感知）
  [EquipmentSlot.BODY]: CraftingMaterialType.FABRIC,    // 胸甲 - 布料（内衬）
  [EquipmentSlot.LEGS]: CraftingMaterialType.FABRIC,    // 护腿 - 布料
  [EquipmentSlot.FEET]: CraftingMaterialType.WOOD,      // 战靴 - 木材（鞋底）
  [EquipmentSlot.WEAPON]: CraftingMaterialType.WOOD,    // 武器 - 木材（握柄）
  [EquipmentSlot.ACCESSORY]: CraftingMaterialType.ESSENCE, // 饰品 - 精华（魔法）
};

// 部位名称
export const SLOT_CRAFT_NAMES: Record<EquipmentSlot, string> = {
  [EquipmentSlot.HEAD]: '头盔',
  [EquipmentSlot.BODY]: '胸甲',
  [EquipmentSlot.LEGS]: '护腿',
  [EquipmentSlot.FEET]: '战靴',
  [EquipmentSlot.WEAPON]: '武器',
  [EquipmentSlot.ACCESSORY]: '饰品',
};

// ============================================
// 制造配方定义
// ============================================

export interface CraftingRecipe {
  id: string;
  slot: EquipmentSlot;
  name: string;
  description: string;
  icon: string;
  // 主材料需求
  primaryMaterial: {
    type: CraftingMaterialType;
    amount: number;
  };
  // 副材料需求
  secondaryMaterial: {
    type: CraftingMaterialType;
    amount: number;
  };
  // 特殊材料（可选）
  specialMaterial?: {
    type: CraftingMaterialType;
    amount: number;
    required: boolean;
  };
  // 消耗
  staminaCost: number;
  // 制造时间（秒）
  craftTime: number;
}

// 基础材料消耗
const BASE_PRIMARY_COST = 5;
const BASE_SECONDARY_COST = 3;
const BASE_SPECIAL_COST = 1;

// 生成所有配方
export const CRAFTING_RECIPES: CraftingRecipe[] = [
  {
    id: 'craft_head',
    slot: EquipmentSlot.HEAD,
    name: '制造头盔',
    description: '使用铁矿碎片和能量水晶制造头盔，水晶可增强感知能力',
    icon: '⛑️',
    primaryMaterial: { type: CraftingMaterialType.IRON, amount: BASE_PRIMARY_COST },
    secondaryMaterial: { type: CraftingMaterialType.CRYSTAL, amount: BASE_SECONDARY_COST },
    staminaCost: 10,
    craftTime: 3,
  },
  {
    id: 'craft_body',
    slot: EquipmentSlot.BODY,
    name: '制造胸甲',
    description: '使用铁矿碎片和粗布纤维制造胸甲，布料提供舒适的内衬',
    icon: '🦺',
    primaryMaterial: { type: CraftingMaterialType.IRON, amount: BASE_PRIMARY_COST },
    secondaryMaterial: { type: CraftingMaterialType.FABRIC, amount: BASE_SECONDARY_COST },
    staminaCost: 12,
    craftTime: 4,
  },
  {
    id: 'craft_legs',
    slot: EquipmentSlot.LEGS,
    name: '制造护腿',
    description: '使用野兽皮革和粗布纤维制造护腿，兼顾防护与灵活',
    icon: '🩳',
    primaryMaterial: { type: CraftingMaterialType.LEATHER, amount: BASE_PRIMARY_COST },
    secondaryMaterial: { type: CraftingMaterialType.FABRIC, amount: BASE_SECONDARY_COST },
    staminaCost: 10,
    craftTime: 3,
  },
  {
    id: 'craft_feet',
    slot: EquipmentSlot.FEET,
    name: '制造战靴',
    description: '使用野兽皮革和坚韧木材制造战靴，木底提供良好支撑',
    icon: '👢',
    primaryMaterial: { type: CraftingMaterialType.LEATHER, amount: BASE_PRIMARY_COST },
    secondaryMaterial: { type: CraftingMaterialType.WOOD, amount: BASE_SECONDARY_COST },
    staminaCost: 8,
    craftTime: 2,
  },
  {
    id: 'craft_weapon',
    slot: EquipmentSlot.WEAPON,
    name: '制造武器',
    description: '使用铁矿碎片和坚韧木材制造武器，木柄提供稳定握持',
    icon: '⚔️',
    primaryMaterial: { type: CraftingMaterialType.IRON, amount: BASE_PRIMARY_COST + 2 }, // 武器需要更多铁矿
    secondaryMaterial: { type: CraftingMaterialType.WOOD, amount: BASE_SECONDARY_COST },
    specialMaterial: { type: CraftingMaterialType.ESSENCE, amount: BASE_SPECIAL_COST, required: false }, // 可选精华提升品质
    staminaCost: 15,
    craftTime: 5,
  },
  {
    id: 'craft_accessory',
    slot: EquipmentSlot.ACCESSORY,
    name: '制造饰品',
    description: '使用能量水晶和怪物精华制造饰品，蕴含神秘力量',
    icon: '💍',
    primaryMaterial: { type: CraftingMaterialType.CRYSTAL, amount: BASE_PRIMARY_COST },
    secondaryMaterial: { type: CraftingMaterialType.ESSENCE, amount: BASE_SECONDARY_COST },
    staminaCost: 12,
    craftTime: 4,
  },
];

// ============================================
// 品质计算系统
// ============================================

// 品质概率表 - 基于使用的材料品质
export const CRAFTING_QUALITY_RATES: Record<MaterialQuality, Record<ItemRarity, number>> = {
  [MaterialQuality.NORMAL]: {
    [ItemRarity.COMMON]: 0.50,
    [ItemRarity.UNCOMMON]: 0.30,
    [ItemRarity.RARE]: 0.15,
    [ItemRarity.EPIC]: 0.04,
    [ItemRarity.LEGENDARY]: 0.01,
    [ItemRarity.MYTHIC]: 0,
  },
  [MaterialQuality.GOOD]: {
    [ItemRarity.COMMON]: 0.30,
    [ItemRarity.UNCOMMON]: 0.40,
    [ItemRarity.RARE]: 0.20,
    [ItemRarity.EPIC]: 0.08,
    [ItemRarity.LEGENDARY]: 0.02,
    [ItemRarity.MYTHIC]: 0,
  },
  [MaterialQuality.FINE]: {
    [ItemRarity.COMMON]: 0.15,
    [ItemRarity.UNCOMMON]: 0.30,
    [ItemRarity.RARE]: 0.35,
    [ItemRarity.EPIC]: 0.15,
    [ItemRarity.LEGENDARY]: 0.05,
    [ItemRarity.MYTHIC]: 0,
  },
  [MaterialQuality.RARE]: {
    [ItemRarity.COMMON]: 0.05,
    [ItemRarity.UNCOMMON]: 0.15,
    [ItemRarity.RARE]: 0.30,
    [ItemRarity.EPIC]: 0.35,
    [ItemRarity.LEGENDARY]: 0.15,
    [ItemRarity.MYTHIC]: 0,
  },
  [MaterialQuality.LEGENDARY]: {
    [ItemRarity.COMMON]: 0,
    [ItemRarity.UNCOMMON]: 0.05,
    [ItemRarity.RARE]: 0.20,
    [ItemRarity.EPIC]: 0.35,
    [ItemRarity.LEGENDARY]: 0.40,
    [ItemRarity.MYTHIC]: 0,
  },
};

// 计算加权平均品质
export function calculateWeightedMaterialQuality(
  primaryQuality: MaterialQuality,
  secondaryQuality: MaterialQuality,
  specialQuality?: MaterialQuality
): MaterialQuality {
  // 基础权重：主材料 2，副材料 1
  let totalWeight = 3;
  let weightedSum = primaryQuality * 2 + secondaryQuality * 1;
  
  // 如果有特殊材料且品质更高，额外加成
  if (specialQuality !== undefined) {
    totalWeight += 1;
    weightedSum += specialQuality;
  }
  
  const averageQuality = weightedSum / totalWeight;
  const roundedQuality = Math.round(averageQuality);
  
  return Math.max(1, Math.min(5, roundedQuality)) as MaterialQuality;
}

// 计算品质概率
export function calculateCraftingQualityRates(
  primaryQuality: MaterialQuality,
  secondaryQuality: MaterialQuality,
  specialQuality?: MaterialQuality
): Record<ItemRarity, number> {
  const weightedQuality = calculateWeightedMaterialQuality(primaryQuality, secondaryQuality, specialQuality);
  return CRAFTING_QUALITY_RATES[weightedQuality];
}

// 随机Roll品质
export function rollCraftingQuality(
  primaryQuality: MaterialQuality,
  secondaryQuality: MaterialQuality,
  specialQuality?: MaterialQuality
): ItemRarity {
  const rates = calculateCraftingQualityRates(primaryQuality, secondaryQuality, specialQuality);
  const roll = Math.random();
  let cumulative = 0;

  for (const [rarity, rate] of Object.entries(rates)) {
    cumulative += rate;
    if (roll <= cumulative) {
      return rarity as ItemRarity;
    }
  }

  return ItemRarity.COMMON;
}

// ============================================
// 材料品质加成系统
// ============================================

// 品质加成系数
export const QUALITY_BONUS_MULTIPLIERS: Record<MaterialQuality, number> = {
  [MaterialQuality.NORMAL]: 1.0,
  [MaterialQuality.GOOD]: 1.15,
  [MaterialQuality.FINE]: 1.30,
  [MaterialQuality.RARE]: 1.50,
  [MaterialQuality.LEGENDARY]: 1.80,
};

// 计算属性加成
export function calculateQualityBonus(
  baseValue: number,
  materialQuality: MaterialQuality
): number {
  return Math.floor(baseValue * QUALITY_BONUS_MULTIPLIERS[materialQuality]);
}

// ============================================
// 工具函数
// ============================================

// 获取配方
export function getCraftingRecipe(slot: EquipmentSlot): CraftingRecipe | undefined {
  return CRAFTING_RECIPES.find(r => r.slot === slot);
}

// 获取配方通过ID
export function getCraftingRecipeById(id: string): CraftingRecipe | undefined {
  return CRAFTING_RECIPES.find(r => r.id === id);
}

// 检查材料是否足够
export function checkMaterials(
  inventory: Record<string, number>,
  recipe: CraftingRecipe,
  primaryQuality: MaterialQuality,
  secondaryQuality: MaterialQuality,
  specialQuality?: MaterialQuality
): { 
  sufficient: boolean; 
  missing: { material: string; required: number; has: number }[] 
} {
  const missing = [];
  
  // 检查主材料
  const primaryId = generateMaterialId(recipe.primaryMaterial.type, primaryQuality);
  const primaryHas = inventory[primaryId] || 0;
  if (primaryHas < recipe.primaryMaterial.amount) {
    missing.push({
      material: ALL_CRAFTING_MATERIALS.find(m => m.id === primaryId)?.name || primaryId,
      required: recipe.primaryMaterial.amount,
      has: primaryHas,
    });
  }
  
  // 检查副材料
  const secondaryId = generateMaterialId(recipe.secondaryMaterial.type, secondaryQuality);
  const secondaryHas = inventory[secondaryId] || 0;
  if (secondaryHas < recipe.secondaryMaterial.amount) {
    missing.push({
      material: ALL_CRAFTING_MATERIALS.find(m => m.id === secondaryId)?.name || secondaryId,
      required: recipe.secondaryMaterial.amount,
      has: secondaryHas,
    });
  }
  
  // 检查特殊材料（如果是必需的）
  if (recipe.specialMaterial?.required && specialQuality !== undefined) {
    const specialId = generateMaterialId(recipe.specialMaterial.type, specialQuality);
    const specialHas = inventory[specialId] || 0;
    if (specialHas < recipe.specialMaterial.amount) {
      missing.push({
        material: ALL_CRAFTING_MATERIALS.find(m => m.id === specialId)?.name || specialId,
        required: recipe.specialMaterial.amount,
        has: specialHas,
      });
    }
  }
  
  return {
    sufficient: missing.length === 0,
    missing,
  };
}

// ============================================
// 制造结果预览
// ============================================

export interface CraftingPreview {
  recipe: CraftingRecipe;
  primaryQuality: MaterialQuality;
  secondaryQuality: MaterialQuality;
  specialQuality?: MaterialQuality;
  qualityRates: Record<ItemRarity, number>;
  expectedRarity: ItemRarity;
  staminaCost: number;
  canCraft: boolean;
  missingMaterials?: { material: string; required: number; has: number }[];
}

// 生成制造预览
export function generateCraftingPreview(
  recipe: CraftingRecipe,
  inventory: Record<string, number>,
  primaryQuality: MaterialQuality,
  secondaryQuality: MaterialQuality,
  specialQuality?: MaterialQuality
): CraftingPreview {
  const qualityRates = calculateCraftingQualityRates(primaryQuality, secondaryQuality, specialQuality);
  
  // 计算期望品质（概率最高的）
  let expectedRarity = ItemRarity.COMMON;
  let maxRate = 0;
  for (const [rarity, rate] of Object.entries(qualityRates)) {
    if (rate > maxRate) {
      maxRate = rate;
      expectedRarity = rarity as ItemRarity;
    }
  }
  
  const materialCheck = checkMaterials(inventory, recipe, primaryQuality, secondaryQuality, specialQuality);
  
  return {
    recipe,
    primaryQuality,
    secondaryQuality,
    specialQuality,
    qualityRates,
    expectedRarity,
    staminaCost: recipe.staminaCost,
    canCraft: materialCheck.sufficient,
    missingMaterials: materialCheck.missing,
  };
}

export default {
  CRAFTING_RECIPES,
  SLOT_PRIMARY_MATERIALS,
  SLOT_SECONDARY_MATERIALS,
  SLOT_CRAFT_NAMES,
  CRAFTING_QUALITY_RATES,
  QUALITY_BONUS_MULTIPLIERS,
  calculateWeightedMaterialQuality,
  calculateCraftingQualityRates,
  rollCraftingQuality,
  calculateQualityBonus,
  getCraftingRecipe,
  getCraftingRecipeById,
  checkMaterials,
  generateCraftingPreview,
};
