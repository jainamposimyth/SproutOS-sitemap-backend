const { pgTable, uuid, text, jsonb, timestamp } = require("drizzle-orm/pg-core");

const sitemap = pgTable("Sitemap", {
  id: uuid("id").defaultRandom().primaryKey(),  
  projectName: text("projectName").notNull(),
  prompt: text("prompt"),
  nodes: jsonb("nodes").notNull(),
  edges: jsonb("edges").notNull(),
  language: text("language"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").$onUpdateFn(() => new Date()).notNull(),
});

module.exports = { sitemap };
