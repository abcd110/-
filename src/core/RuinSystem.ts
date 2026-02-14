export enum RuinType {
  ABANDONED_STATION = 'abandoned_station',
  ANCIENT_RUINS = 'ancient_ruins',
  CRASHED_SHIP = 'crashed_ship',
  MYSTERIOUS_CAVE = 'mysterious_cave',
  ANCIENT_LAB = 'ancient_lab',
  VOID_RIFT = 'void_rift',
  CHIP_FACTORY = 'chip_factory',
  NEURAL_NEXUS = 'neural_nexus',
}

export enum RuinDifficulty {
  EASY = 'easy',
  NORMAL = 'normal',
  HARD = 'hard',
  NIGHTMARE = 'nightmare',
  HELL = 'hell',
}

export enum ExploreStatus {
  AVAILABLE = 'available',
  EXPLORING = 'exploring',
  COMPLETED = 'completed',
  LOCKED = 'locked',
}

export interface RuinReward {
  credits: number;
  items: { itemId: string; count: number; chance: number }[];
  experience: number;
}

export interface Ruin {
  id: string;
  name: string;
  type: RuinType;
  difficulty: RuinDifficulty;
  description: string;
  requiredLevel: number;
  duration: number;
  rewards: RuinReward;
  status: ExploreStatus;
  exploredAt?: number;
  assignedCrew?: string[];
  completedCount: number;
}

export interface ExploreMission {
  id: string;
  ruinId: string;
  crewIds: string[];
  startTime: number;
  endTime: number;
  status: 'ongoing' | 'completed' | 'failed';
}

export const RUIN_TYPE_CONFIG: Record<RuinType, { name: string; icon: string; color: string }> = {
  [RuinType.ABANDONED_STATION]: { name: '废弃空间站', icon: '🛸', color: '#6b7280' },
  [RuinType.ANCIENT_RUINS]: { name: '古代遗迹', icon: '🏛️', color: '#d97706' },
  [RuinType.CRASHED_SHIP]: { name: '坠毁飞船', icon: '🚀', color: '#ef4444' },
  [RuinType.MYSTERIOUS_CAVE]: { name: '神秘洞穴', icon: '🕳️', color: '#8b5cf6' },
  [RuinType.ANCIENT_LAB]: { name: '古代实验室', icon: '🔬', color: '#22c55e' },
  [RuinType.VOID_RIFT]: { name: '虚空裂缝', icon: '🌀', color: '#ec4899' },
  [RuinType.CHIP_FACTORY]: { name: '芯片工厂', icon: '🏭', color: '#06b6d4' },
  [RuinType.NEURAL_NEXUS]: { name: '神经枢纽', icon: '🧠', color: '#f59e0b' },
};

export const RUIN_DIFFICULTY_CONFIG: Record<RuinDifficulty, { name: string; color: string; multiplier: number }> = {
  [RuinDifficulty.EASY]: { name: '简单', color: '#22c55e', multiplier: 1.0 },
  [RuinDifficulty.NORMAL]: { name: '普通', color: '#3b82f6', multiplier: 1.5 },
  [RuinDifficulty.HARD]: { name: '困难', color: '#f59e0b', multiplier: 2.0 },
  [RuinDifficulty.NIGHTMARE]: { name: '噩梦', color: '#a855f7', multiplier: 3.0 },
  [RuinDifficulty.HELL]: { name: '地狱', color: '#ef4444', multiplier: 5.0 },
};

