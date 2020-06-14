"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.extractScriptResult = void 0;

var _vm = _interopRequireDefault(require("vm"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// dada-cli-tools - Libraries for making CLI programs <https://github.com/msikma/dada-cli-tools>
// © MIT license
// Provides 'window' by default to be more compatible with common <script> contents.
const DEFAULT_SANDBOX = {
  window: {}
};
/**
 * Runs a script inside of a sandboxed VM to extract its data.
 */

const extractScriptResult = (scriptContent, sandbox = DEFAULT_SANDBOX) => {
  let success,
      error,
      value = null;

  try {
    const script = new _vm.default.Script(scriptContent);
    const ctx = new _vm.default.createContext(sandbox);
    value = script.runInContext(ctx);
    success = true;
    error = null;
  } catch (err) {
    success = false;
    error = null;
  }

  return {
    success,
    error,
    value,
    sandbox
  };
};

exports.extractScriptResult = extractScriptResult;