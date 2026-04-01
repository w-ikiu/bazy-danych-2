const prisma = require('../prisma/client');

// pobieranie incydentow z filtrami relacyjnymi (some i none)
const findAll = async (categoryId, excludeCategoryId) => {
  const where = {};

  if (categoryId || excludeCategoryId) {
    where.categories = {};
    // operator some: pobiera incydenty, ktore maja te kategorie
    if (categoryId) {
      where.categories.some = { categoryId: parseInt(categoryId, 10) };
    }
    // operator none: wyklucza incydenty, ktore maja te kategorie
    if (excludeCategoryId) {
      where.categories.none = { categoryId: parseInt(excludeCategoryId, 10) };
    }
  }

  return await prisma.incident.findMany({
    where,
    orderBy: { id: 'asc' }
  });
};

// eager loading bez problemu n+1 (include z select)
const findById = async (id) => {
  return await prisma.incident.findUnique({
    where: { id: parseInt(id, 10) },
    include: {
      // select na wybranych polach bohatera (wymog zadania)
      hero: {
        select: {
          id: true,
          name: true,
          power: true,
          status: true
        }
      },
      // dolaczenie kategorii przez jawna tabele posrednia
      categories: {
        include: {
          category: true
        }
      }
    }
  });
};

// zagniezdzone tworzenie rekordow (nested create) w jednej operacji
const create = async (incidentData, categoryIds = []) => {
  return await prisma.incident.create({
    data: {
      location: incidentData.location,
      district: incidentData.district,
      level: incidentData.level,
      status: incidentData.status || 'open',
      // prisma automatycznie stworzy powiazania w tabeli incidentcategory
      categories: {
        create: categoryIds.map(id => ({
          categoryId: parseInt(id, 10)
        }))
      }
    }
  });
};

// aktualizacja incydentu z opcjonalnym obiektem transakcji (tx)
const update = async (id, data, tx = prisma) => {
  return await tx.incident.update({
    where: { id: parseInt(id, 10) },
    data
  });
};

// bezpieczne surowe zapytanie sql z tagged template literal
const getStats = async (levelFilter) => {
  // rzutowanie count na integer jest potrzebne, by uniknac bledu serializacji bigint w json
  if (levelFilter) {
    // bezpieczne parametryzowanie: zmienna przekazana w ${} nie jest wklejana jako tekst!
    return await prisma.$queryRaw`
      SELECT status, CAST(COUNT(*) AS INTEGER) as count 
      FROM "Incident" 
      WHERE level = ${levelFilter}::"IncidentLevel" 
      GROUP BY status
    `;
  }
  
  return await prisma.$queryRaw`
    SELECT status, CAST(COUNT(*) AS INTEGER) as count 
    FROM "Incident" 
    GROUP BY status
  `;
};

module.exports = {
  findAll,
  findById,
  create,
  update,
  getStats
};