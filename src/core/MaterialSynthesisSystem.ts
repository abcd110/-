// 材料合成系统
// 5个低级材料 → 1个高级材料

import { ArmorQuality } from '../data/nanoArmorRecipes';

// 材料ID前缀
const MATERIAL_IDS = ['mat_001', 'mat_002', 'mat_003', 'mat_004', 'mat_005', 'mat_006', 'mat_007', 'mat_008', 'mat_009', 'mat_010'];

// 品质后缀
const QUALITY_SUFFIX: Record<ArmorQuality, string> = {
  [ArmorQuality.STARDUST]: '_stardust',
  [ArmorQuality.ALLOY]: '_alloy',
  [ArmorQuality.CRYSTAL]: '_crystal',
  [ArmorQuality.QUANTUM]: '_quantum',
  [ArmorQuality.VOID]: '_void',
};

// 品质名称
const QUALITY_NAMES: Record<ArmorQuality, string> = {
  [ArmorQuality.STARDUST]: '星尘级',
  [ArmorQuality.ALLOY]: '合金级',
  [ArmorQuality.CRYSTAL]: '晶核级',
  [ArmorQuality.QUANTUM]: '量子级',
  [ArmorQuality.VOID]: '虚空级',
};

// 合成配方：从低品质到高品质
export interface SynthesisRecipe {
  sourceQuality: ArmorQuality;
  targetQuality: ArmorQuality;
  sourceCount: number; // 需要多少个低级材料
  targetCount: number; // 产出多少个高级材料
}

// 合成配方列表
export const SYNTHESIS_RECIPES: SynthesisRecipe[] = [
  { sourceQuality: ArmorQuality.STARDUST, targetQuality: ArmorQuality.ALLOY, sourceCount: 5, targetCount: 1 },
  { sourceQuality: ArmorQuality.ALLOY, targetQuality: ArmorQuality.CRYSTAL, sourceCount: 5, targetCount: 1 },
  { sourceQuality: ArmorQuality.CRYSTAL, targetQuality: ArmorQuality.QUANTUM, sourceCount: 5, targetCount: 1 },
  { sourceQuality: ArmorQuality.QUANTUM, targetQuality: ArmorQuality.VOID, sourceCount: 5, targetCount: 1 },
];

// 获取合成配方
export function getSynthesisRecipe(sourceQuality: ArmorQuality): SynthesisRecipe | null {
  return SYNTHESIS_RECIPES.find(r => r.sourceQuality === sourceQuality) || null;
}

// 检查是否可以合成
export function canSynthesize(
  inventory: Map<string, number>,
  materialId: string,
  sourceQuality: ArmorQuality
): { can: boolean; required: number; has: number } {
  const recipe = getSynthesisRecipe(sourceQuality);
  if (!recipe) {
    return { can: false, required: 0, has: 0 };
  }

  const sourceItemId = `${materialId}${QUALITY_SUFFIX[sourceQuality]}`;
  const has = inventory.get(sourceItemId) || 0;
  const required = recipe.sourceCount;

  return {
    can: has >= required,
    required,
    has,
  };
}

// 执行合成
export function synthesize(
  inventory: Map<string, number>,
  materialId: string,
  sourceQuality: ArmorQuality
): { success: boolean; message: string; consumed: number; produced: string; producedCount: number } {
  const recipe = getSynthesisRecipe(sourceQuality);
  if (!recipe) {
    return { success: false, message: '无法合成更高品质', consumed: 0, produced: '', producedCount: 0 };
  }

  const sourceItemId = `${materialId}${QUALITY_SUFFIX[sourceQuality]}`;
  const targetItemId = `${materialId}${QUALITY_SUFFIX[recipe.targetQuality]}`;
  const has = inventory.get(sourceItemId) || 0;

  if (has < recipe.sourceCount) {
    return {
      success: false,
      message: `材料不足，需要 ${recipe.sourceCount} 个${QUALITY_NAMES[sourceQuality]}材料`,
      consumed: 0,
      produced: '',
      producedCount: 0,
    };
  }

  // 消耗材料
  const newCount = has - recipe.sourceCount;
  if (newCount > 0) {
    inventory.set(sourceItemId, newCount);
  } else {
    inventory.delete(sourceItemId);
  }

  // 产出高级材料
  const currentTarget = inventory.get(targetItemId) || 0;
  inventory.set(targetItemId, currentTarget + recipe.targetCount);

  return {
    success: true,
    message: `合成成功！消耗 ${recipe.sourceCount} 个${QUALITY_NAMES[sourceQuality]}材料，获得 ${recipe.targetCount} 个${QUALITY_NAMES[recipe.targetQuality]}材料`,
    consumed: recipe.sourceCount,
    produced: targetItemId,
    producedCount: recipe.targetCount,
  };
}

