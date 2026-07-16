const { Pool } = require('pg');
const env = require('./env');

const pool = new Pool({
  connectionString: env.databaseUrl,
  family: 4,
  ssl: env.databaseUrl.includes('supabase.com') ? { rejectUnauthorized: false } : false,
});

module.exports = {
  pool,
  query: (text, params) => pool.query(text, params),
};
