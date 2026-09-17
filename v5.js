'use strict';

/*
 * v5 interaction patch
 * - Situation first UX
 * - Slower, easier-to-follow tactical animation
 * - Strong defender movement emphasis
 * - Quick situation presets
 * - One-tap position focus
 *
 * This patch intentionally leaves simulator.js data/logic intact and only
 * replaces how the rendered SVG is presented and animated.
 */
(() => {
  const V5_SPEED = {
    learn: 1,
    normal: 0.78,
    quick: 0.60
  };

  const PRESETS = [
    { label: 'R1 · 병살', base: 'r1', outs: 0, kind: 'ground', dir: 'ss', align: 'auto', focus: 'ALL' },
    { label: 'R2 · 좌전안타', base: 'r2', outs: 1, kind: 'single', dir: 'lf', align: 'auto', focus: 'ALL' },
    { label: 'R3 · 태그업', base: 'r3', outs: 1, kind: 'fly', dir: 'cf', align: 'normal', focus: 'ALL' },
    { label: '1·2루 · 3B 땅볼', base: 'r12', outs: 0, kind: 'ground', dir: '3b', align: 'auto', focus: 'ALL' },
    { label: '만루 · 내야 땅볼', base: 'loaded', outs: 1, kind: 'ground', dir: '2b', align: 'auto', focus: 'ALL' }
  ];

  let serial = 0;

  function setXY(el, x, y) {
    el.setAttribute('transform', `translate(${x} ${y})`);
  }

  function runToken(root) {
    const token = String(++serial);
    root.dataset.v5Run = token;
    return token;
  }

  function alive(root, token) {
    return root?.isConnected && root.dataset.v5Run === token;
  }

  function wait(ms, root, token) {
    return new Promise(resolve => {
      const started = performance.now();
      const tick = now => {
        if (!alive(root, token)) return resolve(false);
        if (now - started >= ms) return resolve(true);
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }

  function ease(p) {
    return p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
  }

  function move(el, x1, y1, x2, y2, ms, root, token) {
    if (!el) return Promise.resolve(false);
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setXY(el, x2, y2);
      return Promise.resolve(true);
    }

    el.classList.add('is-moving');
    el.classList.remove('just-arrived');
    if (el.matches('.sim-pawn.fielder')) el.classList.add('v5-attention');

    return new Promise(resolve => {
      const started = performance.now();
      const tick = now => {
        if (!alive(root, token)) {
          el.classList.remove('is-moving', 'v5-attention');
          return resolve(false);
        }
        const p = Math.min(1, (now - started) / ms);
        const e = ease(p);
        setXY(el, x1 + (x2 - x1) * e, y1 + (y2 - y1) * e);
        if (p < 1) return requestAnimationFrame(tick);
        el.classList.remove('is-moving', 'v5-attention');
        el.classList.add('just-arrived');
        setTimeout(() => el.classList.remove('just-arrived'), 850);
        resolve(true);
      };
      requestAnimationFrame(tick);
    });
  }

  function setPhase(root, phase) {
    root.querySelectorAll('.sim-phasebar [data-phase]').forEach(el => {
      el.classList.toggle('active', el.dataset.phase === phase);
      el.classList.toggle('done', ['before','contact','move','throw','rotate','reset'].indexOf(el.dataset.phase) < ['before','contact','move','throw','rotate','reset'].indexOf(phase));
    });
  }

  function status(root, phase, title, sub, badge) {
    setPhase(root, phase);
    const box = root.querySelector('[data-sim-status]');
    if (!box) return;
    const main = box.querySelector('.sim-status-main');
    const detail = box.querySelector('.sim-status-sub');
    const tag = box.querySelector('.sim-status-badge');
    if (main) main.textContent = title;
    if (detail) detail.textContent = sub;
    if (tag) tag.textContent = badge;
  }

  function resetSvg(svg) {
    if (!svg) return;
    svg.querySelectorAll('[data-sim-player],[data-sim-runner],[data-sim-ball]').forEach(el => {
      const x = Number(el.dataset.x1);
      const y = Number(el.dataset.y1);
      if (Number.isFinite(x) && Number.isFinite(y)) setXY(el, x, y);
      el.classList.remove('is-moving','just-arrived','v5-attention');
    });
    svg.querySelectorAll('.sim-route').forEach(el => el.classList.remove('is-live','is-done'));
  }

  function setPlaying(root, playing) {
    const btn = root.querySelector('[data-sim-action="play"],[data-legacy-action="play"]');
    if (!btn) return;
    btn.disabled = !!playing;
    btn.textContent = playing ? '재생 중…' : '▶ 천천히 재생';
  }

  function factor(root) {
    return V5_SPEED[root.dataset.speed] ?? V5_SPEED.learn;
  }

  async function animateScenario(root) {
    const svg = root.querySelector('.sim-scenario-svg');
    if (!svg) return;
    const token = runToken(root);
    const f = factor(root);
    resetSvg(svg);
    setPlaying(root, true);

    status(root, 'before', 'BEFORE · 투구 전 위치', '타구가 나오기 전, 각 야수가 어디에서 시작하는지 먼저 확인하세요.', '1 / 6');
    await wait(1900 * f, root, token);
    if (!alive(root, token)) return;

    status(root, 'contact', 'CONTACT · 타구 발생', '공의 방향을 먼저 보고, 포구 야수와 주변 수비수의 첫 반응을 따라가세요.', '2 / 6');

    const ball = svg.querySelector('[data-sim-ball]');
    const ballPath = svg.querySelector('[data-sim-ball-path]');
    if (ballPath) ballPath.classList.add('is-live');

    const contact = [];
    if (ball) {
      contact.push(move(ball,
        Number(ball.dataset.x1), Number(ball.dataset.y1),
        Number(ball.dataset.x2), Number(ball.dataset.y2),
        2700 * f, root, token));
    }

    const fielders = [...svg.querySelectorAll('[data-sim-player]')].filter(el =>
      Number(el.dataset.x1) !== Number(el.dataset.x2) || Number(el.dataset.y1) !== Number(el.dataset.y2)
    );

    fielders.forEach((el, i) => {
      const path = svg.querySelector(`[data-sim-player-path="${el.dataset.simPlayer}"]`);
      contact.push(wait((420 + i * 150) * f, root, token).then(ok => {
        if (!ok) return false;
        if (path) path.classList.add('is-live');
        return move(el,
          Number(el.dataset.x1), Number(el.dataset.y1),
          Number(el.dataset.x2), Number(el.dataset.y2),
          3800 * f, root, token);
      }));
    });

    const runners = [...svg.querySelectorAll('[data-sim-runner][data-runner-timing="contact"]')];
    runners.forEach((el, i) => {
      const path = svg.querySelector(`[data-sim-runner-path="${el.dataset.simRunner}"]`);
      contact.push(wait((760 + i * 140) * f, root, token).then(ok => {
        if (!ok) return false;
        if (path) path.classList.add('is-live');
        return move(el,
          Number(el.dataset.x1), Number(el.dataset.y1),
          Number(el.dataset.x2), Number(el.dataset.y2),
          3400 * f, root, token);
      }));
    });

    await Promise.all(contact);
    if (!alive(root, token)) return;
    svg.querySelectorAll('.sim-route.is-live').forEach(x => { x.classList.remove('is-live'); x.classList.add('is-done'); });

    status(root, 'move', 'MOVE · 수비 위치 완성', '포구 선수만 보지 말고 커버·컷·백업 야수의 최종 위치까지 확인하세요.', '3 / 6');
    await wait(1650 * f, root, token);
    if (!alive(root, token)) return;

    status(root, 'throw', 'THROW · 송구와 주자 이동', '공과 주자가 움직이는 동안 수비수의 연결 위치가 유지되는지 확인하세요.', '4 / 6');

    const afterCatchRunners = [...svg.querySelectorAll('[data-sim-runner][data-runner-timing="afterCatch"]')];
    const runnerPromise = Promise.all(afterCatchRunners.map((el, i) => {
      const path = svg.querySelector(`[data-sim-runner-path="${el.dataset.simRunner}"]`);
      return wait((260 + i * 140) * f, root, token).then(ok => {
        if (!ok) return false;
        if (path) path.classList.add('is-live');
        return move(el,
          Number(el.dataset.x1), Number(el.dataset.y1),
          Number(el.dataset.x2), Number(el.dataset.y2),
          3500 * f, root, token);
      });
    }));

    const throwPaths = [...svg.querySelectorAll('[data-sim-throw-path]')];
    let ballNow = ball ? [Number(ball.dataset.x2), Number(ball.dataset.y2)] : null;

    const throwPromise = (async () => {
      for (const path of throwPaths) {
        if (!alive(root, token)) return;
        path.classList.add('is-live');
        const x1 = Number(path.getAttribute('x1'));
        const y1 = Number(path.getAttribute('y1'));
        const x2 = Number(path.getAttribute('x2'));
        const y2 = Number(path.getAttribute('y2'));
        if (ball) {
          const sx = ballNow?.[0] ?? x1;
          const sy = ballNow?.[1] ?? y1;
          setXY(ball, sx, sy);
          await move(ball, sx, sy, x2, y2, 1850 * f, root, token);
          ballNow = [x2, y2];
        } else {
          await wait(1850 * f, root, token);
        }
        path.classList.remove('is-live');
        path.classList.add('is-done');
        await wait(430 * f, root, token);
      }
    })();

    await Promise.all([runnerPromise, throwPromise]);
    if (!alive(root, token)) return;
    svg.querySelectorAll('.sim-route.is-live').forEach(x => { x.classList.remove('is-live'); x.classList.add('is-done'); });

    status(root, 'rotate', 'ROTATE · 다음 자리 채우기', '송구 뒤에도 플레이는 끝나지 않습니다. 비는 베이스·중계·악송구 백업 위치를 확인하세요.', '5 / 6');
    await wait(2000 * f, root, token);
    if (!alive(root, token)) return;

    status(root, 'reset', 'RESET · 다음 투구 준비', '최종 위치를 잠시 보고, 다음 타구 전에 OUT · RUNNER · FORCE를 다시 읽습니다.', '6 / 6');
    await wait(3000 * f, root, token);

    if (alive(root, token)) setPlaying(root, false);
  }

  async function animateLegacy(card) {
    const stages = [...card.querySelectorAll('[data-legacy-stage]')];
    if (!stages.length) return;
    const token = runToken(card);
    const f = V5_SPEED[card.dataset.speed] ?? 1;
    setPlaying(card, true);

    for (let i = 0; i < stages.length; i++) {
      if (!alive(card, token)) return;
      stages.forEach((x, n) => x.hidden = n !== i);
      const stage = stages[i];
      const svg = stage.querySelector('.sim-legacy-svg');
      resetSvg(svg);
      status(card, 'before', `STEP ${i + 1} · 시작 위치`, '공이 움직이기 전에 야수들의 시작 위치부터 확인하세요.', `STEP ${i + 1} / ${stages.length}`);
      await wait(1500 * f, card, token);

      const ball = svg?.querySelector('[data-sim-ball]');
      const bp = svg?.querySelector('[data-sim-ball-path]');
      if (bp) bp.classList.add('is-live');
      const tasks = [];
      if (ball) tasks.push(move(ball, Number(ball.dataset.x1), Number(ball.dataset.y1), Number(ball.dataset.x2), Number(ball.dataset.y2), 2700 * f, card, token));

      [...(svg?.querySelectorAll('[data-sim-player]') || [])].filter(el =>
        Number(el.dataset.x1) !== Number(el.dataset.x2) || Number(el.dataset.y1) !== Number(el.dataset.y2)
      ).forEach((el, n) => {
        const path = svg.querySelector(`[data-sim-player-path="${el.dataset.simPlayer}"]`);
        tasks.push(wait((420 + n * 150) * f, card, token).then(ok => {
          if (!ok) return false;
          if (path) path.classList.add('is-live');
          return move(el, Number(el.dataset.x1), Number(el.dataset.y1), Number(el.dataset.x2), Number(el.dataset.y2), 3800 * f, card, token);
        }));
      });

      [...(svg?.querySelectorAll('[data-sim-runner]') || [])].forEach((el, n) => {
        const path = svg.querySelector(`[data-sim-runner-path="${el.dataset.simRunner}"]`);
        tasks.push(wait((760 + n * 140) * f, card, token).then(ok => {
          if (!ok) return false;
          if (path) path.classList.add('is-live');
          return move(el, Number(el.dataset.x1), Number(el.dataset.y1), Number(el.dataset.x2), Number(el.dataset.y2), 3400 * f, card, token);
        }));
      });

      await Promise.all(tasks);
      if (!alive(card, token)) return;
      svg?.querySelectorAll('.sim-route.is-live').forEach(x => { x.classList.remove('is-live'); x.classList.add('is-done'); });
      await wait(1500 * f, card, token);

      let ballNow = ball ? [Number(ball.dataset.x2), Number(ball.dataset.y2)] : null;
      for (const path of [...(svg?.querySelectorAll('[data-sim-throw-path]') || [])]) {
        if (!alive(card, token)) return;
        path.classList.add('is-live');
        const x1 = Number(path.getAttribute('x1'));
        const y1 = Number(path.getAttribute('y1'));
        const x2 = Number(path.getAttribute('x2'));
        const y2 = Number(path.getAttribute('y2'));
        if (ball) {
          const sx = ballNow?.[0] ?? x1;
          const sy = ballNow?.[1] ?? y1;
          setXY(ball, sx, sy);
          await move(ball, sx, sy, x2, y2, 1850 * f, card, token);
          ballNow = [x2, y2];
        } else {
          await wait(1850 * f, card, token);
        }
        path.classList.remove('is-live');
        path.classList.add('is-done');
        await wait(430 * f, card, token);
      }

      status(card, 'reset', `STEP ${i + 1} · 최종 위치`, '이동이 끝난 뒤 각 야수의 최종 위치를 충분히 확인하세요.', `STEP ${i + 1} / ${stages.length}`);
      await wait(2300 * f, card, token);
    }

    if (alive(card, token)) setPlaying(card, false);
  }

  function getSituationRoot() {
    return [...document.querySelectorAll('[data-sim-root]')].find(r => !r.closest('.sim-position-lab')) || document.querySelector('[data-sim-root]');
  }

  async function applyPreset(root, preset) {
    const sequence = [
      ['base', preset.base], ['outs', String(preset.outs)], ['kind', preset.kind], ['dir', preset.dir],
      ['align', preset.align], ['focus', preset.focus]
    ];
    for (const [key, value] of sequence) {
      root = getSituationRoot();
      if (!root) return;
      const btn = root.querySelector(`[data-sim-set="${key}"][data-value="${CSS.escape(String(value))}"]`);
      if (btn && !btn.classList.contains('active')) btn.click();
      await Promise.resolve();
    }
    const fresh = getSituationRoot();
    fresh?.querySelector('[data-sim-board]')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function quickPresets(root) {
    if (root.dataset.positionMode === '1' || root.querySelector('.v5-quick-presets')) return;
    const controls = root.querySelector('.sim-controls');
    if (!controls) return;
    const bar = document.createElement('div');
    bar.className = 'v5-quick-presets';
    bar.innerHTML = `<div class="v5-quick-title"><b>⚡ 자주 나오는 상황</b><span>한 번 눌러 바로 세팅</span></div><div class="v5-quick-scroll">${PRESETS.map((p, i) => `<button type="button" data-v5-preset="${i}">${p.label}</button>`).join('')}</div>`;
    controls.before(bar);
  }

  function keyMessage(root) {
    if (root.querySelector('.v5-key-message')) return;
    const board = root.querySelector('[data-sim-board]');
    const key = [...root.querySelectorAll('.sim-info-card')].find(card => card.querySelector('h4')?.textContent.includes('이 상황의 핵심'));
    const headline = key?.querySelector('p b')?.textContent?.trim();
    if (!board || !headline) return;
    const box = document.createElement('div');
    box.className = 'v5-key-message';
    box.innerHTML = `<span>이번 플레이 핵심</span><b>${headline}</b><small>대표 수비 흐름입니다. 세부 담당은 팀 약속·타구 강도·주자 주력에 따라 달라질 수 있습니다.</small>`;
    board.before(box);
  }

  function focusBar(root) {
    const board = root.querySelector('[data-sim-board]');
    if (!board || board.querySelector('.v5-focusbar')) return;
    const current = root.dataset.focus || 'ALL';
    const posMode = root.dataset.positionMode === '1';
    const own = root.dataset.positionCode || current || 'SS';
    const values = posMode ? ['ALL', own] : ['ALL','P','C','1B','2B','3B','SS','LF','CF','RF'];
    const bar = document.createElement('div');
    bar.className = 'v5-focusbar';
    bar.innerHTML = `<span>👀 강조</span><div>${values.map(v => `<button type="button" class="${current === v ? 'active' : ''}" data-v5-focus="${v}">${v === 'ALL' ? '전체' : v}</button>`).join('')}</div>`;
    const field = board.querySelector('.sim-field-wrap');
    field?.before(bar);
  }

  function compactAdvanced(root) {
    if (root.dataset.positionMode === '1' || root.querySelector('.v5-advanced')) return;
    const controls = root.querySelector('.sim-controls');
    if (!controls) return;
    const blocks = [...controls.children].filter(el => el.classList.contains('sim-control-block'));
    if (blocks.length < 6) return;
    const details = document.createElement('details');
    details.className = 'v5-advanced';
    details.innerHTML = '<summary>⚙️ 수비 위치 · 포지션 집중 설정</summary><div class="v5-advanced-body"></div>';
    controls.appendChild(details);
    const body = details.querySelector('.v5-advanced-body');
    blocks.slice(4).forEach(el => body.appendChild(el));
  }

  function badge(root) {
    const actions = root.querySelector('.sim-board-actions');
    if (!actions || actions.querySelector('.v5-rep-badge')) return;
    const badge = document.createElement('span');
    badge.className = 'v5-rep-badge';
    badge.textContent = '대표 수비';
    actions.prepend(badge);
  }

  function enlargePawns(root) {
    root.querySelectorAll('.sim-pawn.fielder > g').forEach(g => {
      if (g.dataset.v5Scaled) return;
      const t = g.getAttribute('transform') || 'scale(1)';
      const m = t.match(/scale\(([^)]+)\)/);
      const base = m ? Number(m[1]) : 1;
      g.setAttribute('transform', `scale(${(base * 1.10).toFixed(3)})`);
      g.dataset.v5Scaled = '1';
    });
    root.querySelectorAll('.sim-ball circle').forEach(c => c.setAttribute('r', '2.15'));
  }

  function enhanceRoot(root) {
    if (!root || !root.isConnected) return;
    quickPresets(root);
    keyMessage(root);
    focusBar(root);
    compactAdvanced(root);
    badge(root);
    enlargePawns(root);
  }

  function enhanceAll() {
    document.querySelectorAll('[data-sim-root]').forEach(enhanceRoot);
    document.querySelectorAll('[data-legacy-diagram]').forEach(card => enlargePawns(card));
  }

  document.addEventListener('click', e => {
    const preset = e.target.closest('[data-v5-preset]');
    if (preset) {
      const root = preset.closest('[data-sim-root]');
      if (!root) return;
      e.preventDefault();
      applyPreset(root, PRESETS[Number(preset.dataset.v5Preset)]);
      return;
    }

    const focus = e.target.closest('[data-v5-focus]');
    if (focus) {
      const root = focus.closest('[data-sim-root]');
      const original = root?.querySelector(`[data-sim-set="focus"][data-value="${CSS.escape(focus.dataset.v5Focus)}"]`);
      if (original) {
        e.preventDefault();
        original.click();
      }
      return;
    }
  });

  document.addEventListener('click', e => {
    const simBtn = e.target.closest('[data-sim-action="play"],[data-sim-action="replay"]');
    if (simBtn) {
      e.preventDefault();
      e.stopImmediatePropagation();
      const root = simBtn.closest('[data-sim-root]');
      if (!root) return;
      root.dataset.v5Run = String(++serial);
      animateScenario(root);
      return;
    }

    const legacyBtn = e.target.closest('[data-legacy-action="play"],[data-legacy-action="replay"]');
    if (legacyBtn) {
      e.preventDefault();
      e.stopImmediatePropagation();
      const card = legacyBtn.closest('[data-legacy-diagram]');
      if (!card) return;
      card.dataset.v5Run = String(++serial);
      animateLegacy(card);
    }
  }, true);

  const observer = new MutationObserver(() => requestAnimationFrame(enhanceAll));
  const target = document.getElementById('view') || document.body;
  observer.observe(target, { childList: true, subtree: true });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', enhanceAll, { once: true });
  } else {
    enhanceAll();
  }
})();
