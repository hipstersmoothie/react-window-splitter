"use client";

import React, {
  useEffect,
  useLayoutEffect,
  useImperativeHandle,
  createContext,
  useRef,
  useState,
} from "react";
import { mergeProps, MoveMoveEvent, useId, useMove } from "react-aria";
import { createMachine, assign, enqueueActions, Snapshot } from "xstate";
import { createActorContext } from "@xstate/react";
import invariant from "invariant";
import { useComposedRefs } from "@radix-ui/react-compose-refs";
import { useIndex, useIndexedChildren } from "reforest";

const useIsomorphicLayoutEffect =
  typeof document !== "undefined" ? useLayoutEffect : useEffect;

// #region Constants

/** The default amount a user can `dragOvershoot` before the panel collapses */
const COLLAPSE_THRESHOLD = 50;

/** This parses the percentage value from the "clamp" we do after the "commit" */
const CLAMP_REGEX = /min\(calc\((.*) \* \(100% - (.*)\)\), .*\)\)/;

// #endregion

// #region Types

type PixelUnit = `${number}px`;
type PercentUnit = `${number}%`;
type Unit = PixelUnit | PercentUnit;
type Orientation = "horizontal" | "vertical";

interface Constraints {
  /** The minimum size of the panel */
  min?: Unit;
  /** The maximum size of the panel */
  max?: Unit;
  /** The default size of the panel */
  default?: Unit;
  /** Whether the panel is collapsible */
  collapsible?: boolean;
  /** Whether the panel should initially render as collapsed */
  defaultCollapsed?: boolean;
  /** The size of the panel once collapsed */
  collapsedSize?: Unit;
}

interface Order {
  /**
   * When dynamically rendering panels/handles you need to add the order prop.
   * This tells the component what place the items should be in once rendered.
   */
  order?: number;
}

interface PanelData
  extends Omit<Constraints, "min" | "max" | "collapsedSize">,
    Required<Pick<Constraints, "min" | "max" | "collapsedSize">>,
    Order {
  type: "panel";
  id: string;
  /** Whether the collapsed state is controlled by the consumer or not */
  collapseIsControlled?: boolean;
  /** A ref to the latest "collapseChange" function provided by the user */
  onCollapseChange?: {
    current: ((isCollapsed: boolean) => void) | null | undefined;
  };
  /**
   * The current value for the item in the grid
   *
   * 1. Before the user touches the handles the grid will be composed of grid units (e.g minmax)
   * 2. During resizing the current value is represented as pixels
   * 3. Once done the value is represented as a pseudo-clamp like value that works for resizing
   */
  currentValue: number | string;
  /** Whether the panel is currently collapsed */
  collapsed: boolean | undefined;
  /**
   * The size the panel was before being collapsed.
   * This is used to re-open the panel at the same size.
   * If the panel starts out collapsed it will use the `min`.
   */
  sizeBeforeCollapse: number | undefined;
}

interface PanelHandleData extends Order {
  type: "handle";
  id: string;
  /**
   * The size of the panel handle.
   * Needed to correctly calculate the percentage of modified panels.
   */
  size: PixelUnit;
}

type Item = PanelData | PanelHandleData;

interface RegisterPanelEvent {
  /** Register a new panel with the state machine */
  type: "registerPanel";
  data: Omit<PanelData, "type" | "currentValue" | "defaultCollapsed">;
}

interface RegisterDynamicPanelEvent extends Omit<RegisterPanelEvent, "type"> {
  /** Register a new panel with the state machine */
  type: "registerDynamicPanel";
}

interface UnregisterPanelEvent {
  /** Remove a panel from the state machine */
  type: "unregisterPanel";
  id: string;
}

interface RegisterPanelHandleEvent {
  /** Register a new panel handle with the state machine */
  type: "registerPanelHandle";
  data: Omit<PanelHandleData, "type">;
}

interface UnregisterPanelHandleEvent {
  /** Remove a panel handle from the state machine */
  type: "unregisterPanelHandle";
  id: string;
}

interface DragHandleStartEvent {
  /** Start a drag interaction */
  type: "dragHandleStart";
  /** The handle being interacted with */
  handleId: string;
}

interface DragHandleEvent {
  /** Update the layout according to how the handle moved */
  type: "dragHandle";
  /** The handle being interacted with */
  handleId: string;
  value: MoveMoveEvent;
}

interface DragHandleEndEvent {
  /** End a drag interaction */
  type: "dragHandleEnd";
  /** The handle being interacted with */
  handleId: string;
}

interface SetSizeEvent {
  /** Set the size of the whole group */
  type: "setSize";
  size: {
    width: number;
    height: number;
  };
}

interface SetOrientationEvent {
  /** Set the orientation of the group */
  type: "setOrientation";
  orientation: Orientation;
}

interface ControlledCollapseToggle {
  /**
   * This is used to react to the controlled panel "collapse" prop updating.
   * This will force an update to be applied and skip calling the user's `onCollapseChanged`
   */
  controlled?: boolean;
}

interface CollapsePanelEvent extends ControlledCollapseToggle {
  /** Collapse a panel */
  type: "collapsePanel";
  /** The panel to collapse */
  panelId: string;
}

interface ExpandPanelEvent extends ControlledCollapseToggle {
  /** Expand a panel */
  type: "expandPanel";
  /** The panel to expand */
  panelId: string;
}

interface SetPanelPixelSizeEvent {
  /**
   * This event is used by the imperative panel API.
   * With this the user can set the panel's size to an explicit value.
   * This is done by faking interaction with the handles so min/max will still
   * be respected.
   */
  type: "setPanelPixelSize";
  /** The panel to apply the size to */
  panelId: string;
  /** The size to apply to the panel */
  size: Unit;
}

interface SetDynamicPanelPixelSizeEvent {
  /** This event is used to sync dynamic panels to their actual pixel size so drags work */
  type: "setDynamicPanelInitialSize";
  /** The panel to apply the size to */
  panelId: string;
  /** The initial measured size of the panel */
  size: number;
}

interface GroupMachineContextValue {
  /** The items in the group */
  items: Array<Item>;
  /** The available space in the group */
  size: number;
  /** The orientation of the grid */
  orientation: Orientation;
  /** How much the drag has overshot the handle */
  dragOvershoot: number;
  /** An id to use for autosaving the layout */
  autosaveId?: string;
  groupId: string;
}

type GroupMachineEvent =
  | RegisterPanelEvent
  | RegisterDynamicPanelEvent
  | UnregisterPanelEvent
  | RegisterPanelHandleEvent
  | UnregisterPanelHandleEvent
  | DragHandleEvent
  | SetSizeEvent
  | SetOrientationEvent
  | DragHandleStartEvent
  | DragHandleEndEvent
  | CollapsePanelEvent
  | ExpandPanelEvent
  | SetPanelPixelSizeEvent
  | SetDynamicPanelPixelSizeEvent;

type EventForType<T extends GroupMachineEvent["type"]> = Extract<
  GroupMachineEvent,
  { type: T }
>;

// #endregion

// #region Helpers

