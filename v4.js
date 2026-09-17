'use strict';

/*
 * v4 patch
 * - 더 큰 야구장 / 외야 깊이 강조
 * - SS·2B 중계 이동 강조
 * - 홈 사용법
 * - 포지션별 기본 수비 위치 상세
 * - 런다운 다단계 회전 애니메이션
 */
(() => {
  const POS_GUIDE = {
    c: {
      title: 'C 포수',
      where: '홈플레이트 뒤에서 투수의 공을 안정적으로 받을 수 있는 깊이가 기본입니다.',
      why: '포수의 기본 위치는 좌우 이동보다 투수·타자·심판과의 간격, 블로킹과 송구 자세를 동시에 만들 수 있는지가 중요합니다.',
      bullets: ['R3가 있으면 블로킹 우선순위를 높입니다.', '도루 가능성이 높으면 송구 교환이 늦어지지 않는 자세를 준비합니다.', '타구가 나오면 홈에 고정되지 말고 공·주자·백업을 다시 봅니다.']
    },
    p: {
      title: 'P 투수',
      where: '투구 전에는 마운드가 위치이고, 공이 배트에 맞는 순간부터는 내야 중앙의 야수로 전환합니다.',
      why: '투수의 수비 위치는 투구 종료 자세와 연결됩니다. 던진 뒤 균형을 회복해 P 앞 타구, 1루 커버, 홈 백업으로 이동할 수 있어야 합니다.',
      bullets: ['1B가 우측 타구를 처리하면 즉시 1루 커버를 봅니다.', '외야 홈 송구가 시작되면 홈 뒤 백업까지 이어집니다.', '주자가 있어도 투구 후 수비 준비 자세를 생략하지 않습니다.']
    },
    '1b': {
      title: '1B 1루수',
      where: '주자 없을 때는 1루 베이스에서 2루 방향으로 몇 걸음 떨어지고, 1·2루 베이스라인보다 약간 뒤에서 시작하는 것이 기본 기준입니다.',
      why: '베이스에 너무 붙으면 1·2루 사이 수비 범위를 잃고, 너무 깊으면 느린 땅볼과 1루 아웃 시간이 부족해집니다.',
      bullets: ['R1 홀딩이 필요하면 베이스 쪽으로 이동합니다.', '좌타·강한 당겨치기 타자에는 1·2루 사이를 조금 더 의식합니다.', 'P–1B 사이 타구에서는 공과 1루 커버를 동시에 확인합니다.']
    },
    '2b': {
      title: '2B 2루수',
      where: '1루와 2루 사이의 중앙 부근, 베이스라인보다 몇 걸음 뒤를 출발점으로 생각합니다.',
      why: '2B는 타구뿐 아니라 병살·도루 커버·1루 커버·우측 외야 중계까지 맡기 때문에 한쪽 베이스에 너무 붙지 않는 것이 중요합니다.',
      bullets: ['R1·0/1아웃이면 병살을 위해 2루 쪽으로 약간 조정할 수 있습니다.', 'RF·우중간 타구에서는 외야 방향으로 빠르게 중계선에 들어갑니다.', '1B가 앞으로 나가면 1루가 비는지 즉시 확인합니다.']
    },
    '3b': {
      title: '3B 3루수',
      where: '3루 베이스에서 유격수 방향으로 몇 걸음, 3루선보다 약간 뒤를 기본 위치로 잡습니다.',
      why: '3B는 반응 시간이 짧기 때문에 깊이보다 첫 스텝과 타구 속도에 맞는 준비 자세가 중요합니다.',
      bullets: ['번트 가능성이 높으면 홈 쪽으로 전진합니다.', 'R2가 있으면 3루 도루와 번트를 함께 대비합니다.', '경기 후반 라인 장타를 막아야 하면 3루선 쪽으로 조정합니다.']
    },
    ss: {
      title: 'SS 유격수',
      where: '2루와 3루 사이 중앙 부근, 베이스라인보다 몇 걸음 뒤를 기본 출발점으로 잡습니다.',
      why: '너무 깊으면 평범한 땅볼의 1루 송구 시간이 부족하고, 너무 얕으면 강한 타구 반응 범위가 줄어듭니다. 자신의 송구력과 구장 바운드에 맞춰 깊이를 정합니다.',
      bullets: ['R1이면 병살·도루 커버를 위해 2루 쪽으로 약간 조정합니다.', 'LF·좌중간 타구에서는 외야 쪽으로 크게 이동해 컷·릴레이 선을 만듭니다.', '3B가 번트 차지하면 3루 커버 로테이션을 준비합니다.']
    },
    lf: {
      title: 'LF 좌익수',
      where: '좌측 파울라인과 좌중간 사이를 모두 커버할 수 있도록 라인에 붙지 않고, 내야보다 충분히 깊게 섭니다.',
      why: '외야는 앞의 단타보다 뒤로 빠지는 장타 비용이 큽니다. 타자 장타력과 자신의 첫 스텝을 기준으로 깊이를 조절합니다.',
      bullets: ['당겨치는 우타자에는 약간 라인 쪽으로 움직일 수 있습니다.', '약한 타자에는 몇 걸음 전진하되 머리 위 타구 위험을 남겨둡니다.', 'CF가 공으로 가면 뒤쪽 백업이 바로 시작됩니다.']
    },
    cf: {
      title: 'CF 중견수',
      where: '외야 중앙에서 LF·RF보다 대체로 조금 더 깊게 시작해 양쪽 갭을 모두 커버합니다.',
      why: 'CF는 좌중간·우중간의 우선권과 두 코너 외야수의 백업을 동시에 담당하므로 넓은 시야가 가장 중요합니다.',
      bullets: ['정면 타구의 깊이 판단을 위해 지나치게 얕게 서지 않습니다.', '강한 타자에는 몇 걸음 깊게, 약한 타자에는 몇 걸음 전진합니다.', 'LF/RF가 타구를 처리하면 즉시 그 뒤 공간을 백업합니다.']
    },
    rf: {
      title: 'RF 우익수',
      where: '우측 파울라인과 우중간 사이를 모두 커버할 수 있도록 라인에 붙지 않고, 내야보다 충분히 깊게 섭니다.',
      why: 'RF는 우측 장타뿐 아니라 1루 악송구 백업과 R1의 3루 진루 억제까지 연결됩니다.',
      bullets: ['R1 우전안타 가능성이 있으면 3루 송구 각도를 미리 생각합니다.', '내야 땅볼이면 1루 악송구 백업 각도를 준비합니다.', 'CF가 우중간으로 가면 뒤쪽 백업으로 전환합니다.']
    }
  };

  const HOWTO = `
    <section class="v4-howto">
      <h3>⚾ 이 앱은 이렇게 보세요</h3>
      <p>수비는 공을 잡는 선수만의 일이 아닙니다. 상황을 고르고 9명의 움직임을 본 뒤, 내 포지션만 다시 확인하는 순서가 가장 좋습니다.</p>
      <div class="v4-howto-grid">
        <div class="v4-howto-step"><span class="num">1</span><b>상황</b><span>주자·아웃·타구 종류와 방향을 골라 9명 전체의 움직임을 봅니다.</span></div>
        <div class="v4-howto-step"><span class="num">2</span><b>포지션</b><span>내 포지션을 선택해 같은 상황에서 내가 어디로 가는지 크게 봅니다.</span></div>
        <div class="v4-howto-step"><span class="num">3</span><b>플레이</b><span>병살·번트·컷오프·런다운처럼 팀 전술이 필요한 장면을 익힙니다.</span></div>
        <div class="v4-howto-step"><span class="num">4</span><b>경기 전 30초</b><span>기본 수비 위치와 오늘 자주 나올 상황 1~2개만 다시 확인합니다.</span></div>
      </div>
    </section>`;

  function positionGuideHTML(id) {
    const g = POS_GUIDE[id];
    if (!g) return '';
    return `<section class="v4-position-guide">
      <div class="v4-position-guide-head"><h3>📍 기본 수비 위치 · ${g.title}</h3><span>기준 위치 + 상황 조정</span></div>
      <div class="where">${g.where}</div>
      <div class="why">${g.why}</div>
      <ul>${g.bullets.map(x => `<li>${x}</li>`).join('')}</ul>
      <div class="note">※ 절대적인 한 점이 아니라 출발 기준입니다. 구장 크기·인조잔디/흙·타구속도·자신의 수비 범위와 송구력에 따라 1~몇 걸음 조정하세요.</div>
    </section>`;
  }

  /* 홈 화면 사용법 삽입 */
  if (typeof homeView === 'function') {
    const oldHomeViewV4 = homeView;
    homeView = function() {
      const html = oldHomeViewV4();
      const firstClose = html.indexOf('</section>');
      if (firstClose < 0) return HOWTO + html;
      return html.slice(0, firstClose + 10) + HOWTO + html.slice(firstClose + 10);
    };
  }

  /* 포지션 기본 위치 상세 삽입 */
  if (typeof positionView === 'function') {
    const oldPositionViewV4 = positionView;
    positionView = function(id) {
      let html = oldPositionViewV4(id);
      const marker = '<div class="sim-position-lab">';
      if (html.includes(marker)) html = html.replace(marker, positionGuideHTML(id) + marker);
      else html += positionGuideHTML(id);
      return html;
    };
  }

  /* 전술판 외야를 더 깊고 크게 보이게 */
  const OF_START = {
    LF: { old:[20,24], next:[15.5,17] },
    CF: { old:[50,15], next:[50,6.5] },
    RF: { old:[80,24], next:[84.5,17] }
  };

  function near(a,b){ return Math.abs(a-b) < .8; }
  function setPawnStart(svg, name, spec) {
    const el = svg.querySelector(`[data-sim-player="${name}"]`);
    if (!el) return;
    const ox=+el.dataset.x1, oy=+el.dataset.y1, ex=+el.dataset.x2, ey=+el.dataset.y2;
    if (near(ox,spec.old[0]) && near(oy,spec.old[1])) {
      el.dataset.x1=spec.next[0]; el.dataset.y1=spec.next[1];
      if (near(ex,spec.old[0]) && near(ey,spec.old[1])) { el.dataset.x2=spec.next[0]; el.dataset.y2=spec.next[1]; }
      el.setAttribute('transform',`translate(${spec.next[0]} ${spec.next[1]})`);
      const path=svg.querySelector(`[data-sim-player-path="${name}"]`);
      if(path){path.setAttribute('x1',spec.next[0]);path.setAttribute('y1',spec.next[1]);}
    }
  }

  function widenField(svg) {
    if (!svg || svg.dataset.v4Field === '1') return;
    svg.dataset.v4Field='1';
    svg.setAttribute('viewBox','0 0 100 100');
    svg.style.overflow='visible';
    const paths=[...svg.children].filter(n=>n.tagName && n.tagName.toLowerCase()==='path');
    const outer=paths.find(p => (p.getAttribute('d')||'').includes('M50 86 L10 48'));
    if(outer){outer.setAttribute('d','M50 88 L4 47 Q12 2 50 .8 Q88 2 96 47 L50 88');outer.setAttribute('stroke-width','1');}
    const foul=paths.find(p => (p.getAttribute('d')||'').includes('M50 84 L9 47'));
    if(foul){foul.setAttribute('d','M50 84 L3.5 44 M50 84 L96.5 44');foul.setAttribute('stroke-width','1');}
    Object.entries(OF_START).forEach(([n,s])=>setPawnStart(svg,n,s));
  }

  /* 외야 송구 시 SS/2B가 실제로 외야 쪽으로 들어가는 모습 강화 */
  function enhanceRelay(root) {
    if (!root || root.dataset.v4Relay === '1') return;
    const kind=root.dataset.kind, dir=root.dataset.dir;
    if (!['single','gap'].includes(kind)) { root.dataset.v4Relay='1'; return; }
    const svg=root.querySelector('.sim-scenario-svg');
    if(!svg) return;
    const throws=[...svg.querySelectorAll('[data-sim-throw-path]')];
    if(throws.length < 2){root.dataset.v4Relay='1';return;}

    let cut, target;
    if(dir==='lf'){cut='SS';target=[32,45];}
    else if(dir==='lcf'){cut='SS';target=[39,42];}
    else if(dir==='cf'){cut='SS';target=[46,42];}
    else if(dir==='rcf'){cut='2B';target=[61,42];}
    else if(dir==='rf'){cut='2B';target=[68,45];}
    else {root.dataset.v4Relay='1';return;}

    if(kind==='gap') target=[target[0],target[1]-4];
    const el=svg.querySelector(`[data-sim-player="${cut}"]`);
    if(!el){root.dataset.v4Relay='1';return;}
    el.dataset.x2=target[0];el.dataset.y2=target[1];
    el.classList.add('is-involved');
    const path=svg.querySelector(`[data-sim-player-path="${cut}"]`);
    if(path){path.setAttribute('x2',target[0]);path.setAttribute('y2',target[1]);path.classList.add('v4-relay-path');}
    throws[0].setAttribute('x2',target[0]);throws[0].setAttribute('y2',target[1]);
    throws[1].setAttribute('x1',target[0]);throws[1].setAttribute('y1',target[1]);
    root.dataset.v4Relay='1';
  }

  function patchCurrentBoards(scope=document) {
    scope.querySelectorAll?.('.sim-field').forEach(widenField);
    scope.querySelectorAll?.('[data-sim-root]').forEach(enhanceRelay);
  }

  const obs=new MutationObserver(muts=>{
    for(const m of muts){
      for(const n of m.addedNodes){if(n.nodeType===1) patchCurrentBoards(n);}
    }
    patchCurrentBoards(document);
  });
  const view=document.querySelector('#view');
  if(view) obs.observe(view,{childList:true,subtree:true});

  /* 런다운 상세 애니메이션 */
  function rundownHTML(){
    return `<section class="v4-rundown" data-v4-rundown>
      <h3>🔁 런다운 · 후속 수비수까지 회전하기</h3>
      <div class="lead">아래 예시는 2루↔3루 런다운입니다. 공 가진 야수가 주자를 몰고, 늦게 송구하고, 송구한 야수는 플레이 선에서 빠져 송구 방향의 후방 대열로 합류합니다. 팀마다 회전 약속은 다를 수 있습니다.</div>
      <div class="v4-rundown-status" data-rd-status>BEFORE · 3B가 공을 들고 주자와 거리를 줄입니다.</div>
      <div class="v4-rundown-board"><svg viewBox="0 0 100 100" aria-label="2루와 3루 사이 런다운 애니메이션">
        <rect width="100" height="100" fill="#eef3e9"/>
        <path d="M50 88 L4 47 Q12 2 50 .8 Q88 2 96 47 L50 88" fill="#d7e5cf" stroke="#b8cbb3" stroke-width="1"/>
        <path d="M50 84 26 58 50 35 74 58Z" fill="#ead9b3" stroke="#c9b58c" stroke-width=".8"/>
        <path d="M50 84 L3.5 44 M50 84 L96.5 44" stroke="#fff" stroke-width="1"/>
        <rect x="47.5" y="32.5" width="5" height="5" transform="rotate(45 50 35)" fill="#fff"/>
        <rect x="23.5" y="55.5" width="5" height="5" transform="rotate(45 26 58)" fill="#fff"/>
        <path d="M28 57 Q37 50 48 37" fill="none" stroke="#3d6eb4" stroke-width="2.2" stroke-dasharray="4 2" opacity=".25"/>
        <g data-rd-player="3B" transform="translate(27 57)"><circle r="4.1" fill="#0d3328"/><text y="1.2" text-anchor="middle" font-size="3" font-weight="900" fill="#fff">3B</text></g>
        <g data-rd-player="SS" transform="translate(47 38)"><circle r="4.1" fill="#0d3328"/><text y="1.2" text-anchor="middle" font-size="3" font-weight="900" fill="#fff">SS</text></g>
        <g data-rd-player="2B" transform="translate(56 31)"><circle r="3.5" fill="#fff" stroke="#0d3328" stroke-width="1"/><text y="1.1" text-anchor="middle" font-size="2.6" font-weight="900" fill="#0d3328">2B</text></g>
        <g data-rd-player="P" transform="translate(21 64)"><circle r="3.5" fill="#fff" stroke="#0d3328" stroke-width="1"/><text y="1.1" text-anchor="middle" font-size="2.6" font-weight="900" fill="#0d3328">P</text></g>
        <g data-rd-runner transform="translate(34 52)"><circle r="3.8" fill="#d87b2b"/><text y="1.1" text-anchor="middle" font-size="2.7" font-weight="900" fill="#fff">R2</text></g>
        <g data-rd-ball transform="translate(27 57)"><circle r="1.8" fill="#fff" stroke="#c84a3d" stroke-width=".9"/></g>
      </svg></div>
      <div class="v4-rundown-controls"><button class="primary" data-rd-action="play">▶ 천천히 재생</button><button data-rd-action="reset">↻ 처음부터</button></div>
      <div class="v4-rundown-steps">
        <div class="v4-rundown-step"><b>1 · DRIVE</b>공 가진 야수가 주자를 향해 달려 방향을 확실히 만들기.</div>
        <div class="v4-rundown-step"><b>2 · LATE THROW</b>받는 야수가 움직이며 콜할 때 짧고 정확하게 송구.</div>
        <div class="v4-rundown-step"><b>3 · ROTATE</b>던진 야수는 옆으로 빠져 송구 방향 후방 대열에 합류.</div>
        <div class="v4-rundown-step"><b>4 · FINISH</b>새 공 보유자가 다시 몰고, 거리가 좁아지면 더 던지지 말고 태그.</div>
      </div>
      <div class="sim-caution">핵심은 송구 횟수가 아니라 공간을 줄이는 것입니다. 가능하면 0~2번의 송구 안에 끝내고, 3루↔홈에서는 실점을 막기 위해 주자를 3루 쪽으로 돌려보내는 팀 원칙을 둘 수 있습니다.</div>
    </section>`;
  }

  if(typeof playView==='function'){
    const oldPlayViewV4=playView;
    playView=function(id){
      let html=oldPlayViewV4(id);
      if(id==='rundown'){
        const marker='<div class="content-card">';
        html=html.includes(marker)?html.replace(marker,rundownHTML()+marker):html+rundownHTML();
      }
      return html;
    };
  }

  function rdSet(el,x,y){el?.setAttribute('transform',`translate(${x} ${y})`);}
  function rdTween(el,a,b,dur){
    return new Promise(resolve=>{
      if(!el){resolve();return;}
      const t0=performance.now();
      function frame(now){
        const p=Math.min(1,(now-t0)/dur), e=p<.5?2*p*p:1-Math.pow(-2*p+2,2)/2;
        rdSet(el,a[0]+(b[0]-a[0])*e,a[1]+(b[1]-a[1])*e);
        if(p<1)requestAnimationFrame(frame);else resolve();
      }
      requestAnimationFrame(frame);
    });
  }
  const rdWait=ms=>new Promise(r=>setTimeout(r,ms));
  function rdReset(root){
    rdSet(root.querySelector('[data-rd-player="3B"]'),27,57);rdSet(root.querySelector('[data-rd-player="SS"]'),47,38);
    rdSet(root.querySelector('[data-rd-player="2B"]'),56,31);rdSet(root.querySelector('[data-rd-player="P"]'),21,64);
    rdSet(root.querySelector('[data-rd-runner]'),34,52);rdSet(root.querySelector('[data-rd-ball]'),27,57);
    root.querySelector('[data-rd-status]').textContent='BEFORE · 3B가 공을 들고 주자와 거리를 줄입니다.';
    root.dataset.running='0';
  }
  async function rdPlay(root){
    if(root.dataset.running==='1')return; root.dataset.running='1';
    const p3=root.querySelector('[data-rd-player="3B"]'), ss=root.querySelector('[data-rd-player="SS"]'), p2=root.querySelector('[data-rd-player="2B"]'), p=root.querySelector('[data-rd-player="P"]'), r=root.querySelector('[data-rd-runner]'), ball=root.querySelector('[data-rd-ball]'), st=root.querySelector('[data-rd-status]');
    rdReset(root);root.dataset.running='1'; await rdWait(900);
    st.textContent='STEP 1 · DRIVE — 3B가 공을 들고 R2를 2루 쪽으로 몰아갑니다.';
    await Promise.all([rdTween(p3,[27,57],[36,49],2300),rdTween(ball,[27,57],[36,49],2300),rdTween(r,[34,52],[43,42],2300)]); await rdWait(650);
    st.textContent='STEP 2 · THROW — SS가 움직이며 공을 요구하고, 3B가 늦게 송구합니다.';
    await rdTween(ball,[36,49],[47,38],1500); await rdWait(450);
    st.textContent='STEP 3 · ROTATE — 3B는 옆으로 빠져 2루 쪽 후방 대열로 들어가고 SS가 새 추격자가 됩니다.';
    await Promise.all([rdTween(p3,[36,49],[56,33],2200),rdTween(ss,[47,38],[39,47],2200),rdTween(ball,[47,38],[39,47],2200),rdTween(r,[43,42],[31,55],2200)]); await rdWait(650);
    st.textContent='STEP 4 · NEXT — 3루 쪽 후속 수비수 P가 앞으로 들어오고 SS가 다시 늦게 송구합니다.';
    await Promise.all([rdTween(p,[21,64],[28,57],1400),rdTween(p2,[56,31],[50,35],1400)]); await rdWait(400); await rdTween(ball,[39,47],[28,57],1400); await rdWait(450);
    st.textContent='STEP 5 · FINISH — P가 공을 잡고 거리를 줄입니다. 태그 거리가 되면 더 던지지 않습니다.';
    await Promise.all([rdTween(p,[28,57],[31,54],1700),rdTween(ball,[28,57],[31,54],1700),rdTween(r,[31,55],[30,55],1300),rdTween(ss,[39,47],[23,62],1800)]); await rdWait(1100);
    st.textContent='완료 · CHASE → COMMIT → THROW → ROTATE → TAG. 송구보다 공간 압축이 먼저입니다.'; root.dataset.running='0';
  }

  document.addEventListener('click',e=>{
    const b=e.target.closest('[data-rd-action]'); if(!b)return;
    const root=b.closest('[data-v4-rundown]'); if(!root)return;
    if(b.dataset.rdAction==='reset')rdReset(root); else rdPlay(root);
  });

  /* 현재 화면 재렌더: v4 래퍼가 즉시 보이도록 */
  try { if(typeof render==='function') render(); } catch(e) {}
  setTimeout(()=>patchCurrentBoards(document),50);
})();
