import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { roadmaps } from "./roadmaps"; // Import the roadmap table for relation

export const roadmapSteps = pgTable("roadmap_steps", {
  id: serial("id").primaryKey(),
  roadmapId: integer("roadmap_id")
    .references(() => roadmaps.id)
    .notNull(),
  title: text("title").notNull(),
  description: text("description"),
  order: integer("order").notNull(), // Defines step sequence
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
