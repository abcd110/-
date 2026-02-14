export enum ChipSlot {
  SLOT_1 = 1,
  SLOT_2 = 2,
  SLOT_3 = 3,
  SLOT_4 = 4,
}

export enum ChipMainStat {
  HP = 'hp',
  ATTACK = 'attack',
  DEFENSE = 'defense',
  CRIT_RATE = 'crit_rate',
  CRIT_DAMAGE = 'crit_damage',
  SPEED = 'speed',
}

export enum ChipSubStat {
  HP = 'hp',
  ATTACK = 'attack',
  DEFENSE = 'defense',
  CRIT_RATE = 'crit_rate',
  CRIT_DAMAGE = 'crit_damage',
  SPEED = 'speed',
  HP_PERCENT = 'hp_percent',
  ATTACK_PERCENT = 'attack_percent',
  DEFENSE_PERCENT = 'defense_percent',
}

export enum ChipRarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary',
}

export enum ChipSet {
  WARRIOR = 'warrior',
  GUARDIAN = 'guardian',
  ASSASSIN = 'assassin',
  MAGE = 'mage',
  BERSERKER = 'berserker',
}

export interface Chip {
  id: string;
  slot: ChipSlot;
  rarity: ChipRarity;
  level: number;
  mainStat: ChipMainStat;
  mainStatValue: number;
  subStats: { stat: ChipSubStat; value: number }[];
  lockedSubStatLevels: number[];
  locked?: boolean;
  setId?: ChipSet;
  enhanceCount: number;
}

export interface ChipData {
  id: string;
  slot: ChipSlot;
  rarity: ChipRarity;
  level: number;
  mainStat: ChipMainStat;
  mainStatValue: number;
  subStats: { stat: ChipSubStat; value: number }[];
  lockedSubStatLevels: number[];
  locked?: boolean;
  setId?: ChipSet;
  enhanceCount: number;
}

export const CHIP_RARITY_CONFIG: Record<ChipRarity, { name: string; color: string; subStatCount: number; maxEnhance: number }> = {
  [ChipRarity.COMMON]: { name: '普通', color: '#9ca3af', subStatCount: 1, maxEnhance: 5 },
  [ChipRarity.UNCOMMON]: { name: '优秀', color: '#22c55e', subStatCount: 2, maxEnhance: 8 },
  [ChipRarity.RARE]: { name: '稀有', color: '#3b82f6', subStatCount: 2, maxEnhance: 10 },
  [ChipRarity.EPIC]: { name: '史诗', color: '#a855f7', subStatCount: 3, maxEnhance: 12 },
  [ChipRarity.LEGENDARY]: { name: '传说', color: '#f59e0b', subStatCount: 4, maxEnhance: 15 },
};

export const CHIP_MAIN_STAT_CONFIG: Record<ChipMainStat, { name: string; baseValue: number; growth: number }> = {
  [ChipMainStat.HP]: { name: '生命值', baseValue: 100, growth: 20 },
  [ChipMainStat.ATTACK]: { name: '攻击力', baseValue: 10, growth: 2 },
  [ChipMainStat.DEFENSE]: { name: '防御力', baseValue: 8, growth: 1.5 },
  [ChipMainStat.CRIT_RATE]: { name: '暴击率', baseValue: 2, growth: 0.5 },
  [ChipMainStat.CRIT_DAMAGE]: { name: '暴击伤害', baseValue: 10, growth: 2 },
  [ChipMainStat.SPEED]: { name: '速度', baseValue: 2, growth: 0.3 },
};

export const CHIP_SUB_STAT_CONFIG: Record<ChipSubStat, { name: string; minValue: number; maxValue: number; enhanceValue: number }> = {
  [ChipSubStat.HP]: { name: '生命值', minValue: 20, maxValue: 50, enhanceValue: 5 },
  [ChipSubStat.ATTACK]: { name: '攻击力', minValue: 3, maxValue: 8, enhanceValue: 1 },
  [ChipSubStat.DEFENSE]: { name: '防御力', minValue: 2, maxValue: 6, enhanceValue: 0.5 },
  [ChipSubStat.CRIT_RATE]: { name: '暴击率', minValue: 1, maxValue: 3, enhanceValue: 0.3 },
  [ChipSubStat.CRIT_DAMAGE]: { name: '暴击伤害', minValue: 3, maxValue: 8, enhanceValue: 1 },
  [ChipSubStat.SPEED]: { name: '速度', minValue: 1, maxValue: 3, enhanceValue: 0.2 },
  [ChipSubStat.HP_PERCENT]: { name: '生命值%', minValue: 1, maxValue: 4, enhanceValue: 0.5 },
  [ChipSubStat.ATTACK_PERCENT]: { name: '攻击力%', minValue: 1, maxValue: 3, enhanceValue: 0.3 },
  [ChipSubStat.DEFENSE_PERCENT]: { name: '防御力%', minValue: 1, maxValue: 3, enhanceValue: 0.3 },
};

