const POSITIONS = [
  {id:'c',name:'C 포수',tag:'전체를 보는 자리',summary:['OUT·RUNNER·도루·번트 가능성을 먼저 본다.','블로킹은 예쁘게 잡기보다 앞에 떨어뜨린다.','R1·R3에서는 주자 하나만 보지 않는다.','폭투·포일 뒤에는 BALL → RUNNER → HOME.'],line:'포수는 공을 받는 사람이 아니라 수비 전체를 보는 사람이다.'},
  {id:'p',name:'P 투수',tag:'던지고 나면 야수',summary:['배트에 맞는 순간부터 야수다.','우측 땅볼이면 1루 커버를 먼저 생각한다.','번트는 팀 약속을 따른다.','홈 승부가 생기면 뒤쪽 백업까지 간다.'],line:'투구가 끝난 뒤에도 팀에는 아홉 번째 야수가 필요하다.'},
  {id:'1b',name:'1B 1루수',tag:'송구의 마지막',summary:['송구를 본 뒤 스트레치한다.','베이스보다 공을 먼저 살려야 할 때가 있다.','낮은 공·높은 공·옆 송구를 최대한 살린다.','내가 타구를 잡으러 나가면 1루 커버를 확인한다.'],line:'좋은 1루수는 동료의 작은 실수까지 아웃으로 바꿔준다.'},
  {id:'2b',name:'2B 2루수',tag:'연결과 빈자리',summary:['R1이면 도루 커버 담당을 확인한다.','병살은 첫 아웃부터 확실하게.','주자 스타트 후 타격되면 CONTACT RESET.','SS·1B가 움직였을 때 비는 베이스를 먼저 본다.'],line:'2루수는 플레이 사이의 빈 곳을 가장 빨리 채우는 선수다.'},
  {id:'3b',name:'3B 3루수',tag:'짧은 반응시간',summary:['강한 타구는 준비 자세에서 시작한다.','느린 타구는 빨리 가되 공부터 본다.','R2이면 도루와 번트를 함께 생각한다.','R1·R2에서는 3루에도 포스가 있다.'],line:'3루수는 빨리 반응하되 급하게 플레이하지 않는다.'},
  {id:'ss',name:'SS 유격수',tag:'내야의 지휘자',summary:['매 투구 OUT·RUNNER·FORCE를 본다.','R1은 도루·병살, R2는 도루·번트·3루 커버.','주자 스타트 뒤 타격되면 CONTACT RESET.','다른 야수가 공을 잡으면 빈 베이스와 중계를 찾는다.'],line:'유격수는 내야의 다음 움직임을 가장 먼저 이해해야 한다.'},
  {id:'lf',name:'LF 좌익수',tag:'단타를 길게 만들지 않기',summary:['확신 없이 앞으로 첫발부터 내지 않는다.','라인 타구를 뒤로 보내지 않는다.','R2가 있으면 포구 전부터 홈 가능성을 본다.','다른 외야수가 공으로 가면 뒤를 백업한다.'],line:'못 잡은 공까지 짧게 끝내는 좌익수가 좋은 좌익수다.'},
  {id:'cf',name:'CF 중견수',tag:'외야의 중심',summary:['첫발보다 첫 판단.','갭에서는 콜을 빨리 한다.','LF/RF가 공으로 가면 뒤를 받친다.','송구는 잡을 수 있는 주자에게 한다.'],line:'중견수는 외야 전체를 편하게 만드는 선수다.'},
  {id:'rf',name:'RF 우익수',tag:'한 베이스를 지우는 송구',summary:['우선상 타구를 뒤로 보내지 않는다.','R1 우전안타는 3루 승부 가능성을 본다.','잡기 어렵다면 뒤 주자를 묶는다.','내야 1루 송구는 백업을 생각한다.'],line:'강한 어깨보다 정확한 판단으로 한 베이스를 지운다.'}
];

