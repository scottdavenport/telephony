import { NextResponse } from 'next/server';
import twilio from 'twilio';
import { headers } from 'next/headers';
import { broadcastEvent } from '@/lib/events';

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function POST(request: Request) {
  try {
    const headersList = await headers();
    const twilioSignature = headersList.get('x-twilio-signature');
    const body = await request.text();
    const params = new URLSearchParams(body);
    const webhookUrl = process.env.TWILIO_WEBHOOK_URL;

    // Validate the request is from Twilio
    if (!webhookUrl || !twilioSignature || !twilio.validateRequest(
      process.env.TWILIO_AUTH_TOKEN!,
      twilioSignature,
      webhookUrl,
      Object.fromEntries(params)
    )) {
      return new NextResponse('Invalid signature', { status: 403 });
    }

    // Extract caller information
    const callSid = params.get('CallSid');
    const from = params.get('From');
    const callerName = params.get('CallerName') || 'Unknown Caller';
    const callStatus = params.get('CallStatus');

    // Generate TwiML response
    const twiml = new twilio.twiml.VoiceResponse();
    twiml.say('Welcome to the call handler system. Please wait while we connect you.');
    twiml.pause({ length: 1 });

    // Broadcast call information to connected clients
    broadcastEvent({
      type: 'incoming-call',
      callSid,
      from,
      callerName,
      status: callStatus
    });

    return new NextResponse(twiml.toString(), {
      headers: {
        'Content-Type': 'text/xml',
      },
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
