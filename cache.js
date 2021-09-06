"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getUserConfig = exports.readCacheDataLogged = exports.writeCacheLogged = exports.readCacheLogged = exports.writeCache = exports.readCacheData = exports.readCache = exports.setNeverExpire = exports.setValidSeconds = exports.setBaseDir = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _path = require("path");

var _lodash = require("lodash");

var _log = require("./log");

var _fs2 = require("./util/fs");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// dada-cli-tools - Libraries for making CLI programs <https://github.com/msikma/dada-cli-tools>
// © MIT license
// Setting a base directory makes it easy to run the cache functions.
// A good path is in ~/.cache/<directory> - the user level cache store.
const settings = {
  cacheDir: (0, _fs2.resolveTilde)('~/.cache/'),
  configDir: (0, _fs2.resolveTilde)('~/.config/'),
  // 10 minutes in seconds. 0 means 'never expire'.
  validSeconds: 600
};
/** Sets the base directory used for cache filenames. */

const setBaseDir = baseDir => settings.cacheDir = baseDir;
/** Sets the duration that a cache file is valid in seconds. */


exports.setBaseDir = setBaseDir;

const setValidSeconds = secs => settings.validSeconds = secs;
/** Sets the cache to never expire. */


exports.setValidSeconds = setValidSeconds;

const setNeverExpire = () => settings.validSeconds = 0;
/** Attaches the base directory to a path, unless it's an absolute path. */


exports.setNeverExpire = setNeverExpire;

const withBaseDir = path => {
  if (path[0] === '/') return path;

  if (settings.cacheDir) {
    return settings.cacheDir + path;
  }

  return path;
};
/** Checks to see if a file has gone stale. */


const isFileStale = async (cachePath, validSeconds = settings.validSeconds) => {
  // If validSeconds is 0, cache files never go stale.
  if (settings.validSeconds === 0) return false;
  const curr = +new Date();
  const statData = await _fs.default.promises.stat(cachePath); // Convert seconds to ms to compare it with stat.

  return curr - validSeconds * 1000 > statData.mtimeMs;
};
/** Simple check to see if a file exists. Returns a boolean. */


const cacheFileExists = async cachePath => {
  try {
    await _fs.default.promises.access(cachePath);
    return true;
  } catch (e) {
    return false;
  }
};
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


const readCache = async (cachePath, defaults = {}, validSeconds = settings.validSeconds, parseJSON = true, isSimple = false, doLogging = false) => {
  const path = withBaseDir(cachePath); // If isSimple is true, it means we're not going to use the metadata. Only the file contents.

  doLogging && (0, _log.logDebug)('Reading cache from file', isSimple ? '(no metadata)' : null, '- valid seconds', validSeconds, '- path', path);
  const exists = await cacheFileExists(path);

  if (!exists) {
    doLogging && (0, _log.logDebug)('Cache file does not exist');
    return {
      exists,
      isStale: null,
      path,
      validSeconds,
      data: defaults
    };
  }

  const isStale = await isFileStale(path, validSeconds);

  if (isStale) {
    doLogging && (0, _log.logDebug)('Cache file is stale');
    return {
      exists,
      isStale,
      path,
      validSeconds,
      data: defaults
    };
  }

  const dataRaw = await _fs.default.promises.readFile(path);
  const data = parseJSON ? JSON.parse(dataRaw) : dataRaw;
  doLogging && (0, _log.logDebug)('Cache read and parsed');
  return {
    exists,
    isStale,
    path,
    validSeconds,
    data
  };
};
/**
 * Basic cache reading function.
 *
 * Unlike readCache(), this only returns the actual file data without the metadata.
 * If there is no cache for some reason, this returns the defaults.
 */


exports.readCache = readCache;

const readCacheData = async (cachePath, defaults = {}, validSeconds = settings.validSeconds, parseJSON = true, doLogging = false) => {
  const cache = await readCache(cachePath, defaults, validSeconds, parseJSON, true, doLogging);
  return cache.data;
};
/**
 * Writes data to a cache file.
 *
 * By default this will create a new directory if it doesn't exist.
 * Returns a boolean as result.
 */


exports.readCacheData = readCacheData;

const writeCache = async (cachePath, dataRaw, toJSON = true, makeDir = true, cleanJSON = true, encoding = 'utf8', doLogging = false) => {
  const path = withBaseDir(cachePath);
  doLogging && (0, _log.logDebug)('Writing cache to file', path); // Ensure the cache dir exists. TODO: need an error handler here

  if (makeDir) {
    const dir = (0, _path.dirname)(path);

    try {
      await _fs.default.promises.access(dir);
    } catch (err) {
      doLogging && (0, _log.logDebug)('Needed to make directory', dir);
      await (0, _fs2.ensureDir)(dir);
    }
  }

  const data = toJSON ? JSON.stringify(dataRaw, null, cleanJSON ? 2 : null) : dataRaw;
  const success = await _fs.default.promises.writeFile(path, data, encoding);
  doLogging && (0, _log.logDebug)('Wrote cache to file', success);
  return success;
};
/** Call readCache() with doLogging = true. */


exports.writeCache = writeCache;
const readCacheLogged = (0, _lodash.partialRight)(readCache, true);
/** Call writeCache() with doLogging = true. */

exports.readCacheLogged = readCacheLogged;
const writeCacheLogged = (0, _lodash.partialRight)(writeCache, true);
/** Call readCacheData() with doLogging = true. */

exports.writeCacheLogged = writeCacheLogged;
const readCacheDataLogged = (0, _lodash.partialRight)(readCacheData, true);
/**
 * Retrieves config data from ~/.config/<progname> and creates a new file
 * if it doesn't exist.
 */

exports.readCacheDataLogged = readCacheDataLogged;

const getUserConfig = async (dirname, defaults = {}, doLogging = true) => {
  const dir = `${settings.configDir}${dirname}`;
  const path = `${dir}/config.json`;
  const configDefaults = (0, _lodash.cloneDeep)(defaults);
  doLogging && (0, _log.logDebug)('Reading config from file', path);

  try {
    await _fs.default.promises.access(dir);
  } catch (err) {
    doLogging && (0, _log.logDebug)('Needed to make directory', dir);
    await (0, _fs2.ensureDir)(dir);
  }

  let configData;

  try {
    configData = require(path);
    return configData;
  } catch (err) {
    // Create new file with defaults if the file wasn't found.
    if (err.code === 'MODULE_NOT_FOUND') {
      const success = await _fs.default.promises.writeFile(path, JSON.stringify(configDefaults, null, 2), 'utf8');
      doLogging && (0, _log.logDebug)('Wrote config to file', success);
      return configDefaults;
    } // Else, pass on the error we just got.
    else {
      throw err;
    }
  }
};

exports.getUserConfig = getUserConfig;