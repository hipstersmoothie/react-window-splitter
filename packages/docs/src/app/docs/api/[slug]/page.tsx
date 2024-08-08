import { pascalCase } from "change-case";
import * as docgen from "react-docgen-typescript";
import { CodeInline, ExportedTypes } from "mdxts/components";
import {
  H1,
  InlineCode,
  Table,
  TableCell,
  TableHeader,
  StyledMarkdown,
  H2,
} from "../../../../Components/Content";

const parser = docgen.withCustomConfig(
  "/Users/andrewlisowski/Documents/react-window-splitter/packages/react-window-splitter/tsconfig.json",
  {
    propFilter: (prop) => {
      return prop.parent
        ? !prop.parent.fileName.includes("@types/react") &&
            !prop.parent.fileName.includes("@emotion")
        : true;
    },
    savePropValueAsString: true,
    shouldExtractLiteralValuesFromEnum: true,
    shouldExtractValuesFromUnion: true,
  }
);
const allDocs = parser.parse(
  "/Users/andrewlisowski/Documents/react-window-splitter/packages/react-window-splitter/src/ReactWindowSplitter.tsx"
);

export default async function ApiPage({
  params,
}: {
  params: { slug: string };
}) {
  const componentName = pascalCase(params.slug);
  const doc = allDocs.find((d) => d.displayName === componentName);

  if (!doc) {
    return <div>Not found</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-8">
      <H1>
        <InlineCode className="text-3xl">{componentName}</InlineCode>
      </H1>
      {doc.description && <StyledMarkdown value={doc.description} />}

      <Table>
        <thead>
          <tr>
            <TableHeader>Name</TableHeader>
            <TableHeader>Type</TableHeader>
            <TableHeader>Description</TableHeader>
          </tr>
        </thead>
        <tbody>
          {Object.values(doc.props).map((prop) => (
            <tr key={prop.name}>
              <TableCell>
                <InlineCode>{prop.name}</InlineCode>
              </TableCell>
              <TableCell className="max-w-[200px]">
                <CodeInline
                  language="ts"
                  className="text-sm !px-2 !py-0.5 !whitespace-pre-wrap !block !w-fit"
                  value={prop.type.name}
                />
              </TableCell>
              <TableCell>
                <StyledMarkdown value={prop.description} />
              </TableCell>
            </tr>
          ))}
        </tbody>
      </Table>
      <H2>Imperative API</H2>

      <ExportedTypes source="react-window-splitter/src/ReactWindowSplitter.tsx" />
    </div>
  );
}
