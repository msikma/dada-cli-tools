"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.promiseSerial = void 0;

// dada-cli-tools - Libraries for making CLI programs <https://github.com/msikma/dada-cli-tools>
// © MIT license

/**
 * Runs a series of promises sequentially.
 */
const promiseSerial = tasks => tasks.reduce((promiseChain, currentTask) => promiseChain.then(chainResults => currentTask.then(currentResult => [...chainResults, currentResult])), Promise.resolve([]));

exports.promiseSerial = promiseSerial;