import React from "react";
import { test, expect, describe } from "vitest";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import Cookies from "universal-cookie";

import {
  Autosave,
  Collapsible,
  ConditionalPanel,
  Simple,
  VerticalLayout,
} from "./ReactWindowSplitter.stories.js";
import {
  PanelGroupHandle,
  PanelResizer,
  PanelHandle,
  PanelGroup,
  Panel,
} from "./index.js";

async function dragHandle(options: {
  handleId?: string;
  delta: number;
  orientation?: "horizontal" | "vertical";
}) {
  const orientation = options.orientation || "horizontal";

  // eslint-disable-next-line no-async-promise-executor
  return new Promise<void>(async (resolve) => {
    const handle = document.querySelector(
      options.handleId
        ? `[data-splitter-id="${options.handleId}"]`
        : '[data-splitter-type="handle"]'
    );

    if (!handle) {
      throw new Error(`Handle not found: ${options.handleId}`);
    }

    const rect = handle.getBoundingClientRect();
    const x = rect.x + rect.width / 2;
    const y = rect.y + rect.height / 2;
    const step = options.delta > 0 ? 1 : -1;

    handle.dispatchEvent(
      new PointerEvent("pointerdown", { bubbles: true, clientX: x, clientY: y })
    );

    for (let i = 0; i < Math.abs(options.delta - 1); i++) {
      handle.dispatchEvent(
        new PointerEvent("pointermove", {
          bubbles: true,
          clientX: orientation === "horizontal" ? x + i * step : x,
          clientY: orientation === "vertical" ? y + i * step : y,
        })
      );
      await new Promise((r) => setTimeout(r, 10));
    }

    handle.dispatchEvent(
      new PointerEvent("pointerup", {
        bubbles: true,
        clientX: orientation === "horizontal" ? x + options.delta : x,
        clientY: orientation === "vertical" ? y + options.delta : y,
      })
    );

    resolve();
  });
}

async function waitForMeasurement(handle: PanelGroupHandle) {
  await waitForCondition(() => !handle.getTemplate().includes("minmax"));
  await new Promise((resolve) => setTimeout(resolve, 100));
}

function waitForCondition(condition: () => boolean) {
  return waitFor(
    () => {
      if (!condition()) {
        throw new Error("Not ready");
      }
    },
    {
      timeout: 10_000,
    }
  );
}

test("horizontal layout", async () => {
  const handle = { current: null } as unknown as {
    current: PanelGroupHandle;
  };
  const { getByText } = render(
    <div style={{ width: 500 }}>
      <Simple handle={handle} />
    </div>
  );

  await waitForMeasurement(handle.current);

  expect(getByText("Panel 1")).toBeInTheDocument();
  expect(getByText("Panel 2")).toBeInTheDocument();

  expect(handle.current.getTemplate()).toMatchInlineSnapshot(
    `"244px 10px 244px"`
  );

  // Should respect the min
  await dragHandle({ delta: 300 });
  expect(handle.current.getTemplate()).toMatchInlineSnapshot(
    `"388px 10px 100px"`
  );
});

test("vertical layout", async () => {
  const handle = { current: null } as unknown as {
    current: PanelGroupHandle;
  };
  const { getByText } = render(
    <div style={{ width: 500 }}>
      <VerticalLayout handle={handle} />
    </div>
  );

  await waitForMeasurement(handle.current);

  expect(getByText("top")).toBeInTheDocument();
  expect(getByText("middle")).toBeInTheDocument();
  expect(getByText("bottom")).toBeInTheDocument();

  expect(handle.current.getTemplate()).toMatchInlineSnapshot(
    `"58.640625px 10px 58.203125px 10px 58.640625px"`
  );

  // Should respect the min
  await dragHandle({ delta: 100, orientation: "vertical" });
  expect(handle.current.getTemplate()).toMatchInlineSnapshot(
    `"97.30625px 10px 39.096875px 10px 39.096875px"`
  );
});