const CORE = [
  {id:'prepitch',title:'투구 전 5초',tag:'CORE',body:'OUT → RUNNER → SCORE → BATTER → PLAY',detail:'투구가 들어가기 전에 현재 상황과 내게 공이 왔을 때의 첫 선택을 미리 정한다.'},
  {id:'sureout',title:'확실한 아웃',tag:'CORE',body:'잡고 싶은 주자와 잡을 수 있는 주자를 구분한다.',detail:'공격적인 수비는 좋지만, 첫 아웃까지 잃으면서 두 아웃을 노리는 도박은 피한다.'},
  {id:'onebase',title:'한 베이스 막기',tag:'CORE',body:'아웃을 못 잡아도 다음 베이스는 막을 수 있다.',detail:'잡기 어려운 선행주자에게 무리하게 던져 뒤 주자까지 진루시키지 않는다.'},
  {id:'notmyball',title:'내 공이 아니면 내 역할이 시작된다',tag:'CORE',body:'COVER · CUT · BACKUP · BASE · NEXT',detail:'공이 반대편으로 가는 순간 플레이에서 빠지는 것이 아니라 비어 있는 곳을 찾는다.'},
  {id:'contact',title:'CONTACT RESET',tag:'CORE',body:'RUNNER → CONTACT → RESET → BALL',detail:'주자가 뛰어 커버를 시작했더라도 타격이 이루어지면 기존 임무를 잠시 끊고 공의 위치를 다시 판단한다.'},
  {id:'errorreset',title:'실책·악송구 리셋',tag:'CORE',body:'BALL → RUNNER → BASE → NEXT',detail:'첫 실수는 이미 일어났다. 공을 다시 확보하고 추가 진루부터 막는다.'},
  {id:'force',title:'포스인가 태그인가?',tag:'CORE',body:'포스 상황을 투구 전에 확인한다.',detail:'R1이면 2루 포스, R1·R2이면 3루까지 포스, 만루면 홈까지 포스가 존재한다. R2 또는 R3만 있으면 다음 베이스는 일반적으로 포스가 아니다.'},
  {id:'call',title:'좋은 콜',tag:'CORE',body:'짧게 · 일찍 · 명확하게 · 필요한 것만',detail:'원아웃, 병살 있어, 내꺼, 둘, 홈, 컷처럼 팀원이 바로 행동할 수 있는 정보를 준다.'}
];

const BASE_STATES = [
  {id:'empty',name:'주자 없음',bases:[]},
  {id:'r1',name:'R1',bases:[1]},
  {id:'r2',name:'R2',bases:[2]},
  {id:'r3',name:'R3',bases:[3]},
  {id:'r12',name:'R1·R2',bases:[1,2]},
  {id:'r13',name:'R1·R3',bases:[1,3]},
  {id:'r23',name:'R2·R3',bases:[2,3]},
  {id:'loaded',name:'만루',bases:[1,2,3]}
];

const BO = {
  empty:[
    ['선두타자의 쉬운 아웃을 확실하게.','땅볼은 1루, 플라이는 포구 우선. 단타를 2루타로 만들지 않는다.'],
    ['두 번째 아웃을 확실하게.','무리한 송구보다 재현 가능한 플레이를 선택한다.'],
    ['가장 쉬운 아웃 하나면 이닝 종료.','평범한 플레이를 어렵게 만들지 않는다.']
  ],
  r1:[
    ['병살 가능성을 먼저 본다.','빠른 땅볼이면 2루 선행주자부터. 늦으면 1루 하나. 도루 커버는 팀 약속 확인.'],
    ['병살이면 이닝 종료.','하지만 애매한 타구에서 0아웃 플레이를 만들지 말고 확실한 하나를 확보한다.'],
    ['가장 쉬운 포스 하나면 종료.','1루든 2루든 가까운 확실한 아웃. 병살은 필요 없다.']
  ],
  r2:[
    ['포스 없음. 아웃 + 추가 진루 제한.','무리한 태그보다 1루 아웃이 좋은 경우가 많다. 외야 타구는 3루·홈 진루 가능성 확인.'],
    ['아웃 하나의 가치가 크다.','내야 땅볼은 확실한 아웃을 우선하고, 외야 안타는 홈 승부 기대값을 본다.'],
    ['1루 아웃이면 이닝 종료.','외야 안타면 R2는 바로 홈을 노릴 수 있으므로 OF–CUT–C–P 백업을 준비한다.']
  ],
  r3:[
    ['실점 방지 전략을 먼저 정한다.','한 점을 반드시 막으면 전진수비, 아웃 확보가 우선이면 일반 깊이. 팀 지시를 우선한다.'],
    ['희생플라이와 내야 땅볼 모두 득점 상황.','포구 전부터 홈 플레이 가능성을 생각한다.'],
    ['주자보다 타자주자 아웃.','평범한 땅볼 1루 아웃 또는 플라이 포구면 이닝 종료.']
  ],
  r12:[
    ['3루에도 포스가 있다.','3B 근처 빠른 땅볼은 3루 포스 가능. 번트 로테이션을 경기 전에 확인한다.'],
    ['병살 가능 + 3루 포스.','타구 위치에 가장 자연스러운 포스를 선택하고 첫 아웃을 확실히 한다.'],
    ['어느 포스든 하나면 종료.','3루·2루·1루 중 가장 쉬운 곳. 앞선 주자를 억지로 잡으려 하지 않는다.']
  ],
  r13:[
    ['1·3루 도루 시스템이 핵심.','R1 도루 때 R3 홈 스틸 가능. 팀의 직접송구·컷·송구보류 약속을 따른다.'],
    ['병살과 실점 방지를 함께 본다.','점수 상황에 따라 홈 우선 또는 병살 선택. 외야 플라이는 R3 태그업 대비.'],
    ['홈보다 쉬운 포스 하나.','R3 득점에 시선이 끌려 어려운 홈 송구를 하지 않는다.']
  ],
  r23:[
    ['포스 없음. 두 득점권 주자.','전진수비 여부를 정하고, 아웃이 어려우면 최소 한 베이스를 막는다.'],
    ['희생플라이 한 번으로 실점 가능.','R3만 보지 말고 R2의 3루 진루도 관리한다.'],
    ['타자주자 아웃이면 종료.','안타가 되면 두 주자 득점 가능성이 높으므로 뒤 주자와 타자주자의 추가 진루를 제한한다.']
  ],
  loaded:[
    ['홈 포함 모든 베이스 포스.','무조건 홈이 아니라 가장 높은 성공확률의 포스·병살 경로를 선택한다.'],
    ['병살이면 이닝 종료.','홈-1루, 2루-1루 등 타구 위치에 맞는 첫 아웃을 택한다.'],
    ['가장 가까운 포스 하나.','홈으로 어려운 송구를 할 이유가 없다. 3루·2루·1루 어디든 확실한 포스면 종료.']
  ]
};

