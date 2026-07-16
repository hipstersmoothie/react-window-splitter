import { test, expect, describe, vi, afterEach } from "vitest";
import { cleanup, fireEvent, render, waitFor } from "@solidjs/testing-library";
import * as Cookies from "tiny-cookie";

import { PanelGroupHandle, PanelHandle } from "@window-splitter/interface";
import {
  Autosave,
  AutosaveCollapsible,
  Collapsible,
  ConditionalPanel,
  Simple,
  VerticalLayout,
  DynamicConstraints,
  AutosaveCookie,
} from "./SolidWindowSplitter.stories.jsx";
import { createTestUtils, dragHandle } from "@window-splitter/interface/test";

const { expectTemplate, waitForMeasurement, waitForCondition } =
  createTestUtils({ waitFor });

afterEach(() => {
  cleanup();
});

test("horizontal layout", async () => {
  let handle: PanelGroupHandle | null = null!;

  const { getByText } = render(() => (
    <div style={{ width: "500px" }}>
      <Simple handle={(v) => (handle = v)} />
    </div>
  ));

  await waitForMeasurement(handle);

  expect(getByText("Panel 1")).toBeInTheDocument();
  expect(getByText("Panel 2")).toBeInTheDocument();

  await expectTemplate(handle, "244px 10px 244px");

  // Should respect the min
  await dragHandle({ delta: 300 });
  await expectTemplate(handle, "388px 10px 100px");
});

test("vertical layout", async () => {
  let handle: PanelGroupHandle | null = null!;

  const { getByText } = render(() => (
    <div style={{ width: "500px" }}>
      <VerticalLayout handle={(v) => (handle = v)} />
    </div>
  ));

  await waitForMeasurement(handle);

  expect(getByText("top")).toBeInTheDocument();
  expect(getByText("middle")).toBeInTheDocument();
  expect(getByText("bottom")).toBeInTheDocument();

  await expectTemplate(handle, "96px 10px 108px 10px 96px");

  // Should respect the min
  await dragHandle({ delta: 100, orientation: "vertical" });
  await expectTemplate(handle, "172px 10px 64px 10px 64px");
});

test("Conditional Panels", async () => {
  let handle: PanelGroupHandle | null = null!;

  const { getByText } = render(() => (
    <div style={{ width: "500px" }}>
      <ConditionalPanel handle={(v) => (handle = v)} />
    </div>
  ));

  await waitForMeasurement(handle);
  await expectTemplate(handle, "244px 10px 244px");

  getByText("Expand").click();
  await expectTemplate(handle, "244px 10px 134px 10px 100px");

  getByText("Close").click();
  await expectTemplate(handle, "244px 10px 244px");
});

test("Dynamic constraints", async () => {
  let handle: PanelGroupHandle | null = null!;

  const { getByText } = render(() => (
    <div style={{ width: "1000px" }}>
      <DynamicConstraints handle={(v) => (handle = v)} />
    </div>
  ));

  await waitForMeasurement(handle);
  await expectTemplate(handle, "100px 10px 178px 10px 700px");

  getByText("Toggle Custom").click();
  await expectTemplate(handle, "500px 10px 178px 10px 300px");

  getByText("Toggle Custom").click();
  await expectTemplate(handle, "400px 10px 178px 10px 400px");
});

describe("Autosave", () => {
  test("localStorage", async () => {
    localStorage.clear();

    let handle: PanelGroupHandle | null = null!;

    render(() => (
      <div style={{ width: "500px" }}>
        <Autosave handle={(v) => (handle = v)} />
      </div>
    ));

    await waitForMeasurement(handle);
    await expectTemplate(handle, "244px 10px 244px");

    await dragHandle({ delta: 100 });
    await expectTemplate(handle, "342px 10px 146px");

    await waitForCondition(() =>
      Boolean(localStorage.getItem("autosave-example-solid")),
    );
    const obj = JSON.parse(
      localStorage.getItem("autosave-example-solid") || "{}",
    );
    expect(obj.items).toMatchSnapshot();
  });

  test("callback", async () => {
    localStorage.clear();

    let handle: PanelGroupHandle | null = null!;

    const spy = vi.fn();

    render(() => (
      <div style={{ width: "500px" }}>
        <AutosaveCollapsible
          handle={(v) => (handle = v)}
          onCollapseChange={spy}
        />
      </div>
    ));

    await dragHandle({ delta: -200 });
    await expectTemplate(handle, "100px 10px 388px");
    expect(spy).toHaveBeenCalledWith(true);

    cleanup();

    render(() => (
      <div style={{ width: "500px" }}>
        <AutosaveCollapsible
          handle={(v) => (handle = v)}
          onCollapseChange={spy}
        />
      </div>
    ));

    await expectTemplate(handle, "100px 10px 388px");
    await dragHandle({ delta: 200 });
    expect(spy).toHaveBeenCalledWith(false);
  });

  test("cookie", async () => {
    // clear cookies
    document.cookie = "test=; expires=Thu, 01 Jan 1970 00:00:00 GMT";

    let handle: PanelGroupHandle | null = null!;

    render(() => (
      <div style={{ width: "502px" }}>
        <AutosaveCookie handle={(v) => (handle = v)} />
      </div>
    ));

    await waitForMeasurement(handle);
    await expectTemplate(handle, "245px 10px 245px");

    await dragHandle({ delta: 100 });
    await expectTemplate(handle, "343px 10px 147px");

    await waitForCondition(() =>
      document.cookie.includes("autosave-cookie-solid"),
    );

    expect(document.cookie).toMatchSnapshot();

    const snapshot = Cookies.get("autosave-cookie-solid");

    cleanup();

    render(() => (
      <div style={{ width: "500px" }}>
        <AutosaveCookie
          handle={(v) => (handle = v)}
          snapshot={snapshot ? JSON.parse(snapshot) : undefined}
        />
      </div>
    ));

    await expectTemplate(handle, "341.609375px 10px 146.390625px");
  });
});

