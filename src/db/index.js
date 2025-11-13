const { drizzle } = require("drizzle-orm/node-postgres");
const { Pool } = require("pg");
const schema = require("./schema.js");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool, { schema });
const { sitemap } = schema;

module.exports = { db, sitemap };

