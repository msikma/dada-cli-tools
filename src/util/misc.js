// dada-cli-tools - Libraries for making CLI programs <https://github.com/msikma/dada-cli-tools>
// © MIT license

/** Promisified version of setInterval(). */
export const sleep = (ms) => (
  new Promise((resolve) => (
    setInterval(() => resolve(), ms)
  ))
)

/** No-op. */
export const noop = () => {}
