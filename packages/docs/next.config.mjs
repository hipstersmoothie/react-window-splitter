import { createMdxtsPlugin } from "mdxts/next";
import bundleAnalyzer from "@next/bundle-analyzer";

const withMdxts = createMdxtsPlugin({
  theme: "github-dark-dimmed",
  gitSource: "https://github.com/hipstersmoothie/react-window-splitter",
});

const withBundleAnalyzer = bundleAnalyzer({ enabled: true });

/** @type {import('next').NextConfig} */
let nextConfig = withMdxts({
  pageExtensions: ["js", "jsx", "mdx", "ts", "tsx"],
  reactStrictMode: true,
});

if (process.env.ANALYZE === "true") {
  nextConfig = withBundleAnalyzer(nextConfig);
}

export default nextConfig;
