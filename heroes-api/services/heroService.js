const heroRepository = require('../repositories/heroRepository');

const findAll = async () => {
  return await heroRepository.findAll();
};

const findAvailable = async () => {
  return await heroRepository.findAvailable();
};

const findById = async (id) => {
  const hero = await heroRepository.findById(id);
  if (!hero) throw new Error('Bohater nie istnieje'); // dostosuj do swojego handlera bledow
  return hero;
};

const create = async (heroData) => {
  // wymog zadania: logika trim przeniesiona z hooka beforevalidate z sequelize do serwisu
  if (heroData.name) {
    heroData.name = heroData.name.trim();
  }
  return await heroRepository.create(heroData);
};

module.exports = {
  findAll,
  findAvailable,
  findById,
  create
};