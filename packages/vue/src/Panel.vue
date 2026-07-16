<script setup lang="ts">
import {
  getPanelDomAttributes,
  PanelHandle,
  SharedPanelProps,
} from "@window-splitter/interface";
import {
  getPanelPercentageSize,
  getPanelPixelSize,
  GroupMachineContextValue,
  haveConstraintsChangedForPanel,
  initializePanel,
  isPanelData,
  PanelData,
  SendFn,
} from "@window-splitter/state";
import {
  computed,
  inject,
  onMounted,
  onUnmounted,
  Ref,
  useId,
  watchEffect,
} from "vue";

// eslint-disable-next-line vue/require-default-prop
type PanelProps = SharedPanelProps<boolean> & { id?: string };

const props = withDefaults(defineProps<PanelProps>(), { collapsed: undefined });
const {
  min: _min,
  max: _max,
  id,
  collapsible: _collapsible,
  collapsedSize: _collapsedSize,
  onCollapseChange: _onCollapseChange,
  collapseAnimation: _collapseAnimation,
  onResize: _onResize,
  defaultCollapsed,
  default: defaultSize,
  isStaticAtRest,
  collapsed: _collapsed,
  ...attrs
} = props;

const panelId = id || useId();
const send = inject<SendFn>("send");
const state = inject<Ref<GroupMachineContextValue>>("state");
const isPrerender = inject<Ref<boolean>>("isPrerender");

const initPanel = (): PanelData =>
  initializePanel({
    id: panelId,
    min: props.min,
    max: props.max,
    collapsible: props.collapsible,
    collapsed: props.collapsed,
    collapsedSize: props.collapsedSize,
    onCollapseChange: props.onCollapseChange
      ? { current: props.onCollapseChange }
      : undefined,
    collapseAnimation: props.collapseAnimation,
    onResize: props.onResize ? { current: props.onResize } : undefined,
    defaultCollapsed,
    default: defaultSize,
    isStaticAtRest,
  });

const panelData = computed(() => {
  const item = state?.value?.items.find((i) => i.id === panelId);
  if (!item || !isPanelData(item)) return undefined;
  return item;
});

let dynamicPanelIsMounting = false;

if (panelData.value) {
  send?.({
    type: "rebindPanelCallbacks",
    data: {
      id: panelId,
      onCollapseChange: props.onCollapseChange
        ? { current: props.onCollapseChange }
        : undefined,
      onResize: props.onResize ? { current: props.onResize } : undefined,
    },
  });
} else {
  if (isPrerender?.value) {
    send?.({ type: "registerPanel", data: initPanel() });
  } else {
    dynamicPanelIsMounting = true;
  }
}

onMounted(() => {
  const groupId = state?.value?.groupId;
  if (!groupId || !dynamicPanelIsMounting) return;

  const groupElement = document.getElementById(groupId);
  if (!groupElement) return;

  const panelElement = document.getElementById(panelId);
  if (!panelElement) return;

  const order = Array.from(groupElement.children).indexOf(panelElement);
  if (typeof order !== "number") return;

  send?.({
    type: "registerDynamicPanel",
    data: { ...initPanel(), order },
  });
  dynamicPanelIsMounting = false;
});

const contraintChanged = computed(
  () =>
    !dynamicPanelIsMounting &&
    haveConstraintsChangedForPanel(initPanel(), panelData.value),
);

watchEffect(() => {
  if (!contraintChanged.value) return;
  send?.({ type: "updateConstraints", data: initPanel() });
});

onUnmounted(() => {
  requestAnimationFrame(() => send?.({ type: "unregisterPanel", id: panelId }));
});

defineExpose<PanelHandle>({
  getId: () => panelId,
  collapse: async () => {
    if (!panelData.value?.collapsible) return;
    return await new Promise<void>((resolve) => {
      send?.({
        type: "collapsePanel",
        panelId: panelId,
        controlled: true,
        resolve,
      });
    });
  },
  isCollapsed: () =>
    Boolean(panelData.value?.collapsible && panelData.value?.collapsed),
  expand: async () => {
    if (!panelData.value?.collapsible) return;
    return await new Promise<void>((resolve) => {
      send?.({
        type: "expandPanel",
        panelId: panelId,
        controlled: true,
        resolve,
      });
    });
  },
  isExpanded: () =>
    Boolean(panelData.value?.collapsible && !panelData.value?.collapsed),
  getPixelSize: () => getPanelPixelSize(state!.value, panelId),
  getPercentageSize: () => getPanelPercentageSize(state!.value, panelId),
  setSize: (size) =>
    send?.({ type: "setPanelPixelSize", panelId: panelId, size }),
});

const isControlledCollapse = computed(
  () => panelData.value?.collapseIsControlled,
);

watchEffect(() => {
  // Subscribe to the collapsed prop (doesn't work in rAF)
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  props.collapsed;

  requestAnimationFrame(() => {
    if (!isControlledCollapse.value) return;
    if (props.collapsed) {
      send?.({ type: "collapsePanel", panelId: panelId, controlled: true });
    } else {
      send?.({ type: "expandPanel", panelId: panelId, controlled: true });
    }
  });
});

const computedProps = computed(() => {
  const currentPanel = panelData.value;

  return {
    ...attrs,
    ...getPanelDomAttributes({
      groupId: state?.value?.groupId,
      id: panelId,
      collapsible: currentPanel?.collapsible,
      collapsed: currentPanel?.collapsed,
    }),
    style: {
      minWidth: 0,
      minHeight: 0,
      overflow: "hidden",
    },
  };
});
</script>

<template>
  <div v-bind="computedProps">
    <slot />
  </div>
</template>
