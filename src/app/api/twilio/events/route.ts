import { NextResponse } from 'next/server';
import { clients, currentCallState } from '@/lib/events';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const origin = request.headers.get('origin') || '*';
  const encoder = new TextEncoder();
  let streamController: ReadableStreamDefaultController;
  let keepAliveInterval: NodeJS.Timeout;

  const stream = new ReadableStream({
    start(controller) {
      streamController = controller;
      clients.add(controller);

      // Send initial state
      const initialState = {
        type: 'initial-state',
        ...(currentCallState || {
          callerName: 'No Active Call',
          status: 'idle'
        })
      };

      try {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(initialState)}\n\n`));
      } catch (e) {
        console.error('Error sending initial state:', e);
        clients.delete(controller);
        return;
      }

      // Send a keep-alive comment every 15 seconds
      keepAliveInterval = setInterval(() => {
        if (!clients.has(controller)) {
          clearInterval(keepAliveInterval);
          return;
        }

        try {
          controller.enqueue(encoder.encode(': keep-alive\n\n'));
        } catch (e) {
          console.error('Error sending keep-alive:', e);
          clearInterval(keepAliveInterval);
          clients.delete(controller);
        }
      }, 15000);
    },
    cancel() {
      clearInterval(keepAliveInterval);
      clients.delete(streamController);
    },
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
