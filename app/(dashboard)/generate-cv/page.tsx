import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CVWizard } from "./cv-wizard";

export default async function GenerateCVPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch all user data for the wizard
  const [
    { data: personalDetails },
    { data: qualifications },
    { data: workHistory },
    { data: clinicalSkills },
    { data: cpdActivities },
    { data: internships },
    { data: bridgingPrograms },
    { data: practiceGaps },
    { data: publications },
    { data: referees },
    { data: templates },
  ] = await Promise.all([
    supabase
      .from("personal_details")
      .select("*")
      .eq("user_id", user.id)
      .single(),
    supabase
      .from("qualifications")
      .select("*")
      .eq("user_id", user.id)
      .order("sort_order"),
    supabase
      .from("work_history")
      .select("*")
      .eq("user_id", user.id)
      .order("sort_order"),
    supabase
      .from("clinical_skills")
      .select("*")
      .eq("user_id", user.id)
      .order("sort_order"),
    supabase
      .from("cpd_activities")
      .select("*")
      .eq("user_id", user.id)
      .order("sort_order"),
    supabase
      .from("internships")
      .select("*")
      .eq("user_id", user.id)
      .order("sort_order"),
    supabase
      .from("bridging_programs")
      .select("*")
      .eq("user_id", user.id)
      .order("sort_order"),
    supabase
      .from("practice_gaps")
      .select("*")
      .eq("user_id", user.id)
      .order("sort_order"),
    supabase
      .from("publications")
      .select("*")
      .eq("user_id", user.id)
      .order("sort_order"),
    supabase
      .from("referees")
      .select("*")
      .eq("user_id", user.id)
      .order("sort_order"),
    supabase.from("cv_templates").select("*").eq("is_active", true),
  ]);

  const userData = {
    personalDetails,
    qualifications: qualifications || [],
    workHistory: workHistory || [],
    clinicalSkills: clinicalSkills || [],
    cpdActivities: cpdActivities || [],
    internships: internships || [],
    bridgingPrograms: bridgingPrograms || [],
    practiceGaps: practiceGaps || [],
    publications: publications || [],
    referees: referees || [],
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Generate CV</h1>
        <p className="text-muted-foreground">
          Create an AHPRA-compliant CV from your profile data.
        </p>
      </div>

      <CVWizard userData={userData} templates={templates || []} />
    </div>
  );
}
