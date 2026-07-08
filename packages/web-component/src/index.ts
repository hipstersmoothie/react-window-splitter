import {
  groupMachine,
  initializePanel,
  initializePanelHandleData,
  buildTemplate,
  getCursor,
  PanelHandleData,
  SendFn,
  GroupMachineContextValue,
  Unit,
  PixelUnit,
  isPanelData,
  getGroupSize,
  PanelData,
  Orientation,
  prepareSnapshot,
  getCollapsiblePanelForHandleId,
  OnResizeCallback,
  getPanelPixelSize,
  getPanelPercentageSize,
  getPanelGroupPixelSizes,
  getPanelGroupPercentageSizes,
  prepareItems,
  State,
  haveConstraintsChangedForPanel,
  haveConstraintsChangedForPanelHandle,
} from "@window-splitter/state";
import { html, LitElement, PropertyValues } from "lit";
import { property } from "lit/decorators.js";
import {
  getPanelDomAttributes,
  getPanelResizerDomAttributes,
  move,
  MoveEvents,
  SharedPanelProps,
} from "@window-splitter/interface";
import { consume, createContext, provide } from "@lit/context";

const isPrerenderContext = createContext<boolean>("isPrerender");
const sendContext = createContext<SendFn>("send");
const contextContext = createContext<GroupMachineContextValue>("context");
const stateContext = createContext<{ current: State }>("state");

let _id = 0;

const getNextId = () => {
  _id++;
  return `${_id}`;
};

function updateAttributes(
  element: HTMLElement,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  attributes: Record<string, any> | { style: Record<string, any> }
) {
  for (const attr of Object.keys(attributes)) {
    if (attr === "style") {
      for (const style of Object.keys(attributes[attr])) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (element.style as any)[style] = attributes[attr][style];
      }
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      element.setAttribute(attr, (attributes as any)[attr]);
    }
  }
}

export class PanelGroup extends LitElement {
  private observer: ResizeObserver;
  private cleanupChildrenObserver: () => void;
  private groupId: string;

  @property({ type: Number, reflect: true })
  shiftAmount?: number;
  @provide({ context: contextContext })
  private context: GroupMachineContextValue;
  @provide({ context: sendContext })
  private send: SendFn;
  @provide({ context: isPrerenderContext })
  private isPrerender = true;
  @provide({ context: stateContext })
  private state: { current: State };

  constructor() {
    super();

    this.observer = new ResizeObserver(() => {});
    this.cleanupChildrenObserver = () => {};

    const autosaveId = this.getAttribute("autosaveId");
    const autosaveStrategy =
      (this.getAttribute(
        "autosaveStrategy"
      ) as GroupMachineContextValue["autosaveStrategy"]) || "localStorage";

    this.groupId = this.getAttribute("id") || autosaveId || getNextId();

    let snapshot = this.getAttribute("snapshot");

    if (
      !snapshot &&
      typeof window !== "undefined" &&
      autosaveId &&
      autosaveStrategy === "localStorage"
    ) {
      const localSnapshot = localStorage.getItem(autosaveId);

      if (localSnapshot) {
        snapshot = localSnapshot;
      }
    }

    const [initialState, send, machineState] = groupMachine(
      {
        orientation:
          (this.getAttribute("orientation") as Orientation) || "horizontal",
        groupId: this.groupId,
        autosaveStrategy,
        shiftAmount: this.shiftAmount,
        ...(snapshot ? prepareSnapshot(JSON.parse(snapshot)) : undefined),
      },
      (s) => {
        const oldContext = this.context;
        this.context = s;

        if (oldContext.items.length !== s.items.length) {
          this.cleanupChildrenObserver?.();
          this.measureChildren();
        }

        this.requestUpdate();
      },
      () => this.renderRoot?.querySelector("div") ?? null
    );

    this.state = machineState;
    this.send = send;
    this.context = initialState;
  }

  public getId() {
    return this.groupId;
  }

  public getPixelSizes() {
    return getPanelGroupPixelSizes(this.context);
  }

  public getPercentageSizes() {
    return getPanelGroupPercentageSizes(this.context);
  }

  public getTemplate() {
    return buildTemplate({
      ...this.context,
      items: prepareItems(this.context),
    });
  }

  public getState() {
    return this.state.current === "idle" ? "idle" : "dragging";
  }

