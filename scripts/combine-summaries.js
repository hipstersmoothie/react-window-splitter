import glob from "fast-glob";
import path from "path";
import fs from "fs/promises";

async function main() {
  const filepaths = await glob("coverage/summary-combined/**/*.json");
  const files = await Promise.all(
    filepaths.map((f) => fs.readFile(f, "utf-8").then(JSON.parse))
  );
  const combined = files.reduce((acc, { total, ...filesResults }) => {
    if (!acc.totals) {
      acc.totals = {};
    }

    Object.entries(total).forEach(([key, value]) => {
      acc.totals[key] = {
        ...acc.totals[key],
        total: (acc.totals[key]?.total || 0) + value.total,
        covered: (acc.totals[key]?.covered || 0) + value.covered,
        skipped: (acc.totals[key]?.skipped || 0) + value.skipped,
      };

      acc.totals[key].percent = acc.totals[key].total
        ? (acc.totals[key].covered / acc.totals[key].total) * 100
        : 0;
    });

    return {
      ...acc,
      ...filesResults,
    };
  }, {});

  await fs.writeFile(
    path.join(process.cwd(), "coverage", "combined", "summary.json"),
    JSON.stringify(combined, null, 2)
  );
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
