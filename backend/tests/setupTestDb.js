const { execSync } = require('child_process');

// Run knex migrations for the test DB
try {
  // Use the root knexfile.js and NODE_ENV=test for test DB
  // Use the root-level knex binary and knexfile.js, run from project root
  const path = require('path');
  const rootDir = path.resolve(__dirname, '../..');
  const knexBin = path.join(rootDir, 'node_modules/.bin/knex');
  const knexfile = path.join(rootDir, 'knexfile.js');
  const dbPath = path.join(rootDir, 'backend/test.sqlite');
  execSync(`DB_PATH=${dbPath} NODE_ENV=test ${knexBin} migrate:latest --knexfile=${knexfile}`, {
    stdio: 'inherit',
    cwd: rootDir
  });
  console.log('Test DB migrated.');
} catch (e) {
  console.error('Failed to migrate test DB:', e);
  process.exit(1);
}
