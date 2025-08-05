import knex, { Knex } from 'knex';
import path from 'path';

// Use the same config as in knexfile.js
declare const process: any;

const config: Knex.Config = {
  client: 'sqlite3',
  connection: {
    filename: path.resolve(__dirname, '../dev.sqlite3'),
  },
  useNullAsDefault: true,
};

const db = knex(config);

export default db;
