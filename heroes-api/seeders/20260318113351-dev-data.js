'use strict';
// importujemy fakera do generowania losowych danych
const { faker } = require('@faker-js/faker');

module.exports = {
  async up(queryInterface, Sequelize) {
    // przerywamy jesli jestesmy w srodowisku testowym
    if (process.env.NODE_ENV === 'test') return;

    // wymog z zadania: deterministyczne wyniki
    faker.seed(7);

    const heroes = [];
    const powers = ['flight', 'strength', 'telepathy', 'speed', 'invisibility'];
    const statuses = ['available', 'busy', 'retired'];

    for (let i = 0; i < 5; i++) {
      heroes.push({
        name: faker.person.fullName(),
        power: faker.helpers.arrayElement(powers),
        status: faker.helpers.arrayElement(statuses),
        missions_count: faker.number.int({ min: 0, max: 100 }),
        created_at: new Date(),
        updated_at: new Date()
      });
    }

    // wstawiamy bohaterow i pobieramy ich id
    await queryInterface.bulkInsert('heroes', heroes);
    const savedHeroes = await queryInterface.sequelize.query('SELECT id FROM heroes;');
    const heroIds = savedHeroes[0].map(h => h.id);

    const incidents = [];
    const levels = ['low', 'medium', 'critical'];
    const incidentStatuses = ['open', 'assigned', 'resolved'];

    for (let i = 0; i < 10; i++) {
      const status = faker.helpers.arrayElement(incidentStatuses);
      const hasHero = status === 'assigned' || status === 'resolved';

      incidents.push({
        location: faker.location.streetAddress(),
        district: faker.location.city(),
        level: faker.helpers.arrayElement(levels),
        status: status,
        hero_id: hasHero ? faker.helpers.arrayElement(heroIds) : null,
        assigned_at: hasHero ? faker.date.recent({ days: 10 }) : null,
        resolved_at: status === 'resolved' ? faker.date.recent({ days: 3 }) : null,
        created_at: new Date(),
        updated_at: new Date()
      });
    }

    await queryInterface.bulkInsert('incidents', incidents);
  },

  async down(queryInterface, Sequelize) {
    if (process.env.NODE_ENV === 'test') return;
    await queryInterface.bulkDelete('incidents', null, {});
    await queryInterface.bulkDelete('heroes', null, {});
  }
};