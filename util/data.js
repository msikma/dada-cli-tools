"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getObjectType = exports.sortByKeys = exports.toKeys = exports.isEmpty = exports.zipObj = exports.isClass = exports.isArray = exports.isRegExp = exports.isSymbol = exports.isBoolean = exports.isFunction = exports.isNumber = exports.isInteger = exports.isString = exports.isPlainObject = exports.wrapInArray = void 0;

var _lodash = require("lodash");

// dada-cli-tools - Libraries for making CLI programs <https://github.com/msikma/dada-cli-tools>
// © MIT license

/** List of primitive types in Javascript. */
const primitiveTypes = ['String', 'Number', 'Boolean', 'Undefined', 'Null'];
/** Wraps anything in an array if it isn't one already. */

const wrapInArray = obj => Array.isArray(obj) ? obj : [obj];
/** Returns true for objects (such as {} or new Object()), false otherwise. */


exports.wrapInArray = wrapInArray;

const isPlainObject = obj => obj != null && typeof obj === 'object' && obj.constructor === Object;
/** Checks whether something is a string. */


exports.isPlainObject = isPlainObject;

const isString = obj => typeof obj === 'string' || obj instanceof String;
/** Checks whether something is an integer. */


exports.isString = isString;

const isInteger = obj => Number.isInteger(obj);
/** Checks whether something is any type of number (excluding NaN). */


exports.isInteger = isInteger;

const isNumber = obj => !isNaN(obj) && Object.prototype.toString.call(obj) === '[object Number]';
/** Checks whether something is a function. */


exports.isNumber = isNumber;

const isFunction = obj => typeof obj === 'function';
/** Checks whether something is a boolean. */


exports.isFunction = isFunction;

const isBoolean = obj => obj === true || obj === false;
/** Checks whether something is a Symbol. */


exports.isBoolean = isBoolean;

const isSymbol = obj => Object.prototype.toString.call(obj) === '[object Symbol]';
/** Checks whether something is a RegExp. */


exports.isSymbol = isSymbol;

const isRegExp = obj => Object.prototype.toString.call(obj) === '[object RegExp]';
/** Checks whether something is an array. */


exports.isRegExp = isRegExp;
const isArray = Array.isArray;
/** Checks whether something is a class. */

exports.isArray = isArray;

const isClass = obj => isFunction(obj) && /^\s*class\s+/.test(obj.toString());
/** Zips two arrays into an object. */


exports.isClass = isClass;

const zipObj = (a, b) => a.reduce((obj, _, n) => ({ ...obj,
  [a[n]]: b[n]
}), {});
/** Checks whether a plain object is empty. */


exports.zipObj = zipObj;

const isEmpty = obj => Object.keys(obj).length === 0;
/** Turns an array into an object of keys all set to true. */


exports.isEmpty = isEmpty;

const toKeys = arr => Object.fromEntries(arr.map(a => [a, true]));
/** Sorts an object by keys. */


exports.toKeys = toKeys;

const sortByKeys = obj => Object.fromEntries((0, _lodash.sortBy)(Object.entries(obj)));
/** Returns an object's type (unwrapped from its "[object Typename]" brackets). */


exports.sortByKeys = sortByKeys;

const getObjectType = obj => {
  // Get the plain type of the object.
  const type = Object.prototype.toString.call(obj).match(/\[object ([^\]]+?)\]/)[1];

  if (primitiveTypes.includes(type)) {
    return type.toLowerCase();
  } // Return the class name if this is one.


  if (isClass(obj)) {
    return `${obj.name}`;
  } // If this is a class instance, return the class name.


  if (obj?.constructor) {
    const name = obj.constructor.name;

    if (name !== type) {
      return `${name}`;
    }
  }

  return type;
};

exports.getObjectType = getObjectType;