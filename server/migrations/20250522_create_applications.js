exports.up = function(knex) {
  return knex.schema.createTable('applications', table => {
    table.increments('id').primary();
    table.string('student_name').notNullable();
    table.string('exam_code').notNullable();
    table.timestamp('submitted_at').defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('applications');
};
