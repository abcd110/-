// 《星航荒宇》神明数据定义
// 基于《星航荒宇》世界观，神明是夺取规则权限的高阶生命

import { God, GodDomain, GodStatus, FactionType } from './types_new';

// ==================== 希腊神话神明 ====================

export const GREEK_GODS: God[] = [
  {
    id: 'god_helios',
    name: '赫利俄斯',
    domain: GodDomain.GREEK,
    title: '太阳神',
    description: '掌控光明与太阳法则的神明，曾是第一批被系统牵引进入无限荒原的玩家之一。',
    backstory: '赫利俄斯作为第一批觉醒太阳神力的玩家迅速崛起，却在联合其他神明抢夺系统权限时惨败。夺权失败后，利用残留权限将自身封印在青铜站台内，躲避系统的彻底清除。',
    status: GodStatus.HIDDEN,
    faction: FactionType.ORDER_GODS,
    abilities: [
      {
        name: '强光眩晕',
        description: '释放耀眼的太阳光芒，使敌人陷入眩晕状态',
        effect: '使目标眩晕2回合，无法行动',
        cooldown: 3,
      },
      {
        name: '太阳之怒',
        description: '召唤太阳神力进行攻击',
        effect: '造成150%攻击力的光属性伤害',
        cooldown: 2,
      },
    ],
    planetId: 'planet_helios',
    reputation: 0,
  },
  {
    id: 'god_zeus',
    name: '宙斯',
    domain: GodDomain.GREEK,
    title: '众神之王',
    description: '希腊神话中的众神之王，掌控雷电法则，是守序神盟的核心成员。',
    backstory: '宙斯作为第一批玩家的首领，曾统筹夺权计划。夺权失败后，被迫躲进中继站，利用奥林匹斯诸神的残留神力与系统权限碎片，将自身封印在残破的雕像群中。',
    status: GodStatus.HIDDEN,
    faction: FactionType.ORDER_GODS,
    abilities: [
      {
        name: '雷霆万钧',
        description: '召唤雷电进行毁灭性打击',
        effect: '造成200%攻击力的雷属性伤害，有30%概率麻痹目标',
        cooldown: 3,
      },
      {
        name: '神王威严',
        description: '释放神王的威压，震慑敌人',
        effect: '降低所有敌人20%攻击力，持续3回合',
        cooldown: 4,
      },
    ],
    planetId: 'planet_olympus',
    reputation: 0,
  },
  {
    id: 'god_apollo',
    name: '阿波罗',
    domain: GodDomain.GREEK,
    title: '光明与预言之神',
    description: '掌控光明、预言与艺术法则的神明，是最早觉醒预言神力的玩家。',
    backstory: '阿波罗曾试图通过预言预判系统动作，协助诸神夺权，却因预言偏差导致计划败露。夺权失败后，利用德尔斐圣地的神谕力量，将自身封印在站台深处的神谕祭坛下。',
    status: GodStatus.HIDDEN,
    faction: FactionType.ORDER_GODS,
    abilities: [
      {
        name: '神谕预言',
        description: '预知未来的片段，提前做好准备',
        effect: '下回合受到的伤害降低50%',
        cooldown: 3,
      },
      {
        name: '光明之箭',
        description: '射出凝聚光明力量的箭矢',
        effect: '造成120%攻击力的光属性伤害，无视防御',
        cooldown: 2,
      },
    ],
    planetId: 'planet_delphi',
    reputation: 0,
  },
  {
    id: 'god_poseidon',
    name: '波塞冬',
    domain: GodDomain.GREEK,
    title: '海神',
    description: '掌控海洋与水域法则的神明，是夺权计划的核心战力之一。',
    backstory: '波塞冬凭借海神神力掌控荒原边缘的伪海洋，夺权失败后，利用残留权限将自身封印在被风暴包裹的站台内。',
    status: GodStatus.HIDDEN,
    faction: FactionType.ORDER_GODS,
    abilities: [
      {
        name: '海啸冲击',
        description: '召唤海啸冲击敌人',
        effect: '造成180%攻击力的水属性伤害，有20%概率击退目标',
        cooldown: 3,
      },
      {
        name: '深海护盾',
        description: '召唤海水形成保护屏障',
        effect: '获得相当于最大生命值30%的护盾，持续3回合',
        cooldown: 4,
      },
    ],
    planetId: 'planet_poseidon',
    reputation: 0,
  },
];

// ==================== 北欧神话神明 ====================

