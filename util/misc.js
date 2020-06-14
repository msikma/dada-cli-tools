"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sortByKeys = exports.zeroPadMax = exports.wait = void 0;

var _lodash = require("lodash");

// dada-cli-tools - Libraries for making CLI programs <https://github.com/msikma/dada-cli-tools>
// © MIT license

/** Promisified version of setInterval(). */
const wait = ms => new Promise(resolve => setInterval(() => resolve(), ms));
/** Pads a number with zeroes based on a maximum value. */


exports.wait = wait;

const zeroPadMax = (a, z) => String(a).padStart(Math.ceil(Math.log10(z + 1)), '0');
/** Sorts an object by keys. */


exports.zeroPadMax = zeroPadMax;

const sortByKeys = obj => (0, _lodash.fromPairs)((0, _lodash.sortBy)((0, _lodash.toPairs)(obj)));

exports.sortByKeys = sortByKeys;