// dada-cli-tools - Libraries for making CLI programs <https://github.com/msikma/dada-cli-tools>
// © MIT license

import chalk from 'chalk'
import { inspect } from 'util'
import { isNumber, isString } from 'lodash'

import { progName } from './util'

// Shortcut labels used to describe various verbosity levels.
const verbosityLabels = {
  error: 8,
  warn: 6,
  info: 4,
  verbose: 2,
  debug: 0,
  quiet: -1
}

// Contains the verbosity setting that determines how much gets logged.
// The value should always be a number, with 0 meaning no logging.
const options = {
  // Log 'info' and up by default.
  verbose: verbosityLabels['info']
}

// Regex used to colorize certain log patterns.
const HTTP_PROTOCOL = new RegExp('^\s?https?://')
const ABS_REL_PATH = new RegExp('^\s?\.?/')

/** Sets the desired logging verbosity. */
export const setVerbosity = (verbosity) => {
  if (isNumber(verbosity)) {
    options.verbose = verbosity
    return
  }
  const vbNumber = verbosityLabels[verbosity]
  if (vbNumber == null) throw new Error(`setVerbosity() called with unrecognized label (${verbosity})`)
  options.verbose = vbNumber
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

/** Logs a line of text with standard verbosity (0). */
export const log = (...segments) => {
  if (options.verbosity < 0) return
  logSegments(segments)
}

/**
 * Logs a line of text with a given verbosity value.
 * The higher the verbosity value, the less critical the log is.
 */
export const logVerbose = (verbosity, segments) => {
  if (!isNumber(verbosity) || !Array.isArray(segments)) {
    throw new Error('logVerbose() must be called with interface: verbosity:Number, segments:Array')
  }
  if (options.verbosity < verbosity) return
  logSegments(segments)
}

/** Exits the program with an error. */
export const die = (...segments) => {
  logSegments([`${progName()}:`, ...segments], console.error, false, chalk.red)
  process.exit(1)
}
