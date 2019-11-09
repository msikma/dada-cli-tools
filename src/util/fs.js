// dada-cli-tools - Libraries for making CLI programs <https://github.com/msikma/dada-cli-tools>
// © MIT license

import { promises as fs, constants } from 'fs'
import { homedir } from 'os'
import { parse, basename } from 'path'
import mkdirp from 'mkdirp'
import process from 'process'

/** This modifies the tilde (~) to point to the user's home. */
export const resolveTilde = (pathStr) => {
  let path = pathStr.trim()
  // The tilde is only valid if it's at the start of the string.
  if (path.startsWith('~')) {
    path = homedir() + path.slice(1)
  }
  return path
}

/** Checks whether we can access (read, modify) a path. */
export const canAccess = async (path) => {
  try {
    // If access is possible, this will return null. Failure will throw.
    return await fs.access(path, constants.F_OK | constants.W_OK) == null
  }
  catch (err) {
    return false
  }
}

/** Checks whether we can access (read) a file. As canAccess(). */
export const fileExists = async (path) => {
  try {
    return await fs.access(path, constants.F_OK) == null
  }
  catch (err) {
    return false
  }
}

/** Ensures that a directory exists. Returns a promise. */
export const ensureDir = (path) => new Promise((resolve, reject) => (
  mkdirp(path, (err) => {
    if (err) return reject(err)
    return resolve(true)
  })
))

/** Returns the directory name for a full path. */
export const dirName = (path) => {
  const info = parse(path)
  return info.dir
}

/** Returns the name of the currently running program. */
export const progName = () => (
  basename(process.argv[1])
)
