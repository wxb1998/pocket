// 符文界面 - 宠物选择 → 6槽位可视化 → 装备/强化 → 属性预览
import { gameState } from '../state.js';
import { RUNE_SLOTS, RUNE_SETS, RUNE_QUALITY, RUNE_MAX_LEVEL, RUNE_QUALITY_ORDER } from '../constants/index.js';
import { SPECIES } from '../constants/index.js';
import { showModal, closeModal, showToast } from '../utils.js';
import { enhanceRune, equipRune, unequipRune, sellRune, calcRuneEffects } from '../systems/rune.js';
import { calcAllStats } from '../systems/pet.js';
import { renderHeader } from './header-ui.js';
import { createSpriteElement } from './sprites.js';
import { bindTooltip, runeTooltipHTML } from './tooltip.js';

let _selectedPetId = null;
let _sortKey = 'quality';
let _sortAsc = false;
let _batchMode = false;     // 'sell' | 'enhance' | false
let _batchSelected = new Set();
let _runeFilterQuality = 'all';  // all | white | green | blue | purple | gold
let _runeFilterSet = 'all';      // all | setId
let _runeFilterSlot = 'all';     // all | 0-5
let _runeFilterEquip = 'all';    // all | equipped | unequipped

// 防抖渲染：防止快速连点筛选按钮导致卡死
let _runeRenderRAF = 0;
function scheduleRenderRunes() {
  if (_runeRenderRAF) cancelAnimationFrame(_runeRenderRAF);
  _runeRenderRAF = requestAnimationFrame(() => { _runeRenderRAF = 0; renderRunes(); });
}

