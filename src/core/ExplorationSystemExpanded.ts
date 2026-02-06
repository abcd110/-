// ============================================
// 膨胀版探索系统核心逻辑
// 基于《列车求生·10个普通站台专属设定（膨胀改造版）》
// ============================================

import {
  ExplorationResultType,
  ExplorationResult,
  ExplorationState,
  EnemyStats,
  EnemyTier,
  PowerStats,
  ExplorationConfig,
} from '../data/types';

import {
  REGULAR_LOCATIONS,
  LOCATIONS,
  calculateEnemyStats,
  calculateExplorationRewards,
  getRecommendedPower,
  getEnemyTierInfo,
} from '../data/locations';

// 探索事件类型
interface ExplorationEvent {
  type: 'resource' | 'combat' | 'trap' | 'discovery' | 'rest';
  name: string;
  description: string;
  probability: number;
  effect: (state: ExplorationState) => {
    logs: string[];
    progressBonus: number;
    loot: string[];
    staminaCost?: number;
  };
}

// 默认探索配置
const DEFAULT_EXPLORATION_CONFIG: ExplorationConfig = {
  baseExplorationTime: 30,
  staminaCostPerTurn: 5,
  maxTurnsPerExploration: 10,
  progressPerTurn: 10,
  progressBonusForCombat: 15,
  progressBonusForDiscovery: 20,
  combatTriggerChance: 0.3,
  eliteCombatChance: 0.2,
  bossTriggerThreshold: 80,
  baseLootChance: 0.5,
  rareLootThreshold: 50,
  epicLootThreshold: 80,
};

// 探索事件库
const EXPLORATION_EVENTS: ExplorationEvent[] = [
  {
    type: 'resource',
    name: '物资发现',
    description: '在站台角落发现了一些有用的物资',
    probability: 0.25,
    effect: () => ({
      logs: ['💎 在站台角落发现了一些物资！'],
      progressBonus: 5,
      loot: ['resource_pack'],
    }),
  },
  {
    type: 'discovery',
    name: '隐藏区域',
    description: '发现了一个隐藏的区域',
    probability: 0.15,
    effect: () => ({
      logs: ['🔍 发现了一个隐藏区域！', '  这里似乎藏着重要的秘密...'],
      progressBonus: 12,
      loot: ['hidden_item'],
    }),
  },
  {
    type: 'trap',
    name: '机关陷阱',
    description: '触发了站台内的防御机关',
    probability: 0.12,
    effect: () => {
      const traps = [
        { name: '落石陷阱', damage: '受到轻微伤害' },
        { name: '毒气泄漏', damage: '吸入有毒气体' },
        { name: '电击机关', damage: '被电流击中' },
        { name: '冰冻陷阱', damage: '陷入冰冻状态' },
      ];
      const trap = traps[Math.floor(Math.random() * traps.length)];
      return {
        logs: [`⚠️ 触发了${trap.name}！`, `  ${trap.damage}，探索进度减缓`],
        progressBonus: -5,
        loot: [],
        staminaCost: 3,
      };
    },
  },
  {
    type: 'rest',
    name: '安全区域',
    description: '找到了一个可以短暂休息的安全区域',
    probability: 0.08,
    effect: () => ({
      logs: ['✨ 找到了一个安全区域！', '  体力略微恢复'],
      progressBonus: 8,
      loot: [],
      staminaCost: -2,
    }),
  },
];

// 战力计算
function calculatePower(stats: PowerStats): number {
  return (
    0.4 * stats.attack +
    0.3 * stats.defense +
    0.15 * stats.hp +
    0.1 * stats.attackSpeed * 100 +
    0.05 * (stats.hitRate + stats.dodgeRate + stats.critRate * 200) +
    0.1 * stats.penetration * 100
  );
}

// 物理减免计算
function calculatePhysicalReduction(defense: number, level: number = 1): number {
  return defense / (defense + level * 100 + 500);
}

// 命中率计算
function calculateHitRate(hitRate: number, dodgeRate: number): number {
  return hitRate / (hitRate + dodgeRate * 0.8);
}

// 伤害计算
function calculateDamage(
  attackerAttack: number,
  skillCoefficient: number,
  defenderDefense: number,
  defenderLevel: number,
  penetration: number = 0
): number {
  const reduction = calculatePhysicalReduction(defenderDefense, defenderLevel);
  const effectiveReduction = Math.max(0, reduction - penetration);
  return Math.floor(attackerAttack * skillCoefficient * (1 - effectiveReduction));
}

