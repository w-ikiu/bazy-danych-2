// plik konfigurujacy jedno, glowne polaczenie z baza danych (singleton)
const { Sequelize } = require('sequelize');
const env = process.env.NODE_ENV || 'development';
// pobieramy parametry z naszego pliku config.js
const config = require('./config.js')[env];

const sequelize = new Sequelize(config.url, config);

module.exports = sequelize;