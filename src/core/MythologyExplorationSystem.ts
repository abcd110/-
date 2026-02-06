import { DeityStatus } from '../data/types';
import type { MythologyLocation, DeityInfo, CoreItem } from '../data/types';
import { MYTHOLOGY_LOCATIONS, getMythologyLocationById } from '../data/mythologyLocations';
import { getItemNameWithIcon } from '../data/itemNames';

// 探索结果类型
export enum ExplorationResultType {
  SUCCESS = 'success',           // 成功
  PARTIAL = 'partial',           // 部分成功
  FAILURE = 'failure',           // 失败
  DEITY_INTERFERENCE = 'deity_interference', // 神明干扰
  CORE_ITEM_FOUND = 'core_item_found', // 发现核心道具
  STORY_UNLOCKED = 'story_unlocked', // 解锁剧情
  COMBAT = 'combat',             // 遭遇战斗
  RESOURCE_FOUND = 'resource_found', // 发现资源
  EVENT_TRIGGERED = 'event_triggered', // 触发事件
}

// 探索结果
export interface ExplorationResult {
  type: ExplorationResultType;
  success: boolean;
  message: string;
  logs: string[];
  explorationProgress: number;    // 当前探索进度
  progressGained: number;         // 本次获得的进度
  loot: string[];                 // 获得的物品
  deityInterference?: {           // 神明干扰信息
    effectName: string;
    effectDescription: string;
    duration: number;
  };
  storyFragment?: string;         // 解锁的故事片段
  coreItemProgress?: number;      // 核心道具收集进度
  combatInfo?: {                  // 战斗信息
    enemyName: string;
    enemyHp: number;
    enemyMaxHp: number;
    enemyAttack: number;
    enemyDefense: number;
    loot: string[];
  };
  eventType?: string;             // 事件类型
}

// 探索状态
export interface MythologyExplorationState {
  currentLocationId: string | null;
  explorationProgress: number;
  turnCount: number;
  maxTurns: number;
  deityHostilityLevel: number;    // 当前敌意等级
  interferenceTriggered: boolean; // 是否已触发干扰
  coreItemCollected: boolean;     // 是否已收集核心道具
  storyFragmentsFound: string[];  // 已发现的故事片段
  resourcesFound: string[];       // 已发现的资源
  combatCount: number;            // 战斗次数
}

// 探索事件类型
interface ExplorationEvent {
  type: 'resource' | 'story' | 'trap' | 'blessing' | 'discovery';
  name: string;
  description: string;
  probability: number;
  effect: (state: MythologyExplorationState, location: MythologyLocation) => { logs: string[]; progressBonus: number; loot: string[] };
}

// 探索事件库
const EXPLORATION_EVENTS: ExplorationEvent[] = [
  {
    type: 'resource',
    name: '物资发现',
    description: '在站台角落发现了一些有用的物资',
    probability: 0.25,
    effect: (state, location) => {
      const possibleLoot = location.stationMonster.loot;
      const loot = possibleLoot.slice(0, Math.floor(Math.random() * 2) + 1);
      return {
        logs: [`💎 在站台角落发现了一些物资！`, ...loot.map(item => `  获得：${getItemNameWithIcon(item)}`)],
        progressBonus: 5,
        loot,
      };
    },
  },
  {
    type: 'story',
    name: '古老记录',
    description: '发现了一些关于神明的记录',
    probability: 0.15,
    effect: (state, location) => {
      const fragments = location.deity.storyFragments;
      const fragment = fragments.length > 0 
        ? fragments[Math.floor(Math.random() * fragments.length)]
        : '一段模糊的记载...';
      return {
        logs: [`📜 发现了关于${location.deity.name}的古老记录：`, `  "${fragment}"`],
        progressBonus: 8,
        loot: [],
      };
    },
  },
  {
    type: 'trap',
    name: '机关陷阱',
    description: '触发了站台内的防御机关',
    probability: 0.12,
    effect: (state, location) => {
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
      };
    },
  },
  {
    type: 'blessing',
    name: '神力残留',
    description: '感受到了神力的庇佑',
    probability: 0.08,
    effect: (state, location) => {
      const blessings = [
        { name: '速度提升', effect: '移动速度暂时提升' },
        { name: '感知增强', effect: '感知能力暂时增强' },
        { name: '幸运降临', effect: '运气暂时变好' },
      ];
      const blessing = blessings[Math.floor(Math.random() * blessings.length)];
      return {
        logs: [`✨ 感受到${location.deity.name}的神力残留！`, `  ${blessing.name}：${blessing.effect}`],
        progressBonus: 15,
        loot: ['ancient_coin'],
      };
    },
  },
  {
    type: 'discovery',
    name: '隐藏区域',
    description: '发现了一个隐藏的区域',
    probability: 0.10,
    effect: (state, location) => {
      return {
        logs: [`🔍 发现了一个隐藏区域！`, `  这里似乎藏着重要的秘密...`],
        progressBonus: 12,
        loot: location.stationMonster.loot.slice(0, 1),
      };
    },
  },
];

