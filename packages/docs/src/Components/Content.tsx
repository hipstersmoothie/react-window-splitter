import { MDXContent, CodeBlock } from "mdxts/components";

export function TableHeader({ children }: { children: React.ReactNode }) {
  return (
    <th
      className="
      text-sm
      text-left
      font-bold
      py-1 px-2
      border-b border-gray-dim
    "
    >
      {children}
    </th>
  );
}

export function Table({ children }: { children: React.ReactNode }) {
  return (
    <table className="border-4 border-gray-normal rounded my-6">
      {children}
    </table>
  );
}

export function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      className={`
        ${className}
        py-2 px-2
        border-b border-gray-dim
      `}
      {...props}
    />
  );
}

export function InlineCode({ className, ...props }: any) {
  if (className?.includes("language-")) {
    const [, language] = className.match(/language-(.*)/) || [];
    return (
      <CodeBlock
        className={{ container: "py-4" }}
        value={props.children}
        language={language}
      />
    );
  }

  return (
    <code
      className={`
        font-mono text-gray-normal
        bg-gray-4 dark:bg-graydark-4
        rounded px-2 py-0.5
        ${!className?.includes("text-") && "text-sm group-data-[heading='1']:text-3xl"}
        ${className}
      `}
      {...props}
    />
  );
}

export function H1({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="group text-4xl mb-6 group" data-heading="1">
      {children}
    </h1>
  );
}

export function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="text-2xl my-6">{children}</h2>;
}

export function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="text-xl my-6">{children}</h3>;
}

export function Paragraph({ children }: { children: React.ReactNode }) {
  return <p className="my-6">{children}</p>;
}

export function UnorderedList({ children }: { children: React.ReactNode }) {
  return <ul className="my-6 list-disc pl-6">{children}</ul>;
}

export function ListItem({ children }: { children: React.ReactNode }) {
  return <li className="my-2">{children}</li>;
}

export function StyledMarkdown({ value }: { value: string }) {
  return (
    <MDXContent
      value={value}
      components={{
        h1: H1,
        h2: H2,
        h3: H3,
        p: Paragraph,
        ul: UnorderedList,
        li: ListItem,
        code: InlineCode,
      }}
    />
  );
}
