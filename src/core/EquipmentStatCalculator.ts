import { EquipmentInstance } from './EquipmentSystem';

/**
 * 装备属性计算器
 * 
 * 强化规则：
 * - 攻击：基础值 + 强化等级 * 1
 * - 防御：基础值 + 强化等级 * 1
 * - 生命：基础值 + 强化等级 * 2
 * - 攻速：基础值 + 强化等级 * 0.1
 * - 闪避、命中：基础值 + 强化等级 * 5
 * 
 * 升华规则（在强化基础上叠加）：
 * - 攻击、防御、生命：(强化后值) * (1.2 ^ 升华等级)
 * - 攻速、闪避、命中等其余属性：不受升华影响
 * 
 * 重要：强化和升华只改变 enhanceLevel 和 sublimationLevel，不改变 stats 中的值
 * 所有属性都在显示时实时计算
 */

export interface CalculatedEquipmentStats {
  attack: number;
  defense: number;
  hp: number;
  agility: number;
  speed: number;
  dodge: number;
  hit: number;
  crit: number;
  critDamage: number;
  penetration: number;
  penetrationPercent: number;
  trueDamage: number;
  guard: number;
  luck: number;
}

/**
 * 计算装备的最终属性（根据强化等级和升华等级实时计算）
 */
export function calculateEquipmentStats(equipment: EquipmentInstance): CalculatedEquipmentStats {
  const enhanceLevel = equipment.enhanceLevel || 0;
  const sublimationLevel = equipment.sublimationLevel || 0;
  const baseStats = equipment.stats || {};

  // 先计算强化后的基础值
  const enhancedAttack = (baseStats.attack || 0) > 0 ? (baseStats.attack || 0) + enhanceLevel * 1 : 0;
  const enhancedDefense = (baseStats.defense || 0) > 0 ? (baseStats.defense || 0) + enhanceLevel * 1 : 0;
  const enhancedHp = (baseStats.hp || 0) > 0 ? (baseStats.hp || 0) + enhanceLevel * 2 : 0;
  const enhancedAgility = (baseStats.agility || 0) > 0 ? (baseStats.agility || 0) + enhanceLevel * 1 : (baseStats.agility || 0);
  const enhancedSpeed = (baseStats.speed || 0) > 0 ? (baseStats.speed || 0) + enhanceLevel * 0.1 : 0;
  const enhancedDodge = (baseStats.dodge || 0) > 0 ? (baseStats.dodge || 0) + enhanceLevel * 5 : 0;
  const enhancedHit = (baseStats.hit || 0) > 0 ? (baseStats.hit || 0) + enhanceLevel * 5 : 0;
  const enhancedCrit = (baseStats.crit || 0) > 0 ? (baseStats.crit || 0) + enhanceLevel * 1 : (baseStats.crit || 0);
  const enhancedCritDamage = (baseStats.critDamage || 0) > 0 ? (baseStats.critDamage || 0) + enhanceLevel * 1 : (baseStats.critDamage || 0);
  const enhancedPenetration = (baseStats.penetration || 0) > 0 ? (baseStats.penetration || 0) + enhanceLevel * 1 : (baseStats.penetration || 0);
  const enhancedPenetrationPercent = (baseStats.penetrationPercent || 0) > 0 ? (baseStats.penetrationPercent || 0) + enhanceLevel * 1 : (baseStats.penetrationPercent || 0);
  const enhancedTrueDamage = (baseStats.trueDamage || 0) > 0 ? (baseStats.trueDamage || 0) + enhanceLevel * 1 : (baseStats.trueDamage || 0);
  const enhancedGuard = (baseStats.guard || 0) > 0 ? (baseStats.guard || 0) + enhanceLevel * 1 : (baseStats.guard || 0);
  const enhancedLuck = (baseStats.luck || 0) > 0 ? (baseStats.luck || 0) + enhanceLevel * 1 : (baseStats.luck || 0);

  // 升华加成倍数：1.2 ^ 升华等级
  const sublimationMultiplier = Math.pow(1.2, sublimationLevel);

  return {
    // 攻击、防御、生命受升华影响
    attack: enhancedAttack > 0 ? Math.floor(enhancedAttack * sublimationMultiplier) : 0,
    defense: enhancedDefense > 0 ? Math.floor(enhancedDefense * sublimationMultiplier) : 0,
    hp: enhancedHp > 0 ? Math.floor(enhancedHp * sublimationMultiplier) : 0,

    // 攻速、闪避、命中不受升华影响
    agility: enhancedAgility,
    speed: enhancedSpeed,
    dodge: enhancedDodge,
    hit: enhancedHit,

    // 其余属性也不受升华影响
    crit: enhancedCrit,
    critDamage: enhancedCritDamage,
    penetration: enhancedPenetration,
    penetrationPercent: enhancedPenetrationPercent,
    trueDamage: enhancedTrueDamage,
    guard: enhancedGuard,
    luck: enhancedLuck,
  };
}

