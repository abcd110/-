import { useState } from 'react';
import { useGameStore } from '../stores/gameStore';
import { EquipmentSlot, EffectTrigger } from '../data/equipmentTypes';
import { EquipmentInstance } from '../core/EquipmentSystem';
import { getSetBonus } from '../data/mythologyEquipmentIndex';
import { ItemType } from '../data/types';
import type { InventoryItem } from '../data/types';
import { calculateEquipmentStats } from '../core/EquipmentStatCalculator';

interface PlayerScreenProps {
  onBack: () => void;
}

const SLOT_ICONS: Record<EquipmentSlot, string> = {
  [EquipmentSlot.HEAD]: '头',
  [EquipmentSlot.BODY]: '甲',
  [EquipmentSlot.LEGS]: '腿',
  [EquipmentSlot.FEET]: '靴',
  [EquipmentSlot.WEAPON]: '武',
  [EquipmentSlot.ACCESSORY]: '饰',
};

const SLOT_NAMES: Record<EquipmentSlot, string> = {
  [EquipmentSlot.HEAD]: '头盔',
  [EquipmentSlot.BODY]: '护甲',
  [EquipmentSlot.LEGS]: '护腿',
  [EquipmentSlot.FEET]: '战靴',
  [EquipmentSlot.WEAPON]: '武器',
  [EquipmentSlot.ACCESSORY]: '饰品',
};

// 旧装备类型映射到新装备槽位
const ITEM_TYPE_TO_SLOT: Record<string, EquipmentSlot> = {
  [ItemType.WEAPON]: EquipmentSlot.WEAPON,
  [ItemType.ARMOR]: EquipmentSlot.BODY,
  [ItemType.ACCESSORY]: EquipmentSlot.ACCESSORY,
};

const RARITY_COLORS = {
  common: '#9ca3af',
  uncommon: '#4ade80',
  rare: '#60a5fa',
  epic: '#c084fc',
  legendary: '#fbbf24',
  mythic: '#f87171',
};