export const NORDIC_GODS: God[] = [
  {
    id: 'god_loki',
    name: '洛基',
    domain: GodDomain.NORDIC,
    title: '诡计之神',
    description: '掌控诡计与变化法则的神明，是第一批玩家中的核心谋划者。',
    backstory: '洛基主导了抢夺系统权限的计划，失败后利用自身诡计天赋，用浓雾遮蔽站台气息，躲在站台深处。暗中联络其他神明，密谋重启夺权计划。',
    status: GodStatus.HIDDEN,
    faction: FactionType.CHAOS_GODS,
    abilities: [
      {
        name: '诡计幻象',
        description: '制造幻象迷惑敌人',
        effect: '使目标陷入混乱状态，有50%概率攻击友方',
        cooldown: 3,
      },
      {
        name: '暗影步',
        description: '融入阴影中，难以被击中',
        effect: '闪避率提升50%，持续2回合',
        cooldown: 4,
      },
    ],
    planetId: 'planet_valhalla',
    reputation: -50,
  },
  {
    id: 'god_thor',
    name: '托尔',
    domain: GodDomain.NORDIC,
    title: '雷神',
    description: '掌控雷电与力量法则的神明，是第一批玩家中的战力核心。',
    backstory: '托尔在夺权大战中损耗惨重，失败后利用彩虹桥碎片的空间神力，将自身封印在站台的水晶深处。因夺权失败而暴怒，会释放残留的雷电神力干扰玩家。',
    status: GodStatus.HOSTILE,
    faction: FactionType.ORDER_GODS,
    abilities: [
      {
        name: '雷神之锤',
        description: '投掷雷神之锤进行毁灭性打击',
        effect: '造成250%攻击力的雷属性伤害，必定暴击',
        cooldown: 4,
      },
      {
        name: '雷霆护盾',
        description: '召唤雷电环绕自身',
        effect: '对攻击者反弹50%伤害，持续3回合',
        cooldown: 3,
      },
    ],
    planetId: 'planet_bifrost',
    reputation: -100,
  },
  {
    id: 'god_mimir',
    name: '密米尔',
    domain: GodDomain.NORDIC,
    title: '智慧之神',
    description: '掌控智慧与知识法则的巨人，是第一批玩家中的智囊。',
    backstory: '密米尔负责破解系统权限的核心密码，在夺权大战中被系统重创。躲进智库站台，利用智慧神力将整个站台冰封，守护着当年破解系统权限的相关记录。',
    status: GodStatus.NEUTRAL,
    faction: FactionType.ORDER_GODS,
    abilities: [
      {
        name: '智慧启迪',
        description: '运用智慧找到敌人的弱点',
        effect: '目标的防御降低30%，持续3回合',
        cooldown: 3,
      },
      {
        name: '冰封陷阱',
        description: '设置智慧谜题陷阱',
        effect: '使目标冻结1回合，无法行动',
        cooldown: 2,
      },
    ],
    planetId: 'planet_mimir',
    reputation: 0,
  },
  {
    id: 'god_hel',
    name: '赫尔',
    domain: GodDomain.NORDIC,
    title: '冥界女王',
    description: '掌控死亡与冥界法则的神明，负责操控残魂协助诸神夺权。',
    backstory: '赫尔夺权失败后，利用冥界神力在荒原边缘搭建了驿站，收纳战死的第一批玩家残魂。虽不敌视玩家，却极度珍视自身的权限残留。',
    status: GodStatus.NEUTRAL,
    faction: FactionType.ORDER_GODS,
    abilities: [
      {
        name: '冥界召唤',
        description: '召唤冥界残魂协助战斗',
        effect: '召唤2个残魂协助战斗，持续3回合',
        cooldown: 5,
      },
      {
        name: '死亡之触',
        description: '触碰敌人，吸取生命力',
        effect: '造成100%攻击力的伤害，恢复等量生命值',
        cooldown: 2,
      },
    ],
    planetId: 'planet_hel',
    reputation: 0,
  },
];

// ==================== 神明集合 ====================

export const ALL_GODS: God[] = [...GREEK_GODS, ...NORDIC_GODS];

// ==================== 工具函数 ====================

/**
 * 根据ID获取神明
 */
export function getGodById(id: string): God | undefined {
  return ALL_GODS.find(god => god.id === id);
}

/**
 * 根据星球ID获取神明
 */
export function getGodByPlanetId(planetId: string): God | undefined {
  return ALL_GODS.find(god => god.planetId === planetId);
}

/**
 * 获取指定神话体系的所有神明
 */
export function getGodsByDomain(domain: GodDomain): God[] {
  return ALL_GODS.filter(god => god.domain === domain);
}

/**
 * 获取指定势力的所有神明
 */
export function getGodsByFaction(faction: FactionType): God[] {
  return ALL_GODS.filter(god => god.faction === faction);
}

/**
 * 获取指定状态的所有神明
 */
export function getGodsByStatus(status: GodStatus): God[] {
  return ALL_GODS.filter(god => god.status === status);
}

/**
 * 修改神明与玩家的关系值
 */
export function modifyGodReputation(god: God, amount: number): God {
  return {
    ...god,
    reputation: Math.max(-1000, Math.min(1000, god.reputation + amount)),
  };
}

/**
 * 改变神明状态
 */
export function changeGodStatus(god: God, newStatus: GodStatus): God {
  return {
    ...god,
    status: newStatus,
  };
}

/**
 * 获取神明关系状态描述
 */
export function getGodRelationDescription(reputation: number): string {
  if (reputation >= 500) return '崇敬';
  if (reputation >= 200) return '友好';
  if (reputation >= -200) return '中立';
  if (reputation >= -500) return '警惕';
  return '敌对';
}

/**
 * 获取神明能力描述文本
 */
export function getGodAbilityDescription(godId: string): string {
  const god = getGodById(godId);
  if (!god) return '';
  
  return god.abilities.map(ability => 
    `${ability.name}：${ability.description}（冷却：${ability.cooldown}回合）`
  ).join('\n');
}

export default ALL_GODS;
