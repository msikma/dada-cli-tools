"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.xml = exports.vm = exports.text = exports.slug = exports.query = exports.promise = exports.output = exports.misc = exports.html = exports.fs = exports.error = void 0;

var error = _interopRequireWildcard(require("./error"));

exports.error = error;

var fs = _interopRequireWildcard(require("./fs"));

exports.fs = fs;

var html = _interopRequireWildcard(require("./html"));

exports.html = html;

var misc = _interopRequireWildcard(require("./misc"));

exports.misc = misc;

var output = _interopRequireWildcard(require("./output"));

exports.output = output;

var promise = _interopRequireWildcard(require("./promise"));

exports.promise = promise;

var query = _interopRequireWildcard(require("./query"));

exports.query = query;

var slug = _interopRequireWildcard(require("./slug"));

exports.slug = slug;

var text = _interopRequireWildcard(require("./text"));

exports.text = text;

var vm = _interopRequireWildcard(require("./vm"));

exports.vm = vm;

var xml = _interopRequireWildcard(require("./xml"));

exports.xml = xml;

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }