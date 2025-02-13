import { NextResponse } from 'next/server';
import VoiceResponse from 'twilio/lib/twiml/VoiceResponse';
import { broadcastEvent } from '@/lib/events';

export async function POST(request: Request) {
  try {
    // Get call information
    const body = await request.text();
    const params = new URLSearchParams(body);
    const callSid = params.get('CallSid');
    
    // Broadcast call status
    broadcastEvent({
      type: 'call-status-update',
      callSid: callSid || null,
      from: null,
      callerName: null,
      status: 'in-progress'
    });

    // Create TwiML response
    const twiml = new VoiceResponse();
    
    // Add gather for continuous interaction
    const gather = twiml.gather({
      input: 'speech dtmf',
      timeout: 10,
      action: '/api/twilio/voice/gather',
      method: 'POST'
    });
    
    gather.say(
      { voice: 'alice' },
      'Please let us know if you need assistance.'
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
    console.error('Error in gather endpoint:', error);
    const twiml = new VoiceResponse();
    twiml.say('We encountered an error. Please try again.');
    return new NextResponse(twiml.toString(), {
      status: 200,
      headers: { 'Content-Type': 'text/xml' }
    });
  }
}
