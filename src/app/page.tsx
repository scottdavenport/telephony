'use client';

import { useEffect, useState } from 'react';

interface CallInfo {
  callSid?: string;
  callerName: string;
  phoneNumber: string;
  startTime: string;
  status: string;
  transcript?: string;
  confidence?: number;
}

export default function Home() {
  const [callInfo, setCallInfo] = useState<CallInfo>({
    callerName: 'No Active Call',
    phoneNumber: '',
    startTime: '',
    status: 'idle'
  });

  useEffect(() => {
    let eventSource: EventSource | null = null;
    let mounted = true;

    async function connect() {
      try {
        if (eventSource) {
          eventSource.close();
        }

        eventSource = new EventSource('/api/twilio/events');
        console.log('Connecting to event stream...');

        eventSource.onopen = () => {
          console.log('Event stream connected');
        };

        eventSource.onmessage = (event) => {
          if (!mounted) return;

          try {
            const data = JSON.parse(event.data);
            console.log('Event received:', data);

            if (data.type === 'initial-state') {
              setCallInfo({
                callSid: data.callSid,
                callerName: data.callerName || 'No Active Call',
                phoneNumber: data.from || '',
                startTime: data.startTime || '',
                status: data.status || 'idle',
                transcript: data.transcript,
                confidence: data.confidence
              });
            } else if (data.type === 'incoming-call' && data.callSid) {
              setCallInfo({
                callSid: data.callSid,
                callerName: data.callerName || 'Unknown Caller',
                phoneNumber: data.from || 'Unknown Number',
                startTime: new Date().toISOString(),
                status: 'ringing'
              });
            } else if (data.type === 'call-status-update' && data.callSid) {
              setCallInfo(prev => {
                if (prev.callSid !== data.callSid) return prev;
                return {
                  ...prev,
                  status: data.status || prev.status,
                  ...(data.status === 'completed' ? { transcript: undefined, confidence: undefined } : {})
                };
              });
            } else if (data.type === 'call-transcription' && data.callSid && data.transcript) {
              setCallInfo(prev => {
                if (prev.callSid !== data.callSid) return prev;
                return {
                  ...prev,
                  transcript: data.transcript,
                  confidence: data.confidence
                };
              });
            }
          } catch (error) {
            console.error('Error processing event:', error);
          }
        };

        eventSource.onerror = (error) => {
          console.error('Event stream error:', error);
          if (eventSource) {
            eventSource.close();
            eventSource = null;
          }
          
          if (mounted) {
            // Reset call info to idle state
            setCallInfo({
              callerName: 'No Active Call',
              phoneNumber: '',
              startTime: '',
              status: 'idle'
            });
            // Attempt to reconnect after a delay
            setTimeout(connect, 2000);
          }
        };
      } catch (error) {
        console.error('Failed to connect to event stream:', error);
        if (mounted) {
          setTimeout(connect, 2000);
        }
      }
    }

    connect();

    return () => {
      mounted = false;
      if (eventSource) {
        console.log('Closing event stream connection');
        eventSource.close();
        eventSource = null;
      }
    };
  }, []);

  // Poll for call status updates if we have an active call
  useEffect(() => {
    if (!callInfo.callSid || callInfo.status === 'completed') return;

    const intervalId = setInterval(async () => {
      try {
        const response = await fetch(`/api/twilio/call-status?callSid=${callInfo.callSid}`);
        const data = await response.json();
        
        if (data.status) {
          setCallInfo(prev => ({
            ...prev,
            status: data.status
          }));

          if (data.status === 'completed') {
            clearInterval(intervalId);
          }
        }
      } catch (error) {
        console.error('Error polling call status:', error);
      }
    }, 5000);

    return () => clearInterval(intervalId);
  }, [callInfo.callSid, callInfo.status]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-900 text-white p-4 flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Call Handler</h1>
        <button className="text-white hover:text-gray-200">Logout</button>
      </header>

      <main className="container mx-auto p-6 space-y-6 max-w-3xl">
        {/* Caller Info Card */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold">{callInfo.callerName}</h2>
              {callInfo.phoneNumber && (
                <div className="flex items-center gap-1 text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>{callInfo.phoneNumber}</span>
                </div>
              )}
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600">Start Time</div>
              <div className="font-medium">{callInfo.startTime || 'N/A'}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Status</div>
              <div className={`font-medium ${callInfo.status === 'ringing' ? 'text-blue-600' : 
                callInfo.status === 'in-progress' ? 'text-green-600' : 
                callInfo.status === 'completed' ? 'text-gray-600' : 'text-yellow-600'}`}>
                {callInfo.status.charAt(0).toUpperCase() + callInfo.status.slice(1)}
              </div>
            </div>
          </div>
        </div>

        {/* Call Status */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Call Status</h3>
          <div className="flex items-center gap-2 text-gray-600">
            {callInfo.status === 'ringing' && (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Incoming call...</span>
              </>
            )}
            {callInfo.status === 'in-progress' && <span>Call in progress</span>}
            {callInfo.status === 'completed' && <span>Call ended</span>}
            {callInfo.status === 'idle' && <span>Waiting for calls</span>}
          </div>
        </div>

        {/* Live Transcript */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Live Transcript</h3>
          <div className="min-h-[200px] p-4 bg-gray-50 rounded-lg text-gray-500">
            {callInfo.status === 'in-progress' ? (
              <div>
                {callInfo.transcript ? (
                  <div className="space-y-2">
                    <p className="text-gray-700">{callInfo.transcript}</p>
                    {callInfo.confidence && (
                      <p className="text-sm text-gray-500">
                        Confidence: {Math.round(callInfo.confidence * 100)}%
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p>Waiting for speech...</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p>Transcript will appear here during the call...</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
