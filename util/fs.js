"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.progName = exports.dirName = exports.ensureDir = exports.resolveTilde = void 0;

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
/** Ensures that a directory exists. Returns a promise. */


exports.resolveTilde = resolveTilde;

const ensureDir = path => new Promise((resolve, reject) => (0, _mkdirp.default)(path, err => {
  if (err) return reject(err);
  return resolve(true);
}));
/** Returns the directory name for a full path. */


exports.ensureDir = ensureDir;

const dirName = path => {
  const info = (0, _path.parse)(path);
  return info.dir;
};
/** Returns the name of the currently running program. */


exports.dirName = dirName;

const progName = () => (0, _path.basename)(_process.default.argv[1]);

exports.progName = progName;