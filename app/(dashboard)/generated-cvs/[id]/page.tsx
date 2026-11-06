import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ChevronLeft,
  User,
  GraduationCap,
  Briefcase,
  Stethoscope,
  BookOpen,
  Award,
  FileCheck,
  Clock,
  FileText,
  Users,
} from "lucide-react";
import Link from "next/link";
import { DeclarationSection } from "./declaration-section";
import { PDFDownloadButton } from "./pdf-download-button";

interface CVData {
  personalDetails: {
    full_name: string;
    date_of_birth?: string;
    address?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
    phone?: string;
    email?: string;
    ahpra_number?: string;
    passport_number?: string;
    citizenship?: string;
  } | null;
  qualifications: Array<{
    degree_title: string;
    institution: string;
    country: string;
    year_completed?: number;
  }>;
  workHistory: Array<{
    position_title: string;
    employer_name: string;
    department?: string;
    city?: string;
    country?: string;
    start_date: string;
    end_date?: string;
    is_current: boolean;
    employment_type?: string;
    responsibilities?: string;
  }>;
  clinicalSkills: Array<{
    skill_name: string;
    category?: string;
    proficiency?: string;
  }>;
  cpdActivities: Array<{
    activity_name: string;
    provider?: string;
    date_completed: string;
    hours_credits?: number;
  }>;
  internships: Array<{
    institution: string;
    department?: string;
    position?: string;
    start_date: string;
    end_date?: string;
  }>;
  bridgingPrograms: Array<{
    program_name: string;
    facility?: string;
    date_completed?: string;
    result?: string;
    status?: string;
  }>;
  practiceGaps: Array<{
    start_date: string;
    end_date: string;
    reason: string;
    activities?: string;
  }>;
  publications: Array<{
    title: string;
    journal_conference?: string;
    date_published?: string;
    authors?: string;
  }>;
  referees: Array<{
    name: string;
    title?: string;
    position: string;
    organization: string;
    email: string;
    phone?: string;
    relationship: string;
  }>;
  generatedAt: string;
}

