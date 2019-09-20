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
  debug: 0,
  quiet: -1
}

// By default we only show logs of priority 4 and up.
const options = {
  verbosity: verbosityLabels['info']
}

// Regex used to colorize certain log patterns.
const HTTP_PROTOCOL = new RegExp('^\s?https?://')
const ABS_REL_PATH = new RegExp('^\s?\.?/')

/** Sets the desired logging verbosity. The value must be either a number or a string. */
export const setVerbosity = (verbosity) => {
  if (isNumber(verbosity)) {
    options.verbosity = verbosity
    return
  }
  const vbNumber = verbosityLabels[verbosity]
  if (vbNumber == null) throw new Error(`setVerbosity() called with unrecognized label (${verbosity})`)
  options.verbose = vbNumber
}

/**
 * Logs strings and objects to the console.
 *
 * Takes an array of segments to log, which will be separated by a space just
 * like the regular console.log(). Strings are colorized if they conform to a URL
 * or a filesystem path. Everything else is inspected and colorized.
 */
const logSegments = (segments, logFn = console.log, colorize = true, colorAll = null) => {
  const str = segments.filter(s => s).map((s, n) => {
    // Add spaces between items, except after a linebreak.
    const space = (n !== segments.length - 1 && !String(segments[n]).endsWith('\n') ? ' ' : '')
    if (isString(s)) {
      if (colorize && (HTTP_PROTOCOL.test(s) || ABS_REL_PATH.test(s))) {
        s = chalk.green(s)
      }
      return s + space
    }
    // Inspect non-string objects.
    return inspect(s, { colors: true, depth: 4 }) + space
  }).join('')

  logFn(colorAll ? colorAll(str) : str)
}

/** Logs a line of text with a given verbosity (as a number). */
const logVerbose = (verbosity) => (...segments) => {
  // Ignore if the global verbosity value is lower than this.
  if (options.verbosity < verbosity) return
  logSegments(segments)
}

/** Create log functions for each verbosity. */
export const logError = logVerbose(verbosityLabels['error'])
export const logWarn = logVerbose(verbosityLabels['warn'])
export const logInfo = logVerbose(verbosityLabels['info'])
export const logDebug = logVerbose(verbosityLabels['debug'])
export const log = logInfo

/** Exits the program with an error. */
export const die = (...segments) => {
  logSegments([`${progName()}:`, ...segments], console.error, false, chalk.red)
  process.exit(1)
}