// 批量合成
export function synthesizeBatch(
  inventory: Map<string, number>,
  materialId: string,
  sourceQuality: ArmorQuality,
  batchCount: number
): { success: boolean; message: string; totalConsumed: number; totalProduced: number; targetQuality?: ArmorQuality } {
  const recipe = getSynthesisRecipe(sourceQuality);
  if (!recipe) {
    return { success: false, message: '无法合成更高品质', totalConsumed: 0, totalProduced: 0 };
  }

  const sourceItemId = `${materialId}${QUALITY_SUFFIX[sourceQuality]}`;
  const has = inventory.get(sourceItemId) || 0;
  const maxBatch = Math.floor(has / recipe.sourceCount);
  const actualBatch = Math.min(batchCount, maxBatch);

  if (actualBatch <= 0) {
    return {
      success: false,
      message: `材料不足，需要 ${recipe.sourceCount} 个${QUALITY_NAMES[sourceQuality]}材料才能合成`,
      totalConsumed: 0,
      totalProduced: 0,
    };
  }

  let totalConsumed = 0;
  let totalProduced = 0;

  for (let i = 0; i < actualBatch; i++) {
    const result = synthesize(inventory, materialId, sourceQuality);
    if (result.success) {
      totalConsumed += result.consumed;
      totalProduced += result.producedCount;
    }
  }

  return {
    success: true,
    message: `批量合成成功！共消耗 ${totalConsumed} 个${QUALITY_NAMES[sourceQuality]}材料，获得 ${totalProduced} 个${QUALITY_NAMES[recipe.targetQuality]}材料`,
    totalConsumed,
    totalProduced,
    targetQuality: recipe.targetQuality,
  };
}

// 获取所有可合成的材料列表
export function getSynthesizableMaterials(
  inventory: Map<string, number>
): Array<{
  materialId: string;
  baseName: string;
  sourceQuality: ArmorQuality;
  targetQuality: ArmorQuality;
  canSynthesize: boolean;
  hasCount: number;
  requiredCount: number;
}> {
  const result = [];

  for (const matId of MATERIAL_IDS) {
    for (const recipe of SYNTHESIS_RECIPES) {
      const check = canSynthesize(inventory, matId, recipe.sourceQuality);
      result.push({
        materialId: matId,
        baseName: getMaterialBaseName(matId),
        sourceQuality: recipe.sourceQuality,
        targetQuality: recipe.targetQuality,
        canSynthesize: check.can,
        hasCount: check.has,
        requiredCount: check.required,
      });
    }
  }

  return result;
}

// 获取材料基础名称
function getMaterialBaseName(materialId: string): string {
  const names: Record<string, string> = {
    'mat_001': '星铁基础构件',
    'mat_002': '星铜传导组件',
    'mat_003': '钛钢外甲坯料',
    'mat_004': '战甲能量晶核',
    'mat_005': '稀土传感基质',
    'mat_006': '虚空防护核心',
    'mat_007': '推进模块燃料',
    'mat_008': '纳米韧化纤维',
    'mat_009': '陨铁缓冲衬垫',
    'mat_010': '量子紧固组件',
  };
  return names[materialId] || materialId;
}

export { QUALITY_SUFFIX, QUALITY_NAMES, MATERIAL_IDS };
