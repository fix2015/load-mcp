# CLAUDE.md

## Project Overview
load-mcp is a CLI tool to discover, search, and install MCP (Model Context Protocol) servers for Claude Code, Cursor, and other AI tools.

## Tech Stack
- Node.js (CommonJS)
- chalk v4, ora v5, commander, cli-table3, node-fetch v2
- Tests: Node.js built-in test runner (`node --test`)

## Key Commands
- `npm test` - Run all tests
- `npm run scrape` - Rebuild registry from GitHub sources
- `npm start` - Run the CLI

## Project Structure
- `bin/load-mcp.js` - CLI entry point
- `src/registry.js` - Registry loading and querying
- `src/installer.js` - MCP server installation (writes to settings files)
- `src/commands/` - CLI command handlers (install, list, search, info, tags, sources, update)
- `src/scraper/index.js` - GitHub scraper for building registry
- `data/mcp-registry.json` - Local MCP server registry
- `test/` - Tests using Node.js built-in test runner

## Code Style
- CommonJS modules (require/module.exports)
- 'use strict' at top of every file
- 2-space indentation
- Single quotes for strings

## MCP Server Installation
Unlike skills (which are markdown files), MCP servers are installed by adding config entries to settings files:
- Claude Code: `~/.claude/settings.json` under `mcpServers` key
- Cursor: `.cursor/mcp.json` under `mcpServers` key
