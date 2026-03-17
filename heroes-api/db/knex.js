// sprawdzamy srodowisko (np development czy test), domyslnie bierzemy development
const environment = process.env.NODE_ENV || 'development';

// importujemy konfiguracje z pliku knexfile.js, ktory lezy katalog wyzej
const config = require('../knexfile')[environment];

// tworzymy i eksportujemy gotowa instancje knexa do uzycia w calym systemie
const knex = require('knex')(config);

module.exports = knex;