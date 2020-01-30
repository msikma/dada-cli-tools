"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getImagesFromHTML = exports.blockElsToLb = exports.isHTML = exports.htmlToMarkdown = void 0;

var _turndown = _interopRequireDefault(require("turndown"));

var _cheerio = _interopRequireDefault(require("cheerio"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// dada-cli-tools - Libraries for making CLI programs <https://github.com/msikma/dada-cli-tools>
// © MIT license

/**
 * Returns Markdown from HTML.
 */
const htmlToMarkdown = (html, removeEmpty = false, removeScript = true, removeStyle = true, removeHr = false, removeImages = true) => {
  // Set up the Turndown service for converting HTML to Markdown.
  const turndownService = new _turndown.default();
  if (removeScript) turndownService.remove('style');
  if (removeStyle) turndownService.remove('script');

  const $ = _cheerio.default.load(`<div id="callisto-wrapper">${html}</div>`);

  const $html = $('#calypso-wrapper');

  if (removeImages) {
    $html.find('img').remove();
  }

  if (removeHr) {
    $html.find('hr').remove();
  }

  const md = turndownService.turndown($html.html()).trim();
  return removeEmpty ? removeEmptyLines(md) : md;
};
/**
 * Returns whether a string is likely HTML or not.
 */


exports.htmlToMarkdown = htmlToMarkdown;

const isHTML = string => {
  const items = [string.indexOf('<p>') > 0, string.indexOf('<strong>') > 0, string.indexOf('<img') > 0, string.indexOf('<br /') > 0, string.indexOf('<br/') > 0, string.indexOf('<br>') > 0, string.indexOf('href="') > 0];
  return items.indexOf(true) > -1;
};
/** List of block elements. (Non-exhaustive, but it works well enough for most cases.) */


exports.isHTML = isHTML;
const blockEls = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ol', 'ul', 'pre', 'address', 'blockquote', 'dl', 'div', 'fieldset', 'form', 'noscript', 'table'];
/** Converts block elements to linebreaks. Useful for cleaning up HTML before converting to plain text. */

const blockElsToLb = $text => {
  for (let el of blockEls) {
    $text.find(el).before('\n');
  }

  $text.find('br').replaceWith('\n');
  $text.find('hr').replaceWith('\n');
};
/**
 * Returns image URLs from an HTML string.
 */


exports.blockElsToLb = blockElsToLb;

const getImagesFromHTML = html => {
  const $ = _cheerio.default.load(`<div id="callisto-wrapper">${html}</div>`);

  const $html = $('#calypso-wrapper');
  return $html.find('img').get().map(i => $(i).attr('src'));
};

exports.getImagesFromHTML = getImagesFromHTML;