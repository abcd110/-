// 《星航荒宇》势力系统扩展
// 包含声望任务、势力商店、势力事件等功能

import {
  FactionType,
  FactionStatus,
  FactionReputation,
  FactionQuest,
  FactionShopItem,
  FactionEvent,
  QuestDifficulty,
  ItemRarity,
} from './types_new';
import { FACTIONS, getFaction, calculateFactionStatus, getFactionStatusName } from './factions';

// ==================== 势力任务数据 ====================

export const FACTION_QUESTS: FactionQuest[] = [
  // 银河联邦任务
  {
    id: 'fed_quest_001',
    factionId: FactionType.FEDERATION,
    title: '清理虚空生物',
    description: '阿尔法宜居星附近出现了大量虚空生物，威胁拓荒者安全。前往清理这些威胁。',
    difficulty: QuestDifficulty.EASY,
    requiredReputation: -1000,
    objectives: [
      { type: 'kill', targetId: 'void_beast', count: 5 },
    ],
    rewards: {
      reputation: 50,
      credits: 100,
      items: [{ itemId: 'federation_supplies', count: 1 }],
    },
    timeLimit: 24, // 小时
  },
  {
    id: 'fed_quest_002',
    factionId: FactionType.FEDERATION,
    title: '采集星核碎片',
    description: '联邦科研院急需星核碎片进行研究。前往废土星采集资源。',
    difficulty: QuestDifficulty.NORMAL,
    requiredReputation: 0,
    objectives: [
      { type: 'collect', targetId: 'star_core_fragment', count: 10 },
    ],
    rewards: {
      reputation: 80,
      credits: 200,
      items: [{ itemId: 'tech_blueprint', count: 1 }],
    },
    timeLimit: 48,
  },
  {
    id: 'fed_quest_003',
    factionId: FactionType.FEDERATION,
    title: '护送商船',
    description: '一支联邦商船队即将前往艾普西隆贸易星，需要护航。',
    difficulty: QuestDifficulty.HARD,
    requiredReputation: 100,
    objectives: [
      { type: 'escort', targetId: 'merchant_fleet', count: 1 },
      { type: 'kill', targetId: 'space_pirate', count: 8 },
    ],
    rewards: {
      reputation: 150,
      credits: 500,
      items: [{ itemId: 'rare_materials', count: 3 }],
    },
    timeLimit: 72,
  },
  {
    id: 'fed_quest_004',
    factionId: FactionType.FEDERATION,
    title: '调查混沌神庭活动',
    description: '情报显示混沌神庭在边境星球有异常活动。前往调查并阻止他们的阴谋。',
    difficulty: QuestDifficulty.VERY_HARD,
    requiredReputation: 300,
    objectives: [
      { type: 'investigate', targetId: 'chaos_activity', count: 3 },
      { type: 'kill', targetId: 'chaos_cultist', count: 10 },
    ],
    rewards: {
      reputation: 250,
      credits: 1000,
      items: [{ itemId: 'advanced_tech', count: 2 }, { itemId: 'federation_medal', count: 1 }],
    },
    timeLimit: 96,
  },

  // 守序神盟任务
  {
    id: 'order_quest_001',
    factionId: FactionType.ORDER_GODS,
    title: '收集神能碎片',
    description: '守序神盟需要更多神能碎片来维持神域星的稳定。前往神域星收集。',
    difficulty: QuestDifficulty.NORMAL,
    requiredReputation: 0,
    objectives: [
      { type: 'collect', targetId: 'god_energy_fragment', count: 8 },
    ],
    rewards: {
      reputation: 100,
      credits: 150,
      items: [{ itemId: 'divine_blessing', count: 1 }],
    },
    timeLimit: 48,
  },
  {
    id: 'order_quest_002',
    factionId: FactionType.ORDER_GODS,
    title: '驱逐虚空入侵者',
    description: '赫利俄斯神域星遭到虚空生物入侵。帮助太阳神驱逐这些亵渎者。',
    difficulty: QuestDifficulty.HARD,
    requiredReputation: 200,
    objectives: [
      { type: 'kill', targetId: 'void_invader', count: 15 },
      { type: 'defend', targetId: 'helios_shrine', count: 1 },
    ],
    rewards: {
      reputation: 200,
      credits: 400,
      items: [{ itemId: 'solar_essence', count: 2 }, { itemId: 'helios_favor', count: 1 }],
    },
    timeLimit: 72,
  },
  {
    id: 'order_quest_003',
    factionId: FactionType.ORDER_GODS,
    title: '寻找失落的神器',
    description: '一件古老的神器遗失在星际空间中。找回它，神盟将给予丰厚奖励。',
    difficulty: QuestDifficulty.VERY_HARD,
    requiredReputation: 500,
    objectives: [
      { type: 'find', targetId: 'ancient_artifact', count: 1 },
      { type: 'kill', targetId: 'artifact_guardian', count: 5 },
    ],
    rewards: {
      reputation: 350,
      credits: 800,
      items: [{ itemId: 'god_equipment', count: 1 }, { itemId: 'divine_permission', count: 1 }],
    },
    timeLimit: 120,
  },

  // 混沌神庭任务（需要负声望或特殊条件）
  {
    id: 'chaos_quest_001',
    factionId: FactionType.CHAOS_GODS,
    title: '破坏联邦航轨',
    description: '混沌神庭需要削弱联邦的控制。破坏他们的星际航轨系统。',
    difficulty: QuestDifficulty.HARD,
    requiredReputation: -200,
    objectives: [
      { type: 'sabotage', targetId: 'federation_route', count: 3 },
      { type: 'kill', targetId: 'federation_patrol', count: 6 },
    ],
    rewards: {
      reputation: 150,
      credits: 600,
      items: [{ itemId: 'chaos_essence', count: 3 }],
    },
    timeLimit: 72,
  },
  {
    id: 'chaos_quest_002',
    factionId: FactionType.CHAOS_GODS,
    title: '献祭神能',
    description: '向混沌神庭献祭神能碎片，证明你对混沌的忠诚。',
    difficulty: QuestDifficulty.NORMAL,
    requiredReputation: -500,
    objectives: [
      { type: 'sacrifice', targetId: 'god_energy_fragment', count: 20 },
    ],
    rewards: {
      reputation: 200,
      credits: 400,
      items: [{ itemId: 'chaos_blessing', count: 1 }, { itemId: 'corrupted_relic', count: 1 }],
    },
    timeLimit: 48,
  },

  // 星骸佣兵团任务
  {
    id: 'debris_quest_001',
    factionId: FactionType.STAR_DEBRIS,
    title: '打捞废弃物资',
    description: '废土星上有大量可回收物资。帮佣兵团打捞这些资源。',
    difficulty: QuestDifficulty.EASY,
    requiredReputation: -1000,
    objectives: [
      { type: 'collect', targetId: 'scrap_metal', count: 15 },
      { type: 'collect', targetId: 'salvage_parts', count: 10 },
    ],
    rewards: {
      reputation: 60,
      credits: 150,
      items: [{ itemId: 'salvage_tech', count: 2 }],
    },
    timeLimit: 36,
  },
  {
    id: 'debris_quest_002',
    factionId: FactionType.STAR_DEBRIS,
    title: '黑市交易',
    description: '在黑市枢纽完成一笔交易，证明你是可靠的合作伙伴。',
    difficulty: QuestDifficulty.NORMAL,
    requiredReputation: 0,
    objectives: [
      { type: 'trade', targetId: 'black_market', count: 1 },
      { type: 'deliver', targetId: 'contraband', count: 5 },
    ],
    rewards: {
      reputation: 100,
      credits: 300,
      items: [{ itemId: 'black_market_goods', count: 3 }],
    },
    timeLimit: 48,
  },
  {
    id: 'debris_quest_003',
    factionId: FactionType.STAR_DEBRIS,
    title: '劫掠联邦运输队',
    description: '一支联邦运输队即将经过，这是发财的好机会。',
    difficulty: QuestDifficulty.HARD,
    requiredReputation: 100,
    objectives: [
      { type: 'raid', targetId: 'federation_transport', count: 1 },
      { type: 'kill', targetId: 'federation_guard', count: 8 },
    ],
    rewards: {
      reputation: 180,
      credits: 700,
      items: [{ itemId: 'stolen_goods', count: 5 }, { itemId: 'military_supplies', count: 3 }],
    },
    timeLimit: 60,
  },
];

