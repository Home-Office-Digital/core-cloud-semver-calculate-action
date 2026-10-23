import { info, setFailed, setOutput, warning } from "@actions/core";
import {
  getActionInputs,
  getHeadTag,
  getTagsForRepo,
  isValidEventType,
  valueExistsAsTag,
} from "./github.js";
import { calculateNewTag, sortTags } from "./semver.js";

async function run() {
  try {
    if (!isValidEventType()) {
      setFailed(
        "Invalid event specified, it should be used on [pull_request, pull_request_target, workflow_dispatch] events.",
      );
      return;
    }

    const inputs = getActionInputs([
      { name: "increment", options: { required: false } },
      { name: "github_token", options: { required: true } },
      { name: "default_to_highest", default: false },
    ]);

    const newTag = await generateSemverTag(
      inputs.github_token,
      inputs.increment,
      inputs.default_to_highest,
    );

    if (!newTag) {
      setFailed("No new tag could be created.");
      return;
    }

    info(`Setting output value "version" as new tag value ${newTag}.`);
    setOutput("version", newTag);
  } catch (error) {
    setFailed(error.message);
  }
}

async function generateSemverTag(token, increment, defaultToGreatest) {
  const tags = await getTagsForRepo(token);

  if (tags.length === 0) {
    return calculateNewTag("0.0.0", increment);
  }

  let currentTag;
  if (defaultToGreatest) {
    info("Finding highest repository SemVer tag.");
    currentTag = sortTags(tags).shift();
  } else {
    info("Getting head SHA SemVer tag.");
    currentTag = getHeadTag(tags);
  }

  if (!currentTag) {
    warning("No usable tag found on repository.");
    return calculateNewTag("0.0.0", increment);
  }

  const newTag = calculateNewTag(currentTag.semver, increment);

  info(`Checking if new tag value ${newTag} already exists as tag.`);
  if (valueExistsAsTag(tags, newTag)) {
    setFailed(`Value ${newTag} already exists as tag`);
    return;
  }

  return newTag;
}

run();
