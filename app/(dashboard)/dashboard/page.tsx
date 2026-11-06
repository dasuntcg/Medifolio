import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  User,
  Briefcase,
  GraduationCap,
  Stethoscope,
  BookOpen,
  Users,
  Clock,
  Award,
  FileCheck,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

const profileSections = [
  {
    id: "personal-details",
    title: "Personal Details",
    description: "Name, contact, AHPRA number",
    icon: User,
    href: "/profile/personal-details",
  },
  {
    id: "qualifications",
    title: "Qualifications",
    description: "Medical degrees and certifications",
    icon: GraduationCap,
    href: "/profile/qualifications",
  },
  {
    id: "work-history",
    title: "Work History",
    description: "Employment and clinical experience",
    icon: Briefcase,
    href: "/profile/work-history",
  },
  {
    id: "clinical-skills",
    title: "Clinical Skills",
    description: "Skills and proficiency levels",
    icon: Stethoscope,
    href: "/profile/clinical-skills",
  },
  {
    id: "cpd-activities",
    title: "CPD Activities",
    description: "Professional development",
    icon: BookOpen,
    href: "/profile/cpd-activities",
  },
  {
    id: "internships",
    title: "Internships & Training",
    description: "Training positions and observerships",
    icon: Award,
    href: "/profile/internships",
  },
  {
    id: "bridging-programs",
    title: "Bridging Programs",
    description: "Qualifying exams and programs",
    icon: FileCheck,
    href: "/profile/bridging-programs",
  },
  {
    id: "practice-gaps",
    title: "Practice Gaps",
    description: "Gaps over 3 months explained",
    icon: Clock,
    href: "/profile/practice-gaps",
  },
  {
    id: "publications",
    title: "Publications",
    description: "Research and publications",
    icon: FileText,
    href: "/profile/publications",
  },
  {
    id: "referees",
    title: "Referees",
    description: "Professional references",
    icon: Users,
    href: "/profile/referees",
  },
];

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get user profile from our users table
  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user?.id)
    .single();

  // Get user's personal details
  const { data: personalDetails } = await supabase
    .from("personal_details")
    .select("*")
    .eq("user_id", user?.id)
    .single();

  // Get counts for each section
  const [
    { count: qualificationsCount },
    { count: workHistoryCount },
    { count: clinicalSkillsCount },
    { count: cpdCount },
    { count: internshipsCount },
    { count: bridgingCount },
    { count: practiceGapsCount },
    { count: publicationsCount },
    { count: refereesCount },
    { count: generatedCVsCount },
  ] = await Promise.all([
    supabase
      .from("qualifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user?.id),
    supabase
      .from("work_history")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user?.id),
    supabase
      .from("clinical_skills")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user?.id),
    supabase
      .from("cpd_activities")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user?.id),
    supabase
      .from("internships")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user?.id),
    supabase
      .from("bridging_programs")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user?.id),
    supabase
      .from("practice_gaps")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user?.id),
    supabase
      .from("publications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user?.id),
    supabase
      .from("referees")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user?.id),
    supabase
      .from("generated_cvs")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user?.id),
  ]);

  const sectionCounts: Record<string, number> = {
    "personal-details": personalDetails ? 1 : 0,
    qualifications: qualificationsCount || 0,
    "work-history": workHistoryCount || 0,
    "clinical-skills": clinicalSkillsCount || 0,
    "cpd-activities": cpdCount || 0,
    internships: internshipsCount || 0,
    "bridging-programs": bridgingCount || 0,
    "practice-gaps": practiceGapsCount || 0,
    publications: publicationsCount || 0,
    referees: refereesCount || 0,
  };

  const completedSections = Object.values(sectionCounts).filter(
    (count) => count > 0
  ).length;
  const totalSections = profileSections.length;
  const progressPercentage = Math.round(
    (completedSections / totalSections) * 100
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {profile?.name || user?.email}
          </p>
        </div>
        <Button asChild>
          <Link href="/generate-cv">Generate CV</Link>
        </Button>
      </div>

      {/* Progress Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Profile Completion</CardTitle>
          <CardDescription>
            Complete your profile sections to generate AHPRA-compliant CVs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>
                {completedSections} of {totalSections} sections completed
              </span>
              <span className="font-medium">{progressPercentage}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Sections Grid */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Your Profile Data</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {profileSections.map((section) => {
            const Icon = section.icon;
            const count = sectionCounts[section.id];
            const isComplete = count > 0;

            return (
              <Link key={section.id} href={section.href}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="rounded-lg bg-muted p-2">
                        <Icon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex items-center gap-2">
                        {isComplete ? (
                          <Badge variant="secondary" className="text-xs">
                            {count} {count === 1 ? "entry" : "entries"}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            Not started
                          </Badge>
                        )}
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <h3 className="font-semibold">{section.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {section.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Generated CVs Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Generated CVs</h2>
          <Button asChild variant="outline" size="sm">
            <Link href="/generated-cvs">View All</Link>
          </Button>
        </div>

        {generatedCVsCount && generatedCVsCount > 0 ? (
          <Card>
            <CardContent className="py-4">
              <p className="text-sm text-muted-foreground">
                You have {generatedCVsCount} generated{" "}
                {generatedCVsCount === 1 ? "CV" : "CVs"}.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-8">
              <div className="rounded-full bg-muted p-3 mb-3">
                <FileText className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-1">No CVs generated yet</h3>
              <p className="text-sm text-muted-foreground text-center mb-4 max-w-sm">
                Complete your profile sections then generate your first
                AHPRA-compliant CV.
              </p>
              <Button asChild>
                <Link href="/generate-cv">Generate CV</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Profile Sections</CardDescription>
            <CardTitle className="text-3xl">
              {completedSections}/{totalSections}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>CVs Generated</CardDescription>
            <CardTitle className="text-3xl">{generatedCVsCount || 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Account Status</CardDescription>
            <CardTitle className="text-lg flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-500"></span>
              Active
            </CardTitle>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
