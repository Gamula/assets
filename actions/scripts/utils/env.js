/**
 * Retrieve an environment variable by `key`, throwing an error if it is `undefined`.
 *
 * @param {string} key - The key of the environment variable.
 * @returns {string} The value of the environment variable.
 * @throws If the environment variable is not set.
 */
export function getEnvOrThrow(key) {
  const value = process.env[key]
  if (!value) {
    throw new Error(`(env): expected "${key}" to be defined.`)
  }
  return value
}

/**
 * Retrieve an environment variable by `key`, or fallback if it is `undefined`.
 *
 * @param {string} key - The key of the environment variable.
 * @param {string} fallback - The fallback value when undefined.
 * @returns {string} The value of the environment variable or the fallback value.
 */
export function getEnvOrFallback(key, fallback) {
  return process.env[key] || fallback
}

/**
 * Retrieve a workflow variable by `key`, throwing an error if it is `undefined`.
 *
 * @param {string} key - The key of the workflow variable.
 * @returns {string} The value of the workflow variable.
 * @throws If the workflow variable is not set.
 */
export function getWorkflowEnv(key) {
  return getEnvOrThrow(`GITHUB_${key.toUpperCase()}`)
}
