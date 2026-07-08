<script lang="ts">
  import type { SharedPanelGroupProps } from "@window-splitter/interface";
  import { measureGroupChildren } from "@window-splitter/interface";
  import {
    buildTemplate,
    groupMachine,
    prepareSnapshot,
    prepareItems,
    getPanelGroupPixelSizes,
    getPanelGroupPercentageSizes,
    isPanelData,
  } from "@window-splitter/state";
  import type { GroupMachineContextValue, Unit } from "@window-splitter/state";
  import { setContext } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  export { PanelGroupHandle } from "@window-splitter/interface";

  export interface PanelGroupProps
    extends SharedPanelGroupProps,
      HTMLAttributes<HTMLDivElement> {
    id: string;
  }

  let {
    children,
    orientation = "horizontal",
    autosaveStrategy = "localStorage",
    autosaveId,
    snapshot,
    shiftAmount,
    ...attrs
  }: PanelGroupProps = $props();

  if (
    !snapshot &&
    typeof window !== "undefined" &&
    autosaveId &&
    autosaveStrategy === "localStorage"
  ) {
    const localSnapshot = localStorage.getItem(autosaveId);

    if (localSnapshot) {
      snapshot = JSON.parse(localSnapshot) as GroupMachineContextValue;
    }
  }

  const defaultId = $props.id();
  const id = autosaveId || defaultId;

  let elementRef = $state<HTMLDivElement>();

  const [initialState, send, machineState] = groupMachine(
    {
      orientation,
      groupId: id,
      autosaveStrategy,
      shiftAmount,
      ...(snapshot ? prepareSnapshot(snapshot) : undefined),
    },
    (s) => updateContext(s),
    () => elementRef ?? null
  );

  const context = $state<GroupMachineContextValue>(initialState);
  function updateContext(s: GroupMachineContextValue) {
    for (const key in s) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (context as any)[key] = (s as any)[key];
    }
  }

  setContext("send", send);
  setContext("state", context);
  setContext("id", machineState);

  const isPrerender = $state({ current: true });
  setContext("isPrerender", isPrerender);
  $effect(() => {
    isPrerender.current = false;
  });

  $effect(() => {
    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
        send({ type: "setSize", size: entry.contentRect });
      }
    });

    if (elementRef) {
      observer.observe(elementRef);
    }

    return () => observer.disconnect();
  });

  let childIds = $derived(context.items.map((i) => i.id).join(","));

  $effect(() => {
    // re-render when the childIds change
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    childIds;

    return measureGroupChildren(id, (childrenSizes) => {
      send({ type: "setActualItemsSize", childrenSizes });
    });
  });

  let template = $derived(buildTemplate(context));

  $effect(() => {
    send({ type: "unlockGroup" });
    return () => send({ type: "lockGroup" });
  });

  export const getId = () => id;
  export const getPixelSizes = () => getPanelGroupPixelSizes(context);
  export const getPercentageSizes = () => getPanelGroupPercentageSizes(context);
  export const getTemplate = () =>
    buildTemplate({ ...context, items: prepareItems(context) });
  export const getState = () =>
    machineState.current === "idle" ? "idle" : "dragging";
  export const setSizes = (updates: Array<Unit>) => {
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
  };
</script>

<div
  {...attrs}
  data-panel-group-wrapper
  bind:this={elementRef}
  style:display="grid"
  style:grid-template-columns={context.orientation === "horizontal"
    ? template
    : undefined}
  style:grid-template-rows={context.orientation === "vertical"
    ? template
    : undefined}
  {id}
>
  {@render children?.()}
</div>

<style>
  :where([data-panel-group-wrapper]) {
    height: 100%;
  }
</style>
