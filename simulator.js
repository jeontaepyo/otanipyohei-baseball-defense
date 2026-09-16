'use strict';

/*
 * 오태니표헤이의 사회인야구 수비의 디테일
 * Situation / Position Simulator v3
 *
 * 핵심 원칙
 * 1) 상황 = 주자 + 아웃 + 타구 종류 + 타구 방향의 팀 수비 시뮬레이션
 * 2) 플레이 = 도루/번트/런다운/컷오프 같은 특수 플레이
 * 3) 포지션 = 같은 상황을 '내 포지션' 중심으로 보기
 * 4) 애니메이션은 실제 속도보다 학습 가능한 속도를 우선
 */

(() => {
  const BASE_COORD = {
    H: [50, 84],
    1: [74, 58],
    2: [50, 35],
    3: [26, 58]
  };

  const DEF_DEFAULT = {
    C: [50, 84], P: [50, 62], '1B': [74, 58], '2B': [62, 43],
    '3B': [26, 58], SS: [38, 43], LF: [20, 24], CF: [50, 15], RF: [80, 24]
  };

  const BASE_MAP = Object.fromEntries(BASE_STATES.map(s => [s.id, s]));

  const KIND_META = {
    ground: { label: '땅볼', dirs: ['p', '1b', '2b', 'ss', '3b'] },
    single: { label: '외야 단타', dirs: ['lf', 'lcf', 'cf', 'rcf', 'rf'] },
    fly: { label: '외야 플라이', dirs: ['lf', 'lcf', 'cf', 'rcf', 'rf'] },
    gap: { label: '갭·장타', dirs: ['lf', 'lcf', 'cf', 'rcf', 'rf'] }
  };

  const DIR_META = {
    p: { label: 'P 앞', fielder: 'P', ground: [50, 64] },
    '1b': { label: '1B 쪽', fielder: '1B', ground: [69, 60] },
    '2b': { label: '2B 쪽', fielder: '2B', ground: [61, 49] },
    ss: { label: 'SS 쪽', fielder: 'SS', ground: [39, 49] },
    '3b': { label: '3B 쪽', fielder: '3B', ground: [31, 60] },
    lf: { label: 'LF', fielder: 'LF', single: [22, 30], fly: [20, 22], gap: [17, 17] },
    lcf: { label: '좌중간', fielder: 'CF', single: [36, 27], fly: [35, 20], gap: [33, 14] },
    cf: { label: 'CF', fielder: 'CF', single: [50, 27], fly: [50, 19], gap: [50, 12] },
    rcf: { label: '우중간', fielder: 'CF', single: [64, 27], fly: [65, 20], gap: [67, 14] },
    rf: { label: 'RF', fielder: 'RF', single: [78, 30], fly: [80, 22], gap: [83, 17] }
  };

  const ALIGN_META = {
    auto: { label: '자동', note: '주자·아웃에 맞춰 기본 깊이를 자동 조정합니다. 극단적인 전진수비는 자동으로 선택하지 않습니다.' },
    normal: { label: '기본', note: '가장 넓은 수비 범위와 평범한 아웃 성공률을 우선합니다.' },
    double: { label: '병살', note: 'R1이 있고 0·1아웃일 때 키스톤이 병살 연결을 준비하되 수비 범위를 과도하게 포기하지 않습니다.' },
    in: { label: '전진', note: 'R3의 한 점을 반드시 막아야 할 때 선택합니다. 강한 타구가 빠져나갈 위험이 커집니다.' },
    bunt: { label: '번트', note: '코너 내야수가 전진하고 SS·2B는 비는 베이스 로테이션을 준비합니다. 정확한 담당은 팀 약속이 우선입니다.' },
    deep: { label: '장타방지', note: '외야는 뒤를 막고 내야도 약간 깊게 서서 장타·갭 피해를 줄입니다.' },
    line: { label: '라인보호', note: '경기 후반 장타 한 베이스가 치명적일 때 1·3루선과 코너 외야 라인을 더 의식합니다.' }
  };

  const SPEED = {
    learn: { label: '🐢 학습', factor: 1 },
    normal: { label: '1×', factor: 0.72 },
    quick: { label: '빠르게', factor: 0.5 }
  };

  const FOCUS_LABELS = ['ALL', 'C', 'P', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF'];
  let simUid = 0;
  let runSerial = 0;

  const oldPositionView = positionView;
  const oldPositionTopic = positionTopic;
  const oldRouteTo = routeTo;

  function clonePos() {
    return Object.fromEntries(Object.entries(DEF_DEFAULT).map(([k, v]) => [k, [...v]]));
  }

  function hasBase(baseId, n) {
    return (BASE_MAP[baseId]?.bases || []).includes(n);
  }

  function autoAlignment(baseId, outs) {
    if (Number(outs) < 2 && hasBase(baseId, 1)) return 'double';
    return 'normal';
  }

  function defensivePositions(baseId, outs, align) {
    const p = clonePos();
    const resolved = align === 'auto' ? autoAlignment(baseId, outs) : align;

    if (hasBase(baseId, 1)) {
      p['1B'] = [72, 58];
    }
    if (hasBase(baseId, 2)) {
      p['3B'] = [28, 58];
      p.SS = [39, 43];
    }

    if (resolved === 'double') {
      p['2B'] = [59, 45];
      p.SS = [41, 45];
      if (hasBase(baseId, 1)) p['1B'] = [72, 58];
    }

    if (resolved === 'in') {
      p['1B'] = [69, 64];
      p['2B'] = [60, 52];
      p.SS = [40, 52];
      p['3B'] = [31, 64];
    }

    if (resolved === 'bunt') {
      p['1B'] = [65, 68];
      p['3B'] = [35, 68];
      p['2B'] = [61, 48];
      p.SS = [39, 48];
      p.P = [50, 63];
    }

    if (resolved === 'deep') {
      p['1B'] = [75, 55];
      p['2B'] = [63, 40];
      p.SS = [37, 40];
      p['3B'] = [25, 55];
      p.LF = [18, 18];
      p.CF = [50, 10];
      p.RF = [82, 18];
    }

    if (resolved === 'line') {
      p['1B'] = [78, 57];
      p['3B'] = [22, 57];
      p['2B'] = [61, 43];
      p.SS = [39, 43];
      p.LF = [14, 24];
      p.RF = [86, 24];
    }

    return { positions: p, resolved, note: ALIGN_META[resolved]?.note || ALIGN_META.normal.note };
  }

  function baseRoles() {
    return {
      C: '홈과 주자를 함께 보며 다음 송구를 콜하고 홈 승부를 준비한다.',
      P: '타구를 처리하지 않으면 비는 베이스와 악송구 백업을 찾는다.',
      '1B': '1루 아웃과 우측 타구의 빈 베이스를 우선 확인한다.',
      '2B': '2루 커버·병살·1루 커버·우측 중계를 동시에 읽는다.',
      '3B': '3루 베이스와 짧은 타구, 선행주자 진루를 함께 본다.',
      SS: '2루·3루 커버와 컷오프, 내야의 다음 연결을 가장 먼저 읽는다.',
      LF: '좌측 타구 처리 또는 뒤 백업. 단타를 장타로 만들지 않는다.',
      CF: '외야 갭의 우선권과 양 코너 외야수 뒤 백업을 담당한다.',
      RF: '우측 타구 처리와 1루 악송구 백업, 3루 진루 억제를 본다.'
    };
  }

  function addMove(s, name, to, role, timing = 'contact') {
    if (!name || !DEF_DEFAULT[name]) return;
    const found = s.moves.find(m => m.name === name);
    if (found) {
      found.to = [...to];
      found.role = role || found.role;
      found.timing = timing || found.timing;
    } else {
      s.moves.push({ name, from: [...s.start[name]], to: [...to], role, timing });
    }
    if (role) s.roles[name] = role;
  }

  function addRunner(s, name, from, to, role, timing = 'contact') {
    s.runners.push({ name, from: [...from], to: [...to], role, timing });
  }

  function addThrow(s, from, to, label = '') {
    s.throws.push({ from: [...from], to: [...to], label });
  }

  function setRole(s, name, role) {
    if (role) s.roles[name] = role;
  }

  function runnerStart(base) {
    if (base === 1) return [74, 58];
    if (base === 2) return [50, 35];
    if (base === 3) return [26, 58];
    return [51.5, 81.5];
  }

  function buildGroundScenario(s, dir) {
    const meta = DIR_META[dir];
    const fielder = meta.fielder;
    const target = meta.ground;
    const outs = s.outs;
    const bases = s.bases;
    const has1 = bases.includes(1);
    const has2 = bases.includes(2);
    const has3 = bases.includes(3);

    s.ball = { from: [50, 82], to: [...target] };
    addMove(s, fielder, target, '타구를 가장 먼저 처리한다. 공을 잡은 뒤 주자보다 먼저 아웃 경로를 확인한다.');

    // 타자주자
    addRunner(s, 'BR', [51.5, 81.5], BASE_COORD[1], '타격과 동시에 1루로 달린다.');

    // 강제 진루 주자
    if (has1) addRunner(s, 'R1', runnerStart(1), BASE_COORD[2], 'R1은 타격과 동시에 2루로 진루한다.');
    if (has2 && has1) addRunner(s, 'R2', runnerStart(2), BASE_COORD[3], 'R2는 포스 상황이면 3루로 진루한다.');
    if (has3 && has2 && has1) addRunner(s, 'R3', runnerStart(3), BASE_COORD.H, '만루 포스 상황에서는 R3도 홈으로 진루한다.');

    // R1 + 0/1아웃: 대표적인 병살 경로
    if (has1 && outs < 2) {
      // R1·R2에서 3B 정면 타구는 가까운 3루 포스를 대표안으로 보여준다.
      if (has2 && fielder === '3B') {
        addMove(s, '3B', [27, 58], '3루에 가까운 타구라면 먼저 3루 포스를 확보하고 1루 연결을 본다.');
        const firstReceiver = '1B';
        setRole(s, firstReceiver, '1루 베이스를 지키며 두 번째 아웃 송구를 준비한다.');
        addThrow(s, [27, 58], BASE_COORD[1], '3B → 1B');
        addMove(s, 'RF', [88, 66], '1루 악송구가 빠질 깊이에서 백업한다.');
        addMove(s, 'LF', [17, 62], '3루 포스 뒤 악송구·추가 플레이를 백업한다.');
        addMove(s, 'SS', [36, 48], '3루수가 베이스를 처리하는 동안 2루·3루 사이 다음 플레이를 준비한다.');
        s.headline = '3루 포스가 가까우면 첫 아웃을 3루에서 확보할 수 있다.';
        s.caution = '3루 포스가 명확하지 않은 느린 타구라면 억지로 선행주자를 잡지 말고 1루 아웃으로 전환하세요.';
      } else {
        let cover2 = 'SS';
        if (fielder === '2B') cover2 = 'SS';
        else if (fielder === 'SS' || fielder === '3B') cover2 = '2B';
        else if (fielder === '1B') cover2 = 'SS';
        else if (fielder === 'P') cover2 = 'SS';

        const firstReceiver = fielder === '1B' ? 'P' : '1B';
        addMove(s, cover2, BASE_COORD[2], '2루 포스 베이스를 커버해 첫 아웃을 만든 뒤 1루 연결을 준비한다.');
        if (firstReceiver === 'P') {
          addMove(s, 'P', BASE_COORD[1], '1B가 타구를 처리했으므로 즉시 1루 베이스를 커버한다.');
        } else {
          setRole(s, '1B', '1루 베이스를 지키며 병살의 두 번째 송구를 준비한다.');
        }
        addThrow(s, target, BASE_COORD[2], `${fielder} → ${cover2}`);
        addThrow(s, BASE_COORD[2], BASE_COORD[1], `${cover2} → ${firstReceiver}`);
        addMove(s, 'CF', [50, 27], '2루 악송구가 빠질 수 있는 방향을 백업한다.');
        addMove(s, 'RF', [88, 66], '1루 최종 송구가 빠질 깊이에서 백업한다.');
        if (fielder !== '3B') setRole(s, '3B', '3루 베이스와 선행주자 추가 진루를 지킨다.');
        setRole(s, 'C', '홈을 지키며 선행주자와 송구 방향을 콜한다.');
        s.headline = 'R1 + 0·1아웃은 첫 아웃을 2루에서 만든 뒤 1루 연결을 본다.';
        s.caution = '공이 느리거나 첫 송구가 늦었다면 병살 욕심을 버리고 1루 하나로 전환하는 것이 기본입니다.';
      }
    } else {
      const firstReceiver = fielder === '1B' ? 'P' : '1B';
      if (firstReceiver === 'P') {
        addMove(s, 'P', BASE_COORD[1], '1B가 타구를 처리했으므로 1루 베이스를 커버한다.');
      } else {
        setRole(s, '1B', '1루 베이스를 지키고 타자주자 아웃을 준비한다.');
        if (fielder !== 'P') addMove(s, 'P', [80, 66], '1루 송구가 빠질 경우를 대비해 뒤쪽 백업으로 이동한다.');
      }
      addThrow(s, target, BASE_COORD[1], `${fielder} → ${firstReceiver}`);
      addMove(s, 'RF', [89, 66], '1루 악송구를 막기 위해 충분한 깊이에서 백업한다.');
      s.headline = outs === 2 ? '2아웃에서는 가장 쉬운 1루 아웃 하나로 이닝을 끝낸다.' : '선행주자 승부가 확실하지 않으면 1루 아웃을 우선한다.';

      if (has1 && outs === 2) {
        // 이미 R1 이동은 추가됨
      }
      if (has2 && !has1) {
        const rightSide = ['p', '1b', '2b'].includes(dir);
        addRunner(s, 'R2', runnerStart(2), rightSide ? BASE_COORD[3] : runnerStart(2), rightSide ? '우측 땅볼이면 3루 진루를 시도할 수 있다.' : '좌측 땅볼에서는 타구가 앞에 있어 무리한 3루 진루를 피하는 것이 기본이다.');
      }
      if (has3 && !has2 && !has1) {
        addRunner(s, 'R3', runnerStart(3), outs === 2 ? BASE_COORD.H : runnerStart(3), outs === 2 ? '2아웃이므로 타격과 동시에 홈으로 스타트한다.' : 'R3의 홈 스타트는 타구 강도·수비 깊이·점수 상황을 보고 결정한다.');
        if (outs < 2) s.caution = 'R3가 있어도 모든 땅볼에 홈 승부를 하는 것은 아닙니다. 전진수비 여부와 타구 강도를 먼저 보세요.';
      }
    }

    // 빈 베이스/백업 기본 역할
    if (!s.moves.some(m => m.name === 'LF')) setRole(s, 'LF', '좌측 악송구와 3루 방향 추가 진루를 읽으며 다음 백업 위치를 잡는다.');
    if (!s.moves.some(m => m.name === 'CF')) setRole(s, 'CF', '2루 뒤쪽과 내야 송구가 빠질 방향을 읽어 백업한다.');
  }

  function outfieldPrimary(dir) {
    if (dir === 'lf') return { primary: 'LF', backups: ['CF'] };
    if (dir === 'rf') return { primary: 'RF', backups: ['CF'] };
    if (dir === 'lcf') return { primary: 'CF', backups: ['LF'] };
    if (dir === 'rcf') return { primary: 'CF', backups: ['RF'] };
    return { primary: 'CF', backups: ['LF', 'RF'] };
  }

  function outfieldTarget(kind, dir) {
    return [...(DIR_META[dir][kind] || DIR_META[dir].single)];
  }

  function relaySide(dir) {
    if (dir === 'lf' || dir === 'lcf') return { cut: 'SS', other: '2B' };
    if (dir === 'rf' || dir === 'rcf') return { cut: '2B', other: 'SS' };
    return { cut: 'SS', other: '2B' };
  }

  function midpoint(a, b, t = 0.48) {
    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  }

  function addOutfieldBackupMoves(s, dir, primary) {
    if (primary === 'LF') addMove(s, 'CF', [31, 20], 'LF 뒤쪽으로 이동해 빠지는 공과 펜스 카롬을 백업한다.');
    if (primary === 'RF') addMove(s, 'CF', [69, 20], 'RF 뒤쪽으로 이동해 빠지는 공과 펜스 카롬을 백업한다.');
    if (primary === 'CF') {
      if (dir === 'lcf') addMove(s, 'LF', [31, 18], 'CF가 처리하는 좌중간 타구 뒤를 백업한다.');
      else if (dir === 'rcf') addMove(s, 'RF', [69, 18], 'CF가 처리하는 우중간 타구 뒤를 백업한다.');
      else {
        addMove(s, 'LF', [35, 18], '중견수 뒤 왼쪽 공간을 백업한다.');
        addMove(s, 'RF', [65, 18], '중견수 뒤 오른쪽 공간을 백업한다.');
      }
    }
  }

  function addRelayToBase(s, fieldTarget, dir, targetBase, targetLabel, directToSecond = false) {
    const side = relaySide(dir);
    const dest = BASE_COORD[targetBase];

    if (directToSecond) {
      addMove(s, side.other, BASE_COORD[2], '2루 베이스를 커버해 타자주자의 추가 진루를 막는다.');
      setRole(s, side.cut, '중계선과 뒤 주자를 읽으며 필요하면 송구를 컷한다.');
      addThrow(s, fieldTarget, BASE_COORD[2], `OF → ${side.other}`);
      return;
    }

    const cutPos = midpoint(fieldTarget, dest, targetBase === 'H' ? 0.5 : 0.47);
    addMove(s, side.cut, cutPos, `${targetLabel} 송구선에 들어가 컷·릴레이를 준비한다.`);
    addThrow(s, fieldTarget, cutPos, `OF → ${side.cut}`);
    addThrow(s, cutPos, dest, `${side.cut} → ${targetLabel}`);

    if (targetBase === 'H') {
      setRole(s, 'C', '홈 베이스에서 송구를 받으며 주자와 공의 충돌 지점을 관리한다.');
      addMove(s, 'P', [50, 92], '홈 송구가 빠질 수 있는 충분한 깊이로 백업한다.');
      setRole(s, side.other, '2루 베이스와 뒤 주자의 추가 진루를 관리한다.');
    } else if (targetBase === 3) {
      setRole(s, '3B', '3루 베이스를 지키며 태그 플레이를 준비한다.');
      addMove(s, 'P', [19, 65], '3루 송구가 빠질 경우를 대비해 뒤쪽을 백업한다.');
      setRole(s, side.other, '2루 베이스와 타자주자의 추가 진루를 관리한다.');
    }
  }

  function addSingleRunners(s, dir) {
    const bases = s.bases;
    if (bases.includes(3)) addRunner(s, 'R3', runnerStart(3), BASE_COORD.H, '안타가 되면 R3는 홈으로 진루한다.');
    if (bases.includes(2)) addRunner(s, 'R2', runnerStart(2), BASE_COORD.H, 'R2는 외야 안타에서 홈을 적극적으로 노린다.');
    if (bases.includes(1)) {
      const toThird = (dir === 'rf' || dir === 'rcf' || s.outs === 2) && !bases.includes(2);
      addRunner(s, 'R1', runnerStart(1), toThird ? BASE_COORD[3] : BASE_COORD[2], toThird ? '우측 안타 또는 2아웃에서는 R1의 3루 진루 가능성이 커진다.' : '기본적으로 한 베이스를 확보하고 다음 송구를 본다.');
    }
    addRunner(s, 'BR', [51.5, 81.5], BASE_COORD[1], '타자주자는 1루를 밟은 뒤 외야 송구 방향을 본다.');
  }

  function buildSingleScenario(s, dir) {
    const { primary } = outfieldPrimary(dir);
    const fieldTarget = outfieldTarget('single', dir);
    const bases = s.bases;
    const has2 = bases.includes(2);
    const has3 = bases.includes(3);
    const has1 = bases.includes(1);

    s.ball = { from: [50, 82], to: fieldTarget };
    addMove(s, primary, fieldTarget, '타구를 안전하게 앞에 두고 포구해 단타를 단타로 끝낸다.');
    addOutfieldBackupMoves(s, dir, primary);
    addSingleRunners(s, dir);

    if (has2) {
      addRelayToBase(s, fieldTarget, dir, 'H', 'HOME');
      s.headline = 'R2가 있으면 외야수–컷맨–홈의 송구선과 P의 홈 백업이 핵심이다.';
      s.caution = '홈에서 잡을 확률이 낮으면 무리한 홈 승부보다 타자주자와 뒤 주자의 추가 진루를 막는 선택이 더 좋을 수 있습니다.';
    } else if (has1 && (dir === 'rf' || dir === 'rcf' || s.outs === 2)) {
      addRelayToBase(s, fieldTarget, dir, 3, '3B');
      s.headline = 'R1의 3루 진루가 위협적이면 3루 송구선을 먼저 만든다.';
      s.caution = '3루에서 이미 늦었다면 송구를 컷해 타자주자를 2루에 묶는 것이 더 가치 있을 수 있습니다.';
    } else {
      addRelayToBase(s, fieldTarget, dir, 2, '2B', true);
      s.headline = has3 ? '선행주자가 득점한 뒤에는 타자주자의 2루 진루를 끊는다.' : '선행주자 승부가 없으면 공을 2루 쪽으로 모아 추가 베이스를 막는다.';
    }

    if (has3 && !has2) setRole(s, 'C', 'R3 득점을 확인한 뒤 뒤 주자와 다음 송구를 지휘한다.');
    s.caution = s.caution || '컷맨 담당과 직접송구/컷 여부는 팀 시스템에 따라 달라질 수 있습니다.';
  }

  function addFlyRunners(s) {
    if (s.outs === 2) {
      if (s.bases.includes(1)) addRunner(s, 'R1', runnerStart(1), runnerStart(1), '2아웃에서는 포구되면 이닝 종료이므로 태그업 진루는 의미가 없다.', 'afterCatch');
      if (s.bases.includes(2)) addRunner(s, 'R2', runnerStart(2), runnerStart(2), '2아웃에서는 포구되면 이닝 종료.', 'afterCatch');
      if (s.bases.includes(3)) addRunner(s, 'R3', runnerStart(3), runnerStart(3), '2아웃에서는 포구되면 이닝 종료.', 'afterCatch');
      return;
    }
    if (s.bases.includes(3)) addRunner(s, 'R3', runnerStart(3), BASE_COORD.H, '포구 확인 후 홈 태그업을 시도한다.', 'afterCatch');
    if (s.bases.includes(2)) addRunner(s, 'R2', runnerStart(2), BASE_COORD[3], '포구 확인 후 3루 태그업 가능성을 본다.', 'afterCatch');
    if (s.bases.includes(1) && !s.bases.includes(2)) addRunner(s, 'R1', runnerStart(1), BASE_COORD[2], '충분히 깊은 플라이라면 2루 태그업을 시도할 수 있다.', 'afterCatch');
  }

  function buildFlyScenario(s, dir) {
    const { primary } = outfieldPrimary(dir);
    const fieldTarget = outfieldTarget('fly', dir);
    s.ball = { from: [50, 82], to: fieldTarget };
    s.runnerTiming = 'afterCatch';
    s.throwTiming = 'afterCatch';

    addMove(s, primary, fieldTarget, '낙하지점을 먼저 잡고 포구 전부터 송구 풋워크를 준비한다.');
    addOutfieldBackupMoves(s, dir, primary);
    addFlyRunners(s);

    if (s.outs === 2) {
      addRelayToBase(s, fieldTarget, dir, 2, '2B', true);
      s.headline = '2아웃 플라이는 포구 자체가 이닝 종료다. 가장 먼저 공을 확실히 잡는다.';
      s.caution = '2아웃에서는 태그업 송구보다 포구 성공률이 우선입니다.';
    } else if (s.bases.includes(3)) {
      addRelayToBase(s, fieldTarget, dir, 'H', 'HOME');
      s.headline = 'R3가 있으면 포구 전에 이미 홈 송구까지 준비해야 한다.';
      s.caution = '홈에서 잡기 어려운 깊이라면 무리한 송구로 뒤 주자까지 진루시키지 않는 판단이 필요합니다.';
    } else if (s.bases.includes(2)) {
      addRelayToBase(s, fieldTarget, dir, 3, '3B');
      s.headline = 'R2의 태그업 3루 진루를 억제할 수 있도록 3루 송구선을 만든다.';
    } else {
      addRelayToBase(s, fieldTarget, dir, 2, '2B', true);
      s.headline = '포구 후 공을 내야로 빠르게 돌려 추가 진루 가능성을 없앤다.';
    }
  }

  function buildGapScenario(s, dir) {
    const { primary } = outfieldPrimary(dir);
    const fieldTarget = outfieldTarget('gap', dir);
    s.ball = { from: [50, 82], to: fieldTarget };
    addMove(s, primary, fieldTarget, '갭 타구를 끝까지 따라가되 무리한 다이빙보다 뒤로 빠지는 공의 피해를 줄인다.');
    addOutfieldBackupMoves(s, dir, primary);

    if (s.bases.includes(3)) addRunner(s, 'R3', runnerStart(3), BASE_COORD.H, 'R3는 득점한다.');
    if (s.bases.includes(2)) addRunner(s, 'R2', runnerStart(2), BASE_COORD.H, 'R2는 장타에서 홈까지 간다.');
    if (s.bases.includes(1)) addRunner(s, 'R1', runnerStart(1), s.outs === 2 ? BASE_COORD.H : BASE_COORD[3], s.outs === 2 ? '2아웃 장타에서는 R1도 홈까지 적극적으로 간다.' : 'R1은 최소 3루까지 진루를 노린다.');
    addRunner(s, 'BR', [51.5, 81.5], BASE_COORD[2], '타자주자는 2루까지 적극적으로 진루한다.');

    if (s.bases.includes(2) || (s.bases.includes(1) && s.outs === 2)) {
      addRelayToBase(s, fieldTarget, dir, 'H', 'HOME');
      s.headline = '장타에서는 가장 빠른 릴레이 라인을 만들어 홈 실점과 추가 진루를 동시에 제한한다.';
    } else {
      addRelayToBase(s, fieldTarget, dir, 3, '3B');
      s.headline = '주자 없는 장타도 타자주자의 3루 진루를 막는 릴레이가 중요하다.';
    }
    s.caution = '펜스 거리·카롬·외야수 어깨에 따라 실제 중계 위치는 달라집니다. 팀의 컷·릴레이 약속을 우선하세요.';
  }

  function buildScenario(opts = {}) {
    const base = BASE_MAP[opts.base] ? opts.base : 'r1';
    const outs = [0, 1, 2].includes(Number(opts.outs)) ? Number(opts.outs) : 0;
    const kind = KIND_META[opts.kind] ? opts.kind : 'ground';
    const validDirs = KIND_META[kind].dirs;
    const dir = validDirs.includes(opts.dir) ? opts.dir : validDirs[0];
    const align = ALIGN_META[opts.align] ? opts.align : 'auto';
    const focus = FOCUS_LABELS.includes(opts.focus) ? opts.focus : 'ALL';
    const pos = defensivePositions(base, outs, align);
    const stateInfo = BASE_MAP[base];
    const bo = (BO[base] || BO.empty)[outs] || BO.empty[outs];

    const s = {
      base, outs, kind, dir, align, focus,
      bases: [...stateInfo.bases],
      start: pos.positions,
      alignmentResolved: pos.resolved,
      alignmentNote: pos.note,
      title: `${outs} OUT · ${stateInfo.name} · ${KIND_META[kind].label} · ${DIR_META[dir].label}`,
      headline: bo[0],
      baseoutDetail: bo[1],
      moves: [], runners: [], throws: [], roles: baseRoles(),
      ball: null, runnerTiming: 'contact', throwTiming: 'afterField', caution: ''
    };

    if (kind === 'ground') buildGroundScenario(s, dir);
    if (kind === 'single') buildSingleScenario(s, dir);
    if (kind === 'fly') buildFlyScenario(s, dir);
    if (kind === 'gap') buildGapScenario(s, dir);

    if ((base === 'r3' || base === 'r23') && outs < 2 && align === 'auto') {
      s.caution += `${s.caution ? ' ' : ''}R3 상황에서 전진수비는 자동으로 선택하지 않았습니다. 점수·이닝·타자·내야 수비력에 따라 직접 선택하세요.`;
    }
    if (base === 'loaded' && outs < 2 && kind === 'ground') {
      s.caution += `${s.caution ? ' ' : ''}만루 땅볼은 홈·2루·1루 중 성공확률이 가장 높은 포스를 선택해야 합니다. 애니메이션은 대표 경로이며 유일한 정답이 아닙니다.`;
    }

    return s;
  }

  function markerDefs(uid) {
    return `<defs>
      <marker id="simB-${uid}" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#3d6eb4"/></marker>
      <marker id="simG-${uid}" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#39895c"/></marker>
      <marker id="simO-${uid}" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#d87b2b"/></marker>
      <marker id="simR-${uid}" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#c84a3d"/></marker>
    </defs>`;
  }

  function fieldBaseSVG() {
    return `
      <rect width="100" height="100" rx="5" fill="#eef3e9"/>
      <path d="M50 86 L10 48 Q18 8 50 5 Q82 8 90 48 L50 86" fill="#d7e5cf" stroke="#b8cbb3" stroke-width=".7"/>
      <path d="M50 84 26 58 50 35 74 58Z" fill="#ead9b3" stroke="#c9b58c" stroke-width=".8"/>
      <path d="M50 84 50 35 M26 58 74 58" stroke="#cfb995" stroke-width=".5" opacity=".65"/>
      <circle cx="50" cy="62" r="2.5" fill="#d6bf91"/>
      <circle cx="50" cy="84" r="1.8" fill="#fff" stroke="#8f978f"/>
      <rect x="71.5" y="55.5" width="5" height="5" transform="rotate(45 74 58)" fill="#fff" stroke="#9da39c" stroke-width=".4"/>
      <rect x="47.5" y="32.5" width="5" height="5" transform="rotate(45 50 35)" fill="#fff" stroke="#9da39c" stroke-width=".4"/>
      <rect x="23.5" y="55.5" width="5" height="5" transform="rotate(45 26 58)" fill="#fff" stroke="#9da39c" stroke-width=".4"/>
      <path d="M50 84 L9 47 M50 84 L91 47" stroke="#fff" stroke-width=".7" opacity=".8"/>
    `;
  }

  function pawnSVG(name, from, to, involved, focus) {
    const [x, y] = from;
    const [x2, y2] = to || from;
    const isFocus = focus === name;
    const muted = focus !== 'ALL' && !isFocus;
    const scale = isFocus ? 1.23 : involved ? 1.08 : 1;
    return `
      <g class="sim-pawn fielder ${involved ? 'is-involved' : ''} ${isFocus ? 'is-focus' : ''} ${muted ? 'is-muted' : ''}"
         data-sim-player="${name}" data-x1="${x}" data-y1="${y}" data-x2="${x2}" data-y2="${y2}"
         transform="translate(${x} ${y})">
        ${isFocus ? `<circle class="sim-focus-ring" cx="0" cy="0" r="6.5"/>` : ''}
        <g transform="scale(${scale})">
          <circle class="pawn-head" cx="0" cy="-2.6" r="1.8"/>
          <path class="pawn-body" d="M-3.1 3.2 Q-2.6 -.6 0 -.6 Q2.6 -.6 3.1 3.2 Q2.1 4.4 0 4.4 Q-2.1 4.4 -3.1 3.2Z"/>
          <text class="pawn-label" x="0" y="2.3">${name}</text>
        </g>
      </g>`;
  }

  function runnerPawnSVG(r) {
    const [x, y] = r.from;
    const [x2, y2] = r.to;
    return `
      <g class="sim-pawn runner" data-sim-runner="${r.name}" data-runner-timing="${r.timing || 'contact'}"
         data-x1="${x}" data-y1="${y}" data-x2="${x2}" data-y2="${y2}" transform="translate(${x} ${y})">
        <circle class="pawn-head" cx="0" cy="-2.6" r="1.8"/>
        <path class="pawn-body" d="M-3.1 3.2 Q-2.6 -.6 0 -.6 Q2.6 -.6 3.1 3.2 Q2.1 4.4 0 4.4 Q-2.1 4.4 -3.1 3.2Z"/>
        <text class="pawn-label" x="0" y="2.3">${r.name}</text>
      </g>`;
  }

  function ballSVG(ball) {
    if (!ball) return '';
    const [x, y] = ball.from;
    const [x2, y2] = ball.to;
    return `<g class="sim-ball" data-sim-ball data-x1="${x}" data-y1="${y}" data-x2="${x2}" data-y2="${y2}" transform="translate(${x} ${y})">
      <circle cx="0" cy="0" r="1.8"/>
      <path d="M-.7 -1 Q0 -.2 .7 -1 M-.7 1 Q0 .2 .7 1"/>
    </g>`;
  }

  function lineSVG(a, b, cls, color, marker, uid, extra = '') {
    return `<line class="sim-route ${cls}" ${extra} x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="${color}" stroke-width="1.45" stroke-linecap="round" stroke-dasharray="3 2" marker-end="url(#${marker}-${uid})"/>`;
  }

  function scenarioSVG(s) {
    const uid = ++simUid;
    const moveMap = Object.fromEntries(s.moves.map(m => [m.name, m]));
    let out = `<svg class="sim-field sim-scenario-svg" viewBox="0 0 100 100" data-uid="${uid}" aria-label="수비 상황 애니메이션">${markerDefs(uid)}${fieldBaseSVG()}`;

    if (s.ball) out += lineSVG(s.ball.from, s.ball.to, 'sim-ball-route', '#c84a3d', 'simR', uid, 'data-sim-ball-path');
    s.moves.forEach((m, i) => { if (m.from[0] !== m.to[0] || m.from[1] !== m.to[1]) out += lineSVG(m.from, m.to, 'sim-player-route', '#3d6eb4', 'simB', uid, `data-sim-player-path="${m.name}" data-path-index="${i}"`); });
    s.runners.forEach((r, i) => { if (r.from[0] !== r.to[0] || r.from[1] !== r.to[1]) out += lineSVG(r.from, r.to, 'sim-runner-route', '#d87b2b', 'simO', uid, `data-sim-runner-path="${r.name}" data-runner-timing="${r.timing || 'contact'}" data-path-index="${i}"`); });
    s.throws.forEach((t, i) => { out += lineSVG(t.from, t.to, 'sim-throw-route', '#39895c', 'simG', uid, `data-sim-throw-path="${i}"`); });

    Object.entries(s.start).forEach(([name, coord]) => {
      const move = moveMap[name];
      out += pawnSVG(name, coord, move?.to || coord, !!move, s.focus);
    });
    s.runners.forEach(r => { out += runnerPawnSVG(r); });
    out += ballSVG(s.ball);
    out += '</svg>';
    return out;
  }

  function directionButtons(kind, dir) {
    return KIND_META[kind].dirs.map(d => `<button class="sim-chip ${d === dir ? 'active' : ''}" data-sim-set="dir" data-value="${d}">${DIR_META[d].label}</button>`).join('');
  }

  function chips(items, current, key, labels) {
    return items.map(v => `<button class="sim-chip ${String(v) === String(current) ? 'active' : ''}" data-sim-set="${key}" data-value="${v}">${labels[v]}</button>`).join('');
  }

  function roleHTML(s) {
    return FOCUS_LABELS.filter(x => x !== 'ALL').map(name => `<div class="sim-role ${s.focus === name ? 'focus' : ''}"><b>${name}</b><span>${s.roles[name]}</span></div>`).join('');
  }

  function simulatorHTML(opts = {}) {
    const s = buildScenario(opts);
    const baseLabels = Object.fromEntries(BASE_STATES.map(x => [x.id, x.name]));
    const outLabels = { 0: '0 OUT', 1: '1 OUT', 2: '2 OUT' };
    const kindLabels = Object.fromEntries(Object.entries(KIND_META).map(([k, v]) => [k, v.label]));
    const alignLabels = Object.fromEntries(Object.entries(ALIGN_META).map(([k, v]) => [k, v.label]));
    const speed = SPEED[opts.speed] ? opts.speed : 'learn';
    const focus = s.focus;
    const positionMode = opts.positionMode === true;

    const focusControls = positionMode
      ? `<div class="sim-control-block"><div class="sim-control-label">보기 <span class="sim-control-help">내 포지션을 크게 강조</span></div><div class="sim-chips"><button class="sim-chip ${focus === 'ALL' ? 'active' : ''}" data-sim-set="focus" data-value="ALL">전체 보기</button><button class="sim-chip ${focus !== 'ALL' ? 'active' : ''}" data-sim-set="focus" data-value="${focus === 'ALL' ? (opts.positionCode || 'SS') : focus}">${opts.positionCode || focus}만 강조</button></div></div>`
      : `<div class="sim-control-block"><div class="sim-control-label">포지션 집중 <span class="sim-control-help">선택한 야수만 크게 보기</span></div><div class="sim-chips">${FOCUS_LABELS.map(p => `<button class="sim-chip ${focus === p ? 'active' : ''}" data-sim-set="focus" data-value="${p}">${p === 'ALL' ? '전체' : p}</button>`).join('')}</div></div>`;

    return `<section class="sim-lab" data-sim-root
      data-base="${s.base}" data-outs="${s.outs}" data-kind="${s.kind}" data-dir="${s.dir}"
      data-align="${s.align}" data-focus="${focus}" data-speed="${speed}" data-position-mode="${positionMode ? '1' : '0'}" data-position-code="${opts.positionCode || ''}">

      <div class="sim-controls">
        <div class="sim-control-block"><div class="sim-control-label">① 주자 상황 <span class="sim-control-help">베이스를 먼저 선택</span></div><div class="sim-chips">${chips(BASE_STATES.map(x => x.id), s.base, 'base', baseLabels)}</div></div>
        <div class="sim-control-block"><div class="sim-control-label">② 아웃카운트</div><div class="sim-chips">${chips([0, 1, 2], s.outs, 'outs', outLabels)}</div></div>
        <div class="sim-control-block"><div class="sim-control-label">③ 타구 종류</div><div class="sim-chips">${chips(Object.keys(KIND_META), s.kind, 'kind', kindLabels)}</div></div>
        <div class="sim-control-block"><div class="sim-control-label">④ 타구 방향 <span class="sim-control-help">종류에 따라 방향이 바뀝니다</span></div><div class="sim-chips">${directionButtons(s.kind, s.dir)}</div></div>
        <div class="sim-control-block"><div class="sim-control-label">투구 전 수비 위치 <span class="sim-control-help">기본 위치도 수비의 일부</span></div><div class="sim-chips">${chips(Object.keys(ALIGN_META), s.align, 'align', alignLabels)}</div><div class="sim-preset-note">${s.alignmentNote}</div></div>
        ${focusControls}
      </div>

      <div class="sim-board-card" data-sim-board>
        <div class="sim-board-head">
          <div class="sim-board-title"><b>${s.title}</b><span>수비수 → 공 → 주자 → 송구의 흐름을 천천히 확인하세요.</span></div>
          <div class="sim-board-actions"><button class="sim-mini-btn" data-sim-action="expand">⛶ 크게</button></div>
        </div>
        <div class="sim-status" data-sim-status><div><div class="sim-status-main">BEFORE · 투구 전 위치</div><div class="sim-status-sub">재생 전, 각 야수의 시작 위치와 주자 상태를 먼저 확인하세요.</div></div><span class="sim-status-badge">학습 모드</span></div>
        <div class="sim-field-wrap">${scenarioSVG(s)}</div>
        <div class="sim-legend"><span><i class="sim-dot fielder"></i>수비수</span><span><i class="sim-dot runner"></i>주자</span><span><i class="sim-dot ball"></i>공</span><span><i class="sim-line throw"></i>송구</span></div>
        <div class="sim-playbar">
          <button class="sim-play-btn primary" data-sim-action="play">▶ 천천히 재생</button>
          <button class="sim-play-btn" data-sim-action="replay">↻ 처음부터</button>
          <div class="sim-speed">${Object.entries(SPEED).map(([k, v]) => `<button class="${speed === k ? 'active' : ''}" data-sim-set="speed" data-value="${k}">${v.label}</button>`).join('')}</div>
        </div>
      </div>

      <div class="sim-info-grid">
        <div class="sim-info-card"><h4>이 상황의 핵심</h4><p><b>${s.headline}</b><br>${s.baseoutDetail}</p><div class="sim-caution">투구 전 위치: ${ALIGN_META[s.alignmentResolved].label} · ${s.alignmentNote}</div>${s.caution ? `<div class="sim-caution">${s.caution}</div>` : ''}</div>
        <div class="sim-info-card"><h4>포지션별 역할</h4><p>움직이지 않는 것도 역할입니다. 선택한 포지션은 노란 말로 강조됩니다.</p><div class="sim-role-list">${roleHTML(s)}</div></div>
      </div>
    </section>`;
  }

  function scenarioPage(base = 'r1', outs = 0) {
    crumb.textContent = 'HOME > 상황 시뮬레이터';
    const stateInfo = BASE_MAP[base] || BASE_MAP.r1;
    return `<section class="hero"><div class="eyebrow">SITUATION SIMULATOR</div><h2>주자와 타구가 정해지면<br>9명의 움직임이 시작됩니다.</h2><p class="lead">주자 → 아웃 → 타구 종류 → 방향을 고르면 수비수·공·주자의 움직임을 애니메이션으로 보여줍니다.</p></section>
      <div class="section-title">상황 만들기</div><div class="section-sub">${stateInfo.name}에서 시작해 원하는 상황으로 바꿔보세요. 글보다 움직임을 먼저 보도록 설계했습니다.</div>
      ${simulatorHTML({ base, outs, kind: 'ground', dir: 'ss', align: 'auto', focus: 'ALL', speed: 'learn' })}
      ${relatedButtons([{ label: '내 포지션', route: 'positions' }, { label: '특수 플레이', route: 'plays' }, { label: 'CORE 원칙', route: 'core' }])}`;
  }

  situationsView = function() {
    return scenarioPage('r1', 0);
  };

  situationSelect = function(id) {
    return scenarioPage(BASE_MAP[id] ? id : 'r1', 0);
  };

  baseoutView = function(id, outs) {
    const base = BASE_MAP[id] ? id : 'r1';
    const out = [0, 1, 2].includes(Number(outs)) ? Number(outs) : 0;
    const title = `${out} OUT · ${BASE_MAP[base].name}`;
    addRecent({ key: `bo:${base}:${out}`, title });
    return scenarioPage(base, out);
  };

  function defaultPositionScenario(id) {
    const map = {
      c: { base: 'r2', outs: 1, kind: 'single', dir: 'cf' },
      p: { base: 'r1', outs: 0, kind: 'ground', dir: '1b' },
      '1b': { base: 'r1', outs: 0, kind: 'ground', dir: '1b' },
      '2b': { base: 'r1', outs: 0, kind: 'ground', dir: '2b' },
      '3b': { base: 'r12', outs: 0, kind: 'ground', dir: '3b' },
      ss: { base: 'r1', outs: 0, kind: 'ground', dir: 'ss' },
      lf: { base: 'r2', outs: 1, kind: 'single', dir: 'lf' },
      cf: { base: 'r2', outs: 1, kind: 'single', dir: 'cf' },
      rf: { base: 'r1', outs: 0, kind: 'single', dir: 'rf' }
    };
    return map[id] || map.ss;
  }

  positionView = function(id) {
    const p = positionById(id), topics = POSITION_DATA[id] || [];
    const key = `position:${id}`;
    crumb.textContent = `포지션 > ${p.code} ${p.name}`;
    addRecent({ key, title: `${p.code} ${p.name}` });
    const d = defaultPositionScenario(id);
    return `<section class="hero"><div class="position-hero"><div class="pos-badge">${p.code}</div><div><div class="eyebrow">30초 포지션 복습</div><h1>${p.name}</h1><p class="lead">${p.tag}</p></div></div></section>
      <div class="content-card"><div class="check-list">${p.summary.map((x, i) => `<div class="check-line"><span class="check-dot">${i + 1}</span><div>${x}</div></div>`).join('')}</div><div class="coach">“${p.line}”</div></div>
      <div class="page-actions">${favButton(key, `${p.code} ${p.name}`)}${shareButton(`${p.code} ${p.name}`)}</div>
      <div class="sim-position-lab"><div class="section-title">⚾ 상황별 내 움직임</div><div class="section-sub">같은 상황에서도 ${p.code}만 크게 강조합니다. 주자·아웃·타구를 바꿔가며 “나는 어디로 가는가”를 확인하세요.</div>${simulatorHTML({ ...d, align: 'auto', focus: p.code, speed: 'learn', positionMode: true, positionCode: p.code })}</div>
      <div class="section-title">세부 수비</div><div class="section-sub">각 항목을 눌러 실제 움직임·실수·전술도를 확인하세요.</div>
      <div class="topic-grid">${topics.map((t, i) => `<button class="topic-card" data-go="position-topic" data-param='{"pos":"${id}","idx":${i}}'><div class="topic-head"><b>${t.title}</b><span>›</span></div><span>${t.teaser}</span>${tagsHTML(t.tags)}</button>`).join('')}</div>
      ${relatedButtons([{ label: '상황 시뮬레이터', route: 'situations' }, { label: '특수 플레이', route: 'plays' }, { label: 'CORE 원칙', route: 'core' }])}`;
  };

  positionTopic = function(pos, idx) {
    const p = positionById(pos), t = (POSITION_DATA[pos] || [])[Number(idx)];
    if (!t) return positionView(pos);
    const key = `pt:${pos}:${idx}`;
    crumb.textContent = `${p.code} ${p.name} > ${t.title}`;
    addRecent({ key, title: `${p.code} ${t.title}` });
    return `<section class="hero"><div class="eyebrow">${p.code} · POSITION DETAIL</div><h1>${t.title}</h1><p class="lead">${t.teaser}</p></section>
      ${tagsHTML(t.tags)}${t.diagram ? diagramHTML(t.diagram, p.code) : ''}
      <div class="content-card"><div class="steps">${t.bullets.map((b, i) => `<div class="step"><b>${i + 1}</b><div>${b}</div></div>`).join('')}</div>${(t.mistakes || []).map(m => `<div class="mistake"><b>많이 하는 실수</b><br>${m}</div>`).join('')}${t.coach ? `<div class="coach">“${t.coach}”</div>` : ''}</div>
      <div class="page-actions">${favButton(key, `${p.code} ${t.title}`)}${shareButton(`${p.code} ${t.title}`)}</div>
      ${relatedButtons([{ label: `${p.code} 전체`, route: 'position', params: { id: pos } }, { label: '상황 시뮬레이터', route: 'situations' }, { label: '특수 플레이', route: 'plays' }])}`;
  };

  function legacyStageSVG(stage, focus, uid) {
    const start = clonePos();
    const moveMap = {};
    (stage.moves || []).forEach(m => { if (DEF_DEFAULT[m[0]]) moveMap[m[0]] = { name: m[0], from: m[1], to: m[2] }; });
    let out = `<svg class="sim-field sim-legacy-svg" viewBox="0 0 100 100" data-uid="${uid}">${markerDefs(uid)}${fieldBaseSVG()}`;
    if (stage.ball) out += lineSVG(stage.ball[0], stage.ball[1], 'sim-ball-route', '#c84a3d', 'simR', uid, 'data-sim-ball-path');
    Object.values(moveMap).forEach((m, i) => { out += lineSVG(m.from, m.to, 'sim-player-route', '#3d6eb4', 'simB', uid, `data-sim-player-path="${m.name}" data-path-index="${i}"`); });
    (stage.runner || []).forEach((r, i) => { out += lineSVG(r[1], r[2], 'sim-runner-route', '#d87b2b', 'simO', uid, `data-sim-runner-path="${r[0]}" data-runner-timing="contact" data-path-index="${i}"`); });
    (stage.throws || []).forEach((t, i) => { out += lineSVG(t[0], t[1], 'sim-throw-route', '#39895c', 'simG', uid, `data-sim-throw-path="${i}"`); });
    Object.entries(start).forEach(([name, coord]) => {
      const m = moveMap[name];
      out += pawnSVG(name, m?.from || coord, m?.to || coord, !!m || (stage.active || []).includes(name), focus);
    });
    (stage.runner || []).forEach(r => { out += runnerPawnSVG({ name: r[0], from: r[1], to: r[2], timing: 'contact' }); });
    if (stage.ball) out += ballSVG({ from: stage.ball[0], to: stage.ball[1] });
    out += '</svg>';
    return out;
  }

  diagramHTML = function(id, focus = 'ALL') {
    const d = DIAGRAMS[id];
    if (!d) return '';
    const stages = d.stages.map((st, i) => {
      const uid = ++simUid;
      return `<div class="sim-legacy-stage" data-legacy-stage="${i}" ${i ? 'hidden' : ''}><div class="diagram-stage-title">${st.title}</div><div class="sim-field-wrap">${legacyStageSVG(st, focus, uid)}</div>${st.note ? `<div class="sim-caution">${st.note}</div>` : ''}</div>`;
    }).join('');
    return `<div class="diagram-card sim-legacy-card" data-legacy-diagram data-speed="learn"><div class="diagram-head"><b>${d.title}</b><span>움직이는 전술도</span></div>
      <div class="sim-status" data-sim-status><div><div class="sim-status-main">BEFORE · 시작 위치</div><div class="sim-status-sub">수비수의 시작 위치부터 확인하고 재생하세요.</div></div><span class="sim-status-badge">STEP 1 / ${d.stages.length}</span></div>
      ${stages}
      <div class="sim-playbar"><button class="sim-play-btn primary" data-legacy-action="play">▶ 천천히 재생</button><button class="sim-play-btn" data-legacy-action="replay">↻ 처음부터</button><div class="sim-speed">${Object.entries(SPEED).map(([k, v]) => `<button class="${k === 'learn' ? 'active' : ''}" data-legacy-speed="${k}">${v.label}</button>`).join('')}</div></div>
      <div class="sim-legend"><span><i class="sim-dot fielder"></i>수비수</span><span><i class="sim-dot runner"></i>주자</span><span><i class="sim-dot ball"></i>공</span><span><i class="sim-line throw"></i>송구</span></div></div>`;
  };

  function setXY(el, x, y) {
    el.setAttribute('transform', `translate(${x} ${y})`);
  }

  function resetSvg(svg) {
    svg.querySelectorAll('[data-sim-player],[data-sim-runner],[data-sim-ball]').forEach(el => {
      setXY(el, Number(el.dataset.x1), Number(el.dataset.y1));
    });
    svg.querySelectorAll('.sim-route').forEach(x => x.classList.remove('is-live', 'is-done'));
  }

  function finishSvg(svg) {
    svg.querySelectorAll('[data-sim-player],[data-sim-runner]').forEach(el => {
      setXY(el, Number(el.dataset.x2), Number(el.dataset.y2));
    });
    const ball = svg.querySelector('[data-sim-ball]');
    if (ball) setXY(ball, Number(ball.dataset.x2), Number(ball.dataset.y2));
    svg.querySelectorAll('.sim-route').forEach(x => x.classList.add('is-done'));
  }

  function ease(t) {
    return t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  function wait(ms, root, runId) {
    return new Promise(resolve => {
      const start = performance.now();
      const tick = now => {
        if (!root.isConnected || root.dataset.runId !== String(runId)) return resolve(false);
        if (now - start >= ms) return resolve(true);
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }

  function tween(el, x1, y1, x2, y2, ms, root, runId) {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setXY(el, x2, y2);
      return Promise.resolve(true);
    }
    return new Promise(resolve => {
      const start = performance.now();
      const tick = now => {
        if (!root.isConnected || root.dataset.runId !== String(runId)) return resolve(false);
        const p = Math.min(1, (now - start) / ms);
        const e = ease(p);
        setXY(el, x1 + (x2 - x1) * e, y1 + (y2 - y1) * e);
        if (p < 1) requestAnimationFrame(tick); else resolve(true);
      };
      requestAnimationFrame(tick);
    });
  }

  function status(root, main, sub, badge = '') {
    const box = root.querySelector('[data-sim-status]');
    if (!box) return;
    box.querySelector('.sim-status-main').textContent = main;
    box.querySelector('.sim-status-sub').textContent = sub;
    if (badge) box.querySelector('.sim-status-badge').textContent = badge;
  }

  async function animateScenario(root) {
    const svg = root.querySelector('.sim-scenario-svg');
    if (!svg) return;
    const runId = ++runSerial;
    root.dataset.runId = String(runId);
    resetSvg(svg);
    const factor = SPEED[root.dataset.speed]?.factor || 1;
    const playBtn = root.querySelector('[data-sim-action="play"]');
    if (playBtn) { playBtn.disabled = true; playBtn.textContent = '재생 중…'; }

    status(root, 'BEFORE · 투구 전 위치', '야수의 시작 위치와 주자 상태를 먼저 봅니다.', '1 / 5');
    await wait(1500 * factor, root, runId);

    status(root, 'CONTACT · 타구 발생', '공의 방향을 확인하는 순간 모든 야수가 자기 역할을 시작합니다.', '2 / 5');
    const ball = svg.querySelector('[data-sim-ball]');
    const ballPath = svg.querySelector('[data-sim-ball-path]');
    if (ballPath) ballPath.classList.add('is-live');
    const contactPromises = [];
    if (ball) contactPromises.push(tween(ball, +ball.dataset.x1, +ball.dataset.y1, +ball.dataset.x2, +ball.dataset.y2, 2200 * factor, root, runId));

    svg.querySelectorAll('[data-sim-player]').forEach((el, i) => {
      const x1 = +el.dataset.x1, y1 = +el.dataset.y1, x2 = +el.dataset.x2, y2 = +el.dataset.y2;
      if (x1 === x2 && y1 === y2) return;
      const path = svg.querySelector(`[data-sim-player-path="${el.dataset.simPlayer}"]`);
      contactPromises.push(wait((320 + i * 35) * factor, root, runId).then(ok => {
        if (!ok) return false;
        if (path) path.classList.add('is-live');
        return tween(el, x1, y1, x2, y2, 3000 * factor, root, runId);
      }));
    });

    svg.querySelectorAll('[data-sim-runner][data-runner-timing="contact"]').forEach((el, i) => {
      const path = svg.querySelector(`[data-sim-runner-path="${el.dataset.simRunner}"]`);
      contactPromises.push(wait((600 + i * 80) * factor, root, runId).then(ok => {
        if (!ok) return false;
        if (path) path.classList.add('is-live');
        return tween(el, +el.dataset.x1, +el.dataset.y1, +el.dataset.x2, +el.dataset.y2, 2900 * factor, root, runId);
      }));
    });

    await Promise.all(contactPromises);
    if (root.dataset.runId !== String(runId)) return;
    svg.querySelectorAll('.sim-route.is-live').forEach(x => { x.classList.remove('is-live'); x.classList.add('is-done'); });

    status(root, 'MOVE · 수비 위치 완성', '포구 선수뿐 아니라 커버·컷·백업 선수의 위치까지 확인합니다.', '3 / 5');
    await wait(1100 * factor, root, runId);

    const afterCatchRunners = [...svg.querySelectorAll('[data-sim-runner][data-runner-timing="afterCatch"]')];
    const throwPaths = [...svg.querySelectorAll('[data-sim-throw-path]')];

    status(root, 'THROW · 송구와 주자 이동', '주자와 공이 동시에 움직일 때 수비수의 연결 위치를 봅니다.', '4 / 5');
    const afterRunnerPromise = Promise.all(afterCatchRunners.map((el, i) => {
      const path = svg.querySelector(`[data-sim-runner-path="${el.dataset.simRunner}"]`);
      return wait((180 + i * 90) * factor, root, runId).then(ok => {
        if (!ok) return false;
        if (path) path.classList.add('is-live');
        return tween(el, +el.dataset.x1, +el.dataset.y1, +el.dataset.x2, +el.dataset.y2, 2800 * factor, root, runId);
      });
    }));

    let ballNow = ball ? [+ball.dataset.x2, +ball.dataset.y2] : null;
    const throwSequence = (async () => {
      for (let i = 0; i < throwPaths.length; i++) {
        if (root.dataset.runId !== String(runId)) return;
        const path = throwPaths[i];
        path.classList.add('is-live');
        const x1 = +path.getAttribute('x1'), y1 = +path.getAttribute('y1');
        const x2 = +path.getAttribute('x2'), y2 = +path.getAttribute('y2');
        if (ball) {
          setXY(ball, ballNow?.[0] ?? x1, ballNow?.[1] ?? y1);
          await tween(ball, ballNow?.[0] ?? x1, ballNow?.[1] ?? y1, x2, y2, 1450 * factor, root, runId);
          ballNow = [x2, y2];
        } else {
          await wait(1450 * factor, root, runId);
        }
        path.classList.remove('is-live');
        path.classList.add('is-done');
        await wait(260 * factor, root, runId);
      }
    })();

    await Promise.all([afterRunnerPromise, throwSequence]);
    if (root.dataset.runId !== String(runId)) return;
    svg.querySelectorAll('.sim-route.is-live').forEach(x => { x.classList.remove('is-live'); x.classList.add('is-done'); });

    status(root, 'RESET · 최종 위치', '이 플레이가 끝났을 때 내가 어디에 있어야 하는지 2초 동안 확인하세요.', '5 / 5');
    await wait(2000 * factor, root, runId);

    if (playBtn && root.dataset.runId === String(runId)) { playBtn.disabled = false; playBtn.textContent = '▶ 천천히 재생'; }
  }

  async function animateLegacy(card) {
    const stages = [...card.querySelectorAll('[data-legacy-stage]')];
    const runId = ++runSerial;
    card.dataset.runId = String(runId);
    const factor = SPEED[card.dataset.speed]?.factor || 1;
    const btn = card.querySelector('[data-legacy-action="play"]');
    if (btn) { btn.disabled = true; btn.textContent = '재생 중…'; }

    for (let si = 0; si < stages.length; si++) {
      if (card.dataset.runId !== String(runId)) break;
      stages.forEach((x, i) => x.hidden = i !== si);
      const st = stages[si];
      const svg = st.querySelector('.sim-legacy-svg');
      resetSvg(svg);
      status(card, `STEP ${si + 1} · 수비 움직임`, '공의 방향을 본 뒤 수비수·주자·송구 순서를 천천히 확인합니다.', `STEP ${si + 1} / ${stages.length}`);
      await wait(1200 * factor, card, runId);

      const promises = [];
      const ball = svg.querySelector('[data-sim-ball]');
      const bp = svg.querySelector('[data-sim-ball-path]');
      if (bp) bp.classList.add('is-live');
      if (ball) promises.push(tween(ball, +ball.dataset.x1, +ball.dataset.y1, +ball.dataset.x2, +ball.dataset.y2, 2200 * factor, card, runId));
      svg.querySelectorAll('[data-sim-player]').forEach((el, i) => {
        const x1 = +el.dataset.x1, y1 = +el.dataset.y1, x2 = +el.dataset.x2, y2 = +el.dataset.y2;
        if (x1 === x2 && y1 === y2) return;
        const path = svg.querySelector(`[data-sim-player-path="${el.dataset.simPlayer}"]`);
        promises.push(wait((300 + i * 30) * factor, card, runId).then(ok => { if (!ok) return false; if (path) path.classList.add('is-live'); return tween(el, x1, y1, x2, y2, 3000 * factor, card, runId); }));
      });
      svg.querySelectorAll('[data-sim-runner]').forEach((el, i) => {
        const path = svg.querySelector(`[data-sim-runner-path="${el.dataset.simRunner}"]`);
        promises.push(wait((600 + i * 70) * factor, card, runId).then(ok => { if (!ok) return false; if (path) path.classList.add('is-live'); return tween(el, +el.dataset.x1, +el.dataset.y1, +el.dataset.x2, +el.dataset.y2, 2900 * factor, card, runId); }));
      });
      await Promise.all(promises);
      svg.querySelectorAll('.sim-route.is-live').forEach(x => { x.classList.remove('is-live'); x.classList.add('is-done'); });
      await wait(900 * factor, card, runId);

      let ballNow = ball ? [+ball.dataset.x2, +ball.dataset.y2] : null;
      for (const path of [...svg.querySelectorAll('[data-sim-throw-path]')]) {
        if (card.dataset.runId !== String(runId)) break;
        path.classList.add('is-live');
        const x1 = +path.getAttribute('x1'), y1 = +path.getAttribute('y1'), x2 = +path.getAttribute('x2'), y2 = +path.getAttribute('y2');
        if (ball) { setXY(ball, ballNow?.[0] ?? x1, ballNow?.[1] ?? y1); await tween(ball, ballNow?.[0] ?? x1, ballNow?.[1] ?? y1, x2, y2, 1450 * factor, card, runId); ballNow = [x2, y2]; }
        path.classList.remove('is-live'); path.classList.add('is-done');
        await wait(240 * factor, card, runId);
      }
      await wait(1500 * factor, card, runId);
    }

    if (btn && card.dataset.runId === String(runId)) { btn.disabled = false; btn.textContent = '▶ 천천히 재생'; }
  }

  function simRootState(root) {
    return {
      base: root.dataset.base,
      outs: Number(root.dataset.outs),
      kind: root.dataset.kind,
      dir: root.dataset.dir,
      align: root.dataset.align,
      focus: root.dataset.focus,
      speed: root.dataset.speed,
      positionMode: root.dataset.positionMode === '1',
      positionCode: root.dataset.positionCode || ''
    };
  }

  function replaceRoot(root, patch) {
    const st = { ...simRootState(root), ...patch };
    if (patch.kind) {
      const valid = KIND_META[patch.kind].dirs;
      if (!valid.includes(st.dir)) st.dir = valid[0];
    }
    const wrap = document.createElement('div');
    wrap.innerHTML = simulatorHTML(st).trim();
    root.replaceWith(wrap.firstElementChild);
  }

  view.addEventListener('click', e => {
    const setBtn = e.target.closest('[data-sim-set]');
    if (setBtn) {
      const root = setBtn.closest('[data-sim-root]');
      if (!root) return;
      const key = setBtn.dataset.simSet;
      const value = key === 'outs' ? Number(setBtn.dataset.value) : setBtn.dataset.value;
      replaceRoot(root, { [key]: value });
      return;
    }

    const action = e.target.closest('[data-sim-action]');
    if (action) {
      const root = action.closest('[data-sim-root]');
      if (!root) return;
      if (action.dataset.simAction === 'play') animateScenario(root);
      if (action.dataset.simAction === 'replay') {
        root.dataset.runId = String(++runSerial);
        const svg = root.querySelector('.sim-scenario-svg');
        if (svg) resetSvg(svg);
        status(root, 'BEFORE · 투구 전 위치', '야수의 시작 위치와 주자 상태를 먼저 봅니다.', '1 / 5');
      }
      if (action.dataset.simAction === 'expand') {
        const board = root.querySelector('[data-sim-board]');
        board.classList.toggle('is-expanded');
        action.textContent = board.classList.contains('is-expanded') ? '✕ 닫기' : '⛶ 크게';
      }
      return;
    }

    const legacySpeed = e.target.closest('[data-legacy-speed]');
    if (legacySpeed) {
      const card = legacySpeed.closest('[data-legacy-diagram]');
      card.dataset.speed = legacySpeed.dataset.legacySpeed;
      card.querySelectorAll('[data-legacy-speed]').forEach(b => b.classList.toggle('active', b === legacySpeed));
      return;
    }

    const legacyAction = e.target.closest('[data-legacy-action]');
    if (legacyAction) {
      const card = legacyAction.closest('[data-legacy-diagram]');
      if (legacyAction.dataset.legacyAction === 'play') animateLegacy(card);
      if (legacyAction.dataset.legacyAction === 'replay') {
        card.dataset.runId = String(++runSerial);
        const stages = [...card.querySelectorAll('[data-legacy-stage]')];
        stages.forEach((x, i) => x.hidden = i !== 0);
        const svg = stages[0]?.querySelector('.sim-legacy-svg');
        if (svg) resetSvg(svg);
        status(card, 'BEFORE · 시작 위치', '수비수의 시작 위치부터 확인하고 재생하세요.', `STEP 1 / ${stages.length}`);
      }
    }
  });

  // 뒤로가기: 앱 내부 화면도 브라우저 히스토리에 쌓이도록 보강
  history.replaceState({ baseballDefenseState: { route: state.route, params: state.params } }, '', location.href);
  routeTo = function(route, params = {}) {
    const same = state.route === route && JSON.stringify(state.params || {}) === JSON.stringify(params || {});
    if (same) { window.scrollTo({ top: 0, behavior: 'instant' }); return; }
    state = { route, params };
    history.pushState({ baseballDefenseState: { route, params } }, '', location.href);
    render();
    syncTopButton();
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  function syncTopButton() {
    const btn = document.getElementById('homeBtn');
    if (!btn) return;
    const home = state.route === 'home';
    btn.textContent = home ? '⌂' : '←';
    btn.setAttribute('aria-label', home ? '홈' : '뒤로가기');
  }

  window.addEventListener('popstate', e => {
    const saved = e.state?.baseballDefenseState;
    state = saved ? { route: saved.route || 'home', params: saved.params || {} } : { route: 'home', params: {} };
    render();
    syncTopButton();
    window.scrollTo({ top: 0, behavior: 'instant' });
  });

  document.getElementById('homeBtn')?.addEventListener('click', e => {
    e.preventDefault();
    e.stopImmediatePropagation();
    if (state.route === 'home') window.scrollTo({ top: 0, behavior: 'smooth' });
    else history.back();
  }, true);

  // 기존 app.js가 이미 한 번 그렸으므로 새 화면 함수/전술도를 반영해 다시 렌더
  render();
  syncTopButton();
})();
