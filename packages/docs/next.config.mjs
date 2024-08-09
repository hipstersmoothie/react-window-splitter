import { createMdxtsPlugin } from "mdxts/next";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const withMdxts = createMdxtsPlugin({
  theme: "github-dark-dimmed",
  gitSource: "https://github.com/hipstersmoothie/react-window-splitter",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["js", "jsx", "mdx", "ts", "tsx"],
  reactStrictMode: true,
  experimental: {
    outputFileTracingRoot: path.join(__dirname, "../.."),
  },
};

export default withMdxts(nextConfig);
