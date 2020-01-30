"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.charTrim = exports.splitOnLast = exports.limitString = exports.limitStringSentence = exports.capitalizeFirst = exports.separateMarkdownImages = exports.ensurePeriod = exports.removeUnnecessaryLines = exports.trimInner = exports.removeEmptyLines = exports.escapeMarkdown = void 0;

var _markdownEscape = _interopRequireDefault(require("markdown-escape"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// dada-cli-tools - Libraries for making CLI programs <https://github.com/msikma/dada-cli-tools>
// © MIT license

/**
 * Prevents a string from activating Markdown features.
 */
const escapeMarkdown = md => (0, _markdownEscape.default)(md);
/**
 * Removes extra empty lines by trimming every line, then removing the empty strings.
 * If 'leaveGap' is true, we will instead compress multiple empty lines down to a single empty line.
 */


exports.escapeMarkdown = escapeMarkdown;

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

const removeUnnecessaryLines = str => str.split('\n').map(s => s.trim() === '' ? s.trim() : s).join('\n').split('\n\n\n').join('\n\n'); // Ensures that a string ends with a period.


exports.removeUnnecessaryLines = removeUnnecessaryLines;

const ensurePeriod = str => {
  if (str.slice(-1) === '.') return str;
  return `${str}.`;
};
/**
 * Separate images from Markdown. We can't display them on Discord.
 * This returns the Markdown text with all image tags removed, and the image tags separately.
 */


exports.ensurePeriod = ensurePeriod;

const separateMarkdownImages = (md, leavePlaceholder = false) => {
  // Matches images, e.g.: ![alt text](https://i.imgur.com/asdf.jpg title text)
  // Or: ![alt text](https://i.imgur.com/asdf.jpg)
  const imgRe = /!\[(.+?)\]\(([^ ]+)( (.+?))?\)/g;
  const images = [];
  let match;

  while ((match = imgRe.exec(md)) !== null) {
    images.push({
      alt: match[1],
      url: match[2],
      title: match[4]
    });
  }

  return {
    images,
    text: removeEmptyLines(md.replace(imgRe, leavePlaceholder ? '[image]' : ''), true)
  };
}; // Capitalizes the first letter of a string.


exports.separateMarkdownImages = separateMarkdownImages;

const capitalizeFirst = str => `${str.charAt(0).toUpperCase()}${str.slice(1)}`;
/**
 * Cuts a long description down to a specific length, removing whole sentences.
 * Returns a function for a given value to cut the text down to.
 */


exports.capitalizeFirst = capitalizeFirst;

const limitStringSentence = (limit = 700) => desc => {
  if (desc.length < limit) return desc;
  const limitedChars = desc.slice(0, limit); // Cut off the last line so we don't end on a half-sentence.

  const limitedLines = limitedChars.split('\n').slice(0, -1).join('\n').trim();
  return `${limitedLines}\n[...]`;
};
/**
 * Limits a string to a specific length. Adds ellipsis if it exceeds.
 * Returns a function for a given value to cut the string down to.
 */


exports.limitStringSentence = limitStringSentence;

const limitString = value => str => str.length > value ? `${str.substr(0, value - 3)}...` : str;
/**
 * Splits a string by a separator, but only by the last occurrence of the separator.
 * The separators are kept. e.g. './.hidden/.dir/myfile.jpg' becomes ['./.hidden/.dir/myfile', '.jpg']
 */


exports.limitString = limitString;

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