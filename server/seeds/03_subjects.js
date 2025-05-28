exports.seed = async function(knex) {
  await knex('subjects').del();
  await knex('subjects').insert([
    { code: 'OM140', name: 'Logistika i upravljanje lancem snabdevanja', description: 'Osnovni kurs iz logistike' },
    { code: 'OM260', name: 'Digitalizacija procesa prijave ispita', description: 'Projektni kurs sa fokusom na digitalizaciju' }
  ]);
};