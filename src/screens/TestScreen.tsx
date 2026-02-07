import { useState } from 'react';
import { useGameStore } from '../stores/gameStore';
import { EquipmentSlot, EquipmentRarity, type MythologyEquipment } from '../data/equipmentTypes';
import { ItemRarity, ItemType } from '../data/types';
import { ALL_MYTHOLOGY_EQUIPMENT, getEquipmentByStation, createEquipmentInstance } from '../data/mythologyEquipmentIndex';
import { ITEMS } from '../data/items';
import { ALL_CRAFTING_MATERIALS, CraftingMaterialType, MaterialQuality, MATERIAL_QUALITY_NAMES } from '../data/craftingMaterials';
import { ENHANCE_STONE_ID } from '../core/EnhanceSystem';

interface TestScreenProps {
  onBack: () => void;
}

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

export default function TestScreen({ onBack }: TestScreenProps) {
  const { gameManager } = useGameStore();
  const [activeTab, setActiveTab] = useState<'equipment' | 'items' | 'materials' | 'player' | 'system'>('equipment');
  const [message, setMessage] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedStation, setSelectedStation] = useState<number | 'all'>('all');
  const [selectedRarity, setSelectedRarity] = useState<ItemRarity | 'all'>('all');

  const forceRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  // 获取所有装备按星球分组
  const equipmentByStation: Record<number, MythologyEquipment[]> = {};
  for (let i = 1; i <= 32; i++) {
    equipmentByStation[i] = getEquipmentByStation(i);
  }

  // 获取所有制造材料
  const allCraftingMaterials = ALL_CRAFTING_MATERIALS;

  // 按材料类型分组
  const materialsByType: Record<string, typeof allCraftingMaterials> = {
    '基础材料（星球1-4）': [],
    '高级材料（星球5-8）': [],
    '优质品质材料': [],
    '精良品质材料': [],
    '稀有品质材料': [],
    '传说品质材料': [],
  };

  allCraftingMaterials.forEach(mat => {
    // 基础材料：铁矿、皮革、布料、基础合金（星球1-4）
    if (mat.type === CraftingMaterialType.IRON ||
      mat.type === CraftingMaterialType.LEATHER ||
      mat.type === CraftingMaterialType.FABRIC ||
      mat.type === CraftingMaterialType.WOOD) {
      materialsByType['基础材料（星球1-4）'].push(mat);
    }
    // 高级材料：冷却液晶、精华（星球5-8）
    else if (mat.type === CraftingMaterialType.CRYSTAL ||
      mat.type === CraftingMaterialType.ESSENCE) {
      materialsByType['高级材料（星球5-8）'].push(mat);
    }

    // 按品质分组
    if (mat.quality === MaterialQuality.GOOD) {
      materialsByType['优质品质材料'].push(mat);
    } else if (mat.quality === MaterialQuality.FINE) {
      materialsByType['精良品质材料'].push(mat);
    } else if (mat.quality === MaterialQuality.RARE) {
      materialsByType['稀有品质材料'].push(mat);
    } else if (mat.quality === MaterialQuality.LEGENDARY) {
      materialsByType['传说品质材料'].push(mat);
    }
  });

  // 显示消息
  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 2000);
  };

  // 添加所有制造材料
  const addAllMaterials = (quantity: number = 99) => {
    allCraftingMaterials.forEach(mat => {
      gameManager.inventory.addItem(mat.id, quantity);
    });
    forceRefresh();
    showMessage(`已获得所有制造材料 x${quantity}`);
  };

  // 添加分组材料
  const addMaterialsByGroup = (groupName: string, quantity: number = 99) => {
    const materials = materialsByType[groupName] || [];
    materials.forEach(mat => {
      gameManager.inventory.addItem(mat.id, quantity);
    });
    forceRefresh();
    showMessage(`已获得 ${groupName} x${quantity}`);
  };

  // 添加消耗品
  const addConsumables = () => {
    const consumables = Object.values(ITEMS).filter(item => item.type === ItemType.CONSUMABLE);
    consumables.forEach(item => {
      gameManager.inventory.addItem(item.id, 20);
    });
    forceRefresh();
    showMessage('已获得所有消耗品 x20');
  };

  // 添加金币
  const addCoins = (amount: number) => {
    gameManager.trainCoins += amount;
    forceRefresh();
    showMessage(`已获得 ${amount.toLocaleString()} 航船币`);
  };

  // 添加强化石
  const addEnhanceStones = (quantity: number) => {
    gameManager.inventory.addItem(ENHANCE_STONE_ID, quantity);
    forceRefresh();
    showMessage(`已获得强化石 x${quantity}`);
  };

  // 计算属性值 - 每级提升10%（基于初始数值，叠乘）
  const calculateAttribute = (baseValue: number, level: number): number => {
    return baseValue * Math.pow(1.1, level - 1);
  };

  // 设置玩家等级
  const setPlayerLevel = (level: number) => {
    gameManager.player.level = level;
    gameManager.player.exp = 0;

    // 使用与Player类相同的计算方式设置属性
    gameManager.player.maxHp = Math.floor(calculateAttribute(100, level));
    gameManager.player.maxStamina = 100 + (level - 1) * 10; // 每级固定+10
    gameManager.player.maxSpirit = 100 + (level - 1) * 10; // 每级固定+10
    gameManager.player.baseAttack = Math.floor(calculateAttribute(10, level));
    gameManager.player.baseDefense = Math.floor(calculateAttribute(5, level));
    gameManager.player.baseAgility = Math.floor(10 * (1 + level * 0.1)); // 叠加：10*(1+等级*0.1)
    gameManager.player.baseHit = Math.floor(calculateAttribute(50, level));
    gameManager.player.baseDodge = 5; // 固定5%，不随等级提升
    gameManager.player.baseCrit = 5; // 固定5%，不随等级提升
    gameManager.player.baseCritDamage = 50;
    gameManager.player.basePenetration = 0;
    gameManager.player.baseTrueDamage = 0;

    // 恢复满状态
    gameManager.player.hp = gameManager.player.maxHp;
    gameManager.player.stamina = gameManager.player.maxStamina;
    gameManager.player.spirit = gameManager.player.maxSpirit;

    forceRefresh();
    showMessage(`玩家等级已设置为 ${level}`);
  };

  // 恢复满状态
  const restoreFullStatus = () => {
    gameManager.player.hp = gameManager.player.maxHp;
    gameManager.player.stamina = gameManager.player.maxStamina;
    gameManager.player.hunger = 100;
    gameManager.player.thirst = 100;
    forceRefresh();
    showMessage('已恢复满状态');
  };

  // 重置游戏
  const resetGame = () => {
    if (confirm('确定要重置游戏吗？所有数据将被清空！')) {
      gameManager.reset();
      forceRefresh();
      showMessage('游戏已重置');
    }
  };

  // 保存游戏
  const saveGame = async () => {
    await gameManager.saveGame();
    showMessage('游戏已保存');
  };

  // 获得装备
  const addEquipment = (equipmentId: string) => {
    const instance = createEquipmentInstance(equipmentId);
    if (instance) {
      instance.equipped = false;
      gameManager.inventory.addEquipment(instance);
      forceRefresh();
      showMessage(`已获得: ${instance.name}`);
    }
  };

  // 获得星球全套装备
  const addStationEquipment = (stationNum: number) => {
    const equipment = getEquipmentByStation(stationNum);
    equipment.forEach(equip => {
      const instance = createEquipmentInstance(equip.id);
      if (instance) {
        instance.equipped = false;
        gameManager.inventory.addEquipment(instance);
      }
    });
    forceRefresh();
    showMessage(`已获得星球${stationNum}全套装备`);
  };

  // 获得所有武器
  const addAllWeapons = () => {
    for (let i = 1; i <= 32; i++) {
      const equip = getEquipmentByStation(i).find(e => e.slot === EquipmentSlot.WEAPON);
      if (equip) {
        addEquipment(equip.id);
      }
    }
    showMessage('已获得所有武器');
  };

  // 获得指定品质的所有装备
  const addEquipmentByRarity = (rarity: ItemRarity) => {
    let count = 0;
    for (let i = 1; i <= 32; i++) {
      const equipment = getEquipmentByStation(i).filter(e => e.rarity === rarity);
      equipment.forEach(equip => {
        const instance = createEquipmentInstance(equip.id);
        if (instance) {
          instance.equipped = false;
          gameManager.inventory.addEquipment(instance);
          count++;
        }
      });
    }
    forceRefresh();
    showMessage(`已获得 ${RARITY_NAMES[rarity]} 装备 ${count} 件`);
  };

  // 过滤装备
  const getFilteredEquipment = (stationNum: number) => {
    let equipment = equipmentByStation[stationNum] || [];
    if (selectedRarity !== 'all') {
      equipment = equipment.filter(e => e.rarity === selectedRarity);
    }
    return equipment;
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
          <h1 style={{ color: 'white', fontWeight: 'bold', fontSize: '18px' }}>测试面板</h1>
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
        {[
          { id: 'equipment', label: '装备', icon: '🛡️' },
          { id: 'items', label: '道具', icon: '📦' },
          { id: 'materials', label: '材料', icon: '🧱' },
          { id: 'player', label: '玩家', icon: '👤' },
          { id: 'system', label: '系统', icon: '⚙️' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: activeTab === tab.id ? '#dc2626' : 'transparent',
              color: activeTab === tab.id ? 'white' : '#9ca3af',
              border: 'none',
              cursor: 'pointer',
              fontWeight: activeTab === tab.id ? 'bold' : 'normal',
              fontSize: '12px'
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* 主内容区 */}
      <main style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px'
      }}>
        {/* 装备标签 */}
        {activeTab === 'equipment' && (
          <div>
            {/* 快速操作 */}
            <div style={{
              backgroundColor: '#1a1f3a',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '16px'
            }}>
              <h3 style={{ color: 'white', fontSize: '14px', marginBottom: '12px' }}>
                快速操作
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '12px' }}>
                <button
                  onClick={addAllWeapons}
                  style={{
                    padding: '12px',
                    backgroundColor: '#7c3aed',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '13px'
                  }}
                >
                  获得所有武器
                </button>
                <button
                  onClick={() => {
                    for (let i = 1; i <= 8; i++) {
                      addStationEquipment(i);
                    }
                    showMessage('已获得星球1-8全套');
                  }}
                  style={{
                    padding: '12px',
                    backgroundColor: '#2563eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '13px'
                  }}
                >
                  获得1-8星球全套
                </button>
              </div>

              {/* 品质筛选 */}
              <div style={{ marginBottom: '12px' }}>
                <span style={{ color: '#a1a1aa', fontSize: '12px', marginRight: '8px' }}>按品质获取:</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                  {[
                    { id: ItemRarity.COMMON, name: '普通', color: '#a1a1aa' },
                    { id: ItemRarity.UNCOMMON, name: '优秀', color: '#4ade80' },
                    { id: ItemRarity.RARE, name: '稀有', color: '#60a5fa' },
                    { id: ItemRarity.EPIC, name: '史诗', color: '#c084fc' },
                    { id: ItemRarity.LEGENDARY, name: '传说', color: '#00d4ff' },
                    { id: ItemRarity.MYTHIC, name: '神话', color: '#f87171' },
                  ].map(rarity => (
                    <button
                      key={rarity.id}
                      onClick={() => addEquipmentByRarity(rarity.id)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: rarity.color,
                        color: rarity.id === ItemRarity.COMMON || rarity.id === ItemRarity.LEGENDARY ? 'black' : 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '11px',
                        fontWeight: 'bold'
                      }}
                    >
                      {rarity.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* 品质过滤器 */}
              <div>
                <span style={{ color: '#a1a1aa', fontSize: '12px', marginRight: '8px' }}>筛选显示:</span>
                <select
                  value={selectedRarity}
                  onChange={(e) => setSelectedRarity(e.target.value as any)}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#374151',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '12px'
                  }}
                >
                  <option value="all">全部品质</option>
                  <option value={ItemRarity.COMMON}>普通</option>
                  <option value={ItemRarity.UNCOMMON}>优秀</option>
                  <option value={ItemRarity.RARE}>稀有</option>
                  <option value={ItemRarity.EPIC}>史诗</option>
                  <option value={ItemRarity.LEGENDARY}>传说</option>
                  <option value={ItemRarity.MYTHIC}>神话</option>
                </select>
              </div>
            </div>

            {/* 星球列表 */}
            {Object.entries(equipmentByStation).map(([stationNum, equipment]) => {
              const filteredEquipment = getFilteredEquipment(parseInt(stationNum));
              if (filteredEquipment.length === 0) return null;

              return (
                <div
                  key={stationNum}
                  style={{
                    backgroundColor: '#1a1f3a',
                    borderRadius: '12px',
                    padding: '12px',
                    marginBottom: '12px'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px'
                  }}>
                    <h4 style={{ color: '#00d4ff', fontSize: '14px', margin: 0 }}>
                      星球 {stationNum}
                    </h4>
                    <button
                      onClick={() => addStationEquipment(parseInt(stationNum))}
                      style={{
                        padding: '4px 12px',
                        backgroundColor: '#16a34a',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      一键获得
                    </button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                    {filteredEquipment.map(equip => (
                      <button
                        key={equip.id}
                        onClick={() => addEquipment(equip.id)}
                        style={{
                          padding: '8px',
                          backgroundColor: '#1f2937',
                          border: `1px solid ${RARITY_COLORS[equip.rarity]}`,
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '11px',
                          color: RARITY_COLORS[equip.rarity]
                        }}
                      >
                        {equip.name}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 道具标签 */}
        {activeTab === 'items' && (
          <div>
            {/* 消耗品 */}
            <div style={{
              backgroundColor: '#1a1f3a',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '16px'
            }}>
              <h3 style={{ color: 'white', fontSize: '14px', marginBottom: '12px' }}>
                消耗品
              </h3>
              <button
                onClick={addConsumables}
                style={{
                  width: '100%',
                  padding: '16px',
                  backgroundColor: '#16a34a',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '16px'
                }}
              >
                获得所有消耗品 x20
              </button>
            </div>

            {/* 技能 */}
            <div style={{
              backgroundColor: '#1a1f3a',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '16px'
            }}>
              <h3 style={{ color: 'white', fontSize: '14px', marginBottom: '12px' }}>
                学习技能
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                {[
                  { id: 'skill_power_strike', name: '强力打击' },
                  { id: 'skill_first_aid', name: '急救' },
                  { id: 'passive_toughness', name: '坚韧' },
                  { id: 'passive_agility', name: '敏捷' },
                ].map(skill => (
                  <button
                    key={skill.id}
                    onClick={() => {
                      // 添加到可用技能列表
                      if (!gameManager.availableSkills.includes(skill.id)) {
                        gameManager.availableSkills.push(skill.id);
                      }
                      // 直接学习技能
                      const result = gameManager.learnSkill(skill.id);
                      forceRefresh();
                      showMessage(result.message);
                    }}
                    style={{
                      padding: '12px',
                      backgroundColor: '#7c3aed',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '13px'
                    }}
                  >
                    {skill.name}
                  </button>
                ))}
              </div>
            </div>

            {/* 金币 */}
            <div style={{
              backgroundColor: '#1a1f3a',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '16px'
            }}>
              <h3 style={{ color: 'white', fontSize: '14px', marginBottom: '12px' }}>
                当前航船币: {gameManager.trainCoins.toLocaleString()}
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                <button
                  onClick={() => addCoins(1000)}
                  style={{
                    padding: '16px',
                    backgroundColor: '#00d4ff',
                    color: 'black',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  +1,000
                </button>
                <button
                  onClick={() => addCoins(10000)}
                  style={{
                    padding: '16px',
                    backgroundColor: '#f59e0b',
                    color: 'black',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  +10,000
                </button>
                <button
                  onClick={() => addCoins(100000)}
                  style={{
                    padding: '16px',
                    backgroundColor: '#0099cc',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  +100,000
                </button>
                <button
                  onClick={() => addCoins(1000000)}
                  style={{
                    padding: '16px',
                    backgroundColor: '#b45309',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  +1,000,000
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 材料标签 */}
        {activeTab === 'materials' && (
          <div>
            {/* 强化石快速获取 */}
            <div style={{
              backgroundColor: '#1a1f3a',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '16px'
            }}>
              <h3 style={{ color: 'white', fontSize: '14px', marginBottom: '12px' }}>
                🔷 强化石
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                <button
                  onClick={() => addEnhanceStones(10)}
                  style={{
                    padding: '12px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '13px'
                  }}
                >
                  +10
                </button>
                <button
                  onClick={() => addEnhanceStones(100)}
                  style={{
                    padding: '12px',
                    backgroundColor: '#2563eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '13px'
                  }}
                >
                  +100
                </button>
                <button
                  onClick={() => addEnhanceStones(999)}
                  style={{
                    padding: '12px',
                    backgroundColor: '#1d4ed8',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '13px'
                  }}
                >
                  +999
                </button>
              </div>
            </div>

            {/* 全部材料 */}
            <div style={{
              backgroundColor: '#1a1f3a',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '16px'
            }}>
              <h3 style={{ color: 'white', fontSize: '14px', marginBottom: '12px' }}>
                全部材料 ({allCraftingMaterials.length}种)
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                <button
                  onClick={() => addAllMaterials(99)}
                  style={{
                    padding: '16px',
                    backgroundColor: '#0099cc',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '14px'
                  }}
                >
                  获得所有材料 x99
                </button>
                <button
                  onClick={() => addAllMaterials(999)}
                  style={{
                    padding: '16px',
                    backgroundColor: '#b45309',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '14px'
                  }}
                >
                  获得所有材料 x999
                </button>
              </div>
            </div>

            {/* 分组材料 */}
            {Object.entries(materialsByType).map(([groupName, materials]) => (
              <div
                key={groupName}
                style={{
                  backgroundColor: '#1a1f3a',
                  borderRadius: '12px',
                  padding: '12px',
                  marginBottom: '12px'
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '8px'
                }}>
                  <h4 style={{ color: '#00d4ff', fontSize: '14px', margin: 0 }}>
                    {groupName} ({materials.length}种)
                  </h4>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
                  <button
                    onClick={() => addMaterialsByGroup(groupName, 99)}
                    style={{
                      padding: '10px',
                      backgroundColor: '#059669',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}
                  >
                    获得 x99
                  </button>
                  <button
                    onClick={() => addMaterialsByGroup(groupName, 999)}
                    style={{
                      padding: '10px',
                      backgroundColor: '#047857',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}
                  >
                    获得 x999
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 玩家标签 */}
        {activeTab === 'player' && (
          <div>
            {/* 等级设置 */}
            <div style={{
              backgroundColor: '#1a1f3a',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '16px'
            }}>
              <h3 style={{ color: 'white', fontSize: '14px', marginBottom: '12px' }}>
                设置等级 (当前: {gameManager.player.level})
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                {[1, 5, 10, 15, 20, 30, 40, 50, 60, 70, 80].map(level => (
                  <button
                    key={level}
                    onClick={() => setPlayerLevel(level)}
                    style={{
                      padding: '10px',
                      backgroundColor: gameManager.player.level === level ? '#dc2626' : '#2a3050',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}
                  >
                    Lv.{level}
                  </button>
                ))}
              </div>
            </div>

            {/* 当前属性 */}
            <div style={{
              backgroundColor: '#1a1f3a',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '16px'
            }}>
              <h3 style={{ color: 'white', fontSize: '14px', marginBottom: '12px' }}>
                当前属性
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                <div style={{ backgroundColor: '#374151', padding: '10px', borderRadius: '6px' }}>
                  <span style={{ color: '#a1a1aa', fontSize: '11px' }}>生命值</span>
                  <div style={{ color: '#ef4444', fontWeight: 'bold' }}>{gameManager.player.hp}/{gameManager.player.maxHp}</div>
                </div>
                <div style={{ backgroundColor: '#374151', padding: '10px', borderRadius: '6px' }}>
                  <span style={{ color: '#a1a1aa', fontSize: '11px' }}>攻击力</span>
                  <div style={{ color: '#f97316', fontWeight: 'bold' }}>{gameManager.player.totalAttack}</div>
                </div>
                <div style={{ backgroundColor: '#374151', padding: '10px', borderRadius: '6px' }}>
                  <span style={{ color: '#a1a1aa', fontSize: '11px' }}>防御力</span>
                  <div style={{ color: '#3b82f6', fontWeight: 'bold' }}>{gameManager.player.totalDefense}</div>
                </div>
                <div style={{ backgroundColor: '#374151', padding: '10px', borderRadius: '6px' }}>
                  <span style={{ color: '#a1a1aa', fontSize: '11px' }}>体力</span>
                  <div style={{ color: '#22c55e', fontWeight: 'bold' }}>{gameManager.player.stamina}/{gameManager.player.maxStamina}</div>
                </div>
                <div style={{ backgroundColor: '#374151', padding: '10px', borderRadius: '6px' }}>
                  <span style={{ color: '#a1a1aa', fontSize: '11px' }}>能量储备值</span>
                  <div style={{ color: '#eab308', fontWeight: 'bold' }}>{gameManager.player.hunger}/100</div>
                </div>
                <div style={{ backgroundColor: '#374151', padding: '10px', borderRadius: '6px' }}>
                  <span style={{ color: '#a1a1aa', fontSize: '11px' }}>冷却液水平值</span>
                  <div style={{ color: '#06b6d4', fontWeight: 'bold' }}>{gameManager.player.thirst}/100</div>
                </div>
              </div>
            </div>

            {/* 状态恢复 */}
            <div style={{
              backgroundColor: '#1a1f3a',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '16px'
            }}>
              <h3 style={{ color: 'white', fontSize: '14px', marginBottom: '12px' }}>
                状态恢复
              </h3>
              <button
                onClick={restoreFullStatus}
                style={{
                  width: '100%',
                  padding: '16px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '16px'
                }}
              >
                恢复满状态
              </button>
            </div>
          </div>
        )}

        {/* 系统标签 */}
        {activeTab === 'system' && (
          <div>
            {/* 存档操作 */}
            <div style={{
              backgroundColor: '#1a1f3a',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '16px'
            }}>
              <h3 style={{ color: 'white', fontSize: '14px', marginBottom: '12px' }}>
                存档操作
              </h3>
              <button
                onClick={saveGame}
                style={{
                  width: '100%',
                  padding: '16px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '16px',
                  marginBottom: '8px'
                }}
              >
                保存游戏
              </button>
            </div>

            {/* 危险操作 */}
            <div style={{
              backgroundColor: '#1a1f3a',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '16px'
            }}>
              <h3 style={{ color: '#ef4444', fontSize: '14px', marginBottom: '12px' }}>
                危险操作
              </h3>
              <button
                onClick={resetGame}
                style={{
                  width: '100%',
                  padding: '16px',
                  backgroundColor: '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '16px'
                }}
              >
                重置游戏
              </button>
              <p style={{ color: '#a1a1aa', fontSize: '11px', marginTop: '8px' }}>
                警告：重置游戏将清空所有数据，无法恢复！
              </p>
            </div>

            {/* 游戏信息 */}
            <div style={{
              backgroundColor: '#1a1f3a',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '16px'
            }}>
              <h3 style={{ color: 'white', fontSize: '14px', marginBottom: '12px' }}>
                游戏信息
              </h3>
              <div style={{ color: '#a1a1aa', fontSize: '12px', lineHeight: '1.8' }}>
                <div>游戏天数: {gameManager.day}</div>
                <div>当前时间: {gameManager.time}:00</div>
                <div>背包物品: {gameManager.inventory.items.length} 种</div>
                <div>装备数量: {gameManager.inventory.equipment.length} 件</div>
                <div>已解锁星球: {gameManager.locationProgress.size} 个</div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 消息提示 */}
      {message && (
        <div style={{
          position: 'fixed',
          bottom: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#16a34a',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '8px',
          fontWeight: 'bold',
          zIndex: 100,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
        }}>
          {message}
        </div>
      )}
    </div>
  );
}
