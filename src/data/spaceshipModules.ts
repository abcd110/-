// 《星航荒宇》航船模块系统
// 定义6种模块类型及其数据

import {
  ModuleSlot,
  ModuleType,
  ModuleItem,
  ItemRarity,
  ModuleEffect,
} from './types_new';

// ==================== 模块类型定义 ====================

export interface ModuleDefinition {
  id: string;
  name: string;
  description: string;
  slot: ModuleSlot;
  type: ModuleType;
  rarity: ItemRarity;
  level: number;
  maxLevel: number;
  effects: ModuleEffect[];
  installCost: {
    credits: number;
    materials: { itemId: string; count: number }[];
  };
  upgradeCost: {
    credits: number;
    materials: { itemId: string; count: number }[];
  };
}

// ==================== 引擎模块 ====================

export const ENGINE_MODULES: ModuleDefinition[] = [
  {
    id: 'engine_basic',
    name: '基础离子引擎',
    description: '标准的离子推进引擎，提供基础的跃迁速度。',
    slot: ModuleSlot.ENGINE,
    type: ModuleType.ENGINE,
    rarity: ItemRarity.COMMON,
    level: 1,
    maxLevel: 5,
    effects: [
      { type: 'speed', value: 20 },
      { type: 'energy', value: 10 },
    ],
    installCost: { credits: 100, materials: [] },
    upgradeCost: { credits: 200, materials: [{ itemId: 'basic_alloy', count: 5 }] },
  },
  {
    id: 'engine_advanced',
    name: '高级跃迁引擎',
    description: '采用最新跃迁技术的引擎，大幅提升航行速度。',
    slot: ModuleSlot.ENGINE,
    type: ModuleType.ENGINE,
    rarity: ItemRarity.RARE,
    level: 1,
    maxLevel: 10,
    effects: [
      { type: 'speed', value: 50 },
      { type: 'energy', value: 25 },
      { type: 'defense', value: 10 },
    ],
    installCost: {
      credits: 500,
      materials: [
        { itemId: 'star_core_fragment', count: 3 },
        { itemId: 'energy_core', count: 1 },
      ],
    },
    upgradeCost: {
      credits: 800,
      materials: [
        { itemId: 'star_core_fragment', count: 5 },
        { itemId: 'advanced_alloy', count: 3 },
      ],
    },
  },
  {
    id: 'engine_warp',
    name: '曲率引擎',
    description: '传说中的曲率驱动引擎，可以扭曲空间进行超光速航行。',
    slot: ModuleSlot.ENGINE,
    type: ModuleType.ENGINE,
    rarity: ItemRarity.LEGENDARY,
    level: 1,
    maxLevel: 15,
    effects: [
      { type: 'speed', value: 100 },
      { type: 'energy', value: 50 },
      { type: 'defense', value: 20 },
    ],
    installCost: {
      credits: 2000,
      materials: [
        { itemId: 'warp_crystal', count: 1 },
        { itemId: 'god_energy_fragment', count: 5 },
        { itemId: 'advanced_tech', count: 3 },
      ],
    },
    upgradeCost: {
      credits: 3000,
      materials: [
        { itemId: 'warp_crystal', count: 2 },
        { itemId: 'god_energy_fragment', count: 8 },
      ],
    },
  },
];

// ==================== 护盾模块 ====================

