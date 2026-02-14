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

  // 基地设施系统
  getFacilityLevel: (facilityId: import('../core/BaseFacilitySystem').FacilityType) => number;
  getEnergyCoreEfficiency: () => number;
  getWarehouseCapacity: () => number;
  getMedicalRecoveryBonus: () => number;
  getMedicalEfficiency: () => {
    level: number;
    hpRecoveryBase: number;
    hpRecoveryActual: number;
    staminaRecoveryBase: number;
    staminaRecoveryActual: number;
    staminaRegenBase: number;
    staminaRegenActual: number;
    bonusPercent: number;
  };
  getFacilityUpgradePreview: (facilityId: import('../core/BaseFacilitySystem').FacilityType) => {
    canUpgrade: boolean;
    reason?: string;
    currentLevel: number;
    nextLevel?: number;
    cost?: { credits: number; materials: { itemId: string; count: number }[] };
    effect?: { description: string; value: number };
  };
  upgradeFacility: (facilityId: import('../core/BaseFacilitySystem').FacilityType) => { success: boolean; message: string; newLevel?: number };
  getAllFacilities: () => import('../core/BaseFacilitySystem').FacilityState[];
  getFacilityDefinition: (facilityId: import('../core/BaseFacilitySystem').FacilityType) => import('../core/BaseFacilitySystem').FacilityDefinition | undefined;

  // 船员系统
  getCrewMembers: () => import('../core/CrewSystem').CrewMember[];
  getBattleCrew: () => import('../core/CrewSystem').CrewMember[];
  getCrewCapacity: () => number;
  getRecruitTicketCount: (recruitType: import('../core/CrewSystem').RecruitType) => number;
  recruitCrew: (recruitType: import('../core/CrewSystem').RecruitType) => { success: boolean; message: string; crew?: import('../core/CrewSystem').CrewMember; rarity?: string };
  recruitCrewTen: (recruitType: import('../core/CrewSystem').RecruitType) => { success: boolean; message: string; crews?: import('../core/CrewSystem').CrewMember[] };
  setCrewBattleSlot: (crewId: string, slot: number) => { success: boolean; message: string };
  dismissCrew: (crewId: string) => { success: boolean; message: string };

  // 通讯系统
  getCommEvents: () => import('../core/CommSystem').CommEvent[];
  scanCommSignals: () => { success: boolean; message: string; newEvents?: import('../core/CommSystem').CommEvent[] };
  respondToCommEvent: (eventId: string) => { success: boolean; message: string; rewards?: string };
  ignoreCommEvent: (eventId: string) => { success: boolean; message: string };
  getCommScanCooldown: () => number;

  // 研究系统
  getResearchProjects: () => import('../core/ResearchSystem').ResearchProject[];
  getActiveResearch: () => import('../core/ResearchSystem').ResearchProject[];
  startResearch: (projectId: string) => { success: boolean; message: string };
  cancelResearch: (projectId: string) => { success: boolean; message: string };
  getResearchBonus: (type: string) => number;

  // 采矿系统
  getAvailableMiningSites: () => ReturnType<GameManager['getAvailableMiningSites']>;
  getMiningTasks: () => import('../core/MiningSystem').MiningTask[];
  startMining: (siteId: string) => { success: boolean; message: string };
  startMiningWithCrew: (siteId: string, crewIds: string[]) => { success: boolean; message: string; task?: import('../core/MiningSystem').MiningTask };
  collectMining: (siteId: string) => { success: boolean; message: string; yield?: number; mineral?: string; depth?: number; events?: number };
  cancelMining: (siteId: string) => { success: boolean; message: string };
  processMiningRandomEvent: (siteId: string) => { event: string; message: string; bonus?: number; items?: { itemId: string; count: number }[] } | null;
  calculateCrewMiningBonus: (crewIds: string[]) => number;

  // 芯片系统
  getChips: () => import('../core/ChipSystem').Chip[];
  getEquippedChips: () => import('../core/ChipSystem').Chip[];
  getAvailableChipSlots: () => number;
  craftChip: (slot: import('../core/ChipSystem').ChipSlot, rarity: import('../core/ChipSystem').ChipRarity) => { success: boolean; message: string; chip?: import('../core/ChipSystem').Chip };
  upgradeChip: (chipId: string, materialCount: number) => { success: boolean; message: string; newLevel?: number };
  equipChip: (chipId: string) => { success: boolean; message: string };
  unequipChip: (slot: import('../core/ChipSystem').ChipSlot) => { success: boolean; message: string };
  decomposeChip: (chipId: string) => { success: boolean; message: string; rewards?: string };
  enhanceChip: (chipId: string, subStatIndex: number) => { success: boolean; message: string };
  rerollChipSubStat: (chipId: string, subStatIndex: number) => { success: boolean; message: string; newValue?: number };
  rerollAllChipSubStats: (chipId: string) => { success: boolean; message: string };
  toggleChipLock: (chipId: string) => { success: boolean; message: string; locked?: boolean };
  getChipSetBonuses: () => { set: import('../core/ChipSystem').ChipSet; count: number; bonuses: string[] }[];
  getChipStatBonus: () => Record<string, number>;

  // 基因系统
  getGeneNodes: () => import('../core/GeneSystem').GeneNode[];
  upgradeGeneNode: (nodeId: string) => { success: boolean; message: string; newValue?: number };
  getGeneTotalStats: () => Record<import('../core/GeneSystem').GeneType, number>;

  // 机械飞升系统
  getImplants: () => import('../core/CyberneticSystem').Implant[];
  getEquippedImplants: () => import('../core/CyberneticSystem').Implant[];
  getAvailableImplantSlots: () => import('../core/CyberneticSystem').ImplantType[];
  craftImplant: (rarity: import('../core/CyberneticSystem').ImplantRarity) => { success: boolean; message: string; implant?: import('../core/CyberneticSystem').Implant };
  upgradeImplant: (implantId: string) => { success: boolean; message: string; newLevel?: number };
  equipImplant: (implantId: string) => { success: boolean; message: string };
  unequipImplant: (type: import('../core/CyberneticSystem').ImplantType) => { success: boolean; message: string };
  decomposeImplant: (implantId: string) => { success: boolean; message: string; rewards?: string };
  getImplantTotalStats: () => Record<string, number>;

  // 星际市场系统
  getMarketListings: () => import('../core/MarketSystem').MarketListing[];
  getPlayerListings: () => import('../core/MarketSystem').PlayerListing[];
  getMarketTransactions: () => import('../core/MarketSystem').MarketTransaction[];
  listMarketItem: (itemId: string, quantity: number, price: number) => { success: boolean; message: string; listing?: import('../core/MarketSystem').PlayerListing };
  cancelMarketListing: (listingId: string) => { success: boolean; message: string };
  buyMarketItem: (listingId: string) => { success: boolean; message: string };
  refreshMarket: () => { success: boolean; message: string };

  // 遗迹探索系统
  getRuins: () => import('../core/RuinSystem').Ruin[];
  getExploreMissions: () => import('../core/RuinSystem').ExploreMission[];
  startExplore: (ruinId: string, crewIds: string[]) => { success: boolean; message: string; mission?: import('../core/RuinSystem').ExploreMission };
  completeExplore: (missionId: string) => { success: boolean; message: string; rewards?: { credits: number; items: { itemId: string; count: number }[]; experience: number } };
  cancelExplore: (missionId: string) => { success: boolean; message: string };

  // 获取器
  getPlayer: () => GameManager['player'];
  getInventory: () => GameManager['inventory'];
  getCurrentLocation: () => Location | undefined;
  isGameOver: () => boolean;
  getQuests: () => GameManager['quests'];
  getShopItems: () => GameManager['shopItems'];
}

