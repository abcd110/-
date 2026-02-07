// 《星航荒宇》存档迁移工具
// 将《列车求生》旧存档迁移到新系统

import { GameState as NewGameState } from '../core/GameManager_new';
import { 
  FactionType, 
  PlanetType,
  FactionReputation,
} from '../data/types_new';
import { createInitialReputations } from '../data/factions';

// ==================== 旧存档类型定义 ====================

interface OldGameState {
  player: {
    name: string;
    level: number;
    exp: number;
    hp: number;
    maxHp: number;
    stamina: number;
    maxStamina: number;
    spirit: number;
    maxSpirit: number;
    hunger: number;
    maxHunger: number;
    thirst: number;
    maxThirst: number;
    attack: number;
    defense: number;
    attackSpeed: number;
    equipment: any[];
    lastSpiritRecoveryTime?: number;
  };
  train: {
    id: string;
    name: string;
    level: number;
    experience: number;
    speed: number;
    defense: number;
    cargoCapacity: number;
    energy: number;
    maxEnergy: number;
    modules: any[];
  };
  inventory: {
    items: any[];
    equipment: any[];
  };
  day: number;
  gameTime: number;
  currentLocation: string;
  trainCoins: number;
  logs: string[];
  quests: any[];
  activeSkills: any[];
  passiveSkills: any[];
  availableSkills: string[];
  shopItems: any[];
  lastShopRefreshDay: number;
  locationProgress: Record<string, {
    materialProgress: number;
    huntProgress: number;
    bossDefeated: boolean;
    lastBossDefeatDay: number;
    lastBossChallengeDate: string | null;
  }>;
  lastSaveTime: number;
  lastSpiritRecoveryTime: number;
}

// ==================== 存档版本信息 ====================

interface SaveVersion {
  version: string;
  gameName: string;
  migrationDate?: string;
}

const CURRENT_VERSION: SaveVersion = {
  version: '2.0.0',
  gameName: '星航荒宇',
};

const OLD_VERSION: SaveVersion = {
  version: '1.0.0',
  gameName: '列车求生',
};

// ==================== 迁移映射表 ====================

// 旧站台ID -> 新星球ID映射
const LOCATION_TO_PLANET_MAP: Record<string, string> = {
  // 原有8个神话站台
  'location_helios': 'planet_helios',
  'location_valhalla': 'planet_valhalla',
  'location_bifrost': 'planet_bifrost',
  'location_olympus': 'planet_olympus',
  'location_delphi': 'planet_delphi',
  'location_mimir': 'planet_mimir',
  'location_hel': 'planet_hel',
  'location_godless': 'planet_alpha', // 无神之境改为阿尔法星
  
  // 其他站台映射到废土星
  'location_ruins': 'planet_withered',
  'location_forest': 'planet_withered',
  'location_desert': 'planet_withered',
  'location_snow': 'planet_withered',
};

// 旧资源ID -> 新资源ID映射
const ITEM_MIGRATION_MAP: Record<string, string> = {
  // 基础资源
  'wood': 'basic_alloy',
  'metal': 'star_core_fragment',
  'food': 'energy_block',
  'water': 'coolant',
  
  // 特殊资源
  'train_coin': 'federation_credit',
  'fuel': 'energy_cell',
  'repair_kit': 'repair_kit', // 保持不变
  
  // 默认映射
  'default': 'basic_alloy',
};

// ==================== 迁移工具类 ====================

export class SaveMigration {
  
  /**
   * 检测存档版本
   */
  static detectVersion(saveData: any): SaveVersion {
    // 检查是否有版本标记
    if (saveData._version) {
      return saveData._version as SaveVersion;
    }
    
    // 通过数据结构判断
    if (saveData.train && saveData.currentLocation) {
      return OLD_VERSION;
    }
    
    if (saveData.spaceship && saveData.currentPlanet) {
      return CURRENT_VERSION;
    }
    
    // 无法识别，假设为最新版本
    return CURRENT_VERSION;
  }

  /**
   * 检查是否需要迁移
   */
  static needsMigration(saveData: any): boolean {
    const version = this.detectVersion(saveData);
    return version.version !== CURRENT_VERSION.version;
  }

