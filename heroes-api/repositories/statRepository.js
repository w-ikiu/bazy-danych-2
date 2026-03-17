// repozytorium do pobierania statystyk za pomoca wbudowanych metod knexa
const knex = require('../db/knex');

const getSystemStats = async () => {
  // zlicza wszystkich bohaterow
  const totalHeroesResult = await knex('heroes').count('id as count').first();
  
  // zlicza wszystkie incydenty
  const totalIncidentsResult = await knex('incidents').count('id as count').first();
  
  // grupuje incydenty po statusie i zlicza ile ich jest w kazdej grupie
  const incidentsByStatus = await knex('incidents')
    .select('status')
    .count('id as count')
    .groupBy('status');
    
  // wylicza srednia liczbe misji na bohatera (zwraca z dokladnoscia do ulamkow)
  const avgMissionsResult = await knex('heroes').avg('missions_count as avg').first();

  return {
    totalHeroes: parseInt(totalHeroesResult.count, 10),
    totalIncidents: parseInt(totalIncidentsResult.count, 10),
    incidentsByStatus: incidentsByStatus.map(row => ({
      status: row.status,
      count: parseInt(row.count, 10)
    })),
    avgMissionsPerHero: parseFloat(avgMissionsResult.avg).toFixed(2)
  };
};

module.exports = { getSystemStats };