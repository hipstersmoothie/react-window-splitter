import "../.storybook/preview.css";

import { test, expect, describe, vi } from "vitest";
import { cleanup, getByText, waitFor } from "@testing-library/vue";
import { fireEvent } from "@testing-library/dom";
import { composeStories } from "@storybook/vue3";
import { createTestUtils, dragHandle } from "@window-splitter/interface/test";
import * as Cookies from "tiny-cookie";

import * as stories from "./VueWindowSplitter.stories.js";
import { PanelGroupHandle, PanelHandle } from "@window-splitter/interface";

const {
  Simple,
  Collapsible,
  VerticalLayout,
  ConditionalPanel,
  DynamicConstraints,
  Autosave,
  AutosaveCollapsible,
  AutosaveCookie,
} = composeStories(stories);

const { waitForMeasurement, expectTemplate, waitForCondition } =
  createTestUtils({
    waitFor,
  });

test("horizontal layout", async () => {
  const handle = { value: null } as { value: PanelGroupHandle | null };
  await Simple.run({ args: { handle } });

  await waitForMeasurement(handle.value!);

  expect(getByText(document.body, "Panel 1")).toBeInTheDocument();
  expect(getByText(document.body, "Panel 2")).toBeInTheDocument();

  await expectTemplate(handle.value!, "244px 10px 244px");

  // Should respect the min
  await dragHandle({ delta: 300 });
  await expectTemplate(handle.value!, "388px 10px 100px");
});

test("vertical layout", async () => {
  const handle = { value: null } as { value: PanelGroupHandle | null };
  await VerticalLayout.run({ args: { handle } });
  await waitForMeasurement(handle.value!);

  expect(getByText(document.body, "top")).toBeInTheDocument();
  expect(getByText(document.body, "middle")).toBeInTheDocument();
  expect(getByText(document.body, "bottom")).toBeInTheDocument();

  await expectTemplate(handle.value!, "96px 10px 108px 10px 96px");

  // Should respect the min
  await dragHandle({ delta: 100, orientation: "vertical" });
  await expectTemplate(handle.value!, "172px 10px 64px 10px 64px");
});

test("Conditional Panels", async () => {
  const handle = { value: null } as { value: PanelGroupHandle | null };
  await ConditionalPanel.run({ args: { handle } });
  await waitForMeasurement(handle.value!);

  await expectTemplate(handle.value!, "244px 10px 244px");

  getByText(document.body, "Expand").click();
  await expectTemplate(handle.value!, "244px 10px 134px 10px 100px");

  getByText(document.body, "Close").click();
  await expectTemplate(handle.value!, "244px 10px 244px");
});

test("Dynamic constraints", async () => {
  const handle = { value: null } as { value: PanelGroupHandle | null };
  await DynamicConstraints.run({ args: { handle } });
  await waitForMeasurement(handle.value!);

  await waitForMeasurement(handle.value!);
  await expectTemplate(handle.value!, "100px 10px 178px 10px 700px");

  getByText(document.body, "Toggle Custom").click();
  await expectTemplate(handle.value!, "500px 10px 178px 10px 300px");

  getByText(document.body, "Toggle Custom").click();
  await expectTemplate(handle.value!, "400px 10px 178px 10px 400px");
});

describe("Autosave", () => {
  test("localStorage", async () => {
    localStorage.clear();

    const handle = { value: null } as { value: PanelGroupHandle | null };
    await Autosave.run({ args: { handle } });

    await waitForMeasurement(handle.value!);
    await expectTemplate(handle.value!, "244px 10px 244px");

    await dragHandle({ delta: 100 });
    await expectTemplate(handle.value!, "342px 10px 146px");

    await waitForCondition(() =>
      Boolean(localStorage.getItem("autosave-example-vue")),
    );
    const obj = JSON.parse(
      localStorage.getItem("autosave-example-vue") || "{}",
    );
    expect(obj.items).toMatchSnapshot();
  });

  test("callback", async () => {
    localStorage.clear();

    const handle = { value: null } as { value: PanelGroupHandle | null };
    const spy = vi.fn();

    await AutosaveCollapsible.run({ args: { handle, onCollapseChange: spy } });

    await dragHandle({ delta: -200 });
    await expectTemplate(handle.value!, "100px 10px 388px");
    expect(spy).toHaveBeenCalledWith(true);

    cleanup();

    const spy2 = vi.fn();
    await AutosaveCollapsible.run({ args: { handle, onCollapseChange: spy2 } });

    await expectTemplate(handle.value!, "100px 10px 388px");
    await dragHandle({ delta: 200 });
    expect(spy2).toHaveBeenCalledWith(false);
  });

  test("cookie", async () => {
    // clear cookies
    document.cookie = "test=; expires=Thu, 01 Jan 1970 00:00:00 GMT";

    const handle = { value: null } as { value: PanelGroupHandle | null };
    await AutosaveCookie.run({ args: { handle } });

    await waitForMeasurement(handle.value!);
    await expectTemplate(handle.value!, "245px 10px 245px");

    await dragHandle({ delta: 100 });
    await expectTemplate(handle.value!, "343px 10px 147px");

    await waitForCondition(() =>
      document.cookie.includes("autosave-cookie-vue"),
    );

    expect(document.cookie).toMatchSnapshot();

    const snapshot = Cookies.get("autosave-cookie-vue");

    cleanup();

    const handle2 = { value: null } as { value: PanelGroupHandle | null };
    await AutosaveCookie.run({
      args: { handle: handle2, snapshot: JSON.parse(snapshot!) },
    });

    await expectTemplate(handle2.value!, "343px 10px 147px");
  });
});

