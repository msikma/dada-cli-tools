// dada-cli-tools - Libraries for making CLI programs <https://github.com/msikma/dada-cli-tools>
// © MIT license

import { promises as fs, constants, readFileSync } from 'fs'
import { homedir } from 'os'
import { parse, basename } from 'path'
import mkdirp from 'mkdirp'
import process from 'process'

/** Max number of times we'll try to figure out a different filename in writeFileSafely(). */
const MAX_FILENAME_RETRIES = 99

/** This modifies the tilde (~) to point to the user's home. */
export const resolveTilde = (pathStr) => {
  let path = pathStr.trim()
  // The tilde is only valid if it's at the start of the string.
  if (path.startsWith('~')) {
    path = homedir() + path.slice(1)
  }
  return path
}

/** Splits up a filename into the basename (including the path) and file extension. */
export const splitFilename = filename => {
  const fn = String(filename)
  const bits = fn.split('.')
  if (bits.length === 1) {
    return { basename: fn, extension: '' }
  }
  const basename = bits.slice(0, -1).join('.')
  const extension = bits.slice(-1)[0]
  return {
    basename,
    extension
  }
}

/**
 * Changes a file's extension.
 */
export const changeExtension = (filename, ext) => {
  const { basename } = splitFilename(filename)
  return `${basename}.${ext}`
}

/**
 * Determines a filename that does not exist yet.
 *
 * E.g. if 'file.jpg' exists, this might return 'file1.jpg' or 'file22.jpg'.
 * TODO: this should be simplified, by getting a full list of files and then
 * determining the new name once, rather than checking each possibility.
 */
export const getSafeFilename = async (target, separator = '', allowSafeFilename = true, limit = MAX_FILENAME_RETRIES) => {
  const { basename, extension } = splitFilename(target)

  let targetName = { basename, suffix: 0 }, targetNameStr
  while (true) {
    // Increment the name suffix and see if we can create this file.
    targetNameStr = `${targetName.basename}${separator}${targetName.suffix > 0 ? targetName.suffix : ''}.${extension}`

    if (await fileExists(targetNameStr)) {
      targetName.suffix += 1

      // If we've tried too many times, fail and return information.
      if (allowSafeFilename || targetName.suffix >= limit) {
        return {
          success: false,
          attempts: targetName.suffix,
          separator: separator,
          passedFilename: target,
          targetFilename: targetNameStr,
          hasModifiedFilename: target !== targetNameStr
        }
      }
    }
    else {
      return {
        success: true,
        attempts: targetName.suffix,
        separator: separator,
        passedFilename: target,
        targetFilename: targetNameStr,
        hasModifiedFilename: target !== targetNameStr
      }
    }
  }
}

/** Writes a file "safely" - if the target filename exists, a different name will be chosen. */
export const writeFileSafely = async (target, content, options) => {
  const safeFn = await getSafeFilename(target)
  if (!safeFn.success) {
    return safeFn
  }

  const result = await fs.writeFile(safeFn.targetFilename, content, options)
  return {
    ...safeFn,
    success: result
  }
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

/** Ensures that a directory exists. Returns a promise resolving to a boolean. */
export const ensureDirBool = async path => {
  try {
    await ensureDir(path)
    return true
  }
  catch (_) {
    return false
  }
}

/** Loads a JSON file synchronously. */
export const readJSONSync = (path, encoding = 'utf8') => {
  return JSON.parse(readFileSync(path, encoding))
}

/** Loads a JSON file asynchronously. */
export const readJSON = async (path, encoding = 'utf8') => {
  const data = await fs.readFile(path, encoding)
  const content = JSON.parse(data)
  return content
}

/** Returns the directory name for a full path. */
export const dirName = (path) => {
  const info = parse(path)
  return info.dir
}

/** Returns the name of the currently running program. */
export const progName = () => (
  basename(process.argv[1])
)
