"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.loadCookiesFromCache = exports.loadCookiesLoggedFromCache = exports.loadCookies = exports.loadCookiesLogged = void 0;

var _path = _interopRequireDefault(require("path"));

var _toughCookie = require("tough-cookie");

var _fs = require("fs");

var _fileCookieStoreSync = _interopRequireDefault(require("file-cookie-store-sync"));

var _data = require("./util/data");

var _log = require("./log");

var _fs2 = require("./util/fs");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// dada-cli-tools - Libraries for making CLI programs <https://github.com/msikma/dada-cli-tools>
// © MIT license

/**
 * Promisified version of tough.Store.getAllCookies() for our internal cookies objects.
 */
const getCookies = cookieObj => new Promise((resolve, reject) => {
  cookieObj.jar.store.getAllCookies((err, cookies) => {
    if (err) {
      return reject(err);
    }

    return resolve(cookies);
  });
});
/**
 * Promisified version of tough.Store.putCookie() for our internal cookies objects.
 */


const putCookie = (cookieObj, cookie) => new Promise((resolve, reject) => {
  cookieObj.jar.store.putCookie(cookie, err => {
    if (err) {
      return reject(err);
    }

    return resolve();
  });
});
/**
 * Merges together multiple cookie objects into one.
 * 
 * This can be used to load cookies from multiple different files.
 */


const mergeCookieObjects = async cookieObjs => {
  const target = cookieObjs[0];

  for (const cookieObj of cookieObjs.slice(1)) {
    const cookies = await getCookies(cookieObj);

    for (const cookie of cookies) {
      await putCookie(target, cookie);
    }
  }

  return target;
};
/**
 * Loads cookies from a specified cookies.txt - and errors out, exiting the process
 * if something goes wrong. Used for CLI apps that cannot proceed without one.
 */


const loadCookiesLogged = async (cookiePath, createNew = false, failQuietly = false, canDie = true) => new Promise(async (resolve, reject) => {
  try {
    const res = await loadCookies(cookiePath, createNew, failQuietly);

    if (res.error) {
      if (canDie) (0, _log.die)(String(res.error));else (0, _log.log)(String(res.error));
    }

    if (res.madeNew) {
      (0, _log.log)('Created new cookies file:', res.file);
    }

    if (res.file) {
      (0, _log.log)('Found cookies file:', res.file);
    }

    return resolve(res);
  } catch (e) {
    if (~String(e.error).indexOf('Could not find cookies file')) {
      (0, _log.log)('Could not find cookies file(s):', (0, _data.wrapInArray)(cookiePath).join(', '));
    } else {
      (0, _log.log)(String(e.error));
    }

    return reject({
      error: e,
      jar: null,
      file: null
    });
  }
});
/**
 * Loads cookies from a specified cookies.txt file into a jar object.
 * 
 * Cookies from multiple files can be loaded by passing an array for 'cookiePath'.
 */


exports.loadCookiesLogged = loadCookiesLogged;

const loadCookies = (cookiePath, createNew = false, failQuietly = false) => new Promise(async (resolve, reject) => {
  if (!cookiePath || cookiePath.length === 0) {
    return reject({
      error: new Error(`No cookie path passed`)
    });
  }

  const cookiePaths = (0, _data.wrapInArray)(cookiePath);

  try {
    const cookieObjs = [];
    let madeNew;

    for (const cookieFile of cookiePaths) {
      madeNew = false;

      try {
        // If the cookie file doesn't exist we could create a new file.
        if (!(0, _fs.existsSync)(cookieFile)) {
          if (failQuietly) {
            // Do nothing if the cookie jar is optional.
            return resolve({});
          }

          if (!createNew) {
            return reject({
              error: new Error(`Could not find cookies file: ${cookieFile}`)
            });
          } // Create the directory so we can make a new file.


          await (0, _fs2.ensureDir)(_path.default.dirname(cookieFile));
          madeNew = true;
        } // Cookies must be in Netscape cookie file format.


        const cookieStore = new _fileCookieStoreSync.default(cookieFile, {
          no_file_error: true
        });
        const jar = new _toughCookie.CookieJar(cookieStore);
        const obj = {
          jar,
          file: jar.store.file,
          madeNew
        };
        cookieObjs.push(obj);
      } catch (error) {
        reject({
          error
        });
      }
    }

    const madeAnyNew = cookieObjs.map(obj => obj.madeNew).includes(true);

    if (cookieObjs.length === 1) {
      resolve({ ...cookieObjs[0],
        madeNew
      });
    }

    resolve({ ...(await mergeCookieObjects(cookieObjs)),
      madeNew: madeAnyNew
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