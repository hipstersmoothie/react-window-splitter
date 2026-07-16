import Big from "big.js";
import { raf } from "./raf.js";

// #region Constants

/** The default amount a user can `dragOvershoot` before the panel collapses */
const COLLAPSE_THRESHOLD = 50;

// #endregion

// #region Types

export type PixelUnit = `${number}px`;
export type PercentUnit = `${number}%`;
export type Unit = PixelUnit | PercentUnit;
export type Orientation = "horizontal" | "vertical";

export interface ParsedPercentUnit {
  type: "percent";
  value: Big.Big;
}

export interface ParsedPixelUnit {
  type: "pixel";
  value: Big.Big;
}

export type ParsedUnit = ParsedPercentUnit | ParsedPixelUnit;

export function makePercentUnit(value: number): ParsedPercentUnit {
  return { type: "percent", value: new Big(value) };
}

export function makePixelUnit(value: number): ParsedPixelUnit {
  return { type: "pixel", value: new Big(value) };
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
  /**
   * By default the layout will be stored in percentage values while at rest.
   * This makes scaling the layout easier when the container is resized.
   * However you might have a panel you want to stay at a static size when
   * the container is resized.
   */
  isStaticAtRest?: boolean;
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
  /** A ref to the latest "onResize" function provided by the user */
  onResize?: {
    current: OnResizeCallback | null | undefined;
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
  lastKnownSize?: Rect;
}

function getCollapseAnimation(panel: PanelData) {
  let easeFn = collapseAnimations.linear;
  let duration = 300;

  if (panel.collapseAnimation) {
    if (typeof panel.collapseAnimation === "string") {
      easeFn = collapseAnimations[panel.collapseAnimation];
    } else {
      duration = panel.collapseAnimation.duration;
      easeFn =
        typeof panel.collapseAnimation.easing === "function"
          ? panel.collapseAnimation.easing
          : collapseAnimations[panel.collapseAnimation.easing];
    }
  }

  return { ease: easeFn, duration };
}

/** Copied from https://github.com/d3/d3-ease */
const collapseAnimations = {
  "ease-in-out": function quadInOut(t: number) {
    return ((t *= 2) <= 1 ? t * t : --t * (2 - t) + 1) / 2;
  },
  bounce: function backInOut(t: number) {
    const s = 1.70158;
    return (
      ((t *= 2) < 1
        ? t * t * ((s + 1) * t - s)
        : (t -= 2) * t * ((s + 1) * t + s) + 2) / 2
    );
  },
  linear: function linear(t: number) {
    return +t;
  },
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

interface RebindPanelCallbacksEvent {
  /** Rebind the panel callbacks */
  type: "rebindPanelCallbacks";
  data: Pick<PanelData, "id" | "onCollapseChange" | "onResize">;
}

interface UpdateConstraintsEvent {
  /** Update the constraints of a panel */
  type: "updateConstraints";
  data:
    | Pick<
        PanelData,
        "id" | "min" | "max" | "default" | "collapsedSize" | "isStaticAtRest"
      >
    | Pick<PanelHandleData, "id" | "size">;
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

export type InitializePanelHandleData = Omit<
  PanelHandleData,
  "type" | "size"
> & {
  size: PixelUnit;
};

interface RegisterPanelHandleEvent {
  /** Register a new panel handle with the state machine */
  type: "registerPanelHandle";
  data: PanelHandleData;
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
  panelId: string;
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
  resolve?: () => void;
}

interface ExpandPanelEvent extends ControlledCollapseToggle {
  /** Expand a panel */
  type: "expandPanel";
  /** The panel to expand */
  panelId: string;
  resolve?: () => void;
}

interface UpdateItemIndexEvent {
  /** Update the index of a panel */
  type: "updateItemIndex";
  /** The panel to update */
  itemId: string;
  /** The new index of the panel */
  index: number;
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
  dragOvershoot: Big.Big;
  /** The id of the handle that is currently being dragged */
  activeDragHandleId?: string;
  groupId: string;
  /**
   * How to save the persisted state
   */
  autosaveStrategy?: "localStorage" | "cookie";
  /**
   * The amount to move the drag handle when shift is held down.
   * @default 15px
   */
  shiftAmount?: number;
}

interface LockGroupEvent {
  type: "lockGroup";
}

interface UnlockGroupEvent {
  type: "unlockGroup";
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
  | SetActualItemsSizeEvent
  | RebindPanelCallbacksEvent
  | UpdateConstraintsEvent
  | LockGroupEvent
  | UnlockGroupEvent
  | UpdateItemIndexEvent;

type EventForType<T extends GroupMachineEvent["type"]> = Extract<
  GroupMachineEvent,
  { type: T }
>;

// #endregion

// #region Helpers

export function getCursor(
  context: Pick<GroupMachineContextValue, "dragOvershoot" | "orientation">,
) {
  if (context.orientation === "horizontal") {
    if (context.dragOvershoot.gt(0)) {
      return "w-resize";
    } else if (context.dragOvershoot.lt(0)) {
      return "e-resize";
    } else {
      return "ew-resize";
    }
  } else {
    if (context.dragOvershoot.gt(0)) {
      return "n-resize";
    } else if (context.dragOvershoot.lt(0)) {
      return "s-resize";
    } else {
      return "ns-resize";
    }
  }
}

export function prepareSnapshot(snapshot: GroupMachineContextValue) {
  // convert from old format
  if ("context" in snapshot) {
    snapshot = snapshot.context as GroupMachineContextValue;
  }

  if (!("items" in snapshot)) {
    return;
  }

  snapshot.dragOvershoot = new Big(snapshot.dragOvershoot || 0);

  for (const item of snapshot.items) {
    if (isPanelData(item)) {
      item.currentValue.value = new Big(item.currentValue.value);
      item.collapsedSize.value = new Big(item.collapsedSize.value);
      item.min.value = new Big(item.min.value);

      if (item.default) {
        item.default.value = new Big(item.default.value);
      }

      if (item.max && item.max !== "1fr") {
        item.max.value = new Big(item.max.value);
      }
    } else {
      item.size.value = new Big(item.size.value);
    }
  }

  return snapshot;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function invariant(condition: any, message: string): asserts condition {
  if (condition) return;
  throw new Error(message);
}

/** Assert that the provided event is one of the accepted types */
function isEvent<T extends GroupMachineEvent["type"]>(
  event: GroupMachineEvent,
  eventType: T[],
): asserts event is EventForType<T> {
  invariant(
    eventType.includes(event.type as T),
    `Invalid event type: ${eventType}. Expected: ${eventType.join(" | ")}`,
  );
}

/** Determine if an item is a panel */
export function isPanelData(value: unknown): value is PanelData {
  return Boolean(
    value &&
      typeof value === "object" &&
      "type" in value &&
      value.type === "panel",
  );
}

/** Determine if an item is a panel handle */
export function isPanelHandle(value: unknown): value is PanelHandleData {
  return Boolean(
    value &&
      typeof value === "object" &&
      "type" in value &&
      value.type === "handle",
  );
}

type OnResizeSize = {
  pixel: number;
  percentage: number;
};

export type OnResizeCallback = (size: OnResizeSize) => void;

type InitializePanelOptions = {
  min?: Unit;
  max?: Unit;
  default?: Unit;
  collapsedSize?: Unit;
  id?: string;
} & Partial<
  Pick<
    PanelData,
    | "isStaticAtRest"
    | "collapseAnimation"
    | "defaultCollapsed"
    | "onResize"
    | "collapsible"
    | "collapsed"
    | "onCollapseChange"
  >
>;

type InitializePanelOptionsWithId = InitializePanelOptions & { id: string };

export function initializePanel(item: InitializePanelOptionsWithId): PanelData;
export function initializePanel(
  item: InitializePanelOptions,
): Omit<PanelData, "id">;
export function initializePanel(
  item: InitializePanelOptions | InitializePanelOptionsWithId,
): PanelData | Omit<PanelData, "id"> {
  const onResize = () => {
    let lastCall: OnResizeSize | null = null;

    // Memo-ize so we only call the callback once per size
    return ((size) => {
      if (
        !lastCall ||
        (lastCall.pixel === size.pixel &&
          lastCall.percentage === size.percentage)
      ) {
        lastCall = size;
        return;
      }

      lastCall = size;
      item.onResize?.current?.(size);
    }) satisfies OnResizeCallback;
  };

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
    onResize: { current: onResize() },
    collapseIsControlled: typeof item.collapsed !== "undefined",
    sizeBeforeCollapse: undefined,
    id: item.id,
    collapseAnimation: item.collapseAnimation,
    default: item.default ? parseUnit(item.default) : undefined,
    isStaticAtRest: item.isStaticAtRest,
  } satisfies Omit<PanelData, "id" | "currentValue"> & { id?: string };

  return { ...data, currentValue: makePixelUnit(-1) } satisfies Omit<
    PanelData,
    "id"
  >;
}

function eq(a: ParsedUnit, b: ParsedUnit) {
  return a.type === b.type && a.value.eq(b.value);
}

export function haveConstraintsChangedForPanel(
  a: Omit<PanelData, "id" | "currentValue">,
  b?: Omit<PanelData, "id" | "currentValue">,
) {
  if (!b) {
    return true;
  }

  if (!eq(a.min, b.min)) {
    return true;
  }

  if (
    (a.max === "1fr" && b.max !== "1fr") ||
    (a.max !== "1fr" && b.max === "1fr") ||
    (a.max !== "1fr" && b.max !== "1fr" && !eq(a.max, b.max))
  ) {
    return true;
  }

  if (
    (a.default && !b.default) ||
    (!a.default && b.default) ||
    (a.default && b.default && !eq(a.default, b.default))
  ) {
    return true;
  }

  if (!eq(a.collapsedSize, b.collapsedSize)) {
    return true;
  }

  if (a.isStaticAtRest !== b.isStaticAtRest) {
    return true;
  }

  if (
    (a.collapseAnimation && !b.collapseAnimation) ||
    (!a.collapseAnimation && b.collapseAnimation) ||
    (typeof a.collapseAnimation === "string" &&
      typeof b.collapseAnimation === "string" &&
      a.collapseAnimation !== b.collapseAnimation) ||
    (typeof a.collapseAnimation === "object" &&
      typeof b.collapseAnimation === "object" &&
      (a.collapseAnimation.duration !== b.collapseAnimation.duration ||
        a.collapseAnimation.easing !== b.collapseAnimation.easing))
  ) {
    return true;
  }

  if (a.collapsible !== b.collapsible) {
    return true;
  }

  return false;
}

export function haveConstraintsChangedForPanelHandle(
  a: Omit<PanelHandleData, "id">,
  b?: Omit<PanelHandleData, "id">,
) {
  if (!b) {
    return true;
  }

  if (!eq(a.size, b.size)) {
    return true;
  }

  return false;
}

export function initializePanelHandleData(item: InitializePanelHandleData) {
  return {
    type: "handle" as const,
    ...item,
    size:
      typeof item.size === "string"
        ? (parseUnit(item.size) as ParsedPixelUnit)
        : item.size,
  };
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
    return makePercentUnit(parseFloat(unit) / 100);
  }

  throw new Error(`Invalid unit: ${unit}`);
}

/** Convert a `Unit` to a percentage of the group size */
export function getUnitPercentageValue(groupsSize: number, unit: ParsedUnit) {
  if (unit.type === "pixel") {
    return groupsSize === 0 ? 0 : unit.value.div(groupsSize).toNumber();
  }

  return unit.value.toNumber();
}

export function getGroupSize(context: GroupMachineContextValue) {
  return context.orientation === "horizontal"
    ? context.size.width
    : context.size.height;
}

/** Get the size of a panel in pixels */
function getUnitPixelValue(
  context: GroupMachineContextValue,
  unit: ParsedUnit | "1fr",
) {
  const parsed = unit === "1fr" ? parseUnit(unit) : unit;
  return parsed.type === "pixel"
    ? parsed.value
    : parsed.value.mul(getGroupSize(context));
}

/** Clamp a new `currentValue` given the panel's constraints. */
function clampUnit(
  context: GroupMachineContextValue,
  item: PanelData,
  value: Big.Big,
) {
  const min = getUnitPixelValue(context, item.min);
  const max = getUnitPixelValue(context, item.max);

  if (value.gte(min) && value.lte(max)) {
    return value;
  }

  return value.lt(min) ? min : max;
}

/** Get a panel with a particular ID. */
export function getPanelWithId(
  context: GroupMachineContextValue,
  panelId: string,
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
  handleId: string,
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
  handleId: string,
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
  panelId: string,
) {
  const panelIndex = context.items.findIndex((item) => item.id === panelId);

  // When in controlled collapse mode we defer to the controlled state to know if we need to update.
  // The confirmation comes along as an expand/collapse event.
  // The default behavior is to find the closes handle and use that to collapse, if we're dragging some other
  // handle though we want to use that instead. This will results in a smoother visual experience.
  if (context.activeDragHandleId) {
    const handleIndex = getPanelHandleIndex(
      context,
      context.activeDragHandleId,
    );
    const item = context.items[handleIndex];

    if (item && isPanelHandle(item)) {
      return {
        item,
        direction: handleIndex > panelIndex ? (1 as const) : (-1 as const),
      };
    }
  }

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

function getHandleForPanelIdWithAvailableSpace(
  context: GroupMachineContextValue,
  panelId: string,
) {
  const panelIndex = context.items.findIndex((item) => item.id === panelId);

  invariant(panelIndex !== -1, `Expected panel before: ${panelId}`);

  let item = context.items[panelIndex + 1];

  if (
    item &&
    isPanelHandle(item) &&
    findPanelWithSpace(context, context.items, panelIndex + 1, 1, "add")
  ) {
    return { item, direction: 1 as const };
  }

  item = context.items[panelIndex - 1];

  if (
    item &&
    isPanelHandle(item) &&
    findPanelWithSpace(context, context.items, panelIndex - 1, -1, "add")
  ) {
    return { item, direction: -1 as const };
  }

  return getHandleForPanelId(context, panelId);
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
function panelHasSpace(
  context: GroupMachineContextValue,
  item: PanelData,
  adjustment: "add" | "subtract",
) {
  invariant(
    item.currentValue.type === "pixel",
    `panelHasSpace only works with number values: ${item.id} ${item.currentValue}`,
  );

  if (item.collapsible) {
    return !item.collapsed;
  }

  if (adjustment === "add") {
    return (
      item.currentValue.value.gte(getUnitPixelValue(context, item.min)) &&
      item.currentValue.value.lt(getUnitPixelValue(context, item.max))
    );
  }

  return item.currentValue.value.gt(getUnitPixelValue(context, item.min));
}

/** Search in a `direction` for a panel that still has space to expand. */
function findPanelWithSpace(
  context: GroupMachineContextValue,
  items: Array<Item>,
  start: number,
  direction: number,
  adjustment: "add" | "subtract",
  disregardCollapseBuffer?: boolean,
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

    if (panelHasSpace(context, targetPanel, adjustment)) {
      return panel;
    }
  }
}

/** Add up all the static values in the layout */
function getStaticWidth(context: GroupMachineContextValue) {
  let width = new Big(0);

  for (const item of context.items) {
    if (isPanelHandle(item)) {
      width = width.add(item.size.value);
    } else if (item.collapsed && item.currentValue.type === "pixel") {
      width = width.add(item.currentValue.value);
    } else if (item.isStaticAtRest) {
      width = width.add(item.currentValue.value);
    }
  }

  return width;
}

export function formatUnit(unit: ParsedUnit): Unit {
  if (unit.type === "pixel") {
    return `${unit.value.toNumber()}px`;
  }

  return `${unit.value.mul(100).toNumber()}%`;
}

export function getPanelGroupPixelSizes(context: GroupMachineContextValue) {
  return prepareItems(context).map((i) =>
    isPanelData(i)
      ? i.currentValue.value.toNumber()
      : getUnitPixelValue(context, i.size).toNumber(),
  );
}

export function getPanelPixelSize(
  context: GroupMachineContextValue,
  panelId: string,
) {
  const p = getPanelWithId(
    { ...context, items: prepareItems(context) },
    panelId,
  );

  return p.currentValue.value.toNumber();
}

export function getPanelGroupPercentageSizes(
  context: GroupMachineContextValue,
) {
  const clamped = commitLayout({
    ...context,
    items: prepareItems(context),
  });

  return clamped.map((i) => {
    if (isPanelHandle(i)) {
      return getUnitPercentageValue(getGroupSize(context), i.size);
    }

    return getUnitPercentageValue(getGroupSize(context), i.currentValue);
  });
}

export function getPanelPercentageSize(
  context: GroupMachineContextValue,
  panelId: string,
) {
  const items = prepareItems(context);
  const p = getPanelWithId({ ...context, items }, panelId);
  return getUnitPercentageValue(getGroupSize(context), p.currentValue);
}

/** Build the grid template from the item values. */
export function buildTemplate(context: GroupMachineContextValue) {
  const staticWidth = getStaticWidth(context);
  let hasSeenFillPanel = false;

  return context.items
    .map((item) => {
      if (item.type === "panel") {
        const min = formatUnit(item.min);

        if (
          item.currentValue.type === "pixel" &&
          item.currentValue.value.toNumber() !== -1
        ) {
          if (item.isStaticAtRest) {
            const max = item.max === "1fr" ? "100%" : formatUnit(item.max);
            return `clamp(${min}, ${formatUnit(item.currentValue)}, ${max})`;
          }

          return formatUnit(item.currentValue);
        } else if (item.currentValue.type === "percent") {
          if (
            !hasSeenFillPanel &&
            (item.max === "1fr" ||
              (item.max.type === "percent" && item.max.value.eq(100)))
          ) {
            hasSeenFillPanel = true;
            return `minmax(${min}, 1fr)`;
          }

          const max = item.max === "1fr" ? "100%" : formatUnit(item.max);
          return `minmax(${min}, min(calc(${item.currentValue.value} * (100% - ${staticWidth}px)), ${max}))`;
        } else if (item.collapsible && item.collapsed) {
          return formatUnit(item.collapsedSize);
        } else if (item.default) {
          const siblingHasFill = context.items.some(
            (i) =>
              isPanelData(i) &&
              i.id !== item.id &&
              !i.collapsed &&
              (i.max === "1fr" ||
                (i.max.type === "percent" && i.max.value.eq(100))),
          );

          // If a sibling has a fill, this item doesn't need to expand
          // So we can just use the default value
          if (siblingHasFill) {
            return formatUnit(item.default);
          }

          // Use 1fr so that panel fills ths space if needed
          const max = item.max === "1fr" ? "1fr" : formatUnit(item.max);
          return `minmax(${formatUnit(item.default)}, ${max})`;
        } else {
          const max = item.max === "1fr" ? "1fr" : formatUnit(item.max);
          return `minmax(${min}, ${max})`;
        }
      }

      return formatUnit(item.size);
    })
    .join(" ");
}

function addDeDuplicatedItems(items: Array<Item>, newItem: Item) {
  const currentItemIndex = items.findIndex(
    (item) =>
      item.id === newItem.id ||
      (typeof item.order === "number" && item.order === newItem.order),
  );

  let restItems = items;

  if (currentItemIndex !== -1) {
    restItems = items.filter((_, index) => index !== currentItemIndex);
  }

  return sortWithOrder([...restItems, newItem]);
}

function createUnrestrainedPanel(_: GroupMachineContextValue, data: PanelData) {
  return {
    ...data,
    min: makePixelUnit(-100000),
    max: makePixelUnit(100000),
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
export function prepareItems(context: GroupMachineContextValue): Item[] {
  const staticWidth = getStaticWidth(context);
  const newItems = [];

  for (const item of context.items) {
    if (!item || !isPanelData(item)) {
      newItems.push({ ...item });
      continue;
    }

    if (item.lastKnownSize) {
      const lastSize = makePixelUnit(
        context.orientation === "horizontal"
          ? item.lastKnownSize.width
          : item.lastKnownSize.height,
      );
      newItems.push({ ...item, currentValue: lastSize });
      continue;
    }

    if (item.currentValue.type === "pixel") {
      newItems.push({ ...item });
      continue;
    }

    const pixel = new Big(getGroupSize(context))
      .minus(staticWidth)
      .mul(item.currentValue.value);

    newItems.push({
      ...item,
      currentValue: makePixelUnit(pixel.toNumber()),
    });
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
        panelId?: string;
        isVirtual?: boolean;
      })
    | {
        type: "collapsePanel";
        value: MoveMoveEvent;
        handleId: string;
        controlled?: boolean;
        panelId: string;
        disregardCollapseBuffer?: boolean;
        isVirtual?: boolean;
      },
): Partial<GroupMachineContextValue> {
  const handleIndex = getPanelHandleIndex(context, dragEvent.handleId);
  const handle = context.items[handleIndex] as PanelHandleData;
  // Check if items need to be prepared (have non-pixel values)
  const needsPrepare = context.items.some(
    (item) => isPanelData(item) && item.currentValue.type !== "pixel",
  );
  const newItems = needsPrepare ? prepareItems(context) : [...context.items];

  let moveAmount =
    context.orientation === "horizontal"
      ? dragEvent.value.deltaX
      : dragEvent.value.deltaY;

  if (dragEvent.value.shiftKey) {
    moveAmount *= context.shiftAmount ?? 15;
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
    "subtract",
    dragEvent.disregardCollapseBuffer,
  );

  // No panel with space, just record the drag overshoot
  if (!panelBefore) {
    return {
      dragOvershoot: context.dragOvershoot.add(moveAmount),
    };
  }

  invariant(isPanelData(panelBefore), `Expected panel before: ${handle.id}`);

  /** The panel that gets bigger */
  const panelAfter =
    dragEvent.type === "collapsePanel"
      ? // If we have the panel id just use that
        newItems.find(
          (item) =>
            item.id === dragEvent.panelId &&
            panelBefore.id !== dragEvent.panelId,
        ) ||
        // otherwise fallback to the next panel with space
        findPanelWithSpace(
          context,
          newItems,
          handleIndex - moveDirection,
          moveDirection * -1,
          "add",
          dragEvent.disregardCollapseBuffer,
        ) ||
        newItems[handleIndex - moveDirection]
      : newItems[handleIndex - moveDirection];

  invariant(
    panelAfter && isPanelData(panelAfter),
    `Expected panel after: ${handle.id}`,
  );

  if (
    panelAfter.currentValue.value.eq(getUnitPixelValue(context, panelAfter.max))
  ) {
    return {
      dragOvershoot: context.dragOvershoot.add(moveAmount),
    };
  }

  const newDragOvershoot = context.dragOvershoot.add(moveAmount);

  // Don't let the panel expand until the threshold is reached
  if (!dragEvent.disregardCollapseBuffer && !dragEvent.controlled) {
    const isInLeftBuffer = newDragOvershoot.lt(0) && moveDirection > 0;
    const isInLeftOvershoot = newDragOvershoot.gt(0) && moveDirection > 0;
    const isInRightBuffer = newDragOvershoot.gt(0) && moveDirection < 0;
    const isInRightOvershoot = newDragOvershoot.lt(0) && moveDirection < 0;
    const potentialNewValue = panelAfter.currentValue.value.add(
      new Big(newDragOvershoot).mul(isInRightBuffer ? moveDirection : 1),
    );
    const min = getUnitPixelValue(context, panelAfter.min);

    const isInDragBugger =
      newDragOvershoot.abs().lt(COLLAPSE_THRESHOLD) &&
      // Let the panel expand at it's min size
      !panelAfter.currentValue.value
        .add(newDragOvershoot.abs())
        .gte(panelAfter.min.value) &&
      panelAfter.collapsible &&
      panelAfter.collapsed &&
      (isInLeftOvershoot || isInRightOvershoot);

    if (
      potentialNewValue.lte(min) &&
      (newDragOvershoot.eq(0) ||
        isInRightBuffer ||
        isInLeftBuffer ||
        isInDragBugger)
    ) {
      return { dragOvershoot: newDragOvershoot };
    }
  }

  // Don't let the panel collapse until the threshold is reached
  if (
    !dragEvent.disregardCollapseBuffer &&
    !dragEvent.controlled &&
    panelBefore.collapsible &&
    panelBefore.currentValue.value.eq(
      getUnitPixelValue(context, panelBefore.min),
    )
  ) {
    const potentialNewValue = panelBefore.currentValue.value.sub(
      newDragOvershoot.abs(),
    );

    if (
      newDragOvershoot.abs().lt(COLLAPSE_THRESHOLD) &&
      potentialNewValue.gt(
        getUnitPixelValue(context, panelBefore.collapsedSize),
      )
    ) {
      return { dragOvershoot: newDragOvershoot };
    }
  }

  // Apply the move amount to the panel before the slider
  const unrestrainedPanelBefore = createUnrestrainedPanel(context, panelBefore);
  const panelBeforePreviousValue = panelBefore.currentValue.value;
  const panelBeforeNewValueRaw = panelBefore.currentValue.value.minus(
    new Big(moveAmount).mul(moveDirection),
  );
  let panelBeforeNewValue = dragEvent.disregardCollapseBuffer
    ? clampUnit(context, unrestrainedPanelBefore, panelBeforeNewValueRaw)
    : clampUnit(context, panelBefore, panelBeforeNewValueRaw);

  // Also apply the move amount the panel after the slider
  const unrestrainedPanelAfter = createUnrestrainedPanel(context, panelAfter);
  const panelAfterPreviousValue = panelAfter.currentValue.value;
  const applied = panelBeforePreviousValue.minus(panelBeforeNewValue);
  const panelAfterNewValueRaw = panelAfter.currentValue.value.add(applied);
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
      !dragEvent.controlled &&
      !dragEvent.isVirtual
    ) {
      panelAfter.onCollapseChange.current(false);
      return { dragOvershoot: newDragOvershoot };
    }

    // Calculate the amount "extra" after the minSize the panel should grow
    const extra =
      // Take the size it was at
      getUnitPixelValue(context, panelAfter.collapsedSize)
        // Add in the full overshoot so the cursor is near the slider
        .add(context.dragOvershoot.abs())
        // Subtract the min size of the panel
        .sub(
          panelAfterNewValue
            // Then re-add the move amount
            .add(Math.abs(moveAmount)),
        );

    if (extra.gt(0)) {
      panelAfterNewValue = panelAfterNewValue.add(extra);
    }

    panelBeforeNewValue = panelBeforeNewValue
      // Subtract the delta of the after panel's size
      .minus(
        panelAfterNewValue
          .minus(panelAfterPreviousValue)
          // And then re-apply the movement value
          .minus(Math.abs(moveAmount)),
      );

    if (
      panelBeforeNewValue.lt(panelBefore.min.value) &&
      !panelBefore.collapsible
    ) {
      // TODO this should probably distribute the space between the panels?
      return { dragOvershoot: newDragOvershoot };
    }

    panelAfter.collapsed = false;

    if (
      panelAfter.onCollapseChange?.current &&
      !panelAfter.collapseIsControlled &&
      !dragEvent.controlled &&
      !dragEvent.isVirtual
    ) {
      panelAfter.onCollapseChange.current(false);
    }
  }

  const panelBeforeIsAboutToCollapse = panelBefore.currentValue.value.eq(
    getUnitPixelValue(context, panelBefore.min),
  );

  // If the panel was expanded and now is at it's min size, collapse it
  if (
    !dragEvent.disregardCollapseBuffer &&
    panelBefore.collapsible &&
    panelBeforeIsAboutToCollapse
  ) {
    if (
      panelBefore.onCollapseChange?.current &&
      panelBefore.collapseIsControlled &&
      !dragEvent.controlled &&
      !dragEvent.isVirtual
    ) {
      panelBefore.onCollapseChange.current(true);
      return { dragOvershoot: newDragOvershoot };
    }

    // Make it collapsed
    panelBefore.collapsed = true;
    panelBeforeNewValue = getUnitPixelValue(context, panelBefore.collapsedSize);
    // Add the extra space created to the before panel
    panelAfterNewValue = panelAfter.currentValue.value.add(
      panelBeforePreviousValue.minus(panelBeforeNewValue),
    );

    if (
      panelBefore.onCollapseChange?.current &&
      !panelBefore.collapseIsControlled &&
      !dragEvent.controlled &&
      !dragEvent.isVirtual
    ) {
      panelBefore.onCollapseChange.current(true);
    }
  }

  panelBefore.currentValue = { type: "pixel", value: panelBeforeNewValue };
  panelAfter.currentValue = { type: "pixel", value: panelAfterNewValue };

  const leftoverSpace = new Big(getGroupSize(context)).minus(
    newItems.reduce(
      (acc, b) => acc.add(isPanelData(b) ? b.currentValue.value : b.size.value),
      new Big(0),
    ),
  );

  if (!leftoverSpace.eq(0)) {
    panelBefore.currentValue.value = clampUnit(
      context,
      panelBefore,
      panelBefore.currentValue.value.add(leftoverSpace),
    );
  }

  return { items: newItems };
}

/** Converts the items to percentages */
function commitLayout(context: GroupMachineContextValue) {
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
    if (item.type !== "panel" || item.collapsed || item.isStaticAtRest) {
      return;
    }

    newItems[index] = {
      ...item,
      currentValue: {
        type: "percent",
        value: item.currentValue.value.div(
          new Big(getGroupSize(context)).sub(staticWidth),
        ),
      },
    };
  });

  return newItems;
}

export function dragHandlePayload({
  delta,
  orientation = "horizontal",
  shiftKey = false,
}: {
  delta: number;
  orientation?: Orientation;
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
  isVirtual,
  panelId,
}: {
  context: GroupMachineContextValue;
  handleId: string;
  delta: Big.Big;
  direction: -1 | 1;
  controlled?: boolean;
  disregardCollapseBuffer?: boolean;
  /**
   * Whether this is just a calculation and not intended to be commmited to layout
   * no on* callbacks will be called
   */
  isVirtual?: boolean;
  panelId: string;
}) {
  let newContext: Partial<GroupMachineContextValue> = context;

  for (let i = 0; i < delta.abs().toNumber(); i++) {
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
        isVirtual,
        panelId,
        value: dragHandlePayload({
          delta: direction,
          orientation: context.orientation,
        }),
      },
    );
  }

  return newContext;
}

