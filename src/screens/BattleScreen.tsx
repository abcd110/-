import { useState, useEffect, useRef, useCallback } from 'react';
import { useGameStore } from '../stores/gameStore';
import type { Enemy } from '../data/types';

interface BattleScreenProps {
  locationId: string;
  isBoss?: boolean;
  isElite?: boolean;
  onBack: () => void;
  onBattleEnd?: (action: 'continue_hunt' | 'return_collect' | 'boss_defeated') => void;
}

type BattleState = 'start' | 'fighting' | 'victory' | 'defeat' | 'escaped';

interface SkillCooldown {
  skillId: string;
  currentCooldown: number;
  maxCooldown: number;
}

export default function BattleScreen({ locationId, isBoss, isElite, onBack, onBattleEnd }: BattleScreenProps) {
  const [battleState, setBattleState] = useState<BattleState>('start');
  const [enemy, setEnemy] = useState<Enemy | null>(null);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [isAutoBattle, setIsAutoBattle] = useState(true);
  const [skillCooldowns, setSkillCooldowns] = useState<Map<string, SkillCooldown>>(new Map());
  const [isInitialized, setIsInitialized] = useState(false);

  // 战斗计时器
  const playerAttackTimer = useRef<number | null>(null);
  const enemyAttackTimer = useRef<number | null>(null);
  const skillCheckTimer = useRef<number | null>(null);

  // 使用 ref 存储 player 和 enemy，避免依赖项变化导致定时器重建
  const playerRef = useRef(useGameStore.getState().gameManager.player);
  const enemyRef = useRef<Enemy | null>(null);

  const gameManager = useGameStore(state => state.gameManager);
  const player = useGameStore(state => state.getPlayer());
  const activeSkills = useGameStore(state => state.getActiveSkills());
  const startBattle = useGameStore(state => state.startBattle);
  const endBattleVictory = useGameStore(state => state.endBattleVictory);
  const attemptEscape = useGameStore(state => state.attemptEscape);
  const saveGame = useGameStore(state => state.saveGame);

  // 同步 ref
  useEffect(() => {
    playerRef.current = gameManager.player;
  }, [gameManager.player]);

  useEffect(() => {
    enemyRef.current = enemy;
  }, [enemy]);

  // 添加战斗日志
  const addLog = useCallback((message: string) => {
    setBattleLog(prev => [...prev.slice(-6), message]);
  }, []);

  // 初始化战斗 - 只在组件挂载时执行一次
  useEffect(() => {
    if (isInitialized) return;

    const result = startBattle(locationId, isBoss, isElite);
    if (result.success && result.enemy) {
      const enemyInstance = result.enemy;
      setEnemy(enemyInstance);
      enemyRef.current = enemyInstance;
      setBattleLog([result.message, '战斗开始！']);
      setBattleState('fighting');
      setIsInitialized(true);

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
    } else {
      setBattleLog([result.message]);
      setTimeout(() => onBack(), 1500);
    }

    return () => {
      clearAllTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationId]); // 只在 locationId 变化时执行

  // 处理胜利
  useEffect(() => {
    if (battleState === 'victory' && enemy && isInitialized) {
      const victoryResult = endBattleVictory(enemy);
      victoryResult.logs.forEach(log => addLog(log));
    }
  }, [battleState, enemy, isInitialized, endBattleVictory, addLog]);

  // 清除所有计时器
  const clearAllTimers = useCallback(() => {
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
  }, []);

  // 玩家普通攻击 - 使用 ref 避免依赖项变化
  const doPlayerAttack = useCallback(() => {
    const currentEnemy = enemyRef.current;
    const currentPlayer = playerRef.current;

    if (!currentEnemy) return;
    if (battleState !== 'fighting') return;

    let damage = currentPlayer.totalAttack;
    let isCrit = false;

    // 暴击判定 - 新公式：暴击概率 = (我方会心 - 敌人护心) / (敌人护心 * 1.5)
    const attackerCrit = currentPlayer.totalCrit;
    const defenderGuard = (currentEnemy as any).guardRate || 5;
    let critChance = 0;
    if (attackerCrit > defenderGuard) {
      critChance = (attackerCrit - defenderGuard) / (defenderGuard * 1.5);
    }
    critChance = Math.max(0, Math.min(1, critChance)); // 限制在0-100%
    if (Math.random() < critChance) {
      const critDamage = currentPlayer.totalCritDamage / 100;
      damage = Math.floor(damage * (1 + critDamage));
      isCrit = true;
    }

    // 最终减伤比计算
    const enemyDefense = currentEnemy.defense;
    const playerPenetration = currentPlayer.totalPenetration;
    const playerPenetrationPercent = currentPlayer.totalPenetrationPercent;

    // 计算穿透后的实际防御 = 敌人防御 * (1 - 穿透百分比) - 穿透固定值
    const defenseAfterPenetrationPercent = enemyDefense * (1 - playerPenetrationPercent / 100);
    const actualDefense = Math.max(0, defenseAfterPenetrationPercent - playerPenetration);
    // 计算最终减伤比
    const finalReduction = (actualDefense / (enemyDefense + 600)) * 100;
    // 计算实际伤害（伤害 * (1 - 减伤比)）
    damage = Math.floor(damage * (1 - finalReduction / 100));
    damage = Math.max(1, damage); // 最低1点伤害

    const newHp = Math.max(0, currentEnemy.hp - damage);

    addLog(isCrit ? `暴击！造成 ${damage} 伤害` : `造成 ${damage} 伤害`);

    // 更新敌人状态
    setEnemy({ ...currentEnemy, hp: newHp });
    enemyRef.current = { ...currentEnemy, hp: newHp };

    // 检查胜利
    if (newHp <= 0) {
      clearAllTimers();
      setBattleState('victory');
      addLog('战斗胜利！');
      if (!isBoss) {
        const progressGain = isElite ? 15 : 10;
        addLog(`狩猎进度 +${progressGain}%`);
      }
    }
  }, [battleState, isBoss, isElite, addLog, clearAllTimers]);

  // 敌人攻击 - 使用 ref 避免依赖项变化
  const doEnemyAttack = useCallback(() => {
    const currentEnemy = enemyRef.current;
    const currentPlayer = playerRef.current;

    if (!currentEnemy || battleState !== 'fighting') return;

    let damage = currentEnemy.attack;

    // 敌人攻击时，使用玩家的防御计算减伤
    const playerDefense = currentPlayer.totalDefense;
    const damageReduction = (playerDefense / (playerDefense + 600)) * 100;
    damage = Math.floor(damage * (1 - damageReduction / 100));
    damage = Math.max(1, damage); // 最低1点伤害

    currentPlayer.takeDamage(damage);
    addLog(`${currentEnemy.name} 造成 ${damage} 伤害`);

    // 检查失败
    if (currentPlayer.isDead) {
      clearAllTimers();
      setBattleState('defeat');
      addLog('你被击败了！');
      gameManager.isGameOver = true;
      gameManager.player.stamina = 0;
    }
  }, [battleState, addLog, clearAllTimers, gameManager]);

  // 启动自动战斗 - 只在 battleState 和 isInitialized 变化时执行
  useEffect(() => {
    if (battleState !== 'fighting' || !isInitialized) return;

    // 计算攻击间隔 - 攻速1表示1秒攻击1次
    const attackSpeed = player.totalAttackSpeed || 1;
    const playerInterval = Math.max(500, 1000 / attackSpeed);
    const enemyAttackSpeed = (enemy as any)?.attackSpeed || 1;
    const enemyInterval = Math.max(500, 1000 / enemyAttackSpeed);

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
    // 注意：这里不依赖 doPlayerAttack 和 doEnemyAttack，因为它们使用 ref
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [battleState, isInitialized, player.totalAttackSpeed, enemy?.speed]);

  // 使用技能
  const useSkill = useCallback((skillId: string) => {
    const currentEnemy = enemyRef.current;
    const currentPlayer = playerRef.current;

    if (!currentEnemy || battleState !== 'fighting') return false;

    const skill = activeSkills.get(skillId);
    if (!skill) return false;

    const cooldown = skillCooldowns.get(skillId);
    if (cooldown && cooldown.currentCooldown > 0) return false;

    // 执行技能效果
    let damage = 0;
    const effect = skill.getCurrentEffect();

    // 处理伤害类技能
    if (effect.damage) {
      damage = effect.damage;
      damage = Math.max(1, damage - currentEnemy.defense);
      currentEnemy.hp = Math.max(0, currentEnemy.hp - damage);
    } else if (effect.damagePercent) {
      damage = Math.floor(currentPlayer.totalAttack * (effect.damagePercent / 100));
      damage = Math.max(1, damage - currentEnemy.defense);
      currentEnemy.hp = Math.max(0, currentEnemy.hp - damage);
    }

    // 处理治疗类技能
    if (effect.heal) {
      const healAmount = effect.heal;
      currentPlayer.hp = Math.min(currentPlayer.totalMaxHp, currentPlayer.hp + healAmount);
      addLog(`${skill.name}！恢复 ${healAmount} 生命值`);
    } else if (effect.healPercent) {
      const healAmount = Math.floor(currentPlayer.totalMaxHp * (effect.healPercent / 100));
      currentPlayer.hp = Math.min(currentPlayer.totalMaxHp, currentPlayer.hp + healAmount);
      addLog(`${skill.name}！恢复 ${healAmount} 生命值`);
    }

    // 强制更新 enemy 状态
    setEnemy({ ...currentEnemy });
    enemyRef.current = { ...currentEnemy };

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
      addLog(`${skill.name}！造成 ${damage} 伤害`);
    }

    // 检查胜利
    if (currentEnemy.hp <= 0) {
      clearAllTimers();
      setBattleState('victory');
      addLog('战斗胜利！');
      if (!isBoss) {
        const progressGain = isElite ? 15 : 10;
        addLog(`狩猎进度 +${progressGain}%`);
      }
    }

    return true;
  }, [battleState, activeSkills, skillCooldowns, addLog, isBoss, isElite, clearAllTimers]);

  // 检查并释放技能
  const checkAndUseSkills = useCallback(() => {
    if (!isAutoBattle || battleState !== 'fighting') return;

    activeSkills.forEach((skill, skillId) => {
      const cooldown = skillCooldowns.get(skillId);
      if (cooldown && cooldown.currentCooldown === 0) {
        useSkill(skillId);
      }
    });
  }, [isAutoBattle, battleState, activeSkills, skillCooldowns, useSkill]);

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

  // 逃跑
  const handleEscape = () => {
    if (!enemy || battleState !== 'fighting') return;

    clearAllTimers();
    const result = attemptEscape(enemy);
    result.logs.forEach(log => addLog(log));

    if (result.success) {
      setBattleState('escaped');
      setTimeout(() => onBack(), 1500);
    } else {
      setBattleState('fighting');
    }
  };

  // 切换自动战斗
  const toggleAutoBattle = () => {
    setIsAutoBattle(prev => !prev);
  };

  // 继续狩猎 - 直接开始新战斗
  const handleContinueHunt = async () => {
    // 检查体力
    if (gameManager.player.stamina < 10) {
      addLog('体力不足，无法继续狩猎');
      return;
    }
    // 消耗时间和体力
    gameManager.advanceTime(15);
    gameManager.player.stamina -= 10;

    // 更新狩猎进度
    const progress = gameManager.getLocationProgress(locationId);
    const progressGain = isElite ? 15 : 10;
    const newHuntProgress = Math.min(80, progress.huntProgress + progressGain);
    gameManager.updateLocationProgress(locationId, { huntProgress: newHuntProgress });

    // 保存游戏
    await saveGame();

    // 重置状态并重新开始战斗
    clearAllTimers();
    setIsInitialized(false);
    setBattleState('start');
    setEnemy(null);
    enemyRef.current = null;
    setBattleLog([]);
    setSkillCooldowns(new Map());

    // 延迟一点再初始化新战斗
    setTimeout(() => {
      const result = startBattle(locationId);
      if (result.success && result.enemy) {
        const enemyInstance = result.enemy;
        setEnemy(enemyInstance);
        enemyRef.current = enemyInstance;
        setBattleLog([result.message, '战斗开始！']);
        setBattleState('fighting');
        setIsInitialized(true);

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
      }
    }, 100);
  };

  // 返回采集资源
  const handleReturnCollect = async () => {
    // 更新狩猎进度
    const progress = gameManager.getLocationProgress(locationId);
    const progressGain = isElite ? 15 : 10;
    const newHuntProgress = Math.min(80, progress.huntProgress + progressGain);
    gameManager.updateLocationProgress(locationId, { huntProgress: newHuntProgress });

    // 保存游戏
    await saveGame();

    if (onBattleEnd) {
      onBattleEnd('return_collect');
    } else {
      onBack();
    }
  };

  // BOSS击败后返回
  const handleBossDefeated = async () => {
    // 标记BOSS已击败
    gameManager.updateLocationProgress(locationId, { bossDefeated: true });

    // 保存游戏
    await saveGame();

    if (onBattleEnd) {
      onBattleEnd('boss_defeated');
    } else {
      onBack();
    }
  };

  // 渲染战斗界面
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <h1 style={{ color: 'white', fontWeight: 'bold', fontSize: '18px' }}>
            {battleState === 'fighting' && (isBoss ? 'BOSS战' : '自动战斗')}
            {battleState === 'victory' && '胜利！'}
            {battleState === 'defeat' && '失败...'}
            {battleState === 'escaped' && '已逃跑'}
          </h1>
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
        {/* 敌人信息 - 胜利/失败时隐藏 */}
        {enemy && battleState === 'fighting' && (
          <div style={{
            backgroundColor: '#1a1f3a',
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
                {enemy.icon}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ color: 'white', fontWeight: 'bold', margin: '0 0 4px 0' }}>{enemy.name}</h3>
                <p style={{ color: '#a1a1aa', fontSize: '12px', margin: 0 }}>{enemy.description}</p>
              </div>
            </div>

            {/* 敌人生命值 */}
            <div style={{ marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: '#a1a1aa', fontSize: '12px' }}>生命值</span>
                <span style={{ color: 'white', fontSize: '12px' }}>{enemy.hp}/{enemy.maxHp}</span>
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
                  width: `${(enemy.hp / enemy.maxHp) * 100}%`
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
                <div style={{ color: '#ef4444', fontWeight: 'bold' }}>{enemy.attack}</div>
                <div style={{ color: '#a1a1aa' }}>攻击</div>
              </div>
              <div style={{ textAlign: 'center', padding: '8px', backgroundColor: '#1f2937', borderRadius: '6px' }}>
                <div style={{ color: '#3b82f6', fontWeight: 'bold' }}>{enemy.defense}</div>
                <div style={{ color: '#a1a1aa' }}>防御</div>
              </div>
              <div style={{ textAlign: 'center', padding: '8px', backgroundColor: '#1f2937', borderRadius: '6px' }}>
                <div style={{ color: '#22c55e', fontWeight: 'bold' }}>{enemy.speed}</div>
                <div style={{ color: '#a1a1aa' }}>跃迁速度</div>
              </div>
            </div>
          </div>
        )}

        {/* VS 标识 - 胜利/失败时隐藏 */}
        {battleState === 'fighting' && (
          <div style={{
            textAlign: 'center',
            color: '#0099cc',
            fontSize: '24px',
            fontWeight: 'bold',
            marginBottom: '16px'
          }}>
            VS
          </div>
        )}

        {/* 玩家信息 - 胜利时简化显示 */}
        <div style={{
          backgroundColor: '#1a1f3a',
          borderRadius: '12px',
          padding: battleState === 'victory' ? '12px' : '16px',
          border: '1px solid #374151',
          marginBottom: battleState === 'victory' ? '12px' : '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: battleState === 'victory' ? '8px' : '12px' }}>
            <div style={{
              width: battleState === 'victory' ? '40px' : '48px',
              height: battleState === 'victory' ? '40px' : '48px',
              backgroundColor: '#374151',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: battleState === 'victory' ? '20px' : '24px'
            }}>
              我
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ color: 'white', fontWeight: 'bold', margin: '0 0 4px 0', fontSize: battleState === 'victory' ? '14px' : '16px' }}>{gameManager.playerName}</h3>
              <p style={{ color: '#a1a1aa', fontSize: '12px', margin: 0 }}>Lv.{player.level}</p>
            </div>
          </div>

          {/* 玩家生命值 */}
          <div style={{ marginBottom: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ color: '#a1a1aa', fontSize: '12px' }}>生命值</span>
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

          {/* 玩家体力 */}
          <div style={{ marginBottom: battleState === 'victory' ? '0' : '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ color: '#a1a1aa', fontSize: '12px' }}>体力</span>
              <span style={{ color: 'white', fontSize: '12px' }}>{player.stamina}/{player.maxStamina}</span>
            </div>
            <div style={{
              backgroundColor: '#1f2937',
              borderRadius: '9999px',
              height: '6px',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                backgroundColor: '#3b82f6',
                transition: 'width 0.3s',
                width: `${(player.stamina / player.maxStamina) * 100}%`
              }} />
            </div>
          </div>

          {/* 玩家属性 - 胜利时隐藏 */}
          {battleState !== 'victory' && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '8px',
              fontSize: '12px'
            }}>
              <div style={{ textAlign: 'center', padding: '8px', backgroundColor: '#1f2937', borderRadius: '6px' }}>
                <div style={{ color: '#ef4444', fontWeight: 'bold' }}>{player.totalAttack}</div>
                <div style={{ color: '#a1a1aa' }}>攻击</div>
              </div>
              <div style={{ textAlign: 'center', padding: '8px', backgroundColor: '#1f2937', borderRadius: '6px' }}>
                <div style={{ color: '#3b82f6', fontWeight: 'bold' }}>{player.totalDefense}</div>
                <div style={{ color: '#a1a1aa' }}>防御</div>
              </div>
              <div style={{ textAlign: 'center', padding: '8px', backgroundColor: '#1f2937', borderRadius: '6px' }}>
                <div style={{ color: '#22c55e', fontWeight: 'bold' }}>{player.totalAgility}</div>
                <div style={{ color: '#a1a1aa' }}>敏捷</div>
              </div>
              <div style={{ textAlign: 'center', padding: '8px', backgroundColor: '#1f2937', borderRadius: '6px' }}>
                <div style={{ color: '#00d4ff', fontWeight: 'bold' }}>{player.totalAttackSpeed.toFixed(1)}</div>
                <div style={{ color: '#a1a1aa' }}>攻速</div>
              </div>
            </div>
          )}

          {/* 技能CD显示 - 胜利时隐藏 */}
          {battleState !== 'victory' && activeSkills.size > 0 && (
            <div style={{ marginTop: '12px' }}>
              <h4 style={{ color: '#a1a1aa', fontSize: '12px', margin: '0 0 8px 0' }}>技能状态</h4>
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
                        {isReady ? '就绪' : `${currentCD}s`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 战斗记录 - 胜利时减小高度 */}
        <div style={{
          backgroundColor: '#1a1f3a',
          borderRadius: '12px',
          padding: battleState === 'victory' ? '10px' : '12px',
          border: '1px solid #374151',
          marginBottom: battleState === 'victory' ? '12px' : '16px',
          flex: battleState === 'victory' ? '1' : 'none',
          minHeight: battleState === 'victory' ? '80px' : 'auto'
        }}>
          <h3 style={{ color: '#a1a1aa', fontSize: '12px', margin: '0 0 8px 0' }}>战斗记录</h3>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            fontSize: '12px',
            maxHeight: battleState === 'victory' ? 'none' : '120px',
            overflowY: 'auto',
            height: battleState === 'victory' ? 'calc(100% - 20px)' : 'auto'
          }}>
            {battleLog.map((log, index) => (
              <div key={index} style={{ color: log.includes('造成') && !log.includes('敌人') ? '#00d4ff' : '#9ca3af' }}>
                {log}
              </div>
            ))}
          </div>
        </div>

        {/* 普通战斗胜利 - 继续狩猎或返回 */}
        {battleState === 'victory' && !isBoss && (
          <div style={{
            backgroundColor: '#065f46',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '16px'
          }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={handleContinueHunt}
                disabled={gameManager.player.stamina < 10}
                style={{
                  flex: 1,
                  padding: '14px 24px',
                  backgroundColor: gameManager.player.stamina < 10 ? '#2a3050' : '#0099cc',
                  color: 'white',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: gameManager.player.stamina < 10 ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                  fontSize: '16px'
                }}
              >
                {gameManager.player.stamina < 10 ? '体力不足' : '继续狩猎'}
              </button>
              <button
                onClick={handleReturnCollect}
                style={{
                  flex: 1,
                  padding: '14px 24px',
                  backgroundColor: '#374151',
                  color: '#a1a1aa',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '16px'
                }}
              >
                返回
              </button>
            </div>
          </div>
        )}

        {/* BOSS战胜利 - 紧凑布局 */}
        {battleState === 'victory' && isBoss && (
          <div style={{
            backgroundColor: '#065f46',
            borderRadius: '12px',
            padding: '12px',
            textAlign: 'center',
            marginBottom: '12px'
          }}>
            <h3 style={{ color: '#4ade80', margin: '0 0 4px 0', fontSize: '16px' }}>BOSS击败！</h3>
            <p style={{ color: '#a1a1aa', fontSize: '12px', margin: '0 0 10px 0' }}>
              该地点已解锁扫荡功能
            </p>
            <button
              onClick={handleBossDefeated}
              style={{
                padding: '10px 32px',
                backgroundColor: '#16a34a',
                color: 'white',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '14px'
              }}
            >
              返回
            </button>
          </div>
        )}

        {battleState === 'defeat' && (
          <div style={{
            backgroundColor: '#7f1d1d',
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center',
            marginBottom: '16px'
          }}>
            <h3 style={{ color: '#f87171', margin: '0 0 8px 0' }}>你被击败了...</h3>
            <button
              onClick={onBack}
              style={{
                padding: '12px 24px',
                backgroundColor: '#dc2626',
                color: 'white',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              返回
            </button>
          </div>
        )}
      </main>

      {/* 底部操作栏 */}
      {battleState === 'fighting' && (
        <footer style={{
          flexShrink: 0,
          backgroundColor: '#1a1f3a',
          borderTop: '1px solid #2a3050',
          padding: '12px 16px'
        }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleEscape}
              style={{
                width: '100%',
                padding: '14px',
                backgroundColor: '#374151',
                color: '#a1a1aa',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '14px'
              }}
            >
              逃跑
            </button>
          </div>
        </footer>
      )}
    </div>
  );
}
