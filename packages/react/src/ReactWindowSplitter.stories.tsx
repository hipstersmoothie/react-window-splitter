import React, { useCallback, useMemo, useRef, useState } from "react";
import { spring } from "framer-motion";
import {
  PanelGroup,
  PanelGroupProps,
  Panel,
  PanelProps,
  PanelResizer,
  PanelResizerProps,
} from "./ReactWindowSplitter.js";
import { PanelGroupHandle, PanelHandle } from "@window-splitter/interface";
import { PercentUnit } from "@window-splitter/state";

export default {
  title: "Components/React",
};

function StyledPanelGroup(props: PanelGroupProps) {
  return (
    <PanelGroup
      {...props}
      style={{
        border: "1px solid rgba(0, 0, 0, 0.3)",
        background: "rgba(0, 0, 0, 0.1)",
        borderRadius: 12,
        boxSizing: "border-box",
        ...props.style,
      }}
    />
  );
}

function StyledPanel({ children, ...props }: PanelProps) {
  return (
    <Panel
      style={{
        overflow: "hidden",
      }}
      {...props}
    >
      <div
        style={{
          height: "100%",
          width: "100%",
          padding: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          boxSizing: "border-box",
        }}
      >
        {children}
      </div>
    </Panel>
  );
}

function StyledResizer(props: PanelResizerProps) {
  return <PanelResizer size="10px" style={{ background: "red" }} {...props} />;
}

export function Simple({ handle }: { handle?: React.Ref<PanelGroupHandle> }) {
  return (
    <StyledPanelGroup handle={handle} style={{ height: 200 }}>
      <StyledPanel>Panel 1</StyledPanel>
      <StyledResizer />
      <StyledPanel min="100px">Panel 2</StyledPanel>
    </StyledPanelGroup>
  );
}

export function Autosave({ handle }: { handle?: React.Ref<PanelGroupHandle> }) {
  return (
    <StyledPanelGroup handle={handle} autosaveId="autosave-example">
      <StyledPanel id="1">Panel 1</StyledPanel>
      <StyledResizer id="resizer" />
      <StyledPanel id="2">Panel 2</StyledPanel>
    </StyledPanelGroup>
  );
}

export function AutosaveCollapsible({
  handle,
  onCollapseChange = console.log,
}: {
  handle?: React.Ref<PanelGroupHandle>;
  onCollapseChange?: (c: boolean) => void;
}) {
  return (
    <StyledPanelGroup handle={handle} autosaveId="autosave-example-2">
      <StyledPanel
        id="1"
        collapsible
        collapsedSize="100px"
        min="140px"
        onCollapseChange={onCollapseChange}
      >
        Collapsible
      </StyledPanel>
      <StyledResizer id="resizer" />
      <StyledPanel id="2">Panel 2</StyledPanel>
    </StyledPanelGroup>
  );
}

export function DynamicConstraints({
  handle,
}: {
  handle?: React.Ref<PanelGroupHandle>;
}) {
  const [customOn, setCustomOn] = React.useState(false);

  return (
    <>
      <StyledPanelGroup handle={handle}>
        <StyledPanel
          default="100px"
          {...(customOn ? { min: "200px" } : { min: "100px" })}
        >
          <div>Panel 1</div>
        </StyledPanel>
        <StyledResizer />
        <StyledPanel min="100px">
          <div>Panel 2</div>
        </StyledPanel>
        <StyledResizer />
        <StyledPanel
          {...(customOn ? { min: "100px" } : { min: "400px" })}
          {...(customOn ? { max: "300px" } : { max: "700px" })}
        >
          <div>Panel 3</div>
        </StyledPanel>
      </StyledPanelGroup>
      <button type="button" onClick={() => setCustomOn(!customOn)}>
        Toggle Custom
      </button>
    </>
  );
}

