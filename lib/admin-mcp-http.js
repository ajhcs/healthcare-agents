const http = require('http');
const { randomUUID } = require('crypto');
const { StreamableHTTPServerTransport } = require('@modelcontextprotocol/sdk/server/streamableHttp.js');
const { createAdminServer } = require('./admin-mcp');
const { ToolRuntime } = require('./admin-tools');
async function startLocalHttp({ port = 0, runtime = new ToolRuntime(), maxSessions = 8, sessionTtlMs = 300000 } = {}) {
  if (!Number.isInteger(port) || port < 0 || port > 65535) throw new Error('Invalid port');
  const sessions = new Map(); const transports = new Set(); let pending = 0;
  const reject = (res, status, message) => { res.writeHead(status, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ error: message })); };
  const listener = http.createServer(async (req, res) => {
    const actualPort = listener.address().port;
    const hosts = ['127.0.0.1:' + actualPort, 'localhost:' + actualPort];
    if (!hosts.includes(req.headers.host)) return reject(res, 403, 'Local host required');
    if (req.headers.origin && !hosts.map(h => 'http://' + h).includes(req.headers.origin)) return reject(res, 403, 'Origin not allowed');
    if (req.url !== '/mcp') return reject(res, 404, 'Endpoint not found');
    if (!['POST', 'GET', 'DELETE'].includes(req.method)) return reject(res, 405, 'Method not allowed');
    let body;
    if (req.method === 'POST') {
      if (!(req.headers['content-type'] || '').toLowerCase().startsWith('application/json')) return reject(res, 415, 'JSON required');
      const chunks = []; let bytes = 0;
      try {
        for await (const chunk of req) { bytes += chunk.length; if (bytes > 2 * 1024 * 1024 + 4096) return reject(res, 413, 'Request too large'); chunks.push(chunk); }
        body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
      } catch { return reject(res, 400, 'Invalid JSON'); }
    }
    const sessionId = req.headers['mcp-session-id'];
    let session = typeof sessionId === 'string' ? sessions.get(sessionId) : undefined;
    if (sessionId && !session) return reject(res, 404, 'Session not found');
    if (!session) {
      if (req.method !== 'POST' || body?.method !== 'initialize') return reject(res, 400, 'Initialize first');
      if (sessions.size + pending >= maxSessions) return reject(res, 429, 'Session capacity reached');
      pending++;
      const server = createAdminServer(runtime);
      const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: randomUUID, enableJsonResponse: true,
        onsessioninitialized: id => sessions.set(id, session) });
      session = { server, transport, lastActivity: Date.now() };
      transports.add(transport);
      server.onclose = () => { sessions.delete(transport.sessionId); transports.delete(transport); };
      try { await server.connect(transport); }
      catch { pending--; transports.delete(transport); return reject(res, 500, 'Initialization failed'); }
      pending--;
    }
    session.lastActivity = Date.now();
    try { await session.transport.handleRequest(req, res, body); }
    catch { if (!res.headersSent) reject(res, 500, 'Protocol request failed'); else res.end(); }
    if (!session.transport.sessionId) { await session.server.close(); transports.delete(session.transport); }
  });
  listener.requestTimeout = 10000; listener.headersTimeout = 10000;
  const expiry = setInterval(() => {
    for (const session of sessions.values()) if (Date.now() - session.lastActivity >= sessionTtlMs) session.server.close().catch(() => {});
  }, Math.min(sessionTtlMs, 30000));
  expiry.unref();
  await new Promise((resolve, reject) => { listener.once('error', reject); listener.listen(port, '127.0.0.1', resolve); });
  return { url: 'http://127.0.0.1:' + listener.address().port + '/mcp', sessions, runtime,
    async close() {
      clearInterval(expiry);
      for (const session of [...sessions.values()]) await session.server.close();
      for (const transport of [...transports]) await transport.close();
      await runtime.close();
      const closed = new Promise(resolve => listener.close(resolve));
      listener.closeAllConnections();
      await closed;
    } };
}
module.exports = { startLocalHttp };
