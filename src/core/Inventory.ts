import type { InventoryItem } from '../data/types';
import { ItemType } from '../data/types';
import { createItem } from '../data/items';
import type { EquipmentInstance } from './EquipmentSystem';
import { EquipmentSlot } from '../data/equipmentTypes';

export class Inventory {
  items: InventoryItem[];
  equipment: EquipmentInstance[]; // 神话装备存储在这里
  maxSlots: number;

  constructor(items: InventoryItem[] = [], equipment: EquipmentInstance[] = [], maxSlots: number = 100) {
    this.items = items;
    this.equipment = equipment;
    this.maxSlots = maxSlots;
  }

  // 添加物品
  addItem(itemId: string, quantity: number = 1): boolean {
    // 检查是否可堆叠
    const existingItem = this.items.find(item => item.id === itemId && !item.equipped);

    if (existingItem) {
      // 堆叠
      existingItem.quantity += quantity;
      return true;
    }

    // 检查背包空间
    if (this.items.length >= this.maxSlots) {
      return false;
    }

    // 创建新物品
    const newItem = createItem(itemId, quantity);
    if (newItem) {
      this.items.push(newItem);
      return true;
    }

    return false;
  }

  // 添加神话装备到背包
  addEquipment(equipmentInstance: EquipmentInstance): boolean {
    // 检查背包空间
    if (this.equipment.length + this.items.length >= this.maxSlots) {
      return false;
    }
    this.equipment.push(equipmentInstance);
    return true;
  }

  // 移除神话装备
  removeEquipment(instanceId: string): boolean {
    const index = this.equipment.findIndex(e => e.instanceId === instanceId);
    if (index === -1) return false;
    this.equipment.splice(index, 1);
    return true;
  }

  // 获取背包装备
  getEquipment(instanceId: string): EquipmentInstance | undefined {
    return this.equipment.find(e => e.instanceId === instanceId);
  }

  // 移除物品
  removeItem(itemId: string, quantity: number = 1): boolean {
    const itemIndex = this.items.findIndex(item => item.id === itemId);
    if (itemIndex === -1) return false;

    const item = this.items[itemIndex];

    if (item.quantity > quantity) {
      item.quantity -= quantity;
    } else {
      // 如果装备中，先卸下
      if (item.equipped) {
        item.equipped = false;
      }
      this.items.splice(itemIndex, 1);
    }

    return true;
  }

  // 使用物品
  useItem(itemId: string): { success: boolean; message: string; effects?: any } {
    const item = this.items.find(i => i.id === itemId);
    if (!item) {
      return { success: false, message: '物品不存在' };
    }

    // 检查是否为消耗品
    if (item.type !== ItemType.CONSUMABLE) {
      return { success: false, message: '该物品无法使用' };
    }

    const effects: any = {};

    if (item.healHp) effects.healHp = item.healHp;
    if (item.healStamina) effects.healStamina = item.healStamina;
    if (item.healHunger) effects.healHunger = item.healHunger;
    if (item.healThirst) effects.healThirst = item.healThirst;

    // 减少数量
    if (item.quantity > 1) {
      item.quantity -= 1;
    } else {
      this.items = this.items.filter(i => i.id !== itemId);
    }

    return {
      success: true,
      message: `使用了 ${item.name}`,
      effects,
    };
  }

  // 装备物品
  equipItem(itemId: string): { success: boolean; message: string; previousItem?: InventoryItem | null } {
    const item = this.items.find(i => i.id === itemId);
    if (!item) {
      return { success: false, message: '物品不存在' };
    }

    // 检查是否为装备
    if (item.type !== ItemType.WEAPON && item.type !== ItemType.ARMOR && item.type !== ItemType.ACCESSORY) {
      return { success: false, message: '该物品无法装备' };
    }

    // 卸下同槽位的装备（使用slot字段区分不同部位）
    const previousItem = this.items.find(i => {
      if (!i.equipped) return false;
      // 如果有slot字段，按slot匹配；否则按type匹配（兼容旧数据）
      if (item.slot && i.slot) {
        return i.slot === item.slot;
      }
      return i.type === item.type;
    });
    if (previousItem) {
      previousItem.equipped = false;
    }

    // 装备新物品
    item.equipped = true;

    return {
      success: true,
      message: `装备了 ${item.name}`,
      previousItem: previousItem || null,
    };
  }

  // 卸下装备
  unequipItem(itemId: string): { success: boolean; message: string } {
    const item = this.items.find(i => i.id === itemId);
    if (!item) {
      return { success: false, message: '物品不存在' };
    }

    if (!item.equipped) {
      return { success: false, message: '物品未装备' };
    }

    item.equipped = false;

    return {
      success: true,
      message: `卸下了 ${item.name}`,
    };
  }