/** Assert that the provided event is one of the accepted types */
function isEvent<T extends GroupMachineEvent["type"]>(
  event: GroupMachineEvent,
  eventType: T[]
): asserts event is EventForType<T> {
  invariant(
    eventType.includes(event.type as T),
    `Invalid event type: ${eventType}. Expected: ${eventType.join(" | ")}`
  );
}

/** Determine if an item is a panel */
function isPanelData(value: unknown): value is PanelData {
  return Boolean(
    value &&
      typeof value === "object" &&
      "type" in value &&
      value.type === "panel"
  );
}

/** Determine if an item is a panel handle */
function isPanelHandle(value: unknown): value is PanelHandleData {
  return Boolean(
    value &&
      typeof value === "object" &&
      "type" in value &&
      value.type === "handle"
  );
}

/** Parse the percentage value applied during the "commit" phase */
function parseClamp(groupsSize: number, unit: string) {
  const [, percent, staticSize = "0"] = unit.match(CLAMP_REGEX) || [];

  if (percent) {
    return {
      type: "pixel" as const,
      value: (groupsSize - parseFloat(staticSize)) * parseFloat(percent),
    };
  }
}

/** Parse a `Unit` string or `clamp` value */
function parseUnit(unit: Unit): { type: "pixel" | "percent"; value: number } {
  if (unit.endsWith("px")) {
    return { type: "pixel", value: parseFloat(unit) };
  }

  if (unit.endsWith("%")) {
    return { type: "percent", value: parseFloat(unit) };
  }

  throw new Error(`Invalid unit: ${unit}`);
}

/** Convert a `Unit` to a percentage of the group size */
function getUnitPercentageValue(groupsSize: number, unit: Unit | number) {
  if (typeof unit === "string") {
    const clampValue = parseClamp(groupsSize, unit);

    if (clampValue) {
      return clampValue.value / groupsSize;
    }
  }

  if (typeof unit === "number") {
    return unit / groupsSize;
  }

  const parsed = parseUnit(unit);

  if (parsed.type === "pixel") {
    return parsed.value / groupsSize;
  }

  return parsed.value;
}

/** Get the size of a panel in pixels */
function getUnitPixelValue(context: GroupMachineContextValue, unit: Unit) {
  const parsed = parseUnit(unit);

  if (parsed.type === "pixel") {
    return parsed.value;
  }

  return (parsed.value / 100) * context.size;
}

/** Clamp a new `currentValue` given the panel's constraints. */
function clampUnit(
  context: GroupMachineContextValue,
  item: PanelData,
  value: number
) {
  return Math.min(
    Math.max(value, getUnitPixelValue(context, item.min)),
    getUnitPixelValue(context, item.max)
  );
}

/** Get a panel with a particular ID. */
function getPanelWithId(context: GroupMachineContextValue, panelId: string) {
  const item = context.items.find((item) => item.id === panelId);

  if (item && isPanelData(item)) {
    return item;
  }

  throw new Error(`Expected panel with id: ${panelId}`);
}

/** Get a handle with a particular ID. */
function getHandleWithId(context: GroupMachineContextValue, handleId: string) {
  const item = context.items.find((item) => item.id === handleId);

  if (item && isPanelHandle(item)) {
    return item;
  }

  throw new Error(`Expected handle with id: ${handleId}`);
}

/** Get the panel before a handle */
function getPanelBeforeHandleId(
  context: GroupMachineContextValue,
  handleId: string
) {
  const handleIndex = context.items.findIndex((item) => item.id === handleId);
  const item = context.items[handleIndex - 1];

  if (item && isPanelData(item)) {
    return item;
  }

  throw new Error(`Expected panel before: ${handleId}`);
}

/**
 * Get the panel that's collapsible next to a resize handle.
 * Will first check the left panel then the right.
 */
function getCollapsiblePanelForHandleId(
  context: GroupMachineContextValue,
  handleId: string
) {
  if (!context.items.length) {
    return undefined;
  }

  const handleIndex = context.items.findIndex((item) => item.id === handleId);

  if (handleIndex === -1) {
    return undefined;
  }

  const panelBefore = context.items[handleIndex - 1];
  const panelAfter = context.items[handleIndex + 1];

  if (panelBefore && isPanelData(panelBefore) && panelBefore.collapsible) {
    return panelBefore;
  }

  if (panelAfter && isPanelData(panelAfter) && panelAfter.collapsible) {
    return panelAfter;
  }

  return undefined;
}

/**
 * Get the handle closest to the target panel.
 * This is used to simulate collapse/expand
 */
function getHandleForPanelId(
  context: GroupMachineContextValue,
  panelId: string
) {
  const panelIndex = context.items.findIndex((item) => item.id === panelId);

  invariant(panelIndex !== -1, `Expected panel before: ${panelId}`);

  let item = context.items[panelIndex + 1];

  if (item && isPanelHandle(item)) {
    return { item, direction: 1 as const };
  }

  item = context.items[panelIndex - 1];

  if (item && isPanelHandle(item)) {
    return { item, direction: -1 as const };
  }

  throw new Error(`Cant find handle for panel: ${panelId}`);
}

/** Given the specified order props and default order of the items, order the items */
function sortWithOrder(items: Array<Item>) {
  const defaultPlacement: Record<string, number> = {};
  const takenPlacements = items
    .map((i) => i.order)
    .filter((i): i is number => i !== undefined);

  let defaultOrder = 0;

  // Generate default orders for items that don't have it
  for (const item of items) {
    if (item.order === undefined) {
      while (
        takenPlacements.includes(defaultOrder) ||
        Object.values(defaultPlacement).includes(defaultOrder)
      ) {
        defaultOrder++;
      }

      defaultPlacement[item.id] = defaultOrder;
    }
  }

  const withoutOrder = items.filter((i) => i.order === undefined);
  const sortedWithOrder = items
    .filter((i) => i.order !== undefined)
    .sort((a, b) => a.order! - b.order!);

  for (const item of sortedWithOrder) {
    // insert item at order index
    withoutOrder.splice(item.order!, 0, item);
  }

  return withoutOrder;
}

/** Check if the panel has space available to add to */
function panelHasSpace(context: GroupMachineContextValue, item: PanelData) {
  invariant(
    typeof item.currentValue === "number",
    `panelHasSpace only works with number values: ${item.id} ${item.currentValue}`
  );

  if (item.collapsible && !item.collapsed) {
    return true;
  }

  const panelSize = item.currentValue;
  const min = getUnitPixelValue(context, item.min);

  return panelSize > min;
}

/** Search in a `direction` for a panel that still has space to expand. */
function findPanelWithSpace(
  context: GroupMachineContextValue,
  items: Array<Item>,
  start: number,
  direction: number
) {
  for (
    let i = start;
    direction === -1 ? i >= 0 : i < items.length;
    i += direction
  ) {
    const panel = items[i];

    if (!panel) {
      return;
    }

    if (isPanelData(panel) && panelHasSpace(context, panel)) {
      return panel;
    }
  }
}

/** Add up all the static values in the layout */
function getStaticWidth(context: GroupMachineContextValue) {
  let width = 0;

  for (const item of context.items) {
    if (isPanelHandle(item)) {
      width += parseUnit(item.size).value;
    } else if (isPanelData(item) && item.collapsed) {
      if (typeof item.currentValue === "number") {
        width += item.currentValue;
      } else if (item.currentValue.endsWith("px")) {
        width += parseUnit(item.currentValue as Unit).value;
      }
    }
  }

  return width;
}

