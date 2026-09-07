import { useState } from "react";
import { Button } from "@krishnas-kitchen/ui";

import { navigateTo } from "@/app/routes/router";
import { useAuth } from "@/features/auth/hooks/useAuth";

export function ResetPasswordScreen() {
  const auth = useAuth();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmation) {
      setError("Passwords do not match.");
      return;
    }

    if (!auth.client) {
      setError("Supabase is not configured.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error: updateError } = await auth.client.auth.updateUser({ password });
      if (updateError) {
        throw updateError;
      }

      const { error: completionError } = await auth.client.rpc(
        "complete_temporary_password_change"
      );
      if (completionError) throw completionError;
      await auth.client.auth.refreshSession();

      setPassword("");
      setConfirmation("");
      setSuccess("Password updated. You can continue to the app.");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error ? caughtError.message : "Password could not be updated."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-dvh bg-stone-50 px-5 py-6 text-stone-950">
      <section className="mx-auto flex min-h-[calc(100dvh-3rem)] w-full max-w-sm flex-col justify-center gap-5">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-brand-700">
            Account security
          </p>
          <h1 className="mt-1 text-3xl font-semibold text-brand-900">Choose a new password</h1>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            Use at least 8 characters. You may be here from a reset email or because an admin gave
            you a temporary password.
          </p>
        </div>

        {error ? (
          <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}
        {success ? (
          <p className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
            {success}
          </p>
        ) : null}

        <form className="space-y-3" onSubmit={(event) => void submit(event)}>
          <label className="block space-y-1 text-sm font-medium text-stone-800">
            <span>New password</span>
            <input
              autoComplete="new-password"
              className="min-h-11 w-full rounded-md border border-stone-300 bg-white px-3 text-base"
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              value={password}
            />
          </label>
          <label className="block space-y-1 text-sm font-medium text-stone-800">
            <span>Confirm new password</span>
            <input
              autoComplete="new-password"
              className="min-h-11 w-full rounded-md border border-stone-300 bg-white px-3 text-base"
              onChange={(event) => setConfirmation(event.target.value)}
              type="password"
              value={confirmation}
            />
          </label>
          <Button className="w-full" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Updating..." : "Update password"}
          </Button>
        </form>

        <button
          className="min-h-11 text-sm font-semibold text-brand-800"
          onClick={() => navigateTo("/")}
          type="button"
        >
          Back to app
        </button>
      </section>
    </main>
  );
}
