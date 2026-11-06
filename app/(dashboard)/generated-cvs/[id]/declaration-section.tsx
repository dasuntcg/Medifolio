"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check, Edit, RotateCcw, FileSignature } from "lucide-react";

interface DeclarationSectionProps {
  cvId: string;
  declarationText: string | null;
  signatureDataUrl: string | null;
  signedAt: string | null;
}

const DEFAULT_DECLARATION = `I declare that the information contained in this curriculum vitae is true and correct as at the date of signing.

I understand that providing false or misleading information may result in the refusal or cancellation of my registration.`;

export function DeclarationSection({
  cvId,
  declarationText,
  signatureDataUrl,
  signedAt,
}: DeclarationSectionProps) {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(!signedAt);
  const [declaration, setDeclaration] = useState(
    declarationText || DEFAULT_DECLARATION
  );
  const [hasSignature, setHasSignature] = useState(!!signatureDataUrl);

  useEffect(() => {
    if (signatureDataUrl && canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0);
        };
        img.src = signatureDataUrl;
      }
    }
  }, [signatureDataUrl]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isEditing) return;
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !isEditing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#000";
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleSave = async () => {
    if (!hasSignature) {
      setError("Please sign the declaration");
      return;
    }

    setError(null);
    setLoading(true);

    const canvas = canvasRef.current;
    if (!canvas) {
      setError("Signature canvas not found");
      setLoading(false);
      return;
    }

    const signatureData = canvas.toDataURL("image/png");

    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("generated_cvs")
      .update({
        declaration_text: declaration,
        signature_data_url: signatureData,
        signed_at: new Date().toISOString(),
      })
      .eq("id", cvId);

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    setIsEditing(false);
    setLoading(false);
    router.refresh();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-AU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSignature className="h-5 w-5 text-primary" />
            <CardTitle>Declaration</CardTitle>
          </div>
          {signedAt && !isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          )}
        </div>
        <CardDescription>
          Sign the declaration to confirm the information in this CV is true and
          correct.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <div className="rounded-md bg-destructive/10 p-3">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Declaration Text */}
        <div className="space-y-2">
          <Label htmlFor="declaration">Declaration Text</Label>
          {isEditing ? (
            <Textarea
              id="declaration"
              value={declaration}
              onChange={(e) => setDeclaration(e.target.value)}
              rows={4}
            />
          ) : (
            <div className="p-4 bg-muted/50 rounded-lg text-sm whitespace-pre-wrap">
              {declaration}
            </div>
          )}
        </div>

        {/* Signature */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Signature</Label>
            {isEditing && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSignature}
                disabled={!hasSignature}
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
          <div
            className={`border rounded-lg bg-white ${
              isEditing ? "cursor-crosshair" : ""
            }`}
          >
            <canvas
              ref={canvasRef}
              width={600}
              height={150}
              className="w-full h-[150px]"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
            />
          </div>
          {isEditing && (
            <p className="text-xs text-muted-foreground">
              Draw your signature in the box above using your mouse or touchpad.
            </p>
          )}
        </div>

        {/* Signed Date */}
        {signedAt && !isEditing && (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <Check className="h-4 w-4" />
            Signed on {formatDate(signedAt)}
          </div>
        )}

        {/* Actions */}
        {isEditing && (
          <div className="flex gap-4">
            <Button onClick={handleSave} disabled={loading || !hasSignature}>
              {loading ? "Saving..." : "Sign Declaration"}
            </Button>
            {signedAt && (
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  setDeclaration(declarationText || DEFAULT_DECLARATION);
                  // Restore original signature
                  if (signatureDataUrl && canvasRef.current) {
                    const ctx = canvasRef.current.getContext("2d");
                    if (ctx) {
                      ctx.clearRect(
                        0,
                        0,
                        canvasRef.current.width,
                        canvasRef.current.height
                      );
                      const img = new Image();
                      img.onload = () => {
                        ctx.drawImage(img, 0, 0);
                      };
                      img.src = signatureDataUrl;
                    }
                  }
                }}
              >
                Cancel
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
