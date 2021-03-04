// dada-cli-tools - Libraries for making CLI programs <https://github.com/msikma/dada-cli-tools>
// © MIT license

import fs from 'fs'
import { dirname } from 'path'
import { partialRight, cloneDeep } from 'lodash'

import { logDebug } from './log'
import { ensureDir, resolveTilde } from './util/fs'

// Setting a base directory makes it easy to run the cache functions.
// A good path is in ~/.cache/<directory> - the user level cache store.
const settings = {
  cacheDir: resolveTilde('~/.cache/'),
  configDir: resolveTilde('~/.config/'),
  // 10 minutes in seconds.
  validSeconds: 600
}

/** Sets the base directory used for cache filenames. */
export const setBaseDir = baseDir => settings.cacheDir = baseDir

/** Sets the duration that a cache file is valid in seconds. */
export const setValidSeconds = secs => settings.validSeconds = secs

/** Attaches the base directory to a path, unless it's an absolute path. */
const withBaseDir = path => {
  if (path[0] === '/') return path
  if (settings.cacheDir) {
    return settings.cacheDir + path
  }
  return path
}

/** Checks to see if a file has gone stale. */
const isFileStale = async (cachePath, validSeconds = settings.validSeconds) => {
  const curr = (+new Date())
  const statData = await fs.promises.stat(cachePath)
  // Convert seconds to ms to compare it with stat.
  return (curr - (validSeconds * 1000)) > statData.mtimeMs
}

/** Simple check to see if a file exists. Returns a boolean. */
const cacheFileExists = async (cachePath) => {
  try {
    const exists = await fs.promises.access(cachePath)
    return exists
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
export const readCache = async (cachePath, validSeconds = settings.validSeconds, parseJSON = true, isSimple = false, doLogging = false) => {
  const path = withBaseDir(cachePath)
  // If isSimple is true, it means we're not going to use the metadata. Only the file contents.
  doLogging && logDebug('Reading cache from file', isSimple ? '(no metadata)' : null, '- valid seconds', validSeconds, '- path', path)
  const exists = await cacheFileExists(path)
  if (!exists) {
    doLogging && logDebug('Cache file does not exist')
    return { exists, isStale: null, path, validSeconds, data: null }
  }
  const isStale = await isFileStale(path, validSeconds)
  if (isStale) {
    doLogging && logDebug('Cache file is stale')
    return { exists, isStale, path, validSeconds, data: null }
  }

  const dataRaw = await fs.promises.readFile(path)
  const data = parseJSON ? JSON.parse(dataRaw) : dataRaw
  doLogging && logDebug('Cache read and parsed')
  return { exists, isStale, path, validSeconds, data }
}

/**
 * Basic cache reading function.
 *
 * Unlike readCache(), this only returns the actual file data without the metadata.
 * If there is no cache for some reason, this returns null.
 */
export const readCacheData = async (cachePath, validSeconds = settings.validSeconds, parseJSON = true, doLogging = false) => {
  const cache = await readCache(cachePath, validSeconds, parseJSON, true, doLogging)
  return cache.data
}

/**
 * Writes data to a cache file.
 *
 * By default this will create a new directory if it doesn't exist.
 * Returns a boolean as result.
 */
export const writeCache = async (dataRaw, cachePath, toJSON = true, makeDir = true, cleanJSON = true, encoding = 'utf8', doLogging = false) => {
  const path = withBaseDir(cachePath)
  doLogging && logDebug('Writing cache to file', path)

  // Ensure the cache dir exists. TODO: need an error handler here
  if (makeDir) {
    const dir = dirname(path)
    const exists = await fs.promises.access(dir)
    if (!exists) {
      doLogging && logDebug('Needed to make directory', dir)
      await ensureDir(dir)
    }
  }

  const data = toJSON ? JSON.stringify(dataRaw, null, cleanJSON ? 2 : null) : dataRaw
  const success = await fs.promises.writeFile(path, data, encoding)
  doLogging && logDebug('Wrote cache to file', success)
  return success
}

/** Call readCache() with doLogging = true. */
export const readCacheLogged = partialRight(readCache, true)

/** Call writeCache() with doLogging = true. */
export const writeCacheLogged = partialRight(writeCache, true)

/** Call readCacheData() with doLogging = true. */
export const readCacheDataLogged = partialRight(readCacheData, true)

/**
 * Retrieves config data from ~/.config/<progname> and creates a new file
 * if it doesn't exist.
 */
export const getUserConfig = async (dirname, defaults = {}, doLogging = true) => {
  const dir = `${settings.configDir}${dirname}`
  const path = `${dir}/config.json`
  const configDefaults = cloneDeep(defaults)
  doLogging && logDebug('Reading config from file', path)
  
  const exists = await fs.promises.access(dir)
  if (!exists) {
    doLogging && logDebug('Needed to make directory', dir)
    await ensureDir(dir)
  }

  let configData
  try {
    configData = require(path)
    return configData
  }
  catch (err) {
    // Create new file with defaults if the file wasn't found.
    if (err.code === 'MODULE_NOT_FOUND') {
      const success = await fs.promises.writeFile(path, JSON.stringify(configDefaults, null, 2), 'utf8')
      doLogging && logDebug('Wrote config to file', success)
      return configDefaults
    }
    // Else, pass on the error we just got.
    else  {
      throw err
    }
  }
}
