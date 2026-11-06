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
import { Plus, Trash2, GripVertical, AlertCircle } from "lucide-react";
import { Tables } from "@/lib/supabase/database.types";

type PracticeGap = Tables<"practice_gaps">;

interface PracticeGapsFormProps {
  initialData: PracticeGap[];
}

interface PracticeGapFormData {
  id?: string;
  start_date: string;
  end_date: string;
  reason: string;
  activities: string;
}

const emptyGap: PracticeGapFormData = {
  start_date: "",
  end_date: "",
  reason: "",
  activities: "",
};

export function PracticeGapsForm({ initialData }: PracticeGapsFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [gaps, setGaps] = useState<PracticeGapFormData[]>(
    initialData.length > 0
      ? initialData.map((g) => ({
          id: g.id,
          start_date: g.start_date,
          end_date: g.end_date,
          reason: g.reason,
          activities: g.activities || "",
        }))
      : []
  );

  const addGap = () => {
    setGaps([...gaps, { ...emptyGap }]);
  };

  const removeGap = async (index: number) => {
    const gap = gaps[index];

    if (gap.id) {
      const supabase = createClient();
      const { error } = await supabase
        .from("practice_gaps")
        .delete()
        .eq("id", gap.id);

      if (error) {
        setError(error.message);
        return;
      }
    }

    setGaps(gaps.filter((_, i) => i !== index));
    router.refresh();
  };

  const updateGap = (
    index: number,
    field: keyof PracticeGapFormData,
    value: string
  ) => {
    const updated = [...gaps];
    updated[index] = { ...updated[index], [field]: value };
    setGaps(updated);
    setError(null);
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    for (const g of gaps) {
      if (!g.start_date) {
        setError("Start date is required for all entries");
        return;
      }
      if (!g.end_date) {
        setError("End date is required for all entries");
        return;
      }
      if (!g.reason.trim()) {
        setError("Reason is required for all entries");
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
      for (let i = 0; i < gaps.length; i++) {
        const g = gaps[i];
        const dataToSave = {
          user_id: user.id,
          start_date: g.start_date,
          end_date: g.end_date,
          reason: g.reason,
          activities: g.activities || null,
          sort_order: i,
        };

        if (g.id) {
          const { error } = await supabase
            .from("practice_gaps")
            .update(dataToSave)
            .eq("id", g.id);

          if (error) throw error;
        } else {
          const { error } = await supabase
            .from("practice_gaps")
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
            Practice gaps saved successfully!
          </p>
        </div>
      )}

      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="py-4">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-medium">Important AHPRA Requirement</p>
              <p className="mt-1">
                AHPRA requires explanations for all gaps in clinical practice
                exceeding 3 months. Include any career breaks, parental leave,
                study periods, or other time away from clinical work.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {gaps.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <p className="text-muted-foreground text-center mb-4">
              No practice gaps recorded. If you have any gaps in your clinical
              practice over 3 months, add them here.
            </p>
            <Button type="button" variant="outline" onClick={addGap}>
              <Plus className="h-4 w-4 mr-2" />
              Add Practice Gap
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {gaps.map((gap, index) => (
            <Card key={index}>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                    <CardTitle className="text-lg">Gap {index + 1}</CardTitle>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeGap(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`start_date_${index}`}>Start Date *</Label>
                    <Input
                      id={`start_date_${index}`}
                      type="date"
                      value={gap.start_date}
                      onChange={(e) =>
                        updateGap(index, "start_date", e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`end_date_${index}`}>End Date *</Label>
                    <Input
                      id={`end_date_${index}`}
                      type="date"
                      value={gap.end_date}
                      onChange={(e) =>
                        updateGap(index, "end_date", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`reason_${index}`}>Reason *</Label>
                  <Textarea
                    id={`reason_${index}`}
                    value={gap.reason}
                    onChange={(e) => updateGap(index, "reason", e.target.value)}
                    placeholder="e.g., Parental leave, Career break, Full-time study"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`activities_${index}`}>
                    Activities During Gap
                  </Label>
                  <Textarea
                    id={`activities_${index}`}
                    value={gap.activities}
                    onChange={(e) =>
                      updateGap(index, "activities", e.target.value)
                    }
                    placeholder="Describe any relevant activities during this period (e.g., study, volunteer work, CPD activities)"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          ))}

          <Button type="button" variant="outline" onClick={addGap}>
            <Plus className="h-4 w-4 mr-2" />
            Add Another Gap
          </Button>
        </div>
      )}

      <div className="flex gap-4 pt-4">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save Practice Gaps"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
