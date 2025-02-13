CREATE TABLE "calls" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_id" text NOT NULL,
	"phone_number" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"duration" text,
	"recording_url" text,
	"transcription" text,
	"sentiment" jsonb,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" serial PRIMARY KEY NOT NULL,
	"external_id" text NOT NULL,
	"phone_number" text,
	"name" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "customers_external_id_unique" UNIQUE("external_id")
);
