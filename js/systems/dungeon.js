// 副本系统 - 符文塔，消耗体力挑战固定Boss
import { gameState } from '../state.js';
import { DUNGEON_FLOORS, STAMINA_MAX, STAMINA_REGEN_INTERVAL } from '../constants/index.js';
import { SPECIES, SKILLS } from '../constants/index.js';
import { randInt, pick, weightedPick, showToast, addLog } from '../utils.js';
import { generateRune } from './rune.js';
import { gainExp } from './pet.js';
import { getFormationPets } from '../state.js';

// ===== 体力系统 =====

export function initStamina() {
  if (gameState.stamina === undefined) {
    gameState.stamina = STAMINA_MAX;
    gameState.lastStaminaTime = Date.now();
  }
}

export function regenStamina() {
  const now = Date.now();
  const elapsed = now - (gameState.lastStaminaTime || now);
  const regenCount = Math.floor(elapsed / STAMINA_REGEN_INTERVAL);
  if (regenCount > 0) {
    gameState.stamina = Math.min(STAMINA_MAX, gameState.stamina + regenCount);
    gameState.lastStaminaTime = now - (elapsed % STAMINA_REGEN_INTERVAL);
  }
}

export function consumeStamina(cost) {
  regenStamina();
  gameState.stamina = Math.max(0, gameState.stamina - cost);
}

// ===== 创建Boss敌人 =====

export function createBoss(floor) {
  const sp = SPECIES[floor.bossSpecies];
  if (!sp) return null;

  const lv = floor.bossLevel;
  const starMult = floor.bossStars === 3 ? 2.0 : (floor.bossStars === 2 ? 1.5 : 1.2);

  const hp = Math.floor((sp.baseStats.hp + 20) * (1 + (lv - 1) * 0.06) * 8 * starMult);

  const boss = {
    speciesId: floor.bossSpecies,
    name: floor.name,
    displayName: floor.name,
    elem: sp.elem,
    level: lv,
    atk: Math.floor((sp.baseStats.atk + 20) * (1 + (lv - 1) * 0.06) * starMult * 1.3),
    def: Math.floor((sp.baseStats.def + 20) * (1 + (lv - 1) * 0.06) * starMult * 1.2),
    spd: Math.floor((sp.baseStats.spd + 15) * (1 + (lv - 1) * 0.06) * starMult),
    maxHp: hp,
    currentHp: hp,
    stars: floor.bossStars,
    isEnemy: true,
    isBoss: true,
    row: 'front',
    skills: [],
    buffDef: 0,
    regen: 0
  };

  // 分配技能
  const skillPool = sp.skillPool;
  if (skillPool.basic.length > 0) {
    boss.skills.push({ skillId: pick(skillPool.basic), enhanceLevel: 0, cooldownLeft: 0, priority: 0 });
  }
  if (lv >= 10 && skillPool.mid.length > 0) {
    boss.skills.push({ skillId: pick(skillPool.mid), enhanceLevel: 0, cooldownLeft: 0, priority: 1 });
  }
  if (lv >= 20 && skillPool.mid.length > 1) {
    const remaining = skillPool.mid.filter(s => !boss.skills.find(bs => bs.skillId === s));
    if (remaining.length > 0) boss.skills.push({ skillId: pick(remaining), enhanceLevel: 0, cooldownLeft: 0, priority: 1 });
  }
  if (lv >= 30 && skillPool.high.length > 0) {
    boss.skills.push({ skillId: pick(skillPool.high), enhanceLevel: 0, cooldownLeft: 0, priority: 2 });
  }
  // Boss技能冷却归零
  boss.skills.forEach(s => s.cooldownLeft = 0);

  return boss;
}

// ===== 副本奖励发放 =====

export function grantDungeonRewards(floorId, floor) {
  const rewards = { gold: 0, exp: 0, runes: [] };

  // 标记通关
  if (!gameState.dungeonProgress) gameState.dungeonProgress = {};
  gameState.dungeonProgress[floorId] = true;

  // 金币和经验
  rewards.gold = floor.goldReward || (floor.bossLevel * 20);
  rewards.exp = floor.expReward || (floor.bossLevel * 10);
  gameState.gold += rewards.gold;

  const allies = getFormationPets();
  allies.forEach(fp => gainExp(fp.pet, rewards.exp));

  // 掉落符文（1-2个）
  const dropCount = Math.random() < 0.3 ? 2 : 1;
  for (let d = 0; d < dropCount; d++) {
    const quality = weightedPick(floor.runeDropQuality);
    const setId = pick(floor.runeDropSets);
    const slotType = randInt(0, 5);
    const rune = generateRune(slotType, setId, quality);
    if (rune) {
      gameState.runes.push(rune);
      rewards.runes.push(rune);
    }
  }

  return rewards;
}

// ===== 同步挑战（保留兼容） =====