export const RUIN_TEMPLATES: Omit<Ruin, 'status' | 'exploredAt' | 'assignedCrew' | 'completedCount'>[] = [
  {
    id: 'ruin_001',
    name: '废弃的补给站',
    type: RuinType.ABANDONED_STATION,
    difficulty: RuinDifficulty.EASY,
    description: '一个被遗弃的补给站，可能还有一些有用的物资。',
    requiredLevel: 1,
    duration: 5 * 60 * 1000,
    rewards: {
      credits: 200,
      items: [
        { itemId: 'iron_ore', count: 5, chance: 0.8 },
        { itemId: 'copper_ore', count: 3, chance: 0.6 },
        { itemId: 'recruit_ticket_normal', count: 1, chance: 0.1 },
      ],
      experience: 50,
    },
  },
  {
    id: 'ruin_002',
    name: '古代文明遗迹',
    type: RuinType.ANCIENT_RUINS,
    difficulty: RuinDifficulty.NORMAL,
    description: '一处神秘的古代文明遗迹，据说藏有珍贵的科技遗物。',
    requiredLevel: 1,
    duration: 15 * 60 * 1000,
    rewards: {
      credits: 500,
      items: [
        { itemId: 'gene_material', count: 2, chance: 0.5 },
        { itemId: 'cyber_material', count: 2, chance: 0.5 },
        { itemId: 'chip_material', count: 3, chance: 0.4 },
      ],
      experience: 150,
    },
  },
  {
    id: 'ruin_003',
    name: '坠毁的运输船',
    type: RuinType.CRASHED_SHIP,
    difficulty: RuinDifficulty.NORMAL,
    description: '一艘坠毁的运输船，货舱里可能还有完好的货物。',
    requiredLevel: 1,
    duration: 10 * 60 * 1000,
    rewards: {
      credits: 400,
      items: [
        { itemId: 'mineral_iron', count: 10, chance: 0.7 },
        { itemId: 'mineral_copper', count: 8, chance: 0.6 },
        { itemId: 'mineral_titanium', count: 3, chance: 0.3 },
      ],
      experience: 120,
    },
  },
  {
    id: 'ruin_004',
    name: '神秘洞穴',
    type: RuinType.MYSTERIOUS_CAVE,
    difficulty: RuinDifficulty.HARD,
    description: '一个充满未知生物的洞穴系统，传说深处有宝藏。',
    requiredLevel: 2,
    duration: 30 * 60 * 1000,
    rewards: {
      credits: 1000,
      items: [
        { itemId: 'mineral_crystal', count: 5, chance: 0.4 },
        { itemId: 'gene_material', count: 5, chance: 0.5 },
        { itemId: 'recruit_ticket_limited', count: 1, chance: 0.1 },
      ],
      experience: 300,
    },
  },
  {
    id: 'ruin_005',
    name: '古代实验室',
    type: RuinType.ANCIENT_LAB,
    difficulty: RuinDifficulty.HARD,
    description: '一个被遗弃的高科技实验室，可能还有实验样本。',
    requiredLevel: 2,
    duration: 45 * 60 * 1000,
    rewards: {
      credits: 1500,
      items: [
        { itemId: 'cyber_core', count: 1, chance: 0.3 },
        { itemId: 'cyber_material', count: 8, chance: 0.6 },
        { itemId: 'gene_material', count: 8, chance: 0.6 },
      ],
      experience: 500,
    },
  },
  {
    id: 'ruin_006',
    name: '虚空裂缝',
    type: RuinType.VOID_RIFT,
    difficulty: RuinDifficulty.NIGHTMARE,
    description: '一个通往虚空的裂缝，极度危险但可能获得稀有物品。',
    requiredLevel: 3,
    duration: 60 * 60 * 1000,
    rewards: {
      credits: 3000,
      items: [
        { itemId: 'mineral_quantum', count: 2, chance: 0.2 },
        { itemId: 'cyber_core', count: 3, chance: 0.4 },
        { itemId: 'recruit_ticket_limited', count: 2, chance: 0.2 },
      ],
      experience: 800,
    },
  },
  {
    id: 'ruin_007',
    name: '深渊之门',
    type: RuinType.VOID_RIFT,
    difficulty: RuinDifficulty.HELL,
    description: '传说中通往另一个维度的门户，只有最勇敢的探险者才能幸存。',
    requiredLevel: 4,
    duration: 120 * 60 * 1000,
    rewards: {
      credits: 10000,
      items: [
        { itemId: 'mineral_quantum', count: 5, chance: 0.3 },
        { itemId: 'void_essence', count: 1, chance: 0.1 },
        { itemId: 'recruit_ticket_limited', count: 5, chance: 0.3 },
      ],
      experience: 2000,
    },
  },
  {
    id: 'ruin_chip_001',
    name: '废弃芯片工厂',
    type: RuinType.CHIP_FACTORY,
    difficulty: RuinDifficulty.NORMAL,
    description: '一座废弃的芯片制造工厂，可能还有残留的芯片材料。',
    requiredLevel: 1,
    duration: 20 * 60 * 1000,
    rewards: {
      credits: 600,
      items: [
        { itemId: 'chip_material', count: 8, chance: 0.7 },
        { itemId: 'mineral_titanium', count: 5, chance: 0.5 },
        { itemId: 'gene_material', count: 2, chance: 0.3 },
      ],
      experience: 200,
    },
  },
  {
    id: 'ruin_chip_002',
    name: '高级芯片实验室',
    type: RuinType.CHIP_FACTORY,
    difficulty: RuinDifficulty.HARD,
    description: '一个专门研发高级芯片的实验室，藏有珍贵的芯片材料。',
    requiredLevel: 2,
    duration: 40 * 60 * 1000,
    rewards: {
      credits: 1500,
      items: [
        { itemId: 'chip_material', count: 20, chance: 0.6 },
        { itemId: 'gene_material', count: 8, chance: 0.5 },
        { itemId: 'mineral_crystal', count: 5, chance: 0.4 },
        { itemId: 'cyber_core', count: 1, chance: 0.15 },
      ],
      experience: 450,
    },
  },
  {
    id: 'ruin_chip_003',
    name: '量子芯片中心',
    type: RuinType.CHIP_FACTORY,
    difficulty: RuinDifficulty.NIGHTMARE,
    description: '一个研究量子芯片的顶级设施，可能藏有传说级芯片材料。',
    requiredLevel: 3,
    duration: 90 * 60 * 1000,
    rewards: {
      credits: 4000,
      items: [
        { itemId: 'chip_material', count: 35, chance: 0.5 },
        { itemId: 'gene_material', count: 15, chance: 0.4 },
        { itemId: 'mineral_quantum', count: 3, chance: 0.3 },
        { itemId: 'cyber_core', count: 2, chance: 0.25 },
      ],
      experience: 900,
    },
  },
  {
    id: 'ruin_neural_001',
    name: '神经中枢遗迹',
    type: RuinType.NEURAL_NEXUS,
    difficulty: RuinDifficulty.HARD,
    description: '一个古老的神经中枢设施，据说能产出稀有的神经核心。',
    requiredLevel: 2,
    duration: 50 * 60 * 1000,
    rewards: {
      credits: 2000,
      items: [
        { itemId: 'cyber_core', count: 2, chance: 0.4 },
        { itemId: 'chip_material', count: 15, chance: 0.6 },
        { itemId: 'gene_material', count: 10, chance: 0.5 },
      ],
      experience: 550,
    },
  },
  {
    id: 'ruin_neural_002',
    name: '神经核心深渊',
    type: RuinType.NEURAL_NEXUS,
    difficulty: RuinDifficulty.HELL,
    description: '传说中神经核心的诞生之地，极度危险但奖励丰厚。',
    requiredLevel: 4,
    duration: 150 * 60 * 1000,
    rewards: {
      credits: 8000,
      items: [
        { itemId: 'cyber_core', count: 5, chance: 0.35 },
        { itemId: 'chip_material', count: 50, chance: 0.5 },
        { itemId: 'mineral_quantum', count: 5, chance: 0.3 },
        { itemId: 'void_essence', count: 1, chance: 0.1 },
      ],
      experience: 1500,
    },
  },
];

