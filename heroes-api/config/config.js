module.exports = {
  development: { url: process.env.DATABASE_URL || 'postgres://user:pass@localhost:5432/heroes_dev', dialect: 'postgres', logging: false },
  test: { url: process.env.TEST_DATABASE_URL || 'postgres://user:pass@localhost:5432/heroes_test', dialect: 'postgres', logging: false },
};