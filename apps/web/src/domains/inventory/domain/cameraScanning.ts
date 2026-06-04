import type { EntityId } from "@krishnas-kitchen/types";

import type {
  InventoryBarcodeLookupResult,
  InventoryBarcodeScanEvent,
  InventoryBarcodeScanInput
} from "./barcode";

export type CameraPermissionState = "denied" | "granted" | "prompt" | "unsupported" | "unknown";

export type CameraScanSessionStatus = "active" | "error" | "idle" | "stopped";

export type CameraTorchState = {
  enabled: boolean;
  supported: boolean;
};

export type CameraScanSession = {
  id: EntityId;
  organizationId: EntityId;
  permission: CameraPermissionState;
  recentScans: readonly InventoryBarcodeScanEvent[];
  startedAt: string | null;
  status: CameraScanSessionStatus;
  stoppedAt: string | null;
  torch: CameraTorchState;
};

export type CameraScanSessionInput = {
  id: EntityId;
  organizationId: EntityId;
};

export type CameraScanEventInput = InventoryBarcodeScanInput & {
  scannedAt: string;
};

export type CameraScanIgnoredReason = "permission_denied" | "session_not_active";

export type CameraScanProcessingResult =
  | {
      lookupResult:
        | InventoryBarcodeLookupResult
        | { duplicateOf: InventoryBarcodeScanEvent; status: "duplicate" };
      session: CameraScanSession;
      status: "processed";
    }
  | {
      reason: CameraScanIgnoredReason;
      session: CameraScanSession;
      status: "ignored";
    };

export function createCameraScanSession(input: CameraScanSessionInput): CameraScanSession {
  return {
    id: input.id,
    organizationId: input.organizationId,
    permission: "unknown",
    recentScans: [],
    startedAt: null,
    status: "idle",
    stoppedAt: null,
    torch: {
      enabled: false,
      supported: false
    }
  };
}

export function markCameraSessionActive(
  session: CameraScanSession,
  input: {
    permission: CameraPermissionState;
    startedAt: string;
    torch: CameraTorchState;
  }
): CameraScanSession {
  return {
    ...session,
    permission: input.permission,
    startedAt: input.startedAt,
    status: input.permission === "granted" ? "active" : "error",
    stoppedAt: null,
    torch: input.torch
  };
}

export function markCameraSessionStopped(
  session: CameraScanSession,
  stoppedAt: string
): CameraScanSession {
  return {
    ...session,
    status: "stopped",
    stoppedAt,
    torch: {
      ...session.torch,
      enabled: false
    }
  };
}

export function updateCameraSessionTorch(
  session: CameraScanSession,
  enabled: boolean
): CameraScanSession {
  return {
    ...session,
    torch: {
      ...session.torch,
      enabled: session.torch.supported ? enabled : false
    }
  };
}

export function addCameraScanEvent(
  session: CameraScanSession,
  scan: InventoryBarcodeScanEvent,
  maxRecentScans = 20
): CameraScanSession {
  return {
    ...session,
    recentScans: [scan, ...session.recentScans].slice(0, maxRecentScans)
  };
}
