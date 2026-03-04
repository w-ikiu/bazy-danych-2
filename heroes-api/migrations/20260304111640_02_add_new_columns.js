exports.up = function(knex) {
  return knex.schema
    .alterTable('heroes', t => {
      t.integer('missions_count').defaultTo(0);
    })
    .alterTable('incidents', t => {
      t.string('district');
      t.timestamp('assigned_at');
      t.timestamp('resolved_at');
    });
};

exports.down = function(knex) {
  return knex.schema
    .alterTable('heroes', t => {
      t.dropColumn('missions_count');
    })
    .alterTable('incidents', t => {
      t.dropColumn('district');
      t.dropColumn('assigned_at');
      t.dropColumn('resolved_at');
    });
};