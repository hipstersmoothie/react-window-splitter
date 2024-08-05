import {
  H1,
  H2,
  H3,
  InlineCode,
  ListItem,
  Paragraph,
  UnorderedList,
} from "./src/Components/Content";

export function useMDXComponents() {
  return {
    h1: H1,
    h2: H2,
    h3: H3,
    p: Paragraph,
    ul: UnorderedList,
    li: ListItem,
    code: InlineCode,
  };
}
