#!/usr/bin/env node

/**
 * Test Runner Script
 * Run this script to execute all backend tests
 */

const { execSync } = require("child_process");
const path = require("path");

console.log("🧪 Running Backend Unit Tests...\n");

try {
  // Set test environment
  process.env.NODE_ENV = "test";

  // Run all tests
  execSync("npm test", {
    stdio: "inherit",
    cwd: __dirname,
  });

  console.log("\n✅ All tests completed!");
} catch (error) {
  console.error("\n❌ Tests failed:", error.message);
  process.exit(1);
}
