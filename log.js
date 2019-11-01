"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.die = exports.log = exports.logDebug = exports.logInfo = exports.logWarn = exports.logError = exports.logErrorFatal = exports.setVerbosity = exports.logDefaultLevel = exports.logLevels = void 0;

var _chalk = _interopRequireDefault(require("chalk"));

var _util = require("util");

var _lodash = require("lodash");

var _fs = require("./util/fs");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// dada-cli-tools - Libraries for making CLI programs <https://github.com/msikma/dada-cli-tools>
// © MIT license
// Supported log levels and default. Can be used in e.g. CLI --help output.
const logLevels = ['error', 'warn', 'info', 'debug'];
exports.logLevels = logLevels;
const logDefaultLevel = 'info'; // Shortcut labels used to describe various verbosity levels.

exports.logDefaultLevel = logDefaultLevel;
const verbosityLabels = {
  error: 8,
  warn: 6,
  info: 4,
  debug: 0,
  quiet: -1 // By default we only show logs of priority 4 and up.

};
const options = {
  verbosity: verbosityLabels[logDefaultLevel] // Regex used to colorize certain log patterns.

};
const HTTP_PROTOCOL = new RegExp('^\s?https?://');
const ABS_REL_PATH = new RegExp('^\s?\.?/');
/** Sets the desired logging verbosity. The value must be either a number or a string. */

const setVerbosity = verbosity => {
  if ((0, _lodash.isNumber)(verbosity)) {
    options.verbosity = verbosity;
    return;
  }

  const vbNumber = verbosityLabels[verbosity];
  if (vbNumber == null) throw new Error(`setVerbosity() called with unrecognized label (${verbosity})`);
  options.verbose = vbNumber;
};
/**
 * Logs strings and objects to the console.
 *
 * Takes an array of segments to log, which will be separated by a space just
 * like the regular console.log(). Strings are colorized if they conform to a URL
 * or a filesystem path. Everything else is inspected and colorized.
 */


exports.setVerbosity = setVerbosity;

const logSegments = (segments, logFn = console.log, colorize = true, colorAll = null) => {
  const str = segments.filter(s => s).map((s, n) => {
    // Add spaces between items, except after a linebreak.
    const space = n !== segments.length - 1 && !String(segments[n]).endsWith('\n') ? ' ' : '';

    if ((0, _lodash.isString)(s)) {
      if (colorize && (HTTP_PROTOCOL.test(s) || ABS_REL_PATH.test(s))) {
        s = _chalk.default.green(s);
      }

      return s + space;
    } // Inspect non-string objects.


    return (0, _util.inspect)(s, {
      colors: true,
      depth: 4
    }) + space;
  }).join('');
  logFn(colorAll ? colorAll(str) : str);
};
/** Logs a line of text with a given verbosity (as a number). */


const logVerbose = (verbosity, logFn = console.log, colorize = true, colorAll = null) => (...segments) => {
  // Ignore if the global verbosity value is lower than this.
  if (options.verbosity > verbosity) return;
  logSegments(segments, logFn, colorize, colorAll);
};
/** Create log functions for each verbosity. */


const logErrorFatal = logVerbose(verbosityLabels['error'], console.error, false, _chalk.default.red);
exports.logErrorFatal = logErrorFatal;
const logError = logVerbose(verbosityLabels['error']);
exports.logError = logError;
const logWarn = logVerbose(verbosityLabels['warn']);
exports.logWarn = logWarn;
const logInfo = logVerbose(verbosityLabels['info']);
exports.logInfo = logInfo;
const logDebug = logVerbose(verbosityLabels['debug']);
exports.logDebug = logDebug;
const log = logInfo;
/** Exits the program with an error. */

exports.log = log;

const die = (...segments) => {
  if (segments.length) {
    logSegments([`${(0, _fs.progName)()}:`, ...segments], console.error, false, _chalk.default.red);
  }

  process.exit(1);
};

exports.die = die;