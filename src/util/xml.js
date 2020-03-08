// dada-cli-tools - Libraries for making CLI programs <https://github.com/msikma/dada-cli-tools>
// © MIT license

import { promises as fs } from 'fs'
import convert from 'xml-js'
import { isPlainObject } from 'lodash'
import { parseString } from 'xml2js'

/** Outputs an object as XML. */
export const outputXML = (obj, indentation = true, includeDocType = true, wrapData = true, wrapperNode = 'data') => {
  const outData = convert.js2xml(wrapData ? { [wrapperNode]: obj } : obj, { compact: true, spaces: indentation ? 2 : 0 });
  return `${includeDocType ? '<?xml version="1.0" encoding="UTF-8"?>\n' : ''}${outData}`
}

/**
 * Loads and parses an XML file, and returns its data.
 */
const _loadXMLFile = async (filename, encoding = 'utf8', processingFn = parseXMLString) => {
  const data = await fs.readFile(filename, encoding)
  return processingFn(data)
}

/**
 * Loads and parses an XML file and returns "simplified" data.
 */
export const loadXMLFile = (filename, encoding = 'utf8') => {
  return _loadXMLFile(filename, encoding, parseXMLString)
}

/**
 * Loads and parses an XML file and returns full data.
 */
export const loadVerboseXMLFile = (filename, encoding = 'utf8') => {
  return _loadXMLFile(filename, encoding, parseVerboseXMLString)
}

/**
 * Simplifies a single XML node object. Used by parseSimpleXMLString().
 */
const simplifyNode = obj => {
  if (Array.isArray(obj)) {
    return obj.map(item => simplifyNode(item))
  }
  if (isPlainObject(obj)) {
    // For nodes that contain a text node and attributes.
    if (obj._ && obj.$) {
      const newStr = new String(obj._)
      for (const [k, v] of Object.entries(obj.$)) {
        newStr[`$${k}`] = v
      }
      return newStr
    }
    // For all other regular nested nodes.
    else {
      const newObj = {}
      for (const [k, v] of Object.entries(obj)) {
        if (k === '$') continue
        newObj[k] = simplifyNode(v)
      }
      if (obj.$) {
        for (const [k, v] of Object.entries(obj.$)) {
          newObj[`$${k}`] = v
        }
      }
      return newObj
    }
  }
  // All other types (string, numbers) are returned verbatim.
  return obj
}
/**
 * Parses an XML string and returns its data.
 * 
 * This will parse all data including attributes etc.
 */
const _parseXMLWithOpts = (string, options = {}) => new Promise((resolve, reject) => (
  parseString(string, options, (err, result) => {
    if (err) return reject(err)
    return resolve(result)
  })
))

/**
 * Parses an XML string and returns its data in simplified form.
 * 
 * The data will be represented in a form closer to that of JSON.
 * Nodes with attributes will be represented as a String() object.
 * Attributes will always be prefixed with $.
 * 
 * This is useful for most XML files.
 */
export const parseXMLString = async (string) => {
  const xml = await _parseXMLWithOpts(string, { explicitArray: false })
  return simplifyNode(xml)
}

/**
 * Parses an XML string and returns its data in verbose form.
 * 
 * This is useful for complex XML files.
 */
export const parseVerboseXMLString = async (string) => {
  const xml = await _parseXMLWithOpts(string, { explicitArray: true })
  return xml
}
