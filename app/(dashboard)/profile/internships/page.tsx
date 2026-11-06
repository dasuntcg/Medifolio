import { createClient } from "@/lib/supabase/server";
import { InternshipsForm } from "./internships-form";

export default async function InternshipsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: internships } = await supabase
    .from("internships")
    .select("*")
    .eq("user_id", user?.id)
    .order("sort_order", { ascending: true });

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Internships & Training</h1>
        <p className="text-muted-foreground">
          Your internships, training positions, and observerships.
        </p>
      </div>

      <InternshipsForm initialData={internships || []} />
    </div>
  );
}
