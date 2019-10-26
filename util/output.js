"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.outputTerminal = exports.outputXML = exports.outputJSON = void 0;

var _util = _interopRequireDefault(require("util"));

var _xmlJs = _interopRequireDefault(require("xml-js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// dada-cli-tools - Libraries for making CLI programs <https://github.com/msikma/dada-cli-tools>
// © MIT license

/** Outputs data as JSON. */
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
}; // Shortcuts to our output types.


exports.outputTerminal = outputTerminal;
const dataTypes = {
  json: outputJSON,
  xml: outputXML,
  terminal: outputTerminal
  /** Outputs data using the given output type (JSON, XML, Terminal). */

};

const outputByType = (obj, type) => {
  try {
    return dataTypes[type.toLowerCase()](obj);
  } catch (err) {
    throw new Error(`Invalid data type: "${type}"`);
  }
};

var _default = outputByType;
exports.default = _default;