/**
 * 计算强化后的属性预览
 */
export function calculateEnhancedStatsPreview(
  equipment: EquipmentInstance,
  targetEnhanceLevel: number
): CalculatedEquipmentStats {
  const sublimationLevel = equipment.sublimationLevel || 0;
  const baseStats = equipment.stats || {};

  // 使用目标强化等级计算
  const enhancedAttack = (baseStats.attack || 0) > 0 ? (baseStats.attack || 0) + targetEnhanceLevel * 1 : 0;
  const enhancedDefense = (baseStats.defense || 0) > 0 ? (baseStats.defense || 0) + targetEnhanceLevel * 1 : 0;
  const enhancedHp = (baseStats.hp || 0) > 0 ? (baseStats.hp || 0) + targetEnhanceLevel * 2 : 0;
  const enhancedAgility = (baseStats.agility || 0) > 0 ? (baseStats.agility || 0) + targetEnhanceLevel * 1 : (baseStats.agility || 0);
  const enhancedSpeed = (baseStats.speed || 0) > 0 ? (baseStats.speed || 0) + targetEnhanceLevel * 0.1 : 0;
  const enhancedDodge = (baseStats.dodge || 0) > 0 ? (baseStats.dodge || 0) + targetEnhanceLevel * 5 : 0;
  const enhancedHit = (baseStats.hit || 0) > 0 ? (baseStats.hit || 0) + targetEnhanceLevel * 5 : 0;
  const enhancedCrit = (baseStats.crit || 0) > 0 ? (baseStats.crit || 0) + targetEnhanceLevel * 1 : (baseStats.crit || 0);
  const enhancedCritDamage = (baseStats.critDamage || 0) > 0 ? (baseStats.critDamage || 0) + targetEnhanceLevel * 1 : (baseStats.critDamage || 0);
  const enhancedPenetration = (baseStats.penetration || 0) > 0 ? (baseStats.penetration || 0) + targetEnhanceLevel * 1 : (baseStats.penetration || 0);
  const enhancedPenetrationPercent = (baseStats.penetrationPercent || 0) > 0 ? (baseStats.penetrationPercent || 0) + targetEnhanceLevel * 1 : (baseStats.penetrationPercent || 0);
  const enhancedTrueDamage = (baseStats.trueDamage || 0) > 0 ? (baseStats.trueDamage || 0) + targetEnhanceLevel * 1 : (baseStats.trueDamage || 0);
  const enhancedGuard = (baseStats.guard || 0) > 0 ? (baseStats.guard || 0) + targetEnhanceLevel * 1 : (baseStats.guard || 0);
  const enhancedLuck = (baseStats.luck || 0) > 0 ? (baseStats.luck || 0) + targetEnhanceLevel * 1 : (baseStats.luck || 0);

  // 升华加成倍数：1.2 ^ 升华等级
  const sublimationMultiplier = Math.pow(1.2, sublimationLevel);

  return {
    attack: enhancedAttack > 0 ? Math.floor(enhancedAttack * sublimationMultiplier) : 0,
    defense: enhancedDefense > 0 ? Math.floor(enhancedDefense * sublimationMultiplier) : 0,
    hp: enhancedHp > 0 ? Math.floor(enhancedHp * sublimationMultiplier) : 0,
    agility: enhancedAgility,
    speed: enhancedSpeed,
    dodge: enhancedDodge,
    hit: enhancedHit,
    crit: enhancedCrit,
    critDamage: enhancedCritDamage,
    penetration: enhancedPenetration,
    penetrationPercent: enhancedPenetrationPercent,
    trueDamage: enhancedTrueDamage,
    guard: enhancedGuard,
    luck: enhancedLuck,
  };
}