  /**
   * 执行存档迁移
   */
  static migrate(saveString: string): { 
    success: boolean; 
    data?: NewGameState; 
    message: string;
    warnings: string[];
  } {
    const warnings: string[] = [];
    
    try {
      const oldData = JSON.parse(saveString) as OldGameState;
      
      // 验证旧存档
      if (!this.validateOldSave(oldData)) {
        return {
          success: false,
          message: '无效的存档数据',
          warnings: ['存档数据格式不正确'],
        };
      }
      
      // 执行迁移
      const newData = this.performMigration(oldData, warnings);
      
      return {
        success: true,
        data: newData,
        message: `存档迁移成功：从 ${OLD_VERSION.gameName} v${OLD_VERSION.version} 迁移到 ${CURRENT_VERSION.gameName} v${CURRENT_VERSION.version}`,
        warnings,
      };
      
    } catch (error) {
      return {
        success: false,
        message: `迁移失败: ${error instanceof Error ? error.message : '未知错误'}`,
        warnings: [],
      };
    }
  }

  /**
   * 验证旧存档
   */
  private static validateOldSave(data: OldGameState): boolean {
    return !!(
      data.player &&
      data.train &&
      typeof data.day === 'number'
    );
  }

  /**
   * 执行迁移逻辑
   */
  private static performMigration(
    oldData: OldGameState, 
    warnings: string[]
  ): NewGameState {
    
    // 1. 迁移玩家数据
    const playerData = this.migratePlayerData(oldData.player, warnings);
    
    // 2. 迁移航船数据（列车 -> 航船）
    const spaceshipData = this.migrateTrainToSpaceship(oldData.train, warnings);
    
    // 3. 迁移背包数据
    const inventoryData = this.migrateInventory(oldData.inventory, warnings);
    
    // 4. 迁移星球进度（站台 -> 星球）
    const planetProgress = this.migrateLocationProgress(
      oldData.locationProgress || {}, 
      warnings
    );
    
    // 5. 迁移当前位置
    const currentPlanet = this.migrateLocationId(oldData.currentLocation);
    if (currentPlanet !== oldData.currentLocation) {
      warnings.push(`当前位置已迁移: ${oldData.currentLocation} -> ${currentPlanet}`);
    }
    
    // 6. 构建新存档
    const newState: NewGameState = {
      player: playerData,
      spaceship: spaceshipData,
      inventory: inventoryData,
      day: oldData.day,
      gameTime: oldData.gameTime || 0,
      currentPlanet: currentPlanet,
      federationCredits: oldData.trainCoins || 0,
      logs: this.migrateLogs(oldData.logs || []),
      quests: oldData.quests || [],
      activeSkills: oldData.activeSkills || [],
      passiveSkills: oldData.passiveSkills || [],
      availableSkills: oldData.availableSkills || [],
      shopItems: oldData.shopItems || [],
      lastShopRefreshDay: oldData.lastShopRefreshDay || 1,
      planetProgress: planetProgress,
      lastSaveTime: Date.now(),
      lastSpiritRecoveryTime: oldData.lastSpiritRecoveryTime || Date.now(),
    };
    
    return newState;
  }

  /**
   * 迁移玩家数据
   */
  private static migratePlayerData(
    oldPlayer: OldGameState['player'], 
    warnings: string[]
  ): NewGameState['player'] {
    
    // 添加势力声望（新系统）
    const factionReputations = createInitialReputations();
    
    // 迁移装备
    const equipment = oldPlayer.equipment?.map(equip => ({
      ...equip,
      // 确保装备数据完整性
      equipped: true,
    })) || [];
    
    return {
      name: oldPlayer.name || '联邦拓荒队员',
      level: oldPlayer.level || 1,
      exp: oldPlayer.exp || 0,
      hp: oldPlayer.hp || 100,
      maxHp: oldPlayer.maxHp || 100,
      stamina: oldPlayer.stamina || 100,
      maxStamina: oldPlayer.maxStamina || 100,
      spirit: oldPlayer.spirit || 100,
      maxSpirit: oldPlayer.maxSpirit || 100,
      hunger: oldPlayer.hunger || 100,
      maxHunger: oldPlayer.maxHunger || 100,
      thirst: oldPlayer.thirst || 100,
      maxThirst: oldPlayer.maxThirst || 100,
      attack: oldPlayer.attack || 10,
      defense: oldPlayer.defense || 5,
      attackSpeed: oldPlayer.attackSpeed || 1.0,
      equipment: equipment,
      factionReputations: factionReputations,
      godContractor: null, // 新系统，初始为空
    };
  }