const PLAY = [
  {id:'steal',title:'도루',sub:'주자 스타트 → 커버 → CONTACT 여부 확인',tags:['TEAM','CONTACT RESET']},
  {id:'double-steal',title:'R1·R3 더블스틸',sub:'2루 송구 순간 R3 홈 시도 대비',tags:['TEAM']},
  {id:'hit-run',title:'히트앤런',sub:'커버하면서도 타격 순간 RESET',tags:['CORE']},
  {id:'bunt',title:'희생번트',sub:'한 명은 공, 나머지는 빈 베이스',tags:['TEAM']},
  {id:'squeeze',title:'스퀴즈',sub:'R3 + 번트. 투구 전부터 홈을 예상',tags:['TEAM']},
  {id:'doubleplay',title:'병살',sub:'두 개를 노리기 전에 첫 아웃부터',tags:['CORE']},
  {id:'rundown',title:'런다운',sub:'쫓지 말고 몰아. 송구는 적게',tags:['CORE']},
  {id:'tagup',title:'태그업',sub:'포구 전부터 다음 베이스 준비',tags:['RULE']},
  {id:'wildpitch',title:'폭투·포일',sub:'C는 공, P는 홈',tags:['CORE']},
  {id:'cutoff',title:'컷오프·릴레이',sub:'공이 아니라 송구선을 만든다',tags:['TEAM']},
  {id:'overthrow',title:'악송구',sub:'BALL → RUNNER → BASE → NEXT',tags:['CORE']},
  {id:'infieldfly',title:'인필드플라이',sub:'그래도 쉬운 공은 그냥 잡는다',tags:['RULE']}
];

