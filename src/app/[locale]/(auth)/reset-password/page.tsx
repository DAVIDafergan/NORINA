import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export default function ResetPasswordPage() {
  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <Suspense>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
