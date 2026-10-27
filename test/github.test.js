import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, test } from "node:test";
import { context } from "@actions/github";
import { getHeadTag } from "../src/github.js";

let originalEventName;
let originalPayload;

beforeEach(() => {
  originalEventName = context.eventName;
  originalPayload = context.payload;
  context.eventName = "pull_request";
  // eslint-disable-next-line camelcase
  context.payload = { pull_request: { base: { sha: "base-sha" } } };
});

afterEach(() => {
  context.eventName = originalEventName;
  context.payload = originalPayload;
});

describe("getHeadTag", () => {
  test("should skip non-SemVer tags on the base commit", () => {
    const validTag = { semver: "0.0.1", sha: "base-sha" };
    const tags = [
      { semver: "myproject-release-0.0.1", sha: "base-sha" },
      validTag,
    ];

    assert.equal(getHeadTag(tags), validTag);
  });

  test("should return undefined when the base commit has no SemVer tag", () => {
    assert.equal(
      getHeadTag([
        { semver: "myproject-release-0.0.1", sha: "base-sha" },
        { semver: "1.0.0", sha: "other-sha" },
      ]),
      undefined,
    );
  });

  test("should accept v-prefixed SemVer tags", () => {
    const validTag = { semver: "v1.2.3", sha: "base-sha" };

    assert.equal(getHeadTag([validTag]), validTag);
  });
});
