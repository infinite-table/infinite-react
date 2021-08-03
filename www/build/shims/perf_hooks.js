module.exports = {
  performance: globalThis.performance,
};

ObjectDefineProperty(module.exports, "constants", {
  configurable: false,
  enumerable: true,
  value: constants,
});
