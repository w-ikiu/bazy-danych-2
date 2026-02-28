// tutaj wykonuje sie kod SQL, pobiera albo zapisuje dane w bazie i oddaje gotowe wyniki do Service

// uzywa pool z db.js do polaczen z baza
const pool = require('../db');

// zwraca liste bohaterow, jest wywolywane w np heroService
const findAll = async ({ status, power } = {}) => {
  const params = [];
  const conditions = [];

  if (status) {
    params.push(status);
    conditions.push(`status = $${params.length}`);
  }

  if (power) {
    params.push(power);
    conditions.push(`power = $${params.length}`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const query = `SELECT id, name, power, status FROM heroes ${whereClause} ORDER BY id`;

  const { rows } = await pool.query(query, params);
  return rows;
};

// szuka bohatera po id
const findById = async (id, client = pool) => {
  const { rows } = await client.query('SELECT * FROM heroes WHERE id = $1', [id]);
  return rows[0] || null;
};

// dodanie bohatera do bazy, uzywamy $1 i $2 dla bezpieczenstwa
const create = async ({ name, power }) => {
  const { rows } = await pool.query(
    'INSERT INTO heroes (name, power) VALUES ($1, $2) RETURNING *',
    [name, power]
  );
  return rows[0];
};

module.exports = { findAll, findById, create };