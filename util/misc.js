"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.noop = exports.sleep = void 0;

// dada-cli-tools - Libraries for making CLI programs <https://github.com/msikma/dada-cli-tools>
// © MIT license

/** Promisified version of setInterval(). */
const sleep = ms => new Promise(resolve => setInterval(() => resolve(), ms));
/** No-op. */


exports.sleep = sleep;

const noop = () => {};

exports.noop = noop;