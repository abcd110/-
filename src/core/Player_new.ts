// 《星航荒宇》玩家系统
// 基于原有 Player.ts 改造，添加势力声望和神契者系统

import type { InventoryItem } from '../data/types_new';
import { ItemType } from '../data/types_new';
import { calculateEnhanceBonus } from './EnhanceSystem';
import { EquipmentSlot } from '../data/equipmentTypes';
import { EquipmentInstance, CalculatedStats, equipmentSystem } from './EquipmentSystem';
import {
  FactionReputation,
  FactionType,
  GodContractor,
  FactionStatus,
} from '../data/types_new';
import { createInitialReputations, modifyReputation, getReputation, getReputationStatus } from '../data/factions';

// ==================== 玩家数据接口 ====================

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
  equipment: EquipmentInstance[];
  lastSpiritRecoveryTime?: number;
  // 新增：星航荒宇系统
  factionReputations?: FactionReputation[];
  godContractor?: GodContractor | null;
}

// ==================== 玩家类 ====================

export class Player {
  // 基础信息
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
  baseAgility: number;
  baseAttackSpeed: number;
  baseHit: number;
  baseDodge: number;
  baseCrit: number;
  baseCritDamage: number;
  basePenetration: number;
  basePenetrationPercent: number;
  baseTrueDamage: number;
  baseGuard: number;
  baseLuck: number;

  // 装备系统（6槽位）
  equipment: Map<EquipmentSlot, EquipmentInstance>;

  // ==================== 星航荒宇新增系统 ====================

  // 势力声望系统
  factionReputations: FactionReputation[];

  // 神契者系统
  godContractor: GodContractor | null;

  constructor(data?: Partial<PlayerData>) {
    this.name = data?.name || '联邦拓荒队员';
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
    this.baseCrit = attrs.baseCrit;
    this.baseCritDamage = 50;
    this.basePenetration = 0;
    this.basePenetrationPercent = 0;
    this.baseTrueDamage = 0;
    this.baseGuard = attrs.baseGuard;
    this.baseLuck = attrs.baseLuck;

    // 初始化装备槽位
    this.equipment = new Map();
    if (data?.equipment) {
      data.equipment.forEach(item => {
        if (item.equipped) {
          this.equipment.set(item.slot, item);
        }
      });
    }

    // ==================== 初始化星航荒宇系统 ====================

    // 初始化势力声望
    this.factionReputations = data?.factionReputations || createInitialReputations();

    // 初始化神契者（新手玩家暂无）
    this.godContractor = data?.godContractor || null;
  }

  // ==================== 基础属性计算 ====================

  // 计算升级所需经验
  private calculateExpToNext(): number {
    if (this.level <= 10) {
      return Math.floor(100 * this.level * 1.2);
    } else if (this.level <= 50) {
      const baseExp = 100 * 10 * 1.2;
      return Math.floor(baseExp * Math.pow(1.15, this.level - 10));
    } else {
      const baseExp = 100 * 10 * 1.2 * Math.pow(1.15, 40);
      return Math.floor(baseExp * (1 + Math.log(this.level - 49) * 0.1));
    }
  }

  // 计算属性值
  private calculateAttribute(baseValue: number, level: number): number {
    return baseValue * Math.pow(1.1, level - 1);
  }

  // 获取当前等级的属性值
  get levelAttributes() {
    return {
      maxHp: Math.floor(this.calculateAttribute(100, this.level)),
      maxStamina: 100 + (this.level - 1) * 10,
      maxSpirit: 100 + (this.level - 1) * 10,
      baseAttack: Math.floor(this.calculateAttribute(10, this.level)),
      baseDefense: Math.floor(this.calculateAttribute(5, this.level)),
      baseAgility: Math.floor(10 * (1 + this.level * 0.1)),
      baseHit: Math.floor(this.calculateAttribute(50, this.level)),
      baseDodge: 5,
      baseCrit: Math.floor(this.calculateAttribute(5, this.level)),
      baseGuard: Math.floor(this.calculateAttribute(5, this.level)),
      baseLuck: Math.floor(this.calculateAttribute(5, this.level)),
    };
  }

