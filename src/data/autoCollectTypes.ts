// 自动资源采集系统类型定义
// 以驾驶室为背景，飞船自动收集太空/星球资源

export enum AutoCollectMode {
  GATHER = 'gather',       // 专注采集 - 更高资源产出
  COMBAT = 'combat',       // 战斗巡逻 - 更高战斗经验和装备掉落
  BALANCED = 'balanced',   // 平衡模式 - 均衡产出
}

export enum AutoStopCondition {
  FULL = 'full',           // 背包满时停止
  ENERGY = 'energy',       // 能量不足时停止
  NEVER = 'never',         // 永不停止（自动继续）
}

// 自动采集配置
export interface AutoCollectConfig {
  locationId: string;       // 当前采集轨道/地点
  mode: AutoCollectMode;    // 采集模式
  autoStopCondition: AutoStopCondition;  // 自动停止条件
  autoSellCommon: boolean;  // 自动出售普通品质装备
}

// 采集收益
export interface CollectReward {
  gold: number;             // 信用点
  exp: number;              // 经验值
  materials: { itemId: string; name: string; quantity: number }[];  // 材料
  equipments: { itemId: string; name: string; rarity: string }[];   // 装备
}

// 自动采集状态
export interface AutoCollectState {
  isCollecting: boolean;    // 是否正在采集
  startTime: number;        // 开始时间戳（毫秒）
  lastCollectTime: number;  // 上次结算时间戳（毫秒）
  locationId: string;       // 当前采集地点
  mode: AutoCollectMode;    // 当前模式
  totalRewards: CollectReward;  // 累计收益
}

// 轨道/采集地点定义
export interface CollectLocation {
  id: string;
  name: string;
  description: string;
  icon: string;
  dangerLevel: number;      // 危险等级 1-10
  resourceQuality: number;  // 资源品质 1-10
  unlockRequirement?: {     // 解锁条件
    level?: number;
    locationId?: string;
  };
  // 每小时基础产出
  baseRewards: {
    goldMin: number;
    goldMax: number;
    expMin: number;
    expMax: number;
    materialDropChance: number;  // 材料掉落概率
    equipmentDropChance: number; // 装备掉落概率
  };
}

// 采集记录（用于日志）
export interface CollectLog {
  timestamp: number;
  locationName: string;
  duration: number;         // 采集时长（分钟）
  rewards: CollectReward;
}

// 模式显示信息
export const MODE_INFO: Record<AutoCollectMode, { name: string; icon: string; description: string }> = {
  [AutoCollectMode.GATHER]: {
    name: '资源采集',
    icon: '⛏️',
    description: '专注采集资源，材料产出+50%',
  },
  [AutoCollectMode.COMBAT]: {
    name: '战斗巡逻',
    icon: '⚔️',
    description: '主动寻找战斗，经验+50%，装备掉落+50%',
  },
  [AutoCollectMode.BALANCED]: {
    name: '平衡模式',
    icon: '⚖️',
    description: '均衡采集与战斗，各项产出+20%',
  },
};

// 自动采集地点配置
export const COLLECT_LOCATIONS: CollectLocation[] = [
  {
    id: 'orbit_debris',
    name: '近地轨道碎片带',
    description: '环绕星球的废弃卫星和太空垃圾，适合新手采集',
    icon: '🛰️',
    dangerLevel: 1,
    resourceQuality: 1,
    baseRewards: {
      goldMin: 10,
      goldMax: 20,
      expMin: 5,
      expMax: 10,
      materialDropChance: 0.3,
      equipmentDropChance: 0.05,
    },
  },
  {
    id: 'asteroid_belt',
    name: '小行星采矿带',
    description: '富含矿物的小行星群，资源丰富但有一定危险',
    icon: '🌑',
    dangerLevel: 3,
    resourceQuality: 3,
    baseRewards: {
      goldMin: 25,
      goldMax: 45,
      expMin: 15,
      expMax: 25,
      materialDropChance: 0.5,
      equipmentDropChance: 0.1,
    },
  },
  {
    id: 'nebula_cloud',
    name: '星尘云团',
    description: '神秘的星云区域，可能发现稀有能量晶体',
    icon: '✨',
    dangerLevel: 5,
    resourceQuality: 5,
    unlockRequirement: { level: 5 },
    baseRewards: {
      goldMin: 50,
      goldMax: 80,
      expMin: 30,
      expMax: 50,
      materialDropChance: 0.6,
      equipmentDropChance: 0.15,
    },
  },
  {
    id: 'derelict_station',
    name: '废弃空间站',
    description: '被遗弃的古老空间站，藏有珍贵物资',
    icon: '🏚️',
    dangerLevel: 7,
    resourceQuality: 7,
    unlockRequirement: { level: 10 },
    baseRewards: {
      goldMin: 80,
      goldMax: 120,
      expMin: 50,
      expMax: 80,
      materialDropChance: 0.7,
      equipmentDropChance: 0.2,
    },
  },
  {
    id: 'void_rift',
    name: '虚空裂隙',
    description: '危险的虚空裂缝，传说有神话级材料',
    icon: '🌌',
    dangerLevel: 10,
    resourceQuality: 10,
    unlockRequirement: { level: 20 },
    baseRewards: {
      goldMin: 150,
      goldMax: 250,
      expMin: 100,
      expMax: 150,
      materialDropChance: 0.8,
      equipmentDropChance: 0.3,
    },
  },
];

// 获取采集地点
export function getCollectLocation(locationId: string): CollectLocation | undefined {
  return COLLECT_LOCATIONS.find(loc => loc.id === locationId);
}

// 获取解锁的采集地点
export function getUnlockedCollectLocations(playerLevel: number): CollectLocation[] {
  return COLLECT_LOCATIONS.filter(loc => {
    if (!loc.unlockRequirement) return true;
    if (loc.unlockRequirement.level && playerLevel < loc.unlockRequirement.level) return false;
    return true;
  });
}

// 检查地点是否解锁
export function isLocationUnlocked(locationId: string, playerLevel: number): boolean {
  const location = getCollectLocation(locationId);
  if (!location) return false;
  if (!location.unlockRequirement) return true;
  if (location.unlockRequirement.level && playerLevel < location.unlockRequirement.level) return false;
  return true;
}
