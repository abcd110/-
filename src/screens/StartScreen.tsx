import { useEffect, useState } from 'react';
import { useGameStore } from '../stores/gameStore';

interface StartScreenProps {
  onStartGame: () => void;
}

export default function StartScreen({ onStartGame }: StartScreenProps) {
  const { hasSave, init, newGame, loadGame, isLoading } = useGameStore();
  const [stars, setStars] = useState<Array<{ id: number; x: number; y: number; size: number; delay: number }>>([]);
  const [showTitle, setShowTitle] = useState(false);
  const [showButtons, setShowButtons] = useState(false);

  useEffect(() => {
    init();

    // 生成随机星星
    const newStars = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      delay: Math.random() * 3,
    }));
    setStars(newStars);

    // 动画序列
    const titleTimer = setTimeout(() => setShowTitle(true), 300);
    const buttonsTimer = setTimeout(() => setShowButtons(true), 800);

    return () => {
      clearTimeout(titleTimer);
      clearTimeout(buttonsTimer);
    };
  }, [init]);

  const handleNewGame = () => {
    newGame();
    onStartGame();
  };

  const handleContinue = async () => {
    const success = await loadGame();
    if (success) {
      onStartGame();
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0a0e27 0%, #1a1f3a 50%, #2a3050 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* 动态星空背景 */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
      }}>
        {stars.map((star) => (
          <div
            key={star.id}
            style={{
              position: 'absolute',
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              backgroundColor: '#ffffff',
              borderRadius: '50%',
              opacity: 0,
              animation: `twinkle 2s ease-in-out infinite`,
              animationDelay: `${star.delay}s`,
              boxShadow: '0 0 10px rgba(255, 255, 255, 0.8)',
            }}
          />
        ))}
      </div>

      {/* 星云效果 */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '10%',
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle, rgba(0, 212, 255, 0.15) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'nebula 8s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '30%',
        right: '15%',
        width: '250px',
        height: '250px',
        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.12) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'nebula 10s ease-in-out infinite reverse',
      }} />

      {/* 流星效果 */}
      <div style={{
        position: 'absolute',
        top: '15%',
        right: '20%',
        width: '100px',
        height: '2px',
        background: 'linear-gradient(90deg, transparent, #00d4ff, transparent)',
        transform: 'rotate(-45deg)',
        animation: 'meteor 3s linear infinite',
        animationDelay: '1s',
      }} />
      <div style={{
        position: 'absolute',
        top: '40%',
        left: '5%',
        width: '80px',
        height: '2px',
        background: 'linear-gradient(90deg, transparent, #8b5cf6, transparent)',
        transform: 'rotate(-45deg)',
        animation: 'meteor 4s linear infinite',
        animationDelay: '2.5s',
      }} />

      {/* 主标题区域 */}
      <div style={{
        textAlign: 'center',
        marginBottom: '60px',
        position: 'relative',
        zIndex: 10,
        opacity: showTitle ? 1 : 0,
        transform: showTitle ? 'translateY(0)' : 'translateY(30px)',
        transition: 'all 0.8s ease-out',
      }}>
        {/* 飞船图标动画 */}
        <div style={{
          fontSize: '80px',
          marginBottom: '20px',
          animation: 'float 3s ease-in-out infinite',
          filter: 'drop-shadow(0 0 30px rgba(0, 212, 255, 0.5))',
        }}>
          🚀
        </div>

        {/* 游戏标题 */}
        <h1 style={{
          fontSize: '48px',
          fontWeight: 'bold',
          background: 'linear-gradient(135deg, #00d4ff 0%, #8b5cf6 50%, #00d4ff 100%)',
          backgroundSize: '200% 200%',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: '16px',
          textShadow: '0 0 40px rgba(0, 212, 255, 0.5)',
          animation: 'gradient 3s ease infinite',
          letterSpacing: '4px',
        }}>
          星航荒宇
        </h1>

        {/* 副标题 */}
        <p style={{
          color: '#a1a1aa',
          fontSize: '16px',
          letterSpacing: '2px',
          opacity: 0.8,
        }}>
          在无尽星海中，寻找人类最后的希望
        </p>

        {/* 装饰线 */}
        <div style={{
          width: '200px',
          height: '2px',
          background: 'linear-gradient(90deg, transparent, #00d4ff, transparent)',
          margin: '20px auto',
          animation: 'pulse 2s ease-in-out infinite',
        }} />
      </div>

      {/* 按钮区域 */}
      <div style={{
        width: '100%',
        maxWidth: '320px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        position: 'relative',
        zIndex: 10,
        opacity: showButtons ? 1 : 0,
        transform: showButtons ? 'translateY(0)' : 'translateY(20px)',
        transition: 'all 0.6s ease-out',
        transitionDelay: '0.2s',
      }}>
        {hasSave && (
          <button
            onClick={handleContinue}
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '16px 24px',
              background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.6 : 1,
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 20px rgba(0, 212, 255, 0.4)',
              position: 'relative',
              overflow: 'hidden',
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.transform = 'scale(1.02)';
                e.currentTarget.style.boxShadow = '0 6px 30px rgba(0, 212, 255, 0.6)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 212, 255, 0.4)';
            }}
          >
            <span style={{ position: 'relative', zIndex: 1 }}>
              {isLoading ? '加载中...' : '继续航行'}
            </span>
            {/* 按钮光效 */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: '-100%',
              width: '100%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
              animation: 'shimmer 2s infinite',
            }} />
          </button>
        )}

        <button
          onClick={handleNewGame}
          style={{
            width: '100%',
            padding: '16px 24px',
            background: 'transparent',
            border: '2px solid rgba(0, 212, 255, 0.5)',
            borderRadius: '12px',
            color: '#00d4ff',
            fontSize: '18px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            position: 'relative',
            overflow: 'hidden',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(0, 212, 255, 0.1)';
            e.currentTarget.style.borderColor = '#00d4ff';
            e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 212, 255, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.borderColor = 'rgba(0, 212, 255, 0.5)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          新的征程
        </button>
      </div>

      {/* 版本信息 */}
      <div style={{
        position: 'absolute',
        bottom: '24px',
        color: '#71717a',
        fontSize: '12px',
        letterSpacing: '1px',
        opacity: showButtons ? 0.6 : 0,
        transition: 'opacity 0.6s ease-out',
        transitionDelay: '0.4s',
      }}>
        v0.1.0 - 星际探索版
      </div>

      {/* CSS 动画 */}
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(5deg); }
        }
        
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes nebula {
          0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.5; }
          50% { transform: scale(1.2) rotate(180deg); opacity: 0.8; }
        }
        
        @keyframes meteor {
          0% { transform: translateX(100px) translateY(-100px) rotate(-45deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateX(-300px) translateY(300px) rotate(-45deg); opacity: 0; }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        
        @keyframes shimmer {
          0% { left: -100%; }
          100% { left: 100%; }
        }
      `}</style>
    </div>
  );
}
