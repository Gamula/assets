/** @param {import("@actions/github-script").AsyncFunctionArguments} AsyncFunctionArguments */
export async function main({ core, context, github, require }) {
  const fs = require("fs")
  const path = require("path")
  const crypto = require("crypto")

  function fileChecksum(blob, ...rest) {
    const hash = crypto.createHash(...rest)
    hash.update(blob)
    return hash.digest("hex")
  }

  function gitBody(data, fields) {
    return data.map(line => line.replace(/%s/g, () => fields.shift())).join("\n")
  }

  function gitPayload(type, env) {
    const [ owner, repo ] = process.env["GITHUB_REPOSITORY"].split("/")
    const ref = process.env["GITHUB_REF"]
    const tag = `v${process.env["GITHUB_RUN_NUMBER"]}`
    const payload = {}
    switch (type) {
      case "check": {
        payload["owner"] = owner
        payload["repo"] = repo
        payload["tag"] = tag
        break
      }
      case "create": {
        payload["owner"] = owner
        payload["repo"] = repo
        payload["tag_name"] = tag
        payload["target_commitish"] = ref
        payload["name"] = tag
        payload["body"] = gitBody(
          [
            "  - commit: %s",
            "  - artifact: %s",
            "  - checksum (sha1): %s",
          ],
          [
            context["payload"]["head_commit"]["message"],
            result["file"],
            result["sha"],
          ]
        )
        payload["make_latest"] = "true"
        break
      }
      case "upload": {
        payload["owner"] = owner
        payload["repo"] = repo
        payload["release_id"] = env["id"]
        payload["name"] = result["file"]
        payload["label"] = result["file"]
        payload["data"] = result["blob"]
        break
      }
    }
    return payload
  }

  async function gitRevExists(payload) {
    return github.rest.repos.getReleaseByTag(payload)
      .then(() => true)
      .catch(() => false)
  }

  async function gitRevCreate(payload) {
    return github.rest.repos.createRelease(payload)
      .then(({ data }) => data)
      .then(gitRevUpload)
  }

  async function gitRevUpload(release) {
    const payload = gitPayload("upload", release)
    return github.rest.repos.uploadReleaseAsset(payload)
      .then(() => release)
  }

  const artifact_path = path.resolve(process.env["PUBLISH_FILE"])
  const artifact_file = path.basename(artifact_path)
  const artifact_blob = fs.readFileSync(artifact_path)
  const artifact_sha = fileChecksum(artifact_blob, "sha1")
  const result = {
    path: artifact_path,
    file: artifact_file,
    blob: artifact_blob,
    sha: artifact_sha,
  }
  const payloads = {
    check: gitPayload("check"),
    create: gitPayload("create"),
  }
  const exists = await gitRevExists(payloads.check)
  if (exists) {
    result.status = "exists"
    core.error(`publish('${payloads.check.tag}'): release exists with tag.`)
  } else {
    const created = await gitRevCreate(payloads.create)
    result.status = "created"
    core.notice(`publish('${payloads.create.tag_name}'): created release with tag.`)
    core.info(`  -> released at: ${created.html_url}`)
  }
  return result
}
