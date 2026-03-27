// 宠物列表 + 宠物详情 + 排序 + 批量出售
import { SPECIES, SKILLS, ELEM_CHART, PERSONALITIES, QUALITY_NAMES, TALENTS, GRADE_COLORS, GRADE_NAMES } from '../constants/index.js';
import { gameState } from '../state.js';
import { showModal, closeModal, showToast } from '../utils.js';
import { expForLevel, calcAllStats, getAptFromIV } from '../systems/pet.js';
import { enhanceSkill } from '../systems/comprehend.js';
import { equipTreasure } from '../systems/treasure.js';
import { randInt } from '../utils.js';
import { renderHeader } from './header-ui.js';

let _petSortKey = 'level';
let _petSortAsc = false;
let _petBatchMode = false;
let _petBatchSelected = new Set();

// 暴露到 window 供 onclick 调用
window._enhanceSkill = function(petId, skillIdx) {
  const pet = gameState.pets.find(p => p.id === petId);
  if (!pet) return;
  if (enhanceSkill(pet, skillIdx)) {
    closeModal();
    showPetDetail(pet);
  }
};

window._equipTreasure = function(trId, petId) {
  equipTreasure(trId, petId);
  closeModal();
  renderPets();
};

window._useTalentFruit = function(petId, stat) {
  const pet = gameState.pets.find(p => p.id === petId);
  if (!pet) return;
  if ((gameState.materials.talent_fruit || 0) <= 0) { showToast('没有天赋果', 'info'); return; }
  gameState.materials.talent_fruit--;
  const oldIV = pet.iv[stat];
  pet.iv[stat] = randInt(0, 31);
  pet.apts[stat] = getAptFromIV(pet.iv[stat]);
  calcAllStats(pet);
  showToast(stat.toUpperCase() + ' IV: ' + oldIV + ' → ' + pet.iv[stat] + ' (' + pet.apts[stat] + ')', 'info');
  closeModal();
  showPetDetail(pet);
};

window._batchSellPets = function() {
  let totalGold = 0;
  const ids = [..._petBatchSelected];
  ids.forEach(id => {
    const idx = gameState.pets.findIndex(p => p.id === id);
    if (idx < 0) return;
    const pet = gameState.pets[idx];
    totalGold += pet.level * 10;
    // 卸下宝物
    if (pet.treasure) {
      pet.treasure.equippedTo = null;
    }
    gameState.pets.splice(idx, 1);
  });
  gameState.gold += totalGold;
  _petBatchSelected.clear();
  _petBatchMode = false;
  showToast('批量放生完成! 获得 ' + totalGold + ' 金币', 'loot');
  renderPets();
  renderHeader();
};

function getAptScore(pet) {
  const aptVal = { D: 0, C: 1, B: 2, A: 3, S: 4, 'S+': 5 };
  return (aptVal[pet.apts.hp] || 0) + (aptVal[pet.apts.atk] || 0) + (aptVal[pet.apts.def] || 0) + (aptVal[pet.apts.spd] || 0);
}

