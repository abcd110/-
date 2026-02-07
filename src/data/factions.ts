// 《星航荒宇》势力数据定义
// 四大核心势力：银河联邦、守序神盟、混沌神庭、星骸佣兵团

import { Faction, FactionType, FactionStatus, FactionReputation } from './types_new';

// ==================== 势力基础数据 ====================

export const FACTIONS: Map<FactionType, Faction> = new Map([
  [
    FactionType.FEDERATION,
    {
      id: FactionType.FEDERATION,
      name: '银河联邦',
      description: '由数十个人类宜居星、工业星组成的联邦制政权，掌控最先进的星轨跃迁技术与星际航船制造体系。',
      ideology: '科技永生、星际拓荒、资源自主。通过驾驶星际航船开拓新的宜居星、采集星核与神能碎片资源、铺设星际航轨，扩大联邦版图。',
      leader: '联邦议会',
      headquarters: '阿尔法宜居星（银河联邦首都）',
    }
  ],
  [
    FactionType.ORDER_GODS,
    {
      id: FactionType.ORDER_GODS,
      name: '守序神盟',
      description: '由12位掌控基础法则权限的神明组成，各自绑定一颗高阶神域星，主张隐匿权限、低调存续。',
      ideology: '安稳持有现有规则权限，规避天道删除。与银河联邦合作，提供神能碎片支撑拓荒航船，换取联邦保护神域星。',
      leader: '时空神',
      headquarters: '时序星',
    }
  ],
  [
    FactionType.CHAOS_GODS,
    {
      id: FactionType.CHAOS_GODS,
      name: '混沌神庭',
      description: '由7位掌控精神神能的神明组成，主张掠夺更多规则权限、打破天道约束。',
      ideology: '掠夺银河规则权限，破解天道检测机制。视联邦拓荒为威胁，经常袭击联邦拓荒航船、破坏星际航轨。',
      leader: '未知',
      headquarters: '幻海星',
    }
  ],
  [
    FactionType.STAR_DEBRIS,
    {
      id: FactionType.STAR_DEBRIS,
      name: '星骸佣兵团',
      description: '由被联邦抛弃的星际航船员、背叛神明的神契者、废土星幸存者组成的游离势力，无固定据点。',
      ideology: '生存与利益最大化。对联邦拓荒态度摇摆不定，既会承接委托，也会偷袭掠夺。',
      leader: '无统一首领',
      headquarters: '黑市枢纽（隐秘废弃科技星）',
    }
  ],
]);

// ==================== 势力声望工具函数 ====================

/**
 * 获取势力信息
 */
export function getFaction(factionId: FactionType): Faction | undefined {
  return FACTIONS.get(factionId);
}

/**
 * 获取所有势力列表
 */
export function getAllFactions(): Faction[] {
  return Array.from(FACTIONS.values());
}

/**
 * 计算声望对应的关系状态
 */
export function calculateFactionStatus(reputation: number): FactionStatus {
  if (reputation >= 800) return FactionStatus.ALLIED;
  if (reputation >= 300) return FactionStatus.FRIENDLY;
  if (reputation >= -300) return FactionStatus.NEUTRAL;
  if (reputation >= -800) return FactionStatus.UNFRIENDLY;
  return FactionStatus.HOSTILE;
}

/**
 * 获取声望状态的中文名称
 */
export function getFactionStatusName(status: FactionStatus): string {
  const statusNames: Record<FactionStatus, string> = {
    [FactionStatus.HOSTILE]: '敌对',
    [FactionStatus.UNFRIENDLY]: '不友好',
    [FactionStatus.NEUTRAL]: '中立',
    [FactionStatus.FRIENDLY]: '友好',
    [FactionStatus.ALLIED]: '同盟',
  };
  return statusNames[status];
}

/**
 * 获取势力名称
 */
export function getFactionName(factionId: FactionType): string {
  const faction = FACTIONS.get(factionId);
  return faction?.name || factionId;
}

// ==================== 初始声望配置 ====================

/**
 * 创建初始势力声望（新玩家）
 */
export function createInitialReputations(): FactionReputation[] {
  return [
    {
      factionId: FactionType.FEDERATION,
      reputation: 100,  // 玩家所属势力，初始友好
      status: FactionStatus.FRIENDLY,
    },
    {
      factionId: FactionType.ORDER_GODS,
      reputation: 0,    // 合作伙伴，初始中立
      status: FactionStatus.NEUTRAL,
    },
    {
      factionId: FactionType.CHAOS_GODS,
      reputation: -200, // 敌对势力，初始不友好
      status: FactionStatus.UNFRIENDLY,
    },
    {
      factionId: FactionType.STAR_DEBRIS,
      reputation: 0,    // 游离势力，初始中立
      status: FactionStatus.NEUTRAL,
    },
  ];
}

// ==================== 声望变动工具函数 ====================

/**
 * 修改势力声望
 */
export function modifyReputation(
  reputations: FactionReputation[],
  factionId: FactionType,
  amount: number
): FactionReputation[] {
  return reputations.map(rep => {
    if (rep.factionId === factionId) {
      const newReputation = Math.max(-1000, Math.min(1000, rep.reputation + amount));
      return {
        ...rep,
        reputation: newReputation,
        status: calculateFactionStatus(newReputation),
      };
    }
    return rep;
  });
}

/**
 * 获取指定势力的声望
 */
