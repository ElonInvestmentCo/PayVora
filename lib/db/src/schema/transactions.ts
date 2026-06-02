import { pgTable, serial, integer, text, timestamp, numeric, json } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const transactionsTable = pgTable("transactions", {
  id:            serial("id").primaryKey(),
  userId:        integer("user_id").notNull().references(() => usersTable.id),
  reference:     text("reference").notNull().unique(),
  type:          text("type").notNull(),
  title:         text("title").notNull(),
  amountUsd:     numeric("amount_usd", { precision: 18, scale: 2 }),
  amountNgn:     numeric("amount_ngn", { precision: 18, scale: 2 }),
  currency:      text("currency").notNull().default("USD"),
  status:        text("status").notNull().default("pending"),
  direction:     text("direction").notNull().default("in"),
  paystackStatus: text("paystack_status"),
  metadata:      json("metadata"),
  createdAt:     timestamp("created_at").notNull().defaultNow(),
  updatedAt:     timestamp("updated_at").notNull().defaultNow(),
});

export type Transaction = typeof transactionsTable.$inferSelect;
export type InsertTransaction = typeof transactionsTable.$inferInsert;
