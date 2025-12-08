# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**AHPRA CV Portal** - A web application for medical practitioners (doctors, nurses, allied health professionals) to create, manage, and export CVs in the AHPRA (Australian Health Practitioner Regulation Agency) standard format for registration applications in Australia.

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14+ (App Router) |
| **Backend/Database** | Convex |
| **Authentication** | Convex Auth (Email + Google OAuth) |
| **Styling** | Tailwind CSS + shadcn/ui |
| **PDF Generation** | react-pdf or @react-pdf/renderer |
| **Form Handling** | React Hook Form + Zod validation |
| **Deployment** | Vercel |

## Development Commands

```bash
# Initial setup (when project is created)
npx create-next-app@latest ahpra-cv-portal --typescript --tailwind --app
cd ahpra-cv-portal

# Install dependencies
npm install convex @convex-dev/auth
npm install @react-pdf/renderer react-hook-form @hookform/resolvers zod
npm install react-signature-canvas lucide-react

# Initialize Convex
npx convex init

# Install shadcn/ui components
npx shadcn@latest init
npx shadcn@latest add button input card form label tabs progress

# Development (run in parallel)
npm run dev          # Start Next.js dev server
npx convex dev       # Start Convex backend

# Build and deployment
npm run build        # Build for production
npm run start        # Start production server
npx convex deploy    # Deploy Convex backend
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
├── convex/                # Convex backend
│   ├── schema.ts          # Database schema
│   ├── auth.ts            # Authentication logic
│   └── [tables].ts        # Table operations
├── lib/
│   ├── validations/       # Zod schemas
│   └── utils.ts
└── types/
    └── cv.ts              # TypeScript types
```

## Core AHPRA CV Sections

The application implements these mandatory AHPRA CV sections:

1. **Personal Details** - Name, contact, AHPRA number
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

## Database Architecture (Convex)

- **users** - User authentication data
- **cvProfiles** - Multiple CV profiles per user
- **personalDetails** - Section 1 data
- **qualifications** - Section 2 data
- **bridgingPrograms** - Section 3 data
- **clinicalSkills** - Section 4 data
- **workHistory** - Section 5 data
- **internships** - Section 6 data
- **practiceGaps** - Section 7 data
- **cpdActivities** - Section 8 data
- **publications** - Section 9 data
- **referees** - Section 10 data
- **declarations** - Section 11 data

## Authentication

- **Convex Auth** with Google OAuth and Email magic links
- Session-based authentication
- Row-level security enforced by Convex
- User profiles linked to CV data

## Key Features

- **Multi-profile Support** - Users can create multiple CV variations
- **Auto-save** - Real-time sync via Convex
- **Progress Tracking** - Visual completion indicators
- **PDF Export** - AHPRA-compliant formatting
- **Digital Signature** - Canvas-based signature capture
- **Gap Detection** - Automatic flagging of employment gaps
- **Compliance Validation** - Ensure AHPRA requirements are met

## AHPRA Compliance Requirements

- CV must include signed declaration: "The curriculum vitae is true and correct as at [DATE]"
- Work history in reverse chronological order
- All gaps over 3 months must be explained
- Referee contact details must be current
- No unauthorized use of AHPRA/National Board logos
- Users reminded to attach certified copies of certificates

## Environment Variables

```env
# Convex
CONVEX_DEPLOYMENT=your-deployment
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# Authentication
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
RESEND_API_KEY=your-resend-api-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Development Notes

- Use React Hook Form with Zod validation for all forms
- Implement auto-save functionality using Convex mutations
- Follow shadcn/ui design patterns for consistent UI
- Ensure PDF output matches AHPRA formatting guidelines
- Test signature capture across different devices
- Validate all form inputs against AHPRA requirements

## Testing

- Unit tests for validation schemas
- Integration tests for Convex mutations
- E2E tests for complete CV creation workflow
- PDF generation testing across browsers
- Mobile responsiveness testing

## Deployment

- **Frontend**: Vercel (automatic deployment from main branch)
- **Backend**: Convex cloud (deployed via `npx convex deploy`)
- **Domain**: Configure custom domain in Vercel dashboard
- **SSL**: Automatically handled by Vercel