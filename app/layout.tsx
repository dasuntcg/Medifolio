import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AHPRA CV Portal",
  description: "Create AHPRA-compliant CVs for medical practitioners",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}