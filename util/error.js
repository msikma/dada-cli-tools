"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.unpackError = void 0;

// dada-cli-tools - Libraries for making CLI programs <https://github.com/msikma/dada-cli-tools>
// © MIT license

/** Unpacks an error for easier logging. */
const unpackError = (err = {}) => {
  let name = null,
      code = null,
      stackStr = '',
      stack = [];

  try {
    // E.g. 'ReferenceError'.
    name = err.name || ''; // E.g. 'SQLITE_CANTOPEN'.

    code = err.code || ''; // Contains the stack trace.

    stackStr = err.stack || ''; // Short string describing an error, for use in a single line log.

    oneLiner = String(err);
  } catch (err) {}

  stack = stackStr ? stackStr.split('\n') : [];
  return {
    name,
    code,
    stackStr,
    stack,
    // The stack trace, split into its first line and the rest.
    stackHeader: stack.slice(0, 1)[0] || '',
    stackLines: stack.slice(1)
  };
};

exports.unpackError = unpackError;