(() => {
  const $ = id => document.getElementById(id);
  const channel = 'delta-garena-hub-v1';
  let codes = [], selected = new Set(), extensionReady = false, running = false;
  const send = (type, extra = {}) => window.postMessage({channel, type, ...extra}, location.origin);
  function updateButtons() {
    $('run').disabled = !extensionReady || !selected.size || running;
    $('stop').disabled = !extensionReady || !running;
    $('selected-count').textContent = selected.size;
    $('run-count').textContent = `${selected.size} MÃ ĐÃ CHỌN`;
  }
  function renderCodes() {
    const query = $('search').value.trim().toLowerCase();
    const fragment = document.createDocumentFragment();
    for (const code of codes.filter(c => c.toLowerCase().includes(query))) {
      const row = document.createElement('div'); row.className = 'code-row';
      const label = document.createElement('label');
      const checkbox = document.createElement('input'); checkbox.type = 'checkbox'; checkbox.checked = selected.has(code);
      checkbox.addEventListener('change', () => { if (checkbox.checked) selected.add(code); else selected.delete(code); updateButtons(); });
      const name = document.createElement('span'); name.textContent = code;
      const tag = document.createElement('span'); tag.className = 'tag'; tag.textContent = '● Chưa xác minh';
      label.append(checkbox, name); row.append(label, tag); fragment.append(row);
    }
    $('code-list').replaceChildren(fragment);
    if (!fragment.childNodes.length && !codes.some(c => c.toLowerCase().includes(query))) { const empty = document.createElement('div'); empty.className = 'empty'; empty.textContent = 'Không tìm thấy mã.'; $('code-list').append(empty); }
    updateButtons();
  }
  function renderState(state) {
    if (!state || !Array.isArray(state.results)) return;
    running = state.status === 'running';
    $('run-note').textContent = state.note || (running ? 'Đang đổi mã. Giữ tab Garena mở trong khi chạy.' : '');
    $('progress-text').textContent = `${state.results.length} / ${state.total || 0} MÃ ĐÃ THỬ · ${state.status.toUpperCase()}`;
    $('progress-bar').style.width = `${Math.min(100, state.total ? state.results.length / state.total * 100 : 0)}%`;
    const fragment = document.createDocumentFragment();
    for (const result of state.results.slice().reverse()) { const row = document.createElement('div'); row.className = 'result'; const name = document.createElement('strong'); const message = document.createElement('span'); name.textContent = result.code; message.textContent = result.message; row.append(name, message); fragment.append(row); }
    if (!state.results.length) { const empty = document.createElement('div'); empty.className = 'empty'; empty.textContent = running ? 'Đang chờ Garena phản hồi…' : 'Chưa có kết quả.'; fragment.append(empty); }
    $('results-list').replaceChildren(fragment); updateButtons();
  }
  window.addEventListener('message', e => {
    if (e.source !== window || e.origin !== location.origin || e.data?.channel !== channel) return;
    if (e.data.type === 'extension-ready') { extensionReady = true; $('extension-status').textContent = '● TIỆN ÍCH ĐÃ KẾT NỐI'; updateButtons(); }
    if (e.data.type === 'response' && !e.data.response?.ok) { $('run-note').textContent = e.data.response?.error || 'Không thể kết nối tiện ích.'; $('run-note').scrollIntoView({behavior:'smooth',block:'center'}); }
    if (e.data.type === 'state') renderState(e.data.state);
  });
  $('search').addEventListener('input', renderCodes);
  $('select-all').addEventListener('click', () => { for (const code of codes) selected.add(code); renderCodes(); });
  $('select-none').addEventListener('click', () => { selected.clear(); renderCodes(); });
  $('run').addEventListener('click', () => { send('run', {codes:codes.filter(c => selected.has(c))}); $('run-note').textContent = 'Đang kết nối với trang Garena…'; });
  $('stop').addEventListener('click', () => send('stop'));
  fetch('codes.json').then(response => { if (!response.ok) throw new Error(); return response.json(); }).then(data => {
    if (!Array.isArray(data.codes)) throw new Error();
    codes = [...new Set(data.codes.filter(c => typeof c === 'string' && /^[A-Za-z0-9_-]{1,64}$/.test(c)))];
    selected = new Set(codes); $('total').textContent = codes.length;
    $('collected').textContent = new Date(data.collectedAt).toLocaleString('vi-VN'); renderCodes();
  }).catch(() => { $('code-list').textContent = 'Không tải được kho mã. Hãy tải lại trang.'; });
  send('ping'); setTimeout(() => { if (!extensionReady) $('extension-status').textContent = '● CHƯA KẾT NỐI TIỆN ÍCH'; }, 1500);
})();
