// Vercel Node function entrypoint.
// The build step generates dist/server.cjs.
const serverModule = require("../dist/server.cjs");

module.exports = serverModule.default || serverModule;
