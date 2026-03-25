require('dotenv').config();

module.exports = {
  development: { 
    url: process.env.DATABASE_URL || 'postgresql://postgres:secret@localhost:5432/heroesdb', 
    dialect: 'postgres', 
    logging: false 
  },
  test: {
    url: process.env.TEST_DATABASE_URL || 'postgresql://postgres:secret@localhost:5432/heroesdb_test', 
    dialect: 'postgres', 
    logging: false 
  },
};