'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert');
const {
  getAllServers,
  findServer,
  searchServers,
  filterServers,
  getAllTags,
  getSources,
} = require('../src/registry');

describe('Registry', () => {
  it('should load all servers', () => {
    const servers = getAllServers();
    assert.ok(servers.length > 0, 'Should have at least one server');
  });

  it('should find server by exact name', () => {
    const server = findServer('github');
    assert.ok(server, 'Should find github');
    assert.strictEqual(server.name, 'github');
  });

  it('should find server case-insensitively', () => {
    const server = findServer('GitHub');
    assert.ok(server, 'Should find server regardless of case');
  });

  it('should return undefined for unknown server', () => {
    const server = findServer('nonexistent-server-xyz');
    assert.strictEqual(server, undefined);
  });

  it('should search by keyword in name', () => {
    const results = searchServers('postgres');
    assert.ok(results.length > 0, 'Should find postgres-related servers');
    assert.ok(results.some(s => s.name.includes('postgres')));
  });

  it('should search by keyword in description', () => {
    const results = searchServers('database');
    assert.ok(results.length > 0, 'Should find database-related servers');
  });

  it('should filter by tag', () => {
    const results = searchServers('', { tag: 'database' });
    assert.ok(results.length > 0);
    assert.ok(results.every(s => s.tags.includes('database')));
  });

  it('should filter by source', () => {
    const results = filterServers({ source: 'official' });
    assert.ok(results.length > 0);
    assert.ok(results.every(s => s.source === 'official'));
  });

  it('should filter by tool', () => {
    const results = filterServers({ tool: 'claude-code' });
    assert.ok(results.length > 0);
    assert.ok(results.every(s => s.compatible.includes('claude-code')));
  });

  it('should get all tags with counts', () => {
    const tags = getAllTags();
    assert.ok(tags.length > 0);
    assert.ok(tags[0].tag);
    assert.ok(tags[0].count > 0);
    // Should be sorted by count descending
    for (let i = 1; i < tags.length; i++) {
      assert.ok(tags[i].count <= tags[i - 1].count, 'Tags should be sorted by count desc');
    }
  });

  it('should get sources', () => {
    const sources = getSources();
    assert.ok(sources.length > 0);
    assert.ok(sources[0].id);
    assert.ok(sources[0].repo);
  });

  it('every server should have required fields', () => {
    const servers = getAllServers();
    for (const server of servers) {
      assert.ok(server.name, `Server missing name`);
      assert.ok(server.description, `Server ${server.name} missing description`);
      assert.ok(Array.isArray(server.tags), `Server ${server.name} tags should be array`);
      assert.ok(server.source, `Server ${server.name} missing source`);
      assert.ok(Array.isArray(server.compatible), `Server ${server.name} compatible should be array`);
    }
  });
});