export const SHIELD_MODULES: ModuleDefinition[] = [
  {
    id: 'shield_basic',
    name: '基础虚空护盾',
    description: '标准的虚空能量护盾，提供基础的防护能力。',
    slot: ModuleSlot.SHIELD,
    type: ModuleType.SHIELD,
    rarity: ItemRarity.COMMON,
    level: 1,
    maxLevel: 5,
    effects: [
      { type: 'defense', value: 30 },
      { type: 'energy', value: 15 },
    ],
    installCost: { credits: 150, materials: [] },
    upgradeCost: { credits: 250, materials: [{ itemId: 'basic_alloy', count: 8 }] },
  },
  {
    id: 'shield_advanced',
    name: '强化虚空护盾',
    description: '采用多层护盾技术的先进护盾系统。',
    slot: ModuleSlot.SHIELD,
    type: ModuleType.SHIELD,
    rarity: ItemRarity.RARE,
    level: 1,
    maxLevel: 10,
    effects: [
      { type: 'defense', value: 70 },
      { type: 'energy', value: 30 },
      { type: 'speed', value: -5 },
    ],
    installCost: {
      credits: 600,
      materials: [
        { itemId: 'void_crystal', count: 3 },
        { itemId: 'energy_core', count: 2 },
      ],
    },
    upgradeCost: {
      credits: 1000,
      materials: [
        { itemId: 'void_crystal', count: 5 },
        { itemId: 'shield_generator', count: 1 },
      ],
    },
  },
  {
    id: 'shield_divine',
    name: '神能护盾',
    description: '融合神能的护盾系统，可以抵挡虚空侵蚀。',
    slot: ModuleSlot.SHIELD,
    type: ModuleType.SHIELD,
    rarity: ItemRarity.EPIC,
    level: 1,
    maxLevel: 12,
    effects: [
      { type: 'defense', value: 120 },
      { type: 'energy', value: 40 },
      { type: 'attack', value: 10 },
    ],
    installCost: {
      credits: 1500,
      materials: [
        { itemId: 'god_energy_fragment', count: 8 },
        { itemId: 'divine_blessing', count: 1 },
      ],
    },
    upgradeCost: {
      credits: 2500,
      materials: [
        { itemId: 'god_energy_fragment', count: 12 },
        { itemId: 'divine_blessing', count: 2 },
      ],
    },
  },
];

// ==================== 武器模块 ====================

export const WEAPON_MODULES: ModuleDefinition[] = [
  {
    id: 'weapon_basic',
    name: '基础舰载炮',
    description: '标准的舰载武器，提供基础的攻击能力。',
    slot: ModuleSlot.WEAPON,
    type: ModuleType.WEAPON,
    rarity: ItemRarity.COMMON,
    level: 1,
    maxLevel: 5,
    effects: [
      { type: 'attack', value: 25 },
      { type: 'energy', value: -5 },
    ],
    installCost: { credits: 200, materials: [] },
    upgradeCost: { credits: 300, materials: [{ itemId: 'metal', count: 10 }] },
  },
  {
    id: 'weapon_laser',
    name: '高能激光炮',
    description: '采用高能激光技术的舰载武器，精准且威力强大。',
    slot: ModuleSlot.WEAPON,
    type: ModuleType.WEAPON,
    rarity: ItemRarity.RARE,
    level: 1,
    maxLevel: 10,
    effects: [
      { type: 'attack', value: 60 },
      { type: 'speed', value: 5 },
      { type: 'energy', value: -10 },
    ],
    installCost: {
      credits: 800,
      materials: [
        { itemId: 'lens_crystal', count: 3 },
        { itemId: 'energy_core', count: 2 },
      ],
    },
    upgradeCost: {
      credits: 1200,
      materials: [
        { itemId: 'lens_crystal', count: 5 },
        { itemId: 'advanced_weapon', count: 1 },
      ],
    },
  },
  {
    id: 'weapon_plasma',
    name: '等离子加农炮',
    description: '发射高温等离子体的重型武器，对虚空生物特别有效。',
    slot: ModuleSlot.WEAPON,
    type: ModuleType.WEAPON,
    rarity: ItemRarity.EPIC,
    level: 1,
    maxLevel: 12,
    effects: [
      { type: 'attack', value: 100 },
      { type: 'defense', value: 10 },
      { type: 'energy', value: -20 },
    ],
    installCost: {
      credits: 2000,
      materials: [
        { itemId: 'plasma_core', count: 2 },
        { itemId: 'heat_resistant_alloy', count: 5 },
      ],
    },
    upgradeCost: {
      credits: 3000,
      materials: [
        { itemId: 'plasma_core', count: 4 },
        { itemId: 'advanced_weapon', count: 2 },
      ],
    },
  },
];

// ==================== 货舱模块 ====================

