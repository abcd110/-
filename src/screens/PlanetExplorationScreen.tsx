// 《星航荒宇》星球探索界面 - 使用新星球数据
import { useState, useEffect, useCallback } from 'react';
import { useGameStore } from '../stores/gameStore';
import { ALL_PLANETS_FULL, getAccessiblePlanets, getPlanetById } from '../data/planets_full';
import { Planet, PlanetType } from '../data/types_new';
import { FactionType, getFactionName } from '../data/factions';

interface PlanetExplorationScreenProps {
  onBack: () => void;
  onStartBattle: (planetId: string, isBoss?: boolean, isElite?: boolean) => void;
  initialPlanetId?: string | null;
  returnToActionSelect?: boolean;
  onActionSelectHandled?: () => void;
  planetTypeFilter?: string | null;
}

type ExplorationPhase = 'galaxy_map' | 'planet_detail' | 'traveling' | 'exploring';

export default function PlanetExplorationScreen({
  onBack,
  onStartBattle,
  initialPlanetId,
  returnToActionSelect,
  onActionSelectHandled,
  planetTypeFilter
}: PlanetExplorationScreenProps) {
  const { gameManager, saveGame } = useGameStore();
  const [phase, setPhase] = useState<ExplorationPhase>(
    initialPlanetId ? 'exploring' : 'galaxy_map'
  );
  const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(
    initialPlanetId ? getPlanetById(initialPlanetId) : null
  );
  const [logs, setLogs] = useState<string[]>([]);
  const [isTraveling, setIsTraveling] = useState(false);

  // 处理从战斗返回的情况
  useEffect(() => {
    if (returnToActionSelect && initialPlanetId && onActionSelectHandled) {
      const planet = getPlanetById(initialPlanetId);
      if (planet) {
        setSelectedPlanet(planet);
        setPhase('exploring');
        addLog(`🔄 返回 ${planet.name}，继续探索`);
      }
      onActionSelectHandled();
    }
  }, [returnToActionSelect, initialPlanetId, onActionSelectHandled]);

  // 获取当前航船等级
  const shipLevel = gameManager.train?.level || 1;

  // 获取所有星球（显示所有但标记不可达的）
  const allPlanets = ALL_PLANETS_FULL;

  // 根据筛选条件过滤星球
  const filteredPlanets = planetTypeFilter
    ? allPlanets.filter(p => {
      if (planetTypeFilter === 'tech') return p.type === PlanetType.TECH_STAR;
      if (planetTypeFilter === 'god') return p.type === PlanetType.GOD_DOMAIN;
      if (planetTypeFilter === 'wasteland') return p.type === PlanetType.WASTELAND;
      return true;
    })
    : allPlanets;

  // 按类型分组（只在有对应类型时显示）
  const techStars = filteredPlanets.filter(p => p.type === PlanetType.TECH_STAR);
  const godDomains = filteredPlanets.filter(p => p.type === PlanetType.GOD_DOMAIN);
  const wastelands = filteredPlanets.filter(p => p.type === PlanetType.WASTELAND);

  // 检查星球是否可达
  const isPlanetAccessible = (planet: Planet) => {
    return (planet.requiredShipLevel || 1) <= shipLevel;
  };

  // 获取筛选后的标题
  const getFilterTitle = () => {
    if (planetTypeFilter === 'tech') return '🏭 联邦科技星';
    if (planetTypeFilter === 'god') return '⭐ 神域星';
    if (planetTypeFilter === 'wasteland') return '💀 废土星';
    return '🌌 银河星图';
  };

  const addLog = useCallback((message: string) => {
    setLogs(prev => [message, ...prev.slice(0, 9)]);
  }, []);

  // 选择星球 - 直接跳转到探索界面
  const selectPlanet = (planet: Planet) => {
    setSelectedPlanet(planet);
    setPhase('exploring');
  };

  // 跃迁到星球 - 直接完成
  const travelToPlanet = () => {
    if (!selectedPlanet) return;
    // 直接跳转到探索界面
    setPhase('exploring');
  };

  // 探索星球
  const explorePlanet = () => {
    if (!selectedPlanet) return;
    addLog(`🔍 开始探索 ${selectedPlanet.name}...`);
    // 这里可以添加具体的探索逻辑
  };

  // 狩猎虚空生物
  const huntCreatures = () => {
    if (!selectedPlanet) return;
    addLog(`👾 开始狩猎虚空生物...`);
    onStartBattle(selectedPlanet.id, false, false);
  };

  // 挑战首领
  const challengeBoss = () => {
    if (!selectedPlanet) return;
    addLog(`💀 挑战 ${selectedPlanet.name} 的首领！`);
    onStartBattle(selectedPlanet.id, true, false);
  };

  // 收集资源
  const [isCollecting, setIsCollecting] = useState(false);
  const [collectedResources, setCollectedResources] = useState<{ name: string, count: number }[]>([]);

  // 新的材料ID列表 (mat_001~mat_010)
  const NEW_MATERIAL_IDS = [
    { id: 'mat_001', name: '铁矿碎片', dropRate: 0.6, minAmount: 2, maxAmount: 5 },
    { id: 'mat_002', name: '铜矿碎片', dropRate: 0.5, minAmount: 1, maxAmount: 4 },
    { id: 'mat_003', name: '钛合金碎片', dropRate: 0.4, minAmount: 1, maxAmount: 3 },
    { id: 'mat_004', name: '能量晶体', dropRate: 0.35, minAmount: 1, maxAmount: 3 },
    { id: 'mat_005', name: '稀土元素', dropRate: 0.3, minAmount: 1, maxAmount: 2 },
    { id: 'mat_006', name: '虚空核心', dropRate: 0.25, minAmount: 1, maxAmount: 2 },
    { id: 'mat_007', name: '星际燃料', dropRate: 0.5, minAmount: 2, maxAmount: 4 },
    { id: 'mat_008', name: '纳米纤维', dropRate: 0.4, minAmount: 1, maxAmount: 3 },
    { id: 'mat_009', name: '陨石碎片', dropRate: 0.35, minAmount: 1, maxAmount: 2 },
    { id: 'mat_010', name: '量子螺丝', dropRate: 0.3, minAmount: 1, maxAmount: 2 },
  ];

  const collectResources = async () => {
    if (!selectedPlanet || isCollecting) return;

    // 检查体力
    if (gameManager.player.stamina < 10) {
      addLog('⚠️ 体力不足，无法采集资源');
      return;
    }

    setIsCollecting(true);
    addLog(`📦 开始采集 ${selectedPlanet.name} 的资源...`);

    // 消耗体力
    gameManager.player.stamina -= 10;

    // 模拟采集时间
    await new Promise(resolve => setTimeout(resolve, 1500));

    // 随机选择3种材料进行掉落判定
    const shuffledMaterials = [...NEW_MATERIAL_IDS].sort(() => Math.random() - 0.5);
    const selectedMaterials = shuffledMaterials.slice(0, 3);

    let hasLoot = false;

    selectedMaterials.forEach(material => {
      // 判断是否掉落
      if (Math.random() < material.dropRate) {
        const count = Math.floor(Math.random() * (material.maxAmount - material.minAmount + 1)) + material.minAmount;

        // 添加到背包
        const added = gameManager.inventory.addItem(material.id, count);

        if (added) {
          hasLoot = true;
          // 记录收集的资源
          setCollectedResources(prev => {
            const existing = prev.find(r => r.name === material.name);
            if (existing) {
              return prev.map(r => r.name === material.name ? { ...r, count: r.count + count } : r);
            }
            return [...prev, { name: material.name, count }];
          });

          addLog(`✅ 获得 ${material.name} x${count}`);
        }
      }
    });

    if (!hasLoot) {
      addLog('❌ 本次采集没有收获');
    }

    // 保存游戏
    await saveGame();

    setIsCollecting(false);
  };

  // 获取物品名称（使用原先的物品ID，改为太空主题名称）
  const getItemName = (itemId: string): string => {
    const itemNames: Record<string, string> = {
      // 基础材料 - 使用原先ID，改为太空主题名称
      'mat_001': '铁矿碎片',
      'mat_002': '铜矿碎片',
      'mat_003': '钛合金碎片',
      'mat_004': '能量晶体',
      'mat_005': '稀土元素',
      'mat_006': '虚空核心',
      'mat_007': '星际燃料',
      'mat_008': '纳米纤维',
      'mat_009': '陨石碎片',
      'mat_010': '量子螺丝',
      // 新系统材料映射
      'basic_alloy': '基础合金',
      'star_core_fragment': '星核碎片',
      'energy_block': '能量块',
      'coolant': '冷却液',
      'star_core': '星核',
      'divine_marble': '神能大理石',
      'thunder_stone': '雷霆石',
      'bronze_alloy': '青铜合金',
      'solar_essence': '太阳精华',
      'prophecy_crystal': '预言水晶',
      'sacred_scroll': '神圣卷轴',
      'abyssal_pearl': '深渊珍珠',
      'coral_alloy': '珊瑚合金',
      'storm_crystal': '风暴水晶',
      'valkyrie_feather': '女武神之羽',
      'runic_stone': '符文石',
      'warrior_soul': '战士之魂',
      'rainbow_crystal': '彩虹水晶',
      'mutation_sample': '突变样本',
      'core_fragment': '核心碎片',
      'planetary_debris': '行星碎片',
      'gravity_crystal': '重力水晶',
      'abandoned_goods': '遗弃货物',
      'old_tech': '旧科技',
      'survivor_journal': '幸存者日记',
      'chitin_plate': '几丁质板',
      'bug_venom': '虫毒',
      'hive_essence': '蜂巢精华',
      'ash_ore': '灰烬矿石',
      'war_remnants': '战争遗迹',
      'heat_crystal': '热能水晶',
      'chaos_essence': '混沌精华',
      'unstable_matter': '不稳定物质',
      'reality_shard': '现实碎片',
      'illusion_crystal': '幻象水晶',
      'trickster_token': '诡计者代币',
      'deception_essence': '欺骗精华',
      'eternal_flame': '永恒之火',
      'magma_core': '岩浆核心',
      'fire_essence': '火焰精华',
      'serpent_scale': '蛇鳞',
      'venom_sac': '毒囊',
      'world_essence': '世界精华',
      'wolf_fang': '狼牙',
      'beast_pelt': '兽皮',
      'moon_essence': '月之精华',
      'styx_water': '冥河水',
      'soul_gem': '灵魂宝石',
      'underworld_ore': '冥界矿石',
      'dark_essence': '黑暗精华',
      'shadow_crystal': '阴影水晶',
      'void_heart': '虚空之心',
      'night_essence': '黑夜精华',
      'star_dust': '星尘',
      'dream_fragment': '梦境碎片',
    };
    return itemNames[itemId] || itemId;
  };

  // 获取星球类型颜色
  const getPlanetTypeColor = (type: PlanetType) => {
    switch (type) {
      case PlanetType.TECH_STAR: return '#00d4ff';
      case PlanetType.GOD_DOMAIN: return '#8b5cf6';
      case PlanetType.WASTELAND: return '#ef4444';
      default: return '#71717a';
    }
  };

  // 获取星球类型名称
  const getPlanetTypeName = (type: PlanetType) => {
    switch (type) {
      case PlanetType.TECH_STAR: return '科技星';
      case PlanetType.GOD_DOMAIN: return '神域星';
      case PlanetType.WASTELAND: return '废土星';
      default: return '未知';
    }
  };

  // 获取危险等级颜色
  const getDangerColor = (level: string) => {
    switch (level) {
      case 'low': return '#10b981';
      case 'medium': return '#fbbf24';
      case 'high': return '#f59e0b';
      case 'very_high': return '#ef4444';
      case 'extreme': return '#dc2626';
      default: return '#71717a';
    }
  };

  return (
    <div className="space-theme" style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'radial-gradient(ellipse at bottom, #1b2735 0%, #090a0f 100%)'
    }}>
      {/* 顶部标题栏 */}
      <header style={{
        flexShrink: 0,
        background: 'linear-gradient(180deg, rgba(26, 31, 58, 0.95) 0%, rgba(10, 14, 39, 0.95) 100%)',
        borderBottom: '1px solid rgba(0, 212, 255, 0.3)',
        padding: '12px 16px',
        boxShadow: '0 2px 10px rgba(0, 212, 255, 0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            onClick={() => {
              if (phase === 'galaxy_map') onBack();
              else if (phase === 'planet_detail') setPhase('galaxy_map');
              else setPhase('planet_detail');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: '#a1a1aa',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            <span>←</span>
            <span>{phase === 'galaxy_map' ? '返回' : '返回星图'}</span>
          </button>
          <h1 style={{
            color: '#00d4ff',
            fontWeight: 'bold',
            fontSize: '18px',
            textShadow: '0 0 10px rgba(0, 212, 255, 0.3)'
          }}>
            {phase === 'galaxy_map' && getFilterTitle()}
            {phase === 'planet_detail' && '🪐 星球详情'}
            {phase === 'traveling' && '🚀 跃迁中'}
            {phase === 'exploring' && '🔍 探索中'}
          </h1>
          <div style={{ width: '60px' }} />
        </div>
      </header>

      {/* 主内容区域 */}
      <main style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px'
      }}>
        {/* 星图模式 */}
        {phase === 'galaxy_map' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* 科技星区域 */}
            {techStars.length > 0 && (
              <div>
                <h3 style={{ color: '#00d4ff', fontSize: '16px', marginBottom: '12px' }}>
                  🏭 联邦科技星 ({techStars.length})
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                  {techStars.map(planet => (
                    <PlanetCard
                      key={planet.id}
                      planet={planet}
                      onClick={() => isPlanetAccessible(planet) && selectPlanet(planet)}
                      typeColor={getPlanetTypeColor(planet.type)}
                      isAccessible={isPlanetAccessible(planet)}
                      requiredLevel={planet.requiredShipLevel || 1}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 神域星区域 */}
            {godDomains.length > 0 && (
              <div>
                <h3 style={{ color: '#8b5cf6', fontSize: '16px', marginBottom: '12px' }}>
                  ⭐ 神域星 ({godDomains.length})
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                  {godDomains.map(planet => (
                    <PlanetCard
                      key={planet.id}
                      planet={planet}
                      onClick={() => isPlanetAccessible(planet) && selectPlanet(planet)}
                      typeColor={getPlanetTypeColor(planet.type)}
                      isAccessible={isPlanetAccessible(planet)}
                      requiredLevel={planet.requiredShipLevel || 1}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 废土星区域 */}
            {wastelands.length > 0 && (
              <div>
                <h3 style={{ color: '#ef4444', fontSize: '16px', marginBottom: '12px' }}>
                  💀 废土星 ({wastelands.length})
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                  {wastelands.map(planet => (
                    <PlanetCard
                      key={planet.id}
                      planet={planet}
                      onClick={() => isPlanetAccessible(planet) && selectPlanet(planet)}
                      typeColor={getPlanetTypeColor(planet.type)}
                      isAccessible={isPlanetAccessible(planet)}
                      requiredLevel={planet.requiredShipLevel || 1}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 星球详情模式 */}
        {phase === 'planet_detail' && selectedPlanet && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* 星球信息卡片 */}
            <div style={{
              background: 'linear-gradient(145deg, rgba(26, 31, 58, 0.9) 0%, rgba(10, 14, 39, 0.9) 100%)',
              borderRadius: '16px',
              padding: '20px',
              border: `2px solid ${getPlanetTypeColor(selectedPlanet.type)}`,
              boxShadow: `0 0 20px ${getPlanetTypeColor(selectedPlanet.type)}40`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: `radial-gradient(circle, ${getPlanetTypeColor(selectedPlanet.type)}40 0%, transparent 70%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '32px',
                  border: `2px solid ${getPlanetTypeColor(selectedPlanet.type)}`
                }}>
                  🪐
                </div>
                <div>
                  <h2 style={{
                    color: getPlanetTypeColor(selectedPlanet.type),
                    fontSize: '20px',
                    fontWeight: 'bold',
                    margin: '0 0 4px 0'
                  }}>
                    {selectedPlanet.name}
                  </h2>
                  <p style={{ color: '#a1a1aa', fontSize: '14px', margin: 0 }}>
                    {getPlanetTypeName(selectedPlanet.type)} | 等级 {selectedPlanet.level}
                  </p>
                </div>
              </div>

              <p style={{ color: '#d1d5db', fontSize: '14px', lineHeight: '1.6', marginBottom: '16px' }}>
                {selectedPlanet.description}
              </p>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px',
                fontSize: '13px'
              }}>
                <div style={{
                  background: 'rgba(0,0,0,0.3)',
                  padding: '10px',
                  borderRadius: '8px'
                }}>
                  <span style={{ color: '#71717a' }}>危险等级: </span>
                  <span style={{ color: getDangerColor(selectedPlanet.dangerLevel), fontWeight: 'bold' }}>
                    {selectedPlanet.dangerLevel.toUpperCase()}
                  </span>
                </div>
                <div style={{
                  background: 'rgba(0,0,0,0.3)',
                  padding: '10px',
                  borderRadius: '8px'
                }}>
                  <span style={{ color: '#71717a' }}>控制势力: </span>
                  <span style={{ color: '#00d4ff' }}>
                    {getFactionName(selectedPlanet.factionControl)}
                  </span>
                </div>
                <div style={{
                  background: 'rgba(0,0,0,0.3)',
                  padding: '10px',
                  borderRadius: '8px'
                }}>
                  <span style={{ color: '#71717a' }}>探索时间: </span>
                  <span style={{ color: '#fbbf24' }}>{selectedPlanet.explorationTime}分钟</span>
                </div>
                <div style={{
                  background: 'rgba(0,0,0,0.3)',
                  padding: '10px',
                  borderRadius: '8px'
                }}>
                  <span style={{ color: '#71717a' }}>资源种类: </span>
                  <span style={{ color: '#10b981' }}>{selectedPlanet.resources.length}种</span>
                </div>
              </div>
            </div>

            {/* 跃迁按钮 */}
            <button
              onClick={travelToPlanet}
              disabled={isTraveling}
              style={{
                width: '100%',
                padding: '16px',
                background: 'linear-gradient(135deg, #0099cc 0%, #00d4ff 100%)',
                border: 'none',
                borderRadius: '12px',
                color: 'white',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: isTraveling ? 'not-allowed' : 'pointer',
                opacity: isTraveling ? 0.6 : 1,
                boxShadow: '0 0 20px rgba(0, 212, 255, 0.3)'
              }}
            >
              {isTraveling ? '跃迁中...' : '🚀 启动跃迁'}
            </button>
          </div>
        )}

        {/* 跃迁中模式 */}
        {phase === 'traveling' && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            gap: '24px'
          }}>
            <div style={{
              fontSize: '80px',
              animation: 'pulse 1.5s ease-in-out infinite',
              filter: 'drop-shadow(0 0 30px rgba(0, 212, 255, 0.8))'
            }}>
              🚀
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: '#00d4ff', fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>
                空间跃迁进行中
              </p>
              <p style={{ color: '#a1a1aa', fontSize: '14px' }}>
                正在穿越星际空间...
              </p>
            </div>
            {/* 跃迁进度条 */}
            <div style={{
              width: '250px',
              height: '8px',
              backgroundColor: 'rgba(10, 14, 39, 0.8)',
              borderRadius: '4px',
              overflow: 'hidden',
              border: '1px solid rgba(0, 212, 255, 0.3)'
            }}>
              <div style={{
                height: '100%',
                background: 'linear-gradient(90deg, #0099cc 0%, #00d4ff 100%)',
                width: '100%',
                animation: 'progress 2s ease-out',
                boxShadow: '0 0 10px rgba(0, 212, 255, 0.5)'
              }} />
            </div>
          </div>
        )}

        {/* 探索模式 */}
        {phase === 'exploring' && selectedPlanet && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              background: 'linear-gradient(145deg, rgba(26, 31, 58, 0.9) 0%, rgba(10, 14, 39, 0.9) 100%)',
              borderRadius: '12px',
              padding: '16px',
              border: `1px solid ${getPlanetTypeColor(selectedPlanet.type)}`,
            }}>
              <h3 style={{ color: getPlanetTypeColor(selectedPlanet.type), margin: '0 0 12px 0' }}>
                🪐 {selectedPlanet.name}
              </h3>
              <p style={{ color: '#a1a1aa', fontSize: '14px', margin: 0 }}>
                选择你要执行的行动
              </p>
            </div>

            {/* 行动按钮 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              <ActionButton
                icon="👾"
                label="普通狩猎"
                description="击败普通虚空生物"
                color="#10b981"
                onClick={() => onStartBattle(selectedPlanet.id, false, false)}
              />
              <ActionButton
                icon="👹"
                label="困难狩猎"
                description="击败精英虚空生物"
                color="#8b5cf6"
                onClick={() => onStartBattle(selectedPlanet.id, false, true)}
              />
              <ActionButton
                icon="💀"
                label="挑战首领"
                description="高风险高回报"
                color="#ef4444"
                onClick={() => onStartBattle(selectedPlanet.id, true, false)}
              />
              <ActionButton
                icon="📦"
                label={isCollecting ? "采集中..." : "采集资源"}
                description={`消耗10体力 | 剩余: ${gameManager.player.stamina}`}
                color="#f59e0b"
                onClick={collectResources}
              />
            </div>

            {/* 本次收集的资源 */}
            {collectedResources.length > 0 && (
              <div style={{
                background: 'rgba(16, 185, 129, 0.1)',
                borderRadius: '8px',
                padding: '12px',
                border: '1px solid rgba(16, 185, 129, 0.3)'
              }}>
                <h4 style={{ color: '#10b981', fontSize: '12px', margin: '0 0 8px 0' }}>📦 本次收获</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {collectedResources.map((resource, index) => (
                    <span key={index} style={{
                      fontSize: '12px',
                      padding: '4px 10px',
                      background: 'rgba(16, 185, 129, 0.2)',
                      borderRadius: '4px',
                      color: '#10b981'
                    }}>
                      {resource.name} x{resource.count}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 日志显示 */}
            {logs.length > 0 && (
              <div style={{
                background: 'rgba(10, 14, 39, 0.6)',
                borderRadius: '8px',
                padding: '12px',
                border: '1px solid rgba(0, 212, 255, 0.2)',
                maxHeight: '150px',
                overflowY: 'auto'
              }}>
                <h4 style={{ color: '#00d4ff', fontSize: '12px', margin: '0 0 8px 0' }}>探索日志</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {logs.map((log, index) => (
                    <span key={index} style={{ color: '#a1a1aa', fontSize: '12px' }}>{log}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

// 星球卡片组件
function PlanetCard({
  planet,
  onClick,
  typeColor,
  isAccessible,
  requiredLevel
}: {
  planet: Planet;
  onClick: () => void;
  typeColor: string;
  isAccessible: boolean;
  requiredLevel: number;
}) {
  return (
    <button
      onClick={onClick}
      disabled={!isAccessible}
      style={{
        padding: '12px',
        background: isAccessible
          ? 'linear-gradient(145deg, rgba(26, 31, 58, 0.8) 0%, rgba(10, 14, 39, 0.8) 100%)'
          : 'linear-gradient(145deg, rgba(40, 40, 40, 0.8) 0%, rgba(20, 20, 20, 0.8) 100%)',
        border: `1px solid ${isAccessible ? typeColor + '60' : '#4b5563'}`,
        borderRadius: '12px',
        textAlign: 'left',
        cursor: isAccessible ? 'pointer' : 'not-allowed',
        color: 'white',
        transition: 'all 0.3s ease',
        opacity: isAccessible ? 1 : 0.6
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
        <span style={{ fontSize: '20px' }}>{isAccessible ? '🪐' : '🔒'}</span>
        <span style={{
          fontSize: '14px',
          fontWeight: 'bold',
          color: isAccessible ? typeColor : '#6b7280'
        }}>
          {planet.name}
        </span>
      </div>
      <div style={{ fontSize: '11px', color: '#71717a' }}>
        等级 {planet.level} | {planet.dangerLevel}
        {!isAccessible && (
          <span style={{ color: '#ef4444', marginLeft: '8px' }}>
            (需航船等级 {requiredLevel})
          </span>
        )}
      </div>
    </button>
  );
}

// 行动按钮组件
function ActionButton({
  icon,
  label,
  description,
  color,
  onClick
}: {
  icon: string;
  label: string;
  description: string;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '16px',
        background: 'rgba(26, 31, 58, 0.8)',
        border: `1px solid ${color}60`,
        borderRadius: '12px',
        color: 'white',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '6px',
        transition: 'all 0.3s ease'
      }}
    >
      <span style={{ fontSize: '28px' }}>{icon}</span>
      <span style={{ fontSize: '14px', fontWeight: 'bold', color }}>{label}</span>
      <span style={{ fontSize: '11px', color: '#71717a' }}>{description}</span>
    </button>
  );
}
