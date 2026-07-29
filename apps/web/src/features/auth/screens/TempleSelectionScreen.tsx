import { Button } from "@krishnas-kitchen/ui";

import { navigateTo } from "@/app/routes/router";
import { useAuth } from "@/features/auth/hooks/useAuth";

export function TempleSelectionScreen() {
  const auth = useAuth();
  const temples = auth.profile?.temples ?? [];
  const isPendingApproval = auth.status === "authenticated" && temples.length === 0;

  function handleSelectTemple(templeId: string) {
    auth.selectTemple(templeId);
    navigateTo("/");
  }

  return (
    <main className="min-h-dvh bg-stone-50 px-5 py-6 text-stone-950">
      <section className="mx-auto flex min-h-[calc(100dvh-3rem)] w-full max-w-sm flex-col justify-center gap-5">
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

        <div className="space-y-2">
          {temples.length > 0 ? (
            temples.map((temple) => (
              <Button
                className="w-full justify-start bg-white text-stone-950 ring-1 ring-stone-200 hover:bg-stone-100"
                key={temple.id}
                onClick={() => handleSelectTemple(temple.id)}
                type="button"
              >
                {temple.name}
              </Button>
            ))
          ) : (
            <p className="rounded-md border border-stone-200 bg-white px-3 py-3 text-sm text-stone-700">
              No temple assignments were found on this session.
            </p>
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
