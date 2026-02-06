import type { InventoryItem } from '../data/types';
import { ItemType } from '../data/types';
import { calculateEnhanceBonus } from './EnhanceSystem';
import { EquipmentSlot } from '../data/equipmentTypes';
import { EquipmentInstance, CalculatedStats, equipmentSystem } from './EquipmentSystem';

export interface PlayerData {
  name: string;
  level: number;
  exp: number;
  hp: number;
  maxHp: number;
  stamina: number;
  maxStamina: number;
  spirit: number;
  maxSpirit: number;
  hunger: number;
  maxHunger: number;
  thirst: number;
  maxThirst: number;
  attack: number;
  defense: number;
  attackSpeed: number;
  weapon: InventoryItem | null;
  armor: InventoryItem | null;
  accessory: InventoryItem | null;
  equipment: EquipmentInstance[];
  lastSpiritRecoveryTime?: number; // 上次精神值回复时间戳（毫秒）
}

export class Player {
  name: string;
  level: number;
  exp: number;
  expToNext: number;

  // 基础属性
  hp: number;
  maxHp: number;
  stamina: number;
  maxStamina: number;
  spirit: number;
  maxSpirit: number;

  // 生存属性
  hunger: number;
  maxHunger: number;
  thirst: number;
  maxThirst: number;

  // 战斗属性（基础值）
  baseAttack: number;
  baseDefense: number;
  baseAgility: number; // 敏捷
  baseAttackSpeed: number;
  baseHit: number;
  baseDodge: number;
  baseCrit: number; // 会心
  baseCritDamage: number;
  basePenetration: number; // 穿透固定值
  basePenetrationPercent: number; // 穿透百分比
  baseTrueDamage: number;
  baseGuard: number; // 护心
  baseLuck: number; // 幸运

  // 装备系统（6槽位）
  equipment: Map<EquipmentSlot, EquipmentInstance>;

  constructor(data?: Partial<PlayerData>) {
    this.name = data?.name || '幸存者';
    this.level = data?.level || 1;
    this.exp = data?.exp || 0;
    this.expToNext = this.calculateExpToNext();

    // 使用新公式计算基础属性
    const attrs = this.levelAttributes;

    this.maxHp = data?.maxHp || attrs.maxHp;
    this.hp = data?.hp || this.maxHp;

    this.maxStamina = data?.maxStamina || attrs.maxStamina;
    this.stamina = data?.stamina || this.maxStamina;

    this.maxSpirit = data?.maxSpirit || attrs.maxSpirit;
    this.spirit = data?.spirit || this.maxSpirit;

    this.maxHunger = data?.maxHunger || 100;
    this.hunger = data?.hunger || this.maxHunger;

    this.maxThirst = data?.maxThirst || 100;
    this.thirst = data?.thirst || this.maxThirst;

    this.baseAttack = data?.attack || attrs.baseAttack;
    this.baseDefense = data?.defense || attrs.baseDefense;
    this.baseAgility = attrs.baseAgility || 10;
    this.baseAttackSpeed = data?.attackSpeed || 1.0;
    this.baseHit = attrs.baseHit;
    this.baseDodge = attrs.baseDodge;
    this.baseCrit = attrs.baseCrit; // 会心
    this.baseCritDamage = 50;
    this.basePenetration = 0; // 穿透固定值
    this.basePenetrationPercent = 0; // 穿透百分比
    this.baseTrueDamage = 0;
    this.baseGuard = attrs.baseGuard; // 护心
    this.baseLuck = attrs.baseLuck; // 幸运

    // 初始化装备槽位
    this.equipment = new Map();
    if (data?.equipment) {
      data.equipment.forEach(item => {
        if (item.equipped) {
          this.equipment.set(item.slot, item);
        }
      });
    }
  }

  // 计算升级所需经验 - 分段式指数成长
  private calculateExpToNext(): number {
    if (this.level <= 10) {
      // 1-10级：线性增长
      return Math.floor(100 * this.level * 1.2);
    } else if (this.level <= 50) {
      // 11-50级：指数增长
      const baseExp = 100 * 10 * 1.2;
      return Math.floor(baseExp * Math.pow(1.15, this.level - 10));
    } else {
      // 51级以上：对数增长
      const baseExp = 100 * 10 * 1.2 * Math.pow(1.15, 40);
      return Math.floor(baseExp * (1 + Math.log(this.level - 49) * 0.1));
    }
  }

