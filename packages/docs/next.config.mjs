import { createMdxtsPlugin } from "mdxts/next";

const withMdxts = createMdxtsPlugin({
  theme: "github-dark-dimmed",
  gitSource: "https://github.com/hipstersmoothie/react-window-splitter",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

export default withMdxts(nextConfig);
