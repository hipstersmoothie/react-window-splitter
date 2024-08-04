import { createSource } from "mdxts";

export const allDocs = createSource("docs/**/*.mdx", {
  baseDirectory: "/src/app/docs",
});
