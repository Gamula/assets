/** @param {import("@actions/github-script").AsyncFunctionArguments} AsyncFunctionArguments */
export async function main({ core, context }) {
  const result = {
    mode: process.env["MODE_VAR"] ?? "",
  }
  const valid_modes = [ "packsquash", "archive" ]
  if (!valid_modes.includes(result.mode)) {
    result.mode = valid_modes[0]
    core.warning(`unable to parse 'vars.ARTIFACT_MODE', using '${result.mode}' as default.`)
  }
  const event = {
    name: context.eventName,
    ref: context.payload,
    mode: -1,
  }
  switch (event.name) {
    case "push": {
      const commit_regex = /^\((.*?)\):\s/i
      const commit_marker = event.ref.head_commit.message.match(commit_regex)
      if (!commit_marker || commit_marker.length !== 2) {
        break
      }
      event.mode = commit_marker.at(1).toLowerCase()
      break
    }
    case "workflow_dispatch": {
      event.mode = process.env["MODE_INPUT"].toLowerCase()
      break
    }
  }
  if (event.mode === -1) {
    core.notice(`event('${event.name}'): using default '${result.mode}' as mode.`)
  } else if (valid_modes.includes(event.mode)) {
    result.mode = event.mode
    core.notice(`event('${event.name}'): using override '${event.mode}' as mode.`)
  } else {
    core.error(`event('${event.name}'): unexpected '${event.mode}', using default '${result.mode}' as mode.`)
  }
  return result
}
