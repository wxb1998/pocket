// 通用悬浮提示系统 - PC hover / 移动端长按
import { SKILLS, RUNE_SETS, RUNE_QUALITY, RUNE_SLOTS } from '../constants/index.js';

let _tooltipEl = null;

function ensureTooltip() {
  if (!_tooltipEl) {
    _tooltipEl = document.createElement('div');
    _tooltipEl.id = 'tooltip';
    _tooltipEl.className = 'game-tooltip';
    _tooltipEl.style.display = 'none';
    document.body.appendChild(_tooltipEl);
  }
  return _tooltipEl;
}

function showTooltip(html, x, y) {
  const el = ensureTooltip();
  el.innerHTML = html;
  el.style.display = 'block';

  // 自适应位置，避免溢出
  const rect = el.getBoundingClientRect();
  const maxX = window.innerWidth - rect.width - 8;
  const maxY = window.innerHeight - rect.height - 8;
  el.style.left = Math.min(x + 10, maxX) + 'px';
  el.style.top = Math.min(y + 10, maxY) + 'px';
}

function hideTooltip() {
  if (_tooltipEl) _tooltipEl.style.display = 'none';
}

/**
 * 给元素绑定tooltip
 * @param {HTMLElement} el 目标元素
 * @param {string|function} content HTML内容或返回HTML的函数
 */
export function bindTooltip(el, content) {
  let longPressTimer = null;

  const getContent = () => typeof content === 'function' ? content() : content;

  // PC: hover
  el.addEventListener('mouseenter', (e) => {
    showTooltip(getContent(), e.clientX, e.clientY);
  });
  el.addEventListener('mousemove', (e) => {
    if (_tooltipEl && _tooltipEl.style.display !== 'none') {
      const maxX = window.innerWidth - _tooltipEl.offsetWidth - 8;
      const maxY = window.innerHeight - _tooltipEl.offsetHeight - 8;
      _tooltipEl.style.left = Math.min(e.clientX + 10, maxX) + 'px';
      _tooltipEl.style.top = Math.min(e.clientY + 10, maxY) + 'px';
    }
  });
  el.addEventListener('mouseleave', hideTooltip);

  // 移动端: 长按
  el.addEventListener('touchstart', (e) => {
    longPressTimer = setTimeout(() => {
      const touch = e.touches[0];
      showTooltip(getContent(), touch.clientX, touch.clientY);
    }, 400);
  });
  el.addEventListener('touchend', () => { clearTimeout(longPressTimer); hideTooltip(); });
  el.addEventListener('touchmove', () => { clearTimeout(longPressTimer); hideTooltip(); });
}

/**
 * 生成技能tooltip HTML
 */
export function skillTooltipHTML(skillId) {
  const s = SKILLS[skillId];
  if (!s) return '<p>未知技能</p>';
  return '<div class="tip-title">' + s.name + '</div>'
    + '<div class="tip-row">威力: ' + (s.power || '-') + '</div>'
    + '<div class="tip-row">元素: ' + (s.elem || '普通') + '</div>'
    + '<div class="tip-row">冷却: ' + (s.cooldown || 0) + '回合</div>'
    + '<div class="tip-row">类型: ' + (s.type === 'self' ? '辅助' : s.type === 'aoe' ? '群攻' : '单体') + '</div>'
    + (s.effect ? '<div class="tip-desc">' + describeEffect(s.effect) + '</div>' : '');
}

function describeEffect(eff) {
  const map = {
    defUp: '提升防御3回合', defUp2: '大幅提升防御4回合',
    heal25: '回复25%最大HP', heal40: '回复40%最大HP',
    healAll30: '全队回复30%HP', regen: '持续回复4回合',
    debuffDef: '降低目标防御'
  };
  return map[eff] || eff;
}

/**
 * 生成符文tooltip HTML
 */
export function runeTooltipHTML(rune) {
  if (!rune) return '';
  const set = RUNE_SETS[rune.setId];
  const qual = RUNE_QUALITY[rune.quality];
  const slot = RUNE_SLOTS[rune.slotType];

  let html = '<div class="tip-title" style="color:' + qual.color + ';">' + (set ? set.icon + set.name : '') + ' · ' + slot.name + ' +' + rune.level + '</div>';
  html += '<div class="tip-row">品质: ' + qual.name + '</div>';
  html += '<div class="tip-row">主属性: ' + slot.mainLabel + '+' + rune.mainValue + '</div>';
  rune.subs.forEach(s => { html += '<div class="tip-row" style="color:#aaa;">  ' + s.name + '+' + s.value + '</div>'; });

  if (set) {
    html += '<hr style="border-color:#444;margin:4px 0;">';
    if (set[2]) html += '<div class="tip-row" style="color:' + set.color + ';">2件: ' + set[2].desc + '</div>';
    if (set[4]) html += '<div class="tip-row" style="color:' + set.color + ';">4件: ' + set[4].desc + '</div>';
  }
  return html;
}