// ==================== 势力商店数据 ====================

export const FACTION_SHOPS: Record<FactionType, FactionShopItem[]> = {
  [FactionType.FEDERATION]: [
    {
      id: 'fed_shop_001',
      itemId: 'basic_repair_kit',
      name: '基础维修套件',
      description: '用于维修航船的基础工具包',
      price: 50,
      requiredReputation: 0,
      requiredStatus: FactionStatus.NEUTRAL,
      stock: 99,
      rarity: ItemRarity.COMMON,
    },
    {
      id: 'fed_shop_002',
      itemId: 'energy_core',
      name: '能量核心',
      description: '航船能源系统的核心组件',
      price: 150,
      requiredReputation: 100,
      requiredStatus: FactionStatus.NEUTRAL,
      stock: 50,
      rarity: ItemRarity.UNCOMMON,
    },
    {
      id: 'fed_shop_003',
      itemId: 'advanced_weapon',
      name: '联邦制式武器',
      description: '联邦军队标准配备的舰载武器',
      price: 500,
      requiredReputation: 300,
      requiredStatus: FactionStatus.FRIENDLY,
      stock: 10,
      rarity: ItemRarity.RARE,
    },
    {
      id: 'fed_shop_004',
      itemId: 'shield_generator',
      name: '护盾发生器',
      description: '先进的虚空护盾发生器',
      price: 800,
      requiredReputation: 500,
      requiredStatus: FactionStatus.FRIENDLY,
      stock: 5,
      rarity: ItemRarity.RARE,
    },
    {
      id: 'fed_shop_005',
      itemId: 'federation_medal',
      name: '联邦荣誉勋章',
      description: '象征联邦最高荣誉的勋章，可兑换特殊奖励',
      price: 2000,
      requiredReputation: 800,
      requiredStatus: FactionStatus.ALLIED,
      stock: 1,
      rarity: ItemRarity.LEGENDARY,
    },
    {
      id: 'fed_shop_006',
      itemId: 'prototype_tech',
      name: '原型科技蓝图',
      description: '联邦最新研发的科技蓝图，仅限同盟者购买',
      price: 5000,
      requiredReputation: 1000,
      requiredStatus: FactionStatus.ALLIED,
      stock: 1,
      rarity: ItemRarity.MYTHIC,
    },
  ],

  [FactionType.ORDER_GODS]: [
    {
      id: 'order_shop_001',
      itemId: 'god_energy_fragment',
      name: '神能碎片',
      description: '蕴含神性能量的碎片，可用于强化装备',
      price: 100,
      requiredReputation: 0,
      requiredStatus: FactionStatus.NEUTRAL,
      stock: 99,
      rarity: ItemRarity.UNCOMMON,
    },
    {
      id: 'order_shop_002',
      itemId: 'divine_blessing',
      name: '神明祝福',
      description: '获得神明的祝福，临时提升属性',
      price: 200,
      requiredReputation: 200,
      requiredStatus: FactionStatus.NEUTRAL,
      stock: 20,
      rarity: ItemRarity.RARE,
    },
    {
      id: 'order_shop_003',
      itemId: 'god_equipment',
      name: '神能装备',
      description: '蕴含神力的装备，威力强大',
      price: 1000,
      requiredReputation: 500,
      requiredStatus: FactionStatus.FRIENDLY,
      stock: 3,
      rarity: ItemRarity.EPIC,
    },
    {
      id: 'order_shop_004',
      itemId: 'divine_permission',
      name: '神域通行证',
      description: '允许进入更高等级的神域星',
      price: 1500,
      requiredReputation: 800,
      requiredStatus: FactionStatus.ALLIED,
      stock: 1,
      rarity: ItemRarity.LEGENDARY,
    },
    {
      id: 'order_shop_005',
      itemId: 'god_contract',
      name: '神契卷轴',
      description: '与神明签订契约的卷轴，可获得神契者身份',
      price: 3000,
      requiredReputation: 1000,
      requiredStatus: FactionStatus.ALLIED,
      stock: 1,
      rarity: ItemRarity.MYTHIC,
    },
  ],

  [FactionType.CHAOS_GODS]: [
    {
      id: 'chaos_shop_001',
      itemId: 'chaos_essence',
      name: '混沌精华',
      description: '蕴含混沌能量的精华，危险但强大',
      price: 150,
      requiredReputation: -500,
      requiredStatus: FactionStatus.UNFRIENDLY,
      stock: 50,
      rarity: ItemRarity.UNCOMMON,
    },
    {
      id: 'chaos_shop_002',
      itemId: 'corrupted_relic',
      name: '腐化遗物',
      description: '被混沌腐化的古老遗物',
      price: 400,
      requiredReputation: -300,
      requiredStatus: FactionStatus.UNFRIENDLY,
      stock: 10,
      rarity: ItemRarity.RARE,
    },
    {
      id: 'chaos_shop_003',
      itemId: 'chaos_weapon',
      name: '混沌武器',
      description: '充满混沌能量的武器，威力巨大但有副作用',
      price: 800,
      requiredReputation: 0,
      requiredStatus: FactionStatus.NEUTRAL,
      stock: 5,
      rarity: ItemRarity.EPIC,
    },
    {
      id: 'chaos_shop_004',
      itemId: 'void_tech',
      name: '虚空科技',
      description: '混沌神庭掌握的禁忌科技',
      price: 2000,
      requiredReputation: 300,
      requiredStatus: FactionStatus.FRIENDLY,
      stock: 2,
      rarity: ItemRarity.LEGENDARY,
    },
  ],

  [FactionType.STAR_DEBRIS]: [
    {
      id: 'debris_shop_001',
      itemId: 'scrap_metal',
      name: '废金属',
      description: '回收的金属材料，可用于制造',
      price: 10,
      requiredReputation: -1000,
      requiredStatus: FactionStatus.HOSTILE,
      stock: 999,
      rarity: ItemRarity.COMMON,
    },
    {
      id: 'debris_shop_002',
      itemId: 'salvage_parts',
      name: '回收零件',
      description: '从废弃航船上回收的可用零件',
      price: 30,
      requiredReputation: -500,
      requiredStatus: FactionStatus.UNFRIENDLY,
      stock: 100,
      rarity: ItemRarity.COMMON,
    },
    {
      id: 'debris_shop_003',
      itemId: 'black_market_goods',
      name: '黑市货物',
      description: '来路不明的货物，价格优惠',
      price: 200,
      requiredReputation: 0,
      requiredStatus: FactionStatus.NEUTRAL,
      stock: 20,
      rarity: ItemRarity.UNCOMMON,
    },
    {
      id: 'debris_shop_004',
      itemId: 'stolen_tech',
      name: '赃物科技',
      description: '从联邦偷来的科技产品',
      price: 600,
      requiredReputation: 200,
      requiredStatus: FactionStatus.FRIENDLY,
      stock: 5,
      rarity: ItemRarity.RARE,
    },
    {
      id: 'debris_shop_005',
      itemId: 'pirate_ship_design',
      name: '海盗船设计图',
      description: '星骸佣兵团专属航船设计图',
      price: 1500,
      requiredReputation: 500,
      requiredStatus: FactionStatus.FRIENDLY,
      stock: 1,
      rarity: ItemRarity.EPIC,
    },
  ],
};

