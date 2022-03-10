"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.lockDirectory = exports.openCacheFile = exports.openCache = exports.readConfigFile = exports.readConfig = exports.readTimestampFile = exports.writeTimestampFile = exports.readTimestamp = exports.writeTimestamp = exports.getConfigPath = exports.getCachePath = exports.makeProgTools = void 0;

var _promises = _interopRequireDefault(require("fs/promises"));

var _path = _interopRequireDefault(require("path"));

var _properLockfile = _interopRequireDefault(require("proper-lockfile"));

var _log = require("./log");

var _fs = require("./util/fs");

var _text = require("./util/text");

var _output = require("./util/output");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// dada-cli-tools - Libraries for making CLI programs <https://github.com/msikma/dada-cli-tools>
// © MIT license
// Setting a base directory makes it easy to run the cache functions.
// A good path is in ~/.cache/<directory> - the user level cache store.
const settings = {
  cacheDir: (0, _fs.resolveTilde)('~/.cache/'),
  configDir: (0, _fs.resolveTilde)('~/.config/'),
  lockfile: {
    stale: 10000,
    update: 2000
  }
};
/**
 * Returns a set of decorated functions for a specific program name.
 */

const makeProgTools = progname => {
  const wrapFn = fn => (...args) => fn(progname, ...args);

  return {
    openCache: wrapFn(openCache),
    readConfig: wrapFn(readConfig),
    readTimestamp: wrapFn(readTimestamp),
    writeTimestamp: wrapFn(writeTimestamp),
    getCachePath: wrapFn(getCachePath),
    getConfigPath: wrapFn(getConfigPath)
  };
};
/** Returns the path to a file in the config directory. */


exports.makeProgTools = makeProgTools;

const getCachePath = (progname, filepath = null) => {
  return `${settings.cacheDir}/${progname}${filepath ? `/${filepath}` : ''}`;
};
/** Returns the path to a file in the config directory. */


exports.getCachePath = getCachePath;

const getConfigPath = (progname, filepath = null) => {
  return `${settings.configDir}/${progname}${filepath ? `/${filepath}` : ''}`;
};
/** Writes a timestamp file indicating when a program last ran. */


exports.getConfigPath = getConfigPath;

const writeTimestamp = async (progname, name = 'lastrun', ext = 'txt', pathOverride = null) => {
  return writeTimestampFile(pathOverride ? pathOverride : getCachePath(progname, `${name}${ext ? `.${ext}` : ''}`));
};
/** Reads a timestamp file indicating when a program last ran. */


exports.writeTimestamp = writeTimestamp;

const readTimestamp = async (progname, name = 'lastrun', ext = 'txt', pathOverride = null) => {
  return readTimestampFile(pathOverride ? pathOverride : getCachePath(progname, `${name}${ext ? `.${ext}` : ''}`));
};
/** Writes a timestamp file. */


exports.readTimestamp = readTimestamp;

const writeTimestampFile = async filepath => {
  await _promises.default.writeFile(`${filepath}`, (0, _text.makeParseableDate)(), 'utf8');
};
/** Reads a timestamp file; returns null if none exists. */


exports.writeTimestampFile = writeTimestampFile;

const readTimestampFile = async filepath => {
  let value;

  try {
    value = await _promises.default.readFile(`${filepath}`, 'utf8');
  } catch (err) {
    if (err.code === 'ENOENT') {
      return null;
    } else {
      throw err;
    }
  }

  return new Date(value);
};
/**
 * Reads a program's config file.
 * 
 * Either a .js or .json file is read (in that order). If 'cfgFile' is provided,
 * it will be used instead.
 */


exports.readTimestampFile = readTimestampFile;

const readConfig = async (progname, defaultData, options, pathOverride = null) => {
  const configJS = getConfigPath(progname, `config.js`);
  const configJSON = getConfigPath(progname, `config.json`);

  if (pathOverride) {
    const parsed = _path.default.parse(pathOverride);

    return readConfigFile(pathOverride, defaultData, { ...options,
      type: parsed.ext.slice(1)
    });
  }

  if (options?.type) {
    return readConfigFile(getConfigPath(progname, `config.${options.type}`), defaultData, options);
  }

  if (await (0, _fs.fileExists)(configJS)) {
    return readConfigFile(configJS, defaultData, { ...options,
      type: 'js'
    });
  }

  return readConfigFile(configJSON, defaultData, { ...options,
    type: 'json'
  });
};
/**
 * Reads a config file and returns its contents.
 * 
 * This takes either a .js file or a .json file. If a .js file is passed, it's required()
 * and its result returned. .json files are passed through JSON.parse().
 * 
 * Throws if an error occurs other than the file not existing.
 */


