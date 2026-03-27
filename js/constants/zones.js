// 区域数据 - 10个区域覆盖Lv.1-100
// 活力系统：maxVigor=最大活力, vigorCost=每次战斗消耗, vigorRegen=每小时回复量
// depletedRatio=活力耗尽后收益倍率, elemFocus=该区域重点掉落元素符文
export const ZONES = [
  {name:'翠竹平原',desc:'新手起步之地',lvRange:[1,8],unlockLv:1,species:['hundun','dangkang','jiao','danghu'],
   maxVigor:100,vigorCost:5,vigorRegen:20,depletedRatio:0.2,elemFocus:['normal','earth'],icon:'🌿'},
  {name:'青丘之丘',desc:'百花盛开的灵丘',lvRange:[8,16],unlockLv:5,species:['danghu','goumang','bo','kunpeng','jingwei'],
   maxVigor:100,vigorCost:6,vigorRegen:18,depletedRatio:0.2,elemFocus:['grass','wind'],icon:'🌸'},
  {name:'烈焰山谷',desc:'火焰永不熄灭的峡谷',lvRange:[15,25],unlockLv:10,species:['bifang','zhulong','luwu','kui'],
   maxVigor:100,vigorCost:7,vigorRegen:16,depletedRatio:0.2,elemFocus:['fire'],icon:'🔥'},
  {name:'幽暗沼泽',desc:'毒雾弥漫的沼泽',lvRange:[23,35],unlockLv:15,species:['xiushe','gudiao','wangliang','xiangliu'],
   maxVigor:100,vigorCost:8,vigorRegen:15,depletedRatio:0.2,elemFocus:['dark','water'],icon:'🌑'},
  {name:'雷霆峡谷',desc:'雷电交加的深谷',lvRange:[33,45],unlockLv:22,species:['kui','leishen','xingtian','jingwei','chiyou'],
   maxVigor:100,vigorCost:8,vigorRegen:14,depletedRatio:0.2,elemFocus:['thunder'],icon:'⚡'},
  {name:'蓬莱仙岛',desc:'海上仙山，灵气充沛',lvRange:[43,55],unlockLv:30,species:['baize','yingzhao','kunpeng','wenyao','luoyu'],
   maxVigor:80,vigorCost:8,vigorRegen:12,depletedRatio:0.2,elemFocus:['water','holy'],icon:'🏝️'},
  {name:'昆仑雪域',desc:'万年冰封的圣山',lvRange:[53,65],unlockLv:38,species:['yayu','hanhao','chilong','yueyu','xingtian'],
   maxVigor:80,vigorCost:9,vigorRegen:12,depletedRatio:0.2,elemFocus:['ice','wind'],icon:'❄️'},
  {name:'九幽冥界',desc:'幽冥之地，暗影横行',lvRange:[63,78],unlockLv:48,species:['qiongqi','taotie','wangliang','zhuyinlong','xiushe'],
   maxVigor:80,vigorCost:10,vigorRegen:10,depletedRatio:0.15,elemFocus:['dark'],icon:'💀'},
  {name:'不周天柱',desc:'连接天地的巨柱',lvRange:[75,90],unlockLv:58,species:['yinglong','chiyou','leishen','luwu','jiuying'],
   maxVigor:60,vigorCost:10,vigorRegen:8,depletedRatio:0.15,elemFocus:['thunder','fire'],icon:'🗼'},
  {name:'混沌深渊',desc:'万物起源，终极挑战',lvRange:[88,100],unlockLv:70,species:['yinglong','zhuyinlong','chilong','qiongqi','taotie','jiuying'],
   maxVigor:60,vigorCost:12,vigorRegen:8,depletedRatio:0.1,elemFocus:['dark','fire','holy'],icon:'🌀'}
];
