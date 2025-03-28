import fs from "node:fs"
import path from "node:path"
import crypto from "node:crypto"

import { getEnvOrThrow } from "./utils/env.js"
import { transformArgs } from "./utils/helper.js"

/**
 * Generates hash from file blob.
 *
 * @param {import("node:crypto").BinaryLike} blob - The file blob to hash.
 * @param {string} algorithm - The algorithm to use. (e.g., "sha256", "sha1")
 * @returns {string} The hexadecimal hash of the blob.
 */
function fileChecksum(blob, algorithm) {
  return crypto
    .createHash(algorithm)
    .update(blob)
    .digest("hex")
}

/**
 * Parses a templated body and turns into a string.
 *
 * @param {string[]} body - Array of strings with placeholders.
 * @param {string[]} fields - Array of values to use when replacing.
 * @returns {string} The formatted string from the body template.
 */
function bodyAsString(body, fields) {
  return body
    .map(value => value.replace(/%s/g, () => fields.shift() || ""))
    .join("\n")
}

/**
 * A class to handle the publishing of artifacts to GitHub.
 */
class GitArtifact {

  /**
   * Constructs a new GitArtifact instance.
   *
   * @param {import("@typings:github").Bindings} bindings - Bindings from the workflow.
   */
  constructor(bindings) {
    this.bindings = bindings
    this.mode = getEnvOrThrow("ARTIFACT_MODE")
    this.path = path.resolve(getEnvOrThrow("ARTIFACT_PATH"))
    this.file = path.basename(this.path)
    this.blob = fs.readFileSync(this.path)
    this.hash = fileChecksum(this.blob, "sha1")
  }

  /**
   * Attempts to create a release and upload the artifact.
   *
   * @returns The result output for the workflow.
   */
  async run() {
    const { core } = this.bindings
    const result = this.describe()
    const exists = await this.validate()
    if (exists) {
      result.status = "exists"
      result.tag = exists.tag_name
      result.url = exists.html_url
      core.error(`publish('${result.tag}'): skipping release, already exists.`)
    } else {
      const created = await this.release()
      result.status = "created"
      result.tag = created.tag_name
      result.url = created.html_url
      core.notice(`publish('${result.tag}'): created release with tag.`)
      core.info(`=> view at: ${result.url}`)
    }
    return result
  }

  /**
   * Verifies a release with the same tag doesn't already exist.
   *
   * @private
   * @returns The release response data or null if not found.
   */
  async validate() {
    const { octokit } = this.bindings
    const payload = this.payload("validate")
    // @ts-ignore
    return octokit.rest.repos.getReleaseByTag(payload)
      .then(({ data }) => data)
      .catch(() => null)
  }

  /**
   * Creates a new release and then uploads the artifact.
   *
   * @private
   * @returns The release response data.
   */
  async release() {
    const { octokit } = this.bindings
    const payload = this.payload("release")
    // @ts-ignore
    return octokit.rest.repos.createRelease(payload)
      .then(async ({ data }) => {
        await this.upload(data)
        return data
      })
  }

  /**
   * Uploads the artifact to the release.
   *
   * @private
   * @param {Record<string, ?>} release - The release response data.
   * @returns The upload response data.
   */
  async upload(release) {
    const { octokit } = this.bindings
    const payload = this.payload("upload", release)
    // @ts-ignore
    return octokit.rest.repos.uploadReleaseAsset(payload)
      .then(({ data }) => data)
  }

  /**
   * Builds a payload for the REST API.
   *
   * @private
   * @param {"validate" | "release" | "upload"} type - Payload request type.
   * @param {Record<string, string>} [extra] - Additional data that might be needed.
   * @returns The built payload to send.
   */
  payload(type, extra = {}) {
    const { context } = this.bindings
    const {
      payload: hook,
      ref: branch,
      repo: { owner, repo },
      runNumber: run,
    } = context
    const name = `v${run}`
    switch (type) {
      case "validate": {
        return {
          "owner": owner,
          "repo": repo,
          "tag": name,
        }
      }
      case "release": {
        const head = hook["head_commit"]
        return {
          "owner": owner,
          "repo": repo,
          "tag_name": name,
          "target_commitish": branch,
          "name": name,
          "body": bodyAsString(
            [
              "# :checkered_flag: **Successful Build:** [`%s`]",
              "> [!NOTE]",
              "> ### :hammer_and_wrench: **Commit:** (%s)",
              "> - **Author**: @%s",
              "> - **Message**: `%s`",
              "---",
              "> [!IMPORTANT]",
              "> ### :package: **Artifact:** (`%s`)",
              "> - **File**: `%s`",
              "> - **Hash**: `%s`",
              "---",
            ],
            [
              name,
              head["id"],
              head["author"]["username"],
              head["message"],
              this["mode"],
              this["file"],
              this["hash"],
            ]
          ),
          "make_latest": "true",
        }
      }
      case "upload": {
        return {
          "owner": owner,
          "repo": repo,
          "release_id": extra["id"],
          "name": this["file"],
          "label": this["file"],
          "data": this["blob"],
        }
      }
    }
  }

  /**
   * Creates an object with artifact details.
   *
   * @private
   * @returns The artifact details.
   */
  describe() {
    return {
      path: this.path,
      file: this.file,
      hash: this.hash,
      tag: "-",
      url: "-",
      status: "-",
    }
  }
}

/**
 * Script function for the GitHub Action.
 *
 * @type {import("@typings:github").Invoked}
 */
export async function invoke(...args) {
  const bindings = transformArgs(args)
  return new GitArtifact(bindings).run()
}
