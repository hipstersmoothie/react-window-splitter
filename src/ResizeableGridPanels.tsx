"use client";

import React from "react";
import { mergeProps, MoveMoveEvent, useId, useMove } from "react-aria";
import { createMachine, assign, enqueueActions } from "xstate";
import { createActorContext } from "@xstate/react";
import invariant from "invariant";

const COLLAPSE_THRESHOLD = 50;

type PixelUnit = `${number}px`;
type PercentUnit = `${number}%`;
type Unit = PixelUnit | PercentUnit;
type Orientation = "horizontal" | "vertical";

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function parseUnit(unit: Unit): { type: "pixel" | "percent"; value: number } {
  if (unit.endsWith("px")) {
    return { type: "pixel", value: parseFloat(unit) };
  }

  if (unit.endsWith("%")) {
    return { type: "percent", value: parseFloat(unit) };
  }

  const [, percent] = unit.match(/clamp\(.*, (.*), .*\)/) || [];

  if (percent) {
    return { type: "percent", value: parseFloat(percent) };
  }

  throw new Error(`Invalid unit: ${unit}`);
}

function getPanelBeforeHandleId(
  context: GroupMachineContext,
  handleId: string
) {
  const handleIndex = context.items.findIndex((item) => item.id === handleId);

  if (handleIndex === -1) {
    throw new Error(`Expected panel before: ${handleId}`);
  }

  const item = context.items[handleIndex - 1];

  if (item && isPanelData(item)) {
    return item;
  }

  throw new Error(`Expected panel before: ${handleId}`);
}

