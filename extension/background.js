const isGarena = tab => { try { return new URL(tab.url).origin === 'https://redeem.df.garena.sg'; } catch { return false; } };
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!sender.tab || !['run', 'stop'].includes(message?.type)) return;
  (async () => {
    const tabs = (await chrome.tabs.query({})).filter(isGarena);
    if (!tabs.length) return { ok: false, error: 'Hãy mở trang đổi mã Garena và đăng nhập trước.' };
    if (tabs.length > 1) return { ok: false, error: 'Hãy chỉ mở một tab đổi mã Garena để chọn đúng tài khoản.' };
    if (message.type === 'run' && (!Array.isArray(message.codes) || message.codes.length < 1 || message.codes.length > 500 || message.codes.some(c => typeof c !== 'string' || !/^[A-Za-z0-9_-]{1,64}$/.test(c)))) return { ok: false, error: 'Danh sách mã không hợp lệ.' };
    try { return await chrome.tabs.sendMessage(tabs[0].id, message); }
    catch { return { ok: false, error: 'Không kết nối được tab Garena. Hãy tải lại tab sau khi cài tiện ích.' }; }
  })().then(sendResponse);
  return true;
});
