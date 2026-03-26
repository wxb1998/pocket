// 宝物系统数据
export const QUALITY_ORDER = ['white','green','blue','purple','gold'];
export const QUALITY_NAMES = {white:'白色',green:'绿色',blue:'蓝色',purple:'紫色',gold:'金色'};
export const QUALITY_AFFIX_COUNT = {white:1,green:2,blue:3,purple:4,gold:5};

export const AFFIX_POOL = [
  {id:'atk_pct',name:'ATK',min:3,max:15,suffix:'%'},
  {id:'def_pct',name:'DEF',min:3,max:15,suffix:'%'},
  {id:'hp_pct',name:'HP',min:3,max:15,suffix:'%'},
  {id:'spd_pct',name:'SPD',min:2,max:10,suffix:'%'},
  {id:'crit_rate',name:'暴击率',min:2,max:8,suffix:'%'},
  {id:'crit_dmg',name:'暴击伤害',min:5,max:20,suffix:'%'}
];

export const PASSIVE_POOL = [
  {id:'lifesteal',name:'吸血',desc:'攻击回复5%伤害值',prob:0.3},
  {id:'thorns',name:'反伤',desc:'受击反弹10%伤害',prob:0.25},
  {id:'shield',name:'护盾',desc:'回合开始5%概率获得护盾',prob:0.2},
  {id:'doubleStrike',name:'连击',desc:'8%概率攻击两次',prob:0.15},
  {id:'dodge',name:'闪避',desc:'5%概率闪避攻击',prob:0.1}
];
