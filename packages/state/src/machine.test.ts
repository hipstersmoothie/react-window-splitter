/**
 * @vitest-environment jsdom
 */

import { expect, test, describe, vi } from "vitest";
import {
  buildTemplate,
  dragHandlePayload,
  getPanelGroupPercentageSizes,
  getPanelGroupPixelSizes,
  getPanelPercentageSize,
  getPanelPixelSize,
  GroupMachineContextValue,
  GroupMachineEvent,
  initializePanel,
  initializePanelHandleData,
  isPanelData,
  isPanelHandle,
  prepareSnapshot,
} from "./index.js";
import Big from "big.js";
import { spring } from "framer-motion";
import * as Cookies from "tiny-cookie";
import { Actor, createActor } from "./test-utils.js";

function dragHandle(
  actor: Actor,
  options: {
    delta: number;
    orientation?: "horizontal" | "vertical";
    id: string;
    shiftKey?: boolean;
  },
) {
  for (let i = 0; i < Math.abs(options.delta); i++) {
    actor.send({
      type: "dragHandle",
      handleId: options.id,
      value: dragHandlePayload({
        orientation: options.orientation,
        delta: options.delta > 0 ? 1 : -1,
        shiftKey: options.shiftKey,
      }),
    });
  }
}

function sendAll(actor: Actor, events: GroupMachineEvent[]) {
  for (const event of events) {
    actor.send(event);
  }
}

function capturePixelValues(actor: Actor, cb: () => void) {
  const firstHandle = actor.value.items.find((i) => isPanelHandle(i));

  if (firstHandle) {
    actor.send({ type: "dragHandleStart", handleId: firstHandle.id });
  }

  cb();

  if (firstHandle) {
    actor.send({ type: "dragHandleEnd", handleId: firstHandle.id });
  }
}

function waitForIdle(actor: Actor) {
  return new Promise<void>((resolve) => {
    setInterval(() => {
      if (actor.state.current === "idle") {
        resolve();
      }
    }, 100);
  });
}

function initializeSizes(
  actor: Actor,
  options: {
    width: number;
    height: number;
  },
) {
  const context = actor.value;
  const { orientation, items } = context;
  const template = buildTemplate(context);
  const div = document.createElement("div");

  div.style.width = `${options.width}px`;
  div.style.height = `${options.height}px`;
  div.style.display = "grid";
  div.id = "group";

  if (orientation === "horizontal") {
    div.style.gridTemplateColumns = template;
  } else {
    div.style.gridTemplateRows = template;
  }

  for (let i = 0; i < items.length; i++) {
    div.appendChild(document.createElement("div"));
  }

  document.body.appendChild(div);

  const childrenSizes: Record<string, { width: number; height: number }> = {};

  div.childNodes.forEach((node, index) => {
    const item = items[index];

    if (node instanceof HTMLElement && item) {
      const rect = node.getBoundingClientRect();

      childrenSizes[item.id] = {
        width: rect.width,
        height: rect.height,
      };
    }
  });

  actor.send({
    type: "setSize",
    size: { width: options.width, height: options.height },
  });
  actor.send({
    type: "setActualItemsSize",
    childrenSizes,
  });
}

