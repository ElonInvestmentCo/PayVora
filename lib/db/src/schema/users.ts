import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull().default(""),
  email: text("email").notNull().default(""),
  dob: text("dob").notNull().default(""),
  address: text("address").notNull().default(""),
  idType: text("id_type").notNull().default("passport"),
  // Valid statuses: not_verified | pending | reviewing | verified | rejected | requires_resubmission
  kycStatus: text("kyc_status").notNull().default("not_verified"),
  kycSubmittedAt: timestamp("kyc_submitted_at"),
  kycReviewedAt: timestamp("kyc_reviewed_at"),
  rejectionReason: text("rejection_reason"),
  reviewerNotes: text("reviewer_notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