export function SimpleMin() {
  return (
    <StyledPanelGroup>
      <StyledPanel min="100px">
        <div>Panel 1</div>
      </StyledPanel>
      <StyledResizer />
      <StyledPanel min="100px">
        <div>Panel 2</div>
      </StyledPanel>
      <StyledResizer />
      <StyledPanel min="100px">
        <div>Panel 3</div>
      </StyledPanel>
    </StyledPanelGroup>
  );
}

export function SimpleMinMax() {
  return (
    <StyledPanelGroup>
      <StyledPanel min="100px" max="200px">
        <div>Panel 1</div>
      </StyledPanel>
      <StyledResizer />
      <StyledPanel min="100px">
        <div>Panel 2</div>
      </StyledPanel>
      <StyledResizer size="20px" />
      <StyledPanel min="100px">
        <div>Panel 3</div>
      </StyledPanel>
    </StyledPanelGroup>
  );
}

export function SimpleConstraints() {
  return (
    <StyledPanelGroup>
      <StyledPanel min="100px" max="50%">
        <div>Panel 1</div>
      </StyledPanel>
      <StyledResizer />
      <StyledPanel>
        <div>Panel 2</div>
      </StyledPanel>
    </StyledPanelGroup>
  );
}

export function HorizontalLayout() {
  return (
    <StyledPanelGroup orientation="horizontal">
      <StyledPanel default="30%" min="20%">
        left
      </StyledPanel>
      <StyledResizer />
      <StyledPanel min="20%">middle</StyledPanel>
      <StyledResizer />
      <StyledPanel default="30%" min="20%">
        right
      </StyledPanel>
    </StyledPanelGroup>
  );
}

export function VerticalLayout({
  handle,
}: {
  handle?: React.Ref<PanelGroupHandle>;
}) {
  return (
    <StyledPanelGroup
      handle={handle}
      orientation="vertical"
      style={{ height: 322 }}
    >
      <StyledPanel default="30%" min="20%">
        top
      </StyledPanel>
      <StyledResizer />
      <StyledPanel min="20%">middle</StyledPanel>
      <StyledResizer />
      <StyledPanel default="30%" min="20%">
        bottom
      </StyledPanel>
    </StyledPanelGroup>
  );
}

export function VerticalLayout2({
  handle,
}: {
  handle?: React.Ref<PanelGroupHandle>;
}) {
  return (
    <StyledPanelGroup
      handle={handle}
      orientation="vertical"
      style={{ height: "calc(100vh - 100px)" }}
    >
      <StyledPanel default="200px" min="200px">
        top
      </StyledPanel>
      <StyledResizer />
      <StyledPanel
        min="200px"
        collapsedSize="60px"
        defaultCollapsed
        collapsible
      >
        middle
      </StyledPanel>
    </StyledPanelGroup>
  );
}

export function NestedGroups() {
  return (
    <PanelGroup
      orientation="horizontal"
      style={{
        border: "1px solid rgba(0, 0, 0, 0.3)",
        borderRadius: 12,
        height: 400,
      }}
    >
      <Panel min="10%">left</Panel>
      <StyledResizer />
      <Panel min="10%">
        <PanelGroup orientation="vertical">
          <Panel min="10%">top</Panel>
          <StyledResizer />
          <Panel min="10%">
            <PanelGroup orientation="horizontal">
              <Panel min="20%">left</Panel>
              <StyledResizer />
              <Panel min="20%">right</Panel>
            </PanelGroup>
          </Panel>
        </PanelGroup>
      </Panel>
      <StyledResizer />
      <Panel min="10%">right</Panel>
    </PanelGroup>
  );
}

