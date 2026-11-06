export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-primary">AHPRA CV Portal</h1>
        <p className="text-muted-foreground mt-2">
          Professional CVs for Medical Practitioners
        </p>
      </div>
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
