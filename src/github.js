import { context as githubContext, getOctokit } from "@actions/github";
import { getInput, info } from "@actions/core";
import semver from "semver";

async function getTagsForRepo(token) {
  info("Getting tags from repository.");

  const { data: tags } = await getOctokit(token).rest.repos.listTags({
    owner: githubContext.payload.repository.owner.login,
    repo: githubContext.payload.repository.name,
  });

  info(`Retrieved ${tags.length} tags from repository.`);

  return tags.map((tag) => ({
    semver: tag.name,
    sha: tag.commit?.sha,
  }));
}

function getHeadTag(tags) {
  const headSha = getHeadRefSha();
  return tags.find((tag) => tag.sha === headSha && semver.valid(tag.semver));
}

function getHeadRefSha({ context } = { context: githubContext }) {
  if (isPullRequest()) {
    return context.payload.pull_request.base?.sha;
  } else if (isWorkflowDispatch()) {
    return context.sha;
  }
}

function valueExistsAsTag(tags, semverValue) {
  return tags.some((tag) => tag.semver === semverValue);
}

const isValidEventType = () => {
  return isPullRequest() || isWorkflowDispatch();
};

const isPullRequest = ({ context } = { context: githubContext }) => {
  return ["pull_request", "pull_request_target"].includes(context.eventName);
};

const isWorkflowDispatch = ({ context } = { context: githubContext }) => {
  return context.eventName === "workflow_dispatch";
};

const getActionInputs = (variables) => {
  return variables.reduce((obj, variable) => {
    let value = getInput(variable.name, variable.options);
    if (!value) {
      if (variable.hasOwnProperty("default")) {
        value = variable.default;
      }
    }
    return Object.assign(obj, { [variable.name]: value });
  }, {});
};

export {
  getActionInputs,
  getHeadTag,
  getTagsForRepo,
  isValidEventType,
  valueExistsAsTag,
};
