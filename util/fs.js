"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.progName = exports.dirName = exports.readJSON = exports.readJSONSync = exports.ensureDirBool = exports.ensureDir = exports.fileExists = exports.canAccess = exports.resolveTilde = void 0;

var _fs = require("fs");

var _os = require("os");

var _path = require("path");

var _mkdirp = _interopRequireDefault(require("mkdirp"));

var _process = _interopRequireDefault(require("process"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// dada-cli-tools - Libraries for making CLI programs <https://github.com/msikma/dada-cli-tools>
// © MIT license

/** This modifies the tilde (~) to point to the user's home. */
const resolveTilde = pathStr => {
  let path = pathStr.trim(); // The tilde is only valid if it's at the start of the string.

  if (path.startsWith('~')) {
    path = (0, _os.homedir)() + path.slice(1);
  }

  return path;
};
/** Checks whether we can access (read, modify) a path. */


exports.resolveTilde = resolveTilde;

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
  return JSON.parse(readFileSync(path, encoding));
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