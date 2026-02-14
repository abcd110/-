import { Player, type PlayerData } from './Player';
import { Inventory } from './Inventory';
import type { InventoryItem, Location, Enemy } from '../data/types';
import { ItemType, ItemRarity } from '../data/types';
import type { EquipmentInstance } from './EquipmentSystem';
import { calculateEnemyStats } from '../data/locations';
import { getItemTemplate } from '../data/items';
import { ENEMIES, createEnemyInstance } from '../data/enemies';
import { getRandomEnemyForPlanet, getBossEnemyForPlanet, getEliteEnemyForPlanet, EXTENDED_ENEMIES } from '../data/enemyAdapter';
import { ArmorQuality, ARMOR_QUALITY_NAMES } from '../data/nanoArmorRecipes';
import { Quest, QuestConditionType, QuestStatus, QuestType, DEFAULT_QUESTS } from './QuestSystem';
import { EquipmentSlot } from '../data/equipmentTypes';
import { ShopItem, SHOP_ITEMS } from './ShopSystem';
import { DECOMPOSE_REWARDS, TYPE_BONUS, SUBLIMATION_BONUS, MATERIAL_NAMES, getDecomposePreview as getDecomposePreviewFunc, decompose as decomposeFunc } from './DecomposeSystem';
import { ENHANCE_CONFIG, MAX_ENHANCE_LEVEL, ENHANCE_STONE_ID, PROTECTION_ITEM_ID, MATERIAL_NAMES as ENHANCE_MATERIAL_NAMES, EnhanceResultType, type EnhanceResult, type EnhancePreview, calculateEnhanceBonus, canEnhance, getSuccessRate } from './EnhanceSystem';
import { equipmentSystem } from './EquipmentSystem';
import { calculateEquipmentStats, calculateEnhancedStatsPreview } from './EquipmentStatCalculator';
import { AutoCollectSystem } from './AutoCollectSystem';
import { AutoCollectMode, CollectReward, getCollectRobot } from '../data/autoCollectTypes';
import { synthesize, synthesizeBatch, getSynthesizableMaterials, QUALITY_NAMES } from './MaterialSynthesisSystem';
import { BaseFacilitySystem, FacilityType, FACILITY_DEFINITIONS } from './BaseFacilitySystem';
import { CrewMember, CrewMemberData, RecruitType, RECRUIT_CONFIG, RARITY_CONFIG, ROLE_CONFIG, addCrewExp, getRarityByRoll, getRandomCrewDefinition, generateCrewFromDefinition, generateFallbackCrew, serializeCrewMember, deserializeCrewMember, createPlayerCrew, isPlayerCrew } from './CrewSystem';
import { CommEvent, CommEventData, generateCommEvent, getMaxEvents, getScanCooldown, serializeCommEvent, deserializeCommEvent, isEventExpired, COMM_EVENT_CONFIG } from './CommSystem';
import { ResearchProject, ResearchProjectData, ResearchStatus, createResearchProject, serializeResearchProject, deserializeResearchProject, canStartResearch, getMaxConcurrentResearch, getResearchSpeedBonus, RESEARCH_PROJECTS } from './ResearchSystem';
import { MiningTask, MiningTaskData, MiningStatus, MiningSite, MINING_SITES, MINERAL_CONFIG, MINING_EVENTS, MiningEventType, getMiningYield, getMiningDuration, getMaxMiningSlots, createMiningTask, serializeMiningTask, deserializeMiningTask, isMiningComplete, getMiningProgress, getRemainingTime, getCrewMiningBonus, checkMiningEvent, processMiningEvent, getDepthProgress, getDepthBonusDescription } from './MiningSystem';
import { Chip, ChipData, ChipSlot, ChipRarity, ChipSet, ChipSubStat, createChip, upgradeChip, enhanceChip, rerollSubStat, rerollAllSubStats, toggleChipLock, serializeChip, deserializeChip, getUpgradeCost, getEnhanceCost, getRerollCost, getChipStats, getSetBonus, CHIP_RARITY_CONFIG, CHIP_SET_CONFIG, CHIP_MAIN_STAT_CONFIG, CHIP_SUB_STAT_CONFIG, CHIP_CRAFT_COST } from './ChipSystem';
import { GeneNode, GeneNodeData, GeneType, GENE_TREE, createGeneNode, upgradeGeneNode, getGeneUpgradeCost, getGeneTotalStats, serializeGeneNode, deserializeGeneNode, GENE_TYPE_CONFIG, GENE_RARITY_CONFIG } from './GeneSystem';
import { Implant, ImplantData, ImplantType, ImplantRarity, IMPLANT_TEMPLATES, IMPLANT_TYPE_CONFIG, IMPLANT_RARITY_CONFIG, createImplant, upgradeImplant, getImplantStats, getImplantUpgradeCost, serializeImplant, deserializeImplant, getRandomImplantRarity, getRandomImplantByRarity } from './CyberneticSystem';
import { MarketListing, PlayerListing, MarketTransaction, MarketItemType, MarketRarity, MARKET_MAX_LISTINGS, createMarketListing, isListingExpired, calculateTax, calculateFinalPrice, generateSystemListings, serializeMarketListing, deserializeMarketListing, serializePlayerListing, deserializePlayerListing, serializeMarketTransaction, deserializeMarketTransaction } from './MarketSystem';
import { Ruin, ExploreMission, RuinType, RuinDifficulty, ExploreStatus, RUIN_TYPE_CONFIG, RUIN_DIFFICULTY_CONFIG, createRuin, generateRuins, calculateExploreSuccess, generateRewards, getRemainingExploreTime, formatExploreTime, serializeRuin, deserializeRuin, serializeExploreMission, deserializeExploreMission } from './RuinSystem';

export interface GameState {
  player: PlayerData;
  inventory: { items: InventoryItem[]; equipment: EquipmentInstance[] } | InventoryItem[];
  day: number;
  time: 'day' | 'night';
  currentLocation: string;
  gameTime: number;
  logs: string[];
  trainCoins: number;
  quests: any[];
  shopItems: any[];
  lastShopRefreshDate: string; // 上次商店刷新日期 (YYYY-MM-DD格式)
  playerName: string;
  locationProgress: Array<[string, {
    materialProgress: number;
    huntProgress: number;
    bossDefeated: boolean;
    lastBossDefeatDay: number;
    lastBossChallengeDate: string | null;
  }]>;
  autoCollectSystem?: any; // 自动采集系统数据
  baseFacilitySystem?: any; // 基地设施系统数据
  lastStaminaRecoveryTime?: number; // 上次体力恢复时间戳
  crewMembers?: CrewMemberData[]; // 船员列表
  commEvents?: CommEventData[]; // 通讯事件列表
  lastCommScanTime?: number; // 上次扫描时间戳
  researchProjects?: ResearchProjectData[]; // 研究项目列表
  completedResearch?: string[]; // 已完成的研究ID列表
  miningTasks?: MiningTaskData[]; // 采矿任务列表
  chips?: ChipData[]; // 芯片列表
  equippedChips?: { [key: number]: string }; // 装备的芯片 key为槽位号
  geneNodes?: GeneNodeData[]; // 基因节点列表
  implants?: ImplantData[]; // 机械义体列表
  equippedImplants?: { [key: string]: string }; // 装备的义体 key为类型
  marketListings?: any[]; // 市场挂单列表
  playerListings?: any[]; // 玩家挂单列表
  marketTransactions?: any[]; // 市场交易记录
  ruins?: any[]; // 遗迹列表
  exploreMissions?: any[]; // 探索任务列表
}

export class GameManager {
  player: Player;
  inventory: Inventory;
  day: number;
  time: 'day' | 'night';
  currentLocation: string;
  gameTime: number;
  logs: string[];
  isGameOver: boolean;
  playerName: string;
  trainCoins: number; // 信用点/货币

  // 任务系统
  quests: Map<string, Quest> = new Map();

  // 商店系统
  shopItems: Map<string, ShopItem> = new Map();
  lastShopRefreshDate: string = ''; // 上次商店刷新日期 (YYYY-MM-DD格式)

  // 地点探索进度
  locationProgress: Map<string, {
    materialProgress: number;
    huntProgress: number;
    bossDefeated: boolean;
    lastBossDefeatDay: number;
    lastBossChallengeDate: string | null; // 上次挑战BOSS的日期 (YYYY-MM-DD格式)
  }> = new Map();

  // 精神值现实时间回复
  lastSpiritRecoveryTime: number = Date.now(); // 上次精神值回复时间戳
  lastSpiritDailyRecoveryDate: string = ''; // 上次每日精神值回复日期

  // 体力现实时间回复
  lastStaminaRecoveryTime: number = Date.now(); // 上次体力值回复时间戳

  // 船员系统
  crewMembers: CrewMember[] = [];

  // 通讯系统
  commEvents: CommEvent[] = [];
  lastCommScanTime: number = 0;

  // 研究系统
  researchProjects: ResearchProject[] = [];
  completedResearch: string[] = [];

  // 采矿系统
  miningTasks: MiningTask[] = [];

  // 芯片系统
  chips: Chip[] = [];
  equippedChips: { [key: number]: string } = {};

  // 基因系统
  geneNodes: GeneNode[] = [];

  // 机械飞升系统
  implants: Implant[] = [];
  equippedImplants: { [key: string]: string } = {};

  // 星际市场系统
  marketListings: MarketListing[] = [];
  playerListings: PlayerListing[] = [];
  marketTransactions: MarketTransaction[] = [];

  // 遗迹探索系统
  ruins: Ruin[] = [];
  exploreMissions: ExploreMission[] = [];

  // 自动采集系统
  autoCollectSystem: AutoCollectSystem = new AutoCollectSystem();

  // 基地设施系统
  baseFacilitySystem: BaseFacilitySystem = new BaseFacilitySystem();

  constructor() {
    this.player = new Player();
    this.inventory = new Inventory();
    this.day = 1;
    this.time = 'day';
    this.currentLocation = 'loc_001';
    this.gameTime = 480; // 从早上8点开始
    this.logs = [];
    this.isGameOver = false;
    this.playerName = '幸存者';
    this.trainCoins = 0; // 初始信用点

    this.initQuests();
    this.initShop();

    this.initPlayerCrew();
  }

  initPlayerCrew() {
    const playerCrew = createPlayerCrew(this.playerName, this.player.level);
    this.crewMembers.push(playerCrew);
  }

  // 检查并回复精神值（基于现实时间）
  // 每分钟回复1点，每天自动回复50点
  checkAndRecoverSpirit(): { recovered: number; minutesPassed: number; dailyRecovered: number } {
    const now = Date.now();
    const oneMinute = 60 * 1000; // 1分钟的毫秒数

    // 检查每日回复（每天自动回复50点）
    const today = new Date().toISOString().split('T')[0];
    let dailyRecovered = 0;
    if (today !== this.lastSpiritDailyRecoveryDate) {
      const oldSpirit = this.player.spirit;
      this.player.spirit = Math.min(this.player.maxSpirit, this.player.spirit + 50);
      dailyRecovered = this.player.spirit - oldSpirit;
      this.lastSpiritDailyRecoveryDate = today;
      if (dailyRecovered > 0) {
        this.addLog('精神恢复', `每日自动回复 ${dailyRecovered} 精神值`);
      }
    }

    // 计算经过了多少分钟
    const elapsedMs = now - this.lastSpiritRecoveryTime;
    const elapsedMinutes = Math.floor(elapsedMs / oneMinute);

    if (elapsedMinutes <= 0) {
      return { recovered: 0, minutesPassed: 0, dailyRecovered };
    }

    // 每分钟回复1点精神值
    const totalRecovery = elapsedMinutes;

    const oldSpirit = this.player.spirit;
    this.player.spirit = Math.min(this.player.maxSpirit, this.player.spirit + totalRecovery);
    const actualRecovered = this.player.spirit - oldSpirit;

    // 更新上次回复时间（只计算完整的分钟）
    this.lastSpiritRecoveryTime = this.lastSpiritRecoveryTime + (elapsedMinutes * oneMinute);

    if (actualRecovered > 0) {
      this.addLog('精神恢复', `现实时间经过 ${elapsedMinutes} 分钟，恢复 ${actualRecovered} 精神值`);
    }

    return { recovered: actualRecovered, minutesPassed: elapsedMinutes, dailyRecovered };
  }

  // 检查并回复体力（基于现实时间）
  // 每分钟回复1点，受医疗舱加成
  checkAndRecoverStamina(): { recovered: number; minutesPassed: number } {
    const now = Date.now();
    const oneMinute = 60 * 1000; // 1分钟的毫秒数

    // 计算经过了多少分钟
    const elapsedMs = now - this.lastStaminaRecoveryTime;
    const elapsedMinutes = Math.floor(elapsedMs / oneMinute);

    if (elapsedMinutes <= 0) {
      return { recovered: 0, minutesPassed: 0 };
    }

    // 医疗舱加成
    const medicalBonus = this.getMedicalRecoveryBonus();
    const staminaRegenMultiplier = 1 + medicalBonus / 100;

    // 每分钟回复1点体力，受医疗舱加成
    const baseRecoveryPerMinute = 1;
    const totalRecovery = Math.floor(elapsedMinutes * baseRecoveryPerMinute * staminaRegenMultiplier);

    const oldStamina = this.player.stamina;
    this.player.recoverStamina(totalRecovery);
    const actualRecovered = this.player.stamina - oldStamina;

    // 更新上次回复时间（只计算完整的分钟）
    this.lastStaminaRecoveryTime = this.lastStaminaRecoveryTime + (elapsedMinutes * oneMinute);

    if (actualRecovered > 0 && elapsedMinutes >= 5) {
      // 只在恢复超过5分钟时记录日志，避免刷屏
      this.addLog('体力恢复', `现实时间经过 ${elapsedMinutes} 分钟，恢复 ${actualRecovered} 体力`);
    }

    return { recovered: actualRecovered, minutesPassed: elapsedMinutes };
  }

  // 初始化任务
  initQuests(): void {
    DEFAULT_QUESTS.forEach(questData => {
      const quest = new Quest(questData);
      this.quests.set(quest.id, quest);
    });
  }

  // 初始化商店
  initShop(): void {
    SHOP_ITEMS.forEach(itemData => {
      const item = new ShopItem(itemData);
      this.shopItems.set(itemData.itemId, item);
    });
  }

  // 开始新游戏
  newGame(): void {
    this.player = new Player();
    this.inventory = new Inventory();
    this.day = 1;
    this.time = 'day';
    this.currentLocation = 'loc_001';
    this.gameTime = 480;
    this.logs = [];
    this.isGameOver = false;

    this.quests.clear();
    this.initQuests();
    this.initShop();
    this.lastShopRefreshDay = 1;

    // 给予初始物品
    this.inventory.addItem('weapon_001', 1);
    this.inventory.addItem('consumable_001', 3);
    this.inventory.addItem('consumable_002', 5);
    this.inventory.addItem('mat_001_stardust', 10); // 给予星尘级材料

    // 装备初始武器
    this.inventory.equipItem('weapon_001');
    const equipped = this.inventory.getEquippedItems();
    if (equipped.weapon) {
      this.player.equip(equipped.weapon);
    }

    this.addLog('游戏开始', '你在一个废弃的火车站醒来，周围一片狼藉...');
  }

  // 添加日志
  addLog(category: string, message: string): void {
    if (!this.logs) {
      this.logs = [];
    }
    const timeStr = `第${this.day}天 ${this.time === 'day' ? '白天' : '夜晚'}`;
    this.logs.unshift(`[${timeStr}] [${category}] ${message}`);
    if (this.logs.length > 100) {
      this.logs.pop();
    }
  }

  // 获取地点探索进度
  getLocationProgress(locationId: string) {
    if (!this.locationProgress.has(locationId)) {
      this.locationProgress.set(locationId, {
        materialProgress: 0,
        huntProgress: 0,
        bossDefeated: false,
        lastBossDefeatDay: 0,
        lastBossChallengeDate: null,
      });
    }
    return this.locationProgress.get(locationId)!;
  }

  // 更新地点探索进度
  updateLocationProgress(locationId: string, updates: Partial<{
    materialProgress: number;
    huntProgress: number;
    bossDefeated: boolean;
  }>): void {
    const progress = this.getLocationProgress(locationId);
    if (updates.materialProgress !== undefined) {
      progress.materialProgress = Math.min(20, Math.max(0, updates.materialProgress));
    }
    if (updates.huntProgress !== undefined) {
      progress.huntProgress = Math.min(80, Math.max(0, updates.huntProgress));
    }
    if (updates.bossDefeated !== undefined) {
      progress.bossDefeated = updates.bossDefeated;
      if (updates.bossDefeated) {
        progress.lastBossDefeatDay = this.day;
        // 记录击败的boss，增加挂机收益
        this.autoCollectSystem.recordDefeatedBoss(locationId);
        // 检查是否击败了站台5的Boss，解锁神话站台
        if (locationId === 'loc_005') {
          this.unlockMythologyLocations();
        }
      }
    }
    this.locationProgress.set(locationId, progress);
  }

  // 解锁神话站台（完成站台5后调用）
  unlockMythologyLocations(): void {
    // 解锁第一个神话站台
    const firstMythLocation = MYTHOLOGY_LOCATIONS.find(
      (loc) => loc.stationNumber === 1
    );
    if (firstMythLocation && !firstMythLocation.isUnlocked) {
      firstMythLocation.isUnlocked = true;
      firstMythLocation.deity.isUnlocked = true;
      this.addLog('系统', '【神话站台已解锁】完成岩石峭壁中继站探索，神话站台「锈蚀赫利俄斯站」已解锁！');
    }
  }

  // 检查神话站台是否已解锁
  isMythologyUnlocked(): boolean {
    const progress = this.getLocationProgress('loc_005');
    return progress.bossDefeated;
  }

  // 检查BOSS是否已刷新（现实时间每天0点刷新）
  isBossRefreshed(locationId: string): boolean {
    const progress = this.getLocationProgress(locationId);
    if (!progress.bossDefeated) return true;

    // 获取今天的日期
    const today = new Date().toISOString().split('T')[0];

    // 如果今天已经挑战过，返回false
    if (progress.lastBossChallengeDate === today) {
      return false;
    }

    return true;
  }

  // 记录BOSS挑战日期
  recordBossChallenge(locationId: string): void {
    const progress = this.getLocationProgress(locationId);
    const today = new Date().toISOString().split('T')[0];
    progress.lastBossChallengeDate = today;
    this.locationProgress.set(locationId, progress);
  }

  // 推进时间
  advanceTime(minutes: number): void {
    this.gameTime += minutes;

    // 计算天数和时间
    const minutesInDay = 24 * 60;
    const dayTime = this.gameTime % minutesInDay;
    const newDay = Math.floor(this.gameTime / minutesInDay) + 1;

    // 判断白天/黑夜 (6:00 - 18:00 为白天)
    const newTime = dayTime >= 360 && dayTime < 1080 ? 'day' : 'night';

    // 天数变化时检查
    if (newDay > this.day) {
      this.day = newDay;
      this.resetDailyQuests();
    }

    // 检查商店刷新（基于现实时间）
    this.checkShopRefresh();

    // 时间切换时触发事件
    if (newTime !== this.time) {
      this.time = newTime;
      if (this.time === 'night') {
        this.addLog('时间', '夜幕降临了，荒野中的危险正在增加...');
      } else {
        this.addLog('时间', '新的一天开始了...');
      }
    }
  }

  // 检查商店刷新（基于现实时间每天刷新）
  checkShopRefresh(): void {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD格式
    if (today !== this.lastShopRefreshDate) {
      this.shopItems.forEach(item => {
        item.stock = item.dailyLimit;
      });
      this.lastShopRefreshDate = today;
      this.addLog('商店', '商店已刷新，限购重置');
    }
  }