/** Build the grid template from the item values. */
function buildTemplate(items: Array<Item>) {
  return items
    .map((item) => {
      if (item.type === "panel") {
        if (typeof item.currentValue === "number") {
          return `${item.currentValue}px`;
        } else {
          return item.currentValue;
        }
      }

      return item.size;
    })
    .join(" ");
}

function addDeDuplicatedItems(items: Array<Item>, newItem: Item) {
  const currentItemIndex = items.findIndex(
    (item) =>
      item.id === newItem.id ||
      (typeof item.order === "number" && item.order === newItem.order)
  );

  let restItems = items;

  if (currentItemIndex !== -1) {
    restItems = items.filter((_, index) => index !== currentItemIndex);
  }

  return sortWithOrder([...restItems, newItem]);
}

function getInitialSize(data: Omit<RegisterPanelEvent["data"], "id">) {
  let currentValue = "1fr";

  if (data.collapsible && data.collapsed) {
    currentValue = data.collapsedSize || "0px";
  } else if (data.default) {
    currentValue = data.default;
  } else if (data.min && data.max) {
    currentValue = `minmax(${data.min}, ${data.max})`;
  } else if (data.max) {
    currentValue = `minmax(0, ${data.max})`;
  } else if (data.min) {
    currentValue = `minmax(${data.min}, 1fr)`;
  }

  return currentValue;
}

// #endregion

// #region Update Logic

/**
 * This is the main meat of the layout logic.
 * It's responsible for figuring out how to distribute the space
 * amongst the panels.
 *
 * It's built around applying small deltas to panels relative to their
 * the resize handles.
 *
 * As much as possible we try to rely on the browser to do the layout.
 * During the initial layout we rely on CSS grid and a group might be
 * defined like this:
 *
 * ```css
 * grid-template-columns: minmax(100px, 1fr) 1px minmax(100px, 300px);
 * ```
 *
 * Without any resizing this is nice and simple and the components don't do much.
 *
 * Once the user starts resizing the layout will be more complex.
 *
 * It's broken down into 3 phases:
 *
 * 1. `prepareItems` - The size of the group has been measure and we
 *    can convert all the panel sizes into pixels. Converting into pixels
 *    makes doing the math for the updates easier.
 *
 * ```css
 * grid-template-columns: 500px 1px 300px;
 * ```
 *
 * 2. `updateLayout` - This is where the actual updates are applied.
 *    This is where the user's drag interactions are applied. We also
 *    use this to collapse/expand panels by simulating a drag interaction.
 *
 * ```css
 * grid-template-columns: 490px 1px 310px;
 * ```
 *
 * 3. `commitLayout` - Once the updates have been applied we convert the
 *    updated sizes back into a format that allows for easy resizing without
 *    lots of updates.
 *
 * ```css
 * grid-template-columns: minmax(100px, min(calc(0.06117 * (100% - 1px)), 100%)) 1px minmax(100px, min(calc(0.0387 * (100% - 1px)), 300px));
 * ```
 *
 * When another update loop is triggered the above template will be converted back to pixels.
 */

/** Converts the items to pixels */
function prepareItems(context: GroupMachineContextValue) {
  const newItems = [...context.items];

  for (const item of newItems) {
    if (
      isPanelData(item) &&
      typeof item.currentValue === "string" &&
      item.currentValue.match(/^\d+px$/)
    ) {
      item.currentValue = parseUnit(item.currentValue as Unit).value;
    }
  }

  const itemsWithFractions = newItems
    .map((i, index) =>
      isPanelData(i) &&
      typeof i.currentValue === "string" &&
      (i.currentValue.includes("fr") ||
        (i.currentValue.includes("minmax") && !i.currentValue.includes("calc")))
        ? index
        : -1
    )
    .filter((i) => i !== -1);

  // If there are any items with fractions, distribute them evenly
  if (itemsWithFractions.length > 0) {
    let fractionSpace = context.size - getStaticWidth(context);
    let remaining = itemsWithFractions.length;

    for (const index of itemsWithFractions) {
      const item = newItems[index];

      if (!item || !isPanelData(item)) {
        continue;
      }

      const fractionUnit = clampUnit(context, item, fractionSpace / remaining);

      newItems[index] = {
        ...item,
        currentValue: fractionUnit,
      };
      fractionSpace -= fractionUnit;
      remaining--;
    }
  }

  const itemsWithClamps = newItems
    .map((i, index) =>
      isPanelData(i) &&
      typeof i.currentValue === "string" &&
      i.currentValue.includes("minmax")
        ? index
        : -1
    )
    .filter((i) => i !== -1);

  if (itemsWithClamps.length > 0) {
    for (const index of itemsWithClamps) {
      const item = newItems[index];

      if (
        !item ||
        !isPanelData(item) ||
        typeof item.currentValue !== "string"
      ) {
        continue;
      }
      const unit = parseClamp(context.size, item.currentValue);

      if (!unit) {
        continue;
      }

      newItems[index] = {
        ...item,
        currentValue: unit.value,
      };
    }
  }

  return newItems;
}

