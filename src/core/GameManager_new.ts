// 《星航荒宇》游戏管理器
// 基于原有 GameManager 改造，整合新系统

import { Player, PlayerData } from './Player_new';
import { Inventory } from './Inventory';
import { Spaceship, SpaceshipDataExport } from './Spaceship';
import {
  InventoryItem,
  EquipmentInstance,
  FactionReputation,
  FactionType,
  GodContractor,
  Planet,
} from '../data/types_new';
import {
  createInitialReputations,
  executeFactionInteraction,
  FactionInteractionType,
} from '../data/factions';
import { ALL_PLANETS, getPlanetById } from '../data/planets';
import { ALL_GODS, getGodById } from '../data/gods';

// ==================== 游戏状态接口 ====================

export interface GameState {
  // 玩家数据
  player: PlayerData;
  
  // 航船数据（替代列车）
  spaceship: SpaceshipDataExport;
  
  // 背包数据
  inventory: {
    items: InventoryItem[];
    equipment: EquipmentInstance[];
  };
  
  // 游戏进度
  day: number;
  gameTime: number;
  currentPlanet: string;
  
  // 经济系统
  federationCredits: number;  // 联邦信用点（原列车币）
  
  // 日志
  logs: string[];
  
  // 任务系统
  quests: any[];
  
  // 技能系统
  activeSkills: any[];
  passiveSkills: any[];
  availableSkills: string[];
  
  // 商店系统
  shopItems: any[];
  lastShopRefreshDay: number;
  
  // 星球探索进度
  planetProgress: Record<string, {
    materialProgress: number;
    huntProgress: number;
    bossDefeated: boolean;
    lastBossDefeatDay: number;
    lastBossChallengeDate: string | null;
  }>;
  
  // 时间戳
  lastSaveTime: number;
  lastSpiritRecoveryTime: number;
}

// ==================== 游戏管理器 ====================

export class GameManager {
  // 核心系统
  player: Player;
  inventory: Inventory;
  spaceship: Spaceship;
  
  // 游戏状态
  day: number;
  gameTime: number;
  currentPlanet: string;
  isGameOver: boolean;
  
  // 经济
  federationCredits: number;
  
  // 日志
  logs: string[];
  
  // 任务系统
  quests: Map<string, any> = new Map();
  
  // 技能系统
  activeSkills: Map<string, any> = new Map();
  passiveSkills: Map<string, any> = new Map();
  availableSkills: string[] = [];
  
  // 商店系统
  shopItems: Map<string, any> = new Map();
  lastShopRefreshDay: number = 1;
  
  // 星球探索进度
  planetProgress: Map<string, {
    materialProgress: number;
    huntProgress: number;
    bossDefeated: boolean;
    lastBossDefeatDay: number;
    lastBossChallengeDate: string | null;
  }> = new Map();
  
  // 时间戳
  lastSpiritRecoveryTime: number = Date.now();
  lastSaveTime: number = Date.now();

  constructor(saveData?: Partial<GameState>) {
    // 初始化玩家
    this.player = new Player(saveData?.player);
    
    // 初始化背包
    this.inventory = new Inventory();
    if (saveData?.inventory) {
      // 恢复背包数据
      saveData.inventory.items.forEach(item => this.inventory.addItem(item));
      saveData.inventory.equipment.forEach(equip => this.inventory.addEquipment(equip));
    }
    
    // 初始化航船（替代列车）
    this.spaceship = new Spaceship(saveData?.spaceship);
    
    // 初始化游戏状态
    this.day = saveData?.day || 1;
    this.gameTime = saveData?.gameTime || 0;
    this.currentPlanet = saveData?.currentPlanet || 'planet_alpha';
    this.isGameOver = false;
    
    // 初始化经济
    this.federationCredits = saveData?.federationCredits || 100;
    
    // 初始化日志
    this.logs = saveData?.logs || [];
    
    // 恢复星球探索进度
    if (saveData?.planetProgress) {
      Object.entries(saveData.planetProgress).forEach(([planetId, progress]) => {
        this.planetProgress.set(planetId, progress);
      });
    }
    
    // 恢复时间戳
    this.lastSpiritRecoveryTime = saveData?.lastSpiritRecoveryTime || Date.now();
    this.lastSaveTime = saveData?.lastSaveTime || Date.now();
    
    // 初始化星球进度
    this.initPlanetProgress();
    
    // 添加初始日志
    if (this.logs.length === 0) {
      this.addLog('欢迎来到《星航荒宇》，联邦拓荒队员！');
      this.addLog('你的星际航船已准备就绪，随时可以出发探索。');
    }
  }

