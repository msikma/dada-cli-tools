"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.progName = exports.dirName = exports.readJSON = exports.readJSONSync = exports.ensureDirBool = exports.ensureDir = exports.fileExists = exports.canAccess = exports.writeFileSafely = exports.getSafeFilename = exports.splitFilename = exports.resolveTilde = void 0;

var _fs = require("fs");

var _os = require("os");

var _path = require("path");

var _mkdirp = _interopRequireDefault(require("mkdirp"));

var _process = _interopRequireDefault(require("process"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// dada-cli-tools - Libraries for making CLI programs <https://github.com/msikma/dada-cli-tools>
// © MIT license

/** Max number of times we'll try to figure out a different filename in writeFileSafely(). */
const MAX_FILENAME_RETRIES = 99;
/** This modifies the tilde (~) to point to the user's home. */

const resolveTilde = pathStr => {
  let path = pathStr.trim(); // The tilde is only valid if it's at the start of the string.

  if (path.startsWith('~')) {
    path = (0, _os.homedir)() + path.slice(1);
  }

  return path;
};
/** Splits up a filename into the basename (including the path) and file extension. */


exports.resolveTilde = resolveTilde;

const splitFilename = filename => {
  const fn = String(filename);
  const bits = fn.split('.');

  if (bits.length === 1) {
    return {
      basename: fn,
      extension: ''
    };
  }

  const basename = bits.slice(0, -1).join('.');
  const extension = bits.slice(-1)[0];
  return {
    basename,
    extension
  };
};
/**
 * Determines a filename that does not exist yet.
 *
 * E.g. if 'file.jpg' exists, this might return 'file1.jpg' or 'file22.jpg'.
 * TODO: this should be simplified, by getting a full list of files and then
 * determining the new name once, rather than checking each possibility.
 */


exports.splitFilename = splitFilename;

const getSafeFilename = async (target, separator = '', limit = MAX_FILENAME_RETRIES) => {
  const {
    basename,
    extension
  } = splitFilename(target);
  let targetName = {
    basename,
    suffix: 0
  },
      targetNameStr;

  while (true) {
    // Increment the name suffix and see if we can create this file.
    targetNameStr = `${targetName.basename}${separator}${targetName.suffix > 0 ? targetName.suffix : ''}.${extension}`;

    if (await fileExists(targetNameStr)) {
      targetName.suffix += 1; // If we've tried too many times, fail and return information.

      if (targetName.suffix >= limit) {
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

const canAccess = async path => {
  try {
    // If access is possible, this will return null. Failure will throw.
    return (await _fs.promises.access(path, _fs.constants.F_OK | _fs.constants.W_OK)) == null;
  } catch (err) {
    return false;
  }
};
/** Checks whether we can access (read) a file. As canAccess(). */


exports.canAccess = canAccess;

const fileExists = async path => {
  try {
    return (await _fs.promises.access(path, _fs.constants.F_OK)) == null;
  } catch (err) {
    return false;
  }
};
/** Ensures that a directory exists. Returns a promise. */


exports.fileExists = fileExists;

const ensureDir = path => new Promise((resolve, reject) => (0, _mkdirp.default)(path, err => {
  if (err) return reject(err);
  return resolve(true);
}));
/** Ensures that a directory exists. Returns a promise resolving to a boolean. */


exports.ensureDir = ensureDir;

const ensureDirBool = async path => {
  try {
    await ensureDir(path);
    return true;
  } catch (_) {
    return false;
  }
};
/** Loads a JSON file synchronously. */


exports.ensureDirBool = ensureDirBool;

const readJSONSync = (path, encoding = 'utf8') => {
  return JSON.parse((0, _fs.readFileSync)(path, encoding));
};
/** Loads a JSON file asynchronously. */


exports.readJSONSync = readJSONSync;

const readJSON = (path, encoding = 'utf8') => new Promise((resolve, reject) => _fs.promises.readFile(path, encoding, (err, data) => {
  // Reject read errors.
  if (err) return reject(err);

  try {
    const content = JSON.parse(data);
    return resolve(content);
  } catch (parseErr) {
    // Reject parse errors.
    return reject(parseErr);
  }
}));
/** Returns the directory name for a full path. */


exports.readJSON = readJSON;

const dirName = path => {
  const info = (0, _path.parse)(path);
  return info.dir;
};
/** Returns the name of the currently running program. */


exports.dirName = dirName;

const progName = () => (0, _path.basename)(_process.default.argv[1]);

exports.progName = progName;