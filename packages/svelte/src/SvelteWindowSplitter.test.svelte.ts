import "@testing-library/jest-dom/vitest";

import { cleanup, fireEvent, render, waitFor } from "@testing-library/svelte";
import { afterEach, describe, expect, test, vi } from "vitest";
import * as Cookies from "tiny-cookie";

import Collapsible, {
  handle as collapsibleHandle,
  leftHandle,
  rightHandle,
} from "./stories/Collapsible.svelte";
import AutosaveCookie from "./stories/AutosaveCookie.svelte";
import Autosave, { handle as autosaveHandle } from "./stories/Autosave.svelte";
import AutosaveCollapsible from "./stories/AutosaveCollapsible.svelte";
import DynamicConstraints, {
  handle as dynamicConstraintsHandle,
} from "./stories/DynamicConstraints.svelte";
import Conditional, {
  handle as conditionalHandle,
} from "./stories/Conditional.svelte";
import Simple, { handle as simpleHandle } from "./stories/Simple.svelte";
import VerticalLayout, {
  handle as verticalHandle,
} from "./stories/VerticalLayout.svelte";
import { createTestUtils, dragHandle } from "@window-splitter/interface/test";
import { PanelGroupHandle } from "@window-splitter/interface";

const { expectTemplate, waitForMeasurement, waitForCondition } =
  createTestUtils({
    waitFor,
  });

afterEach(() => {
  cleanup();
});

test("horizontal layout", async () => {
  const component = render(Simple);

  await waitForMeasurement(simpleHandle);

  expect(component.getByText("Panel 1")).toBeInTheDocument();
  expect(component.getByText("Panel 2")).toBeInTheDocument();

  await expectTemplate(simpleHandle, "244px 10px 244px");

  // Should respect the min
  await dragHandle({ delta: 300 });
  await expectTemplate(simpleHandle, "388px 10px 100px");
});

test("vertical layout", async () => {
  const component = render(VerticalLayout);

  await waitForMeasurement(verticalHandle);

  expect(component.getByText("top")).toBeInTheDocument();
  expect(component.getByText("middle")).toBeInTheDocument();
  expect(component.getByText("bottom")).toBeInTheDocument();

  await expectTemplate(verticalHandle, "96px 10px 108px 10px 96px");

  // Should respect the min
  await dragHandle({ delta: 100, orientation: "vertical" });
  await expectTemplate(verticalHandle, "172px 10px 64px 10px 64px");
});

test("Conditional Panels", async () => {
  const component = render(Conditional);

  await waitForMeasurement(conditionalHandle);
  await expectTemplate(conditionalHandle, "244px 10px 244px");

  component.getByText("Expand").click();
  await expectTemplate(conditionalHandle, "244px 10px 134px 10px 100px");

  component.getByText("Close").click();
  await expectTemplate(conditionalHandle, "244px 10px 244px");
});

test("Dynamic constraints", async () => {
  const component = render(DynamicConstraints);

  await waitForMeasurement(dynamicConstraintsHandle);
  await expectTemplate(dynamicConstraintsHandle, "100px 10px 178px 10px 700px");

  component.getByText("Toggle Custom").click();
  await expectTemplate(dynamicConstraintsHandle, "500px 10px 178px 10px 300px");

  component.getByText("Toggle Custom").click();
  await expectTemplate(dynamicConstraintsHandle, "400px 10px 178px 10px 400px");
});

describe("Autosave", () => {
  test("localStorage", async () => {
    localStorage.clear();

    render(Autosave);

    await waitForMeasurement(autosaveHandle);
    await expectTemplate(autosaveHandle, "244px 10px 244px");

    await dragHandle({ delta: 100 });
    await expectTemplate(autosaveHandle, "342px 10px 146px");

    await waitForCondition(() =>
      Boolean(localStorage.getItem("autosave-example-svelte")),
    );
    const obj = JSON.parse(
      localStorage.getItem("autosave-example-svelte") || "{}",
    );
    expect(obj.items).toMatchSnapshot();
  });

  test("callback", async () => {
    localStorage.clear();

    const spy = vi.fn();
    const handle = $state<{ current: PanelGroupHandle | null }>({
      current: null,
    });

    render(AutosaveCollapsible, {
      props: { onCollapseChange: spy, handle },
    });

    await dragHandle({ delta: -200 });
    await expectTemplate(handle.current!, "100px 10px 388px");
    expect(spy).toHaveBeenCalledWith(true);

    cleanup();

    render(AutosaveCollapsible, {
      props: { onCollapseChange: spy, handle },
    });

    await expectTemplate(handle.current!, "100px 10px 388px");
    await dragHandle({ delta: 200 });
    expect(spy).toHaveBeenCalledWith(false);
  });

  test("cookie", async () => {
    // clear cookies
    document.cookie = "test=; expires=Thu, 01 Jan 1970 00:00:00 GMT";

    const handle = $state<{ current: PanelGroupHandle | null }>({
      current: null,
    });

    render(AutosaveCookie, {
      props: { handle, snapshot: undefined },
    });

    await waitForMeasurement(handle.current!);
    await expectTemplate(handle.current!, "245px 10px 245px");

    await dragHandle({ delta: 100 });
    await expectTemplate(handle.current!, "343px 10px 147px");

    await waitForCondition(() =>
      document.cookie.includes("autosave-cookie-svelte"),
    );

    expect(document.cookie).toMatchSnapshot();

    const snapshot = Cookies.get("autosave-cookie-svelte");

    cleanup();

    render(AutosaveCookie, {
      props: { snapshot: JSON.parse(snapshot || "{}"), handle },
    });

    await expectTemplate(handle.current!, "343px 10px 147px");
  });
});

