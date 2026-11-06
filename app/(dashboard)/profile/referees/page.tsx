import { createClient } from "@/lib/supabase/server";
import { RefereesForm } from "./referees-form";

export default async function RefereesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: referees } = await supabase
    .from("referees")
    .select("*")
    .eq("user_id", user?.id)
    .order("sort_order", { ascending: true });

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Referees</h1>
        <p className="text-muted-foreground">
          Your professional referees. You can select which referees to include
          when generating a CV.
        </p>
      </div>

      <RefereesForm initialData={referees || []} />
    </div>
  );
}
