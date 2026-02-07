// 《星航荒宇》游戏数据类型定义
// 基于《列车求生》改造的新世界观

// ==================== 基础枚举 ====================

export enum ItemType {
  WEAPON = 'weapon',
  ARMOR = 'armor',
  ACCESSORY = 'accessory',
  CONSUMABLE = 'consumable',
  MATERIAL = 'material',
  SPECIAL = 'special',
  SKILL_BOOK = 'skill_book',
}

export enum ItemRarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary',
  MYTHIC = 'mythic',
}

// ==================== 星球相关 ====================

export enum PlanetType {
  TECH_STAR = 'tech_star',       // 科技星（宜居/工业）
  GOD_DOMAIN = 'god_domain',     // 神域星
  WASTELAND = 'wasteland',       // 废土星
}

export enum PlanetCategory {
  REGULAR = 'regular',           // 常规星球
  MYTHOLOGY = 'mythology',       // 神明星球
}

// ==================== 势力相关 ====================

export enum FactionType {
  FEDERATION = 'federation',     // 银河联邦
  ORDER_GODS = 'order_gods',     // 守序神盟
  CHAOS_GODS = 'chaos_gods',     // 混沌神庭
  STAR_DEBRIS = 'star_debris',   // 星骸佣兵团
}

export enum FactionStatus {
  HOSTILE = 'hostile',           // 敌对
  UNFRIENDLY = 'unfriendly',     // 不友好
  NEUTRAL = 'neutral',           // 中立
  FRIENDLY = 'friendly',         // 友好
  ALLIED = 'allied',             // 同盟
}

// ==================== 神明相关 ====================

export enum GodStatus {
  HIDDEN = 'hidden',             // 隐藏
  EXPOSED = 'exposed',           // 暴露
  HOSTILE = 'hostile',           // 敌对
  NEUTRAL = 'neutral',           // 中立
  ALLIED = 'allied',             // 同盟
}

export enum GodDomain {
  GREEK = 'greek',               // 希腊神话
  NORDIC = 'nordic',             // 北欧神话
}

// ==================== 航船相关 ====================

export enum ModuleSlot {
  ENGINE = 'engine',             // 引擎
  SHIELD = 'shield',             // 护盾
  WEAPON = 'weapon',             // 武器
  CARGO = 'cargo',               // 货舱
  SENSOR = 'sensor',             // 传感器
  ENERGY = 'energy',             // 能源核心
}

export enum ModuleType {
  ENGINE = 'engine',
  SHIELD = 'shield',
  WEAPON = 'weapon',
  CARGO = 'cargo',
  SENSOR = 'sensor',
  ENERGY = 'energy',
}

// ==================== 敌人相关 ====================

export enum EnemyType {
  VOID_CREATURE = 'void_creature',     // 虚空生物
  CHAOS_MINION = 'chaos_minion',       // 混沌仆从
  STAR_DEBRIS_RAIDER = 'star_debris_raider', // 星骸佣兵
  GOD_MANIPULATED = 'god_manipulated', // 神明操控生物
}

export enum EnemyTier {
  T1 = 'T1',
  T1_PLUS = 'T1+',
  T2 = 'T2',
  T2_PLUS = 'T2+',
  T3 = 'T3',
  T3_PLUS = 'T3+',
  T4 = 'T4',
  T4_PLUS = 'T4+',
  T5 = 'T5',
  BOSS = 'BOSS',
}

// ==================== 核心接口 ====================

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  rarity: ItemRarity;
  description: string;
  attack?: number;
  defense?: number;
  agility?: number;
  speed?: number;
  maxHp?: number;
  healHp?: number;
  healStamina?: number;
  healHunger?: number;
  healThirst?: number;
  critRate?: number;
  critDamage?: number;
  dodgeRate?: number;
  hitRate?: number;
  penetration?: number;
  trueDamage?: number;
  lifeSteal?: number;
  damageReduction?: number;
  shield?: number;
  hpRegen?: number;
  sublimationLevel: number;
  effects?: EquipmentEffect[];
  armorSlot?: 'head' | 'chest' | 'legs' | 'feet';
  setId?: string;
  requiredLevel?: number;
  power?: number;
}

export interface EquipmentEffect {
  type: EquipmentEffectType;
  trigger: EffectTrigger;
  value: number;
  chance?: number;
  duration?: number;
  condition?: EffectCondition;
  description: string;
}

export enum EquipmentEffectType {
  EXTRA_DAMAGE = 'extra_damage',
  DAMAGE_BOOST = 'damage_boost',
  DEFENSE_BOOST = 'defense_boost',
  ATTACK_BOOST = 'attack_boost',
  SPEED_BOOST = 'speed_boost',
  DODGE_BOOST = 'dodge_boost',
  CRIT_BOOST = 'crit_boost',
  HIT_RATE_BOOST = 'hit_rate_boost',
  PENETRATION_BOOST = 'penetration_boost',
  TRUE_DAMAGE_BOOST = 'true_damage_boost',
  LIFE_STEAL = 'life_steal',
  SHIELD_GAIN = 'shield_gain',
  HP_REGEN = 'hp_regen',
  DAMAGE_REDUCTION = 'damage_reduction',
  THORN_DAMAGE = 'thorn_damage',
  DEBUFF_ENEMY = 'debuff_enemy',
  IGNORE_DEFENSE = 'ignore_defense',
}

