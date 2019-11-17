// dada-cli-tools - Libraries for making CLI programs <https://github.com/msikma/dada-cli-tools>
// © MIT license

import util from 'util'
import convert from 'xml-js'

import { unpackError } from './error'
import { logFatal, log, die, exit } from '../log'
import { progName } from './fs'

// Descriptions of the data type for use in e.g. a CLI tool.
export const dataDescriptions = {
  json: `JSON string`,
  xml: 'XML string',
  terminal: 'Plain text readable in terminal'
}

// The default output type.
export const dataDefaultType = 'terminal'

/** Takes an output type string and returns it verbatim if it's valid, or the default if it's not. */
export const safeOutputType = (type) => {
  if (!type) return dataDefaultType
  if (~Object.keys(dataTypes).indexOf(type)) {
    return type
  }
  return dataDefaultType
}

/** Returns descriptions for the output types, with an optional default value highlighted. */
export const getDataDescriptions = (defaultValue = dataDefaultType) => {
  return Object.keys(dataDescriptions)
    .reduce(
      (items, key) => ({ ...items, [key]: (key === defaultValue ? `${dataDescriptions[key]} (default)` : `${dataDescriptions[key]}`) }),
      {}
    )
}

/** Outputs data as JSON. */
export const outputJSON = obj => {
  return JSON.stringify(obj)
}

/** Outputs data as XML. */
export const outputXML = obj => {
  const outData = convert.js2xml({ data: obj }, { compact: true, spaces: 2 });
  return `<?xml version="1.0" encoding="UTF-8"?>\n${outData}`
}

/** Outputs data formatted for the terminal with color. */
export const outputTerminal = obj => {
  // Use the util.inspect() method to log the entire object with color.
  // This uses a depth of 8, as opposed to Node's regular console.log()
  // which only goes 2 levels deep.
  return util.inspect(obj, false, 8, true)
}

/**
 * Runs a function call and outputs its result, then exits the program.
 * 
 * This is a convenience method for writing simple CLI scripts. To easily run a script
 * and output the results to the console, all you need to do is pass a callback and
 * the user's CLI args to this function.
 * 
 * The 'fnArgs' value contains the user's parsed CLI options. It responds to the
 * following values:
 * 
 *   - quiet    whether to silence output (of non-errors)
 *   - output   output type (one of 'dataTypes')
 * 
 * This function will exit after it finishes running.
*/
export const outputCallback = async (fn, fnArgs = {}, prog = progName(), logStack = true, exitWhenDone = true) => {
  let quiet = fnArgs.quiet
  let output = safeOutputType(fnArgs.output)

  // Run the callback and attempt to get the result.
  // If an error is thrown, we'll output that instead.
  let result, error, success
  try {
    result = await fn(fnArgs)
    // Success is always true, unless we received { result: false }.
    success = !Boolean(result && result.success != null && result.success === false)
  }
  catch (err) {
    error = err
    success = false
  }

  // Now we have either a success value or not; and possibly an error.
  // First handle the error condition.
  if (!success) {
    const errorObj = unpackError(error)
    logFatal(`${prog}: error: ${errorObj.stackHeader}`)
    if (logStack && errorObj.stackLines.length) {
      errorObj.stackLines.forEach(line => logFatal(line))
    }
    return exitWhenDone ? die() : null
  }

  // If everything went right, output the result of the call.

  // Don't output anything in quiet mode.
  if (quiet) {
    return exitWhenDone ? exit(0) : null
  }

  log(outputByType(result, output))
  return exit(0)
}

// Shortcuts to our output types.
export const dataTypes = {
  json: outputJSON,
  xml: outputXML,
  terminal: outputTerminal
}

/** Outputs data using the given output type (JSON, XML, Terminal). */
const outputByType = (obj, type) => {
  try {
    return dataTypes[type.toLowerCase()](obj)
  }
  catch (err) {
    throw new Error(`Invalid data type: "${type}"`)
  }
}

export default outputByType
