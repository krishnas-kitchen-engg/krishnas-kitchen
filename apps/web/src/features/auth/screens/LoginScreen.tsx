import { useCallback, useEffect, useState } from "react";
import { Button } from "@krishnas-kitchen/ui";

import { navigateTo } from "@/app/routes/router";
import { useAuth } from "@/features/auth/hooks/useAuth";

type PasswordFieldProps = {
  autocomplete?: string;
  label?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  value: string;
};

function PasswordField({
  autocomplete,
  label = "Password",
  onChange,
  placeholder,
  value
}: PasswordFieldProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <label className="block space-y-1 text-sm font-medium text-stone-800">
      <span>{label}</span>
      <span className="flex min-h-11 w-full items-center rounded-md border border-stone-300 bg-white focus-within:border-brand-700">
        <input
          autoComplete={autocomplete}
          className="min-h-11 min-w-0 flex-1 rounded-md bg-transparent px-3 text-base outline-none"
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          type={isVisible ? "text" : "password"}
          value={value}
        />
        <button
          aria-label={isVisible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          className="min-h-11 px-3 text-sm font-semibold text-brand-800"
          onClick={() => setIsVisible((current) => !current)}
          type="button"
        >
          {isVisible ? "Hide" : "Show"}
        </button>
      </span>
    </label>
  );
}

