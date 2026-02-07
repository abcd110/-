import { useState, useMemo } from 'react';
import { useGameStore } from '../stores/gameStore';
import { craftingSystem, MaterialSelection } from '../core/CraftingSystem';
import { EquipmentSlot } from '../data/equipmentTypes';
import { RARITY_COLORS, RARITY_NAMES } from '../data/normalEquipment';
import {
  getMaterialById,
  MATERIAL_QUALITY_COLORS,
  MaterialQuality,
  MATERIAL_QUALITY_NAMES,
  CraftingMaterialType,
  generateMaterialId,
  ALL_CRAFTING_MATERIALS
} from '../data/craftingMaterials';
import { SLOT_CRAFT_NAMES } from '../data/craftingRecipesNew';
import { ItemRarity } from '../data/types';

interface CraftingScreenProps {
  onBack: () => void;
}

const SLOT_INFO: Record<EquipmentSlot, { name: string; color: string }> = {
  [EquipmentSlot.HEAD]: { name: '头盔', color: '#3b82f6' },
  [EquipmentSlot.BODY]: { name: '胸甲', color: '#3b82f6' },
  [EquipmentSlot.LEGS]: { name: '护腿', color: '#3b82f6' },
  [EquipmentSlot.FEET]: { name: '战靴', color: '#3b82f6' },
  [EquipmentSlot.WEAPON]: { name: '武器', color: '#ef4444' },
  [EquipmentSlot.ACCESSORY]: { name: '饰品', color: '#a855f7' },
};

const MATERIAL_TYPE_NAMES: Record<CraftingMaterialType, string> = {
  [CraftingMaterialType.IRON]: '铁矿',
  [CraftingMaterialType.LEATHER]: '皮革',
  [CraftingMaterialType.FABRIC]: '纤维',
  [CraftingMaterialType.WOOD]: '基础合金',
  [CraftingMaterialType.CRYSTAL]: '冷却液晶',
  [CraftingMaterialType.ESSENCE]: '精华',
};

