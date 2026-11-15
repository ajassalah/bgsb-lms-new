import { PasswordResetForm } from "@/components/password-reset-form";
import { AuthLayout } from "@/components/auth-layout";

export default function PasswordReset() {
  return (
    <AuthLayout>
      <PasswordResetForm />
    </AuthLayout>
  );
}