const PLAY_DETAILS = {
  steal:{title:'도루',body:['R1 또는 R2가 스타트하면 커버 담당이 움직인다.','하지만 타자는 여전히 칠 수 있다. 타격되면 CONTACT RESET.','도루 커버 담당은 팀 약속을 우선한다.'],coach:'뛰면 들어가. 맞으면 다시 공이야.'},
  'double-steal':{title:'R1·R3 더블스틸',body:['R1이 2루로 뛰는 순간 R3가 홈을 노릴 수 있다.','직접 2루 송구·중간 컷·송구 보류 등 팀 시스템을 경기 전에 정한다.','경기 중 처음 맞추지 않는다.'],coach:'1·3루 수비는 경기 전에 맞춘다.'},
  'hit-run':{title:'히트앤런',body:['주자 스타트로 중앙 내야수가 베이스 커버를 시작한다.','공격은 그 움직임으로 생긴 빈 공간을 이용한다.','커버를 포기하는 것이 아니라 타격 순간 기존 임무를 다시 판단한다.'],coach:'주자만 보면 늦고, 공만 보면 베이스가 빈다.'},
  bunt:{title:'희생번트',body:['P·C·1B·3B 중 한 명이 공을 처리하면 원래 자리가 빈다.','공 주위로 모두 모이지 말고 베이스 로테이션을 수행한다.','선행주자 아웃이 애매하면 확실한 1루 하나를 선택한다.'],coach:'한 명은 공, 나머지는 베이스.'},
  squeeze:{title:'스퀴즈',body:['R3가 투구와 함께 홈을 노리고 타자는 번트한다.','공을 잡고 난 뒤 홈을 생각하면 늦을 수 있다.','번트 가능성이 있는 상황에서는 투구 전에 홈 플레이를 준비한다.'],coach:'스퀴즈는 공이 아니라 상황을 먼저 봐야 막는다.'},
  doubleplay:{title:'병살',body:['빠른 타구·깨끗한 포구·준비된 커버가 병살의 조건이다.','첫 포스가 늦었다면 1루 하나가 더 좋은 선택일 수 있다.','첫 송구는 피벗 야수가 다음 송구를 하기 좋은 위치로 준다.'],coach:'병살이 보여야 병살이지, R1 있다고 다 병살은 아니야.'},
  rundown:{title:'런다운',body:['공을 가진 야수는 주자의 공간을 줄이고, 받는 야수는 베이스 쪽에서 준비한다.','많은 야수가 주자를 따라 몰리지 않는다.','송구 수를 줄일수록 실수 가능성도 줄어든다.'],coach:'쫓지 말고 몰아. 공은 짧게.'},
  tagup:{title:'태그업',body:['주자는 플라이 포구 후 다음 베이스를 노릴 수 있다.','외야수는 잡기 전부터 송구할 베이스를 생각한다.','너무 일찍 출발했다면 어필 가능성이 있지만 최종 판정은 심판에게 맡긴다.'],coach:'플라이는 잡는 순간 끝나는 게 아니라 다음 송구가 시작된다.'},
  wildpitch:{title:'폭투·포일',body:['R3가 있을 때 C가 공을 쫓아가면 홈이 빈다.','P는 즉시 홈 커버를 준비한다.','다른 야수는 추가 주자와 빈 베이스를 관리한다.'],coach:'포수가 공 따라가면 투수는 홈부터.'},
  cutoff:{title:'컷오프·릴레이',body:['컷맨은 외야수에게 달려가는 사람이 아니라 공과 목표 베이스 사이의 송구선을 만드는 사람이다.','정확한 담당자는 팀 시스템에 따라 달라질 수 있다.','공이 충분히 강하고 정확하면 팀 콜에 따라 통과시킬 수 있다.'],coach:'컷은 공을 받으러 가는 게 아니라 송구선을 만들러 가는 거야.'},
  overthrow:{title:'악송구',body:['공이 빠진 순간 실책 평가보다 공 위치가 먼저다.','백업 야수는 공이 빠질 가능성이 높은 방향을 미리 지킨다.','아웃을 놓쳐도 추가 한 베이스는 막을 수 있다.'],coach:'첫 실수는 끝났어. 두 번째 플레이를 해.'},
  infieldfly:{title:'인필드플라이',body:['0·1아웃, R1·R2 또는 만루, 번트·라인드라이브가 아닌 내야 플라이 등이 기본 조건이다.','선언되면 타자는 아웃이지만 주자는 위험을 감수하고 움직일 수 있다.','사회인야구는 리그 로컬룰을 우선 확인한다.'],coach:'인필드플라이도 그냥 잡아.'}
};

const state = {route:'home', params:{}};
const view = document.querySelector('#view');
const crumb = document.querySelector('#crumb');
const searchDialog = document.querySelector('#searchDialog');
const searchInput = document.querySelector('#searchInput');
const searchResults = document.querySelector('#searchResults');

