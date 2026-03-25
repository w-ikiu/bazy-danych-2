const { sequelize } = require('../models');
const incidentRepository = require('../repositories/incidentRepository');
const heroRepository = require('../repositories/heroRepository');

const makeError = (message, code) => {
  const err = new Error(message);
  err.code = code;
  return err;
};

const findAll = async (filters) => {
  return await incidentRepository.findAll(filters);
};

const findById = async (id) => {
  const incident = await incidentRepository.findById(id);
  if (!incident) throw makeError('Incydent nie istnieje', 'NOT_FOUND');
  return incident;
};

const create = async ({ location, severity_level, district }) => {
  if (!location || !severity_level) throw makeError('Brakuje danych', 'VALIDATION_ERROR');
  return await incidentRepository.create({ location, level: severity_level, district });
};

const assignHero = async (incidentId, heroId) => {
  // zarzadzana transakcja sequelize - sama robi commit lub rollback w razie bledu
  return await sequelize.transaction(async (t) => {
    // pobieramy z blokada pesymistyczna (lock: true w repozytorium)
    const incident = await incidentRepository.findByIdWithLock(incidentId, t);
    if (!incident) throw makeError('Incydent nie istnieje', 'NOT_FOUND');
    if (incident.status !== 'open') throw makeError('Incydent już obsłużony', 'CONFLICT');

    const hero = await heroRepository.findByIdWithLock(heroId, t);
    if (!hero) throw makeError('Bohater nie istnieje', 'NOT_FOUND');
    if (hero.status !== 'available') throw makeError('Bohater zajęty', 'CONFLICT');

    if (incident.level === 'critical' && !['flight', 'strength'].includes(hero.power)) {
      throw makeError('Zbyt słaba moc na krytyczny incydent', 'FORBIDDEN');
    }

    // pamietamy zeby wszedzie przekazac transakcje 't'
    await heroRepository.update(hero.id, { status: 'busy' }, t);
    
    // aktualizacja incydentu
    return await incidentRepository.update(incident.id, { 
      status: 'assigned', 
      hero_id: hero.id,
      assigned_at: new Date()
    }, t);
  }); 
};

const resolveIncident = async (incidentId) => {
  return await sequelize.transaction(async (t) => {
    const incident = await incidentRepository.findByIdWithLock(incidentId, t);
    if (!incident) throw makeError('Incydent nie istnieje', 'NOT_FOUND');
    if (incident.status !== 'assigned') throw makeError('Nie można zamknąć nieprzydzielonego incydentu', 'CONFLICT');

    // zwalniamy bohatera, a licznik misji zaktualizuje automatycznie nasz hook w modelu
    await heroRepository.update(incident.hero_id, { status: 'available' }, t);
    
    // zmiana statusu na resolved odpali hooka, ktory tez korzysta z tej samej transakcji
    return await incidentRepository.update(incident.id, { 
      status: 'resolved',
      resolved_at: new Date()
    }, t);
  });
};

const findHistoryByHeroId = async (heroId, filters) => {
  const hero = await heroRepository.findById(heroId);
  if (!hero) throw makeError('Bohater nie istnieje', 'NOT_FOUND');
  
  return await incidentRepository.findHistoryByHeroId(heroId, filters);
};

module.exports = { findAll, findById, create, assignHero, resolveIncident, findHistoryByHeroId };