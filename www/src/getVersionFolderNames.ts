const { readdirSync } = require("fs");

const getDirectories = (source: string) => {
  return readdirSync(source, { withFileTypes: true })
    .filter((dirent: { isDirectory: () => boolean }) => dirent.isDirectory())
    .map((dirent: { name: string }) => dirent.name);
};

export function getVersionFolderNames(source: string) {
  return getDirectories(source).filter(
    (name: string) => name.startsWith("v") || name === "latest"
  );
}
