const pool = require('../db');

const findAll = async ({ severity_level, status } = {}) => {
  const params = [];
  const conditions = [];

  if (severity_level) {
    params.push(severity_level);
    conditions.push(`severity_level = $${params.length}`);
  }
  if (status) {
    params.push(status);
    conditions.push(`status = $${params.length}`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const { rows } = await pool.query(`SELECT * FROM incidents ${whereClause} ORDER BY id`, params);
  return rows;
};

const findById = async (id, client = pool) => {
  const { rows } = await client.query('SELECT * FROM incidents WHERE id = $1', [id]);
  return rows[0] || null;
};

const create = async ({ location, severity_level }) => {
  const { rows } = await pool.query(
    'INSERT INTO incidents (location, severity_level) VALUES ($1, $2) RETURNING *',
    [location, severity_level]
  );
  return rows[0];
};

const update = async (id, fields, client = pool) => {
  const { rows } = await client.query(
    'UPDATE incidents SET status = $1, hero_id = $2 WHERE id = $3 RETURNING *',
    [fields.status, fields.hero_id, id]
  );
  return rows[0];
};

module.exports = { findAll, findById, create, update };