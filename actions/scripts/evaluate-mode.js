import { getEnvOrThrow } from "./utils/env.js"
import { transformArgs } from "./utils/helper.js"

/**
 * Script function for the GitHub Action.
 *
 * @type {import("@typings:github").Invoked}
 */
export async function invoke(...args) {
  const { context, core } = transformArgs(args)
  const result = {
    mode: getEnvOrThrow("MODE_VAR"),
  }
  const modes = [
    "packsquash",
    "archive",
  ]
  if (!modes.includes(result.mode)) {
    result.mode = modes[0]
    core.warning(`unable to parse 'vars.ARTIFACT_MODE', using '${result.mode}' as default.`)
  }
  const event = {
    name: context.eventName,
    ref: context.payload,
    mode: "-",
  }
  switch (event.name) {
    case "push": {
      /** @type {string} */
      const message = event.ref.head_commit.message
      const capture = message.match(/^\((.*?)\):\s/i)
      if (!capture || capture.length !== 2) {
        break
      }
      event.mode = capture[1].toLowerCase()
      break
    }
    case "workflow_dispatch": {
      event.mode = getEnvOrThrow("MODE_INPUT").toLowerCase()
      break
    }
  }
  if (event.mode === "-") {
    core.notice(`event('${event.name}'): using default '${result.mode}' as mode.`)
  } else if (modes.includes(event.mode)) {
    result.mode = event.mode
    core.notice(`event('${event.name}'): using override '${event.mode}' as mode.`)
  } else {
    core.error(`event('${event.name}'): unexpected '${event.mode}', using default '${result.mode}' as mode.`)
  }
  return result.mode
}