function applyDeltaInBothDirections(
  context: GroupMachineContextValue,
  newItems: Array<Item>,
  itemIndex: number,
  delta: Big.Big,
) {
  let hasTriedBothDirections = false;
  let direction = 1;
  let deltaLeft = new Big(delta);

  // Starting from where the items was removed add space to the panels around it.
  // This is only needed for conditional rendering.
  while (deltaLeft.toNumber() !== 0) {
    const targetPanel = findPanelWithSpace(
      context,
      newItems,
      itemIndex + direction,
      direction,
      delta.gt(0) ? "add" : "subtract",
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
    const newValue = clampUnit(context, targetPanel, oldValue.add(deltaLeft));

    targetPanel.currentValue.value = newValue;
    deltaLeft = deltaLeft.sub(newValue.sub(oldValue));
    direction = direction === 1 ? -1 : 1;
  }
}

/**
 * A layout might overflow at small screen sizes.
 * This function tries to fix that by:
 *
 * 1. It will try to collapse a panel if it can.
 */
function handleOverflow(context: GroupMachineContextValue) {
  // If we haven't measured yet we can't do anything
  if (
    context.items.some((i) => isPanelData(i) && i.currentValue.value.eq(-1))
  ) {
    return context;
  }

  const groupSize = new Big(getGroupSize(context));
  const nonStaticWidth = groupSize.sub(getStaticWidth(context).toNumber());
  const pixelItems = context.items.map((i) => {
    if (isPanelHandle(i)) return i.size.value;
    if (i.collapsed) return getUnitPixelValue(context, i.currentValue);

    const pixel =
      (i.currentValue.type === "pixel" && i.currentValue.value) ||
      i.currentValue.value.mul(nonStaticWidth);

    return clampUnit(context, i, pixel);
  });
  const totalSize = pixelItems.reduce((acc, i) => acc.add(i), new Big(0));
  const overflow = totalSize.abs().sub(groupSize);

  if (overflow.abs().lt(1) || groupSize.eq(0)) {
    return context;
  }

  let newContext = { ...context, items: prepareItems(context) };

  const collapsiblePanel = newContext.items.find((i): i is PanelData =>
    Boolean(isPanelData(i) && i.collapsible),
  );

  if (collapsiblePanel) {
    const collapsiblePanelIndex = newContext.items.findIndex(
      (i) => i.id === collapsiblePanel.id,
    );
    const handleId = getHandleForPanelId(newContext, collapsiblePanel.id);
    const sizeChange = collapsiblePanel.currentValue.value.sub(
      getUnitPixelValue(newContext, collapsiblePanel.collapsedSize),
    );

    // Try to collapse the panel
    newContext = {
      ...newContext,
      ...iterativelyUpdateLayout({
        handleId: handleId.item.id,
        delta: sizeChange,
        direction: (handleId.direction * -1) as -1 | 1,
        panelId: collapsiblePanel.id,
        context: {
          ...newContext,
          // act like its the old size so the space is distributed correctly
          size: { width: totalSize.toNumber(), height: totalSize.toNumber() },
        },
      }),
    };

    // Then remove all the overflow
    applyDeltaInBothDirections(
      newContext,
      newContext.items,
      collapsiblePanelIndex,
      overflow.neg(),
    );
  }

  return { ...newContext, items: commitLayout(newContext) };
}

function clearLastKnownSize(items: Item[]) {
  return items.map((i) => ({ ...i, lastKnownSize: undefined }));
}

function setCookie(name: string, jsonData: unknown) {
  document.cookie = `${name}=${encodeURIComponent(`${jsonData}`)};path=/;max-age=31536000`;
}

// #endregion

// #region Machine

interface AnimationActorOutput {
  panelId: string;
  action: "expand" | "collapse";
  resolve?: () => void;
}

function getDeltaForEvent(
  context: GroupMachineContextValue,
  event: CollapsePanelEvent | ExpandPanelEvent,
) {
  const panel = getPanelWithId(context, event.panelId);

  if (event.type === "expandPanel") {
    return new Big(
      panel.sizeBeforeCollapse ?? getUnitPixelValue(context, panel.min),
    ).minus(panel.currentValue.value);
  }

  const collapsedSize = getUnitPixelValue(context, panel.collapsedSize);
  return panel.currentValue.value.minus(collapsedSize);
}

function animationActor(
  context: GroupMachineContextValue,
  event: CollapsePanelEvent | ExpandPanelEvent,
  send: (e: GroupMachineEvent) => void,
  abortController: AbortController,
) {
  const panel = getPanelWithId(context, event.panelId);
  const handle = getHandleForPanelIdWithAvailableSpace(context, event.panelId);
  let direction = new Big(handle.direction);
  const fullDelta = getDeltaForEvent(context, event);

  const contextCopy = { ...context, items: prepareItems(context) };
  const finalLayout = iterativelyUpdateLayout({
    context: contextCopy,
    panelId: event.panelId,
    handleId: handle.item.id,
    delta: fullDelta,
    direction: handle.direction,
    isVirtual: true,
  });

  return new Promise<AnimationActorOutput | undefined>((resolve, reject) => {
    abortController.signal.addEventListener("abort", () => {
      reject(new Error("Operation was canceled"));
    });

    if (event.type === "collapsePanel") {
      panel.sizeBeforeCollapse = panel.currentValue.value.toNumber();
      direction = direction.mul(new Big(-1));
    }

    const fps = 60;
    const { duration, ease } = getCollapseAnimation(panel);
    const totalFrames = Math.ceil(
      panel.collapseAnimation ? duration / (1000 / fps) : 1,
    );
    let frame = 0;
    let appliedDelta = new Big(0);

    function renderFrame() {
      const progress = ++frame / totalFrames;
      const e = new Big(panel.collapseAnimation ? ease(progress) : 1);
      const delta = e.mul(fullDelta).sub(appliedDelta).mul(direction);

      send({
        type: "applyDelta",
        handleId: handle.item.id,
        delta: delta.toNumber(),
        panelId: panel.id,
      });

      appliedDelta = appliedDelta.add(
        delta
          .abs()
          .mul(
            (delta.gt(0) && direction.lt(0)) || (delta.lt(0) && direction.gt(0))
              ? -1
              : 1,
          ),
      );

      if (e.eq(1)) {
        // If we're controlled expanding to a value that breaks the layout we might get negative values
        // In this case we need to use a valid layout like `iterativelyUpdateLayout`'s return value
        // Ideally we figure out some way to not do this but disregardCollapseBuffer is needed for animations
        if (
          context.items.find(
            (i) =>
              isPanelData(i) &&
              i.currentValue.value.round(undefined, Big.roundHalfEven).lt(0),
          )
        ) {
          assign(context, finalLayout);
        }

        const action = event.type === "expandPanel" ? "expand" : "collapse";
        resolve({ panelId: panel.id, action, resolve: event.resolve });
        return false;
      }

      return true;
    }

    raf(renderFrame);
  });
}

function assign<T>(target: T, source: Partial<T>) {
  for (const key in source) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (target as any)[key] = source[key];
  }
}

