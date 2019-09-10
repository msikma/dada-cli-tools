// dada-cli-tools - Libraries for making CLI programs <https://github.com/msikma/dada-cli-tools>
// © MIT license

import { fromPairs, sortBy, toPairs } from 'lodash'

/** Sorts an object by keys. */
export const sortObjKeys = obj => (
  fromPairs(sortBy(toPairs(obj)))
)
