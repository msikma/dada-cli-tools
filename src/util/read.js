// dada-cli-tools - Libraries for making CLI programs <https://github.com/msikma/dada-cli-tools>
// © MIT license

import { readFileSync } from 'fs'

/** Loads a JSON file synchronously. */
export const readJSONSync = (path, encoding = 'utf8') => {
  return JSON.parse(readFileSync(path, encoding))
}

/** Loads a JSON file asynchronously. */
export const readJSON = (path, encoding = 'utf8') => (
  new Promise((resolve, reject) => (
    fs.readFile(path, encoding, (err, data) => {
      // Reject read errors.
      if (err) return reject(err)

      try {
        const content = JSON.parse(data)
        return resolve(content)
      }
      catch (parseErr) {
        // Reject parse errors.
        return reject(parseErr)
      }
    })
  ))
)