  public setSizes(updates: Unit[]) {
    for (let index = 0; index < updates.length; index++) {
      const item = this.context.items[index];
      const update = updates[index];

      if (item && isPanelData(item) && update) {
        this.send({
          type: "setPanelPixelSize",
          panelId: item.id,
          size: update,
        });
      }
    }
  }

  private measureSize() {
    if (this.observer) {
      this.observer.disconnect();
    }

    this.observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
        this.send({ type: "setSize", size: entry.contentRect });
        this.measureChildren();
        this.isPrerender = false;
      }
    });

    this.observer.observe(this.renderRoot.querySelector("div")!);
  }

  private measureChildren() {
    if (this.cleanupChildrenObserver) {
      this.cleanupChildrenObserver();
    }

    const childrenObserver = new ResizeObserver((childrenEntries) => {
      const childrenSizes: Record<string, { width: number; height: number }> =
        {};

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

      this.send({ type: "setActualItemsSize", childrenSizes });
    });

    if (!this.shadowRoot) return;

    const slot = this.shadowRoot.querySelector("slot");
    if (!slot) return;

    const elements = slot.assignedElements();

    for (const child of elements) {
      childrenObserver.observe(child);
    }

    this.cleanupChildrenObserver = () => {
      childrenObserver.disconnect();
    };
  }

  firstUpdated() {
    this.send({ type: "unlockGroup" });

    if (this.observer) {
      this.observer.disconnect();
    }

    this.measureSize();
    this.setAttribute("data-panel-group-wrapper", "");
    this.setAttribute("id", this.groupId);
  }

  disconnectedCallback() {
    this.observer?.disconnect();
    this.cleanupChildrenObserver?.();
    this.send({ type: "lockGroup" });
  }

  render() {
    const template =
      this.context.orientation === "horizontal"
        ? `grid-template-columns: ${buildTemplate(this.context)};`
        : `grid-template-rows: ${buildTemplate(this.context)}`;

    return html`
      <div style="display: grid;height: 100%;${template}">
        <slot></slot>
      </div>
    `;
  }
}

export class Panel extends LitElement {
  static observedContexts = ["send"];

  public onCollapseChange?: (newCollapsed: boolean, el: Panel) => void;
  public onResize?: OnResizeCallback;
  public collapseAnimation?: SharedPanelProps<boolean>["collapseAnimation"];

  @property({ type: Boolean, reflect: true })
  collapsed?: boolean;
  @property({ type: String, reflect: true })
  min?: string;
  @property({ type: String, reflect: true })
  max?: string;
  @property({ type: String, reflect: true })
  default?: string;
  @property({ type: Boolean, reflect: true })
  collapsible?: boolean;
  @property({ type: Boolean, reflect: true })
  defaultCollapsed?: boolean;
  @property({ type: String, reflect: true })
  collapsedSize?: string;
  @property({ type: Boolean, reflect: true })
  isStaticAtRest?: boolean;

  @consume({ context: contextContext })
  @property({ attribute: false })
  public context: GroupMachineContextValue;

  @consume({ context: sendContext })
  @property({ attribute: false })
  public send: SendFn;

  @consume({ context: isPrerenderContext })
  @property({ attribute: false })
  public isPrerender = true;

  id: string;

  constructor() {
    super();

    this.id ||= getNextId();
    this.send = () => {};
    this.context = {} as GroupMachineContextValue;
  }

  public async collapse() {
    if (!this.getPanelData()?.collapsible) return;
    return await new Promise<void>((resolve) => {
      this.send({
        type: "collapsePanel",
        panelId: this.id,
        controlled: true,
        resolve,
      });
    });
  }

  public isCollapsed() {
    return Boolean(
      this.getPanelData()?.collapsible && this.getPanelData()?.collapsed
    );
  }

  public async expand() {
    if (!this.getPanelData()?.collapsible) return;
    return await new Promise<void>((resolve) => {
      this.send({
        type: "expandPanel",
        panelId: this.id,
        controlled: true,
        resolve,
      });
    });
  }

  public isExpanded() {
    return Boolean(
      this.getPanelData()?.collapsible && !this.getPanelData()?.collapsed
    );
  }

  public getPixelSize() {
    return getPanelPixelSize(this.context, this.id);
  }

