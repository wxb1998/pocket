// 探索系统 - 活力机制（开罗风）
// 每个区域有独立活力值，战斗消耗活力，耗尽后收益大幅下降，活力随时间缓慢恢复
import { ZONES } from '../constants/index.js';
import { gameState } from '../state.js';

/**
 * 初始化活力数据（新存档或旧存档迁移）
 */
export function initVigor() {
  if (!gameState.zoneVigor) {
    gameState.zoneVigor = {};
  }
  // 为每个区域补全活力数据
  ZONES.forEach((zone, idx) => {
    if (!gameState.zoneVigor[idx]) {
      gameState.zoneVigor[idx] = {
        current: zone.maxVigor,
        lastRegenTime: Date.now()
      };
    }
  });
}

/**
 * 回复所有区域的活力（根据时间流逝）
 * 应在每次读取活力前调用
 */
export function regenAllVigor() {
  const now = Date.now();
  ZONES.forEach((zone, idx) => {
    const vData = gameState.zoneVigor[idx];
    if (!vData) return;
    const elapsed = now - (vData.lastRegenTime || now);
    // vigorRegen 是每小时回复量
    const regenAmount = (elapsed / (3600 * 1000)) * zone.vigorRegen;
    if (regenAmount >= 1) {
      const oldVal = vData.current;
      vData.current = Math.min(zone.maxVigor, vData.current + Math.floor(regenAmount));
      vData.lastRegenTime = now - ((elapsed % (3600 * 1000 / zone.vigorRegen)) || 0);
    }
  });
}

/**
 * 消耗当前区域活力（每次战斗调用）
 * @returns {number} 收益倍率 (1.0=满活力, depletedRatio=耗尽)
 */
export function consumeVigor() {
  const zoneIdx = gameState.currentZone;
  const zone = ZONES[zoneIdx];
  if (!zone) return 1.0;

  regenAllVigor();

  const vData = gameState.zoneVigor[zoneIdx];
  if (!vData) return 1.0;

  if (vData.current <= 0) {
    // 活力耗尽，低收益
    return zone.depletedRatio || 0.2;
  }

  // 消耗活力
  vData.current = Math.max(0, vData.current - zone.vigorCost);

  // 活力剩余不足一半时，收益开始线性衰减
  const ratio = vData.current / zone.maxVigor;
  if (ratio <= 0) return zone.depletedRatio || 0.2;
  if (ratio < 0.3) {
    // 30%以下线性衰减: 从0.5倍到depletedRatio
    const depleted = zone.depletedRatio || 0.2;
    return depleted + (0.5 - depleted) * (ratio / 0.3);
  }
  return 1.0;
}

/**
 * 获取指定区域的活力信息
 * @param {number} zoneIdx
 * @returns {{current:number, max:number, ratio:number, regenPerHour:number}}
 */
export function getVigorInfo(zoneIdx) {
  const zone = ZONES[zoneIdx];
  if (!zone) return { current: 0, max: 0, ratio: 0, regenPerHour: 0 };

  regenAllVigor();

  const vData = gameState.zoneVigor[zoneIdx];
  if (!vData) return { current: 0, max: zone.maxVigor, ratio: 0, regenPerHour: zone.vigorRegen };

  return {
    current: Math.floor(vData.current),
    max: zone.maxVigor,
    ratio: vData.current / zone.maxVigor,
    regenPerHour: zone.vigorRegen
  };
}

/**
 * 获取当前区域活力对收益的倍率（只读，不消耗）
 */
export function getVigorMultiplier(zoneIdx) {
  const zone = ZONES[zoneIdx];
  if (!zone) return 1.0;

  const vData = gameState.zoneVigor[zoneIdx];
  if (!vData) return 1.0;

  const ratio = vData.current / zone.maxVigor;
  if (ratio <= 0) return zone.depletedRatio || 0.2;
  if (ratio < 0.3) {
    const depleted = zone.depletedRatio || 0.2;
    return depleted + (0.5 - depleted) * (ratio / 0.3);
  }
  return 1.0;
}
