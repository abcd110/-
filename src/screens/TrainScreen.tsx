import { useGameStore } from '../stores/gameStore';
import { TrainUpgradeType } from '../core/Train';
import { getFacilityName } from '../data/trainUpgrades';

interface TrainScreenProps {
  onBack: () => void;
}

export default function TrainScreen({ onBack }: TrainScreenProps) {
  const { gameManager, upgradeTrain } = useGameStore();
  const train = gameManager.train;

  const handleUpgrade = (type: TrainUpgradeType) => {
    upgradeTrain(type);
  };

  const getUpgradeDisplayInfo = (type: TrainUpgradeType) => {
    const details = gameManager.getTrainUpgradeDetails(type);

    switch (type) {
      case TrainUpgradeType.CAPACITY:
        return {
          name: details.name,
          icon: '📦',
          description: '扩展货舱货舱容量，增加物资存储空间',
          current: `+${train.capacityBonus} 单位`,
          next: `+${train.capacityBonus + 5} 单位`,
          coinCost: details.coinCost,
          materials: details.materialsStatus,
          canUpgrade: details.canUpgrade,
        };
      case TrainUpgradeType.ARMOR:
        return {
          name: '虚空护盾',
          icon: '🛡️',
          description: '增强虚空防护，提高航船虚空防护',
          current: `+${train.armorBonus} 防护`,
          next: `+${train.armorBonus + 20} 防护`,
          coinCost: details.coinCost,
          materials: details.materialsStatus,
          canUpgrade: details.canUpgrade,
        };
      case TrainUpgradeType.SPEED:
        return {
          name: '跃迁引擎',
          icon: '⚡',
          description: '升级跃迁引擎，提升星际航行跃迁速度',
          current: `等级 ${train.speedLevel}`,
          next: `等级 ${train.speedLevel + 1}`,
          coinCost: details.coinCost,
          materials: details.materialsStatus,
          canUpgrade: details.canUpgrade,
        };
      case TrainUpgradeType.FACILITY:
        return {
          name: '舰载设施',
          icon: '🔧',
          description: '升级航船内部设施，解锁更多功能',
          current: getFacilityName(train.facilityLevel),
          next: getFacilityName(train.facilityLevel + 1),
          coinCost: details.coinCost,
          materials: details.materialsStatus,
          canUpgrade: details.canUpgrade,
        };
      default:
        return null;
    }
  };

  const upgrades = [
    TrainUpgradeType.CAPACITY,
    TrainUpgradeType.ARMOR,
    TrainUpgradeType.SPEED,
    TrainUpgradeType.FACILITY,
  ];

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
          <h1 style={{
            color: '#00d4ff',
            fontWeight: 'bold',
            fontSize: '18px',
            textShadow: '0 0 10px rgba(0, 212, 255, 0.3)'
          }}>航船管理</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#00d4ff' }}>
            <span>💎</span>
            <span style={{ fontWeight: 'bold' }}>{gameManager.trainCoins}</span>
          </div>
        </div>
      </header>

      {/* 航船状态 - 新主题 */}
      <section style={{
        flexShrink: 0,
        background: 'rgba(26, 31, 58, 0.6)',
        padding: '16px',
        borderBottom: '1px solid rgba(0, 212, 255, 0.2)'
      }}>
        <div style={{
          background: 'linear-gradient(145deg, rgba(26, 31, 58, 0.9) 0%, rgba(10, 14, 39, 0.9) 100%)',
          borderRadius: '16px',
          padding: '20px',
          border: '1px solid rgba(0, 212, 255, 0.3)',
          boxShadow: '0 0 20px rgba(0, 212, 255, 0.1)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* 顶部发光条 */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: 'linear-gradient(90deg, transparent 0%, #00d4ff 50%, transparent 100%)'
          }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <div style={{
              width: '72px',
              height: '72px',
              background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '36px',
              border: '1px solid rgba(0, 212, 255, 0.3)',
              boxShadow: '0 0 15px rgba(0, 212, 255, 0.2)'
            }}>
              🚀
            </div>
            <div>
              <h2 style={{
                color: '#00d4ff',
                fontWeight: 'bold',
                fontSize: '20px',
                margin: '0 0 4px 0',
                textShadow: '0 0 10px rgba(0, 212, 255, 0.3)'
              }}>
                初号拓荒舰
              </h2>
              <p style={{ color: '#a1a1aa', fontSize: '14px', margin: 0 }}>
                等级 {train.level} | 跃迁跃迁速度 {train.speed}
              </p>
            </div>
          </div>

          {/* 能量/耐久条 - 新主题 */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
              <span style={{ color: '#a1a1aa' }}>虚空防护</span>
              <span style={{
                color: train.durability < train.maxDurability * 0.3 ? '#ef4444' : '#00d4ff',
                fontWeight: 'bold'
              }}>
                {train.durability}/{train.maxDurability}
              </span>
            </div>
            <div style={{
              backgroundColor: 'rgba(10, 14, 39, 0.8)',
              borderRadius: '9999px',
              height: '10px',
              overflow: 'hidden',
              border: '1px solid rgba(0, 212, 255, 0.2)'
            }}>
              <div
                style={{
                  height: '100%',
                  background: train.durability < train.maxDurability * 0.3
                    ? 'linear-gradient(90deg, #dc2626 0%, #ef4444 100%)'
                    : 'linear-gradient(90deg, #0099cc 0%, #00d4ff 100%)',
                  transition: 'width 0.3s',
                  width: `${(train.durability / train.maxDurability) * 100}%`,
                  boxShadow: train.durability < train.maxDurability * 0.3
                    ? '0 0 10px rgba(239, 68, 68, 0.5)'
                    : '0 0 10px rgba(0, 212, 255, 0.3)'
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 升级选项 - 新主题 */}
      <main style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {upgrades.map(upgradeType => {
            const info = getUpgradeDisplayInfo(upgradeType);
            if (!info) return null;

            return (
              <div
                key={upgradeType}
                style={{
                  background: 'linear-gradient(145deg, rgba(26, 31, 58, 0.8) 0%, rgba(10, 14, 39, 0.8) 100%)',
                  borderRadius: '12px',
                  padding: '16px',
                  border: '1px solid rgba(0, 212, 255, 0.2)',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    border: '1px solid rgba(0, 212, 255, 0.3)'
                  }}>
                    {info.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{
                      color: '#00d4ff',
                      fontWeight: 'bold',
                      fontSize: '16px',
                      margin: '0 0 4px 0'
                    }}>
                      {info.name}
                    </h3>
                    <p style={{ color: '#71717a', fontSize: '12px', margin: 0 }}>{info.description}</p>
                  </div>
                </div>

                <div style={{
                  backgroundColor: 'rgba(10, 14, 39, 0.6)',
                  borderRadius: '8px',
                  padding: '12px',
                  marginBottom: '12px',
                  border: '1px solid rgba(0, 212, 255, 0.1)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px' }}>
                    <span style={{ color: '#71717a' }}>当前</span>
                    <span style={{ color: '#a1a1aa' }}>{info.current}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                    <span style={{ color: '#71717a' }}>升级后</span>
                    <span style={{ color: '#10b981', fontWeight: 'bold' }}>{info.next}</span>
                  </div>
                </div>

                {/* 材料需求 */}
                <div style={{
                  backgroundColor: 'rgba(10, 14, 39, 0.6)',
                  borderRadius: '8px',
                  padding: '12px',
                  marginBottom: '12px',
                  border: '1px solid rgba(0, 212, 255, 0.1)'
                }}>
                  <p style={{ color: '#a1a1aa', fontSize: '12px', margin: '0 0 8px 0' }}>升级所需材料：</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {info.materials.map((mat, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '13px',
                          color: mat.isEnough ? '#10b981' : '#ef4444'
                        }}
                      >
                        <span>{mat.name}</span>
                        <span>{mat.hasQuantity}/{mat.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 升级按钮 - 新主题 */}
                <button
                  onClick={() => handleUpgrade(upgradeType)}
                  disabled={!info.canUpgrade}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: info.canUpgrade
                      ? 'linear-gradient(135deg, #0099cc 0%, #00d4ff 100%)'
                      : 'linear-gradient(135deg, #374151 0%, #2a3050 100%)',
                    color: info.canUpgrade ? 'white' : '#71717a',
                    fontWeight: 'bold',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: info.canUpgrade ? 'pointer' : 'not-allowed',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: info.canUpgrade ? '0 0 15px rgba(0, 212, 255, 0.3)' : 'none',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <span>💎</span>
                  <span>{info.coinCost} 信用点 + 材料 升级</span>
                </button>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