/** On every mouse move we distribute the space added */
function updateLayout(
  context: GroupMachineContextValue,
  dragEvent:
    | (DragHandleEvent & { controlled?: boolean })
    | {
        type: "collapsePanel";
        value: MoveMoveEvent;
        handleId: string;
        controlled?: boolean;
      }
): Partial<GroupMachineContextValue> {
  const handleIndex = context.items.findIndex(
    (item) => item.id === dragEvent.handleId
  );

  if (handleIndex === -1) {
    return {};
  }

  const handle = context.items[handleIndex] as PanelHandleData;
  const newItems = [...context.items];

  let moveAmount =
    context.orientation === "horizontal"
      ? dragEvent.value.deltaX
      : dragEvent.value.deltaY;

  if (dragEvent.value.shiftKey) {
    moveAmount *= 15;
  }

  const moveDirection = moveAmount / Math.abs(moveAmount);

  // Go forward into the shrinking panels to find a panel that still has space.
  const panelBefore = findPanelWithSpace(
    context,
    newItems,
    handleIndex + moveDirection,
    moveDirection
  );

  // No panel with space, just record the drag overshoot
  if (!panelBefore) {
    return {
      dragOvershoot: context.dragOvershoot + moveAmount,
    };
  }

  invariant(isPanelData(panelBefore), `Expected panel before: ${handle.id}`);

  const panelAfter = newItems[handleIndex - moveDirection];

  invariant(
    panelAfter && isPanelData(panelAfter),
    `Expected panel after: ${handle.id}`
  );

  const newDragOvershoot = context.dragOvershoot + moveAmount;

  // Don't let the panel expand until the threshold is reached
  if (panelAfter.collapsible && panelAfter.collapsed) {
    const potentialNewValue =
      (panelAfter.currentValue as number) + Math.abs(newDragOvershoot);
    const min = getUnitPixelValue(context, panelAfter.min);

    if (
      Math.abs(newDragOvershoot) < COLLAPSE_THRESHOLD &&
      // If the panel is at it's min, expand it
      potentialNewValue < min
    ) {
      return { dragOvershoot: newDragOvershoot };
    }
  }
  // Don't let the panel collapse until the threshold is reached
  else if (
    panelBefore.collapsible &&
    panelBefore.currentValue === getUnitPixelValue(context, panelBefore.min)
  ) {
    const potentialNewValue =
      panelBefore.currentValue - Math.abs(newDragOvershoot);

    if (
      Math.abs(newDragOvershoot) < COLLAPSE_THRESHOLD &&
      potentialNewValue > getUnitPixelValue(context, panelBefore.collapsedSize)
    ) {
      return { dragOvershoot: newDragOvershoot };
    }
  }
  // If we're already overshooting just keep adding to the overshoot
  else {
    if (context.dragOvershoot > 0 && newDragOvershoot >= 0) {
      return { dragOvershoot: newDragOvershoot };
    }

    if (context.dragOvershoot < 0 && newDragOvershoot <= 0) {
      return { dragOvershoot: newDragOvershoot };
    }
  }

  // Apply the move amount to the panel before the slider
  const panelBeforePreviousValue = panelBefore.currentValue as number;
  let panelBeforeNewValue = clampUnit(
    context,
    panelBefore,
    (panelBefore.currentValue as number) - moveAmount * moveDirection
  );

  // Also apply the move amount the panel after the slider
  const panelAfterPreviousValue = panelAfter.currentValue as number;
  const applied = panelBeforePreviousValue - panelBeforeNewValue;
  let panelAfterNewValue = clampUnit(
    context,
    panelAfter,
    (panelAfter.currentValue as number) + applied
  );

  // If the panel was collapsed, expand it
  // We need to re-apply the move amount since the the expansion of the
  // collapsed panel disregards that.
  if (panelAfter.collapsible && panelAfter.collapsed) {
    if (
      panelAfter.onCollapseChange?.current &&
      panelAfter.collapseIsControlled &&
      !dragEvent.controlled
    ) {
      panelAfter.onCollapseChange.current(false);
      return {};
    }

    // Calculate the amount "extra" after the minSize the panel should grow
    const extra =
      // Take the size it was at
      getUnitPixelValue(context, panelAfter.collapsedSize) +
      // Add in the full overshoot so the cursor is near the slider
      Math.abs(context.dragOvershoot) -
      // Subtract the min size of the panel
      panelAfterNewValue +
      // Then re-add the move amount
      Math.abs(moveAmount);

    panelAfter.collapsed = false;
    panelAfterNewValue += extra;
    panelBeforeNewValue -=
      // Subtract the delta of the after panel's size
      panelAfterNewValue -
      panelAfterPreviousValue -
      // And then re-apply the movement value
      Math.abs(moveAmount);

    if (
      panelAfter.onCollapseChange?.current &&
      !panelAfter.collapseIsControlled &&
      !dragEvent.controlled
    ) {
      panelAfter.onCollapseChange.current(false);
    }
  }

  // If the panel was expanded and now is at it's min size, collapse it
  if (
    panelBefore.collapsible &&
    panelBefore.currentValue === getUnitPixelValue(context, panelBefore.min)
  ) {
    if (
      panelBefore.onCollapseChange?.current &&
      panelBefore.collapseIsControlled &&
      !dragEvent.controlled
    ) {
      panelBefore.onCollapseChange.current(true);
      return {};
    }

    // Make it collapsed
    panelBefore.collapsed = true;
    panelBeforeNewValue = getUnitPixelValue(context, panelBefore.collapsedSize);
    // Add the extra space created to the before panel
    panelAfterNewValue += panelBeforePreviousValue - panelBeforeNewValue;

    if (
      panelBefore.onCollapseChange?.current &&
      !panelBefore.collapseIsControlled &&
      !dragEvent.controlled
    ) {
      panelBefore.onCollapseChange.current(true);
    }
  }

  panelBefore.currentValue = panelBeforeNewValue;
  panelAfter.currentValue = panelAfterNewValue;

  const leftoverSpace =
    context.size -
    newItems.reduce(
      (acc, b) =>
        acc +
        (b.type === "panel"
          ? typeof b.currentValue === "number"
            ? b.currentValue
            : parseUnit(b.currentValue as Unit).value
          : parseUnit(b.size).value),
      0
    );

  // TODO: this is wrong?
  panelBefore.currentValue += leftoverSpace;

  return { items: newItems, dragOvershoot: 0 };
}

/** Converts the items to percentages */
function commitLayout(context: GroupMachineContextValue) {
  const newItems = [...context.items];
  const staticWidth = getStaticWidth(context);

  newItems.forEach((item, index) => {
    if (item.type !== "panel" || typeof item.currentValue !== "number") {
      return;
    }

    if (item.collapsed) {
      newItems[index] = {
        ...item,
        currentValue: item.collapsedSize,
      };
    } else {
      const fraction = item.currentValue / (context.size - staticWidth);
      newItems[index] = {
        ...item,
        currentValue: `minmax(${item.min}, min(calc(${fraction} * (100% - ${staticWidth}px)), ${item.max}))`,
      };
    }
  });

  return newItems;
}

/** Iteratively applies a large delta value simulating a user's drag */
function iterativelyUpdateLayout({
  context,
  handleId,
  delta,
  direction,
  controlled,
}: {
  context: GroupMachineContextValue;
  handleId: string;
  delta: number;
  direction: -1 | 1;
  controlled?: boolean;
}) {
  let newContext: Partial<GroupMachineContextValue> = context;

  for (let i = 0; i < Math.abs(delta); i++) {
    newContext = updateLayout(
      {
        ...context,
        ...newContext,
      },
      {
        handleId,
        type: "collapsePanel",
        controlled,
        value: {
          type: "move",
          pointerType: "keyboard",
          shiftKey: false,
          ctrlKey: false,
          altKey: false,
          metaKey: false,
          deltaX: context.orientation === "horizontal" ? direction : 0,
          deltaY: context.orientation === "horizontal" ? 0 : direction,
        },
      }
    );
  }

  return newContext;
}

// #endregion

// #region Machine