export function renderPets() {
  const el = document.getElementById('pet-list');
  if (!el) return;
  el.innerHTML = '';

  if (gameState.pets.length === 0) {
    el.innerHTML = '<p style="color:#666;text-align:center;padding:20px;">还没有宠物...</p>';
    return;
  }

  // 排序+批量工具栏
  const toolbar = document.createElement('div');
  toolbar.className = 'rune-sort-bar';
  toolbar.style.marginBottom = '10px';

  [['level','等级'],['apt','资质'],['elem','元素']].forEach(([key, label]) => {
    const btn = document.createElement('button');
    btn.className = 'sort-btn' + (_petSortKey === key ? ' active' : '');
    btn.textContent = label + (_petSortKey === key ? (_petSortAsc ? '↑' : '↓') : '');
    btn.onclick = () => {
      if (_petSortKey === key) _petSortAsc = !_petSortAsc;
      else { _petSortKey = key; _petSortAsc = false; }
      renderPets();
    };
    toolbar.appendChild(btn);
  });

  const batchBtn = document.createElement('button');
  batchBtn.className = 'sort-btn' + (_petBatchMode ? ' active' : '');
  batchBtn.textContent = _petBatchMode ? '取消批量' : '批量放生';
  batchBtn.onclick = () => { _petBatchMode = !_petBatchMode; _petBatchSelected.clear(); renderPets(); };
  toolbar.appendChild(batchBtn);

  el.appendChild(toolbar);

  // 排序
  const pets = [...gameState.pets];
  pets.sort((a, b) => {
    let va, vb;
    if (_petSortKey === 'level') { va = a.level; vb = b.level; }
    else if (_petSortKey === 'apt') { va = getAptScore(a); vb = getAptScore(b); }
    else { va = a.elem; vb = b.elem; if (va < vb) return _petSortAsc ? -1 : 1; if (va > vb) return _petSortAsc ? 1 : -1; return 0; }
    return _petSortAsc ? va - vb : vb - va;
  });

  pets.forEach(pet => {
    const sp = SPECIES[pet.speciesId];
    const pers = PERSONALITIES[pet.personality] || {name:'未知', up:null, down:null};
    const inForm = gameState.formation.indexOf(pet) >= 0;
    const card = document.createElement('div');
    card.className = 'pet-card' + (inForm ? ' in-formation' : '') + (_petBatchSelected.has(pet.id) ? ' selected' : '');

    const expPct = (pet.exp / expForLevel(pet.level) * 100).toFixed(1);

    // 资质
    let aptHTML = '资质: ';
    ['hp','atk','def','spd'].forEach(st => {
      const a = pet.apts[st];
      const cls = 'apt-' + (a === 'S+' ? 'Sp' : a);
      aptHTML += '<span class="' + cls + '">' + st.toUpperCase() + ':' + a + '</span> ';
    });

    // 个体值
    let ivHTML = '';
    if (gameState.appraisalUnlocked) {
      ivHTML = '<div style="font-size:10px;color:#666;margin-top:2px;">个体值: HP:' + pet.iv.hp + ' ATK:' + pet.iv.atk + ' DEF:' + pet.iv.def + ' SPD:' + pet.iv.spd + '</div>';
    }

    // 技能
    let skillsHTML = '';
    pet.skills.forEach(s => {
      const sd = SKILLS[s.skillId];
      const enh = s.enhanceLevel > 0 ? ' +' + s.enhanceLevel : '';
      const gradeColor = GRADE_COLORS[sd.grade] || '#ccc';
      const gradeName = GRADE_NAMES[sd.grade] || '';
      skillsHTML += '<span class="skill-tag" style="border-color:' + gradeColor + ';">' + sd.name + enh + ' <span style="color:' + gradeColor + ';">[' + gradeName + ']</span></span>';
    });
    if (pet.skills.length === 0) skillsHTML = '<span style="font-size:10px;color:#555;">未习得技能</span>';

    const compMax = Math.floor(pet.level / 3);
    const compText = '领悟: ' + pet.comprehensionCount + '/' + compMax;

    const icon = sp.icon || '';
    card.innerHTML = (_petBatchMode ? '<input type="checkbox" ' + (_petBatchSelected.has(pet.id) ? 'checked' : '') + ' style="float:left;margin:4px 8px 0 0;pointer-events:none;">' : '')
      + '<div class="pet-header">'
      + '<span class="pet-name">' + icon + ' ' + sp.evoChain[pet.evoStage] + ' Lv.' + pet.level + '</span>'
      + '<span class="pet-elem elem-' + pet.elem + '">' + ELEM_CHART[pet.elem].name + '</span>'
      + '</div>'
      + '<div class="pet-apts">' + aptHTML + ' | 性格:' + pers.name + (pers.up ? '(↑' + pers.up + ' ↓' + pers.down + ')' : '') + '</div>'
      + ivHTML
      + '<div class="pet-stats"><span>HP:' + pet.maxHp + '</span><span>ATK:' + pet.atk + '</span><span>DEF:' + pet.def + '</span><span>SPD:' + pet.spd + '</span></div>'
      + '<div class="pet-skills-row">' + skillsHTML + '</div>'
      + '<div style="font-size:10px;color:#666;margin-top:4px;">' + compText + ' | ' + (pet.treasure ? '宝物:' + pet.treasure.name + '+' + pet.treasure.enhanceLevel : '未装备宝物') + '</div>'
      + '<div class="exp-bar"><div class="exp-fill" style="width:' + expPct + '%"></div></div>'
      + '<div style="font-size:9px;color:#555;margin-top:2px;">EXP: ' + pet.exp + '/' + expForLevel(pet.level) + ' (' + expPct + '%)' + (inForm ? ' [出战中]' : '') + '</div>';

    if (_petBatchMode) {
      card.onclick = () => {
        if (inForm) { showToast('出战中的宠物不能放生', 'info'); return; }
        if (_petBatchSelected.has(pet.id)) _petBatchSelected.delete(pet.id);
        else _petBatchSelected.add(pet.id);
        renderPets();
      };
    } else {
      card.onclick = () => showPetDetail(pet);
    }
    el.appendChild(card);
  });

  // 批量操作底栏
  if (_petBatchMode && _petBatchSelected.size > 0) {
    let totalPrice = 0;
    _petBatchSelected.forEach(id => {
      const p = gameState.pets.find(pp => pp.id === id);
      if (p) totalPrice += p.level * 10;
    });
    const batchBar = document.createElement('div');
    batchBar.className = 'batch-bar';
    batchBar.innerHTML = '<span>已选 ' + _petBatchSelected.size + ' 只</span>'
      + '<button class="btn-sm" style="background:#e53935;color:#fff;" onclick="window._batchSellPets()">批量放生 (获得' + totalPrice + '金币)</button>';
    el.appendChild(batchBar);
  }
}

