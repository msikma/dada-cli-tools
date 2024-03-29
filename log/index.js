"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.die = exports.getLogFn = exports.exit = exports.log = exports.logDebug = exports.logInfo = exports.logNotice = exports.logWarn = exports.logError = exports.logFatal = exports.inspect = exports.setVerbosity = exports.logDefaultLevel = exports.logLevels = exports.logDepth = void 0;

var _chalk = _interopRequireDefault(require("chalk"));

var _util = _interopRequireDefault(require("util"));

var _misc = require("../util/misc");

var _data = require("../util/data");

var _fs = require("../util/fs");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// dada-cli-tools - Libraries for making CLI programs <https://github.com/msikma/dada-cli-tools>
// © MIT license
// Default logging depth.
const logDepth = 6; // Supported log levels and default. Can be used in e.g. CLI --help output.

exports.logDepth = logDepth;
const logLevels = ['error', 'warn', 'info', 'debug'];
exports.logLevels = logLevels;
const logDefaultLevel = 'info'; // Shortcut labels used to describe various verbosity levels.
// The available levels are a subset of the RFC 5424 standard.
// <https://tools.ietf.org/html/rfc5424>

exports.logDefaultLevel = logDefaultLevel;
const verbosityLabels = {
  error: 8,
  warn: 6,
  info: 4,
  debug: 0,
  quiet: -1
}; // By default we only show logs of priority 4 and up.

const options = {
  verbosity: verbosityLabels[logDefaultLevel]
}; // Regex used to colorize certain log patterns.

const HTTP_PROTOCOL = new RegExp('^\s?https?://');
const ABS_REL_PATH = new RegExp('^\s?\.?/');
/** Sets the desired logging verbosity. The value must be either a number or a string. */

const setVerbosity = verbosity => {
  if ((0, _data.isNumber)(verbosity)) {
    options.verbosity = verbosity;
    return;
  }

  const vbNumber = verbosityLabels[verbosity];
  if (vbNumber == null) throw new Error(`setVerbosity() called with unrecognized label (${verbosity})`);
  options.verbosity = vbNumber;
};
/**
 * Custom util.inspect() function.
 * 
 * TODO: add output customizations.
 */


exports.setVerbosity = setVerbosity;

const inspect = obj => {
  return _util.default.inspect(obj, {
    colors: true,
    depth: logDepth,
    maxArrayLength: 1024
  });
};
/**
 * Logs strings and objects to the console.
 *
 * Takes an array of segments to log, which will be separated by a space just
 * like the regular console.log().
 * 
 * In some cases, strings are colorized: such as if a string is a URL or a path.
 * 
 * The 'colorAll' function is used to colorize everything to a specific color,
 * and 'colorRegular' is used to colorize all strings that aren't already being
 * colorized for any of the aforementioned cases.
 * 
 * If the logging function is null, the value is returned instead.
 */


exports.inspect = inspect;

const logSegments = (segments, logFn = console.log, colorize = true, colorAll = null, colorRegular = null, omitFalsy = false) => {
  const loggableSegments = omitFalsy ? segments.filter(s => s) : segments;
  const str = loggableSegments.map((s, n) => {
    // Add spaces between items, except after a linebreak.
    const space = n !== segments.length - 1 && !String(segments[n]).endsWith('\n') ? ' ' : ''; // Regular strings are colorized and logged directly.

    if ((0, _data.isString)(s)) {
      // If this string conforms to a specific type (URL or path), colorize it green.
      if (colorize && (HTTP_PROTOCOL.test(s) || ABS_REL_PATH.test(s))) {
        s = _chalk.default.green(s);
      } // Colorize regular strings if they don't conform to any specific type.
      else if (colorRegular) {
        s = colorRegular(s);
      }

      return s + space;
    } // Non-string objects are inspected.


    return inspect(s) + space;
  }).join(''); // Wrap in colorizer function if the output must be one single color.

  const value = colorAll ? colorAll(str) : str; // Return the output if no logging function is provided.

  if (logFn == null) {
    return value;
  } else {
    return logFn(colorAll ? colorAll(str) : str);
  }
};
/** Logs a line of text with a given verbosity (as a number). */


const logVerbose = (verbosity, logFn = console.log, colorize = true, colorAll = null, colorRegular = null, omitFalsy = false) => (...segments) => {
  // Ignore if the global verbosity value is lower than this.
  if (options.verbosity > verbosity) return;
  logSegments(segments, logFn, colorize, colorAll, colorRegular, omitFalsy);
};
/** Create log functions for each verbosity. */


const logFatal = logVerbose(verbosityLabels['error'], console.error, false, _chalk.default.red);
exports.logFatal = logFatal;
const logError = logVerbose(verbosityLabels['error']);
exports.logError = logError;
const logWarn = logVerbose(verbosityLabels['warn'], console.log, true, _chalk.default.yellow);
exports.logWarn = logWarn;
const logNotice = logVerbose(verbosityLabels['info'], console.log, true, _chalk.default.blue);
exports.logNotice = logNotice;
const logInfo = logVerbose(verbosityLabels['info']); // the 'regular' log function

exports.logInfo = logInfo;
const logDebug = logVerbose(verbosityLabels['debug']);
exports.logDebug = logDebug;
const log = logInfo;
/** Exits the program with a given exit code. */

exports.log = log;

const exit = (exitCode = 0) => {
  process.exit(exitCode);
};
/** Returns a logging function; either a no-op, or a custom function, or logVerbose() as a sensible default. */


exports.exit = exit;

const getLogFn = (doLogging, logFn) => {
  if (!doLogging) return _misc.noop;
  if (logFn) return logFn;
  return logVerbose;
};
/** Exits the program with an error. */


exports.getLogFn = getLogFn;

const die = (...segments) => {
  if (segments.length) {
    logSegments([`${(0, _fs.getProgname)()}:`, ...segments], console.error, false, _chalk.default.red);
  }

  exit(1);
};

exports.die = die;