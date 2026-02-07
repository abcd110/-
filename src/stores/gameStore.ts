import { create } from 'zustand';
import { GameManager, type GameState } from '../core/GameManager';
import { GameStorage } from '../core/Storage';
import type { Location } from '../data/types';
import { AutoCollectMode, CollectReward } from '../data/autoCollectTypes';
import type { ToastMessage } from '../components/Toast';

interface GameStore {
  // 游戏实例
  gameManager: GameManager;

  // 状态
  isLoading: boolean;
  hasSave: boolean;
  logs: string[];

  // Toast 提示
  toasts: ToastMessage[];
  showToast: (message: string, type?: ToastMessage['type'], duration?: number) => void;
  removeToast: (id: string) => void;

  // 操作方法
  init: () => Promise<void>;
  newGame: () => void;
  loadGame: () => Promise<boolean>;
  saveGame: () => Promise<boolean>;

  // 游戏操作
  rest: () => { success: boolean; message: string; logs: string[] };
  explore: (locationId: string, exploreType?: 'search' | 'hunt' | 'chest') => {
    success: boolean;
    message: string;
    logs: string[];
    foundItems?: { itemId: string; name: string; quantity: number }[];
    exp?: number;
    treasureFound?: boolean;
    treasureCoins?: number;
  };
  useItem: (itemId: string) => { success: boolean; message: string };
  equipItem: (itemId: string) => Promise<{ success: boolean; message: string }>;
  unequipItem: (itemId: string) => Promise<{ success: boolean; message: string }>;

  // 任务系统
  claimQuestReward: (questId: string) => { success: boolean; message: string };

  // 技能系统
  learnSkill: (skillId: string) => { success: boolean; message: string };

  // 商店系统
  buyItem: (itemId: string, quantity?: number) => { success: boolean; message: string };

  // 制造系统
  craftItem: (slot: import('../data/equipmentTypes').EquipmentSlot, selection: import('../core/CraftingSystem').MaterialSelection) => { success: boolean; message: string };

  // 分解系统
  decomposeItem: (itemId: string) => { success: boolean; message: string; rewards?: any[] };
  getDecomposePreview: (itemId: string) => { success: boolean; preview?: any; message?: string };

  // 升华系统
  sublimateItem: (itemId: string) => Promise<{ success: boolean; message: string; levelUp?: boolean }>;

  // 装备强化系统
  enhanceItem: (itemId: string, useProtection?: boolean) => import('../core/EnhanceSystem').EnhanceResult;
  getEnhancePreview: (itemId: string) => import('../core/EnhanceSystem').EnhancePreview;

  // 神话装备系统
  equipMythologyItem: (equipmentId: string, slot: import('../data/equipmentTypes').EquipmentSlot) => { success: boolean; message: string };
  unequipMythologyItem: (slot: import('../data/equipmentTypes').EquipmentSlot) => { success: boolean; message: string };
  getMythologyEquipmentBySlot: (slot: import('../data/equipmentTypes').EquipmentSlot) => import('../core/EquipmentSystem').EquipmentInstance | undefined;
  enhanceMythologyEquipment: (slot: import('../data/equipmentTypes').EquipmentSlot) => { success: boolean; message: string; newLevel?: number };
  sublimateMythologyEquipment: (slot: import('../data/equipmentTypes').EquipmentSlot) => { success: boolean; message: string; newLevel?: number };

  // 列车系统
  repairTrain: () => { success: boolean; message: string };
  upgradeTrain: (type: any) => { success: boolean; message: string };

  // 战斗系统
  startBattle: (locationId: string, isBoss?: boolean, isElite?: boolean) => { success: boolean; message: string; enemy?: any };
  endBattleVictory: (enemy: any) => { exp: number; loot: any[]; logs: string[] };
  attemptEscape: (enemy: any) => { success: boolean; message: string; logs: string[] };

  // 自动采集系统
  startAutoCollect: (locationId: string, mode: AutoCollectMode) => { success: boolean; message: string };
  stopAutoCollect: () => { success: boolean; message: string; rewards?: CollectReward };
  claimAutoCollectRewards: () => { success: boolean; message: string; rewards?: CollectReward };
  getAutoCollectState: () => GameManager['autoCollectSystem']['state'];
  getAutoCollectConfig: () => GameManager['autoCollectSystem']['config'];
  updateAutoCollectConfig: (config: Partial<GameManager['autoCollectSystem']['config']>) => void;
  getAutoCollectDuration: () => string;
  getEstimatedHourlyRewards: () => CollectReward;
  getAvailableCollectLocations: () => import('../data/autoCollectTypes').CollectLocation[];

