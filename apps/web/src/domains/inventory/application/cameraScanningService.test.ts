import assert from "node:assert/strict";
import { describe, it } from "vitest";

import type {
  InventoryBarcodeLookupResult,
  InventoryBarcodeScanEvent,
  InventoryBarcodeScanInput
} from "../domain/barcode";
import type { CameraTorchState } from "../domain/cameraScanning";
import type { InventoryBarcodeLookupService } from "./barcodeLookupService";
import {
  createCameraScanningService,
  type CameraDeviceAdapter,
  type CameraPermissionAdapter
} from "./cameraScanningService";

function createPermissionAdapter(
  state: "denied" | "granted" | "prompt" | "unsupported"
): CameraPermissionAdapter {
  return {
    queryPermission() {
      return Promise.resolve(state);
    },
    requestPermission() {
      return Promise.resolve(state);
    }
  };
}

function createCameraDeviceAdapter(
  torch: CameraTorchState = {
    enabled: false,
    supported: true
  }
): CameraDeviceAdapter & {
  started: number;
  stopped: number;
  torchUpdates: boolean[];
} {
  return {
    started: 0,
    stopped: 0,
    torchUpdates: [],
    detectTorch() {
      return Promise.resolve(torch);
    },
    setTorchEnabled(_session, enabled) {
      this.torchUpdates.push(enabled);

      return Promise.resolve({
        enabled,
        supported: torch.supported
      });
    },
    start() {
      this.started += 1;

      return Promise.resolve(torch);
    },
    stop() {
      this.stopped += 1;

      return Promise.resolve();
    }
  };
}

function createBarcodeLookupService(): InventoryBarcodeLookupService & {
  scans: (InventoryBarcodeScanInput & {
    recentScans?: readonly InventoryBarcodeScanEvent[];
    scannedAt: string;
  })[];
} {
  const scans: (InventoryBarcodeScanInput & {
    recentScans?: readonly InventoryBarcodeScanEvent[];
    scannedAt: string;
  })[] = [];
  const foundResult: InventoryBarcodeLookupResult = {
    barcode: {
      format: "upc_a",
      value: "036000291452"
    },
    item: {
      barcodes: [
        {
          format: "upc_a",
          value: "036000291452"
        }
      ],
      defaultUnit: "kg",
      deletedAt: null,
      id: "rice",
      name: "Rice",
      organizationId: "org-1"
    },
    status: "found"
  };

  return {
    scans,
    lookupBarcode() {
      return Promise.resolve(foundResult);
    },
    lookupScan(_organizationId, input) {
      scans.push(input);

      const duplicateOf = input.recentScans?.find((scan) => scan.barcode.value === "036000291452");
      if (duplicateOf) {
        return Promise.resolve({
          duplicateOf,
          status: "duplicate"
        });
      }

      return Promise.resolve(foundResult);
    }
  };
}

const clock = {
  now() {
    return "2026-06-04T08:00:00.000Z";
  }
};

