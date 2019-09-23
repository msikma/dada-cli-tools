// dada-cli-tools - Libraries for making CLI programs <https://github.com/msikma/dada-cli-tools>
// © MIT license

export {
  dirName,
  ensureDir,
  progName,
  resolveTilde
} from './util/fs'

export {
  sortByKeys,
  wait
} from './util/misc'

export {
  objToParams,
  toFormURIComponent,
  removeQuery
} from './util/query'

export {
  blockElsToLb,
  charTrim,
  ensurePeriod,
  removeEmptyLines,
  removeUnnecessaryLines,
  splitOnLast,
  trimInner
} from './util/text'

export {
  default as makeArgParser
} from './argparse'

export {
  readCache,
  readCacheData,
  readCacheDataLogged,
  readCacheLogged,
  setBaseDir,
  setValidSeconds,
  writeCache,
  writeCacheLogged
} from './cache'

export {
  loadCookies,
  loadCookiesLogged
} from './cookies'

export {
  die,
  log,
  logDebug,
  logError,
  logInfo,
  logWarn,
  setVerbosity
} from './log'

export {
  default as outputByType,
  outputJSON,
  outputTerminal,
  outputXML
} from './output'

export {
  request,
  requestLogged
} from './request'
