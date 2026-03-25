'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // uruchamiamy tylko podczas testow
    if (process.env.NODE_ENV !== 'test') return;

    // sztywne id i wszystkie kombinacje statusow dla testow (wymog z zadania)
    await queryInterface.bulkInsert('heroes', [
      { id: 1, name: 'Superman', power: 'flight', status: 'available', missions_count: 10, created_at: new Date(), updated_at: new Date() },
      { id: 2, name: 'Batman', power: 'strength', status: 'busy', missions_count: 50, created_at: new Date(), updated_at: new Date() },
      { id: 3, name: 'Aquaman', power: 'telepathy', status: 'retired', missions_count: 100, created_at: new Date(), updated_at: new Date() }
    ]);

    await queryInterface.bulkInsert('incidents', [
      { id: 1, location: 'Bank', district: 'Downtown', level: 'critical', status: 'open', hero_id: null, created_at: new Date(), updated_at: new Date() },
      { id: 2, location: 'Sklep', district: 'Uptown', level: 'low', status: 'assigned', hero_id: 2, assigned_at: new Date(), created_at: new Date(), updated_at: new Date() },
      { id: 3, location: 'Ulica', district: 'Suburbs', level: 'medium', status: 'resolved', hero_id: 1, assigned_at: new Date(), resolved_at: new Date(), created_at: new Date(), updated_at: new Date() }
    ]);
  },

  async down(queryInterface, Sequelize) {
    if (process.env.NODE_ENV !== 'test') return;
    await queryInterface.bulkDelete('incidents', null, {});
    await queryInterface.bulkDelete('heroes', null, {});
  }
};