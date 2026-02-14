import { useState } from 'react';
import { useGameStore } from '../stores/gameStore';
import 基地背景 from '../assets/images/基地背景.jpg';
import { FacilityType } from '../core/BaseFacilitySystem';
import { QUALITY_NAMES } from '../core/MaterialSynthesisSystem';
import { CommEvent, COMM_EVENT_CONFIG, getRemainingTime, formatRemainingTime } from '../core/CommSystem';
import { getItemTemplate } from '../data/items';
import { ResearchStatus, ResearchCategory, RESEARCH_CATEGORY_CONFIG } from '../core/ResearchSystem';
import { MINERAL_CONFIG, MINING_EVENTS, MiningEventType, getMiningProgress, getRemainingTime as getMiningRemainingTime, formatMiningTime, getDepthBonusDescription, getCrewMiningBonus } from '../core/MiningSystem';
import { Chip, ChipSlot, ChipRarity, ChipSet, CHIP_RARITY_CONFIG, CHIP_MAIN_STAT_CONFIG, CHIP_SUB_STAT_CONFIG, CHIP_SET_CONFIG, CHIP_CRAFT_COST, getEnhanceCost, getRerollCost } from '../core/ChipSystem';
import { GeneType, GENE_TYPE_CONFIG, GENE_RARITY_CONFIG } from '../core/GeneSystem';
import { Implant, ImplantType, ImplantRarity, IMPLANT_TYPE_CONFIG, IMPLANT_RARITY_CONFIG, getImplantStats } from '../core/CyberneticSystem';
import { MarketListing, PlayerListing, MarketItemType, MarketRarity, MARKET_ITEM_TYPE_CONFIG, MARKET_RARITY_CONFIG } from '../core/MarketSystem';
import { Ruin, ExploreMission, RuinType, RuinDifficulty, ExploreStatus, RUIN_TYPE_CONFIG, RUIN_DIFFICULTY_CONFIG, getRemainingExploreTime, formatExploreTime, calculateExploreSuccess } from '../core/RuinSystem';
import CrewScreen from './CrewScreen';

interface BaseScreenProps {
  onNavigate: (screen: string, params?: unknown) => void;
  onBack: () => void;
}

// 材料基础名称映射
const MATERIAL_BASE_NAMES: Record<string, string> = {
  'mat_001': '星铁基础构件',
  'mat_002': '星铜传导组件',
  'mat_003': '钛钢外甲坯料',
  'mat_004': '战甲能量晶核',
  'mat_005': '稀土传感基质',
  'mat_006': '虚空防护核心',
  'mat_007': '推进模块燃料',
  'mat_008': '纳米韧化纤维',
  'mat_009': '陨铁缓冲衬垫',
  'mat_010': '量子紧固组件',
};

// 获取材料完整名称
function getMaterialFullName(itemId: string): string {
  // 解析品质后缀
  const qualityOrder = ['_void', '_quantum', '_crystal', '_alloy', '_stardust'] as const;
  let baseId = itemId;
  let quality = '';

  for (const suffix of qualityOrder) {
    if (itemId.endsWith(suffix)) {
      baseId = itemId.replace(suffix, '');
      quality = suffix;
      break;
    }
  }

  const baseName = MATERIAL_BASE_NAMES[baseId] || baseId;

  if (quality) {
    const qualityKey = quality.replace('_', '').toUpperCase() as keyof typeof QUALITY_NAMES;
    const qualityName = QUALITY_NAMES[qualityKey as any] || '';
    return `${baseName}(${qualityName})`;
  }

  return baseName;
}

function getItemName(itemId: string): string {
  const template = getItemTemplate(itemId);
  if (template) {
    return template.name;
  }
  return getMaterialFullName(itemId);
}

// 科幻风格颜色配置
const SCIFI_COLORS = {
  primary: '#00d4ff',
  secondary: '#7c3aed',
  warning: '#f59e0b',
  danger: '#ef4444',
  success: '#22c55e',
  background: 'rgba(0, 20, 40, 0.85)',
  border: 'rgba(0, 212, 255, 0.3)',
};

// 基地功能定义
interface BaseFacility {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  level?: number;
  maxLevel?: number;
  status: 'active' | 'locked' | 'building';
}

// 基地功能列表
const FACILITIES: BaseFacility[] = [
  { id: 'crew', name: '船员舱', icon: '👥', description: '招募与管理船员', color: '#00d4ff', level: 1, maxLevel: 5, status: 'active' },
  { id: 'energy', name: '能源核心', icon: '⚡', description: '升级星舰能源系统', color: '#f59e0b', level: 1, maxLevel: 10, status: 'active' },
  { id: 'warehouse', name: '星际仓库', icon: '📦', description: '扩展存储容量', color: '#10b981', level: 1, maxLevel: 10, status: 'active' },
  { id: 'medical', name: '医疗舱', icon: '🏥', description: '提升恢复效率', color: '#ef4444', level: 1, maxLevel: 5, status: 'active' },
  { id: 'comm', name: '通讯阵列', icon: '📡', description: '接收特殊事件', color: '#8b5cf6', level: 1, maxLevel: 3, status: 'active' },
  { id: 'research', name: '科研实验室', icon: '🔬', description: '解锁新配方', color: '#c084fc', level: 1, maxLevel: 5, status: 'active' },
  // 扩展功能
  { id: 'mining', name: '采矿平台', icon: '⛏️', description: '自动采集矿物资源', color: '#f59e0b', level: 1, maxLevel: 5, status: 'active' },
  { id: 'chip', name: '芯片研发', icon: '💾', description: '研发战斗芯片', color: '#00d4ff', level: 1, maxLevel: 5, status: 'active' },
  { id: 'alliance', name: '基因工程', icon: '🧬', description: '基因改造与强化', color: '#22c55e', level: 1, maxLevel: 5, status: 'active' },
  { id: 'arena', name: '机械飞升', icon: '🦾', description: '机械义体改造', color: '#a855f7', level: 1, maxLevel: 5, status: 'active' },
  { id: 'market', name: '星际市场', icon: '🏪', description: '玩家间交易', color: '#ec4899', level: 1, maxLevel: 3, status: 'active' },
  { id: 'relic', name: '遗迹探索', icon: '🏛️', description: '探索古代遗迹', color: '#f97316', level: 1, maxLevel: 5, status: 'active' },
];

export default function BaseScreen({ onNavigate, onBack }: BaseScreenProps) {
  const [selectedFacility, setSelectedFacility] = useState<BaseFacility | null>(null);
  const [showCrewScreen, setShowCrewScreen] = useState(false);
  const { gameManager } = useGameStore();

  const handleFacilityClick = (facility: BaseFacility) => {
    if (facility.id === 'crew') {
      setShowCrewScreen(true);
    } else {
      setSelectedFacility(facility);
    }
  };

  if (showCrewScreen) {
    return <CrewScreen onBack={() => setShowCrewScreen(false)} />;
  }

  return (
    <div style={{
      height: '100vh',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* 背景 */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `url(${基地背景})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        zIndex: 0,
      }} />

      {/* 扫描线效果 */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(180deg, transparent 0%, rgba(0, 212, 255, 0.03) 50%, transparent 100%)',
        backgroundSize: '100% 4px',
        animation: 'scanline 8s linear infinite',
        pointerEvents: 'none',
        zIndex: 1,
      }} />

      {/* 顶部标题栏 - 玻璃拟态 */}
      <BaseHeader onBack={onBack} />

      {/* 基地概览 - 玻璃拟态 */}
      <BaseOverview />

      {/* 功能网格 */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        position: 'relative',
        zIndex: 10,
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px',
        }}>
          {FACILITIES.map(facility => (
            <FacilityCard
              key={facility.id}
              facility={facility}
              onClick={() => handleFacilityClick(facility)}
            />
          ))}
        </div>
      </div>

      {/* 功能详情弹窗 */}
      {selectedFacility && (
        <FacilityDetailModal
          facility={selectedFacility}
          onClose={() => setSelectedFacility(null)}
        />
      )}

      {/* CSS 动画 */}
      <style>{`
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
      `}</style>
    </div>
  );
}

// 顶部标题栏 - 科幻风格
function BaseHeader({ onBack }: { onBack: () => void }) {
  return (
    <div style={{
      flexShrink: 0,
      position: 'relative',
      zIndex: 10,
      background: 'rgba(0, 20, 40, 0.85)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(0, 212, 255, 0.3)',
      padding: '12px 16px',
      boxShadow: '0 0 20px rgba(0, 212, 255, 0.1)',
    }}>
      {/* 顶部发光条 */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '2px',
        background: 'linear-gradient(90deg, transparent 0%, #00d4ff 50%, transparent 100%)',
        boxShadow: '0 0 10px #00d4ff',
      }} />

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <button
          onClick={onBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(0, 212, 255, 0.1)',
            border: '1px solid rgba(0, 212, 255, 0.3)',
            borderRadius: '8px',
            padding: '8px 12px',
            color: '#00d4ff',
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(0, 212, 255, 0.2)';
            e.currentTarget.style.boxShadow = '0 0 10px rgba(0, 212, 255, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(0, 212, 255, 0.1)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <span>◀</span>
          <span>返回舰桥</span>
        </button>

        <h1 style={{
          color: '#00d4ff',
          fontSize: '18px',
          fontWeight: 'bold',
          textShadow: '0 0 10px rgba(0, 212, 255, 0.5)',
        }}>
          ⚡ 星际基地
        </h1>

        <div style={{ width: '90px' }} />
      </div>
    </div>
  );
}

// 基地概览 - 科幻风格
function BaseOverview() {
  const { getEnergyCoreEfficiency } = useGameStore();

  const activeFacilities = FACILITIES.filter(f => f.status === 'active').length;
  const totalFacilities = FACILITIES.length;
  const baseLevel = 1;
  const energyEfficiency = getEnergyCoreEfficiency();

  return (
    <div style={{
      flexShrink: 0,
      position: 'relative',
      zIndex: 10,
      background: 'rgba(0, 10, 30, 0.8)',
      backdropFilter: 'blur(8px)',
      borderBottom: '1px solid rgba(0, 212, 255, 0.2)',
      padding: '16px',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
      }}>
        <OverviewItem label="基地等级" value={`Lv.${baseLevel}`} color="#00d4ff" icon="🏢" />
        <OverviewItem label="设施数量" value={`${activeFacilities}/${totalFacilities}`} color="#10b981" icon="🔧" />
        <OverviewItem label="采集效率" value={`+${energyEfficiency}%`} color="#f59e0b" icon="⚡" />
      </div>
    </div>
  );
}

function OverviewItem({ label, value, color, icon }: { label: string; value: string; color: string; icon: string }) {
  return (
    <div style={{
      textAlign: 'center',
      background: 'rgba(0, 0, 0, 0.4)',
      padding: '10px 16px',
      borderRadius: '12px',
      border: `1px solid ${color}30`,
      minWidth: '90px',
    }}>
      <div style={{ fontSize: '16px', marginBottom: '4px' }}>{icon}</div>
      <div style={{
        color: color,
        fontSize: '18px',
        fontWeight: 'bold',
        textShadow: `0 0 10px ${color}50`,
      }}>
        {value}
      </div>
      <div style={{
        color: '#a1a1aa',
        fontSize: '10px',
        marginTop: '2px',
      }}>
        {label}
      </div>
    </div>
  );
}

// 设施卡片 - 科幻风格
function FacilityCard({ facility, onClick }: { facility: BaseFacility; onClick: () => void }) {
  const { getFacilityLevel, gameManager } = useGameStore();
  const isLocked = facility.status === 'locked';
  const isBuilding = facility.status === 'building';

  const facilityTypeMap: Record<string, FacilityType> = {
    'energy': FacilityType.ENERGY,
    'warehouse': FacilityType.WAREHOUSE,
    'medical': FacilityType.MEDICAL,
  };

  const actualLevel = facilityTypeMap[facility.id]
    ? getFacilityLevel(facilityTypeMap[facility.id])
    : (facility.level || 1);
  const maxLevel = facility.maxLevel || 10;

  return (
    <button
      onClick={onClick}
      disabled={isLocked}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px 8px',
        background: isLocked
          ? 'linear-gradient(135deg, rgba(30, 30, 40, 0.9) 0%, rgba(20, 20, 30, 0.95) 100%)'
          : 'rgba(0, 20, 40, 0.7)',
        border: `2px solid ${isLocked ? 'rgba(100, 100, 110, 0.5)' : facility.color + '60'}`,
        borderRadius: '12px',
        cursor: isLocked ? 'not-allowed' : 'pointer',
        opacity: isLocked ? 0.75 : 1,
        position: 'relative',
        minHeight: '100px',
        boxShadow: isLocked ? 'inset 0 0 20px rgba(0, 0, 0, 0.5)' : `0 0 15px ${facility.color}20`,
        transition: 'all 0.3s ease',
      }}
      onMouseEnter={(e) => {
        if (!isLocked) {
          e.currentTarget.style.boxShadow = `0 0 25px ${facility.color}40`;
          e.currentTarget.style.transform = 'translateY(-2px)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = isLocked ? 'inset 0 0 20px rgba(0, 0, 0, 0.5)' : `0 0 15px ${facility.color}20`;
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* 未解锁遮罩层 */}
      {isLocked && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(100, 100, 100, 0.05) 8px, rgba(100, 100, 100, 0.05) 16px)',
          borderRadius: '10px',
          pointerEvents: 'none',
        }} />
      )}

      {/* 状态图标 */}
      {isLocked && (
        <div style={{
          position: 'absolute',
          top: '6px',
          right: '6px',
          fontSize: '16px',
          filter: 'drop-shadow(0 0 4px rgba(0, 0, 0, 0.8))',
          zIndex: 2,
        }}>
          🔒
        </div>
      )}
      {isBuilding && (
        <div style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          fontSize: '14px',
        }}>
          🏗️
        </div>
      )}

      {/* 未解锁标签 */}
      {isLocked && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(0, 0, 0, 0.7)',
          border: '1px solid rgba(150, 150, 150, 0.4)',
          borderRadius: '4px',
          padding: '2px 8px',
          fontSize: '10px',
          color: '#888',
          fontWeight: 'bold',
          letterSpacing: '1px',
          zIndex: 2,
        }}>
          未解锁
        </div>
      )}

      {/* 图标 */}
      <div style={{
        fontSize: '32px',
        marginBottom: '8px',
        filter: isLocked ? 'grayscale(100%) brightness(0.5)' : 'none',
        textShadow: isLocked ? 'none' : `0 0 10px ${facility.color}50`,
        opacity: isLocked ? 0.4 : 1,
      }}>
        {facility.icon}
      </div>

      {/* 名称 */}
      <div style={{
        color: isLocked ? '#555' : facility.color,
        fontSize: '13px',
        fontWeight: 'bold',
        textAlign: 'center',
        textShadow: isLocked ? 'none' : `0 0 5px ${facility.color}30`,
      }}>
        {facility.name}
      </div>

      {/* 等级 */}
      {!isLocked && (
        <div style={{
          color: '#a1a1aa',
          fontSize: '10px',
          marginTop: '4px',
          background: 'rgba(0, 0, 0, 0.4)',
          padding: '2px 6px',
          borderRadius: '4px',
        }}>
          Lv.{actualLevel}/{maxLevel}
        </div>
      )}

      {/* 描述 */}
      <div style={{
        color: isLocked ? '#444' : '#71717a',
        fontSize: '9px',
        textAlign: 'center',
        marginTop: '4px',
        lineHeight: '1.2',
      }}>
        {facility.description}
      </div>
    </button>
  );
}

// 设施详情弹窗 - 科幻风格
function FacilityDetailModal({ facility, onClose }: { facility: BaseFacility; onClose: () => void }) {
  const { gameManager } = useGameStore();

  const renderFacilityContent = () => {
    switch (facility.id) {
      case 'energy':
        return <EnergyContent />;
      case 'warehouse':
        return <WarehouseContent />;
      case 'medical':
        return <MedicalContent />;
      case 'comm':
        return <CommContent />;
      case 'research':
        return <ResearchContent />;
      case 'mining':
        return <MiningContent />;
      case 'chip':
        return <ChipContent />;
      case 'alliance':
        return <GeneContent />;
      case 'arena':
        return <CyberneticContent />;
      case 'market':
        return <MarketContent />;
      case 'ruins':
        return <RuinsContent />;
      default:
        return <LockedContent facility={facility} />;
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(4px)',
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
    }}>
      <div style={{
        background: 'rgba(0, 20, 40, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '400px',
        maxHeight: '80vh',
        overflowY: 'auto',
        border: `2px solid ${facility.color}`,
        boxShadow: `0 0 40px ${facility.color}40, inset 0 0 40px ${facility.color}10`,
      }}>
        {/* 头部 */}
        <div style={{
          background: `linear-gradient(180deg, ${facility.color}30, ${facility.color}10)`,
          padding: '16px',
          borderBottom: `1px solid ${facility.color}50`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{
              fontSize: '28px',
              textShadow: `0 0 10px ${facility.color}`,
            }}>{facility.icon}</span>
            <div>
              <h2 style={{
                color: facility.color,
                fontSize: '18px',
                fontWeight: 'bold',
                margin: 0,
                textShadow: `0 0 10px ${facility.color}50`,
              }}>
                {facility.name}
              </h2>
              {facility.level && (
                <span style={{ color: '#a1a1aa', fontSize: '12px' }}>
                  等级 {facility.level}/{facility.maxLevel}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              color: '#a1a1aa',
              fontSize: '20px',
              cursor: 'pointer',
              padding: '4px 10px',
            }}
          >
            ✕
          </button>
        </div>

        {/* 内容 */}
        <div style={{ padding: '16px' }}>
          {renderFacilityContent()}
        </div>
      </div>
    </div>
  );
}

// ==================== 各设施内容组件 ====================

// 1. 船员舱内容
function CrewContent() {
  const crewMembers = [
    { id: 'crew_001', name: '艾莉娅', role: '工程师', level: 1, bonus: '采集效率+5%', icon: '👩‍🔧' },
    { id: 'crew_002', name: '凯尔', role: '战斗员', level: 1, bonus: '战斗经验+5%', icon: '👨‍✈️' },
  ];

  return (
    <div>
      <p style={{ color: '#a1a1aa', fontSize: '14px', marginBottom: '16px' }}>
        当前船员: <span style={{ color: '#00d4ff', fontWeight: 'bold' }}>{crewMembers.length}/5</span>
      </p>

      {crewMembers.map(crew => (
        <div key={crew.id} style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px',
          background: 'rgba(0, 212, 255, 0.1)',
          borderRadius: '12px',
          marginBottom: '8px',
          border: '1px solid rgba(0, 212, 255, 0.2)',
        }}>
          <div style={{ fontSize: '28px' }}>{crew.icon}</div>
          <div style={{ flex: 1 }}>
            <div style={{ color: '#ffffff', fontWeight: 'bold' }}>{crew.name}</div>
            <div style={{ color: '#00d4ff', fontSize: '12px' }}>{crew.role} Lv.{crew.level}</div>
            <div style={{ color: '#f59e0b', fontSize: '11px' }}>{crew.bonus}</div>
          </div>
        </div>
      ))}

      <button style={{
        width: '100%',
        padding: '12px',
        background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.3), rgba(0, 212, 255, 0.1))',
        border: '1px solid rgba(0, 212, 255, 0.5)',
        borderRadius: '8px',
        color: '#00d4ff',
        fontWeight: 'bold',
        cursor: 'pointer',
        marginTop: '8px',
        boxShadow: '0 0 15px rgba(0, 212, 255, 0.2)',
      }}>
        ➕ 招募新船员 (500信用点)
      </button>
    </div>
  );
}

// 2. 能源核心内容
function EnergyContent() {
  const { upgradeFacility, getFacilityLevel, getEnergyCoreEfficiency, getFacilityUpgradePreview, getFacilityDefinition, gameManager } = useGameStore();
  const [upgradeResult, setUpgradeResult] = useState<{ success: boolean; message: string } | null>(null);

  const level = getFacilityLevel(FacilityType.ENERGY);
  const efficiency = getEnergyCoreEfficiency();
  const preview = getFacilityUpgradePreview(FacilityType.ENERGY);
  const def = getFacilityDefinition(FacilityType.ENERGY);

  const handleUpgrade = () => {
    const result = upgradeFacility(FacilityType.ENERGY);
    setUpgradeResult(result);
    if (result.success) {
      setTimeout(() => setUpgradeResult(null), 2000);
    }
  };

  const formatCost = (cost: { credits: number; materials: { itemId: string; count: number }[] }) => {
    const parts: string[] = [];
    if (cost.credits > 0) {
      parts.push(`${cost.credits}信用点`);
    }
    cost.materials.forEach(mat => {
      const item = gameManager.inventory.getItem(mat.itemId);
      const materialName = item?.name || getMaterialFullName(mat.itemId);
      parts.push(`${materialName} x${mat.count}`);
    });
    return parts.join(' + ');
  };

  return (
    <div>
      <div style={{
        background: 'rgba(0, 0, 0, 0.4)',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '16px',
        textAlign: 'center',
        border: '1px solid rgba(245, 158, 11, 0.3)',
      }}>
        <div style={{ fontSize: '48px', marginBottom: '8px', textShadow: '0 0 20px rgba(245, 158, 11, 0.5)' }}>⚡</div>
        <div style={{ color: '#f59e0b', fontWeight: 'bold', fontSize: '20px', textShadow: '0 0 10px rgba(245, 158, 11, 0.3)' }}>
          能源核心 Lv.{level}
        </div>
        <div style={{ color: '#a1a1aa', fontSize: '14px', marginTop: '8px' }}>
          自动采集效率 +{efficiency}%
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ color: '#a1a1aa', fontSize: '12px' }}>升级进度</span>
          <span style={{ color: '#f59e0b', fontSize: '12px' }}>{level}/{def?.maxLevel || 10}</span>
        </div>
        <div style={{
          height: '8px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '4px',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${(level / (def?.maxLevel || 10)) * 100}%`,
            background: 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)',
            borderRadius: '4px',
            boxShadow: '0 0 10px #f59e0b',
          }} />
        </div>
      </div>

      {preview.nextLevel && preview.cost && (
        <div style={{
          background: 'rgba(245, 158, 11, 0.1)',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '12px',
          border: '1px solid rgba(245, 158, 11, 0.2)',
        }}>
          <div style={{ color: '#f59e0b', fontSize: '12px', marginBottom: '4px' }}>
            下一级效果: {preview.effect?.description} +{preview.effect?.value}%
          </div>
          <div style={{ color: '#a1a1aa', fontSize: '11px' }}>
            升级消耗: {formatCost(preview.cost)}
          </div>
        </div>
      )}

      {upgradeResult && (
        <div style={{
          padding: '8px 12px',
          borderRadius: '8px',
          marginBottom: '12px',
          textAlign: 'center',
          background: upgradeResult.success ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
          border: `1px solid ${upgradeResult.success ? 'rgba(34, 197, 94, 0.5)' : 'rgba(239, 68, 68, 0.5)'}`,
          color: upgradeResult.success ? '#22c55e' : '#ef4444',
          fontSize: '13px',
        }}>
          {upgradeResult.message}
        </div>
      )}

      <button
        onClick={handleUpgrade}
        disabled={!preview.canUpgrade}
        style={{
          width: '100%',
          padding: '12px',
          background: preview.canUpgrade
            ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.3), rgba(245, 158, 11, 0.1))'
            : 'rgba(100, 100, 100, 0.3)',
          border: preview.canUpgrade ? '1px solid rgba(245, 158, 11, 0.5)' : '1px solid rgba(100, 100, 100, 0.5)',
          borderRadius: '8px',
          color: preview.canUpgrade ? '#f59e0b' : '#666',
          fontWeight: 'bold',
          cursor: preview.canUpgrade ? 'pointer' : 'not-allowed',
          boxShadow: preview.canUpgrade ? '0 0 15px rgba(245, 158, 11, 0.2)' : 'none',
        }}
      >
        {preview.canUpgrade
          ? `⬆️ 升级 (${preview.cost ? formatCost(preview.cost) : ''})`
          : preview.reason || '已达最高等级'}
      </button>
    </div>
  );
}

