import { pgTable, serial, integer, timestamp, numeric } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const walletsTable = pgTable("wallets", {
  id:         serial("id").primaryKey(),
  userId:     integer("user_id").notNull().unique().references(() => usersTable.id),
  usdBalance: numeric("usd_balance", { precision: 18, scale: 2 }).notNull().default("0"),
  ngnBalance: numeric("ngn_balance", { precision: 18, scale: 2 }).notNull().default("0"),
  createdAt:  timestamp("created_at").notNull().defaultNow(),
  updatedAt:  timestamp("updated_at").notNull().defaultNow(),
});

export type Wallet = typeof walletsTable.$inferSelect;
export type InsertWallet = typeof walletsTable.$inferInsert;
