// zadaniem service jest pilnowanie regul biznesowych i walidacja danych przed zapisem do bazy

// ma "dostep" do repository zeby np uzywac jej funkcji (wyszukiwania bohaterow albo dodawania itd)
const heroRepository = require('../repositories/heroRepository');

const VALID_POWERS = ['flight', 'strength', 'telepathy', 'speed', 'invisibility'];

// funkcja filtrujaca wiersz danych z bazy (zeby wiersz oddal dokladnie to co chcemy)
const toDTO = (row) => ({
  id: row.id,
  name: row.name,
  power: row.power,
  status: row.status,
  missions_count: row.missions_count // dodano z lab 2
});

// funkcja do formatowania bledow, dzieki temu dodaje do bledu jego kod
const makeError = (message, code) => {
  const err = new Error(message);
  err.code = code;
  return err;
};

// uzywa funkcji z repozytorium zeby zwrocic przefiltrowane dane bohaterow razem z obiektem paginacji
const findAll = async (filters) => {
  const result = await heroRepository.findAll(filters);
  return {
    data: result.data.map(toDTO),
    pagination: result.pagination
  };
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