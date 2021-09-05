"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.progName = exports.readJSON = exports.ensureDir = exports.fileExists = exports.canAccess = exports.writeFileSafely = exports.getSafeFilename = exports.changeExtension = exports.resolveTilde = exports.formatBytes = exports.formatFilesize = void 0;

var _path = _interopRequireDefault(require("path"));

var _os = _interopRequireDefault(require("os"));

var _filesize = _interopRequireDefault(require("filesize"));

var _fs = require("fs");

var _mkdirp = _interopRequireDefault(require("mkdirp"));

var _process = _interopRequireDefault(require("process"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// dada-cli-tools - Libraries for making CLI programs <https://github.com/msikma/dada-cli-tools>
// © MIT license

/** Max number of times we'll try to figure out a different filename in writeFileSafely(). */
const MAX_FILENAME_RETRIES = 99;
/** Returns the formatted size of a file. */

const formatFilesize = async (filepath, opts = {}) => {
  const stat = await _fs.promises.stat(filepath);
  return formatBytes(stat.size, opts);
};
/** Returns a formatted version of a given number of bytes. */


exports.formatFilesize = formatFilesize;

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

  return `${parsed.name}.${ext}`;
};
/**
 * Determines a filename that does not exist yet.
 *
 * E.g. if 'file.jpg' exists, this might return 'file1.jpg' or 'file22.jpg'.
 * TODO: this should be simplified, by getting a full list of files and then
 * determining the new name once, rather than checking each possibility.
 */


exports.changeExtension = changeExtension;

const getSafeFilename = async (target, separator = '', allowSafeFilename = true, limit = MAX_FILENAME_RETRIES) => {
  const {
    name,
    ext
  } = _path.default.parse(target);

  let targetName = {
    name,
    suffix: 0
  },
      targetNameStr;

  while (true) {
    // Increment the name suffix and see if we can create this file.
    targetNameStr = `${targetName.name}${separator}${targetName.suffix > 0 ? targetName.suffix : ''}.${ext}`;

    if (await fileExists(targetNameStr)) {
      targetName.suffix += 1; // If we've tried too many times, fail and return information.

      if (allowSafeFilename || targetName.suffix >= limit) {
        return {
          success: false,
          attempts: targetName.suffix,
          separator: separator,
          passedFilename: target,
          targetFilename: targetNameStr,
          hasModifiedFilename: target !== targetNameStr
        };
      }
    } else {
      return {
        success: true,
        attempts: targetName.suffix,
        separator: separator,
        passedFilename: target,
        targetFilename: targetNameStr,
        hasModifiedFilename: target !== targetNameStr
      };
    }
  }
};
/** Writes a file "safely" - if the target filename exists, a different name will be chosen. */


exports.getSafeFilename = getSafeFilename;

const writeFileSafely = async (target, content, options) => {
  const safeFn = await getSafeFilename(target);

  if (!safeFn.success) {
    return safeFn;
  }

  const result = await _fs.promises.writeFile(safeFn.targetFilename, content, options);
  return { ...safeFn,
    success: result
  };
};
/** Checks whether we can access (read, modify) a path. */


exports.writeFileSafely = writeFileSafely;

const canAccess = async filepath => {
  try {
    // If access is possible, this will return null. Failure will throw.
    return (await _fs.promises.access(filepath, _fs.constants.F_OK | _fs.constants.W_OK)) == null;
  } catch (err) {
    return false;
  }
};
/** Checks whether we can access (read) a file. As canAccess(). */


exports.canAccess = canAccess;

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
  return !!(await _fs.promises.mkdir(filepath, {
    recursive: true
  }));
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

const progName = () => _path.default.basename(_process.default.argv[1]);
/** Loads a JSON file async. */


exports.progName = progName;

const readJSONAsync = async (filepath, encoding = 'utf8') => {
  const data = await _fs.promises.readFile(filepath, encoding);
  const content = JSON.parse(data);
  return content;
};