"use client";

import {
  getPanelDomAttributes,
  getPanelResizerDomAttributes,
  measureGroupChildren,
  PanelGroupHandle,
  PanelHandle,
  SharedPanelGroupProps,
  SharedPanelProps,
  SharedPanelResizerProps,
  mergeAttributes,
} from "@window-splitter/interface";
import React, {
  useEffect,
  useImperativeHandle,
  createContext,
  useRef,
  useState,
  useMemo,
  useContext,
} from "react";
import {
  buildTemplate,
  getCollapsiblePanelForHandleId,
  getGroupSize,
  getPanelWithId,
  groupMachine,
  GroupMachineContextValue,
  initializePanel,
  InitializePanelHandleData,
  isPanelData,
  Item,
  PanelData,
  parseUnit,
  prepareItems,
  prepareSnapshot,
  getPanelGroupPixelSizes,
  getPanelGroupPercentageSizes,
  getPanelPixelSize,
  getPanelPercentageSize,
  getCursor,
  haveConstraintsChangedForPanel,
  PanelHandleData,
  ParsedPixelUnit,
  haveConstraintsChangedForPanelHandle,
  GroupMachineInput,
  GroupMachineEvent,
  State,
  initializePanelHandleData,
  isPanelHandle,
} from "@window-splitter/state";
import {
  useEffectEvent,
  useId,
  useLayoutEffect,
  mergeRefs,
} from "@react-aria/utils";
import { useIndex, useIndexedChildren } from "./useIndexedChildren.js";
import { useMove } from "./useMove.js";

// #region Components

const GroupMachineState = createContext<{ current: State | undefined }>({
  current: undefined,
});
const GroupMachineContext = createContext<GroupMachineContextValue | undefined>(
  undefined
);
const GroupMachineStateContextRef = createContext<
  React.MutableRefObject<GroupMachineContextValue>
>({
  current: undefined,
} as unknown as React.MutableRefObject<GroupMachineContextValue>);
const GroupMachineActor = createContext<(e: GroupMachineEvent) => void>(
  () => {}
);
const GroupMachineAnimationDomRef = createContext<
  React.MutableRefObject<HTMLElement | null>
>({ current: null });
const GroupMachine = {
  useSelector<R>(
    selector: (data: { context: GroupMachineContextValue }) => R
  ): R {
    const context = useContext(GroupMachineContext);
    if (!context) {
      throw new Error(
        "GroupMachineContext must be used within a GroupMachineProvider"
      );
    }
    return selector({ context });
  },
  useActorRef: () => {
    const send = useContext(GroupMachineActor);
    return { send };
  },
  useContextRef: () => {
    const ref = useContext(GroupMachineStateContextRef);
    if (!ref) {
      throw new Error(
        "GroupMachineContext must be used within a GroupMachineProvider"
      );
    }
    return ref;
  },
  Provider: ({
    input,
    children,
  }: {
    input: GroupMachineInput;
    children: React.ReactNode;
  }) => {
    const animationDomRef = useRef<HTMLElement | null>(null);
    const [initialValue, send, state] = useMemo(
      () =>
        groupMachine(
          input,
          (value) => {
            currentContextRef.current = value;
            setCurrentValue({ ...value });
          },
          () => animationDomRef.current
        ),
      // We only want this to run once, we dont care about changes to the input
      // eslint-disable-next-line react-hooks/exhaustive-deps
      []
    );
    const currentContextRef = useRef(initialValue);
    const [currentValue, setCurrentValue] = useState(initialValue);

    useEffect(() => {
      send({ type: "unlockGroup" });

      return () => {
        // When we were on xstate we could fire off event during unmount and if the parent group
        // unmounted too the events would never apply. With out own state machine code it doesn't
        // do that so we have to lock the group as it unmounts so it's children don't de-register.
        send({ type: "lockGroup" });
      };
    }, [send]);

    return (
      <GroupMachineState.Provider value={state}>
        <GroupMachineStateContextRef.Provider value={currentContextRef}>
          <GroupMachineContext.Provider value={currentValue}>
            <GroupMachineActor.Provider value={send}>
              <GroupMachineAnimationDomRef.Provider value={animationDomRef}>
                {children}
              </GroupMachineAnimationDomRef.Provider>
            </GroupMachineActor.Provider>
          </GroupMachineContext.Provider>
        </GroupMachineStateContextRef.Provider>
      </GroupMachineState.Provider>
    );
  },
};

