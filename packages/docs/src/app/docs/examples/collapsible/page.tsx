import {
  ColorfulPanel,
  ColorfulPanelGroup,
  ColorfulPanelResizer,
} from "../../../../Components/ColorfulPanels";
import {
  H1,
  H2,
  InlineCode,
  Paragraph,
  StyledLink,
  Wrapper,
} from "../../../../Components/Content";
import { CodeBlock } from "mdxts/components";

export default function Collapsible() {
  return (
    <Wrapper>
      <H1>Collapsible</H1>
      <Paragraph>
        You can mark a panel as collapsible by using the{" "}
        <InlineCode>collapsible</InlineCode> prop. By default the panel will
        collapse to <InlineCode>0px</InlineCode> when collapsed. You can control
        this by using the <InlineCode>collapsedSize</InlineCode> prop.
      </Paragraph>
      <ColorfulPanelGroup style={{ height: 200 }}>
        <ColorfulPanel
          id="1"
          color="green"
          collapsible={true}
          collapsedSize="100px"
          min="150px"
          max="400px"
          className="[&[data-collapsed='true']]:bg-purple-ui [&[data-collapsed='true']]:border-purple-9 dark:[&[data-collapsed='true']]:border-purpledark-9"
        />
        <ColorfulPanelResizer id="2" />
        <ColorfulPanel color="red" min="130px" id="3" />
      </ColorfulPanelGroup>
      <div className="my-6">
        <CodeBlock
          source="../../../../examples/CollapsibleExample.tsx"
          allowErrors={true}
          showToolbar={false}
        />
      </div>
      <H2>Default Collapsed</H2>
      <Paragraph>
        If you want the panel to start collapsed by default you can use the{" "}
        <InlineCode>defaultCollapsed</InlineCode> prop.
      </Paragraph>
      <ColorfulPanelGroup style={{ height: 200 }}>
        <ColorfulPanel
          id="1"
          color="green"
          collapsible={true}
          defaultCollapsed={true}
          collapsedSize="100px"
          min="130px"
          max="400px"
          className="[&[data-collapsed='true']]:bg-purple-ui [&[data-collapsed='true']]:border-purple-9 dark:[&[data-collapsed='true']]:border-purpledark-9"
        />
        <ColorfulPanelResizer id="2" />
        <ColorfulPanel color="red" min="130px" id="3" />
      </ColorfulPanelGroup>
      <H2>Controlled</H2>
      <Paragraph>
        If you want to control the collapsed state of the panel you can use the{" "}
        <StyledLink href="/docs/example/imperative">imperative API</StyledLink>{" "}
        or you can have full control over the collapsed state by using the{" "}
        <InlineCode>collapsed</InlineCode> and{" "}
        <InlineCode>onCollapseChange</InlineCode> props.
      </Paragraph>
      <div className="my-6">
        <CodeBlock
          source="../../../../examples/CollapsibleControlledExample.tsx"
          allowErrors={true}
          showToolbar={false}
        />
      </div>
    </Wrapper>
  );
}
