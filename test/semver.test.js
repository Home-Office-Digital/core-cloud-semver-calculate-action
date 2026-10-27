import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, mock, test } from "node:test";
import {
  calculateNewTag,
  isValidSemverIncrement,
  sortTags,
} from "../src/semver.js";

let originalExitCode;

beforeEach(() => {
  originalExitCode = process.exitCode;
  mock.method(process.stdout, "write", () => true);
});

afterEach(() => {
  process.exitCode = originalExitCode;
  mock.restoreAll();
});

describe("calculateNewTag", () => {
  test("should increment correctly", () => {
    assert.equal(calculateNewTag("1.0.0", "pre"), "1.0.0-0");
    assert.equal(calculateNewTag("1.0.0", "premajor"), "2.0.0-0");
    assert.equal(calculateNewTag("1.0.0", "preminor"), "1.1.0-0");
    assert.equal(calculateNewTag("1.0.0", "prepatch"), "1.0.1-0");
    assert.equal(calculateNewTag("1.0.0", "prerelease"), "1.0.1-0");
    assert.equal(calculateNewTag("1.0.0", "major"), "2.0.0");
    assert.equal(calculateNewTag("1.0.0", "minor"), "1.1.0");
    assert.equal(calculateNewTag("1.0.0", "patch"), "1.0.1");
    assert.equal(process.exitCode, originalExitCode);
  });

  test("should return undefined if increment not valid", () => {
    assert.equal(calculateNewTag("1.0.0", undefined), undefined);
    assert.equal(calculateNewTag("1.0.0", null), undefined);
    assert.equal(calculateNewTag("1.0.0", "TEST"), undefined);
    assert.equal(process.exitCode, 1);
  });

  test("should return undefined if initial tag not valid", () => {
    assert.equal(calculateNewTag(undefined, "patch"), undefined);
    assert.equal(calculateNewTag(null, "patch"), undefined);
    assert.equal(calculateNewTag("TEST", "patch"), undefined);
    assert.equal(process.exitCode, 1);
  });
});

describe("isValidSemverIncrement", () => {
  test("should allow all accepted tags", () => {
    assert.equal(isValidSemverIncrement("pre"), true);
    assert.equal(isValidSemverIncrement("premajor"), true);
    assert.equal(isValidSemverIncrement("preminor"), true);
    assert.equal(isValidSemverIncrement("prepatch"), true);
    assert.equal(isValidSemverIncrement("prerelease"), true);
    assert.equal(isValidSemverIncrement("major"), true);
    assert.equal(isValidSemverIncrement("minor"), true);
    assert.equal(isValidSemverIncrement("patch"), true);
  });

  test("should return false on invalid increment", () => {
    assert.equal(isValidSemverIncrement(null), false);
    assert.equal(isValidSemverIncrement(undefined), false);
    assert.equal(isValidSemverIncrement("TEST"), false);
  });
});

describe("sortTags", () => {
  test("should sort tags by descending", () => {
    const tags = [
      { semver: "1.1.0", sha: 110 },
      { semver: "1.0.1", sha: 101 },
      { semver: undefined, sha: undefined },
      { semver: "TEST", sha: undefined },
      { semver: "2.0.0", sha: 200 },
    ];

    assert.deepEqual(sortTags(tags), [
      { semver: "2.0.0", sha: 200 },
      { semver: "1.1.0", sha: 110 },
      { semver: "1.0.1", sha: 101 },
    ]);
  });
});
