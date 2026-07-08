import {
  buildTemplate,
  getCollapsiblePanelForHandleId,
  getCursor,
  getGroupSize,
  getPanelGroupPercentageSizes,
  getPanelGroupPixelSizes,
  getPanelPercentageSize,
  getPanelPixelSize,
  groupMachine,
  GroupMachineContextValue,
  haveConstraintsChangedForPanel,
  haveConstraintsChangedForPanelHandle,
  initializePanel,
  initializePanelHandleData,
  isPanelData,
  isPanelHandle,
  PanelData,
  parseUnit,
  prepareItems,
  prepareSnapshot,
} from "@window-splitter/state";
import {
  Accessor,
  children,
  createDeferred,
  createEffect,
  createRenderEffect,
  createRoot,
  createSignal,
  createUniqueId,
  JSX,
  on,
  onCleanup,
  onMount,
  Ref,
  splitProps,
} from "solid-js";
import {
  GroupMachineProvider,
  useMachineActor,
  useGroupId,
  useMachineState,
  useInitialPrerenderContext,
} from "./context.jsx";
import {
  PanelGroupHandle,
  SharedPanelGroupProps,
  PanelHandle,
  SharedPanelProps,
  SharedPanelResizerProps,
  measureGroupChildren,
  getPanelDomAttributes,
  getPanelResizerDomAttributes,
  move,
} from "@window-splitter/interface";
import { mergeSolidAttributes } from "./mergeSolidAttributes.js";

export interface PanelGroupProps
  extends Omit<JSX.HTMLAttributes<HTMLDivElement>, "style">,
    SharedPanelGroupProps {
  /** Imperative handle to control the group */
  handle?: Ref<PanelGroupHandle>;
  style?: JSX.CSSProperties;
}

export function PanelGroup(props: PanelGroupProps) {
  const [, attrs] = splitProps(props, [
    "orientation",
    "autosaveStrategy",
    "autosaveId",
    "snapshot",
    "shiftAmount",
  ]);
  let elementRef: HTMLDivElement | undefined;
  const [intiialValue, send, machineState, groupId] = createRoot(() => {
    const defaultGroupId = `panel-group-${createUniqueId()}`;
    const groupIdInit = props.autosaveId || props.id || defaultGroupId;
    const orientation = props.orientation || "horizontal";
    const autosaveStrategy = props.autosaveStrategy || "localStorage";

    let snapshot: GroupMachineContextValue | undefined;

    if (props.snapshot) {
      snapshot = props.snapshot;
    } else if (
      typeof window !== "undefined" &&
      props.autosaveId &&
      autosaveStrategy === "localStorage"
    ) {
      const localSnapshot = localStorage.getItem(props.autosaveId);

      if (localSnapshot) {
        snapshot = JSON.parse(localSnapshot) as GroupMachineContextValue;
      }
    }

    return [
      ...groupMachine(
        {
          orientation,
          groupId: groupIdInit,
          autosaveStrategy: autosaveStrategy,
          shiftAmount: props.shiftAmount,
          ...(snapshot ? prepareSnapshot(snapshot) : undefined),
        },
        (value) => {
          setCurrentValue({ ...value });
        },
        () => elementRef ?? null
      ),
      groupIdInit,
    ];
  });
  const [currentValue, setCurrentValue] = createSignal(intiialValue);

  const getContext = () => {
    const context = currentValue?.() || intiialValue;
    if (!context) throw new Error("No state");
    return context;
  };

  // Prerender the children with the machine context
  const [isInitialPrerender, setIsInitialPrerender] = createSignal(true);
  const resolvedChildren = children(() => (
    <GroupMachineProvider
      groupId={groupId}
      send={send}
      state={getContext}
      initialPrerender={isInitialPrerender}
    >
      {props.children}
    </GroupMachineProvider>
  ));
  setIsInitialPrerender(false);

  // Measure group size
  onMount(() => {
    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      if (!(entry.contentRect.width > 0 && entry.contentRect.height > 0))
        return;
      send({ type: "setSize", size: entry.contentRect });
    });

    if (elementRef) observer.observe(elementRef);
    onCleanup(() => observer.disconnect());
  });

  const childIds = createDeferred(() =>
    currentValue()
      .items.map((i) => i.id)
      .join(",")
  );

  // Measure children size
  createEffect(
    on(childIds, () => {
      const cleanup = measureGroupChildren(groupId, (childrenSizes) => {
        send({ type: "setActualItemsSize", childrenSizes });
      });

      onCleanup(cleanup);
    })
  );

  createRefContent(
    () => props.handle,
    () => ({
      getId: () => groupId,
      getPixelSizes: () => getPanelGroupPixelSizes(currentValue()),
      getPercentageSizes: () => getPanelGroupPercentageSizes(currentValue()),
      setSizes: (updates) => {
        const context = currentValue();

        for (let index = 0; index < updates.length; index++) {
          const item = context.items[index];
          const update = updates[index];

          if (item && isPanelData(item) && update) {
            send({ type: "setPanelPixelSize", panelId: item.id, size: update });
          }
        }
      },
      getTemplate: () => {
        const context = getContext();
        return buildTemplate({ ...context, items: prepareItems(context) });
      },
      getState: () => (machineState.current === "idle" ? "idle" : "dragging"),
    })
  );

  const getTemplate = () => buildTemplate(getContext());

  onMount(() => send({ type: "unlockGroup" }));
  onCleanup(() => send({ type: "lockGroup" }));

  return (
    <div
      id={groupId}
      ref={elementRef}
      data-panel-group-wrapper
      {...attrs}
      style={{
        display: "grid",
        "grid-template-columns":
          currentValue()?.orientation === "horizontal"
            ? getTemplate()
            : undefined,
        "grid-template-rows":
          currentValue()?.orientation === "vertical"
            ? getTemplate()
            : undefined,
        height: "100%",
        ...props.style,
      }}
    >
      {resolvedChildren()}
    </div>
  );
}

