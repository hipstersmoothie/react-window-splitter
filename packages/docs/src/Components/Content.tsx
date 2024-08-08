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

export function InlineCode({
  className,
  ...props
}: Omit<React.ComponentProps<"code">, "children"> & {
  children: string;
}) {
  if (className?.includes("language-")) {
    const [, language] = className.match(/language-(.*)/) || [];

    return (
      <CodeBlock
        className={{ container: "py-4" }}
        value={props.children}
        language={
          language as React.ComponentProps<typeof CodeBlock>["language"]
        }
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

export function H1({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h1
      className={`group text-4xl mb-6 group ${className}`}
      data-heading="1"
      {...props}
    />
  );
}

export function H2({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={`text-2xl mt-8 mb-6 ${className}`} {...props} />;
}

export function H3({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={`text-xl my-6 ${className}`} {...props} />;
}

export function Paragraph({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={`my-6 ${className}`} {...props} />;
}

export function UnorderedList({
  className,
  ...props
}: React.HTMLAttributes<HTMLUListElement>) {
  return <ul className={`my-6 list-disc pl-6 ${className}`} {...props} />;
}

export function ListItem({
  className,
  ...props
}: React.HTMLAttributes<HTMLLIElement>) {
  return <li className={`my-2 ${className}`} {...props} />;
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

export const components: React.ComponentProps<typeof MDXContent>["components"] =
  {
    h1: H1,
    h2: H2,
    h3: H3,
    p: Paragraph,
    ul: UnorderedList,
    li: ListItem,
    code: InlineCode,
    a: StyledLink,
  };

export function StyledMarkdown({
  value,
  baseUrl,
}: {
  value: string;
  baseUrl?: string;
}) {
  return <MDXContent value={value} baseUrl={baseUrl} components={components} />;
}
