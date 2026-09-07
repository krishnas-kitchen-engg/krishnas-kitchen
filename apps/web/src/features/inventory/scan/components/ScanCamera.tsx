import { useEffect, useRef, useState } from "react";
import type { BarcodeFormat, IScannerControls } from "@zxing/browser";

import type { InventoryBarcodeFormat } from "@/domains/inventory";

type BarcodeFormatValues = Record<
  "EAN_13" | "EAN_8" | "QR_CODE" | "UPC_A" | "UPC_E",
  BarcodeFormat
>;

function mapBarcodeFormat(
  format: BarcodeFormat,
  formats: BarcodeFormatValues
): InventoryBarcodeFormat | null {
  switch (format) {
    case formats.UPC_A:
      return "upc_a";
    case formats.UPC_E:
      return "upc_e";
    case formats.EAN_13:
      return "ean_13";
    case formats.EAN_8:
      return "ean_8";
    case formats.QR_CODE:
      return "qr";
    default:
      return null;
  }
}

function cameraErrorMessage(error: unknown): string {
  if (error instanceof DOMException && error.name === "NotAllowedError") {
    return "Camera access was denied. Allow camera access in browser settings and try again.";
  }

  if (error instanceof DOMException && error.name === "NotFoundError") {
    return "No camera was found on this device.";
  }

  return error instanceof Error ? error.message : "The camera could not be started.";
}

export function ScanCamera({
  onDetected
}: {
  onDetected: (value: string, format: InventoryBarcodeFormat) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const detectedRef = useRef(false);
  const [status, setStatus] = useState<"idle" | "starting" | "scanning">("idle");
  const [error, setError] = useState<string | null>(null);

  function stop() {
    controlsRef.current?.stop();
    controlsRef.current = null;
    detectedRef.current = false;
    setStatus("idle");
  }

  useEffect(() => () => controlsRef.current?.stop(), []);

  async function start() {
    if (!navigator.mediaDevices?.getUserMedia || !videoRef.current) {
      setError("Camera scanning is not supported by this browser. You can still type the barcode.");
      return;
    }

    setError(null);
    setStatus("starting");
    detectedRef.current = false;

    try {
      const { BarcodeFormat, BrowserMultiFormatReader } = await import("@zxing/browser");
      const reader = new BrowserMultiFormatReader();
      const controls = await reader.decodeFromConstraints(
        {
          audio: false,
          video: {
            facingMode: { ideal: "environment" }
          }
        },
        videoRef.current,
        (result, _error, controls) => {
          if (!result || detectedRef.current) return;
          const format = mapBarcodeFormat(result.getBarcodeFormat(), BarcodeFormat);
          if (!format) {
            setError("This barcode type is not supported. Try UPC, EAN, or QR.");
            return;
          }

          detectedRef.current = true;
          controls.stop();
          controlsRef.current = null;
          setStatus("idle");
          onDetected(result.getText(), format);
        }
      );
      controlsRef.current = controls;
      setStatus("scanning");
    } catch (caughtError) {
      controlsRef.current = null;
      setStatus("idle");
      setError(cameraErrorMessage(caughtError));
    }
  }

  return (
    <section className="space-y-3 rounded-md border border-stone-200 bg-white p-4">
      <div>
        <h2 className="text-base font-semibold text-stone-950">Camera scan</h2>
        <p className="mt-1 text-sm leading-6 text-stone-600">
          Point the rear camera at a UPC, EAN, or QR barcode. The scan stops after one result.
        </p>
      </div>
      <video
        aria-label="Barcode camera preview"
        className={`aspect-[4/3] w-full rounded-md bg-stone-950 object-cover ${status === "idle" ? "hidden" : "block"}`}
        muted
        playsInline
        ref={videoRef}
      />
      {error ? (
        <p className="rounded-md bg-red-50 p-3 text-sm font-medium text-red-700">{error}</p>
      ) : null}
      {status === "idle" ? (
        <button
          className="min-h-11 w-full rounded-md bg-brand-900 px-4 text-sm font-semibold text-white"
          onClick={() => void start()}
          type="button"
        >
          Open camera
        </button>
      ) : (
        <button
          className="min-h-11 w-full rounded-md bg-stone-900 px-4 text-sm font-semibold text-white"
          onClick={stop}
          type="button"
        >
          {status === "starting" ? "Cancel" : "Stop camera"}
        </button>
      )}
    </section>
  );
}
