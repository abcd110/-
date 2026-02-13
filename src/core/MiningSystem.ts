export enum MiningStatus {
  IDLE = 'idle',
  MINING = 'mining',
  PAUSED = 'paused',
}

export enum MineralType {
  IRON = 'iron',
  COPPER = 'copper',
  TITANIUM = 'titanium',
  CRYSTAL = 'crystal',
  QUANTUM = 'quantum',
}

export enum MiningEventType {
  RICH_VEIN = 'rich_vein',
  CAVE_IN = 'cave_in',
  ANCIENT_RUINS = 'ancient_ruins',
  GAS_POCKET = 'gas_pocket',
  CREATURE_ATTACK = 'creature_attack',
  LUCKY_FIND = 'lucky_find',
}

export interface MiningSite {
  id: string;
  name: string;
  mineralType: MineralType;
  baseYield: number;
  difficulty: number;
  unlocked: boolean;
  unlockCondition?: {
    facilityLevel?: number;
    research?: string;
  };
  maxDepth: number;
  depthBonus: number;
}

export interface MiningTask {
  siteId: string;
  startTime: number;
  duration: number;
  status: MiningStatus;
  accumulated: number;
  assignedCrew: string[];
  currentDepth: number;
  events: MiningEventData[];
}

export interface MiningTaskData {
  siteId: string;
  startTime: number;
  duration: number;
  status: MiningStatus;
  accumulated: number;
  assignedCrew: string[];
  currentDepth: number;
  events: MiningEventData[];
}

export interface MiningEventData {
  type: MiningEventType;
  timestamp: number;
  resolved: boolean;
  result?: string;
}

export interface MiningEvent {
  type: MiningEventType;
  name: string;
  description: string;
  icon: string;
  color: string;
  chance: number;
  minDepth: number;
  effect: (task: MiningTask, site: MiningSite) => { message: string; bonus?: number; damage?: number; items?: { itemId: string; count: number }[] };
}

export const MINERAL_CONFIG: Record<MineralType, { name: string; color: string; icon: string; itemId: string }> = {
  [MineralType.IRON]: { name: '铁矿', color: '#9ca3af', icon: '�ite', itemId: 'mineral_iron' },
  [MineralType.COPPER]: { name: '铜矿', color: '#f59e0b', icon: '🟤', itemId: 'mineral_copper' },
  [MineralType.TITANIUM]: { name: '钛矿', color: '#60a5fa', icon: '🔵', itemId: 'mineral_titanium' },
  [MineralType.CRYSTAL]: { name: '水晶矿', color: '#a855f7', icon: '💎', itemId: 'mineral_crystal' },
  [MineralType.QUANTUM]: { name: '量子矿', color: '#22c55e', icon: '✨', itemId: 'mineral_quantum' },
};

export const MINING_SITES: MiningSite[] = [
  {
    id: 'site_iron_01',
    name: '废弃矿坑',
    mineralType: MineralType.IRON,
    baseYield: 10,
    difficulty: 1,
    unlocked: true,
    maxDepth: 100,
    depthBonus: 0.02,
  },
  {
    id: 'site_copper_01',
    name: '铜脉矿洞',
    mineralType: MineralType.COPPER,
    baseYield: 8,
    difficulty: 2,
    unlocked: false,
    unlockCondition: { facilityLevel: 2 },
    maxDepth: 150,
    depthBonus: 0.025,
  },
  {
    id: 'site_titanium_01',
    name: '深岩矿脉',
    mineralType: MineralType.TITANIUM,
    baseYield: 5,
    difficulty: 3,
    unlocked: false,
    unlockCondition: { facilityLevel: 3 },
    maxDepth: 200,
    depthBonus: 0.03,
  },
  {
    id: 'site_crystal_01',
    name: '水晶洞穴',
    mineralType: MineralType.CRYSTAL,
    baseYield: 3,
    difficulty: 4,
    unlocked: false,
    unlockCondition: { facilityLevel: 4 },
    maxDepth: 250,
    depthBonus: 0.04,
  },
  {
    id: 'site_quantum_01',
    name: '量子裂隙',
    mineralType: MineralType.QUANTUM,
    baseYield: 2,
    difficulty: 5,
    unlocked: false,
    unlockCondition: { facilityLevel: 5 },
    maxDepth: 300,
    depthBonus: 0.05,
  },
];

