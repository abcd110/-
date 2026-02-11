import { useState, useEffect } from 'react';
import 联邦科技星Img from '../assets/images/联邦科技星.png';
import 神域星Img from '../assets/images/神域星.png';
import 废土星Img from '../assets/images/废土星.png';
import 探索背景Img from '../assets/images/探索背景.jpg';

interface ExplorationSelectScreenProps {
  onBack: () => void;
  onNavigate: (screen: string, params?: { planetType?: string }) => void;
}

const planets = [
  {
    id: 'tech',
    name: '联邦科技星',
    subtitle: 'FEDERATION TECH',
    description: '高科技文明，资源丰富',
    image: 联邦科技星Img,
    route: 'normal-stations',
    theme: {
      primary: '#00d4ff',
      secondary: '#0099cc',
      glow: 'rgba(0, 212, 255, 0.6)',
      gradient: 'linear-gradient(135deg, #0c4a6e 0%, #0891b2 50%, #00d4ff 100%)'
    }
  },
  {
    id: 'god',
    name: '神域星',
    subtitle: 'DIVINE REALM',
    description: '神秘能量，古老遗迹',
    image: 神域星Img,
    route: 'normal-stations',
    theme: {
      primary: '#c084fc',
      secondary: '#7c3aed',
      glow: 'rgba(192, 132, 252, 0.6)',
      gradient: 'linear-gradient(135deg, #5b21b6 0%, #7c3aed 50%, #c084fc 100%)'
    }
  },
  {
    id: 'wasteland',
    name: '废土星',
    subtitle: 'WASTELAND',
    description: '危险区域，稀有材料',
    image: 废土星Img,
    route: 'normal-stations',
    theme: {
      primary: '#f87171',
      secondary: '#dc2626',
      glow: 'rgba(248, 113, 113, 0.6)',
      gradient: 'linear-gradient(135deg, #7f1d1d 0%, #dc2626 50%, #f87171 100%)'
    }
  }
];

// 动画样式
const animationStyles = `
  @keyframes scan {
    0% { transform: translateY(-100%); }
    100% { transform: translateY(100%); }
  }
  @keyframes pulse-glow {
    0%, 100% { opacity: 0.5; box-shadow: 0 0 10px currentColor; }
    50% { opacity: 1; box-shadow: 0 0 20px currentColor, 0 0 30px currentColor; }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    25% { transform: translateY(-5px) rotate(1deg); }
    50% { transform: translateY(-10px) rotate(0deg); }
    75% { transform: translateY(-5px) rotate(-1deg); }
  }
  @keyframes rotate-slow {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  @keyframes rotate-reverse {
    from { transform: rotate(360deg); }
    to { transform: rotate(0deg); }
  }
  @keyframes border-flow {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  @keyframes card-pulse {
    0%, 100% { box-shadow: 0 0 20px rgba(0,0,0,0.4); }
    50% { box-shadow: 0 0 40px rgba(0,0,0,0.6), 0 0 60px rgba(255,255,255,0.1); }
  }
  @keyframes text-glow {
    0%, 100% { text-shadow: 0 0 10px currentColor; }
    50% { text-shadow: 0 0 20px currentColor, 0 0 30px currentColor, 0 0 40px currentColor; }
  }
  @keyframes arrow-bounce {
    0%, 100% { transform: translateX(0); }
    50% { transform: translateX(6px); }
  }
  @keyframes star-twinkle {
    0%, 100% { opacity: 0.3; }
    50% { opacity: 1; }
  }
  @keyframes energy-pulse {
    0%, 100% { transform: scale(1); opacity: 0.5; }
    50% { transform: scale(1.1); opacity: 0.8; }
  }
  @keyframes hologram-flicker {
    0%, 100% { opacity: 1; }
    5% { opacity: 0.8; }
    10% { opacity: 1; }
    15% { opacity: 0.9; }
    20% { opacity: 1; }
  }
`;

