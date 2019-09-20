"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.writeCache = exports.readCache = exports.readCacheFile = exports.setValidSeconds = exports.setBaseDir = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _path = require("path");

var _utils = require("./utils");

var _fs2 = require("./util/fs");

var _fs3 = require("./promisified/fs");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// dada-cli-tools - Libraries for making CLI programs <https://github.com/msikma/dada-cli-tools>
// © MIT license
// Setting a base directory makes it easy to run the cache functions.
// A good path is in ~/.cache/<directory> - the user level cache store.
const settings = {
  baseDir: null,
  // 10 minutes in seconds.
  validSeconds: 600
  /** Sets the base directory used for cache filenames. */

};

const setBaseDir = baseDir => settings.baseDir = baseDir;
/** Sets the duration that a cache file is valid in seconds. */


exports.setBaseDir = setBaseDir;

const setValidSeconds = secs => settings.validSeconds = secs;
/** Attaches the base directory to a path, unless it's an absolute path. */


exports.setValidSeconds = setValidSeconds;

const withBaseDir = path => {
  if (path[0] === '/') return path;

  if (settings.baseDir) {
    return settings.baseDir + path;
  }

  return path;
};
/** Checks to see if a file has gone stale. */


const isFileStale = async (cachePath, validSeconds = settings.validSeconds) => {
  const curr = +new Date();
  const stat = await (0, _fs3.statAsync)(cachePath); // Convert seconds to ms to compare it with stat.

  return curr - validSeconds * 1000 > stat.mtimeMs;
};
/** Simple check to see if a file exists. Returns a boolean. */


const cacheFileExists = async cachePath => {
  try {
    const exists = await _fs.default.promises.access(cachePath);
    return exists;
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


const readCacheFile = async (cachePath, validSeconds = settings.validSeconds, parseJSON = true, isSimple = false) => {
  const path = withBaseDir(cachePath); // If isSimple is true, it means we're not going to use the metadata. Only the file contents.

  (0, _utils.logDebug)('Reading cache from file', isSimple ? '(no metadata)' : null, '- valid seconds', validSeconds, '- path', path);
  const exists = await cacheFileExists(path);

  if (!exists) {
    (0, _utils.logDebug)('Cache file does not exist');
    return {
      exists,
      isStale: null,
      path,
      validSeconds,
      data: null
    };
  }

  const isStale = await isFileStale(path, validSeconds);

  if (isStale) {
    (0, _utils.logDebug)('Cache file is stale');
    return {
      exists,
      isStale,
      path,
      validSeconds,
      data: null
    };
  }

  const dataRaw = await (0, _fs3.readFileAsync)(path);
  const data = parseJSON ? JSON.parse(dataRaw) : dataRaw;
  (0, _utils.logDebug)('Cache read and parsed');
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
 * Unlike readCacheFile(), this only returns the actual file data without the metadata.
 * If there is no cache for some reason, this returns null.
 */


exports.readCacheFile = readCacheFile;

const readCache = async (cachePath, validSeconds = settings.validSeconds, parseJSON = true) => {
  const cache = await readCacheFile(cachePath, validSeconds, parseJSON, true);
  return cache.data;
};
/**
 * Writes data to a cache file.
 *
 * By default this will create a new directory if it doesn't exist.
 * Returns a boolean as result.
 */


exports.readCache = readCache;

const writeCache = async (dataRaw, cachePath, toJSON = true, makeDir = true, cleanJSON = true, encoding = 'utf8') => {
  const path = withBaseDir(cachePath);
  (0, _utils.logDebug)('Writing cache to file', path); // Ensure the cache dir exists. TODO: need an error handler here

  if (makeDir) {
    const dir = (0, _path.dirname)(path);
    const exists = await _fs.default.promises.access(dir);

    if (!exists) {
      (0, _utils.logDebug)('Needed to make directory', dir);
      await (0, _fs2.ensureDir)(dir);
    }
  }

  const data = toJSON ? JSON.stringify(dataRaw, null, cleanJSON ? 2 : null) : dataRaw;
  const success = await (0, _fs3.writeFileAsync)(path, data, encoding);
  (0, _utils.logDebug)('Wrote cache to file', success);
  return success;
};

exports.writeCache = writeCache;