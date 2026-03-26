// 宝物列表界面
import { QUALITY_NAMES, PASSIVE_POOL } from '../constants/index.js';
import { gameState } from '../state.js';
import { enhanceTreasure, unequipTreasure } from '../systems/treasure.js';

// 暴露到 window
window._enhanceTreasure = function(id) { enhanceTreasure(id); renderTreasure(); };
window._unequipTreasure = function(id) { unequipTreasure(id); renderTreasure(); };

export function renderTreasure() {
  const el = document.getElementById('treasure-list');
  if (!el) return;
  el.innerHTML = '<div style="margin-bottom:10px;font-size:12px;color:#888;">'
    + '强化石:' + gameState.materials.enhance_stone + ' | 精良强化石:' + gameState.materials.rare_enhance
    + '</div>';

  if (gameState.treasures.length === 0) {
    el.innerHTML += '<p style="color:#666;text-align:center;padding:20px;">还没有宝物，战斗掉落获取...</p>';
    return;
  }

  gameState.treasures.forEach(tr => {
    const card = document.createElement('div');
    card.className = 'treasure-card quality-' + tr.quality;
    const affixText = tr.affixes.map(a => a.name + '+' + a.value + a.suffix).join(', ');

    let passiveText = '';
    if (tr.passive) {
      const pp = PASSIVE_POOL.find(p => p.id === tr.passive);
      if (pp) passiveText = '<div class="tr-passive">被动: ' + pp.name + ' - ' + pp.desc + '</div>';
    }

    let equippedText = '';
    if (tr.equippedTo) {
      const pet = gameState.pets.find(p => p.id === tr.equippedTo);
      equippedText = pet ? ' [装备于:' + pet.name + ']' : '';
    }

    card.innerHTML = '<div class="tr-name">' + tr.name + ' +' + tr.enhanceLevel + ' [' + QUALITY_NAMES[tr.quality] + ']' + equippedText + '</div>'
      + '<div class="tr-affixes">' + affixText + '</div>'
      + passiveText
      + '<div class="tr-actions">'
      + '<button class="btn-sm btn-enhance" onclick="window._enhanceTreasure(' + tr.id + ')">强化</button>'
      + (tr.equippedTo ? '<button class="btn-sm btn-unequip" onclick="window._unequipTreasure(' + tr.id + ')">卸下</button>' : '')
      + '</div>';
    el.appendChild(card);
  });
}
