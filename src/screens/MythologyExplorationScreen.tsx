import { useState, useEffect, useCallback } from 'react';
import { useGameStore } from '../stores/gameStore';
import { MYTHOLOGY_LOCATIONS } from '../data/mythologyLocations';
import { MythologyType, DeityStatus } from '../data/types';

interface MythologyExplorationScreenProps {
  onBack: () => void;
  onStartBattle: (locationId: string, isBoss?: boolean, isElite?: boolean) => void;
  initialLocationId?: string | null;
}

type ExplorationPhase = 'select' | 'driving' | 'action_select' | 'collecting' | 'complete';

interface ExplorationState {
  phase: ExplorationPhase;
  locationId: string | null;
  collectedItems: { name: string; quantity: number }[];
  driveTimeRemaining: number;
}

export default function MythologyExplorationScreen({ onBack, onStartBattle, initialLocationId }: MythologyExplorationScreenProps) {
  const { gameManager, saveGame } = useGameStore();
  const [exploration, setExploration] = useState<ExplorationState>({
    phase: initialLocationId ? 'action_select' : 'select',
    locationId: initialLocationId || null,
    collectedItems: [],
    driveTimeRemaining: 0,
  });
  const [logs, setLogs] = useState<string[]>([]);

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
    const location = MYTHOLOGY_LOCATIONS.find(l => l.id === locationId);
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
          addLog('🚀 跃迁至目的地！请选择行动');
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
    addLog('👾 开始狩猎（普通）...');
    // 狩猎一定会遇到普通敌人
    if (exploration.locationId) {
      onStartBattle(exploration.locationId, false, false);
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
    addLog('👾 开始狩猎（困难）...');
    // 狩猎一定会遇到精英敌人
    if (exploration.locationId) {
      onStartBattle(exploration.locationId, false, true);
    }
  };

  // 选择挑战神明BOSS
  const startBossBattle = () => {
    if (!exploration.locationId) return;

    // 检查今天是否已经挑战过
    const progress = gameManager.getLocationProgress(exploration.locationId);
    const today = new Date().toISOString().split('T')[0];
    if (progress.lastBossChallengeDate === today) {
      addLog('⚠️ 今天已经挑战过神明，请明天再来');
      return;
    }

    // 检查体力
    if (gameManager.player.stamina < 10) {
      addLog('⚠️ 体力不足，无法挑战神明');
      return;
    }

    // 记录挑战日期
    gameManager.recordBossChallenge(exploration.locationId);

    // 消耗时间和体力
    gameManager.advanceTime(15);
    const bossSuccess = gameManager.player.consumeStamina(10);
    if (!bossSuccess) {
      addLog('⚠️ 体力不足，无法挑战神明');
      return;
    }
    addLog('👑 挑战神明！');

    onStartBattle(exploration.locationId, true, false);
  };

  // 物资收集阶段 - 每3秒一次
  useEffect(() => {
    if (exploration.phase !== 'collecting') return;

    const timer = setInterval(async () => {
      // 检查体力是否足够
      if (gameManager.player.stamina < 5) {
        addLog('⚠️ 体力不足，停止收集');
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

      // 随机获得制造材料（神话星球产出高品质材料）
      const possibleMaterials = [
        { name: '优质铁矿碎片', id: 'craft_优质iron' },
        { name: '优质虚空野兽皮革', id: 'craft_优质leather' },
        { name: '优质粗布纤维', id: 'craft_优质fabric' },
        { name: '优质坚韧基础合金', id: 'craft_优质wood' },
        { name: '优质能量冷却液晶', id: 'craft_优质crystal' },
        { name: '优质虚空生物精华', id: 'craft_优质essence' },
        { name: '精良铁矿碎片', id: 'craft_精良iron' },
        { name: '精良虚空野兽皮革', id: 'craft_精良leather' },
        { name: '精良粗布纤维', id: 'craft_精良fabric' },
        { name: '精良坚韧基础合金', id: 'craft_精良wood' },
      ];

      const randomIndex = Math.floor(Math.random() * possibleMaterials.length);
      const selectedMaterial = possibleMaterials[randomIndex];
      const itemName = selectedMaterial.name;
      const itemIdToAdd = selectedMaterial.id;

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
        addLog('✅ 物资收集进度已满！可继续收集');
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

  // 获取神话体系颜色
  const getMythologyColor = (type: MythologyType) => {
    return type === MythologyType.GREEK ? '#00d4ff' : '#60a5fa';
  };

  // 获取神明状态颜色
  const getDeityStatusColor = (status: DeityStatus) => {
    switch (status) {
      case DeityStatus.HIDDEN: return '#6b7280';
      case DeityStatus.EXPOSED: return '#00d4ff';
      case DeityStatus.HOSTILE: return '#ef4444';
      case DeityStatus.NEUTRAL: return '#4ade80';
      default: return '#6b7280';
    }
  };

  // 渲染界面
  return (
    <div style={{
      height: '100vh',
      backgroundColor: '#0a0e27',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* 顶部标题栏 */}
      <header style={{
        flexShrink: 0,
        backgroundColor: '#1a1f3a',
        borderBottom: '1px solid #2a3050',
        padding: '12px 16px'
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
          <h1 style={{ color: 'white', fontWeight: 'bold', fontSize: '18px' }}>
            {exploration.phase === 'select' && '选择神话星球'}
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
            {MYTHOLOGY_LOCATIONS.map(location => {
              const progress = gameManager.getLocationProgress(location.id);
              const isBossDefeated = progress.bossDefeated;
              const isBossRefreshed = gameManager.isBossRefreshed(location.id);

              return (
                <button
                  key={location.id}
                  onClick={() => startExploration(location.id)}
                  disabled={!location.isUnlocked}
                  style={{
                    padding: '16px',
                    backgroundColor: location.isUnlocked ? '#1a1f3a' : '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '12px',
                    textAlign: 'left',
                    cursor: location.isUnlocked ? 'pointer' : 'not-allowed',
                    color: location.isUnlocked ? 'white' : '#6b7280',
                    opacity: location.isUnlocked ? 1 : 0.6
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '24px' }}>{location.icon}</span>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>{location.name}</h3>
                      <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#a1a1aa' }}>
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
                        {isBossRefreshed ? '神明已刷新' : '已攻略'}
                      </span>
                    )}
                    {!location.isUnlocked && (
                      <span style={{
                        fontSize: '11px',
                        padding: '4px 8px',
                        backgroundColor: '#374151',
                        borderRadius: '4px',
                        color: '#a1a1aa'
                      }}>
                        未解锁
                      </span>
                    )}
                  </div>
                  <div style={{
                    display: 'flex',
                    gap: '16px',
                    fontSize: '12px',
                    color: '#a1a1aa'
                  }}>
                    <span style={{ color: getMythologyColor(location.mythology) }}>
                      {location.mythology === MythologyType.GREEK ? '☀️ 希腊神话' : '❄️ 北欧神话'}
                    </span>
                    <span>👑 {location.deity.name}</span>
                    {location.isUnlocked && (
                      <>
                        <span>📦 {progress.materialProgress}/20</span>
                        <span>👾 {progress.huntProgress}/80</span>
                      </>
                    )}
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
            <div style={{ fontSize: '64px' }}>🚀</div>
            <div style={{ color: 'white', fontSize: '18px', fontWeight: 'bold' }}>
              跃迁中...
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
                backgroundColor: '#0099cc',
                transition: 'width 1s linear',
                width: `${((3 - exploration.driveTimeRemaining) / 3) * 100}%`
              }} />
            </div>
            <p style={{ color: '#a1a1aa', fontSize: '14px' }}>
              预计 {exploration.driveTimeRemaining} 秒后跃迁至
            </p>
          </div>
        )}

        {/* 选择行动阶段 */}
        {exploration.phase === 'action_select' && exploration.locationId && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* 进度显示 */}
            {(() => {
              const progress = getCurrentProgress();
              const location = MYTHOLOGY_LOCATIONS.find(l => l.id === exploration.locationId);
              if (!progress || !location) return null;

              return (
                <div style={{
                  backgroundColor: '#1a1f3a',
                  borderRadius: '12px',
                  padding: '16px',
                  border: '1px solid #374151'
                }}>
                  <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '8px' }}>{location.icon}</div>
                    <h2 style={{ color: 'white', margin: 0, fontSize: '18px' }}>{location.name}</h2>
                    <p style={{ color: getMythologyColor(location.mythology), fontSize: '12px', margin: '4px 0 0 0' }}>
                      👑 神明: {location.deity.name} ({location.deity.title})
                    </p>
                  </div>

                  {/* 物资收集进度 */}
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ color: '#a1a1aa', fontSize: '14px' }}>📦 物资收集</span>
                      <span style={{ color: progress.materialProgress >= 20 ? '#4ade80' : '#00d4ff', fontSize: '14px' }}>
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
                        backgroundColor: progress.materialProgress >= 20 ? '#4ade80' : '#00d4ff',
                        transition: 'width 0.5s',
                        width: `${Math.min(100, (progress.materialProgress / 20) * 100)}%`
                      }} />
                    </div>
                  </div>

                  {/* 狩猎进度 */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ color: '#a1a1aa', fontSize: '14px' }}>👾 狩猎进度</span>
                      <span style={{ color: progress.huntProgress >= 80 ? '#ef4444' : '#00d4ff', fontSize: '14px' }}>
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
                        backgroundColor: progress.huntProgress >= 80 ? '#ef4444' : '#00d4ff',
                        transition: 'width 0.5s',
                        width: `${Math.min(100, (progress.huntProgress / 80) * 100)}%`
                      }} />
                    </div>
                  </div>
                </div>
              );
            })()}

            <p style={{ color: '#a1a1aa', textAlign: 'center', margin: '0' }}>
              请选择要进行的行动
            </p>

            {/* 物资收集按钮 */}
            <button
              onClick={startCollecting}
              disabled={gameManager.player.stamina < 5}
              style={{
                padding: '16px',
                backgroundColor: gameManager.player.stamina < 5 ? '#2a3050' : '#16a34a',
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
              const location = MYTHOLOGY_LOCATIONS.find(l => l.id === exploration.locationId);
              if (!progress || !location) return null;

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
                      backgroundColor: gameManager.player.stamina < 10 ? '#2a3050' : '#dc2626',
                      color: 'white',
                      borderRadius: '12px',
                      border: 'none',
                      cursor: gameManager.player.stamina < 10 ? 'not-allowed' : 'pointer',
                      fontWeight: 'bold',
                      fontSize: '16px'
                    }}
                  >
                    <div>👾 狩猎（普通）</div>
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
                      backgroundColor: gameManager.player.stamina < 15 ? '#2a3050' : '#ea580c',
                      color: 'white',
                      borderRadius: '12px',
                      border: 'none',
                      cursor: gameManager.player.stamina < 15 ? 'not-allowed' : 'pointer',
                      fontWeight: 'bold',
                      fontSize: '16px'
                    }}
                  >
                    <div>👾 狩猎（困难）</div>
                    <div style={{ fontSize: '12px', fontWeight: 'normal', marginTop: '4px', opacity: 0.8 }}>
                      消耗: 20分钟 + 15体力 | 遭遇精英敌人 | +15%狩猎进度
                    </div>
                  </button>

                  {/* BOSS已击败后的再次挑战按钮 */}
                  {isBossDefeated && (
                    <>
                      {canChallengeToday ? (
                        <button
                          onClick={startBossBattle}
                          disabled={gameManager.player.stamina < 10}
                          style={{
                            padding: '16px',
                            backgroundColor: gameManager.player.stamina < 10 ? '#2a3050' : '#dc2626',
                            color: 'white',
                            borderRadius: '12px',
                            border: 'none',
                            cursor: gameManager.player.stamina < 10 ? 'not-allowed' : 'pointer',
                            fontWeight: 'bold',
                            fontSize: '16px'
                          }}
                        >
                          <div>👑 再次挑战神明</div>
                          <div style={{ fontSize: '12px', fontWeight: 'normal', marginTop: '4px', opacity: 0.8 }}>
                            消耗: 15分钟 + 10体力 | 已刷新，可再次挑战
                          </div>
                        </button>
                      ) : (
                        <button
                          disabled
                          style={{
                            padding: '16px',
                            backgroundColor: '#2a3050',
                            color: '#a1a1aa',
                            borderRadius: '12px',
                            border: 'none',
                            cursor: 'not-allowed',
                            fontWeight: 'bold',
                            fontSize: '16px'
                          }}
                        >
                          <div>⏳ 明日再来</div>
                          <div style={{ fontSize: '12px', fontWeight: 'normal', marginTop: '4px', opacity: 0.8 }}>
                            今天已经挑战过神明，请明天再来
                          </div>
                        </button>
                      )}
                    </>
                  )}

                  {/* BOSS未击败且条件满足时显示挑战神明按钮 */}
                  {!isBossDefeated && canChallengeBoss && (
                    <button
                      onClick={startBossBattle}
                      disabled={gameManager.player.stamina < 10}
                      style={{
                        padding: '16px',
                        backgroundColor: gameManager.player.stamina < 10 ? '#2a3050' : '#dc2626',
                        color: 'white',
                        borderRadius: '12px',
                        border: gameManager.player.stamina < 10 ? 'none' : '2px solid #00d4ff',
                        cursor: gameManager.player.stamina < 10 ? 'not-allowed' : 'pointer',
                        fontWeight: 'bold',
                        fontSize: '16px',
                        boxShadow: gameManager.player.stamina < 10 ? 'none' : '0 0 20px rgba(220, 38, 38, 0.5)'
                      }}
                    >
                      <div>👑 挑战神明</div>
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
              backgroundColor: '#1a1f3a',
              borderRadius: '12px',
              padding: '16px',
              border: '1px solid #374151',
              marginBottom: '16px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ color: '#a1a1aa', fontSize: '14px' }}>⚡ 体力</span>
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
                  backgroundColor: gameManager.player.stamina < 10 ? '#ef4444' : '#4ade80',
                  transition: 'width 0.5s',
                  width: `${(gameManager.player.stamina / gameManager.player.maxStamina) * 100}%`
                }} />
              </div>
            </div>

            {/* 收集状态 */}
            <div style={{
              backgroundColor: '#1a1f3a',
              borderRadius: '12px',
              padding: '16px',
              border: '1px solid #374151',
              marginBottom: '16px'
            }}>
              <h3 style={{ color: 'white', margin: '0 0 12px 0', fontSize: '16px' }}>正在采集资源...</h3>
              <p style={{ color: '#a1a1aa', fontSize: '14px', margin: 0 }}>
                每3秒消耗5体力，随机获得神话物资
              </p>
            </div>

            {/* 已收集物品 */}
            {exploration.collectedItems.length > 0 && (
              <div style={{
                backgroundColor: '#1a1f3a',
                borderRadius: '12px',
                padding: '16px',
                border: '1px solid #374151'
              }}>
                <h3 style={{ color: 'white', margin: '0 0 12px 0', fontSize: '16px' }}>本次收集</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {exploration.collectedItems.map((item, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px',
                      backgroundColor: '#1f2937',
                      borderRadius: '8px'
                    }}>
                      <span style={{ color: '#d1d5db' }}>{item.name}</span>
                      <span style={{ color: '#00d4ff', fontWeight: 'bold' }}>x{item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 停止收集按钮 */}
            <button
              onClick={() => setExploration(prev => ({ ...prev, phase: 'action_select' }))}
              style={{
                marginTop: '16px',
                padding: '16px',
                backgroundColor: '#374151',
                color: 'white',
                borderRadius: '12px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '16px',
                width: '100%'
              }}
            >
              停止收集
            </button>
          </>
        )}
      </main>

      {/* 日志区域 */}
      <div style={{
        flexShrink: 0,
        backgroundColor: '#1f2937',
        borderTop: '1px solid #374151',
        padding: '12px 16px',
        maxHeight: '120px',
        overflowY: 'auto'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {logs.length === 0 ? (
            <p style={{ color: '#6b7280', fontSize: '12px', margin: 0 }}>等待行动...</p>
          ) : (
            logs.map((log, index) => (
              <p key={index} style={{
                color: log.includes('⚠️') ? '#ef4444' : log.includes('✅') ? '#4ade80' : '#d1d5db',
                fontSize: '12px',
                margin: 0
              }}>
                {log}
              </p>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
