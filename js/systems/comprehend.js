// 技能领悟系统
import { SPECIES, SKILLS } from '../constants/index.js';
import { showModal, closeModal, showToast, addLog, pick } from '../utils.js';

/**
 * 战斗胜利后尝试领悟技能
 * 6%概率，上限 = floor(等级/3)
 */
export function tryComprehend(pet) {
  const maxCount = Math.floor(pet.level / 3);
  if (pet.comprehensionCount >= maxCount) return;
  if (Math.random() > 0.06) return;

  const sp = SPECIES[pet.speciesId];
  const availableTiers = ['basic'];
  if (pet.evoStage >= 1) availableTiers.push('mid');
  if (pet.evoStage >= 2) availableTiers.push('high');

  const candidates = [];
  availableTiers.forEach(tier => {
    (sp.skillPool[tier] || []).forEach(skId => {
      if (!pet.skills.find(s => s.skillId === skId)) {
        candidates.push(skId);
      }
    });
  });

  if (candidates.length === 0) return;

  const newSkillId = pick(candidates);
  pet.comprehensionCount++;

  if (pet.skills.length < 4) {
    pet.skills.push({ skillId: newSkillId, enhanceLevel: 0, cooldownLeft: 0, priority: pet.skills.length });
    addLog(pet.name + ' 领悟了新技能: ' + SKILLS[newSkillId].name + '!', 'log-comprehend');
    showToast(pet.name + ' 领悟了 ' + SKILLS[newSkillId].name + '!', 'info');
  } else {
    // 技能槽满 - 弹窗选择替换或放弃
    const skName = SKILLS[newSkillId].name;
    let html = '<p>' + pet.name + ' 领悟了 <strong>' + skName + '</strong>，但技能槽已满!</p>';
    html += '<p>选择要替换的技能，或放弃（仍消耗领悟次数）:</p>';
    pet.skills.forEach((s, idx) => {
      const sd = SKILLS[s.skillId];
      html += '<div class="modal-select-item" data-replace-idx="' + idx + '">'
        + sd.name + ' (Lv.' + (s.enhanceLevel + 1) + ') - ' + sd.desc + '</div>';
    });
    html += '<div class="modal-select-item" data-replace-idx="-1" style="color:#888;">放弃领悟</div>';

    showModal('技能领悟', html, []);

    setTimeout(() => {
      document.querySelectorAll('[data-replace-idx]').forEach(el => {
        el.onclick = () => {
          const idx = parseInt(el.getAttribute('data-replace-idx'));
          if (idx >= 0) {
            pet.skills[idx] = { skillId: newSkillId, enhanceLevel: 0, cooldownLeft: 0, priority: idx };
            showToast('替换成功! 学会了 ' + skName, 'info');
          } else {
            showToast('放弃了 ' + skName + ' 的领悟', 'info');
          }
          closeModal();
        };
      });
    }, 100);
  }
}

/**
 * 强化技能（消耗领悟次数，最高+3/III）
 */
export function enhanceSkill(pet, skillIdx) {
  const maxCount = Math.floor(pet.level / 3);
  if (pet.comprehensionCount >= maxCount) { showToast('领悟次数已用完', 'info'); return false; }
  const skill = pet.skills[skillIdx];
  if (!skill) return false;
  if (skill.enhanceLevel >= 3) { showToast('已达最大强化等级', 'info'); return false; }
  pet.comprehensionCount++;
  skill.enhanceLevel++;
  showToast(SKILLS[skill.skillId].name + ' 强化至 Lv.' + (skill.enhanceLevel + 1) + '!', 'info');
  return true;
}
