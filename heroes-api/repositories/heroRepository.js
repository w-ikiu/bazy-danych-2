const prisma = require('../prisma/client'); // upewnij sie ze sciezka jest poprawna

// wymog zadania: stala where zastepujaca scope z sequelize
const AVAILABLE_WHERE = { status: 'available' };

const findAll = async () => {
  return await prisma.hero.findMany({
    orderBy: { id: 'asc' }
  });
};

const findAvailable = async () => {
  return await prisma.hero.findMany({
    where: AVAILABLE_WHERE,
    orderBy: { id: 'asc' }
  });
};

const findById = async (id) => {
  return await prisma.hero.findUnique({
    where: { id }
  });
};

const create = async (heroData) => {
  return await prisma.hero.create({
    data: heroData
  });
};

// uwaga: nie tworzymy tu funkcji do inkrementacji missionsCount
// wymog zadania mowi, ze zrobimy to jawnie w serwisie wewnatrz transakcji

module.exports = { 
  findAll, 
  findAvailable, 
  findById, 
  create, 
  AVAILABLE_WHERE 
};