// 3. 星际仓库内容
function WarehouseContent() {
  const { upgradeFacility, getFacilityLevel, getWarehouseCapacity, getFacilityUpgradePreview, getFacilityDefinition, gameManager } = useGameStore();
  const [upgradeResult, setUpgradeResult] = useState<{ success: boolean; message: string } | null>(null);

  const level = getFacilityLevel(FacilityType.WAREHOUSE);
  const maxCapacity = getWarehouseCapacity();
  const usedSlots = gameManager.inventory.getUsedSlots();
  const preview = getFacilityUpgradePreview(FacilityType.WAREHOUSE);
  const def = getFacilityDefinition(FacilityType.WAREHOUSE);

  const handleUpgrade = () => {
    const result = upgradeFacility(FacilityType.WAREHOUSE);
    setUpgradeResult(result);
    if (result.success) {
      setTimeout(() => setUpgradeResult(null), 2000);
    }
  };

  const formatCost = (cost: { credits: number; materials: { itemId: string; count: number }[] }) => {
    const parts: string[] = [];
    if (cost.credits > 0) {
      parts.push(`${cost.credits}信用点`);
    }
    cost.materials.forEach(mat => {
      const item = gameManager.inventory.getItem(mat.itemId);
      const materialName = item?.name || getMaterialFullName(mat.itemId);
      parts.push(`${materialName} x${mat.count}`);
    });
    return parts.join(' + ');
  };

  const usagePercent = Math.round((usedSlots / maxCapacity) * 100);

  return (
    <div>
      <div style={{
        background: 'rgba(0, 0, 0, 0.4)',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '16px',
        textAlign: 'center',
        border: '1px solid rgba(16, 185, 129, 0.3)',
      }}>
        <div style={{ fontSize: '48px', marginBottom: '8px', textShadow: '0 0 20px rgba(16, 185, 129, 0.5)' }}>📦</div>
        <div style={{ color: '#10b981', fontWeight: 'bold', fontSize: '20px', textShadow: '0 0 10px rgba(16, 185, 129, 0.3)' }}>
          星际仓库 Lv.{level}
        </div>
        <div style={{ color: '#a1a1aa', fontSize: '14px', marginTop: '8px' }}>
          存储容量: {usedSlots}/{maxCapacity} 格
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ color: '#a1a1aa', fontSize: '12px' }}>已使用</span>
          <span style={{ color: usagePercent > 80 ? '#ef4444' : '#10b981', fontSize: '12px' }}>{usagePercent}%</span>
        </div>
        <div style={{
          height: '8px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '4px',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${usagePercent}%`,
            background: usagePercent > 80
              ? 'linear-gradient(90deg, #ef4444 0%, #f87171 100%)'
              : 'linear-gradient(90deg, #10b981 0%, #34d399 100%)',
            borderRadius: '4px',
            boxShadow: usagePercent > 80 ? '0 0 10px #ef4444' : '0 0 10px #10b981',
          }} />
        </div>
      </div>

      {preview.nextLevel && preview.cost && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.1)',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '12px',
          border: '1px solid rgba(16, 185, 129, 0.2)',
        }}>
          <div style={{ color: '#10b981', fontSize: '12px', marginBottom: '4px' }}>
            下一级容量: {preview.effect?.value} 格
          </div>
          <div style={{ color: '#a1a1aa', fontSize: '11px' }}>
            升级消耗: {formatCost(preview.cost)}
          </div>
        </div>
      )}

      {upgradeResult && (
        <div style={{
          padding: '8px 12px',
          borderRadius: '8px',
          marginBottom: '12px',
          textAlign: 'center',
          background: upgradeResult.success ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
          border: `1px solid ${upgradeResult.success ? 'rgba(34, 197, 94, 0.5)' : 'rgba(239, 68, 68, 0.5)'}`,
          color: upgradeResult.success ? '#22c55e' : '#ef4444',
          fontSize: '13px',
        }}>
          {upgradeResult.message}
        </div>
      )}

      <button
        onClick={handleUpgrade}
        disabled={!preview.canUpgrade}
        style={{
          width: '100%',
          padding: '12px',
          background: preview.canUpgrade
            ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.3), rgba(16, 185, 129, 0.1))'
            : 'rgba(100, 100, 100, 0.3)',
          border: preview.canUpgrade ? '1px solid rgba(16, 185, 129, 0.5)' : '1px solid rgba(100, 100, 100, 0.5)',
          borderRadius: '8px',
          color: preview.canUpgrade ? '#10b981' : '#666',
          fontWeight: 'bold',
          cursor: preview.canUpgrade ? 'pointer' : 'not-allowed',
          boxShadow: preview.canUpgrade ? '0 0 15px rgba(16, 185, 129, 0.2)' : 'none',
        }}
      >
        {preview.canUpgrade
          ? `⬆️ 升级 (${preview.cost ? formatCost(preview.cost) : ''})`
          : preview.reason || '已达最高等级'}
      </button>
    </div>
  );
}

