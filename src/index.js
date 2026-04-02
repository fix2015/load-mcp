'use strict';

const { findServer, searchServers, filterServers, getAllServers, getAllTags } = require('./registry');
const { installServer, getConfigSnippet } = require('./installer');

module.exports = {
  findServer,
  searchServers,
  filterServers,
  getAllServers,
  getAllTags,
  installServer,
  getConfigSnippet,
};