describe("constraints", () => {
  test("works with 2 simple panels - horizontal", () => {
    const actor = createActor({ groupId: "group" });

    sendAll(actor, [
      { type: "registerPanel", data: initializePanel({ id: "panel-1" }) },
      {
        type: "registerPanelHandle",
        data: initializePanelHandleData({ id: "resizer-1", size: "10px" }),
      },
      { type: "registerPanel", data: initializePanel({ id: "panel-2" }) },
    ]);

    expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
      `"minmax(0px, 1fr) 10px minmax(0px, 1fr)"`,
    );
    initializeSizes(actor, { width: 500, height: 200 });

    // Drag the resizer to the right
    capturePixelValues(actor, () => {
      expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
        `"245px 10px 245px"`,
      );
      dragHandle(actor, { id: "resizer-1", delta: 10 });
      expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
        `"255px 10px 235px"`,
      );
    });

    expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
      `"minmax(0px, 1fr) 10px minmax(0px, min(calc(0.47959183673469387755 * (100% - 10px)), 100%))"`,
    );

    // Drag the resizer to the left
    capturePixelValues(actor, () => {
      expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
        `"255px 10px 235px"`,
      );
      dragHandle(actor, { id: "resizer-1", delta: -20 });
      expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
        `"235px 10px 255px"`,
      );
    });

    expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
      `"minmax(0px, 1fr) 10px minmax(0px, min(calc(0.52040816326530612245 * (100% - 10px)), 100%))"`,
    );
  });

  test("works with 2 simple panels - overshot flakiness", () => {
    const actor = createActor({ groupId: "group" });

    sendAll(actor, [
      {
        type: "registerPanel",
        data: initializePanel({ id: "panel-1" }),
      },
      {
        type: "registerPanelHandle",
        data: initializePanelHandleData({ id: "resizer-1", size: "10px" }),
      },
      { type: "registerPanel", data: initializePanel({ id: "panel-2" }) },
    ]);

    expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
      `"minmax(0px, 1fr) 10px minmax(0px, 1fr)"`,
    );
    initializeSizes(actor, { width: 500, height: 200 });

    // The only way i could simulate the leftoverSpace was to set the size
    // during a drag
    capturePixelValues(actor, () => {
      actor.send({
        type: "setSize",
        size: {
          width: 600,
          height: 200,
        },
      });
      actor.send({
        type: "dragHandle",
        handleId: "resizer-1",
        value: dragHandlePayload({
          delta: 30,
        }),
      });
    });

    expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
      `"minmax(0px, 1fr) 10px minmax(0px, min(calc(0.53389830508474576271 * (100% - 10px)), 100%))"`,
    );
  });

  test("works with 2 simple panels - max percents", () => {
    const actor = createActor({ groupId: "group" });

    sendAll(actor, [
      {
        type: "registerPanel",
        data: initializePanel({ id: "panel-1", max: "40%" }),
      },
      {
        type: "registerPanelHandle",
        data: initializePanelHandleData({ id: "resizer-1", size: "10px" }),
      },
      { type: "registerPanel", data: initializePanel({ id: "panel-2" }) },
    ]);

    expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
      `"minmax(0px, 40%) 10px minmax(0px, 1fr)"`,
    );
    initializeSizes(actor, { width: 500, height: 200 });

    // Drag the resizer to the right
    capturePixelValues(actor, () => {
      dragHandle(actor, { id: "resizer-1", delta: 10 });
    });

    expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
      `"minmax(0px, min(calc(0.40816326530612244898 * (100% - 10px)), 40%)) 10px minmax(0px, 1fr)"`,
    );
  });

  test("works with 2 simple panels - vertical", () => {
    const actor = createActor({ orientation: "vertical", groupId: "group" });

    sendAll(actor, [
      { type: "registerPanel", data: initializePanel({ id: "panel-1" }) },
      {
        type: "registerPanelHandle",
        data: initializePanelHandleData({ id: "resizer-1", size: "10px" }),
      },
      { type: "registerPanel", data: initializePanel({ id: "panel-2" }) },
    ]);

    expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
      `"minmax(0px, 1fr) 10px minmax(0px, 1fr)"`,
    );
    initializeSizes(actor, { width: 200, height: 500 });

    // Drag the resizer down
    capturePixelValues(actor, () => {
      expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
        `"245px 10px 245px"`,
      );
      dragHandle(actor, {
        id: "resizer-1",
        delta: 10,
        orientation: "vertical",
      });
      expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
        `"255px 10px 235px"`,
      );
    });

    expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
      `"minmax(0px, 1fr) 10px minmax(0px, min(calc(0.47959183673469387755 * (100% - 10px)), 100%))"`,
    );

    // Drag the resizer to the up
    capturePixelValues(actor, () => {
      expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
        `"255px 10px 235px"`,
      );
      dragHandle(actor, {
        id: "resizer-1",
        delta: -20,
        orientation: "vertical",
      });
      expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
        `"235px 10px 255px"`,
      );
    });

    expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
      `"minmax(0px, 1fr) 10px minmax(0px, min(calc(0.52040816326530612245 * (100% - 10px)), 100%))"`,
    );
  });

  test("doesn't register a panel with the same id twice", () => {
    const actor = createActor({
      groupId: "group",
      items: [initializePanel({ id: "panel-1" })],
    });

    actor.send({
      type: "registerPanel",
      data: initializePanel({ id: "panel-1" }),
    });

    expect(actor.value.items).toHaveLength(1);
  });

  test("works with 2 simple panels as input", () => {
    const actor = createActor({
      groupId: "group",
      items: [
        initializePanel({ id: "panel-1" }),
        initializePanelHandleData({ id: "resizer-1", size: "10px" }),
        initializePanel({ id: "panel-2" }),
      ],
    });

    expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
      `"minmax(0px, 1fr) 10px minmax(0px, 1fr)"`,
    );
    initializeSizes(actor, { width: 500, height: 200 });

    capturePixelValues(actor, () => {
      expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
        `"245px 10px 245px"`,
      );
    });
  });

  test("can spy on resize", () => {
    const spy = vi.fn();
    const actor = createActor({
      groupId: "group",
      items: [
        initializePanel({ id: "panel-1", onResize: { current: spy } }),
        initializePanelHandleData({ id: "resizer-1", size: "10px" }),
        initializePanel({ id: "panel-2" }),
      ],
    });

    initializeSizes(actor, { width: 500, height: 200 });
    expect(spy).toHaveBeenCalledWith({
      percentage: 0.49,
      pixel: 245,
    });

    capturePixelValues(actor, () => {
      dragHandle(actor, { id: "resizer-1", delta: 100 });
      expect(spy).toHaveBeenCalledWith({
        pixel: 345,
        percentage: 0.69,
      });
    });
  });

  test("no delta does nothing", () => {
    const actor = createActor({
      groupId: "group",
      items: [
        initializePanel({ id: "panel-1" }),
        initializePanelHandleData({ id: "resizer-1", size: "10px" }),
        initializePanel({ id: "panel-2" }),
      ],
    });
    initializeSizes(actor, { width: 500, height: 200 });

    capturePixelValues(actor, () => {
      expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
        `"245px 10px 245px"`,
      );
      actor.send({
        type: "dragHandle",
        handleId: "resizer-1",
        value: dragHandlePayload({ delta: 0 }),
      });
      expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
        `"245px 10px 245px"`,
      );
    });
  });

  test("shift key makes it drag more", () => {
    const actor = createActor({
      groupId: "group",
      items: [
        initializePanel({ id: "panel-1" }),
        initializePanelHandleData({ id: "resizer-1", size: "10px" }),
        initializePanel({ id: "panel-2" }),
      ],
    });
    initializeSizes(actor, { width: 500, height: 200 });

    capturePixelValues(actor, () => {
      expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
        `"245px 10px 245px"`,
      );
      dragHandle(actor, { id: "resizer-1", delta: -1, shiftKey: true });
      expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
        `"230px 10px 260px"`,
      );
    });
  });

  test("works with percentages", () => {
    const actor = createActor({
      groupId: "group",
      items: [
        initializePanel({ id: "panel-1", min: "40%" }),
        initializePanelHandleData({ id: "resizer-1", size: "10px" }),
        initializePanel({ id: "panel-2", min: "10%", default: "30%" }),
      ],
    });

    expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
      `"minmax(40%, 1fr) 10px 30%"`,
    );
    initializeSizes(actor, { width: 500, height: 200 });

    capturePixelValues(actor, () => {
      expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
        `"340px 10px 150px"`,
      );
      dragHandle(actor, { id: "resizer-1", delta: -200 });
      expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
        `"200px 10px 290px"`,
      );
    });
  });

  test("supports max", () => {
    const actor = createActor({
      groupId: "group",
      items: [
        initializePanel({ id: "panel-1", max: "90%" }),
        initializePanelHandleData({ id: "resizer-1", size: "10px" }),
        initializePanel({ id: "panel-2", default: "30%" }),
      ],
    });

    expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
      `"minmax(0px, 90%) 10px minmax(30%, 1fr)"`,
    );
    initializeSizes(actor, { width: 500, height: 200 });

    capturePixelValues(actor, () => {
      dragHandle(actor, { id: "resizer-1", delta: 500 });
      expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
        `"450px 10px 40px"`,
      );
    });
  });

  // Test for https://github.com/hipstersmoothie/window-splitter/issues/79
  // The bug: applyDelta in togglingCollapse state calls updateLayout without
  // ensuring items are in pixel format first. If items somehow end up in
  // percentage format during the animation, it fails.
  test("applyDelta should handle percentage format items during animation", async () => {
    const actor = createActor({ groupId: "group" });

    sendAll(actor, [
      { type: "registerPanel", data: initializePanel({ id: "panel-1" }) },
      {
        type: "registerPanelHandle",
        data: initializePanelHandleData({ id: "resizer-1", size: "10px" }),
      },
      {
        type: "registerPanel",
        data: initializePanel({
          id: "panel-2",
          collapsible: true,
          min: "100px",
          default: "200px",
          collapseAnimation: {
            easing: "ease-in-out",
            duration: 5000, // Long animation so we can intercept
          },
        }),
      },
    ]);

    initializeSizes(actor, { width: 500, height: 200 });

    // Start the collapse animation - this transitions to togglingCollapse
    actor.send({
      type: "collapsePanel",
      panelId: "panel-2",
    });

    // Wait a tick for the animation to start
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Verify we're in togglingCollapse state
    expect(actor.state.current).toBe("togglingCollapse");

    // Now simulate a scenario where items got back into percentage format
    // (e.g., from autosave restoration or some edge case)
    const groupSize = 500;
    const staticWidth = 10;
    const availableSpace = groupSize - staticWidth;

    for (const item of actor.value.items) {
      if (isPanelData(item) && !item.collapsed) {
        const pixelValue = item.currentValue.value.toNumber();
        item.currentValue = {
          type: "percent",
          value: new Big(pixelValue).div(availableSpace),
        };
      }
    }

    // Send an applyDelta event - this is what the animation actor sends
    // Before the fix, this should throw because updateLayout is called
    // with percentage items
    actor.send({
      type: "applyDelta",
      handleId: "resizer-1",
      panelId: "panel-2",
      delta: 10,
    });

    await waitForIdle(actor);
  });

  describe("direct-DOM animation path (getGroupElement)", () => {
    function setupCollapsibleActor(
      groupEl: HTMLElement,
      onUpdate?: (context: GroupMachineContextValue) => void,
    ) {
      return createActor({ groupId: "group" }, onUpdate, () => groupEl);
    }

    function registerCollapsibleLayout(actor: Actor) {
      sendAll(actor, [
        {
          type: "registerPanel",
          data: initializePanel({ id: "panel-1" }),
        },
        {
          type: "registerPanelHandle",
          data: initializePanelHandleData({ id: "resizer-1", size: "10px" }),
        },
        {
          type: "registerPanel",
          data: initializePanel({
            id: "panel-2",
            collapsible: true,
            min: "100px",
            default: "200px",
            collapseAnimation: {
              easing: "ease-in-out",
              duration: 5000, // Long animation so we can intercept mid-flight
            },
          }),
        },
      ]);

      initializeSizes(actor, { width: 500, height: 200 });
    }

    test("applyDelta writes grid template directly to the DOM element when getGroupElement is provided", async () => {
      const groupEl = document.createElement("div");
      groupEl.style.display = "grid";
      document.body.appendChild(groupEl);

      const actor = setupCollapsibleActor(groupEl);
      registerCollapsibleLayout(actor);

      const templateBefore = groupEl.style.gridTemplateColumns;

      actor.send({ type: "collapsePanel", panelId: "panel-2" });
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(actor.state.current).toBe("togglingCollapse");

      const templateAfter = groupEl.style.gridTemplateColumns;
      expect(templateAfter).toBeTruthy();
      expect(templateAfter).not.toEqual(templateBefore);

      await waitForIdle(actor);
      document.body.removeChild(groupEl);
    });

    test("onUpdate is NOT called during applyDelta when getGroupElement returns an element", async () => {
      const groupEl = document.createElement("div");
      document.body.appendChild(groupEl);

      let updateCount = 0;
      const actor = setupCollapsibleActor(groupEl, () => {
        updateCount++;
      });
      registerCollapsibleLayout(actor);

      actor.send({ type: "collapsePanel", panelId: "panel-2" });
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(actor.state.current).toBe("togglingCollapse");
      // The collapsePanel event itself fires onUpdate (transition + prepare),
      // but the per-frame applyDelta events do NOT.
      const updatesAfterAnimationStarted = updateCount;

      await new Promise((resolve) => setTimeout(resolve, 50));
      expect(actor.state.current).toBe("togglingCollapse");
      expect(updateCount).toBe(updatesAfterAnimationStarted);

      await waitForIdle(actor);
      document.body.removeChild(groupEl);
    });

    test("collapsePanel does not fire onUpdate when getGroupElement is provided (frame-0 hitch)", async () => {
      const groupEl = document.createElement("div");
      groupEl.style.display = "grid";
      document.body.appendChild(groupEl);

      let updateCount = 0;
      const actor = setupCollapsibleActor(groupEl, () => {
        updateCount++;
      });
      registerCollapsibleLayout(actor);

      const updatesBeforeCollapse = updateCount;

      actor.send({ type: "collapsePanel", panelId: "panel-2" });

      expect(actor.state.current).toBe("togglingCollapse");
      // Neither transition() nor send()'s trailing onUpdate should fire —
      // otherwise React commits + Layout runs before frame 1 of the animation.
      expect(updateCount).toBe(updatesBeforeCollapse);

      // DOM template must be written synchronously so the animation actor
      // starts against pixel-form values.
      expect(groupEl.style.gridTemplateColumns).toBeTruthy();

      await waitForIdle(actor);
      document.body.removeChild(groupEl);
    });

    test("onUpdate IS called after animation ends (final sync)", async () => {
      const groupEl = document.createElement("div");
      document.body.appendChild(groupEl);

      let updateCount = 0;
      const actor = setupCollapsibleActor(groupEl, () => {
        updateCount++;
      });

      // Short animation so it completes quickly
      sendAll(actor, [
        {
          type: "registerPanel",
          data: initializePanel({ id: "panel-1" }),
        },
        {
          type: "registerPanelHandle",
          data: initializePanelHandleData({ id: "resizer-1", size: "10px" }),
        },
        {
          type: "registerPanel",
          data: initializePanel({
            id: "panel-2",
            collapsible: true,
            min: "100px",
            default: "200px",
            collapseAnimation: {
              easing: "linear",
              duration: 50,
            },
          }),
        },
      ]);
      initializeSizes(actor, { width: 500, height: 200 });

      actor.send({ type: "collapsePanel", panelId: "panel-2" });
      await waitForIdle(actor);

      expect(actor.state.current).toBe("idle");
      expect(updateCount).toBeGreaterThan(0);

      document.body.removeChild(groupEl);
    });

    test("behavior unchanged when getGroupElement is omitted (onUpdate fires per frame)", async () => {
      let updateCount = 0;
      const actor = createActor({ groupId: "group" }, () => {
        updateCount++;
      });

      sendAll(actor, [
        {
          type: "registerPanel",
          data: initializePanel({ id: "panel-1" }),
        },
        {
          type: "registerPanelHandle",
          data: initializePanelHandleData({ id: "resizer-1", size: "10px" }),
        },
        {
          type: "registerPanel",
          data: initializePanel({
            id: "panel-2",
            collapsible: true,
            min: "100px",
            default: "200px",
            collapseAnimation: {
              easing: "ease-in-out",
              duration: 5000,
            },
          }),
        },
      ]);
      initializeSizes(actor, { width: 500, height: 200 });

      const updatesBeforeAnimation = updateCount;

      actor.send({ type: "collapsePanel", panelId: "panel-2" });
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(actor.state.current).toBe("togglingCollapse");
      expect(updateCount).toBeGreaterThan(updatesBeforeAnimation);

      await waitForIdle(actor);
    });

    test("onResize still fires each frame during applyDelta", async () => {
      const groupEl = document.createElement("div");
      document.body.appendChild(groupEl);

      let resizeCount = 0;
      const actor = createActor(
        { groupId: "group" },
        () => {},
        () => groupEl,
      );

      sendAll(actor, [
        {
          type: "registerPanel",
          data: initializePanel({
            id: "panel-1",
          }),
        },
        {
          type: "registerPanelHandle",
          data: initializePanelHandleData({ id: "resizer-1", size: "10px" }),
        },
        {
          type: "registerPanel",
          data: initializePanel({
            id: "panel-2",
            collapsible: true,
            min: "100px",
            default: "200px",
            collapseAnimation: {
              easing: "ease-in-out",
              duration: 5000,
            },
            onResize: {
              current: () => {
                resizeCount++;
              },
            },
          }),
        },
      ]);
      initializeSizes(actor, { width: 500, height: 200 });

      actor.send({ type: "collapsePanel", panelId: "panel-2" });
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(actor.state.current).toBe("togglingCollapse");
      expect(resizeCount).toBeGreaterThan(0);

      await waitForIdle(actor);
      document.body.removeChild(groupEl);
    });
  });

  test("overflow measurements should not collapse panels during animation", async () => {
    const actor = createActor({ groupId: "group" });

    sendAll(actor, [
      {
        type: "registerPanel",
        data: initializePanel({
          id: "panel-1",
          collapsible: true,
          collapsedSize: "60px",
          default: "140px",
        }),
      },
      {
        type: "registerPanelHandle",
        data: initializePanelHandleData({ id: "resizer-1", size: "10px" }),
      },
      {
        type: "registerPanel",
        data: initializePanel({
          id: "panel-2",
          collapsible: true,
          default: "140px",
          collapseAnimation: {
            easing: "ease-in-out",
            duration: 500,
          },
        }),
      },
    ]);

    actor.send({
      type: "setSize",
      size: { width: 300, height: 200 },
    });
    actor.send({
      type: "setActualItemsSize",
      childrenSizes: {
        "panel-1": { width: 140, height: 200 },
        "panel-2": { width: 140, height: 200 },
      },
    });

    const panelBefore = actor.value.items.find(
      (item) => isPanelData(item) && item.id === "panel-1",
    );
    expect(panelBefore?.collapsed).toBe(false);

    actor.send({
      type: "collapsePanel",
      panelId: "panel-2",
    });

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(actor.state.current).toBe("togglingCollapse");

    actor.send({
      type: "setActualItemsSize",
      childrenSizes: {
        "panel-1": { width: 200, height: 200 },
        "panel-2": { width: 200, height: 200 },
      },
    });

    const panelAfter = actor.value.items.find(
      (item) => isPanelData(item) && item.id === "panel-1",
    );
    expect(panelAfter?.collapsed).toBe(false);

    await waitForIdle(actor);
  });

  test("supports 1 panel being collapsed with another panel expanding to fill", () => {
    const actor = createActor({
      groupId: "group",
      items: [
        initializePanel({ id: "panel-1", default: "200px", min: "200px" }),
        initializePanelHandleData({ id: "resizer-1", size: "10px" }),
        initializePanel({
          id: "panel-2",
          min: "200px",
          collapsible: true,
          collapsedSize: "60px",
          defaultCollapsed: true,
        }),
      ],
    });

    expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
      `"minmax(200px, 1fr) 10px 60px"`,
    );
  });

  test("sibling collapsible panels work", async () => {
    const onCollapseChange = (isCollapsed: boolean) => {
      if (isCollapsed) {
        actor.send({
          type: "collapsePanel",
          panelId: "panel-1",
          controlled: true,
        });
      } else {
        actor.send({
          type: "expandPanel",
          panelId: "panel-1",
          controlled: true,
        });
      }
    };

    const actor = createActor({
      groupId: "group",
      items: [
        initializePanel({
          id: "panel-1",
          default: "200px",
          min: "100px",
          collapsible: true,
          collapsed: false,
          onCollapseChange: { current: onCollapseChange },
        }),
        initializePanelHandleData({ id: "resizer-1", size: "10px" }),
        initializePanel({
          id: "panel-2",
          default: "200px",
          min: "100px",
          collapsible: true,
        }),
        initializePanelHandleData({ id: "resizer-2", size: "10px" }),
        initializePanel({
          id: "panel-3",
          min: "200px",
          collapsible: true,
          collapsedSize: "60px",
        }),
      ],
    });

    initializeSizes(actor, { width: 800, height: 200 });

    capturePixelValues(actor, () => {
      // First collapse both panels
      expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
        `"200px 10px 200px 10px 380px"`,
      );
      dragHandle(actor, { id: "resizer-2", delta: -410 });
      expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
        `"0px 10px 0px 10px 780px"`,
      );
    });

    actor.send({
      type: "expandPanel",
      panelId: "panel-1",
      controlled: true,
    });
    await waitForIdle(actor);

    capturePixelValues(actor, () => {
      expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
        `"100px 10px 0px 10px 680px"`,
      );
    });
  });

  test("controlled collapse complex drags", async () => {
    const onCollapseChange = (panelId: string) => (isCollapsed: boolean) => {
      if (isCollapsed) {
        actor.send({
          type: "collapsePanel",
          panelId,
          controlled: true,
        });
      } else {
        actor.send({ type: "expandPanel", panelId, controlled: true });
      }
    };

    const onChange1 = onCollapseChange("panel-1");
    const onChange2 = onCollapseChange("panel-2");
    const onChange3 = onCollapseChange("panel-3");

    const actor = createActor({
      groupId: "group",
      items: [
        initializePanel({
          id: "panel-1",
          default: "200px",
          min: "100px",
          collapsible: true,
          collapsed: false,
          onCollapseChange: { current: onChange1 },
        }),
        initializePanelHandleData({ id: "resizer-1", size: "10px" }),
        initializePanel({
          id: "panel-2",
          default: "200px",
          min: "100px",
          collapsible: true,
          onCollapseChange: { current: onChange2 },
        }),
        initializePanelHandleData({ id: "resizer-2", size: "10px" }),
        initializePanel({
          id: "panel-3",
          min: "100px",
          collapsible: true,
          onCollapseChange: { current: onChange3 },
        }),
      ],
    });

    initializeSizes(actor, { width: 800, height: 200 });

    // Collapse middle panel from the left
    capturePixelValues(actor, () => {
      expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
        `"200px 10px 200px 10px 380px"`,
      );
      dragHandle(actor, { id: "resizer-1", delta: 200 });
      expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
        `"450px 10px 0px 10px 330px"`,
      );
      dragHandle(actor, { id: "resizer-1", delta: -200 });
      expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
        `"249px 10px 201px 10px 330px"`,
      );
    });

    // Collapse middle panel from the right
    capturePixelValues(actor, () => {
      dragHandle(actor, { id: "resizer-2", delta: -200 });
      expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
        `"200px 10px 0px 10px 580px"`,
      );
      dragHandle(actor, { id: "resizer-2", delta: 200 });
      expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
        `"200px 10px 201px 10px 379px"`,
      );
    });

    // Collapse the left panel
    capturePixelValues(actor, () => {
      dragHandle(actor, { id: "resizer-1", delta: -200 });
      expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
        `"0px 10px 401px 10px 379px"`,
      );
      dragHandle(actor, { id: "resizer-1", delta: 200 });
      expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
        `"150px 10px 251px 10px 379px"`,
      );
    });

    // Collapse the right panel
    capturePixelValues(actor, () => {
      dragHandle(actor, { id: "resizer-2", delta: 600 });
      expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
        `"150px 10px 630px 10px 0px"`,
      );
      dragHandle(actor, { id: "resizer-2", delta: -600 });
      expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
        `"150px 10px 300px 10px 330px"`,
      );
    });

    // Sweep the left handle to the right
    capturePixelValues(actor, () => {
      dragHandle(actor, { id: "resizer-1", delta: 1000 });
      expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
        `"780px 10px 0px 10px 0px"`,
      );
    });

    // Sweep the right handle to the left
    capturePixelValues(actor, () => {
      dragHandle(actor, { id: "resizer-2", delta: -1000 });
      expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
        `"0px 10px 0px 10px 780px"`,
      );
    });
  });

  test("controlled collapse events", async () => {
    const onCollapseChange = (panelId: string) => (isCollapsed: boolean) => {
      if (isCollapsed) {
        actor.send({
          type: "collapsePanel",
          panelId,
          controlled: true,
        });
      } else {
        actor.send({ type: "expandPanel", panelId, controlled: true });
      }
    };

    const onChange1 = onCollapseChange("panel-1");
    const onChange2 = onCollapseChange("panel-2");
    const onChange3 = onCollapseChange("panel-3");

    const actor = createActor({
      groupId: "group",
      items: [
        initializePanel({
          id: "panel-1",
          default: "200px",
          min: "100px",
          collapsible: true,
          collapsed: false,
          onCollapseChange: { current: onChange1 },
        }),
        initializePanelHandleData({ id: "resizer-1", size: "10px" }),
        initializePanel({
          id: "panel-2",
          default: "200px",
          min: "100px",
          collapsible: true,
          collapsed: false,
          onCollapseChange: { current: onChange2 },
        }),
        initializePanelHandleData({ id: "resizer-2", size: "10px" }),
        initializePanel({
          id: "panel-3",
          min: "100px",
          collapsible: true,
          collapsed: false,
          onCollapseChange: { current: onChange3 },
        }),
      ],
    });

    initializeSizes(actor, { width: 800, height: 200 });

    capturePixelValues(actor, () => {
      expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
        `"200px 10px 200px 10px 380px"`,
      );
    });

    actor.send({ type: "collapsePanel", panelId: "panel-2", controlled: true });
    await waitForIdle(actor);
    capturePixelValues(actor, () => {
      expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
        `"200px 10px 0px 10px 580px"`,
      );
    });

    actor.send({ type: "collapsePanel", panelId: "panel-3", controlled: true });
    await waitForIdle(actor);
    capturePixelValues(actor, () => {
      expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
        `"780px 10px 0px 10px 0px"`,
      );
    });

    actor.send({ type: "expandPanel", panelId: "panel-2", controlled: true });
    await waitForIdle(actor);
    capturePixelValues(actor, () => {
      expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
        `"580px 10px 200px 10px 0px"`,
      );
    });

    actor.send({ type: "expandPanel", panelId: "panel-3", controlled: true });
    await waitForIdle(actor);
    capturePixelValues(actor, () => {
      expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
        `"100px 10px 0px 10px 680px"`,
      );
    });
  });

  test("panel can have a min", () => {
    const actor = createActor({ groupId: "group" });

    sendAll(actor, [
      { type: "registerPanel", data: initializePanel({ id: "panel-1" }) },
      {
        type: "registerPanelHandle",
        data: initializePanelHandleData({ id: "resizer-1", size: "10px" }),
      },
      {
        type: "registerPanel",
        data: initializePanel({ id: "panel-2", min: "100px" }),
      },
    ]);

    expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
      `"minmax(0px, 1fr) 10px minmax(100px, 1fr)"`,
    );
    initializeSizes(actor, { width: 500, height: 200 });

    capturePixelValues(actor, () => {
      expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
        `"245px 10px 245px"`,
      );
      dragHandle(actor, { id: "resizer-1", delta: 200 });
      expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
        `"390px 10px 100px"`,
      );
    });
  });

  test("panel can have a max", () => {
    const actor = createActor({ groupId: "group" });

    sendAll(actor, [
      { type: "registerPanel", data: initializePanel({ id: "panel-1" }) },
      {
        type: "registerPanelHandle",
        data: initializePanelHandleData({ id: "resizer-1", size: "10px" }),
      },
      {
        type: "registerPanel",
        data: initializePanel({ id: "panel-2", max: "300px" }),
      },
    ]);

    expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
      `"minmax(0px, 1fr) 10px minmax(0px, 300px)"`,
    );
    initializeSizes(actor, { width: 500, height: 200 });

    // Drag the resizer to the right

    capturePixelValues(actor, () => {
      expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
        `"190px 10px 300px"`,
      );
      dragHandle(actor, { id: "resizer-1", delta: -200 });
      expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
        `"190px 10px 300px"`,
      );
    });
  });

  test("panel can have a default size", () => {
    const actor = createActor({ groupId: "group" });

    sendAll(actor, [
      { type: "registerPanel", data: initializePanel({ id: "panel-1" }) },
      {
        type: "registerPanelHandle",
        data: initializePanelHandleData({ id: "resizer-1", size: "10px" }),
      },
      {
        type: "registerPanel",
        data: initializePanel({ id: "panel-2", default: "300px" }),
      },
    ]);
    initializeSizes(actor, { width: 500, height: 200 });

    expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
      `"minmax(0px, 1fr) 10px 300px"`,
    );

    capturePixelValues(actor, () => {
      expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
        `"190px 10px 300px"`,
      );
    });
  });

  test("dragging eats space from multiple panels in front of it", () => {
    const actor = createActor({ groupId: "group" });

    sendAll(actor, [
      { type: "registerPanel", data: initializePanel({ id: "panel-1" }) },
      {
        type: "registerPanelHandle",
        data: initializePanelHandleData({ id: "resizer-1", size: "10px" }),
      },
      {
        type: "registerPanel",
        data: initializePanel({
          id: "panel-2",
          min: "200px",
          default: "300px",
        }),
      },
      {
        type: "registerPanelHandle",
        data: initializePanelHandleData({ id: "resizer-2", size: "10px" }),
      },
      {
        type: "registerPanel",
        data: initializePanel({ id: "panel-3", min: "100px" }),
      },
    ]);

    initializeSizes(actor, { width: 500, height: 200 });

    capturePixelValues(actor, () => {
      expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
        `"80px 10px 300px 10px 100px"`,
      );
      dragHandle(actor, { id: "resizer-1", delta: 160 });
      expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
        `"180px 10px 200px 10px 100px"`,
      );
    });
  });

  test("can set a panel's size", () => {
    const actor = createActor({
      groupId: "group",
      items: [
        initializePanel({ id: "panel-1" }),
        initializePanelHandleData({ id: "resizer-1", size: "10px" }),
        initializePanel({ id: "panel-2" }),
      ],
    });
    initializeSizes(actor, { width: 500, height: 200 });

    actor.send({
      type: "setPanelPixelSize",
      panelId: "panel-1",
      size: "100px",
    });

    capturePixelValues(actor, () => {
      expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
        `"100px 10px 390px"`,
      );
    });

    actor.send({
      type: "setPanelPixelSize",
      panelId: "panel-1",
      size: "25%",
    });

    capturePixelValues(actor, () => {
      expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
        `"125px 10px 365px"`,
      );
    });
  });

  test("can update orientation at runtime", () => {
    const actor = createActor({ groupId: "group" });

    sendAll(actor, [
      { type: "registerPanel", data: initializePanel({ id: "panel-1" }) },
      {
        type: "registerPanelHandle",
        data: initializePanelHandleData({ id: "resizer-1", size: "10px" }),
      },
      { type: "registerPanel", data: initializePanel({ id: "panel-2" }) },
    ]);

    initializeSizes(actor, { width: 500, height: 200 });

    capturePixelValues(actor, () => {
      expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
        `"245px 10px 245px"`,
      );
    });

    actor.send({ type: "setOrientation", orientation: "vertical" });

    capturePixelValues(actor, () => {
      expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
        `"95px 10px 95px"`,
      );
    });
  });
});

