CREATE TABLE IF NOT EXISTS call_transcripts (
  id SERIAL PRIMARY KEY,
  call_sid TEXT NOT NULL,
  transcript TEXT NOT NULL,
  confidence TEXT,
  "from" TEXT,
  caller_name TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