  // 计算属性值 - 每级提升10%（基于初始数值，叠乘）
  private calculateAttribute(baseValue: number, level: number): number {
    // 每级提升10%，基于初始数值叠乘
    return baseValue * Math.pow(1.1, level - 1);
  }

  // 获取当前等级的属性值
  get levelAttributes() {
    return {
      maxHp: Math.floor(this.calculateAttribute(100, this.level)),
      maxStamina: 100 + (this.level - 1) * 10, // 每级固定+10
      maxSpirit: 100 + (this.level - 1) * 10, // 每级固定+10
      baseAttack: Math.floor(this.calculateAttribute(10, this.level)),
      baseDefense: Math.floor(this.calculateAttribute(5, this.level)),
      baseAgility: Math.floor(10 * (1 + this.level * 0.1)), // 敏捷：10*(1+等级*0.1)
      baseHit: Math.floor(this.calculateAttribute(50, this.level)),
      baseDodge: 5, // 固定5%，不随等级提升
      baseCrit: 5, // 会心，固定5，不随等级提升
      baseCritDamage: 50, // 固定值
      basePenetration: 0, // 穿透固定值
      basePenetrationPercent: 0, // 穿透百分比
      baseTrueDamage: 0, // 固定值
      baseGuard: 5, // 护心，固定5，不随等级提升
      baseLuck: 0, // 幸运，初始0，不随等级提升
    };
  }

  // 获取装备列表
  get equippedItems(): EquipmentInstance[] {
    return Array.from(this.equipment.values());
  }

  // 获取装备属性加成
  get equipmentStats(): CalculatedStats {
    return equipmentSystem.calculateEquipmentStats(this.equippedItems);
  }

  // 获取总攻击力（基础+装备+强化）
  get totalAttack(): number {
    const equipmentAttack = this.equipmentStats.attack;
    return this.baseAttack + equipmentAttack;
  }

  // 获取总防御力
  get totalDefense(): number {
    const equipmentDefense = this.equipmentStats.defense;
    return this.baseDefense + equipmentDefense;
  }

  // 获取总敏捷
  get totalAgility(): number {
    return this.baseAgility + this.equipmentStats.agility;
  }

  // 获取总攻速
  get totalAttackSpeed(): number {
    const equipmentSpeed = this.equipmentStats.speed;
    return this.baseAttackSpeed + equipmentSpeed;
  }

  // 获取总命中值
  get totalHit(): number {
    return this.baseHit + this.equipmentStats.hit;
  }

  // 获取总闪避值
  get totalDodge(): number {
    return this.baseDodge + this.equipmentStats.dodge;
  }

  // 获取总暴击率
  get totalCrit(): number {
    return this.baseCrit + this.equipmentStats.crit;
  }

  // 获取总暴击伤害
  get totalCritDamage(): number {
    return this.baseCritDamage + this.equipmentStats.critDamage;
  }

  // 获取总穿透固定值
  get totalPenetration(): number {
    return this.basePenetration + this.equipmentStats.penetration;
  }

  // 获取总穿透百分比
  get totalPenetrationPercent(): number {
    return this.basePenetrationPercent + this.equipmentStats.penetrationPercent;
  }

  // 获取总真实伤害倍率
  get totalTrueDamage(): number {
    return this.baseTrueDamage + this.equipmentStats.trueDamage;
  }

  // 获取总护心
  get totalGuard(): number {
    return this.baseGuard + this.equipmentStats.guard;
  }

  // 获取总幸运
  get totalLuck(): number {
    return this.baseLuck + this.equipmentStats.luck;
  }

  // 获取总生命值
  get totalMaxHp(): number {
    const equipmentHp = this.equipmentStats.hp;
    return this.maxHp + equipmentHp;
  }

  // 计算减伤比 = 防御力 / (防御力 + 600) * 100%
  get damageReduction(): number {
    const defense = this.totalDefense;
    return (defense / (defense + 600)) * 100;
  }

  // 计算最终减伤比（考虑穿透）= (防御力 - 穿透固定值) / (防御力 + 600) * 100% - 穿透百分比
  get finalDamageReduction(): number {
    const defense = Math.max(0, this.totalDefense - this.totalPenetration);
    const reduction = (defense / (defense + 600)) * 100;
    return Math.max(0, reduction - this.totalPenetrationPercent);
  }

