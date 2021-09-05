// dada-cli-tools - Libraries for making CLI programs <https://github.com/msikma/dada-cli-tools>
// © MIT license

import { fromPairs, sortBy, toPairs } from 'lodash'

/** Promisified version of setInterval(). */
export const wait = (ms) => (
  new Promise((resolve) => (
    setInterval(() => resolve(), ms)
  ))
)

/** Pads a number with zeroes based on a maximum value. */
export const zeroPadMax = (a, z) => (
  String(a).padStart(Math.ceil(Math.log10(z + 1)), '0')
)

/** Zips two arrays into an object. */
export const zipObj = (a, b) => (
  a.reduce((obj, _, n) => ({ ...obj, [a[n]]: b[n] }), {})
)

/** Checks whether a plain object is empty. */
export const isEmpty = (obj) => (
  Object.keys(obj).length === 0
)

/** No-op. */
export const noop = () => {}

/** Turns an array into an object of keys all set to true. */
export const toKeys = arr => arr.reduce((all, item) => ({ ...all, [item]: true }), {})

/** Sorts an object by keys. */
export const sortByKeys = obj => (
  fromPairs(sortBy(toPairs(obj)))
)
