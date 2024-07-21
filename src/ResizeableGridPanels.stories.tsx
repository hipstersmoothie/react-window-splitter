import React from "react";
import {
  PanelGroup,
  PanelGroupProps,
  Panel,
  PanelProps,
  PanelResizer,
  PanelHandle,
  PanelGroupHandle,
  PanelResizerProps,
} from "./ResizeableGridPanels.jsx";

export default {
  title: "Components/ResizeableGridPanels",
};

function StyledPanelGroup(props: PanelGroupProps) {
  return (
    <PanelGroup
      {...props}
      style={{
        border: "1px solid rgba(0, 0, 0, 0.3)",
        background: "rgba(0, 0, 0, 0.1)",
        borderRadius: 12,
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
          padding: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
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

export function Simple() {
  return (
    <StyledPanelGroup>
      <StyledPanel>
        <div>Panel 1</div>
      </StyledPanel>
      <StyledResizer />
      <StyledPanel>
        <div>Panel 2</div>
      </StyledPanel>
    </StyledPanelGroup>
  );
}

export function Autosave() {
  return (
    <StyledPanelGroup autosaveId="autosave" autosaveStrategy="cookie">
      <StyledPanel id="1">
        <div>Panel 1</div>
      </StyledPanel>
      <StyledResizer id="resizer" />
      <StyledPanel id="2">
        <div>Panel 2</div>
      </StyledPanel>
    </StyledPanelGroup>
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

export function VerticalLayout() {
  return (
    <StyledPanelGroup orientation="vertical">
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

export function Collapsible() {
  const [collapsed, setCollapsed] = React.useState(true);

  return (
    <StyledPanelGroup>
      <StyledPanel
        min="100px"
        collapsible={true}
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
      <StyledResizer />
      <StyledPanel
        min="100px"
        collapsible={true}
        collapsedSize="60px"
        defaultCollapsed={true}
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

export function ImperativePanel() {
  const groupRef = React.useRef<PanelGroupHandle>(null);
  const panelRef = React.useRef<PanelHandle>(null);

  return (
    <>
      <StyledPanelGroup handle={groupRef}>
        <StyledPanel
          handle={panelRef}
          min="100px"
          collapsible={true}
          collapsedSize="60px"
        >
          <div>1</div>
        </StyledPanel>
        <StyledResizer />
        <StyledPanel min="100px">
          <div>2</div>
        </StyledPanel>
        <StyledResizer />
        <StyledPanel
          min="100px"
          collapsible={true}
          collapsedSize="60px"
          defaultCollapsed={true}
        >
          <div>3</div>
        </StyledPanel>
      </StyledPanelGroup>

      <div>
        <button
          onClick={() => alert(`Sizes: ${groupRef.current?.getPixelSizes()}`)}
        >
          Get pixel sizes
        </button>
        <button
          onClick={() =>
            alert(`Sizes: ${groupRef.current?.getPercentageSizes()}`)
          }
        >
          Get percent sizes
        </button>
        <button
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
        <button onClick={() => panelRef.current?.collapse()}>Collapse</button>
        <button
          onClick={() => alert(`Collapsed: ${panelRef.current?.isCollapsed()}`)}
        >
          Is Collapsed?
        </button>
        <button onClick={() => panelRef.current?.expand()}>Expand</button>
        <button
          onClick={() => alert(`Expanded: ${panelRef.current?.isExpanded()}`)}
        >
          Is Expanded?
        </button>
        <button onClick={() => alert(`Id: ${panelRef.current?.getId()}`)}>
          Get Id
        </button>
        <button
          onClick={() => alert(`Size: ${panelRef.current?.getPixelSize()}`)}
        >
          Get Pixel Size
        </button>
        <button
          onClick={() =>
            alert(`Percentage: ${panelRef.current?.getPercentageSize()}`)
          }
        >
          Get Percentage Size
        </button>
        <button onClick={() => panelRef.current?.setSize("30px")}>
          Set size to 100px
        </button>
        <button onClick={() => panelRef.current?.setSize("50%")}>
          Set size to 50%
        </button>
      </div>
    </>
  );
}

export function ConditionalPanel() {
  const [isExpanded, setIsExpanded] = React.useState(false);

  return (
    <>
      <StyledPanelGroup>
        <StyledPanel min="100px" collapsible={true} collapsedSize="60px">
          <div>1</div>
        </StyledPanel>
        <StyledResizer />
        <StyledPanel min="100px">
          <div>2</div>
        </StyledPanel>
        <StyledResizer />
        <StyledPanel min="100px">
          <div>3</div>
        </StyledPanel>
        {isExpanded && (
          <>
            <StyledResizer order={5} />
            <StyledPanel order={6} min="100px">
              expanded
              <button onClick={() => setIsExpanded(false)}>Close</button>
            </StyledPanel>
          </>
        )}
        <StyledResizer />
        <StyledPanel
          min="200px"
          collapsible={true}
          collapsedSize="60px"
          defaultCollapsed={true}
        >
          <div>4</div>
        </StyledPanel>
      </StyledPanelGroup>
      <button onClick={() => setIsExpanded(true)}>Expand</button>
    </>
  );
}
