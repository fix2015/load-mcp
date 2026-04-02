'use strict';

const chalk = require('chalk');
const ora = require('ora');
const { findServer, searchServers } = require('../registry');
const { installServer, getConfigSnippet } = require('../installer');

module.exports = async function install(name, options = {}) {
  const spinner = ora(`Searching for MCP server "${name}"...`).start();

  try {
    let server = findServer(name);

    if (!server) {
      // Try fuzzy search
      const matches = searchServers(name);
      if (matches.length === 0) {
        spinner.fail(chalk.red(`MCP server "${name}" not found.`));
        console.log(chalk.yellow('\nTry:'));
        console.log(`  load-mcp search ${name}`);
        console.log('  load-mcp list');
        process.exit(1);
      }
      if (matches.length === 1) {
        server = matches[0];
        spinner.info(chalk.yellow(`Exact match not found. Using: ${server.name}`));
      } else {
        spinner.warn(chalk.yellow(`Multiple matches found for "${name}":`));
        console.log('');
        matches.slice(0, 10).forEach(s => {
          console.log(`  ${chalk.cyan(s.name.padEnd(30))} ${chalk.gray(s.description.slice(0, 60))}`);
        });
        if (matches.length > 10) {
          console.log(chalk.gray(`  ... and ${matches.length - 10} more`));
        }
        console.log(chalk.yellow(`\nSpecify the exact name: load-mcp install <name>`));
        process.exit(1);
      }
    }

    const tool = options.tool || 'claude-code';
    spinner.text = `Installing MCP server ${chalk.cyan(server.name)} for ${chalk.green(tool)}...`;
    spinner.start();

    const result = installServer(server, options);

    spinner.succeed(
      chalk.green(`Installed ${chalk.bold(server.name)} to ${chalk.underline(result.settingsPath)}`)
    );
    console.log(chalk.gray(`  Tags: ${server.tags.join(', ')}`));
    console.log(chalk.gray(`  Repo: ${server.repo_url}`));

    // Show the config snippet
    const snippet = getConfigSnippet(server, tool);
    console.log('');
    console.log(chalk.bold('  Config added:'));
    console.log(chalk.cyan(JSON.stringify(snippet, null, 2).split('\n').map(l => '  ' + l).join('\n')));
    console.log('');

    if (server.install_command) {
      console.log(chalk.gray(`  Run command: ${server.install_command}`));
    }
  } catch (err) {
    spinner.fail(chalk.red(`Installation failed: ${err.message}`));
    process.exit(1);
  }
};
