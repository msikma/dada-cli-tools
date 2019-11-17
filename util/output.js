"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.dataTypes = exports.outputCallback = exports.outputTerminal = exports.outputXML = exports.outputJSON = exports.getDataDescriptions = exports.safeOutputType = exports.dataDefaultType = exports.dataDescriptions = void 0;

var _util = _interopRequireDefault(require("util"));

var _xmlJs = _interopRequireDefault(require("xml-js"));

var _error = require("./error");

var _log = require("../log");

var _fs = require("./fs");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// dada-cli-tools - Libraries for making CLI programs <https://github.com/msikma/dada-cli-tools>
// © MIT license
// Descriptions of the data type for use in e.g. a CLI tool.
const dataDescriptions = {
  json: `JSON string`,
  xml: 'XML string',
  terminal: 'Plain text readable in terminal' // The default output type.

};
exports.dataDescriptions = dataDescriptions;
const dataDefaultType = 'terminal';
/** Takes an output type string and returns it verbatim if it's valid, or the default if it's not. */

exports.dataDefaultType = dataDefaultType;

const safeOutputType = type => {
  if (!type) return dataDefaultType;

  if (~Object.keys(dataTypes).indexOf(type)) {
    return type;
  }

  return dataDefaultType;
};
/** Returns descriptions for the output types, with an optional default value highlighted. */


exports.safeOutputType = safeOutputType;

const getDataDescriptions = (defaultValue = dataDefaultType) => {
  return Object.keys(dataDescriptions).reduce((items, key) => ({ ...items,
    [key]: key === defaultValue ? `${dataDescriptions[key]} (default)` : `${dataDescriptions[key]}`
  }), {});
};
/** Outputs data as JSON. */


exports.getDataDescriptions = getDataDescriptions;

const outputJSON = obj => {
  return JSON.stringify(obj);
};
/** Outputs data as XML. */


exports.outputJSON = outputJSON;

const outputXML = obj => {
  const outData = _xmlJs.default.js2xml({
    data: obj
  }, {
    compact: true,
    spaces: 2
  });

  return `<?xml version="1.0" encoding="UTF-8"?>\n${outData}`;
};
/** Outputs data formatted for the terminal with color. */


exports.outputXML = outputXML;

const outputTerminal = obj => {
  // Use the util.inspect() method to log the entire object with color.
  // This uses a depth of 8, as opposed to Node's regular console.log()
  // which only goes 2 levels deep.
  return _util.default.inspect(obj, false, 8, true);
};
/**
 * Runs a function call and outputs its result, then exits the program.
 * 
 * This is a convenience method for writing simple CLI scripts. To easily run a script
 * and output the results to the console, all you need to do is pass a callback and
 * the user's CLI args to this function.
 * 
 * The 'fnArgs' value contains the user's parsed CLI options. It responds to the
 * following values:
 * 
 *   - quiet    whether to silence output (of non-errors)
 *   - output   output type (one of 'dataTypes')
 * 
 * This function will exit after it finishes running.
*/


exports.outputTerminal = outputTerminal;

const outputCallback = async (fn, fnArgs = {}, prog = (0, _fs.progName)(), logStack = true, exitWhenDone = true) => {
  let quiet = fnArgs.quiet;
  let output = safeOutputType(fnArgs.output); // Run the callback and attempt to get the result.
  // If an error is thrown, we'll output that instead.

  let result, error, success;

  try {
    result = await fn(); // Success is always true, unless we received { result: false }.

    success = !Boolean(result && result.success != null && result.success === false);
  } catch (err) {
    error = err;
    success = false;
  } // Now we have either a success value or not; and possibly an error.
  // First handle the error condition.


  if (!success) {
    const errorObj = (0, _error.unpackError)(error);
    (0, _log.logFatal)(`${prog}: error: ${errorObj.stackHeader}`);

    if (logStack && errorObj.stackLines.length) {
      errorObj.stackLines.forEach(line => (0, _log.logFatal)(line));
    }

    return exitWhenDone ? (0, _log.die)() : null;
  } // If everything went right, output the result of the call.
  // Don't output anything in quiet mode.


  if (quiet) {
    return exitWhenDone ? (0, _log.exit)(0) : null;
  }

  (0, _log.log)(outputByType(result, output));
  return (0, _log.exit)(0);
}; // Shortcuts to our output types.


exports.outputCallback = outputCallback;
const dataTypes = {
  json: outputJSON,
  xml: outputXML,
  terminal: outputTerminal
  /** Outputs data using the given output type (JSON, XML, Terminal). */

};
exports.dataTypes = dataTypes;

const outputByType = (obj, type) => {
  try {
    return dataTypes[type.toLowerCase()](obj);
  } catch (err) {
    throw new Error(`Invalid data type: "${type}"`);
  }
};

var _default = outputByType;
exports.default = _default;