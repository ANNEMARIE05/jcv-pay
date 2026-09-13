'use strict';

/**
 * Metro/Expo on Windows often bind to IPv6 (::) only. Expo Go then tries the
 * LAN IPv4 address (e.g. 10.x.x.x:8081) and fails with "Cannot connect to Expo CLI".
 * This wrapper forces IPv4 listen + DNS order before starting Expo.
 */
const net = require('net');

function forceIPv4Listen() {
  const originalListen = net.Server.prototype.listen;

  net.Server.prototype.listen = function listenPatched(...args) {
    const first = args[0];

    if (typeof first === 'object' && first !== null && !Array.isArray(first)) {
      if (first.host == null && first.path == null) {
        args[0] = { ...first, host: '0.0.0.0' };
      }
      return originalListen.apply(this, args);
    }

    if (
      (typeof first === 'number' || typeof first === 'string') &&
      (args[1] === undefined || typeof args[1] === 'function' || typeof args[1] === 'number')
    ) {
      args.splice(1, 0, '0.0.0.0');
    }

    return originalListen.apply(this, args);
  };
}

if (require.main === module) {
  const { spawn } = require('child_process');
  const path = require('path');
  const cli = path.join(__dirname, '..', 'node_modules', 'expo', 'bin', 'cli');

  const child = spawn(
    process.execPath,
    [
      '--dns-result-order=ipv4first',
      '--require',
      __filename,
      cli,
      'start',
      ...process.argv.slice(2),
    ],
    { stdio: 'inherit', env: process.env }
  );

  child.on('exit', (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }
    process.exit(code ?? 0);
  });
} else {
  forceIPv4Listen();
}
