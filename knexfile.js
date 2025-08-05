// Update with your config settings.

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
const path = require('path');
module.exports = {
  development: {
    client: 'sqlite3',
    connection: {
      filename: process.env.DB_PATH || './backend/dev.sqlite3'
    },
    useNullAsDefault: true,
    migrations: {
      directory: path.join(__dirname, 'backend/migrations'),
      tableName: 'knex_migrations'
    }
  },
  test: {
    client: 'sqlite3',
    connection: {
      filename: process.env.DB_PATH || './backend/test.sqlite'
    },
    useNullAsDefault: true,
    migrations: {
      directory: path.join(__dirname, 'backend/migrations'),
      tableName: 'knex_migrations'
    }
  }
};
