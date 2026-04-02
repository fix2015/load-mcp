'use strict';

const chalk = require('chalk');
const Table = require('cli-table3');
const { filterServers } = require('../registry');

module.exports = function list(options = {}) {
  const servers = filterServers({
    source: options.source,
    tag: options.tag,
    tool: options.tool,
  });

  if (options.json) {
    console.log(JSON.stringify(servers, null, 2));
    return;
  }

  if (servers.length === 0) {
    console.log(chalk.yellow('No MCP servers found matching your filters.'));
    return;
  }

  const table = new Table({
    head: [
      chalk.cyan('Name'),
      chalk.cyan('Description'),
      chalk.cyan('Source'),
      chalk.cyan('Tags'),
    ],
    colWidths: [25, 50, 14, 25],
    wordWrap: true,
    style: { head: [], border: [] },
  });

  for (const server of servers) {
    table.push([
      chalk.bold(server.name),
      server.description.slice(0, 80),
      chalk.gray(server.source),
      chalk.gray(server.tags.slice(0, 3).join(', ')),
    ]);
  }

  console.log(`\n${chalk.bold(`Available MCP Servers (${servers.length})`)}:\n`);
  console.log(table.toString());
  console.log(chalk.gray(`\nInstall: load-mcp install <name>`));
  console.log(chalk.gray(`Details: load-mcp info <name>`));
};
