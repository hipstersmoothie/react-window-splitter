const allContributorsOptions = {
  types: {
    code: ["**/src/**/*", "**/package.json", "**/tsconfig.json"],
    doc: ["**/*.md", "**/packages/docs/**"],
    test: ["**/*.test.ts", "**/*.test.tsx"],
  },
};

// eslint-disable-next-line no-undef
module.export = function rc() {
  return {
    plugins: ["released", "npm", ["all-contributors", allContributorsOptions]],
  };
};
