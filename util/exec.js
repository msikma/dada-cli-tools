"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.execCmd = exports.execLog = exports.execGetJSON = void 0;

var _child_process = require("child_process");

var _cmdTokenize = require("cmd-tokenize");

// dada-cli-tools - Libraries for making CLI programs <https://github.com/msikma/dada-cli-tools>
// © MIT license

/** Default options for execCmd(). */
const defaultOpts = {
  // If 'true', output is logged directly to the log function (process.stdout and process.stderr by default).
  logged: false,
  // Encoding of the command output. If not set, a buffer is returned; otherwise the buffer is decoded into a string.
  encoding: null,
  // Log functions for stdout and stderr.
  logOutFn: (str, encoding = null) => process.stdout.write(str, encoding),
  logErrFn: (str, encoding = null) => process.stderr.write(str, encoding)
};
/** Default options passed to child_process.spawn(). */

const defaultSpawnOpts = {};
/** Encodes a buffer into a string, if an encoding is specified. */

const encode = (buffer, encoding) => {
  if (encoding) {
    return buffer.toString(encoding);
  }

  return buffer;
};
/**
 * Runs execCmd() and parses the result as JSON.
 * 
 * Defaults to UTF-8 as the encoding.
 */


const execGetJSON = async (cmd, userOpts, userSpawnOpts) => {
  const result = await execCmd(cmd, {
    encoding: 'utf8',
    ...userOpts
  }, userSpawnOpts);
  const data = JSON.parse(result.stdout);
  return data;
};
/**
 * Runs execCmd() with 'logged' set to true.
 */


exports.execGetJSON = execGetJSON;

const execLog = async (cmd, userOpts, userSpawnOpts) => {
  return await execCmd(cmd, { ...userOpts,
    logged: true
  }, userSpawnOpts);
};

exports.execLog = execLog;

const whichCmd = async cmd => {
  const res = await execCmd(`command -v ${_cmdTokenize.util.escapeArgument(cmd)}`);
};
/**
 * Runs an external command and returns an object with the result and exit code.
 *
 * This allows for an external command to be run as a string,
 * as though one is running the command inside of the terminal.
 */


const execCmd = (cmd, userOpts = {}, userSpawnOpts = {}) => new Promise((resolve, reject) => {
  const opts = { ...defaultOpts,
    ...userOpts
  };
  const spawnOpts = { ...defaultSpawnOpts,
    ...userSpawnOpts
  };
  const {
    logOutFn,
    logErrFn,
    logged,
    encoding
  } = opts;
  const args = (0, _cmdTokenize.splitCommand)(cmd);
  const proc = (0, _child_process.spawn)(args[0], args.slice(1), { ...spawnOpts
  });
  const output = {
    stdout: [],
    stderr: [],
    stdall: [],
    code: null,
    signal: null,
    error: null
  };

  const finalize = () => {
    return { ...output,
      stdall: encode(Buffer.concat(output.stdall), encoding),
      stdout: encode(Buffer.concat(output.stdout), encoding),
      stderr: encode(Buffer.concat(output.stderr), encoding)
    };
  };

  proc.stdout.on('data', data => {
    logOutFn && logged && logOutFn(data);
    output.stdout.push(data);
    output.stdall.push(data);
  });
  proc.stderr.on('data', data => {
    logErrFn && logged && logErrFn(data);
    output.stderr.push(data);
    output.stdall.push(data);
  });
  proc.on('close', (code, signal) => {
    output.code = code;
    output.signal = signal;
    return resolve(finalize());
  });
  proc.on('error', err => {
    output.error = err;
    return reject(finalize());
  });
});

exports.execCmd = execCmd;