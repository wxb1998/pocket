// 像素精灵系统 - 开罗风32x32像素画，2帧待机动画
// 每个物种用紧凑格式定义像素矩阵，按元素配色

const ELEM_COLORS = {
  normal: { pri: '#c8b88a', sec: '#a0926a', eye: '#333', bg: '#e8dcc8' },
  fire:   { pri: '#e53935', sec: '#ff7043', eye: '#fff3e0', bg: '#ff8a65' },
  water:  { pri: '#1e88e5', sec: '#42a5f5', eye: '#e3f2fd', bg: '#64b5f6' },
  earth:  { pri: '#6d4c41', sec: '#8d6e63', eye: '#d7ccc8', bg: '#a1887f' },
  wind:   { pri: '#43a047', sec: '#66bb6a', eye: '#e8f5e9', bg: '#81c784' },
  thunder:{ pri: '#fdd835', sec: '#ffee58', eye: '#333', bg: '#fff176' },
  ice:    { pri: '#4fc3f7', sec: '#81d4fa', eye: '#e1f5fe', bg: '#b3e5fc' },
  dark:   { pri: '#5c3d8f', sec: '#7e57c2', eye: '#e94560', bg: '#9575cd' },
  light:  { pri: '#ffd54f', sec: '#ffe082', eye: '#fff8e1', bg: '#fff9c4' },
  poison: { pri: '#7cb342', sec: '#9ccc65', eye: '#f1f8e9', bg: '#aed581' },
  metal:  { pri: '#78909c', sec: '#90a4ae', eye: '#eceff1', bg: '#b0bec5' },
  ghost:  { pri: '#7e57c2', sec: '#b39ddb', eye: '#e94560', bg: '#d1c4e9' },
  dragon: { pri: '#f44336', sec: '#ff9800', eye: '#ffeb3b', bg: '#ff7043' }
};

// 物种精灵定义: type=体型, features=特征修饰
const SPRITE_DEFS = {
  hundun:     { type: 'blob',    elem: 'normal',  feat: 'round' },
  dangkang:   { type: 'quad',    elem: 'earth',   feat: 'tusks' },
  jiao:       { type: 'quad',    elem: 'normal',  feat: 'ears' },
  bifang:     { type: 'bird',    elem: 'fire',    feat: 'flame' },
  zhulong:    { type: 'serpent', elem: 'dragon',  feat: 'horns' },
  luwu:       { type: 'quad',    elem: 'dark',    feat: 'stripes' },
  luoyu:      { type: 'fish',    elem: 'water',   feat: 'fins' },
  wenyao:     { type: 'fish',    elem: 'water',   feat: 'whisker' },
  xiangliu:   { type: 'serpent', elem: 'poison',  feat: 'multihead' },
  danghu:     { type: 'bird',    elem: 'wind',    feat: 'crest' },
  goumang:    { type: 'biped',   elem: 'wind',    feat: 'leaves' },
  bo:         { type: 'quad',    elem: 'normal',  feat: 'mane' },
  yayu:       { type: 'fish',    elem: 'ice',     feat: 'spikes' },
  hanhao:     { type: 'bird',    elem: 'wind',    feat: 'eagle' },
  kui:        { type: 'quad',    elem: 'thunder', feat: 'oneleg' },
  leishen:    { type: 'biped',   elem: 'thunder', feat: 'drums' },
  yueyu:      { type: 'quad',    elem: 'earth',   feat: 'rocky' },
  xingtian:   { type: 'biped',   elem: 'earth',   feat: 'headless' },
  xiushe:     { type: 'serpent', elem: 'poison',  feat: 'long' },
  gudiao:     { type: 'bird',    elem: 'dark',    feat: 'bat' },
  wangliang:  { type: 'biped',   elem: 'ghost',   feat: 'ghost' },
  qiongqi:    { type: 'quad',    elem: 'dark',    feat: 'wings' },
  taotie:     { type: 'blob',    elem: 'dark',    feat: 'mouth' },
  baize:      { type: 'quad',    elem: 'light',   feat: 'wise' },
  yingzhao:   { type: 'quad',    elem: 'light',   feat: 'horn' },
  yinglong:   { type: 'serpent', elem: 'dragon',  feat: 'wingdragon' },
  zhuyinlong: { type: 'serpent', elem: 'dark',    feat: 'shadow' },
  chilong:    { type: 'serpent', elem: 'water',   feat: 'aqua' },
  kunpeng:    { type: 'bird',    elem: 'water',   feat: 'giant' },
  jingwei:    { type: 'bird',    elem: 'normal',  feat: 'small' },
  chiyou:     { type: 'biped',   elem: 'metal',   feat: 'armor' },
  jiuying:    { type: 'serpent', elem: 'water',   feat: 'multihead' }
};

