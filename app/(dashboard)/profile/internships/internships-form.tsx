"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { Tables } from "@/lib/supabase/database.types";

type Internship = Tables<"internships">;

interface InternshipsFormProps {
  initialData: Internship[];
}

interface InternshipFormData {
  id?: string;
  institution: string;
  department: string;
  position: string;
  start_date: string;
  end_date: string;
  supervisor_name: string;
  supervisor_contact: string;
  skills_gained: string;
}

const emptyInternship: InternshipFormData = {
  institution: "",
  department: "",
  position: "",
  start_date: "",
  end_date: "",
  supervisor_name: "",
  supervisor_contact: "",
  skills_gained: "",
};

export function InternshipsForm({ initialData }: InternshipsFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [internships, setInternships] = useState<InternshipFormData[]>(
    initialData.length > 0
      ? initialData.map((i) => ({
          id: i.id,
          institution: i.institution,
          department: i.department || "",
          position: i.position || "",
          start_date: i.start_date,
          end_date: i.end_date || "",
          supervisor_name: i.supervisor_name || "",
          supervisor_contact: i.supervisor_contact || "",
          skills_gained: i.skills_gained || "",
        }))
      : [{ ...emptyInternship }]
  );

  const addInternship = () => {
    setInternships([...internships, { ...emptyInternship }]);
  };

  const removeInternship = async (index: number) => {
    const internship = internships[index];

    if (internship.id) {
      const supabase = createClient();
      const { error } = await supabase
        .from("internships")
        .delete()
        .eq("id", internship.id);

      if (error) {
        setError(error.message);
        return;
      }
    }

    setInternships(internships.filter((_, i) => i !== index));
    router.refresh();
  };

  const updateInternship = (
    index: number,
    field: keyof InternshipFormData,
    value: string
  ) => {
    const updated = [...internships];
    updated[index] = { ...updated[index], [field]: value };
    setInternships(updated);
    setError(null);
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    for (const i of internships) {
      if (!i.institution.trim()) {
        setError("Institution is required for all entries");
        return;
      }
      if (!i.start_date) {
        setError("Start date is required for all entries");
        return;
      }
    }

    setLoading(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("You must be logged in");
      setLoading(false);
      return;
    }

    try {
      for (let idx = 0; idx < internships.length; idx++) {
        const i = internships[idx];
        const dataToSave = {
          user_id: user.id,
          institution: i.institution,
          department: i.department || null,
          position: i.position || null,
          start_date: i.start_date,
          end_date: i.end_date || null,
          supervisor_name: i.supervisor_name || null,
          supervisor_contact: i.supervisor_contact || null,
          skills_gained: i.skills_gained || null,
          sort_order: idx,
        };

        if (i.id) {
          const { error } = await supabase
            .from("internships")
            .update(dataToSave)
            .eq("id", i.id);

          if (error) throw error;
        } else {
          const { error } = await supabase
            .from("internships")
            .insert(dataToSave);

          if (error) throw error;
        }
      }

      setSuccess(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-destructive/10 p-3">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {success && (
        <div className="rounded-md bg-green-500/10 p-3">
          <p className="text-sm text-green-600">
            Internships saved successfully!
          </p>
        </div>
      )}

      <div className="space-y-4">
        {internships.map((internship, index) => (
          <Card key={index}>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                  <CardTitle className="text-lg">
                    Internship {index + 1}
                  </CardTitle>
                </div>
                {internships.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeInternship(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={`institution_${index}`}>Institution *</Label>
                <Input
                  id={`institution_${index}`}
                  value={internship.institution}
                  onChange={(e) =>
                    updateInternship(index, "institution", e.target.value)
                  }
                  placeholder="e.g., Royal Melbourne Hospital"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`department_${index}`}>Department</Label>
                  <Input
                    id={`department_${index}`}
                    value={internship.department}
                    onChange={(e) =>
                      updateInternship(index, "department", e.target.value)
                    }
                    placeholder="e.g., General Medicine"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`position_${index}`}>Position</Label>
                  <Input
                    id={`position_${index}`}
                    value={internship.position}
                    onChange={(e) =>
                      updateInternship(index, "position", e.target.value)
                    }
                    placeholder="e.g., Intern, Observer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`start_date_${index}`}>Start Date *</Label>
                  <Input
                    id={`start_date_${index}`}
                    type="date"
                    value={internship.start_date}
                    onChange={(e) =>
                      updateInternship(index, "start_date", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`end_date_${index}`}>End Date</Label>
                  <Input
                    id={`end_date_${index}`}
                    type="date"
                    value={internship.end_date}
                    onChange={(e) =>
                      updateInternship(index, "end_date", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`supervisor_name_${index}`}>
                    Supervisor Name
                  </Label>
                  <Input
                    id={`supervisor_name_${index}`}
                    value={internship.supervisor_name}
                    onChange={(e) =>
                      updateInternship(index, "supervisor_name", e.target.value)
                    }
                    placeholder="e.g., Dr. Sarah Johnson"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`supervisor_contact_${index}`}>
                    Supervisor Contact
                  </Label>
                  <Input
                    id={`supervisor_contact_${index}`}
                    value={internship.supervisor_contact}
                    onChange={(e) =>
                      updateInternship(
                        index,
                        "supervisor_contact",
                        e.target.value
                      )
                    }
                    placeholder="Email or phone"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`skills_gained_${index}`}>Skills Gained</Label>
                <Textarea
                  id={`skills_gained_${index}`}
                  value={internship.skills_gained}
                  onChange={(e) =>
                    updateInternship(index, "skills_gained", e.target.value)
                  }
                  placeholder="Describe the skills and experience gained during this internship..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button type="button" variant="outline" onClick={addInternship}>
        <Plus className="h-4 w-4 mr-2" />
        Add Another Internship
      </Button>

      <div className="flex gap-4 pt-4">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save Internships"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
