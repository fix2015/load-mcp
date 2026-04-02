'use strict';

const chalk = require('chalk');
const ora = require('ora');
const fetch = require('node-fetch');
const fs = require('fs');
const { REGISTRY_PATH, clearCache, loadRegistry } = require('../registry');

const GITHUB_API = 'https://api.github.com';

const SOURCES = [
  {
    id: 'official',
    repo: 'modelcontextprotocol/servers',
    path: 'src',
    type: 'official',
  },
  {
    id: 'awesome',
    repo: 'punkpeye/awesome-mcp-servers',
    path: '',
    type: 'curated',
  },
];

async function fetchRepoContents(source) {
  const url = `${GITHUB_API}/repos/${source.repo}/contents/${source.path}`;
  const headers = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'load-mcp-cli',
  };

  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const response = await fetch(url, { headers });

  if (!response.ok) {
    throw new Error(`GitHub API error for ${source.repo}: ${response.status}`);
  }

  const items = await response.json();
  return items
    .filter(item => item.type === 'dir')
    .map(item => item.name);
}

module.exports = async function update() {
  const spinner = ora('Checking for registry updates...').start();

  try {
    let newServersFound = 0;
    const registry = loadRegistry();
    const existingNames = new Set(registry.servers.map(s => s.name));

    for (const source of SOURCES) {
      spinner.text = `Scanning ${chalk.cyan(source.repo)}...`;
      try {
        const serverNames = await fetchRepoContents(source);
        for (const name of serverNames) {
          if (!existingNames.has(name)) {
            registry.servers.push({
              name,
              description: `MCP server from ${source.repo} (run "load-mcp info ${name}" after next update)`,
              tags: [],
              source: source.id,
              compatible: ['claude-code', 'cursor'],
              install_command: `npx -y @modelcontextprotocol/server-${name}`,
              repo_url: `https://github.com/${source.repo}/tree/main/${source.path}/${name}`,
              config_example: {
                command: 'npx',
                args: ['-y', `@modelcontextprotocol/server-${name}`],
              },
            });
            existingNames.add(name);
            newServersFound++;
          }
        }
      } catch (err) {
        spinner.warn(chalk.yellow(`Failed to scan ${source.repo}: ${err.message}`));
        spinner.start();
      }
    }

    registry.updated_at = new Date().toISOString().split('T')[0];
    fs.writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2), 'utf-8');
    clearCache();

    if (newServersFound > 0) {
      spinner.succeed(chalk.green(`Registry updated! Found ${newServersFound} new server(s). Total: ${registry.servers.length}`));
    } else {
      spinner.succeed(chalk.green(`Registry is up to date. Total servers: ${registry.servers.length}`));
    }
  } catch (err) {
    spinner.fail(chalk.red(`Update failed: ${err.message}`));
    process.exit(1);
  }
};
