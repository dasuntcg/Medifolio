"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { Tables } from "@/lib/supabase/database.types";

type Qualification = Tables<"qualifications">;

interface QualificationsFormProps {
  initialData: Qualification[];
}

interface QualificationFormData {
  id?: string;
  degree_title: string;
  institution: string;
  country: string;
  start_date: string;
  end_date: string;
  year_completed: string;
  certificate_number: string;
}

const emptyQualification: QualificationFormData = {
  degree_title: "",
  institution: "",
  country: "",
  start_date: "",
  end_date: "",
  year_completed: "",
  certificate_number: "",
};

export function QualificationsForm({ initialData }: QualificationsFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [qualifications, setQualifications] = useState<QualificationFormData[]>(
    initialData.length > 0
      ? initialData.map((q) => ({
          id: q.id,
          degree_title: q.degree_title,
          institution: q.institution,
          country: q.country,
          start_date: q.start_date || "",
          end_date: q.end_date || "",
          year_completed: q.year_completed?.toString() || "",
          certificate_number: q.certificate_number || "",
        }))
      : [{ ...emptyQualification }]
  );

  const addQualification = () => {
    setQualifications([...qualifications, { ...emptyQualification }]);
  };

  const removeQualification = async (index: number) => {
    const qualification = qualifications[index];

    if (qualification.id) {
      const supabase = createClient();
      const { error } = await supabase
        .from("qualifications")
        .delete()
        .eq("id", qualification.id);

      if (error) {
        setError(error.message);
        return;
      }
    }

    setQualifications(qualifications.filter((_, i) => i !== index));
    router.refresh();
  };

  const updateQualification = (
    index: number,
    field: keyof QualificationFormData,
    value: string
  ) => {
    const updated = [...qualifications];
    updated[index] = { ...updated[index], [field]: value };
    setQualifications(updated);
    setError(null);
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validate
    for (const q of qualifications) {
      if (!q.degree_title.trim()) {
        setError("Degree title is required for all qualifications");
        return;
      }
      if (!q.institution.trim()) {
        setError("Institution is required for all qualifications");
        return;
      }
      if (!q.country.trim()) {
        setError("Country is required for all qualifications");
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
      for (let i = 0; i < qualifications.length; i++) {
        const q = qualifications[i];
        const dataToSave = {
          user_id: user.id,
          degree_title: q.degree_title,
          institution: q.institution,
          country: q.country,
          start_date: q.start_date || null,
          end_date: q.end_date || null,
          year_completed: q.year_completed ? parseInt(q.year_completed) : null,
          certificate_number: q.certificate_number || null,
          sort_order: i,
        };

        if (q.id) {
          const { error } = await supabase
            .from("qualifications")
            .update(dataToSave)
            .eq("id", q.id);

          if (error) throw error;
        } else {
          const { error } = await supabase
            .from("qualifications")
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
            Qualifications saved successfully!
          </p>
        </div>
      )}

      <div className="space-y-4">
        {qualifications.map((qualification, index) => (
          <Card key={index}>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                  <CardTitle className="text-lg">
                    Qualification {index + 1}
                  </CardTitle>
                </div>
                {qualifications.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeQualification(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={`degree_title_${index}`}>Degree Title *</Label>
                <Input
                  id={`degree_title_${index}`}
                  value={qualification.degree_title}
                  onChange={(e) =>
                    updateQualification(index, "degree_title", e.target.value)
                  }
                  placeholder="e.g., Bachelor of Medicine, Bachelor of Surgery (MBBS)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`institution_${index}`}>Institution *</Label>
                <Input
                  id={`institution_${index}`}
                  value={qualification.institution}
                  onChange={(e) =>
                    updateQualification(index, "institution", e.target.value)
                  }
                  placeholder="e.g., University of Sydney"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`country_${index}`}>Country *</Label>
                <Input
                  id={`country_${index}`}
                  value={qualification.country}
                  onChange={(e) =>
                    updateQualification(index, "country", e.target.value)
                  }
                  placeholder="e.g., Australia, India, United Kingdom"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`start_date_${index}`}>Start Date</Label>
                  <Input
                    id={`start_date_${index}`}
                    type="date"
                    value={qualification.start_date}
                    onChange={(e) =>
                      updateQualification(index, "start_date", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`end_date_${index}`}>End Date</Label>
                  <Input
                    id={`end_date_${index}`}
                    type="date"
                    value={qualification.end_date}
                    onChange={(e) =>
                      updateQualification(index, "end_date", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`year_completed_${index}`}>
                    Year Completed
                  </Label>
                  <Input
                    id={`year_completed_${index}`}
                    type="number"
                    min="1950"
                    max="2030"
                    value={qualification.year_completed}
                    onChange={(e) =>
                      updateQualification(
                        index,
                        "year_completed",
                        e.target.value
                      )
                    }
                    placeholder="e.g., 2020"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`certificate_number_${index}`}>
                    Certificate Number
                  </Label>
                  <Input
                    id={`certificate_number_${index}`}
                    value={qualification.certificate_number}
                    onChange={(e) =>
                      updateQualification(
                        index,
                        "certificate_number",
                        e.target.value
                      )
                    }
                    placeholder="Optional"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button type="button" variant="outline" onClick={addQualification}>
        <Plus className="h-4 w-4 mr-2" />
        Add Another Qualification
      </Button>

      <div className="flex gap-4 pt-4">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save Qualifications"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
