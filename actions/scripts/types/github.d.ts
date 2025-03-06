declare type Keyed<T, P extends keyof T> = T[P]
declare type Tuple<T, K extends (keyof T)[]> = {
  [P in keyof K]: Keyed<T, K[P]>
}

declare module "@typings:github" {
  import type * as github from "@actions/github"
  import type * as core from "@actions/core"
  import type * as exec from "@actions/exec"
  import type * as glob from "@actions/glob"
  import type * as io from "@actions/io"

  /**
   * Represents the `types` used by `@actions/github-script` for the workflow.
   *
   * @see {@link https://github.com/actions/github-script/blob/v7/types/async-function.d.ts#L8|@actions/github-script(async-function.d.ts)}
   */
  export type Types = {
    Requires: Record<"Proxied" | "Vanilla", NodeJS.Require>
    GitHub: ReturnType<typeof github.getOctokit>
    Context: typeof github.context
    Core: typeof core
    Exec: typeof exec
    Glob: typeof glob
    IO: typeof io
  }

  /**
   * Represents the `require` function that is proxied by `@actions/github-script`.
   *
   * @see {@link https://github.com/actions/github-script/blob/v7/src/wrap-require.ts#L3|@actions/github-script(wrap-require)}
   */
  export type Require = Types["Requires"]

  /**
   * Represents the `global` bindings that is provided by `@actions/github-script`.
   *
   * Note: Naming has changes for the following properties:
   * - `require` -> `__require__`
   * - `__original_require__` -> `__unused__`
   *
   * @see {@link https://github.com/actions/github-script/blob/v7/src/async-function.ts#L10|@actions/github-script(async-function)}
   */
  export type Bindings = {
    __require__: Require["Proxied"]
    __unused__: Require["Vanilla"]
    github: Types["GitHub"]
    context: Types["Context"]
    core: Types["Core"]
    exec: Types["Exec"]
    glob: Types["Glob"]
    io: Types["IO"]
  }

  /**
   * A tuple representation of the {@link Bindings} object, which is spread to
   * the `invoked` function as `arguments`.
   *
   * @see {@link Invoked}
   */
  export type Arguments = Tuple<Bindings, [
    "__require__",
    "__unused__",
    "github",
    "context",
    "core",
    "exec",
    "glob",
    "io",
  ]>

  /**
   * Represents the returned value by the `invoked` function, which is
   * exported to the `output` of the workflow step.
   *
   * @see {@link Invoked}
   */
  export type Result<T extends string = string> = T | Record<T, unknown>

  /**
   * Represents a function that the workflow step will invoke immediately.
   *
   * @see {@link Arguments}
   * @see {@link Result}
   */
  export type Invoked<T = Result> = (...args: Arguments) => T | Promise<T>
}
