"use client";

import React from "react";
import { mergeProps, useId, useMove } from "react-aria";
import { createMachine, assign, enqueueActions } from "xstate";
import { createActorContext } from "@xstate/react";
import invariant from "invariant";

interface Offset {
  deltaX: number;
  deltaY: number;
}

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

  throw new Error(`Invalid unit: ${unit}`);
}

interface Rect {
  width: number;
  height: number;
}

interface Constraints {
  min?: Unit;
  max?: Unit;
  default?: Unit;
}

interface PanelData extends Constraints {
  type: "panel";
  id: string;
}

interface ActivePanelData extends PanelData {
  currentValue: number | string;
  min: Unit;
  max: Unit;
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
  value: Offset;
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
  | DragHandleEndEvent;

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

  availableSpace -= context.items
    .filter(isPanelHandle)
    .map((item) => parseUnit(item.size).value)
    .reduce((a, b) => a + b, 0);

  return availableSpace;
}

/** Converts the items to pixels */
function onDragStart(context: GroupMachineContext) {
  const newItems = [...context.items];

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

function updateLayout(
  context: GroupMachineContext,
  dragEvent: DragHandleEvent
): Partial<GroupMachineContext> {
  const handleIndex = context.items.findIndex(
    (item) => item.id === dragEvent.id
  );

  if (handleIndex === -1) {
    return {};
  }

  const handle = context.items[handleIndex] as PanelHandleData;
  const newItems = [...context.items];
  const moveUnit =
    context.orientation === "horizontal"
      ? dragEvent.value.deltaX
      : dragEvent.value.deltaY;
  const directionModifier = moveUnit < 0 ? 1 : -1;
  const newDragOvershoot = context.dragOvershoot + moveUnit;

  if (context.dragOvershoot > 0 && newDragOvershoot >= 0) {
    return {
      dragOvershoot: context.dragOvershoot + moveUnit,
    };
  }

  if (context.dragOvershoot < 0 && newDragOvershoot <= 0) {
    return {
      dragOvershoot: context.dragOvershoot + moveUnit,
    };
  }

  // TODO these need to take delta into accounte
  const panelBefore = findPanelWithSpace(
    context,
    newItems,
    handleIndex - directionModifier,
    -directionModifier
  );

  const panelAfter = newItems[handleIndex + directionModifier];

  if (!panelBefore) {
    return {
      dragOvershoot: context.dragOvershoot + moveUnit,
    };
  }

  // Error if the handle is not in the correct position
  if (!isPanelData(panelBefore)) {
    throw new Error(`Expected panel before: ${handle.id}`);
  }

  if (!panelAfter || !isPanelData(panelAfter)) {
    throw new Error(`Expected panel after: ${handle.id}`);
  }

  const panelBeforePreviousValue = panelBefore.currentValue as number;
  const panelBeforeNewValue = clampUnit(
    context,
    panelBefore,
    (panelBefore.currentValue as number) - moveUnit * -directionModifier
  );

  const applied = panelBeforePreviousValue - panelBeforeNewValue;
  const panelAfterNewValue = clampUnit(
    context,
    panelAfter,
    (panelAfter.currentValue as number) + applied
  );

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
function onDragEnd(context: GroupMachineContext) {
  const newItems = [...context.items];

  newItems.forEach((item, index) => {
    if (item.type === "panel") {
      if (typeof item.currentValue === "number") {
        const fraction = item.currentValue / context.size;
        newItems[index] = {
          ...item,
          currentValue: `clamp(${item.min || "0px"}, ${fraction * 100}%, ${item.max || "100%"})`,
        };
      }
    }
  });

  return newItems;
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

          return [
            ...context.items,
            {
              type: "panel",
              ...event.data,
              min: event.data.min || "0px",
              max: event.data.max || "100%",
              currentValue: event.data.default
                ? event.data.default
                : event.data.min && event.data.max
                  ? `minmax(${event.data.min}, ${event.data.max})`
                  : event.data.max
                    ? `minmax(0, ${event.data.max})`
                    : event.data.min
                      ? `minmax(${event.data.min}, 1fr)`
                      : "1fr",
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
        items: ({ context, event }) => {
          isEvent(event, ["dragHandleStart"]);
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
          isEvent(event, ["dragHandleEnd"]);
          return onDragEnd(context);
        },
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

export function Panel({ min, max, ...props }: PanelProps) {
  const panelId = `panel-${useId()}`;
  const { send } = GroupMachineContext.useActorRef();

  const hasRegistered = React.useRef(false);

  if (!hasRegistered.current) {
    hasRegistered.current = true;
    send({ type: "registerPanel", data: { min, max, id: panelId } });
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

export function PanelResizer({ size = "10px" }: PanelResizerProps) {
  const handleId = `panel-resizer-${useId()}`;
  const { send } = GroupMachineContext.useActorRef();
  const orientation = GroupMachineContext.useSelector(
    (state) => state.context.orientation
  );
  const { moveProps } = useMove({
    onMoveStart: () => send({ type: "dragHandleStart", id: handleId }),
    onMove: (e) => send({ type: "dragHandle", id: handleId, value: e }),
    onMoveEnd: () => send({ type: "dragHandleEnd", id: handleId }),
  });

  const hasRegistered = React.useRef(false);

  if (!hasRegistered.current) {
    hasRegistered.current = true;
    send({ type: "registerPanelHandle", data: { id: handleId, size } });
  }

  React.useEffect(() => {
    return () => send({ type: "unregisterPanelHandle", id: handleId });
  }, [send, handleId]);

  return (
    <div
      data-handle-id={handleId}
      data-handle-orientation={orientation}
      style={
        orientation === "horizontal"
          ? { background: "red", width: 10, height: "100%" }
          : { background: "red", height: 10, width: "100%" }
      }
      {...moveProps}
    />
  );
}
