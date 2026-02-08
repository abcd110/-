// 自动资源采集系统类型定义
// 采集机器人系统 - 派遣机器人自动收集资源

export enum AutoCollectMode {
  GATHER = 'gather',       // 资源采集 - 材料+50%，信用点+50%
  COMBAT = 'combat',       // 战斗巡逻 - 经验+50%，强化石+50%
  BALANCED = 'balanced',   // 平衡模式 - 均衡产出
}

export enum AutoStopCondition {
  FULL = 'full',           // 背包满时停止
  ENERGY = 'energy',       // 能量不足时停止
  NEVER = 'never',         // 永不停止（自动继续）
}

// 采集机器人等级定义
export interface CollectRobot {
  id: string;
  name: string;
  level: number;
  description: string;
  icon: string;
  // 每小时基础产出
  baseRewards: {
    gold: number;           // 信用点/小时
    exp: number;            // 经验/小时
    materialsPerHour: number;   // 材料数量/小时
    enhanceStonesPerHour: number; // 强化石数量/小时
  };
}

// 采集收益
export interface CollectReward {
  gold: number;             // 信用点
  exp: number;              // 经验值
  materials: { itemId: string; name: string; quantity: number }[];  // 材料
  enhanceStones: number;    // 强化石数量
}

// 自动采集状态
export interface AutoCollectState {
  isCollecting: boolean;    // 是否正在采集
  startTime: number;        // 开始时间戳（毫秒）
  lastCollectTime: number;  // 上次结算时间戳（毫秒）
  robotId: string;          // 当前使用的机器人ID
  mode: AutoCollectMode;    // 当前模式
  totalRewards: CollectReward;  // 累计收益
}

// 自动采集配置
export interface AutoCollectConfig {
  robotId: string;          // 当前使用的机器人
  mode: AutoCollectMode;    // 采集模式
  autoStopCondition: AutoStopCondition;  // 自动停止条件
}

// 采集记录（用于日志）
export interface CollectLog {
  timestamp: number;
  robotName: string;
  duration: number;         // 采集时长（分钟）
  rewards: CollectReward;
}

// 模式显示信息
export const MODE_INFO: Record<AutoCollectMode, { name: string; icon: string; description: string }> = {
  [AutoCollectMode.GATHER]: {
    name: '资源采集',
    icon: '⛏️',
    description: '专注采集资源，材料+50%，信用点+50%',
  },
  [AutoCollectMode.COMBAT]: {
    name: '战斗巡逻',
    icon: '⚔️',
    description: '主动寻找战斗，经验+50%，强化石+50%',
  },
  [AutoCollectMode.BALANCED]: {
    name: '平衡模式',
    icon: '⚖️',
    description: '均衡采集与战斗',
  },
};

// 采集机器人配置
// 1级机器人：60信用点/小时，6经验/小时，材料10个/小时，强化石2个/小时
export const COLLECT_ROBOTS: CollectRobot[] = [
  {
    id: 'robot_lv1',
    name: '基础采集机器人',
    level: 1,
    description: '标准的资源采集机器人，适合基础资源收集',
    icon: '🤖',
    baseRewards: {
      gold: 60,           // 60信用点/小时
      exp: 6,             // 6经验/小时
      materialsPerHour: 10,   // 10个材料/小时
      enhanceStonesPerHour: 2, // 2个强化石/小时
    },
  },
];

// 默认机器人
export const DEFAULT_ROBOT = COLLECT_ROBOTS[0];

// 获取采集机器人
export function getCollectRobot(robotId: string): CollectRobot | undefined {
  return COLLECT_ROBOTS.find(robot => robot.id === robotId);
}

// 获取所有可用机器人
export function getAvailableRobots(): CollectRobot[] {
  return COLLECT_ROBOTS;
}

// 材料ID列表（用于随机掉落）
export const MATERIAL_IDS = [
  'mat_001', 'mat_002', 'mat_003', 'mat_004', 'mat_005',
  'mat_006', 'mat_007', 'mat_008', 'mat_009', 'mat_010',
];
