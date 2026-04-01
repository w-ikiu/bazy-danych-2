const prisma = require('../prisma/client');
const incidentRepository = require('../repositories/incidentRepository');

const findAll = async (categoryId, excludeCategoryId) => {
  return await incidentRepository.findAll(categoryId, excludeCategoryId);
};

const findById = async (id) => {
  const incident = await incidentRepository.findById(id);
  if (!incident) throw new Error('Incydent nie istnieje');
  return incident;
};

const create = async (incidentData, categoryIds) => {
  return await incidentRepository.create(incidentData, categoryIds);
};

const getStats = async (level) => {
  return await incidentRepository.getStats(level);
};

// interaktywna transakcja dla przypisania bohatera
const assignHero = async (incidentId, heroId) => {
  // uzywamy interaktywnej transakcji z callbackiem (tx)
  return await prisma.$transaction(async (tx) => {
    // wszystkie zapytania wewnatrz uzywaja tx.* a nie prisma.*
    const incident = await tx.incident.findUnique({ where: { id: parseInt(incidentId, 10) } });
    if (!incident) throw new Error('Incydent nie istnieje');
    if (incident.status !== 'open') throw new Error('Incydent nie jest otwarty');

    const hero = await tx.hero.findUnique({ where: { id: parseInt(heroId, 10) } });
    if (!hero) throw new Error('Bohater nie istnieje');
    if (hero.status !== 'available') throw new Error('Bohater nie jest dostepny');

    // walidacja domenowa rzuca wyjatek przed jakimkolwiek zapisem
    if (incident.level === 'critical' && hero.power === 'invisibility') {
      throw new Error('Ta moc jest niewystarczajaca na poziom critical');
    }

    // aktualizacja incydentu w transakcji
    await tx.incident.update({
      where: { id: incident.id },
      data: {
        status: 'assigned',
        heroId: hero.id,
        assignedAt: new Date()
      }
    });

    // aktualizacja statusu bohatera w transakcji
    await tx.hero.update({
      where: { id: hero.id },
      data: { status: 'busy' }
    });

    return await tx.incident.findUnique({ where: { id: incident.id } });
  });
};

// interaktywna transakcja dla rozwiazania incydentu
const resolveIncident = async (incidentId) => {
  return await prisma.$transaction(async (tx) => {
    const incident = await tx.incident.findUnique({ where: { id: parseInt(incidentId, 10) } });
    if (!incident) throw new Error('Incydent nie istnieje');
    if (incident.status !== 'assigned' || !incident.heroId) throw new Error('Incydent nie jest przypisany');

    const updatedIncident = await tx.incident.update({
      where: { id: incident.id },
      data: {
        status: 'resolved',
        resolvedAt: new Date()
      }
    });

    // wymog zadania: brak ukrytego hooka afterupdate
    // uzywamy atomowej operacji increment w tej samej transakcji co zmiana statusu
    await tx.hero.update({
      where: { id: incident.heroId },
      data: {
        status: 'available',
        missionsCount: { increment: 1 }
      }
    });

    return updatedIncident;
  });
};

module.exports = {
  findAll,
  findById,
  create,
  getStats,
  assignHero,
  resolveIncident
};