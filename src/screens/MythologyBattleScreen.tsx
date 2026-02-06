import { useState, useEffect, useRef, useCallback } from 'react';
import { useGameStore } from '../stores/gameStore';
import { getMythologyLocationById } from '../data/mythologyLocations';
import { getItemNameWithIcon } from '../data/itemNames';
import type { MythologyLocation } from '../data/types';

interface MythologyBattleScreenProps {
  locationId: string;
  onBack: () => void;
  onVictory: (loot: string[]) => void;
  onDefeat: () => void;
}

type BattleState = 'start' | 'fighting' | 'victory' | 'defeat' | 'escaped';

interface SkillCooldown {
  skillId: string;
  currentCooldown: number;
  maxCooldown: number;
}

export default function MythologyBattleScreen({ locationId, onBack, onVictory, onDefeat }: MythologyBattleScreenProps) {
  const [battleState, setBattleState] = useState<BattleState>('start');
  const [location, setLocation] = useState<MythologyLocation | null>(null);
  const [enemyHp, setEnemyHp] = useState(0);
  const [enemyMaxHp, setEnemyMaxHp] = useState(0);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [loot, setLoot] = useState<string[]>([]);
  const [skillCooldowns, setSkillCooldowns] = useState<Map<string, SkillCooldown>>(new Map());
  const [isInitialized, setIsInitialized] = useState(false);

  const playerAttackTimer = useRef<number | null>(null);
  const enemyAttackTimer = useRef<number | null>(null);
  const skillCheckTimer = useRef<number | null>(null);
  const battleStateRef = useRef<BattleState>('start');
  const enemyHpRef = useRef(0);

  const gameManager = useGameStore(state => state.gameManager);
  const player = useGameStore(state => state.getPlayer());
  const activeSkills = useGameStore(state => state.getActiveSkills());

  // 同步 ref 与 state
  useEffect(() => {
    battleStateRef.current = battleState;
  }, [battleState]);

  useEffect(() => {
    enemyHpRef.current = enemyHp;
  }, [enemyHp]);

  const addLog = useCallback((message: string) => {
    setBattleLog(prev => [...prev.slice(-8), message]);
  }, []);

  // 初始化战斗 - 只在组件挂载时执行一次
  useEffect(() => {
    if (isInitialized) return;

    const loc = getMythologyLocationById(locationId);
    if (!loc) {
      addLog('战斗地点不存在');
      setTimeout(() => onBack(), 1500);
      return;
    }

    setLocation(loc);

    // 根据站台危险等级生成敌人属性
    const dangerLevel = loc.dangerLevel;
    const hp = 30 + dangerLevel * 10;

    setEnemyHp(hp);
    setEnemyMaxHp(hp);
    enemyHpRef.current = hp;
    setLoot(loc.stationMonster.loot);
    setIsInitialized(true);

    addLog(`遭遇了 ${loc.stationMonster.name}！`);
    addLog('战斗开始！');
    setBattleState('fighting');
    battleStateRef.current = 'fighting';

    // 初始化技能冷却
    const cooldowns = new Map<string, SkillCooldown>();
    activeSkills.forEach((skill, skillId) => {
      cooldowns.set(skillId, {
        skillId,
        currentCooldown: 0,
        maxCooldown: skill.cooldown || 3
      });
    });
    setSkillCooldowns(cooldowns);

    return () => {
      clearAllTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationId]); // 只在 locationId 变化时执行

  // 清除所有计时器
  const clearAllTimers = () => {
    if (playerAttackTimer.current) {
      clearInterval(playerAttackTimer.current);
      playerAttackTimer.current = null;
    }
    if (enemyAttackTimer.current) {
      clearInterval(enemyAttackTimer.current);
      enemyAttackTimer.current = null;
    }
    if (skillCheckTimer.current) {
      clearInterval(skillCheckTimer.current);
      skillCheckTimer.current = null;
    }
  };

  // 结束战斗（胜利）
  const endBattleVictory = useCallback((finalLoot: string[]) => {
    clearAllTimers();
    setBattleState('victory');
    battleStateRef.current = 'victory';
    addLog('🎉 战斗胜利！');

    // 获得战利品
    if (finalLoot.length > 0) {
      finalLoot.forEach(item => {
        addLog(`获得：${getItemNameWithIcon(item)}`);
      });
    }

    setTimeout(() => {
      onVictory(finalLoot);
    }, 2000);
  }, [addLog, onVictory]);

  // 结束战斗（失败）
  const endBattleDefeat = useCallback(() => {
    clearAllTimers();
    setBattleState('defeat');
    battleStateRef.current = 'defeat';
    addLog('💀 你被击败了！');
    // 战斗失败，体力归零
    useGameStore.getState().gameManager.player.stamina = 0;
    setTimeout(() => {
      onDefeat();
    }, 2000);
  }, [addLog, onDefeat]);

  // 使用技能
  const executeSkill = useCallback((skillId: string) => {
    if (battleStateRef.current !== 'fighting') return false;

    const skill = activeSkills.get(skillId);
    if (!skill) return false;

    const cooldown = skillCooldowns.get(skillId);
    if (cooldown && cooldown.currentCooldown > 0) return false;

    // 从 store 获取最新玩家数据
    const currentPlayer = useGameStore.getState().getPlayer();
    const currentGameManager = useGameStore.getState().gameManager;

    // 执行技能效果
    let damage = 0;
    const effect = skill.getCurrentEffect();

    // 处理伤害类技能
    if (effect.damage) {
      const enemyDefense = (location?.dangerLevel || 1) * 2;
      damage = effect.damage;
      damage = Math.max(1, damage - enemyDefense);
      const newHp = Math.max(0, enemyHpRef.current - damage);
      setEnemyHp(newHp);
      enemyHpRef.current = newHp;

      // 检查胜利
      if (newHp <= 0) {
        const gainedLoot = loot.slice(0, Math.floor(Math.random() * 2) + 1);
        endBattleVictory(gainedLoot);
        return true;
      }
    } else if (effect.damagePercent) {
      const enemyDefense = (location?.dangerLevel || 1) * 2;
      damage = Math.floor(currentPlayer.totalAttack * (effect.damagePercent / 100));
      damage = Math.max(1, damage - enemyDefense);
      const newHp = Math.max(0, enemyHpRef.current - damage);
      setEnemyHp(newHp);
      enemyHpRef.current = newHp;

      // 检查胜利
      if (newHp <= 0) {
        const gainedLoot = loot.slice(0, Math.floor(Math.random() * 2) + 1);
        endBattleVictory(gainedLoot);
        return true;
      }
    }

    // 处理治疗类技能
    if (effect.heal) {
      const healAmount = effect.heal;
      currentGameManager.player.hp = Math.min(currentGameManager.player.totalMaxHp, currentGameManager.player.hp + healAmount);
      addLog(`💚 ${skill.name}！恢复 ${healAmount} 生命值`);
    } else if (effect.healPercent) {
      const healAmount = Math.floor(currentGameManager.player.totalMaxHp * (effect.healPercent / 100));
      currentGameManager.player.hp = Math.min(currentGameManager.player.totalMaxHp, currentGameManager.player.hp + healAmount);
      addLog(`💚 ${skill.name}！恢复 ${healAmount} 生命值`);
    }

    // 设置冷却
    setSkillCooldowns(prev => {
      const next = new Map(prev);
      next.set(skillId, {
        skillId,
        currentCooldown: skill.cooldown || 3,
        maxCooldown: skill.cooldown || 3
      });
      return next;
    });

    if (damage > 0) {
      addLog(`✨ ${skill.name}！造成 ${damage} 伤害`);
    }

    return true;
  }, [activeSkills, skillCooldowns, addLog, location?.dangerLevel, loot, endBattleVictory]);

  // 检查并释放技能
  const checkAndUseSkills = useCallback(() => {
    if (battleStateRef.current !== 'fighting') return;

    activeSkills.forEach((skill, skillId) => {
      const cooldown = skillCooldowns.get(skillId);
      if (cooldown && cooldown.currentCooldown === 0) {
        executeSkill(skillId);
      }
    });
  }, [activeSkills, skillCooldowns, executeSkill]);

  // 减少技能冷却
  const reduceCooldowns = useCallback(() => {
    setSkillCooldowns(prev => {
      const next = new Map();
      prev.forEach((cooldown, skillId) => {
        next.set(skillId, {
          ...cooldown,
          currentCooldown: Math.max(0, cooldown.currentCooldown - 1)
        });
      });
      return next;
    });
  }, []);

  // 玩家攻击
  const doPlayerAttack = useCallback(() => {
    if (battleStateRef.current !== 'fighting') return;

    // 从 store 获取最新玩家数据
    const currentPlayer = useGameStore.getState().getPlayer();
    let damage = currentPlayer.totalAttack;

    // 暴击判定
    const critChance = Math.min(0.3, currentPlayer.totalAgility * 0.01);
    const isCrit = Math.random() < critChance;
    if (isCrit) {
      damage = Math.floor(damage * 1.5);
    }

    // 防御减免（假设敌人防御为 dangerLevel * 2）
    const enemyDefense = (location?.dangerLevel || 1) * 2;
    damage = Math.max(1, damage - enemyDefense);

    const newHp = Math.max(0, enemyHpRef.current - damage);
    setEnemyHp(newHp);
    enemyHpRef.current = newHp;

    if (isCrit) {
      addLog(`💥 暴击！造成 ${damage} 点伤害`);
    } else {
      addLog(`⚔️ 造成 ${damage} 点伤害`);
    }

    // 检查胜利
    if (newHp <= 0) {
      const gainedLoot = loot.slice(0, Math.floor(Math.random() * 2) + 1);
      endBattleVictory(gainedLoot);
    }
  }, [location?.dangerLevel, loot, addLog, endBattleVictory]);

  // 敌人攻击
  const doEnemyAttack = useCallback(() => {
    if (battleStateRef.current !== 'fighting' || !location) return;

    // 敌人攻击力 = 5 + dangerLevel * 2
    const enemyAttack = 5 + location.dangerLevel * 2;

    // 从 store 获取最新玩家数据
    const currentPlayer = useGameStore.getState().getPlayer();
    let damage = enemyAttack;
    damage = Math.max(1, damage - currentPlayer.totalDefense);

    useGameStore.getState().gameManager.player.takeDamage(damage);
    addLog(`👹 ${location.stationMonster.name} 造成 ${damage} 点伤害`);

    // 检查失败
    if (useGameStore.getState().gameManager.player.isDead) {
      endBattleDefeat();
    }
  }, [location, addLog, endBattleDefeat]);

  // 启动自动战斗
  useEffect(() => {
    if (battleState !== 'fighting' || !isInitialized) return;

    // 计算攻击间隔
    const currentPlayer = useGameStore.getState().getPlayer();
    const attackSpeed = currentPlayer.totalAttackSpeed || 1;
    const playerInterval = Math.max(500, 2000 / attackSpeed);
    const enemyInterval = Math.max(800, 2500 / 1.5); // 敌人固定速度

    // 玩家攻击计时器
    playerAttackTimer.current = window.setInterval(() => {
      doPlayerAttack();
    }, playerInterval);

    // 敌人攻击计时器
    enemyAttackTimer.current = window.setInterval(() => {
      doEnemyAttack();
    }, enemyInterval);

    // 技能检查计时器（每秒检查一次）
    skillCheckTimer.current = window.setInterval(() => {
      checkAndUseSkills();
      reduceCooldowns();
    }, 1000);

    return () => {
      clearAllTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [battleState, isInitialized]);

  // 逃跑
  const handleEscape = () => {
    clearAllTimers();
    addLog('🏃 你逃跑了！');
    setBattleState('escaped');
    battleStateRef.current = 'escaped';
    setTimeout(() => onBack(), 1500);
  };

  if (!location) {
    return (
      <div style={{ height: '100vh', backgroundColor: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#9ca3af' }}>加载中...</p>
      </div>
    );
  }

  return (
    <div style={{
      height: '100vh',
      backgroundColor: '#1a1a1a',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* 顶部标题栏 */}
      <header style={{
        flexShrink: 0,
        backgroundColor: '#2d2d2d',
        borderBottom: '1px solid #4b5563',
        padding: '12px 16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            onClick={handleEscape}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: '#9ca3af',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            <span>←</span>
            <span>逃跑</span>
          </button>
          <h1 style={{ color: 'white', fontWeight: 'bold', fontSize: '18px' }}>
            {battleState === 'fighting' && '自动战斗'}
            {battleState === 'victory' && '胜利！'}
            {battleState === 'defeat' && '失败...'}
            {battleState === 'escaped' && '已逃跑'}
          </h1>
          <div style={{ width: '48px' }} />
        </div>
      </header>

      {/* 战斗区域 */}
      <main style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* 敌人信息 */}
        {battleState === 'fighting' && (
          <div style={{
            backgroundColor: '#2d2d2d',
            borderRadius: '12px',
            padding: '16px',
            border: '1px solid #374151',
            marginBottom: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                backgroundColor: '#374151',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px'
              }}>
                👹
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ color: 'white', fontWeight: 'bold', margin: '0 0 4px 0' }}>{location.stationMonster.name}</h3>
                <p style={{ color: '#9ca3af', fontSize: '12px', margin: 0 }}>{location.stationMonster.description}</p>
              </div>
            </div>

            {/* 敌人生命值 */}
            <div style={{ marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: '#9ca3af', fontSize: '12px' }}>生命值</span>
                <span style={{ color: 'white', fontSize: '12px' }}>{enemyHp}/{enemyMaxHp}</span>
              </div>
              <div style={{
                backgroundColor: '#1f2937',
                borderRadius: '9999px',
                height: '8px',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  backgroundColor: '#22c55e',
                  transition: 'width 0.3s',
                  width: `${enemyMaxHp > 0 ? (enemyHp / enemyMaxHp) * 100 : 0}%`
                }} />
              </div>
            </div>

            {/* 敌人属性 */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '8px',
              fontSize: '12px'
            }}>
              <div style={{ textAlign: 'center', padding: '8px', backgroundColor: '#1f2937', borderRadius: '6px' }}>
                <div style={{ color: '#ef4444', fontWeight: 'bold' }}>{5 + location.dangerLevel * 2}</div>
                <div style={{ color: '#9ca3af' }}>攻击</div>
              </div>
              <div style={{ textAlign: 'center', padding: '8px', backgroundColor: '#1f2937', borderRadius: '6px' }}>
                <div style={{ color: '#3b82f6', fontWeight: 'bold' }}>{location.dangerLevel * 2}</div>
                <div style={{ color: '#9ca3af' }}>防御</div>
              </div>
              <div style={{ textAlign: 'center', padding: '8px', backgroundColor: '#1f2937', borderRadius: '6px' }}>
                <div style={{ color: '#22c55e', fontWeight: 'bold' }}>1.5</div>
                <div style={{ color: '#9ca3af' }}>速度</div>
              </div>
            </div>
          </div>
        )}

        {/* VS 标识 */}
        {battleState === 'fighting' && (
          <div style={{
            textAlign: 'center',
            color: '#d97706',
            fontSize: '24px',
            fontWeight: 'bold',
            marginBottom: '16px'
          }}>
            VS
          </div>
        )}

        {/* 玩家信息 */}
        <div style={{
          backgroundColor: '#2d2d2d',
          borderRadius: '12px',
          padding: '16px',
          border: '1px solid #374151',
          marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              backgroundColor: '#374151',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px'
            }}>
              🧑‍🦱
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ color: 'white', fontWeight: 'bold', margin: '0 0 4px 0' }}>{gameManager.playerName}</h3>
              <p style={{ color: '#9ca3af', fontSize: '12px', margin: 0 }}>Lv.{player.level}</p>
            </div>
          </div>

          {/* 玩家生命值 */}
          <div style={{ marginBottom: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ color: '#9ca3af', fontSize: '12px' }}>生命值</span>
              <span style={{ color: 'white', fontSize: '12px' }}>{player.hp}/{player.totalMaxHp}</span>
            </div>
            <div style={{
              backgroundColor: '#1f2937',
              borderRadius: '9999px',
              height: '8px',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                backgroundColor: player.hp < player.totalMaxHp * 0.3 ? '#ef4444' : '#22c55e',
                transition: 'width 0.3s',
                width: `${(player.hp / player.totalMaxHp) * 100}%`
              }} />
            </div>
          </div>

          {/* 玩家属性 */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '8px',
            fontSize: '12px'
          }}>
            <div style={{ textAlign: 'center', padding: '8px', backgroundColor: '#1f2937', borderRadius: '6px' }}>
              <div style={{ color: '#ef4444', fontWeight: 'bold' }}>{player.totalAttack}</div>
              <div style={{ color: '#9ca3af' }}>攻击</div>
            </div>
            <div style={{ textAlign: 'center', padding: '8px', backgroundColor: '#1f2937', borderRadius: '6px' }}>
              <div style={{ color: '#3b82f6', fontWeight: 'bold' }}>{player.totalDefense}</div>
              <div style={{ color: '#9ca3af' }}>防御</div>
            </div>
            <div style={{ textAlign: 'center', padding: '8px', backgroundColor: '#1f2937', borderRadius: '6px' }}>
              <div style={{ color: '#22c55e', fontWeight: 'bold' }}>{player.totalAgility}</div>
              <div style={{ color: '#9ca3af' }}>敏捷</div>
            </div>
            <div style={{ textAlign: 'center', padding: '8px', backgroundColor: '#1f2937', borderRadius: '6px' }}>
              <div style={{ color: '#fbbf24', fontWeight: 'bold' }}>{player.totalAttackSpeed.toFixed(1)}</div>
              <div style={{ color: '#9ca3af' }}>攻速</div>
            </div>
          </div>

          {/* 技能CD显示 */}
          {battleState === 'fighting' && activeSkills.size > 0 && (
            <div style={{ marginTop: '12px' }}>
              <h4 style={{ color: '#9ca3af', fontSize: '12px', margin: '0 0 8px 0' }}>技能状态</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {Array.from(activeSkills.entries()).map(([skillId, skill]) => {
                  const cooldown = skillCooldowns.get(skillId);
                  const currentCD = cooldown?.currentCooldown || 0;
                  const maxCD = cooldown?.maxCooldown || skill.cooldown || 0;
                  const isReady = currentCD === 0;

                  return (
                    <div
                      key={skillId}
                      style={{
                        padding: '6px 10px',
                        backgroundColor: isReady ? '#065f46' : '#7c2d12',
                        borderRadius: '6px',
                        fontSize: '11px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <span style={{ color: isReady ? '#4ade80' : '#fdba74', fontWeight: 'bold' }}>
                        {skill.name}
                      </span>
                      <span style={{ color: isReady ? '#4ade80' : '#fdba74' }}>
                        {isReady ? '✓ 就绪' : `${currentCD}s`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 战斗记录 */}
        <div style={{
          backgroundColor: '#1f2937',
          borderRadius: '12px',
          padding: '12px',
          marginBottom: '16px'
        }}>
          <h4 style={{ color: '#9ca3af', fontSize: '12px', margin: '0 0 8px 0' }}>战斗记录</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {battleLog.map((log, index) => (
              <p
                key={index}
                style={{
                  color: log.includes('💥') || log.includes('🎉') ? '#4ade80' :
                    log.includes('💀') ? '#ef4444' :
                      log.includes('👹') ? '#fbbf24' :
                        log.includes('💚') ? '#22c55e' :
                          log.includes('✨') ? '#60a5fa' :
                            '#d1d5db',
                  fontSize: '12px',
                  margin: 0
                }}
              >
                {log}
              </p>
            ))}
          </div>
        </div>
      </main>

      {/* 底部按钮 */}
      <div style={{
        flexShrink: 0,
        backgroundColor: '#2d2d2d',
        borderTop: '1px solid #4b5563',
        padding: '12px 16px'
      }}>
        {battleState === 'fighting' ? (
          <button
            onClick={handleEscape}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#374151',
              color: '#d1d5db',
              fontWeight: 'bold',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            🏃 逃跑
          </button>
        ) : (
          <button
            onClick={() => battleState === 'victory' ? onVictory(loot) : onDefeat()}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: battleState === 'victory' ? '#4ade80' : '#ef4444',
              color: battleState === 'victory' ? '#064e3b' : 'white',
              fontWeight: 'bold',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              lineHeight: '14px'
            }}
          >
            {battleState === 'victory' ? '✅ 继续探索' : '💀 返回'}
          </button>
        )}
      </div>
    </div>
  );
}
