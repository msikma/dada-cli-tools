"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.removeQuery = exports.toFormURIComponent = exports.objToParams = void 0;

// dada-cli-tools - Libraries for making CLI programs <https://github.com/msikma/dada-cli-tools>
// © MIT license

/**
 * Converts an object of key/value pairs to URI parameters without leading question mark.
 * By default, we remove: null, empty strings and empty arrays.
 */
const objToParams = (obj, {
  removeNull = true,
  removeEmptyString = true,
  removeEmptyArray = true,
  removeFalse = false
} = {}) => Object.keys(obj) // Filter out everything that needs to be filtered out.
.filter(k => (!removeNull || removeNull && obj[k] != null) && (!removeEmptyString || removeEmptyString && obj[k] !== '') && (!removeFalse || removeFalse && obj[k] !== false) && (!removeEmptyArray || removeEmptyArray && (!Array.isArray(obj[k]) || obj[k].length > 0))) // Encode to URI components. Account for the zero-width array.
.map(k => Array.isArray(obj[k]) && obj[k].length > 0 ? obj[k].map(i => `${encodeURIComponent(k)}[]=${encodeURIComponent(i)}`).join('&') : `${encodeURIComponent(k)}${Array.isArray(obj[k]) ? '[]' : ''}=${encodeURIComponent(obj[k])}`).join('&');
/**
 * Converts the spaces in a URI parameter string to the '+' character.
 * Only for use in application/x-www-form-urlencoded.
 * Run this on URI encoded strings - e.g. toFormURIComponent(encodeURIComponent(query)).
 */


exports.objToParams = objToParams;

const toFormURIComponent = paramStr => paramStr.replace(/%20/g, '+');
/**
 * Removes the query string from a URL string.
 * If the URL has no query string, the input is returned unchanged.
 */


exports.toFormURIComponent = toFormURIComponent;

const removeQuery = url => url.indexOf('?') > -1 ? url.split('?')[0] : url;

exports.removeQuery = removeQuery;