export enum EffectTrigger {
  ON_ATTACK = 'on_attack',
  ON_HIT = 'on_hit',
  ON_DODGE = 'on_dodge',
  ON_HURT = 'on_hurt',
  ON_CRIT = 'on_crit',
  ON_KILL = 'on_kill',
  BATTLE_START = 'battle_start',
  HP_LOW = 'hp_low',
  HP_HIGH = 'hp_high',
  PASSIVE = 'passive',
}

export interface EffectCondition {
  type: 'hp_below' | 'hp_above' | 'enemy_hp_below' | 'chance';
  value: number;
}

// ==================== 星球接口 ====================

export interface Planet {
  id: string;
  name: string;
  type: PlanetType;
  category: PlanetCategory;
  level: number;
  description: string;
  dangerLevel: 'safe' | 'low' | 'medium' | 'high' | 'extreme';
  godId?: string;               // 关联的神明ID
  factionControl?: FactionType; // 控制势力
  resources: PlanetResource[];
  enemies: PlanetEnemy[];
  specialLoot?: string[];
  explorationTime: number;      // 探索时间（分钟）
  requiredShipLevel?: number;   // 所需航船等级
}

export interface PlanetResource {
  itemId: string;
  dropRate: number;
  minAmount: number;
  maxAmount: number;
}

export interface PlanetEnemy {
  enemyId: string;
  spawnRate: number;
  minCount: number;
  maxCount: number;
}

// ==================== 势力接口 ====================

export interface Faction {
  id: FactionType;
  name: string;
  description: string;
  ideology: string;
  leader?: string;
  headquarters?: string;
}

export interface FactionReputation {
  factionId: FactionType;
  reputation: number;           // -1000 到 1000
  status: FactionStatus;
}

// ==================== 神明接口 ====================

export interface God {
  id: string;
  name: string;
  domain: GodDomain;
  title: string;
  description: string;
  backstory: string;
  status: GodStatus;
  faction: FactionType;
  abilities: GodAbility[];
  planetId: string;             // 所在星球ID
  reputation: number;           // 与玩家的关系值
}

export interface GodAbility {
  name: string;
  description: string;
  effect: string;
  cooldown?: number;
}

// ==================== 航船接口 ====================

export interface Spaceship {
  id: string;
  name: string;
  level: number;
  experience: number;
  speed: number;                // 跃迁速度
  defense: number;              // 虚空防护
  cargoCapacity: number;        // 货舱容量
  energy: number;               // 当前能量
  maxEnergy: number;            // 最大能量
  modules: SpaceshipModule[];
}

export interface SpaceshipModule {
  slot: ModuleSlot;
  item: ModuleItem | null;
}

export interface ModuleItem {
  id: string;
  name: string;
  type: ModuleType;
  level: number;
  rarity: ItemRarity;
  description: string;
  effects: ModuleEffect[];
}

export interface ModuleEffect {
  stat: string;
  value: number;
  isPercentage: boolean;
}

// ==================== 神契者接口 ====================

export interface GodContractor {
  id: string;
  name: string;
  godId: string;                // 绑定的神明ID
  level: number;
  experience: number;
  abilities: ContractorAbility[];
  bondLevel: number;            // 羁绊等级
  maxBondLevel: number;
}

export interface ContractorAbility {
  name: string;
  description: string;
  effect: string;
  cooldown: number;
  energyCost: number;
}

// ==================== 敌人接口 ====================

export interface Enemy {
  id: string;
  name: string;
  type: EnemyType;
  tier: EnemyTier;
  description: string;
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  critRate: number;
  dodgeRate: number;
  hitRate: number;
  skills?: EnemySkill[];
  loot?: EnemyLoot[];
}

export interface EnemySkill {
  name: string;
  description: string;
  damage?: number;
  effect?: string;
  cooldown: number;
}

export interface EnemyLoot {
  itemId: string;
  dropRate: number;
  minAmount: number;
  maxAmount: number;
}

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
  // 新增字段
  factionReputations: FactionReputation[];
  godContractor: GodContractor | null;
}

export interface EquipmentInstance {
  instanceId: string;
  templateId: string;
  name: string;
  type: ItemType;
  rarity: ItemRarity;
  level: number;
  sublimationLevel: number;
  enhanceLevel: number;
  stats: {
    attack?: number;
    defense?: number;
    hp?: number;
    critRate?: number;
    critDamage?: number;
    dodgeRate?: number;
    hitRate?: number;
    penetration?: number;
    lifeSteal?: number;
    damageReduction?: number;
  };
  effects?: EquipmentEffect[];
  armorSlot?: 'head' | 'chest' | 'legs' | 'feet';
  setId?: string;
}

// ==================== 游戏状态接口 ====================

export interface GameState {
  player: PlayerData;
  inventory: { items: InventoryItem[]; equipment: EquipmentInstance[] };
  spaceship: Spaceship;
  day: number;
  time: 'day' | 'night';
  currentPlanet: string;
  gameTime: number;
  logs: string[];
  federationCredits: number;    // 联邦信用点（原列车币）
  quests: any[];
  activeSkills: any[];
  passiveSkills: any[];
  availableSkills: string[];
  shopItems: any[];
  lastShopRefreshDay: number;
  playerName: string;
  planetProgress: Array<[string, {
    materialProgress: number;
    huntProgress: number;
    bossDefeated: boolean;
    lastBossDefeatDay: number;
    lastBossChallengeDate: string | null;
  }]>;
}

export interface InventoryItem {
  id: string;
  itemId: string;
  name: string;
  type: ItemType;
  rarity: ItemRarity;
  quantity: number;
  description?: string;
  sublimationLevel?: number;
}
