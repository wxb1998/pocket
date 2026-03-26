// 通用工具函数
import { gameState } from './state.js';

export function randInt(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }
export function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
export function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

export function weightedPick(weights) {
  let total = 0;
  for (const k in weights) total += weights[k];
  let r = Math.random() * total;
  for (const k in weights) { r -= weights[k]; if (r <= 0) return k; }
  return Object.keys(weights)[0];
}

// ===== Toast 通知 =====
export function showToast(msg, type) {
  const c = document.getElementById('toast-container');
  if (!c) return;
  const colors = { dmg:'#f44336', heal:'#4caf50', capture:'#e94560', loot:'#ffd700', info:'#2196f3' };
  const t = document.createElement('div');
  t.className = 'toast';
  t.style.borderLeft = '3px solid ' + (colors[type] || '#888');
  t.textContent = msg;
  c.appendChild(t);
  setTimeout(() => { if (t.parentNode) t.parentNode.removeChild(t); }, 3000);
}

// ===== 模态框 =====
export function showModal(title, contentHTML, buttons) {
  const root = document.getElementById('modal-root');
  if (!root) return;
  root.innerHTML = '';
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  const box = document.createElement('div');
  box.className = 'modal-box';
  box.innerHTML = '<h3>' + title + '</h3>' + contentHTML;
  if (buttons) {
    const btnRow = document.createElement('div');
    btnRow.style.cssText = 'display:flex;gap:8px;margin-top:12px;justify-content:flex-end;';
    buttons.forEach(b => {
      const btn = document.createElement('button');
      btn.className = 'modal-btn ' + (b.primary ? 'modal-btn-primary' : 'modal-btn-secondary');
      btn.textContent = b.text;
      btn.onclick = () => { root.innerHTML = ''; if (b.action) b.action(); };
      btnRow.appendChild(btn);
    });
    box.appendChild(btnRow);
  }
  overlay.appendChild(box);
  overlay.onclick = (e) => { if (e.target === overlay) root.innerHTML = ''; };
  root.appendChild(overlay);
}

export function closeModal() {
  const root = document.getElementById('modal-root');
  if (root) root.innerHTML = '';
}

// ===== 战斗日志 =====
export function addLog(msg, cls) {
  gameState.battleLog.push({ msg, cls: cls || '' });
  if (gameState.battleLog.length > 100) gameState.battleLog.shift();
}