// 膨胀版探索系统
export class ExplorationSystemExpanded {
  private state: ExplorationState;
  private currentLocationId: string | null = null;
  private config = DEFAULT_EXPLORATION_CONFIG;

  constructor() {
    this.state = {
      currentLocationId: null,
      explorationProgress: 0,
      turnCount: 0,
      maxTurns: this.config.maxTurnsPerExploration,
      combatCount: 0,
      resourcesFound: [],
      isBossDefeated: false,
      isCompleted: false,
    };
  }

  // 开始探索
  startExploration(locationId: string): { success: boolean; message: string } {
    const location = REGULAR_LOCATIONS.find(l => l.id === locationId);
    if (!location) {
      return { success: false, message: '站台不存在' };
    }

    this.currentLocationId = locationId;
    this.state = {
      currentLocationId: locationId,
      explorationProgress: 0,
      turnCount: 0,
      maxTurns: this.config.maxTurnsPerExploration,
      combatCount: 0,
      resourcesFound: [],
      isBossDefeated: false,
      isCompleted: false,
    };

    return {
      success: true,
      message: `开始探索【${location.name}】，推荐战力：${location.recommendedPower}`,
    };
  }

  // 执行探索回合
  explore(): ExplorationResult {
    if (!this.currentLocationId) {
      return {
        type: ExplorationResultType.FAILURE,
        success: false,
        message: '未开始探索',
        logs: ['请先选择一个站台开始探索'],
        explorationProgress: 0,
        progressGained: 0,
        loot: [],
      };
    }

    const location = REGULAR_LOCATIONS.find(l => l.id === this.currentLocationId);
    if (!location) {
      return {
        type: ExplorationResultType.FAILURE,
        success: false,
        message: '站台数据错误',
        logs: ['站台数据不存在'],
        explorationProgress: 0,
        progressGained: 0,
        loot: [],
      };
    }

    this.state.turnCount++;
    const logs: string[] = [];
    let progressGained = this.config.progressPerTurn;
    const loot: { itemId: string; quantity: number; name: string }[] = [];
    let combatInfo = undefined;

    // 检查是否触发战斗
    const combatRoll = Math.random();
    if (combatRoll < this.config.combatTriggerChance) {
      const isElite = Math.random() < this.config.eliteCombatChance;
      const tier = isElite ? location.eliteEnemyTier : location.enemyTier;
      const enemyTypes = isElite ? location.eliteEnemyTypes : location.enemyTypes;
      const enemyName = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];

      const enemyStats = calculateEnemyStats(tier, location.baseEnemyLevel);

      combatInfo = {
        enemyName,
        enemyHp: enemyStats.hp,
        enemyMaxHp: enemyStats.hp,
        enemyAttack: enemyStats.attack,
        enemyDefense: enemyStats.defense,
        enemyTier: tier,
        loot: this.generateCombatLoot(tier),
      };

      logs.push(`⚔️ 遭遇了${isElite ? '精英' : ''}敌人【${enemyName}】！`);
      logs.push(`  等级：${tier} | HP：${enemyStats.hp} | 攻击：${enemyStats.attack}`);

      progressGained += this.config.progressBonusForCombat;
      this.state.combatCount++;

      return {
        type: ExplorationResultType.COMBAT,
        success: true,
        message: `遭遇敌人【${enemyName}】`,
        logs,
        explorationProgress: this.state.explorationProgress,
        progressGained: 0,
        loot: [],
        combatInfo,
      };
    }

    // 触发随机事件
    const eventRoll = Math.random();
    let cumulativeProbability = 0;
    let triggeredEvent: ExplorationEvent | null = null;

    for (const event of EXPLORATION_EVENTS) {
      cumulativeProbability += event.probability;
      if (eventRoll < cumulativeProbability) {
        triggeredEvent = event;
        break;
      }
    }

    if (triggeredEvent) {
      const eventResult = triggeredEvent.effect(this.state);
      logs.push(`【${triggeredEvent.name}】${triggeredEvent.description}`);
      logs.push(...eventResult.logs);
      progressGained += eventResult.progressBonus;

      if (triggeredEvent.type === 'resource' || triggeredEvent.type === 'discovery') {
        const rewards = calculateExplorationRewards(
          this.currentLocationId,
          20,
          false
        );
        loot.push(...rewards);
        rewards.forEach(r => {
          logs.push(`  获得：${r.name} x${r.quantity}`);
        });
      }
    } else {
      const defaultMessages = [
        '你仔细搜索着站台的每个角落...',
        '空气中弥漫着古老的气息...',
        '你感受到了危险的气息...',
        '站台的深处似乎有什么在等待着...',
        '你小心翼翼地前进着...',
      ];
      logs.push(defaultMessages[Math.floor(Math.random() * defaultMessages.length)]);
    }

