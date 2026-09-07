import { Button } from "@krishnas-kitchen/ui";

import { useAuth } from "@/features/auth/hooks/useAuth";

export function AccessRequestStatusScreen({ status }: { status: "pending" | "rejected" }) {
  const auth = useAuth();
  const rejected = status === "rejected";

  return (
    <main className="grid min-h-dvh place-items-center bg-stone-50 px-5 text-stone-950">
      <section className="w-full max-w-sm space-y-4 rounded-md border border-stone-200 bg-white p-5">
        <div>
          <p className="text-sm font-semibold uppercase text-brand-800">Access request</p>
          <h1 className="mt-1 text-2xl font-semibold text-stone-950">
            {rejected ? "Request not approved" : "Waiting for approval"}
          </h1>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            {rejected
              ? "An administrator rejected this request. Contact your temple administrator if you believe this was a mistake."
              : "A temple admin or super admin still needs to approve your role. Try signing in again after they approve it."}
          </p>
        </div>
        <Button className="w-full" onClick={() => void auth.signOut()} type="button">
          Sign out
        </Button>
      </section>
    </main>
  );
}