export function createRuin(templateId: string): Ruin | null {
  const template = RUIN_TEMPLATES.find(t => t.id === templateId);
  if (!template) return null;

  return {
    ...template,
    status: ExploreStatus.AVAILABLE,
    completedCount: 0,
  };
}

export function generateRuins(facilityLevel: number): Ruin[] {
  return RUIN_TEMPLATES
    .filter(t => t.requiredLevel <= facilityLevel)
    .map(template => createRuin(template.id))
    .filter((r): r is Ruin => r !== null);
}

export function calculateExploreSuccess(crewPower: number, difficulty: RuinDifficulty): number {
  const baseSuccess = 50;
  const difficultyModifier = {
    [RuinDifficulty.EASY]: 30,
    [RuinDifficulty.NORMAL]: 0,
    [RuinDifficulty.HARD]: -20,
    [RuinDifficulty.NIGHTMARE]: -40,
    [RuinDifficulty.HELL]: -60,
  };

  const powerBonus = Math.min(crewPower / 10, 50);
  const success = baseSuccess + difficultyModifier[difficulty] + powerBonus;

  return Math.max(10, Math.min(95, success));
}

export function generateRewards(reward: RuinReward, success: boolean): { credits: number; items: { itemId: string; count: number }[]; experience: number } {
  if (!success) {
    return {
      credits: Math.floor(reward.credits * 0.2),
      items: [],
      experience: Math.floor(reward.experience * 0.3),
    };
  }

  const items: { itemId: string; count: number }[] = [];

  reward.items.forEach(item => {
    if (Math.random() < item.chance) {
      items.push({ itemId: item.itemId, count: item.count });
    }
  });

  return {
    credits: reward.credits,
    items,
    experience: reward.experience,
  };
}

export function getRemainingExploreTime(mission: ExploreMission): number {
  return Math.max(0, mission.endTime - Date.now());
}

export function formatExploreTime(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);

  if (minutes > 60) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}小时${mins}分`;
  }

  return `${minutes}分${seconds}秒`;
}

export function serializeRuin(ruin: Ruin): any {
  return { ...ruin };
}

export function deserializeRuin(data: any): Ruin {
  return { ...data };
}

export function serializeExploreMission(mission: ExploreMission): any {
  return { ...mission };
}

export function deserializeExploreMission(data: any): ExploreMission {
  return { ...data };
}
