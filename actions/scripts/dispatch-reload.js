import { getEnvOrThrow } from "./utils/env.js"
import { transformArgs } from "./utils/helper.js"

/**
 * A class to dispatch events to GitHub.
 */
class GitDispatch {

  /**
   * Constructs a new GitDispatch instance.
   *
   * @param {import("@typings:github").Bindings} bindings - Bindings from the workflow.
   * @param {string} event - The event to dispatch.
   * @param {Record<string, ?>} data - The data to send with the dispatch.
   */
  constructor(bindings, event, data) {
    this.bindings = bindings
    this.event = event
    this.data = data
  }

  /**
   * Attempts to dispatch the event.
   *
   * @returns The result output for the workflow.
   */
  async run() {
    const { core } = this.bindings
    const result = {
      status: "init",
    }
    const success = await this.dispatch()
    if (success) {
      result.status = "success"
      core.notice(`dispatch('${this.event}'): triggered event, and sent data.`)
    } else {
      result.status = "invalid"
      core.error(`dispatch('${this.event}'): unable to dispatch.`)
    }
    return result
  }

  /**
   * Dispatches the event and sends the data.
   *
   * @private
   * @returns True if was successful, otherwise false.
   */
  async dispatch() {
    const { octokit } = this.bindings
    const payload = this.payload()
    return octokit.rest.repos.createDispatchEvent(payload)
      .then(() => true)
      // .catch(() => false)
  }

  /**
   * Builds a payload for the REST API.
   *
   * @private
   * @returns The built payload to send.
   */
  payload() {
    const { context } = this.bindings
    const {
      repo: { owner, repo },
    } = context
    return {
      "owner": owner,
      "repo": repo,
      "event_type": this["event"],
      "client_payload": this["data"],
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
  const event = getEnvOrThrow("EVENT")
  const data = JSON.parse(getEnvOrThrow("EVENT_DATA"))
  return new GitDispatch(bindings, event, data).run()
}
