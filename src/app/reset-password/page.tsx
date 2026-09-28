import type { Metadata } from "next";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { AuthPageShell } from "@/components/orbyt/auth/auth-page-shell";
import { ResetPasswordFlow } from "@/components/orbyt/auth/reset-password-form";

export const metadata: Metadata = {
  title: "Reset password · ORBYT",
};

function ResetFallback() {
  return (
    <div className="flex w-full max-w-md items-center justify-center py-24">
      <Loader2 aria-hidden="true" className="size-4 animate-spin text-primary" />
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthPageShell>
      <Suspense fallback={<ResetFallback />}>
        <ResetPasswordFlow />
      </Suspense>
    </AuthPageShell>
  );
}
