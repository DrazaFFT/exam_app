exports.seed = async function(knex) {
  await knex('enrollments').del();
  // student1 -> OBJA subjects
  const subjects = await knex('subjects').select('id').orderBy('id');
  const users = await knex('users').select('id').where('role','student');
  const enrolls = [];
  users.forEach(user => {
    subjects.forEach(sub => {
      enrolls.push({ user_id: user.id, subject_id: sub.id });
    });
  });
  await knex('enrollments').insert(enrolls);
};