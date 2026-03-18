const { Incident, Hero } = require('../models');
const { Op } = require('sequelize');

const findAll = async (filters = {}) => {
  const limit = Math.min(parseInt(filters.pageSize, 10) || 10, 50);
  const page = parseInt(filters.page, 10) || 1;
  const offset = (page - 1) * limit;

  const options = {
    limit,
    offset,
    order: [['id', 'ASC']],
    where: {},
  };

  if (filters.level) options.where.level = filters.level;
  if (filters.status) options.where.status = filters.status;
  if (filters.district) {
    // odpowiednik ilike z knexa
    options.where.district = { [Op.iLike]: `%${filters.district}%` };
  }

  const { count, rows } = await Incident.findAndCountAll(options);

  return {
    data: rows,
    pagination: { page, pageSize: limit, total: count, totalPages: Math.ceil(count / limit) },
  };
};

const findById = async (id, t = null) => {
  const options = t ? { transaction: t, lock: true } : {};
  // include to nasz eager loading - dolacza bohatera w jednym zapytaniu sql
  options.include = [{ 
    model: Hero, 
    as: 'hero',
  }];
  
  return await Incident.findByPk(id, options);
};

const findHistoryByHeroId = async (heroId, filters = {}) => {
  const limit = Math.min(parseInt(filters.pageSize, 10) || 10, 50);
  const page = parseInt(filters.page, 10) || 1;
  const offset = (page - 1) * limit;

  const { count, rows } = await Incident.findAndCountAll({
    where: { hero_id: heroId },
    order: [['assigned_at', 'DESC']],
    limit,
    offset,
  });

  return {
    data: rows,
    pagination: { page, pageSize: limit, total: count, totalPages: Math.ceil(count / limit) },
  };
};

const create = async (data) => {
  return await Incident.create(data);
};

const update = async (id, fields, t = null) => {
  // wyciagamy instancje zeby wymusic zadzialanie hooka po aktualizacji
  const incident = await Incident.findByPk(id, { transaction: t });
  
  if (incident) {
    await incident.update(fields, { transaction: t });
  }
  
  return incident;
};

module.exports = { findAll, findById, findHistoryByHeroId, create, update };