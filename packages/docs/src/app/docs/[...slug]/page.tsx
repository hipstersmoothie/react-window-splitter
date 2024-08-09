import { notFound } from "next/navigation";
import { allDocs } from "../../data";
import { Wrapper } from "../../../Components/Content";

type Props = { params: { slug: string[] } };

export default async function Page({ params }: Props) {
  const doc = await allDocs.get(params.slug);

  if (!doc) return notFound();

  const { Content } = doc;

  if (!Content) return notFound();

  return (
    <Wrapper>
      <Content />
    </Wrapper>
  );
}

export async function generateStaticParams() {
  const docs = allDocs.all().filter((doc) => doc.tsPath?.includes(".mdx"));

  return docs.map((doc) => ({
    slug: doc.pathname.split("/").slice(2),
  }));
}