describe("collapsible panel", () => {
  const springAnimation = spring({
    keyframes: [0, 1],
    velocity: 1,
    stiffness: 100,
    damping: 10,
    mass: 1.0,
  });
  const springEasing = (t: number) => springAnimation.next(t * 1000).value;

  test.each([
    undefined,
    "ease-in-out" as const,
    "bounce" as const,
    { duration: 500, easing: "linear" as const },
    { duration: 1000, easing: springEasing },
  ])("panel can be collapsible: %s", async (animation) => {
    const actor = createActor({ groupId: "group" });

    sendAll(actor, [
      { type: "registerPanel", data: initializePanel({ id: "panel-1" }) },
      {
        type: "registerPanelHandle",
        data: initializePanelHandleData({ id: "resizer-1", size: "10px" }),
      },
      {
        type: "registerPanel",
        data: initializePanel({
          id: "panel-2",
          collapsible: true,
          min: "100px",
          collapseAnimation: animation,
        }),
      },
    ]);

    expect(buildTemplate(actor.value)).toBe(
      "minmax(0px, 1fr) 10px minmax(100px, 1fr)",
    );
    initializeSizes(actor, { width: 500, height: 200 });

    // Test dragging to collapse the panel
    capturePixelValues(actor, () => {
      expect(buildTemplate(actor.value)).toBe("245px 10px 245px");

      // Drag into the drag buffer but not past it
      dragHandle(actor, { id: "resizer-1", delta: 160 });
      expect(buildTemplate(actor.value)).toBe("390px 10px 100px");

      // Drag past the drag buffer and collapse the panel
      dragHandle(actor, { id: "resizer-1", delta: 100 });
      expect(buildTemplate(actor.value)).toBe("490px 10px 0px");
    });

    expect(buildTemplate(actor.value)).toBe("minmax(0px, 1fr) 10px 0px");

    // Test dragging to expand the panel
    capturePixelValues(actor, () => {
      expect(buildTemplate(actor.value)).toBe("490px 10px 0px");

      // Stays collapsed in the buffer
      dragHandle(actor, { id: "resizer-1", delta: -30 });
      expect(buildTemplate(actor.value)).toBe("490px 10px 0px");

      // Opens once the buffer is cleared
      dragHandle(actor, { id: "resizer-1", delta: -20 });
      expect(buildTemplate(actor.value)).toBe("390px 10px 100px");
    });

    actor.send({ type: "collapsePanel", panelId: "panel-2" });
    await waitForIdle(actor);

    capturePixelValues(actor, () => {
      expect(buildTemplate(actor.value)).toBe("490px 10px 0px");
    });
  });

  test("throws when you collapse a panel and there are no handles", async () => {
    const actor = createActor({
      groupId: "group",
      items: [initializePanel({ id: "panel-1" })],
    });

    initializeSizes(actor, { width: 500, height: 200 });

    try {
      actor.send({ type: "collapsePanel", panelId: "panel-1" });
    } catch (e) {
      expect(e).toBeInstanceOf(Error);
      expect((e as Error).message).toBe("Cant find handle for panel: panel-1");
    }
  });

  test("collapsible panel can have collapsed size - right", async () => {
    const actor = createActor({ groupId: "group" });

    sendAll(actor, [
      { type: "registerPanel", data: initializePanel({ id: "panel-1" }) },
      {
        type: "registerPanelHandle",
        data: initializePanelHandleData({ id: "resizer-1", size: "10px" }),
      },
      {
        type: "registerPanel",
        data: initializePanel({
          id: "panel-2",
          collapsible: true,
          defaultCollapsed: true,
          min: "200px",
          collapsedSize: "60px",
        }),
      },
    ]);

    expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
      `"minmax(0px, 1fr) 10px 60px"`,
    );
    initializeSizes(actor, { width: 500, height: 200 });

    capturePixelValues(actor, () => {
      expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
        `"430px 10px 60px"`,
      );

      // Drag into the the panel
      dragHandle(actor, { id: "resizer-1", delta: 50 });
      expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
        `"430px 10px 60px"`,
      );

      // Drag into the start
      dragHandle(actor, { id: "resizer-1", delta: -50 });
      expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
        `"430px 10px 60px"`,
      );

      // Drag into the drag buffer but not past it
      dragHandle(actor, { id: "resizer-1", delta: -25 });
      expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
        `"430px 10px 60px"`,
      );

      // Drag past the buffer
      dragHandle(actor, { id: "resizer-1", delta: -25 });
      expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
        `"290px 10px 200px"`,
      );
    });
  });

  test("non collapsible panels should have drag overflow too", async () => {
    const actor = createActor({ groupId: "group" });

    sendAll(actor, [
      { type: "registerPanel", data: initializePanel({ id: "panel-1" }) },
      {
        type: "registerPanelHandle",
        data: initializePanelHandleData({ id: "resizer-1", size: "10px" }),
      },
      {
        type: "registerPanel",
        data: initializePanel({
          id: "panel-2",
          default: "200px",
          min: "200px",
        }),
      },
    ]);

    expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
      `"minmax(0px, 1fr) 10px 200px"`,
    );
    initializeSizes(actor, { width: 500, height: 200 });

    capturePixelValues(actor, () => {
      expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
        `"290px 10px 200px"`,
      );

      // Drag into the the panel
      dragHandle(actor, { id: "resizer-1", delta: 50 });
      expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
        `"290px 10px 200px"`,
      );

      // Drag into the start
      dragHandle(actor, { id: "resizer-1", delta: -50 });
      expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
        `"290px 10px 200px"`,
      );

      // Drag into the drag buffer but not past it
      dragHandle(actor, { id: "resizer-1", delta: -25 });
      expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
        `"265px 10px 225px"`,
      );
    });
  });

  test("can expand default collapsed panel via event", async () => {
    const actor = createActor({ groupId: "group" });

    sendAll(actor, [
      { type: "registerPanel", data: initializePanel({ id: "panel-1" }) },
      {
        type: "registerPanelHandle",
        data: initializePanelHandleData({ id: "resizer-1", size: "10px" }),
      },
      {
        type: "registerPanel",
        data: initializePanel({
          id: "panel-2",
          collapsible: true,
          defaultCollapsed: true,
          min: "200px",
          collapsedSize: "60px",
        }),
      },
    ]);

    initializeSizes(actor, { width: 500, height: 200 });
    actor.send({ type: "expandPanel", panelId: "panel-2" });
    await waitForIdle(actor);

    capturePixelValues(actor, () => {
      expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
        `"290px 10px 200px"`,
      );
    });
  });

  test("collapsible panel can have collapsed size - left", async () => {
    const actor = createActor({ groupId: "group" });

    sendAll(actor, [
      {
        type: "registerPanel",
        data: initializePanel({
          id: "panel-2",
          collapsible: true,
          defaultCollapsed: true,
          min: "200px",
          collapsedSize: "60px",
        }),
      },
      {
        type: "registerPanelHandle",
        data: initializePanelHandleData({ id: "resizer-1", size: "10px" }),
      },
      { type: "registerPanel", data: initializePanel({ id: "panel-1" }) },
    ]);

    expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
      `"60px 10px minmax(0px, 1fr)"`,
    );
    initializeSizes(actor, { width: 500, height: 200 });

    capturePixelValues(actor, () => {
      expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
        `"60px 10px 430px"`,
      );

      // Drag into the the panel
      dragHandle(actor, { id: "resizer-1", delta: -50 });
      expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
        `"60px 10px 430px"`,
      );

      // Drag to the start
      dragHandle(actor, { id: "resizer-1", delta: 50 });
      expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
        `"60px 10px 430px"`,
      );

      // Drag into the drag buffer but not past it
      dragHandle(actor, { id: "resizer-1", delta: 25 });
      expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
        `"60px 10px 430px"`,
      );

      // Drag past the buffer
      dragHandle(actor, { id: "resizer-1", delta: 25 });
      expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
        `"200px 10px 290px"`,
      );
    });
  });

  test("collapsible remembers last position", async () => {
    const actor = createActor({ groupId: "group" });

    sendAll(actor, [
      { type: "registerPanel", data: initializePanel({ id: "panel-1" }) },
      {
        type: "registerPanelHandle",
        data: initializePanelHandleData({ id: "resizer-1", size: "10px" }),
      },
      {
        type: "registerPanel",
        data: initializePanel({
          id: "panel-2",
          collapsible: true,
          min: "200px",
          collapsedSize: "60px",
        }),
      },
    ]);

    initializeSizes(actor, { width: 500, height: 200 });

    capturePixelValues(actor, () => {
      expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
        `"245px 10px 245px"`,
      );
      dragHandle(actor, { id: "resizer-1", delta: -50 });
      expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
        `"195px 10px 295px"`,
      );
    });

    actor.send({ type: "collapsePanel", panelId: "panel-2" });
    await waitForIdle(actor);

    capturePixelValues(actor, () => {
      expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
        `"430px 10px 60px"`,
      );
    });

    actor.send({ type: "expandPanel", panelId: "panel-2" });
    await waitForIdle(actor);

    capturePixelValues(actor, () => {
      expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
        `"195px 10px 295px"`,
      );
    });
  });

  test("panel can collapse can subscribe to collapsed state", () => {
    const actor = createActor({ groupId: "group" });

    const spy = vi.fn();

    sendAll(actor, [
      { type: "registerPanel", data: initializePanel({ id: "panel-1" }) },
      {
        type: "registerPanelHandle",
        data: initializePanelHandleData({ id: "resizer-1", size: "10px" }),
      },
      {
        type: "registerPanel",
        data: initializePanel({
          id: "panel-2",
          collapsible: true,
          min: "100px",
          onCollapseChange: {
            current: spy,
          },
        }),
      },
    ]);

    expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
      `"minmax(0px, 1fr) 10px minmax(100px, 1fr)"`,
    );
    initializeSizes(actor, { width: 500, height: 200 });

    // collapse the panel
    capturePixelValues(actor, () => {
      expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
        `"245px 10px 245px"`,
      );

      // Drag into the drag buffer but not past it
      dragHandle(actor, { id: "resizer-1", delta: 160 });
      expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
        `"390px 10px 100px"`,
      );

      // Drag past the drag buffer and collapse the panel
      dragHandle(actor, { id: "resizer-1", delta: 100 });
      expect(spy).toHaveBeenCalledWith(true);
      expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
        `"490px 10px 0px"`,
      );
    });

    spy.mockReset();

    // expand the panel
    capturePixelValues(actor, () => {
      // The panel doesn't actually expand yet
      dragHandle(actor, { id: "resizer-1", delta: -150 });
      expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
        `"290px 10px 200px"`,
      );

      expect(spy).toHaveBeenCalledWith(false);
      expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
        `"290px 10px 200px"`,
      );

      // Actually collapse the panel
      actor.send({
        type: "expandPanel",
        panelId: "panel-2",
        controlled: true,
      });
      expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
        `"290px 10px 200px"`,
      );
    });
  });

  test("should be able to trigger collapse/expand via event", async () => {
    const actor = createActor({ groupId: "group" });

    sendAll(actor, [
      { type: "registerPanel", data: initializePanel({ id: "panel-1" }) },
      {
        type: "registerPanelHandle",
        data: initializePanelHandleData({ id: "resizer-1", size: "10px" }),
      },
      {
        type: "registerPanel",
        data: initializePanel({
          id: "panel-2",
          collapsible: true,
          min: "100px",
          default: "100px",
        }),
      },
    ]);

    expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
      `"minmax(0px, 1fr) 10px 100px"`,
    );
    initializeSizes(actor, { width: 500, height: 200 });

    capturePixelValues(actor, () => {
      expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
        `"390px 10px 100px"`,
      );
    });

    actor.send({ type: "collapsePanel", panelId: "panel-2" });
    await waitForIdle(actor);

    capturePixelValues(actor, () => {
      expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
        `"490px 10px 0px"`,
      );
    });

    actor.send({ type: "expandPanel", panelId: "panel-2" });
    await waitForIdle(actor);

    capturePixelValues(actor, () => {
      expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
        `"390px 10px 100px"`,
      );
    });
  });

  test("panel collapse can be controlled", async () => {
    const actor = createActor({ groupId: "group" });

    const spy = vi.fn();

    sendAll(actor, [
      { type: "registerPanel", data: initializePanel({ id: "panel-1" }) },
      {
        type: "registerPanelHandle",
        data: initializePanelHandleData({ id: "resizer-1", size: "10px" }),
      },
      {
        type: "registerPanel",
        data: initializePanel({
          id: "panel-2",
          collapsible: true,
          min: "100px",
          // This marks the collapse as controlled
          collapsed: false,
          collapsedSize: "20px",
          onCollapseChange: {
            current: spy,
          },
        }),
      },
    ]);

    expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
      `"minmax(0px, 1fr) 10px minmax(100px, 1fr)"`,
    );
    initializeSizes(actor, { width: 500, height: 200 });

    // collapse the panel via drag
    capturePixelValues(actor, () => {
      expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
        `"245px 10px 245px"`,
      );

      dragHandle(actor, { id: "resizer-1", delta: 160 });
      expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
        `"390px 10px 100px"`,
      );

      // The panel doesn't actually collapse yet
      dragHandle(actor, { id: "resizer-1", delta: 100 });
      expect(spy).toHaveBeenCalledWith(true);
      expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
        `"390px 10px 100px"`,
      );

      // Actually collapse the panel
      actor.send({
        type: "collapsePanel",
        panelId: "panel-2",
        controlled: true,
      });
      expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
        `"470px 10px 20px"`,
      );
    });

    spy.mockReset();

    // expand the panel via drag
    capturePixelValues(actor, () => {
      // The panel doesn't actually expand yet
      dragHandle(actor, { id: "resizer-1", delta: -150 });
      expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
        `"470px 10px 20px"`,
      );

      expect(spy).toHaveBeenCalledWith(false);
      expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
        `"470px 10px 20px"`,
      );

      // Actually collapse the panel
      actor.send({
        type: "expandPanel",
        panelId: "panel-2",
        controlled: true,
      });
      expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
        `"321px 10px 169px"`,
      );
    });

    spy.mockReset();

    // Sending controlled events works

    actor.send({ type: "collapsePanel", panelId: "panel-2", controlled: true });
    await waitForIdle(actor);

    // collapse the panel via drag
    capturePixelValues(actor, () => {
      expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
        `"470px 10px 20px"`,
      );
    });

    actor.send({ type: "expandPanel", panelId: "panel-2", controlled: true });
    await waitForIdle(actor);

    // collapse the panel via drag
    capturePixelValues(actor, () => {
      expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
        `"321px 10px 169px"`,
      );
    });
  });

  test("panel collapse can be controlled - event", async () => {
    const actor = createActor({ groupId: "group" });

    const spy = vi.fn();

    sendAll(actor, [
      { type: "registerPanel", data: initializePanel({ id: "panel-1" }) },
      {
        type: "registerPanelHandle",
        data: initializePanelHandleData({ id: "resizer-1", size: "10px" }),
      },
      {
        type: "registerPanel",
        data: initializePanel({
          id: "panel-2",
          collapsible: true,
          min: "100px",
          // This marks the collapse as controlled
          collapsed: false,
          collapsedSize: "20px",
          onCollapseChange: {
            current: spy,
          },
        }),
      },
    ]);

    expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
      `"minmax(0px, 1fr) 10px minmax(100px, 1fr)"`,
    );
    initializeSizes(actor, { width: 500, height: 200 });

    // COLLAPSE

    // An uncontrolled event doesn't collapse the panel, it only calls the onCollapseChange
    actor.send({ type: "collapsePanel", panelId: "panel-2" });
    expect(spy).toHaveBeenCalledWith(true);
    await waitForIdle(actor);
    capturePixelValues(actor, () => {
      expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
        `"245px 10px 245px"`,
      );
    });
    spy.mockReset();

    // Sending controlled events works
    actor.send({ type: "collapsePanel", panelId: "panel-2", controlled: true });
    // and doesn't call the onCollapseChange
    expect(spy).not.toHaveBeenCalled();
    await waitForIdle(actor);
    capturePixelValues(actor, () => {
      expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
        `"470px 10px 20px"`,
      );
    });

    // EXPAND

    // An uncontrolled event doesn't expand the panel, it only calls the onCollapseChange
    actor.send({ type: "expandPanel", panelId: "panel-2" });
    expect(spy).toHaveBeenCalledWith(false);
    await waitForIdle(actor);
    capturePixelValues(actor, () => {
      expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
        `"470px 10px 20px"`,
      );
    });
    spy.mockReset();

    // Sending controlled events works
    actor.send({ type: "expandPanel", panelId: "panel-2", controlled: true });
    // and doesn't call the onCollapseChange
    expect(spy).not.toHaveBeenCalled();
    await waitForIdle(actor);
    capturePixelValues(actor, () => {
      expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
        `"245px 10px 245px"`,
      );
    });
  });

  describe("constraints", () => {
    test("on render", async () => {
      const actor = createActor({ groupId: "group" });

      sendAll(actor, [
        {
          type: "registerPanel",
          data: initializePanel({ id: "panel-1", min: "200px" }),
        },
        {
          type: "registerPanelHandle",
          data: initializePanelHandleData({ id: "resizer-1", size: "10px" }),
        },
        {
          type: "registerPanel",
          data: initializePanel({
            id: "panel-2",
            collapsible: true,
            min: "300px",
            collapsedSize: "60px",
          }),
        },
      ]);

      expect(buildTemplate(actor.value)).toBe(
        "minmax(200px, 1fr) 10px minmax(300px, 1fr)",
      );
      initializeSizes(actor, { width: 400, height: 200 });
      // There wasn't enough space to render the panel so the last one is collapsed
      expect(buildTemplate(actor.value)).toBe("minmax(200px, 1fr) 10px 60px");
    });

    test("on resize", async () => {
      const actor = createActor({ groupId: "group" });

      sendAll(actor, [
        {
          type: "registerPanel",
          data: initializePanel({ id: "panel-1", min: "200px" }),
        },
        {
          type: "registerPanelHandle",
          data: initializePanelHandleData({ id: "resizer-1", size: "10px" }),
        },
        {
          type: "registerPanel",
          data: initializePanel({
            id: "panel-2",
            collapsible: true,
            min: "300px",
            collapsedSize: "60px",
          }),
        },
      ]);

      expect(buildTemplate(actor.value)).toBe(
        "minmax(200px, 1fr) 10px minmax(300px, 1fr)",
      );
      initializeSizes(actor, { width: 510, height: 200 });

      capturePixelValues(actor, () => {
        dragHandle(actor, { id: "resizer-1", delta: 10 });
      });

      expect(buildTemplate(actor.value)).toBe(
        "minmax(200px, 1fr) 10px minmax(300px, min(calc(0.6 * (100% - 10px)), 100%))",
      );

      initializeSizes(actor, { width: 400, height: 200 });

      // There wasn't enough space to render the panel so the last one is collapsed
      expect(buildTemplate(actor.value)).toBe("minmax(200px, 1fr) 10px 60px");
    });

    test("cannot expand panel via event", async () => {
      const actor = createActor({ groupId: "group" });

      sendAll(actor, [
        {
          type: "registerPanel",
          data: initializePanel({ id: "panel-1", min: "200px" }),
        },
        {
          type: "registerPanelHandle",
          data: initializePanelHandleData({ id: "resizer-1", size: "10px" }),
        },
        {
          type: "registerPanel",
          data: initializePanel({
            id: "panel-2",
            collapsible: true,
            min: "300px",
            collapsedSize: "60px",
          }),
        },
      ]);

      expect(buildTemplate(actor.value)).toBe(
        "minmax(200px, 1fr) 10px minmax(300px, 1fr)",
      );
      initializeSizes(actor, { width: 400, height: 200 });
      actor.send({
        type: "setSize",
        size: { width: 400, height: 200 },
      });
      // There wasn't enough space to render the panel so the last one is collapsed
      expect(buildTemplate(actor.value)).toBe("minmax(200px, 1fr) 10px 60px");

      actor.send({
        type: "expandPanel",
        panelId: "panel-2",
      });
      await waitForIdle(actor);

      // There wasn't enough space to render the panel so the last one is collapsed
      expect(buildTemplate(actor.value)).toBe("minmax(200px, 1fr) 10px 60px");
    });

    test("cannot expand panel via drag", async () => {
      const actor = createActor({ groupId: "group" });

      sendAll(actor, [
        {
          type: "registerPanel",
          data: initializePanel({ id: "panel-1", min: "200px" }),
        },
        {
          type: "registerPanelHandle",
          data: initializePanelHandleData({ id: "resizer-1", size: "10px" }),
        },
        {
          type: "registerPanel",
          data: initializePanel({
            id: "panel-2",
            collapsible: true,
            min: "300px",
            collapsedSize: "60px",
          }),
        },
      ]);

      expect(buildTemplate(actor.value)).toBe(
        "minmax(200px, 1fr) 10px minmax(300px, 1fr)",
      );
      initializeSizes(actor, { width: 400, height: 200 });

      // There wasn't enough space to render the panel so the last one is collapsed
      expect(buildTemplate(actor.value)).toBe("minmax(200px, 1fr) 10px 60px");

      // update the latest sizes to the new ones
      initializeSizes(actor, { width: 400, height: 200 });

      // Drag the resizer to the right
      capturePixelValues(actor, () => {
        expect(buildTemplate(actor.value)).toBe("330px 10px 60px");
        dragHandle(actor, { id: "resizer-1", delta: -400 });
        expect(buildTemplate(actor.value)).toBe("330px 10px 60px");
      });
    });
  });
});

