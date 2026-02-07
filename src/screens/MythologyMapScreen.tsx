import { useState } from 'react';
import { MYTHOLOGY_LOCATIONS } from '../data/mythologyLocations';
import { MythologyType } from '../data/types';
import type { MythologyLocation } from '../data/types';
import { useGameStore } from '../stores/gameStore';

interface MythologyMapScreenProps {
  onBack: () => void;
  onSelectLocation: (locationId: string) => void;
}

export default function MythologyMapScreen({ onBack, onSelectLocation }: MythologyMapScreenProps) {
  const { gameManager } = useGameStore();
  const [selectedMythology, setSelectedMythology] = useState<MythologyType | 'all'>('all');
  const [selectedLocation, setSelectedLocation] = useState<MythologyLocation | null>(null);

  // 检查神话星球是否已解锁
  const isMythologyUnlocked = gameManager.isMythologyUnlocked();

  // 过滤星球
  const filteredLocations = MYTHOLOGY_LOCATIONS.filter(loc =>
    selectedMythology === 'all' || loc.mythology === selectedMythology
  );

  // 获取神话体系颜色
  const getMythologyColor = (type: MythologyType) => {
    return type === MythologyType.GREEK ? '#00d4ff' : '#60a5fa';
  };

  // 获取神话体系名称
  const getMythologyName = (type: MythologyType) => {
    return type === MythologyType.GREEK ? '希腊神话' : '北欧神话';
  };

  // 获取状态颜色
  const getStatusColor = (location: MythologyLocation) => {
    if (location.isCompleted) return '#4ade80';
    if (location.isUnlocked) return '#00d4ff';
    return '#6b7280';
  };

  // 获取状态文本
  const getStatusText = (location: MythologyLocation) => {
    if (location.isCompleted) return '已攻略';
    if (location.isUnlocked) return '可探索';
    return '未解锁';
  };

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
            onClick={onBack}
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
            <span>返回</span>
          </button>
          <h1 style={{ color: 'white', fontWeight: 'bold', fontSize: '18px' }}>神话星球</h1>
          <div style={{ width: '48px' }} />
        </div>
      </header>

      {/* 神话体系筛选 */}
      <div style={{
        flexShrink: 0,
        display: 'flex',
        gap: '8px',
        padding: '12px 16px',
        backgroundColor: '#252525',
        borderBottom: '1px solid #374151'
      }}>
        {(['all', MythologyType.GREEK, MythologyType.NORDIC] as const).map((type) => (
          <button
            key={type}
            onClick={() => setSelectedMythology(type)}
            style={{
              padding: '8px 16px',
              backgroundColor: selectedMythology === type ? '#2a3050' : '#1f2937',
              color: selectedMythology === type ? 'white' : '#9ca3af',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: selectedMythology === type ? 'bold' : 'normal'
            }}
          >
            {type === 'all' ? '全部' : getMythologyName(type)}
          </button>
        ))}
      </div>

      {/* 锁定提示 */}
      {!isMythologyUnlocked && (
        <div style={{
          flexShrink: 0,
          backgroundColor: '#451a1a',
          borderBottom: '1px solid #7f1d1d',
          padding: '12px 16px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: '#fca5a5'
          }}>
            <span style={{ fontSize: '20px' }}>🔒</span>
            <div>
              <p style={{ margin: 0, fontWeight: 'bold' }}>神话星球尚未解锁</p>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', opacity: 0.8 }}>
                完成星球5「岩石峭壁中继站」的Boss挑战后可解锁神话星球
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 星球地图 */}
      <main style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        opacity: isMythologyUnlocked ? 1 : 0.5
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
          gap: '12px'
        }}>
          {filteredLocations.map((location) => (
            <button
              key={location.id}
              onClick={() => setSelectedLocation(location)}
              disabled={!location.isUnlocked}
              style={{
                aspectRatio: '1',
                backgroundColor: location.isCompleted ? '#064e3b' : location.isUnlocked ? '#1f2937' : '#111827',
                border: `2px solid ${getStatusColor(location)}`,
                borderRadius: '12px',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: location.isUnlocked ? 'pointer' : 'not-allowed',
                opacity: location.isUnlocked ? 1 : 0.5,
                position: 'relative'
              }}
            >
              {/* 星球编号 */}
              <div style={{
                position: 'absolute',
                top: '8px',
                left: '8px',
                backgroundColor: getMythologyColor(location.mythology),
                color: '#0a0e27',
                fontSize: '10px',
                fontWeight: 'bold',
                padding: '2px 6px',
                borderRadius: '4px'
              }}>
                #{location.stationNumber}
              </div>

              {/* 状态标识 */}
              <div style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                fontSize: '12px'
              }}>
                {location.isCompleted ? '✅' : location.isUnlocked ? '🔓' : '🔒'}
              </div>

              {/* 图标 */}
              <div style={{
                fontSize: '32px',
                marginBottom: '8px'
              }}>
                {location.icon}
              </div>

              {/* 名称 */}
              <div style={{
                fontSize: '12px',
                color: location.isUnlocked ? 'white' : '#6b7280',
                textAlign: 'center',
                fontWeight: 'bold',
                lineHeight: '1.3'
              }}>
                {location.name}
              </div>

              {/* 神明名称 */}
              <div style={{
                fontSize: '10px',
                color: getMythologyColor(location.mythology),
                marginTop: '4px'
              }}>
                {location.deity.name}
              </div>

              {/* 进度条 */}
              {location.isUnlocked && !location.isCompleted && (
                <div style={{
                  width: '100%',
                  height: '4px',
                  backgroundColor: '#374151',
                  borderRadius: '2px',
                  marginTop: '8px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${location.explorationProgress}%`,
                    height: '100%',
                    backgroundColor: '#00d4ff',
                    transition: 'width 0.3s'
                  }} />
                </div>
              )}
            </button>
          ))}
        </div>
      </main>

      {/* 星球详情弹窗 */}
      {selectedLocation && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            backgroundColor: '#1a1f3a',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '360px',
            maxHeight: '80vh',
            overflowY: 'auto',
            border: `2px solid ${getMythologyColor(selectedLocation.mythology)}`
          }}>
            {/* 头部 */}
            <div style={{
              padding: '16px',
              borderBottom: '1px solid #374151',
              backgroundColor: '#252525'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '32px' }}>{selectedLocation.icon}</span>
                  <div>
                    <h2 style={{ color: 'white', fontWeight: 'bold', fontSize: '16px', margin: 0 }}>
                      {selectedLocation.name}
                    </h2>
                    <p style={{
                      color: getMythologyColor(selectedLocation.mythology),
                      fontSize: '12px',
                      margin: '4px 0 0 0'
                    }}>
                      {getMythologyName(selectedLocation.mythology)} · {getStatusText(selectedLocation)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedLocation(null)}
                  style={{ color: '#a1a1aa', background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* 内容 */}
            <div style={{ padding: '16px' }}>
              {/* 神明信息 */}
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ color: '#a1a1aa', fontSize: '12px', marginBottom: '8px' }}>神明</h3>
                <div style={{
                  backgroundColor: '#1f2937',
                  borderRadius: '8px',
                  padding: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    backgroundColor: '#374151',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px'
                  }}>
                    👑
                  </div>
                  <div>
                    <p style={{ color: 'white', fontWeight: 'bold', fontSize: '14px', margin: 0 }}>
                      {selectedLocation.deity.name}
                    </p>
                    <p style={{ color: '#a1a1aa', fontSize: '12px', margin: '4px 0 0 0' }}>
                      {selectedLocation.deity.title}
                    </p>
                  </div>
                </div>
              </div>

              {/* 描述 */}
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ color: '#a1a1aa', fontSize: '12px', marginBottom: '8px' }}>背景</h3>
                <p style={{ color: '#d1d5db', fontSize: '13px', lineHeight: '1.6' }}>
                  {selectedLocation.description}
                </p>
              </div>

              {/* 核心道具 */}
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ color: '#a1a1aa', fontSize: '12px', marginBottom: '8px' }}>核心道具</h3>
                <div style={{
                  backgroundColor: '#1f2937',
                  borderRadius: '8px',
                  padding: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <span style={{ fontSize: '24px' }}>{selectedLocation.coreItem.icon}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ color: '#00d4ff', fontWeight: 'bold', fontSize: '14px', margin: 0 }}>
                      {selectedLocation.coreItem.name}
                    </p>
                    <p style={{ color: '#a1a1aa', fontSize: '11px', margin: '4px 0 0 0' }}>
                      {selectedLocation.coreItem.effectDescription}
                    </p>
                  </div>
                </div>
              </div>

              {/* 虚空生物信息 */}
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ color: '#a1a1aa', fontSize: '12px', marginBottom: '8px' }}>威胁</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{
                    backgroundColor: '#1f2937',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span style={{ fontSize: '16px' }}>🌿</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ color: '#d1d5db', fontSize: '12px', margin: 0 }}>
                        星际空间：{selectedLocation.wildMonster.name}
                      </p>
                      <p style={{ color: '#ef4444', fontSize: '11px', margin: '2px 0 0 0' }}>
                        需跃迁速度 {selectedLocation.wildMonster.speedRequirement}x
                      </p>
                    </div>
                  </div>
                  <div style={{
                    backgroundColor: '#1f2937',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span style={{ fontSize: '16px' }}>🏛️</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ color: '#d1d5db', fontSize: '12px', margin: 0 }}>
                        星球：{selectedLocation.stationMonster.name}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 探索进度 */}
              {selectedLocation.isUnlocked && !selectedLocation.isCompleted && (
                <div style={{ marginBottom: '16px' }}>
                  <h3 style={{ color: '#a1a1aa', fontSize: '12px', marginBottom: '8px' }}>探索进度</h3>
                  <div style={{
                    backgroundColor: '#1f2937',
                    borderRadius: '8px',
                    padding: '12px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ color: '#a1a1aa', fontSize: '12px' }}>当前进度</span>
                      <span style={{ color: '#00d4ff', fontWeight: 'bold', fontSize: '14px' }}>
                        {selectedLocation.explorationProgress}%
                      </span>
                    </div>
                    <div style={{
                      backgroundColor: '#374151',
                      borderRadius: '9999px',
                      height: '8px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        height: '100%',
                        backgroundColor: '#00d4ff',
                        width: `${selectedLocation.explorationProgress}%`,
                        transition: 'width 0.3s'
                      }} />
                    </div>
                  </div>
                </div>
              )}

              {/* 操作按钮 */}
              {selectedLocation.isUnlocked && !selectedLocation.isCompleted && (
                <button
                  onClick={() => {
                    onSelectLocation(selectedLocation.id);
                    setSelectedLocation(null);
                  }}
                  style={{
                    width: '100%',
                    padding: '14px',
                    backgroundColor: '#0099cc',
                    color: 'white',
                    fontWeight: 'bold',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  开始探索
                </button>
              )}

              {selectedLocation.isCompleted && (
                <div style={{
                  padding: '14px',
                  backgroundColor: '#064e3b',
                  color: '#4ade80',
                  borderRadius: '8px',
                  textAlign: 'center',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}>
                  ✅ 已攻略完成
                </div>
              )}

              {!selectedLocation.isUnlocked && (
                <div style={{
                  padding: '14px',
                  backgroundColor: '#374151',
                  color: '#6b7280',
                  borderRadius: '8px',
                  textAlign: 'center',
                  fontSize: '14px'
                }}>
                  🔒 需攻略前置星球解锁
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
