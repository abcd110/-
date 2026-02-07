import { useState } from 'react';
import { useGameStore } from '../stores/gameStore';
import { TYPE_ICONS } from '../data/types';

interface ShopScreenProps {
  onBack: () => void;
}

interface QuantityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (quantity: number) => void;
  itemName: string;
  price: number;
  maxQuantity: number;
  currentCoins: number;
}

function QuantityModal({ isOpen, onClose, onConfirm, itemName, price, maxQuantity, currentCoins }: QuantityModalProps) {
  const [quantity, setQuantity] = useState(1);

  if (!isOpen) return null;

  const maxAffordable = Math.floor(currentCoins / price);
  const actualMax = Math.min(maxQuantity, maxAffordable);
  const totalPrice = quantity * price;

  const handleConfirm = () => {
    if (quantity > 0 && quantity <= actualMax) {
      onConfirm(quantity);
      setQuantity(1);
    }
  };

  const handleClose = () => {
    setQuantity(1);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100
    }}>
      <div style={{
        backgroundColor: '#1a1f3a',
        borderRadius: '16px',
        padding: '24px',
        width: '90%',
        maxWidth: '320px',
        border: '1px solid #2a3050'
      }}>
        <h3 style={{ color: 'white', fontWeight: 'bold', fontSize: '18px', margin: '0 0 16px 0', textAlign: 'center' }}>
          购买 {itemName}
        </h3>

        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: '#a1a1aa', fontSize: '14px' }}>单价</span>
            <span style={{ color: '#00d4ff', fontSize: '14px' }}>💰 {price}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span style={{ color: '#a1a1aa', fontSize: '14px' }}>总价</span>
            <span style={{ color: '#00d4ff', fontSize: '14px', fontWeight: 'bold' }}>💰 {totalPrice}</span>
          </div>

          {/* 数量选择 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '8px' }}>
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#374151',
                color: 'white',
                fontSize: '20px',
                cursor: 'pointer'
              }}
            >
              -
            </button>
            <input
              type="number"
              value={quantity}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 1;
                setQuantity(Math.max(1, Math.min(actualMax, val)));
              }}
              style={{
                width: '80px',
                height: '40px',
                textAlign: 'center',
                fontSize: '18px',
                fontWeight: 'bold',
                color: 'white',
                backgroundColor: '#1f2937',
                border: '1px solid #2a3050',
                borderRadius: '8px'
              }}
            />
            <button
              onClick={() => setQuantity(Math.min(actualMax, quantity + 1))}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#374151',
                color: 'white',
                fontSize: '20px',
                cursor: 'pointer'
              }}
            >
              +
            </button>
          </div>

          <div style={{ textAlign: 'center' }}>
            <button
              onClick={() => setQuantity(actualMax)}
              style={{
                fontSize: '12px',
                color: '#a1a1aa',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              最大数量: {actualMax}
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleClose}
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: '#374151',
              color: '#a1a1aa',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            取消
          </button>
          <button
            onClick={handleConfirm}
            disabled={quantity < 1 || quantity > actualMax}
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: quantity < 1 || quantity > actualMax ? '#2a3050' : '#0099cc',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: quantity < 1 || quantity > actualMax ? 'not-allowed' : 'pointer',
              fontWeight: 'bold'
            }}
          >
            确认购买
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ShopScreen({ onBack }: ShopScreenProps) {
  const { gameManager, buyItem } = useGameStore();
  const shopItems = Array.from(gameManager.shopItems.values());
  const [selectedItem, setSelectedItem] = useState<{ itemId: string; name: string; price: number; stock: number } | null>(null);

  const handleBuy = (itemId: string, quantity: number) => {
    const result = buyItem(itemId, quantity);
    alert(result.message);
    setSelectedItem(null);
  };

  const openQuantityModal = (itemId: string, name: string, price: number, stock: number) => {
    setSelectedItem({ itemId, name, price, stock });
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0e27', paddingBottom: '96px' }}>
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        backgroundColor: 'rgba(45, 45, 45, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(75, 85, 99, 0.3)',
        padding: '12px 16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            onClick={onBack}
            style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#a1a1aa', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <span style={{ fontSize: '18px' }}>←</span>
            <span style={{ fontSize: '14px' }}>返回</span>
          </button>
          <h1 style={{ color: 'white', fontWeight: 'bold', fontSize: '18px' }}>商店</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#00d4ff' }}>
            <span>💰</span>
            <span style={{ fontWeight: 'bold' }}>{gameManager.trainCoins}</span>
          </div>
        </div>
      </header>

      <main style={{ padding: '16px' }}>
        <section style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '12px'
        }}>
          {shopItems.map(shopItem => {
            const inventoryItem = gameManager.inventory.getItem(shopItem.itemId);
            const canAfford = gameManager.trainCoins >= shopItem.price;
            const hasStock = shopItem.stock > 0;
            const maxAffordable = Math.floor(gameManager.trainCoins / shopItem.price);
            const canBuyAny = canAfford && hasStock;

            return (
              <div
                key={shopItem.itemId}
                style={{
                  backgroundColor: '#1a1f3a',
                  borderRadius: '12px',
                  padding: '12px',
                  border: '1px solid #374151'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '24px' }}>{inventoryItem ? TYPE_ICONS[inventoryItem.type] : '📦'}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontWeight: 'bold', color: 'white', fontSize: '14px', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {shopItem.name}
                    </h3>
                    <p style={{ fontSize: '12px', color: '#6b7280', margin: '4px 0 0 0' }}>
                      限购: {shopItem.stock}/{shopItem.dailyLimit}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 'bold', color: canAfford ? '#00d4ff' : '#ef4444' }}>
                    💰 {shopItem.price}
                  </span>
                  <button
                    onClick={() => openQuantityModal(shopItem.itemId, shopItem.name, shopItem.price, shopItem.stock)}
                    disabled={!canBuyAny}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: !canBuyAny ? '#374151' : '#0099cc',
                      color: !canBuyAny ? '#6b7280' : 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: !canBuyAny ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
                      fontWeight: 'bold'
                    }}
                  >
                    {!hasStock ? '售罄' : !canAfford ? '金币不足' : '购买'}
                  </button>
                </div>
              </div>
            );
          })}
        </section>

        {/* 提示 */}
        <div style={{
          marginTop: '16px',
          padding: '12px',
          backgroundColor: '#1a1f3a',
          borderRadius: '8px',
          border: '1px solid #374151'
        }}>
          <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
            💡 商店每日刷新，限购商品会在第二天重置
          </p>
        </div>
      </main>

      {/* 数量选择弹窗 */}
      {selectedItem && (
        <QuantityModal
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          onConfirm={(quantity) => handleBuy(selectedItem.itemId, quantity)}
          itemName={selectedItem.name}
          price={selectedItem.price}
          maxQuantity={selectedItem.stock}
          currentCoins={gameManager.trainCoins}
        />
      )}
    </div>
  );
}