/**
 * 计算升华后的属性预览
 */
export function calculateSublimationStatsPreview(
  equipment: EquipmentInstance,
  targetSublimationLevel: number
): CalculatedEquipmentStats {
  const enhanceLevel = equipment.enhanceLevel || 0;
  const baseStats = equipment.stats || {};

  // 先计算强化后的基础值
  const enhancedAttack = (baseStats.attack || 0) > 0 ? (baseStats.attack || 0) + enhanceLevel * 1 : 0;
  const enhancedDefense = (baseStats.defense || 0) > 0 ? (baseStats.defense || 0) + enhanceLevel * 1 : 0;
  const enhancedHp = (baseStats.hp || 0) > 0 ? (baseStats.hp || 0) + enhanceLevel * 2 : 0;
  const enhancedAgility = (baseStats.agility || 0) > 0 ? (baseStats.agility || 0) + enhanceLevel * 1 : (baseStats.agility || 0);
  const enhancedSpeed = (baseStats.speed || 0) > 0 ? (baseStats.speed || 0) + enhanceLevel * 0.1 : 0;
  const enhancedDodge = (baseStats.dodge || 0) > 0 ? (baseStats.dodge || 0) + enhanceLevel * 5 : 0;
  const enhancedHit = (baseStats.hit || 0) > 0 ? (baseStats.hit || 0) + enhanceLevel * 5 : 0;
  const enhancedCrit = (baseStats.crit || 0) > 0 ? (baseStats.crit || 0) + enhanceLevel * 1 : (baseStats.crit || 0);
  const enhancedCritDamage = (baseStats.critDamage || 0) > 0 ? (baseStats.critDamage || 0) + enhanceLevel * 1 : (baseStats.critDamage || 0);
  const enhancedPenetration = (baseStats.penetration || 0) > 0 ? (baseStats.penetration || 0) + enhanceLevel * 1 : (baseStats.penetration || 0);
  const enhancedPenetrationPercent = (baseStats.penetrationPercent || 0) > 0 ? (baseStats.penetrationPercent || 0) + enhanceLevel * 1 : (baseStats.penetrationPercent || 0);
  const enhancedTrueDamage = (baseStats.trueDamage || 0) > 0 ? (baseStats.trueDamage || 0) + enhanceLevel * 1 : (baseStats.trueDamage || 0);
  const enhancedGuard = (baseStats.guard || 0) > 0 ? (baseStats.guard || 0) + enhanceLevel * 1 : (baseStats.guard || 0);
  const enhancedLuck = (baseStats.luck || 0) > 0 ? (baseStats.luck || 0) + enhanceLevel * 1 : (baseStats.luck || 0);

  // 使用目标升华等级计算加成倍数
  const sublimationMultiplier = Math.pow(1.2, targetSublimationLevel);

  return {
    attack: enhancedAttack > 0 ? Math.floor(enhancedAttack * sublimationMultiplier) : 0,
    defense: enhancedDefense > 0 ? Math.floor(enhancedDefense * sublimationMultiplier) : 0,
    hp: enhancedHp > 0 ? Math.floor(enhancedHp * sublimationMultiplier) : 0,
    agility: enhancedAgility,
    speed: enhancedSpeed,
    dodge: enhancedDodge,
    hit: enhancedHit,
    crit: enhancedCrit,
    critDamage: enhancedCritDamage,
    penetration: enhancedPenetration,
    penetrationPercent: enhancedPenetrationPercent,
    trueDamage: enhancedTrueDamage,
    guard: enhancedGuard,
    luck: enhancedLuck,
  };
}
