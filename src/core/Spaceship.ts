// 《星航荒宇》星际航船系统
// 替代原有的 Train.ts，实现航船核心逻辑

import {
  Spaceship as SpaceshipData,
  SpaceshipModule,
  ModuleSlot,
  ModuleItem,
  ModuleType,
  ItemRarity,
} from '../data/types_new';

// ==================== 航船配置常量 ====================

export const SPACESHIP_CONFIG = {
  MAX_LEVEL: 50,
  BASE_SPEED: 100,           // 基础跃迁速度
  BASE_DEFENSE: 50,          // 基础虚空防护
  BASE_CARGO: 100,           // 基础货舱容量
  BASE_ENERGY: 100,          // 基础能量
  ENERGY_PER_LEVEL: 20,      // 每级增加能量
  SPEED_PER_LEVEL: 10,       // 每级增加速度
  DEFENSE_PER_LEVEL: 5,      // 每级增加防护
  CARGO_PER_LEVEL: 20,       // 每级增加货舱
};

// ==================== 航船数据接口 ====================

export interface SpaceshipDataExport {
  id: string;
  name: string;
  level: number;
  experience: number;
  speed: number;
  defense: number;
  cargoCapacity: number;
  energy: number;
  maxEnergy: number;
  modules: SpaceshipModule[];
}

// ==================== 航船类 ====================

export class Spaceship {
  id: string;
  name: string;
  level: number;
  experience: number;
  energy: number;
  modules: Map<ModuleSlot, ModuleItem | null>;

  constructor(data?: Partial<SpaceshipDataExport>) {
    this.id = data?.id || 'ship_001';
    this.name = data?.name || '初号拓荒舰';
    this.level = data?.level || 1;
    this.experience = data?.experience || 0;
    this.energy = data?.energy || this.maxEnergy;
    
    // 初始化模块槽位
    this.modules = new Map();
    this.initModules(data?.modules);
  }

  // ==================== 基础属性计算 ====================

  get maxEnergy(): number {
    const baseEnergy = SPACESHIP_CONFIG.BASE_ENERGY;
    const levelBonus = (this.level - 1) * SPACESHIP_CONFIG.ENERGY_PER_LEVEL;
    const moduleBonus = this.getModuleBonus('energy');
    return baseEnergy + levelBonus + moduleBonus;
  }

  get speed(): number {
    const baseSpeed = SPACESHIP_CONFIG.BASE_SPEED;
    const levelBonus = (this.level - 1) * SPACESHIP_CONFIG.SPEED_PER_LEVEL;
    const moduleBonus = this.getModuleBonus('speed');
    return baseSpeed + levelBonus + moduleBonus;
  }

  get defense(): number {
    const baseDefense = SPACESHIP_CONFIG.BASE_DEFENSE;
    const levelBonus = (this.level - 1) * SPACESHIP_CONFIG.DEFENSE_PER_LEVEL;
    const moduleBonus = this.getModuleBonus('defense');
    return baseDefense + levelBonus + moduleBonus;
  }

  get cargoCapacity(): number {
    const baseCargo = SPACESHIP_CONFIG.BASE_CARGO;
    const levelBonus = (this.level - 1) * SPACESHIP_CONFIG.CARGO_PER_LEVEL;
    const moduleBonus = this.getModuleBonus('cargoCapacity');
    return baseCargo + levelBonus + moduleBonus;
  }

  get attack(): number {
    return this.getModuleBonus('attack');
  }

  // ==================== 模块系统 ====================

  private initModules(savedModules?: SpaceshipModule[]) {
    // 初始化所有槽位为空
    Object.values(ModuleSlot).forEach(slot => {
      this.modules.set(slot, null);
    });

    // 加载已保存的模块
    if (savedModules) {
      savedModules.forEach(module => {
        if (module.item) {
          this.modules.set(module.slot, module.item);
        }
      });
    }
  }