export function WithOverflow() {
  return (
    <StyledPanelGroup style={{ height: 400 }}>
      <Panel min="200px">
        <div
          style={{
            overflow: "auto",
            padding: 40,
            height: "100%",
            boxSizing: "border-box",
          }}
        >
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec
            euismod, nisl eget ultricies ultrices, nunc nisi aliquam nisi, eu
            tincidunt nisl nisl eu nisl. Sed euismod, nisl eget ultricies
            ultrices, nunc nisi aliquam nisi, eu tincidunt nisl nisl eu nisl.
            Sed euismod, nisl eget ultricies ultrices, nunc nisi aliquam nisi,
            eu tincidunt nisl nisl eu nisl.
          </p>
          <p>
            Sed euismod, nisl eget ultricies ultrices, nunc nisi aliquam nisi,
            eu tincidunt nisl nisl eu nisl. Sed euismod, nisl eget ultricies
            ultrices, nunc nisi aliquam nisi, eu tincidunt nisl nisl eu nisl.
            Sed euismod, nisl eget ultricies ultrices, nunc nisi aliquam nisi,
            eu tincidunt nisl nisl eu nisl.
          </p>
          <p>
            Sed euismod, nisl eget ultricies ultrices, nunc nisi aliquam nisi,
            eu tincidunt nisl nisl eu nisl. Sed euismod, nisl eget ultricies
            ultrices, nunc nisi aliquam nisi, eu tincidunt nisl nisl eu nisl.
            Sed euismod, nisl eget ultricies ultrices, nunc nisi aliquam nisi,
            eu tincidunt nisl nisl eu nisl.
          </p>
          <p>
            Sed euismod, nisl eget ultricies ultrices, nunc nisi aliquam nisi,
            eu tincidunt nisl nisl eu nisl. Sed euismod, nisl eget ultricies
            ultrices, nunc nisi aliquam nisi, eu tincidunt nisl nisl eu nisl.
            Sed euismod, nisl eget ultricies ultrices, nunc nisi aliquam nisi,
            eu tincidunt nisl nisl eu nisl.
          </p>
          <p>
            Sed euismod, nisl eget ultricies ultrices, nunc nisi aliquam nisi,
            eu tincidunt nisl nisl eu nisl. Sed euismod, nisl eget ultricies
            ultrices, nunc nisi aliquam nisi, eu tincidunt nisl nisl eu nisl.
            Sed euismod, nisl eget ultricies ultrices, nunc nisi aliquam nisi,
            eu tincidunt nisl nisl eu nisl.
          </p>
        </div>
      </Panel>
      <StyledResizer />
      <Panel min="200px">
        <div
          style={{
            overflow: "auto",
            padding: 40,
            height: "100%",
            boxSizing: "border-box",
          }}
        >
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec
            euismod, nisl eget ultricies ultrices, nunc nisi aliquam nisi, eu
            tincidunt nisl nisl eu nisl. Sed euismod, nisl eget ultricies
            ultrices, nunc nisi aliquam nisi, eu tincidunt nisl nisl eu nisl.
            Sed euismod, nisl eget ultricies ultrices, nunc nisi aliquam nisi,
            eu tincidunt nisl nisl eu nisl.
          </p>
          <p>
            Sed euismod, nisl eget ultricies ultrices, nunc nisi aliquam nisi,
            eu tincidunt nisl nisl eu nisl. Sed euismod, nisl eget ultricies
            ultrices, nunc nisi aliquam nisi, eu tincidunt nisl nisl eu nisl.
            Sed euismod, nisl eget ultricies ultrices, nunc nisi aliquam nisi,
            eu tincidunt nisl nisl eu nisl.
          </p>
          <p>
            Sed euismod, nisl eget ultricies ultrices, nunc nisi aliquam nisi,
            eu tincidunt nisl nisl eu nisl. Sed euismod, nisl eget ultricies
            ultrices, nunc nisi aliquam nisi, eu tincidunt nisl nisl eu nisl.
            Sed euismod, nisl eget ultricies ultrices, nunc nisi aliquam nisi,
            eu tincidunt nisl nisl eu nisl.
          </p>
          <p>
            Sed euismod, nisl eget ultricies ultrices, nunc nisi aliquam nisi,
            eu tincidunt nisl nisl eu nisl. Sed euismod, nisl eget ultricies
            ultrices, nunc nisi aliquam nisi, eu tincidunt nisl nisl eu nisl.
            Sed euismod, nisl eget ultricies ultrices, nunc nisi aliquam nisi,
            eu tincidunt nisl nisl eu nisl.
          </p>
          <p>
            Sed euismod, nisl eget ultricies ultrices, nunc nisi aliquam nisi,
            eu tincidunt nisl nisl eu nisl. Sed euismod, nisl eget ultricies
            ultrices, nunc nisi aliquam nisi, eu tincidunt nisl nisl eu nisl.
            Sed euismod, nisl eget ultricies ultrices, nunc nisi aliquam nisi,
            eu tincidunt nisl nisl eu nisl.
          </p>
        </div>
      </Panel>
    </StyledPanelGroup>
  );
}