describe("conditional panel", () => {
  test("panel can be conditionally rendered", () => {
    const actor = createActor({ groupId: "group" });

    sendAll(actor, [
      { type: "registerPanel", data: initializePanel({ id: "panel-1" }) },
      {
        type: "registerPanelHandle",
        data: initializePanelHandleData({ id: "resizer-1", size: "10px" }),
      },
      { type: "registerPanel", data: initializePanel({ id: "panel-2" }) },
    ]);

    initializeSizes(actor, { width: 500, height: 200 });

    capturePixelValues(actor, () => {
      expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
        `"245px 10px 245px"`,
      );
    });

    sendAll(actor, [
      {
        type: "registerPanelHandle",
        data: initializePanelHandleData({ id: "resizer-2", size: "10px" }),
      },
      {
        type: "registerDynamicPanel",
        data: initializePanel({ id: "panel-3", min: "100px" }),
      },
    ]);

    capturePixelValues(actor, () => {
      expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
        `"245px 10px 135px 10px 100px"`,
      );
    });

    sendAll(actor, [
      { type: "unregisterPanelHandle", id: "resizer-2" },
      { type: "unregisterPanel", id: "panel-3" },
    ]);

    capturePixelValues(actor, () => {
      expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
        `"245px 10px 245px"`,
      );
    });
  });

  test("collapsed panel can be conditionally rendered", () => {
    const actor = createActor({ groupId: "group" });

    sendAll(actor, [
      { type: "registerPanel", data: initializePanel({ id: "panel-1" }) },
      {
        type: "registerPanelHandle",
        data: initializePanelHandleData({ id: "resizer-1", size: "10px" }),
      },
      {
        type: "registerPanel",
        data: initializePanel({ id: "panel-2" }),
      },
    ]);

    initializeSizes(actor, { width: 500, height: 200 });

    capturePixelValues(actor, () => {
      expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
        `"245px 10px 245px"`,
      );
    });

    sendAll(actor, [
      {
        type: "registerPanelHandle",
        data: initializePanelHandleData({ id: "resizer-2", size: "10px" }),
      },
      {
        type: "registerDynamicPanel",
        data: initializePanel({
          id: "panel-3",
          min: "100px",
          collapsible: true,
          defaultCollapsed: true,
        }),
      },
    ]);

    capturePixelValues(actor, () => {
      expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
        `"245px 10px 235px 10px 0px"`,
      );
    });

    sendAll(actor, [
      { type: "unregisterPanelHandle", id: "resizer-2" },
      { type: "unregisterPanel", id: "panel-3" },
    ]);

    capturePixelValues(actor, () => {
      expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
        `"245px 10px 245px"`,
      );
    });
  });

  test("panel can be conditionally rendered at default width", () => {
    const actor = createActor({ groupId: "group" });

    sendAll(actor, [
      { type: "registerPanel", data: initializePanel({ id: "panel-1" }) },
      {
        type: "registerPanelHandle",
        data: initializePanelHandleData({ id: "resizer-1", size: "10px" }),
      },
      {
        type: "registerPanel",
        data: initializePanel({ id: "panel-2" }),
      },
    ]);

    initializeSizes(actor, { width: 500, height: 200 });

    capturePixelValues(actor, () => {
      expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
        `"245px 10px 245px"`,
      );
    });

    sendAll(actor, [
      {
        type: "registerPanelHandle",
        data: initializePanelHandleData({ id: "resizer-2", size: "10px" }),
      },
      {
        type: "registerDynamicPanel",
        data: initializePanel({
          id: "panel-3",
          default: "125px",
        }),
      },
    ]);

    capturePixelValues(actor, () => {
      expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
        `"245px 10px 110px 10px 125px"`,
      );
    });

    sendAll(actor, [
      { type: "unregisterPanelHandle", id: "resizer-2" },
      { type: "unregisterPanel", id: "panel-3" },
    ]);

    capturePixelValues(actor, () => {
      expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
        `"245px 10px 245px"`,
      );
    });
  });

  test("panel can be conditionally rendered w/order", () => {
    const actor = createActor({ groupId: "group" });

    sendAll(actor, [
      { type: "registerPanel", data: initializePanel({ id: "panel-1" }) },
      {
        type: "registerPanelHandle",
        data: initializePanelHandleData({ id: "resizer-1", size: "10px" }),
      },
      { type: "registerPanel", data: initializePanel({ id: "panel-2" }) },
    ]);

    initializeSizes(actor, { width: 500, height: 200 });

    capturePixelValues(actor, () => {
      expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
        `"245px 10px 245px"`,
      );
    });

    sendAll(actor, [
      {
        type: "registerPanelHandle",
        data: initializePanelHandleData({
          id: "resizer-2",
          size: "10px",
          order: 1,
        }),
      },
      {
        type: "registerDynamicPanel",
        data: {
          ...initializePanel({ id: "panel-3", min: "100px" }),
          order: 2,
        },
      },
    ]);

    capturePixelValues(actor, () => {
      expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
        `"245px 10px 100px 10px 135px"`,
      );
    });

    sendAll(actor, [
      { type: "unregisterPanelHandle", id: "resizer-2" },
      { type: "unregisterPanel", id: "panel-3" },
    ]);

    capturePixelValues(actor, () => {
      expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
        `"245px 10px 245px"`,
      );
    });

    sendAll(actor, [
      { type: "unregisterPanelHandle", id: "resizer-2" },
      { type: "unregisterPanel", id: "panel-3" },
    ]);

    capturePixelValues(actor, () => {
      expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
        `"245px 10px 245px"`,
      );
    });
  });

  test("distributes space on both sides of dynamic panel as needed", async () => {
    const actor = createActor({
      groupId: "group",
      items: [
        initializePanel({ id: "panel-1", max: "20px" }),
        initializePanelHandleData({ id: "resizer-1", size: "10px" }),
        initializePanel({ id: "panel-2", default: "10px", max: "50px" }),
        initializePanelHandleData({ id: "resizer-2", size: "10px" }),
        initializePanel({ id: "panel-3", default: "300px" }),
        initializePanelHandleData({ id: "resizer-3", size: "10px" }),
        initializePanel({ id: "panel-4", default: "10px", max: "50px" }),
        initializePanelHandleData({ id: "resizer-4", size: "10px" }),
        initializePanel({ id: "panel-5", max: "300px" }),
      ],
    });

    initializeSizes(actor, { width: 500, height: 200 });

    capturePixelValues(actor, () => {
      expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
        `"20px 10px 10px 10px 300px 10px 10px 10px 120px"`,
      );
    });

    sendAll(actor, [
      { type: "unregisterPanelHandle", id: "resizer-2" },
      { type: "unregisterPanel", id: "panel-3" },
    ]);

    capturePixelValues(actor, () => {
      expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
        `"20px 10px 50px 10px 50px 10px 300px"`,
      );
    });
  });
});