  // ==================== 战斗属性（计算装备加成后）====================

  get totalAttack(): number {
    return this.baseAttack + this.getEquipmentBonus('attack');
  }

  get totalDefense(): number {
    return this.baseDefense + this.getEquipmentBonus('defense');
  }

  get totalAgility(): number {
    return this.baseAgility + this.getEquipmentBonus('agility');
  }

  get totalAttackSpeed(): number {
    return this.baseAttackSpeed + this.getEquipmentBonus('attackSpeed');
  }

  get totalHit(): number {
    return this.baseHit + this.getEquipmentBonus('hit');
  }

  get totalDodge(): number {
    return this.baseDodge + this.getEquipmentBonus('dodge');
  }

  get totalCrit(): number {
    return this.baseCrit + this.getEquipmentBonus('crit');
  }

  get totalCritDamage(): number {
    return this.baseCritDamage + this.getEquipmentBonus('critDamage');
  }

  get totalPenetration(): number {
    return this.basePenetration + this.getEquipmentBonus('penetration');
  }

  get totalPenetrationPercent(): number {
    return this.basePenetrationPercent + this.getEquipmentBonus('penetrationPercent');
  }

  get totalTrueDamage(): number {
    return this.baseTrueDamage + this.getEquipmentBonus('trueDamage');
  }

  get totalGuard(): number {
    return this.baseGuard + this.getEquipmentBonus('guard');
  }

  get totalLuck(): number {
    return this.baseLuck + this.getEquipmentBonus('luck');
  }

  // 获取装备属性加成
  private getEquipmentBonus(stat: string): number {
    let bonus = 0;
    this.equipment.forEach(item => {
      if (item && item.stats) {
        bonus += item.stats[stat as keyof typeof item.stats] || 0;
      }
    });
    return bonus;
  }

  // ==================== 经验与升级 ====================

  addExp(amount: number): { leveledUp: boolean; newLevel?: number } {
    this.exp += amount;
    
    if (this.exp >= this.expToNext) {
      this.exp -= this.expToNext;
      this.level++;
      this.expToNext = this.calculateExpToNext();
      
      // 升级时恢复状态
      this.levelUpRecovery();
      
      return { leveledUp: true, newLevel: this.level };
    }
    
    return { leveledUp: false };
  }

  private levelUpRecovery(): void {
    const attrs = this.levelAttributes;
    this.maxHp = attrs.maxHp;
    this.hp = this.maxHp;
    this.maxStamina = attrs.maxStamina;
    this.stamina = this.maxStamina;
    this.maxSpirit = attrs.maxSpirit;
    this.spirit = this.maxSpirit;
  }

  // ==================== 生存状态管理 ====================

  consumeStamina(amount: number): boolean {
    if (this.stamina >= amount) {
      this.stamina -= amount;
      return true;
    }
    return false;
  }

  restoreStamina(amount: number): void {
    this.stamina = Math.min(this.maxStamina, this.stamina + amount);
  }

  consumeSpirit(amount: number): boolean {
    if (this.spirit >= amount) {
      this.spirit -= amount;
      return true;
    }
    return false;
  }

  restoreSpirit(amount: number): void {
    this.spirit = Math.min(this.maxSpirit, this.spirit + amount);
  }

  // 现实时间回复精神值（每5分钟回复1点）
  recoverSpiritByTime(): void {
    const now = Date.now();
    const lastRecovery = this.lastSpiritRecoveryTime || now;
    const timeDiff = now - lastRecovery;
    const recoveryAmount = Math.floor(timeDiff / (5 * 60 * 1000)); // 每5分钟
    
    if (recoveryAmount > 0) {
      this.restoreSpirit(recoveryAmount);
      this.lastSpiritRecoveryTime = now;
    }
  }

