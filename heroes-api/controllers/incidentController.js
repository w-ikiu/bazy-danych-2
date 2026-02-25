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

const getAll = async (req, res) => {
  try {
    const incidents = await incidentService.findAll({
      severity_level: req.query.severity_level,
      status: req.query.status
    });
    res.json({ data: incidents });
  } catch (err) { handleError(err, res); }
};

const create = async (req, res) => {
  try {
    const { location, severity_level } = req.body || {};
    if (!location || !severity_level) throw { code: 'VALIDATION_ERROR', message: 'Brakuje location lub severity_level' };
    
    const incident = await incidentService.create({ location, severity_level });
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