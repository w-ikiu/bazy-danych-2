const { PrismaClient } = require('@prisma/client');
const { faker } = require('@faker-js/faker');

const prisma = new PrismaClient();

async function main() {
  console.log('rozpoczynam usuwanie starych danych...');
  
  // wymog zadania: usuwanie w odpowiedniej kolejnosci (ze wzgledu na klucze obce)
  await prisma.incidentCategory.deleteMany();
  await prisma.incident.deleteMany();
  await prisma.hero.deleteMany();
  await prisma.category.deleteMany();

  console.log('tworze kategorie...');
  const categoryNames = ['flood', 'fire', 'robbery', 'terrorism', 'accident'];
  const categories = [];
  
  for (const name of categoryNames) {
    const category = await prisma.category.create({
      data: { name },
    });
    categories.push(category);
  }

  console.log('tworze 20 deterministycznych bohaterow...');
  // wymog zadania: deterministyczne dane z uzyciem ziarna 7
  faker.seed(7);
  const powers = ['flight', 'strength', 'telepathy', 'speed', 'invisibility'];
  const statuses = ['available', 'busy', 'retired'];
  
  const heroes = [];
  for (let i = 0; i < 20; i++) {
    const hero = await prisma.hero.create({
      data: {
        name: faker.person.fullName(),
        power: faker.helpers.arrayElement(powers),
        status: faker.helpers.arrayElement(statuses),
        missionsCount: faker.number.int({ min: 0, max: 100 }),
      },
    });
    heroes.push(hero);
  }

  console.log('tworze 60 incydentow z relacjami do kategorii...');
  const levels = ['low', 'medium', 'critical'];
  const incidentStatuses = ['open', 'assigned', 'resolved'];

  for (let i = 0; i < 60; i++) {
    const status = faker.helpers.arrayElement(incidentStatuses);
    const hasHero = status === 'assigned' || status === 'resolved';
    const randomHero = hasHero ? faker.helpers.arrayElement(heroes) : null;

    // losowanie od 1 do 3 unikalnych kategorii dla kazdego incydentu
    const numCategories = faker.number.int({ min: 1, max: 3 });
    const selectedCategories = faker.helpers.arrayElements(categories, numCategories);

    await prisma.incident.create({
      data: {
        location: faker.location.streetAddress(),
        district: faker.location.city(),
        level: faker.helpers.arrayElement(levels),
        status: status,
        heroId: randomHero ? randomHero.id : null,
        assignedAt: hasHero ? faker.date.recent({ days: 10 }) : null,
        resolvedAt: status === 'resolved' ? faker.date.recent({ days: 3 }) : null,
        
        // zagniezdzone tworzenie rekordow w jawnej tabeli posredniej incidentcategory
        categories: {
          create: selectedCategories.map(cat => ({
            categoryId: cat.id
          }))
        }
      }
    });
  }

  console.log('zakonczono sukcesem!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // zawsze zamykamy polaczenie
    await prisma.$disconnect();
  });