test("Keyboard interactions with collapsed panels", async () => {
  const handle = { value: null } as { value: PanelGroupHandle | null };
  await Collapsible.run({ args: { handle } });

  await waitForMeasurement(handle.value!);
  await expectTemplate(handle.value!, "209px 10px 209px 10px 60px");

  const resizer2 = document.getElementById("resizer-2")!;
  fireEvent.keyDown(resizer2, { key: "Enter" });
  await expectTemplate(
    handle.value!,
    "209.015625px 10px 167px 10px 101.984375px",
  );

  fireEvent.keyDown(resizer2, { key: "ArrowLeft" });
  fireEvent.keyDown(resizer2, { key: "ArrowLeft" });
  fireEvent.keyDown(resizer2, { key: "ArrowLeft" });
  fireEvent.keyDown(resizer2, { key: "ArrowLeft" });
  await expectTemplate(
    handle.value!,
    "209.015625px 10px 163px 10px 105.984375px",
  );

  fireEvent.keyDown(resizer2, { key: "ArrowLeft", shiftKey: true });
  await expectTemplate(
    handle.value!,
    "209.03125px 10px 147.984375px 10px 120.984375px",
  );

  fireEvent.keyDown(resizer2, { key: "Enter" });
  await expectTemplate(handle.value!, "209.03125px 10px 208.96875px 10px 60px");

  fireEvent.keyDown(resizer2, { key: "Enter" });
  await expectTemplate(
    handle.value!,
    "209.046875px 10px 144.9375px 10px 124.015625px",
  );
});

describe("imperative panel API", async () => {
  test("panel group", async () => {
    const handle = { value: null } as { value: PanelGroupHandle | null };

    await Collapsible.run({ args: { handle } });
    await waitForMeasurement(handle.value!);

    expect(handle.value!.getPercentageSizes()).toMatchInlineSnapshot(`
      [
        0.5,
        0.020080321285140562,
        0.5,
        0.020080321285140562,
        0.12048192771084337,
      ]
    `);

    expect(handle.value!.getPixelSizes()).toMatchInlineSnapshot(`
      [
        209,
        10,
        209,
        10,
        60,
      ]
    `);

    await expectTemplate(handle.value!, "209px 10px 209px 10px 60px");
  });

  test("panel", async () => {
    const handle = { value: null } as { value: PanelGroupHandle | null };
    const rightHandle = { value: null } as { value: PanelHandle | null };
    const leftHandle = { value: null } as { value: PanelHandle | null };

    await Collapsible.run({ args: { handle, leftHandle, rightHandle } });
    await waitForMeasurement(handle.value!);

    expect(rightHandle.value!.isCollapsed()).toBe(true);
    expect(rightHandle.value!.isExpanded()).toBe(false);

    rightHandle.value!.expand();
    await new Promise((resolve) => setTimeout(resolve, 2000));

    expect(rightHandle.value!.isCollapsed()).toBe(false);
    expect(rightHandle.value!.isExpanded()).toBe(true);

    rightHandle.value!.collapse();
    await new Promise((resolve) => setTimeout(resolve, 2000));

    expect(rightHandle.value!.isCollapsed()).toBe(true);
    expect(rightHandle.value!.isExpanded()).toBe(false);

    // Test the non controlled version

    expect(leftHandle.value!.isCollapsed()).toBe(false);
    expect(leftHandle.value!.isExpanded()).toBe(true);

    leftHandle.value!.collapse();
    await new Promise((resolve) => setTimeout(resolve, 2000));

    expect(leftHandle.value!.isCollapsed()).toBe(true);
    expect(leftHandle.value!.isExpanded()).toBe(false);
    expect(rightHandle.value!.getPercentageSize()).toBe(
      leftHandle.value!.getPercentageSize(),
    );
    expect(rightHandle.value!.getPixelSize()).toBe(
      leftHandle.value!.getPixelSize(),
    );

    leftHandle.value!.expand();
    await new Promise((resolve) => setTimeout(resolve, 5000));

    expect(leftHandle.value!.isCollapsed()).toBe(false);
    expect(leftHandle.value!.isExpanded()).toBe(true);
  });
});
