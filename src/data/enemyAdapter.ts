// 敌人数据适配器
// 将新的虚空怪物数据适配到旧的敌人系统

import { ALL_VOID_CREATURES, VoidCreature, getRandomCreature } from './voidCreatures';
import { ENEMIES } from './enemies';
import type { Enemy } from './types';

// 将 VoidCreature 转换为 Enemy 格式
export function convertVoidCreatureToEnemy(creature: VoidCreature): Enemy {
  return {
    id: creature.id,
    name: creature.name,
    hp: creature.hp,
    maxHp: creature.maxHp,
    attack: creature.attack,
    defense: creature.defense,
    speed: creature.speed,
    expReward: creature.expReward,
    lootTable: creature.lootTable,
    description: creature.description,
    icon: creature.icon,
  };
}

// 获取所有适配后的敌人
export function getAllAdaptedEnemies(): Record<string, Enemy> {
  const adaptedEnemies: Record<string, Enemy> = {};
  
  // 转换所有虚空怪物
  ALL_VOID_CREATURES.forEach(creature => {
    adaptedEnemies[creature.id] = convertVoidCreatureToEnemy(creature);
  });
  
  // 保留原有的 ENEMIES 作为后备
  Object.entries(ENEMIES).forEach(([id, enemy]) => {
    if (!adaptedEnemies[id]) {
      adaptedEnemies[id] = enemy;
    }
  });
  
  return adaptedEnemies;
}

// 根据星球ID获取敌人
export function getEnemiesByPlanetId(planetId: string): Enemy[] {
  const creatures = ALL_VOID_CREATURES.filter(c => c.planetId === planetId);
  return creatures.map(convertVoidCreatureToEnemy);
}

// 获取随机敌人（用于战斗生成）
export function getRandomEnemyForPlanet(
  planetId: string, 
  type: 'normal' | 'elite' | 'boss'
): Enemy | null {
  const creature = getRandomCreature(planetId, type);
  if (!creature) return null;
  return convertVoidCreatureToEnemy(creature);
}

// 获取BOSS敌人
export function getBossEnemyForPlanet(planetId: string): Enemy | null {
  return getRandomEnemyForPlanet(planetId, 'boss');
}

// 获取精英敌人
export function getEliteEnemyForPlanet(planetId: string): Enemy | null {
  return getRandomEnemyForPlanet(planetId, 'elite');
}

// 获取普通敌人
export function getNormalEnemyForPlanet(planetId: string): Enemy | null {
  return getRandomEnemyForPlanet(planetId, 'normal');
}

// 扩展的敌人数据（包含虚空怪物）
export const EXTENDED_ENEMIES = getAllAdaptedEnemies();

export default EXTENDED_ENEMIES;
