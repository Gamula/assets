/** @import { Arguments, Bindings } from "@typings:github" */
/**
 * Transforms {@link Arguments} tuple into {@link Bindings} object.
 *
 * @param {Arguments} args - The arguments tuple.
 * @returns {Bindings} The bindings object.
 */
export function transformArgs(args) {
  return {
    __require__: args[0],
    __unused__: args[1],
    octokit: args[2],
    context: args[3],
    core: args[4],
    exec: args[5],
    glob: args[6],
    io: args[7],
  }
}
