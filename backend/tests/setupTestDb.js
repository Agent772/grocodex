const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

module.exports = async () => {
  // Use the root knexfile.js and NODE_ENV=test for test DB
  const rootDir = path.resolve(__dirname, '../..');
  const knexBin = path.join(rootDir, 'node_modules/.bin/knex');
  const knexfile = path.join(rootDir, 'knexfile.js');
  const dbPath = path.join(rootDir, 'backend/test.sqlite');

  // Delete the test DB if it exists (ignore if missing)
  try {
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
    }
  } catch (e) {
    console.warn('Could not delete test DB file (may not exist):', e.message);
  }

  // Run knex migrations for the test DB
  try {
    execSync(`DB_PATH=${dbPath} NODE_ENV=test ${knexBin} migrate:latest --knexfile=${knexfile}`, {
      stdio: 'inherit',
      cwd: rootDir
    });
    console.log('Test DB migrated.');
  } catch (e) {
    console.error('Failed to migrate test DB:', e);
    process.exit(1);
  }

  // Create a test user and JWT token, save to /tmp/grocodex_test_token.json
  // Use the backend's user model and JWT logic
  const knex = require('knex')(require(path.join(rootDir, 'knexfile.js'))['test'] || require(path.join(rootDir, 'knexfile.js'))['development']);
  const bcrypt = require('bcryptjs');
  const jwt = require('jsonwebtoken');
  const JWT_SECRET = process.env.JWT_SECRET || 'testsecret';
  const username = 'testuser';
  const password = 'testpass';
  const password_hash = await bcrypt.hash(password, 10);
  let user = await knex('user').where({ username }).first();
  if (!user) {
    const [id] = await knex('user').insert({ username, password_hash });
    user = await knex('user').where({ id }).first();
  }
  const token = jwt.sign({ userId: user.id }, JWT_SECRET);
  fs.writeFileSync('/tmp/grocodex_test_token.json', JSON.stringify({ token, userId: user.id, username }));
  await knex.destroy();
};
