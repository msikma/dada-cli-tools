"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sortObjKeys = exports.wait = exports.isEmpty = exports.zipObj = exports.isString = void 0;

var _lodash = require("lodash");

// dada-cli-tools - Libraries for making CLI programs <https://github.com/msikma/dada-cli-tools>
// © MIT license

/** Checks whether something is a string or not. */
const isString = maybeString => typeof maybeString === 'string';
/** Zips two arrays into an object. */


exports.isString = isString;

const zipObj = (a, b) => a.reduce((obj, _, n) => ({ ...obj,
  [a[n]]: b[n]
}), {});
/** Checks whether a plain object is empty. */


exports.zipObj = zipObj;

const isEmpty = obj => Object.keys(obj).length === 0;
/**
 * Promisified version of setInterval() for use with await.
 * Usage example: await wait(1000) // to halt execution 1 second.
 */


exports.isEmpty = isEmpty;

const wait = ms => new Promise(resolve => setInterval(() => resolve(), ms));
/** Sorts an object by keys. */


exports.wait = wait;

const sortObjKeys = obj => (0, _lodash.fromPairs)((0, _lodash.sortBy)((0, _lodash.toPairs)(obj)));

exports.sortObjKeys = sortObjKeys;