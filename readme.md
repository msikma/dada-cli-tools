## Dada CLI Tools

A set of useful libraries for making CLI tools. For bootstrapping new CLI projects easily, see [dada-cli-create](#)—it creates a new project with this as one of the dependencies.

### Included libraries

The items included here were all created as needed while making CLI tools in the past.

| Name         | Description                                                 |
|:-------------|:------------------------------------------------------------|
| `argparse`   | Parsing command line arguments and displaying usage help    |
| `cache`      | Data caching and retrieval                                  |
| `cookies`    | Parsing cookie files for making requests                    |
| `log`        | Message logging to stdout and to log files                  |
| `request`    | Requesting data over the network                            |
| `util/error` | Helper functions for working with exceptions                |
| `util/fs`    | File and path operations                                    |
| `util/misc`  | Various small helper functions that don't fit anywhere else |
| `util/output`| Printing data in various forms (JSON, XML, etc)             |
| `util/promise` | Promise-related helper functions                          |
| `util/query` | URL string manipulation                                     |
| `util/text`  | Text manipulation helper functions                          |
| `util/vm`    | Helper functions for extracting data from JS script tags    |

To import:

```js
const { resolveTilde } = require('dada-cli-tools/util/fs')
const { outputXML } = require('dada-cli-tools/util/output')
const { loadCookiesLogged } = require('dada-cli-tools/cookies')
const { logError, logInfo } = require('dada-cli-tools/log')
```

### Copyright

MIT license.
