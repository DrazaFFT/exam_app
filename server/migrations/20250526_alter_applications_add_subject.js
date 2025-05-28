exports.up = function(knex) {
  return knex.schema.table('applications', table => {
    table.integer('subject_id').unsigned().notNullable()
         .references('id').inTable('subjects').onDelete('CASCADE');
    table.dropColumn('exam_code');
  });
};
exports.down = function(knex) {
  return knex.schema.table('applications', table => {
    table.string('exam_code').notNullable();
    table.dropColumn('subject_id');
  });
};