export function renderRunes() {
  const el = document.getElementById('rune-list');
  if (!el) return;
  el.innerHTML = '';

  // 顶部：宠物选择器 + 排序 + 批量模式
  const toolbar = document.createElement('div');
  toolbar.className = 'rune-toolbar';

  // 宠物选择
  const petSelect = document.createElement('div');
  petSelect.className = 'rune-pet-selector';
  const noneBtn = document.createElement('button');
  noneBtn.className = 'pet-select-btn' + (!_selectedPetId ? ' active' : '');
  noneBtn.textContent = '📦 全部符文';
  noneBtn.onclick = () => { _selectedPetId = null; scheduleRenderRunes(); };
  petSelect.appendChild(noneBtn);

  gameState.pets.forEach(pet => {
    const sp = SPECIES[pet.speciesId];
    const btn = document.createElement('button');
    btn.className = 'pet-select-btn' + (_selectedPetId === pet.id ? ' active' : '');
    btn.textContent = (sp.icon || '') + ' ' + pet.name;
    btn.onclick = () => { _selectedPetId = pet.id; scheduleRenderRunes(); };
    petSelect.appendChild(btn);
  });

  // 排序栏
  const sortBar = document.createElement('div');
  sortBar.className = 'rune-sort-bar';
  [['quality','品质'],['level','等级'],['slotType','槽位']].forEach(([key, label]) => {
    const btn = document.createElement('button');
    btn.className = 'sort-btn' + (_sortKey === key ? ' active' : '');
    btn.textContent = label + (_sortKey === key ? (_sortAsc ? '↑' : '↓') : '');
    btn.onclick = () => {
      if (_sortKey === key) _sortAsc = !_sortAsc;
      else { _sortKey = key; _sortAsc = false; }
      scheduleRenderRunes();
    };
    sortBar.appendChild(btn);
  });

  // 批量出售按钮
  const batchSellBtn = document.createElement('button');
  batchSellBtn.className = 'sort-btn' + (_batchMode === 'sell' ? ' active' : '');
  batchSellBtn.textContent = _batchMode === 'sell' ? '取消批量' : '批量出售';
  batchSellBtn.onclick = () => { _batchMode = _batchMode === 'sell' ? false : 'sell'; _batchSelected.clear(); scheduleRenderRunes(); };
  sortBar.appendChild(batchSellBtn);

  // 批量强化按钮
  const batchEnhBtn = document.createElement('button');
  batchEnhBtn.className = 'sort-btn' + (_batchMode === 'enhance' ? ' active' : '');
  batchEnhBtn.textContent = _batchMode === 'enhance' ? '取消批量' : '批量强化';
  batchEnhBtn.onclick = () => { _batchMode = _batchMode === 'enhance' ? false : 'enhance'; _batchSelected.clear(); scheduleRenderRunes(); };
  sortBar.appendChild(batchEnhBtn);

  toolbar.appendChild(petSelect);
  toolbar.appendChild(sortBar);

  // === 筛选栏（仅在全部符文视图下显示） ===
  if (!_selectedPetId) {
    const filterBar = document.createElement('div');
    filterBar.className = 'skill-filter-bar';

    // 品质筛选
    const quals = [['all','全部'],['white','白'],['green','绿'],['blue','蓝'],['purple','紫'],['gold','金']];
    quals.forEach(([key, label]) => {
      const btn = document.createElement('button');
      const qualData = key !== 'all' ? RUNE_QUALITY[key] : null;
      btn.className = 'skill-filter-btn' + (_runeFilterQuality === key ? ' active' : '');
      btn.textContent = label;
      if (qualData) btn.style.borderColor = qualData.color;
      btn.onclick = () => { _runeFilterQuality = key; scheduleRenderRunes(); };
      filterBar.appendChild(btn);
    });

    // 分隔
    const sep1 = document.createElement('span');
    sep1.textContent = '|';
    sep1.style.cssText = 'color:#444;margin:0 2px;';
    filterBar.appendChild(sep1);

    // 装备状态
    [['all','全部'],['equipped','已装备'],['unequipped','未装备']].forEach(([key, label]) => {
      const btn = document.createElement('button');
      btn.className = 'skill-filter-btn' + (_runeFilterEquip === key ? ' active' : '');
      btn.textContent = label;
      btn.onclick = () => { _runeFilterEquip = key; scheduleRenderRunes(); };
      filterBar.appendChild(btn);
    });

    // 分隔
    const sep2 = document.createElement('span');
    sep2.textContent = '|';
    sep2.style.cssText = 'color:#444;margin:0 2px;';
    filterBar.appendChild(sep2);

    // 槽位筛选
    const slots = [['all','全部槽位']];
    for (let i = 0; i < 6; i++) slots.push([String(i), RUNE_SLOTS[i].name]);
    slots.forEach(([key, label]) => {
      const btn = document.createElement('button');
      btn.className = 'skill-filter-btn' + (_runeFilterSlot === key ? ' active' : '');
      btn.textContent = label;
      btn.onclick = () => { _runeFilterSlot = key; scheduleRenderRunes(); };
      filterBar.appendChild(btn);
    });

    toolbar.appendChild(filterBar);

    // 批量模式快选栏
    if (_batchMode) {
      const quickBar = document.createElement('div');
      quickBar.className = 'skill-filter-bar';
      // 全选当前筛选
      const selAllBtn = document.createElement('button');
      selAllBtn.className = 'btn-sm';
      selAllBtn.style.cssText = 'background:#1976d2;color:#fff;';
      selAllBtn.textContent = '全选当前筛选';
      selAllBtn.onclick = () => { window._batchSelectFilteredRunes(); };
      quickBar.appendChild(selAllBtn);
      // 快选低品质
      if (_batchMode === 'sell') {
        [['white','全选白'],['green','全选绿']].forEach(([q, label]) => {
          const btn = document.createElement('button');
          btn.className = 'btn-sm';
          btn.style.cssText = 'background:#ff9800;color:#fff;';
          btn.textContent = label;
          btn.onclick = () => { window._batchSelectByQuality(q); };
          quickBar.appendChild(btn);
        });
      }
      // 清空
      const clearBtn = document.createElement('button');
      clearBtn.className = 'btn-sm';
      clearBtn.textContent = '清空选择';
      clearBtn.onclick = () => { _batchSelected.clear(); scheduleRenderRunes(); };
      quickBar.appendChild(clearBtn);
      toolbar.appendChild(quickBar);
    }
  }

  el.appendChild(toolbar);

  // 如果选了宠物，显示装配面板
  if (_selectedPetId) {
    renderEquipPanel(el);
    return;
  }

  // 否则显示符文背包列表
  renderRuneBag(el);
}

