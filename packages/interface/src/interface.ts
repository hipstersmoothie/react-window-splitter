import {
  Constraints,
  getUnitPercentageValue,
  GroupMachineContextValue,
  OnResizeCallback,
  PanelData,
  ParsedUnit,
  PixelUnit,
  Rect,
  Unit,
} from "@window-splitter/state";

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
  /** Get the template for the group in pixels. Useful for testing */
  getTemplate: () => string;
  getState: () => "idle" | "dragging";
}

export interface SharedPanelGroupProps
  extends Partial<
    Pick<
      GroupMachineContextValue,
      "orientation" | "autosaveStrategy" | "shiftAmount"
    >
  > {
  /** Persisted state to initialized the machine with */
  snapshot?: GroupMachineContextValue;
  /** An id to use for autosaving the layout */
  autosaveId?: string;
}

export interface PanelHandle {
  /** Collapse the panel */
  collapse: () => Promise<void>;
  /** Returns true if the panel is collapsed */
  isCollapsed: () => boolean;
  /** Expand the panel */
  expand: () => Promise<void>;
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
export interface SharedPanelProps<CollapsValue>
  extends Constraints<Unit>,
    Pick<PanelData, "collapseAnimation"> {
  /** Callback called when the panel is resized */
  onResize?: OnResizeCallback;
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
  collapsed?: CollapsValue;
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
}

export function getPanelDomAttributes({
  groupId,
  id,
  collapsible,
  collapsed,
}: {
  groupId: string | undefined;
  id: string;
  collapsible: boolean | undefined;
  collapsed: boolean | undefined;
}) {
  const attrs: Record<string, string | boolean | undefined> = {
    id: id,
    "data-splitter-group-id": groupId,
    "data-splitter-type": "panel",
    "data-splitter-id": id,
  };

  if (collapsible) {
    attrs["data-collapsed"] = collapsed;
  }

  return attrs;
}

export interface SharedPanelResizerProps
  extends Partial<Pick<PanelHandle, "setSize">> {
  /** If the handle is disabled */
  disabled?: boolean;
  /** The size of the handle */
  size?: PixelUnit;
  /** Called when the user starts dragging the handle */
  onDragStart?: () => void;
  /** Called when the user drags the handle */
  onDrag?: () => void;
  /** Called when the user stops dragging the handle */
  onDragEnd?: () => void;
}

export function getPanelResizerDomAttributes({
  groupId,
  id,
  orientation,
  isDragging,
  activeDragHandleId,
  disabled,
  controlsId,
  min,
  max,
  currentValue,
  groupSize,
}: {
  groupId: string | undefined;
  id: string;
  orientation: "horizontal" | "vertical";
  isDragging: boolean;
  activeDragHandleId: string | undefined;
  disabled: boolean | undefined;
  controlsId: string | undefined;
  min: ParsedUnit | undefined;
  max: ParsedUnit | "1fr" | undefined;
  currentValue: ParsedUnit | undefined;
  groupSize: number;
}) {
  return {
    id: id,
    role: "separator" as const,
    "data-splitter-type": "handle",
    "data-splitter-id": id,
    "data-splitter-group-id": groupId,
    "data-handle-orientation": orientation,
    "data-state": isDragging
      ? "dragging"
      : activeDragHandleId
        ? "inactive"
        : "idle",
    "aria-label": "Resize Handle",
    "aria-disabled": disabled,
    "aria-controls": controlsId,
    "aria-valuemin": min ? getUnitPercentageValue(groupSize, min) : undefined,
    "aria-valuemax":
      max === "1fr"
        ? 100
        : max
          ? getUnitPercentageValue(groupSize, max)
          : undefined,
    "aria-valuenow": currentValue
      ? getUnitPercentageValue(groupSize, currentValue)
      : undefined,
  };
}

export function measureGroupChildren(
  groupId: string,
  cb: (childrenSizes: Record<string, Rect>) => void,
) {
  const childrenObserver = new ResizeObserver((childrenEntries) => {
    const childrenSizes: Record<string, { width: number; height: number }> = {};

    for (const childEntry of childrenEntries) {
      const child = childEntry.target as HTMLElement;
      const childId = child.getAttribute("data-splitter-id");
      const childSize = childEntry.borderBoxSize[0];

      if (childId && childSize) {
        childrenSizes[childId] = {
          width: childSize.inlineSize,
          height: childSize.blockSize,
        };
      }
    }

    cb(childrenSizes);
  });

  const c = document.querySelectorAll(`[data-splitter-group-id="${groupId}"]`);

  for (const child of c) {
    childrenObserver.observe(child);
  }

  return () => {
    childrenObserver.disconnect();
  };
}