test("Conditional Panels", async () => {
  const handle = { current: null } as unknown as {
    current: PanelGroupHandle;
  };
  const { getByText } = render(
    <div style={{ width: 500 }}>
      <ConditionalPanel handle={handle} />
    </div>
  );

  await waitForMeasurement(handle.current);

  expect(handle.current.getTemplate()).toMatchInlineSnapshot(
    `"244px 10px 244px"`
  );

  getByText("Expand").click();
  await waitForCondition(() => handle.current.getTemplate().endsWith("100px"));
  expect(handle.current.getTemplate()).toMatchInlineSnapshot(
    `"236.953125px 10px 141.046875px 10px 100px"`
  );

  getByText("Close").click();
  await waitForCondition(() => !handle.current.getTemplate().endsWith("100px"));
  expect(handle.current.getTemplate()).toMatchInlineSnapshot(
    `"236.953125px 10px 251.046875px"`
  );
});

describe("Autosave", () => {
  test("localStorage", async () => {
    localStorage.clear();

    const handle = { current: null } as unknown as {
      current: PanelGroupHandle;
    };

    render(
      <div style={{ width: 500 }}>
        <Autosave handle={handle} />
      </div>
    );

    await waitForMeasurement(handle.current);

    expect(handle.current.getTemplate()).toMatchInlineSnapshot(
      `"244px 10px 244px"`
    );

    await dragHandle({ delta: 100 });
    await waitForCondition(() =>
      handle.current.getTemplate().endsWith("146px")
    );
    expect(handle.current.getTemplate()).toMatchInlineSnapshot(
      `"342px 10px 146px"`
    );

    await waitForCondition(() =>
      Boolean(localStorage.getItem("autosave-example"))
    );
    const obj = JSON.parse(localStorage.getItem("autosave-example") || "{}");
    expect({
      ...obj,
      context: {
        ...obj.context,
        groupId: undefined,
      },
    }).toMatchSnapshot();
  });

  test("cookie", async () => {
    // clear cookies
    document.cookie = "test=; expires=Thu, 01 Jan 1970 00:00:00 GMT";

    const handle = { current: null } as unknown as {
      current: PanelGroupHandle;
    };

    render(
      <div style={{ width: 500 }}>
        <PanelGroup
          handle={handle}
          orientation="horizontal"
          autosaveId="autosave-cookie-example"
          autosaveStrategy="cookie"
          style={{ height: 200 }}
        >
          <Panel id="panel1">1</Panel>
          <PanelResizer
            id="resizer1"
            size="10px"
            style={{ background: "red" }}
          />
          <Panel id="panel2">2</Panel>
        </PanelGroup>
      </div>
    );

    await waitForMeasurement(handle.current);
    expect(handle.current.getTemplate()).toMatchInlineSnapshot(
      `"245px 10px 245px"`
    );

    await dragHandle({ delta: 100 });
    await waitForCondition(() =>
      handle.current.getTemplate().endsWith("147px")
    );
    expect(handle.current.getTemplate()).toMatchInlineSnapshot(
      `"343px 10px 147px"`
    );

    await waitForCondition(() =>
      document.cookie.includes("autosave-cookie-example")
    );

    expect(document.cookie).toMatchSnapshot();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ActualClass = (Cookies as any).default || Cookies;
    const cookies = new ActualClass(null, { path: "/" });
    const snapshot = cookies.get("autosave-cookie-example");

    cleanup();

    render(
      <div style={{ width: 500 }}>
        <PanelGroup
          handle={handle}
          orientation="horizontal"
          autosaveId="autosave-cookie-example"
          autosaveStrategy="cookie"
          style={{ height: 200 }}
          snapshot={snapshot}
        >
          <Panel id="panel1">1</Panel>
          <PanelResizer
            id="resizer1"
            size="10px"
            style={{ background: "red" }}
          />
          <Panel id="panel2">2</Panel>
        </PanelGroup>
      </div>
    );

    expect(handle.current.getTemplate()).toMatchInlineSnapshot(
      `"343px 10px 147px"`
    );
  });
});

