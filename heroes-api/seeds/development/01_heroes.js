const { faker } = require('@faker-js/faker');

exports.seed = async function(knex) {
  faker.seed(7); 

  const powers = ['flight', 'strength', 'telepathy', 'speed', 'invisibility'];
  const statuses = ['available', 'busy', 'retired'];
  
  const heroes = [];
  
  for (let i = 0; i < 20; i++) {
    heroes.push({
      name: faker.person.fullName(),
      power: faker.helpers.arrayElement(powers),
      status: faker.helpers.arrayElement(statuses),
      missions_count: faker.number.int({ min: 0, max: 100 })
    });
  }

  await knex('heroes').insert(heroes);
};