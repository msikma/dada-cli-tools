// dada-cli-tools - Libraries for making CLI programs <https://github.com/msikma/dada-cli-tools>
// © MIT license

import { isFunction, uniq } from 'lodash'
import TurndownService from 'turndown'
import cheerio from 'cheerio'

/**
 * Runs through the anchors in a Cheerio object and ensures they are absolute.
 */
export const makeLinksAbsolute = ($, item, objBaseURL) => {
  // Allow objBaseURL to be either a function or a plain string.
  const fnBaseURL = isFunction(objBaseURL) ? objBaseURL : n => `${objBaseURL}${n}`

  $('a', item).get().map(a => {
    const $a = $(a)
    const href = $a.attr('href')
    const hrefAbs = href.slice(0) === '/' ? fnBaseURL(href) : href
    $a.attr('href', hrefAbs)
  })
}

/**
 * Returns the abstract of a wiki article.
 * 
 * Takes a Cheerio object of the whole wiki page.
 * 
 * This takes out any <table> tags and searches until either the table of contents or a <h1> or <h2> tag is found,
 * and returns everything from up to that point.
 */
export const getWikiArticleAbstract = (
  $,
  anchorsAbsoluteObj = null,
  naTag = ['table'],
  endTag = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
  contentID = '#mw-content-text',
  contentObj = null
) => {
  const $content = contentObj ? contentObj : $(contentID)
  const items = $('> *', $content).get()
  const abstract = []
  for (const item of items) {
    const $item = $(item)
    if (~naTag.indexOf(item.name)) continue
    if (~endTag.indexOf(item.name) || $item.attr('id') === 'toc') break

    if (anchorsAbsoluteObj) {
      makeLinksAbsolute($, $item, anchorsAbsoluteObj)
    }
    abstract.push($.html($item).trim())
  }
  return abstract.join('\n')
}

/**
 * Returns the largest image from a 'srcset' (or 'src') attribute.
 * 
 * Must pass in an <img> tag. If no 'srcset' attribute is found, 'src' will be used instead.
 * Data is returned as: { url: String, size: Number }
 */
export const getLargestImageSrcset = ($, img) => {
  const $img = $(img)
  let srcData = $img.attr('srcset')
  if (!srcData) {
    return $img.attr('src')
  }
  srcData = srcData.split(',')
    .map(n => n.trim())
    .map(n => {
      const split = n.split(/\s+/)
      const url = split.slice(0, -1)
      const sizeVal = split.slice(-1)[0]
      const size = Number(sizeVal.toLowerCase().slice(-1) === 'x' ? sizeVal.slice(0, -1) : sizeVal)
      return { url, size }
    })
    .filter(n => n.size > 0 && !isNaN(n.size))
    .sort((a, b) => a.size > b.size ? -1 : 1)
  
  return srcData.shift()
}

/**
 * Returns Markdown from HTML.
 */
export const htmlToMarkdown = (html, { removeEmpty = false, removeScript = true, removeStyle = true, removeHr = false, removeImages = true } = {}, options = {}) => {
  // Set up the Turndown service for converting HTML to Markdown.
  const turndownService = new TurndownService(options)
  if (removeScript) turndownService.remove('style')
  if (removeStyle) turndownService.remove('script')
  const $ = cheerio.load(`<div id="dada-cli-tools-cheerio-wrapper">${html}</div>`)
  const $html = $('#dada-cli-tools-cheerio-wrapper')
  if (removeImages) {
    $html.find('img').remove()
  }
  if (removeHr) {
    $html.find('hr').remove()
  }
  const md = turndownService.turndown($html.html()).trim()
  return removeEmpty ? removeEmptyLines(md) : md
}

/**
 * Returns whether a string is likely HTML or not.
 */
export const isHTML = (string) => {
  const items = [
    string.indexOf('<p>') > 0,
    string.indexOf('<strong>') > 0,
    string.indexOf('<img') > 0,
    string.indexOf('<span') > 0,
    string.indexOf('<div') > 0,
    string.indexOf('<br /') > 0,
    string.indexOf('<br/') > 0,
    string.indexOf('<br>') > 0,
    string.indexOf('href="') > 0
  ]
  return items.indexOf(true) > -1
}

/** List of block elements. (Non-exhaustive, but it works well enough for most cases.) */
const blockEls = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ol', 'ul', 'pre', 'address', 'blockquote', 'dl', 'div', 'fieldset', 'form', 'noscript', 'table']

/** Converts block elements to linebreaks. Useful for cleaning up HTML before converting to plain text. */
export const blockElsToLb = ($text) => {
  for (let el of blockEls) {
    $text.find(el).before('\n')
  }
  $text.find('br').replaceWith('\n')
  $text.find('hr').replaceWith('\n')
}

/**
 * Finds a tag with a specific content.
 */
export const findTagContent = ($, tag, contentHint) => {
  return $(tag)
    .filter((_, el) => ~$(el).html().indexOf(contentHint))
    .map((_, el) => $(el).html())
    .get()[0]
}

/**
 * Returns image URLs from an HTML string.
 */
export const getImagesFromHTML = (html) => {
  const $ = cheerio.load(`<div id="dada-cli-tools-cheerio-wrapper">${html}</div>`)
  const $html = $('#dada-cli-tools-cheerio-wrapper')
  return uniq($html
    .find('img').get()
    .map(i => $(i).attr('src')))
}