function renderEquipPanel(container) {
  const pet = gameState.pets.find(p => p.id === _selectedPetId);
  if (!pet) return;
  if (!pet.runes) pet.runes = [null,null,null,null,null,null];

  const sp = SPECIES[pet.speciesId];
  const panel = document.createElement('div');
  panel.className = 'equip-panel';

  // 宠物头部信息
  const petHeader = document.createElement('div');
  petHeader.className = 'equip-pet-header';
  const sprite = createSpriteElement(pet.speciesId, 48);
  petHeader.appendChild(sprite);
  const petInfo = document.createElement('div');
  petInfo.innerHTML = '<div style="font-size:15px;font-weight:bold;">' + (sp.icon || '') + ' ' + pet.name + ' Lv.' + pet.level + '</div>'
    + '<div style="font-size:12px;color:#888;">HP:' + pet.maxHp + ' ATK:' + pet.atk + ' DEF:' + pet.def + ' SPD:' + pet.spd + '</div>';
  petHeader.appendChild(petInfo);
  panel.appendChild(petHeader);

  // 6槽位网格
  const grid = document.createElement('div');
  grid.className = 'equip-slot-grid';

  for (let i = 0; i < 6; i++) {
    const slot = RUNE_SLOTS[i];
    const runeId = pet.runes[i];
    const rune = runeId ? gameState.runes.find(r => r.id === runeId) : null;

    const slotDiv = document.createElement('div');
    slotDiv.className = 'equip-slot' + (rune ? ' filled' : ' empty');

    if (rune) {
      const set = RUNE_SETS[rune.setId];
      const qual = RUNE_QUALITY[rune.quality];
      slotDiv.style.borderColor = qual.color;
      slotDiv.innerHTML = '<div class="slot-header">' + slot.name + '</div>'
        + '<div class="slot-set" style="color:' + (set ? set.color : '#fff') + ';">' + (set ? set.icon + set.name : '') + '</div>'
        + '<div class="slot-main">' + slot.mainLabel + '+' + rune.mainValue + '</div>'
        + '<div class="slot-level">+' + rune.level + '</div>';

      // Tooltip
      bindTooltip(slotDiv, () => runeTooltipHTML(rune));

      // 操作按钮
      const actions = document.createElement('div');
      actions.className = 'slot-actions';
      if (rune.level < RUNE_MAX_LEVEL) {
        const enhBtn = document.createElement('button');
        enhBtn.className = 'btn-sm';
        enhBtn.textContent = '强化';
        enhBtn.onclick = (e) => { e.stopPropagation(); enhanceRuneInPlace(rune.id); };
        actions.appendChild(enhBtn);
      }
      const unBtn = document.createElement('button');
      unBtn.className = 'btn-sm';
      unBtn.textContent = '卸下';
      unBtn.onclick = (e) => { e.stopPropagation(); unequipRune(rune.id); calcAllStats(pet); renderRunes(); };
      actions.appendChild(unBtn);
      slotDiv.appendChild(actions);
    } else {
      slotDiv.innerHTML = '<div class="slot-header">' + slot.name + '</div>'
        + '<div class="slot-empty-text">' + slot.mainLabel + '</div>'
        + '<div class="slot-empty-hint">点击装备</div>';
      slotDiv.onclick = () => showSlotPicker(pet, i);
    }
    grid.appendChild(slotDiv);
  }
  panel.appendChild(grid);

  // 套装效果总览
  const effects = calcRuneEffects(pet);
  if (effects.setBonuses.length > 0) {
    const setPanel = document.createElement('div');
    setPanel.className = 'equip-set-panel';
    setPanel.innerHTML = '<div class="set-title">套装效果</div>';
    effects.setBonuses.forEach(b => {
      const set = RUNE_SETS[b.setId];
      setPanel.innerHTML += '<div class="set-bonus" style="color:' + (set ? set.color : '#fff') + ';">'
        + (set ? set.icon : '') + ' ' + b.setName + ' ×' + b.count
        + ': ' + b.effects.map(e => e.desc).join(', ') + '</div>';
    });
    panel.appendChild(setPanel);
  }

  // 属性总览
  const statsPanel = document.createElement('div');
  statsPanel.className = 'equip-stats-panel';
  statsPanel.innerHTML = '<div class="stats-title">属性总览(含符文)</div>'
    + '<div class="stats-grid">'
    + '<span>HP: ' + pet.maxHp + '</span><span>ATK: ' + pet.atk + '</span>'
    + '<span>DEF: ' + pet.def + '</span><span>SPD: ' + pet.spd + '</span>'
    + '<span>暴击率: ' + ((5 + (effects.pctStats.crit_rate || 0)).toFixed(1)) + '%</span>'
    + '<span>暴击伤害: ' + ((50 + (effects.pctStats.crit_dmg || 0)).toFixed(1)) + '%</span>'
    + '</div>';
  panel.appendChild(statsPanel);

  container.appendChild(panel);
}