exports.readConfig = readConfig;

const readConfigFile = async (filepath, defaultData = {}, userOptions = {}) => {
  const defaultOptions = {
    encoding: 'utf8',
    doLogging: false,
    logFn: null,
    type: null,
    required: false,
    create: true
  };
  const options = { ...defaultOptions,
    ...userOptions
  };
  if (!options.type) throw new Error('readConfigFile(): config type needed');

  if (options.type === 'js') {
    const [data, exists] = (0, _fs.requireDataFallback)(filepath, defaultData);

    if (!exists && options.required) {
      throw new Error(`readConfigFile(): config file does not exist: ${filepath}`);
    }

    if (!exists && options.create) {
      await (0, _fs.ensureDir)(_path.default.dirname(filepath));
      await _promises.default.writeFile(filepath, (0, _output.outputJS)(data), options.encoding);
    }

    return data;
  }

  if (options.type === 'json') {
    const [data, exists] = await (0, _fs.readDataFallback)(filepath, defaultData, options.encoding);

    if (!exists && options.required) {
      throw new Error(`readConfigFile(): config file does not exist: ${filepath}`);
    }

    if (!exists && options.create) {
      await (0, _fs.ensureDir)(_path.default.dirname(filepath));
      await _promises.default.writeFile(filepath, JSON.stringify(data, null, 2), options.encoding);
    }

    return data;
  }

  throw new Error(`readConfigFile(): invalid config type: ${options.type}`);
};
/** Opens a program's cache file. */


exports.readConfigFile = readConfigFile;

const openCache = async (progname, defaultData, options, pathOverride = null) => {
  return await openCacheFile(pathOverride ? pathOverride : getCachePath(progname, `cache.json`), defaultData, options);
};
/**
 * Opens a cache file and returns an object that can be used to manipulate it.
 * 
 * The object has three items:
 * 
 *     data     reference to the data object
 *     read()   reads data from the file
 *     write()  writes current data to the file
 */


exports.openCache = openCache;

const openCacheFile = async (filepath, defaultData = {}, userOptions = {}) => {
  const defaultOptions = {
    encoding: 'utf8',
    doLogging: false,
    logFn: null,
    ensureCacheLock: true,
    lockOptions: {}
  };
  const options = { ...defaultOptions,
    ...userOptions
  };
  const state = {
    cacheData: null,
    firstRead: true
  };

  const filedir = _path.default.dirname(filepath);

  const log = (0, _log.getLogFn)(options.doLogging, options.logFn); // Ensure the directory exists.

  await (0, _fs.ensureDir)(filedir); // Check if we can get a lock on the directory.

  let releaseWriteLock;
  let isReadOnly;

  try {
    releaseWriteLock = await lockDirectory(filedir, options.lockOptions);
    isReadOnly = false;
  } catch (err) {
    if (err.code === 'ELOCKED') {
      isReadOnly = true;
    } else {
      throw err.code;
    }
  }

  const read = async () => {
    log(`Reading cache from file${!state.firstRead ? ' (data in memory is overwritten):' : ''}`, filepath);
    state.firstRead = false;
    const [data, exists] = await (0, _fs.readDataFallback)(filepath, defaultData, options.encoding);

    if (!exists) {
      log(`Cache file does not exist:`, filepath);
    }

    state.cacheData = data;
  };

  const write = async () => {
    if (isReadOnly) {
      throw new Error(`Can't write to cache file as the file is locked:`, filepath);
    }

    log('Writing cache to file:', filepath);
    await (0, _fs.ensureDir)(filedir);
    await _promises.default.writeFile(filepath, JSON.stringify(state.cacheData, null, 2), options.encoding);
    return true;
  };

  await read();
  return {
    data: state.cacheData,
    filepath: filepath,
    releaseWriteLock,
    isReadOnly,
    read,
    write
  };
};
/**
 * Locks a given directory and returns a release function.
 * 
 * This is used to ensure that only one process is currently working with a given directory,
 * and can be used to ensure that a program is only running one instance.
 * 
 * If a given directory is already locked, this will throw an ELOCKED error.
 * 
 * The release function does not necessarily need to be manually called;
 * the lock will be released on program exit automatically.
 */


exports.openCacheFile = openCacheFile;

const lockDirectory = async (dirpath, userOpts = {}) => {
  const pathResolved = _path.default.resolve(dirpath);

  const opts = { ...settings.lockfile,
    lockfilePath: `${pathResolved}/__dir.lock`,
    ...userOpts
  };

  const releaseFn = _properLockfile.default.lock(dirpath, opts);

  return releaseFn;
};

exports.lockDirectory = lockDirectory;