// 4. 医疗舱内容
function MedicalContent() {
  const { upgradeFacility, getFacilityLevel, getMedicalEfficiency, getFacilityUpgradePreview, getFacilityDefinition, gameManager } = useGameStore();
  const [upgradeResult, setUpgradeResult] = useState<{ success: boolean; message: string } | null>(null);

  const level = getFacilityLevel(FacilityType.MEDICAL);
  const efficiency = getMedicalEfficiency();
  const preview = getFacilityUpgradePreview(FacilityType.MEDICAL);
  const def = getFacilityDefinition(FacilityType.MEDICAL);

  const handleUpgrade = () => {
    const result = upgradeFacility(FacilityType.MEDICAL);
    setUpgradeResult(result);
    if (result.success) {
      setTimeout(() => setUpgradeResult(null), 2000);
    }
  };

  const formatCost = (cost: { credits: number; materials: { itemId: string; count: number }[] }) => {
    const parts: string[] = [];
    if (cost.credits > 0) {
      parts.push(`${cost.credits}信用点`);
    }
    cost.materials.forEach(mat => {
      const item = gameManager.inventory.getItem(mat.itemId);
      const materialName = item?.name || getMaterialFullName(mat.itemId);
      parts.push(`${materialName} x${mat.count}`);
    });
    return parts.join(' + ');
  };

  return (
    <div>
      <div style={{
        background: 'rgba(0, 0, 0, 0.4)',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '16px',
        textAlign: 'center',
        border: '1px solid rgba(239, 68, 68, 0.3)',
      }}>
        <div style={{ fontSize: '48px', marginBottom: '8px', textShadow: '0 0 20px rgba(239, 68, 68, 0.5)' }}>🏥</div>
        <div style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '20px', textShadow: '0 0 10px rgba(239, 68, 68, 0.3)' }}>
          医疗舱 Lv.{level}
        </div>
        <div style={{ color: '#a1a1aa', fontSize: '14px', marginTop: '8px' }}>
          恢复效率加成 +{efficiency.bonusPercent}%
        </div>
      </div>

      <div style={{
        background: 'rgba(0, 0, 0, 0.3)',
        borderRadius: '12px',
        padding: '12px',
        marginBottom: '16px',
        border: '1px solid rgba(239, 68, 68, 0.2)',
      }}>
        <div style={{ color: '#a1a1aa', fontSize: '12px', marginBottom: '8px' }}>当前效果:</div>
        <div style={{ color: '#ffffff', fontSize: '13px', lineHeight: '1.8' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span>❤️ 休整恢复生命:</span>
            <span style={{ color: '#ef4444' }}>
              {efficiency.hpRecoveryBase} → {efficiency.hpRecoveryActual} 点
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span>⚡ 休整恢复体力:</span>
            <span style={{ color: '#f59e0b' }}>
              {efficiency.staminaRecoveryBase} → {efficiency.staminaRecoveryActual} 点
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>🔄 体力自然恢复:</span>
            <span style={{ color: '#22c55e' }}>
              {efficiency.staminaRegenBase} → {efficiency.staminaRegenActual} 点/分钟
            </span>
          </div>
        </div>
      </div>

      {preview.nextLevel && preview.cost && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '12px',
          border: '1px solid rgba(239, 68, 68, 0.2)',
        }}>
          <div style={{ color: '#ef4444', fontSize: '12px', marginBottom: '4px' }}>
            下一级加成: +{preview.effect?.value}%
          </div>
          <div style={{ color: '#a1a1aa', fontSize: '11px' }}>
            升级消耗: {formatCost(preview.cost)}
          </div>
        </div>
      )}

      {upgradeResult && (
        <div style={{
          padding: '8px 12px',
          borderRadius: '8px',
          marginBottom: '12px',
          textAlign: 'center',
          background: upgradeResult.success ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
          border: `1px solid ${upgradeResult.success ? 'rgba(34, 197, 94, 0.5)' : 'rgba(239, 68, 68, 0.5)'}`,
          color: upgradeResult.success ? '#22c55e' : '#ef4444',
          fontSize: '13px',
        }}>
          {upgradeResult.message}
        </div>
      )}

      <button
        onClick={handleUpgrade}
        disabled={!preview.canUpgrade}
        style={{
          width: '100%',
          padding: '12px',
          background: preview.canUpgrade
            ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.3), rgba(239, 68, 68, 0.1))'
            : 'rgba(100, 100, 100, 0.3)',
          border: preview.canUpgrade ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid rgba(100, 100, 100, 0.5)',
          borderRadius: '8px',
          color: preview.canUpgrade ? '#ef4444' : '#666',
          fontWeight: 'bold',
          cursor: preview.canUpgrade ? 'pointer' : 'not-allowed',
          boxShadow: preview.canUpgrade ? '0 0 15px rgba(239, 68, 68, 0.2)' : 'none',
        }}
      >
        {preview.canUpgrade
          ? `⬆️ 升级 (${preview.cost ? formatCost(preview.cost) : ''})`
          : preview.reason || '已达最高等级'}
      </button>
    </div>
  );
}

