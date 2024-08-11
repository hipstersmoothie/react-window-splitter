/**
 * @vitest-environment jsdom
 */

import { expect, test, vi } from "vitest";
import {
  buildTemplate,
  dragHandlePayload,
  groupMachine,
  GroupMachineEvent,
  initializePanel,
  isPanelHandle,
} from "./ReactWindowSplitter.js";
import { Actor, createActor } from "xstate";
import { describe } from "node:test";

function getTemplate(actor: Actor<typeof groupMachine>) {
  return buildTemplate(actor.getSnapshot().context.items);
}

function dragHandle(
  actor: Actor<typeof groupMachine>,
  options: {
    delta: number;
    orientation?: "horizontal" | "vertical";
    id: string;
  }
) {
  for (let i = 0; i < Math.abs(options.delta); i++) {
    actor.send({
      type: "dragHandle",
      handleId: options.id,
      value: dragHandlePayload({
        orientation: options.orientation || "horizontal",
        delta: options.delta > 0 ? 1 : -1,
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
    }, 1000);
  });
}

describe("constraints", () => {
  test("works with 2 simple panels - horizontal", () => {
    const actor = createActor(groupMachine, {
      input: { groupId: "group" },
    }).start();

    sendAll(actor, [
      { type: "registerPanel", data: initializePanel({ id: "panel-1" }) },
      { type: "registerPanelHandle", data: { id: "resizer-1", size: "10px" } },
      { type: "registerPanel", data: initializePanel({ id: "panel-2" }) },
      { type: "setSize", size: { width: 500, height: 200 } },
    ]);

    expect(getTemplate(actor)).toMatchInlineSnapshot(
      `"minmax(0px, 100%) 10px minmax(0px, 100%)"`
    );

    // Drag the resizer to the right
    capturePixelValues(actor, () => {
      expect(getTemplate(actor)).toMatchInlineSnapshot(`"245px 10px 245px"`);
      dragHandle(actor, { id: "resizer-1", delta: 10 });
      expect(getTemplate(actor)).toMatchInlineSnapshot(`"255px 10px 235px"`);
    });

    expect(getTemplate(actor)).toMatchInlineSnapshot(
      `"minmax(0px, min(calc(0.5204081632653061 * (100% - 10px)), 100%)) 10px minmax(0px, min(calc(0.47959183673469385 * (100% - 10px)), 100%))"`
    );

    // Drag the resizer to the left
    capturePixelValues(actor, () => {
      expect(getTemplate(actor)).toMatchInlineSnapshot(`"255px 10px 235px"`);
      dragHandle(actor, { id: "resizer-1", delta: -20 });
      expect(getTemplate(actor)).toMatchInlineSnapshot(`"235px 10px 255px"`);
    });

    expect(getTemplate(actor)).toMatchInlineSnapshot(
      `"minmax(0px, min(calc(0.47959183673469385 * (100% - 10px)), 100%)) 10px minmax(0px, min(calc(0.5204081632653061 * (100% - 10px)), 100%))"`
    );
  });

  test("works with 2 simple panels - vertical", () => {
    const actor = createActor(groupMachine, {
      input: { orientation: "vertical", groupId: "group" },
    }).start();

    sendAll(actor, [
      { type: "registerPanel", data: initializePanel({ id: "panel-1" }) },
      { type: "registerPanelHandle", data: { id: "resizer-1", size: "10px" } },
      { type: "registerPanel", data: initializePanel({ id: "panel-2" }) },
      { type: "setSize", size: { width: 200, height: 500 } },
    ]);

    expect(getTemplate(actor)).toMatchInlineSnapshot(
      `"minmax(0px, 100%) 10px minmax(0px, 100%)"`
    );

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
      `"minmax(0px, min(calc(0.5204081632653061 * (100% - 10px)), 100%)) 10px minmax(0px, min(calc(0.47959183673469385 * (100% - 10px)), 100%))"`
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
      `"minmax(0px, min(calc(0.47959183673469385 * (100% - 10px)), 100%)) 10px minmax(0px, min(calc(0.5204081632653061 * (100% - 10px)), 100%))"`
    );
  });

  test("works with 2 simple panels as input", () => {
    const actor = createActor(groupMachine, {
      input: {
        groupId: "group",
        initialItems: [
          initializePanel({ id: "panel-1" }),
          { type: "handle", id: "resizer-1", size: "10px" },
          initializePanel({ id: "panel-2" }),
        ],
      },
    }).start();

    sendAll(actor, [{ type: "setSize", size: { width: 200, height: 500 } }]);

    expect(getTemplate(actor)).toMatchInlineSnapshot(
      `"minmax(0px, 100%) 10px minmax(0px, 100%)"`
    );

    capturePixelValues(actor, () => {
      expect(getTemplate(actor)).toMatchInlineSnapshot(`"95px 10px 95px"`);
    });
  });

  test("panel can have a min", () => {
    const actor = createActor(groupMachine, {
      input: { groupId: "group" },
    }).start();

    sendAll(actor, [
      { type: "registerPanel", data: initializePanel({ id: "panel-1" }) },
      { type: "registerPanelHandle", data: { id: "resizer-1", size: "10px" } },
      {
        type: "registerPanel",
        data: initializePanel({ id: "panel-2", min: "100px" }),
      },
      { type: "setSize", size: { width: 500, height: 200 } },
    ]);

    expect(getTemplate(actor)).toMatchInlineSnapshot(
      `"minmax(0px, 100%) 10px minmax(100px, 100%)"`
    );

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
      { type: "registerPanelHandle", data: { id: "resizer-1", size: "10px" } },
      {
        type: "registerPanel",
        data: initializePanel({ id: "panel-2", max: "300px" }),
      },
      { type: "setSize", size: { width: 500, height: 200 } },
    ]);

    expect(getTemplate(actor)).toMatchInlineSnapshot(
      `"minmax(0px, 100%) 10px minmax(0px, 300px)"`
    );

    // Drag the resizer to the right

    capturePixelValues(actor, () => {
      expect(getTemplate(actor)).toMatchInlineSnapshot(`"245px 10px 245px"`);
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
      { type: "registerPanelHandle", data: { id: "resizer-1", size: "10px" } },
      {
        type: "registerPanel",
        data: initializePanel({ id: "panel-2", default: "300px" }),
      },
      { type: "setSize", size: { width: 500, height: 200 } },
    ]);

    expect(getTemplate(actor)).toMatchInlineSnapshot(
      `"minmax(0px, 100%) 10px 300px"`
    );

    capturePixelValues(actor, () => {
      expect(getTemplate(actor)).toMatchInlineSnapshot(`"190px 10px 300px"`);
    });
  });
});