export default function CraftingScreen({ onBack }: CraftingScreenProps) {
  const { gameManager, saveGame } = useGameStore();
  const [selectedSlot, setSelectedSlot] = useState<EquipmentSlot>(EquipmentSlot.WEAPON);
  const [selectedBaseMaterial, setSelectedBaseMaterial] = useState<string | null>(null);
  const [selectedSecondaryMaterial, setSelectedSecondaryMaterial] = useState<string | null>(null);
  const [showMaterialSelector, setShowMaterialSelector] = useState<'base' | 'secondary' | null>(null);
  const [craftingResult, setCraftingResult] = useState<{
    success: boolean;
    message: string;
    quality?: ItemRarity;
  } | null>(null);

  const inventory = gameManager.inventory;

  const recipe = useMemo(() => {
    return craftingSystem.getRecipe(selectedSlot);
  }, [selectedSlot]);

  const selection: MaterialSelection = useMemo(() => {
    const baseMat = selectedBaseMaterial ? getMaterialById(selectedBaseMaterial) : null;
    const secondaryMat = selectedSecondaryMaterial ? getMaterialById(selectedSecondaryMaterial) : null;
    return {
      baseMaterialQuality: baseMat?.quality || MaterialQuality.NORMAL,
      secondaryMaterialQuality: secondaryMat?.quality || MaterialQuality.NORMAL,
    };
  }, [selectedBaseMaterial, selectedSecondaryMaterial]);

  const getMaterialQuantity = (materialId: string): number => {
    return inventory.getItem(materialId)?.quantity ?? 0;
  };

  const canCraft = useMemo(() => {
    if (!recipe) return false;
    if (!selectedBaseMaterial || !selectedSecondaryMaterial) return false;
    const baseQty = getMaterialQuantity(selectedBaseMaterial);
    const secondaryQty = getMaterialQuantity(selectedSecondaryMaterial);
    return baseQty >= recipe.baseMaterialCost && secondaryQty >= recipe.secondaryMaterialCost;
  }, [recipe, selectedBaseMaterial, selectedSecondaryMaterial, inventory]);

  const qualityPreview = useMemo(() => {
    if (!selectedBaseMaterial || !selectedSecondaryMaterial) {
      return calculateCraftingQuality(MaterialQuality.NORMAL);
    }
    return craftingSystem.getQualityPreview(selection);
  }, [selection, selectedBaseMaterial, selectedSecondaryMaterial]);

  const handleCraft = async () => {
    if (!recipe || !canCraft) return;
    const result = craftingSystem.craft(selectedSlot, selection, inventory, gameManager.player);
    setCraftingResult({
      success: result.success,
      message: result.message,
      quality: result.quality,
    });
    if (result.success) {
      setSelectedBaseMaterial(null);
      setSelectedSecondaryMaterial(null);
      // 保存游戏
      await saveGame();
    }
    setTimeout(() => setCraftingResult(null), 4000);
  };

  const getAvailableMaterials = (type: CraftingMaterialType) => {
    return ALL_CRAFTING_MATERIALS.filter(m => m.type === type && getMaterialQuantity(m.id) > 0);
  };

  const MaterialSlot = ({
    label,
    materialType,
    selectedId,
    onClick,
    cost,
  }: {
    label: string;
    materialType: CraftingMaterialType;
    selectedId: string | null;
    onClick: () => void;
    cost: number;
  }) => {
    const selectedMaterial = selectedId ? getMaterialById(selectedId) : null;
    const hasQuantity = selectedId ? getMaterialQuantity(selectedId) : 0;
    const isEnough = hasQuantity >= cost;

    return (
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '13px', color: '#a1a1aa', marginBottom: '8px' }}>
          {label} (需{cost}个)
        </div>
        <button
          onClick={onClick}
          style={{
            width: '100%',
            padding: '16px',
            backgroundColor: selectedMaterial ? '#1f2937' : '#374151',
            border: `2px dashed ${selectedMaterial ? (isEnough ? '#4ade80' : '#ef4444') : '#6b7280'}`,
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {selectedMaterial ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{
                  fontSize: '14px',
                  color: MATERIAL_QUALITY_COLORS[selectedMaterial.quality],
                  fontWeight: 'bold'
                }}>
                  {selectedMaterial.name}
                </span>
              </div>
              <span style={{
                fontSize: '13px',
                color: isEnough ? '#4ade80' : '#ef4444',
              }}>
                拥有: {hasQuantity}
              </span>
            </>
          ) : (
            <span style={{ color: '#6b7280', fontSize: '14px' }}>
              点击选择 {MATERIAL_TYPE_NAMES[materialType]}
            </span>
          )}
        </button>
      </div>
    );
  };

  const MaterialSelectorModal = ({
    type,
    materialType,
    onSelect,
    onClose,
  }: {
    type: 'base' | 'secondary';
    materialType: CraftingMaterialType;
    onSelect: (materialId: string) => void;
    onClose: () => void;
  }) => {
    const materials = getAvailableMaterials(materialType);

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
      }}>
        <div style={{
          backgroundColor: '#1a1f3a',
          borderRadius: '12px',
          padding: '20px',
          width: '90%',
          maxWidth: '400px',
          maxHeight: '70vh',
          overflowY: 'auto',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            <h3 style={{ color: 'white', margin: 0, fontSize: '16px' }}>
              选择{MATERIAL_TYPE_NAMES[materialType]}
            </h3>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: '#a1a1aa',
                fontSize: '20px',
                cursor: 'pointer',
              }}
            >
              x
            </button>
          </div>

          {materials.length === 0 ? (
            <p style={{ color: '#6b7280', textAlign: 'center', padding: '20px' }}>
              背包中没有{MATERIAL_TYPE_NAMES[materialType]}
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {materials.map(material => {
                const quantity = getMaterialQuantity(material.id);
                const isSelected = type === 'base'
                  ? selectedBaseMaterial === material.id
                  : selectedSecondaryMaterial === material.id;

                return (
                  <button
                    key={material.id}
                    onClick={() => { onSelect(material.id); onClose(); }}
                    style={{
                      padding: '12px',
                      backgroundColor: isSelected ? MATERIAL_QUALITY_COLORS[material.quality] + '30' : '#1f2937',
                      border: `2px solid ${isSelected ? MATERIAL_QUALITY_COLORS[material.quality] : 'transparent'}`,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span style={{
                      color: MATERIAL_QUALITY_COLORS[material.quality],
                      fontWeight: 'bold',
                      fontSize: '14px',
                    }}>
                      {material.name}
                    </span>
                    <span style={{ color: '#a1a1aa', fontSize: '13px' }}>
                      x{quantity}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (!recipe) return null;

  return (
    <div style={{ height: '100vh', backgroundColor: '#0a0e27', display: 'flex', flexDirection: 'column' }}>
      {/* 顶部栏 */}
      <header style={{ flexShrink: 0, backgroundColor: '#1a1f3a', borderBottom: '1px solid #2a3050', padding: '12px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#a1a1aa', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' }}>
            <span>&larr;</span><span>返回</span>
          </button>
          <h1 style={{ color: 'white', fontWeight: 'bold', fontSize: '18px' }}>装备制造</h1>
          <div style={{ width: '50px' }}></div>
        </div>
      </header>

      {/* 部位选择 */}
      <div style={{ flexShrink: 0, backgroundColor: '#1f2937', padding: '10px', borderBottom: '1px solid #374151' }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          {Object.entries(SLOT_INFO).map(([slot, info]) => (
            <button
              key={slot}
              onClick={() => {
                setSelectedSlot(slot as EquipmentSlot);
                setSelectedBaseMaterial(null);
                setSelectedSecondaryMaterial(null);
              }}
              style={{
                flex: 1,
                padding: '12px 8px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: selectedSlot === slot ? info.color : '#374151',
                color: 'white',
                fontSize: '13px',
                cursor: 'pointer',
                fontWeight: selectedSlot === slot ? 'bold' : 'normal',
              }}
            >
              {info.name}
            </button>
          ))}
        </div>
      </div>

      {/* 主内容 */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {/* 标题 */}
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ color: 'white', fontSize: '20px', margin: 0 }}>
            制造{SLOT_INFO[selectedSlot].name}
          </h2>
        </div>

        {/* 材料选择 */}
        <div style={{ backgroundColor: '#1a1f3a', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
          <div style={{ fontSize: '15px', color: 'white', fontWeight: 'bold', marginBottom: '16px' }}>
            投入材料
          </div>

          <MaterialSlot
            label={`主材料: ${craftingSystem.getMaterialTypeName(recipe.baseMaterialType)}`}
            materialType={recipe.baseMaterialType}
            selectedId={selectedBaseMaterial}
            onClick={() => setShowMaterialSelector('base')}
            cost={recipe.baseMaterialCost}
          />

          <MaterialSlot
            label={`副材料: ${craftingSystem.getMaterialTypeName(recipe.secondaryMaterialType)}`}
            materialType={recipe.secondaryMaterialType}
            selectedId={selectedSecondaryMaterial}
            onClick={() => setShowMaterialSelector('secondary')}
            cost={recipe.secondaryMaterialCost}
          />
        </div>

        {/* 品质概率 - 紧凑显示 */}
        <div style={{ backgroundColor: '#1a1f3a', borderRadius: '12px', padding: '12px', marginBottom: '16px' }}>
          <div style={{ fontSize: '14px', color: 'white', fontWeight: 'bold', marginBottom: '8px' }}>
            制造概率
          </div>
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {Object.entries(qualityPreview)
              .filter(([, rate]) => rate > 0.01)
              .sort(([, a], [, b]) => b - a)
              .map(([rarity, rate]) => (
                <div key={rarity} style={{
                  padding: '4px 8px',
                  backgroundColor: RARITY_COLORS[rarity as ItemRarity] + '30',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '36px',
                }}>
                  <span style={{ color: RARITY_COLORS[rarity as ItemRarity], fontSize: '12px', fontWeight: 'bold' }}>
                    {(rate * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
          </div>
        </div>

        {/* 制造按钮 */}
        <button
          onClick={handleCraft}
          disabled={!canCraft}
          style={{
            width: '100%',
            padding: '16px',
            backgroundColor: canCraft ? '#0099cc' : '#374151',
            color: canCraft ? 'white' : '#6b7280',
            fontWeight: 'bold',
            borderRadius: '12px',
            border: 'none',
            cursor: canCraft ? 'pointer' : 'not-allowed',
            fontSize: '18px',
          }}
        >
          {canCraft ? '开始制造' : '请先投入材料'}
        </button>

        {/* 结果提示 */}
        {craftingResult && (
          <div style={{
            marginTop: '16px',
            padding: '16px',
            borderRadius: '12px',
            backgroundColor: craftingResult.success ? '#22c55e20' : '#ef444420',
            border: `1px solid ${craftingResult.success ? '#22c55e' : '#ef4444'}`,
            textAlign: 'center',
          }}>
            <span style={{
              color: craftingResult.success ? '#4ade80' : '#ef4444',
              fontWeight: 'bold',
              fontSize: '16px'
            }}>
              {craftingResult.message}
            </span>
          </div>
        )}
      </main>

      {/* 材料选择弹窗 */}
      {showMaterialSelector === 'base' && (
        <MaterialSelectorModal
          type="base"
          materialType={recipe.baseMaterialType}
          onSelect={setSelectedBaseMaterial}
          onClose={() => setShowMaterialSelector(null)}
        />
      )}
      {showMaterialSelector === 'secondary' && (
        <MaterialSelectorModal
          type="secondary"
          materialType={recipe.secondaryMaterialType}
          onSelect={setSelectedSecondaryMaterial}
          onClose={() => setShowMaterialSelector(null)}
        />
      )}
    </div>
  );
}

// 计算品质概率（用于默认显示）
function calculateCraftingQuality(maxMaterialQuality: MaterialQuality): Record<ItemRarity, number> {
  const rates: Record<MaterialQuality, Record<ItemRarity, number>> = {
    [MaterialQuality.NORMAL]: {
      [ItemRarity.COMMON]: 0.50,
      [ItemRarity.UNCOMMON]: 0.30,
      [ItemRarity.RARE]: 0.15,
      [ItemRarity.EPIC]: 0.04,
      [ItemRarity.LEGENDARY]: 0.01,
      [ItemRarity.MYTHIC]: 0,
    },
    [MaterialQuality.GOOD]: {
      [ItemRarity.COMMON]: 0.30,
      [ItemRarity.UNCOMMON]: 0.40,
      [ItemRarity.RARE]: 0.20,
      [ItemRarity.EPIC]: 0.08,
      [ItemRarity.LEGENDARY]: 0.02,
      [ItemRarity.MYTHIC]: 0,
    },
    [MaterialQuality.FINE]: {
      [ItemRarity.COMMON]: 0.15,
      [ItemRarity.UNCOMMON]: 0.30,
      [ItemRarity.RARE]: 0.35,
      [ItemRarity.EPIC]: 0.15,
      [ItemRarity.LEGENDARY]: 0.05,
      [ItemRarity.MYTHIC]: 0,
    },
    [MaterialQuality.RARE]: {
      [ItemRarity.COMMON]: 0.05,
      [ItemRarity.UNCOMMON]: 0.15,
      [ItemRarity.RARE]: 0.30,
      [ItemRarity.EPIC]: 0.35,
      [ItemRarity.LEGENDARY]: 0.15,
      [ItemRarity.MYTHIC]: 0,
    },
    [MaterialQuality.LEGENDARY]: {
      [ItemRarity.COMMON]: 0,
      [ItemRarity.UNCOMMON]: 0.05,
      [ItemRarity.RARE]: 0.20,
      [ItemRarity.EPIC]: 0.35,
      [ItemRarity.LEGENDARY]: 0.40,
      [ItemRarity.MYTHIC]: 0,
    },
  };
  return rates[maxMaterialQuality];
}
