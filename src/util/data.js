// dada-cli-tools - Libraries for making CLI programs <https://github.com/msikma/dada-cli-tools>
// © MIT license

import { sortBy } from 'lodash'

/** List of primitive types in Javascript. */
const primitiveTypes = ['String', 'Number', 'Boolean', 'Undefined', 'Null']

/** Wraps anything in an array if it isn't one already. */
export const wrapInArray = obj => Array.isArray(obj) ? obj : [obj]

/** Returns true for objects (such as {} or new Object()), false otherwise. */
export const isPlainObject = obj => obj != null && typeof obj === 'object' && obj.constructor === Object

/** Checks whether something is a string. */
export const isString = obj => typeof obj === 'string' || obj instanceof String

/** Checks whether something is an integer. */
export const isInteger = obj => Number.isInteger(obj)

/** Checks whether something is any type of number (excluding NaN). */
export const isNumber = obj => !isNaN(obj) && Object.prototype.toString.call(obj) === '[object Number]'

/** Checks whether something is a function. */
export const isFunction = obj => typeof obj === 'function'

/** Checks whether something is a boolean. */
export const isBoolean = obj => obj === true || obj === false

/** Checks whether something is a Symbol. */
export const isSymbol = obj => Object.prototype.toString.call(obj) === '[object Symbol]'

/** Checks whether something is a RegExp. */
export const isRegExp = obj => Object.prototype.toString.call(obj) === '[object RegExp]'

/** Checks whether something is an array. */
export const isArray = Array.isArray

/** Checks whether something is a class. */
export const isClass = obj => isFunction(obj) && /^\s*class\s+/.test(obj.toString())

/** Zips two arrays into an object. */
export const zipObj = (a, b) => a.reduce((obj, _, n) => ({ ...obj, [a[n]]: b[n] }), {})

/** Checks whether a plain object is empty. */
export const isEmpty = obj => Object.keys(obj).length === 0

/** Turns an array into an object of keys all set to true. */
export const toKeys = arr => Object.fromEntries(arr.map(a => [a, true]))

/** Sorts an object by keys. */
export const sortByKeys = obj => Object.fromEntries(sortBy(Object.entries(obj)))

/** Returns an object's type (unwrapped from its "[object Typename]" brackets). */
export const getObjectType = obj => {
  // Get the plain type of the object.
  const type = Object.prototype.toString.call(obj).match(/\[object ([^\]]+?)\]/)[1]
  if (primitiveTypes.includes(type)) {
    return type.toLowerCase()
  }

  // Return the class name if this is one.
  if (isClass(obj)) {
    return `${obj.name}`
  }

  // If this is a class instance, return the class name.
  if (obj?.constructor) {
    const name = obj.constructor.name
    if (name !== type) {
      return `${name}`
    }
  }

  return type
}
