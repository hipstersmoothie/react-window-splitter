import { createMdxtsPlugin } from "mdxts/next";

const withMdxts = createMdxtsPlugin({
  theme: "github-dark-dimmed",
  gitSource: "https://github.com/hipstersmoothie/react-window-splitter",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["js", "jsx", "mdx", "ts", "tsx"],
  reactStrictMode: true,
  experimental: {
    outputFileTracingIncludes: {
      "/**/*": ["./src/examples/**/*"],
    },
  },
};

export default withMdxts(nextConfig);
