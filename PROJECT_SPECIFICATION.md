# AHPRA CV Portal - Project Specification

## Overview

A web portal for medical practitioners (doctors, nurses, allied health professionals) to create, manage, and export CVs in the **AHPRA (Australian Health Practitioner Regulation Agency)** standard format for registration applications in Australia.

---

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

---

## Core Features

### 1. Authentication

- **Email/Name Registration**: Simple signup with just email and name
- **Google OAuth**: One-click signup/login via Google
- **Session Management**: Handled by Convex Auth
- **Password-less Option**: Magic link via email (recommended for simplicity)

### 2. AHPRA CV Sections (Based on Official Guidelines)

The CV builder must include the following sections as per AHPRA requirements:

#### Section 1: Personal Details
- Full name
- Date of birth
- Contact address
- Phone number
- Email address
- AHPRA registration number (if existing)
- Passport/citizenship details

#### Section 2: Qualifications
- Primary medical degree
- Institution name
- Country
- Year of completion
- Additional qualifications/degrees

#### Section 3: Bridging Programs & Qualifying Exams
- Exam/program name
- Date completed
- Facility name
- City, State, Country
- Results (Pass/Fail/Score)
- Status: Competent / Observed

#### Section 4: Clinical & Procedural Skills
- Skill name
- Proficiency level: **Competent** or **Observed**
- Date last performed
- Setting (Hospital/Clinic/etc.)

#### Section 5: Work/Practice History
- Position title
- Employer/Facility name
- Full address
- Start date - End date
- Employment type (Full-time/Part-time/Locum)
- Supervisor name & contact
- Key responsibilities
- Weekly hours

#### Section 6: Internship & Observership
- Institution
- Department/Rotation
- Duration
- Supervisor details
- Skills gained

#### Section 7: Gaps in Practice History
- Gap period (dates)
- Reason for gap
- Activities during gap (if any)

#### Section 8: Professional Development & CPD
- Course/Activity name
- Provider
- Date
- Hours/Credits

#### Section 9: Publications & Research (Optional)
- Title
- Journal/Conference
- Date
- Authors

#### Section 10: Referees
- Referee name
- Position
- Organization
- Contact details
- Relationship to applicant

#### Section 11: Declaration
- Auto-generated statement: *"The curriculum vitae is true and correct as at [DATE]"*
- Digital signature capture
- Date of declaration

---

## Database Schema (Convex)

```typescript
// convex/schema.ts

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    googleId: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    createdAt: v.number(),
    lastLoginAt: v.number(),
  }).index("by_email", ["email"])
    .index("by_googleId", ["googleId"]),

  cvProfiles: defineTable({
    userId: v.id("users"),
    profileName: v.string(), // e.g., "Main CV", "Specialist Application"
    isDefault: v.boolean(),
    lastUpdatedAt: v.number(),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  personalDetails: defineTable({
    cvProfileId: v.id("cvProfiles"),
    fullName: v.string(),
    dateOfBirth: v.string(),
    address: v.string(),
    city: v.string(),
    state: v.string(),
    postcode: v.string(),
    country: v.string(),
    phone: v.string(),
    email: v.string(),
    ahpraNumber: v.optional(v.string()),
    passportNumber: v.optional(v.string()),
    citizenship: v.optional(v.string()),
  }).index("by_cvProfile", ["cvProfileId"]),

  qualifications: defineTable({
    cvProfileId: v.id("cvProfiles"),
    degreeTitle: v.string(),
    institution: v.string(),
    country: v.string(),
    yearCompleted: v.number(),
    certificateNumber: v.optional(v.string()),
    sortOrder: v.number(),
  }).index("by_cvProfile", ["cvProfileId"]),

  bridgingPrograms: defineTable({
    cvProfileId: v.id("cvProfiles"),
    programName: v.string(),
    facility: v.string(),
    city: v.string(),
    state: v.string(),
    country: v.string(),
    dateCompleted: v.string(),
    result: v.string(),
    status: v.union(v.literal("competent"), v.literal("observed")),
    sortOrder: v.number(),
  }).index("by_cvProfile", ["cvProfileId"]),

  clinicalSkills: defineTable({
    cvProfileId: v.id("cvProfiles"),
    skillName: v.string(),
    proficiency: v.union(v.literal("competent"), v.literal("observed")),
    dateLastPerformed: v.optional(v.string()),
    setting: v.optional(v.string()),
    sortOrder: v.number(),
  }).index("by_cvProfile", ["cvProfileId"]),

  workHistory: defineTable({
    cvProfileId: v.id("cvProfiles"),
    positionTitle: v.string(),
    employerName: v.string(),
    address: v.string(),
    city: v.string(),
    state: v.string(),
    country: v.string(),
    startDate: v.string(),
    endDate: v.optional(v.string()),
    isCurrent: v.boolean(),
    employmentType: v.union(
      v.literal("full-time"),
      v.literal("part-time"),
      v.literal("locum"),
      v.literal("volunteer")
    ),
    weeklyHours: v.optional(v.number()),
    supervisorName: v.optional(v.string()),
    supervisorContact: v.optional(v.string()),
    responsibilities: v.optional(v.string()),
    sortOrder: v.number(),
  }).index("by_cvProfile", ["cvProfileId"]),

  internships: defineTable({
    cvProfileId: v.id("cvProfiles"),
    institution: v.string(),
    department: v.string(),
    startDate: v.string(),
    endDate: v.string(),
    supervisorName: v.optional(v.string()),
    supervisorContact: v.optional(v.string()),
    skillsGained: v.optional(v.string()),
    sortOrder: v.number(),
  }).index("by_cvProfile", ["cvProfileId"]),

  practiceGaps: defineTable({
    cvProfileId: v.id("cvProfiles"),
    startDate: v.string(),
    endDate: v.string(),
    reason: v.string(),
    activities: v.optional(v.string()),
    sortOrder: v.number(),
  }).index("by_cvProfile", ["cvProfileId"]),

  cpdActivities: defineTable({
    cvProfileId: v.id("cvProfiles"),
    activityName: v.string(),
    provider: v.string(),
    dateCompleted: v.string(),
    hoursCredits: v.optional(v.number()),
    certificateNumber: v.optional(v.string()),
    sortOrder: v.number(),
  }).index("by_cvProfile", ["cvProfileId"]),

  publications: defineTable({
    cvProfileId: v.id("cvProfiles"),
    title: v.string(),
    journalConference: v.string(),
    datePublished: v.string(),
    authors: v.string(),
    doi: v.optional(v.string()),
    sortOrder: v.number(),
  }).index("by_cvProfile", ["cvProfileId"]),

  referees: defineTable({
    cvProfileId: v.id("cvProfiles"),
    name: v.string(),
    position: v.string(),
    organization: v.string(),
    email: v.string(),
    phone: v.string(),
    relationship: v.string(),
    sortOrder: v.number(),
  }).index("by_cvProfile", ["cvProfileId"]),

  declarations: defineTable({
    cvProfileId: v.id("cvProfiles"),
    declarationText: v.string(),
    signatureDataUrl: v.optional(v.string()),
    signedAt: v.optional(v.number()),
  }).index("by_cvProfile", ["cvProfileId"]),
});
```

