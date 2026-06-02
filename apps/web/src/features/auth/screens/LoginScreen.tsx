import { useState } from "react";
import { Button } from "@krishnas-kitchen/ui";

import { navigateTo } from "@/app/routes/router";
import { useAuth } from "@/features/auth/hooks/useAuth";

export function LoginScreen() {
  const auth = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [volunteerName, setVolunteerName] = useState("");
  const [organizationId, setOrganizationId] = useState("");
  const [templeId, setTempleId] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    try {
      await auth.signInWithEmail(email, password);
      navigateTo("/");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to sign in.");
    }
  }

  function handleTemporaryVolunteer(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    if (!volunteerName.trim() || !organizationId.trim() || !templeId.trim()) {
      setErrorMessage("Enter volunteer name, organization ID, and temple ID.");
      return;
    }

    auth.startTemporaryVolunteerSession({
      displayName: volunteerName,
      organizationId,
      templeId
    });
    navigateTo("/");
  }

  return (
    <main className="min-h-dvh bg-stone-50 px-5 py-6 text-stone-950">
      <section className="mx-auto flex min-h-[calc(100dvh-3rem)] w-full max-w-sm flex-col justify-center gap-6">
        <div className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-wide text-brand-700">
            Krishna&apos;s Kitchen
          </p>
          <h1 className="text-3xl font-semibold text-brand-900">Sign in</h1>
          <p className="text-sm leading-6 text-stone-700">
            Use your kitchen account, or start a restricted volunteer session for temporary access.
          </p>
        </div>

        {errorMessage ? (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {errorMessage}
          </p>
        ) : null}

        <form className="space-y-3" onSubmit={(event) => void handleLogin(event)}>
          <label className="block space-y-1 text-sm font-medium text-stone-800">
            <span>Email</span>
            <input
              className="min-h-11 w-full rounded-md border border-stone-300 bg-white px-3 text-base outline-none focus:border-brand-700"
              inputMode="email"
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              value={email}
            />
          </label>
          <label className="block space-y-1 text-sm font-medium text-stone-800">
            <span>Password</span>
            <input
              className="min-h-11 w-full rounded-md border border-stone-300 bg-white px-3 text-base outline-none focus:border-brand-700"
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              value={password}
            />
          </label>
          <Button className="w-full" disabled={!auth.isConfigured} type="submit">
            Sign in
          </Button>
          {!auth.isConfigured ? (
            <p className="text-xs leading-5 text-stone-600">
              Supabase environment variables are not configured yet.
            </p>
          ) : null}
        </form>

        <form
          className="space-y-3 border-t border-stone-200 pt-5"
          onSubmit={handleTemporaryVolunteer}
        >
          <p className="text-sm font-semibold text-stone-900">Temporary volunteer</p>
          <input
            className="min-h-11 w-full rounded-md border border-stone-300 bg-white px-3 text-base outline-none focus:border-brand-700"
            onChange={(event) => setVolunteerName(event.target.value)}
            placeholder="Display name"
            value={volunteerName}
          />
          <input
            className="min-h-11 w-full rounded-md border border-stone-300 bg-white px-3 text-base outline-none focus:border-brand-700"
            onChange={(event) => setOrganizationId(event.target.value)}
            placeholder="Organization ID"
            value={organizationId}
          />
          <input
            className="min-h-11 w-full rounded-md border border-stone-300 bg-white px-3 text-base outline-none focus:border-brand-700"
            onChange={(event) => setTempleId(event.target.value)}
            placeholder="Temple ID"
            value={templeId}
          />
          <Button className="w-full bg-stone-900 hover:bg-stone-700" type="submit">
            Continue restricted
          </Button>
        </form>
      </section>
    </main>
  );
}