export const CHIP_SET_CONFIG: Record<ChipSet, { name: string; icon: string; color: string; bonus2: string; bonus4: string }> = {
  [ChipSet.WARRIOR]: { name: '战士', icon: '⚔️', color: '#ef4444', bonus2: '攻击力+10%', bonus4: '暴击伤害+25%' },
  [ChipSet.GUARDIAN]: { name: '守护者', icon: '🛡️', color: '#3b82f6', bonus2: '防御力+15%', bonus4: '受到伤害-10%' },
  [ChipSet.ASSASSIN]: { name: '刺客', icon: '🗡️', color: '#8b5cf6', bonus2: '暴击率+8%', bonus4: '暴击时50%概率额外攻击' },
  [ChipSet.MAGE]: { name: '法师', icon: '🔮', color: '#06b6d4', bonus2: '速度+10%', bonus4: '技能冷却-15%' },
  [ChipSet.BERSERKER]: { name: '狂战士', icon: '🔥', color: '#f97316', bonus2: '攻击力+8%，生命值-5%', bonus4: '生命值越低攻击力越高' },
};

export const SLOT_MAIN_STAT: Record<ChipSlot, ChipMainStat[]> = {
  [ChipSlot.SLOT_1]: [ChipMainStat.HP],
  [ChipSlot.SLOT_2]: [ChipMainStat.ATTACK],
  [ChipSlot.SLOT_3]: [ChipMainStat.HP, ChipMainStat.ATTACK, ChipMainStat.DEFENSE, ChipMainStat.CRIT_RATE, ChipMainStat.CRIT_DAMAGE, ChipMainStat.SPEED],
  [ChipSlot.SLOT_4]: [ChipMainStat.HP, ChipMainStat.ATTACK, ChipMainStat.DEFENSE, ChipMainStat.CRIT_RATE, ChipMainStat.CRIT_DAMAGE, ChipMainStat.SPEED],
};

export const SUB_STAT_UNLOCK_LEVELS = [3, 5, 8, 12];

export const MAX_CHIP_LEVEL = 15;

let chipIdCounter = 0;

function generateChipId(): string {
  chipIdCounter++;
  return `chip_${Date.now()}_${chipIdCounter}`;
}

export function getMainStatForSlot(slot: ChipSlot): ChipMainStat {
  const possibleStats = SLOT_MAIN_STAT[slot];
  return possibleStats[Math.floor(Math.random() * possibleStats.length)];
}

export function getRandomSubStat(exclude: ChipSubStat[] = []): ChipSubStat {
  const allStats = Object.values(ChipSubStat).filter(s => !exclude.includes(s));
  return allStats[Math.floor(Math.random() * allStats.length)];
}

export function getRandomChipSet(): ChipSet {
  const sets = Object.values(ChipSet);
  return sets[Math.floor(Math.random() * sets.length)];
}

export function createChip(slot: ChipSlot, rarity: ChipRarity): Chip {
  const mainStat = getMainStatForSlot(slot);
  const mainStatConfig = CHIP_MAIN_STAT_CONFIG[mainStat];
  const rarityConfig = CHIP_RARITY_CONFIG[rarity];

  const mainStatValue = mainStatConfig.baseValue * (1 + Object.keys(ChipRarity).indexOf(rarity) * 0.1);

  const subStats: { stat: ChipSubStat; value: number }[] = [];
  const usedStats: ChipSubStat[] = [];

  for (let i = 0; i < rarityConfig.subStatCount; i++) {
    const stat = getRandomSubStat(usedStats);
    usedStats.push(stat);
    const config = CHIP_SUB_STAT_CONFIG[stat];
    const value = config.minValue + Math.random() * (config.maxValue - config.minValue);
    subStats.push({ stat, value: Math.round(value * 10) / 10 });
  }

  const setId = rarity === ChipRarity.EPIC || rarity === ChipRarity.LEGENDARY ? getRandomChipSet() : undefined;

  return {
    id: generateChipId(),
    slot,
    rarity,
    level: 1,
    mainStat,
    mainStatValue: Math.round(mainStatValue * 10) / 10,
    subStats,
    lockedSubStatLevels: [...SUB_STAT_UNLOCK_LEVELS],
    locked: false,
    setId,
    enhanceCount: 0,
  };
}

export function upgradeChip(chip: Chip, materialCount: number): { success: boolean; newLevel: number; unlockedSubStat?: ChipSubStat } {
  if (chip.level >= MAX_CHIP_LEVEL) {
    return { success: false, newLevel: chip.level };
  }

  const levelsGained = Math.min(materialCount, MAX_CHIP_LEVEL - chip.level);
  const oldLevel = chip.level;
  chip.level += levelsGained;

  const mainStatConfig = CHIP_MAIN_STAT_CONFIG[chip.mainStat];
  chip.mainStatValue = Math.round((mainStatConfig.baseValue + mainStatConfig.growth * (chip.level - 1)) * 10) / 10;

  let unlockedSubStat: ChipSubStat | undefined;
  for (const unlockLevel of SUB_STAT_UNLOCK_LEVELS) {
    if (oldLevel < unlockLevel && chip.level >= unlockLevel && chip.lockedSubStatLevels.includes(unlockLevel)) {
      chip.lockedSubStatLevels = chip.lockedSubStatLevels.filter(l => l !== unlockLevel);

      const usedStats = chip.subStats.map(s => s.stat);
      const newStat = getRandomSubStat(usedStats);
      const config = CHIP_SUB_STAT_CONFIG[newStat];
      const value = config.minValue + Math.random() * (config.maxValue - config.minValue);
      chip.subStats.push({ stat: newStat, value: Math.round(value * 10) / 10 });
      unlockedSubStat = newStat;
      break;
    }
  }

  return { success: true, newLevel: chip.level, unlockedSubStat };
}

