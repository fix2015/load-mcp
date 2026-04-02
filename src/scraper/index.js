#!/usr/bin/env node

'use strict';

/**
 * Scraper that fetches MCP server info from GitHub repositories and rebuilds
 * the local mcp-registry.json. Run with: npm run scrape
 */

const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const REGISTRY_PATH = path.join(__dirname, '..', '..', 'data', 'mcp-registry.json');
const GITHUB_API = 'https://api.github.com';

const SOURCES = [
  {
    id: 'official',
    repo: 'modelcontextprotocol/servers',
    path: 'src',
    type: 'official',
    url: 'https://github.com/modelcontextprotocol/servers',
    compatible: ['claude-code', 'cursor'],
  },
  {
    id: 'awesome',
    repo: 'punkpeye/awesome-mcp-servers',
    path: '',
    type: 'curated',
    url: 'https://github.com/punkpeye/awesome-mcp-servers',
    compatible: ['claude-code', 'cursor'],
  },
];

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function githubFetch(url) {
  const headers = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'load-mcp-scraper',
  };

  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const response = await fetch(url, { headers });

  if (response.status === 403) {
    const resetTime = response.headers.get('x-ratelimit-reset');
    if (resetTime) {
      const waitMs = (parseInt(resetTime) * 1000) - Date.now() + 1000;
      console.log(`  Rate limited. Waiting ${Math.ceil(waitMs / 1000)}s...`);
      await sleep(waitMs);
      return githubFetch(url);
    }
  }

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

async function fetchServerDirs(source) {
  if (!source.path) return [];

  const url = `${GITHUB_API}/repos/${source.repo}/contents/${source.path}`;
  try {
    const items = await githubFetch(url);
    return items.filter(item => item.type === 'dir').map(item => item.name);
  } catch (err) {
    console.error(`  Error fetching ${source.repo}: ${err.message}`);
    return [];
  }
}

function parseYamlFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};

  const yaml = match[1];
  const result = {};
  for (const line of yaml.split('\n')) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    const value = line.slice(colonIdx + 1).trim();
    result[key] = value;
  }
  return result;
}

function inferTags(name, description = '') {
  const text = `${name} ${description}`.toLowerCase();
  const tagMap = {
    'database': ['sql', 'postgres', 'mysql', 'sqlite', 'redis', 'mongo', 'database', 'db'],
    'cloud': ['aws', 'azure', 'gcp', 'cloud', 's3', 'lambda', 'ec2'],
    'devops': ['docker', 'kubernetes', 'k8s', 'deploy', 'terraform', 'ansible', 'ci', 'cd'],
    'search': ['search', 'brave', 'google', 'bing', 'everything'],
    'browser': ['browser', 'puppeteer', 'playwright', 'selenium', 'web', 'scrape', 'crawl'],
    'productivity': ['notion', 'linear', 'jira', 'slack', 'trello', 'asana', 'todoist'],
    'git': ['git', 'github', 'gitlab', 'bitbucket'],
    'filesystem': ['file', 'filesystem', 'fs', 'directory'],
    'monitoring': ['sentry', 'datadog', 'monitoring', 'logging', 'observability'],
    'communication': ['slack', 'email', 'twilio', 'sendgrid', 'discord', 'telegram'],
    'payment': ['stripe', 'payment', 'billing'],
    'design': ['figma', 'design', 'ui'],
    'maps': ['maps', 'geo', 'location', 'weather'],
    'ai': ['ai', 'llm', 'embedding', 'memory', 'thinking', 'sequential'],
    'api': ['api', 'rest', 'graphql', 'fetch', 'http'],
    'utility': ['time', 'calculator', 'math', 'convert', 'utility'],
    'storage': ['drive', 'storage', 's3', 'blob', 'bucket'],
  };

  const tags = new Set();
  for (const [tag, keywords] of Object.entries(tagMap)) {
    if (keywords.some(k => text.includes(k))) {
      tags.add(tag);
    }
  }

  return Array.from(tags);
}

async function scrapeAll() {
  console.log('Scraping MCP servers from GitHub repositories...\n');

  const servers = [];
  const seenNames = new Set();

  for (const source of SOURCES) {
    console.log(`Scanning ${source.repo}...`);

    const dirs = await fetchServerDirs(source);
    console.log(`   Found ${dirs.length} server directories`);

    for (const name of dirs) {
      if (seenNames.has(name)) {
        console.log(`   Skipping duplicate: ${name}`);
        continue;
      }

      const tags = inferTags(name, '');

      servers.push({
        name,
        description: `MCP server: ${name.replace(/-/g, ' ')} from ${source.repo}`,
        tags,
        source: source.id,
        compatible: source.compatible,
        install_command: `npx -y @modelcontextprotocol/server-${name}`,
        repo_url: `https://github.com/${source.repo}/tree/main/${source.path}/${name}`,
        config_example: {
          command: 'npx',
          args: ['-y', `@modelcontextprotocol/server-${name}`],
        },
      });

      seenNames.add(name);
    }

    console.log('');
  }

  const registry = {
    version: '1.0.0',
    updated_at: new Date().toISOString().split('T')[0],
    sources: SOURCES.map(({ id, repo, path: p, type, url }) => ({ id, repo, path: p, type, url })),
    servers,
  };

  fs.writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2), 'utf-8');
  console.log(`Saved ${servers.length} servers to ${REGISTRY_PATH}`);
}

// Run if executed directly
if (require.main === module) {
  scrapeAll().catch(err => {
    console.error('Scraper failed:', err);
    process.exit(1);
  });
}

module.exports = { scrapeAll, inferTags, parseYamlFrontmatter };
