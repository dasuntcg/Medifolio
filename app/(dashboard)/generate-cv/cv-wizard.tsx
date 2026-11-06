"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  AlertCircle,
  FileText,
  Users,
  Eye,
} from "lucide-react";
import { Tables } from "@/lib/supabase/database.types";

type PersonalDetails = Tables<"personal_details">;
type Qualification = Tables<"qualifications">;
type WorkHistory = Tables<"work_history">;
type ClinicalSkill = Tables<"clinical_skills">;
type CPDActivity = Tables<"cpd_activities">;
type Internship = Tables<"internships">;
type BridgingProgram = Tables<"bridging_programs">;
type PracticeGap = Tables<"practice_gaps">;
type Publication = Tables<"publications">;
type Referee = Tables<"referees">;
type CVTemplate = Tables<"cv_templates">;

interface UserData {
  personalDetails: PersonalDetails | null;
  qualifications: Qualification[];
  workHistory: WorkHistory[];
  clinicalSkills: ClinicalSkill[];
  cpdActivities: CPDActivity[];
  internships: Internship[];
  bridgingPrograms: BridgingProgram[];
  practiceGaps: PracticeGap[];
  publications: Publication[];
  referees: Referee[];
}

interface CVWizardProps {
  userData: UserData;
  templates: CVTemplate[];
}

const steps = [
  { id: "name", title: "CV Name", description: "Name your CV" },
  { id: "review", title: "Review Data", description: "Check your profile data" },
  { id: "referees", title: "Select Referees", description: "Choose referees" },
  { id: "confirm", title: "Confirm", description: "Generate your CV" },
];

