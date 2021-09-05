"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sortByKeys = exports.toKeys = exports.noop = exports.isEmpty = exports.zipObj = exports.zeroPadMax = exports.wait = void 0;

var _lodash = require("lodash");

// dada-cli-tools - Libraries for making CLI programs <https://github.com/msikma/dada-cli-tools>
// © MIT license

/** Promisified version of setInterval(). */
const wait = ms => new Promise(resolve => setInterval(() => resolve(), ms));
/** Pads a number with zeroes based on a maximum value. */


exports.wait = wait;

const zeroPadMax = (a, z) => String(a).padStart(Math.ceil(Math.log10(z + 1)), '0');
/** Zips two arrays into an object. */


exports.zeroPadMax = zeroPadMax;

const zipObj = (a, b) => a.reduce((obj, _, n) => ({ ...obj,
  [a[n]]: b[n]
}), {});
/** Checks whether a plain object is empty. */


exports.zipObj = zipObj;

const isEmpty = obj => Object.keys(obj).length === 0;
/** No-op. */


exports.isEmpty = isEmpty;

const noop = () => {};
/** Turns an array into an object of keys all set to true. */


exports.noop = noop;

const toKeys = arr => arr.reduce((all, item) => ({ ...all,
  [item]: true
}), {});
/** Sorts an object by keys. */


exports.toKeys = toKeys;

const sortByKeys = obj => (0, _lodash.fromPairs)((0, _lodash.sortBy)((0, _lodash.toPairs)(obj)));

exports.sortByKeys = sortByKeys;