export function Collapsible({
  leftPanelHandle,
  rightPanelHandle,
  handle,
}: {
  leftPanelHandle?: React.Ref<PanelHandle>;
  handle?: React.Ref<PanelGroupHandle>;
  rightPanelHandle?: React.Ref<PanelHandle>;
}) {
  const [collapsed, setCollapsed] = React.useState(true);

  return (
    <StyledPanelGroup handle={handle}>
      <StyledPanel
        handle={leftPanelHandle}
        min="100px"
        collapsible
        collapsedSize="60px"
        style={{ border: "10px solid green", boxSizing: "border-box" }}
        onCollapseChange={(isCollapsed) => {
          console.log("COLLAPSE PASSIVE", isCollapsed);
        }}
      >
        <div>1</div>
      </StyledPanel>
      <StyledResizer />
      <StyledPanel min="100px">
        <div>2</div>
      </StyledPanel>
      <StyledResizer id="resizer-2" />
      <StyledPanel
        handle={rightPanelHandle}
        min="100px"
        collapsible
        collapsedSize="60px"
        defaultCollapsed
        collapseAnimation={{ easing: "bounce", duration: 1000 }}
        style={{ border: "10px solid blue", boxSizing: "border-box" }}
        collapsed={collapsed}
        onCollapseChange={(isCollapsed) => {
          console.log("COLLAPSE CONTROLLED", isCollapsed);
          setCollapsed(isCollapsed);
        }}
      >
        <div>3</div>
      </StyledPanel>
    </StyledPanelGroup>
  );
}

export function CustomCollapseAnimation() {
  const springFn = useMemo(() => {
    return spring({
      keyframes: [0, 1],
      velocity: 1,
      stiffness: 100,
      damping: 10,
      mass: 1.0,
    });
  }, []);

  return (
    <StyledPanelGroup>
      <StyledPanel
        min="100px"
        collapsible
        collapsedSize="60px"
        style={{ border: "10px solid green", boxSizing: "border-box" }}
      >
        1
      </StyledPanel>
      <StyledResizer />
      <StyledPanel min="100px">2</StyledPanel>
      <StyledResizer />
      <StyledPanel
        style={{ border: "10px solid blue", boxSizing: "border-box" }}
        min="100px"
        collapsible
        collapsedSize="60px"
        defaultCollapsed
        collapseAnimation={{
          easing: (t) => springFn.next(t * 1000).value,
          duration: 1000,
        }}
      >
        3
      </StyledPanel>
    </StyledPanelGroup>
  );
}

