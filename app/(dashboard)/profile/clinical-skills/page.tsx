import { createClient } from "@/lib/supabase/server";
import { ClinicalSkillsForm } from "./clinical-skills-form";

export default async function ClinicalSkillsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: clinicalSkills } = await supabase
    .from("clinical_skills")
    .select("*")
    .eq("user_id", user?.id)
    .order("sort_order", { ascending: true });

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Clinical Skills</h1>
        <p className="text-muted-foreground">
          Your clinical skills and procedural competencies with proficiency levels.
        </p>
      </div>

      <ClinicalSkillsForm initialData={clinicalSkills || []} />
    </div>
  );
}