// 体型模板 - 8x8简化像素矩阵 (0=透明, 1=主色, 2=副色, 3=眼睛, 4=背景/高光)
const BODY_TEMPLATES = {
  quad: [  // 四足兽
    [0,0,1,1,0,0,0,0],
    [0,1,3,1,1,0,0,0],
    [0,1,1,1,1,1,0,0],
    [0,2,1,1,1,2,2,0],
    [0,2,2,2,2,2,0,0],
    [0,1,0,1,0,1,0,0],
    [0,1,0,1,0,1,0,0],
    [0,0,0,0,0,0,0,0]
  ],
  bird: [  // 飞禽
    [0,0,0,1,1,0,0,0],
    [0,0,1,3,1,0,0,0],
    [0,2,1,1,1,2,0,0],
    [2,2,1,1,1,2,2,0],
    [0,0,1,1,1,0,0,0],
    [0,0,0,2,0,0,0,0],
    [0,0,1,0,1,0,0,0],
    [0,0,0,0,0,0,0,0]
  ],
  serpent: [  // 蛇龙
    [0,0,1,1,0,0,0,0],
    [0,1,3,3,1,0,0,0],
    [0,0,1,1,0,0,0,0],
    [0,0,2,1,1,0,0,0],
    [0,0,0,2,1,1,0,0],
    [0,0,0,0,2,1,1,0],
    [0,0,0,0,0,2,2,0],
    [0,0,0,0,0,0,0,0]
  ],
  biped: [  // 两足人形
    [0,0,1,1,1,0,0,0],
    [0,0,1,3,1,0,0,0],
    [0,0,0,1,0,0,0,0],
    [0,0,2,1,2,0,0,0],
    [0,0,0,1,0,0,0,0],
    [0,0,0,2,0,0,0,0],
    [0,0,1,0,1,0,0,0],
    [0,0,0,0,0,0,0,0]
  ],
  blob: [  // 团状
    [0,0,0,0,0,0,0,0],
    [0,0,1,1,1,0,0,0],
    [0,1,1,1,1,1,0,0],
    [0,1,3,1,3,1,0,0],
    [0,1,1,2,1,1,0,0],
    [0,2,1,1,1,2,0,0],
    [0,0,2,2,2,0,0,0],
    [0,0,0,0,0,0,0,0]
  ],
  fish: [  // 鱼
    [0,0,0,0,0,0,0,0],
    [0,0,0,1,1,0,0,0],
    [0,0,1,1,1,1,0,0],
    [2,0,1,3,1,1,1,0],
    [2,0,1,1,1,1,1,0],
    [0,0,1,1,1,1,0,0],
    [0,0,0,2,2,0,0,0],
    [0,0,0,0,0,0,0,0]
  ]
};

// 第二帧微调（待机动画）
const FRAME2_OFFSET = {
  quad:    { dy: -1 },  // 上跳1px
  bird:    { dy: -2 },  // 上飞2px
  serpent: { dx: 1 },   // 右移1px
  biped:   { dy: -1 },
  blob:    { sy: 1 },   // 纵向拉伸1px (呼吸)
  fish:    { dx: 1, dy: -1 }
};

// 精灵缓存
const _spriteCache = {};

/**
 * 生成精灵canvas并缓存
 * @returns {{ frame1: string, frame2: string }} data URLs
 */
