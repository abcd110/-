import { useState } from 'react';
import { useGameStore } from '../stores/gameStore';
import { EquipmentSlot, EquipmentRarity } from '../data/equipmentTypes';
import { equipmentSystem } from '../core/EquipmentSystem';
import { ItemRarity } from '../data/types';
import { calculateEquipmentStats, calculateSublimationStatsPreview } from '../core/EquipmentStatCalculator';

interface SublimationScreenProps {
  onBack: () => void;
}

const SLOT_NAMES: Record<EquipmentSlot, string> = {
  [EquipmentSlot.HEAD]: '头部',
  [EquipmentSlot.BODY]: '身体',
  [EquipmentSlot.LEGS]: '腿部',
  [EquipmentSlot.FEET]: '脚部',
  [EquipmentSlot.WEAPON]: '武器',
  [EquipmentSlot.ACCESSORY]: '饰品',
  [EquipmentSlot.SHOULDER]: '肩甲',
  [EquipmentSlot.ARM]: '臂甲',
};

// 战甲槽位（6个）
const ARMOR_SLOTS: EquipmentSlot[] = [
  EquipmentSlot.HEAD,
  EquipmentSlot.BODY,
  EquipmentSlot.SHOULDER,
  EquipmentSlot.ARM,
  EquipmentSlot.LEGS,
  EquipmentSlot.FEET,
];

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