export const CARGO_MODULES: ModuleDefinition[] = [
  {
    id: 'cargo_basic',
    name: '标准货舱',
    description: '标准的货物储存空间。',
    slot: ModuleSlot.CARGO,
    type: ModuleType.CARGO,
    rarity: ItemRarity.COMMON,
    level: 1,
    maxLevel: 5,
    effects: [
      { type: 'cargoCapacity', value: 50 },
      { type: 'speed', value: -3 },
    ],
    installCost: { credits: 100, materials: [] },
    upgradeCost: { credits: 200, materials: [{ itemId: 'metal', count: 8 }] },
  },
  {
    id: 'cargo_expanded',
    name: '扩展货舱',
    description: '大幅增加储存空间的货舱系统。',
    slot: ModuleSlot.CARGO,
    type: ModuleType.CARGO,
    rarity: ItemRarity.UNCOMMON,
    level: 1,
    maxLevel: 8,
    effects: [
      { type: 'cargoCapacity', value: 120 },
      { type: 'speed', value: -8 },
      { type: 'defense', value: 5 },
    ],
    installCost: {
      credits: 400,
      materials: [
        { itemId: 'reinforced_plate', count: 5 },
        { itemId: 'cargo_bay', count: 1 },
      ],
    },
    upgradeCost: {
      credits: 700,
      materials: [
        { itemId: 'reinforced_plate', count: 8 },
        { itemId: 'advanced_cargo_system', count: 1 },
      ],
    },
  },
];

// ==================== 传感模块 ====================

export const SENSOR_MODULES: ModuleDefinition[] = [
  {
    id: 'sensor_basic',
    name: '基础传感器',
    description: '标准的探测设备，可以探测附近的资源和敌人。',
    slot: ModuleSlot.SENSOR,
    type: ModuleType.SENSOR,
    rarity: ItemRarity.COMMON,
    level: 1,
    maxLevel: 5,
    effects: [
      { type: 'detection', value: 20 },
      { type: 'energy', value: 5 },
    ],
    installCost: { credits: 150, materials: [] },
    upgradeCost: { credits: 250, materials: [{ itemId: 'electronic_parts', count: 5 }] },
  },
  {
    id: 'sensor_advanced',
    name: '量子传感器',
    description: '采用量子技术的先进传感器，可以探测隐藏的资源和危险。',
    slot: ModuleSlot.SENSOR,
    type: ModuleType.SENSOR,
    rarity: ItemRarity.RARE,
    level: 1,
    maxLevel: 10,
    effects: [
      { type: 'detection', value: 50 },
      { type: 'speed', value: 10 },
      { type: 'energy', value: 10 },
    ],
    installCost: {
      credits: 700,
      materials: [
        { itemId: 'quantum_chip', count: 2 },
        { itemId: 'sensor_array', count: 1 },
      ],
    },
    upgradeCost: {
      credits: 1200,
      materials: [
        { itemId: 'quantum_chip', count: 4 },
        { itemId: 'advanced_sensor', count: 1 },
      ],
    },
  },
];

// ==================== 能源模块 ====================

export const POWER_MODULES: ModuleDefinition[] = [
  {
    id: 'power_basic',
    name: '基础能源核心',
    description: '标准的能源供应系统。',
    slot: ModuleSlot.POWER,
    type: ModuleType.POWER,
    rarity: ItemRarity.COMMON,
    level: 1,
    maxLevel: 5,
    effects: [
      { type: 'energy', value: 30 },
      { type: 'attack', value: 5 },
    ],
    installCost: { credits: 200, materials: [] },
    upgradeCost: { credits: 350, materials: [{ itemId: 'energy_cell', count: 5 }] },
  },
  {
    id: 'power_fusion',
    name: '聚变能源核心',
    description: '采用核聚变技术的高效能源系统。',
    slot: ModuleSlot.POWER,
    type: ModuleType.POWER,
    rarity: ItemRarity.RARE,
    level: 1,
    maxLevel: 10,
    effects: [
      { type: 'energy', value: 80 },
      { type: 'attack', value: 15 },
      { type: 'defense', value: 10 },
    ],
    installCost: {
      credits: 1000,
      materials: [
        { itemId: 'fusion_material', count: 3 },
        { itemId: 'containment_field', count: 1 },
      ],
    },
    upgradeCost: {
      credits: 1800,
      materials: [
        { itemId: 'fusion_material', count: 6 },
        { itemId: 'advanced_containment', count: 1 },
      ],
    },
  },
  {
    id: 'power_god',
    name: '神能核心',
    description: '融合神能的能源核心，拥有近乎无限的能量。',
    slot: ModuleSlot.POWER,
    type: ModuleType.POWER,
    rarity: ItemRarity.LEGENDARY,
    level: 1,
    maxLevel: 15,
    effects: [
      { type: 'energy', value: 150 },
      { type: 'attack', value: 30 },
      { type: 'defense', value: 20 },
      { type: 'speed', value: 15 },
    ],
    installCost: {
      credits: 3000,
      materials: [
        { itemId: 'god_energy_fragment', count: 10 },
        { itemId: 'divine_core', count: 1 },
        { itemId: 'ancient_tech', count: 3 },
      ],
    },
    upgradeCost: {
      credits: 5000,
      materials: [
        { itemId: 'god_energy_fragment', count: 15 },
        { itemId: 'divine_core', count: 2 },
      ],
    },
  },
];

