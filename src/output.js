// dada-cli-tools - Libraries for making CLI programs <https://github.com/msikma/dada-cli-tools>
// © MIT license

import util from 'util'

/** Outputs data as JSON. */
export const outputJSON = obj => {
  return JSON.stringify(obj)
}

/** Outputs data as XML. */
export const outputXML = obj => {
  return '<xml>not implemented yet</xml>'
}

/** Outputs data formatted for the terminal with color. */
export const outputTerminal = obj => {
  // Use the util.inspect() method to log the entire object with color.
  // This uses a depth of 8, as opposed to Node's regular console.log()
  // which only goes 2 levels deep.
  return util.inspect(obj, false, 8, true)
}

// Shortcuts to our output types.
const dataTypes = {
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
