
'use strict';
(() => {
  const topBtn = document.querySelector('#homeBtn');
  if (!topBtn || typeof routeTo !== 'function') return;

  const stack = [];
  const originalRouteTo = routeTo;
  const snapshot = () => ({ route: state.route, params: { ...(state.params || {}) } });
  const same = (a, route, params) => a.route === route && JSON.stringify(a.params || {}) === JSON.stringify(params || {});

  function updateBackButton() {
    topBtn.textContent = '←';
    topBtn.id = 'backBtn';
    topBtn.setAttribute('aria-label', '뒤로가기');
    topBtn.setAttribute('title', '뒤로가기');
    const atHome = state.route === 'home';
    topBtn.disabled = atHome;
    topBtn.style.opacity = atHome ? '.32' : '1';
    topBtn.style.cursor = atHome ? 'default' : 'pointer';
  }

  routeTo = function(route, params = {}) {
    const current = snapshot();
    if (!same(current, route, params)) stack.push(current);
    originalRouteTo(route, params);
    updateBackButton();
  };

  function goBack() {
    if (state.route === 'home') return;
    const prev = stack.pop();
    if (prev) originalRouteTo(prev.route, prev.params || {});
    else originalRouteTo('home', {});
    updateBackButton();
  }

  // app.js가 기존 홈 버튼에 등록한 클릭 핸들러보다 먼저 가로챈다.
  document.addEventListener('click', (e) => {
    const btn = e.target.closest && e.target.closest('#backBtn');
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    goBack();
  }, true);

  updateBackButton();
})();