function showSlotPicker(pet, slotIdx) {
  // 列出该槽位类型的可用符文
  const available = gameState.runes.filter(r => r.slotType === slotIdx && (!r.equippedTo || r.equippedTo === pet.id));
  if (available.length === 0) {
    showToast('没有适合该槽位的符文，去副本获取吧!', 'info');
    return;
  }

  const slot = RUNE_SLOTS[slotIdx];
  let html = '<p>为 <strong>' + slot.name + '</strong> 选择符文:</p>';
  available.forEach(rune => {
    const set = RUNE_SETS[rune.setId];
    const qual = RUNE_QUALITY[rune.quality];
    const subsText = rune.subs.map(s => s.name + '+' + s.value).join(' ');
    html += '<div class="capture-item-row" onclick="window._pickRuneForSlot(' + rune.id + ',' + pet.id + ')">'
      + '<span style="color:' + (set ? set.color : '#fff') + ';">' + (set ? set.icon + set.name : '') + '</span>'
      + ' <span style="color:' + qual.color + ';">+' + rune.level + '</span>'
      + ' ' + slot.mainLabel + '+' + rune.mainValue
      + '<div style="font-size:10px;color:#888;">' + subsText + '</div>'
      + '</div>';
  });

  showModal('选择符文', html, [{ text: '取消', action: null }]);
}

window._pickRuneForSlot = function(runeId, petId) {
  closeModal();
  equipRune(runeId, petId);
  const pet = gameState.pets.find(p => p.id === petId);
  if (pet) calcAllStats(pet);
  showToast('符文装备成功!', 'loot');
  renderRunes();
};

function enhanceRuneInPlace(runeId) {
  const result = enhanceRune(runeId);
  if (result.success) {
    showToast(result.message, 'loot');
    // 重新计算宠物属性
    const rune = gameState.runes.find(r => r.id === runeId);
    if (rune && rune.equippedTo) {
      const pet = gameState.pets.find(p => p.id === rune.equippedTo);
      if (pet) calcAllStats(pet);
    }
  } else {
    showToast(result.message, 'info');
  }
  renderRunes();
  renderHeader();
}

function getFilteredRunes() {
  return (gameState.runes || []).filter(rune => {
    if (_runeFilterQuality !== 'all' && rune.quality !== _runeFilterQuality) return false;
    if (_runeFilterSlot !== 'all' && rune.slotType !== parseInt(_runeFilterSlot)) return false;
    if (_runeFilterEquip === 'equipped' && !rune.equippedTo) return false;
    if (_runeFilterEquip === 'unequipped' && rune.equippedTo) return false;
    return true;
  });
}

