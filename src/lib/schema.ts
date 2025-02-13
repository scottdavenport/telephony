import { pgTable, serial, text, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const calls = pgTable('calls', {
  id: serial('id').primaryKey(),
  customerId: text('customer_id').notNull(),
  phoneNumber: text('phone_number').notNull(),
  status: text('status').notNull().default('pending'),
  duration: text('duration'),
  recordingUrl: text('recording_url'),
  transcription: text('transcription'),
  sentiment: jsonb('sentiment'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const customers = pgTable('customers', {
  id: serial('id').primaryKey(),
  externalId: text('external_id').unique().notNull(),
  phoneNumber: text('phone_number'),
  name: text('name'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
