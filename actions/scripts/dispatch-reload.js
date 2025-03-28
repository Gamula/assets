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
   */
  constructor(bindings) {
    this.bindings = bindings
    this.event = {
      org: getEnvOrThrow("EVENT_ORG"),
      repo: getEnvOrThrow("EVENT_REPO"),
      id: getEnvOrThrow("EVENT_ID"),
      payload: JSON.parse(getEnvOrThrow("EVENT_PAYLOAD")),
    }
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
      event: this.event,
    }
    const success = await this.dispatch()
    if (success) {
      result.status = "success"
      core.notice(`dispatch('${result.event.id}'): triggered event, and sent data.`)
    } else {
      result.status = "invalid"
      core.error(`dispatch('${result.event.id}'): unable to dispatch.`)
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
    const { event } = this
    return {
      "owner": event["org"],
      "repo": event["repo"],
      "event_type": event["id"],
      "client_payload": event["payload"],
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
  return new GitDispatch(bindings).run()
}
