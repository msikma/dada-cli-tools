"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.makeArgParser = void 0;

var _argparse = require("argparse");

var _formatter = _interopRequireDefault(require("argparse/lib/help/formatter"));

var _text = require("./util/text");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// A simple wrapper for the ArgumentParser library. Adds support for an extra help paragraph,
// and the ability to add multiple sections. This is useful for grouping certain options together.
// Original library: <https://github.com/nodeca/argparse>
const makeArgParser = opts => {
  var _temp;

  return new (_temp = class ArgumentParserWrapper {
    constructor() {
      _defineProperty(this, "addArgument", (...opts) => {
        // Add a section if we've set one up to be printed.
        if (this.sectionReady) {
          // We'll save the longest argument to do string matching on.
          this.sections.push({
            header: this.sectionNext,
            match: this.longestArgument(opts[0])
          });
          this.sectionReady = false;
        } // Special formatting case: if an argument has 'choices', 'metavar' and
        // our own '_choicesHelp', we want to display its options differently than normal.
        // Save a reference and modify the output before parsing.


        if (opts[1].choices && opts[1].metavar && opts[1]._choicesHelp) {
          this.choices.push({
            name: opts[0],
            choices: opts[1].choices,
            choicesHelp: opts[1]._choicesHelp
          });
        }

        return this.parser.addArgument(...opts);
      });

      _defineProperty(this, "error", (...opts) => this.parser.error(...opts));

      _defineProperty(this, "parseArgs", (...opts) => {
        this._formatHelp();

        return this.parser.parseArgs(...opts);
      });

      _defineProperty(this, "_addLongHelp", (longHelp, removeLines = true) => {
        this.parser.formatHelp = () => {
          // Here we do some messing around with the private ArgumentParser API in order to
          // get extra text to show up. You're never supposed to do that, but oh well.
          const formatter = new _formatter.default({
            prog: this.parser.prog
          });
          formatter.addUsage(this.parser.usage, this.parser._actions, this.parser._mutuallyExclusiveGroups);
          formatter.addText(this.parser.description);

          if (longHelp) {
            // Add the long help text without filtering the text formatting.
            formatter._addItem(str => str, [longHelp]);
          }

          this.parser._actionGroups.forEach(actionGroup => {
            formatter.startSection(actionGroup.title);
            formatter.addText(actionGroup.description);
            formatter.addArguments(actionGroup._groupActions);
            formatter.endSection();
          }); // Add epilogue without reformatting the whitespace.
          // Don't you DARE take away my linebreaks.


          formatter._addItem(str => str, [this.parser.epilog]);

          const formatted = formatter.formatHelp();
          return removeLines ? (0, _text.removeUnnecessaryLines)(formatted) : formatted;
        };
      });

      _defineProperty(this, "hasArgument", (arg, line) => {
        return new RegExp(`[^\[]${arg}([^\s]|$)`).test(line);
      });

      _defineProperty(this, "longestArgument", args => {
        const argsArr = Array.isArray(args) ? args : [args];
        return argsArr.reduce((l, o) => o.length > l.length ? o : l, '');
      });

      _defineProperty(this, "_formatHelp", () => {
        const originalFormatHelp = this.parser.formatHelp;

        this.parser.formatHelp = () => {
          // Run the original formatting function, then find the 'query' argument.
          // Add a header string in front of it.
          let buffer = originalFormatHelp().split('\n');
          this.sections.forEach(section => {
            let addedHeader = false;
            buffer = buffer.map(line => {
              // Find the first argument that this section should be directly above.
              if (addedHeader) return line;
              const hasArg = this.hasArgument(section.match, line);

              if (hasArg) {
                addedHeader = true;
                return `\n${section.header}\n${line}`;
              }

              return line;
            });
          }); // Format the extra multiple choice sections.

          this.choices.forEach(choiceItem => {
            let choiceSection = [];
            const choices = choiceItem.choices.length;

            for (let a = 0; a < choices; ++a) {
              choiceSection.push(`     ${a === 0 ? '{' : ' '}${`${choiceItem.choices[a]}${a < choices - 1 ? ',' : '}'}`.padEnd(20)}${choiceItem.choicesHelp[a] ? choiceItem.choicesHelp[a] : ''}`);
            }

            buffer = buffer.map(line => {
              return this.hasArgument(this.longestArgument(choiceItem.name), line) ? `${line}\n${choiceSection.join('\n')}` : line;
            });
          }); // While we're at it, remove double empty lines.

          return this._removeDoubleEmptyLines(buffer);
        };
      });

      _defineProperty(this, "_removeDoubleEmptyLines", str => str.map(l => l.trim() === '' ? '' : l).join('\n').split('\n\n\n').join('\n\n'));

      // List of extra multiple choice items we'll print.
      this.choices = []; // List of section headers we'll print.

      this.sections = []; // Used to keep track of sections and add them after the argument following them.

      this.sectionReady = false;
      this.sectionNext = null;
      this.parser = new _argparse.ArgumentParser(opts);

      this._addLongHelp(opts.longHelp);
    } // Wrapper for ArgumentParser.addArgument().


    // Adds a new section to the list of arguments, right before whatever argument comes next.
    addSection(header) {
      this.sectionReady = true;
      this.sectionNext = header;
    } // Adds extra help lines to the output if needed, and sets up a modified help formatter.


  }, _temp)();
};

exports.makeArgParser = makeArgParser;
var _default = makeArgParser;
exports.default = _default;