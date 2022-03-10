"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getProgname = exports.readJSON = exports.ensureDir = exports.fileExists = exports.fileIsWritable = exports.readDataFallback = exports.requireDataFallback = exports.writeFileSafely = exports.getUnusedFilename = exports.changeExtension = exports.resolveTilde = exports.formatBytes = exports.getFilesize = void 0;

var _path = _interopRequireDefault(require("path"));

var _os = _interopRequireDefault(require("os"));

var _filesize = _interopRequireDefault(require("filesize"));

var _fastGlob = _interopRequireDefault(require("fast-glob"));

var _fs = require("fs");

var _process = _interopRequireDefault(require("process"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// dada-cli-tools - Libraries for making CLI programs <https://github.com/msikma/dada-cli-tools>
// © MIT license

/** Max number of times we'll try to figure out a different filename in writeFileSafely(). */
const MAX_FILENAME_RETRIES = 999;
/** Returns the formatted size of a file. */

const getFilesize = async (filepath, opts = {}) => {
  const stat = await _fs.promises.stat(filepath);
  return {
    formatted: formatBytes(stat.size, opts),
    bytes: stat.size
  };
};
/** Returns a formatted version of a given number of bytes. */


exports.getFilesize = getFilesize;

const formatBytes = (bytes, opts = {}) => {
  return (0, _filesize.default)(bytes, {
    base: 10,
    round: 1,
    ...opts
  });
};
/** This modifies the tilde (~) to point to the user's home. */


exports.formatBytes = formatBytes;

const resolveTilde = (filepath, deslash = true, resolve = true, homedir = _os.default.homedir()) => {
  let fpath = filepath.trim(); // The tilde is only valid if it's at the start of the string.

  if (fpath.startsWith('~')) {
    fpath = homedir + fpath.slice(1);
  } // Optionally, fully resolve the path (which also deslashes it).


  if (resolve) {
    return _path.default.resolve(fpath);
  } // Optionally, deslash the path (remove trailing / character).


  if (deslash) {
    if (fpath === '/') return fpath;
    return fpath.slice(-1) === '/' ? fpath.slice(0, -1) : fpath;
  }

  return fpath;
};
/**
 * Changes a file's extension.
 */


exports.resolveTilde = resolveTilde;

const changeExtension = (filename, ext) => {
  const parsed = _path.default.parse(filename);

  const extension = ext.startsWith('.') ? ext.slice(1) : ext;
  return `${parsed.name}.${extension}`;
};
/**
 * Checks a given filename to see if it exists, and if it does, return a different suggestion.
 * 
 * This also returns a boolean for whether or not the original filename existed.
 *
 * E.g. if 'file.jpg' exists, this might return 'file 1.jpg' or 'file 22.jpg'.
 */


exports.changeExtension = changeExtension;

const getUnusedFilename = async (filepath, {
  separator = ' ',
  limit = 999
} = {}) => {
  const full = _path.default.resolve(filepath);

  const parsed = _path.default.parse(full);

  const prefix = filepath.replace(parsed.base, '');

  if (!(await fileExists(full))) {
    return [filepath, false];
  }

  const files = toKeys(await (0, _fastGlob.default)(`${parsed.name}${separator}*${parsed.ext}`, {
    cwd: parsed.dir
  }));
  let suffix = 0;

  while (true) {
    const name = `${parsed.name}${separator}${++suffix}${parsed.ext}`;

    if (!files[name]) {
      return [`${prefix}${name}`, true];
    }

    if (suffix > limit) {
      break;
    }
  }

  return [null, true];
};
/**
 * Writes a file "safely" - if the target filename exists, a different name will be chosen.
 * 
 * Uses the same arguments as fs.writeFile(). If 'errorOnExisting' is true, this function
 * throws if the file already existed instead of writing to a new file.
 */


exports.getUnusedFilename = getUnusedFilename;

const writeFileSafely = async (target, content, options, {
  errorOnExisting = false
} = {}) => {
  const [name, existed] = await getUnusedFilename(target);

  if (existed && errorOnExisting) {
    throw new Error('writeFileSafely: file existed and errorOnExisting is true');
  }

  if (name == null) {
    throw new Error('writeFileSafely: could not find an unused filename');
  }

  await _fs.promises.writeFile(name, content, options);
  return [name, existed];
};
/**
 * Returns the require() result of a Javascript file, or a fallback object if it doesn't exist.
 * 
 * Also returns a boolean indicating whether the file existed or not.
 * 
 * Errors other than the file not existing are bubbled.
 */


exports.writeFileSafely = writeFileSafely;

const requireDataFallback = (filepath, defaultData) => {
  try {
    const data = require(filepath);

    return [data, true];
  } catch (err) {
    if (err.code === 'MODULE_NOT_FOUND') {
      return [defaultData, false];
    } else {
      throw err;
    }
  }
};
/**
 * Returns either the JSON data of a file, or a fallback object if it doesn't exist.
 * 
 * Also returns a boolean indicating whether the file existed or not.
 * 
 * Errors other than the file not existing are bubbled.
 */


exports.requireDataFallback = requireDataFallback;

const readDataFallback = async (filepath, defaultData, encoding) => {
  try {
    const data = await _fs.promises.readFile(filepath, encoding);
    return [JSON.parse(data), true];
  } catch (err) {
    if (err.code === 'ENOENT') {
      return [defaultData, false];
    } else {
      throw err;
    }
  }
};
/** Checks whether we can access (read and modify) a path. */


exports.readDataFallback = readDataFallback;

const fileIsWritable = async filepath => {
  try {
    // If access is possible, this will return null. Failure will throw.
    return (await _fs.promises.access(filepath, _fs.constants.F_OK | _fs.constants.W_OK)) == null;
  } catch (err) {
    return false;
  }
};
/** Checks whether we can access (read) a file. As canAccess(). */


exports.fileIsWritable = fileIsWritable;

const fileExists = async filepath => {
  try {
    return (await _fs.promises.access(filepath, _fs.constants.F_OK)) == null;
  } catch (err) {
    return false;
  }
};
/** Ensures that a directory exists. Returns a promise. */


exports.fileExists = fileExists;

const ensureDir = async filepath => {
  try {
    await _fs.promises.mkdir(filepath, {
      recursive: true
    });
    return true;
  } catch (err) {
    return false;
  }
};
/** Loads a JSON file, either sync or async. */


exports.ensureDir = ensureDir;

const readJSON = (filepath, async = true, encoding = 'utf8') => {
  if (async) {
    return readJSONAsync(filepath, encoding);
  }

  return JSON.parse((0, _fs.readFileSync)(filepath, encoding));
};
/** Returns the name of the currently running program. */


exports.readJSON = readJSON;

const getProgname = () => _path.default.basename(_process.default.argv[1]);
/** Loads a JSON file async. */


exports.getProgname = getProgname;

const readJSONAsync = async (filepath, encoding = 'utf8') => {
  const data = await _fs.promises.readFile(filepath, encoding);
  const content = JSON.parse(data);
  return content;
};