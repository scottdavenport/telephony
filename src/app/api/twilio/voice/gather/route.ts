import { NextResponse } from 'next/server';
import VoiceResponse from 'twilio/lib/twiml/VoiceResponse';
import { broadcastEvent } from '@/lib/events';
import { db } from '@/lib/db';
import { callTranscripts } from '@/lib/schema';

export async function POST(request: Request) {
  try {
    // Get call information and speech results
    const body = await request.text();
    const params = new URLSearchParams(body);
    const callSid = params.get('CallSid');
    const from = params.get('From');
    const callerName = params.get('CallerName') || 'Unknown Caller';
    const speechResult = params.get('SpeechResult');
    const confidence = params.get('Confidence');

    // Log transcription
    if (speechResult && callSid) {
      console.log('Speech detected:', {
        callSid,
        speechResult,
        confidence
      });

      // Store transcript in database
      await db.insert(callTranscripts).values({
        callSid,
        transcript: speechResult,
        confidence: confidence || undefined,
        from: from || undefined,
        callerName: callerName || undefined,
      });

      // Broadcast transcription event
      broadcastEvent({
        type: 'call-transcription',
        callSid: callSid || undefined,
        from: from || undefined,
        callerName: callerName || undefined,
        status: 'transcribing',
        transcript: speechResult,
        confidence: parseFloat(confidence || '0')
      });
    }
    
    // Broadcast call status
    broadcastEvent({
      type: 'call-status-update',
      callSid: callSid || undefined,
      from: from || undefined,
      callerName: callerName || undefined,
      status: 'in-progress'
    });

    // Create TwiML response
    const twiml = new VoiceResponse();
    
    // Add gather for continuous interaction with transcription
    const gather = twiml.gather({
      input: ['speech'],
      timeout: 10,
      action: '/api/twilio/voice/gather',
      method: 'POST',
      language: 'en-US',
      speechTimeout: 'auto',
      enhanced: true,
      speechModel: 'phone_call'
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
