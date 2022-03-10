"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getImagesFromHTML = exports.findTagWithContent = exports.blockElementsToLinebreaks = exports.isHTML = exports.htmlToMarkdown = exports.getLargestImageSrcset = exports.getWikiArticleAbstract = exports.makeLinksAbsolute = void 0;

var _lodash = require("lodash");

var _turndown = _interopRequireDefault(require("turndown"));

var _cheerio = _interopRequireDefault(require("cheerio"));

var _data = require("./data");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// dada-cli-tools - Libraries for making CLI programs <https://github.com/msikma/dada-cli-tools>
// © MIT license
const htmlElements = ['a', 'abbr', 'acronym', 'address', 'applet', 'area', 'article', 'aside', 'audio', 'b', 'base', 'basefont', 'bdi', 'bdo', 'bgsound', 'big', 'blink', 'blockquote', 'body', 'br', 'button', 'canvas', 'caption', 'center', 'cite', 'code', 'col', 'colgroup', 'content', 'data', 'datalist', 'dd', 'decorator', 'del', 'details', 'dfn', 'dir', 'div', 'dl', 'dt', 'element', 'em', 'embed', 'fieldset', 'figcaption', 'figure', 'font', 'footer', 'form', 'frame', 'frameset', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'header', 'hgroup', 'hr', 'html', 'i', 'iframe', 'img', 'input', 'ins', 'isindex', 'kbd', 'keygen', 'label', 'legend', 'li', 'link', 'listing', 'main', 'map', 'mark', 'marquee', 'menu', 'menuitem', 'meta', 'meter', 'nav', 'nobr', 'noframes', 'noscript', 'object', 'ol', 'optgroup', 'option', 'output', 'p', 'param', 'plaintext', 'pre', 'progress', 'q', 'rp', 'rt', 'ruby', 's', 'samp', 'script', 'section', 'select', 'shadow', 'small', 'source', 'spacer', 'span', 'strike', 'strong', 'style', 'sub', 'summary', 'sup', 'table', 'tbody', 'td', 'template', 'textarea', 'tfoot', 'th', 'thead', 'time', 'title', 'tr', 'track', 'tt', 'u', 'ul', 'var', 'video', 'wbr', 'xmp'];
const blockElements = ['address', 'article', 'aside', 'blockquote', 'details', 'dialog', 'dd', 'div', 'dl', 'dt', 'fieldset', 'figcaption', 'figure', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'hgroup', 'hr', 'li', 'main', 'nav', 'ol', 'p', 'pre', 'section', 'table', 'ul'];
/**
 * Runs through the anchors in a Cheerio object and ensures they are absolute.
 */

const makeLinksAbsolute = ($, item, objBaseURL) => {
  // Allow objBaseURL to be either a function or a plain string.
  const fnBaseURL = (0, _data.isFunction)(objBaseURL) ? objBaseURL : n => `${objBaseURL}${n}`;
  $('a', item).get().map(a => {
    const $a = $(a);
    const href = $a.attr('href');
    const hrefAbs = href.slice(0) === '/' ? fnBaseURL(href) : href;
    $a.attr('href', hrefAbs);
  });
};
/**
 * Returns the abstract of a wiki article.
 * 
 * Takes a Cheerio object of the whole wiki page.
 * 
 * This takes out any <table> tags and searches until either the table of contents or a <h1> or <h2> tag is found,
 * and returns everything from up to that point.
 */


exports.makeLinksAbsolute = makeLinksAbsolute;

const getWikiArticleAbstract = ($, anchorsAbsoluteObj = null, naTag = ['table'], endTag = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'], contentID = '#mw-content-text', contentObj = null) => {
  const $content = contentObj ? contentObj : $(contentID);
  const items = $('> *', $content).get();
  const abstract = [];

  for (const item of items) {
    const $item = $(item);
    if (~naTag.indexOf(item.name)) continue;
    if (~endTag.indexOf(item.name) || $item.attr('id') === 'toc') break;

    if (anchorsAbsoluteObj) {
      makeLinksAbsolute($, $item, anchorsAbsoluteObj);
    }

    abstract.push($.html($item).trim());
  }

  return abstract.join('\n');
};
/**
 * Returns the largest image from a 'srcset' (or 'src') attribute.
 * 
 * Must pass in an <img> tag. If no 'srcset' attribute is found, 'src' will be used instead.
 * Data is returned as: { url: String, size: Number }
 */


exports.getWikiArticleAbstract = getWikiArticleAbstract;

const getLargestImageSrcset = ($, img) => {
  const $img = $(img);
  let srcData = $img.attr('srcset');

  if (!srcData) {
    return $img.attr('src');
  }

  srcData = srcData.split(',').map(n => n.trim()).map(n => {
    const split = n.split(/\s+/);
    const url = split.slice(0, -1);
    const sizeVal = split.slice(-1)[0];
    const size = Number(sizeVal.toLowerCase().slice(-1) === 'x' ? sizeVal.slice(0, -1) : sizeVal);
    return {
      url,
      size
    };
  }).filter(n => n.size > 0 && !isNaN(n.size)).sort((a, b) => a.size > b.size ? -1 : 1);
  return srcData.shift();
};
/**
 * Returns Markdown from HTML.
 */


exports.getLargestImageSrcset = getLargestImageSrcset;

const htmlToMarkdown = (html, {
  removeEmpty = false,
  removeScript = true,
  removeStyle = true,
  removeHr = false,
  removeImages = true
} = {}, options = {}) => {
  // Set up the Turndown service for converting HTML to Markdown.
  const turndownService = new _turndown.default(options);
  if (removeScript) turndownService.remove('style');
  if (removeStyle) turndownService.remove('script');

  const $ = _cheerio.default.load(`<div id="dada-cli-tools-cheerio-wrapper">${html}</div>`);

  const $html = $('#dada-cli-tools-cheerio-wrapper');

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
  for (const el of htmlElements) {
    if (string.includes(`<${el}>`)) {
      return true;
    }
  }

  return false;
};
/** Converts block elements to linebreaks. Useful for cleaning up HTML before converting to plain text. */


exports.isHTML = isHTML;

const blockElementsToLinebreaks = $text => {
  for (const el of blockElements) {
    $text.find(el).before('\n');
  }

  $text.find('br').replaceWith('\n');
  $text.find('hr').replaceWith('\n');
};
/**
 * Finds a tag with a specific content.
 */


exports.blockElementsToLinebreaks = blockElementsToLinebreaks;

const findTagWithContent = ($, tag, contentHint) => {
  return $(tag).filter((_, el) => $(el).html().includes(contentHint)).map((_, el) => $(el).html()).get()[0];
};
/**
 * Returns image URLs from an HTML string.
 */


exports.findTagWithContent = findTagWithContent;

const getImagesFromHTML = html => {
  const $ = _cheerio.default.load(`<div id="dada-cli-tools-cheerio-wrapper">${html}</div>`);

  const $html = $('#dada-cli-tools-cheerio-wrapper');
  const srcList = $html.find('img').get().map(i => $(i).attr('src'));
  const dataSrcList = $html.find('img').get().map(i => $(i).attr('data-src'));
  return (0, _lodash.uniq)([...srcList, ...dataSrcList].filter(i => i));
};

exports.getImagesFromHTML = getImagesFromHTML;