export const useGameStore = create<GameStore>((set, get) => {
  // 辅助函数：执行游戏操作后更新状态
  const executeGameAction = <T extends { success: boolean; message: string }>(
    action: () => T,
    save: boolean = true
  ): T => {
    const { gameManager } = get();
    const result = action();
    if (save) {
      get().saveGame();
    }
    set({ logs: gameManager.logs });
    return result;
  };

  // 辅助函数：异步执行游戏操作后更新状态
  const executeGameActionAsync = async <T extends { success: boolean; message: string }>(
    action: () => Promise<T>,
    save: boolean = true
  ): Promise<T> => {
    const { gameManager } = get();
    const result = await action();
    if (save) {
      await get().saveGame();
    }
    set({ logs: gameManager.logs });
    return result;
  };

  return {
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
      } catch (error) {
        console.error('Failed to load game:', error);
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
    rest: () => executeGameAction(() => get().gameManager.rest()),

    // 探索
    explore: (locationId: string, exploreType: 'search' | 'hunt' | 'chest' = 'search') =>
      executeGameAction(() => get().gameManager.explore(locationId, exploreType)),

    // 使用物品
    useItem: (itemId: string) =>
      executeGameAction(() => get().gameManager.useItem(itemId)),

    // 装备物品
    equipItem: async (itemId: string) =>
      executeGameActionAsync(async () => get().gameManager.equipItem(itemId)),

    // 卸下装备
    unequipItem: async (itemId: string) =>
      executeGameActionAsync(async () => get().gameManager.unequipItem(itemId)),

    // 领取任务奖励
    claimQuestReward: (questId: string) =>
      executeGameAction(() => get().gameManager.claimQuestReward(questId)),

    // 购买物品
    buyItem: (itemId: string, quantity: number = 1) =>
      executeGameAction(() => get().gameManager.buyItem(itemId, quantity)),

    // 制造物品
    craftItem: (slot: import('../data/equipmentTypes').EquipmentSlot, selection: import('../core/CraftingSystem').MaterialSelection) =>
      executeGameAction(() => get().gameManager.craftItem(slot, selection)),

    // 分解装备
    decomposeItem: (itemId: string) =>
      executeGameAction(() => get().gameManager.decomposeItem(itemId)),

    // 获取分解预览
    getDecomposePreview: (itemId: string) => {
      const { gameManager } = get();
      return gameManager.getDecomposePreview(itemId);
    },

    // 装备升华
    sublimateItem: async (itemId: string) =>
      executeGameActionAsync(async () => get().gameManager.sublimateItem(itemId)),

    // 装备强化
    enhanceItem: (itemId: string, useProtection: boolean = false) =>
      executeGameAction(() => get().gameManager.enhanceItem(itemId, useProtection)),

    // 获取强化预览
    getEnhancePreview: (itemId: string) => {
      const { gameManager } = get();
      return gameManager.getEnhancePreview(itemId);
    },

    // 神话装备系统
    equipMythologyItem: (equipmentId: string, slot: import('../data/equipmentTypes').EquipmentSlot) =>
      executeGameAction(() => get().gameManager.equipMythologyItem(equipmentId, slot)),

    unequipMythologyItem: (slot: import('../data/equipmentTypes').EquipmentSlot) =>
      executeGameAction(() => get().gameManager.unequipMythologyItem(slot)),

    getMythologyEquipmentBySlot: (slot: import('../data/equipmentTypes').EquipmentSlot) => {
      const { gameManager } = get();
      return gameManager.player.getEquipmentBySlot(slot);
    },

    enhanceMythologyEquipment: (slot: import('../data/equipmentTypes').EquipmentSlot) =>
      executeGameAction(() => get().gameManager.enhanceMythologyEquipment(slot)),

    sublimateMythologyEquipment: (slot: import('../data/equipmentTypes').EquipmentSlot) =>
      executeGameAction(() => get().gameManager.sublimateMythologyEquipment(slot)),

    // 修复列车
    repairTrain: () =>
      executeGameAction(() => get().gameManager.repairTrain()),

    // 升级列车
    upgradeTrain: (type: any) =>
      executeGameAction(() => get().gameManager.upgradeTrain(type)),

    // 战斗系统
    startBattle: (locationId: string, isBoss: boolean = false, isElite: boolean = false) =>
      executeGameAction(() => get().gameManager.startBattle(locationId, isBoss, isElite)),

    endBattleVictory: (enemy: any) => {
      const { gameManager } = get();
      const result = gameManager.endBattleVictory(enemy);
      // 战斗胜利后恢复生命值至满（包含装备加成）
      gameManager.player.hp = gameManager.player.totalMaxHp;
      get().saveGame();
      set({ logs: gameManager.logs });
      return result;
    },

    attemptEscape: (enemy: any) =>
      executeGameAction(() => get().gameManager.attemptEscape(enemy)),

    // 自动采集系统
    startAutoCollect: (locationId: string, mode: AutoCollectMode) =>
      executeGameAction(() => get().gameManager.startAutoCollect(locationId, mode)),

    stopAutoCollect: () =>
      executeGameAction(() => get().gameManager.stopAutoCollect()),

    claimAutoCollectRewards: () =>
      executeGameAction(() => get().gameManager.claimAutoCollectRewards()),

    getAutoCollectState: () => get().gameManager.getAutoCollectState(),
    getAutoCollectConfig: () => get().gameManager.getAutoCollectConfig(),
    updateAutoCollectConfig: (config: Partial<GameManager['autoCollectSystem']['config']>) => {
      const { gameManager } = get();
      gameManager.updateAutoCollectConfig(config);
    },
    getAutoCollectDuration: () => get().gameManager.getAutoCollectDuration(),
    getEstimatedHourlyRewards: () => get().gameManager.getEstimatedHourlyRewards(),
    getAvailableCollectLocations: () => get().gameManager.getAvailableCollectLocations(),

    // 基地设施系统
    getFacilityLevel: (facilityId) => get().gameManager.getFacilityLevel(facilityId),
    getEnergyCoreEfficiency: () => get().gameManager.getEnergyCoreEfficiency(),
    getWarehouseCapacity: () => get().gameManager.getWarehouseCapacity(),
    getMedicalRecoveryBonus: () => get().gameManager.getMedicalRecoveryBonus(),
    getMedicalEfficiency: () => get().gameManager.getMedicalEfficiency(),
    getFacilityUpgradePreview: (facilityId) => get().gameManager.getFacilityUpgradePreview(facilityId),
    upgradeFacility: (facilityId) => executeGameAction(() => get().gameManager.upgradeFacility(facilityId)),
    getAllFacilities: () => get().gameManager.getAllFacilities(),
    getFacilityDefinition: (facilityId) => get().gameManager.getFacilityDefinition(facilityId),

    // 船员系统
    getCrewMembers: () => get().gameManager.getCrewMembers(),
    getBattleCrew: () => get().gameManager.getBattleCrew(),
    getCrewCapacity: () => get().gameManager.getCrewCapacity(),
    getRecruitTicketCount: (recruitType) => get().gameManager.getRecruitTicketCount(recruitType),
    recruitCrew: (recruitType) => executeGameAction(() => get().gameManager.recruitCrew(recruitType)),
    recruitCrewTen: (recruitType) => executeGameAction(() => get().gameManager.recruitCrewTen(recruitType)),
    setCrewBattleSlot: (crewId, slot) => executeGameAction(() => get().gameManager.setCrewBattleSlot(crewId, slot)),
    dismissCrew: (crewId) => executeGameAction(() => get().gameManager.dismissCrew(crewId)),

    // 通讯系统
    getCommEvents: () => get().gameManager.getCommEvents(),
    scanCommSignals: () => executeGameAction(() => get().gameManager.scanCommSignals()),
    respondToCommEvent: (eventId) => executeGameAction(() => get().gameManager.respondToCommEvent(eventId)),
    ignoreCommEvent: (eventId) => executeGameAction(() => get().gameManager.ignoreCommEvent(eventId)),
    getCommScanCooldown: () => get().gameManager.getCommScanCooldown(),

    // 研究系统
    getResearchProjects: () => get().gameManager.getResearchProjects(),
    getActiveResearch: () => get().gameManager.getActiveResearch(),
    startResearch: (projectId) => executeGameAction(() => get().gameManager.startResearch(projectId)),
    cancelResearch: (projectId) => executeGameAction(() => get().gameManager.cancelResearch(projectId)),
    getResearchBonus: (type) => get().gameManager.getResearchBonus(type),

    // 采矿系统
    getAvailableMiningSites: () => get().gameManager.getAvailableMiningSites(),
    getMiningTasks: () => get().gameManager.getMiningTasks(),
    startMining: (siteId) => executeGameAction(() => get().gameManager.startMining(siteId)),
    startMiningWithCrew: (siteId, crewIds) => executeGameAction(() => get().gameManager.startMiningWithCrew(siteId, crewIds)),
    collectMining: (siteId) => executeGameAction(() => get().gameManager.collectMining(siteId)),
    cancelMining: (siteId) => executeGameAction(() => get().gameManager.cancelMining(siteId)),
    processMiningRandomEvent: (siteId) => executeGameAction(() => get().gameManager.processMiningRandomEvent(siteId)),
    calculateCrewMiningBonus: (crewIds) => get().gameManager.calculateCrewMiningBonus(crewIds),

    // 芯片系统
    getChips: () => get().gameManager.getChips(),
    getEquippedChips: () => get().gameManager.getEquippedChips(),
    getAvailableChipSlots: () => get().gameManager.getAvailableChipSlots(),
    craftChip: (slot, rarity) => executeGameAction(() => get().gameManager.craftChip(slot, rarity)),
    upgradeChip: (chipId, materialCount) => executeGameAction(() => get().gameManager.upgradeChip(chipId, materialCount)),
    equipChip: (chipId) => executeGameAction(() => get().gameManager.equipChip(chipId)),
    unequipChip: (slot) => executeGameAction(() => get().gameManager.unequipChip(slot)),
    decomposeChip: (chipId) => executeGameAction(() => get().gameManager.decomposeChip(chipId)),
    enhanceChip: (chipId, subStatIndex) => executeGameAction(() => get().gameManager.enhanceChipItem(chipId, subStatIndex)),
    rerollChipSubStat: (chipId, subStatIndex) => executeGameAction(() => get().gameManager.rerollChipSubStat(chipId, subStatIndex)),
    rerollAllChipSubStats: (chipId) => executeGameAction(() => get().gameManager.rerollAllChipSubStats(chipId)),
    toggleChipLock: (chipId) => executeGameAction(() => get().gameManager.toggleChipLockState(chipId)),
    getChipSetBonuses: () => get().gameManager.getChipSetBonuses(),
    getChipStatBonus: () => get().gameManager.getChipStatBonus(),

    // 基因系统
    getGeneNodes: () => get().gameManager.getGeneNodes(),
    upgradeGeneNode: (nodeId) => executeGameAction(() => get().gameManager.upgradeGeneNode(nodeId)),
    getGeneTotalStats: () => get().gameManager.getGeneTotalStats(),

    // 机械飞升系统
    getImplants: () => get().gameManager.getImplants(),
    getEquippedImplants: () => get().gameManager.getEquippedImplants(),
    getAvailableImplantSlots: () => get().gameManager.getAvailableImplantSlots(),
    craftImplant: (rarity) => executeGameAction(() => get().gameManager.craftImplant(rarity)),
    upgradeImplant: (implantId) => executeGameAction(() => get().gameManager.upgradeImplantItem(implantId)),
    equipImplant: (implantId) => executeGameAction(() => get().gameManager.equipImplant(implantId)),
    unequipImplant: (type) => executeGameAction(() => get().gameManager.unequipImplant(type)),
    decomposeImplant: (implantId) => executeGameAction(() => get().gameManager.decomposeImplant(implantId)),
    getImplantTotalStats: () => get().gameManager.getImplantTotalStats(),

    // 星际市场系统
    getMarketListings: () => get().gameManager.getMarketListings(),
    getPlayerListings: () => get().gameManager.getPlayerListings(),
    getMarketTransactions: () => get().gameManager.getMarketTransactions(),
    listMarketItem: (itemId, quantity, price) => executeGameAction(() => get().gameManager.listMarketItem(itemId, quantity, price)),
    cancelMarketListing: (listingId) => executeGameAction(() => get().gameManager.cancelMarketListing(listingId)),
    buyMarketItem: (listingId) => executeGameAction(() => get().gameManager.buyMarketItem(listingId)),
    refreshMarket: () => executeGameAction(() => get().gameManager.refreshMarket()),

    // 遗迹探索系统
    getRuins: () => get().gameManager.getRuins(),
    getExploreMissions: () => get().gameManager.getExploreMissions(),
    startExplore: (ruinId, crewIds) => executeGameAction(() => get().gameManager.startExplore(ruinId, crewIds)),
    completeExplore: (missionId) => executeGameAction(() => get().gameManager.completeExplore(missionId)),
    cancelExplore: (missionId) => executeGameAction(() => get().gameManager.cancelExplore(missionId)),

    // 获取器
    getPlayer: () => get().gameManager.player,
    getInventory: () => get().gameManager.inventory,
    getCurrentLocation: () => get().gameManager.getCurrentLocation(),
    isGameOver: () => get().gameManager.isGameOver,
    getQuests: () => get().gameManager.quests,
    getShopItems: () => get().gameManager.shopItems,
  };
});
