require('dotenv').config();
const app = require('./app');
const { loadEnv } = require('./config/env');
const { connectDatabase } = require('./config/db');

async function start() {
  const config = loadEnv();
  await connectDatabase(config.mongoUri);
  app.listen(config.port, () => console.log(`API listening on port ${config.port}`));
}

start().catch((error) => { console.error('Unable to start API:', error.message); process.exit(1); });
