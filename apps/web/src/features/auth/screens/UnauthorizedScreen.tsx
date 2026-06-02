import { Button } from "@krishnas-kitchen/ui";

import { navigateTo } from "@/app/routes/router";

export function UnauthorizedScreen() {
  return (
    <main className="grid min-h-dvh place-items-center bg-stone-50 px-5 text-stone-950">
      <section className="w-full max-w-sm space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-wide text-brand-700">
            Access restricted
          </p>
          <h1 className="text-3xl font-semibold text-brand-900">Not authorized</h1>
          <p className="text-sm leading-6 text-stone-700">
            Your current session does not include permission for this area.
          </p>
        </div>
        <Button className="w-full" onClick={() => navigateTo("/")} type="button">
          Back to home
        </Button>
      </section>
    </main>
  );
}
