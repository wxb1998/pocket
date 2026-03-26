// 宝物系统：生成、强化、装备、合成
import { QUALITY_ORDER, QUALITY_NAMES, QUALITY_AFFIX_COUNT, AFFIX_POOL, PASSIVE_POOL } from '../constants/index.js';
import { gameState, counters } from '../state.js';
import { randInt, pick, showToast } from '../utils.js';
import { calcAllStats } from './pet.js';

export function generateTreasure(quality) {
  const numAffixes = QUALITY_AFFIX_COUNT[quality] || 1;
  const affixes = [];
  const usedIds = {};
  for (let i = 0; i < numAffixes; i++) {
    const candidates = AFFIX_POOL.filter(a => !usedIds[a.id]);
    if (candidates.length === 0) break;
    const af = pick(candidates);
    usedIds[af.id] = true;
    affixes.push({ id: af.id, name: af.name, value: randInt(af.min, af.max), suffix: af.suffix });
  }

  let passive = null;
  if ((quality === 'purple' && Math.random() < 0.4) || (quality === 'gold' && Math.random() < 0.7)) {
    passive = pick(PASSIVE_POOL).id;
  }

  const names = ['灵玉','法珠','仙符','神器','古印','天书','玄铁','龙鳞','凤羽','瑶光'];
  return {
    id: counters.treasureId++,
    name: pick(names),
    quality,
    affixes,
    passive,
    enhanceLevel: 0,
    equippedTo: null
  };
}

export function enhanceTreasure(treasureId) {
  const tr = gameState.treasures.find(t => t.id === treasureId);
  if (!tr || tr.enhanceLevel >= 10) { showToast('已达最大强化等级', 'info'); return; }

  const cost = tr.enhanceLevel < 5 ? 1 : 2;
  const matKey = tr.enhanceLevel < 5 ? 'enhance_stone' : 'rare_enhance';
  if (gameState.materials[matKey] < cost) { showToast('强化材料不足', 'info'); return; }

  gameState.materials[matKey] -= cost;
  const rate = 1.0 - tr.enhanceLevel * 0.08;

  if (Math.random() < rate) {
    tr.enhanceLevel++;
    tr.affixes.forEach(af => af.value = Math.floor(af.value * 1.08));
    showToast('强化成功! +' + tr.enhanceLevel, 'info');
  } else {
    showToast('强化失败...', 'info');
  }

  if (tr.equippedTo) {
    const pet = gameState.pets.find(p => p.id === tr.equippedTo);
    if (pet) calcAllStats(pet);
  }
}

export function equipTreasure(treasureId, petId) {
  const tr = gameState.treasures.find(t => t.id === treasureId);
  const pet = gameState.pets.find(p => p.id === petId);
  if (!tr || !pet) return;

  if (pet.treasure) { pet.treasure.equippedTo = null; pet.treasure = null; }
  if (tr.equippedTo) {
    const prev = gameState.pets.find(p => p.id === tr.equippedTo);
    if (prev) prev.treasure = null;
  }

  tr.equippedTo = petId;
  pet.treasure = tr;
  calcAllStats(pet);
  showToast(pet.name + ' 装备了 ' + tr.name, 'info');
}

export function unequipTreasure(treasureId) {
  const tr = gameState.treasures.find(t => t.id === treasureId);
  if (!tr || !tr.equippedTo) return;
  const pet = gameState.pets.find(p => p.id === tr.equippedTo);
  if (pet) { pet.treasure = null; calcAllStats(pet); }
  tr.equippedTo = null;
  showToast('已卸下宝物', 'info');
}

export function craftTreasure(ids) {
  if (ids.length !== 3) return;
  const treasures = ids.map(id => gameState.treasures.find(t => t.id === id));
  if (treasures.some(t => !t)) return;
  const quality = treasures[0].quality;
  if (!treasures.every(t => t.quality === quality)) { showToast('合成需要三个相同品质的宝物', 'info'); return; }
  const qIdx = QUALITY_ORDER.indexOf(quality);
  if (qIdx >= QUALITY_ORDER.length - 1) { showToast('金色品质无法继续合成', 'info'); return; }

  treasures.forEach(t => {
    if (t.equippedTo) {
      const pet = gameState.pets.find(p => p.id === t.equippedTo);
      if (pet) pet.treasure = null;
    }
  });
  gameState.treasures = gameState.treasures.filter(t => !ids.includes(t.id));

  const newQuality = QUALITY_ORDER[qIdx + 1];
  const newTr = generateTreasure(newQuality);
  gameState.treasures.push(newTr);
  showToast('合成成功! 获得 ' + QUALITY_NAMES[newQuality] + ' ' + newTr.name, 'loot');
}