function renderRuneBag(container) {
  const allRunes = gameState.runes || [];
  if (allRunes.length === 0) {
    const emptyMsg = document.createElement('p');
    emptyMsg.style.cssText = 'color:#666;text-align:center;padding:20px;';
    emptyMsg.textContent = '暂无符文，去副本挑战获取吧!';
    container.appendChild(emptyMsg);
    return;
  }

  const runes = getFilteredRunes();

  // 排序
  const qualOrder = { gold: 0, purple: 1, blue: 2, green: 3, white: 4 };
  runes.sort((a, b) => {
    let va, vb;
    if (_sortKey === 'quality') { va = qualOrder[a.quality] || 5; vb = qualOrder[b.quality] || 5; }
    else if (_sortKey === 'level') { va = a.level; vb = b.level; }
    else { va = a.slotType; vb = b.slotType; }
    return _sortAsc ? va - vb : vb - va;
  });

  if (runes.length === 0) {
    const emptyMsg = document.createElement('p');
    emptyMsg.style.cssText = 'color:#555;text-align:center;padding:12px;';
    emptyMsg.textContent = '没有匹配的符文 (共' + allRunes.length + '个)';
    container.appendChild(emptyMsg);
    return;
  }

  const list = document.createElement('div');
  list.className = 'rune-bag-list';

  runes.forEach(rune => {
    const set = RUNE_SETS[rune.setId];
    const qual = RUNE_QUALITY[rune.quality];
    const slot = RUNE_SLOTS[rune.slotType];
    const equipped = rune.equippedTo ? gameState.pets.find(p => p.id === rune.equippedTo) : null;

    const div = document.createElement('div');
    div.className = 'rune-card' + (_batchSelected.has(rune.id) ? ' selected' : '');
    div.style.borderLeft = '3px solid ' + qual.color;

    // 批量模式点击选择
    if (_batchMode) {
      div.onclick = () => {
        if (_batchMode === 'sell' && rune.equippedTo) { showToast('已装备的符文不能出售', 'info'); return; }
        if (_batchMode === 'enhance' && rune.level >= RUNE_MAX_LEVEL) { showToast('该符文已满级', 'info'); return; }
        if (_batchSelected.has(rune.id)) _batchSelected.delete(rune.id);
        else _batchSelected.add(rune.id);
        renderRunes();
      };
    }

    let subsHTML = rune.subs.map(s => '<span class="rune-sub">' + s.name + '+' + s.value + '</span>').join(' ');

    div.innerHTML = (_batchMode ? '<input type="checkbox" ' + (_batchSelected.has(rune.id) ? 'checked' : '') + ' style="margin-right:6px;pointer-events:none;">' : '')
      + '<div class="rune-header">'
      + '<span style="color:' + (set ? set.color : '#fff') + ';">' + (set ? set.icon + ' ' + set.name : '') + '</span>'
      + ' <span style="color:' + qual.color + ';">' + slot.name + '</span>'
      + ' <span class="rune-level">+' + rune.level + '</span>'
      + (equipped ? ' <span style="font-size:10px;color:#888;">(' + equipped.name + ')</span>' : '')
      + '</div>'
      + '<div class="rune-main">' + slot.mainLabel + '+' + rune.mainValue + '</div>'
      + '<div class="rune-subs">' + subsHTML + '</div>';

    if (!_batchMode) {
      const actions = document.createElement('div');
      actions.className = 'rune-actions';
      if (rune.level < RUNE_MAX_LEVEL) {
        const enhBtn = document.createElement('button');
        enhBtn.className = 'btn-sm';
        enhBtn.textContent = '强化';
        enhBtn.onclick = (e) => { e.stopPropagation(); enhanceRuneInPlace(rune.id); };
        actions.appendChild(enhBtn);
      }
      if (!rune.equippedTo) {
        const sellBtn = document.createElement('button');
        sellBtn.className = 'btn-sm';
        sellBtn.style.color = '#e53935';
        sellBtn.textContent = '出售';
        sellBtn.onclick = (e) => {
          e.stopPropagation();
          const price = sellRune(rune.id);
          showToast('出售获得 ' + price + ' 金币', 'loot');
          renderRunes(); renderHeader();
        };
        actions.appendChild(sellBtn);
      }
      div.appendChild(actions);
    }

    // Tooltip
    bindTooltip(div, () => runeTooltipHTML(rune));
    list.appendChild(div);
  });

  container.appendChild(list);

  // === 批量操作底栏 ===
  if (_batchMode && _batchSelected.size > 0) {
    const batchBar = document.createElement('div');
    batchBar.className = 'batch-bar';

    if (_batchMode === 'sell') {
      const qualMult = { white: 1, green: 2, blue: 4, purple: 8, gold: 15 };
      let totalPrice = 0;
      _batchSelected.forEach(id => {
        const r = gameState.runes.find(rr => rr.id === id);
        if (r) totalPrice += (100 + r.level * 50) * (qualMult[r.quality] || 1);
      });
      batchBar.innerHTML = '<span>已选 ' + _batchSelected.size + ' 个</span>'
        + '<button class="btn-sm" style="background:#e53935;color:#fff;" onclick="window._batchSellRunes()">批量出售 (获得' + totalPrice + '金币)</button>';
    } else if (_batchMode === 'enhance') {
      // 计算总费用
      let totalCost = 0;
      _batchSelected.forEach(id => {
        const r = gameState.runes.find(rr => rr.id === id);
        if (r && r.level < RUNE_MAX_LEVEL) totalCost += 500 + r.level * 300;
      });
      batchBar.innerHTML = '<span>已选 ' + _batchSelected.size + ' 个</span>'
        + '<button class="btn-sm" style="background:#ff9800;color:#fff;" onclick="window._batchEnhanceRunes(1)">各+1 (需' + totalCost + '金币)</button>'
        + '<button class="btn-sm" style="background:#e94560;color:#fff;margin-left:4px;" onclick="window._batchEnhanceRunes(3)">各+3</button>';
    }
    container.appendChild(batchBar);
  }
}

