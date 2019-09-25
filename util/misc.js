"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sortByKeys = exports.wait = void 0;

var _lodash = require("lodash");

// dada-cli-tools - Libraries for making CLI programs <https://github.com/msikma/dada-cli-tools>
// © MIT license

/** Promisified version of setInterval(). */
const wait = ms => new Promise(resolve => setInterval(() => resolve(), ms));
/** Sorts an object by keys. */


exports.wait = wait;

const sortByKeys = obj => (0, _lodash.fromPairs)((0, _lodash.sortBy)((0, _lodash.toPairs)(obj)));

exports.sortByKeys = sortByKeys;