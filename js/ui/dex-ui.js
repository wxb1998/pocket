// 图鉴 + 保留栏界面
import { SPECIES, ELEM_CHART } from '../constants/index.js';
import { gameState } from '../state.js';
import { showModal, showToast } from '../utils.js';
import { createPet } from '../systems/pet.js';
import { renderHeader } from './header-ui.js';

export function renderDex() {
  const el = document.getElementById('dex-grid');
  if (!el) return;
  el.innerHTML = '';
  Object.keys(SPECIES).forEach(sid => {
    const sp = SPECIES[sid];
    const dexInfo = gameState.dex[sid];
    const entry = document.createElement('div');
    const icon = sp.icon || '';
    if (dexInfo && dexInfo.seen) {
      entry.className = 'dex-entry' + (dexInfo.caught ? ' discovered' : '');
      entry.innerHTML = '<div style="font-size:18px;margin-bottom:2px;">' + icon + '</div>'
        + '<div class="pet-elem elem-' + sp.elem + '" style="display:inline-block;margin-bottom:4px;">' + ELEM_CHART[sp.elem].name + '</div>'
        + '<div>' + sp.name + '</div>'
        + '<div style="font-size:9px;color:#666;">' + sp.evoChain.join('→') + '</div>'
        + (dexInfo.caught ? '<div style="font-size:9px;color:#4caf50;">已捕获</div>' : '<div style="font-size:9px;color:#888;">已发现</div>');
    } else {
      entry.className = 'dex-entry undiscovered';
      entry.innerHTML = '<div style="font-size:18px;margin-bottom:2px;">❓</div><div>???</div><div style="font-size:9px;">未发现</div>';
    }
    el.appendChild(entry);
  });
}

export function renderReserve() {
  const el = document.getElementById('reserve-slots');
  if (!el) return;
  el.innerHTML = '';

  if (gameState.reserve.length === 0) {
    el.innerHTML = '<p style="color:#666;font-size:12px;">暂无极品保存</p>';
    return;
  }

  gameState.reserve.forEach((item, idx) => {
    const sp = SPECIES[item.speciesId];
    const div = document.createElement('div');
    div.className = 'reserve-item star-' + item.stars;
    const icon = sp.icon || '';
    div.innerHTML = '<span class="star-rating">' + '★'.repeat(item.stars) + '</span> '
      + '<span>' + icon + ' ' + (item.displayName || sp.name) + ' Lv.' + item.level + '</span>'
      + '<span style="font-size:10px;color:#888;"> IV:' + item.ivs.hp + '/' + item.ivs.atk + '/' + item.ivs.def + '/' + item.ivs.spd + '</span>'
      + ' <button class="btn-sm" onclick="window._captureReserve(' + idx + ')">捕捉</button>'
      + ' <button class="btn-sm" onclick="window._removeReserve(' + idx + ')">移除</button>';
    el.appendChild(div);
  });
}

// Global functions for reserve capture/removal
window._captureReserve = function(idx) {
  const item = gameState.reserve[idx];
  if (!item) return;
  const sp = SPECIES[item.speciesId];
  showModal('保留栏捕捉',
    '<p>捕捉 ' + (item.displayName || sp.name) + ' Lv.' + item.level + '?</p>'
    + '<p>IV: ' + item.ivs.hp + '/' + item.ivs.atk + '/' + item.ivs.def + '/' + item.ivs.spd + '</p>'
    + '<p style="font-size:12px;color:#888;">消耗1灵魂石，成功率70%</p>',
    [
      { text: '捕捉', primary: true, action: () => {
        if (gameState.materials.soul_stone < 1) { showToast('灵魂石不足', 'info'); return; }
        gameState.materials.soul_stone--;
        if (Math.random() * 100 < 70) {
          const newPet = createPet(item.speciesId, 1, false, item.ivs);
          gameState.pets.push(newPet);
          if (gameState.dex[item.speciesId]) gameState.dex[item.speciesId].caught = true;
          gameState.reserve.splice(idx, 1);
          showToast('捕捉成功! 获得 ' + newPet.name, 'capture');
        } else {
          gameState.reserve.splice(idx, 1);
          showToast('捕捉失败，保留栏目标消失...', 'info');
        }
        renderReserve();
        renderHeader();
      }},
      { text: '取消', action: null }
    ]
  );
};

window._removeReserve = function(idx) {
  gameState.reserve.splice(idx, 1);
  renderReserve();
};