export function enhanceChip(chip: Chip, subStatIndex: number): { success: boolean; message: string } {
  const rarityConfig = CHIP_RARITY_CONFIG[chip.rarity];
  
  if (chip.enhanceCount >= rarityConfig.maxEnhance) {
    return { success: false, message: '已达到最大强化次数' };
  }

  if (subStatIndex < 0 || subStatIndex >= chip.subStats.length) {
    return { success: false, message: '无效的副属性索引' };
  }

  const subStat = chip.subStats[subStatIndex];
  const config = CHIP_SUB_STAT_CONFIG[subStat.stat];
  
  const enhanceResult = config.enhanceValue * (0.8 + Math.random() * 0.4);
  subStat.value = Math.round((subStat.value + enhanceResult) * 10) / 10;
  chip.enhanceCount++;

  return { success: true, message: `强化成功，${config.name}+${enhanceResult.toFixed(1)}` };
}

export function rerollSubStat(chip: Chip, subStatIndex: number): { success: boolean; message: string; newValue?: number } {
  if (chip.locked) {
    return { success: false, message: '芯片已锁定，无法重随' };
  }

  if (subStatIndex < 0 || subStatIndex >= chip.subStats.length) {
    return { success: false, message: '无效的副属性索引' };
  }

  const subStat = chip.subStats[subStatIndex];
  const config = CHIP_SUB_STAT_CONFIG[subStat.stat];
  
  const newValue = config.minValue + Math.random() * (config.maxValue - config.minValue);
  subStat.value = Math.round(newValue * 10) / 10;

  return { success: true, message: `重随成功，新数值: ${subStat.value}`, newValue: subStat.value };
}

export function rerollAllSubStats(chip: Chip): { success: boolean; message: string } {
  if (chip.locked) {
    return { success: false, message: '芯片已锁定，无法重随' };
  }

  chip.subStats.forEach(subStat => {
    const config = CHIP_SUB_STAT_CONFIG[subStat.stat];
    const newValue = config.minValue + Math.random() * (config.maxValue - config.minValue);
    subStat.value = Math.round(newValue * 10) / 10;
  });

  return { success: true, message: '所有副属性已重随' };
}

export function toggleChipLock(chip: Chip): boolean {
  chip.locked = !chip.locked;
  return chip.locked;
}

export function getUpgradeCost(level: number): { credits: number; materials: number } {
  return {
    credits: 100 * level,
    materials: level,
  };
}

export function getEnhanceCost(chip: Chip): { credits: number; materials: number } {
  return {
    credits: 200 * (chip.enhanceCount + 1),
    materials: 2 + chip.enhanceCount,
  };
}

export function getRerollCost(chip: Chip): { credits: number; materials: number } {
  return {
    credits: 500 * chip.level,
    materials: 5 + chip.level,
  };
}

export function getChipStats(chip: Chip): Record<string, number> {
  const stats: Record<string, number> = {};

  const mainStatName = CHIP_MAIN_STAT_CONFIG[chip.mainStat].name;
  stats[mainStatName] = chip.mainStatValue;

  chip.subStats.forEach(sub => {
    const statName = CHIP_SUB_STAT_CONFIG[sub.stat].name;
    stats[statName] = (stats[statName] || 0) + sub.value;
  });

  return stats;
}

export function getSetBonus(chips: Chip[]): { set: ChipSet; count: number; bonuses: string[] }[] {
  const setCounts: Record<ChipSet, number> = {} as Record<ChipSet, number>;
  
  chips.forEach(chip => {
    if (chip.setId) {
      setCounts[chip.setId] = (setCounts[chip.setId] || 0) + 1;
    }
  });

  const bonuses: { set: ChipSet; count: number; bonuses: string[] }[] = [];

  Object.entries(setCounts).forEach(([setId, count]) => {
    const setConfig = CHIP_SET_CONFIG[setId as ChipSet];
    const activeBonuses: string[] = [];
    
    if (count >= 2) {
      activeBonuses.push(`2件套: ${setConfig.bonus2}`);
    }
    if (count >= 4) {
      activeBonuses.push(`4件套: ${setConfig.bonus4}`);
    }

    if (activeBonuses.length > 0) {
      bonuses.push({
        set: setId as ChipSet,
        count,
        bonuses: activeBonuses,
      });
    }
  });

  return bonuses;
}

export function serializeChip(chip: Chip): ChipData {
  return { ...chip };
}

export function deserializeChip(data: ChipData): Chip {
  return {
    ...data,
    locked: data.locked || false,
    enhanceCount: data.enhanceCount || 0,
    setId: data.setId,
  };
}
