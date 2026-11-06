import { createClient } from "@/lib/supabase/server";
import { BridgingProgramsForm } from "./bridging-programs-form";

export default async function BridgingProgramsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: bridgingPrograms } = await supabase
    .from("bridging_programs")
    .select("*")
    .eq("user_id", user?.id)
    .order("sort_order", { ascending: true });

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Bridging Programs</h1>
        <p className="text-muted-foreground">
          Your qualifying exams, bridging programs, and assessment outcomes.
        </p>
      </div>

      <BridgingProgramsForm initialData={bridgingPrograms || []} />
    </div>
  );
}