function createRefContent<T extends Exclude<unknown, () => void>>(
  getRef: () => Ref<T> | undefined,
  createRef: () => T
) {
  createRenderEffect(() => {
    const refProp = getRef();
    if (typeof refProp !== "function") {
      return () => {};
    }
    const refFunc = refProp as (value: T) => void;
    refFunc(createRef());
  });
}

export interface PanelProps
  extends SharedPanelProps<Accessor<boolean | undefined>>,
    Omit<JSX.HTMLAttributes<HTMLDivElement>, "onResize" | "style"> {
  /** Imperative handle to control the panel */
  handle?: Ref<PanelHandle>;
  style?: JSX.CSSProperties;
}

export function Panel(props: PanelProps) {
  const [, attrs] = splitProps(props, [
    "min",
    "max",
    "id",
    "collapsible",
    "collapsed",
    "collapsedSize",
    "onCollapseChange",
    "collapseAnimation",
    "onResize",
    "defaultCollapsed",
    "default",
    "isStaticAtRest",
  ]);

  const isInitialPrerender = useInitialPrerenderContext();
  const send = useMachineActor();
  const groupId = useGroupId();
  const state = useMachineState();
  const defaultId = createUniqueId();
  const panelId = () => props.id || defaultId;

  let dynamicPanelIsMounting = false;
  let hasMounted = false;

  const initPanel = (): PanelData =>
    initializePanel({
      id: panelId(),
      min: props.min,
      max: props.max,
      collapsible: props.collapsible,
      collapsed: props.collapsed?.(),
      collapsedSize: props.collapsedSize,
      onCollapseChange: { current: props.onCollapseChange },
      collapseAnimation: props.collapseAnimation,
      onResize: { current: props.onResize },
      defaultCollapsed: props.defaultCollapsed,
      default: props.default,
      isStaticAtRest: props.isStaticAtRest,
    });

  createRoot(() => {
    const panelData = initPanel();

    if (send) {
      const hasRegistered = state?.()?.items.find((i) => i.id === panelData.id);

      if (!hasRegistered) {
        if (isInitialPrerender()) {
          send({ type: "registerPanel", data: panelData });
        } else {
          dynamicPanelIsMounting = true;
        }
      } else {
        send?.({
          type: "rebindPanelCallbacks",
          data: {
            id: panelData.id,
            onCollapseChange: { current: props.onCollapseChange },
            onResize: { current: props.onResize },
          },
        });
      }
    }

    return panelData.id;
  });

  const panel = () => {
    const currentPanel = state?.()?.items.find((i) => i.id === panelId());
    if (!currentPanel || !isPanelData(currentPanel))
      throw new Error("Panel not found");
    return currentPanel;
  };

  const contraintChanged = createDeferred(() => {
    const currentPanel = dynamicPanelIsMounting === false ? panel() : undefined;
    if (!currentPanel || !isPanelData(currentPanel)) return;
    return haveConstraintsChangedForPanel(initPanel(), currentPanel);
  });

  createEffect(
    on(contraintChanged, () => {
      if (!hasMounted) return;
      send?.({ type: "updateConstraints", data: initPanel() });
    })
  );

  onMount(() => {
    hasMounted = true;
    if (!dynamicPanelIsMounting) return;

    // get the index of the panel in it's group
    const panelElement = document.getElementById(panelId());

    if (!panelElement) return;

    const groupElement = panelElement.closest(
      `[data-panel-group-wrapper]`
    ) as HTMLDivElement;

    if (!groupElement || !panelElement) return;

    const order = Array.from(groupElement.children).indexOf(panelElement);

    if (typeof order !== "number") return;

    send?.({ type: "registerDynamicPanel", data: { ...initPanel(), order } });
    dynamicPanelIsMounting = false;
  });

  const panelData = () => {
    const item = state?.()?.items.find((i) => i.id === panelId());
    if (!item || !isPanelData(item)) return undefined;
    return item;
  };

  const currentCollapsed = () => props.collapsed?.() || false;
  createEffect(
    on(currentCollapsed, () => {
      const collapsed = props.collapsed?.() || false;

      if (!panelData?.()?.collapseIsControlled) return;

      if (collapsed) {
        send?.({ type: "collapsePanel", panelId: panelId(), controlled: true });
      } else {
        send?.({ type: "expandPanel", panelId: panelId(), controlled: true });
      }
    })
  );

  createRefContent(
    () => props.handle,
    () => ({
      getId: () => panelId(),
      collapse: async () => {
        if (panel().collapsible) {
          // eslint-disable-next-line solid/reactivity
          return await new Promise<void>((resolve) => {
            send?.({
              type: "collapsePanel",
              panelId: panelId(),
              controlled: true,
              resolve,
            });
          });
        }
      },
      isCollapsed: () => Boolean(panel().collapsible && panel().collapsed),
      expand: async () => {
        if (panel().collapsible) {
          // eslint-disable-next-line solid/reactivity
          return await new Promise<void>((resolve) => {
            send?.({
              type: "expandPanel",
              panelId: panelId(),
              controlled: true,
              resolve,
            });
          });
        }
      },
      isExpanded: () => Boolean(panel().collapsible && !panel().collapsed),
      getPixelSize: () => {
        const s = state?.();
        if (!s) throw new Error("No state");
        return getPanelPixelSize(s, panelId());
      },
      setSize: (size) => {
        send?.({ type: "setPanelPixelSize", panelId: panelId(), size });
      },
      getPercentageSize: () => {
        const s = state?.();
        if (!s) throw new Error("No state");
        return getPanelPercentageSize(s, panelId());
      },
    })
  );

  onCleanup(() => {
    // We wait a frame because in Solid children unmount before their parent
    // and we want to only unregister if just the panel is being removed, not
    // the whole group. This frame allows for the parent to lock the machine.
    requestAnimationFrame(() => {
      send?.({ type: "unregisterPanel", id: panelId() });
    });
  });

  const domAttributes = () => {
    const currentPanel = panelData();

    return getPanelDomAttributes({
      groupId,
      id: panelId(),
      collapsible: currentPanel?.collapsible,
      collapsed: currentPanel?.collapsed,
    });
  };

  return (
    <div
      {...mergeSolidAttributes(attrs, domAttributes())}
      style={{
        "min-width": 0,
        "min-height": 0,
        overflow: "hidden",
        ...props.style,
      }}
    />
  );
}

