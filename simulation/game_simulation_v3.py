#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
《星航荒宇》游戏数值模拟器 V3
使用实际游戏代码中的数据：
- 战甲基础数值来自 nanoArmorRecipes.ts
- 伤害计算公式来自 BattleSystem.ts
- 强化/升华规则来自 EquipmentStatCalculator.ts
- 敌人数据来自 locations.ts (联邦科技星系列)
"""

import random
from dataclasses import dataclass, field
from typing import List, Dict, Tuple
from enum import Enum

# ============ 战甲品质系统 ============
class ArmorQuality(Enum):
    STARDUST = 1   # 星尘级 (灰白)
    ALLOY = 2      # 合金级 (浅绿)
    CRYSTAL = 3    # 晶核级 (科技蓝)
    QUANTUM = 4    # 量子级 (暗紫)
    VOID = 5       # 虚空级 (暗金/虚空紫)

ARMOR_QUALITY_NAMES = {
    ArmorQuality.STARDUST: '星尘级',
    ArmorQuality.ALLOY: '合金级',
    ArmorQuality.CRYSTAL: '晶核级',
    ArmorQuality.QUANTUM: '量子级',
    ArmorQuality.VOID: '虚空级',
}

# 品质合成配置: 5个低品质 → 1个高品质
QUALITY_UPGRADE_CONFIG = {
    ArmorQuality.STARDUST: {'next': ArmorQuality.ALLOY, 'required': 5},
    ArmorQuality.ALLOY: {'next': ArmorQuality.CRYSTAL, 'required': 5},
    ArmorQuality.CRYSTAL: {'next': ArmorQuality.QUANTUM, 'required': 5},
    ArmorQuality.QUANTUM: {'next': ArmorQuality.VOID, 'required': 5},
    ArmorQuality.VOID: {'next': None, 'required': 0},
}

# ============ 材料系统 ============
# 10种战甲材料（来自 nanoArmorRecipes.ts）
MATERIALS = [
    'mat_001',  # 星铁基础构件
    'mat_002',  # 星铜传导组件
    'mat_003',  # 钛钢外甲坯料
    'mat_004',  # 战甲能量晶核
    'mat_005',  # 稀土传感基质
    'mat_006',  # 虚空防护核心
    'mat_007',  # 推进模块燃料
    'mat_008',  # 纳米韧化纤维
    'mat_009',  # 陨铁缓冲衬垫
    'mat_010',  # 量子紧固组件
]

MATERIAL_NAMES = {
    'mat_001': '星铁基础构件',
    'mat_002': '星铜传导组件',
    'mat_003': '钛钢外甲坯料',
    'mat_004': '战甲能量晶核',
    'mat_005': '稀土传感基质',
    'mat_006': '虚空防护核心',
    'mat_007': '推进模块燃料',
    'mat_008': '纳米韧化纤维',
    'mat_009': '陨铁缓冲衬垫',
    'mat_010': '量子紧固组件',
}

# 基础掉落率配置
BASE_DROP_RATES = {
    'normal': {  # 普通敌人
        ArmorQuality.STARDUST: 0.40,
        ArmorQuality.ALLOY: 0.25,
        ArmorQuality.CRYSTAL: 0.20,
        ArmorQuality.QUANTUM: 0.10,
        ArmorQuality.VOID: 0.05,
    },
    'elite': {  # 精英敌人
        ArmorQuality.STARDUST: 0.20,
        ArmorQuality.ALLOY: 0.30,
        ArmorQuality.CRYSTAL: 0.20,
        ArmorQuality.QUANTUM: 0.20,
        ArmorQuality.VOID: 0.10,
    },
    'boss': {  # BOSS敌人
        ArmorQuality.STARDUST: 0.10,
        ArmorQuality.ALLOY: 0.20,
        ArmorQuality.CRYSTAL: 0.30,
        ArmorQuality.QUANTUM: 0.25,
        ArmorQuality.VOID: 0.15,
    },
}

# 星球对掉落率的影响（相对于基础概率的变化）
# 星球2-6：星尘-2%、合金-2%、晶核-2%、量子+4%、虚空+2%
# 星球7-8：星尘0%、合金-3%、晶核-3%、量子+4%、虚空+2%
PLANET_DROP_MODIFIERS = {
    1: {ArmorQuality.STARDUST: 0, ArmorQuality.ALLOY: 0, ArmorQuality.CRYSTAL: 0, ArmorQuality.QUANTUM: 0, ArmorQuality.VOID: 0},
    2: {ArmorQuality.STARDUST: -0.02, ArmorQuality.ALLOY: -0.02, ArmorQuality.CRYSTAL: -0.02, ArmorQuality.QUANTUM: 0.04, ArmorQuality.VOID: 0.02},
    3: {ArmorQuality.STARDUST: -0.04, ArmorQuality.ALLOY: -0.04, ArmorQuality.CRYSTAL: -0.04, ArmorQuality.QUANTUM: 0.08, ArmorQuality.VOID: 0.04},
    4: {ArmorQuality.STARDUST: -0.06, ArmorQuality.ALLOY: -0.06, ArmorQuality.CRYSTAL: -0.06, ArmorQuality.QUANTUM: 0.12, ArmorQuality.VOID: 0.06},
    5: {ArmorQuality.STARDUST: -0.08, ArmorQuality.ALLOY: -0.08, ArmorQuality.CRYSTAL: -0.08, ArmorQuality.QUANTUM: 0.16, ArmorQuality.VOID: 0.08},
    6: {ArmorQuality.STARDUST: -0.10, ArmorQuality.ALLOY: -0.10, ArmorQuality.CRYSTAL: -0.10, ArmorQuality.QUANTUM: 0.20, ArmorQuality.VOID: 0.10},
    7: {ArmorQuality.STARDUST: 0, ArmorQuality.ALLOY: -0.03, ArmorQuality.CRYSTAL: -0.03, ArmorQuality.QUANTUM: 0.04, ArmorQuality.VOID: 0.02},
    8: {ArmorQuality.STARDUST: 0, ArmorQuality.ALLOY: -0.06, ArmorQuality.CRYSTAL: -0.06, ArmorQuality.QUANTUM: 0.08, ArmorQuality.VOID: 0.04},
}

def get_drop_rates(enemy_type: str, planet_idx: int) -> Dict[ArmorQuality, float]:
    """获取指定敌人类型和星球的掉落率"""
    base_rates = BASE_DROP_RATES[enemy_type].copy()
    modifiers = PLANET_DROP_MODIFIERS.get(planet_idx, PLANET_DROP_MODIFIERS[1])
    
    # 应用星球修正
    adjusted_rates = {}
    for quality in ArmorQuality:
        rate = base_rates[quality] + modifiers[quality]
        # 确保概率在合理范围内
        adjusted_rates[quality] = max(0.01, min(0.95, rate))
    
    return adjusted_rates

def roll_material_drop(enemy_type: str, planet_idx: int) -> List[Tuple[str, ArmorQuality]]:
    """
    掉落材料
    - 普通敌人：随机3种材料
    - 精英敌人：随机5种材料
    - BOSS：随机7种材料
    返回: [(材料ID, 品质), ...]
    """
    drop_counts = {
        'normal': 3,
        'elite': 5,
        'boss': 7,
    }
    
    count = drop_counts.get(enemy_type, 3)
    rates = get_drop_rates(enemy_type, planet_idx)
    
    drops = []
    selected_materials = random.sample(MATERIALS, min(count, len(MATERIALS)))
    
    for mat_id in selected_materials:
        # 根据概率 roll 品质
        roll = random.random()
        cumulative = 0
        for quality in ArmorQuality:
            cumulative += rates[quality]
            if roll <= cumulative:
                drops.append((mat_id, quality))
                break
        else:
            # 默认最低品质
            drops.append((mat_id, ArmorQuality.STARDUST))
    
    return drops

# ============ 战甲基础属性（来自 nanoArmorRecipes.ts）===========
# 更新后的数值（根据图片）
NANO_ARMOR_BASE = {
    'helmet': {  # 神经同步盔
        'name': '神经同步盔',
        'defense': 2,
        'hp': 12,
        'hit': 2,
    },
    'chest': {  # 核心反应炉
        'name': '核心反应炉',
        'defense': 3,
        'hp': 18,
        'speed': 0.5,  # 攻速
    },
    'shoulder': {  # 相位护盾肩
        'name': '相位护盾肩',
        'defense': 1,
        'hp': 8,
        'dodge': 1,
    },
    'arm': {  # 脉冲力场臂
        'name': '脉冲力场臂',
        'attack': 5,
    },
    'leg': {  # 推进悬浮腿
        'name': '推进悬浮腿',
        'defense': 2,
        'hp': 6,
        'dodge': 1,
    },
    'boot': {  # 反重力战靴
        'name': '反重力战靴',
        'defense': 1,
        'hp': 4,
        'dodge': 2,
    },
}

# ============ 强化与升华规则（来自游戏实际数据）===========

# 强化成功率表 (EnhanceSystem.ts)
ENHANCE_SUCCESS_RATES = {
    0: 1.00,  # +0→+1: 100%
    1: 0.95,  # +1→+2: 95%
    2: 0.90,  # +2→+3: 90%
    3: 0.85,  # +3→+4: 85%
    4: 0.80,  # +4→+5: 80%
    5: 0.75,  # +5→+6: 75%
    6: 0.70,  # +6→+7: 70%
    7: 0.65,  # +7→+8: 65%
    8: 0.60,  # +8→+9: 60%
    9: 0.55,  # +9→+10: 55%
    10: 0.50, # +10→+11: 50%
    11: 0.45, # +11→+12: 45%
    12: 0.40, # +12→+13: 40%
    13: 0.35, # +13→+14: 35%
    14: 0.30, # +14→+15: 30%
    15: 0.25, # +15→+16: 25%
    16: 0.20, # +16→+17: 20%
    17: 0.15, # +17→+18: 15%
    18: 0.10, # +18→+19: 10%
    19: 0.05, # +19→+20: 5%
}

# 强化石消耗表 (EnhanceSystem.ts)
ENHANCE_STONE_COST = {
    0: 1,   # +0→+1: 1个
    1: 1,   # +1→+2: 1个
    2: 2,   # +2→+3: 2个
    3: 2,   # +3→+4: 2个
    4: 3,   # +4→+5: 3个
    5: 3,   # +5→+6: 3个
    6: 4,   # +6→+7: 4个
    7: 4,   # +7→+8: 4个
    8: 5,   # +8→+9: 5个
    9: 5,   # +9→+10: 5个
    10: 6,  # +10→+11: 6个
    11: 6,  # +11→+12: 6个
    12: 7,  # +12→+13: 7个
    13: 7,  # +13→+14: 7个
    14: 8,  # +14→+15: 8个
    15: 8,  # +15→+16: 8个
    16: 9,  # +16→+17: 9个
    17: 9,  # +17→+18: 9个
    18: 10, # +18→+19: 10个
    19: 10, # +19→+20: 10个
}

# 最大强化等级
MAX_ENHANCE_LEVEL = 20

# 升华成功率表 (EquipmentSystem.ts)
SUBLIMATION_SUCCESS_RATES = {
    0: 1.00,    # 0→1: 100%
    1: 0.90,    # 1→2: 90%
    2: 0.80,    # 2→3: 80%
    3: 0.60,    # 3→4: 60%
    4: 0.40,    # 4→5: 40%
    5: 0.20,    # 5→6: 20%
    6: 0.05,    # 6→7: 5%
    7: 0.01,    # 7→8: 1%
    8: 0.001,   # 8→9: 0.1%
    9: 0.0001,  # 9→10: 0.01%
}

# 升华神能消耗: 每次25神能
SUBLIMATION_DIVINE_ENERGY_COST = 25

# 最大升华等级
MAX_SUBLIMATION_LEVEL = 10

# 材料合成配置: 5个低级 → 1个高级
MATERIAL_SYNTHESIS_RATIO = 5
MATERIAL_SYNTHESIS_CHAIN = {
    ArmorQuality.STARDUST: ArmorQuality.ALLOY,    # 5星尘 → 1合金
    ArmorQuality.ALLOY: ArmorQuality.CRYSTAL,     # 5合金 → 1晶核
    ArmorQuality.CRYSTAL: ArmorQuality.QUANTUM,   # 5晶核 → 1量子
    ArmorQuality.QUANTUM: ArmorQuality.VOID,      # 5量子 → 1虚空
}

# 强化规则（来自 EquipmentStatCalculator.ts）：
# - 攻击：基础值 + 强化等级 * 1
# - 防御：基础值 + 强化等级 * 1
# - 生命：基础值 + 强化等级 * 2
# - 敏捷：基础值 + 强化等级 * 1
# - 攻速：基础值 + 强化等级 * 0.1
# - 闪避、命中：基础值 + 强化等级 * 5
# - 会心：基础值 + 强化等级 * 1
# - 会心伤害：基础值 + 强化等级 * 1
# - 穿透：基础值 + 强化等级 * 1
# - 穿透百分比：基础值 + 强化等级 * 1
# - 真实伤害：基础值 + 强化等级 * 1
# - 护心：基础值 + 强化等级 * 1
# - 幸运：基础值 + 强化等级 * 1

# 升华规则（在强化基础上叠加）：
# - 攻击、防御、生命：(强化后值) * (1.2 ^ 升华等级)
# - 攻速、闪避、命中等其他属性：不受升华影响

def calculate_equipment_stats(base_stats: Dict, enhance_level: int, sublimation_level: int) -> Dict:
    """计算装备最终属性（根据强化等级和升华等级）- 完全匹配游戏"""
    # 先计算强化后的基础值
    enhanced = {}
    
    # 攻击、防御、生命
    enhanced['attack'] = base_stats.get('attack', 0) + enhance_level * 1 if base_stats.get('attack', 0) > 0 else 0
    enhanced['defense'] = base_stats.get('defense', 0) + enhance_level * 1 if base_stats.get('defense', 0) > 0 else 0
    enhanced['hp'] = base_stats.get('hp', 0) + enhance_level * 2 if base_stats.get('hp', 0) > 0 else 0
    
    # 其他属性（不受升华影响，但受强化影响）
    enhanced['agility'] = base_stats.get('agility', 0) + enhance_level * 1 if base_stats.get('agility', 0) > 0 else base_stats.get('agility', 0)
    enhanced['speed'] = base_stats.get('speed', 0) + enhance_level * 0.1 if base_stats.get('speed', 0) > 0 else 0
    enhanced['dodge'] = base_stats.get('dodge', 0) + enhance_level * 5 if base_stats.get('dodge', 0) > 0 else 0
    enhanced['hit'] = base_stats.get('hit', 0) + enhance_level * 5 if base_stats.get('hit', 0) > 0 else 0
    enhanced['crit'] = base_stats.get('crit', 0) + enhance_level * 1 if base_stats.get('crit', 0) > 0 else base_stats.get('crit', 0)
    enhanced['critDamage'] = base_stats.get('critDamage', 0) + enhance_level * 1 if base_stats.get('critDamage', 0) > 0 else base_stats.get('critDamage', 0)
    enhanced['penetration'] = base_stats.get('penetration', 0) + enhance_level * 1 if base_stats.get('penetration', 0) > 0 else base_stats.get('penetration', 0)
    enhanced['penetrationPercent'] = base_stats.get('penetrationPercent', 0) + enhance_level * 1 if base_stats.get('penetrationPercent', 0) > 0 else base_stats.get('penetrationPercent', 0)
    enhanced['trueDamage'] = base_stats.get('trueDamage', 0) + enhance_level * 1 if base_stats.get('trueDamage', 0) > 0 else base_stats.get('trueDamage', 0)
    enhanced['guard'] = base_stats.get('guard', 0) + enhance_level * 1 if base_stats.get('guard', 0) > 0 else base_stats.get('guard', 0)
    enhanced['luck'] = base_stats.get('luck', 0) + enhance_level * 1 if base_stats.get('luck', 0) > 0 else base_stats.get('luck', 0)
    
    # 升华加成倍数：1.2 ^ 升华等级
    sublimation_multiplier = (1.2 ** sublimation_level)
    
    result = {}
    # 攻击、防御、生命受升华影响
    result['attack'] = int(enhanced['attack'] * sublimation_multiplier) if enhanced['attack'] > 0 else 0
    result['defense'] = int(enhanced['defense'] * sublimation_multiplier) if enhanced['defense'] > 0 else 0
    result['hp'] = int(enhanced['hp'] * sublimation_multiplier) if enhanced['hp'] > 0 else 0
    
    # 其他属性不受升华影响
    result['agility'] = enhanced['agility']
    result['speed'] = enhanced['speed']
    result['dodge'] = enhanced['dodge']
    result['hit'] = enhanced['hit']
    result['crit'] = enhanced['crit']
    result['critDamage'] = enhanced['critDamage']
    result['penetration'] = enhanced['penetration']
    result['penetrationPercent'] = enhanced['penetrationPercent']
    result['trueDamage'] = enhanced['trueDamage']
    result['guard'] = enhanced['guard']
    result['luck'] = enhanced['luck']
    
    return result

# ============ 敌人等级系统（来自 locations.ts）===========
ENEMY_TIERS = {
    'T1': {
        'name': '普通级',
        'hpMultiplier': 1.0,
        'attackMultiplier': 1.0,
        'defenseMultiplier': 1.0,
        'expMultiplier': 1.0,
    },
    'T1+': {
        'name': '普通+级',
        'hpMultiplier': 1.3,
        'attackMultiplier': 1.2,
        'defenseMultiplier': 1.2,
        'expMultiplier': 1.3,
    },
    'T2': {
        'name': '精英级',
        'hpMultiplier': 1.6,
        'attackMultiplier': 1.5,
        'defenseMultiplier': 1.5,
        'expMultiplier': 1.8,
    },
    'T2+': {
        'name': '精英+级',
        'hpMultiplier': 2.0,
        'attackMultiplier': 1.8,
        'defenseMultiplier': 1.8,
        'expMultiplier': 2.3,
    },
    'T3': {
        'name': '首领级',
        'hpMultiplier': 2.5,
        'attackMultiplier': 2.2,
        'defenseMultiplier': 2.2,
        'expMultiplier': 3.0,
    },
    'T3+': {
        'name': '首领+级',
        'hpMultiplier': 3.0,
        'attackMultiplier': 2.6,
        'defenseMultiplier': 2.6,
        'expMultiplier': 4.0,
    },
}

# 基础敌人属性（T1级别基准）
BASE_ENEMY_STATS = {
    'hp': 200,
    'attack': 20,
    'defense': 10,
    'hitRate': 100,
    'dodgeRate': 15,
    'attackSpeed': 1.0,
    'critRate': 0.05,
}

def calculate_enemy_stats(tier: str, level: int = 1) -> Dict:
    """计算敌人实际属性"""
    tier_data = ENEMY_TIERS[tier]
    level_multiplier = 1 + (level - 1) * 0.1  # 每级提升10%
    
    return {
        'hp': int(BASE_ENEMY_STATS['hp'] * tier_data['hpMultiplier'] * level_multiplier),
        'attack': int(BASE_ENEMY_STATS['attack'] * tier_data['attackMultiplier'] * level_multiplier),
        'defense': int(BASE_ENEMY_STATS['defense'] * tier_data['defenseMultiplier'] * level_multiplier),
        'hitRate': BASE_ENEMY_STATS['hitRate'],
        'dodgeRate': BASE_ENEMY_STATS['dodgeRate'],
        'attackSpeed': BASE_ENEMY_STATS['attackSpeed'],
        'critRate': BASE_ENEMY_STATS['critRate'],
        'expReward': int(50 * tier_data['expMultiplier'] * level_multiplier),
    }

# ============ 联邦科技星敌人配置（8个星球，来自 voidCreatures.ts）===========
# 星球1-8：阿尔法宜居星、贝塔工业星、赫利俄斯神域星、伽马研究星、
#          德尔塔军事星、伊塔农业星、艾普西隆贸易星、泽塔能源星
FEDERAL_TECH_STARS = {
    'planet_alpha': {  # 星球1：阿尔法宜居星 - Level 1
        'name': '阿尔法宜居星',
        'level': 1,
        'enemyTier': 'T1',
        'eliteTier': 'T1',
        'bossTier': 'T1',
        'enemies': ['虚空鼠', '虚空蠕虫', '虚空甲虫'],
        'eliteEnemies': ['虚空拾荒者'],
        'bossName': '虚空原兽',
        # BOSS数据 - 线性增长基准
        'bossStats': {
            'hp': 260,
            'attack': 20,
            'defense': 8,
            'speed': 15,
            'hitRate': 110,
            'dodgeRate': 20,
            'attackSpeed': 1.2,
            'critRate': 12,
            'critDamage': 80,
            'guardRate': 12,
            'penetration': 10,
        },
    },
    'planet_beta': {  # 星球2：贝塔工业星 - Level 2
        'name': '贝塔工业星',
        'level': 2,
        'enemyTier': 'T1',
        'eliteTier': 'T1',
        'bossTier': 'T1',
        'enemies': ['腐化工蜂', '流水线恐魔'],
        'eliteEnemies': ['工厂守卫'],
        'bossName': '组装核心兽',
        'bossStats': {
            'hp': 320,
            'attack': 25,
            'defense': 10,
            'speed': 16,
            'hitRate': 111,
            'dodgeRate': 21,
            'attackSpeed': 1.22,
            'critRate': 13,
            'critDamage': 85,
            'guardRate': 13,
            'penetration': 11,
        },
    },
    'planet_helios': {  # 星球3：赫利俄斯神域星 - Level 3
        'name': '赫利俄斯神域星',
        'level': 3,
        'enemyTier': 'T2',
        'eliteTier': 'T2',
        'bossTier': 'T2',
        'enemies': ['日蚀仆从', '暗焰蟒'],
        'eliteEnemies': ['太阳守卫'],
        'bossName': '太阳神赫利俄斯',
        'bossStats': {
            'hp': 380,
            'attack': 30,
            'defense': 12,
            'speed': 17,
            'hitRate': 112,
            'dodgeRate': 22,
            'attackSpeed': 1.24,
            'critRate': 14,
            'critDamage': 90,
            'guardRate': 14,
            'penetration': 12,
        },
    },
    'planet_gamma': {  # 星球4：伽马研究星 - Level 4
        'name': '伽马研究星',
        'level': 4,
        'enemyTier': 'T2',
        'eliteTier': 'T2',
        'bossTier': 'T2',
        'enemies': ['实验失控体', '虚空研究员'],
        'eliteEnemies': ['强化实验体'],
        'bossName': '虚空研究员长',
        'bossStats': {
            'hp': 440,
            'attack': 35,
            'defense': 14,
            'speed': 18,
            'hitRate': 113,
            'dodgeRate': 23,
            'attackSpeed': 1.26,
            'critRate': 15,
            'critDamage': 95,
            'guardRate': 15,
            'penetration': 13,
        },
    },
    'planet_delta': {  # 星球5：德尔塔军事星 - Level 5
        'name': '德尔塔军事星',
        'level': 5,
        'enemyTier': 'T2',
        'eliteTier': 'T2',
        'bossTier': 'T2',
        'enemies': ['虚空士兵', '战斗无人机'],
        'eliteEnemies': ['虚空特种兵'],
        'bossName': '虚空将军',
        'bossStats': {
            'hp': 500,
            'attack': 40,
            'defense': 16,
            'speed': 19,
            'hitRate': 114,
            'dodgeRate': 24,
            'attackSpeed': 1.28,
            'critRate': 16,
            'critDamage': 100,
            'guardRate': 16,
            'penetration': 14,
        },
    },
    'planet_eta': {  # 星球6：伊塔农业星 - Level 6
        'name': '伊塔农业星',
        'level': 6,
        'enemyTier': 'T3',
        'eliteTier': 'T3',
        'bossTier': 'T3',
        'enemies': ['变异作物', '害虫群'],
        'eliteEnemies': ['变异农夫'],
        'bossName': '农业憎恶',
        'bossStats': {
            'hp': 560,
            'attack': 45,
            'defense': 18,
            'speed': 20,
            'hitRate': 115,
            'dodgeRate': 25,
            'attackSpeed': 1.30,
            'critRate': 17,
            'critDamage': 105,
            'guardRate': 17,
            'penetration': 15,
        },
    },
    'planet_epsilon': {  # 星球7：艾普西隆贸易星 - Level 7
        'name': '艾普西隆贸易星',
        'level': 7,
        'enemyTier': 'T3',
        'eliteTier': 'T3',
        'bossTier': 'T3',
        'enemies': ['太空海盗', '走私者'],
        'eliteEnemies': ['海盗船长'],
        'bossName': '贸易之王',
        'bossStats': {
            'hp': 620,
            'attack': 50,
            'defense': 20,
            'speed': 21,
            'hitRate': 116,
            'dodgeRate': 26,
            'attackSpeed': 1.32,
            'critRate': 18,
            'critDamage': 110,
            'guardRate': 18,
            'penetration': 16,
        },
    },
    'planet_zeta': {  # 星球8：泽塔能源星 - Level 8
        'name': '泽塔能源星',
        'level': 8,
        'enemyTier': 'T3',
        'eliteTier': 'T3',
        'bossTier': 'T3',
        'enemies': ['能量水蛭', '等离子兽'],
        'eliteEnemies': ['能源核心守卫'],
        'bossName': '等离子龙',
        'bossStats': {
            'hp': 680,
            'attack': 55,
            'defense': 22,
            'speed': 22,
            'hitRate': 117,
            'dodgeRate': 27,
            'attackSpeed': 1.34,
            'critRate': 19,
            'critDamage': 115,
            'guardRate': 19,
            'penetration': 17,
        },
    },
}

# ============ 玩家基础属性 ============
PLAYER_BASE = {
    'hp': 100,
    'attack': 10,
    'defense': 5,
    'hit': 100,
    'dodge': 10,
    'speed': 1.0,
    'crit': 5,  # 会心
    'critDamage': 50,  # 暴击伤害加成%
    'guard': 5,  # 护心
}

# ============ 数据类 ============
@dataclass
class NanoArmor:
    """纳米战甲装备"""
    slot: str
    name: str
    quality: ArmorQuality
    enhance_level: int = 0
    sublimation_level: int = 0
    base_stats: Dict = field(default_factory=dict)
    
    def get_total_stats(self) -> Dict:
        """计算装备总属性"""
        return calculate_equipment_stats(self.base_stats, self.enhance_level, self.sublimation_level)
    
    def try_sublimate(self) -> Tuple[bool, str]:
        """
        尝试升华装备（带成功率）
        返回: (是否成功, 消息)
        """
        if self.sublimation_level >= MAX_SUBLIMATION_LEVEL:
            return False, "已达到最大升华等级"
        
        # 获取当前升华等级的成功率
        success_rate = SUBLIMATION_SUCCESS_RATES.get(self.sublimation_level, 0.0001)
        
        # 随机判定
        if random.random() <= success_rate:
            # 升华成功
            if self.quality in QUALITY_UPGRADE_CONFIG and QUALITY_UPGRADE_CONFIG[self.quality]['next']:
                self.quality = QUALITY_UPGRADE_CONFIG[self.quality]['next']
            self.sublimation_level += 1
            return True, f"升华成功！等级提升至{self.sublimation_level}"
        else:
            # 升华失败（不降级，只消耗资源）
            return False, f"升华失败（成功率{success_rate*100:.2f}%）"
    
    def try_enhance(self) -> Tuple[bool, bool, str]:
        """
        尝试强化装备（带成功率和失败降级）
        返回: (是否成功, 是否降级, 消息)
        """
        if self.enhance_level >= MAX_ENHANCE_LEVEL:
            return False, False, "已达到最大强化等级"
        
        # 获取当前强化等级的成功率
        success_rate = ENHANCE_SUCCESS_RATES.get(self.enhance_level, 0.05)
        
        # 随机判定
        if random.random() <= success_rate:
            # 强化成功
            self.enhance_level += 1
            return True, False, f"强化成功！等级提升至+{self.enhance_level}"
        else:
            # 强化失败
            if self.enhance_level >= 5:
                # +5以上失败会降级
                self.enhance_level -= 1
                return False, True, f"强化失败（成功率{success_rate*100:.0f}%），等级降至+{self.enhance_level}"
            else:
                # +5以下失败不降级
                return False, False, f"强化失败（成功率{success_rate*100:.0f}%），等级不变"
    
    def get_enhance_cost(self) -> int:
        """获取当前强化等级所需的强化石数量"""
        return ENHANCE_STONE_COST.get(self.enhance_level, 10)
    
    def get_sublimation_cost(self) -> int:
        """获取升华所需的神能数量"""
        return SUBLIMATION_DIVINE_ENERGY_COST
    
    # 保留旧方法以兼容
    def sublimate(self) -> bool:
        """升华装备（旧方法，100%成功）"""
        if self.quality in QUALITY_UPGRADE_CONFIG and QUALITY_UPGRADE_CONFIG[self.quality]['next']:
            self.quality = QUALITY_UPGRADE_CONFIG[self.quality]['next']
            self.sublimation_level += 1
            return True
        return False
    
    def enhance(self) -> bool:
        """强化装备（旧方法，100%成功）"""
        self.enhance_level += 1
        return True

@dataclass
class Player:
    """玩家角色"""
    level: int = 1
    exp: int = 0
    hp: int = 100
    max_hp: int = 100
    
    # 神能系统（用于升华）
    divine_energy: int = 100  # 当前神能
    max_divine_energy: int = 100  # 神能上限
    divine_energy_recover_per_minute: int = 1  # 每分钟回复1点
    
    # 战甲装备（6个槽位）
    armors: Dict[str, NanoArmor] = field(default_factory=dict)
    
    # 升级所需经验表 (每级需要经验 = 等级 * 100)
    def get_exp_to_level(self) -> int:
        """获取升级到下一级所需经验"""
        return self.level * 100
    
    def gain_exp(self, amount: int) -> bool:
        """
        获得经验值
        返回是否升级
        """
        self.exp += amount
        leveled_up = False
        
        # 检查是否可以升级
        while self.exp >= self.get_exp_to_level():
            exp_needed = self.get_exp_to_level()
            self.exp -= exp_needed
            self.level_up()
            leveled_up = True
        
        return leveled_up
    
    def level_up(self):
        """升级 - 提升基础属性"""
        self.level += 1
        # 每级提升基础属性
        # 攻击+2, 防御+1, 生命+10
        # 这些加成通过get_total_stats计算
    
    def get_base_stats_with_level(self) -> Dict:
        """计算包含等级加成的玩家基础属性"""
        level_bonus = self.level - 1  # 1级没有加成
        return {
            'hp': PLAYER_BASE['hp'] + level_bonus * 10,
            'attack': PLAYER_BASE['attack'] + level_bonus * 2,
            'defense': PLAYER_BASE['defense'] + level_bonus * 1,
            'hit': PLAYER_BASE['hit'],
            'dodge': PLAYER_BASE['dodge'],
            'speed': PLAYER_BASE['speed'],
            'crit': PLAYER_BASE['crit'],
            'critDamage': PLAYER_BASE['critDamage'],
            'guard': PLAYER_BASE['guard'],
        }
    
    def get_armor_stats(self) -> Dict:
        """计算战甲总属性"""
        total = {
            'attack': 0, 'defense': 0, 'hp': 0, 'speed': 0,
            'crit': 0, 'critDamage': 0, 'hit': 0, 'dodge': 0,
        }
        
        for armor in self.armors.values():
            stats = armor.get_total_stats()
            for stat, value in stats.items():
                if stat in total:
                    if stat == 'critRate':
                        total['crit'] += value * 100  # 转换为数值
                    elif stat == 'critDamage':
                        total['critDamage'] += value * 100  # 转换为数值
                    else:
                        total[stat] += value
        
        # 套装效果
        equipped_count = len(self.armors)
        if equipped_count >= 2:
            total['attack'] = int(total['attack'] * 1.10)  # 2件套：攻击+10%
        if equipped_count >= 4:
            total['attack'] = int(total['attack'] * 1.20)  # 4件套：攻击+20%
            total['crit'] += 5  # 4件套：暴击+5%
        if equipped_count >= 6:
            total['attack'] = int(total['attack'] * 1.35)  # 6件套：攻击+35%
            total['crit'] += 10  # 6件套：暴击+10%
        
        return total
    
    def get_total_stats(self) -> Dict:
        """计算玩家总属性（包含等级加成）"""
        armor_stats = self.get_armor_stats()
        base_stats = self.get_base_stats_with_level()
        
        return {
            'hp': base_stats['hp'] + armor_stats['hp'],
            'attack': base_stats['attack'] + armor_stats['attack'],
            'defense': base_stats['defense'] + armor_stats['defense'],
            'hit': base_stats['hit'] + armor_stats['hit'],
            'dodge': base_stats['dodge'] + armor_stats['dodge'],
            'speed': base_stats['speed'] + armor_stats['speed'],
            'crit': base_stats['crit'] + armor_stats['crit'],
            'critDamage': base_stats['critDamage'] + armor_stats['critDamage'],
            'guard': base_stats['guard'],
        }
    
    def equip_armor(self, armor: NanoArmor):
        """装备战甲"""
        self.armors[armor.slot] = armor
        stats = self.get_total_stats()
        self.max_hp = stats['hp']
        self.hp = min(self.hp, self.max_hp)

@dataclass
class BattleResult:
    """战斗结果"""
    victory: bool
    rounds: int
    player_hp_remaining: int

# ============ 战斗系统（来自 BattleSystem.ts）===========

def calculate_defense_reduction(defense: float, level: int = 1) -> float:
    """计算防御减免（暴雪式）"""
    return defense / (defense + level * 100 + 500)

def calculate_damage(attacker_stats: Dict, defender_stats: Dict, is_player: bool = True) -> Tuple[int, bool]:
    """
    计算伤害
    来自 BattleSystem.ts 的 calculateDamage 方法
    """
    attacker_attack = attacker_stats['attack']
    attacker_crit = attacker_stats['crit']
    attacker_crit_damage = attacker_stats['critDamage']
    
    defender_defense = defender_stats['defense']
    defender_guard = defender_stats['guard']
    defender_level = defender_stats.get('level', 1)
    
    # 判断是否暴击
    # 新公式：暴击概率 = (我方会心 - 敌人护心) / (敌人护心 * 1.5)
    crit_chance = 0
    if attacker_crit > defender_guard:
        crit_chance = (attacker_crit - defender_guard) / (defender_guard * 1.5) * 100
    crit_chance = max(0, min(100, crit_chance))
    
    is_crit = random.random() * 100 < crit_chance
    
    # 基础伤害
    damage = attacker_attack
    
    # 计算防御减免
    defense_reduction = calculate_defense_reduction(defender_defense, defender_level)
    
    # 最终伤害
    final_damage = damage * (1 - defense_reduction)
    
    # 暴击加成：1.5 + 暴击伤害/100
    if is_crit:
        final_damage *= (1.5 + attacker_crit_damage / 100)
    
    return max(1, int(final_damage)), is_crit

def simulate_battle(player: Player, enemy: Dict) -> BattleResult:
    """模拟一场战斗"""
    player_stats = player.get_total_stats()
    
    enemy_hp = enemy['hp']
    enemy_attack = enemy['attack']
    enemy_defense = enemy['defense']
    
    player_hp = player.hp
    rounds = 0
    max_rounds = 200
    
    player_speed = player_stats['speed']
    enemy_speed = enemy['attackSpeed']
    
    player_next_turn = 100 / player_speed
    enemy_next_turn = 100 / enemy_speed
    
    while rounds < max_rounds:
        rounds += 1
        
        if player_next_turn <= enemy_next_turn:
            # 玩家回合
            player_next_turn += 100 / player_speed
            
            damage, is_crit = calculate_damage(player_stats, {
                'attack': 0, 'defense': enemy_defense, 'guard': 5, 'level': enemy.get('level', 1)
            }, is_player=True)
            
            enemy_hp -= damage
            
            if enemy_hp <= 0:
                return BattleResult(True, rounds, player_hp)
        else:
            # 敌人回合
            enemy_next_turn += 100 / enemy_speed
            
            damage, _ = calculate_damage(
                {'attack': enemy_attack, 'crit': enemy.get('critRate', 5) * 100, 'critDamage': 50},
                {'defense': player_stats['defense'], 'guard': player_stats['guard'], 'level': player.level},
                is_player=False
            )
            
            player_hp -= damage
            
            if player_hp <= 0:
                return BattleResult(False, rounds, 0)
    
    return BattleResult(False, rounds, player_hp)

# ============ 星球探索体力与收获系统 ============

class ExplorationSystem:
    """星球探索系统 - 体力消耗与收获机制"""
    
    # 体力消耗配置
    STAMINA_COST = {
        'normal_hunt': 10,      # 普通狩猎
        'hard_hunt': 10,        # 困难狩猎
        'challenge_boss': 10,   # 挑战首领
        'collect_resource': 5,  # 采集资源
    }
    
    # 体力上限和回复
    MAX_STAMINA = 100
    STAMINA_RECOVER_PER_MINUTE = 1  # 每分钟回复1点体力
    STAMINA_RECOVER_PER_DAY = 50    # 每天自动回复50点体力
    
    # 休息消耗和回复
    REST_COST_ENERGY = 10     # 休息消耗10点能量
    REST_COST_COOLING = 10    # 休息消耗10点冷却
    REST_RECOVER_STAMINA = 30 # 休息回复30点体力
    
    # 10种战甲材料
    MATERIALS = [
        'mat_001',  # 星铁基础构件
        'mat_002',  # 星铜传导组件
        'mat_003',  # 钛钢外甲坯料
        'mat_004',  # 战甲能量晶核
        'mat_005',  # 稀土传感基质
        'mat_006',  # 虚空防护核心
        'mat_007',  # 推进模块燃料
        'mat_008',  # 纳米韧化纤维
        'mat_009',  # 陨铁缓冲衬垫
        'mat_010',  # 量子紧固组件
    ]
    
    MATERIAL_NAMES = {
        'mat_001': '星铁基础构件',
        'mat_002': '星铜传导组件',
        'mat_003': '钛钢外甲坯料',
        'mat_004': '战甲能量晶核',
        'mat_005': '稀土传感基质',
        'mat_006': '虚空防护核心',
        'mat_007': '推进模块燃料',
        'mat_008': '纳米韧化纤维',
        'mat_009': '陨铁缓冲衬垫',
        'mat_010': '量子紧固组件',
    }
    
    def __init__(self):
        self.stamina = self.MAX_STAMINA
        self.energy = 100  # 能量值
        self.cooling = 100  # 冷却值
        self.total_explorations = 0
        self.total_collections = 0
        self.total_rests = 0
        
    def get_quality_drop_rates(self, planet_level: int, enemy_type: str = 'normal') -> Dict[ArmorQuality, float]:
        """
        根据星球等级和敌人类型决定材料品质掉落概率
        与普通狩猎概率一致
        """
        # 基础概率
        base_rates = {
            ArmorQuality.STARDUST: 0.50,
            ArmorQuality.ALLOY: 0.30,
            ArmorQuality.CRYSTAL: 0.15,
            ArmorQuality.QUANTUM: 0.04,
            ArmorQuality.VOID: 0.01,
        }
        
        # 根据星球等级调整概率
        # 等级越高，高品质概率越高
        level_bonus = min(planet_level * 0.02, 0.20)  # 最多+20%
        
        return {
            ArmorQuality.STARDUST: max(0.10, base_rates[ArmorQuality.STARDUST] - level_bonus),
            ArmorQuality.ALLOY: base_rates[ArmorQuality.ALLOY],
            ArmorQuality.CRYSTAL: base_rates[ArmorQuality.CRYSTAL] + level_bonus * 0.5,
            ArmorQuality.QUANTUM: base_rates[ArmorQuality.QUANTUM] + level_bonus * 0.3,
            ArmorQuality.VOID: base_rates[ArmorQuality.VOID] + level_bonus * 0.1,
        }
    
    def roll_material_quality(self, planet_level: int) -> ArmorQuality:
        """随机决定材料品质"""
        rates = self.get_quality_drop_rates(planet_level)
        roll = random.random()
        cumulative = 0
        
        for quality, rate in rates.items():
            cumulative += rate
            if roll <= cumulative:
                return quality
        return ArmorQuality.STARDUST
    
    def can_explore(self, action: str) -> bool:
        """检查是否有足够体力执行行动"""
        return self.stamina >= self.STAMINA_COST.get(action, 10)
    
    def can_rest(self) -> bool:
        """检查是否可以休息（需要足够的能量和冷却）"""
        return self.energy >= self.REST_COST_ENERGY and self.cooling >= self.REST_COST_COOLING
    
    def consume_stamina(self, action: str) -> int:
        """消耗体力，返回实际消耗的体力值"""
        cost = self.STAMINA_COST.get(action, 10)
        actual_cost = min(cost, self.stamina)
        self.stamina -= actual_cost
        return actual_cost
    
    def recover_stamina(self, amount: int = None):
        """回复体力"""
        if amount is None:
            amount = self.STAMINA_RECOVER_PER_DAY
        self.stamina = min(self.MAX_STAMINA, self.stamina + amount)
    
    def rest(self) -> Tuple[bool, str]:
        """
        休息回复体力
        - 消耗10点能量和10点冷却
        - 回复30点体力
        """
        if not self.can_rest():
            return False, "能量或冷却不足，无法休息"
        
        self.energy -= self.REST_COST_ENERGY
        self.cooling -= self.REST_COST_COOLING
        self.stamina = min(self.MAX_STAMINA, self.stamina + self.REST_RECOVER_STAMINA)
        self.total_rests += 1
        
        return True, f"休息成功，体力回复{self.REST_RECOVER_STAMINA}点"
    
    def use_energy_crystal(self) -> Tuple[bool, str]:
        """使用能量晶体，回复50点能量"""
        self.energy = min(100, self.energy + 50)
        return True, f"使用能量晶体，能量回复50点"
    
    def use_cooling_liquid(self) -> Tuple[bool, str]:
        """使用冷却液，回复50点冷却"""
        self.cooling = min(100, self.cooling + 50)
        return True, f"使用冷却液，冷却回复50点"
    
    def collect_resource(self, planet_level: int) -> Tuple[str, ArmorQuality, int]:
        """
        采集资源
        - 消耗5体力
        - 必定有收获
        - 随机1种材料
        - 品质概率与普通狩猎一致
        """
        if not self.can_explore('collect_resource'):
            return None
        
        self.consume_stamina('collect_resource')
        self.total_collections += 1
        
        # 随机选择1种材料
        mat_id = random.choice(self.MATERIALS)
        
        # 随机数量 (1-3)
        count = random.randint(1, 3)
        
        # 根据星球等级决定品质
        quality = self.roll_material_quality(planet_level)
        
        return (mat_id, quality, count)
    
    def hunt(self, planet_level: int, hunt_type: str = 'normal') -> List[Tuple[str, ArmorQuality, int]]:
        """
        狩猎
        - 普通/困难/首领狩猎都消耗10体力
        - 返回掉落材料列表
        """
        if not self.can_explore(f'{hunt_type}_hunt'):
            return []
        
        self.consume_stamina(f'{hunt_type}_hunt')
        self.total_explorations += 1
        
        drops = []
        # 根据狩猎类型决定掉落数量
        if hunt_type == 'normal':
            drop_count = random.randint(1, 2)
        elif hunt_type == 'hard':
            drop_count = random.randint(2, 3)
        else:  # boss
            drop_count = random.randint(3, 5)
        
        for _ in range(drop_count):
            mat_id = random.choice(self.MATERIALS)
            quality = self.roll_material_quality(planet_level)
            count = random.randint(1, 2)
            drops.append((mat_id, quality, count))
        
        return drops


# ============ 商店系统 ============

class ShopSystem:
    """商店系统"""
    
    # 商店商品配置
    SHOP_ITEMS = [
        {
            'itemId': 'consumable_food',
            'name': '能量晶体',
            'description': '回复50点能量',
            'price': 1,
            'dailyLimit': 50,  # 每日限购50
        },
        {
            'itemId': 'consumable_water',
            'name': '冷却液',
            'description': '回复50点冷却',
            'price': 1,
            'dailyLimit': 50,  # 每日限购50
        },
    ]
    
    def __init__(self):
        self.items = {item['itemId']: {**item, 'stock': item['dailyLimit']} 
                      for item in self.SHOP_ITEMS}
        self.total_purchases = 0
        self.total_spent = 0
    
    def refresh_daily(self):
        """每日刷新商店库存"""
        for item_id, item in self.items.items():
            item['stock'] = item['dailyLimit']
    
    def buy(self, item_id: str, quantity: int = 1) -> Tuple[bool, str, int]:
        """
        购买商品
        返回: (是否成功, 消息, 实际花费)
        """
        if item_id not in self.items:
            return False, "商品不存在", 0
        
        item = self.items[item_id]
        if item['stock'] < quantity:
            return False, f"库存不足，剩余: {item['stock']}", 0
        
        cost = item['price'] * quantity
        
        item['stock'] -= quantity
        self.total_purchases += quantity
        self.total_spent += cost
        
        return True, f"购买成功: {item['name']} x{quantity}", cost
    
    def get_item_info(self, item_id: str) -> Dict:
        """获取商品信息"""
        return self.items.get(item_id)


# ============ 游戏流程模拟 ============

class GameSimulator:
    def __init__(self):
        self.player = Player()
        self.day = 1
        self.total_battles = 0
        self.total_wins = 0
        self.total_deaths = 0
        self.enhance_stones = 100
        self.gold = 0  # 信用点
        # 材料库存: {(材料ID, 品质): 数量}
        self.materials: Dict[Tuple[str, ArmorQuality], int] = {}
        self.total_materials_dropped = 0
        # 挂机收益统计
        self.total_afk_gold = 0
        self.total_afk_exp = 0
        self.total_afk_materials = 0
        self.total_afk_enhance_stones = 0
        
        # 已击败的BOSS星球（用于挂机收益加成）
        self.defeated_boss_stars: Set[str] = set()
        
        # 已解锁扫荡的星球（首次击败BOSS后解锁）
        self.unlocked_sweep_stars: Set[str] = set()
        
        # 今日已挑战BOSS的星球（每天只能挑战一次，失败不扣除次数）
        self.today_challenged_boss: Set[str] = set()
        
        # 新增系统
        self.exploration = ExplorationSystem()
        self.shop = ShopSystem()
        
    def create_starting_armors(self) -> List[NanoArmor]:
        """创建初始战甲（星尘级）"""
        armors = []
        for slot, data in NANO_ARMOR_BASE.items():
            armor = NanoArmor(
                slot=slot,
                name=data['name'],
                quality=ArmorQuality.STARDUST,
                base_stats={k: v for k, v in data.items() if k != 'name'}
            )
            armors.append(armor)
        return armors
    
    def auto_equip(self):
        """自动装备战甲"""
        for armor in self.create_starting_armors():
            self.player.equip_armor(armor)
    
    def enhance_all_armors(self, target_level: int, verbose: bool = False) -> Dict:
        """
        强化所有战甲到目标等级（带成功率和失败降级）
        返回统计信息
        """
        stats = {'success': 0, 'fail': 0, 'downgrade': 0, 'stones_used': 0}
        
        for armor in self.player.armors.values():
            while armor.enhance_level < target_level and self.enhance_stones > 0:
                cost = armor.get_enhance_cost()
                if self.enhance_stones < cost:
                    break
                
                # 消耗强化石
                self.enhance_stones -= cost
                stats['stones_used'] += cost
                
                # 尝试强化
                success, downgraded, msg = armor.try_enhance()
                
                if success:
                    stats['success'] += 1
                else:
                    stats['fail'] += 1
                    if downgraded:
                        stats['downgrade'] += 1
                
                # 如果失败且降级了，可能需要更多次尝试才能达到目标
                # 为了避免无限循环，设置最大尝试次数
                if stats['success'] + stats['fail'] > 1000:
                    break
        
        if verbose and (stats['success'] > 0 or stats['fail'] > 0):
            print(f"  [强化统计] 成功{stats['success']}次, 失败{stats['fail']}次, 降级{stats['downgrade']}次, 消耗{stats['stones_used']}石")
        
        return stats
    
    def sublimate_all_armors(self, verbose: bool = False) -> Dict:
        """
        升华所有战甲（带成功率，消耗神能）
        返回统计信息
        """
        stats = {'success': 0, 'fail': 0, 'energy_used': 0}
        
        for armor in self.player.armors.values():
            cost = armor.get_sublimation_cost()
            
            # 检查是否有足够的神能
            if self.player.divine_energy < cost:
                if verbose:
                    print(f"  [升华] 神能不足，需要{cost}点，当前{self.player.divine_energy}点")
                continue
            
            # 消耗神能
            self.player.divine_energy -= cost
            stats['energy_used'] += cost
            
            # 尝试升华
            success, msg = armor.try_sublimate()
            
            if success:
                stats['success'] += 1
                if verbose:
                    print(f"  [升华成功] {armor.name} -> 升华等级{armor.sublimation_level}")
            else:
                stats['fail'] += 1
        
        if verbose and (stats['success'] > 0 or stats['fail'] > 0):
            print(f"  [升华统计] 成功{stats['success']}件, 失败{stats['fail']}件, 消耗{stats['energy_used']}神能")
        
        return stats
    
    def sublimate_all_armors_guaranteed(self):
        """升华所有战甲（旧方法，100%成功，用于兼容）"""
        for armor in self.player.armors.values():
            armor.sublimate()
    
    def add_materials(self, drops: List[Tuple[str, ArmorQuality]]):
        """添加掉落的材料到库存"""
        for mat_id, quality in drops:
            key = (mat_id, quality)
            self.materials[key] = self.materials.get(key, 0) + 1
            self.total_materials_dropped += 1
    
    def synthesize_materials(self, from_quality: ArmorQuality, count: int = 1) -> Tuple[int, List[Tuple[str, ArmorQuality]]]:
        """
        合成材料：5个低级 → 1个高级
        返回: (实际合成次数, 合成结果列表)
        """
        if from_quality not in MATERIAL_SYNTHESIS_CHAIN:
            return 0, []  # 虚空级无法再合成
        
        to_quality = MATERIAL_SYNTHESIS_CHAIN[from_quality]
        results = []
        synthesized_count = 0
        
        for _ in range(count):
            # 查找可以合成的材料
            for mat_id in ['mat_001', 'mat_002', 'mat_003', 'mat_004', 'mat_005',
                          'mat_006', 'mat_007', 'mat_008', 'mat_009', 'mat_010']:
                key = (mat_id, from_quality)
                if self.materials.get(key, 0) >= MATERIAL_SYNTHESIS_RATIO:
                    # 消耗5个低级材料
                    self.materials[key] -= MATERIAL_SYNTHESIS_RATIO
                    if self.materials[key] == 0:
                        del self.materials[key]
                    
                    # 生成1个高级材料
                    new_key = (mat_id, to_quality)
                    self.materials[new_key] = self.materials.get(new_key, 0) + 1
                    results.append((mat_id, to_quality))
                    synthesized_count += 1
                    break
        
        return synthesized_count, results
    
    def auto_synthesize_all(self) -> Dict[str, int]:
        """
        自动合成所有可合成的材料
        返回合成统计
        """
        stats = {}
        
        for from_quality in [ArmorQuality.STARDUST, ArmorQuality.ALLOY, ArmorQuality.CRYSTAL, ArmorQuality.QUANTUM]:
            to_quality = MATERIAL_SYNTHESIS_CHAIN[from_quality]
            count = 0
            
            # 持续合成直到材料不足
            while True:
                synthesized, _ = self.synthesize_materials(from_quality, 1)
                if synthesized == 0:
                    break
                count += synthesized
            
            if count > 0:
                stats[f"{ARMOR_QUALITY_NAMES[from_quality]}→{ARMOR_QUALITY_NAMES[to_quality]}"] = count
        
        return stats
    
    def get_materials_summary(self) -> Dict[str, int]:
        """获取材料汇总（按品质分组）"""
        summary = {q: 0 for q in ARMOR_QUALITY_NAMES.values()}
        for (mat_id, quality), count in self.materials.items():
            summary[ARMOR_QUALITY_NAMES[quality]] += count
        return summary
    
    def print_materials(self):
        """打印材料库存"""
        print(f"\n{'='*60}")
        print("材料库存:")
        summary = self.get_materials_summary()
        for quality_name, count in summary.items():
            if count > 0:
                print(f"  {quality_name}: {count}个")
        print(f"  总计: {self.total_materials_dropped}个")
        print(f"{'='*60}")
    
    def get_player_power(self) -> int:
        """计算玩家战力"""
        stats = self.player.get_total_stats()
        # 简化战力计算
        power = (
            stats['hp'] * 0.5 +
            stats['attack'] * 10 +
            stats['defense'] * 8 +
            stats['crit'] * 5 +
            stats['speed'] * 50
        )
        return int(power)
    
    def print_status(self):
        """打印当前状态"""
        stats = self.player.get_total_stats()
        exp_needed = self.player.get_exp_to_level()
        print(f"\n{'='*60}")
        print(f"Day {self.day} | Lv.{self.player.level} | 战力: {self.get_player_power()} | 经验: {self.player.exp}/{exp_needed}")
        print(f"HP: {self.player.hp}/{stats['hp']}")
        print(f"攻击: {stats['attack']} | 防御: {stats['defense']} | 会心: {stats['crit']}")
        print(f"攻速: {stats['speed']:.1f} | 暴击伤害: {stats['critDamage']}%")
        print(f"强化石: {self.enhance_stones} | 神能: {self.player.divine_energy}/{self.player.max_divine_energy}")
        print(f"战甲:")
        for slot, armor in self.player.armors.items():
            print(f"  [{slot:8s}] {ARMOR_QUALITY_NAMES[armor.quality]} +{armor.enhance_level} (升华{armor.sublimation_level})")
        print(f"{'='*60}")
    
    def simulate_federal_stars(self) -> Dict:
        """模拟联邦科技星通关"""
        print("="*60)
        print("《星航荒宇》联邦科技星通关模拟")
        print("="*60)
        
        self.auto_equip()
        
        star_order = ['planet_alpha', 'planet_beta', 'planet_helios', 'planet_gamma', 'planet_delta', 'planet_eta', 'planet_epsilon', 'planet_zeta']
        current_star_idx = 0
        
        for day in range(1, 101):
            self.day = day
            
            # 每天重置BOSS挑战记录
            self.today_challenged_boss.clear()
            
            # 每天回复神能（每分钟1点，每天24小时=1440分钟）
            energy_recovered = 24 * 60 * self.player.divine_energy_recover_per_minute
            old_energy = self.player.divine_energy
            self.player.divine_energy = min(self.player.max_divine_energy, 
                                           self.player.divine_energy + energy_recovered)
            actual_recovered = self.player.divine_energy - old_energy
            
            # 自动合成材料
            synthesis_stats = self.auto_synthesize_all()
            if synthesis_stats and day % 10 == 1:
                synth_str = ', '.join([f"{k}:{v}次" for k, v in synthesis_stats.items()])
                print(f"  [自动合成] {synth_str}")
            
            current_star_id = star_order[current_star_idx]
            current_star = FEDERAL_TECH_STARS[current_star_id]
            
            # 每天挂机收益（24小时，每次最多8小时，领取后重新计时）
            # 1级机器人：60信用点/小时，6经验/小时，10材料/小时，2强化石/小时
            afk_hours = 24  # 每天最多挂机24小时（领取3次8小时）
            
            # 基础收益
            base_gold = 60 * afk_hours
            base_exp = 6 * afk_hours
            base_materials = 10 * afk_hours
            base_enhance_stones = 2 * afk_hours
            
            # 根据击败的BOSS数量增加20%全收益（每个星球不重复计算）
            boss_bonus = 1 + (len(self.defeated_boss_stars) * 0.20)
            
            afk_gold = int(base_gold * boss_bonus)
            afk_exp = int(base_exp * boss_bonus)
            afk_materials = int(base_materials * boss_bonus)
            afk_enhance_stones = int(base_enhance_stones * boss_bonus)
            
            self.gold += afk_gold
            # 挂机获得经验，使用gain_exp方法以触发升级
            leveled_up = self.player.gain_exp(afk_exp)
            if leveled_up and day % 10 == 1:
                print(f"  [升级] 挂机经验使等级提升至 Lv.{self.player.level}!")
            self.enhance_stones += afk_enhance_stones
            
            # 累计挂机收益
            self.total_afk_gold += afk_gold
            self.total_afk_exp += afk_exp
            self.total_afk_materials += afk_materials
            self.total_afk_enhance_stones += afk_enhance_stones
            
            # 挂机材料掉落（随机品质）
            for _ in range(afk_materials):
                mat_id = random.choice(['mat_001', 'mat_002', 'mat_003', 'mat_004', 'mat_005',
                                       'mat_006', 'mat_007', 'mat_008', 'mat_009', 'mat_010'])
                # 根据当前星球决定品质
                drops = roll_material_drop('normal', current_star_idx + 1)
                if drops:
                    self.add_materials(drops)
            
            if day % 10 == 1:
                bonus_str = f" (+{int((boss_bonus-1)*100)}%BOSS加成)" if boss_bonus > 1 else ""
                print(f"  [挂机收益] {afk_hours}小时{bonus_str}: {afk_gold}信用点, {afk_exp}经验, {afk_materials}材料, {afk_enhance_stones}强化石")
            
            if day % 10 == 1 or day <= 3:
                self.print_status()
            
            # 获取敌人数据
            enemy_tier = current_star['enemyTier']
            enemy_level = current_star['level']
            enemy_data = calculate_enemy_stats(enemy_tier, enemy_level)
            
            # 战力检查
            player_power = self.get_player_power()
            enemy_power = enemy_data['hp'] + enemy_data['attack'] * 10
            power_ratio = player_power / enemy_power
            
            # ===== 自动强化策略（更积极） =====
            # 根据当前星球进度设定最低强化等级要求
            min_enhance_requirements = {
                0: 3,   # 阿尔法宜居星: +3
                1: 5,   # 贝塔工业星: +5
                2: 7,   # 赫利俄斯神域星: +7
                3: 10,  # 伽马研究星: +10
                4: 12,  # 德尔塔军事星: +12
                5: 15,  # 伊塔农业星: +15
                6: 17,  # 艾普西隆贸易星: +17
                7: 20,  # 泽塔科技星: +20
            }
            
            # 获取当前最低强化要求
            min_target = min_enhance_requirements.get(current_star_idx, 5)
            
            # 如果战力不足或强化等级低于要求，进行强化
            current_min_level = min(armor.enhance_level for armor in self.player.armors.values())
            target_enhance = max(min_target, int((1.0 - min(power_ratio, 1.0)) * 5))
            
            if current_min_level < target_enhance or power_ratio < 1.2:
                old_levels = {slot: armor.enhance_level for slot, armor in self.player.armors.items()}
                enhance_stats = self.enhance_all_armors(target_enhance, verbose=False)
                
                # 检查是否有提升
                new_min_level = min(armor.enhance_level for armor in self.player.armors.values())
                if new_min_level > current_min_level and day % 10 == 1:
                    print(f"  [自动强化] 最低等级 +{current_min_level} -> +{new_min_level} (目标+{target_enhance}, 战力比: {power_ratio:.2f})")
                    if enhance_stats['fail'] > 0:
                        print(f"    强化统计: 成功{enhance_stats['success']}次, 失败{enhance_stats['fail']}次, 降级{enhance_stats['downgrade']}次")
            
            # ===== 自动升华策略（每天尝试，优先低品质装备） =====
            # 按品质排序，优先升华低品质装备
            armors_by_quality = sorted(
                self.player.armors.items(),
                key=lambda x: (x[1].quality.value, x[1].sublimation_level)
            )
            
            # 每天尝试升华，只要有神能就尝试
            sub_attempts = 0
            sub_success = 0
            for slot, armor in armors_by_quality:
                # 每个装备每天最多尝试升华2次
                for _ in range(2):
                    if self.player.divine_energy >= SUBLIMATION_DIVINE_ENERGY_COST:
                        old_quality = armor.quality
                        old_sub_level = armor.sublimation_level
                        
                        # 消耗神能并尝试升华
                        self.player.divine_energy -= SUBLIMATION_DIVINE_ENERGY_COST
                        success, msg = armor.try_sublimate()
                        sub_attempts += 1
                        
                        if success:
                            sub_success += 1
                            if day % 10 == 1:
                                print(f"  [升华成功] {armor.name}: {ARMOR_QUALITY_NAMES[old_quality]}(升华{old_sub_level}) -> {ARMOR_QUALITY_NAMES[armor.quality]}(升华{armor.sublimation_level})")
                        # 失败后不再尝试同一件装备
                        break
                    else:
                        break
            
            if sub_attempts > 0 and sub_success == 0 and day % 10 == 1:
                print(f"  [升华] 尝试{sub_attempts}次，均未成功（神能剩余{self.player.divine_energy}）")
            
            # 模拟战斗
            result = simulate_battle(self.player, enemy_data)
            self.total_battles += 1
            
            if result.victory:
                self.total_wins += 1
                
                # 获得经验值（普通敌人50经验）
                exp_gain = 50
                leveled_up = self.player.gain_exp(exp_gain)
                if leveled_up and day % 10 == 1:
                    print(f"  [升级] 等级提升至 Lv.{self.player.level}!")
                
                # 强化石掉落：普通敌人1颗
                self.enhance_stones += 1
                
                # 材料掉落（普通敌人）
                normal_drops = roll_material_drop('normal', current_star_idx + 1)
                self.add_materials(normal_drops)
                
                # 恢复生命值
                self.player.hp = min(self.player.max_hp, self.player.hp + int(self.player.max_hp * 0.3))
                
                if day % 10 == 1:
                    drop_summary = {}
                    for mat_id, quality in normal_drops:
                        q_name = ARMOR_QUALITY_NAMES[quality]
                        drop_summary[q_name] = drop_summary.get(q_name, 0) + 1
                    drop_str = ', '.join([f"{q}x{c}" for q, c in drop_summary.items()])
                    print(f"  [战斗胜利] 击败{current_star['enemies'][0]} | 强化石x1 | 材料: {drop_str}")
                
                # ===== BOSS挑战与扫荡系统 =====
                # 1. 检查是否已解锁扫荡（首次击败后解锁）
                if current_star_id in self.unlocked_sweep_stars:
                    # 已解锁扫荡，消耗10体力进行扫荡
                    if self.exploration.can_explore('challenge_boss'):  # 使用10体力
                        self.exploration.consume_stamina('challenge_boss')
                        # 扫荡收益 = 击败一次精英敌人
                        sweep_exp = 50  # 精英敌人经验
                        sweep_stones = 1  # 精英敌人强化石
                        # 扫荡材料掉落（精英级别）
                        sweep_drops = roll_material_drop('hard', current_star_idx + 1)
                        self.add_materials(sweep_drops)
                        
                        # 获得经验
                        leveled_up = self.player.gain_exp(sweep_exp)
                        if leveled_up and day % 10 == 1:
                            print(f"  [升级] 扫荡经验使等级提升至 Lv.{self.player.level}!")
                        self.enhance_stones += sweep_stones
                        
                        if day % 10 == 1:
                            sweep_drop_summary = {}
                            for mat_id, quality in sweep_drops:
                                q_name = ARMOR_QUALITY_NAMES[quality]
                                sweep_drop_summary[q_name] = sweep_drop_summary.get(q_name, 0) + 1
                            sweep_drop_str = ', '.join([f"{q}x{c}" for q, c in sweep_drop_summary.items()])
                            print(f"  [扫荡] 消耗10体力扫荡{current_star['name']} | 强化石x{sweep_stones} | 材料: {sweep_drop_str}")
                
                # 2. 检查今天是否可以挑战BOSS（每天只能挑战一次，失败不扣除次数）
                elif current_star_id not in self.today_challenged_boss:
                    # 今天还未挑战，可以进行挑战
                    if random.random() < 0.3:  # 30%概率决定挑战BOSS
                        self.today_challenged_boss.add(current_star_id)  # 记录今天已挑战
                        
                        boss_tier = current_star['bossTier']
                        boss_data = calculate_enemy_stats(boss_tier, enemy_level)
                        boss_result = simulate_battle(self.player, boss_data)
                        self.total_battles += 1
                        
                        if boss_result.victory:
                            self.total_wins += 1
                            # 获得经验值（BOSS给200经验）
                            boss_exp = 200
                            leveled_up = self.player.gain_exp(boss_exp)
                            if leveled_up:
                                print(f"  [升级] 等级提升至 Lv.{self.player.level}!")
                            # 强化石掉落：BOSS 5颗
                            self.enhance_stones += 5
                            # BOSS掉落材料
                            boss_drops = roll_material_drop('boss', current_star_idx + 1)
                            self.add_materials(boss_drops)
                            
                            boss_drop_summary = {}
                            for mat_id, quality in boss_drops:
                                q_name = ARMOR_QUALITY_NAMES[quality]
                                boss_drop_summary[q_name] = boss_drop_summary.get(q_name, 0) + 1
                            boss_drop_str = ', '.join([f"{q}x{c}" for q, c in boss_drop_summary.items()])
                            
                            print(f"  [BOSS胜利] 击败{current_star['name']}BOSS！ | 强化石x5 | 材料: {boss_drop_str}")
                            # 记录击败的BOSS星球，用于挂机收益加成
                            self.defeated_boss_stars.add(current_star_id)
                            # 解锁该星球的扫荡功能
                            self.unlocked_sweep_stars.add(current_star_id)
                            current_star_idx += 1
                            
                            if current_star_idx >= len(star_order):
                                print("\n" + "="*60)
                                print("🎉 恭喜通关联邦科技星！")
                                print("="*60)
                                break
                        else:
                            # BOSS失败不扣除挑战次数（已经记录在今天挑战列表中）
                            self.total_deaths += 1
                            self.player.hp = self.player.max_hp
                            if day % 10 == 1:
                                print(f"  [BOSS失败] 挑战{current_star['name']}BOSS失败，今天不能再挑战")
            else:
                self.total_deaths += 1
                self.player.hp = self.player.max_hp
                if day % 10 == 1:
                    print(f"  [战斗失败] 需要提升战甲")
        
        # 打印最终材料汇总
        self.print_materials()
        
        return {
            'days': self.day,
            'level': self.player.level,
            'total_battles': self.total_battles,
            'total_wins': self.total_wins,
            'total_deaths': self.total_deaths,
            'win_rate': self.total_wins / max(1, self.total_battles) * 100,
            'final_power': self.get_player_power(),
            'enhance_stones': self.enhance_stones,
            'materials': self.get_materials_summary(),
            'total_materials': self.total_materials_dropped,
            'armors': {slot: {'quality': ARMOR_QUALITY_NAMES[a.quality], 'enhance': a.enhance_level, 'sublimation': a.sublimation_level}
                      for slot, a in self.player.armors.items()},
            # 挂机收益统计
            'afk_gold': self.total_afk_gold,
            'afk_exp': self.total_afk_exp,
            'afk_materials': self.total_afk_materials,
            'afk_enhance_stones': self.total_afk_enhance_stones,
        }

def run_multiple_simulations(count: int = 5):
    """运行多轮模拟"""
    results = []
    
    print(f"\n开始运行{count}轮模拟...\n")
    
    for i in range(count):
        print(f"第 {i+1}/{count} 轮模拟...")
        sim = GameSimulator()
        result = sim.simulate_federal_stars()
        results.append(result)
        status = "通关" if result['days'] < 100 else "未通关"
        print(f"  [{status}] 用时{result['days']}天，战力{result['final_power']}")
    
    print("\n" + "="*60)
    print("模拟结果统计")
    print("="*60)
    
    completed = [r for r in results if r['days'] < 100]
    
    if completed:
        days_list = [r['days'] for r in completed]
        power_list = [r['final_power'] for r in completed]
        death_list = [r['total_deaths'] for r in completed]
        afk_gold_list = [r['afk_gold'] for r in completed]
        afk_exp_list = [r['afk_exp'] for r in completed]
        afk_materials_list = [r['afk_materials'] for r in completed]
        afk_stones_list = [r['afk_enhance_stones'] for r in completed]
        
        print(f"通关率: {len(completed)}/{count} ({len(completed)/count*100:.0f}%)")
        print(f"平均通关天数: {sum(days_list)/len(days_list):.1f} (范围: {min(days_list)}-{max(days_list)})")
        print(f"平均最终战力: {sum(power_list)/len(power_list):.0f}")
        print(f"平均死亡次数: {sum(death_list)/len(death_list):.1f}")
        print(f"\n挂机收益统计:")
        print(f"  平均信用点: {sum(afk_gold_list)/len(afk_gold_list):.0f}")
        print(f"  平均经验: {sum(afk_exp_list)/len(afk_exp_list):.0f}")
        print(f"  平均材料: {sum(afk_materials_list)/len(afk_materials_list):.0f}")
        print(f"  平均强化石: {sum(afk_stones_list)/len(afk_stones_list):.0f}")
    else:
        print("通关率: 0% - 数值可能需要调整")
    
    return results

def analyze_progression():
    """分析各阶段需要的战力"""
    print("\n" + "="*60)
    print("联邦科技星敌人战力需求分析")
    print("="*60)
    
    for star_id, star_data in FEDERAL_TECH_STARS.items():
        print(f"\n{star_data['name']} (Level {star_data['level']}):")
        
        for tier_type, tier in [('普通', star_data['enemyTier']), ('精英', star_data['eliteTier']), ('BOSS', star_data['bossTier'])]:
            enemy_data = calculate_enemy_stats(tier, star_data['level'])
            enemy_power = enemy_data['hp'] + enemy_data['attack'] * 10
            print(f"  {tier_type:6s}: HP={enemy_data['hp']:4d} 攻击={enemy_data['attack']:3d} "
                  f"防御={enemy_data['defense']:3d} 推荐战力={enemy_power:5d}")

def analyze_armor_progression():
    """分析战甲成长曲线"""
    print("\n" + "="*60)
    print("战甲成长曲线分析")
    print("="*60)
    
    # 基础战甲属性总和
    base_stats = {'attack': 0, 'defense': 0, 'speed': 0, 'critRate': 0, 'critDamage': 0}
    for slot, data in NANO_ARMOR_BASE.items():
        for stat, value in data.items():
            if stat != 'name':
                base_stats[stat] = base_stats.get(stat, 0) + value
    
    print(f"\n6件套基础属性:")
    print(f"  攻击: {base_stats.get('attack', 0)}")
    print(f"  防御: {base_stats.get('defense', 0)}")
    print(f"  速度: {base_stats.get('speed', 0)}")
    print(f"  会心: {base_stats.get('critRate', 0) * 100}%")
    print(f"  暴击伤害: {base_stats.get('critDamage', 0) * 100}%")
    
    print(f"\n1. 强化等级影响 (星尘级):")
    for enhance in [0, 5, 10, 15, 20]:
        total_stats = {'attack': 0, 'defense': 0, 'hp': 0, 'speed': 0, 'crit': 0}
        for slot, data in NANO_ARMOR_BASE.items():
            base = {k: v for k, v in data.items() if k != 'name'}
            stats = calculate_equipment_stats(base, enhance, 0)
            for stat, value in stats.items():
                if stat == 'critRate':
                    total_stats['crit'] += value * 100
                elif stat in total_stats:
                    total_stats[stat] += value
        
        # 应用套装效果
        attack_with_set = int(total_stats['attack'] * 1.65)  # 6件套攻击+65%
        crit_with_set = total_stats['crit'] + 15  # 6件套会心+15
        
        print(f"  +{enhance:2d}: 攻击={attack_with_set:3d} 防御={total_stats['defense']:3d} "
              f"速度={total_stats['speed']:4.1f} 会心={crit_with_set:5.1f}")
    
    print(f"\n2. 品质影响 (+10强化):")
    for quality in ArmorQuality:
        sublimation = quality.value - 1  # 星尘=0, 合金=1, ...
        total_stats = {'attack': 0, 'defense': 0, 'hp': 0, 'speed': 0, 'crit': 0}
        for slot, data in NANO_ARMOR_BASE.items():
            base = {k: v for k, v in data.items() if k != 'name'}
            stats = calculate_equipment_stats(base, 10, sublimation)
            for stat, value in stats.items():
                if stat == 'critRate':
                    total_stats['crit'] += value * 100
                elif stat in total_stats:
                    total_stats[stat] += value
        
        attack_with_set = int(total_stats['attack'] * 1.65)
        crit_with_set = total_stats['crit'] + 15
        
        print(f"  {ARMOR_QUALITY_NAMES[quality]:8s}: 攻击={attack_with_set:3d} 防御={total_stats['defense']:3d} "
              f"速度={total_stats['speed']:4.1f} 会心={crit_with_set:5.1f}")

def demo_exploration_and_shop():
    """演示星球探索体力消耗、收获机制和商店系统"""
    print("\n" + "="*60)
    print("星球探索体力消耗与收获机制演示")
    print("="*60)
    
    exploration = ExplorationSystem()
    shop = ShopSystem()
    
    print("\n【体力系统】")
    print(f"  体力上限: {exploration.MAX_STAMINA}")
    print(f"  每天自动回复: {exploration.STAMINA_RECOVER_PER_DAY}点体力")
    print(f"  每分钟回复: {exploration.STAMINA_RECOVER_PER_MINUTE}点体力")
    
    print("\n【行动体力消耗】")
    for action, cost in exploration.STAMINA_COST.items():
        action_name = {
            'normal_hunt': '普通狩猎',
            'hard_hunt': '困难狩猎',
            'challenge_boss': '挑战首领',
            'collect_resource': '采集资源',
        }.get(action, action)
        print(f"  {action_name}: {cost}体力")
    
    print("\n【商店商品】")
    for item_id, item in shop.items.items():
        print(f"  {item['name']} - {item['description']} - 价格: {item['price']}信用点 - 限购: {item['dailyLimit']}")
    
    print("\n【能量/冷却系统】")
    print(f"  能量: {exploration.energy}/100")
    print(f"  冷却: {exploration.cooling}/100")
    print(f"  休息消耗: {exploration.REST_COST_ENERGY}能量 + {exploration.REST_COST_COOLING}冷却")
    print(f"  休息回复: {exploration.REST_RECOVER_STAMINA}体力")
    
    print("\n【模拟探索 - 等级1星球】")
    planet_level = 1
    
    # 模拟普通狩猎
    print(f"\n  当前体力: {exploration.stamina} | 能量: {exploration.energy} | 冷却: {exploration.cooling}")
    if exploration.can_explore('normal_hunt'):
        drops = exploration.hunt(planet_level, 'normal')
        print(f"  普通狩猎 (-10体力) -> 体力: {exploration.stamina}")
        print(f"    掉落: {len(drops)}种材料")
        for mat_id, quality, count in drops:
            print(f"      - {exploration.MATERIAL_NAMES[mat_id]} ({ARMOR_QUALITY_NAMES[quality]}) x{count}")
    
    # 模拟采集资源
    print(f"\n  当前体力: {exploration.stamina} | 能量: {exploration.energy} | 冷却: {exploration.cooling}")
    for i in range(3):
        if exploration.can_explore('collect_resource'):
            result = exploration.collect_resource(planet_level)
            if result:
                mat_id, quality, count = result
                print(f"  采集资源 (-5体力) -> 体力: {exploration.stamina}")
                print(f"    获得: {exploration.MATERIAL_NAMES[mat_id]} ({ARMOR_QUALITY_NAMES[quality]}) x{count}")
    
    # 模拟困难狩猎
    print(f"\n  当前体力: {exploration.stamina} | 能量: {exploration.energy} | 冷却: {exploration.cooling}")
    if exploration.can_explore('hard_hunt'):
        drops = exploration.hunt(planet_level, 'hard')
        print(f"  困难狩猎 (-10体力) -> 体力: {exploration.stamina}")
        print(f"    掉落: {len(drops)}种材料")
        for mat_id, quality, count in drops:
            print(f"      - {exploration.MATERIAL_NAMES[mat_id]} ({ARMOR_QUALITY_NAMES[quality]}) x{count}")
    
    # 模拟挑战首领
    print(f"\n  当前体力: {exploration.stamina} | 能量: {exploration.energy} | 冷却: {exploration.cooling}")
    if exploration.can_explore('challenge_boss'):
        drops = exploration.hunt(planet_level, 'boss')
        print(f"  挑战首领 (-10体力) -> 体力: {exploration.stamina}")
        print(f"    掉落: {len(drops)}种材料")
        for mat_id, quality, count in drops:
            print(f"      - {exploration.MATERIAL_NAMES[mat_id]} ({ARMOR_QUALITY_NAMES[quality]}) x{count}")
    
    print(f"\n  剩余体力: {exploration.stamina} | 能量: {exploration.energy} | 冷却: {exploration.cooling}")
    
    # 模拟休息回复体力
    print("\n【休息回复体力演示】")
    print(f"  休息前: 体力={exploration.stamina}, 能量={exploration.energy}, 冷却={exploration.cooling}")
    success, msg = exploration.rest()
    print(f"  {msg}")
    print(f"  休息后: 体力={exploration.stamina}, 能量={exploration.energy}, 冷却={exploration.cooling}")
    
    # 模拟使用道具回复能量/冷却
    print("\n【道具回复演示】")
    exploration.energy = 30  # 假设能量消耗到30
    exploration.cooling = 30  # 假设冷却消耗到30
    print(f"  使用前: 能量={exploration.energy}, 冷却={exploration.cooling}")
    exploration.use_energy_crystal()
    exploration.use_cooling_liquid()
    print(f"  使用后: 能量={exploration.energy}, 冷却={exploration.cooling}")
    
    # 模拟商店购买
    print("\n【商店购买演示】")
    success, msg, cost = shop.buy('consumable_food', 10)
    print(f"  购买10个能量晶体: {msg}, 花费: {cost}信用点")
    success, msg, cost = shop.buy('consumable_water', 5)
    print(f"  购买5个冷却液: {msg}, 花费: {cost}信用点")
    
    item_info = shop.get_item_info('consumable_food')
    print(f"  能量晶体剩余库存: {item_info['stock']}/{item_info['dailyLimit']}")
    
    # 测试限购
    print("\n  测试每日限购(50):")
    success, msg, cost = shop.buy('consumable_food', 50)
    print(f"  尝试购买50个能量晶体: {msg}")
    item_info = shop.get_item_info('consumable_food')
    print(f"  能量晶体剩余库存: {item_info['stock']}/{item_info['dailyLimit']}")
    
    print("\n【不同星球等级掉落品质对比】")
    for level in [1, 3, 5, 8]:
        rates = exploration.get_quality_drop_rates(level)
        print(f"\n  等级{level}星球:")
        for quality, rate in rates.items():
            print(f"    {ARMOR_QUALITY_NAMES[quality]}: {rate*100:.1f}%")
    
    print(f"\n{'='*60}")

if __name__ == '__main__':
    # 星球探索、体力消耗和商店系统演示
    demo_exploration_and_shop()
    
    # 敌人分析
    analyze_progression()
    
    # 战甲成长分析
    analyze_armor_progression()
    
    # 多轮模拟
    print("\n")
    results = run_multiple_simulations(count=5)
