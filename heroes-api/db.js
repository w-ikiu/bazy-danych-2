// laczy aplikacje (node.js) z baza w dockerze
// pool - zbior aktywnych, utrzymywanych w gotowosci polaczen miedzy aplikacja a baza (mamy maksymalnie 10 takich polaczen)
// warstwa repositories wykorzystuje te polaczenia

require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString:        process.env.DATABASE_URL,
  max:                     10,
  idleTimeoutMillis:       30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('Pool error:', err.message);
  process.exit(1);
});

module.exports = pool;