  // 获取已装备的物品（6个独立槽位）
  getEquippedItems(): {
    weapon: InventoryItem | null;
    head: InventoryItem | null;
    body: InventoryItem | null;
    legs: InventoryItem | null;
    feet: InventoryItem | null;
    accessory: InventoryItem | null;
  } {
    return {
      weapon: this.items.find(i => i.equipped && (i.slot === 'weapon' || i.type === ItemType.WEAPON)) || null,
      head: this.items.find(i => i.equipped && i.slot === 'head') || null,
      body: this.items.find(i => i.equipped && i.slot === 'body') || null,
      legs: this.items.find(i => i.equipped && i.slot === 'legs') || null,
      feet: this.items.find(i => i.equipped && i.slot === 'feet') || null,
      accessory: this.items.find(i => i.equipped && (i.slot === 'accessory' || i.type === ItemType.ACCESSORY)) || null,
    };
  }

  // 按类型获取物品
  getItemsByType(type: ItemType): InventoryItem[] {
    return this.items.filter(item => item.type === type);
  }

  // 获取物品数量
  getItemCount(itemId: string): number {
    const item = this.items.find(i => i.id === itemId);
    return item ? item.quantity : 0;
  }

  // 检查是否有物品
  hasItem(itemId: string, quantity: number = 1): boolean {
    return this.getItemCount(itemId) >= quantity;
  }

  // 获取物品
  getItem(itemId: string): InventoryItem | undefined {
    return this.items.find(i => i.id === itemId);
  }

  // 获取已用槽位
  get usedSlots(): number {
    return this.items.length;
  }

  // 获取所有物品
  getAllItems(): InventoryItem[] {
    return this.items;
  }

  // 序列化
  serialize(): { items: InventoryItem[]; equipment: EquipmentInstance[] } {
    return { items: this.items, equipment: this.equipment };
  }

  // 数据迁移：将旧格式的装备从 items 迁移到 equipment
  migrateOldEquipment(): { migrated: number; errors: string[] } {
    const result = { migrated: 0, errors: [] as string[] };
    const itemsToRemove: number[] = [];

    // 遍历所有 items，找出装备类型的物品
    this.items.forEach((item, index) => {
      // 检查是否为装备类型
      if (item.type !== ItemType.WEAPON &&
        item.type !== ItemType.ARMOR &&
        item.type !== ItemType.ACCESSORY) {
        return;
      }

      try {
        // 映射装备槽位
        let slot: EquipmentSlot;
        if (item.slot) {
          switch (item.slot) {
            case 'head': slot = EquipmentSlot.HEAD; break;
            case 'body': slot = EquipmentSlot.BODY; break;
            case 'legs': slot = EquipmentSlot.LEGS; break;
            case 'feet': slot = EquipmentSlot.FEET; break;
            case 'weapon': slot = EquipmentSlot.WEAPON; break;
            case 'accessory': slot = EquipmentSlot.ACCESSORY; break;
            default: slot = EquipmentSlot.WEAPON; break;
          }
        } else {
          switch (item.type) {
            case ItemType.WEAPON: slot = EquipmentSlot.WEAPON; break;
            case ItemType.ARMOR: slot = EquipmentSlot.BODY; break;
            case ItemType.ACCESSORY: slot = EquipmentSlot.ACCESSORY; break;
            default: slot = EquipmentSlot.WEAPON; break;
          }
        }

        // 创建新的 EquipmentInstance
        const equipmentInstance: EquipmentInstance = {
          id: item.id,
          name: item.name,
          slot: slot,
          rarity: item.rarity,
          level: 1,
          stationId: 'migrated',
          stationNumber: 0,
          description: item.description || '',
          stats: {
            attack: item.attack || 0,
            defense: item.defense || 0,
            hp: item.maxHp || 0,
            speed: item.speed || 0,
            hit: item.hitRate || 0,
            dodge: item.dodgeRate || 0,
            crit: item.critRate || 0,
            critDamage: item.critDamage || 0,
            penetration: item.penetration || 0,
            trueDamage: item.trueDamage || 0,
          },
          effects: item.effects || [],
          instanceId: `migrated_${item.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          quantity: item.quantity,
          equipped: item.equipped || false,
          enhanceLevel: item.enhanceLevel || 0,
          sublimationLevel: item.sublimationLevel || 0,
          isCrafted: true,
        };

        // 添加到 equipment 数组
        this.equipment.push(equipmentInstance);
        itemsToRemove.push(index);
        result.migrated++;
      } catch (error) {
        result.errors.push(`迁移装备 ${item.name} (${item.id}) 失败: ${error}`);
      }
    });

    // 从 items 中删除已迁移的装备（从后往前删除，避免索引错乱）
    for (let i = itemsToRemove.length - 1; i >= 0; i--) {
      this.items.splice(itemsToRemove[i], 1);
    }

    return result;
  }
}
