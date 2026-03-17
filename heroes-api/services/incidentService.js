// usuwamy stary 'pool' i importujemy knexa
const knex = require('../db/knex');
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

// mapujemy severity_level z api na pole 'level' w bazie danych
const create = async ({ location, severity_level, district }) => {
  if (!location || !severity_level) throw makeError('Brakuje danych', 'VALIDATION_ERROR');
  return await incidentRepository.create({ location, level: severity_level, district });
};

// assignhero z uzyciem automatycznej transakcji knexa
const assignHero = async (incidentId, heroId) => {
  // transakcja knex - trx jest automatycznie przekazywany do funkcji
  return await knex.transaction(async (trx) => {
    // wszedzie podajemy trx zamiast clienta
    const incident = await incidentRepository.findById(incidentId, trx);
    if (!incident) throw makeError('Incydent nie istnieje', 'NOT_FOUND');
    if (incident.status !== 'open') throw makeError('Incydent już obsłużony', 'CONFLICT');

    const hero = await heroRepository.findById(heroId, trx);
    if (!hero) throw makeError('Bohater nie istnieje', 'NOT_FOUND');
    if (hero.status !== 'available') throw makeError('Bohater zajęty', 'CONFLICT');

    // zmiana 'severity_level' na 'level', bo tak nazwalismy to w nowej migracji
    if (incident.level === 'critical' && !['flight', 'strength'].includes(hero.power)) {
      throw makeError('Zbyt słaba moc na krytyczny incydent', 'FORBIDDEN');
    }

    // aktualizacja statusu bohatera
    await heroRepository.update(hero.id, { status: 'busy' }, trx);
    
    // aktualizacja incydentu z nowa data 'assigned_at'
    const updatedIncident = await incidentRepository.update(incident.id, { 
      status: 'assigned', 
      hero_id: hero.id,
      assigned_at: knex.fn.now() // automatyczny czas z bazy
    }, trx);

    // po dojsciu tutaj knex sam robi commit i zwraca wynik
    return updatedIncident;
  }); 
};

// resolveincident z uzyciem transakcji knexa
const resolveIncident = async (incidentId) => {
  return await knex.transaction(async (trx) => {
    const incident = await incidentRepository.findById(incidentId, trx);
    if (!incident) throw makeError('Incydent nie istnieje', 'NOT_FOUND');
    if (incident.status !== 'assigned') throw makeError('Nie można zamknąć nieprzydzielonego incydentu', 'CONFLICT');

    // pobieramy bohatera, by zaktualizowac jego licznik misji
    const hero = await heroRepository.findById(incident.hero_id, trx);

    // zwalniamy bohatera i zwiekszamy licznik ukonczonych misji
    await heroRepository.update(hero.id, { 
      status: 'available',
      missions_count: hero.missions_count + 1 
    }, trx);
    
    // zamykamy incydent i dodajemy czas zakonczenia
    const resolvedIncident = await incidentRepository.update(incident.id, { 
      status: 'resolved',
      resolved_at: knex.fn.now()
    }, trx);

    return resolvedIncident;
  });
};

// zwraca historie i rzuca 404 jesli bohater nie istnieje
const findHistoryByHeroId = async (heroId, filters) => {
  const hero = await heroRepository.findById(heroId);
  if (!hero) throw makeError('Bohater nie istnieje', 'NOT_FOUND');
  
  return await incidentRepository.findHistoryByHeroId(heroId, filters);
};

module.exports = { findAll, create, assignHero, resolveIncident, findHistoryByHeroId };