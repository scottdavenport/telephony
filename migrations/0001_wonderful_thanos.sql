CREATE TABLE "call_transcripts" (
	"id" serial PRIMARY KEY NOT NULL,
	"call_sid" text NOT NULL,
	"transcript" text NOT NULL,
	"confidence" text,
	"from" text,
	"caller_name" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
