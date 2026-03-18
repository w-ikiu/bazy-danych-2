const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Hero extends Model {}

Hero.init({
  id: { 
    type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true 
  },
  name: { 
    type: DataTypes.STRING(120), unique: true, allowNull: false 
  },
  power: { 
    type: DataTypes.ENUM('flight', 'strength', 'telepathy', 'speed', 'invisibility'), allowNull: false 
  },
  status: {
    type: DataTypes.ENUM('available', 'busy', 'retired'), defaultValue: 'available' 
  },
  missions_count: { 
    type: DataTypes.INTEGER, 
    defaultValue: 0, 
    validate: { min: 0 } // walidacja na poziomie orm
  }
}, {
  sequelize, // wymagane — przekazanie instancji sequelize
  modelName: 'Hero', // wymagane — nazwa modelu
  tableName: 'heroes',
  underscored: true,
  timestamps: true,
  hooks: {
    // przed walidacja ucinamy biale znaki
    beforeValidate: (hero) => {
      if (hero.name) hero.name = hero.name.trim();
    }
  },
  scopes: {
    available: { where: { status: 'available' } },
    withPower: (power) => ({ where: { power } }),
    withMissions: { order: [['missions_count', 'DESC']] }
  }
});

module.exports = Hero;