'use strict';

const chalk = require('chalk');
const Table = require('cli-table3');
const { searchServers } = require('../registry');

module.exports = function search(query, options = {}) {
  const results = searchServers(query, {
    tag: options.tag,
    tool: options.tool,
  });

  if (options.json) {
    console.log(JSON.stringify(results, null, 2));
    return;
  }

  if (results.length === 0) {
    console.log(chalk.yellow(`No MCP servers found for "${query}".`));
    console.log(chalk.gray('Try a broader search term or browse: load-mcp list'));
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

  for (const server of results) {
    const highlighted = server.name.replace(
      new RegExp(`(${query})`, 'gi'),
      chalk.yellow('$1')
    );
    table.push([
      chalk.bold(highlighted),
      server.description.slice(0, 80),
      chalk.gray(server.source),
      chalk.gray(server.tags.slice(0, 3).join(', ')),
    ]);
  }

  console.log(`\n${chalk.bold(`Search Results for "${query}" (${results.length})`)}:\n`);
  console.log(table.toString());
  console.log(chalk.gray(`\nInstall: load-mcp install <name>`));
};
