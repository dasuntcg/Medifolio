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
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tables } from "@/lib/supabase/database.types";

type PersonalDetails = Tables<"personal_details">;

interface PersonalDetailsFormProps {
  initialData: PersonalDetails | null;
}

export function PersonalDetailsForm({ initialData }: PersonalDetailsFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    full_name: initialData?.full_name || "",
    date_of_birth: initialData?.date_of_birth || "",
    address: initialData?.address || "",
    city: initialData?.city || "",
    state: initialData?.state || "",
    postcode: initialData?.postcode || "",
    country: initialData?.country || "Australia",
    phone: initialData?.phone || "",
    email: initialData?.email || "",
    ahpra_number: initialData?.ahpra_number || "",
    passport_number: initialData?.passport_number || "",
    citizenship: initialData?.citizenship || "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!formData.full_name.trim()) {
      setError("Full name is required");
      return;
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

    const dataToSave = {
      ...formData,
      user_id: user.id,
      date_of_birth: formData.date_of_birth || null,
      address: formData.address || null,
      city: formData.city || null,
      state: formData.state || null,
      postcode: formData.postcode || null,
      phone: formData.phone || null,
      email: formData.email || null,
      ahpra_number: formData.ahpra_number || null,
      passport_number: formData.passport_number || null,
      citizenship: formData.citizenship || null,
    };

    let result;
    if (initialData) {
      result = await supabase
        .from("personal_details")
        .update(dataToSave)
        .eq("id", initialData.id);
    } else {
      result = await supabase.from("personal_details").insert(dataToSave);
    }

    if (result.error) {
      setError(result.error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
    router.refresh();
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
          <p className="text-sm text-green-600">Details saved successfully!</p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Your name and date of birth.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name *</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => handleChange("full_name", e.target.value)}
              placeholder="Dr. John Smith"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date_of_birth">Date of Birth</Label>
            <Input
              id="date_of_birth"
              type="date"
              value={formData.date_of_birth}
              onChange={(e) => handleChange("date_of_birth", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="citizenship">Citizenship</Label>
            <Input
              id="citizenship"
              value={formData.citizenship}
              onChange={(e) => handleChange("citizenship", e.target.value)}
              placeholder="e.g., Australian, Indian, British"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="passport_number">Passport Number</Label>
            <Input
              id="passport_number"
              value={formData.passport_number}
              onChange={(e) => handleChange("passport_number", e.target.value)}
              placeholder="PA1234567"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
          <CardDescription>Your address and contact details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="address">Street Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleChange("address", e.target.value)}
              placeholder="123 Main Street"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleChange("city", e.target.value)}
                placeholder="e.g., Sydney, Mumbai, London"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State / Province / Region</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => handleChange("state", e.target.value)}
                placeholder="e.g., NSW, Maharashtra, England"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="postcode">Postcode / ZIP Code</Label>
              <Input
                id="postcode"
                value={formData.postcode}
                onChange={(e) => handleChange("postcode", e.target.value)}
                placeholder="e.g., 2000, 400001"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => handleChange("country", e.target.value)}
                placeholder="e.g., Australia, India, United Kingdom"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="+61 400 000 000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="john.smith@example.com"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Registration Details</CardTitle>
          <CardDescription>Your AHPRA registration information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ahpra_number">AHPRA Registration Number</Label>
            <Input
              id="ahpra_number"
              value={formData.ahpra_number}
              onChange={(e) => handleChange("ahpra_number", e.target.value)}
              placeholder="MED0001234567"
            />
            <p className="text-xs text-muted-foreground">
              Leave blank if you don&apos;t have an AHPRA number yet.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save Details"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