  /**
   * 安装模块
   */
  installModule(slot: ModuleSlot, module: ModuleItem): boolean {
    // 检查槽位是否匹配
    if (!this.isSlotCompatible(slot, module.type)) {
      return false;
    }

    this.modules.set(slot, module);
    return true;
  }

  /**
   * 卸载模块
   */
  uninstallModule(slot: ModuleSlot): ModuleItem | null {
    const module = this.modules.get(slot);
    this.modules.set(slot, null);
    return module || null;
  }

  /**
   * 获取指定槽位的模块
   */
  getModule(slot: ModuleSlot): ModuleItem | null {
    return this.modules.get(slot) || null;
  }

  /**
   * 检查槽位是否兼容
   */
  isSlotCompatible(slot: ModuleSlot, moduleType: ModuleType): boolean {
    return slot === moduleType;
  }

  /**
   * 获取模块属性加成
   */
  private getModuleBonus(stat: string): number {
    let bonus = 0;
    this.modules.forEach(module => {
      if (module) {
        module.effects.forEach(effect => {
          if (effect.stat === stat) {
            bonus += effect.value;
          }
        });
      }
    });
    return bonus;
  }

  // ==================== 能量系统 ====================

  /**
   * 消耗能量
   */
  consumeEnergy(amount: number): boolean {
    if (this.energy >= amount) {
      this.energy -= amount;
      return true;
    }
    return false;
  }

  /**
   * 恢复能量
   */
  restoreEnergy(amount: number): void {
    this.energy = Math.min(this.maxEnergy, this.energy + amount);
  }

  /**
   * 完全恢复能量
   */
  fullyRestoreEnergy(): void {
    this.energy = this.maxEnergy;
  }

  /**
   * 获取能量百分比
   */
  getEnergyPercentage(): number {
    return (this.energy / this.maxEnergy) * 100;
  }

  // ==================== 升级系统 ====================

  /**
   * 获取升级所需经验
   */
  getExpToNextLevel(): number {
    return Math.floor(100 * Math.pow(1.5, this.level - 1));
  }

  /**
   * 增加经验值
   */
  addExperience(amount: number): { leveledUp: boolean; newLevel?: number } {
    this.experience += amount;
    const expNeeded = this.getExpToNextLevel();
    
    if (this.experience >= expNeeded && this.level < SPACESHIP_CONFIG.MAX_LEVEL) {
      this.experience -= expNeeded;
      this.level++;
      this.energy = this.maxEnergy; // 升级时恢复能量
      return { leveledUp: true, newLevel: this.level };
    }
    
    return { leveledUp: false };
  }

  /**
   * 是否可以升级
   */
  canLevelUp(): boolean {
    return this.experience >= this.getExpToNextLevel() && 
           this.level < SPACESHIP_CONFIG.MAX_LEVEL;
  }

  // ==================== 跃迁系统 ====================

  /**
   * 计算跃迁时间（秒）
   * @param distance 距离
   */
  calculateJumpTime(distance: number): number {
    // 跃迁时间 = 距离 / 速度
    const baseTime = distance / this.speed;
    // 能量不足时速度降低
    const energyFactor = this.energy / this.maxEnergy;
    return Math.floor(baseTime / (0.5 + 0.5 * energyFactor));
  }

  /**
   * 执行跃迁
   * @param distance 跃迁距离
   */
  performJump(distance: number): { success: boolean; time: number; message?: string } {
    const energyCost = Math.floor(distance / 10);
    
    if (this.energy < energyCost) {
      return {
        success: false,
        time: 0,
        message: '能量不足，无法执行跃迁',
      };
    }

    this.consumeEnergy(energyCost);
    const time = this.calculateJumpTime(distance);
    
    return {
      success: true,
      time,
      message: `跃迁成功，耗时 ${time} 秒`,
    };
  }

  // ==================== 虚空防护 ====================