describe("errors", () => {
  test("throws for invalid units", () => {
    const actor = createActor({ groupId: "group" });

    expect(() =>
      actor.send({
        type: "registerPanel",
        // @ts-expect-error Testing the error
        data: initializePanel({ id: "panel-1", min: "40fr" }),
      }),
    ).toThrowErrorMatchingInlineSnapshot(`[Error: Invalid unit: 40fr]`);
  });

  test("throws when using invalid panel IDs", () => {
    const spy = vi.fn();
    const actor = createActor({ groupId: "group" }, spy);

    actor.send({
      type: "registerPanel",
      data: initializePanel({ id: "panel-1" }),
    });

    try {
      actor.send({
        type: "setPanelPixelSize",
        panelId: "panel-2",
        size: "100px",
      });
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toBe("Expected panel with id: panel-2");
    }
  });

  test("throws when using invalid handle IDs", () => {
    const spy = vi.fn();
    const actor = createActor({ groupId: "group" }, spy);

    try {
      sendAll(actor, [
        { type: "registerPanel", data: initializePanel({ id: "handle-2" }) },
        { type: "dragHandleStart", handleId: "handle-2" },
        {
          type: "dragHandle",
          handleId: "handle-2",
          value: dragHandlePayload({ delta: 100 }),
        },
      ]);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toBe(
        "Expected panel handle with id: handle-2",
      );
    }
  });
});

