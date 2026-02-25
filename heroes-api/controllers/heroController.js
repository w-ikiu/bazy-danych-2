const heroService = require('../services/heroService');

const HTTP_STATUS = {
  NOT_FOUND:        404,
  CONFLICT:         409,
  VALIDATION_ERROR: 422,
  FORBIDDEN:        403,
};

// handleError
const handleError = (err, res) => {
  const status = HTTP_STATUS[err.code] || 500;
  
  if (status === 500) console.error(err);

  res.status(status).type('application/problem+json').json({
    type: `/errors/${err.code ? err.code.toLowerCase() : 'internal'}`,
    title: err.code || 'Internal Error',
    status: status,
    detail: status === 500 ? 'Błąd wewnętrzny serwera' : err.message
  });
};

// getAll
// GET /api/v1/heroes?status=available&power=flight
const getAll = async (req, res) => {
  try {
    const { status, power } = req.query;
    const heroes = await heroService.findAll({ status, power });
    res.json({ data: heroes });
  } catch (err) { handleError(err, res); }
};

// create
// POST /api/v1/heroes
const create = async (req, res) => {
  try {
    const { name, power } = req.body || {};
    
    if (!name || !power) {
      return res.status(400).type('application/problem+json').json({
        type: '/errors/bad-request',
        title: 'Bad Request',
        status: 400,
        detail: 'name and power are required'
      });
    }

    const hero = await heroService.create({ name, power });
    res.status(201)
       .location(`/api/v1/heroes/${hero.id}`)
       .json({ data: hero });
  } catch (err) { handleError(err, res); }
};

module.exports = { getAll, create };