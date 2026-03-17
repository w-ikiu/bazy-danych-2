// punkt startowy - glowny plik konfiguracyjny serwera express, ustawia formatowanie JSON i "podlacza" sciezki (routery)
require('dotenv').config();
const express = require('express');

const heroesRouter = require('./routes/heroes');
const incidentsRouter = require('./routes/incidents');
const statsRouter = require('./routes/stats');

const app = express();
app.use(express.json());

app.use('/api/v1/heroes', heroesRouter);
app.use('/api/v1/incidents', incidentsRouter);
app.use('/api/v1/stats', statsRouter);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).type('application/problem+json').json({
    type: '/errors/internal',
    title: 'Internal Server Error',
    status: 500,
    detail: 'Błąd wewnętrzny serwera'
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));