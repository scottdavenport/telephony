import { NextResponse } from 'next/server';
import { clients, currentCallState } from '@/lib/events';

export async function GET() {
  const encoder = new TextEncoder();
  let streamController: ReadableStreamDefaultController;
  const stream = new ReadableStream({
    start(controller) {
      streamController = controller;
      clients.add(controller);

      // Send initial state
      const initialState = {
        type: 'initial-state',
        currentCall: currentCallState
      };
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(initialState)}\n\n`));
    },
    cancel() {
      clients.delete(streamController);
    },
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
