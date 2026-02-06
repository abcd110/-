import {
  MythologyEquipment,
  EquipmentEffect,
  EquipmentStats,
  EffectTrigger,
  EffectType,
  EquipmentSlot
} from '../data/equipmentTypes';
import { getEquipmentById, getSetBonus } from '../data/mythologyEquipmentIndex';
import { calculateEquipmentStats } from './EquipmentStatCalculator';

export interface CalculatedStats {
  attack: number;
  defense: number;
  hp: number;
  agility: number; // 敏捷
  hit: number;
  dodge: number;
  speed: number;
  crit: number; // 会心
  critDamage: number;
  penetration: number; // 穿透固定值
  penetrationPercent: number; // 穿透百分比
  trueDamage: number;
  guard: number; // 护心
  luck: number; // 幸运
}

export interface EquipmentInstance extends MythologyEquipment {
  instanceId: string;
  quantity: number;
  equipped: boolean;
  enhanceLevel: number;
  sublimationLevel: number;
  isCrafted?: boolean; // 是否为制造装备（非神话装备）
}

export interface BattleContext {
  attacker: any;
  defender: any;
  damage?: number;
  isCrit?: boolean;
  isDodge?: boolean;
  currentHp?: number;
  maxHp?: number;
}

export class EquipmentSystem {
  private static instance: EquipmentSystem;
  private effectCooldowns: Map<string, number> = new Map();

  static getInstance(): EquipmentSystem {
    if (!EquipmentSystem.instance) {
      EquipmentSystem.instance = new EquipmentSystem();
    }
    return EquipmentSystem.instance;
  }

  calculateEquipmentStats(equippedItems: EquipmentInstance[]): CalculatedStats {
    const baseStats: CalculatedStats = {
      attack: 0,
      defense: 0,
      hp: 0,
      agility: 0,
      hit: 0,
      dodge: 0,
      speed: 0,
      crit: 0,
      critDamage: 0,
      penetration: 0,
      penetrationPercent: 0,
      trueDamage: 0,
      guard: 0,
      luck: 0,
    };

    const percentBonuses: Record<string, number> = {
      attack: 0,
      defense: 0,
      hp: 0,
      agility: 0,
      hit: 0,
      dodge: 0,
      speed: 0,
      crit: 0,
      critDamage: 0,
      penetration: 0,
      penetrationPercent: 0,
      trueDamage: 0,
      guard: 0,
      luck: 0,
    };

    equippedItems.forEach(item => {
      if (!item.equipped) return;

      // 使用新的装备属性计算器（实时根据强化等级计算）
      const calculatedStats = calculateEquipmentStats(item);

      baseStats.attack += calculatedStats.attack;
      baseStats.defense += calculatedStats.defense;
      baseStats.hp += calculatedStats.hp;
      baseStats.agility += calculatedStats.agility || 0;
      baseStats.hit += calculatedStats.hit;
      baseStats.dodge += calculatedStats.dodge;
      baseStats.speed += calculatedStats.speed;
      baseStats.crit += calculatedStats.crit;
      baseStats.critDamage += calculatedStats.critDamage;
      baseStats.penetration += calculatedStats.penetration;
      baseStats.penetrationPercent += calculatedStats.penetrationPercent;
      baseStats.trueDamage += calculatedStats.trueDamage;
      baseStats.guard += calculatedStats.guard;
      baseStats.luck += calculatedStats.luck;
    });

    const equipmentIds = equippedItems.filter(i => i.equipped).map(i => i.id);
    const setBonuses = getSetBonus(equipmentIds);

    setBonuses.forEach(bonus => {
      bonus.effects.forEach(effect => {
        if (effect.type === 'attack_percent') percentBonuses.attack += effect.value;
        if (effect.type === 'defense_percent') percentBonuses.defense += effect.value;
        if (effect.type === 'hp_percent') percentBonuses.hp += effect.value;
        if (effect.type === 'all_stats_percent') {
          Object.keys(percentBonuses).forEach(key => {
            percentBonuses[key] += effect.value;
          });
        }
      });
    });

    return {
      attack: Math.floor(baseStats.attack * (1 + percentBonuses.attack)),
      defense: Math.floor(baseStats.defense * (1 + percentBonuses.defense)),
      hp: Math.floor(baseStats.hp * (1 + percentBonuses.hp)),
      agility: Math.floor(baseStats.agility * (1 + percentBonuses.agility)),
      hit: Math.floor(baseStats.hit * (1 + percentBonuses.hit)),
      dodge: Math.floor(baseStats.dodge * (1 + percentBonuses.dodge)),
      speed: baseStats.speed * (1 + percentBonuses.speed),
      crit: Math.floor(baseStats.crit * (1 + percentBonuses.crit)),
      critDamage: Math.floor(baseStats.critDamage * (1 + percentBonuses.critDamage)),
      penetration: Math.floor(baseStats.penetration * (1 + percentBonuses.penetration)),
      penetrationPercent: Math.floor(baseStats.penetrationPercent * (1 + percentBonuses.penetrationPercent)),
      trueDamage: Math.floor(baseStats.trueDamage * (1 + percentBonuses.trueDamage)),
      guard: Math.floor(baseStats.guard * (1 + percentBonuses.guard)),
      luck: Math.floor(baseStats.luck * (1 + percentBonuses.luck)),
    };
  }

