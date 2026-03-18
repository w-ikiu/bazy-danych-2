const { sequelize, Hero, Incident } = require('../models');

const getSystemStats = async () => {
  const totalHeroes = await Hero.count();
  const totalIncidents = await Incident.count();
  
  // uzywamy wbudowanych metod sequelize do agregacji bez pisania czystego sql
  const incidentsByStatus = await Incident.findAll({
    attributes: [
      'status',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
    ],
    group: ['status'],
    raw: true, // raw zwraca czyste obiekty js zamiast ciezkich instancji modeli
  });

  // pobieramy srednia liczba misji uzywajac wbudowanej metody avg
  const avgMissionsResult = await Hero.findAll({
    attributes: [
      [sequelize.fn('AVG', sequelize.col('missions_count')), 'avg'],
    ],
    raw: true,
  });

  return {
    totalHeroes,
    totalIncidents,
    incidentsByStatus: incidentsByStatus.map(row => ({
      status: row.status,
      count: parseInt(row.count, 10),
    })),
    avgMissionsPerHero: avgMissionsResult[0]?.avg 
      ? parseFloat(avgMissionsResult[0].avg).toFixed(2) 
      : '0.00',
  };
};

module.exports = { getSystemStats };