  // 重置日常任务
  resetDailyQuests(): void {
    this.quests.forEach(quest => {
      if (quest.questType === QuestType.DAILY) {
        quest.status = QuestStatus.ACTIVE;
        quest.conditions.forEach(c => c.currentAmount = 0);
      }
    });
    this.addLog('任务', '日常任务已刷新');
  }

  // 更新任务进度
  updateQuestProgress(conditionType: QuestConditionType, targetId: string, amount: number = 1): void {
    let updated = false;
    this.quests.forEach(quest => {
      if (quest.status !== QuestStatus.ACTIVE) return;

      quest.conditions.forEach(condition => {
        if (condition.conditionType === conditionType &&
          (condition.targetId === targetId || condition.targetId === 'any')) {
          condition.updateProgress(amount);
          updated = true;

          if (quest.isCompleted()) {
            quest.complete();
            this.addLog('任务', `任务完成：${quest.title}`);
            this.unlockFollowUpQuests(quest.id);
          }
        }
      });
    });
  }

  // 解锁后续任务
  unlockFollowUpQuests(completedQuestId: string): void {
    this.quests.forEach(quest => {
      if (quest.status === QuestStatus.LOCKED && quest.prerequisites.includes(completedQuestId)) {
        const allPrereqsCompleted = quest.prerequisites.every(id => {
          const prereq = this.quests.get(id);
          return prereq && (prereq.status === QuestStatus.COMPLETED || prereq.status === QuestStatus.REWARDED);
        });
        if (allPrereqsCompleted) {
          quest.status = QuestStatus.ACTIVE;
          this.addLog('任务', `新任务解锁：${quest.title}`);
        }
      }
    });
  }

  // 领取任务奖励
  claimQuestReward(questId: string): { success: boolean; message: string } {
    const quest = this.quests.get(questId);
    if (!quest || quest.status !== QuestStatus.COMPLETED) {
      return { success: false, message: '任务未完成或不存在' };
    }

    const reward = quest.reward;

    // 发放经验
    if (reward.exp > 0) {
      this.player.addExp(reward.exp);
    }

    // 发放列车币
    if (reward.trainCoins > 0) {
      this.trainCoins += reward.trainCoins;
    }

    // 发放物品
    reward.items.forEach(([itemId, quantity]) => {
      this.inventory.addItem(itemId, quantity);
    });

    // 发放材料
    Object.entries(reward.materials).forEach(([materialId, quantity]) => {
      this.inventory.addItem(materialId, quantity);
    });

    quest.rewardClaimed();
    this.unlockFollowUpQuests(questId);

    let rewardMsg = `获得 ${reward.exp} 经验值`;
    if (reward.trainCoins > 0) rewardMsg += `、${reward.trainCoins} 列车币`;

    return { success: true, message: `领取奖励成功！${rewardMsg}` };
  }

  // 购买物品
  buyItem(itemId: string, quantity: number = 1): { success: boolean; message: string } {
    this.checkShopRefresh();

    const shopItem = this.shopItems.get(itemId);
    if (!shopItem) {
      return { success: false, message: '商品不存在' };
    }

    if (shopItem.stock < quantity) {
      return { success: false, message: `库存不足，剩余 ${shopItem.stock} 个` };
    }

    const totalPrice = shopItem.price * quantity;
    if (this.trainCoins < totalPrice) {
      return { success: false, message: `列车币不足，需要 ${totalPrice} 个` };
    }

    this.trainCoins -= totalPrice;
    shopItem.stock -= quantity;
    this.inventory.addItem(itemId, quantity);

    this.addLog('购买', `购买了 ${shopItem.name} x${quantity}`);
    return { success: true, message: `成功购买 ${shopItem.name} x${quantity}` };
  }

  // 制造物品（新系统 - 需要传入部位和材料选择）
  craftItem(slot: EquipmentSlot, selection: MaterialSelection): { success: boolean; message: string } {
    const result = craftingSystem.craft(slot, selection, this.inventory, this.player);

    if (result.success && result.item) {
      // 更新任务进度
      this.updateQuestProgress(QuestConditionType.CRAFT, result.item.id, 1);
      this.addLog('制造', result.message);
    }

    return { success: result.success, message: result.message };
  }

  // 获取分解预览
  getDecomposePreview(itemId: string): { success: boolean; preview?: any; message?: string } {
    // 先从普通物品中查找
    let item = this.inventory.getItem(itemId);
    let isEquipment = false;
    let isCrafted = false;

    // 如果没找到，检查是否是背包中的神话装备
    if (!item) {
      const inventoryEquipment = this.inventory.getEquipment(itemId);
      if (inventoryEquipment) {
        // 将神话装备转换为类似物品的结构
        // 神话装备使用 slot 字段，需要映射到 type
        let mappedType: ItemType;
        const slot = inventoryEquipment.slot;
        switch (slot) {
          case EquipmentSlot.WEAPON:
            mappedType = ItemType.WEAPON;
            break;
          case EquipmentSlot.HEAD:
          case EquipmentSlot.BODY:
          case EquipmentSlot.LEGS:
          case EquipmentSlot.FEET:
            mappedType = ItemType.ARMOR;
            break;
          case EquipmentSlot.ACCESSORY:
            mappedType = ItemType.ACCESSORY;
            break;
          default:
            mappedType = ItemType.WEAPON;
        }
        item = {
          id: inventoryEquipment.instanceId,
          name: inventoryEquipment.name,
          type: mappedType,
          rarity: inventoryEquipment.rarity,
          description: inventoryEquipment.description,
          sublimationLevel: inventoryEquipment.sublimationLevel,
        } as any;
        isEquipment = true;
        isCrafted = inventoryEquipment.isCrafted || false;
      }
    } else {
      // 从普通物品中获取，判断是否为装备类型
      isCrafted = item.type === ItemType.WEAPON || item.type === ItemType.ARMOR || item.type === ItemType.ACCESSORY;
    }

    if (!item) {
      return { success: false, message: '物品不存在' };
    }

    // 使用新的分解系统获取预览
    const preview = getDecomposePreviewFunc(
      item.type,
      item.rarity as ItemRarity,
      item.name,
      isCrafted
    );

    if (!preview.canDecompose) {
      return { success: false, message: preview.message };
    }

    return {
      success: true,
      preview: {
        itemName: preview.itemName,
        rarity: item.rarity,
        rarityName: preview.rarity,
        isMythic: preview.isMythic,
        isEquipment,
        reward: preview.reward,
        message: preview.message,
      },
    };
  }

  // 分解装备
  decomposeItem(itemId: string): { success: boolean; message: string; rewards?: any[] } {
    // 先从普通物品中查找
    let item = this.inventory.getItem(itemId);
    let isInventoryEquipment = false;
    let isCrafted = false;

    // 如果没找到，检查是否是背包中的装备（包括制造装备和神话装备）
    if (!item) {
      const inventoryEquipment = this.inventory.getEquipment(itemId);
      if (inventoryEquipment) {
        // 装备使用 slot 字段，需要映射到 type
        let mappedType: ItemType;
        const slot = inventoryEquipment.slot;
        switch (slot) {
          case EquipmentSlot.WEAPON:
            mappedType = ItemType.WEAPON;
            break;
          case EquipmentSlot.HEAD:
          case EquipmentSlot.BODY:
          case EquipmentSlot.LEGS:
          case EquipmentSlot.FEET:
            mappedType = ItemType.ARMOR;
            break;
          case EquipmentSlot.ACCESSORY:
            mappedType = ItemType.ACCESSORY;
            break;
          default:
            mappedType = ItemType.WEAPON;
        }
        item = {
          id: inventoryEquipment.instanceId,
          name: inventoryEquipment.name,
          type: mappedType,
          rarity: inventoryEquipment.rarity,
          description: inventoryEquipment.description,
        } as any;
        isInventoryEquipment = true;
        isCrafted = inventoryEquipment.isCrafted || false;
      }
    } else {
      // 从普通物品中获取，判断是否为装备类型
      isCrafted = item.type === ItemType.WEAPON || item.type === ItemType.ARMOR || item.type === ItemType.ACCESSORY;
    }

    if (!item) {
      return { success: false, message: '物品不存在' };
    }

    // 使用新的分解系统执行分解
    const result = decomposeFunc(
      item.type,
      item.rarity as ItemRarity,
      isCrafted
    );

    if (!result.success) {
      return { success: false, message: result.message };
    }

    // 添加分解获得的材料到背包
    const actualRewards: any[] = [];
    if (result.reward) {
      this.inventory.addItem(result.reward.materialId, result.reward.quantity);
      actualRewards.push({
        materialId: result.reward.materialId,
        name: result.reward.name,
        quantity: result.reward.quantity,
      });
    }

    // 从背包移除装备（区分普通物品和神话装备）
    if (isInventoryEquipment) {
      // 从背包的神话装备中移除
      this.inventory.removeEquipment(itemId);
    } else {
      // 从背包的普通物品中移除
      this.inventory.removeItem(itemId, 1);
    }

    this.addLog('分解', `分解了 ${item.name}，获得：${result.reward?.name} x${result.reward?.quantity}`);
    return { success: true, message: result.message, rewards: actualRewards };
  }

  // 装备升华
  sublimateItem(itemId: string): { success: boolean; message: string; levelUp?: boolean } {
    const item = this.inventory.getItem(itemId);
    if (!item) {
      return { success: false, message: '物品不存在' };
    }

    // 检查是否可以升华
    const canSublimateTypes = [ItemType.WEAPON, ItemType.ARMOR, ItemType.ACCESSORY];
    if (!canSublimateTypes.includes(item.type)) {
      return { success: false, message: '该物品类型无法升华' };
    }

    const subLevel = item.sublimationLevel || 0;
    if (subLevel >= 10) {
      return { success: false, message: '该物品已达到最大升华等级' };
    }

    // 计算消耗
    const baseSpiritCost = (subLevel + 1) * 10;
    const baseStaminaCost = (subLevel + 1) * 5;

    // 品质升级检查
    const qualityUpgradeLevels: Record<number, number> = { 3: 1, 5: 2, 8: 3 };
    const nextLevel = subLevel + 1;
    const willQualityUpgrade = nextLevel in qualityUpgradeLevels;

    let spiritCost = baseSpiritCost;
    let staminaCost = baseStaminaCost;

    if (willQualityUpgrade) {
      spiritCost *= 2;
      staminaCost *= 2;
      const spiritRequired = 30 + qualityUpgradeLevels[nextLevel] * 20;
      if (this.player.maxSpirit < spiritRequired) {
        return { success: false, message: `品质升级需要最大精神值达到${spiritRequired}` };
      }
    }

    if (this.player.spirit < spiritCost) {
      return { success: false, message: `精神值不足（需要${spiritCost}）` };
    }
    if (this.player.stamina < staminaCost) {
      return { success: false, message: `体力值不足（需要${staminaCost}）` };
    }

    // 执行消耗
    this.player.spirit -= spiritCost;
    this.player.stamina -= staminaCost;

    // 增加升华进度
    const progressNeeded = (subLevel + 1) * 20;
    item.sublimationProgress = (item.sublimationProgress || 0) + Math.floor(Math.random() * 16) + 10;

    if (item.sublimationProgress >= progressNeeded) {
      // 升华成功
      item.sublimationLevel = nextLevel;
      item.sublimationProgress = 0;

      // 提升属性
      this.applySublimationBonus(item);

      // 品质升级
      let qualityUpgraded = false;
      if (willQualityUpgrade) {
        const rarityOrder = [ItemRarity.COMMON, ItemRarity.UNCOMMON, ItemRarity.RARE, ItemRarity.EPIC, ItemRarity.LEGENDARY, ItemRarity.MYTHIC];
        const currentIndex = rarityOrder.indexOf(item.rarity);
        if (currentIndex < rarityOrder.length - 1) {
          item.rarity = rarityOrder[currentIndex + 1];
          qualityUpgraded = true;
          this.applyQualityUpgradeBonus(item);
        }
      }

      this.updateQuestProgress(QuestConditionType.SUBLIMATE, 'any', 1);
      this.addLog('升华', `${item.name}升华成功！当前等级：${item.sublimationLevel}`);

      return {
        success: true,
        message: `升华成功！${item.name}提升到等级${item.sublimationLevel}`,
        levelUp: true,
      };
    } else {
      this.addLog('升华', `${item.name}升华进度：${item.sublimationProgress}/${progressNeeded}`);
      return {
        success: true,
        message: `升华进行中... 进度：${item.sublimationProgress}/${progressNeeded}`,
        levelUp: false,
      };
    }
  }

  // 应用升华属性加成
  private applySublimationBonus(item: InventoryItem): void {
    if (item.type === 'weapon') {
      item.attack = (item.attack || 0) + 2;
      item.speed = (item.speed || 0) + 1;
    } else if (item.type === 'armor') {
      item.defense = (item.defense || 0) + 2;
      item.maxHp = (item.maxHp || 0) + 5;
    } else if (item.type === 'accessory') {
      item.attack = (item.attack || 0) + 1;
      item.defense = (item.defense || 0) + 1;
      item.agility = (item.agility || 0) + 1;
    }
  }

  // 应用品质升级加成
  private applyQualityUpgradeBonus(item: InventoryItem): void {
    if (item.type === 'weapon') {
      item.attack = Math.floor((item.attack || 0) * 1.5) + 10;
      item.speed = Math.floor((item.speed || 0) * 1.3) + 3;
    } else if (item.type === 'armor') {
      item.defense = Math.floor((item.defense || 0) * 1.5) + 8;
      item.maxHp = Math.floor((item.maxHp || 0) * 1.5) + 20;
    } else if (item.type === 'accessory') {
      item.attack = Math.floor((item.attack || 0) * 1.4) + 5;
      item.defense = Math.floor((item.defense || 0) * 1.4) + 5;
      item.agility = Math.floor((item.agility || 0) * 1.4) + 5;
    }
  }

  // 休息（休整）
  // 消耗：能量x10，冷却x10
  rest(): { success: boolean; message: string; logs: string[] } {
    const logs: string[] = [];

    // 检查能量和冷却是否足够
    const energyCost = 10;  // 能量消耗
    const coolantCost = 10; // 冷却消耗

    if (this.player.hunger < energyCost) {
      return {
        success: false,
        message: `能量不足，无法休整（需要${energyCost}点）`,
        logs: ['能量不足，无法休整'],
      };
    }

    if (this.player.thirst < coolantCost) {
      return {
        success: false,
        message: `冷却不足，无法休整（需要${coolantCost}点）`,
        logs: ['冷却不足，无法休整'],
      };
    }

    const oldHp = this.player.hp;
    const oldStamina = this.player.stamina;
    const oldHunger = this.player.hunger;
    const oldThirst = this.player.thirst;

    // 医疗舱加成
    const medicalBonus = this.getMedicalRecoveryBonus(); // 0, 100, 200, 300, 400
    const medicalMultiplier = 1 + medicalBonus / 100; // 1, 2, 3, 4, 5

    // 基础恢复值（固定值）
    const baseHpRecovery = 30;
    const baseStaminaRecovery = 30;

    // 应用医疗舱加成
    const hpRecovery = Math.floor(baseHpRecovery * medicalMultiplier);
    const staminaRecovery = Math.floor(baseStaminaRecovery * medicalMultiplier);

    // 恢复生命和体力
    this.player.heal(hpRecovery);
    this.player.recoverStamina(staminaRecovery);

    // 消耗能量和冷却
    this.player.consumeHunger(energyCost);
    this.player.consumeThirst(coolantCost);

    const hpRestored = this.player.hp - oldHp;
    const staminaRestored = this.player.stamina - oldStamina;
    const hungerConsumed = oldHunger - this.player.hunger;
    const thirstConsumed = oldThirst - this.player.thirst;

    this.advanceTime(120);

    logs.push(`恢复 ${hpRestored} 生命 (基础${baseHpRecovery}${medicalBonus > 0 ? ` ×${medicalMultiplier}` : ''})`);
    logs.push(`恢复 ${staminaRestored} 体力 (基础${baseStaminaRecovery}${medicalBonus > 0 ? ` ×${medicalMultiplier}` : ''})`);
    logs.push(`消耗 ${hungerConsumed} 能量`);
    logs.push(`消耗 ${thirstConsumed} 冷却`);

    this.updateQuestProgress(QuestConditionType.REST, 'train', 1);
    this.addLog('休整', `休整完成，恢复${hpRestored}生命、${staminaRestored}体力，消耗${hungerConsumed}能量、${thirstConsumed}冷却`);

    return {
      success: true,
      message: '休整完成',
      logs,
    };
  }

  // 探索（增强版）- 已更新为使用星球系统
  explore(locationId: string, exploreType: 'search' | 'hunt' | 'chest' = 'search'): {
    success: boolean;
    message: string;
    logs: string[];
    foundItems?: { itemId: string; name: string; quantity: number }[];
    exp?: number;
    treasureFound?: boolean;
    treasureCoins?: number;
  } {
    const logs: string[] = [];

    // 根据探索类型消耗体力
    const staminaCost = exploreType === 'chest' ? 20 : 10;
    if (!this.player.consumeStamina(staminaCost)) {
      return { success: false, message: '体力不足', logs };
    }

    this.currentLocation = locationId;
    this.advanceTime(20);

    const foundItems: { itemId: string; name: string; quantity: number }[] = [];
    let treasureFound = false;
    let treasureCoins = 0;

    // 获取星球等级（从 planet_xxx 提取）
    let dangerLevel = 1;
    if (locationId.startsWith('planet_')) {
      const planetLevels: Record<string, number> = {
        'planet_alpha': 1, 'planet_eta': 2, 'planet_beta': 3, 'planet_gamma': 4,
        'planet_delta': 5, 'planet_epsilon': 6, 'planet_zeta': 7, 'planet_theta': 8,
      };
      dangerLevel = planetLevels[locationId] || 1;
    }

    if (exploreType === 'search') {
      // 搜寻物资 - 掉落带品质的基础材料
      if (Math.random() < 0.6) {
        // 随机掉落星尘级材料
        const basicMaterials = ['mat_001', 'mat_002', 'mat_003', 'mat_004'];
        const baseId = basicMaterials[Math.floor(Math.random() * basicMaterials.length)];
        const itemId = `${baseId}_stardust`;
        const itemTemplate = getItemTemplate(itemId);
        if (itemTemplate && this.inventory.addItem(itemId, 1)) {
          foundItems.push({ itemId, name: itemTemplate.name, quantity: 1 });
          logs.push(`发现了 ${itemTemplate.name}`);
        }
      }
      if (foundItems.length === 0) {
        logs.push('这里没有什么物资...');
      }
    } else if (exploreType === 'chest') {
      // 寻找宝箱
      if (Math.random() < 0.4) {
        treasureFound = true;
        // 列车币
        treasureCoins = Math.floor(Math.random() * 21) + 10;
        this.trainCoins += treasureCoins;
        logs.push(`发现宝箱！获得 ${treasureCoins} 列车币！`);
      } else {
        logs.push('没有找到宝箱...');
      }
    }

    // 获得经验
    const expGain = dangerLevel * 10 + Math.floor(Math.random() * 10);
    this.player.addExp(expGain);
    logs.push(`获得 ${expGain} 经验值`);

    // 消耗饥饿和口渴
    this.player.consumeHunger(5);
    this.player.consumeThirst(8);

    // 更新任务进度
    this.updateQuestProgress(QuestConditionType.EXPLORE_LOCATION, locationId, 1);
    this.updateQuestProgress(QuestConditionType.EXPLORE_LOCATION, 'any', 1);
    foundItems.forEach(item => {
      this.updateQuestProgress(QuestConditionType.COLLECT_ITEM, item.itemId, 1);
    });

    this.addLog('探索', `探索完成，获得${expGain}经验`);

    return {
      success: true,
      message: '探索完成',
      logs,
      foundItems,
      exp: expGain,
      treasureFound,
      treasureCoins,
    };
  }

