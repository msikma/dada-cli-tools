// dada-cli-tools - Libraries for making CLI programs <https://github.com/msikma/dada-cli-tools>
// © MIT license

import { CookieJar } from 'tough-cookie'
import { existsSync } from 'fs'
import FileCookieStore from 'file-cookie-store-sync'
import makeDir from 'make-dir'

import { log, die, dirName } from './utils'

/**
 * Loads cookies from a specified cookies.txt - and errors out, exiting the process
 * if something goes wrong. Used for CLI apps that cannot proceed without one.
 */
export const loadCookiesLogged = async (cookiePath, createNew = false, failQuietly = false, canDie = true) => {
  const res = await loadCookies(cookiePath, createNew, failQuietly)
  console.log(res)
  if (res.err) {
    if (canDie) die(String(res.err))
    else log(String(res.err))
  }
  if (res.madeNew) {
    log('Created new cookies file:', cookiePath)
  }
  if (res.file) {
    log('Found cookies file:', file)
  }
}

/**
 * Loads cookies from a specified cookies.txt file and loads them into
 * a jar so that we can make requests with them.
 */
export const loadCookies = (cookiePath, createNew = false, failQuietly = false) => (
  new Promise((resolve, reject) => {
    try {
      let madeNew = false

      // If the cookie file doesn't exist we could create a new file.
      if (!existsSync(cookiePath)) {
        if (failQuietly) {
          // Do nothing if the cookie jar is optional.
          return resolve({})
        }
        if (!createNew) {
          return reject({ err: new Error(`Could not find cookies file: ${cookiePath}`) })
        }
        // Create the directory so we can make a new file.
        makeDir.sync(dirName(cookiePath))
        madeNew = true
      }
      // Cookies must be in Netscape cookie file format.
      const cookieStore = new FileCookieStore(cookiePath, { no_file_error: true })
      const jar = new CookieJar(cookieStore)
      resolve({ jar, file: jar.store.file, madeNew })
    }
    catch (err) {
      reject({ err })
    }
  })
)
