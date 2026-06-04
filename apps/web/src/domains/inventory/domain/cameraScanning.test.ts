import assert from "node:assert/strict";
import { describe, it } from "vitest";

import {
  addCameraScanEvent,
  createCameraScanSession,
  markCameraSessionActive,
  markCameraSessionStopped,
  updateCameraSessionTorch
} from "./cameraScanning";

describe("camera scan session utilities", () => {
  it("creates idle read-only scan sessions", () => {
    const session = createCameraScanSession({
      id: "session-1",
      organizationId: "org-1"
    });

    assert.equal(session.status, "idle");
    assert.equal(session.permission, "unknown");
    assert.equal(session.organizationId, "org-1");
    assert.deepEqual(session.recentScans, []);
    assert.deepEqual(session.torch, {
      enabled: false,
      supported: false
    });
  });

  it("moves sessions through active and stopped lifecycle states immutably", () => {
    const session = createCameraScanSession({
      id: "session-1",
      organizationId: "org-1"
    });
    const activeSession = markCameraSessionActive(session, {
      permission: "granted",
      startedAt: "2026-06-04T08:00:00.000Z",
      torch: {
        enabled: false,
        supported: true
      }
    });
    const stoppedSession = markCameraSessionStopped(activeSession, "2026-06-04T08:01:00.000Z");

    assert.equal(session.status, "idle");
    assert.equal(activeSession.status, "active");
    assert.equal(activeSession.torch.supported, true);
    assert.equal(stoppedSession.status, "stopped");
    assert.equal(stoppedSession.torch.enabled, false);
  });

  it("updates torch only when torch is supported", () => {
    const unsupportedSession = createCameraScanSession({
      id: "session-1",
      organizationId: "org-1"
    });
    const supportedSession = {
      ...unsupportedSession,
      torch: {
        enabled: false,
        supported: true
      }
    };

    assert.equal(updateCameraSessionTorch(unsupportedSession, true).torch.enabled, false);
    assert.equal(updateCameraSessionTorch(supportedSession, true).torch.enabled, true);
  });

  it("tracks recent scan events deterministically", () => {
    const session = createCameraScanSession({
      id: "session-1",
      organizationId: "org-1"
    });
    const updatedSession = addCameraScanEvent(
      addCameraScanEvent(session, {
        barcode: {
          format: "upc_a",
          value: "036000291452"
        },
        scannedAt: "2026-06-04T08:00:00.000Z"
      }),
      {
        barcode: {
          format: "qr",
          value: "KK:ITEM:rice"
        },
        scannedAt: "2026-06-04T08:00:01.000Z"
      }
    );

    assert.deepEqual(
      updatedSession.recentScans.map((scan) => scan.barcode.value),
      ["KK:ITEM:rice", "036000291452"]
    );
  });
});
