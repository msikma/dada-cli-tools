// dada-cli-tools - Libraries for making CLI programs <https://github.com/msikma/dada-cli-tools>
// © MIT license

/**
 * Runs a series of promises sequentially.
 */
export const promiseSerial = (tasks) => (
  tasks.reduce((promiseChain, currentTask) => (
    promiseChain.then(chainResults => (
      currentTask.then(currentResult => [...chainResults, currentResult])
    ))
  ), Promise.resolve([]))
)
