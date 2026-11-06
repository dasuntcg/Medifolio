import { createClient } from "@/lib/supabase/server";
import { PublicationsForm } from "./publications-form";

export default async function PublicationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: publications } = await supabase
    .from("publications")
    .select("*")
    .eq("user_id", user?.id)
    .order("sort_order", { ascending: true });

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Publications</h1>
        <p className="text-muted-foreground">
          Your research publications, journal articles, and conference presentations.
          This section is optional.
        </p>
      </div>

      <PublicationsForm initialData={publications || []} />
    </div>
  );
}
