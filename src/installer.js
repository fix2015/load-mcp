'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

const TOOL_CONFIGS = {
  'claude-code': {
    settingsPath: path.join(os.homedir(), '.claude', 'settings.json'),
    key: 'mcpServers',
    description: 'Claude Code',
  },
  'cursor': {
    settingsPath: path.join(process.cwd(), '.cursor', 'mcp.json'),
    key: 'mcpServers',
    description: 'Cursor',
  },
};

function getSettingsPath(tool, { global: isGlobal = false } = {}) {
  const config = TOOL_CONFIGS[tool];
  if (!config) {
    throw new Error(`Unknown tool: ${tool}. Supported: ${Object.keys(TOOL_CONFIGS).join(', ')}`);
  }

  if (tool === 'cursor' && isGlobal) {
    return path.join(os.homedir(), '.cursor', 'mcp.json');
  }

  return config.settingsPath;
}

function readSettings(settingsPath) {
  try {
    if (fs.existsSync(settingsPath)) {
      const raw = fs.readFileSync(settingsPath, 'utf-8');
      return JSON.parse(raw);
    }
  } catch {
    // If file is corrupted, start fresh
  }
  return {};
}

function installServer(server, options = {}) {
  const tool = options.tool || 'claude-code';
  const settingsPath = getSettingsPath(tool, options);
  const config = TOOL_CONFIGS[tool];

  const settings = readSettings(settingsPath);

  // Ensure mcpServers key exists
  if (!settings[config.key]) {
    settings[config.key] = {};
  }

  // Build the server config from the registry entry
  let serverConfig;
  if (server.config_example) {
    serverConfig = server.config_example;
  } else {
    // Default: assume npx-based server
    const parts = server.install_command ? server.install_command.split(' ') : ['npx', '-y', server.name];
    serverConfig = {
      command: parts[0],
      args: parts.slice(1),
    };
  }

  settings[config.key][server.name] = serverConfig;

  // Write settings
  const dir = path.dirname(settingsPath);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2), 'utf-8');

  return { settingsPath, serverConfig };
}

function getConfigSnippet(server, tool = 'claude-code') {
  const config = TOOL_CONFIGS[tool];
  if (!config) return null;

  let serverConfig;
  if (server.config_example) {
    serverConfig = server.config_example;
  } else {
    const parts = server.install_command ? server.install_command.split(' ') : ['npx', '-y', server.name];
    serverConfig = {
      command: parts[0],
      args: parts.slice(1),
    };
  }

  const snippet = {
    [config.key]: {
      [server.name]: serverConfig,
    },
  };

  return snippet;
}

module.exports = {
  installServer,
  getSettingsPath,
  getConfigSnippet,
  readSettings,
  TOOL_CONFIGS,
};