const groupMachine = createMachine(
  {
    initial: "idle",
    types: {
      context: {} as GroupMachineContextValue,
      events: {} as GroupMachineEvent,
      input: {} as {
        autosaveId?: string;
        orientation?: Orientation;
        groupId: string;
        initialItems: Item[];
      },
    },
    context: ({ input }) => ({
      size: 0,
      items: input.initialItems || [],
      orientation: input.orientation || "horizontal",
      dragOvershoot: 0,
      autosaveId: input.autosaveId,
      groupId: input.groupId,
    }),
    states: {
      idle: {
        on: {
          dragHandleStart: { target: "dragging" },
          setPanelPixelSize: {
            actions: ["prepare", "onSetPanelSize", "commit"],
          },
          setDynamicPanelInitialSize: {
            actions: ["prepare", "onSetDynamicPanelSize", "commit"],
          },
        },
      },
      dragging: {
        entry: ["prepare"],
        on: {
          dragHandle: { actions: ["prepare", "onDragHandle"] },
          dragHandleEnd: { target: "idle" },
        },
        exit: ["commit", "onAutosave"],
      },
    },
    on: {
      registerPanel: { actions: ["assignPanelData"] },
      registerDynamicPanel: {
        actions: ["prepare", "onRegisterDynamicPanel", "commit", "onAutosave"],
      },
      unregisterPanel: {
        actions: ["prepare", "removeItem", "commit", "onAutosave"],
      },
      registerPanelHandle: { actions: ["assignPanelHandleData"] },
      unregisterPanelHandle: {
        actions: ["prepare", "removeItem", "commit", "onAutosave"],
      },
      setSize: { actions: ["updateSize"] },
      setOrientation: { actions: ["updateOrientation"] },
      collapsePanel: {
        actions: ["prepare", "collapsePanel", "commit", "onAutosave"],
      },
      expandPanel: {
        actions: ["prepare", "expandPanel", "commit", "onAutosave"],
      },
    },
  },
  {
    actions: {
      updateSize: assign({
        size: ({ context, event }) => {
          isEvent(event, ["setSize"]);

          return context.orientation === "horizontal"
            ? event.size.width
            : event.size.height;
        },
      }),
      updateOrientation: assign({
        orientation: ({ event }) => {
          isEvent(event, ["setOrientation"]);
          return event.orientation;
        },
      }),
      assignPanelData: assign({
        items: ({ context, event }) => {
          isEvent(event, ["registerPanel"]);

          return addDeDuplicatedItems(context.items, {
            type: "panel",
            ...event.data,
            currentValue: getInitialSize(event.data),
          });
        },
      }),
      onRegisterDynamicPanel: assign({
        items: ({ context, event }) => {
          isEvent(event, ["registerDynamicPanel"]);

          let currentUnit = "0px";

          if (event.data.collapsible && event.data.collapsed) {
            currentUnit = event.data.collapsedSize || "0px";
          } else if (event.data.default) {
            currentUnit = event.data.default;
          } else if (event.data.min) {
            currentUnit = event.data.min;
          }

          const currentValue = getUnitPixelValue(context, currentUnit as Unit);
          const newItems = addDeDuplicatedItems(context.items, {
            type: "panel",
            ...event.data,
            currentValue,
          });
          const itemIndex = newItems.findIndex(
            (item) => item.id === event.data.id
          );
          const newContext = { ...context, items: newItems };
          let leftToApply = currentValue;

          // TODO: could look in both directions
          while (leftToApply > 0) {
            const panel = findPanelWithSpace(
              newContext,
              newItems,
              itemIndex,
              -1
            );

            if (!panel) {
              break;
            }

            const panelIndex = newItems.findIndex(
              (item) => item.id === panel.id
            );

            if (panelIndex === -1) {
              break;
            }

            const newValue = clampUnit(
              newContext,
              panel,
              (panel.currentValue as number) - leftToApply
            );

            leftToApply -= newValue;
            newItems[panelIndex] = {
              ...panel,
              currentValue: newValue,
            };
          }

          return newItems;
        },
      }),
      assignPanelHandleData: assign({
        items: ({ context, event }) => {
          isEvent(event, ["registerPanelHandle"]);

          return addDeDuplicatedItems(context.items, {
            type: "handle",
            ...event.data,
          });
        },
      }),
      removeItem: assign({
        items: ({ context, event }) => {
          isEvent(event, ["unregisterPanel", "unregisterPanelHandle"]);
          const itemIndex = context.items.findIndex(
            (item) => item.id === event.id
          );

          if (itemIndex === -1) {
            return context.items;
          }

          const item = context.items[itemIndex];

          if (!item) {
            return context.items;
          }

          const newItems = context.items.filter((item) => item.id !== event.id);
          let removedSize = isPanelData(item)
            ? typeof item.currentValue === "number"
              ? item.currentValue
              : getUnitPixelValue(context, item.currentValue as Unit)
            : getUnitPixelValue(context, item.size);

          let hasTriedBothDirections = false;
          let direction = 1;

          // Starting from where the items was removed add space to the panels around it.
          // This is only needed for conditional rendering.
          while (removedSize !== 0) {
            const targetPanel = findPanelWithSpace(
              context,
              newItems,
              itemIndex + direction,
              direction
            );

            if (!targetPanel) {
              if (hasTriedBothDirections) {
                break;
              } else {
                direction = direction === 1 ? -1 : 1;
                hasTriedBothDirections = true;
                continue;
              }
            }

            const oldValue = targetPanel.currentValue as number;
            const newValue = clampUnit(
              context,
              targetPanel,
              oldValue + removedSize
            );

            targetPanel.currentValue = newValue;
            removedSize -= newValue - oldValue;
            direction = direction === 1 ? -1 : 1;
          }

          return newItems;
        },
      }),
      prepare: assign({
        items: ({ context }) => prepareItems(context),
      }),
      onDragHandle: enqueueActions(({ context, event, enqueue }) => {
        isEvent(event, ["dragHandle"]);
        enqueue.assign(updateLayout(context, event));
      }),
      commit: assign({
        dragOvershoot: 0,
        items: ({ context }) => commitLayout(context),
      }),
      collapsePanel: enqueueActions(({ context, event, enqueue }) => {
        isEvent(event, ["collapsePanel"]);

        const panel = getPanelWithId(context, event.panelId);
        const handle = getHandleForPanelId(context, event.panelId);
        const collapsedSize = getUnitPixelValue(context, panel.collapsedSize);

        if (panel.currentValue !== collapsedSize) {
          panel.sizeBeforeCollapse = panel.currentValue as number;
        }

        enqueue.assign(
          iterativelyUpdateLayout({
            direction: (handle.direction * -1) as -1 | 1,
            context: { ...context, dragOvershoot: 0 },
            handleId: handle.item.id,
            controlled: event.controlled,
            delta: (panel.currentValue as number) - collapsedSize,
          })
        );
      }),
      expandPanel: enqueueActions(({ context, event, enqueue }) => {
        isEvent(event, ["expandPanel"]);

        const panel = getPanelWithId(context, event.panelId);
        const handle = getHandleForPanelId(context, event.panelId);

        if (!panel) {
          return;
        }

        enqueue.assign(
          iterativelyUpdateLayout({
            direction: handle.direction,
            context: { ...context, dragOvershoot: 0 },
            handleId: handle.item.id,
            controlled: event.controlled,
            delta:
              (panel.sizeBeforeCollapse ??
                getUnitPixelValue(context, panel.min)) -
              (panel.currentValue as number),
          })
        );
      }),
      onSetPanelSize: enqueueActions(({ context, event, enqueue }) => {
        isEvent(event, ["setPanelPixelSize"]);

        const panel = getPanelWithId(context, event.panelId);
        const handle = getHandleForPanelId(context, event.panelId);

        if (!panel) {
          return;
        }

        const current = panel.currentValue as number;
        const newSize = clampUnit(
          context,
          panel,
          getUnitPixelValue(context, event.size)
        );
        const isBigger = newSize > current;
        const delta = isBigger ? newSize - current : current - newSize;

        enqueue.assign(
          iterativelyUpdateLayout({
            context,
            direction: (handle.direction * (isBigger ? 1 : -1)) as -1 | 1,
            handleId: handle.item.id,
            delta,
          })
        );
      }),
      onSetDynamicPanelSize: ({ context, event }) => {
        isEvent(event, ["setDynamicPanelInitialSize"]);
        const panel = getPanelWithId(context, event.panelId);
        panel.currentValue = event.size;
      },
    },
  }
);