export function challengeFloor(floorId) {
  const floor = DUNGEON_FLOORS[floorId];
  if (!floor) return { success: false, log: ['副本不存在'] };

  regenStamina();
  if (gameState.stamina < floor.staminaCost) {
    return { success: false, log: ['体力不足! 需要' + floor.staminaCost + '点，当前' + gameState.stamina + '点'] };
  }

  const allies = getFormationPets();
  if (allies.length === 0) {
    return { success: false, log: ['没有上阵宠物!'] };
  }

  consumeStamina(floor.staminaCost);

  const boss = createBoss(floor);
  if (!boss) return { success: false, log: ['Boss数据异常'] };

  const allyClones = allies.map(fp => ({
    ...fp.pet,
    currentHp: fp.pet.currentHp,
    maxHp: fp.pet.maxHp,
    isEnemy: false,
    buffDef: 0,
    regen: 0,
    skills: fp.pet.skills.map(s => ({ ...s, cooldownLeft: 0 }))
  }));

  const enemies = [boss];
  const log = [];
  log.push('⚔️ 挑战 ' + floor.name + ' (Lv.' + floor.bossLevel + ')');

  let round = 0;
  while (round < 100) {
    round++;
    const units = [];
    allyClones.forEach(a => { if (a.currentHp > 0) units.push(a); });
    enemies.forEach(e => { if (e.currentHp > 0) units.push(e); });
    units.sort((a, b) => (b.spd || 0) - (a.spd || 0));

    for (const unit of units) {
      if (unit.currentHp <= 0) continue;
      if (unit.regen > 0) {
        const h = Math.floor(unit.maxHp * 0.08);
        unit.currentHp = Math.min(unit.maxHp, unit.currentHp + h);
        unit.regen--;
      }
      if (unit.buffDef > 0) unit.buffDef--;

      let skill = null;
      if (unit.skills && unit.skills.length > 0) {
        const ready = unit.skills.filter(s => s.cooldownLeft <= 0);
        if (ready.length > 0) {
          ready.sort((a, b) => b.priority - a.priority);
          skill = ready[0];
        }
      }

      const isAlly = !unit.isEnemy;
      const targetPool = isAlly
        ? enemies.filter(e => e.currentHp > 0)
        : allyClones.filter(a => a.currentHp > 0);
      if (targetPool.length === 0) break;

      const target = targetPool[randInt(0, targetPool.length - 1)];
      const skillData = skill ? SKILLS[skill.skillId] : null;

      if (skillData && skillData.type === 'self') {
        if (skillData.effect === 'defUp' || skillData.effect === 'defUp2') {
          unit.buffDef = skillData.effect === 'defUp2' ? 4 : 3;
        } else if (skillData.effect === 'heal25' || skillData.effect === 'heal40') {
          const pct = skillData.effect === 'heal40' ? 0.4 : 0.25;
          unit.currentHp = Math.min(unit.maxHp, unit.currentHp + Math.floor(unit.maxHp * pct));
        } else if (skillData.effect === 'regen') {
          unit.regen = 4;
        }
        if (skill) skill.cooldownLeft = skillData.cooldown || 0;
        if (unit.skills) unit.skills.forEach(s => { if (s.cooldownLeft > 0) s.cooldownLeft--; });
        continue;
      }

      const power = skillData ? skillData.power : 50;
      let dmg = Math.max(1, Math.floor((power * (unit.atk || 50) / ((target.def || 30) + 50)) * (target.buffDef > 0 ? 0.7 : 1.0)) + randInt(-3, 3));
      if (Math.random() < 0.1) dmg = Math.floor(dmg * 1.5);
      if (!unit.isEnemy && unit.talent === 'fierce') dmg = Math.floor(dmg * 1.08);

      target.currentHp = Math.max(0, target.currentHp - dmg);
      const skillName = skillData ? skillData.name : '普攻';
      log.push('R' + round + ' ' + unit.name + ' → ' + skillName + ' → ' + target.name + ' ' + dmg + (target.currentHp <= 0 ? ' 💀' : ''));

      if (skill) skill.cooldownLeft = skillData ? (skillData.cooldown || 0) : 0;
      if (unit.skills) unit.skills.forEach(s => { if (s.cooldownLeft > 0) s.cooldownLeft--; });

      if (enemies.every(e => e.currentHp <= 0)) break;
      if (allyClones.every(a => a.currentHp <= 0)) break;
    }

    if (enemies.every(e => e.currentHp <= 0) || allyClones.every(a => a.currentHp <= 0)) break;
  }

  const victory = enemies.every(e => e.currentHp <= 0);
  const rewards = { gold: 0, exp: 0, runes: [] };

  if (victory) {
    log.push('🎉 胜利!');
    const r = grantDungeonRewards(floorId, floor);
    rewards.gold = r.gold;
    rewards.exp = r.exp;
    rewards.runes = r.runes;
    log.push('💰 金币+' + rewards.gold + '  经验+' + rewards.exp);
  } else {
    log.push('💀 挑战失败...');
  }

  return { success: victory, log, rewards };
}