describe("utils", async () => {
  test("getPanelGroupPixelSizes", () => {
    const actor = createActor({ groupId: "group" });

    sendAll(actor, [
      { type: "registerPanel", data: initializePanel({ id: "panel-1" }) },
      {
        type: "registerPanelHandle",
        data: initializePanelHandleData({ id: "resizer-1", size: "10px" }),
      },
      {
        type: "registerPanel",
        data: initializePanel({ id: "panel-2", max: "300px" }),
      },
    ]);

    initializeSizes(actor, { width: 500, height: 200 });

    expect(getPanelGroupPixelSizes(actor.value)).toEqual([190, 10, 300]);
  });

  test("getPanelGroupPercentageSizes", () => {
    const actor = createActor({ groupId: "group" });

    sendAll(actor, [
      { type: "registerPanel", data: initializePanel({ id: "panel-1" }) },
      {
        type: "registerPanelHandle",
        data: initializePanelHandleData({ id: "resizer-1", size: "10px" }),
      },
      {
        type: "registerPanel",
        data: initializePanel({ id: "panel-2", max: "300px" }),
      },
    ]);

    initializeSizes(actor, { width: 500, height: 200 });

    expect(getPanelGroupPercentageSizes(actor.value)).toEqual([
      0.3877551020408163, 0.02, 0.6122448979591837,
    ]);
  });

  test("getPanelPercentageSize", () => {
    const actor = createActor({ groupId: "group" });

    sendAll(actor, [
      { type: "registerPanel", data: initializePanel({ id: "panel-1" }) },
      {
        type: "registerPanelHandle",
        data: initializePanelHandleData({ id: "resizer-1", size: "10px" }),
      },
      {
        type: "registerPanel",
        data: initializePanel({ id: "panel-2", max: "300px" }),
      },
    ]);

    initializeSizes(actor, { width: 500, height: 200 });

    expect(getPanelPercentageSize(actor.value, "panel-2")).toBe(0.6);
  });

  test("getPanelPixelSize", () => {
    const actor = createActor({ groupId: "group" });

    sendAll(actor, [
      { type: "registerPanel", data: initializePanel({ id: "panel-1" }) },
      {
        type: "registerPanelHandle",
        data: initializePanelHandleData({ id: "resizer-1", size: "10px" }),
      },
      {
        type: "registerPanel",
        data: initializePanel({ id: "panel-2", max: "300px" }),
      },
    ]);

    initializeSizes(actor, { width: 500, height: 200 });

    expect(getPanelPixelSize(actor.value, "panel-2")).toBe(300);
  });

  test("prepareSnapshot", () => {
    const actor = createActor({ groupId: "group" });

    sendAll(actor, [
      {
        type: "registerPanel",
        data: initializePanel({ id: "panel-1", min: "100px" }),
      },
      {
        type: "registerPanelHandle",
        data: initializePanelHandleData({ id: "resizer-1", size: "10px" }),
      },
      {
        type: "registerPanel",
        data: initializePanel({
          id: "panel-2",
          max: "300px",
          collapsible: true,
          collapsedSize: "50px",
        }),
      },
    ]);

    initializeSizes(actor, { width: 500, height: 200 });

    let oldSnapshot = { ...actor.value };
    let serialized = JSON.stringify(oldSnapshot);
    let newSnapshot = prepareSnapshot(JSON.parse(serialized));

    expect(newSnapshot).toMatchSnapshot();

    capturePixelValues(actor, () => {
      dragHandle(actor, { id: "resizer-1", delta: 100 });
    });

    oldSnapshot = { ...actor.value };
    serialized = JSON.stringify(oldSnapshot);
    newSnapshot = prepareSnapshot(JSON.parse(serialized));

    expect(newSnapshot).toMatchSnapshot();
  });
});

