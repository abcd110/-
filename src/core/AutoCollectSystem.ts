// 自动资源采集系统
// 以驾驶室为背景，飞船自动收集太空/星球资源

import {
  AutoCollectMode,
  AutoStopCondition,
  AutoCollectState,
  AutoCollectConfig,
  CollectReward,
  CollectLocation,
  getCollectLocation,
  COLLECT_LOCATIONS,
} from '../data/autoCollectTypes';
import { ItemRarity } from '../data/types';
import { getItemTemplate } from '../data/items';

// 材料ID列表（用于随机掉落）
const MATERIAL_IDS = [
  'mat_001', 'mat_002', 'mat_003', 'mat_004', 'mat_005',
  'mat_006', 'mat_007', 'mat_008', 'mat_009', 'mat_010'
];

// 装备ID列表（用于随机掉落）
const EQUIPMENT_IDS = [
  'weapon_001', 'weapon_002', 'weapon_003',
  'armor_001', 'armor_002', 'armor_003',
  'accessory_001', 'accessory_002',
];

export class AutoCollectSystem {
  // 自动采集状态
  state: AutoCollectState = {
    isCollecting: false,
    startTime: 0,
    lastCollectTime: 0,
    locationId: 'orbit_debris',
    mode: AutoCollectMode.BALANCED,
    totalRewards: {
      gold: 0,
      exp: 0,
      materials: [],
      equipments: [],
    },
  };

  // 配置
  config: AutoCollectConfig = {
    locationId: 'orbit_debris',
    mode: AutoCollectMode.BALANCED,
    autoStopCondition: AutoStopCondition.FULL,
    autoSellCommon: true,
  };

  // 上次保存的时间戳（用于离线计算）
  lastSaveTime: number = Date.now();

  // 序列化状态
  serialize() {
    return {
      state: this.state,
      config: this.config,
      lastSaveTime: this.lastSaveTime,
    };
  }

  // 从存档加载
  load(data: any): void {
    if (data) {
      this.state = data.state || this.state;
      this.config = data.config || this.config;
      this.lastSaveTime = data.lastSaveTime || Date.now();
    }
  }

  // 开始自动采集
  startCollect(locationId: string, mode: AutoCollectMode): { success: boolean; message: string } {
    const location = getCollectLocation(locationId);
    if (!location) {
      return { success: false, message: '采集地点不存在' };
    }

    const now = Date.now();
    this.state = {
      isCollecting: true,
      startTime: now,
      lastCollectTime: now,
      locationId,
      mode,
      totalRewards: {
        gold: 0,
        exp: 0,
        materials: [],
        equipments: [],
      },
    };

    this.config.locationId = locationId;
    this.config.mode = mode;
    this.lastSaveTime = now;

    return { success: true, message: `开始在${location.name}进行自动采集` };
  }

  // 停止自动采集
  stopCollect(): { success: boolean; message: string; rewards?: CollectReward } {
    if (!this.state.isCollecting) {
      return { success: false, message: '当前没有进行自动采集' };
    }

    // 结算最终收益
    this.calculateOfflineRewards();

    const rewards = { ...this.state.totalRewards };
    const location = getCollectLocation(this.state.locationId);

    this.state.isCollecting = false;
    this.state.startTime = 0;
    this.state.lastCollectTime = 0;

    return {
      success: true,
      message: `已停止在${location?.name || '未知地点'}的自动采集`,
      rewards,
    };
  }

  // 领取收益（不停止采集）
  claimRewards(): { success: boolean; message: string; rewards?: CollectReward } {
    if (!this.state.isCollecting) {
      return { success: false, message: '当前没有进行自动采集' };
    }

    // 结算收益
    this.calculateOfflineRewards();

    const rewards = { ...this.state.totalRewards };

    // 如果没有收益，提示用户
    if (rewards.gold === 0 && rewards.exp === 0 && rewards.materials.length === 0 && rewards.equipments.length === 0) {
      return { success: false, message: '当前没有可领取的收益' };
    }

    // 清空累计收益
    this.state.totalRewards = {
      gold: 0,
      exp: 0,
      materials: [],
      equipments: [],
    };

    // 重置采集时长（重新计时）
    const now = Date.now();
    this.state.startTime = now;
    this.state.lastCollectTime = now;

    return {
      success: true,
      message: '成功领取采集收益',
      rewards,
    };
  }

  // 计算离线收益
  calculateOfflineRewards(): void {
    if (!this.state.isCollecting) return;

    const now = Date.now();
    const elapsedMs = now - this.state.lastCollectTime;
    const elapsedHours = elapsedMs / (1000 * 60 * 60);

    // 最多计算24小时的收益
    const maxHours = 24;
    const effectiveHours = Math.min(elapsedHours, maxHours);

    if (effectiveHours <= 0) return;

    const location = getCollectLocation(this.state.locationId);
    if (!location) return;

    // 计算收益
    const rewards = this.generateRewards(location, effectiveHours);

    // 累加到总收益
    this.state.totalRewards.gold += rewards.gold;
    this.state.totalRewards.exp += rewards.exp;

    // 合并材料
    rewards.materials.forEach(mat => {
      const existing = this.state.totalRewards.materials.find(m => m.itemId === mat.itemId);
      if (existing) {
        existing.quantity += mat.quantity;
      } else {
        this.state.totalRewards.materials.push({ ...mat });
      }
    });

    // 合并装备
    this.state.totalRewards.equipments.push(...rewards.equipments);

    this.state.lastCollectTime = now;
  }