// === 批量快选 ===
window._batchSelectFilteredRunes = function() {
  const filtered = getFilteredRunes();
  const selectable = filtered.filter(r => {
    if (_batchMode === 'sell') return !r.equippedTo;
    if (_batchMode === 'enhance') return r.level < RUNE_MAX_LEVEL;
    return true;
  });
  const allSelected = selectable.every(r => _batchSelected.has(r.id));
  if (allSelected) {
    selectable.forEach(r => _batchSelected.delete(r.id));
  } else {
    selectable.forEach(r => _batchSelected.add(r.id));
  }
  renderRunes();
};

window._batchSelectByQuality = function(quality) {
  gameState.runes.forEach(r => {
    if (r.quality === quality && !r.equippedTo) _batchSelected.add(r.id);
  });
  renderRunes();
};

// === 批量出售 ===
window._batchSellRunes = function() {
  let totalGold = 0;
  const ids = [..._batchSelected];
  ids.forEach(id => { totalGold += sellRune(id); });
  _batchSelected.clear();
  _batchMode = false;
  showToast('批量出售完成! 获得 ' + totalGold + ' 金币', 'loot');
  renderRunes();
  renderHeader();
};

// === 批量强化 ===
window._batchEnhanceRunes = function(times) {
  let totalSpent = 0;
  let successCount = 0;
  const ids = [..._batchSelected];
  for (const id of ids) {
    const rune = gameState.runes.find(r => r.id === id);
    if (!rune || rune.level >= RUNE_MAX_LEVEL) continue;
    for (let t = 0; t < times; t++) {
      if (rune.level >= RUNE_MAX_LEVEL) break;
      const cost = 500 + rune.level * 300;
      if (gameState.gold < cost) {
        showToast('金币不足，已强化 ' + successCount + ' 次', 'info');
        _batchSelected.clear();
        _batchMode = false;
        renderRunes();
        renderHeader();
        return;
      }
      const result = enhanceRune(id);
      if (result.success) {
        totalSpent += cost;
        successCount++;
        // 重新计算装备宠物属性
        if (rune.equippedTo) {
          const pet = gameState.pets.find(p => p.id === rune.equippedTo);
          if (pet) calcAllStats(pet);
        }
      }
    }
  }
  _batchSelected.clear();
  _batchMode = false;
  showToast('批量强化完成! ' + successCount + '次，花费 ' + totalSpent + ' 金币', 'loot');
  renderRunes();
  renderHeader();
};