  /**
   * 迁移列车数据到航船
   */
  private static migrateTrainToSpaceship(
    oldTrain: OldGameState['train'], 
    warnings: string[]
  ): NewGameState['spaceship'] {
    
    // 转换模块数据
    const modules = oldTrain.modules?.map(module => ({
      slot: module.slot,
      item: module.item ? {
        ...module.item,
        // 确保模块数据完整性
      } : null,
    })) || [];
    
    return {
      id: oldTrain.id || 'ship_001',
      name: oldTrain.name?.replace('列车', '航船') || '初号拓荒舰',
      level: oldTrain.level || 1,
      experience: oldTrain.experience || 0,
      speed: oldTrain.speed || 100,
      defense: oldTrain.defense || 50,
      cargoCapacity: oldTrain.cargoCapacity || 100,
      energy: oldTrain.energy || 100,
      maxEnergy: oldTrain.maxEnergy || 100,
      modules: modules,
    };
  }

  /**
   * 迁移背包数据
   */
  private static migrateInventory(
    oldInventory: OldGameState['inventory'], 
    warnings: string[]
  ): NewGameState['inventory'] {
    
    // 迁移物品
    const items = oldInventory.items?.map(item => ({
      ...item,
      // 迁移物品ID
      itemId: this.migrateItemId(item.itemId || item.id),
    })) || [];
    
    // 迁移装备
    const equipment = oldInventory.equipment?.map(equip => ({
      ...equip,
      equipped: false, // 背包中的装备未装备
    })) || [];
    
    return {
      items,
      equipment,
    };
  }

  /**
   * 迁移物品ID
   */
  private static migrateItemId(oldId: string): string {
    return ITEM_MIGRATION_MAP[oldId] || oldId;
  }

  /**
   * 迁移位置ID
   */
  private static migrateLocationId(oldId: string): string {
    return LOCATION_TO_PLANET_MAP[oldId] || 'planet_alpha';
  }

  /**
   * 迁移星球进度
   */
  private static migrateLocationProgress(
    oldProgress: OldGameState['locationProgress'], 
    warnings: string[]
  ): NewGameState['planetProgress'] {
    
    const newProgress: NewGameState['planetProgress'] = {};
    
    Object.entries(oldProgress).forEach(([oldLocationId, progress]) => {
      const newPlanetId = this.migrateLocationId(oldLocationId);
      
      if (newPlanetId !== oldLocationId) {
        warnings.push(`探索进度已迁移: ${oldLocationId} -> ${newPlanetId}`);
      }
      
      newProgress[newPlanetId] = {
        materialProgress: progress.materialProgress || 0,
        huntProgress: progress.huntProgress || 0,
        bossDefeated: progress.bossDefeated || false,
        lastBossDefeatDay: progress.lastBossDefeatDay || 0,
        lastBossChallengeDate: progress.lastBossChallengeDate || null,
      };
    });
    
    return newProgress;
  }

  /**
   * 迁移日志
   */
  private static migrateLogs(oldLogs: string[]): string[] {
    return oldLogs.map(log => 
      log
        .replace(/列车/g, '航船')
        .replace(/站台/g, '星球')
        .replace(/荒原/g, '星际空间')
        .replace(/求生者/g, '拓荒队员')
        .replace(/列车币/g, '联邦信用点')
    );
  }

  /**
   * 生成迁移报告
   */
  static generateReport(result: { 
    success: boolean; 
    message: string; 
    warnings: string[];
  }): string {
    const lines: string[] = [];
    
    lines.push('========== 存档迁移报告 ==========');
    lines.push('');
    lines.push(`状态: ${result.success ? '✅ 成功' : '❌ 失败'}`);
    lines.push(`消息: ${result.message}`);
    lines.push('');
    
    if (result.warnings.length > 0) {
      lines.push('⚠️ 警告信息:');
      result.warnings.forEach((warning, index) => {
        lines.push(`  ${index + 1}. ${warning}`);
      });
      lines.push('');
    }
    
    lines.push('迁移内容:');
    lines.push('  • 玩家数据 -> 联邦拓荒队员');
    lines.push('  • 列车 -> 星际航船');
    lines.push('  • 站台 -> 星球');
    lines.push('  • 列车币 -> 联邦信用点');
    lines.push('  • 新增：势力声望系统');
    lines.push('  • 新增：神契者系统（初始为空）');
    lines.push('');
    lines.push('==================================');
    
    return lines.join('\n');
  }
}

export default SaveMigration;
