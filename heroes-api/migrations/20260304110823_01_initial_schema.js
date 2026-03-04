exports.up = async function(knex) {
  await knex.schema.dropTableIfExists('incidents');
  await knex.schema.dropTableIfExists('heroes');
  return knex.schema
    .createTable('heroes', t => {
      t.increments('id').primary();
      t.string('name').unique().notNullable();
      t.enum('power', ['flight', 'strength', 'telepathy', 'speed', 'invisibility']).notNullable();
      t.enum('status', ['available', 'busy', 'retired']).defaultTo('available');
      t.timestamps(true, true);
    })
    .createTable('incidents', t => {
      t.increments('id').primary();
      t.string('location').notNullable();
      t.enum('level', ['low', 'medium', 'critical']).notNullable();
      t.enum('status', ['open', 'assigned', 'resolved']).defaultTo('open');
      t.integer('hero_id').unsigned().references('id').inTable('heroes').onDelete('SET NULL');
      t.timestamps(true, true);
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('incidents')
    .dropTableIfExists('heroes');
};