// 《星航荒宇》游戏状态管理（扩展）
// 在原有 gameStore 基础上添加新系统支持

import { useGameStore as useOriginalGameStore } from './gameStore';
import { GameManager as NewGameManager, GameState as NewGameState } from '../core/GameManager_new';
import { SaveMigration } from '../utils/SaveMigration';
import {
  FactionType,
  FactionStatus,
  GodContractor,
  Planet,
} from '../data/types_new';
import {
  getFactionName,
  getFactionStatusName,
  getShopDiscount,
} from '../data/factions';
import { getPlanetById } from '../data/planets';

// ==================== 扩展的 Store 接口 ====================

interface ExtendedGameStore {
  // 新系统实例
  newGameManager: NewGameManager | null;
  
  // 迁移状态
  migrationStatus: {
    needsMigration: boolean;
    migrationResult?: {
      success: boolean;
      message: string;
      warnings: string[];
    };
  };

  // ==================== 星球系统 ====================
  getCurrentPlanet: () => Planet | undefined;
  travelToPlanet: (planetId: string) => { success: boolean; message: string };
  getAccessiblePlanets: () => Planet[];
  
  // ==================== 势力系统 ====================
  getFactionReputation: (factionId: FactionType) => number;
  getFactionStatus: (factionId: FactionType) => FactionStatus;
  modifyFactionReputation: (factionId: FactionType, amount: number) => void;
  getAllFactionReputations: () => { factionId: FactionType; reputation: number; status: FactionStatus }[];
  
  // ==================== 神契者系统 ====================
  getGodContractor: () => GodContractor | null;
  bindGodContractor: (contractor: GodContractor) => boolean;
  unbindGodContractor: () => GodContractor | null;
  useContractorAbility: (abilityIndex: number) => { success: boolean; message: string };
  
  // ==================== 航船系统 ====================
  getSpaceship: () => NewGameManager['spaceship'] | null;
  installModule: (slot: string, module: any) => boolean;
  uninstallModule: (slot: string) => any | null;
  upgradeSpaceship: () => { success: boolean; message: string };
  
  // ==================== 经济系统 ====================
  getFederationCredits: () => number;
  addCredits: (amount: number) => void;
  spendCredits: (amount: number) => boolean;
  
  // ==================== 存档迁移 ====================
  checkMigration: (saveData: any) => boolean;
  performMigration: (saveString: string) => { success: boolean; message: string; warnings: string[] };
  
  // ==================== 初始化 ====================
  initNewGame: () => void;
  loadNewGame: (saveData: NewGameState) => boolean;
}

// ==================== 创建扩展 Store ====================

