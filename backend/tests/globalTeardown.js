// globalTeardown.js
const fs = require('fs');
const path = require('path');

module.exports = async () => {
  // Initialize knex with test config
  const rootDir = path.resolve(__dirname, '../..');
  const knexConfig = require(path.join(rootDir, 'knexfile.js'))['test'] || require(path.join(rootDir, 'knexfile.js'))['development'];
  const knex = require('knex')(knexConfig);

  await knex.destroy();

  // Delete the test DB file if it exists
  const dbPath = path.resolve(__dirname, '../test.sqlite');
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
    console.log('Test DB file deleted.');
  }
};