  // 使用物品
  useItem(itemId: string): { success: boolean; message: string } {
    const item = this.inventory.getItem(itemId);
    if (!item) {
      return { success: false, message: '物品不存在' };
    }

    const result = this.inventory.useItem(itemId);

    if (!result.success) {
      return result;
    }

    // 应用效果
    if (result.effects) {
      if (result.effects.healHp) this.player.heal(result.effects.healHp);
      if (result.effects.healStamina) this.player.recoverStamina(result.effects.healStamina);
      if (result.effects.healHunger) this.player.recoverHunger(result.effects.healHunger);
      if (result.effects.healThirst) this.player.recoverThirst(result.effects.healThirst);
    }

    this.addLog('物品', result.message);
    return result;
  }

  // 装备物品
  equipItem(itemId: string): { success: boolean; message: string } {
    const result = this.inventory.equipItem(itemId);

    if (!result.success) {
      return result;
    }

    const equipped = this.inventory.getEquippedItems();
    this.player.weapon = equipped.weapon;
    this.player.armor = equipped.armor;
    this.player.accessory = equipped.accessory;

    this.addLog('装备', result.message);
    return result;
  }

  // 卸下装备
  unequipItem(itemId: string): { success: boolean; message: string } {
    const result = this.inventory.unequipItem(itemId);

    if (!result.success) {
      return result;
    }

    const equipped = this.inventory.getEquippedItems();
    this.player.weapon = equipped.weapon;
    this.player.armor = equipped.armor;
    this.player.accessory = equipped.accessory;

    this.addLog('装备', result.message);
    return result;
  }

  // 获取当前地点 - 已更新为使用星球系统
  getCurrentLocation(): { id: string; name: string } | undefined {
    // 如果是星球ID，返回星球名称
    if (this.currentLocation.startsWith('planet_')) {
      const planetNames: Record<string, string> = {
        'planet_alpha': '阿尔法宜居星',
        'planet_eta': '伊塔农业星',
        'planet_beta': '贝塔工业星',
        'planet_gamma': '伽马研究星',
        'planet_delta': '德尔塔军事星',
        'planet_epsilon': '艾普西隆贸易星',
        'planet_zeta': '泽塔能源星',
        'planet_theta': '西塔医疗星',
      };
      return {
        id: this.currentLocation,
        name: planetNames[this.currentLocation] || this.currentLocation,
      };
    }
    return { id: this.currentLocation, name: this.currentLocation };
  }

  // 获取进行中的任务
  getActiveQuests(): Quest[] {
    return Array.from(this.quests.values()).filter(q => q.status === QuestStatus.ACTIVE);
  }

  // 获取可领奖的任务
  getCompletedQuests(): Quest[] {
    return Array.from(this.quests.values()).filter(q => q.status === QuestStatus.COMPLETED);
  }

  // 获取可接取的任务
  getAvailableQuests(): Quest[] {
    return Array.from(this.quests.values()).filter(q => q.status === QuestStatus.AVAILABLE);
  }

  // 保存游戏
  saveGame(): GameState {
    return {
      player: this.player.serialize(),
      inventory: this.inventory.serialize(),
      day: this.day,
      time: this.time,
      currentLocation: this.currentLocation,
      gameTime: this.gameTime,
      logs: this.logs,
      trainCoins: this.trainCoins,
      quests: Array.from(this.quests.values()).map(q => q.serialize()),
      shopItems: Array.from(this.shopItems.values()).map(i => i.serialize()),
      lastShopRefreshDay: this.lastShopRefreshDay,
      playerName: this.playerName,
      locationProgress: Array.from(this.locationProgress.entries()),
      autoCollectSystem: this.autoCollectSystem.serialize(),
      baseFacilitySystem: this.baseFacilitySystem.serialize(),
      lastStaminaRecoveryTime: this.lastStaminaRecoveryTime,
      crewMembers: this.crewMembers.map(c => serializeCrewMember(c)),
      commEvents: this.commEvents.map(e => serializeCommEvent(e)),
      lastCommScanTime: this.lastCommScanTime,
      researchProjects: this.researchProjects.map(p => serializeResearchProject(p)),
      completedResearch: this.completedResearch,
      miningTasks: this.miningTasks.map(t => serializeMiningTask(t)),
      chips: this.chips.map(c => serializeChip(c)),
      equippedChips: this.equippedChips,
      geneNodes: this.geneNodes.map(n => serializeGeneNode(n)),
      implants: this.implants.map(i => serializeImplant(i)),
      equippedImplants: this.equippedImplants,
      marketListings: this.marketListings.map(l => serializeMarketListing(l)),
      playerListings: this.playerListings.map(l => serializePlayerListing(l)),
      marketTransactions: this.marketTransactions.map(t => serializeMarketTransaction(t)),
      ruins: this.ruins.map(r => serializeRuin(r)),
      exploreMissions: this.exploreMissions.map(m => serializeExploreMission(m)),
    };
  }

  // 加载游戏
  loadGame(state: GameState): void {
    this.player = new Player(state.player);
    // 支持新旧存档格式
    const inventoryItems = Array.isArray(state.inventory) ? state.inventory : (state.inventory?.items || []);
    const inventoryEquipment = Array.isArray(state.inventory) ? [] : (state.inventory?.equipment || []);
    this.inventory = new Inventory(inventoryItems, inventoryEquipment);

    // 数据迁移：将旧格式的装备从 items 迁移到 equipment
    const migrationResult = this.inventory.migrateOldEquipment();
    if (migrationResult.migrated > 0) {
      console.log(`[数据迁移] 成功迁移 ${migrationResult.migrated} 件旧格式装备`);
      this.addLog('系统', `数据迁移完成：${migrationResult.migrated} 件装备已更新格式`);
    }
    if (migrationResult.errors.length > 0) {
      console.error('[数据迁移] 错误:', migrationResult.errors);
    }

    // 加载基地设施系统
    if (state.baseFacilitySystem) {
      this.baseFacilitySystem.deserialize(state.baseFacilitySystem);
    }

    // 更新仓库容量
    this.inventory.setMaxSlots(this.getWarehouseCapacity());

    // 加载体力恢复时间
    if (state.lastStaminaRecoveryTime) {
      this.lastStaminaRecoveryTime = state.lastStaminaRecoveryTime;
    }

    // 加载船员
    if (state.crewMembers) {
      this.crewMembers = state.crewMembers.map(c => deserializeCrewMember(c));
    }

    if (!this.crewMembers.some(c => isPlayerCrew(c.id))) {
      const playerCrew = createPlayerCrew(this.playerName, this.player.level);
      this.crewMembers.unshift(playerCrew);
    }

    // 加载通讯事件
    if (state.commEvents) {
      this.commEvents = state.commEvents
        .map(e => deserializeCommEvent(e))
        .filter(e => !isEventExpired(e));
    }

    if (state.lastCommScanTime) {
      this.lastCommScanTime = state.lastCommScanTime;
    }

    // 加载研究项目
    if (state.researchProjects) {
      this.researchProjects = state.researchProjects.map(p => deserializeResearchProject(p));
    }

    if (state.completedResearch) {
      this.completedResearch = state.completedResearch;
    }

    // 加载采矿任务
    if (state.miningTasks) {
      this.miningTasks = state.miningTasks.map(t => deserializeMiningTask(t));
    }

    // 加载芯片
    if (state.chips) {
      this.chips = state.chips.map(c => deserializeChip(c));
    }

    if (state.equippedChips) {
      this.equippedChips = state.equippedChips;
    }

    // 加载基因节点
    if (state.geneNodes) {
      this.geneNodes = state.geneNodes.map(n => deserializeGeneNode(n));
    }

    // 加载机械飞升义体
    if (state.implants) {
      this.implants = state.implants.map(i => deserializeImplant(i)).filter((i): i is Implant => i !== null);
    }

    if (state.equippedImplants) {
      this.equippedImplants = state.equippedImplants;
    }

    // 加载星际市场
    if (state.marketListings) {
      this.marketListings = state.marketListings.map(l => deserializeMarketListing(l));
    } else {
      this.marketListings = generateSystemListings();
    }

    if (state.playerListings) {
      this.playerListings = state.playerListings.map(l => deserializePlayerListing(l));
    }

    if (state.marketTransactions) {
      this.marketTransactions = state.marketTransactions.map(t => deserializeMarketTransaction(t));
    }

    // 加载遗迹探索
    if (state.ruins) {
      this.ruins = state.ruins.map(r => deserializeRuin(r));
    } else {
      this.ruins = generateRuins(this.getFacilityLevel(FacilityType.RUINS));
    }

    if (state.exploreMissions) {
      this.exploreMissions = state.exploreMissions.map(m => deserializeExploreMission(m));
    }

    this.day = state.day;
    this.time = state.time;
    this.currentLocation = state.currentLocation;
    this.gameTime = state.gameTime;
    this.logs = state.logs || [];
    this.trainCoins = state.trainCoins ?? 0;
    this.lastShopRefreshDay = state.lastShopRefreshDay ?? 1;
    this.playerName = state.playerName ?? '幸存者';
    this.isGameOver = false;

    // 加载任务
    this.quests.clear();
    state.quests?.forEach(q => {
      const quest = Quest.fromDict(q);
      this.quests.set(quest.id, quest);
    });

    // 加载商店 - 同步最新名称和描述，但保留库存数据
    this.shopItems.clear();
    SHOP_ITEMS.forEach(itemData => {
      const savedItem = state.shopItems?.find((i: any) => i.itemId === itemData.itemId);
      const item = new ShopItem({
        ...itemData,
        stock: savedItem?.stock ?? itemData.stock,
      });
      this.shopItems.set(itemData.itemId, item);
    });

    // 加载地点探索进度
    this.locationProgress.clear();
    state.locationProgress?.forEach(([locationId, progress]) => {
      this.locationProgress.set(locationId, progress);
    });

    // 加载自动采集系统
    if (state.autoCollectSystem) {
      this.autoCollectSystem.load(state.autoCollectSystem);
    }
  }

  // 重置游戏
  reset(): void {
    this.player = new Player();
    this.inventory = new Inventory();
    this.day = 1;
    this.time = 'day';
    this.currentLocation = 'loc_001';
    this.gameTime = 480;
    this.logs = [];
    this.isGameOver = false;
    this.playerName = '幸存者';
    this.lastShopRefreshDay = 1;

    this.quests.clear();
    this.shopItems.clear();
    this.locationProgress.clear();

    this.initQuests();
    this.initShop();

    // 重置自动采集系统
    this.autoCollectSystem.reset();

    // 重置基地设施系统
    this.baseFacilitySystem.reset();
  }

  // ========== 基地设施系统 ==========

  // 获取基地设施等级
  getFacilityLevel(facilityId: FacilityType): number {
    return this.baseFacilitySystem.getFacilityLevel(facilityId);
  }

  // 获取能源核心效率加成
  getEnergyCoreEfficiency(): number {
    return this.baseFacilitySystem.getEnergyCoreEfficiency();
  }

  // 获取仓库容量
  getWarehouseCapacity(): number {
    return this.baseFacilitySystem.getWarehouseCapacity();
  }

  // 获取医疗舱恢复加成
  getMedicalRecoveryBonus(): number {
    return this.baseFacilitySystem.getMedicalRecoveryBonus();
  }

  // 获取医疗舱效率详情
  getMedicalEfficiency(): {
    level: number;
    hpRecoveryBase: number;
    hpRecoveryActual: number;
    staminaRecoveryBase: number;
    staminaRecoveryActual: number;
    staminaRegenBase: number;
    staminaRegenActual: number;
    bonusPercent: number;
  } {
    const level = this.getFacilityLevel(FacilityType.MEDICAL);
    const bonus = this.getMedicalRecoveryBonus();
    const multiplier = 1 + bonus / 100;

    const hpRecoveryBase = 30;
    const staminaRecoveryBase = 30;
    const staminaRegenBase = 1; // 每分钟基础恢复1点体力（现实时间）

    return {
      level,
      hpRecoveryBase,
      hpRecoveryActual: Math.floor(hpRecoveryBase * multiplier),
      staminaRecoveryBase,
      staminaRecoveryActual: Math.floor(staminaRecoveryBase * multiplier),
      staminaRegenBase,
      staminaRegenActual: Math.floor(staminaRegenBase * multiplier),
      bonusPercent: bonus,
    };
  }

  // 获取设施升级预览
  getFacilityUpgradePreview(facilityId: FacilityType): {
    canUpgrade: boolean;
    reason?: string;
    currentLevel: number;
    nextLevel?: number;
    cost?: { credits: number; materials: { itemId: string; count: number }[] };
    effect?: { description: string; value: number };
  } {
    const currentLevel = this.baseFacilitySystem.getFacilityLevel(facilityId);
    const def = this.baseFacilitySystem.getFacilityDefinition(facilityId);

    if (!def) {
      return { canUpgrade: false, reason: '设施不存在', currentLevel };
    }

    if (currentLevel >= def.maxLevel) {
      return { canUpgrade: false, reason: '已达最高等级', currentLevel };
    }

    const nextLevelData = def.levels.find(l => l.level === currentLevel + 1);
    if (!nextLevelData) {
      return { canUpgrade: false, reason: '无法获取升级信息', currentLevel };
    }

    const checkResult = this.baseFacilitySystem.canUpgrade(
      facilityId,
      this.trainCoins,
      (itemId, count) => this.inventory.hasItem(itemId, count)
    );

    let reason = checkResult.reason;
    if (checkResult.missingMaterials && checkResult.missingMaterials.length > 0) {
      const materialNames = checkResult.missingMaterials.map(mat => {
        const item = this.inventory.getItem(mat.itemId);
        return `${item?.name || mat.itemId} x${mat.count}`;
      });
      reason = `材料不足: ${materialNames.join(', ')}`;
    }

    return {
      canUpgrade: checkResult.canUpgrade,
      reason,
      currentLevel,
      nextLevel: currentLevel + 1,
      cost: nextLevelData.upgradeCost,
      effect: nextLevelData.effects,
    };
  }

  // 升级基地设施
  upgradeFacility(facilityId: FacilityType): { success: boolean; message: string; newLevel?: number } {
    const preview = this.getFacilityUpgradePreview(facilityId);

    if (!preview.canUpgrade) {
      return { success: false, message: preview.reason || '无法升级' };
    }

    if (!preview.cost || !preview.nextLevel) {
      return { success: false, message: '升级信息错误' };
    }

    // 扣除信用点
    this.trainCoins -= preview.cost.credits;

    // 扣除材料
    for (const mat of preview.cost.materials) {
      this.inventory.removeItem(mat.itemId, mat.count);
    }

    // 执行升级
    const result = this.baseFacilitySystem.upgradeFacility(facilityId);

    if (result.success) {
      const def = this.baseFacilitySystem.getFacilityDefinition(facilityId);
      this.addLog('基地', `${def?.name || '设施'}升级成功！当前等级: ${result.newLevel}`);

      // 如果是仓库升级，更新背包容量
      if (facilityId === FacilityType.WAREHOUSE) {
        this.inventory.setMaxSlots(this.getWarehouseCapacity());
      }
    }

    return result;
  }

  // 获取所有基地设施状态
  getAllFacilities() {
    return this.baseFacilitySystem.getAllFacilities();
  }

  // 获取设施定义
  getFacilityDefinition(facilityId: FacilityType) {
    return this.baseFacilitySystem.getFacilityDefinition(facilityId);
  }

  // ========== 船员系统 ==========

  // 获取船员舱最大容量
  getCrewCapacity(): number {
    const level = this.getFacilityLevel(FacilityType.CREW);
    return level + 4; // Lv.1=5人, Lv.2=6人, ... Lv.5=9人
  }

  // 获取所有船员
  getCrewMembers(): CrewMember[] {
    return this.crewMembers;
  }

  // 获取战斗阵容（已分配位置的船员）
  getBattleCrew(): CrewMember[] {
    return this.crewMembers.filter(c => c.battleSlot > 0).sort((a, b) => a.battleSlot - b.battleSlot);
  }

  // 获取招募票数量
  getRecruitTicketCount(recruitType: RecruitType): number {
    const config = RECRUIT_CONFIG[recruitType];
    const item = this.inventory.getItem(config.ticketId);
    return item?.quantity || 0;
  }

  // 招募船员（抽卡）
  recruitCrew(recruitType: RecruitType): { success: boolean; message: string; crew?: CrewMember; rarity?: string } {
    const capacity = this.getCrewCapacity();
    const config = RECRUIT_CONFIG[recruitType];

    if (this.crewMembers.length >= capacity) {
      return { success: false, message: `船员舱已满，当前容量: ${capacity}人` };
    }

    const ticketCount = this.getRecruitTicketCount(recruitType);
    if (ticketCount <= 0) {
      return { success: false, message: `${config.name}票不足` };
    }

    this.inventory.removeItem(config.ticketId, 1);

    const roll = Math.random() * 100;
    const rarity = getRarityByRoll(roll, recruitType);

    let newCrew: CrewMember;
    const crewDef = getRandomCrewDefinition(rarity, recruitType);

    if (crewDef) {
      newCrew = generateCrewFromDefinition(crewDef);
    } else {
      newCrew = generateFallbackCrew(rarity);
    }

    this.crewMembers.push(newCrew);

    const rarityConfig = RARITY_CONFIG[newCrew.rarity];
    this.addLog('船员招募', `[${config.name}] 获得${rarityConfig.name}品质船员「${newCrew.name}」`);

    return { success: true, message: `成功招募「${newCrew.name}」`, crew: newCrew, rarity: rarityConfig.name };
  }

  // 十连招募
  recruitCrewTen(recruitType: RecruitType): { success: boolean; message: string; crews?: CrewMember[] } {
    const capacity = this.getCrewCapacity();
    const config = RECRUIT_CONFIG[recruitType];

    const availableSlots = capacity - this.crewMembers.length;
    if (availableSlots <= 0) {
      return { success: false, message: `船员舱已满` };
    }

    const ticketCount = this.getRecruitTicketCount(recruitType);
    if (ticketCount < 10) {
      return { success: false, message: `${config.name}票不足，需要10张` };
    }

    const actualCount = Math.min(10, availableSlots);
    this.inventory.removeItem(config.ticketId, actualCount);

    const crews: CrewMember[] = [];
    for (let i = 0; i < actualCount; i++) {
      const roll = Math.random() * 100;
      const rarity = getRarityByRoll(roll, recruitType);

      let newCrew: CrewMember;
      const crewDef = getRandomCrewDefinition(rarity, recruitType);

      if (crewDef) {
        newCrew = generateCrewFromDefinition(crewDef);
      } else {
        newCrew = generateFallbackCrew(rarity);
      }

      this.crewMembers.push(newCrew);
      crews.push(newCrew);

      const rarityConfig = RARITY_CONFIG[newCrew.rarity];
      this.addLog('船员招募', `[${config.name}] 获得${rarityConfig.name}品质船员「${newCrew.name}」`);
    }

    return { success: true, message: `成功招募${crews.length}名船员`, crews };
  }

