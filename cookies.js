"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.loadCookiesFromCache = exports.loadCookiesLoggedFromCache = exports.loadCookies = exports.loadCookiesLogged = void 0;

var _toughCookie = require("tough-cookie");

var _fs = require("fs");

var _fileCookieStoreSync = _interopRequireDefault(require("file-cookie-store-sync"));

var _log = require("./log");

var _fs2 = require("./util/fs");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// dada-cli-tools - Libraries for making CLI programs <https://github.com/msikma/dada-cli-tools>
// © MIT license

/**
 * Loads cookies from a specified cookies.txt - and errors out, exiting the process
 * if something goes wrong. Used for CLI apps that cannot proceed without one.
 */
const loadCookiesLogged = async (cookiePath, createNew = false, failQuietly = false, canDie = true) => {
  try {
    const res = await loadCookies(cookiePath, createNew, failQuietly);

    if (res.err) {
      if (canDie) (0, _log.die)(String(res.err));else (0, _log.log)(String(res.err));
    }

    if (res.madeNew) {
      (0, _log.log)('Created new cookies file:', res.file);
    }

    if (res.file) {
      (0, _log.log)('Found cookies file:', res.file);
    }
  } catch (e) {
    if (~String(e.error).indexOf('Could not find cookies file')) {
      (0, _log.log)('Could not find cookies file:', cookiePath);
      return;
    }

    (0, _log.log)(String(e.error));
    return;
  }
};
/**
 * Loads cookies from a specified cookies.txt file and loads them into
 * a jar so that we can make requests with them.
 */


exports.loadCookiesLogged = loadCookiesLogged;

const loadCookies = (cookiePath, createNew = false, failQuietly = false) => new Promise(async (resolve, reject) => {
  try {
    let madeNew = false; // If the cookie file doesn't exist we could create a new file.

    if (!(0, _fs.existsSync)(cookiePath)) {
      if (failQuietly) {
        // Do nothing if the cookie jar is optional.
        return resolve({});
      }

      if (!createNew) {
        return reject({
          error: new Error(`Could not find cookies file: ${cookiePath}`)
        });
      } // Create the directory so we can make a new file.


      await (0, _fs2.ensureDir)((0, _fs2.dirName)(cookiePath));
      madeNew = true;
    } // Cookies must be in Netscape cookie file format.


    const cookieStore = new _fileCookieStoreSync.default(cookiePath, {
      no_file_error: true
    });
    const jar = new _toughCookie.CookieJar(cookieStore);
    resolve({
      jar,
      file: jar.store.file,
      madeNew
    });
  } catch (error) {
    reject({
      error
    });
  }
});
/**
 * Shorthand for loadCookiesLogged() using ~/.cache/<name> as the file path.
 */


exports.loadCookies = loadCookies;

const loadCookiesLoggedFromCache = (afterCachePath, createNew = false, failQuietly = false, canDie = true) => {
  return loadCookiesLogged((0, _fs2.resolveTilde)(`~/.cache/${afterCachePath}`), createNew, failQuietly, canDie);
};
/**
 * Shorthand for loadCookies() using ~/.cache/<name> as the file path.
 */


exports.loadCookiesLoggedFromCache = loadCookiesLoggedFromCache;

const loadCookiesFromCache = (afterCachePath, createNew = false, failQuietly = false) => {
  return loadCookies((0, _fs2.resolveTilde)(`~/.cache/${afterCachePath}`), createNew, failQuietly);
};

exports.loadCookiesFromCache = loadCookiesFromCache;