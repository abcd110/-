import { useState, useEffect } from 'react';
import { useGameStore } from '../stores/gameStore';
import { ItemType, ItemRarity, TYPE_NAMES } from '../data/types';
import type { InventoryItem } from '../data/types';
import type { EquipmentInstance } from '../core/EquipmentSystem';
import { EquipmentSlot } from '../data/equipmentTypes';
import { calculateEquipmentStats } from '../core/EquipmentStatCalculator';
import 货舱背景 from '../assets/images/货舱背景.jpg';

interface InventoryScreenProps {
  onBack: () => void;
  onNavigate?: (screen: string) => void;
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

const RARITY_COLORS_MAP: Record<ItemRarity, string> = {
  [ItemRarity.COMMON]: '#9ca3af',
  [ItemRarity.UNCOMMON]: '#4ade80',
  [ItemRarity.RARE]: '#60a5fa',
  [ItemRarity.EPIC]: '#c084fc',
  [ItemRarity.LEGENDARY]: '#00d4ff',
  [ItemRarity.MYTHIC]: '#f87171',
};

const RARITY_BORDERS: Record<ItemRarity, string> = {
  [ItemRarity.COMMON]: '#2a3050',
  [ItemRarity.UNCOMMON]: '#16a34a',
  [ItemRarity.RARE]: '#2563eb',
  [ItemRarity.EPIC]: '#9333ea',
  [ItemRarity.LEGENDARY]: '#0099cc',
  [ItemRarity.MYTHIC]: '#dc2626',
};

const SLOT_ICONS: Record<EquipmentSlot, string> = {
  [EquipmentSlot.HEAD]: '头',
  [EquipmentSlot.BODY]: '甲',
  [EquipmentSlot.LEGS]: '腿',
  [EquipmentSlot.FEET]: '靴',
  [EquipmentSlot.WEAPON]: '武',
  [EquipmentSlot.ACCESSORY]: '饰',
  [EquipmentSlot.SHOULDER]: '肩',
  [EquipmentSlot.ARM]: '臂',
};

// 品质配置
const QUALITY_CONFIG: Record<string, { name: string; color: string; borderWidth: string; boxShadow: string }> = {
  '星尘级': {
    name: '星尘',
    color: '#9ca3af',
    borderWidth: '0px',
    boxShadow: 'inset 0 0 10px rgba(156, 163, 175, 0.2)',
  },
  '合金级': {
    name: '合金',
    color: '#4ade80',
    borderWidth: '1px',
    boxShadow: 'inset 0 0 8px rgba(74, 222, 128, 0.3), 0 0 5px rgba(74, 222, 128, 0.2)',
  },
  '晶核级': {
    name: '晶核',
    color: '#60a5fa',
    borderWidth: '2px',
    boxShadow: 'inset 0 0 12px rgba(96, 165, 250, 0.4), 0 0 8px rgba(96, 165, 250, 0.3)',
  },
  '量子级': {
    name: '量子',
    color: '#c084fc',
    borderWidth: '2px',
    boxShadow: 'inset 0 0 15px rgba(192, 132, 252, 0.5), 0 0 10px rgba(192, 132, 252, 0.4)',
  },
  '虚空级': {
    name: '虚空',
    color: '#f59e0b',
    borderWidth: '3px',
    boxShadow: 'inset 0 0 20px rgba(245, 158, 11, 0.6), 0 0 15px rgba(245, 158, 11, 0.5), 0 0 30px rgba(245, 158, 11, 0.2)',
  },
};

// 提取装备名称（移除品质前缀或括号内的品质标记）
function extractEquipmentName(fullName: string): { quality: string; name: string } {
  // 检查前缀格式：星尘级/合金级/晶核级/量子级/虚空级
  const qualityPrefixes = ['星尘级', '合金级', '晶核级', '量子级', '虚空级'];
  for (const prefix of qualityPrefixes) {
    if (fullName.startsWith(prefix)) {
      return { quality: prefix, name: fullName.slice(prefix.length) };
    }
  }

  // 检查括号格式：(星尘)/(合金)/(晶核)/(量子)/(虚空)
  const bracketMatch = fullName.match(/\((星尘|合金|晶核|量子|虚空)\)$/);
  if (bracketMatch) {
    const qualityMap: Record<string, string> = {
      '星尘': '星尘级',
      '合金': '合金级',
      '晶核': '晶核级',
      '量子': '量子级',
      '虚空': '虚空级',
    };
    const quality = qualityMap[bracketMatch[1]] || '';
    const name = fullName.slice(0, fullName.length - bracketMatch[0].length);
    return { quality, name };
  }

  return { quality: '', name: fullName };
}

// 合并后的分类
const CATEGORIES = [
  { id: 'all', label: '全部' },
  { id: 'equipment', label: '装备' },
  { id: 'consumable', label: '消耗品' },
  { id: 'material', label: '材料' },
  { id: 'misc', label: '道具' },
];

export default function InventoryScreen({ onBack, onNavigate }: InventoryScreenProps) {
  const { gameManager, useItem, equipItem, unequipItem, sublimateItem, getEnhancePreview, saveGame } = useGameStore();
  const inventory = gameManager.inventory;
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentInstance | null>(null);
  const [showEnhancePreview, setShowEnhancePreview] = useState(false);
  const [enhancePreview, setEnhancePreview] = useState<ReturnType<typeof getEnhancePreview> | null>(null);

  // 根据分类筛选物品
  const filteredItems = inventory.items.filter(item => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'consumable') {
      return item.type === ItemType.CONSUMABLE;
    }
    if (selectedCategory === 'material') {
      return item.type === ItemType.MATERIAL;
    }
    if (selectedCategory === 'misc') {
      return item.type === ItemType.SPECIAL || item.type === ItemType.SKILL_BOOK;
    }
    return false;
  });

  // 获取所有装备
  const filteredEquipment = selectedCategory === 'all' || selectedCategory === 'equipment'
    ? inventory.equipment
    : [];

  // 计算空格子数量
  const totalItems = inventory.items.length + inventory.equipment.length;
  const emptySlots = Math.max(0, inventory.maxSlots - totalItems);

  const handleItemAction = async (action: string, quantity?: number) => {
    if (!selectedItem) return;

    if (action === 'use') {
      useItem(selectedItem.id);
      setSelectedItem(null);
    } else if (action === 'equip') {
      await equipItem(selectedItem.id);
      setSelectedItem(null);
    } else if (action === 'unequip') {
      await unequipItem(selectedItem.id);
      setSelectedItem(null);
    } else if (action === 'discard') {
      const discardCount = quantity || 1;
      inventory.removeItem(selectedItem.id, discardCount);
      await saveGame();
      setSelectedItem(null);
    } else if (action === 'sublimate') {
      if (onNavigate) {
        onNavigate('sublimation');
      } else {
        await sublimateItem(selectedItem.id);
      }
      setSelectedItem(null);
    } else if (action === 'enhance') {
      const preview = getEnhancePreview(selectedItem.id);
      setEnhancePreview(preview);
      setShowEnhancePreview(true);
    }
  };

  const isEquipment = (item: InventoryItem) => {
    return item.type === ItemType.WEAPON || item.type === ItemType.ARMOR || item.type === ItemType.ACCESSORY;
  };

  const isConsumable = (item: InventoryItem) => {
    return item.type === ItemType.CONSUMABLE;
  };

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
        backgroundImage: `url(${货舱背景})`,
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
      <header style={{
        flexShrink: 0,
        position: 'relative',
        zIndex: 10,
        background: 'rgba(0, 20, 40, 0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(0, 212, 255, 0.3)',
        padding: '12px 16px',
        boxShadow: '0 0 20px rgba(0, 212, 255, 0.1)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            onClick={onBack}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: '#a1a1aa',
              background: 'rgba(0, 212, 255, 0.1)',
              border: '1px solid rgba(0, 212, 255, 0.3)',
              borderRadius: '8px',
              padding: '8px 12px',
              cursor: 'pointer',
              fontSize: '14px',
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
            <span>返回</span>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{
              color: '#00d4ff',
              fontWeight: 'bold',
              fontSize: '18px',
              textShadow: '0 0 10px rgba(0, 212, 255, 0.5)',
            }}>
              货舱
            </h1>
            <span style={{
              color: '#a1a1aa',
              fontSize: '14px',
              background: 'rgba(0, 0, 0, 0.5)',
              padding: '2px 8px',
              borderRadius: '4px',
              border: '1px solid rgba(0, 212, 255, 0.2)',
            }}>
              {inventory.usedSlots}/{inventory.maxSlots}
            </span>
          </div>
          <div style={{ width: '70px' }} />
        </div>
      </header>

      {/* 分类标签 - 科幻风格 */}
      <section style={{
        flexShrink: 0,
        position: 'relative',
        zIndex: 10,
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        padding: '12px 16px',
        background: 'rgba(0, 10, 20, 0.7)',
        borderBottom: '1px solid rgba(0, 212, 255, 0.2)',
      }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '14px',
              whiteSpace: 'nowrap',
              background: selectedCategory === cat.id
                ? 'linear-gradient(135deg, rgba(0, 212, 255, 0.3), rgba(124, 58, 237, 0.3))'
                : 'rgba(255, 255, 255, 0.05)',
              color: selectedCategory === cat.id ? '#00d4ff' : '#9ca3af',
              border: selectedCategory === cat.id
                ? '1px solid rgba(0, 212, 255, 0.6)'
                : '1px solid rgba(255, 255, 255, 0.1)',
              cursor: 'pointer',
              fontWeight: selectedCategory === cat.id ? 'bold' : 'normal',
              boxShadow: selectedCategory === cat.id
                ? '0 0 15px rgba(0, 212, 255, 0.3)'
                : 'none',
              transition: 'all 0.3s ease',
            }}
          >
            {cat.label}
          </button>
        ))}
      </section>

      {/* 物品格子区域 - 可滚动 */}
      <main style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px 12px 80px 12px',
        position: 'relative',
        zIndex: 10,
      }}>
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
          {/* 普通物品 */}
          {filteredItems.map((item, index) => (
            <ItemSlot
              key={`${item.id}-${index}`}
              item={item}
              onClick={() => setSelectedItem(item)}
            />
          ))}
          {/* 神话装备 */}
          {filteredEquipment.map((equipment) => (
            <EquipmentSlotComponent
              key={equipment.instanceId}
              equipment={equipment}
              onClick={() => setSelectedEquipment(equipment)}
            />
          ))}
          {/* 空格子 */}
          {Array.from({ length: Math.min(emptySlots, 10) }).map((_, index) => (
            <EmptySlot key={`empty-${index}`} />
          ))}
        </section>

        {filteredItems.length === 0 && filteredEquipment.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '48px 0',
            color: '#6b7280',
          }}>
            <div style={{
              fontSize: '48px',
              marginBottom: '8px',
              opacity: 0.5,
            }}>📦</div>
            <p>货舱是空的</p>
          </div>
        )}
      </main>

      {/* 物品详情弹窗 */}
      {selectedItem && !showEnhancePreview && (
        <ItemDetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onAction={handleItemAction}
          isEquipment={isEquipment(selectedItem)}
          isConsumable={isConsumable(selectedItem)}
        />
      )}

      {/* 装备详情弹窗 */}
      {selectedEquipment && (
        <EquipmentDetailModal
          equipment={selectedEquipment}
          onClose={() => setSelectedEquipment(null)}
          onEquip={() => {
            if (onNavigate) {
              onNavigate('player');
            }
            setSelectedEquipment(null);
          }}
        />
      )}

      {/* 强化预览弹窗 */}
      {showEnhancePreview && selectedItem && enhancePreview && (
        <EnhancePreviewModal
          item={selectedItem}
          preview={enhancePreview}
          onClose={() => {
            setShowEnhancePreview(false);
            setEnhancePreview(null);
          }}
          onGoToEnhance={() => {
            setShowEnhancePreview(false);
            setSelectedItem(null);
          }}
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

// 物品格子 - 科幻风格
function ItemSlot({ item, onClick }: { item: InventoryItem; onClick: () => void }) {
  const { quality: itemQuality } = extractEquipmentName(item.name);
  const qualityConfig = itemQuality ? QUALITY_CONFIG[itemQuality] : null;
  const rarityColor = qualityConfig ? qualityConfig.color : RARITY_COLORS_MAP[item.rarity];
  const borderColor = qualityConfig ? qualityConfig.color : RARITY_BORDERS[item.rarity];

  return (
    <button
      onClick={onClick}
      style={{
        aspectRatio: '1',
        background: 'rgba(0, 20, 40, 0.7)',
        border: `2px solid ${borderColor}`,
        borderRadius: '10px',
        padding: '4px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        cursor: 'pointer',
        boxShadow: `0 0 10px ${borderColor}20`,
        transition: 'all 0.3s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 0 20px ${borderColor}50`;
        e.currentTarget.style.transform = 'scale(1.05)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = `0 0 10px ${borderColor}20`;
        e.currentTarget.style.transform = 'scale(1)';
      }}
    >
      {/* 物品名称 */}
      <span style={{
        fontSize: '10px',
        color: rarityColor,
        textAlign: 'center',
        lineHeight: '1.2',
        maxHeight: '28px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        padding: '0 2px',
        textShadow: `0 0 5px ${rarityColor}50`,
      }}>
        {item.name}
      </span>

      {/* 数量 - 右下角 */}
      {item.quantity > 1 && (
        <span style={{
          position: 'absolute',
          bottom: '2px',
          right: '4px',
          fontSize: '10px',
          color: 'white',
          fontWeight: 'bold',
          background: 'rgba(0, 0, 0, 0.7)',
          padding: '1px 4px',
          borderRadius: '4px',
          minWidth: '16px',
          textAlign: 'center',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        }}>
          {item.quantity}
        </span>
      )}

      {/* 已装备标记 */}
      {item.equipped && (
        <span style={{
          position: 'absolute',
          top: '2px',
          left: '2px',
          fontSize: '10px',
          color: '#4ade80',
          textShadow: '0 0 5px #4ade80',
        }}>✓</span>
      )}

      {/* 升华等级 */}
      {item.sublimationLevel > 0 && (
        <span style={{
          position: 'absolute',
          top: '2px',
          right: '2px',
          fontSize: '9px',
          color: '#00d4ff',
          fontWeight: 'bold',
          textShadow: '0 0 5px #00d4ff',
        }}>
          +{item.sublimationLevel}
        </span>
      )}
    </button>
  );
}

// 神话装备格子
function EquipmentSlotComponent({ equipment, onClick }: { equipment: EquipmentInstance; onClick: () => void }) {
  const { quality, name } = extractEquipmentName(equipment.name);
  const qualityConfig = quality ? QUALITY_CONFIG[quality] : null;
  const borderColor = qualityConfig ? qualityConfig.color : RARITY_BORDERS[equipment.rarity];
  const borderWidth = qualityConfig ? qualityConfig.borderWidth : '2px';
  const boxShadow = qualityConfig ? qualityConfig.boxShadow : 'none';
  const fullDisplayName = quality ? `${quality}${name}` : equipment.name;

  return (
    <button
      onClick={onClick}
      style={{
        aspectRatio: '1',
        background: 'rgba(0, 20, 40, 0.7)',
        border: `${borderWidth} solid ${borderColor}`,
        borderRadius: '10px',
        padding: '4px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        cursor: 'pointer',
        boxShadow: `${boxShadow}, 0 0 15px ${borderColor}30`,
        transition: 'all 0.3s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `${boxShadow}, 0 0 25px ${borderColor}60`;
        e.currentTarget.style.transform = 'scale(1.05)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = `${boxShadow}, 0 0 15px ${borderColor}30`;
        e.currentTarget.style.transform = 'scale(1)';
      }}
    >
      {/* 装备名称 */}
      <span style={{
        fontSize: '9px',
        color: borderColor,
        textAlign: 'center',
        fontWeight: 'bold',
        lineHeight: '1.2',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        padding: '0 1px',
        wordBreak: 'break-all',
        width: '100%',
        textShadow: `0 0 5px ${borderColor}50`,
      }}>
        {fullDisplayName}
      </span>

      {/* 已装备标记 */}
      {equipment.equipped && (
        <span style={{
          position: 'absolute',
          top: '2px',
          right: '2px',
          fontSize: '10px',
          color: '#4ade80',
          textShadow: '0 0 5px #4ade80',
        }}>✓</span>
      )}
    </button>
  );
}

// 空格子 - 科幻风格
function EmptySlot() {
  return (
    <div style={{
      aspectRatio: '1',
      background: 'rgba(0, 20, 40, 0.3)',
      border: '2px dashed rgba(0, 212, 255, 0.2)',
      borderRadius: '10px',
    }} />
  );
}

// 物品详情弹窗 - 科幻风格
function ItemDetailModal({
  item,
  onClose,
  onAction,
  isEquipment,
  isConsumable,
}: {
  item: InventoryItem;
  onClose: () => void;
  onAction: (action: string, quantity?: number) => Promise<void>;
  isEquipment: boolean;
  isConsumable: boolean;
}) {
  const rarityColor = RARITY_COLORS_MAP[item.rarity];
  const [discardQuantity, setDiscardQuantity] = useState(1);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

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
        maxWidth: '340px',
        border: '1px solid rgba(0, 212, 255, 0.4)',
        boxShadow: '0 0 40px rgba(0, 212, 255, 0.2), inset 0 0 40px rgba(0, 212, 255, 0.05)',
        overflow: 'hidden',
      }}>
        {/* 头部 */}
        <div style={{
          padding: '16px',
          borderBottom: '1px solid rgba(0, 212, 255, 0.2)',
          background: 'linear-gradient(180deg, rgba(0, 212, 255, 0.1), transparent)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                background: 'rgba(0, 0, 0, 0.5)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
                border: `2px solid ${rarityColor}`,
                boxShadow: `0 0 15px ${rarityColor}50`,
              }}>
                {TYPE_NAMES[item.type][0]}
              </div>
              <div>
                <h2 style={{
                  color: rarityColor,
                  fontWeight: 'bold',
                  fontSize: '16px',
                  margin: 0,
                  textShadow: `0 0 10px ${rarityColor}50`,
                }}>
                  {item.name}
                </h2>
                <p style={{ color: '#a1a1aa', fontSize: '12px', margin: '4px 0 0 0' }}>{TYPE_NAMES[item.type]}</p>
                {item.sublimationLevel > 0 && (
                  <p style={{ color: '#00d4ff', fontSize: '12px', margin: '4px 0 0 0', textShadow: '0 0 5px #00d4ff' }}>
                    升华等级: +{item.sublimationLevel}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                color: '#a1a1aa',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                width: '32px',
                height: '32px',
                fontSize: '16px',
                cursor: 'pointer',
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* 详情内容 */}
        <div style={{ padding: '16px', maxHeight: '50vh', overflowY: 'auto' }}>
          <p style={{ color: '#d1d5db', fontSize: '14px', marginBottom: '16px' }}>{item.description}</p>

          <div style={{
            background: 'rgba(0, 0, 0, 0.4)',
            borderRadius: '12px',
            padding: '12px',
            marginBottom: '16px',
            border: '1px solid rgba(0, 212, 255, 0.2)',
          }}>
            <h4 style={{ color: '#00d4ff', fontSize: '12px', marginBottom: '8px' }}>物品属性</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '14px' }}>
              {item.attack !== undefined && item.attack > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#a1a1aa' }}>攻击力</span>
                  <span style={{ color: '#f87171' }}>+{item.attack}</span>
                </div>
              )}
              {item.defense !== undefined && item.defense > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#a1a1aa' }}>防御力</span>
                  <span style={{ color: '#60a5fa' }}>+{item.defense}</span>
                </div>
              )}
              {item.agility !== undefined && item.agility > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#a1a1aa' }}>敏捷</span>
                  <span style={{ color: '#4ade80' }}>+{item.agility}</span>
                </div>
              )}
              {item.speed !== undefined && item.speed > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#a1a1aa' }}>攻速</span>
                  <span style={{ color: '#00d4ff' }}>+{item.speed}</span>
                </div>
              )}
              {item.maxHp !== undefined && item.maxHp > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#a1a1aa' }}>生命值</span>
                  <span style={{ color: '#f87171' }}>+{item.maxHp}</span>
                </div>
              )}
              {item.healHp !== undefined && item.healHp > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#a1a1aa' }}>恢复生命</span>
                  <span style={{ color: '#4ade80' }}>+{item.healHp}</span>
                </div>
              )}
              {item.healStamina !== undefined && item.healStamina > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#a1a1aa' }}>恢复体力</span>
                  <span style={{ color: '#00d4ff' }}>+{item.healStamina}</span>
                </div>
              )}
              {item.healHunger !== undefined && item.healHunger > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#a1a1aa' }}>恢复能量储备</span>
                  <span style={{ color: '#fb923c' }}>+{item.healHunger}</span>
                </div>
              )}
              {item.healThirst !== undefined && item.healThirst > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#a1a1aa' }}>恢复冷却液水平</span>
                  <span style={{ color: '#60a5fa' }}>+{item.healThirst}</span>
                </div>
              )}
            </div>
          </div>

          <div style={{
            textAlign: 'center',
            color: '#a1a1aa',
            fontSize: '14px',
            marginBottom: '16px',
            background: 'rgba(0, 0, 0, 0.3)',
            padding: '8px',
            borderRadius: '8px',
          }}>
            数量: <span style={{ color: '#00d4ff', fontWeight: 'bold' }}>{item.quantity}</span>
          </div>
        </div>

        {/* 操作按钮 */}
        <div style={{
          padding: '16px',
          borderTop: '1px solid rgba(0, 212, 255, 0.2)',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '8px',
          background: 'linear-gradient(0deg, rgba(0, 212, 255, 0.05), transparent)',
        }}>
          {isConsumable && (
            <SciFiButton
              onClick={() => onAction('use')}
              label="使用"
              variant="success"
            />
          )}

          {isEquipment && (
            <>
              {item.equipped ? (
                <SciFiButton
                  onClick={async () => await onAction('unequip')}
                  label="卸下"
                  variant="default"
                />
              ) : (
                <SciFiButton
                  onClick={async () => await onAction('equip')}
                  label="装备"
                  variant="primary"
                />
              )}
              <SciFiButton
                onClick={async () => await onAction('sublimate')}
                label="升华"
                variant="secondary"
              />
              <SciFiButton
                onClick={() => onAction('enhance')}
                label="强化"
                variant="info"
              />
            </>
          )}

          <SciFiButton
            onClick={() => {
              if (item.quantity > 1) {
                setShowDiscardConfirm(true);
              } else {
                onAction('discard', 1);
              }
            }}
            label="丢弃"
            variant="danger"
          />

          <SciFiButton
            onClick={onClose}
            label="关闭"
            variant="default"
          />
        </div>

        {/* 丢弃数量选择弹窗 */}
        {showDiscardConfirm && (
          <DiscardConfirmModal
            item={item}
            discardQuantity={discardQuantity}
            setDiscardQuantity={setDiscardQuantity}
            onCancel={() => setShowDiscardConfirm(false)}
            onConfirm={() => {
              onAction('discard', discardQuantity);
              setShowDiscardConfirm(false);
            }}
          />
        )}
      </div>
    </div>
  );
}

