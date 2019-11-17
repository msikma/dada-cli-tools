// dada-cli-tools - Libraries for making CLI programs <https://github.com/msikma/dada-cli-tools>
// © MIT license

import util from 'util'
import convert from 'xml-js'

// Shortcuts to our output types.
export const dataTypes = {
  json: outputJSON,
  xml: outputXML,
  terminal: outputTerminal
}

// Descriptions of the data type for use in e.g. a CLI tool.
export const dataDescriptions = {
  json: `JSON string`,
  xml: 'XML string',
  terminal: 'Plain text readable in terminal (default)'
}

/** Returns descriptions for the output types, with an optional default value highlighted. */
export const getDataDescriptions = (defaultValue = 'terminal') => {
  return Object.keys(defaults)
    .reduce(
      (items, key) => ({ ...items, [key]: (key === defaultValue ? `${items[key]} (default)` : `${items[key]}`) }),
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
