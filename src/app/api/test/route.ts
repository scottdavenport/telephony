import { NextResponse } from 'next/server';

export function GET() {
  return new NextResponse('Test endpoint working', { status: 200 });
}