  // ==================== 初始化 ====================

  private initPlanetProgress(): void {
    ALL_PLANETS.forEach(planet => {
      if (!this.planetProgress.has(planet.id)) {
        this.planetProgress.set(planet.id, {
          materialProgress: 0,
          huntProgress: 0,
          bossDefeated: false,
          lastBossDefeatDay: 0,
          lastBossChallengeDate: null,
        });
      }
    });
  }

  // ==================== 日志系统 ====================

  addLog(message: string): void {
    const timestamp = `[${this.day}日 ${this.formatGameTime()}]`;
    this.logs.unshift(`${timestamp} ${message}`);
    // 只保留最近100条日志
    if (this.logs.length > 100) {
      this.logs.pop();
    }
  }

  private formatGameTime(): string {
    const hours = Math.floor(this.gameTime / 60) % 24;
    const minutes = this.gameTime % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  // ==================== 时间推进 ====================

  advanceTime(minutes: number): void {
    this.gameTime += minutes;
    
    // 检查是否进入下一天
    if (this.gameTime >= 1440) { // 24小时 = 1440分钟
      this.gameTime = this.gameTime % 1440;
      this.day++;
      this.onNewDay();
    }
    
    // 恢复精神值（每5分钟1点）
    this.recoverSpiritByTime();
  }

  private onNewDay(): void {
    this.addLog(`第 ${this.day} 天开始了`);
    
    // 每日恢复
    this.player.restoreStamina(20);
    this.spaceship.fullyRestoreEnergy();
    
    // 刷新商店
    if (this.day > this.lastShopRefreshDay) {
      this.refreshShop();
    }
  }

  private recoverSpiritByTime(): void {
    const now = Date.now();
    const timeDiff = now - this.lastSpiritRecoveryTime;
    const recoveryAmount = Math.floor(timeDiff / (5 * 60 * 1000)); // 每5分钟
    
    if (recoveryAmount > 0) {
      this.player.restoreSpirit(recoveryAmount);
      this.lastSpiritRecoveryTime = now;
    }
  }

  // ==================== 星球探索 ====================

  getCurrentPlanet(): Planet | undefined {
    return getPlanetById(this.currentPlanet);
  }

  travelToPlanet(planetId: string): { success: boolean; message: string } {
    const targetPlanet = getPlanetById(planetId);
    if (!targetPlanet) {
      return { success: false, message: '目标星球不存在' };
    }

    // 检查航船等级
    if (targetPlanet.requiredShipLevel && 
        this.spaceship.level < targetPlanet.requiredShipLevel) {
      return { 
        success: false, 
        message: `航船等级不足，需要等级 ${targetPlanet.requiredShipLevel}` 
      };
    }

    // 计算跃迁距离和时间
    const currentPlanet = this.getCurrentPlanet();
    const distance = this.calculateDistance(currentPlanet, targetPlanet);
    
    // 执行跃迁
    const jumpResult = this.spaceship.performJump(distance);
    if (!jumpResult.success) {
      return { success: false, message: jumpResult.message || '跃迁失败' };
    }

    // 更新当前星球
    this.currentPlanet = planetId;
    this.advanceTime(Math.floor(jumpResult.time / 60)); // 转换为游戏分钟
    
    this.addLog(`跃迁至 ${targetPlanet.name}，耗时 ${jumpResult.time} 秒`);
    
    return { 
      success: true, 
      message: `成功抵达 ${targetPlanet.name}` 
    };
  }

  private calculateDistance(from: Planet | undefined, to: Planet): number {
    // 简化计算：基于等级差计算距离
    const fromLevel = from?.level || 1;
    const toLevel = to.level;
    return Math.abs(toLevel - fromLevel) * 100 + 50;
  }

  // ==================== 势力声望 ====================

  getFactionReputation(factionId: FactionType): number {
    return this.player.getFactionReputation(factionId);
  }

  modifyFactionReputation(factionId: FactionType, amount: number): void {
    const oldRep = this.getFactionReputation(factionId);
    this.player.modifyFactionReputation(factionId, amount);
    const newRep = this.getFactionReputation(factionId);
    
    if (Math.abs(amount) >= 10) {
      this.addLog(`与 ${factionId} 的关系 ${amount > 0 ? '提升' : '降低'}了 (${oldRep} -> ${newRep})`);
    }
  }

  executeFactionInteraction(
    factionId: FactionType, 
    interactionType: FactionInteractionType
  ): { success: boolean; message: string } {
    const result = executeFactionInteraction(
      this.player.getAllFactionReputations(),
      factionId,
      interactionType
    );
    
    this.player.factionReputations = result.newReputations;
    this.addLog(result.effect.description);
    
    return { success: true, message: result.effect.description };
  }

  // ==================== 神契者系统 ====================

  bindGodContractor(contractor: GodContractor): boolean {
    const success = this.player.bindGodContractor(contractor);
    if (success) {
      this.addLog(`与神契者 ${contractor.name} 建立了羁绊`);
    }
    return success;
  }

  unbindGodContractor(): GodContractor | null {
    const contractor = this.player.unbindGodContractor();
    if (contractor) {
      this.addLog(`与神契者 ${contractor.name} 解除了羁绊`);
    }
    return contractor;
  }

  useContractorAbility(abilityIndex: number): { success: boolean; message: string } {
    // 检查能量
    const contractor = this.player.getGodContractor();
    if (!contractor) {
      return { success: false, message: '未绑定神契者' };
    }

    const ability = contractor.abilities[abilityIndex];
    if (!ability) {
      return { success: false, message: '能力不存在' };
    }

    // 检查航船能量
    if (this.spaceship.energy < ability.energyCost) {
      return { success: false, message: '航船能量不足' };
    }

    // 消耗能量
    this.spaceship.consumeEnergy(ability.energyCost);
    
    return { 
      success: true, 
      message: `使用 ${ability.name}：${ability.effect}` 
    };
  }

  // ==================== 经济系统 ====================

  addCredits(amount: number): void {
    this.federationCredits += amount;
    if (amount > 0) {
      this.addLog(`获得 ${amount} 联邦信用点`);
    }
  }

  spendCredits(amount: number): boolean {
    if (this.federationCredits >= amount) {
      this.federationCredits -= amount;
      return true;
    }
    return false;
  }

  // ==================== 商店系统 ====================

  refreshShop(): void {
    // 根据当前星球的势力控制生成商品
    const currentPlanet = this.getCurrentPlanet();
    if (!currentPlanet) return;

    this.shopItems.clear();
    
    // 基础商品
    const basicItems = [
      { id: 'energy_block', name: '能量块', price: 10 },
      { id: 'coolant', name: '冷却液', price: 10 },
      { id: 'repair_kit', name: '维修工具包', price: 50 },
    ];

    basicItems.forEach(item => {
      this.shopItems.set(item.id, {
        ...item,
        stock: 99,
      });
    });

    this.lastShopRefreshDay = this.day;
    this.addLog('商店已刷新');
  }

  // ==================== 存档系统 ====================

  exportState(): GameState {
    const planetProgress: Record<string, any> = {};
    this.planetProgress.forEach((progress, planetId) => {
      planetProgress[planetId] = progress;
    });

    return {
      player: this.player.exportData(),
      spaceship: this.spaceship.exportData(),
      inventory: {
        items: this.inventory.getAllItems(),
        equipment: this.inventory.getAllEquipment(),
      },
      day: this.day,
      gameTime: this.gameTime,
      currentPlanet: this.currentPlanet,
      federationCredits: this.federationCredits,
      logs: this.logs,
      quests: Array.from(this.quests.values()),
      activeSkills: Array.from(this.activeSkills.values()),
      passiveSkills: Array.from(this.passiveSkills.values()),
      availableSkills: this.availableSkills,
      shopItems: Array.from(this.shopItems.values()),
      lastShopRefreshDay: this.lastShopRefreshDay,
      planetProgress,
      lastSaveTime: Date.now(),
      lastSpiritRecoveryTime: this.lastSpiritRecoveryTime,
    };
  }

  save(): string {
    const state = this.exportState();
    const saveString = JSON.stringify(state);
    this.lastSaveTime = Date.now();
    this.addLog('游戏已保存');
    return saveString;
  }

  static load(saveString: string): GameManager {
    try {
      const saveData = JSON.parse(saveString);
      return new GameManager(saveData);
    } catch (error) {
      console.error('加载存档失败:', error);
      return new GameManager();
    }
  }

  // ==================== 游戏状态检查 ====================

  checkGameOver(): boolean {
    if (this.player.hp <= 0) {
      this.isGameOver = true;
      this.addLog('游戏结束：生命值耗尽');
      return true;
    }
    return false;
  }

  getStatusSummary(): string {
    const currentPlanet = this.getCurrentPlanet();
    return `
========== 游戏状态 ==========
第 ${this.day} 天 ${this.formatGameTime()}
当前位置：${currentPlanet?.name || '未知'}
联邦信用点：${this.federationCredits}

${this.player.getStatusSummary()}

${this.spaceship.getStatusSummary()}
==============================
    `.trim();
  }
}

export default GameManager;
