import { expect, test, describe } from "vitest";

import {
  getUnitPercentageValue,
  getCollapsiblePanelForHandleId,
  groupMachine,
  initializePanel,
} from "./index.js";
import { createActor } from "xstate";
import Big from "big.js";

describe("getUnitPercentageValue", () => {
  test("works with pixels", () => {
    expect(
      getUnitPercentageValue(100, { type: "pixel", value: new Big(100) })
    ).toBe(1);
    expect(
      getUnitPercentageValue(100, { type: "pixel", value: new Big(50) })
    ).toBe(0.5);
  });

  test("works with percentages", () => {
    expect(
      getUnitPercentageValue(100, { type: "percent", value: new Big(1) })
    ).toBe(1);
    expect(
      getUnitPercentageValue(100, { type: "percent", value: new Big(0.5) })
    ).toBe(0.5);
  });
});

describe("getCollapsiblePanelForHandleId", () => {
  test("works with left collapsible panel", () => {
    const actor = createActor(groupMachine, {
      input: {
        groupId: "group",
        initialItems: [
          initializePanel({ id: "panel-1", collapsible: true }),
          {
            type: "handle",
            id: "resizer-1",
            size: { type: "pixel", value: new Big(10) },
          },
          initializePanel({ id: "panel-2" }),
        ],
      },
    }).start();

    expect(
      getCollapsiblePanelForHandleId(actor.getSnapshot().context, "resizer-1")
        ?.id
    ).toBe("panel-1");
  });

  test("works with right collapsible panel", () => {
    const actor = createActor(groupMachine, {
      input: {
        groupId: "group",
        initialItems: [
          initializePanel({ id: "panel-1" }),
          {
            type: "handle",
            id: "resizer-1",
            size: { type: "pixel", value: new Big(10) },
          },
          initializePanel({ id: "panel-2", collapsible: true }),
        ],
      },
    }).start();

    expect(
      getCollapsiblePanelForHandleId(actor.getSnapshot().context, "resizer-1")
        ?.id
    ).toBe("panel-2");
  });

  test("throws when no items", () => {
    const actor = createActor(groupMachine, {
      input: {
        groupId: "group",
        initialItems: [],
      },
    }).start();

    expect(() =>
      getCollapsiblePanelForHandleId(actor.getSnapshot().context, "resizer-1")
    ).toThrowErrorMatchingInlineSnapshot(`[Error: No items in group]`);
  });

  test("throws when no collapsible panel", () => {
    const actor = createActor(groupMachine, {
      input: {
        groupId: "group",
        initialItems: [
          initializePanel({ id: "panel-1" }),
          {
            type: "handle",
            id: "resizer-1",
            size: { type: "pixel", value: new Big(10) },
          },
        ],
      },
    }).start();

    expect(() =>
      getCollapsiblePanelForHandleId(actor.getSnapshot().context, "resizer-1")
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: No collapsible panel found for handle: resizer-1]`
    );
  });
});
