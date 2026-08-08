import { useState } from "react";
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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signupDisplayName, setSignupDisplayName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [volunteerName, setVolunteerName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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

    try {
      await auth.signUpWithEmail({
        displayName: signupDisplayName,
        email: signupEmail,
        password: signupPassword
      });
      setSuccessMessage(
        "Account request submitted. After an admin approves your temple access, sign in with this email."
      );
      setSignupDisplayName("");
      setSignupEmail("");
      setSignupPassword("");
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
          <PasswordField autocomplete="current-password" onChange={setPassword} value={password} />
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
          onSubmit={(event) => void handleSignUp(event)}
        >
          <div>
            <p className="text-sm font-semibold text-stone-900">Request account</p>
            <p className="mt-1 text-xs leading-5 text-stone-600">
              New accounts stay pending until an admin assigns temple access and roles.
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
          <Button className="w-full bg-brand-900 hover:bg-brand-800" type="submit">
            Request access
          </Button>
        </form>

        <form
          className="space-y-3 border-t border-stone-200 pt-5"
          onSubmit={(event) => void handleTemporaryVolunteer(event)}
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
            onChange={(event) => setJoinCode(event.target.value)}
            placeholder="Join code"
            value={joinCode}
          />
          <Button className="w-full bg-stone-900 hover:bg-stone-700" type="submit">
            Continue restricted
          </Button>
        </form>
      </section>
    </main>
  );
}
