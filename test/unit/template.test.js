
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  applyTemplate,
  extractEventData,
  getEventAction
} from '../../src/utils/templateEngine.js';

// Template rendering tests

test('Template should replace placeholders', () => {
  assert.equal(
    applyTemplate('{action} {repo}', {
      action: 'Pushed to',
      repo: 'example/repo'
    }),
    'Pushed to example/repo'
  );
});

test('Template should handle missing values', () => {
  assert.equal(
    applyTemplate('{action} {repo}', {
      action: 'Updated'
    }),
    'Updated'
  );
});

test('Empty template should return null', () => {
  assert.equal(applyTemplate('', {}), null);
});

test('Template should remove empty Markdown links', () => {
  assert.equal(
    applyTemplate('[Repository]({repo_url})', {}),
    'Repository'
  );
});

test('Template should preserve valid Markdown links', () => {
  assert.equal(
    applyTemplate('[Repository]({repo_url})', {
      repo_url: 'https://github.com/example/repo'
    }),
    '[Repository](https://github.com/example/repo)'
  );
});

test('Template should replace repeated placeholders', () => {
  assert.equal(
    applyTemplate('{repo} and {repo}', {
      repo: 'example/repo'
    }),
    'example/repo and example/repo'
  );
});

test('Invalid template type should return null', () => {
  assert.equal(applyTemplate(123, {}), null);
});

// Event action tests

test('PushEvent should use committed action', () => {
  assert.equal(
    getEventAction('PushEvent', {}),
    'committed'
  );
});

test('Pull request merge should be detected', () => {
  assert.equal(
    getEventAction('PullRequestEvent', {
      action: 'closed',
      pull_request: { merged: true }
    }),
    'merged'
  );
});

test('StarEvent should return starred action', () => {
  assert.equal(
    getEventAction('StarEvent', {}),
    'starred'
  );
});

test('Unknown event should use fallback action', () => {
  assert.equal(
    getEventAction('UnknownEvent', {}),
    'performed action'
  );
});

// Event data extraction tests

function createEvent(type, payload = {}, isPublic = true) {
  return {
    type,
    public: isPublic,
    repo: { name: 'example/repo' },
    payload,
    created_at: '2026-10-15T00:00:00Z'
  };
}

test('Public push event should generate commit URL', () => {
  const result = extractEventData(
    createEvent('PushEvent', {
      head: 'abc123',
      ref: 'refs/heads/master'
    }),
    {}
  );

  assert.equal(result.action, 'Committed to');
  assert.equal(result.repo, 'example/repo');
  assert.equal(result.ref, 'master');
  assert.equal(
    result.url,
    'https://github.com/example/repo/commit/abc123'
  );
});

test('Private event should hide repository details', () => {
  const result = extractEventData(
    createEvent('PushEvent', {}, false),
    {},
    true
  );

  assert.equal(result.repo, 'a private repository');
  assert.equal(result.repo_url, '');
  assert.equal(result.url, '');
});

test('Issue event should include issue number', () => {
  const result = extractEventData(
    createEvent('IssuesEvent', {
      action: 'opened',
      issue: { number: 42 }
    }),
    {}
  );

  assert.equal(result.number, '#42');
  assert.equal(
    result.url,
    'https://github.com/example/repo/issues/42'
  );
});

test('Release event should include tag name', () => {
  const result = extractEventData(
    createEvent('ReleaseEvent', {
      release: {
        tag_name: 'v1.0.0',
        html_url: 'https://github.com/example/repo/releases/tag/v1.0.0'
      }
    }),
    {}
  );

  assert.equal(result.ref, 'v1.0.0');
  assert.equal(result.action, 'Published');
});

test('CreateEvent should identify new branches', () => {
  const result = extractEventData(
    createEvent('CreateEvent', {
      ref_type: 'branch',
      ref: 'feature/testing'
    }),
    {}
  );

  assert.equal(result.ref, 'feature/testing');
  assert.equal(result.subject, 'a new branch');
});

test('Event emoji mapping should be applied', () => {
  const result = extractEventData(
    createEvent('PushEvent', {}),
    { PushEvent: 'TEST' }
  );

  assert.equal(result.emoji, 'TEST');
});
