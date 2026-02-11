// 自动资源采集系统
// 采集机器人系统 - 派遣机器人自动收集资源

import {
  AutoCollectMode,
  AutoStopCondition,
  AutoCollectState,
  AutoCollectConfig,
  CollectReward,
  CollectRobot,
  getCollectRobot,
  getAvailableRobots,
  DEFAULT_ROBOT,
  MATERIAL_IDS,
} from '../data/autoCollectTypes';
import { getItemTemplate } from '../data/items';
import { ArmorQuality } from '../data/nanoArmorRecipes';

// 强化石ID
const ENHANCE_STONE_ID = 'enhance_stone';

// 材料品质后缀映射
const QUALITY_SUFFIX: Record<ArmorQuality, string> = {
  [ArmorQuality.STARDUST]: '_stardust',
  [ArmorQuality.ALLOY]: '_alloy',
  [ArmorQuality.CRYSTAL]: '_crystal',
  [ArmorQuality.QUANTUM]: '_quantum',
  [ArmorQuality.VOID]: '_void',
};

// 每日最大挂机时间（小时）
const MAX_DAILY_HOURS = 24;
// 单次最大挂机时间（小时）
const MAX_SESSION_HOURS = 8;

export class AutoCollectSystem {
  // 自动采集状态
  state: AutoCollectState = {
    isCollecting: false,
    startTime: 0,
    lastCollectTime: 0,
    robotId: DEFAULT_ROBOT.id,
    mode: AutoCollectMode.BALANCED,
    totalRewards: {
      gold: 0,
      exp: 0,
      materials: [],
      enhanceStones: 0,
    },
  };

  // 配置
  config: AutoCollectConfig = {
    robotId: DEFAULT_ROBOT.id,
    mode: AutoCollectMode.BALANCED,
    autoStopCondition: AutoStopCondition.FULL,
  };

  // 上次保存的时间戳（用于离线计算）
  lastSaveTime: number = Date.now();

  // 每日挂机时间跟踪
  dailyCollectHours: number = 0; // 今天已挂机时间
  lastCollectDate: string = ''; // 上次挂机日期 (YYYY-MM-DD)

  // 击败的星球boss记录（用于收益加成）
  defeatedBosses: Set<string> = new Set();

  // 序列化状态
  serialize() {
    return {
      state: this.state,
      config: this.config,
      lastSaveTime: this.lastSaveTime,
      dailyCollectHours: this.dailyCollectHours,
      lastCollectDate: this.lastCollectDate,
      defeatedBosses: Array.from(this.defeatedBosses),
    };
  }

  // 从存档加载
  load(data: any): void {
    if (data) {
      this.state = data.state || this.state;
      this.config = data.config || this.config;
      this.lastSaveTime = data.lastSaveTime || Date.now();
      this.dailyCollectHours = data.dailyCollectHours || 0;
      this.lastCollectDate = data.lastCollectDate || '';
      this.defeatedBosses = new Set(data.defeatedBosses || []);
    }
  }

  // 检查并重置每日挂机时间
  private checkDailyReset(): void {
    const today = new Date().toISOString().split('T')[0];
    if (today !== this.lastCollectDate) {
      this.dailyCollectHours = 0;
      this.lastCollectDate = today;
    }
  }

  // 获取今日剩余可挂机时间
  getRemainingDailyHours(): number {
    this.checkDailyReset();
    return Math.max(0, MAX_DAILY_HOURS - this.dailyCollectHours);
  }

  // 记录击败的星球boss
  recordDefeatedBoss(planetId: string): void {
    this.defeatedBosses.add(planetId);
  }

  // 获取收益加成倍率（每个击败的boss增加20%）
  getRewardMultiplier(): number {
    const bonus = this.defeatedBosses.size * 0.2;
    return 1 + bonus;
  }

  // 开始自动采集
  startCollect(robotId: string, mode: AutoCollectMode): { success: boolean; message: string } {
    const robot = getCollectRobot(robotId);
    if (!robot) {
      return { success: false, message: '采集机器人不存在' };
    }

    // 检查今日剩余挂机时间
    this.checkDailyReset();
    const remainingHours = this.getRemainingDailyHours();
    if (remainingHours <= 0) {
      return { success: false, message: '今日挂机时间已用完，请明天再试' };
    }

    const now = Date.now();
    this.state = {
      isCollecting: true,
      startTime: now,
      lastCollectTime: now,
      robotId,
      mode,
      totalRewards: {
        gold: 0,
        exp: 0,
        materials: [],
        enhanceStones: 0,
      },
    };

    this.config.robotId = robotId;
    this.config.mode = mode;
    this.lastSaveTime = now;

    return { success: true, message: `开始派遣${robot.name}进行自动采集（今日剩余${remainingHours.toFixed(1)}小时）` };
  }

