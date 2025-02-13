interface BaseCallEvent {
  callSid: string | null;
  callerName: string | null;
  from: string | null;
  status: string | null;
  startTime?: string;
}

interface IncomingCallEvent extends BaseCallEvent {
  type: 'incoming-call';
}

interface CallStatusUpdateEvent extends BaseCallEvent {
  type: 'call-status-update';
}

interface InitialStateEvent extends BaseCallEvent {
  type: 'initial-state';
}

type CallEvent = IncomingCallEvent | CallStatusUpdateEvent | InitialStateEvent;

// Store connected SSE clients and current call state
export const clients = new Set<ReadableStreamDefaultController>();
export let currentCallState: CallEvent | null = null;

// Helper function to broadcast events to all connected clients
export function broadcastEvent(event: CallEvent) {
  const encoder = new TextEncoder();
  const message = `data: ${JSON.stringify(event)}\n\n`;
  
  // Update current call state
  if (event.type === 'incoming-call') {
    currentCallState = event;
  } else if (event.type === 'call-status-update' && currentCallState) {
    currentCallState = {
      ...currentCallState,
      type: 'call-status-update',
      status: event.status
    };
  }

  clients.forEach((client) => {
    try {
      client.enqueue(encoder.encode(message));
    } catch (e) {
      console.error('Error broadcasting to client:', e);
    }
  });
}
