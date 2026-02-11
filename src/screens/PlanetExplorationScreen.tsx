// 《星航荒宇》星球探索界面 - 使用新星球数据
import { useState, useEffect, useCallback } from 'react';
import { useGameStore } from '../stores/gameStore';
import { ALL_PLANETS_FULL, getPlanetById } from '../data/planets_full';
import { Planet, PlanetType } from '../data/types_new';
import { ArmorQuality, ARMOR_QUALITY_NAMES } from '../data/nanoArmorRecipes';
import 探索背景Img from '../assets/images/探索背景.jpg';

interface PlanetExplorationScreenProps {
  onBack: () => void;
  onStartBattle: (planetId: string, isBoss?: boolean, isElite?: boolean) => void;
  initialPlanetId?: string | null;
  returnToActionSelect?: boolean;
  onActionSelectHandled?: () => void;
  planetTypeFilter?: string | null;
}

type ExplorationPhase = 'galaxy_map' | 'exploring';

// 星球类型主题配置
const PLANET_THEMES: Record<string, {
  primary: string;
  secondary: string;
  glow: string;
  gradient: string;
  icon: string;
  bgOverlay: string;
}> = {
  tech: {
    primary: '#00d4ff',
    secondary: '#0099cc',
    glow: 'rgba(0, 212, 255, 0.6)',
    gradient: 'linear-gradient(135deg, #0c4a6e 0%, #0891b2 50%, #00d4ff 100%)',
    icon: '🏭',
    bgOverlay: 'rgba(0, 20, 40, 0.85)'
  },
  god: {
    primary: '#c084fc',
    secondary: '#7c3aed',
    glow: 'rgba(192, 132, 252, 0.6)',
    gradient: 'linear-gradient(135deg, #5b21b6 0%, #7c3aed 50%, #c084fc 100%)',
    icon: '⭐',
    bgOverlay: 'rgba(40, 0, 60, 0.85)'
  },
  wasteland: {
    primary: '#f87171',
    secondary: '#dc2626',
    glow: 'rgba(248, 113, 113, 0.6)',
    gradient: 'linear-gradient(135deg, #7f1d1d 0%, #dc2626 50%, #f87171 100%)',
    icon: '💀',
    bgOverlay: 'rgba(40, 0, 0, 0.85)'
  }
};

