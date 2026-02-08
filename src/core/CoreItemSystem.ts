import { CoreItemEffectType } from '../data/types';
import type { CoreItem } from '../data/types';

// 核心道具收集状态
export interface CoreItemCollectionState {
  itemId: string;
  itemName: string;
  isCollected: boolean;
  collectedAt: number | null;
  isActivated: boolean;
}

// 核心道具效果
export interface CoreItemEffect {
  type: CoreItemEffectType;
  name: string;
  description: string;
  value: number;
  isActive: boolean;
}

// 核心道具系统
export class CoreItemSystem {
  private collectedItems: Map<string, CoreItemCollectionState> = new Map();
  private activeEffects: Map<CoreItemEffectType, CoreItemEffect> = new Map();

  constructor() {
    this.initializeCollectionState();
  }

  // 初始化收集状态
  private initializeCollectionState(): void {
    MYTHOLOGY_LOCATIONS.forEach(location => {
      const item = location.coreItem;
      this.collectedItems.set(item.id, {
        itemId: item.id,
        itemName: item.name,
        isCollected: false,
        collectedAt: null,
        isActivated: false,
      });
    });
  }

  // 收集核心道具
  collectCoreItem(itemId: string): { success: boolean; message: string; item?: CoreItem } {
    const state = this.collectedItems.get(itemId);
    if (!state) {
      return { success: false, message: '道具不存在' };
    }

    if (state.isCollected) {
      return { success: false, message: '该道具已经收集过了' };
    }

    // 更新收集状态
    state.isCollected = true;
    state.collectedAt = Date.now();
    this.collectedItems.set(itemId, state);

    // 自动激活道具
    this.activateCoreItem(itemId);

    // 获取道具信息
    const location = MYTHOLOGY_LOCATIONS.find(loc => loc.coreItem.id === itemId);
    const item = location?.coreItem;

    return {
      success: true,
      message: `获得了核心道具：${state.itemName}！`,
      item,
    };
  }

  // 激活核心道具
  activateCoreItem(itemId: string): { success: boolean; message: string } {
    const state = this.collectedItems.get(itemId);
    if (!state) {
      return { success: false, message: '道具不存在' };
    }

    if (!state.isCollected) {
      return { success: false, message: '尚未收集该道具' };
    }

    if (state.isActivated) {
      return { success: false, message: '该道具已经激活' };
    }

    // 获取道具信息
    const location = MYTHOLOGY_LOCATIONS.find(loc => loc.coreItem.id === itemId);
    if (!location) {
      return { success: false, message: '道具信息错误' };
    }

    const item = location.coreItem;

    // 更新激活状态
    state.isActivated = true;
    this.collectedItems.set(itemId, state);

    // 应用效果
    this.applyEffect(item);

    return {
      success: true,
      message: `激活了${item.name}，${item.effectDescription}`,
    };
  }

  // 应用道具效果
  private applyEffect(item: CoreItem): void {
    const effect: CoreItemEffect = {
      type: item.effectType,
      name: item.name,
      description: item.effectDescription,
      value: item.effectValue,
      isActive: true,
    };

    // 同类型效果叠加（取最大值）
    const existingEffect = this.activeEffects.get(item.effectType);
    if (!existingEffect || existingEffect.value < item.effectValue) {
      this.activeEffects.set(item.effectType, effect);
    }
  }

  // 获取所有已收集的道具
  getCollectedItems(): CoreItemCollectionState[] {
    return Array.from(this.collectedItems.values()).filter(item => item.isCollected);
  }

  // 获取所有已激活的效果
  getActiveEffects(): CoreItemEffect[] {
    return Array.from(this.activeEffects.values());
  }

  // 获取特定类型的效果
  getEffectByType(type: CoreItemEffectType): CoreItemEffect | undefined {
    return this.activeEffects.get(type);
  }

  // 计算总速度加成
  getTotalSpeedBoost(): number {
    const effect = this.activeEffects.get(CoreItemEffectType.SPEED_BOOST);
    return effect ? effect.value : 1.0;
  }

  // 计算总防御加成
  getTotalDefenseBoost(): number {
    const effect = this.activeEffects.get(CoreItemEffectType.DEFENSE_BOOST);
    return effect ? effect.value : 1.0;
  }

  // 计算总攻击加成
  getTotalAttackBoost(): number {
    const effect = this.activeEffects.get(CoreItemEffectType.ATTACK_BOOST);
    return effect ? effect.value : 1.0;
  }

  // 计算跃迁加成
  getTotalJumpBoost(): number {
    const effect = this.activeEffects.get(CoreItemEffectType.JUMP_BOOST);
    return effect ? effect.value : 1.0;
  }

  // 获取收集进度
  getCollectionProgress(): { total: number; collected: number; percentage: number } {
    const total = this.collectedItems.size;
    const collected = this.getCollectedItems().length;
    return {
      total,
      collected,
      percentage: Math.floor((collected / total) * 100),
    };
  }

  // 检查是否收集完成所有道具
  isAllCollected(): boolean {
    const progress = this.getCollectionProgress();
    return progress.collected >= progress.total;
  }

  // 获取下一个推荐攻略的站台
  getNextRecommendedLocation(): MythologyLocation | null {
    const uncompleted = MYTHOLOGY_LOCATIONS.filter(
      loc => loc.isUnlocked && !loc.isCompleted
    );
    
    if (uncompleted.length === 0) return null;
    
    // 按站台编号排序，返回第一个
    return uncompleted.sort((a, b) => a.stationNumber - b.stationNumber)[0];
  }

  // 获取已攻略站台的道具效果汇总
  getCompletedLocationEffects(): { locationName: string; itemName: string; effect: string }[] {
    const completed = MYTHOLOGY_LOCATIONS.filter(loc => loc.isCompleted);
    return completed.map(loc => ({
      locationName: loc.name,
      itemName: loc.coreItem.name,
      effect: loc.coreItem.effectDescription,
    }));
  }

  // 保存状态（用于存档）
  serialize(): Record<string, CoreItemCollectionState> {
    const data: Record<string, CoreItemCollectionState> = {};
    this.collectedItems.forEach((state, id) => {
      data[id] = state;
    });
    return data;
  }

  // 加载状态（用于读档）
  deserialize(data: Record<string, CoreItemCollectionState>): void {
    this.collectedItems.clear();
    this.activeEffects.clear();

    Object.entries(data).forEach(([id, state]) => {
      this.collectedItems.set(id, state);
      if (state.isActivated) {
        const location = MYTHOLOGY_LOCATIONS.find(loc => loc.coreItem.id === id);
        if (location) {
          this.applyEffect(location.coreItem);
        }
      }
    });
  }
}

// 导出单例
export const coreItemSystem = new CoreItemSystem();
