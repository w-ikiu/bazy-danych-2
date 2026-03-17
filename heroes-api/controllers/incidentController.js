const incidentService = require('../services/incidentService');

const HTTP_STATUS = { NOT_FOUND: 404, CONFLICT: 409, VALIDATION_ERROR: 422, FORBIDDEN: 403 };

const handleError = (err, res) => {
  const status = HTTP_STATUS[err.code] || 500;
  if (status === 500) console.error(err);
  
  res.status(status).type('application/problem+json').json({
    type: `/errors/${err.code ? err.code.toLowerCase() : 'internal'}`,
    title: err.code || 'Internal Error',
    status,
    detail: status === 500 ? 'Błąd serwera' : err.message
  });
};

// pobieramy filtry, dzielnice oraz parametry paginacji
const getAll = async (req, res) => {
  try {
    const { severity_level, status, district, page, pageSize } = req.query;
    const result = await incidentService.findAll({ 
      level: severity_level, 
      status, 
      district, 
      page, 
      pageSize 
    });
    // result zwraca format wymagany przez paginacje
    res.json(result);
  } catch (err) { handleError(err, res); }
};

const create = async (req, res) => {
  try {
    const { location, severity_level, district } = req.body || {};
    if (!location || !severity_level) throw { code: 'VALIDATION_ERROR', message: 'Brakuje location lub severity_level' };
    
    // przekazujemy do serwisu dodatkowy parametr district
    const incident = await incidentService.create({ location, severity_level, district });
    res.status(201).location(`/api/v1/incidents/${incident.id}`).json({ data: incident });
  } catch (err) { handleError(err, res); }
};

const assign = async (req, res) => {
  try {
    const incidentId = parseInt(req.params.id, 10);
    const { hero_id } = req.body || {};
    if (isNaN(incidentId) || !hero_id) throw { code: 'VALIDATION_ERROR', message: 'Nieprawidłowe ID incydentu lub brak hero_id' };
    
    const incident = await incidentService.assignHero(incidentId, hero_id);
    res.json({ data: incident });
  } catch (err) { handleError(err, res); }
};

const resolve = async (req, res) => {
  try {
    const incidentId = parseInt(req.params.id, 10);
    if (isNaN(incidentId)) throw { code: 'VALIDATION_ERROR', message: 'ID musi być liczbą' };
    
    const incident = await incidentService.resolveIncident(incidentId);
    res.json({ data: incident });
  } catch (err) { handleError(err, res); }
};

module.exports = { getAll, create, assign, resolve };