describe("static at rest", () => {
  test("a panel can be pixels when resting", async () => {
    const actor = createActor({
      groupId: "group",
      items: [
        initializePanel({
          id: "panel-1",
          min: "20px",
          max: "200px",
          isStaticAtRest: true,
        }),
        initializePanelHandleData({ id: "resizer-1", size: "10px" }),
        initializePanel({ id: "panel-2", min: "50px" }),
        initializePanelHandleData({ id: "resizer-2", size: "10px" }),
        initializePanel({ id: "panel-3", min: "50px" }),
      ],
    });

    initializeSizes(actor, { width: 500, height: 200 });

    expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
      `"minmax(20px, 200px) 10px minmax(50px, 1fr) 10px minmax(50px, 1fr)"`,
    );

    capturePixelValues(actor, () => {
      dragHandle(actor, { id: "resizer-1", delta: -10 });
    });

    expect(buildTemplate(actor.value)).toMatchInlineSnapshot(
      `"clamp(20px, 190px, 200px) 10px minmax(50px, 1fr) 10px minmax(50px, min(calc(0.48275862068965517241 * (100% - 210px)), 100%))"`,
    );
  });
});

describe("autosave", () => {
  test("localStorage", async () => {
    localStorage.removeItem("group");

    const actor = createActor({
      groupId: "group",
      autosaveStrategy: "localStorage",
      items: [
        initializePanel({
          id: "panel-1",
          min: "20px",
          max: "200px",
          isStaticAtRest: true,
        }),
        initializePanelHandleData({ id: "resizer-1", size: "10px" }),
        initializePanel({ id: "panel-2", min: "50px" }),
        initializePanelHandleData({ id: "resizer-2", size: "10px" }),
        initializePanel({ id: "panel-3", min: "50px" }),
      ],
    });

    initializeSizes(actor, { width: 500, height: 200 });

    capturePixelValues(actor, () => {
      dragHandle(actor, { id: "resizer-1", delta: -10 });
    });

    await waitForIdle(actor);

    const snapshot = prepareSnapshot(
      JSON.parse(localStorage.getItem("group")!),
    );
    const actor2 = createActor(snapshot!);

    expect(buildTemplate(actor2.value)).toMatchInlineSnapshot(
      `"clamp(20px, 190px, 200px) 10px minmax(50px, 1fr) 10px minmax(50px, min(calc(0.48275862068965517241 * (100% - 210px)), 100%))"`,
    );
  });

  test("cookie", async () => {
    localStorage.removeItem("group");

    const actor = createActor({
      groupId: "group-2",
      autosaveStrategy: "cookie",
      items: [
        initializePanel({
          id: "panel-1",
          min: "20px",
          max: "200px",
          isStaticAtRest: true,
        }),
        initializePanelHandleData({ id: "resizer-1", size: "10px" }),
        initializePanel({ id: "panel-2", min: "50px" }),
        initializePanelHandleData({ id: "resizer-2", size: "10px" }),
        initializePanel({ id: "panel-3", min: "50px" }),
      ],
    });

    initializeSizes(actor, { width: 500, height: 200 });

    capturePixelValues(actor, () => {
      dragHandle(actor, { id: "resizer-1", delta: -10 });
    });

    await waitForIdle(actor);

    const snapshot = prepareSnapshot(JSON.parse(Cookies.get("group-2")!));
    const actor2 = createActor(snapshot!);

    expect(buildTemplate(actor2.value)).toMatchInlineSnapshot(
      `"clamp(20px, 190px, 200px) 10px minmax(50px, 1fr) 10px minmax(50px, min(calc(0.48275862068965517241 * (100% - 210px)), 100%))"`,
    );
  });
});

