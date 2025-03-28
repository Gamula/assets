import { getEnvOrThrow, getWorkflowEnv } from "./utils/env.js"
import { transformArgs } from "./utils/helper.js"

/**
 * A class to dispatch sync event to GitHub.
 */
class GitSync {

  /**
   * Constructs a new GitSync instance.
   *
   * @param {import("@typings:github").Bindings} bindings - Bindings from the workflow.
   */
  constructor(bindings) {
    this.bindings = bindings
    this.org = getEnvOrThrow("SYNC_ORG")
    this.repo = getEnvOrThrow("SYNC_REPO")
    this.id = getEnvOrThrow("SYNC_ID")
    this.published = JSON.parse(getEnvOrThrow("PUBLISH_DATA"))
  }

  /**
   * Attempts to dispatch sync event.
   *
   * @returns The result output for the workflow.
   */
  async run() {
    const { core } = this.bindings
    const result = {
      status: "init",
    }
    const fired = await this.sync()
    if (fired) {
      result.status = "success"
      core.notice(`dispatch('${this.id}'): triggered event, and sent data.`)
    } else {
      result.status = "invalid"
      core.error(`dispatch('${this.id}'): unable to dispatch, an error occurred.`)
    }
    return result
  }

  /**
   * Dispatches the sync event with the payload.
   *
   * @private
   * @returns True if was successful, otherwise false.
   */
  async sync() {
    const { octokit } = this.bindings
    const payload = this.payload()
    return octokit.rest.repos.createDispatchEvent(payload)
      .then(() => true)
      .catch(() => false)
  }

  /**
   * Creates an object with event data.
   *
   * @private
   * @returns The event data.
   */
  event() {
    const name = getWorkflowEnv("ref_name")
    const [ org, repo ] = getWorkflowEnv("repository").split("/")
    const { tag, file, hash } = this.published
    return {
      [name]: {
        org,
        repo,
        tag,
        artifact: file,
        checksum: hash,
      },
    }
  }

  /**
   * Builds a payload for the REST API.
   *
   * @private
   * @returns The built payload to send.
   */
  payload() {
    const { org, repo, id } = this
    return {
      "owner": org,
      "repo": repo,
      "event_type": id,
      "client_payload": this.event(),
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
  return new GitSync(bindings).run()
}