  /**
   * 计算虚空伤害减免
   */
  calculateVoidDamageReduction(voidIntensity: number): number {
    // 防护值越高，减免越多
    const reduction = (this.defense / (this.defense + 100)) * 0.8;
    return Math.min(0.8, reduction * (voidIntensity / 100));
  }

  /**
   * 受到虚空侵蚀
   */
  takeVoidDamage(amount: number, voidIntensity: number): number {
    const reduction = this.calculateVoidDamageReduction(voidIntensity);
    const actualDamage = Math.floor(amount * (1 - reduction));
    // 虚空伤害会同时消耗能量
    this.consumeEnergy(actualDamage);
    return actualDamage;
  }

  // ==================== 数据导出 ====================

  /**
   * 导出航船数据
   */
  exportData(): SpaceshipDataExport {
    const modules: SpaceshipModule[] = [];
    this.modules.forEach((item, slot) => {
      modules.push({ slot, item });
    });

    return {
      id: this.id,
      name: this.name,
      level: this.level,
      experience: this.experience,
      speed: this.speed,
      defense: this.defense,
      cargoCapacity: this.cargoCapacity,
      energy: this.energy,
      maxEnergy: this.maxEnergy,
      modules,
    };
  }

  /**
   * 获取航船状态摘要
   */
  getStatusSummary(): string {
    return `
【${this.name}】Lv.${this.level}
跃迁速度：${this.speed}
虚空防护：${this.defense}
货舱容量：${this.cargoCapacity}
能量：${this.energy}/${this.maxEnergy} (${this.getEnergyPercentage().toFixed(1)}%)
已装备模块：${Array.from(this.modules.values()).filter(m => m !== null).length}/6
    `.trim();
  }
}

// ==================== 模块工厂 ====================

export class ModuleFactory {
  /**
   * 创建基础模块
   */
  static createBasicModule(
    type: ModuleType,
    name: string,
    description: string
  ): ModuleItem {
    return {
      id: `module_${type}_basic`,
      name,
      type,
      level: 1,
      rarity: ItemRarity.COMMON,
      description,
      effects: this.getBasicModuleEffects(type),
    };
  }

  /**
   * 获取基础模块效果
   */
  private static getBasicModuleEffects(type: ModuleType): { stat: string; value: number; isPercentage: boolean }[] {
    const effects: Record<ModuleType, { stat: string; value: number; isPercentage: boolean }[]> = {
      [ModuleType.ENGINE]: [
        { stat: 'speed', value: 20, isPercentage: false },
      ],
      [ModuleType.SHIELD]: [
        { stat: 'defense', value: 15, isPercentage: false },
      ],
      [ModuleType.WEAPON]: [
        { stat: 'attack', value: 30, isPercentage: false },
      ],
      [ModuleType.CARGO]: [
        { stat: 'cargoCapacity', value: 50, isPercentage: false },
      ],
      [ModuleType.SENSOR]: [
        { stat: 'speed', value: 10, isPercentage: false },
      ],
      [ModuleType.ENERGY]: [
        { stat: 'energy', value: 50, isPercentage: false },
      ],
    };
    return effects[type];
  }
}

// ==================== 工具函数 ====================

/**
 * 获取模块槽位中文名称
 */
export function getModuleSlotName(slot: ModuleSlot): string {
  const names: Record<ModuleSlot, string> = {
    [ModuleSlot.ENGINE]: '引擎',
    [ModuleSlot.SHIELD]: '护盾',
    [ModuleSlot.WEAPON]: '武器',
    [ModuleSlot.CARGO]: '货舱',
    [ModuleSlot.SENSOR]: '传感器',
    [ModuleSlot.ENERGY]: '能源核心',
  };
  return names[slot];
}

/**
 * 获取模块类型中文名称
 */
export function getModuleTypeName(type: ModuleType): string {
  return getModuleSlotName(type as unknown as ModuleSlot);
}

export default Spaceship;
