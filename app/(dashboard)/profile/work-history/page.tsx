import { createClient } from "@/lib/supabase/server";
import { WorkHistoryForm } from "./work-history-form";

export default async function WorkHistoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: workHistory } = await supabase
    .from("work_history")
    .select("*")
    .eq("user_id", user?.id)
    .order("sort_order", { ascending: true });

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Work History</h1>
        <p className="text-muted-foreground">
          Your employment history and clinical experience. List positions in
          reverse chronological order (most recent first).
        </p>
      </div>

      <WorkHistoryForm initialData={workHistory || []} />
    </div>
  );
}