export function ImperativePanel() {
  const groupRef = React.useRef<PanelGroupHandle>(null);
  const panelRef = React.useRef<PanelHandle>(null);

  return (
    <>
      <StyledPanelGroup handle={groupRef}>
        <StyledPanel
          handle={panelRef}
          min="100px"
          collapsible
          collapsedSize="60px"
        >
          1
        </StyledPanel>
        <StyledResizer />
        <StyledPanel min="100px">2</StyledPanel>
        <StyledResizer />
        <StyledPanel
          min="100px"
          collapsible
          collapsedSize="60px"
          defaultCollapsed
        >
          3
        </StyledPanel>
      </StyledPanelGroup>

      <div>
        <button
          type="button"
          onClick={() => alert(`Sizes: ${groupRef.current?.getPixelSizes()}`)}
        >
          Get pixel sizes
        </button>
        <button
          type="button"
          onClick={() =>
            alert(`Sizes: ${groupRef.current?.getPercentageSizes()}`)
          }
        >
          Get percent sizes
        </button>
        <button
          type="button"
          onClick={() =>
            groupRef.current?.setSizes([
              "200px",
              "10px",
              "50%",
              "10px",
              "150px",
            ])
          }
        >
          Override sizes
        </button>
      </div>

      <div>
        <button type="button" onClick={() => panelRef.current?.collapse()}>
          Collapse
        </button>
        <button
          type="button"
          onClick={() => alert(`Collapsed: ${panelRef.current?.isCollapsed()}`)}
        >
          Is Collapsed?
        </button>
        <button type="button" onClick={() => panelRef.current?.expand()}>
          Expand
        </button>
        <button
          type="button"
          onClick={() => alert(`Expanded: ${panelRef.current?.isExpanded()}`)}
        >
          Is Expanded?
        </button>
        <button
          type="button"
          onClick={() => alert(`Id: ${panelRef.current?.getId()}`)}
        >
          Get Id
        </button>
        <button
          type="button"
          onClick={() => alert(`Size: ${panelRef.current?.getPixelSize()}`)}
        >
          Get Pixel Size
        </button>
        <button
          type="button"
          onClick={() =>
            alert(`Percentage: ${panelRef.current?.getPercentageSize()}`)
          }
        >
          Get Percentage Size
        </button>
        <button type="button" onClick={() => panelRef.current?.setSize("30px")}>
          Set size to 100px
        </button>
        <button type="button" onClick={() => panelRef.current?.setSize("50%")}>
          Set size to 50%
        </button>
      </div>
    </>
  );
}

export function ConditionalPanel({
  handle,
}: {
  handle?: React.Ref<PanelGroupHandle>;
}) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  return (
    <React.StrictMode>
      <StyledPanelGroup handle={handle}>
        <StyledPanel id="panel-1" min="100px" collapsible collapsedSize="60px">
          <div>1</div>
        </StyledPanel>
        <StyledResizer id="handle-1" />
        <StyledPanel id="panel-2" min="100px">
          <div>2</div>
        </StyledPanel>
        {isExpanded && (
          <>
            <StyledResizer id="handle-2" />
            <StyledPanel id="panel-3" min="100px">
              3
              <button type="button" onClick={() => setIsExpanded(false)}>
                Close
              </button>
            </StyledPanel>
          </>
        )}
      </StyledPanelGroup>
      <button type="button" onClick={() => setIsExpanded(true)}>
        Expand
      </button>
    </React.StrictMode>
  );
}

export function ConditionalPanelComplex() {
  const [isExpanded, setIsExpanded] = React.useState(false);

  return (
    <React.StrictMode>
      <StyledPanelGroup>
        <StyledPanel id="panel-1" min="100px" collapsible collapsedSize="60px">
          <div>1</div>
        </StyledPanel>
        <StyledResizer id="handle-1" />
        <StyledPanel id="panel-2" min="100px">
          <div>2</div>
        </StyledPanel>
        <StyledResizer id="handle-2" />
        <StyledPanel id="panel-3" min="100px">
          <div>3</div>
        </StyledPanel>
        {isExpanded && (
          <>
            <StyledResizer id="handle-3" />
            <StyledPanel id="panel-4" min="100px">
              expanded
              <button type="button" onClick={() => setIsExpanded(false)}>
                Close
              </button>
            </StyledPanel>
          </>
        )}
        <StyledResizer id="handle-4" />
        <StyledPanel
          min="200px"
          collapsible
          collapsedSize="60px"
          defaultCollapsed
          id="panel-5"
        >
          <div>4</div>
        </StyledPanel>
      </StyledPanelGroup>
      <button type="button" onClick={() => setIsExpanded(true)}>
        Expand
      </button>
    </React.StrictMode>
  );
}

export function WithDefaultWidth() {
  return (
    <PanelGroup style={{ height: "400px" }} autosaveId="with-default-width">
      <Panel style={{ backgroundColor: "#333366" }} />
      <PanelResizer size="3px" />
      {/* I expected the right panel to be 100px wide */}
      <Panel
        default="100px"
        min="100px"
        max="400px"
        style={{ backgroundColor: "#ff3366" }}
      />
    </PanelGroup>
  );
}

