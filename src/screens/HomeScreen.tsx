import { useGameStore } from '../stores/gameStore';
import { useState, useEffect } from 'react';
import { AutoCollectMode, MODE_INFO, getCollectLocation } from '../data/autoCollectTypes';

interface HomeScreenProps {
  onNavigate: (screen: string) => void;
}

export default function HomeScreen({ onNavigate }: HomeScreenProps) {
  const {
    gameManager,
    rest,
    logs,
    startAutoCollect,
    stopAutoCollect,
    claimAutoCollectRewards,
    getAutoCollectState,
    getAutoCollectDuration,
    getAvailableCollectLocations,
    showToast,
  } = useGameStore();
  const player = gameManager.player;
  const train = gameManager.train;
  const [showAllLogs, setShowAllLogs] = useState(false);
  const [showCollectModal, setShowCollectModal] = useState(false);
  const [collectDuration, setCollectDuration] = useState('00:00');

  // 自动采集状态
  const autoCollectState = getAutoCollectState();
  const isCollecting = autoCollectState.isCollecting;

  // 更新采集时长显示
  useEffect(() => {
    if (!isCollecting) {
      setCollectDuration('00:00');
      return;
    }

    const updateDuration = () => {
      setCollectDuration(getAutoCollectDuration());
    };

    updateDuration();
    const interval = setInterval(updateDuration, 1000);
    return () => clearInterval(interval);
  }, [isCollecting, getAutoCollectDuration]);

  // 处理开始采集
  const handleStartCollect = (locationId: string, mode: AutoCollectMode) => {
    const result = startAutoCollect(locationId, mode);
    if (result.success) {
      showToast('自动采集已开始', 'success');
    } else {
      showToast(result.message, 'error');
    }
    setShowCollectModal(false);
  };

  // 处理停止采集
  const handleStopCollect = () => {
    const result = stopAutoCollect();
    if (result.success) {
      if (result.rewards && (result.rewards.gold > 0 || result.rewards.exp > 0 || result.rewards.materials.length > 0 || result.rewards.equipments.length > 0)) {
        const rewards = result.rewards;
        showToast(`采集完成！获得 ${rewards.gold} 信用点、${rewards.exp} 经验值`, 'success', 3000);
        if (rewards.materials.length > 0) {
          showToast(`材料：${rewards.materials.map(m => `${m.name}x${m.quantity}`).join('、')}`, 'info', 3000);
        }
        if (rewards.equipments.length > 0) {
          showToast(`装备：${rewards.equipments.map(e => e.name).join('、')}`, 'info', 3000);
        }
      } else {
        showToast('已停止采集，暂无收益', 'info');
      }
    } else {
      showToast(result.message, 'error');
    }
  };

  // 处理领取收益
  const handleClaimRewards = () => {
    const result = claimAutoCollectRewards();
    if (result.success) {
      if (result.rewards && (result.rewards.gold > 0 || result.rewards.exp > 0 || result.rewards.materials.length > 0 || result.rewards.equipments.length > 0)) {
        const rewards = result.rewards;
        showToast(`领取成功！获得 ${rewards.gold} 信用点、${rewards.exp} 经验值`, 'success', 3000);
        if (rewards.materials.length > 0) {
          showToast(`材料：${rewards.materials.map(m => `${m.name}x${m.quantity}`).join('、')}`, 'info', 3000);
        }
        if (rewards.equipments.length > 0) {
          showToast(`装备：${rewards.equipments.map(e => e.name).join('、')}`, 'info', 3000);
        }
      } else {
        showToast('当前没有可领取的收益', 'warning');
      }
    } else {
      showToast(result.message, 'error');
    }
  };

  // 获取最近事件
  const recentLogs = showAllLogs ? (logs || []) : (logs || []).slice(0, 6);

  const handleRest = () => {
    const result = rest();
    if (!result.success) {
      alert(result.message);
    }
  };

  // 检查是否可以休息
  const canRest = player.hunger >= 20 && player.thirst >= 10;

  // 预警颜色（新主题）
  const getWarningColor = (value: number, max: number) => {
    const ratio = value / max;
    if (ratio < 0.2) return '#ef4444'; // 虚空红
    if (ratio < 0.4) return '#00d4ff'; // 警告黄
    return '#00d4ff'; // 科技蓝
  };

  return (
    <div className="space-theme" style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* 顶部信息栏 - 新主题 */}
      <div style={{
        flexShrink: 0,
        background: 'linear-gradient(180deg, rgba(26, 31, 58, 0.95) 0%, rgba(10, 14, 39, 0.95) 100%)',
        borderBottom: '1px solid rgba(0, 212, 255, 0.3)',
        padding: '12px 16px',
        boxShadow: '0 2px 10px rgba(0, 212, 255, 0.1)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {/* 最左边：联邦拓荒队员 */}
          <h1 style={{
            color: '#00d4ff',
            fontSize: '18px',
            fontWeight: 'bold',
            margin: 0,
            textShadow: '0 0 10px rgba(0, 212, 255, 0.5)'
          }}>
            🚀 {gameManager.playerName || '联邦拓荒队员'}
          </h1>

          {/* 中间：等级|第X天 XX:XX */}
          <p style={{
            color: '#a1a1aa',
            fontSize: '14px',
            margin: 0
          }}>
            等级{player.level} | {(() => {
              const minutesInDay = 24 * 60;
              const dayTime = gameManager.gameTime % minutesInDay;
              const day = Math.floor(gameManager.gameTime / minutesInDay) + 1;
              const hours = Math.floor(dayTime / 60);
              const minutes = dayTime % 60;
              return `第${day}天 ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
            })()}
          </p>

          {/* 右边：联邦信用点 */}
          <span style={{
            color: '#00d4ff',
            fontSize: '14px',
            fontWeight: 'bold',
            textShadow: '0 0 5px rgba(0, 212, 255, 0.3)'
          }}>
            💎 信用点{gameManager.trainCoins || 0}
          </span>
        </div>
      </div>

      {/* 状态栏 - 两行显示 - 新主题 */}
      <div style={{
        flexShrink: 0,
        background: 'rgba(26, 31, 58, 0.8)',
        borderBottom: '1px solid rgba(0, 212, 255, 0.2)',
        padding: '10px 16px'
      }}>
        {/* 第一行：生命、体力、神能 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '8px',
          fontSize: '13px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <span style={{ color: '#ef4444' }}>❤️ 生命 </span>
            <span style={{ color: getWarningColor(player.hp, player.totalMaxHp), fontWeight: 'bold' }}>
              {player.hp}/{player.totalMaxHp}
            </span>
          </div>
          <div style={{ textAlign: 'center' }}>
            <span style={{ color: '#00d4ff' }}>⚡ 体力 </span>
            <span style={{ color: getWarningColor(player.stamina, player.maxStamina), fontWeight: 'bold' }}>
              {player.stamina}/{player.maxStamina}
            </span>
          </div>
          <div style={{ textAlign: 'center' }}>
            <span style={{ color: '#8b5cf6' }}>🧠 神能 </span>
            <span style={{ color: getWarningColor(player.spirit, player.maxSpirit), fontWeight: 'bold' }}>
              {player.spirit}/{player.maxSpirit}
            </span>
          </div>
        </div>
        {/* 第二行：能量储备、冷却液、航船状态 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '8px',
          fontSize: '13px',
          marginTop: '8px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <span style={{ color: '#fb923c' }}>🔋 能量 </span>
            <span style={{ color: '#ffffff', fontWeight: 'bold' }}>{player.hunger}</span>
          </div>
          <div style={{ textAlign: 'center' }}>
            <span style={{ color: '#60a5fa' }}>❄️ 冷却 </span>
            <span style={{ color: '#ffffff', fontWeight: 'bold' }}>{player.thirst}</span>
          </div>
          <div style={{ textAlign: 'center' }}>
            <span style={{ color: '#00d4ff' }}>🚀 状态 </span>
            <span style={{ color: '#ffffff', fontWeight: 'bold' }}>{train.durability}%</span>
          </div>
        </div>
      </div>

      {/* 自动资源采集系统 */}
      <AutoCollectPanel
        isCollecting={isCollecting}
        duration={collectDuration}
        locationId={autoCollectState.locationId}
        mode={autoCollectState.mode}
        onStart={() => setShowCollectModal(true)}
        onStop={handleStopCollect}
        onClaim={handleClaimRewards}
        onOpenSettings={() => setShowCollectModal(true)}
      />

      {/* 核心操作区 - 新主题 */}
      <div style={{
        flexShrink: 0,
        padding: '16px',
        borderBottom: '1px solid rgba(0, 212, 255, 0.2)'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
          <ActionButton
            icon="🪐"
            label="星球探索"
            gradient="linear-gradient(135deg, #059669 0%, #10b981 100%)"
            onClick={() => onNavigate('exploration')}
          />
          <ActionButton
            icon="🛌"
            label={canRest ? "休整" : "能量不足"}
            gradient={canRest ? "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)" : "linear-gradient(135deg, #374151 0%, #2a3050 100%)"}
            onClick={handleRest}
            disabled={!canRest}
          />
          <ActionButton
            icon="🔫"
            label="装备强化"
            gradient="linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)"
            onClick={() => onNavigate('equipment')}
          />
          <ActionButton
            icon="🔨"
            label="装备制造"
            gradient="linear-gradient(135deg, #1a1f3a 0%, #f59e0b 100%)"
            onClick={() => onNavigate('crafting')}
          />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginTop: '12px' }}>
          <ActionButton
            icon="📦"
            label="物资分解"
            gradient="linear-gradient(135deg, #374151 0%, #2a3050 100%)"
            onClick={() => onNavigate('decompose')}
          />
          <ActionButton
            icon="📖"
            label="技能系统"
            gradient="linear-gradient(135deg, #374151 0%, #2a3050 100%)"
            onClick={() => onNavigate('skills')}
          />
          <ActionButton
            icon="👤"
            label="拓荒队员"
            gradient="linear-gradient(135deg, #374151 0%, #2a3050 100%)"
            onClick={() => onNavigate('player')}
          />
          <ActionButton
            icon="🚀"
            label="航船状态"
            gradient="linear-gradient(135deg, #374151 0%, #2a3050 100%)"
            onClick={() => onNavigate('train')}
          />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginTop: '12px' }}>
          <ActionButton
            icon="✨"
            label="装备升华"
            gradient="linear-gradient(135deg, #9333ea 0%, #c084fc 100%)"
            onClick={() => onNavigate('sublimation')}
          />
          <ActionButton
            icon="🛒"
            label="星际商店"
            gradient="linear-gradient(135deg, #059669 0%, #10b981 100%)"
            onClick={() => onNavigate('shop')}
          />
          <ActionButton
            icon="🧪"
            label="系统测试"
            gradient="linear-gradient(135deg, #dc2626 0%, #ef4444 100%)"
            onClick={() => onNavigate('test')}
          />
          <div /> {/* 空占位 */}
        </div>
      </div>

      {/* 最近事件 - 可滚动 - 新主题 */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        <div style={{
          flexShrink: 0,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 16px',
          borderBottom: '1px solid rgba(0, 212, 255, 0.2)',
          background: 'rgba(26, 31, 58, 0.6)'
        }}>
          <h3 style={{
            color: '#00d4ff',
            fontSize: '14px',
            fontWeight: 'bold',
            margin: 0,
            textShadow: '0 0 5px rgba(0, 212, 255, 0.3)'
          }}>
            📜 航行日志
          </h3>
          <button
            onClick={() => setShowAllLogs(!showAllLogs)}
            style={{
              color: '#00d4ff',
              fontSize: '12px',
              background: 'none',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            {showAllLogs ? '收起 ▲' : '更多 ▼'}
          </button>
        </div>

        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '12px 16px'
        }}>
          {recentLogs.length === 0 ? (
            <p style={{ color: '#71717a', fontSize: '12px', textAlign: 'center' }}>暂无航行记录</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {recentLogs.map((log, index) => (
                <LogItem key={index} log={log} isLatest={index === 0 && !showAllLogs} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 采集设置弹窗 */}
      {showCollectModal && (
        <AutoCollectModal
          onClose={() => setShowCollectModal(false)}
          onStart={handleStartCollect}
          availableLocations={getAvailableCollectLocations()}
          playerLevel={player.level}
        />
      )}
    </div>
  );
}

// 自动采集面板组件
function AutoCollectPanel({
  isCollecting,
  duration,
  locationId,
  mode,
  onStart,
  onStop,
  onClaim,
  onOpenSettings,
}: {
  isCollecting: boolean;
  duration: string;
  locationId: string;
  mode: AutoCollectMode;
  onStart: () => void;
  onStop: () => void;
  onClaim: () => void;
  onOpenSettings: () => void;
}) {
  const location = getCollectLocation(locationId);
  const modeInfo = MODE_INFO[mode];

  return (
    <div style={{
      flexShrink: 0,
      margin: '12px 16px',
      background: 'linear-gradient(135deg, rgba(26, 31, 58, 0.95) 0%, rgba(10, 14, 39, 0.95) 100%)',
      borderRadius: '16px',
      border: isCollecting ? '2px solid #00d4ff' : '1px solid rgba(0, 212, 255, 0.3)',
      padding: '16px',
      boxShadow: isCollecting ? '0 0 20px rgba(0, 212, 255, 0.2)' : '0 4px 15px rgba(0, 0, 0, 0.3)',
    }}>
      {/* 标题栏 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '20px' }}>🚀</span>
          <span style={{
            color: '#00d4ff',
            fontSize: '14px',
            fontWeight: 'bold',
            textShadow: '0 0 5px rgba(0, 212, 255, 0.3)',
          }}>
            自动资源采集
          </span>
          {isCollecting && (
            <span style={{
              display: 'inline-block',
              width: '8px',
              height: '8px',
              backgroundColor: '#10b981',
              borderRadius: '50%',
              animation: 'pulse 2s infinite',
            }} />
          )}
        </div>
        {isCollecting && (
          <span style={{
            color: '#10b981',
            fontSize: '12px',
            fontWeight: 'bold',
          }}>
            运行中
          </span>
        )}
      </div>

      {/* 状态显示 */}
      {isCollecting ? (
        <div style={{
          background: 'rgba(0, 212, 255, 0.1)',
          borderRadius: '12px',
          padding: '12px',
          marginBottom: '12px',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '8px',
          }}>
            <span style={{ color: '#a1a1aa', fontSize: '12px' }}>⏱️ 已采集时长</span>
            <span style={{
              color: '#00d4ff',
              fontSize: '18px',
              fontWeight: 'bold',
              fontFamily: 'monospace',
            }}>
              {duration}
            </span>
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '4px',
          }}>
            <span style={{ color: '#a1a1aa', fontSize: '12px' }}>📍 当前轨道</span>
            <span style={{ color: '#ffffff', fontSize: '13px' }}>
              {location?.icon} {location?.name}
            </span>
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <span style={{ color: '#a1a1aa', fontSize: '12px' }}>🎯 采集模式</span>
            <span style={{ color: '#ffffff', fontSize: '13px' }}>
              {modeInfo.icon} {modeInfo.name}
            </span>
          </div>
        </div>
      ) : (
        <div style={{
          background: 'rgba(55, 65, 81, 0.3)',
          borderRadius: '12px',
          padding: '12px',
          marginBottom: '12px',
          textAlign: 'center',
        }}>
          <span style={{ color: '#71717a', fontSize: '13px' }}>
            自动采集系统待机中，点击开始设置采集任务
          </span>
        </div>
      )}

      {/* 操作按钮 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isCollecting ? 'repeat(3, 1fr)' : '1fr',
        gap: '8px',
      }}>
        {isCollecting ? (
          <>
            <button
              onClick={onClaim}
              style={{
                background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                border: 'none',
                borderRadius: '8px',
                padding: '10px',
                color: 'white',
                fontSize: '13px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
            >
              📦 领取收益
            </button>
            <button
              onClick={onOpenSettings}
              style={{
                background: 'rgba(0, 212, 255, 0.2)',
                border: '1px solid rgba(0, 212, 255, 0.5)',
                borderRadius: '8px',
                padding: '10px',
                color: '#00d4ff',
                fontSize: '13px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
            >
              ⚙️ 设置
            </button>
            <button
              onClick={onStop}
              style={{
                background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
                border: 'none',
                borderRadius: '8px',
                padding: '10px',
                color: 'white',
                fontSize: '13px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
            >
              ⏹️ 停止
            </button>
          </>
        ) : (
          <button
            onClick={onStart}
            style={{
              background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)',
              border: 'none',
              borderRadius: '8px',
              padding: '12px',
              color: 'white',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(0, 212, 255, 0.3)',
            }}
          >
            ▶️ 开始自动采集
          </button>
        )}
      </div>
    </div>
  );
}

// 采集设置弹窗
function AutoCollectModal({
  onClose,
  onStart,
  availableLocations,
  playerLevel,
}: {
  onClose: () => void;
  onStart: (locationId: string, mode: AutoCollectMode) => void;
  availableLocations: import('../data/autoCollectTypes').CollectLocation[];
  playerLevel: number;
}) {
  const [selectedLocation, setSelectedLocation] = useState(availableLocations[0]?.id || 'orbit_debris');
  const [selectedMode, setSelectedMode] = useState<AutoCollectMode>(AutoCollectMode.BALANCED);

  const selectedLoc = availableLocations.find(loc => loc.id === selectedLocation);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '16px',
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #1a1f3a 0%, #0a0e27 100%)',
        borderRadius: '20px',
        border: '1px solid rgba(0, 212, 255, 0.3)',
        width: '100%',
        maxWidth: '400px',
        maxHeight: '80vh',
        overflow: 'auto',
      }}>
        {/* 标题 */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid rgba(0, 212, 255, 0.2)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span style={{
            color: '#00d4ff',
            fontSize: '18px',
            fontWeight: 'bold',
          }}>
            🚀 自动采集设置
          </span>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#71717a',
              fontSize: '24px',
              cursor: 'pointer',
            }}
          >
            ×
          </button>
        </div>

        {/* 内容 */}
        <div style={{ padding: '20px' }}>
          {/* 采集地点选择 */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              color: '#a1a1aa',
              fontSize: '13px',
              marginBottom: '8px',
            }}>
              选择采集轨道
            </label>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}>
              {availableLocations.map(loc => (
                <button
                  key={loc.id}
                  onClick={() => setSelectedLocation(loc.id)}
                  style={{
                    background: selectedLocation === loc.id
                      ? 'rgba(0, 212, 255, 0.2)'
                      : 'rgba(55, 65, 81, 0.3)',
                    border: selectedLocation === loc.id
                      ? '1px solid #00d4ff'
                      : '1px solid transparent',
                    borderRadius: '12px',
                    padding: '12px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '4px',
                  }}>
                    <span style={{ fontSize: '20px' }}>{loc.icon}</span>
                    <span style={{
                      color: '#ffffff',
                      fontSize: '14px',
                      fontWeight: 'bold',
                    }}>
                      {loc.name}
                    </span>
                  </div>
                  <div style={{
                    color: '#71717a',
                    fontSize: '12px',
                    marginLeft: '28px',
                  }}>
                    {loc.description}
                  </div>
                  <div style={{
                    display: 'flex',
                    gap: '8px',
                    marginTop: '8px',
                    marginLeft: '28px',
                  }}>
                    <span style={{
                      color: '#ef4444',
                      fontSize: '11px',
                    }}>
                      危险: {loc.dangerLevel}/10
                    </span>
                    <span style={{
                      color: '#10b981',
                      fontSize: '11px',
                    }}>
                      资源: {loc.resourceQuality}/10
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 采集模式选择 */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              color: '#a1a1aa',
              fontSize: '13px',
              marginBottom: '8px',
            }}>
              选择采集模式
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '8px',
            }}>
              {(Object.keys(MODE_INFO) as AutoCollectMode[]).map(mode => (
                <button
                  key={mode}
                  onClick={() => setSelectedMode(mode)}
                  style={{
                    background: selectedMode === mode
                      ? 'rgba(0, 212, 255, 0.2)'
                      : 'rgba(55, 65, 81, 0.3)',
                    border: selectedMode === mode
                      ? '1px solid #00d4ff'
                      : '1px solid transparent',
                    borderRadius: '8px',
                    padding: '10px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <div style={{ fontSize: '20px', marginBottom: '4px' }}>
                    {MODE_INFO[mode].icon}
                  </div>
                  <div style={{
                    color: selectedMode === mode ? '#00d4ff' : '#ffffff',
                    fontSize: '12px',
                    fontWeight: 'bold',
                  }}>
                    {MODE_INFO[mode].name}
                  </div>
                </button>
              ))}
            </div>
            <div style={{
              marginTop: '8px',
              padding: '8px',
              background: 'rgba(0, 212, 255, 0.1)',
              borderRadius: '8px',
            }}>
              <span style={{ color: '#00d4ff', fontSize: '12px' }}>
                {MODE_INFO[selectedMode].description}
              </span>
            </div>
          </div>

          {/* 预计收益 */}
          {selectedLoc && (
            <div style={{
              background: 'rgba(16, 185, 129, 0.1)',
              borderRadius: '12px',
              padding: '12px',
              marginBottom: '20px',
            }}>
              <div style={{
                color: '#10b981',
                fontSize: '12px',
                fontWeight: 'bold',
                marginBottom: '8px',
              }}>
                📊 预计每小时收益
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '8px',
                fontSize: '12px',
              }}>
                <div style={{ color: '#a1a1aa' }}>
                  💰 {selectedLoc.baseRewards.goldMin}-{selectedLoc.baseRewards.goldMax} 信用点
                </div>
                <div style={{ color: '#a1a1aa' }}>
                  ⭐ {selectedLoc.baseRewards.expMin}-{selectedLoc.baseRewards.expMax} 经验
                </div>
                <div style={{ color: '#a1a1aa' }}>
                  📦 材料掉落率: {Math.round(selectedLoc.baseRewards.materialDropChance * 100)}%
                </div>
                <div style={{ color: '#a1a1aa' }}>
                  🎁 装备掉落率: {Math.round(selectedLoc.baseRewards.equipmentDropChance * 100)}%
                </div>
              </div>
            </div>
          )}

          {/* 开始按钮 */}
          <button
            onClick={() => onStart(selectedLocation, selectedMode)}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)',
              border: 'none',
              borderRadius: '12px',
              padding: '14px',
              color: 'white',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(0, 212, 255, 0.3)',
            }}
          >
            ▶️ 开始自动采集
          </button>
        </div>
      </div>
    </div>
  );
}

// 操作按钮组件 - 玻璃拟态风格
function ActionButton({
  icon,
  label,
  gradient,
  onClick,
  disabled = false
}: {
  icon: string;
  label: string;
  gradient: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  // 提取渐变色中的亮色作为发光色
  const getGlowColor = (gradient: string) => {
    const match = gradient.match(/#[a-fA-F0-9]{6}/g);
    return match ? match[match.length - 1] : '#00D4FF';
  };

  const glowColor = getGlowColor(gradient);

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: `linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)`,
        border: `1px solid ${disabled ? 'rgba(255,255,255,0.1)' : `${glowColor}40`}`,
        borderRadius: '16px',
        padding: '14px 6px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: disabled
          ? 'none'
          : `0 4px 20px ${glowColor}20, inset 0 1px 0 rgba(255,255,255,0.1)`,
        transform: 'scale(1)',
        position: 'relative',
        overflow: 'hidden',
        backdropFilter: 'blur(10px)'
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = 'scale(1.03) translateY(-2px)';
          e.currentTarget.style.boxShadow = `0 8px 30px ${glowColor}40, inset 0 1px 0 rgba(255,255,255,0.2)`;
          e.currentTarget.style.borderColor = `${glowColor}80`;
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1) translateY(0)';
        e.currentTarget.style.boxShadow = disabled
          ? 'none'
          : `0 4px 20px ${glowColor}20, inset 0 1px 0 rgba(255,255,255,0.1)`;
        e.currentTarget.style.borderColor = disabled ? 'rgba(255,255,255,0.1)' : `${glowColor}40`;
      }}
    >
      {/* 顶部渐变光效 */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: '10%',
        right: '10%',
        height: '1px',
        background: `linear-gradient(90deg, transparent 0%, ${glowColor}80 50%, transparent 100%)`,
        opacity: disabled ? 0.3 : 0.6
      }} />

      {/* 图标容器 */}
      <div style={{
        width: '44px',
        height: '44px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${glowColor}30 0%, ${glowColor}10 100%)`,
        borderRadius: '12px',
        border: `1px solid ${glowColor}50`,
        fontSize: '24px',
        filter: disabled ? 'grayscale(100%)' : 'none',
        transition: 'all 0.3s ease'
      }}>
        {icon}
      </div>

      <span style={{
        color: disabled ? '#9CA3AF' : 'white',
        fontSize: '12px',
        fontWeight: '600',
        textShadow: `0 1px 2px rgba(0,0,0,0.5)`,
        letterSpacing: '0.3px'
      }}>{label}</span>
    </button>
  );
}

// 日志项组件 - 新主题
function LogItem({ log, isLatest }: { log: string; isLatest: boolean }) {
  const getLogIcon = (logText: string) => {
    if (logText.includes('休息') || logText.includes('休整')) return '🛌';
    if (logText.includes('天气')) return '🌌';
    if (logText.includes('装备')) return '🔫';
    if (logText.includes('升华')) return '✨';
    if (logText.includes('任务')) return '📋';
    if (logText.includes('战斗')) return '⚔️';
    if (logText.includes('探索')) return '🪐';
    if (logText.includes('物品')) return '📦';
    if (logText.includes('制造')) return '🔨';
    if (logText.includes('分解')) return '📦';
    if (logText.includes('技能')) return '📖';
    if (logText.includes('跃迁')) return '🚀';
    return '•';
  };

  const getLogColor = (logText: string) => {
    if (logText.includes('成功') || logText.includes('恢复')) return '#10b981';
    if (logText.includes('失败')) return '#ef4444';
    if (logText.includes('升华')) return '#c084fc';
    if (logText.includes('任务')) return '#00d4ff';
    if (logText.includes('休息') || logText.includes('休整')) return '#60a5fa';
    if (logText.includes('跃迁')) return '#00d4ff';
    return '#d1d5db';
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: '8px',
      fontSize: '12px',
      padding: isLatest ? '8px' : '0',
      backgroundColor: isLatest ? 'rgba(0, 212, 255, 0.1)' : 'transparent',
      borderRadius: '6px',
      border: isLatest ? '1px solid rgba(0, 212, 255, 0.3)' : 'none'
    }}>
      <span style={{ color: '#6b7280' }}>{getLogIcon(log)}</span>
      <span style={{ color: getLogColor(log), lineHeight: '1.4' }}>{log}</span>
    </div>
  );
}
