// 材料合成界面
import { useState, useMemo } from 'react';
import { useGameStore } from '../stores/gameStore';
import { ArmorQuality } from '../data/nanoArmorRecipes';
import { getSynthesizableMaterials, QUALITY_NAMES } from '../core/MaterialSynthesisSystem';

interface MaterialSynthesisScreenProps {
  onBack: () => void;
}

// 品质颜色
const QUALITY_COLORS: Record<ArmorQuality, string> = {
  [ArmorQuality.STARDUST]: '#9ca3af',
  [ArmorQuality.ALLOY]: '#22c55e',
  [ArmorQuality.CRYSTAL]: '#3b82f6',
  [ArmorQuality.QUANTUM]: '#a855f7',
  [ArmorQuality.VOID]: '#f59e0b',
};

// 材料基础名称
const MATERIAL_NAMES: Record<string, string> = {
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

// 品质后缀
const SUFFIX: Record<ArmorQuality, string> = {
  [ArmorQuality.STARDUST]: '_stardust',
  [ArmorQuality.ALLOY]: '_alloy',
  [ArmorQuality.CRYSTAL]: '_crystal',
  [ArmorQuality.QUANTUM]: '_quantum',
  [ArmorQuality.VOID]: '_void',
};

export default function MaterialSynthesisScreen({ onBack }: MaterialSynthesisScreenProps) {
  const { gameManager, saveGame, showToast } = useGameStore();
  const [refreshKey, setRefreshKey] = useState(0);
  const [selected, setSelected] = useState<{ id: string; quality: ArmorQuality } | null>(null);

  // 可合成列表
  const list = useMemo(() => {
    const map = new Map<string, number>();
    gameManager.inventory.items.forEach(item => map.set(item.id, item.quantity));
    return getSynthesizableMaterials(map).filter(i => i.hasCount >= 5);
  }, [gameManager.inventory.items, refreshKey]);

  // 获取数量
  const getCount = (id: string, q: ArmorQuality) => {
    const item = gameManager.inventory.getItem(`${id}${SUFFIX[q]}`);
    return item?.quantity || 0;
  };

  // 合成
  const handleSynth = (batch: number) => {
    if (!selected) return;
    const result = gameManager.synthesizeMaterialBatch(selected.id, selected.quality, batch);
    showToast(result.message, result.success ? 'success' : 'error');
    if (result.success) {
      saveGame();
      setRefreshKey(k => k + 1);
      // 如果材料不足，取消选择
      const remaining = getCount(selected.id, selected.quality);
      if (remaining < 5) setSelected(null);
    }
  };

  // 分组
  const groups = [
    { q: ArmorQuality.STARDUST, t: ArmorQuality.ALLOY },
    { q: ArmorQuality.ALLOY, t: ArmorQuality.CRYSTAL },
    { q: ArmorQuality.CRYSTAL, t: ArmorQuality.QUANTUM },
    { q: ArmorQuality.QUANTUM, t: ArmorQuality.VOID },
  ];

  const maxBatch = selected ? Math.floor(getCount(selected.id, selected.quality) / 5) : 0;

  return (
    <div style={{ height: '100vh', background: '#0a0e27', display: 'flex', flexDirection: 'column' }}>
      {/* 头部 */}
      <header style={{ padding: '12px 16px', borderBottom: '1px solid #2a3050' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={onBack} style={{ color: '#a1a1aa', background: 'none', border: 'none', cursor: 'pointer' }}>
            ← 返回
          </button>
          <h1 style={{ color: 'white', fontSize: '16px', fontWeight: 'bold' }}>⚗️ 材料合成</h1>
          <div style={{ width: '50px' }} />
        </div>
      </header>

      {/* 规则提示 */}
      <div style={{ padding: '8px 16px', background: '#1a1f3a', fontSize: '11px', color: '#9ca3af' }}>
        5个低级材料 = 1个高级材料
      </div>

      {/* 主内容 */}
      <main style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* 左侧列表 */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
          {groups.map(g => {
            const items = list.filter(i => i.sourceQuality === g.q);
            if (items.length === 0) return null;
            return (
              <div key={g.q} style={{ marginBottom: '16px' }}>
                <div style={{ color: QUALITY_COLORS[g.q], fontSize: '12px', marginBottom: '8px', fontWeight: 'bold' }}>
                  {QUALITY_NAMES[g.q]} → {QUALITY_NAMES[g.t]}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                  {items.map(item => {
                    const isSel = selected?.id === item.materialId && selected?.quality === item.sourceQuality;
                    const count = Math.floor(item.hasCount / 5);
                    return (
                      <button
                        key={item.materialId}
                        onClick={() => setSelected({ id: item.materialId, quality: item.sourceQuality })}
                        style={{
                          padding: '10px',
                          background: isSel ? '#2a3050' : '#1a1f3a',
                          border: `1px solid ${isSel ? QUALITY_COLORS[g.q] : '#2a3050'}`,
                          borderRadius: '6px',
                          cursor: 'pointer',
                          textAlign: 'left'
                        }}
                      >
                        <div style={{ color: 'white', fontSize: '12px', marginBottom: '4px' }}>
                          {item.baseName}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
                          <span style={{ color: '#6b7280' }}>×{item.hasCount}</span>
                          <span style={{ color: QUALITY_COLORS[g.t] }}>可合{count}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {list.length === 0 && (
            <div style={{ textAlign: 'center', color: '#6b7280', padding: '40px' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>⚗️</div>
              <div style={{ fontSize: '12px' }}>材料不足，需要5个同品质材料</div>
            </div>
          )}
        </div>

        {/* 右侧操作 */}
        <div style={{ width: '160px', padding: '12px', borderLeft: '1px solid #2a3050', background: '#0f1429' }}>
          {selected ? (
            <>
              {/* 材料名 */}
              <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                <div style={{ color: 'white', fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>
                  {MATERIAL_NAMES[selected.id]}
                </div>
                <div style={{ color: QUALITY_COLORS[selected.quality], fontSize: '11px' }}>
                  {QUALITY_NAMES[selected.quality]}
                </div>
              </div>

              {/* 合成预览 */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: '40px', height: '40px', background: '#1a1f3a', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '4px' }}>
                    <span style={{ color: QUALITY_COLORS[selected.quality] }}>⚙️</span>
                  </div>
                  <div style={{ fontSize: '9px', color: '#6b7280' }}>×5</div>
                </div>
                <span style={{ color: '#6b7280' }}>→</span>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: '40px', height: '40px', background: '#1a1f3a', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '4px' }}>
                    <span style={{ color: QUALITY_COLORS[selected.quality + 1] || '#f59e0b' }}>⚙️</span>
                  </div>
                  <div style={{ fontSize: '9px', color: '#6b7280' }}>×1</div>
                </div>
              </div>

              {/* 数量选择 */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '10px', color: '#6b7280', marginBottom: '8px', textAlign: 'center' }}>
                  最多 {maxBatch} 次
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {[1, 5, 10, maxBatch].filter((v, i, a) => v > 0 && a.indexOf(v) === i).slice(0, 3).map(n => (
                    <button
                      key={n}
                      onClick={() => handleSynth(Math.min(n, maxBatch))}
                      disabled={n > maxBatch}
                      style={{
                        padding: '8px',
                        background: n === 1 ? '#f59e0b' : '#2a3050',
                        border: 'none',
                        borderRadius: '4px',
                        color: n === 1 ? '#0a0e27' : 'white',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        cursor: n > maxBatch ? 'not-allowed' : 'pointer',
                        opacity: n > maxBatch ? 0.5 : 1
                      }}
                    >
                      合成 {n} 次
                    </button>
                  ))}
                </div>
              </div>

              {/* 当前数量 */}
              <div style={{ textAlign: 'center', fontSize: '10px', color: '#6b7280' }}>
                拥有: {getCount(selected.id, selected.quality)}
              </div>
            </>
          ) : (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>⚗️</div>
              <div style={{ fontSize: '11px' }}>选择材料</div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
