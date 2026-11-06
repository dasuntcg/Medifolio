import { createClient } from "@/lib/supabase/server";
import { QualificationsForm } from "./qualifications-form";

export default async function QualificationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: qualifications } = await supabase
    .from("qualifications")
    .select("*")
    .eq("user_id", user?.id)
    .order("sort_order", { ascending: true });

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Qualifications</h1>
        <p className="text-muted-foreground">
          Your medical degrees, certifications, and educational qualifications.
        </p>
      </div>

      <QualificationsForm initialData={qualifications || []} />
    </div>
  );
}
