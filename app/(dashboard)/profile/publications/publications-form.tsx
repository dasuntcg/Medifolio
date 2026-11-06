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

type Publication = Tables<"publications">;

interface PublicationsFormProps {
  initialData: Publication[];
}

interface PublicationFormData {
  id?: string;
  title: string;
  publication_type: string;
  journal_conference: string;
  date_published: string;
  authors: string;
  doi: string;
  url: string;
}

const emptyPublication: PublicationFormData = {
  title: "",
  publication_type: "",
  journal_conference: "",
  date_published: "",
  authors: "",
  doi: "",
  url: "",
};

const publicationTypes = [
  { value: "journal", label: "Journal Article" },
  { value: "conference", label: "Conference Paper" },
  { value: "book", label: "Book" },
  { value: "chapter", label: "Book Chapter" },
  { value: "other", label: "Other" },
];

export function PublicationsForm({ initialData }: PublicationsFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [publications, setPublications] = useState<PublicationFormData[]>(
    initialData.length > 0
      ? initialData.map((p) => ({
          id: p.id,
          title: p.title,
          publication_type: p.publication_type || "",
          journal_conference: p.journal_conference || "",
          date_published: p.date_published || "",
          authors: p.authors || "",
          doi: p.doi || "",
          url: p.url || "",
        }))
      : []
  );

  const addPublication = () => {
    setPublications([...publications, { ...emptyPublication }]);
  };

  const removePublication = async (index: number) => {
    const publication = publications[index];

    if (publication.id) {
      const supabase = createClient();
      const { error } = await supabase
        .from("publications")
        .delete()
        .eq("id", publication.id);

      if (error) {
        setError(error.message);
        return;
      }
    }

    setPublications(publications.filter((_, i) => i !== index));
    router.refresh();
  };

  const updatePublication = (
    index: number,
    field: keyof PublicationFormData,
    value: string
  ) => {
    const updated = [...publications];
    updated[index] = { ...updated[index], [field]: value };
    setPublications(updated);
    setError(null);
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    for (const p of publications) {
      if (!p.title.trim()) {
        setError("Title is required for all entries");
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
      for (let i = 0; i < publications.length; i++) {
        const p = publications[i];
        const dataToSave = {
          user_id: user.id,
          title: p.title,
          publication_type: p.publication_type || null,
          journal_conference: p.journal_conference || null,
          date_published: p.date_published || null,
          authors: p.authors || null,
          doi: p.doi || null,
          url: p.url || null,
          sort_order: i,
        };

        if (p.id) {
          const { error } = await supabase
            .from("publications")
            .update(dataToSave)
            .eq("id", p.id);

          if (error) throw error;
        } else {
          const { error } = await supabase
            .from("publications")
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
            Publications saved successfully!
          </p>
        </div>
      )}

      {publications.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <p className="text-muted-foreground text-center mb-4">
              No publications recorded. This section is optional - add any
              research publications if applicable.
            </p>
            <Button type="button" variant="outline" onClick={addPublication}>
              <Plus className="h-4 w-4 mr-2" />
              Add Publication
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {publications.map((publication, index) => (
            <Card key={index}>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                    <CardTitle className="text-lg">
                      Publication {index + 1}
                    </CardTitle>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removePublication(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor={`title_${index}`}>Title *</Label>
                  <Input
                    id={`title_${index}`}
                    value={publication.title}
                    onChange={(e) =>
                      updatePublication(index, "title", e.target.value)
                    }
                    placeholder="e.g., Impact of Early Intervention on Patient Outcomes"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`publication_type_${index}`}>Type</Label>
                    <Select
                      value={publication.publication_type}
                      onValueChange={(value) =>
                        updatePublication(index, "publication_type", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {publicationTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`date_published_${index}`}>
                      Date Published
                    </Label>
                    <Input
                      id={`date_published_${index}`}
                      type="date"
                      value={publication.date_published}
                      onChange={(e) =>
                        updatePublication(
                          index,
                          "date_published",
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`journal_conference_${index}`}>
                    Journal / Conference
                  </Label>
                  <Input
                    id={`journal_conference_${index}`}
                    value={publication.journal_conference}
                    onChange={(e) =>
                      updatePublication(
                        index,
                        "journal_conference",
                        e.target.value
                      )
                    }
                    placeholder="e.g., Medical Journal of Australia"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`authors_${index}`}>Authors</Label>
                  <Input
                    id={`authors_${index}`}
                    value={publication.authors}
                    onChange={(e) =>
                      updatePublication(index, "authors", e.target.value)
                    }
                    placeholder="e.g., Smith J, Jones A, Brown B"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`doi_${index}`}>DOI</Label>
                    <Input
                      id={`doi_${index}`}
                      value={publication.doi}
                      onChange={(e) =>
                        updatePublication(index, "doi", e.target.value)
                      }
                      placeholder="e.g., 10.1000/xyz123"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`url_${index}`}>URL</Label>
                    <Input
                      id={`url_${index}`}
                      type="url"
                      value={publication.url}
                      onChange={(e) =>
                        updatePublication(index, "url", e.target.value)
                      }
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <Button type="button" variant="outline" onClick={addPublication}>
            <Plus className="h-4 w-4 mr-2" />
            Add Another Publication
          </Button>
        </div>
      )}

      <div className="flex gap-4 pt-4">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save Publications"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
