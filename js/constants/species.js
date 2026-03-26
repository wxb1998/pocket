// 32种山海经灵兽数据
export const SPECIES = {
  // ===== 普通系 Normal (3) =====
  hundun:{name:'混沌',elem:'normal',baseStats:{hp:90,atk:50,def:70,spd:40},
    evoChain:['浑圆肉团','识面混沌','开明兽'],skillPool:{basic:['slam','tackle','guard'],mid:['ironwall','smash'],high:['heavenbreak']},desc:'混沌无面，浑圆如卵'},
  dangkang:{name:'当康',elem:'normal',baseStats:{hp:70,atk:65,def:55,spd:60},
    evoChain:['小野猪','利牙当康','神农当康'],skillPool:{basic:['slam','tackle','ironpunch'],mid:['smash','boulder'],high:['heavenbreak']},desc:'形如猪，鸣则天下大穰'},
  jiao:{name:'狡',elem:'normal',baseStats:{hp:55,atk:45,def:40,spd:85},
    evoChain:['三足兔','玉狡','月狡'],skillPool:{basic:['slam','gust','tackle'],mid:['hurricane','smash'],high:['skyascend']},desc:'三足而速，鸣如犬吠'},

  // ===== 火系 Fire (3) =====
  bifang:{name:'毕方',elem:'fire',baseStats:{hp:55,atk:85,def:40,spd:70},
    evoChain:['火雀','赤焰毕方','神火毕方'],skillPool:{basic:['spark','gust','tackle'],mid:['blaze','firespin'],high:['inferno']},desc:'一足鸟，见则邑有讹火'},
  zhulong:{name:'烛龙',elem:'fire',baseStats:{hp:80,atk:75,def:60,spd:35},
    evoChain:['火蛇','烛阴','烛龙'],skillPool:{basic:['spark','bite','shadow'],mid:['blaze','darkbite'],high:['inferno','soulburn']},desc:'视为昼，瞑为夜，吹为冬，呼为夏'},
  luwu:{name:'陆吾',elem:'fire',baseStats:{hp:75,atk:70,def:65,spd:40},
    evoChain:['火虎幼崽','赤虎','陆吾神将'],skillPool:{basic:['spark','ironpunch','guard'],mid:['blaze','ironwall'],high:['inferno','heavenbreak']},desc:'人面虎身九尾，司天之九部'},

  // ===== 水系 Water (3) =====
  luoyu:{name:'蠃鱼',elem:'water',baseStats:{hp:95,atk:45,def:75,spd:35},
    evoChain:['小鱼','蠃蛟','蠃龙王'],skillPool:{basic:['watergun','guard','tackle'],mid:['torrent','ironwall'],high:['deluge']},desc:'鱼身而鸟翼，苍文赤尾'},
  wenyao:{name:'文鳐',elem:'water',baseStats:{hp:55,atk:60,def:45,spd:90},
    evoChain:['飞鱼','文鳐鱼','苍文鳐'],skillPool:{basic:['watergun','gust','slam'],mid:['torrent','hurricane'],high:['deluge','skyascend']},desc:'状如鲤鱼，鱼身鸟翼，飞行自在'},
  xiangliu:{name:'相柳',elem:'water',baseStats:{hp:80,atk:80,def:50,spd:40},
    evoChain:['水蛇','九首蛇','相柳'],skillPool:{basic:['watergun','poisonsting','bite'],mid:['torrent','venom'],high:['deluge','deathpoison']},desc:'九首蛇身，食于九土'},

  // ===== 草系 Grass (3) =====
  danghu:{name:'当扈',elem:'grass',baseStats:{hp:65,atk:40,def:55,spd:55},
    evoChain:['花鸟','彩翼当扈','神木当扈'],skillPool:{basic:['vinewhip','heal','gust'],mid:['overgrowth','rejuvenate'],high:['verdant','allheal']},desc:'状如雉，羽色斑斓，司木之华'},
  goumang:{name:'句芒',elem:'grass',baseStats:{hp:70,atk:55,def:60,spd:65},
    evoChain:['草芽精','藤灵','句芒神使'],skillPool:{basic:['vinewhip','tackle','guard'],mid:['overgrowth','ironwall'],high:['verdant']},desc:'木神句芒，主春与生'},
  bo:{name:'驳',elem:'grass',baseStats:{hp:65,atk:80,def:55,spd:50},
    evoChain:['幼马','角驳','天驳'],skillPool:{basic:['vinewhip','ironpunch','slam'],mid:['overgrowth','smash'],high:['verdant','heavenbreak']},desc:'如马，白身黑尾，虎齿爪，食虎豹'},

  // ===== 冰系 Ice (2) =====
  yayu:{name:'窫窳',elem:'ice',baseStats:{hp:70,atk:80,def:55,spd:45},
    evoChain:['冰兽幼崽','寒窫窳','极冰窫窳'],skillPool:{basic:['iceshard','bite','slam'],mid:['freeze','darkbite'],high:['absolutezero']},desc:'龙首而居弱水，其音如婴儿'},
  hanhao:{name:'寒号',elem:'ice',baseStats:{hp:60,atk:50,def:50,spd:75},
    evoChain:['冰雀','霜翎寒号','冰晶寒号'],skillPool:{basic:['iceshard','gust','heal'],mid:['freeze','hurricane'],high:['absolutezero','skyascend']},desc:'寒号之鸟，霜羽冰翎'},

  // ===== 电系 Electric (2) =====
  kui:{name:'夔',elem:'electric',baseStats:{hp:60,atk:85,def:40,spd:80},
    evoChain:['雷兽','夔牛','天雷夔'],skillPool:{basic:['thunderbolt','slam','tackle'],mid:['thunder','smash'],high:['megathunder']},desc:'一足牛，其声如雷'},
  leishen:{name:'雷神',elem:'electric',baseStats:{hp:75,atk:75,def:55,spd:50},
    evoChain:['雷蛋','雷鼓兽','雷泽神'],skillPool:{basic:['thunderbolt','ironpunch','guard'],mid:['thunder','ironwall'],high:['megathunder','heavenbreak']},desc:'龙身人首，鼓其腹则雷'},

  // ===== 岩系 Rock (2) =====
  yueyu:{name:'猰貐',elem:'rock',baseStats:{hp:100,atk:50,def:85,spd:15},
    evoChain:['岩兽','铁甲猰貐','山岳猰貐'],skillPool:{basic:['rockthrow','guard','slam'],mid:['boulder','ironwall'],high:['avalanche']},desc:'山中巨兽，其皮如岩石'},
  xingtian:{name:'刑天',elem:'rock',baseStats:{hp:85,atk:75,def:70,spd:20},
    evoChain:['石偶','刑天战士','无首刑天'],skillPool:{basic:['rockthrow','ironpunch','slam'],mid:['boulder','smash'],high:['avalanche','heavenbreak']},desc:'无首之人，以乳为目，以脐为口'},

  // ===== 毒系 Poison (2) =====
  xiushe:{name:'修蛇',elem:'poison',baseStats:{hp:75,atk:70,def:50,spd:55},
    evoChain:['毒蛇','巨蟒','巴蛇修蛇'],skillPool:{basic:['poisonsting','bite','slam'],mid:['venom','darkbite'],high:['deathpoison']},desc:'大蛇吞象，三岁出其骨'},
  gudiao:{name:'蛊雕',elem:'poison',baseStats:{hp:60,atk:65,def:45,spd:75},
    evoChain:['毒鹰','蛊翼雕','天蛊雕'],skillPool:{basic:['poisonsting','gust','bite'],mid:['venom','hurricane'],high:['deathpoison','skyascend']},desc:'雕身蛇尾，其毒无解'},

  // ===== 暗系 Dark (3) =====
  wangliang:{name:'魍魉',elem:'dark',baseStats:{hp:55,atk:55,def:40,spd:90},
    evoChain:['幽影','夜魍魉','深渊魍魉'],skillPool:{basic:['shadow','bite','slam'],mid:['darkbite','smash'],high:['eternalnight']},desc:'幽影鬼魅，出没无常'},
  qiongqi:{name:'穷奇',elem:'dark',baseStats:{hp:65,atk:90,def:45,spd:50},
    evoChain:['暗兽','食梦穷奇','天罪穷奇'],skillPool:{basic:['shadow','bite','ironpunch'],mid:['darkbite','smash'],high:['eternalnight','soulburn']},desc:'状如虎有翼，食人'},
  taotie:{name:'饕餮',elem:'dark',baseStats:{hp:85,atk:80,def:55,spd:30},
    evoChain:['暗影团','噬魂饕餮','混沌饕餮'],skillPool:{basic:['shadow','bite','slam'],mid:['darkbite','venom'],high:['eternalnight','soulburn']},desc:'羊身人面，目在腋下，贪食无厌'},

  // ===== 神圣系 Holy (2) =====
  baize:{name:'白泽',elem:'holy',baseStats:{hp:80,atk:45,def:65,spd:55},
    evoChain:['灵兽幼崽','白泽','神明白泽'],skillPool:{basic:['holylight','heal','guard'],mid:['judgment','rejuvenate'],high:['divinepunish','allheal']},desc:'通万物之情，知鬼神之事'},
  yingzhao:{name:'英招',elem:'holy',baseStats:{hp:70,atk:55,def:70,spd:55},
    evoChain:['圣马','飞翼英招','天英招'],skillPool:{basic:['holylight','guard','gust'],mid:['judgment','ironwall'],high:['divinepunish','skyascend']},desc:'马身人面虎纹鸟翼，司四方'},

  // ===== 龙系 Dragon (3) =====
  yinglong:{name:'应龙',elem:'dragon',baseStats:{hp:80,atk:80,def:65,spd:55},
    evoChain:['幼龙','应龙','天命应龙'],skillPool:{basic:['dragonbreath','watergun','slam'],mid:['dragonroar','torrent'],high:['dragondescent','deluge']},desc:'有翼之龙，杀蚩尤夸父，不得复上'},
  zhuyinlong:{name:'烛阴龙',elem:'dragon',baseStats:{hp:70,atk:90,def:50,spd:55},
    evoChain:['暗龙','冥烛龙','太初烛龙'],skillPool:{basic:['dragonbreath','shadow','bite'],mid:['dragonroar','darkbite'],high:['dragondescent','eternalnight']},desc:'龙身暗鳞，视为昼瞑为夜'},
  chilong:{name:'螭龙',elem:'dragon',baseStats:{hp:75,atk:65,def:65,spd:60},
    evoChain:['角蛇','螭吻','神螭龙'],skillPool:{basic:['dragonbreath','iceshard','guard'],mid:['dragonroar','freeze'],high:['dragondescent','absolutezero']},desc:'无角之龙，螭吻含水镇火'},

  // ===== 飞行系 Flying (2) =====
  kunpeng:{name:'鲲鹏',elem:'flying',baseStats:{hp:70,atk:55,def:50,spd:90},
    evoChain:['小鲲','化鹏','逍遥鲲鹏'],skillPool:{basic:['gust','watergun','heal'],mid:['hurricane','aquaring'],high:['skyascend','allheal']},desc:'北冥有鱼其名为鲲，化而为鹏'},
  jingwei:{name:'精卫',elem:'flying',baseStats:{hp:60,atk:70,def:50,spd:75},
    evoChain:['小鸟','衔石精卫','不屈精卫'],skillPool:{basic:['gust','rockthrow','slam'],mid:['hurricane','boulder'],high:['skyascend','avalanche']},desc:'炎帝之女，溺死东海，化为精卫填海'},

  // ===== 格斗系 Fight (1) =====
  chiyou:{name:'蚩尤',elem:'fight',baseStats:{hp:75,atk:90,def:60,spd:35},
    evoChain:['铜首兽','蚩尤战将','魔神蚩尤'],skillPool:{basic:['ironpunch','slam','guard'],mid:['smash','ironwall'],high:['heavenbreak','avalanche']},desc:'铜头铁额，兽身人语'},

  // ===== 水/火 双属性 (1) =====
  jiuying:{name:'九婴',elem:'water',baseStats:{hp:85,atk:75,def:45,spd:45},
    evoChain:['水火幼蛇','九婴','灾厄九婴'],skillPool:{basic:['watergun','spark','bite'],mid:['torrent','blaze'],high:['deluge','inferno']},desc:'水火之怪，为人之害'}
};
