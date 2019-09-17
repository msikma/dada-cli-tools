// dada-cli-tools - Libraries for making CLI programs <https://github.com/msikma/dada-cli-tools>
// © MIT license

import chalk from 'chalk'
import { inspect } from 'util'

import { progName } from './util'

// Placeholder for the user's CLI arguments. These determine
// the verbosity of logging, among other things.
let args = {}

// Regex used to colorize certain log patterns.
const HTTP_PROTOCOL = new RegExp('^\s?https?://')
const ABS_REL_PATH = new RegExp('^\s?\.?/')

/** Saves a copy of the user's CLI arguments for use in these functions. */
export const setParams = (params) => {
  args = { ...args, ...params }
}

/** Logs strings and objects to the console. */
const logSegments = (segments, logFn = console.log, colorize = true, colorAll = null) => {
  const str = segments.filter(s => s).map((s, n) => {
    // Add spaces between items, except after a linebreak.
    const space = (n !== segments.length - 1 && !String(segments[n]).endsWith('\n') ? ' ' : '')
    if (isString(s)) {
      // Colorize URLs.
      if (colorize) {
        if (HTTP_PROTOCOL.test(s) || ABS_REL_PATH.test(s)) {
          s = chalk.green(s)
        }
      }
      return s + space
    }
    // Inspect non-string objects.
    return inspect(s, { colors: true, depth: 4 }) + space
  }).join('')

  logFn(colorAll ? colorAll(str) : str)
}

/** Logs a line of text if verbose (-v) logging is enabled. */
export const log = (...segments) => {
  if (args.verbose && args.isCli) {
    logSegments(segments)
  }
}

/** Exits the program with an error. */
export const die = (...segments) => {
  if (args.isCli) {
    logSegments([`${progName()}:`, ...segments], console.error, false, chalk.red)
  }
  process.exit(1)
}
