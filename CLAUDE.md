# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Medifolio** - A web application for medical practitioners (doctors, nurses, allied health professionals) to create, manage, and export professional CVs tailored for healthcare registration applications.

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14+ (App Router) |
| **Backend/Database** | Supabase (PostgreSQL) |
| **Authentication** | Supabase Auth (Email + Google OAuth) |
| **Styling** | Tailwind CSS + shadcn/ui |
| **PDF Generation** | react-pdf or @react-pdf/renderer |
| **Form Handling** | React Hook Form + Zod validation |
| **Deployment** | Vercel |

## Development Commands

```bash
# Install dependencies
npm install

# Install shadcn/ui components
npx shadcn@latest init
npx shadcn@latest add button input card form label tabs progress

# Development
npm run dev          # Start Next.js dev server

# Build and deployment
npm run build        # Build for production
npm run start        # Start production server

# Supabase CLI (optional, for local development)
npx supabase init
npx supabase start   # Start local Supabase instance
npx supabase db push # Push migrations to database
```

## Project Structure

```
/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Protected dashboard pages
│   ├── cv/[cvId]/         # Individual CV section pages
│   └── layout.tsx
├── components/
│   ├── auth/              # Authentication components
│   ├── cv/                # CV form components
│   ├── pdf/               # PDF generation components
│   └── ui/                # shadcn/ui components
├── lib/
│   ├── supabase/          # Supabase client configuration
│   │   ├── client.ts      # Browser client
│   │   ├── server.ts      # Server client
│   │   ├── middleware.ts  # Auth middleware helper
│   │   └── database.types.ts # TypeScript types for database
│   ├── validations/       # Zod schemas
│   └── utils.ts
├── supabase/
│   └── schema.sql         # Database schema (always keep updated)
├── middleware.ts          # Next.js middleware for auth
└── types/
    └── cv.ts              # TypeScript types
```

## Core CV Sections

The application implements these CV sections for medical professionals:

1. **Personal Details** - Name, contact, registration number
2. **Qualifications** - Medical degrees and certifications
3. **Bridging Programs** - Qualifying exams and programs
4. **Clinical Skills** - Skills with competency levels
5. **Work History** - Employment with supervisor details
6. **Internships** - Training and observership
7. **Practice Gaps** - Explanations for gaps over 3 months
8. **CPD Activities** - Professional development
9. **Publications** - Research and publications (optional)
10. **Referees** - Professional references
11. **Declaration** - Legal statement with digital signature

## Database Architecture (Supabase)

All tables use snake_case naming convention:

- **users** - User profile data (extends auth.users)
- **cv_profiles** - Multiple CV profiles per user
- **personal_details** - Section 1 data
- **qualifications** - Section 2 data
- **bridging_programs** - Section 3 data
- **clinical_skills** - Section 4 data
- **work_history** - Section 5 data
- **internships** - Section 6 data
- **practice_gaps** - Section 7 data
- **cpd_activities** - Section 8 data
- **publications** - Section 9 data
- **referees** - Section 10 data
- **declarations** - Section 11 data

## Authentication

- **Supabase Auth** with Google OAuth and Email magic links
- JWT-based authentication with automatic refresh
- Row-level security (RLS) policies on all tables
- User profiles automatically created via database trigger
- Protected routes handled by Next.js middleware

## Key Features

- **Multi-profile Support** - Users can create multiple CV variations
- **Auto-save** - Real-time sync via Supabase
- **Progress Tracking** - Visual completion indicators
- **PDF Export** - Professional formatting for medical CVs
- **Digital Signature** - Canvas-based signature capture
- **Gap Detection** - Automatic flagging of employment gaps
- **Validation** - Ensure all required information is complete

## CV Best Practices

- CV must include signed declaration: "The curriculum vitae is true and correct as at [DATE]"
- Work history in reverse chronological order
- All gaps over 3 months should be explained
- Referee contact details must be current
- Users reminded to attach certified copies of certificates

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Supabase Client Usage

```typescript
// In Client Components
import { createClient } from "@/lib/supabase/client";
const supabase = createClient();

// In Server Components / Route Handlers / Server Actions
import { createClient } from "@/lib/supabase/server";
const supabase = await createClient();
```

## Development Notes

- Use React Hook Form with Zod validation for all forms
- Implement auto-save functionality using Supabase upserts
- Follow shadcn/ui design patterns for consistent UI
- Ensure PDF output is professionally formatted
- Test signature capture across different devices
- Validate all form inputs for completeness
- Generate TypeScript types from database: `npx supabase gen types typescript`

## Testing

- Unit tests for validation schemas
- Integration tests for Supabase queries
- E2E tests for complete CV creation workflow
- PDF generation testing across browsers
- Mobile responsiveness testing

## Deployment

- **Frontend**: Vercel (automatic deployment from main branch)
- **Backend**: Supabase cloud (managed PostgreSQL)
- **Domain**: Configure custom domain in Vercel dashboard
- **SSL**: Automatically handled by Vercel and Supabase

## Database Schema Management

**IMPORTANT**: The database schema is defined in `supabase/schema.sql`. This file is the source of truth for the database structure.

- When making database changes, **always update `supabase/schema.sql`** first
- After updating the schema file, run the SQL in the Supabase SQL Editor to apply changes
- Keep `lib/supabase/database.types.ts` in sync with schema changes
- The schema includes:
  - All table definitions with constraints
  - Row Level Security (RLS) policies
  - Database functions and triggers
  - Indexes for performance

To apply schema changes:
1. Update `supabase/schema.sql`
2. Go to Supabase Dashboard → SQL Editor
3. Run the relevant SQL statements
4. Update `database.types.ts` if types changed