function getCollapsiblePanelForHandleId(
  context: GroupMachineContext,
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

function getPanelWithId(context: GroupMachineContext, panelId: string) {
  const panelIndex = context.items.findIndex((item) => item.id === panelId);

  if (panelIndex === -1 || panelIndex >= context.items.length) {
    throw new Error(`Expected panel with id: ${panelId}`);
  }

  const item = context.items[panelIndex];

  if (item && isPanelData(item)) {
    return item;
  }

  throw new Error(`Expected panel with id: ${panelId}`);
}

function getHandleForPanelId(context: GroupMachineContext, panelId: string) {
  const panelIndex = context.items.findIndex((item) => item.id === panelId);

  if (panelIndex === -1) {
    throw new Error(`Expected panel before: ${panelId}`);
  }

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

interface Rect {
  width: number;
  height: number;
}

interface Constraints {
  min?: Unit;
  max?: Unit;
  default?: Unit;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  collapsedSize?: Unit;
}

interface PanelData extends Constraints {
  type: "panel";
  id: string;
}

interface ActivePanelData extends PanelData {
  currentValue: number | string;
  min: Unit;
  max: Unit;
  collapsed: boolean | undefined;
  sizeBeforeCollapse: number | undefined;
}

function isPanelData(value: Item): value is ActivePanelData {
  return value.type === "panel";
}

interface PanelHandleData {
  type: "handle";
  id: string;
  size: PixelUnit;
}

type Item = ActivePanelData | PanelHandleData;

function isPanelHandle(value: Item): value is PanelHandleData {
  return value.type === "handle";
}

interface RegisterPanelEvent {
  type: "registerPanel";
  data: Omit<PanelData, "type">;
}

interface UnregisterPanelEvent {
  type: "unregisterPanel";
  id: string;
}

interface RegisterPanelHandleEvent {
  type: "registerPanelHandle";
  data: Omit<PanelHandleData, "type">;
}

interface UnregisterPanelHandleEvent {
  type: "unregisterPanelHandle";
  id: string;
}

interface DragHandleStartEvent {
  type: "dragHandleStart";
  id: string;
}

interface DragHandleEvent {
  type: "dragHandle";
  id: string;
  value: MoveMoveEvent;
}

interface DragHandleEndEvent {
  type: "dragHandleEnd";
  id: string;
}

interface SetSizeEvent {
  type: "setSize";
  size: Rect;
}

interface SetOrientationEvent {
  type: "setOrientation";
  orientation: Orientation;
}

interface CollapsePanelEvent {
  type: "collapsePanel";
  panelId: string;
}

interface ExpandPanelEvent {
  type: "expandPanel";
  panelId: string;
}

interface GroupMachineContext {
  /** The items in the group */
  items: Array<Item>;
  /** The available space in the group */
  size: number;
  /** The template for the grid */
  template: string;
  /** The orientation of the grid */
  orientation: Orientation;
  /** How much the drag has overshot the handle */
  dragOvershoot: number;
}

type GroupMachineEvent =
  | RegisterPanelEvent
  | UnregisterPanelEvent
  | RegisterPanelHandleEvent
  | UnregisterPanelHandleEvent
  | DragHandleEvent
  | SetSizeEvent
  | SetOrientationEvent
  | DragHandleStartEvent
  | DragHandleEndEvent
  | CollapsePanelEvent
  | ExpandPanelEvent;

type EventForType<T extends GroupMachineEvent["type"]> =
  T extends "registerPanel"
    ? RegisterPanelEvent
    : T extends "unregisterPanel"
      ? UnregisterPanelEvent
      : T extends "registerPanelHandle"
        ? RegisterPanelHandleEvent
        : T extends "unregisterPanelHandle"
          ? UnregisterPanelHandleEvent
          : T extends "dragHandle"
            ? DragHandleEvent
            : T extends "setSize"
              ? SetSizeEvent
              : T extends "setOrientation"
                ? SetOrientationEvent
                : T extends "dragHandleStart"
                  ? DragHandleStartEvent
                  : T extends "dragHandleEnd"
                    ? DragHandleEndEvent
                    : T extends "collapsePanel"
                      ? CollapsePanelEvent
                      : T extends "expandPanel"
                        ? ExpandPanelEvent
                        : never;

function isEvent<T extends GroupMachineEvent["type"]>(
  event: GroupMachineEvent,
  eventType: T[]
): asserts event is EventForType<T> {
  invariant(
    eventType.includes(event.type as T),
    `Invalid event type: ${eventType}. Expected: ${eventType.join(" | ")}`
  );
}

function getUnitPixelValue(context: GroupMachineContext, unit: Unit) {
  const parsed = parseUnit(unit);

  if (parsed.type === "pixel") {
    return parsed.value;
  }

  return (parsed.value / 100) * context.size;
}

function clampUnit(
  context: GroupMachineContext,
  item: ActivePanelData,
  value: number
) {
  return clamp(
    value,
    getUnitPixelValue(context, item.min),
    getUnitPixelValue(context, item.max)
  );
}

function getPanelHasSpace(context: GroupMachineContext, item: ActivePanelData) {
  if (typeof item.currentValue === "string") {
    throw new Error("getPanelHasSpace only works with number values");
  }

  if (item.collapsible && !item.collapsed) {
    return true;
  }

  const panelSize = item.currentValue;
  const min = getUnitPixelValue(context, item.min);

  return panelSize > min;
}

function findPanelWithSpace(
  context: GroupMachineContext,
  items: Array<Item>,
  start: number,
  direction: number
) {
  if (direction === -1) {
    for (let i = start; i >= 0; i--) {
      const panel = items[i];

      if (!panel) {
        return;
      }

      if (isPanelData(panel) && getPanelHasSpace(context, panel)) {
        return panel;
      }
    }
  } else {
    for (let i = start; i < items.length; i++) {
      const panel = items[i];

      if (!panel) {
        return;
      }

      if (isPanelData(panel) && getPanelHasSpace(context, panel)) {
        return panel;
      }
    }
  }
}

function getAvailableSpace(context: GroupMachineContext) {
  let availableSpace = context.size;

  // Subtract resize handle sizes
  availableSpace -= context.items
    .filter(isPanelHandle)
    .map((item) => parseUnit(item.size).value)
    .reduce((a, b) => a + b, 0);

  // Some panels might have a pixel value set so we should account for that
  availableSpace -= context.items
    .filter((d): d is ActivePanelData =>
      Boolean(
        isPanelData(d) && d.collapsed && typeof d.currentValue === "number"
      )
    )
    .map((item) => item.currentValue as number)
    .reduce((a, b) => a + b, 0);

  return availableSpace;
}

/** Converts the items to pixels */
function onDragStart(context: GroupMachineContext) {
  const newItems = [...context.items];

  // Force all raw pixels into numbers
  newItems
    .filter((d): d is ActivePanelData =>
      Boolean(
        isPanelData(d) &&
          typeof d.currentValue === "string" &&
          d.currentValue.match(/^\d+px$/)
      )
    )
    .map((item) => {
      item.currentValue = parseUnit(item.currentValue as Unit).value;
    });

  const itemsWithFractions = newItems
    .map((i, index) =>
      isPanelData(i) &&
      typeof i.currentValue === "string" &&
      (i.currentValue.includes("fr") || i.currentValue.includes("minmax"))
        ? index
        : -1
    )
    .filter((i) => i !== -1);

  // If there are any items with fractions, distribute them evenly
  if (itemsWithFractions.length > 0) {
    let fractionSpace = getAvailableSpace(context);
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
      i.currentValue.includes("clamp")
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
      const [, unit] = item.currentValue.match(/clamp\(.*, (.*), .*\)/) || [];

      if (!unit) {
        continue;
      }

      newItems[index] = {
        ...item,
        currentValue: context.size * (parseUnit(unit as Unit).value / 100),
      };
    }
  }

  return newItems;
}

/** On every mouse move we distribute the space added */
function updateLayout(
  context: GroupMachineContext,
  dragEvent:
    | DragHandleEvent
    | { type: "collapsePanel"; value: MoveMoveEvent; id: string }
): Partial<GroupMachineContext> {
  const handleIndex = context.items.findIndex(
    (item) => item.id === dragEvent.id
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

  if (!isPanelData(panelBefore)) {
    throw new Error(`Expected panel before: ${handle.id}`);
  }

  const panelAfter = newItems[handleIndex - moveDirection];

  if (!panelAfter || !isPanelData(panelAfter)) {
    throw new Error(`Expected panel after: ${handle.id}`);
  }

  const newDragOvershoot = context.dragOvershoot + moveAmount;

  // Don't let the panel expand until the threshold is reached
  if (panelAfter.collapsible && panelAfter.collapsed) {
    const potentialNewValue =
      (panelAfter.currentValue as number) + Math.abs(newDragOvershoot);
    const min = getUnitPixelValue(context, panelAfter.min);

    if (
      Math.abs(context.dragOvershoot) < COLLAPSE_THRESHOLD &&
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
    if (Math.abs(context.dragOvershoot) < COLLAPSE_THRESHOLD) {
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
    const collapsedSize = getUnitPixelValue(
      context,
      panelAfter.collapsedSize || "0px"
    );
    // Calculate the amount "extra" after the minSize the panel should grow
    const extra =
      // Take the size it was at
      collapsedSize +
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
  }

  // If the panel was expanded and now is at it's min size, collapse it
  if (
    panelBefore.collapsible &&
    panelBefore.currentValue === getUnitPixelValue(context, panelBefore.min)
  ) {
    const collapsedSize = getUnitPixelValue(
      context,
      panelBefore.collapsedSize || "0px"
    );

    // Make it collapsed
    panelBefore.collapsed = true;
    panelBeforeNewValue = collapsedSize;
    // Add the extra space created to the before panel
    panelAfterNewValue += panelBeforePreviousValue - collapsedSize;
  }

  panelBefore.currentValue = panelBeforeNewValue;
  panelAfter.currentValue = panelAfterNewValue;

  // There might be some extra space so just add it
  // const leftoverSpace =
  //   context.size -
  //   newItems.reduce(
  //     (acc, b) =>
  //       acc +
  //       (b.type === "panel"
  //         ? typeof b.currentValue === "number"
  //           ? b.currentValue
  //           : getUnitPixelValue(context, b.currentValue as Unit)
  //         : parseUnit(b.size).value),
  //     0
  //   );

  // // TODO: this is wrong?
  // console.log("!!!", { leftoverSpace });
  // panelAfter.currentValue += leftoverSpace;

  return { items: newItems, dragOvershoot: 0 };
}

/** Converts the items to percentages */
function onDragEnd(context: GroupMachineContext) {
  const newItems = [...context.items];

  newItems.forEach((item, index) => {
    if (item.type !== "panel" || typeof item.currentValue !== "number") {
      return;
    }

    if (item.collapsed) {
      newItems[index] = {
        ...item,
        currentValue: item.collapsedSize || "0px;",
      };
    } else {
      const fraction = item.currentValue / context.size;
      newItems[index] = {
        ...item,
        currentValue: `clamp(${item.min || "0px"}, ${fraction * 100}%, ${item.max || "100%"})`,
      };
    }
  });

  return newItems;
}

function iterativelyUpdateLayout({
  context,
  handleId,
  delta,
  direction,
}: {
  context: GroupMachineContext;
  handleId: string;
  delta: number;
  direction: -1 | 1;
}) {
  let newContext: Partial<GroupMachineContext> = context;

  for (let i = 0; i < Math.abs(delta); i++) {
    newContext = updateLayout(
      {
        ...context,
        ...newContext,
      },
      {
        id: handleId,
        type: "collapsePanel",
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

const groupMachine = createMachine(
  {
    initial: "idle",
    types: {
      context: {} as GroupMachineContext,
      events: {} as GroupMachineEvent,
    },
    context: {
      size: 0,
      items: [],
      template: "",
      orientation: "horizontal",
      dragOvershoot: 0,
    },
    states: {
      idle: {
        on: {
          dragHandleStart: {
            actions: ["onDragStart", "layout"],
            target: "dragging",
          },
        },
      },
      dragging: {
        on: {
          dragHandle: {
            actions: ["onDragHandle"],
          },
          dragHandleEnd: {
            actions: ["onDragEnd", "layout"],
            target: "idle",
          },
        },
      },
    },
    on: {
      registerPanel: {
        actions: ["assignPanelData", "layout"],
      },
      unregisterPanel: {
        actions: ["removeItem", "layout"],
      },
      registerPanelHandle: {
        actions: ["assignPanelHandleData", "layout"],
      },
      unregisterPanelHandle: {
        actions: ["removeItem", "layout"],
      },
      setSize: {
        actions: ["updateSize", "layout"],
      },
      setOrientation: {
        actions: ["updateOrientation", "layout"],
      },
      collapsePanel: {
        actions: ["onDragStart", "collapsePanel", "dragHandleEnd", "layout"],
      },
      expandPanel: {
        actions: ["onDragStart", "expandPanel", "dragHandleEnd", "layout"],
      },
    },
  },
  {
    actions: {
      layout: assign({
        template: ({ context }) => buildTemplate(context.items),
      }),
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

          let currentValue = "1fr";

          if (event.data.collapsible && event.data.defaultCollapsed) {
            currentValue = event.data.collapsedSize || "0px";
          } else if (event.data.default) {
            currentValue = event.data.default;
          } else if (event.data.min && event.data.max) {
            currentValue = `minmax(${event.data.min}, ${event.data.max})`;
          } else if (event.data.max) {
            currentValue = `minmax(0, ${event.data.max})`;
          } else if (event.data.min) {
            currentValue = `minmax(${event.data.min}, 1fr)`;
          }

          return [
            ...context.items,
            {
              type: "panel",
              ...event.data,
              collapsed: event.data.collapsible
                ? event.data.defaultCollapsed ?? false
                : undefined,
              min: event.data.min || "0px",
              max: event.data.max || "100%",
              sizeBeforeCollapse: undefined,
              currentValue,
            } as const,
          ];
        },
      }),
      assignPanelHandleData: assign({
        items: ({ context, event }) => {
          isEvent(event, ["registerPanelHandle"]);
          return [...context.items, { type: "handle" as const, ...event.data }];
        },
      }),
      removeItem: assign({
        items: ({ context, event }) => {
          isEvent(event, ["unregisterPanel", "unregisterPanelHandle"]);
          return context.items.filter((item) => item.id !== event.id);
        },
      }),
      onDragStart: assign({
        dragOvershoot: 0,
        items: ({ context, event }) => {
          isEvent(event, ["dragHandleStart", "collapsePanel", "expandPanel"]);
          return onDragStart(context);
        },
      }),
      onDragHandle: enqueueActions(({ context, event, enqueue }) => {
        isEvent(event, ["dragHandle"]);

        const contextUpdate = {
          ...context,
          ...updateLayout(context, event),
        };

        enqueue.assign({
          ...contextUpdate,
          template: buildTemplate(contextUpdate.items),
        });
      }),
      onDragEnd: assign({
        dragOvershoot: 0,
        items: ({ context, event }) => {
          isEvent(event, ["dragHandleEnd", "collapsePanel", "expandPanel"]);
          return onDragEnd(context);
        },
      }),
      collapsePanel: enqueueActions(({ context, event, enqueue }) => {
        isEvent(event, ["collapsePanel"]);

        const panel = getPanelWithId(context, event.panelId);
        const handle = getHandleForPanelId(context, event.panelId);
        const collapsedSize = getUnitPixelValue(
          context,
          panel.collapsedSize || "0px"
        );

        if (panel.currentValue !== collapsedSize) {
          panel.sizeBeforeCollapse = panel.currentValue as number;
        }

        enqueue.assign(
          iterativelyUpdateLayout({
            direction: (handle.direction * -1) as -1 | 1,
            context,
            handleId: handle.item.id,
            delta:
              (panel.currentValue as number) -
              collapsedSize +
              COLLAPSE_THRESHOLD,
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
            context,
            handleId: handle.item.id,
            delta:
              (panel.sizeBeforeCollapse ??
                getUnitPixelValue(context, panel.min)) -
              (panel.currentValue as number),
          })
        );
      }),
    },
  }
);

const GroupMachineContext = createActorContext(groupMachine);

function useDebugGroupMachineContext({ id }: { id: string }) {
  const context = GroupMachineContext.useSelector((state) => state.context);
  console.log("GROUP CONTEXT", id, context);
}

export interface PanelGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: Orientation;
}

export function PanelGroup(props: PanelGroupProps) {
  return (
    <GroupMachineContext.Provider>
      <PanelGroupImplementation {...props} />
    </GroupMachineContext.Provider>
  );
}

function PanelGroupImplementation(props: PanelGroupProps) {
  const { send } = GroupMachineContext.useActorRef();
  const groupId = `panel-group-${useId()}`;

  useDebugGroupMachineContext({ id: groupId });

  const orientation = GroupMachineContext.useSelector(
    (state) => state.context.orientation
  );

  if (props.orientation && props.orientation !== orientation) {
    send({ type: "setOrientation", orientation: props.orientation });
  }

  const template = GroupMachineContext.useSelector(
    (state) => state.context.template
  );
  const size = GroupMachineContext.useSelector((state) => state.context.size);

  const ref = React.useRef<HTMLDivElement>(null);

  React.useLayoutEffect(() => {
    if (!ref.current) {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];

      if (!entry) {
        return;
      }

      send({ type: "setSize", size: entry.contentRect });
    });

    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [send, ref]);

  return (
    <div
      ref={ref}
      data-group-id={groupId}
      {...mergeProps(props, {
        style: {
          display: "grid",
          opacity: size === 0 ? 0 : 1,
          gridTemplateColumns:
            orientation === "horizontal" ? template : undefined,
          gridTemplateRows: orientation === "vertical" ? template : undefined,
          height: "100%",
          ...props.style,
        },
      })}
    />
  );
}

export interface PanelProps
  extends Constraints,
    React.HTMLAttributes<HTMLDivElement> {}

export function Panel({
  min,
  max,
  defaultCollapsed,
  collapsible,
  collapsedSize,
  ...props
}: PanelProps) {
  const panelId = `panel-${useId()}`;
  const { send } = GroupMachineContext.useActorRef();

  const hasRegistered = React.useRef(false);

  if (!hasRegistered.current) {
    hasRegistered.current = true;
    send({
      type: "registerPanel",
      data: {
        min,
        max,
        id: panelId,
        defaultCollapsed,
        collapsible,
        collapsedSize,
      },
    });
  }

  React.useEffect(() => {
    return () => send({ type: "unregisterPanel", id: panelId });
  }, [send, panelId]);

  return (
    <div
      data-panel-id={panelId}
      {...props}
      style={{ ...props.style, minWidth: 0, minHeight: 0, overflow: "hidden" }}
    />
  );
}

export interface PanelResizerProps {
  size?: PixelUnit;
}

function unitsToPercents(groupsSize: number, unit: Unit | number) {
  if (typeof unit === "number") {
    return unit / groupsSize;
  }

  const parsed = parseUnit(unit);

  if (parsed.type === "pixel") {
    return parsed.value / groupsSize;
  }

  return parsed.value;
}

export function PanelResizer({ size = "10px" }: PanelResizerProps) {
  const handleId = `panel-resizer-${useId()}`;
  const { send } = GroupMachineContext.useActorRef();
  const panelBeforeHandle = GroupMachineContext.useSelector(({ context }) =>
    context.items.length ? getPanelBeforeHandleId(context, handleId) : undefined
  );
  const collapsiblePanel = GroupMachineContext.useSelector(({ context }) =>
    getCollapsiblePanelForHandleId(context, handleId)
  );

  const orientation = GroupMachineContext.useSelector(
    (state) => state.context.orientation
  );
  const groupsSize = GroupMachineContext.useSelector(
    (state) => state.context.size
  );
  const { moveProps } = useMove({
    onMoveStart: () => send({ type: "dragHandleStart", id: handleId }),
    onMove: (e) => send({ type: "dragHandle", id: handleId, value: e }),
    onMoveEnd: () => send({ type: "dragHandleEnd", id: handleId }),
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

  const hasRegistered = React.useRef(false);

  if (!hasRegistered.current) {
    hasRegistered.current = true;
    send({ type: "registerPanelHandle", data: { id: handleId, size } });
  }

  React.useEffect(() => {
    return () => send({ type: "unregisterPanelHandle", id: handleId });
  }, [send, handleId]);

  if (!panelBeforeHandle || !isPanelData(panelBeforeHandle)) {
    return null;
  }

  return (
    <div
      role="separator"
      tabIndex={0}
      data-handle-id={handleId}
      data-handle-orientation={orientation}
      aria-label="Resize Handle"
      aria-controls={panelBeforeHandle.id}
      aria-valuemin={unitsToPercents(groupsSize, panelBeforeHandle.min)}
      aria-valuemax={unitsToPercents(groupsSize, panelBeforeHandle.max)}
      aria-valuenow={
        typeof panelBeforeHandle.currentValue === "string" &&
        (panelBeforeHandle.currentValue.includes("minmax") ||
          panelBeforeHandle.currentValue.includes("fr"))
          ? undefined
          : unitsToPercents(groupsSize, panelBeforeHandle.currentValue as Unit)
      }
      style={
        orientation === "horizontal"
          ? { background: "red", width: 10, height: "100%" }
          : { background: "red", height: 10, width: "100%" }
      }
      {...mergeProps(moveProps, { onKeyDown })}
    />
  );
}
