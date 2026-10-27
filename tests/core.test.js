const test = require('node:test');
const assert = require('node:assert/strict');
const { cleanCodes, extractCodes } = require('../scripts/core.cjs');
test('accepts distinct case-sensitive codes, rejecting malformed input', () => {
  assert.deepEqual(cleanCodes([' Alpha1 ', 'Alpha1', 'alpha1', '<script>', '', 'a'.repeat(65)]), ['Alpha1', 'alpha1']);
});
test('extracts the declared code list without executing source JavaScript', () => {
  assert.deepEqual(extractCodes('prefix const CODES = ["ABC12","DEF34","ABC12"]; suffix'), ['ABC12', 'DEF34']);
  assert.deepEqual(extractCodes('const CODES = [&quot;ABC12&quot;];'), ['ABC12']);
  assert.throws(() => extractCodes('missing'));
});