  // 设置船员战斗位置
  setCrewBattleSlot(crewId: string, slot: number): { success: boolean; message: string } {
    const crew = this.crewMembers.find(c => c.id === crewId);

    if (!crew) {
      return { success: false, message: '船员不存在' };
    }

    if (slot < 0 || slot > 6) {
      return { success: false, message: '无效的位置编号' };
    }

    // 如果要设置到某个位置，先检查该位置是否已被占用
    if (slot > 0) {
      const existingCrew = this.crewMembers.find(c => c.battleSlot === slot && c.id !== crewId);
      if (existingCrew) {
        // 将原来的船员移出
        existingCrew.battleSlot = 0;
      }
    }

    crew.battleSlot = slot;
    this.addLog('船员配置', `${crew.name} ${slot > 0 ? `已设置到${slot}号位` : '已移出战斗阵容'}`);

    return { success: true, message: slot > 0 ? `已设置到${slot}号位` : '已移出战斗阵容' };
  }

  // 解雇船员
  dismissCrew(crewId: string): { success: boolean; message: string } {
    if (isPlayerCrew(crewId)) {
      return { success: false, message: '主角不能被解雇' };
    }

    const index = this.crewMembers.findIndex(c => c.id === crewId);

    if (index === -1) {
      return { success: false, message: '船员不存在' };
    }

    const crew = this.crewMembers[index];
    this.crewMembers.splice(index, 1);
    this.addLog('船员管理', `解雇了船员「${crew.name}」`);

    return { success: true, message: `已解雇「${crew.name}」` };
  }

  // 给船员增加经验
  giveCrewExp(crewId: string, exp: number): { success: boolean; message: string; leveledUp?: boolean; newLevel?: number } {
    const crew = this.crewMembers.find(c => c.id === crewId);

    if (!crew) {
      return { success: false, message: '船员不存在' };
    }

    const result = addCrewExp(crew, exp);

    if (result.leveledUp) {
      this.addLog('船员升级', `${crew.name}升级到Lv.${result.newLevel}！`);
    }

    return { success: true, message: `获得${exp}经验`, ...result };
  }

  // ========== 通讯系统 ==========

  // 获取通讯阵列等级
  getCommLevel(): number {
    return this.getFacilityLevel(FacilityType.COMM);
  }

  // 获取当前通讯事件
  getCommEvents(): CommEvent[] {
    this.commEvents = this.commEvents.filter(e => !isEventExpired(e));
    return this.commEvents;
  }

  // 扫描新信号
  scanCommSignals(): { success: boolean; message: string; newEvents?: CommEvent[] } {
    const level = this.getCommLevel();
    const cooldown = getScanCooldown(level);
    const now = Date.now();

    if (now - this.lastCommScanTime < cooldown * 60 * 1000) {
      const remaining = cooldown * 60 * 1000 - (now - this.lastCommScanTime);
      const minutes = Math.ceil(remaining / 60000);
      return { success: false, message: `扫描冷却中，还需${minutes}分钟` };
    }

    this.lastCommScanTime = now;
    this.commEvents = this.commEvents.filter(e => !isEventExpired(e));

    const maxEvents = getMaxEvents(level);
    const currentCount = this.commEvents.length;

    if (currentCount >= maxEvents) {
      return { success: true, message: '信号列表已满', newEvents: [] };
    }

    const newEvents: CommEvent[] = [];
    const numToGenerate = Math.min(2, maxEvents - currentCount);

    for (let i = 0; i < numToGenerate; i++) {
      if (Math.random() < 0.7) {
        const event = generateCommEvent(level);
        if (event) {
          this.commEvents.push(event);
          newEvents.push(event);
        }
      }
    }

    if (newEvents.length > 0) {
      this.addLog('通讯阵列', `扫描发现${newEvents.length}个新信号`);
    } else {
      this.addLog('通讯阵列', '扫描完成，未发现新信号');
    }

    return { success: true, message: `扫描完成，发现${newEvents.length}个新信号`, newEvents };
  }

  // 响应通讯事件
  respondToCommEvent(eventId: string): { success: boolean; message: string; rewards?: string } {
    const eventIndex = this.commEvents.findIndex(e => e.id === eventId);

    if (eventIndex === -1) {
      return { success: false, message: '事件不存在或已过期' };
    }

    const event = this.commEvents[eventIndex];

    if (event.responded) {
      return { success: false, message: '已响应过此事件' };
    }

    if (isEventExpired(event)) {
      this.commEvents.splice(eventIndex, 1);
      return { success: false, message: '事件已过期' };
    }

    if (event.requirements?.stamina && this.player.stamina < event.requirements.stamina) {
      return { success: false, message: `体力不足，需要${event.requirements.stamina}点体力` };
    }

    if (event.requirements?.stamina) {
      this.player.stamina -= event.requirements.stamina;
    }

    event.responded = true;

    const rewardMessages: string[] = [];

    if (event.rewards.credits && event.rewards.credits > 0) {
      this.trainCoins += event.rewards.credits;
      rewardMessages.push(`${event.rewards.credits}信用点`);
    }

    if (event.rewards.items && event.rewards.items.length > 0) {
      event.rewards.items.forEach(item => {
        this.inventory.addItem(item.itemId, item.count);
        const itemTemplate = getItemTemplate(item.itemId);
        const itemName = itemTemplate?.name || item.itemId;
        rewardMessages.push(`${itemName} x${item.count}`);
      });
    }

    if (event.rewards.exp && event.rewards.exp > 0) {
      this.player.addExp(event.rewards.exp);
      rewardMessages.push(`${event.rewards.exp}经验`);
    }

    const eventConfig = COMM_EVENT_CONFIG[event.type];
    this.addLog('通讯事件', `响应「${event.title}」，获得: ${rewardMessages.join('、')}`);

    this.commEvents.splice(eventIndex, 1);

    return {
      success: true,
      message: `成功响应「${event.title}」`,
      rewards: rewardMessages.join('、'),
    };
  }

  // 忽略通讯事件
  ignoreCommEvent(eventId: string): { success: boolean; message: string } {
    const eventIndex = this.commEvents.findIndex(e => e.id === eventId);

    if (eventIndex === -1) {
      return { success: false, message: '事件不存在' };
    }

    const event = this.commEvents[eventIndex];
    this.commEvents.splice(eventIndex, 1);
    this.addLog('通讯事件', `忽略了信号「${event.title}」`);

    return { success: true, message: `已忽略「${event.title}」` };
  }

  // 获取扫描冷却剩余时间
  getCommScanCooldown(): number {
    const level = this.getCommLevel();
    const cooldown = getScanCooldown(level);
    const elapsed = Date.now() - this.lastCommScanTime;
    const remaining = cooldown * 60 * 1000 - elapsed;
    return Math.max(0, remaining);
  }

  // ========== 研究系统 ==========

  // 获取科研实验室等级
  getResearchLevel(): number {
    return this.getFacilityLevel(FacilityType.RESEARCH);
  }

  // 初始化研究项目
  initResearchProjects(): void {
    RESEARCH_PROJECTS.forEach(template => {
      if (!this.researchProjects.some(p => p.id === template.id)) {
        const project = createResearchProject(template.id);
        if (project) {
          this.researchProjects.push(project);
        }
      }
    });
    this.updateResearchStatus();
  }

  // 更新研究项目状态
  updateResearchStatus(): void {
    this.researchProjects.forEach(project => {
      if (project.status === ResearchStatus.COMPLETED) return;

      if (this.completedResearch.includes(project.id)) {
        project.status = ResearchStatus.COMPLETED;
        return;
      }

      if (project.status === ResearchStatus.IN_PROGRESS) return;

      const prereqsMet = project.prerequisites.every(p => this.completedResearch.includes(p));
      if (prereqsMet) {
        project.status = ResearchStatus.AVAILABLE;
      } else {
        project.status = ResearchStatus.LOCKED;
      }
    });
  }

  // 获取所有研究项目
  getResearchProjects(): ResearchProject[] {
    this.updateResearchStatus();
    return this.researchProjects;
  }

  // 获取进行中的研究
  getActiveResearch(): ResearchProject[] {
    return this.researchProjects.filter(p => p.status === ResearchStatus.IN_PROGRESS);
  }

  // 开始研究
  startResearch(projectId: string): { success: boolean; message: string } {
    const project = this.researchProjects.find(p => p.id === projectId);

    if (!project) {
      return { success: false, message: '研究项目不存在' };
    }

    const level = this.getResearchLevel();
    const maxConcurrent = getMaxConcurrentResearch(level);
    const activeCount = this.getActiveResearch().length;

    if (activeCount >= maxConcurrent) {
      return { success: false, message: `最多同时进行${maxConcurrent}项研究` };
    }

    const checkResult = canStartResearch(
      project,
      this.trainCoins,
      (itemId, count) => this.inventory.hasItem(itemId, count),
      this.completedResearch
    );

    if (!checkResult.canStart) {
      return { success: false, message: checkResult.reason || '无法开始研究' };
    }

    this.trainCoins -= project.cost.credits;
    project.cost.materials.forEach(mat => {
      this.inventory.removeItem(mat.itemId, mat.count);
    });

    project.status = ResearchStatus.IN_PROGRESS;
    project.progress = 0;

    this.addLog('科研实验室', `开始研究「${project.name}」`);

    return { success: true, message: `开始研究「${project.name}」` };
  }

  // 更新研究进度
  updateResearchProgress(): void {
    const level = this.getResearchLevel();
    const speedBonus = getResearchSpeedBonus(level);

    this.researchProjects.forEach(project => {
      if (project.status !== ResearchStatus.IN_PROGRESS) return;

      const progressGain = 1 + speedBonus / 100;
      project.progress += progressGain;

      if (project.progress >= project.totalProgress) {
        project.status = ResearchStatus.COMPLETED;
        project.progress = project.totalProgress;
        this.completedResearch.push(project.id);

        this.applyResearchEffects(project);
        this.addLog('科研实验室', `研究完成「${project.name}」`);
      }
    });
  }

  // 应用研究效果
  applyResearchEffects(project: ResearchProject): void {
    project.effects.forEach(effect => {
      switch (effect.type) {
        case 'warehouse_capacity':
          this.inventory.setMaxSlots(this.getWarehouseCapacity() + effect.value);
          break;
      }
    });
  }

  // 取消研究
  cancelResearch(projectId: string): { success: boolean; message: string } {
    const project = this.researchProjects.find(p => p.id === projectId);

    if (!project) {
      return { success: false, message: '研究项目不存在' };
    }

    if (project.status !== ResearchStatus.IN_PROGRESS) {
      return { success: false, message: '该研究未在进行中' };
    }

    project.status = ResearchStatus.AVAILABLE;
    project.progress = 0;

    this.addLog('科研实验室', `取消研究「${project.name}」`);

    return { success: true, message: `已取消研究「${project.name}」` };
  }

  // 获取研究加成效果
  getResearchBonus(type: string): number {
    let bonus = 0;
    this.completedResearch.forEach(id => {
      const project = this.researchProjects.find(p => p.id === id);
      if (project) {
        project.effects.forEach(effect => {
          if (effect.type === type) {
            bonus += effect.value;
          }
        });
      }
    });
    return bonus;
  }

  // ========== 采矿系统 ==========

  // 获取采矿平台等级
  getMiningLevel(): number {
    return this.getFacilityLevel(FacilityType.MINING);
  }

  // 获取可用的采矿点
  getAvailableMiningSites(): MiningSite[] {
    const level = this.getMiningLevel();
    return MINING_SITES.map(site => ({
      ...site,
      unlocked: site.unlocked || (site.unlockCondition?.facilityLevel && site.unlockCondition.facilityLevel <= level) || false,
    }));
  }

  // 获取当前采矿任务
  getMiningTasks(): MiningTask[] {
    return this.miningTasks.filter(t => t.status === MiningStatus.MINING);
  }

  // 开始采矿（带船员派遣）
  startMiningWithCrew(siteId: string, crewIds: string[]): { success: boolean; message: string; task?: MiningTask } {
    const level = this.getMiningLevel();
    const sites = this.getAvailableMiningSites();
    const site = sites.find(s => s.id === siteId);

    if (!site) {
      return { success: false, message: '采矿点不存在' };
    }

    if (!site.unlocked) {
      return { success: false, message: '采矿点未解锁' };
    }

    const maxSlots = getMaxMiningSlots(level);
    const activeTasks = this.getMiningTasks();

    if (activeTasks.length >= maxSlots) {
      return { success: false, message: `最多同时进行${maxSlots}个采矿任务` };
    }

    if (activeTasks.some(t => t.siteId === siteId)) {
      return { success: false, message: '该采矿点已在进行中' };
    }

    for (const crewId of crewIds) {
      const assignedTask = activeTasks.find(t => t.assignedCrew.includes(crewId));
      if (assignedTask) {
        const crew = this.crewMembers.find(c => c.id === crewId);
        return { success: false, message: `${crew?.name || '船员'}已被分配到其他任务` };
      }
    }

    const task = createMiningTask(siteId, level, crewIds);
    this.miningTasks.push(task);

    const crewNames = crewIds.map(id => this.crewMembers.find(c => c.id === id)?.name).filter(Boolean).join('、');
    this.addLog('采矿平台', `开始在「${site.name}」采矿${crewNames ? `，派遣船员：${crewNames}` : ''}`);

    return { success: true, message: `开始在「${site.name}」采矿`, task };
  }

  // 开始采矿（简化版，无船员）
  startMining(siteId: string): { success: boolean; message: string } {
    const result = this.startMiningWithCrew(siteId, []);
    return { success: result.success, message: result.message };
  }

  // 计算船员采矿加成
  calculateCrewMiningBonus(crewIds: string[]): number {
    return crewIds.reduce((total, id) => {
      const crew = this.crewMembers.find(c => c.id === id);
      if (crew) {
        return total + getCrewMiningBonus({
          attack: crew.stats.attack,
          defense: crew.stats.defense,
          speed: crew.stats.speed,
        });
      }
      return total;
    }, 0);
  }

  // 处理采矿随机事件
  processMiningRandomEvent(siteId: string): { event: string; message: string; bonus?: number; items?: { itemId: string; count: number }[] } | null {
    const task = this.miningTasks.find(t => t.siteId === siteId);
    if (!task || task.status !== MiningStatus.MINING) return null;

    const site = MINING_SITES.find(s => s.id === siteId);
    if (!site) return null;

    const event = checkMiningEvent(task, site);
    if (!event) return null;

    const result = processMiningEvent(event, task, site);

    task.events.push({
      type: event.type,
      timestamp: Date.now(),
      resolved: true,
      result: result.message,
    });

    if (result.bonus) {
      task.accumulated += result.bonus;
    }

    if (result.damage) {
      task.accumulated = Math.max(0, task.accumulated - result.damage);
    }

    if (result.items) {
      result.items.forEach(item => {
        this.inventory.addItem(item.itemId, item.count);
      });
    }

    this.addLog('采矿事件', `「${site.name}」${result.message}`);

    return {
      event: event.name,
      message: result.message,
      bonus: result.bonus,
      items: result.items,
    };
  }

  // 更新采矿深度
  updateMiningDepth(siteId: string): void {
    const task = this.miningTasks.find(t => t.siteId === siteId);
    if (!task || task.status !== MiningStatus.MINING) return;

    const site = MINING_SITES.find(s => s.id === siteId);
    if (!site) return;

    const progress = getMiningProgress(task);
    const newDepth = Math.floor((progress / 100) * site.maxDepth);

    if (newDepth > task.currentDepth) {
      task.currentDepth = newDepth;
    }
  }

  // 收集采矿成果
  collectMining(siteId: string): { success: boolean; message: string; yield?: number; mineral?: string; depth?: number; events?: number } {
    const taskIndex = this.miningTasks.findIndex(t => t.siteId === siteId);

    if (taskIndex === -1) {
      return { success: false, message: '采矿任务不存在' };
    }

    const task = this.miningTasks[taskIndex];

    if (task.status !== MiningStatus.MINING) {
      return { success: false, message: '采矿任务未在进行中' };
    }

    const site = MINING_SITES.find(s => s.id === siteId);
    if (!site) {
      return { success: false, message: '采矿点不存在' };
    }

    const level = this.getMiningLevel();
    const energyEfficiency = this.getEnergyCoreEfficiency();
    const crewBonus = this.calculateCrewMiningBonus(task.assignedCrew);
    const yieldAmount = getMiningYield(site, level, energyEfficiency, crewBonus, task.currentDepth);

    const mineralConfig = MINERAL_CONFIG[site.mineralType];
    this.inventory.addItem(mineralConfig.itemId, yieldAmount);

    const depthBonus = getDepthBonusDescription(task.currentDepth, site);
    this.miningTasks.splice(taskIndex, 1);

    this.addLog('采矿平台', `从「${site.name}」收集了${yieldAmount}个${mineralConfig.name}（深度${task.currentDepth}m，${depthBonus}）`);

    return {
      success: true,
      message: `收集了${yieldAmount}个${mineralConfig.name}`,
      yield: yieldAmount,
      mineral: mineralConfig.name,
      depth: task.currentDepth,
      events: task.events.length,
    };
  }

  // 取消采矿
  cancelMining(siteId: string): { success: boolean; message: string } {
    const taskIndex = this.miningTasks.findIndex(t => t.siteId === siteId);

    if (taskIndex === -1) {
      return { success: false, message: '采矿任务不存在' };
    }

    const task = this.miningTasks[taskIndex];
    const site = MINING_SITES.find(s => s.id === siteId);

    this.miningTasks.splice(taskIndex, 1);

    this.addLog('采矿平台', `取消了「${site?.name || siteId}」的采矿任务`);

    return { success: true, message: '已取消采矿任务' };
  }

  // 检查并自动收集完成的采矿任务
  checkMiningCompletion(): void {
    this.miningTasks.forEach(task => {
      if (isMiningComplete(task)) {
        const site = MINING_SITES.find(s => s.id === task.siteId);
        if (site) {
          const level = this.getMiningLevel();
          const energyEfficiency = this.getEnergyCoreEfficiency();
          const crewBonus = this.calculateCrewMiningBonus(task.assignedCrew);
          const yieldAmount = getMiningYield(site, level, energyEfficiency, crewBonus, task.currentDepth);
          const mineralConfig = MINERAL_CONFIG[site.mineralType];

          this.inventory.addItem(mineralConfig.itemId, yieldAmount);
          this.addLog('采矿平台', `「${site.name}」采矿完成，获得${yieldAmount}个${mineralConfig.name}`);
        }
      }
    });

    this.miningTasks = this.miningTasks.filter(t => !isMiningComplete(t));
  }

  // ========== 芯片系统 ==========

  // 获取芯片研发等级
  getChipLevel(): number {
    return this.getFacilityLevel(FacilityType.CHIP);
  }

  // 获取可用芯片槽位数（所有槽位默认解锁）
  getAvailableChipSlots(): number {
    return 4;
  }

  // 获取所有芯片
  getChips(): Chip[] {
    return this.chips;
  }

  // 获取已装备的芯片
  getEquippedChips(): Chip[] {
    return Object.values(this.equippedChips)
      .map(id => this.chips.find(c => c.id === id))
      .filter((c): c is Chip => c !== undefined);
  }

  // 制作芯片
  craftChip(slot: ChipSlot, rarity: ChipRarity): { success: boolean; message: string; chip?: Chip } {
    const cost = CHIP_CRAFT_COST[rarity];

    if (this.trainCoins < cost.credits) {
      return { success: false, message: `信用点不足，需要${cost.credits}` };
    }

    for (const material of cost.materials) {
      if (!this.inventory.hasItem(material.itemId, material.count)) {
        return { success: false, message: `材料不足，需要${material.count}个${material.itemId}` };
      }
    }

    this.trainCoins -= cost.credits;
    cost.materials.forEach(material => {
      this.inventory.removeItem(material.itemId, material.count);
    });

    const chip = createChip(slot, rarity);
    this.chips.push(chip);

    const rarityConfig = CHIP_RARITY_CONFIG[rarity];
    this.addLog('芯片研发', `制作了${rarityConfig.name}品质的${chip.slot}号位芯片`);

    return { success: true, message: `成功制作芯片`, chip };
  }

