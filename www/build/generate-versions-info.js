const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");
const YAML = require("yaml");
const humanize = require("humanize-string");

const DOCS_FOLDER = path.resolve(__dirname, "../pages/docs");
const DEFAULT_VERSION_FILE = path.resolve(DOCS_FOLDER, "default-version.yml");

const DEFAULT_VERSION = YAML.parse(
  fs.readFileSync(DEFAULT_VERSION_FILE, "utf8")
);

const DEFAULT_MENU_ITEMS = (DEFAULT_VERSION.menu = normalizeMenuItems(
  DEFAULT_VERSION.menu
));

function isValidDate(d) {
  return d instanceof Date && !isNaN(d);
}

function normalizeMenuItems(items) {
  return items.map((item) => {
    return {
      path: typeof item === "string" ? item : item.path,
      label: typeof item === "string" ? humanize(item) : item.label,
    };
  });
}

const versions = fs
  .readdirSync(DOCS_FOLDER, {
    withFileTypes: true,
  })
  .filter((dirent) => dirent.isDirectory())
  .map((dirent) => dirent.name)
  .filter((x) => x.startsWith("v"));

function normalizeInfo(info, version) {
  if (!info.date) {
    throw `No release date specified for version ${version}. Specify a "date" field.`;
  }
  let date = new Date(info.date);
  if (!isValidDate(date)) {
    throw `Invalid release date specified for version ${version}.`;
  }

  date = date.toISOString().split("T")[0];

  info.menu = normalizeMenuItems(info.menu || DEFAULT_MENU_ITEMS);
  // if (!Array.isArray(info.menu)) {
  //   throw `Please specify menu items for version ${version}. Use the "menu" field`;
  // }

  return {
    ...info,
    date,
    slug: info.slug || version,
  };
}

const versionInfos = versions.reduce((acc, version) => {
  const versionFile = path.resolve(DOCS_FOLDER, version, "version.yml");
  if (!fs.pathExistsSync(versionFile)) {
    console.log("");
    console.log(
      chalk.red(`No version.yml found in version folder /${version}`)
    );
    process.exit();
  }

  let info;

  try {
    info = YAML.parse(fs.readFileSync(versionFile, "utf8"));
  } catch (err) {
    console.log("");
    console.log(
      chalk.red(`Failed to parse version.yml for version ${version}`)
    );
    console.error(err);
    process.exit();
  }

  try {
    info = normalizeInfo(info, version);
  } catch (err) {
    console.log("");
    console.log(chalk.red(`Invalid version.yml for version ${version}`));
    console.log(chalk.red(err));
    process.exit();
  }

  acc[version] = info;

  return acc;
}, {});

fs.writeFileSync(
  path.resolve(DOCS_FOLDER, "versions.json"),
  JSON.stringify(versionInfos, null, 2),
  "utf8"
);
