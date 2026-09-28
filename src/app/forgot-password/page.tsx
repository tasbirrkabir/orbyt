import type { Metadata } from "next";
import { AuthPageShell } from "@/components/orbyt/auth/auth-page-shell";
import { ForgotPasswordForm } from "@/components/orbyt/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot password · ORBYT",
};

export default function ForgotPasswordPage() {
  return (
    <AuthPageShell>
      <ForgotPasswordForm />
    </AuthPageShell>
  );
}
