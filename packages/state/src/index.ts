import { raf } from "@react-spring/rafz";
import { createMachine, assign, enqueueActions, fromPromise } from "xstate";
import invariant from "invariant";
import * as easings from "d3-ease";

// #region Constants

/** The default amount a user can `dragOvershoot` before the panel collapses */
const COLLAPSE_THRESHOLD = 50;

// #endregion

// #region Types

type PixelUnit = `${number}px`;
type PercentUnit = `${number}%`;
export type Unit = PixelUnit | PercentUnit;
type Orientation = "horizontal" | "vertical";

interface ParsedPercentUnit {
  type: "percent";
  value: number;
}

interface ParsedPixelUnit {
  type: "pixel";
  value: number;
}

type ParsedUnit = ParsedPercentUnit | ParsedPixelUnit;

function makePercentUnit(value: number): ParsedPercentUnit {
  return { type: "percent", value };
}

function makePixelUnit(value: number): ParsedPixelUnit {
  return { type: "pixel", value };
}

interface MoveMoveEvent {
  shiftKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  altKey: boolean;
  deltaX: number;
  deltaY: number;
}

export interface Constraints<T extends ParsedUnit | Unit = ParsedUnit> {
  /** The minimum size of the panel */
  min?: T;
  /** The maximum size of the panel */
  max?: T;
  /** The default size of the panel */
  default?: T;
  /** Whether the panel is collapsible */
  collapsible?: boolean;
  /** Whether the panel should initially render as collapsed */
  defaultCollapsed?: boolean;
  /** The size of the panel once collapsed */
  collapsedSize?: T;
}

interface Order {
  /**
   * When dynamically rendering panels/handles you need to add the order prop.
   * This tells the component what place the items should be in once rendered.
   */
  order?: number;
}

export interface PanelData
  extends Omit<Constraints, "min" | "max" | "collapsedSize">,
    Required<Pick<Constraints, "min" | "collapsedSize">>,
    Order {
  max: ParsedUnit | "1fr";
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
   */
  currentValue: ParsedUnit;
  /** Whether the panel is currently collapsed */
  collapsed: boolean | undefined;
  /**
   * The size the panel was before being collapsed.
   * This is used to re-open the panel at the same size.
   * If the panel starts out collapsed it will use the `min`.
   */
  sizeBeforeCollapse: number | undefined;
  /** Animate the collapse/expand */
  collapseAnimation?:
    | CollapseAnimation
    | { duration: number; easing: CollapseAnimation | ((t: number) => number) };
}

function getCollapseAnimation(panel: PanelData) {
  let easeFn = collapseAnimations.linear;
  let duration = 300;

  if (panel.collapseAnimation) {
    if (typeof panel.collapseAnimation === "string") {
      easeFn = collapseAnimations[panel.collapseAnimation];
    } else if ("duration" in panel.collapseAnimation) {
      duration = panel.collapseAnimation.duration ?? duration;
      easeFn =
        typeof panel.collapseAnimation.easing === "function"
          ? panel.collapseAnimation.easing
          : collapseAnimations[panel.collapseAnimation.easing];
    }
  }

  return { ease: easeFn, duration };
}

const collapseAnimations = {
  "ease-in-out": easings.easeQuadInOut,
  bounce: easings.easeBackInOut,
  linear: easings.easeLinear,
};

type CollapseAnimation = keyof typeof collapseAnimations;

export interface PanelHandleData extends Order {
  type: "handle";
  id: string;
  /**
   * The size of the panel handle.
   * Needed to correctly calculate the percentage of modified panels.
   */
  size: ParsedPixelUnit;
}

export type Item = PanelData | PanelHandleData;

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

export type InitializePanelHandleData = Omit<PanelHandleData, "type">;