export default function PlayerScreen({ onBack }: PlayerScreenProps) {
  const { gameManager, saveGame } = useGameStore();
  const player = gameManager.player;
  const [selectedItem, setSelectedItem] = useState<EquipmentInstance | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<EquipmentSlot | null>(null);
  const [showBackpack, setShowBackpack] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // 获取已装备的物品
  const equippedItems = player.equippedItems;

  // 获取背包中的装备
  const backpackEquipment = gameManager.inventory.equipment;

  // 计算套装效果
  const setBonuses = getSetBonus(equippedItems.map(item => item.id));

  // 强制刷新
  const forceRefresh = () => setRefreshKey(prev => prev + 1);

  // 处理装备槽位点击
  const handleSlotClick = (slot: EquipmentSlot, item: EquipmentInstance | undefined) => {
    console.log('handleSlotClick, slot:', slot, 'item:', item, 'item.stats:', item?.stats);
    if (item) {
      // 已装备，显示详情
      setSelectedItem(item);
      setSelectedSlot(slot);
    } else {
      // 未装备，打开背包选择
      setSelectedSlot(slot);
      setShowBackpack(true);
    }
  };

  // 从背包装备
  const handleEquipFromBackpack = async (equipment: EquipmentInstance) => {
    console.log('handleEquipFromBackpack START, equipment.stats.speed:', equipment.stats.speed, 'instanceId:', equipment.instanceId);
    if (selectedSlot) {
      // 从背包移除
      gameManager.inventory.removeEquipment(equipment.instanceId);
      console.log('After removeEquipment, equipment.stats.speed:', equipment.stats.speed);

      // 卸下该槽位已有装备（如果有）
      const existing = player.getEquipmentBySlot(selectedSlot);
      console.log('existing equipment:', existing?.name, 'existing.stats.speed:', existing?.stats.speed);

      if (existing) {
        player.unequipMythologyItem(selectedSlot);
        console.log('After unequip, existing.stats.speed:', existing.stats.speed);
        // 将卸下的装备放回背包
        existing.equipped = false;
        gameManager.inventory.addEquipment(existing);
        console.log('After addEquipment(existing), existing.stats.speed:', existing.stats.speed);
      }

      // 装备新物品
      console.log('Before equipMythologyItem, equipment.stats.speed:', equipment.stats.speed);
      equipment.equipped = true;
      player.equipMythologyItem(equipment);
      console.log('After equipMythologyItem, equipment.stats.speed:', equipment.stats.speed);

      // 保存游戏
      await saveGame();

      forceRefresh();
      setShowBackpack(false);
      setSelectedSlot(null);
    }
    console.log('handleEquipFromBackpack END');
  };

  // 卸下装备
  const handleUnequip = async () => {
    if (selectedSlot) {
      const item = player.unequipMythologyItem(selectedSlot);
      if (item) {
        // 将装备放回背包
        item.equipped = false;
        gameManager.inventory.addEquipment(item);
      }

      // 保存游戏
      await saveGame();

      forceRefresh();
      setSelectedItem(null);
      setSelectedSlot(null);
    }
  };

  return (
    <div style={{
      height: '100vh',
      backgroundColor: '#1a1a1a',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* 顶部标题栏 */}
      <header style={{
        flexShrink: 0,
        backgroundColor: '#2d2d2d',
        borderBottom: '1px solid #4b5563',
        padding: '12px 16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            onClick={onBack}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: '#9ca3af',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            <span>←</span>
            <span>返回</span>
          </button>
          <h1 style={{ color: 'white', fontWeight: 'bold', fontSize: '18px' }}>角色属性</h1>
          <div style={{ width: '48px' }} />
        </div>
      </header>

      {/* 属性列表 */}
      <main style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px'
      }}>
        {/* 基础信息 - 精简版 */}
        <div style={{
          backgroundColor: '#2d2d2d',
          borderRadius: '12px',
          padding: '12px 16px',
          border: '1px solid #374151',
          marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ color: '#fbbf24', fontSize: '14px', fontWeight: 'bold' }}>Lv.{player.level}</span>
              <span style={{ color: '#9ca3af', fontSize: '12px' }}>EXP: {player.exp}/{player.expToNext}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#9ca3af', fontSize: '12px' }}>战力</span>
              <span style={{ color: '#fbbf24', fontSize: '16px', fontWeight: 'bold' }}>
                {player.power.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* 装备栏 - 6槽位横向排列 */}
        <div style={{
          backgroundColor: '#2d2d2d',
          borderRadius: '12px',
          padding: '12px 16px',
          border: '1px solid #374151',
          marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'space-between' }}>
            {Object.values(EquipmentSlot).map(slot => {
              // 优先从新装备系统（神话装备）获取
              const mythEquippedItem = player.getEquipmentBySlot(slot);
              console.log('Rendering slot:', slot, 'mythEquippedItem:', mythEquippedItem?.name, 'mythEquippedItem.stats.speed:', mythEquippedItem?.stats.speed);
              // 从旧装备系统获取
              const oldEquippedItems = gameManager.inventory.getEquippedItems();
              let unifiedItem: UnifiedEquipment | null = null;
              const equippedItem: EquipmentInstance | undefined = mythEquippedItem;

              if (mythEquippedItem) {
                // 使用神话装备
                unifiedItem = convertNewItemToUnified(mythEquippedItem);
              } else {
                // 检查旧装备系统
                let oldItem: InventoryItem | null = null;
                switch (slot) {
                  case EquipmentSlot.WEAPON:
                    oldItem = oldEquippedItems.weapon;
                    break;
                  case EquipmentSlot.HEAD:
                    oldItem = oldEquippedItems.head;
                    break;
                  case EquipmentSlot.BODY:
                    oldItem = oldEquippedItems.body;
                    break;
                  case EquipmentSlot.LEGS:
                    oldItem = oldEquippedItems.legs;
                    break;
                  case EquipmentSlot.FEET:
                    oldItem = oldEquippedItems.feet;
                    break;
                  case EquipmentSlot.ACCESSORY:
                    oldItem = oldEquippedItems.accessory;
                    break;
                }
                if (oldItem) {
                  unifiedItem = convertOldItemToUnified(oldItem);
                }
              }

              return (
                <EquipmentSlotItem
                  key={slot}
                  slot={slot}
                  item={unifiedItem}
                  onClick={() => handleSlotClick(slot, equippedItem)}
                />
              );
            })}
          </div>
        </div>

        {/* 套装效果 */}
        {setBonuses.length > 0 && (
          <div style={{
            backgroundColor: '#2d2d2d',
            borderRadius: '12px',
            padding: '16px',
            border: '1px solid #374151',
            marginBottom: '16px'
          }}>
            <h3 style={{ color: '#c084fc', fontSize: '14px', fontWeight: 'bold', margin: '0 0 12px 0' }}>
              ✨ 套装效果
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {setBonuses.map((bonus, index) => (
                <div key={index} style={{
                  backgroundColor: '#1f2937',
                  borderRadius: '8px',
                  padding: '10px 12px'
                }}>
                  <p style={{ color: '#c084fc', fontSize: '13px', margin: 0 }}>{bonus.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 战斗属性 */}
        <div style={{
          backgroundColor: '#2d2d2d',
          borderRadius: '12px',
          padding: '16px',
          border: '1px solid #374151',
          marginBottom: '16px'
        }}>
          <h3 style={{ color: '#d97706', fontSize: '14px', fontWeight: 'bold', margin: '0 0 12px 0' }}>
            ⚔️ 战斗属性
          </h3>

          {/* 第一行：攻击、生命 各占一半 */}
          <div style={{
            display: 'flex',
            gap: '6px',
            marginBottom: '10px',
            paddingBottom: '10px',
            borderBottom: '1px solid #374151'
          }}>
            <StatItem label="攻击" value={Math.floor(player.totalAttack)} color="#f87171" flex={1} />
            <StatItem label="生命" value={player.totalMaxHp} color="#ef4444" flex={1} />
          </div>

          {/* 第二行：防御、穿透 各占一半 */}
          <div style={{
            display: 'flex',
            gap: '6px',
            marginBottom: '10px',
            paddingBottom: '10px',
            borderBottom: '1px solid #374151'
          }}>
            <StatItem label="防御" value={`${Math.floor(player.totalDefense)}/${player.damageReduction.toFixed(1)}%`} color="#60a5fa" flex={1} />
            <StatItem label="穿透" value={`${Math.floor(player.totalPenetration)}/${Math.floor(player.totalPenetrationPercent)}%`} color="#fb923c" flex={1} />
          </div>

          {/* 第三行：命中、闪避、攻速、真伤 */}
          <div style={{
            display: 'flex',
            gap: '6px',
            marginBottom: '10px',
            paddingBottom: '10px',
            borderBottom: '1px solid #374151'
          }}>
            <StatItem label="命中" value={Math.floor(player.totalHit)} color="#fbbf24" flex={1} />
            <StatItem label="闪避" value={Math.floor(player.totalDodge)} color="#4ade80" flex={1} />
            <StatItem label="攻速" value={player.totalAttackSpeed.toFixed(1)} color="#c084fc" flex={1} />
            <StatItem label="真伤" value={`${Math.floor(player.totalTrueDamage)}%`} color="#ec4899" flex={1} />
          </div>

          {/* 第四行：会心、护心、暴伤、幸运 */}
          <div style={{
            display: 'flex',
            gap: '6px'
          }}>
            <StatItem label="会心" value={`${Math.floor(player.totalCrit)}`} color="#ef4444" flex={1} />
            <StatItem label="护心" value={Math.floor(player.totalGuard)} color="#22d3ee" flex={1} />
            <StatItem label="暴伤" value={`${Math.floor(player.totalCritDamage)}%`} color="#f472b6" flex={1} />
            <StatItem label="幸运" value={Math.floor(player.totalLuck)} color="#fbbf24" flex={1} />
          </div>
        </div>

        {/* 装备属性加成详情 */}
        {equippedItems.length > 0 && (
          <div style={{
            backgroundColor: '#2d2d2d',
            borderRadius: '12px',
            padding: '16px',
            border: '1px solid #374151',
            marginBottom: '16px'
          }}>
            <h3 style={{ color: '#60a5fa', fontSize: '14px', fontWeight: 'bold', margin: '0 0 12px 0' }}>
              📊 装备加成
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              <EquipmentBonusItem label="攻击" value={player.equipmentStats.attack} color="#f87171" />
              <EquipmentBonusItem label="防御" value={player.equipmentStats.defense} color="#60a5fa" />
              <EquipmentBonusItem label="生命" value={player.equipmentStats.hp} color="#ef4444" />
              <EquipmentBonusItem label="命中" value={player.equipmentStats.hit} color="#fbbf24" />
              <EquipmentBonusItem label="闪避" value={player.equipmentStats.dodge} color="#4ade80" />
              <EquipmentBonusItem label="攻速" value={parseFloat(player.equipmentStats.speed.toFixed(1))} color="#c084fc" />
              <EquipmentBonusItem label="暴击" value={player.equipmentStats.crit} color="#ef4444" />
              <EquipmentBonusItem label="穿透" value={player.equipmentStats.penetration} color="#fb923c" />
            </div>
          </div>
        )}
      </main>

      {/* 装备详情弹窗 */}
      {selectedItem && selectedSlot && (
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
            backgroundColor: '#2d2d2d',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '360px',
            maxHeight: '80vh',
            overflowY: 'auto',
            border: `2px solid ${RARITY_COLORS[selectedItem.rarity]}`,
            padding: '20px'
          }}>
            {/* 头部信息 */}
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                backgroundColor: '#1f2937',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px',
                fontSize: '32px'
              }}>
                {SLOT_ICONS[selectedItem.slot]}
              </div>
              <h2 style={{
                color: RARITY_COLORS[selectedItem.rarity],
                fontWeight: 'bold',
                fontSize: '18px',
                margin: '0 0 4px 0'
              }}>
                {selectedItem.name}
              </h2>
              <p style={{ color: '#9ca3af', fontSize: '12px', margin: 0 }}>
                {SLOT_NAMES[selectedItem.slot]} · 站台{selectedItem.stationNumber}
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '8px' }}>
                <span style={{ color: '#fbbf24', fontSize: '12px' }}>强化 +{selectedItem.enhanceLevel}</span>
                <span style={{ color: '#c084fc', fontSize: '12px' }}>升华 +{selectedItem.sublimationLevel}</span>
              </div>
            </div>

            {/* 属性 */}
            <div style={{
              backgroundColor: '#1f2937',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '12px'
            }}>
              <h4 style={{ color: '#9ca3af', fontSize: '12px', marginBottom: '8px' }}>基础属性</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px', fontSize: '13px' }}>
                {(() => {
                  // 使用新的装备属性计算器（实时根据强化等级计算）
                  const calculatedStats = calculateEquipmentStats(selectedItem);

                  const stats = [];

                  if (calculatedStats.attack > 0) {
                    stats.push(
                      <div key="attack" style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#9ca3af' }}>攻击</span>
                        <span style={{ color: '#f87171' }}>{calculatedStats.attack}</span>
                      </div>
                    );
                  }

                  if (calculatedStats.defense > 0) {
                    stats.push(
                      <div key="defense" style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#9ca3af' }}>防御</span>
                        <span style={{ color: '#60a5fa' }}>{calculatedStats.defense}</span>
                      </div>
                    );
                  }

                  if (calculatedStats.hp > 0) {
                    stats.push(
                      <div key="hp" style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#9ca3af' }}>生命</span>
                        <span style={{ color: '#ef4444' }}>{calculatedStats.hp}</span>
                      </div>
                    );
                  }

                  if (calculatedStats.hit > 0) {
                    stats.push(
                      <div key="hit" style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#9ca3af' }}>命中</span>
                        <span style={{ color: '#fbbf24' }}>{calculatedStats.hit}</span>
                      </div>
                    );
                  }

                  if (calculatedStats.dodge > 0) {
                    stats.push(
                      <div key="dodge" style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#9ca3af' }}>闪避</span>
                        <span style={{ color: '#4ade80' }}>{calculatedStats.dodge}</span>
                      </div>
                    );
                  }

                  if (calculatedStats.speed > 0) {
                    stats.push(
                      <div key="speed" style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#9ca3af' }}>攻速</span>
                        <span style={{ color: '#c084fc' }}>{calculatedStats.speed.toFixed(1)}</span>
                      </div>
                    );
                  }

                  if (calculatedStats.crit > 0) {
                    stats.push(
                      <div key="crit" style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#9ca3af' }}>暴击</span>
                        <span style={{ color: '#ef4444' }}>{calculatedStats.crit}</span>
                      </div>
                    );
                  }

                  if (calculatedStats.penetration > 0) {
                    stats.push(
                      <div key="penetration" style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#9ca3af' }}>穿透</span>
                        <span style={{ color: '#fb923c' }}>{calculatedStats.penetration}</span>
                      </div>
                    );
                  }

                  return stats;
                })()}
              </div>
            </div>

            {/* 特殊效果 */}
            {selectedItem.effects.length > 0 && (
              <div style={{
                backgroundColor: '#1f2937',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '12px'
              }}>
                <h4 style={{ color: '#9ca3af', fontSize: '12px', marginBottom: '8px' }}>特殊效果</h4>
                {selectedItem.effects.map((effect, index) => (
                  <div key={index} style={{ marginBottom: '6px', fontSize: '12px' }}>
                    <span style={{ color: '#d1d5db' }}>{effect.description}</span>
                    <span style={{ color: '#9ca3af', marginLeft: '8px' }}>
                      ({effect.chance * 100}%)
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* 按钮 */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setSelectedItem(null)}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#374151',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                关闭
              </button>
              <button
                onClick={handleUnequip}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                卸下装备
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 背包选择弹窗 */}
      {showBackpack && selectedSlot && (
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
            backgroundColor: '#2d2d2d',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '360px',
            maxHeight: '80vh',
            overflowY: 'auto',
            border: '1px solid #4b5563',
            padding: '20px'
          }}>
            <h3 style={{ color: 'white', fontSize: '16px', marginBottom: '16px', textAlign: 'center' }}>
              选择{SLOT_NAMES[selectedSlot]}
            </h3>

            {/* 显示该槽位的可用装备 */}
            {(() => {
              // 获取神话装备（来自 inventory.equipment）
              const mythEquipments = backpackEquipment.filter(e => e.slot === selectedSlot);

              // 获取制造的装备（来自 inventory.items，使用 slot 字段匹配）
              const craftedItems: InventoryItem[] = [];
              if (selectedSlot) {
                const allItems = gameManager.inventory.getAllItems();
                allItems.forEach(item => {
                  // 使用 slot 字段匹配，而不是 type
                  if (!item.equipped && item.slot === selectedSlot) {
                    craftedItems.push(item);
                  }
                });
              }

              if (mythEquipments.length === 0 && craftedItems.length === 0) {
                return (
                  <p style={{ color: '#9ca3af', textAlign: 'center', padding: '20px' }}>
                    背包中没有{SLOT_NAMES[selectedSlot!]}
                  </p>
                );
              }

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {/* 神话装备 */}
                  {mythEquipments.map(equipment => (
                    <button
                      key={equipment.instanceId}
                      onClick={() => handleEquipFromBackpack(equipment)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px',
                        backgroundColor: '#1f2937',
                        border: `2px solid ${RARITY_COLORS[equipment.rarity as keyof typeof RARITY_COLORS]}`,
                        borderRadius: '8px',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <span style={{ fontSize: '24px' }}>{SLOT_ICONS[equipment.slot]}</span>
                      <div style={{ flex: 1 }}>
                        <p style={{
                          color: RARITY_COLORS[equipment.rarity as keyof typeof RARITY_COLORS],
                          fontWeight: 'bold',
                          margin: '0 0 4px 0',
                          fontSize: '14px'
                        }}>
                          {equipment.name}
                        </p>
                        <p style={{ color: '#9ca3af', margin: 0, fontSize: '11px' }}>
                          神话 · 强化+{equipment.enhanceLevel}
                          {equipment.sublimationLevel > 0 && ` 升华+${equipment.sublimationLevel}`}
                        </p>
                      </div>
                    </button>
                  ))}

                  {/* 制造装备 */}
                  {craftedItems.map(item => (
                    <button
                      key={item.id}
                      onClick={() => {
                        // 装备制造的装备
                        player.equipInventoryItem(item);
                        setShowBackpack(false);
                        setSelectedSlot(null);
                        forceRefresh();
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px',
                        backgroundColor: '#1f2937',
                        border: `2px solid ${RARITY_COLORS[item.rarity as keyof typeof RARITY_COLORS]}`,
                        borderRadius: '8px',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <span style={{ fontSize: '24px' }}>{SLOT_ICONS[selectedSlot!]}</span>
                      <div style={{ flex: 1 }}>
                        <p style={{
                          color: RARITY_COLORS[item.rarity as keyof typeof RARITY_COLORS],
                          fontWeight: 'bold',
                          margin: '0 0 4px 0',
                          fontSize: '14px'
                        }}>
                          {item.name}
                        </p>
                        <p style={{ color: '#9ca3af', margin: 0, fontSize: '11px' }}>
                          制造 · 强化+{item.enhanceLevel || 0}
                          {(item.sublimationLevel || 0) > 0 && ` 升华+${item.sublimationLevel}`}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              );
            })()}

            <button
              onClick={() => {
                setShowBackpack(false);
                setSelectedSlot(null);
              }}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#374151',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
                marginTop: '16px'
              }}
            >
              取消
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// 统一的装备显示组件 - 支持新旧两种装备系统
interface UnifiedEquipment {
  name: string;
  rarity: string;
  enhanceLevel: number;
  sublimationLevel: number;
  isOldSystem: boolean;
  originalItem: EquipmentInstance | InventoryItem;
}

// 将旧装备转换为统一格式
function convertOldItemToUnified(item: InventoryItem | null): UnifiedEquipment | null {
  if (!item) return null;
  return {
    name: item.name,
    rarity: item.rarity,
    enhanceLevel: item.enhanceLevel || 0,
    sublimationLevel: item.sublimationLevel || 0,
    isOldSystem: true,
    originalItem: item,
  };
}

// 将新装备转换为统一格式
function convertNewItemToUnified(item: EquipmentInstance | null): UnifiedEquipment | null {
  if (!item) return null;
  return {
    name: item.name,
    rarity: item.rarity,
    enhanceLevel: item.enhanceLevel || 0,
    sublimationLevel: item.sublimationLevel || 0,
    isOldSystem: false,
    originalItem: item,
  };
}

// 装备槽位组件
function EquipmentSlotItem({ slot, item, onClick }: { slot: EquipmentSlot; item: UnifiedEquipment | null; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: item ? '#1f2937' : 'rgba(31, 41, 55, 0.5)',
        borderRadius: '6px',
        padding: '6px 2px',
        border: `1px solid ${item ? RARITY_COLORS[item.rarity as keyof typeof RARITY_COLORS] : '#374151'}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        flex: 1,
        minWidth: 0,
        height: '50px',
        overflow: 'hidden'
      }}
    >
      {item ? (
        // 有装备时显示装备名称（两行）
        <span style={{
          fontSize: '10px',
          color: RARITY_COLORS[item.rarity as keyof typeof RARITY_COLORS],
          textAlign: 'center',
          fontWeight: 'bold',
          lineHeight: '1.3',
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          width: '100%',
          padding: '0 2px',
          wordBreak: 'break-all'
        }}>
          {item.name}
        </span>
      ) : (
        // 无装备时显示装备类型名称
        <span style={{
          fontSize: '11px',
          color: '#6b7280',
          textAlign: 'center'
        }}>
          {SLOT_NAMES[slot]}
        </span>
      )}
      {item && (item.enhanceLevel > 0 || item.sublimationLevel > 0) && (
        <span style={{ fontSize: '8px', color: '#fbbf24', marginTop: '1px' }}>
          +{item.enhanceLevel}{item.sublimationLevel > 0 && `·${item.sublimationLevel}`}
        </span>
      )}
    </div>
  );
}

// 属性项组件
function StatItem({ label, value, color, flex = 1 }: { label: string; value: string | number; color: string; flex?: number }) {
  return (
    <div style={{
      backgroundColor: '#1f2937',
      borderRadius: '6px',
      padding: '8px 6px',
      textAlign: 'center',
      flex: flex,
      minWidth: 0
    }}>
      <p style={{ color: '#9ca3af', fontSize: '10px', margin: '0 0 2px 0', whiteSpace: 'nowrap' }}>{label}</p>
      <p style={{ color, fontSize: '14px', fontWeight: 'bold', margin: 0, whiteSpace: 'nowrap' }}>
        {value}
      </p>
    </div>
  );
}

// 装备加成项组件
function EquipmentBonusItem({ label, value, color }: { label: string; value: number; color: string }) {
  if (!value || value === 0) return null;
  return (
    <div style={{
      backgroundColor: '#1f2937',
      borderRadius: '6px',
      padding: '6px 10px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <span style={{ color: '#9ca3af', fontSize: '12px' }}>{label}</span>
      <span style={{ color, fontSize: '13px', fontWeight: 'bold' }}>+{value}</span>
    </div>
  );
}

// 属性条组件
function StatBar({ label, current, max, color }: { label: string; current: number; max: number; color: string }) {
  const percentage = Math.max(0, Math.min(100, (current / max) * 100));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
        <span style={{ color: '#9ca3af' }}>{label}</span>
        <span style={{ color: 'white' }}>{Math.floor(current)}/{max}</span>
      </div>
      <div style={{ backgroundColor: '#1f2937', borderRadius: '9999px', height: '8px', overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            backgroundColor: color,
            transition: 'width 0.3s',
            width: `${percentage}%`
          }}
        />
      </div>
    </div>
  );
}
