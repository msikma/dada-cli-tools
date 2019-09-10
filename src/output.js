// dada-cli-tools - Libraries for making CLI programs <https://github.com/msikma/dada-cli-tools>
// © MIT license

import util from 'util'

export const toJSON = obj => {
  return JSON.stringify(obj)
}

export const toXML = obj => {
  return '<xml>not implemented yet</xml>'
}

const dataTypes = {
  json: toJSON,
  xml: toXML
}

const toDataString = (obj, type) => {
  if (type === 'terminal') {
    // Use the util.inspect() method to log the entire object with color.
    // This uses infinite depth, as opposed to Node's regular console.log()
    // which only goes 2 levels deep.
    return util.inspect(obj, false, null, true)
  }
  try {
    return dataTypes[type.toLowerCase()](obj)
  }
  catch (err) {
    throw new Error(`toDataString: invalid data type: ${type}`)
  }
}

export default toDataString