export function getReputation(
  reputations: FactionReputation[],
  factionId: FactionType
): number {
  return reputations.find(rep => rep.factionId === factionId)?.reputation || 0;
}

/**
 * 获取指定势力的关系状态
 */
export function getReputationStatus(
  reputations: FactionReputation[],
  factionId: FactionType
): FactionStatus {
  return reputations.find(rep => rep.factionId === factionId)?.status || FactionStatus.NEUTRAL;
}

// ==================== 势力互动配置 ====================

/**
 * 势力互动效果配置
 */
export interface FactionInteractionEffect {
  reputationChange: number;
  description: string;
}

/**
 * 势力互动类型
 */
export enum FactionInteractionType {
  COMPLETE_QUEST = 'complete_quest',       // 完成任务
  DEFEAT_ENEMY = 'defeat_enemy',           // 击败敌人
  TRADE = 'trade',                         // 交易
  DONATE = 'donate',                       // 捐赠
  BETRAY = 'betray',                       // 背叛
  ATTACK = 'attack',                       // 攻击
}

/**
 * 势力互动效果表
 */
export const FACTION_INTERACTION_EFFECTS: Record<FactionType, Record<FactionInteractionType, FactionInteractionEffect>> = {
  [FactionType.FEDERATION]: {
    [FactionInteractionType.COMPLETE_QUEST]: { reputationChange: 50, description: '完成联邦任务' },
    [FactionInteractionType.DEFEAT_ENEMY]: { reputationChange: 10, description: '击败混沌势力' },
    [FactionInteractionType.TRADE]: { reputationChange: 5, description: '与联邦交易' },
    [FactionInteractionType.DONATE]: { reputationChange: 20, description: '向联邦捐赠资源' },
    [FactionInteractionType.BETRAY]: { reputationChange: -200, description: '背叛联邦' },
    [FactionInteractionType.ATTACK]: { reputationChange: -100, description: '攻击联邦单位' },
  },
  [FactionType.ORDER_GODS]: {
    [FactionInteractionType.COMPLETE_QUEST]: { reputationChange: 40, description: '完成神明委托' },
    [FactionInteractionType.DEFEAT_ENEMY]: { reputationChange: 15, description: '击败混沌势力' },
    [FactionInteractionType.TRADE]: { reputationChange: 8, description: '与神盟交易' },
    [FactionInteractionType.DONATE]: { reputationChange: 25, description: '向神明献祭' },
    [FactionInteractionType.BETRAY]: { reputationChange: -300, description: '背叛神盟' },
    [FactionInteractionType.ATTACK]: { reputationChange: -150, description: '攻击神域星' },
  },
  [FactionType.CHAOS_GODS]: {
    [FactionInteractionType.COMPLETE_QUEST]: { reputationChange: 30, description: '完成混沌任务' },
    [FactionInteractionType.DEFEAT_ENEMY]: { reputationChange: -20, description: '击败混沌单位' },
    [FactionInteractionType.TRADE]: { reputationChange: 10, description: '与混沌交易' },
    [FactionInteractionType.DONATE]: { reputationChange: 15, description: '向混沌献祭' },
    [FactionInteractionType.BETRAY]: { reputationChange: -100, description: '背叛混沌' },
    [FactionInteractionType.ATTACK]: { reputationChange: 50, description: '攻击联邦单位' },
  },
  [FactionType.STAR_DEBRIS]: {
    [FactionInteractionType.COMPLETE_QUEST]: { reputationChange: 25, description: '完成佣兵委托' },
    [FactionInteractionType.DEFEAT_ENEMY]: { reputationChange: -10, description: '击败佣兵' },
    [FactionInteractionType.TRADE]: { reputationChange: 10, description: '与佣兵团交易' },
    [FactionInteractionType.DONATE]: { reputationChange: 15, description: '向佣兵团捐赠' },
    [FactionInteractionType.BETRAY]: { reputationChange: -150, description: '背叛佣兵团' },
    [FactionInteractionType.ATTACK]: { reputationChange: -50, description: '攻击佣兵' },
  },
};

/**
 * 执行势力互动
 */
export function executeFactionInteraction(
  reputations: FactionReputation[],
  factionId: FactionType,
  interactionType: FactionInteractionType
): { newReputations: FactionReputation[]; effect: FactionInteractionEffect } {
  const effect = FACTION_INTERACTION_EFFECTS[factionId][interactionType];
  const newReputations = modifyReputation(reputations, factionId, effect.reputationChange);
  return { newReputations, effect };
}

// ==================== 势力商店权限 ====================

/**
 * 根据声望获取商店折扣
 */
export function getShopDiscount(reputation: number): number {
  if (reputation >= 800) return 0.7;  // 同盟：7折
  if (reputation >= 300) return 0.85; // 友好：85折
  if (reputation >= -300) return 1.0; // 中立：原价
  if (reputation >= -800) return 1.2; // 不友好：120%
  return 1.5; // 敌对：150%
}

/**
 * 根据声望获取可购买物品等级
 */
export function getMaxShopItemLevel(reputation: number): number {
  if (reputation >= 800) return 12;
  if (reputation >= 500) return 10;
  if (reputation >= 300) return 8;
  if (reputation >= 0) return 6;
  if (reputation >= -300) return 4;
  return 0; // 敌对无法购买
}

export default FACTIONS;
