import { expect } from "vitest";
import { PanelGroupHandle } from "./interface.js";

export async function dragHandle(options: {
  handleId?: string;
  delta: number;
  orientation?: "horizontal" | "vertical";
}) {
  const orientation = options.orientation || "horizontal";
  const handle = document.querySelector(
    options.handleId
      ? `[data-splitter-id="${options.handleId}"]`
      : '[data-splitter-type="handle"]',
  );

  if (!handle) {
    throw new Error(`Handle not found: ${options.handleId}`);
  }

  const rect = handle.getBoundingClientRect();
  const x = rect.x + rect.width / 2;
  const y = rect.y + rect.height / 2;
  const step = options.delta > 0 ? 1 : -1;
  const pointerId = 1;

  handle.dispatchEvent(
    new PointerEvent("pointerdown", {
      bubbles: true,
      clientX: x,
      clientY: y,
      pointerId,
      button: 0,
    }),
  );

  for (let i = 0; i < Math.abs(options.delta - 1); i++) {
    handle.dispatchEvent(
      new PointerEvent("pointermove", {
        bubbles: true,
        pointerId,
        clientX: orientation === "horizontal" ? x + i * step : x,
        clientY: orientation === "vertical" ? y + i * step : y,
      }),
    );
    await new Promise((r) => setTimeout(r, 10));
  }

  handle.dispatchEvent(
    new PointerEvent("pointerup", {
      bubbles: true,
      pointerId,
      clientX: orientation === "horizontal" ? x + options.delta : x,
      clientY: orientation === "vertical" ? y + options.delta : y,
    }),
  );
}

type WaitForFn = <T>(
  callback: () => T | Promise<T>,
  options?: {
    timeout?: number;
  },
) => Promise<T>;

function waitForCondition(waitFor: WaitForFn, condition: () => boolean) {
  const stack = new Error().stack;

  return waitFor(
    () => {
      if (!condition()) {
        const error = new Error("Not ready");
        error.stack = stack;
        throw error;
      }
    },
    {
      timeout: 10_000,
    },
  );
}

async function waitForMeasurement(
  waitFor: WaitForFn,
  handle: PanelGroupHandle,
) {
  await waitForCondition(
    waitFor,
    () => !handle.getTemplate().includes("minmax"),
  );
  await new Promise((resolve) => setTimeout(resolve, 100));
}

async function expectTemplate(
  waitFor: WaitForFn,
  handle: PanelGroupHandle,
  resolvedTemplate: string,
) {
  const stack = new Error().stack;
  let template;

  await waitFor(
    () => {
      template = handle.getTemplate();

      if (!template.includes(resolvedTemplate)) {
        const e = new Error(
          `\nExpected: ${resolvedTemplate}\nGot     : ${template}`,
        );
        e.stack = stack;
        throw e;
      }

      if (handle.getState() !== "idle") {
        const e = new Error(`\nExpected: idle\nGot     : ${handle.getState()}`);
        e.stack = stack;
        throw e;
      }
    },
    {
      timeout: 4_000,
    },
  );

  expect(template).toBe(resolvedTemplate);
}

export function createTestUtils(options: { waitFor: WaitForFn }) {
  return {
    waitForCondition: waitForCondition.bind(null, options.waitFor),
    waitForMeasurement: waitForMeasurement.bind(null, options.waitFor),
    expectTemplate: expectTemplate.bind(null, options.waitFor),
  };
}
