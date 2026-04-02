'use strict';

const chalk = require('chalk');
const { findServer, searchServers } = require('../registry');

module.exports = function info(name, options = {}) {
  let server = findServer(name);

  if (!server) {
    const matches = searchServers(name);
    if (matches.length === 1) {
      server = matches[0];
    } else if (matches.length > 1) {
      console.log(chalk.yellow(`Multiple matches for "${name}":`));
      matches.slice(0, 5).forEach(s => {
        console.log(`  ${chalk.cyan(s.name)}`);
      });
      return;
    } else {
      console.log(chalk.red(`MCP server "${name}" not found.`));
      return;
    }
  }

  if (options.json) {
    console.log(JSON.stringify(server, null, 2));
    return;
  }

  console.log('');
  console.log(chalk.bold.cyan(`  ${server.name}`));
  console.log(chalk.gray('  ' + '\u2500'.repeat(50)));
  console.log(`  ${chalk.bold('Description:')}  ${server.description}`);
  console.log(`  ${chalk.bold('Source:')}       ${server.source}`);
  console.log(`  ${chalk.bold('Tags:')}         ${server.tags.join(', ')}`);
  console.log(`  ${chalk.bold('Compatible:')}   ${server.compatible.join(', ')}`);
  console.log(`  ${chalk.bold('Repo:')}         ${chalk.underline(server.repo_url)}`);
  if (server.install_command) {
    console.log(`  ${chalk.bold('Install cmd:')}  ${chalk.green(server.install_command)}`);
  }
  if (server.config_example) {
    console.log(`  ${chalk.bold('Config:')}`);
    console.log(chalk.cyan(JSON.stringify(server.config_example, null, 2).split('\n').map(l => '    ' + l).join('\n')));
  }
  console.log('');
  console.log(chalk.gray(`  Install: load-mcp install ${server.name}`));
  console.log(chalk.gray(`  Install for Cursor: load-mcp install ${server.name} --tool cursor`));
  console.log('');
};
