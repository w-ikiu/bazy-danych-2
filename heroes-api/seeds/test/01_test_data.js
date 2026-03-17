// seed dla srodowiska testowego - sztywne dane bez fakera
exports.seed = async function(knex) {
  // najpierw czyscimy tabele (odwrotna kolejnosc zeby nie zepsuc kluczy obcych)
  await knex('incidents').del();
  await knex('heroes').del();

  // wstawiamy dokladnie 5 bohaterow z twardymi id
  await knex('heroes').insert([
    { id: 1, name: 'Superman', power: 'flight', status: 'available', missions_count: 10 },
    { id: 2, name: 'Batman', power: 'strength', status: 'busy', missions_count: 50 },
    { id: 3, name: 'Flash', power: 'speed', status: 'available', missions_count: 25 },
    { id: 4, name: 'Aquaman', power: 'telepathy', status: 'retired', missions_count: 100 },
    { id: 5, name: 'Wonder Woman', power: 'strength', status: 'available', missions_count: 40 }
  ]);

  // wstawiamy dokladnie 8 incydentow
  await knex('incidents').insert([
    { id: 1, location: 'Bank', district: 'Downtown', level: 'critical', status: 'assigned', hero_id: 2, assigned_at: knex.fn.now() },
    { id: 2, location: 'Sklep', district: 'Przymorze', level: 'low', status: 'open' },
    { id: 3, location: 'Ulica', district: 'Wrzeszcz', level: 'medium', status: 'resolved', hero_id: 1, assigned_at: knex.fn.now(), resolved_at: knex.fn.now() },
    { id: 4, location: 'Szkola', district: 'Oliwa', level: 'low', status: 'open' },
    { id: 5, location: 'Park', district: 'Zaspa', level: 'medium', status: 'open' },
    { id: 6, location: 'Muzeum', district: 'Srodmiescie', level: 'critical', status: 'open' },
    { id: 7, location: 'Kino', district: 'Chelm', level: 'low', status: 'open' },
    { id: 8, location: 'Plaza', district: 'Brzezno', level: 'medium', status: 'open' }
  ]);
};