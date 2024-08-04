import { notFound } from "next/navigation";
import { allDocs } from "../../data";
import { promises as fs } from "fs";
import { StyledMarkdown } from "../../../Components/Content";

export default async function DocsPage({
  params,
}: {
  params: { slug: string[] };
}) {
  const doc = await allDocs.get(params.slug);

  if (!doc) {
    return notFound();
  }

  const page = await fs.readFile(
    doc.sourcePath.replace("vscode://file/", "").replace(":0:0", ""),
    "utf8"
  );

  return (
    <div>
      <StyledMarkdown value={page} />
    </div>
  );
}
