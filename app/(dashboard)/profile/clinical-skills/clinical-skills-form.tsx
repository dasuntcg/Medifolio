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

type ClinicalSkill = Tables<"clinical_skills">;

interface ClinicalSkillsFormProps {
  initialData: ClinicalSkill[];
}

interface ClinicalSkillFormData {
  id?: string;
  skill_name: string;
  category: string;
  proficiency: string;
  date_last_performed: string;
  setting: string;
  notes: string;
}

const emptySkill: ClinicalSkillFormData = {
  skill_name: "",
  category: "",
  proficiency: "",
  date_last_performed: "",
  setting: "",
  notes: "",
};

const proficiencyLevels = [
  { value: "observed", label: "Observed" },
  { value: "competent", label: "Competent" },
  { value: "proficient", label: "Proficient" },
  { value: "expert", label: "Expert" },
];

const skillCategories = [
  "General Clinical",
  "Emergency Medicine",
  "Surgery",
  "Internal Medicine",
  "Obstetrics & Gynaecology",
  "Paediatrics",
  "Anaesthetics",
  "Radiology",
  "Pathology",
  "Mental Health",
  "Other",
];

export function ClinicalSkillsForm({ initialData }: ClinicalSkillsFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [skills, setSkills] = useState<ClinicalSkillFormData[]>(
    initialData.length > 0
      ? initialData.map((s) => ({
          id: s.id,
          skill_name: s.skill_name,
          category: s.category || "",
          proficiency: s.proficiency || "",
          date_last_performed: s.date_last_performed || "",
          setting: s.setting || "",
          notes: s.notes || "",
        }))
      : [{ ...emptySkill }]
  );

  const addSkill = () => {
    setSkills([...skills, { ...emptySkill }]);
  };

  const removeSkill = async (index: number) => {
    const skill = skills[index];

    if (skill.id) {
      const supabase = createClient();
      const { error } = await supabase
        .from("clinical_skills")
        .delete()
        .eq("id", skill.id);

      if (error) {
        setError(error.message);
        return;
      }
    }

    setSkills(skills.filter((_, i) => i !== index));
    router.refresh();
  };

  const updateSkill = (
    index: number,
    field: keyof ClinicalSkillFormData,
    value: string
  ) => {
    const updated = [...skills];
    updated[index] = { ...updated[index], [field]: value };
    setSkills(updated);
    setError(null);
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    for (const s of skills) {
      if (!s.skill_name.trim()) {
        setError("Skill name is required for all entries");
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
      for (let i = 0; i < skills.length; i++) {
        const s = skills[i];
        const dataToSave = {
          user_id: user.id,
          skill_name: s.skill_name,
          category: s.category || null,
          proficiency: s.proficiency || null,
          date_last_performed: s.date_last_performed || null,
          setting: s.setting || null,
          notes: s.notes || null,
          sort_order: i,
        };

        if (s.id) {
          const { error } = await supabase
            .from("clinical_skills")
            .update(dataToSave)
            .eq("id", s.id);

          if (error) throw error;
        } else {
          const { error } = await supabase
            .from("clinical_skills")
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
            Clinical skills saved successfully!
          </p>
        </div>
      )}

      <div className="space-y-4">
        {skills.map((skill, index) => (
          <Card key={index}>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                  <CardTitle className="text-lg">Skill {index + 1}</CardTitle>
                </div>
                {skills.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSkill(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={`skill_name_${index}`}>Skill Name *</Label>
                <Input
                  id={`skill_name_${index}`}
                  value={skill.skill_name}
                  onChange={(e) =>
                    updateSkill(index, "skill_name", e.target.value)
                  }
                  placeholder="e.g., Central Line Insertion"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`category_${index}`}>Category</Label>
                  <Select
                    value={skill.category}
                    onValueChange={(value) =>
                      updateSkill(index, "category", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {skillCategories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`proficiency_${index}`}>Proficiency</Label>
                  <Select
                    value={skill.proficiency}
                    onValueChange={(value) =>
                      updateSkill(index, "proficiency", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      {proficiencyLevels.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`date_last_performed_${index}`}>
                    Date Last Performed
                  </Label>
                  <Input
                    id={`date_last_performed_${index}`}
                    type="date"
                    value={skill.date_last_performed}
                    onChange={(e) =>
                      updateSkill(index, "date_last_performed", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`setting_${index}`}>Clinical Setting</Label>
                  <Input
                    id={`setting_${index}`}
                    value={skill.setting}
                    onChange={(e) =>
                      updateSkill(index, "setting", e.target.value)
                    }
                    placeholder="e.g., ICU, Emergency Department"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`notes_${index}`}>Additional Notes</Label>
                <Textarea
                  id={`notes_${index}`}
                  value={skill.notes}
                  onChange={(e) => updateSkill(index, "notes", e.target.value)}
                  placeholder="Any additional details about this skill..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button type="button" variant="outline" onClick={addSkill}>
        <Plus className="h-4 w-4 mr-2" />
        Add Another Skill
      </Button>

      <div className="flex gap-4 pt-4">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save Clinical Skills"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
