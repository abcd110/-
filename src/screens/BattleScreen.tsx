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

// 战斗单位接口（玩家方或敌方）
interface BattleUnit {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
  icon?: string;
  isPlayer: boolean;
  isAlive: boolean;
}

export default function BattleScreen({ locationId, isBoss, isElite, onBack, onBattleEnd }: BattleScreenProps) {
  const [battleState, setBattleState] = useState<BattleState>('start');
  const [enemy, setEnemy] = useState<Enemy | null>(null);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [escapeCooldown, setEscapeCooldown] = useState(false);
  const [battleResumeFlag, setBattleResumeFlag] = useState(0);
  const [gainedExp, setGainedExp] = useState(0);

  // 玩家队伍和敌方队伍（各6个位置）
  const [playerTeam, setPlayerTeam] = useState<BattleUnit[]>([]);
  const [enemyTeam, setEnemyTeam] = useState<BattleUnit[]>([]);

  // 战斗计时器
  const playerAttackTimer = useRef<number | null>(null);
  const enemyAttackTimer = useRef<number | null>(null);

  // 使用 ref 存储 player 和 enemy，避免依赖项变化导致定时器重建
  const playerRef = useRef(useGameStore.getState().gameManager.player);
  const enemyRef = useRef<Enemy | null>(null);

  // 使用 ref 存储最新的队伍状态，避免 stale closure
  const playerTeamRef = useRef<BattleUnit[]>([]);
  const enemyTeamRef = useRef<BattleUnit[]>([]);

  const gameManager = useGameStore(state => state.gameManager);
  const player = useGameStore(state => state.getPlayer());
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

  // 同步队伍状态到 ref
  useEffect(() => {
    playerTeamRef.current = playerTeam;
  }, [playerTeam]);

  useEffect(() => {
    enemyTeamRef.current = enemyTeam;
  }, [enemyTeam]);

  // 添加战斗日志
  const addLog = useCallback((message: string) => {
    setBattleLog(prev => [...prev.slice(-6), message]);
  }, []);

  // 初始化玩家队伍（6个位置，目前只有主角）
  const initPlayerTeam = useCallback((): BattleUnit[] => {
    const team: BattleUnit[] = [];
    // 主角占据第一个位置（1号位）
    team.push({
      id: 'player_0',
      name: gameManager.playerName || '主角',
      hp: player.hp,
      maxHp: player.totalMaxHp,
      attack: player.totalAttack,
      defense: player.totalDefense,
      speed: player.totalAgility,
      icon: '我',
      isPlayer: true,
      isAlive: player.hp > 0,
    });
    // 其余5个位置为空（占位符）
    for (let i = 1; i < 6; i++) {
      team.push({
        id: `player_${i}`,
        name: '',
        hp: 0,
        maxHp: 0,
        attack: 0,
        defense: 0,
        speed: 0,
        isPlayer: true,
        isAlive: false,
      });
    }
    return team;
  }, [gameManager.playerName, player.hp, player.totalMaxHp, player.totalAttack, player.totalDefense, player.totalAgility]);

  // 初始化敌方队伍（6个位置）
  const initEnemyTeam = useCallback((enemyData: Enemy): BattleUnit[] => {
    const team: BattleUnit[] = [];
    // 主要敌人占据第一个位置（1号位）
    team.push({
      id: `enemy_0`,
      name: enemyData.name,
      hp: enemyData.hp,
      maxHp: enemyData.maxHp,
      attack: enemyData.attack,
      defense: enemyData.defense,
      speed: enemyData.speed,
      icon: enemyData.icon || '敌',
      isPlayer: false,
      isAlive: enemyData.hp > 0,
    });
    // 其余5个位置为普通小怪（根据难度生成）
    const minionCount = isBoss ? 5 : isElite ? 3 : 2;
    for (let i = 1; i < 6; i++) {
      if (i <= minionCount) {
        const minionHp = Math.floor(enemyData.maxHp * (0.3 + Math.random() * 0.2));
        const minionAttack = Math.floor(enemyData.attack * (0.4 + Math.random() * 0.2));
        team.push({
          id: `enemy_${i}`,
          name: `${enemyData.name}仆从`,
          hp: minionHp,
          maxHp: minionHp,
          attack: minionAttack,
          defense: Math.floor(enemyData.defense * 0.5),
          speed: Math.floor(enemyData.speed * 0.8),
          icon: '小',
          isPlayer: false,
          isAlive: true,
        });
      } else {
        team.push({
          id: `enemy_${i}`,
          name: '',
          hp: 0,
          maxHp: 0,
          attack: 0,
          defense: 0,
          speed: 0,
          isPlayer: false,
          isAlive: false,
        });
      }
    }
    return team;
  }, [isBoss, isElite]);

  // 初始化战斗
  useEffect(() => {
    if (isInitialized) return;

    const result = startBattle(locationId, isBoss, isElite);
    if (result.success && result.enemy) {
      const enemyInstance = result.enemy;
      setEnemy(enemyInstance);
      enemyRef.current = enemyInstance;
      
      // 初始化双方队伍
      const initialPlayerTeam = initPlayerTeam();
      const initialEnemyTeam = initEnemyTeam(enemyInstance);
      setPlayerTeam(initialPlayerTeam);
      setEnemyTeam(initialEnemyTeam);
      playerTeamRef.current = initialPlayerTeam;
      enemyTeamRef.current = initialEnemyTeam;
      
      setBattleLog([result.message, '战斗开始！']);
      setBattleState('fighting');
      setIsInitialized(true);
    } else {
      setBattleLog([result.message]);
      setTimeout(() => onBack(), 1500);
    }

    return () => {
      clearAllTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationId]);

  // 处理胜利
  useEffect(() => {
    if (battleState === 'victory' && enemy && isInitialized) {
      const victoryResult = endBattleVictory(enemy);
      victoryResult.logs.forEach(log => addLog(log));
      setGainedExp(victoryResult.exp);
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
  }, []);

  // 获取攻击优先级顺序（根据攻击者位置）
  // 1号/4号位: 1->2->3->4->5->6
  // 2号/5号位: 2->1->3->4->5->6
  // 3号/6号位: 3->2->1->6->5->4
  const getAttackOrder = (attackerPosition: number): number[] => {
    // 将位置(1-6)转换为数组索引(0-5)
    const pos = attackerPosition - 1;
    if (pos === 0 || pos === 3) {
      // 1号位或4号位: 1->2->3->4->5->6
      return [0, 1, 2, 3, 4, 5];
    } else if (pos === 1 || pos === 4) {
      // 2号位或5号位: 2->1->3->4->5->6
      return [1, 0, 2, 3, 4, 5];
    } else {
      // 3号位或6号位: 3->2->1->6->5->4
      return [2, 1, 0, 5, 4, 3];
    }
  };

  // 玩家攻击 - 每个存活的玩家单位根据自己的位置选择目标
  const doPlayerAttack = useCallback(() => {
    const currentEnemy = enemyRef.current;
    const currentPlayer = playerRef.current;

    if (!currentEnemy || battleState !== 'fighting') return;
  
    // 使用 ref 获取最新的队伍状态
    const currentEnemyTeam = enemyTeamRef.current;
    const currentPlayerTeam = playerTeamRef.current;

    // 获取存活的玩家单位
    const alivePlayers = currentPlayerTeam.filter(u => u.isAlive);
    if (alivePlayers.length === 0) return;

    // 每个存活的玩家单位攻击一次
    alivePlayers.forEach(attacker => {
      // 获取攻击者的位置（从id中提取，如'player_0'表示1号位）
      const attackerIndex = parseInt(attacker.id.split('_')[1]);
      const attackOrder = getAttackOrder(attackerIndex + 1);

      // 根据攻击优先级查找目标
      let target: BattleUnit | null = null;
      let targetIndex = -1;

      for (const index of attackOrder) {
        const unit = currentEnemyTeam[index];
        if (unit && unit.isAlive) {
          target = unit;
          targetIndex = index;
          break;
        }
      }

      if (!target) return;

      let damage = attacker.attack;
      let isCrit = false;

      // 暴击判定（只有主角有暴击属性）
      if (attackerIndex === 0) {
        const attackerCrit = currentPlayer.totalCrit;
        const defenderGuard = (currentEnemy as any).guardRate || 5;
        let critChance = 0;
        if (attackerCrit > defenderGuard) {
          critChance = (attackerCrit - defenderGuard) / (defenderGuard * 1.5);
        }
        critChance = Math.max(0, Math.min(1, critChance));
        if (Math.random() < critChance) {
          const critDamage = currentPlayer.totalCritDamage / 100;
          damage = Math.floor(damage * (1 + critDamage));
          isCrit = true;
        }
      }

      // 最终减伤比计算
      const enemyDefense = target.defense;
      const playerPenetration = currentPlayer.totalPenetration;
      const playerPenetrationPercent = currentPlayer.totalPenetrationPercent;

      const defenseAfterPenetrationPercent = enemyDefense * (1 - playerPenetrationPercent / 100);
      const actualDefense = Math.max(0, defenseAfterPenetrationPercent - playerPenetration);
      const finalReduction = (actualDefense / (enemyDefense + 600)) * 100;
      damage = Math.floor(damage * (1 - finalReduction / 100));
      damage = Math.max(1, damage);

      // 目标新血量
      const targetNewHp = Math.max(0, target.hp - damage);
      const targetIsAlive = targetNewHp > 0;

      // 更新敌方单位血量
      setEnemyTeam(prev => {
        const newTeam = prev.map((u, idx) => {
          if (idx === targetIndex) {
            return { ...u, hp: targetNewHp, isAlive: targetIsAlive };
          }
          return u;
        });
        enemyTeamRef.current = newTeam;

        // 检查胜利
        const remainingEnemies = newTeam.filter(u => u.isAlive);
        if (remainingEnemies.length === 0) {
          clearAllTimers();
          setBattleState('victory');
          addLog('战斗胜利！');
          if (!isBoss) {
            const progressGain = isElite ? 15 : 10;
            addLog(`狩猎进度 +${progressGain}%`);
          }
        }

        return newTeam;
      });

      addLog(isCrit ? `暴击！${attacker.name}对${target.name}造成 ${damage} 伤害` : `${attacker.name}对${target.name}造成 ${damage} 伤害`);
    });
  }, [battleState, isBoss, isElite, addLog, clearAllTimers]);

  // 敌人攻击 - 每个存活的敌人根据自己的位置选择目标
  const doEnemyAttack = useCallback(() => {
    const currentEnemy = enemyRef.current;
    const currentPlayer = playerRef.current;

    if (!currentEnemy || battleState !== 'fighting') return;

    // 用 ref 获取最新的队伍状态
    const currentEnemyTeam = enemyTeamRef.current;
    const currentPlayerTeam = playerTeamRef.current;

    // 取存活的敌方单位
    const aliveEnemies = currentEnemyTeam.filter(u => u.isAlive);
    if (aliveEnemies.length === 0) return;

    // 每个存活的敌人攻击一次
    aliveEnemies.forEach(attacker => {
      // 获取攻击者的位置（从id中提取，如'enemy_0'表示1号位）
      const attackerIndex = parseInt(attacker.id.split('_')[1]);
      const attackOrder = getAttackOrder(attackerIndex + 1);

      // 根据攻击优先级查找目标
      let target: BattleUnit | null = null;
      let targetIndex = -1;

      for (const index of attackOrder) {
        const unit = currentPlayerTeam[index];
        if (unit && unit.isAlive) {
          target = unit;
          targetIndex = index;
          break;
        }
      }

      if (!target) return;

      let damage = attacker.attack;

      // 敌人攻击时，使用玩家的防御计算减伤
      const playerDefense = currentPlayer.totalDefense;
      const damageReduction = (playerDefense / (playerDefense + 600)) * 100;
      damage = Math.floor(damage * (1 - damageReduction / 100));
      damage = Math.max(1, damage);

      // 应用伤害
      if (targetIndex === 0) {
        currentPlayer.takeDamage(damage);
      }

      addLog(`${attacker.name} 对${targetIndex === 0 ? '主角' : target.name}造成 ${damage} 伤害`);

      // 更新玩家队伍显示
      setPlayerTeam(prev => {
        const newTeam = prev.map((u, idx) => {
          if (idx === targetIndex && targetIndex === 0) {
            return { ...u, hp: currentPlayer.hp, isAlive: !currentPlayer.isDead };
          }
          return u;
        });
        playerTeamRef.current = newTeam;
        return newTeam;
      });

      // 检查失败
      if (currentPlayer.isDead) {
        clearAllTimers();
        setBattleState('defeat');
        addLog('你被击败了！');
        gameManager.isGameOver = true;
        gameManager.player.stamina = 0;
        gameManager.player.hp = 1;
        saveGame();
      }
    });
  }, [battleState, addLog, clearAllTimers, gameManager, saveGame]);

  // 启动自动战斗
  useEffect(() => {
    if (battleState !== 'fighting' || !isInitialized) return;

    const attackSpeed = player.totalAttackSpeed || 1;
    const playerInterval = Math.max(500, 1000 / attackSpeed);
    const enemyAttackSpeed = (enemy as any)?.attackSpeed || 1;
    const enemyInterval = Math.max(500, 1000 / enemyAttackSpeed);

    playerAttackTimer.current = window.setInterval(() => {
      doPlayerAttack();
    }, playerInterval);

    enemyAttackTimer.current = window.setInterval(() => {
      doEnemyAttack();
    }, enemyInterval);

    return () => {
      clearAllTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [battleState, isInitialized, battleResumeFlag, player.totalAttackSpeed, enemy?.speed]);

  // 逃跑
  const handleEscape = () => {
    if (!enemy || battleState !== 'fighting' || escapeCooldown) return;

    setEscapeCooldown(true);
    setTimeout(() => setEscapeCooldown(false), 2000);

    clearAllTimers();
    const result = attemptEscape(enemy);
    result.logs.forEach(log => addLog(log));

    if (result.success) {
      setBattleState('escaped');
      setTimeout(() => onBack(), 1500);
    } else {
      addLog('逃跑失败！战斗继续！');
      setBattleResumeFlag(prev => prev + 1);
    }
  };

  // 继续狩猎
  const handleContinueHunt = async () => {
    if (gameManager.player.stamina < 10) {
      addLog('体力不足，无法继续狩猎');
      return;
    }
    gameManager.advanceTime(15);
    gameManager.player.stamina -= 10;

    const progress = gameManager.getLocationProgress(locationId);
    const progressGain = isElite ? 15 : 10;
    const newHuntProgress = Math.min(80, progress.huntProgress + progressGain);
    gameManager.updateLocationProgress(locationId, { huntProgress: newHuntProgress });

    await saveGame();

    clearAllTimers();
    setIsInitialized(false);
    setBattleState('start');
    setEnemy(null);
    enemyRef.current = null;
    setBattleLog([]);
    setGainedExp(0);

    setTimeout(() => {
      const result = startBattle(locationId, isBoss, isElite);
      if (result.success && result.enemy) {
        const enemyInstance = result.enemy;
        setEnemy(enemyInstance);
        enemyRef.current = enemyInstance;
        const newPlayerTeam = initPlayerTeam();
        const newEnemyTeam = initEnemyTeam(enemyInstance);
        setPlayerTeam(newPlayerTeam);
        setEnemyTeam(newEnemyTeam);
        playerTeamRef.current = newPlayerTeam;
        enemyTeamRef.current = newEnemyTeam;
        setBattleLog([result.message, '战斗开始！']);
        setBattleState('fighting');
        setIsInitialized(true);
      }
    }, 100);
  };

  // 返回采集资源
  const handleReturnCollect = async () => {
    const progress = gameManager.getLocationProgress(locationId);
    const progressGain = isElite ? 15 : 10;
    const newHuntProgress = Math.min(80, progress.huntProgress + progressGain);
    gameManager.updateLocationProgress(locationId, { huntProgress: newHuntProgress });

    await saveGame();

    if (onBattleEnd) {
      onBattleEnd('return_collect');
    } else {
      onBack();
    }
  };

  // BOSS击败后返回
  const handleBossDefeated = async () => {
    gameManager.updateLocationProgress(locationId, { bossDefeated: true });
    await saveGame();

    if (onBattleEnd) {
      onBattleEnd('boss_defeated');
    } else {
      onBack();
    }
  };

  const renderUnitCard = (unit: BattleUnit, position: number) => {
    if (!unit.isAlive && unit.name === '') {
      // 空位置 - 返回透明占位符
      return (
        <div
          key={unit.id}
          style={{
            width: '100px',
            height: '55px',
            backgroundColor: 'transparent',
          }}
        />
      );
    }
        
    const hpPercent = unit.maxHp > 0 ? (unit.hp / unit.maxHp) * 100 : 0;
    const hpColor = hpPercent > 50 ? '#22c55e' : hpPercent > 25 ? '#eab308' : '#ef4444';

    return (
      <div
        key={unit.id}
        style={{
          width: '100px',
          height: '55px',
          backgroundColor: unit.isAlive ? '#1e2235' : '#151825',
          border: `1px solid ${unit.isAlive ? (unit.isPlayer ? '#3b82f6' : '#ef4444') : '#2a2f3f'}`,
          borderRadius: '8px',
          padding: '6px 8px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          opacity: unit.isAlive ? 1 : 0.6,
        }}
      >
        <div style={{
          fontSize: '11px',
          color: unit.isPlayer ? '#60a5fa' : '#f87171',
          fontWeight: 'bold',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          lineHeight: '1.2',
          display: 'flex',
          justifyContent: 'space-between',
        }}>
          <span>{unit.name}</span>
          <span style={{ fontSize: '9px', color: '#6b7280' }}>{position}号</span>
        </div>
        {unit.isAlive ? (
          <>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '10px',
              color: '#9ca3af',
              lineHeight: '1.2',
            }}>
              <span>{unit.hp}</span>
              <span>/{unit.maxHp}</span>
            </div>
            <div style={{
              backgroundColor: '#2a2f3f',
              borderRadius: '3px',
              height: '5px',
              overflow: 'hidden',
            }}>
              <div style={{
                height: '100%',
                backgroundColor: hpColor,
                transition: 'width 0.3s',
                width: `${hpPercent}%`,
              }} />
            </div>
          </>
        ) : (
          <div style={{
            fontSize: '11px',
            color: '#6b7280',
            textAlign: 'center',
            lineHeight: '1.2',
          }}>
            已阵亡
          </div>
        )}
      </div>
    );
  };
      
  // 渲染战斗区域（6个位置）
  const renderBattleField = () => {
    // 上方敌方队伍（3x2布局）
    // 第一行：4、5、6号位（后排）
    // 第二行：1、2、3号位（前排）
    const enemyRow1 = [3, 4, 5].map(index => {
      const unit = enemyTeam[index] || { id: `enemy_${index}`, name: '', hp: 0, maxHp: 0, attack: 0, defense: 0, speed: 0, isPlayer: false, isAlive: false };
      return renderUnitCard(unit, index + 1);
    });
        
    const enemyRow2 = [0, 1, 2].map(index => {
      const unit = enemyTeam[index] || { id: `enemy_${index}`, name: '', hp: 0, maxHp: 0, attack: 0, defense: 0, speed: 0, isPlayer: false, isAlive: false };
      return renderUnitCard(unit, index + 1);
    });
        
    // 下方玩家队伍（3x2布局）
    // 第一行：1、2、3号位（前排）
    // 第二行：4、5、6号位（后排）
    const playerRow1 = [0, 1, 2].map(index => {
      const unit = playerTeam[index] || { id: `player_${index}`, name: '', hp: 0, maxHp: 0, attack: 0, defense: 0, speed: 0, isPlayer: true, isAlive: false };
      return renderUnitCard(unit, index + 1);
    });
          
    const playerRow2 = [3, 4, 5].map(index => {
      const unit = playerTeam[index] || { id: `player_${index}`, name: '', hp: 0, maxHp: 0, attack: 0, defense: 0, speed: 0, isPlayer: true, isAlive: false };
      return renderUnitCard(unit, index + 1);
    });
      
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '30px',
        padding: '20px 16px',
      }}>
        {/* 敌方队伍 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>敌方后排</div>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            {enemyRow1}
          </div>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            {enemyRow2}
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>敌方前排</div>
        </div>

        {/* 战斗状态显示 */}
        {battleState === 'fighting' && (
          <div style={{
            fontSize: '24px',
            color: '#0099cc',
            fontWeight: 'bold',
          }}>
            VS
          </div>
        )}

        {/* 胜利时显示获得经验 */}
        {battleState === 'victory' && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
          }}>
            <div style={{
              width: '70px',
              height: '70px',
              borderRadius: '50%',
              backgroundColor: '#065f46',
              border: '2px solid #4ade80',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              color: '#4ade80',
              fontWeight: 'bold',
              textAlign: 'center',
            }}>
              获得<br/>经验
            </div>
            <div style={{ color: '#4ade80', fontSize: '16px', fontWeight: 'bold' }}>
              +{gainedExp}
            </div>
          </div>
        )}

        {/* 玩家队伍 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>我方前排</div>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            {playerRow1}
          </div>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            {playerRow2}
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>我方后排</div>
        </div>
      </div>
    );
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
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <h1 style={{ color: 'white', fontWeight: 'bold', fontSize: '18px', margin: 0 }}>
          {battleState === 'fighting' && (isBoss ? 'BOSS战' : '自动战斗')}
          {battleState === 'victory' && '胜利！'}
          {battleState === 'defeat' && '失败...'}
          {battleState === 'escaped' && '已逃跑'}
        </h1>
        {battleState === 'fighting' && (
          <button
            onClick={handleEscape}
            disabled={escapeCooldown}
            style={{
              padding: '8px 20px',
              backgroundColor: escapeCooldown ? '#1f2937' : '#374151',
              color: escapeCooldown ? '#6b7280' : '#a1a1aa',
              borderRadius: '6px',
              border: 'none',
              cursor: escapeCooldown ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              fontSize: '14px'
            }}
          >
            {escapeCooldown ? '冷却中...' : '逃跑'}
          </button>
        )}
      </header>

      {/* 主内容区 */}
      <main style={{
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* 6v6 战斗场地 */}
        {renderBattleField()}

        {/* 战斗记录 */}
        <div style={{
          backgroundColor: '#1a1f3a',
          borderRadius: '12px',
          padding: '12px',
          border: '1px solid #374151',
          margin: '16px',
          flex: 1,
          minHeight: '120px'
        }}>
          <h3 style={{ color: '#a1a1aa', fontSize: '12px', margin: '0 0 8px 0' }}>战斗记录</h3>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            fontSize: '12px',
            maxHeight: '200px',
            overflowY: 'auto',
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
            margin: '0 16px 16px'
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

        {/* BOSS战胜利 */}
        {battleState === 'victory' && isBoss && (
          <div style={{
            backgroundColor: '#065f46',
            borderRadius: '12px',
            padding: '12px',
            textAlign: 'center',
            margin: '0 16px 16px'
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
            margin: '0 16px 16px'
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
    </div>
  );
}