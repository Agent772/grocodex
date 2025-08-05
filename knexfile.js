// Update with your config settings.

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
const path = require('path');
module.exports = {
  development: {
    client: 'sqlite3',
    connection: {
      filename: './backend/dev.sqlite3'
    },
    useNullAsDefault: true,
    migrations: {
      directory: path.join(__dirname, 'backend/migrations'),
      tableName: 'knex_migrations'
    }
  }
};
