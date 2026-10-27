const fs = require('node:fs');
const { extractCodes } = require('./core.cjs');
(async () => {
  const url = 'https://dfloadout.gg/en/code-garena';
  const response = await fetch(url, { signal: AbortSignal.timeout(20000) });
  if (!response.ok) throw new Error(`Nguồn trả về ${response.status}`);
  const codes = extractCodes(await response.text());
  if (codes.length < 5) throw new Error('Nguồn có quá ít mã; giữ nguyên dữ liệu cũ.');
  const data = { source: url, collectedAt: new Date().toISOString(), status: 'unverified', codes };
  fs.writeFileSync('docs/codes.json.tmp', JSON.stringify(data, null, 2) + '\n');
  fs.renameSync('docs/codes.json.tmp', 'docs/codes.json');
  console.log(`Đã thu thập ${codes.length} mã chưa xác minh.`);
})().catch(error => { console.error(error.message); process.exitCode = 1; });
