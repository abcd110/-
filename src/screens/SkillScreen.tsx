import { useState } from 'react';
import { useGameStore } from '../stores/gameStore';

interface SkillScreenProps {
  onBack: () => void;
}

// 技能书数据
const SKILL_BOOKS = [
  { id: 'book_power_strike', skillId: 'skill_power_strike', name: '强力打击技能书', description: '学习强力打击技能', type: 'active' },
  { id: 'book_first_aid', skillId: 'skill_first_aid', name: '急救技能书', description: '学习急救技能', type: 'active' },
  { id: 'book_toughness', skillId: 'passive_toughness', name: '坚韧技能书', description: '学习坚韧被动技能', type: 'passive' },
  { id: 'book_agility', skillId: 'passive_agility', name: '敏捷技能书', description: '学习敏捷被动技能', type: 'passive' },
];

export default function SkillScreen({ onBack }: SkillScreenProps) {
  const { gameManager, learnSkill } = useGameStore();
  const [activeTab, setActiveTab] = useState<'active' | 'passive' | 'learn'>('active');

  const activeSkills = Array.from(gameManager.activeSkills.values());
  const passiveSkills = Array.from(gameManager.passiveSkills.values());

  // 检查是否有技能书
  const hasSkillBook = (bookId: string) => {
    return gameManager.inventory.items.some(item => item.id === bookId);
  };

  // 检查是否已学习技能
  const hasLearnedSkill = (skillId: string) => {
    return gameManager.activeSkills.has(skillId) || gameManager.passiveSkills.has(skillId);
  };

  // 处理学习技能
  const handleLearnSkill = (bookId: string, skillId: string) => {
    if (!hasSkillBook(bookId)) {
      alert('需要技能书才能学习');
      return;
    }
    if (hasLearnedSkill(skillId)) {
      alert('已学习该技能');
      return;
    }
    const result = learnSkill(skillId);
    if (result.success) {
      // 消耗技能书
      gameManager.inventory.removeItem(bookId, 1);
      alert('学习成功！');
    } else {
      alert(result.message);
    }
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
          <h1 style={{ color: 'white', fontWeight: 'bold', fontSize: '18px' }}>技能</h1>
          <div style={{ width: '48px' }} />
        </div>
      </header>

      {/* 标签页 */}
      <section style={{
        flexShrink: 0,
        display: 'flex',
        gap: '8px',
        padding: '12px 16px',
        backgroundColor: '#0a0e27',
        borderBottom: '1px solid #374151'
      }}>
        {[
          { id: 'active', name: '主动技能', icon: '⚔️' },
          { id: 'passive', name: '被动技能', icon: '🛡️' },
          { id: 'learn', name: '技能学习', icon: '📖' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: activeTab === tab.id ? 'bold' : 'normal',
              backgroundColor: activeTab === tab.id ? '#0099cc' : '#374151',
              color: activeTab === tab.id ? 'white' : '#9ca3af',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <span style={{ marginRight: '4px' }}>{tab.icon}</span>
            {tab.name}
          </button>
        ))}
      </section>

      {/* 技能列表 */}
      <main style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px'
      }}>
        {/* 主动技能 */}
        {activeTab === 'active' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {activeSkills.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 0', color: '#6b7280' }}>
                <div style={{ fontSize: '48px', marginBottom: '8px' }}>⚔️</div>
                <p>未学习任何主动技能</p>
                <p style={{ fontSize: '12px', marginTop: '8px' }}>使用技能书可以学习新技能</p>
              </div>
            ) : (
              activeSkills.map((skill, idx) => (
                <SkillCard key={idx} skill={skill} />
              ))
            )}
          </div>
        )}

        {/* 被动技能 */}
        {activeTab === 'passive' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {passiveSkills.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 0', color: '#6b7280' }}>
                <div style={{ fontSize: '48px', marginBottom: '8px' }}>🛡️</div>
                <p>未学习任何被动技能</p>
                <p style={{ fontSize: '12px', marginTop: '8px' }}>使用技能书可以学习新技能</p>
              </div>
            ) : (
              passiveSkills.map((skill, idx) => (
                <SkillCard key={idx} skill={skill} />
              ))
            )}
          </div>
        )}

        {/* 技能学习 */}
        {activeTab === 'learn' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <p style={{ color: '#a1a1aa', fontSize: '12px', margin: '0 0 8px 0' }}>
              拥有技能书后可以学习对应技能
            </p>
            {SKILL_BOOKS.map((book) => {
              const hasBook = hasSkillBook(book.id);
              const hasSkill = hasLearnedSkill(book.skillId);

              return (
                <div
                  key={book.id}
                  style={{
                    backgroundColor: '#1a1f3a',
                    borderRadius: '12px',
                    padding: '16px',
                    border: '1px solid #374151',
                    opacity: hasSkill ? 0.6 : 1
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <h3 style={{ color: 'white', fontWeight: 'bold', fontSize: '16px', margin: '0 0 4px 0' }}>
                        {book.name}
                      </h3>
                      <p style={{ color: '#a1a1aa', fontSize: '12px', margin: 0 }}>{book.description}</p>
                    </div>
                    <span style={{
                      padding: '2px 8px',
                      backgroundColor: book.type === 'active' ? 'rgba(248, 113, 113, 0.2)' : 'rgba(96, 165, 250, 0.2)',
                      color: book.type === 'active' ? '#f87171' : '#60a5fa',
                      fontSize: '10px',
                      borderRadius: '4px'
                    }}>
                      {book.type === 'active' ? '主动' : '被动'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                    <span style={{
                      padding: '4px 8px',
                      backgroundColor: hasBook ? 'rgba(22, 163, 74, 0.2)' : 'rgba(220, 38, 38, 0.2)',
                      color: hasBook ? '#4ade80' : '#f87171',
                      fontSize: '12px',
                      borderRadius: '4px'
                    }}>
                      {hasBook ? '📖 拥有技能书' : '❌ 缺少技能书'}
                    </span>
                    {hasSkill && (
                      <span style={{
                        padding: '4px 8px',
                        backgroundColor: 'rgba(251, 191, 36, 0.2)',
                        color: '#00d4ff',
                        fontSize: '12px',
                        borderRadius: '4px'
                      }}>
                        ✓ 已学习
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleLearnSkill(book.id, book.skillId)}
                    disabled={!hasBook || hasSkill}
                    style={{
                      width: '100%',
                      marginTop: '12px',
                      padding: '12px',
                      backgroundColor: hasBook && !hasSkill ? '#16a34a' : '#374151',
                      color: hasBook && !hasSkill ? 'white' : '#6b7280',
                      fontWeight: 'bold',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: hasBook && !hasSkill ? 'pointer' : 'not-allowed',
                      fontSize: '14px'
                    }}
                  >
                    {hasSkill ? '已学习' : hasBook ? '学习技能' : '缺少技能书'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

// 技能卡片组件
function SkillCard({ skill }: { skill: any }) {
  return (
    <div
      style={{
        backgroundColor: '#1a1f3a',
        borderRadius: '12px',
        padding: '16px',
        border: '1px solid #374151'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <div>
          <h3 style={{ color: 'white', fontWeight: 'bold', fontSize: '16px', margin: '0 0 4px 0' }}>
            {skill.name || '未知技能'}
          </h3>
          <span style={{ color: '#00d4ff', fontSize: '14px' }}>Lv.{skill.level || 1}</span>
        </div>
      </div>
      <p style={{ color: '#a1a1aa', fontSize: '14px', margin: 0 }}>
        {skill.description || '暂无描述'}
      </p>
    </div>
  );
}
