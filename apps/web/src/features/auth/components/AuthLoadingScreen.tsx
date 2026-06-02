export function AuthLoadingScreen() {
  return (
    <main className="grid min-h-dvh place-items-center bg-stone-50 px-5 text-stone-950">
      <div className="w-full max-w-sm space-y-3 text-center">
        <div className="mx-auto h-10 w-10 animate-pulse rounded-full bg-brand-700" />
        <p className="text-sm font-medium text-stone-700">Checking your session...</p>
      </div>
    </main>
  );
}
