'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert');
const { inferTags, parseYamlFrontmatter } = require('../src/scraper/index');

describe('Scraper utilities', () => {
  describe('inferTags', () => {
    it('should detect database tags', () => {
      const tags = inferTags('postgres', 'PostgreSQL database integration');
      assert.ok(tags.includes('database'));
    });

    it('should detect devops tags', () => {
      const tags = inferTags('kubernetes', 'Kubernetes cluster management');
      assert.ok(tags.includes('devops'));
    });

    it('should detect cloud tags', () => {
      const tags = inferTags('aws-server', 'AWS cloud integration');
      assert.ok(tags.includes('cloud'));
    });

    it('should detect communication tags', () => {
      const tags = inferTags('slack', 'Slack messaging integration');
      assert.ok(tags.includes('communication'));
    });

    it('should return empty for unrecognized servers', () => {
      const tags = inferTags('xyz-unknown', 'something completely unrelated');
      assert.ok(Array.isArray(tags));
    });
  });

  describe('parseYamlFrontmatter', () => {
    it('should parse simple frontmatter', () => {
      const content = `---
name: test-server
description: A test MCP server
license: MIT
---

# Content here`;
      const result = parseYamlFrontmatter(content);
      assert.strictEqual(result.name, 'test-server');
      assert.strictEqual(result.description, 'A test MCP server');
      assert.strictEqual(result.license, 'MIT');
    });

    it('should return empty object for no frontmatter', () => {
      const result = parseYamlFrontmatter('# Just a heading\nSome content');
      assert.deepStrictEqual(result, {});
    });
  });
});
