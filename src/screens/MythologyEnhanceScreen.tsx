import { useState } from 'react';
import { useGameStore } from '../stores/gameStore';
import { EquipmentSlot, EquipmentRarity } from '../data/equipmentTypes';
import { ItemRarity } from '../data/types';
import { equipmentSystem } from '../core/EquipmentSystem';

interface MythologyEnhanceScreenProps {
  onBack: () => void;
}

const SLOT_ICONS: Record<EquipmentSlot, string> = {
  [EquipmentSlot.HEAD]: '🪖',
  [EquipmentSlot.BODY]: '👕',
  [EquipmentSlot.LEGS]: '👖',
  [EquipmentSlot.FEET]: '👢',
  [EquipmentSlot.WEAPON]: '⚔️',
  [EquipmentSlot.ACCESSORY]: '💍',
};

const RARITY_COLORS: Record<ItemRarity, string> = {
  [EquipmentRarity.COMMON]: '#9ca3af',
  [EquipmentRarity.UNCOMMON]: '#4ade80',
  [EquipmentRarity.RARE]: '#60a5fa',
  [EquipmentRarity.EPIC]: '#c084fc',
  [EquipmentRarity.LEGENDARY]: '#00d4ff',
  [EquipmentRarity.MYTHIC]: '#f87171',
};

const RARITY_NAMES: Record<ItemRarity, string> = {
  [EquipmentRarity.COMMON]: '普通',
  [EquipmentRarity.UNCOMMON]: '优秀',
  [EquipmentRarity.RARE]: '稀有',
  [EquipmentRarity.EPIC]: '史诗',
  [EquipmentRarity.LEGENDARY]: '传说',
  [EquipmentRarity.MYTHIC]: '神话',
};

