import { Player, type PlayerData } from './Player';
import { Inventory } from './Inventory';
import { Train, type TrainData } from './Train';
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
import { TrainUpgradeType } from './Train';
import {
  getTrainUpgradeInfo,
  getUpgradeCoinCost,
  getUpgradeMaterials,
  FACILITY_NAMES,
} from '../data/trainUpgrades';
import { AutoCollectSystem } from './AutoCollectSystem';
import { AutoCollectMode, CollectReward, getCollectRobot } from '../data/autoCollectTypes';
import { synthesize, synthesizeBatch, getSynthesizableMaterials, QUALITY_NAMES } from './MaterialSynthesisSystem';

export interface GameState {
  player: PlayerData;
  inventory: { items: InventoryItem[]; equipment: EquipmentInstance[] } | InventoryItem[];
  train: TrainData;
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
}

export class GameManager {
  player: Player;
  inventory: Inventory;
  train: Train;
  day: number;
  time: 'day' | 'night';
  currentLocation: string;
  gameTime: number;
  logs: string[];
  isGameOver: boolean;
  trainCoins: number;
  playerName: string;

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

  // 自动采集系统
  autoCollectSystem: AutoCollectSystem = new AutoCollectSystem();

  constructor() {
    this.player = new Player();
    this.inventory = new Inventory();
    this.train = new Train();
    this.day = 1;
    this.time = 'day';
    this.currentLocation = 'loc_001';
    this.gameTime = 480; // 从早上8点开始
    this.logs = [];
    this.isGameOver = false;
    this.trainCoins = 100000; // 测试：10万列车币
    this.playerName = '幸存者';

    this.initQuests();
    this.initShop();
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
    this.train = new Train();
    this.day = 1;
    this.time = 'day';
    this.currentLocation = 'loc_001';
    this.gameTime = 480;
    this.logs = [];
    this.isGameOver = false;
    this.trainCoins = 100000; // 测试：10万列车币

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

  // 修复列车
  repairTrain(): { success: boolean; message: string } {
    if (this.train.durability >= this.train.maxDurability) {
      return { success: false, message: '列车不需要修复' };
    }

    // 检查材料 - 使用星尘级材料
    const material = this.inventory.getItem('mat_001_stardust');
    if (!material || material.quantity < 2) {
      return { success: false, message: '材料不足（需要2个星铁基础构件(星尘)）' };
    }

    this.inventory.removeItem('mat_001_stardust', 2);
    const repairAmount = 20;
    this.train.durability = Math.min(this.train.maxDurability, this.train.durability + repairAmount);

    this.updateQuestProgress(QuestConditionType.REPAIR_TRAIN, 'train', 1);
    this.addLog('修复', `修复了列车，耐久恢复${repairAmount}`);

    return {
      success: true,
      message: `修复成功！列车耐久：${this.train.durability}/${this.train.maxDurability}`,
    };
  }

  // 升级列车 - 消耗材料+列车币
  upgradeTrain(type: TrainUpgradeType): { success: boolean; message: string } {
    const upgradeInfo = getTrainUpgradeInfo(type, this.getCurrentLevel(type));
    const { coinCost, materials, name } = upgradeInfo;

    // 检查列车币
    if (this.trainCoins < coinCost) {
      return { success: false, message: `列车币不足（需要${coinCost}）` };
    }

    // 检查材料
    for (const mat of materials) {
      const hasItem = this.inventory.items.find(item => item.id === mat.itemId);
      const hasQuantity = hasItem?.quantity ?? 0;
      if (hasQuantity < mat.quantity) {
        return {
          success: false,
          message: `材料不足：${mat.name}（需要${mat.quantity}，拥有${hasQuantity}）`,
        };
      }
    }

    // 扣除列车币
    this.trainCoins -= coinCost;

    // 扣除材料
    for (const mat of materials) {
      this.inventory.removeItem(mat.itemId, mat.quantity);
    }

    // 执行升级
    this.train.upgrade(type);

    // 构建消耗信息
    const materialStr = materials.map(m => `${m.name}x${m.quantity}`).join('、');
    this.addLog(
      '列车升级',
      `成功升级${name}，消耗${coinCost}列车币和${materialStr}`
    );

    return {
      success: true,
      message: `升级成功！${name}已提升`,
    };
  }

  // 获取当前升级等级
  private getCurrentLevel(type: TrainUpgradeType): number {
    switch (type) {
      case TrainUpgradeType.CAPACITY:
        return this.train.capacityLevel;
      case TrainUpgradeType.ARMOR:
        return this.train.armorLevel;
      case TrainUpgradeType.SPEED:
        return this.train.speedLevel;
      case TrainUpgradeType.FACILITY:
        return this.train.facilityLevel;
      default:
        return 0;
    }
  }

  // 获取列车升级信息（供UI使用）
  getTrainUpgradeDetails(type: TrainUpgradeType) {
    const currentLevel = this.getCurrentLevel(type);
    const upgradeInfo = getTrainUpgradeInfo(type, currentLevel);

    // 检查材料是否足够
    const materialsStatus = upgradeInfo.materials.map(mat => {
      const hasItem = this.inventory.items.find(item => item.id === mat.itemId);
      const hasQuantity = hasItem?.quantity ?? 0;
      return {
        ...mat,
        hasQuantity,
        isEnough: hasQuantity >= mat.quantity,
      };
    });

    const canAffordCoins = this.trainCoins >= upgradeInfo.coinCost;
    const canAffordMaterials = materialsStatus.every(m => m.isEnough);

    return {
      ...upgradeInfo,
      currentLevel,
      materialsStatus,
      canAffordCoins,
      canAffordMaterials,
      canUpgrade: canAffordCoins && canAffordMaterials,
    };
  }

  // 添加列车币
  addTrainCoins(amount: number, source: string = ''): void {
    this.trainCoins += amount;
    if (source) {
      this.addLog('获得列车币', `从${source}获得了 ${amount} 列车币`);
    } else {
      this.addLog('获得列车币', `获得了 ${amount} 列车币`);
    }
  }

  // 消费列车币
  consumeTrainCoins(amount: number): boolean {
    if (this.trainCoins < amount) return false;
    this.trainCoins -= amount;
    return true;
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

    // 百分比恢复（基于最大值的百分比）
    const hpRecoveryPercent = 0.30;    // 恢复30%最大生命值
    const staminaRecoveryPercent = 0.50; // 恢复50%最大体力值

    const hpRecovery = Math.floor(this.player.totalMaxHp * hpRecoveryPercent);
    const staminaRecovery = Math.floor(this.player.maxStamina * staminaRecoveryPercent);

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

    logs.push(`恢复 ${hpRestored} 生命 (${Math.floor(hpRecoveryPercent * 100)}%)`);
    logs.push(`恢复 ${staminaRestored} 体力 (${Math.floor(staminaRecoveryPercent * 100)}%)`);
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

    // 列车可能受到环境伤害
    if (Math.random() < dangerLevel * 0.05) {
      const damage = Math.floor(Math.random() * 6) + 5;
      this.train.durability = Math.max(0, this.train.durability - damage);
      logs.push(`列车在恶劣环境中受到${damage}点损伤！`);
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

  // 保存游戏
  saveGame(): GameState {
    return {
      player: this.player.serialize(),
      inventory: this.inventory.serialize(),
      train: this.train.serialize(),
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

    this.train = new Train(state.train);
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
    this.train = new Train();
    this.day = 1;
    this.time = 'day';
    this.currentLocation = 'loc_001';
    this.gameTime = 480;
    this.logs = [];
    this.isGameOver = false;
    this.trainCoins = 100000;
    this.playerName = '幸存者';
    this.lastShopRefreshDay = 1;

    this.quests.clear();
    this.shopItems.clear();
    this.locationProgress.clear();

    this.initQuests();
    this.initShop();

    // 重置自动采集系统
    this.autoCollectSystem.reset();
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
    const result = this.autoCollectSystem.stopCollect();
    if (result.success && result.rewards) {
      this.applyCollectRewards(result.rewards);
      this.addLog('自动采集', `停止采集，获得 ${result.rewards.gold} 信用点、${result.rewards.exp} 经验值`);
    }
    return result;
  }

  // 领取采集收益（不停止）
  claimAutoCollectRewards(): { success: boolean; message: string; rewards?: CollectReward } {
    const result = this.autoCollectSystem.claimRewards();
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
    return this.autoCollectSystem.getEstimatedHourlyRewards();
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
      // 记录挑战日期（失败不扣除次数，所以在这里记录）
      this.recordBossChallenge(planetId);
      this.addLog('战斗', `💀 挑战虚空首领 ${enemyInstance.name}！`);
      return { success: true, message: `💀 挑战虚空首领 ${enemyInstance.name}！`, enemy: enemyInstance };
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
      this.addLog('战斗', `👾 遭遇了精英 ${enemyInstance.name}！`);
      return { success: true, message: `👾 遭遇了精英 ${enemyInstance.name}！`, enemy: enemyInstance };
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

    this.addLog('战斗', `👾 遭遇了 ${enemyInstance.name}！`);
    return { success: true, message: `👾 遭遇了 ${enemyInstance.name}！`, enemy: enemyInstance };
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
      this.addLog('战斗', `👑 挑战神明 ${enemyInstance.name}！`);
      return { success: true, message: `👑 挑战神明 ${enemyInstance.name}！`, enemy: enemyInstance };
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

    const enemyTypeText = isElite ? '精英' : '';
    this.addLog('战斗', `遭遇了${enemyTypeText} ${enemyInstance.name}！`);
    return { success: true, message: `遭遇了${enemyTypeText} ${enemyInstance.name}！`, enemy: enemyInstance };
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

    // 掉落物品
    enemy.lootTable.forEach(lootItem => {
      if (Math.random() < lootItem.chance) {
        const itemTemplate = getItemTemplate(lootItem.itemId);
        if (itemTemplate && this.inventory.addItem(lootItem.itemId, 1)) {
          loot.push({ itemId: lootItem.itemId, name: itemTemplate.name, quantity: 1 });
          logs.push(`获得 ${itemTemplate.name}`);
        }
      }
    });

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
    const NEW_MATERIAL_IDS = [
      { id: 'mat_001', name: '星铁基础构件' },
      { id: 'mat_002', name: '星铜传导组件' },
      { id: 'mat_003', name: '钛钢外甲坯料' },
      { id: 'mat_004', name: '战甲能量晶核' },
      { id: 'mat_005', name: '稀土传感基质' },
      { id: 'mat_006', name: '虚空防护核心' },
      { id: 'mat_007', name: '推进模块燃料' },
      { id: 'mat_008', name: '纳米韧化纤维' },
      { id: 'mat_009', name: '陨铁缓冲衬垫' },
      { id: 'mat_010', name: '量子紧固组件' },
    ];

    // 随机选择材料类型
    const shuffledMaterials = [...NEW_MATERIAL_IDS].sort(() => Math.random() - 0.5);
    const selectedMaterials = shuffledMaterials.slice(0, materialDropCount);

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

    // 掉落强化石 - 根据敌人类型
    const enhanceStoneCount = enemyType === 'boss' ? 5 : enemyType === 'elite' ? 2 : 1;
    const enhanceStoneId = 'enhance_stone';
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
      logs.push('成功逃脱！');
      this.addLog('战斗', '从战斗中逃脱');
      return { success: true, message: '成功逃脱！', logs };
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
