
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('Project configuration should exist', () => {
  assert.ok(fs.existsSync('package.json'));
});

test('Build entry point should exist', () => {
  assert.ok(fs.existsSync('src/index.js'));
});

test('Build artifact should exist', () => {
  const artifactPath = path.join('dist', 'index.js');
  assert.ok(
    fs.existsSync(artifactPath),
    'Build artifact dist/index.js is missing'
  );
});

test('Package configuration should contain build and test scripts', () => {
  const pkg = JSON.parse(
    fs.readFileSync('package.json', 'utf8')
  );

  assert.ok(pkg.scripts.build);
  assert.ok(pkg.scripts['test:unit']);
  assert.ok(pkg.scripts['test:integration']);
});
