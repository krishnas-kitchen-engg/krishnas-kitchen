import { Button } from "@krishnas-kitchen/ui";

import { env } from "@/shared/config/env";

export function AppRoutes() {
  return (
    <main className="min-h-dvh bg-stone-50 text-stone-950">
      <section className="mx-auto flex min-h-dvh w-full max-w-screen-sm flex-col justify-center px-5 py-8">
        <div className="space-y-5">
          <p className="text-sm font-medium uppercase tracking-wide text-brand-700">
            {env.appEnv} environment
          </p>
          <div className="space-y-3">
            <h1 className="text-4xl font-semibold tracking-normal text-brand-900">
              Krishna&apos;s Kitchen
            </h1>
            <p className="max-w-prose text-base leading-7 text-stone-700">
              Architecture and tooling are ready for a mobile-first operations PWA.
            </p>
          </div>
          <Button type="button">Project initialized</Button>
        </div>
      </section>
    </main>
  );
}
