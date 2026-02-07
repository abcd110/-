import { useState, useMemo } from 'react';
import { useGameStore } from '../stores/gameStore';
import { ItemType, ItemRarity, RARITY_COLORS, TYPE_NAMES } from '../data/types';
import type { InventoryItem } from '../data/types';
import type { EquipmentInstance } from '../core/EquipmentSystem';
import { EquipmentSlot } from '../data/equipmentTypes';

// 补充分解预览类型定义，替代any，提升类型安全性
interface DecomposePreview {
  success: boolean;
  preview: {
    rarity: string;
    isMythic: boolean;
    reward: {
      icon: string;
      name: string;
      quantity: number;
    };
  };
}

interface DecomposeScreenProps {
  onBack: () => void;
}

interface DecomposableItem {
  id: string;
  name: string;
  type: ItemType;
  rarity: ItemRarity;
  sublimationLevel?: number;
  isMythic: boolean;
  isCrafted: boolean;
  originalItem: InventoryItem | EquipmentInstance;
}

export default function DecomposeScreen({ onBack }: DecomposeScreenProps) {
  const { getInventory, decomposeItem, getDecomposePreview } = useGameStore();
  const [selectedItem, setSelectedItem] = useState<DecomposableItem | null>(null);
  // 替换any为具体类型DecomposePreview['preview']
  const [preview, setPreview] = useState<DecomposePreview['preview'] | null>(null);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const decomposableItems = useMemo(() => {
    const inventory = getInventory();
    const items: DecomposableItem[] = [];
    const canDecomposeTypes = [ItemType.WEAPON, ItemType.ARMOR, ItemType.ACCESSORY];

    // 空值判断保持不变，保证代码健壮性
    if (inventory?.items && Array.isArray(inventory.items)) {
      inventory.items.forEach((item: InventoryItem) => {
        if (canDecomposeTypes.includes(item.type) && !item.equipped) {
          items.push({
            id: item.id,
            name: item.name,
            type: item.type,
            rarity: item.rarity,
            sublimationLevel: item.sublimationLevel,
            isMythic: false,
            isCrafted: true,
            originalItem: item,
          });
        }
      });
    }

    if (inventory?.equipment && Array.isArray(inventory.equipment)) {
      inventory.equipment.forEach((equip: EquipmentInstance) => {
        if (!equip.equipped) {
          let mappedType: ItemType;
          switch (equip.slot) {
            case EquipmentSlot.WEAPON:
              mappedType = ItemType.WEAPON;
              break;
            case EquipmentSlot.HEAD:
            case EquipmentSlot.BODY:
            case EquipmentSlot.LEGS:
            case EquipmentSlot.FEET:
              mappedType = ItemType.ARMOR;
              break;
            case EquipmentSlot.ACCESSORY:
              mappedType = ItemType.ACCESSORY;
              break;
            default:
              mappedType = ItemType.WEAPON;
          }
          items.push({
            id: equip.instanceId,
            name: equip.name,
            type: mappedType,
            rarity: equip.rarity,
            sublimationLevel: equip.sublimationLevel,
            isMythic: equip.rarity === ItemRarity.MYTHIC,
            isCrafted: equip.isCrafted || false,
            originalItem: equip,
          });
        }
      });
    }

    // 修复：缺失return，导致无可用分解物品
    return items;
  }, [getInventory, refreshKey]);

  const handleSelectItem = (item: DecomposableItem) => {
    // 修复：拼写错误etResult → setResult
    setResult(null);
    // 修复：核心缺失逻辑，选中物品时更新selectedItem状态
    setSelectedItem(item);

    // 补充类型断言，匹配方法返回值类型
    const previewResult = getDecomposePreview(item.id) as DecomposePreview;
    if (previewResult.success) {
      setPreview(previewResult.preview);
    } else {
      setPreview(null);
    }
  };

  const handleDecompose = () => {
    if (!selectedItem) return;

    // 修复：拼写错误onst → const
    const decomposeResult = decomposeItem(selectedItem.id);
    setResult(decomposeResult);

    if (decomposeResult.success) {
      setSelectedItem(null);
      setPreview(null);
      // 修复：核心缺失逻辑，分解成功后刷新物品列表
      setRefreshKey(prev => prev + 1);
    }
  };

  const getRarityColor = (rarity: ItemRarity) => {
    return RARITY_COLORS[rarity] || '#9ca3af';
  };

  const getTypeIcon = (type: ItemType) => {
    // 修复：语法错误（多余冒号、缺失逗号、乱码），补充ARMOR图标
    const icons: Record<ItemType, string> = {
      [ItemType.WEAPON]: '⚔️',
      [ItemType.ARMOR]: '🛡️', // 补充盔甲类型图标，匹配装备类型
      [ItemType.ACCESSORY]: '💍',
      [ItemType.CONSUMABLE]: '🧪',
      [ItemType.MATERIAL]: '⚙️',
    };
    return icons[type] || '📦';
  };

  return (
    <div style={{
      height: '100vh',
      backgroundColor: '#0a0e27',
      display: 'flex',
      flexDirection: 'column'
      // 修复：缺失闭合大括号
    }}>
      <header style={{
        padding: '12px 16px',
        borderBottom: '1px solid #2a3050',
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
          <h1 style={{ color: 'white', fontWeight: 'bold', fontSize: '18px' }}>装备分解</h1>
          <div style={{ width: '48px' }} />
        </div>
      </header>

      <main style={{
        flex: 1, // 补充：让主容器占满剩余高度
        display: 'flex', // 修复：核心布局缺失，左右分栏需要flex布局
        overflow: 'hidden'
      }}>
        <div style={{
          width: '50%',
          borderRight: '1px solid #374151',
          // 修复：拼写错误splay → display
          display: 'flex',
          flexDirection: 'column'
          // 修复：缺失闭合大括号
        }}>
          <div style={{
            padding: '12px 16px',
            backgroundColor: '#262626',
            borderBottom: '1px solid #374151'
            // 修复：缺失闭合大括号
          }}>
            <h2 style={{ color: '#e5e7eb', fontSize: '14px', fontWeight: 600 }}>
              可分解装备 ({decomposableItems.length})
            </h2>
            <p style={{ color: '#a1a1aa', fontSize: '12px', marginTop: '4px' }}>
              选择装备进行分解，获得精炼碎片或神话碎片
            </p>
          </div>

          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '8px'
          }}>
            {decomposableItems.length === 0 ? (
              <div style={{
                textAlign: 'center',
                color: '#6b7280',
                padding: '40px 16px'
              }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>📦</div>
                <p>背包中没有可分解的装备</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {decomposableItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelectItem(item)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px',
                      backgroundColor: selectedItem?.id === item.id ? '#374151' : '#262626',
                      border: `1px solid ${selectedItem?.id === item.id ? '#2a3050' : 'transparent'}`,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s'
                    }}
                  >
                    <span style={{ fontSize: '24px' }}>{getTypeIcon(item.type)}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        color: getRarityColor(item.rarity),
                        fontWeight: 600,
                        fontSize: '14px'
                      }}>
                        {item.name}
                      </div>
                      <div style={{
                        color: '#a1a1aa',
                        fontSize: '12px',
                        marginTop: '2px'
                      }}>
                        {TYPE_NAMES[item.type]} · {item.isCrafted ? '制造' : '神话'}
                      </div>
                    </div>
                    {item.isMythic && (
                      <span style={{ fontSize: '12px', color: '#ef4444' }}>神话</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={{
          width: '50%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#1f1f1f'
        }}>
          <div style={{
            padding: '12px 16px',
            backgroundColor: '#262626',
            borderBottom: '1px solid #374151'
          }}>
            <h2 style={{ color: '#e5e7eb', fontSize: '14px', fontWeight: 600 }}>
              分解预览
            </h2>
          </div>

          <div style={{
            flex: 1,
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            overflowY: 'auto'
          }}>
            {!selectedItem ? (
              <div style={{
                textAlign: 'center',
                color: '#6b7280',
                padding: '60px 16px'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
                <p>从左侧选择要分解的装备</p>
                <p style={{ fontSize: '12px', marginTop: '8px' }}>
                  普通装备分解为精炼碎片<br />
                  神话装备分解为神话碎片
                </p>
              </div>
            ) : preview ? (
              <>
                <div style={{
                  backgroundColor: '#262626',
                  borderRadius: '12px',
                  padding: '16px',
                  border: `1px solid ${getRarityColor(selectedItem.rarity)}`
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '12px'
                  }}>
                    <span style={{ fontSize: '32px' }}>{getTypeIcon(selectedItem.type)}</span>
                    <div>
                      <div style={{
                        color: getRarityColor(selectedItem.rarity),
                        fontWeight: 700,
                        fontSize: '16px'
                      }}>
                        {selectedItem.name}
                      </div>
                      <div style={{ color: '#a1a1aa', fontSize: '12px' }}>
                        {preview.rarity} · {TYPE_NAMES[selectedItem.type]}
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{
                  backgroundColor: '#262626',
                  borderRadius: '12px',
                  padding: '16px'
                }}>
                  <h3 style={{ color: '#e5e7eb', fontSize: '14px', marginBottom: '12px' }}>
                    分解产出
                  </h3>

                  {preview.reward && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '16px',
                      backgroundColor: '#1f1f1f',
                      borderRadius: '8px',
                      border: `2px solid ${preview.isMythic ? '#ef4444' : '#3b82f6'}`
                    }}>
                      <span style={{ fontSize: '40px' }}>{preview.reward.icon}</span>
                      <div>
                        <div style={{
                          color: preview.isMythic ? '#ef4444' : '#3b82f6',
                          fontWeight: 700,
                          fontSize: '16px'
                        }}>
                          {preview.reward.name}
                        </div>
                        <div style={{ color: '#e5e7eb', fontSize: '20px', fontWeight: 700 }}>
                          x{preview.reward.quantity}
                        </div>
                      </div>
                    </div>
                  )}

                  <div style={{
                    marginTop: '12px',
                    padding: '12px',
                    backgroundColor: '#1f1f1f',
                    borderRadius: '8px'
                  }}>
                    <p style={{ color: '#a1a1aa', fontSize: '12px' }}>
                      {preview.isMythic ? (
                        <>
                          🔴 <strong>神话装备分解</strong><br />
                          分解后可获得神话碎片
                        </>
                      ) : (
                        <>
                          🔷 <strong>普通装备分解</strong><br />
                          分解后可获得精炼碎片
                        </>
                      )}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleDecompose}
                  style={{
                    width: '100%',
                    padding: '16px',
                    backgroundColor: preview.isMythic ? '#dc2626' : '#2563eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = preview.isMythic ? '#b91c1c' : '#1d4ed8';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = preview.isMythic ? '#dc2626' : '#2563eb';
                  }}
                >
                  {preview.isMythic ? '🔴 分解神话装备' : '🔷 分解装备'}
                </button>
              </>
            ) : (
              <div style={{ textAlign: 'center', color: '#ef4444', padding: '40px' }}>
                无法分解此装备
              </div>
            )}

            {result && (
              <div style={{
                padding: '16px',
                backgroundColor: result.success ? '#064e3b' : '#7f1d1d',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <p style={{
                  color: result.success ? '#34d399' : '#f87171',
                  fontWeight: 600
                }}>
                  {result.success ? '✓' : '✗'} {result.message}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}