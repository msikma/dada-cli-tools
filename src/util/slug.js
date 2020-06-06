// dada-cli-tools - Libraries for making CLI programs <https://github.com/msikma/dada-cli-tools>
// © MIT license

import standardSlugify from 'standard-slugify'

const slugifyDefaults = {
  keepCase: true
}

/** Slugify function that uses underscores as separators. */
export const slugifyUnderscore = (str, opts) => {
  const slug = slugify(str, opts)
  return slug.replace(/-/g, '_')
}

/** Standard slugify function that returns URL-safe strings. */
export const slugify = (str, opts = {}) => {
  return standardSlugify(str, { ...slugifyDefaults, ...opts })
}
