'use strict';

const path = require('path');
const fs = require('fs');

const REGISTRY_PATH = path.join(__dirname, '..', 'data', 'mcp-registry.json');

let _cache = null;

function loadRegistry() {
  if (_cache) return _cache;
  const raw = fs.readFileSync(REGISTRY_PATH, 'utf-8');
  _cache = JSON.parse(raw);
  return _cache;
}

function getAllServers() {
  return loadRegistry().servers;
}

function getSources() {
  return loadRegistry().sources;
}

function getVersion() {
  return loadRegistry().version;
}

function getUpdatedAt() {
  return loadRegistry().updated_at;
}

function findServer(name) {
  const servers = getAllServers();
  // Exact match first
  const exact = servers.find(s => s.name === name);
  if (exact) return exact;
  // Case-insensitive
  const lower = name.toLowerCase();
  return servers.find(s => s.name.toLowerCase() === lower);
}

function searchServers(query, { tag, tool } = {}) {
  let servers = getAllServers();

  if (tag) {
    servers = servers.filter(s => s.tags.includes(tag.toLowerCase()));
  }
  if (tool) {
    servers = servers.filter(s => s.compatible.includes(tool.toLowerCase()));
  }

  if (!query) return servers;

  const q = query.toLowerCase();
  return servers.filter(s => {
    return (
      s.name.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.tags.some(t => t.includes(q))
    );
  });
}

function filterServers({ source, tag, tool } = {}) {
  let servers = getAllServers();
  if (source) {
    servers = servers.filter(s => s.source === source);
  }
  if (tag) {
    servers = servers.filter(s => s.tags.includes(tag.toLowerCase()));
  }
  if (tool) {
    servers = servers.filter(s => s.compatible.includes(tool.toLowerCase()));
  }
  return servers;
}

function getAllTags() {
  const servers = getAllServers();
  const tagMap = {};
  for (const server of servers) {
    for (const tag of server.tags) {
      tagMap[tag] = (tagMap[tag] || 0) + 1;
    }
  }
  return Object.entries(tagMap)
    .sort((a, b) => b[1] - a[1])
    .map(([tag, count]) => ({ tag, count }));
}

function clearCache() {
  _cache = null;
}

module.exports = {
  loadRegistry,
  getAllServers,
  getSources,
  getVersion,
  getUpdatedAt,
  findServer,
  searchServers,
  filterServers,
  getAllTags,
  clearCache,
  REGISTRY_PATH,
};
