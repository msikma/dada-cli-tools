## Dada CLI Tools

A set of libraries for making CLI tools. This package was made for my personal purposes, not for usage by a general public, which is why there's very little documentation.

Used in conjunction with [dada-cli-create](https://github.com/msikma/create-dada-cli), for quickly bootstrapping new CLI projects.

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
| `util/html`  | Functions for processing HTML with Cheerio                  |
| `util/misc`  | Various small helper functions that don't fit anywhere else |
| `util/output`| Printing data in various forms (JSON, XML, etc)             |
| `util/promise` | Promise-related helper functions                          |
| `util/query` | URL string manipulation                                     |
| `util/text`  | Text manipulation helper functions                          |
| `util/vm`    | Helper functions for extracting data from JS script tags    |
| `util/xml`   | XML manipulation functions                                  |

To import:

```js
const { resolveTilde } = require('dada-cli-tools/util/fs')
const { outputXML } = require('dada-cli-tools/util/output')
const { loadCookiesLogged } = require('dada-cli-tools/cookies')
const { logError, logInfo } = require('dada-cli-tools/log')
```

No documentation is available.

### Copyright

MIT license.
