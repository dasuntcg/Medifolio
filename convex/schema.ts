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
    profileName: v.string(),
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