// ==================== 势力事件数据 ====================

export const FACTION_EVENTS: FactionEvent[] = [
  {
    id: 'fed_event_001',
    factionId: FactionType.FEDERATION,
    title: '联邦征兵令',
    description: '联邦正在招募拓荒者对抗混沌神庭的威胁。加入可获得丰厚奖励。',
    triggerCondition: { type: 'reputation', value: 100 },
    choices: [
      {
        text: '接受征兵',
        effect: { reputation: 100, credits: 500 },
      },
      {
        text: '拒绝',
        effect: { reputation: -50 },
      },
    ],
  },
  {
    id: 'order_event_001',
    factionId: FactionType.ORDER_GODS,
    title: '神明的召唤',
    description: '守序神盟的神明感受到了你的潜力，邀请你前往神域星一见。',
    triggerCondition: { type: 'reputation', value: 300 },
    choices: [
      {
        text: '前往拜见',
        effect: { reputation: 150, items: [{ itemId: 'divine_blessing', count: 1 }] },
      },
      {
        text: '婉拒',
        effect: { reputation: -30 },
      },
    ],
  },
  {
    id: 'chaos_event_001',
    factionId: FactionType.CHAOS_GODS,
    title: '混沌的低语',
    description: '混沌神庭向你发出邀请，承诺给予你超越凡人的力量。',
    triggerCondition: { type: 'reputation', value: -200 },
    choices: [
      {
        text: '接受混沌',
        effect: { reputation: 200, items: [{ itemId: 'chaos_essence', count: 3 }] },
      },
      {
        text: '拒绝诱惑',
        effect: { reputation: -100 },
      },
    ],
  },
  {
    id: 'debris_event_001',
    factionId: FactionType.STAR_DEBRIS,
    title: '黑市邀请',
    description: '星骸佣兵团邀请你加入他们的一次"特殊行动"。',
    triggerCondition: { type: 'reputation', value: 100 },
    choices: [
      {
        text: '参与行动',
        effect: { reputation: 120, credits: 800 },
      },
      {
        text: '拒绝参与',
        effect: { reputation: -80 },
      },
    ],
  },
];