  calculatePower(stats: CalculatedStats): number {
    return (
      stats.attack * 0.4 +
      stats.defense * 0.3 +
      stats.hp * 0.15 +
      stats.speed * 0.1 * 100 +
      (stats.hit + stats.dodge + stats.crit * 2) * 0.05 +
      stats.penetration * 0.1 * 100 +
      stats.trueDamage * 0.1 * 100
    );
  }

  processEffects(
    trigger: EffectTrigger,
    equippedItems: EquipmentInstance[],
    context: BattleContext
  ): { damageBonus: number; healAmount: number; shieldAmount: number; trueDamagePercent: number; penetrationBonus: number; attackBonus: number; defenseReduction: number; effectsApplied: string[] } {
    const result = {
      damageBonus: 0,
      healAmount: 0,
      shieldAmount: 0,
      trueDamagePercent: 0,
      penetrationBonus: 0,
      attackBonus: 0,
      defenseReduction: 0,
      effectsApplied: [] as string[],
    };

    equippedItems.forEach(item => {
      if (!item.equipped) return;

      item.effects.forEach(effect => {
        if (effect.trigger !== trigger) return;

        const cooldownKey = `${item.instanceId}_${effect.id}`;
        const currentTime = Date.now();
        const lastUsed = this.effectCooldowns.get(cooldownKey) || 0;

        if (effect.cooldown && currentTime - lastUsed < effect.cooldown * 1000) {
          return;
        }

        if (effect.condition) {
          if (effect.condition.type === 'hp_below' && context.currentHp && context.maxHp) {
            const hpPercent = context.currentHp / context.maxHp;
            if (hpPercent > effect.condition.value) return;
          }
          if (effect.condition.type === 'hp_above' && context.currentHp && context.maxHp) {
            const hpPercent = context.currentHp / context.maxHp;
            if (hpPercent < effect.condition.value) return;
          }
        }

        const roll = Math.random();
        if (roll > effect.chance) return;

        this.effectCooldowns.set(cooldownKey, currentTime);

        switch (effect.type) {
          case EffectType.DAMAGE_BONUS:
            result.damageBonus += effect.value;
            result.effectsApplied.push(`${item.name}: 伤害+${effect.value * 100}%`);
            break;
          case EffectType.DAMAGE_TRUE:
            result.trueDamagePercent += effect.value;
            result.effectsApplied.push(`${item.name}: 真实伤害+${effect.value * 100}%`);
            break;
          case EffectType.HEAL_PERCENT:
            if (context.maxHp) {
              result.healAmount += context.maxHp * effect.value;
              result.effectsApplied.push(`${item.name}: 恢复${effect.value * 100}%生命`);
            }
            break;
          case EffectType.SHIELD_GAIN:
            if (context.maxHp) {
              result.shieldAmount += context.maxHp * effect.value;
              result.effectsApplied.push(`${item.name}: 获得${effect.value * 100}%护盾`);
            }
            break;
          case EffectType.REDUCE_DEFENSE:
            result.defenseReduction += effect.value;
            result.effectsApplied.push(`${item.name}: 防御-${effect.value * 100}%`);
            break;
          case EffectType.BOOST_ATTACK:
            result.attackBonus += effect.value;
            result.effectsApplied.push(`${item.name}: 攻击+${effect.value * 100}%`);
            break;
          case EffectType.IGNORE_DEFENSE:
            result.penetrationBonus += effect.value;
            result.effectsApplied.push(`${item.name}: 穿透+${effect.value * 100}%`);
            break;
          case EffectType.BOOST_CRIT:
            result.damageBonus += effect.value;
            result.effectsApplied.push(`${item.name}: 暴击伤害+${effect.value * 100}%`);
            break;
          case EffectType.BOOST_SPEED:
            result.effectsApplied.push(`${item.name}: 攻速提升`);
            break;
          case EffectType.IGNORE_DODGE:
            result.effectsApplied.push(`${item.name}: 命中提升`);
            break;
          case EffectType.BOOST_DODGE:
            result.effectsApplied.push(`${item.name}: 闪避提升`);
            break;
          case EffectType.LIFE_STEAL:
            if (context.damage) {
              result.healAmount += context.damage * effect.value;
              result.effectsApplied.push(`${item.name}: 吸血${effect.value * 100}%`);
            }
            break;
        }
      });
    });

    return result;
  }

