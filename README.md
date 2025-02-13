# Shop Receptionist

A modern telephony system built with Next.js 14, TypeScript, and Neon PostgreSQL.

## Tech Stack

- **Frontend:** Next.js 14 with TypeScript and React
- **Database:** Neon PostgreSQL with Drizzle ORM
- **Authentication:** WorkOS (JWT-based)
- **Messaging:** Synadia NATS
- **UI Components:** Radix UI + Tailwind CSS

## Getting Started

1. Clone the repository
2. Copy `.env.example` to `.env.local` and fill in your environment variables
3. Install dependencies:
   ```bash
   npm install
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Database Setup

1. Create a new database in [Neon](https://neon.tech)
2. Copy your database connection string to `DATABASE_URL` in `.env.local`
3. Run database migrations:
   ```bash
   npm run db:push
   ```

## Project Structure

```
src/
├── app/             # Next.js 14 app directory
├── components/      # Reusable UI components
├── lib/            # Shared utilities and database config
└── types/          # TypeScript type definitions
```
