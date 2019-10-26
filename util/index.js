"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.text = exports.query = exports.output = exports.misc = exports.fs = void 0;

var fs = _interopRequireWildcard(require("./fs"));

exports.fs = fs;

var misc = _interopRequireWildcard(require("./misc"));

exports.misc = misc;

var output = _interopRequireWildcard(require("./output"));

exports.output = output;

var query = _interopRequireWildcard(require("./query"));

exports.query = query;

var text = _interopRequireWildcard(require("./text"));

exports.text = text;

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }