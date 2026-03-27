// 地图探索界面 - 展示各区域活力状态，选择刷怪区域
import { ZONES, SPECIES } from '../constants/index.js';
import { gameState } from '../state.js';
import { getVigorInfo, getVigorMultiplier } from '../systems/explore.js';
import { spawnEnemies } from '../systems/battle.js';
import { showToast } from '../utils.js';

// 活力条颜色
function vigorColor(ratio) {
  if (ratio > 0.6) return '#4caf50';
  if (ratio > 0.3) return '#ff9800';
  return '#f44336';
}

// 活力状态文字
function vigorStatusText(ratio) {
  if (ratio > 0.8) return '充沛';
  if (ratio > 0.5) return '正常';
  if (ratio > 0.3) return '不足';
  if (ratio > 0) return '匮乏';
  return '耗尽';
}

// 收益倍率显示
function rewardMultText(mult) {
  if (mult >= 1.0) return '';
  return '<span style="color:#f44336;font-size:11px;">收益 ×' + mult.toFixed(1) + '</span>';
}

// 计算剩余可战斗次数
function remainBattles(zoneIdx) {
  const zone = ZONES[zoneIdx];
  const info = getVigorInfo(zoneIdx);
  if (zone.vigorCost <= 0) return 999;
  return Math.floor(info.current / zone.vigorCost);
}

// 格式化恢复时间
function formatRegenTime(zoneIdx) {
  const zone = ZONES[zoneIdx];
  const info = getVigorInfo(zoneIdx);
  if (info.current >= info.max) return '已满';
  const missing = info.max - info.current;
  const hoursToFull = missing / zone.vigorRegen;
  if (hoursToFull < 1) return Math.ceil(hoursToFull * 60) + '分钟恢复满';
  return hoursToFull.toFixed(1) + '小时恢复满';
}

/**
 * 选择区域（切换刷怪地点）
 */
window._selectMapZone = function(idx) {
  const zone = ZONES[idx];
  if (!zone) return;
  if (gameState.advLv < zone.unlockLv) {
    showToast('需要冒险等级 Lv.' + zone.unlockLv + ' 解锁!', 'error');
    return;
  }
  gameState.currentZone = idx;
  gameState.enemies = spawnEnemies();
  showToast('前往 ' + zone.name + '!', 'info');
  renderMap();
};

/**
 * 渲染地图界面
 */
export function renderMap() {
  const el = document.getElementById('map-list');
  if (!el) return;

  let html = '<div class="map-header">';
  html += '<h3 style="color:#e94560;margin-bottom:8px;">🗺️ 山海图 · 探索地图</h3>';
  html += '<p style="color:#888;font-size:12px;margin-bottom:12px;">每个区域有独立活力值，活力耗尽后收益大幅下降。切换区域让活力恢复！</p>';
  html += '</div>';

  html += '<div class="map-grid">';
  ZONES.forEach((zone, idx) => {
    const unlocked = gameState.advLv >= zone.unlockLv;
    const isCurrent = gameState.currentZone === idx;
    const info = getVigorInfo(idx);
    const mult = getVigorMultiplier(idx);
    const battles = remainBattles(idx);
    const statusText = vigorStatusText(info.ratio);
    const color = vigorColor(info.ratio);

    // 区域内宠物列表
    const speciesNames = zone.species.slice(0, 4).map(sid => {
      const sp = SPECIES[sid];
      return sp ? sp.name : sid;
    }).join('、');

    html += '<div class="map-zone-card' + (isCurrent ? ' active' : '') + (unlocked ? '' : ' locked') + '"';
    html += ' onclick="window._selectMapZone(' + idx + ')">';

    // 顶部：图标+名字+等级
    html += '<div class="map-zone-top">';
    html += '<span class="map-zone-icon">' + (zone.icon || '📍') + '</span>';
    html += '<div class="map-zone-title">';
    html += '<span class="map-zone-name">' + zone.name + '</span>';
    html += '<span class="map-zone-lv">Lv.' + zone.lvRange[0] + '-' + zone.lvRange[1] + '</span>';
    html += '</div>';
    if (isCurrent) html += '<span class="map-zone-badge">当前</span>';
    html += '</div>';

    // 描述
    html += '<div class="map-zone-desc">' + zone.desc + '</div>';

    if (unlocked) {
      // 活力条
      html += '<div class="map-vigor-bar">';
      html += '<div class="map-vigor-fill" style="width:' + Math.max(0, info.ratio * 100) + '%;background:' + color + ';"></div>';
      html += '</div>';
      html += '<div class="map-vigor-info">';
      html += '<span style="color:' + color + ';">' + statusText + ' ' + info.current + '/' + info.max + '</span>';
      html += '<span style="color:#888;">可战' + battles + '次</span>';
      html += '</div>';

      // 收益倍率
      const multHtml = rewardMultText(mult);
      if (multHtml) html += '<div style="margin-top:2px;">' + multHtml + '</div>';

      // 恢复时间
      html += '<div class="map-regen-info">' + formatRegenTime(idx) + '</div>';

      // 出没宠物
      html += '<div class="map-species">';
      html += '<span style="color:#aaa;font-size:11px;">出没: </span>';
      html += '<span style="color:#ddd;font-size:11px;">' + speciesNames + '...</span>';
      html += '</div>';

      // 元素特色
      if (zone.elemFocus && zone.elemFocus.length > 0) {
        const elemNames = { fire:'火', water:'水', grass:'草', thunder:'雷', ice:'冰', wind:'风', earth:'地', dark:'暗', holy:'光', normal:'普通' };
        const elemTags = zone.elemFocus.map(e => elemNames[e] || e).join(' ');
        html += '<div class="map-elem-tags">';
        html += '<span style="color:#aaa;font-size:10px;">元素: </span>';
        html += '<span style="color:#ff9800;font-size:10px;">' + elemTags + '</span>';
        html += '</div>';
      }
    } else {
      html += '<div class="map-locked-info">🔒 冒险等级 Lv.' + zone.unlockLv + ' 解锁</div>';
    }

    html += '</div>';
  });
  html += '</div>';

  el.innerHTML = html;
}

// 定时刷新地图活力显示（每30秒）
let _mapRefreshTimer = null;
export function startMapRefresh() {
  if (_mapRefreshTimer) clearInterval(_mapRefreshTimer);
  _mapRefreshTimer = setInterval(() => {
    const mapPanel = document.getElementById('panel-explore');
    if (mapPanel && mapPanel.classList.contains('active')) {
      renderMap();
    }
  }, 30000);
}