export interface PanelResizerProps
  extends SharedPanelResizerProps,
    Omit<
      JSX.HTMLAttributes<HTMLDivElement>,
      "onDragStart" | "onDrag" | "onDragEnd" | "style"
    > {
  style?: JSX.CSSProperties;
}

export function PanelResizer(props: PanelResizerProps) {
  const [, attrs] = splitProps(props, [
    "size",
    "id",
    "onDragStart",
    "onDrag",
    "onDragEnd",
    "disabled",
  ]);

  const isInitialPrerender = useInitialPrerenderContext();
  const send = useMachineActor();
  const state = useMachineState();
  const defaultId = createUniqueId();
  const handleId = () => props.id || defaultId;
  const handle = () => {
    const currentHandle = state?.()?.items.find((i) => i.id === handleId());
    if (!currentHandle || !isPanelHandle(currentHandle))
      throw new Error("Handle not found");
    return currentHandle;
  };

  let dynamicPanelHandleIsMounting = false;
  let hasMounted = false;

  const initHandle = () =>
    initializePanelHandleData({
      size: props.size || "0px",
      id: handleId(),
    });

  createRoot(() => {
    if (send) {
      const hasRegistered = state?.()?.items.find((i) => i.id === handleId());

      if (!hasRegistered) {
        if (isInitialPrerender()) {
          send({
            type: "registerPanelHandle",
            data: initHandle(),
          });
        } else {
          dynamicPanelHandleIsMounting = true;
        }
      }
    }
  });

  const contraintChanged = createDeferred(() => {
    const currentHandle =
      dynamicPanelHandleIsMounting === false ? handle() : undefined;
    if (!currentHandle || !isPanelHandle(currentHandle)) return;
    return haveConstraintsChangedForPanelHandle(initHandle(), currentHandle);
  });

  createEffect(
    on(contraintChanged, () => {
      if (!hasMounted) return;
      send?.({ type: "updateConstraints", data: initHandle() });
    })
  );

  onMount(() => {
    hasMounted = true;
    if (!dynamicPanelHandleIsMounting) return;

    // get the index of the panel in it's group
    const handleElement = document.getElementById(handleId());

    if (!handleElement) return;

    const groupElement = handleElement.closest(
      `[data-panel-group-wrapper]`
    ) as HTMLDivElement;

    if (!groupElement || !handleElement) return;

    const order = Array.from(groupElement.children).indexOf(handleElement);

    if (typeof order !== "number") return;

    send?.({ type: "registerPanelHandle", data: { ...initHandle(), order } });
    dynamicPanelHandleIsMounting = false;
  });

  const { moveProps } = move({
    onMoveStart: () => {
      send?.({ type: "dragHandleStart", handleId: handleId() });
      props.onDragStart?.();
      document.body.style.cursor = cursor() || "auto";
    },
    onMove: (e) => {
      send?.({ type: "dragHandle", handleId: handleId(), value: e });
      props.onDrag?.();
    },
    onMoveEnd: () => {
      send?.({ type: "dragHandleEnd", handleId: handleId() });
      props.onDragEnd?.();
      document.body.style.cursor = "auto";
    },
  });

  const itemIndex = () =>
    state?.()?.items.findIndex((item) => item.id === handleId()) || -1;
  const activeDragHandleId = () => state?.()?.activeDragHandleId;
  const isDragging = () => activeDragHandleId() === handleId();
  const panelBeforeHandle = () => state?.()?.items[itemIndex() - 1];
  const panelAttributes = () => {
    const panelBefore = panelBeforeHandle();
    const currentState = state?.();

    if (!panelBefore || !currentState || !isPanelData(panelBefore))
      return { id: handleId };

    return getPanelResizerDomAttributes({
      groupId: currentState.groupId,
      id: handleId(),
      orientation: currentState.orientation,
      isDragging: isDragging(),
      activeDragHandleId: activeDragHandleId(),
      disabled: props.disabled,
      controlsId: panelBefore.id,
      min: panelBefore.min,
      max: panelBefore.max,
      currentValue: panelBefore.currentValue,
      groupSize: getGroupSize(currentState),
    });
  };

  const cursor = () => {
    if (props.disabled) return;
    const currentState = state?.();
    if (!currentState) return;
    return getCursor(currentState);
  };
  const dimensions = () => {
    const currentState = state?.();
    if (!currentState) return {};
    const unit = parseUnit(props.size || "0px");
    return currentState.orientation === "horizontal"
      ? { width: `${unit.value.toNumber()}px`, height: "100%" }
      : { height: `${unit.value.toNumber()}px`, width: "100%" };
  };

  const onKeyDown = (e: KeyboardEvent) => {
    const currentState = state?.();
    if (!currentState) return undefined;

    try {
      const collapsiblePanel = getCollapsiblePanelForHandleId(
        currentState,
        handleId()
      );

      if (e.key === "Enter" && collapsiblePanel) {
        if (collapsiblePanel.collapsed) {
          send?.({ type: "expandPanel", panelId: collapsiblePanel.id });
        } else {
          send?.({ type: "collapsePanel", panelId: collapsiblePanel.id });
        }
      }
    } catch {
      return undefined;
    }
  };

  onCleanup(() => {
    // We wait a frame because in Solid children unmount before their parent
    // and we want to only unregister if just the panel is being removed, not
    // the whole group. This frame allows for the parent to lock the machine.
    requestAnimationFrame(() => {
      send?.({ type: "unregisterPanelHandle", id: handleId() });
    });
  });

  return (
    <div
      {...mergeSolidAttributes(
        attrs,
        panelAttributes(),
        props.disabled
          ? {}
          : mergeSolidAttributes(moveProps, { onKeyDown, tabIndex: 0 }),
        {
          style: {
            cursor: cursor(),
            ...dimensions(),
            ...props.style,
          },
        }
      )}
      id={handleId()}
    />
  );
}
