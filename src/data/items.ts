import type { Item } from './types';
import { ItemType, ItemRarity } from './types';

// ============================================
// 膨胀版物品数据 - 基于《列车求生·10个普通站台专属设定（膨胀改造版）》
// 已完全替换原有物品
// ============================================

export const ITEMS: Record<string, Item> = {
  // ============================================
  // 武器 - 各站台基础装备
  // ============================================
  'weapon_iron_dagger': {
    id: 'weapon_iron_dagger', name: '铁制匕首', type: ItemType.WEAPON, rarity: ItemRarity.COMMON,
    description: '锋利的铁制匕首，攻速较快。', attack: 6, speed: 1, critRate: 0.05, sublimationLevel: 0,
  },
  'weapon_iron_short_sword': {
    id: 'weapon_iron_short_sword', name: '铁制短刀', type: ItemType.WEAPON, rarity: ItemRarity.COMMON,
    description: '标准的铁制短刀。', attack: 8, speed: 0, sublimationLevel: 0,
  },
  'weapon_iron_short_gun': {
    id: 'weapon_iron_short_gun', name: '铁制短枪', type: ItemType.WEAPON, rarity: ItemRarity.UNCOMMON,
    description: '简易的铁制短枪，可远程攻击。', attack: 10, speed: -1, sublimationLevel: 0,
  },
  'weapon_wooden_stick': {
    id: 'weapon_wooden_stick', name: '木质长棍', type: ItemType.WEAPON, rarity: ItemRarity.COMMON,
    description: '结实的木质长棍，攻击范围大。', attack: 5, defense: 3, speed: 0, sublimationLevel: 0,
  },
  'weapon_stone_axe': {
    id: 'weapon_stone_axe', name: '石制战斧', type: ItemType.WEAPON, rarity: ItemRarity.UNCOMMON,
    description: '锋利的石制战斧，暴击伤害+20%。', attack: 12, speed: -1, critDamage: 0.20, sublimationLevel: 0,
  },
  'weapon_iron_wrench': {
    id: 'weapon_iron_wrench', name: '铁制扳手', type: ItemType.WEAPON, rarity: ItemRarity.COMMON,
    description: '结实的铁制扳手。', attack: 10, speed: -1, sublimationLevel: 0,
  },
  'weapon_iron_long_sword': {
    id: 'weapon_iron_long_sword', name: '铁制长剑', type: ItemType.WEAPON, rarity: ItemRarity.UNCOMMON,
    description: '标准的铁制长剑，暴击率+3%。', attack: 12, speed: 0, critRate: 0.03, sublimationLevel: 0,
  },
  'weapon_maintenance_dagger': {
    id: 'weapon_maintenance_dagger', name: '维修匕首', type: ItemType.WEAPON, rarity: ItemRarity.UNCOMMON,
    description: '锋利的维修匕首，攻速+0.3。', attack: 8, speed: 2, sublimationLevel: 0,
  },
  'weapon_iron_hunting_gun': {
    id: 'weapon_iron_hunting_gun', name: '铁制猎枪', type: ItemType.WEAPON, rarity: ItemRarity.RARE,
    description: '强力的铁制猎枪。', attack: 15, speed: -2, sublimationLevel: 0,
  },
  'weapon_stone_hammer': {
    id: 'weapon_stone_hammer', name: '石锤', type: ItemType.WEAPON, rarity: ItemRarity.UNCOMMON,
    description: '沉重的石锤，防御+4。', attack: 14, defense: 4, speed: -1, critDamage: 0.18, sublimationLevel: 0,
  },
  'weapon_iron_spear': {
    id: 'weapon_iron_spear', name: '铁制长矛', type: ItemType.WEAPON, rarity: ItemRarity.UNCOMMON,
    description: '锋利的铁制长矛，攻击距离远。', attack: 14, speed: -1, sublimationLevel: 0,
  },
  'weapon_sand_short_knife': {
    id: 'weapon_sand_short_knife', name: '沙质短刀', type: ItemType.WEAPON, rarity: ItemRarity.COMMON,
    description: '轻便的沙质短刀。', attack: 10, speed: 0, sublimationLevel: 0,
  },
  'weapon_bronze_dagger': {
    id: 'weapon_bronze_dagger', name: '青铜匕首', type: ItemType.WEAPON, rarity: ItemRarity.UNCOMMON,
    description: '锋利的青铜匕首，暴击率+5%。', attack: 9, speed: 1, critRate: 0.05, sublimationLevel: 0,
  },
  'weapon_hunting_gun': {
    id: 'weapon_hunting_gun', name: '猎枪', type: ItemType.WEAPON, rarity: ItemRarity.RARE,
    description: '精准的猎枪，远程攻击Boss时+8%伤害。', attack: 16, speed: -2, sublimationLevel: 0,
  },
  'weapon_stone_battle_axe': {
    id: 'weapon_stone_battle_axe', name: '石质战斧', type: ItemType.WEAPON, rarity: ItemRarity.UNCOMMON,
    description: '沉重的石质战斧，暴击伤害+15%。', attack: 15, speed: -2, critDamage: 0.15, sublimationLevel: 0,
  },
  'weapon_iron_knife': {
    id: 'weapon_iron_knife', name: '铁制匕首', type: ItemType.WEAPON, rarity: ItemRarity.COMMON,
    description: '锋利的铁制匕首，攻速+0.3。', attack: 10, speed: 2, critRate: 0.04, sublimationLevel: 0,
  },
  'weapon_stone_blade': {
    id: 'weapon_stone_blade', name: '石制长刀', type: ItemType.WEAPON, rarity: ItemRarity.UNCOMMON,
    description: '锋利的石制长刀。', attack: 16, speed: -1, sublimationLevel: 0,
  },
  'weapon_iron_battle_axe': {
    id: 'weapon_iron_battle_axe', name: '铁制战斧', type: ItemType.WEAPON, rarity: ItemRarity.RARE,
    description: '强力的铁制战斧，暴击伤害+20%。', attack: 20, speed: -2, critDamage: 0.20, sublimationLevel: 0,
  },
  'weapon_iron_short_club': {
    id: 'weapon_iron_short_club', name: '铁制短棍', type: ItemType.WEAPON, rarity: ItemRarity.COMMON,
    description: '结实的铁制短棍，防御+5。', attack: 10, defense: 5, speed: 0, sublimationLevel: 0,
  },
  'weapon_fishing_gun': {
    id: 'weapon_fishing_gun', name: '渔枪', type: ItemType.WEAPON, rarity: ItemRarity.UNCOMMON,
    description: '可在水中和陆地攻击的渔枪。', attack: 13, speed: -1, sublimationLevel: 0,
  },
  'weapon_metal_axe': {
    id: 'weapon_metal_axe', name: '金属战斧', type: ItemType.WEAPON, rarity: ItemRarity.RARE,
    description: '强力的金属战斧，暴击伤害+22%。', attack: 24, speed: -2, critDamage: 0.22, sublimationLevel: 0,
  },
  'weapon_border_sword': {
    id: 'weapon_border_sword', name: '边境长剑', type: ItemType.WEAPON, rarity: ItemRarity.RARE,
    description: '边境哨兵使用的长剑，暴击率+6%。', attack: 24, speed: -1, critRate: 0.06, sublimationLevel: 0,
  },
  'weapon_sentry_rifle': {
    id: 'weapon_sentry_rifle', name: '哨兵步枪', type: ItemType.WEAPON, rarity: ItemRarity.EPIC,
    description: '边境哨站使用的步枪，远程攻击+15%伤害。', attack: 28, speed: -3, sublimationLevel: 0,
  },

  // ============================================
  // 防具 - 头部
  // ============================================
  'armor_cloth_cap': {
    id: 'armor_cloth_cap', name: '布制防尘帽', type: ItemType.ARMOR, rarity: ItemRarity.COMMON,
    description: '轻便的布制防尘帽。', defense: 3, maxHp: 10, sublimationLevel: 0,
  },
  'armor_plastic_helmet': {
    id: 'armor_plastic_helmet', name: '塑料防护帽', type: ItemType.ARMOR, rarity: ItemRarity.COMMON,
    description: '坚固的塑料防护帽。', defense: 5, maxHp: 15, sublimationLevel: 0,
  },
  'armor_leather_wind_cap': {
    id: 'armor_leather_wind_cap', name: '皮质防风帽', type: ItemType.ARMOR, rarity: ItemRarity.UNCOMMON,
    description: '保暖的皮质防风帽。', defense: 5, maxHp: 20, sublimationLevel: 0,
  },
  'armor_cloth_cap_2': {
    id: 'armor_cloth_cap_2', name: '布制护帽', type: ItemType.ARMOR, rarity: ItemRarity.COMMON,
    description: '轻便的布制护帽。', defense: 4, maxHp: 15, sublimationLevel: 0,
  },
  'armor_rock_helmet': {
    id: 'armor_rock_helmet', name: '岩石防护帽', type: ItemType.ARMOR, rarity: ItemRarity.UNCOMMON,
    description: '由岩石碎片制成的防护帽。', defense: 6, maxHp: 25, sublimationLevel: 0,
  },
  'armor_waterproof_cap': {
    id: 'armor_waterproof_cap', name: '布制防水帽', type: ItemType.ARMOR, rarity: ItemRarity.COMMON,
    description: '防水的布制帽子。', defense: 4, maxHp: 15, sublimationLevel: 0,
  },
  'armor_leather_traveler_cap': {
    id: 'armor_leather_traveler_cap', name: '皮质旅人帽', type: ItemType.ARMOR, rarity: ItemRarity.UNCOMMON,
    description: '旅人使用的皮质帽子。', defense: 6, maxHp: 20, sublimationLevel: 0,
  },
  'armor_metal_helmet': {
    id: 'armor_metal_helmet', name: '金属防护帽', type: ItemType.ARMOR, rarity: ItemRarity.RARE,
    description: '坚固的金属防护帽。', defense: 8, maxHp: 30, sublimationLevel: 0,
  },
  'armor_leather_warm_cap': {
    id: 'armor_leather_warm_cap', name: '皮质保暖帽', type: ItemType.ARMOR, rarity: ItemRarity.RARE,
    description: '保暖的皮质帽子。', defense: 7, maxHp: 25, sublimationLevel: 0,
  },
  'armor_border_cap': {
    id: 'armor_border_cap', name: '边境哨兵帽', type: ItemType.ARMOR, rarity: ItemRarity.RARE,
    description: '边境哨兵使用的帽子，全属性抗性+5%。', defense: 8, maxHp: 30, sublimationLevel: 0,
  },

  // ============================================
  // 防具 - 衣服
  // ============================================
  'armor_canvas_work_clothes': {
    id: 'armor_canvas_work_clothes', name: '粗布工装', type: ItemType.ARMOR, rarity: ItemRarity.COMMON,
    description: '耐磨的粗布工装。', defense: 4, maxHp: 15, sublimationLevel: 0,
  },
  'armor_canvas_maintenance_suit': {
    id: 'armor_canvas_maintenance_suit', name: '帆布维修服', type: ItemType.ARMOR, rarity: ItemRarity.COMMON,
    description: '耐磨的帆布维修服。', defense: 4, maxHp: 20, sublimationLevel: 0,
  },
  'armor_canvas_wind_suit': {
    id: 'armor_canvas_wind_suit', name: '厚帆布防风服', type: ItemType.ARMOR, rarity: ItemRarity.UNCOMMON,
    description: '保暖的厚帆布防风服。', defense: 6, maxHp: 25, sublimationLevel: 0,
  },
  'armor_cloth_grain_suit': {
    id: 'armor_cloth_grain_suit', name: '粗布粮服', type: ItemType.ARMOR, rarity: ItemRarity.COMMON,
    description: '耐磨的粗布粮服。', defense: 5, maxHp: 20, sublimationLevel: 0,
  },
  'armor_leather_cliff_suit': {
    id: 'armor_leather_cliff_suit', name: '皮质峭壁服', type: ItemType.ARMOR, rarity: ItemRarity.UNCOMMON,
    description: '耐磨的皮质峭壁服。', defense: 7, maxHp: 30, sublimationLevel: 0,
  },
  'armor_waterproof_cloth': {
    id: 'armor_waterproof_cloth', name: '防水粗布衣', type: ItemType.ARMOR, rarity: ItemRarity.COMMON,
    description: '防水的粗布衣服。', defense: 5, maxHp: 20, sublimationLevel: 0,
  },
  'armor_leather_traveler_suit': {
    id: 'armor_leather_traveler_suit', name: '皮质旅人服', type: ItemType.ARMOR, rarity: ItemRarity.UNCOMMON,
    description: '旅人使用的皮质衣服，攻击力+3。', defense: 7, maxHp: 25, attack: 3, sublimationLevel: 0,
  },
  'armor_metal_fiber_suit': {
    id: 'armor_metal_fiber_suit', name: '金属纤维工装', type: ItemType.ARMOR, rarity: ItemRarity.RARE,
    description: '坚固的金属纤维工装，防御+3。', defense: 9, maxHp: 35, sublimationLevel: 0,
  },
  'armor_leather_warm_suit': {
    id: 'armor_leather_warm_suit', name: '厚皮质保暖服', type: ItemType.ARMOR, rarity: ItemRarity.RARE,
    description: '保暖的厚皮质衣服，防御+3。', defense: 9, maxHp: 35, sublimationLevel: 0,
  },
  'armor_border_patrol_suit': {
    id: 'armor_border_patrol_suit', name: '边境巡逻服', type: ItemType.ARMOR, rarity: ItemRarity.RARE,
    description: '边境巡逻服，攻击力+4，防御+3。', defense: 10, maxHp: 40, attack: 4, sublimationLevel: 0,
  },

  // ============================================
  // 防具 - 裤子
  // ============================================
  'armor_canvas_pants': {
    id: 'armor_canvas_pants', name: '帆布护裤', type: ItemType.ARMOR, rarity: ItemRarity.COMMON,
    description: '结实的帆布护裤，提升移动速度。', defense: 3, maxHp: 10, agility: 5, sublimationLevel: 0,
  },
  'armor_leather_pants': {
    id: 'armor_leather_pants', name: '皮质护裤', type: ItemType.ARMOR, rarity: ItemRarity.UNCOMMON,
    description: '耐磨的皮质护裤。', defense: 5, maxHp: 15, sublimationLevel: 0,
  },
  'armor_sand_pants': {
    id: 'armor_sand_pants', name: '沙布护裤', type: ItemType.ARMOR, rarity: ItemRarity.COMMON,
    description: '轻便的沙布护裤，移动速度+8。', defense: 4, maxHp: 15, agility: 8, sublimationLevel: 0,
  },
  'armor_canvas_grain_pants': {
    id: 'armor_canvas_grain_pants', name: '帆布粮裤', type: ItemType.ARMOR, rarity: ItemRarity.COMMON,
    description: '轻便的帆布粮裤，移动速度+10。', defense: 4, maxHp: 15, agility: 10, sublimationLevel: 0,
  },
  'armor_rock_pants': {
    id: 'armor_rock_pants', name: '岩石护裤', type: ItemType.ARMOR, rarity: ItemRarity.UNCOMMON,
    description: '坚硬的岩石护裤。', defense: 6, maxHp: 20, sublimationLevel: 0,
  },
  'armor_waterproof_pants': {
    id: 'armor_waterproof_pants', name: '防水帆布裤', type: ItemType.ARMOR, rarity: ItemRarity.COMMON,
    description: '防水的帆布裤子，移动速度+8。', defense: 4, maxHp: 15, agility: 8, sublimationLevel: 0,
  },
  'armor_canvas_traveler_pants': {
    id: 'armor_canvas_traveler_pants', name: '帆布旅人裤', type: ItemType.ARMOR, rarity: ItemRarity.UNCOMMON,
    description: '旅人使用的帆布裤子，移动速度+12。', defense: 5, maxHp: 15, agility: 12, sublimationLevel: 0,
  },
  'armor_metal_pants': {
    id: 'armor_metal_pants', name: '金属护裤', type: ItemType.ARMOR, rarity: ItemRarity.RARE,
    description: '坚固的金属护裤。', defense: 7, maxHp: 25, sublimationLevel: 0,
  },
  'armor_canvas_warm_pants': {
    id: 'armor_canvas_warm_pants', name: '厚帆布保暖裤', type: ItemType.ARMOR, rarity: ItemRarity.UNCOMMON,
    description: '保暖的厚帆布裤子，移动速度+8。', defense: 6, maxHp: 20, agility: 8, sublimationLevel: 0,
  },
  'armor_border_leggings': {
    id: 'armor_border_leggings', name: '边境护腿', type: ItemType.ARMOR, rarity: ItemRarity.RARE,
    description: '边境护腿，移动速度+10。', defense: 7, maxHp: 25, agility: 10, sublimationLevel: 0,
  },

  // ============================================
  // 防具 - 靴子
  // ============================================
  'armor_rubber_boots': {
    id: 'armor_rubber_boots', name: '橡胶防滑靴', type: ItemType.ARMOR, rarity: ItemRarity.COMMON,
    description: '防滑的橡胶靴，闪避率+3%。', defense: 3, maxHp: 10, dodgeRate: 0.03, sublimationLevel: 0,
  },
  'armor_oil_slip_boots': {
    id: 'armor_oil_slip_boots', name: '机油防滑靴', type: ItemType.ARMOR, rarity: ItemRarity.UNCOMMON,
    description: '防滑的机油靴，闪避率+4%。', defense: 4, maxHp: 10, dodgeRate: 0.04, sublimationLevel: 0,
  },
  'armor_sand_slip_boots': {
    id: 'armor_sand_slip_boots', name: '沙质防滑靴', type: ItemType.ARMOR, rarity: ItemRarity.COMMON,
    description: '可在沙尘中稳定移动的靴子。', defense: 4, maxHp: 15, sublimationLevel: 0,
  },
  'armor_cloth_slip_boots': {
    id: 'armor_cloth_slip_boots', name: '布制防滑靴', type: ItemType.ARMOR, rarity: ItemRarity.COMMON,
    description: '轻便的布制防滑靴。', defense: 3, maxHp: 10, sublimationLevel: 0,
  },
  'armor_rock_slip_boots': {
    id: 'armor_rock_slip_boots', name: '岩石防滑靴', type: ItemType.ARMOR, rarity: ItemRarity.UNCOMMON,
    description: '可在岩石表面稳定移动的靴子，闪避率+5%。', defense: 5, maxHp: 15, dodgeRate: 0.05, sublimationLevel: 0,
  },
  'armor_rubber_waterproof_boots': {
    id: 'armor_rubber_waterproof_boots', name: '橡胶防水靴', type: ItemType.ARMOR, rarity: ItemRarity.UNCOMMON,
    description: '完全防水的橡胶靴。', defense: 6, maxHp: 20, sublimationLevel: 0,
  },
  'armor_leather_slip_boots': {
    id: 'armor_leather_slip_boots', name: '皮质防滑靴', type: ItemType.ARMOR, rarity: ItemRarity.UNCOMMON,
    description: '奔跑速度+12的皮质靴子。', defense: 5, maxHp: 15, agility: 12, sublimationLevel: 0,
  },
  'armor_metal_slip_boots': {
    id: 'armor_metal_slip_boots', name: '金属防滑靴', type: ItemType.ARMOR, rarity: ItemRarity.RARE,
    description: '坚固的金属防滑靴。', defense: 6, maxHp: 20, sublimationLevel: 0,
  },
  'armor_leather_warm_boots': {
    id: 'armor_leather_warm_boots', name: '皮质防寒靴', type: ItemType.ARMOR, rarity: ItemRarity.RARE,
    description: '保暖的皮质防寒靴。', defense: 7, maxHp: 25, sublimationLevel: 0,
  },
  'armor_border_boots': {
    id: 'armor_border_boots', name: '边境战靴', type: ItemType.ARMOR, rarity: ItemRarity.RARE,
    description: '边境战靴，闪避率+5%。', defense: 7, maxHp: 25, dodgeRate: 0.05, sublimationLevel: 0,
  },

  // ============================================
  // 饰品
  // ============================================
  'accessory_iron_slag_pouch': {
    id: 'accessory_iron_slag_pouch', name: '铁屑收纳袋', type: ItemType.ACCESSORY, rarity: ItemRarity.COMMON,
    description: '可存放材料的收纳袋，提升8%材料获取率。', agility: 2, sublimationLevel: 0,
  },
  'accessory_tool_hook': {
    id: 'accessory_tool_hook', name: '工具挂扣', type: ItemType.ACCESSORY, rarity: ItemRarity.UNCOMMON,
    description: '可悬挂小型工具，维修效率+12%。', agility: 3, sublimationLevel: 0,
  },
  'accessory_wind_goggles': {
    id: 'accessory_wind_goggles', name: '防风眼镜', type: ItemType.ACCESSORY, rarity: ItemRarity.UNCOMMON,
    description: '提升风沙天气下的视野清晰度，闪避率+5%。', agility: 3, dodgeRate: 0.05, sublimationLevel: 0,
  },
  'accessory_sack_bag': {
    id: 'accessory_sack_bag', name: '粮袋收纳包', type: ItemType.ACCESSORY, rarity: ItemRarity.COMMON,
    description: '可存放粮食，提升12%粮食获取率。', agility: 2, sublimationLevel: 0,
  },
  'accessory_rock_pendant': {
    id: 'accessory_rock_pendant', name: '岩石挂坠', type: ItemType.ACCESSORY, rarity: ItemRarity.UNCOMMON,
    description: '可感应碎石掉落，岩石碎片获取率+8%。', agility: 3, sublimationLevel: 0,
  },
  'accessory_bucket_hook': {
    id: 'accessory_bucket_hook', name: '水桶挂扣', type: ItemType.ACCESSORY, rarity: ItemRarity.COMMON,
    description: '可悬挂水桶，打水效率+12%。', agility: 2, sublimationLevel: 0,
  },
  'accessory_traveler_pendant': {
    id: 'accessory_traveler_pendant', name: '旅人挂坠', type: ItemType.ACCESSORY, rarity: ItemRarity.UNCOMMON,
    description: '可感应狼群靠近，杂物获取率+8%。', agility: 3, sublimationLevel: 0,
  },
  'accessory_metal_box': {
    id: 'accessory_metal_box', name: '金属收纳盒', type: ItemType.ACCESSORY, rarity: ItemRarity.RARE,
    description: '可存放金属材料，金属材料获取率+12%。', agility: 4, sublimationLevel: 0,
  },
  'accessory_warm_scarf': {
    id: 'accessory_warm_scarf', name: '保暖围巾', type: ItemType.ACCESSORY, rarity: ItemRarity.RARE,
    description: '减少低温消耗，每5秒恢复2HP。', maxHp: 10, sublimationLevel: 0,
  },
  'accessory_border_badge': {
    id: 'accessory_border_badge', name: '边境徽章', type: ItemType.ACCESSORY, rarity: ItemRarity.RARE,
    description: '边境区域全属性+3%，材料获取率+10%。', agility: 4, sublimationLevel: 0,
  },

  // ============================================
  // 消耗品
  // ============================================
  'consumable_dust_proof_potion': {
    id: 'consumable_dust_proof_potion', name: '防尘药剂', type: ItemType.CONSUMABLE, rarity: ItemRarity.COMMON,
    description: '解除风沙debuff，恢复15HP，闪避率+5%，持续10秒。', healHp: 15, sublimationLevel: 0,
  },
  'consumable_simple_bandage': {
    id: 'consumable_simple_bandage', name: '简易绷带', type: ItemType.CONSUMABLE, rarity: ItemRarity.COMMON,
    description: '恢复20HP，解除流血debuff。', healHp: 20, sublimationLevel: 0,
  },
  'consumable_coarse_biscuit': {
    id: 'consumable_coarse_biscuit', name: '粗粮饼干', type: ItemType.CONSUMABLE, rarity: ItemRarity.COMMON,
    description: '恢复15HP，基础续航道具。', healHp: 15, healHunger: 10, sublimationLevel: 0,
  },
  'consumable_rust_antidote': {
    id: 'consumable_rust_antidote', name: '锈蚀解毒剂', type: ItemType.CONSUMABLE, rarity: ItemRarity.UNCOMMON,
    description: '解除锈蚀debuff，恢复10HP，持续15秒免疫锈蚀。', healHp: 10, sublimationLevel: 0,
  },
  'consumable_oil_cleaner': {
    id: 'consumable_oil_cleaner', name: '油污清除剂', type: ItemType.CONSUMABLE, rarity: ItemRarity.UNCOMMON,
    description: '清除油污debuff，恢复20HP，持续15秒免疫油污。', healHp: 20, sublimationLevel: 0,
  },
  'consumable_maintenance_supply': {
    id: 'consumable_maintenance_supply', name: '维修补给剂', type: ItemType.CONSUMABLE, rarity: ItemRarity.UNCOMMON,
    description: '恢复25HP，提升25%装备维修成功率，持续10秒。', healHp: 25, sublimationLevel: 0,
  },
  'consumable_energy_bar': {
    id: 'consumable_energy_bar', name: '简易能量棒', type: ItemType.CONSUMABLE, rarity: ItemRarity.COMMON,
    description: '恢复20HP和10点体力。', healHp: 20, healStamina: 10, sublimationLevel: 0,
  },
  'consumable_stun_relief': {
    id: 'consumable_stun_relief', name: '眩晕解除剂', type: ItemType.CONSUMABLE, rarity: ItemRarity.COMMON,
    description: '解除眩晕debuff，恢复8HP，持续8秒免疫轻微眩晕。', healHp: 8, sublimationLevel: 0,
  },
  'consumable_wind_proof_potion': {
    id: 'consumable_wind_proof_potion', name: '防风药剂', type: ItemType.CONSUMABLE, rarity: ItemRarity.UNCOMMON,
    description: '抵御风沙debuff，恢复25HP，防御+10，持续10秒。', healHp: 25, sublimationLevel: 0,
  },
  'consumable_venom_antidote': {
    id: 'consumable_venom_antidote', name: '蝎毒解毒剂', type: ItemType.CONSUMABLE, rarity: ItemRarity.UNCOMMON,
    description: '解除中毒和减速debuff，恢复20HP，持续10秒免疫蝎毒。', healHp: 20, sublimationLevel: 0,
  },
  'consumable_wind_supply_cake': {
    id: 'consumable_wind_supply_cake', name: '风沙补给饼', type: ItemType.CONSUMABLE, rarity: ItemRarity.COMMON,
    description: '恢复20HP，防风沙抗性+15%，持续12秒。', healHp: 20, sublimationLevel: 0,
  },
  'consumable_mold_proof_potion': {
    id: 'consumable_mold_proof_potion', name: '防霉药剂', type: ItemType.CONSUMABLE, rarity: ItemRarity.UNCOMMON,
    description: '解除发霉debuff，恢复15HP，持续12秒免疫发霉。', healHp: 15, sublimationLevel: 0,
  },
  'consumable_fresh_grain': {
    id: 'consumable_fresh_grain', name: '新鲜粮食', type: ItemType.CONSUMABLE, rarity: ItemRarity.UNCOMMON,
    description: '恢复30HP，优质续航道具。', healHp: 30, healHunger: 20, sublimationLevel: 0,
  },
  'consumable_healing_potion': {
    id: 'consumable_healing_potion', name: '简易疗伤药', type: ItemType.CONSUMABLE, rarity: ItemRarity.COMMON,
    description: '恢复25HP，解除轻微划伤debuff。', healHp: 25, sublimationLevel: 0,
  },
  'consumable_rock_defense_potion': {
    id: 'consumable_rock_defense_potion', name: '碎石防御药剂', type: ItemType.CONSUMABLE, rarity: ItemRarity.UNCOMMON,
    description: '抵御碎石伤害，持续15秒，防御+12，恢复20HP。', healHp: 20, sublimationLevel: 0,
  },
  'consumable_armor_break_potion': {
    id: 'consumable_armor_break_potion', name: '破甲药剂', type: ItemType.CONSUMABLE, rarity: ItemRarity.RARE,
    description: '使用后8秒内，攻击时有25%概率破甲。', sublimationLevel: 0,
  },
  'consumable_water_purifier': {
    id: 'consumable_water_purifier', name: '净水药剂', type: ItemType.CONSUMABLE, rarity: ItemRarity.UNCOMMON,
    description: '净化污水，解除中毒debuff，恢复20HP。', healHp: 20, sublimationLevel: 0,
  },
  'consumable_waterproof_potion': {
    id: 'consumable_waterproof_potion', name: '防水药剂', type: ItemType.CONSUMABLE, rarity: ItemRarity.COMMON,
    description: '提升防水效果，持续20秒，防御+8。', sublimationLevel: 0,
  },
  'consumable_water_supply': {
    id: 'consumable_water_supply', name: '水源补给水', type: ItemType.CONSUMABLE, rarity: ItemRarity.COMMON,
    description: '恢复30HP，缓解口渴debuff。', healHp: 30, healThirst: 30, sublimationLevel: 0,
  },
  'consumable_parasite_remover': {
    id: 'consumable_parasite_remover', name: '寄生解除剂', type: ItemType.CONSUMABLE, rarity: ItemRarity.UNCOMMON,
    description: '解除寄生状态，恢复15HP。', healHp: 15, sublimationLevel: 0,
  },
  'consumable_wolf_deterrent': {
    id: 'consumable_wolf_deterrent', name: '狼群威慑剂', type: ItemType.CONSUMABLE, rarity: ItemRarity.UNCOMMON,
    description: '震慑荒原狼，使其停止攻击，持续10秒。', sublimationLevel: 0,
  },
  'consumable_traveler_ration': {
    id: 'consumable_traveler_ration', name: '旅人干粮', type: ItemType.CONSUMABLE, rarity: ItemRarity.UNCOMMON,
    description: '恢复30HP和15点体力。', healHp: 30, healStamina: 15, sublimationLevel: 0,
  },
  'consumable_bleed_relief': {
    id: 'consumable_bleed_relief', name: '流血解除剂', type: ItemType.CONSUMABLE, rarity: ItemRarity.COMMON,
    description: '解除流血debuff，恢复20HP，持续10秒免疫轻微流血。', healHp: 20, sublimationLevel: 0,
  },
  'consumable_rust_remover': {
    id: 'consumable_rust_remover', name: '锈蚀清除剂', type: ItemType.CONSUMABLE, rarity: ItemRarity.UNCOMMON,
    description: '清除锈蚀物，解除金属碎屑debuff，恢复20HP。', healHp: 20, sublimationLevel: 0,
  },
  'consumable_metal_processor': {
    id: 'consumable_metal_processor', name: '金属加工剂', type: ItemType.CONSUMABLE, rarity: ItemRarity.RARE,
    description: '提升25%金属废料加工成功率。', sublimationLevel: 0,
  },
  'consumable_scrap_supply': {
    id: 'consumable_scrap_supply', name: '废料补给包', type: ItemType.CONSUMABLE, rarity: ItemRarity.UNCOMMON,
    description: '恢复30HP，金属区域探索效率+15%，持续10秒。', healHp: 30, sublimationLevel: 0,
  },
  'consumable_cold_proof_potion': {
    id: 'consumable_cold_proof_potion', name: '防寒药剂', type: ItemType.CONSUMABLE, rarity: ItemRarity.RARE,
    description: '提升保暖效果，持续20秒，解除冻伤debuff，恢复25HP。', healHp: 25, sublimationLevel: 0,
  },
  'consumable_fuel_pack': {
    id: 'consumable_fuel_pack', name: '燃料包', type: ItemType.CONSUMABLE, rarity: ItemRarity.UNCOMMON,
    description: '点燃保暖棚，站内每秒不掉HP，持续20秒。', sublimationLevel: 0,
  },
  'consumable_low_temp_ration': {
    id: 'consumable_low_temp_ration', name: '低温补给粮', type: ItemType.CONSUMABLE, rarity: ItemRarity.UNCOMMON,
    description: '恢复30HP，低温抗性+15%，持续15秒。', healHp: 30, sublimationLevel: 0,
  },
  'consumable_slow_relief': {
    id: 'consumable_slow_relief', name: '减速解除剂', type: ItemType.CONSUMABLE, rarity: ItemRarity.COMMON,
    description: '解除减速debuff，恢复15HP。', healHp: 15, sublimationLevel: 0,
  },
  'consumable_border_supply': {
    id: 'consumable_border_supply', name: '边境补给包', type: ItemType.CONSUMABLE, rarity: ItemRarity.RARE,
    description: '恢复40HP和20点体力，全属性+5%，持续15秒。', healHp: 40, healStamina: 20, sublimationLevel: 0,
  },
  'consumable_sentry_repair': {
    id: 'consumable_sentry_repair', name: '哨兵修复剂', type: ItemType.CONSUMABLE, rarity: ItemRarity.RARE,
    description: '恢复35HP，解除所有负面debuff。', healHp: 35, sublimationLevel: 0,
  },
  'consumable_universal_potion': {
    id: 'consumable_universal_potion', name: '全能药剂', type: ItemType.CONSUMABLE, rarity: ItemRarity.EPIC,
    description: '恢复25HP，攻击、防御、攻速+8%，持续12秒。', healHp: 25, sublimationLevel: 0,
  },

  // ============================================
  // 基础生存消耗品
  // ============================================
  'consumable_food': {
    id: 'consumable_food', name: '食物', type: ItemType.CONSUMABLE, rarity: ItemRarity.COMMON,
    description: '基础食物，回复50点饥饿值。', healHunger: 50, sublimationLevel: 0,
  },
  'consumable_water': {
    id: 'consumable_water', name: '水', type: ItemType.CONSUMABLE, rarity: ItemRarity.COMMON,
    description: '基础饮用水，回复50点口渴值。', healThirst: 50, sublimationLevel: 0,
  },

  // ============================================
  // 材料 - 站台1：锈蚀荒原补给站
  // ============================================
  'mat_rusty_scrap': {
    id: 'mat_rusty_scrap', name: '锈蚀铁屑', type: ItemType.MATERIAL, rarity: ItemRarity.COMMON,
    description: '【制作装备】用于制作/修复简易铁制武器和防具。', sublimationLevel: 0,
  },
  'mat_cloth_fragment': {
    id: 'mat_cloth_fragment', name: '粗布碎片', type: ItemType.MATERIAL, rarity: ItemRarity.COMMON,
    description: '【制作装备】用于制作/修复布制防具（帽子、衣服）。', sublimationLevel: 0,
  },
  'mat_scrap_screw': {
    id: 'mat_scrap_screw', name: '废弃螺丝', type: ItemType.MATERIAL, rarity: ItemRarity.COMMON,
    description: '【列车改造】用于修复列车简易部件、加固车厢连接处。', sublimationLevel: 0,
  },
  'mat_iron_slag_crystal': {
    id: 'mat_iron_slag_crystal', name: '铁屑结晶', type: ItemType.MATERIAL, rarity: ItemRarity.UNCOMMON,
    description: '【制作装备】精英材料，用于强化铁制装备属性。', sublimationLevel: 0,
  },
  'mat_rusty_shell': {
    id: 'mat_rusty_shell', name: '锈蚀鼠壳', type: ItemType.MATERIAL, rarity: ItemRarity.UNCOMMON,
    description: '【制作消耗品】精英材料，可制作抗锈蚀药剂。', sublimationLevel: 0,
  },
  'mat_rusty_core': {
    id: 'mat_rusty_core', name: '锈蚀核心', type: ItemType.MATERIAL, rarity: ItemRarity.RARE,
    description: '【制作装备】Boss稀有材料，用于制作抗锈蚀高级装备。', sublimationLevel: 0,
  },

  // ============================================
  // 材料 - 站台2：荒原临时维修站
  // ============================================
  'mat_scrap_parts': {
    id: 'mat_scrap_parts', name: '废弃零件', type: ItemType.MATERIAL, rarity: ItemRarity.COMMON,
    description: '【列车改造】用于修复列车机械部件、升级列车引擎。', sublimationLevel: 0,
  },
  'mat_machine_oil': {
    id: 'mat_machine_oil', name: '机油', type: ItemType.MATERIAL, rarity: ItemRarity.COMMON,
    description: '【制作消耗品】用于制作油污清除剂、润滑列车零件。', sublimationLevel: 0,
  },
  'mat_iron_wire': {
    id: 'mat_iron_wire', name: '铁丝', type: ItemType.MATERIAL, rarity: ItemRarity.COMMON,
    description: '【制作装备】用于制作/修复金属防具、固定装备。', sublimationLevel: 0,
  },
  'mat_quality_oil': {
    id: 'mat_quality_oil', name: '优质机油', type: ItemType.MATERIAL, rarity: ItemRarity.UNCOMMON,
    description: '【制作消耗品】精英材料，用于制作高级维修补给剂。', sublimationLevel: 0,
  },
  'mat_enhanced_parts': {
    id: 'mat_enhanced_parts', name: '强化零件', type: ItemType.MATERIAL, rarity: ItemRarity.UNCOMMON,
    description: '【列车改造】精英材料，用于强化列车核心系统。', sublimationLevel: 0,
  },
  'mat_mechanical_core': {
    id: 'mat_mechanical_core', name: '机械核心', type: ItemType.MATERIAL, rarity: ItemRarity.RARE,
    description: '【列车改造】Boss稀有材料，来自维修机械王，用于列车引擎升级。', sublimationLevel: 0,
  },

  // ============================================
  // 材料 - 站台3：风沙遮蔽站
  // ============================================
  'mat_sand_crystal': {
    id: 'mat_sand_crystal', name: '沙尘结晶', type: ItemType.MATERIAL, rarity: ItemRarity.COMMON,
    description: '【制作消耗品】用于制作防风药剂、风沙补给饼。', sublimationLevel: 0,
  },
  'mat_scorpion_shell': {
    id: 'mat_scorpion_shell', name: '蝎壳碎片', type: ItemType.MATERIAL, rarity: ItemRarity.COMMON,
    description: '【制作装备】用于制作/修复皮质防具（帽子、衣服、裤子）。', sublimationLevel: 0,
  },
  'mat_concrete_fragment': {
    id: 'mat_concrete_fragment', name: '混凝土碎片', type: ItemType.MATERIAL, rarity: ItemRarity.COMMON,
    description: '【列车改造】用于修补列车外壳、加固车厢装甲。', sublimationLevel: 0,
  },
  'mat_scorpion_venom': {
    id: 'mat_scorpion_venom', name: '蝎毒囊', type: ItemType.MATERIAL, rarity: ItemRarity.UNCOMMON,
    description: '【制作消耗品】精英材料，可制作蝎毒解毒剂。', sublimationLevel: 0,
  },
  'mat_sand_crystal_pure': {
    id: 'mat_sand_crystal_pure', name: '纯净沙尘结晶', type: ItemType.MATERIAL, rarity: ItemRarity.UNCOMMON,
    description: '【制作装备】精英材料，用于制作风沙抗性高级装备。', sublimationLevel: 0,
  },
  'mat_sand_core': {
    id: 'mat_sand_core', name: '沙尘核心', type: ItemType.MATERIAL, rarity: ItemRarity.RARE,
    description: '【制作装备】Boss稀有材料，来自风沙巨蝎王，用于制作顶级防风装备。', sublimationLevel: 0,
  },

  // ============================================
  // 材料 - 站台4：废弃粮仓补给站
  // ============================================
  'mat_sack_fragment': {
    id: 'mat_sack_fragment', name: '粮袋碎片', type: ItemType.MATERIAL, rarity: ItemRarity.COMMON,
    description: '【制作装备】用于制作/修复布制防具和收纳包。', sublimationLevel: 0,
  },
  'mat_fresh_grain': {
    id: 'mat_fresh_grain', name: '未发霉粮食', type: ItemType.MATERIAL, rarity: ItemRarity.COMMON,
    description: '【制作消耗品】用于制作粗粮饼干、新鲜粮食等续航道具。', sublimationLevel: 0,
  },
  'mat_rabbit_meat': {
    id: 'mat_rabbit_meat', name: '野兔肉', type: ItemType.MATERIAL, rarity: ItemRarity.COMMON,
    description: '【制作消耗品】可食用或制作高级食物补给。', sublimationLevel: 0,
  },
  'mat_quality_rabbit_fur': {
    id: 'mat_quality_rabbit_fur', name: '优质兔毛', type: ItemType.MATERIAL, rarity: ItemRarity.UNCOMMON,
    description: '【制作装备】精英材料，用于制作保暖防具和饰品。', sublimationLevel: 0,
  },
  'mat_mold_crystal': {
    id: 'mat_mold_crystal', name: '发霉结晶', type: ItemType.MATERIAL, rarity: ItemRarity.UNCOMMON,
    description: '【制作消耗品】精英材料，可制作防霉药剂。', sublimationLevel: 0,
  },
  'mat_grain_core': {
    id: 'mat_grain_core', name: '粮食核心', type: ItemType.MATERIAL, rarity: ItemRarity.RARE,
    description: '【制作消耗品】Boss稀有材料，可制作顶级续航补给包。', sublimationLevel: 0,
  },

  // ============================================
  // 材料 - 站台5：岩石峭壁中继站
  // ============================================
  'mat_rock_fragment': {
    id: 'mat_rock_fragment', name: '岩石碎片', type: ItemType.MATERIAL, rarity: ItemRarity.COMMON,
    description: '【制作装备】用于制作/修复石制武器和防具。', sublimationLevel: 0,
  },
  'mat_lizard_scale': {
    id: 'mat_lizard_scale', name: '蜥蜴鳞片', type: ItemType.MATERIAL, rarity: ItemRarity.COMMON,
    description: '【制作装备】用于制作/修复皮质防具和饰品。', sublimationLevel: 0,
  },
  'mat_railing_fragment': {
    id: 'mat_railing_fragment', name: '护栏碎片', type: ItemType.MATERIAL, rarity: ItemRarity.COMMON,
    description: '【列车改造】用于修复列车护栏、加固车厢边缘。', sublimationLevel: 0,
  },
  'mat_quality_lizard_skin': {
    id: 'mat_quality_lizard_skin', name: '优质蜥蜴皮', type: ItemType.MATERIAL, rarity: ItemRarity.UNCOMMON,
    description: '【制作装备】精英材料，用于制作高级皮质防具。', sublimationLevel: 0,
  },
  'mat_worm_crystal': {
    id: 'mat_worm_crystal', name: '蠕虫结晶', type: ItemType.MATERIAL, rarity: ItemRarity.UNCOMMON,
    description: '【制作消耗品】精英材料，可制作碎石防御药剂。', sublimationLevel: 0,
  },
  'mat_rock_core': {
    id: 'mat_rock_core', name: '岩石核心', type: ItemType.MATERIAL, rarity: ItemRarity.RARE,
    description: '【制作装备】Boss稀有材料，来自岩石巨蜥王，用于制作顶级石制装备。', sublimationLevel: 0,
  },

  // ============================================
  // 材料 - 站台6：废弃水源补给站
  // ============================================
  'mat_pipe_fragment': {
    id: 'mat_pipe_fragment', name: '水管碎片', type: ItemType.MATERIAL, rarity: ItemRarity.COMMON,
    description: '【列车改造】用于修复列车供水系统、安装净水装置。', sublimationLevel: 0,
  },
  'mat_bucket_fragment': {
    id: 'mat_bucket_fragment', name: '水桶碎片', type: ItemType.MATERIAL, rarity: ItemRarity.COMMON,
    description: '【制作装备】用于制作/修复水桶挂扣等饰品。', sublimationLevel: 0,
  },
  'mat_underwater_crystal': {
    id: 'mat_underwater_crystal', name: '地下水结晶', type: ItemType.MATERIAL, rarity: ItemRarity.COMMON,
    description: '【制作消耗品】用于制作净水药剂、防水药剂。', sublimationLevel: 0,
  },
  'mat_worm_crystal_water': {
    id: 'mat_worm_crystal_water', name: '蠕虫结晶', type: ItemType.MATERIAL, rarity: ItemRarity.UNCOMMON,
    description: '【制作消耗品】精英材料，可制作寄生解除剂。', sublimationLevel: 0,
  },
  'mat_sewage_crystal': {
    id: 'mat_sewage_crystal', name: '污水结晶', type: ItemType.MATERIAL, rarity: ItemRarity.UNCOMMON,
    description: '【制作消耗品】精英材料，可制作高级解毒剂。', sublimationLevel: 0,
  },
  'mat_water_core': {
    id: 'mat_water_core', name: '水源核心', type: ItemType.MATERIAL, rarity: ItemRarity.RARE,
    description: '【列车改造】Boss稀有材料，来自水生甲虫王，用于升级列车水循环系统。', sublimationLevel: 0,
  },

  // ============================================
  // 材料 - 站台7：荒原废弃驿站
  // ============================================
  'mat_wolf_skin': {
    id: 'mat_wolf_skin', name: '狼皮', type: ItemType.MATERIAL, rarity: ItemRarity.COMMON,
    description: '【制作装备】用于制作/修复皮质防具和旅人系列装备。', sublimationLevel: 0,
  },
  'mat_debris_fragment': {
    id: 'mat_debris_fragment', name: '杂物碎片', type: ItemType.MATERIAL, rarity: ItemRarity.COMMON,
    description: '【制作消耗品】用于制作简易道具、狼群威慑剂。', sublimationLevel: 0,
  },
  'mat_station_board': {
    id: 'mat_station_board', name: '驿站木板', type: ItemType.MATERIAL, rarity: ItemRarity.COMMON,
    description: '【列车改造】用于修复列车座椅、装饰车厢内部。', sublimationLevel: 0,
  },
  'mat_quality_wolf_fur': {
    id: 'mat_quality_wolf_fur', name: '优质狼毛', type: ItemType.MATERIAL, rarity: ItemRarity.UNCOMMON,
    description: '【制作装备】精英材料，用于制作高级皮质防具和旅人挂坠。', sublimationLevel: 0,
  },
  'mat_enhanced_debris': {
    id: 'mat_enhanced_debris', name: '强化杂物', type: ItemType.MATERIAL, rarity: ItemRarity.UNCOMMON,
    description: '【列车改造】精英材料，用于强化列车结构部件。', sublimationLevel: 0,
  },
  'mat_station_core': {
    id: 'mat_station_core', name: '驿站核心', type: ItemType.MATERIAL, rarity: ItemRarity.RARE,
    description: '【列车改造】Boss稀有材料，来自荒原狼王，用于列车核心系统升级。', sublimationLevel: 0,
  },

  // ============================================
  // 材料 - 站台8：金属废料回收站
  // ============================================
  'mat_scrap_metal': {
    id: 'mat_scrap_metal', name: '废弃金属', type: ItemType.MATERIAL, rarity: ItemRarity.COMMON,
    description: '【制作装备】用于制作/修复金属武器和防具。', sublimationLevel: 0,
  },
  'mat_metal_debris': {
    id: 'mat_metal_debris', name: '金属碎屑', type: ItemType.MATERIAL, rarity: ItemRarity.COMMON,
    description: '【制作消耗品】用于制作金属加工剂、锈蚀清除剂。', sublimationLevel: 0,
  },
  'mat_rusty_metal_sheet': {
    id: 'mat_rusty_metal_sheet', name: '锈蚀金属片', type: ItemType.MATERIAL, rarity: ItemRarity.COMMON,
    description: '【列车改造】用于制作防御装甲板、加固列车外壳。', sublimationLevel: 0,
  },
  'mat_quality_rusty_shell': {
    id: 'mat_quality_rusty_shell', name: '优质锈蚀外壳', type: ItemType.MATERIAL, rarity: ItemRarity.UNCOMMON,
    description: '【制作装备】精英材料，用于制作高级金属防具。', sublimationLevel: 0,
  },
  'mat_metal_crystal': {
    id: 'mat_metal_crystal', name: '金属结晶', type: ItemType.MATERIAL, rarity: ItemRarity.UNCOMMON,
    description: '【制作装备】精英材料，用于强化金属装备属性。', sublimationLevel: 0,
  },
  'mat_metal_core': {
    id: 'mat_metal_core', name: '金属核心', type: ItemType.MATERIAL, rarity: ItemRarity.RARE,
    description: '【列车改造】Boss稀有材料，来自金属傀儡王，用于列车装甲系统升级。', sublimationLevel: 0,
  },

  // ============================================
  // 材料 - 站台9：低温荒原避风站
  // ============================================
  'mat_warm_rabbit_fur': {
    id: 'mat_warm_rabbit_fur', name: '保暖兔毛', type: ItemType.MATERIAL, rarity: ItemRarity.COMMON,
    description: '【制作装备】用于制作/修复保暖防具和围巾饰品。', sublimationLevel: 0,
  },
  'mat_ice_debris': {
    id: 'mat_ice_debris', name: '冰屑', type: ItemType.MATERIAL, rarity: ItemRarity.COMMON,
    description: '【制作消耗品】用于制作防寒药剂、低温补给粮。', sublimationLevel: 0,
  },
  'mat_ice_shell_fragment': {
    id: 'mat_ice_shell_fragment', name: '冰壳碎片', type: ItemType.MATERIAL, rarity: ItemRarity.COMMON,
    description: '【制作装备】用于强化装备冰抗性。', sublimationLevel: 0,
  },
  'mat_quality_warm_fur': {
    id: 'mat_quality_warm_fur', name: '优质保暖兔毛', type: ItemType.MATERIAL, rarity: ItemRarity.UNCOMMON,
    description: '【制作装备】精英材料，用于制作高级保暖防具。', sublimationLevel: 0,
  },
  'mat_ice_crystal': {
    id: 'mat_ice_crystal', name: '冰结晶', type: ItemType.MATERIAL, rarity: ItemRarity.UNCOMMON,
    description: '【制作消耗品】精英材料，可制作强效防寒药剂。', sublimationLevel: 0,
  },
  'mat_low_temp_core': {
    id: 'mat_low_temp_core', name: '低温核心', type: ItemType.MATERIAL, rarity: ItemRarity.RARE,
    description: '【制作装备】Boss稀有材料，来自低温狼，用于制作顶级保暖装备。', sublimationLevel: 0,
  },

  // ============================================
  // 材料 - 站台10：荒原边境哨站
  // ============================================
  'mat_border_relic': {
    id: 'mat_border_relic', name: '边境遗物', type: ItemType.MATERIAL, rarity: ItemRarity.COMMON,
    description: '【制作装备】用于制作边境系列高级装备和饰品。', sublimationLevel: 0,
  },
  'mat_sentry_parts': {
    id: 'mat_sentry_parts', name: '哨兵零件', type: ItemType.MATERIAL, rarity: ItemRarity.COMMON,
    description: '【列车改造】用于修复列车高级部件、安装自动防御系统。', sublimationLevel: 0,
  },
  'mat_signal_fragment': {
    id: 'mat_signal_fragment', name: '信号装置碎片', type: ItemType.MATERIAL, rarity: ItemRarity.COMMON,
    description: '【列车改造】用于制作通讯设备、升级列车雷达系统。', sublimationLevel: 0,
  },
  'mat_elite_badge': {
    id: 'mat_elite_badge', name: '精英徽章', type: ItemType.MATERIAL, rarity: ItemRarity.UNCOMMON,
    description: '【制作装备】精英材料，用于制作边境徽章饰品。', sublimationLevel: 0,
  },
  'mat_enhanced_signal': {
    id: 'mat_enhanced_signal', name: '强化信号装置', type: ItemType.MATERIAL, rarity: ItemRarity.UNCOMMON,
    description: '【列车改造】精英材料，用于强化列车通讯和雷达系统。', sublimationLevel: 0,
  },
  'mat_border_core': {
    id: 'mat_border_core', name: '边境核心', type: ItemType.MATERIAL, rarity: ItemRarity.RARE,
    description: '【列车改造】Boss稀有材料，来自边境守望者，用于列车核心升级和解锁新区域。', sublimationLevel: 0,
  },
  'mat_pass_fragment': {
    id: 'mat_pass_fragment', name: '通行证碎片', type: ItemType.MATERIAL, rarity: ItemRarity.EPIC,
    description: '【特殊】用于合成边境通行证，解锁高级探索区域。', sublimationLevel: 0,
  },

  // ============================================
  // 神话站台材料 - 站台1：锈蚀赫利俄斯站
  // ============================================
  'mat_sun_fragment': {
    id: 'mat_sun_fragment', name: '太阳碎片', type: ItemType.MATERIAL, rarity: ItemRarity.COMMON,
    description: '【制作装备】赫利俄斯站材料，用于制作T1级神话装备。', sublimationLevel: 0,
  },
  'mat_bronze_light': {
    id: 'mat_bronze_light', name: '青铜光纹', type: ItemType.MATERIAL, rarity: ItemRarity.COMMON,
    description: '【制作装备】赫利俄斯站材料，用于制作T1级神话防具。', sublimationLevel: 0,
  },
  'mat_helioss_essence': {
    id: 'mat_helioss_essence', name: '赫利俄斯精华', type: ItemType.MATERIAL, rarity: ItemRarity.RARE,
    description: '【制作装备】赫利俄斯站Boss材料，用于制作高级神话装备。', sublimationLevel: 0,
  },

  // ============================================
  // 神话站台材料 - 站台2：雾隐瓦尔哈拉补给站
  // ============================================
  'mat_mist_crystal': {
    id: 'mat_mist_crystal', name: '雾隐结晶', type: ItemType.MATERIAL, rarity: ItemRarity.COMMON,
    description: '【制作装备】瓦尔哈拉站材料，用于制作T1+级神话装备。', sublimationLevel: 0,
  },
  'mat_hero_fragment': {
    id: 'mat_hero_fragment', name: '英灵碎片', type: ItemType.MATERIAL, rarity: ItemRarity.COMMON,
    description: '【制作装备】瓦尔哈拉站材料，用于制作T1+级神话装备。', sublimationLevel: 0,
  },
  'mat_valhalla_core': {
    id: 'mat_valhalla_core', name: '瓦尔哈拉核心', type: ItemType.MATERIAL, rarity: ItemRarity.RARE,
    description: '【制作装备】瓦尔哈拉站Boss材料，用于制作高级神话装备。', sublimationLevel: 0,
  },

  // ============================================
  // 神话站台材料 - 站台3：断裂彩虹桥枢纽
  // ============================================
  'mat_rainbow_crystal': {
    id: 'mat_rainbow_crystal', name: '彩虹结晶', type: ItemType.MATERIAL, rarity: ItemRarity.COMMON,
    description: '【制作装备】彩虹桥站材料，用于制作T2级神话装备。', sublimationLevel: 0,
  },
  'mat_thunder_stone': {
    id: 'mat_thunder_stone', name: '雷纹石', type: ItemType.MATERIAL, rarity: ItemRarity.COMMON,
    description: '【制作装备】彩虹桥站材料，用于制作T2级神话装备。', sublimationLevel: 0,
  },
  'mat_bifrost_core': {
    id: 'mat_bifrost_core', name: '彩虹桥核心', type: ItemType.MATERIAL, rarity: ItemRarity.RARE,
    description: '【制作装备】彩虹桥站Boss材料，用于制作高级神话装备。', sublimationLevel: 0,
  },

  // ============================================
  // 神话站台材料 - 站台4：枯寂奥林匹斯中继站
  // ============================================
  'mat_olympus_stone': {
    id: 'mat_olympus_stone', name: '奥林匹斯石', type: ItemType.MATERIAL, rarity: ItemRarity.COMMON,
    description: '【制作装备】奥林匹斯站材料，用于制作T3级神话装备。', sublimationLevel: 0,
  },
  'mat_thunder_gold': {
    id: 'mat_thunder_gold', name: '雷纹金', type: ItemType.MATERIAL, rarity: ItemRarity.COMMON,
    description: '【制作装备】奥林匹斯站材料，用于制作T3级神话装备。', sublimationLevel: 0,
  },
  'mat_zeus_core': {
    id: 'mat_zeus_core', name: '宙斯核心', type: ItemType.MATERIAL, rarity: ItemRarity.RARE,
    description: '【制作装备】奥林匹斯站Boss材料，用于制作高级神话装备。', sublimationLevel: 0,
  },

  // ============================================
  // 神话站台材料 - 站台5：残破德尔斐预言站
  // ============================================
  'mat_prophecy_scroll': {
    id: 'mat_prophecy_scroll', name: '预言卷轴', type: ItemType.MATERIAL, rarity: ItemRarity.COMMON,
    description: '【制作装备】德尔斐站材料，用于制作T4级神话装备。', sublimationLevel: 0,
  },
  'mat_oracle_crystal': {
    id: 'mat_oracle_crystal', name: '神谕水晶', type: ItemType.MATERIAL, rarity: ItemRarity.UNCOMMON,
    description: '【制作装备】德尔斐站精英材料，用于制作T4级神话装备。', sublimationLevel: 0,
  },
  'mat_apollo_core': {
    id: 'mat_apollo_core', name: '阿波罗核心', type: ItemType.MATERIAL, rarity: ItemRarity.RARE,
    description: '【制作装备】德尔斐站Boss材料，用于制作高级神话装备。', sublimationLevel: 0,
  },

  // ============================================
  // 神话站台材料 - 站台6：冰封密米尔智库站
  // ============================================
  'mat_ice_wisdom': {
    id: 'mat_ice_wisdom', name: '冰封智慧', type: ItemType.MATERIAL, rarity: ItemRarity.COMMON,
    description: '【制作装备】密米尔站材料，用于制作T5级神话装备。', sublimationLevel: 0,
  },
  'mat_frost_rune': {
    id: 'mat_frost_rune', name: '冰霜符文', type: ItemType.MATERIAL, rarity: ItemRarity.UNCOMMON,
    description: '【制作装备】密米尔站精英材料，用于制作T5级神话装备。', sublimationLevel: 0,
  },
  'mat_mimir_core': {
    id: 'mat_mimir_core', name: '密米尔核心', type: ItemType.MATERIAL, rarity: ItemRarity.RARE,
    description: '【制作装备】密米尔站Boss材料，用于制作高级神话装备。', sublimationLevel: 0,
  },

  // ============================================
  // 神话站台材料 - 站台7：深渊赫尔驿站
  // ============================================
  'mat_underworld_shadow': {
    id: 'mat_underworld_shadow', name: '冥界幽影', type: ItemType.MATERIAL, rarity: ItemRarity.COMMON,
    description: '【制作装备】赫尔站材料，用于制作T6级神话装备。', sublimationLevel: 0,
  },
  'mat_soul_fragment': {
    id: 'mat_soul_fragment', name: '灵魂碎片', type: ItemType.MATERIAL, rarity: ItemRarity.UNCOMMON,
    description: '【制作装备】赫尔站精英材料，用于制作T6级神话装备。', sublimationLevel: 0,
  },
  'mat_hel_core': {
    id: 'mat_hel_core', name: '赫尔核心', type: ItemType.MATERIAL, rarity: ItemRarity.RARE,
    description: '【制作装备】赫尔站Boss材料，用于制作高级神话装备。', sublimationLevel: 0,
  },

  // ============================================
  // 神话站台材料 - 站台8：无神之境枢纽
  // ============================================
  'mat_chaos_essence': {
    id: 'mat_chaos_essence', name: '混沌精华', type: ItemType.MATERIAL, rarity: ItemRarity.COMMON,
    description: '【制作装备】无神之境材料，用于制作T7级神话装备。', sublimationLevel: 0,
  },
  'mat_godless_shard': {
    id: 'mat_godless_shard', name: '无神碎片', type: ItemType.MATERIAL, rarity: ItemRarity.UNCOMMON,
    description: '【制作装备】无神之境精英材料，用于制作T7级神话装备。', sublimationLevel: 0,
  },
  'mat_chaos_core': {
    id: 'mat_chaos_core', name: '混沌核心', type: ItemType.MATERIAL, rarity: ItemRarity.RARE,
    description: '【制作装备】无神之境Boss材料，用于制作高级神话装备。', sublimationLevel: 0,
  },

  // ============================================
  // 神话站台材料 - 站台9：海神波塞冬站
  // ============================================
  'mat_sea_crystal': {
    id: 'mat_sea_crystal', name: '海洋结晶', type: ItemType.MATERIAL, rarity: ItemRarity.COMMON,
    description: '【制作装备】波塞冬站材料，用于制作T5+级神话装备。', sublimationLevel: 0,
  },
  'mat_wave_rune': {
    id: 'mat_wave_rune', name: '波浪符文', type: ItemType.MATERIAL, rarity: ItemRarity.UNCOMMON,
    description: '【制作装备】波塞冬站精英材料，用于制作T5+级神话装备。', sublimationLevel: 0,
  },
  'mat_poseidon_core': {
    id: 'mat_poseidon_core', name: '波塞冬核心', type: ItemType.MATERIAL, rarity: ItemRarity.RARE,
    description: '【制作装备】波塞冬站Boss材料，用于制作高级神话装备。', sublimationLevel: 0,
  },

  // ============================================
  // 神话站台材料 - 站台10：战神阿瑞斯站
  // ============================================
  'mat_war_blood': {
    id: 'mat_war_blood', name: '战血结晶', type: ItemType.MATERIAL, rarity: ItemRarity.COMMON,
    description: '【制作装备】阿瑞斯站材料，用于制作T6级神话装备。', sublimationLevel: 0,
  },
  'mat_battle_rune': {
    id: 'mat_battle_rune', name: '战斗符文', type: ItemType.MATERIAL, rarity: ItemRarity.UNCOMMON,
    description: '【制作装备】阿瑞斯站精英材料，用于制作T6级神话装备。', sublimationLevel: 0,
  },
  'mat_ares_core': {
    id: 'mat_ares_core', name: '阿瑞斯核心', type: ItemType.MATERIAL, rarity: ItemRarity.RARE,
    description: '【制作装备】阿瑞斯站Boss材料，用于制作高级神话装备。', sublimationLevel: 0,
  },

  // ============================================
  // 神话站台材料 - 站台11：智慧雅典娜站
  // ============================================
  'mat_wisdom_scroll': {
    id: 'mat_wisdom_scroll', name: '智慧卷轴', type: ItemType.MATERIAL, rarity: ItemRarity.COMMON,
    description: '【制作装备】雅典娜站材料，用于制作T6级神话装备。', sublimationLevel: 0,
  },
  'mat_owl_feather': {
    id: 'mat_owl_feather', name: '猫头鹰羽毛', type: ItemType.MATERIAL, rarity: ItemRarity.UNCOMMON,
    description: '【制作装备】雅典娜站精英材料，用于制作T6级神话装备。', sublimationLevel: 0,
  },
  'mat_athena_core': {
    id: 'mat_athena_core', name: '雅典娜核心', type: ItemType.MATERIAL, rarity: ItemRarity.RARE,
    description: '【制作装备】雅典娜站Boss材料，用于制作高级神话装备。', sublimationLevel: 0,
  },

  // ============================================
  // 神话站台材料 - 站台12：锻造赫淮斯托斯站
  // ============================================
  'mat_flame_ore': {
    id: 'mat_flame_ore', name: '火焰矿石', type: ItemType.MATERIAL, rarity: ItemRarity.COMMON,
    description: '【制作装备】赫淮斯托斯站材料，用于制作T6+级神话装备。', sublimationLevel: 0,
  },
  'mat_forge_ash': {
    id: 'mat_forge_ash', name: '锻造灰烬', type: ItemType.MATERIAL, rarity: ItemRarity.UNCOMMON,
    description: '【制作装备】赫淮斯托斯站精英材料，用于制作T6+级神话装备。', sublimationLevel: 0,
  },
  'mat_hephaestus_core': {
    id: 'mat_hephaestus_core', name: '赫淮斯托斯核心', type: ItemType.MATERIAL, rarity: ItemRarity.RARE,
    description: '【制作装备】赫淮斯托斯站Boss材料，用于制作高级神话装备。', sublimationLevel: 0,
  },

  // ============================================
  // 神话站台材料 - 站台13：冥后珀耳塞福涅站
  // ============================================
  'mat_underworld_flower': {
    id: 'mat_underworld_flower', name: '冥界之花', type: ItemType.MATERIAL, rarity: ItemRarity.COMMON,
    description: '【制作装备】珀耳塞福涅站材料，用于制作T6+级神话装备。', sublimationLevel: 0,
  },
  'mat_spring_essence': {
    id: 'mat_spring_essence', name: '春之精华', type: ItemType.MATERIAL, rarity: ItemRarity.UNCOMMON,
    description: '【制作装备】珀耳塞福涅站精英材料，用于制作T6+级神话装备。', sublimationLevel: 0,
  },
  'mat_persephone_core': {
    id: 'mat_persephone_core', name: '珀耳塞福涅核心', type: ItemType.MATERIAL, rarity: ItemRarity.RARE,
    description: '【制作装备】珀耳塞福涅站Boss材料，用于制作高级神话装备。', sublimationLevel: 0,
  },

  // ============================================
  // 神话站台材料 - 站台14：神使赫尔墨斯站
  // ============================================
  'mat_wind_crystal': {
    id: 'mat_wind_crystal', name: '疾风结晶', type: ItemType.MATERIAL, rarity: ItemRarity.COMMON,
    description: '【制作装备】赫尔墨斯站材料，用于制作T7级神话装备。', sublimationLevel: 0,
  },
  'mat_messenger_feather': {
    id: 'mat_messenger_feather', name: '神使羽毛', type: ItemType.MATERIAL, rarity: ItemRarity.UNCOMMON,
    description: '【制作装备】赫尔墨斯站精英材料，用于制作T7级神话装备。', sublimationLevel: 0,
  },
  'mat_hermes_core': {
    id: 'mat_hermes_core', name: '赫尔墨斯核心', type: ItemType.MATERIAL, rarity: ItemRarity.RARE,
    description: '【制作装备】赫尔墨斯站Boss材料，用于制作高级神话装备。', sublimationLevel: 0,
  },

  // ============================================
  // 神话站台材料 - 站台15：诗歌阿波罗站
  // ============================================
  'mat_poetry_scroll': {
    id: 'mat_poetry_scroll', name: '诗歌卷轴', type: ItemType.MATERIAL, rarity: ItemRarity.COMMON,
    description: '【制作装备】诗歌阿波罗站材料，用于制作T7级神话装备。', sublimationLevel: 0,
  },
  'mat_lyre_string': {
    id: 'mat_lyre_string', name: '琴弦', type: ItemType.MATERIAL, rarity: ItemRarity.UNCOMMON,
    description: '【制作装备】诗歌阿波罗站精英材料，用于制作T7级神话装备。', sublimationLevel: 0,
  },
  'mat_apollo_poetry_core': {
    id: 'mat_apollo_poetry_core', name: '诗歌阿波罗核心', type: ItemType.MATERIAL, rarity: ItemRarity.RARE,
    description: '【制作装备】诗歌阿波罗站Boss材料，用于制作高级神话装备。', sublimationLevel: 0,
  },

  // ============================================
  // 神话站台材料 - 站台16：诗歌布拉基站
  // ============================================
  'mat_nordic_poetry': {
    id: 'mat_nordic_poetry', name: '北欧诗篇', type: ItemType.MATERIAL, rarity: ItemRarity.COMMON,
    description: '【制作装备】布拉基站材料，用于制作T7+级神话装备。', sublimationLevel: 0,
  },
  'mat_skald_ink': {
    id: 'mat_skald_ink', name: '吟游墨水', type: ItemType.MATERIAL, rarity: ItemRarity.UNCOMMON,
    description: '【制作装备】布拉基站精英材料，用于制作T7+级神话装备。', sublimationLevel: 0,
  },
  'mat_bragi_core': {
    id: 'mat_bragi_core', name: '布拉基核心', type: ItemType.MATERIAL, rarity: ItemRarity.RARE,
    description: '【制作装备】布拉基站Boss材料，用于制作高级神话装备。', sublimationLevel: 0,
  },

  // ============================================
  // 神话站台材料 - 站台17：战刃提尔站
  // ============================================
  'mat_war_blade': {
    id: 'mat_war_blade', name: '战刃碎片', type: ItemType.MATERIAL, rarity: ItemRarity.COMMON,
    description: '【制作装备】提尔站材料，用于制作T10级神话装备。', sublimationLevel: 0,
  },
  'mat_battle_mark': {
    id: 'mat_battle_mark', name: '战斗印记', type: ItemType.MATERIAL, rarity: ItemRarity.UNCOMMON,
    description: '【制作装备】提尔站精英材料，用于制作T10级神话装备。', sublimationLevel: 0,
  },
  'mat_tyr_core': {
    id: 'mat_tyr_core', name: '提尔核心', type: ItemType.MATERIAL, rarity: ItemRarity.RARE,
    description: '【制作装备】提尔站Boss材料，用于制作高级神话装备。', sublimationLevel: 0,
  },

  // ============================================
  // 神话站台材料 - 站台18：光明巴尔德尔站
  // ============================================
  'mat_light_crystal': {
    id: 'mat_light_crystal', name: '光明结晶', type: ItemType.MATERIAL, rarity: ItemRarity.COMMON,
    description: '【制作装备】巴尔德尔站材料，用于制作T9级神话装备。', sublimationLevel: 0,
  },
  'mat_purity_essence': {
    id: 'mat_purity_essence', name: '纯洁精华', type: ItemType.MATERIAL, rarity: ItemRarity.UNCOMMON,
    description: '【制作装备】巴尔德尔站精英材料，用于制作T9级神话装备。', sublimationLevel: 0,
  },
  'mat_baldr_core': {
    id: 'mat_baldr_core', name: '巴尔德尔核心', type: ItemType.MATERIAL, rarity: ItemRarity.RARE,
    description: '【制作装备】巴尔德尔站Boss材料，用于制作高级神话装备。', sublimationLevel: 0,
  },

  // ============================================
  // 神话站台材料 - 站台19：酒雾狄俄尼索斯站
  // ============================================
  'mat_wine_essence': {
    id: 'mat_wine_essence', name: '酒之精华', type: ItemType.MATERIAL, rarity: ItemRarity.COMMON,
    description: '【制作装备】狄俄尼索斯站材料，用于制作T10级神话装备。', sublimationLevel: 0,
  },
  'mat_grape_crystal': {
    id: 'mat_grape_crystal', name: '葡萄结晶', type: ItemType.MATERIAL, rarity: ItemRarity.UNCOMMON,
    description: '【制作装备】狄俄尼索斯站精英材料，用于制作T10级神话装备。', sublimationLevel: 0,
  },
  'mat_dionysus_core': {
    id: 'mat_dionysus_core', name: '狄俄尼索斯核心', type: ItemType.MATERIAL, rarity: ItemRarity.RARE,
    description: '【制作装备】狄俄尼索斯站Boss材料，用于制作高级神话装备。', sublimationLevel: 0,
  },

  // ============================================
  // 神话站台材料 - 站台20：麦穗德墨忒尔站
  // ============================================
  'mat_wheat_golden': {
    id: 'mat_wheat_golden', name: '金色麦穗', type: ItemType.MATERIAL, rarity: ItemRarity.COMMON,
    description: '【制作装备】德墨忒尔站材料，用于制作T10级神话装备。', sublimationLevel: 0,
  },
  'mat_harvest_blessing': {
    id: 'mat_harvest_blessing', name: '丰收祝福', type: ItemType.MATERIAL, rarity: ItemRarity.UNCOMMON,
    description: '【制作装备】德墨忒尔站精英材料，用于制作T10级神话装备。', sublimationLevel: 0,
  },
  'mat_demeter_core': {
    id: 'mat_demeter_core', name: '德墨忒尔核心', type: ItemType.MATERIAL, rarity: ItemRarity.RARE,
    description: '【制作装备】德墨忒尔站Boss材料，用于制作高级神话装备。', sublimationLevel: 0,
  },

  // ============================================
  // 神话站台材料 - 站台21：烈焰赫淮斯托斯站
  // ============================================
  'mat_inferno_flame': {
    id: 'mat_inferno_flame', name: '炼狱火焰', type: ItemType.MATERIAL, rarity: ItemRarity.COMMON,
    description: '【制作装备】烈焰赫淮斯托斯站材料，用于制作T10+级神话装备。', sublimationLevel: 0,
  },
  'met_smith_hammer': {
    id: 'met_smith_hammer', name: '锻造锤印', type: ItemType.MATERIAL, rarity: ItemRarity.UNCOMMON,
    description: '【制作装备】烈焰赫淮斯托斯站精英材料，用于制作T10+级神话装备。', sublimationLevel: 0,
  },
  'mat_hephaestus_inferno_core': {
    id: 'mat_hephaestus_inferno_core', name: '烈焰赫淮斯托斯核心', type: ItemType.MATERIAL, rarity: ItemRarity.RARE,
    description: '【制作装备】烈焰赫淮斯托斯站Boss材料，用于制作高级神话装备。', sublimationLevel: 0,
  },

  // ============================================
  // 神话站台材料 - 站台22：暗影赫尔墨斯站
  // ============================================
  'mat_shadow_essence': {
    id: 'mat_shadow_essence', name: '暗影精华', type: ItemType.MATERIAL, rarity: ItemRarity.COMMON,
    description: '【制作装备】暗影赫尔墨斯站材料，用于制作T10+级神话装备。', sublimationLevel: 0,
  },
  'mat_trickster_mark': {
    id: 'mat_trickster_mark', name: '诡诈印记', type: ItemType.MATERIAL, rarity: ItemRarity.UNCOMMON,
    description: '【制作装备】暗影赫尔墨斯站精英材料，用于制作T10+级神话装备。', sublimationLevel: 0,
  },
  'mat_hermes_shadow_core': {
    id: 'mat_hermes_shadow_core', name: '暗影赫尔墨斯核心', type: ItemType.MATERIAL, rarity: ItemRarity.RARE,
    description: '【制作装备】暗影赫尔墨斯站Boss材料，用于制作高级神话装备。', sublimationLevel: 0,
  },

  // ============================================
  // 神话站台材料 - 站台23：冥府哈迪斯站
  // ============================================
  'mat_pluto_shadow': {
    id: 'mat_pluto_shadow', name: '冥王暗影', type: ItemType.MATERIAL, rarity: ItemRarity.COMMON,
    description: '【制作装备】哈迪斯站材料，用于制作T11级神话装备。', sublimationLevel: 0,
  },
  'mat_death_essence': {
    id: 'mat_death_essence', name: '死亡精华', type: ItemType.MATERIAL, rarity: ItemRarity.UNCOMMON,
    description: '【制作装备】哈迪斯站精英材料，用于制作T11级神话装备。', sublimationLevel: 0,
  },
  'mat_hades_core': {
    id: 'mat_hades_core', name: '哈迪斯核心', type: ItemType.MATERIAL, rarity: ItemRarity.RARE,
    description: '【制作装备】哈迪斯站Boss材料，用于制作高级神话装备。', sublimationLevel: 0,
  },

  // ============================================
  // 神话站台材料 - 站台24：魔法赫卡忒站
  // ============================================
  'mat_magic_crystal': {
    id: 'mat_magic_crystal', name: '魔法结晶', type: ItemType.MATERIAL, rarity: ItemRarity.COMMON,
    description: '【制作装备】赫卡忒站材料，用于制作T11级神话装备。', sublimationLevel: 0,
  },
  'mat_witch_rune': {
    id: 'mat_witch_rune', name: '女巫符文', type: ItemType.MATERIAL, rarity: ItemRarity.UNCOMMON,
    description: '【制作装备】赫卡忒站精英材料，用于制作T11级神话装备。', sublimationLevel: 0,
  },
  'mat_hecate_core': {
    id: 'mat_hecate_core', name: '赫卡忒核心', type: ItemType.MATERIAL, rarity: ItemRarity.RARE,
    description: '【制作装备】赫卡忒站Boss材料，用于制作高级神话装备。', sublimationLevel: 0,
  },

  // ============================================
  // 神话站台材料 - 站台25：黑夜倪克斯站
  // ============================================
  'mat_night_shadow': {
    id: 'mat_night_shadow', name: '黑夜暗影', type: ItemType.MATERIAL, rarity: ItemRarity.COMMON,
    description: '【制作装备】倪克斯站材料，用于制作T11级传说装备。', sublimationLevel: 0,
  },
  'mat_star_dust': {
    id: 'mat_star_dust', name: '星尘', type: ItemType.MATERIAL, rarity: ItemRarity.UNCOMMON,
    description: '【制作装备】倪克斯站精英材料，用于制作T11级传说装备。', sublimationLevel: 0,
  },
  'mat_nyx_core': {
    id: 'mat_nyx_core', name: '倪克斯核心', type: ItemType.MATERIAL, rarity: ItemRarity.RARE,
    description: '【制作装备】倪克斯站Boss材料，用于制作高级传说装备。', sublimationLevel: 0,
  },

  // ============================================
  // 神话站台材料 - 站台26：爱箭厄洛斯站
  // ============================================
  'mat_love_essence': {
    id: 'mat_love_essence', name: '爱情精华', type: ItemType.MATERIAL, rarity: ItemRarity.COMMON,
    description: '【制作装备】厄洛斯站材料，用于制作T10+级传说装备。', sublimationLevel: 0,
  },
  'mat_heart_crystal': {
    id: 'mat_heart_crystal', name: '心之结晶', type: ItemType.MATERIAL, rarity: ItemRarity.UNCOMMON,
    description: '【制作装备】厄洛斯站精英材料，用于制作T10+级传说装备。', sublimationLevel: 0,
  },
  'mat_eros_core': {
    id: 'mat_eros_core', name: '厄洛斯核心', type: ItemType.MATERIAL, rarity: ItemRarity.RARE,
    description: '【制作装备】厄洛斯站Boss材料，用于制作高级传说装备。', sublimationLevel: 0,
  },

  // ============================================
  // 神话站台材料 - 站台27：死亡塔纳托斯站
  // ============================================
  'mat_death_breath': {
    id: 'mat_death_breath', name: '死亡气息', type: ItemType.MATERIAL, rarity: ItemRarity.COMMON,
    description: '【制作装备】塔纳托斯站材料，用于制作T11+级传说装备。', sublimationLevel: 0,
  },
  'mat_soul_shard': {
    id: 'mat_soul_shard', name: '灵魂碎片', type: ItemType.MATERIAL, rarity: ItemRarity.UNCOMMON,
    description: '【制作装备】塔纳托斯站精英材料，用于制作T11+级传说装备。', sublimationLevel: 0,
  },
  'mat_thanatos_core': {
    id: 'mat_thanatos_core', name: '塔纳托斯核心', type: ItemType.MATERIAL, rarity: ItemRarity.RARE,
    description: '【制作装备】塔纳托斯站Boss材料，用于制作高级传说装备。', sublimationLevel: 0,
  },

  // ============================================
  // 神话站台材料 - 站台28：黑暗霍德尔站
  // ============================================
  'mat_dark_mist': {
    id: 'mat_dark_mist', name: '黑暗迷雾', type: ItemType.MATERIAL, rarity: ItemRarity.COMMON,
    description: '【制作装备】霍德尔站材料，用于制作T11级传说装备。', sublimationLevel: 0,
  },
  'mat_blind_essence': {
    id: 'mat_blind_essence', name: '盲目精华', type: ItemType.MATERIAL, rarity: ItemRarity.UNCOMMON,
    description: '【制作装备】霍德尔站精英材料，用于制作T11级传说装备。', sublimationLevel: 0,
  },
  'mat_hodr_core': {
    id: 'mat_hodr_core', name: '霍德尔核心', type: ItemType.MATERIAL, rarity: ItemRarity.RARE,
    description: '【制作装备】霍德尔站Boss材料，用于制作高级传说装备。', sublimationLevel: 0,
  },

  // ============================================
  // 神话站台材料 - 站台29：森林维达站
  // ============================================
  'mat_forest_blessing': {
    id: 'mat_forest_blessing', name: '森林祝福', type: ItemType.MATERIAL, rarity: ItemRarity.COMMON,
    description: '【制作装备】维达站材料，用于制作T11级传说装备。', sublimationLevel: 0,
  },
  'mat_nature_essence': {
    id: 'mat_nature_essence', name: '自然精华', type: ItemType.MATERIAL, rarity: ItemRarity.UNCOMMON,
    description: '【制作装备】维达站精英材料，用于制作T11级传说装备。', sublimationLevel: 0,
  },
  'mat_vidar_core': {
    id: 'mat_vidar_core', name: '维达核心', type: ItemType.MATERIAL, rarity: ItemRarity.RARE,
    description: '【制作装备】维达站Boss材料，用于制作高级传说装备。', sublimationLevel: 0,
  },

  // ============================================
  // 神话站台材料 - 站台30：复仇瓦利站
  // ============================================
  'mat_vengeance_mark': {
    id: 'mat_vengeance_mark', name: '复仇印记', type: ItemType.MATERIAL, rarity: ItemRarity.COMMON,
    description: '【制作装备】瓦利站材料，用于制作T11+级传说装备。', sublimationLevel: 0,
  },
  'mat_wrath_essence': {
    id: 'mat_wrath_essence', name: '愤怒精华', type: ItemType.MATERIAL, rarity: ItemRarity.UNCOMMON,
    description: '【制作装备】瓦利站精英材料，用于制作T11+级传说装备。', sublimationLevel: 0,
  },
  'mat_vali_core': {
    id: 'mat_vali_core', name: '瓦利核心', type: ItemType.MATERIAL, rarity: ItemRarity.RARE,
    description: '【制作装备】瓦利站Boss材料，用于制作高级传说装备。', sublimationLevel: 0,
  },

  // ============================================
  // 神话站台材料 - 站台31：狩猎乌勒尔站
  // ============================================
  'mat_hunt_trophy': {
    id: 'mat_hunt_trophy', name: '狩猎战利品', type: ItemType.MATERIAL, rarity: ItemRarity.COMMON,
    description: '【制作装备】乌勒尔站材料，用于制作T11+级传说装备。', sublimationLevel: 0,
  },
  'mat_snow_crystal': {
    id: 'mat_snow_crystal', name: '冰雪结晶', type: ItemType.MATERIAL, rarity: ItemRarity.UNCOMMON,
    description: '【制作装备】乌勒尔站精英材料，用于制作T11+级传说装备。', sublimationLevel: 0,
  },
  'mat_ullr_core': {
    id: 'mat_ullr_core', name: '乌勒尔核心', type: ItemType.MATERIAL, rarity: ItemRarity.RARE,
    description: '【制作装备】乌勒尔站Boss材料，用于制作高级传说装备。', sublimationLevel: 0,
  },

  // ============================================
  // 神话站台材料 - 站台32：大地希芙站
  // ============================================
  'mat_earth_blessing': {
    id: 'mat_earth_blessing', name: '大地祝福', type: ItemType.MATERIAL, rarity: ItemRarity.COMMON,
    description: '【制作装备】希芙站材料，用于制作T12级传说装备。', sublimationLevel: 0,
  },
  'mat_golden_hair': {
    id: 'mat_golden_hair', name: '金发', type: ItemType.MATERIAL, rarity: ItemRarity.UNCOMMON,
    description: '【制作装备】希芙站精英材料，用于制作T12级传说装备。', sublimationLevel: 0,
  },
  'mat_sif_core': {
    id: 'mat_sif_core', name: '希芙核心', type: ItemType.MATERIAL, rarity: ItemRarity.RARE,
    description: '【制作装备】希芙站Boss材料，用于制作高级传说装备。', sublimationLevel: 0,
  },

  // ============================================
  // 制造系统材料 - 6种基础材料，5种品质
  // ============================================
  // 铁矿碎片
  'craft_iron': {
    id: 'craft_iron', name: '铁矿碎片', type: ItemType.MATERIAL, rarity: ItemRarity.COMMON,
    description: '从废弃矿脉中采集的铁矿碎片，制造装备的基础材料', sublimationLevel: 0,
  },
  'craft_优质iron': {
    id: 'craft_优质iron', name: '优质铁矿碎片', type: ItemType.MATERIAL, rarity: ItemRarity.UNCOMMON,
    description: '品质较好的铁矿碎片，制造装备的基础材料', sublimationLevel: 0,
  },
  'craft_精良iron': {
    id: 'craft_精良iron', name: '精良铁矿碎片', type: ItemType.MATERIAL, rarity: ItemRarity.RARE,
    description: '精良的铁矿碎片，制造装备的基础材料', sublimationLevel: 0,
  },
  'craft_稀有iron': {
    id: 'craft_稀有iron', name: '稀有铁矿碎片', type: ItemType.MATERIAL, rarity: ItemRarity.EPIC,
    description: '稀有的铁矿碎片，制造高级装备的材料', sublimationLevel: 0,
  },
  'craft_传说iron': {
    id: 'craft_传说iron', name: '传说铁矿碎片', type: ItemType.MATERIAL, rarity: ItemRarity.LEGENDARY,
    description: '传说中的铁矿碎片，制造顶级装备的材料', sublimationLevel: 0,
  },
  // 野兽皮革
  'craft_leather': {
    id: 'craft_leather', name: '野兽皮革', type: ItemType.MATERIAL, rarity: ItemRarity.COMMON,
    description: '荒原野兽的皮革，坚韧耐用', sublimationLevel: 0,
  },
  'craft_优质leather': {
    id: 'craft_优质leather', name: '优质野兽皮革', type: ItemType.MATERIAL, rarity: ItemRarity.UNCOMMON,
    description: '品质较好的野兽皮革，坚韧耐用', sublimationLevel: 0,
  },
  'craft_精良leather': {
    id: 'craft_精良leather', name: '精良野兽皮革', type: ItemType.MATERIAL, rarity: ItemRarity.RARE,
    description: '精良的野兽皮革，制造装备的上好材料', sublimationLevel: 0,
  },
  'craft_稀有leather': {
    id: 'craft_稀有leather', name: '稀有野兽皮革', type: ItemType.MATERIAL, rarity: ItemRarity.EPIC,
    description: '稀有的野兽皮革，制造高级装备的材料', sublimationLevel: 0,
  },
  'craft_传说leather': {
    id: 'craft_传说leather', name: '传说野兽皮革', type: ItemType.MATERIAL, rarity: ItemRarity.LEGENDARY,
    description: '传说中的野兽皮革，制造顶级装备的材料', sublimationLevel: 0,
  },
  // 粗布纤维
  'craft_fabric': {
    id: 'craft_fabric', name: '粗布纤维', type: ItemType.MATERIAL, rarity: ItemRarity.COMMON,
    description: '废弃布料拆解而成的纤维，可用于制作防具', sublimationLevel: 0,
  },
  'craft_优质fabric': {
    id: 'craft_优质fabric', name: '优质粗布纤维', type: ItemType.MATERIAL, rarity: ItemRarity.UNCOMMON,
    description: '品质较好的粗布纤维，可用于制作防具', sublimationLevel: 0,
  },
  'craft_精良fabric': {
    id: 'craft_精良fabric', name: '精良粗布纤维', type: ItemType.MATERIAL, rarity: ItemRarity.RARE,
    description: '精良的粗布纤维，制作防具的上好材料', sublimationLevel: 0,
  },
  'craft_稀有fabric': {
    id: 'craft_稀有fabric', name: '稀有粗布纤维', type: ItemType.MATERIAL, rarity: ItemRarity.EPIC,
    description: '稀有的粗布纤维，制作高级防具的材料', sublimationLevel: 0,
  },
  'craft_传说fabric': {
    id: 'craft_传说fabric', name: '传说粗布纤维', type: ItemType.MATERIAL, rarity: ItemRarity.LEGENDARY,
    description: '传说中的粗布纤维，制作顶级防具的材料', sublimationLevel: 0,
  },
  // 坚韧木材
  'craft_wood': {
    id: 'craft_wood', name: '坚韧木材', type: ItemType.MATERIAL, rarity: ItemRarity.COMMON,
    description: '荒原上生长的坚韧木材，适合制作武器和靴柄', sublimationLevel: 0,
  },
  'craft_优质wood': {
    id: 'craft_优质wood', name: '优质坚韧木材', type: ItemType.MATERIAL, rarity: ItemRarity.UNCOMMON,
    description: '品质较好的坚韧木材，适合制作武器和靴柄', sublimationLevel: 0,
  },
  'craft_精良wood': {
    id: 'craft_精良wood', name: '精良坚韧木材', type: ItemType.MATERIAL, rarity: ItemRarity.RARE,
    description: '精良的坚韧木材，制作武器的上好材料', sublimationLevel: 0,
  },
  'craft_稀有wood': {
    id: 'craft_稀有wood', name: '稀有坚韧木材', type: ItemType.MATERIAL, rarity: ItemRarity.EPIC,
    description: '稀有的坚韧木材，制作高级武器的材料', sublimationLevel: 0,
  },
  'craft_传说wood': {
    id: 'craft_传说wood', name: '传说坚韧木材', type: ItemType.MATERIAL, rarity: ItemRarity.LEGENDARY,
    description: '传说中的坚韧木材，制作顶级武器的材料', sublimationLevel: 0,
  },
  // 能量水晶
  'craft_crystal': {
    id: 'craft_crystal', name: '能量水晶', type: ItemType.MATERIAL, rarity: ItemRarity.COMMON,
    description: '蕴含神秘能量的水晶，可提升装备品质', sublimationLevel: 0,
  },
  'craft_优质crystal': {
    id: 'craft_优质crystal', name: '优质能量水晶', type: ItemType.MATERIAL, rarity: ItemRarity.UNCOMMON,
    description: '品质较好的能量水晶，可提升装备品质', sublimationLevel: 0,
  },
  'craft_精良crystal': {
    id: 'craft_精良crystal', name: '精良能量水晶', type: ItemType.MATERIAL, rarity: ItemRarity.RARE,
    description: '精良的能量水晶，提升装备品质的上好材料', sublimationLevel: 0,
  },
  'craft_稀有crystal': {
    id: 'craft_稀有crystal', name: '稀有能量水晶', type: ItemType.MATERIAL, rarity: ItemRarity.EPIC,
    description: '稀有的能量水晶，提升高级装备品质的材料', sublimationLevel: 0,
  },
  'craft_传说crystal': {
    id: 'craft_传说crystal', name: '传说能量水晶', type: ItemType.MATERIAL, rarity: ItemRarity.LEGENDARY,
    description: '传说中的能量水晶，提升顶级装备品质的材料', sublimationLevel: 0,
  },
  // 怪物精华
  'craft_essence': {
    id: 'craft_essence', name: '怪物精华', type: ItemType.MATERIAL, rarity: ItemRarity.COMMON,
    description: '从变异怪物体内提取的精华，用于制造高级装备', sublimationLevel: 0,
  },
  'craft_优质essence': {
    id: 'craft_优质essence', name: '优质怪物精华', type: ItemType.MATERIAL, rarity: ItemRarity.UNCOMMON,
    description: '品质较好的怪物精华，用于制造高级装备', sublimationLevel: 0,
  },
  'craft_精良essence': {
    id: 'craft_精良essence', name: '精良怪物精华', type: ItemType.MATERIAL, rarity: ItemRarity.RARE,
    description: '精良的怪物精华，制造高级装备的上好材料', sublimationLevel: 0,
  },
  'craft_稀有essence': {
    id: 'craft_稀有essence', name: '稀有怪物精华', type: ItemType.MATERIAL, rarity: ItemRarity.EPIC,
    description: '稀有的怪物精华，制造顶级装备的材料', sublimationLevel: 0,
  },
  'craft_传说essence': {
    id: 'craft_传说essence', name: '传说怪物精华', type: ItemType.MATERIAL, rarity: ItemRarity.LEGENDARY,
    description: '传说中的怪物精华，制造传说装备的材料', sublimationLevel: 0,
  },

  // ============================================
  // 强化系统材料
  // ============================================
  'mat_enhance_stone': {
    id: 'mat_enhance_stone', name: '强化石', type: ItemType.MATERIAL, rarity: ItemRarity.UNCOMMON,
    description: '用于强化装备的神秘石头，蕴含着提升装备力量的能量', sublimationLevel: 0,
  },

  // ============================================
  // 分解系统材料 - 精炼碎片（普通装备分解获得）
  // ============================================
  'mat_refined_fragment': {
    id: 'mat_refined_fragment', name: '精炼碎片', type: ItemType.MATERIAL, rarity: ItemRarity.UNCOMMON,
    description: '分解普通装备获得的精炼碎片，用于制造装备。普通=1个,优秀=2个,稀有=3个,史诗=4个,传说=5个', sublimationLevel: 0,
  },

  // ============================================
  // 分解系统材料 - 神话碎片（神话装备分解获得）
  // ============================================
  'mat_mythic_fragment': {
    id: 'mat_mythic_fragment', name: '神话碎片', type: ItemType.MATERIAL, rarity: ItemRarity.MYTHIC,
    description: '分解神话装备获得的神话碎片，用于制造神话装备。数量=品质等级(1-6)', sublimationLevel: 0,
  },

  // ============================================
  // 基础采集材料 - 太空主题
  // ============================================
  'mat_001': {
    id: 'mat_001', name: '铁矿碎片', type: ItemType.MATERIAL, rarity: ItemRarity.COMMON,
    description: '从星球表面采集的铁矿碎片，基础制造材料。', sublimationLevel: 0,
  },
  'mat_002': {
    id: 'mat_002', name: '铜矿碎片', type: ItemType.MATERIAL, rarity: ItemRarity.COMMON,
    description: '从星球表面采集的铜矿碎片，基础制造材料。', sublimationLevel: 0,
  },
  'mat_003': {
    id: 'mat_003', name: '钛合金碎片', type: ItemType.MATERIAL, rarity: ItemRarity.UNCOMMON,
    description: '稀有的钛合金碎片，高级制造材料。', sublimationLevel: 0,
  },
  'mat_004': {
    id: 'mat_004', name: '能量晶体', type: ItemType.MATERIAL, rarity: ItemRarity.UNCOMMON,
    description: '蕴含能量的晶体，用于能源相关制造。', sublimationLevel: 0,
  },
  'mat_005': {
    id: 'mat_005', name: '稀土元素', type: ItemType.MATERIAL, rarity: ItemRarity.RARE,
    description: '珍贵的稀土元素，用于高科技制造。', sublimationLevel: 0,
  },
  'mat_006': {
    id: 'mat_006', name: '虚空核心', type: ItemType.MATERIAL, rarity: ItemRarity.RARE,
    description: '从虚空生物体内提取的核心，蕴含神秘能量。', sublimationLevel: 0,
  },
  'mat_007': {
    id: 'mat_007', name: '星际燃料', type: ItemType.MATERIAL, rarity: ItemRarity.COMMON,
    description: '航船和设备的常用燃料。', sublimationLevel: 0,
  },
  'mat_008': {
    id: 'mat_008', name: '纳米纤维', type: ItemType.MATERIAL, rarity: ItemRarity.UNCOMMON,
    description: '高科技纳米材料，用于制造防护装备。', sublimationLevel: 0,
  },
  'mat_009': {
    id: 'mat_009', name: '陨石碎片', type: ItemType.MATERIAL, rarity: ItemRarity.UNCOMMON,
    description: '来自外太空的陨石碎片，含有稀有金属。', sublimationLevel: 0,
  },
  'mat_010': {
    id: 'mat_010', name: '量子螺丝', type: ItemType.MATERIAL, rarity: ItemRarity.RARE,
    description: '精密量子设备专用零件。', sublimationLevel: 0,
  },
};

// 获取物品模板
export function getItemTemplate(itemId: string): Item | undefined {
  return ITEMS[itemId];
}

// 创建物品实例
export function createItem(itemId: string, quantity: number = 1) {
  const template = getItemTemplate(itemId);
  if (!template) return null;

  return {
    ...template,
    quantity,
    equipped: false,
    sublimationLevel: 0,
    sublimationProgress: 0,
    isSublimated: false,
    enhanceLevel: 0,
  };
}
