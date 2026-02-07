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
  const { gameManager, saveGame } = useGameStore();
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

    // 直接跃迁至目的地，消耗时间（30分钟）
    gameManager.advanceTime(30);
    setExploration({
      phase: 'action_select',
      locationId,
      collectedItems: [],
      driveTimeRemaining: 0,
    });

    addLog(`🚀 跃迁至 ${location.name}！请选择行动`);
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
          addLog('🚀 跃迁完成！请选择行动');
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
      addLog('⚠️ 体力不足，无法采集');
      return;
    }
    addLog('📦 开始采集资源...');
    setExploration(prev => ({
      ...prev,
      phase: 'collecting',
    }));
  };

  // 选择狩猎 - 普通难度
  const startHuntingNormal = () => {
    // 消耗时间和体力
    gameManager.advanceTime(15);
    const success = gameManager.player.consumeStamina(10);
    if (!success) {
      addLog('⚠️ 体力不足，无法狩猎');
      return;
    }
    addLog('👾 开始狩猎虚空生物（普通）...');
    // 狩猎一定会遇到普通敌人
    if (exploration.locationId) {
      onStartBattle(exploration.locationId, false);
    }
  };

  // 选择狩猎 - 困难难度（精英敌人）
  const startHuntingHard = () => {
    // 消耗时间和体力
    gameManager.advanceTime(20);
    const success = gameManager.player.consumeStamina(15);
    if (!success) {
      addLog('⚠️ 体力不足，无法狩猎（困难）');
      return;
    }
    addLog('👾 开始狩猎虚空生物（困难）...');
    // 狩猎一定会遇到精英敌人
    if (exploration.locationId) {
      onStartBattle(exploration.locationId, false, true);
    }
  };

  // 选择挑战虚空首领
  const startBossBattle = () => {
    if (!exploration.locationId) return;

    // 检查今天是否已经挑战过
    const progress = gameManager.getLocationProgress(exploration.locationId);
    const today = new Date().toISOString().split('T')[0];
    if (progress.lastBossChallengeDate === today) {
      addLog('⚠️ 今天已经挑战过首领，请明天再来');
      return;
    }

    // 检查体力
    if (gameManager.player.stamina < 10) {
      addLog('⚠️ 体力不足，无法挑战首领');
      return;
    }

    // 记录挑战日期
    gameManager.recordBossChallenge(exploration.locationId);

    // 消耗时间和体力
    gameManager.advanceTime(15);
    const bossSuccess = gameManager.player.consumeStamina(10);
    if (!bossSuccess) {
      addLog('⚠️ 体力不足，无法挑战首领');
      return;
    }
    addLog('👾 挑战虚空首领！');

    onStartBattle(exploration.locationId, true);
  };

  // 扫荡
  const doSweep = async () => {
    if (!exploration.locationId) return;

    // 消耗时间和体力
    gameManager.advanceTime(15);
    const sweepSuccess = gameManager.player.consumeStamina(10);
    if (!sweepSuccess) {
      addLog('⚠️ 体力不足，无法扫荡');
      return;
    }

    // 根据地点生成不同的奖励
    const location = LOCATIONS.find(l => l.id === exploration.locationId);
    const rewards: { name: string; itemId: string; quantity: number }[] = [];

    if (location) {
      // 根据地点类型生成不同奖励
      switch (location.id) {
        case 'loc_001': // 废弃车站
          rewards.push({ name: '星核碎片', itemId: 'mat_001', quantity: 2 });
          rewards.push({ name: '基础合金', itemId: 'mat_002', quantity: 1 });
          break;
        case 'loc_002': // 废弃工厂
          rewards.push({ name: '星核碎片', itemId: 'mat_001', quantity: 3 });
          rewards.push({ name: '电子元件', itemId: 'mat_003', quantity: 1 });
          break;
        case 'loc_003': // 废弃医院
          rewards.push({ name: '医疗绷带', itemId: 'consumable_003', quantity: 2 });
          rewards.push({ name: '基础合金', itemId: 'mat_002', quantity: 2 });
          break;
        case 'loc_004': // 荒野
          rewards.push({ name: '基础合金', itemId: 'mat_002', quantity: 2 });
          rewards.push({ name: '冷却液', itemId: 'consumable_001', quantity: 1 });
          break;
        case 'loc_005': // 地下掩体
          rewards.push({ name: '电子元件', itemId: 'mat_003', quantity: 2 });
          rewards.push({ name: '星核碎片', itemId: 'mat_001', quantity: 2 });
          break;
        case 'loc_006': // 废弃超市
          rewards.push({ name: '能量块', itemId: 'consumable_002', quantity: 2 });
          rewards.push({ name: '冷却液', itemId: 'consumable_001', quantity: 2 });
          break;
        case 'loc_007': // 废弃学校
          rewards.push({ name: '基础合金', itemId: 'mat_002', quantity: 2 });
          rewards.push({ name: '星核碎片', itemId: 'mat_001', quantity: 1 });
          break;
        default:
          rewards.push({ name: '星核碎片', itemId: 'mat_001', quantity: 2 });
          rewards.push({ name: '基础合金', itemId: 'mat_002', quantity: 1 });
      }
    }

    addLog('🧹 扫荡完成！');

    // 添加物品到背包并显示
    rewards.forEach(reward => {
      gameManager.inventory.addItem(reward.itemId, reward.quantity);
      addLog(`获得: ${reward.name} x${reward.quantity}`);
    });

    // 保存游戏
    await saveGame();
  };

  // 物资收集阶段 - 每3秒一次
  useEffect(() => {
    if (exploration.phase !== 'collecting') return;

    const timer = setInterval(async () => {
      // 检查体力是否足够
      if (gameManager.player.stamina < 5) {
        addLog('⚠️ 体力不足，停止采集');
        setExploration(prev => ({
          ...prev,
          phase: 'action_select',
        }));
        return;
      }

      // 消耗时间和体力
      gameManager.advanceTime(10);
      gameManager.player.stamina -= 5;

      // 增加进度
      const progress = gameManager.getLocationProgress(exploration.locationId!);
      const newMaterialProgress = Math.min(20, progress.materialProgress + 5);
      gameManager.updateLocationProgress(exploration.locationId!, {
        materialProgress: newMaterialProgress
      });

      // 随机获得制造材料（所有星球都可以掉落全部6种材料）
      const location = LOCATIONS.find(l => l.id === exploration.locationId);
      const locationIndex = LOCATIONS.findIndex(l => l.id === exploration.locationId);
      const stationNumber = locationIndex + 1;

      // 随机选择材料类型（全部6种材料）
      const randomMaterialIndex = Math.floor(Math.random() * ALL_MATERIAL_BASE_IDS.length);
      const selectedBaseMaterial = ALL_MATERIAL_BASE_IDS[randomMaterialIndex];

      // 根据星球决定材料品质
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
      setExploration(prev => {
        const newCollectedItems = [...prev.collectedItems];
        const existingItem = newCollectedItems.find(item => item.name === itemName);
        if (existingItem) {
          existingItem.quantity += 1;
        } else {
          newCollectedItems.push({ name: itemName, quantity: 1 });
        }
        return {
          ...prev,
          collectedItems: newCollectedItems,
        };
      });

      addLog(`获得: ${itemName} x1`);

      // 检查是否满进度（只提示，不自动返回）
      if (newMaterialProgress >= 20) {
        addLog('✅ 资源采集进度已满！可继续采集');
      }

      // 保存游戏
      await saveGame();
    }, 3000);

    return () => clearInterval(timer);
  }, [exploration.phase, exploration.locationId, addLog, gameManager, saveGame]);

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
    <div className="space-theme" style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* 顶部标题栏 - 新主题 */}
      <header style={{
        flexShrink: 0,
        background: 'linear-gradient(180deg, rgba(26, 31, 58, 0.95) 0%, rgba(10, 14, 39, 0.95) 100%)',
        borderBottom: '1px solid rgba(0, 212, 255, 0.3)',
        padding: '12px 16px',
        boxShadow: '0 2px 10px rgba(0, 212, 255, 0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            onClick={exploration.phase === 'select' ? onBack : finishExploration}
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
            <span>{exploration.phase === 'select' ? '返回' : '结束'}</span>
          </button>
          <h1 style={{
            color: '#00d4ff',
            fontWeight: 'bold',
            fontSize: '18px',
            textShadow: '0 0 10px rgba(0, 212, 255, 0.3)'
          }}>
            {exploration.phase === 'select' && '选择目标星球'}
            {exploration.phase === 'driving' && '跃迁中...'}
            {exploration.phase === 'action_select' && '选择行动'}
            {exploration.phase === 'collecting' && '采集资源中'}
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
                [MaterialQuality.NORMAL]: '#71717a',    // 灰色
                [MaterialQuality.GOOD]: '#10b981',      // 绿色
                [MaterialQuality.FINE]: '#00d4ff',      // 蓝色
                [MaterialQuality.RARE]: '#8b5cf6',      // 紫色
                [MaterialQuality.LEGENDARY]: '#f59e0b', // 橙色
              };

              return (
                <button
                  key={location.id}
                  onClick={() => startExploration(location.id)}
                  style={{
                    padding: '16px',
                    background: 'linear-gradient(145deg, rgba(26, 31, 58, 0.8) 0%, rgba(10, 14, 39, 0.8) 100%)',
                    border: '1px solid rgba(0, 212, 255, 0.2)',
                    borderRadius: '12px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    color: 'white',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '24px' }}>🪐</span>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#00d4ff' }}>{location.name}</h3>
                      <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#a1a1aa' }}>
                        {location.description}
                      </p>
                    </div>
                    {isBossDefeated && (
                      <span style={{
                        fontSize: '11px',
                        padding: '4px 8px',
                        backgroundColor: isBossRefreshed ? '#dc2626' : '#059669',
                        borderRadius: '4px',
                        color: 'white',
                        fontWeight: 'bold'
                      }}>
                        {isBossRefreshed ? '首领已刷新' : '已探索'}
                      </span>
                    )}
                  </div>

                  {/* 品质掉落率 */}
                  <div style={{
                    marginBottom: '8px',
                    padding: '8px',
                    backgroundColor: 'rgba(10, 14, 39, 0.6)',
                    borderRadius: '8px',
                    border: '1px solid rgba(0, 212, 255, 0.1)'
                  }}>
                    <div style={{ fontSize: '11px', color: '#a1a1aa', marginBottom: '4px' }}>
                      📊 资源品质概率:
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
                    color: '#a1a1aa'
                  }}>
                    <span>📦 {progress.materialProgress}/20</span>
                    <span>👾 {progress.huntProgress}/80</span>
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
            <div style={{
              fontSize: '64px',
              filter: 'drop-shadow(0 0 20px rgba(0, 212, 255, 0.5))',
              animation: 'pulse 2s ease-in-out infinite'
            }}>🚀</div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: '#00d4ff', fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
                跃迁引擎启动中...
              </p>
              <p style={{ color: '#a1a1aa', fontSize: '14px' }}>
                剩余时间: {exploration.driveTimeRemaining}秒
              </p>
            </div>
            {/* 进度条 */}
            <div style={{
              width: '200px',
              height: '8px',
              backgroundColor: 'rgba(10, 14, 39, 0.8)',
              borderRadius: '4px',
              overflow: 'hidden',
              border: '1px solid rgba(0, 212, 255, 0.2)'
            }}>
              <div style={{
                height: '100%',
                background: 'linear-gradient(90deg, #0099cc 0%, #00d4ff 100%)',
                width: `${((10 - exploration.driveTimeRemaining) / 10) * 100}%`,
                transition: 'width 1s linear',
                boxShadow: '0 0 10px rgba(0, 212, 255, 0.3)'
              }} />
            </div>
          </div>
        )}

        {/* 行动选择阶段 */}
        {exploration.phase === 'action_select' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* 当前地点信息 */}
            <div style={{
              background: 'linear-gradient(145deg, rgba(26, 31, 58, 0.9) 0%, rgba(10, 14, 39, 0.9) 100%)',
              borderRadius: '12px',
              padding: '16px',
              border: '1px solid rgba(0, 212, 255, 0.3)',
              boxShadow: '0 0 20px rgba(0, 212, 255, 0.1)'
            }}>
              {(() => {
                const location = LOCATIONS.find(l => l.id === exploration.locationId);
                const progress = getCurrentProgress();
                return (
                  <>
                    <h2 style={{ color: '#00d4ff', fontSize: '18px', fontWeight: 'bold', margin: '0 0 8px 0' }}>
                      🪐 {location?.name}
                    </h2>
                    <p style={{ color: '#a1a1aa', fontSize: '14px', margin: '0 0 12px 0' }}>
                      {location?.description}
                    </p>
                    <div style={{ display: 'flex', gap: '16px', fontSize: '13px' }}>
                      <span style={{ color: '#a1a1aa' }}>📦 采集进度: {progress?.materialProgress}/20</span>
                      <span style={{ color: '#a1a1aa' }}>👾 狩猎进度: {progress?.huntProgress}/80</span>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* 行动按钮 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              <ActionButton
                icon="📦"
                label="采集资源"
                description="消耗体力采集制造材料"
                color="linear-gradient(135deg, #059669 0%, #10b981 100%)"
                onClick={startCollecting}
              />
              <ActionButton
                icon="👾"
                label="狩猎"
                description="遭遇虚空生物（普通）"
                color="linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)"
                onClick={startHuntingNormal}
              />
              <ActionButton
                icon="👾"
                label="危险狩猎"
                description="遭遇精英虚空生物"
                color="linear-gradient(135deg, #dc2626 0%, #ef4444 100%)"
                onClick={startHuntingHard}
              />
              <ActionButton
                icon="👾"
                label="挑战首领"
                description="挑战虚空首领（每日1次）"
                color="linear-gradient(135deg, #f59e0b 0%, #00d4ff 100%)"
                onClick={startBossBattle}
              />
            </div>

            {/* 日志显示 */}
            <div style={{
              backgroundColor: 'rgba(10, 14, 39, 0.6)',
              borderRadius: '8px',
              padding: '12px',
              border: '1px solid rgba(0, 212, 255, 0.1)',
              maxHeight: '150px',
              overflowY: 'auto'
            }}>
              <h4 style={{ color: '#00d4ff', fontSize: '12px', margin: '0 0 8px 0' }}>探索日志</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {logs.length === 0 ? (
                  <span style={{ color: '#71717a', fontSize: '12px' }}>暂无日志</span>
                ) : (
                  logs.map((log, index) => (
                    <span key={index} style={{ color: '#a1a1aa', fontSize: '12px' }}>{log}</span>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* 收集阶段 */}
        {exploration.phase === 'collecting' && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            gap: '24px'
          }}>
            <div style={{
              fontSize: '64px',
              animation: 'bounce 1s ease-in-out infinite'
            }}>📦</div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: '#00d4ff', fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
                正在采集资源...
              </p>
              <p style={{ color: '#a1a1aa', fontSize: '14px' }}>
                每3秒自动采集一次，消耗5点体力
              </p>
            </div>

            {/* 已收集物品 */}
            {exploration.collectedItems.length > 0 && (
              <div style={{
                backgroundColor: 'rgba(10, 14, 39, 0.6)',
                borderRadius: '8px',
                padding: '12px',
                border: '1px solid rgba(0, 212, 255, 0.2)',
                width: '100%',
                maxWidth: '300px'
              }}>
                <h4 style={{ color: '#00d4ff', fontSize: '12px', margin: '0 0 8px 0' }}>本次采集收获</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {exploration.collectedItems.map((item, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '13px'
                    }}>
                      <span style={{ color: '#a1a1aa' }}>{item.name}</span>
                      <span style={{ color: '#00d4ff', fontWeight: 'bold' }}>x{item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => setExploration(prev => ({ ...prev, phase: 'action_select' }))}
              style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #374151 0%, #2a3050 100%)',
                border: '1px solid rgba(0, 212, 255, 0.3)',
                borderRadius: '8px',
                color: 'white',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              停止采集
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

// 行动按钮组件 - 新主题
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
        background: color,
        border: 'none',
        borderRadius: '12px',
        color: 'white',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
        transition: 'all 0.3s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.02)';
        e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 212, 255, 0.2)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.3)';
      }}
    >
      <span style={{ fontSize: '28px' }}>{icon}</span>
      <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{label}</span>
      <span style={{ fontSize: '11px', opacity: 0.8 }}>{description}</span>
    </button>
  );
}