    this.state.explorationProgress = Math.min(100, Math.max(0, this.state.explorationProgress + progressGained));

    let resultType = ExplorationResultType.SUCCESS;
    if (this.state.explorationProgress >= 100) {
      resultType = ExplorationResultType.SUCCESS;
      logs.push('🎉 探索进度达到100%！可以挑战BOSS了！');
    } else if (this.state.turnCount >= this.state.maxTurns) {
      resultType = ExplorationResultType.PARTIAL;
      logs.push('⏰ 探索回合耗尽，只能暂时撤退...');
    }

    return {
      type: resultType,
      success: this.state.explorationProgress >= 100,
      message: logs[logs.length - 1] || '探索进行中...',
      logs,
      explorationProgress: this.state.explorationProgress,
      progressGained,
      loot,
    };
  }

  // 生成战斗奖励
  private generateCombatLoot(tier: EnemyTier): string[] {
    const lootTable: Record<EnemyTier, string[]> = {
      'T1': ['mat_common_1', 'mat_common_2'],
      'T1+': ['mat_common_1', 'mat_common_2', 'mat_rare_1'],
      'T2': ['mat_common_1', 'mat_rare_1', 'mat_rare_2'],
      'T2+': ['mat_rare_1', 'mat_rare_2', 'mat_epic_1'],
      'T3': ['mat_rare_2', 'mat_epic_1', 'mat_epic_2'],
      'T3+': ['mat_epic_1', 'mat_epic_2', 'mat_legendary_1'],
      'T3++': ['mat_epic_2', 'mat_legendary_1', 'mat_legendary_2'],
      'T4': ['mat_legendary_1', 'mat_legendary_2', 'mat_mythic_1'],
      'T4+': ['mat_legendary_2', 'mat_mythic_1', 'mat_mythic_2'],
      'T5': ['mat_mythic_1', 'mat_mythic_2', 'mat_divine_1'],
      'T5+': ['mat_mythic_2', 'mat_divine_1', 'mat_divine_2'],
      'T6': ['mat_divine_1', 'mat_divine_2', 'mat_god_1'],
      'T6+': ['mat_divine_2', 'mat_god_1', 'mat_god_2'],
      'T7': ['mat_god_1', 'mat_god_2', 'mat_primordial'],
      'T7+': ['mat_god_2', 'mat_primordial', 'mat_creation'],
      'T8': ['mat_primordial', 'mat_creation', 'mat_ultimate'],
    };

    return lootTable[tier] || lootTable['T1'];
  }

  // 挑战Boss
  challengeBoss(): ExplorationResult {
    if (!this.currentLocationId) {
      return {
        type: ExplorationResultType.FAILURE,
        success: false,
        message: '未开始探索',
        logs: ['请先选择一个站台开始探索'],
        explorationProgress: 0,
        progressGained: 0,
        loot: [],
      };
    }

    const location = REGULAR_LOCATIONS.find(l => l.id === this.currentLocationId);
    if (!location) {
      return {
        type: ExplorationResultType.FAILURE,
        success: false,
        message: '站台数据错误',
        logs: ['站台数据不存在'],
        explorationProgress: 0,
        progressGained: 0,
        loot: [],
      };
    }

    if (this.state.explorationProgress < this.config.bossTriggerThreshold) {
      return {
        type: ExplorationResultType.FAILURE,
        success: false,
        message: '探索进度不足',
        logs: [`需要达到${this.config.bossTriggerThreshold}%探索进度才能挑战BOSS`, `当前进度：${this.state.explorationProgress}%`],
        explorationProgress: this.state.explorationProgress,
        progressGained: 0,
        loot: [],
      };
    }

    const bossStats = calculateEnemyStats(location.bossTier, location.baseEnemyLevel);

    const combatInfo = {
      enemyName: location.bossName,
      enemyHp: bossStats.hp,
      enemyMaxHp: bossStats.hp,
      enemyAttack: bossStats.attack,
      enemyDefense: bossStats.defense,
      enemyTier: location.bossTier,
      loot: this.generateCombatLoot(location.bossTier),
    };

    return {
      type: ExplorationResultType.BOSS_ENCOUNTER,
      success: true,
      message: `遭遇BOSS【${location.bossName}】！`,
      logs: [
        `👹 BOSS战开始！`,
        `  敌人：${location.bossName}`,
        `  描述：${location.bossDescription}`,
        `  等级：${location.bossTier} | HP：${bossStats.hp} | 攻击：${bossStats.attack}`,
        `  特殊机制：${location.specialMechanics.join('、')}`,
      ],
      explorationProgress: this.state.explorationProgress,
      progressGained: 0,
      loot: [],
      combatInfo,
    };
  }

  // 战斗胜利处理
  combatVictory(isBoss: boolean = false): ExplorationResult {
    if (!this.currentLocationId) {
      return {
        type: ExplorationResultType.FAILURE,
        success: false,
        message: '未开始探索',
        logs: ['请先选择一个站台开始探索'],
        explorationProgress: 0,
        progressGained: 0,
        loot: [],
      };
    }

    const location = REGULAR_LOCATIONS.find(l => l.id === this.currentLocationId);
    if (!location) {
      return {
        type: ExplorationResultType.FAILURE,
        success: false,
        message: '站台数据错误',
        logs: ['站台数据不存在'],
        explorationProgress: 0,
        progressGained: 0,
        loot: [],
      };
    }

    const logs: string[] = ['🎉 战斗胜利！'];

    const rewards = calculateExplorationRewards(
      this.currentLocationId,
      isBoss ? 100 : 50,
      isBoss
    );

    rewards.forEach(r => {
      logs.push(`  获得：${r.name} x${r.quantity}`);
    });

    if (isBoss) {
      this.state.isBossDefeated = true;
      this.state.isCompleted = true;
      logs.push('🏆 BOSS被击败！站台攻略完成！');

      if (location.lootTable.epic) {
        const epicLoot = location.lootTable.epic[0];
        if (epicLoot) {
          logs.push(`  稀有掉落：${epicLoot.name}`);
          rewards.push({ itemId: epicLoot.itemId, quantity: 1, name: epicLoot.name });
        }
      }
    }

    return {
      type: isBoss ? ExplorationResultType.SUCCESS : ExplorationResultType.COMBAT,
      success: true,
      message: isBoss ? 'BOSS击败！站台攻略完成！' : '战斗胜利！',
      logs,
      explorationProgress: this.state.explorationProgress,
      progressGained: isBoss ? 100 - this.state.explorationProgress : 10,
      loot: rewards,
    };
  }

  // 结束探索
  endExploration(): { success: boolean; message: string; finalProgress: number; rewards: { itemId: string; quantity: number; name: string }[] } {
    if (!this.currentLocationId) {
      return { success: false, message: '未开始探索', finalProgress: 0, rewards: [] };
    }

    const finalProgress = this.state.explorationProgress;
    const isCompleted = this.state.isBossDefeated;

    const rewards = calculateExplorationRewards(this.currentLocationId, finalProgress, isCompleted);

    const message = isCompleted
      ? `【攻略完成】探索完成！获得了丰厚奖励！`
      : `探索结束，当前进度：${finalProgress}%`;

    this.currentLocationId = null;
    this.state.currentLocationId = null;

    return { success: isCompleted, message, finalProgress, rewards };
  }

  // 获取当前探索状态
  getExplorationState(): ExplorationState {
    return { ...this.state };
  }

  // 获取当前站台
  getCurrentLocation() {
    if (!this.currentLocationId) return null;
    return REGULAR_LOCATIONS.find(l => l.id === this.currentLocationId);
  }

  // 获取推荐战力
  getRecommendedPower(): number {
    if (!this.currentLocationId) return 0;
    return getRecommendedPower(this.currentLocationId);
  }

  // 检查是否可以挑战Boss
  canChallengeBoss(): boolean {
    return this.state.explorationProgress >= this.config.bossTriggerThreshold;
  }

  // 获取敌人等级信息
  getEnemyTierInfo() {
    if (!this.currentLocationId) return { normal: 'T1', elite: 'T1+', boss: 'T2' };
    return getEnemyTierInfo(this.currentLocationId);
  }

  // 计算玩家战力
  calculatePlayerPower(playerStats: PowerStats): number {
    return calculatePower(playerStats);
  }

  // 计算战斗伤害
  calculateCombatDamage(
    attackerAttack: number,
    skillCoefficient: number,
    defenderDefense: number,
    defenderLevel: number,
    penetration: number = 0
  ): number {
    return calculateDamage(attackerAttack, skillCoefficient, defenderDefense, defenderLevel, penetration);
  }

  // 获取所有站台
  getAllLocations() {
    return LOCATIONS;
  }

  // 获取站台信息
  getLocationInfo(locationId: string) {
    return REGULAR_LOCATIONS.find(l => l.id === locationId);
  }
}

// 导出单例
export const explorationSystemExpanded = new ExplorationSystemExpanded();