test("Keyboard interactions with collapsed panels", async () => {
  const handle = { current: null } as unknown as {
    current: PanelGroupHandle;
  };
  const rightHandle = { current: null } as unknown as {
    current: PanelHandle;
  };
  render(
    <div style={{ width: 500 }}>
      <Collapsible handle={handle} rightPanelHandle={rightHandle} />
    </div>
  );

  await waitForMeasurement(handle.current);

  expect(handle.current.getTemplate()).toMatchInlineSnapshot(
    `"209px 10px 209px 10px 60px"`
  );

  const resizer2 = document.getElementById("resizer-2")!;
  fireEvent.keyDown(resizer2, { key: "Enter" });
  await waitForCondition(() => handle.current.getTemplate().endsWith("100px"));

  expect(handle.current.getTemplate()).toMatchInlineSnapshot(
    `"209px 10px 169px 10px 100px"`
  );

  fireEvent.keyDown(resizer2, { key: "ArrowLeft" });
  fireEvent.keyDown(resizer2, { key: "ArrowLeft" });
  fireEvent.keyDown(resizer2, { key: "ArrowLeft" });
  fireEvent.keyDown(resizer2, { key: "ArrowLeft" });

  expect(handle.current.getTemplate()).toMatchInlineSnapshot(
    `"209px 10px 165px 10px 104px"`
  );

  fireEvent.keyDown(resizer2, { key: "ArrowLeft", shiftKey: true });

  await waitForCondition(() => handle.current.getTemplate().endsWith("119px"));

  expect(handle.current.getTemplate()).toMatchInlineSnapshot(
    `"209px 10px 150px 10px 119px"`
  );

  fireEvent.keyDown(resizer2, { key: "Enter" });

  await waitForCondition(() => handle.current.getTemplate().endsWith("60px"));

  expect(handle.current.getTemplate()).toMatchInlineSnapshot(
    `"209px 10px 209px 10px 60px"`
  );

  fireEvent.keyDown(resizer2, { key: "Enter" });

  await waitForCondition(() => handle.current.getTemplate().endsWith("119px"));

  expect(handle.current.getTemplate()).toMatchInlineSnapshot(
    `"209px 10px 150px 10px 119px"`
  );
});

describe("imperative panel API", async () => {
  test("panel group", async () => {
    const handle = { current: null } as unknown as {
      current: PanelGroupHandle;
    };

    render(
      <div style={{ width: 500 }}>
        <Collapsible handle={handle} />
      </div>
    );

    await waitForMeasurement(handle.current);

    expect(handle.current.getPercentageSizes()).toMatchInlineSnapshot(`
      [
        0.5,
        0.020080321285140562,
        0.5,
        0.020080321285140562,
        0.12048192771084337,
      ]
    `);

    expect(handle.current.getPixelSizes()).toMatchInlineSnapshot(`
      [
        209,
        10,
        209,
        10,
        60,
      ]
    `);

    expect(handle.current.getTemplate()).toMatchInlineSnapshot(
      `"209px 10px 209px 10px 60px"`
    );
  });

  test("panel", async () => {
    const handle = { current: null } as unknown as {
      current: PanelGroupHandle;
    };
    const rightHandle = { current: null } as unknown as {
      current: PanelHandle;
    };
    const leftHandle = { current: null } as unknown as {
      current: PanelHandle;
    };

    render(
      <div style={{ width: 500 }}>
        <Collapsible
          handle={handle}
          leftPanelHandle={leftHandle}
          rightPanelHandle={rightHandle}
        />
      </div>
    );

    await waitForMeasurement(handle.current);

    expect(rightHandle.current.isCollapsed()).toBe(true);
    expect(rightHandle.current.isExpanded()).toBe(false);

    rightHandle.current.expand();
    await waitForCondition(() =>
      handle.current.getTemplate().endsWith("100px")
    );

    expect(rightHandle.current.isCollapsed()).toBe(false);
    expect(rightHandle.current.isExpanded()).toBe(true);

    rightHandle.current.collapse();
    await waitForCondition(() => handle.current.getTemplate().endsWith("60px"));

    expect(rightHandle.current.isCollapsed()).toBe(true);
    expect(rightHandle.current.isExpanded()).toBe(false);

    // Test the non controlled version

    expect(leftHandle.current.isCollapsed()).toBe(false);
    expect(leftHandle.current.isExpanded()).toBe(true);

    leftHandle.current.collapse();
    await waitForCondition(() =>
      handle.current.getTemplate().startsWith("60px")
    );

    expect(leftHandle.current.isCollapsed()).toBe(true);
    expect(leftHandle.current.isExpanded()).toBe(false);
    expect(rightHandle.current.getPercentageSize()).toBe(
      leftHandle.current.getPercentageSize()
    );
    expect(rightHandle.current.getPixelSize()).toBe(
      leftHandle.current.getPixelSize()
    );

    leftHandle.current.expand();
    await waitForCondition(
      () => !handle.current.getTemplate().startsWith("60px")
    );

    expect(leftHandle.current.isCollapsed()).toBe(false);
    expect(leftHandle.current.isExpanded()).toBe(true);
  });
});