// ==================== 势力系统工具类 ====================

export class FactionSystem {
  /**
   * 获取势力可接取的任务
   */
  static getAvailableQuests(factionId: FactionType, reputation: number): FactionQuest[] {
    return FACTION_QUESTS.filter(
      quest => quest.factionId === factionId && reputation >= quest.requiredReputation
    );
  }

  /**
   * 获取势力商店商品
   */
  static getShopItems(factionId: FactionType, reputation: number, status: FactionStatus): FactionShopItem[] {
    const items = FACTION_SHOPS[factionId] || [];
    return items.filter(
      item => reputation >= item.requiredReputation && this.isStatusSufficient(status, item.requiredStatus)
    );
  }

  /**
   * 检查声望状态是否满足要求
   */
  private static isStatusSufficient(current: FactionStatus, required: FactionStatus): boolean {
    const statusOrder = [
      FactionStatus.HOSTILE,
      FactionStatus.UNFRIENDLY,
      FactionStatus.NEUTRAL,
      FactionStatus.FRIENDLY,
      FactionStatus.ALLIED,
    ];
    return statusOrder.indexOf(current) >= statusOrder.indexOf(required);
  }

  /**
   * 获取触发的势力事件
   */
  static getTriggeredEvents(factionId: FactionType, reputation: number): FactionEvent[] {
    return FACTION_EVENTS.filter(
      event => event.factionId === factionId && 
               event.triggerCondition.type === 'reputation' &&
               reputation >= event.triggerCondition.value
    );
  }

