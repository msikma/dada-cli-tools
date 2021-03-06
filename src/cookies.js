// dada-cli-tools - Libraries for making CLI programs <https://github.com/msikma/dada-cli-tools>
// © MIT license

import { CookieJar } from 'tough-cookie'
import { existsSync } from 'fs'
import FileCookieStore from 'file-cookie-store-sync'

import { log, die } from './log'
import { dirName, ensureDir, resolveTilde } from './util/fs'

/**
 * Loads cookies from a specified cookies.txt - and errors out, exiting the process
 * if something goes wrong. Used for CLI apps that cannot proceed without one.
 */
export const loadCookiesLogged = async (cookiePath, createNew = false, failQuietly = false, canDie = true) => (
  new Promise(async (resolve, reject) => {
    try {
      const res = await loadCookies(cookiePath, createNew, failQuietly)
      if (res.error) {
        if (canDie) die(String(res.error))
        else log(String(res.error))
      }
      if (res.madeNew) {
        log('Created new cookies file:', res.file)
      }
      if (res.file) {
        log('Found cookies file:', res.file)
      }
      return resolve(res)
    }
    catch (e) {
      if (~String(e.error).indexOf('Could not find cookies file')) {
        log('Could not find cookies file:', cookiePath)
      }
      else {
        log(String(e.error))
      }
      return reject({ error: e, jar: null, file: null })
    }
  })
)

/**
 * Loads cookies from a specified cookies.txt file and loads them into
 * a jar so that we can make requests with them.
 */
export const loadCookies = (cookiePath, createNew = false, failQuietly = false) => (
  new Promise(async (resolve, reject) => {
    try {
      let madeNew = false

      // If the cookie file doesn't exist we could create a new file.
      if (!existsSync(cookiePath)) {
        if (failQuietly) {
          // Do nothing if the cookie jar is optional.
          return resolve({})
        }
        if (!createNew) {
          return reject({ error: new Error(`Could not find cookies file: ${cookiePath}`) })
        }
        // Create the directory so we can make a new file.
        await ensureDir(dirName(cookiePath))
        madeNew = true
      }
      // Cookies must be in Netscape cookie file format.
      const cookieStore = new FileCookieStore(cookiePath, { no_file_error: true })
      const jar = new CookieJar(cookieStore)
      resolve({ jar, file: jar.store.file, madeNew })
    }
    catch (error) {
      reject({ error })
    }
  })
)

/**
 * Shorthand for loadCookiesLogged() using ~/.cache/<name> as the file path.
 */
export const loadCookiesLoggedFromCache = (afterCachePath, createNew = false, failQuietly = false, canDie = true) => {
  return loadCookiesLogged(resolveTilde(`~/.cache/${afterCachePath}`), createNew, failQuietly, canDie)
}

/**
 * Shorthand for loadCookies() using ~/.cache/<name> as the file path.
 */
export const loadCookiesFromCache = (afterCachePath, createNew = false, failQuietly = false) => {
  return loadCookies(resolveTilde(`~/.cache/${afterCachePath}`), createNew, failQuietly)
}
