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

/** Sorts an object by keys. */
export const sortByKeys = obj => (
  fromPairs(sortBy(toPairs(obj)))
)
