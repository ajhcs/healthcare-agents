#!/usr/bin/env node
const { definitionsFor, dispatch, ToolRuntime } = require('../adapters/hosts/contracts');
async function main() {
  const args = process.argv.slice(2);
  if (args.length === 2 && args[0] === '--list') {
    process.stdout.write(JSON.stringify(definitionsFor(args[1])) + '\n'); return;
  }
  if (args.length) throw new Error('Unsupported bridge option');
  const chunks = []; let bytes = 0;
  const timer = setTimeout(() => { process.stderr.write('Host bridge input deadline exceeded\n'); process.exitCode = 1; process.stdin.destroy(); }, 10000);
  let request;
  try {
    for await (const chunk of process.stdin) {
      bytes += chunk.length; if (bytes > 2 * 1024 * 1024) throw new Error('Input exceeds limit');
      chunks.push(chunk);
    }
    request = JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } finally { clearTimeout(timer); }
  if (!request || typeof request !== 'object' || Array.isArray(request) || Object.keys(request).sort().join(',') !== 'call,target') throw new Error('Invalid bridge envelope');
  const runtime = new ToolRuntime(); const controller = new AbortController();
  const abort = () => controller.abort(); process.once('SIGTERM', abort); process.once('SIGINT', abort);
  try { process.stdout.write(JSON.stringify(await dispatch(request.target, request.call, runtime, controller.signal)) + '\n'); }
  finally { await runtime.close(); process.removeListener('SIGTERM', abort); process.removeListener('SIGINT', abort); }
}
main().catch(() => { process.stderr.write('Host bridge request rejected\n'); process.exitCode = 1; });