  // 获取器
  getPlayer: () => GameManager['player'];
  getInventory: () => GameManager['inventory'];
  getCurrentLocation: () => Location | undefined;
  isGameOver: () => boolean;
  getQuests: () => GameManager['quests'];
  getActiveSkills: () => GameManager['activeSkills'];
  getPassiveSkills: () => GameManager['passiveSkills'];
  getAvailableSkills: () => string[];
  getShopItems: () => GameManager['shopItems'];
}

export const useGameStore = create<GameStore>((set, get) => ({
  // 初始状态
  gameManager: new GameManager(),
  isLoading: false,
  hasSave: false,
  logs: [],
  toasts: [],

  // Toast 提示方法
  showToast: (message: string, type: ToastMessage['type'] = 'info', duration: number = 2000) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newToast: ToastMessage = { id, message, type, duration };
    set((state) => ({ toasts: [...state.toasts, newToast] }));
  },
  removeToast: (id: string) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },

  // 初始化
  init: async () => {
    const hasSave = await GameStorage.hasSave();
    const { gameManager } = get();
    set({ hasSave, logs: gameManager.logs });
  },

  // 新游戏
  newGame: () => {
    const { gameManager } = get();
    gameManager.newGame();
    set({ hasSave: true, logs: gameManager.logs });
  },

  // 加载游戏
  loadGame: async () => {
    set({ isLoading: true });
    try {
      const saveData = await GameStorage.loadGame();
      if (saveData) {
        const { gameManager } = get();
        gameManager.loadGame(saveData);
        set({ hasSave: true, logs: gameManager.logs });
        return true;
      }
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  // 保存游戏
  saveGame: async () => {
    const { gameManager } = get();
    const state = gameManager.saveGame();
    return await GameStorage.saveGame(state);
  },

  // 休息
  rest: () => {
    const { gameManager } = get();
    const result = gameManager.rest();
    get().saveGame();
    set({ logs: gameManager.logs });
    return result;
  },

  // 探索
  explore: (locationId: string, exploreType: 'search' | 'hunt' | 'chest' = 'search') => {
    const { gameManager } = get();
    const result = gameManager.explore(locationId, exploreType);
    get().saveGame();
    set({ logs: gameManager.logs });
    return result;
  },

  // 使用物品
  useItem: (itemId: string) => {
    const { gameManager } = get();
    const result = gameManager.useItem(itemId);
    get().saveGame();
    set({ logs: gameManager.logs });
    return result;
  },

  // 装备物品
  equipItem: async (itemId: string) => {
    const { gameManager } = get();
    const result = gameManager.equipItem(itemId);
    await get().saveGame();
    set({ logs: gameManager.logs });
    return result;
  },

  // 卸下装备
  unequipItem: async (itemId: string) => {
    const { gameManager } = get();
    const result = gameManager.unequipItem(itemId);
    await get().saveGame();
    set({ logs: gameManager.logs });
    return result;
  },

  // 领取任务奖励
  claimQuestReward: (questId: string) => {
    const { gameManager } = get();
    const result = gameManager.claimQuestReward(questId);
    get().saveGame();
    set({ logs: gameManager.logs });
    return result;
  },

  // 学习技能
  learnSkill: (skillId: string) => {
    const { gameManager } = get();
    const result = gameManager.learnSkill(skillId);
    get().saveGame();
    set({ logs: gameManager.logs });
    return result;
  },

  // 购买物品
  buyItem: (itemId: string, quantity: number = 1) => {
    const { gameManager } = get();
    const result = gameManager.buyItem(itemId, quantity);
    get().saveGame();
    set({ logs: gameManager.logs });
    return result;
  },

  // 制造物品
  craftItem: (slot: import('../data/equipmentTypes').EquipmentSlot, selection: import('../core/CraftingSystem').MaterialSelection) => {
    const { gameManager } = get();
    const result = gameManager.craftItem(slot, selection);
    get().saveGame();
    set({ logs: gameManager.logs });
    return result;
  },

  // 分解装备
  decomposeItem: (itemId: string) => {
    const { gameManager } = get();
    const result = gameManager.decomposeItem(itemId);
    get().saveGame();
    set({ logs: gameManager.logs });
    return result;
  },

  // 获取分解预览
  getDecomposePreview: (itemId: string) => {
    const { gameManager } = get();
    return gameManager.getDecomposePreview(itemId);
  },

  // 装备升华
  sublimateItem: async (itemId: string) => {
    const { gameManager } = get();
    const result = gameManager.sublimateItem(itemId);
    await get().saveGame();
    set({ logs: gameManager.logs });
    return result;
  },

  // 装备强化
  enhanceItem: (itemId: string, useProtection: boolean = false) => {
    const { gameManager } = get();
    const result = gameManager.enhanceItem(itemId, useProtection);
    get().saveGame();
    set({ logs: gameManager.logs });
    return result;
  },

  // 获取强化预览
  getEnhancePreview: (itemId: string) => {
    const { gameManager } = get();
    return gameManager.getEnhancePreview(itemId);
  },

  // 神话装备系统
  equipMythologyItem: (equipmentId: string, slot: import('../data/equipmentTypes').EquipmentSlot) => {
    const { gameManager } = get();
    const result = gameManager.equipMythologyItem(equipmentId, slot);
    get().saveGame();
    set({ logs: gameManager.logs });
    return result;
  },
  unequipMythologyItem: (slot: import('../data/equipmentTypes').EquipmentSlot) => {
    const { gameManager } = get();
    const result = gameManager.unequipMythologyItem(slot);
    get().saveGame();
    set({ logs: gameManager.logs });
    return result;
  },
  getMythologyEquipmentBySlot: (slot: import('../data/equipmentTypes').EquipmentSlot) => {
    const { gameManager } = get();
    return gameManager.player.getEquipmentBySlot(slot);
  },
  enhanceMythologyEquipment: (slot: import('../data/equipmentTypes').EquipmentSlot) => {
    const { gameManager } = get();
    const result = gameManager.enhanceMythologyEquipment(slot);
    get().saveGame();
    set({ logs: gameManager.logs });
    return result;
  },
  sublimateMythologyEquipment: (slot: import('../data/equipmentTypes').EquipmentSlot) => {
    const { gameManager } = get();
    const result = gameManager.sublimateMythologyEquipment(slot);
    get().saveGame();
    set({ logs: gameManager.logs });
    return result;
  },

  // 修复列车
  repairTrain: () => {
    const { gameManager } = get();
    const result = gameManager.repairTrain();
    get().saveGame();
    set({ logs: gameManager.logs });
    return result;
  },

  // 升级列车
  upgradeTrain: (type: any) => {
    const { gameManager } = get();
    const result = gameManager.upgradeTrain(type);
    get().saveGame();
    set({ logs: gameManager.logs });
    return result;
  },

  // 战斗系统
  startBattle: (locationId: string, isBoss: boolean = false, isElite: boolean = false) => {
    const { gameManager } = get();
    const result = gameManager.startBattle(locationId, isBoss, isElite);
    get().saveGame();
    set({ logs: gameManager.logs });
    return result;
  },
  endBattleVictory: (enemy: any) => {
    const { gameManager } = get();
    const result = gameManager.endBattleVictory(enemy);
    get().saveGame();
    set({ logs: gameManager.logs });
    return result;
  },
  attemptEscape: (enemy: any) => {
    const { gameManager } = get();
    const result = gameManager.attemptEscape(enemy);
    get().saveGame();
    set({ logs: gameManager.logs });
    return result;
  },

  // 自动采集系统
  startAutoCollect: (locationId: string, mode: AutoCollectMode) => {
    const { gameManager } = get();
    const result = gameManager.startAutoCollect(locationId, mode);
    get().saveGame();
    set({ logs: gameManager.logs });
    return result;
  },
  stopAutoCollect: () => {
    const { gameManager } = get();
    const result = gameManager.stopAutoCollect();
    get().saveGame();
    set({ logs: gameManager.logs });
    return result;
  },
  claimAutoCollectRewards: () => {
    const { gameManager } = get();
    const result = gameManager.claimAutoCollectRewards();
    get().saveGame();
    set({ logs: gameManager.logs });
    return result;
  },
  getAutoCollectState: () => get().gameManager.getAutoCollectState(),
  getAutoCollectConfig: () => get().gameManager.getAutoCollectConfig(),
  updateAutoCollectConfig: (config: Partial<GameManager['autoCollectSystem']['config']>) => {
    const { gameManager } = get();
    gameManager.updateAutoCollectConfig(config);
  },
  getAutoCollectDuration: () => get().gameManager.getAutoCollectDuration(),
  getEstimatedHourlyRewards: () => get().gameManager.getEstimatedHourlyRewards(),
  getAvailableCollectLocations: () => get().gameManager.getAvailableCollectLocations(),

  // 获取器
  getPlayer: () => get().gameManager.player,
  getInventory: () => get().gameManager.inventory,
  getCurrentLocation: () => get().gameManager.getCurrentLocation(),
  isGameOver: () => get().gameManager.isGameOver,
  getQuests: () => get().gameManager.quests,
  getActiveSkills: () => get().gameManager.activeSkills,
  getPassiveSkills: () => get().gameManager.passiveSkills,
  getAvailableSkills: () => get().gameManager.availableSkills,
  getShopItems: () => get().gameManager.shopItems,
}));
