exports.up = function(knex) {
  return knex.schema.createTable('enrollments', table => {
    table.increments('id').primary();
    table
      .integer('user_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');
    table
      .integer('subject_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('subjects')
      .onDelete('CASCADE');
    table.unique(['user_id', 'subject_id']);
    table.timestamp('enrolled_at').defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('enrollments');
};
