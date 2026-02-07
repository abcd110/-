interface BottomNavProps {
  currentScreen: string;
  onNavigate: (screen: string) => void;
}

export default function BottomNav({ currentScreen, onNavigate }: BottomNavProps) {
  const navItems = [
    { id: 'home', label: '舰桥', icon: '🚀' },
    { id: 'exploration', label: '星图', icon: '🪐' },
    { id: 'inventory', label: '货舱', icon: '📦' },
    { id: 'quests', label: '任务', icon: '📜' },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'linear-gradient(180deg, rgba(26, 31, 58, 0.95) 0%, rgba(10, 14, 39, 0.98) 100%)',
        borderTop: '1px solid rgba(0, 212, 255, 0.3)',
        boxShadow: '0 -4px 20px rgba(0, 212, 255, 0.1)',
        zIndex: 9999,
        backdropFilter: 'blur(10px)'
      }}
    >
      {/* 顶部发光条 */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '1px',
        background: 'linear-gradient(90deg, transparent 0%, #00d4ff 50%, transparent 100%)',
        opacity: 0.5
      }} />

      <div
        style={{
          maxWidth: '430px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          height: '64px',
          paddingBottom: 'env(safe-area-inset-bottom, 0)'
        }}
      >
        {navItems.map(item => {
          const isActive = currentScreen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                flex: 1,
                height: '100%',
                background: 'none',
                border: 'none',
                color: isActive ? '#00d4ff' : '#71717a',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: isActive ? '600' : '400',
                transition: 'all 0.3s ease',
                textShadow: isActive ? '0 0 10px rgba(0, 212, 255, 0.5)' : 'none',
                position: 'relative'
              }}
            >
              {/* 激活指示器 */}
              {isActive && (
                <div style={{
                  position: 'absolute',
                  top: '4px',
                  width: '4px',
                  height: '4px',
                  borderRadius: '50%',
                  background: '#00d4ff',
                  boxShadow: '0 0 8px #00d4ff'
                }} />
              )}
              <span style={{
                fontSize: '22px',
                marginBottom: '2px',
                filter: isActive ? 'drop-shadow(0 0 4px rgba(0, 212, 255, 0.5))' : 'none',
                transform: isActive ? 'scale(1.1)' : 'scale(1)',
                transition: 'all 0.3s ease'
              }}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
