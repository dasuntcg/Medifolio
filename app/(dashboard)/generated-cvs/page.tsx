import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Calendar, ChevronLeft, Plus, Eye, Download } from "lucide-react";
import Link from "next/link";

export default async function GeneratedCVsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: generatedCVs } = await supabase
    .from("generated_cvs")
    .select("*")
    .eq("user_id", user?.id)
    .order("created_at", { ascending: false });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-AU", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-4">
          <Link href="/dashboard">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Link>
        </Button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Generated CVs</h1>
            <p className="text-muted-foreground">
              View and manage your generated AHPRA CVs.
            </p>
          </div>
          <Button asChild>
            <Link href="/generate-cv">
              <Plus className="h-4 w-4 mr-2" />
              Generate New CV
            </Link>
          </Button>
        </div>
      </div>

      {/* CVs Grid */}
      {generatedCVs && generatedCVs.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {generatedCVs.map((cv) => (
            <Card key={cv.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{cv.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(cv.created_at)}
                    </CardDescription>
                  </div>
                  {cv.signed_at && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Signed
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>
                    {cv.selected_referee_ids?.length || 0} referee
                    {(cv.selected_referee_ids?.length || 0) !== 1 ? "s" : ""} included
                  </span>
                </div>
              </CardContent>
              <CardFooter className="pt-3 border-t">
                <div className="flex gap-2 w-full">
                  <Button asChild variant="outline" size="sm" className="flex-1">
                    <Link href={`/generated-cvs/${cv.id}`}>
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Link>
                  </Button>
                  {cv.pdf_url ? (
                    <Button asChild variant="outline" size="sm" className="flex-1">
                      <a href={cv.pdf_url} target="_blank" rel="noopener noreferrer">
                        <Download className="h-4 w-4 mr-1" />
                        PDF
                      </a>
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" className="flex-1" disabled>
                      <Download className="h-4 w-4 mr-1" />
                      PDF
                    </Button>
                  )}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-muted p-4 mb-4">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No CVs generated yet</h3>
            <p className="text-muted-foreground text-center mb-4 max-w-sm">
              Generate your first AHPRA-compliant CV from your profile data.
            </p>
            <Button asChild>
              <Link href="/generate-cv">
                <Plus className="h-4 w-4 mr-2" />
                Generate CV
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
