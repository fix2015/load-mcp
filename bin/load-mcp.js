#!/usr/bin/env node

'use strict';

const { program } = require('commander');
const pkg = require('../package.json');

const installCmd = require('../src/commands/install');
const listCmd = require('../src/commands/list');
const searchCmd = require('../src/commands/search');
const infoCmd = require('../src/commands/info');
const updateCmd = require('../src/commands/update');
const tagsCmd = require('../src/commands/tags');
const sourcesCmd = require('../src/commands/sources');

program
  .name('load-mcp')
  .version(pkg.version)
  .description('Discover, search, and install MCP servers for Claude Code, Cursor, and other AI tools');

program
  .command('install <name>')
  .alias('i')
  .description('Install an MCP server by name')
  .option('-t, --tool <tool>', 'Target tool: claude-code, cursor (default: claude-code)', 'claude-code')
  .option('-g, --global', 'Install globally for the tool')
  .action(installCmd);

program
  .command('list')
  .alias('ls')
  .description('List all available MCP servers')
  .option('-s, --source <source>', 'Filter by source (official, community, etc.)')
  .option('-t, --tag <tag>', 'Filter by tag')
  .option('--tool <tool>', 'Filter by compatible tool')
  .option('-j, --json', 'Output as JSON')
  .action(listCmd);

program
  .command('search <query>')
  .alias('s')
  .description('Search MCP servers by name, description, or tags')
  .option('-t, --tag <tag>', 'Also filter by tag')
  .option('--tool <tool>', 'Filter by compatible tool')
  .option('-j, --json', 'Output as JSON')
  .action(searchCmd);

program
  .command('info <name>')
  .description('Show detailed information about an MCP server')
  .option('-j, --json', 'Output as JSON')
  .action(infoCmd);

program
  .command('tags')
  .description('List all available tags with server counts')
  .action(tagsCmd);

program
  .command('sources')
  .description('List all MCP server sources/repositories')
  .action(sourcesCmd);

program
  .command('update')
  .description('Update the MCP server registry from remote sources')
  .action(updateCmd);

// Default: if first arg matches a server name, install it
program.arguments('[name]').action((name, opts) => {
  if (name) {
    installCmd(name, { tool: 'claude-code' });
  } else {
    program.help();
  }
});

program.parse(process.argv);