// 5. 通讯阵列内容
function CommContent() {
  const { gameManager, saveGame, scanCommSignals, respondToCommEvent, ignoreCommEvent, getCommScanCooldown } = useGameStore();
  const [refreshKey, setRefreshKey] = useState(0);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CommEvent | null>(null);

  const events = gameManager.getCommEvents();
  const level = gameManager.getFacilityLevel(FacilityType.COMM);
  const cooldown = getCommScanCooldown();

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 2000);
  };

  const handleScan = async () => {
    const result = scanCommSignals();
    if (result.success) {
      showMessage(result.message, 'success');
      setRefreshKey(k => k + 1);
      await saveGame();
    } else {
      showMessage(result.message, 'error');
    }
  };

  const handleRespond = async (eventId: string) => {
    const result = respondToCommEvent(eventId);
    if (result.success) {
      showMessage(`${result.message}${result.rewards ? `，获得: ${result.rewards}` : ''}`, 'success');
      setRefreshKey(k => k + 1);
      setSelectedEvent(null);
      await saveGame();
    } else {
      showMessage(result.message, 'error');
    }
  };

  const handleIgnore = async (eventId: string) => {
    const result = ignoreCommEvent(eventId);
    if (result.success) {
      showMessage(result.message, 'success');
      setRefreshKey(k => k + 1);
      setSelectedEvent(null);
      await saveGame();
    } else {
      showMessage(result.message, 'error');
    }
  };

  const formatCooldown = (ms: number): string => {
    const minutes = Math.ceil(ms / 60000);
    if (minutes > 0) {
      return `${minutes}分钟`;
    }
    return '可用';
  };

  return (
    <div>
      {/* Message Toast */}
      {message && (
        <div style={{
          position: 'absolute',
          top: '-40px',
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '8px 16px',
          borderRadius: '8px',
          background: message.type === 'success' ? 'rgba(34, 197, 94, 0.9)' : 'rgba(239, 68, 68, 0.9)',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: '12px',
          zIndex: 100,
          whiteSpace: 'nowrap',
        }}>
          {message.text}
        </div>
      )}

      {/* Stats */}
      <div style={{
        background: 'rgba(139, 92, 246, 0.1)',
        borderRadius: '8px',
        padding: '12px',
        marginBottom: '12px',
        border: '1px solid rgba(139, 92, 246, 0.2)',
      }}>
        <div style={{ color: '#a1a1aa', fontSize: '12px', marginBottom: '8px' }}>当前状态:</div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <span style={{ color: '#8b5cf6', fontWeight: 'bold' }}>{events.length}</span>
            <span style={{ color: '#a1a1aa' }}> 个信号</span>
          </div>
          <div>
            <span style={{ color: '#a1a1aa' }}>扫描冷却: </span>
            <span style={{ color: cooldown > 0 ? '#f59e0b' : '#10b981' }}>
              {formatCooldown(cooldown)}
            </span>
          </div>
        </div>
      </div>

      {/* Event List */}
      {events.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '30px 20px',
          color: '#666',
        }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>📡</div>
          <div>暂无信号</div>
          <div style={{ fontSize: '12px', marginTop: '4px' }}>点击下方按钮扫描新信号</div>
        </div>
      ) : (
        <div style={{ marginBottom: '12px' }}>
          {events.map(event => {
            const eventConfig = COMM_EVENT_CONFIG[event.type];
            const remaining = getRemainingTime(event);
            const isSelected = selectedEvent?.id === event.id;

            return (
              <div
                key={event.id}
                onClick={() => setSelectedEvent(isSelected ? null : event)}
                style={{
                  padding: '12px',
                  background: isSelected ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.1)',
                  borderRadius: '12px',
                  marginBottom: '8px',
                  border: `1px solid ${isSelected ? 'rgba(139, 92, 246, 0.6)' : 'rgba(139, 92, 246, 0.3)'}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '16px' }}>{eventConfig.icon}</span>
                    <span style={{ color: eventConfig.color, fontWeight: 'bold' }}>{event.title}</span>
                  </div>
                  <span style={{ color: remaining < 600000 ? '#ef4444' : '#f59e0b', fontSize: '11px' }}>
                    ⏱️ {formatRemainingTime(remaining)}
                  </span>
                </div>
                <div style={{ color: '#a1a1aa', fontSize: '12px', marginBottom: '4px' }}>{event.description}</div>

                {isSelected && (
                  <div style={{ marginTop: '12px' }}>
                    {/* Rewards Preview */}
                    <div style={{
                      background: 'rgba(0, 0, 0, 0.3)',
                      borderRadius: '8px',
                      padding: '8px',
                      marginBottom: '8px',
                    }}>
                      <div style={{ color: '#10b981', fontSize: '11px', marginBottom: '4px' }}>🎁 奖励:</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', fontSize: '11px' }}>
                        {event.rewards.credits && (
                          <span style={{ color: '#fbbf24' }}>💰 {event.rewards.credits}信用点</span>
                        )}
                        {event.rewards.items?.map((item, i) => (
                          <span key={i} style={{ color: '#60a5fa' }}>{getItemName(item.itemId)} x{item.count}</span>
                        ))}
                        {event.rewards.exp && (
                          <span style={{ color: '#22c55e' }}>✨ {event.rewards.exp}经验</span>
                        )}
                      </div>
                      {event.requirements?.stamina && (
                        <div style={{ color: '#f59e0b', fontSize: '11px', marginTop: '4px' }}>
                          ⚡ 消耗: {event.requirements.stamina}体力
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleRespond(event.id); }}
                        style={{
                          flex: 1,
                          padding: '10px',
                          background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                          border: 'none',
                          borderRadius: '8px',
                          color: '#fff',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          fontSize: '12px',
                        }}
                      >
                        响应
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleIgnore(event.id); }}
                        style={{
                          flex: 1,
                          padding: '10px',
                          background: 'rgba(100, 100, 100, 0.3)',
                          border: '1px solid rgba(100, 100, 100, 0.5)',
                          borderRadius: '8px',
                          color: '#a1a1aa',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          fontSize: '12px',
                        }}
                      >
                        忽略
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Scan Button */}
      <button
        onClick={handleScan}
        disabled={cooldown > 0}
        style={{
          width: '100%',
          padding: '12px',
          background: cooldown > 0
            ? 'rgba(100, 100, 100, 0.3)'
            : 'linear-gradient(135deg, rgba(139, 92, 246, 0.5), rgba(139, 92, 246, 0.2))',
          border: cooldown > 0
            ? '1px solid rgba(100, 100, 100, 0.5)'
            : '1px solid rgba(139, 92, 246, 0.5)',
          borderRadius: '8px',
          color: cooldown > 0 ? '#666' : '#8b5cf6',
          fontWeight: 'bold',
          cursor: cooldown > 0 ? 'not-allowed' : 'pointer',
          boxShadow: cooldown > 0 ? 'none' : '0 0 15px rgba(139, 92, 246, 0.2)',
        }}
      >
        {cooldown > 0 ? `🔄 冷却中 (${formatCooldown(cooldown)})` : '🔄 扫描新信号'}
      </button>
    </div>
  );
}

// 6. 科研实验室内容
function ResearchContent() {
  const { gameManager, saveGame, startResearch, cancelResearch } = useGameStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const projects = gameManager.getResearchProjects();
  const activeResearch = gameManager.getActiveResearch();
  const level = gameManager.getFacilityLevel(FacilityType.RESEARCH);
  const maxConcurrent = 1 + Math.floor(level / 2);

  const categories = [
    { id: 'all', name: '全部', icon: '📋' },
    { id: ResearchCategory.COMBAT, name: '战斗', icon: '⚔️' },
    { id: ResearchCategory.SURVIVAL, name: '生存', icon: '🛡️' },
    { id: ResearchCategory.PRODUCTION, name: '生产', icon: '🏭' },
    { id: ResearchCategory.SPECIAL, name: '特殊', icon: '✨' },
  ];

  const filteredProjects = selectedCategory === 'all'
    ? projects
    : projects.filter(p => p.category === selectedCategory);

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 2000);
  };

  const handleStartResearch = async (projectId: string) => {
    const result = startResearch(projectId);
    if (result.success) {
      showMessage(result.message, 'success');
      await saveGame();
    } else {
      showMessage(result.message, 'error');
    }
  };

  const handleCancelResearch = async (projectId: string) => {
    const result = cancelResearch(projectId);
    if (result.success) {
      showMessage(result.message, 'success');
      await saveGame();
    } else {
      showMessage(result.message, 'error');
    }
  };

  const getStatusColor = (status: ResearchStatus) => {
    switch (status) {
      case ResearchStatus.COMPLETED: return '#10b981';
      case ResearchStatus.IN_PROGRESS: return '#f59e0b';
      case ResearchStatus.AVAILABLE: return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status: ResearchStatus) => {
    switch (status) {
      case ResearchStatus.COMPLETED: return '✅ 已完成';
      case ResearchStatus.IN_PROGRESS: return '🔬 研究中';
      case ResearchStatus.AVAILABLE: return '🔓 可研究';
      default: return '🔒 未解锁';
    }
  };

  return (
    <div>
      {/* Message Toast */}
      {message && (
        <div style={{
          position: 'absolute',
          top: '-40px',
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '8px 16px',
          borderRadius: '8px',
          background: message.type === 'success' ? 'rgba(34, 197, 94, 0.9)' : 'rgba(239, 68, 68, 0.9)',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: '12px',
          zIndex: 100,
          whiteSpace: 'nowrap',
        }}>
          {message.text}
        </div>
      )}

      {/* Stats */}
      <div style={{
        background: 'rgba(192, 132, 252, 0.1)',
        borderRadius: '8px',
        padding: '12px',
        marginBottom: '12px',
        border: '1px solid rgba(192, 132, 252, 0.2)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
          <div>
            <span style={{ color: '#a1a1aa' }}>研究槽: </span>
            <span style={{ color: '#c084fc', fontWeight: 'bold' }}>{activeResearch.length}/{maxConcurrent}</span>
          </div>
          <div>
            <span style={{ color: '#a1a1aa' }}>已完成: </span>
            <span style={{ color: '#10b981', fontWeight: 'bold' }}>{gameManager.completedResearch.length}</span>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div style={{
        display: 'flex',
        gap: '6px',
        marginBottom: '12px',
        overflowX: 'auto',
        paddingBottom: '4px',
      }}>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            style={{
              padding: '6px 12px',
              background: selectedCategory === cat.id ? 'rgba(192, 132, 252, 0.3)' : 'rgba(255, 255, 255, 0.05)',
              border: selectedCategory === cat.id ? '1px solid rgba(192, 132, 252, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              color: selectedCategory === cat.id ? '#c084fc' : '#a1a1aa',
              fontSize: '12px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>

      {/* Project List */}
      <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
        {filteredProjects.map(project => {
          const statusColor = getStatusColor(project.status);
          const progressPercent = Math.round((project.progress / project.totalProgress) * 100);

          return (
            <div
              key={project.id}
              style={{
                padding: '12px',
                background: project.status === ResearchStatus.IN_PROGRESS ? 'rgba(192, 132, 252, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                borderRadius: '12px',
                marginBottom: '8px',
                border: `1px solid ${project.status === ResearchStatus.IN_PROGRESS ? 'rgba(192, 132, 252, 0.4)' : 'rgba(255, 255, 255, 0.08)'}`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '16px' }}>{project.icon}</span>
                  <span style={{ color: '#ffffff', fontWeight: 'bold', fontSize: '13px' }}>{project.name}</span>
                </div>
                <span style={{ color: statusColor, fontSize: '10px' }}>
                  {getStatusText(project.status)}
                </span>
              </div>

              <div style={{ color: '#a1a1aa', fontSize: '11px', marginBottom: '8px' }}>
                {project.description}
              </div>

              {/* Progress Bar */}
              {project.status === ResearchStatus.IN_PROGRESS && (
                <div style={{ marginBottom: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: '#a1a1aa', fontSize: '10px' }}>研究进度</span>
                    <span style={{ color: '#c084fc', fontSize: '10px' }}>{progressPercent}%</span>
                  </div>
                  <div style={{
                    height: '4px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '2px',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${progressPercent}%`,
                      background: 'linear-gradient(90deg, #c084fc, #a855f7)',
                      borderRadius: '2px',
                    }} />
                  </div>
                </div>
              )}

              {/* Effects */}
              {project.status === ResearchStatus.COMPLETED && (
                <div style={{
                  background: 'rgba(16, 185, 129, 0.1)',
                  borderRadius: '6px',
                  padding: '6px 8px',
                  marginBottom: '8px',
                }}>
                  {project.effects.map((effect, i) => (
                    <div key={i} style={{ color: '#10b981', fontSize: '10px' }}>
                      ✨ {effect.description}
                    </div>
                  ))}
                </div>
              )}

              {/* Cost & Action */}
              {project.status === ResearchStatus.AVAILABLE && (
                <>
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px',
                    marginBottom: '8px',
                    fontSize: '10px',
                  }}>
                    <span style={{ color: '#fbbf24' }}>💰 {project.cost.credits}</span>
                    {project.cost.materials.map((mat, i) => (
                      <span key={i} style={{ color: '#60a5fa' }}>{getItemName(mat.itemId)} x{mat.count}</span>
                    ))}
                  </div>
                  <button
                    onClick={() => handleStartResearch(project.id)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      background: 'linear-gradient(135deg, #c084fc, #a855f7)',
                      border: 'none',
                      borderRadius: '6px',
                      color: '#fff',
                      fontWeight: 'bold',
                      fontSize: '11px',
                      cursor: 'pointer',
                    }}
                  >
                    开始研究
                  </button>
                </>
              )}

              {/* Cancel Button */}
              {project.status === ResearchStatus.IN_PROGRESS && (
                <button
                  onClick={() => handleCancelResearch(project.id)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    background: 'rgba(239, 68, 68, 0.2)',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    borderRadius: '6px',
                    color: '#f87171',
                    fontWeight: 'bold',
                    fontSize: '11px',
                    cursor: 'pointer',
                  }}
                >
                  取消研究
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// 7. 采矿平台内容
function MiningContent() {
  const { gameManager, saveGame, startMiningWithCrew, collectMining, cancelMining, processMiningRandomEvent, calculateCrewMiningBonus } = useGameStore();
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [selectedSite, setSelectedSite] = useState<string | null>(null);
  const [selectedCrew, setSelectedCrew] = useState<string[]>([]);
  const [showCrewSelect, setShowCrewSelect] = useState(false);

  const sites = gameManager.getAvailableMiningSites();
  const tasks = gameManager.getMiningTasks();
  const level = gameManager.getFacilityLevel(FacilityType.MINING);
  const maxSlots = 1 + Math.floor(level / 2);
  const crewMembers = gameManager.getCrewMembers();

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 2000);
  };

  const handleStartMining = async (siteId: string) => {
    const result = startMiningWithCrew(siteId, selectedCrew);
    if (result.success) {
      showMessage(result.message, 'success');
      setSelectedSite(null);
      setSelectedCrew([]);
      setShowCrewSelect(false);
      await saveGame();
    } else {
      showMessage(result.message, 'error');
    }
  };

  const handleCollect = async (siteId: string) => {
    const result = collectMining(siteId);
    if (result.success) {
      const depthInfo = result.depth ? ` (深度: ${result.depth}m)` : '';
      showMessage(`${result.message}${depthInfo}`, 'success');
      await saveGame();
    } else {
      showMessage(result.message, 'error');
    }
  };

  const handleCancel = async (siteId: string) => {
    const result = cancelMining(siteId);
    if (result.success) {
      showMessage(result.message, 'success');
      await saveGame();
    } else {
      showMessage(result.message, 'error');
    }
  };

  const handleProcessEvent = async (siteId: string) => {
    const result = processMiningRandomEvent(siteId);
    if (result) {
      showMessage(`${result.event}: ${result.message}`, result.bonus ? 'success' : 'error');
      await saveGame();
    }
  };

  const toggleCrewSelection = (crewId: string) => {
    if (selectedCrew.includes(crewId)) {
      setSelectedCrew(selectedCrew.filter(id => id !== crewId));
    } else if (selectedCrew.length < 4) {
      setSelectedCrew([...selectedCrew, crewId]);
    }
  };

  const isCrewAvailable = (crewId: string) => {
    return !tasks.some(t => t.assignedCrew.includes(crewId));
  };

  const getTaskForSite = (siteId: string) => {
    return tasks.find(t => t.siteId === siteId);
  };

  const getEventConfig = (eventType: MiningEventType) => {
    return MINING_EVENTS.find(e => e.type === eventType);
  };

  return (
    <div>
      {/* Message Toast */}
      {message && (
        <div style={{
          position: 'absolute',
          top: '-40px',
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '8px 16px',
          borderRadius: '8px',
          background: message.type === 'success' ? 'rgba(34, 197, 94, 0.9)' : 'rgba(239, 68, 68, 0.9)',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: '12px',
          zIndex: 100,
          whiteSpace: 'nowrap',
        }}>
          {message.text}
        </div>
      )}

      {/* Stats */}
      <div style={{
        background: 'rgba(245, 158, 11, 0.1)',
        borderRadius: '8px',
        padding: '12px',
        marginBottom: '12px',
        border: '1px solid rgba(245, 158, 11, 0.2)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
          <div>
            <span style={{ color: '#a1a1aa' }}>采矿槽: </span>
            <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>{tasks.length}/{maxSlots}</span>
          </div>
          <div>
            <span style={{ color: '#a1a1aa' }}>设施等级: </span>
            <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>Lv.{level}</span>
          </div>
        </div>
      </div>

      {/* Active Tasks */}
      {tasks.length > 0 && (
        <div style={{ marginBottom: '12px' }}>
          <div style={{ color: '#f59e0b', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>
            ⛏️ 进行中的任务
          </div>
          {tasks.map(task => {
            const site = sites.find(s => s.id === task.siteId);
            if (!site) return null;
            const mineralConfig = MINERAL_CONFIG[site.mineralType];
            const progress = getMiningProgress(task);
            const remaining = getMiningRemainingTime(task);
            const depthBonus = getDepthBonusDescription(task.currentDepth || 0, site);
            const assignedCrewNames = (task.assignedCrew || []).map(id => crewMembers.find(c => c.id === id)?.name).filter(Boolean);

            return (
              <div
                key={task.siteId}
                style={{
                  padding: '12px',
                  background: 'rgba(245, 158, 11, 0.15)',
                  borderRadius: '12px',
                  marginBottom: '8px',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '16px' }}>{mineralConfig.icon}</span>
                    <span style={{ color: '#ffffff', fontWeight: 'bold', fontSize: '13px' }}>{site.name}</span>
                  </div>
                  <span style={{ color: mineralConfig.color, fontSize: '11px' }}>
                    {mineralConfig.name}
                  </span>
                </div>

                {/* Depth Info */}
                <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ color: '#a1a1aa', fontSize: '10px' }}>
                    深度: <span style={{ color: '#22c55e' }}>{task.currentDepth || 0}m</span> / {site.maxDepth}m
                  </div>
                  <div style={{ color: '#22c55e', fontSize: '10px' }}>
                    {depthBonus}
                  </div>
                </div>

                {/* Depth Progress Bar */}
                <div style={{ marginBottom: '8px' }}>
                  <div style={{
                    height: '3px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '2px',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${((task.currentDepth || 0) / site.maxDepth) * 100}%`,
                      background: 'linear-gradient(90deg, #22c55e, #16a34a)',
                      borderRadius: '2px',
                    }} />
                  </div>
                </div>

                {/* Time Progress */}
                <div style={{ marginBottom: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: '#a1a1aa', fontSize: '10px' }}>进度</span>
                    <span style={{ color: '#f59e0b', fontSize: '10px' }}>{Math.round(progress)}%</span>
                  </div>
                  <div style={{
                    height: '4px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '2px',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${progress}%`,
                      background: `linear-gradient(90deg, ${mineralConfig.color}, #f59e0b)`,
                      borderRadius: '2px',
                    }} />
                  </div>
                  <div style={{ color: '#a1a1aa', fontSize: '10px', marginTop: '4px' }}>
                    剩余: {formatMiningTime(remaining)}
                  </div>
                </div>

                {/* Assigned Crew */}
                {assignedCrewNames.length > 0 && (
                  <div style={{ marginBottom: '8px', color: '#a1a1aa', fontSize: '10px' }}>
                    派遣船员: {assignedCrewNames.join('、')}
                  </div>
                )}

                {/* Recent Events */}
                {(task.events || []).length > 0 && (
                  <div style={{ marginBottom: '8px' }}>
                    <div style={{ color: '#a1a1aa', fontSize: '10px', marginBottom: '4px' }}>最近事件:</div>
                    {(task.events || []).slice(-2).map((event, idx) => {
                      const eventConfig = getEventConfig(event.type);
                      return (
                        <div key={idx} style={{
                          color: eventConfig?.color || '#a1a1aa',
                          fontSize: '10px',
                          marginBottom: '2px',
                        }}>
                          {eventConfig?.icon} {event.result}
                        </div>
                      );
                    })}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleProcessEvent(task.siteId)}
                    style={{
                      flex: 1,
                      padding: '6px',
                      background: 'rgba(168, 85, 247, 0.2)',
                      border: '1px solid rgba(168, 85, 247, 0.4)',
                      borderRadius: '6px',
                      color: '#a855f7',
                      fontWeight: 'bold',
                      fontSize: '10px',
                      cursor: 'pointer',
                    }}
                  >
                    🎲 触发事件
                  </button>
                  <button
                    onClick={() => handleCollect(task.siteId)}
                    style={{
                      flex: 1,
                      padding: '6px',
                      background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                      border: 'none',
                      borderRadius: '6px',
                      color: '#000',
                      fontWeight: 'bold',
                      fontSize: '10px',
                      cursor: 'pointer',
                    }}
                  >
                    收集
                  </button>
                  <button
                    onClick={() => handleCancel(task.siteId)}
                    style={{
                      flex: 1,
                      padding: '6px',
                      background: 'rgba(239, 68, 68, 0.2)',
                      border: '1px solid rgba(239, 68, 68, 0.4)',
                      borderRadius: '6px',
                      color: '#f87171',
                      fontWeight: 'bold',
                      fontSize: '10px',
                      cursor: 'pointer',
                    }}
                  >
                    取消
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Crew Selection Modal */}
      {showCrewSelect && selectedSite && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          borderRadius: '12px',
          zIndex: 50,
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <div style={{ color: '#f59e0b', fontWeight: 'bold', marginBottom: '12px', fontSize: '14px' }}>
            选择派遣船员 ({selectedCrew.length}/4)
          </div>

          <div style={{ flex: 1, overflowY: 'auto', marginBottom: '12px' }}>
            {crewMembers.slice(0, 8).map(crew => {
              const available = isCrewAvailable(crew.id);
              const selected = selectedCrew.includes(crew.id);
              const bonus = getCrewMiningBonus({
                attack: crew.stats.attack,
                defense: crew.stats.defense,
                speed: crew.stats.speed,
              });

              return (
                <div
                  key={crew.id}
                  onClick={() => available && toggleCrewSelection(crew.id)}
                  style={{
                    padding: '10px',
                    background: selected ? 'rgba(245, 158, 11, 0.3)' : 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '8px',
                    marginBottom: '6px',
                    border: `1px solid ${selected ? 'rgba(245, 158, 11, 0.5)' : 'rgba(255, 255, 255, 0.1)'}`,
                    cursor: available ? 'pointer' : 'not-allowed',
                    opacity: available ? 1 : 0.5,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ color: '#fff', fontSize: '12px' }}>{crew.name}</div>
                    <div style={{ color: '#a1a1aa', fontSize: '10px' }}>
                      攻:{crew.stats.attack} 防:{crew.stats.defense} 速:{crew.stats.speed}
                    </div>
                  </div>
                  <div style={{ color: '#22c55e', fontSize: '11px' }}>
                    +{bonus}%产量
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => {
                setShowCrewSelect(false);
                setSelectedSite(null);
                setSelectedCrew([]);
              }}
              style={{
                flex: 1,
                padding: '10px',
                background: 'rgba(100, 100, 100, 0.3)',
                border: '1px solid rgba(100, 100, 100, 0.5)',
                borderRadius: '8px',
                color: '#a1a1aa',
                fontWeight: 'bold',
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              取消
            </button>
            <button
              onClick={() => selectedSite && handleStartMining(selectedSite)}
              style={{
                flex: 1,
                padding: '10px',
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                border: 'none',
                borderRadius: '8px',
                color: '#000',
                fontWeight: 'bold',
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              开始采矿
            </button>
          </div>
        </div>
      )}

      {/* Available Sites */}
      <div>
        <div style={{ color: '#a1a1aa', fontSize: '12px', marginBottom: '8px' }}>
          🏔️ 可用采矿点
        </div>
        {sites.filter(s => !getTaskForSite(s.id)).map(site => {
          const mineralConfig = MINERAL_CONFIG[site.mineralType];
          const isActive = !!getTaskForSite(site.id);

          return (
            <div
              key={site.id}
              style={{
                padding: '12px',
                background: site.unlocked ? 'rgba(255, 255, 255, 0.03)' : 'rgba(100, 100, 100, 0.1)',
                borderRadius: '12px',
                marginBottom: '8px',
                border: `1px solid ${site.unlocked ? 'rgba(255, 255, 255, 0.08)' : 'rgba(100, 100, 100, 0.2)'}`,
                opacity: site.unlocked ? 1 : 0.6,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '16px' }}>{mineralConfig.icon}</span>
                  <span style={{ color: '#ffffff', fontWeight: 'bold', fontSize: '13px' }}>{site.name}</span>
                </div>
                <span style={{ color: mineralConfig.color, fontSize: '11px' }}>
                  {mineralConfig.name}
                </span>
              </div>

              <div style={{ color: '#a1a1aa', fontSize: '11px', marginBottom: '4px' }}>
                基础产量: {site.baseYield}/次 | 难度: {'⭐'.repeat(site.difficulty)}
              </div>

              <div style={{ color: '#a1a1aa', fontSize: '11px', marginBottom: '8px' }}>
                最大深度: {site.maxDepth}m | 深度加成: +{(site.depthBonus * 100).toFixed(1)}%/m
              </div>

              {site.unlocked ? (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => {
                      setSelectedSite(site.id);
                      setShowCrewSelect(true);
                    }}
                    disabled={isActive}
                    style={{
                      flex: 1,
                      padding: '8px',
                      background: isActive ? 'rgba(100, 100, 100, 0.3)' : `linear-gradient(135deg, ${mineralConfig.color}80, ${mineralConfig.color}40)`,
                      border: isActive ? '1px solid rgba(100, 100, 100, 0.3)' : 'none',
                      borderRadius: '6px',
                      color: isActive ? '#666' : '#fff',
                      fontWeight: 'bold',
                      fontSize: '11px',
                      cursor: isActive ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {isActive ? '采矿中' : '派遣船员'}
                  </button>
                  <button
                    onClick={() => handleStartMining(site.id)}
                    disabled={isActive}
                    style={{
                      flex: 1,
                      padding: '8px',
                      background: isActive ? 'rgba(100, 100, 100, 0.3)' : 'rgba(245, 158, 11, 0.2)',
                      border: isActive ? '1px solid rgba(100, 100, 100, 0.3)' : '1px solid rgba(245, 158, 11, 0.4)',
                      borderRadius: '6px',
                      color: isActive ? '#666' : '#f59e0b',
                      fontWeight: 'bold',
                      fontSize: '11px',
                      cursor: isActive ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {isActive ? '采矿中' : '快速开始'}
                  </button>
                </div>
              ) : (
                <div style={{
                  background: 'rgba(100, 100, 100, 0.2)',
                  borderRadius: '6px',
                  padding: '8px',
                  textAlign: 'center',
                  color: '#666',
                  fontSize: '11px',
                }}>
                  🔒 需要 Lv.{site.unlockCondition?.facilityLevel || '?'} 解锁
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// 8. 芯片研发内容
function ChipContent() {
  const { gameManager, saveGame, craftChip, upgradeChip, equipChip, unequipChip, decomposeChip, enhanceChip, rerollChipSubStat, rerollAllChipSubStats, toggleChipLock, getChipSetBonuses, getChipStatBonus } = useGameStore();
  const [activeTab, setActiveTab] = useState<'slots' | 'craft'>('slots');
  const [selectedChip, setSelectedChip] = useState<Chip | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const chips = gameManager.getChips();
  const equippedChips = gameManager.getEquippedChips();
  const maxSlots = gameManager.getAvailableChipSlots();
  const level = gameManager.getFacilityLevel(FacilityType.CHIP);
  const setBonuses = getChipSetBonuses();
  const totalStats = getChipStatBonus();

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 2000);
  };

  const handleCraft = async (slot: ChipSlot, rarity: ChipRarity) => {
    const result = craftChip(slot, rarity);
    if (result.success) {
      showMessage(`成功制作${CHIP_RARITY_CONFIG[rarity].name}芯片`, 'success');
      await saveGame();
    } else {
      showMessage(result.message, 'error');
    }
  };

  const handleUpgrade = async (chipId: string, count: number) => {
    const result = upgradeChip(chipId, count);
    if (result.success) {
      showMessage(`升级到Lv.${result.newLevel}`, 'success');
      await saveGame();
    } else {
      showMessage(result.message, 'error');
    }
  };

  const handleEquip = async (chipId: string) => {
    const result = equipChip(chipId);
    if (result.success) {
      showMessage(result.message, 'success');
      await saveGame();
    } else {
      showMessage(result.message, 'error');
    }
  };

  const handleUnequip = async (slot: ChipSlot) => {
    const result = unequipChip(slot);
    if (result.success) {
      showMessage(result.message, 'success');
      await saveGame();
    } else {
      showMessage(result.message, 'error');
    }
  };

  const handleDecompose = async (chipId: string) => {
    if (!confirm('确定要分解这个芯片吗？')) return;
    const result = decomposeChip(chipId);
    if (result.success) {
      showMessage(`分解成功，获得${result.rewards}`, 'success');
      setSelectedChip(null);
      await saveGame();
    } else {
      showMessage(result.message, 'error');
    }
  };

  const handleEnhance = async (chipId: string, subStatIndex: number) => {
    const result = enhanceChip(chipId, subStatIndex);
    if (result.success) {
      showMessage(result.message, 'success');
      await saveGame();
    } else {
      showMessage(result.message, 'error');
    }
  };

  const handleReroll = async (chipId: string, subStatIndex: number) => {
    if (!confirm('确定要重随这个副属性吗？')) return;
    const result = rerollChipSubStat(chipId, subStatIndex);
    if (result.success) {
      showMessage(result.message, 'success');
      await saveGame();
    } else {
      showMessage(result.message, 'error');
    }
  };

  const handleRerollAll = async (chipId: string) => {
    if (!confirm('确定要重随所有副属性吗？')) return;
    const result = rerollAllChipSubStats(chipId);
    if (result.success) {
      showMessage(result.message, 'success');
      await saveGame();
    } else {
      showMessage(result.message, 'error');
    }
  };

  const handleToggleLock = async (chipId: string) => {
    const result = toggleChipLock(chipId);
    if (result.success) {
      showMessage(result.message, 'success');
      await saveGame();
    } else {
      showMessage(result.message, 'error');
    }
  };

  const getEquippedChipForSlot = (slot: ChipSlot): Chip | undefined => {
    const chipId = gameManager.equippedChips[slot];
    return chips.find(c => c.id === chipId);
  };

  return (
    <div>
      {/* Message Toast */}
      {message && (
        <div style={{
          position: 'absolute',
          top: '-40px',
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '8px 16px',
          borderRadius: '8px',
          background: message.type === 'success' ? 'rgba(34, 197, 94, 0.9)' : 'rgba(239, 68, 68, 0.9)',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: '12px',
          zIndex: 100,
          whiteSpace: 'nowrap',
        }}>
          {message.text}
        </div>
      )}

      {/* Stats */}
      <div style={{
        background: 'rgba(16, 185, 129, 0.1)',
        borderRadius: '8px',
        padding: '12px',
        marginBottom: '12px',
        border: '1px solid rgba(16, 185, 129, 0.2)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
          <div>
            <span style={{ color: '#a1a1aa' }}>芯片槽位: </span>
            <span style={{ color: '#10b981', fontWeight: 'bold' }}>{equippedChips.length}/{maxSlots}</span>
          </div>
          <div>
            <span style={{ color: '#a1a1aa' }}>芯片数量: </span>
            <span style={{ color: '#10b981', fontWeight: 'bold' }}>{chips.length}</span>
          </div>
        </div>
      </div>

      {/* Set Bonuses */}
      {setBonuses.length > 0 && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.1)',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '12px',
          border: '1px solid rgba(16, 185, 129, 0.2)',
        }}>
          <div style={{ color: '#10b981', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>
            套装效果
          </div>
          {setBonuses.map((bonus, idx) => {
            const setConfig = CHIP_SET_CONFIG[bonus.set];
            return (
              <div key={idx} style={{ marginBottom: '4px' }}>
                <div style={{ color: setConfig.color, fontSize: '11px', fontWeight: 'bold' }}>
                  {setConfig.icon} {setConfig.name} ({bonus.count}件)
                </div>
                {bonus.bonuses.map((b, i) => (
                  <div key={i} style={{ color: '#a1a1aa', fontSize: '10px', marginLeft: '16px' }}>
                    {b}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {/* Total Stats */}
      {Object.keys(totalStats).length > 0 && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.1)',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '12px',
          border: '1px solid rgba(16, 185, 129, 0.2)',
        }}>
          <div style={{ color: '#10b981', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>
            总属性加成
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {Object.entries(totalStats).map(([stat, value]) => (
              <div key={stat} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '11px',
              }}>
                <span style={{ color: '#10b981' }}>{stat}:</span>
                <span style={{ color: '#fff' }}>+{typeof value === 'number' ? value.toFixed(1) : value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Switcher */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '12px',
      }}>
        <button
          onClick={() => setActiveTab('slots')}
          style={{
            flex: 1,
            padding: '10px',
            background: activeTab === 'slots' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255, 255, 255, 0.05)',
            border: activeTab === 'slots' ? '1px solid rgba(16, 185, 129, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            color: activeTab === 'slots' ? '#10b981' : '#a1a1aa',
            fontWeight: 'bold',
            fontSize: '12px',
            cursor: 'pointer',
          }}
        >
          💾 芯片槽位
        </button>
        <button
          onClick={() => setActiveTab('craft')}
          style={{
            flex: 1,
            padding: '10px',
            background: activeTab === 'craft' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255, 255, 255, 0.05)',
            border: activeTab === 'craft' ? '1px solid rgba(16, 185, 129, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            color: activeTab === 'craft' ? '#10b981' : '#a1a1aa',
            fontWeight: 'bold',
            fontSize: '12px',
            cursor: 'pointer',
          }}
        >
          🔨 制作芯片
        </button>
      </div>

      {/* Slots Tab */}
      {activeTab === 'slots' && (
        <div>
          {/* Chip Slots */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '10px',
            marginBottom: '12px',
          }}>
            {[ChipSlot.SLOT_1, ChipSlot.SLOT_2, ChipSlot.SLOT_3, ChipSlot.SLOT_4].map(slot => {
              const equipped = getEquippedChipForSlot(slot);
              return (
                <div
                  key={slot}
                  onClick={() => {
                    if (equipped) setSelectedChip(equipped);
                  }}
                  style={{
                    padding: '12px',
                    background: 'rgba(16, 185, 129, 0.1)',
                    borderRadius: '12px',
                    border: equipped ? `2px solid ${CHIP_RARITY_CONFIG[equipped.rarity].color}` : '1px solid rgba(255, 255, 255, 0.1)',
                    cursor: equipped ? 'pointer' : 'default',
                  }}
                >
                  <div style={{
                    color: '#a1a1aa',
                    fontSize: '11px',
                    marginBottom: '4px',
                  }}>
                    {slot}号位 {slot === ChipSlot.SLOT_1 ? '(生命)' : slot === ChipSlot.SLOT_2 ? '(攻击)' : '(随机)'}
                  </div>
                  {equipped ? (
                    <div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        marginBottom: '4px',
                      }}>
                        <span style={{ color: CHIP_RARITY_CONFIG[equipped.rarity].color, fontWeight: 'bold', fontSize: '12px' }}>
                          {CHIP_RARITY_CONFIG[equipped.rarity].name}
                        </span>
                        <span style={{ color: '#10b981', fontSize: '11px' }}>Lv.{equipped.level}</span>
                        {equipped.locked && <span style={{ color: '#f59e0b', fontSize: '10px' }}>🔒</span>}
                      </div>
                      <div style={{ color: '#fff', fontSize: '11px' }}>
                        主属性: {CHIP_MAIN_STAT_CONFIG[equipped.mainStat].name} +{equipped.mainStatValue}
                      </div>
                      {equipped.setId && (
                        <div style={{ color: CHIP_SET_CONFIG[equipped.setId].color, fontSize: '10px' }}>
                          {CHIP_SET_CONFIG[equipped.setId].icon} {CHIP_SET_CONFIG[equipped.setId].name}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ color: '#666', fontSize: '12px' }}>
                      空
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Chip Inventory */}
          <div style={{ color: '#a1a1aa', fontSize: '12px', marginBottom: '8px' }}>
            📦 芯片仓库 ({chips.filter(c => !Object.values(gameManager.equippedChips).includes(c.id)).length})
          </div>
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {chips.filter(c => !Object.values(gameManager.equippedChips).includes(c.id)).map(chip => (
              <div
                key={chip.id}
                onClick={() => setSelectedChip(chip)}
                style={{
                  padding: '10px',
                  background: selectedChip?.id === chip.id ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '8px',
                  marginBottom: '6px',
                  border: `1px solid ${selectedChip?.id === chip.id ? CHIP_RARITY_CONFIG[chip.rarity].color : 'rgba(255, 255, 255, 0.08)'}`,
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ color: CHIP_RARITY_CONFIG[chip.rarity].color, fontWeight: 'bold', fontSize: '12px' }}>
                      {CHIP_RARITY_CONFIG[chip.rarity].name}
                    </span>
                    <span style={{ color: '#a1a1aa', fontSize: '11px', marginLeft: '8px' }}>
                      {chip.slot}号位 Lv.{chip.level}
                    </span>
                    {chip.locked && <span style={{ color: '#f59e0b', fontSize: '10px', marginLeft: '4px' }}>🔒</span>}
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleEquip(chip.id); }}
                    style={{
                      padding: '4px 8px',
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      border: 'none',
                      borderRadius: '4px',
                      color: '#fff',
                      fontSize: '10px',
                      cursor: 'pointer',
                    }}
                  >
                    装备
                  </button>
                </div>
                {chip.setId && (
                  <div style={{ color: CHIP_SET_CONFIG[chip.setId].color, fontSize: '10px', marginTop: '4px' }}>
                    {CHIP_SET_CONFIG[chip.setId].icon} {CHIP_SET_CONFIG[chip.setId].name}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Selected Chip Actions */}
          {selectedChip && (
            <div style={{
              marginTop: '12px',
              padding: '12px',
              background: 'rgba(16, 185, 129, 0.1)',
              borderRadius: '12px',
              border: '1px solid rgba(16, 185, 129, 0.3)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ color: CHIP_RARITY_CONFIG[selectedChip.rarity].color, fontWeight: 'bold' }}>
                  {CHIP_RARITY_CONFIG[selectedChip.rarity].name}芯片 Lv.{selectedChip.level}
                </div>
                <button
                  onClick={() => handleToggleLock(selectedChip.id)}
                  style={{
                    padding: '4px 8px',
                    background: selectedChip.locked ? 'rgba(245, 158, 11, 0.3)' : 'rgba(100, 100, 100, 0.2)',
                    border: selectedChip.locked ? '1px solid rgba(245, 158, 11, 0.5)' : '1px solid rgba(100, 100, 100, 0.3)',
                    borderRadius: '4px',
                    color: selectedChip.locked ? '#f59e0b' : '#a1a1aa',
                    fontSize: '10px',
                    cursor: 'pointer',
                  }}
                >
                  {selectedChip.locked ? '🔒 已锁定' : '🔓 未锁定'}
                </button>
              </div>

              {/* Set Info */}
              {selectedChip.setId && (
                <div style={{ color: CHIP_SET_CONFIG[selectedChip.setId].color, fontSize: '11px', marginBottom: '8px' }}>
                  {CHIP_SET_CONFIG[selectedChip.setId].icon} {CHIP_SET_CONFIG[selectedChip.setId].name}套装
                </div>
              )}

              {/* Main Stat */}
              <div style={{ color: '#fff', fontSize: '11px', marginBottom: '8px' }}>
                主属性: {CHIP_MAIN_STAT_CONFIG[selectedChip.mainStat].name} +{selectedChip.mainStatValue}
              </div>

              {/* Sub Stats */}
              <div style={{ marginBottom: '12px' }}>
                <div style={{ color: '#a1a1aa', fontSize: '11px', marginBottom: '4px' }}>副属性:</div>
                {selectedChip.subStats.map((sub, idx) => {
                  const enhanceCost = getEnhanceCost(selectedChip);
                  const rerollCost = getRerollCost(selectedChip);
                  return (
                    <div key={idx} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '6px 8px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '6px',
                      marginBottom: '4px',
                    }}>
                      <span style={{ color: '#fff', fontSize: '11px' }}>
                        {CHIP_SUB_STAT_CONFIG[sub.stat].name} +{sub.value}
                      </span>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          onClick={() => handleEnhance(selectedChip.id, idx)}
                          style={{
                            padding: '2px 6px',
                            background: 'rgba(16, 185, 129, 0.2)',
                            border: '1px solid rgba(16, 185, 129, 0.4)',
                            borderRadius: '4px',
                            color: '#10b981',
                            fontSize: '9px',
                            cursor: 'pointer',
                          }}
                          title={`强化消耗: ${enhanceCost.credits}信用点, ${enhanceCost.materials}水晶矿`}
                        >
                          强化
                        </button>
                        <button
                          onClick={() => handleReroll(selectedChip.id, idx)}
                          disabled={selectedChip.locked}
                          style={{
                            padding: '2px 6px',
                            background: selectedChip.locked ? 'rgba(100, 100, 100, 0.2)' : 'rgba(168, 85, 247, 0.2)',
                            border: selectedChip.locked ? '1px solid rgba(100, 100, 100, 0.3)' : '1px solid rgba(168, 85, 247, 0.4)',
                            borderRadius: '4px',
                            color: selectedChip.locked ? '#666' : '#a855f7',
                            fontSize: '9px',
                            cursor: selectedChip.locked ? 'not-allowed' : 'pointer',
                          }}
                          title={`重随消耗: ${rerollCost.credits}信用点, ${rerollCost.materials}量子矿`}
                        >
                          重随
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Enhance Info */}
              <div style={{ color: '#a1a1aa', fontSize: '10px', marginBottom: '12px' }}>
                强化次数: {selectedChip.enhanceCount}/{CHIP_RARITY_CONFIG[selectedChip.rarity].maxEnhance}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <button
                  onClick={() => handleUpgrade(selectedChip.id, 1)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    border: 'none',
                    borderRadius: '6px',
                    color: '#fff',
                    fontWeight: 'bold',
                    fontSize: '11px',
                    cursor: 'pointer',
                  }}
                >
                  升级
                </button>
                <button
                  onClick={() => handleRerollAll(selectedChip.id)}
                  disabled={selectedChip.locked}
                  style={{
                    flex: 1,
                    padding: '8px',
                    background: selectedChip.locked ? 'rgba(100, 100, 100, 0.3)' : 'rgba(168, 85, 247, 0.2)',
                    border: selectedChip.locked ? '1px solid rgba(100, 100, 100, 0.3)' : '1px solid rgba(168, 85, 247, 0.4)',
                    borderRadius: '6px',
                    color: selectedChip.locked ? '#666' : '#a855f7',
                    fontWeight: 'bold',
                    fontSize: '11px',
                    cursor: selectedChip.locked ? 'not-allowed' : 'pointer',
                  }}
                >
                  重随全部
                </button>
              </div>
              <button
                onClick={() => handleDecompose(selectedChip.id)}
                disabled={selectedChip.locked}
                style={{
                  width: '100%',
                  padding: '8px',
                  background: selectedChip.locked ? 'rgba(100, 100, 100, 0.3)' : 'rgba(239, 68, 68, 0.2)',
                  border: selectedChip.locked ? '1px solid rgba(100, 100, 100, 0.3)' : '1px solid rgba(239, 68, 68, 0.4)',
                  borderRadius: '6px',
                  color: selectedChip.locked ? '#666' : '#f87171',
                  fontWeight: 'bold',
                  fontSize: '11px',
                  cursor: selectedChip.locked ? 'not-allowed' : 'pointer',
                }}
              >
                分解
              </button>
            </div>
          )}
        </div>
      )}

      {/* Craft Tab */}
      {activeTab === 'craft' && (
        <div>
          <div style={{ color: '#a1a1aa', fontSize: '12px', marginBottom: '8px' }}>
            选择槽位和品质制作芯片
          </div>

          {[ChipSlot.SLOT_1, ChipSlot.SLOT_2, ChipSlot.SLOT_3, ChipSlot.SLOT_4].map(slot => {
            const slotName = slot === ChipSlot.SLOT_1 ? '生命' : slot === ChipSlot.SLOT_2 ? '攻击' : '随机';

            return (
              <div
                key={slot}
                style={{
                  padding: '12px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '12px',
                  marginBottom: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <div style={{
                  color: '#fff',
                  fontWeight: 'bold',
                  fontSize: '13px',
                  marginBottom: '8px',
                }}>
                  {slot}号位 ({slotName}主属性)
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {Object.values(ChipRarity).map(rarity => {
                    const cost = CHIP_CRAFT_COST[rarity];
                    const canAfford = gameManager.trainCoins >= cost.credits &&
                      cost.materials.every(m => gameManager.inventory.hasItem(m.itemId, m.count));

                    return (
                      <div
                        key={rarity}
                        style={{
                          padding: '10px',
                          background: `linear-gradient(135deg, ${CHIP_RARITY_CONFIG[rarity].color}20, ${CHIP_RARITY_CONFIG[rarity].color}10)`,
                          borderRadius: '8px',
                          border: `1px solid ${CHIP_RARITY_CONFIG[rarity].color}40`,
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '8px',
                        }}>
                          <span style={{
                            color: CHIP_RARITY_CONFIG[rarity].color,
                            fontWeight: 'bold',
                            fontSize: '12px',
                          }}>
                            {CHIP_RARITY_CONFIG[rarity].name}
                          </span>
                          <span style={{ color: '#a1a1aa', fontSize: '10px' }}>
                            强化上限: {CHIP_RARITY_CONFIG[rarity].maxEnhance}次
                          </span>
                        </div>

                        <div style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '6px',
                          marginBottom: '8px',
                          fontSize: '10px',
                        }}>
                          <span style={{ color: '#fbbf24' }}>
                            💰 {cost.credits}
                          </span>
                          {cost.materials.map((m, idx) => {
                            const hasEnough = gameManager.inventory.hasItem(m.itemId, m.count);
                            const currentCount = gameManager.inventory.getItem(m.itemId)?.quantity || 0;
                            return (
                              <span
                                key={idx}
                                style={{ color: hasEnough ? '#10b981' : '#ef4444' }}
                              >
                                {m.itemId} x{m.count} ({currentCount})
                              </span>
                            );
                          })}
                        </div>

                        <button
                          onClick={() => handleCraft(slot, rarity)}
                          disabled={!canAfford}
                          style={{
                            width: '100%',
                            padding: '6px',
                            background: canAfford
                              ? `linear-gradient(135deg, ${CHIP_RARITY_CONFIG[rarity].color}60, ${CHIP_RARITY_CONFIG[rarity].color}40)`
                              : 'rgba(100, 100, 100, 0.3)',
                            border: canAfford
                              ? `1px solid ${CHIP_RARITY_CONFIG[rarity].color}80`
                              : '1px solid rgba(100, 100, 100, 0.3)',
                            borderRadius: '6px',
                            color: canAfford ? '#fff' : '#666',
                            fontSize: '11px',
                            cursor: canAfford ? 'pointer' : 'not-allowed',
                          }}
                        >
                          {canAfford ? '制作' : '材料不足'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// 9. 基因工程内容
function GeneContent() {
  const { gameManager, saveGame, upgradeGeneNode, getGeneTotalStats } = useGameStore();
  const [selectedType, setSelectedType] = useState<GeneType | 'all'>('all');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const nodes = gameManager.getGeneNodes();
  const totalStats = getGeneTotalStats();
  const level = gameManager.getFacilityLevel(FacilityType.GENE);

  const filteredNodes = selectedType === 'all' ? nodes : nodes.filter(n => n.type === selectedType);

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 2000);
  };

  const handleUpgrade = async (nodeId: string) => {
    const result = upgradeGeneNode(nodeId);
    if (result.success) {
      showMessage(`升级成功，属性+${result.newValue}`, 'success');
      await saveGame();
    } else {
      showMessage(result.message, 'error');
    }
  };

  const geneTypes = [
    { id: 'all' as const, name: '全部', icon: '🧬' },
    { id: GeneType.ATTACK, name: '攻击', icon: '⚔️' },
    { id: GeneType.DEFENSE, name: '防御', icon: '🛡️' },
    { id: GeneType.HP, name: '生命', icon: '❤️' },
    { id: GeneType.SPEED, name: '速度', icon: '⚡' },
    { id: GeneType.CRIT_RATE, name: '暴击', icon: '🎯' },
  ];

  return (
    <div>
      {/* Message Toast */}
      {message && (
        <div style={{
          position: 'absolute',
          top: '-40px',
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '8px 16px',
          borderRadius: '8px',
          background: message.type === 'success' ? 'rgba(34, 197, 94, 0.9)' : 'rgba(239, 68, 68, 0.9)',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: '12px',
          zIndex: 100,
          whiteSpace: 'nowrap',
        }}>
          {message.text}
        </div>
      )}

      {/* Total Stats */}
      <div style={{
        background: 'rgba(236, 72, 153, 0.1)',
        borderRadius: '8px',
        padding: '12px',
        marginBottom: '12px',
        border: '1px solid rgba(236, 72, 153, 0.2)',
      }}>
        <div style={{ color: '#ec4899', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>
          当前属性加成
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {Object.entries(totalStats).map(([type, value]) => {
            if (value <= 0) return null;
            const config = GENE_TYPE_CONFIG[type as GeneType];
            return (
              <div key={type} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '11px',
              }}>
                <span>{config.icon}</span>
                <span style={{ color: config.color }}>{config.name}</span>
                <span style={{ color: '#fff' }}>+{value}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Type Filter */}
      <div style={{
        display: 'flex',
        gap: '6px',
        marginBottom: '12px',
        overflowX: 'auto',
        paddingBottom: '4px',
      }}>
        {geneTypes.map(type => (
          <button
            key={type.id}
            onClick={() => setSelectedType(type.id)}
            style={{
              padding: '6px 12px',
              background: selectedType === type.id ? 'rgba(236, 72, 153, 0.3)' : 'rgba(255, 255, 255, 0.05)',
              border: selectedType === type.id ? '1px solid rgba(236, 72, 153, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              color: selectedType === type.id ? '#ec4899' : '#a1a1aa',
              fontSize: '12px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {type.icon} {type.name}
          </button>
        ))}
      </div>

      {/* Gene Nodes */}
      <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
        {filteredNodes.map(node => {
          const typeConfig = GENE_TYPE_CONFIG[node.type];
          const rarityConfig = GENE_RARITY_CONFIG[node.rarity];

          return (
            <div
              key={node.id}
              style={{
                padding: '12px',
                background: node.unlocked ? 'rgba(255, 255, 255, 0.03)' : 'rgba(100, 100, 100, 0.1)',
                borderRadius: '12px',
                marginBottom: '8px',
                border: `1px solid ${node.unlocked ? `${rarityConfig.color}40` : 'rgba(100, 100, 100, 0.2)'}`,
                opacity: node.unlocked ? 1 : 0.5,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '16px' }}>{typeConfig.icon}</span>
                  <span style={{ color: '#ffffff', fontWeight: 'bold', fontSize: '13px' }}>
                    {typeConfig.name}基因
                  </span>
                  <span style={{
                    color: rarityConfig.color,
                    fontSize: '10px',
                    padding: '2px 6px',
                    background: `${rarityConfig.color}20`,
                    borderRadius: '4px',
                  }}>
                    {rarityConfig.name}
                  </span>
                </div>
                <span style={{ color: '#ec4899', fontSize: '11px' }}>
                  Lv.{node.level}/{node.maxLevel}
                </span>
              </div>

              <div style={{ color: '#a1a1aa', fontSize: '11px', marginBottom: '8px' }}>
                当前加成: <span style={{ color: typeConfig.color }}>+{node.currentValue}</span> {typeConfig.name}
              </div>

              {/* Progress Bar */}
              <div style={{ marginBottom: '8px' }}>
                <div style={{
                  height: '4px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '2px',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%',
                    width: `${(node.level / node.maxLevel) * 100}%`,
                    background: `linear-gradient(90deg, ${typeConfig.color}, ${rarityConfig.color})`,
                    borderRadius: '2px',
                  }} />
                </div>
              </div>

              {node.unlocked ? (
                node.level < node.maxLevel ? (
                  <button
                    onClick={() => handleUpgrade(node.id)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      background: `linear-gradient(135deg, ${typeConfig.color}80, ${typeConfig.color}40)`,
                      border: 'none',
                      borderRadius: '6px',
                      color: '#fff',
                      fontWeight: 'bold',
                      fontSize: '11px',
                      cursor: 'pointer',
                    }}
                  >
                    升级
                  </button>
                ) : (
                  <div style={{
                    textAlign: 'center',
                    color: '#10b981',
                    fontSize: '11px',
                    padding: '8px',
                    background: 'rgba(16, 185, 129, 0.1)',
                    borderRadius: '6px',
                  }}>
                    ✅ 已满级
                  </div>
                )
              ) : (
                <div style={{
                  textAlign: 'center',
                  color: '#666',
                  fontSize: '11px',
                  padding: '8px',
                  background: 'rgba(100, 100, 100, 0.1)',
                  borderRadius: '6px',
                }}>
                  🔒 未解锁
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// 10. 机械飞升内容
function CyberneticContent() {
  const { gameManager, saveGame, craftImplant, upgradeImplant, equipImplant, unequipImplant, decomposeImplant, getImplantTotalStats } = useGameStore();
  const [activeTab, setActiveTab] = useState<'slots' | 'craft'>('slots');
  const [selectedImplant, setSelectedImplant] = useState<Implant | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const implants = gameManager.getImplants();
  const equippedImplants = gameManager.getEquippedImplants();
  const availableSlots = gameManager.getAvailableImplantSlots();
  const level = gameManager.getFacilityLevel(FacilityType.ARENA);

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 2000);
  };

  const handleCraft = async (rarity: ImplantRarity) => {
    const result = craftImplant(rarity);
    if (result.success) {
      showMessage(`成功制造${IMPLANT_RARITY_CONFIG[rarity].name}义体`, 'success');
      await saveGame();
    } else {
      showMessage(result.message, 'error');
    }
  };

  const handleUpgrade = async (implantId: string) => {
    const result = upgradeImplant(implantId);
    if (result.success) {
      showMessage(`升级到Lv.${result.newLevel}`, 'success');
      await saveGame();
    } else {
      showMessage(result.message, 'error');
    }
  };

  const handleEquip = async (implantId: string) => {
    const result = equipImplant(implantId);
    if (result.success) {
      showMessage(result.message, 'success');
      await saveGame();
    } else {
      showMessage(result.message, 'error');
    }
  };

  const handleUnequip = async (type: ImplantType) => {
    const result = unequipImplant(type);
    if (result.success) {
      showMessage(result.message, 'success');
      await saveGame();
    } else {
      showMessage(result.message, 'error');
    }
  };

  const handleDecompose = async (implantId: string) => {
    if (!confirm('确定要分解这个义体吗？')) return;
    const result = decomposeImplant(implantId);
    if (result.success) {
      showMessage(`分解成功，获得${result.rewards}`, 'success');
      setSelectedImplant(null);
      await saveGame();
    } else {
      showMessage(result.message, 'error');
    }
  };

  const getEquippedImplantForType = (type: ImplantType): Implant | undefined => {
    const implantId = gameManager.equippedImplants[type];
    return implants.find(i => i.id === implantId);
  };

  const totalStats = getImplantTotalStats();

  return (
    <div>
      {/* Message Toast */}
      {message && (
        <div style={{
          position: 'absolute',
          top: '-40px',
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '8px 16px',
          borderRadius: '8px',
          background: message.type === 'success' ? 'rgba(34, 197, 94, 0.9)' : 'rgba(239, 68, 68, 0.9)',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: '12px',
          zIndex: 100,
          whiteSpace: 'nowrap',
        }}>
          {message.text}
        </div>
      )}

      {/* Stats */}
      <div style={{
        background: 'rgba(168, 85, 247, 0.1)',
        borderRadius: '8px',
        padding: '12px',
        marginBottom: '12px',
        border: '1px solid rgba(168, 85, 247, 0.2)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
          <div>
            <span style={{ color: '#a1a1aa' }}>义体槽位: </span>
            <span style={{ color: '#a855f7', fontWeight: 'bold' }}>{equippedImplants.length}/{availableSlots.length}</span>
          </div>
          <div>
            <span style={{ color: '#a1a1aa' }}>义体数量: </span>
            <span style={{ color: '#a855f7', fontWeight: 'bold' }}>{implants.length}</span>
          </div>
        </div>
      </div>

      {/* Total Stats */}
      {Object.keys(totalStats).length > 0 && (
        <div style={{
          background: 'rgba(168, 85, 247, 0.1)',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '12px',
          border: '1px solid rgba(168, 85, 247, 0.2)',
        }}>
          <div style={{ color: '#a855f7', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>
            当前属性加成
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {Object.entries(totalStats).map(([stat, value]) => (
              <div key={stat} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '11px',
              }}>
                <span style={{ color: '#a855f7' }}>{stat}:</span>
                <span style={{ color: '#fff' }}>+{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Switcher */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '12px',
      }}>
        <button
          onClick={() => setActiveTab('slots')}
          style={{
            flex: 1,
            padding: '10px',
            background: activeTab === 'slots' ? 'rgba(168, 85, 247, 0.3)' : 'rgba(255, 255, 255, 0.05)',
            border: activeTab === 'slots' ? '1px solid rgba(168, 85, 247, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            color: activeTab === 'slots' ? '#a855f7' : '#a1a1aa',
            fontWeight: 'bold',
            fontSize: '12px',
            cursor: 'pointer',
          }}
        >
          🦾 义体槽位
        </button>
        <button
          onClick={() => setActiveTab('craft')}
          style={{
            flex: 1,
            padding: '10px',
            background: activeTab === 'craft' ? 'rgba(168, 85, 247, 0.3)' : 'rgba(255, 255, 255, 0.05)',
            border: activeTab === 'craft' ? '1px solid rgba(168, 85, 247, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            color: activeTab === 'craft' ? '#a855f7' : '#a1a1aa',
            fontWeight: 'bold',
            fontSize: '12px',
            cursor: 'pointer',
          }}
        >
          🔨 制造义体
        </button>
      </div>

      {/* Slots Tab */}
      {activeTab === 'slots' && (
        <div>
          {/* Implant Slots */}
          <div style={{ marginBottom: '12px' }}>
            {Object.values(ImplantType).map(type => {
              const equipped = getEquippedImplantForType(type);
              const isUnlocked = availableSlots.includes(type);
              const typeConfig = IMPLANT_TYPE_CONFIG[type];

              return (
                <div
                  key={type}
                  onClick={() => {
                    if (equipped) setSelectedImplant(equipped);
                  }}
                  style={{
                    padding: '12px',
                    background: isUnlocked ? 'rgba(168, 85, 247, 0.1)' : 'rgba(100, 100, 100, 0.1)',
                    borderRadius: '12px',
                    marginBottom: '8px',
                    border: equipped ? `2px solid ${IMPLANT_RARITY_CONFIG[equipped.rarity].color}` : '1px solid rgba(255, 255, 255, 0.1)',
                    opacity: isUnlocked ? 1 : 0.5,
                    cursor: equipped ? 'pointer' : 'default',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '16px' }}>{typeConfig.icon}</span>
                      <span style={{ color: '#ffffff', fontWeight: 'bold', fontSize: '13px' }}>{typeConfig.name}</span>
                    </div>
                    {equipped && (
                      <span style={{ color: IMPLANT_RARITY_CONFIG[equipped.rarity].color, fontSize: '11px' }}>
                        Lv.{equipped.level}
                      </span>
                    )}
                  </div>
                  {equipped ? (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ color: IMPLANT_RARITY_CONFIG[equipped.rarity].color, fontSize: '12px' }}>
                          {equipped.name}
                        </div>
                        <div style={{ color: '#a1a1aa', fontSize: '10px' }}>
                          {typeConfig.description}
                        </div>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleUnequip(type); }}
                        style={{
                          padding: '4px 8px',
                          background: 'rgba(239, 68, 68, 0.2)',
                          border: '1px solid rgba(239, 68, 68, 0.4)',
                          borderRadius: '4px',
                          color: '#f87171',
                          fontSize: '10px',
                          cursor: 'pointer',
                        }}
                      >
                        卸下
                      </button>
                    </div>
                  ) : (
                    <div style={{ color: isUnlocked ? '#666' : '#444', fontSize: '12px' }}>
                      {isUnlocked ? '空槽位' : `🔒 需要 Lv.${Object.values(ImplantType).indexOf(type) + 1} 解锁`}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Implant Inventory */}
          <div style={{ color: '#a1a1aa', fontSize: '12px', marginBottom: '8px' }}>
            📦 义体仓库 ({implants.filter(i => !Object.values(gameManager.equippedImplants).includes(i.id)).length})
          </div>
          <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
            {implants.filter(i => !Object.values(gameManager.equippedImplants).includes(i.id)).map(implant => {
              const typeConfig = IMPLANT_TYPE_CONFIG[implant.type];
              return (
                <div
                  key={implant.id}
                  onClick={() => setSelectedImplant(implant)}
                  style={{
                    padding: '10px',
                    background: selectedImplant?.id === implant.id ? 'rgba(168, 85, 247, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                    borderRadius: '8px',
                    marginBottom: '6px',
                    border: `1px solid ${selectedImplant?.id === implant.id ? IMPLANT_RARITY_CONFIG[implant.rarity].color : 'rgba(255, 255, 255, 0.08)'}`,
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '14px', marginRight: '6px' }}>{typeConfig.icon}</span>
                      <span style={{ color: IMPLANT_RARITY_CONFIG[implant.rarity].color, fontWeight: 'bold', fontSize: '12px' }}>
                        {implant.name}
                      </span>
                      <span style={{ color: '#a1a1aa', fontSize: '11px', marginLeft: '8px' }}>
                        Lv.{implant.level}
                      </span>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleEquip(implant.id); }}
                      style={{
                        padding: '4px 8px',
                        background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
                        border: 'none',
                        borderRadius: '4px',
                        color: '#fff',
                        fontSize: '10px',
                        cursor: 'pointer',
                      }}
                    >
                      装备
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Implant Actions */}
          {selectedImplant && (
            <div style={{
              marginTop: '12px',
              padding: '12px',
              background: 'rgba(168, 85, 247, 0.1)',
              borderRadius: '12px',
              border: '1px solid rgba(168, 85, 247, 0.3)',
            }}>
              <div style={{ color: IMPLANT_RARITY_CONFIG[selectedImplant.rarity].color, fontWeight: 'bold', marginBottom: '8px' }}>
                {selectedImplant.name} Lv.{selectedImplant.level}
              </div>
              <div style={{ color: '#a1a1aa', fontSize: '11px', marginBottom: '8px' }}>
                {selectedImplant.description}
              </div>
              <div style={{ color: '#a1a1aa', fontSize: '11px', marginBottom: '8px' }}>
                属性: {Object.entries(getImplantStats(selectedImplant)).map(([k, v]) => `${k}+${v}`).join(' / ')}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => handleUpgrade(selectedImplant.id)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
                    border: 'none',
                    borderRadius: '6px',
                    color: '#fff',
                    fontWeight: 'bold',
                    fontSize: '11px',
                    cursor: 'pointer',
                  }}
                >
                  升级
                </button>
                <button
                  onClick={() => handleDecompose(selectedImplant.id)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    background: 'rgba(239, 68, 68, 0.2)',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    borderRadius: '6px',
                    color: '#f87171',
                    fontWeight: 'bold',
                    fontSize: '11px',
                    cursor: 'pointer',
                  }}
                >
                  分解
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Craft Tab */}
      {activeTab === 'craft' && (
        <div>
          <div style={{ color: '#a1a1aa', fontSize: '12px', marginBottom: '8px' }}>
            选择品质制造义体
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {Object.values(ImplantRarity).map(rarity => {
              const rarityConfig = IMPLANT_RARITY_CONFIG[rarity];
              const costs = {
                [ImplantRarity.COMMON]: { credits: 500, materials: 5 },
                [ImplantRarity.UNCOMMON]: { credits: 1000, materials: 8 },
                [ImplantRarity.RARE]: { credits: 2000, materials: 12 },
                [ImplantRarity.EPIC]: { credits: 5000, materials: 20 },
                [ImplantRarity.LEGENDARY]: { credits: 10000, materials: 30 },
              };
              const cost = costs[rarity];

              return (
                <button
                  key={rarity}
                  onClick={() => handleCraft(rarity)}
                  style={{
                    padding: '12px',
                    background: `linear-gradient(135deg, ${rarityConfig.color}40, ${rarityConfig.color}20)`,
                    border: `1px solid ${rarityConfig.color}60`,
                    borderRadius: '12px',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ color: rarityConfig.color, fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>
                    {rarityConfig.name}义体
                  </div>
                  <div style={{ color: '#a1a1aa', fontSize: '11px' }}>
                    💰 {cost.credits}信用点 + 🔧 {cost.materials}义体材料
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// 11. 星际市场内容
function MarketContent() {
  const { gameManager, saveGame, getMarketListings, getPlayerListings, listMarketItem, cancelMarketListing, buyMarketItem, refreshMarket } = useGameStore();
  const [activeTab, setActiveTab] = useState<'buy' | 'sell' | 'my'>('buy');
  const [selectedItem, setSelectedItem] = useState<{ id: string; name: string; quantity: number } | null>(null);
  const [sellPrice, setSellPrice] = useState(100);
  const [sellQuantity, setSellQuantity] = useState(1);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const listings = getMarketListings();
  const myListings = getPlayerListings();
  const level = gameManager.getFacilityLevel(FacilityType.MARKET);

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 2000);
  };

  const handleBuy = async (listingId: string) => {
    const result = buyMarketItem(listingId);
    if (result.success) {
      showMessage(result.message, 'success');
      await saveGame();
    } else {
      showMessage(result.message, 'error');
    }
  };

  const handleSell = async () => {
    if (!selectedItem) return;
    const result = listMarketItem(selectedItem.id, sellQuantity, sellPrice);
    if (result.success) {
      showMessage('挂单成功', 'success');
      setSelectedItem(null);
      await saveGame();
    } else {
      showMessage(result.message, 'error');
    }
  };

  const handleCancel = async (listingId: string) => {
    const result = cancelMarketListing(listingId);
    if (result.success) {
      showMessage(result.message, 'success');
      await saveGame();
    } else {
      showMessage(result.message, 'error');
    }
  };

  const handleRefresh = async () => {
    const result = refreshMarket();
    showMessage(result.message, 'success');
    await saveGame();
  };

  const inventoryItems = gameManager.inventory.items.filter(i => i.quantity > 0);

  return (
    <div>
      {/* Message Toast */}
      {message && (
        <div style={{
          position: 'absolute',
          top: '-40px',
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '8px 16px',
          borderRadius: '8px',
          background: message.type === 'success' ? 'rgba(34, 197, 94, 0.9)' : 'rgba(239, 68, 68, 0.9)',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: '12px',
          zIndex: 100,
          whiteSpace: 'nowrap',
        }}>
          {message.text}
        </div>
      )}

      {/* Stats */}
      <div style={{
        background: 'rgba(236, 72, 153, 0.1)',
        borderRadius: '8px',
        padding: '12px',
        marginBottom: '12px',
        border: '1px solid rgba(236, 72, 153, 0.2)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
          <div>
            <span style={{ color: '#a1a1aa' }}>市场等级: </span>
            <span style={{ color: '#ec4899', fontWeight: 'bold' }}>Lv.{level}</span>
          </div>
          <div>
            <span style={{ color: '#a1a1aa' }}>我的挂单: </span>
            <span style={{ color: '#ec4899', fontWeight: 'bold' }}>{myListings.length}/10</span>
          </div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '12px',
      }}>
        <button
          onClick={() => setActiveTab('buy')}
          style={{
            flex: 1,
            padding: '10px',
            background: activeTab === 'buy' ? 'rgba(236, 72, 153, 0.3)' : 'rgba(255, 255, 255, 0.05)',
            border: activeTab === 'buy' ? '1px solid rgba(236, 72, 153, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            color: activeTab === 'buy' ? '#ec4899' : '#a1a1aa',
            fontWeight: 'bold',
            fontSize: '12px',
            cursor: 'pointer',
          }}
        >
          🛒 购买
        </button>
        <button
          onClick={() => setActiveTab('sell')}
          style={{
            flex: 1,
            padding: '10px',
            background: activeTab === 'sell' ? 'rgba(236, 72, 153, 0.3)' : 'rgba(255, 255, 255, 0.05)',
            border: activeTab === 'sell' ? '1px solid rgba(236, 72, 153, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            color: activeTab === 'sell' ? '#ec4899' : '#a1a1aa',
            fontWeight: 'bold',
            fontSize: '12px',
            cursor: 'pointer',
          }}
        >
          💰 出售
        </button>
        <button
          onClick={() => setActiveTab('my')}
          style={{
            flex: 1,
            padding: '10px',
            background: activeTab === 'my' ? 'rgba(236, 72, 153, 0.3)' : 'rgba(255, 255, 255, 0.05)',
            border: activeTab === 'my' ? '1px solid rgba(236, 72, 153, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            color: activeTab === 'my' ? '#ec4899' : '#a1a1aa',
            fontWeight: 'bold',
            fontSize: '12px',
            cursor: 'pointer',
          }}
        >
          📋 我的挂单
        </button>
      </div>

      {/* Buy Tab */}
      {activeTab === 'buy' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
            <button
              onClick={handleRefresh}
              style={{
                padding: '6px 12px',
                background: 'rgba(236, 72, 153, 0.2)',
                border: '1px solid rgba(236, 72, 153, 0.4)',
                borderRadius: '6px',
                color: '#ec4899',
                fontSize: '11px',
                cursor: 'pointer',
              }}
            >
              🔄 刷新市场
            </button>
          </div>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {listings.map(listing => {
              const typeConfig = MARKET_ITEM_TYPE_CONFIG[listing.itemType];
              const rarityConfig = MARKET_RARITY_CONFIG[listing.rarity];
              const totalPrice = listing.price * listing.quantity;

              return (
                <div
                  key={listing.id}
                  style={{
                    padding: '12px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: '12px',
                    marginBottom: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '16px' }}>{typeConfig.icon}</span>
                      <span style={{ color: rarityConfig.color, fontWeight: 'bold', fontSize: '13px' }}>
                        {listing.itemName}
                      </span>
                      <span style={{ color: '#a1a1aa', fontSize: '11px' }}>x{listing.quantity}</span>
                    </div>
                    <span style={{ color: '#fbbf24', fontSize: '12px', fontWeight: 'bold' }}>
                      💰 {totalPrice}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ color: '#a1a1aa', fontSize: '11px' }}>
                      卖家: {listing.seller} | 单价: {listing.price}
                    </div>
                    <button
                      onClick={() => handleBuy(listing.id)}
                      style={{
                        padding: '6px 12px',
                        background: 'linear-gradient(135deg, #ec4899, #db2777)',
                        border: 'none',
                        borderRadius: '6px',
                        color: '#fff',
                        fontSize: '11px',
                        cursor: 'pointer',
                      }}
                    >
                      购买
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sell Tab */}
      {activeTab === 'sell' && (
        <div>
          <div style={{ color: '#a1a1aa', fontSize: '12px', marginBottom: '8px' }}>
            选择要出售的物品
          </div>
          <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '12px' }}>
            {inventoryItems.map(item => (
              <div
                key={item.id}
                onClick={() => {
                  setSelectedItem({ id: item.id, name: item.name, quantity: item.quantity });
                  setSellQuantity(1);
                }}
                style={{
                  padding: '10px',
                  background: selectedItem?.id === item.id ? 'rgba(236, 72, 153, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '8px',
                  marginBottom: '6px',
                  border: `1px solid ${selectedItem?.id === item.id ? 'rgba(236, 72, 153, 0.5)' : 'rgba(255, 255, 255, 0.08)'}`,
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#fff', fontSize: '12px' }}>{item.name}</span>
                  <span style={{ color: '#a1a1aa', fontSize: '11px' }}>x{item.quantity}</span>
                </div>
              </div>
            ))}
          </div>

          {selectedItem && (
            <div style={{
              padding: '12px',
              background: 'rgba(236, 72, 153, 0.1)',
              borderRadius: '12px',
              border: '1px solid rgba(236, 72, 153, 0.3)',
            }}>
              <div style={{ color: '#ec4899', fontWeight: 'bold', marginBottom: '12px' }}>
                出售 {selectedItem.name}
              </div>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ color: '#a1a1aa', fontSize: '11px', marginBottom: '4px' }}>数量</div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button
                    onClick={() => setSellQuantity(Math.max(1, sellQuantity - 1))}
                    style={{
                      padding: '4px 8px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '4px',
                      color: '#fff',
                      cursor: 'pointer',
                    }}
                  >
                    -
                  </button>
                  <span style={{ color: '#fff', fontSize: '14px' }}>{sellQuantity}</span>
                  <button
                    onClick={() => setSellQuantity(Math.min(selectedItem.quantity, sellQuantity + 1))}
                    style={{
                      padding: '4px 8px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '4px',
                      color: '#fff',
                      cursor: 'pointer',
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ color: '#a1a1aa', fontSize: '11px', marginBottom: '4px' }}>单价</div>
                <input
                  type="number"
                  value={sellPrice}
                  onChange={(e) => setSellPrice(Math.max(1, parseInt(e.target.value) || 1))}
                  style={{
                    width: '100%',
                    padding: '8px',
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '14px',
                  }}
                />
              </div>
              <div style={{ color: '#a1a1aa', fontSize: '11px', marginBottom: '12px' }}>
                总价: <span style={{ color: '#fbbf24' }}>{sellPrice * sellQuantity}</span> 信用点
                (手续费: {Math.floor(sellPrice * sellQuantity * 0.05)})
              </div>
              <button
                onClick={handleSell}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: 'linear-gradient(135deg, #ec4899, #db2777)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                  fontWeight: 'bold',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                确认挂单
              </button>
            </div>
          )}
        </div>
      )}

      {/* My Listings Tab */}
      {activeTab === 'my' && (
        <div>
          {myListings.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '30px 20px',
              color: '#666',
            }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>📋</div>
              <div>暂无挂单</div>
            </div>
          ) : (
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {myListings.map(listing => {
                const typeConfig = MARKET_ITEM_TYPE_CONFIG[listing.itemType];
                const rarityConfig = MARKET_RARITY_CONFIG[listing.rarity];

                return (
                  <div
                    key={listing.id}
                    style={{
                      padding: '12px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: '12px',
                      marginBottom: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '16px' }}>{typeConfig.icon}</span>
                        <span style={{ color: rarityConfig.color, fontWeight: 'bold', fontSize: '13px' }}>
                          {listing.itemName}
                        </span>
                        <span style={{ color: '#a1a1aa', fontSize: '11px' }}>x{listing.quantity}</span>
                      </div>
                      <span style={{ color: '#fbbf24', fontSize: '12px' }}>
                        💰 {listing.price * listing.quantity}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ color: '#a1a1aa', fontSize: '11px' }}>
                        单价: {listing.price}
                      </div>
                      <button
                        onClick={() => handleCancel(listing.id)}
                        style={{
                          padding: '6px 12px',
                          background: 'rgba(239, 68, 68, 0.2)',
                          border: '1px solid rgba(239, 68, 68, 0.4)',
                          borderRadius: '6px',
                          color: '#f87171',
                          fontSize: '11px',
                          cursor: 'pointer',
                        }}
                      >
                        取消挂单
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// 12. 遗迹探索内容
function RuinsContent() {
  const { gameManager, saveGame, getRuins, getExploreMissions, startExplore, completeExplore, cancelExplore } = useGameStore();
  const [activeTab, setActiveTab] = useState<'ruins' | 'missions'>('ruins');
  const [selectedRuin, setSelectedRuin] = useState<Ruin | null>(null);
  const [selectedCrew, setSelectedCrew] = useState<string[]>([]);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const ruins = getRuins();
  const missions = getExploreMissions();
  const level = gameManager.getFacilityLevel(FacilityType.RUINS);
  const crewMembers = gameManager.getCrewMembers();

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 2000);
  };

  const handleStartExplore = async () => {
    if (!selectedRuin) return;
    const result = startExplore(selectedRuin.id, selectedCrew);
    if (result.success) {
      showMessage('探索已开始', 'success');
      setSelectedRuin(null);
      setSelectedCrew([]);
      await saveGame();
    } else {
      showMessage(result.message, 'error');
    }
  };

  const handleCompleteExplore = async (missionId: string) => {
    const result = completeExplore(missionId);
    if (result.success) {
      const rewardsText = result.rewards
        ? `获得 ${result.rewards.credits}信用点${result.rewards.items.length > 0 ? ' 和物品' : ''}`
        : '';
      showMessage(`${result.message} ${rewardsText}`, 'success');
      await saveGame();
    } else {
      showMessage(result.message, 'error');
    }
  };

  const handleCancelExplore = async (missionId: string) => {
    const result = cancelExplore(missionId);
    if (result.success) {
      showMessage(result.message, 'success');
      await saveGame();
    } else {
      showMessage(result.message, 'error');
    }
  };

  const toggleCrewSelection = (crewId: string) => {
    if (selectedCrew.includes(crewId)) {
      setSelectedCrew(selectedCrew.filter(id => id !== crewId));
    } else {
      setSelectedCrew([...selectedCrew, crewId]);
    }
  };

  const getCrewPower = () => {
    return selectedCrew.reduce((total, id) => {
      const crew = crewMembers.find(c => c.id === id);
      return total + (crew?.stats.attack || 0) + (crew?.stats.defense || 0);
    }, 0);
  };

  const isCrewAvailable = (crewId: string) => {
    return !missions.some(m => m.status === 'ongoing' && m.crewIds.includes(crewId));
  };

  return (
    <div>
      {/* Message Toast */}
      {message && (
        <div style={{
          position: 'absolute',
          top: '-40px',
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '8px 16px',
          borderRadius: '8px',
          background: message.type === 'success' ? 'rgba(34, 197, 94, 0.9)' : 'rgba(239, 68, 68, 0.9)',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: '12px',
          zIndex: 100,
          whiteSpace: 'nowrap',
        }}>
          {message.text}
        </div>
      )}

      {/* Stats */}
      <div style={{
        background: 'rgba(245, 158, 11, 0.1)',
        borderRadius: '8px',
        padding: '12px',
        marginBottom: '12px',
        border: '1px solid rgba(245, 158, 11, 0.2)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
          <div>
            <span style={{ color: '#a1a1aa' }}>探索等级: </span>
            <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>Lv.{level}</span>
          </div>
          <div>
            <span style={{ color: '#a1a1aa' }}>进行中: </span>
            <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>{missions.filter(m => m.status === 'ongoing').length}</span>
          </div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '12px',
      }}>
        <button
          onClick={() => setActiveTab('ruins')}
          style={{
            flex: 1,
            padding: '10px',
            background: activeTab === 'ruins' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(255, 255, 255, 0.05)',
            border: activeTab === 'ruins' ? '1px solid rgba(245, 158, 11, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            color: activeTab === 'ruins' ? '#f59e0b' : '#a1a1aa',
            fontWeight: 'bold',
            fontSize: '12px',
            cursor: 'pointer',
          }}
        >
          🏛️ 遗迹列表
        </button>
        <button
          onClick={() => setActiveTab('missions')}
          style={{
            flex: 1,
            padding: '10px',
            background: activeTab === 'missions' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(255, 255, 255, 0.05)',
            border: activeTab === 'missions' ? '1px solid rgba(245, 158, 11, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            color: activeTab === 'missions' ? '#f59e0b' : '#a1a1aa',
            fontWeight: 'bold',
            fontSize: '12px',
            cursor: 'pointer',
          }}
        >
          ⏱️ 探索任务
        </button>
      </div>

      {/* Ruins Tab */}
      {activeTab === 'ruins' && (
        <div>
          <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '12px' }}>
            {ruins.map(ruin => {
              const typeConfig = RUIN_TYPE_CONFIG[ruin.type];
              const difficultyConfig = RUIN_DIFFICULTY_CONFIG[ruin.difficulty];

              return (
                <div
                  key={ruin.id}
                  onClick={() => ruin.status === ExploreStatus.AVAILABLE && setSelectedRuin(ruin)}
                  style={{
                    padding: '12px',
                    background: selectedRuin?.id === ruin.id ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                    borderRadius: '12px',
                    marginBottom: '8px',
                    border: `1px solid ${selectedRuin?.id === ruin.id ? 'rgba(245, 158, 11, 0.5)' : 'rgba(255, 255, 255, 0.08)'}`,
                    cursor: ruin.status === ExploreStatus.AVAILABLE ? 'pointer' : 'default',
                    opacity: ruin.status === ExploreStatus.EXPLORING ? 0.6 : 1,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '16px' }}>{typeConfig.icon}</span>
                      <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '13px' }}>{ruin.name}</span>
                    </div>
                    <span style={{ color: difficultyConfig.color, fontSize: '11px' }}>
                      {difficultyConfig.name}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ color: '#a1a1aa', fontSize: '11px' }}>
                      {ruin.description.slice(0, 20)}...
                    </div>
                    <div style={{ color: '#fbbf24', fontSize: '11px' }}>
                      {ruin.status === ExploreStatus.EXPLORING ? '探索中' : `已完成${ruin.completedCount}次`}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Ruin Detail */}
          {selectedRuin && (
            <div style={{
              padding: '12px',
              background: 'rgba(245, 158, 11, 0.1)',
              borderRadius: '12px',
              border: '1px solid rgba(245, 158, 11, 0.3)',
            }}>
              <div style={{ color: '#f59e0b', fontWeight: 'bold', marginBottom: '8px' }}>
                {selectedRuin.name}
              </div>
              <div style={{ color: '#a1a1aa', fontSize: '11px', marginBottom: '8px' }}>
                {selectedRuin.description}
              </div>
              <div style={{ color: '#a1a1aa', fontSize: '11px', marginBottom: '8px' }}>
                探索时长: {formatExploreTime(selectedRuin.duration)}
              </div>
              <div style={{ color: '#a1a1aa', fontSize: '11px', marginBottom: '12px' }}>
                奖励: {selectedRuin.rewards.credits}信用点 + {selectedRuin.rewards.items.map(i => i.itemId).join(', ')}
              </div>

              {/* Crew Selection */}
              <div style={{ color: '#f59e0b', fontSize: '12px', marginBottom: '8px' }}>
                选择船员 ({selectedCrew.length}/4)
              </div>
              <div style={{ maxHeight: '120px', overflowY: 'auto', marginBottom: '12px' }}>
                {crewMembers.slice(0, 8).map(crew => {
                  const available = isCrewAvailable(crew.id);
                  const selected = selectedCrew.includes(crew.id);

                  return (
                    <div
                      key={crew.id}
                      onClick={() => available && toggleCrewSelection(crew.id)}
                      style={{
                        padding: '8px',
                        background: selected ? 'rgba(245, 158, 11, 0.3)' : 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '6px',
                        marginBottom: '4px',
                        border: `1px solid ${selected ? 'rgba(245, 158, 11, 0.5)' : 'rgba(255, 255, 255, 0.1)'}`,
                        cursor: available ? 'pointer' : 'not-allowed',
                        opacity: available ? 1 : 0.5,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <span style={{ color: '#fff', fontSize: '11px' }}>{crew.name}</span>
                      <span style={{ color: '#a1a1aa', fontSize: '10px' }}>
                        攻:{crew.stats.attack} 防:{crew.stats.defense}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Success Rate */}
              {selectedCrew.length > 0 && (
                <div style={{ color: '#a1a1aa', fontSize: '11px', marginBottom: '12px' }}>
                  成功率: <span style={{ color: '#22c55e' }}>{calculateExploreSuccess(getCrewPower(), selectedRuin.difficulty).toFixed(1)}%</span>
                </div>
              )}

              <button
                onClick={handleStartExplore}
                disabled={selectedCrew.length === 0}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: selectedCrew.length > 0 ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'rgba(100, 100, 100, 0.3)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                  fontWeight: 'bold',
                  fontSize: '12px',
                  cursor: selectedCrew.length > 0 ? 'pointer' : 'not-allowed',
                }}
              >
                开始探索
              </button>
            </div>
          )}
        </div>
      )}

      {/* Missions Tab */}
      {activeTab === 'missions' && (
        <div>
          {missions.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '30px 20px',
              color: '#666',
            }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>⏱️</div>
              <div>暂无探索任务</div>
            </div>
          ) : (
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {missions.map(mission => {
                const ruin = ruins.find(r => r.id === mission.ruinId);
                const typeConfig = ruin ? RUIN_TYPE_CONFIG[ruin.type] : null;
                const remaining = getRemainingExploreTime(mission);
                const isComplete = remaining === 0;

                return (
                  <div
                    key={mission.id}
                    style={{
                      padding: '12px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: '12px',
                      marginBottom: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '16px' }}>{typeConfig?.icon || '🏛️'}</span>
                        <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '13px' }}>
                          {ruin?.name || '未知遗迹'}
                        </span>
                      </div>
                      <span style={{
                        color: isComplete ? '#22c55e' : '#f59e0b',
                        fontSize: '11px',
                        fontWeight: 'bold',
                      }}>
                        {isComplete ? '已完成' : formatExploreTime(remaining)}
                      </span>
                    </div>
                    <div style={{ color: '#a1a1aa', fontSize: '11px', marginBottom: '8px' }}>
                      派遣船员: {mission.crewIds.length}人
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {isComplete ? (
                        <button
                          onClick={() => handleCompleteExplore(mission.id)}
                          style={{
                            flex: 1,
                            padding: '8px',
                            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                            border: 'none',
                            borderRadius: '6px',
                            color: '#fff',
                            fontWeight: 'bold',
                            fontSize: '11px',
                            cursor: 'pointer',
                          }}
                        >
                          领取奖励
                        </button>
                      ) : (
                        <button
                          onClick={() => handleCancelExplore(mission.id)}
                          style={{
                            flex: 1,
                            padding: '8px',
                            background: 'rgba(239, 68, 68, 0.2)',
                            border: '1px solid rgba(239, 68, 68, 0.4)',
                            borderRadius: '6px',
                            color: '#f87171',
                            fontWeight: 'bold',
                            fontSize: '11px',
                            cursor: 'pointer',
                          }}
                        >
                          取消探索
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// 锁定功能内容
function LockedContent({ facility }: { facility: BaseFacility }) {
  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}>{facility.icon}</div>
      <h3 style={{ color: '#6b7280', marginBottom: '8px' }}>{facility.name}</h3>
      <p style={{ color: '#71717a', fontSize: '14px', marginBottom: '16px' }}>
        {facility.description}
      </p>
      <div style={{
        background: 'rgba(107, 114, 128, 0.2)',
        borderRadius: '12px',
        padding: '12px',
        color: '#a1a1aa',
        fontSize: '12px',
        border: '1px solid rgba(107, 114, 128, 0.3)',
      }}>
        🔒 该功能将在后续版本开放
      </div>
    </div>
  );
}
