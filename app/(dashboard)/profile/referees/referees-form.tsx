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
import { Plus, Trash2, GripVertical, Info } from "lucide-react";
import { Tables } from "@/lib/supabase/database.types";

type Referee = Tables<"referees">;

interface RefereesFormProps {
  initialData: Referee[];
}

interface RefereeFormData {
  id?: string;
  name: string;
  title: string;
  position: string;
  organization: string;
  email: string;
  phone: string;
  relationship: string;
  years_known: string;
  is_available: boolean;
  notes: string;
}

const emptyReferee: RefereeFormData = {
  name: "",
  title: "",
  position: "",
  organization: "",
  email: "",
  phone: "",
  relationship: "",
  years_known: "",
  is_available: true,
  notes: "",
};

export function RefereesForm({ initialData }: RefereesFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [referees, setReferees] = useState<RefereeFormData[]>(
    initialData.length > 0
      ? initialData.map((r) => ({
          id: r.id,
          name: r.name,
          title: r.title || "",
          position: r.position,
          organization: r.organization,
          email: r.email,
          phone: r.phone || "",
          relationship: r.relationship,
          years_known: r.years_known?.toString() || "",
          is_available: r.is_available,
          notes: r.notes || "",
        }))
      : [{ ...emptyReferee }]
  );

  const addReferee = () => {
    setReferees([...referees, { ...emptyReferee }]);
  };

  const removeReferee = async (index: number) => {
    const referee = referees[index];

    if (referee.id) {
      const supabase = createClient();
      const { error } = await supabase
        .from("referees")
        .delete()
        .eq("id", referee.id);

      if (error) {
        setError(error.message);
        return;
      }
    }

    setReferees(referees.filter((_, i) => i !== index));
    router.refresh();
  };

  const updateReferee = (
    index: number,
    field: keyof RefereeFormData,
    value: string | boolean
  ) => {
    const updated = [...referees];
    updated[index] = { ...updated[index], [field]: value };
    setReferees(updated);
    setError(null);
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    for (const r of referees) {
      if (!r.name.trim()) {
        setError("Name is required for all referees");
        return;
      }
      if (!r.position.trim()) {
        setError("Position is required for all referees");
        return;
      }
      if (!r.organization.trim()) {
        setError("Organization is required for all referees");
        return;
      }
      if (!r.email.trim()) {
        setError("Email is required for all referees");
        return;
      }
      if (!r.relationship.trim()) {
        setError("Relationship is required for all referees");
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
      for (let i = 0; i < referees.length; i++) {
        const r = referees[i];
        const dataToSave = {
          user_id: user.id,
          name: r.name,
          title: r.title || null,
          position: r.position,
          organization: r.organization,
          email: r.email,
          phone: r.phone || null,
          relationship: r.relationship,
          years_known: r.years_known ? parseInt(r.years_known) : null,
          is_available: r.is_available,
          notes: r.notes || null,
          sort_order: i,
        };

        if (r.id) {
          const { error } = await supabase
            .from("referees")
            .update(dataToSave)
            .eq("id", r.id);

          if (error) throw error;
        } else {
          const { error } = await supabase.from("referees").insert(dataToSave);

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
          <p className="text-sm text-green-600">Referees saved successfully!</p>
        </div>
      )}

      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="py-4">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium">Referee Selection</p>
              <p className="mt-1">
                Add all your professional referees here. When generating a CV,
                you&apos;ll be able to select which referees to include on each
                CV.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {referees.map((referee, index) => (
          <Card key={index}>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                  <CardTitle className="text-lg">
                    Referee {index + 1}
                  </CardTitle>
                  {!referee.is_available && (
                    <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                      Unavailable
                    </span>
                  )}
                </div>
                {referees.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeReferee(index)}
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
                  <Label htmlFor={`title_${index}`}>Title</Label>
                  <Input
                    id={`title_${index}`}
                    value={referee.title}
                    onChange={(e) =>
                      updateReferee(index, "title", e.target.value)
                    }
                    placeholder="e.g., Dr., Prof., A/Prof."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`name_${index}`}>Full Name *</Label>
                  <Input
                    id={`name_${index}`}
                    value={referee.name}
                    onChange={(e) =>
                      updateReferee(index, "name", e.target.value)
                    }
                    placeholder="e.g., John Smith"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`position_${index}`}>Position *</Label>
                  <Input
                    id={`position_${index}`}
                    value={referee.position}
                    onChange={(e) =>
                      updateReferee(index, "position", e.target.value)
                    }
                    placeholder="e.g., Director of Emergency Medicine"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`organization_${index}`}>
                    Organization *
                  </Label>
                  <Input
                    id={`organization_${index}`}
                    value={referee.organization}
                    onChange={(e) =>
                      updateReferee(index, "organization", e.target.value)
                    }
                    placeholder="e.g., Royal Melbourne Hospital"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`email_${index}`}>Email *</Label>
                  <Input
                    id={`email_${index}`}
                    type="email"
                    value={referee.email}
                    onChange={(e) =>
                      updateReferee(index, "email", e.target.value)
                    }
                    placeholder="john.smith@hospital.org"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`phone_${index}`}>Phone</Label>
                  <Input
                    id={`phone_${index}`}
                    type="tel"
                    value={referee.phone}
                    onChange={(e) =>
                      updateReferee(index, "phone", e.target.value)
                    }
                    placeholder="+61 400 000 000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`relationship_${index}`}>
                    Relationship *
                  </Label>
                  <Input
                    id={`relationship_${index}`}
                    value={referee.relationship}
                    onChange={(e) =>
                      updateReferee(index, "relationship", e.target.value)
                    }
                    placeholder="e.g., Direct Supervisor, Colleague"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`years_known_${index}`}>Years Known</Label>
                  <Input
                    id={`years_known_${index}`}
                    type="number"
                    min="0"
                    value={referee.years_known}
                    onChange={(e) =>
                      updateReferee(index, "years_known", e.target.value)
                    }
                    placeholder="e.g., 3"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`is_available_${index}`}
                  checked={referee.is_available}
                  onCheckedChange={(checked) =>
                    updateReferee(index, "is_available", checked === true)
                  }
                />
                <Label htmlFor={`is_available_${index}`}>
                  Available as referee
                </Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`notes_${index}`}>Notes</Label>
                <Textarea
                  id={`notes_${index}`}
                  value={referee.notes}
                  onChange={(e) =>
                    updateReferee(index, "notes", e.target.value)
                  }
                  placeholder="Any additional notes about this referee..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button type="button" variant="outline" onClick={addReferee}>
        <Plus className="h-4 w-4 mr-2" />
        Add Another Referee
      </Button>

      <div className="flex gap-4 pt-4">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save Referees"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