// 神话站台探索系统
export class MythologyExplorationSystem {
  private state: MythologyExplorationState;
  private location: MythologyLocation | null = null;

  constructor() {
    this.state = {
      currentLocationId: null,
      explorationProgress: 0,
      turnCount: 0,
      maxTurns: 10,
      deityHostilityLevel: 0,
      interferenceTriggered: false,
      coreItemCollected: false,
      storyFragmentsFound: [],
      resourcesFound: [],
      combatCount: 0,
    };
  }

  // 开始探索
  startExploration(locationId: string): { success: boolean; message: string } {
    const location = getMythologyLocationById(locationId);
    if (!location) {
      return { success: false, message: '站台不存在' };
    }

    if (!location.isUnlocked) {
      return { success: false, message: '该站台尚未解锁' };
    }

    if (location.isCompleted) {
      return { success: false, message: '该站台已攻略完成' };
    }

    this.location = location;
    this.state = {
      currentLocationId: locationId,
      explorationProgress: location.explorationProgress,
      turnCount: 0,
      maxTurns: 10 + Math.floor(location.deity.hostilityLevel / 20), // 敌意越高，回合越少
      deityHostilityLevel: location.deity.hostilityLevel,
      interferenceTriggered: false,
      coreItemCollected: false,
      storyFragmentsFound: [],
      resourcesFound: [],
      combatCount: 0,
    };

    return {
      success: true,
      message: `开始探索【${location.name}】，神明【${location.deity.name}】正在注视着你...`,
    };
  }

