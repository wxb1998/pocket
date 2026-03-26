// 图鉴 + 保留栏界面
import { SPECIES, ELEM_CHART } from '../constants/index.js';
import { gameState } from '../state.js';
import { showModal, clamp, showToast } from '../utils.js';
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
    if (dexInfo && dexInfo.seen) {
      entry.className = 'dex-entry' + (dexInfo.caught ? ' discovered' : '');
      entry.innerHTML = '<div class="pet-elem elem-' + sp.elem + '" style="display:inline-block;margin-bottom:4px;">' + ELEM_CHART[sp.elem].name + '</div>'
        + '<div>' + sp.name + '</div>'
        + '<div style="font-size:9px;color:#666;">' + sp.evoChain.join('→') + '</div>'
        + (dexInfo.caught ? '<div style="font-size:9px;color:#4caf50;">已捕获</div>' : '<div style="font-size:9px;color:#888;">已发现</div>');
    } else {
      entry.className = 'dex-entry undiscovered';
      entry.innerHTML = '<div>???</div><div style="font-size:9px;">未发现</div>';
    }
    el.appendChild(entry);
  });
}

export function renderReserve() {
  const el = document.getElementById('reserve-slots');
  if (!el) return;
  el.innerHTML = '';
  for (let i = 0; i < 10; i++) {
    const div = document.createElement('div');
    if (i < gameState.reserve.length) {
      const r = gameState.reserve[i];
      div.className = 'reserve-slot occupied';
      div.innerHTML = '<div>' + SPECIES[r.speciesId].name + '</div><div>Lv.' + r.level + '</div>';
      const idx = i;
      div.onclick = () => showReserveCapture(idx);
    } else {
      div.className = 'reserve-slot';
      div.innerHTML = '<div style="color:#444;">空</div>';
    }
    el.appendChild(div);
  }
}

function showReserveCapture(idx) {
  const r = gameState.reserve[idx];
  if (!r) return;
  showModal('保留栏捕捉',
    '<p>是否尝试捕捉 ' + SPECIES[r.speciesId].name + ' Lv.' + r.level + '?</p><p>消耗1灵魂石</p>',
    [
      { text: '捕捉', primary: true, action: () => {
        if (gameState.materials.soul_stone < 1) { showToast('灵魂石不足', 'info'); return; }
        gameState.materials.soul_stone--;
        if (Math.random() * 100 < 70) {
          const newPet = createPet(r.speciesId, r.level);
          gameState.pets.push(newPet);
          gameState.dex[r.speciesId].caught = true;
          gameState.reserve.splice(idx, 1);
          showToast('捕捉成功! 获得 ' + newPet.name, 'capture');
        } else {
          gameState.reserve.splice(idx, 1);
          showToast('捕捉失败，保留栏目标消失...', 'info');
        }
        renderReserve();
        renderHeader();
      }},
      { text: '释放', action: () => { gameState.reserve.splice(idx, 1); renderReserve(); }},
      { text: '取消', action: null }
    ]
  );
}
