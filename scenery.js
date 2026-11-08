// Coordinates follow the painted walking surfaces at the native game size, 1280 × 720.
// Art remains intact: collision contours are data, not visible substitute platforms.
export const PANEL_WIDTH=1280, PANEL_STEP=1248;
export const PANELS=[
 {file:'01-jade',name:'Нефритовый лес',points:[[0,345],[90,354],[175,375],[260,402],[345,425],[455,446],[462,505],[520,514],[580,526],[665,558],[740,568],[810,551],[900,522],[1010,503],[1100,492],[1125,498],[1145,589],[1210,625],[1280,641]],crystals:[280,990]},
 {file:'02-pool',name:'Тихая заводь',points:[[0,360],[90,393],[170,442],[270,473],[350,502],[440,541],[520,559],[620,542],[720,536],[805,523],[868,515],[870,462],[960,460],[1020,439],[1100,425],[1130,420],[1134,346],[1200,335],[1280,330]],crystals:[510,930]},
 {file:'03-waterfall',name:'Долина водопада',points:[[0,550],[105,553],[180,539],[235,507],[280,486],[325,482],[375,492],[430,514],[510,538],[620,550],[760,550],[819,544],[823,521],[900,516],[984,519],[1000,547],[1110,551],[1280,553]],crystals:[325,915]},
 {file:'04-twilight',name:'Сумеречная роща',points:[[0,520],[100,518],[180,516],[265,499],[350,486],[405,493],[480,519],[550,540],[620,551],[680,551],[740,534],[800,517],[808,484],[870,481],[928,487],[945,515],[1030,534],[1100,541],[1200,531],[1280,530]],crystals:[350,875]},
 {file:'05-sanctuary',name:'Светящаяся поляна',points:[[0,482],[120,489],[200,500],[310,500],[340,448],[390,445],[465,461],[485,505],[560,532],[650,546],[760,553],[820,551],[900,528],[975,502],[1070,500],[1140,479],[1220,452],[1280,437]],crystals:[385,780,1070]}
];
export function panelAt(x){return Math.max(0,Math.floor(x/PANEL_STEP));}
export function localGround(panel,x){const p=PANELS[panel%5].points;for(let i=1;i<p.length;i++){const [ax,ay]=p[i-1],[bx,by]=p[i];if(x<=bx)return ay+(by-ay)*Math.max(0,(x-ax)/(bx-ax));}return p.at(-1)[1];}
export function connector(index){const edge=index*PANEL_STEP;return {x1:edge-110,x2:edge+140,y1:localGround(index-1,PANEL_STEP-110),y2:localGround(index,140)};}
export function groundAt(x){const i=panelAt(x);for(const boundary of [i,i+1])if(boundary>0){const b=connector(boundary);if(x>=b.x1&&x<=b.x2)return b.y1+(b.y2-b.y1)*(x-b.x1)/(b.x2-b.x1);}return localGround(i,x-i*PANEL_STEP);}
export function crystalsFor(index){if(index>=5)return [];const first=index*2;return PANELS[index].crystals.map((x,n)=>({id:first+n,x:index*PANEL_STEP+x,y:groundAt(index*PANEL_STEP+x)-(n%2===1?145:51)}));}
