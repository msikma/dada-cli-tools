// dada-cli-tools - Libraries for making CLI programs <https://github.com/msikma/dada-cli-tools>
// © MIT license

import escape from 'markdown-escape'

const timeDivisions = [
  { amount: 60, name: 'seconds' },
  { amount: 60, name: 'minutes' },
  { amount: 24, name: 'hours' },
  { amount: 7, name: 'days' },
  { amount: 4.34524, name: 'weeks' },
  { amount: 12, name: 'months' },
  { amount: Number.POSITIVE_INFINITY, name: 'years' }
]

/**
 * Prevents a string from activating Markdown features.
 */
export const escapeMarkdown = (md) => (
  escape(md)
)

/** Makes a date parseable by `date "%a, %b %d %Y %X %z"`. */
export const makeParseableDate = (d = new Date()) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const day = days[d.getUTCDay() - 1]
  const date = d.getUTCDate()
  const month = months[d.getUTCMonth()]
  const year = d.getUTCFullYear()
  const time = d.toTimeString().split(' ')[0]
  const offset = d.toTimeString().split(' ')[1].slice(3)
  return `${day}, ${month} ${date} ${year} ${time} ${offset}`
}

/** Returns a relative time string. */
export const getRelativeTime = (tsA, tsB = new Date(), formatter = new Intl.RelativeTimeFormat('en-US', { numeric: 'auto' })) => {
  let seconds = (tsA - tsB) / 1000
  for (const division of timeDivisions) {
    if (Math.abs(seconds) < division.amount) {
      return formatter.format(Math.round(seconds), division.name)
    }
    seconds /= division.amount
  }
  return null
}

/**
 * Removes extra empty lines by trimming every line, then removing the empty strings.
 * If 'leaveGap' is true, we will instead compress multiple empty lines down to a single empty line.
 */
export const removeEmptyLines = (str, leaveGap = false) => {
  if (leaveGap) {
    const split = str.split('\n').map(l => l.trim())
    const lines = split.reduce((acc, curr) => [...acc, ...(curr === acc[acc.length - 1] ? [] : [curr])], [])
    return lines.join('\n')
  }
  else {
    return str.split('\n').map(l => l.trim()).filter(l => l !== '').join('\n')
  }
}

/** Fixes text in HTML that has extra linebreaks and spaces. */
export const trimInner = str => {
  return str.replace(/\s+/g, ' ')
}

// For some reason, argparse sometimes outputs an extra linebreak after the usage text.
// This seems to happen when the previous usage line is of a precise length.
// Bit hackish, but this removes it.
export const removeUnnecessaryLines = (str) => (
  str.split('\n').map(s => s.trim() === '' ? s.trim() : s).join('\n').split('\n\n\n').join('\n\n')
)

// Ensures that a string ends with a period.
export const ensurePeriod = (str) => {
  if (str.slice(-1) === '.') return str
  return `${str}.`
}

/**
 * Separate images from Markdown. We can't display them on Discord.
 * This returns the Markdown text with all image tags removed, and the image tags separately.
 */
export const separateMarkdownImages = (md, leavePlaceholder = false) => {
  // Matches images, e.g.: ![alt text](https://i.imgur.com/asdf.jpg title text)
  // Or: ![alt text](https://i.imgur.com/asdf.jpg)
  const imgRe = /!\[(.+?)\]\(([^ ]+)( (.+?))?\)/g
  const images = []
  let match
  while ((match = imgRe.exec(md)) !== null) {
    images.push({ alt: match[1], url: match[2], title: match[4] })
  }
  return {
    images,
    text: removeEmptyLines(md.replace(imgRe, leavePlaceholder ? '[image]' : ''), true)
  }
}

// Capitalizes the first letter of a string.
export const capitalizeFirst = (str) => (
  `${str.charAt(0).toUpperCase()}${str.slice(1)}`
)

/**
 * Cuts a long description down to a specific length, going by paragraphs.
 * Reduces the length of a description.
 */
export const limitStringParagraph = (maxLength = 700, errorRatio = 100) => (desc) => {
  // Low and high end.
  const low = maxLength - errorRatio
  const high = maxLength + errorRatio

  // If str is already within tolerance, leave it.
  if (desc.length < high) {
    return desc
  }
  // Split into paragraphs, then keep removing one until we reach the tolerance point.
  // If we accidentally go too low, making a description that is too short,
  // we'll instead add a paragraph back on and cull the description with an ellipsis.
  const bits = desc.split('\n\n')
  if (bits.length === 1) {
    return limitStringSentence(maxLength)(bits[0])
  }
  let item
  while ((item = bits.pop()) != null) {
    const remainder = bits.join('\n\n')
    if (remainder.length < high && remainder.length > low) {
      // Perfect.
      return `${remainder}\n\n[...]`
    }
    if (remainder.length < high && remainder.length < low) {
      // Too small. TODO: cut off words one at a time instead?
      return `${[remainder, item].join('\n\n').substr(0, maxLength)} [...]`
    }
  }
}

/** Pads a number with zeroes based on a maximum value. */
export const zeroPadMax = (a, z) => (
  String(a).padStart(Math.ceil(Math.log10(z + 1)), '0')
)

/**
 * Cuts a long description down to a specific length, removing whole sentences.
 * Returns a function for a given value to cut the text down to.
 */
export const limitStringSentence = (maxLength = 700) => (desc) => {
  if (desc.length < maxLength) return desc

  const limitedChars = desc.slice(0, maxLength)
  // Cut off the last line so we don't end on a half-sentence.
  const limitedLines = limitedChars
    .split('\n')
    .slice(0, -1)
    .join('\n')
    .trim()

  return `${limitedLines}\n[...]`
}

/**
 * Limits a string to a specific length. Adds ellipsis if it exceeds.
 * Returns a function for a given value to cut the string down to.
 */
export const limitString = (value) => (str) => (
  str.length > value ? `${str.substr(0, value - 3)}...` : str
)

/**
 * Splits a string by a separator, but only by the last occurrence of the separator.
 * The separators are kept. e.g. './.hidden/.dir/myfile.jpg' becomes ['./.hidden/.dir/myfile', '.jpg']
 */
export const splitOnLast = (str, sep) => {
  const segments = str.split(sep)
  if (segments.length === 1) return segments
  const start = segments.slice(0, segments.length - 1)
  const end = segments.slice(-1)
  return [`${start.join('.')}`, `${sep}${end[0]}`]
}

// Trims a specific character from a string like trim() does with whitespace.
// Taken from Stack Overflow and modified slightly:
// <https://stackoverflow.com/a/32516190>
export const charTrim = (str, replChar = '') => {
  let oldChar = replChar
  if (oldChar === "]") oldChar = "\\]";
  if (oldChar === "\\") oldChar = "\\\\";
  return str.replace(new RegExp(`^["${oldChar}"]+|["${oldChar}"]+$`, 'g'), '');
}