// #endregion

// #region Components

const GroupMachineContext = createActorContext(groupMachine);

function useDebugGroupMachineContext({ id }: { id: string }) {
  const context = GroupMachineContext.useSelector((state) => state.context);
  console.log("GROUP CONTEXT", id, context);
}

function getCookie(name: string) {
  const cookieString = document.cookie;
  const cookies = cookieString.split("; ");

  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i]?.split("=");
    if (cookie?.[0] === name) {
      return cookie[1];
    }
  }
  return null;
}

export interface PanelGroupHandle {
  /** The id of the group */
  getId: () => string;
  /** Get the sizes of all the items in the layout as pixels */
  getPixelSizes: () => Array<number>;
  /** Get the sizes of all the items in the layout as percentages of the group size */
  getPercentageSizes: () => Array<number>;
  /**
   * Set the size of all the items in the layout.
   * This just calls `setSize` on each item. It is up to
   * you to make sure the sizes make sense.
   *
   * NOTE: Setting handle sizes will do nothing.
   */
  setSizes: (items: Array<Unit>) => void;
}

export interface PanelGroupProps
  extends React.HTMLAttributes<HTMLDivElement>,
    Partial<Pick<GroupMachineContextValue, "orientation" | "autosaveId">> {
  /** Imperative handle to control the group */
  handle?: React.Ref<PanelGroupHandle>;
  /** Persisted state to initialized the machine with */
  snapshot?: Snapshot<unknown>;
  /**
   * How to save the persisted state
   *
   * - `localStorage` - Save the state to `localStorage`
   * - `cookie` - Save the state to a cookie
   *
   * @default "localStorage"
   */
  autosaveStrategy?: "localStorage" | "cookie";
}

const InitialMapContext = createContext<Record<string, Item>>({});
const PreRenderContext = createContext(false);

function PrerenderTree({
  children,
  onPrerender,
}: {
  children: React.ReactNode;
  onPrerender: () => void;
}) {
  const [shouldPrerender, setShouldPrerender] = React.useState(true);

  useIsomorphicLayoutEffect(() => {
    setShouldPrerender(false);
    onPrerender();
  }, []);

  return shouldPrerender ? (
    <div className="opacity-0 absolute">
      <PreRenderContext.Provider value={true}>
        {children}
      </PreRenderContext.Provider>
    </div>
  ) : null;
}

function useGroupItem<T extends Item>(
  itemArg: Omit<T, "id"> & { id?: string }
): T {
  const isPrerender = React.useContext(PreRenderContext);
  const initialMap = React.useContext(InitialMapContext);
  const generatedId = useId();
  const id = itemArg.id || generatedId;
  const { index } = useIndex()!;
  const item = { ...itemArg, id } as T;

  if (isPrerender) {
    initialMap[id] = item;
    return item;
  } else {
    const currentItem = GroupMachineContext.useSelector(({ context }) =>
      context.items.find((i) => i.id === id)
    ) as T;
    const { send, ref: machineRef } = GroupMachineContext.useActorRef();

    React.useEffect(() => {
      const item = machineRef
        .getSnapshot()
        .context.items.find((i) => i.id === itemArg.id);

      if (!item) {
        invariant(
          itemArg.id,
          "When using dynamic panels you must provide an id on the items. This applies to React strict mode as well."
        );

        if (isPanelData(itemArg)) {
          send({
            type: "registerDynamicPanel",
            data: { ...itemArg, order: index },
          });
        } else if (isPanelHandle(itemArg)) {
          send({
            type: "registerPanelHandle",
            data: { ...itemArg, order: index },
          });
        }
      } else {
        // TODO
      }

      const id = item?.id || itemArg.id;

      return () => {
        const el = document.querySelector(
          `[data-splitter-id="${id}"]`
        ) as HTMLElement;

        if (el || !id) {
          return;
        }

        if (isPanelData(itemArg)) {
          send({ type: "unregisterPanel", id });
        } else if (isPanelHandle(itemArg)) {
          send({ type: "unregisterPanelHandle", id });
        }
      };
    }, [itemArg]);

    return currentItem || item;
  }
}

function flattenChildren(children: React.ReactNode[]): React.ReactNode[] {
  return children.flatMap((child) =>
    React.isValidElement(child) && child.type === React.Fragment
      ? flattenChildren(child.props.children)
      : child
  );
}

/** A group of panels that has constraints and a user can resize */
export const PanelGroup = React.forwardRef<HTMLDivElement, PanelGroupProps>(
  function PanelGroup(
    {
      autosaveId,
      autosaveStrategy = "localStorage",
      snapshot: snapshotProp,
      children,
      ...props
    },
    ref
  ) {
    const [hasPreRendered, setHasPreRendered] = useState(false);
    const initialMap = useRef<Record<string, Item>>({});
    const indexedChildren = useIndexedChildren(
      flattenChildren(React.Children.toArray(children))
    );

    return (
      <InitialMapContext.Provider value={initialMap.current}>
        {!hasPreRendered && (
          <PrerenderTree onPrerender={() => setHasPreRendered(true)}>
            {indexedChildren}
          </PrerenderTree>
        )}

        <PanelGroupMachine ref={ref} initialItems={initialMap} {...props}>
          {indexedChildren}
        </PanelGroupMachine>
      </InitialMapContext.Provider>
    );
  }
);

const PanelGroupMachine = React.forwardRef<
  HTMLDivElement,
  PanelGroupProps & {
    initialItems: React.MutableRefObject<Record<string, Item>>;
  }
>(function PanelGroup(
  {
    autosaveId,
    autosaveStrategy = "localStorage",
    snapshot: snapshotProp,
    initialItems,
    ...props
  },
  ref
) {
  const groupId = `panel-group-${useId()}`;
  const [snapshot, setSnapshot] = React.useState<
    Snapshot<unknown> | true | undefined
  >(snapshotProp);

  if (typeof window !== "undefined" && autosaveId && !snapshot) {
    const localSnapshot =
      autosaveStrategy === "localStorage"
        ? localStorage.getItem(autosaveId)
        : getCookie(autosaveId);

    if (localSnapshot) {
      setSnapshot(JSON.parse(localSnapshot));
    } else {
      setSnapshot(true);
    }
  }

  return (
    <GroupMachineContext.Provider
      options={{
        input: {
          autosaveId,
          orientation: props.orientation,
          groupId,
          initialItems: Object.values(initialItems.current),
        },
        snapshot: typeof snapshot === "object" ? snapshot : undefined,
      }}
      logic={groupMachine.provide({
        actions: {
          onAutosave: (context) => {
            if (!autosaveId) {
              return;
            }

            // Wait for new context to be committed
            requestAnimationFrame(() => {
              const data = JSON.stringify(context.self.getPersistedSnapshot());

              if (autosaveStrategy === "localStorage") {
                localStorage.setItem(autosaveId, data);
              } else {
                document.cookie = `${autosaveId}=${data}; path=/`;
              }
            });
          },
        },
      })}
    >
      <PanelGroupImplementation ref={ref} {...props} />
    </GroupMachineContext.Provider>
  );
});