describe("imperative panel API", async () => {
  test("panel group", async () => {
    render(Collapsible);

    await waitForMeasurement(collapsibleHandle);

    expect(collapsibleHandle.getPercentageSizes()).toMatchInlineSnapshot(`
      [
        0.5,
        0.020080321285140562,
        0.5,
        0.020080321285140562,
        0.12048192771084337,
      ]
    `);

    expect(collapsibleHandle.getPixelSizes()).toMatchInlineSnapshot(`
      [
        209,
        10,
        209,
        10,
        60,
      ]
    `);

    await expectTemplate(collapsibleHandle, "209px 10px 209px 10px 60px");
  });

  test("panel", async () => {
    render(Collapsible);

    await waitForMeasurement(collapsibleHandle);

    expect(rightHandle.isCollapsed()).toBe(true);
    expect(rightHandle.isExpanded()).toBe(false);

    rightHandle.expand();
    await new Promise((resolve) => setTimeout(resolve, 2000));

    expect(rightHandle.isCollapsed()).toBe(false);
    expect(rightHandle.isExpanded()).toBe(true);

    rightHandle.collapse();
    await new Promise((resolve) => setTimeout(resolve, 2000));

    expect(rightHandle.isCollapsed()).toBe(true);
    expect(rightHandle.isExpanded()).toBe(false);

    // Test the non controlled version

    expect(leftHandle.isCollapsed()).toBe(false);
    expect(leftHandle.isExpanded()).toBe(true);

    leftHandle.collapse();
    await new Promise((resolve) => setTimeout(resolve, 2000));

    expect(leftHandle.isCollapsed()).toBe(true);
    expect(leftHandle.isExpanded()).toBe(false);
    expect(rightHandle.getPercentageSize()).toBe(
      leftHandle.getPercentageSize(),
    );
    expect(rightHandle.getPixelSize()).toBe(leftHandle.getPixelSize());

    leftHandle.expand();
    await new Promise((resolve) => setTimeout(resolve, 5000));

    expect(leftHandle.isCollapsed()).toBe(false);
    expect(leftHandle.isExpanded()).toBe(true);
  });
});

test("Keyboard interactions with collapsed panels", async () => {
  render(Collapsible);

  await waitForMeasurement(collapsibleHandle);
  await expectTemplate(collapsibleHandle, "209px 10px 209px 10px 60px");

  const resizer2 = document.getElementById("resizer-2")!;
  fireEvent.keyDown(resizer2, { key: "Enter" });
  await expectTemplate(
    collapsibleHandle,
    "209.015625px 10px 167px 10px 101.984375px",
  );

  fireEvent.keyDown(resizer2, { key: "ArrowLeft" });
  fireEvent.keyDown(resizer2, { key: "ArrowLeft" });
  fireEvent.keyDown(resizer2, { key: "ArrowLeft" });
  fireEvent.keyDown(resizer2, { key: "ArrowLeft" });
  await expectTemplate(
    collapsibleHandle,
    "209.015625px 10px 163px 10px 105.984375px",
  );

  fireEvent.keyDown(resizer2, { key: "ArrowLeft", shiftKey: true });
  await expectTemplate(
    collapsibleHandle,
    "209.03125px 10px 147.984375px 10px 120.984375px",
  );

  fireEvent.keyDown(resizer2, { key: "Enter" });
  await expectTemplate(
    collapsibleHandle,
    "209.03125px 10px 208.96875px 10px 60px",
  );

  fireEvent.keyDown(resizer2, { key: "Enter" });
  await expectTemplate(
    collapsibleHandle,
    "209.046875px 10px 144.9375px 10px 124.015625px",
  );
});