describe("browser zoom", () => {
  test("template stays responsive (minmax/calc) after browser zoom causes sub-pixel overflow", () => {
    // Regression test: when browser zoom is active, ResizeObserver reports
    // fractional CSS pixel values. The sum of panel lastKnownSizes + configured
    // handle size can exceed the group size by < 1px, which previously caused
    // handleOverflow to leave items in pixel mode, locking the template into
    // fixed pixel values instead of the responsive minmax/calc format.
    const actor = createActor({ groupId: "group" });

    sendAll(actor, [
      { type: "registerPanel", data: initializePanel({ id: "panel-1" }) },
      {
        type: "registerPanelHandle",
        data: initializePanelHandleData({ id: "resizer-1", size: "10px" }),
      },
      { type: "registerPanel", data: initializePanel({ id: "panel-2" }) },
    ]);

    // Initialize at 100% zoom: 1000px group, 495px panels, 10px handle
    actor.send({ type: "setSize", size: { width: 1000, height: 200 } });
    actor.send({
      type: "setActualItemsSize",
      childrenSizes: {
        "panel-1": { width: 495, height: 200 },
        "panel-2": { width: 495, height: 200 },
      },
    });

    // Simulate browser zoom-in: the group shrinks to 900px CSS pixels.
    // ResizeObserver reports fractional panel sizes that sum to 900.6px —
    // slightly over the group size but under 1px overflow.
    actor.send({ type: "setSize", size: { width: 900, height: 200 } });
    actor.send({
      type: "setActualItemsSize",
      childrenSizes: {
        "panel-1": { width: 445.3, height: 200 },
        "panel-2": { width: 445.3, height: 200 },
      },
    });

    // Template must remain in the responsive minmax/calc format, not switch to
    // fixed pixel values (e.g. "445.3px 10px 445.3px").
    const template = buildTemplate(actor.value);
    expect(template).not.toMatch(/^\d/);
    expect(template).toMatch(/minmax/);
  });
});