test("Keyboard interactions with collapsed panels", async () => {
  let handle: PanelGroupHandle | null = null!;

  render(() => (
    <div style={{ width: "500px" }}>
      <Collapsible handle={(v) => (handle = v)} />
    </div>
  ));

  await waitForMeasurement(handle);
  await expectTemplate(handle, "209px 10px 209px 10px 60px");

  const resizer2 = document.getElementById("resizer-2")!;
  fireEvent.keyDown(resizer2, { key: "Enter" });
  await expectTemplate(handle, "209.015625px 10px 167px 10px 101.984375px");

  fireEvent.keyDown(resizer2, { key: "ArrowLeft" });
  fireEvent.keyDown(resizer2, { key: "ArrowLeft" });
  fireEvent.keyDown(resizer2, { key: "ArrowLeft" });
  fireEvent.keyDown(resizer2, { key: "ArrowLeft" });
  await expectTemplate(handle, "209.015625px 10px 163px 10px 105.984375px");

  fireEvent.keyDown(resizer2, { key: "ArrowLeft", shiftKey: true });
  await expectTemplate(
    handle,
    "209.03125px 10px 147.984375px 10px 120.984375px",
  );

  fireEvent.keyDown(resizer2, { key: "Enter" });
  await expectTemplate(handle, "209.03125px 10px 208.96875px 10px 60px");

  fireEvent.keyDown(resizer2, { key: "Enter" });
  await expectTemplate(
    handle,
    "209.046875px 10px 144.9375px 10px 124.015625px",
  );
});

describe("imperative panel API", async () => {
  test("panel group", async () => {
    let handle: PanelGroupHandle;

    render(() => (
      <div style={{ width: "500px" }}>
        <Collapsible handle={(v) => (handle = v)} />
      </div>
    ));

    await waitForMeasurement(handle!);

    expect(handle!.getPercentageSizes()).toMatchInlineSnapshot(`
      [
        0.5,
        0.020080321285140562,
        0.5,
        0.020080321285140562,
        0.12048192771084337,
      ]
    `);

    expect(handle!.getPixelSizes()).toMatchInlineSnapshot(`
      [
        209,
        10,
        209,
        10,
        60,
      ]
    `);

    await expectTemplate(handle!, "209px 10px 209px 10px 60px");
  });

  test("panel", async () => {
    let handle: PanelGroupHandle;
    let rightHandle: PanelHandle;
    let leftHandle: PanelHandle;

    render(() => (
      <div style={{ width: "500px" }}>
        <Collapsible
          handle={(v) => (handle = v)}
          rightPanelHandle={(v) => (rightHandle = v)}
          leftPanelHandle={(v) => (leftHandle = v)}
        />
      </div>
    ));

    await waitForMeasurement(handle!);

    expect(rightHandle!.isCollapsed()).toBe(true);
    expect(rightHandle!.isExpanded()).toBe(false);

    rightHandle!.expand();
    await new Promise((resolve) => setTimeout(resolve, 2000));

    expect(rightHandle!.isCollapsed()).toBe(false);
    expect(rightHandle!.isExpanded()).toBe(true);

    rightHandle!.collapse();
    await new Promise((resolve) => setTimeout(resolve, 2000));

    expect(rightHandle!.isCollapsed()).toBe(true);
    expect(rightHandle!.isExpanded()).toBe(false);

    // Test the non controlled version

    expect(leftHandle!.isCollapsed()).toBe(false);
    expect(leftHandle!.isExpanded()).toBe(true);

    leftHandle!.collapse();
    await new Promise((resolve) => setTimeout(resolve, 2000));

    expect(leftHandle!.isCollapsed()).toBe(true);
    expect(leftHandle!.isExpanded()).toBe(false);
    expect(rightHandle!.getPercentageSize()).toBe(
      leftHandle!.getPercentageSize(),
    );
    expect(rightHandle!.getPixelSize()).toBe(leftHandle!.getPixelSize());

    leftHandle!.expand();
    await new Promise((resolve) => setTimeout(resolve, 5000));

    expect(leftHandle!.isCollapsed()).toBe(false);
    expect(leftHandle!.isExpanded()).toBe(true);
  });
});
