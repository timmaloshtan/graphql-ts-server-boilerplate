module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  globalSetup: "./src/tests/setup.ts",
  globalTeardown: "./src/tests/teardown.ts",
};
