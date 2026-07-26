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

    stubWindow("/adjust");
    assert.equal(getCurrentPath(), "/adjust");
    assert.deepEqual(getCurrentRoute(), {
      name: "adjust",
      path: "/adjust"
    });

    stubWindow("/consume");
    assert.equal(getCurrentPath(), "/consume");
    assert.deepEqual(getCurrentRoute(), {
      name: "consume",
      path: "/consume"
    });

    stubWindow("/dashboard");
    assert.equal(getCurrentPath(), "/dashboard");
    assert.deepEqual(getCurrentRoute(), {
      name: "dashboard",
      path: "/dashboard"
    });

    stubWindow("/low-stock");
    assert.equal(getCurrentPath(), "/low-stock");
    assert.deepEqual(getCurrentRoute(), {
      name: "low_stock",
      path: "/low-stock"
    });

    stubWindow("/items");
    assert.equal(getCurrentPath(), "/items");
    assert.deepEqual(getCurrentRoute(), {
      name: "items",
      path: "/items"
    });

    stubWindow("/locations");
    assert.equal(getCurrentPath(), "/locations");
    assert.deepEqual(getCurrentRoute(), {
      name: "locations",
      path: "/locations"
    });

    stubWindow("/transfer");
    assert.equal(getCurrentPath(), "/transfer");
    assert.deepEqual(getCurrentRoute(), {
      name: "transfer",
      path: "/transfer"
    });

    stubWindow("/return");
    assert.equal(getCurrentPath(), "/return");
    assert.deepEqual(getCurrentRoute(), {
      name: "return",
      path: "/return"
    });

    stubWindow("/recipes");
    assert.equal(getCurrentPath(), "/recipes");
    assert.deepEqual(getCurrentRoute(), {
      name: "recipes",
      path: "/recipes"
    });

    stubWindow("/tasks");
    assert.equal(getCurrentPath(), "/tasks");
    assert.deepEqual(getCurrentRoute(), {
      name: "tasks",
      path: "/tasks"
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
