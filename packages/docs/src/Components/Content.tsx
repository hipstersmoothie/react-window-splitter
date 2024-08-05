import { MDXContent, CodeBlock } from "mdxts/components";
import Link, { LinkProps } from "next/link";

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
  return <h2 className="text-2xl mt-8 mb-6">{children}</h2>;
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

export function Wrapper({ children }: { children: React.ReactNode }) {
  return <div className="max-w-3xl mx-auto px-8 pb-20">{children}</div>;
}

export function StyledLink({
  children,
  ...props
}: LinkProps & React.HTMLProps<HTMLAnchorElement>) {
  return (
    <Link
      {...props}
      className="text-blue-9 dark:text-bluedark-9 cursor-pointer underline underline-offset-4 hover:underline-offset-1 hover:decoration-wavy"
    >
      {children}
    </Link>
  );
}

export function StyledMarkdown({
  value,
  baseUrl,
}: {
  value: string;
  baseUrl?: string;
}) {
  return (
    <MDXContent
      value={value}
      baseUrl={baseUrl}
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
