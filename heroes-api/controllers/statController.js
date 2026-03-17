// kontroler dla statystyk systemu
const statRepository = require('../repositories/statRepository');

const getStats = async (req, res) => {
  try {
    const stats = await statRepository.getSystemStats();
    res.json({ data: stats });
  } catch (err) {
    console.error(err);
    res.status(500).type('application/problem+json').json({
      type: '/errors/internal',
      title: 'Internal Error',
      status: 500,
      detail: 'Błąd podczas pobierania statystyk'
    });
  }
};

module.exports = { getStats };