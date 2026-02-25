require('dotenv').config();
const express = require('express');

const heroesRouter = require('./routes/heroes');
const incidentsRouter = require('./routes/incidents');

const app = express();
app.use(express.json());

app.use('/api/v1/heroes', heroesRouter);
app.use('/api/v1/incidents', incidentsRouter);

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