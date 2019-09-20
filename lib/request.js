"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.request = exports.requestLogged = void 0;

var _got = _interopRequireDefault(require("got"));

var _utils = require("./utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// dada-cli-tools - Libraries for making CLI programs <https://github.com/msikma/dada-cli-tools>
// © MIT license
// Headers sent by default, similar to what a regular browser would send.
const stdHeaders = {
  'Accept-Language': 'en-US,en;q=0.9,ja;q=0.8,nl;q=0.7,de;q=0.6,es;q=0.5,it;q=0.4,pt;q=0.3',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Cache-Control': 'max-age=0',
  'Connection': 'keep-alive',
  'DNT': '1',
  'TE': 'Trailers',
  'Upgrade-Insecure-Requests': '1',
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.13; rv:68.0) Gecko/20100101 Firefox/68.0'
  /**
   * Returns the attributes needed to make a POST request.
   * The output should be merged into a Got request object.
   */

};

const postAttributes = (postData, {
  urlEncoded
}) => {
  if ((0, _utils.isEmpty)(postData)) return {};

  if (urlEncoded) {
    return {
      body: postData,
      form: true
    };
  } else {
    throw new Error('POST requests without application/x-www-form-urlencoded is not implemented yet.');
  }
};
/**
 * Wrapper for request() that adds the standard logger for CLI purposes.
 */


const requestLogged = (url, opts) => {
  return request(url, { ...opts,
    logFn: _utils.log
  });
};
/**
 * Requests a URL and returns the response (or the full response if specified).
 */


exports.requestLogged = requestLogged;

const request = async (url, {
  postData = {},
  urlEncoded = true,
  headers = {},
  jar,
  logFn
} = {}) => {
  const postAttr = !(0, _utils.isEmpty)(postData) ? postAttributes(postData, {
    urlEncoded
  }) : {};
  const reqOpts = {
    responseType: 'json',
    cookieJar: jar,
    headers: { ...stdHeaders,
      ...headers
    },
    // HTTP errors will resolve like normal.
    throwHttpErrors: false,
    hooks: {
      beforeRedirect: [options => {
        logFn && logFn('Following redirect to:', options.href);
      }]
    },
    // Add in POST data if requested.
    ...postAttr
  };
  logFn && logFn('Requesting HTTP call with the following options:', reqOpts);
  const req = (0, _got.default)(url, reqOpts);
  const res = await req;
  logFn && logFn('Requested URL:', res.requestUrl, '- duration:', res.timings.end - res.timings.start, 'ms', ...(!(0, _utils.isEmpty)(postData) ? [`- sending POST${urlEncoded ? ' (urlEncoded)' : ''}:\n`, postData] : []));
  return res;
};

exports.request = request;