export interface GroupMachineInput {
  orientation?: Orientation;
  groupId: string;
  items?: Item[];
  autosaveStrategy?: "localStorage" | "cookie";
  shiftAmount?: number;
}

export type State = "idle" | "dragging" | "togglingCollapse";

let groupId = 0;

export function groupMachine(
  input: Partial<GroupMachineContextValue>,
  onUpdate?: (context: GroupMachineContextValue) => void,
  /**
   * A lazy getter for the group's DOM element. When provided and it returns
   * an element, `applyDelta` frames during collapse/expand animations write
   * the grid template directly to the DOM and skip `onUpdate` — avoiding a
   * full reactive re-render per animation frame. Other events still call
   * `onUpdate` as usual.
   */
  getGroupElement?: () => HTMLElement | null,
) {
  const abortController = new AbortController();
  const state = {
    current: "idle" as State,
  };
  let locked = false;

  const context: GroupMachineContextValue = {
    size: input.size || { width: 0, height: 0 },
    items: input.items || [],
    orientation: input.orientation || "horizontal",
    dragOvershoot: new Big(0),
    groupId: input.groupId || `group-${groupId++}`,
    autosaveStrategy: input.autosaveStrategy,
    shiftAmount: input.shiftAmount ?? 15,
  };

  const actions = {
    prepare: () => {
      context.items = prepareItems(context);
    },
    clearLastKnownSize: () => {
      context.items = clearLastKnownSize(context.items);
    },
    commit: () => {
      context.dragOvershoot = new Big(0);
      context.items = commitLayout(context);
    },
    onResize: () => {
      for (const item of context.items) {
        if (isPanelData(item)) {
          const pixel = item.lastKnownSize
            ? new Big(
                context.orientation === "horizontal"
                  ? item.lastKnownSize.width
                  : item.lastKnownSize.height,
              )
            : clampUnit(
                context,
                item,
                getUnitPixelValue(context, item.currentValue),
              );
          const groupSize = getGroupSize(context);

          item.onResize?.current?.({
            pixel: pixel.toNumber(),
            percentage:
              groupSize > 0 ? pixel.div(getGroupSize(context)).toNumber() : -1,
          });
        }
      }
    },
    onAutosave: () => {
      if (!context.autosaveStrategy || typeof window === "undefined") {
        return;
      }

      const snapshot = { ...context };
      snapshot.items = clearLastKnownSize(context.items);
      snapshot.activeDragHandleId = context.activeDragHandleId;
      const data = JSON.stringify(snapshot);

      if (context.autosaveStrategy === "localStorage") {
        localStorage.setItem(context.groupId, data);
      } else {
        setCookie(context.groupId, data);
      }
    },
    removeItem: (id: string) => {
      const itemIndex = context.items.findIndex((item) => item.id === id);
      const item = context.items[itemIndex];

      if (!item) {
        return;
      }

      const newItems = context.items.filter((i) => i.id !== id);
      const removedSize = isPanelData(item)
        ? item.currentValue.value
        : item.size.value;

      applyDeltaInBothDirections(context, newItems, itemIndex, removedSize);

      context.items = newItems;
    },
    notifyCollapseToggle: (event: GroupMachineEvent) => {
      isEvent(event, ["collapsePanel", "expandPanel"]);
      const panel = getPanelWithId(context, event.panelId);
      panel.onCollapseChange?.current?.(!panel.collapsed);
    },
    runCollapseToggle: (event: GroupMachineEvent) => {
      isEvent(event, ["collapsePanel", "expandPanel"]);

      const handle = getHandleForPanelId(context, event.panelId);
      // When collapsing a panel it will be in the opposite direction
      // that handle assumes
      const delta =
        event.type === "collapsePanel"
          ? handle.direction * -1
          : handle.direction;

      const newContext = updateLayout(context, {
        panelId: event.panelId,
        handleId: handle.item.id,
        type: "dragHandle",
        controlled: event.controlled,
        value: dragHandlePayload({
          delta: delta,
          orientation: context.orientation,
        }),
      });

      assign(context, newContext);
    },
    onAnimationEnd: (output: AnimationActorOutput | undefined) => {
      invariant(output, "Expected output from animation actor");

      const panel = getPanelWithId(context, output.panelId);
      panel.collapsed = output.action === "collapse";

      if (panel.collapsed) {
        panel.currentValue = panel.collapsedSize;
      }

      if (!panel.collapseIsControlled) {
        panel.onCollapseChange?.current?.(panel.collapsed);
      }

      actions.commit();
    },
  };

  actions.onAutosave();

  const guards = {
    shouldNotifyCollapseToggle: (event: GroupMachineEvent) => {
      isEvent(event, ["collapsePanel", "expandPanel"]);
      const panel = getPanelWithId(context, event.panelId);
      return !event.controlled && panel.collapseIsControlled === true;
    },
    shouldCollapseToggle: (event: GroupMachineEvent) => {
      isEvent(event, ["collapsePanel", "expandPanel"]);
      const panel = getPanelWithId(context, event.panelId);
      return panel.collapseIsControlled === true;
    },
    cannotExpandPanel: (event: GroupMachineEvent) => {
      isEvent(event, ["expandPanel"]);
      const pixelItems = prepareItems(context);
      let interimContext = { ...context, items: pixelItems };

      const delta = getDeltaForEvent(context, event);
      const handle = getHandleForPanelIdWithAvailableSpace(
        interimContext,
        event.panelId,
      );

      interimContext = {
        ...interimContext,
        ...iterativelyUpdateLayout({
          context: interimContext,
          panelId: event.panelId,
          handleId: handle.item.id,
          controlled: event.controlled,
          delta: delta,
          direction: handle.direction,
          isVirtual: true,
        }),
      };
      const updatedPanel = interimContext.items.find(
        (i) => i.id === event.panelId,
      );
      const totalSize = interimContext.items.reduce(
        (acc, i) =>
          acc.add(isPanelData(i) ? i.currentValue.value : i.size.value),
        new Big(0),
      );
      const didExpand =
        updatedPanel &&
        isPanelData(updatedPanel) &&
        !updatedPanel.currentValue.value.eq(updatedPanel.collapsedSize.value);

      return totalSize.gt(getGroupSize(context)) || !didExpand;
    },
  };

  function transition(to: State): boolean {
    // exit
    switch (state.current) {
      case "dragging":
        actions.commit();
        context.activeDragHandleId = undefined;
        break;
    }

    // enter
    let skipOnUpdate = false;
    switch (to) {
      case "idle":
        actions.onAutosave();
        break;
      case "dragging":
        actions.prepare();
        break;
      case "togglingCollapse":
        actions.prepare();
        actions.clearLastKnownSize();
        // Write post-prepare template to DOM instead of routing through React.
        // `prepare()` converts % to px (same rendered width) — committing
        // through React fires a Layout pass before the raf loop starts,
        // producing a visible hitch on frame 0. Callers propagate the
        // returned flag into send()'s skipOnUpdate so the trailing onUpdate
        // there is suppressed too.
        if (getGroupElement) {
          const el = getGroupElement();
          if (el) {
            const template = buildTemplate(context);
            if (context.orientation === "horizontal") {
              el.style.gridTemplateColumns = template;
            } else {
              el.style.gridTemplateRows = template;
            }
            skipOnUpdate = true;
          }
        }
        break;
    }

    state.current = to;

    if (!skipOnUpdate) {
      onUpdate?.(context);
    }

    return skipOnUpdate;
  }

  function send(event: GroupMachineEvent) {
    let skipOnUpdate = false;

    switch (event.type) {
      case "lockGroup":
        locked = true;
        break;
      case "unlockGroup":
        locked = false;
        break;
    }

    if (locked) {
      return;
    }

    switch (event.type) {
      case "updateItemIndex":
        context.items = sortWithOrder(
          context.items.map((item) =>
            item.id === event.itemId ? { ...item, order: event.index } : item,
          ),
        );
        break;
      case "registerPanel":
        context.items = addDeDuplicatedItems(context.items, {
          type: "panel",
          currentValue: makePixelUnit(-1),
          ...event.data,
        });
        break;
      case "unregisterPanel":
        actions.prepare();
        actions.removeItem(event.id);
        actions.clearLastKnownSize();
        actions.commit();
        actions.onResize();
        actions.onAutosave();
        break;
      case "registerPanelHandle": {
        context.items = addDeDuplicatedItems(context.items, event.data);
        break;
      }
      case "unregisterPanelHandle":
        actions.prepare();
        actions.removeItem(event.id);
        actions.clearLastKnownSize();
        actions.commit();
        actions.onResize();
        actions.onAutosave();
        break;
      case "registerDynamicPanel": {
        actions.prepare();

        let currentValue: ParsedUnit = makePixelUnit(0);

        if (
          event.data.collapsible &&
          event.data.collapsed &&
          event.data.collapsedSize
        ) {
          currentValue = {
            type: "pixel",
            value: getUnitPixelValue(context, event.data.collapsedSize),
          };
        } else if (event.data.default) {
          currentValue = {
            type: "pixel",
            value: getUnitPixelValue(context, event.data.default),
          };
        } else {
          currentValue = {
            type: "pixel",
            value: getUnitPixelValue(context, event.data.min),
          };
        }

        const newItems = addDeDuplicatedItems(context.items, {
          type: "panel",
          ...event.data,
          currentValue,
        });
        const itemIndex = newItems.findIndex(
          (item) => item.id === event.data.id,
        );
        const newContext = { ...context, items: newItems };
        const overflowDueToHandles = context.items
          .reduce((acc, i) => {
            if (isPanelHandle(i)) {
              return acc.add(getUnitPixelValue(context, i.size));
            }

            return acc.add(i.currentValue.value);
          }, new Big(0))
          .minus(getGroupSize(context));

        applyDeltaInBothDirections(
          newContext,
          newItems,
          itemIndex,
          currentValue.value.add(overflowDueToHandles).neg(),
        );

        context.items = newItems;

        actions.clearLastKnownSize();
        actions.commit();
        actions.onResize();
        actions.onAutosave();
        break;
      }
      case "rebindPanelCallbacks":
        for (const item of context.items) {
          if (isPanelData(item) && item.id === event.data.id) {
            item.onCollapseChange = event.data.onCollapseChange;
            item.onResize = event.data.onResize;
          }
        }
        break;
      case "updateConstraints":
        actions.prepare();

        for (const item of context.items) {
          if (isPanelData(item) && item.id === event.data.id) {
            const panel = event.data as PanelData;
            item.min = panel.min;
            item.max = panel.max;
            item.default = panel.default;
            item.collapsedSize = panel.collapsedSize;
            item.isStaticAtRest = panel.isStaticAtRest;
            item.collapseAnimation = panel.collapseAnimation;
            item.collapsible = panel.collapsible;
          } else if (isPanelHandle(item) && item.id === event.data.id) {
            const handle = event.data as PanelHandleData;
            item.size = handle.size;
          }
        }

        actions.clearLastKnownSize();
        actions.commit();
        actions.onResize();
        actions.onAutosave();
        break;
      case "setActualItemsSize": {
        // During direct-DOM animations the machine writes grid-template to the
        // DOM each frame, which causes panel sizes to change, which fires the
        // ResizeObserver in measureGroupChildren, which sends this event.
        // Ignore it so we don't trigger an onUpdate and re-render mid-animation.
        if (state.current === "togglingCollapse" && getGroupElement) {
          skipOnUpdate = true;
          break;
        }

        const withLastKnownSize = context.items.map((i) => {
          if (!isPanelData(i)) return i;
          const lastKnownSize = event.childrenSizes[i.id] || i.lastKnownSize;
          return { ...i, lastKnownSize };
        });

        let totalSize = 0;
        let useLastKnownSize = false;

        for (const item of withLastKnownSize) {
          if (isPanelData(item)) {
            const size =
              item.lastKnownSize?.[
                context.orientation === "horizontal" ? "width" : "height"
              ];

            // If any size is 0 don't handle overflow
            if (!size) {
              context.items = withLastKnownSize;
              useLastKnownSize = true;
              break;
            }

            totalSize += size;
          } else {
            totalSize += item.size.value.toNumber();
          }
        }

        if (useLastKnownSize) {
          context.items = withLastKnownSize;
        } else if (
          totalSize - getGroupSize(context) >= 1 &&
          state.current === "idle"
        ) {
          // Real overflow (>= 1px): collapse/redistribute panels to fit.
          context.items = handleOverflow({
            ...context,
            items: prepareItems({ ...context, items: withLastKnownSize }),
          }).items;
        } else {
          // Either no overflow, or a sub-pixel overflow (< 1px) which is a
          // rounding artefact commonly produced at non-100% browser zoom.
          // Keep the percent-mode items so buildTemplate keeps generating
          // responsive minmax/calc strings instead of locking to fixed
          // pixels. prepareItems still reproduces the exact measured sizes
          // from lastKnownSize when a pixel layout is needed.
          context.items = withLastKnownSize;
        }

        actions.onResize();
        break;
      }
      case "setSize": {
        context.size = event.size;
        actions.onResize();
        break;
      }
      case "setOrientation":
        context.orientation = event.orientation;
        actions.clearLastKnownSize();
        actions.onResize();
        break;
      default:
        break;
    }

    if (state.current === "idle") {
      switch (event.type) {
        case "dragHandleStart":
          transition("dragging");
          context.activeDragHandleId = event.handleId;
          break;
        case "setPanelPixelSize": {
          actions.prepare();
          actions.clearLastKnownSize();

          const panel = getPanelWithId(context, event.panelId);
          const handle = getHandleForPanelId(context, event.panelId);
          const current = panel.currentValue.value;
          const newSize = clampUnit(
            context,
            panel,
            getUnitPixelValue(context, parseUnit(event.size)),
          );
          const isBigger = newSize.gt(current);
          const delta = isBigger
            ? newSize.minus(current)
            : current.minus(newSize);
          panel.sizeBeforeCollapse = newSize.toNumber();

          Object.assign(
            context,
            iterativelyUpdateLayout({
              context,
              panelId: event.panelId,
              direction: (handle.direction * (isBigger ? 1 : -1)) as -1 | 1,
              handleId: handle.item.id,
              delta,
            }),
          );

          actions.commit();
          actions.onResize();
          actions.onAutosave();
          break;
        }
        case "collapsePanel":
          if (guards.shouldNotifyCollapseToggle(event)) {
            actions.notifyCollapseToggle(event);
          } else {
            const panel = getPanelWithId(context, event.panelId);

            if (!panel.collapsed) {
              if (transition("togglingCollapse")) skipOnUpdate = true;
              abortController.abort();
              animationActor(context, event, send, abortController).then(
                (output) => {
                  actions.onAnimationEnd(output);
                  transition("idle");
                  if (event.resolve) {
                    requestAnimationFrame(event.resolve);
                  }
                },
              );
            }
          }
          break;
        case "expandPanel":
          if (guards.cannotExpandPanel(event)) {
            break;
          } else if (guards.shouldNotifyCollapseToggle(event)) {
            actions.notifyCollapseToggle(event);
          } else {
            const panel = getPanelWithId(context, event.panelId);

            if (panel.collapsed) {
              if (transition("togglingCollapse")) skipOnUpdate = true;
              abortController.abort();
              animationActor(context, event, send, abortController).then(
                (output) => {
                  actions.onAnimationEnd(output);
                  transition("idle");
                  if (event.resolve) {
                    requestAnimationFrame(event.resolve);
                  }
                },
              );
            }
          }

          break;
        default:
          break;
      }
    } else if (state.current === "dragging") {
      switch (event.type) {
        case "dragHandle":
          actions.clearLastKnownSize();
          assign(context, updateLayout(context, event));
          actions.onResize();
          break;
        case "dragHandleEnd":
          transition("idle");
          break;
        case "expandPanel":
        case "collapsePanel":
          if (guards.shouldCollapseToggle(event)) {
            actions.runCollapseToggle(event);
          }
          break;
      }
    } else if (state.current === "togglingCollapse") {
      switch (event.type) {
        case "applyDelta":
          assign(
            context,
            updateLayout(context, {
              panelId: event.panelId,
              handleId: event.handleId,
              type: "collapsePanel",
              disregardCollapseBuffer: true,
              value: dragHandlePayload({
                delta: event.delta,
                orientation: context.orientation,
              }),
            }),
          );
          actions.onResize();

          if (getGroupElement) {
            const el = getGroupElement();

            if (el) {
              const template = buildTemplate(context);

              if (context.orientation === "horizontal") {
                el.style.gridTemplateColumns = template;
              } else {
                el.style.gridTemplateRows = template;
              }
              skipOnUpdate = true;
            }
          }
          break;
      }
    }

    if (!skipOnUpdate) {
      onUpdate?.(context);
    }
  }

  return [context, send, state] as const;
}

export type SendFn = ReturnType<typeof groupMachine>[1];

// #endregion
