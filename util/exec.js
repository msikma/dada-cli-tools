"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.execCmd = exports.splitArgs = void 0;

var _child_process = require("child_process");

// dada-cli-tools - Libraries for making CLI programs <https://github.com/msikma/dada-cli-tools>
// © MIT license

/**
 * Splits a string as if it's a terminal command, with items separated either by space
 * or by enclosed quotation marks. The quotation marks will be removed if they are present.
 * The result is returned as array.
 *
 * E.g. arg1 arg2 "arg3 and 4" 'arg5 and 6' "arg7 and \"arg8\""
 * is split into ['arg1', 'arg2', 'arg3 and 4', 'arg5 and 6', 'arg7 and "arg8"']
 *
 * Be careful when escaping quotation marks (remember to double escape in string literals).
 */
const splitArgs = cmd => {
  const splitter = /"[^"\\]*(\\.[^"\\]*)*"|'[^'\\]*(\\.[^'\\]*)*'|[^\s]+/g;
  const args = [];
  let item, match, inner;

  while ((item = splitter.exec(cmd)) !== null) {
    match = item[0].match(/^"(.*)"$|^'(.*)'$|^(.*)$/);
    inner = (match[1] || match[2] || match[3]).replace(/\\"/g, `"`).replace(/\\'/g, `'`);
    args.push(inner);
  }

  return args;
};
/**
 * Runs an external command and returns an object with the result and exit code.
 *
 * This allows for an external command to be run as a string,
 * as though one is running the command inside of the terminal.
 */


exports.splitArgs = splitArgs;

const execCmd = (cmdStr, opts = {}) => new Promise((resolve, reject) => {
  const args = splitArgs(cmdStr);
  const cmd = (0, _child_process.spawn)(args[0], args.slice(1), { ...opts
  });
  const output = {
    stdout: [],
    stderr: [],
    code: null,
    signal: null,
    error: null
  };

  const getOutput = () => {
    return { ...output,
      stdout: output.stdout.join(''),
      stderr: output.stderr.join('')
    };
  };

  cmd.stdout.on('data', data => {
    output.stdout.push(String(data));
  });
  cmd.stderr.on('data', data => {
    output.stderr.push(data);
  });
  cmd.on('close', (code, signal) => {
    output.code = code;
    output.signal = signal;
    return resolve(getOutput());
  });
  cmd.on('error', err => {
    output.error = err;
    return reject(getOutput());
  });
});

exports.execCmd = execCmd;