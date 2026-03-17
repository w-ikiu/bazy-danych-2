// odbiera zapytania z zewnatrz (np postman) i przekazuje parametry do service, zwracajac ostateczny wynik z kodem statusu
const heroService = require('../services/heroService');

const HTTP_STATUS = {
  NOT_FOUND:        404,
  CONFLICT:         409,
  VALIDATION_ERROR: 422,
  FORBIDDEN:        403,
};

// handleerror
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

// getall
// GET /api/v1/heroes?status=available&power=flight&page=1&pageSize=10
const getAll = async (req, res) => {
  try {
    const { status, power, sortBy, sortDir, page, pageSize } = req.query;
    const result = await heroService.findAll({ status, power, sortBy, sortDir, page, pageSize });
    // odeslanie calego wyniku (ma w sobie data i pagination)
    res.json(result);
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