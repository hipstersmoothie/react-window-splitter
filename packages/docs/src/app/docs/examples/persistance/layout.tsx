import { CodeBlock } from "mdxts/components";
import { H1, H2, InlineCode, Paragraph } from "../../../../Components/Content";
import { Suspense } from "react";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import PersistanceExampleCode from "!!raw-loader!./PersistanceExample";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import PersistanceCookieExampleCode from "!!raw-loader!./PersistanceCookieExample";

export default async function Persistance({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <H1>Persistance</H1>

      <Paragraph>
        You can persist the state of the layout by using the{" "}
        <InlineCode>autosaveId</InlineCode> prop on the{" "}
        <InlineCode>PanelGroup</InlineCode>. You muse also provide a unique{" "}
        <InlineCode>id</InlineCode> for each panel.
      </Paragraph>

      <div className="my-6">
        <Suspense fallback={<div style={{ height: 200 }} />}>
          {children}
        </Suspense>
      </div>

      <CodeBlock
        value={PersistanceExampleCode}
        language="tsx"
        allowErrors
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
        value={PersistanceCookieExampleCode}
        language="tsx"
        allowErrors
        showToolbar={false}
      />
    </>
  );
}