  /**
   * 计算购买折扣
   */
  static getDiscount(reputation: number): number {
    if (reputation >= 800) return 0.7; // 同盟 7折
    if (reputation >= 300) return 0.85; // 友好 85折
    if (reputation >= 0) return 1.0; // 中立 原价
    if (reputation >= -300) return 1.15; // 不友好 115%
    return 1.3; // 敌对 130%
  }

  /**
   * 获取势力关系描述
   */
  static getRelationshipDescription(factionId: FactionType, reputation: number): string {
    const status = calculateFactionStatus(reputation);
    const statusName = getFactionStatusName(status);
    const faction = getFaction(factionId);
    
    if (!faction) return '未知势力';

    const descriptions: Record<FactionStatus, string> = {
      [FactionStatus.ALLIED]: `你是${faction.name}的亲密盟友，享有最高待遇。`,
      [FactionStatus.FRIENDLY]: `${faction.name}对你抱有好感，愿意提供更多帮助。`,
      [FactionStatus.NEUTRAL]: `${faction.name}对你保持中立态度。`,
      [FactionStatus.UNFRIENDLY]: `${faction.name}对你有所警惕，交易价格会提高。`,
      [FactionStatus.HOSTILE]: `${faction.name}视你为敌人，请小心行事。`,
    };

    return descriptions[status];
  }
}

export default FactionSystem;
