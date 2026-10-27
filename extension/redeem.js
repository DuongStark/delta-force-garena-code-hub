let running = false;
let stopped = false;
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const visible = el => !!el && getComputedStyle(el).display !== 'none' && getComputedStyle(el).visibility !== 'hidden';
const state = async value => chrome.storage.local.set({runState:value});
const closeDialog = () => { const d = document.querySelector('.dia.dia-tips'); if (visible(d)) d.querySelector('.btn-close')?.click(); };
async function run(codes) {
  running = true; stopped = false;
  const results = [];
  const update = (status, note = '') => state({status, note, total:codes.length, results:[...results]});
  try {
    const input = document.querySelector('input.exc-input');
    const button = document.querySelector('a.btn-exchange');
    if (!input || !button || !visible(input) || !visible(button)) { await update('error', 'Không thấy ô nhập mã. Hãy đăng nhập trên trang Garena và tải lại trang.'); return; }
    await update('running');
    for (const code of codes) {
      if (stopped) { await update('stopped', 'Đã dừng theo yêu cầu.'); return; }
      closeDialog();
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
      setter.call(input, code); input.dispatchEvent(new Event('input', {bubbles:true})); input.dispatchEvent(new Event('change', {bubbles:true}));
      await sleep(300);
      if (stopped) { await update('stopped', 'Đã dừng theo yêu cầu.'); return; }
      button.click();
      let message = '';
      const deadline = Date.now() + 10000;
      while (Date.now() < deadline && !stopped) {
        await sleep(250);
        const dialog = document.querySelector('.dia.dia-tips');
        if (visible(dialog)) { message = (dialog.querySelector('p')?.innerText || dialog.innerText || '').trim(); if (message) break; }
      }
      if (stopped) { await update('stopped', 'Đã dừng theo yêu cầu.'); return; }
      if (!message) { results.push({code, message:'Không nhận được phản hồi'}); await update('error', 'Đã dừng vì Garena không phản hồi. Kiểm tra tab Garena trước khi chạy lại.'); return; }
      results.push({code, message:message.slice(0, 500)}); await update('running');
      if (/too (many|frequent)|frequen|rate limit|try again later|quá nhanh|quá nhiều|thử lại sau|log\s*in|đăng nhập|captcha|verification/i.test(message)) { await update('error', 'Garena yêu cầu kiểm tra hoặc giới hạn thao tác. Hãy xem thông báo trên trang Garena.'); return; }
      closeDialog(); await sleep(3000);
    }
    await update('complete', 'Đã thử hết danh sách. Xem kết quả từng mã bên dưới.');
  } catch { await update('error', 'Không thể tiếp tục. Hãy kiểm tra tab Garena và thử lại.'); }
  finally { running = false; }
}
chrome.runtime.onMessage.addListener((message, sender, respond) => {
  if (sender.id !== chrome.runtime.id) return;
  if (message.type === 'stop') { stopped = true; respond({ok:true}); return; }
  if (message.type === 'run') {
    if (running) { respond({ok:false,error:'Một lượt đổi mã đang chạy.'}); return; }
    if (!Array.isArray(message.codes) || !message.codes.length || message.codes.length > 500 || message.codes.some(c => typeof c !== 'string' || !/^[A-Za-z0-9_-]{1,64}$/.test(c))) { respond({ok:false,error:'Danh sách mã không hợp lệ.'}); return; }
    run(message.codes); respond({ok:true});
  }
});
