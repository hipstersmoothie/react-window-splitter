import { expect, test, describe, assert } from "vitest";

import {
  getUnitPercentageValue,
  getCollapsiblePanelForHandleId,
  initializePanel,
  getCursor,
  initializePanelHandleData,
  prepareSnapshot,
  type Item,
} from "./index.js";
import Big from "big.js";
import { createActor } from "./test-utils.js";

describe("getUnitPercentageValue", () => {
  test("works with pixels", () => {
    expect(
      getUnitPercentageValue(100, { type: "pixel", value: new Big(100) }),
    ).toBe(1);
    expect(
      getUnitPercentageValue(100, { type: "pixel", value: new Big(50) }),
    ).toBe(0.5);
  });

  test("works with percentages", () => {
    expect(
      getUnitPercentageValue(100, { type: "percent", value: new Big(1) }),
    ).toBe(1);
    expect(
      getUnitPercentageValue(100, { type: "percent", value: new Big(0.5) }),
    ).toBe(0.5);
  });

  test("works with 0", () => {
    expect(
      getUnitPercentageValue(0, { type: "pixel", value: new Big(1) }),
    ).toBe(0);
  });
});

describe("getCollapsiblePanelForHandleId", () => {
  test("works with left collapsible panel", () => {
    const actor = createActor({
      groupId: "group",
      items: [
        initializePanel({ id: "panel-1", collapsible: true }),
        {
          type: "handle",
          id: "resizer-1",
          size: { type: "pixel", value: new Big(10) },
        },
        initializePanel({ id: "panel-2" }),
      ],
    });

    expect(getCollapsiblePanelForHandleId(actor.value, "resizer-1")?.id).toBe(
      "panel-1",
    );
  });

  test("works with right collapsible panel", () => {
    const actor = createActor({
      groupId: "group",
      items: [
        initializePanel({ id: "panel-1" }),
        {
          type: "handle",
          id: "resizer-1",
          size: { type: "pixel", value: new Big(10) },
        },
        initializePanel({ id: "panel-2", collapsible: true }),
      ],
    });

    expect(getCollapsiblePanelForHandleId(actor.value, "resizer-1")?.id).toBe(
      "panel-2",
    );
  });

  test("throws when no items", () => {
    const actor = createActor({
      groupId: "group",
      items: [],
    });

    expect(() =>
      getCollapsiblePanelForHandleId(actor.value, "resizer-1"),
    ).toThrowErrorMatchingInlineSnapshot(`[Error: No items in group]`);
  });

  test("throws when no collapsible panel", () => {
    const actor = createActor({
      groupId: "group",
      items: [
        initializePanel({ id: "panel-1" }),
        {
          type: "handle",
          id: "resizer-1",
          size: { type: "pixel", value: new Big(10) },
        },
      ],
    });

    expect(() =>
      getCollapsiblePanelForHandleId(actor.value, "resizer-1"),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: No collapsible panel found for handle: resizer-1]`,
    );
  });
});

describe("getCursor", () => {
  describe("horizontal", () => {
    test("works before overshoot", () => {
      expect(
        getCursor({ orientation: "horizontal", dragOvershoot: new Big(-10) }),
      ).toBe("e-resize");
    });

    test("works at overshoot", () => {
      expect(
        getCursor({ orientation: "horizontal", dragOvershoot: new Big(0) }),
      ).toBe("ew-resize");
    });

    test("works after overshoot", () => {
      expect(
        getCursor({ orientation: "horizontal", dragOvershoot: new Big(10) }),
      ).toBe("w-resize");
    });
  });

  describe("vertical", () => {
    test("works before overshoot", () => {
      expect(
        getCursor({ orientation: "vertical", dragOvershoot: new Big(-10) }),
      ).toBe("s-resize");
    });

    test("works at overshoot", () => {
      expect(
        getCursor({ orientation: "vertical", dragOvershoot: new Big(0) }),
      ).toBe("ns-resize");
    });

    test("works after overshoot", () => {
      expect(
        getCursor({ orientation: "vertical", dragOvershoot: new Big(10) }),
      ).toBe("n-resize");
    });
  });
});

describe("initializePanelHandleData", () => {
  test("works with pixel size", () => {
    const data = initializePanelHandleData({
      id: "resizer-1",
      size: "10px",
    });

    expect(data).toMatchInlineSnapshot(`
      {
        "id": "resizer-1",
        "size": {
          "type": "pixel",
          "value": "10",
        },
        "type": "handle",
      }
    `);
  });

  test("works with pixel size", () => {
    const data = initializePanelHandleData({
      id: "resizer-1",
      // @ts-expect-error The types were hard and i wanted to keep the public API simple
      size: {
        type: "pixel",
        value: new Big(10),
      },
    });

    expect(data).toMatchInlineSnapshot(`
      {
        "id": "resizer-1",
        "size": {
          "type": "pixel",
          "value": "10",
        },
        "type": "handle",
      }
    `);
  });
});

describe("prepareSnapshot", () => {
  test("converts sizes to Big", () => {
    const item: Item = initializePanel({
      id: "panel-1",
      min: "100px",
      max: "300px",
      default: "200px",
    });

    prepareSnapshot({
      size: { width: 500, height: 300 },
      items: [item, initializePanel({ id: "panel-2", min: "100px" })],
      groupId: "group-1",
      orientation: "horizontal",
      dragOvershoot: new Big(0),
    });

    expect(item.currentValue.value).toBeInstanceOf(Big);
    expect(item.collapsedSize.value).toBeInstanceOf(Big);

    expect(item.min.value).toBeInstanceOf(Big);

    assert(typeof item.max === "object");
    expect(item.max.value).toBeInstanceOf(Big);

    assert(typeof item.default === "object");
    expect(item.default.value).toBeInstanceOf(Big);
  });
});
