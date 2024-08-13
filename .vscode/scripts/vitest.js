import findPackageJson from "find-package-json";
import path from "path";
import { spawnSync } from "child_process";

const [, , , file] = process.argv;
const finder = findPackageJson(file);
const packageJson = finder.next().filename;
const dir = path.dirname(packageJson);
const relativeFile = path.relative(dir, file);

process.chdir(dir);

spawnSync("pnpm", ["run", "test", "--testTimeout", "50000000", relativeFile], {
  stdio: "inherit",
});
