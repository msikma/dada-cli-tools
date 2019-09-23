// dada-cli-tools - Libraries for making CLI programs <https://github.com/msikma/dada-cli-tools>
// © MIT license

import { fromPairs, sortBy, toPairs } from 'lodash'

/** Promisified version of setInterval(). */
export const wait = (ms) => (
  new Promise((resolve) => (
    setInterval(() => resolve(), ms)
  ))
)

/** Sorts an object by keys. */
export const sortByKeys = obj => (
  fromPairs(sortBy(toPairs(obj)))
)