  public getPercentageSize() {
    return getPanelPercentageSize(this.context, this.id);
  }

  public setSize(size: Unit) {
    this.send({ type: "setPanelPixelSize", panelId: this.id, size });
  }

  private initPanel() {
    return initializePanel({
      id: this.id,
      min: this.getAttribute("min") as Unit | undefined,
      max: this.getAttribute("max") as Unit | undefined,
      collapsible: this.collapsible,
      collapsed: this.collapsed,
      collapsedSize: this.getAttribute("collapsedSize") as Unit | undefined,
      onCollapseChange: this.onCollapseChange
        ? { current: (e) => this.onCollapseChange?.(e, this) }
        : undefined,
      collapseAnimation: this.collapseAnimation,
      onResize: this.onResize ? { current: this.onResize } : undefined,
      defaultCollapsed: this.defaultCollapsed,
      default: this.default as Unit | undefined,
      isStaticAtRest: this.isStaticAtRest,
    });
  }

  private getPanelData() {
    return this.context?.items.find((item) => item.id === this.id) as
      | PanelData
      | undefined;
  }

  private getAttributes() {
    return {
      ...getPanelDomAttributes({
        groupId: this.context.groupId,
        id: this.id,
        collapsible: this.getAttribute("collapsible") === "true",
        collapsed:
          this.getAttribute("collapsed") === "true"
            ? true
            : this.getAttribute("collapsed") === "false"
              ? false
              : undefined,
      }),
      style: {
        minWidth: 0,
        minHeight: 0,
        overflow: "hidden",
      },
    };
  }

  protected firstUpdated(_changedProperties: PropertyValues): void {
    updateAttributes(this, this.getAttributes());

    if (this.getPanelData()) {
      this.send?.({
        type: "rebindPanelCallbacks",
        data: {
          id: this.id,
          onCollapseChange: this.onCollapseChange
            ? { current: (e) => this.onCollapseChange?.(e, this) }
            : undefined,
          onResize: this.onResize ? { current: this.onResize } : undefined,
        },
      });
    } else {
      if (this.isPrerender) {
        this.send({ type: "registerPanel", data: this.initPanel() });
      } else {
        const groupElement = this.closest("window-splitter");
        if (!groupElement) return;

        const order = Array.from(groupElement.children).indexOf(this);
        if (typeof order !== "number") return;

        this.send({
          type: "registerDynamicPanel",
          data: { ...this.initPanel(), order },
        });
      }
    }
  }

  disconnectedCallback(): void {
    requestAnimationFrame(() =>
      this.send({ type: "unregisterPanel", id: this.id })
    );
  }

  updated(changedProperties: PropertyValues) {
    if (changedProperties.has("collapsed")) {
      const isControlled = this.getPanelData()?.collapseIsControlled;

      if (isControlled) {
        if (this.collapsed) {
          this.send({
            type: "collapsePanel",
            panelId: this.id,
            controlled: true,
          });
        } else {
          this.send({
            type: "expandPanel",
            panelId: this.id,
            controlled: true,
          });
        }
      }
    }

    if (
      changedProperties.has("min") ||
      changedProperties.has("max") ||
      changedProperties.has("default") ||
      changedProperties.has("collapsible") ||
      changedProperties.has("collapsedSize") ||
      changedProperties.has("defaultCollapsed") ||
      changedProperties.has("isStaticAtRest")
    ) {
      const currentPanelData = this.getPanelData();

      if (
        currentPanelData &&
        haveConstraintsChangedForPanel(currentPanelData, this.initPanel())
      ) {
        this.send({ type: "updateConstraints", data: this.initPanel() });
      }
    }
  }

  render() {
    return html`<slot></slot>`;
  }
}

export class PanelResizer extends LitElement {
  static observedContexts = ["send"];

  public onDragStart?: () => void;
  public onDrag?: (e: Parameters<NonNullable<MoveEvents["onMove"]>>[0]) => void;
  public onDragEnd?: () => void;

  @consume({ context: contextContext })
  @property({ attribute: false })
  public context: GroupMachineContextValue;
  @consume({ context: sendContext })
  @property({ attribute: false })
  public send: SendFn;
  @consume({ context: isPrerenderContext })
  @property({ attribute: false })
  public isPrerender = true;

  @property({ type: String, reflect: true })
  size?: string;
  @property({ type: Boolean, reflect: true })
  disabled?: boolean;

