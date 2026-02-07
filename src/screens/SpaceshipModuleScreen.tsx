// 《星航荒宇》航船模块界面 - 完善版
import { useState } from 'react';
import { useGameStore } from '../stores/gameStore';
import {
  ALL_MODULES,
  getModulesBySlot,
  ModuleDefinition
} from '../data/spaceshipModules';
import { ModuleSlot, ModuleType } from '../data/types_new';

interface SpaceshipModuleScreenProps {
  onBack: () => void;
}

interface InstalledModule {
  slot: ModuleSlot;
  moduleId: string;
  installedAt: number;
}

export default function SpaceshipModuleScreen({ onBack }: SpaceshipModuleScreenProps) {
  const { gameManager } = useGameStore();
  const [selectedSlot, setSelectedSlot] = useState<ModuleSlot | null>(null);
  const [activeTab, setActiveTab] = useState<'modules' | 'upgrade'>('modules');
  const [installedModules, setInstalledModules] = useState<InstalledModule[]>([]);
  const [notification, setNotification] = useState<string | null>(null);

  // 获取当前航船信息
  const shipLevel = gameManager.train?.level || 1;
  const shipSpeed = gameManager.train?.speed || 100;
  const shipDefense = gameManager.train?.durability || 50;
  const playerCredits = gameManager.trainCoins || 0;

  // 计算已安装模块提供的加成
  const getModuleBonus = (effectType: string): number => {
    let bonus = 0;
    installedModules.forEach(installed => {
      const module = ALL_MODULES.find(m => m.id === installed.moduleId);
      if (module) {
        const effect = module.effects.find(e => e.type === effectType);
        if (effect) {
          bonus += effect.value;
        }
      }
    });
    return bonus;
  };

  const speedBonus = getModuleBonus('speed');
  const defenseBonus = getModuleBonus('defense');
  const cargoBonus = getModuleBonus('cargoCapacity');
  const energyBonus = getModuleBonus('energy');

  // 模块槽位配置
  const slots = [
    { id: ModuleSlot.ENGINE, name: '引擎舱', icon: '⚡', color: '#00d4ff', description: '提升跃迁速度' },
    { id: ModuleSlot.SHIELD, name: '护盾发生器', icon: '🛡️', color: '#8b5cf6', description: '增强虚空防护' },
    { id: ModuleSlot.WEAPON, name: '武器系统', icon: '🔫', color: '#ef4444', description: '强化战斗能力' },
    { id: ModuleSlot.CARGO, name: '货舱', icon: '📦', color: '#f59e0b', description: '增加货舱容量' },
    { id: ModuleSlot.SENSOR, name: '传感器', icon: '📡', color: '#10b981', description: '提升探测范围' },
    { id: ModuleSlot.POWER, name: '能源核心', icon: '🔋', color: '#fbbf24', description: '提供能量支持' },
  ];

  // 获取选中槽位的可用模块
  const availableModules = selectedSlot
    ? getModulesBySlot(selectedSlot)
    : [];

  // 获取槽位已安装的模块
  const getInstalledModuleInSlot = (slotId: ModuleSlot): InstalledModule | undefined => {
    return installedModules.find(m => m.slot === slotId);
  };

  // 安装模块
  const installModule = (module: ModuleDefinition) => {
    if (!selectedSlot) return;

    // 检查是否已安装相同模块
    const existingModule = installedModules.find(m => m.slot === selectedSlot && m.moduleId === module.id);
    if (existingModule) {
      showNotification('⚠️ 该模块已安装', 'warning');
      return;
    }

    // 扣除费用
    if (playerCredits < module.installCost.credits) {
      showNotification('💳 信用点不足！', 'error');
      return;
    }

    gameManager.trainCoins -= module.installCost.credits;

    const newInstalled: InstalledModule = {
      slot: selectedSlot,
      moduleId: module.id,
      installedAt: Date.now(),
    };

    // 检查是否已安装其他模块（替换）
    const existingIndex = installedModules.findIndex(m => m.slot === selectedSlot);
    if (existingIndex >= 0) {
      // 替换现有模块
      const updated = [...installedModules];
      updated[existingIndex] = newInstalled;
      setInstalledModules(updated);
      showNotification(`✅ 已替换为 ${module.name}`, 'success');
    } else {
      // 安装新模块
      setInstalledModules([...installedModules, newInstalled]);
      showNotification(`✅ 成功安装 ${module.name}`, 'success');
    }
  };

  // 卸载模块
  const uninstallModule = (slotId: ModuleSlot) => {
    const updated = installedModules.filter(m => m.slot !== slotId);
    setInstalledModules(updated);
    showNotification('✅ 模块已卸载', 'success');
  };

  // 显示通知
  const showNotification = (message: string, type: 'success' | 'error' | 'warning') => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  // 升级航船
  const upgradeShip = () => {
    const upgradeCost = shipLevel * 1000;
    if (playerCredits < upgradeCost) {
      showNotification('💳 信用点不足！', 'error');
      return;
    }
    gameManager.trainCoins -= upgradeCost;
    gameManager.train.level += 1;
    gameManager.train.speed += 10;
    gameManager.train.durability += 20;
    showNotification(`🚀 航船升级至等级 ${shipLevel + 1}！`, 'success');
  };

  return (
    <div className="space-theme" style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'radial-gradient(ellipse at bottom, #1b2735 0%, #090a0f 100%)'
    }}>
      {/* 通知 */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '12px 24px',
          background: notification.includes('✅')
            ? 'rgba(16, 185, 129, 0.9)'
            : notification.includes('⚠️')
              ? 'rgba(245, 158, 11, 0.9)'
              : 'rgba(239, 68, 68, 0.9)',
          borderRadius: '8px',
          color: 'white',
          fontWeight: 'bold',
          zIndex: 1000,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
        }}>
          {notification}
        </div>
      )}

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
          }}>
            🚀 航船系统
          </h1>
          <div style={{ width: '48px' }} />
        </div>
      </header>

      {/* 航船状态概览 */}
      <div style={{
        flexShrink: 0,
        background: 'rgba(26, 31, 58, 0.8)',
        padding: '16px',
        borderBottom: '1px solid rgba(0, 212, 255, 0.2)'
      }}>
        <div style={{
          background: 'linear-gradient(145deg, rgba(26, 31, 58, 0.9) 0%, rgba(10, 14, 39, 0.9) 100%)',
          borderRadius: '12px',
          padding: '16px',
          border: '1px solid rgba(0, 212, 255, 0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              border: '1px solid rgba(0, 212, 255, 0.3)'
            }}>
              🚀
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{ color: '#00d4ff', fontSize: '18px', fontWeight: 'bold', margin: '0 0 4px 0' }}>
                初号拓荒舰
              </h2>
              <p style={{ color: '#a1a1aa', fontSize: '13px', margin: 0 }}>
                等级 {shipLevel} | 💳 {playerCredits} 信用点
              </p>
            </div>
            <button
              onClick={() => setActiveTab('upgrade')}
              style={{
                padding: '8px 16px',
                background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                fontSize: '13px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              ⚡ 升级
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
            <StatBox label="跃迁速度" value={shipSpeed} bonus={speedBonus} color="#00d4ff" />
            <StatBox label="虚空防护" value={shipDefense} bonus={defenseBonus} color="#8b5cf6" />
            <StatBox label="货舱容量" value={100 + shipLevel * 20} bonus={cargoBonus} color="#f59e0b" />
            <StatBox label="能源输出" value={50 + shipLevel * 10} bonus={energyBonus} color="#fbbf24" />
          </div>
        </div>
      </div>

      {/* 标签页切换 */}
      <div style={{
        flexShrink: 0,
        display: 'flex',
        background: 'rgba(26, 31, 58, 0.6)',
        borderBottom: '1px solid rgba(0, 212, 255, 0.2)'
      }}>
        <button
          onClick={() => { setActiveTab('modules'); setSelectedSlot(null); }}
          style={{
            flex: 1,
            padding: '12px',
            background: activeTab === 'modules' ? 'rgba(0, 212, 255, 0.2)' : 'transparent',
            border: 'none',
            borderBottom: activeTab === 'modules' ? '2px solid #00d4ff' : '2px solid transparent',
            color: activeTab === 'modules' ? '#00d4ff' : '#a1a1aa',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          🔧 模块管理
        </button>
        <button
          onClick={() => setActiveTab('upgrade')}
          style={{
            flex: 1,
            padding: '12px',
            background: activeTab === 'upgrade' ? 'rgba(245, 158, 11, 0.2)' : 'transparent',
            border: 'none',
            borderBottom: activeTab === 'upgrade' ? '2px solid #f59e0b' : '2px solid transparent',
            color: activeTab === 'upgrade' ? '#f59e0b' : '#a1a1aa',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          ⚡ 航船升级
        </button>
      </div>

      {/* 主内容区 */}
      <main style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px'
      }}>
        {activeTab === 'modules' ? (
          !selectedSlot ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h3 style={{ color: '#a1a1aa', fontSize: '14px', margin: '0 0 8px 0' }}>
                选择模块槽位进行安装 ({installedModules.length}/6)
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                {slots.map(slot => {
                  const installed = getInstalledModuleInSlot(slot.id);
                  const module = installed ? ALL_MODULES.find(m => m.id === installed.moduleId) : null;

                  return (
                    <button
                      key={slot.id}
                      onClick={() => setSelectedSlot(slot.id)}
                      style={{
                        padding: '16px',
                        background: module
                          ? `linear-gradient(145deg, ${slot.color}20 0%, rgba(10, 14, 39, 0.8) 100%)`
                          : 'linear-gradient(145deg, rgba(26, 31, 58, 0.8) 0%, rgba(10, 14, 39, 0.8) 100%)',
                        border: `2px solid ${module ? slot.color : slot.color + '40'}`,
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
                      <span style={{ fontSize: '28px' }}>{slot.icon}</span>
                      <span style={{ fontSize: '13px', fontWeight: 'bold', color: slot.color }}>
                        {slot.name}
                      </span>
                      {module ? (
                        <span style={{ fontSize: '11px', color: '#10b981' }}>
                          ✅ {module.name}
                        </span>
                      ) : (
                        <span style={{ fontSize: '11px', color: '#71717a' }}>
                          {slot.description}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <button
                onClick={() => setSelectedSlot(null)}
                style={{
                  padding: '10px 16px',
                  background: 'rgba(26, 31, 58, 0.8)',
                  border: '1px solid rgba(0, 212, 255, 0.3)',
                  borderRadius: '8px',
                  color: '#a1a1aa',
                  cursor: 'pointer',
                  fontSize: '14px',
                  alignSelf: 'flex-start'
                }}
              >
                ← 返回槽位选择
              </button>

              <div style={{
                background: 'linear-gradient(145deg, rgba(26, 31, 58, 0.9) 0%, rgba(10, 14, 39, 0.9) 100%)',
                borderRadius: '12px',
                padding: '16px',
                border: '1px solid rgba(0, 212, 255, 0.3)'
              }}>
                <h3 style={{ color: '#00d4ff', fontSize: '16px', margin: '0 0 8px 0' }}>
                  {slots.find(s => s.id === selectedSlot)?.name}
                </h3>
                <p style={{ color: '#a1a1aa', fontSize: '13px', margin: 0 }}>
                  {slots.find(s => s.id === selectedSlot)?.description}
                </p>
              </div>

              {/* 当前安装的模块 */}
              <InstalledModuleSection
                selectedSlot={selectedSlot}
                installedModules={installedModules}
                onUninstall={uninstallModule}
              />

              <h4 style={{ color: '#a1a1aa', fontSize: '14px', margin: '8px 0' }}>
                可用模块
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {availableModules.map(module => (
                  <ModuleCard
                    key={module.id}
                    module={module}
                    onInstall={() => installModule(module)}
                    canAfford={playerCredits >= module.installCost.credits}
                  />
                ))}
              </div>
            </div>
          )
        ) : (
          /* 升级界面 */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              background: 'linear-gradient(145deg, rgba(26, 31, 58, 0.9) 0%, rgba(10, 14, 39, 0.9) 100%)',
              borderRadius: '12px',
              padding: '20px',
              border: '1px solid rgba(245, 158, 11, 0.3)'
            }}>
              <h3 style={{ color: '#f59e0b', fontSize: '18px', margin: '0 0 16px 0' }}>
                ⚡ 航船升级
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '20px' }}>
                <UpgradeStat label="当前等级" value={`Lv.${shipLevel}`} color="#00d4ff" />
                <UpgradeStat label="升级后" value={`Lv.${shipLevel + 1}`} color="#10b981" />
                <UpgradeStat label="跃迁速度" value={`${shipSpeed} → ${shipSpeed + 10}`} color="#00d4ff" />
                <UpgradeStat label="虚空防护" value={`${shipDefense} → ${shipDefense + 20}`} color="#8b5cf6" />
                <UpgradeStat label="货舱容量" value={`${100 + shipLevel * 20} → ${100 + (shipLevel + 1) * 20}`} color="#f59e0b" />
                <UpgradeStat label="能源输出" value={`${50 + shipLevel * 10} → ${50 + (shipLevel + 1) * 10}`} color="#fbbf24" />
              </div>

              <div style={{
                background: 'rgba(0,0,0,0.3)',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '16px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#a1a1aa', fontSize: '14px' }}>升级费用</span>
                  <span style={{ color: '#fbbf24', fontSize: '18px', fontWeight: 'bold' }}>
                    💳 {shipLevel * 1000}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                  <span style={{ color: '#a1a1aa', fontSize: '14px' }}>当前信用点</span>
                  <span style={{ color: playerCredits >= shipLevel * 1000 ? '#10b981' : '#ef4444', fontSize: '14px' }}>
                    💳 {playerCredits}
                  </span>
                </div>
              </div>

              <button
                onClick={upgradeShip}
                disabled={playerCredits < shipLevel * 1000}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: playerCredits >= shipLevel * 1000
                    ? 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)'
                    : '#4b5563',
                  border: 'none',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: playerCredits >= shipLevel * 1000 ? 'pointer' : 'not-allowed',
                  opacity: playerCredits >= shipLevel * 1000 ? 1 : 0.6
                }}
              >
                {playerCredits >= shipLevel * 1000 ? '⚡ 立即升级' : '💳 信用点不足'}
              </button>
            </div>

            <div style={{
              background: 'rgba(26, 31, 58, 0.6)',
              borderRadius: '12px',
              padding: '16px',
              border: '1px solid rgba(0, 212, 255, 0.2)'
            }}>
              <h4 style={{ color: '#00d4ff', fontSize: '14px', margin: '0 0 12px 0' }}>
                📊 升级说明
              </h4>
              <ul style={{ color: '#a1a1aa', fontSize: '13px', margin: 0, paddingLeft: '20px', lineHeight: '1.8' }}>
                <li>升级航船可解锁更多星球</li>
                <li>每次升级提升基础属性</li>
                <li>高等级航船可安装更多模块</li>
                <li>升级费用随等级递增</li>
              </ul>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// 已安装模块区域组件
function InstalledModuleSection({
  selectedSlot,
  installedModules,
  onUninstall
}: {
  selectedSlot: ModuleSlot | null;
  installedModules: InstalledModule[];
  onUninstall: (slot: ModuleSlot) => void;
}) {
  if (!selectedSlot) return null;

  const installed = installedModules.find(m => m.slot === selectedSlot);
  const module = installed ? ALL_MODULES.find(m => m.id === installed.moduleId) : null;

  if (!module) return null;

  return (
    <div style={{
      background: 'rgba(16, 185, 129, 0.1)',
      borderRadius: '12px',
      padding: '16px',
      border: '1px solid rgba(16, 185, 129, 0.3)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h4 style={{ color: '#10b981', fontSize: '14px', margin: 0 }}>当前安装</h4>
        <button
          onClick={() => onUninstall(selectedSlot)}
          style={{
            padding: '6px 12px',
            background: 'rgba(239, 68, 68, 0.2)',
            border: '1px solid rgba(239, 68, 68, 0.5)',
            borderRadius: '6px',
            color: '#ef4444',
            fontSize: '12px',
            cursor: 'pointer'
          }}
        >
          卸载
        </button>
      </div>
      <ModuleCard module={module} isInstalled />
    </div>
  );
}

// 统计框组件
function StatBox({ label, value, bonus, color }: { label: string; value: number; bonus: number; color: string }) {
  return (
    <div style={{
      background: 'rgba(0,0,0,0.3)',
      padding: '10px',
      borderRadius: '8px',
      textAlign: 'center'
    }}>
      <div style={{ fontSize: '11px', color: '#71717a', marginBottom: '4px' }}>{label}</div>
      <div style={{ fontSize: '16px', fontWeight: 'bold', color }}>
        {value + bonus}
        {bonus > 0 && <span style={{ color: '#10b981', fontSize: '12px' }}> +{bonus}</span>}
      </div>
    </div>
  );
}

// 升级统计组件
function UpgradeStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{
      background: 'rgba(0,0,0,0.3)',
      padding: '12px',
      borderRadius: '8px',
      textAlign: 'center'
    }}>
      <div style={{ fontSize: '11px', color: '#71717a', marginBottom: '4px' }}>{label}</div>
      <div style={{ fontSize: '14px', fontWeight: 'bold', color }}>{value}</div>
    </div>
  );
}

// 模块卡片组件
function ModuleCard({
  module,
  isInstalled = false,
  onInstall,
  canAfford = true
}: {
  module: ModuleDefinition;
  isInstalled?: boolean;
  onInstall?: () => void;
  canAfford?: boolean;
}) {
  const rarityColors: Record<string, string> = {
    'common': '#71717a',
    'uncommon': '#10b981',
    'rare': '#00d4ff',
    'epic': '#8b5cf6',
    'legendary': '#f59e0b',
    'mythic': '#ef4444',
  };

  const rarityNames: Record<string, string> = {
    'common': '普通',
    'uncommon': '稀有',
    'rare': '罕见',
    'epic': '史诗',
    'legendary': '传说',
    'mythic': '神话',
  };

  return (
    <div style={{
      padding: '16px',
      background: isInstalled
        ? 'linear-gradient(145deg, rgba(16, 185, 129, 0.1) 0%, rgba(10, 14, 39, 0.8) 100%)'
        : 'linear-gradient(145deg, rgba(26, 31, 58, 0.8) 0%, rgba(10, 14, 39, 0.8) 100%)',
      border: `1px solid ${isInstalled ? '#10b981' : rarityColors[module.rarity]}60`,
      borderRadius: '12px',
      color: 'white'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <h4 style={{
          color: rarityColors[module.rarity],
          fontSize: '16px',
          fontWeight: 'bold',
          margin: 0
        }}>
          {module.name}
        </h4>
        <span style={{
          fontSize: '11px',
          padding: '2px 8px',
          background: `${rarityColors[module.rarity]}30`,
          borderRadius: '4px',
          color: rarityColors[module.rarity]
        }}>
          {rarityNames[module.rarity]}
        </span>
      </div>

      <p style={{ color: '#a1a1aa', fontSize: '13px', margin: '0 0 12px 0' }}>
        {module.description}
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
        {module.effects.map((effect, idx) => (
          <span key={idx} style={{
            fontSize: '11px',
            padding: '4px 8px',
            background: 'rgba(0,0,0,0.3)',
            borderRadius: '4px',
            color: effect.value > 0 ? '#10b981' : '#ef4444'
          }}>
            {getEffectName(effect.type)} {effect.value > 0 ? '+' : ''}{effect.value}
          </span>
        ))}
      </div>

      {!isInstalled && onInstall && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: '12px',
          borderTop: '1px solid rgba(255,255,255,0.1)'
        }}>
          <span style={{ color: canAfford ? '#fbbf24' : '#ef4444', fontSize: '14px', fontWeight: 'bold' }}>
            💳 {module.installCost.credits}
          </span>
          <button
            onClick={onInstall}
            disabled={!canAfford}
            style={{
              padding: '8px 16px',
              background: canAfford
                ? 'linear-gradient(135deg, #0099cc 0%, #00d4ff 100%)'
                : '#4b5563',
              border: 'none',
              borderRadius: '6px',
              color: 'white',
              fontSize: '13px',
              fontWeight: 'bold',
              cursor: canAfford ? 'pointer' : 'not-allowed',
              opacity: canAfford ? 1 : 0.6
            }}
          >
            {canAfford ? '安装' : '信用点不足'}
          </button>
        </div>
      )}
    </div>
  );
}

// 获取效果名称
function getEffectName(type: string): string {
  const names: Record<string, string> = {
    'speed': '速度',
    'defense': '防护',
    'attack': '攻击',
    'energy': '能量',
    'cargoCapacity': '货舱',
    'detection': '探测',
  };
  return names[type] || type;
}
