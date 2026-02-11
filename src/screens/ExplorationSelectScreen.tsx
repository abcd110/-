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
    0%, 100% { opacity: 0.5; }
    50% { opacity: 1; }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
  @keyframes rotate-slow {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
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
    50% { text-shadow: 0 0 20px currentColor, 0 0 30px currentColor; }
  }
  @keyframes arrow-bounce {
    0%, 100% { transform: translateX(0); }
    50% { transform: translateX(4px); }
  }
`;

export default function ExplorationSelectScreen({ onBack, onNavigate }: ExplorationSelectScreenProps) {
  const [mounted, setMounted] = useState(false);

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
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.6) 100%)',
          zIndex: 1
        }} />

        {/* 网格叠加 */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            linear-gradient(rgba(0, 212, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 212, 255, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          zIndex: 1
        }} />

        {/* 顶部标题栏 */}
        <header style={{
          flexShrink: 0,
          padding: '16px 20px',
          position: 'relative',
          zIndex: 10
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
                gap: '8px',
                color: '#00d4ff',
                background: 'rgba(0, 0, 0, 0.5)',
                border: '1px solid rgba(0, 212, 255, 0.4)',
                borderRadius: '8px',
                padding: '10px 16px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500,
                letterSpacing: '1px',
                textTransform: 'uppercase',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 0 20px rgba(0, 212, 255, 0.2)'
              }}
            >
              <span style={{ fontSize: '16px' }}>◀</span>
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
                color: '#fff',
                fontWeight: 'bold',
                fontSize: '20px',
                margin: 0,
                letterSpacing: '3px',
                textTransform: 'uppercase',
                textShadow: '0 0 20px rgba(0, 212, 255, 0.8), 0 0 40px rgba(0, 212, 255, 0.4)'
              }}>
                星际探索
              </h1>
              <span style={{
                color: 'rgba(0, 212, 255, 0.7)',
                fontSize: '9px',
                letterSpacing: '4px',
                marginTop: '2px',
                whiteSpace: 'nowrap'
              }}>
                INTERSTELLAR EXPLORATION
              </span>
            </div>

            <div style={{ width: '60px' }} />
          </div>
        </header>

        {/* 主内容区 */}
        <main style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px 24px 40px',
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: '20px'
        }}>
          {planets.map((planet, index) => (
            <button
              key={planet.id}
              onClick={() => onNavigate(planet.route, { planetType: planet.id })}
              style={{
                position: 'relative',
                background: 'rgba(0, 0, 0, 0.4)',
                border: 'none',
                borderRadius: '16px',
                padding: '0',
                cursor: 'pointer',
                backdropFilter: 'blur(10px)',
                overflow: 'hidden',
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateY(0)' : 'translateY(30px)',
                transition: 'opacity 0.5s ease, transform 0.5s ease',
                transitionDelay: `${index * 100}ms`,
                boxShadow: `0 0 30px ${planet.theme.glow}, inset 0 0 60px rgba(0,0,0,0.5)`,
                animation: 'card-pulse 3s ease-in-out infinite'
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
                  animation: 'scan 2s linear infinite'
                }} />
              </div>

              {/* 内容容器 */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                padding: '20px 24px',
                position: 'relative',
                zIndex: 2
              }}>
                {/* 星球图片容器 */}
                <div style={{
                  position: 'relative',
                  width: '90px',
                  height: '90px',
                  flexShrink: 0
                }}>
                  {/* 外圈光环 */}
                  <div style={{
                    position: 'absolute',
                    top: '-8px',
                    left: '-8px',
                    right: '-8px',
                    bottom: '-8px',
                    borderRadius: '50%',
                    borderWidth: '2px',
                    borderStyle: 'solid',
                    borderTopColor: 'transparent',
                    borderRightColor: planet.theme.primary,
                    borderBottomColor: 'transparent',
                    borderLeftColor: planet.theme.primary,
                    animation: 'rotate-slow 8s linear infinite',
                    opacity: 0.6
                  }} />

                  {/* 内圈光环 */}
                  <div style={{
                    position: 'absolute',
                    top: '-4px',
                    left: '-4px',
                    right: '-4px',
                    bottom: '-4px',
                    borderRadius: '50%',
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderTopColor: planet.theme.secondary,
                    borderRightColor: 'transparent',
                    borderBottomColor: planet.theme.secondary,
                    borderLeftColor: 'transparent',
                    animation: 'rotate-slow 6s linear infinite reverse',
                    opacity: 0.4
                  }} />

                  {/* 星球图片 */}
                  <div style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: `3px solid ${planet.theme.primary}`,
                    boxShadow: `0 0 30px ${planet.theme.glow}, inset 0 0 20px ${planet.theme.glow}`,
                    animation: 'float 3s ease-in-out infinite'
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
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: planet.theme.primary,
                    boxShadow: `0 0 10px ${planet.theme.primary}`,
                    animation: 'pulse-glow 2s ease-in-out infinite'
                  }} />
                </div>

                {/* 文字内容 */}
                <div style={{
                  flex: 1,
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}>
                  <span style={{
                    color: 'rgba(255,255,255,0.5)',
                    fontSize: '10px',
                    letterSpacing: '3px',
                    fontWeight: 500
                  }}>
                    {planet.subtitle}
                  </span>
                  <h2 style={{
                    color: '#fff',
                    fontSize: '24px',
                    fontWeight: 'bold',
                    margin: 0,
                    letterSpacing: '2px',
                    textShadow: `0 0 20px ${planet.theme.glow}`,
                    animation: 'text-glow 2s ease-in-out infinite'
                  }}>
                    {planet.name}
                  </h2>

                  {/* 装饰线 */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginTop: '4px'
                  }}>
                    <div style={{
                      width: '40px',
                      height: '2px',
                      background: planet.theme.gradient,
                      borderRadius: '1px'
                    }} />
                    <div style={{
                      width: '4px',
                      height: '4px',
                      borderRadius: '50%',
                      background: planet.theme.primary,
                      boxShadow: `0 0 8px ${planet.theme.primary}`
                    }} />
                  </div>
                </div>

                {/* 箭头 */}
                <div style={{
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${planet.theme.secondary}, ${planet.theme.primary})`,
                  boxShadow: `0 0 20px ${planet.theme.glow}`
                }}>
                  <span style={{
                    color: '#fff',
                    fontSize: '20px',
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
                opacity: 1
              }} />
            </button>
          ))}
        </main>
      </div>
    </>
  );
}
