import { NextResponse } from 'next/server';
import twilio from 'twilio';

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const callSid = searchParams.get('callSid');

    if (!callSid) {
      return new NextResponse('Call SID is required', { status: 400 });
    }

    const call = await twilioClient.calls(callSid).fetch();
    
    return NextResponse.json({
      status: call.status,
      from: call.from,
      to: call.to,
      direction: call.direction,
      duration: call.duration,
      startTime: call.startTime,
      endTime: call.endTime,
    });
  } catch (error) {
    console.error('Error fetching call status:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
