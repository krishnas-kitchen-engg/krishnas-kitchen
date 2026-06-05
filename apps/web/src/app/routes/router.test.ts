import assert from "node:assert/strict";
import { afterEach, describe, it, vi } from "vitest";

import {
  getCurrentPath,
  getCurrentRoute,
  navigateTo,
  navigateToInventoryItem,
  navigateToInventoryLocation
} from "./router";

function stubWindow(pathname: string) {
  const listeners: Record<string, EventListener[]> = {};
  const windowStub = {
    addEventListener(event: string, listener: EventListener) {
      listeners[event] = [...(listeners[event] ?? []), listener];
    },
    dispatchEvent(event: Event) {
      for (const listener of listeners[event.type] ?? []) {
        listener(event);
      }

      return true;
    },
    history: {
      pushState(_state: unknown, _title: string, path: string) {
        windowStub.location.pathname = path;
      }
    },
    location: {
      pathname
    },
    removeEventListener(event: string, listener: EventListener) {
      listeners[event] = (listeners[event] ?? []).filter((value) => value !== listener);
    }
  };

  vi.stubGlobal("window", windowStub);
  vi.stubGlobal(
    "PopStateEvent",
    class PopStateEvent extends Event {
      constructor(type: string) {
        super(type);
      }
    }
  );

  return windowStub;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("router", () => {
  it("recognizes Phase 1A shell paths", () => {
    stubWindow("/inventory");

    assert.equal(getCurrentPath(), "/inventory");

    stubWindow("/scan");
    assert.equal(getCurrentPath(), "/scan");

    stubWindow("/profile");
    assert.equal(getCurrentPath(), "/profile");

    stubWindow("/receive");
    assert.equal(getCurrentPath(), "/receive");
    assert.deepEqual(getCurrentRoute(), {
      name: "receive",
      path: "/receive"
    });
  });

  it("falls back to home for unknown paths", () => {
    stubWindow("/something-else");

    assert.equal(getCurrentPath(), "/");
  });

  it("navigates through the lightweight router", () => {
    const windowStub = stubWindow("/");

    navigateTo("/profile");

    assert.equal(windowStub.location.pathname, "/profile");
  });

  it("recognizes inventory detail routes", () => {
    stubWindow("/inventory/item/rice");

    assert.deepEqual(getCurrentRoute(), {
      itemId: "rice",
      name: "inventory_item",
      path: "/inventory/item/rice"
    });

    stubWindow("/inventory/location/main%20pantry");

    assert.deepEqual(getCurrentRoute(), {
      locationId: "main pantry",
      name: "inventory_location",
      path: "/inventory/location/main pantry"
    });
  });

  it("navigates to encoded inventory detail routes", () => {
    const windowStub = stubWindow("/");

    navigateToInventoryItem("basmati rice");
    assert.equal(windowStub.location.pathname, "/inventory/item/basmati%20rice");

    navigateToInventoryLocation("main pantry");
    assert.equal(windowStub.location.pathname, "/inventory/location/main%20pantry");
  });
});
