"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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

type WorkHistory = Tables<"work_history">;

interface WorkHistoryFormProps {
  initialData: WorkHistory[];
}

interface WorkHistoryFormData {
  id?: string;
  position_title: string;
  employer_name: string;
  department: string;
  address: string;
  city: string;
  state: string;
  country: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  employment_type: string;
  weekly_hours: string;
  supervisor_name: string;
  supervisor_contact: string;
  responsibilities: string;
}

const emptyWorkHistory: WorkHistoryFormData = {
  position_title: "",
  employer_name: "",
  department: "",
  address: "",
  city: "",
  state: "",
  country: "Australia",
  start_date: "",
  end_date: "",
  is_current: false,
  employment_type: "",
  weekly_hours: "",
  supervisor_name: "",
  supervisor_contact: "",
  responsibilities: "",
};

const employmentTypes = [
  { value: "full-time", label: "Full-time" },
  { value: "part-time", label: "Part-time" },
  { value: "locum", label: "Locum" },
  { value: "casual", label: "Casual" },
  { value: "volunteer", label: "Volunteer" },
];

export function WorkHistoryForm({ initialData }: WorkHistoryFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [workHistory, setWorkHistory] = useState<WorkHistoryFormData[]>(
    initialData.length > 0
      ? initialData.map((w) => ({
          id: w.id,
          position_title: w.position_title,
          employer_name: w.employer_name,
          department: w.department || "",
          address: w.address || "",
          city: w.city || "",
          state: w.state || "",
          country: w.country,
          start_date: w.start_date,
          end_date: w.end_date || "",
          is_current: w.is_current,
          employment_type: w.employment_type || "",
          weekly_hours: w.weekly_hours?.toString() || "",
          supervisor_name: w.supervisor_name || "",
          supervisor_contact: w.supervisor_contact || "",
          responsibilities: w.responsibilities || "",
        }))
      : [{ ...emptyWorkHistory }]
  );

  const addWorkHistory = () => {
    setWorkHistory([...workHistory, { ...emptyWorkHistory }]);
  };

  const removeWorkHistory = async (index: number) => {
    const work = workHistory[index];

    if (work.id) {
      const supabase = createClient();
      const { error } = await supabase
        .from("work_history")
        .delete()
        .eq("id", work.id);

      if (error) {
        setError(error.message);
        return;
      }
    }

    setWorkHistory(workHistory.filter((_, i) => i !== index));
    router.refresh();
  };

  const updateWorkHistory = (
    index: number,
    field: keyof WorkHistoryFormData,
    value: string | boolean
  ) => {
    const updated = [...workHistory];
    updated[index] = { ...updated[index], [field]: value };

    // If marking as current, clear end date
    if (field === "is_current" && value === true) {
      updated[index].end_date = "";
    }

    setWorkHistory(updated);
    setError(null);
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validate
    for (const w of workHistory) {
      if (!w.position_title.trim()) {
        setError("Position title is required for all entries");
        return;
      }
      if (!w.employer_name.trim()) {
        setError("Employer name is required for all entries");
        return;
      }
      if (!w.start_date) {
        setError("Start date is required for all entries");
        return;
      }
      if (!w.is_current && !w.end_date) {
        setError(
          "End date is required for all entries unless marked as current"
        );
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
      for (let i = 0; i < workHistory.length; i++) {
        const w = workHistory[i];
        const dataToSave = {
          user_id: user.id,
          position_title: w.position_title,
          employer_name: w.employer_name,
          department: w.department || null,
          address: w.address || null,
          city: w.city || null,
          state: w.state || null,
          country: w.country,
          start_date: w.start_date,
          end_date: w.is_current ? null : w.end_date || null,
          is_current: w.is_current,
          employment_type: w.employment_type || null,
          weekly_hours: w.weekly_hours ? parseInt(w.weekly_hours) : null,
          supervisor_name: w.supervisor_name || null,
          supervisor_contact: w.supervisor_contact || null,
          responsibilities: w.responsibilities || null,
          sort_order: i,
        };

        if (w.id) {
          const { error } = await supabase
            .from("work_history")
            .update(dataToSave)
            .eq("id", w.id);

          if (error) throw error;
        } else {
          const { error } = await supabase
            .from("work_history")
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
            Work history saved successfully!
          </p>
        </div>
      )}

      <div className="space-y-4">
        {workHistory.map((work, index) => (
          <Card key={index}>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                  <CardTitle className="text-lg">Position {index + 1}</CardTitle>
                </div>
                {workHistory.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeWorkHistory(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`position_title_${index}`}>
                    Position Title *
                  </Label>
                  <Input
                    id={`position_title_${index}`}
                    value={work.position_title}
                    onChange={(e) =>
                      updateWorkHistory(index, "position_title", e.target.value)
                    }
                    placeholder="e.g., Resident Medical Officer"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`employer_name_${index}`}>
                    Employer Name *
                  </Label>
                  <Input
                    id={`employer_name_${index}`}
                    value={work.employer_name}
                    onChange={(e) =>
                      updateWorkHistory(index, "employer_name", e.target.value)
                    }
                    placeholder="e.g., Royal Prince Alfred Hospital"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`department_${index}`}>Department</Label>
                <Input
                  id={`department_${index}`}
                  value={work.department}
                  onChange={(e) =>
                    updateWorkHistory(index, "department", e.target.value)
                  }
                  placeholder="e.g., Emergency Department"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`address_${index}`}>Address</Label>
                <Input
                  id={`address_${index}`}
                  value={work.address}
                  onChange={(e) =>
                    updateWorkHistory(index, "address", e.target.value)
                  }
                  placeholder="e.g., 50 Missenden Road"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`city_${index}`}>City</Label>
                  <Input
                    id={`city_${index}`}
                    value={work.city}
                    onChange={(e) =>
                      updateWorkHistory(index, "city", e.target.value)
                    }
                    placeholder="e.g., Sydney"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`state_${index}`}>State</Label>
                  <Input
                    id={`state_${index}`}
                    value={work.state}
                    onChange={(e) =>
                      updateWorkHistory(index, "state", e.target.value)
                    }
                    placeholder="e.g., NSW"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`country_${index}`}>Country</Label>
                  <Input
                    id={`country_${index}`}
                    value={work.country}
                    onChange={(e) =>
                      updateWorkHistory(index, "country", e.target.value)
                    }
                    placeholder="e.g., Australia"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`start_date_${index}`}>Start Date *</Label>
                  <Input
                    id={`start_date_${index}`}
                    type="date"
                    value={work.start_date}
                    onChange={(e) =>
                      updateWorkHistory(index, "start_date", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`end_date_${index}`}>End Date</Label>
                  <Input
                    id={`end_date_${index}`}
                    type="date"
                    value={work.end_date}
                    onChange={(e) =>
                      updateWorkHistory(index, "end_date", e.target.value)
                    }
                    disabled={work.is_current}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`is_current_${index}`}
                  checked={work.is_current}
                  onCheckedChange={(checked) =>
                    updateWorkHistory(index, "is_current", checked === true)
                  }
                />
                <Label htmlFor={`is_current_${index}`}>
                  I currently work here
                </Label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`employment_type_${index}`}>
                    Employment Type
                  </Label>
                  <Select
                    value={work.employment_type}
                    onValueChange={(value) =>
                      updateWorkHistory(index, "employment_type", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {employmentTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`weekly_hours_${index}`}>
                    Weekly Hours
                  </Label>
                  <Input
                    id={`weekly_hours_${index}`}
                    type="number"
                    min="0"
                    max="80"
                    value={work.weekly_hours}
                    onChange={(e) =>
                      updateWorkHistory(index, "weekly_hours", e.target.value)
                    }
                    placeholder="e.g., 40"
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
                    value={work.supervisor_name}
                    onChange={(e) =>
                      updateWorkHistory(index, "supervisor_name", e.target.value)
                    }
                    placeholder="e.g., Dr. Jane Doe"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`supervisor_contact_${index}`}>
                    Supervisor Contact
                  </Label>
                  <Input
                    id={`supervisor_contact_${index}`}
                    value={work.supervisor_contact}
                    onChange={(e) =>
                      updateWorkHistory(
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
                <Label htmlFor={`responsibilities_${index}`}>
                  Key Responsibilities
                </Label>
                <Textarea
                  id={`responsibilities_${index}`}
                  value={work.responsibilities}
                  onChange={(e) =>
                    updateWorkHistory(index, "responsibilities", e.target.value)
                  }
                  placeholder="Describe your key responsibilities and duties..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button type="button" variant="outline" onClick={addWorkHistory}>
        <Plus className="h-4 w-4 mr-2" />
        Add Another Position
      </Button>

      <div className="flex gap-4 pt-4">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save Work History"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