  // 升级芯片
  upgradeChip(chipId: string, materialCount: number): { success: boolean; message: string; newLevel?: number; unlockedSubStat?: string } {
    const chip = this.chips.find(c => c.id === chipId);

    if (!chip) {
      return { success: false, message: '芯片不存在' };
    }

    const cost = getUpgradeCost(chip.level);
    const totalCost = {
      credits: cost.credits * materialCount,
      materials: cost.materials * materialCount,
    };

    if (this.trainCoins < totalCost.credits) {
      return { success: false, message: `信用点不足，需要${totalCost.credits}` };
    }

    if (!this.inventory.hasItem('mineral_titanium', totalCost.materials)) {
      return { success: false, message: `钛矿不足，需要${totalCost.materials}个` };
    }

    this.trainCoins -= totalCost.credits;
    this.inventory.removeItem('mineral_titanium', totalCost.materials);

    const result = upgradeChip(chip, materialCount);

    if (result.success) {
      this.addLog('芯片研发', `芯片升级到Lv.${result.newLevel}`);
    }

    return {
      success: result.success,
      message: result.success ? `升级成功` : '已达最高等级',
      newLevel: result.newLevel,
      unlockedSubStat: result.unlockedSubStat ? CHIP_RARITY_CONFIG[chip.rarity].name : undefined,
    };
  }

  // 装备芯片
  equipChip(chipId: string): { success: boolean; message: string } {
    const chip = this.chips.find(c => c.id === chipId);

    if (!chip) {
      return { success: false, message: '芯片不存在' };
    }

    const currentEquipped = this.equippedChips[chip.slot];
    if (currentEquipped === chipId) {
      return { success: false, message: '该芯片已装备' };
    }

    this.equippedChips[chip.slot] = chipId;
    this.addLog('芯片研发', `装备了${chip.slot}号位芯片`);

    return { success: true, message: `已装备到${chip.slot}号位` };
  }

  // 卸下芯片
  unequipChip(slot: ChipSlot): { success: boolean; message: string } {
    const chipId = this.equippedChips[slot];

    if (!chipId) {
      return { success: false, message: '该槽位没有装备芯片' };
    }

    delete this.equippedChips[slot];
    this.addLog('芯片研发', `卸下了${slot}号位芯片`);

    return { success: true, message: '已卸下芯片' };
  }

  // 分解芯片
  decomposeChip(chipId: string): { success: boolean; message: string; rewards?: string } {
    const chipIndex = this.chips.findIndex(c => c.id === chipId);

    if (chipIndex === -1) {
      return { success: false, message: '芯片不存在' };
    }

    const chip = this.chips[chipIndex];

    if (this.equippedChips[chip.slot] === chipId) {
      return { success: false, message: '请先卸下芯片' };
    }

    const rarityIndex = Object.keys(ChipRarity).indexOf(chip.rarity);
    const rewards: string[] = [];

    const credits = 100 * (rarityIndex + 1) * chip.level;
    this.trainCoins += credits;
    rewards.push(`${credits}信用点`);

    const materialReward = {
      [ChipRarity.COMMON]: { itemId: 'mineral_iron', count: 5 },
      [ChipRarity.UNCOMMON]: { itemId: 'mineral_copper', count: 3 },
      [ChipRarity.RARE]: { itemId: 'mineral_titanium', count: 2 },
      [ChipRarity.EPIC]: { itemId: 'mineral_crystal', count: 1 },
      [ChipRarity.LEGENDARY]: { itemId: 'mineral_quantum', count: 1 },
    }[chip.rarity];

    if (materialReward) {
      this.inventory.addItem(materialReward.itemId, materialReward.count);
      rewards.push(`${materialReward.count}个材料`);
    }

    this.chips.splice(chipIndex, 1);
    this.addLog('芯片研发', `分解了芯片，获得${rewards.join('、')}`);

    return { success: true, message: '分解成功', rewards: rewards.join('、') };
  }

  // 强化芯片副属性
  enhanceChipItem(chipId: string, subStatIndex: number): { success: boolean; message: string } {
    const chip = this.chips.find(c => c.id === chipId);

    if (!chip) {
      return { success: false, message: '芯片不存在' };
    }

    const cost = getEnhanceCost(chip);

    if (this.trainCoins < cost.credits) {
      return { success: false, message: `信用点不足，需要${cost.credits}` };
    }

    if (!this.inventory.hasItem('mineral_crystal', cost.materials)) {
      return { success: false, message: `水晶矿不足，需要${cost.materials}个` };
    }

    this.trainCoins -= cost.credits;
    this.inventory.removeItem('mineral_crystal', cost.materials);

    const result = enhanceChip(chip, subStatIndex);

    if (result.success) {
      this.addLog('芯片研发', `强化芯片: ${result.message}`);
    }

    return result;
  }

  // 重随单个副属性
  rerollChipSubStat(chipId: string, subStatIndex: number): { success: boolean; message: string; newValue?: number } {
    const chip = this.chips.find(c => c.id === chipId);

    if (!chip) {
      return { success: false, message: '芯片不存在' };
    }

    const cost = getRerollCost(chip);

    if (this.trainCoins < cost.credits) {
      return { success: false, message: `信用点不足，需要${cost.credits}` };
    }

    if (!this.inventory.hasItem('mineral_quantum', cost.materials)) {
      return { success: false, message: `量子矿不足，需要${cost.materials}个` };
    }

    this.trainCoins -= cost.credits;
    this.inventory.removeItem('mineral_quantum', cost.materials);

    const result = rerollSubStat(chip, subStatIndex);

    if (result.success) {
      this.addLog('芯片研发', `重随副属性: ${result.message}`);
    }

    return result;
  }

  // 重随所有副属性
  rerollAllChipSubStats(chipId: string): { success: boolean; message: string } {
    const chip = this.chips.find(c => c.id === chipId);

    if (!chip) {
      return { success: false, message: '芯片不存在' };
    }

    const cost = getRerollCost(chip);
    const totalCost = { credits: cost.credits * 2, materials: cost.materials * 2 };

    if (this.trainCoins < totalCost.credits) {
      return { success: false, message: `信用点不足，需要${totalCost.credits}` };
    }

    if (!this.inventory.hasItem('mineral_quantum', totalCost.materials)) {
      return { success: false, message: `量子矿不足，需要${totalCost.materials}个` };
    }

    this.trainCoins -= totalCost.credits;
    this.inventory.removeItem('mineral_quantum', totalCost.materials);

    const result = rerollAllSubStats(chip);

    if (result.success) {
      this.addLog('芯片研发', '重随了所有副属性');
    }

    return result;
  }

  // 切换芯片锁定状态
  toggleChipLockState(chipId: string): { success: boolean; message: string; locked?: boolean } {
    const chip = this.chips.find(c => c.id === chipId);

    if (!chip) {
      return { success: false, message: '芯片不存在' };
    }

    const locked = toggleChipLock(chip);
    this.addLog('芯片研发', locked ? '锁定了芯片' : '解锁了芯片');

    return { success: true, message: locked ? '已锁定' : '已解锁', locked };
  }

  // 获取芯片套装效果
  getChipSetBonuses(): { set: ChipSet; count: number; bonuses: string[] }[] {
    return getSetBonus(this.getEquippedChips());
  }

  // 获取芯片总属性加成
  getChipStatBonus(): Record<string, number> {
    const totalStats: Record<string, number> = {};

    this.getEquippedChips().forEach(chip => {
      const stats = getChipStats(chip);
      Object.entries(stats).forEach(([stat, value]) => {
        totalStats[stat] = (totalStats[stat] || 0) + value;
      });
    });

    return totalStats;
  }

  // ========== 基因系统 ==========

  // 获取基因工程等级
  getGeneLevel(): number {
    return this.getFacilityLevel(FacilityType.GENE);
  }

  // 初始化基因树
  initGeneTree(): void {
    if (this.geneNodes.length === 0) {
      GENE_TREE.forEach(template => {
        this.geneNodes.push(createGeneNode(template));
      });
    }
    this.updateGeneUnlockStatus();
  }

  // 更新基因解锁状态
  updateGeneUnlockStatus(): void {
    const level = this.getGeneLevel();
    const maxUnlocked = 3 + (level - 1) * 2;

    this.geneNodes.forEach((node, index) => {
      if (index < maxUnlocked) {
        const prereqsMet = node.prerequisites.every(p => {
          const prereqNode = this.geneNodes.find(n => n.id === p);
          return prereqNode && prereqNode.level > 0;
        });
        node.unlocked = prereqsMet || node.prerequisites.length === 0;
      } else {
        node.unlocked = false;
      }
    });
  }

  // 获取基因节点
  getGeneNodes(): GeneNode[] {
    this.updateGeneUnlockStatus();
    return this.geneNodes;
  }

  // 升级基因节点
  upgradeGeneNode(nodeId: string): { success: boolean; message: string; newValue?: number } {
    const node = this.geneNodes.find(n => n.id === nodeId);

    if (!node) {
      return { success: false, message: '基因节点不存在' };
    }

    if (!node.unlocked) {
      return { success: false, message: '基因节点未解锁' };
    }

    if (node.level >= node.maxLevel) {
      return { success: false, message: '已达最高等级' };
    }

    const cost = getGeneUpgradeCost(node);

    if (this.trainCoins < cost.credits) {
      return { success: false, message: `信用点不足，需要${cost.credits}` };
    }

    if (!this.inventory.hasItem(cost.materials.itemId, cost.materials.count)) {
      return { success: false, message: `基因材料不足，需要${cost.materials.count}个` };
    }

    this.trainCoins -= cost.credits;
    this.inventory.removeItem(cost.materials.itemId, cost.materials.count);

    const result = upgradeGeneNode(node);

    if (result.success) {
      const typeConfig = GENE_TYPE_CONFIG[node.type];
      this.addLog('基因工程', `${typeConfig.name}基因升级到Lv.${node.level}`);
    }

    return { success: result.success, message: result.success ? '升级成功' : '升级失败', newValue: result.newValue };
  }

  // 获取基因总属性
  getGeneTotalStats(): Record<GeneType, number> {
    return getGeneTotalStats(this.geneNodes);
  }

  // ========== 机械飞升系统 ==========

  // 获取机械飞升等级
  getCyberneticLevel(): number {
    return this.getFacilityLevel(FacilityType.ARENA);
  }

  // 获取可用的义体槽位
  getAvailableImplantSlots(): ImplantType[] {
    const level = this.getCyberneticLevel();
    const slots: ImplantType[] = [ImplantType.NEURAL];

    if (level >= 2) slots.push(ImplantType.SKELETAL);
    if (level >= 3) slots.push(ImplantType.MUSCULAR);
    if (level >= 4) slots.push(ImplantType.SENSORY);
    if (level >= 5) {
      slots.push(ImplantType.CARDIO);
      slots.push(ImplantType.INTEGRATED);
    }

    return slots;
  }

  // 获取所有义体
  getImplants(): Implant[] {
    return this.implants;
  }

  // 获取已装备的义体
  getEquippedImplants(): Implant[] {
    return Object.values(this.equippedImplants)
      .map(id => this.implants.find(i => i.id === id))
      .filter((i): i is Implant => i !== undefined);
  }

  // 制造义体
  craftImplant(rarity: ImplantRarity): { success: boolean; message: string; implant?: Implant } {
    const level = this.getCyberneticLevel();

    const rarityCost = {
      [ImplantRarity.COMMON]: { credits: 500, materials: 5 },
      [ImplantRarity.UNCOMMON]: { credits: 1000, materials: 8 },
      [ImplantRarity.RARE]: { credits: 2000, materials: 12 },
      [ImplantRarity.EPIC]: { credits: 5000, materials: 20 },
      [ImplantRarity.LEGENDARY]: { credits: 10000, materials: 30 },
    };

    const cost = rarityCost[rarity];

    if (this.trainCoins < cost.credits) {
      return { success: false, message: `信用点不足，需要${cost.credits}` };
    }

    if (!this.inventory.hasItem('cyber_material', cost.materials)) {
      return { success: false, message: `义体材料不足，需要${cost.materials}个` };
    }

    this.trainCoins -= cost.credits;
    this.inventory.removeItem('cyber_material', cost.materials);

    const implant = getRandomImplantByRarity(rarity);
    if (!implant) {
      return { success: false, message: '无法生成义体' };
    }

    this.implants.push(implant);

    const rarityConfig = IMPLANT_RARITY_CONFIG[implant.rarity];
    this.addLog('机械飞升', `制造了${rarityConfig.name}品质的${implant.name}`);

    return { success: true, message: `成功制造${implant.name}`, implant };
  }

  // 升级义体
  upgradeImplantItem(implantId: string): { success: boolean; message: string; newLevel?: number } {
    const implant = this.implants.find(i => i.id === implantId);

    if (!implant) {
      return { success: false, message: '义体不存在' };
    }

    if (implant.level >= implant.maxLevel) {
      return { success: false, message: '已达最高等级' };
    }

    const cost = getImplantUpgradeCost(implant);

    if (this.trainCoins < cost.credits) {
      return { success: false, message: `信用点不足，需要${cost.credits}` };
    }

    if (!this.inventory.hasItem(cost.materials.itemId, cost.materials.count)) {
      return { success: false, message: `材料不足，需要${cost.materials.count}个` };
    }

    this.trainCoins -= cost.credits;
    this.inventory.removeItem(cost.materials.itemId, cost.materials.count);

    const result = upgradeImplant(implant);

    if (result.success) {
      const typeConfig = IMPLANT_TYPE_CONFIG[implant.type];
      this.addLog('机械飞升', `${implant.name}升级到Lv.${implant.level}`);
    }

    return { success: result.success, message: result.success ? '升级成功' : '升级失败', newLevel: result.newLevel };
  }

  // 装备义体
  equipImplant(implantId: string): { success: boolean; message: string } {
    const implant = this.implants.find(i => i.id === implantId);

    if (!implant) {
      return { success: false, message: '义体不存在' };
    }

    const availableSlots = this.getAvailableImplantSlots();
    if (!availableSlots.includes(implant.type)) {
      return { success: false, message: '该类型义体槽位未解锁' };
    }

    const currentEquipped = this.equippedImplants[implant.type];
    if (currentEquipped === implantId) {
      return { success: false, message: '该义体已装备' };
    }

    this.equippedImplants[implant.type] = implantId;
    this.addLog('机械飞升', `装备了${implant.name}`);

    return { success: true, message: `已装备${implant.name}` };
  }

  // 卸下义体
  unequipImplant(type: ImplantType): { success: boolean; message: string } {
    const implantId = this.equippedImplants[type];

    if (!implantId) {
      return { success: false, message: '该槽位没有装备义体' };
    }

    const implant = this.implants.find(i => i.id === implantId);
    delete this.equippedImplants[type];
    this.addLog('机械飞升', `卸下了${implant?.name || type}`);

    return { success: true, message: '已卸下义体' };
  }

  // 分解义体
  decomposeImplant(implantId: string): { success: boolean; message: string; rewards?: string } {
    const implantIndex = this.implants.findIndex(i => i.id === implantId);

    if (implantIndex === -1) {
      return { success: false, message: '义体不存在' };
    }

    const implant = this.implants[implantIndex];

    if (this.equippedImplants[implant.type] === implantId) {
      return { success: false, message: '请先卸下义体' };
    }

    const rarityIndex = Object.keys(ImplantRarity).indexOf(implant.rarity);
    const rewards: string[] = [];

    const credits = 200 * (rarityIndex + 1) * implant.level;
    this.trainCoins += credits;
    rewards.push(`${credits}信用点`);

    const materialReward = 2 + rarityIndex * 2 + Math.floor(implant.level / 3);
    this.inventory.addItem('cyber_material', materialReward);
    rewards.push(`${materialReward}个义体材料`);

    this.implants.splice(implantIndex, 1);
    this.addLog('机械飞升', `分解了义体，获得${rewards.join('、')}`);

    return { success: true, message: '分解成功', rewards: rewards.join('、') };
  }

  // 获取义体总属性加成
  getImplantTotalStats(): Record<string, number> {
    const totalStats: Record<string, number> = {};

    this.getEquippedImplants().forEach(implant => {
      const stats = getImplantStats(implant);
      Object.entries(stats).forEach(([stat, value]) => {
        totalStats[stat] = (totalStats[stat] || 0) + value;
      });
    });

    return totalStats;
  }

  // ========== 星际市场系统 ==========

  // 获取市场等级
  getMarketLevel(): number {
    return this.getFacilityLevel(FacilityType.MARKET);
  }

  // 获取市场挂单列表
  getMarketListings(): MarketListing[] {
    this.marketListings = this.marketListings.filter(l => !isListingExpired(l));

    if (this.marketListings.length === 0) {
      this.marketListings = generateSystemListings();
    }

    return this.marketListings;
  }

  // 获取玩家挂单列表
  getPlayerListings(): PlayerListing[] {
    this.playerListings = this.playerListings.filter(l => l.status === 'active');
    return this.playerListings;
  }

  // 获取交易记录
  getMarketTransactions(): MarketTransaction[] {
    return this.marketTransactions.slice(-50);
  }

  // 挂单出售物品
  listMarketItem(
    itemId: string,
    quantity: number,
    price: number
  ): { success: boolean; message: string; listing?: PlayerListing } {
    if (this.playerListings.filter(l => l.status === 'active').length >= MARKET_MAX_LISTINGS) {
      return { success: false, message: `最多同时挂${MARKET_MAX_LISTINGS}个单` };
    }

    const item = this.inventory.getItem(itemId);
    if (!item) {
      return { success: false, message: '物品不存在' };
    }

    if (item.quantity < quantity) {
      return { success: false, message: `物品数量不足，当前有${item.quantity}个` };
    }

    if (price <= 0) {
      return { success: false, message: '价格必须大于0' };
    }

    this.inventory.removeItem(itemId, quantity);

    const listing: PlayerListing = {
      ...createMarketListing(
        itemId,
        item.name,
        item.type === ItemType.WEAPON || item.type === ItemType.ARMOR || item.type === ItemType.ACCESSORY
          ? MarketItemType.EQUIPMENT
          : item.type === ItemType.CONSUMABLE
            ? MarketItemType.CONSUMABLE
            : MarketItemType.MATERIAL,
        item.rarity as unknown as MarketRarity,
        quantity,
        price,
        this.playerName
      ),
      status: 'active',
    };

    this.playerListings.push(listing);
    this.addLog('星际市场', `挂单出售${item.name}x${quantity}，单价${price}`);

    return { success: true, message: '挂单成功', listing };
  }

  // 取消挂单
  cancelMarketListing(listingId: string): { success: boolean; message: string } {
    const listingIndex = this.playerListings.findIndex(l => l.id === listingId && l.status === 'active');

    if (listingIndex === -1) {
      return { success: false, message: '挂单不存在或已成交' };
    }

    const listing = this.playerListings[listingIndex];
    this.inventory.addItem(listing.itemId, listing.quantity);
    listing.status = 'expired';

    this.addLog('星际市场', `取消挂单${listing.itemName}x${listing.quantity}`);

    return { success: true, message: '取消成功，物品已返还' };
  }

