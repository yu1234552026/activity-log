
import test from 'node:test';
import assert from 'node:assert/strict';
import { applyTemplate } from '../../src/utils/templateEngine.js';

test('Template should replace placeholders', () => {
  const result = applyTemplate(
    '{action} {repo}',
    {
      action: 'Pushed to',
      repo: 'example/repo'
    }
  );

  assert.equal(result, 'Pushed to example/repo');
});

test('Template should handle missing values', () => {
  const result = applyTemplate(
    '{action} {repo}',
    {
      action: 'Updated'
    }
  );

  assert.equal(result, 'Updated');
});

test('Empty template should return null', () => {
  assert.equal(applyTemplate('', {}), null);
});

test('Template should remove empty Markdown links', () => {
  const result = applyTemplate(
    '[Repository]({repo_url})',
    {}
  );

  assert.equal(result, 'Repository');
});

test('Template should preserve valid Markdown links', () => {
  const result = applyTemplate(
    '[Repository]({repo_url})',
    {
      repo_url: 'https://github.com/example/repo'
    }
  );

  assert.equal(
    result,
    '[Repository](https://github.com/example/repo)'
  );
});