export default function ExplorationSelectScreen({ onBack, onNavigate }: ExplorationSelectScreenProps) {
  const [mounted, setMounted] = useState(false);
  const [hoveredPlanet, setHoveredPlanet] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <style>{animationStyles}</style>
      <div style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* 背景层 */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url(${探索背景Img})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          zIndex: 0
        }} />

        {/* 暗角效果 */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.7) 100%)',
          zIndex: 1
        }} />

        {/* 扫描线效果 */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(180deg, transparent 0%, rgba(0, 212, 255, 0.03) 50%, transparent 100%)',
          backgroundSize: '100% 4px',
          animation: 'scan 8s linear infinite',
          pointerEvents: 'none',
          zIndex: 2
        }} />

        {/* 网格叠加 */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            linear-gradient(rgba(0, 212, 255, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 212, 255, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          zIndex: 1
        }} />

        {/* 顶部标题栏 - 玻璃拟态 */}
        <header style={{
          flexShrink: 0,
          padding: '12px 16px',
          position: 'relative',
          zIndex: 10,
          background: 'rgba(0, 20, 40, 0.6)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(0, 212, 255, 0.3)',
          boxShadow: '0 0 20px rgba(0, 212, 255, 0.1)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <button
              onClick={onBack}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: '#00d4ff',
                background: 'rgba(0, 212, 255, 0.1)',
                border: '1px solid rgba(0, 212, 255, 0.4)',
                borderRadius: '8px',
                padding: '8px 12px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500,
                letterSpacing: '1px',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 0 15px rgba(0, 212, 255, 0.2)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(0, 212, 255, 0.2)';
                e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 212, 255, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(0, 212, 255, 0.1)';
                e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 212, 255, 0.2)';
              }}
            >
              <span style={{ fontSize: '14px' }}>◀</span>
              <span>返回</span>
            </button>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)'
            }}>
              <h1 style={{
                color: '#00d4ff',
                fontWeight: 'bold',
                fontSize: '18px',
                margin: 0,
                letterSpacing: '3px',
                textTransform: 'uppercase',
                textShadow: '0 0 15px rgba(0, 212, 255, 0.8), 0 0 30px rgba(0, 212, 255, 0.4)'
              }}>
                星际探索
              </h1>
              <span style={{
                color: 'rgba(0, 212, 255, 0.6)',
                fontSize: '8px',
                letterSpacing: '3px',
                marginTop: '2px'
              }}>
                INTERSTELLAR EXPLORATION
              </span>
            </div>

            <div style={{ width: '70px' }} />
          </div>
        </header>

        {/* 主内容区 */}
        <main style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px 20px 32px',
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: '16px'
        }}>
          {planets.map((planet, index) => (
            <button
              key={planet.id}
              onClick={() => onNavigate(planet.route, { planetType: planet.id })}
              onMouseEnter={() => setHoveredPlanet(planet.id)}
              onMouseLeave={() => setHoveredPlanet(null)}
              style={{
                position: 'relative',
                background: hoveredPlanet === planet.id 
                  ? `linear-gradient(135deg, rgba(0,0,0,0.6) 0%, ${planet.theme.glow}20 50%, rgba(0,0,0,0.6) 100%)`
                  : 'rgba(0, 0, 0, 0.5)',
                border: 'none',
                borderRadius: '16px',
                padding: '0',
                cursor: 'pointer',
                backdropFilter: 'blur(10px)',
                overflow: 'hidden',
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.95)',
                transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                transitionDelay: `${index * 100}ms`,
                boxShadow: hoveredPlanet === planet.id 
                  ? `0 0 40px ${planet.theme.glow}, inset 0 0 60px ${planet.theme.glow}30`
                  : `0 0 20px ${planet.theme.glow}40, inset 0 0 40px rgba(0,0,0,0.5)`
              }}
            >
              {/* 动态边框 */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                borderRadius: '16px',
                padding: '2px',
                backgroundImage: `linear-gradient(90deg, ${planet.theme.primary}, ${planet.theme.secondary}, ${planet.theme.primary})`,
                backgroundSize: '200% 100%',
                animation: 'border-flow 3s ease infinite',
                WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                WebkitMaskComposite: 'xor',
                maskComposite: 'exclude'
              }} />

              {/* 扫描线效果 */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                overflow: 'hidden',
                borderRadius: '16px',
                pointerEvents: 'none'
              }}>
                <div style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  height: '2px',
                  background: `linear-gradient(90deg, transparent, ${planet.theme.primary}, transparent)`,
                  boxShadow: `0 0 10px ${planet.theme.primary}`,
                  animation: 'scan 2.5s linear infinite'
                }} />
              </div>

              {/* 能量波纹 */}
              {hoveredPlanet === planet.id && (
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '100%',
                  height: '100%',
                  borderRadius: '16px',
                  border: `2px solid ${planet.theme.primary}`,
                  animation: 'energy-pulse 1.5s ease-out infinite',
                  pointerEvents: 'none'
                }} />
              )}

              {/* 内容容器 */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '16px 20px',
                position: 'relative',
                zIndex: 2
              }}>
                {/* 星球图片容器 */}
                <div style={{
                  position: 'relative',
                  width: '80px',
                  height: '80px',
                  flexShrink: 0
                }}>
                  {/* 外圈光环 */}
                  <div style={{
                    position: 'absolute',
                    top: '-6px',
                    left: '-6px',
                    right: '-6px',
                    bottom: '-6px',
                    borderRadius: '50%',
                    borderWidth: '2px',
                    borderStyle: 'solid',
                    borderTopColor: 'transparent',
                    borderRightColor: planet.theme.primary,
                    borderBottomColor: 'transparent',
                    borderLeftColor: planet.theme.primary,
                    animation: 'rotate-slow 10s linear infinite',
                    opacity: hoveredPlanet === planet.id ? 0.8 : 0.5
                  }} />

                  {/* 内圈光环 */}
                  <div style={{
                    position: 'absolute',
                    top: '-3px',
                    left: '-3px',
                    right: '-3px',
                    bottom: '-3px',
                    borderRadius: '50%',
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderTopColor: planet.theme.secondary,
                    borderRightColor: 'transparent',
                    borderBottomColor: planet.theme.secondary,
                    borderLeftColor: 'transparent',
                    animation: 'rotate-reverse 8s linear infinite',
                    opacity: hoveredPlanet === planet.id ? 0.6 : 0.4
                  }} />

                  {/* 星球图片 */}
                  <div style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: `3px solid ${planet.theme.primary}`,
                    boxShadow: hoveredPlanet === planet.id 
                      ? `0 0 40px ${planet.theme.glow}, inset 0 0 30px ${planet.theme.glow}`
                      : `0 0 20px ${planet.theme.glow}, inset 0 0 15px ${planet.theme.glow}`,
                    animation: 'float 4s ease-in-out infinite',
                    transition: 'all 0.3s ease'
                  }}>
                    <img
                      src={planet.image}
                      alt={planet.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  </div>

                  {/* 脉冲点 */}
                  <div style={{
                    position: 'absolute',
                    top: '0',
                    right: '0',
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: planet.theme.primary,
                    boxShadow: `0 0 10px ${planet.theme.primary}, 0 0 20px ${planet.theme.primary}`,
                    animation: 'pulse-glow 2s ease-in-out infinite'
                  }} />
                </div>

                {/* 文字内容 */}
                <div style={{
                  flex: 1,
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px'
                }}>
                  <span style={{
                    color: 'rgba(255,255,255,0.5)',
                    fontSize: '9px',
                    letterSpacing: '2px',
                    fontWeight: 500
                  }}>
                    {planet.subtitle}
                  </span>
                  <h2 style={{
                    color: '#fff',
                    fontSize: '20px',
                    fontWeight: 'bold',
                    margin: 0,
                    letterSpacing: '1px',
                    textShadow: hoveredPlanet === planet.id 
                      ? `0 0 20px ${planet.theme.glow}, 0 0 40px ${planet.theme.glow}`
                      : `0 0 10px ${planet.theme.glow}`,
                    transition: 'all 0.3s ease'
                  }}>
                    {planet.name}
                  </h2>
                  <p style={{
                    color: 'rgba(255,255,255,0.6)',
                    fontSize: '11px',
                    margin: '4px 0 0 0'
                  }}>
                    {planet.description}
                  </p>

                  {/* 装饰线 */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginTop: '6px'
                  }}>
                    <div style={{
                      width: '30px',
                      height: '2px',
                      background: planet.theme.gradient,
                      borderRadius: '1px'
                    }} />
                    <div style={{
                      width: '4px',
                      height: '4px',
                      borderRadius: '50%',
                      background: planet.theme.primary,
                      boxShadow: `0 0 8px ${planet.theme.primary}`,
                      animation: 'pulse-glow 2s ease-in-out infinite'
                    }} />
                    <div style={{
                      width: '10px',
                      height: '1px',
                      background: planet.theme.secondary,
                      opacity: 0.5
                    }} />
                  </div>
                </div>

                {/* 箭头 */}
                <div style={{
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  background: hoveredPlanet === planet.id 
                    ? `linear-gradient(135deg, ${planet.theme.primary}, ${planet.theme.secondary})`
                    : `linear-gradient(135deg, ${planet.theme.secondary}, ${planet.theme.primary})`,
                  boxShadow: hoveredPlanet === planet.id 
                    ? `0 0 25px ${planet.theme.glow}`
                    : `0 0 15px ${planet.theme.glow}`,
                  transition: 'all 0.3s ease'
                }}>
                  <span style={{
                    color: '#fff',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    animation: 'arrow-bounce 1.5s ease-in-out infinite'
                  }}>
                    →
                  </span>
                </div>
              </div>

              {/* 底部渐变条 */}
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '3px',
                background: planet.theme.gradient,
                opacity: hoveredPlanet === planet.id ? 1 : 0.7
              }} />
            </button>
          ))}
        </main>
      </div>
    </>
  );
}