  // 执行探索行动
  explore(): ExplorationResult {
    if (!this.location) {
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

    this.state.turnCount++;
    const logs: string[] = [];
    let progressGained = 0;
    const loot: string[] = [];
    let interference = null;
    const storyFragment = null;
    let eventTriggered = false;

    // 检查是否触发神明干扰（20%概率）
    if (!this.state.interferenceTriggered && Math.random() < 0.2) {
      interference = this.triggerDeityInterference();
      if (interference) {
        logs.push(`【神明干扰】${interference.effectName}！`);
        logs.push(`  ${interference.effectDescription}`);
        this.state.interferenceTriggered = true;
        progressGained -= 5; // 干扰减少进度
      }
    }

    // 计算基础进度收益
    const baseProgress = 10 + Math.random() * 15;
    progressGained += Math.floor(baseProgress);

    // 根据神明状态调整进度
    if (this.location.deity.status === DeityStatus.HOSTILE) {
      progressGained = Math.floor(progressGained * 0.7);
      logs.push(`⚠️ ${this.location.deity.name}的敌意降低了探索效率...`);
    } else if (this.location.deity.status === DeityStatus.NEUTRAL) {
      progressGained = Math.floor(progressGained * 1.2);
      logs.push(`✨ ${this.location.deity.name}的态度让探索更加顺利...`);
    }

    // 触发随机探索事件（40%概率）
    if (Math.random() < 0.4) {
      const event = this.selectRandomEvent();
      if (event) {
        eventTriggered = true;
        const eventResult = event.effect(this.state, this.location);
        logs.push(`【${event.name}】${event.description}`);
        logs.push(...eventResult.logs);
        progressGained += eventResult.progressBonus;
        loot.push(...eventResult.loot);
      }
    }

    // 如果没有触发事件，显示默认探索信息
    if (!eventTriggered && !interference) {
      const defaultMessages = [
        '你仔细搜索着站台的每个角落...',
        '空气中弥漫着古老的气息...',
        '你感受到了神力的波动...',
        '站台的深处似乎有什么在等待着...',
        '你小心翼翼地前进着...',
      ];
      logs.push(defaultMessages[Math.floor(Math.random() * defaultMessages.length)]);
    }

    // 更新探索进度
    this.state.explorationProgress = Math.min(100, Math.max(0, this.state.explorationProgress + progressGained));

    // 检查是否完成探索
    let resultType = ExplorationResultType.SUCCESS;
    if (this.state.explorationProgress >= 100) {
      resultType = ExplorationResultType.CORE_ITEM_FOUND;
      this.state.coreItemCollected = true;
      logs.push(`🎉 【重大发现】获得了核心道具：${this.location.coreItem.icon} ${this.location.coreItem.name}！`);
      logs.push(`  ${this.location.coreItem.effectDescription}`);
    } else if (this.state.turnCount >= this.state.maxTurns) {
      resultType = ExplorationResultType.PARTIAL;
      logs.push('⏰ 探索时间耗尽，只能暂时撤退...');
    }

    return {
      type: resultType,
      success: this.state.explorationProgress >= 100,
      message: logs[logs.length - 1] || '探索进行中...',
      logs,
      explorationProgress: this.state.explorationProgress,
      progressGained,
      loot,
      deityInterference: interference || undefined,
      storyFragment: storyFragment || undefined,
      coreItemProgress: this.state.coreItemCollected ? 100 : this.state.explorationProgress,
      eventType: eventTriggered ? 'random_event' : undefined,
    };
  }

  // 选择随机事件
  private selectRandomEvent(): ExplorationEvent | null {
    const rand = Math.random();
    let cumulativeProbability = 0;
    
    for (const event of EXPLORATION_EVENTS) {
      cumulativeProbability += event.probability;
      if (rand < cumulativeProbability) {
        return event;
      }
    }
    return null;
  }

  // 触发神明干扰
  private triggerDeityInterference(): { effectName: string; effectDescription: string; duration: number } | null {
    if (!this.location) return null;

    const effects = this.location.interferenceEffects;
    if (effects.length === 0) return null;

    const randomEffect = effects[Math.floor(Math.random() * effects.length)];
    if (Math.random() < randomEffect.triggerChance) {
      return {
        effectName: randomEffect.name,
        effectDescription: randomEffect.description,
        duration: 2 + Math.floor(Math.random() * 3),
      };
    }
    return null;
  }

  // 与神明互动
  interactWithDeity(action: 'pray' | 'provoke' | 'negotiate'): { success: boolean; message: string; hostilityChange: number; logs: string[] } {
    if (!this.location) {
      return { success: false, message: '未开始探索', hostilityChange: 0, logs: [] };
    }

    const deity = this.location.deity;
    let hostilityChange = 0;
    const logs: string[] = [];

    switch (action) {
      case 'pray':
        if (deity.status === DeityStatus.HOSTILE) {
          hostilityChange = -5;
          logs.push(`🙏 你向${deity.name}祈祷，神明的敌意略微降低...`);
        } else {
          hostilityChange = -10;
          logs.push(`🙏 你的虔诚让${deity.name}感到满意，敌意降低了`);
        }
        // 祈祷有20%概率获得祝福
        if (Math.random() < 0.2) {
          logs.push(`✨ ${deity.name}赐予你祝福，探索进度增加！`);
          this.state.explorationProgress = Math.min(100, this.state.explorationProgress + 10);
        }
        break;
      case 'provoke':
        hostilityChange = 20;
        logs.push(`😤 你的挑衅激怒了${deity.name}！敌意大幅上升！`);
        // 挑衅有30%概率触发战斗
        if (Math.random() < 0.3) {
          logs.push(`⚠️ ${deity.name}召唤了守卫！`);
        }
        break;
      case 'negotiate':
        if (Math.random() < 0.5) {
          hostilityChange = -15;
          logs.push(`💬 谈判成功，${deity.name}愿意暂时合作`);
          // 谈判成功可能获得情报
          if (Math.random() < 0.3) {
            logs.push(`📜 从${deity.name}那里获得了重要情报！`);
            this.state.explorationProgress = Math.min(100, this.state.explorationProgress + 5);
          }
        } else {
          hostilityChange = 10;
          logs.push(`💬 谈判失败，${deity.name}更加警惕了`);
        }
        break;
    }

    this.state.deityHostilityLevel = Math.max(0, Math.min(100, this.state.deityHostilityLevel + hostilityChange));
    return { success: true, message: logs[0], hostilityChange, logs };
  }

  // 结束探索
  endExploration(): { success: boolean; message: string; finalProgress: number } {
    if (!this.location) {
      return { success: false, message: '未开始探索', finalProgress: 0 };
    }

    const finalProgress = this.state.explorationProgress;
    const isCompleted = finalProgress >= 100;

    // 更新站台的探索进度
    this.location.explorationProgress = finalProgress;
    if (isCompleted) {
      this.location.isCompleted = true;
    }

    // 解锁下一个站台
    if (isCompleted) {
      const nextStation = MYTHOLOGY_LOCATIONS.find(
        loc => loc.stationNumber === this.location!.stationNumber + 1
      );
      if (nextStation && !nextStation.isUnlocked) {
        nextStation.isUnlocked = true;
        nextStation.deity.isUnlocked = true;
      }
    }

    const message = isCompleted
      ? `【攻略完成】${this.location.name}探索完成！获得了${this.location.coreItem.name}！`
      : `探索结束，当前进度：${finalProgress}%`;

    // 重置状态
    this.location = null;
    this.state.currentLocationId = null;

    return { success: isCompleted, message, finalProgress };
  }

  // 获取当前探索状态
  getExplorationState(): MythologyExplorationState {
    return { ...this.state };
  }

  // 获取当前站台
  getCurrentLocation(): MythologyLocation | null {
    return this.location;
  }

  // 检查是否需要战斗
  checkCombat(): { shouldCombat: boolean; enemyName: string; enemyDescription: string; combatInfo?: { enemyHp: number; enemyMaxHp: number; enemyAttack: number; enemyDefense: number; loot: string[] } } {
    if (!this.location) {
      return { shouldCombat: false, enemyName: '', enemyDescription: '' };
    }

    // 25%概率触发战斗（降低概率便于测试）
    if (Math.random() < 0.25) {
      this.state.combatCount++;
      // 根据站台危险等级生成敌人属性（降低数值便于测试）
      const dangerLevel = this.location.dangerLevel;
      const enemyHp = 30 + dangerLevel * 10; // 降低血量
      const enemyAttack = 5 + dangerLevel * 2; // 降低攻击
      const enemyDefense = 2 + dangerLevel; // 降低防御
      
      return {
        shouldCombat: true,
        enemyName: this.location.stationMonster.name,
        enemyDescription: this.location.stationMonster.description,
        combatInfo: {
          enemyHp,
          enemyMaxHp: enemyHp,
          enemyAttack,
          enemyDefense,
          loot: this.location.stationMonster.loot,
        },
      };
    }
    return { shouldCombat: false, enemyName: '', enemyDescription: '' };
  }

  // 执行战斗
  executeCombat(playerAttack: number, playerDefense: number, playerHp: number): { won: boolean; damageDealt: number; damageTaken: number; loot: string[]; logs: string[] } {
    if (!this.location) {
      return { won: false, damageDealt: 0, damageTaken: 0, loot: [], logs: ['战斗错误'] };
    }

    const combatInfo = this.checkCombat();
    if (!combatInfo.combatInfo) {
      return { won: false, damageDealt: 0, damageTaken: 0, loot: [], logs: ['没有战斗信息'] };
    }

    const enemy = combatInfo.combatInfo;
    let enemyCurrentHp = enemy.enemyHp;
    let playerCurrentHp = playerHp;
    const logs: string[] = [];
    
    logs.push(`⚔️ 战斗开始！VS ${combatInfo.enemyName}`);
    logs.push(`  敌人 HP: ${enemy.enemyHp} | 攻击: ${enemy.enemyAttack} | 防御: ${enemy.enemyDefense}`);

    // 简化战斗逻辑（回合制）
    let round = 0;
    const maxRounds = 10;
    
    while (enemyCurrentHp > 0 && playerCurrentHp > 0 && round < maxRounds) {
      round++;
      
      // 玩家攻击
      const playerDamage = Math.max(1, playerAttack - enemy.enemyDefense + Math.floor(Math.random() * 5));
      enemyCurrentHp -= playerDamage;
      logs.push(`  第${round}回合：你造成 ${playerDamage} 点伤害`);
      
      if (enemyCurrentHp <= 0) break;
      
      // 敌人攻击
      const enemyDamage = Math.max(1, enemy.enemyAttack - playerDefense + Math.floor(Math.random() * 3));
      playerCurrentHp -= enemyDamage;
      logs.push(`  敌人反击，造成 ${enemyDamage} 点伤害`);
    }

    const won = enemyCurrentHp <= 0;
    const damageDealt = enemy.enemyHp - Math.max(0, enemyCurrentHp);
    const damageTaken = playerHp - Math.max(0, playerCurrentHp);
    
    if (won) {
      const loot = enemy.loot.slice(0, Math.floor(Math.random() * 2) + 1);
      logs.push(`🎉 战斗胜利！获得战利品：`);
      loot.forEach(item => logs.push(`  ${getItemNameWithIcon(item)}`));
      return { won: true, damageDealt, damageTaken, loot, logs };
    } else {
      logs.push(`💀 战斗失败...你撤退了`);
      return { won: false, damageDealt, damageTaken, loot: [], logs };
    }
  }

  // 获取荒原怪物信息
  getWildernessMonsterInfo(): { name: string; description: string; speedRequirement: number } | null {
    if (!this.location) return null;
    return this.location.wildMonster;
  }
}

// 导出单例
export const mythologyExplorationSystem = new MythologyExplorationSystem();