export default function SublimationScreen({ onBack }: SublimationScreenProps) {
  const { gameManager, saveGame } = useGameStore();
  const player = gameManager.player;

  const [selectedSlot, setSelectedSlot] = useState<EquipmentSlot | null>(null);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // 获取当前选中的装备
  const selectedEquipment = selectedSlot ? player.getEquipmentBySlot(selectedSlot) : null;

  // 获取升华成功率
  const getSublimationRate = (level: number) => {
    return equipmentSystem.getSublimationSuccessRate(level);
  };

  // 执行升华
  const handleSublimate = async () => {
    if (!selectedEquipment) return;

    setIsProcessing(true);

    await new Promise(resolve => setTimeout(resolve, 800));

    const successRate = getSublimationRate(selectedEquipment.sublimationLevel);
    // eslint-disable-next-line react-hooks/purity
    const success = Math.random() < successRate;

    const cost = calculateSublimationCost(selectedEquipment.rarity);
    const consumeSuccess = player.consumeSpirit(cost);
    if (consumeSuccess) {
      const updated = equipmentSystem.sublimateEquipment(selectedEquipment, success);
      player.equipMythologyItem(updated);

      setResult({
        success,
        message: success
          ? `升华成功！${selectedEquipment.name} 达到 升华+${updated.sublimationLevel}`
          : '升华失败，装备未提升'
      });

      // 保存游戏
      await saveGame();
    } else {
      setResult({
        success: false,
        message: '神能值不足'
      });
    }

    setIsProcessing(false);
  };

  // 根据装备品质获取升华所需神能值
  const getSpiritCostByRarity = (rarity: ItemRarity): number => {
    switch (rarity) {
      case ItemRarity.COMMON:
        return 10;      // 普通装备
      case ItemRarity.UNCOMMON:
        return 20;      // 优秀装备
      case ItemRarity.RARE:
        return 40;      // 稀有装备
      case ItemRarity.EPIC:
        return 60;      // 史诗装备
      case ItemRarity.LEGENDARY:
        return 80;      // 传说装备
      case ItemRarity.MYTHIC:
        return 100;     // 神话装备
      default:
        return 10;
    }
  };

  // 计算升华费用（基于装备品质）
  const calculateSublimationCost = (rarity: ItemRarity) => {
    return getSpiritCostByRarity(rarity);
  };

  // 获取成功率颜色
  const getSuccessRateColor = (rate: number): string => {
    if (rate >= 0.8) return '#4ade80';
    if (rate >= 0.6) return '#00d4ff';
    if (rate >= 0.4) return '#fb923c';
    return '#ef4444';
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
          <h1 style={{ color: 'white', fontWeight: 'bold', fontSize: '18px' }}>✨ 装备升华</h1>
          <div style={{ width: '48px' }} />
        </div>
      </header>

      {/* 主内容区 */}
      <main style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px'
      }}>
        {/* 神能值显示 */}
        <div style={{
          backgroundColor: '#1a1f3a',
          borderRadius: '12px',
          padding: '12px 16px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span style={{ color: '#a1a1aa', fontSize: '14px' }}>当前神能值</span>
          <span style={{ color: '#c084fc', fontWeight: 'bold', fontSize: '16px' }}>
            🔮 {player.spirit}/{player.maxSpirit}
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
            {ARMOR_SLOTS.map(slot => {
              const equippedItem = player.getEquipmentBySlot(slot);
              const isSelected = selectedSlot === slot;

              return (
                <button
                  key={slot}
                  onClick={() => setSelectedSlot(slot)}
                  style={{
                    aspectRatio: '1',
                    backgroundColor: isSelected ? '#1f2937' : '#374151',
                    border: `2px solid ${isSelected ? '#9333ea' : (equippedItem ? RARITY_COLORS[equippedItem.rarity] : '#2a3050')}`,
                    borderRadius: '8px',
                    padding: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <span style={{ fontSize: '14px', color: '#a1a1aa', fontWeight: 'bold' }}>{SLOT_NAMES[slot]}</span>
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
                      <span style={{ fontSize: '8px', color: '#c084fc' }}>
                        升华+{equippedItem.sublimationLevel}
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
                fontSize: '12px',
                color: '#a1a1aa',
                fontWeight: 'bold',
                border: `2px solid ${RARITY_COLORS[selectedEquipment.rarity]}`
              }}>
                {SLOT_NAMES[selectedEquipment.slot]}
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
                {(() => {
                  const stats = calculateEquipmentStats(selectedEquipment);
                  const items = [];
                  if (stats.attack > 0) {
                    items.push(
                      <div key="attack" style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#a1a1aa' }}>攻击</span>
                        <span style={{ color: '#f87171' }}>{stats.attack}</span>
                      </div>
                    );
                  }
                  if (stats.defense > 0) {
                    items.push(
                      <div key="defense" style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#a1a1aa' }}>防御</span>
                        <span style={{ color: '#60a5fa' }}>{stats.defense}</span>
                      </div>
                    );
                  }
                  if (stats.hp > 0) {
                    items.push(
                      <div key="hp" style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#a1a1aa' }}>生命</span>
                        <span style={{ color: '#ef4444' }}>{stats.hp}</span>
                      </div>
                    );
                  }
                  if (stats.speed > 0) {
                    items.push(
                      <div key="speed" style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#a1a1aa' }}>攻速</span>
                        <span style={{ color: '#00d4ff' }}>{stats.speed.toFixed(1)}</span>
                      </div>
                    );
                  }
                  if (stats.dodge > 0) {
                    items.push(
                      <div key="dodge" style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#a1a1aa' }}>闪避</span>
                        <span style={{ color: '#a78bfa' }}>{stats.dodge}</span>
                      </div>
                    );
                  }
                  if (stats.hit > 0) {
                    items.push(
                      <div key="hit" style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#a1a1aa' }}>命中</span>
                        <span style={{ color: '#34d399' }}>{stats.hit}</span>
                      </div>
                    );
                  }
                  if (stats.penetration > 0) {
                    items.push(
                      <div key="penetration" style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#a1a1aa' }}>穿透</span>
                        <span style={{ color: '#fb923c' }}>{stats.penetration}</span>
                      </div>
                    );
                  }
                  return items;
                })()}
              </div>
            </div>

            {/* 升华信息 */}
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
                <span style={{ color: '#c084fc', fontWeight: 'bold' }}>
                  {calculateSublimationCost(selectedEquipment.rarity)} 神能
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
              {result.success ? '升华成功！' : '升华失败'}
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
