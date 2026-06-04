import {
  addCameraScanEvent,
  createCameraScanSession,
  markCameraSessionActive,
  markCameraSessionStopped,
  updateCameraSessionTorch,
  type CameraPermissionState,
  type CameraScanEventInput,
  type CameraScanProcessingResult,
  type CameraScanSession,
  type CameraScanSessionInput,
  type CameraTorchState
} from "../domain/cameraScanning";
import type {
  InventoryBarcode,
  InventoryBarcodeLookupResult,
  InventoryBarcodeScanEvent
} from "../domain/barcode";
import type { InventoryBarcodeLookupService } from "./barcodeLookupService";

export type CameraPermissionAdapter = {
  queryPermission: () => Promise<CameraPermissionState>;
  requestPermission: () => Promise<CameraPermissionState>;
};

export type CameraDeviceAdapter = {
  detectTorch: (session: CameraScanSession) => Promise<CameraTorchState>;
  setTorchEnabled: (session: CameraScanSession, enabled: boolean) => Promise<CameraTorchState>;
  start: (session: CameraScanSession) => Promise<CameraTorchState>;
  stop: (session: CameraScanSession) => Promise<void>;
};

export type CameraScanningClock = {
  now: () => string;
};

export type CameraScanningService = {
  createSession: (input: CameraScanSessionInput) => CameraScanSession;
  detectTorch: (session: CameraScanSession) => Promise<CameraScanSession>;
  processScan: (
    session: CameraScanSession,
    input: CameraScanEventInput
  ) => Promise<CameraScanProcessingResult>;
  queryPermission: () => Promise<CameraPermissionState>;
  requestPermission: () => Promise<CameraPermissionState>;
  setTorchEnabled: (session: CameraScanSession, enabled: boolean) => Promise<CameraScanSession>;
  startSession: (session: CameraScanSession) => Promise<CameraScanSession>;
  stopSession: (session: CameraScanSession) => Promise<CameraScanSession>;
};

const systemClock: CameraScanningClock = {
  now() {
    return new Date().toISOString();
  }
};

function toScanEvent(
  input: CameraScanEventInput,
  barcode: InventoryBarcode
): InventoryBarcodeScanEvent {
  return {
    barcode,
    scannedAt: input.scannedAt
  };
}

function getLookupBarcode(
  result:
    | InventoryBarcodeLookupResult
    | { duplicateOf: InventoryBarcodeScanEvent; status: "duplicate" }
): InventoryBarcode | null {
  if (result.status === "duplicate") {
    return null;
  }

  if (result.status === "invalid") {
    return null;
  }

  return result.barcode;
}

export function createCameraScanningService(options: {
  barcodeLookupService: InventoryBarcodeLookupService;
  cameraDevice: CameraDeviceAdapter;
  clock?: CameraScanningClock;
  permission: CameraPermissionAdapter;
}): CameraScanningService {
  const clock = options.clock ?? systemClock;

  return {
    createSession(input) {
      return createCameraScanSession(input);
    },

    async detectTorch(session) {
      const torch = await options.cameraDevice.detectTorch(session);

      return {
        ...session,
        torch
      };
    },

    async processScan(session, input) {
      if (session.permission !== "granted") {
        return {
          reason: "permission_denied",
          session,
          status: "ignored"
        };
      }

      if (session.status !== "active") {
        return {
          reason: "session_not_active",
          session,
          status: "ignored"
        };
      }

      const lookupResult = await options.barcodeLookupService.lookupScan(session.organizationId, {
        ...input,
        recentScans: session.recentScans
      });
      const barcode = getLookupBarcode(lookupResult);
      const nextSession = barcode
        ? addCameraScanEvent(session, toScanEvent(input, barcode))
        : session;

      return {
        lookupResult,
        session: nextSession,
        status: "processed"
      };
    },

    queryPermission() {
      return options.permission.queryPermission();
    },

    requestPermission() {
      return options.permission.requestPermission();
    },

    async setTorchEnabled(session, enabled) {
      if (session.status !== "active" || !session.torch.supported) {
        return updateCameraSessionTorch(session, false);
      }

      const torch = await options.cameraDevice.setTorchEnabled(session, enabled);

      return {
        ...session,
        torch
      };
    },

    async startSession(session) {
      const permission = await options.permission.requestPermission();

      if (permission !== "granted") {
        return markCameraSessionActive(session, {
          permission,
          startedAt: clock.now(),
          torch: {
            enabled: false,
            supported: false
          }
        });
      }

      const torch = await options.cameraDevice.start(session);

      return markCameraSessionActive(session, {
        permission,
        startedAt: clock.now(),
        torch
      });
    },

    async stopSession(session) {
      if (session.status === "active") {
        await options.cameraDevice.stop(session);
      }

      return markCameraSessionStopped(session, clock.now());
    }
  };
}
