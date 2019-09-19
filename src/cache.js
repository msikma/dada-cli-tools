// dada-cli-tools - Libraries for making CLI programs <https://github.com/msikma/dada-cli-tools>
// © MIT license

import fs from 'fs'
import { dirname } from 'path'
import { ensureDir } from './util/fs'
import { writeFileAsync, readFileAsync, statAsync } from './promisified/fs'

const settings = {
  baseDir: null,
  // 10 minutes in seconds.
  validSeconds: 600
}

/** Sets the base directory used for cache filenames. */
export const setBaseDir = baseDir => settings.baseDir = baseDir

/** Sets the duration that a cache file is valid in seconds. */
export const setValidSeconds = secs => settings.validSeconds = secs

/** Attaches the base directory to a path, unless it's an absolute path. */
const withBaseDir = path => {
  if (path[0] === '/') return path
  if (settings.baseDir) {
    return settings.baseDir + path
  }
  return path
}

/** Checks to see if a file has gone stale. */
const isFileStale = async (cachePath, validSeconds = settings.validSeconds) => {
  const curr = (+new Date())
  const stat = await statAsync(cachePath)
  // Convert seconds to ms to compare it with stat.
  return (curr - (validSeconds * 1000)) > stat.mtimeMs
}

/** Simple check to see if a file exists. Returns a boolean. */
const cacheFileExists = async (cachePath) => {
  try {
    await fs.promises.access(cachePath)
    return true
  }
  catch (e) {
    return false
  }
}

/**
 * Returns the data stored in a cache file and its metadata.
 *
 * A given cache path will get the base directory appended to it if one
 * has been set. Then it's checked to exist and whether it's recent enough
 * to be relevant, and finally it's returned along with some metadata about the request.
 *
 * Whether a file is stale is determined entirely by the file's mtime.
 * If a file was saved longer ago than the 'validSeconds' time, it's considered stale.
 *
 * In most cases, the data will be JSON that needs to be parsed. By default this does so.
 */
export const readCacheFile = async (cachePath, validSeconds = settings.validSeconds, parseJSON = true) => {
  const path = withBaseDir(cachePath)
  const exists = await cacheFileExists(path)
  if (!exists) {
    return { exists, isStale: null, path, validSeconds, data: null }
  }
  const isStale = await isFileStale(path, validSeconds)
  if (isStale) {
    return { exists, isStale, path, validSeconds, data: null }
  }

  const dataRaw = await readFileAsync(path)
  const data = parseJSON ? JSON.parse(dataRaw) : dataRaw
  return { exists, isStale, path, validSeconds, data }
}

/**
 * Basic cache reading function.
 *
 * Unlike readCacheFile(), this only returns the actual file data without the metadata.
 * If there is no cache for some reason, this returns null.
 */
export const readCache = async (cachePath, validSeconds = settings.validSeconds, parseJSON = true) => {
  const cache = await readCacheFile(cachePath, validSeconds, parseJSON)
  return cache.data
}

/**
 * Writes data to a cache file.
 *
 * By default this will create a new directory if it doesn't exist.
 * Returns a boolean as result.
 */
export const writeCache = async (dataRaw, cachePath, toJSON = true, makeDir = true, cleanJSON = true, encoding = 'utf8') => {
  const path = withBaseDir(cachePath)

  // Ensure the cache dir exists. TODO: need an error handler here
  if (makeDir) {
    const dir = dirname(path)
    await ensureDir(dir)
  }

  const data = toJSON ? JSON.stringify(dataRaw, null, cleanJSON ? 2 : null) : dataRaw
  const success = await writeFileAsync(path, data, encoding)
  return success
}