function showPetDetail(pet) {
  const sp = SPECIES[pet.speciesId];
  const pers = PERSONALITIES[pet.personality];

  let html = '<div style="margin-bottom:12px;">';
  html += '<p><strong>' + sp.evoChain[pet.evoStage] + '</strong> (Lv.' + pet.level + ') - ' + sp.desc + '</p>';
  html += '<p>进化链: ' + sp.evoChain.map((e, i) => (i === pet.evoStage ? '<strong>' + e + '</strong>' : '<span style="color:#666">' + e + '</span>')).join(' → ') + '</p>';

  // Talent display
  if (pet.level >= 10 && pet.talent) {
    const talentData = TALENTS[pet.talent];
    html += '<p style="color:#e94560;"><strong>天赋: ' + talentData.name + '</strong> - ' + talentData.desc + '</p>';
  } else if (pet.level < 10) {
    html += '<p style="color:#888;">天赋: ???（Lv.10解锁）</p>';
  }

  // EV/Learning Power display
  if (gameState.appraisalUnlocked && (pet.ev.hp || pet.ev.atk || pet.ev.def || pet.ev.spd)) {
    const totalEV = pet.ev.hp + pet.ev.atk + pet.ev.def + pet.ev.spd;
    html += '<p style="color:#4caf50;font-size:12px;">学习点数: HP:' + pet.ev.hp + ' ATK:' + pet.ev.atk + ' DEF:' + pet.ev.def + ' SPD:' + pet.ev.spd + ' (合计:' + totalEV + '/510)</p>';
    html += '<p style="color:#4caf50;font-size:12px;">战斗次数: ' + (pet.battleCount || 0) + '</p>';
  }

  html += '</div>';

  // 技能区
  // 技能书（所有已领悟技能）
  html += '<h4 style="color:#e94560;">装备技能 (' + pet.skills.length + '/4)</h4>';
  pet.skills.forEach((s, idx) => {
    const sd = SKILLS[s.skillId];
    if (!sd) return;
    const gc = GRADE_COLORS[sd.grade] || '#ccc';
    const gn = GRADE_NAMES[sd.grade] || '';
    html += '<div style="padding:6px;margin:4px 0;background:rgba(255,255,255,0.05);border-radius:4px;">';
    html += '<strong style="color:' + gc + ';">' + sd.name + '</strong> <span style="color:' + gc + ';">[' + gn + ']</span> Lv.' + (s.enhanceLevel + 1);
    html += ' | 威力:' + (sd.power || '-') + ' | CD:' + sd.cooldown + ' | ' + sd.desc;
    html += '</div>';
  });
  // 技能书总览
  if (pet.skillBook && pet.skillBook.length > 0) {
    html += '<h4 style="color:#42a5f5;margin-top:8px;">技能书 (' + pet.skillBook.length + '个已领悟)</h4>';
    pet.skillBook.forEach((entry, idx) => {
      const sd = SKILLS[entry.skillId];
      if (!sd) return;
      const gc = GRADE_COLORS[sd.grade] || '#ccc';
      const gn = GRADE_NAMES[sd.grade] || '';
      const equipped = pet.equippedSkills.indexOf(idx) >= 0;
      html += '<div style="padding:4px 6px;margin:2px 0;background:rgba(255,255,255,' + (equipped ? '0.08' : '0.02') + ');border-radius:4px;border-left:3px solid ' + gc + ';">';
      html += '<span style="color:' + gc + ';">' + sd.name + ' [' + gn + ']</span> Lv.' + entry.level;
      html += equipped ? ' <span style="color:#4caf50;">✓ 已装备</span>' : ' <span style="color:#666;">未装备</span>';
      html += '</div>';
    });
  }

  // 天赋果重随
  if (gameState.appraisalUnlocked && gameState.materials.talent_fruit > 0) {
    html += '<p style="margin-top:12px;"><strong>天赋果重随 (库存:' + gameState.materials.talent_fruit + '):</strong> ';
    ['hp','atk','def','spd'].forEach(stat => {
      html += '<button class="btn-sm" onclick="window._useTalentFruit(' + pet.id + ',\'' + stat + '\')">' + stat.toUpperCase() + '</button> ';
    });
    html += '</p>';
  }

  // 宝物区
  html += '<h4 style="color:#ffd700;margin-top:12px;">宝物</h4>';
  if (pet.treasure) {
    html += '<p>' + pet.treasure.name + ' +' + pet.treasure.enhanceLevel + ' [' + QUALITY_NAMES[pet.treasure.quality] + ']</p>';
  } else {
    const available = gameState.treasures.filter(t => !t.equippedTo);
    if (available.length > 0) {
      html += '<p>未装备 - 可用宝物:</p>';
      available.forEach(t => {
        html += '<div class="modal-select-item" onclick="window._equipTreasure(' + t.id + ',' + pet.id + ')">'
          + t.name + ' [' + QUALITY_NAMES[t.quality] + '] +' + t.enhanceLevel + '</div>';
      });
    } else {
      html += '<p>未装备，暂无可用宝物</p>';
    }
  }

  showModal(sp.name + ' 详情', html, [{ text: '关闭', action: null }]);
}
