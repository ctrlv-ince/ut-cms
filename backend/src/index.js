const app = require('./app');
const { initializeDatabase } = require('./db');
const { seedData } = require('./seeds/initial-data');

const PORT = process.env.PORT || 3030;

async function startServer() {
  try {
    console.log('[CMS Backend] Initializing SQLite database schema...');
    await initializeDatabase();

    console.log('[CMS Backend] Checking seed data...');
    await seedData();

    const server = await app.listen(PORT);

    console.log(`\n========================================================`);
    console.log(` Directus-Style CMS Backend (FeathersJS Core + SQLite3)`);
    console.log(` Running at: http://localhost:${PORT}`);
    console.log(` REST API:   http://localhost:${PORT}/api/articles`);
    console.log(` Schema:     http://localhost:${PORT}/api/schema`);
    console.log(` Stats:      http://localhost:${PORT}/api/stats`);
    console.log(` Realtime:   Socket.io enabled`);
    console.log(`========================================================\n`);
  } catch (error) {
    console.error('[CMS Backend] Fatal startup error:', error);
    process.exit(1);
  }
}

startServer();
