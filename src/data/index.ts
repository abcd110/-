// 《星航荒宇》数据模块索引
// 统一导出所有新系统的数据模块

// ==================== 类型定义 ====================
export * from './types_new';

// ==================== 势力系统 ====================
export {
  FACTIONS,
  getFaction,
  getAllFactions,
  calculateFactionStatus,
  getFactionStatusName,
  getFactionName,
  createInitialReputations,
  modifyReputation,
  getReputation,
  getReputationStatus,
  FACTION_INTERACTION_EFFECTS,
  executeFactionInteraction,
  getShopDiscount,
  getMaxShopItemLevel,
  FactionInteractionType,
} from './factions';

// ==================== 神明系统 ====================
export {
  GREEK_GODS,
  NORDIC_GODS,
  ALL_GODS,
  getGodById,
  getGodByPlanetId,
  getGodsByDomain,
  getGodsByFaction,
  getGodsByStatus,
  modifyGodReputation,
  changeGodStatus,
  getGodRelationDescription,
  getGodAbilityDescription,
} from './gods';

// ==================== 星球系统 ====================
export {
  PLANET_HELIOS,
  PLANET_OLYMPUS,
  PLANET_DELPHI,
  PLANET_POSEIDON,
  PLANET_VALHALLA,
  PLANET_BIFROST,
  PLANET_MIMIR,
  PLANET_HEL,
  PLANET_ALPHA,
  PLANET_WITHERED,
  ALL_PLANETS,
  getPlanetById,
  getPlanetByGodId,
  getPlanetsByType,
  getPlanetsByCategory,
  getPlanetsByFaction,
  getPlanetsByDangerLevel,
  getAccessiblePlanets,
  getDangerLevelName,
  getPlanetTypeName,
  getRecommendedLevelRange,
} from './planets';

// ==================== 原有系统兼容导出 ====================
// 为了保持兼容性，从原有types.ts导出基础类型
export {
  ItemType,
  ItemRarity,
  EquipmentEffectType,
  EffectTrigger,
} from './types';
