const channel = 'delta-garena-hub-v1';
window.postMessage({channel, type:'extension-ready'}, location.origin);
window.addEventListener('message', async event => {
  if (event.source !== window || event.origin !== location.origin || event.data?.channel !== channel) return;
  if (event.data.type === 'ping') window.postMessage({channel, type:'extension-ready'}, location.origin);
  if (!['run','stop'].includes(event.data.type)) return;
  try {
    const response = await chrome.runtime.sendMessage({type:event.data.type, codes:event.data.codes});
    window.postMessage({channel, type:'response', response}, location.origin);
  } catch { window.postMessage({channel, type:'response', response:{ok:false,error:'Tiện ích chưa sẵn sàng. Hãy tải lại trang.'}}, location.origin); }
});
chrome.storage.local.get('runState').then(({runState}) => { if (runState) window.postMessage({channel, type:'state', state:runState}, location.origin); });
chrome.storage.onChanged.addListener((changes, area) => { if (area === 'local' && changes.runState) window.postMessage({channel, type:'state', state:changes.runState.newValue}, location.origin); });