  // 生成收益
  private generateRewards(location: CollectLocation, hours: number): CollectReward {
    const mode = this.state.mode;
    const base = location.baseRewards;

    // 模式倍率
    let goldMultiplier = 1;
    let expMultiplier = 1;
    let materialMultiplier = 1;
    let equipmentMultiplier = 1;

    switch (mode) {
      case AutoCollectMode.GATHER:
        materialMultiplier = 1.5;
        break;
      case AutoCollectMode.COMBAT:
        expMultiplier = 1.5;
        equipmentMultiplier = 1.5;
        break;
      case AutoCollectMode.BALANCED:
        goldMultiplier = 1.2;
        expMultiplier = 1.2;
        materialMultiplier = 1.2;
        equipmentMultiplier = 1.2;
        break;
    }

    // 计算信用点
    const goldPerHour = (base.goldMin + base.goldMax) / 2;
    const gold = Math.floor(goldPerHour * hours * goldMultiplier * (0.9 + Math.random() * 0.2));

    // 计算经验
    const expPerHour = (base.expMin + base.expMax) / 2;
    const exp = Math.floor(expPerHour * hours * expMultiplier * (0.9 + Math.random() * 0.2));

    // 计算材料掉落
    const materials: { itemId: string; name: string; quantity: number }[] = [];
    const materialDropRate = base.materialDropChance * materialMultiplier;
    const expectedMaterialDrops = materialDropRate * hours;
    const actualMaterialDrops = Math.floor(expectedMaterialDrops) + (Math.random() < (expectedMaterialDrops % 1) ? 1 : 0);

    for (let i = 0; i < actualMaterialDrops; i++) {
      const matId = MATERIAL_IDS[Math.floor(Math.random() * MATERIAL_IDS.length)];
      const matTemplate = getItemTemplate(matId);
      if (matTemplate) {
        const existing = materials.find(m => m.itemId === matId);
        if (existing) {
          existing.quantity++;
        } else {
          materials.push({ itemId: matId, name: matTemplate.name, quantity: 1 });
        }
      }
    }

    // 计算装备掉落
    const equipments: { itemId: string; name: string; rarity: string }[] = [];
    const equipmentDropRate = base.equipmentDropChance * equipmentMultiplier;
    const expectedEquipmentDrops = equipmentDropRate * hours;
    const actualEquipmentDrops = Math.floor(expectedEquipmentDrops) + (Math.random() < (expectedEquipmentDrops % 1) ? 1 : 0);

    for (let i = 0; i < actualEquipmentDrops; i++) {
      const equipId = EQUIPMENT_IDS[Math.floor(Math.random() * EQUIPMENT_IDS.length)];
      const equipTemplate = getItemTemplate(equipId);
      if (equipTemplate) {
        equipments.push({
          itemId: equipId,
          name: equipTemplate.name,
          rarity: equipTemplate.rarity,
        });
      }
    }

    return {
      gold,
      exp,
      materials,
      equipments,
    };
  }

  // 获取当前采集时长（毫秒）
  getCollectingDuration(): number {
    if (!this.state.isCollecting) return 0;
    return Date.now() - this.state.startTime;
  }

  // 获取格式化的采集时长
  getFormattedDuration(): string {
    const duration = this.getCollectingDuration();
    const seconds = Math.floor(duration / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
    } else {
      return `${minutes.toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
    }
  }

  // 获取预计每小时收益（用于显示）
  getEstimatedHourlyRewards(): CollectReward {
    const location = getCollectLocation(this.state.locationId);
    if (!location) {
      return { gold: 0, exp: 0, materials: [], equipments: [] };
    }

    return this.generateRewards(location, 1);
  }

  // 更新配置
  updateConfig(config: Partial<AutoCollectConfig>): void {
    this.config = { ...this.config, ...config };
  }

  // 检查是否应该自动停止
  shouldAutoStop(inventoryFull: boolean, energyLow: boolean): boolean {
    switch (this.config.autoStopCondition) {
      case AutoStopCondition.FULL:
        return inventoryFull;
      case AutoStopCondition.ENERGY:
        return energyLow;
      case AutoStopCondition.NEVER:
        return false;
      default:
        return false;
    }
  }

  // 获取所有可用的采集地点
  getAvailableLocations(playerLevel: number): CollectLocation[] {
    return COLLECT_LOCATIONS.filter(loc => {
      if (!loc.unlockRequirement) return true;
      if (loc.unlockRequirement.level && playerLevel < loc.unlockRequirement.level) return false;
      return true;
    });
  }

  // 重置系统
  reset(): void {
    this.state = {
      isCollecting: false,
      startTime: 0,
      lastCollectTime: 0,
      locationId: 'orbit_debris',
      mode: AutoCollectMode.BALANCED,
      totalRewards: {
        gold: 0,
        exp: 0,
        materials: [],
        equipments: [],
      },
    };
    this.config = {
      locationId: 'orbit_debris',
      mode: AutoCollectMode.BALANCED,
      autoStopCondition: AutoStopCondition.FULL,
      autoSellCommon: true,
    };
    this.lastSaveTime = Date.now();
  }
}
