// 《星航荒宇》核心模块索引
// 统一导出所有核心系统

// ==================== 新系统 ====================
export {
  Spaceship,
  SpaceshipDataExport,
  SPACESHIP_CONFIG,
  ModuleFactory,
  getModuleSlotName,
  getModuleTypeName,
} from './Spaceship';

export {
  Player as PlayerNew,
  PlayerData as PlayerDataNew,
} from './Player_new';

// ==================== 原有系统兼容导出 ====================
// 暂时保留原有导出，便于渐进式迁移
export { Player } from './Player';
export { Train } from './Train';
export { Inventory } from './Inventory';
export { GameManager } from './GameManager';
export { QuestSystem, Quest, QuestType, QuestStatus, QuestConditionType } from './QuestSystem';
export { SkillSystem, Skill, SkillType } from './SkillSystem';
export { ShopSystem, ShopItem } from './ShopSystem';
export { CraftingSystem, CraftingRecipe, CraftingMaterial } from './CraftingSystem';
export { EnhanceSystem, EnhanceResult, EnhanceResultType } from './EnhanceSystem';
export { DecomposeSystem, DecomposeReward } from './DecomposeSystem';
export { BattleSystem, BattleResult, BattleLog } from './BattleSystem';
export { EquipmentSystem, EquipmentInstance, CalculatedStats } from './EquipmentSystem';
export { EquipmentStatCalculator } from './EquipmentStatCalculator';
