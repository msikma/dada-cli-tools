"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.slugify = exports.slugifyUnderscore = void 0;

var _standardSlugify = _interopRequireDefault(require("standard-slugify"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// dada-cli-tools - Libraries for making CLI programs <https://github.com/msikma/dada-cli-tools>
// © MIT license
const slugifyDefaults = {
  keepCase: true
  /** Slugify function that uses underscores as separators. */

};

const slugifyUnderscore = (str, opts) => {
  const slug = slugify(str, opts);
  return slug.replace(/-/g, '_');
};
/** Standard slugify function that returns URL-safe strings. */


exports.slugifyUnderscore = slugifyUnderscore;

const slugify = (str, opts = {}) => {
  return (0, _standardSlugify.default)(str, { ...slugifyDefaults,
    ...opts
  });
};

exports.slugify = slugify;