function esc(s){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
function getFavs(){try{return JSON.parse(localStorage.getItem('defenseFavs')||'[]')}catch{return[]}}
function setFavs(v){localStorage.setItem('defenseFavs',JSON.stringify(v))}
function getRecent(){try{return JSON.parse(localStorage.getItem('defenseRecent')||'[]')}catch{return[]}}
function addRecent(item){let r=getRecent().filter(x=>x.key!==item.key);r.unshift(item);r=r.slice(0,5);localStorage.setItem('defenseRecent',JSON.stringify(r));}
function favButton(key,title){const favs=getFavs();const saved=favs.some(f=>f.key===key);return `<button data-fav-key="${esc(key)}" data-fav-title="${esc(title)}" class="${saved?'saved':''}">${saved?'★ 저장됨':'☆ 저장'}</button>`}
function toggleFav(key,title){let favs=getFavs();const i=favs.findIndex(f=>f.key===key);if(i>=0)favs.splice(i,1);else favs.unshift({key,title});setFavs(favs);render();}

function diamondHTML(bases){return `<div class="diamond"><i class="base-dot b1 ${bases.includes(1)?'on':''}"></i><i class="base-dot b2 ${bases.includes(2)?'on':''}"></i><i class="base-dot b3 ${bases.includes(3)?'on':''}"></i></div>`}
function tagsHTML(tags=[]){return tags.length?`<div class="pill-row">${tags.map(t=>`<span class="pill ${t.toLowerCase()}">${t}</span>`).join('')}</div>`:''}
function relatedButtons(items){return `<div class="related"><div class="section-title">같이 보기</div>${items.map(i=>`<button data-go="${i.route}" data-param='${JSON.stringify(i.params||{})}'>${esc(i.label)}</button>`).join('')}</div>`}

function routeTo(route,params={}){state.route=route;state.params=params;window.scrollTo({top:0,behavior:'instant'});render();}

function homeView(){
  crumb.textContent='HOME';
  const rec=getRecent();
  return `<section class="hero"><div class="eyebrow">MOBILE DEFENSE GUIDE</div><h1>사회인야구<br>수비의 디테일</h1><p class="lead">경기에서 직접 겪어야 알던 수비 판단과 움직임을, 경기 전에 머릿속에 넣어두는 매뉴얼.</p></section>
  <div class="grid two">
    <button class="nav-card dark" data-go="positions"><strong>⚾ 내 포지션</strong><span class="sub">C · P · 1B · 2B · 3B · SS · LF · CF · RF</span></button>
    <button class="nav-card accent" data-go="situations"><strong>◇ 주자 상황</strong><span class="sub">8개 주자상태 × 0·1·2아웃</span></button>
    <button class="nav-card" data-go="plays"><strong>▶ 플레이</strong><span class="sub">도루 · 병살 · 번트 · 컷 · 런다운</span></button>
    <button class="nav-card" data-go="core"><strong>? 지금 헷갈린다면</strong><span class="sub">CONTACT RESET · 확실한 아웃 · 백업</span></button>
  </div>
  <div class="section-title">경기 직전 바로 보기</div>
  <div class="grid two">
    <button class="nav-card" data-go="positions"><strong>30초 포지션 복습</strong><span class="sub">오늘 맡은 자리만 빠르게</span></button>
    <button class="nav-card" data-go="core-page" data-param='{"id":"errorreset"}'><strong>실책 직후 리셋</strong><span class="sub">BALL → RUNNER → BASE → NEXT</span></button>
  </div>
  ${rec.length?`<div class="section-title">최근 본 페이지</div><div class="quick-list">${rec.map(r=>`<button class="quick-item" data-route-key="${esc(r.key)}"><b>${esc(r.title)}</b><span>다시 열기</span></button>`).join('')}</div>`:''}
  <div class="install-note"><div class="emoji">📱</div><div><b>팀 단톡방에서는 링크 하나만 공유</b><div class="small">자주 보는 팀원은 브라우저의 ‘홈 화면에 추가’를 사용하면 앱처럼 꺼내볼 수 있습니다.</div></div></div>`;
}

function positionsView(){crumb.textContent='HOME > 포지션';return `<section class="hero"><div class="eyebrow">POSITION QUICK FIND</div><h2>오늘 어디 보세요?</h2><p class="lead">포지션을 누르면 30초 요약부터 나옵니다.</p></section><div class="grid three position-grid">${POSITIONS.map(p=>`<button class="nav-card" data-go="position" data-param='{"id":"${p.id}"}'><strong>${p.name}</strong><span class="sub">${p.tag}</span></button>`).join('')}</div>`}

function positionView(id){const p=POSITIONS.find(x=>x.id===id)||POSITIONS[0];crumb.textContent=`포지션 > ${p.name}`;const key=`position:${p.id}`;addRecent({key,title:`${p.name} 30초 요약`});return `<section class="hero"><div class="eyebrow">30초 포지션 복습</div><h1>${p.name}</h1><p class="lead">${p.tag}</p></section>${tagsHTML(['CORE'])}<div class="content-card"><div class="steps">${p.summary.map((s,i)=>`<div class="step"><b>${i+1}</b><div>${s}</div></div>`).join('')}</div><div class="coach">“${p.line}”</div></div><div class="page-actions">${favButton(key,`${p.name} 30초 요약`)}</div>${positionLinks(p.id)}`}

function positionLinks(id){const common=[{label:'CONTACT RESET',route:'core-page',params:{id:'contact'}},{label:'Base-Out 찾기',route:'situations'}];const map={
  c:[{label:'도루',route:'play',params:{id:'steal'}},{label:'폭투·포일',route:'play',params:{id:'wildpitch'}},{label:'번트',route:'play',params:{id:'bunt'}}],
  p:[{label:'폭투·포일',route:'play',params:{id:'wildpitch'}},{label:'번트',route:'play',params:{id:'bunt'}},{label:'악송구',route:'play',params:{id:'overthrow'}}],
  '1b':[{label:'악송구',route:'play',params:{id:'overthrow'}},{label:'번트',route:'play',params:{id:'bunt'}},{label:'포스/태그',route:'core-page',params:{id:'force'}}],
  '2b':[{label:'병살',route:'play',params:{id:'doubleplay'}},{label:'도루',route:'play',params:{id:'steal'}},{label:'히트앤런',route:'play',params:{id:'hit-run'}}],
  '3b':[{label:'R2 상황',route:'situation',params:{state:'r2'}},{label:'번트',route:'play',params:{id:'bunt'}},{label:'포스/태그',route:'core-page',params:{id:'force'}}],
  ss:[{label:'병살',route:'play',params:{id:'doubleplay'}},{label:'도루',route:'play',params:{id:'steal'}},{label:'컷오프',route:'play',params:{id:'cutoff'}}],
  lf:[{label:'태그업',route:'play',params:{id:'tagup'}},{label:'컷오프',route:'play',params:{id:'cutoff'}},{label:'한 베이스 막기',route:'core-page',params:{id:'onebase'}}],
  cf:[{label:'태그업',route:'play',params:{id:'tagup'}},{label:'컷오프',route:'play',params:{id:'cutoff'}},{label:'한 베이스 막기',route:'core-page',params:{id:'onebase'}}],
  rf:[{label:'R1 상황',route:'situation',params:{state:'r1'}},{label:'악송구 백업',route:'play',params:{id:'overthrow'}},{label:'컷오프',route:'play',params:{id:'cutoff'}}]
};return relatedButtons([...(map[id]||[]),...common]);}

function situationsView(){crumb.textContent='HOME > 주자 상황';return `<section class="hero"><div class="eyebrow">BASE-OUT QUICK FIND</div><h2>지금 주자는 어디에 있나요?</h2><p class="lead">주자 상태를 고르고, 다음 화면에서 아웃카운트를 누릅니다.</p></section><div class="diamond-wrap">${BASE_STATES.map(s=>`<button class="diamond-card" data-go="situation" data-param='{"state":"${s.id}"}'>${diamondHTML(s.bases)}<strong>${s.name}</strong><span class="small">0 · 1 · 2 OUT</span></button>`).join('')}</div>`}

function situationSelect(stateId){const s=BASE_STATES.find(x=>x.id===stateId)||BASE_STATES[0];crumb.textContent=`주자 상황 > ${s.name}`;return `<section class="hero">${diamondHTML(s.bases)}<h2>${s.name}</h2><p class="lead">몇 아웃인가요?</p></section><div class="outs"><button class="out-btn" data-go="baseout" data-param='{"state":"${s.id}","outs":0}'>0 OUT</button><button class="out-btn" data-go="baseout" data-param='{"state":"${s.id}","outs":1}'>1 OUT</button><button class="out-btn" data-go="baseout" data-param='{"state":"${s.id}","outs":2}'>2 OUT</button></div>`}

function baseoutView(stateId,outs){const s=BASE_STATES.find(x=>x.id===stateId)||BASE_STATES[0];const item=(BO[stateId]||BO.empty)[Number(outs)||0];const title=`${outs} OUT · ${s.name}`;const key=`bo:${stateId}:${outs}`;crumb.textContent=`Base-Out > ${title}`;addRecent({key,title});let tags=[];if(['r13','r3','r23'].includes(stateId))tags.push('OPTION');if(stateId==='r13')tags.push('TEAM');return `<section class="hero">${diamondHTML(s.bases)}<div class="eyebrow">BASE-OUT</div><h1>${title}</h1></section>${tagsHTML(tags)}<div class="content-card"><h3>${item[0]}</h3><p>${item[1]}</p>${Number(outs)===2?'<div class="callout">2아웃: 가장 쉬운 아웃 하나면 이닝을 끝낼 수 있는지 먼저 본다.</div>':''}</div><div class="page-actions">${favButton(key,title)}</div>${relatedButtons([{label:'포스인가 태그인가?',route:'core-page',params:{id:'force'}},{label:'확실한 아웃',route:'core-page',params:{id:'sureout'}},{label:'내 포지션 보기',route:'positions'}])}`}

function coreView(){crumb.textContent='HOME > 핵심 원칙';return `<section class="hero"><div class="eyebrow">CORE</div><h2>경기 중 헷갈리면 여기로</h2><p class="lead">책 전체에서 반복해서 사용할 공용 언어입니다.</p></section><div class="quick-list">${CORE.map(c=>`<button class="quick-item" data-go="core-page" data-param='{"id":"${c.id}"}'><b>${c.title}<span class="tag">CORE</span></b><span>${c.body}</span></button>`).join('')}</div>`}

function corePage(id){const c=CORE.find(x=>x.id===id)||CORE[0];const key=`core:${c.id}`;crumb.textContent=`CORE > ${c.title}`;addRecent({key,title:c.title});return `<section class="hero"><div class="eyebrow">CORE PRINCIPLE</div><h1>${c.title}</h1></section>${tagsHTML(['CORE'])}<div class="content-card"><div class="callout">${c.body}</div><p>${c.detail}</p>${c.id==='contact'?'<div class="coach">“주자가 뛰었다고 베이스만 보지 마라. 들어가는 건 맞다. 맞으면 다시 공이다.”</div>':''}${c.id==='errorreset'?'<div class="coach">“첫 실수는 끝났어. 두 번째 플레이를 해.”</div>':''}</div><div class="page-actions">${favButton(key,c.title)}</div>${relatedButtons([{label:'포지션 찾기',route:'positions'},{label:'주자 상황 찾기',route:'situations'},{label:'플레이 찾기',route:'plays'}])}`}

function playsView(){crumb.textContent='HOME > 플레이';return `<section class="hero"><div class="eyebrow">PLAY QUICK FIND</div><h2>무슨 플레이인가요?</h2><p class="lead">경기에서 바로 맞닥뜨리는 상황을 짧게 정리합니다.</p></section><div class="quick-list">${PLAY.map(p=>`<button class="quick-item" data-go="play" data-param='{"id":"${p.id}"}'><b>${p.title}${p.tags.map(t=>`<span class="tag">${t}</span>`).join('')}</b><span>${p.sub}</span></button>`).join('')}</div>`}

function playView(id){const p=PLAY.find(x=>x.id===id)||PLAY[0];const d=PLAY_DETAILS[p.id];const key=`play:${p.id}`;crumb.textContent=`PLAY > ${p.title}`;addRecent({key,title:p.title});return `<section class="hero"><div class="eyebrow">PLAY</div><h1>${p.title}</h1><p class="lead">${p.sub}</p></section>${tagsHTML(p.tags)}<div class="content-card"><div class="steps">${d.body.map((s,i)=>`<div class="step"><b>${i+1}</b><div>${s}</div></div>`).join('')}</div><div class="coach">“${d.coach}”</div>${p.tags.includes('RULE')?'<div class="callout warn">참가 리그의 로컬룰이 우선합니다. 애매하면 임의로 판정하지 말고 플레이를 계속하며 심판 콜을 확인합니다.</div>':''}</div><div class="page-actions">${favButton(key,p.title)}</div>${relatedButtons([{label:'내 포지션',route:'positions'},{label:'Base-Out',route:'situations'},{label:'핵심 원칙',route:'core'}])}`}

function favoritesView(){crumb.textContent='HOME > 저장';const favs=getFavs();return `<section class="hero"><div class="eyebrow">FAVORITES</div><h2>내가 저장한 수비</h2><p class="lead">경기 전에 자주 보는 페이지만 모아둘 수 있습니다.</p></section>${favs.length?`<div class="quick-list">${favs.map(f=>`<button class="quick-item" data-route-key="${esc(f.key)}"><b>${esc(f.title)}</b><span>열기</span></button>`).join('')}</div>`:'<div class="empty">아직 저장한 페이지가 없습니다.<br>페이지의 ☆ 저장 버튼을 눌러보세요.</div>'}`}

function routeKeyTo(key){const parts=key.split(':');if(parts[0]==='position')return routeTo('position',{id:parts[1]});if(parts[0]==='core')return routeTo('core-page',{id:parts[1]});if(parts[0]==='play')return routeTo('play',{id:parts[1]});if(parts[0]==='bo')return routeTo('baseout',{state:parts[1],outs:Number(parts[2])});}

function render(){
  document.querySelectorAll('.bottom-nav button').forEach(b=>b.classList.toggle('active',b.dataset.route===state.route || (b.dataset.route==='situations'&&['situation','baseout'].includes(state.route)) || (b.dataset.route==='positions'&&state.route==='position')));
  let html='';
  if(state.route==='home')html=homeView();
  else if(state.route==='positions')html=positionsView();
  else if(state.route==='position')html=positionView(state.params.id);
  else if(state.route==='situations')html=situationsView();
  else if(state.route==='situation')html=situationSelect(state.params.state);
  else if(state.route==='baseout')html=baseoutView(state.params.state,state.params.outs);
  else if(state.route==='core')html=coreView();
  else if(state.route==='core-page')html=corePage(state.params.id);
  else if(state.route==='plays')html=playsView();
  else if(state.route==='play')html=playView(state.params.id);
  else if(state.route==='favorites')html=favoritesView();
  else html=homeView();
  view.innerHTML=html;
}

function allSearchItems(){
  const arr=[];
  POSITIONS.forEach(p=>arr.push({title:`${p.name} 30초 요약`,meta:`포지션 ${p.tag}`,key:`position:${p.id}`,text:[p.name,p.tag,...p.summary,p.line].join(' ')}));
  CORE.forEach(c=>arr.push({title:c.title,meta:'CORE',key:`core:${c.id}`,text:`${c.title} ${c.body} ${c.detail}`}));
  PLAY.forEach(p=>arr.push({title:p.title,meta:p.tags.join(' · '),key:`play:${p.id}`,text:`${p.title} ${p.sub} ${PLAY_DETAILS[p.id].body.join(' ')}`}));
  BASE_STATES.forEach(s=>[0,1,2].forEach(o=>{const item=BO[s.id][o];arr.push({title:`${o} OUT · ${s.name}`,meta:'BASE-OUT',key:`bo:${s.id}:${o}`,text:`${s.name} ${o}아웃 ${item[0]} ${item[1]}`})}));
  return arr;
}
function runSearch(q){q=q.trim().toLowerCase();const items=allSearchItems();const hits=!q?items.slice(0,12):items.filter(i=>i.text.toLowerCase().includes(q)||i.title.toLowerCase().includes(q)).slice(0,30);searchResults.innerHTML=hits.length?hits.map(h=>`<button class="search-result" data-route-key="${esc(h.key)}"><b>${esc(h.title)}</b><span>${esc(h.meta)}</span></button>`).join(''):'<div class="empty">검색 결과가 없습니다.</div>';}

view.addEventListener('click',e=>{const go=e.target.closest('[data-go]');if(go){let p={};try{p=JSON.parse(go.dataset.param||'{}')}catch{}routeTo(go.dataset.go,p);return}const f=e.target.closest('[data-fav-key]');if(f){toggleFav(f.dataset.favKey,f.dataset.favTitle);return}const rk=e.target.closest('[data-route-key]');if(rk){routeKeyTo(rk.dataset.routeKey);return}});
document.querySelector('.bottom-nav').addEventListener('click',e=>{const b=e.target.closest('button[data-route]');if(b)routeTo(b.dataset.route)});
document.querySelector('#homeBtn').addEventListener('click',()=>routeTo('home'));
document.querySelector('#searchBtn').addEventListener('click',()=>{searchDialog.showModal();searchInput.value='';runSearch('');setTimeout(()=>searchInput.focus(),60)});
searchInput.addEventListener('input',()=>runSearch(searchInput.value));
searchResults.addEventListener('click',e=>{const b=e.target.closest('[data-route-key]');if(b){searchDialog.close();routeKeyTo(b.dataset.routeKey)}});

if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));}
render();
