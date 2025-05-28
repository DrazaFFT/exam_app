exports.up = function(knex) {
  return knex.schema.createTable('subjects', table => {
    table.increments('id').primary();
    table.string('code').notNullable().unique();
    table.string('name').notNullable();
    table.text('description');
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('subjects');
};