export const MINING_EVENTS: MiningEvent[] = [
  {
    type: MiningEventType.RICH_VEIN,
    name: '富矿脉',
    description: '发现了一条富饶的矿脉！',
    icon: '💎',
    color: '#22c55e',
    chance: 0.15,
    minDepth: 10,
    effect: (task, site) => {
      const bonus = Math.floor(site.baseYield * 0.5 * (1 + task.currentDepth / 50));
      return { message: `发现富矿脉！额外获得${bonus}矿石`, bonus };
    },
  },
  {
    type: MiningEventType.CAVE_IN,
    name: '塌方',
    description: '矿洞发生了塌方！',
    icon: '⚠️',
    color: '#ef4444',
    chance: 0.08,
    minDepth: 20,
    effect: (task, site) => {
      const damage = Math.floor(5 + task.currentDepth / 20);
      return { message: `塌方！损失了${damage}点进度`, damage };
    },
  },
  {
    type: MiningEventType.ANCIENT_RUINS,
    name: '古代遗迹',
    description: '发现了古代遗迹！',
    icon: '🏛️',
    color: '#a855f7',
    chance: 0.05,
    minDepth: 50,
    effect: (task, site) => {
      const items = [{ itemId: 'gene_material', count: Math.floor(1 + task.currentDepth / 100) }];
      return { message: '发现古代遗迹！获得了基因材料', items };
    },
  },
  {
    type: MiningEventType.GAS_POCKET,
    name: '瓦斯气袋',
    description: '遇到了瓦斯气袋！',
    icon: '💨',
    color: '#f59e0b',
    chance: 0.1,
    minDepth: 30,
    effect: (task, site) => {
      return { message: '瓦斯气袋！需要暂停处理', damage: 10 };
    },
  },
  {
    type: MiningEventType.CREATURE_ATTACK,
    name: '生物袭击',
    description: '遭遇了地下生物！',
    icon: '👾',
    color: '#ec4899',
    chance: 0.07,
    minDepth: 40,
    effect: (task, site) => {
      const damage = Math.floor(8 + task.currentDepth / 25);
      return { message: `遭遇地下生物！损失${damage}点进度`, damage };
    },
  },
  {
    type: MiningEventType.LUCKY_FIND,
    name: '幸运发现',
    description: '意外发现了宝藏！',
    icon: '🍀',
    color: '#22c55e',
    chance: 0.03,
    minDepth: 0,
    effect: (task, site) => {
      const credits = Math.floor(100 + task.currentDepth * 2);
      return { message: `幸运发现！获得${credits}信用点`, bonus: credits };
    },
  },
];

export function getMiningYield(site: MiningSite, facilityLevel: number, energyEfficiency: number, crewBonus: number = 0, depth: number = 0): number {
  const levelBonus = 1 + (facilityLevel - 1) * 0.1;
  const energyBonus = 1 + energyEfficiency / 100;
  const crewMultiplier = 1 + crewBonus / 100;
  const depthMultiplier = 1 + depth * site.depthBonus;
  return Math.floor(site.baseYield * levelBonus * energyBonus * crewMultiplier * depthMultiplier);
}

export function getMiningDuration(site: MiningSite, facilityLevel: number, crewCount: number = 0): number {
  const baseDuration = 60;
  const levelReduction = (facilityLevel - 1) * 5;
  const crewReduction = crewCount * 3;
  return Math.max(20, baseDuration - levelReduction - crewReduction);
}

export function getMaxMiningSlots(facilityLevel: number): number {
  return Math.min(5, 1 + Math.floor(facilityLevel / 2));
}

export function getEnergyConsumption(facilityLevel: number): number {
  return Math.max(1, 5 - facilityLevel);
}

export function getCrewMiningBonus(crewStats: { attack: number; defense: number; speed: number }): number {
  return Math.floor((crewStats.attack * 0.5 + crewStats.defense * 0.3 + crewStats.speed * 0.2) / 10);
}

export function createMiningTask(siteId: string, facilityLevel: number, crewIds: string[] = []): MiningTask {
  const site = MINING_SITES.find(s => s.id === siteId);
  const duration = site ? getMiningDuration(site, facilityLevel, crewIds.length) : 60;

  return {
    siteId,
    startTime: Date.now(),
    duration: duration * 60 * 1000,
    status: MiningStatus.MINING,
    accumulated: 0,
    assignedCrew: crewIds,
    currentDepth: 0,
    events: [],
  };
}

export function checkMiningEvent(task: MiningTask, site: MiningSite): MiningEvent | null {
  const availableEvents = MINING_EVENTS.filter(e => task.currentDepth >= e.minDepth);
  
  for (const event of availableEvents) {
    if (Math.random() < event.chance) {
      return event;
    }
  }
  
  return null;
}

export function processMiningEvent(event: MiningEvent, task: MiningTask, site: MiningSite): { message: string; bonus?: number; damage?: number; items?: { itemId: string; count: number }[] } {
  return event.effect(task, site);
}

export function serializeMiningTask(task: MiningTask): MiningTaskData {
  return { ...task };
}

export function deserializeMiningTask(data: MiningTaskData): MiningTask {
  return {
    ...data,
    assignedCrew: data.assignedCrew || [],
    currentDepth: data.currentDepth || 0,
    events: data.events || [],
  };
}

export function isMiningComplete(task: MiningTask): boolean {
  if (task.status !== MiningStatus.MINING) return false;
  return Date.now() - task.startTime >= task.duration;
}

export function getMiningProgress(task: MiningTask): number {
  if (task.status !== MiningStatus.MINING) return 0;
  const elapsed = Date.now() - task.startTime;
  return Math.min(100, (elapsed / task.duration) * 100);
}

export function getRemainingTime(task: MiningTask): number {
  if (task.status !== MiningStatus.MINING) return 0;
  const elapsed = Date.now() - task.startTime;
  return Math.max(0, task.duration - elapsed);
}

export function formatMiningTime(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);

  if (minutes > 0) {
    return `${minutes}分${seconds}秒`;
  }
  return `${seconds}秒`;
}

export function getDepthProgress(task: MiningTask, site: MiningSite): number {
  return Math.min(site.maxDepth, task.currentDepth);
}

export function getDepthBonusDescription(depth: number, site: MiningSite): string {
  const bonus = (1 + depth * site.depthBonus - 1) * 100;
  return `+${bonus.toFixed(1)}%产量`;
}