export function getSprite(speciesId) {
  if (_spriteCache[speciesId]) return _spriteCache[speciesId];

  const def = SPRITE_DEFS[speciesId];
  if (!def) {
    // fallback: 默认blob
    return getSprite('hundun');
  }

  const colors = ELEM_COLORS[def.elem] || ELEM_COLORS.normal;
  const template = BODY_TEMPLATES[def.type] || BODY_TEMPLATES.blob;
  const colorMap = { 1: colors.pri, 2: colors.sec, 3: colors.eye, 4: colors.bg };

  const frame1 = renderFrame(template, colorMap, 0, 0);
  const offset = FRAME2_OFFSET[def.type] || { dy: -1 };
  const frame2 = renderFrame(template, colorMap, offset.dx || 0, offset.dy || 0);

  _spriteCache[speciesId] = { frame1, frame2 };
  return _spriteCache[speciesId];
}

function renderFrame(template, colorMap, dx, dy) {
  const scale = 4; // 8x8 -> 32x32
  const size = 8 * scale;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const val = template[y] ? template[y][x] : 0;
      if (val === 0) continue;
      ctx.fillStyle = colorMap[val] || '#fff';
      ctx.fillRect((x + (dx || 0)) * scale, (y + (dy || 0)) * scale, scale, scale);
    }
  }

  return canvas.toDataURL('image/png');
}

/**
 * 创建带动画的精灵img元素
 * @param {string} speciesId
 * @param {number} [size=32] 显示尺寸
 * @param {boolean} [flip=false] 水平翻转（敌方朝左）
 * @returns {HTMLElement} 包含动画精灵的div
 */
export function createSpriteElement(speciesId, size, flip) {
  size = size || 32;
  const sprite = getSprite(speciesId);

  const container = document.createElement('div');
  container.className = 'sprite-container';
  container.style.width = size + 'px';
  container.style.height = size + 'px';
  container.style.position = 'relative';
  container.style.imageRendering = 'pixelated';
  if (flip) container.style.transform = 'scaleX(-1)';

  const img = document.createElement('img');
  img.src = sprite.frame1;
  img.width = size;
  img.height = size;
  img.style.imageRendering = 'pixelated';
  img.dataset.frame1 = sprite.frame1;
  img.dataset.frame2 = sprite.frame2;
  img.className = 'sprite-img';

  container.appendChild(img);
  return container;
}

// 全局动画循环 - 切换所有精灵的帧
let _animFrame = 0;
setInterval(() => {
  _animFrame = 1 - _animFrame;
  document.querySelectorAll('.sprite-img').forEach(img => {
    img.src = _animFrame === 0 ? img.dataset.frame1 : img.dataset.frame2;
  });
}, 500);

/**
 * 战斗动画：攻击冲刺
 */
export function animateAttack(attackerEl, targetEl, callback) {
  if (!attackerEl || !targetEl) { if (callback) callback(); return; }

  const aRect = attackerEl.getBoundingClientRect();
  const tRect = targetEl.getBoundingClientRect();
  const dx = tRect.left - aRect.left;
  const dy = tRect.top - aRect.top;

  attackerEl.style.transition = 'transform 0.15s ease-in';
  attackerEl.style.transform = 'translate(' + (dx * 0.6) + 'px,' + (dy * 0.3) + 'px)';
  attackerEl.style.zIndex = '10';

  setTimeout(() => {
    // 碰撞闪光
    targetEl.classList.add('hit-flash');
    setTimeout(() => targetEl.classList.remove('hit-flash'), 200);

    // 回弹
    attackerEl.style.transition = 'transform 0.2s ease-out';
    attackerEl.style.transform = '';
    attackerEl.style.zIndex = '';

    setTimeout(() => {
      attackerEl.style.transition = '';
      if (callback) callback();
    }, 200);
  }, 150);
}

/**
 * 浮动伤害数字
 */
export function showDamageNumber(targetEl, damage, isCrit, isHeal) {
  if (!targetEl) return;
  const num = document.createElement('div');
  num.className = 'damage-number' + (isCrit ? ' crit' : '') + (isHeal ? ' heal' : '');
  num.textContent = (isHeal ? '+' : '-') + damage;
  targetEl.style.position = 'relative';
  targetEl.appendChild(num);
  setTimeout(() => num.remove(), 800);
}