  getBattleStartEffects(equippedItems: EquipmentInstance[], context: BattleContext) {
    return this.processEffects(EffectTrigger.ON_BATTLE_START, equippedItems, context);
  }

  getAttackEffects(equippedItems: EquipmentInstance[], context: BattleContext) {
    return this.processEffects(EffectTrigger.ON_ATTACK, equippedItems, context);
  }

  getHitEffects(equippedItems: EquipmentInstance[], context: BattleContext) {
    return this.processEffects(EffectTrigger.ON_HIT, equippedItems, context);
  }

  getDefendEffects(equippedItems: EquipmentInstance[], context: BattleContext) {
    return this.processEffects(EffectTrigger.ON_DEFEND, equippedItems, context);
  }

  getDodgeEffects(equippedItems: EquipmentInstance[], context: BattleContext) {
    return this.processEffects(EffectTrigger.ON_DODGE, equippedItems, context);
  }

  getCritEffects(equippedItems: EquipmentInstance[], context: BattleContext) {
    return this.processEffects(EffectTrigger.ON_CRIT, equippedItems, context);
  }

  getKillEffects(equippedItems: EquipmentInstance[], context: BattleContext) {
    return this.processEffects(EffectTrigger.ON_KILL, equippedItems, context);
  }

  getPassiveEffects(equippedItems: EquipmentInstance[], context: BattleContext) {
    return this.processEffects(EffectTrigger.PASSIVE, equippedItems, context);
  }

  enhanceEquipment(equipment: EquipmentInstance, success: boolean): EquipmentInstance {
    if (success) {
      return {
        ...equipment,
        enhanceLevel: Math.min(equipment.enhanceLevel + 1, 15),
      };
    }
    return equipment;
  }

  sublimateEquipment(equipment: EquipmentInstance, success: boolean): EquipmentInstance {
    if (success) {
      return {
        ...equipment,
        sublimationLevel: Math.min(equipment.sublimationLevel + 1, 10),
      };
    }
    return equipment;
  }

  getEnhanceSuccessRate(currentLevel: number): number {
    if (currentLevel < 5) return 0.9;
    if (currentLevel < 10) return 0.7;
    if (currentLevel < 13) return 0.5;
    return 0.3;
  }

  // 升华成功率：100%→90→80→60→40→20→5→1→0.1→0.01%
  getSublimationSuccessRate(currentLevel: number): number {
    const rates = [1.0, 0.9, 0.8, 0.6, 0.4, 0.2, 0.05, 0.01, 0.001, 0.0001];
    return rates[currentLevel] || 0.0001;
  }

  // 根据品质获取最大升华等级
  getMaxSublimationLevel(rarity: string): number {
    // 普通装备最高3级，按品质依次+2级
    const baseLevels: Record<string, number> = {
      'common': 3,
      'uncommon': 5,
      'rare': 7,
      'epic': 9,
      'legendary': 11,
      'mythic': 13,
    };
    return baseLevels[rarity] || 3;
  }

  clearCooldowns() {
    this.effectCooldowns.clear();
  }
}

export const equipmentSystem = EquipmentSystem.getInstance();