export default function MythologyEnhanceScreen({ onBack }: MythologyEnhanceScreenProps) {
  const { gameManager } = useGameStore();
  const player = gameManager.player;

  const [selectedSlot, setSelectedSlot] = useState<EquipmentSlot | null>(null);
  const [activeTab, setActiveTab] = useState<'enhance' | 'sublimate'>('enhance');
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // 获取当前选中的装备
  const selectedEquipment = selectedSlot ? player.getEquipmentBySlot(selectedSlot) : null;

  // 获取强化成功率
  const getEnhanceRate = (level: number) => {
    return equipmentSystem.getEnhanceSuccessRate(level);
  };

  // 获取升华成功率
  const getSublimationRate = (level: number) => {
    return equipmentSystem.getSublimationSuccessRate(level);
  };

  // 执行强化
  const handleEnhance = async () => {
    if (!selectedEquipment) return;

    setIsProcessing(true);

    // 模拟动画延迟
    await new Promise(resolve => setTimeout(resolve, 800));

    const successRate = getEnhanceRate(selectedEquipment.enhanceLevel);
    // eslint-disable-next-line react-hooks/purity
    const success = Math.random() < successRate;

    // 扣除费用（这里简化处理）
    const cost = calculateEnhanceCost(selectedEquipment.enhanceLevel);
    const consumeSuccess = gameManager.consumeTrainCoins(cost);
    if (consumeSuccess) {
      const updated = equipmentSystem.enhanceEquipment(selectedEquipment, success);

      // 更新装备
      player.equipMythologyItem(updated);

      setResult({
        success,
        message: success
          ? `强化成功！${selectedEquipment.name} 达到 +${updated.enhanceLevel}`
          : '强化失败，装备等级未提升'
      });
    } else {
      setResult({
        success: false,
        message: '航船币不足'
      });
    }

    setIsProcessing(false);
  };

  // 执行升华
  const handleSublimate = async () => {
    if (!selectedEquipment) return;

    setIsProcessing(true);

    await new Promise(resolve => setTimeout(resolve, 800));

    const successRate = getSublimationRate(selectedEquipment.sublimationLevel);
    // eslint-disable-next-line react-hooks/purity
    const success = Math.random() < successRate;

    const cost = calculateSublimationCost(selectedEquipment.sublimationLevel);
    const consumeSuccess = gameManager.consumeTrainCoins(cost);
    if (consumeSuccess) {
      const updated = equipmentSystem.sublimateEquipment(selectedEquipment, success);
      player.equipMythologyItem(updated);

      setResult({
        success,
        message: success
          ? `升华成功！${selectedEquipment.name} 达到 升华+${updated.sublimationLevel}`
          : '升华失败，装备未提升'
      });
    } else {
      setResult({
        success: false,
        message: '航船币不足'
      });
    }

    setIsProcessing(false);
  };

  // 计算强化费用
  const calculateEnhanceCost = (level: number) => {
    return Math.floor(100 * Math.pow(1.5, level));
  };

  // 计算升华费用
  const calculateSublimationCost = (level: number) => {
    return Math.floor(500 * Math.pow(2, level));
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
          <h1 style={{ color: 'white', fontWeight: 'bold', fontSize: '18px' }}>神话装备强化</h1>
          <div style={{ width: '48px' }} />
        </div>
      </header>

      {/* 标签切换 */}
      <div style={{
        flexShrink: 0,
        display: 'flex',
        backgroundColor: '#1a1f3a',
        borderBottom: '1px solid #374151'
      }}>
        <button
          onClick={() => setActiveTab('enhance')}
          style={{
            flex: 1,
            padding: '12px',
            backgroundColor: activeTab === 'enhance' ? '#0099cc' : 'transparent',
            color: activeTab === 'enhance' ? 'white' : '#9ca3af',
            border: 'none',
            cursor: 'pointer',
            fontWeight: activeTab === 'enhance' ? 'bold' : 'normal'
          }}
        >
          🔨 强化 (+10%/级)
        </button>
        <button
          onClick={() => setActiveTab('sublimate')}
          style={{
            flex: 1,
            padding: '12px',
            backgroundColor: activeTab === 'sublimate' ? '#9333ea' : 'transparent',
            color: activeTab === 'sublimate' ? 'white' : '#9ca3af',
            border: 'none',
            cursor: 'pointer',
            fontWeight: activeTab === 'sublimate' ? 'bold' : 'normal'
          }}
        >
          ✨ 升华 (+5%/级)
        </button>
      </div>

      {/* 主内容区 */}
      <main style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px'
      }}>
        {/* 金币显示 */}
        <div style={{
          backgroundColor: '#1a1f3a',
          borderRadius: '12px',
          padding: '12px 16px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span style={{ color: '#a1a1aa', fontSize: '14px' }}>持有航船币</span>
          <span style={{ color: '#00d4ff', fontWeight: 'bold', fontSize: '16px' }}>
            💰 {gameManager.trainCoins.toLocaleString()}
          </span>
        </div>

        {/* 装备选择 */}
        <div style={{
          backgroundColor: '#1a1f3a',
          borderRadius: '12px',
          padding: '16px',
          border: '1px solid #374151',
          marginBottom: '16px'
        }}>
          <h3 style={{ color: 'white', fontSize: '14px', marginBottom: '12px' }}>
            选择装备槽位
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {Object.values(EquipmentSlot).map(slot => {
              const equippedItem = player.getEquipmentBySlot(slot);
              const isSelected = selectedSlot === slot;

              return (
                <button
                  key={slot}
                  onClick={() => setSelectedSlot(slot)}
                  style={{
                    aspectRatio: '1',
                    backgroundColor: isSelected ? '#1f2937' : '#374151',
                    border: `2px solid ${isSelected ? '#0099cc' : (equippedItem ? RARITY_COLORS[equippedItem.rarity] : '#2a3050')}`,
                    borderRadius: '8px',
                    padding: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <span style={{ fontSize: '24px' }}>{SLOT_ICONS[slot]}</span>
                  {equippedItem ? (
                    <>
                      <span style={{
                        fontSize: '9px',
                        color: RARITY_COLORS[equippedItem.rarity],
                        textAlign: 'center',
                        marginTop: '2px'
                      }}>
                        {equippedItem.name}
                      </span>
                      <span style={{ fontSize: '8px', color: '#00d4ff' }}>
                        +{equippedItem.enhanceLevel}
                      </span>
                    </>
                  ) : (
                    <span style={{ fontSize: '9px', color: '#6b7280', marginTop: '2px' }}>
                      未装备
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 选中装备详情 */}
        {selectedEquipment && (
          <div style={{
            backgroundColor: '#1a1f3a',
            borderRadius: '12px',
            padding: '16px',
            border: `2px solid ${RARITY_COLORS[selectedEquipment.rarity]}`,
            marginBottom: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                backgroundColor: '#1f2937',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px'
              }}>
                {SLOT_ICONS[selectedEquipment.slot]}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{
                  color: RARITY_COLORS[selectedEquipment.rarity],
                  fontWeight: 'bold',
                  fontSize: '16px',
                  margin: '0 0 4px 0'
                }}>
                  {selectedEquipment.name}
                </h3>
                <p style={{ color: '#a1a1aa', fontSize: '12px', margin: 0 }}>
                  {RARITY_NAMES[selectedEquipment.rarity]} · 星球{selectedEquipment.stationNumber}
                </p>
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  <span style={{ color: '#00d4ff', fontSize: '12px' }}>
                    强化 +{selectedEquipment.enhanceLevel}
                  </span>
                  <span style={{ color: '#c084fc', fontSize: '12px' }}>
                    升华 +{selectedEquipment.sublimationLevel}
                  </span>
                </div>
              </div>
            </div>

            {/* 当前属性 */}
            <div style={{
              backgroundColor: '#1f2937',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '12px'
            }}>
              <h4 style={{ color: '#a1a1aa', fontSize: '12px', marginBottom: '8px' }}>当前属性</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px', fontSize: '13px' }}>
                {selectedEquipment.stats.attack !== undefined && selectedEquipment.stats.attack > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#a1a1aa' }}>攻击</span>
                    <span style={{ color: '#f87171' }}>
                      {Math.floor(selectedEquipment.stats.attack * (1 + selectedEquipment.enhanceLevel * 0.1) * (1 + selectedEquipment.sublimationLevel * 0.05))}
                    </span>
                  </div>
                )}
                {selectedEquipment.stats.defense !== undefined && selectedEquipment.stats.defense > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#a1a1aa' }}>防御</span>
                    <span style={{ color: '#60a5fa' }}>
                      {Math.floor(selectedEquipment.stats.defense * (1 + selectedEquipment.enhanceLevel * 0.1) * (1 + selectedEquipment.sublimationLevel * 0.05))}
                    </span>
                  </div>
                )}
                {selectedEquipment.stats.hp !== undefined && selectedEquipment.stats.hp > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#a1a1aa' }}>生命</span>
                    <span style={{ color: '#ef4444' }}>
                      {Math.floor(selectedEquipment.stats.hp * (1 + selectedEquipment.enhanceLevel * 0.1) * (1 + selectedEquipment.sublimationLevel * 0.05))}
                    </span>
                  </div>
                )}
                {selectedEquipment.stats.penetration !== undefined && selectedEquipment.stats.penetration > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#a1a1aa' }}>穿透</span>
                    <span style={{ color: '#fb923c' }}>
                      {Math.floor(selectedEquipment.stats.penetration * (1 + selectedEquipment.enhanceLevel * 0.1) * (1 + selectedEquipment.sublimationLevel * 0.05))}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* 强化/升华信息 */}
            {activeTab === 'enhance' ? (
              <>
                <div style={{
                  backgroundColor: '#1f2937',
                  borderRadius: '8px',
                  padding: '12px',
                  marginBottom: '12px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ color: '#a1a1aa', fontSize: '14px' }}>强化成功率</span>
                    <span style={{
                      color: getSuccessRateColor(getEnhanceRate(selectedEquipment.enhanceLevel)),
                      fontWeight: 'bold',
                      fontSize: '20px'
                    }}>
                      {Math.round(getEnhanceRate(selectedEquipment.enhanceLevel) * 100)}%
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
                      backgroundColor: getSuccessRateColor(getEnhanceRate(selectedEquipment.enhanceLevel)),
                      width: `${getEnhanceRate(selectedEquipment.enhanceLevel) * 100}%`
                    }} />
                  </div>
                  {selectedEquipment.enhanceLevel >= 10 && (
                    <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '8px' }}>
                      ⚠️ 强化失败可能导致等级下降
                    </p>
                  )}
                </div>

                <div style={{
                  backgroundColor: '#1f2937',
                  borderRadius: '8px',
                  padding: '12px',
                  marginBottom: '12px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#a1a1aa', fontSize: '14px' }}>强化费用</span>
                    <span style={{ color: '#00d4ff', fontWeight: 'bold' }}>
                      {calculateEnhanceCost(selectedEquipment.enhanceLevel).toLocaleString()} 航船币
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleEnhance}
                  disabled={isProcessing || selectedEquipment.enhanceLevel >= 15}
                  style={{
                    width: '100%',
                    padding: '16px',
                    backgroundColor: isProcessing ? '#374151' : (selectedEquipment.enhanceLevel >= 15 ? '#374151' : '#0099cc'),
                    color: isProcessing ? '#6b7280' : (selectedEquipment.enhanceLevel >= 15 ? '#6b7280' : 'white'),
                    fontWeight: 'bold',
                    borderRadius: '12px',
                    border: 'none',
                    cursor: isProcessing || selectedEquipment.enhanceLevel >= 15 ? 'not-allowed' : 'pointer',
                    fontSize: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  {isProcessing ? (
                    <>
                      <span>⚡</span>
                      <span>强化中...</span>
                    </>
                  ) : selectedEquipment.enhanceLevel >= 15 ? (
                    <>
                      <span>✓</span>
                      <span>已达到最高等级</span>
                    </>
                  ) : (
                    <>
                      <span>🔨</span>
                      <span>开始强化</span>
                    </>
                  )}
                </button>
              </>
            ) : (
              <>
                <div style={{
                  backgroundColor: '#1f2937',
                  borderRadius: '8px',
                  padding: '12px',
                  marginBottom: '12px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ color: '#a1a1aa', fontSize: '14px' }}>升华成功率</span>
                    <span style={{
                      color: getSuccessRateColor(getSublimationRate(selectedEquipment.sublimationLevel)),
                      fontWeight: 'bold',
                      fontSize: '20px'
                    }}>
                      {Math.round(getSublimationRate(selectedEquipment.sublimationLevel) * 100)}%
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
                      backgroundColor: getSuccessRateColor(getSublimationRate(selectedEquipment.sublimationLevel)),
                      width: `${getSublimationRate(selectedEquipment.sublimationLevel) * 100}%`
                    }} />
                  </div>
                </div>

                <div style={{
                  backgroundColor: '#1f2937',
                  borderRadius: '8px',
                  padding: '12px',
                  marginBottom: '12px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#a1a1aa', fontSize: '14px' }}>升华费用</span>
                    <span style={{ color: '#00d4ff', fontWeight: 'bold' }}>
                      {calculateSublimationCost(selectedEquipment.sublimationLevel).toLocaleString()} 航船币
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleSublimate}
                  disabled={isProcessing || selectedEquipment.sublimationLevel >= 10}
                  style={{
                    width: '100%',
                    padding: '16px',
                    backgroundColor: isProcessing ? '#374151' : (selectedEquipment.sublimationLevel >= 10 ? '#374151' : '#9333ea'),
                    color: isProcessing ? '#6b7280' : (selectedEquipment.sublimationLevel >= 10 ? '#6b7280' : 'white'),
                    fontWeight: 'bold',
                    borderRadius: '12px',
                    border: 'none',
                    cursor: isProcessing || selectedEquipment.sublimationLevel >= 10 ? 'not-allowed' : 'pointer',
                    fontSize: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  {isProcessing ? (
                    <>
                      <span>✨</span>
                      <span>升华中...</span>
                    </>
                  ) : selectedEquipment.sublimationLevel >= 10 ? (
                    <>
                      <span>✓</span>
                      <span>已达到最高等级</span>
                    </>
                  ) : (
                    <>
                      <span>✨</span>
                      <span>开始升华</span>
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        )}

        {/* 未选择装备提示 */}
        {!selectedEquipment && selectedSlot && (
          <div style={{
            backgroundColor: '#1a1f3a',
            borderRadius: '12px',
            padding: '24px',
            textAlign: 'center'
          }}>
            <p style={{ color: '#6b7280', fontSize: '14px' }}>
              该槽位未装备物品
            </p>
          </div>
        )}
      </main>

      {/* 结果弹窗 */}
      {result && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
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
            maxWidth: '300px',
            padding: '24px',
            textAlign: 'center',
            border: `2px solid ${result.success ? '#4ade80' : '#ef4444'}`
          }}>
            <div style={{
              fontSize: '64px',
              marginBottom: '16px'
            }}>
              {result.success ? '✨' : '💥'}
            </div>
            <h3 style={{
              color: result.success ? '#4ade80' : '#ef4444',
              fontSize: '20px',
              fontWeight: 'bold',
              marginBottom: '8px'
            }}>
              {result.success ? '成功！' : '失败'}
            </h3>
            <p style={{ color: '#d1d5db', fontSize: '14px', marginBottom: '16px' }}>
              {result.message}
            </p>
            <button
              onClick={() => setResult(null)}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: result.success ? '#4ade80' : '#ef4444',
                color: 'white',
                fontWeight: 'bold',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              确定
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// 获取成功率颜色
function getSuccessRateColor(rate: number): string {
  if (rate >= 0.8) return '#4ade80';
  if (rate >= 0.6) return '#00d4ff';
  if (rate >= 0.4) return '#fb923c';
  return '#ef4444';
}
