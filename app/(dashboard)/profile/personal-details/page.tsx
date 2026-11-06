import { createClient } from "@/lib/supabase/server";
import { PersonalDetailsForm } from "./personal-details-form";

export default async function PersonalDetailsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: personalDetails } = await supabase
    .from("personal_details")
    .select("*")
    .eq("user_id", user?.id)
    .single();

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Personal Details</h1>
        <p className="text-muted-foreground">
          Your personal and contact information for AHPRA registration.
        </p>
      </div>

      <PersonalDetailsForm initialData={personalDetails} />
    </div>
  );
}
