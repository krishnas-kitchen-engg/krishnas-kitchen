import { Button } from "@krishnas-kitchen/ui";

import { navigateTo } from "@/app/routes/router";
import { useAuth } from "@/features/auth";

export function HomeScreen() {
  const auth = useAuth();
  const roleLabel = auth.isTemporaryVolunteer
    ? "Temporary volunteer"
    : auth.roles.length > 0
      ? auth.roles.join(", ")
      : "No role assigned";

  return (
    <main className="min-h-dvh bg-stone-50 px-5 py-6 text-stone-950">
      <section className="mx-auto flex min-h-[calc(100dvh-3rem)] w-full max-w-sm flex-col justify-center gap-5">
        <div className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-wide text-brand-700">
            {auth.currentOrganization?.name ?? "Krishna's Kitchen"}
          </p>
          <h1 className="text-3xl font-semibold text-brand-900">Kitchen access ready</h1>
          <p className="text-sm leading-6 text-stone-700">
            Authentication, organization scope, temple scope, and role-aware authorization are
            wired.
          </p>
        </div>

        <dl className="space-y-3 rounded-md border border-stone-200 bg-white p-4 text-sm">
          <div className="flex items-start justify-between gap-3">
            <dt className="font-medium text-stone-600">Session</dt>
            <dd className="text-right font-semibold text-stone-950">{auth.status}</dd>
          </div>
          <div className="flex items-start justify-between gap-3">
            <dt className="font-medium text-stone-600">Role</dt>
            <dd className="text-right font-semibold text-stone-950">{roleLabel}</dd>
          </div>
          <div className="flex items-start justify-between gap-3">
            <dt className="font-medium text-stone-600">Temple</dt>
            <dd className="text-right font-semibold text-stone-950">
              {auth.currentTemple?.name ?? "Not selected"}
            </dd>
          </div>
        </dl>

        <div className="grid gap-2">
          {!auth.isTemporaryVolunteer ? (
            <Button className="w-full" onClick={() => navigateTo("/select-temple")} type="button">
              Change temple
            </Button>
          ) : null}
          <Button
            className="w-full bg-stone-900 hover:bg-stone-700"
            onClick={() => void auth.signOut()}
            type="button"
          >
            End session
          </Button>
        </div>
      </section>
    </main>
  );
}