describe("camera scanning service", () => {
  it("starts and stops scan sessions through permission and camera adapters", async () => {
    const cameraDevice = createCameraDeviceAdapter();
    const service = createCameraScanningService({
      barcodeLookupService: createBarcodeLookupService(),
      cameraDevice,
      clock,
      permission: createPermissionAdapter("granted")
    });
    const session = service.createSession({
      id: "camera-session-1",
      organizationId: "org-1"
    });

    const activeSession = await service.startSession(session);
    const stoppedSession = await service.stopSession(activeSession);

    assert.equal(activeSession.status, "active");
    assert.equal(activeSession.permission, "granted");
    assert.equal(activeSession.torch.supported, true);
    assert.equal(stoppedSession.status, "stopped");
    assert.equal(cameraDevice.started, 1);
    assert.equal(cameraDevice.stopped, 1);
  });

  it("does not start camera devices when permission is denied", async () => {
    const cameraDevice = createCameraDeviceAdapter();
    const service = createCameraScanningService({
      barcodeLookupService: createBarcodeLookupService(),
      cameraDevice,
      clock,
      permission: createPermissionAdapter("denied")
    });
    const session = service.createSession({
      id: "camera-session-1",
      organizationId: "org-1"
    });

    const blockedSession = await service.startSession(session);

    assert.equal(blockedSession.status, "error");
    assert.equal(blockedSession.permission, "denied");
    assert.equal(cameraDevice.started, 0);
  });

  it("detects and toggles torch capability through the camera adapter", async () => {
    const cameraDevice = createCameraDeviceAdapter({
      enabled: false,
      supported: true
    });
    const service = createCameraScanningService({
      barcodeLookupService: createBarcodeLookupService(),
      cameraDevice,
      clock,
      permission: createPermissionAdapter("granted")
    });
    const activeSession = await service.startSession(
      service.createSession({
        id: "camera-session-1",
        organizationId: "org-1"
      })
    );

    const detectedSession = await service.detectTorch(activeSession);
    const torchSession = await service.setTorchEnabled(detectedSession, true);

    assert.equal(detectedSession.torch.supported, true);
    assert.equal(torchSession.torch.enabled, true);
    assert.deepEqual(cameraDevice.torchUpdates, [true]);
  });

  it("processes scan events by delegating barcode identification to barcode lookup", async () => {
    const barcodeLookupService = createBarcodeLookupService();
    const service = createCameraScanningService({
      barcodeLookupService,
      cameraDevice: createCameraDeviceAdapter(),
      clock,
      permission: createPermissionAdapter("granted")
    });
    const activeSession = await service.startSession(
      service.createSession({
        id: "camera-session-1",
        organizationId: "org-1"
      })
    );

    const result = await service.processScan(activeSession, {
      format: "upc_a",
      rawValue: "036000291452",
      scannedAt: "2026-06-04T08:00:01.000Z"
    });

    assert.equal(result.status, "processed");
    assert.equal(result.status === "processed" ? result.lookupResult.status : null, "found");
    assert.equal(barcodeLookupService.scans.length, 1);
    assert.equal(result.session.recentScans.length, 1);
  });

  it("integrates duplicate scan suppression through barcode lookup", async () => {
    const barcodeLookupService = createBarcodeLookupService();
    const service = createCameraScanningService({
      barcodeLookupService,
      cameraDevice: createCameraDeviceAdapter(),
      clock,
      permission: createPermissionAdapter("granted")
    });
    const activeSession = await service.startSession(
      service.createSession({
        id: "camera-session-1",
        organizationId: "org-1"
      })
    );
    const firstResult = await service.processScan(activeSession, {
      format: "upc_a",
      rawValue: "036000291452",
      scannedAt: "2026-06-04T08:00:01.000Z"
    });
    const secondResult = await service.processScan(firstResult.session, {
      format: "upc_a",
      rawValue: "036000291452",
      scannedAt: "2026-06-04T08:00:02.000Z"
    });

    assert.equal(secondResult.status, "processed");
    assert.equal(
      secondResult.status === "processed" ? secondResult.lookupResult.status : null,
      "duplicate"
    );
    assert.equal(secondResult.session.recentScans.length, 1);
  });

  it("ignores scan events when sessions are not active", async () => {
    const barcodeLookupService = createBarcodeLookupService();
    const service = createCameraScanningService({
      barcodeLookupService,
      cameraDevice: createCameraDeviceAdapter(),
      permission: createPermissionAdapter("granted")
    });
    const session = service.createSession({
      id: "camera-session-1",
      organizationId: "org-1"
    });

    const result = await service.processScan(session, {
      format: "upc_a",
      rawValue: "036000291452",
      scannedAt: "2026-06-04T08:00:01.000Z"
    });

    assert.equal(result.status, "ignored");
    assert.equal(result.status === "ignored" ? result.reason : null, "permission_denied");
    assert.equal(barcodeLookupService.scans.length, 0);
  });
});
