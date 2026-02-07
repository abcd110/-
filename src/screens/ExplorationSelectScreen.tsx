import { useGameStore } from '../stores/gameStore';

interface ExplorationSelectScreenProps {
  onBack: () => void;
  onNavigate: (screen: string, params?: { planetType?: string }) => void;
}

export default function ExplorationSelectScreen({ onBack, onNavigate }: ExplorationSelectScreenProps) {

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
          <h1 style={{ color: 'white', fontWeight: 'bold', fontSize: '18px' }}>🗺️ 探索</h1>
          <div style={{ width: '48px' }} />
        </div>
      </header>

      {/* 主内容区 */}
      <main style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px 16px'
      }}>
        {/* 标题 */}
        <div style={{
          textAlign: 'center',
          marginBottom: '24px'
        }}>
          <p style={{ color: '#a1a1aa', fontSize: '14px' }}>选择探索区域</p>
        </div>

        {/* 探索选项 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* 联邦科技星 */}
          <button
            onClick={() => onNavigate('normal-stations', { planetType: 'tech' })}
            style={{
              background: 'linear-gradient(135deg, #0c4a6e 0%, #0891b2 100%)',
              border: '2px solid #00d4ff',
              borderRadius: '16px',
              padding: '24px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              boxShadow: '0 4px 12px rgba(0, 212, 255, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 212, 255, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 212, 255, 0.3)';
            }}
          >
            {/* 图标 */}
            <div style={{
              width: '64px',
              height: '64px',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px'
            }}>
              🏭
            </div>

            {/* 内容 */}
            <div style={{ flex: 1, textAlign: 'left' }}>
              <h2 style={{
                color: 'white',
                fontSize: '20px',
                fontWeight: 'bold',
                margin: '0 0 6px 0'
              }}>
                联邦科技星
              </h2>
              <p style={{
                color: '#a5f3fc',
                fontSize: '13px',
                margin: 0,
                lineHeight: '1.4'
              }}>
                探索联邦科技星获取科技装备和工业资源
              </p>
            </div>

            {/* 箭头 */}
            <span style={{
              color: '#00d4ff',
              fontSize: '24px',
              fontWeight: 'bold'
            }}>
              ›
            </span>
          </button>

          {/* 神域星 */}
          <button
            onClick={() => onNavigate('normal-stations', { planetType: 'god' })}
            style={{
              background: 'linear-gradient(135deg, #5b21b6 0%, #7c3aed 100%)',
              border: '2px solid #8b5cf6',
              borderRadius: '16px',
              padding: '24px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(139, 92, 246, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.3)';
            }}
          >
            {/* 图标 */}
            <div style={{
              width: '64px',
              height: '64px',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px'
            }}>
              ⭐
            </div>

            {/* 内容 */}
            <div style={{ flex: 1, textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <h2 style={{
                  color: 'white',
                  fontSize: '20px',
                  fontWeight: 'bold',
                  margin: 0
                }}>
                  神域星
                </h2>
                <span style={{
                  backgroundColor: '#8b5cf6',
                  color: 'white',
                  fontSize: '10px',
                  padding: '2px 8px',
                  borderRadius: '10px'
                }}>
                  高难度
                </span>
              </div>
              <p style={{
                color: '#c4b5fd',
                fontSize: '13px',
                margin: 0,
                lineHeight: '1.4'
              }}>
                探索神域星获取神能装备和稀有资源
              </p>
            </div>

            {/* 箭头 */}
            <span style={{
              color: '#8b5cf6',
              fontSize: '24px',
              fontWeight: 'bold'
            }}>
              ›
            </span>
          </button>

          {/* 废土星 */}
          <button
            onClick={() => onNavigate('normal-stations', { planetType: 'wasteland' })}
            style={{
              background: 'linear-gradient(135deg, #7f1d1d 0%, #dc2626 100%)',
              border: '2px solid #ef4444',
              borderRadius: '16px',
              padding: '24px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(239, 68, 68, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
            }}
          >
            {/* 图标 */}
            <div style={{
              width: '64px',
              height: '64px',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px'
            }}>
              💀
            </div>

            {/* 内容 */}
            <div style={{ flex: 1, textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <h2 style={{
                  color: 'white',
                  fontSize: '20px',
                  fontWeight: 'bold',
                  margin: 0
                }}>
                  废土星
                </h2>
                <span style={{
                  backgroundColor: '#ef4444',
                  color: 'white',
                  fontSize: '10px',
                  padding: '2px 8px',
                  borderRadius: '10px'
                }}>
                  危险
                </span>
              </div>
              <p style={{
                color: '#fca5a5',
                fontSize: '13px',
                margin: 0,
                lineHeight: '1.4'
              }}>
                探索废土星获取稀有材料，但危险重重
              </p>
            </div>

            {/* 箭头 */}
            <span style={{
              color: '#ef4444',
              fontSize: '24px',
              fontWeight: 'bold'
            }}>
              ›
            </span>
          </button>
        </div>

        {/* 提示信息 */}
        <div style={{
          marginTop: '24px',
          padding: '16px',
          backgroundColor: '#1f2937',
          borderRadius: '12px',
          border: '1px solid #374151'
        }}>
          <p style={{
            color: '#a1a1aa',
            fontSize: '12px',
            margin: 0,
            lineHeight: '1.6'
          }}>
            💡 <strong style={{ color: '#d1d5db' }}>探索提示：</strong><br />
            • 联邦科技星适合获取基础资源和装备<br />
            • 神域星难度较高，但神能装备更强大<br />
            • 废土星危险重重，但稀有材料丰富
          </p>
        </div>
      </main>
    </div>
  );
}
