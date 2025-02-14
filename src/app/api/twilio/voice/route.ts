import { NextResponse } from 'next/server';
import VoiceResponse from 'twilio/lib/twiml/VoiceResponse';
import { broadcastEvent } from '@/lib/events';

export async function POST(request: Request) {
  try {
    // Get call information from the request
    const body = await request.text();
    const params = new URLSearchParams(body);
    const callSid = params.get('CallSid');
    const from = params.get('From');
    const callerName = params.get('CallerName') || 'Unknown Caller';

    // Log the incoming call
    console.log('Incoming call:', { callSid, from, callerName });

    // Broadcast the call event to the UI
    broadcastEvent({
      type: 'incoming-call',
      callSid: callSid || undefined,
      from: from || undefined,
      callerName: callerName || undefined,
      status: 'ringing',
      startTime: new Date().toISOString()
    });

    // Create TwiML response
    const twiml = new VoiceResponse();
    
    // Add gather for user input with transcription
    const gather = twiml.gather({
      input: ['speech'],
      timeout: 3,
      action: '/api/twilio/voice/gather',
      method: 'POST',
      language: 'en-US',
      speechTimeout: 'auto',
      enhanced: true,
      speechModel: 'phone_call'
    });
    
    gather.say(
      { voice: 'alice' },
      'Hello, welcome to your telephony application. Please wait while we connect you.'
    );

    // If no input, keep the call going
    twiml.redirect('/api/twilio/voice/gather');

    return new NextResponse(twiml.toString(), {
      status: 200,
      headers: {
        'Content-Type': 'text/xml',
      },
    });

  } catch (error) {
    console.error('Error handling call:', error);
    const twiml = new VoiceResponse();
    twiml.say('We encountered an error. Please try again.');
    return new NextResponse(twiml.toString(), {
      status: 200,
      headers: { 'Content-Type': 'text/xml' }
    });
  }
}
