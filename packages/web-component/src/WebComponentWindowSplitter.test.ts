import "../.storybook/preview.css";

import { test, expect, describe, vi, afterEach } from "vitest";
import { getByText, waitFor, fireEvent } from "@testing-library/dom";
import { createTestUtils, dragHandle } from "@window-splitter/interface/test";
import * as Cookies from "tiny-cookie";

import * as stories from "./WebComponentWindowSplitter.stories.js";
import { Panel, PanelGroup, PanelResizer } from "./index.js";
import { render as litRender, TemplateResult } from "lit";

customElements.define("window-splitter", PanelGroup);
customElements.define("window-panel", Panel);
customElements.define("window-panel-resizer", PanelResizer);

async function getHandle(selector: string) {
  await waitFor(() => {
    const handle = document.querySelector(selector) as PanelGroup;
    if (!handle) {
      throw new Error("Handle not found");
    }
    return true;
  });

  return document.querySelector(selector) as PanelGroup;
}

const containers = new Set<HTMLElement>();

function cleanup(): void {
  for (const container of containers) {
    container.remove();
  }
  containers.clear();
}

function render(template: TemplateResult) {
  const container = document.body.appendChild(document.createElement("div"));
  litRender(template, container);
  containers.add(container);
}

const { waitForMeasurement, expectTemplate, waitForCondition } =
  createTestUtils({
    waitFor,
  });

afterEach(cleanup);

test("horizontal layout", async () => {
  render(stories.Simple.render());

  const handle = await getHandle("window-splitter");

  await waitForMeasurement(handle!);

  expect(getByText(document.body, "Panel 1")).toBeInTheDocument();
  expect(getByText(document.body, "Panel 2")).toBeInTheDocument();

  await expectTemplate(handle!, "244px 10px 244px");

  // Should respect the min
  await dragHandle({ delta: 300 });
  await expectTemplate(handle!, "388px 10px 100px");
});

test("vertical layout", async () => {
  render(stories.VerticalLayout.render());

  const handle = await getHandle("window-splitter");

  await waitForMeasurement(handle!);

  expect(getByText(document.body, "top")).toBeInTheDocument();
  expect(getByText(document.body, "middle")).toBeInTheDocument();
  expect(getByText(document.body, "bottom")).toBeInTheDocument();

  await expectTemplate(handle!, "96px 10px 108px 10px 96px");

  // Should respect the min
  await dragHandle({ delta: 100, orientation: "vertical" });
  await expectTemplate(handle!, "172px 10px 64px 10px 64px");
});

test("Conditional Panels", async () => {
  render(stories.ConditionalPanel.render());
  const handle = await getHandle("window-splitter");

  await waitForMeasurement(handle!);

  await expectTemplate(handle!, "244px 10px 244px");

  getByText(document.body, "Expand").click();
  await expectTemplate(handle!, "244px 10px 134px 10px 100px");

  getByText(document.body, "Close").click();
  await expectTemplate(handle!, "244px 10px 244px");
});

test("Dynamic constraints", async () => {
  render(stories.DynamicConstraints.render());

  const handle = await getHandle("window-splitter");

  await waitForMeasurement(handle!);
  await expectTemplate(handle!, "100px 10px 178px 10px 700px");

  getByText(document.body, "Toggle Custom").click();
  await expectTemplate(handle!, "500px 10px 178px 10px 300px");

  getByText(document.body, "Toggle Custom").click();
  await expectTemplate(handle!, "400px 10px 178px 10px 400px");
});

describe("Autosave", () => {
  test("localStorage", async () => {
    localStorage.clear();

    render(stories.Autosave.render());
    const handle = await getHandle("window-splitter");

    await waitForMeasurement(handle!);
    await expectTemplate(handle!, "244px 10px 244px");

    await dragHandle({ delta: 100 });
    await expectTemplate(handle!, "342px 10px 146px");

    await waitForCondition(() =>
      Boolean(localStorage.getItem("autosave-example-web-component")),
    );
    const obj = JSON.parse(
      localStorage.getItem("autosave-example-web-component") || "{}",
    );
    expect(obj.items).toMatchSnapshot();
  });

  test("callback", async () => {
    localStorage.clear();

    const spy = vi.fn();

    render(stories.AutosaveCollapsible.render({ onCollapseChange: spy }));
    const handle = await getHandle("window-splitter");

    await waitForMeasurement(handle!);

    await dragHandle({ delta: -200, handleId: "resizer-1" });
    await expectTemplate(handle!, "100px 10px 388px");
    expect(spy).toHaveBeenCalledWith(true);

    cleanup();

    const spy2 = vi.fn();
    render(stories.AutosaveCollapsible.render({ onCollapseChange: spy2 }));

    await expectTemplate(handle!, "100px 10px 388px");
    await dragHandle({ delta: 200 });
    expect(spy2).toHaveBeenCalledWith(false);
  });

  test("cookie", async () => {
    // clear cookies
    document.cookie = document.cookie.replace(
      new RegExp(`autosave-cookie-web-component=.*`),
      "",
    );

    render(stories.AutosaveCookie.render());
    let handle = await getHandle("window-splitter");

    await waitForMeasurement(handle!);
    await expectTemplate(handle!, "244px 10px 244px");

    await dragHandle({ delta: 100 });
    await expectTemplate(handle!, "342px 10px 146px");

    await waitForCondition(() => {
      return document.cookie.includes("autosave-cookie-web-component");
    });

    expect(document.cookie).toMatchSnapshot();

    const snapshot = Cookies.get("autosave-cookie-web-component");

    render(stories.AutosaveCookie.render({ snapshot: snapshot || undefined }));
    handle = await getHandle("window-splitter");

    await expectTemplate(handle!, "342px 10px 146px");
  });
});

test("Keyboard interactions with collapsed panels", async () => {
  render(stories.Collapsible.render());

  const handle = await getHandle("window-splitter");

  await waitForMeasurement(handle!);
  await expectTemplate(handle!, "209px 10px 209px 10px 60px");

  const resizer2 = document.getElementById("resizer-2")!;
  fireEvent.keyDown(resizer2, { key: "Enter" });
  await expectTemplate(handle!, "209.015625px 10px 167px 10px 101.984375px");

  fireEvent.keyDown(resizer2, { key: "ArrowLeft" });
  fireEvent.keyDown(resizer2, { key: "ArrowLeft" });
  fireEvent.keyDown(resizer2, { key: "ArrowLeft" });
  fireEvent.keyDown(resizer2, { key: "ArrowLeft" });
  await expectTemplate(handle!, "209.015625px 10px 163px 10px 105.984375px");

  fireEvent.keyDown(resizer2, { key: "ArrowLeft", shiftKey: true });
  await expectTemplate(
    handle!,
    "209.03125px 10px 147.984375px 10px 120.984375px",
  );

  fireEvent.keyDown(resizer2, { key: "Enter" });
  await expectTemplate(handle!, "209.03125px 10px 208.96875px 10px 60px");

  fireEvent.keyDown(resizer2, { key: "Enter" });
  await expectTemplate(
    handle!,
    "209.046875px 10px 144.9375px 10px 124.015625px",
  );
});

describe("imperative panel API", async () => {
  test("panel group", async () => {
    render(stories.Collapsible.render());

    const handle = await getHandle("window-splitter");

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
    render(stories.Collapsible.render());

    const handle = await getHandle("window-splitter");
    const rightHandle = handle!.querySelector("#panel-3") as Panel;
    const leftHandle = handle!.querySelector("#panel-1") as Panel;

    await waitForMeasurement(handle!);

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
