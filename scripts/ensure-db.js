const net = require('net');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

function checkPort(port, host = '127.0.0.1') {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(800);
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.once('error', () => {
      socket.destroy();
      resolve(false);
    });
    socket.connect(port, host);
  });
}

async function ensureDatabase() {
  const isUp = await checkPort(5432);
  if (isUp) {
    console.log('✓ PostgreSQL is already running on port 5432.');
    process.exit(0);
  }

  console.log('⏳ PostgreSQL is not running. Starting local database...');

  const pgExePaths = [
    'C:\\Program Files\\PostgreSQL\\18\\bin\\postgres.exe',
    'C:\\Program Files\\PostgreSQL\\17\\bin\\postgres.exe',
    'C:\\Program Files\\PostgreSQL\\16\\bin\\postgres.exe',
  ];

  const pgDataPaths = [
    'C:\\Users\\srive\\pgdata',
    path.join(process.env.USERPROFILE || '', 'pgdata'),
  ];

  const pgExe = pgExePaths.find((p) => fs.existsSync(p));
  const pgData = pgDataPaths.find((p) => fs.existsSync(p));

  if (!pgExe || !pgData) {
    console.warn('⚠️ PostgreSQL executable or data directory not found at standard path.');
    console.warn('  Ensure PostgreSQL is started or Docker is running.');
    process.exit(0);
  }

  try {
    const proc = spawn(pgExe, ['-D', pgData], {
      detached: true,
      stdio: 'ignore',
    });
    proc.unref();

    // Wait until port 5432 becomes ready
    const start = Date.now();
    while (Date.now() - start < 10000) {
      await new Promise((r) => setTimeout(r, 400));
      if (await checkPort(5432)) {
        console.log('✓ PostgreSQL started successfully on port 5432.');
        process.exit(0);
      }
    }

    console.warn('⚠️ Timed out waiting for PostgreSQL to listen on port 5432. Continuing anyway...');
    process.exit(0);
  } catch (err) {
    console.error('Failed to spawn PostgreSQL:', err.message);
    process.exit(0);
  }
}

ensureDatabase();
