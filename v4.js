'use strict';

/*
 * v4.3 patch
 * - 더 큰 야구장 / 외야 깊이 강조
 * - SS·2B 중계 이동 강조
 * - 홈 사용법
 * - 포지션별 기본 수비 위치 상세
 * - 런다운 3구간 다단계 회전 + 외야 백업
 * - 모바일 설치/즐겨찾기 안내
 * - 제대로 배우기 심화 커리큘럼
 * - 포지션별 기본기 완전정리
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
      where: '주자 없을 때는 1루 베이스에서 2루 방향으로 대략 4~6걸음, 1·2루 베이스라인보다 약 3~5걸음 뒤를 출발 기준으로 잡습니다. 자신의 첫 스텝과 P–1B 사이 처리 범위에 맞춰 조정합니다.',
      why: '베이스에 너무 붙으면 1·2루 사이 수비 범위를 잃고, 너무 깊으면 느린 땅볼과 1루 아웃 시간이 부족해집니다.',
      bullets: ['R1 홀딩이 필요하면 베이스 쪽으로 이동합니다.', '좌타·강한 당겨치기 타자에는 1·2루 사이를 조금 더 의식합니다.', 'P–1B 사이 타구에서는 공과 1루 커버를 동시에 확인합니다.']
    },
    '2b': {
      title: '2B 2루수',
      where: '1루와 2루 사이에서 2루 쪽으로 약간 치우치고, 1·2루 베이스라인보다 대략 4~7걸음 뒤를 출발 기준으로 생각합니다. 1B와의 간격이 너무 넓어지지 않게 조정합니다.',
      why: '2B는 타구뿐 아니라 병살·도루 커버·1루 커버·우측 외야 중계까지 맡기 때문에 한쪽 베이스에 너무 붙지 않는 것이 중요합니다.',
      bullets: ['R1·0/1아웃이면 병살을 위해 2루 쪽으로 약간 조정할 수 있습니다.', 'RF·우중간 타구에서는 외야 방향으로 빠르게 중계선에 들어갑니다.', '1B가 앞으로 나가면 1루가 비는지 즉시 확인합니다.']
    },
    '3b': {
      title: '3B 3루수',
      where: '3루 베이스에서 SS 방향으로 대략 3~5걸음, 3루 베이스라인보다 약 2~4걸음 뒤를 기본 출발점으로 잡습니다. 번트·느린 타자에서는 전진 폭을 더 크게 가져갑니다.',
      why: '3B는 반응 시간이 짧기 때문에 깊이보다 첫 스텝과 타구 속도에 맞는 준비 자세가 중요합니다.',
      bullets: ['번트 가능성이 높으면 홈 쪽으로 전진합니다.', 'R2가 있으면 3루 도루와 번트를 함께 대비합니다.', '경기 후반 라인 장타를 막아야 하면 3루선 쪽으로 조정합니다.']
    },
    ss: {
      title: 'SS 유격수',
      where: '2루와 3루 사이에서 2루보다 3루 쪽 공간을 조금 더 담당하고, 2·3루 베이스라인보다 대략 4~7걸음 뒤를 기본 출발점으로 잡습니다. 평범한 땅볼을 자신의 송구력으로 1루에서 아웃시킬 수 있는 깊이가 상한선입니다.',
      why: '너무 깊으면 평범한 땅볼의 1루 송구 시간이 부족하고, 너무 얕으면 강한 타구 반응 범위가 줄어듭니다. 자신의 송구력과 구장 바운드에 맞춰 깊이를 정합니다.',
      bullets: ['R1이면 병살·도루 커버를 위해 2루 쪽으로 약간 조정합니다.', 'LF·좌중간 타구에서는 외야 쪽으로 크게 이동해 컷·릴레이 선을 만듭니다.', '3B가 번트 차지하면 3루 커버 로테이션을 준비합니다.']
    },
    lf: {
      title: 'LF 좌익수',
      where: '좌측 파울라인과 좌중간을 동시에 커버하도록 라인에서 충분히 떨어지고, 내야수보다 확실히 깊은 외야 기본 깊이를 잡습니다. 펜스까지의 거리와 자신의 전진 능력을 기준으로 ‘뒤로 빠지는 공이 단타보다 더 비싸다’는 쪽에 우선순위를 둡니다.',
      why: '외야는 앞의 단타보다 뒤로 빠지는 장타 비용이 큽니다. 타자 장타력과 자신의 첫 스텝을 기준으로 깊이를 조절합니다.',
      bullets: ['당겨치는 우타자에는 약간 라인 쪽으로 움직일 수 있습니다.', '약한 타자에는 몇 걸음 전진하되 머리 위 타구 위험을 남겨둡니다.', 'CF가 공으로 가면 뒤쪽 백업이 바로 시작됩니다.']
    },
    cf: {
      title: 'CF 중견수',
      where: '외야 중앙에서 LF·RF보다 대체로 2~4걸음 더 깊게 시작해 좌중간·우중간을 모두 커버합니다. 양 코너 외야수보다 뒤에서 전체 타구를 보는 깊이가 기본입니다.',
      why: 'CF는 좌중간·우중간의 우선권과 두 코너 외야수의 백업을 동시에 담당하므로 넓은 시야가 가장 중요합니다.',
      bullets: ['정면 타구의 깊이 판단을 위해 지나치게 얕게 서지 않습니다.', '강한 타자에는 몇 걸음 깊게, 약한 타자에는 몇 걸음 전진합니다.', 'LF/RF가 타구를 처리하면 즉시 그 뒤 공간을 백업합니다.']
    },
    rf: {
      title: 'RF 우익수',
      where: '우측 파울라인과 우중간을 동시에 커버하도록 라인에서 충분히 떨어지고, 내야수보다 확실히 깊게 섭니다. 1루 악송구 백업을 갈 수 있는 각도와 우중간 갭 수비를 함께 고려합니다.',
      why: 'RF는 우측 장타뿐 아니라 1루 악송구 백업과 R1의 3루 진루 억제까지 연결됩니다.',
      bullets: ['R1 우전안타 가능성이 있으면 3루 송구 각도를 미리 생각합니다.', '내야 땅볼이면 1루 악송구 백업 각도를 준비합니다.', 'CF가 우중간으로 가면 뒤쪽 백업으로 전환합니다.']
    }
  };

  const HOWTO = `
    <section class="v4-howto v43-howto">
      <h3>⚾ 이 앱은 이렇게 사용하세요</h3>
      <p>경기 전에는 내 포지션과 자주 나올 상황을 짧게 복습하고, 경기 중에는 <b>상황 → 내 포지션 강조 → 애니메이션</b> 순서로 보면 가장 빠릅니다.</p>
      <div class="v4-howto-grid">
        <div class="v4-howto-step"><span class="num">1</span><b>상황</b><span>주자·아웃·타구 종류와 방향을 골라 9명 전체의 움직임을 봅니다.</span></div>
        <div class="v4-howto-step"><span class="num">2</span><b>포지션</b><span>내 포지션을 선택해 같은 상황에서 내가 어디로 가는지 크게 봅니다.</span></div>
        <div class="v4-howto-step"><span class="num">3</span><b>플레이</b><span>병살·번트·컷오프·런다운처럼 팀 전술이 필요한 장면을 익힙니다.</span></div>
        <div class="v4-howto-step"><span class="num">4</span><b>경기 전 30초</b><span>기본 수비 위치와 오늘 자주 나올 상황 1~2개만 다시 확인합니다.</span></div>
      </div>

      <div class="v43-install-title">📱 자주 보려면 휴대폰에 저장해두세요</div>
      <div class="v43-install-grid">
        <article class="v43-install-card ios">
          <div class="v43-install-head"><span></span><div><b>아이폰 · iPhone</b><small>Safari 사용 권장</small></div></div>
          <div class="v43-install-block"><b>홈 화면에 앱 아이콘 만들기</b><ol><li>Safari에서 이 페이지를 엽니다.</li><li>아래쪽 <strong>공유 ⬆︎</strong> 버튼을 누릅니다.</li><li><strong>홈 화면에 추가</strong>를 선택합니다.</li><li>이름을 확인한 뒤 <strong>추가</strong>를 누르면 일반 앱처럼 아이콘이 생깁니다.</li></ol></div>
          <div class="v43-install-block"><b>브라우저 즐겨찾기만 하기</b><ol><li>Safari의 <strong>공유 ⬆︎</strong> 버튼을 누릅니다.</li><li><strong>책갈피 추가</strong> 또는 즐겨찾기 관련 항목을 선택합니다.</li></ol></div>
        </article>
        <article class="v43-install-card android">
          <div class="v43-install-head"><span>🤖</span><div><b>안드로이드 · Android</b><small>Chrome 기준</small></div></div>
          <div class="v43-install-block"><b>홈 화면에 앱 아이콘 만들기</b><ol><li>Chrome에서 이 페이지를 엽니다.</li><li>오른쪽 위 <strong>⋮ 메뉴</strong>를 누릅니다.</li><li><strong>홈 화면에 추가</strong> 또는 <strong>앱 설치</strong>를 선택합니다.</li><li>표시되는 안내에 따라 추가하면 홈 화면에서 바로 실행할 수 있습니다.</li></ol></div>
          <div class="v43-install-block"><b>브라우저 즐겨찾기만 하기</b><ol><li>Chrome의 <strong>⋮ 메뉴</strong>를 누릅니다.</li><li><strong>☆ 북마크</strong> 또는 별표 아이콘을 눌러 저장합니다.</li></ol></div>
        </article>
      </div>
      <div class="v43-install-note">※ 브라우저·OS 버전에 따라 메뉴 이름이 조금 다를 수 있습니다. 홈 화면에 추가해두면 단톡방 링크를 다시 찾지 않아도 경기장에서 바로 열 수 있습니다.</div>
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

  const POS_DEEP = {
    c: {
      intro:'포수는 공을 받는 사람이라기보다 한 플레이 전에 정보를 정리하고, 타구 뒤에는 8명의 다음 움직임을 연결하는 수비 리더입니다.',
      sections:[
        ['투구 전 체크','OUT·RUNNER·FORCE·점수·타자 성향을 먼저 확인하고, 도루·번트·R1·R3 같은 특수 가능성을 내야와 공유합니다.','사인이 끝난 뒤에도 내야 위치가 맞는지 한 번 본다.','R3가 있으면 블로킹 우선순위가 즉시 올라간다.'],
        ['리시빙·블로킹','사회인야구에서는 예쁜 프레이밍보다 공을 잃지 않는 것이 먼저입니다. 바운드볼은 몸 앞에 죽이고, 블로킹 뒤에는 공 위치→주자→홈 순서로 다시 봅니다.','무릎만 내리기보다 공이 튈 공간을 몸으로 닫는다.','공이 옆으로 빠졌다면 바로 송구하지 말고 확보부터 한다.'],
        ['도루 송구','빠른 팔보다 짧은 교환·정확한 발·낮고 정확한 송구가 중요합니다. 커버 담당은 반드시 팀 약속과 맞춥니다.','R1 스타트와 타격 CONTACT를 동시에 본다.','늦었으면 무리한 악송구 대신 다음 베이스를 묶는 선택도 한다.'],
        ['번트·팝업','번트는 가장 먼저 본 사람이 크게 콜하고, 자신이 공으로 갈 때 비는 홈과 베이스를 누가 채우는지 봅니다. 팝업은 마스크·배트·심판과 충돌 위험까지 포함한 플레이입니다.','번트 타구에서 선행주자 욕심으로 모두 살리지 않는다.','팝업은 콜을 먼저 하고 주변을 정리한다.'],
        ['타구 후 지휘·백업','외야 송구에서는 홈·3루·2루 중 목표를 빠르게 콜하고, 런다운에서는 양쪽 베이스의 후속 수비수와 다른 주자를 함께 봅니다.','홈 승부 시 공만 기다리지 말고 송구선과 태그 위치를 만든다.','실책 뒤에는 원인보다 현재 아웃과 다음 베이스를 말한다.']
      ],
      mistakes:['R3가 있는데 포구 자세만 생각해 블로킹 준비가 늦음','도루 주자만 보다가 CONTACT 이후 타구를 놓침','외야 송구 때 너무 많은 말을 해 야수 판단을 늦춤','폭투 뒤 포수와 투수가 둘 다 공으로 달려 홈이 빔'],
      practice:['블로킹→공 확보→홈 확인 3동작 반복','도루 송구는 팝타임보다 10개 중 정확한 송구 비율 기록','매 이닝 시작 전 내야에 OUT·FORCE 콜하기']
    },
    p: {
      intro:'투수는 던지는 순간까지만 투수가 아니라, CONTACT 이후에는 내야 중앙에서 가장 빠르게 빈 공간을 메워야 하는 9번째 야수입니다.',
      sections:[
        ['투구 종료 자세','릴리스 뒤 한쪽으로 크게 무너지면 P 앞 타구와 1루 커버 첫발이 늦어집니다. 던진 뒤 양발로 다시 지면을 잡는 습관이 수비의 시작입니다.','타격음과 동시에 글러브를 수비 위치로 복귀한다.','강습 타구는 무리한 맨손보다 몸 앞에 막아두는 것도 좋은 수비다.'],
        ['P 앞 땅볼','가까운 타구일수록 손만 뻗지 말고 공 뒤로 몸을 이동합니다. 잡기 전 이미 FORCE와 첫 송구 베이스를 알아야 합니다.','느린 번트성 타구는 공격적으로 전진한다.','병살 타이밍이 늦으면 1루 하나로 단순화한다.'],
        ['1루 커버','1B가 공으로 나가면 P는 공을 보며 1루 송구선으로 달립니다. 베이스로 직선 돌진하기보다 송구 받을 각도로 접근하고, 포구 뒤 주루선에서 빠져나갑니다.','BALL→BAG→CLEAR 순서를 반복한다.','늦었으면 억지 커버보다 악송구 백업을 찾는다.'],
        ['번트·홈 커버','번트에서는 P·C·1B·3B 중 누가 공을 잡고 누가 베이스를 채우는지 팀 약속이 중요합니다. 폭투·포일에서 R3가 뛰면 P는 홈 커버가 기본입니다.','포수가 공을 쫓으면 홈은 비기 쉽다.','홈 태그 위치를 만들되 주루선을 과도하게 막지 않는다.'],
        ['외야 타구·백업','외야에서 홈이나 3루 송구가 시작되면 P는 해당 베이스 뒤의 악송구 백업으로 이동합니다. 공이 정확히 왔다고 중간에 멈추지 않습니다.','홈 송구는 포수 바로 뒤가 아니라 빠진 공을 막을 깊이까지 간다.','런다운에서는 후속 대열 또는 빈 베이스 역할을 빠르게 찾는다.']
      ],
      mistakes:['투구 후 마운드에서 플레이를 구경함','1B가 타구 처리하는데 공만 따라가 1루가 빔','폭투 때 포수와 함께 공으로 달려 홈이 빔','홈 송구 백업을 포수 바로 뒤에서 해 악송구를 막지 못함'],
      practice:['투구 10개마다 릴리스 후 수비자세까지 세트로 반복','P–1B 커버를 실제 베이스 거리로 왕복 훈련','폭투 상황 C는 공/P는 홈 역할을 소리 내어 반복']
    },
    '1b': {
      intro:'1루수의 가치는 자신의 타구 처리뿐 아니라 동료의 애매한 송구를 아웃으로 바꾸고, 1루가 비는 순간을 없애는 데 있습니다.',
      sections:[
        ['준비 위치·홀딩','주자 없을 때는 베이스에 붙지 않고 1·2루 사이 수비 범위를 확보합니다. R1 홀딩이 필요할 때만 베이스로 접근하고, 투구 후 다시 타구 수비로 전환합니다.','홀딩 때문에 타구 첫 스텝이 늦어지지 않게 한다.','견제 후에는 주자보다 타자 CONTACT를 다시 본다.'],
        ['송구 받기','미리 크게 스트레치하지 말고 공 방향을 본 뒤 마지막 순간에 뻗습니다. 낮은 공은 글러브를 먼저 내려 숏바운드가 올라오는 길을 막습니다.','공을 살리는 것이 베이스 접촉보다 중요할 때가 있다.','높은 송구는 점프 후 베이스 복귀보다 충돌 방지가 우선이다.'],
        ['자기 타구 처리','1루선·1·2루 사이 타구에서 내가 공으로 나가면 즉시 P 또는 2B의 1루 커버를 확인합니다. 혼자 공도 잡고 베이스도 지키려 하지 않습니다.','P–1B 사이 애매한 공은 콜을 크게 한다.','느린 타구는 타자주자 속도를 보고 공격적으로 처리한다.'],
        ['번트·컷오프','번트 차지 시 1루가 비므로 P/2B 로테이션이 필요합니다. 우측 외야 송구에서는 팀 시스템에 따라 컷·중계에 참여할 수 있습니다.','선행주자 욕심보다 1루 확실한 아웃을 우선할 상황이 많다.','컷맨은 공 가까운 사람이 아니라 송구선 위의 사람이다.'],
        ['악송구 이후','공이 빠졌다면 베이스에 집착하지 말고 공부터 살립니다. RF 백업을 믿되 타자주자의 2루 진루와 다른 주자를 계속 확인합니다.','세이프가 된 뒤에도 플레이는 끝나지 않는다.','BALL→RUNNER→BASE→NEXT로 리셋한다.']
      ],
      mistakes:['송구 전에 미리 스트레치해 방향 전환이 안 됨','P와 둘 다 P–1B 사이 공을 쫓아 1루가 빔','잡기 어려운 악송구를 억지로 잡다가 공을 더 멀리 보냄','홀딩 후 타격 순간에도 주자에게 시선이 고정됨'],
      practice:['5방향 송구에 맞춘 스트레치/풋워크','숏바운드 블로킹 20개','P–1B 애매한 타구 콜+커버 반복']
    },
    '2b': {
      intro:'2루수는 기록에 보이지 않는 커버와 연결이 가장 많은 포지션입니다. 공보다 빈 베이스를 먼저 채우는 플레이가 팀 수비를 살립니다.',
      sections:[
        ['기본 위치·첫 스텝','1·2루 사이를 넓게 쓰되 R1·병살 상황에서만 2루 쪽으로 약간 조정합니다. 주자 때문에 베이스에 너무 붙으면 우측 수비 범위를 잃습니다.','타구 방향을 보기 전 몸을 베이스 쪽으로 완전히 돌리지 않는다.','자신의 1루 송구 거리와 타구속도로 깊이를 조정한다.'],
        ['병살 피벗','4-6-3에서는 SS가 받을 수 있는 이동선에 던지고, 6-4-3/5-4-3에서는 첫 아웃을 밟은 뒤 주자 슬라이딩 라인에서 벗어나 1루로 연결합니다.','병살은 두 아웃 욕심보다 첫 아웃이 빠른 플레이다.','늦으면 즉시 1루 하나로 전환한다.'],
        ['도루·CONTACT RESET','R1 도루 커버 담당을 SS와 사전에 맞춥니다. 주자가 뛰어도 타격 순간에는 기존 임무를 잠시 끊고 BALL FIRST로 재판단합니다.','도루 스타트는 정보이지 최종 임무가 아니다.','히트앤런일수록 몸을 베이스로 완전히 돌리지 않는다.'],
        ['1루 커버','1B가 번트·느린 타구로 나가고 P가 다른 역할이면 2B가 1루를 채우는 시스템이 있습니다. 이미 P가 커버하면 중복 이동하지 않습니다.','누가 1루를 채우는지 팀 약속을 명확히 한다.','커버 시 타자주자와 충돌하지 않을 송구 각을 만든다.'],
        ['우측 외야 중계','RF·우중간 타구에서는 내야에 머물지 말고 외야 쪽으로 크게 움직여 목표 베이스와 외야수 사이 송구선에 들어갑니다. 반대 키스톤은 2루 또는 뒤 주자를 맡습니다.','컷 위치는 공 가까이가 아니라 목표 베이스와의 직선이다.','공을 받은 뒤 뒤 주자까지 즉시 확인한다.']
      ],
      mistakes:['도루 커버에 몰입해 CONTACT 뒤에도 2루만 감','1B·P와 동시에 1루 커버해 2루가 빔','병살 욕심으로 늦은 송구를 고집함','우전안타에서 내야에 서 있어 중계선이 길어짐'],
      practice:['도루→CONTACT RESET 반응 드릴','6-4-3/5-4-3 피벗 풋워크','RF→3루/홈 중계 위치를 실제 거리로 뛰어보기']
    },
    '3b': {
      intro:'3루수는 반응 시간이 가장 짧은 내야수입니다. 빠르게 움직이되 급하게 던지지 않는 것이 핵심입니다.',
      sections:[
        ['준비 자세·라인','강한 타구를 대비해 발뒤꿈치에 고정되지 않고, 라인과 3·유간 중 무엇을 더 지킬지 타자·카운트에 따라 조정합니다.','2스트라이크나 경기 후반에는 라인 장타 가치가 달라질 수 있다.','강습은 잡지 못해도 몸 앞에 막으면 다음 플레이가 남는다.'],
        ['느린 타구','번트성·빗맞은 타구는 공 속도와 타자주자 발을 비교해 공격적으로 전진합니다. 포구 전에 송구 동작을 먼저 만들지 않습니다.','러닝스로는 훈련한 범위 안에서만 사용한다.','한 손 포구도 공 확보가 먼저다.'],
        ['R2·3루 도루','R2가 있어도 베이스에 붙어 타구 수비 범위를 포기하지 않습니다. 도루 스타트 시 태그 준비를 하되 CONTACT 순간 RESET합니다.','도루와 번트 가능성을 함께 본다.','SS와 3루 커버 약속을 경기 전에 맞춘다.'],
        ['번트 차지','내가 홈 쪽으로 차지하면 3루가 비므로 SS 등의 로테이션이 필요합니다. 선행주자 승부가 확실하지 않으면 1루 하나로 전환합니다.','공 잡는 야수보다 비는 베이스를 채우는 야수가 더 중요할 수 있다.','C·P·1B와 같은 공에 몰리지 않게 콜한다.'],
        ['R1·R2 포스','R1·R2에서는 3루에도 포스가 있습니다. 내 앞의 빠른 땅볼이면 가까운 3루 포스를 먼저 잡고 1루 연결을 볼 수 있습니다.','첫 아웃 성공률을 우선한다.','2아웃이면 가장 쉬운 포스 하나면 끝난다.']
      ],
      mistakes:['R2 때문에 베이스에 붙어 3·유간 타구를 포기함','느린 타구에서 송구 생각이 빨라 포구가 흔들림','번트 차지 후 3루가 비었는지 확인 안 함','라인만 과도하게 지켜 3·유간을 크게 비움'],
      practice:['강습 블로킹+첫 송구','슬로롤러 전진 포구 3종','R2 도루→CONTACT RESET 드릴']
    },
    ss: {
      intro:'유격수는 단순히 수비 범위가 넓은 선수가 아니라 OUT·RUNNER·FORCE와 다음 커버를 가장 먼저 정리하는 내야의 연결자입니다.',
      sections:[
        ['기본 위치·사전 판단','타자·3B 위치·R2·병살 가능성을 보고 깊이와 좌우를 조정합니다. 매 투구 전 “몇 아웃/어디 포스/내 공 아니면 어디?”를 짧게 확인합니다.','송구력으로 평범한 땅볼을 1루에서 잡을 수 있는 깊이가 상한선이다.','3B가 라인을 지키면 3·유간 책임이 늘어난다.'],
        ['땅볼·송구','정면·포핸드·백핸드를 타구에 맞게 선택하고, 포구 뒤 몸의 흐름을 1루 또는 2루 쪽으로 연결합니다.','급한 송구보다 공 확보와 균형이 먼저다.','깊은 타구는 필요하면 원바운드라도 정확하게 보낸다.'],
        ['병살·2루 커버','6-4-3에서는 2B가 피벗하기 좋은 가슴 높이 송구, 4-6-3에서는 2루 베이스로 들어가며 1루 연결 준비를 합니다.','도루 커버 담당과 병살 커버는 팀 약속을 맞춘다.','늦으면 병살을 버리고 한 아웃을 지킨다.'],
        ['R2·번트 로테이션','R2 상황에서 3B가 번트 차지하면 SS가 3루를 채우는 시스템이 흔합니다. 정확한 담당은 팀 약속이 우선입니다.','너무 일찍 3루로 빠지면 3·유간 타구를 내준다.','CONTACT 순간 다시 BALL FIRST를 판단한다.'],
        ['외야 컷·릴레이','LF·좌중간 타구에서는 외야 쪽으로 크게 이동해 목표 베이스와 외야수 사이 선을 만듭니다. 우측 타구에서는 2루/3루 커버나 뒤 주자를 책임질 수 있습니다.','컷 위치는 공 가까이가 아니라 송구선 위다.','컷 후에는 다시 베이스·뒤 주자를 확인한다.'],
        ['내야 지휘','짧고 행동 가능한 콜을 먼저 줍니다. “원아웃”, “병살 있어”, “둘”, “홈”, “컷”처럼 한 단어가 좋습니다.','실책 직후에는 원인 분석보다 현재 상황을 다시 알려준다.','팝업 우선권은 충돌 전에 크게 콜한다.']
      ],
      mistakes:['R1 도루 커버 생각으로 CONTACT 뒤 타구 첫발이 늦음','외야 타구에서 공만 쫓고 컷 라인을 만들지 못함','번트 때 3B와 같은 공으로 달려 3루가 빔','병살 욕심으로 첫 아웃까지 잃음'],
      practice:['OUT·RUNNER·FORCE 프리피치 콜 습관','6-4-3/4-6-3 양방향 연결','LF/LCF→3루·홈 릴레이 위치 반복']
    },
    lf: {
      intro:'좌익수는 잡은 공보다 잡지 못한 공을 얼마나 짧게 끝내는지가 중요합니다. 라인·좌중간·3루·홈이 한 플레이로 연결됩니다.',
      sections:[
        ['첫 스텝·깊이 판단','낮은 라인드라이브에 무조건 앞으로 첫발을 내지 않습니다. 정면 타구는 속도·각도를 보고 먼저 깊이를 판단합니다.','뒤로 빠지는 공의 비용이 앞의 단타보다 크다.','구장 펜스와 파울 지역을 경기 전 확인한다.'],
        ['좌선상·좌중간','라인 타구는 뒤로 보내지 않는 것이 먼저이고, 좌중간에서는 일반적으로 CF의 우선권 콜을 존중합니다. 양보한 뒤에는 즉시 뒤 백업으로 전환합니다.','둘 다 멈추는 것보다 한 명이 확실히 콜한다.','펜스 카롬 방향을 미리 확인한다.'],
        ['R2 좌전안타','포구 전 R2의 스타트와 타구 깊이를 보고 홈 승부 가능성을 판단합니다. 낮은 확률의 홈 송구보다 타자주자를 2루에 묶는 것이 나을 수 있습니다.','공을 잡으며 송구 방향을 결정한다.','홈 승부 시 컷맨·P 백업까지 한 세트로 본다.'],
        ['태그업·3루 백업','R3 외야플라이는 포구 전부터 송구 풋워크를 준비합니다. 3루 쪽 런다운·악송구에서는 3루 뒤 깊은 백업이 중요합니다.','잡은 뒤 멈춰 큰 송구를 만들지 않는다.','3루 베이스 바로 뒤가 아니라 빠진 공을 막을 깊이까지 간다.'],
        ['다른 외야수 타구','CF가 좌중간으로 가면 LF는 뒤를 받치고, 공이 우측으로 가면 반대편에서 추가 베이스와 악송구를 대비합니다.','공이 멀다고 플레이에서 빠지는 것이 아니다.','항상 다음 송구가 빠질 공간을 본다.']
      ],
      mistakes:['낮은 타구에 무조건 앞으로 달려 뒤로 빠뜨림','CF 콜 후 멈춰 백업을 하지 않음','잡자마자 무리한 홈 송구로 타자주자 2루 허용','런다운에서 3루 뒤 백업 없이 공 쪽으로 몰림'],
      practice:['정면 타구 첫 스텝 깊이 판단','좌전안타→홈/2루 두 가지 송구 선택','3루 뒤 악송구 백업 위치 달리기']
    },
    cf: {
      intro:'중견수는 외야의 유격수입니다. 가장 넓은 시야로 갭 우선권·두 코너 외야수 백업·중계 방향을 정리합니다.',
      sections:[
        ['기본 깊이·정면 타구','LF/RF보다 조금 깊은 위치에서 양쪽 갭을 봅니다. 정면 타구는 백스텝만 밟지 말고 방향을 정해 턴합니다.','강한 타자는 깊게, 약한 타자는 몇 걸음 전진한다.','자기 머리 위를 넘는 타구가 가장 비싼 실수다.'],
        ['갭 우선권','좌중간·우중간에서 콜을 일찍 하고 크게 합니다. 코너 외야수가 더 좋은 각도면 양보한 뒤 그 뒤를 백업합니다.','콜했으면 끝까지 책임진다.','두 명이 공으로 가는 것보다 한 명 공/한 명 백업이 낫다.'],
        ['중전안타·홈 송구','R2 중전안타에서는 홈 승부 성공률과 타자주자 추가 진루를 함께 계산합니다. 컷맨의 컷/노컷 콜을 듣습니다.','정면 단타라도 무조건 홈이 정답은 아니다.','낮고 정확한 송구가 강한 원바운드보다 낫다.'],
        ['양쪽 백업','LF/RF 타구에서 뒤로 빠진 공을 막는 마지막 외야 안전망입니다. 런다운에서는 2루 또는 외야 쪽 악송구 백업 위치를 맡을 수 있습니다.','공 처리 야수 바로 옆이 아니라 뒤의 실패 공간을 막는다.','다른 주자가 있으면 그 진루 경로도 본다.'],
        ['외야 지휘','애매한 공에 빠른 콜을 주고, 송구 목표를 내야 콜과 맞춥니다. 좋은 양보와 좋은 백업도 플레이입니다.','외야 셋이 같은 기준으로 “내꺼/너꺼”를 사용한다.','펜스·조명·바람 정보를 경기 초반 공유한다.']
      ],
      mistakes:['정면 타구에 백스텝만 밟아 낙하지점 늦음','갭 타구에서 콜이 늦어 둘 다 멈춤','코너 외야수 타구에서 백업 없이 구경함','홈송구 욕심으로 타자주자 추가 진루 허용'],
      practice:['정면 플라이 턴 드릴','좌중간/우중간 콜+백업 반복','중전안타 홈/2루 송구 의사결정 연습']
    },
    rf: {
      intro:'우익수는 우측 장타를 막는 외야수이면서 1루 악송구 백업과 R1의 3루 진루 억제라는 독특한 책임을 가집니다.',
      sections:[
        ['첫 스텝·우중간','우선상 타구는 뒤로 보내지 않는 것이 먼저입니다. 우중간은 CF의 콜과 자신의 각도를 동시에 봅니다.','라인에 너무 붙어 우중간을 크게 비우지 않는다.','CF가 잡으면 즉시 뒤 백업으로 전환한다.'],
        ['1루 악송구 백업','내야 땅볼이 나오면 1루 송구 가능성을 보고 충분한 깊이에서 백업 각도를 만듭니다. 1B 바로 뒤에 붙으면 악송구를 막을 수 없습니다.','송구가 정확해도 플레이 끝까지 이동을 유지한다.','백업 후 타자주자의 2루 진루까지 본다.'],
        ['R1 우전안타','포구 전 R1의 2루 통과 위치를 보고 3루 승부 여부를 판단합니다. 늦었다면 컷을 활용해 타자주자를 2루에 묶습니다.','강한 어깨보다 낮고 정확한 송구가 중요하다.','중계선에 2B가 들어올 시간을 고려한다.'],
        ['R2 우전안타','홈까지 거리가 길어 컷맨 가치가 큽니다. 무리한 직접 홈 송구보다 2B/SS 중계를 통해 공을 살리는 경우가 많습니다.','컷맨 콜을 듣고 노컷이면 목표에 정확히 던진다.','홈 송구 뒤 타자주자 2루 진루를 확인한다.'],
        ['런다운·반대편 역할','1↔2루 런다운에서는 RF가 1루 뒤 깊은 백업이 될 수 있습니다. 2↔3루 런다운에서는 공 쪽으로 몰리지 않고 반대 주자·1루·악송구를 관리합니다.','모든 외야수가 런다운 선 안으로 들어갈 필요는 없다.','자신이 막아야 할 실패 공간을 먼저 찾는다.']
      ],
      mistakes:['내야 땅볼 때 1루 백업을 생략함','1루 바로 뒤에 붙어 악송구를 막지 못함','R1 우전안타에서 3루 보살 욕심으로 높은 송구','CF 타구를 양보한 뒤 멈춤'],
      practice:['내야 땅볼→1루 백업 5방향 반복','RF→3루 송구와 컷 송구 비교','우중간 타구 CF 콜 후 백업 라인']
    }
  };

  function positionDeepHTML(id){
    const g=POS_DEEP[id]; if(!g)return '';
    return `<section class="v43-position-deep">
      <div class="v43-deep-head"><div><span>POSITION FUNDAMENTALS</span><h3>🧭 ${POS_GUIDE[id]?.title || id} 기본 수비 완전정리</h3></div><em>공이 안 와도 수비는 계속됩니다</em></div>
      <p class="v43-deep-intro">${g.intro}</p>
      <div class="v43-fund-grid">${g.sections.map((x,i)=>`<article class="v43-fund-card"><div class="idx">${String(i+1).padStart(2,'0')}</div><h4>${x[0]}</h4><p>${x[1]}</p><ul><li>${x[2]}</li><li>${x[3]}</li></ul></article>`).join('')}</div>
      <div class="v43-deep-bottom"><div><h4>⚠ 많이 하는 실수</h4><ul>${g.mistakes.map(x=>`<li>${x}</li>`).join('')}</ul></div><div><h4>🏋 경기 전에 연습할 것</h4><ul>${g.practice.map(x=>`<li>${x}</li>`).join('')}</ul></div></div>
    </section>`;
  }

  const LEARN_V43 = [
    {id:'0',title:'수비는 공을 잡기 전부터 시작된다',sub:'캐치볼과 경기 수비 사이의 차이',sections:[
      {h:'좋은 수비의 정의',body:'좋은 수비는 화려한 포구가 아니라 쉬운 아웃을 반복하고, 공이 나에게 오지 않아도 팀의 다음 플레이를 살리는 것입니다.',bullets:['위치·첫 스텝·판단·포구·송구·커버·백업·콜을 따로 본다.','안타가 됐다고 항상 나쁜 수비는 아니고 아웃이 됐다고 항상 좋은 판단도 아니다.'],tip:'수비 복기는 “결과”보다 “내가 어떤 정보를 보고 어디로 움직였는가”를 먼저 봅니다.'},
      {h:'사회인야구의 현실',body:'같은 포지션을 매주 서지 못하고 팀 훈련도 제한적이므로, 모든 상황을 실수해서 배우기보다 반복되는 원칙을 먼저 익히는 것이 효율적입니다.',bullets:['단순하고 모두가 기억할 수 있는 팀 약속이 복잡한 프로식 로테이션보다 강할 수 있다.','인조잔디·야간조명·젖은 공·작은 백스톱도 실제 수비 선택을 바꾼다.']},
      {h:'이 앱으로 배우는 순서',body:'먼저 기본 원칙을 이해하고, 다음으로 포지션 기본기, 마지막으로 상황 시뮬레이터를 반복해서 보는 방식이 좋습니다.',bullets:['읽기: 왜 움직이는지 이해','상황: 9명이 어떻게 연결되는지 확인','포지션 집중: 그중 내가 무엇을 해야 하는지 확인']}
    ]},
    {id:'1',title:'투구 전 5초 — OUT·RUNNER·FORCE',sub:'공이 오기 전에 첫 선택을 끝낸다',sections:[
      {h:'OUT',body:'아웃카운트는 수비 선택을 가장 크게 바꿉니다.',bullets:['0아웃: 아웃 하나의 가치가 크고 병살 기회가 남는다.','1아웃: 병살이면 이닝 종료가 될 수 있다.','2아웃: 대부분 가장 쉬운 아웃 하나면 끝난다.']},
      {h:'RUNNER와 FORCE',body:'주자가 어디 있는지뿐 아니라 그 주자가 강제로 다음 베이스로 가야 하는지를 봅니다.',bullets:['R1: 2루 포스','R1·R2: 3루까지 포스','만루: 홈까지 포스','R2 또는 R3만: 일반적으로 다음 베이스 포스가 아니다.'],tip:'투구 전에 “내게 땅볼 오면 어디?”를 한 번만 생각해도 실제 송구 판단이 빨라집니다.'},
      {h:'SCORE·BATTER·PLAY',body:'점수 상황과 타자 성향이 수비 깊이를 바꿉니다.',bullets:['한 점을 반드시 막아야 할 때만 전진수비를 선택한다.','빠른 타자에게는 너무 깊은 내야 수비가 내야안타를 늘릴 수 있다.','강한 타자는 외야를 몇 걸음 깊게 조정한다.']}
    ]},
    {id:'2',title:'기본 수비 위치와 첫 스텝',sub:'한 점이 아니라 범위와 각도를 잡는다',sections:[
      {h:'기본 위치는 “영역”이다',body:'정확한 좌표 하나보다 자신의 송구력·타구속도·구장 바운드 안에서 평범한 타구를 가장 많이 아웃시킬 수 있는 영역을 찾는 것이 중요합니다.',bullets:['내야: 너무 깊으면 송구 시간이 부족하고 너무 얕으면 강한 타구 반응 범위가 줄어든다.','외야: 앞의 단타보다 뒤로 빠지는 장타 비용이 크므로 기본적으로 뒤를 먼저 막는다.']},
      {h:'첫 스텝',body:'첫발은 빠르기보다 정확한 방향이 중요합니다.',bullets:['발뒤꿈치에 체중을 고정하지 않는다.','타구가 날아간 뒤 몸 전체가 한 번에 움직일 준비를 한다.','주자 움직임에 끌려가도 CONTACT 순간 다시 타구를 본다.']},
      {h:'상황에 따른 몇 걸음 조정',body:'병살·번트·전진·라인 보호·장타 방지처럼 목적이 명확할 때만 기본 위치에서 몇 걸음 이동합니다.',bullets:['조정 이유를 모르면 기본 위치로 돌아간다.','극단적 시프트보다 1~3걸음의 작은 조정이 사회인야구에서 재현성이 높다.']}
    ]},
    {id:'3',title:'땅볼 수비 — 바운드·포구·송구',sub:'공을 기다리지 말고 좋은 바운드를 만난다',sections:[
      {h:'좋은 바운드를 만나러 가기',body:'평범한 땅볼은 제자리에서 기다리기보다 공의 속도와 바운드를 읽고 좋은 지점으로 이동합니다.',bullets:['마지막 바운드가 애매하면 한 걸음 전진하거나 뒤로 물러 바운드를 바꾼다.','정면·포핸드·백핸드를 억지로 한 방식으로 통일하지 않는다.']},
      {h:'포구 뒤 발',body:'포구가 끝이 아니라 송구 방향으로 몸의 흐름을 이어야 합니다.',bullets:['1루 송구: 오른손잡이는 포구 뒤 오른발→왼발 정렬을 빠르게 만든다.','병살: 첫 송구 받을 야수의 이동선과 가슴 높이를 본다.']},
      {h:'느린 타구와 급한 타구',body:'느린 타구는 공격적으로, 강한 타구는 몸 앞에 막는 것이 우선일 수 있습니다.',bullets:['러닝스로는 평소 훈련한 범위 안에서만 사용한다.','강습 타구를 막아두는 것 자체가 실점을 줄이는 수비가 될 수 있다.']}
    ]},
    {id:'4',title:'플라이·외야 수비',sub:'낙하지점·우선권·포구 후 송구까지 한 플레이',sections:[
      {h:'정면 타구가 가장 어렵다',body:'외야 정면 타구는 좌우 이동 정보가 적어 깊이 판단이 어렵습니다.',bullets:['백스텝만 밟지 말고 방향을 정해 턴한다.','머리 위로 넘어가는 타구가 가장 큰 피해를 만든다.']},
      {h:'갭 우선권과 콜',body:'한 명이 공으로 가면 다른 한 명의 백업이 시작됩니다.',bullets:['CF가 일반적으로 가장 넓은 우선권을 가지되 팀 콜 시스템을 따른다.','양보한 외야수는 멈추지 말고 뒤쪽 실패 공간을 받친다.']},
      {h:'포구 후 다음 플레이',body:'R2·R3가 있으면 포구 전에 이미 송구 가능성을 계산합니다.',bullets:['태그업 가능성 확인','홈에서 잡기 어렵다면 뒤 주자 추가 진루 제한','컷맨과 일직선 송구를 만든다.']}
    ]},
    {id:'5',title:'송구와 포구 — 강함보다 정확함',sub:'공을 살리고 다음 베이스를 막는다',sections:[
      {h:'송구 목표',body:'강한 공보다 받는 야수가 다음 동작을 하기 좋은 공이 가치 있습니다.',bullets:['병살 송구는 피벗 야수의 가슴 또는 이동선','외야 송구는 컷맨이 처리 가능한 낮은 공','급한 악송구보다 한 베이스 제한이 낫다.']},
      {h:'1루 포구',body:'1B는 미리 스트레치하지 않고 송구 방향을 본 뒤 마지막에 뻗습니다.',bullets:['숏바운드는 글러브를 먼저 내려 올라오는 길을 막는다.','잡을 수 없는 악송구는 베이스보다 공을 살린다.']},
      {h:'송구가 빠졌을 때',body:'첫 실수 뒤 두 번째 실수를 막는 것이 중요합니다.',bullets:['BALL → RUNNER → BASE → NEXT','백업 야수는 베이스 바로 뒤가 아니라 빠진 공을 막을 깊이까지 간다.']}
    ]},
    {id:'6',title:'Base-Out 24상황 읽기',sub:'8개 주자 상태 × 3개 아웃카운트',sections:[
      {h:'R1',body:'0·1아웃에서는 병살 가능성을 보고, 2아웃에서는 가장 쉬운 포스 하나면 끝납니다.',bullets:['빠른 땅볼이면 선행주자부터','늦으면 1루 하나','도루 커버는 TEAM 약속']},
      {h:'R2·R3',body:'포스가 없는 득점권 상황에서는 아웃 하나와 추가 진루 제한의 균형이 중요합니다.',bullets:['R2 외야안타: 홈 승부 성공률과 타자주자 2루 진루를 함께 본다.','R3 0·1아웃: 점수를 반드시 막을지 아웃과 1점을 교환할지 전략을 정한다.']},
      {h:'R1·R2 / 만루',body:'가까운 포스 베이스가 늘어납니다.',bullets:['R1·R2: 3루에도 포스','만루: 홈 포함 모든 베이스 포스','2아웃: 가장 가까운 확실한 포스 하나']}
    ]},
    {id:'7',title:'9명이 움직이는 팀 디펜스',sub:'BALL / BASE / CUT / BACKUP / BACKSIDE',sections:[
      {h:'공 없는 야수의 역할',body:'공이 나에게 오지 않는 순간부터 베이스·중계·백업·반대편 역할이 시작됩니다.',bullets:['BALL: 공 처리','BASE: 다음 포스·태그 베이스','CUT: 송구선 연결','BACKUP: 악송구 실패 공간','BACKSIDE: 반대 주자·빈 베이스 관리']},
      {h:'컷오프와 릴레이',body:'컷맨은 외야수에게 가까운 사람이 아니라 목표 베이스와 공 사이의 선 위에 있는 사람입니다.',bullets:['좌측 외야는 SS가 컷에 들어가는 경우가 많다.','우측 외야는 2B가 컷에 들어가는 경우가 많다.','정확한 담당은 팀 시스템 우선.']},
      {h:'ROTATE와 RESET',body:'첫 송구가 끝나면 새로운 베이스가 비고 뒤 주자가 움직입니다.',bullets:['송구한 야수도 플레이에서 빠지지 않는다.','후속 야수가 앞자리를 채우고 기존 야수는 뒤 대열로 회전한다.','플레이 종료 후 다음 투구 기본 위치로 RESET한다.'],tip:'이 앱의 애니메이션에서 가장 중요하게 볼 것은 공보다 “공 없는 야수의 다음 움직임”입니다.'}
    ]},
    {id:'8',title:'병살·도루·히트앤런',sub:'CONTACT RESET이 필요한 대표 장면',sections:[
      {h:'병살',body:'병살은 두 아웃을 욕심내는 플레이가 아니라 첫 아웃이 빠르게 만들어졌을 때 두 번째 아웃이 따라오는 플레이입니다.',bullets:['첫 송구가 늦으면 1루 하나','피벗은 주자 슬라이딩 라인에서 빠져나온다.','2아웃이면 병살은 필요 없다.']},
      {h:'도루',body:'주자 스타트는 수비 임무를 바꾸지만 타격이 되면 다시 새 플레이입니다.',bullets:['RUNNER → CONTACT → RESET → BALL','커버 담당은 경기 전 확정','송구가 빠졌다면 다음 베이스부터 막는다.']},
      {h:'히트앤런',body:'도루보다 CONTACT 가능성이 높아 베이스 커버에 몸을 완전히 빼앗기면 안 됩니다.',bullets:['주자 스타트를 정보로만 사용','타격 순간 책임 타구 우선','내 공 아니면 다시 커버·백업']}
    ]},
    {id:'9',title:'번트·런다운·폭투',sub:'로테이션이 승부를 가르는 특수 플레이',sections:[
      {h:'번트',body:'한 명은 공으로, 나머지는 비는 베이스로 움직입니다.',bullets:['차지 야수가 비운 베이스를 누가 채울지 사전 약속','선행주자 아웃이 명확하지 않으면 1루 하나','P·C·1B·3B가 같은 공으로 몰리지 않기']},
      {h:'런다운',body:'공을 많이 주고받는 것이 아니라 주자가 움직일 공간을 줄이는 플레이입니다.',bullets:['CHASE → COMMIT → LATE THROW','송구한 야수는 후방 대열로 회전','다음 야수가 앞자리를 채움','외야수는 양쪽 베이스 뒤 악송구 백업']},
      {h:'폭투·포일',body:'R3가 있으면 C는 공, P는 홈으로 역할을 즉시 나눕니다.',bullets:['둘 다 공으로 가면 홈이 빈다.','포수는 공 확보 후 홈 송구 가능성 판단','늦으면 무리한 송구보다 추가 진루 차단']}
    ]},
    {id:'10',title:'포지션별 역할 연결',sub:'9개 포지션은 같은 원칙을 다른 각도에서 실행한다',sections:[
      {h:'배터리·코너 내야',body:'C는 정보를 정리하고 P는 투구 뒤 빈 공간을 채웁니다. 1B는 송구를 살리고 3B는 짧은 반응과 번트를 책임집니다.',bullets:['C: 콜·블로킹·홈','P: 1루커버·홈백업','1B: 송구 포구·홀딩','3B: 강습·번트·3루포스']},
      {h:'키스톤',body:'2B와 SS는 병살·도루·컷오프·빈 베이스에서 가장 많이 연결됩니다.',bullets:['2B: 우측 중계·1루커버','SS: 좌측 중계·3루 로테이션','둘 다 CONTACT RESET이 핵심']},
      {h:'외야 3인',body:'LF·CF·RF는 잡는 것뿐 아니라 뒤로 보내지 않고 단타를 단타로 끝내는 것이 핵심입니다.',bullets:['LF: 3루·홈 연결','CF: 갭 우선권·양쪽 백업','RF: 1루 악송구 백업·3루 송구']}
    ]},
    {id:'11',title:'실책 이후와 경기 전 루틴',sub:'첫 실수보다 다음 플레이를 살린다',sections:[
      {h:'ERROR RESET',body:'실책 순간 기술 분석을 시작하면 두 번째 실수가 나옵니다.',bullets:['BALL → RUNNER → BASE → NEXT','만회 송구보다 추가 진루 차단','플레이가 끝난 뒤에만 원인 복기']},
      {h:'경기 전 30초',body:'오늘 포지션에서 나올 가능성이 높은 상황 1~2개만 선명하게 준비합니다.',bullets:['기본 위치','몇 아웃/주자별 첫 선택','내 공 아니면 커버·백업 위치','팀 도루/번트/컷 약속']},
      {h:'경기 후 복기',body:'다음 경기 과제는 1~2개만 남깁니다.',bullets:['위치·첫 스텝·판단·포구·송구·커버·콜 중 어디서 문제가 시작됐는지 분류','공식 실책 숫자보다 반복되는 원인을 찾는다.']}
    ]}
  ];

  function learnSectionHTML(sec,i){
    return `<section class="v43-learn-section"><div class="v43-learn-num">${String(i+1).padStart(2,'0')}</div><div class="v43-learn-body"><h3>${sec.h}</h3><p>${sec.body}</p>${sec.bullets?.length?`<ul>${sec.bullets.map(x=>`<li>${x}</li>`).join('')}</ul>`:''}${sec.tip?`<div class="v43-learn-tip">💡 ${sec.tip}</div>`:''}</div></section>`;
  }

  if(typeof readView==='function'){
    readView=function(){
      crumb.textContent='HOME > 제대로 배우기';
      return `<section class="hero"><div class="eyebrow">BASEBALL DEFENSE COURSE</div><h2>제대로 배우기</h2><p class="lead">“어디로 가야 하지?”를 외우기 전에 왜 그렇게 움직이는지부터 이해합니다. 처음 보는 분은 PART 0부터, 경기 전 복습은 필요한 PART만 골라 보세요.</p></section>
        <section class="v43-roadmap"><div><b>처음 배우는 순서</b><span>0 → 1 → 2 → 3 → 6 → 7 → 10</span></div><div><b>경기 직전 복습</b><span>1 → 내 포지션 → 상황 시뮬레이터</span></div></section>
        <div class="v43-chapter-list">${LEARN_V43.map((p,i)=>`<button class="v43-chapter-card" data-go="chapter" data-param='{"id":"${p.id}"}'><span class="num">PART ${p.id}</span><b>${p.title}</b><span>${p.sub}</span><em>${p.sections.length}개 핵심 주제</em></button>`).join('')}</div>
        ${relatedButtons([{label:'내 포지션',route:'positions'},{label:'상황 시뮬레이터',route:'situations'},{label:'플레이',route:'plays'}])}`;
    };
  }

  if(typeof chapterView==='function'){
    chapterView=function(id){
      const p=LEARN_V43.find(x=>x.id===String(id))||LEARN_V43[0];
      const key=`chapter:${p.id}`; crumb.textContent=`PART ${p.id} > ${p.title}`; addRecent({key,title:`PART ${p.id} ${p.title}`});
      const idx=LEARN_V43.indexOf(p), prev=LEARN_V43[idx-1], next=LEARN_V43[idx+1];
      return `<section class="hero"><div class="eyebrow">PART ${p.id}</div><h1>${p.title}</h1><p class="lead">${p.sub}</p></section>
        <div class="v43-learn-wrap">${p.sections.map(learnSectionHTML).join('')}</div>
        ${p.id==='10'?`<div class="v43-position-links"><b>포지션별 상세 기본기 바로가기</b><div>${POSITIONS.map(x=>`<button data-go="position" data-param='{"id":"${x.id}"}'>${x.code} ${x.name}</button>`).join('')}</div></div>`:''}
        <div class="page-actions">${favButton(key,`PART ${p.id} ${p.title}`)}${shareButton(`PART ${p.id} ${p.title}`)}</div>
        <div class="v43-prevnext">${prev?`<button data-go="chapter" data-param='{"id":"${prev.id}"}'>← PART ${prev.id}<span>${prev.title}</span></button>`:'<span></span>'}${next?`<button data-go="chapter" data-param='{"id":"${next.id}"}'>PART ${next.id} →<span>${next.title}</span></button>`:'<span></span>'}</div>
        ${relatedButtons([{label:'전체 목차',route:'read'},{label:'상황 시뮬레이터',route:'situations'},{label:'내 포지션',route:'positions'}])}`;
    };
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

  /* 포지션 기본 위치 + 기본기 완전정리 삽입 */
  if (typeof positionView === 'function') {
    const oldPositionViewV4 = positionView;
    positionView = function(id) {
      let html = oldPositionViewV4(id);
      const marker = '<div class="sim-position-lab">';
      const detail = positionGuideHTML(id) + positionDeepHTML(id);
      if (html.includes(marker)) html = html.replace(marker, detail + marker);
      else html += detail;
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
      const zone=svg.querySelector(`[data-sim-zone="${name}"] ellipse`);
      const zlabel=svg.querySelector(`[data-sim-zone="${name}"] text`);
      if(zone){zone.setAttribute('cx',spec.next[0]);zone.setAttribute('cy',spec.next[1]);}
      if(zlabel){zlabel.setAttribute('x',spec.next[0]);zlabel.setAttribute('y',spec.next[1]-9);}
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

  /* 런다운 완전판 v4.2: 1↔2 / 2↔3 / 3↔홈 + 계속되는 회전 + 외야 안전망 */
  const RD_DEF = {
    '12': {
      label:'1루 ↔ 2루', runner:'R1', direction:'주자를 가능하면 1루 쪽으로 돌려보내며 공간을 줄이는 것이 기본적으로 안전합니다.',
      A:{name:'1B',base:[74,58]}, B:{name:'SS',base:[50,35]}, nextA:{name:'P',start:[50,62]}, nextB:{name:'2B',start:[62,43]},
      backups:[{name:'RF',start:[84.5,17],to:[90,63],label:'1루 뒤 깊은 백업'},{name:'CF',start:[50,6.5],to:[50,22],label:'2루 뒤 깊은 백업'},{name:'LF',start:[15.5,17],to:[20,23],label:'반대편·다른 주자'}],
      stays:['C는 홈과 다른 주자를 관리','3B는 3루와 다른 선행주자를 관리'],
      caution:'1루 쪽 악송구는 RF, 2루 쪽 악송구는 CF가 깊게 받칩니다. 다른 주자가 있으면 그 주자와 비는 베이스가 우선입니다.'
    },
    '23': {
      label:'2루 ↔ 3루', runner:'R2', direction:'가능하면 주자를 원래 베이스인 2루 쪽으로 몰아 실점권 진입을 막습니다.',
      A:{name:'3B',base:[26,58]}, B:{name:'SS',base:[50,35]}, nextA:{name:'P',start:[50,62]}, nextB:{name:'2B',start:[62,43]},
      backups:[{name:'LF',start:[15.5,17],to:[14,47],label:'3루 뒤 깊은 백업'},{name:'CF',start:[50,6.5],to:[50,22],label:'2루 뒤 깊은 백업'},{name:'RF',start:[84.5,17],to:[78,25],label:'반대편·다른 주자'}],
      stays:['C는 홈을 비우지 않고 다음 득점 가능성을 본다','1B는 1루와 타자주자/후속주자를 관리'],
      caution:'LF는 3루 뒤, CF는 2루 뒤가 핵심 안전망입니다. RF까지 런다운 선으로 몰려들 필요는 없습니다.'
    },
    '3H': {
      label:'3루 ↔ 홈', runner:'R3', direction:'득점을 막기 위해 가능하면 주자를 3루 쪽으로 돌려보내며 압박하는 것이 기본 방향입니다.',
      A:{name:'C',base:[50,84]}, B:{name:'3B',base:[26,58]}, nextA:{name:'P',start:[50,62]}, nextB:{name:'SS',start:[38,43]},
      backups:[{name:'1B',start:[74,58],to:[59,91],label:'홈 뒤 2차 안전망'},{name:'LF',start:[15.5,17],to:[14,47],label:'3루 뒤 깊은 백업'},{name:'CF',start:[50,6.5],to:[45,20],label:'다른 주자·2루측 안전망'}],
      stays:['2B는 2루와 다른 주자를 관리','RF는 1루·우측 반대편을 지켜 전원이 홈 쪽으로 몰리지 않게 한다'],
      caution:'홈 쪽 후속 수비는 P가 들어오고, P까지 런다운 선에 참여했다면 1B가 홈 뒤 안전망 역할을 준비할 수 있습니다. 정확한 회전은 팀 약속을 우선하세요.'
    }
  };

  const RD_POS = {C:[50,84],P:[50,62],'1B':[74,58],'2B':[62,43],'3B':[26,58],SS:[38,43],LF:[15.5,17],CF:[50,6.5],RF:[84.5,17]};
  const rdPoint=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];
  const rdBehind=(a,b,t=.12)=>[b[0]+(b[0]-a[0])*t,b[1]+(b[1]-a[1])*t];

  function rdPawn(name,coord,cls=''){
    return `<g data-rd-player="${name}" class="rd-pawn ${cls}" transform="translate(${coord[0]} ${coord[1]})"><circle r="3.8"/><text y="1.1" text-anchor="middle">${name}</text></g>`;
  }

  function rundownBoard(mode='23'){
    const d=RD_DEF[mode]||RD_DEF['23'];
    const active=new Set([d.A.name,d.B.name,d.nextA.name,d.nextB.name,...d.backups.map(x=>x.name)]);
    let pawns='';
    Object.entries(RD_POS).forEach(([name,pos])=>{
      let coord=pos, cls=active.has(name)?'involved':'muted';
      if(name===d.A.name) coord=d.A.base;
      if(name===d.B.name) coord=d.B.base;
      if(name===d.nextA.name) coord=d.nextA.start;
      if(name===d.nextB.name) coord=d.nextB.start;
      pawns+=rdPawn(name,coord,cls);
    });
    const runner=rdPoint(d.A.base,d.B.base,.42);
    return `<svg viewBox="0 0 100 100" aria-label="${d.label} 런다운 회전 애니메이션">
      <rect width="100" height="100" fill="#eef3e9"/>
      <path d="M50 88 L4 47 Q12 2 50 .8 Q88 2 96 47 L50 88" fill="#d7e5cf" stroke="#b8cbb3" stroke-width="1"/>
      <path d="M50 84 26 58 50 35 74 58Z" fill="#ead9b3" stroke="#c9b58c" stroke-width=".9"/>
      <path d="M50 84 L3.5 44 M50 84 L96.5 44" stroke="#fff" stroke-width="1"/>
      <rect x="71.5" y="55.5" width="5" height="5" transform="rotate(45 74 58)" fill="#fff"/><rect x="47.5" y="32.5" width="5" height="5" transform="rotate(45 50 35)" fill="#fff"/><rect x="23.5" y="55.5" width="5" height="5" transform="rotate(45 26 58)" fill="#fff"/><circle cx="50" cy="84" r="1.9" fill="#fff" stroke="#8f978f"/>
      <line x1="${d.A.base[0]}" y1="${d.A.base[1]}" x2="${d.B.base[0]}" y2="${d.B.base[1]}" class="rd-lane"/>
      ${d.backups.map(x=>`<line x1="${x.start[0]}" y1="${x.start[1]}" x2="${x.to[0]}" y2="${x.to[1]}" class="rd-backup-line"/><text x="${x.to[0]}" y="${x.to[1]-5}" text-anchor="middle" class="rd-backup-label">${x.label}</text>`).join('')}
      ${pawns}
      <g data-rd-runner class="rd-runner" transform="translate(${runner[0]} ${runner[1]})"><circle r="4"/><text y="1.1" text-anchor="middle">${d.runner}</text></g>
      <g data-rd-ball class="rd-ball" transform="translate(${d.A.base[0]} ${d.A.base[1]})"><circle r="1.8"/></g>
    </svg>`;
  }

  function rundownHTML42(mode='23'){
    const d=RD_DEF[mode]||RD_DEF['23'];
    return `<section class="v4-rundown v42-rundown" data-v42-rundown data-rd-mode="${mode}">
      <h3>🔁 런다운 완전판 · 앞의 두 명 + 다음 대기자 + 외야 안전망</h3>
      <div class="lead">런다운은 두 명만 공을 주고받는 플레이가 아닙니다. <b>송구한 야수는 송구를 따라 반대편 대열의 맨 뒤로 들어가고</b>, 뒤에서 기다리던 다음 야수가 빈 앞자리를 계속 채웁니다. 외야수는 양 베이스 뒤의 악송구 안전망을 만듭니다.</div>
      <div class="rd-mode-tabs">${Object.entries(RD_DEF).map(([k,v])=>`<button class="${k===mode?'active':''}" data-rd-mode-set="${k}">${v.label}</button>`).join('')}</div>
      <div class="rd-direction"><b>우선 방향</b><span>${d.direction}</span></div>
      <div class="v4-rundown-status" data-rd-status>BEFORE · ${d.A.name}가 공을 들고, ${d.B.name}가 반대쪽에서 받을 준비를 합니다.</div>
      <div class="v4-rundown-board" data-rd-board>${rundownBoard(mode)}</div>
      <div class="v4-rundown-controls"><button class="primary" data-rd42-action="play">▶ 계속되는 회전 천천히 보기</button><button data-rd42-action="reset">↻ 처음부터</button></div>
      <div class="v4-rundown-steps">
        <div class="v4-rundown-step"><b>0 · SAFETY NET</b>양쪽 베이스 뒤에는 외야 백업이 먼저 자리를 잡습니다. 다른 주자가 있으면 그 주자와 비는 베이스가 우선입니다.</div>
        <div class="v4-rundown-step"><b>1 · DRIVE</b>${d.A.name}가 공을 들고 주자를 반대 베이스 쪽으로 몰아 주자의 선택 공간을 줄입니다.</div>
        <div class="v4-rundown-step"><b>2 · LATE THROW</b>${d.B.name}가 충분히 가까워졌을 때 짧게 송구합니다. 멀리서 일찍 던지지 않습니다.</div>
        <div class="v4-rundown-step"><b>3 · FOLLOW & ROTATE</b>${d.A.name}는 던지고 멈추지 않고 송구를 따라 ${d.B.name} 뒤 대열로 들어갑니다. ${d.nextA.name}가 빈 반대쪽 앞자리를 채웁니다.</div>
        <div class="v4-rundown-step"><b>4 · NEXT MAN</b>${d.B.name}가 다시 몰고 ${d.nextA.name}에게 송구하면, ${d.nextB.name}가 다음 빈자리를 채웁니다.</div>
        <div class="v4-rundown-step"><b>5 · KEEP ROTATING</b>바로 태그가 안 되면 같은 순서로 앞자리를 계속 교대합니다. 태그 거리가 되면 더 이상 던지지 않습니다.</div>
      </div>
      <div class="v4-rundown-outfield">${d.backups.map(x=>`<div><b>${x.name}</b><span>${x.label}. 런다운 선 안으로 무작정 들어오기보다 빠진 공을 막는 깊이를 유지합니다.</span></div>`).join('')}</div>
      <div class="rd-stay"><b>공 쪽으로 몰려들지 않는 야수</b>${d.stays.map(x=>`<span>• ${x}</span>`).join('')}</div>
      <div class="sim-caution"><b>TEAM:</b> ${d.caution} 런다운의 공통 원칙은 <b>DRIVE → COMMIT → LATE THROW → FOLLOW → ROTATE → TAG</b>입니다.</div>
    </section>`;
  }

  if(typeof playView==='function'){
    const oldPlayViewV42=playView;
    playView=function(id){
      let html=oldPlayViewV42(id);
      if(id==='rundown'){
        const rd=rundownHTML42('23');
        if(/<section class="v4-rundown"[\s\S]*?<\/section>/.test(html)) html=html.replace(/<section class="v4-rundown"[\s\S]*?<\/section>/, rd);
        else { const mark='<div class="content-card">'; html=html.includes(mark)?html.replace(mark,rd+mark):html+rd; }
      }
      return html;
    };
  }

  function rdSet(el,x,y){el?.setAttribute('transform',`translate(${x} ${y})`);}
  function rdTween(el,a,b,dur){
    return new Promise(resolve=>{ if(!el){resolve();return;} const t0=performance.now();
      function f(now){const p=Math.min(1,(now-t0)/dur),e=p<.5?2*p*p:1-Math.pow(-2*p+2,2)/2;rdSet(el,a[0]+(b[0]-a[0])*e,a[1]+(b[1]-a[1])*e);p<1?requestAnimationFrame(f):resolve();} requestAnimationFrame(f); });
  }
  const rdWait=ms=>new Promise(r=>setTimeout(r,ms));

  function rdElements(root,d){
    const q=n=>root.querySelector(`[data-rd-player="${n}"]`);
    return {A:q(d.A.name),B:q(d.B.name),nextA:q(d.nextA.name),nextB:q(d.nextB.name),runner:root.querySelector('[data-rd-runner]'),ball:root.querySelector('[data-rd-ball]'),status:root.querySelector('[data-rd-status]'), backups:Object.fromEntries(d.backups.map(x=>[x.name,q(x.name)]))};
  }

  function rdReset42(root){
    const mode=root.dataset.rdMode||'23', d=RD_DEF[mode], board=root.querySelector('[data-rd-board]');
    if(board) board.innerHTML=rundownBoard(mode);
    const st=root.querySelector('[data-rd-status]'); if(st) st.textContent=`BEFORE · ${d.A.name}가 공을 들고, ${d.B.name}가 반대쪽에서 받을 준비를 합니다.`;
    root.dataset.running='0';
  }

  async function rdPlay42(root){
    if(root.dataset.running==='1')return;
    const mode=root.dataset.rdMode||'23', d=RD_DEF[mode]; rdReset42(root); root.dataset.running='1';
    const e=rdElements(root,d), A=d.A.base, B=d.B.base;
    const aChase=rdPoint(A,B,.43), rTowardB=rdPoint(A,B,.72), bChase=rdPoint(B,A,.43), rTowardA=rdPoint(B,A,.72), a2Chase=rdPoint(A,B,.48), r2TowardB=rdPoint(A,B,.78);
    await rdWait(700);
    e.status.textContent=`STEP 0 · SAFETY NET — 외야수들이 양쪽 베이스 뒤의 깊은 백업 위치로 이동합니다.`;
    await Promise.all(d.backups.map(x=>rdTween(e.backups[x.name],x.start,x.to,2100))); await rdWait(650);

    e.status.textContent=`STEP 1 · DRIVE — ${d.A.name}가 공을 들고 주자를 ${d.B.name} 쪽으로 몰아갑니다.`;
    await Promise.all([rdTween(e.A,A,aChase,2400),rdTween(e.ball,A,aChase,2400),rdTween(e.runner,rdPoint(A,B,.42),rTowardB,2400)]); await rdWait(650);

    e.status.textContent=`STEP 2 · LATE THROW — 주자가 방향을 확실히 잡은 뒤 ${d.B.name}에게 짧게 송구합니다.`;
    await rdTween(e.ball,aChase,B,1450); await rdWait(350);

    e.status.textContent=`STEP 3 · FOLLOW + ROTATE — ${d.A.name}는 송구를 따라 ${d.B.name} 뒤로, ${d.nextA.name}가 빈 ${d.A.name}쪽 앞자리를 채웁니다.`;
    await Promise.all([rdTween(e.A,aChase,rdBehind(A,B,.10),2100),rdTween(e.nextA,d.nextA.start,A,1900),rdTween(e.B,B,bChase,2300),rdTween(e.ball,B,bChase,2300),rdTween(e.runner,rTowardB,rTowardA,2300)]); await rdWait(650);

    e.status.textContent=`STEP 4 · NEXT THROW — ${d.B.name}가 다시 몰고 새 앞자리의 ${d.nextA.name}에게 늦게 송구합니다.`;
    await rdTween(e.ball,bChase,A,1450); await rdWait(350);

    e.status.textContent=`STEP 5 · KEEP ROTATING — ${d.B.name}는 ${d.nextA.name} 뒤 대열로 빠지고 ${d.nextB.name}가 반대쪽 앞자리를 채웁니다.`;
    await Promise.all([rdTween(e.B,bChase,rdBehind(B,A,.10),2050),rdTween(e.nextB,d.nextB.start,B,1850),rdTween(e.nextA,A,a2Chase,2200),rdTween(e.ball,A,a2Chase,2200),rdTween(e.runner,rTowardA,r2TowardB,2200)]); await rdWait(650);

    e.status.textContent=`STEP 6 · THIRD THROW — 바로 태그가 안 되면 ${d.nextA.name} → ${d.nextB.name}으로 다시 연결하고 같은 회전을 반복합니다.`;
    await rdTween(e.ball,a2Chase,B,1400); await rdWait(450);

    e.status.textContent='FINISH · 태그 거리가 되면 더 던지지 않습니다. 못 잡았으면 다음 대기자가 앞자리를 채우며 같은 회전을 계속합니다.';
    root.dataset.running='0';
  }

  document.addEventListener('click',e=>{
    const modeBtn=e.target.closest('[data-rd-mode-set]');
    if(modeBtn){const root=modeBtn.closest('[data-v42-rundown]');if(!root)return;root.dataset.rdMode=modeBtn.dataset.rdModeSet;root.querySelectorAll('[data-rd-mode-set]').forEach(b=>b.classList.toggle('active',b===modeBtn));const d=RD_DEF[root.dataset.rdMode];root.querySelector('.rd-direction span').textContent=d.direction;root.querySelector('.v4-rundown-steps').innerHTML=`<div class="v4-rundown-step"><b>0 · SAFETY NET</b>양쪽 베이스 뒤에는 외야 백업이 먼저 자리를 잡습니다.</div><div class="v4-rundown-step"><b>1 · DRIVE</b>${d.A.name}가 공을 들고 주자를 몰아갑니다.</div><div class="v4-rundown-step"><b>2 · LATE THROW</b>${d.B.name}가 가까워졌을 때 짧게 송구합니다.</div><div class="v4-rundown-step"><b>3 · FOLLOW & ROTATE</b>${d.A.name}는 송구를 따라가고 ${d.nextA.name}가 빈 앞자리를 채웁니다.</div><div class="v4-rundown-step"><b>4 · NEXT MAN</b>${d.B.name}가 다시 몰면 ${d.nextB.name}가 다음 빈자리를 채웁니다.</div><div class="v4-rundown-step"><b>5 · KEEP ROTATING</b>태그가 안 되면 같은 원리로 계속 교대합니다.</div>`;root.querySelector('.v4-rundown-outfield').innerHTML=d.backups.map(x=>`<div><b>${x.name}</b><span>${x.label}. 런다운 선 안으로 무작정 들어오기보다 빠진 공을 막는 깊이를 유지합니다.</span></div>`).join('');root.querySelector('.rd-stay').innerHTML=`<b>공 쪽으로 몰려들지 않는 야수</b>${d.stays.map(x=>`<span>• ${x}</span>`).join('')}`;root.querySelector('.sim-caution').innerHTML=`<b>TEAM:</b> ${d.caution} 런다운의 공통 원칙은 <b>DRIVE → COMMIT → LATE THROW → FOLLOW → ROTATE → TAG</b>입니다.`;rdReset42(root);return;}
    const b=e.target.closest('[data-rd42-action]');if(!b)return;const root=b.closest('[data-v42-rundown]');if(!root)return;b.dataset.rd42Action==='reset'?rdReset42(root):rdPlay42(root);
  });

  /* 현재 화면 재렌더 */
  try { if(typeof render==='function') render(); } catch(e) {}
  setTimeout(()=>patchCurrentBoards(document),50);
})();
