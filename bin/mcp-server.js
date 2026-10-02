#!/usr/bin/env node
const { Transform } = require('stream');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { createAdminServer } = require('../lib/admin-mcp');
const { ToolRuntime } = require('../lib/admin-tools');
const { startLocalHttp } = require('../lib/admin-mcp-http');
async function main() {
  const args = process.argv.slice(2);
  let transport = 'stdio', allowAggregate = false, port;
  const seen = new Set();
  for (let i = 0; i < args.length; i++) {
    const flag = args[i];
    if (seen.has(flag)) throw new Error('Duplicate server option');
    seen.add(flag);
    if (flag === '--stdio' || flag === '--http') transport = flag.slice(2);
    else if (flag === '--allow-aggregate') allowAggregate = true;
    else if (flag === '--port' && /^\d{1,5}$/.test(args[i + 1] || '')) port = Number(args[++i]);
    else throw new Error('Unsupported server option');
  }
  if (seen.has('--stdio') && seen.has('--http')) throw new Error('Select one transport');
  const runtime = new ToolRuntime({ allowAggregate: allowAggregate });
  let close;
  if (transport === 'http') {
    const local = await startLocalHttp({ port: port ?? 3000, runtime });
    process.stderr.write('Healthcare administration MCP listening on ' + local.url + '\n');
    close = () => local.close();
  } else {
    if (port !== undefined) throw new Error('Port applies to HTTP only');
    let frameBytes = 0;
    const bounded = new Transform({ transform(chunk, encoding, callback) {
      for (const byte of chunk) {
        frameBytes = byte === 10 ? 0 : frameBytes + 1;
        if (frameBytes > 2 * 1024 * 1024 + 4096) return callback(new Error('Protocol frame exceeds limit'));
      }
      callback(null, chunk);
    } });
    const server = createAdminServer(runtime);
    const transport = new StdioServerTransport(bounded, process.stdout);
    close = async () => { process.stdin.unpipe(bounded); process.stdin.pause(); await server.close(); await runtime.close(); };
    bounded.on('error', () => { process.stderr.write('MCP input frame rejected\n'); close().finally(() => { process.exitCode = 1; }); });
    process.stdin.pipe(bounded);
    await server.connect(transport);
    process.stdin.on('end', () => close());
  }
  let closing = false;
  for (const signal of ['SIGTERM', 'SIGINT']) process.once(signal, () => {
    if (closing) return; closing = true;
    close().then(() => { process.exitCode = 0; }).catch(() => { process.exitCode = 1; });
  });
}
main().catch(() => { process.stderr.write('Healthcare administration MCP could not start\n'); process.exitCode = 1; });