  // 获取战力
  get power(): number {
    const basePower = equipmentSystem.calculatePower({
      attack: this.totalAttack,
      defense: this.totalDefense,
      hp: this.totalMaxHp,
      hit: this.totalHit,
      dodge: this.totalDodge,
      speed: this.totalAttackSpeed,
      crit: this.totalCrit,
      critDamage: this.totalCritDamage,
      penetration: this.totalPenetration,
      trueDamage: this.totalTrueDamage,
    });
    return Math.floor(basePower);
  }

  // 受到伤害
  takeDamage(amount: number): void {
    // 伤害已经在战斗系统中计算完成，直接扣除
    this.hp = Math.max(0, this.hp - amount);
  }

  // 治疗
  heal(amount: number): void {
    this.hp = Math.min(this.totalMaxHp, this.hp + amount);
  }

  // 恢复体力
  recoverStamina(amount: number): void {
    this.stamina = Math.min(this.maxStamina, this.stamina + amount);
  }

  // 消耗体力
  consumeStamina(amount: number): boolean {
    if (this.stamina < amount) return false;
    this.stamina -= amount;
    return true;
  }

  // 消耗精神值
  consumeSpirit(amount: number): boolean {
    if (this.spirit < amount) return false;
    this.spirit -= amount;
    return true;
  }

  // 增加经验
  addExp(amount: number): string[] {
    const logs: string[] = [];
    this.exp += amount;

    while (this.exp >= this.expToNext) {
      this.exp -= this.expToNext;
      this.levelUp();
      logs.push(`升级！达到 ${this.level} 级`);
    }

    return logs;
  }

  // 升级
  private levelUp(): void {
    this.level++;
    this.expToNext = this.calculateExpToNext();

    // 使用新公式计算属性
    const attrs = this.levelAttributes;
    this.maxHp = attrs.maxHp;
    this.hp = this.maxHp;
    this.maxStamina = attrs.maxStamina;
    this.stamina = this.maxStamina;
    this.maxSpirit = attrs.maxSpirit;
    this.spirit = this.maxSpirit;
    this.baseAttack = attrs.baseAttack;
    this.baseDefense = attrs.baseDefense;
    this.baseHit = attrs.baseHit;
    this.baseDodge = attrs.baseDodge;
    this.baseCrit = attrs.baseCrit;
  }