export function useExtendedGameStore(): ExtendedGameStore {
  // 获取原始 store
  const originalStore = useOriginalGameStore();
  
  // 新游戏管理器实例（懒加载）
  let newGameManager: NewGameManager | null = null;
  
  // 获取或创建新游戏管理器
  const getNewGameManager = (): NewGameManager => {
    if (!newGameManager) {
      newGameManager = new NewGameManager();
    }
    return newGameManager;
  };

  return {
    // 实例
    newGameManager: null, // 避免在 hook 中直接存储实例
    migrationStatus: {
      needsMigration: false,
    },

    // ==================== 星球系统 ====================
    
    getCurrentPlanet: () => {
      return getNewGameManager().getCurrentPlanet();
    },
    
    travelToPlanet: (planetId: string) => {
      const result = getNewGameManager().travelToPlanet(planetId);
      // 同步到原始 store
      originalStore.saveGame();
      return result;
    },
    
    getAccessiblePlanets: () => {
      const spaceship = getNewGameManager().spaceship;
      const { getAccessiblePlanets: getPlanets } = require('../data/planets');
      return getPlanets(spaceship.level);
    },

    // ==================== 势力系统 ====================
    
    getFactionReputation: (factionId: FactionType) => {
      return getNewGameManager().getFactionReputation(factionId);
    },
    
    getFactionStatus: (factionId: FactionType) => {
      return getNewGameManager().player.getFactionStatus(factionId);
    },
    
    modifyFactionReputation: (factionId: FactionType, amount: number) => {
      getNewGameManager().modifyFactionReputation(factionId, amount);
      originalStore.saveGame();
    },
    
    getAllFactionReputations: () => {
      return getNewGameManager().player.getAllFactionReputations();
    },

    // ==================== 神契者系统 ====================
    
    getGodContractor: () => {
      return getNewGameManager().player.getGodContractor();
    },
    
    bindGodContractor: (contractor: GodContractor) => {
      const result = getNewGameManager().bindGodContractor(contractor);
      if (result) {
        originalStore.saveGame();
      }
      return result;
    },
    
    unbindGodContractor: () => {
      const result = getNewGameManager().unbindGodContractor();
      if (result) {
        originalStore.saveGame();
      }
      return result;
    },
    
    useContractorAbility: (abilityIndex: number) => {
      const result = getNewGameManager().useContractorAbility(abilityIndex);
      if (result.success) {
        originalStore.saveGame();
      }
      return result;
    },

    // ==================== 航船系统 ====================
    
    getSpaceship: () => {
      return getNewGameManager().spaceship;
    },
    
    installModule: (slot: string, module: any) => {
      const spaceship = getNewGameManager().spaceship;
      const result = spaceship.installModule(slot as any, module);
      if (result) {
        originalStore.saveGame();
      }
      return result;
    },
    
    uninstallModule: (slot: string) => {
      const spaceship = getNewGameManager().spaceship;
      const result = spaceship.uninstallModule(slot as any);
      if (result) {
        originalStore.saveGame();
      }
      return result;
    },
    
    upgradeSpaceship: () => {
      const spaceship = getNewGameManager().spaceship;
      const result = spaceship.addExperience(100); // 示例：增加经验
      if (result.leveledUp) {
        getNewGameManager().addLog(`航船升级至 ${result.newLevel} 级！`);
        originalStore.saveGame();
        return { success: true, message: `航船升级至 ${result.newLevel} 级！` };
      }
      return { success: false, message: '经验不足，无法升级' };
    },

    // ==================== 经济系统 ====================
    
    getFederationCredits: () => {
      return getNewGameManager().federationCredits;
    },
    
    addCredits: (amount: number) => {
      getNewGameManager().addCredits(amount);
      originalStore.saveGame();
    },
    
    spendCredits: (amount: number) => {
      const result = getNewGameManager().spendCredits(amount);
      if (result) {
        originalStore.saveGame();
      }
      return result;
    },

    // ==================== 存档迁移 ====================
    
    checkMigration: (saveData: any) => {
      return SaveMigration.needsMigration(saveData);
    },
    
    performMigration: (saveString: string) => {
      const result = SaveMigration.migrate(saveString);
      if (result.success && result.data) {
        // 加载迁移后的数据
        newGameManager = new NewGameManager(result.data);
      }
      return {
        success: result.success,
        message: result.message,
        warnings: result.warnings,
      };
    },

    // ==================== 初始化 ====================
    
    initNewGame: () => {
      newGameManager = new NewGameManager();
      // 同步到原始 store 的存储
      const saveString = newGameManager.save();
      localStorage.setItem('game_save', saveString);
    },
    
    loadNewGame: (saveData: NewGameState) => {
      try {
        newGameManager = new NewGameManager(saveData);
        return true;
      } catch (error) {
        console.error('加载新游戏失败:', error);
        return false;
      }
    },
  };
}

// ==================== 辅助 Hook ====================

/**
 * 获取势力信息的 Hook
 */
export function useFactionInfo(factionId: FactionType) {
  const store = useExtendedGameStore();
  
  return {
    name: getFactionName(factionId),
    reputation: store.getFactionReputation(factionId),
    status: store.getFactionStatus(factionId),
    statusName: getFactionStatusName(store.getFactionStatus(factionId)),
    discount: getShopDiscount(store.getFactionReputation(factionId)),
  };
}

/**
 * 获取当前星球的 Hook
 */
export function useCurrentPlanet() {
  const store = useExtendedGameStore();
  return store.getCurrentPlanet();
}

/**
 * 获取航船信息的 Hook
 */
export function useSpaceship() {
  const store = useExtendedGameStore();
  return store.getSpaceship();
}

/**
 * 获取神契者信息的 Hook
 */
export function useGodContractor() {
  const store = useExtendedGameStore();
  return store.getGodContractor();
}

export default useExtendedGameStore;
