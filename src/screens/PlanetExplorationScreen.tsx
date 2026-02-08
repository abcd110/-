// 《星航荒宇》星球探索界面 - 使用新星球数据
import { useState, useEffect, useCallback } from 'react';
import { useGameStore } from '../stores/gameStore';
import { ALL_PLANETS_FULL, getPlanetById } from '../data/planets_full';
import { Planet, PlanetType } from '../data/types_new';

import { ArmorQuality, ARMOR_QUALITY_NAMES } from '../data/nanoArmorRecipes';

interface PlanetExplorationScreenProps {
  onBack: () => void;
  onStartBattle: (planetId: string, isBoss?: boolean, isElite?: boolean) => void;
  initialPlanetId?: string | null;
  returnToActionSelect?: boolean;
  onActionSelectHandled?: () => void;
  planetTypeFilter?: string | null;
}

type ExplorationPhase = 'galaxy_map' | 'exploring';

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

  // 获取所有星球
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

  // 按类型分组并按等级排序（只在有对应类型时显示）
  const techStars = filteredPlanets.filter(p => p.type === PlanetType.TECH_STAR).sort((a, b) => a.level - b.level);
  const godDomains = filteredPlanets.filter(p => p.type === PlanetType.GOD_DOMAIN).sort((a, b) => a.level - b.level);
  const wastelands = filteredPlanets.filter(p => p.type === PlanetType.WASTELAND).sort((a, b) => a.level - b.level);



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

  // 扫荡功能
  const handleSweep = async () => {
    if (!selectedPlanet) return;

    addLog(`⚡ 开始扫荡 ${selectedPlanet.name}...`);

    // 调用扫荡
    const result = gameManager.sweepPlanet(selectedPlanet.id);

    if (result.success) {
      // 显示收获
      const lootSummary = result.rewards?.loot.map(l => `${l.name}x${l.quantity}`).join('、') || '无';
      addLog(`✅ 扫荡完成！获得 ${result.rewards?.exp || 0} 经验`);
      addLog(`📦 掉落：${lootSummary}`);

      // 记录收集的资源
      if (result.rewards?.loot) {
        setCollectedResources(prev => {
          const newResources = [...prev];
          result.rewards!.loot.forEach(item => {
            const existing = newResources.find(r => r.name === item.name);
            if (existing) {
              existing.count += item.quantity;
            } else {
              newResources.push({ name: item.name, count: item.quantity });
            }
          });
          return newResources;
        });
      }

      saveGame();
    } else {
      addLog(`❌ ${result.message}`);
    }
  };

  // 收集资源
  const [isCollecting, setIsCollecting] = useState(false);
  const [collectedResources, setCollectedResources] = useState<{ name: string, count: number }[]>([]);

  // 材料品质后缀映射
  const QUALITY_SUFFIX: Record<ArmorQuality, string> = {
    [ArmorQuality.STARDUST]: '_stardust',
    [ArmorQuality.ALLOY]: '_alloy',
    [ArmorQuality.CRYSTAL]: '_crystal',
    [ArmorQuality.QUANTUM]: '_quantum',
    [ArmorQuality.VOID]: '_void',
  };

  // 新的材料ID列表 (mat_001~mat_010) - 纳米战甲制造材料
  const NEW_MATERIAL_IDS = [
    { id: 'mat_001', name: '星铁基础构件', dropRate: 0.6, minAmount: 2, maxAmount: 5 },
    { id: 'mat_002', name: '星铜传导组件', dropRate: 0.5, minAmount: 1, maxAmount: 4 },
    { id: 'mat_003', name: '钛钢外甲坯料', dropRate: 0.4, minAmount: 1, maxAmount: 3 },
    { id: 'mat_004', name: '战甲能量晶核', dropRate: 0.35, minAmount: 1, maxAmount: 3 },
    { id: 'mat_005', name: '稀土传感基质', dropRate: 0.3, minAmount: 1, maxAmount: 2 },
    { id: 'mat_006', name: '虚空防护核心', dropRate: 0.25, minAmount: 1, maxAmount: 2 },
    { id: 'mat_007', name: '推进模块燃料', dropRate: 0.5, minAmount: 2, maxAmount: 4 },
    { id: 'mat_008', name: '纳米韧化纤维', dropRate: 0.4, minAmount: 1, maxAmount: 3 },
    { id: 'mat_009', name: '陨铁缓冲衬垫', dropRate: 0.35, minAmount: 1, maxAmount: 2 },
    { id: 'mat_010', name: '量子紧固组件', dropRate: 0.3, minAmount: 1, maxAmount: 2 },
  ];

  // 根据星球等级决定材料品质掉落概率
  const getQualityDropRates = (planetLevel: number): Record<ArmorQuality, number> => {
    // 基础概率
    const baseRates: Record<ArmorQuality, number> = {
      [ArmorQuality.STARDUST]: 0.50,
      [ArmorQuality.ALLOY]: 0.30,
      [ArmorQuality.CRYSTAL]: 0.15,
      [ArmorQuality.QUANTUM]: 0.04,
      [ArmorQuality.VOID]: 0.01,
    };

    // 根据星球等级调整概率
    // 等级越高，高品质概率越高
    const levelBonus = Math.min(planetLevel * 0.02, 0.20); // 最多+20%

    return {
      [ArmorQuality.STARDUST]: Math.max(0.10, baseRates[ArmorQuality.STARDUST] - levelBonus),
      [ArmorQuality.ALLOY]: baseRates[ArmorQuality.ALLOY],
      [ArmorQuality.CRYSTAL]: baseRates[ArmorQuality.CRYSTAL] + levelBonus * 0.5,
      [ArmorQuality.QUANTUM]: baseRates[ArmorQuality.QUANTUM] + levelBonus * 0.3,
      [ArmorQuality.VOID]: baseRates[ArmorQuality.VOID] + levelBonus * 0.1,
    };
  };

  // 随机决定材料品质
  const rollMaterialQuality = (planetLevel: number): ArmorQuality => {
    const rates = getQualityDropRates(planetLevel);
    const roll = Math.random();
    let cumulative = 0;

    for (const [quality, rate] of Object.entries(rates)) {
      cumulative += rate;
      if (roll <= cumulative) {
        return Number(quality) as ArmorQuality;
      }
    }
    return ArmorQuality.STARDUST;
  };

  const collectResources = async () => {
    if (!selectedPlanet || isCollecting) return;

    // 检查体力 - 采集消耗5体力
    if (gameManager.player.stamina < 5) {
      addLog('⚠️ 体力不足，无法采集资源');
      return;
    }

    setIsCollecting(true);
    addLog(`📦 开始采集 ${selectedPlanet.name} 的资源...`);

    // 消耗体力 - 采集消耗5体力
    gameManager.player.stamina -= 5;

    // 模拟采集时间
    await new Promise(resolve => setTimeout(resolve, 1500));

    // 必定有收获 - 随机选择1种材料
    const randomMaterial = NEW_MATERIAL_IDS[Math.floor(Math.random() * NEW_MATERIAL_IDS.length)];

    // 随机数量
    const count = Math.floor(Math.random() * (randomMaterial.maxAmount - randomMaterial.minAmount + 1)) + randomMaterial.minAmount;

    // 根据星球等级决定材料品质（与普通狩猎概率一致）
    const planetLevel = selectedPlanet?.level || 1;
    const quality = rollMaterialQuality(planetLevel);
    const qualitySuffix = QUALITY_SUFFIX[quality];
    const qualityId = `${randomMaterial.id}${qualitySuffix}`;
    const qualityName = ARMOR_QUALITY_NAMES[quality];

    // 添加到背包
    const added = gameManager.inventory.addItem(qualityId, count);

    if (added) {
      // 记录收集的资源
      const displayName = `${qualityName}${randomMaterial.name}`;
      setCollectedResources(prev => {
        const existing = prev.find(r => r.name === displayName);
        if (existing) {
          return prev.map(r => r.name === displayName ? { ...r, count: r.count + count } : r);
        }
        return [...prev, { name: displayName, count }];
      });

      addLog(`✅ 获得 ${displayName} x${count}`);
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
              else setPhase('galaxy_map');
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
                      onClick={() => selectPlanet(planet)}
                      typeColor={getPlanetTypeColor(planet.type)}
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
                      onClick={() => selectPlanet(planet)}
                      typeColor={getPlanetTypeColor(planet.type)}
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
                      onClick={() => selectPlanet(planet)}
                      typeColor={getPlanetTypeColor(planet.type)}
                    />
                  ))}
                </div>
              </div>
            )}
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
                description={`消耗10体力 | 击败普通虚空生物`}
                color="#10b981"
                onClick={() => onStartBattle(selectedPlanet.id, false, false)}
              />
              <ActionButton
                icon="👹"
                label="困难狩猎"
                description={`消耗10体力 | 击败精英虚空生物`}
                color="#8b5cf6"
                onClick={() => onStartBattle(selectedPlanet.id, false, true)}
              />
              <ActionButton
                icon="💀"
                label="挑战首领"
                description={`每日1次 | 消耗10体力`}
                color="#ef4444"
                onClick={() => onStartBattle(selectedPlanet.id, true, false)}
                disabled={!gameManager.isBossRefreshed(selectedPlanet.id)}
              />
              {/* 扫荡按钮：首次击败boss后解锁 */}
              {gameManager.getLocationProgress(selectedPlanet.id).bossDefeated && (
                <ActionButton
                  icon="⚡"
                  label="快速扫荡"
                  description={`消耗10体力 | 精英收益`}
                  color="#f59e0b"
                  onClick={handleSweep}
                />
              )}
              <ActionButton
                icon="📦"
                label={isCollecting ? "采集中..." : "采集资源"}
                description={`消耗5体力 | 剩余: ${gameManager.player.stamina}`}
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
  typeColor
}: {
  planet: Planet;
  onClick: () => void;
  typeColor: string;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '12px',
        background: 'linear-gradient(145deg, rgba(26, 31, 58, 0.8) 0%, rgba(10, 14, 39, 0.8) 100%)',
        border: `1px solid ${typeColor}60`,
        borderRadius: '12px',
        textAlign: 'left',
        cursor: 'pointer',
        color: 'white',
        transition: 'all 0.3s ease'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
        <span style={{ fontSize: '20px' }}>🪐</span>
        <span style={{
          fontSize: '14px',
          fontWeight: 'bold',
          color: typeColor
        }}>
          {planet.name}
        </span>
      </div>
      <div style={{ fontSize: '11px', color: '#71717a' }}>
        等级 {planet.level} | {planet.dangerLevel}
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
