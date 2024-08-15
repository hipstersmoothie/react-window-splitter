/**
 * @vitest-environment jsdom
 */

import { expect, test, describe, vi } from "vitest";
import {
  buildTemplate,
  dragHandlePayload,
  groupMachine,
  GroupMachineEvent,
  initializePanel,
  initializePanelHandleData,
  isPanelHandle,
} from "./index.js";
import { Actor, createActor } from "xstate";
import { spring } from "framer-motion";

function getTemplate(actor: Actor<typeof groupMachine>) {
  return buildTemplate(actor.getSnapshot().context);
}

function dragHandle(
  actor: Actor<typeof groupMachine>,
  options: {
    delta: number;
    orientation?: "horizontal" | "vertical";
    id: string;
    shiftKey?: boolean;
  }
) {
  for (let i = 0; i < Math.abs(options.delta); i++) {
    actor.send({
      type: "dragHandle",
      handleId: options.id,
      value: dragHandlePayload({
        orientation: options.orientation || "horizontal",
        delta: options.delta > 0 ? 1 : -1,
        shiftKey: options.shiftKey,
      }),
    });
  }
}

function sendAll(
  actor: Actor<typeof groupMachine>,
  events: GroupMachineEvent[]
) {
  for (const event of events) {
    actor.send(event);
  }
}

function capturePixelValues(actor: Actor<typeof groupMachine>, cb: () => void) {
  const firstHandle = actor
    .getSnapshot()
    .context.items.find((i) => isPanelHandle(i));

  if (firstHandle) {
    actor.send({ type: "dragHandleStart", handleId: firstHandle.id });
  }

  cb();

  if (firstHandle) {
    actor.send({ type: "dragHandleEnd", handleId: firstHandle.id });
  }
}

function waitForIdle(actor: Actor<typeof groupMachine>) {
  return new Promise<void>((resolve) => {
    setInterval(() => {
      const snapshot = actor.getSnapshot();

      if (snapshot.value === "idle") {
        resolve();
      }
    }, 100);
  });
}

