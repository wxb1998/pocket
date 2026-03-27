// 顶部资源栏渲染
import { gameState } from '../state.js';
import { getVigorInfo } from '../systems/explore.js';
import { ZONES } from '../constants/index.js';

export function renderHeader() {
  document.getElementById('res-level').textContent = '冒险Lv.' + gameState.advLv;
  document.getElementById('res-gold').textContent = '金币:' + gameState.gold;
  document.getElementById('res-soul').textContent = '灵魂石:' + gameState.materials.soul_stone;
  const ropeEl = document.getElementById('res-rope');
  if (ropeEl) ropeEl.textContent = '草绳:' + (gameState.materials.rope || 0);
  const staminaEl = document.getElementById('res-stamina');
  if (staminaEl) staminaEl.textContent = '⚡' + (gameState.stamina || 0);
  // 当前区域活力
  const vigorEl = document.getElementById('res-vigor');
  if (vigorEl) {
    const info = getVigorInfo(gameState.currentZone);
    const zone = ZONES[gameState.currentZone];
    const pct = Math.floor(info.ratio * 100);
    const color = pct > 60 ? '#4caf50' : (pct > 30 ? '#ff9800' : '#f44336');
    vigorEl.innerHTML = '<span style="color:' + color + ';">🔥' + info.current + '/' + info.max + '</span>';
  }
  document.getElementById('res-pets').textContent = '宠物:' + gameState.pets.length + '/50';
}