export function StaticAtRest({
  handle,
}: {
  handle?: React.Ref<PanelGroupHandle>;
}) {
  return (
    <StyledPanelGroup handle={handle} style={{ height: 200 }}>
      <StyledPanel min="100px" max="300px" isStaticAtRest>
        Panel 1
      </StyledPanel>
      <StyledResizer />
      <StyledPanel min="100px">Panel 2</StyledPanel>
      <StyledResizer />
      <StyledPanel min="100px">Panel 3</StyledPanel>
    </StyledPanelGroup>
  );
}

function Flex({
  direction = "row",
  gap = "0x",
  align = "start",
  justify = "start",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  direction?: "row" | "column";
  gap?: string;
  align?: "center" | "start" | "end";
  justify?: "center" | "start" | "end" | "between";
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: direction,
        gap,
        alignItems: align,
        justifyContent: justify === "between" ? "space-between" : justify,
      }}
      {...props}
    />
  );
}

export function SiblingCollapsiblePanels() {
  const sidebarHandle = useRef<PanelHandle>(null);
  const editorHandle = useRef<PanelHandle>(null);
  const previewHandle = useRef<PanelHandle>(null);
  const [editModeSize, setEditModeSize] = useState<number[] | undefined>();
  const panelGroupRef = useRef<PanelGroupHandle>(null);
  const [isEditMode, setIsEditMode] = useState(true);

  const handleEditModeToggle = useCallback(async () => {
    const newMode = !isEditMode;
    setIsEditMode(newMode);

    if (!newMode) {
      setEditModeSize(panelGroupRef.current?.getPercentageSizes());

      await sidebarHandle.current?.collapse();
      await editorHandle.current?.collapse();
      await previewHandle.current?.expand();
    } else {
      if (editModeSize) {
        panelGroupRef.current?.setSizes(
          editModeSize.map((i) => `${i * 100}%` as PercentUnit),
        );
      }

      await sidebarHandle.current?.expand();
      await editorHandle.current?.expand();
      await previewHandle.current?.expand();
    }
  }, [editModeSize, isEditMode]);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(!isEditMode);
  const [isEditorCollapsed, setIsEditorCollapsed] = useState(!isEditMode);
  const [isPreviewCollapsed, setIsPreviewCollapsed] = useState(false);

  const handleSidebarCollapseChange = useCallback(
    (isCollapsed: boolean) => {
      if (isEditMode) {
        setIsSidebarCollapsed(isCollapsed);
      }
    },
    [isEditMode],
  );
  const handleEditorCollapseChange = useCallback(
    (isCollapsed: boolean) => {
      if (isEditMode) {
        setIsEditorCollapsed(isCollapsed);
      }
    },
    [isEditMode],
  );
  const handlePreviewCollapseChange = useCallback(
    (isCollapsed: boolean) => {
      if (isEditMode) {
        setIsPreviewCollapsed(isCollapsed);
      }
    },
    [isEditMode],
  );

  return (
    <Flex direction="column" style={{ height: "90vh", width: "800px" }}>
      <StyledPanelGroup handle={panelGroupRef}>
        <StyledPanel
          handle={sidebarHandle}
          id="sidebar"
          min="100px"
          default="200px"
          collapsible
          collapsed={isSidebarCollapsed}
          // collapseAnimation="ease-in-out"
          onCollapseChange={handleSidebarCollapseChange}
        >
          <Flex
            align="center"
            justify="center"
            style={{ height: "100%", width: "100%" }}
          >
            Sidebar
          </Flex>
        </StyledPanel>
        <StyledResizer id="resizer-1" />
        <StyledPanel
          handle={editorHandle}
          id="editor"
          min="100px"
          default="200px"
          collapsible
          collapsed={isEditorCollapsed}
          // collapseAnimation="ease-in-out"
          onCollapseChange={handleEditorCollapseChange}
        >
          <Flex
            align="center"
            justify="center"
            style={{ height: "100%", width: "100%" }}
          >
            Editor
          </Flex>
        </StyledPanel>
        <StyledResizer id="resizer-2" />
        <StyledPanel
          handle={previewHandle}
          id="preview"
          min="100px"
          collapsible
          collapsed={isPreviewCollapsed}
          // collapseAnimation="ease-in-out"
          onCollapseChange={handlePreviewCollapseChange}
        >
          <Flex
            align="center"
            justify="center"
            style={{ height: "100%", width: "100%" }}
          >
            Preview
          </Flex>
        </StyledPanel>
      </StyledPanelGroup>
      <Flex align="center" justify="between">
        <Flex gap="2px">
          <button
            disabled={!isEditMode}
            type="button"
            onClick={() =>
              setIsSidebarCollapsed(
                (prevSidebarCollapsed) => !prevSidebarCollapsed,
              )
            }
            style={{
              backgroundColor: isSidebarCollapsed ? "blue" : undefined,
            }}
          >
            {isSidebarCollapsed ? "Open sidebar" : "Close sidebar"}
          </button>
          <button
            disabled={!isEditMode}
            type="button"
            onClick={() =>
              setIsEditorCollapsed(
                (prevEditorCollapsed) => !prevEditorCollapsed,
              )
            }
            style={{
              backgroundColor: isEditorCollapsed ? "blue" : undefined,
            }}
          >
            {isEditorCollapsed ? "Open editor" : "Close editor"}
          </button>
          <button
            disabled={!isEditMode}
            type="button"
            onClick={() =>
              setIsPreviewCollapsed(
                (prevPreviewCollapsed) => !prevPreviewCollapsed,
              )
            }
            style={{
              backgroundColor: isPreviewCollapsed ? "blue" : undefined,
            }}
          >
            {isPreviewCollapsed ? "Open preview" : "Close preview"}
          </button>
        </Flex>
        <Flex gap="8px">
          <button
            type="button"
            onClick={handleEditModeToggle}
            style={{
              backgroundColor: isEditMode ? "blue" : undefined,
            }}
          >
            Edit mode
          </button>
        </Flex>
      </Flex>
    </Flex>
  );
}

