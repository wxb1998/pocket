// 元素属性及克制关系
export const ELEM_CHART = {
  normal:{name:'普通',strong:[],weak:['fight']},
  fire:{name:'火',strong:['grass','ice'],weak:['water','rock']},
  water:{name:'水',strong:['fire','rock'],weak:['grass','electric']},
  grass:{name:'草',strong:['water','rock'],weak:['fire','ice','poison','flying']},
  ice:{name:'冰',strong:['grass','dragon','flying'],weak:['fire','fight','rock']},
  electric:{name:'电',strong:['water','flying'],weak:['rock']},
  rock:{name:'岩',strong:['fire','ice','flying'],weak:['water','grass','fight']},
  poison:{name:'毒',strong:['grass'],weak:['rock']},
  dark:{name:'暗',strong:['holy'],weak:['holy','fight']},
  holy:{name:'神圣',strong:['dark','dragon'],weak:['dark']},
  dragon:{name:'龙',strong:['dragon'],weak:['ice','holy','dragon']},
  flying:{name:'飞行',strong:['grass','fight'],weak:['ice','electric','rock']},
  fight:{name:'格斗',strong:['normal','rock','ice','dark'],weak:['flying']}
};

// 资质倍率
export const APT_MULT = { D:0.6, C:0.8, B:1.0, A:1.2, S:1.5, 'S+':2.0 };

// 资质随机权重
export const APT_WEIGHTS = { D:25, C:25, B:20, A:15, S:10, 'S+':5 };

// 性格系统
export const PERSONALITIES = {
  brave:{name:'勇敢',up:'atk',down:'spd'},
  bold:{name:'大胆',up:'def',down:'spd'},
  adamant:{name:'固执',up:'atk',down:'def'},
  jolly:{name:'开朗',up:'spd',down:'def'},
  timid:{name:'胆小',up:'spd',down:'atk'},
  modest:{name:'内敛',up:'def',down:'atk'},
  hasty:{name:'急躁',up:'spd',down:'hp'},
  relaxed:{name:'悠闲',up:'hp',down:'spd'},
  careful:{name:'慎重',up:'def',down:'hp'},
  rash:{name:'莽撞',up:'atk',down:'hp'},
  quiet:{name:'冷静',up:'hp',down:'atk'},
  gentle:{name:'温顺',up:null,down:null}
};