function initializeSizes(
  actor: Actor<typeof groupMachine>,
  options: {
    width: number;
    height: number;
  }
) {
  const context = actor.getSnapshot().context;
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

function waitForCondition(condition: () => boolean) {
  return new Promise<void>((resolve) => {
    const interval = setInterval(() => {
      if (condition()) {
        clearInterval(interval);
        resolve();
      }
    }, 100);
  });
}

describe("constraints", () => {
  test("works with 2 simple panels - horizontal", () => {
    const actor = createActor(groupMachine, {
      input: { groupId: "group" },
    }).start();

    sendAll(actor, [
      { type: "registerPanel", data: initializePanel({ id: "panel-1" }) },
      {
        type: "registerPanelHandle",
        data: { id: "resizer-1", size: "10px" },
      },
      { type: "registerPanel", data: initializePanel({ id: "panel-2" }) },
    ]);

    expect(getTemplate(actor)).toMatchInlineSnapshot(
      `"minmax(0px, 1fr) 10px minmax(0px, 1fr)"`
    );
    initializeSizes(actor, { width: 500, height: 200 });

    // Drag the resizer to the right
    capturePixelValues(actor, () => {
      expect(getTemplate(actor)).toMatchInlineSnapshot(`"245px 10px 245px"`);
      dragHandle(actor, { id: "resizer-1", delta: 10 });
      expect(getTemplate(actor)).toMatchInlineSnapshot(`"255px 10px 235px"`);
    });

    expect(getTemplate(actor)).toMatchInlineSnapshot(
      `"minmax(0px, min(calc(0.52040816326530612245 * (100% - 10px)), 100%)) 10px minmax(0px, min(calc(0.47959183673469387755 * (100% - 10px)), 100%))"`
    );

    // Drag the resizer to the left
    capturePixelValues(actor, () => {
      expect(getTemplate(actor)).toMatchInlineSnapshot(`"255px 10px 235px"`);
      dragHandle(actor, { id: "resizer-1", delta: -20 });
      expect(getTemplate(actor)).toMatchInlineSnapshot(`"235px 10px 255px"`);
    });

    expect(getTemplate(actor)).toMatchInlineSnapshot(
      `"minmax(0px, min(calc(0.47959183673469387755 * (100% - 10px)), 100%)) 10px minmax(0px, min(calc(0.52040816326530612245 * (100% - 10px)), 100%))"`
    );
  });

  test("works with 2 simple panels - vertical", () => {
    const actor = createActor(groupMachine, {
      input: { orientation: "vertical", groupId: "group" },
    }).start();

    sendAll(actor, [
      { type: "registerPanel", data: initializePanel({ id: "panel-1" }) },
      {
        type: "registerPanelHandle",
        data: { id: "resizer-1", size: "10px" },
      },
      { type: "registerPanel", data: initializePanel({ id: "panel-2" }) },
    ]);

    expect(getTemplate(actor)).toMatchInlineSnapshot(
      `"minmax(0px, 1fr) 10px minmax(0px, 1fr)"`
    );
    initializeSizes(actor, { width: 200, height: 500 });

    // Drag the resizer down
    capturePixelValues(actor, () => {
      expect(getTemplate(actor)).toMatchInlineSnapshot(`"245px 10px 245px"`);
      dragHandle(actor, {
        id: "resizer-1",
        delta: 10,
        orientation: "vertical",
      });
      expect(getTemplate(actor)).toMatchInlineSnapshot(`"255px 10px 235px"`);
    });

    expect(getTemplate(actor)).toMatchInlineSnapshot(
      `"minmax(0px, min(calc(0.52040816326530612245 * (100% - 10px)), 100%)) 10px minmax(0px, min(calc(0.47959183673469387755 * (100% - 10px)), 100%))"`
    );

    // Drag the resizer to the up
    capturePixelValues(actor, () => {
      expect(getTemplate(actor)).toMatchInlineSnapshot(`"255px 10px 235px"`);
      dragHandle(actor, {
        id: "resizer-1",
        delta: -20,
        orientation: "vertical",
      });
      expect(getTemplate(actor)).toMatchInlineSnapshot(`"235px 10px 255px"`);
    });

    expect(getTemplate(actor)).toMatchInlineSnapshot(
      `"minmax(0px, min(calc(0.47959183673469387755 * (100% - 10px)), 100%)) 10px minmax(0px, min(calc(0.52040816326530612245 * (100% - 10px)), 100%))"`
    );
  });

  test("doesn't register a panel with the same id twice", () => {
    const actor = createActor(groupMachine, {
      input: {
        groupId: "group",
        initialItems: [initializePanel({ id: "panel-1" })],
      },
    }).start();

    actor.send({
      type: "registerPanel",
      data: initializePanel({ id: "panel-1" }),
    });

    expect(actor.getSnapshot().context.items).toHaveLength(1);
  });

  test("works with 2 simple panels as input", () => {
    const actor = createActor(groupMachine, {
      input: {
        groupId: "group",
        initialItems: [
          initializePanel({ id: "panel-1" }),
          initializePanelHandleData({ id: "resizer-1", size: "10px" }),
          initializePanel({ id: "panel-2" }),
        ],
      },
    }).start();

    expect(getTemplate(actor)).toMatchInlineSnapshot(
      `"minmax(0px, 1fr) 10px minmax(0px, 1fr)"`
    );
    initializeSizes(actor, { width: 500, height: 200 });

    capturePixelValues(actor, () => {
      expect(getTemplate(actor)).toMatchInlineSnapshot(`"245px 10px 245px"`);
    });
  });

  test("no delta does nothing", () => {
    const actor = createActor(groupMachine, {
      input: {
        groupId: "group",
        initialItems: [
          initializePanel({ id: "panel-1" }),
          initializePanelHandleData({ id: "resizer-1", size: "10px" }),
          initializePanel({ id: "panel-2" }),
        ],
      },
    }).start();
    initializeSizes(actor, { width: 500, height: 200 });

    capturePixelValues(actor, () => {
      expect(getTemplate(actor)).toMatchInlineSnapshot(`"245px 10px 245px"`);
      actor.send({
        type: "dragHandle",
        handleId: "resizer-1",
        value: dragHandlePayload({ delta: 0, orientation: "horizontal" }),
      });
      expect(getTemplate(actor)).toMatchInlineSnapshot(`"245px 10px 245px"`);
    });
  });

  test("shift key makes it drag more", () => {
    const actor = createActor(groupMachine, {
      input: {
        groupId: "group",
        initialItems: [
          initializePanel({ id: "panel-1" }),
          initializePanelHandleData({ id: "resizer-1", size: "10px" }),
          initializePanel({ id: "panel-2" }),
        ],
      },
    }).start();
    initializeSizes(actor, { width: 500, height: 200 });

    capturePixelValues(actor, () => {
      expect(getTemplate(actor)).toMatchInlineSnapshot(`"245px 10px 245px"`);
      dragHandle(actor, { id: "resizer-1", delta: -1, shiftKey: true });
      expect(getTemplate(actor)).toMatchInlineSnapshot(`"230px 10px 260px"`);
    });
  });

  test("works with percentages", () => {
    const actor = createActor(groupMachine, {
      input: {
        groupId: "group",
        initialItems: [
          initializePanel({ id: "panel-1", min: "40%" }),
          initializePanelHandleData({ id: "resizer-1", size: "10px" }),
          initializePanel({ id: "panel-2", min: "10%", default: "30%" }),
        ],
      },
    }).start();

    expect(getTemplate(actor)).toMatchInlineSnapshot(
      `"minmax(40%, 1fr) 10px 30%"`
    );
    initializeSizes(actor, { width: 500, height: 200 });

    capturePixelValues(actor, () => {
      expect(getTemplate(actor)).toMatchInlineSnapshot(`"340px 10px 150px"`);
      dragHandle(actor, { id: "resizer-1", delta: -200 });
      expect(getTemplate(actor)).toMatchInlineSnapshot(`"200px 10px 290px"`);
    });
  });

  test("supports max", () => {
    const actor = createActor(groupMachine, {
      input: {
        groupId: "group",
        initialItems: [
          initializePanel({ id: "panel-1", max: "90%" }),
          initializePanelHandleData({ id: "resizer-1", size: "10px" }),
          initializePanel({ id: "panel-2", default: "30%" }),
        ],
      },
    }).start();

    expect(getTemplate(actor)).toMatchInlineSnapshot(
      `"minmax(0px, 90%) 10px 30%"`
    );
    initializeSizes(actor, { width: 500, height: 200 });

    capturePixelValues(actor, () => {
      dragHandle(actor, { id: "resizer-1", delta: 500 });
      expect(getTemplate(actor)).toMatchInlineSnapshot(`"450px 10px 40px"`);
    });
  });

  test("panel can have a min", () => {
    const actor = createActor(groupMachine, {
      input: { groupId: "group" },
    }).start();

    sendAll(actor, [
      { type: "registerPanel", data: initializePanel({ id: "panel-1" }) },
      {
        type: "registerPanelHandle",
        data: { id: "resizer-1", size: "10px" },
      },
      {
        type: "registerPanel",
        data: initializePanel({ id: "panel-2", min: "100px" }),
      },
    ]);

    expect(getTemplate(actor)).toMatchInlineSnapshot(
      `"minmax(0px, 1fr) 10px minmax(100px, 1fr)"`
    );
    initializeSizes(actor, { width: 500, height: 200 });

    capturePixelValues(actor, () => {
      expect(getTemplate(actor)).toMatchInlineSnapshot(`"245px 10px 245px"`);
      dragHandle(actor, { id: "resizer-1", delta: 200 });
      expect(getTemplate(actor)).toMatchInlineSnapshot(`"390px 10px 100px"`);
    });
  });

  test("panel can have a max", () => {
    const actor = createActor(groupMachine, {
      input: { groupId: "group" },
    }).start();

    sendAll(actor, [
      { type: "registerPanel", data: initializePanel({ id: "panel-1" }) },
      {
        type: "registerPanelHandle",
        data: { id: "resizer-1", size: "10px" },
      },
      {
        type: "registerPanel",
        data: initializePanel({ id: "panel-2", max: "300px" }),
      },
    ]);

    expect(getTemplate(actor)).toMatchInlineSnapshot(
      `"minmax(0px, 1fr) 10px minmax(0px, 300px)"`
    );
    initializeSizes(actor, { width: 500, height: 200 });

    // Drag the resizer to the right

    capturePixelValues(actor, () => {
      expect(getTemplate(actor)).toMatchInlineSnapshot(`"190px 10px 300px"`);
      dragHandle(actor, { id: "resizer-1", delta: -200 });
      expect(getTemplate(actor)).toMatchInlineSnapshot(`"190px 10px 300px"`);
    });
  });

  test("panel can have a default size", () => {
    const actor = createActor(groupMachine, {
      input: { groupId: "group" },
    }).start();

    sendAll(actor, [
      { type: "registerPanel", data: initializePanel({ id: "panel-1" }) },
      {
        type: "registerPanelHandle",
        data: { id: "resizer-1", size: "10px" },
      },
      {
        type: "registerPanel",
        data: initializePanel({ id: "panel-2", default: "300px" }),
      },
    ]);
    initializeSizes(actor, { width: 500, height: 200 });

    expect(getTemplate(actor)).toMatchInlineSnapshot(
      `"minmax(0px, min(calc(0.38775510204081632653 * (100% - 10px)), 100%)) 10px minmax(0px, min(calc(0.61224489795918367347 * (100% - 10px)), 100%))"`
    );

    capturePixelValues(actor, () => {
      expect(getTemplate(actor)).toMatchInlineSnapshot(`"190px 10px 300px"`);
    });
  });

  test("dragging eats space from multiple panels in front of it", () => {
    const actor = createActor(groupMachine, {
      input: { groupId: "group" },
    }).start();

    sendAll(actor, [
      { type: "registerPanel", data: initializePanel({ id: "panel-1" }) },
      {
        type: "registerPanelHandle",
        data: { id: "resizer-1", size: "10px" },
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
        data: { id: "resizer-2", size: "10px" },
      },
      {
        type: "registerPanel",
        data: initializePanel({ id: "panel-3", min: "100px" }),
      },
    ]);

    initializeSizes(actor, { width: 500, height: 200 });

    capturePixelValues(actor, () => {
      expect(getTemplate(actor)).toMatchInlineSnapshot(
        `"80px 10px 300px 10px 100px"`
      );
      dragHandle(actor, { id: "resizer-1", delta: 160 });
      expect(getTemplate(actor)).toMatchInlineSnapshot(
        `"180px 10px 200px 10px 100px"`
      );
    });
  });

  test("can set a panel's size", () => {
    const actor = createActor(groupMachine, {
      input: {
        groupId: "group",
        initialItems: [
          initializePanel({ id: "panel-1" }),
          initializePanelHandleData({ id: "resizer-1", size: "10px" }),
          initializePanel({ id: "panel-2" }),
        ],
      },
    }).start();
    initializeSizes(actor, { width: 500, height: 200 });

    actor.send({
      type: "setPanelPixelSize",
      panelId: "panel-1",
      size: "100px",
    });

    capturePixelValues(actor, () => {
      expect(getTemplate(actor)).toMatchInlineSnapshot(`"100px 10px 390px"`);
    });

    actor.send({
      type: "setPanelPixelSize",
      panelId: "panel-1",
      size: "25%",
    });

    capturePixelValues(actor, () => {
      expect(getTemplate(actor)).toMatchInlineSnapshot(`"125px 10px 365px"`);
    });
  });

  test("can update orientation at runtime", () => {
    const actor = createActor(groupMachine, {
      input: { groupId: "group" },
    }).start();

    sendAll(actor, [
      { type: "registerPanel", data: initializePanel({ id: "panel-1" }) },
      {
        type: "registerPanelHandle",
        data: { id: "resizer-1", size: "10px" },
      },
      { type: "registerPanel", data: initializePanel({ id: "panel-2" }) },
    ]);

    initializeSizes(actor, { width: 500, height: 200 });

    capturePixelValues(actor, () => {
      expect(getTemplate(actor)).toMatchInlineSnapshot(`"245px 10px 245px"`);
    });

    actor.send({ type: "setOrientation", orientation: "vertical" });

    capturePixelValues(actor, () => {
      expect(getTemplate(actor)).toMatchInlineSnapshot(`"95px 10px 95px"`);
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
    { duration: 1000, easing: springEasing },
  ])("panel can be collapsible: %s", async (animation) => {
    const actor = createActor(groupMachine, {
      input: { groupId: "group" },
    }).start();

    sendAll(actor, [
      { type: "registerPanel", data: initializePanel({ id: "panel-1" }) },
      {
        type: "registerPanelHandle",
        data: { id: "resizer-1", size: "10px" },
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

    expect(getTemplate(actor)).toBe("minmax(0px, 1fr) 10px minmax(100px, 1fr)");
    initializeSizes(actor, { width: 500, height: 200 });

    // Test dragging to collapse the panel
    capturePixelValues(actor, () => {
      expect(getTemplate(actor)).toBe("245px 10px 245px");

      // Drag into the drag buffer but not past it
      dragHandle(actor, { id: "resizer-1", delta: 160 });
      expect(getTemplate(actor)).toBe("390px 10px 100px");

      // Drag past the drag buffer and collapse the panel
      dragHandle(actor, { id: "resizer-1", delta: 100 });
      expect(getTemplate(actor)).toBe("490px 10px 0px");
    });

    expect(getTemplate(actor)).toBe(
      "minmax(0px, min(calc(1 * (100% - 10px)), 100%)) 10px 0px"
    );

    // Test dragging to expand the panel
    capturePixelValues(actor, () => {
      expect(getTemplate(actor)).toBe("490px 10px 0px");

      // Stays oollapsed in the buffer
      dragHandle(actor, { id: "resizer-1", delta: -30 });
      expect(getTemplate(actor)).toBe("490px 10px 0px");

      // Opens once the buffer is cleared
      dragHandle(actor, { id: "resizer-1", delta: -20 });
      expect(getTemplate(actor)).toBe("390px 10px 100px");
    });

    actor.send({ type: "collapsePanel", panelId: "panel-2" });
    await waitForIdle(actor);

    capturePixelValues(actor, () => {
      expect(getTemplate(actor)).toBe("490px 10px 0px");
    });
  });

  test("throws when you collapse a panel and there are no handles", async () => {
    const actor = createActor(groupMachine, {
      input: {
        groupId: "group",
        initialItems: [initializePanel({ id: "panel-1" })],
      },
    }).start();

    initializeSizes(actor, { width: 500, height: 200 });

    const spy = vi.fn();
    let didError = false;

    actor.subscribe({
      error: (e) => {
        spy(e);
        didError = true;
      },
    });

    actor.send({ type: "collapsePanel", panelId: "panel-1" });

    await waitForCondition(() => didError);

    expect(spy).toHaveBeenCalledWith(
      new Error("Cant find handle for panel: panel-1")
    );
  });

  test("collapsible panel can have collapsed size - right", async () => {
    const actor = createActor(groupMachine, {
      input: { groupId: "group" },
    }).start();

    sendAll(actor, [
      { type: "registerPanel", data: initializePanel({ id: "panel-1" }) },
      {
        type: "registerPanelHandle",
        data: { id: "resizer-1", size: "10px" },
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

    expect(getTemplate(actor)).toMatchInlineSnapshot(
      `"minmax(0px, 1fr) 10px 60px"`
    );
    initializeSizes(actor, { width: 500, height: 200 });

    capturePixelValues(actor, () => {
      expect(getTemplate(actor)).toMatchInlineSnapshot(`"430px 10px 60px"`);

      // Drag into the the panel
      dragHandle(actor, { id: "resizer-1", delta: 50 });
      expect(getTemplate(actor)).toMatchInlineSnapshot(`"430px 10px 60px"`);

      // Drag into the start
      dragHandle(actor, { id: "resizer-1", delta: -50 });
      expect(getTemplate(actor)).toMatchInlineSnapshot(`"430px 10px 60px"`);

      // Drag into the drag buffer but not past it
      dragHandle(actor, { id: "resizer-1", delta: -25 });
      expect(getTemplate(actor)).toMatchInlineSnapshot(`"430px 10px 60px"`);

      // Drag past the buffer
      dragHandle(actor, { id: "resizer-1", delta: -25 });
      expect(getTemplate(actor)).toMatchInlineSnapshot(`"290px 10px 200px"`);
    });
  });

  test("non collapsible panels should have drag overflow too", async () => {
    const actor = createActor(groupMachine, {
      input: { groupId: "group" },
    }).start();

    sendAll(actor, [
      { type: "registerPanel", data: initializePanel({ id: "panel-1" }) },
      {
        type: "registerPanelHandle",
        data: { id: "resizer-1", size: "10px" },
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

    expect(getTemplate(actor)).toMatchInlineSnapshot(
      `"minmax(0px, 1fr) 10px 200px"`
    );
    initializeSizes(actor, { width: 500, height: 200 });

    capturePixelValues(actor, () => {
      expect(getTemplate(actor)).toMatchInlineSnapshot(`"290px 10px 200px"`);

      // Drag into the the panel
      dragHandle(actor, { id: "resizer-1", delta: 50 });
      expect(getTemplate(actor)).toMatchInlineSnapshot(`"290px 10px 200px"`);

      // Drag into the start
      dragHandle(actor, { id: "resizer-1", delta: -50 });
      expect(getTemplate(actor)).toMatchInlineSnapshot(`"290px 10px 200px"`);

      // Drag into the drag buffer but not past it
      dragHandle(actor, { id: "resizer-1", delta: -25 });
      expect(getTemplate(actor)).toMatchInlineSnapshot(`"265px 10px 225px"`);
    });
  });

  test("can expand default collapsed panel via event", async () => {
    const actor = createActor(groupMachine, {
      input: { groupId: "group" },
    }).start();

    sendAll(actor, [
      { type: "registerPanel", data: initializePanel({ id: "panel-1" }) },
      {
        type: "registerPanelHandle",
        data: { id: "resizer-1", size: "10px" },
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
      expect(getTemplate(actor)).toMatchInlineSnapshot(`"290px 10px 200px"`);
    });
  });

  test("collapsible panel can have collapsed size - left", async () => {
    const actor = createActor(groupMachine, {
      input: { groupId: "group" },
    }).start();

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
        data: { id: "resizer-1", size: "10px" },
      },
      { type: "registerPanel", data: initializePanel({ id: "panel-1" }) },
    ]);

    expect(getTemplate(actor)).toMatchInlineSnapshot(
      `"60px 10px minmax(0px, 1fr)"`
    );
    initializeSizes(actor, { width: 500, height: 200 });

    capturePixelValues(actor, () => {
      expect(getTemplate(actor)).toMatchInlineSnapshot(`"60px 10px 430px"`);

      // Drag into the the panel
      dragHandle(actor, { id: "resizer-1", delta: -50 });
      expect(getTemplate(actor)).toMatchInlineSnapshot(`"60px 10px 430px"`);

      // Drag to the start
      dragHandle(actor, { id: "resizer-1", delta: 50 });
      expect(getTemplate(actor)).toMatchInlineSnapshot(`"60px 10px 430px"`);

      // Drag into the drag buffer but not past it
      dragHandle(actor, { id: "resizer-1", delta: 25 });
      expect(getTemplate(actor)).toMatchInlineSnapshot(`"60px 10px 430px"`);

      // Drag past the buffer
      dragHandle(actor, { id: "resizer-1", delta: 25 });
      expect(getTemplate(actor)).toMatchInlineSnapshot(`"200px 10px 290px"`);
    });
  });

  test("collapsible remembers last position", async () => {
    const actor = createActor(groupMachine, {
      input: { groupId: "group" },
    }).start();

    sendAll(actor, [
      { type: "registerPanel", data: initializePanel({ id: "panel-1" }) },
      {
        type: "registerPanelHandle",
        data: { id: "resizer-1", size: "10px" },
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
      expect(getTemplate(actor)).toMatchInlineSnapshot(`"245px 10px 245px"`);
      dragHandle(actor, { id: "resizer-1", delta: -50 });
      expect(getTemplate(actor)).toMatchInlineSnapshot(`"195px 10px 295px"`);
    });

    actor.send({ type: "collapsePanel", panelId: "panel-2" });
    await waitForIdle(actor);

    capturePixelValues(actor, () => {
      expect(getTemplate(actor)).toMatchInlineSnapshot(`"430px 10px 60px"`);
    });

    actor.send({ type: "expandPanel", panelId: "panel-2" });
    await waitForIdle(actor);

    capturePixelValues(actor, () => {
      expect(getTemplate(actor)).toMatchInlineSnapshot(`"195px 10px 295px"`);
    });
  });

  test("panel can collapse can subscribe to collapsed state", () => {
    const actor = createActor(groupMachine, {
      input: { groupId: "group" },
    }).start();

    const spy = vi.fn();

    sendAll(actor, [
      { type: "registerPanel", data: initializePanel({ id: "panel-1" }) },
      {
        type: "registerPanelHandle",
        data: { id: "resizer-1", size: "10px" },
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

    expect(getTemplate(actor)).toMatchInlineSnapshot(
      `"minmax(0px, 1fr) 10px minmax(100px, 1fr)"`
    );
    initializeSizes(actor, { width: 500, height: 200 });

    // collapse the panel
    capturePixelValues(actor, () => {
      expect(getTemplate(actor)).toMatchInlineSnapshot(`"245px 10px 245px"`);

      // Drag into the drag buffer but not past it
      dragHandle(actor, { id: "resizer-1", delta: 160 });
      expect(getTemplate(actor)).toMatchInlineSnapshot(`"390px 10px 100px"`);

      // Drag past the drag buffer and collapse the panel
      dragHandle(actor, { id: "resizer-1", delta: 100 });
      expect(spy).toHaveBeenCalledWith(true);
      expect(getTemplate(actor)).toMatchInlineSnapshot(`"490px 10px 0px"`);
    });

    spy.mockReset();

    // expand the panel
    capturePixelValues(actor, () => {
      // The panel doesn't actually expand yet
      dragHandle(actor, { id: "resizer-1", delta: -150 });
      expect(getTemplate(actor)).toMatchInlineSnapshot(`"290px 10px 200px"`);

      expect(spy).toHaveBeenCalledWith(false);
      expect(getTemplate(actor)).toMatchInlineSnapshot(`"290px 10px 200px"`);

      // Actually collapse the panel
      actor.send({
        type: "expandPanel",
        panelId: "panel-2",
        controlled: true,
      });
      expect(getTemplate(actor)).toMatchInlineSnapshot(`"290px 10px 200px"`);
    });
  });

  test("should be able to trigger collapse/expand via event", async () => {
    const actor = createActor(groupMachine, {
      input: { groupId: "group" },
    }).start();

    sendAll(actor, [
      { type: "registerPanel", data: initializePanel({ id: "panel-1" }) },
      {
        type: "registerPanelHandle",
        data: { id: "resizer-1", size: "10px" },
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

    expect(getTemplate(actor)).toMatchInlineSnapshot(
      `"minmax(0px, 1fr) 10px 100px"`
    );
    initializeSizes(actor, { width: 500, height: 200 });

    capturePixelValues(actor, () => {
      expect(getTemplate(actor)).toMatchInlineSnapshot(`"390px 10px 100px"`);
    });

    actor.send({ type: "collapsePanel", panelId: "panel-2" });
    await waitForIdle(actor);

    capturePixelValues(actor, () => {
      expect(getTemplate(actor)).toMatchInlineSnapshot(`"490px 10px 0px"`);
    });

    actor.send({ type: "expandPanel", panelId: "panel-2" });
    await waitForIdle(actor);

    capturePixelValues(actor, () => {
      expect(getTemplate(actor)).toMatchInlineSnapshot(`"390px 10px 100px"`);
    });
  });

  test("panel collapse can be controlled", async () => {
    const actor = createActor(groupMachine, {
      input: { groupId: "group" },
    }).start();

    const spy = vi.fn();

    sendAll(actor, [
      { type: "registerPanel", data: initializePanel({ id: "panel-1" }) },
      {
        type: "registerPanelHandle",
        data: { id: "resizer-1", size: "10px" },
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

    expect(getTemplate(actor)).toMatchInlineSnapshot(
      `"minmax(0px, 1fr) 10px minmax(100px, 1fr)"`
    );
    initializeSizes(actor, { width: 500, height: 200 });

    // collapse the panel via drag
    capturePixelValues(actor, () => {
      expect(getTemplate(actor)).toMatchInlineSnapshot(`"245px 10px 245px"`);

      dragHandle(actor, { id: "resizer-1", delta: 160 });
      expect(getTemplate(actor)).toMatchInlineSnapshot(`"390px 10px 100px"`);

      // The panel doesn't actually collapse yet
      dragHandle(actor, { id: "resizer-1", delta: 100 });
      expect(spy).toHaveBeenCalledWith(true);
      expect(getTemplate(actor)).toMatchInlineSnapshot(`"390px 10px 100px"`);

      // Actually collapse the panel
      actor.send({
        type: "collapsePanel",
        panelId: "panel-2",
        controlled: true,
      });
      expect(getTemplate(actor)).toMatchInlineSnapshot(`"470px 10px 20px"`);
    });

    spy.mockReset();

    // expand the panel via drag
    capturePixelValues(actor, () => {
      // The panel doesn't actually expand yet
      dragHandle(actor, { id: "resizer-1", delta: -150 });
      expect(getTemplate(actor)).toMatchInlineSnapshot(`"470px 10px 20px"`);

      expect(spy).toHaveBeenCalledWith(false);
      expect(getTemplate(actor)).toMatchInlineSnapshot(`"470px 10px 20px"`);

      // Actually collapse the panel
      actor.send({
        type: "expandPanel",
        panelId: "panel-2",
        controlled: true,
      });
      expect(getTemplate(actor)).toMatchInlineSnapshot(`"321px 10px 169px"`);
    });

    spy.mockReset();

    actor.send({ type: "collapsePanel", panelId: "panel-2", controlled: true });
    await waitForIdle(actor);

    // collapse the panel via drag
    capturePixelValues(actor, () => {
      expect(getTemplate(actor)).toMatchInlineSnapshot(`"470px 10px 20px"`);
    });

    actor.send({ type: "expandPanel", panelId: "panel-2", controlled: true });
    await waitForIdle(actor);

    // collapse the panel via drag
    capturePixelValues(actor, () => {
      expect(getTemplate(actor)).toMatchInlineSnapshot(`"321px 10px 169px"`);
    });
  });
});

describe("conditional panel", () => {
  test("panel can be conditionally rendered", () => {
    const actor = createActor(groupMachine, {
      input: { groupId: "group" },
    }).start();

    sendAll(actor, [
      { type: "registerPanel", data: initializePanel({ id: "panel-1" }) },
      {
        type: "registerPanelHandle",
        data: { id: "resizer-1", size: "10px" },
      },
      { type: "registerPanel", data: initializePanel({ id: "panel-2" }) },
    ]);

    initializeSizes(actor, { width: 500, height: 200 });

    capturePixelValues(actor, () => {
      expect(getTemplate(actor)).toMatchInlineSnapshot(`"245px 10px 245px"`);
    });

    sendAll(actor, [
      {
        type: "registerPanelHandle",
        data: { id: "resizer-2", size: "10px" },
      },
      {
        type: "registerDynamicPanel",
        data: initializePanel({ id: "panel-3", min: "100px" }),
      },
    ]);

    capturePixelValues(actor, () => {
      expect(getTemplate(actor)).toMatchInlineSnapshot(
        `"240px 10px 140px 10px 100px"`
      );
    });

    sendAll(actor, [
      { type: "unregisterPanelHandle", id: "resizer-2" },
      { type: "unregisterPanel", id: "panel-3" },
    ]);

    capturePixelValues(actor, () => {
      expect(getTemplate(actor)).toMatchInlineSnapshot(`"240px 10px 250px"`);
    });
  });

  test("collapsed panel can be conditionally rendered", () => {
    const actor = createActor(groupMachine, {
      input: { groupId: "group" },
    }).start();

    sendAll(actor, [
      { type: "registerPanel", data: initializePanel({ id: "panel-1" }) },
      {
        type: "registerPanelHandle",
        data: { id: "resizer-1", size: "10px" },
      },
      {
        type: "registerPanel",
        data: initializePanel({ id: "panel-2" }),
      },
    ]);

    initializeSizes(actor, { width: 500, height: 200 });

    capturePixelValues(actor, () => {
      expect(getTemplate(actor)).toMatchInlineSnapshot(`"245px 10px 245px"`);
    });

    sendAll(actor, [
      {
        type: "registerPanelHandle",
        data: { id: "resizer-2", size: "10px" },
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
      expect(getTemplate(actor)).toMatchInlineSnapshot(
        `"240px 10px 240px 10px 0px"`
      );
    });

    sendAll(actor, [
      { type: "unregisterPanelHandle", id: "resizer-2" },
      { type: "unregisterPanel", id: "panel-3" },
    ]);

    capturePixelValues(actor, () => {
      expect(getTemplate(actor)).toMatchInlineSnapshot(`"240px 10px 250px"`);
    });
  });

  test("panel can be conditionally rendered at default width", () => {
    const actor = createActor(groupMachine, {
      input: { groupId: "group" },
    }).start();

    sendAll(actor, [
      { type: "registerPanel", data: initializePanel({ id: "panel-1" }) },
      {
        type: "registerPanelHandle",
        data: { id: "resizer-1", size: "10px" },
      },
      {
        type: "registerPanel",
        data: initializePanel({ id: "panel-2" }),
      },
    ]);

    initializeSizes(actor, { width: 500, height: 200 });

    capturePixelValues(actor, () => {
      expect(getTemplate(actor)).toMatchInlineSnapshot(`"245px 10px 245px"`);
    });

    sendAll(actor, [
      {
        type: "registerPanelHandle",
        data: { id: "resizer-2", size: "10px" },
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
      expect(getTemplate(actor)).toMatchInlineSnapshot(
        `"240px 10px 115px 10px 125px"`
      );
    });

    sendAll(actor, [
      { type: "unregisterPanelHandle", id: "resizer-2" },
      { type: "unregisterPanel", id: "panel-3" },
    ]);

    capturePixelValues(actor, () => {
      expect(getTemplate(actor)).toMatchInlineSnapshot(`"240px 10px 250px"`);
    });
  });

  test("panel can be conditionally rendered w/order", () => {
    const actor = createActor(groupMachine, {
      input: { groupId: "group" },
    }).start();

    sendAll(actor, [
      { type: "registerPanel", data: initializePanel({ id: "panel-1" }) },
      {
        type: "registerPanelHandle",
        data: { id: "resizer-1", size: "10px" },
      },
      { type: "registerPanel", data: initializePanel({ id: "panel-2" }) },
    ]);

    initializeSizes(actor, { width: 500, height: 200 });

    capturePixelValues(actor, () => {
      expect(getTemplate(actor)).toMatchInlineSnapshot(`"245px 10px 245px"`);
    });

    sendAll(actor, [
      {
        type: "registerPanelHandle",
        data: { id: "resizer-2", size: "10px", order: 1 },
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
      expect(getTemplate(actor)).toMatchInlineSnapshot(
        `"240px 10px 100px 10px 140px"`
      );
    });

    sendAll(actor, [
      { type: "unregisterPanelHandle", id: "resizer-2" },
      { type: "unregisterPanel", id: "panel-3" },
    ]);

    capturePixelValues(actor, () => {
      expect(getTemplate(actor)).toMatchInlineSnapshot(`"240px 10px 250px"`);
    });

    sendAll(actor, [
      { type: "unregisterPanelHandle", id: "resizer-2" },
      { type: "unregisterPanel", id: "panel-3" },
    ]);

    capturePixelValues(actor, () => {
      expect(getTemplate(actor)).toMatchInlineSnapshot(`"240px 10px 250px"`);
    });
  });

  test("distributes space on both sides of dynamic panel as needed", async () => {
    const actor = createActor(groupMachine, {
      input: {
        groupId: "group",
        initialItems: [
          initializePanel({ id: "panel-1" }),
          initializePanelHandleData({ id: "resizer-1", size: "10px" }),
          initializePanel({ id: "panel-2", max: "50px" }),
          initializePanelHandleData({ id: "resizer-2", size: "10px" }),
          initializePanel({ id: "panel-3", default: "300px" }),
          initializePanelHandleData({ id: "resizer-3", size: "10px" }),
          initializePanel({ id: "panel-4", max: "50px" }),
          initializePanelHandleData({ id: "resizer-4", size: "10px" }),
          initializePanel({ id: "panel-5", max: "300px" }),
        ],
      },
    }).start();

    initializeSizes(actor, { width: 500, height: 200 });

    capturePixelValues(actor, () => {
      expect(getTemplate(actor)).toMatchInlineSnapshot(
        `"0px 10px 50px 10px 300px 10px 50px 10px 60px"`
      );
    });

    sendAll(actor, [
      { type: "unregisterPanelHandle", id: "resizer-2" },
      { type: "unregisterPanel", id: "panel-3" },
    ]);

    capturePixelValues(actor, () => {
      expect(getTemplate(actor)).toMatchInlineSnapshot(
        `"70px 10px 50px 10px 50px 10px 300px"`
      );
    });
  });
});

describe("errors", () => {
  test("throws for invalid units", () => {
    const actor = createActor(groupMachine, {
      input: { groupId: "group" },
    }).start();

    expect(() =>
      actor.send({
        type: "registerPanel",
        // @ts-expect-error Testing the error
        data: initializePanel({ id: "panel-1", min: "40fr" }),
      })
    ).toThrowErrorMatchingInlineSnapshot(`[Error: Invalid unit: 40fr]`);
  });

  test("throws when using invalid panel IDs", () => {
    const spy = vi.fn();
    const actor = createActor(groupMachine, {
      input: { groupId: "group" },
    }).start();

    actor.subscribe({ error: spy });

    actor.send({
      type: "registerPanel",
      data: initializePanel({ id: "panel-1" }),
    });

    actor.send({
      type: "setPanelPixelSize",
      panelId: "panel-2",
      size: "100px",
    });

    expect(spy).toHaveBeenCalledWith(
      new Error("Expected panel with id: panel-2")
    );
  });

  test("throws when using invalid handle IDs", () => {
    const spy = vi.fn();
    const actor = createActor(groupMachine, {
      input: { groupId: "group" },
    }).start();

    actor.subscribe({ error: spy });

    sendAll(actor, [
      { type: "registerPanel", data: initializePanel({ id: "handle-2" }) },
      { type: "dragHandleStart", handleId: "handle-2" },
      {
        type: "dragHandle",
        handleId: "handle-2",
        value: dragHandlePayload({ delta: 100, orientation: "horizontal" }),
      },
    ]);

    expect(spy).toHaveBeenCalledWith(
      new Error("Expected panel handle with id: handle-2")
    );
  });
});
