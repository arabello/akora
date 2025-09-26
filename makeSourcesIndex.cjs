const fs = require("fs");
const process = require("process");
const path = require("path");

const args = process.argv.slice(2);

if (args.length != 1) {
  console.error("Usage: node makeSourcesIndex.js <assets subfolder>");
  process.exit(1);
}

fs.readdir(`${__dirname}/public/assets/${args[0]}`, (err, files) => {
  if (err) {
    console.error(err);
    process.exit(2);
  }
  files.sort;

  const sources = files
    .filter((f) => !f.startsWith("."))
    .map((f) => {
      const name = path.parse(f).name;
      return {
        id: name.toLocaleLowerCase().replace(" ", "-"),
        name,
        url: `assets/${args[0]}/${f}`,
      };
    });

  process.stdout.write(JSON.stringify(sources));
});
