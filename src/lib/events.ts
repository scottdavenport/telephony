interface CallState {
  callSid?: string;
  callerName: string;
  from?: string;
  status: string;
  startTime?: string;
  transcript?: string;
  confidence?: number;
}

type CallEvent = {
  type: 'incoming-call' | 'call-status-update' | 'call-transcription' | 'initial-state' | 'ping';
  callSid?: string;
  callerName?: string;
  from?: string;
  status?: string;
  startTime?: string;
  transcript?: string;
  confidence?: number;
}

// Store connected SSE clients and current call state
export const clients = new Set<ReadableStreamDefaultController>();
export let currentCallState: CallState | null = null;

// Helper function to broadcast events to all connected clients
export function broadcastEvent(event: CallEvent) {
  const encoder = new TextEncoder();
  
  // Update current call state
  if (event.type === 'incoming-call' && event.callSid) {
    currentCallState = {
      callSid: event.callSid,
      callerName: event.callerName || 'Unknown Caller',
      from: event.from,
      status: 'ringing',
      startTime: new Date().toISOString()
    };
  } else if (event.type === 'call-status-update' && event.callSid) {
    if (!currentCallState || currentCallState.callSid !== event.callSid) {
      currentCallState = {
        callSid: event.callSid,
        callerName: event.callerName || 'Unknown Caller',
        from: event.from,
        status: event.status || 'in-progress',
        startTime: new Date().toISOString()
      };
    } else {
      currentCallState.status = event.status || currentCallState.status;
    }
  } else if (event.type === 'call-transcription' && event.callSid) {
    if (!currentCallState || currentCallState.callSid !== event.callSid) {
      currentCallState = {
        callSid: event.callSid,
        callerName: event.callerName || 'Unknown Caller',
        from: event.from,
        status: 'in-progress',
        startTime: new Date().toISOString(),
        transcript: event.transcript,
        confidence: event.confidence
      };
    } else {
      currentCallState.transcript = event.transcript;
      currentCallState.confidence = event.confidence;
    }
  }

  // Prepare the event to broadcast
  const eventToSend = event.type === 'initial-state' ? {
    type: 'initial-state',
    ...(currentCallState || {
      callerName: 'No Active Call',
      status: 'idle'
    })
  } : event;

  const message = `data: ${JSON.stringify(eventToSend)}\n\n`;
  console.log('Broadcasting event:', eventToSend);

  // Broadcast to all clients
  const deadClients = new Set<ReadableStreamDefaultController>();
  
  clients.forEach((client) => {
    try {
      client.enqueue(encoder.encode(message));
    } catch (e) {
      console.error('Error broadcasting to client:', e);
      deadClients.add(client);
    }
  });

  // Clean up dead clients
  deadClients.forEach(client => clients.delete(client));
}
