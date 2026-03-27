// 像素精灵系统 - 开罗风12x12像素画 + 自动描边 + 2帧待机动画
// 每个物种用12x12矩阵定义，按元素配色，自动生成1px黑边轮廓

const ELEM_COLORS = {
  normal:  { pri:'#c8b88a', sec:'#a0926a', eye:'#333',    hi:'#e8dcc8', out:'#6b6040' },
  fire:    { pri:'#e53935', sec:'#ff7043', eye:'#fff3e0', hi:'#ffab91', out:'#8b1a1a' },
  water:   { pri:'#1e88e5', sec:'#42a5f5', eye:'#e3f2fd', hi:'#90caf9', out:'#0d47a1' },
  earth:   { pri:'#8d6e63', sec:'#a1887f', eye:'#d7ccc8', hi:'#bcaaa4', out:'#4e342e' },
  wind:    { pri:'#43a047', sec:'#66bb6a', eye:'#e8f5e9', hi:'#a5d6a7', out:'#1b5e20' },
  thunder: { pri:'#f9a825', sec:'#fdd835', eye:'#333',    hi:'#fff176', out:'#a16800' },
  ice:     { pri:'#4fc3f7', sec:'#81d4fa', eye:'#e1f5fe', hi:'#b3e5fc', out:'#0277bd' },
  dark:    { pri:'#5c3d8f', sec:'#7e57c2', eye:'#e94560', hi:'#b39ddb', out:'#2a1650' },
  light:   { pri:'#ffd54f', sec:'#ffe082', eye:'#5d4037', hi:'#fff9c4', out:'#a68500' },
  poison:  { pri:'#7cb342', sec:'#9ccc65', eye:'#f1f8e9', hi:'#c5e1a5', out:'#3a5e00' },
  metal:   { pri:'#78909c', sec:'#90a4ae', eye:'#eceff1', hi:'#cfd8dc', out:'#37474f' },
  ghost:   { pri:'#7e57c2', sec:'#b39ddb', eye:'#e94560', hi:'#d1c4e9', out:'#3a1f7a' },
  dragon:  { pri:'#d32f2f', sec:'#ff6f00', eye:'#ffeb3b', hi:'#ff8a65', out:'#7a1010' }
};

// 物种 → 体型 + 元素
const SPRITE_DEFS = {
  hundun:     { type:'blob',    elem:'normal'  },
  dangkang:   { type:'quad',    elem:'earth'   },
  jiao:       { type:'quad',    elem:'normal'  },
  bifang:     { type:'bird',    elem:'fire'    },
  zhulong:    { type:'serpent', elem:'dragon'  },
  luwu:       { type:'quad',    elem:'dark'    },
  luoyu:      { type:'fish',    elem:'water'   },
  wenyao:     { type:'fish',    elem:'water'   },
  xiangliu:   { type:'serpent', elem:'poison'  },
  danghu:     { type:'bird',    elem:'wind'    },
  goumang:    { type:'biped',   elem:'wind'    },
  bo:         { type:'quad',    elem:'normal'  },
  yayu:       { type:'fish',    elem:'ice'     },
  hanhao:     { type:'bird',    elem:'wind'    },
  kui:        { type:'quad',    elem:'thunder' },
  leishen:    { type:'biped',   elem:'thunder' },
  yueyu:      { type:'quad',    elem:'earth'   },
  xingtian:   { type:'biped',   elem:'earth'   },
  xiushe:     { type:'serpent', elem:'poison'  },
  gudiao:     { type:'bird',    elem:'dark'    },
  wangliang:  { type:'biped',   elem:'ghost'   },
  qiongqi:    { type:'quad',    elem:'dark'    },
  taotie:     { type:'blob',    elem:'dark'    },
  baize:      { type:'quad',    elem:'light'   },
  yingzhao:   { type:'quad',    elem:'light'   },
  yinglong:   { type:'serpent', elem:'dragon'  },
  zhuyinlong: { type:'serpent', elem:'dark'    },
  chilong:    { type:'serpent', elem:'water'   },
  kunpeng:    { type:'bird',    elem:'water'   },
  jingwei:    { type:'bird',    elem:'normal'  },
  chiyou:     { type:'biped',   elem:'metal'   },
  jiuying:    { type:'serpent', elem:'water'   }
};

