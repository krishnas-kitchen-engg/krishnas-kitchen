import { Button } from "@krishnas-kitchen/ui";

import { navigateTo } from "@/app/routes/router";
import { hasPermission } from "@/features/auth/lib/permissions";
import { useAuth } from "@/features/auth/hooks/useAuth";

export function TempleSelectionScreen() {
  const auth = useAuth();
  const temples = auth.profile?.temples ?? [];
  const isPendingApproval = auth.status === "authenticated" && temples.length === 0;
  const canOpenAdminSetup = hasPermission(auth.permissions, "users.manage");

  function handleSelectTemple(templeId: string) {
    auth.selectTemple(templeId);
    navigateTo("/");
  }

  return (
    <main className="min-h-dvh bg-stone-50 px-5 py-6 text-stone-950">
      <section className="mx-auto flex min-h-[calc(100dvh-3rem)] w-full max-w-sm flex-col justify-center gap-5">
        <div className="relative overflow-hidden pb-2 pr-24">
          <img
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute right-0 top-0 h-28 w-20 object-contain opacity-85"
            src="/peacock-feather-accent.png"
          />
          <div className="space-y-2">
            <p className="text-sm font-medium uppercase tracking-wide text-brand-700">
              {auth.currentOrganization?.name ?? "Organization"}
            </p>
            <h1 className="text-3xl font-semibold text-brand-900">
              {isPendingApproval ? "Approval pending" : "Select temple"}
            </h1>
            <p className="text-sm leading-6 text-stone-700">
              {isPendingApproval
                ? "Your account exists, but an admin still needs to assign temple access and roles before you can use Krishna's Kitchen."
                : "Choose the temple context for this session. Authorization remains enforced by RLS."}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          {temples.length > 0 ? (
            temples.map((temple) => (
              <button
                className="min-h-11 w-full rounded-md border border-stone-200 bg-white px-4 py-2 text-left text-sm font-semibold text-stone-950 shadow-sm transition-colors hover:bg-stone-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700"
                key={temple.id}
                onClick={() => handleSelectTemple(temple.id)}
                style={{ backgroundColor: "#ffffff", color: "#0c0a09" }}
                type="button"
              >
                <span style={{ color: "#0c0a09" }}>{temple.name}</span>
              </button>
            ))
          ) : (
            <div className="space-y-3">
              <p className="rounded-md border border-stone-200 bg-white px-3 py-3 text-sm text-stone-700">
                No temple assignments were found on this session.
              </p>
              {canOpenAdminSetup ? (
                <Button className="w-full" onClick={() => navigateTo("/admin")} type="button">
                  Open admin setup
                </Button>
              ) : null}
            </div>
          )}
        </div>

        <Button
          className="w-full bg-stone-900 hover:bg-stone-700"
          onClick={() => void auth.signOut()}
          type="button"
        >
          Sign out
        </Button>
      </section>
    </main>
  );
}
