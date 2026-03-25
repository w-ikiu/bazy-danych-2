'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // tworzymy tabele heroes z polami odpowiadajacymi modelowi
    await queryInterface.createTable('heroes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING(120),
        allowNull: false,
        unique: true,
      },
      power: {
        type: Sequelize.ENUM('flight', 'strength', 'telepathy', 'speed', 'invisibility'),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('available', 'busy', 'retired'),
        defaultValue: 'available',
      },
      missions_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      // pamietamy o snake_case poniewaz w modelu mamy underscored: true
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface) {
    // symetryczne usuwanie tabeli i typu enum (w postgresql enumy zostaja w bazie)
    await queryInterface.dropTable('heroes');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_heroes_power";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_heroes_status";');
  }
};