export function CVWizard({ userData, templates }: CVWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [cvName, setCvName] = useState("");
  const [selectedRefereeIds, setSelectedRefereeIds] = useState<string[]>([]);
  const [selectedTemplateId] = useState(
    templates.find((t) => t.is_default)?.id || "ahpra-standard"
  );

  const availableReferees = userData.referees.filter((r) => r.is_available);

  const toggleReferee = (refereeId: string) => {
    setSelectedRefereeIds((prev) =>
      prev.includes(refereeId)
        ? prev.filter((id) => id !== refereeId)
        : [...prev, refereeId]
    );
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return cvName.trim().length > 0;
      case 1:
        return userData.personalDetails !== null;
      case 2:
        return selectedRefereeIds.length >= 2;
      case 3:
        return true;
      default:
        return false;
    }
  };

  const handleGenerate = async () => {
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("You must be logged in");
      setLoading(false);
      return;
    }

    // Create CV data snapshot
    const cvData = {
      personalDetails: userData.personalDetails,
      qualifications: userData.qualifications,
      workHistory: userData.workHistory,
      clinicalSkills: userData.clinicalSkills,
      cpdActivities: userData.cpdActivities,
      internships: userData.internships,
      bridgingPrograms: userData.bridgingPrograms,
      practiceGaps: userData.practiceGaps,
      publications: userData.publications,
      referees: userData.referees.filter((r) =>
        selectedRefereeIds.includes(r.id)
      ),
      generatedAt: new Date().toISOString(),
    };

    const { data, error: insertError } = await supabase
      .from("generated_cvs")
      .insert({
        user_id: user.id,
        name: cvName,
        template_id: selectedTemplateId,
        selected_referee_ids: selectedRefereeIds,
        cv_data: cvData,
      })
      .select()
      .single();

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    router.push(`/generated-cvs/${data.id}`);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Name Your CV</CardTitle>
              <CardDescription>
                Give this CV a name to help you identify it later.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cv-name">CV Name</Label>
                <Input
                  id="cv-name"
                  value={cvName}
                  onChange={(e) => setCvName(e.target.value)}
                  placeholder="e.g., General Practice Application, Hospital Position 2024"
                  autoFocus
                />
              </div>
            </CardContent>
          </Card>
        );

      case 1:
        return (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Review Your Profile Data</CardTitle>
                <CardDescription>
                  This CV will be generated using the data below. Make sure your
                  profile is up to date.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!userData.personalDetails ? (
                  <div className="flex items-center gap-3 p-4 bg-destructive/10 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-destructive" />
                    <div>
                      <p className="font-medium text-destructive">
                        Personal details required
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Please complete your personal details before generating
                        a CV.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <DataSection
                      title="Personal Details"
                      count={1}
                      items={[userData.personalDetails.full_name]}
                    />
                    <DataSection
                      title="Qualifications"
                      count={userData.qualifications.length}
                      items={userData.qualifications.map((q) => q.degree_title)}
                    />
                    <DataSection
                      title="Work History"
                      count={userData.workHistory.length}
                      items={userData.workHistory.map(
                        (w) => `${w.position_title} at ${w.employer_name}`
                      )}
                    />
                    <DataSection
                      title="Clinical Skills"
                      count={userData.clinicalSkills.length}
                      items={userData.clinicalSkills
                        .slice(0, 3)
                        .map((s) => s.skill_name)}
                      showMore={userData.clinicalSkills.length > 3}
                    />
                    <DataSection
                      title="CPD Activities"
                      count={userData.cpdActivities.length}
                      items={userData.cpdActivities
                        .slice(0, 3)
                        .map((a) => a.activity_name)}
                      showMore={userData.cpdActivities.length > 3}
                    />
                    <DataSection
                      title="Internships & Training"
                      count={userData.internships.length}
                      items={userData.internships.map((i) => i.institution)}
                    />
                    <DataSection
                      title="Bridging Programs"
                      count={userData.bridgingPrograms.length}
                      items={userData.bridgingPrograms.map(
                        (b) => b.program_name
                      )}
                    />
                    <DataSection
                      title="Practice Gaps"
                      count={userData.practiceGaps.length}
                      items={userData.practiceGaps.map((g) => g.reason)}
                    />
                    <DataSection
                      title="Publications"
                      count={userData.publications.length}
                      items={userData.publications.map((p) => p.title)}
                    />
                    <DataSection
                      title="Referees"
                      count={userData.referees.length}
                      items={userData.referees.map(
                        (r) => `${r.name} - ${r.organization}`
                      )}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      case 2:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Select Referees
              </CardTitle>
              <CardDescription>
                Choose at least 2 referees to include in this CV. AHPRA
                typically requires 2-3 professional referees.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {availableReferees.length === 0 ? (
                <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                  <div>
                    <p className="font-medium text-amber-800">
                      No referees available
                    </p>
                    <p className="text-sm text-amber-700">
                      Please add referees to your profile first.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {availableReferees.map((referee) => (
                    <div
                      key={referee.id}
                      className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedRefereeIds.includes(referee.id)
                          ? "border-primary bg-primary/5"
                          : "hover:bg-muted/50"
                      }`}
                      onClick={() => toggleReferee(referee.id)}
                    >
                      <Checkbox
                        checked={selectedRefereeIds.includes(referee.id)}
                        onCheckedChange={() => toggleReferee(referee.id)}
                      />
                      <div className="flex-1">
                        <p className="font-medium">
                          {referee.title ? `${referee.title} ` : ""}
                          {referee.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {referee.position} at {referee.organization}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {referee.relationship}
                          {referee.years_known
                            ? ` - ${referee.years_known} years`
                            : ""}
                        </p>
                      </div>
                    </div>
                  ))}

                  <p className="text-sm text-muted-foreground pt-2">
                    Selected: {selectedRefereeIds.length} referee
                    {selectedRefereeIds.length !== 1 ? "s" : ""}
                    {selectedRefereeIds.length < 2 && (
                      <span className="text-amber-600">
                        {" "}
                        (minimum 2 required)
                      </span>
                    )}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Confirm & Generate
              </CardTitle>
              <CardDescription>
                Review your selections before generating the CV.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">CV Name</span>
                  <span className="font-medium">{cvName}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Template</span>
                  <span className="font-medium">AHPRA Standard CV</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Referees</span>
                  <span className="font-medium">
                    {selectedRefereeIds.length} selected
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Sections</span>
                  <span className="font-medium">
                    {
                      [
                        userData.qualifications.length > 0,
                        userData.workHistory.length > 0,
                        userData.clinicalSkills.length > 0,
                        userData.cpdActivities.length > 0,
                        userData.internships.length > 0,
                        userData.bridgingPrograms.length > 0,
                        userData.practiceGaps.length > 0,
                        userData.publications.length > 0,
                      ].filter(Boolean).length
                    }{" "}
                    sections with data
                  </span>
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium">What happens next?</p>
                    <p className="text-muted-foreground mt-1">
                      Your CV will be generated with all your current profile
                      data. You can then preview it, add a declaration with
                      signature, and export it as a PDF.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-md bg-destructive/10 p-3">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Progress Steps */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                  index < currentStep
                    ? "bg-primary border-primary text-primary-foreground"
                    : index === currentStep
                    ? "border-primary text-primary"
                    : "border-muted text-muted-foreground"
                }`}
              >
                {index < currentStep ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <span
                className={`text-xs mt-1 ${
                  index <= currentStep
                    ? "text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {step.title}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-16 h-0.5 mx-2 ${
                  index < currentStep ? "bg-primary" : "bg-muted"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      {renderStepContent()}

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button
          variant="outline"
          onClick={() =>
            currentStep === 0
              ? router.push("/dashboard")
              : setCurrentStep(currentStep - 1)
          }
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          {currentStep === 0 ? "Cancel" : "Back"}
        </Button>

        {currentStep < steps.length - 1 ? (
          <Button
            onClick={() => setCurrentStep(currentStep + 1)}
            disabled={!canProceed()}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={handleGenerate} disabled={loading || !canProceed()}>
            {loading ? "Generating..." : "Generate CV"}
          </Button>
        )}
      </div>
    </div>
  );
}

function DataSection({
  title,
  count,
  items,
  showMore,
}: {
  title: string;
  count: number;
  items: string[];
  showMore?: boolean;
}) {
  return (
    <div className="flex items-start justify-between py-2 border-b last:border-0">
      <div>
        <p className="font-medium">{title}</p>
        {items.length > 0 && (
          <p className="text-sm text-muted-foreground">
            {items.join(", ")}
            {showMore && "..."}
          </p>
        )}
      </div>
      <span
        className={`text-sm px-2 py-0.5 rounded ${
          count > 0
            ? "bg-green-100 text-green-800"
            : "bg-muted text-muted-foreground"
        }`}
      >
        {count}
      </span>
    </div>
  );
}
