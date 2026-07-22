# BGSB Learning Management System

Next.js 14 and Supabase implementation of the BGSB enrollment-only LMS specification.

## Run locally

1. Copy `.env.example` to `.env.local` and add Supabase credentials.
2. Apply migrations in `supabase/migrations` to the Supabase project.
3. Run `npm install`, then `npm run dev`.

Authentication is server-verified against `profiles.role`. Create the first `super_admin` profile through the Supabase SQL editor after creating its Auth user. Never expose the service-role key to the browser.

## Included

- Responsive public landing, course catalog/details, and instructor directory
- Six-role login selector with profile-role verification
- Protected, role-specific dashboard shell and overview
- Atomic code redemption and staff-authorized CSV enrollment APIs
- Full core schema with per-table RLS policies
- Password reset, health endpoint, and production Docker image

The dashboard overview includes representative data until Supabase is configured; public courses can then be replaced with database queries.