// 12×12 像素模板 (0=透明 1=主色 2=副色 3=眼睛 4=高光)
const BODY_TEMPLATES = {
  quad: [
    [0,0,0,1,1,0,0,0,0,0,0,0],
    [0,0,1,1,1,1,0,0,0,0,0,0],
    [0,0,1,3,1,1,0,0,0,0,0,0],
    [0,0,1,1,2,1,1,0,0,0,0,0],
    [0,0,0,1,1,1,1,1,1,1,0,0],
    [0,0,1,1,1,1,1,1,1,1,0,0],
    [0,0,2,1,1,1,1,1,1,2,0,0],
    [0,0,1,1,1,1,1,1,1,1,0,0],
    [0,0,0,1,1,0,0,1,1,0,0,0],
    [0,0,0,1,1,0,0,1,1,0,0,0],
    [0,0,0,1,0,0,0,0,1,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0]
  ],
  bird: [
    [0,0,0,0,4,4,0,0,0,0,0,0],
    [0,0,0,0,1,1,0,0,0,0,0,0],
    [0,0,0,1,1,1,1,0,0,0,0,0],
    [0,0,0,1,3,3,1,0,0,0,0,0],
    [0,0,0,0,1,2,0,0,0,0,0,0],
    [0,1,1,1,1,1,1,1,1,0,0,0],
    [1,4,1,1,1,1,1,1,4,1,0,0],
    [0,1,2,1,1,1,1,2,1,0,0,0],
    [0,0,0,1,1,1,1,0,0,0,0,0],
    [0,0,0,0,2,2,0,0,0,0,0,0],
    [0,0,0,1,0,0,1,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0]
  ],
  serpent: [
    [0,0,1,1,1,0,0,0,0,0,0,0],
    [0,1,1,3,1,1,0,0,0,0,0,0],
    [0,1,1,1,4,1,0,0,0,0,0,0],
    [0,0,1,1,1,0,0,0,0,0,0,0],
    [0,0,0,1,1,1,0,0,0,0,0,0],
    [0,0,0,0,2,1,1,0,0,0,0,0],
    [0,0,0,0,0,1,1,1,0,0,0,0],
    [0,0,0,0,1,1,2,0,0,0,0,0],
    [0,0,0,1,1,1,0,0,0,0,0,0],
    [0,0,1,2,1,0,0,0,0,0,0,0],
    [0,0,1,1,0,0,0,0,0,0,0,0],
    [0,0,0,2,0,0,0,0,0,0,0,0]
  ],
  biped: [
    [0,0,0,1,1,1,0,0,0,0,0,0],
    [0,0,1,1,1,1,1,0,0,0,0,0],
    [0,0,1,3,1,3,1,0,0,0,0,0],
    [0,0,1,1,2,1,1,0,0,0,0,0],
    [0,0,0,0,1,0,0,0,0,0,0,0],
    [0,0,1,1,1,1,1,0,0,0,0,0],
    [0,1,4,1,1,1,4,1,0,0,0,0],
    [0,0,0,1,1,1,0,0,0,0,0,0],
    [0,0,0,1,2,1,0,0,0,0,0,0],
    [0,0,0,1,0,1,0,0,0,0,0,0],
    [0,0,0,1,0,1,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0]
  ],
  blob: [
    [0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,1,1,1,1,0,0,0,0,0],
    [0,0,1,1,1,1,1,1,0,0,0,0],
    [0,1,1,1,1,1,1,1,1,0,0,0],
    [0,1,1,3,1,1,3,1,1,0,0,0],
    [0,1,1,1,1,1,1,1,1,0,0,0],
    [0,1,1,1,2,2,1,1,1,0,0,0],
    [0,1,2,1,1,1,1,2,1,0,0,0],
    [0,0,1,1,1,1,1,1,0,0,0,0],
    [0,0,0,2,1,1,2,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0]
  ],
  fish: [
    [0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,1,1,1,0,0,0,0],
    [0,0,0,0,1,1,1,1,1,0,0,0],
    [1,1,0,1,1,1,3,1,1,1,0,0],
    [1,2,1,1,1,1,1,1,1,1,4,0],
    [1,1,0,1,1,1,1,1,1,1,0,0],
    [0,0,0,0,1,2,1,1,1,0,0,0],
    [0,0,0,0,0,1,1,1,0,0,0,0],
    [0,0,0,0,0,0,2,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0]
  ]
};

