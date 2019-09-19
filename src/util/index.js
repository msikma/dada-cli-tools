// dada-cli-tools - Libraries for making CLI programs <https://github.com/msikma/dada-cli-tools>
// © MIT license

import { fromPairs, sortBy, toPairs } from 'lodash'

/** Checks whether something is a string or not. */
export const isString = (maybeString) => (
  typeof maybeString === 'string'
)

/** Zips two arrays into an object. */
export const zipObj = (a, b) => (
  a.reduce((obj, _, n) => ({ ...obj, [a[n]]: b[n] }), {})
)

/** Checks whether a plain object is empty. */
export const isEmpty = (obj) => (
  Object.keys(obj).length === 0
)

/**
 * Promisified version of setInterval() for use with await.
 * Usage example: await wait(1000) // to halt execution 1 second.
 */
export const wait = (ms) => (
  new Promise((resolve) => (
    setInterval(() => resolve(), ms)
  ))
)

/** Sorts an object by keys. */
export const sortObjKeys = obj => (
  fromPairs(sortBy(toPairs(obj)))
)