interface RegisterPanelHandleEvent {
  /** Register a new panel handle with the state machine */
  type: "registerPanelHandle";
  data: InitializePanelHandleData;
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

export interface Rect {
  width: number;
  height: number;
}

interface SetSizeEvent {
  /** Set the size of the whole group */
  type: "setSize";
  size: Rect;
}

interface SetActualItemsSizeEvent {
  /** Set the size of the whole group */
  type: "setActualItemsSize";
  childrenSizes: Record<string, Rect>;
}

interface ApplyDeltaEvent {
  type: "applyDelta";
  delta: number;
  handleId: string;
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

export interface GroupMachineContextValue {
  /** The items in the group */
  items: Array<Item>;
  /** The available space in the group */
  size: Rect;
  /** The orientation of the grid */
  orientation: Orientation;
  /** How much the drag has overshot the handle */
  dragOvershoot: number;
  /** An id to use for autosaving the layout */
  autosaveId?: string;
  groupId: string;
}

export type GroupMachineEvent =
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
  | ApplyDeltaEvent
  | SetActualItemsSizeEvent;

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
export function isPanelData(value: unknown): value is PanelData {
  return Boolean(
    value &&
      typeof value === "object" &&
      "type" in value &&
      value.type === "panel"
  );
}

/** Determine if an item is a panel handle */
export function isPanelHandle(value: unknown): value is PanelHandleData {
  return Boolean(
    value &&
      typeof value === "object" &&
      "type" in value &&
      value.type === "handle"
  );
}

interface InitializePanelOptions {
  min?: Unit;
  max?: Unit;
  default?: Unit;
  collapsible?: boolean;
  collapsed?: boolean;
  collapsedSize?: Unit;
  onCollapseChange?: {
    current: ((isCollapsed: boolean) => void) | null | undefined;
  };
  collapseAnimation?: PanelData["collapseAnimation"];
  defaultCollapsed?: boolean;
  id?: string;
}

type InitializePanelOptionsWithId = InitializePanelOptions & { id: string };

export function initializePanel(item: InitializePanelOptionsWithId): PanelData;
export function initializePanel(
  item: InitializePanelOptions
): Omit<PanelData, "id">;
export function initializePanel(
  item: InitializePanelOptions | InitializePanelOptionsWithId
): PanelData | Omit<PanelData, "id"> {
  const data = {
    type: "panel" as const,
    min: parseUnit(item.min || "0px"),
    max: item.max ? parseUnit(item.max) : "1fr",
    collapsed: item.collapsible
      ? (item.collapsed ?? item.defaultCollapsed ?? false)
      : undefined,
    collapsible: item.collapsible,
    collapsedSize: parseUnit(item.collapsedSize ?? "0px"),
    onCollapseChange: item.onCollapseChange,
    collapseIsControlled: typeof item.collapsed !== "undefined",
    sizeBeforeCollapse: undefined,
    id: item.id,
    collapseAnimation: item.collapseAnimation,
    default: item.default ? parseUnit(item.default) : undefined,
  } satisfies Omit<PanelData, "id" | "currentValue"> & { id?: string };

  return { ...data, currentValue: makePixelUnit(-1) } satisfies Omit<
    PanelData,
    "id"
  >;
}

/** Parse a `Unit` string or `clamp` value */
export function parseUnit(unit: Unit | "1fr"): ParsedUnit {
  if (unit === "1fr") {
    unit = "100%";
  }

  if (unit.endsWith("px")) {
    return makePixelUnit(parseFloat(unit));
  }

  if (unit.endsWith("%")) {
    return makePercentUnit(parseFloat(unit));
  }

  throw new Error(`Invalid unit: ${unit}`);
}

/** Convert a `Unit` to a percentage of the group size */
export function getUnitPercentageValue(groupsSize: number, unit: ParsedUnit) {
  if (unit.type === "pixel") {
    return unit.value / groupsSize;
  }

  return unit.value;
}

export function getGroupSize(context: GroupMachineContextValue) {
  return context.orientation === "horizontal"
    ? context.size.width
    : context.size.height;
}

/** Get the size of a panel in pixels */
export function getUnitPixelValue(
  context: GroupMachineContextValue,
  unit: ParsedUnit | "1fr"
) {
  const parsed = unit === "1fr" ? parseUnit(unit) : unit;
  return parsed.type === "pixel"
    ? parsed.value
    : (parsed.value / 100) * getGroupSize(context);
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
export function getPanelWithId(
  context: GroupMachineContextValue,
  panelId: string
) {
  const item = context.items.find((i) => i.id === panelId);

  if (item && isPanelData(item)) {
    return item;
  }

  throw new Error(`Expected panel with id: ${panelId}`);
}

/** Get a panel with a particular ID. */
function getPanelHandleIndex(
  context: GroupMachineContextValue,
  handleId: string
) {
  const item = context.items.findIndex((i) => i.id === handleId);

  if (item !== -1 && isPanelHandle(context.items[item])) {
    return item;
  }

  throw new Error(`Expected panel handle with id: ${handleId}`);
}

/**
 * Get the panel that's collapsible next to a resize handle.
 * Will first check the left panel then the right.
 */
export function getCollapsiblePanelForHandleId(
  context: GroupMachineContextValue,
  handleId: string
) {
  if (!context.items.length) {
    throw new Error("No items in group");
  }

  const handleIndex = getPanelHandleIndex(context, handleId);
  const panelBefore = context.items[handleIndex - 1];
  const panelAfter = context.items[handleIndex + 1];

  if (panelBefore && isPanelData(panelBefore) && panelBefore.collapsible) {
    return panelBefore;
  }

  if (panelAfter && isPanelData(panelAfter) && panelAfter.collapsible) {
    return panelAfter;
  }

  throw new Error(`No collapsible panel found for handle: ${handleId}`);
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
    item.currentValue.type === "pixel",
    `panelHasSpace only works with number values: ${item.id} ${item.currentValue}`
  );

  if (item.collapsible && !item.collapsed) {
    return true;
  }

  return (
    item.currentValue.value > getUnitPixelValue(context, item.min) &&
    item.currentValue.value < getUnitPixelValue(context, item.max)
  );
}

/** Search in a `direction` for a panel that still has space to expand. */
function findPanelWithSpace(
  context: GroupMachineContextValue,
  items: Array<Item>,
  start: number,
  direction: number,
  disregardCollapseBuffer?: boolean
) {
  const slice =
    direction === -1 ? items.slice(0, start + 1).reverse() : items.slice(start);

  for (const panel of slice) {
    if (!isPanelData(panel)) {
      continue;
    }

    const targetPanel = disregardCollapseBuffer
      ? createUnrestrainedPanel(context, panel)
      : panel;

    if (panelHasSpace(context, targetPanel)) {
      return panel;
    }
  }
}

/** Add up all the static values in the layout */
function getStaticWidth(context: GroupMachineContextValue) {
  let width = 0;

  for (const item of context.items) {
    if (isPanelHandle(item)) {
      width += item.size.value;
    } else if (
      isPanelData(item) &&
      item.collapsed &&
      item.currentValue.type === "pixel"
    ) {
      width += item.currentValue.value;
    } else if (
      isPanelData(item) &&
      item.default &&
      item.default.type === "pixel"
    ) {
      width += item.default.value;
    }
  }

  return width;
}

function formatUnit(unit: ParsedUnit): Unit {
  if (unit.type === "pixel") {
    return `${unit.value}px`;
  }

  return `${unit.value}%`;
}

/** Build the grid template from the item values. */
export function buildTemplate(context: GroupMachineContextValue) {
  const staticWidth = getStaticWidth(context);

  return context.items
    .map((item) => {
      if (item.type === "panel") {
        const min = formatUnit(item.min);

        if (
          item.currentValue.type === "pixel" &&
          item.currentValue.value !== -1
        ) {
          return formatUnit(item.currentValue);
        } else if (item.currentValue.type === "percent") {
          const max = item.max === "1fr" ? "100%" : formatUnit(item.max);
          return `minmax(${min}, min(calc(${item.currentValue.value} * (100% - ${staticWidth}px)), ${max}))`;
        } else if (item.collapsible && item.collapsed) {
          return formatUnit(item.collapsedSize);
        } else if (item.default) {
          return formatUnit(item.default);
        }

        const max = item.max === "1fr" ? "1fr" : formatUnit(item.max);
        return `minmax(${min}, ${max})`;
      }

      return formatUnit(item.size);
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

function createUnrestrainedPanel(
  context: GroupMachineContextValue,
  data: PanelData
) {
  return {
    ...data,
    min: makePixelUnit(0),
    max: makePixelUnit(getGroupSize(context)),
  };
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
export function prepareItems(context: GroupMachineContextValue) {
  const newItems = [...context.items];
  const staticWidth = getStaticWidth(context);

  for (const item of newItems) {
    if (!item || !isPanelData(item)) {
      continue;
    }

    if (item.currentValue.type === "pixel") {
      continue;
    }

    // TODO: Decimal proposal
    item.currentValue = makePixelUnit(
      Math.round(
        (getGroupSize(context) - staticWidth) * item.currentValue.value
      )
    );
  }

  return newItems;
}

/** On every mouse move we distribute the space added */
function updateLayout(
  context: GroupMachineContextValue,
  dragEvent:
    | (DragHandleEvent & {
        controlled?: boolean;
        disregardCollapseBuffer?: never;
      })
    | {
        type: "collapsePanel";
        value: MoveMoveEvent;
        handleId: string;
        controlled?: boolean;
        disregardCollapseBuffer?: boolean;
      }
): Partial<GroupMachineContextValue> {
  const handleIndex = getPanelHandleIndex(context, dragEvent.handleId);
  const handle = context.items[handleIndex] as PanelHandleData;
  const newItems = [...context.items];

  let moveAmount =
    context.orientation === "horizontal"
      ? dragEvent.value.deltaX
      : dragEvent.value.deltaY;

  if (dragEvent.value.shiftKey) {
    moveAmount *= 15;
  }

  if (moveAmount === 0) {
    return {};
  }

  const moveDirection = moveAmount / Math.abs(moveAmount);

  // Go forward into the shrinking panels to find a panel that still has space.
  const panelBefore = findPanelWithSpace(
    context,
    newItems,
    handleIndex + moveDirection,
    moveDirection,
    dragEvent.disregardCollapseBuffer
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
  if (!dragEvent.disregardCollapseBuffer) {
    if (panelAfter.collapsible && panelAfter.collapsed) {
      const isInLeftBuffer = newDragOvershoot < 0 && moveDirection > 0;
      const isInLeftOvershoot = newDragOvershoot > 0 && moveDirection > 0;
      const isInRightBuffer = newDragOvershoot > 0 && moveDirection < 0;
      const isInRightOvershoot = newDragOvershoot < 0 && moveDirection < 0;
      const potentialNewValue =
        panelAfter.currentValue.value +
        newDragOvershoot * (isInRightBuffer ? moveDirection : 1);
      const min = getUnitPixelValue(context, panelAfter.min);

      if (
        (newDragOvershoot === 0 ||
          isInRightBuffer ||
          isInLeftBuffer ||
          ((isInLeftOvershoot || isInRightOvershoot) &&
            Math.abs(newDragOvershoot) < COLLAPSE_THRESHOLD)) &&
        potentialNewValue < min
      ) {
        return { dragOvershoot: newDragOvershoot };
      }
    }
    // Don't let the panel collapse until the threshold is reached
    else if (
      panelBefore.collapsible &&
      panelBefore.currentValue.value ===
        getUnitPixelValue(context, panelBefore.min)
    ) {
      const potentialNewValue =
        panelBefore.currentValue.value - Math.abs(newDragOvershoot);

      if (
        Math.abs(newDragOvershoot) < COLLAPSE_THRESHOLD &&
        potentialNewValue >
          getUnitPixelValue(context, panelBefore.collapsedSize)
      ) {
        return { dragOvershoot: newDragOvershoot };
      }
    }
  }

  // Apply the move amount to the panel before the slider
  const unrestrainedPanelBefore = createUnrestrainedPanel(context, panelBefore);
  const panelBeforePreviousValue = panelBefore.currentValue.value;
  const panelBeforeNewValueRaw =
    panelBefore.currentValue.value - moveAmount * moveDirection;
  let panelBeforeNewValue = dragEvent.disregardCollapseBuffer
    ? clampUnit(context, unrestrainedPanelBefore, panelBeforeNewValueRaw)
    : clampUnit(context, panelBefore, panelBeforeNewValueRaw);

  // Also apply the move amount the panel after the slider
  const unrestrainedPanelAfter = createUnrestrainedPanel(context, panelAfter);
  const panelAfterPreviousValue = panelAfter.currentValue.value;
  const applied = panelBeforePreviousValue - panelBeforeNewValue;
  const panelAfterNewValueRaw = panelAfter.currentValue.value + applied;
  let panelAfterNewValue = dragEvent.disregardCollapseBuffer
    ? clampUnit(context, unrestrainedPanelAfter, panelAfterNewValueRaw)
    : clampUnit(context, panelAfter, panelAfterNewValueRaw);

  if (dragEvent.disregardCollapseBuffer) {
    if (panelAfter.collapsible && panelAfter.collapsed) {
      panelAfter.collapsed = false;
    }
  }
  // If the panel was collapsed, expand it
  // We need to re-apply the move amount since the the expansion of the
  // collapsed panel disregards that.
  else if (panelAfter.collapsible && panelAfter.collapsed) {
    if (
      panelAfter.onCollapseChange?.current &&
      panelAfter.collapseIsControlled &&
      !dragEvent.controlled
    ) {
      panelAfter.onCollapseChange.current(false);
      return { dragOvershoot: newDragOvershoot };
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
    if (extra > 0) {
      panelAfterNewValue += extra;
    }
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

  const panelBeforeIsAboutToCollapse =
    panelBefore.currentValue.value ===
    getUnitPixelValue(context, panelBefore.min);

  // If the panel was expanded and now is at it's min size, collapse it
  if (
    !dragEvent.disregardCollapseBuffer &&
    panelBefore.collapsible &&
    panelBeforeIsAboutToCollapse
  ) {
    if (
      panelBefore.onCollapseChange?.current &&
      panelBefore.collapseIsControlled &&
      !dragEvent.controlled
    ) {
      panelBefore.onCollapseChange.current(true);
      return { dragOvershoot: newDragOvershoot };
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

  panelBefore.currentValue = makePixelUnit(panelBeforeNewValue);
  panelAfter.currentValue = makePixelUnit(panelAfterNewValue);

  const leftoverSpace =
    getGroupSize(context) -
    newItems.reduce(
      (acc, b) =>
        acc +
        // in updateLayout the panel units will always be numbers
        (isPanelData(b) ? b.currentValue.value : b.size.value),
      0
    );

  // TODO: this is wrong?
  panelBefore.currentValue.value += leftoverSpace;

  return { items: newItems, dragOvershoot: 0 };
}

/** Converts the items to percentages */
export function commitLayout(context: GroupMachineContextValue) {
  const newItems = [...context.items];

  // First set all the static width
  newItems.forEach((item, index) => {
    if (item.type !== "panel") {
      return;
    }

    if (item.collapsed) {
      newItems[index] = {
        ...item,
        currentValue: item.collapsedSize,
      };
    }
  });

  const staticWidth = getStaticWidth({ ...context, items: newItems });

  newItems.forEach((item, index) => {
    if (item.type !== "panel" || item.collapsed) {
      return;
    }

    newItems[index] = {
      ...item,
      currentValue: makePercentUnit(
        item.currentValue.value / (getGroupSize(context) - staticWidth)
      ),
    };
  });

  return newItems;
}

export function dragHandlePayload({
  delta,
  orientation,
  shiftKey = false,
}: {
  delta: number;
  orientation: Orientation;
  shiftKey?: boolean;
}) {
  return {
    type: "move",
    pointerType: "keyboard",
    shiftKey,
    ctrlKey: false,
    altKey: false,
    metaKey: false,
    deltaX: orientation === "horizontal" ? delta : 0,
    deltaY: orientation === "horizontal" ? 0 : delta,
  } as const;
}

/** Iteratively applies a large delta value simulating a user's drag */
function iterativelyUpdateLayout({
  context,
  handleId,
  delta,
  direction,
  controlled,
  disregardCollapseBuffer,
}: {
  context: GroupMachineContextValue;
  handleId: string;
  delta: number;
  direction: -1 | 1;
  controlled?: boolean;
  disregardCollapseBuffer?: boolean;
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
        disregardCollapseBuffer,
        value: dragHandlePayload({
          delta: direction,
          orientation: context.orientation,
        }),
      }
    );
  }

  return newContext;
}

function applyDeltaInBothDirections(
  context: GroupMachineContextValue,
  newItems: Array<Item>,
  itemIndex: number,
  delta: number
) {
  let hasTriedBothDirections = false;
  let direction = 1;

  // Starting from where the items was removed add space to the panels around it.
  // This is only needed for conditional rendering.
  while (delta !== 0) {
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

    const oldValue = targetPanel.currentValue.value;
    const newValue = clampUnit(context, targetPanel, oldValue + delta);

    targetPanel.currentValue.value = newValue;
    delta -= newValue - oldValue;
    direction = direction === 1 ? -1 : 1;
  }
}

// #endregion

// #region Machine

interface AnimationActorInput {
  context: GroupMachineContextValue;
  event: CollapsePanelEvent | ExpandPanelEvent;
  send: (event: GroupMachineEvent) => void;
}

interface AnimationActorOutput {
  panelId: string;
  action: "expand" | "collapse";
}

const animationActor = fromPromise<
  AnimationActorOutput | undefined,
  AnimationActorInput
>(
  ({ input: { send, context, event } }) =>
    new Promise<AnimationActorOutput | undefined>((resolve) => {
      const panel = getPanelWithId(context, event.panelId);
      const handle = getHandleForPanelId(context, event.panelId);

      let direction = handle.direction;
      let fullDelta = 0;

      if (event.type === "expandPanel") {
        fullDelta =
          (panel.sizeBeforeCollapse ?? getUnitPixelValue(context, panel.min)) -
          panel.currentValue.value;
      } else {
        const collapsedSize = getUnitPixelValue(context, panel.collapsedSize);

        panel.sizeBeforeCollapse = panel.currentValue.value;
        direction *= -1 as -1 | 1;
        fullDelta = panel.currentValue.value - collapsedSize;
      }

      const fps = 60;
      const { duration, ease } = getCollapseAnimation(panel);
      const totalFrames = Math.ceil(
        panel.collapseAnimation ? duration / (1000 / fps) : 1
      );
      let frame = 0;
      let appliedDelta = 0;

      function renderFrame() {
        const progress = (frame++ + 1) / totalFrames;
        const e = panel.collapseAnimation ? ease(progress) : 1;
        const delta = (e * fullDelta - appliedDelta) * direction;

        send({ type: "applyDelta", handleId: handle.item.id, delta });
        appliedDelta +=
          Math.abs(delta) *
          ((delta > 0 && direction === -1) || (delta < 0 && direction === 1)
            ? -1
            : 1);

        if (e === 1) {
          const action = event.type === "expandPanel" ? "expand" : "collapse";
          resolve({ panelId: panel.id, action });
          return false;
        }

        return true;
      }

      raf(renderFrame);
    })
);

export const groupMachine = createMachine(
  {
    initial: "idle",
    types: {
      context: {} as GroupMachineContextValue,
      events: {} as GroupMachineEvent,
      input: {} as {
        autosaveId?: string;
        orientation?: Orientation;
        groupId: string;
        initialItems?: Item[];
      },
    },
    context: ({ input }) => ({
      size: { width: 0, height: 0 },
      items: input.initialItems || [],
      orientation: input.orientation || "horizontal",
      dragOvershoot: 0,
      autosaveId: input.autosaveId,
      groupId: input.groupId,
    }),
    states: {
      idle: {
        on: {
          setActualItemsSize: { actions: ["recordActualItemSize"] },
          dragHandleStart: { target: "dragging" },
          setPanelPixelSize: {
            actions: ["prepare", "onSetPanelSize", "commit"],
          },
          collapsePanel: [
            {
              actions: "notifyCollapseToggle",
              guard: "shouldNotifyCollapseToggle",
            },
            { target: "togglingCollapse" },
          ],
          expandPanel: [
            {
              actions: "notifyCollapseToggle",
              guard: "shouldNotifyCollapseToggle",
            },
            { target: "togglingCollapse" },
          ],
        },
      },
      dragging: {
        entry: ["prepare"],
        on: {
          dragHandle: { actions: ["onDragHandle"] },
          dragHandleEnd: { target: "idle" },
          collapsePanel: {
            guard: "shouldCollapseToggle",
            actions: "runCollapseToggle",
          },
          expandPanel: {
            guard: "shouldCollapseToggle",
            actions: "runCollapseToggle",
          },
        },
        exit: ["commit", "onAutosave"],
      },
      togglingCollapse: {
        entry: ["prepare"],
        invoke: {
          src: "animation",
          input: (i) => ({ ...i, send: i.self.send }),
          onDone: {
            target: "idle",
            actions: ["onToggleCollapseComplete", "commit", "onAutosave"],
          },
        },
        on: {
          applyDelta: { actions: ["onApplyDelta"] },
        },
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
    },
  },
  {
    guards: {
      shouldNotifyCollapseToggle: ({ context, event }) => {
        isEvent(event, ["collapsePanel", "expandPanel"]);
        const panel = getPanelWithId(context, event.panelId);
        return !event.controlled && panel.collapseIsControlled === true;
      },
      shouldCollapseToggle: ({ context, event }) => {
        isEvent(event, ["collapsePanel", "expandPanel"]);
        const panel = getPanelWithId(context, event.panelId);
        return panel.collapseIsControlled === true;
      },
    },
    actors: {
      animation: animationActor,
    },
    actions: {
      notifyCollapseToggle: ({ context, event }) => {
        isEvent(event, ["collapsePanel", "expandPanel"]);
        const panel = getPanelWithId(context, event.panelId);
        panel.onCollapseChange?.current?.(!panel.collapsed);
      },
      runCollapseToggle: enqueueActions(({ context, event, enqueue }) => {
        isEvent(event, ["collapsePanel", "expandPanel"]);

        const handle = getHandleForPanelId(context, event.panelId);
        // When collapsing a panel it will be in the opposite direction
        // that handle assumes
        const delta =
          event.type === "collapsePanel"
            ? handle.direction * -1
            : handle.direction;
        const newContext = updateLayout(context, {
          handleId: handle.item.id,
          type: "dragHandle",
          controlled: event.controlled,
          value: dragHandlePayload({ delta, orientation: context.orientation }),
        });

        enqueue.assign(newContext);
      }),
      onToggleCollapseComplete: assign({
        items: ({ context, event: e }) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const output = (e as any).output as AnimationActorOutput;
          invariant(output, "Expected output from animation actor");

          const panel = getPanelWithId(context, output.panelId);
          panel.collapsed = output.action === "collapse";

          if (panel.collapsed) {
            panel.currentValue = panel.collapsedSize;
          }

          return context.items;
        },
      }),
      updateSize: assign({
        size: ({ event }) => {
          isEvent(event, ["setSize"]);
          return event.size;
        },
      }),
      recordActualItemSize: assign({
        items: ({ context, event }) => {
          isEvent(event, ["setActualItemsSize"]);

          const orientation = context.orientation;

          for (const [id, size] of Object.entries(event.childrenSizes)) {
            const item = context.items.find((i) => i.id === id);

            if (!isPanelData(item)) {
              continue;
            }

            item.currentValue = makePixelUnit(
              orientation === "horizontal" ? size.width : size.height
            );
          }

          return commitLayout(context);
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
            currentValue: makePixelUnit(-1),
            ...event.data,
          });
        },
      }),
      onRegisterDynamicPanel: assign({
        items: ({ context, event }) => {
          isEvent(event, ["registerDynamicPanel"]);

          let currentValue: ParsedUnit = makePixelUnit(0);

          if (
            event.data.collapsible &&
            event.data.collapsed &&
            event.data.collapsedSize
          ) {
            currentValue = event.data.collapsedSize;
          } else if (event.data.default) {
            currentValue = event.data.default;
          } else {
            currentValue = event.data.min;
          }

          const newItems = addDeDuplicatedItems(context.items, {
            type: "panel",
            ...event.data,
            currentValue,
          });
          const itemIndex = newItems.findIndex(
            (item) => item.id === event.data.id
          );
          const newContext = { ...context, items: newItems };
          const overflowDueToHandles =
            context.items.reduce((acc, i) => {
              if (isPanelHandle(i)) {
                return acc + getUnitPixelValue(context, i.size);
              }

              return acc + i.currentValue.value;
            }, 0) - getGroupSize(context);

          applyDeltaInBothDirections(
            newContext,
            newItems,
            itemIndex,
            -1 * (currentValue.value + overflowDueToHandles)
          );

          return newItems;
        },
      }),
      assignPanelHandleData: assign({
        items: ({ context, event }) => {
          isEvent(event, ["registerPanelHandle"]);

          return addDeDuplicatedItems(context.items, {
            type: "handle",
            ...event.data,
            size: event.data.size as ParsedPixelUnit,
          });
        },
      }),
      removeItem: assign({
        items: ({ context, event }) => {
          isEvent(event, ["unregisterPanel", "unregisterPanelHandle"]);
          const itemIndex = context.items.findIndex(
            (item) => item.id === event.id
          );
          const item = context.items[itemIndex];

          if (!item) {
            return context.items;
          }

          const newItems = context.items.filter((i) => i.id !== event.id);
          const removedSize = isPanelData(item)
            ? item.currentValue.value
            : item.size.value;

          applyDeltaInBothDirections(context, newItems, itemIndex, removedSize);

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
      onApplyDelta: assign(({ context, event }) => {
        isEvent(event, ["applyDelta"]);
        return updateLayout(context, {
          handleId: event.handleId,
          type: "collapsePanel",
          disregardCollapseBuffer: true,
          value: dragHandlePayload({
            delta: event.delta,
            orientation: context.orientation,
          }),
        });
      }),
      onSetPanelSize: enqueueActions(({ context, event, enqueue }) => {
        isEvent(event, ["setPanelPixelSize"]);

        const panel = getPanelWithId(context, event.panelId);
        const handle = getHandleForPanelId(context, event.panelId);
        const current = panel.currentValue.value;
        const newSize = clampUnit(
          context,
          panel,
          getUnitPixelValue(context, parseUnit(event.size))
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
    },
  }
);

// #endregion