// 第2帧偏移（待机动画）
const FRAME2_OFFSET = {
  quad:    { dy:-1 },
  bird:    { dy:-2 },
  serpent: { dx:1 },
  biped:   { dy:-1 },
  blob:    { dy:1 },
  fish:    { dx:1, dy:-1 }
};

const _spriteCache = {};
const GRID = 12;
const SCALE = 5;       // 12×5 = 60px
const PAD = 1;          // 1px outline padding
const CANVAS_SIZE = (GRID + PAD * 2) * SCALE; // 70px

export function getSprite(speciesId) {
  if (_spriteCache[speciesId]) return _spriteCache[speciesId];
  const def = SPRITE_DEFS[speciesId];
  if (!def) return getSprite('hundun');

  const colors = ELEM_COLORS[def.elem] || ELEM_COLORS.normal;
  const template = BODY_TEMPLATES[def.type] || BODY_TEMPLATES.blob;
  const colorMap = { 1:colors.pri, 2:colors.sec, 3:colors.eye, 4:colors.hi };

  const frame1 = renderFrame(template, colorMap, colors.out, 0, 0);
  const off = FRAME2_OFFSET[def.type] || { dy:-1 };
  const frame2 = renderFrame(template, colorMap, colors.out, off.dx||0, off.dy||0);

  _spriteCache[speciesId] = { frame1, frame2 };
  return _spriteCache[speciesId];
}

function renderFrame(template, colorMap, outlineColor, dx, dy) {
  const canvas = document.createElement('canvas');
  canvas.width = CANVAS_SIZE;
  canvas.height = CANVAS_SIZE;
  const ctx = canvas.getContext('2d');

  // 先收集哪些格子有像素（用于描边）
  const filled = [];
  for (let y = 0; y < GRID; y++) {
    filled[y] = [];
    for (let x = 0; x < GRID; x++) {
      filled[y][x] = (template[y] && template[y][x]) ? template[y][x] : 0;
    }
  }

  // 第1层：描边（在有色像素的四周画深色轮廓）
  for (let y = 0; y < GRID; y++) {
    for (let x = 0; x < GRID; x++) {
      if (filled[y][x] !== 0) continue;
      // 检查上下左右是否有像素
      const hasNeighbor =
        (y > 0 && filled[y-1][x] !== 0) ||
        (y < GRID-1 && filled[y+1][x] !== 0) ||
        (x > 0 && filled[y][x-1] !== 0) ||
        (x < GRID-1 && filled[y][x+1] !== 0);
      if (hasNeighbor) {
        const px = (x + PAD + (dx||0)) * SCALE;
        const py = (y + PAD + (dy||0)) * SCALE;
        ctx.fillStyle = outlineColor;
        ctx.fillRect(px, py, SCALE, SCALE);
      }
    }
  }

  // 第2层：实际像素
  for (let y = 0; y < GRID; y++) {
    for (let x = 0; x < GRID; x++) {
      const val = filled[y][x];
      if (val === 0) continue;
      const px = (x + PAD + (dx||0)) * SCALE;
      const py = (y + PAD + (dy||0)) * SCALE;
      ctx.fillStyle = colorMap[val] || '#fff';
      ctx.fillRect(px, py, SCALE, SCALE);
    }
  }

  return canvas.toDataURL('image/png');
}

/**
 * 创建带动画的精灵元素
 * @param {string} speciesId
 * @param {number} [size=60] 显示尺寸
 * @param {boolean} [flip=false] 水平翻转
 */
export function createSpriteElement(speciesId, size, flip) {
  size = size || CANVAS_SIZE;
  const sprite = getSprite(speciesId);

  const container = document.createElement('div');
  container.className = 'sprite-container';
  container.style.width = size + 'px';
  container.style.height = size + 'px';
  if (flip) container.style.transform = 'scaleX(-1)';

  const img = document.createElement('img');
  img.src = sprite.frame1;
  img.width = size;
  img.height = size;
  img.className = 'sprite-img';
  img.dataset.frame1 = sprite.frame1;
  img.dataset.frame2 = sprite.frame2;

  container.appendChild(img);
  return container;
}

// 全局动画循环
let _animFrame = 0;
setInterval(() => {
  _animFrame = 1 - _animFrame;
  document.querySelectorAll('.sprite-img').forEach(img => {
    img.src = _animFrame === 0 ? img.dataset.frame1 : img.dataset.frame2;
  });
}, 500);

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
  setTimeout(() => num.remove(), 900);
}
