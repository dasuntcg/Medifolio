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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { Tables } from "@/lib/supabase/database.types";

type BridgingProgram = Tables<"bridging_programs">;

interface BridgingProgramsFormProps {
  initialData: BridgingProgram[];
}

interface BridgingProgramFormData {
  id?: string;
  program_name: string;
  facility: string;
  city: string;
  state: string;
  country: string;
  start_date: string;
  date_completed: string;
  result: string;
  status: string;
}

const emptyProgram: BridgingProgramFormData = {
  program_name: "",
  facility: "",
  city: "",
  state: "",
  country: "Australia",
  start_date: "",
  date_completed: "",
  result: "",
  status: "",
};

const statusOptions = [
  { value: "completed", label: "Completed" },
  { value: "in_progress", label: "In Progress" },
  { value: "planned", label: "Planned" },
];

export function BridgingProgramsForm({
  initialData,
}: BridgingProgramsFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [programs, setPrograms] = useState<BridgingProgramFormData[]>(
    initialData.length > 0
      ? initialData.map((p) => ({
          id: p.id,
          program_name: p.program_name,
          facility: p.facility || "",
          city: p.city || "",
          state: p.state || "",
          country: p.country,
          start_date: p.start_date || "",
          date_completed: p.date_completed || "",
          result: p.result || "",
          status: p.status || "",
        }))
      : [{ ...emptyProgram }]
  );

  const addProgram = () => {
    setPrograms([...programs, { ...emptyProgram }]);
  };

  const removeProgram = async (index: number) => {
    const program = programs[index];

    if (program.id) {
      const supabase = createClient();
      const { error } = await supabase
        .from("bridging_programs")
        .delete()
        .eq("id", program.id);

      if (error) {
        setError(error.message);
        return;
      }
    }

    setPrograms(programs.filter((_, i) => i !== index));
    router.refresh();
  };

  const updateProgram = (
    index: number,
    field: keyof BridgingProgramFormData,
    value: string
  ) => {
    const updated = [...programs];
    updated[index] = { ...updated[index], [field]: value };
    setPrograms(updated);
    setError(null);
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    for (const p of programs) {
      if (!p.program_name.trim()) {
        setError("Program name is required for all entries");
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
      for (let i = 0; i < programs.length; i++) {
        const p = programs[i];
        const dataToSave = {
          user_id: user.id,
          program_name: p.program_name,
          facility: p.facility || null,
          city: p.city || null,
          state: p.state || null,
          country: p.country,
          start_date: p.start_date || null,
          date_completed: p.date_completed || null,
          result: p.result || null,
          status: p.status || null,
          sort_order: i,
        };

        if (p.id) {
          const { error } = await supabase
            .from("bridging_programs")
            .update(dataToSave)
            .eq("id", p.id);

          if (error) throw error;
        } else {
          const { error } = await supabase
            .from("bridging_programs")
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
            Bridging programs saved successfully!
          </p>
        </div>
      )}

      <div className="space-y-4">
        {programs.map((program, index) => (
          <Card key={index}>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                  <CardTitle className="text-lg">
                    Program {index + 1}
                  </CardTitle>
                </div>
                {programs.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeProgram(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={`program_name_${index}`}>Program Name *</Label>
                <Input
                  id={`program_name_${index}`}
                  value={program.program_name}
                  onChange={(e) =>
                    updateProgram(index, "program_name", e.target.value)
                  }
                  placeholder="e.g., AMC Clinical Examination, PLAB Test"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`facility_${index}`}>Facility / Provider</Label>
                <Input
                  id={`facility_${index}`}
                  value={program.facility}
                  onChange={(e) =>
                    updateProgram(index, "facility", e.target.value)
                  }
                  placeholder="e.g., Australian Medical Council"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`city_${index}`}>City</Label>
                  <Input
                    id={`city_${index}`}
                    value={program.city}
                    onChange={(e) =>
                      updateProgram(index, "city", e.target.value)
                    }
                    placeholder="e.g., Melbourne"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`state_${index}`}>State</Label>
                  <Input
                    id={`state_${index}`}
                    value={program.state}
                    onChange={(e) =>
                      updateProgram(index, "state", e.target.value)
                    }
                    placeholder="e.g., VIC"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`country_${index}`}>Country</Label>
                  <Input
                    id={`country_${index}`}
                    value={program.country}
                    onChange={(e) =>
                      updateProgram(index, "country", e.target.value)
                    }
                    placeholder="e.g., Australia"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`start_date_${index}`}>Start Date</Label>
                  <Input
                    id={`start_date_${index}`}
                    type="date"
                    value={program.start_date}
                    onChange={(e) =>
                      updateProgram(index, "start_date", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`date_completed_${index}`}>
                    Date Completed
                  </Label>
                  <Input
                    id={`date_completed_${index}`}
                    type="date"
                    value={program.date_completed}
                    onChange={(e) =>
                      updateProgram(index, "date_completed", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`status_${index}`}>Status</Label>
                  <Select
                    value={program.status}
                    onValueChange={(value) =>
                      updateProgram(index, "status", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`result_${index}`}>Result</Label>
                  <Input
                    id={`result_${index}`}
                    value={program.result}
                    onChange={(e) =>
                      updateProgram(index, "result", e.target.value)
                    }
                    placeholder="e.g., Pass, 85%"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button type="button" variant="outline" onClick={addProgram}>
        <Plus className="h-4 w-4 mr-2" />
        Add Another Program
      </Button>

      <div className="flex gap-4 pt-4">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save Bridging Programs"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