// ==================== 所有模块汇总 ====================

export const ALL_MODULES: ModuleDefinition[] = [
  ...ENGINE_MODULES,
  ...SHIELD_MODULES,
  ...WEAPON_MODULES,
  ...CARGO_MODULES,
  ...SENSOR_MODULES,
  ...POWER_MODULES,
];

// ==================== 辅助函数 ====================

export function getModuleById(id: string): ModuleDefinition | undefined {
  return ALL_MODULES.find(m => m.id === id);
}

export function getModulesBySlot(slot: ModuleSlot): ModuleDefinition[] {
  return ALL_MODULES.filter(m => m.slot === slot);
}

export function getModulesByRarity(rarity: ItemRarity): ModuleDefinition[] {
  return ALL_MODULES.filter(m => m.rarity === rarity);
}

export function getModulesByType(type: ModuleType): ModuleDefinition[] {
  return ALL_MODULES.filter(m => m.type === type);
}

// 获取模块升级后的效果
export function getModuleEffectsAtLevel(module: ModuleDefinition, level: number): ModuleEffect[] {
  const multiplier = 1 + (level - 1) * 0.2; // 每升1级效果提升20%
  return module.effects.map(effect => ({
    type: effect.type,
    value: Math.floor(effect.value * multiplier),
  }));
}

// 检查是否可以安装模块
export function canInstallModule(
  module: ModuleDefinition,
  currentModules: Map<ModuleSlot, ModuleItem | null>,
  credits: number,
  inventory: { hasItem: (id: string, count: number) => boolean }
): { canInstall: boolean; reason?: string } {
  // 检查槽位是否被占用
  const currentModule = currentModules.get(module.slot);
  if (currentModule) {
    return { canInstall: false, reason: '该槽位已安装模块，请先卸载' };
  }

  // 检查信用点
  if (credits < module.installCost.credits) {
    return { canInstall: false, reason: '联邦信用点不足' };
  }

  // 检查材料
  for (const material of module.installCost.materials) {
    if (!inventory.hasItem(material.itemId, material.count)) {
      return { canInstall: false, reason: `缺少材料: ${material.itemId}` };
    }
  }

  return { canInstall: true };
}

// 检查是否可以升级模块
export function canUpgradeModule(
  module: ModuleDefinition,
  credits: number,
  inventory: { hasItem: (id: string, count: number) => boolean }
): { canUpgrade: boolean; reason?: string; maxLevelReached?: boolean } {
  // 检查是否已达最高等级
  if (module.level >= module.maxLevel) {
    return { canUpgrade: false, reason: '模块已达到最高等级', maxLevelReached: true };
  }

  // 检查信用点
  if (credits < module.upgradeCost.credits) {
    return { canUpgrade: false, reason: '联邦信用点不足' };
  }

  // 检查材料
  for (const material of module.upgradeCost.materials) {
    if (!inventory.hasItem(material.itemId, material.count)) {
      return { canUpgrade: false, reason: `缺少材料: ${material.itemId}` };
    }
  }

  return { canUpgrade: true };
}

export default ALL_MODULES;
