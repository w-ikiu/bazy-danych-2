const sequelize = require('../config/database');
const Hero = require('./hero');
const Incident = require('./incident');

// definicja asocjacji 1:n
Hero.hasMany(Incident, { foreignKey: 'hero_id', as: 'incidents' });
Incident.belongsTo(Hero, { foreignKey: 'hero_id', as: 'hero' });

module.exports = { sequelize, Hero, Incident };