function cleanCodes(values) {
  return [...new Set(values.filter(v => typeof v === 'string').map(v => v.trim()).filter(v => /^[A-Za-z0-9_-]{1,64}$/.test(v)))];
}
function extractCodes(html) {
  const match = html.match(/const CODES\s*=\s*(\[[^\]]*\])/);
  if (!match) throw new Error('Không tìm thấy danh sách mã trong nguồn.');
  const raw = JSON.parse(match[1].replace(/&quot;|&#34;|&#x22;/gi, '"'));
  if (!Array.isArray(raw)) throw new Error('Danh sách không hợp lệ.');
  return cleanCodes(raw);
}
module.exports = { cleanCodes, extractCodes };
