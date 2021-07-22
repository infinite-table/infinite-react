const { readdirSync } = require("fs");

const getDirectories = (source) => {
  return readdirSync(source, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);
};

export function getVersionFolderNames(source: string) {
  return getDirectories(source).filter((name) => name.startsWith("v"));
}
