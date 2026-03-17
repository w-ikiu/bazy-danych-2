const { faker } = require('@faker-js/faker');

exports.seed = async function(knex) {
  faker.seed(42);

  const heroes = await knex('heroes').select('id');
  const heroIds = heroes.map(h => h.id);

  const levels = ['low', 'medium', 'critical'];
  const statuses = ['open', 'assigned', 'resolved'];
  
  const incidents = [];

  for (let i = 0; i < 60; i++) {
    const status = faker.helpers.arrayElement(statuses);
    const hasHero = status === 'assigned' || status === 'resolved';
    
    incidents.push({
      location: faker.location.streetAddress(),
      district: faker.location.city(),
      level: faker.helpers.arrayElement(levels),
      status: status,
      hero_id: hasHero ? faker.helpers.arrayElement(heroIds) : null,
      assigned_at: hasHero ? faker.date.recent({ days: 10 }) : null,
      resolved_at: status === 'resolved' ? faker.date.recent({ days: 3 }) : null
    });
  }

  await knex('incidents').insert(incidents);
};