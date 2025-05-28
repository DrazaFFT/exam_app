const bcrypt = require('bcrypt');

exports.seed = async function(knex) {
  await knex('users').del();
  const hash = await bcrypt.hash('password123', 10);
  await knex('users').insert([
    { username: 'student1', password_hash: hash, role: 'student' },
    { username: 'admin1',   password_hash: hash, role: 'admin' }
  ]);
};
