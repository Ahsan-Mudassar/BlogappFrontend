import { LoaderCircle } from "lucide-react";

export default function Spinner() {
  return (
    <div className="animate-fade-in flex min-h-screen flex-col items-center justify-center gap-3 bg-canvas">
      <LoaderCircle className="h-9 w-9 animate-spin text-brand sm:h-10 sm:w-10" />
      <p className="text-sm font-medium text-muted">Loading...</p>
    </div>
  );
}
