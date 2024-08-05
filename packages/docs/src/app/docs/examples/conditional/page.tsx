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
        To conditionally render a panel you will need to provide a little more
        information to the panel. You can use the <InlineCode>order</InlineCode>{" "}
        prop to control the order of the panel once it's rendered.
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
