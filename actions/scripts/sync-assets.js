import { getEnvOrThrow } from "./utils/env.js"
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
    this.data = {
      id: getEnvOrThrow("SYNC_ID"),
      payload: JSON.parse(getEnvOrThrow("SYNC_PAYLOAD")),
    }
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
      event: this.data,
    }
    const fired = await this.sync()
    if (fired) {
      result.status = "success"
      core.notice(`dispatch('${result.event.id}'): triggered event, and sent data.`)
    } else {
      result.status = "invalid"
      core.error(`dispatch('${result.event.id}'): unable to dispatch, an error occurred.`)
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
   * Builds a payload for the REST API.
   *
   * @private
   * @returns The built payload to send.
   */
  payload() {
    const { org, repo, data } = this
    return {
      "owner": org,
      "repo": repo,
      "event_type": data["id"],
      "client_payload": data["payload"],
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
