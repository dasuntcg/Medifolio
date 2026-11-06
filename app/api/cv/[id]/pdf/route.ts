import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { CVTemplate } from "@/components/pdf/cv-template";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch the CV
  const { data: cv, error } = await supabase
    .from("generated_cvs")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !cv) {
    return NextResponse.json({ error: "CV not found" }, { status: 404 });
  }

  try {
    // Generate PDF buffer using JSX
    const pdfBuffer = await renderToBuffer(
      CVTemplate({
        cvData: cv.cv_data as any,
        cvName: cv.name,
        declarationText: cv.declaration_text || undefined,
        signedAt: cv.signed_at || undefined,
      })
    );

    // Convert Buffer to Uint8Array for NextResponse
    const uint8Array = new Uint8Array(pdfBuffer);

    // Return PDF with appropriate headers
    return new NextResponse(uint8Array, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(cv.name)}.pdf"`,
        "Content-Length": uint8Array.length.toString(),
      },
    });
  } catch (pdfError) {
    console.error("PDF generation error:", pdfError);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
