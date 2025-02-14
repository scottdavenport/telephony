import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { callTranscripts } from '@/lib/schema';
import { desc } from 'drizzle-orm';

export async function GET() {
  try {
    const results = await db.select()
      .from(callTranscripts)
      .orderBy(desc(callTranscripts.createdAt))
      .limit(10);

    return NextResponse.json({ transcripts: results });
  } catch (error) {
    console.error('Error fetching transcripts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transcripts' },
      { status: 500 }
    );
  }
}
