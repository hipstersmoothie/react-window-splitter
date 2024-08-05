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