// 动画样式
const animationStyles = `
  @keyframes scan {
    0% { transform: translateY(-100%); }
    100% { transform: translateY(100%); }
  }
  @keyframes pulse-glow {
    0%, 100% { opacity: 0.5; box-shadow: 0 0 10px currentColor; }
    50% { opacity: 1; box-shadow: 0 0 20px currentColor, 0 0 30px currentColor; }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-5px); }
  }
  @keyframes border-flow {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  @keyframes card-pulse {
    0%, 100% { box-shadow: 0 0 20px rgba(0,0,0,0.4); }
    50% { box-shadow: 0 0 40px rgba(0,0,0,0.6), 0 0 60px rgba(255,255,255,0.1); }
  }
  @keyframes text-glow {
    0%, 100% { text-shadow: 0 0 10px currentColor; }
    50% { text-shadow: 0 0 20px currentColor, 0 0 30px currentColor; }
  }
  @keyframes arrow-bounce {
    0%, 100% { transform: translateX(0); }
    50% { transform: translateX(4px); }
  }
  @keyframes energy-pulse {
    0%, 100% { transform: scale(1); opacity: 0.5; }
    50% { transform: scale(1.05); opacity: 0.8; }
  }
`;

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
  const [hoveredPlanet, setHoveredPlanet] = useState<string | null>(null);

  // 获取当前主题
  const currentTheme = PLANET_THEMES[planetTypeFilter || 'tech'] || PLANET_THEMES.tech;

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

  // 按类型分组并按等级排序
  const techStars = filteredPlanets.filter(p => p.type === PlanetType.TECH_STAR).sort((a, b) => a.level - b.level);
  const godDomains = filteredPlanets.filter(p => p.type === PlanetType.GOD_DOMAIN).sort((a, b) => a.level - b.level);
  const wastelands = filteredPlanets.filter(p => p.type === PlanetType.WASTELAND).sort((a, b) => a.level - b.level);

  // 获取筛选后的标题
  const getFilterTitle = () => {
    if (planetTypeFilter === 'tech') return { icon: '🏭', name: '联邦科技星', count: techStars.length };
    if (planetTypeFilter === 'god') return { icon: '⭐', name: '神域星', count: godDomains.length };
    if (planetTypeFilter === 'wasteland') return { icon: '💀', name: '废土星', count: wastelands.length };
    return { icon: '🌌', name: '银河星图', count: filteredPlanets.length };
  };

  const titleInfo = getFilterTitle();

  const addLog = useCallback((message: string) => {
    setLogs(prev => [message, ...prev.slice(0, 9)]);
  }, []);

  // 选择星球
  const selectPlanet = (planet: Planet) => {
    setSelectedPlanet(planet);
    setPhase('exploring');
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

  // 新的材料ID列表
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
    const baseRates: Record<ArmorQuality, number> = {
      [ArmorQuality.STARDUST]: 0.50,
      [ArmorQuality.ALLOY]: 0.30,
      [ArmorQuality.CRYSTAL]: 0.15,
      [ArmorQuality.QUANTUM]: 0.04,
      [ArmorQuality.VOID]: 0.01,
    };
    const levelBonus = Math.min(planetLevel * 0.02, 0.20);
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
    if (gameManager.player.stamina < 5) {
      addLog('⚠️ 体力不足，无法采集资源');
      return;
    }

    setIsCollecting(true);
    addLog(`📦 采集 ${selectedPlanet.name} 的资源...`);
    gameManager.player.stamina -= 5;

    const randomMaterial = NEW_MATERIAL_IDS[Math.floor(Math.random() * NEW_MATERIAL_IDS.length)];
    const count = Math.floor(Math.random() * (randomMaterial.maxAmount - randomMaterial.minAmount + 1)) + randomMaterial.minAmount;
    const planetLevel = selectedPlanet?.level || 1;
    const quality = rollMaterialQuality(planetLevel);
    const qualitySuffix = QUALITY_SUFFIX[quality];
    const qualityId = `${randomMaterial.id}${qualitySuffix}`;
    const qualityName = ARMOR_QUALITY_NAMES[quality];

    const added = gameManager.inventory.addItem(qualityId, count);
    if (added) {
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

    try {
      await saveGame();
    } catch (error) {
      console.error('保存游戏出错:', error);
      addLog('⚠️ 保存游戏出错');
    }

    setIsCollecting(false);
  };

  // 扫荡功能
  const handleSweep = async () => {
    if (!selectedPlanet) return;
    addLog(`⚡ 开始扫荡 ${selectedPlanet.name}...`);
    const result = gameManager.sweepPlanet(selectedPlanet.id);

    if (result.success) {
      const lootSummary = result.rewards?.loot.map(l => `${l.name}x${l.quantity}`).join('、') || '无';
      addLog(`✅ 扫荡完成！获得 ${result.rewards?.exp || 0} 经验`);
      addLog(`📦 掉落：${lootSummary}`);

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

  return (
    <>
      <style>{animationStyles}</style>
      <div style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* 背景层 */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url(${探索背景Img})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          zIndex: 0
        }} />

        {/* 主题色叠加层 */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: currentTheme.bgOverlay,
          zIndex: 1
        }} />

        {/* 扫描线效果 */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(180deg, transparent 0%, ${currentTheme.glow}03 50%, transparent 100%)`,
          backgroundSize: '100% 4px',
          animation: 'scan 8s linear infinite',
          pointerEvents: 'none',
          zIndex: 2
        }} />

        {/* 网格叠加 */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            linear-gradient(${currentTheme.glow}05 1px, transparent 1px),
            linear-gradient(90deg, ${currentTheme.glow}05 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          zIndex: 1
        }} />

        {/* 顶部标题栏 - 玻璃拟态 */}
        <header style={{
          flexShrink: 0,
          position: 'relative',
          zIndex: 10,
          background: 'rgba(0, 10, 20, 0.7)',
          backdropFilter: 'blur(12px)',
          borderBottom: `1px solid ${currentTheme.primary}40`,
          padding: '12px 16px',
          boxShadow: `0 0 20px ${currentTheme.glow}20`
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
                gap: '6px',
                color: currentTheme.primary,
                background: `${currentTheme.glow}20`,
                border: `1px solid ${currentTheme.primary}40`,
                borderRadius: '8px',
                padding: '8px 12px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500,
                backdropFilter: 'blur(10px)',
                boxShadow: `0 0 15px ${currentTheme.glow}20`,
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = `${currentTheme.glow}40`;
                e.currentTarget.style.boxShadow = `0 0 20px ${currentTheme.glow}40`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = `${currentTheme.glow}20`;
                e.currentTarget.style.boxShadow = `0 0 15px ${currentTheme.glow}20`;
              }}
            >
              <span style={{ fontSize: '14px' }}>◀</span>
              <span>{phase === 'galaxy_map' ? '返回' : '返回星图'}</span>
            </button>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)'
            }}>
              <h1 style={{
                color: currentTheme.primary,
                fontWeight: 'bold',
                fontSize: '18px',
                margin: 0,
                letterSpacing: '2px',
                textShadow: `0 0 15px ${currentTheme.glow}, 0 0 30px ${currentTheme.glow}`
              }}>
                {titleInfo.icon} {phase === 'galaxy_map' ? titleInfo.name : '🔍 探索中'}
              </h1>
              {phase === 'galaxy_map' && (
                <span style={{
                  color: `${currentTheme.primary}80`,
                  fontSize: '10px',
                  letterSpacing: '2px',
                  marginTop: '2px'
                }}>
                  {titleInfo.count} 个星球
                </span>
              )}
            </div>

            <div style={{ width: '70px' }} />
          </div>
        </header>

        {/* 主内容区域 */}
        <main style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          position: 'relative',
          zIndex: 10
        }}>
          {/* 星图模式 */}
          {phase === 'galaxy_map' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* 科技星区域 */}
              {techStars.length > 0 && (
                <div>
                  <h3 style={{ 
                    color: PLANET_THEMES.tech.primary, 
                    fontSize: '16px', 
                    marginBottom: '12px',
                    textShadow: `0 0 10px ${PLANET_THEMES.tech.glow}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    {PLANET_THEMES.tech.icon} 联邦科技星 ({techStars.length})
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                    {techStars.map(planet => (
                      <PlanetCard
                        key={planet.id}
                        planet={planet}
                        onClick={() => selectPlanet(planet)}
                        theme={PLANET_THEMES.tech}
                        isHovered={hoveredPlanet === planet.id}
                        onHover={() => setHoveredPlanet(planet.id)}
                        onLeave={() => setHoveredPlanet(null)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* 神域星区域 */}
              {godDomains.length > 0 && (
                <div>
                  <h3 style={{ 
                    color: PLANET_THEMES.god.primary, 
                    fontSize: '16px', 
                    marginBottom: '12px',
                    textShadow: `0 0 10px ${PLANET_THEMES.god.glow}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    {PLANET_THEMES.god.icon} 神域星 ({godDomains.length})
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                    {godDomains.map(planet => (
                      <PlanetCard
                        key={planet.id}
                        planet={planet}
                        onClick={() => selectPlanet(planet)}
                        theme={PLANET_THEMES.god}
                        isHovered={hoveredPlanet === planet.id}
                        onHover={() => setHoveredPlanet(planet.id)}
                        onLeave={() => setHoveredPlanet(null)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* 废土星区域 */}
              {wastelands.length > 0 && (
                <div>
                  <h3 style={{ 
                    color: PLANET_THEMES.wasteland.primary, 
                    fontSize: '16px', 
                    marginBottom: '12px',
                    textShadow: `0 0 10px ${PLANET_THEMES.wasteland.glow}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    {PLANET_THEMES.wasteland.icon} 废土星 ({wastelands.length})
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                    {wastelands.map(planet => (
                      <PlanetCard
                        key={planet.id}
                        planet={planet}
                        onClick={() => selectPlanet(planet)}
                        theme={PLANET_THEMES.wasteland}
                        isHovered={hoveredPlanet === planet.id}
                        onHover={() => setHoveredPlanet(planet.id)}
                        onLeave={() => setHoveredPlanet(null)}
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
              {/* 星球信息卡片 */}
              <div style={{
                background: 'rgba(0, 10, 20, 0.7)',
                backdropFilter: 'blur(12px)',
                borderRadius: '16px',
                padding: '16px',
                border: `2px solid ${currentTheme.primary}`,
                boxShadow: `0 0 30px ${currentTheme.glow}40`,
                position: 'relative',
                overflow: 'hidden'
              }}>
                {/* 动态边框 */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  borderRadius: '16px',
                  padding: '2px',
                  backgroundImage: `linear-gradient(90deg, ${currentTheme.primary}, ${currentTheme.secondary}, ${currentTheme.primary})`,
                  backgroundSize: '200% 100%',
                  animation: 'border-flow 3s ease infinite',
                  WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  WebkitMaskComposite: 'xor',
                  maskComposite: 'exclude',
                  pointerEvents: 'none'
                }} />

                <h3 style={{ 
                  color: currentTheme.primary, 
                  margin: '0 0 8px 0',
                  fontSize: '18px',
                  textShadow: `0 0 10px ${currentTheme.glow}`,
                  position: 'relative',
                  zIndex: 1
                }}>
                  🪐 {selectedPlanet.name}
                </h3>
                <p style={{ 
                  color: 'rgba(255,255,255,0.6)', 
                  fontSize: '13px', 
                  margin: 0,
                  position: 'relative',
                  zIndex: 1
                }}>
                  等级 {selectedPlanet.level} | {selectedPlanet.dangerLevel} | 选择你要执行的行动
                </p>
              </div>

              {/* 行动按钮 */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                <ActionButton
                  icon="👾"
                  label="普通狩猎"
                  description="消耗10体力"
                  color="#10b981"
                  theme={currentTheme}
                  onClick={() => onStartBattle(selectedPlanet.id, false, false)}
                />
                <ActionButton
                  icon="👹"
                  label="困难狩猎"
                  description="消耗10体力"
                  color="#8b5cf6"
                  theme={currentTheme}
                  onClick={() => onStartBattle(selectedPlanet.id, false, true)}
                />
                <ActionButton
                  icon="💀"
                  label="挑战首领"
                  description={gameManager.isBossRefreshed(selectedPlanet.id) ? "每日1次" : "今日已挑战"}
                  color="#ef4444"
                  theme={currentTheme}
                  onClick={() => onStartBattle(selectedPlanet.id, true, false)}
                  disabled={!gameManager.isBossRefreshed(selectedPlanet.id)}
                />
                {gameManager.getLocationProgress(selectedPlanet.id).bossDefeated && (
                  <ActionButton
                    icon="⚡"
                    label="快速扫荡"
                    description="消耗10体力"
                    color="#f59e0b"
                    theme={currentTheme}
                    onClick={handleSweep}
                  />
                )}
                <ActionButton
                  icon="📦"
                  label={isCollecting ? "采集中..." : "采集资源"}
                  description={`消耗5体力 | 剩余: ${gameManager.player.stamina}`}
                  color="#f59e0b"
                  theme={currentTheme}
                  onClick={collectResources}
                />
              </div>

              {/* 本次收集的资源 */}
              {collectedResources.length > 0 && (
                <div style={{
                  background: 'rgba(16, 185, 129, 0.1)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: '12px',
                  padding: '12px',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  boxShadow: '0 0 20px rgba(16, 185, 129, 0.1)'
                }}>
                  <h4 style={{ color: '#10b981', fontSize: '12px', margin: '0 0 8px 0' }}>📦 本次收获</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {collectedResources.map((resource, index) => (
                      <span key={index} style={{
                        fontSize: '12px',
                        padding: '4px 10px',
                        background: 'rgba(16, 185, 129, 0.2)',
                        borderRadius: '4px',
                        color: '#10b981',
                        border: '1px solid rgba(16, 185, 129, 0.3)'
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
                  background: 'rgba(0, 10, 20, 0.6)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: '12px',
                  padding: '12px',
                  border: `1px solid ${currentTheme.primary}30`,
                  maxHeight: '150px',
                  overflowY: 'auto',
                  boxShadow: `0 0 20px ${currentTheme.glow}10`
                }}>
                  <h4 style={{ color: currentTheme.primary, fontSize: '12px', margin: '0 0 8px 0' }}>探索日志</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {logs.map((log, index) => (
                      <span key={index} style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>{log}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </>
  );
}

// 星球卡片组件
function PlanetCard({
  planet,
  onClick,
  theme,
  isHovered,
  onHover,
  onLeave
}: {
  planet: Planet;
  onClick: () => void;
  theme: typeof PLANET_THEMES.tech;
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
}) {
  return (
    <button
      onClick={onClick}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      style={{
        position: 'relative',
        padding: '14px',
        background: isHovered 
          ? `linear-gradient(135deg, rgba(0,0,0,0.6) 0%, ${theme.glow}15 50%, rgba(0,0,0,0.6) 100%)`
          : 'rgba(0, 10, 20, 0.5)',
        border: `1px solid ${isHovered ? theme.primary : `${theme.primary}40`}`,
        borderRadius: '12px',
        textAlign: 'left',
        cursor: 'pointer',
        color: 'white',
        transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        backdropFilter: 'blur(8px)',
        boxShadow: isHovered 
          ? `0 0 25px ${theme.glow}, inset 0 0 20px ${theme.glow}20`
          : `0 0 10px ${theme.glow}20`,
        overflow: 'hidden'
      }}
    >
      {/* 动态边框 */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: '12px',
        padding: '1px',
        backgroundImage: `linear-gradient(90deg, ${theme.primary}, ${theme.secondary}, ${theme.primary})`,
        backgroundSize: '200% 100%',
        animation: isHovered ? 'border-flow 2s ease infinite' : 'none',
        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
        WebkitMaskComposite: 'xor',
        maskComposite: 'exclude',
        opacity: isHovered ? 1 : 0.5
      }} />

      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '10px', 
        marginBottom: '8px',
        position: 'relative',
        zIndex: 1
      }}>
        <span style={{ 
          fontSize: '22px',
          filter: isHovered ? `drop-shadow(0 0 8px ${theme.glow})` : 'none',
          transition: 'all 0.3s ease'
        }}>🪐</span>
        <span style={{
          fontSize: '14px',
          fontWeight: 'bold',
          color: theme.primary,
          textShadow: isHovered ? `0 0 10px ${theme.glow}` : 'none',
          transition: 'all 0.3s ease'
        }}>
          {planet.name}
        </span>
      </div>
      <div style={{ 
        fontSize: '11px', 
        color: 'rgba(255,255,255,0.5)',
        position: 'relative',
        zIndex: 1
      }}>
        等级 {planet.level} | {planet.dangerLevel}
      </div>

      {/* 底部渐变条 */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '2px',
        background: theme.gradient,
        opacity: isHovered ? 1 : 0.5
      }} />
    </button>
  );
}

// 行动按钮组件
function ActionButton({
  icon,
  label,
  description,
  color,
  theme,
  onClick,
  disabled = false
}: {
  icon: string;
  label: string;
  description: string;
  color: string;
  theme: typeof PLANET_THEMES.tech;
  onClick: () => void;
  disabled?: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'relative',
        padding: '16px',
        background: disabled 
          ? 'rgba(50, 50, 50, 0.3)' 
          : isHovered 
            ? `linear-gradient(135deg, rgba(0,0,0,0.5) 0%, ${theme.glow}20 50%, rgba(0,0,0,0.5) 100%)`
            : 'rgba(0, 10, 20, 0.5)',
        border: `1px solid ${disabled ? 'rgba(100,100,100,0.3)' : isHovered ? color : `${color}60`}`,
        borderRadius: '12px',
        color: disabled ? '#666' : 'white',
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '6px',
        transition: 'all 0.3s ease',
        backdropFilter: 'blur(8px)',
        boxShadow: disabled 
          ? 'none' 
          : isHovered 
            ? `0 0 20px ${theme.glow}, inset 0 0 15px ${theme.glow}20`
            : `0 0 10px ${theme.glow}20`,
        overflow: 'hidden'
      }}
    >
      <span style={{ 
        fontSize: '26px', 
        opacity: disabled ? 0.4 : 1,
        filter: isHovered && !disabled ? `drop-shadow(0 0 8px ${color})` : 'none',
        transition: 'all 0.3s ease'
      }}>{icon}</span>
      <span style={{ 
        fontSize: '14px', 
        fontWeight: 'bold', 
        color: disabled ? '#666' : color,
        textShadow: isHovered && !disabled ? `0 0 10px ${color}` : 'none',
        transition: 'all 0.3s ease'
      }}>{label}</span>
      <span style={{ 
        fontSize: '10px', 
        color: disabled ? '#555' : 'rgba(255,255,255,0.5)'
      }}>{description}</span>

      {/* 底部渐变条 */}
      {!disabled && (
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
          opacity: isHovered ? 1 : 0.5
        }} />
      )}
    </button>
  );
}
