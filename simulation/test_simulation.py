#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
快速测试模拟
"""

import random
from dataclasses import dataclass, field
from typing import List, Dict, Tuple
from enum import Enum

# 战甲品质系统
class ArmorQuality(Enum):
    STARDUST = 1
    ALLOY = 2
    CRYSTAL = 3
    QUANTUM = 4
    VOID = 5

ARMOR_QUALITY_NAMES = {
    ArmorQuality.STARDUST: '星尘级',
    ArmorQuality.ALLOY: '合金级',
    ArmorQuality.CRYSTAL: '晶核级',
    ArmorQuality.QUANTUM: '量子级',
    ArmorQuality.VOID: '虚空级',
}

# 新战甲基础数值
NANO_ARMOR_BASE = {
    'helmet': {'name': '神经同步盔', 'defense': 2, 'hp': 12, 'hit': 2},
    'chest': {'name': '核心反应炉', 'defense': 3, 'hp': 18, 'speed': 0.5},
    'shoulder': {'name': '相位护盾肩', 'defense': 1, 'hp': 8, 'dodge': 1},
    'arm': {'name': '脉冲力场臂', 'attack': 5},
    'leg': {'name': '推进悬浮腿', 'defense': 2, 'hp': 6, 'dodge': 2},
    'boot': {'name': '反重力战靴', 'hp': 4},
}

# 计算装备属性
def calculate_equipment_stats(base_stats: Dict, enhance_level: int, sublimation_level: int) -> Dict:
    enhanced = {}
    for stat, value in base_stats.items():
        if stat == 'attack':
            enhanced[stat] = value + enhance_level * 1 if value > 0 else 0
        elif stat == 'defense':
            enhanced[stat] = value + enhance_level * 1 if value > 0 else 0
        elif stat == 'hp':
            enhanced[stat] = value + enhance_level * 2 if value > 0 else 0
        elif stat == 'speed':
            enhanced[stat] = value + enhance_level * 0.1 if value > 0 else 0
        elif stat in ['dodge', 'hit']:
            enhanced[stat] = value + enhance_level * 5 if value > 0 else 0
        else:
            enhanced[stat] = value
    
    sublimation_multiplier = (1.2 ** sublimation_level)
    
    result = {}
    for stat, value in enhanced.items():
        if stat in ['attack', 'defense', 'hp'] and value > 0:
            result[stat] = int(value * sublimation_multiplier)
        else:
            result[stat] = value
    
    return result

# 敌人系统
ENEMY_TIERS = {
    'T1': {'hpMultiplier': 1.0, 'attackMultiplier': 1.0, 'defenseMultiplier': 1.0},
    'T2': {'hpMultiplier': 1.6, 'attackMultiplier': 1.5, 'defenseMultiplier': 1.5},
    'T3': {'hpMultiplier': 2.5, 'attackMultiplier': 2.2, 'defenseMultiplier': 2.2},
}

BASE_ENEMY_STATS = {'hp': 200, 'attack': 20, 'defense': 10}

def calculate_enemy_stats(tier: str, level: int = 1) -> Dict:
    tier_data = ENEMY_TIERS[tier]
    level_multiplier = 1 + (level - 1) * 0.1
    return {
        'hp': int(BASE_ENEMY_STATS['hp'] * tier_data['hpMultiplier'] * level_multiplier),
        'attack': int(BASE_ENEMY_STATS['attack'] * tier_data['attackMultiplier'] * level_multiplier),
        'defense': int(BASE_ENEMY_STATS['defense'] * tier_data['defenseMultiplier'] * level_multiplier),
    }

# 联邦科技星
FEDERAL_TECH_STARS = {
    'planet_alpha': {'name': '阿尔法宜居星', 'level': 1, 'enemyTier': 'T1', 'bossTier': 'T2'},
    'planet_beta': {'name': '贝塔工业星', 'level': 3, 'enemyTier': 'T1', 'bossTier': 'T2'},
    'planet_gamma': {'name': '伽马研究星', 'level': 4, 'enemyTier': 'T1', 'bossTier': 'T2'},
    'planet_delta': {'name': '德尔塔军事星', 'level': 5, 'enemyTier': 'T1', 'bossTier': 'T3'},
}

# 玩家基础
PLAYER_BASE = {'hp': 100, 'attack': 10, 'defense': 5, 'speed': 1.0}

print("="*60)
print("战甲基础属性分析")
print("="*60)

# 计算6件套基础属性
base_stats = {'attack': 0, 'defense': 0, 'hp': 0, 'speed': 0}
for slot, data in NANO_ARMOR_BASE.items():
    for stat, value in data.items():
        if stat != 'name':
            base_stats[stat] = base_stats.get(stat, 0) + value

print(f"\n6件套星尘级基础属性:")
print(f"  攻击: {base_stats.get('attack', 0)}")
print(f"  防御: {base_stats.get('defense', 0)}")
print(f"  生命: {base_stats.get('hp', 0)}")
print(f"  攻速: {base_stats.get('speed', 0)}")

# 计算6件套+套装效果
total_attack = base_stats.get('attack', 0)
total_defense = base_stats.get('defense', 0)
total_hp = base_stats.get('hp', 0)
total_speed = base_stats.get('speed', 0)

# 套装效果: 2件+10%, 4件+20%, 6件+35% = 总计+65%
total_attack = int(total_attack * 1.65)

print(f"\n6件套+套装效果后:")
print(f"  攻击: {total_attack}")
print(f"  防御: {total_defense}")
print(f"  生命: {total_hp}")
print(f"  攻速: {total_speed}")

# 加上玩家基础
final_attack = PLAYER_BASE['attack'] + total_attack
final_defense = PLAYER_BASE['defense'] + total_defense
final_hp = PLAYER_BASE['hp'] + total_hp
final_speed = PLAYER_BASE['speed'] + total_speed

print(f"\n玩家总属性(星尘级+0):")
print(f"  攻击: {final_attack}")
print(f"  防御: {final_defense}")
print(f"  生命: {final_hp}")
print(f"  攻速: {final_speed}")

# 计算战力
player_power = final_hp * 0.5 + final_attack * 10 + final_defense * 8 + final_speed * 50
print(f"\n初始战力: {int(player_power)}")

print("\n" + "="*60)
print("联邦科技星敌人战力需求")
print("="*60)

for star_id, star_data in FEDERAL_TECH_STARS.items():
    print(f"\n{star_data['name']} (Level {star_data['level']}):")
    
    for tier_type, tier in [('普通', star_data['enemyTier']), ('BOSS', star_data['bossTier'])]:
        enemy_data = calculate_enemy_stats(tier, star_data['level'])
        enemy_power = enemy_data['hp'] + enemy_data['attack'] * 10
        print(f"  {tier_type:6s}: HP={enemy_data['hp']:4d} 攻击={enemy_data['attack']:3d} "
              f"防御={enemy_data['defense']:3d} 推荐战力={enemy_power:5d}")

print("\n" + "="*60)
print("强化成长分析")
print("="*60)

for enhance in [0, 5, 10, 15, 20]:
    total = {'attack': 0, 'defense': 0, 'hp': 0, 'speed': 0}
    for slot, data in NANO_ARMOR_BASE.items():
        base = {k: v for k, v in data.items() if k != 'name'}
        stats = calculate_equipment_stats(base, enhance, 0)
        for stat, value in stats.items():
            if stat in total:
                total[stat] += value
    
    attack_with_set = int(total['attack'] * 1.65)
    final_atk = PLAYER_BASE['attack'] + attack_with_set
    final_def = PLAYER_BASE['defense'] + total['defense']
    final_hp_val = PLAYER_BASE['hp'] + total['hp']
    final_spd = PLAYER_BASE['speed'] + total['speed']
    power = final_hp_val * 0.5 + final_atk * 10 + final_def * 8 + final_spd * 50
    
    print(f"  +{enhance:2d}: 攻击={final_atk:3d} 防御={final_def:3d} "
          f"生命={final_hp_val:3d} 攻速={final_spd:4.1f} 战力={int(power):4d}")

print("\n" + "="*60)
print("品质成长分析 (+10强化)")
print("="*60)

for quality in ArmorQuality:
    sublimation = quality.value - 1
    total = {'attack': 0, 'defense': 0, 'hp': 0, 'speed': 0}
    for slot, data in NANO_ARMOR_BASE.items():
        base = {k: v for k, v in data.items() if k != 'name'}
        stats = calculate_equipment_stats(base, 10, sublimation)
        for stat, value in stats.items():
            if stat in total:
                total[stat] += value
    
    attack_with_set = int(total['attack'] * 1.65)
    final_atk = PLAYER_BASE['attack'] + attack_with_set
    final_def = PLAYER_BASE['defense'] + total['defense']
    final_hp_val = PLAYER_BASE['hp'] + total['hp']
    final_spd = PLAYER_BASE['speed'] + total['speed']
    power = final_hp_val * 0.5 + final_atk * 10 + final_def * 8 + final_spd * 50
    
    print(f"  {ARMOR_QUALITY_NAMES[quality]:8s}: 攻击={final_atk:3d} 防御={final_def:3d} "
          f"生命={final_hp_val:3d} 攻速={final_spd:4.1f} 战力={int(power):4d}")
