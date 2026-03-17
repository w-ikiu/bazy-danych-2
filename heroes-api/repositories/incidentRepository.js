// pool -> zastapiony przez knex
const knex = require('../db/knex');

const findAll = async ({ level, status, district, page = 1, pageSize = 10 } = {}) => {
  // paginacja - limit max 50 wynikow
  const limit = Math.min(parseInt(pageSize, 10) || 10, 50);
  const currentPage = parseInt(page, 10) || 1;
  const offset = (currentPage - 1) * limit;

  // inicjacja query
  const query = knex('incidents');

  // opcjonalne filtry
  if (level) query.where('level', level);
  if (status) query.where('status', status);
  
  // ILIKE dla wyszukiwania dzielnicy
  if (district) {
    query.where('district', 'ILIKE', `%${district}%`);
  }

  // klonowanie zapytania dla zliczenia wszystkich pasujacych rekordow
  const [{ count }] = await query.clone().count('id as count');
  const total = parseInt(count, 10);

  // pobranie strony z danymi
  const data = await query.orderBy('id').limit(limit).offset(offset);

  return {
    data,
    pagination: {
      page: currentPage,
      pageSize: limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

// funkcje modyfikujace przyjmuja trx (transakcje), jesli nie jest podana, uzywaja zwyklego polaczenia knex
const findById = async (id, trx = knex) => {
  return await trx('incidents').where({ id }).first();
};

const create = async ({ location, level, district }, trx = knex) => {
  const [incident] = await trx('incidents')
    .insert({ location, level, district })
    .returning('*');
  return incident;
};

const update = async (id, fields, trx = knex) => {
  const [incident] = await trx('incidents')
    .where({ id })
    .update(fields)
    .returning('*');
  return incident;
};

module.exports = { findAll, findById, create, update };