  // 购买市场物品
  buyMarketItem(listingId: string): { success: boolean; message: string } {
    const listingIndex = this.marketListings.findIndex(l => l.id === listingId);

    if (listingIndex === -1) {
      return { success: false, message: '挂单不存在' };
    }

    const listing = this.marketListings[listingIndex];

    if (isListingExpired(listing)) {
      this.marketListings.splice(listingIndex, 1);
      return { success: false, message: '挂单已过期' };
    }

    const totalPrice = listing.price * listing.quantity;

    if (this.trainCoins < totalPrice) {
      return { success: false, message: `信用点不足，需要${totalPrice}` };
    }

    this.trainCoins -= totalPrice;
    this.inventory.addItem(listing.itemId, listing.quantity);

    const transaction: MarketTransaction = {
      id: `tx_${Date.now()}`,
      itemId: listing.itemId,
      itemName: listing.itemName,
      quantity: listing.quantity,
      price: listing.price,
      type: 'buy',
      timestamp: Date.now(),
    };
    this.marketTransactions.push(transaction);

    this.marketListings.splice(listingIndex, 1);

    this.addLog('星际市场', `购买${listing.itemName}x${listing.quantity}，花费${totalPrice}信用点`);

    return { success: true, message: `购买成功，获得${listing.itemName}x${listing.quantity}` };
  }

  // 刷新市场
  refreshMarket(): { success: boolean; message: string } {
    this.marketListings = generateSystemListings();
    this.addLog('星际市场', '市场已刷新');
    return { success: true, message: '市场已刷新' };
  }

  // ========== 遗迹探索系统 ==========

  // 获取遗迹探索等级
  getRuinLevel(): number {
    return this.getFacilityLevel(FacilityType.RUINS);
  }

  // 获取遗迹列表
  getRuins(): Ruin[] {
    const level = this.getRuinLevel();
    const availableRuins = generateRuins(level);

    availableRuins.forEach(ar => {
      const existing = this.ruins.find(r => r.id === ar.id);
      if (existing) {
        ar.completedCount = existing.completedCount;
      }
    });

    this.ruins = availableRuins;
    return this.ruins;
  }

  // 获取探索任务列表
  getExploreMissions(): ExploreMission[] {
    return this.exploreMissions;
  }

  // 开始探索
  startExplore(ruinId: string, crewIds: string[]): { success: boolean; message: string; mission?: ExploreMission } {
    const ruin = this.ruins.find(r => r.id === ruinId);

    if (!ruin) {
      return { success: false, message: '遗迹不存在' };
    }

    if (ruin.status === ExploreStatus.EXPLORING) {
      return { success: false, message: '该遗迹正在探索中' };
    }

    if (crewIds.length === 0) {
      return { success: false, message: '请选择至少一名船员' };
    }

    const crewMembers = crewIds.map(id => this.crewMembers.find(c => c.id === id)).filter((c): c is CrewMember => c !== undefined);

    if (crewMembers.length !== crewIds.length) {
      return { success: false, message: '部分船员不存在' };
    }

    for (const crew of crewMembers) {
      const assignedMission = this.exploreMissions.find(m => m.status === 'ongoing' && m.crewIds.includes(crew.id));
      if (assignedMission) {
        return { success: false, message: `${crew.name}正在执行其他任务` };
      }
    }

    const mission: ExploreMission = {
      id: `explore_${Date.now()}`,
      ruinId,
      crewIds,
      startTime: Date.now(),
      endTime: Date.now() + ruin.duration,
      status: 'ongoing',
    };

    ruin.status = ExploreStatus.EXPLORING;
    ruin.assignedCrew = crewIds;
    this.exploreMissions.push(mission);

    const typeConfig = RUIN_TYPE_CONFIG[ruin.type];
    this.addLog('遗迹探索', `开始探索${typeConfig.name}：${ruin.name}`);

    return { success: true, message: '探索已开始', mission };
  }

  // 完成探索
  completeExplore(missionId: string): { success: boolean; message: string; rewards?: { credits: number; items: { itemId: string; count: number }[]; experience: number } } {
    const missionIndex = this.exploreMissions.findIndex(m => m.id === missionId);

    if (missionIndex === -1) {
      return { success: false, message: '任务不存在' };
    }

    const mission = this.exploreMissions[missionIndex];

    if (mission.status !== 'ongoing') {
      return { success: false, message: '任务已完成' };
    }

    if (Date.now() < mission.endTime) {
      return { success: false, message: '探索尚未完成' };
    }

    const ruin = this.ruins.find(r => r.id === mission.ruinId);
    if (!ruin) {
      return { success: false, message: '遗迹不存在' };
    }

    const crewPower = mission.crewIds.reduce((total, id) => {
      const crew = this.crewMembers.find(c => c.id === id);
      return total + (crew?.stats.attack || 0) + (crew?.stats.defense || 0);
    }, 0);

    const successRate = calculateExploreSuccess(crewPower, ruin.difficulty);
    const isSuccess = Math.random() * 100 < successRate;

    const rewards = generateRewards(ruin.rewards, isSuccess);

    this.trainCoins += rewards.credits;
    rewards.items.forEach(item => {
      this.inventory.addItem(item.itemId, item.count);
    });

    ruin.status = ExploreStatus.AVAILABLE;
    ruin.assignedCrew = undefined;
    ruin.completedCount += 1;

    mission.status = isSuccess ? 'completed' : 'failed';
    this.exploreMissions.splice(missionIndex, 1);

    const typeConfig = RUIN_TYPE_CONFIG[ruin.type];
    this.addLog('遗迹探索', `${isSuccess ? '成功' : '失败'}探索${typeConfig.name}：${ruin.name}，获得${rewards.credits}信用点`);

    return {
      success: true,
      message: isSuccess ? '探索成功！' : '探索失败，但获得部分奖励',
      rewards,
    };
  }

  // 取消探索
  cancelExplore(missionId: string): { success: boolean; message: string } {
    const missionIndex = this.exploreMissions.findIndex(m => m.id === missionId);

    if (missionIndex === -1) {
      return { success: false, message: '任务不存在' };
    }

    const mission = this.exploreMissions[missionIndex];

    if (mission.status !== 'ongoing') {
      return { success: false, message: '任务已完成' };
    }

    const ruin = this.ruins.find(r => r.id === mission.ruinId);
    if (ruin) {
      ruin.status = ExploreStatus.AVAILABLE;
      ruin.assignedCrew = undefined;
    }

    this.exploreMissions.splice(missionIndex, 1);
    this.addLog('遗迹探索', '取消了探索任务');

    return { success: true, message: '已取消探索' };
  }

  // 检查并完成已结束的探索任务
  checkExploreMissions(): void {
    this.exploreMissions.forEach(mission => {
      if (mission.status === 'ongoing' && Date.now() >= mission.endTime) {
        // 任务已完成，等待玩家领取奖励
      }
    });
  }

  // ========== 自动采集系统 ==========

  // 开始自动采集
  startAutoCollect(robotId: string, mode: AutoCollectMode): { success: boolean; message: string } {
    const result = this.autoCollectSystem.startCollect(robotId, mode);
    if (result.success) {
      const robot = getCollectRobot(robotId);
      this.addLog('自动采集', `开始派遣${robot?.name || '机器人'}进行自动资源采集`);
    }
    return result;
  }

  // 停止自动采集
  stopAutoCollect(): { success: boolean; message: string; rewards?: CollectReward } {
    const energyEfficiency = this.getEnergyCoreEfficiency();
    const result = this.autoCollectSystem.stopCollect(energyEfficiency);
    if (result.success && result.rewards) {
      this.applyCollectRewards(result.rewards);
      this.addLog('自动采集', `停止采集，获得 ${result.rewards.gold} 信用点、${result.rewards.exp} 经验值`);
    }
    return result;
  }

  // 领取采集收益（不停止）
  claimAutoCollectRewards(): { success: boolean; message: string; rewards?: CollectReward } {
    const energyEfficiency = this.getEnergyCoreEfficiency();
    const result = this.autoCollectSystem.claimRewards(energyEfficiency);
    if (result.success && result.rewards) {
      this.applyCollectRewards(result.rewards);
      this.addLog('自动采集', `领取收益：${result.rewards.gold} 信用点、${result.rewards.exp} 经验值`);
    }
    return result;
  }

  // 应用采集收益
  private applyCollectRewards(rewards: CollectReward): void {
    // 添加信用点
    this.trainCoins += rewards.gold;

    // 添加经验
    this.player.addExp(rewards.exp);

    // 添加材料到背包
    rewards.materials.forEach(mat => {
      this.inventory.addItem(mat.itemId, mat.quantity);
    });

    // 添加强化石到背包
    if (rewards.enhanceStones > 0) {
      this.inventory.addItem('enhance_stone', rewards.enhanceStones);
    }
  }

  // 获取自动采集系统状态
  getAutoCollectState() {
    return this.autoCollectSystem.state;
  }

  // 获取自动采集配置
  getAutoCollectConfig() {
    return this.autoCollectSystem.config;
  }

  // 更新自动采集配置
  updateAutoCollectConfig(config: Partial<AutoCollectSystem['config']>): void {
    this.autoCollectSystem.updateConfig(config);
  }

  // 获取格式化的采集时长
  getAutoCollectDuration(): string {
    return this.autoCollectSystem.getFormattedDuration();
  }

  // 获取预计每小时收益
  getEstimatedHourlyRewards() {
    const energyEfficiency = this.getEnergyCoreEfficiency();
    return this.autoCollectSystem.getEstimatedHourlyRewards(energyEfficiency);
  }

  // 获取可用的采集地点
  getAvailableCollectLocations() {
    return this.autoCollectSystem.getAvailableLocations(this.player.level);
  }

  // ========== 战斗系统 ==========

  // 开始战斗
  startBattle(locationId: string, isBoss: boolean = false, isElite: boolean = false): { success: boolean; message: string; enemy?: Enemy } {
    // 检查是否是新的星球ID格式（以 planet_ 开头）
    if (locationId.startsWith('planet_')) {
      return this.startPlanetBattle(locationId, isBoss, isElite);
    }

    // 检查是否是神话站台
    const mythLocation = MYTHOLOGY_LOCATIONS.find((l: any) => l.id === locationId);

    if (mythLocation) {
      // 神话站台战斗
      return this.startMythologyBattle(mythLocation, isBoss, isElite);
    }

    // 旧站台系统已弃用，尝试使用星球系统
    // 将 loc_xxx 格式的ID映射到对应的星球
    const locationToPlanetMap: Record<string, string> = {
      'loc_001': 'planet_alpha', 'loc_002': 'planet_eta', 'loc_003': 'planet_beta',
      'loc_004': 'planet_gamma', 'loc_005': 'planet_delta', 'loc_006': 'planet_epsilon',
      'loc_007': 'planet_zeta', 'loc_008': 'planet_theta',
    };
    const planetId = locationToPlanetMap[locationId];
    if (planetId) {
      return this.startPlanetBattle(planetId, isBoss, isElite);
    }

    // 无法识别的地点
    return { success: false, message: '地点不存在或已弃用' };
  }

  // 新星球战斗系统
  private startPlanetBattle(planetId: string, isBoss: boolean, isElite: boolean): { success: boolean; message: string; enemy?: Enemy } {
    // 使用新的虚空怪物系统
    let enemy: Enemy | null = null;

    // 战斗消耗10体力
    const staminaCost = 10;

    // 检查体力
    if (this.player.stamina < staminaCost) {
      return { success: false, message: `体力不足（需要${staminaCost}点）` };
    }

    if (isBoss) {
      // 检查今天是否已经挑战过
      if (!this.isBossRefreshed(planetId)) {
        return { success: false, message: '今日已挑战过该首领，请明天再来' };
      }

      enemy = getBossEnemyForPlanet(planetId);
      if (!enemy) {
        // 如果新系统没有BOSS，尝试使用旧系统
        return { success: false, message: '该星球没有首领' };
      }
      const enemyInstance = createEnemyInstance(enemy.id);
      if (!enemyInstance) {
        return { success: false, message: '创建首领失败' };
      }
      // 扣除体力
      this.player.consumeStamina(staminaCost);
      // 记录挑战日期（失败不扣除次数，所以在这里记录）
      this.recordBossChallenge(planetId);
      this.addLog('战斗', `💀 挑战虚空首领 ${enemyInstance.name}！消耗${staminaCost}体力`);
      return { success: true, message: `💀 挑战虚空首领 ${enemyInstance.name}！消耗${staminaCost}体力`, enemy: enemyInstance };
    }

    if (isElite) {
      enemy = getEliteEnemyForPlanet(planetId);
      if (!enemy) {
        return { success: false, message: '该星球没有精英虚空生物' };
      }
      const enemyInstance = createEnemyInstance(enemy.id);
      if (!enemyInstance) {
        return { success: false, message: '创建精英虚空生物失败' };
      }
      // 扣除体力
      this.player.consumeStamina(staminaCost);
      this.addLog('战斗', `👾 遭遇了精英 ${enemyInstance.name}！消耗${staminaCost}体力`);
      return { success: true, message: `👾 遭遇了精英 ${enemyInstance.name}！消耗${staminaCost}体力`, enemy: enemyInstance };
    }

    // 普通虚空生物
    enemy = getRandomEnemyForPlanet(planetId, 'normal');
    if (!enemy) {
      return { success: false, message: '该星球没有虚空生物' };
    }

    const enemyInstance = createEnemyInstance(enemy.id);
    if (!enemyInstance) {
      return { success: false, message: '创建虚空生物失败' };
    }

    // 扣除体力
    this.player.consumeStamina(staminaCost);
    this.addLog('战斗', `👾 遭遇了 ${enemyInstance.name}！消耗${staminaCost}体力`);
    return { success: true, message: `👾 遭遇了 ${enemyInstance.name}！消耗${staminaCost}体力`, enemy: enemyInstance };
  }

  // 扫荡功能：首次击败boss后解锁，收获等于战胜一次精英敌人，消耗10体力
  sweepPlanet(planetId: string): { success: boolean; message: string; rewards?: { exp: number; loot: { itemId: string; name: string; quantity: number }[] }; logs: string[] } {
    const logs: string[] = [];

    // 检查是否已击败该星球的boss
    const progress = this.getLocationProgress(planetId);
    if (!progress.bossDefeated) {
      return { success: false, message: '需要先击败该星球首领才能解锁扫荡', logs };
    }

    // 检查体力
    const staminaCost = 10;
    if (this.player.stamina < staminaCost) {
      return { success: false, message: `体力不足（需要${staminaCost}点）`, logs };
    }

    // 消耗体力
    this.player.consumeStamina(staminaCost);
    logs.push(`消耗 ${staminaCost} 体力`);

    // 生成精英敌人收益
    const enemy = getEliteEnemyForPlanet(planetId);
    if (!enemy) {
      return { success: false, message: '该星球没有精英虚空生物', logs };
    }

    const enemyInstance = createEnemyInstance(enemy.id);
    if (!enemyInstance) {
      return { success: false, message: '创建精英虚空生物失败', logs };
    }

    // 获得经验
    const expGain = enemyInstance.expReward;
    const levelUpLogs = this.player.addExp(expGain);
    logs.push(`获得 ${expGain} 经验值`);
    logs.push(...levelUpLogs);

    // 掉落物品
    const loot: { itemId: string; name: string; quantity: number }[] = [];
    enemyInstance.lootTable.forEach(lootItem => {
      if (Math.random() < lootItem.chance) {
        const itemTemplate = getItemTemplate(lootItem.itemId);
        if (itemTemplate && this.inventory.addItem(lootItem.itemId, 1)) {
          loot.push({ itemId: lootItem.itemId, name: itemTemplate.name, quantity: 1 });
          logs.push(`获得 ${itemTemplate.name}`);
        }
      }
    });

    // 掉落制造材料（带品质版本）
    const materialIds = ['mat_001', 'mat_002', 'mat_003', 'mat_004', 'mat_005', 'mat_006', 'mat_007', 'mat_008', 'mat_009', 'mat_010'];
    const materialCount = 3 + Math.floor(Math.random() * 3); // 3-5个

    // 品质后缀映射
    const QUALITY_SUFFIX: Record<ArmorQuality, string> = {
      [ArmorQuality.STARDUST]: '_stardust',
      [ArmorQuality.ALLOY]: '_alloy',
      [ArmorQuality.CRYSTAL]: '_crystal',
      [ArmorQuality.QUANTUM]: '_quantum',
      [ArmorQuality.VOID]: '_void',
    };

    for (let i = 0; i < materialCount; i++) {
      const matId = materialIds[Math.floor(Math.random() * materialIds.length)];
      // 扫荡产出星尘级材料
      const qualityId = `${matId}${QUALITY_SUFFIX[ArmorQuality.STARDUST]}`;
      const itemTemplate = getItemTemplate(qualityId);
      if (itemTemplate && this.inventory.addItem(qualityId, 1)) {
        const existing = loot.find(l => l.itemId === qualityId);
        if (existing) {
          existing.quantity++;
        } else {
          loot.push({ itemId: qualityId, name: itemTemplate.name, quantity: 1 });
        }
      }
    }

    // 推进时间
    this.advanceTime(30);

    this.addLog('扫荡', `扫荡完成，获得${expGain}经验`);

    return { success: true, message: '扫荡完成', rewards: { exp: expGain, loot }, logs };
  }

  // ========== 材料合成系统 ==========

  // 合成材料
  synthesizeMaterial(materialId: string, sourceQuality: ArmorQuality): { success: boolean; message: string } {
    // 创建临时库存映射
    const inventoryMap = new Map<string, number>();
    this.inventory.items.forEach(item => {
      inventoryMap.set(item.id, item.quantity);
    });

    const result = synthesize(inventoryMap, materialId, sourceQuality);

    if (result.success) {
      // 更新实际库存
      const sourceItemId = `${materialId}${this.getQualitySuffix(sourceQuality)}`;
      const targetItemId = result.produced;

      // 消耗源材料
      const sourceItem = this.inventory.getItem(sourceItemId);
      if (sourceItem) {
        this.inventory.removeItem(sourceItemId, result.consumed);
      }

      // 添加目标材料
      this.inventory.addItem(targetItemId, result.producedCount);

      this.addLog('合成', result.message);
    }

    return result;
  }

  // 批量合成材料
  synthesizeMaterialBatch(materialId: string, sourceQuality: ArmorQuality, batchCount: number): { success: boolean; message: string } {
    // 创建临时库存映射
    const inventoryMap = new Map<string, number>();
    this.inventory.items.forEach(item => {
      inventoryMap.set(item.id, item.quantity);
    });

    const result = synthesizeBatch(inventoryMap, materialId, sourceQuality, batchCount);

    if (result.success && result.targetQuality !== undefined) {
      // 更新实际库存
      const sourceItemId = `${materialId}${this.getQualitySuffix(sourceQuality)}`;
      const targetItemId = `${materialId}${this.getQualitySuffix(result.targetQuality)}`;

      // 消耗源材料
      this.inventory.removeItem(sourceItemId, result.totalConsumed);

      // 添加目标材料
      this.inventory.addItem(targetItemId, result.totalProduced);

      this.addLog('合成', result.message);
    }

    return result;
  }

  // 获取可合成的材料列表
  getSynthesizableMaterialsList(): ReturnType<typeof getSynthesizableMaterials> {
    // 创建库存映射
    const inventoryMap = new Map<string, number>();
    this.inventory.items.forEach(item => {
      inventoryMap.set(item.id, item.quantity);
    });

    return getSynthesizableMaterials(inventoryMap);
  }

  // 辅助方法：获取品质后缀
  private getQualitySuffix(quality: ArmorQuality): string {
    const suffixes: Record<ArmorQuality, string> = {
      [ArmorQuality.STARDUST]: '_stardust',
      [ArmorQuality.ALLOY]: '_alloy',
      [ArmorQuality.CRYSTAL]: '_crystal',
      [ArmorQuality.QUANTUM]: '_quantum',
      [ArmorQuality.VOID]: '_void',
    };
    return suffixes[quality] || '';
  }

