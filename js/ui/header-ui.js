// 顶部资源栏渲染
import { gameState } from '../state.js';

export function renderHeader() {
  document.getElementById('res-level').textContent = '冒险Lv.' + gameState.advLv;
  document.getElementById('res-gold').textContent = '金币:' + gameState.gold;
  document.getElementById('res-soul').textContent = '灵魂石:' + gameState.materials.soul_stone;
  document.getElementById('res-pets').textContent = '宠物:' + gameState.pets.length + '/50';
}
