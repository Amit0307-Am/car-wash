# Car Wash Booking Site

A premium local car wash and detailing website built with Next.js, TypeScript, Tailwind CSS, and live Supabase-backed booking/admin flows.

## Current status

The project now includes:
- premium public landing, booking, contact, and admin pages
- Supabase-backed booking persistence with server-side validation
- protected admin login and authenticated booking management endpoints
- RLS-protected database schema and atomic slot reservation logic
- Vercel-ready deployment cleanup for preview preparation

## Tech stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Supabase JS client + SSR helpers

## Local development

1. Install dependencies:
   npm install
2. Copy `.env.example` to `.env.local` and add your real Supabase values.
3. Start the app:
   npm run dev
4. Open http://localhost:3000

## Environment variables

Required values for local development and preview deployment:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SITE_URL`

Optional values for production-safe booking rate limiting on Vercel preview:
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

## Preview deployment notes

- Do not deploy automatically from this workspace.
- Verify the live Supabase project is linked and the migrations have been pushed.
- Confirm `NEXT_PUBLIC_SITE_URL` matches the Vercel preview URL for the deployed branch.
- Keep `.env.local` local-only; do not commit secrets.

## Key implementation areas

- `app/api/book/route.ts` handles public booking requests.
- `lib/booking/booking-engine.ts` validates and persists bookings server-side.
- `app/admin/page.tsx` renders the authenticated admin dashboard.
- `supabase/migrations/002_security_and_capacity.sql` enables RLS, restricts public access, and adds atomic slot reservation.

## Important

- The app is prepared for preview deployment review, but the remaining owner-specific details such as exact business address, phone number, and live review content should be confirmed before launch.