  constructor() {
    super();

    this.id ||= getNextId();
    this.send = () => {};
    this.context = {} as GroupMachineContextValue;
  }

  private initPanelResizer() {
    return initializePanelHandleData({
      id: this.id,
      size: (this.getAttribute("size") as PixelUnit | undefined) || "0px",
    });
  }

  private getHandleData() {
    return this.context?.items.find((item) => item.id === this.id) as
      | PanelHandleData
      | undefined;
  }

  private getAttributes() {
    const handleIndex = this.context?.items.findIndex(
      (item) => item.id === this.id
    );

    const panelBeforeHandle =
      handleIndex !== undefined &&
      isPanelData(this.context?.items[handleIndex - 1])
        ? (this.context?.items[handleIndex - 1] as PanelData | undefined)
        : undefined;
    const handleData = this.getHandleData() || this.initPanelResizer();

    return {
      ...getPanelResizerDomAttributes({
        groupId: this.context?.groupId,
        id: this.id,
        orientation: this.context?.orientation || "horizontal",
        isDragging: this.context?.activeDragHandleId === this.id,
        activeDragHandleId: this.context?.activeDragHandleId,
        disabled: this.disabled,
        controlsId: panelBeforeHandle?.id,
        min: panelBeforeHandle?.min,
        max: panelBeforeHandle?.max,
        currentValue: panelBeforeHandle?.currentValue,
        groupSize: getGroupSize(this.context),
      }),
      tabIndex: this.disabled ? -1 : 0,
      style: {
        cursor: this.context ? getCursor(this.context) : undefined,
        width:
          this.context?.orientation === "horizontal"
            ? `${handleData.size.value.toNumber()}px`
            : "100%",
        height:
          this.context?.orientation === "vertical"
            ? `${handleData.size.value.toNumber()}px`
            : "100%",
      },
    };
  }

  protected firstUpdated(_changedProperties: PropertyValues): void {
    const { moveProps } = move({
      onMoveStart: () => {
        this.send({
          type: "dragHandleStart",
          handleId: this.id,
        });
        this.onDragStart?.();
        document.body.style.cursor = getCursor(this.context) || "auto";
      },
      onMove: (e) => {
        this.send({
          type: "dragHandle",
          handleId: this.id,
          value: e,
        });
        this.onDrag?.(e);
      },
      onMoveEnd: () => {
        this.send({ type: "dragHandleEnd", handleId: this.id });
        this.onDragEnd?.();
        document.body.style.cursor = "auto";
      },
    });

    this.addEventListener("pointerdown", (e) => {
      if (this.disabled) return;
      moveProps.onPointerDown(e);
    });
    this.addEventListener("keydown", (e) => {
      moveProps.onKeyDown(e);

      const collapsiblePanel = getCollapsiblePanelForHandleId(
        this.context,
        this.id
      );

      if (e.key === "Enter" && collapsiblePanel) {
        if (collapsiblePanel.collapsed) {
          this.send({ type: "expandPanel", panelId: collapsiblePanel.id });
        } else {
          this.send({ type: "collapsePanel", panelId: collapsiblePanel.id });
        }
      }
    });

    updateAttributes(this, this.getAttributes());

    if (!this.getHandleData()) {
      if (this.isPrerender) {
        this.send({
          type: "registerPanelHandle",
          data: this.initPanelResizer(),
        });
      } else {
        const groupElement = this.closest("window-splitter");
        if (!groupElement) return;

        const order = Array.from(groupElement.children).indexOf(this);
        if (typeof order !== "number") return;

        this.send({
          type: "registerPanelHandle",
          data: { ...this.initPanelResizer(), order },
        });
      }
    }
  }

  updated(changedProperties: PropertyValues) {
    if (changedProperties.has("size")) {
      const currentHandleData = this.getHandleData();

      if (
        currentHandleData &&
        haveConstraintsChangedForPanelHandle(
          currentHandleData,
          this.initPanelResizer()
        )
      ) {
        this.send({ type: "updateConstraints", data: this.initPanelResizer() });
      }
    }
  }

  disconnectedCallback(): void {
    requestAnimationFrame(() =>
      this.send({ type: "unregisterPanelHandle", id: this.id })
    );
  }

  render() {
    return html`<slot></slot>`;
  }
}