---

## Project Structure

```
ahpra-cv-portal/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── cv/
│   │   │   ├── [cvId]/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── personal/page.tsx
│   │   │   │   ├── qualifications/page.tsx
│   │   │   │   ├── bridging/page.tsx
│   │   │   │   ├── skills/page.tsx
│   │   │   │   ├── work-history/page.tsx
│   │   │   │   ├── internships/page.tsx
│   │   │   │   ├── gaps/page.tsx
│   │   │   │   ├── cpd/page.tsx
│   │   │   │   ├── publications/page.tsx
│   │   │   │   ├── referees/page.tsx
│   │   │   │   ├── declaration/page.tsx
│   │   │   │   └── preview/page.tsx
│   │   │   └── new/
│   │   │       └── page.tsx
│   │   └── settings/
│   │       └── page.tsx
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   └── GoogleButton.tsx
│   ├── cv/
│   │   ├── CVSidebar.tsx
│   │   ├── CVProgress.tsx
│   │   ├── PersonalDetailsForm.tsx
│   │   ├── QualificationsForm.tsx
│   │   ├── BridgingProgramsForm.tsx
│   │   ├── ClinicalSkillsForm.tsx
│   │   ├── WorkHistoryForm.tsx
│   │   ├── InternshipsForm.tsx
│   │   ├── PracticeGapsForm.tsx
│   │   ├── CPDForm.tsx
│   │   ├── PublicationsForm.tsx
│   │   ├── RefereesForm.tsx
│   │   ├── DeclarationForm.tsx
│   │   ├── SignatureCanvas.tsx
│   │   └── CVPreview.tsx
│   ├── pdf/
│   │   └── CVPDFDocument.tsx
│   └── ui/
│       └── ... (shadcn components)
├── convex/
│   ├── _generated/
│   ├── schema.ts
│   ├── auth.ts
│   ├── users.ts
│   ├── cvProfiles.ts
│   ├── personalDetails.ts
│   ├── qualifications.ts
│   ├── bridgingPrograms.ts
│   ├── clinicalSkills.ts
│   ├── workHistory.ts
│   ├── internships.ts
│   ├── practiceGaps.ts
│   ├── cpdActivities.ts
│   ├── publications.ts
│   ├── referees.ts
│   └── declarations.ts
├── lib/
│   ├── utils.ts
│   ├── validations/
│   │   └── cv-schemas.ts
│   └── pdf/
│       └── generate-cv.ts
├── hooks/
│   ├── useAuth.ts
│   └── useCV.ts
└── types/
    └── cv.ts
```

---

## Authentication Implementation

### Option 1: Convex Auth with Email Magic Link + Google