  get lastSpiritRecoveryTime(): number | undefined {
    return undefined; // 需要在GameManager中维护
  }

  set lastSpiritRecoveryTime(value: number | undefined) {
    // 需要在GameManager中维护
  }

  // ==================== 势力声望系统 ====================

  /**
   * 获取指定势力的声望
   */
  getFactionReputation(factionId: FactionType): number {
    return getReputation(this.factionReputations, factionId);
  }

  /**
   * 获取指定势力的关系状态
   */
  getFactionStatus(factionId: FactionType): FactionStatus {
    return getReputationStatus(this.factionReputations, factionId);
  }

  /**
   * 修改势力声望
   */
  modifyFactionReputation(factionId: FactionType, amount: number): void {
    this.factionReputations = modifyReputation(this.factionReputations, factionId, amount);
  }

  /**
   * 获取所有势力声望
   */
  getAllFactionReputations(): FactionReputation[] {
    return this.factionReputations;
  }

  // ==================== 神契者系统 ====================

  /**
   * 绑定神契者
   */
  bindGodContractor(contractor: GodContractor): boolean {
    if (this.godContractor) {
      return false; // 已绑定，需要先解绑
    }
    this.godContractor = contractor;
    return true;
  }

  /**
   * 解绑神契者
   */
  unbindGodContractor(): GodContractor | null {
    const contractor = this.godContractor;
    this.godContractor = null;
    return contractor;
  }

  /**
   * 获取当前神契者
   */
  getGodContractor(): GodContractor | null {
    return this.godContractor;
  }

  /**
   * 检查是否有神契者
   */
  hasGodContractor(): boolean {
    return this.godContractor !== null;
  }

  /**
   * 使用神契者能力
   */
  useContractorAbility(abilityIndex: number): { success: boolean; message?: string } {
    if (!this.godContractor) {
      return { success: false, message: '未绑定神契者' };
    }

    const ability = this.godContractor.abilities[abilityIndex];
    if (!ability) {
      return { success: false, message: '能力不存在' };
    }

    // 检查能量消耗（从航船系统获取）
    // 这里简化处理，实际应该在GameManager中协调
    return { success: true, message: `使用${ability.name}` };
  }

  // ==================== 装备管理 ====================

  equipItem(item: EquipmentInstance): boolean {
    if (!item.slot) return false;
    
    // 卸下当前装备
    const currentItem = this.equipment.get(item.slot);
    if (currentItem) {
      currentItem.equipped = false;
    }
    
    // 装备新物品
    item.equipped = true;
    this.equipment.set(item.slot, item);
    return true;
  }

  unequipItem(slot: EquipmentSlot): EquipmentInstance | null {
    const item = this.equipment.get(slot);
    if (item) {
      item.equipped = false;
      this.equipment.delete(slot);
    }
    return item || null;
  }

  getEquippedItem(slot: EquipmentSlot): EquipmentInstance | null {
    return this.equipment.get(slot) || null;
  }

  getAllEquippedItems(): EquipmentInstance[] {
    return Array.from(this.equipment.values());
  }

  // ==================== 数据导出 ====================

  exportData(): PlayerData {
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
      equipment: this.getAllEquippedItems(),
      factionReputations: this.factionReputations,
      godContractor: this.godContractor,
    };
  }

  // ==================== 状态检查 ====================

  isAlive(): boolean {
    return this.hp > 0;
  }

  isExhausted(): boolean {
    return this.stamina <= 0;
  }

  isStarving(): boolean {
    return this.hunger <= 0;
  }

  isDehydrated(): boolean {
    return this.thirst <= 0;
  }

  getStatusSummary(): string {
    return `
【${this.name}】Lv.${this.level}
生命值：${this.hp}/${this.maxHp}
体力：${this.stamina}/${this.maxStamina}
精神：${this.spirit}/${this.maxSpirit}
攻击：${this.totalAttack}
防御：${this.totalDefense}
神契者：${this.godContractor ? this.godContractor.name : '无'}
    `.trim();
  }
}

export default Player;
