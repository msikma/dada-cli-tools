"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.util = exports.request = exports.log = exports.cookies = exports.cache = exports.argparse = void 0;

var argparse = _interopRequireWildcard(require("./argparse"));

exports.argparse = argparse;

var cache = _interopRequireWildcard(require("./cache"));

exports.cache = cache;

var cookies = _interopRequireWildcard(require("./cookies"));

exports.cookies = cookies;

var log = _interopRequireWildcard(require("./log"));

exports.log = log;

var request = _interopRequireWildcard(require("./request"));

exports.request = request;

var util = _interopRequireWildcard(require("./util"));

exports.util = util;

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }