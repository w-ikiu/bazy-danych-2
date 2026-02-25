const pool = require('../db');
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

// create
const create = async ({ location, severity_level }) => {
  if (!location || !severity_level) throw makeError('Brakuje danych', 'VALIDATION_ERROR');
  return await incidentRepository.create({ location, severity_level });
};

// assignHero
const assignHero = async (incidentId, heroId) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const incident = await incidentRepository.findById(incidentId, client);
    if (!incident) throw makeError('Incydent nie istnieje', 'NOT_FOUND');
    if (incident.status !== 'open') throw makeError('Incydent już obsłużony', 'CONFLICT');

    const hero = await heroRepository.findById(heroId, client);
    if (!hero) throw makeError('Bohater nie istnieje', 'NOT_FOUND');
    if (hero.status !== 'available') throw makeError('Bohater zajęty', 'CONFLICT');

    if (incident.severity_level === 'critical' && !['flight', 'strength'].includes(hero.power)) {
      throw makeError('Zbyt słaba moc na krytyczny incydent', 'FORBIDDEN');
    }

    await client.query('UPDATE heroes SET status = $1 WHERE id = $2', ['busy', hero.id]);
    const updatedIncident = await incidentRepository.update(incident.id, { status: 'assigned', hero_id: hero.id }, client);

    await client.query('COMMIT');
    return updatedIncident;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

// resolveIncident
const resolveIncident = async (incidentId) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const incident = await incidentRepository.findById(incidentId, client);
    if (!incident) throw makeError('Incydent nie istnieje', 'NOT_FOUND');
    if (incident.status !== 'assigned') throw makeError('Nie można zamknąć nieprzydzielonego incydentu', 'CONFLICT');

    // przywrocenie bohatera i zamkniecie incydentu
    await client.query('UPDATE heroes SET status = $1 WHERE id = $2', ['available', incident.hero_id]);
    const resolvedIncident = await incidentRepository.update(incident.id, { status: 'resolved', hero_id: incident.hero_id }, client);

    await client.query('COMMIT');
    return resolvedIncident;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

module.exports = { findAll, create, assignHero, resolveIncident };