const PanelGroupImplementation = React.forwardRef<
  HTMLDivElement,
  PanelGroupProps
>(function PanelGroupImplementation(
  { handle, orientation: orientationProp, ...props },
  outerRef
) {
  const { send, ref: machineRef } = GroupMachineContext.useActorRef();
  const innerRef = React.useRef<HTMLDivElement>(null);
  const ref = useComposedRefs(outerRef, innerRef);
  const orientation = GroupMachineContext.useSelector(
    (state) => state.context.orientation
  );
  const groupId = GroupMachineContext.useSelector(
    (state) => state.context.groupId
  );
  const template = GroupMachineContext.useSelector((state) =>
    buildTemplate(state.context.items)
  );

  // When the prop for `orientation` updates also update the state machine
  if (orientationProp && orientationProp !== orientation) {
    send({ type: "setOrientation", orientation: orientationProp });
  }

  // Track the size of the group
  useIsomorphicLayoutEffect(() => {
    if (!innerRef.current) {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];

      if (!entry) {
        return;
      }

      send({ type: "setSize", size: entry.contentRect });
    });

    observer.observe(innerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [send, innerRef]);

  useDebugGroupMachineContext({ id: groupId });

  const fallbackHandleRef = React.useRef<PanelGroupHandle>(null);

  useImperativeHandle(handle || fallbackHandleRef, () => {
    return {
      getId: () => groupId,
      getPixelSizes: () => {
        const context = machineRef.getSnapshot().context;

        return prepareItems(context).map((i) =>
          isPanelData(i)
            ? (i.currentValue as number)
            : getUnitPixelValue(context, i.size)
        );
      },
      getPercentageSizes() {
        const context = machineRef.getSnapshot().context;
        const clamped = commitLayout({
          ...context,
          items: prepareItems(context),
        });

        return clamped.map((i) => {
          if (isPanelHandle(i)) {
            return getUnitPercentageValue(context.size, i.size);
          }

          if (typeof i.currentValue === "number") {
            return i.currentValue / context.size;
          }

          return getUnitPercentageValue(context.size, i.currentValue as Unit);
        });
      },
      setSizes: (updates) => {
        const context = machineRef.getSnapshot().context;

        for (let index = 0; index < updates.length; index++) {
          const item = context.items[index];
          const update = updates[index];

          if (item && isPanelData(item) && update) {
            send({
              type: "setPanelPixelSize",
              panelId: item.id,
              size: update,
            });
          }
        }
      },
    };
  });

  return (
    <div
      ref={ref}
      data-group-id={groupId}
      data-group-orientation={orientation}
      {...mergeProps(props, {
        style: {
          display: "grid",
          gridTemplateColumns:
            orientation === "horizontal" ? template : undefined,
          gridTemplateRows: orientation === "vertical" ? template : undefined,
          height: "100%",
          ...props.style,
        },
      })}
    />
  );
});

export interface PanelHandle {
  /** Collapse the panel */
  collapse: () => void;
  /** Returns true if the panel is collapsed */
  isCollapsed: () => boolean;
  /** Expand the panel */
  expand: () => void;
  /** Returns true if the panel is expanded */
  isExpanded: () => boolean;
  /** The id of the panel */
  getId: () => string;
  /** Get the size of the panel in pixels */
  getPixelSize: () => number;
  /** Get percentage of the panel relative to the group */
  getPercentageSize: () => number;
  /**
   * Set the size of the panel in pixels.
   *
   * This will be clamped to the min/max values of the panel.
   * If you want the panel to collapse/expand you should use the
   * expand/collapse methods.
   */
  setSize: (size: Unit) => void;
}

export interface PanelProps
  extends Constraints,
    React.HTMLAttributes<HTMLDivElement> {
  /**
   * __CONTROLLED COMPONENT__
   *
   * If this prop is used it will be used as the source of truth for the collapsed state.
   * It should be used in conjunction with the `onCollapseChange` prop.
   *
   * Use this if you want full control over the collapsed state. When trying to
   * collapse a panel it will defer to onCollapseChange to determine if it should
   * be collapsed.
   */
  collapsed?: boolean;
  /**
   * __CONTROLLED COMPONENT__
   *
   * A callback called with the new desired collapsed state. If paired w
   * with the `collapsed` prop this will be used to control the collapsed state.
   *
   * Otherwise this will just be called with the new collapsed state so you can
   * use it to update your own state.
   */
  onCollapseChange?: (isCollapsed: boolean) => void;
  /** Imperative handle to control the panel */
  handle?: React.Ref<PanelHandle>;
}

/** A panel within a `PanelGroup` */
export const Panel = React.forwardRef<HTMLDivElement, PanelProps>(
  function Panel(props, outerRef) {
    const {
      min,
      max,
      defaultCollapsed,
      collapsible = false,
      collapsedSize,
      collapsed,
      onCollapseChange,
    } = props;
    const isPrerender = React.useContext(PreRenderContext);
    const onCollapseChangeRef = React.useRef(onCollapseChange);
    const panelDataRef = React.useMemo(() => {
      const data = {
        type: "panel" as const,
        min: min || "0px",
        max: max || "100%",
        collapsed: collapsible
          ? collapsed ?? defaultCollapsed ?? false
          : undefined,
        collapsible,
        collapsedSize: collapsedSize ?? "0px",
        onCollapseChange: onCollapseChangeRef,
        collapseIsControlled: typeof collapsed !== "undefined",
        sizeBeforeCollapse: undefined,
        id: props.id,
      };

      return { ...data, currentValue: getInitialSize(data) };
    }, []);

    const { id: panelId } = useGroupItem(panelDataRef);

    if (isPrerender) {
      return null;
    }

    return <PanelVisible ref={outerRef} {...props} panelId={panelId} />;
  }
);

const PanelVisible = React.forwardRef<
  HTMLDivElement,
  PanelProps & { panelId: string }
