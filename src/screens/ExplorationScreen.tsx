import { useState, useEffect, useCallback } from 'react';
import { useGameStore } from '../stores/gameStore';
import { LOCATIONS, ALL_MATERIAL_BASE_IDS, rollMaterialQuality, STATION_QUALITY_RATES } from '../data/locations';
import { generateMaterialId, MATERIAL_QUALITY_NAMES, MaterialQuality } from '../data/craftingMaterials';

interface ExplorationScreenProps {
  onBack: () => void;
  onStartBattle: (locationId: string, isBoss?: boolean, isElite?: boolean) => void;
  initialLocationId?: string | null;
  returnToActionSelect?: boolean;
  onActionSelectHandled?: () => void;
}

type ExplorationPhase = 'select' | 'driving' | 'action_select' | 'collecting' | 'complete';

interface ExplorationState {
  phase: ExplorationPhase;
  locationId: string | null;
  collectedItems: { name: string; quantity: number }[];
  driveTimeRemaining: number;
}

export default function ExplorationScreen({ onBack, onStartBattle, initialLocationId, returnToActionSelect, onActionSelectHandled }: ExplorationScreenProps) {
  const { gameManager } = useGameStore();
  const [exploration, setExploration] = useState<ExplorationState>({
    phase: initialLocationId ? 'action_select' : 'select',
    locationId: initialLocationId || null,
    collectedItems: [],
    driveTimeRemaining: 0,
  });
  const [logs, setLogs] = useState<string[]>([]);

  // 处理从战斗返回时切换到行动选择界面
  useEffect(() => {
    if (returnToActionSelect && initialLocationId && onActionSelectHandled) {
      setExploration({
        phase: 'action_select',
        locationId: initialLocationId,
        collectedItems: [],
        driveTimeRemaining: 0,
      });
      onActionSelectHandled();
    }
  }, [returnToActionSelect, initialLocationId, onActionSelectHandled]);

  const addLog = useCallback((message: string) => {
    setLogs(prev => [...prev.slice(-5), message]);
  }, []);

  // 获取当前地点的进度
  const getCurrentProgress = () => {
    if (!exploration.locationId) return null;
    return gameManager.getLocationProgress(exploration.locationId);
  };

  // 开始探索 - 直接进入行动选择
  const startExploration = (locationId: string) => {
    const location = LOCATIONS.find(l => l.id === locationId);
    if (!location) return;

    // 直接到达目的地，消耗时间（30分钟）
    gameManager.advanceTime(30);
    setExploration({
      phase: 'action_select',
      locationId,
      collectedItems: [],
      driveTimeRemaining: 0,
    });

    addLog(`🚂 到达 ${location.name}！请选择行动`);
  };

  // 驶入计时器
  useEffect(() => {
    if (exploration.phase !== 'driving' || exploration.driveTimeRemaining <= 0) return;

    const timer = setInterval(() => {
      setExploration(prev => {
        const newTime = prev.driveTimeRemaining - 1;
        if (newTime <= 0) {
          // 驶入完成，消耗时间（30分钟）
          gameManager.advanceTime(30);
          addLog('🚂 到达目的地！请选择行动');
          return {
            ...prev,
            phase: 'action_select',
            driveTimeRemaining: 0,
          };
        }
        return { ...prev, driveTimeRemaining: newTime };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [exploration.phase, exploration.driveTimeRemaining, addLog, gameManager]);

  // 选择物资收集
  const startCollecting = () => {
    // 检查体力是否足够
    if (gameManager.player.stamina < 5) {
      addLog('⚠️ 体力不足，无法收集');
      return;
    }
    addLog('📦 开始收集物资...');
    setExploration(prev => ({
      ...prev,
      phase: 'collecting',
    }));
  };

  // 选择狩猎 - 普通难度
  const startHuntingNormal = () => {
    // 检查体力是否足够
    if (gameManager.player.stamina < 10) {
      addLog('⚠️ 体力不足，无法狩猎');
      return;
    }
    // 消耗时间和体力
    gameManager.advanceTime(15);
    gameManager.player.stamina -= 10;
    addLog('👹 开始狩猎（普通）...');
    // 狩猎一定会遇到普通敌人
    if (exploration.locationId) {
      onStartBattle(exploration.locationId, false);
    }
  };

  // 选择狩猎 - 困难难度（精英敌人）
  const startHuntingHard = () => {
    // 检查体力是否足够
    if (gameManager.player.stamina < 15) {
      addLog('⚠️ 体力不足，无法狩猎（困难）');
      return;
    }
    // 消耗时间和体力
    gameManager.advanceTime(20);
    gameManager.player.stamina -= 15;
    addLog('👹 开始狩猎（困难）...');
    // 狩猎一定会遇到精英敌人
    if (exploration.locationId) {
      onStartBattle(exploration.locationId, false, true);
    }
  };

  // 选择挑战BOSS
  const startBossBattle = () => {
    if (!exploration.locationId) return;

    // 检查今天是否已经挑战过
    const progress = gameManager.getLocationProgress(exploration.locationId);
    const today = new Date().toISOString().split('T')[0];
    if (progress.lastBossChallengeDate === today) {
      addLog('⚠️ 今天已经挑战过BOSS，请明天再来');
      return;
    }

    // 检查体力
    if (gameManager.player.stamina < 10) {
      addLog('⚠️ 体力不足，无法挑战BOSS');
      return;
    }

    // 记录挑战日期
    gameManager.recordBossChallenge(exploration.locationId);

    // 消耗时间和体力
    gameManager.advanceTime(15);
    gameManager.player.stamina -= 10;
    addLog('👹 挑战BOSS！');

    onStartBattle(exploration.locationId, true);
  };

  // 扫荡
  const doSweep = () => {
    if (!exploration.locationId) return;

    // 检查体力
    if (gameManager.player.stamina < 10) {
      addLog('⚠️ 体力不足，无法扫荡');
      return;
    }

    // 消耗时间和体力
    gameManager.advanceTime(15);
    gameManager.player.stamina -= 10;

    // 根据地点生成不同的奖励
    const location = LOCATIONS.find(l => l.id === exploration.locationId);
    const rewards: { name: string; itemId: string; quantity: number }[] = [];

    if (location) {
      // 根据地点类型生成不同奖励
      switch (location.id) {
        case 'loc_001': // 废弃车站
          rewards.push({ name: '废铁片', itemId: 'mat_001', quantity: 2 });
          rewards.push({ name: '布料', itemId: 'mat_002', quantity: 1 });
          break;
        case 'loc_002': // 废弃工厂
          rewards.push({ name: '废铁片', itemId: 'mat_001', quantity: 3 });
          rewards.push({ name: '电子元件', itemId: 'mat_003', quantity: 1 });
          break;
        case 'loc_003': // 废弃医院
          rewards.push({ name: '医疗绷带', itemId: 'consumable_003', quantity: 2 });
          rewards.push({ name: '布料', itemId: 'mat_002', quantity: 2 });
          break;
        case 'loc_004': // 荒野
          rewards.push({ name: '布料', itemId: 'mat_002', quantity: 2 });
          rewards.push({ name: '瓶装水', itemId: 'consumable_001', quantity: 1 });
          break;
        case 'loc_005': // 地下掩体
          rewards.push({ name: '电子元件', itemId: 'mat_003', quantity: 2 });
          rewards.push({ name: '废铁片', itemId: 'mat_001', quantity: 2 });
          break;
        case 'loc_006': // 废弃超市
          rewards.push({ name: '压缩饼干', itemId: 'consumable_002', quantity: 2 });
          rewards.push({ name: '瓶装水', itemId: 'consumable_001', quantity: 2 });
          break;
        case 'loc_007': // 废弃学校
          rewards.push({ name: '布料', itemId: 'mat_002', quantity: 2 });
          rewards.push({ name: '废铁片', itemId: 'mat_001', quantity: 1 });
          break;
        default:
          rewards.push({ name: '废铁片', itemId: 'mat_001', quantity: 2 });
          rewards.push({ name: '布料', itemId: 'mat_002', quantity: 1 });
      }
    }

    addLog('🧹 扫荡完成！');

    // 添加物品到背包并显示
    rewards.forEach(reward => {
      gameManager.inventory.addItem(reward.itemId, reward.quantity);
      addLog(`获得: ${reward.name} x${reward.quantity}`);
    });
  };

  // 物资收集阶段 - 每3秒一次
  useEffect(() => {
    if (exploration.phase !== 'collecting') return;

    const timer = setInterval(() => {
      setExploration(prev => {
        // 检查体力是否足够
        if (gameManager.player.stamina < 5) {
          addLog('⚠️ 体力不足，停止收集');
          return {
            ...prev,
            phase: 'action_select',
          };
        }

        // 消耗时间和体力
        gameManager.advanceTime(10);
        gameManager.player.stamina -= 5;

        // 增加进度
        const progress = gameManager.getLocationProgress(prev.locationId!);
        const newMaterialProgress = Math.min(20, progress.materialProgress + 5);
        gameManager.updateLocationProgress(prev.locationId!, {
          materialProgress: newMaterialProgress
        });

        // 随机获得制造材料（所有站台都可以掉落全部6种材料）
        const location = LOCATIONS.find(l => l.id === prev.locationId);
        const locationIndex = LOCATIONS.findIndex(l => l.id === prev.locationId);
        const stationNumber = locationIndex + 1;

        // 随机选择材料类型（全部6种材料）
        const randomMaterialIndex = Math.floor(Math.random() * ALL_MATERIAL_BASE_IDS.length);
        const selectedBaseMaterial = ALL_MATERIAL_BASE_IDS[randomMaterialIndex];

        // 根据站台决定材料品质
        const rolledQuality = rollMaterialQuality(stationNumber);
        const qualityName = MATERIAL_QUALITY_NAMES[rolledQuality];

        // 生成带品质的材料ID
        const itemIdToAdd = generateMaterialId(selectedBaseMaterial.id.replace('craft_', '') as any, rolledQuality);
        const itemName = rolledQuality === 1
          ? selectedBaseMaterial.name
          : `${qualityName}${selectedBaseMaterial.name}`;

        // 添加到背包
        gameManager.inventory.addItem(itemIdToAdd, 1);

        // 记录收集的物品
        const newCollectedItems = [...prev.collectedItems];
        const existingItem = newCollectedItems.find(item => item.name === itemName);
        if (existingItem) {
          existingItem.quantity += 1;
        } else {
          newCollectedItems.push({ name: itemName, quantity: 1 });
        }

        addLog(`获得: ${itemName} x1`);

        // 检查是否满进度（只提示，不自动返回）
        if (newMaterialProgress >= 20) {
          addLog('✅ 物资收集进度已满！可继续收集');
        }

        return {
          ...prev,
          collectedItems: newCollectedItems,
        };
      });
    }, 3000);

    return () => clearInterval(timer);
  }, [exploration.phase, addLog, gameManager]);

  // 结束探索
  const finishExploration = () => {
    // 重置当前地点的探索状态
    setExploration({
      phase: 'select',
      locationId: null,
      collectedItems: [],
      driveTimeRemaining: 0,
    });
    onBack();
  };

  // 渲染界面
  return (
    <div style={{
      height: '100vh',
      backgroundColor: '#1a1a1a',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* 顶部标题栏 */}
      <header style={{
        flexShrink: 0,
        backgroundColor: '#2d2d2d',
        borderBottom: '1px solid #4b5563',
        padding: '12px 16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            onClick={exploration.phase === 'select' ? onBack : finishExploration}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: '#9ca3af',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            <span>←</span>
            <span>{exploration.phase === 'select' ? '返回' : '结束'}</span>
          </button>
          <h1 style={{ color: 'white', fontWeight: 'bold', fontSize: '18px' }}>
            {exploration.phase === 'select' && '选择探索地点'}
            {exploration.phase === 'driving' && '行驶中...'}
            {exploration.phase === 'action_select' && '选择行动'}
            {exploration.phase === 'collecting' && '收集物资中'}
          </h1>
          <div style={{ width: '48px' }} />
        </div>
      </header>

      {/* 主内容区域 */}
      <main style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px'
      }}>
        {/* 选择地点阶段 */}
        {exploration.phase === 'select' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {LOCATIONS.map(location => {
              const progress = gameManager.getLocationProgress(location.id);
              const isBossDefeated = progress.bossDefeated;
              const isBossRefreshed = gameManager.isBossRefreshed(location.id);

              // 获取品质掉落率
              const locationIndex = LOCATIONS.findIndex(l => l.id === location.id);
              const stationNumber = locationIndex + 1;
              const qualityRates = STATION_QUALITY_RATES[stationNumber] || STATION_QUALITY_RATES[1];

              // 品质颜色映射
              const qualityColors: Record<number, string> = {
                [MaterialQuality.NORMAL]: '#9ca3af',    // 灰色
                [MaterialQuality.GOOD]: '#22c55e',      // 绿色
                [MaterialQuality.FINE]: '#3b82f6',      // 蓝色
                [MaterialQuality.RARE]: '#a855f7',      // 紫色
                [MaterialQuality.LEGENDARY]: '#f97316', // 橙色
              };

              return (
                <button
                  key={location.id}
                  onClick={() => startExploration(location.id)}
                  style={{
                    padding: '16px',
                    backgroundColor: '#2d2d2d',
                    border: '1px solid #374151',
                    borderRadius: '12px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    color: 'white'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '24px' }}>{location.icon}</span>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>{location.name}</h3>
                      <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#9ca3af' }}>
                        {location.description}
                      </p>
                    </div>
                    {isBossDefeated && (
                      <span style={{
                        fontSize: '11px',
                        padding: '4px 8px',
                        backgroundColor: isBossRefreshed ? '#dc2626' : '#065f46',
                        borderRadius: '4px',
                        color: 'white'
                      }}>
                        {isBossRefreshed ? 'BOSS已刷新' : '已通关'}
                      </span>
                    )}
                  </div>

                  {/* 品质掉落率 */}
                  <div style={{
                    marginBottom: '8px',
                    padding: '8px',
                    backgroundColor: '#1f2937',
                    borderRadius: '8px'
                  }}>
                    <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>
                      📊 品质掉落率:
                    </div>
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '4px'
                    }}>
                      {Object.entries(qualityRates)
                        .filter(([_, rate]) => rate > 0)
                        .map(([quality, rate]) => {
                          const qualityNum = parseInt(quality) as MaterialQuality;
                          const qualityName = MATERIAL_QUALITY_NAMES[qualityNum];
                          return (
                            <span
                              key={quality}
                              style={{
                                fontSize: '11px',
                                padding: '2px 6px',
                                backgroundColor: qualityColors[qualityNum] || '#374151',
                                borderRadius: '4px',
                                color: 'white',
                                fontWeight: 'bold'
                              }}
                            >
                              {qualityName}: {(rate * 100).toFixed(0)}%
                            </span>
                          );
                        })}
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    gap: '16px',
                    fontSize: '12px',
                    color: '#9ca3af'
                  }}>
                    <span>📦 {progress.materialProgress}/20</span>
                    <span>👹 {progress.huntProgress}/80</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* 行驶阶段 */}
        {exploration.phase === 'driving' && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            gap: '24px'
          }}>
            <div style={{ fontSize: '64px' }}>🚂</div>
            <div style={{ color: 'white', fontSize: '18px', fontWeight: 'bold' }}>
              行驶中...
            </div>
            <div style={{
              width: '200px',
              height: '8px',
              backgroundColor: '#374151',
              borderRadius: '9999px',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                backgroundColor: '#d97706',
                transition: 'width 1s linear',
                width: `${((3 - exploration.driveTimeRemaining) / 3) * 100}%`
              }} />
            </div>
            <p style={{ color: '#9ca3af', fontSize: '14px' }}>
              预计 {exploration.driveTimeRemaining} 秒后到达
            </p>
          </div>
        )}

        {/* 选择行动阶段 */}
        {exploration.phase === 'action_select' && exploration.locationId && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* 进度显示 */}
            {(() => {
              const progress = getCurrentProgress();
              if (!progress) return null;

              return (
                <div style={{
                  backgroundColor: '#2d2d2d',
                  borderRadius: '12px',
                  padding: '16px',
                  border: '1px solid #374151'
                }}>
                  <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '8px' }}>🎯</div>
                    <h2 style={{ color: 'white', margin: 0, fontSize: '18px' }}>到达目的地！</h2>
                  </div>

                  {/* 物资收集进度 */}
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ color: '#9ca3af', fontSize: '14px' }}>📦 物资收集</span>
                      <span style={{ color: progress.materialProgress >= 20 ? '#4ade80' : '#fbbf24', fontSize: '14px' }}>
                        {progress.materialProgress}%/20%
                      </span>
                    </div>
                    <div style={{
                      backgroundColor: '#1f2937',
                      borderRadius: '9999px',
                      height: '8px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        height: '100%',
                        backgroundColor: progress.materialProgress >= 20 ? '#4ade80' : '#fbbf24',
                        transition: 'width 0.5s',
                        width: `${Math.min(100, (progress.materialProgress / 20) * 100)}%`
                      }} />
                    </div>
                  </div>

                  {/* 狩猎进度 */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ color: '#9ca3af', fontSize: '14px' }}>👹 狩猎进度</span>
                      <span style={{ color: progress.huntProgress >= 80 ? '#ef4444' : '#fbbf24', fontSize: '14px' }}>
                        {progress.huntProgress}%/80%
                      </span>
                    </div>
                    <div style={{
                      backgroundColor: '#1f2937',
                      borderRadius: '9999px',
                      height: '8px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        height: '100%',
                        backgroundColor: progress.huntProgress >= 80 ? '#ef4444' : '#fbbf24',
                        transition: 'width 0.5s',
                        width: `${Math.min(100, (progress.huntProgress / 80) * 100)}%`
                      }} />
                    </div>
                  </div>
                </div>
              );
            })()}

            <p style={{ color: '#9ca3af', textAlign: 'center', margin: '0' }}>
              请选择要进行的行动
            </p>

            {/* 物资收集按钮 */}
            <button
              onClick={startCollecting}
              disabled={gameManager.player.stamina < 5}
              style={{
                padding: '16px',
                backgroundColor: gameManager.player.stamina < 5 ? '#4b5563' : '#16a34a',
                color: 'white',
                borderRadius: '12px',
                border: 'none',
                cursor: gameManager.player.stamina < 5 ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                fontSize: '16px'
              }}
            >
              <div>📦 物资收集</div>
              <div style={{ fontSize: '12px', fontWeight: 'normal', marginTop: '4px', opacity: 0.8 }}>
                消耗: 10分钟 + 5体力 | 进度满后可继续收集
              </div>
            </button>

            {/* 狩猎按钮区域 */}
            {(() => {
              const progress = getCurrentProgress();
              if (!progress) return null;

              const canChallengeBoss = progress.materialProgress >= 20 && progress.huntProgress >= 80;
              const isBossDefeated = progress.bossDefeated;
              const canChallengeToday = gameManager.isBossRefreshed(exploration.locationId!);

              return (
                <>
                  {/* 狩猎（普通）按钮 - 始终显示 */}
                  <button
                    onClick={startHuntingNormal}
                    disabled={gameManager.player.stamina < 10}
                    style={{
                      padding: '16px',
                      backgroundColor: gameManager.player.stamina < 10 ? '#4b5563' : '#dc2626',
                      color: 'white',
                      borderRadius: '12px',
                      border: 'none',
                      cursor: gameManager.player.stamina < 10 ? 'not-allowed' : 'pointer',
                      fontWeight: 'bold',
                      fontSize: '16px'
                    }}
                  >
                    <div>👹 狩猎（普通）</div>
                    <div style={{ fontSize: '12px', fontWeight: 'normal', marginTop: '4px', opacity: 0.8 }}>
                      消耗: 15分钟 + 10体力 | 遭遇普通敌人 | +10%狩猎进度
                    </div>
                  </button>

                  {/* 狩猎（困难）按钮 - 始终显示 */}
                  <button
                    onClick={startHuntingHard}
                    disabled={gameManager.player.stamina < 15}
                    style={{
                      padding: '16px',
                      backgroundColor: gameManager.player.stamina < 15 ? '#4b5563' : '#ea580c',
                      color: 'white',
                      borderRadius: '12px',
                      border: 'none',
                      cursor: gameManager.player.stamina < 15 ? 'not-allowed' : 'pointer',
                      fontWeight: 'bold',
                      fontSize: '16px'
                    }}
                  >
                    <div>👹 狩猎（困难）</div>
                    <div style={{ fontSize: '12px', fontWeight: 'normal', marginTop: '4px', opacity: 0.8 }}>
                      消耗: 20分钟 + 15体力 | 遭遇精英敌人 | +15%狩猎进度
                    </div>
                  </button>

                  {/* BOSS已击败后的扫荡和挑战按钮 */}
                  {isBossDefeated && (
                    <>
                      <button
                        onClick={doSweep}
                        disabled={gameManager.player.stamina < 10}
                        style={{
                          padding: '16px',
                          backgroundColor: gameManager.player.stamina < 10 ? '#4b5563' : '#8b5cf6',
                          color: 'white',
                          borderRadius: '12px',
                          border: 'none',
                          cursor: gameManager.player.stamina < 10 ? 'not-allowed' : 'pointer',
                          fontWeight: 'bold',
                          fontSize: '16px'
                        }}
                      >
                        <div>🧹 扫荡</div>
                        <div style={{ fontSize: '12px', fontWeight: 'normal', marginTop: '4px', opacity: 0.8 }}>
                          消耗: 15分钟 + 10体力 | 快速获得奖励
                        </div>
                      </button>
                      {canChallengeToday ? (
                        <button
                          onClick={startBossBattle}
                          disabled={gameManager.player.stamina < 10}
                          style={{
                            padding: '16px',
                            backgroundColor: gameManager.player.stamina < 10 ? '#4b5563' : '#dc2626',
                            color: 'white',
                            borderRadius: '12px',
                            border: 'none',
                            cursor: gameManager.player.stamina < 10 ? 'not-allowed' : 'pointer',
                            fontWeight: 'bold',
                            fontSize: '16px'
                          }}
                        >
                          <div>👹 挑战BOSS</div>
                          <div style={{ fontSize: '12px', fontWeight: 'normal', marginTop: '4px', opacity: 0.8 }}>
                            消耗: 15分钟 + 10体力 | 已刷新，可再次挑战
                          </div>
                        </button>
                      ) : (
                        <button
                          disabled
                          style={{
                            padding: '16px',
                            backgroundColor: '#4b5563',
                            color: '#9ca3af',
                            borderRadius: '12px',
                            border: 'none',
                            cursor: 'not-allowed',
                            fontWeight: 'bold',
                            fontSize: '16px'
                          }}
                        >
                          <div>⏳ 明日再来</div>
                          <div style={{ fontSize: '12px', fontWeight: 'normal', marginTop: '4px', opacity: 0.8 }}>
                            今天已经挑战过，请明天再来
                          </div>
                        </button>
                      )}
                    </>
                  )}

                  {/* BOSS未击败且条件满足时显示挑战BOSS按钮 */}
                  {!isBossDefeated && canChallengeBoss && (
                    <button
                      onClick={startBossBattle}
                      disabled={gameManager.player.stamina < 10}
                      style={{
                        padding: '16px',
                        backgroundColor: gameManager.player.stamina < 10 ? '#4b5563' : '#dc2626',
                        color: 'white',
                        borderRadius: '12px',
                        border: 'none',
                        cursor: gameManager.player.stamina < 10 ? 'not-allowed' : 'pointer',
                        fontWeight: 'bold',
                        fontSize: '16px'
                      }}
                    >
                      <div>👹 挑战BOSS</div>
                      <div style={{ fontSize: '12px', fontWeight: 'normal', marginTop: '4px', opacity: 0.8 }}>
                        消耗: 15分钟 + 10体力 | 物资和狩猎进度已满！
                      </div>
                    </button>
                  )}
                </>
              );
            })()}
          </div>
        )}

        {/* 收集阶段 */}
        {exploration.phase === 'collecting' && exploration.locationId && (
          <>
            {/* 体力显示 */}
            <div style={{
              backgroundColor: '#2d2d2d',
              borderRadius: '12px',
              padding: '16px',
              border: '1px solid #374151',
              marginBottom: '16px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ color: '#9ca3af', fontSize: '14px' }}>⚡ 体力</span>
                <span style={{
                  color: gameManager.player.stamina < 10 ? '#ef4444' : '#4ade80',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}>
                  {gameManager.player.stamina}/{gameManager.player.maxStamina}
                </span>
              </div>
              <div style={{
                backgroundColor: '#1f2937',
                borderRadius: '9999px',
                height: '8px',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  backgroundColor: gameManager.player.stamina < 10 ? '#ef4444' : '#22c55e',
                  transition: 'width 0.5s',
                  width: `${(gameManager.player.stamina / gameManager.player.maxStamina) * 100}%`
                }} />
              </div>
              <p style={{ color: '#6b7280', fontSize: '12px', margin: '8px 0 0 0', textAlign: 'center' }}>
                每次消耗: 5体力 | 剩余次数: {Math.floor(gameManager.player.stamina / 5)}次
              </p>
            </div>

            {/* 物资收集进度 */}
            {(() => {
              const progress = gameManager.getLocationProgress(exploration.locationId!);
              return (
                <div style={{
                  backgroundColor: '#2d2d2d',
                  borderRadius: '12px',
                  padding: '16px',
                  border: '1px solid #374151',
                  marginBottom: '16px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: '#9ca3af', fontSize: '14px' }}>📦 物资收集进度</span>
                    <span style={{ color: progress.materialProgress >= 20 ? '#4ade80' : '#fbbf24', fontSize: '14px' }}>
                      {progress.materialProgress}%{progress.materialProgress >= 20 ? ' (已满，可继续)' : ''}
                    </span>
                  </div>
                  <div style={{
                    backgroundColor: '#1f2937',
                    borderRadius: '9999px',
                    height: '10px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      height: '100%',
                      backgroundColor: progress.materialProgress >= 20 ? '#4ade80' : '#fbbf24',
                      transition: 'width 0.5s',
                      width: `${Math.min(100, (progress.materialProgress / 20) * 100)}%`
                    }} />
                  </div>
                </div>
              );
            })()}

            {/* 已收集物品 */}
            {exploration.collectedItems.length > 0 && (
              <div style={{
                backgroundColor: '#2d2d2d',
                borderRadius: '12px',
                padding: '16px',
                border: '1px solid #374151',
                marginBottom: '16px'
              }}>
                <h3 style={{ color: '#9ca3af', fontSize: '14px', margin: '0 0 12px 0' }}>已收集物品</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {exploration.collectedItems.map((item, index) => (
                    <span
                      key={index}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#374151',
                        borderRadius: '6px',
                        fontSize: '12px',
                        color: 'white'
                      }}
                    >
                      {item.name} x{item.quantity}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 停止收集按钮 */}
            <button
              onClick={() => setExploration(prev => ({ ...prev, phase: 'action_select' }))}
              style={{
                padding: '14px',
                backgroundColor: '#374151',
                color: '#9ca3af',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '14px'
              }}
            >
              ⏹️ 停止收集
            </button>
          </>
        )}

        {/* 探索日志 */}
        <div style={{
          backgroundColor: '#2d2d2d',
          borderRadius: '12px',
          padding: '12px',
          border: '1px solid #374151',
          marginTop: '16px'
        }}>
          <h3 style={{ color: '#9ca3af', fontSize: '12px', margin: '0 0 8px 0' }}>探索日志</h3>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            fontSize: '12px'
          }}>
            {logs.map((log, index) => (
              <div key={index} style={{ color: '#9ca3af' }}>{log}</div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