// 科幻风格按钮组件
function SciFiButton({
  onClick,
  label,
  variant = 'default'
}: {
  onClick: () => void;
  label: string;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'info' | 'default';
}) {
  const variantStyles = {
    primary: {
      background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.3), rgba(0, 212, 255, 0.1))',
      border: '1px solid rgba(0, 212, 255, 0.6)',
      color: '#00d4ff',
      shadow: '0 0 15px rgba(0, 212, 255, 0.3)',
    },
    secondary: {
      background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.3), rgba(124, 58, 237, 0.1))',
      border: '1px solid rgba(124, 58, 237, 0.6)',
      color: '#c084fc',
      shadow: '0 0 15px rgba(124, 58, 237, 0.3)',
    },
    success: {
      background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.3), rgba(34, 197, 94, 0.1))',
      border: '1px solid rgba(34, 197, 94, 0.6)',
      color: '#4ade80',
      shadow: '0 0 15px rgba(34, 197, 94, 0.3)',
    },
    danger: {
      background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.3), rgba(239, 68, 68, 0.1))',
      border: '1px solid rgba(239, 68, 68, 0.6)',
      color: '#f87171',
      shadow: '0 0 15px rgba(239, 68, 68, 0.3)',
    },
    info: {
      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(59, 130, 246, 0.1))',
      border: '1px solid rgba(59, 130, 246, 0.6)',
      color: '#60a5fa',
      shadow: '0 0 15px rgba(59, 130, 246, 0.3)',
    },
    default: {
      background: 'rgba(255, 255, 255, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      color: '#d1d5db',
      shadow: 'none',
    },
  };

  const style = variantStyles[variant];

  return (
    <button
      onClick={onClick}
      style={{
        padding: '12px',
        background: style.background,
        color: style.color,
        fontWeight: 'bold',
        borderRadius: '8px',
        border: style.border,
        cursor: 'pointer',
        boxShadow: style.shadow,
        transition: 'all 0.3s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = style.shadow.replace('0.3', '0.5');
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = style.shadow;
      }}
    >
      {label}
    </button>
  );
}