// function useDebugGroupMachineContext({ id }: { id: string }) {
//   const value = GroupMachineContext.useSelector((state) => state.value);
//   const context = GroupMachineContext.useSelector((state) => state.context);
//   console.log(
//     "GROUP CONTEXT",
//     buildTemplate(context),
//     context.size,
//     context.items.map((item) =>
//       isPanelData(item)
//         ? {
//             type: item.currentValue.type,
//             value: item.currentValue.value.toNumber(),
//           }
//         : { type: item.size.type, value: item.size.value.toNumber() }
//     )
//   );
// }

export interface PanelGroupProps
  extends React.HTMLAttributes<HTMLDivElement>,
    SharedPanelGroupProps {
  /** Imperative handle to control the group */
  handle?: React.Ref<PanelGroupHandle>;
}

const InitialMapContext = createContext<Item[]>([]);
const PreRenderContext = createContext(false);

function PrerenderTree({
  children,
  onPrerender,
}: {
  children: React.ReactNode;
  onPrerender: () => void;
}) {
  const [shouldPrerender, setShouldPrerender] = React.useState(true);

  useLayoutEffect(() => {
    setShouldPrerender(false);
    onPrerender();
    // We only want this to run once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return shouldPrerender ? (
    <div className="opacity-0 absolute">
      <PreRenderContext.Provider value>{children}</PreRenderContext.Provider>
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
  const { index } = useIndex();
  const item = { ...itemArg, id } as T;

  if (isPrerender) {
    if (!initialMap.find((i) => i.id === item.id)) {
      initialMap.push(item);
    }
    return item;
  }

  // The way this hooks is called is never conditional so the usage here is fine
  /* eslint-disable react-hooks/rules-of-hooks */
  const currentItem = GroupMachine.useSelector(({ context }) => {
    const itemAtIndex = context.items[index];
    if (itemAtIndex && itemAtIndex.id === item.id) {
      return itemAtIndex;
    }
    return context.items[index];
  }) as T | undefined;
  const { send } = GroupMachine.useActorRef();
  const machineRef = GroupMachine.useContextRef();

  const onCollapseChangeRef = isPanelData(itemArg)
    ? itemArg.onCollapseChange
    : undefined;
  const onResizeRef = isPanelData(itemArg) ? itemArg.onResize : undefined;
  const onUnmountRef = useRef<(() => void) | undefined>(undefined);

  // We register panels before layout so it looks good
  useLayoutEffect(() => {
    const context = machineRef.current;

    if (!context) {
      return;
    }

    let contextItem: Item | undefined;

    if (itemArg.id) {
      contextItem = context.items.find((i) => i.id === itemArg.id);

      if (!contextItem) {
        if (!itemArg.id) {
          throw new Error(
            "When using dynamic panels you must provide an id on the items. This applies to React strict mode as well."
          );
        }

        if (isPanelData(itemArg)) {
          send({
            type: "registerDynamicPanel",
            data: { ...itemArg, order: index },
          });
        } else {
          send({
            type: "registerPanelHandle",
            data: initializePanelHandleData({
              ...(itemArg as unknown as InitializePanelHandleData),
              order: index,
            }),
          });
        }
      } else if (onCollapseChangeRef || onResizeRef) {
        send({
          type: "rebindPanelCallbacks",
          data: {
            id: itemArg.id,
            onCollapseChange: onCollapseChangeRef,
            onResize: onResizeRef,
          },
        });
      }
    } else {
      contextItem = context.items[index];
    }

    const unmountId = contextItem?.id || itemArg.id;

    onUnmountRef.current = () => {
      if (!unmountId) return;

      const el = document.querySelector(
        `[data-splitter-id="${unmountId}"]`
      ) as HTMLElement;

      if (el || !unmountId) {
        return;
      }

      if (isPanelData(itemArg)) {
        send({ type: "unregisterPanel", id: unmountId });
      } else {
        send({ type: "unregisterPanelHandle", id: unmountId });
      }
    };
  }, [index, itemArg, machineRef, send, onCollapseChangeRef, onResizeRef]);

  // And unregister after layout so we can tell if the element was actually removed.
  React.useEffect(() => onUnmountRef.current, [currentItem?.id]);

  // If an item index updates we need to update the state machine
  const indexId = `${index}-${itemArg.id || currentItem?.id || item.id}`;
  const lastIndexId = useRef(indexId);
  const onUpdateIndex = useEffectEvent(() => {
    send({
      type: "updateItemIndex",
      itemId: itemArg.id || currentItem?.id || item.id,
      index,
    });
  });
  React.useLayoutEffect(() => {
    if (lastIndexId.current !== indexId) {
      onUpdateIndex();
    }

    lastIndexId.current = indexId;
  }, [indexId, onUpdateIndex]);

  return currentItem || item;
  /* eslint-enable react-hooks/rules-of-hooks */
}

/** A group of panels that has constraints and a user can resize */
export const PanelGroup = React.forwardRef<HTMLDivElement, PanelGroupProps>(
  function PanelGroup({ children, ...props }, ref) {
    const [hasPreRendered, setHasPreRendered] = useState(false);
    const initialMap = useRef<Item[]>([]);
    const indexedChildren = useIndexedChildren(children);

    return (
      <InitialMapContext.Provider value={initialMap.current}>
        {!hasPreRendered && (
          <PrerenderTree onPrerender={() => setHasPreRendered(true)}>
            {indexedChildren}
          </PrerenderTree>
        )}

        <PanelGroupImpl ref={ref} initialItems={initialMap} {...props}>
          {indexedChildren}
        </PanelGroupImpl>
      </InitialMapContext.Provider>
    );
  }
);

const PanelGroupImpl = React.forwardRef<
  HTMLDivElement,
  PanelGroupProps & {
    initialItems: { current: Item[] };
  }
>(function PanelGroupImpl(
  {
    autosaveId,
    autosaveStrategy = autosaveId ? "localStorage" : undefined,
    snapshot: snapshotProp,
    initialItems,
    shiftAmount,
    ...props
  },
  ref
) {
  const defaultGroupId = `panel-group-${useId()}`;
  const groupId = autosaveId || props.id || defaultGroupId;
  const [snapshot, setSnapshot] = React.useState<
    GroupMachineContextValue | true | undefined
  >(snapshotProp);

  if (
    typeof window !== "undefined" &&
    autosaveId &&
    !snapshot &&
    autosaveStrategy === "localStorage"
  ) {
    const localSnapshot = localStorage.getItem(autosaveId);

    if (localSnapshot) {
      setSnapshot(JSON.parse(localSnapshot));
    } else {
      setSnapshot(true);
    }
  }

  const snapshotMemo = useMemo(() => {
    return typeof snapshot === "object" ? prepareSnapshot(snapshot) : undefined;
  }, [snapshot]);

  return (
    <GroupMachine.Provider
      input={{
        orientation: props.orientation,
        groupId,
        items: initialItems.current,
        autosaveStrategy,
        shiftAmount,
        ...(typeof snapshotMemo === "object" ? snapshotMemo : undefined),
      }}
    >
      <PanelGroupImplementation ref={ref} {...props} />
    </GroupMachine.Provider>
  );
});

const PanelGroupImplementation = React.forwardRef<
  HTMLDivElement,
  PanelGroupProps
>(function PanelGroupImplementation(
  { handle, orientation: orientationProp, ...props },
  outerRef
) {
  const { send } = GroupMachine.useActorRef();
  const machineRef = GroupMachine.useContextRef();
  const animationDomRef = useContext(GroupMachineAnimationDomRef);
  const innerRef = React.useRef<HTMLDivElement>(null);
  const ref = mergeRefs(outerRef, innerRef);
  const orientation = GroupMachine.useSelector(
    (state) => state.context.orientation
  );
  const groupId = GroupMachine.useSelector((state) => state.context.groupId);
  const template = GroupMachine.useSelector((state) =>
    buildTemplate(state.context)
  );

  // When the prop for `orientation` updates also update the state machine
  if (orientationProp && orientationProp !== orientation) {
    send({ type: "setOrientation", orientation: orientationProp });
  }

  // Register the group's DOM element so the machine can write
  // grid-template directly during collapse/expand animations,
  // bypassing React re-renders for each animation frame.
  useLayoutEffect(() => {
    animationDomRef.current = innerRef.current;
    return () => {
      animationDomRef.current = null;
    };
  }, [animationDomRef]);

  // Track the size of the group
  useLayoutEffect(() => {
    const { current: el } = innerRef;

    if (!el) {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];

      if (!entry) {
        return;
      }

      send({ type: "setSize", size: entry.contentRect });
    });

    observer.observe(el);

    send({ type: "setSize", size: el.getBoundingClientRect() });

    return () => {
      observer.disconnect();
    };
  }, [send, innerRef, groupId]);

  const childIds = GroupMachine.useSelector((state) =>
    state.context.items.map((i) => i.id).join(",")
  );
  useLayoutEffect(() => {
    return measureGroupChildren(groupId, (childrenSizes) => {
      send({ type: "setActualItemsSize", childrenSizes });
    });
  }, [send, groupId, childIds]);

  // useDebugGroupMachineContext({ id: groupId });

  const fallbackHandleRef = React.useRef<PanelGroupHandle>(null);
  const state = useContext(GroupMachineState);

  useImperativeHandle(handle || fallbackHandleRef, () => {
    return {
      getId: () => groupId,
      getPixelSizes: () => getPanelGroupPixelSizes(machineRef.current),
      getPercentageSizes: () =>
        getPanelGroupPercentageSizes(machineRef.current),
      setSizes: (updates) => {
        const context = machineRef.current;

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
      getTemplate: () => {
        const context = machineRef.current;
        return buildTemplate({ ...context, items: prepareItems(context) });
      },
      getState: () => (state.current === "idle" ? "idle" : "dragging"),
    };
  });

  return (
    <div
      ref={ref}
      data-group-id={groupId}
      data-group-orientation={orientation}
      {...mergeAttributes(props, {
        style: {
          display: "grid",
          gridTemplateColumns:
            orientation === "horizontal" ? template : undefined,
          gridTemplateRows: orientation === "vertical" ? template : undefined,
          height: "100%",
        },
      })}
    />
  );
});

export interface PanelProps
  extends SharedPanelProps<boolean>,
    Omit<React.HTMLAttributes<HTMLDivElement>, "onResize"> {
  /** Imperative handle to control the panel */
  handle?: React.Ref<PanelHandle>;
}

/** A panel within a `PanelGroup` */
export const Panel = React.forwardRef<HTMLDivElement, PanelProps>(
  function Panel(
    {
      defaultCollapsed,
      min,
      max,
      default: defaultSize,
      collapsedSize,
      onCollapseChange,
      onResize,
      collapseAnimation,
      isStaticAtRest,
      ...props
    },
    outerRef
  ) {
    const { collapsible = false, collapsed } = props;
    const isPrerender = React.useContext(PreRenderContext);
    const onCollapseChangeRef = React.useRef(onCollapseChange);
    useEffect(() => {
      onCollapseChangeRef.current = onCollapseChange;
    }, [onCollapseChange]);
    const onResizeRef = React.useRef(onResize);
    useEffect(() => {
      onResizeRef.current = onResize;
    }, [onResize]);
    const panelDataRef = React.useMemo(() => {
      return initializePanel({
        min: min,
        max: max,
        collapsible: collapsible,
        collapsed: collapsed,
        collapsedSize: collapsedSize,
        onCollapseChange: onCollapseChangeRef,
        collapseAnimation: collapseAnimation,
        onResize: onResizeRef,
        id: props.id,
        defaultCollapsed,
        default: defaultSize,
        isStaticAtRest,
      });
    }, [
      collapseAnimation,
      collapsed,
      collapsedSize,
      collapsible,
      defaultCollapsed,
      max,
      min,
      props.id,
      defaultSize,
      isStaticAtRest,
    ]);

    const { id: panelId } = useGroupItem(panelDataRef);

    if (isPrerender) {
      return null;
    }

    return (
      <PanelVisible
        ref={outerRef}
        panelProp={panelDataRef}
        {...props}
        panelId={panelId}
      />
    );
  }
);

const PanelVisible = React.forwardRef<
  HTMLDivElement,
  Omit<
    PanelProps,
    | "collapsedSize"
    | "onCollapseChange"
    | "defaultCollapsed"
    | "min"
    | "max"
    | "collapseAnimation"
    | "onResize"
  > & {
    panelId: string;
    /** The latest prop that was received by the `Panel` component */
    panelProp: Omit<PanelData, "id">;
  }
>(function PanelVisible(
  { collapsible = false, collapsed, handle, panelId, panelProp, ...props },
  outerRef
) {
  const innerRef = React.useRef<HTMLDivElement>(null);
  const ref = mergeRefs(outerRef, innerRef);
  const { send } = GroupMachine.useActorRef();
  const machineRef = GroupMachine.useContextRef();
  const groupId = GroupMachine.useSelector((state) => state.context.groupId);
  const panel = GroupMachine.useSelector(({ context }) => {
    try {
      return getPanelWithId(context, panelId);
    } catch {
      return undefined;
    }
  });

  const constraintChanged =
    panel && haveConstraintsChangedForPanel(panelProp, panel);

  const onConstraintChange = useEffectEvent(() => {
    if (constraintChanged) {
      send({
        type: "updateConstraints",
        data: { ...panelProp, id: panel.id },
      });
    }
  });

  React.useEffect(() => {
    if (constraintChanged) {
      onConstraintChange();
    }
  }, [send, constraintChanged, onConstraintChange]);

  // For controlled collapse we track if the `collapse` prop changes
  // and update the state machine if it does.
  React.useEffect(() => {
    if (typeof collapsed !== "undefined") {
      const context = machineRef.current;

      if (context.items.length === 0) {
        return;
      }

      try {
        const p = getPanelWithId(context, panelId);

        if (collapsed === true && !p.collapsed) {
          send({ type: "collapsePanel", panelId, controlled: true });
        } else if (collapsed === false && p.collapsed) {
          send({ type: "expandPanel", panelId, controlled: true });
        }
      } catch {
        // with conditional panels the panel might not be registered yet
      }
    }
  }, [send, collapsed, panelId, machineRef]);

  const fallbackHandleRef = React.useRef<PanelHandle>(null);

  useImperativeHandle(handle || fallbackHandleRef, () => {
    return {
      getId: () => panelId,
      collapse: async () => {
        if (collapsible) {
          await new Promise<void>((resolve) => {
            send({ type: "collapsePanel", panelId, controlled: true, resolve });
          });
        }
      },
      isCollapsed: () => Boolean(collapsible && panel?.collapsed),
      expand: async () => {
        if (collapsible) {
          await new Promise<void>((resolve) => {
            send({ type: "expandPanel", panelId, controlled: true, resolve });
          });
        }
      },
      isExpanded: () => Boolean(collapsible && !panel?.collapsed),
      getPixelSize: () => {
        const context = machineRef.current;
        return getPanelPixelSize(context, panelId);
      },
      setSize: (size) => {
        send({ type: "setPanelPixelSize", panelId, size });
      },
      getPercentageSize: () => {
        const context = machineRef.current;
        return getPanelPercentageSize(context, panelId);
      },
    };
  });

  return (
    <div
      ref={ref}
      {...mergeAttributes(
        props,
        getPanelDomAttributes({
          groupId,
          id: panelId,
          collapsed,
          collapsible: panel?.collapsible,
        }),
        {
          style: {
            minWidth: 0,
            minHeight: 0,
            overflow: "hidden",
          },
        }
      )}
    />
  );
});

export interface PanelResizerProps
  extends SharedPanelResizerProps,
    Omit<
      React.HTMLAttributes<HTMLDivElement>,
      "onDragStart" | "onDrag" | "onDragEnd"
    > {}

/** A resize handle to place between panels. */
export const PanelResizer = React.forwardRef<HTMLDivElement, PanelResizerProps>(
  function PanelResizer(props, ref) {
    const { size = "0px" } = props;
    const isPrerender = React.useContext(PreRenderContext);
    const data = React.useMemo(
      () => ({
        type: "handle" as const,
        size: parseUnit(size) as ParsedPixelUnit,
        id: props.id,
      }),
      [size, props.id]
    );

    const { id: handleId } = useGroupItem(data);

    if (isPrerender) {
      return null;
    }

    return (
      <PanelResizerVisible
        ref={ref}
        panelHandleProp={data}
        {...props}
        handleId={handleId}
      />
    );
  }
);

const PanelResizerVisible = React.forwardRef<
  HTMLDivElement,
  PanelResizerProps & {
    panelHandleProp: Omit<PanelHandleData, "id">;
    handleId: string;
  }
>(function PanelResizerVisible(
  {
    size = "0px",
    disabled,
    onDragStart,
    onDrag,
    onDragEnd,
    panelHandleProp,
    handleId: handleIdProp,
    ...props
  },
  outerRef
) {
  const innerRef = React.useRef<HTMLDivElement>(null);
  const ref = mergeRefs(outerRef, innerRef);
  const unit = parseUnit(size);
  const { send } = GroupMachine.useActorRef();
  const { index } = useIndex();
  const panelHandle = GroupMachine.useSelector(({ context }) => {
    const item =
      context.items.find((i) => i.id === handleIdProp) || context.items[index];

    if (item && isPanelHandle(item)) {
      return item;
    }

    return undefined;
  });
  const handleId = panelHandle?.id || "";
  const panelBeforeHandle = GroupMachine.useSelector(({ context }) => {
    const panel = context.items[index - 1];
    if (!panel) return undefined;
    if (!isPanelData(panel)) return undefined;
    return panel;
  });
  const collapsiblePanel = GroupMachine.useSelector(({ context }) => {
    try {
      return getCollapsiblePanelForHandleId(context, handleId);
    } catch {
      return undefined;
    }
  });
  const orientation = GroupMachine.useSelector(
    (state) => state.context.orientation
  );
  const groupsSize = GroupMachine.useSelector((state) =>
    getGroupSize(state.context)
  );
  const overshoot = GroupMachine.useSelector(
    (state) => state.context.dragOvershoot
  );
  const activeDragHandleId = GroupMachine.useSelector(
    (state) => state.context.activeDragHandleId
  );
  const groupId = GroupMachine.useSelector((state) => state.context.groupId);
  const [isDragging, setIsDragging] = React.useState(false);

  let cursor: React.CSSProperties["cursor"];

  if (disabled) {
    cursor = "default";
  } else {
    cursor = getCursor({ dragOvershoot: overshoot, orientation });
  }

  const { moveProps } = useMove({
    onMoveStart: () => {
      send({ type: "dragHandleStart", handleId: handleId });
      onDragStart?.();
      setIsDragging(true);
      document.body.style.cursor = cursor || "auto";
    },
    onMove: (e) => {
      send({ type: "dragHandle", handleId: handleId, value: e });
      onDrag?.();
    },
    onMoveEnd: () => {
      send({ type: "dragHandleEnd", handleId: handleId });
      onDragEnd?.();
      setIsDragging(false);
      document.body.style.cursor = "auto";
    },
  });

  const constraintChanged =
    panelHandle &&
    haveConstraintsChangedForPanelHandle(panelHandleProp, panelHandle);

  const onConstraintChange = useEffectEvent(() => {
    if (constraintChanged) {
      send({
        type: "updateConstraints",
        data: { ...panelHandleProp, id: handleId },
      });
    }
  });

  React.useEffect(() => {
    if (constraintChanged) {
      onConstraintChange();
    }
  }, [send, constraintChanged, onConstraintChange]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" && collapsiblePanel) {
      if (collapsiblePanel.collapsed) {
        send({ type: "expandPanel", panelId: collapsiblePanel.id });
      } else {
        send({ type: "collapsePanel", panelId: collapsiblePanel.id });
      }
    }
  };

  return (
    <div
      ref={ref as unknown as React.Ref<HTMLDivElement>}
      {...mergeAttributes(
        props,
        disabled
          ? {}
          : mergeAttributes(moveProps as React.HTMLAttributes<HTMLDivElement>, {
              onKeyDown,
              tabIndex: 0,
            }),
        getPanelResizerDomAttributes({
          groupId,
          id: handleId,
          orientation,
          isDragging,
          activeDragHandleId,
          disabled,
          controlsId: panelBeforeHandle?.id,
          min: panelBeforeHandle?.min,
          max: panelBeforeHandle?.max,
          currentValue: panelBeforeHandle?.currentValue,
          groupSize: groupsSize,
        }),
        {
          style: {
            cursor,
            ...(orientation === "horizontal"
              ? { width: unit.value.toNumber(), height: "100%" }
              : { height: unit.value.toNumber(), width: "100%" }),
          },
        }
      )}
    />
  );
});

// #endregion
