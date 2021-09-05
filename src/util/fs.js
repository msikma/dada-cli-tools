// dada-cli-tools - Libraries for making CLI programs <https://github.com/msikma/dada-cli-tools>
// © MIT license

import path from 'path'
import os from 'os'
import filesize from 'filesize'
import { promises as fs, constants, readFileSync } from 'fs'
import mkdirp from 'mkdirp'
import process from 'process'

/** Max number of times we'll try to figure out a different filename in writeFileSafely(). */
const MAX_FILENAME_RETRIES = 99

/** Returns the formatted size of a file. */
export const formatFilesize = async (filepath, opts = {}) => {
  const stat = await fs.stat(filepath)
  return formatBytes(stat.size, opts)
}

/** Returns a formatted version of a given number of bytes. */
export const formatBytes = (bytes, opts = {}) => {
  return filesize(bytes, { base: 10, round: 1, ...opts })
}

/** This modifies the tilde (~) to point to the user's home. */
export const resolveTilde = (filepath, deslash = true, resolve = true, homedir = os.homedir()) => {
  let fpath = filepath.trim()

  // The tilde is only valid if it's at the start of the string.
  if (fpath.startsWith('~')) {
    fpath = homedir + fpath.slice(1)
  }

  // Optionally, fully resolve the path (which also deslashes it).
  if (resolve) {
    return path.resolve(fpath)
  }

  // Optionally, deslash the path (remove trailing / character).
  if (deslash) {
    if (fpath === '/') return fpath
    return fpath.slice(-1) === '/' ? fpath.slice(0, -1) : fpath
  }

  return fpath
}

/**
 * Changes a file's extension.
 */
export const changeExtension = (filename, ext) => {
  const parsed = path.parse(filename)
  return `${parsed.name}.${ext}`
}

/**
 * Determines a filename that does not exist yet.
 *
 * E.g. if 'file.jpg' exists, this might return 'file1.jpg' or 'file22.jpg'.
 * TODO: this should be simplified, by getting a full list of files and then
 * determining the new name once, rather than checking each possibility.
 */
export const getSafeFilename = async (target, separator = '', allowSafeFilename = true, limit = MAX_FILENAME_RETRIES) => {
  const { name, ext } = path.parse(target)

  let targetName = { name, suffix: 0 }, targetNameStr
  while (true) {
    // Increment the name suffix and see if we can create this file.
    targetNameStr = `${targetName.name}${separator}${targetName.suffix > 0 ? targetName.suffix : ''}.${ext}`

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
export const canAccess = async (filepath) => {
  try {
    // If access is possible, this will return null. Failure will throw.
    return await fs.access(filepath, constants.F_OK | constants.W_OK) == null
  }
  catch (err) {
    return false
  }
}

/** Checks whether we can access (read) a file. As canAccess(). */
export const fileExists = async (filepath) => {
  try {
    return await fs.access(filepath, constants.F_OK) == null
  }
  catch (err) {
    return false
  }
}

/** Ensures that a directory exists. Returns a promise. */
export const ensureDir = async (filepath) => {
  return !!(await fs.mkdir(filepath, { recursive: true }))
}

/** Loads a JSON file, either sync or async. */
export const readJSON = (filepath, async = true, encoding = 'utf8') => {
  if (async) {
    return readJSONAsync(filepath, encoding)
  }
  return JSON.parse(readFileSync(filepath, encoding))
}

/** Returns the name of the currently running program. */
export const progName = () => (
  path.basename(process.argv[1])
)

/** Loads a JSON file async. */
const readJSONAsync = async (filepath, encoding = 'utf8') => {
  const data = await fs.readFile(filepath, encoding)
  const content = JSON.parse(data)
  return content
}
