'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // tworzymy tabele incidents z kluczem obcym do heroes
    await queryInterface.createTable('incidents', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      location: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      district: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      level: {
        type: Sequelize.ENUM('low', 'medium', 'critical'),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('open', 'assigned', 'resolved'),
        defaultValue: 'open',
      },
      hero_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'heroes', // nazwa tabeli docelowej
          key: 'id',
        },
        onDelete: 'SET NULL', // wymog z zadania: on delete set null
      },
      assigned_at: {
        type: Sequelize.DATE,
      },
      resolved_at: {
        type: Sequelize.DATE,
      },
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
    // symetryczne usuwanie
    await queryInterface.dropTable('incidents');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_incidents_level";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_incidents_status";');
  }
};