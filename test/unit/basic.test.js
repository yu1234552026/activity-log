
import test from 'node:test';
import assert from 'node:assert/strict';

test('Addition should return the correct result', () => {
  assert.equal(1 + 1, 2);
});

test('Array should contain the expected elements', () => {
  const items = ['build', 'test', 'release'];
  assert.equal(items.length, 3);
  assert.ok(items.includes('test'));
});

test('Environment variable should be valid', () => {
  const environment = process.env.TEST_ENV || 'staging';
  assert.ok(['staging', 'prod'].includes(environment));
});