export function LoginScreen() {
  const auth = useAuth();
  const [mode, setMode] = useState<"signin" | "signup" | "volunteer">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signupDisplayName, setSignupDisplayName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupDestination, setSignupDestination] = useState("");
  const [signupDestinations, setSignupDestinations] = useState<
    Array<{
      organization_id: string;
      organization_name: string;
      temple_id: string;
      temple_name: string;
    }>
  >([]);
  const [signupDestinationsError, setSignupDestinationsError] = useState<string | null>(null);
  const [isLoadingSignupDestinations, setIsLoadingSignupDestinations] = useState(
    Boolean(auth.client)
  );
  const [volunteerName, setVolunteerName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadSignupDestinations = useCallback(async () => {
    if (!auth.client) {
      setSignupDestinationsError("Supabase is not configured.");
      return;
    }

    setIsLoadingSignupDestinations(true);
    setSignupDestinationsError(null);

    try {
      const { data, error } = await auth.client.rpc("list_registration_destinations");

      if (error) {
        throw error;
      }

      setSignupDestinations(data ?? []);
    } catch {
      setSignupDestinations([]);
      setSignupDestinationsError(
        "Temple choices could not be loaded. Check your connection and try again."
      );
    } finally {
      setIsLoadingSignupDestinations(false);
    }
  }, [auth.client]);

  useEffect(() => {
    void loadSignupDestinations();
  }, [loadSignupDestinations]);

  async function handlePasswordReset() {
    setErrorMessage(null);
    setSuccessMessage(null);

    const normalizedEmail = email.trim();
    if (!normalizedEmail) {
      setErrorMessage("Enter your email address first.");
      return;
    }

    if (!auth.client) {
      setErrorMessage("Supabase is not configured.");
      return;
    }

    try {
      const { error } = await auth.client.auth.resetPasswordForEmail(normalizedEmail, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        throw error;
      }

      setSuccessMessage("Password reset email sent. Open the link in that email to continue.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to send reset email.");
    }
  }

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await auth.signInWithEmail(email, password);
      navigateTo("/");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to sign in.");
    }
  }

  async function handleTemporaryVolunteer(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!volunteerName.trim() || !joinCode.trim()) {
      setErrorMessage("Enter volunteer name and join code.");
      return;
    }

    try {
      await auth.startTemporaryVolunteerSession({
        displayName: volunteerName,
        joinCode
      });
      navigateTo("/");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to start volunteer session."
      );
    }
  }

  async function handleSignUp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const destination = signupDestinations.find(
      (candidate) => candidate.temple_id === signupDestination
    );
    if (!destination) {
      setErrorMessage("Choose the temple where you need access.");
      return;
    }

    try {
      await auth.signUpWithEmail({
        displayName: signupDisplayName,
        email: signupEmail,
        organizationId: destination.organization_id,
        password: signupPassword,
        templeId: destination.temple_id
      });
      setSuccessMessage(
        "Request submitted. A temple admin or super admin can now approve or reject it in the app."
      );
      setSignupDisplayName("");
      setSignupEmail("");
      setSignupPassword("");
      setSignupDestination("");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to request account.");
    }
  }

  return (
    <main className="min-h-dvh bg-stone-50 px-5 py-6 text-stone-950">
      <section className="mx-auto flex min-h-[calc(100dvh-3rem)] w-full max-w-sm flex-col justify-center gap-6">
        <div className="relative overflow-hidden pb-2 pr-28">
          <img
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute right-0 top-0 h-32 w-24 object-contain opacity-90"
            src="/peacock-feather-accent.png"
          />
          <div className="space-y-2">
            <p className="text-sm font-medium uppercase tracking-wide text-brand-700">
              Krishna&apos;s Kitchen
            </p>
            <h1 className="text-3xl font-semibold text-brand-900">Sign in</h1>
            <p className="text-sm leading-6 text-stone-700">
              Use your kitchen account, or start a restricted volunteer session for temporary
              access.
            </p>
          </div>
        </div>

        {errorMessage ? (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {errorMessage}
          </p>
        ) : null}
        {successMessage ? (
          <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            {successMessage}
          </p>
        ) : null}

        <div aria-label="Account access" className="grid grid-cols-3 gap-2" role="tablist">
          {[
            ["signin", "Sign in"],
            ["signup", "Request access"],
            ["volunteer", "Volunteer"]
          ].map(([value, label]) => (
            <button
              aria-selected={mode === value}
              className={`min-h-11 rounded-md border px-2 text-sm font-semibold ${
                mode === value
                  ? "border-brand-900 bg-brand-900 text-white"
                  : "border-stone-300 bg-white text-stone-700"
              }`}
              key={value}
              onClick={() => setMode(value as typeof mode)}
              role="tab"
              type="button"
            >
              {label}
            </button>
          ))}
        </div>

        {mode === "signin" ? (
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
            <PasswordField
              autocomplete="current-password"
              onChange={setPassword}
              value={password}
            />
            <Button className="w-full" disabled={!auth.isConfigured} type="submit">
              Sign in
            </Button>
            <button
              className="min-h-11 w-full text-sm font-semibold text-brand-800 underline-offset-4 hover:underline"
              onClick={() => void handlePasswordReset()}
              type="button"
            >
              Forgot password?
            </button>
            {!auth.isConfigured ? (
              <p className="text-xs leading-5 text-stone-600">
                Supabase environment variables are not configured yet.
              </p>
            ) : null}
          </form>
        ) : null}

        {mode === "signup" ? (
          <form className="space-y-3" onSubmit={(event) => void handleSignUp(event)}>
            <div>
              <p className="text-sm font-semibold text-stone-900">Request account</p>
              <p className="mt-1 text-xs leading-5 text-stone-600">
                Choose your temple so the request reaches the correct admins.
              </p>
            </div>
            <input
              className="min-h-11 w-full rounded-md border border-stone-300 bg-white px-3 text-base outline-none focus:border-brand-700"
              onChange={(event) => setSignupDisplayName(event.target.value)}
              placeholder="Full name"
              value={signupDisplayName}
            />
            <input
              className="min-h-11 w-full rounded-md border border-stone-300 bg-white px-3 text-base outline-none focus:border-brand-700"
              inputMode="email"
              onChange={(event) => setSignupEmail(event.target.value)}
              placeholder="Email"
              type="email"
              value={signupEmail}
            />
            <PasswordField
              autocomplete="new-password"
              onChange={setSignupPassword}
              placeholder="Password"
              value={signupPassword}
            />
            <label className="block text-sm font-medium text-stone-800">
              Temple
              <select
                className="mt-1 min-h-11 w-full rounded-md border border-stone-300 bg-white px-3 text-base"
                onChange={(event) => setSignupDestination(event.target.value)}
                disabled={isLoadingSignupDestinations || Boolean(signupDestinationsError)}
                value={signupDestination}
              >
                <option value="">
                  {isLoadingSignupDestinations ? "Loading temples..." : "Choose temple"}
                </option>
                {signupDestinations.map((destination) => (
                  <option key={destination.temple_id} value={destination.temple_id}>
                    {destination.organization_name} — {destination.temple_name}
                  </option>
                ))}
              </select>
            </label>
            {signupDestinationsError ? (
              <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                <p>{signupDestinationsError}</p>
                <button
                  className="mt-2 min-h-10 font-semibold underline underline-offset-4"
                  onClick={() => void loadSignupDestinations()}
                  type="button"
                >
                  Try loading temples again
                </button>
              </div>
            ) : !isLoadingSignupDestinations && signupDestinations.length === 0 ? (
              <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                No active temples are available for registration. Ask a super admin to restore or
                create a temple first.
              </p>
            ) : null}
            <Button
              className="w-full bg-brand-900 hover:bg-brand-800"
              disabled={
                isLoadingSignupDestinations ||
                Boolean(signupDestinationsError) ||
                signupDestinations.length === 0
              }
              type="submit"
            >
              Request access
            </Button>
          </form>
        ) : null}

        {mode === "volunteer" ? (
          <form className="space-y-3" onSubmit={(event) => void handleTemporaryVolunteer(event)}>
            <p className="text-sm font-semibold text-stone-900">Temporary volunteer</p>
            <input
              className="min-h-11 w-full rounded-md border border-stone-300 bg-white px-3 text-base outline-none focus:border-brand-700"
              onChange={(event) => setVolunteerName(event.target.value)}
              placeholder="Display name"
              value={volunteerName}
            />
            <input
              className="min-h-11 w-full rounded-md border border-stone-300 bg-white px-3 text-base outline-none focus:border-brand-700"
              onChange={(event) => setJoinCode(event.target.value)}
              placeholder="Join code"
              value={joinCode}
            />
            <Button className="w-full bg-stone-900 hover:bg-stone-700" type="submit">
              Continue restricted
            </Button>
          </form>
        ) : null}
      </section>
    </main>
  );
}
