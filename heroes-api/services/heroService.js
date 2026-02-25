const heroRepository = require('../repositories/heroRepository');

const VALID_POWERS = ['flight', 'strength', 'telepathy', 'speed', 'invisibility'];

const toDTO = (row) => ({
  id: row.id,
  name: row.name,
  power: row.power,
  status: row.status
});

const makeError = (message, code) => {
  const err = new Error(message);
  err.code = code;
  return err;
};

const findAll = async (filters) => {
  const rows = await heroRepository.findAll(filters);
  return rows.map(toDTO);
};

const findById = async (id) => {
  const row = await heroRepository.findById(id);
  if (!row) throw makeError(`Bohater o id ${id} nie istnieje`, 'NOT_FOUND');
  return toDTO(row);
};

const create = async ({ name, power }) => {
  if (!name?.trim()) throw makeError('Imię bohatera jest wymagane', 'VALIDATION_ERROR');
  if (!power || !VALID_POWERS.includes(power)) {
    throw makeError('Nieprawidłowa moc bohatera', 'VALIDATION_ERROR');
  }

  const row = await heroRepository.create({ name: name.trim(), power });
  return toDTO(row);
};

module.exports = { findAll, findById, create };