  // 神话站台战斗
  private startMythologyBattle(mythLocation: any, isBoss: boolean, isElite: boolean): { success: boolean; message: string; enemy?: Enemy } {
    // 战斗消耗10体力
    const staminaCost = 10;

    // 检查体力
    if (this.player.stamina < staminaCost) {
      return { success: false, message: `体力不足（需要${staminaCost}点）` };
    }

    if (isBoss) {
      // 神明BOSS战
      const bossEnemy = Object.values(ENEMIES).find(e => e.name === mythLocation.bossName);
      if (!bossEnemy) {
        return { success: false, message: '神明数据不存在' };
      }
      const enemyInstance = createEnemyInstance(bossEnemy.id);
      if (!enemyInstance) {
        return { success: false, message: '创建神明失败' };
      }
      // 扣除体力
      this.player.consumeStamina(staminaCost);
      this.addLog('战斗', `👑 挑战神明 ${enemyInstance.name}！消耗${staminaCost}体力`);
      return { success: true, message: `👑 挑战神明 ${enemyInstance.name}！消耗${staminaCost}体力`, enemy: enemyInstance };
    }

    // 根据难度选择敌人类型
    const enemyTypes = isElite ? mythLocation.eliteEnemyTypes : mythLocation.enemyTypes;
    const enemyTier = isElite ? mythLocation.eliteEnemyTier : mythLocation.enemyTier;

    if (!enemyTypes || enemyTypes.length === 0) {
      return { success: false, message: '这个神话站台没有敌人' };
    }

    // 随机选择一个敌人类型
    const enemyName = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];

    // 创建敌人实例（使用神明站台的敌人配置）
    const enemyInstance = this.createMythologyEnemy(enemyName, enemyTier, mythLocation.baseEnemyLevel);
    if (!enemyInstance) {
      return { success: false, message: '创建神话敌人失败' };
    }

