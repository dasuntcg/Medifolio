import { createClient } from "@/lib/supabase/server";
import { PracticeGapsForm } from "./practice-gaps-form";

export default async function PracticeGapsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: practiceGaps } = await supabase
    .from("practice_gaps")
    .select("*")
    .eq("user_id", user?.id)
    .order("sort_order", { ascending: true });

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Practice Gaps</h1>
        <p className="text-muted-foreground">
          Explain any gaps in practice over 3 months. AHPRA requires explanations
          for all gaps in clinical practice.
        </p>
      </div>

      <PracticeGapsForm initialData={practiceGaps || []} />
    </div>
  );
}
