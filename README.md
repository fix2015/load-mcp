# load-mcp

> CLI tool to discover, search, and install MCP (Model Context Protocol) servers for Claude Code, Cursor, and other AI tools.

[![npm version](https://img.shields.io/npm/v/load-mcp.svg)](https://www.npmjs.com/package/load-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## What is MCP?

**Model Context Protocol (MCP)** is an open standard that allows AI assistants like Claude to connect to external tools and data sources. MCP servers provide capabilities such as file access, database queries, API integrations, web browsing, and more.

**load-mcp** makes it easy to discover and install MCP servers from a curated registry of 50+ servers. No more manually editing JSON config files.

## Quick Start

```bash
# Install an MCP server instantly (no install needed)
npx load-mcp install github

# Or install globally
npm install -g load-mcp
load-mcp install puppeteer
```

## Features

- **50+ MCP servers** from official and community sources, pre-indexed and ready to install
- **Multi-tool support** — install servers for Claude Code or Cursor
- **Fast search** — find servers by name, description, or tags
- **Auto-config** — automatically adds server config to your settings files
- **Config snippets** — shows you exactly what config was added
- **Programmatic API** — use as a library in your own tools

## Commands

### Install an MCP server

```bash
load-mcp install github                  # Install for Claude Code (default)
load-mcp install github --tool cursor    # Install for Cursor
load-mcp install github --global         # Install globally
load-mcp <name>                          # Shorthand for install
```

When you run install, load-mcp:
1. Looks up the server in the registry
2. Adds the server config to your settings file
3. Shows you the config snippet that was added

**Claude Code** config is added to `~/.claude/settings.json`:
```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "<your-token>"
      }
    }
  }
}
```

**Cursor** config is added to `.cursor/mcp.json`:
```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "<your-token>"
      }
    }
  }
}
```

### Search & browse

```bash
load-mcp list                        # List all MCP servers
load-mcp list --source official      # Filter by source
load-mcp list --tag database         # Filter by tag
load-mcp list --tool cursor          # Filter by compatible tool

load-mcp search database             # Search by keyword
load-mcp search "file" --tag utility

load-mcp info puppeteer              # Detailed info about a server
load-mcp tags                        # Show all tags with counts
load-mcp sources                     # Show all server sources
```

### Update registry

```bash
load-mcp update                          # Fetch latest servers from GitHub
GITHUB_TOKEN=ghp_xxx load-mcp update     # Use token for higher rate limits
```

### JSON output

```bash
load-mcp list --json                 # Machine-readable output
load-mcp search database --json
load-mcp info github --json
```

## Available MCP Servers

| Category | Servers |
|----------|---------|
| **Databases** | PostgreSQL, MySQL, SQLite, Redis, MongoDB, Elasticsearch, Neo4j, BigQuery, Snowflake, Supabase, Airtable |
| **Git & Code** | GitHub, GitLab |
| **Productivity** | Notion, Linear, Jira, Todoist, Google Calendar, Obsidian, Confluence |
| **Cloud & DevOps** | AWS, Docker, Kubernetes, Vercel, Cloudflare, Terraform, CircleCI |
| **Communication** | Slack, Discord, Telegram, Twilio, SendGrid |
| **Browser & Search** | Brave Search, Puppeteer, Playwright, Fetch |
| **Monitoring** | Sentry, Datadog, Grafana, Prometheus, PagerDuty, Raygun |
| **Design** | Figma |
| **Payments** | Stripe, Shopify |
| **Maps & Location** | Google Maps, Weather |
| **AI & Utility** | Memory, Sequential Thinking, Everything, Time, Calculator |
| **Storage** | Google Drive, Filesystem |

## Server Sources

| Source | Repository | Type |
|--------|-----------|------|
| Official | [modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers) | Official |
| Community | [punkpeye/awesome-mcp-servers](https://github.com/punkpeye/awesome-mcp-servers) | Curated |
| Third-party | Various GitHub repos | Community |

## Programmatic API

```javascript
const { findServer, searchServers, installServer } = require('load-mcp');

// Search
const results = searchServers('database', { tag: 'cloud' });

// Get server info
const server = findServer('github');

// Install programmatically
installServer(server, { tool: 'claude-code', global: true });
```

## Rebuild the Registry

The scraper fetches MCP server metadata from GitHub sources:

```bash
npm run scrape                          # Rebuild from GitHub
GITHUB_TOKEN=ghp_xxx npm run scrape     # With auth for higher rate limits
```

## Contributing

1. Fork the repo
2. Add servers to `data/mcp-registry.json` or add a new source in `src/scraper/index.js`
3. Submit a PR

### Adding a new MCP server to the registry

Add an entry to the `servers` array in `data/mcp-registry.json`:

```json
{
  "name": "my-server",
  "description": "Description of what the server does",
  "tags": ["database", "api"],
  "source": "community",
  "compatible": ["claude-code", "cursor"],
  "install_command": "npx -y my-mcp-server",
  "repo_url": "https://github.com/owner/my-mcp-server",
  "config_example": {
    "command": "npx",
    "args": ["-y", "my-mcp-server"],
    "env": {
      "API_KEY": "<your-key>"
    }
  }
}
```

## License

MIT
