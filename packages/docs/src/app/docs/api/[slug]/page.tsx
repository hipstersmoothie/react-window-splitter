import { pascalCase } from "change-case";
import * as docgen from "react-docgen-typescript";
import { CodeInline } from "mdxts/components";
import { Project } from "ts-morph";
import {
  H1,
  InlineCode,
  Table,
  TableCell,
  TableHeader,
  StyledMarkdown,
  H2,
} from "../../../../Components/Content";

const tsConfig =
  "/Users/andrewlisowski/Documents/react-window-splitter/packages/react-window-splitter/tsconfig.json";
const targetFile =
  "/Users/andrewlisowski/Documents/react-window-splitter/packages/react-window-splitter/src/ReactWindowSplitter.tsx";
const parser = docgen.withCustomConfig(tsConfig, {
  propFilter: (prop) => {
    return prop.parent
      ? !prop.parent.fileName.includes("@types/react") &&
          !prop.parent.fileName.includes("@emotion")
      : true;
  },
});
const allDocs = parser.parse(targetFile);

const project = new Project({
  tsConfigFilePath: tsConfig,
});
const file = project.getSourceFile(targetFile);

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

  const [, handleProp] =
    Object.entries(doc.props).find(([k]) => k.includes("handle")) || [];
  const handleType = handleProp?.type?.name.match(/Ref<(.*)>/)?.[1];
  const handleDocs = handleType
    ? file
        ?.getInterface(handleType)
        ?.getProperties()
        .map((p) => ({
          name: p.getName(),
          description: p.getJsDocs().map((d) => d.getDescription().trim())[0],
          type: p.getType().getText(),
        })) || []
    : [];

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
      {handleDocs.length > 0 && (
        <>
          <H2 id="imperative-api">Imperative API</H2>
          <Table>
            <thead>
              <tr>
                <TableHeader>Name</TableHeader>
                <TableHeader>Type</TableHeader>
                <TableHeader>Description</TableHeader>
              </tr>
            </thead>
            <tbody>
              {handleDocs.map((prop) => (
                <tr key={prop.name}>
                  <TableCell>
                    <InlineCode>{prop.name}</InlineCode>
                  </TableCell>
                  <TableCell className="max-w-[200px]">
                    <CodeInline
                      language="ts"
                      className="text-sm !px-2 !py-0.5 !whitespace-pre-wrap !block !w-fit"
                      value={prop.type}
                    />
                  </TableCell>
                  <TableCell>
                    <StyledMarkdown value={prop.description} />
                  </TableCell>
                </tr>
              ))}
            </tbody>
          </Table>
        </>
      )}
    </div>
  );
}
