// 捕捉系统
import { gameState, getFormationPets } from '../state.js';
import { SPECIES } from '../constants/index.js';
import { clamp, showToast, addLog } from '../utils.js';
import { createPet } from './pet.js';

/**
 * 计算捕捉成功率
 * 公式: (1 - hp/maxHp) * 50 + 灵魂石20 + 等级差10, 夹在5-90%
 */
export function calcCaptureRate(enemy) {
  const hpRatio = enemy.currentHp / enemy.maxHp;
  const baseRate = (1 - hpRatio) * 50;
  const stoneBonus = gameState.materials.soul_stone > 0 ? 20 : 0;
  let maxPetLv = 1;
  getFormationPets().forEach(fp => { if (fp.pet.level > maxPetLv) maxPetLv = fp.pet.level; });
  const lvBonus = maxPetLv >= enemy.level ? 10 : -10;
  return clamp(baseRate + stoneBonus + lvBonus, 5, 90);
}

/**
 * 尝试捕捉
 * @param {number} enemyIdx - 敌人在 gameState.enemies 中的索引
 * @param {Function} onRender - 渲染回调
 */
export function attemptCapture(enemyIdx, onRender) {
  const enemy = gameState.enemies[enemyIdx];
  if (!enemy || enemy.currentHp <= 0) { showToast('目标已被击败', 'info'); return; }

  const useSoulStone = gameState.materials.soul_stone > 0;
  const rate = calcCaptureRate(enemy);

  if (useSoulStone) {
    gameState.materials.soul_stone--;
    addLog('消耗灵魂石，捕捉率 +20%!', 'log-capture');
  }

  addLog('尝试捕捉 ' + enemy.displayName + '... (成功率:' + Math.floor(rate) + '%)', 'log-capture');

  if (Math.random() * 100 < rate) {
    const newPet = createPet(enemy.captureSpecies, Math.max(1, enemy.level - 2));
    gameState.pets.push(newPet);
    gameState.dex[enemy.captureSpecies].caught = true;
    enemy.currentHp = 0;
    gameState.captureMode = false;
    gameState.captureTargetIdx = -1;
    addLog('捕捉成功! 获得 ' + newPet.name + '!', 'log-capture');
    showToast('捕捉成功! 获得 ' + newPet.name + ' [' + newPet.apts.atk + '/' + newPet.apts.def + '/' + newPet.apts.hp + '/' + newPet.apts.spd + ']', 'capture');
  } else {
    addLog('捕捉失败...', 'log-capture');
    showToast('捕捉失败!', 'info');
  }

  if (onRender) onRender();
}