export default async function GeneratedCVPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: cv, error } = await supabase
    .from("generated_cvs")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !cv) {
    notFound();
  }

  const cvData = cv.cv_data as unknown as CVData;

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-AU", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatMonthYear = (dateString: string | undefined) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-AU", {
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-4">
          <Link href="/generated-cvs">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to CVs
          </Link>
        </Button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{cv.name}</h1>
            <p className="text-muted-foreground">
              Generated on {formatDate(cv.created_at)}
            </p>
          </div>
          <div className="flex gap-2">
            <PDFDownloadButton cvId={cv.id} cvName={cv.name} />
          </div>
        </div>
      </div>

      {/* CV Preview */}
      <div className="bg-white border rounded-lg shadow-sm p-8 space-y-8">
        {/* Personal Details */}
        {cvData.personalDetails && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <User className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold">Personal Details</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-semibold text-lg">
                  {cvData.personalDetails.full_name}
                </p>
                {cvData.personalDetails.ahpra_number && (
                  <p className="text-sm text-muted-foreground">
                    AHPRA: {cvData.personalDetails.ahpra_number}
                  </p>
                )}
              </div>
              <div className="text-right text-sm">
                {cvData.personalDetails.email && (
                  <p>{cvData.personalDetails.email}</p>
                )}
                {cvData.personalDetails.phone && (
                  <p>{cvData.personalDetails.phone}</p>
                )}
                {cvData.personalDetails.city &&
                  cvData.personalDetails.country && (
                    <p>
                      {cvData.personalDetails.city},{" "}
                      {cvData.personalDetails.country}
                    </p>
                  )}
              </div>
            </div>
          </section>
        )}

        <Separator />

        {/* Qualifications */}
        {cvData.qualifications.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <GraduationCap className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold">Qualifications</h2>
            </div>
            <div className="space-y-3">
              {cvData.qualifications.map((q, i) => (
                <div key={i} className="flex justify-between">
                  <div>
                    <p className="font-medium">{q.degree_title}</p>
                    <p className="text-sm text-muted-foreground">
                      {q.institution}, {q.country}
                    </p>
                  </div>
                  {q.year_completed && (
                    <p className="text-sm text-muted-foreground">
                      {q.year_completed}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {cvData.qualifications.length > 0 && <Separator />}

        {/* Work History */}
        {cvData.workHistory.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Briefcase className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold">Work History</h2>
            </div>
            <div className="space-y-4">
              {cvData.workHistory.map((w, i) => (
                <div key={i}>
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium">{w.position_title}</p>
                      <p className="text-sm">{w.employer_name}</p>
                      {w.department && (
                        <p className="text-sm text-muted-foreground">
                          {w.department}
                        </p>
                      )}
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <p>
                        {formatMonthYear(w.start_date)} -{" "}
                        {w.is_current ? "Present" : formatMonthYear(w.end_date)}
                      </p>
                      {w.employment_type && (
                        <Badge variant="outline" className="text-xs">
                          {w.employment_type}
                        </Badge>
                      )}
                    </div>
                  </div>
                  {w.responsibilities && (
                    <p className="text-sm mt-2 text-muted-foreground">
                      {w.responsibilities}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {cvData.workHistory.length > 0 && <Separator />}

        {/* Clinical Skills */}
        {cvData.clinicalSkills.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Stethoscope className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold">Clinical Skills</h2>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {cvData.clinicalSkills.map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-sm">{s.skill_name}</span>
                  {s.proficiency && (
                    <Badge variant="outline" className="text-xs">
                      {s.proficiency}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {cvData.clinicalSkills.length > 0 && <Separator />}

        {/* CPD Activities */}
        {cvData.cpdActivities.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold">CPD Activities</h2>
            </div>
            <div className="space-y-2">
              {cvData.cpdActivities.map((a, i) => (
                <div key={i} className="flex justify-between">
                  <div>
                    <p className="text-sm font-medium">{a.activity_name}</p>
                    {a.provider && (
                      <p className="text-xs text-muted-foreground">
                        {a.provider}
                      </p>
                    )}
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <p>{formatDate(a.date_completed)}</p>
                    {a.hours_credits && <p>{a.hours_credits} hours</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {cvData.cpdActivities.length > 0 && <Separator />}

        {/* Internships */}
        {cvData.internships.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Award className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold">Internships & Training</h2>
            </div>
            <div className="space-y-3">
              {cvData.internships.map((i, idx) => (
                <div key={idx} className="flex justify-between">
                  <div>
                    <p className="font-medium">{i.institution}</p>
                    {i.department && (
                      <p className="text-sm text-muted-foreground">
                        {i.department}
                        {i.position && ` - ${i.position}`}
                      </p>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatMonthYear(i.start_date)} -{" "}
                    {formatMonthYear(i.end_date) || "Present"}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {cvData.internships.length > 0 && <Separator />}

        {/* Bridging Programs */}
        {cvData.bridgingPrograms.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <FileCheck className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold">Bridging Programs</h2>
            </div>
            <div className="space-y-3">
              {cvData.bridgingPrograms.map((b, i) => (
                <div key={i} className="flex justify-between">
                  <div>
                    <p className="font-medium">{b.program_name}</p>
                    {b.facility && (
                      <p className="text-sm text-muted-foreground">
                        {b.facility}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    {b.status && (
                      <Badge
                        variant={
                          b.status === "completed" ? "default" : "outline"
                        }
                        className="text-xs"
                      >
                        {b.status}
                      </Badge>
                    )}
                    {b.result && (
                      <p className="text-sm text-muted-foreground">{b.result}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {cvData.bridgingPrograms.length > 0 && <Separator />}

        {/* Practice Gaps */}
        {cvData.practiceGaps.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold">Practice Gaps</h2>
            </div>
            <div className="space-y-3">
              {cvData.practiceGaps.map((g, i) => (
                <div key={i}>
                  <div className="flex justify-between">
                    <p className="font-medium">{g.reason}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatMonthYear(g.start_date)} -{" "}
                      {formatMonthYear(g.end_date)}
                    </p>
                  </div>
                  {g.activities && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {g.activities}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {cvData.practiceGaps.length > 0 && <Separator />}

        {/* Publications */}
        {cvData.publications.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold">Publications</h2>
            </div>
            <div className="space-y-3">
              {cvData.publications.map((p, i) => (
                <div key={i}>
                  <p className="font-medium">{p.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {p.authors && `${p.authors}. `}
                    {p.journal_conference && `${p.journal_conference}. `}
                    {p.date_published && formatDate(p.date_published)}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {cvData.publications.length > 0 && <Separator />}

        {/* Referees */}
        {cvData.referees.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold">Referees</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {cvData.referees.map((r, i) => (
                <div key={i} className="border rounded-lg p-4">
                  <p className="font-medium">
                    {r.title && `${r.title} `}
                    {r.name}
                  </p>
                  <p className="text-sm">{r.position}</p>
                  <p className="text-sm text-muted-foreground">
                    {r.organization}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">{r.email}</p>
                  {r.phone && (
                    <p className="text-sm text-muted-foreground">{r.phone}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Declaration Section */}
      <DeclarationSection
        cvId={cv.id}
        declarationText={cv.declaration_text}
        signatureDataUrl={cv.signature_data_url}
        signedAt={cv.signed_at}
      />
    </div>
  );
}
