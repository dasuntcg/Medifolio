import { createClient } from "@/lib/supabase/server";
import { CPDActivitiesForm } from "./cpd-activities-form";

export default async function CPDActivitiesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: cpdActivities } = await supabase
    .from("cpd_activities")
    .select("*")
    .eq("user_id", user?.id)
    .order("sort_order", { ascending: true });

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">CPD Activities</h1>
        <p className="text-muted-foreground">
          Your continuing professional development activities and certifications.
        </p>
      </div>

      <CPDActivitiesForm initialData={cpdActivities || []} />
    </div>
  );
}
