// 《星航荒宇》整合测试
// 测试新系统的核心功能

import { describe, it, expect, beforeEach } from 'vitest';
import { GameManager } from '../core/GameManager_new';
import { SaveMigration } from '../utils/SaveMigration';
import { FactionType, PlanetType, GodDomain } from '../data/types_new';
import {
  getFaction,
  getAllFactions,
  calculateFactionStatus,
  createInitialReputations,
} from '../data/factions';
import {
  getGodById,
  getGodByPlanetId,
  getGodsByDomain,
  ALL_GODS,
} from '../data/gods';
import {
  getPlanetById,
  getPlanetsByType,
  ALL_PLANETS,
  PLANET_ALPHA,
  PLANET_HELIOS,
} from '../data/planets';

describe('《星航荒宇》整合测试', () => {
  
  // ==================== 势力系统测试 ====================
  describe('势力系统', () => {
    it('应该能获取所有势力', () => {
      const factions = getAllFactions();
      expect(factions).toHaveLength(4);
      expect(factions.map(f => f.id)).toContain(FactionType.FEDERATION);
      expect(factions.map(f => f.id)).toContain(FactionType.ORDER_GODS);
      expect(factions.map(f => f.id)).toContain(FactionType.CHAOS_GODS);
      expect(factions.map(f => f.id)).toContain(FactionType.STAR_DEBRIS);
    });

    it('应该能获取单个势力信息', () => {
      const federation = getFaction(FactionType.FEDERATION);
      expect(federation).toBeDefined();
      expect(federation?.name).toBe('银河联邦');
      expect(federation?.leader).toBe('联邦议会');
    });

    it('应该正确计算声望状态', () => {
      expect(calculateFactionStatus(900)).toBe('allied');
      expect(calculateFactionStatus(500)).toBe('friendly');
      expect(calculateFactionStatus(0)).toBe('neutral');
      expect(calculateFactionStatus(-500)).toBe('unfriendly');
      expect(calculateFactionStatus(-900)).toBe('hostile');
    });

    it('应该创建初始声望配置', () => {
      const reps = createInitialReputations();
      expect(reps).toHaveLength(4);
      
      const federationRep = reps.find(r => r.factionId === FactionType.FEDERATION);
      expect(federationRep?.reputation).toBe(100);
      expect(federationRep?.status).toBe('friendly');
    });
  });

  // ==================== 神明系统测试 ====================
  describe('神明系统', () => {
    it('应该能获取所有神明', () => {
      expect(ALL_GODS).toHaveLength(8);
    });

    it('应该能根据ID获取神明', () => {
      const zeus = getGodById('god_zeus');
      expect(zeus).toBeDefined();
      expect(zeus?.name).toBe('宙斯');
      expect(zeus?.domain).toBe(GodDomain.GREEK);
    });

    it('应该能根据星球ID获取神明', () => {
      const god = getGodByPlanetId('planet_olympus');
      expect(god).toBeDefined();
      expect(god?.name).toBe('宙斯');
    });

    it('应该能按神话体系筛选神明', () => {
      const greekGods = getGodsByDomain(GodDomain.GREEK);
      const nordicGods = getGodsByDomain(GodDomain.NORDIC);
      
      expect(greekGods).toHaveLength(4);
      expect(nordicGods).toHaveLength(4);
    });

    it('神明应该有完整的能力配置', () => {
      const thor = getGodById('god_thor');
      expect(thor?.abilities).toHaveLength(2);
      expect(thor?.abilities[0].name).toBe('雷神之锤');
    });
  });

  // ==================== 星球系统测试 ====================
  describe('星球系统', () => {
    it('应该能获取所有星球', () => {
      expect(ALL_PLANETS.length).toBeGreaterThanOrEqual(10);
    });

    it('应该能根据ID获取星球', () => {
      const alpha = getPlanetById('planet_alpha');
      expect(alpha).toBeDefined();
      expect(alpha?.name).toBe('阿尔法宜居星');
      expect(alpha?.type).toBe(PlanetType.TECH_STAR);
    });

    it('应该能按类型筛选星球', () => {
      const techStars = getPlanetsByType(PlanetType.TECH_STAR);
      const godDomains = getPlanetsByType(PlanetType.GOD_DOMAIN);
      
      expect(techStars.length).toBeGreaterThanOrEqual(1);
      expect(godDomains.length).toBeGreaterThanOrEqual(8);
    });

    it('星球应该有完整的资源配置', () => {
      const helios = getPlanetById('planet_helios');
      expect(helios?.resources.length).toBeGreaterThan(0);
      expect(helios?.enemies.length).toBeGreaterThan(0);
      expect(helios?.specialLoot?.length).toBeGreaterThan(0);
    });

    it('神域星应该关联神明', () => {
      const helios = getPlanetById('planet_helios');
      expect(helios?.godId).toBe('god_helios');
    });
  });

  // ==================== 航船系统测试 ====================
  describe('航船系统', () => {
    let gameManager: GameManager;

    beforeEach(() => {
      gameManager = new GameManager();
    });

    it('应该正确初始化航船', () => {
      const spaceship = gameManager.spaceship;
      expect(spaceship).toBeDefined();
      expect(spaceship.level).toBe(1);
      expect(spaceship.energy).toBeGreaterThan(0);
      expect(spaceship.maxEnergy).toBeGreaterThan(0);
    });

    it('航船应该有正确的属性计算', () => {
      const spaceship = gameManager.spaceship;
      expect(spaceship.speed).toBeGreaterThan(0);
      expect(spaceship.defense).toBeGreaterThan(0);
      expect(spaceship.cargoCapacity).toBeGreaterThan(0);
    });

    it('应该能消耗和恢复能量', () => {
      const spaceship = gameManager.spaceship;
      const initialEnergy = spaceship.energy;
      
      const consumed = spaceship.consumeEnergy(10);
      expect(consumed).toBe(true);
      expect(spaceship.energy).toBe(initialEnergy - 10);
      
      spaceship.restoreEnergy(5);
      expect(spaceship.energy).toBe(initialEnergy - 5);
    });

    it('能量不足时应该拒绝消耗', () => {
      const spaceship = gameManager.spaceship;
      spaceship.energy = 5;
      
      const consumed = spaceship.consumeEnergy(10);
      expect(consumed).toBe(false);
      expect(spaceship.energy).toBe(5);
    });

    it('应该能执行跃迁', () => {
      const result = gameManager.travelToPlanet('planet_helios');
      // 可能失败（等级不足），但不应该报错
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('message');
    });
  });

  // ==================== 游戏管理器测试 ====================
  describe('游戏管理器', () => {
    let gameManager: GameManager;

    beforeEach(() => {
      gameManager = new GameManager();
    });

    it('应该正确初始化游戏', () => {
      expect(gameManager.player).toBeDefined();
      expect(gameManager.spaceship).toBeDefined();
      expect(gameManager.inventory).toBeDefined();
      expect(gameManager.day).toBe(1);
    });

    it('玩家应该有初始势力声望', () => {
      const reputations = gameManager.player.getAllFactionReputations();
      expect(reputations).toHaveLength(4);
      
      const federationRep = gameManager.getFactionReputation(FactionType.FEDERATION);
      expect(federationRep).toBe(100);
    });

    it('应该能修改势力声望', () => {
      const initialRep = gameManager.getFactionReputation(FactionType.FEDERATION);
      gameManager.modifyFactionReputation(FactionType.FEDERATION, 50);
      const newRep = gameManager.getFactionReputation(FactionType.FEDERATION);
      
      expect(newRep).toBe(initialRep + 50);
    });

    it('应该能获取当前星球', () => {
      const planet = gameManager.getCurrentPlanet();
      expect(planet).toBeDefined();
      expect(planet?.id).toBe('planet_alpha');
    });

    it('应该能管理联邦信用点', () => {
      const initialCredits = gameManager.federationCredits;
      expect(initialCredits).toBe(100);
      
      gameManager.addCredits(50);
      expect(gameManager.federationCredits).toBe(initialCredits + 50);
      
      const spent = gameManager.spendCredits(30);
      expect(spent).toBe(true);
      expect(gameManager.federationCredits).toBe(initialCredits + 20);
    });

    it('应该能正确导出和导入存档', () => {
      const state = gameManager.exportState();
      expect(state.player).toBeDefined();
      expect(state.spaceship).toBeDefined();
      expect(state.currentPlanet).toBe('planet_alpha');
      
      const newGameManager = GameManager.load(JSON.stringify(state));
      expect(newGameManager.player.level).toBe(gameManager.player.level);
      expect(newGameManager.currentPlanet).toBe(gameManager.currentPlanet);
    });
  });

  // ==================== 存档迁移测试 ====================
  describe('存档迁移', () => {
    it('应该能检测旧存档', () => {
      const oldSave = {
        train: { level: 5 },
        currentLocation: 'location_helios',
      };
      
      expect(SaveMigration.needsMigration(oldSave)).toBe(true);
    });

    it('应该能检测新存档', () => {
      const newSave = {
        spaceship: { level: 5 },
        currentPlanet: 'planet_helios',
      };
      
      expect(SaveMigration.needsMigration(newSave)).toBe(false);
    });

    it('应该能迁移旧存档', () => {
      const oldSave = {
        player: {
          name: '测试玩家',
          level: 10,
          hp: 80,
          maxHp: 100,
          stamina: 90,
          maxStamina: 100,
          spirit: 100,
          maxSpirit: 100,
          hunger: 100,
          thirst: 100,
          attack: 50,
          defense: 30,
          attackSpeed: 1.2,
          equipment: [],
        },
        train: {
          id: 'train_001',
          name: '测试列车',
          level: 5,
          experience: 100,
          speed: 150,
          defense: 80,
          cargoCapacity: 200,
          energy: 80,
          maxEnergy: 100,
          modules: [],
        },
        inventory: {
          items: [],
          equipment: [],
        },
        day: 15,
        gameTime: 720,
        currentLocation: 'location_helios',
        trainCoins: 500,
        logs: ['列车已启动'],
        quests: [],
        activeSkills: [],
        passiveSkills: [],
        availableSkills: [],
        shopItems: [],
        lastShopRefreshDay: 10,
        locationProgress: {},
        lastSaveTime: Date.now(),
        lastSpiritRecoveryTime: Date.now(),
      };
      
      const result = SaveMigration.migrate(JSON.stringify(oldSave));
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      
      if (result.data) {
        expect(result.data.currentPlanet).toBe('planet_helios');
        expect(result.data.federationCredits).toBe(500);
        expect(result.data.player.factionReputations).toHaveLength(4);
        expect(result.data.spaceship.name).toContain('航船');
      }
    });

    it('应该生成迁移报告', () => {
      const result = {
        success: true,
        message: '迁移成功',
        warnings: ['警告1', '警告2'],
      };
      
      const report = SaveMigration.generateReport(result);
      expect(report).toContain('迁移成功');
      expect(report).toContain('警告1');
    });
  });
});

// ==================== 运行测试 ====================
console.log('《星航荒宇》整合测试已加载');
console.log('运行命令: npm test 或 vitest');
