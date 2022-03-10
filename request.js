"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.request = exports.makeGotRequest = exports.requestLogged = exports.downloadFile = exports.downloadFileLogged = exports.getBaseURL = exports.getURLFilename = void 0;

var _fs = require("fs");

var _got = _interopRequireDefault(require("got"));

var _util = require("util");

var _lodash = require("lodash");

var _chalk = _interopRequireDefault(require("chalk"));

var _stream = _interopRequireDefault(require("stream"));

var _urlParse = _interopRequireDefault(require("url-parse"));

var _fs2 = require("./util/fs");

var _log = require("./log");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// dada-cli-tools - Libraries for making CLI programs <https://github.com/msikma/dada-cli-tools>
// © MIT license
// Allow the stream pipeline function to return Promises.
const pipeline = (0, _util.promisify)(_stream.default.pipeline); // Headers sent by default, similar to what a regular browser would send.

const stdHeaders = {
  'Accept-Language': 'en-US,en;q=0.9,ja;q=0.8,nl;q=0.7,de;q=0.6,es;q=0.5,it;q=0.4,pt;q=0.3',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Cache-Control': 'max-age=0',
  'Connection': 'keep-alive',
  'DNT': '1',
  'TE': 'Trailers',
  'Upgrade-Insecure-Requests': '1',
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.13; rv:68.0) Gecko/20100101 Firefox/68.0'
};
/**
 * Returns the attributes needed to make a POST request.
 * The output should be merged into a Got request object.
 */

const postAttributes = (postData, {
  urlEncoded
}) => {
  if ((0, _lodash.isEmpty)(postData)) return {};

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
 * Returns the filename of a URL.
 * 
 * E.g. if given "https://domain.com/path/something.jpg", this returns "something.jpg".
 */


const getURLFilename = url => {
  const urlData = new _urlParse.default(url);
  const {
    pathname
  } = urlData;
  if (!pathname) return null;
  const fn = pathname.trim().split('/').pop();
  return fn;
};
/**
 * Returns the base part of a URL.
 * 
 * E.g. if given "https://domain.com/something/", this returns "http://domain.com".
 */


exports.getURLFilename = getURLFilename;

const getBaseURL = url => {
  const urlData = new _urlParse.default(url);
  return urlData.origin;
};
/**
 * Wrapper for downloadFile() that adds the standard logger for CLI purposes.
 */


exports.getBaseURL = getBaseURL;

const downloadFileLogged = (url, target, opts = {}, customOpts = {}) => {
  return downloadFile(url, target, { ...opts,
    logFn: _log.logDebug
  }, customOpts);
};
/**
 * Requests a URL and saves the resulting data stream to a file.
 *
 * Useful for downloading files.
 */


exports.downloadFileLogged = downloadFileLogged;

const downloadFile = async (url, target, opts = {}, customOpts = {}) => {
  const {
    logFn,
    cleanupOnError = true
  } = opts;
  const safeFnRes = await (0, _fs2.getUnusedFilename)(target, '', opts.allowRenaming);
  const safeFn = {
    targetFilename: safeFnRes[0],
    success: safeFnRes[0] != null
  };
  const {
    targetFilename
  } = safeFn;

  try {
    if (!safeFn.success) {
      return {
        success: false,
        ...safeFn
      };
    }

    const req = makeGotRequest(url, { ...opts,
      returnStream: true
    }, customOpts);
    logFn && logFn('Saving to file:', _chalk.default.green(targetFilename), safeFn.hasModifiedFilename ? `(file already existed: ${_chalk.default.yellow(target)})` : null); // Wait for the file to finish downloading and saving to the target.

    await pipeline(req, (0, _fs.createWriteStream)(targetFilename)); // Check if the target successfully got saved.

    const reqSuccess = await (0, _fs2.fileExists)(targetFilename);
    return { ...safeFn,
      success: reqSuccess
    };
  } catch (err) {
    let exists = await (0, _fs2.fileExists)(targetFilename);

    if (exists && cleanupOnError) {
      await _fs.promises.unlink(targetFilename);
    }

    exists = await (0, _fs2.fileExists)(targetFilename);
    return { ...safeFn,
      success: false,
      error: err,
      cleanedUp: !exists
    };
  }
};
/**
 * Wrapper for request() that adds the standard logger for CLI purposes.
 */


exports.downloadFile = downloadFile;

const requestLogged = (url, opts = {}) => {
  return request(url, { ...opts,
    logFn: _log.logDebug
  });
};
/**
 * Returns a Got request for requesting or sending data.
 */


exports.requestLogged = requestLogged;

const makeGotRequest = (url, {
  postData = {},
  urlEncoded = true,
  headers = {},
  jar,
  logFn,
  returnStream = false,
  streamEvents = {}
} = {}, customOpts = {}) => {
  const postAttr = !(0, _lodash.isEmpty)(postData) ? postAttributes(postData, {
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
    ...postAttr,
    // Add in custom request options.
    ...customOpts
  };
  logFn && logFn('Requesting HTTP call with the following options:');
  logFn && logFn(reqOpts);

  if (returnStream) {
    const stream = _got.default.stream(url, reqOpts);

    for (const [eventName, eventFn] of Object.entries(streamEvents)) {
      stream.on(eventName, eventFn);
    }

    return stream;
  } else {
    return (0, _got.default)(url, reqOpts);
  }
};
/**
 * Requests a URL and returns the full response (or just the body, if specified).
 */


exports.makeGotRequest = makeGotRequest;

const request = async (url, {
  postData = {},
  urlEncoded = true,
  headers = {},
  jar,
  logFn,
  streamEvents = {}
} = {}, customOpts = {}) => {
  const req = makeGotRequest(url, {
    postData,
    urlEncoded,
    headers,
    jar,
    logFn,
    streamEvents
  }, customOpts);
  const res = await req;
  logFn && logFn('Requested URL:', res.requestUrl, '- duration:', res.timings.end - res.timings.start, 'ms', ...(!(0, _lodash.isEmpty)(postData) ? [`- sending POST${urlEncoded ? ' (urlEncoded)' : ''}:\n`, postData] : []));
  return res;
};

exports.request = request;