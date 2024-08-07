import {
  H1,
  InlineCode,
  Paragraph,
  Wrapper,
} from "../../../../Components/Content";
import { ConditionalExample } from "./ConditionalExample";
import { CodeBlock } from "mdxts/components";

export default function Conditional() {
  return (
    <Wrapper>
      <H1>Conditional Panels</H1>
      <Paragraph>
        To conditionally render a panel you must provide the{" "}
        <InlineCode>id</InlineCode> prop to all of the panels in the group.
      </Paragraph>
      <div className="my-6">
        <ConditionalExample />
      </div>
      <div className="my-6">
        <CodeBlock
          source="../../../../examples/ConditionalExample.tsx"
          allowErrors={true}
          showToolbar={false}
        />
      </div>
    </Wrapper>
  );
}
