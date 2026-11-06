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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { Tables } from "@/lib/supabase/database.types";

type CPDActivity = Tables<"cpd_activities">;

interface CPDActivitiesFormProps {
  initialData: CPDActivity[];
}

interface CPDActivityFormData {
  id?: string;
  activity_name: string;
  activity_type: string;
  provider: string;
  date_completed: string;
  hours_credits: string;
  certificate_number: string;
  description: string;
}

const emptyActivity: CPDActivityFormData = {
  activity_name: "",
  activity_type: "",
  provider: "",
  date_completed: "",
  hours_credits: "",
  certificate_number: "",
  description: "",
};

const activityTypes = [
  { value: "conference", label: "Conference" },
  { value: "workshop", label: "Workshop" },
  { value: "online_course", label: "Online Course" },
  { value: "seminar", label: "Seminar" },
  { value: "grand_rounds", label: "Grand Rounds" },
  { value: "journal_club", label: "Journal Club" },
  { value: "self_study", label: "Self Study" },
  { value: "teaching", label: "Teaching" },
  { value: "research", label: "Research" },
  { value: "other", label: "Other" },
];

export function CPDActivitiesForm({ initialData }: CPDActivitiesFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [activities, setActivities] = useState<CPDActivityFormData[]>(
    initialData.length > 0
      ? initialData.map((a) => ({
          id: a.id,
          activity_name: a.activity_name,
          activity_type: a.activity_type || "",
          provider: a.provider || "",
          date_completed: a.date_completed,
          hours_credits: a.hours_credits?.toString() || "",
          certificate_number: a.certificate_number || "",
          description: a.description || "",
        }))
      : [{ ...emptyActivity }]
  );

  const addActivity = () => {
    setActivities([...activities, { ...emptyActivity }]);
  };

  const removeActivity = async (index: number) => {
    const activity = activities[index];

    if (activity.id) {
      const supabase = createClient();
      const { error } = await supabase
        .from("cpd_activities")
        .delete()
        .eq("id", activity.id);

      if (error) {
        setError(error.message);
        return;
      }
    }

    setActivities(activities.filter((_, i) => i !== index));
    router.refresh();
  };

  const updateActivity = (
    index: number,
    field: keyof CPDActivityFormData,
    value: string
  ) => {
    const updated = [...activities];
    updated[index] = { ...updated[index], [field]: value };
    setActivities(updated);
    setError(null);
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    for (const a of activities) {
      if (!a.activity_name.trim()) {
        setError("Activity name is required for all entries");
        return;
      }
      if (!a.date_completed) {
        setError("Date completed is required for all entries");
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
      for (let i = 0; i < activities.length; i++) {
        const a = activities[i];
        const dataToSave = {
          user_id: user.id,
          activity_name: a.activity_name,
          activity_type: a.activity_type || null,
          provider: a.provider || null,
          date_completed: a.date_completed,
          hours_credits: a.hours_credits ? parseFloat(a.hours_credits) : null,
          certificate_number: a.certificate_number || null,
          description: a.description || null,
          sort_order: i,
        };

        if (a.id) {
          const { error } = await supabase
            .from("cpd_activities")
            .update(dataToSave)
            .eq("id", a.id);

          if (error) throw error;
        } else {
          const { error } = await supabase
            .from("cpd_activities")
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
            CPD activities saved successfully!
          </p>
        </div>
      )}

      <div className="space-y-4">
        {activities.map((activity, index) => (
          <Card key={index}>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                  <CardTitle className="text-lg">
                    Activity {index + 1}
                  </CardTitle>
                </div>
                {activities.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeActivity(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={`activity_name_${index}`}>
                  Activity Name *
                </Label>
                <Input
                  id={`activity_name_${index}`}
                  value={activity.activity_name}
                  onChange={(e) =>
                    updateActivity(index, "activity_name", e.target.value)
                  }
                  placeholder="e.g., Advanced Life Support Course"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`activity_type_${index}`}>
                    Activity Type
                  </Label>
                  <Select
                    value={activity.activity_type}
                    onValueChange={(value) =>
                      updateActivity(index, "activity_type", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {activityTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`provider_${index}`}>Provider</Label>
                  <Input
                    id={`provider_${index}`}
                    value={activity.provider}
                    onChange={(e) =>
                      updateActivity(index, "provider", e.target.value)
                    }
                    placeholder="e.g., Australian Resuscitation Council"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`date_completed_${index}`}>
                    Date Completed *
                  </Label>
                  <Input
                    id={`date_completed_${index}`}
                    type="date"
                    value={activity.date_completed}
                    onChange={(e) =>
                      updateActivity(index, "date_completed", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`hours_credits_${index}`}>
                    Hours / Credits
                  </Label>
                  <Input
                    id={`hours_credits_${index}`}
                    type="number"
                    step="0.5"
                    min="0"
                    value={activity.hours_credits}
                    onChange={(e) =>
                      updateActivity(index, "hours_credits", e.target.value)
                    }
                    placeholder="e.g., 8"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`certificate_number_${index}`}>
                    Certificate No.
                  </Label>
                  <Input
                    id={`certificate_number_${index}`}
                    value={activity.certificate_number}
                    onChange={(e) =>
                      updateActivity(
                        index,
                        "certificate_number",
                        e.target.value
                      )
                    }
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`description_${index}`}>Description</Label>
                <Textarea
                  id={`description_${index}`}
                  value={activity.description}
                  onChange={(e) =>
                    updateActivity(index, "description", e.target.value)
                  }
                  placeholder="Brief description of the activity and learnings..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button type="button" variant="outline" onClick={addActivity}>
        <Plus className="h-4 w-4 mr-2" />
        Add Another Activity
      </Button>

      <div className="flex gap-4 pt-4">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save CPD Activities"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
