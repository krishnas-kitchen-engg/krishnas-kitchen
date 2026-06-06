type ScanCameraPlaceholderProps = {
  cameraAvailable: boolean;
};

export function ScanCameraPlaceholder({ cameraAvailable }: ScanCameraPlaceholderProps) {
  return (
    <section className="space-y-2 rounded-md border border-dashed border-stone-300 bg-stone-50 p-4">
      <h2 className="text-base font-semibold text-stone-950">Camera scan</h2>
      <p className="text-sm leading-6 text-stone-600">
        Camera scanning foundation is {cameraAvailable ? "available" : "not connected"} for this
        session. Browser camera controls will arrive in a later phase.
      </p>
    </section>
  );
}
