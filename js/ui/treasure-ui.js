// 宝物列表界面 + 排序 + 批量出售
import { QUALITY_NAMES, PASSIVE_POOL } from '../constants/index.js';
import { gameState } from '../state.js';
import { enhanceTreasure, unequipTreasure } from '../systems/treasure.js';
import { showToast } from '../utils.js';
import { renderHeader } from './header-ui.js';

let _trSortKey = 'quality';
let _trSortAsc = false;
let _trBatchMode = false;
let _trBatchSelected = new Set();

// 暴露到 window
window._enhanceTreasure = function(id) { enhanceTreasure(id); renderTreasure(); };
window._unequipTreasure = function(id) { unequipTreasure(id); renderTreasure(); };

window._batchSellTreasures = function() {
  let totalGold = 0;
  const qualMult = { white: 1, green: 2, blue: 4, purple: 8, gold: 15 };
  const ids = [..._trBatchSelected];
  ids.forEach(id => {
    const idx = gameState.treasures.findIndex(t => t.id === id);
    if (idx < 0) return;
    const tr = gameState.treasures[idx];
    if (tr.equippedTo) return; // skip equipped
    totalGold += (50 + tr.enhanceLevel * 30) * (qualMult[tr.quality] || 1);
    gameState.treasures.splice(idx, 1);
  });
  gameState.gold += totalGold;
  _trBatchSelected.clear();
  _trBatchMode = false;
  showToast('批量出售完成! 获得 ' + totalGold + ' 金币', 'loot');
  renderTreasure();
  renderHeader();
};

export function renderTreasure() {
  const el = document.getElementById('treasure-list');
  if (!el) return;
  el.innerHTML = '';

  // 材料信息
  el.innerHTML = '<div style="margin-bottom:10px;font-size:12px;color:#888;">'
    + '强化石:' + gameState.materials.enhance_stone + ' | 精良强化石:' + gameState.materials.rare_enhance
    + '</div>';

  if (gameState.treasures.length === 0) {
    el.innerHTML += '<p style="color:#666;text-align:center;padding:20px;">还没有宝物，战斗掉落获取...</p>';
    return;
  }

  // 排序+批量工具栏
  const toolbar = document.createElement('div');
  toolbar.className = 'rune-sort-bar';
  toolbar.style.marginBottom = '10px';

  [['quality','品质'],['enhanceLevel','强化等级']].forEach(([key, label]) => {
    const btn = document.createElement('button');
    btn.className = 'sort-btn' + (_trSortKey === key ? ' active' : '');
    btn.textContent = label + (_trSortKey === key ? (_trSortAsc ? '↑' : '↓') : '');
    btn.onclick = () => {
      if (_trSortKey === key) _trSortAsc = !_trSortAsc;
      else { _trSortKey = key; _trSortAsc = false; }
      renderTreasure();
    };
    toolbar.appendChild(btn);
  });

  const batchBtn = document.createElement('button');
  batchBtn.className = 'sort-btn' + (_trBatchMode ? ' active' : '');
  batchBtn.textContent = _trBatchMode ? '取消批量' : '批量出售';
  batchBtn.onclick = () => { _trBatchMode = !_trBatchMode; _trBatchSelected.clear(); renderTreasure(); };
  toolbar.appendChild(batchBtn);

  el.appendChild(toolbar);

  // 排序
  const qualOrder = { gold: 0, purple: 1, blue: 2, green: 3, white: 4 };
  const treasures = [...gameState.treasures];
  treasures.sort((a, b) => {
    let va, vb;
    if (_trSortKey === 'quality') { va = qualOrder[a.quality] || 5; vb = qualOrder[b.quality] || 5; }
    else { va = a.enhanceLevel; vb = b.enhanceLevel; }
    return _trSortAsc ? va - vb : vb - va;
  });

  treasures.forEach(tr => {
    const card = document.createElement('div');
    card.className = 'treasure-card quality-' + tr.quality + (_trBatchSelected.has(tr.id) ? ' selected' : '');
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

    card.innerHTML = (_trBatchMode ? '<input type="checkbox" ' + (_trBatchSelected.has(tr.id) ? 'checked' : '') + ' style="float:left;margin:4px 8px 0 0;pointer-events:none;">' : '')
      + '<div class="tr-name">' + tr.name + ' +' + tr.enhanceLevel + ' [' + QUALITY_NAMES[tr.quality] + ']' + equippedText + '</div>'
      + '<div class="tr-affixes">' + affixText + '</div>'
      + passiveText;

    if (_trBatchMode) {
      card.onclick = () => {
        if (tr.equippedTo) { showToast('已装备的宝物不能批量出售', 'info'); return; }
        if (_trBatchSelected.has(tr.id)) _trBatchSelected.delete(tr.id);
        else _trBatchSelected.add(tr.id);
        renderTreasure();
      };
    } else {
      card.innerHTML += '<div class="tr-actions">'
        + '<button class="btn-sm btn-enhance" onclick="window._enhanceTreasure(' + tr.id + ')">强化</button>'
        + (tr.equippedTo ? '<button class="btn-sm btn-unequip" onclick="window._unequipTreasure(' + tr.id + ')">卸下</button>' : '')
        + '</div>';
    }

    el.appendChild(card);
  });

  // 批量操作底栏
  if (_trBatchMode && _trBatchSelected.size > 0) {
    const qualMult = { white: 1, green: 2, blue: 4, purple: 8, gold: 15 };
    let totalPrice = 0;
    _trBatchSelected.forEach(id => {
      const t = gameState.treasures.find(tt => tt.id === id);
      if (t) totalPrice += (50 + t.enhanceLevel * 30) * (qualMult[t.quality] || 1);
    });
    const batchBar = document.createElement('div');
    batchBar.className = 'batch-bar';
    batchBar.innerHTML = '<span>已选 ' + _trBatchSelected.size + ' 个</span>'
      + '<button class="btn-sm" style="background:#e53935;color:#fff;" onclick="window._batchSellTreasures()">批量出售 (获得' + totalPrice + '金币)</button>';
    el.appendChild(batchBar);
  }
}
