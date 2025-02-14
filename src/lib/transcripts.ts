import { db } from './db';
import { callTranscripts } from './schema';

export async function saveTranscript({
  callSid,
  transcript,
  confidence,
  from,
  callerName,
}: {
  callSid: string;
  transcript: string;
  confidence?: string;
  from?: string;
  callerName?: string;
}) {
  return await db.insert(callTranscripts).values({
    callSid,
    transcript,
    confidence,
    from,
    callerName,
  }).returning();
}
