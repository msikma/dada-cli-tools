"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.logLeftHeaderTable = exports.logTable = void 0;

var _chalk = _interopRequireDefault(require("chalk"));

var _stringWidth = _interopRequireDefault(require("string-width"));

var _index = require("./index");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// dada-cli-tools - Libraries for making CLI programs <https://github.com/msikma/dada-cli-tools>
// © MIT license
// List of table drawing characters.
const assets = {
  cornerTL: '╭',
  cornerTR: '╮',
  cornerBL: '╰',
  cornerBR: '╯',
  regLineH: '─',
  regCrossLeft: '├',
  regCrossMid: '┼',
  regCrossRight: '┤',
  regLineV: '│',
  regCrossTop: '┬',
  regCrossBottom: '┴',
  // Header segments
  headerLineH: '═',
  headerHCrossLeft: '╞',
  headerHCrossMid: '╪',
  headerHCrossRight: '╡',
  headerHCrossTop: '╤',
  headerHCrossBottom: '╧',
  headerLineV: '║',
  headerVCrossLeft: '╟',
  headerVCrossMid: '╫',
  headerVCrossRight: '╢',
  headerVCrossTop: '╥',
  headerVCrossBottom: '╨',
  // Default colors
  headerColor: _chalk.default.red
  /** Returns an array range, e.g. [0, 1, 2, 3, 4] for 5. */

};

const range = len => new Array(len).fill().map((_, n) => n);
/** Returns the size of the largest member of an array. */


const findMaxLenProp = (arr, lenProp = 'length') => arr.reduce((max, item) => Math.max(item[lenProp], max), 0);
/** Returns the size of the largest member of an array using a function. */


const findMaxLenFn = (arr, lenFn) => arr.reduce((max, item) => Math.max(lenFn(item), max), 0);
/**
 * Returns the top or bottom line of a table.
 */


const getEndLine = (row, section) => {
  let a = null;
  let z = row.length;
  const regLineH = assets.regLineH;
  const cornerL = section === 'top' ? assets.cornerTL : assets.cornerBL;
  const cornerR = section === 'top' ? assets.cornerTR : assets.cornerBR;
  const regCross = section === 'top' ? assets.regCrossTop : assets.regCrossBottom;
  const headerVCross = section === 'top' ? assets.headerVCrossTop : assets.headerVCrossBottom;
  const line = [];
  line.push(cornerL);

  for (a = 0; a < z; ++a) {
    const item = row[a];
    line.push(regLineH.repeat(item.length));

    if (a < z - 1) {
      line.push(item.isHeader ? headerVCross : regCross);
    }
  }

  line.push(cornerR);
  return line;
};
/**
 * Returns a line for a table row.
 */


const getRowLine = row => {
  let a = null;
  let z = row.length;
  const line = [];
  line.push(assets.regLineV);

  for (a = 0; a < z; ++a) {
    const item = row[a];
    const valuePadded = item.value.padEnd(item.length);
    line.push(item.color ? item.color(valuePadded) : valuePadded);

    if (a < z - 1) {
      line.push(item.isHeader ? assets.headerLineV : assets.regLineV);
    }
  }

  line.push(assets.regLineV);
  return line;
};
/**
 * Creates a buffer (an array of arrays) for actually displaying a table,
 * after the table data itself has been generated.
 */


const constructTable = tableRows => {
  const buffer = [];
  const firstRow = tableRows[0];
  buffer.push(getEndLine(firstRow, 'top'));
  tableRows.forEach(row => buffer.push(getRowLine(row)));
  buffer.push(getEndLine(firstRow, 'bottom'));
  return buffer;
};
/**
 * Logs a table buffer to the screen.
 * 
 * Last step in the process.
 */


const outputTable = (buffer, logFn = _index.log) => {
  buffer.forEach(line => logFn(line.join('')));
};
/**
 * Draws any kind of table.
 * 
 * TODO: currently this assumes the user passes a left header table format.
 */


const logTable = (tableLines, logFn = _index.log) => {
  return logLeftHeaderTable(tableLines, logFn);
};
/**
 * Draws a table with a left side header.
 * 
 * E.g.:
 * 
 *   ╭───────╥────────┬──────┬─────┬───┬────╮
 *   │Vivamus║Lorem   │ipsum │dolor│sit│amet│
 *   │Aliquam║Praesent│tempor│     │   │    │
 *   ╰───────╨────────┴──────┴─────┴───┴────╯
 * 
 * Requires a data structure like this:
 * 
 *   [
 *     ['Vivamus', ['Lorem', 'ipsum', 'dolor', 'sit', 'amet']],
 *     ['Aliquam', ['Praesent', 'tempor']]
 *   ]
 * 
 * By default headers are displayed in red.
 */


exports.logTable = logTable;

const logLeftHeaderTable = (lines, logFn = _index.log) => {
  const headerCells = lines.map(l => l[0]);
  const dataCells = lines.map(l => l[1]); // Get the max number of cells in any line.

  const maxDataItems = findMaxLenProp(dataCells); // Calculate the length of the header cells.

  const headerLength = findMaxLenFn(headerCells, _stringWidth.default); // Calculate the length of each column.

  const columnLengths = range(maxDataItems).map(n => {
    const columnCells = dataCells.map(l => l[n] ? l[n] : '');
    return findMaxLenFn(columnCells, _stringWidth.default);
  });
  const tableRows = [];

  for (let a = 0; a < lines.length; ++a) {
    const row = [];
    row.push({
      length: headerLength,
      value: headerCells[a],
      color: assets.headerColor,
      isHeader: true
    });

    for (let b = 0; b < columnLengths.length; ++b) {
      row.push({
        length: columnLengths[b],
        value: dataCells[a][b] ? dataCells[a][b] : '',
        isHeader: false
      });
    }

    tableRows.push(row);
  } // Now that all table data is processed, generate a table buffer
  // and log it to the terminal.


  outputTable(constructTable(tableRows, logFn));
};

exports.logLeftHeaderTable = logLeftHeaderTable;