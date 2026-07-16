const bcrypt = require('bcryptjs');
const { query } = require('../config/db');
const env = require('../config/env');

async function seedAdmin() {
  const passwordHash = await bcrypt.hash(env.adminPassword, 10);
  await query(
    `INSERT INTO admin_users (username, password_hash)
     VALUES ($1, $2)
     ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
    [env.adminUsername, passwordHash]
  );
}

module.exports = { seedAdmin };
