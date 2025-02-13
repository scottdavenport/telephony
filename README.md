# Shop Receptionist

A modern telephony system built with Next.js 14, TypeScript, and Twilio. The system handles incoming calls with real-time transcription and status updates.

## Features

- Real-time call handling with Server-Sent Events (SSE)
- Live speech-to-text transcription using Twilio's Enhanced Speech Recognition
- Automatic call status updates
- Resilient event stream with auto-reconnection
- Modern, responsive UI built with Tailwind CSS

## Tech Stack

- **Frontend:** Next.js 14 with TypeScript and React
- **Telephony:** Twilio Voice API with Enhanced Speech Recognition
- **Real-time Updates:** Server-Sent Events (SSE)
- **UI Components:** Tailwind CSS

## Getting Started

1. Clone the repository
2. Copy `.env.example` to `.env.local` and fill in your environment variables:
   ```env
   TWILIO_ACCOUNT_SID=your_account_sid
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_PHONE_NUMBER=your_twilio_number
   TWILIO_WEBHOOK_URL=your_ngrok_url
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Set up ngrok for Twilio webhooks:
   ```bash
   ngrok http 3000
   ```
5. Update your Twilio phone number's webhook URL to point to your ngrok URL
6. Run the development server:
   ```bash
   npm run dev
   ```
7. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
src/
├── app/                    # Next.js 14 app directory
│   ├── api/               # API routes for Twilio webhooks and SSE
│   │   └── twilio/       # Twilio webhook handlers
│   └── page.tsx          # Main call handling interface
├── lib/                   # Shared utilities
│   └── events.ts         # SSE and event broadcasting logic
└── types/                # TypeScript type definitions
```

## Call Handling Flow

1. Incoming call triggers Twilio webhook to `/api/twilio/voice`
2. Server initiates speech recognition and broadcasts call status
3. Frontend receives updates via SSE connection
4. UI updates in real-time with call status and transcriptions
5. Call ends and status is updated to 'completed'

## Environment Variables

| Variable | Description |
|----------|-------------|
| `TWILIO_ACCOUNT_SID` | Your Twilio Account SID |
| `TWILIO_AUTH_TOKEN` | Your Twilio Auth Token |
| `TWILIO_PHONE_NUMBER` | Your Twilio Phone Number |
| `TWILIO_WEBHOOK_URL` | Your ngrok URL for webhooks |

## Contributing

1. Create a new branch for your feature
2. Make your changes with clear commit messages
3. Test your changes thoroughly
4. Submit a pull request with a description of your changes

