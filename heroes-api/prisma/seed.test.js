const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // czyszczenie bazy 
  await prisma.incidentCategory.deleteMany();
  await prisma.incident.deleteMany();
  await prisma.hero.deleteMany();
  await prisma.category.deleteMany();

  // 5 testowych bohaterow ze sztywnymi id
  await prisma.hero.createMany({
    data: [
      { id: 1, name: 'Superman', power: 'flight', status: 'available' },
      { id: 2, name: 'Batman', power: 'strength', status: 'busy' },
      { id: 3, name: 'Flash', power: 'speed', status: 'retired' },
      { id: 4, name: 'Aquaman', power: 'telepathy', status: 'available' },
      { id: 5, name: 'Invisible Woman', power: 'invisibility', status: 'busy' },
    ]
  });

  // testowe kategorie
  await prisma.category.createMany({
    data: [
      { id: 1, name: 'flood' },
      { id: 2, name: 'fire' },
    ]
  });

  // 8 incydentow pokrywajacych rozne kombinacje statusow
  const testIncidents = [
     { id: 1, location: 'City Center', level: 'low', status: 'open' },
     { id: 2, location: 'Bank', level: 'medium', status: 'assigned', heroId: 1, assignedAt: new Date() },
     { id: 3, location: 'Port', level: 'critical', status: 'resolved', heroId: 2, assignedAt: new Date(), resolvedAt: new Date() },
     { id: 4, location: 'Street', level: 'low', status: 'open' },
     { id: 5, location: 'Mall', level: 'critical', status: 'assigned', heroId: 4, assignedAt: new Date() },
     { id: 6, location: 'Park', level: 'medium', status: 'resolved', heroId: 5, assignedAt: new Date(), resolvedAt: new Date() },
     { id: 7, location: 'Subway', level: 'critical', status: 'open' },
     { id: 8, location: 'Airport', level: 'low', status: 'resolved', heroId: 3, assignedAt: new Date(), resolvedAt: new Date() },
  ];

  for (const inc of testIncidents) {
     await prisma.incident.create({
         data: {
             ...inc,
             // laczymy kazdy testowy incydent z pierwsza kategoria
             categories: {
                 create: [{ categoryId: 1 }]
             }
         }
     });
  }

  console.log('baza testowa gotowa!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });