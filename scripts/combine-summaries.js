import glob from "fast-glob";
import path from "path";
import fs from "fs/promises";

async function main() {
  const filepaths = await glob("coverage/summary-combined/**/*.json");
  const files = await Promise.all(
    filepaths.map((f) => fs.readFile(f, "utf-8").then(JSON.parse))
  );
  const combined = files.reduce((acc, { total, ...filesResults }) => {
    if (!acc.total) {
      acc.total = {};
    }

    Object.entries(total).forEach(([key, value]) => {
      acc.total[key] = {
        ...acc.total[key],
        total: (acc.total[key]?.total || 0) + value.total,
        covered: (acc.total[key]?.covered || 0) + value.covered,
        skipped: (acc.total[key]?.skipped || 0) + value.skipped,
      };

      acc.total[key].pct = acc.total[key].total
        ? // to fixed 2 decimal places
          ((acc.total[key].covered / acc.total[key].total) * 100).toFixed(2)
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