>(function PanelVisible(
  {
    min,
    max,
    defaultCollapsed,
    collapsible = false,
    collapsedSize,
    collapsed,
    onCollapseChange,
    handle,
    panelId,
    ...props
  },
  outerRef
) {
  const isPrerender = React.useContext(PreRenderContext);
  const innerRef = React.useRef<HTMLDivElement>(null);
  const ref = useComposedRefs(outerRef, innerRef);
  const { send, ref: machineRef } = GroupMachineContext.useActorRef();
  const panel = GroupMachineContext.useSelector(({ context }) => {
    try {
      return getPanelWithId(context, panelId);
    } catch (e) {
      return undefined;
    }
  });

  if (isPrerender) {
    return null;
  }

  // For controlled collapse we track if the `collapse` prop changes
  // and update the state machine if it does.
  React.useEffect(() => {
    if (typeof collapsed !== "undefined") {
      const context = machineRef.getSnapshot().context;

      if (context.items.length === 0) {
        return;
      }

      const panel = getPanelWithId(context, panelId);

      if (collapsed === true && !panel.collapsed) {
        send({ type: "collapsePanel", panelId, controlled: true });
      } else if (collapsed === false && panel.collapsed) {
        send({ type: "expandPanel", panelId, controlled: true });
      }
    }
  }, [send, collapsed, panelId, machineRef]);

  const fallbackHandleRef = React.useRef<PanelHandle>(null);

  useImperativeHandle(handle || fallbackHandleRef, () => {
    return {
      getId: () => panelId,
      collapse: () => {
        if (collapsible) {
          send({ type: "collapsePanel", panelId, controlled: true });
        }
      },
      isCollapsed: () => Boolean(collapsible && panel?.collapsed),
      expand: () => {
        if (collapsible) {
          send({ type: "expandPanel", panelId, controlled: true });
        }
      },
      isExpanded: () => Boolean(collapsible && !panel?.collapsed),
      getPixelSize: () => {
        const context = machineRef.getSnapshot().context;
        const panel = getPanelWithId(
          { ...context, items: prepareItems(context) },
          panelId
        );

        if (typeof panel.currentValue === "string") {
          return getUnitPixelValue(context, panel.currentValue as Unit);
        }

        return panel.currentValue;
      },
      setSize: (size) => {
        send({ type: "setPanelPixelSize", panelId, size });
      },
      getPercentageSize: () => {
        const context = machineRef.getSnapshot().context;
        const items = prepareItems(context);
        const panel = getPanelWithId({ ...context, items }, panelId);
        return getUnitPercentageValue(
          context.size,
          panel.currentValue as Unit | number
        );
      },
    };
  });

  return (
    <div
      ref={ref}
      data-splitter-type="panel"
      data-splitter-id={panelId}
      data-collapsed={collapsible && panel?.collapsed}
      {...props}
      style={{
        ...props.style,
        minWidth: 0,
        minHeight: 0,
        overflow: "hidden",
      }}
    />
  );
});

export interface PanelResizerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    Partial<Pick<PanelHandleData, "size">> {
  /** If the handle is disabled */
  disabled?: boolean;
}

/** A resize handle to place between panels. */
export const PanelResizer = React.forwardRef<HTMLDivElement, PanelResizerProps>(
  function PanelResizer(props, ref) {
    const { size = "0px" } = props;
    const isPrerender = React.useContext(PreRenderContext);
    const data = React.useMemo(
      () => ({
        type: "handle" as const,
        size,
        id: props.id,
      }),
      [size, props.id]
    );

    const { id: handleId } = useGroupItem(data);

    if (isPrerender) {
      return null;
    }

    return <PanelResizerVisible ref={ref} {...props} handleId={handleId} />;
  }
);

const PanelResizerVisible = React.forwardRef<
  HTMLDivElement,
  PanelResizerProps & { handleId: string }
>(function PanelResizerVisible(
  { size = "0px", disabled, handleId, ...props },
  ref
) {
  const unit = parseUnit(size);
  const [isDragging, setIsDragging] = React.useState(false);
  const { send, ref: machineRef } = GroupMachineContext.useActorRef();
  const panelBeforeHandle = GroupMachineContext.useSelector(({ context }) => {
    try {
      return getPanelBeforeHandleId(context, handleId);
    } catch (e) {
      return undefined;
    }
  });
  const collapsiblePanel = GroupMachineContext.useSelector(({ context }) => {
    try {
      return getCollapsiblePanelForHandleId(context, handleId);
    } catch (e) {
      return undefined;
    }
  });
  const orientation = GroupMachineContext.useSelector(
    (state) => state.context.orientation
  );
  const groupsSize = GroupMachineContext.useSelector(
    (state) => state.context.size
  );
  const overshoot = GroupMachineContext.useSelector(
    (state) => state.context.dragOvershoot
  );
  const handle = GroupMachineContext.useSelector(({ context }) => {
    try {
      return getHandleWithId(context, handleId);
    } catch (e) {
      return undefined;
    }
  });
  const { moveProps } = useMove({
    onMoveStart: () => {
      setIsDragging(true);
      send({ type: "dragHandleStart", handleId: handleId });
    },
    onMove: (e) => send({ type: "dragHandle", handleId: handleId, value: e }),
    onMoveEnd: () => {
      setIsDragging(false);
      send({ type: "dragHandleEnd", handleId: handleId });
    },
  });

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" && collapsiblePanel) {
      if (collapsiblePanel.collapsed) {
        send({ type: "expandPanel", panelId: collapsiblePanel.id });
      } else {
        send({ type: "collapsePanel", panelId: collapsiblePanel.id });
      }
    }
  };

  const hasRegistered = React.useRef(Boolean(handle));

  React.useEffect(() => {
    return () => {
      const context = machineRef.getSnapshot().context;

      // React strict mode hack to get around the component getting unmounted
      if (context.size === 0) {
        return;
      }

      send({ type: "unregisterPanelHandle", id: handleId });
      hasRegistered.current = false;
    };
  }, [send, handleId]);

  let cursor: React.CSSProperties["cursor"];

  if (disabled) {
    cursor = "default";
  } else if (orientation === "horizontal") {
    if (overshoot > 0) {
      cursor = "w-resize";
    } else if (overshoot < 0) {
      cursor = "e-resize";
    } else {
      cursor = "ew-resize";
    }
  } else {
    if (overshoot > 0) {
      cursor = "n-resize";
    } else if (overshoot < 0) {
      cursor = "s-resize";
    } else {
      cursor = "ns-resize";
    }
  }

  // Update the cursor while the user is dragging.
  // This makes it so that the user can overshoot the drag handle and
  // still see the right cursor.
  useEffect(() => {
    if (!isDragging) {
      return;
    }

    document.body.style.cursor = cursor || "auto";

    return () => {
      document.body.style.cursor = "auto";
    };
  }, [cursor, isDragging]);

  if (!panelBeforeHandle || !isPanelData(panelBeforeHandle)) {
    return null;
  }

  return (
    <div
      ref={ref}
      role="separator"
      tabIndex={0}
      data-splitter-type="handle"
      data-splitter-id={handleId}
      data-handle-orientation={orientation}
      data-state={isDragging ? "dragging" : "idle"}
      aria-label="Resize Handle"
      aria-disabled={disabled}
      aria-controls={panelBeforeHandle.id}
      aria-valuemin={getUnitPercentageValue(groupsSize, panelBeforeHandle.min)}
      aria-valuemax={getUnitPercentageValue(groupsSize, panelBeforeHandle.max)}
      aria-valuenow={
        typeof panelBeforeHandle.currentValue === "string" &&
        (panelBeforeHandle.currentValue.includes("minmax") ||
          panelBeforeHandle.currentValue.includes("fr"))
          ? undefined
          : getUnitPercentageValue(
              groupsSize,
              panelBeforeHandle.currentValue as Unit
            )
      }
      {...mergeProps(props, disabled ? {} : moveProps, { onKeyDown })}
      style={{
        cursor,
        ...props.style,
        ...(orientation === "horizontal"
          ? { width: unit.value, height: "100%" }
          : { height: unit.value, width: "100%" }),
      }}
    />
  );
});

// #endregion