  // 停止自动采集
  stopCollect(): { success: boolean; message: string; rewards?: CollectReward } {
    if (!this.state.isCollecting) {
      return { success: false, message: '当前没有进行自动采集' };
    }

    // 结算最终收益
    this.calculateOfflineRewards();

    const rewards = { ...this.state.totalRewards };
    const robot = getCollectRobot(this.state.robotId);

    this.state.isCollecting = false;
    this.state.startTime = 0;
    this.state.lastCollectTime = 0;

    return {
      success: true,
      message: `已停止${robot?.name || '机器人'}的自动采集`,
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
    if (rewards.gold === 0 && rewards.exp === 0 && rewards.materials.length === 0 && rewards.enhanceStones === 0) {
      return { success: false, message: '当前没有可领取的收益' };
    }

    // 清空累计收益
    this.state.totalRewards = {
      gold: 0,
      exp: 0,
      materials: [],
      enhanceStones: 0,
    };

    // 检查是否因达到8小时上限而自动停止
    if (!this.state.isCollecting) {
      return {
        success: true,
        message: '采集已完成（已达8小时上限），请重新派遣机器人',
        rewards,
      };
    }

    // 重置采集时长（重新计时）
    const now = Date.now();
    this.state.startTime = now;

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

    // 检查每日剩余时间
    this.checkDailyReset();
    const remainingDailyHours = this.getRemainingDailyHours();

    // 单次最多8小时，且不能超过今日剩余时间
    const maxSessionHours = Math.min(MAX_SESSION_HOURS, remainingDailyHours);
    const effectiveHours = Math.min(elapsedHours, maxSessionHours);

    if (effectiveHours <= 0) return;

    const robot = getCollectRobot(this.state.robotId);
    if (!robot) return;

    // 计算收益
    const rewards = this.generateRewards(robot, effectiveHours);

    // 累加到总收益
    this.state.totalRewards.gold += rewards.gold;
    this.state.totalRewards.exp += rewards.exp;
    this.state.totalRewards.enhanceStones += rewards.enhanceStones;

    // 合并材料
    rewards.materials.forEach(mat => {
      const existing = this.state.totalRewards.materials.find(m => m.itemId === mat.itemId);
      if (existing) {
        existing.quantity += mat.quantity;
      } else {
        this.state.totalRewards.materials.push({ ...mat });
      }
    });

    // 更新今日已挂机时间
    this.dailyCollectHours += effectiveHours;

    this.state.lastCollectTime = now;

    // 如果已达到单次采集上限（8小时），自动停止采集
    if (elapsedHours >= maxSessionHours) {
      this.state.isCollecting = false;
    }
  }

  // 生成收益
  private generateRewards(robot: CollectRobot, hours: number): CollectReward {
    const mode = this.state.mode;
    const base = robot.baseRewards;

    // 模式倍率
    // 资源采集：材料+50%，信用点+50%
    // 战斗巡逻：经验+50%，强化石+50%
    // 平衡模式：无额外加成
    let goldMultiplier = 1;
    let expMultiplier = 1;
    let materialMultiplier = 1;
    let enhanceStoneMultiplier = 1;

    switch (mode) {
      case AutoCollectMode.GATHER:
        materialMultiplier = 1.5;
        goldMultiplier = 1.5;
        break;
      case AutoCollectMode.COMBAT:
        expMultiplier = 1.5;
        enhanceStoneMultiplier = 1.5;
        break;
      case AutoCollectMode.BALANCED:
        // 平衡模式无额外加成
        break;
    }

    // Boss击败加成（每个击败的boss增加20%全收益）
    const bossMultiplier = this.getRewardMultiplier();
    goldMultiplier *= bossMultiplier;
    expMultiplier *= bossMultiplier;
    materialMultiplier *= bossMultiplier;
    enhanceStoneMultiplier *= bossMultiplier;

    // 计算信用点
    const gold = Math.floor(base.gold * hours * goldMultiplier * (0.9 + Math.random() * 0.2));

    // 计算经验
    const exp = Math.floor(base.exp * hours * expMultiplier * (0.9 + Math.random() * 0.2));

    // 计算材料掉落
    const materials: { itemId: string; name: string; quantity: number }[] = [];
    const expectedMaterialDrops = base.materialsPerHour * materialMultiplier * hours;
    const actualMaterialDrops = Math.floor(expectedMaterialDrops) + (Math.random() < (expectedMaterialDrops % 1) ? 1 : 0);

    for (let i = 0; i < actualMaterialDrops; i++) {
      const baseMatId = MATERIAL_IDS[Math.floor(Math.random() * MATERIAL_IDS.length)];
      // 自动采集默认产出星尘级品质材料
      const qualityId = `${baseMatId}${QUALITY_SUFFIX[ArmorQuality.STARDUST]}`;
      const matTemplate = getItemTemplate(qualityId);
      if (matTemplate) {
        const existing = materials.find(m => m.itemId === qualityId);
        if (existing) {
          existing.quantity++;
        } else {
          materials.push({ itemId: qualityId, name: matTemplate.name, quantity: 1 });
        }
      }
    }

    // 计算强化石掉落
    const expectedEnhanceStones = base.enhanceStonesPerHour * enhanceStoneMultiplier * hours;
    const enhanceStones = Math.floor(expectedEnhanceStones) + (Math.random() < (expectedEnhanceStones % 1) ? 1 : 0);

    return {
      gold,
      exp,
      materials,
      enhanceStones,
    };
  }

  // 获取当前采集时长（毫秒）
  getCollectingDuration(): number {
    if (!this.state.isCollecting) return 0;
    const elapsedMs = Date.now() - this.state.startTime;
    const maxSessionMs = MAX_SESSION_HOURS * 60 * 60 * 1000; // 8小时转换为毫秒
    // 如果达到8小时上限，自动停止采集
    if (elapsedMs >= maxSessionMs) {
      this.state.isCollecting = false;
      return maxSessionMs;
    }
    return elapsedMs;
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
    const robot = getCollectRobot(this.state.robotId);
    if (!robot) {
      return { gold: 0, exp: 0, materials: [], enhanceStones: 0 };
    }

    return this.generateRewards(robot, 1);
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

  // 获取可用的采集地点（兼容旧接口，返回机器人列表）
  getAvailableLocations(playerLevel: number): { id: string; name: string; description: string; icon: string; unlockRequirement?: { level?: number } }[] {
    return getAvailableRobots().map(robot => ({
      id: robot.id,
      name: robot.name,
      description: robot.description,
      icon: robot.icon,
    }));
  }
}
