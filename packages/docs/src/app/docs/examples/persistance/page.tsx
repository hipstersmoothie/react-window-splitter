import { CodeBlock } from "mdxts/components";
import { cookies } from "next/headers";
import { PersistanceExampleVisual } from "../../../../examples/PersistanceExampleVisual";
import {
  H1,
  H2,
  InlineCode,
  Paragraph,
  Wrapper,
} from "../../../../Components/Content";

export default async function Persistance() {
  const cookieStore = cookies();
  const persistedState = cookieStore.get("autosave");
  const snapshot = persistedState
    ? JSON.parse(persistedState.value)
    : undefined;

  return (
    <Wrapper>
      <H1>Persistance</H1>

      <Paragraph>
        You can persist the state of the layout by using the{" "}
        <InlineCode>autosaveId</InlineCode> prop on the{" "}
        <InlineCode>PanelGroup</InlineCode>. You muse also provide a unique{" "}
        <InlineCode>id</InlineCode> for each panel.
      </Paragraph>

      <div className="my-6">
        <PersistanceExampleVisual snapshot={snapshot} />
      </div>

      <CodeBlock
        source="../../../../examples/PersistanceExample.tsx"
        allowErrors={true}
        showToolbar={false}
      />

      <H2 id="cookie-storage">Cookie Storage</H2>

      <Paragraph>
        By default the layout will be persisted to{" "}
        <InlineCode>localStorage</InlineCode>. If you want to persist to
        <InlineCode>cookie</InlineCode> you can set{" "}
        <InlineCode>{"autosaveStrategy='cookie'"}</InlineCode>
      </Paragraph>

      <Paragraph>
        You will also need to read the state from the cookie in your server. In
        the following example we get the cookies in a Next.js App Router page.
      </Paragraph>

      <CodeBlock
        source="../../../../examples/PersistanceCookieExample.tsx"
        allowErrors={true}
        showToolbar={false}
      />
    </Wrapper>
  );
}
