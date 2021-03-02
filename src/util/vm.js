// dada-cli-tools - Libraries for making CLI programs <https://github.com/msikma/dada-cli-tools>
// © MIT license

import vm from 'vm'
import { cloneDeep } from 'lodash'

// Provides 'window' by default to be more compatible with common <script> contents.
const DEFAULT_SANDBOX = { window: {} }

/**
 * Runs a script inside of a sandboxed VM to extract its data.
 */
export const extractScriptResult = (scriptContent, scriptSandbox = null) => {
  const sandbox = scriptSandbox ? scriptSandbox : cloneDeep(DEFAULT_SANDBOX)
  let success, error, value = null
  try {
    const script = new vm.Script(scriptContent)
    const ctx = new vm.createContext(sandbox)
    value = script.runInContext(ctx)
    success = true
    error = null
  }
  catch (err) {
    success = false
    error = null
  }
  return {
    success,
    error,
    value,
    sandbox
  }
}
