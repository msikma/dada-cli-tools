"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.readJSON = exports.readJSONSync = void 0;

var _fs = require("fs");

// dada-cli-tools - Libraries for making CLI programs <https://github.com/msikma/dada-cli-tools>
// © MIT license

/** Loads a JSON file synchronously. */
const readJSONSync = (path, encoding = 'utf8') => {
  return JSON.parse((0, _fs.readFileSync)(path, encoding));
};
/** Loads a JSON file asynchronously. */


exports.readJSONSync = readJSONSync;

const readJSON = (path, encoding = 'utf8') => new Promise((resolve, reject) => fs.readFile(path, encoding, (err, data) => {
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

exports.readJSON = readJSON;