// 丢弃确认弹窗
function DiscardConfirmModal({
  item,
  discardQuantity,
  setDiscardQuantity,
  onCancel,
  onConfirm,
}: {
  item: InventoryItem;
  discardQuantity: number;
  setDiscardQuantity: (q: number) => void;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '16px',
    }}>
      <div style={{
        background: 'rgba(0, 20, 40, 0.95)',
        borderRadius: '12px',
        padding: '20px',
        width: '80%',
        maxWidth: '280px',
        border: '1px solid rgba(239, 68, 68, 0.4)',
        boxShadow: '0 0 30px rgba(239, 68, 68, 0.2)',
      }}>
        <h3 style={{ color: '#f87171', fontSize: '16px', margin: '0 0 16px 0', textAlign: 'center' }}>
          选择丢弃数量
        </h3>
        <div style={{ color: '#a1a1aa', fontSize: '14px', textAlign: 'center', marginBottom: '16px' }}>
          拥有: <span style={{ color: '#00d4ff', fontWeight: 'bold' }}>{item.quantity}</span>
        </div>

        {/* 数量选择 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '20px' }}>
          <button
            onClick={() => setDiscardQuantity(Math.max(1, discardQuantity - 1))}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              border: '1px solid rgba(0, 212, 255, 0.4)',
              background: 'rgba(0, 212, 255, 0.1)',
              color: '#00d4ff',
              fontSize: '18px',
              cursor: 'pointer',
            }}
          >
            -
          </button>
          <input
            type="number"
            value={discardQuantity}
            onChange={(e) => {
              const val = parseInt(e.target.value) || 1;
              setDiscardQuantity(Math.max(1, Math.min(item.quantity, val)));
            }}
            style={{
              width: '60px',
              height: '36px',
              textAlign: 'center',
              background: 'rgba(0, 0, 0, 0.5)',
              border: '1px solid rgba(0, 212, 255, 0.4)',
              borderRadius: '8px',
              color: '#00d4ff',
              fontSize: '16px',
              fontWeight: 'bold',
            }}
          />
          <button
            onClick={() => setDiscardQuantity(Math.min(item.quantity, discardQuantity + 1))}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              border: '1px solid rgba(0, 212, 255, 0.4)',
              background: 'rgba(0, 212, 255, 0.1)',
              color: '#00d4ff',
              fontSize: '18px',
              cursor: 'pointer',
            }}
          >
            +
          </button>
        </div>

        {/* 快捷按钮 */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <button
            onClick={() => setDiscardQuantity(1)}
            style={{
              flex: 1,
              padding: '8px',
              background: discardQuantity === 1 ? 'rgba(0, 212, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)',
              color: discardQuantity === 1 ? '#00d4ff' : '#d1d5db',
              border: discardQuantity === 1 ? '1px solid rgba(0, 212, 255, 0.6)' : '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '6px',
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            1个
          </button>
          <button
            onClick={() => setDiscardQuantity(Math.floor(item.quantity / 2))}
            style={{
              flex: 1,
              padding: '8px',
              background: discardQuantity === Math.floor(item.quantity / 2) ? 'rgba(0, 212, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)',
              color: discardQuantity === Math.floor(item.quantity / 2) ? '#00d4ff' : '#d1d5db',
              border: discardQuantity === Math.floor(item.quantity / 2) ? '1px solid rgba(0, 212, 255, 0.6)' : '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '6px',
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            一半
          </button>
          <button
            onClick={() => setDiscardQuantity(item.quantity)}
            style={{
              flex: 1,
              padding: '8px',
              background: discardQuantity === item.quantity ? 'rgba(239, 68, 68, 0.3)' : 'rgba(255, 255, 255, 0.1)',
              color: discardQuantity === item.quantity ? '#f87171' : '#d1d5db',
              border: discardQuantity === item.quantity ? '1px solid rgba(239, 68, 68, 0.6)' : '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '6px',
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            全部
          </button>
        </div>

        {/* 确认按钮 */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <SciFiButton onClick={onCancel} label="取消" variant="default" />
          <SciFiButton onClick={onConfirm} label="确认丢弃" variant="danger" />
        </div>
      </div>
    </div>
  );
}

// 强化预览弹窗
interface EnhancePreviewData {
  canEnhance: boolean;
  reason?: string;
  currentLevel: number;
  targetLevel: number;
  successRate: number;
  stoneCost: number;
  hasEnoughStones: boolean;
  goldCost: number;
  hasEnoughGold: boolean;
  failureDowngrade: boolean;
  attributePreview: {
    attack: { current: number; after: number };
    defense: { current: number; after: number };
    speed: { current: number; after: number };
    maxHp: { current: number; after: number };
  };
}

function EnhancePreviewModal({
  item,
  preview,
  onClose,
  onGoToEnhance,
}: {
  item: InventoryItem;
  preview: EnhancePreviewData;
  onClose: () => void;
  onGoToEnhance: () => void;
}) {
  const rarityColor = RARITY_COLORS_MAP[item.rarity];
  const getSuccessRateColor = (rate: number) => {
    if (rate >= 0.8) return '#4ade80';
    if (rate >= 0.6) return '#00d4ff';
    if (rate >= 0.4) return '#fb923c';
    return '#ef4444';
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
        maxWidth: '340px',
        border: '1px solid rgba(0, 212, 255, 0.4)',
        boxShadow: '0 0 40px rgba(0, 212, 255, 0.2)',
        overflow: 'hidden',
      }}>
        {/* 头部 */}
        <div style={{
          padding: '16px',
          borderBottom: '1px solid rgba(0, 212, 255, 0.2)',
          background: 'linear-gradient(180deg, rgba(0, 212, 255, 0.1), transparent)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ color: '#00d4ff', fontWeight: 'bold', fontSize: '16px', margin: 0, textShadow: '0 0 10px rgba(0, 212, 255, 0.5)' }}>
              强化预览
            </h2>
            <button
              onClick={onClose}
              style={{
                color: '#a1a1aa',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                width: '32px',
                height: '32px',
                fontSize: '16px',
                cursor: 'pointer',
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* 内容 */}
        <div style={{ padding: '16px' }}>
          {preview.canEnhance ? (
            <>
              {/* 装备信息 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'rgba(0, 0, 0, 0.5)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  border: `2px solid ${rarityColor}`,
                  boxShadow: `0 0 15px ${rarityColor}50`,
                }}>
                  {TYPE_NAMES[item.type][0]}
                </div>
                <div>
                  <p style={{ color: rarityColor, fontWeight: 'bold', fontSize: '14px', margin: 0, textShadow: `0 0 5px ${rarityColor}50` }}>
                    {item.name}
                  </p>
                  <p style={{ color: '#00d4ff', fontSize: '13px', margin: '4px 0 0 0', textShadow: '0 0 5px #00d4ff' }}>
                    当前 +{preview.currentLevel} → 目标 +{preview.targetLevel}
                  </p>
                </div>
              </div>

              {/* 成功率 */}
              <div style={{
                background: 'rgba(0, 0, 0, 0.4)',
                borderRadius: '12px',
                padding: '12px',
                marginBottom: '12px',
                border: '1px solid rgba(0, 212, 255, 0.2)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#a1a1aa', fontSize: '13px' }}>成功率</span>
                  <span style={{
                    color: getSuccessRateColor(preview.successRate),
                    fontWeight: 'bold',
                    fontSize: '16px',
                    textShadow: `0 0 10px ${getSuccessRateColor(preview.successRate)}50`,
                  }}>
                    {Math.round(preview.successRate * 100)}%
                  </span>
                </div>
                <div style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '9999px',
                  height: '6px',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%',
                    backgroundColor: getSuccessRateColor(preview.successRate),
                    width: `${preview.successRate * 100}%`,
                    boxShadow: `0 0 10px ${getSuccessRateColor(preview.successRate)}`,
                  }} />
                </div>
              </div>

              {/* 属性变化 */}
              <div style={{
                background: 'rgba(0, 0, 0, 0.4)',
                borderRadius: '12px',
                padding: '12px',
                marginBottom: '12px',
                border: '1px solid rgba(0, 212, 255, 0.2)',
              }}>
                <p style={{ color: '#00d4ff', fontSize: '12px', marginBottom: '8px' }}>属性提升</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '12px' }}>
                  {preview.attributePreview.attack.after > preview.attributePreview.attack.current && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#a1a1aa' }}>攻击</span>
                      <span style={{ color: '#4ade80' }}>+{preview.attributePreview.attack.after - preview.attributePreview.attack.current}</span>
                    </div>
                  )}
                  {preview.attributePreview.defense.after > preview.attributePreview.defense.current && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#a1a1aa' }}>防御</span>
                      <span style={{ color: '#4ade80' }}>+{preview.attributePreview.defense.after - preview.attributePreview.defense.current}</span>
                    </div>
                  )}
                  {preview.attributePreview.speed.after > preview.attributePreview.speed.current && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#a1a1aa' }}>攻速</span>
                      <span style={{ color: '#4ade80' }}>+{preview.attributePreview.speed.after - preview.attributePreview.speed.current}</span>
                    </div>
                  )}
                  {preview.attributePreview.maxHp.after > preview.attributePreview.maxHp.current && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#a1a1aa' }}>生命</span>
                      <span style={{ color: '#4ade80' }}>+{preview.attributePreview.maxHp.after - preview.attributePreview.maxHp.current}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 消耗材料 */}
              <div style={{
                background: 'rgba(0, 0, 0, 0.4)',
                borderRadius: '12px',
                padding: '12px',
                marginBottom: '12px',
                border: '1px solid rgba(0, 212, 255, 0.2)',
              }}>
                <p style={{ color: '#00d4ff', fontSize: '12px', marginBottom: '8px' }}>所需材料</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#d1d5db' }}>强化石</span>
                    <span style={{ color: preview.hasEnoughStones ? '#4ade80' : '#ef4444' }}>
                      x{preview.stoneCost}
                    </span>
                  </div>
                </div>
              </div>

              {preview.failureDowngrade && (
                <p style={{ color: '#ef4444', fontSize: '12px', textAlign: 'center', marginBottom: '12px', textShadow: '0 0 5px #ef4444' }}>
                  ⚠️ 强化失败将降低1级
                </p>
              )}

              <SciFiButton onClick={onGoToEnhance} label="前往强化" variant="primary" />
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <p style={{ color: '#a1a1aa', fontSize: '14px' }}>{preview.reason || '无法强化'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// 装备详情弹窗
function EquipmentDetailModal({
  equipment,
  onClose,
  onEquip,
}: {
  equipment: EquipmentInstance;
  onClose: () => void;
  onEquip: () => void;
}) {
  const rarityColor = RARITY_COLORS_MAP[equipment.rarity];

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
        maxWidth: '340px',
        border: `2px solid ${rarityColor}`,
        boxShadow: `0 0 40px ${rarityColor}30, inset 0 0 40px ${rarityColor}10`,
        overflow: 'hidden',
      }}>
        {/* 头部 */}
        <div style={{
          padding: '16px',
          borderBottom: `1px solid ${rarityColor}50`,
          background: `linear-gradient(180deg, ${rarityColor}20, transparent)`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                background: 'rgba(0, 0, 0, 0.5)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
                border: `2px solid ${rarityColor}`,
                boxShadow: `0 0 15px ${rarityColor}50`,
              }}>
                {SLOT_ICONS[equipment.slot]}
              </div>
              <div>
                <h2 style={{
                  color: rarityColor,
                  fontWeight: 'bold',
                  fontSize: '16px',
                  margin: 0,
                  textShadow: `0 0 10px ${rarityColor}50`,
                }}>
                  {equipment.name}
                </h2>
                <p style={{ color: '#a1a1aa', fontSize: '12px', margin: '4px 0 0 0' }}>
                  星球{equipment.stationNumber} · 强化+{equipment.enhanceLevel}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                color: '#a1a1aa',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                width: '32px',
                height: '32px',
                fontSize: '16px',
                cursor: 'pointer',
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* 详情内容 */}
        <div style={{ padding: '16px', maxHeight: '50vh', overflowY: 'auto' }}>
          <p style={{ color: '#d1d5db', fontSize: '14px', marginBottom: '16px' }}>{equipment.description}</p>

          <div style={{
            background: 'rgba(0, 0, 0, 0.4)',
            borderRadius: '12px',
            padding: '12px',
            marginBottom: '16px',
            border: '1px solid rgba(0, 212, 255, 0.2)',
          }}>
            <h4 style={{ color: '#00d4ff', fontSize: '12px', marginBottom: '8px' }}>基础属性</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '14px' }}>
              {(() => {
                const stats = calculateEquipmentStats(equipment);
                const items = [];
                if (stats.attack > 0) {
                  items.push(
                    <div key="attack" style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#a1a1aa' }}>攻击力</span>
                      <span style={{ color: '#f87171' }}>{stats.attack}</span>
                    </div>
                  );
                }
                if (stats.defense > 0) {
                  items.push(
                    <div key="defense" style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#a1a1aa' }}>防御力</span>
                      <span style={{ color: '#60a5fa' }}>{stats.defense}</span>
                    </div>
                  );
                }
                if (stats.hp > 0) {
                  items.push(
                    <div key="hp" style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#a1a1aa' }}>生命值</span>
                      <span style={{ color: '#ef4444' }}>{stats.hp}</span>
                    </div>
                  );
                }
                if (stats.hit > 0) {
                  items.push(
                    <div key="hit" style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#a1a1aa' }}>命中</span>
                      <span style={{ color: '#00d4ff' }}>{stats.hit}</span>
                    </div>
                  );
                }
                if (stats.dodge > 0) {
                  items.push(
                    <div key="dodge" style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#a1a1aa' }}>闪避</span>
                      <span style={{ color: '#4ade80' }}>{stats.dodge}</span>
                    </div>
                  );
                }
                if (stats.speed > 0) {
                  items.push(
                    <div key="speed" style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#a1a1aa' }}>攻速</span>
                      <span style={{ color: '#c084fc' }}>{stats.speed.toFixed(1)}</span>
                    </div>
                  );
                }
                return items;
              })()}
            </div>
          </div>

          {equipment.effects.length > 0 && (
            <div style={{
              background: 'rgba(0, 0, 0, 0.4)',
              borderRadius: '12px',
              padding: '12px',
              marginBottom: '16px',
              border: '1px solid rgba(124, 58, 237, 0.3)',
            }}>
              <h4 style={{ color: '#c084fc', fontSize: '12px', marginBottom: '8px' }}>特殊效果</h4>
              {equipment.effects.map((effect, index) => (
                <div key={index} style={{ marginBottom: '4px', fontSize: '12px' }}>
                  <span style={{ color: '#d1d5db' }}>{effect.description}</span>
                  <span style={{ color: '#a1a1aa', marginLeft: '8px' }}>({effect.chance * 100}%)</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 操作按钮 */}
        <div style={{
          padding: '16px',
          borderTop: `1px solid ${rarityColor}30`,
          display: 'flex',
          gap: '8px',
          background: `linear-gradient(0deg, ${rarityColor}10, transparent)`,
        }}>
          <SciFiButton onClick={onEquip} label="去装备" variant="primary" />
          <SciFiButton onClick={onClose} label="关闭" variant="default" />
        </div>
      </div>
    </div>
  );
}