export function Admin({ handle }: { handle?: React.Ref<PanelGroupHandle> }) {
  const [showTraces, setShowTraces] = useState(false);
  const [chatCollapsed, setChatCollapsed] = useState(false);

  return (
    <>
      <PanelGroup handle={handle} style={{ height: "calc(100vh - 100px)" }}>
        {!showTraces && (
          <>
            <Panel
              style={{ backgroundColor: "red" }}
              min="200px"
              max="240px"
              id="sidebar"
            >
              <div>Sidebar</div>
            </Panel>
            <PanelResizer size="3px" id="sidebar-resizer" />
            <Panel style={{ backgroundColor: "blue" }} min="250px" id="main">
              <div>Main</div>
            </Panel>
            <PanelResizer size="3px" id="main-resizer" />
          </>
        )}

        <Panel
          style={{ backgroundColor: "#333366" }}
          min="33%"
          collapsible
          collapsedSize="8px"
          id="chat"
          collapsed={chatCollapsed}
          onCollapseChange={setChatCollapsed}
        >
          <div>Chat</div>
        </Panel>

        {showTraces && (
          <>
            <PanelResizer size="3px" id="details-resizer" />
            <Panel
              style={{ backgroundColor: "green" }}
              default="33%"
              min="100px"
              id="details"
            >
              <div>Details</div>
            </Panel>
            <PanelResizer size="3px" id="traces-resizer" />
            <Panel
              style={{ backgroundColor: "yellow" }}
              default="33%"
              min="100px"
              id="traces"
            >
              <div>Traces</div>
            </Panel>
          </>
        )}
      </PanelGroup>

      <button type="button" onClick={() => setShowTraces(!showTraces)}>
        {showTraces ? "Hide traces" : "Show traces"}
      </button>
    </>
  );
}