describe("collapsible panel", () => {
  test("panel can be collapsible", () => {
    const actor = createActor(groupMachine, {
      input: { groupId: "group" },
    }).start();

    sendAll(actor, [
      { type: "registerPanel", data: initializePanel({ id: "panel-1" }) },
      { type: "registerPanelHandle", data: { id: "resizer-1", size: "10px" } },
      {
        type: "registerPanel",
        data: initializePanel({
          id: "panel-2",
          collapsible: true,
          min: "100px",
        }),
      },
      { type: "setSize", size: { width: 500, height: 200 } },
    ]);

    expect(getTemplate(actor)).toMatchInlineSnapshot(
      `"minmax(0px, 100%) 10px minmax(100px, 100%)"`
    );

    capturePixelValues(actor, () => {
      expect(getTemplate(actor)).toMatchInlineSnapshot(`"245px 10px 245px"`);

      // Drag into the drag buffer but not past it
      dragHandle(actor, { id: "resizer-1", delta: 160 });
      expect(getTemplate(actor)).toMatchInlineSnapshot(`"390px 10px 100px"`);

      // Drag past the drag buffer and collapse the panel
      dragHandle(actor, { id: "resizer-1", delta: 100 });
      expect(getTemplate(actor)).toMatchInlineSnapshot(`"490px 10px 0px"`);
    });

    expect(getTemplate(actor)).toMatchInlineSnapshot(
      `"minmax(0px, min(calc(1 * (100% - 10px)), 100%)) 10px 0px"`
    );

    capturePixelValues(actor, () => {
      expect(getTemplate(actor)).toMatchInlineSnapshot(`"490px 10px 0px"`);

      // Stays oollapsed in the buffer
      dragHandle(actor, { id: "resizer-1", delta: -30 });
      expect(getTemplate(actor)).toMatchInlineSnapshot(`"490px 10px 0px"`);

      // Opens once the buffer is cleared
      dragHandle(actor, { id: "resizer-1", delta: -20 });
      expect(getTemplate(actor)).toMatchInlineSnapshot(`"390px 10px 100px"`);
    });
  });

  test("collapsible panel can have collapsed size - right", async () => {
    const actor = createActor(groupMachine, {
      input: { groupId: "group" },
    }).start();

    sendAll(actor, [
      { type: "registerPanel", data: initializePanel({ id: "panel-1" }) },
      { type: "registerPanelHandle", data: { id: "resizer-1", size: "10px" } },
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
      { type: "setSize", size: { width: 500, height: 200 } },
    ]);

    expect(getTemplate(actor)).toMatchInlineSnapshot(
      `"minmax(0px, 100%) 10px 60px"`
    );

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
      { type: "registerPanelHandle", data: { id: "resizer-1", size: "10px" } },
      { type: "registerPanel", data: initializePanel({ id: "panel-1" }) },
      { type: "setSize", size: { width: 500, height: 200 } },
    ]);

    expect(getTemplate(actor)).toMatchInlineSnapshot(
      `"60px 10px minmax(0px, 100%)"`
    );

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

  test("panel can collapse can subscribe to collapsed state", () => {
    const actor = createActor(groupMachine, {
      input: { groupId: "group" },
    }).start();

    const spy = vi.fn();

    sendAll(actor, [
      { type: "registerPanel", data: initializePanel({ id: "panel-1" }) },
      { type: "registerPanelHandle", data: { id: "resizer-1", size: "10px" } },
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
      { type: "setSize", size: { width: 500, height: 200 } },
    ]);

    expect(getTemplate(actor)).toMatchInlineSnapshot(
      `"minmax(0px, 100%) 10px minmax(100px, 100%)"`
    );

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
      { type: "setSize", size: { width: 500, height: 200 } },
    ]);

    expect(getTemplate(actor)).toMatchInlineSnapshot(
      `"minmax(0px, 100%) 10px 100px"`
    );

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
});
