const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Hero = require('./hero'); // importujemy model bohatera do uzycia w hooku

class Incident extends Model {}

Incident.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  location: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  district: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  level: {
    type: DataTypes.ENUM('low', 'medium', 'critical'),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('open', 'assigned', 'resolved'),
    defaultValue: 'open',
  },
  hero_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  assigned_at: {
    type: DataTypes.DATE,
  },
  resolved_at: {
    type: DataTypes.DATE,
  },
}, {
  sequelize,
  modelName: 'Incident',
  tableName: 'incidents',
  timestamps: true,
  underscored: true,
  hooks: {
    afterUpdate: async (incident, options) => {
      // sprawdzamy czy status zmienil sie z assigned na resolved
      if (
        incident.changed('status') && 
        incident.status === 'resolved' && 
        incident.previous('status') === 'assigned'
      ) {
        if (incident.hero_id) {
          const hero = await Hero.findByPk(incident.hero_id, { 
            transaction: options.transaction,
          });
          
          if (hero) {
            // zwiekszamy licznik w tej samej transakcji
            await hero.increment('missions_count', { 
              transaction: options.transaction,
            });
          }
        }
      }
    },
  },
});

module.exports = Incident;