    // 扣除体力
    this.player.consumeStamina(staminaCost);
    const enemyTypeText = isElite ? '精英' : '';
    this.addLog('战斗', `遭遇了${enemyTypeText} ${enemyInstance.name}！消耗${staminaCost}体力`);
    return { success: true, message: `遭遇了${enemyTypeText} ${enemyInstance.name}！消耗${staminaCost}体力`, enemy: enemyInstance };
  }

  // 创建神话站台敌人
  private createMythologyEnemy(name: string, tier: string, baseLevel: number): Enemy | null {
    // 根据等级计算属性
    const stats = calculateEnemyStats(tier as any, baseLevel);

    const enemy: Enemy = {
      id: `myth_enemy_${Date.now()}`,
      name: name,
      hp: stats.hp,
      maxHp: stats.hp,
      attack: stats.attack,
      defense: stats.defense,
      speed: stats.speed || 10,
      expReward: stats.expReward || Math.floor(baseLevel * 10),
      lootTable: this.generateMythologyLoot(tier),
    };

    return enemy;
  }

  // 生成神话站台战利品
  private generateMythologyLoot(tier: string): { itemId: string; chance: number; name: string }[] {
    const lootTable: { itemId: string; chance: number; name: string }[] = [];

    // 基础掉落
    lootTable.push({ itemId: 'mat_myth_001', chance: 0.5, name: '神话碎片' });
    lootTable.push({ itemId: 'mat_myth_002', chance: 0.3, name: '神力结晶' });

    // 根据等级增加稀有掉落
    if (tier.includes('+')) {
      lootTable.push({ itemId: 'mat_myth_003', chance: 0.2, name: '古老卷轴' });
    }

    return lootTable;
  }

  // 玩家攻击
  playerAttack(enemy: Enemy): { damage: number; isCrit: boolean; enemyDefeated: boolean; logs: string[] } {
    const logs: string[] = [];

    // 计算伤害
    let damage = this.player.totalAttack;
    let isCrit = false;

    // 暴击判定 (基于敏捷)
    const critChance = Math.min(0.3, this.player.totalAgility * 0.01);
    if (Math.random() < critChance) {
      damage = Math.floor(damage * 1.5);
      isCrit = true;
      logs.push('暴击！');
    }

    // 防御减免
    damage = Math.max(1, damage - enemy.defense);

    // 应用伤害
    enemy.hp = Math.max(0, enemy.hp - damage);
    logs.push(`对 ${enemy.name} 造成 ${damage} 点伤害`);

    const enemyDefeated = enemy.hp <= 0;

    if (enemyDefeated) {
      logs.push(`击败了 ${enemy.name}！`);
    }

    return { damage, isCrit, enemyDefeated, logs };
  }

  // 敌人攻击
  enemyAttack(enemy: Enemy): { damage: number; playerDefeated: boolean; logs: string[] } {
    const logs: string[] = [];

    // 计算伤害
    let damage = enemy.attack;

    // 玩家防御减免
    damage = Math.max(1, damage - this.player.totalDefense);

    // 应用伤害
    this.player.takeDamage(damage);
    logs.push(`${enemy.name} 对你造成 ${damage} 点伤害`);

    const playerDefeated = this.player.isDead;

    if (playerDefeated) {
      logs.push('你被击败了！');
      this.isGameOver = true;
      // 战斗失败，体力归零
      this.player.stamina = 0;
    }

    return { damage, playerDefeated, logs };
  }

  // 结束战斗（胜利）
  endBattleVictory(enemy: Enemy): { exp: number; loot: { itemId: string; name: string; quantity: number }[]; logs: string[] } {
    const logs: string[] = [];
    const loot: { itemId: string; name: string; quantity: number }[] = [];

    // 获得经验
    const expGain = enemy.expReward;
    const levelUpLogs = this.player.addExp(expGain);
    logs.push(`获得 ${expGain} 经验值`);
    logs.push(...levelUpLogs);

    // 掉落制造材料 - 使用 mat_001~mat_010 带品质版本
    // 根据敌人类型决定掉落数量：普通3种，精英5种，BOSS7种
    const enemyType = (enemy as any).creatureType || (enemy as any).enemyType || 'normal';
    const enemyLevel = (enemy as any).level || 1;
    const planetId = (enemy as any).planetId || 'planet_alpha';

    // 联邦科技星映射（8个星球）
    const FEDERAL_TECH_STAR_ORDER = [
      'planet_alpha',   // 1: 阿尔法宜居星
      'planet_eta',     // 2: 伊塔农业星
      'planet_beta',    // 3: 贝塔工业星
      'planet_gamma',   // 4: 伽马研究星
      'planet_delta',   // 5: 德尔塔军事星
      'planet_epsilon', // 6: 艾普西隆贸易星
      'planet_zeta',    // 7: 泽塔能源星
      'planet_theta',   // 8: 西塔医疗星
    ];
    const planetIndex = FEDERAL_TECH_STAR_ORDER.indexOf(planetId) + 1 || 1;

    let materialDropCount = 3; // 默认普通敌人3种
    let materialDropMultiplier = 1; // 默认1份

    if (enemyType === 'elite') {
      materialDropCount = 5; // 精英5种
      materialDropMultiplier = 1;
    } else if (enemyType === 'boss') {
      materialDropCount = 7; // BOSS 7种
      materialDropMultiplier = 1;
    }

    // 材料品质后缀映射
    const QUALITY_SUFFIX: Record<ArmorQuality, string> = {
      [ArmorQuality.STARDUST]: '_stardust',
      [ArmorQuality.ALLOY]: '_alloy',
      [ArmorQuality.CRYSTAL]: '_crystal',
      [ArmorQuality.QUANTUM]: '_quantum',
      [ArmorQuality.VOID]: '_void',
    };

    // 基础掉落率配置（根据敌人类型）
    const BASE_DROP_RATES = {
      normal: {  // 普通敌人
        [ArmorQuality.STARDUST]: 0.40,
        [ArmorQuality.ALLOY]: 0.25,
        [ArmorQuality.CRYSTAL]: 0.20,
        [ArmorQuality.QUANTUM]: 0.10,
        [ArmorQuality.VOID]: 0.05,
      },
      elite: {  // 精英敌人
        [ArmorQuality.STARDUST]: 0.20,
        [ArmorQuality.ALLOY]: 0.30,
        [ArmorQuality.CRYSTAL]: 0.20,
        [ArmorQuality.QUANTUM]: 0.20,
        [ArmorQuality.VOID]: 0.10,
      },
      boss: {  // BOSS敌人
        [ArmorQuality.STARDUST]: 0.10,
        [ArmorQuality.ALLOY]: 0.20,
        [ArmorQuality.CRYSTAL]: 0.30,
        [ArmorQuality.QUANTUM]: 0.25,
        [ArmorQuality.VOID]: 0.15,
      },
    };

    // 星球对掉落率的影响（相对于基础概率的变化）
    // 星球2-6：星尘-2%、合金-2%、晶核-2%、量子+4%、虚空+2%
    // 星球7-8：星尘0%、合金-3%、晶核-3%、量子+4%、虚空+2%
    const PLANET_DROP_MODIFIERS: Record<number, Record<ArmorQuality, number>> = {
      1: { [ArmorQuality.STARDUST]: 0, [ArmorQuality.ALLOY]: 0, [ArmorQuality.CRYSTAL]: 0, [ArmorQuality.QUANTUM]: 0, [ArmorQuality.VOID]: 0 },
      2: { [ArmorQuality.STARDUST]: -0.02, [ArmorQuality.ALLOY]: -0.02, [ArmorQuality.CRYSTAL]: -0.02, [ArmorQuality.QUANTUM]: 0.04, [ArmorQuality.VOID]: 0.02 },
      3: { [ArmorQuality.STARDUST]: -0.04, [ArmorQuality.ALLOY]: -0.04, [ArmorQuality.CRYSTAL]: -0.04, [ArmorQuality.QUANTUM]: 0.08, [ArmorQuality.VOID]: 0.04 },
      4: { [ArmorQuality.STARDUST]: -0.06, [ArmorQuality.ALLOY]: -0.06, [ArmorQuality.CRYSTAL]: -0.06, [ArmorQuality.QUANTUM]: 0.12, [ArmorQuality.VOID]: 0.06 },
      5: { [ArmorQuality.STARDUST]: -0.08, [ArmorQuality.ALLOY]: -0.08, [ArmorQuality.CRYSTAL]: -0.08, [ArmorQuality.QUANTUM]: 0.16, [ArmorQuality.VOID]: 0.08 },
      6: { [ArmorQuality.STARDUST]: -0.10, [ArmorQuality.ALLOY]: -0.10, [ArmorQuality.CRYSTAL]: -0.10, [ArmorQuality.QUANTUM]: 0.20, [ArmorQuality.VOID]: 0.10 },
      7: { [ArmorQuality.STARDUST]: 0, [ArmorQuality.ALLOY]: -0.03, [ArmorQuality.CRYSTAL]: -0.03, [ArmorQuality.QUANTUM]: 0.04, [ArmorQuality.VOID]: 0.02 },
      8: { [ArmorQuality.STARDUST]: 0, [ArmorQuality.ALLOY]: -0.06, [ArmorQuality.CRYSTAL]: -0.06, [ArmorQuality.QUANTUM]: 0.08, [ArmorQuality.VOID]: 0.04 },
    };

    // 根据敌人类型和星球决定材料品质掉落概率
    const getBattleQualityRates = (type: string, planetIdx: number): Record<ArmorQuality, number> => {
      const baseRates = BASE_DROP_RATES[type as keyof typeof BASE_DROP_RATES] || BASE_DROP_RATES.normal;
      const modifiers = PLANET_DROP_MODIFIERS[planetIdx] || PLANET_DROP_MODIFIERS[1];

      // 应用星球修正
      const adjustedRates: Record<ArmorQuality, number> = {
        [ArmorQuality.STARDUST]: Math.max(0.01, Math.min(0.95, baseRates[ArmorQuality.STARDUST] + modifiers[ArmorQuality.STARDUST])),
        [ArmorQuality.ALLOY]: Math.max(0.01, Math.min(0.95, baseRates[ArmorQuality.ALLOY] + modifiers[ArmorQuality.ALLOY])),
        [ArmorQuality.CRYSTAL]: Math.max(0.01, Math.min(0.95, baseRates[ArmorQuality.CRYSTAL] + modifiers[ArmorQuality.CRYSTAL])),
        [ArmorQuality.QUANTUM]: Math.max(0.01, Math.min(0.95, baseRates[ArmorQuality.QUANTUM] + modifiers[ArmorQuality.QUANTUM])),
        [ArmorQuality.VOID]: Math.max(0.01, Math.min(0.95, baseRates[ArmorQuality.VOID] + modifiers[ArmorQuality.VOID])),
      };

      return adjustedRates;
    };

    // 随机决定材料品质
    const rollMaterialQuality = (type: string, planetIdx: number): ArmorQuality => {
      const rates = getBattleQualityRates(type, planetIdx);
      const roll = Math.random();
      let cumulative = 0;

      for (const [quality, rate] of Object.entries(rates)) {
        cumulative += rate;
        if (roll <= cumulative) {
          return Number(quality) as ArmorQuality;
        }
      }
      return ArmorQuality.STARDUST;
    };

    // 新的材料ID列表 (mat_001~mat_010) - 纳米战甲制造材料
    // 权重基于战甲配方总需求量：需求量越高，掉落率越高
    const NEW_MATERIAL_IDS = [
      { id: 'mat_001', name: '星铁基础构件', weight: 47 },    // 总需求47
      { id: 'mat_002', name: '星铜传导组件', weight: 36 },    // 总需求36
      { id: 'mat_003', name: '钛钢外甲坯料', weight: 20 },    // 总需求20
      { id: 'mat_004', name: '战甲能量晶核', weight: 7 },     // 总需求7
      { id: 'mat_005', name: '稀土传感基质', weight: 3 },     // 总需求3
      { id: 'mat_006', name: '虚空防护核心', weight: 4 },     // 总需求4
      { id: 'mat_007', name: '推进模块燃料', weight: 11 },    // 总需求11
      { id: 'mat_008', name: '纳米韧化纤维', weight: 28 },    // 总需求28
      { id: 'mat_009', name: '陨铁缓冲衬垫', weight: 9 },     // 总需求9
      { id: 'mat_010', name: '量子紧固组件', weight: 13 },    // 总需求13
    ];

    // 加权随机选择材料类型
    const selectedMaterials: typeof NEW_MATERIAL_IDS = [];
    const totalWeight = NEW_MATERIAL_IDS.reduce((sum, m) => sum + m.weight, 0);

    while (selectedMaterials.length < materialDropCount) {
      let random = Math.random() * totalWeight;
      for (const material of NEW_MATERIAL_IDS) {
        random -= material.weight;
        if (random <= 0 && !selectedMaterials.find(m => m.id === material.id)) {
          selectedMaterials.push(material);
          break;
        }
      }
    }

    // 掉落材料（带品质）
    selectedMaterials.forEach(material => {
      for (let i = 0; i < materialDropMultiplier; i++) {
        // 根据敌人类型和星球决定品质
        const quality = rollMaterialQuality(enemyType, planetIndex);
        const qualitySuffix = QUALITY_SUFFIX[quality];
        const qualityId = `${material.id}${qualitySuffix}`;
        const qualityName = ARMOR_QUALITY_NAMES[quality];
        const displayName = `${qualityName}${material.name}`;

        // 添加到背包
        if (this.inventory.addItem(qualityId, 1)) {
          loot.push({ itemId: qualityId, name: displayName, quantity: 1 });
          logs.push(`获得 ${displayName}`);
        }
      }
    });

    // 掉落强化石 - 根据敌人类型：普通1、精英3、boss5
    const enhanceStoneCount = enemyType === 'boss' ? 5 : enemyType === 'elite' ? 3 : 1;
    const enhanceStoneId = 'mat_enhance_stone';
    const enhanceStoneTemplate = getItemTemplate(enhanceStoneId);
    if (enhanceStoneTemplate && this.inventory.addItem(enhanceStoneId, enhanceStoneCount)) {
      loot.push({ itemId: enhanceStoneId, name: enhanceStoneTemplate.name, quantity: enhanceStoneCount });
      logs.push(`获得 ${enhanceStoneTemplate.name}x${enhanceStoneCount}`);
    }

    // 更新任务进度
    this.updateQuestProgress(QuestConditionType.KILL_ENEMY, enemy.id, 1);
    this.updateQuestProgress(QuestConditionType.KILL_ENEMY, 'any', 1);

    this.addLog('战斗胜利', `击败${enemy.name}，获得${expGain}经验`);

    return { exp: expGain, loot, logs };
  }

  // 逃跑 - 固定50%成功率
  attemptEscape(enemy: Enemy): { success: boolean; message: string; logs: string[] } {
    const logs: string[] = [];

    // 逃跑成功率固定50%
    const success = Math.random() < 0.5;

    if (success) {
      // 逃跑成功消耗10体力
      const staminaCost = 10;
      this.player.consumeStamina(staminaCost);
      logs.push(`成功逃脱！消耗${staminaCost}体力`);
      this.addLog('战斗', `从战斗中逃脱，消耗${staminaCost}体力`);
      return { success: true, message: `成功逃脱！消耗${staminaCost}体力`, logs };
    } else {
      logs.push('逃跑失败！');
      // 敌人获得一次攻击机会
      const attackResult = this.enemyAttack(enemy);
      logs.push(...attackResult.logs);
      return { success: false, message: '逃跑失败！', logs };
    }
  }

  // ========== 装备强化系统 ==========

  // 获取强化预览
  getEnhancePreview(itemId: string): EnhancePreview {
    // 先在已装备的装备中查找（player.equipment 是 Map）
    let equipmentInstance: EquipmentInstance | undefined;
    for (const [, equip] of this.player.equipment) {
      if (equip.instanceId === itemId) {
        equipmentInstance = equip;
        break;
      }
    }

    // 如果没找到，在背包的装备中查找
    if (!equipmentInstance) {
      equipmentInstance = this.inventory.equipment.find(e => e.instanceId === itemId);
    }

    let item: InventoryItem | null = null;

    if (equipmentInstance) {
      // 将装备转换为 InventoryItem 格式
      let mappedType: ItemType;
      switch (equipmentInstance.slot) {
        case EquipmentSlot.WEAPON:
          mappedType = ItemType.WEAPON;
          break;
        case EquipmentSlot.ACCESSORY:
          mappedType = ItemType.ACCESSORY;
          break;
        default:
          mappedType = ItemType.ARMOR;
      }
      item = {
        id: equipmentInstance.instanceId,
        name: equipmentInstance.name,
        type: mappedType,
        rarity: equipmentInstance.rarity,
        description: equipmentInstance.description,
        enhanceLevel: equipmentInstance.enhanceLevel,
        quantity: 1,
      } as InventoryItem;
    } else {
      // 在普通物品中查找
      item = this.inventory.getItem(itemId);
    }

    if (!item) {
      return {
        canEnhance: false,
        reason: '物品不存在',
        currentLevel: 0,
        targetLevel: 0,
        successRate: 0,
        stoneCost: 0,
        hasEnoughStones: false,
        goldCost: 0,
        hasEnoughGold: false,
        failureDowngrade: false,
        attributePreview: {
          attack: { current: 0, after: 0 },
          defense: { current: 0, after: 0 },
          speed: { current: 0, after: 0 },
          maxHp: { current: 0, after: 0 },
        },
      };
    }

    if (!canEnhance(item)) {
      return {
        canEnhance: false,
        reason: '该物品无法强化',
        currentLevel: item.enhanceLevel || 0,
        targetLevel: 0,
        successRate: 0,
        stoneCost: 0,
        hasEnoughStones: false,
        goldCost: 0,
        hasEnoughGold: false,
        failureDowngrade: false,
        attributePreview: {
          attack: { current: 0, after: 0 },
          defense: { current: 0, after: 0 },
          speed: { current: 0, after: 0 },
          maxHp: { current: 0, after: 0 },
        },
      };
    }

    const currentLevel = item.enhanceLevel || 0;
    const targetLevel = currentLevel + 1;
    const config = ENHANCE_CONFIG[currentLevel];

    if (!config) {
      return {
        canEnhance: false,
        reason: '已达到最大强化等级',
        currentLevel,
        targetLevel: 0,
        successRate: 0,
        stoneCost: 0,
        hasEnoughStones: false,
        goldCost: 0,
        hasEnoughGold: false,
        failureDowngrade: false,
        attributePreview: {
          attack: { current: 0, after: 0 },
          defense: { current: 0, after: 0 },
          speed: { current: 0, after: 0 },
          maxHp: { current: 0, after: 0 },
        },
      };
    }

    // 检查强化石数量
    const stoneItem = this.inventory.getItem(ENHANCE_STONE_ID);
    const hasEnoughStones = (stoneItem?.quantity || 0) >= config.stoneCost;

    // equipmentInstance 已经在前面查找过了
    let attributePreview = {
      attack: { current: 0, after: 0 },
      defense: { current: 0, after: 0 },
      speed: { current: 0, after: 0 },
      maxHp: { current: 0, after: 0 },
      dodge: { current: 0, after: 0 },
      hit: { current: 0, after: 0 },
    };

    if (equipmentInstance) {
      // 使用新的装备属性计算器（实时根据强化等级计算）
      const currentStats = calculateEquipmentStats(equipmentInstance);
      const afterStats = calculateEnhancedStatsPreview(equipmentInstance, targetLevel);

      attributePreview = {
        attack: { current: currentStats.attack, after: afterStats.attack },
        defense: { current: currentStats.defense, after: afterStats.defense },
        speed: { current: Math.round(currentStats.speed * 100) / 100, after: Math.round(afterStats.speed * 100) / 100 },
        maxHp: { current: currentStats.hp, after: afterStats.hp },
        dodge: { current: currentStats.dodge, after: afterStats.dodge },
        hit: { current: currentStats.hit, after: afterStats.hit },
      };
    }

    return {
      canEnhance: hasEnoughStones,
      reason: !hasEnoughStones ? '强化石不足' : undefined,
      currentLevel,
      targetLevel,
      successRate: config.successRate,
      stoneCost: config.stoneCost,
      hasEnoughStones,
      goldCost: 0,
      hasEnoughGold: true,
      failureDowngrade: config.failureDowngrade,
      attributePreview,
    };
  }

  // 强化装备
  enhanceItem(itemId: string, useProtection: boolean = false): EnhanceResult {
    // 先在已装备的装备中查找（player.equipment 是 Map）
    let item: InventoryItem | null = null;
    let isMythEquipment = false;
    let mythEquipmentIndex = -1;
    let isEquippedEquipment = false;
    let equippedSlot: EquipmentSlot | null = null;

    for (const [slot, equip] of this.player.equipment) {
      if (equip.instanceId === itemId) {
        equippedSlot = slot;
        isEquippedEquipment = true;
        // 将已装备转换为 InventoryItem 格式
        let mappedType: ItemType;
        switch (equip.slot) {
          case EquipmentSlot.WEAPON:
            mappedType = ItemType.WEAPON;
            break;
          case EquipmentSlot.ACCESSORY:
            mappedType = ItemType.ACCESSORY;
            break;
          default:
            mappedType = ItemType.ARMOR;
        }
        item = {
          id: equip.instanceId,
          name: equip.name,
          type: mappedType,
          rarity: equip.rarity,
          description: equip.description,
          enhanceLevel: equip.enhanceLevel,
          quantity: 1,
        } as InventoryItem;
        break;
      }
    }

    // 如果没找到，在背包的装备中查找
    if (!item) {
      mythEquipmentIndex = this.inventory.equipment.findIndex(e => e.instanceId === itemId);
      if (mythEquipmentIndex !== -1) {
        const mythEquipment = this.inventory.equipment[mythEquipmentIndex];
        isMythEquipment = true;
        // 将神话装备转换为 InventoryItem 格式
        let mappedType: ItemType;
        switch (mythEquipment.slot) {
          case EquipmentSlot.WEAPON:
            mappedType = ItemType.WEAPON;
            break;
          case EquipmentSlot.ACCESSORY:
            mappedType = ItemType.ACCESSORY;
            break;
          default:
            mappedType = ItemType.ARMOR;
        }
        item = {
          id: mythEquipment.instanceId,
          name: mythEquipment.name,
          type: mappedType,
          rarity: mythEquipment.rarity,
          description: mythEquipment.description,
          enhanceLevel: mythEquipment.enhanceLevel,
          quantity: 1,
        } as InventoryItem;
      }
    }

    // 如果没找到，在普通物品中查找
    if (!item) {
      item = this.inventory.getItem(itemId);
    }

    if (!item) {
      return {
        type: EnhanceResultType.FAILURE,
        success: false,
        message: '物品不存在',
        previousLevel: 0,
        currentLevel: 0,
        consumedMaterials: [],
        consumedGold: 0,
        usedProtection: false,
      };
    }

    if (!canEnhance(item)) {
      return {
        type: EnhanceResultType.FAILURE,
        success: false,
        message: '该物品无法强化',
        previousLevel: item.enhanceLevel || 0,
        currentLevel: item.enhanceLevel || 0,
        consumedMaterials: [],
        consumedGold: 0,
        usedProtection: false,
      };
    }

    const currentLevel = item.enhanceLevel || 0;
    const config = ENHANCE_CONFIG[currentLevel];

    if (!config) {
      return {
        type: EnhanceResultType.FAILURE,
        success: false,
        message: '已达到最大强化等级',
        previousLevel: currentLevel,
        currentLevel,
        consumedMaterials: [],
        consumedGold: 0,
        usedProtection: false,
      };
    }

    // 检查金币
    if (this.trainCoins < config.goldCost) {
      return {
        type: EnhanceResultType.FAILURE,
        success: false,
        message: `列车币不足（需要${config.goldCost}）`,
        previousLevel: currentLevel,
        currentLevel,
        consumedMaterials: [],
        consumedGold: 0,
        usedProtection: false,
      };
    }

    // 检查强化石
    if (!this.inventory.hasItem(ENHANCE_STONE_ID, config.stoneCost)) {
      return {
        type: EnhanceResultType.FAILURE,
        success: false,
        message: `强化石不足（需要${config.stoneCost}个）`,
        previousLevel: currentLevel,
        currentLevel,
        consumedMaterials: [],
        consumedGold: 0,
        usedProtection: false,
      };
    }

    // 检查保护符
    if (useProtection && !this.inventory.hasItem(PROTECTION_ITEM_ID, 1)) {
      return {
        type: EnhanceResultType.FAILURE,
        success: false,
        message: '没有强化保护符',
        previousLevel: currentLevel,
        currentLevel,
        consumedMaterials: [],
        consumedGold: 0,
        usedProtection: false,
      };
    }

    // 消耗材料和金币
    this.trainCoins -= config.goldCost;

    // 消耗强化石
    this.inventory.removeItem(ENHANCE_STONE_ID, config.stoneCost);
    const consumedMaterials = [{
      materialId: ENHANCE_STONE_ID,
      name: ENHANCE_MATERIAL_NAMES[ENHANCE_STONE_ID] || '强化石',
      quantity: config.stoneCost,
    }];

    // 消耗保护符
    if (useProtection) {
      this.inventory.removeItem(PROTECTION_ITEM_ID, 1);
    }

    // 判定成功/失败
    const success = Math.random() < config.successRate;

    // 获取装备实例（用于计算属性变化）
    let equipmentInstance: EquipmentInstance | undefined;
    if (isEquippedEquipment && equippedSlot) {
      equipmentInstance = this.player.equipment.get(equippedSlot);
    } else if (isMythEquipment && mythEquipmentIndex !== -1) {
      equipmentInstance = this.inventory.equipment[mythEquipmentIndex];
    }

    if (success) {
      // 强化成功
      const newLevel = currentLevel + 1;

      // 计算属性增益（使用新的计算器）
      let attributeGains = { attack: 0, defense: 0, speed: 0, maxHp: 0, dodge: 0, hit: 0 };
      if (equipmentInstance) {
        const currentStats = calculateEquipmentStats(equipmentInstance);
        const afterStats = calculateEnhancedStatsPreview(equipmentInstance, newLevel);
        attributeGains = {
          attack: afterStats.attack - currentStats.attack,
          defense: afterStats.defense - currentStats.defense,
          speed: afterStats.speed - currentStats.speed,
          maxHp: afterStats.hp - currentStats.hp,
          dodge: afterStats.dodge - currentStats.dodge,
          hit: afterStats.hit - currentStats.hit,
        };
      }

      // 处理已装备装备 - 只更新等级，不修改 stats
      if (isEquippedEquipment && equippedSlot && equipmentInstance) {
        equipmentInstance.enhanceLevel = newLevel;
        this.addLog('强化', `${item.name}强化成功！达到+${newLevel}`);

        return {
          type: EnhanceResultType.SUCCESS,
          success: true,
          message: `强化成功！${item.name}达到+${newLevel}`,
          previousLevel: currentLevel,
          currentLevel: newLevel,
          consumedMaterials,
          consumedGold: config.goldCost,
          usedProtection: useProtection,
          attributeGains,
        };
      }
      // 处理背包装备 - 只更新等级，不修改 stats
      else if (isMythEquipment && mythEquipmentIndex !== -1 && equipmentInstance) {
        equipmentInstance.enhanceLevel = newLevel;
        this.addLog('强化', `${item.name}强化成功！达到+${newLevel}`);

        return {
          type: EnhanceResultType.SUCCESS,
          success: true,
          message: `强化成功！${item.name}达到+${newLevel}`,
          previousLevel: currentLevel,
          currentLevel: newLevel,
          consumedMaterials,
          consumedGold: config.goldCost,
          usedProtection: useProtection,
          attributeGains,
        };
      } else if (item) {
        // 普通装备，更新 items 数组中的数据
        const normalItem = this.inventory.items.find(i => i.id === itemId);
        if (normalItem) {
          normalItem.enhanceLevel = newLevel;
        }

        this.addLog('强化', `${item.name}强化成功！达到+${newLevel}`);

        return {
          type: EnhanceResultType.SUCCESS,
          success: true,
          message: `强化成功！${item.name}达到+${newLevel}`,
          previousLevel: currentLevel,
          currentLevel: newLevel,
          consumedMaterials,
          consumedGold: config.goldCost,
          usedProtection: useProtection,
          attributeGains: { attack: 0, defense: 0, speed: 0, maxHp: 0, dodge: 0, hit: 0 },
        };
      }
    } else {
      // 强化失败
      if (config.failureDowngrade && !useProtection) {
        // 降级
        const newLevel = Math.max(0, currentLevel - 1);

        // 处理已装备装备降级 - 只更新等级
        if (isEquippedEquipment && equippedSlot && equipmentInstance) {
          equipmentInstance.enhanceLevel = newLevel;
        }
        // 处理背包装备降级 - 只更新等级
        else if (isMythEquipment && mythEquipmentIndex !== -1 && equipmentInstance) {
          equipmentInstance.enhanceLevel = newLevel;
        } else if (item) {
          // 普通装备，更新 items 数组中的数据
          const normalItem = this.inventory.items.find(i => i.id === itemId);
          if (normalItem) {
            normalItem.enhanceLevel = newLevel;
          }
        }

        this.addLog('强化', `${item.name}强化失败，等级下降至+${newLevel}`);

        return {
          type: EnhanceResultType.FAILURE_DOWNGRADE,
          success: false,
          message: `强化失败！${item.name}等级下降至+${newLevel}`,
          previousLevel: currentLevel,
          currentLevel: newLevel,
          consumedMaterials,
          consumedGold: config.goldCost,
          usedProtection: false,
        };
      } else {
        this.addLog('强化', `${item.name}强化失败`);

        return {
          type: useProtection ? EnhanceResultType.FAILURE : EnhanceResultType.FAILURE,
          success: false,
          message: useProtection ? `强化失败，但保护符防止了等级下降` : `强化失败！`,
          previousLevel: currentLevel,
          currentLevel,
          consumedMaterials,
          consumedGold: config.goldCost,
          usedProtection: useProtection,
        };
      }
    }

    // 默认返回（不应该到达这里）
    return {
      type: EnhanceResultType.FAILURE,
      success: false,
      message: '强化处理异常',
      previousLevel: currentLevel,
      currentLevel,
      consumedMaterials,
      consumedGold: 0,
      usedProtection: false,
    };
  }

  // ==================== 神话装备系统 ====================

  // 装备神话装备
  equipMythologyItem(equipmentId: string, slot: import('../data/equipmentTypes').EquipmentSlot): { success: boolean; message: string } {
    const template = getEquipmentById(equipmentId);

    if (!template) {
      return { success: false, message: '装备不存在' };
    }

    // 创建装备实例
    const instance = createEquipmentInstance(equipmentId);
    if (!instance) {
      return { success: false, message: '创建装备失败' };
    }

    // 装备到指定槽位
    this.player.equipMythologyItem(instance);

    this.addLog('装备', `装备了 ${instance.name}`);
    return { success: true, message: `成功装备 ${instance.name}` };
  }

  // 卸下神话装备
  unequipMythologyItem(slot: import('../data/equipmentTypes').EquipmentSlot): { success: boolean; message: string } {
    const item = this.player.unequipMythologyItem(slot);

    if (item) {
      this.addLog('装备', `卸下了 ${item.name}`);
      return { success: true, message: `成功卸下 ${item.name}` };
    }

    return { success: false, message: '该槽位没有装备' };
  }

  // 强化神话装备
  enhanceMythologyEquipment(slot: import('../data/equipmentTypes').EquipmentSlot, useProtection: boolean = false): EnhanceResult {
    const equipment = this.player.getEquipmentBySlot(slot);

    if (!equipment) {
      return {
        type: EnhanceResultType.FAILURE,
        success: false,
        message: '该槽位没有装备',
        previousLevel: 0,
        currentLevel: 0,
        consumedMaterials: [],
        consumedGold: 0,
        usedProtection: false,
      };
    }

    const currentLevel = equipment.enhanceLevel || 0;
    const config = ENHANCE_CONFIG[currentLevel];

    if (!config) {
      return {
        type: EnhanceResultType.FAILURE,
        success: false,
        message: '已达到最大强化等级',
        previousLevel: currentLevel,
        currentLevel,
        consumedMaterials: [],
        consumedGold: 0,
        usedProtection: false,
      };
    }

    // 检查金币
    if (this.trainCoins < config.goldCost) {
      return {
        type: EnhanceResultType.FAILURE,
        success: false,
        message: `列车币不足（需要${config.goldCost}）`,
        previousLevel: currentLevel,
        currentLevel,
        consumedMaterials: [],
        consumedGold: 0,
        usedProtection: false,
      };
    }

    // 检查强化石
    if (!this.inventory.hasItem(ENHANCE_STONE_ID, config.stoneCost)) {
      return {
        type: EnhanceResultType.FAILURE,
        success: false,
        message: `强化石不足（需要${config.stoneCost}个）`,
        previousLevel: currentLevel,
        currentLevel,
        consumedMaterials: [],
        consumedGold: 0,
        usedProtection: false,
      };
    }

    // 检查保护符
    if (useProtection && !this.inventory.hasItem(PROTECTION_ITEM_ID, 1)) {
      return {
        type: EnhanceResultType.FAILURE,
        success: false,
        message: '没有强化保护符',
        previousLevel: currentLevel,
        currentLevel,
        consumedMaterials: [],
        consumedGold: 0,
        usedProtection: false,
      };
    }

    // 消耗材料和金币
    this.trainCoins -= config.goldCost;

    // 消耗强化石
    this.inventory.removeItem(ENHANCE_STONE_ID, config.stoneCost);
    const consumedMaterials = [{
      materialId: ENHANCE_STONE_ID,
      name: ENHANCE_MATERIAL_NAMES[ENHANCE_STONE_ID] || '强化石',
      quantity: config.stoneCost,
    }];

    // 消耗保护符
    if (useProtection) {
      this.inventory.removeItem(PROTECTION_ITEM_ID, 1);
    }

    // 判定成功/失败
    const success = Math.random() < config.successRate;

    if (success) {
      // 强化成功
      equipment.enhanceLevel = currentLevel + 1;

      // 计算属性提升
      const attributeGains = {
        attack: config.attackBonus,
        defense: config.defenseBonus,
        speed: config.speedBonus,
        maxHp: config.maxHpBonus,
      };

      this.addLog('强化', `${equipment.name}强化成功！达到+${equipment.enhanceLevel}`);

      return {
        type: EnhanceResultType.SUCCESS,
        success: true,
        message: `强化成功！${equipment.name}达到+${equipment.enhanceLevel}`,
        previousLevel: currentLevel,
        currentLevel: equipment.enhanceLevel,
        consumedMaterials,
        consumedGold: config.goldCost,
        usedProtection: useProtection,
        attributeGains,
      };
    } else {
      // 强化失败
      if (config.failureDowngrade && !useProtection) {
        // 降级
        equipment.enhanceLevel = Math.max(0, currentLevel - 1);
        this.addLog('强化', `${equipment.name}强化失败，等级下降至+${equipment.enhanceLevel}`);

        return {
          type: EnhanceResultType.FAILURE_DOWNGRADE,
          success: false,
          message: `强化失败！等级下降至+${equipment.enhanceLevel}`,
          previousLevel: currentLevel,
          currentLevel: equipment.enhanceLevel,
          consumedMaterials,
          consumedGold: config.goldCost,
          usedProtection: false,
        };
      } else {
        this.addLog('强化', `${equipment.name}强化失败`);

        return {
          type: useProtection ? EnhanceResultType.FAILURE : EnhanceResultType.FAILURE,
          success: false,
          message: useProtection ? `强化失败，但保护符防止了等级下降` : `强化失败！`,
          previousLevel: currentLevel,
          currentLevel,
          consumedMaterials,
          consumedGold: config.goldCost,
          usedProtection: useProtection,
        };
      }
    }
  }

  // 升华神话装备
  sublimateMythologyEquipment(slot: import('../data/equipmentTypes').EquipmentSlot): { success: boolean; message: string; newLevel?: number } {
    const equipment = this.player.getEquipmentBySlot(slot);

    if (!equipment) {
      return { success: false, message: '该槽位没有装备' };
    }

    const cost = Math.floor(500 * Math.pow(2, equipment.sublimationLevel));

    if (this.trainCoins < cost) {
      return { success: false, message: `列车币不足（需要${cost}）` };
    }

    const successRate = equipmentSystem.getSublimationSuccessRate(equipment.sublimationLevel);
    const success = Math.random() < successRate;

    this.trainCoins -= cost;
    const updated = equipmentSystem.sublimateEquipment(equipment, success);
    this.player.equipMythologyItem(updated);

    if (success) {
      this.addLog('升华', `${equipment.name} 升华成功！达到 升华+${updated.sublimationLevel}`);
      return { success: true, message: `升华成功！${equipment.name} 达到 升华+${updated.sublimationLevel}`, newLevel: updated.sublimationLevel };
    } else {
      this.addLog('升华', `${equipment.name} 升华失败`);
      return { success: false, message: '升华失败，装备未提升' };
    }
  }
}
