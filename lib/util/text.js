"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.charTrim = exports.splitOnLast = exports.ensurePeriod = exports.blockElsToLb = exports.removeUnnecessaryLines = exports.trimInner = exports.removeEmptyLines = void 0;

// dada-cli-tools - Libraries for making CLI programs <https://github.com/msikma/dada-cli-tools>
// © MIT license

/**
 * Removes extra empty lines by trimming every line, then removing the empty strings.
 * If 'leaveGap' is true, we will instead compress multiple empty lines down to a single empty line.
 */
const removeEmptyLines = (str, leaveGap = false) => {
  if (leaveGap) {
    const split = str.split('\n').map(l => l.trim());
    const lines = split.reduce((acc, curr) => [...acc, ...(curr === acc[acc.length - 1] ? [] : [curr])], []);
    return lines.join('\n');
  } else {
    return str.split('\n').map(l => l.trim()).filter(l => l !== '').join('\n');
  }
};
/** Fixes text in HTML that has extra linebreaks and spaces. */


exports.removeEmptyLines = removeEmptyLines;

const trimInner = str => {
  return str.replace(/\s+/g, ' ');
}; // For some reason, argparse sometimes outputs an extra linebreak after the usage text.
// This seems to happen when the previous usage line is of a precise length.
// Bit hackish, but this removes it.


exports.trimInner = trimInner;

const removeUnnecessaryLines = str => str.split('\n').map(s => s.trim() === '' ? s.trim() : s).join('\n').split('\n\n\n').join('\n\n');
/** List of block elements. (Non-exhaustive, but it works well enough for most cases.) */


exports.removeUnnecessaryLines = removeUnnecessaryLines;
const blockEls = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ol', 'ul', 'pre', 'address', 'blockquote', 'dl', 'div', 'fieldset', 'form', 'noscript', 'table'];
/** Converts block elements to linebreaks. Useful for cleaning up HTML before converting to plain text. */

const blockElsToLb = $text => {
  for (let el of blockEls) {
    $text.find(el).before('\n');
  }

  $text.find('br').replaceWith('\n');
  $text.find('hr').replaceWith('\n');
}; // Ensures that a string ends with a period.


exports.blockElsToLb = blockElsToLb;

const ensurePeriod = str => {
  if (str.slice(-1) === '.') return str;
  return `${str}.`;
};
/**
 * Splits a string by a separator, but only by the last occurrence of the separator.
 * The separators are kept. e.g. './.hidden/.dir/myfile.jpg' becomes ['./.hidden/.dir/myfile', '.jpg']
 */


exports.ensurePeriod = ensurePeriod;

const splitOnLast = (str, sep) => {
  const segments = str.split(sep);
  if (segments.length === 1) return segments;
  const start = segments.slice(0, segments.length - 1);
  const end = segments.slice(-1);
  return [`${start.join('.')}`, `${sep}${end[0]}`];
}; // Trims a specific character from a string like trim() does with whitespace.
// Taken from Stack Overflow and modified slightly:
// <https://stackoverflow.com/a/32516190>


exports.splitOnLast = splitOnLast;

const charTrim = (str, replChar = '') => {
  let oldChar = replChar;
  if (oldChar === "]") oldChar = "\\]";
  if (oldChar === "\\") oldChar = "\\\\";
  return str.replace(new RegExp(`^["${oldChar}"]+|["${oldChar}"]+$`, 'g'), '');
};

exports.charTrim = charTrim;