  // 装备普通物品（来自制造系统）
  equipInventoryItem(item: InventoryItem): boolean {
    // 计算装备前的总生命值
    const oldMaxHp = this.totalMaxHp;

    // 获取槽位
    const slot = item.slot as EquipmentSlot;
    if (!slot) {
      return false;
    }

    // 卸下该槽位已有装备
    const existing = this.equipment.get(slot);
    if (existing) {
      existing.equipped = false;
    }

    // 将 InventoryItem 转换为 EquipmentInstance
    const equipmentInstance: EquipmentInstance = {
      id: item.id,
      instanceId: `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: item.name,
      slot: slot,
      rarity: item.rarity,
      level: 1,
      stationId: 'crafted',
      stationNumber: 0,
      description: item.description,
      stats: {
        attack: item.attack || 0,
        defense: item.defense || 0,
        hp: item.maxHp || 0,
        speed: item.speed || 0,
        crit: item.critRate || 0,
        critDamage: item.critDamage || 0,
        dodge: item.dodgeRate || 0,
        hit: item.hitRate || 0,
        penetration: 0,
      },
      effects: [],
      quantity: 1,
      equipped: true,
      enhanceLevel: item.enhanceLevel || 0,
      sublimationLevel: item.sublimationLevel || 0,
    };

    // 装备新物品
    this.equipment.set(slot, equipmentInstance);
    item.equipped = true;

    // 计算装备后的总生命值，并相应调整当前生命值
    const newMaxHp = this.totalMaxHp;
    const hpDiff = newMaxHp - oldMaxHp;
    this.hp = Math.min(newMaxHp, this.hp + hpDiff);

    return true;
  }

  // 卸下指定槽位的装备
  unequipSlot(slot: EquipmentSlot): void {
    // 计算卸下前的总生命值
    const oldMaxHp = this.totalMaxHp;

    const item = this.equipment.get(slot);
    if (item) {
      item.equipped = false;
      this.equipment.delete(slot);

      // 计算卸下后的总生命值，并相应调整当前生命值
      const newMaxHp = this.totalMaxHp;
      const hpDiff = newMaxHp - oldMaxHp;
      this.hp = Math.min(newMaxHp, Math.max(1, this.hp + hpDiff));
    }
  }

  // 装备新系统装备
  equipMythologyItem(item: EquipmentInstance): boolean {
    // 计算装备前的总生命值
    const oldMaxHp = this.totalMaxHp;

    // 卸下该槽位已有装备
    const existing = this.equipment.get(item.slot);
    if (existing) {
      existing.equipped = false;
    }

    // 装备新物品
    item.equipped = true;
    this.equipment.set(item.slot, item);

    // 计算装备后的总生命值，并相应调整当前生命值
    const newMaxHp = this.totalMaxHp;
    const hpDiff = newMaxHp - oldMaxHp;
    this.hp = Math.min(newMaxHp, this.hp + hpDiff);

    return true;
  }

  // 卸下新系统装备
  unequipMythologyItem(slot: EquipmentSlot): EquipmentInstance | null {
    // 计算卸下前的总生命值
    const oldMaxHp = this.totalMaxHp;

    const item = this.equipment.get(slot);
    if (item) {
      item.equipped = false;
      this.equipment.delete(slot);

      // 计算卸下后的总生命值，并相应调整当前生命值
      const newMaxHp = this.totalMaxHp;
      const hpDiff = newMaxHp - oldMaxHp;
      this.hp = Math.min(newMaxHp, Math.max(1, this.hp + hpDiff));

      return item;
    }
    return null;
  }

  // 获取指定槽位的装备
  getEquipmentBySlot(slot: EquipmentSlot): EquipmentInstance | undefined {
    return this.equipment.get(slot);
  }

  // 检查是否装备了某个套装的指定数量
  getSetPieceCount(stationNumber: number): number {
    return Array.from(this.equipment.values()).filter(
      item => item.stationNumber === stationNumber
    ).length;
  }

  // 获取所有套装效果
  getSetBonuses(): { description: string; effects: any[] }[] {
    const equippedIds = this.equippedItems.map(item => item.id);
    return equipmentSystem.calculateEquipmentStats(this.equippedItems) as any;
  }

  // 消耗饥饿值
  consumeHunger(amount: number): void {
    this.hunger = Math.max(0, this.hunger - amount);
  }

  // 消耗口渴值
  consumeThirst(amount: number): void {
    this.thirst = Math.max(0, this.thirst - amount);
  }

  // 恢复饥饿值
  recoverHunger(amount: number): void {
    this.hunger = Math.min(this.maxHunger, this.hunger + amount);
  }

  // 恢复口渴值
  recoverThirst(amount: number): void {
    this.thirst = Math.min(this.maxThirst, this.thirst + amount);
  }

  // 根据现实时间回复精神值（每小时回复10%）
  recoverSpiritByRealTime(lastRecoveryTime: number | undefined): { recovered: number; newTime: number } {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000; // 1小时的毫秒数

    // 如果没有上次回复时间，设置为当前时间
    if (!lastRecoveryTime) {
      return { recovered: 0, newTime: now };
    }

    // 计算经过了多少小时
    const elapsedMs = now - lastRecoveryTime;
    const elapsedHours = Math.floor(elapsedMs / oneHour);

    if (elapsedHours <= 0) {
      return { recovered: 0, newTime: lastRecoveryTime };
    }

    // 每小时回复10%最大精神值
    const recoveryPercent = 0.10;
    const recoveryPerHour = Math.floor(this.maxSpirit * recoveryPercent);
    const totalRecovery = recoveryPerHour * elapsedHours;

    const oldSpirit = this.spirit;
    this.spirit = Math.min(this.maxSpirit, this.spirit + totalRecovery);
    const actualRecovered = this.spirit - oldSpirit;

    // 更新上次回复时间（只计算完整的小时）
    const newRecoveryTime = lastRecoveryTime + (elapsedHours * oneHour);

    return { recovered: actualRecovered, newTime: newRecoveryTime };
  }

  // 检查是否死亡
  get isDead(): boolean {
    return this.hp <= 0;
  }

  // 序列化
  serialize(): PlayerData {
    return {
      name: this.name,
      level: this.level,
      exp: this.exp,
      hp: this.hp,
      maxHp: this.maxHp,
      stamina: this.stamina,
      maxStamina: this.maxStamina,
      spirit: this.spirit,
      maxSpirit: this.maxSpirit,
      hunger: this.hunger,
      maxHunger: this.maxHunger,
      thirst: this.thirst,
      maxThirst: this.maxThirst,
      attack: this.baseAttack,
      defense: this.baseDefense,
      attackSpeed: this.baseAttackSpeed,
      weapon: null,
      armor: null,
      accessory: null,
      equipment: this.equippedItems,
    };
  }
}
