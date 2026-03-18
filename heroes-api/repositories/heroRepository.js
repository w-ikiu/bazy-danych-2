// tutaj wykonuje sie kod SQL, pobiera albo zapisuje dane w bazie i oddaje gotowe wyniki do Service

const { Hero } = require('../models');

const findAll = async (filters = {}) => {
  // ustalamy limity do paginacji
  const limit = Math.min(parseInt(filters.pageSize, 10) || 10, 50);
  const page = parseInt(filters.page, 10) || 1;
  const offset = (page - 1) * limit;

  // budujemy opcje zapytania
  const options = {
    limit,
    offset,
    order: [[filters.sortBy || 'id', filters.sortDir || 'ASC']],
    where: {},
  };

  // filtrowanie po mocy
  if (filters.power) {
    options.where.power = filters.power;
  }

  // wykorzystanie scope zdefiniowanego w modelu
  let query = Hero;
  if (filters.status === 'available') {
    query = Hero.scope('available');
  } else if (filters.status) {
    options.where.status = filters.status;
  }

  const { count, rows } = await query.findAndCountAll(options);

  return {
    data: rows,
    pagination: {
      page,
      pageSize: limit,
      total: count,
      totalPages: Math.ceil(count / limit),
    },
  };
};

const findById = async (id, t = null) => {
  // blokada pesymistyczna uruchamiana gdy podamy transakcje
  const options = t ? { transaction: t, lock: true } : {};
  return await Hero.findByPk(id, options);
};

const create = async (data) => {
  return await Hero.create(data);
};

const update = async (id, fields, t = null) => {
  // uzywamy individualhooks zeby wywolac hooki przy aktualizacji
  await Hero.update(fields, {
    where: { id },
    transaction: t,
    individualHooks: true,
  });
  
  return await Hero.findByPk(id, { transaction: t });
};

module.exports = { findAll, findById, create, update };