```typescript
// convex/auth.config.ts
export default {
  providers: [
    {
      domain: process.env.CONVEX_SITE_URL,
      applicationID: "convex",
    },
  ],
};
```

```typescript
// convex/auth.ts
import { convexAuth } from "@convex-dev/auth/server";
import { Google } from "@auth/core/providers/google";
import { Resend } from "@auth/core/providers/resend";

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Resend({
      from: "noreply@yourdomain.com",
    }),
  ],
});
```

### Simple Registration Component

```tsx
// components/auth/RegisterForm.tsx
"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function RegisterForm() {
  const { signIn } = useAuthActions();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await signIn("resend", { email, name });
    setIsLoading(false);
  };

  const handleGoogleSignup = () => {
    signIn("google");
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleEmailSignup} className="space-y-4">
        <Input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Sending link..." : "Continue with Email"}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or</span>
        </div>
      </div>

      <Button
        variant="outline"
        className="w-full"
        onClick={handleGoogleSignup}
      >
        <GoogleIcon className="mr-2 h-4 w-4" />
        Continue with Google
      </Button>
    </div>
  );
}
```

---

## My Suggestions & Recommendations

### 1. **User Experience Enhancements**

| Feature | Benefit |
|---------|---------|
| **Progress Indicator** | Show completion % for each CV section |
| **Auto-save** | Convex real-time sync handles this automatically |
| **Section Templates** | Pre-filled common clinical skills, CPD activities |
| **Import from LinkedIn** | Parse LinkedIn profile data (future feature) |
| **Duplicate CV** | Create variations for different applications |

### 2. **Smart Features**

```
✅ Gap Detection - Automatically flag gaps in work history
✅ Reminder System - Notify users about incomplete sections
✅ Version History - Track changes to CV over time
✅ Compliance Checker - Validate CV meets AHPRA requirements
✅ AI Suggestions - Help users write better descriptions
```

### 3. **Export Options**

- **PDF Export** - AHPRA-compliant format with declaration
- **Word Export** - For manual editing
- **Print-friendly** - Clean print stylesheet
- **Share Link** - Temporary shareable link (for recruiters)

### 4. **Security Considerations**

```typescript
// Convex automatically handles:
// - Row-level security
// - Real-time permissions
// - Secure authentication

// Additional measures:
// - Encrypt sensitive fields (passport numbers)
// - Audit logging for compliance
// - Session timeout for inactive users
// - Data export/deletion (GDPR-like compliance)
```

### 5. **Monetization Options** (If Applicable)

| Tier | Features |
|------|----------|
| **Free** | 1 CV, PDF export, basic features |
| **Pro ($9/mo)** | Unlimited CVs, Word export, AI suggestions |
| **Enterprise** | Team features, custom branding, API access |

### 6. **Additional Pages to Consider**

- **Help Center** - AHPRA guidelines explained
- **CV Examples** - Sample AHPRA CVs (anonymized)
- **FAQ** - Common questions about registration
- **Blog** - SEO content about AHPRA registration process

---

## Environment Variables

```env
# .env.local

# Convex
CONVEX_DEPLOYMENT=your-deployment
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Email (Resend)
RESEND_API_KEY=your-resend-api-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Getting Started Commands

```bash
# Create Next.js project
npx create-next-app@latest ahpra-cv-portal --typescript --tailwind --app

# Navigate to project
cd ahpra-cv-portal

# Install Convex
npm install convex @convex-dev/auth

# Initialize Convex
npx convex init

# Install additional dependencies
npm install @react-pdf/renderer react-hook-form @hookform/resolvers zod
npm install react-signature-canvas
npm install lucide-react

# Install shadcn/ui
npx shadcn@latest init
npx shadcn@latest add button input card form label tabs progress

# Start development
npm run dev
# In another terminal:
npx convex dev
```

---

## Key AHPRA Compliance Notes

1. **Declaration Required** - CV must include: *"The curriculum vitae is true and correct as at [DATE]"* - signed and dated
2. **No AHPRA Logo** - Do not use AHPRA or National Board logos without permission
3. **Certified Copies** - Remind users to attach certified copies of certificates
4. **Gap Explanations** - All gaps over 3 months must be explained
5. **Reverse Chronological** - Work history should be most recent first
6. **Contact Details for Referees** - Must include working contact details

---

## Timeline Estimate

| Phase | Duration | Tasks |
|-------|----------|-------|
| **Phase 1** | 1 week | Setup, Auth, Basic CV CRUD |
| **Phase 2** | 2 weeks | All CV sections, Forms, Validation |
| **Phase 3** | 1 week | PDF Generation, Preview |
| **Phase 4** | 1 week | Polish, Testing, Deployment |

**Total: ~5 weeks for MVP**

---

## Next Steps

1. Set up the Next.js + Convex project
2. Implement authentication (Google + Email)
3. Create the database schema
4. Build the CV form sections one by one
5. Implement PDF generation
6. Add the declaration/signature feature
7. Test and deploy

---

*Last Updated: December 2025*