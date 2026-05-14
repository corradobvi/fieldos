var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __commonJS = (cb, mod) => function __require2() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except2, desc2) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except2)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc(from, key)) || desc2.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/.pnpm/object-assign@4.1.1/node_modules/object-assign/index.js
var require_object_assign = __commonJS({
  "node_modules/.pnpm/object-assign@4.1.1/node_modules/object-assign/index.js"(exports, module) {
    "use strict";
    var getOwnPropertySymbols = Object.getOwnPropertySymbols;
    var hasOwnProperty = Object.prototype.hasOwnProperty;
    var propIsEnumerable = Object.prototype.propertyIsEnumerable;
    function toObject(val) {
      if (val === null || val === void 0) {
        throw new TypeError("Object.assign cannot be called with null or undefined");
      }
      return Object(val);
    }
    function shouldUseNative() {
      try {
        if (!Object.assign) {
          return false;
        }
        var test1 = new String("abc");
        test1[5] = "de";
        if (Object.getOwnPropertyNames(test1)[0] === "5") {
          return false;
        }
        var test2 = {};
        for (var i = 0; i < 10; i++) {
          test2["_" + String.fromCharCode(i)] = i;
        }
        var order2 = Object.getOwnPropertyNames(test2).map(function(n) {
          return test2[n];
        });
        if (order2.join("") !== "0123456789") {
          return false;
        }
        var test3 = {};
        "abcdefghijklmnopqrst".split("").forEach(function(letter) {
          test3[letter] = letter;
        });
        if (Object.keys(Object.assign({}, test3)).join("") !== "abcdefghijklmnopqrst") {
          return false;
        }
        return true;
      } catch (err) {
        return false;
      }
    }
    module.exports = shouldUseNative() ? Object.assign : function(target, source) {
      var from;
      var to = toObject(target);
      var symbols;
      for (var s = 1; s < arguments.length; s++) {
        from = Object(arguments[s]);
        for (var key in from) {
          if (hasOwnProperty.call(from, key)) {
            to[key] = from[key];
          }
        }
        if (getOwnPropertySymbols) {
          symbols = getOwnPropertySymbols(from);
          for (var i = 0; i < symbols.length; i++) {
            if (propIsEnumerable.call(from, symbols[i])) {
              to[symbols[i]] = from[symbols[i]];
            }
          }
        }
      }
      return to;
    };
  }
});

// node_modules/.pnpm/vary@1.1.2/node_modules/vary/index.js
var require_vary = __commonJS({
  "node_modules/.pnpm/vary@1.1.2/node_modules/vary/index.js"(exports, module) {
    "use strict";
    module.exports = vary;
    module.exports.append = append;
    var FIELD_NAME_REGEXP = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/;
    function append(header, field) {
      if (typeof header !== "string") {
        throw new TypeError("header argument is required");
      }
      if (!field) {
        throw new TypeError("field argument is required");
      }
      var fields = !Array.isArray(field) ? parse(String(field)) : field;
      for (var j = 0; j < fields.length; j++) {
        if (!FIELD_NAME_REGEXP.test(fields[j])) {
          throw new TypeError("field argument contains an invalid header name");
        }
      }
      if (header === "*") {
        return header;
      }
      var val = header;
      var vals = parse(header.toLowerCase());
      if (fields.indexOf("*") !== -1 || vals.indexOf("*") !== -1) {
        return "*";
      }
      for (var i = 0; i < fields.length; i++) {
        var fld = fields[i].toLowerCase();
        if (vals.indexOf(fld) === -1) {
          vals.push(fld);
          val = val ? val + ", " + fields[i] : fields[i];
        }
      }
      return val;
    }
    function parse(header) {
      var end = 0;
      var list = [];
      var start = 0;
      for (var i = 0, len = header.length; i < len; i++) {
        switch (header.charCodeAt(i)) {
          case 32:
            if (start === end) {
              start = end = i + 1;
            }
            break;
          case 44:
            list.push(header.substring(start, end));
            start = end = i + 1;
            break;
          default:
            end = i + 1;
            break;
        }
      }
      list.push(header.substring(start, end));
      return list;
    }
    function vary(res, field) {
      if (!res || !res.getHeader || !res.setHeader) {
        throw new TypeError("res argument is required");
      }
      var val = res.getHeader("Vary") || "";
      var header = Array.isArray(val) ? val.join(", ") : String(val);
      if (val = append(header, field)) {
        res.setHeader("Vary", val);
      }
    }
  }
});

// node_modules/.pnpm/cors@2.8.6/node_modules/cors/lib/index.js
var require_lib = __commonJS({
  "node_modules/.pnpm/cors@2.8.6/node_modules/cors/lib/index.js"(exports, module) {
    (function() {
      "use strict";
      var assign = require_object_assign();
      var vary = require_vary();
      var defaults = {
        origin: "*",
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
        preflightContinue: false,
        optionsSuccessStatus: 204
      };
      function isString(s) {
        return typeof s === "string" || s instanceof String;
      }
      function isOriginAllowed(origin, allowedOrigin) {
        if (Array.isArray(allowedOrigin)) {
          for (var i = 0; i < allowedOrigin.length; ++i) {
            if (isOriginAllowed(origin, allowedOrigin[i])) {
              return true;
            }
          }
          return false;
        } else if (isString(allowedOrigin)) {
          return origin === allowedOrigin;
        } else if (allowedOrigin instanceof RegExp) {
          return allowedOrigin.test(origin);
        } else {
          return !!allowedOrigin;
        }
      }
      function configureOrigin(options, req) {
        var requestOrigin = req.headers.origin, headers = [], isAllowed;
        if (!options.origin || options.origin === "*") {
          headers.push([{
            key: "Access-Control-Allow-Origin",
            value: "*"
          }]);
        } else if (isString(options.origin)) {
          headers.push([{
            key: "Access-Control-Allow-Origin",
            value: options.origin
          }]);
          headers.push([{
            key: "Vary",
            value: "Origin"
          }]);
        } else {
          isAllowed = isOriginAllowed(requestOrigin, options.origin);
          headers.push([{
            key: "Access-Control-Allow-Origin",
            value: isAllowed ? requestOrigin : false
          }]);
          headers.push([{
            key: "Vary",
            value: "Origin"
          }]);
        }
        return headers;
      }
      function configureMethods(options) {
        var methods = options.methods;
        if (methods.join) {
          methods = options.methods.join(",");
        }
        return {
          key: "Access-Control-Allow-Methods",
          value: methods
        };
      }
      function configureCredentials(options) {
        if (options.credentials === true) {
          return {
            key: "Access-Control-Allow-Credentials",
            value: "true"
          };
        }
        return null;
      }
      function configureAllowedHeaders(options, req) {
        var allowedHeaders = options.allowedHeaders || options.headers;
        var headers = [];
        if (!allowedHeaders) {
          allowedHeaders = req.headers["access-control-request-headers"];
          headers.push([{
            key: "Vary",
            value: "Access-Control-Request-Headers"
          }]);
        } else if (allowedHeaders.join) {
          allowedHeaders = allowedHeaders.join(",");
        }
        if (allowedHeaders && allowedHeaders.length) {
          headers.push([{
            key: "Access-Control-Allow-Headers",
            value: allowedHeaders
          }]);
        }
        return headers;
      }
      function configureExposedHeaders(options) {
        var headers = options.exposedHeaders;
        if (!headers) {
          return null;
        } else if (headers.join) {
          headers = headers.join(",");
        }
        if (headers && headers.length) {
          return {
            key: "Access-Control-Expose-Headers",
            value: headers
          };
        }
        return null;
      }
      function configureMaxAge(options) {
        var maxAge = (typeof options.maxAge === "number" || options.maxAge) && options.maxAge.toString();
        if (maxAge && maxAge.length) {
          return {
            key: "Access-Control-Max-Age",
            value: maxAge
          };
        }
        return null;
      }
      function applyHeaders(headers, res) {
        for (var i = 0, n = headers.length; i < n; i++) {
          var header = headers[i];
          if (header) {
            if (Array.isArray(header)) {
              applyHeaders(header, res);
            } else if (header.key === "Vary" && header.value) {
              vary(res, header.value);
            } else if (header.value) {
              res.setHeader(header.key, header.value);
            }
          }
        }
      }
      function cors2(options, req, res, next) {
        var headers = [], method = req.method && req.method.toUpperCase && req.method.toUpperCase();
        if (method === "OPTIONS") {
          headers.push(configureOrigin(options, req));
          headers.push(configureCredentials(options));
          headers.push(configureMethods(options));
          headers.push(configureAllowedHeaders(options, req));
          headers.push(configureMaxAge(options));
          headers.push(configureExposedHeaders(options));
          applyHeaders(headers, res);
          if (options.preflightContinue) {
            next();
          } else {
            res.statusCode = options.optionsSuccessStatus;
            res.setHeader("Content-Length", "0");
            res.end();
          }
        } else {
          headers.push(configureOrigin(options, req));
          headers.push(configureCredentials(options));
          headers.push(configureExposedHeaders(options));
          applyHeaders(headers, res);
          next();
        }
      }
      function middlewareWrapper(o) {
        var optionsCallback = null;
        if (typeof o === "function") {
          optionsCallback = o;
        } else {
          optionsCallback = function(req, cb) {
            cb(null, o);
          };
        }
        return function corsMiddleware(req, res, next) {
          optionsCallback(req, function(err, options) {
            if (err) {
              next(err);
            } else {
              var corsOptions = assign({}, defaults, options);
              var originCallback = null;
              if (corsOptions.origin && typeof corsOptions.origin === "function") {
                originCallback = corsOptions.origin;
              } else if (corsOptions.origin) {
                originCallback = function(origin, cb) {
                  cb(null, corsOptions.origin);
                };
              }
              if (originCallback) {
                originCallback(req.headers.origin, function(err2, origin) {
                  if (err2 || !origin) {
                    next(err2);
                  } else {
                    corsOptions.origin = origin;
                    cors2(corsOptions, req, res, next);
                  }
                });
              } else {
                next();
              }
            }
          });
        };
      }
      module.exports = middlewareWrapper;
    })();
  }
});

// node_modules/.pnpm/pino-std-serializers@7.1.0/node_modules/pino-std-serializers/lib/err-helpers.js
var require_err_helpers = __commonJS({
  "node_modules/.pnpm/pino-std-serializers@7.1.0/node_modules/pino-std-serializers/lib/err-helpers.js"(exports, module) {
    "use strict";
    var isErrorLike = (err) => {
      return err && typeof err.message === "string";
    };
    var getErrorCause = (err) => {
      if (!err) return;
      const cause = err.cause;
      if (typeof cause === "function") {
        const causeResult = err.cause();
        return isErrorLike(causeResult) ? causeResult : void 0;
      } else {
        return isErrorLike(cause) ? cause : void 0;
      }
    };
    var _stackWithCauses = (err, seen) => {
      if (!isErrorLike(err)) return "";
      const stack = err.stack || "";
      if (seen.has(err)) {
        return stack + "\ncauses have become circular...";
      }
      const cause = getErrorCause(err);
      if (cause) {
        seen.add(err);
        return stack + "\ncaused by: " + _stackWithCauses(cause, seen);
      } else {
        return stack;
      }
    };
    var stackWithCauses = (err) => _stackWithCauses(err, /* @__PURE__ */ new Set());
    var _messageWithCauses = (err, seen, skip) => {
      if (!isErrorLike(err)) return "";
      const message = skip ? "" : err.message || "";
      if (seen.has(err)) {
        return message + ": ...";
      }
      const cause = getErrorCause(err);
      if (cause) {
        seen.add(err);
        const skipIfVErrorStyleCause = typeof err.cause === "function";
        return message + (skipIfVErrorStyleCause ? "" : ": ") + _messageWithCauses(cause, seen, skipIfVErrorStyleCause);
      } else {
        return message;
      }
    };
    var messageWithCauses = (err) => _messageWithCauses(err, /* @__PURE__ */ new Set());
    module.exports = {
      isErrorLike,
      getErrorCause,
      stackWithCauses,
      messageWithCauses
    };
  }
});

// node_modules/.pnpm/pino-std-serializers@7.1.0/node_modules/pino-std-serializers/lib/err-proto.js
var require_err_proto = __commonJS({
  "node_modules/.pnpm/pino-std-serializers@7.1.0/node_modules/pino-std-serializers/lib/err-proto.js"(exports, module) {
    "use strict";
    var seen = /* @__PURE__ */ Symbol("circular-ref-tag");
    var rawSymbol = /* @__PURE__ */ Symbol("pino-raw-err-ref");
    var pinoErrProto = Object.create({}, {
      type: {
        enumerable: true,
        writable: true,
        value: void 0
      },
      message: {
        enumerable: true,
        writable: true,
        value: void 0
      },
      stack: {
        enumerable: true,
        writable: true,
        value: void 0
      },
      aggregateErrors: {
        enumerable: true,
        writable: true,
        value: void 0
      },
      raw: {
        enumerable: false,
        get: function() {
          return this[rawSymbol];
        },
        set: function(val) {
          this[rawSymbol] = val;
        }
      }
    });
    Object.defineProperty(pinoErrProto, rawSymbol, {
      writable: true,
      value: {}
    });
    module.exports = {
      pinoErrProto,
      pinoErrorSymbols: {
        seen,
        rawSymbol
      }
    };
  }
});

// node_modules/.pnpm/pino-std-serializers@7.1.0/node_modules/pino-std-serializers/lib/err.js
var require_err = __commonJS({
  "node_modules/.pnpm/pino-std-serializers@7.1.0/node_modules/pino-std-serializers/lib/err.js"(exports, module) {
    "use strict";
    module.exports = errSerializer;
    var { messageWithCauses, stackWithCauses, isErrorLike } = require_err_helpers();
    var { pinoErrProto, pinoErrorSymbols } = require_err_proto();
    var { seen } = pinoErrorSymbols;
    var { toString } = Object.prototype;
    function errSerializer(err) {
      if (!isErrorLike(err)) {
        return err;
      }
      err[seen] = void 0;
      const _err = Object.create(pinoErrProto);
      _err.type = toString.call(err.constructor) === "[object Function]" ? err.constructor.name : err.name;
      _err.message = messageWithCauses(err);
      _err.stack = stackWithCauses(err);
      if (Array.isArray(err.errors)) {
        _err.aggregateErrors = err.errors.map((err2) => errSerializer(err2));
      }
      for (const key in err) {
        if (_err[key] === void 0) {
          const val = err[key];
          if (isErrorLike(val)) {
            if (key !== "cause" && !Object.prototype.hasOwnProperty.call(val, seen)) {
              _err[key] = errSerializer(val);
            }
          } else {
            _err[key] = val;
          }
        }
      }
      delete err[seen];
      _err.raw = err;
      return _err;
    }
  }
});

// node_modules/.pnpm/pino-std-serializers@7.1.0/node_modules/pino-std-serializers/lib/err-with-cause.js
var require_err_with_cause = __commonJS({
  "node_modules/.pnpm/pino-std-serializers@7.1.0/node_modules/pino-std-serializers/lib/err-with-cause.js"(exports, module) {
    "use strict";
    module.exports = errWithCauseSerializer;
    var { isErrorLike } = require_err_helpers();
    var { pinoErrProto, pinoErrorSymbols } = require_err_proto();
    var { seen } = pinoErrorSymbols;
    var { toString } = Object.prototype;
    function errWithCauseSerializer(err) {
      if (!isErrorLike(err)) {
        return err;
      }
      err[seen] = void 0;
      const _err = Object.create(pinoErrProto);
      _err.type = toString.call(err.constructor) === "[object Function]" ? err.constructor.name : err.name;
      _err.message = err.message;
      _err.stack = err.stack;
      if (Array.isArray(err.errors)) {
        _err.aggregateErrors = err.errors.map((err2) => errWithCauseSerializer(err2));
      }
      if (isErrorLike(err.cause) && !Object.prototype.hasOwnProperty.call(err.cause, seen)) {
        _err.cause = errWithCauseSerializer(err.cause);
      }
      for (const key in err) {
        if (_err[key] === void 0) {
          const val = err[key];
          if (isErrorLike(val)) {
            if (!Object.prototype.hasOwnProperty.call(val, seen)) {
              _err[key] = errWithCauseSerializer(val);
            }
          } else {
            _err[key] = val;
          }
        }
      }
      delete err[seen];
      _err.raw = err;
      return _err;
    }
  }
});

// node_modules/.pnpm/pino-std-serializers@7.1.0/node_modules/pino-std-serializers/lib/req.js
var require_req = __commonJS({
  "node_modules/.pnpm/pino-std-serializers@7.1.0/node_modules/pino-std-serializers/lib/req.js"(exports, module) {
    "use strict";
    module.exports = {
      mapHttpRequest,
      reqSerializer
    };
    var rawSymbol = /* @__PURE__ */ Symbol("pino-raw-req-ref");
    var pinoReqProto = Object.create({}, {
      id: {
        enumerable: true,
        writable: true,
        value: ""
      },
      method: {
        enumerable: true,
        writable: true,
        value: ""
      },
      url: {
        enumerable: true,
        writable: true,
        value: ""
      },
      query: {
        enumerable: true,
        writable: true,
        value: ""
      },
      params: {
        enumerable: true,
        writable: true,
        value: ""
      },
      headers: {
        enumerable: true,
        writable: true,
        value: {}
      },
      remoteAddress: {
        enumerable: true,
        writable: true,
        value: ""
      },
      remotePort: {
        enumerable: true,
        writable: true,
        value: ""
      },
      raw: {
        enumerable: false,
        get: function() {
          return this[rawSymbol];
        },
        set: function(val) {
          this[rawSymbol] = val;
        }
      }
    });
    Object.defineProperty(pinoReqProto, rawSymbol, {
      writable: true,
      value: {}
    });
    function reqSerializer(req) {
      const connection = req.info || req.socket;
      const _req = Object.create(pinoReqProto);
      _req.id = typeof req.id === "function" ? req.id() : req.id || (req.info ? req.info.id : void 0);
      _req.method = req.method;
      if (req.originalUrl) {
        _req.url = req.originalUrl;
      } else {
        const path2 = req.path;
        _req.url = typeof path2 === "string" ? path2 : req.url ? req.url.path || req.url : void 0;
      }
      if (req.query) {
        _req.query = req.query;
      }
      if (req.params) {
        _req.params = req.params;
      }
      _req.headers = req.headers;
      _req.remoteAddress = connection && connection.remoteAddress;
      _req.remotePort = connection && connection.remotePort;
      _req.raw = req.raw || req;
      return _req;
    }
    function mapHttpRequest(req) {
      return {
        req: reqSerializer(req)
      };
    }
  }
});

// node_modules/.pnpm/pino-std-serializers@7.1.0/node_modules/pino-std-serializers/lib/res.js
var require_res = __commonJS({
  "node_modules/.pnpm/pino-std-serializers@7.1.0/node_modules/pino-std-serializers/lib/res.js"(exports, module) {
    "use strict";
    module.exports = {
      mapHttpResponse,
      resSerializer
    };
    var rawSymbol = /* @__PURE__ */ Symbol("pino-raw-res-ref");
    var pinoResProto = Object.create({}, {
      statusCode: {
        enumerable: true,
        writable: true,
        value: 0
      },
      headers: {
        enumerable: true,
        writable: true,
        value: ""
      },
      raw: {
        enumerable: false,
        get: function() {
          return this[rawSymbol];
        },
        set: function(val) {
          this[rawSymbol] = val;
        }
      }
    });
    Object.defineProperty(pinoResProto, rawSymbol, {
      writable: true,
      value: {}
    });
    function resSerializer(res) {
      const _res = Object.create(pinoResProto);
      _res.statusCode = res.headersSent ? res.statusCode : null;
      _res.headers = res.getHeaders ? res.getHeaders() : res._headers;
      _res.raw = res;
      return _res;
    }
    function mapHttpResponse(res) {
      return {
        res: resSerializer(res)
      };
    }
  }
});

// node_modules/.pnpm/pino-std-serializers@7.1.0/node_modules/pino-std-serializers/index.js
var require_pino_std_serializers = __commonJS({
  "node_modules/.pnpm/pino-std-serializers@7.1.0/node_modules/pino-std-serializers/index.js"(exports, module) {
    "use strict";
    var errSerializer = require_err();
    var errWithCauseSerializer = require_err_with_cause();
    var reqSerializers = require_req();
    var resSerializers = require_res();
    module.exports = {
      err: errSerializer,
      errWithCause: errWithCauseSerializer,
      mapHttpRequest: reqSerializers.mapHttpRequest,
      mapHttpResponse: resSerializers.mapHttpResponse,
      req: reqSerializers.reqSerializer,
      res: resSerializers.resSerializer,
      wrapErrorSerializer: function wrapErrorSerializer(customSerializer) {
        if (customSerializer === errSerializer) return customSerializer;
        return function wrapErrSerializer(err) {
          return customSerializer(errSerializer(err));
        };
      },
      wrapRequestSerializer: function wrapRequestSerializer(customSerializer) {
        if (customSerializer === reqSerializers.reqSerializer) return customSerializer;
        return function wrappedReqSerializer(req) {
          return customSerializer(reqSerializers.reqSerializer(req));
        };
      },
      wrapResponseSerializer: function wrapResponseSerializer(customSerializer) {
        if (customSerializer === resSerializers.resSerializer) return customSerializer;
        return function wrappedResSerializer(res) {
          return customSerializer(resSerializers.resSerializer(res));
        };
      }
    };
  }
});

// node_modules/.pnpm/get-caller-file@2.0.5/node_modules/get-caller-file/index.js
var require_get_caller_file = __commonJS({
  "node_modules/.pnpm/get-caller-file@2.0.5/node_modules/get-caller-file/index.js"(exports, module) {
    "use strict";
    module.exports = function getCallerFile(position) {
      if (position === void 0) {
        position = 2;
      }
      if (position >= Error.stackTraceLimit) {
        throw new TypeError("getCallerFile(position) requires position be less then Error.stackTraceLimit but position was: `" + position + "` and Error.stackTraceLimit was: `" + Error.stackTraceLimit + "`");
      }
      var oldPrepareStackTrace = Error.prepareStackTrace;
      Error.prepareStackTrace = function(_, stack2) {
        return stack2;
      };
      var stack = new Error().stack;
      Error.prepareStackTrace = oldPrepareStackTrace;
      if (stack !== null && typeof stack === "object") {
        return stack[position] ? stack[position].getFileName() : void 0;
      }
    };
  }
});

// node_modules/.pnpm/pino-http@10.5.0/node_modules/pino-http/logger.js
var require_logger = __commonJS({
  "node_modules/.pnpm/pino-http@10.5.0/node_modules/pino-http/logger.js"(exports, module) {
    "use strict";
    var { pino: pino2, symbols: { stringifySym, chindingsSym } } = __require("pino");
    var serializers = require_pino_std_serializers();
    var getCallerFile = require_get_caller_file();
    var startTime = /* @__PURE__ */ Symbol("startTime");
    var reqObject = /* @__PURE__ */ Symbol("reqObject");
    function pinoLogger(opts, stream) {
      if (opts && opts._writableState) {
        stream = opts;
        opts = null;
      }
      opts = Object.assign({}, opts);
      opts.customAttributeKeys = opts.customAttributeKeys || {};
      const reqKey = opts.customAttributeKeys.req || "req";
      const resKey = opts.customAttributeKeys.res || "res";
      const errKey = opts.customAttributeKeys.err || "err";
      const requestIdKey = opts.customAttributeKeys.reqId || "reqId";
      const responseTimeKey = opts.customAttributeKeys.responseTime || "responseTime";
      delete opts.customAttributeKeys;
      const customProps = opts.customProps || void 0;
      opts.wrapSerializers = "wrapSerializers" in opts ? opts.wrapSerializers : true;
      if (opts.wrapSerializers) {
        opts.serializers = Object.assign({}, opts.serializers);
        const requestSerializer = opts.serializers[reqKey] || opts.serializers.req || serializers.req;
        const responseSerializer = opts.serializers[resKey] || opts.serializers.res || serializers.res;
        const errorSerializer = opts.serializers[errKey] || opts.serializers.err || serializers.err;
        opts.serializers[reqKey] = serializers.wrapRequestSerializer(requestSerializer);
        opts.serializers[resKey] = serializers.wrapResponseSerializer(responseSerializer);
        opts.serializers[errKey] = serializers.wrapErrorSerializer(errorSerializer);
      }
      delete opts.wrapSerializers;
      if (opts.useLevel && opts.customLogLevel) {
        throw new Error("You can't pass 'useLevel' and 'customLogLevel' together");
      }
      function getValidLogLevel(level, defaultValue = "info") {
        if (level && typeof level === "string") {
          const logLevel = level.trim();
          if (validLogLevels.includes(logLevel) === true) {
            return logLevel;
          }
        }
        return defaultValue;
      }
      function getLogLevelFromCustomLogLevel(customLogLevel2, useLevel2, res, err, req) {
        return customLogLevel2 ? getValidLogLevel(customLogLevel2(req, res, err), useLevel2) : useLevel2;
      }
      const customLogLevel = opts.customLogLevel;
      delete opts.customLogLevel;
      const theStream = opts.stream || stream;
      delete opts.stream;
      const autoLogging = opts.autoLogging !== false;
      const autoLoggingIgnore = opts.autoLogging && opts.autoLogging.ignore ? opts.autoLogging.ignore : null;
      delete opts.autoLogging;
      const onRequestReceivedObject = getFunctionOrDefault(opts.customReceivedObject, void 0);
      const receivedMessage = getFunctionOrDefault(opts.customReceivedMessage, void 0);
      const onRequestSuccessObject = getFunctionOrDefault(opts.customSuccessObject, defaultSuccessfulRequestObjectProvider);
      const successMessage = getFunctionOrDefault(opts.customSuccessMessage, defaultSuccessfulRequestMessageProvider);
      const onRequestErrorObject = getFunctionOrDefault(opts.customErrorObject, defaultFailedRequestObjectProvider);
      const errorMessage = getFunctionOrDefault(opts.customErrorMessage, defaultFailedRequestMessageProvider);
      delete opts.customSuccessfulMessage;
      delete opts.customErroredMessage;
      const quietReqLogger = !!opts.quietReqLogger;
      const quietResLogger = !!opts.quietResLogger;
      const logger2 = wrapChild(opts, theStream);
      const validLogLevels = Object.keys(logger2.levels.values).concat("silent");
      const useLevel = getValidLogLevel(opts.useLevel);
      delete opts.useLevel;
      const genReqId = reqIdGenFactory(opts.genReqId);
      const result = (req, res, next) => {
        return loggingMiddleware(logger2, req, res, next);
      };
      result.logger = logger2;
      return result;
      function onResFinished(res, logger3, err) {
        let log = logger3;
        const responseTime = Date.now() - res[startTime];
        const req = res[reqObject];
        const level = getLogLevelFromCustomLogLevel(customLogLevel, useLevel, res, err, req);
        if (level === "silent") {
          return;
        }
        const customPropBindings = typeof customProps === "function" ? customProps(req, res) : customProps;
        if (customPropBindings) {
          const customPropBindingStr = logger3[stringifySym](customPropBindings).replace(/[{}]/g, "");
          const customPropBindingsStr = logger3[chindingsSym];
          if (!customPropBindingsStr.includes(customPropBindingStr)) {
            log = logger3.child(customPropBindings);
          }
        }
        if (err || res.err || res.statusCode >= 500) {
          const error = err || res.err || new Error("failed with status code " + res.statusCode);
          log[level](
            onRequestErrorObject(req, res, error, {
              [resKey]: res,
              [errKey]: error,
              [responseTimeKey]: responseTime
            }),
            errorMessage(req, res, error, responseTime)
          );
          return;
        }
        log[level](
          onRequestSuccessObject(req, res, {
            [resKey]: res,
            [responseTimeKey]: responseTime
          }),
          successMessage(req, res, responseTime)
        );
      }
      function loggingMiddleware(logger3, req, res, next) {
        let shouldLogSuccess = true;
        req.id = req.id || genReqId(req, res);
        const log = quietReqLogger ? logger3.child({ [requestIdKey]: req.id }) : logger3;
        let fullReqLogger = log.child({ [reqKey]: req });
        const customPropBindings = typeof customProps === "function" ? customProps(req, res) : customProps;
        if (customPropBindings) {
          fullReqLogger = fullReqLogger.child(customPropBindings);
        }
        const responseLogger = quietResLogger ? log : fullReqLogger;
        const requestLogger = quietReqLogger ? log : fullReqLogger;
        if (!res.log) {
          res.log = responseLogger;
        }
        if (Array.isArray(res.allLogs) === false) {
          res.allLogs = [];
        }
        res.allLogs.push(responseLogger);
        if (!req.log) {
          req.log = requestLogger;
        }
        if (!req.allLogs) {
          req.allLogs = [];
        }
        req.allLogs.push(requestLogger);
        res[startTime] = res[startTime] || Date.now();
        res[reqObject] = req;
        const onResponseComplete = (err) => {
          res.removeListener("close", onResponseComplete);
          res.removeListener("finish", onResponseComplete);
          res.removeListener("error", onResponseComplete);
          return onResFinished(res, responseLogger, err);
        };
        if (autoLogging) {
          if (autoLoggingIgnore !== null && shouldLogSuccess === true) {
            const isIgnored = autoLoggingIgnore(req);
            shouldLogSuccess = !isIgnored;
          }
          if (shouldLogSuccess) {
            const shouldLogReceived = receivedMessage !== void 0 || onRequestReceivedObject !== void 0;
            if (shouldLogReceived) {
              const level = getLogLevelFromCustomLogLevel(customLogLevel, useLevel, res, void 0, req);
              const receivedObjectResult = onRequestReceivedObject !== void 0 ? onRequestReceivedObject(req, res, void 0) : {};
              const receivedStringResult = receivedMessage !== void 0 ? receivedMessage(req, res) : void 0;
              requestLogger[level](receivedObjectResult, receivedStringResult);
            }
            res.on("close", onResponseComplete);
            res.on("finish", onResponseComplete);
          }
          res.on("error", onResponseComplete);
        }
        if (next) {
          next();
        }
      }
    }
    function wrapChild(opts, stream) {
      const prevLogger = opts.logger;
      const prevGenReqId = opts.genReqId;
      let logger2 = null;
      if (prevLogger) {
        opts.logger = void 0;
        opts.genReqId = void 0;
        logger2 = prevLogger.child({}, opts);
        opts.logger = prevLogger;
        opts.genReqId = prevGenReqId;
      } else {
        if (opts.transport && !opts.transport.caller) {
          opts.transport.caller = getCallerFile();
        }
        logger2 = pino2(opts, stream);
      }
      return logger2;
    }
    function reqIdGenFactory(func) {
      if (typeof func === "function") return func;
      const maxInt = 2147483647;
      let nextReqId = 0;
      return function genReqId(req, res) {
        return req.id || (nextReqId = nextReqId + 1 & maxInt);
      };
    }
    function getFunctionOrDefault(value, defaultValue) {
      if (value && typeof value === "function") {
        return value;
      }
      return defaultValue;
    }
    function defaultSuccessfulRequestObjectProvider(req, res, successObject) {
      return successObject;
    }
    function defaultFailedRequestObjectProvider(req, res, error, errorObject) {
      return errorObject;
    }
    function defaultFailedRequestMessageProvider() {
      return "request errored";
    }
    function defaultSuccessfulRequestMessageProvider(req, res) {
      return !req.readableAborted && res.writableEnded ? "request completed" : "request aborted";
    }
    module.exports = pinoLogger;
    module.exports.stdSerializers = {
      err: serializers.err,
      req: serializers.req,
      res: serializers.res
    };
    module.exports.startTime = startTime;
    module.exports.default = pinoLogger;
    module.exports.pinoHttp = pinoLogger;
  }
});

// node_modules/.pnpm/bn.js@4.12.3/node_modules/bn.js/lib/bn.js
var require_bn = __commonJS({
  "node_modules/.pnpm/bn.js@4.12.3/node_modules/bn.js/lib/bn.js"(exports, module) {
    (function(module2, exports2) {
      "use strict";
      function assert(val, msg) {
        if (!val) throw new Error(msg || "Assertion failed");
      }
      function inherits(ctor, superCtor) {
        ctor.super_ = superCtor;
        var TempCtor = function() {
        };
        TempCtor.prototype = superCtor.prototype;
        ctor.prototype = new TempCtor();
        ctor.prototype.constructor = ctor;
      }
      function BN(number, base, endian) {
        if (BN.isBN(number)) {
          return number;
        }
        this.negative = 0;
        this.words = null;
        this.length = 0;
        this.red = null;
        if (number !== null) {
          if (base === "le" || base === "be") {
            endian = base;
            base = 10;
          }
          this._init(number || 0, base || 10, endian || "be");
        }
      }
      if (typeof module2 === "object") {
        module2.exports = BN;
      } else {
        exports2.BN = BN;
      }
      BN.BN = BN;
      BN.wordSize = 26;
      var Buffer2;
      try {
        if (typeof window !== "undefined" && typeof window.Buffer !== "undefined") {
          Buffer2 = window.Buffer;
        } else {
          Buffer2 = __require("buffer").Buffer;
        }
      } catch (e) {
      }
      BN.isBN = function isBN(num) {
        if (num instanceof BN) {
          return true;
        }
        return num !== null && typeof num === "object" && num.constructor.wordSize === BN.wordSize && Array.isArray(num.words);
      };
      BN.max = function max(left, right) {
        if (left.cmp(right) > 0) return left;
        return right;
      };
      BN.min = function min(left, right) {
        if (left.cmp(right) < 0) return left;
        return right;
      };
      BN.prototype._init = function init(number, base, endian) {
        if (typeof number === "number") {
          return this._initNumber(number, base, endian);
        }
        if (typeof number === "object") {
          return this._initArray(number, base, endian);
        }
        if (base === "hex") {
          base = 16;
        }
        assert(base === (base | 0) && base >= 2 && base <= 36);
        number = number.toString().replace(/\s+/g, "");
        var start = 0;
        if (number[0] === "-") {
          start++;
          this.negative = 1;
        }
        if (start < number.length) {
          if (base === 16) {
            this._parseHex(number, start, endian);
          } else {
            this._parseBase(number, base, start);
            if (endian === "le") {
              this._initArray(this.toArray(), base, endian);
            }
          }
        }
      };
      BN.prototype._initNumber = function _initNumber(number, base, endian) {
        if (number < 0) {
          this.negative = 1;
          number = -number;
        }
        if (number < 67108864) {
          this.words = [number & 67108863];
          this.length = 1;
        } else if (number < 4503599627370496) {
          this.words = [
            number & 67108863,
            number / 67108864 & 67108863
          ];
          this.length = 2;
        } else {
          assert(number < 9007199254740992);
          this.words = [
            number & 67108863,
            number / 67108864 & 67108863,
            1
          ];
          this.length = 3;
        }
        if (endian !== "le") return;
        this._initArray(this.toArray(), base, endian);
      };
      BN.prototype._initArray = function _initArray(number, base, endian) {
        assert(typeof number.length === "number");
        if (number.length <= 0) {
          this.words = [0];
          this.length = 1;
          return this;
        }
        this.length = Math.ceil(number.length / 3);
        this.words = new Array(this.length);
        for (var i = 0; i < this.length; i++) {
          this.words[i] = 0;
        }
        var j, w;
        var off = 0;
        if (endian === "be") {
          for (i = number.length - 1, j = 0; i >= 0; i -= 3) {
            w = number[i] | number[i - 1] << 8 | number[i - 2] << 16;
            this.words[j] |= w << off & 67108863;
            this.words[j + 1] = w >>> 26 - off & 67108863;
            off += 24;
            if (off >= 26) {
              off -= 26;
              j++;
            }
          }
        } else if (endian === "le") {
          for (i = 0, j = 0; i < number.length; i += 3) {
            w = number[i] | number[i + 1] << 8 | number[i + 2] << 16;
            this.words[j] |= w << off & 67108863;
            this.words[j + 1] = w >>> 26 - off & 67108863;
            off += 24;
            if (off >= 26) {
              off -= 26;
              j++;
            }
          }
        }
        return this.strip();
      };
      function parseHex4Bits(string, index) {
        var c = string.charCodeAt(index);
        if (c >= 65 && c <= 70) {
          return c - 55;
        } else if (c >= 97 && c <= 102) {
          return c - 87;
        } else {
          return c - 48 & 15;
        }
      }
      function parseHexByte(string, lowerBound, index) {
        var r = parseHex4Bits(string, index);
        if (index - 1 >= lowerBound) {
          r |= parseHex4Bits(string, index - 1) << 4;
        }
        return r;
      }
      BN.prototype._parseHex = function _parseHex(number, start, endian) {
        this.length = Math.ceil((number.length - start) / 6);
        this.words = new Array(this.length);
        for (var i = 0; i < this.length; i++) {
          this.words[i] = 0;
        }
        var off = 0;
        var j = 0;
        var w;
        if (endian === "be") {
          for (i = number.length - 1; i >= start; i -= 2) {
            w = parseHexByte(number, start, i) << off;
            this.words[j] |= w & 67108863;
            if (off >= 18) {
              off -= 18;
              j += 1;
              this.words[j] |= w >>> 26;
            } else {
              off += 8;
            }
          }
        } else {
          var parseLength = number.length - start;
          for (i = parseLength % 2 === 0 ? start + 1 : start; i < number.length; i += 2) {
            w = parseHexByte(number, start, i) << off;
            this.words[j] |= w & 67108863;
            if (off >= 18) {
              off -= 18;
              j += 1;
              this.words[j] |= w >>> 26;
            } else {
              off += 8;
            }
          }
        }
        this.strip();
      };
      function parseBase(str, start, end, mul) {
        var r = 0;
        var len = Math.min(str.length, end);
        for (var i = start; i < len; i++) {
          var c = str.charCodeAt(i) - 48;
          r *= mul;
          if (c >= 49) {
            r += c - 49 + 10;
          } else if (c >= 17) {
            r += c - 17 + 10;
          } else {
            r += c;
          }
        }
        return r;
      }
      BN.prototype._parseBase = function _parseBase(number, base, start) {
        this.words = [0];
        this.length = 1;
        for (var limbLen = 0, limbPow = 1; limbPow <= 67108863; limbPow *= base) {
          limbLen++;
        }
        limbLen--;
        limbPow = limbPow / base | 0;
        var total = number.length - start;
        var mod = total % limbLen;
        var end = Math.min(total, total - mod) + start;
        var word = 0;
        for (var i = start; i < end; i += limbLen) {
          word = parseBase(number, i, i + limbLen, base);
          this.imuln(limbPow);
          if (this.words[0] + word < 67108864) {
            this.words[0] += word;
          } else {
            this._iaddn(word);
          }
        }
        if (mod !== 0) {
          var pow = 1;
          word = parseBase(number, i, number.length, base);
          for (i = 0; i < mod; i++) {
            pow *= base;
          }
          this.imuln(pow);
          if (this.words[0] + word < 67108864) {
            this.words[0] += word;
          } else {
            this._iaddn(word);
          }
        }
        this.strip();
      };
      BN.prototype.copy = function copy(dest) {
        dest.words = new Array(this.length);
        for (var i = 0; i < this.length; i++) {
          dest.words[i] = this.words[i];
        }
        dest.length = this.length;
        dest.negative = this.negative;
        dest.red = this.red;
      };
      BN.prototype.clone = function clone() {
        var r = new BN(null);
        this.copy(r);
        return r;
      };
      BN.prototype._expand = function _expand(size) {
        while (this.length < size) {
          this.words[this.length++] = 0;
        }
        return this;
      };
      BN.prototype.strip = function strip() {
        while (this.length > 1 && this.words[this.length - 1] === 0) {
          this.length--;
        }
        return this._normSign();
      };
      BN.prototype._normSign = function _normSign() {
        if (this.length === 1 && this.words[0] === 0) {
          this.negative = 0;
        }
        return this;
      };
      BN.prototype.inspect = function inspect() {
        return (this.red ? "<BN-R: " : "<BN: ") + this.toString(16) + ">";
      };
      var zeros = [
        "",
        "0",
        "00",
        "000",
        "0000",
        "00000",
        "000000",
        "0000000",
        "00000000",
        "000000000",
        "0000000000",
        "00000000000",
        "000000000000",
        "0000000000000",
        "00000000000000",
        "000000000000000",
        "0000000000000000",
        "00000000000000000",
        "000000000000000000",
        "0000000000000000000",
        "00000000000000000000",
        "000000000000000000000",
        "0000000000000000000000",
        "00000000000000000000000",
        "000000000000000000000000",
        "0000000000000000000000000"
      ];
      var groupSizes = [
        0,
        0,
        25,
        16,
        12,
        11,
        10,
        9,
        8,
        8,
        7,
        7,
        7,
        7,
        6,
        6,
        6,
        6,
        6,
        6,
        6,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5
      ];
      var groupBases = [
        0,
        0,
        33554432,
        43046721,
        16777216,
        48828125,
        60466176,
        40353607,
        16777216,
        43046721,
        1e7,
        19487171,
        35831808,
        62748517,
        7529536,
        11390625,
        16777216,
        24137569,
        34012224,
        47045881,
        64e6,
        4084101,
        5153632,
        6436343,
        7962624,
        9765625,
        11881376,
        14348907,
        17210368,
        20511149,
        243e5,
        28629151,
        33554432,
        39135393,
        45435424,
        52521875,
        60466176
      ];
      BN.prototype.toString = function toString(base, padding) {
        base = base || 10;
        padding = padding | 0 || 1;
        var out;
        if (base === 16 || base === "hex") {
          out = "";
          var off = 0;
          var carry = 0;
          for (var i = 0; i < this.length; i++) {
            var w = this.words[i];
            var word = ((w << off | carry) & 16777215).toString(16);
            carry = w >>> 24 - off & 16777215;
            off += 2;
            if (off >= 26) {
              off -= 26;
              i--;
            }
            if (carry !== 0 || i !== this.length - 1) {
              out = zeros[6 - word.length] + word + out;
            } else {
              out = word + out;
            }
          }
          if (carry !== 0) {
            out = carry.toString(16) + out;
          }
          while (out.length % padding !== 0) {
            out = "0" + out;
          }
          if (this.negative !== 0) {
            out = "-" + out;
          }
          return out;
        }
        if (base === (base | 0) && base >= 2 && base <= 36) {
          var groupSize = groupSizes[base];
          var groupBase = groupBases[base];
          out = "";
          var c = this.clone();
          c.negative = 0;
          while (!c.isZero()) {
            var r = c.modn(groupBase).toString(base);
            c = c.idivn(groupBase);
            if (!c.isZero()) {
              out = zeros[groupSize - r.length] + r + out;
            } else {
              out = r + out;
            }
          }
          if (this.isZero()) {
            out = "0" + out;
          }
          while (out.length % padding !== 0) {
            out = "0" + out;
          }
          if (this.negative !== 0) {
            out = "-" + out;
          }
          return out;
        }
        assert(false, "Base should be between 2 and 36");
      };
      BN.prototype.toNumber = function toNumber() {
        var ret = this.words[0];
        if (this.length === 2) {
          ret += this.words[1] * 67108864;
        } else if (this.length === 3 && this.words[2] === 1) {
          ret += 4503599627370496 + this.words[1] * 67108864;
        } else if (this.length > 2) {
          assert(false, "Number can only safely store up to 53 bits");
        }
        return this.negative !== 0 ? -ret : ret;
      };
      BN.prototype.toJSON = function toJSON() {
        return this.toString(16);
      };
      BN.prototype.toBuffer = function toBuffer(endian, length) {
        assert(typeof Buffer2 !== "undefined");
        return this.toArrayLike(Buffer2, endian, length);
      };
      BN.prototype.toArray = function toArray2(endian, length) {
        return this.toArrayLike(Array, endian, length);
      };
      BN.prototype.toArrayLike = function toArrayLike(ArrayType, endian, length) {
        var byteLength = this.byteLength();
        var reqLength = length || Math.max(1, byteLength);
        assert(byteLength <= reqLength, "byte array longer than desired length");
        assert(reqLength > 0, "Requested array length <= 0");
        this.strip();
        var littleEndian = endian === "le";
        var res = new ArrayType(reqLength);
        var b, i;
        var q = this.clone();
        if (!littleEndian) {
          for (i = 0; i < reqLength - byteLength; i++) {
            res[i] = 0;
          }
          for (i = 0; !q.isZero(); i++) {
            b = q.andln(255);
            q.iushrn(8);
            res[reqLength - i - 1] = b;
          }
        } else {
          for (i = 0; !q.isZero(); i++) {
            b = q.andln(255);
            q.iushrn(8);
            res[i] = b;
          }
          for (; i < reqLength; i++) {
            res[i] = 0;
          }
        }
        return res;
      };
      if (Math.clz32) {
        BN.prototype._countBits = function _countBits(w) {
          return 32 - Math.clz32(w);
        };
      } else {
        BN.prototype._countBits = function _countBits(w) {
          var t = w;
          var r = 0;
          if (t >= 4096) {
            r += 13;
            t >>>= 13;
          }
          if (t >= 64) {
            r += 7;
            t >>>= 7;
          }
          if (t >= 8) {
            r += 4;
            t >>>= 4;
          }
          if (t >= 2) {
            r += 2;
            t >>>= 2;
          }
          return r + t;
        };
      }
      BN.prototype._zeroBits = function _zeroBits(w) {
        if (w === 0) return 26;
        var t = w;
        var r = 0;
        if ((t & 8191) === 0) {
          r += 13;
          t >>>= 13;
        }
        if ((t & 127) === 0) {
          r += 7;
          t >>>= 7;
        }
        if ((t & 15) === 0) {
          r += 4;
          t >>>= 4;
        }
        if ((t & 3) === 0) {
          r += 2;
          t >>>= 2;
        }
        if ((t & 1) === 0) {
          r++;
        }
        return r;
      };
      BN.prototype.bitLength = function bitLength() {
        var w = this.words[this.length - 1];
        var hi = this._countBits(w);
        return (this.length - 1) * 26 + hi;
      };
      function toBitArray(num) {
        var w = new Array(num.bitLength());
        for (var bit = 0; bit < w.length; bit++) {
          var off = bit / 26 | 0;
          var wbit = bit % 26;
          w[bit] = (num.words[off] & 1 << wbit) >>> wbit;
        }
        return w;
      }
      BN.prototype.zeroBits = function zeroBits() {
        if (this.isZero()) return 0;
        var r = 0;
        for (var i = 0; i < this.length; i++) {
          var b = this._zeroBits(this.words[i]);
          r += b;
          if (b !== 26) break;
        }
        return r;
      };
      BN.prototype.byteLength = function byteLength() {
        return Math.ceil(this.bitLength() / 8);
      };
      BN.prototype.toTwos = function toTwos(width) {
        if (this.negative !== 0) {
          return this.abs().inotn(width).iaddn(1);
        }
        return this.clone();
      };
      BN.prototype.fromTwos = function fromTwos(width) {
        if (this.testn(width - 1)) {
          return this.notn(width).iaddn(1).ineg();
        }
        return this.clone();
      };
      BN.prototype.isNeg = function isNeg() {
        return this.negative !== 0;
      };
      BN.prototype.neg = function neg() {
        return this.clone().ineg();
      };
      BN.prototype.ineg = function ineg() {
        if (!this.isZero()) {
          this.negative ^= 1;
        }
        return this;
      };
      BN.prototype.iuor = function iuor(num) {
        while (this.length < num.length) {
          this.words[this.length++] = 0;
        }
        for (var i = 0; i < num.length; i++) {
          this.words[i] = this.words[i] | num.words[i];
        }
        return this.strip();
      };
      BN.prototype.ior = function ior(num) {
        assert((this.negative | num.negative) === 0);
        return this.iuor(num);
      };
      BN.prototype.or = function or2(num) {
        if (this.length > num.length) return this.clone().ior(num);
        return num.clone().ior(this);
      };
      BN.prototype.uor = function uor(num) {
        if (this.length > num.length) return this.clone().iuor(num);
        return num.clone().iuor(this);
      };
      BN.prototype.iuand = function iuand(num) {
        var b;
        if (this.length > num.length) {
          b = num;
        } else {
          b = this;
        }
        for (var i = 0; i < b.length; i++) {
          this.words[i] = this.words[i] & num.words[i];
        }
        this.length = b.length;
        return this.strip();
      };
      BN.prototype.iand = function iand(num) {
        assert((this.negative | num.negative) === 0);
        return this.iuand(num);
      };
      BN.prototype.and = function and2(num) {
        if (this.length > num.length) return this.clone().iand(num);
        return num.clone().iand(this);
      };
      BN.prototype.uand = function uand(num) {
        if (this.length > num.length) return this.clone().iuand(num);
        return num.clone().iuand(this);
      };
      BN.prototype.iuxor = function iuxor(num) {
        var a;
        var b;
        if (this.length > num.length) {
          a = this;
          b = num;
        } else {
          a = num;
          b = this;
        }
        for (var i = 0; i < b.length; i++) {
          this.words[i] = a.words[i] ^ b.words[i];
        }
        if (this !== a) {
          for (; i < a.length; i++) {
            this.words[i] = a.words[i];
          }
        }
        this.length = a.length;
        return this.strip();
      };
      BN.prototype.ixor = function ixor(num) {
        assert((this.negative | num.negative) === 0);
        return this.iuxor(num);
      };
      BN.prototype.xor = function xor(num) {
        if (this.length > num.length) return this.clone().ixor(num);
        return num.clone().ixor(this);
      };
      BN.prototype.uxor = function uxor(num) {
        if (this.length > num.length) return this.clone().iuxor(num);
        return num.clone().iuxor(this);
      };
      BN.prototype.inotn = function inotn(width) {
        assert(typeof width === "number" && width >= 0);
        var bytesNeeded = Math.ceil(width / 26) | 0;
        var bitsLeft = width % 26;
        this._expand(bytesNeeded);
        if (bitsLeft > 0) {
          bytesNeeded--;
        }
        for (var i = 0; i < bytesNeeded; i++) {
          this.words[i] = ~this.words[i] & 67108863;
        }
        if (bitsLeft > 0) {
          this.words[i] = ~this.words[i] & 67108863 >> 26 - bitsLeft;
        }
        return this.strip();
      };
      BN.prototype.notn = function notn(width) {
        return this.clone().inotn(width);
      };
      BN.prototype.setn = function setn(bit, val) {
        assert(typeof bit === "number" && bit >= 0);
        var off = bit / 26 | 0;
        var wbit = bit % 26;
        this._expand(off + 1);
        if (val) {
          this.words[off] = this.words[off] | 1 << wbit;
        } else {
          this.words[off] = this.words[off] & ~(1 << wbit);
        }
        return this.strip();
      };
      BN.prototype.iadd = function iadd(num) {
        var r;
        if (this.negative !== 0 && num.negative === 0) {
          this.negative = 0;
          r = this.isub(num);
          this.negative ^= 1;
          return this._normSign();
        } else if (this.negative === 0 && num.negative !== 0) {
          num.negative = 0;
          r = this.isub(num);
          num.negative = 1;
          return r._normSign();
        }
        var a, b;
        if (this.length > num.length) {
          a = this;
          b = num;
        } else {
          a = num;
          b = this;
        }
        var carry = 0;
        for (var i = 0; i < b.length; i++) {
          r = (a.words[i] | 0) + (b.words[i] | 0) + carry;
          this.words[i] = r & 67108863;
          carry = r >>> 26;
        }
        for (; carry !== 0 && i < a.length; i++) {
          r = (a.words[i] | 0) + carry;
          this.words[i] = r & 67108863;
          carry = r >>> 26;
        }
        this.length = a.length;
        if (carry !== 0) {
          this.words[this.length] = carry;
          this.length++;
        } else if (a !== this) {
          for (; i < a.length; i++) {
            this.words[i] = a.words[i];
          }
        }
        return this;
      };
      BN.prototype.add = function add(num) {
        var res;
        if (num.negative !== 0 && this.negative === 0) {
          num.negative = 0;
          res = this.sub(num);
          num.negative ^= 1;
          return res;
        } else if (num.negative === 0 && this.negative !== 0) {
          this.negative = 0;
          res = num.sub(this);
          this.negative = 1;
          return res;
        }
        if (this.length > num.length) return this.clone().iadd(num);
        return num.clone().iadd(this);
      };
      BN.prototype.isub = function isub(num) {
        if (num.negative !== 0) {
          num.negative = 0;
          var r = this.iadd(num);
          num.negative = 1;
          return r._normSign();
        } else if (this.negative !== 0) {
          this.negative = 0;
          this.iadd(num);
          this.negative = 1;
          return this._normSign();
        }
        var cmp = this.cmp(num);
        if (cmp === 0) {
          this.negative = 0;
          this.length = 1;
          this.words[0] = 0;
          return this;
        }
        var a, b;
        if (cmp > 0) {
          a = this;
          b = num;
        } else {
          a = num;
          b = this;
        }
        var carry = 0;
        for (var i = 0; i < b.length; i++) {
          r = (a.words[i] | 0) - (b.words[i] | 0) + carry;
          carry = r >> 26;
          this.words[i] = r & 67108863;
        }
        for (; carry !== 0 && i < a.length; i++) {
          r = (a.words[i] | 0) + carry;
          carry = r >> 26;
          this.words[i] = r & 67108863;
        }
        if (carry === 0 && i < a.length && a !== this) {
          for (; i < a.length; i++) {
            this.words[i] = a.words[i];
          }
        }
        this.length = Math.max(this.length, i);
        if (a !== this) {
          this.negative = 1;
        }
        return this.strip();
      };
      BN.prototype.sub = function sub(num) {
        return this.clone().isub(num);
      };
      function smallMulTo(self, num, out) {
        out.negative = num.negative ^ self.negative;
        var len = self.length + num.length | 0;
        out.length = len;
        len = len - 1 | 0;
        var a = self.words[0] | 0;
        var b = num.words[0] | 0;
        var r = a * b;
        var lo = r & 67108863;
        var carry = r / 67108864 | 0;
        out.words[0] = lo;
        for (var k = 1; k < len; k++) {
          var ncarry = carry >>> 26;
          var rword = carry & 67108863;
          var maxJ = Math.min(k, num.length - 1);
          for (var j = Math.max(0, k - self.length + 1); j <= maxJ; j++) {
            var i = k - j | 0;
            a = self.words[i] | 0;
            b = num.words[j] | 0;
            r = a * b + rword;
            ncarry += r / 67108864 | 0;
            rword = r & 67108863;
          }
          out.words[k] = rword | 0;
          carry = ncarry | 0;
        }
        if (carry !== 0) {
          out.words[k] = carry | 0;
        } else {
          out.length--;
        }
        return out.strip();
      }
      var comb10MulTo = function comb10MulTo2(self, num, out) {
        var a = self.words;
        var b = num.words;
        var o = out.words;
        var c = 0;
        var lo;
        var mid;
        var hi;
        var a0 = a[0] | 0;
        var al0 = a0 & 8191;
        var ah0 = a0 >>> 13;
        var a1 = a[1] | 0;
        var al1 = a1 & 8191;
        var ah1 = a1 >>> 13;
        var a2 = a[2] | 0;
        var al2 = a2 & 8191;
        var ah2 = a2 >>> 13;
        var a3 = a[3] | 0;
        var al3 = a3 & 8191;
        var ah3 = a3 >>> 13;
        var a4 = a[4] | 0;
        var al4 = a4 & 8191;
        var ah4 = a4 >>> 13;
        var a5 = a[5] | 0;
        var al5 = a5 & 8191;
        var ah5 = a5 >>> 13;
        var a6 = a[6] | 0;
        var al6 = a6 & 8191;
        var ah6 = a6 >>> 13;
        var a7 = a[7] | 0;
        var al7 = a7 & 8191;
        var ah7 = a7 >>> 13;
        var a8 = a[8] | 0;
        var al8 = a8 & 8191;
        var ah8 = a8 >>> 13;
        var a9 = a[9] | 0;
        var al9 = a9 & 8191;
        var ah9 = a9 >>> 13;
        var b0 = b[0] | 0;
        var bl0 = b0 & 8191;
        var bh0 = b0 >>> 13;
        var b1 = b[1] | 0;
        var bl1 = b1 & 8191;
        var bh1 = b1 >>> 13;
        var b2 = b[2] | 0;
        var bl2 = b2 & 8191;
        var bh2 = b2 >>> 13;
        var b3 = b[3] | 0;
        var bl3 = b3 & 8191;
        var bh3 = b3 >>> 13;
        var b4 = b[4] | 0;
        var bl4 = b4 & 8191;
        var bh4 = b4 >>> 13;
        var b5 = b[5] | 0;
        var bl5 = b5 & 8191;
        var bh5 = b5 >>> 13;
        var b6 = b[6] | 0;
        var bl6 = b6 & 8191;
        var bh6 = b6 >>> 13;
        var b7 = b[7] | 0;
        var bl7 = b7 & 8191;
        var bh7 = b7 >>> 13;
        var b8 = b[8] | 0;
        var bl8 = b8 & 8191;
        var bh8 = b8 >>> 13;
        var b9 = b[9] | 0;
        var bl9 = b9 & 8191;
        var bh9 = b9 >>> 13;
        out.negative = self.negative ^ num.negative;
        out.length = 19;
        lo = Math.imul(al0, bl0);
        mid = Math.imul(al0, bh0);
        mid = mid + Math.imul(ah0, bl0) | 0;
        hi = Math.imul(ah0, bh0);
        var w0 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w0 >>> 26) | 0;
        w0 &= 67108863;
        lo = Math.imul(al1, bl0);
        mid = Math.imul(al1, bh0);
        mid = mid + Math.imul(ah1, bl0) | 0;
        hi = Math.imul(ah1, bh0);
        lo = lo + Math.imul(al0, bl1) | 0;
        mid = mid + Math.imul(al0, bh1) | 0;
        mid = mid + Math.imul(ah0, bl1) | 0;
        hi = hi + Math.imul(ah0, bh1) | 0;
        var w1 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w1 >>> 26) | 0;
        w1 &= 67108863;
        lo = Math.imul(al2, bl0);
        mid = Math.imul(al2, bh0);
        mid = mid + Math.imul(ah2, bl0) | 0;
        hi = Math.imul(ah2, bh0);
        lo = lo + Math.imul(al1, bl1) | 0;
        mid = mid + Math.imul(al1, bh1) | 0;
        mid = mid + Math.imul(ah1, bl1) | 0;
        hi = hi + Math.imul(ah1, bh1) | 0;
        lo = lo + Math.imul(al0, bl2) | 0;
        mid = mid + Math.imul(al0, bh2) | 0;
        mid = mid + Math.imul(ah0, bl2) | 0;
        hi = hi + Math.imul(ah0, bh2) | 0;
        var w2 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w2 >>> 26) | 0;
        w2 &= 67108863;
        lo = Math.imul(al3, bl0);
        mid = Math.imul(al3, bh0);
        mid = mid + Math.imul(ah3, bl0) | 0;
        hi = Math.imul(ah3, bh0);
        lo = lo + Math.imul(al2, bl1) | 0;
        mid = mid + Math.imul(al2, bh1) | 0;
        mid = mid + Math.imul(ah2, bl1) | 0;
        hi = hi + Math.imul(ah2, bh1) | 0;
        lo = lo + Math.imul(al1, bl2) | 0;
        mid = mid + Math.imul(al1, bh2) | 0;
        mid = mid + Math.imul(ah1, bl2) | 0;
        hi = hi + Math.imul(ah1, bh2) | 0;
        lo = lo + Math.imul(al0, bl3) | 0;
        mid = mid + Math.imul(al0, bh3) | 0;
        mid = mid + Math.imul(ah0, bl3) | 0;
        hi = hi + Math.imul(ah0, bh3) | 0;
        var w3 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w3 >>> 26) | 0;
        w3 &= 67108863;
        lo = Math.imul(al4, bl0);
        mid = Math.imul(al4, bh0);
        mid = mid + Math.imul(ah4, bl0) | 0;
        hi = Math.imul(ah4, bh0);
        lo = lo + Math.imul(al3, bl1) | 0;
        mid = mid + Math.imul(al3, bh1) | 0;
        mid = mid + Math.imul(ah3, bl1) | 0;
        hi = hi + Math.imul(ah3, bh1) | 0;
        lo = lo + Math.imul(al2, bl2) | 0;
        mid = mid + Math.imul(al2, bh2) | 0;
        mid = mid + Math.imul(ah2, bl2) | 0;
        hi = hi + Math.imul(ah2, bh2) | 0;
        lo = lo + Math.imul(al1, bl3) | 0;
        mid = mid + Math.imul(al1, bh3) | 0;
        mid = mid + Math.imul(ah1, bl3) | 0;
        hi = hi + Math.imul(ah1, bh3) | 0;
        lo = lo + Math.imul(al0, bl4) | 0;
        mid = mid + Math.imul(al0, bh4) | 0;
        mid = mid + Math.imul(ah0, bl4) | 0;
        hi = hi + Math.imul(ah0, bh4) | 0;
        var w4 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w4 >>> 26) | 0;
        w4 &= 67108863;
        lo = Math.imul(al5, bl0);
        mid = Math.imul(al5, bh0);
        mid = mid + Math.imul(ah5, bl0) | 0;
        hi = Math.imul(ah5, bh0);
        lo = lo + Math.imul(al4, bl1) | 0;
        mid = mid + Math.imul(al4, bh1) | 0;
        mid = mid + Math.imul(ah4, bl1) | 0;
        hi = hi + Math.imul(ah4, bh1) | 0;
        lo = lo + Math.imul(al3, bl2) | 0;
        mid = mid + Math.imul(al3, bh2) | 0;
        mid = mid + Math.imul(ah3, bl2) | 0;
        hi = hi + Math.imul(ah3, bh2) | 0;
        lo = lo + Math.imul(al2, bl3) | 0;
        mid = mid + Math.imul(al2, bh3) | 0;
        mid = mid + Math.imul(ah2, bl3) | 0;
        hi = hi + Math.imul(ah2, bh3) | 0;
        lo = lo + Math.imul(al1, bl4) | 0;
        mid = mid + Math.imul(al1, bh4) | 0;
        mid = mid + Math.imul(ah1, bl4) | 0;
        hi = hi + Math.imul(ah1, bh4) | 0;
        lo = lo + Math.imul(al0, bl5) | 0;
        mid = mid + Math.imul(al0, bh5) | 0;
        mid = mid + Math.imul(ah0, bl5) | 0;
        hi = hi + Math.imul(ah0, bh5) | 0;
        var w5 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w5 >>> 26) | 0;
        w5 &= 67108863;
        lo = Math.imul(al6, bl0);
        mid = Math.imul(al6, bh0);
        mid = mid + Math.imul(ah6, bl0) | 0;
        hi = Math.imul(ah6, bh0);
        lo = lo + Math.imul(al5, bl1) | 0;
        mid = mid + Math.imul(al5, bh1) | 0;
        mid = mid + Math.imul(ah5, bl1) | 0;
        hi = hi + Math.imul(ah5, bh1) | 0;
        lo = lo + Math.imul(al4, bl2) | 0;
        mid = mid + Math.imul(al4, bh2) | 0;
        mid = mid + Math.imul(ah4, bl2) | 0;
        hi = hi + Math.imul(ah4, bh2) | 0;
        lo = lo + Math.imul(al3, bl3) | 0;
        mid = mid + Math.imul(al3, bh3) | 0;
        mid = mid + Math.imul(ah3, bl3) | 0;
        hi = hi + Math.imul(ah3, bh3) | 0;
        lo = lo + Math.imul(al2, bl4) | 0;
        mid = mid + Math.imul(al2, bh4) | 0;
        mid = mid + Math.imul(ah2, bl4) | 0;
        hi = hi + Math.imul(ah2, bh4) | 0;
        lo = lo + Math.imul(al1, bl5) | 0;
        mid = mid + Math.imul(al1, bh5) | 0;
        mid = mid + Math.imul(ah1, bl5) | 0;
        hi = hi + Math.imul(ah1, bh5) | 0;
        lo = lo + Math.imul(al0, bl6) | 0;
        mid = mid + Math.imul(al0, bh6) | 0;
        mid = mid + Math.imul(ah0, bl6) | 0;
        hi = hi + Math.imul(ah0, bh6) | 0;
        var w6 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w6 >>> 26) | 0;
        w6 &= 67108863;
        lo = Math.imul(al7, bl0);
        mid = Math.imul(al7, bh0);
        mid = mid + Math.imul(ah7, bl0) | 0;
        hi = Math.imul(ah7, bh0);
        lo = lo + Math.imul(al6, bl1) | 0;
        mid = mid + Math.imul(al6, bh1) | 0;
        mid = mid + Math.imul(ah6, bl1) | 0;
        hi = hi + Math.imul(ah6, bh1) | 0;
        lo = lo + Math.imul(al5, bl2) | 0;
        mid = mid + Math.imul(al5, bh2) | 0;
        mid = mid + Math.imul(ah5, bl2) | 0;
        hi = hi + Math.imul(ah5, bh2) | 0;
        lo = lo + Math.imul(al4, bl3) | 0;
        mid = mid + Math.imul(al4, bh3) | 0;
        mid = mid + Math.imul(ah4, bl3) | 0;
        hi = hi + Math.imul(ah4, bh3) | 0;
        lo = lo + Math.imul(al3, bl4) | 0;
        mid = mid + Math.imul(al3, bh4) | 0;
        mid = mid + Math.imul(ah3, bl4) | 0;
        hi = hi + Math.imul(ah3, bh4) | 0;
        lo = lo + Math.imul(al2, bl5) | 0;
        mid = mid + Math.imul(al2, bh5) | 0;
        mid = mid + Math.imul(ah2, bl5) | 0;
        hi = hi + Math.imul(ah2, bh5) | 0;
        lo = lo + Math.imul(al1, bl6) | 0;
        mid = mid + Math.imul(al1, bh6) | 0;
        mid = mid + Math.imul(ah1, bl6) | 0;
        hi = hi + Math.imul(ah1, bh6) | 0;
        lo = lo + Math.imul(al0, bl7) | 0;
        mid = mid + Math.imul(al0, bh7) | 0;
        mid = mid + Math.imul(ah0, bl7) | 0;
        hi = hi + Math.imul(ah0, bh7) | 0;
        var w7 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w7 >>> 26) | 0;
        w7 &= 67108863;
        lo = Math.imul(al8, bl0);
        mid = Math.imul(al8, bh0);
        mid = mid + Math.imul(ah8, bl0) | 0;
        hi = Math.imul(ah8, bh0);
        lo = lo + Math.imul(al7, bl1) | 0;
        mid = mid + Math.imul(al7, bh1) | 0;
        mid = mid + Math.imul(ah7, bl1) | 0;
        hi = hi + Math.imul(ah7, bh1) | 0;
        lo = lo + Math.imul(al6, bl2) | 0;
        mid = mid + Math.imul(al6, bh2) | 0;
        mid = mid + Math.imul(ah6, bl2) | 0;
        hi = hi + Math.imul(ah6, bh2) | 0;
        lo = lo + Math.imul(al5, bl3) | 0;
        mid = mid + Math.imul(al5, bh3) | 0;
        mid = mid + Math.imul(ah5, bl3) | 0;
        hi = hi + Math.imul(ah5, bh3) | 0;
        lo = lo + Math.imul(al4, bl4) | 0;
        mid = mid + Math.imul(al4, bh4) | 0;
        mid = mid + Math.imul(ah4, bl4) | 0;
        hi = hi + Math.imul(ah4, bh4) | 0;
        lo = lo + Math.imul(al3, bl5) | 0;
        mid = mid + Math.imul(al3, bh5) | 0;
        mid = mid + Math.imul(ah3, bl5) | 0;
        hi = hi + Math.imul(ah3, bh5) | 0;
        lo = lo + Math.imul(al2, bl6) | 0;
        mid = mid + Math.imul(al2, bh6) | 0;
        mid = mid + Math.imul(ah2, bl6) | 0;
        hi = hi + Math.imul(ah2, bh6) | 0;
        lo = lo + Math.imul(al1, bl7) | 0;
        mid = mid + Math.imul(al1, bh7) | 0;
        mid = mid + Math.imul(ah1, bl7) | 0;
        hi = hi + Math.imul(ah1, bh7) | 0;
        lo = lo + Math.imul(al0, bl8) | 0;
        mid = mid + Math.imul(al0, bh8) | 0;
        mid = mid + Math.imul(ah0, bl8) | 0;
        hi = hi + Math.imul(ah0, bh8) | 0;
        var w8 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w8 >>> 26) | 0;
        w8 &= 67108863;
        lo = Math.imul(al9, bl0);
        mid = Math.imul(al9, bh0);
        mid = mid + Math.imul(ah9, bl0) | 0;
        hi = Math.imul(ah9, bh0);
        lo = lo + Math.imul(al8, bl1) | 0;
        mid = mid + Math.imul(al8, bh1) | 0;
        mid = mid + Math.imul(ah8, bl1) | 0;
        hi = hi + Math.imul(ah8, bh1) | 0;
        lo = lo + Math.imul(al7, bl2) | 0;
        mid = mid + Math.imul(al7, bh2) | 0;
        mid = mid + Math.imul(ah7, bl2) | 0;
        hi = hi + Math.imul(ah7, bh2) | 0;
        lo = lo + Math.imul(al6, bl3) | 0;
        mid = mid + Math.imul(al6, bh3) | 0;
        mid = mid + Math.imul(ah6, bl3) | 0;
        hi = hi + Math.imul(ah6, bh3) | 0;
        lo = lo + Math.imul(al5, bl4) | 0;
        mid = mid + Math.imul(al5, bh4) | 0;
        mid = mid + Math.imul(ah5, bl4) | 0;
        hi = hi + Math.imul(ah5, bh4) | 0;
        lo = lo + Math.imul(al4, bl5) | 0;
        mid = mid + Math.imul(al4, bh5) | 0;
        mid = mid + Math.imul(ah4, bl5) | 0;
        hi = hi + Math.imul(ah4, bh5) | 0;
        lo = lo + Math.imul(al3, bl6) | 0;
        mid = mid + Math.imul(al3, bh6) | 0;
        mid = mid + Math.imul(ah3, bl6) | 0;
        hi = hi + Math.imul(ah3, bh6) | 0;
        lo = lo + Math.imul(al2, bl7) | 0;
        mid = mid + Math.imul(al2, bh7) | 0;
        mid = mid + Math.imul(ah2, bl7) | 0;
        hi = hi + Math.imul(ah2, bh7) | 0;
        lo = lo + Math.imul(al1, bl8) | 0;
        mid = mid + Math.imul(al1, bh8) | 0;
        mid = mid + Math.imul(ah1, bl8) | 0;
        hi = hi + Math.imul(ah1, bh8) | 0;
        lo = lo + Math.imul(al0, bl9) | 0;
        mid = mid + Math.imul(al0, bh9) | 0;
        mid = mid + Math.imul(ah0, bl9) | 0;
        hi = hi + Math.imul(ah0, bh9) | 0;
        var w9 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w9 >>> 26) | 0;
        w9 &= 67108863;
        lo = Math.imul(al9, bl1);
        mid = Math.imul(al9, bh1);
        mid = mid + Math.imul(ah9, bl1) | 0;
        hi = Math.imul(ah9, bh1);
        lo = lo + Math.imul(al8, bl2) | 0;
        mid = mid + Math.imul(al8, bh2) | 0;
        mid = mid + Math.imul(ah8, bl2) | 0;
        hi = hi + Math.imul(ah8, bh2) | 0;
        lo = lo + Math.imul(al7, bl3) | 0;
        mid = mid + Math.imul(al7, bh3) | 0;
        mid = mid + Math.imul(ah7, bl3) | 0;
        hi = hi + Math.imul(ah7, bh3) | 0;
        lo = lo + Math.imul(al6, bl4) | 0;
        mid = mid + Math.imul(al6, bh4) | 0;
        mid = mid + Math.imul(ah6, bl4) | 0;
        hi = hi + Math.imul(ah6, bh4) | 0;
        lo = lo + Math.imul(al5, bl5) | 0;
        mid = mid + Math.imul(al5, bh5) | 0;
        mid = mid + Math.imul(ah5, bl5) | 0;
        hi = hi + Math.imul(ah5, bh5) | 0;
        lo = lo + Math.imul(al4, bl6) | 0;
        mid = mid + Math.imul(al4, bh6) | 0;
        mid = mid + Math.imul(ah4, bl6) | 0;
        hi = hi + Math.imul(ah4, bh6) | 0;
        lo = lo + Math.imul(al3, bl7) | 0;
        mid = mid + Math.imul(al3, bh7) | 0;
        mid = mid + Math.imul(ah3, bl7) | 0;
        hi = hi + Math.imul(ah3, bh7) | 0;
        lo = lo + Math.imul(al2, bl8) | 0;
        mid = mid + Math.imul(al2, bh8) | 0;
        mid = mid + Math.imul(ah2, bl8) | 0;
        hi = hi + Math.imul(ah2, bh8) | 0;
        lo = lo + Math.imul(al1, bl9) | 0;
        mid = mid + Math.imul(al1, bh9) | 0;
        mid = mid + Math.imul(ah1, bl9) | 0;
        hi = hi + Math.imul(ah1, bh9) | 0;
        var w10 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w10 >>> 26) | 0;
        w10 &= 67108863;
        lo = Math.imul(al9, bl2);
        mid = Math.imul(al9, bh2);
        mid = mid + Math.imul(ah9, bl2) | 0;
        hi = Math.imul(ah9, bh2);
        lo = lo + Math.imul(al8, bl3) | 0;
        mid = mid + Math.imul(al8, bh3) | 0;
        mid = mid + Math.imul(ah8, bl3) | 0;
        hi = hi + Math.imul(ah8, bh3) | 0;
        lo = lo + Math.imul(al7, bl4) | 0;
        mid = mid + Math.imul(al7, bh4) | 0;
        mid = mid + Math.imul(ah7, bl4) | 0;
        hi = hi + Math.imul(ah7, bh4) | 0;
        lo = lo + Math.imul(al6, bl5) | 0;
        mid = mid + Math.imul(al6, bh5) | 0;
        mid = mid + Math.imul(ah6, bl5) | 0;
        hi = hi + Math.imul(ah6, bh5) | 0;
        lo = lo + Math.imul(al5, bl6) | 0;
        mid = mid + Math.imul(al5, bh6) | 0;
        mid = mid + Math.imul(ah5, bl6) | 0;
        hi = hi + Math.imul(ah5, bh6) | 0;
        lo = lo + Math.imul(al4, bl7) | 0;
        mid = mid + Math.imul(al4, bh7) | 0;
        mid = mid + Math.imul(ah4, bl7) | 0;
        hi = hi + Math.imul(ah4, bh7) | 0;
        lo = lo + Math.imul(al3, bl8) | 0;
        mid = mid + Math.imul(al3, bh8) | 0;
        mid = mid + Math.imul(ah3, bl8) | 0;
        hi = hi + Math.imul(ah3, bh8) | 0;
        lo = lo + Math.imul(al2, bl9) | 0;
        mid = mid + Math.imul(al2, bh9) | 0;
        mid = mid + Math.imul(ah2, bl9) | 0;
        hi = hi + Math.imul(ah2, bh9) | 0;
        var w11 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w11 >>> 26) | 0;
        w11 &= 67108863;
        lo = Math.imul(al9, bl3);
        mid = Math.imul(al9, bh3);
        mid = mid + Math.imul(ah9, bl3) | 0;
        hi = Math.imul(ah9, bh3);
        lo = lo + Math.imul(al8, bl4) | 0;
        mid = mid + Math.imul(al8, bh4) | 0;
        mid = mid + Math.imul(ah8, bl4) | 0;
        hi = hi + Math.imul(ah8, bh4) | 0;
        lo = lo + Math.imul(al7, bl5) | 0;
        mid = mid + Math.imul(al7, bh5) | 0;
        mid = mid + Math.imul(ah7, bl5) | 0;
        hi = hi + Math.imul(ah7, bh5) | 0;
        lo = lo + Math.imul(al6, bl6) | 0;
        mid = mid + Math.imul(al6, bh6) | 0;
        mid = mid + Math.imul(ah6, bl6) | 0;
        hi = hi + Math.imul(ah6, bh6) | 0;
        lo = lo + Math.imul(al5, bl7) | 0;
        mid = mid + Math.imul(al5, bh7) | 0;
        mid = mid + Math.imul(ah5, bl7) | 0;
        hi = hi + Math.imul(ah5, bh7) | 0;
        lo = lo + Math.imul(al4, bl8) | 0;
        mid = mid + Math.imul(al4, bh8) | 0;
        mid = mid + Math.imul(ah4, bl8) | 0;
        hi = hi + Math.imul(ah4, bh8) | 0;
        lo = lo + Math.imul(al3, bl9) | 0;
        mid = mid + Math.imul(al3, bh9) | 0;
        mid = mid + Math.imul(ah3, bl9) | 0;
        hi = hi + Math.imul(ah3, bh9) | 0;
        var w12 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w12 >>> 26) | 0;
        w12 &= 67108863;
        lo = Math.imul(al9, bl4);
        mid = Math.imul(al9, bh4);
        mid = mid + Math.imul(ah9, bl4) | 0;
        hi = Math.imul(ah9, bh4);
        lo = lo + Math.imul(al8, bl5) | 0;
        mid = mid + Math.imul(al8, bh5) | 0;
        mid = mid + Math.imul(ah8, bl5) | 0;
        hi = hi + Math.imul(ah8, bh5) | 0;
        lo = lo + Math.imul(al7, bl6) | 0;
        mid = mid + Math.imul(al7, bh6) | 0;
        mid = mid + Math.imul(ah7, bl6) | 0;
        hi = hi + Math.imul(ah7, bh6) | 0;
        lo = lo + Math.imul(al6, bl7) | 0;
        mid = mid + Math.imul(al6, bh7) | 0;
        mid = mid + Math.imul(ah6, bl7) | 0;
        hi = hi + Math.imul(ah6, bh7) | 0;
        lo = lo + Math.imul(al5, bl8) | 0;
        mid = mid + Math.imul(al5, bh8) | 0;
        mid = mid + Math.imul(ah5, bl8) | 0;
        hi = hi + Math.imul(ah5, bh8) | 0;
        lo = lo + Math.imul(al4, bl9) | 0;
        mid = mid + Math.imul(al4, bh9) | 0;
        mid = mid + Math.imul(ah4, bl9) | 0;
        hi = hi + Math.imul(ah4, bh9) | 0;
        var w13 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w13 >>> 26) | 0;
        w13 &= 67108863;
        lo = Math.imul(al9, bl5);
        mid = Math.imul(al9, bh5);
        mid = mid + Math.imul(ah9, bl5) | 0;
        hi = Math.imul(ah9, bh5);
        lo = lo + Math.imul(al8, bl6) | 0;
        mid = mid + Math.imul(al8, bh6) | 0;
        mid = mid + Math.imul(ah8, bl6) | 0;
        hi = hi + Math.imul(ah8, bh6) | 0;
        lo = lo + Math.imul(al7, bl7) | 0;
        mid = mid + Math.imul(al7, bh7) | 0;
        mid = mid + Math.imul(ah7, bl7) | 0;
        hi = hi + Math.imul(ah7, bh7) | 0;
        lo = lo + Math.imul(al6, bl8) | 0;
        mid = mid + Math.imul(al6, bh8) | 0;
        mid = mid + Math.imul(ah6, bl8) | 0;
        hi = hi + Math.imul(ah6, bh8) | 0;
        lo = lo + Math.imul(al5, bl9) | 0;
        mid = mid + Math.imul(al5, bh9) | 0;
        mid = mid + Math.imul(ah5, bl9) | 0;
        hi = hi + Math.imul(ah5, bh9) | 0;
        var w14 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w14 >>> 26) | 0;
        w14 &= 67108863;
        lo = Math.imul(al9, bl6);
        mid = Math.imul(al9, bh6);
        mid = mid + Math.imul(ah9, bl6) | 0;
        hi = Math.imul(ah9, bh6);
        lo = lo + Math.imul(al8, bl7) | 0;
        mid = mid + Math.imul(al8, bh7) | 0;
        mid = mid + Math.imul(ah8, bl7) | 0;
        hi = hi + Math.imul(ah8, bh7) | 0;
        lo = lo + Math.imul(al7, bl8) | 0;
        mid = mid + Math.imul(al7, bh8) | 0;
        mid = mid + Math.imul(ah7, bl8) | 0;
        hi = hi + Math.imul(ah7, bh8) | 0;
        lo = lo + Math.imul(al6, bl9) | 0;
        mid = mid + Math.imul(al6, bh9) | 0;
        mid = mid + Math.imul(ah6, bl9) | 0;
        hi = hi + Math.imul(ah6, bh9) | 0;
        var w15 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w15 >>> 26) | 0;
        w15 &= 67108863;
        lo = Math.imul(al9, bl7);
        mid = Math.imul(al9, bh7);
        mid = mid + Math.imul(ah9, bl7) | 0;
        hi = Math.imul(ah9, bh7);
        lo = lo + Math.imul(al8, bl8) | 0;
        mid = mid + Math.imul(al8, bh8) | 0;
        mid = mid + Math.imul(ah8, bl8) | 0;
        hi = hi + Math.imul(ah8, bh8) | 0;
        lo = lo + Math.imul(al7, bl9) | 0;
        mid = mid + Math.imul(al7, bh9) | 0;
        mid = mid + Math.imul(ah7, bl9) | 0;
        hi = hi + Math.imul(ah7, bh9) | 0;
        var w16 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w16 >>> 26) | 0;
        w16 &= 67108863;
        lo = Math.imul(al9, bl8);
        mid = Math.imul(al9, bh8);
        mid = mid + Math.imul(ah9, bl8) | 0;
        hi = Math.imul(ah9, bh8);
        lo = lo + Math.imul(al8, bl9) | 0;
        mid = mid + Math.imul(al8, bh9) | 0;
        mid = mid + Math.imul(ah8, bl9) | 0;
        hi = hi + Math.imul(ah8, bh9) | 0;
        var w17 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w17 >>> 26) | 0;
        w17 &= 67108863;
        lo = Math.imul(al9, bl9);
        mid = Math.imul(al9, bh9);
        mid = mid + Math.imul(ah9, bl9) | 0;
        hi = Math.imul(ah9, bh9);
        var w18 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w18 >>> 26) | 0;
        w18 &= 67108863;
        o[0] = w0;
        o[1] = w1;
        o[2] = w2;
        o[3] = w3;
        o[4] = w4;
        o[5] = w5;
        o[6] = w6;
        o[7] = w7;
        o[8] = w8;
        o[9] = w9;
        o[10] = w10;
        o[11] = w11;
        o[12] = w12;
        o[13] = w13;
        o[14] = w14;
        o[15] = w15;
        o[16] = w16;
        o[17] = w17;
        o[18] = w18;
        if (c !== 0) {
          o[19] = c;
          out.length++;
        }
        return out;
      };
      if (!Math.imul) {
        comb10MulTo = smallMulTo;
      }
      function bigMulTo(self, num, out) {
        out.negative = num.negative ^ self.negative;
        out.length = self.length + num.length;
        var carry = 0;
        var hncarry = 0;
        for (var k = 0; k < out.length - 1; k++) {
          var ncarry = hncarry;
          hncarry = 0;
          var rword = carry & 67108863;
          var maxJ = Math.min(k, num.length - 1);
          for (var j = Math.max(0, k - self.length + 1); j <= maxJ; j++) {
            var i = k - j;
            var a = self.words[i] | 0;
            var b = num.words[j] | 0;
            var r = a * b;
            var lo = r & 67108863;
            ncarry = ncarry + (r / 67108864 | 0) | 0;
            lo = lo + rword | 0;
            rword = lo & 67108863;
            ncarry = ncarry + (lo >>> 26) | 0;
            hncarry += ncarry >>> 26;
            ncarry &= 67108863;
          }
          out.words[k] = rword;
          carry = ncarry;
          ncarry = hncarry;
        }
        if (carry !== 0) {
          out.words[k] = carry;
        } else {
          out.length--;
        }
        return out.strip();
      }
      function jumboMulTo(self, num, out) {
        var fftm = new FFTM();
        return fftm.mulp(self, num, out);
      }
      BN.prototype.mulTo = function mulTo(num, out) {
        var res;
        var len = this.length + num.length;
        if (this.length === 10 && num.length === 10) {
          res = comb10MulTo(this, num, out);
        } else if (len < 63) {
          res = smallMulTo(this, num, out);
        } else if (len < 1024) {
          res = bigMulTo(this, num, out);
        } else {
          res = jumboMulTo(this, num, out);
        }
        return res;
      };
      function FFTM(x, y) {
        this.x = x;
        this.y = y;
      }
      FFTM.prototype.makeRBT = function makeRBT(N) {
        var t = new Array(N);
        var l = BN.prototype._countBits(N) - 1;
        for (var i = 0; i < N; i++) {
          t[i] = this.revBin(i, l, N);
        }
        return t;
      };
      FFTM.prototype.revBin = function revBin(x, l, N) {
        if (x === 0 || x === N - 1) return x;
        var rb = 0;
        for (var i = 0; i < l; i++) {
          rb |= (x & 1) << l - i - 1;
          x >>= 1;
        }
        return rb;
      };
      FFTM.prototype.permute = function permute(rbt, rws, iws, rtws, itws, N) {
        for (var i = 0; i < N; i++) {
          rtws[i] = rws[rbt[i]];
          itws[i] = iws[rbt[i]];
        }
      };
      FFTM.prototype.transform = function transform(rws, iws, rtws, itws, N, rbt) {
        this.permute(rbt, rws, iws, rtws, itws, N);
        for (var s = 1; s < N; s <<= 1) {
          var l = s << 1;
          var rtwdf = Math.cos(2 * Math.PI / l);
          var itwdf = Math.sin(2 * Math.PI / l);
          for (var p = 0; p < N; p += l) {
            var rtwdf_ = rtwdf;
            var itwdf_ = itwdf;
            for (var j = 0; j < s; j++) {
              var re = rtws[p + j];
              var ie = itws[p + j];
              var ro = rtws[p + j + s];
              var io = itws[p + j + s];
              var rx = rtwdf_ * ro - itwdf_ * io;
              io = rtwdf_ * io + itwdf_ * ro;
              ro = rx;
              rtws[p + j] = re + ro;
              itws[p + j] = ie + io;
              rtws[p + j + s] = re - ro;
              itws[p + j + s] = ie - io;
              if (j !== l) {
                rx = rtwdf * rtwdf_ - itwdf * itwdf_;
                itwdf_ = rtwdf * itwdf_ + itwdf * rtwdf_;
                rtwdf_ = rx;
              }
            }
          }
        }
      };
      FFTM.prototype.guessLen13b = function guessLen13b(n, m) {
        var N = Math.max(m, n) | 1;
        var odd = N & 1;
        var i = 0;
        for (N = N / 2 | 0; N; N = N >>> 1) {
          i++;
        }
        return 1 << i + 1 + odd;
      };
      FFTM.prototype.conjugate = function conjugate(rws, iws, N) {
        if (N <= 1) return;
        for (var i = 0; i < N / 2; i++) {
          var t = rws[i];
          rws[i] = rws[N - i - 1];
          rws[N - i - 1] = t;
          t = iws[i];
          iws[i] = -iws[N - i - 1];
          iws[N - i - 1] = -t;
        }
      };
      FFTM.prototype.normalize13b = function normalize13b(ws, N) {
        var carry = 0;
        for (var i = 0; i < N / 2; i++) {
          var w = Math.round(ws[2 * i + 1] / N) * 8192 + Math.round(ws[2 * i] / N) + carry;
          ws[i] = w & 67108863;
          if (w < 67108864) {
            carry = 0;
          } else {
            carry = w / 67108864 | 0;
          }
        }
        return ws;
      };
      FFTM.prototype.convert13b = function convert13b(ws, len, rws, N) {
        var carry = 0;
        for (var i = 0; i < len; i++) {
          carry = carry + (ws[i] | 0);
          rws[2 * i] = carry & 8191;
          carry = carry >>> 13;
          rws[2 * i + 1] = carry & 8191;
          carry = carry >>> 13;
        }
        for (i = 2 * len; i < N; ++i) {
          rws[i] = 0;
        }
        assert(carry === 0);
        assert((carry & ~8191) === 0);
      };
      FFTM.prototype.stub = function stub(N) {
        var ph = new Array(N);
        for (var i = 0; i < N; i++) {
          ph[i] = 0;
        }
        return ph;
      };
      FFTM.prototype.mulp = function mulp(x, y, out) {
        var N = 2 * this.guessLen13b(x.length, y.length);
        var rbt = this.makeRBT(N);
        var _ = this.stub(N);
        var rws = new Array(N);
        var rwst = new Array(N);
        var iwst = new Array(N);
        var nrws = new Array(N);
        var nrwst = new Array(N);
        var niwst = new Array(N);
        var rmws = out.words;
        rmws.length = N;
        this.convert13b(x.words, x.length, rws, N);
        this.convert13b(y.words, y.length, nrws, N);
        this.transform(rws, _, rwst, iwst, N, rbt);
        this.transform(nrws, _, nrwst, niwst, N, rbt);
        for (var i = 0; i < N; i++) {
          var rx = rwst[i] * nrwst[i] - iwst[i] * niwst[i];
          iwst[i] = rwst[i] * niwst[i] + iwst[i] * nrwst[i];
          rwst[i] = rx;
        }
        this.conjugate(rwst, iwst, N);
        this.transform(rwst, iwst, rmws, _, N, rbt);
        this.conjugate(rmws, _, N);
        this.normalize13b(rmws, N);
        out.negative = x.negative ^ y.negative;
        out.length = x.length + y.length;
        return out.strip();
      };
      BN.prototype.mul = function mul(num) {
        var out = new BN(null);
        out.words = new Array(this.length + num.length);
        return this.mulTo(num, out);
      };
      BN.prototype.mulf = function mulf(num) {
        var out = new BN(null);
        out.words = new Array(this.length + num.length);
        return jumboMulTo(this, num, out);
      };
      BN.prototype.imul = function imul(num) {
        return this.clone().mulTo(num, this);
      };
      BN.prototype.imuln = function imuln(num) {
        assert(typeof num === "number");
        assert(num < 67108864);
        var carry = 0;
        for (var i = 0; i < this.length; i++) {
          var w = (this.words[i] | 0) * num;
          var lo = (w & 67108863) + (carry & 67108863);
          carry >>= 26;
          carry += w / 67108864 | 0;
          carry += lo >>> 26;
          this.words[i] = lo & 67108863;
        }
        if (carry !== 0) {
          this.words[i] = carry;
          this.length++;
        }
        this.length = num === 0 ? 1 : this.length;
        return this;
      };
      BN.prototype.muln = function muln(num) {
        return this.clone().imuln(num);
      };
      BN.prototype.sqr = function sqr() {
        return this.mul(this);
      };
      BN.prototype.isqr = function isqr() {
        return this.imul(this.clone());
      };
      BN.prototype.pow = function pow(num) {
        var w = toBitArray(num);
        if (w.length === 0) return new BN(1);
        var res = this;
        for (var i = 0; i < w.length; i++, res = res.sqr()) {
          if (w[i] !== 0) break;
        }
        if (++i < w.length) {
          for (var q = res.sqr(); i < w.length; i++, q = q.sqr()) {
            if (w[i] === 0) continue;
            res = res.mul(q);
          }
        }
        return res;
      };
      BN.prototype.iushln = function iushln(bits) {
        assert(typeof bits === "number" && bits >= 0);
        var r = bits % 26;
        var s = (bits - r) / 26;
        var carryMask = 67108863 >>> 26 - r << 26 - r;
        var i;
        if (r !== 0) {
          var carry = 0;
          for (i = 0; i < this.length; i++) {
            var newCarry = this.words[i] & carryMask;
            var c = (this.words[i] | 0) - newCarry << r;
            this.words[i] = c | carry;
            carry = newCarry >>> 26 - r;
          }
          if (carry) {
            this.words[i] = carry;
            this.length++;
          }
        }
        if (s !== 0) {
          for (i = this.length - 1; i >= 0; i--) {
            this.words[i + s] = this.words[i];
          }
          for (i = 0; i < s; i++) {
            this.words[i] = 0;
          }
          this.length += s;
        }
        return this.strip();
      };
      BN.prototype.ishln = function ishln(bits) {
        assert(this.negative === 0);
        return this.iushln(bits);
      };
      BN.prototype.iushrn = function iushrn(bits, hint, extended) {
        assert(typeof bits === "number" && bits >= 0);
        var h;
        if (hint) {
          h = (hint - hint % 26) / 26;
        } else {
          h = 0;
        }
        var r = bits % 26;
        var s = Math.min((bits - r) / 26, this.length);
        var mask = 67108863 ^ 67108863 >>> r << r;
        var maskedWords = extended;
        h -= s;
        h = Math.max(0, h);
        if (maskedWords) {
          for (var i = 0; i < s; i++) {
            maskedWords.words[i] = this.words[i];
          }
          maskedWords.length = s;
        }
        if (s === 0) {
        } else if (this.length > s) {
          this.length -= s;
          for (i = 0; i < this.length; i++) {
            this.words[i] = this.words[i + s];
          }
        } else {
          this.words[0] = 0;
          this.length = 1;
        }
        var carry = 0;
        for (i = this.length - 1; i >= 0 && (carry !== 0 || i >= h); i--) {
          var word = this.words[i] | 0;
          this.words[i] = carry << 26 - r | word >>> r;
          carry = word & mask;
        }
        if (maskedWords && carry !== 0) {
          maskedWords.words[maskedWords.length++] = carry;
        }
        if (this.length === 0) {
          this.words[0] = 0;
          this.length = 1;
        }
        return this.strip();
      };
      BN.prototype.ishrn = function ishrn(bits, hint, extended) {
        assert(this.negative === 0);
        return this.iushrn(bits, hint, extended);
      };
      BN.prototype.shln = function shln(bits) {
        return this.clone().ishln(bits);
      };
      BN.prototype.ushln = function ushln(bits) {
        return this.clone().iushln(bits);
      };
      BN.prototype.shrn = function shrn(bits) {
        return this.clone().ishrn(bits);
      };
      BN.prototype.ushrn = function ushrn(bits) {
        return this.clone().iushrn(bits);
      };
      BN.prototype.testn = function testn(bit) {
        assert(typeof bit === "number" && bit >= 0);
        var r = bit % 26;
        var s = (bit - r) / 26;
        var q = 1 << r;
        if (this.length <= s) return false;
        var w = this.words[s];
        return !!(w & q);
      };
      BN.prototype.imaskn = function imaskn(bits) {
        assert(typeof bits === "number" && bits >= 0);
        var r = bits % 26;
        var s = (bits - r) / 26;
        assert(this.negative === 0, "imaskn works only with positive numbers");
        if (this.length <= s) {
          return this;
        }
        if (r !== 0) {
          s++;
        }
        this.length = Math.min(s, this.length);
        if (r !== 0) {
          var mask = 67108863 ^ 67108863 >>> r << r;
          this.words[this.length - 1] &= mask;
        }
        if (this.length === 0) {
          this.words[0] = 0;
          this.length = 1;
        }
        return this.strip();
      };
      BN.prototype.maskn = function maskn(bits) {
        return this.clone().imaskn(bits);
      };
      BN.prototype.iaddn = function iaddn(num) {
        assert(typeof num === "number");
        assert(num < 67108864);
        if (num < 0) return this.isubn(-num);
        if (this.negative !== 0) {
          if (this.length === 1 && (this.words[0] | 0) < num) {
            this.words[0] = num - (this.words[0] | 0);
            this.negative = 0;
            return this;
          }
          this.negative = 0;
          this.isubn(num);
          this.negative = 1;
          return this;
        }
        return this._iaddn(num);
      };
      BN.prototype._iaddn = function _iaddn(num) {
        this.words[0] += num;
        for (var i = 0; i < this.length && this.words[i] >= 67108864; i++) {
          this.words[i] -= 67108864;
          if (i === this.length - 1) {
            this.words[i + 1] = 1;
          } else {
            this.words[i + 1]++;
          }
        }
        this.length = Math.max(this.length, i + 1);
        return this;
      };
      BN.prototype.isubn = function isubn(num) {
        assert(typeof num === "number");
        assert(num < 67108864);
        if (num < 0) return this.iaddn(-num);
        if (this.negative !== 0) {
          this.negative = 0;
          this.iaddn(num);
          this.negative = 1;
          return this;
        }
        this.words[0] -= num;
        if (this.length === 1 && this.words[0] < 0) {
          this.words[0] = -this.words[0];
          this.negative = 1;
        } else {
          for (var i = 0; i < this.length && this.words[i] < 0; i++) {
            this.words[i] += 67108864;
            this.words[i + 1] -= 1;
          }
        }
        return this.strip();
      };
      BN.prototype.addn = function addn(num) {
        return this.clone().iaddn(num);
      };
      BN.prototype.subn = function subn(num) {
        return this.clone().isubn(num);
      };
      BN.prototype.iabs = function iabs() {
        this.negative = 0;
        return this;
      };
      BN.prototype.abs = function abs() {
        return this.clone().iabs();
      };
      BN.prototype._ishlnsubmul = function _ishlnsubmul(num, mul, shift) {
        var len = num.length + shift;
        var i;
        this._expand(len);
        var w;
        var carry = 0;
        for (i = 0; i < num.length; i++) {
          w = (this.words[i + shift] | 0) + carry;
          var right = (num.words[i] | 0) * mul;
          w -= right & 67108863;
          carry = (w >> 26) - (right / 67108864 | 0);
          this.words[i + shift] = w & 67108863;
        }
        for (; i < this.length - shift; i++) {
          w = (this.words[i + shift] | 0) + carry;
          carry = w >> 26;
          this.words[i + shift] = w & 67108863;
        }
        if (carry === 0) return this.strip();
        assert(carry === -1);
        carry = 0;
        for (i = 0; i < this.length; i++) {
          w = -(this.words[i] | 0) + carry;
          carry = w >> 26;
          this.words[i] = w & 67108863;
        }
        this.negative = 1;
        return this.strip();
      };
      BN.prototype._wordDiv = function _wordDiv(num, mode) {
        var shift = this.length - num.length;
        var a = this.clone();
        var b = num;
        var bhi = b.words[b.length - 1] | 0;
        var bhiBits = this._countBits(bhi);
        shift = 26 - bhiBits;
        if (shift !== 0) {
          b = b.ushln(shift);
          a.iushln(shift);
          bhi = b.words[b.length - 1] | 0;
        }
        var m = a.length - b.length;
        var q;
        if (mode !== "mod") {
          q = new BN(null);
          q.length = m + 1;
          q.words = new Array(q.length);
          for (var i = 0; i < q.length; i++) {
            q.words[i] = 0;
          }
        }
        var diff = a.clone()._ishlnsubmul(b, 1, m);
        if (diff.negative === 0) {
          a = diff;
          if (q) {
            q.words[m] = 1;
          }
        }
        for (var j = m - 1; j >= 0; j--) {
          var qj = (a.words[b.length + j] | 0) * 67108864 + (a.words[b.length + j - 1] | 0);
          qj = Math.min(qj / bhi | 0, 67108863);
          a._ishlnsubmul(b, qj, j);
          while (a.negative !== 0) {
            qj--;
            a.negative = 0;
            a._ishlnsubmul(b, 1, j);
            if (!a.isZero()) {
              a.negative ^= 1;
            }
          }
          if (q) {
            q.words[j] = qj;
          }
        }
        if (q) {
          q.strip();
        }
        a.strip();
        if (mode !== "div" && shift !== 0) {
          a.iushrn(shift);
        }
        return {
          div: q || null,
          mod: a
        };
      };
      BN.prototype.divmod = function divmod(num, mode, positive) {
        assert(!num.isZero());
        if (this.isZero()) {
          return {
            div: new BN(0),
            mod: new BN(0)
          };
        }
        var div, mod, res;
        if (this.negative !== 0 && num.negative === 0) {
          res = this.neg().divmod(num, mode);
          if (mode !== "mod") {
            div = res.div.neg();
          }
          if (mode !== "div") {
            mod = res.mod.neg();
            if (positive && mod.negative !== 0) {
              mod.iadd(num);
            }
          }
          return {
            div,
            mod
          };
        }
        if (this.negative === 0 && num.negative !== 0) {
          res = this.divmod(num.neg(), mode);
          if (mode !== "mod") {
            div = res.div.neg();
          }
          return {
            div,
            mod: res.mod
          };
        }
        if ((this.negative & num.negative) !== 0) {
          res = this.neg().divmod(num.neg(), mode);
          if (mode !== "div") {
            mod = res.mod.neg();
            if (positive && mod.negative !== 0) {
              mod.isub(num);
            }
          }
          return {
            div: res.div,
            mod
          };
        }
        if (num.length > this.length || this.cmp(num) < 0) {
          return {
            div: new BN(0),
            mod: this
          };
        }
        if (num.length === 1) {
          if (mode === "div") {
            return {
              div: this.divn(num.words[0]),
              mod: null
            };
          }
          if (mode === "mod") {
            return {
              div: null,
              mod: new BN(this.modn(num.words[0]))
            };
          }
          return {
            div: this.divn(num.words[0]),
            mod: new BN(this.modn(num.words[0]))
          };
        }
        return this._wordDiv(num, mode);
      };
      BN.prototype.div = function div(num) {
        return this.divmod(num, "div", false).div;
      };
      BN.prototype.mod = function mod(num) {
        return this.divmod(num, "mod", false).mod;
      };
      BN.prototype.umod = function umod(num) {
        return this.divmod(num, "mod", true).mod;
      };
      BN.prototype.divRound = function divRound(num) {
        var dm = this.divmod(num);
        if (dm.mod.isZero()) return dm.div;
        var mod = dm.div.negative !== 0 ? dm.mod.isub(num) : dm.mod;
        var half = num.ushrn(1);
        var r2 = num.andln(1);
        var cmp = mod.cmp(half);
        if (cmp < 0 || r2 === 1 && cmp === 0) return dm.div;
        return dm.div.negative !== 0 ? dm.div.isubn(1) : dm.div.iaddn(1);
      };
      BN.prototype.modn = function modn(num) {
        assert(num <= 67108863);
        var p = (1 << 26) % num;
        var acc = 0;
        for (var i = this.length - 1; i >= 0; i--) {
          acc = (p * acc + (this.words[i] | 0)) % num;
        }
        return acc;
      };
      BN.prototype.idivn = function idivn(num) {
        assert(num <= 67108863);
        var carry = 0;
        for (var i = this.length - 1; i >= 0; i--) {
          var w = (this.words[i] | 0) + carry * 67108864;
          this.words[i] = w / num | 0;
          carry = w % num;
        }
        return this.strip();
      };
      BN.prototype.divn = function divn(num) {
        return this.clone().idivn(num);
      };
      BN.prototype.egcd = function egcd(p) {
        assert(p.negative === 0);
        assert(!p.isZero());
        var x = this;
        var y = p.clone();
        if (x.negative !== 0) {
          x = x.umod(p);
        } else {
          x = x.clone();
        }
        var A = new BN(1);
        var B = new BN(0);
        var C = new BN(0);
        var D = new BN(1);
        var g = 0;
        while (x.isEven() && y.isEven()) {
          x.iushrn(1);
          y.iushrn(1);
          ++g;
        }
        var yp = y.clone();
        var xp = x.clone();
        while (!x.isZero()) {
          for (var i = 0, im = 1; (x.words[0] & im) === 0 && i < 26; ++i, im <<= 1) ;
          if (i > 0) {
            x.iushrn(i);
            while (i-- > 0) {
              if (A.isOdd() || B.isOdd()) {
                A.iadd(yp);
                B.isub(xp);
              }
              A.iushrn(1);
              B.iushrn(1);
            }
          }
          for (var j = 0, jm = 1; (y.words[0] & jm) === 0 && j < 26; ++j, jm <<= 1) ;
          if (j > 0) {
            y.iushrn(j);
            while (j-- > 0) {
              if (C.isOdd() || D.isOdd()) {
                C.iadd(yp);
                D.isub(xp);
              }
              C.iushrn(1);
              D.iushrn(1);
            }
          }
          if (x.cmp(y) >= 0) {
            x.isub(y);
            A.isub(C);
            B.isub(D);
          } else {
            y.isub(x);
            C.isub(A);
            D.isub(B);
          }
        }
        return {
          a: C,
          b: D,
          gcd: y.iushln(g)
        };
      };
      BN.prototype._invmp = function _invmp(p) {
        assert(p.negative === 0);
        assert(!p.isZero());
        var a = this;
        var b = p.clone();
        if (a.negative !== 0) {
          a = a.umod(p);
        } else {
          a = a.clone();
        }
        var x1 = new BN(1);
        var x2 = new BN(0);
        var delta = b.clone();
        while (a.cmpn(1) > 0 && b.cmpn(1) > 0) {
          for (var i = 0, im = 1; (a.words[0] & im) === 0 && i < 26; ++i, im <<= 1) ;
          if (i > 0) {
            a.iushrn(i);
            while (i-- > 0) {
              if (x1.isOdd()) {
                x1.iadd(delta);
              }
              x1.iushrn(1);
            }
          }
          for (var j = 0, jm = 1; (b.words[0] & jm) === 0 && j < 26; ++j, jm <<= 1) ;
          if (j > 0) {
            b.iushrn(j);
            while (j-- > 0) {
              if (x2.isOdd()) {
                x2.iadd(delta);
              }
              x2.iushrn(1);
            }
          }
          if (a.cmp(b) >= 0) {
            a.isub(b);
            x1.isub(x2);
          } else {
            b.isub(a);
            x2.isub(x1);
          }
        }
        var res;
        if (a.cmpn(1) === 0) {
          res = x1;
        } else {
          res = x2;
        }
        if (res.cmpn(0) < 0) {
          res.iadd(p);
        }
        return res;
      };
      BN.prototype.gcd = function gcd(num) {
        if (this.isZero()) return num.abs();
        if (num.isZero()) return this.abs();
        var a = this.clone();
        var b = num.clone();
        a.negative = 0;
        b.negative = 0;
        for (var shift = 0; a.isEven() && b.isEven(); shift++) {
          a.iushrn(1);
          b.iushrn(1);
        }
        do {
          while (a.isEven()) {
            a.iushrn(1);
          }
          while (b.isEven()) {
            b.iushrn(1);
          }
          var r = a.cmp(b);
          if (r < 0) {
            var t = a;
            a = b;
            b = t;
          } else if (r === 0 || b.cmpn(1) === 0) {
            break;
          }
          a.isub(b);
        } while (true);
        return b.iushln(shift);
      };
      BN.prototype.invm = function invm(num) {
        return this.egcd(num).a.umod(num);
      };
      BN.prototype.isEven = function isEven() {
        return (this.words[0] & 1) === 0;
      };
      BN.prototype.isOdd = function isOdd() {
        return (this.words[0] & 1) === 1;
      };
      BN.prototype.andln = function andln(num) {
        return this.words[0] & num;
      };
      BN.prototype.bincn = function bincn(bit) {
        assert(typeof bit === "number");
        var r = bit % 26;
        var s = (bit - r) / 26;
        var q = 1 << r;
        if (this.length <= s) {
          this._expand(s + 1);
          this.words[s] |= q;
          return this;
        }
        var carry = q;
        for (var i = s; carry !== 0 && i < this.length; i++) {
          var w = this.words[i] | 0;
          w += carry;
          carry = w >>> 26;
          w &= 67108863;
          this.words[i] = w;
        }
        if (carry !== 0) {
          this.words[i] = carry;
          this.length++;
        }
        return this;
      };
      BN.prototype.isZero = function isZero() {
        return this.length === 1 && this.words[0] === 0;
      };
      BN.prototype.cmpn = function cmpn(num) {
        var negative = num < 0;
        if (this.negative !== 0 && !negative) return -1;
        if (this.negative === 0 && negative) return 1;
        this.strip();
        var res;
        if (this.length > 1) {
          res = 1;
        } else {
          if (negative) {
            num = -num;
          }
          assert(num <= 67108863, "Number is too big");
          var w = this.words[0] | 0;
          res = w === num ? 0 : w < num ? -1 : 1;
        }
        if (this.negative !== 0) return -res | 0;
        return res;
      };
      BN.prototype.cmp = function cmp(num) {
        if (this.negative !== 0 && num.negative === 0) return -1;
        if (this.negative === 0 && num.negative !== 0) return 1;
        var res = this.ucmp(num);
        if (this.negative !== 0) return -res | 0;
        return res;
      };
      BN.prototype.ucmp = function ucmp(num) {
        if (this.length > num.length) return 1;
        if (this.length < num.length) return -1;
        var res = 0;
        for (var i = this.length - 1; i >= 0; i--) {
          var a = this.words[i] | 0;
          var b = num.words[i] | 0;
          if (a === b) continue;
          if (a < b) {
            res = -1;
          } else if (a > b) {
            res = 1;
          }
          break;
        }
        return res;
      };
      BN.prototype.gtn = function gtn(num) {
        return this.cmpn(num) === 1;
      };
      BN.prototype.gt = function gt2(num) {
        return this.cmp(num) === 1;
      };
      BN.prototype.gten = function gten(num) {
        return this.cmpn(num) >= 0;
      };
      BN.prototype.gte = function gte2(num) {
        return this.cmp(num) >= 0;
      };
      BN.prototype.ltn = function ltn(num) {
        return this.cmpn(num) === -1;
      };
      BN.prototype.lt = function lt2(num) {
        return this.cmp(num) === -1;
      };
      BN.prototype.lten = function lten(num) {
        return this.cmpn(num) <= 0;
      };
      BN.prototype.lte = function lte2(num) {
        return this.cmp(num) <= 0;
      };
      BN.prototype.eqn = function eqn(num) {
        return this.cmpn(num) === 0;
      };
      BN.prototype.eq = function eq2(num) {
        return this.cmp(num) === 0;
      };
      BN.red = function red(num) {
        return new Red(num);
      };
      BN.prototype.toRed = function toRed(ctx) {
        assert(!this.red, "Already a number in reduction context");
        assert(this.negative === 0, "red works only with positives");
        return ctx.convertTo(this)._forceRed(ctx);
      };
      BN.prototype.fromRed = function fromRed() {
        assert(this.red, "fromRed works only with numbers in reduction context");
        return this.red.convertFrom(this);
      };
      BN.prototype._forceRed = function _forceRed(ctx) {
        this.red = ctx;
        return this;
      };
      BN.prototype.forceRed = function forceRed(ctx) {
        assert(!this.red, "Already a number in reduction context");
        return this._forceRed(ctx);
      };
      BN.prototype.redAdd = function redAdd(num) {
        assert(this.red, "redAdd works only with red numbers");
        return this.red.add(this, num);
      };
      BN.prototype.redIAdd = function redIAdd(num) {
        assert(this.red, "redIAdd works only with red numbers");
        return this.red.iadd(this, num);
      };
      BN.prototype.redSub = function redSub(num) {
        assert(this.red, "redSub works only with red numbers");
        return this.red.sub(this, num);
      };
      BN.prototype.redISub = function redISub(num) {
        assert(this.red, "redISub works only with red numbers");
        return this.red.isub(this, num);
      };
      BN.prototype.redShl = function redShl(num) {
        assert(this.red, "redShl works only with red numbers");
        return this.red.shl(this, num);
      };
      BN.prototype.redMul = function redMul(num) {
        assert(this.red, "redMul works only with red numbers");
        this.red._verify2(this, num);
        return this.red.mul(this, num);
      };
      BN.prototype.redIMul = function redIMul(num) {
        assert(this.red, "redMul works only with red numbers");
        this.red._verify2(this, num);
        return this.red.imul(this, num);
      };
      BN.prototype.redSqr = function redSqr() {
        assert(this.red, "redSqr works only with red numbers");
        this.red._verify1(this);
        return this.red.sqr(this);
      };
      BN.prototype.redISqr = function redISqr() {
        assert(this.red, "redISqr works only with red numbers");
        this.red._verify1(this);
        return this.red.isqr(this);
      };
      BN.prototype.redSqrt = function redSqrt() {
        assert(this.red, "redSqrt works only with red numbers");
        this.red._verify1(this);
        return this.red.sqrt(this);
      };
      BN.prototype.redInvm = function redInvm() {
        assert(this.red, "redInvm works only with red numbers");
        this.red._verify1(this);
        return this.red.invm(this);
      };
      BN.prototype.redNeg = function redNeg() {
        assert(this.red, "redNeg works only with red numbers");
        this.red._verify1(this);
        return this.red.neg(this);
      };
      BN.prototype.redPow = function redPow(num) {
        assert(this.red && !num.red, "redPow(normalNum)");
        this.red._verify1(this);
        return this.red.pow(this, num);
      };
      var primes = {
        k256: null,
        p224: null,
        p192: null,
        p25519: null
      };
      function MPrime(name, p) {
        this.name = name;
        this.p = new BN(p, 16);
        this.n = this.p.bitLength();
        this.k = new BN(1).iushln(this.n).isub(this.p);
        this.tmp = this._tmp();
      }
      MPrime.prototype._tmp = function _tmp() {
        var tmp = new BN(null);
        tmp.words = new Array(Math.ceil(this.n / 13));
        return tmp;
      };
      MPrime.prototype.ireduce = function ireduce(num) {
        var r = num;
        var rlen;
        do {
          this.split(r, this.tmp);
          r = this.imulK(r);
          r = r.iadd(this.tmp);
          rlen = r.bitLength();
        } while (rlen > this.n);
        var cmp = rlen < this.n ? -1 : r.ucmp(this.p);
        if (cmp === 0) {
          r.words[0] = 0;
          r.length = 1;
        } else if (cmp > 0) {
          r.isub(this.p);
        } else {
          if (r.strip !== void 0) {
            r.strip();
          } else {
            r._strip();
          }
        }
        return r;
      };
      MPrime.prototype.split = function split(input, out) {
        input.iushrn(this.n, 0, out);
      };
      MPrime.prototype.imulK = function imulK(num) {
        return num.imul(this.k);
      };
      function K256() {
        MPrime.call(
          this,
          "k256",
          "ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffe fffffc2f"
        );
      }
      inherits(K256, MPrime);
      K256.prototype.split = function split(input, output) {
        var mask = 4194303;
        var outLen = Math.min(input.length, 9);
        for (var i = 0; i < outLen; i++) {
          output.words[i] = input.words[i];
        }
        output.length = outLen;
        if (input.length <= 9) {
          input.words[0] = 0;
          input.length = 1;
          return;
        }
        var prev = input.words[9];
        output.words[output.length++] = prev & mask;
        for (i = 10; i < input.length; i++) {
          var next = input.words[i] | 0;
          input.words[i - 10] = (next & mask) << 4 | prev >>> 22;
          prev = next;
        }
        prev >>>= 22;
        input.words[i - 10] = prev;
        if (prev === 0 && input.length > 10) {
          input.length -= 10;
        } else {
          input.length -= 9;
        }
      };
      K256.prototype.imulK = function imulK(num) {
        num.words[num.length] = 0;
        num.words[num.length + 1] = 0;
        num.length += 2;
        var lo = 0;
        for (var i = 0; i < num.length; i++) {
          var w = num.words[i] | 0;
          lo += w * 977;
          num.words[i] = lo & 67108863;
          lo = w * 64 + (lo / 67108864 | 0);
        }
        if (num.words[num.length - 1] === 0) {
          num.length--;
          if (num.words[num.length - 1] === 0) {
            num.length--;
          }
        }
        return num;
      };
      function P224() {
        MPrime.call(
          this,
          "p224",
          "ffffffff ffffffff ffffffff ffffffff 00000000 00000000 00000001"
        );
      }
      inherits(P224, MPrime);
      function P192() {
        MPrime.call(
          this,
          "p192",
          "ffffffff ffffffff ffffffff fffffffe ffffffff ffffffff"
        );
      }
      inherits(P192, MPrime);
      function P25519() {
        MPrime.call(
          this,
          "25519",
          "7fffffffffffffff ffffffffffffffff ffffffffffffffff ffffffffffffffed"
        );
      }
      inherits(P25519, MPrime);
      P25519.prototype.imulK = function imulK(num) {
        var carry = 0;
        for (var i = 0; i < num.length; i++) {
          var hi = (num.words[i] | 0) * 19 + carry;
          var lo = hi & 67108863;
          hi >>>= 26;
          num.words[i] = lo;
          carry = hi;
        }
        if (carry !== 0) {
          num.words[num.length++] = carry;
        }
        return num;
      };
      BN._prime = function prime(name) {
        if (primes[name]) return primes[name];
        var prime2;
        if (name === "k256") {
          prime2 = new K256();
        } else if (name === "p224") {
          prime2 = new P224();
        } else if (name === "p192") {
          prime2 = new P192();
        } else if (name === "p25519") {
          prime2 = new P25519();
        } else {
          throw new Error("Unknown prime " + name);
        }
        primes[name] = prime2;
        return prime2;
      };
      function Red(m) {
        if (typeof m === "string") {
          var prime = BN._prime(m);
          this.m = prime.p;
          this.prime = prime;
        } else {
          assert(m.gtn(1), "modulus must be greater than 1");
          this.m = m;
          this.prime = null;
        }
      }
      Red.prototype._verify1 = function _verify1(a) {
        assert(a.negative === 0, "red works only with positives");
        assert(a.red, "red works only with red numbers");
      };
      Red.prototype._verify2 = function _verify2(a, b) {
        assert((a.negative | b.negative) === 0, "red works only with positives");
        assert(
          a.red && a.red === b.red,
          "red works only with red numbers"
        );
      };
      Red.prototype.imod = function imod(a) {
        if (this.prime) return this.prime.ireduce(a)._forceRed(this);
        return a.umod(this.m)._forceRed(this);
      };
      Red.prototype.neg = function neg(a) {
        if (a.isZero()) {
          return a.clone();
        }
        return this.m.sub(a)._forceRed(this);
      };
      Red.prototype.add = function add(a, b) {
        this._verify2(a, b);
        var res = a.add(b);
        if (res.cmp(this.m) >= 0) {
          res.isub(this.m);
        }
        return res._forceRed(this);
      };
      Red.prototype.iadd = function iadd(a, b) {
        this._verify2(a, b);
        var res = a.iadd(b);
        if (res.cmp(this.m) >= 0) {
          res.isub(this.m);
        }
        return res;
      };
      Red.prototype.sub = function sub(a, b) {
        this._verify2(a, b);
        var res = a.sub(b);
        if (res.cmpn(0) < 0) {
          res.iadd(this.m);
        }
        return res._forceRed(this);
      };
      Red.prototype.isub = function isub(a, b) {
        this._verify2(a, b);
        var res = a.isub(b);
        if (res.cmpn(0) < 0) {
          res.iadd(this.m);
        }
        return res;
      };
      Red.prototype.shl = function shl(a, num) {
        this._verify1(a);
        return this.imod(a.ushln(num));
      };
      Red.prototype.imul = function imul(a, b) {
        this._verify2(a, b);
        return this.imod(a.imul(b));
      };
      Red.prototype.mul = function mul(a, b) {
        this._verify2(a, b);
        return this.imod(a.mul(b));
      };
      Red.prototype.isqr = function isqr(a) {
        return this.imul(a, a.clone());
      };
      Red.prototype.sqr = function sqr(a) {
        return this.mul(a, a);
      };
      Red.prototype.sqrt = function sqrt(a) {
        if (a.isZero()) return a.clone();
        var mod3 = this.m.andln(3);
        assert(mod3 % 2 === 1);
        if (mod3 === 3) {
          var pow = this.m.add(new BN(1)).iushrn(2);
          return this.pow(a, pow);
        }
        var q = this.m.subn(1);
        var s = 0;
        while (!q.isZero() && q.andln(1) === 0) {
          s++;
          q.iushrn(1);
        }
        assert(!q.isZero());
        var one = new BN(1).toRed(this);
        var nOne = one.redNeg();
        var lpow = this.m.subn(1).iushrn(1);
        var z = this.m.bitLength();
        z = new BN(2 * z * z).toRed(this);
        while (this.pow(z, lpow).cmp(nOne) !== 0) {
          z.redIAdd(nOne);
        }
        var c = this.pow(z, q);
        var r = this.pow(a, q.addn(1).iushrn(1));
        var t = this.pow(a, q);
        var m = s;
        while (t.cmp(one) !== 0) {
          var tmp = t;
          for (var i = 0; tmp.cmp(one) !== 0; i++) {
            tmp = tmp.redSqr();
          }
          assert(i < m);
          var b = this.pow(c, new BN(1).iushln(m - i - 1));
          r = r.redMul(b);
          c = b.redSqr();
          t = t.redMul(c);
          m = i;
        }
        return r;
      };
      Red.prototype.invm = function invm(a) {
        var inv = a._invmp(this.m);
        if (inv.negative !== 0) {
          inv.negative = 0;
          return this.imod(inv).redNeg();
        } else {
          return this.imod(inv);
        }
      };
      Red.prototype.pow = function pow(a, num) {
        if (num.isZero()) return new BN(1).toRed(this);
        if (num.cmpn(1) === 0) return a.clone();
        var windowSize = 4;
        var wnd = new Array(1 << windowSize);
        wnd[0] = new BN(1).toRed(this);
        wnd[1] = a;
        for (var i = 2; i < wnd.length; i++) {
          wnd[i] = this.mul(wnd[i - 1], a);
        }
        var res = wnd[0];
        var current = 0;
        var currentLen = 0;
        var start = num.bitLength() % 26;
        if (start === 0) {
          start = 26;
        }
        for (i = num.length - 1; i >= 0; i--) {
          var word = num.words[i];
          for (var j = start - 1; j >= 0; j--) {
            var bit = word >> j & 1;
            if (res !== wnd[0]) {
              res = this.sqr(res);
            }
            if (bit === 0 && current === 0) {
              currentLen = 0;
              continue;
            }
            current <<= 1;
            current |= bit;
            currentLen++;
            if (currentLen !== windowSize && (i !== 0 || j !== 0)) continue;
            res = this.mul(res, wnd[current]);
            currentLen = 0;
            current = 0;
          }
          start = 26;
        }
        return res;
      };
      Red.prototype.convertTo = function convertTo(num) {
        var r = num.umod(this.m);
        return r === num ? r.clone() : r;
      };
      Red.prototype.convertFrom = function convertFrom(num) {
        var res = num.clone();
        res.red = null;
        return res;
      };
      BN.mont = function mont(num) {
        return new Mont(num);
      };
      function Mont(m) {
        Red.call(this, m);
        this.shift = this.m.bitLength();
        if (this.shift % 26 !== 0) {
          this.shift += 26 - this.shift % 26;
        }
        this.r = new BN(1).iushln(this.shift);
        this.r2 = this.imod(this.r.sqr());
        this.rinv = this.r._invmp(this.m);
        this.minv = this.rinv.mul(this.r).isubn(1).div(this.m);
        this.minv = this.minv.umod(this.r);
        this.minv = this.r.sub(this.minv);
      }
      inherits(Mont, Red);
      Mont.prototype.convertTo = function convertTo(num) {
        return this.imod(num.ushln(this.shift));
      };
      Mont.prototype.convertFrom = function convertFrom(num) {
        var r = this.imod(num.mul(this.rinv));
        r.red = null;
        return r;
      };
      Mont.prototype.imul = function imul(a, b) {
        if (a.isZero() || b.isZero()) {
          a.words[0] = 0;
          a.length = 1;
          return a;
        }
        var t = a.imul(b);
        var c = t.maskn(this.shift).mul(this.minv).imaskn(this.shift).mul(this.m);
        var u = t.isub(c).iushrn(this.shift);
        var res = u;
        if (u.cmp(this.m) >= 0) {
          res = u.isub(this.m);
        } else if (u.cmpn(0) < 0) {
          res = u.iadd(this.m);
        }
        return res._forceRed(this);
      };
      Mont.prototype.mul = function mul(a, b) {
        if (a.isZero() || b.isZero()) return new BN(0)._forceRed(this);
        var t = a.mul(b);
        var c = t.maskn(this.shift).mul(this.minv).imaskn(this.shift).mul(this.m);
        var u = t.isub(c).iushrn(this.shift);
        var res = u;
        if (u.cmp(this.m) >= 0) {
          res = u.isub(this.m);
        } else if (u.cmpn(0) < 0) {
          res = u.iadd(this.m);
        }
        return res._forceRed(this);
      };
      Mont.prototype.invm = function invm(a) {
        var res = this.imod(a._invmp(this.m).mul(this.r2));
        return res._forceRed(this);
      };
    })(typeof module === "undefined" || module, exports);
  }
});

// node_modules/.pnpm/inherits@2.0.4/node_modules/inherits/inherits_browser.js
var require_inherits_browser = __commonJS({
  "node_modules/.pnpm/inherits@2.0.4/node_modules/inherits/inherits_browser.js"(exports, module) {
    if (typeof Object.create === "function") {
      module.exports = function inherits(ctor, superCtor) {
        if (superCtor) {
          ctor.super_ = superCtor;
          ctor.prototype = Object.create(superCtor.prototype, {
            constructor: {
              value: ctor,
              enumerable: false,
              writable: true,
              configurable: true
            }
          });
        }
      };
    } else {
      module.exports = function inherits(ctor, superCtor) {
        if (superCtor) {
          ctor.super_ = superCtor;
          var TempCtor = function() {
          };
          TempCtor.prototype = superCtor.prototype;
          ctor.prototype = new TempCtor();
          ctor.prototype.constructor = ctor;
        }
      };
    }
  }
});

// node_modules/.pnpm/inherits@2.0.4/node_modules/inherits/inherits.js
var require_inherits = __commonJS({
  "node_modules/.pnpm/inherits@2.0.4/node_modules/inherits/inherits.js"(exports, module) {
    try {
      util2 = __require("util");
      if (typeof util2.inherits !== "function") throw "";
      module.exports = util2.inherits;
    } catch (e) {
      module.exports = require_inherits_browser();
    }
    var util2;
  }
});

// node_modules/.pnpm/safer-buffer@2.1.2/node_modules/safer-buffer/safer.js
var require_safer = __commonJS({
  "node_modules/.pnpm/safer-buffer@2.1.2/node_modules/safer-buffer/safer.js"(exports, module) {
    "use strict";
    var buffer = __require("buffer");
    var Buffer2 = buffer.Buffer;
    var safer = {};
    var key;
    for (key in buffer) {
      if (!buffer.hasOwnProperty(key)) continue;
      if (key === "SlowBuffer" || key === "Buffer") continue;
      safer[key] = buffer[key];
    }
    var Safer = safer.Buffer = {};
    for (key in Buffer2) {
      if (!Buffer2.hasOwnProperty(key)) continue;
      if (key === "allocUnsafe" || key === "allocUnsafeSlow") continue;
      Safer[key] = Buffer2[key];
    }
    safer.Buffer.prototype = Buffer2.prototype;
    if (!Safer.from || Safer.from === Uint8Array.from) {
      Safer.from = function(value, encodingOrOffset, length) {
        if (typeof value === "number") {
          throw new TypeError('The "value" argument must not be of type number. Received type ' + typeof value);
        }
        if (value && typeof value.length === "undefined") {
          throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof value);
        }
        return Buffer2(value, encodingOrOffset, length);
      };
    }
    if (!Safer.alloc) {
      Safer.alloc = function(size, fill, encoding) {
        if (typeof size !== "number") {
          throw new TypeError('The "size" argument must be of type number. Received type ' + typeof size);
        }
        if (size < 0 || size >= 2 * (1 << 30)) {
          throw new RangeError('The value "' + size + '" is invalid for option "size"');
        }
        var buf = Buffer2(size);
        if (!fill || fill.length === 0) {
          buf.fill(0);
        } else if (typeof encoding === "string") {
          buf.fill(fill, encoding);
        } else {
          buf.fill(fill);
        }
        return buf;
      };
    }
    if (!safer.kStringMaxLength) {
      try {
        safer.kStringMaxLength = process.binding("buffer").kStringMaxLength;
      } catch (e) {
      }
    }
    if (!safer.constants) {
      safer.constants = {
        MAX_LENGTH: safer.kMaxLength
      };
      if (safer.kStringMaxLength) {
        safer.constants.MAX_STRING_LENGTH = safer.kStringMaxLength;
      }
    }
    module.exports = safer;
  }
});

// node_modules/.pnpm/asn1.js@5.4.1/node_modules/asn1.js/lib/asn1/base/reporter.js
var require_reporter = __commonJS({
  "node_modules/.pnpm/asn1.js@5.4.1/node_modules/asn1.js/lib/asn1/base/reporter.js"(exports) {
    "use strict";
    var inherits = require_inherits();
    function Reporter(options) {
      this._reporterState = {
        obj: null,
        path: [],
        options: options || {},
        errors: []
      };
    }
    exports.Reporter = Reporter;
    Reporter.prototype.isError = function isError(obj) {
      return obj instanceof ReporterError;
    };
    Reporter.prototype.save = function save() {
      const state = this._reporterState;
      return { obj: state.obj, pathLen: state.path.length };
    };
    Reporter.prototype.restore = function restore(data) {
      const state = this._reporterState;
      state.obj = data.obj;
      state.path = state.path.slice(0, data.pathLen);
    };
    Reporter.prototype.enterKey = function enterKey(key) {
      return this._reporterState.path.push(key);
    };
    Reporter.prototype.exitKey = function exitKey(index) {
      const state = this._reporterState;
      state.path = state.path.slice(0, index - 1);
    };
    Reporter.prototype.leaveKey = function leaveKey(index, key, value) {
      const state = this._reporterState;
      this.exitKey(index);
      if (state.obj !== null)
        state.obj[key] = value;
    };
    Reporter.prototype.path = function path2() {
      return this._reporterState.path.join("/");
    };
    Reporter.prototype.enterObject = function enterObject() {
      const state = this._reporterState;
      const prev = state.obj;
      state.obj = {};
      return prev;
    };
    Reporter.prototype.leaveObject = function leaveObject(prev) {
      const state = this._reporterState;
      const now = state.obj;
      state.obj = prev;
      return now;
    };
    Reporter.prototype.error = function error(msg) {
      let err;
      const state = this._reporterState;
      const inherited = msg instanceof ReporterError;
      if (inherited) {
        err = msg;
      } else {
        err = new ReporterError(state.path.map(function(elem) {
          return "[" + JSON.stringify(elem) + "]";
        }).join(""), msg.message || msg, msg.stack);
      }
      if (!state.options.partial)
        throw err;
      if (!inherited)
        state.errors.push(err);
      return err;
    };
    Reporter.prototype.wrapResult = function wrapResult(result) {
      const state = this._reporterState;
      if (!state.options.partial)
        return result;
      return {
        result: this.isError(result) ? null : result,
        errors: state.errors
      };
    };
    function ReporterError(path2, msg) {
      this.path = path2;
      this.rethrow(msg);
    }
    inherits(ReporterError, Error);
    ReporterError.prototype.rethrow = function rethrow(msg) {
      this.message = msg + " at: " + (this.path || "(shallow)");
      if (Error.captureStackTrace)
        Error.captureStackTrace(this, ReporterError);
      if (!this.stack) {
        try {
          throw new Error(this.message);
        } catch (e) {
          this.stack = e.stack;
        }
      }
      return this;
    };
  }
});

// node_modules/.pnpm/asn1.js@5.4.1/node_modules/asn1.js/lib/asn1/base/buffer.js
var require_buffer = __commonJS({
  "node_modules/.pnpm/asn1.js@5.4.1/node_modules/asn1.js/lib/asn1/base/buffer.js"(exports) {
    "use strict";
    var inherits = require_inherits();
    var Reporter = require_reporter().Reporter;
    var Buffer2 = require_safer().Buffer;
    function DecoderBuffer(base, options) {
      Reporter.call(this, options);
      if (!Buffer2.isBuffer(base)) {
        this.error("Input not Buffer");
        return;
      }
      this.base = base;
      this.offset = 0;
      this.length = base.length;
    }
    inherits(DecoderBuffer, Reporter);
    exports.DecoderBuffer = DecoderBuffer;
    DecoderBuffer.isDecoderBuffer = function isDecoderBuffer(data) {
      if (data instanceof DecoderBuffer) {
        return true;
      }
      const isCompatible = typeof data === "object" && Buffer2.isBuffer(data.base) && data.constructor.name === "DecoderBuffer" && typeof data.offset === "number" && typeof data.length === "number" && typeof data.save === "function" && typeof data.restore === "function" && typeof data.isEmpty === "function" && typeof data.readUInt8 === "function" && typeof data.skip === "function" && typeof data.raw === "function";
      return isCompatible;
    };
    DecoderBuffer.prototype.save = function save() {
      return { offset: this.offset, reporter: Reporter.prototype.save.call(this) };
    };
    DecoderBuffer.prototype.restore = function restore(save) {
      const res = new DecoderBuffer(this.base);
      res.offset = save.offset;
      res.length = this.offset;
      this.offset = save.offset;
      Reporter.prototype.restore.call(this, save.reporter);
      return res;
    };
    DecoderBuffer.prototype.isEmpty = function isEmpty() {
      return this.offset === this.length;
    };
    DecoderBuffer.prototype.readUInt8 = function readUInt8(fail) {
      if (this.offset + 1 <= this.length)
        return this.base.readUInt8(this.offset++, true);
      else
        return this.error(fail || "DecoderBuffer overrun");
    };
    DecoderBuffer.prototype.skip = function skip(bytes, fail) {
      if (!(this.offset + bytes <= this.length))
        return this.error(fail || "DecoderBuffer overrun");
      const res = new DecoderBuffer(this.base);
      res._reporterState = this._reporterState;
      res.offset = this.offset;
      res.length = this.offset + bytes;
      this.offset += bytes;
      return res;
    };
    DecoderBuffer.prototype.raw = function raw(save) {
      return this.base.slice(save ? save.offset : this.offset, this.length);
    };
    function EncoderBuffer(value, reporter) {
      if (Array.isArray(value)) {
        this.length = 0;
        this.value = value.map(function(item) {
          if (!EncoderBuffer.isEncoderBuffer(item))
            item = new EncoderBuffer(item, reporter);
          this.length += item.length;
          return item;
        }, this);
      } else if (typeof value === "number") {
        if (!(0 <= value && value <= 255))
          return reporter.error("non-byte EncoderBuffer value");
        this.value = value;
        this.length = 1;
      } else if (typeof value === "string") {
        this.value = value;
        this.length = Buffer2.byteLength(value);
      } else if (Buffer2.isBuffer(value)) {
        this.value = value;
        this.length = value.length;
      } else {
        return reporter.error("Unsupported type: " + typeof value);
      }
    }
    exports.EncoderBuffer = EncoderBuffer;
    EncoderBuffer.isEncoderBuffer = function isEncoderBuffer(data) {
      if (data instanceof EncoderBuffer) {
        return true;
      }
      const isCompatible = typeof data === "object" && data.constructor.name === "EncoderBuffer" && typeof data.length === "number" && typeof data.join === "function";
      return isCompatible;
    };
    EncoderBuffer.prototype.join = function join(out, offset) {
      if (!out)
        out = Buffer2.alloc(this.length);
      if (!offset)
        offset = 0;
      if (this.length === 0)
        return out;
      if (Array.isArray(this.value)) {
        this.value.forEach(function(item) {
          item.join(out, offset);
          offset += item.length;
        });
      } else {
        if (typeof this.value === "number")
          out[offset] = this.value;
        else if (typeof this.value === "string")
          out.write(this.value, offset);
        else if (Buffer2.isBuffer(this.value))
          this.value.copy(out, offset);
        offset += this.length;
      }
      return out;
    };
  }
});

// node_modules/.pnpm/minimalistic-assert@1.0.1/node_modules/minimalistic-assert/index.js
var require_minimalistic_assert = __commonJS({
  "node_modules/.pnpm/minimalistic-assert@1.0.1/node_modules/minimalistic-assert/index.js"(exports, module) {
    module.exports = assert;
    function assert(val, msg) {
      if (!val)
        throw new Error(msg || "Assertion failed");
    }
    assert.equal = function assertEqual(l, r, msg) {
      if (l != r)
        throw new Error(msg || "Assertion failed: " + l + " != " + r);
    };
  }
});

// node_modules/.pnpm/asn1.js@5.4.1/node_modules/asn1.js/lib/asn1/base/node.js
var require_node = __commonJS({
  "node_modules/.pnpm/asn1.js@5.4.1/node_modules/asn1.js/lib/asn1/base/node.js"(exports, module) {
    "use strict";
    var Reporter = require_reporter().Reporter;
    var EncoderBuffer = require_buffer().EncoderBuffer;
    var DecoderBuffer = require_buffer().DecoderBuffer;
    var assert = require_minimalistic_assert();
    var tags = [
      "seq",
      "seqof",
      "set",
      "setof",
      "objid",
      "bool",
      "gentime",
      "utctime",
      "null_",
      "enum",
      "int",
      "objDesc",
      "bitstr",
      "bmpstr",
      "charstr",
      "genstr",
      "graphstr",
      "ia5str",
      "iso646str",
      "numstr",
      "octstr",
      "printstr",
      "t61str",
      "unistr",
      "utf8str",
      "videostr"
    ];
    var methods = [
      "key",
      "obj",
      "use",
      "optional",
      "explicit",
      "implicit",
      "def",
      "choice",
      "any",
      "contains"
    ].concat(tags);
    var overrided = [
      "_peekTag",
      "_decodeTag",
      "_use",
      "_decodeStr",
      "_decodeObjid",
      "_decodeTime",
      "_decodeNull",
      "_decodeInt",
      "_decodeBool",
      "_decodeList",
      "_encodeComposite",
      "_encodeStr",
      "_encodeObjid",
      "_encodeTime",
      "_encodeNull",
      "_encodeInt",
      "_encodeBool"
    ];
    function Node(enc, parent, name) {
      const state = {};
      this._baseState = state;
      state.name = name;
      state.enc = enc;
      state.parent = parent || null;
      state.children = null;
      state.tag = null;
      state.args = null;
      state.reverseArgs = null;
      state.choice = null;
      state.optional = false;
      state.any = false;
      state.obj = false;
      state.use = null;
      state.useDecoder = null;
      state.key = null;
      state["default"] = null;
      state.explicit = null;
      state.implicit = null;
      state.contains = null;
      if (!state.parent) {
        state.children = [];
        this._wrap();
      }
    }
    module.exports = Node;
    var stateProps = [
      "enc",
      "parent",
      "children",
      "tag",
      "args",
      "reverseArgs",
      "choice",
      "optional",
      "any",
      "obj",
      "use",
      "alteredUse",
      "key",
      "default",
      "explicit",
      "implicit",
      "contains"
    ];
    Node.prototype.clone = function clone() {
      const state = this._baseState;
      const cstate = {};
      stateProps.forEach(function(prop) {
        cstate[prop] = state[prop];
      });
      const res = new this.constructor(cstate.parent);
      res._baseState = cstate;
      return res;
    };
    Node.prototype._wrap = function wrap() {
      const state = this._baseState;
      methods.forEach(function(method) {
        this[method] = function _wrappedMethod() {
          const clone = new this.constructor(this);
          state.children.push(clone);
          return clone[method].apply(clone, arguments);
        };
      }, this);
    };
    Node.prototype._init = function init(body) {
      const state = this._baseState;
      assert(state.parent === null);
      body.call(this);
      state.children = state.children.filter(function(child) {
        return child._baseState.parent === this;
      }, this);
      assert.equal(state.children.length, 1, "Root node can have only one child");
    };
    Node.prototype._useArgs = function useArgs(args) {
      const state = this._baseState;
      const children = args.filter(function(arg) {
        return arg instanceof this.constructor;
      }, this);
      args = args.filter(function(arg) {
        return !(arg instanceof this.constructor);
      }, this);
      if (children.length !== 0) {
        assert(state.children === null);
        state.children = children;
        children.forEach(function(child) {
          child._baseState.parent = this;
        }, this);
      }
      if (args.length !== 0) {
        assert(state.args === null);
        state.args = args;
        state.reverseArgs = args.map(function(arg) {
          if (typeof arg !== "object" || arg.constructor !== Object)
            return arg;
          const res = {};
          Object.keys(arg).forEach(function(key) {
            if (key == (key | 0))
              key |= 0;
            const value = arg[key];
            res[value] = key;
          });
          return res;
        });
      }
    };
    overrided.forEach(function(method) {
      Node.prototype[method] = function _overrided() {
        const state = this._baseState;
        throw new Error(method + " not implemented for encoding: " + state.enc);
      };
    });
    tags.forEach(function(tag) {
      Node.prototype[tag] = function _tagMethod() {
        const state = this._baseState;
        const args = Array.prototype.slice.call(arguments);
        assert(state.tag === null);
        state.tag = tag;
        this._useArgs(args);
        return this;
      };
    });
    Node.prototype.use = function use(item) {
      assert(item);
      const state = this._baseState;
      assert(state.use === null);
      state.use = item;
      return this;
    };
    Node.prototype.optional = function optional() {
      const state = this._baseState;
      state.optional = true;
      return this;
    };
    Node.prototype.def = function def(val) {
      const state = this._baseState;
      assert(state["default"] === null);
      state["default"] = val;
      state.optional = true;
      return this;
    };
    Node.prototype.explicit = function explicit(num) {
      const state = this._baseState;
      assert(state.explicit === null && state.implicit === null);
      state.explicit = num;
      return this;
    };
    Node.prototype.implicit = function implicit(num) {
      const state = this._baseState;
      assert(state.explicit === null && state.implicit === null);
      state.implicit = num;
      return this;
    };
    Node.prototype.obj = function obj() {
      const state = this._baseState;
      const args = Array.prototype.slice.call(arguments);
      state.obj = true;
      if (args.length !== 0)
        this._useArgs(args);
      return this;
    };
    Node.prototype.key = function key(newKey) {
      const state = this._baseState;
      assert(state.key === null);
      state.key = newKey;
      return this;
    };
    Node.prototype.any = function any() {
      const state = this._baseState;
      state.any = true;
      return this;
    };
    Node.prototype.choice = function choice(obj) {
      const state = this._baseState;
      assert(state.choice === null);
      state.choice = obj;
      this._useArgs(Object.keys(obj).map(function(key) {
        return obj[key];
      }));
      return this;
    };
    Node.prototype.contains = function contains(item) {
      const state = this._baseState;
      assert(state.use === null);
      state.contains = item;
      return this;
    };
    Node.prototype._decode = function decode(input, options) {
      const state = this._baseState;
      if (state.parent === null)
        return input.wrapResult(state.children[0]._decode(input, options));
      let result = state["default"];
      let present = true;
      let prevKey = null;
      if (state.key !== null)
        prevKey = input.enterKey(state.key);
      if (state.optional) {
        let tag = null;
        if (state.explicit !== null)
          tag = state.explicit;
        else if (state.implicit !== null)
          tag = state.implicit;
        else if (state.tag !== null)
          tag = state.tag;
        if (tag === null && !state.any) {
          const save = input.save();
          try {
            if (state.choice === null)
              this._decodeGeneric(state.tag, input, options);
            else
              this._decodeChoice(input, options);
            present = true;
          } catch (e) {
            present = false;
          }
          input.restore(save);
        } else {
          present = this._peekTag(input, tag, state.any);
          if (input.isError(present))
            return present;
        }
      }
      let prevObj;
      if (state.obj && present)
        prevObj = input.enterObject();
      if (present) {
        if (state.explicit !== null) {
          const explicit = this._decodeTag(input, state.explicit);
          if (input.isError(explicit))
            return explicit;
          input = explicit;
        }
        const start = input.offset;
        if (state.use === null && state.choice === null) {
          let save;
          if (state.any)
            save = input.save();
          const body = this._decodeTag(
            input,
            state.implicit !== null ? state.implicit : state.tag,
            state.any
          );
          if (input.isError(body))
            return body;
          if (state.any)
            result = input.raw(save);
          else
            input = body;
        }
        if (options && options.track && state.tag !== null)
          options.track(input.path(), start, input.length, "tagged");
        if (options && options.track && state.tag !== null)
          options.track(input.path(), input.offset, input.length, "content");
        if (state.any) {
        } else if (state.choice === null) {
          result = this._decodeGeneric(state.tag, input, options);
        } else {
          result = this._decodeChoice(input, options);
        }
        if (input.isError(result))
          return result;
        if (!state.any && state.choice === null && state.children !== null) {
          state.children.forEach(function decodeChildren(child) {
            child._decode(input, options);
          });
        }
        if (state.contains && (state.tag === "octstr" || state.tag === "bitstr")) {
          const data = new DecoderBuffer(result);
          result = this._getUse(state.contains, input._reporterState.obj)._decode(data, options);
        }
      }
      if (state.obj && present)
        result = input.leaveObject(prevObj);
      if (state.key !== null && (result !== null || present === true))
        input.leaveKey(prevKey, state.key, result);
      else if (prevKey !== null)
        input.exitKey(prevKey);
      return result;
    };
    Node.prototype._decodeGeneric = function decodeGeneric(tag, input, options) {
      const state = this._baseState;
      if (tag === "seq" || tag === "set")
        return null;
      if (tag === "seqof" || tag === "setof")
        return this._decodeList(input, tag, state.args[0], options);
      else if (/str$/.test(tag))
        return this._decodeStr(input, tag, options);
      else if (tag === "objid" && state.args)
        return this._decodeObjid(input, state.args[0], state.args[1], options);
      else if (tag === "objid")
        return this._decodeObjid(input, null, null, options);
      else if (tag === "gentime" || tag === "utctime")
        return this._decodeTime(input, tag, options);
      else if (tag === "null_")
        return this._decodeNull(input, options);
      else if (tag === "bool")
        return this._decodeBool(input, options);
      else if (tag === "objDesc")
        return this._decodeStr(input, tag, options);
      else if (tag === "int" || tag === "enum")
        return this._decodeInt(input, state.args && state.args[0], options);
      if (state.use !== null) {
        return this._getUse(state.use, input._reporterState.obj)._decode(input, options);
      } else {
        return input.error("unknown tag: " + tag);
      }
    };
    Node.prototype._getUse = function _getUse(entity, obj) {
      const state = this._baseState;
      state.useDecoder = this._use(entity, obj);
      assert(state.useDecoder._baseState.parent === null);
      state.useDecoder = state.useDecoder._baseState.children[0];
      if (state.implicit !== state.useDecoder._baseState.implicit) {
        state.useDecoder = state.useDecoder.clone();
        state.useDecoder._baseState.implicit = state.implicit;
      }
      return state.useDecoder;
    };
    Node.prototype._decodeChoice = function decodeChoice(input, options) {
      const state = this._baseState;
      let result = null;
      let match = false;
      Object.keys(state.choice).some(function(key) {
        const save = input.save();
        const node = state.choice[key];
        try {
          const value = node._decode(input, options);
          if (input.isError(value))
            return false;
          result = { type: key, value };
          match = true;
        } catch (e) {
          input.restore(save);
          return false;
        }
        return true;
      }, this);
      if (!match)
        return input.error("Choice not matched");
      return result;
    };
    Node.prototype._createEncoderBuffer = function createEncoderBuffer(data) {
      return new EncoderBuffer(data, this.reporter);
    };
    Node.prototype._encode = function encode(data, reporter, parent) {
      const state = this._baseState;
      if (state["default"] !== null && state["default"] === data)
        return;
      const result = this._encodeValue(data, reporter, parent);
      if (result === void 0)
        return;
      if (this._skipDefault(result, reporter, parent))
        return;
      return result;
    };
    Node.prototype._encodeValue = function encode(data, reporter, parent) {
      const state = this._baseState;
      if (state.parent === null)
        return state.children[0]._encode(data, reporter || new Reporter());
      let result = null;
      this.reporter = reporter;
      if (state.optional && data === void 0) {
        if (state["default"] !== null)
          data = state["default"];
        else
          return;
      }
      let content = null;
      let primitive = false;
      if (state.any) {
        result = this._createEncoderBuffer(data);
      } else if (state.choice) {
        result = this._encodeChoice(data, reporter);
      } else if (state.contains) {
        content = this._getUse(state.contains, parent)._encode(data, reporter);
        primitive = true;
      } else if (state.children) {
        content = state.children.map(function(child) {
          if (child._baseState.tag === "null_")
            return child._encode(null, reporter, data);
          if (child._baseState.key === null)
            return reporter.error("Child should have a key");
          const prevKey = reporter.enterKey(child._baseState.key);
          if (typeof data !== "object")
            return reporter.error("Child expected, but input is not object");
          const res = child._encode(data[child._baseState.key], reporter, data);
          reporter.leaveKey(prevKey);
          return res;
        }, this).filter(function(child) {
          return child;
        });
        content = this._createEncoderBuffer(content);
      } else {
        if (state.tag === "seqof" || state.tag === "setof") {
          if (!(state.args && state.args.length === 1))
            return reporter.error("Too many args for : " + state.tag);
          if (!Array.isArray(data))
            return reporter.error("seqof/setof, but data is not Array");
          const child = this.clone();
          child._baseState.implicit = null;
          content = this._createEncoderBuffer(data.map(function(item) {
            const state2 = this._baseState;
            return this._getUse(state2.args[0], data)._encode(item, reporter);
          }, child));
        } else if (state.use !== null) {
          result = this._getUse(state.use, parent)._encode(data, reporter);
        } else {
          content = this._encodePrimitive(state.tag, data);
          primitive = true;
        }
      }
      if (!state.any && state.choice === null) {
        const tag = state.implicit !== null ? state.implicit : state.tag;
        const cls = state.implicit === null ? "universal" : "context";
        if (tag === null) {
          if (state.use === null)
            reporter.error("Tag could be omitted only for .use()");
        } else {
          if (state.use === null)
            result = this._encodeComposite(tag, primitive, cls, content);
        }
      }
      if (state.explicit !== null)
        result = this._encodeComposite(state.explicit, false, "context", result);
      return result;
    };
    Node.prototype._encodeChoice = function encodeChoice(data, reporter) {
      const state = this._baseState;
      const node = state.choice[data.type];
      if (!node) {
        assert(
          false,
          data.type + " not found in " + JSON.stringify(Object.keys(state.choice))
        );
      }
      return node._encode(data.value, reporter);
    };
    Node.prototype._encodePrimitive = function encodePrimitive(tag, data) {
      const state = this._baseState;
      if (/str$/.test(tag))
        return this._encodeStr(data, tag);
      else if (tag === "objid" && state.args)
        return this._encodeObjid(data, state.reverseArgs[0], state.args[1]);
      else if (tag === "objid")
        return this._encodeObjid(data, null, null);
      else if (tag === "gentime" || tag === "utctime")
        return this._encodeTime(data, tag);
      else if (tag === "null_")
        return this._encodeNull();
      else if (tag === "int" || tag === "enum")
        return this._encodeInt(data, state.args && state.reverseArgs[0]);
      else if (tag === "bool")
        return this._encodeBool(data);
      else if (tag === "objDesc")
        return this._encodeStr(data, tag);
      else
        throw new Error("Unsupported tag: " + tag);
    };
    Node.prototype._isNumstr = function isNumstr(str) {
      return /^[0-9 ]*$/.test(str);
    };
    Node.prototype._isPrintstr = function isPrintstr(str) {
      return /^[A-Za-z0-9 '()+,-./:=?]*$/.test(str);
    };
  }
});

// node_modules/.pnpm/asn1.js@5.4.1/node_modules/asn1.js/lib/asn1/constants/der.js
var require_der = __commonJS({
  "node_modules/.pnpm/asn1.js@5.4.1/node_modules/asn1.js/lib/asn1/constants/der.js"(exports) {
    "use strict";
    function reverse(map) {
      const res = {};
      Object.keys(map).forEach(function(key) {
        if ((key | 0) == key)
          key = key | 0;
        const value = map[key];
        res[value] = key;
      });
      return res;
    }
    exports.tagClass = {
      0: "universal",
      1: "application",
      2: "context",
      3: "private"
    };
    exports.tagClassByName = reverse(exports.tagClass);
    exports.tag = {
      0: "end",
      1: "bool",
      2: "int",
      3: "bitstr",
      4: "octstr",
      5: "null_",
      6: "objid",
      7: "objDesc",
      8: "external",
      9: "real",
      10: "enum",
      11: "embed",
      12: "utf8str",
      13: "relativeOid",
      16: "seq",
      17: "set",
      18: "numstr",
      19: "printstr",
      20: "t61str",
      21: "videostr",
      22: "ia5str",
      23: "utctime",
      24: "gentime",
      25: "graphstr",
      26: "iso646str",
      27: "genstr",
      28: "unistr",
      29: "charstr",
      30: "bmpstr"
    };
    exports.tagByName = reverse(exports.tag);
  }
});

// node_modules/.pnpm/asn1.js@5.4.1/node_modules/asn1.js/lib/asn1/encoders/der.js
var require_der2 = __commonJS({
  "node_modules/.pnpm/asn1.js@5.4.1/node_modules/asn1.js/lib/asn1/encoders/der.js"(exports, module) {
    "use strict";
    var inherits = require_inherits();
    var Buffer2 = require_safer().Buffer;
    var Node = require_node();
    var der = require_der();
    function DEREncoder(entity) {
      this.enc = "der";
      this.name = entity.name;
      this.entity = entity;
      this.tree = new DERNode();
      this.tree._init(entity.body);
    }
    module.exports = DEREncoder;
    DEREncoder.prototype.encode = function encode(data, reporter) {
      return this.tree._encode(data, reporter).join();
    };
    function DERNode(parent) {
      Node.call(this, "der", parent);
    }
    inherits(DERNode, Node);
    DERNode.prototype._encodeComposite = function encodeComposite(tag, primitive, cls, content) {
      const encodedTag = encodeTag(tag, primitive, cls, this.reporter);
      if (content.length < 128) {
        const header2 = Buffer2.alloc(2);
        header2[0] = encodedTag;
        header2[1] = content.length;
        return this._createEncoderBuffer([header2, content]);
      }
      let lenOctets = 1;
      for (let i = content.length; i >= 256; i >>= 8)
        lenOctets++;
      const header = Buffer2.alloc(1 + 1 + lenOctets);
      header[0] = encodedTag;
      header[1] = 128 | lenOctets;
      for (let i = 1 + lenOctets, j = content.length; j > 0; i--, j >>= 8)
        header[i] = j & 255;
      return this._createEncoderBuffer([header, content]);
    };
    DERNode.prototype._encodeStr = function encodeStr(str, tag) {
      if (tag === "bitstr") {
        return this._createEncoderBuffer([str.unused | 0, str.data]);
      } else if (tag === "bmpstr") {
        const buf = Buffer2.alloc(str.length * 2);
        for (let i = 0; i < str.length; i++) {
          buf.writeUInt16BE(str.charCodeAt(i), i * 2);
        }
        return this._createEncoderBuffer(buf);
      } else if (tag === "numstr") {
        if (!this._isNumstr(str)) {
          return this.reporter.error("Encoding of string type: numstr supports only digits and space");
        }
        return this._createEncoderBuffer(str);
      } else if (tag === "printstr") {
        if (!this._isPrintstr(str)) {
          return this.reporter.error("Encoding of string type: printstr supports only latin upper and lower case letters, digits, space, apostrophe, left and rigth parenthesis, plus sign, comma, hyphen, dot, slash, colon, equal sign, question mark");
        }
        return this._createEncoderBuffer(str);
      } else if (/str$/.test(tag)) {
        return this._createEncoderBuffer(str);
      } else if (tag === "objDesc") {
        return this._createEncoderBuffer(str);
      } else {
        return this.reporter.error("Encoding of string type: " + tag + " unsupported");
      }
    };
    DERNode.prototype._encodeObjid = function encodeObjid(id, values, relative) {
      if (typeof id === "string") {
        if (!values)
          return this.reporter.error("string objid given, but no values map found");
        if (!values.hasOwnProperty(id))
          return this.reporter.error("objid not found in values map");
        id = values[id].split(/[\s.]+/g);
        for (let i = 0; i < id.length; i++)
          id[i] |= 0;
      } else if (Array.isArray(id)) {
        id = id.slice();
        for (let i = 0; i < id.length; i++)
          id[i] |= 0;
      }
      if (!Array.isArray(id)) {
        return this.reporter.error("objid() should be either array or string, got: " + JSON.stringify(id));
      }
      if (!relative) {
        if (id[1] >= 40)
          return this.reporter.error("Second objid identifier OOB");
        id.splice(0, 2, id[0] * 40 + id[1]);
      }
      let size = 0;
      for (let i = 0; i < id.length; i++) {
        let ident = id[i];
        for (size++; ident >= 128; ident >>= 7)
          size++;
      }
      const objid = Buffer2.alloc(size);
      let offset = objid.length - 1;
      for (let i = id.length - 1; i >= 0; i--) {
        let ident = id[i];
        objid[offset--] = ident & 127;
        while ((ident >>= 7) > 0)
          objid[offset--] = 128 | ident & 127;
      }
      return this._createEncoderBuffer(objid);
    };
    function two(num) {
      if (num < 10)
        return "0" + num;
      else
        return num;
    }
    DERNode.prototype._encodeTime = function encodeTime(time2, tag) {
      let str;
      const date2 = new Date(time2);
      if (tag === "gentime") {
        str = [
          two(date2.getUTCFullYear()),
          two(date2.getUTCMonth() + 1),
          two(date2.getUTCDate()),
          two(date2.getUTCHours()),
          two(date2.getUTCMinutes()),
          two(date2.getUTCSeconds()),
          "Z"
        ].join("");
      } else if (tag === "utctime") {
        str = [
          two(date2.getUTCFullYear() % 100),
          two(date2.getUTCMonth() + 1),
          two(date2.getUTCDate()),
          two(date2.getUTCHours()),
          two(date2.getUTCMinutes()),
          two(date2.getUTCSeconds()),
          "Z"
        ].join("");
      } else {
        this.reporter.error("Encoding " + tag + " time is not supported yet");
      }
      return this._encodeStr(str, "octstr");
    };
    DERNode.prototype._encodeNull = function encodeNull() {
      return this._createEncoderBuffer("");
    };
    DERNode.prototype._encodeInt = function encodeInt(num, values) {
      if (typeof num === "string") {
        if (!values)
          return this.reporter.error("String int or enum given, but no values map");
        if (!values.hasOwnProperty(num)) {
          return this.reporter.error("Values map doesn't contain: " + JSON.stringify(num));
        }
        num = values[num];
      }
      if (typeof num !== "number" && !Buffer2.isBuffer(num)) {
        const numArray = num.toArray();
        if (!num.sign && numArray[0] & 128) {
          numArray.unshift(0);
        }
        num = Buffer2.from(numArray);
      }
      if (Buffer2.isBuffer(num)) {
        let size2 = num.length;
        if (num.length === 0)
          size2++;
        const out2 = Buffer2.alloc(size2);
        num.copy(out2);
        if (num.length === 0)
          out2[0] = 0;
        return this._createEncoderBuffer(out2);
      }
      if (num < 128)
        return this._createEncoderBuffer(num);
      if (num < 256)
        return this._createEncoderBuffer([0, num]);
      let size = 1;
      for (let i = num; i >= 256; i >>= 8)
        size++;
      const out = new Array(size);
      for (let i = out.length - 1; i >= 0; i--) {
        out[i] = num & 255;
        num >>= 8;
      }
      if (out[0] & 128) {
        out.unshift(0);
      }
      return this._createEncoderBuffer(Buffer2.from(out));
    };
    DERNode.prototype._encodeBool = function encodeBool(value) {
      return this._createEncoderBuffer(value ? 255 : 0);
    };
    DERNode.prototype._use = function use(entity, obj) {
      if (typeof entity === "function")
        entity = entity(obj);
      return entity._getEncoder("der").tree;
    };
    DERNode.prototype._skipDefault = function skipDefault(dataBuffer, reporter, parent) {
      const state = this._baseState;
      let i;
      if (state["default"] === null)
        return false;
      const data = dataBuffer.join();
      if (state.defaultBuffer === void 0)
        state.defaultBuffer = this._encodeValue(state["default"], reporter, parent).join();
      if (data.length !== state.defaultBuffer.length)
        return false;
      for (i = 0; i < data.length; i++)
        if (data[i] !== state.defaultBuffer[i])
          return false;
      return true;
    };
    function encodeTag(tag, primitive, cls, reporter) {
      let res;
      if (tag === "seqof")
        tag = "seq";
      else if (tag === "setof")
        tag = "set";
      if (der.tagByName.hasOwnProperty(tag))
        res = der.tagByName[tag];
      else if (typeof tag === "number" && (tag | 0) === tag)
        res = tag;
      else
        return reporter.error("Unknown tag: " + tag);
      if (res >= 31)
        return reporter.error("Multi-octet tag encoding unsupported");
      if (!primitive)
        res |= 32;
      res |= der.tagClassByName[cls || "universal"] << 6;
      return res;
    }
  }
});

// node_modules/.pnpm/asn1.js@5.4.1/node_modules/asn1.js/lib/asn1/encoders/pem.js
var require_pem = __commonJS({
  "node_modules/.pnpm/asn1.js@5.4.1/node_modules/asn1.js/lib/asn1/encoders/pem.js"(exports, module) {
    "use strict";
    var inherits = require_inherits();
    var DEREncoder = require_der2();
    function PEMEncoder(entity) {
      DEREncoder.call(this, entity);
      this.enc = "pem";
    }
    inherits(PEMEncoder, DEREncoder);
    module.exports = PEMEncoder;
    PEMEncoder.prototype.encode = function encode(data, options) {
      const buf = DEREncoder.prototype.encode.call(this, data);
      const p = buf.toString("base64");
      const out = ["-----BEGIN " + options.label + "-----"];
      for (let i = 0; i < p.length; i += 64)
        out.push(p.slice(i, i + 64));
      out.push("-----END " + options.label + "-----");
      return out.join("\n");
    };
  }
});

// node_modules/.pnpm/asn1.js@5.4.1/node_modules/asn1.js/lib/asn1/encoders/index.js
var require_encoders = __commonJS({
  "node_modules/.pnpm/asn1.js@5.4.1/node_modules/asn1.js/lib/asn1/encoders/index.js"(exports) {
    "use strict";
    var encoders = exports;
    encoders.der = require_der2();
    encoders.pem = require_pem();
  }
});

// node_modules/.pnpm/asn1.js@5.4.1/node_modules/asn1.js/lib/asn1/decoders/der.js
var require_der3 = __commonJS({
  "node_modules/.pnpm/asn1.js@5.4.1/node_modules/asn1.js/lib/asn1/decoders/der.js"(exports, module) {
    "use strict";
    var inherits = require_inherits();
    var bignum = require_bn();
    var DecoderBuffer = require_buffer().DecoderBuffer;
    var Node = require_node();
    var der = require_der();
    function DERDecoder(entity) {
      this.enc = "der";
      this.name = entity.name;
      this.entity = entity;
      this.tree = new DERNode();
      this.tree._init(entity.body);
    }
    module.exports = DERDecoder;
    DERDecoder.prototype.decode = function decode(data, options) {
      if (!DecoderBuffer.isDecoderBuffer(data)) {
        data = new DecoderBuffer(data, options);
      }
      return this.tree._decode(data, options);
    };
    function DERNode(parent) {
      Node.call(this, "der", parent);
    }
    inherits(DERNode, Node);
    DERNode.prototype._peekTag = function peekTag(buffer, tag, any) {
      if (buffer.isEmpty())
        return false;
      const state = buffer.save();
      const decodedTag = derDecodeTag(buffer, 'Failed to peek tag: "' + tag + '"');
      if (buffer.isError(decodedTag))
        return decodedTag;
      buffer.restore(state);
      return decodedTag.tag === tag || decodedTag.tagStr === tag || decodedTag.tagStr + "of" === tag || any;
    };
    DERNode.prototype._decodeTag = function decodeTag(buffer, tag, any) {
      const decodedTag = derDecodeTag(
        buffer,
        'Failed to decode tag of "' + tag + '"'
      );
      if (buffer.isError(decodedTag))
        return decodedTag;
      let len = derDecodeLen(
        buffer,
        decodedTag.primitive,
        'Failed to get length of "' + tag + '"'
      );
      if (buffer.isError(len))
        return len;
      if (!any && decodedTag.tag !== tag && decodedTag.tagStr !== tag && decodedTag.tagStr + "of" !== tag) {
        return buffer.error('Failed to match tag: "' + tag + '"');
      }
      if (decodedTag.primitive || len !== null)
        return buffer.skip(len, 'Failed to match body of: "' + tag + '"');
      const state = buffer.save();
      const res = this._skipUntilEnd(
        buffer,
        'Failed to skip indefinite length body: "' + this.tag + '"'
      );
      if (buffer.isError(res))
        return res;
      len = buffer.offset - state.offset;
      buffer.restore(state);
      return buffer.skip(len, 'Failed to match body of: "' + tag + '"');
    };
    DERNode.prototype._skipUntilEnd = function skipUntilEnd(buffer, fail) {
      for (; ; ) {
        const tag = derDecodeTag(buffer, fail);
        if (buffer.isError(tag))
          return tag;
        const len = derDecodeLen(buffer, tag.primitive, fail);
        if (buffer.isError(len))
          return len;
        let res;
        if (tag.primitive || len !== null)
          res = buffer.skip(len);
        else
          res = this._skipUntilEnd(buffer, fail);
        if (buffer.isError(res))
          return res;
        if (tag.tagStr === "end")
          break;
      }
    };
    DERNode.prototype._decodeList = function decodeList(buffer, tag, decoder, options) {
      const result = [];
      while (!buffer.isEmpty()) {
        const possibleEnd = this._peekTag(buffer, "end");
        if (buffer.isError(possibleEnd))
          return possibleEnd;
        const res = decoder.decode(buffer, "der", options);
        if (buffer.isError(res) && possibleEnd)
          break;
        result.push(res);
      }
      return result;
    };
    DERNode.prototype._decodeStr = function decodeStr(buffer, tag) {
      if (tag === "bitstr") {
        const unused = buffer.readUInt8();
        if (buffer.isError(unused))
          return unused;
        return { unused, data: buffer.raw() };
      } else if (tag === "bmpstr") {
        const raw = buffer.raw();
        if (raw.length % 2 === 1)
          return buffer.error("Decoding of string type: bmpstr length mismatch");
        let str = "";
        for (let i = 0; i < raw.length / 2; i++) {
          str += String.fromCharCode(raw.readUInt16BE(i * 2));
        }
        return str;
      } else if (tag === "numstr") {
        const numstr = buffer.raw().toString("ascii");
        if (!this._isNumstr(numstr)) {
          return buffer.error("Decoding of string type: numstr unsupported characters");
        }
        return numstr;
      } else if (tag === "octstr") {
        return buffer.raw();
      } else if (tag === "objDesc") {
        return buffer.raw();
      } else if (tag === "printstr") {
        const printstr = buffer.raw().toString("ascii");
        if (!this._isPrintstr(printstr)) {
          return buffer.error("Decoding of string type: printstr unsupported characters");
        }
        return printstr;
      } else if (/str$/.test(tag)) {
        return buffer.raw().toString();
      } else {
        return buffer.error("Decoding of string type: " + tag + " unsupported");
      }
    };
    DERNode.prototype._decodeObjid = function decodeObjid(buffer, values, relative) {
      let result;
      const identifiers = [];
      let ident = 0;
      let subident = 0;
      while (!buffer.isEmpty()) {
        subident = buffer.readUInt8();
        ident <<= 7;
        ident |= subident & 127;
        if ((subident & 128) === 0) {
          identifiers.push(ident);
          ident = 0;
        }
      }
      if (subident & 128)
        identifiers.push(ident);
      const first = identifiers[0] / 40 | 0;
      const second = identifiers[0] % 40;
      if (relative)
        result = identifiers;
      else
        result = [first, second].concat(identifiers.slice(1));
      if (values) {
        let tmp = values[result.join(" ")];
        if (tmp === void 0)
          tmp = values[result.join(".")];
        if (tmp !== void 0)
          result = tmp;
      }
      return result;
    };
    DERNode.prototype._decodeTime = function decodeTime(buffer, tag) {
      const str = buffer.raw().toString();
      let year2;
      let mon;
      let day;
      let hour;
      let min;
      let sec;
      if (tag === "gentime") {
        year2 = str.slice(0, 4) | 0;
        mon = str.slice(4, 6) | 0;
        day = str.slice(6, 8) | 0;
        hour = str.slice(8, 10) | 0;
        min = str.slice(10, 12) | 0;
        sec = str.slice(12, 14) | 0;
      } else if (tag === "utctime") {
        year2 = str.slice(0, 2) | 0;
        mon = str.slice(2, 4) | 0;
        day = str.slice(4, 6) | 0;
        hour = str.slice(6, 8) | 0;
        min = str.slice(8, 10) | 0;
        sec = str.slice(10, 12) | 0;
        if (year2 < 70)
          year2 = 2e3 + year2;
        else
          year2 = 1900 + year2;
      } else {
        return buffer.error("Decoding " + tag + " time is not supported yet");
      }
      return Date.UTC(year2, mon - 1, day, hour, min, sec, 0);
    };
    DERNode.prototype._decodeNull = function decodeNull() {
      return null;
    };
    DERNode.prototype._decodeBool = function decodeBool(buffer) {
      const res = buffer.readUInt8();
      if (buffer.isError(res))
        return res;
      else
        return res !== 0;
    };
    DERNode.prototype._decodeInt = function decodeInt(buffer, values) {
      const raw = buffer.raw();
      let res = new bignum(raw);
      if (values)
        res = values[res.toString(10)] || res;
      return res;
    };
    DERNode.prototype._use = function use(entity, obj) {
      if (typeof entity === "function")
        entity = entity(obj);
      return entity._getDecoder("der").tree;
    };
    function derDecodeTag(buf, fail) {
      let tag = buf.readUInt8(fail);
      if (buf.isError(tag))
        return tag;
      const cls = der.tagClass[tag >> 6];
      const primitive = (tag & 32) === 0;
      if ((tag & 31) === 31) {
        let oct = tag;
        tag = 0;
        while ((oct & 128) === 128) {
          oct = buf.readUInt8(fail);
          if (buf.isError(oct))
            return oct;
          tag <<= 7;
          tag |= oct & 127;
        }
      } else {
        tag &= 31;
      }
      const tagStr = der.tag[tag];
      return {
        cls,
        primitive,
        tag,
        tagStr
      };
    }
    function derDecodeLen(buf, primitive, fail) {
      let len = buf.readUInt8(fail);
      if (buf.isError(len))
        return len;
      if (!primitive && len === 128)
        return null;
      if ((len & 128) === 0) {
        return len;
      }
      const num = len & 127;
      if (num > 4)
        return buf.error("length octect is too long");
      len = 0;
      for (let i = 0; i < num; i++) {
        len <<= 8;
        const j = buf.readUInt8(fail);
        if (buf.isError(j))
          return j;
        len |= j;
      }
      return len;
    }
  }
});

// node_modules/.pnpm/asn1.js@5.4.1/node_modules/asn1.js/lib/asn1/decoders/pem.js
var require_pem2 = __commonJS({
  "node_modules/.pnpm/asn1.js@5.4.1/node_modules/asn1.js/lib/asn1/decoders/pem.js"(exports, module) {
    "use strict";
    var inherits = require_inherits();
    var Buffer2 = require_safer().Buffer;
    var DERDecoder = require_der3();
    function PEMDecoder(entity) {
      DERDecoder.call(this, entity);
      this.enc = "pem";
    }
    inherits(PEMDecoder, DERDecoder);
    module.exports = PEMDecoder;
    PEMDecoder.prototype.decode = function decode(data, options) {
      const lines = data.toString().split(/[\r\n]+/g);
      const label = options.label.toUpperCase();
      const re = /^-----(BEGIN|END) ([^-]+)-----$/;
      let start = -1;
      let end = -1;
      for (let i = 0; i < lines.length; i++) {
        const match = lines[i].match(re);
        if (match === null)
          continue;
        if (match[2] !== label)
          continue;
        if (start === -1) {
          if (match[1] !== "BEGIN")
            break;
          start = i;
        } else {
          if (match[1] !== "END")
            break;
          end = i;
          break;
        }
      }
      if (start === -1 || end === -1)
        throw new Error("PEM section not found for: " + label);
      const base64 = lines.slice(start + 1, end).join("");
      base64.replace(/[^a-z0-9+/=]+/gi, "");
      const input = Buffer2.from(base64, "base64");
      return DERDecoder.prototype.decode.call(this, input, options);
    };
  }
});

// node_modules/.pnpm/asn1.js@5.4.1/node_modules/asn1.js/lib/asn1/decoders/index.js
var require_decoders = __commonJS({
  "node_modules/.pnpm/asn1.js@5.4.1/node_modules/asn1.js/lib/asn1/decoders/index.js"(exports) {
    "use strict";
    var decoders = exports;
    decoders.der = require_der3();
    decoders.pem = require_pem2();
  }
});

// node_modules/.pnpm/asn1.js@5.4.1/node_modules/asn1.js/lib/asn1/api.js
var require_api = __commonJS({
  "node_modules/.pnpm/asn1.js@5.4.1/node_modules/asn1.js/lib/asn1/api.js"(exports) {
    "use strict";
    var encoders = require_encoders();
    var decoders = require_decoders();
    var inherits = require_inherits();
    var api = exports;
    api.define = function define(name, body) {
      return new Entity(name, body);
    };
    function Entity(name, body) {
      this.name = name;
      this.body = body;
      this.decoders = {};
      this.encoders = {};
    }
    Entity.prototype._createNamed = function createNamed(Base) {
      const name = this.name;
      function Generated(entity) {
        this._initNamed(entity, name);
      }
      inherits(Generated, Base);
      Generated.prototype._initNamed = function _initNamed(entity, name2) {
        Base.call(this, entity, name2);
      };
      return new Generated(this);
    };
    Entity.prototype._getDecoder = function _getDecoder(enc) {
      enc = enc || "der";
      if (!this.decoders.hasOwnProperty(enc))
        this.decoders[enc] = this._createNamed(decoders[enc]);
      return this.decoders[enc];
    };
    Entity.prototype.decode = function decode(data, enc, options) {
      return this._getDecoder(enc).decode(data, options);
    };
    Entity.prototype._getEncoder = function _getEncoder(enc) {
      enc = enc || "der";
      if (!this.encoders.hasOwnProperty(enc))
        this.encoders[enc] = this._createNamed(encoders[enc]);
      return this.encoders[enc];
    };
    Entity.prototype.encode = function encode(data, enc, reporter) {
      return this._getEncoder(enc).encode(data, reporter);
    };
  }
});

// node_modules/.pnpm/asn1.js@5.4.1/node_modules/asn1.js/lib/asn1/base/index.js
var require_base = __commonJS({
  "node_modules/.pnpm/asn1.js@5.4.1/node_modules/asn1.js/lib/asn1/base/index.js"(exports) {
    "use strict";
    var base = exports;
    base.Reporter = require_reporter().Reporter;
    base.DecoderBuffer = require_buffer().DecoderBuffer;
    base.EncoderBuffer = require_buffer().EncoderBuffer;
    base.Node = require_node();
  }
});

// node_modules/.pnpm/asn1.js@5.4.1/node_modules/asn1.js/lib/asn1/constants/index.js
var require_constants = __commonJS({
  "node_modules/.pnpm/asn1.js@5.4.1/node_modules/asn1.js/lib/asn1/constants/index.js"(exports) {
    "use strict";
    var constants = exports;
    constants._reverse = function reverse(map) {
      const res = {};
      Object.keys(map).forEach(function(key) {
        if ((key | 0) == key)
          key = key | 0;
        const value = map[key];
        res[value] = key;
      });
      return res;
    };
    constants.der = require_der();
  }
});

// node_modules/.pnpm/asn1.js@5.4.1/node_modules/asn1.js/lib/asn1.js
var require_asn1 = __commonJS({
  "node_modules/.pnpm/asn1.js@5.4.1/node_modules/asn1.js/lib/asn1.js"(exports) {
    "use strict";
    var asn1 = exports;
    asn1.bignum = require_bn();
    asn1.define = require_api().define;
    asn1.base = require_base();
    asn1.constants = require_constants();
    asn1.decoders = require_decoders();
    asn1.encoders = require_encoders();
  }
});

// node_modules/.pnpm/safe-buffer@5.2.1/node_modules/safe-buffer/index.js
var require_safe_buffer = __commonJS({
  "node_modules/.pnpm/safe-buffer@5.2.1/node_modules/safe-buffer/index.js"(exports, module) {
    var buffer = __require("buffer");
    var Buffer2 = buffer.Buffer;
    function copyProps(src, dst) {
      for (var key in src) {
        dst[key] = src[key];
      }
    }
    if (Buffer2.from && Buffer2.alloc && Buffer2.allocUnsafe && Buffer2.allocUnsafeSlow) {
      module.exports = buffer;
    } else {
      copyProps(buffer, exports);
      exports.Buffer = SafeBuffer;
    }
    function SafeBuffer(arg, encodingOrOffset, length) {
      return Buffer2(arg, encodingOrOffset, length);
    }
    SafeBuffer.prototype = Object.create(Buffer2.prototype);
    copyProps(Buffer2, SafeBuffer);
    SafeBuffer.from = function(arg, encodingOrOffset, length) {
      if (typeof arg === "number") {
        throw new TypeError("Argument must not be a number");
      }
      return Buffer2(arg, encodingOrOffset, length);
    };
    SafeBuffer.alloc = function(size, fill, encoding) {
      if (typeof size !== "number") {
        throw new TypeError("Argument must be a number");
      }
      var buf = Buffer2(size);
      if (fill !== void 0) {
        if (typeof encoding === "string") {
          buf.fill(fill, encoding);
        } else {
          buf.fill(fill);
        }
      } else {
        buf.fill(0);
      }
      return buf;
    };
    SafeBuffer.allocUnsafe = function(size) {
      if (typeof size !== "number") {
        throw new TypeError("Argument must be a number");
      }
      return Buffer2(size);
    };
    SafeBuffer.allocUnsafeSlow = function(size) {
      if (typeof size !== "number") {
        throw new TypeError("Argument must be a number");
      }
      return buffer.SlowBuffer(size);
    };
  }
});

// node_modules/.pnpm/jws@4.0.1/node_modules/jws/lib/data-stream.js
var require_data_stream = __commonJS({
  "node_modules/.pnpm/jws@4.0.1/node_modules/jws/lib/data-stream.js"(exports, module) {
    var Buffer2 = require_safe_buffer().Buffer;
    var Stream = __require("stream");
    var util2 = __require("util");
    function DataStream(data) {
      this.buffer = null;
      this.writable = true;
      this.readable = true;
      if (!data) {
        this.buffer = Buffer2.alloc(0);
        return this;
      }
      if (typeof data.pipe === "function") {
        this.buffer = Buffer2.alloc(0);
        data.pipe(this);
        return this;
      }
      if (data.length || typeof data === "object") {
        this.buffer = data;
        this.writable = false;
        process.nextTick(function() {
          this.emit("end", data);
          this.readable = false;
          this.emit("close");
        }.bind(this));
        return this;
      }
      throw new TypeError("Unexpected data type (" + typeof data + ")");
    }
    util2.inherits(DataStream, Stream);
    DataStream.prototype.write = function write(data) {
      this.buffer = Buffer2.concat([this.buffer, Buffer2.from(data)]);
      this.emit("data", data);
    };
    DataStream.prototype.end = function end(data) {
      if (data)
        this.write(data);
      this.emit("end", data);
      this.emit("close");
      this.writable = false;
      this.readable = false;
    };
    module.exports = DataStream;
  }
});

// node_modules/.pnpm/ecdsa-sig-formatter@1.0.11/node_modules/ecdsa-sig-formatter/src/param-bytes-for-alg.js
var require_param_bytes_for_alg = __commonJS({
  "node_modules/.pnpm/ecdsa-sig-formatter@1.0.11/node_modules/ecdsa-sig-formatter/src/param-bytes-for-alg.js"(exports, module) {
    "use strict";
    function getParamSize(keySize) {
      var result = (keySize / 8 | 0) + (keySize % 8 === 0 ? 0 : 1);
      return result;
    }
    var paramBytesForAlg = {
      ES256: getParamSize(256),
      ES384: getParamSize(384),
      ES512: getParamSize(521)
    };
    function getParamBytesForAlg(alg) {
      var paramBytes = paramBytesForAlg[alg];
      if (paramBytes) {
        return paramBytes;
      }
      throw new Error('Unknown algorithm "' + alg + '"');
    }
    module.exports = getParamBytesForAlg;
  }
});

// node_modules/.pnpm/ecdsa-sig-formatter@1.0.11/node_modules/ecdsa-sig-formatter/src/ecdsa-sig-formatter.js
var require_ecdsa_sig_formatter = __commonJS({
  "node_modules/.pnpm/ecdsa-sig-formatter@1.0.11/node_modules/ecdsa-sig-formatter/src/ecdsa-sig-formatter.js"(exports, module) {
    "use strict";
    var Buffer2 = require_safe_buffer().Buffer;
    var getParamBytesForAlg = require_param_bytes_for_alg();
    var MAX_OCTET = 128;
    var CLASS_UNIVERSAL = 0;
    var PRIMITIVE_BIT = 32;
    var TAG_SEQ = 16;
    var TAG_INT = 2;
    var ENCODED_TAG_SEQ = TAG_SEQ | PRIMITIVE_BIT | CLASS_UNIVERSAL << 6;
    var ENCODED_TAG_INT = TAG_INT | CLASS_UNIVERSAL << 6;
    function base64Url(base64) {
      return base64.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
    }
    function signatureAsBuffer(signature) {
      if (Buffer2.isBuffer(signature)) {
        return signature;
      } else if ("string" === typeof signature) {
        return Buffer2.from(signature, "base64");
      }
      throw new TypeError("ECDSA signature must be a Base64 string or a Buffer");
    }
    function derToJose(signature, alg) {
      signature = signatureAsBuffer(signature);
      var paramBytes = getParamBytesForAlg(alg);
      var maxEncodedParamLength = paramBytes + 1;
      var inputLength = signature.length;
      var offset = 0;
      if (signature[offset++] !== ENCODED_TAG_SEQ) {
        throw new Error('Could not find expected "seq"');
      }
      var seqLength = signature[offset++];
      if (seqLength === (MAX_OCTET | 1)) {
        seqLength = signature[offset++];
      }
      if (inputLength - offset < seqLength) {
        throw new Error('"seq" specified length of "' + seqLength + '", only "' + (inputLength - offset) + '" remaining');
      }
      if (signature[offset++] !== ENCODED_TAG_INT) {
        throw new Error('Could not find expected "int" for "r"');
      }
      var rLength = signature[offset++];
      if (inputLength - offset - 2 < rLength) {
        throw new Error('"r" specified length of "' + rLength + '", only "' + (inputLength - offset - 2) + '" available');
      }
      if (maxEncodedParamLength < rLength) {
        throw new Error('"r" specified length of "' + rLength + '", max of "' + maxEncodedParamLength + '" is acceptable');
      }
      var rOffset = offset;
      offset += rLength;
      if (signature[offset++] !== ENCODED_TAG_INT) {
        throw new Error('Could not find expected "int" for "s"');
      }
      var sLength = signature[offset++];
      if (inputLength - offset !== sLength) {
        throw new Error('"s" specified length of "' + sLength + '", expected "' + (inputLength - offset) + '"');
      }
      if (maxEncodedParamLength < sLength) {
        throw new Error('"s" specified length of "' + sLength + '", max of "' + maxEncodedParamLength + '" is acceptable');
      }
      var sOffset = offset;
      offset += sLength;
      if (offset !== inputLength) {
        throw new Error('Expected to consume entire buffer, but "' + (inputLength - offset) + '" bytes remain');
      }
      var rPadding = paramBytes - rLength, sPadding = paramBytes - sLength;
      var dst = Buffer2.allocUnsafe(rPadding + rLength + sPadding + sLength);
      for (offset = 0; offset < rPadding; ++offset) {
        dst[offset] = 0;
      }
      signature.copy(dst, offset, rOffset + Math.max(-rPadding, 0), rOffset + rLength);
      offset = paramBytes;
      for (var o = offset; offset < o + sPadding; ++offset) {
        dst[offset] = 0;
      }
      signature.copy(dst, offset, sOffset + Math.max(-sPadding, 0), sOffset + sLength);
      dst = dst.toString("base64");
      dst = base64Url(dst);
      return dst;
    }
    function countPadding(buf, start, stop) {
      var padding = 0;
      while (start + padding < stop && buf[start + padding] === 0) {
        ++padding;
      }
      var needsSign = buf[start + padding] >= MAX_OCTET;
      if (needsSign) {
        --padding;
      }
      return padding;
    }
    function joseToDer(signature, alg) {
      signature = signatureAsBuffer(signature);
      var paramBytes = getParamBytesForAlg(alg);
      var signatureBytes = signature.length;
      if (signatureBytes !== paramBytes * 2) {
        throw new TypeError('"' + alg + '" signatures must be "' + paramBytes * 2 + '" bytes, saw "' + signatureBytes + '"');
      }
      var rPadding = countPadding(signature, 0, paramBytes);
      var sPadding = countPadding(signature, paramBytes, signature.length);
      var rLength = paramBytes - rPadding;
      var sLength = paramBytes - sPadding;
      var rsBytes = 1 + 1 + rLength + 1 + 1 + sLength;
      var shortLength = rsBytes < MAX_OCTET;
      var dst = Buffer2.allocUnsafe((shortLength ? 2 : 3) + rsBytes);
      var offset = 0;
      dst[offset++] = ENCODED_TAG_SEQ;
      if (shortLength) {
        dst[offset++] = rsBytes;
      } else {
        dst[offset++] = MAX_OCTET | 1;
        dst[offset++] = rsBytes & 255;
      }
      dst[offset++] = ENCODED_TAG_INT;
      dst[offset++] = rLength;
      if (rPadding < 0) {
        dst[offset++] = 0;
        offset += signature.copy(dst, offset, 0, paramBytes);
      } else {
        offset += signature.copy(dst, offset, rPadding, paramBytes);
      }
      dst[offset++] = ENCODED_TAG_INT;
      dst[offset++] = sLength;
      if (sPadding < 0) {
        dst[offset++] = 0;
        signature.copy(dst, offset, paramBytes);
      } else {
        signature.copy(dst, offset, paramBytes + sPadding);
      }
      return dst;
    }
    module.exports = {
      derToJose,
      joseToDer
    };
  }
});

// node_modules/.pnpm/buffer-equal-constant-time@1.0.1/node_modules/buffer-equal-constant-time/index.js
var require_buffer_equal_constant_time = __commonJS({
  "node_modules/.pnpm/buffer-equal-constant-time@1.0.1/node_modules/buffer-equal-constant-time/index.js"(exports, module) {
    "use strict";
    var Buffer2 = __require("buffer").Buffer;
    var SlowBuffer = __require("buffer").SlowBuffer;
    module.exports = bufferEq;
    function bufferEq(a, b) {
      if (!Buffer2.isBuffer(a) || !Buffer2.isBuffer(b)) {
        return false;
      }
      if (a.length !== b.length) {
        return false;
      }
      var c = 0;
      for (var i = 0; i < a.length; i++) {
        c |= a[i] ^ b[i];
      }
      return c === 0;
    }
    bufferEq.install = function() {
      Buffer2.prototype.equal = SlowBuffer.prototype.equal = function equal(that) {
        return bufferEq(this, that);
      };
    };
    var origBufEqual = Buffer2.prototype.equal;
    var origSlowBufEqual = SlowBuffer.prototype.equal;
    bufferEq.restore = function() {
      Buffer2.prototype.equal = origBufEqual;
      SlowBuffer.prototype.equal = origSlowBufEqual;
    };
  }
});

// node_modules/.pnpm/jwa@2.0.1/node_modules/jwa/index.js
var require_jwa = __commonJS({
  "node_modules/.pnpm/jwa@2.0.1/node_modules/jwa/index.js"(exports, module) {
    var Buffer2 = require_safe_buffer().Buffer;
    var crypto2 = __require("crypto");
    var formatEcdsa = require_ecdsa_sig_formatter();
    var util2 = __require("util");
    var MSG_INVALID_ALGORITHM = '"%s" is not a valid algorithm.\n  Supported algorithms are:\n  "HS256", "HS384", "HS512", "RS256", "RS384", "RS512", "PS256", "PS384", "PS512", "ES256", "ES384", "ES512" and "none".';
    var MSG_INVALID_SECRET = "secret must be a string or buffer";
    var MSG_INVALID_VERIFIER_KEY = "key must be a string or a buffer";
    var MSG_INVALID_SIGNER_KEY = "key must be a string, a buffer or an object";
    var supportsKeyObjects = typeof crypto2.createPublicKey === "function";
    if (supportsKeyObjects) {
      MSG_INVALID_VERIFIER_KEY += " or a KeyObject";
      MSG_INVALID_SECRET += "or a KeyObject";
    }
    function checkIsPublicKey(key) {
      if (Buffer2.isBuffer(key)) {
        return;
      }
      if (typeof key === "string") {
        return;
      }
      if (!supportsKeyObjects) {
        throw typeError(MSG_INVALID_VERIFIER_KEY);
      }
      if (typeof key !== "object") {
        throw typeError(MSG_INVALID_VERIFIER_KEY);
      }
      if (typeof key.type !== "string") {
        throw typeError(MSG_INVALID_VERIFIER_KEY);
      }
      if (typeof key.asymmetricKeyType !== "string") {
        throw typeError(MSG_INVALID_VERIFIER_KEY);
      }
      if (typeof key.export !== "function") {
        throw typeError(MSG_INVALID_VERIFIER_KEY);
      }
    }
    function checkIsPrivateKey(key) {
      if (Buffer2.isBuffer(key)) {
        return;
      }
      if (typeof key === "string") {
        return;
      }
      if (typeof key === "object") {
        return;
      }
      throw typeError(MSG_INVALID_SIGNER_KEY);
    }
    function checkIsSecretKey(key) {
      if (Buffer2.isBuffer(key)) {
        return;
      }
      if (typeof key === "string") {
        return key;
      }
      if (!supportsKeyObjects) {
        throw typeError(MSG_INVALID_SECRET);
      }
      if (typeof key !== "object") {
        throw typeError(MSG_INVALID_SECRET);
      }
      if (key.type !== "secret") {
        throw typeError(MSG_INVALID_SECRET);
      }
      if (typeof key.export !== "function") {
        throw typeError(MSG_INVALID_SECRET);
      }
    }
    function fromBase64(base64) {
      return base64.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
    }
    function toBase64(base64url) {
      base64url = base64url.toString();
      var padding = 4 - base64url.length % 4;
      if (padding !== 4) {
        for (var i = 0; i < padding; ++i) {
          base64url += "=";
        }
      }
      return base64url.replace(/\-/g, "+").replace(/_/g, "/");
    }
    function typeError(template) {
      var args = [].slice.call(arguments, 1);
      var errMsg = util2.format.bind(util2, template).apply(null, args);
      return new TypeError(errMsg);
    }
    function bufferOrString(obj) {
      return Buffer2.isBuffer(obj) || typeof obj === "string";
    }
    function normalizeInput(thing) {
      if (!bufferOrString(thing))
        thing = JSON.stringify(thing);
      return thing;
    }
    function createHmacSigner(bits) {
      return function sign(thing, secret) {
        checkIsSecretKey(secret);
        thing = normalizeInput(thing);
        var hmac = crypto2.createHmac("sha" + bits, secret);
        var sig = (hmac.update(thing), hmac.digest("base64"));
        return fromBase64(sig);
      };
    }
    var bufferEqual;
    var timingSafeEqual3 = "timingSafeEqual" in crypto2 ? function timingSafeEqual4(a, b) {
      if (a.byteLength !== b.byteLength) {
        return false;
      }
      return crypto2.timingSafeEqual(a, b);
    } : function timingSafeEqual4(a, b) {
      if (!bufferEqual) {
        bufferEqual = require_buffer_equal_constant_time();
      }
      return bufferEqual(a, b);
    };
    function createHmacVerifier(bits) {
      return function verify(thing, signature, secret) {
        var computedSig = createHmacSigner(bits)(thing, secret);
        return timingSafeEqual3(Buffer2.from(signature), Buffer2.from(computedSig));
      };
    }
    function createKeySigner(bits) {
      return function sign(thing, privateKey) {
        checkIsPrivateKey(privateKey);
        thing = normalizeInput(thing);
        var signer = crypto2.createSign("RSA-SHA" + bits);
        var sig = (signer.update(thing), signer.sign(privateKey, "base64"));
        return fromBase64(sig);
      };
    }
    function createKeyVerifier(bits) {
      return function verify(thing, signature, publicKey) {
        checkIsPublicKey(publicKey);
        thing = normalizeInput(thing);
        signature = toBase64(signature);
        var verifier = crypto2.createVerify("RSA-SHA" + bits);
        verifier.update(thing);
        return verifier.verify(publicKey, signature, "base64");
      };
    }
    function createPSSKeySigner(bits) {
      return function sign(thing, privateKey) {
        checkIsPrivateKey(privateKey);
        thing = normalizeInput(thing);
        var signer = crypto2.createSign("RSA-SHA" + bits);
        var sig = (signer.update(thing), signer.sign({
          key: privateKey,
          padding: crypto2.constants.RSA_PKCS1_PSS_PADDING,
          saltLength: crypto2.constants.RSA_PSS_SALTLEN_DIGEST
        }, "base64"));
        return fromBase64(sig);
      };
    }
    function createPSSKeyVerifier(bits) {
      return function verify(thing, signature, publicKey) {
        checkIsPublicKey(publicKey);
        thing = normalizeInput(thing);
        signature = toBase64(signature);
        var verifier = crypto2.createVerify("RSA-SHA" + bits);
        verifier.update(thing);
        return verifier.verify({
          key: publicKey,
          padding: crypto2.constants.RSA_PKCS1_PSS_PADDING,
          saltLength: crypto2.constants.RSA_PSS_SALTLEN_DIGEST
        }, signature, "base64");
      };
    }
    function createECDSASigner(bits) {
      var inner = createKeySigner(bits);
      return function sign() {
        var signature = inner.apply(null, arguments);
        signature = formatEcdsa.derToJose(signature, "ES" + bits);
        return signature;
      };
    }
    function createECDSAVerifer(bits) {
      var inner = createKeyVerifier(bits);
      return function verify(thing, signature, publicKey) {
        signature = formatEcdsa.joseToDer(signature, "ES" + bits).toString("base64");
        var result = inner(thing, signature, publicKey);
        return result;
      };
    }
    function createNoneSigner() {
      return function sign() {
        return "";
      };
    }
    function createNoneVerifier() {
      return function verify(thing, signature) {
        return signature === "";
      };
    }
    module.exports = function jwa(algorithm) {
      var signerFactories = {
        hs: createHmacSigner,
        rs: createKeySigner,
        ps: createPSSKeySigner,
        es: createECDSASigner,
        none: createNoneSigner
      };
      var verifierFactories = {
        hs: createHmacVerifier,
        rs: createKeyVerifier,
        ps: createPSSKeyVerifier,
        es: createECDSAVerifer,
        none: createNoneVerifier
      };
      var match = algorithm.match(/^(RS|PS|ES|HS)(256|384|512)$|^(none)$/);
      if (!match)
        throw typeError(MSG_INVALID_ALGORITHM, algorithm);
      var algo = (match[1] || match[3]).toLowerCase();
      var bits = match[2];
      return {
        sign: signerFactories[algo](bits),
        verify: verifierFactories[algo](bits)
      };
    };
  }
});

// node_modules/.pnpm/jws@4.0.1/node_modules/jws/lib/tostring.js
var require_tostring = __commonJS({
  "node_modules/.pnpm/jws@4.0.1/node_modules/jws/lib/tostring.js"(exports, module) {
    var Buffer2 = __require("buffer").Buffer;
    module.exports = function toString(obj) {
      if (typeof obj === "string")
        return obj;
      if (typeof obj === "number" || Buffer2.isBuffer(obj))
        return obj.toString();
      return JSON.stringify(obj);
    };
  }
});

// node_modules/.pnpm/jws@4.0.1/node_modules/jws/lib/sign-stream.js
var require_sign_stream = __commonJS({
  "node_modules/.pnpm/jws@4.0.1/node_modules/jws/lib/sign-stream.js"(exports, module) {
    var Buffer2 = require_safe_buffer().Buffer;
    var DataStream = require_data_stream();
    var jwa = require_jwa();
    var Stream = __require("stream");
    var toString = require_tostring();
    var util2 = __require("util");
    function base64url(string, encoding) {
      return Buffer2.from(string, encoding).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
    }
    function jwsSecuredInput(header, payload, encoding) {
      encoding = encoding || "utf8";
      var encodedHeader = base64url(toString(header), "binary");
      var encodedPayload = base64url(toString(payload), encoding);
      return util2.format("%s.%s", encodedHeader, encodedPayload);
    }
    function jwsSign(opts) {
      var header = opts.header;
      var payload = opts.payload;
      var secretOrKey = opts.secret || opts.privateKey;
      var encoding = opts.encoding;
      var algo = jwa(header.alg);
      var securedInput = jwsSecuredInput(header, payload, encoding);
      var signature = algo.sign(securedInput, secretOrKey);
      return util2.format("%s.%s", securedInput, signature);
    }
    function SignStream(opts) {
      var secret = opts.secret;
      secret = secret == null ? opts.privateKey : secret;
      secret = secret == null ? opts.key : secret;
      if (/^hs/i.test(opts.header.alg) === true && secret == null) {
        throw new TypeError("secret must be a string or buffer or a KeyObject");
      }
      var secretStream = new DataStream(secret);
      this.readable = true;
      this.header = opts.header;
      this.encoding = opts.encoding;
      this.secret = this.privateKey = this.key = secretStream;
      this.payload = new DataStream(opts.payload);
      this.secret.once("close", function() {
        if (!this.payload.writable && this.readable)
          this.sign();
      }.bind(this));
      this.payload.once("close", function() {
        if (!this.secret.writable && this.readable)
          this.sign();
      }.bind(this));
    }
    util2.inherits(SignStream, Stream);
    SignStream.prototype.sign = function sign() {
      try {
        var signature = jwsSign({
          header: this.header,
          payload: this.payload.buffer,
          secret: this.secret.buffer,
          encoding: this.encoding
        });
        this.emit("done", signature);
        this.emit("data", signature);
        this.emit("end");
        this.readable = false;
        return signature;
      } catch (e) {
        this.readable = false;
        this.emit("error", e);
        this.emit("close");
      }
    };
    SignStream.sign = jwsSign;
    module.exports = SignStream;
  }
});

// node_modules/.pnpm/jws@4.0.1/node_modules/jws/lib/verify-stream.js
var require_verify_stream = __commonJS({
  "node_modules/.pnpm/jws@4.0.1/node_modules/jws/lib/verify-stream.js"(exports, module) {
    var Buffer2 = require_safe_buffer().Buffer;
    var DataStream = require_data_stream();
    var jwa = require_jwa();
    var Stream = __require("stream");
    var toString = require_tostring();
    var util2 = __require("util");
    var JWS_REGEX = /^[a-zA-Z0-9\-_]+?\.[a-zA-Z0-9\-_]+?\.([a-zA-Z0-9\-_]+)?$/;
    function isObject(thing) {
      return Object.prototype.toString.call(thing) === "[object Object]";
    }
    function safeJsonParse(thing) {
      if (isObject(thing))
        return thing;
      try {
        return JSON.parse(thing);
      } catch (e) {
        return void 0;
      }
    }
    function headerFromJWS(jwsSig) {
      var encodedHeader = jwsSig.split(".", 1)[0];
      return safeJsonParse(Buffer2.from(encodedHeader, "base64").toString("binary"));
    }
    function securedInputFromJWS(jwsSig) {
      return jwsSig.split(".", 2).join(".");
    }
    function signatureFromJWS(jwsSig) {
      return jwsSig.split(".")[2];
    }
    function payloadFromJWS(jwsSig, encoding) {
      encoding = encoding || "utf8";
      var payload = jwsSig.split(".")[1];
      return Buffer2.from(payload, "base64").toString(encoding);
    }
    function isValidJws(string) {
      return JWS_REGEX.test(string) && !!headerFromJWS(string);
    }
    function jwsVerify(jwsSig, algorithm, secretOrKey) {
      if (!algorithm) {
        var err = new Error("Missing algorithm parameter for jws.verify");
        err.code = "MISSING_ALGORITHM";
        throw err;
      }
      jwsSig = toString(jwsSig);
      var signature = signatureFromJWS(jwsSig);
      var securedInput = securedInputFromJWS(jwsSig);
      var algo = jwa(algorithm);
      return algo.verify(securedInput, signature, secretOrKey);
    }
    function jwsDecode(jwsSig, opts) {
      opts = opts || {};
      jwsSig = toString(jwsSig);
      if (!isValidJws(jwsSig))
        return null;
      var header = headerFromJWS(jwsSig);
      if (!header)
        return null;
      var payload = payloadFromJWS(jwsSig);
      if (header.typ === "JWT" || opts.json)
        payload = JSON.parse(payload, opts.encoding);
      return {
        header,
        payload,
        signature: signatureFromJWS(jwsSig)
      };
    }
    function VerifyStream(opts) {
      opts = opts || {};
      var secretOrKey = opts.secret;
      secretOrKey = secretOrKey == null ? opts.publicKey : secretOrKey;
      secretOrKey = secretOrKey == null ? opts.key : secretOrKey;
      if (/^hs/i.test(opts.algorithm) === true && secretOrKey == null) {
        throw new TypeError("secret must be a string or buffer or a KeyObject");
      }
      var secretStream = new DataStream(secretOrKey);
      this.readable = true;
      this.algorithm = opts.algorithm;
      this.encoding = opts.encoding;
      this.secret = this.publicKey = this.key = secretStream;
      this.signature = new DataStream(opts.signature);
      this.secret.once("close", function() {
        if (!this.signature.writable && this.readable)
          this.verify();
      }.bind(this));
      this.signature.once("close", function() {
        if (!this.secret.writable && this.readable)
          this.verify();
      }.bind(this));
    }
    util2.inherits(VerifyStream, Stream);
    VerifyStream.prototype.verify = function verify() {
      try {
        var valid = jwsVerify(this.signature.buffer, this.algorithm, this.key.buffer);
        var obj = jwsDecode(this.signature.buffer, this.encoding);
        this.emit("done", valid, obj);
        this.emit("data", valid);
        this.emit("end");
        this.readable = false;
        return valid;
      } catch (e) {
        this.readable = false;
        this.emit("error", e);
        this.emit("close");
      }
    };
    VerifyStream.decode = jwsDecode;
    VerifyStream.isValid = isValidJws;
    VerifyStream.verify = jwsVerify;
    module.exports = VerifyStream;
  }
});

// node_modules/.pnpm/jws@4.0.1/node_modules/jws/index.js
var require_jws = __commonJS({
  "node_modules/.pnpm/jws@4.0.1/node_modules/jws/index.js"(exports) {
    var SignStream = require_sign_stream();
    var VerifyStream = require_verify_stream();
    var ALGORITHMS = [
      "HS256",
      "HS384",
      "HS512",
      "RS256",
      "RS384",
      "RS512",
      "PS256",
      "PS384",
      "PS512",
      "ES256",
      "ES384",
      "ES512"
    ];
    exports.ALGORITHMS = ALGORITHMS;
    exports.sign = SignStream.sign;
    exports.verify = VerifyStream.verify;
    exports.decode = VerifyStream.decode;
    exports.isValid = VerifyStream.isValid;
    exports.createSign = function createSign(opts) {
      return new SignStream(opts);
    };
    exports.createVerify = function createVerify(opts) {
      return new VerifyStream(opts);
    };
  }
});

// node_modules/.pnpm/web-push@3.6.7/node_modules/web-push/src/web-push-constants.js
var require_web_push_constants = __commonJS({
  "node_modules/.pnpm/web-push@3.6.7/node_modules/web-push/src/web-push-constants.js"(exports, module) {
    "use strict";
    var WebPushConstants = {};
    WebPushConstants.supportedContentEncodings = {
      AES_GCM: "aesgcm",
      AES_128_GCM: "aes128gcm"
    };
    WebPushConstants.supportedUrgency = {
      VERY_LOW: "very-low",
      LOW: "low",
      NORMAL: "normal",
      HIGH: "high"
    };
    module.exports = WebPushConstants;
  }
});

// node_modules/.pnpm/web-push@3.6.7/node_modules/web-push/src/urlsafe-base64-helper.js
var require_urlsafe_base64_helper = __commonJS({
  "node_modules/.pnpm/web-push@3.6.7/node_modules/web-push/src/urlsafe-base64-helper.js"(exports, module) {
    "use strict";
    function validate(base64) {
      return /^[A-Za-z0-9\-_]+$/.test(base64);
    }
    module.exports = {
      validate
    };
  }
});

// node_modules/.pnpm/web-push@3.6.7/node_modules/web-push/src/vapid-helper.js
var require_vapid_helper = __commonJS({
  "node_modules/.pnpm/web-push@3.6.7/node_modules/web-push/src/vapid-helper.js"(exports, module) {
    "use strict";
    var crypto2 = __require("crypto");
    var asn1 = require_asn1();
    var jws = require_jws();
    var { URL: URL2 } = __require("url");
    var WebPushConstants = require_web_push_constants();
    var urlBase64Helper = require_urlsafe_base64_helper();
    var DEFAULT_EXPIRATION_SECONDS = 12 * 60 * 60;
    var MAX_EXPIRATION_SECONDS = 24 * 60 * 60;
    var ECPrivateKeyASN = asn1.define("ECPrivateKey", function() {
      this.seq().obj(
        this.key("version").int(),
        this.key("privateKey").octstr(),
        this.key("parameters").explicit(0).objid().optional(),
        this.key("publicKey").explicit(1).bitstr().optional()
      );
    });
    function toPEM(key) {
      return ECPrivateKeyASN.encode({
        version: 1,
        privateKey: key,
        parameters: [1, 2, 840, 10045, 3, 1, 7]
        // prime256v1
      }, "pem", {
        label: "EC PRIVATE KEY"
      });
    }
    function generateVAPIDKeys() {
      const curve = crypto2.createECDH("prime256v1");
      curve.generateKeys();
      let publicKeyBuffer = curve.getPublicKey();
      let privateKeyBuffer = curve.getPrivateKey();
      if (privateKeyBuffer.length < 32) {
        const padding = Buffer.alloc(32 - privateKeyBuffer.length);
        padding.fill(0);
        privateKeyBuffer = Buffer.concat([padding, privateKeyBuffer]);
      }
      if (publicKeyBuffer.length < 65) {
        const padding = Buffer.alloc(65 - publicKeyBuffer.length);
        padding.fill(0);
        publicKeyBuffer = Buffer.concat([padding, publicKeyBuffer]);
      }
      return {
        publicKey: publicKeyBuffer.toString("base64url"),
        privateKey: privateKeyBuffer.toString("base64url")
      };
    }
    function validateSubject(subject) {
      if (!subject) {
        throw new Error("No subject set in vapidDetails.subject.");
      }
      if (typeof subject !== "string" || subject.length === 0) {
        throw new Error("The subject value must be a string containing an https: URL or mailto: address. " + subject);
      }
      let subjectParseResult = null;
      try {
        subjectParseResult = new URL2(subject);
      } catch (err) {
        throw new Error("Vapid subject is not a valid URL. " + subject);
      }
      if (!["https:", "mailto:"].includes(subjectParseResult.protocol)) {
        throw new Error("Vapid subject is not an https: or mailto: URL. " + subject);
      }
      if (subjectParseResult.hostname === "localhost") {
        console.warn("Vapid subject points to a localhost web URI, which is unsupported by Apple's push notification server and will result in a BadJwtToken error when sending notifications.");
      }
    }
    function validatePublicKey(publicKey) {
      if (!publicKey) {
        throw new Error("No key set vapidDetails.publicKey");
      }
      if (typeof publicKey !== "string") {
        throw new Error("Vapid public key is must be a URL safe Base 64 encoded string.");
      }
      if (!urlBase64Helper.validate(publicKey)) {
        throw new Error('Vapid public key must be a URL safe Base 64 (without "=")');
      }
      publicKey = Buffer.from(publicKey, "base64url");
      if (publicKey.length !== 65) {
        throw new Error("Vapid public key should be 65 bytes long when decoded.");
      }
    }
    function validatePrivateKey(privateKey) {
      if (!privateKey) {
        throw new Error("No key set in vapidDetails.privateKey");
      }
      if (typeof privateKey !== "string") {
        throw new Error("Vapid private key must be a URL safe Base 64 encoded string.");
      }
      if (!urlBase64Helper.validate(privateKey)) {
        throw new Error('Vapid private key must be a URL safe Base 64 (without "=")');
      }
      privateKey = Buffer.from(privateKey, "base64url");
      if (privateKey.length !== 32) {
        throw new Error("Vapid private key should be 32 bytes long when decoded.");
      }
    }
    function getFutureExpirationTimestamp(numSeconds) {
      const futureExp = /* @__PURE__ */ new Date();
      futureExp.setSeconds(futureExp.getSeconds() + numSeconds);
      return Math.floor(futureExp.getTime() / 1e3);
    }
    function validateExpiration(expiration) {
      if (!Number.isInteger(expiration)) {
        throw new Error("`expiration` value must be a number");
      }
      if (expiration < 0) {
        throw new Error("`expiration` must be a positive integer");
      }
      const maxExpirationTimestamp = getFutureExpirationTimestamp(MAX_EXPIRATION_SECONDS);
      if (expiration >= maxExpirationTimestamp) {
        throw new Error("`expiration` value is greater than maximum of 24 hours");
      }
    }
    function getVapidHeaders(audience, subject, publicKey, privateKey, contentEncoding, expiration) {
      if (!audience) {
        throw new Error("No audience could be generated for VAPID.");
      }
      if (typeof audience !== "string" || audience.length === 0) {
        throw new Error("The audience value must be a string containing the origin of a push service. " + audience);
      }
      try {
        new URL2(audience);
      } catch (err) {
        throw new Error("VAPID audience is not a url. " + audience);
      }
      validateSubject(subject);
      validatePublicKey(publicKey);
      validatePrivateKey(privateKey);
      privateKey = Buffer.from(privateKey, "base64url");
      if (expiration) {
        validateExpiration(expiration);
      } else {
        expiration = getFutureExpirationTimestamp(DEFAULT_EXPIRATION_SECONDS);
      }
      const header = {
        typ: "JWT",
        alg: "ES256"
      };
      const jwtPayload = {
        aud: audience,
        exp: expiration,
        sub: subject
      };
      const jwt = jws.sign({
        header,
        payload: jwtPayload,
        privateKey: toPEM(privateKey)
      });
      if (contentEncoding === WebPushConstants.supportedContentEncodings.AES_128_GCM) {
        return {
          Authorization: "vapid t=" + jwt + ", k=" + publicKey
        };
      }
      if (contentEncoding === WebPushConstants.supportedContentEncodings.AES_GCM) {
        return {
          Authorization: "WebPush " + jwt,
          "Crypto-Key": "p256ecdsa=" + publicKey
        };
      }
      throw new Error("Unsupported encoding type specified.");
    }
    module.exports = {
      generateVAPIDKeys,
      getFutureExpirationTimestamp,
      getVapidHeaders,
      validateSubject,
      validatePublicKey,
      validatePrivateKey,
      validateExpiration
    };
  }
});

// node_modules/.pnpm/http_ece@1.2.0/node_modules/http_ece/ece.js
var require_ece = __commonJS({
  "node_modules/.pnpm/http_ece@1.2.0/node_modules/http_ece/ece.js"(exports, module) {
    "use strict";
    var crypto2 = __require("crypto");
    var AES_GCM = "aes-128-gcm";
    var PAD_SIZE = { "aes128gcm": 1, "aesgcm": 2 };
    var TAG_LENGTH = 16;
    var KEY_LENGTH = 16;
    var NONCE_LENGTH = 12;
    var SHA_256_LENGTH = 32;
    var MODE_ENCRYPT = "encrypt";
    var MODE_DECRYPT = "decrypt";
    var keylog;
    if (process.env.ECE_KEYLOG === "1") {
      keylog = function(m, k) {
        console.warn(m + " [" + k.length + "]: " + k.toString("base64url"));
        return k;
      };
    } else {
      keylog = function(m, k) {
        return k;
      };
    }
    function decode(b) {
      if (typeof b === "string") {
        return Buffer.from(b, "base64url");
      }
      return b;
    }
    function HMAC_hash(key, input) {
      var hmac = crypto2.createHmac("sha256", key);
      hmac.update(input);
      return hmac.digest();
    }
    function HKDF_extract(salt, ikm) {
      keylog("salt", salt);
      keylog("ikm", ikm);
      return keylog("extract", HMAC_hash(salt, ikm));
    }
    function HKDF_expand(prk, info2, l) {
      keylog("prk", prk);
      keylog("info", info2);
      var output = Buffer.alloc(0);
      var T = Buffer.alloc(0);
      info2 = Buffer.from(info2, "ascii");
      var counter = 0;
      var cbuf = Buffer.alloc(1);
      while (output.length < l) {
        cbuf.writeUIntBE(++counter, 0, 1);
        T = HMAC_hash(prk, Buffer.concat([T, info2, cbuf]));
        output = Buffer.concat([output, T]);
      }
      return keylog("expand", output.slice(0, l));
    }
    function HKDF(salt, ikm, info2, len) {
      return HKDF_expand(HKDF_extract(salt, ikm), info2, len);
    }
    function info(base, context) {
      var result = Buffer.concat([
        Buffer.from("Content-Encoding: " + base + "\0", "ascii"),
        context
      ]);
      keylog("info " + base, result);
      return result;
    }
    function lengthPrefix(buffer) {
      var b = Buffer.concat([Buffer.alloc(2), buffer]);
      b.writeUIntBE(buffer.length, 0, 2);
      return b;
    }
    function extractDH(header, mode) {
      var key = header.privateKey;
      var senderPubKey, receiverPubKey;
      if (mode === MODE_ENCRYPT) {
        senderPubKey = key.getPublicKey();
        receiverPubKey = header.dh;
      } else if (mode === MODE_DECRYPT) {
        senderPubKey = header.dh;
        receiverPubKey = key.getPublicKey();
      } else {
        throw new Error("Unknown mode only " + MODE_ENCRYPT + " and " + MODE_DECRYPT + " supported");
      }
      return {
        secret: key.computeSecret(header.dh),
        context: Buffer.concat([
          Buffer.from(header.keylabel, "ascii"),
          Buffer.from([0]),
          lengthPrefix(receiverPubKey),
          // user agent
          lengthPrefix(senderPubKey)
          // application server
        ])
      };
    }
    function extractSecretAndContext(header, mode) {
      var result = { secret: null, context: Buffer.alloc(0) };
      if (header.key) {
        result.secret = header.key;
        if (result.secret.length !== KEY_LENGTH) {
          throw new Error("An explicit key must be " + KEY_LENGTH + " bytes");
        }
      } else if (header.dh) {
        result = extractDH(header, mode);
      } else if (typeof header.keyid !== void 0) {
        result.secret = header.keymap[header.keyid];
      }
      if (!result.secret) {
        throw new Error("Unable to determine key");
      }
      keylog("secret", result.secret);
      keylog("context", result.context);
      if (header.authSecret) {
        result.secret = HKDF(
          header.authSecret,
          result.secret,
          info("auth", Buffer.alloc(0)),
          SHA_256_LENGTH
        );
        keylog("authsecret", result.secret);
      }
      return result;
    }
    function webpushSecret(header, mode) {
      if (!header.authSecret) {
        throw new Error("No authentication secret for webpush");
      }
      keylog("authsecret", header.authSecret);
      var remotePubKey, senderPubKey, receiverPubKey;
      if (mode === MODE_ENCRYPT) {
        senderPubKey = header.privateKey.getPublicKey();
        remotePubKey = receiverPubKey = header.dh;
      } else if (mode === MODE_DECRYPT) {
        remotePubKey = senderPubKey = header.keyid;
        receiverPubKey = header.privateKey.getPublicKey();
      } else {
        throw new Error("Unknown mode only " + MODE_ENCRYPT + " and " + MODE_DECRYPT + " supported");
      }
      keylog("remote pubkey", remotePubKey);
      keylog("sender pubkey", senderPubKey);
      keylog("receiver pubkey", receiverPubKey);
      return keylog(
        "secret dh",
        HKDF(
          header.authSecret,
          header.privateKey.computeSecret(remotePubKey),
          Buffer.concat([
            Buffer.from("WebPush: info\0"),
            receiverPubKey,
            senderPubKey
          ]),
          SHA_256_LENGTH
        )
      );
    }
    function extractSecret(header, mode, keyLookupCallback) {
      if (keyLookupCallback) {
        if (!isFunction(keyLookupCallback)) {
          throw new Error("Callback is not a function");
        }
      }
      if (header.key) {
        if (header.key.length !== KEY_LENGTH) {
          throw new Error("An explicit key must be " + KEY_LENGTH + " bytes");
        }
        return keylog("secret key", header.key);
      }
      if (!header.privateKey) {
        if (!keyLookupCallback) {
          var key = header.keymap && header.keymap[header.keyid];
        } else {
          var key = keyLookupCallback(header.keyid);
        }
        if (!key) {
          throw new Error('No saved key (keyid: "' + header.keyid + '")');
        }
        return key;
      }
      return webpushSecret(header, mode);
    }
    function deriveKeyAndNonce(header, mode, lookupKeyCallback) {
      if (!header.salt) {
        throw new Error("must include a salt parameter for " + header.version);
      }
      var keyInfo;
      var nonceInfo;
      var secret;
      if (header.version === "aesgcm") {
        var s = extractSecretAndContext(header, mode, lookupKeyCallback);
        keyInfo = info("aesgcm", s.context);
        nonceInfo = info("nonce", s.context);
        secret = s.secret;
      } else if (header.version === "aes128gcm") {
        keyInfo = Buffer.from("Content-Encoding: aes128gcm\0");
        nonceInfo = Buffer.from("Content-Encoding: nonce\0");
        secret = extractSecret(header, mode, lookupKeyCallback);
      } else {
        throw new Error("Unable to set context for mode " + header.version);
      }
      var prk = HKDF_extract(header.salt, secret);
      var result = {
        key: HKDF_expand(prk, keyInfo, KEY_LENGTH),
        nonce: HKDF_expand(prk, nonceInfo, NONCE_LENGTH)
      };
      keylog("key", result.key);
      keylog("nonce base", result.nonce);
      return result;
    }
    function parseParams(params) {
      var header = {};
      header.version = params.version || "aes128gcm";
      header.rs = parseInt(params.rs, 10);
      if (isNaN(header.rs)) {
        header.rs = 4096;
      }
      var overhead = PAD_SIZE[header.version];
      if (header.version === "aes128gcm") {
        overhead += TAG_LENGTH;
      }
      if (header.rs <= overhead) {
        throw new Error("The rs parameter has to be greater than " + overhead);
      }
      if (params.salt) {
        header.salt = decode(params.salt);
        if (header.salt.length !== KEY_LENGTH) {
          throw new Error("The salt parameter must be " + KEY_LENGTH + " bytes");
        }
      }
      header.keyid = params.keyid;
      if (params.key) {
        header.key = decode(params.key);
      } else {
        header.privateKey = params.privateKey;
        if (!header.privateKey) {
          header.keymap = params.keymap;
        }
        if (header.version !== "aes128gcm") {
          header.keylabel = params.keylabel || "P-256";
        }
        if (params.dh) {
          header.dh = decode(params.dh);
        }
      }
      if (params.authSecret) {
        header.authSecret = decode(params.authSecret);
      }
      return header;
    }
    function generateNonce(base, counter) {
      var nonce = Buffer.from(base);
      var m = nonce.readUIntBE(nonce.length - 6, 6);
      var x = ((m ^ counter) & 16777215) + ((m / 16777216 ^ counter / 16777216) & 16777215) * 16777216;
      nonce.writeUIntBE(x, nonce.length - 6, 6);
      keylog("nonce" + counter, nonce);
      return nonce;
    }
    function readHeader(buffer, header) {
      var idsz = buffer.readUIntBE(20, 1);
      header.salt = buffer.slice(0, KEY_LENGTH);
      header.rs = buffer.readUIntBE(KEY_LENGTH, 4);
      header.keyid = buffer.slice(21, 21 + idsz);
      return 21 + idsz;
    }
    function unpadLegacy(data, version2) {
      var padSize = PAD_SIZE[version2];
      var pad = data.readUIntBE(0, padSize);
      if (pad + padSize > data.length) {
        throw new Error("padding exceeds block size");
      }
      keylog("padding", data.slice(0, padSize + pad));
      var padCheck = Buffer.alloc(pad);
      padCheck.fill(0);
      if (padCheck.compare(data.slice(padSize, padSize + pad)) !== 0) {
        throw new Error("invalid padding");
      }
      return data.slice(padSize + pad);
    }
    function unpad(data, last) {
      var i = data.length - 1;
      while (i >= 0) {
        if (data[i]) {
          if (last) {
            if (data[i] !== 2) {
              throw new Error("last record needs to start padding with a 2");
            }
          } else {
            if (data[i] !== 1) {
              throw new Error("last record needs to start padding with a 2");
            }
          }
          return data.slice(0, i);
        }
        --i;
      }
      throw new Error("all zero plaintext");
    }
    function decryptRecord(key, counter, buffer, header, last) {
      keylog("decrypt", buffer);
      var nonce = generateNonce(key.nonce, counter);
      var gcm = crypto2.createDecipheriv(AES_GCM, key.key, nonce);
      gcm.setAuthTag(buffer.slice(buffer.length - TAG_LENGTH));
      var data = gcm.update(buffer.slice(0, buffer.length - TAG_LENGTH));
      data = Buffer.concat([data, gcm.final()]);
      keylog("decrypted", data);
      if (header.version !== "aes128gcm") {
        return unpadLegacy(data, header.version);
      }
      return unpad(data, last);
    }
    function decrypt(buffer, params, keyLookupCallback) {
      var header = parseParams(params);
      if (header.version === "aes128gcm") {
        var headerLength = readHeader(buffer, header);
        buffer = buffer.slice(headerLength);
      }
      var key = deriveKeyAndNonce(header, MODE_DECRYPT, keyLookupCallback);
      var start = 0;
      var result = Buffer.alloc(0);
      var chunkSize = header.rs;
      if (header.version !== "aes128gcm") {
        chunkSize += TAG_LENGTH;
      }
      for (var i = 0; start < buffer.length; ++i) {
        var end = start + chunkSize;
        if (header.version !== "aes128gcm" && end === buffer.length) {
          throw new Error("Truncated payload");
        }
        end = Math.min(end, buffer.length);
        if (end - start <= TAG_LENGTH) {
          throw new Error("Invalid block: too small at " + i);
        }
        var block = decryptRecord(
          key,
          i,
          buffer.slice(start, end),
          header,
          end >= buffer.length
        );
        result = Buffer.concat([result, block]);
        start = end;
      }
      return result;
    }
    function encryptRecord(key, counter, buffer, pad, header, last) {
      keylog("encrypt", buffer);
      pad = pad || 0;
      var nonce = generateNonce(key.nonce, counter);
      var gcm = crypto2.createCipheriv(AES_GCM, key.key, nonce);
      var ciphertext = [];
      var padSize = PAD_SIZE[header.version];
      var padding = Buffer.alloc(pad + padSize);
      padding.fill(0);
      if (header.version !== "aes128gcm") {
        padding.writeUIntBE(pad, 0, padSize);
        keylog("padding", padding);
        ciphertext.push(gcm.update(padding));
        ciphertext.push(gcm.update(buffer));
        if (!last && padding.length + buffer.length < header.rs) {
          throw new Error("Unable to pad to record size");
        }
      } else {
        ciphertext.push(gcm.update(buffer));
        padding.writeUIntBE(last ? 2 : 1, 0, 1);
        keylog("padding", padding);
        ciphertext.push(gcm.update(padding));
      }
      gcm.final();
      var tag = gcm.getAuthTag();
      if (tag.length !== TAG_LENGTH) {
        throw new Error("invalid tag generated");
      }
      ciphertext.push(tag);
      return keylog("encrypted", Buffer.concat(ciphertext));
    }
    function writeHeader(header) {
      var ints = Buffer.alloc(5);
      var keyid = Buffer.from(header.keyid || []);
      if (keyid.length > 255) {
        throw new Error("keyid is too large");
      }
      ints.writeUIntBE(header.rs, 0, 4);
      ints.writeUIntBE(keyid.length, 4, 1);
      return Buffer.concat([header.salt, ints, keyid]);
    }
    function encrypt(buffer, params, keyLookupCallback) {
      if (!Buffer.isBuffer(buffer)) {
        throw new Error("buffer argument must be a Buffer");
      }
      var header = parseParams(params);
      if (!header.salt) {
        header.salt = crypto2.randomBytes(KEY_LENGTH);
      }
      var result;
      if (header.version === "aes128gcm") {
        if (header.privateKey && !header.keyid) {
          header.keyid = header.privateKey.getPublicKey();
        }
        result = writeHeader(header);
      } else {
        result = Buffer.alloc(0);
      }
      var key = deriveKeyAndNonce(header, MODE_ENCRYPT, keyLookupCallback);
      var start = 0;
      var padSize = PAD_SIZE[header.version];
      var overhead = padSize;
      if (header.version === "aes128gcm") {
        overhead += TAG_LENGTH;
      }
      var pad = isNaN(parseInt(params.pad, 10)) ? 0 : parseInt(params.pad, 10);
      var counter = 0;
      var last = false;
      while (!last) {
        var recordPad = Math.min(header.rs - overhead - 1, pad);
        if (header.version !== "aes128gcm") {
          recordPad = Math.min((1 << padSize * 8) - 1, recordPad);
        }
        if (pad > 0 && recordPad === 0) {
          ++recordPad;
        }
        pad -= recordPad;
        var end = start + header.rs - overhead - recordPad;
        if (header.version !== "aes128gcm") {
          last = end > buffer.length;
        } else {
          last = end >= buffer.length;
        }
        last = last && pad <= 0;
        var block = encryptRecord(
          key,
          counter,
          buffer.slice(start, end),
          recordPad,
          header,
          last
        );
        result = Buffer.concat([result, block]);
        start = end;
        ++counter;
      }
      return result;
    }
    function isFunction(object) {
      return typeof object === "function";
    }
    module.exports = {
      decrypt,
      encrypt
    };
  }
});

// node_modules/.pnpm/web-push@3.6.7/node_modules/web-push/src/encryption-helper.js
var require_encryption_helper = __commonJS({
  "node_modules/.pnpm/web-push@3.6.7/node_modules/web-push/src/encryption-helper.js"(exports, module) {
    "use strict";
    var crypto2 = __require("crypto");
    var ece = require_ece();
    var encrypt = function(userPublicKey, userAuth, payload, contentEncoding) {
      if (!userPublicKey) {
        throw new Error("No user public key provided for encryption.");
      }
      if (typeof userPublicKey !== "string") {
        throw new Error("The subscription p256dh value must be a string.");
      }
      if (Buffer.from(userPublicKey, "base64url").length !== 65) {
        throw new Error("The subscription p256dh value should be 65 bytes long.");
      }
      if (!userAuth) {
        throw new Error("No user auth provided for encryption.");
      }
      if (typeof userAuth !== "string") {
        throw new Error("The subscription auth key must be a string.");
      }
      if (Buffer.from(userAuth, "base64url").length < 16) {
        throw new Error("The subscription auth key should be at least 16 bytes long");
      }
      if (typeof payload !== "string" && !Buffer.isBuffer(payload)) {
        throw new Error("Payload must be either a string or a Node Buffer.");
      }
      if (typeof payload === "string" || payload instanceof String) {
        payload = Buffer.from(payload);
      }
      const localCurve = crypto2.createECDH("prime256v1");
      const localPublicKey = localCurve.generateKeys();
      const salt = crypto2.randomBytes(16).toString("base64url");
      const cipherText = ece.encrypt(payload, {
        version: contentEncoding,
        dh: userPublicKey,
        privateKey: localCurve,
        salt,
        authSecret: userAuth
      });
      return {
        localPublicKey,
        salt,
        cipherText
      };
    };
    module.exports = {
      encrypt
    };
  }
});

// node_modules/.pnpm/web-push@3.6.7/node_modules/web-push/src/web-push-error.js
var require_web_push_error = __commonJS({
  "node_modules/.pnpm/web-push@3.6.7/node_modules/web-push/src/web-push-error.js"(exports, module) {
    "use strict";
    function WebPushError(message, statusCode, headers, body, endpoint) {
      Error.captureStackTrace(this, this.constructor);
      this.name = this.constructor.name;
      this.message = message;
      this.statusCode = statusCode;
      this.headers = headers;
      this.body = body;
      this.endpoint = endpoint;
    }
    __require("util").inherits(WebPushError, Error);
    module.exports = WebPushError;
  }
});

// node_modules/.pnpm/ms@2.1.3/node_modules/ms/index.js
var require_ms = __commonJS({
  "node_modules/.pnpm/ms@2.1.3/node_modules/ms/index.js"(exports, module) {
    var s = 1e3;
    var m = s * 60;
    var h = m * 60;
    var d = h * 24;
    var w = d * 7;
    var y = d * 365.25;
    module.exports = function(val, options) {
      options = options || {};
      var type = typeof val;
      if (type === "string" && val.length > 0) {
        return parse(val);
      } else if (type === "number" && isFinite(val)) {
        return options.long ? fmtLong(val) : fmtShort(val);
      }
      throw new Error(
        "val is not a non-empty string or a valid number. val=" + JSON.stringify(val)
      );
    };
    function parse(str) {
      str = String(str);
      if (str.length > 100) {
        return;
      }
      var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
        str
      );
      if (!match) {
        return;
      }
      var n = parseFloat(match[1]);
      var type = (match[2] || "ms").toLowerCase();
      switch (type) {
        case "years":
        case "year":
        case "yrs":
        case "yr":
        case "y":
          return n * y;
        case "weeks":
        case "week":
        case "w":
          return n * w;
        case "days":
        case "day":
        case "d":
          return n * d;
        case "hours":
        case "hour":
        case "hrs":
        case "hr":
        case "h":
          return n * h;
        case "minutes":
        case "minute":
        case "mins":
        case "min":
        case "m":
          return n * m;
        case "seconds":
        case "second":
        case "secs":
        case "sec":
        case "s":
          return n * s;
        case "milliseconds":
        case "millisecond":
        case "msecs":
        case "msec":
        case "ms":
          return n;
        default:
          return void 0;
      }
    }
    function fmtShort(ms) {
      var msAbs = Math.abs(ms);
      if (msAbs >= d) {
        return Math.round(ms / d) + "d";
      }
      if (msAbs >= h) {
        return Math.round(ms / h) + "h";
      }
      if (msAbs >= m) {
        return Math.round(ms / m) + "m";
      }
      if (msAbs >= s) {
        return Math.round(ms / s) + "s";
      }
      return ms + "ms";
    }
    function fmtLong(ms) {
      var msAbs = Math.abs(ms);
      if (msAbs >= d) {
        return plural(ms, msAbs, d, "day");
      }
      if (msAbs >= h) {
        return plural(ms, msAbs, h, "hour");
      }
      if (msAbs >= m) {
        return plural(ms, msAbs, m, "minute");
      }
      if (msAbs >= s) {
        return plural(ms, msAbs, s, "second");
      }
      return ms + " ms";
    }
    function plural(ms, msAbs, n, name) {
      var isPlural = msAbs >= n * 1.5;
      return Math.round(ms / n) + " " + name + (isPlural ? "s" : "");
    }
  }
});

// node_modules/.pnpm/debug@4.4.3/node_modules/debug/src/common.js
var require_common = __commonJS({
  "node_modules/.pnpm/debug@4.4.3/node_modules/debug/src/common.js"(exports, module) {
    function setup(env) {
      createDebug.debug = createDebug;
      createDebug.default = createDebug;
      createDebug.coerce = coerce;
      createDebug.disable = disable;
      createDebug.enable = enable;
      createDebug.enabled = enabled;
      createDebug.humanize = require_ms();
      createDebug.destroy = destroy;
      Object.keys(env).forEach((key) => {
        createDebug[key] = env[key];
      });
      createDebug.names = [];
      createDebug.skips = [];
      createDebug.formatters = {};
      function selectColor(namespace) {
        let hash = 0;
        for (let i = 0; i < namespace.length; i++) {
          hash = (hash << 5) - hash + namespace.charCodeAt(i);
          hash |= 0;
        }
        return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
      }
      createDebug.selectColor = selectColor;
      function createDebug(namespace) {
        let prevTime;
        let enableOverride = null;
        let namespacesCache;
        let enabledCache;
        function debug(...args) {
          if (!debug.enabled) {
            return;
          }
          const self = debug;
          const curr = Number(/* @__PURE__ */ new Date());
          const ms = curr - (prevTime || curr);
          self.diff = ms;
          self.prev = prevTime;
          self.curr = curr;
          prevTime = curr;
          args[0] = createDebug.coerce(args[0]);
          if (typeof args[0] !== "string") {
            args.unshift("%O");
          }
          let index = 0;
          args[0] = args[0].replace(/%([a-zA-Z%])/g, (match, format) => {
            if (match === "%%") {
              return "%";
            }
            index++;
            const formatter = createDebug.formatters[format];
            if (typeof formatter === "function") {
              const val = args[index];
              match = formatter.call(self, val);
              args.splice(index, 1);
              index--;
            }
            return match;
          });
          createDebug.formatArgs.call(self, args);
          const logFn = self.log || createDebug.log;
          logFn.apply(self, args);
        }
        debug.namespace = namespace;
        debug.useColors = createDebug.useColors();
        debug.color = createDebug.selectColor(namespace);
        debug.extend = extend;
        debug.destroy = createDebug.destroy;
        Object.defineProperty(debug, "enabled", {
          enumerable: true,
          configurable: false,
          get: () => {
            if (enableOverride !== null) {
              return enableOverride;
            }
            if (namespacesCache !== createDebug.namespaces) {
              namespacesCache = createDebug.namespaces;
              enabledCache = createDebug.enabled(namespace);
            }
            return enabledCache;
          },
          set: (v) => {
            enableOverride = v;
          }
        });
        if (typeof createDebug.init === "function") {
          createDebug.init(debug);
        }
        return debug;
      }
      function extend(namespace, delimiter) {
        const newDebug = createDebug(this.namespace + (typeof delimiter === "undefined" ? ":" : delimiter) + namespace);
        newDebug.log = this.log;
        return newDebug;
      }
      function enable(namespaces) {
        createDebug.save(namespaces);
        createDebug.namespaces = namespaces;
        createDebug.names = [];
        createDebug.skips = [];
        const split = (typeof namespaces === "string" ? namespaces : "").trim().replace(/\s+/g, ",").split(",").filter(Boolean);
        for (const ns of split) {
          if (ns[0] === "-") {
            createDebug.skips.push(ns.slice(1));
          } else {
            createDebug.names.push(ns);
          }
        }
      }
      function matchesTemplate(search, template) {
        let searchIndex = 0;
        let templateIndex = 0;
        let starIndex = -1;
        let matchIndex = 0;
        while (searchIndex < search.length) {
          if (templateIndex < template.length && (template[templateIndex] === search[searchIndex] || template[templateIndex] === "*")) {
            if (template[templateIndex] === "*") {
              starIndex = templateIndex;
              matchIndex = searchIndex;
              templateIndex++;
            } else {
              searchIndex++;
              templateIndex++;
            }
          } else if (starIndex !== -1) {
            templateIndex = starIndex + 1;
            matchIndex++;
            searchIndex = matchIndex;
          } else {
            return false;
          }
        }
        while (templateIndex < template.length && template[templateIndex] === "*") {
          templateIndex++;
        }
        return templateIndex === template.length;
      }
      function disable() {
        const namespaces = [
          ...createDebug.names,
          ...createDebug.skips.map((namespace) => "-" + namespace)
        ].join(",");
        createDebug.enable("");
        return namespaces;
      }
      function enabled(name) {
        for (const skip of createDebug.skips) {
          if (matchesTemplate(name, skip)) {
            return false;
          }
        }
        for (const ns of createDebug.names) {
          if (matchesTemplate(name, ns)) {
            return true;
          }
        }
        return false;
      }
      function coerce(val) {
        if (val instanceof Error) {
          return val.stack || val.message;
        }
        return val;
      }
      function destroy() {
        console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
      }
      createDebug.enable(createDebug.load());
      return createDebug;
    }
    module.exports = setup;
  }
});

// node_modules/.pnpm/debug@4.4.3/node_modules/debug/src/browser.js
var require_browser = __commonJS({
  "node_modules/.pnpm/debug@4.4.3/node_modules/debug/src/browser.js"(exports, module) {
    exports.formatArgs = formatArgs;
    exports.save = save;
    exports.load = load;
    exports.useColors = useColors;
    exports.storage = localstorage();
    exports.destroy = /* @__PURE__ */ (() => {
      let warned = false;
      return () => {
        if (!warned) {
          warned = true;
          console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
        }
      };
    })();
    exports.colors = [
      "#0000CC",
      "#0000FF",
      "#0033CC",
      "#0033FF",
      "#0066CC",
      "#0066FF",
      "#0099CC",
      "#0099FF",
      "#00CC00",
      "#00CC33",
      "#00CC66",
      "#00CC99",
      "#00CCCC",
      "#00CCFF",
      "#3300CC",
      "#3300FF",
      "#3333CC",
      "#3333FF",
      "#3366CC",
      "#3366FF",
      "#3399CC",
      "#3399FF",
      "#33CC00",
      "#33CC33",
      "#33CC66",
      "#33CC99",
      "#33CCCC",
      "#33CCFF",
      "#6600CC",
      "#6600FF",
      "#6633CC",
      "#6633FF",
      "#66CC00",
      "#66CC33",
      "#9900CC",
      "#9900FF",
      "#9933CC",
      "#9933FF",
      "#99CC00",
      "#99CC33",
      "#CC0000",
      "#CC0033",
      "#CC0066",
      "#CC0099",
      "#CC00CC",
      "#CC00FF",
      "#CC3300",
      "#CC3333",
      "#CC3366",
      "#CC3399",
      "#CC33CC",
      "#CC33FF",
      "#CC6600",
      "#CC6633",
      "#CC9900",
      "#CC9933",
      "#CCCC00",
      "#CCCC33",
      "#FF0000",
      "#FF0033",
      "#FF0066",
      "#FF0099",
      "#FF00CC",
      "#FF00FF",
      "#FF3300",
      "#FF3333",
      "#FF3366",
      "#FF3399",
      "#FF33CC",
      "#FF33FF",
      "#FF6600",
      "#FF6633",
      "#FF9900",
      "#FF9933",
      "#FFCC00",
      "#FFCC33"
    ];
    function useColors() {
      if (typeof window !== "undefined" && window.process && (window.process.type === "renderer" || window.process.__nwjs)) {
        return true;
      }
      if (typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
        return false;
      }
      let m;
      return typeof document !== "undefined" && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || // Is firebug? http://stackoverflow.com/a/398120/376773
      typeof window !== "undefined" && window.console && (window.console.firebug || window.console.exception && window.console.table) || // Is firefox >= v31?
      // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
      typeof navigator !== "undefined" && navigator.userAgent && (m = navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/)) && parseInt(m[1], 10) >= 31 || // Double check webkit in userAgent just in case we are in a worker
      typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
    }
    function formatArgs(args) {
      args[0] = (this.useColors ? "%c" : "") + this.namespace + (this.useColors ? " %c" : " ") + args[0] + (this.useColors ? "%c " : " ") + "+" + module.exports.humanize(this.diff);
      if (!this.useColors) {
        return;
      }
      const c = "color: " + this.color;
      args.splice(1, 0, c, "color: inherit");
      let index = 0;
      let lastC = 0;
      args[0].replace(/%[a-zA-Z%]/g, (match) => {
        if (match === "%%") {
          return;
        }
        index++;
        if (match === "%c") {
          lastC = index;
        }
      });
      args.splice(lastC, 0, c);
    }
    exports.log = console.debug || console.log || (() => {
    });
    function save(namespaces) {
      try {
        if (namespaces) {
          exports.storage.setItem("debug", namespaces);
        } else {
          exports.storage.removeItem("debug");
        }
      } catch (error) {
      }
    }
    function load() {
      let r;
      try {
        r = exports.storage.getItem("debug") || exports.storage.getItem("DEBUG");
      } catch (error) {
      }
      if (!r && typeof process !== "undefined" && "env" in process) {
        r = process.env.DEBUG;
      }
      return r;
    }
    function localstorage() {
      try {
        return localStorage;
      } catch (error) {
      }
    }
    module.exports = require_common()(exports);
    var { formatters } = module.exports;
    formatters.j = function(v) {
      try {
        return JSON.stringify(v);
      } catch (error) {
        return "[UnexpectedJSONParseError]: " + error.message;
      }
    };
  }
});

// node_modules/.pnpm/debug@4.4.3/node_modules/debug/src/node.js
var require_node2 = __commonJS({
  "node_modules/.pnpm/debug@4.4.3/node_modules/debug/src/node.js"(exports, module) {
    var tty = __require("tty");
    var util2 = __require("util");
    exports.init = init;
    exports.log = log;
    exports.formatArgs = formatArgs;
    exports.save = save;
    exports.load = load;
    exports.useColors = useColors;
    exports.destroy = util2.deprecate(
      () => {
      },
      "Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`."
    );
    exports.colors = [6, 2, 3, 4, 5, 1];
    try {
      const supportsColor = __require("supports-color");
      if (supportsColor && (supportsColor.stderr || supportsColor).level >= 2) {
        exports.colors = [
          20,
          21,
          26,
          27,
          32,
          33,
          38,
          39,
          40,
          41,
          42,
          43,
          44,
          45,
          56,
          57,
          62,
          63,
          68,
          69,
          74,
          75,
          76,
          77,
          78,
          79,
          80,
          81,
          92,
          93,
          98,
          99,
          112,
          113,
          128,
          129,
          134,
          135,
          148,
          149,
          160,
          161,
          162,
          163,
          164,
          165,
          166,
          167,
          168,
          169,
          170,
          171,
          172,
          173,
          178,
          179,
          184,
          185,
          196,
          197,
          198,
          199,
          200,
          201,
          202,
          203,
          204,
          205,
          206,
          207,
          208,
          209,
          214,
          215,
          220,
          221
        ];
      }
    } catch (error) {
    }
    exports.inspectOpts = Object.keys(process.env).filter((key) => {
      return /^debug_/i.test(key);
    }).reduce((obj, key) => {
      const prop = key.substring(6).toLowerCase().replace(/_([a-z])/g, (_, k) => {
        return k.toUpperCase();
      });
      let val = process.env[key];
      if (/^(yes|on|true|enabled)$/i.test(val)) {
        val = true;
      } else if (/^(no|off|false|disabled)$/i.test(val)) {
        val = false;
      } else if (val === "null") {
        val = null;
      } else {
        val = Number(val);
      }
      obj[prop] = val;
      return obj;
    }, {});
    function useColors() {
      return "colors" in exports.inspectOpts ? Boolean(exports.inspectOpts.colors) : tty.isatty(process.stderr.fd);
    }
    function formatArgs(args) {
      const { namespace: name, useColors: useColors2 } = this;
      if (useColors2) {
        const c = this.color;
        const colorCode = "\x1B[3" + (c < 8 ? c : "8;5;" + c);
        const prefix = `  ${colorCode};1m${name} \x1B[0m`;
        args[0] = prefix + args[0].split("\n").join("\n" + prefix);
        args.push(colorCode + "m+" + module.exports.humanize(this.diff) + "\x1B[0m");
      } else {
        args[0] = getDate() + name + " " + args[0];
      }
    }
    function getDate() {
      if (exports.inspectOpts.hideDate) {
        return "";
      }
      return (/* @__PURE__ */ new Date()).toISOString() + " ";
    }
    function log(...args) {
      return process.stderr.write(util2.formatWithOptions(exports.inspectOpts, ...args) + "\n");
    }
    function save(namespaces) {
      if (namespaces) {
        process.env.DEBUG = namespaces;
      } else {
        delete process.env.DEBUG;
      }
    }
    function load() {
      return process.env.DEBUG;
    }
    function init(debug) {
      debug.inspectOpts = {};
      const keys = Object.keys(exports.inspectOpts);
      for (let i = 0; i < keys.length; i++) {
        debug.inspectOpts[keys[i]] = exports.inspectOpts[keys[i]];
      }
    }
    module.exports = require_common()(exports);
    var { formatters } = module.exports;
    formatters.o = function(v) {
      this.inspectOpts.colors = this.useColors;
      return util2.inspect(v, this.inspectOpts).split("\n").map((str) => str.trim()).join(" ");
    };
    formatters.O = function(v) {
      this.inspectOpts.colors = this.useColors;
      return util2.inspect(v, this.inspectOpts);
    };
  }
});

// node_modules/.pnpm/debug@4.4.3/node_modules/debug/src/index.js
var require_src = __commonJS({
  "node_modules/.pnpm/debug@4.4.3/node_modules/debug/src/index.js"(exports, module) {
    if (typeof process === "undefined" || process.type === "renderer" || process.browser === true || process.__nwjs) {
      module.exports = require_browser();
    } else {
      module.exports = require_node2();
    }
  }
});

// node_modules/.pnpm/agent-base@7.1.4/node_modules/agent-base/dist/helpers.js
var require_helpers = __commonJS({
  "node_modules/.pnpm/agent-base@7.1.4/node_modules/agent-base/dist/helpers.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc2 = Object.getOwnPropertyDescriptor(m, k);
      if (!desc2 || ("get" in desc2 ? !m.__esModule : desc2.writable || desc2.configurable)) {
        desc2 = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc2);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports && exports.__importStar || function(mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.req = exports.json = exports.toBuffer = void 0;
    var http = __importStar(__require("http"));
    var https = __importStar(__require("https"));
    async function toBuffer(stream) {
      let length = 0;
      const chunks = [];
      for await (const chunk of stream) {
        length += chunk.length;
        chunks.push(chunk);
      }
      return Buffer.concat(chunks, length);
    }
    exports.toBuffer = toBuffer;
    async function json2(stream) {
      const buf = await toBuffer(stream);
      const str = buf.toString("utf8");
      try {
        return JSON.parse(str);
      } catch (_err) {
        const err = _err;
        err.message += ` (input: ${str})`;
        throw err;
      }
    }
    exports.json = json2;
    function req(url, opts = {}) {
      const href = typeof url === "string" ? url : url.href;
      const req2 = (href.startsWith("https:") ? https : http).request(url, opts);
      const promise = new Promise((resolve, reject) => {
        req2.once("response", resolve).once("error", reject).end();
      });
      req2.then = promise.then.bind(promise);
      return req2;
    }
    exports.req = req;
  }
});

// node_modules/.pnpm/agent-base@7.1.4/node_modules/agent-base/dist/index.js
var require_dist = __commonJS({
  "node_modules/.pnpm/agent-base@7.1.4/node_modules/agent-base/dist/index.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc2 = Object.getOwnPropertyDescriptor(m, k);
      if (!desc2 || ("get" in desc2 ? !m.__esModule : desc2.writable || desc2.configurable)) {
        desc2 = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc2);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports && exports.__importStar || function(mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    var __exportStar = exports && exports.__exportStar || function(m, exports2) {
      for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p)) __createBinding(exports2, m, p);
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Agent = void 0;
    var net = __importStar(__require("net"));
    var http = __importStar(__require("http"));
    var https_1 = __require("https");
    __exportStar(require_helpers(), exports);
    var INTERNAL = /* @__PURE__ */ Symbol("AgentBaseInternalState");
    var Agent = class extends http.Agent {
      constructor(opts) {
        super(opts);
        this[INTERNAL] = {};
      }
      /**
       * Determine whether this is an `http` or `https` request.
       */
      isSecureEndpoint(options) {
        if (options) {
          if (typeof options.secureEndpoint === "boolean") {
            return options.secureEndpoint;
          }
          if (typeof options.protocol === "string") {
            return options.protocol === "https:";
          }
        }
        const { stack } = new Error();
        if (typeof stack !== "string")
          return false;
        return stack.split("\n").some((l) => l.indexOf("(https.js:") !== -1 || l.indexOf("node:https:") !== -1);
      }
      // In order to support async signatures in `connect()` and Node's native
      // connection pooling in `http.Agent`, the array of sockets for each origin
      // has to be updated synchronously. This is so the length of the array is
      // accurate when `addRequest()` is next called. We achieve this by creating a
      // fake socket and adding it to `sockets[origin]` and incrementing
      // `totalSocketCount`.
      incrementSockets(name) {
        if (this.maxSockets === Infinity && this.maxTotalSockets === Infinity) {
          return null;
        }
        if (!this.sockets[name]) {
          this.sockets[name] = [];
        }
        const fakeSocket = new net.Socket({ writable: false });
        this.sockets[name].push(fakeSocket);
        this.totalSocketCount++;
        return fakeSocket;
      }
      decrementSockets(name, socket) {
        if (!this.sockets[name] || socket === null) {
          return;
        }
        const sockets = this.sockets[name];
        const index = sockets.indexOf(socket);
        if (index !== -1) {
          sockets.splice(index, 1);
          this.totalSocketCount--;
          if (sockets.length === 0) {
            delete this.sockets[name];
          }
        }
      }
      // In order to properly update the socket pool, we need to call `getName()` on
      // the core `https.Agent` if it is a secureEndpoint.
      getName(options) {
        const secureEndpoint = this.isSecureEndpoint(options);
        if (secureEndpoint) {
          return https_1.Agent.prototype.getName.call(this, options);
        }
        return super.getName(options);
      }
      createSocket(req, options, cb) {
        const connectOpts = {
          ...options,
          secureEndpoint: this.isSecureEndpoint(options)
        };
        const name = this.getName(connectOpts);
        const fakeSocket = this.incrementSockets(name);
        Promise.resolve().then(() => this.connect(req, connectOpts)).then((socket) => {
          this.decrementSockets(name, fakeSocket);
          if (socket instanceof http.Agent) {
            try {
              return socket.addRequest(req, connectOpts);
            } catch (err) {
              return cb(err);
            }
          }
          this[INTERNAL].currentSocket = socket;
          super.createSocket(req, options, cb);
        }, (err) => {
          this.decrementSockets(name, fakeSocket);
          cb(err);
        });
      }
      createConnection() {
        const socket = this[INTERNAL].currentSocket;
        this[INTERNAL].currentSocket = void 0;
        if (!socket) {
          throw new Error("No socket was returned in the `connect()` function");
        }
        return socket;
      }
      get defaultPort() {
        return this[INTERNAL].defaultPort ?? (this.protocol === "https:" ? 443 : 80);
      }
      set defaultPort(v) {
        if (this[INTERNAL]) {
          this[INTERNAL].defaultPort = v;
        }
      }
      get protocol() {
        return this[INTERNAL].protocol ?? (this.isSecureEndpoint() ? "https:" : "http:");
      }
      set protocol(v) {
        if (this[INTERNAL]) {
          this[INTERNAL].protocol = v;
        }
      }
    };
    exports.Agent = Agent;
  }
});

// node_modules/.pnpm/https-proxy-agent@7.0.6/node_modules/https-proxy-agent/dist/parse-proxy-response.js
var require_parse_proxy_response = __commonJS({
  "node_modules/.pnpm/https-proxy-agent@7.0.6/node_modules/https-proxy-agent/dist/parse-proxy-response.js"(exports) {
    "use strict";
    var __importDefault = exports && exports.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.parseProxyResponse = void 0;
    var debug_1 = __importDefault(require_src());
    var debug = (0, debug_1.default)("https-proxy-agent:parse-proxy-response");
    function parseProxyResponse(socket) {
      return new Promise((resolve, reject) => {
        let buffersLength = 0;
        const buffers = [];
        function read() {
          const b = socket.read();
          if (b)
            ondata(b);
          else
            socket.once("readable", read);
        }
        function cleanup() {
          socket.removeListener("end", onend);
          socket.removeListener("error", onerror);
          socket.removeListener("readable", read);
        }
        function onend() {
          cleanup();
          debug("onend");
          reject(new Error("Proxy connection ended before receiving CONNECT response"));
        }
        function onerror(err) {
          cleanup();
          debug("onerror %o", err);
          reject(err);
        }
        function ondata(b) {
          buffers.push(b);
          buffersLength += b.length;
          const buffered = Buffer.concat(buffers, buffersLength);
          const endOfHeaders = buffered.indexOf("\r\n\r\n");
          if (endOfHeaders === -1) {
            debug("have not received end of HTTP headers yet...");
            read();
            return;
          }
          const headerParts = buffered.slice(0, endOfHeaders).toString("ascii").split("\r\n");
          const firstLine = headerParts.shift();
          if (!firstLine) {
            socket.destroy();
            return reject(new Error("No header received from proxy CONNECT response"));
          }
          const firstLineParts = firstLine.split(" ");
          const statusCode = +firstLineParts[1];
          const statusText = firstLineParts.slice(2).join(" ");
          const headers = {};
          for (const header of headerParts) {
            if (!header)
              continue;
            const firstColon = header.indexOf(":");
            if (firstColon === -1) {
              socket.destroy();
              return reject(new Error(`Invalid header from proxy CONNECT response: "${header}"`));
            }
            const key = header.slice(0, firstColon).toLowerCase();
            const value = header.slice(firstColon + 1).trimStart();
            const current = headers[key];
            if (typeof current === "string") {
              headers[key] = [current, value];
            } else if (Array.isArray(current)) {
              current.push(value);
            } else {
              headers[key] = value;
            }
          }
          debug("got proxy server response: %o %o", firstLine, headers);
          cleanup();
          resolve({
            connect: {
              statusCode,
              statusText,
              headers
            },
            buffered
          });
        }
        socket.on("error", onerror);
        socket.on("end", onend);
        read();
      });
    }
    exports.parseProxyResponse = parseProxyResponse;
  }
});

// node_modules/.pnpm/https-proxy-agent@7.0.6/node_modules/https-proxy-agent/dist/index.js
var require_dist2 = __commonJS({
  "node_modules/.pnpm/https-proxy-agent@7.0.6/node_modules/https-proxy-agent/dist/index.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc2 = Object.getOwnPropertyDescriptor(m, k);
      if (!desc2 || ("get" in desc2 ? !m.__esModule : desc2.writable || desc2.configurable)) {
        desc2 = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc2);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports && exports.__importStar || function(mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    var __importDefault = exports && exports.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.HttpsProxyAgent = void 0;
    var net = __importStar(__require("net"));
    var tls = __importStar(__require("tls"));
    var assert_1 = __importDefault(__require("assert"));
    var debug_1 = __importDefault(require_src());
    var agent_base_1 = require_dist();
    var url_1 = __require("url");
    var parse_proxy_response_1 = require_parse_proxy_response();
    var debug = (0, debug_1.default)("https-proxy-agent");
    var setServernameFromNonIpHost = (options) => {
      if (options.servername === void 0 && options.host && !net.isIP(options.host)) {
        return {
          ...options,
          servername: options.host
        };
      }
      return options;
    };
    var HttpsProxyAgent = class extends agent_base_1.Agent {
      constructor(proxy, opts) {
        super(opts);
        this.options = { path: void 0 };
        this.proxy = typeof proxy === "string" ? new url_1.URL(proxy) : proxy;
        this.proxyHeaders = opts?.headers ?? {};
        debug("Creating new HttpsProxyAgent instance: %o", this.proxy.href);
        const host = (this.proxy.hostname || this.proxy.host).replace(/^\[|\]$/g, "");
        const port2 = this.proxy.port ? parseInt(this.proxy.port, 10) : this.proxy.protocol === "https:" ? 443 : 80;
        this.connectOpts = {
          // Attempt to negotiate http/1.1 for proxy servers that support http/2
          ALPNProtocols: ["http/1.1"],
          ...opts ? omit(opts, "headers") : null,
          host,
          port: port2
        };
      }
      /**
       * Called when the node-core HTTP client library is creating a
       * new HTTP request.
       */
      async connect(req, opts) {
        const { proxy } = this;
        if (!opts.host) {
          throw new TypeError('No "host" provided');
        }
        let socket;
        if (proxy.protocol === "https:") {
          debug("Creating `tls.Socket`: %o", this.connectOpts);
          socket = tls.connect(setServernameFromNonIpHost(this.connectOpts));
        } else {
          debug("Creating `net.Socket`: %o", this.connectOpts);
          socket = net.connect(this.connectOpts);
        }
        const headers = typeof this.proxyHeaders === "function" ? this.proxyHeaders() : { ...this.proxyHeaders };
        const host = net.isIPv6(opts.host) ? `[${opts.host}]` : opts.host;
        let payload = `CONNECT ${host}:${opts.port} HTTP/1.1\r
`;
        if (proxy.username || proxy.password) {
          const auth = `${decodeURIComponent(proxy.username)}:${decodeURIComponent(proxy.password)}`;
          headers["Proxy-Authorization"] = `Basic ${Buffer.from(auth).toString("base64")}`;
        }
        headers.Host = `${host}:${opts.port}`;
        if (!headers["Proxy-Connection"]) {
          headers["Proxy-Connection"] = this.keepAlive ? "Keep-Alive" : "close";
        }
        for (const name of Object.keys(headers)) {
          payload += `${name}: ${headers[name]}\r
`;
        }
        const proxyResponsePromise = (0, parse_proxy_response_1.parseProxyResponse)(socket);
        socket.write(`${payload}\r
`);
        const { connect, buffered } = await proxyResponsePromise;
        req.emit("proxyConnect", connect);
        this.emit("proxyConnect", connect, req);
        if (connect.statusCode === 200) {
          req.once("socket", resume);
          if (opts.secureEndpoint) {
            debug("Upgrading socket connection to TLS");
            return tls.connect({
              ...omit(setServernameFromNonIpHost(opts), "host", "path", "port"),
              socket
            });
          }
          return socket;
        }
        socket.destroy();
        const fakeSocket = new net.Socket({ writable: false });
        fakeSocket.readable = true;
        req.once("socket", (s) => {
          debug("Replaying proxy buffer for failed request");
          (0, assert_1.default)(s.listenerCount("data") > 0);
          s.push(buffered);
          s.push(null);
        });
        return fakeSocket;
      }
    };
    HttpsProxyAgent.protocols = ["http", "https"];
    exports.HttpsProxyAgent = HttpsProxyAgent;
    function resume(socket) {
      socket.resume();
    }
    function omit(obj, ...keys) {
      const ret = {};
      let key;
      for (key in obj) {
        if (!keys.includes(key)) {
          ret[key] = obj[key];
        }
      }
      return ret;
    }
  }
});

// node_modules/.pnpm/web-push@3.6.7/node_modules/web-push/src/web-push-lib.js
var require_web_push_lib = __commonJS({
  "node_modules/.pnpm/web-push@3.6.7/node_modules/web-push/src/web-push-lib.js"(exports, module) {
    "use strict";
    var url = __require("url");
    var https = __require("https");
    var WebPushError = require_web_push_error();
    var vapidHelper = require_vapid_helper();
    var encryptionHelper = require_encryption_helper();
    var webPushConstants = require_web_push_constants();
    var urlBase64Helper = require_urlsafe_base64_helper();
    var DEFAULT_TTL = 2419200;
    var gcmAPIKey = "";
    var vapidDetails;
    function WebPushLib() {
    }
    WebPushLib.prototype.setGCMAPIKey = function(apiKey) {
      if (apiKey === null) {
        gcmAPIKey = null;
        return;
      }
      if (typeof apiKey === "undefined" || typeof apiKey !== "string" || apiKey.length === 0) {
        throw new Error("The GCM API Key should be a non-empty string or null.");
      }
      gcmAPIKey = apiKey;
    };
    WebPushLib.prototype.setVapidDetails = function(subject, publicKey, privateKey) {
      if (arguments.length === 1 && arguments[0] === null) {
        vapidDetails = null;
        return;
      }
      vapidHelper.validateSubject(subject);
      vapidHelper.validatePublicKey(publicKey);
      vapidHelper.validatePrivateKey(privateKey);
      vapidDetails = {
        subject,
        publicKey,
        privateKey
      };
    };
    WebPushLib.prototype.generateRequestDetails = function(subscription, payload, options) {
      if (!subscription || !subscription.endpoint) {
        throw new Error("You must pass in a subscription with at least an endpoint.");
      }
      if (typeof subscription.endpoint !== "string" || subscription.endpoint.length === 0) {
        throw new Error("The subscription endpoint must be a string with a valid URL.");
      }
      if (payload) {
        if (typeof subscription !== "object" || !subscription.keys || !subscription.keys.p256dh || !subscription.keys.auth) {
          throw new Error("To send a message with a payload, the subscription must have 'auth' and 'p256dh' keys.");
        }
      }
      let currentGCMAPIKey = gcmAPIKey;
      let currentVapidDetails = vapidDetails;
      let timeToLive = DEFAULT_TTL;
      let extraHeaders = {};
      let contentEncoding = webPushConstants.supportedContentEncodings.AES_128_GCM;
      let urgency = webPushConstants.supportedUrgency.NORMAL;
      let topic;
      let proxy;
      let agent;
      let timeout;
      if (options) {
        const validOptionKeys = [
          "headers",
          "gcmAPIKey",
          "vapidDetails",
          "TTL",
          "contentEncoding",
          "urgency",
          "topic",
          "proxy",
          "agent",
          "timeout"
        ];
        const optionKeys = Object.keys(options);
        for (let i = 0; i < optionKeys.length; i += 1) {
          const optionKey = optionKeys[i];
          if (!validOptionKeys.includes(optionKey)) {
            throw new Error("'" + optionKey + "' is an invalid option. The valid options are ['" + validOptionKeys.join("', '") + "'].");
          }
        }
        if (options.headers) {
          extraHeaders = options.headers;
          let duplicates = Object.keys(extraHeaders).filter(function(header) {
            return typeof options[header] !== "undefined";
          });
          if (duplicates.length > 0) {
            throw new Error("Duplicated headers defined [" + duplicates.join(",") + "]. Please either define the header in thetop level options OR in the 'headers' key.");
          }
        }
        if (options.gcmAPIKey) {
          currentGCMAPIKey = options.gcmAPIKey;
        }
        if (options.vapidDetails !== void 0) {
          currentVapidDetails = options.vapidDetails;
        }
        if (options.TTL !== void 0) {
          timeToLive = Number(options.TTL);
          if (timeToLive < 0) {
            throw new Error("TTL should be a number and should be at least 0");
          }
        }
        if (options.contentEncoding) {
          if (options.contentEncoding === webPushConstants.supportedContentEncodings.AES_128_GCM || options.contentEncoding === webPushConstants.supportedContentEncodings.AES_GCM) {
            contentEncoding = options.contentEncoding;
          } else {
            throw new Error("Unsupported content encoding specified.");
          }
        }
        if (options.urgency) {
          if (options.urgency === webPushConstants.supportedUrgency.VERY_LOW || options.urgency === webPushConstants.supportedUrgency.LOW || options.urgency === webPushConstants.supportedUrgency.NORMAL || options.urgency === webPushConstants.supportedUrgency.HIGH) {
            urgency = options.urgency;
          } else {
            throw new Error("Unsupported urgency specified.");
          }
        }
        if (options.topic) {
          if (!urlBase64Helper.validate(options.topic)) {
            throw new Error("Unsupported characters set use the URL or filename-safe Base64 characters set");
          }
          if (options.topic.length > 32) {
            throw new Error("use maximum of 32 characters from the URL or filename-safe Base64 characters set");
          }
          topic = options.topic;
        }
        if (options.proxy) {
          if (typeof options.proxy === "string" || typeof options.proxy.host === "string") {
            proxy = options.proxy;
          } else {
            console.warn("Attempt to use proxy option, but invalid type it should be a string or proxy options object.");
          }
        }
        if (options.agent) {
          if (options.agent instanceof https.Agent) {
            if (proxy) {
              console.warn("Agent option will be ignored because proxy option is defined.");
            }
            agent = options.agent;
          } else {
            console.warn("Wrong type for the agent option, it should be an instance of https.Agent.");
          }
        }
        if (typeof options.timeout === "number") {
          timeout = options.timeout;
        }
      }
      if (typeof timeToLive === "undefined") {
        timeToLive = DEFAULT_TTL;
      }
      const requestDetails = {
        method: "POST",
        headers: {
          TTL: timeToLive
        }
      };
      Object.keys(extraHeaders).forEach(function(header) {
        requestDetails.headers[header] = extraHeaders[header];
      });
      let requestPayload = null;
      if (payload) {
        const encrypted = encryptionHelper.encrypt(subscription.keys.p256dh, subscription.keys.auth, payload, contentEncoding);
        requestDetails.headers["Content-Length"] = encrypted.cipherText.length;
        requestDetails.headers["Content-Type"] = "application/octet-stream";
        if (contentEncoding === webPushConstants.supportedContentEncodings.AES_128_GCM) {
          requestDetails.headers["Content-Encoding"] = webPushConstants.supportedContentEncodings.AES_128_GCM;
        } else if (contentEncoding === webPushConstants.supportedContentEncodings.AES_GCM) {
          requestDetails.headers["Content-Encoding"] = webPushConstants.supportedContentEncodings.AES_GCM;
          requestDetails.headers.Encryption = "salt=" + encrypted.salt;
          requestDetails.headers["Crypto-Key"] = "dh=" + encrypted.localPublicKey.toString("base64url");
        }
        requestPayload = encrypted.cipherText;
      } else {
        requestDetails.headers["Content-Length"] = 0;
      }
      const isGCM = subscription.endpoint.startsWith("https://android.googleapis.com/gcm/send");
      const isFCM = subscription.endpoint.startsWith("https://fcm.googleapis.com/fcm/send");
      if (isGCM) {
        if (!currentGCMAPIKey) {
          console.warn("Attempt to send push notification to GCM endpoint, but no GCM key is defined. Please use setGCMApiKey() or add 'gcmAPIKey' as an option.");
        } else {
          requestDetails.headers.Authorization = "key=" + currentGCMAPIKey;
        }
      } else if (currentVapidDetails) {
        const parsedUrl = url.parse(subscription.endpoint);
        const audience = parsedUrl.protocol + "//" + parsedUrl.host;
        const vapidHeaders = vapidHelper.getVapidHeaders(
          audience,
          currentVapidDetails.subject,
          currentVapidDetails.publicKey,
          currentVapidDetails.privateKey,
          contentEncoding
        );
        requestDetails.headers.Authorization = vapidHeaders.Authorization;
        if (contentEncoding === webPushConstants.supportedContentEncodings.AES_GCM) {
          if (requestDetails.headers["Crypto-Key"]) {
            requestDetails.headers["Crypto-Key"] += ";" + vapidHeaders["Crypto-Key"];
          } else {
            requestDetails.headers["Crypto-Key"] = vapidHeaders["Crypto-Key"];
          }
        }
      } else if (isFCM && currentGCMAPIKey) {
        requestDetails.headers.Authorization = "key=" + currentGCMAPIKey;
      }
      requestDetails.headers.Urgency = urgency;
      if (topic) {
        requestDetails.headers.Topic = topic;
      }
      requestDetails.body = requestPayload;
      requestDetails.endpoint = subscription.endpoint;
      if (proxy) {
        requestDetails.proxy = proxy;
      }
      if (agent) {
        requestDetails.agent = agent;
      }
      if (timeout) {
        requestDetails.timeout = timeout;
      }
      return requestDetails;
    };
    WebPushLib.prototype.sendNotification = function(subscription, payload, options) {
      let requestDetails;
      try {
        requestDetails = this.generateRequestDetails(subscription, payload, options);
      } catch (err) {
        return Promise.reject(err);
      }
      return new Promise(function(resolve, reject) {
        const httpsOptions = {};
        const urlParts = url.parse(requestDetails.endpoint);
        httpsOptions.hostname = urlParts.hostname;
        httpsOptions.port = urlParts.port;
        httpsOptions.path = urlParts.path;
        httpsOptions.headers = requestDetails.headers;
        httpsOptions.method = requestDetails.method;
        if (requestDetails.timeout) {
          httpsOptions.timeout = requestDetails.timeout;
        }
        if (requestDetails.agent) {
          httpsOptions.agent = requestDetails.agent;
        }
        if (requestDetails.proxy) {
          const { HttpsProxyAgent } = require_dist2();
          httpsOptions.agent = new HttpsProxyAgent(requestDetails.proxy);
        }
        const pushRequest = https.request(httpsOptions, function(pushResponse) {
          let responseText = "";
          pushResponse.on("data", function(chunk) {
            responseText += chunk;
          });
          pushResponse.on("end", function() {
            if (pushResponse.statusCode < 200 || pushResponse.statusCode > 299) {
              reject(new WebPushError(
                "Received unexpected response code",
                pushResponse.statusCode,
                pushResponse.headers,
                responseText,
                requestDetails.endpoint
              ));
            } else {
              resolve({
                statusCode: pushResponse.statusCode,
                body: responseText,
                headers: pushResponse.headers
              });
            }
          });
        });
        if (requestDetails.timeout) {
          pushRequest.on("timeout", function() {
            pushRequest.destroy(new Error("Socket timeout"));
          });
        }
        pushRequest.on("error", function(e) {
          reject(e);
        });
        if (requestDetails.body) {
          pushRequest.write(requestDetails.body);
        }
        pushRequest.end();
      });
    };
    module.exports = WebPushLib;
  }
});

// node_modules/.pnpm/web-push@3.6.7/node_modules/web-push/src/index.js
var require_src2 = __commonJS({
  "node_modules/.pnpm/web-push@3.6.7/node_modules/web-push/src/index.js"(exports, module) {
    "use strict";
    var vapidHelper = require_vapid_helper();
    var encryptionHelper = require_encryption_helper();
    var WebPushLib = require_web_push_lib();
    var WebPushError = require_web_push_error();
    var WebPushConstants = require_web_push_constants();
    var webPush = new WebPushLib();
    module.exports = {
      WebPushError,
      supportedContentEncodings: WebPushConstants.supportedContentEncodings,
      encrypt: encryptionHelper.encrypt,
      getVapidHeaders: vapidHelper.getVapidHeaders,
      generateVAPIDKeys: vapidHelper.generateVAPIDKeys,
      setGCMAPIKey: webPush.setGCMAPIKey,
      setVapidDetails: webPush.setVapidDetails,
      generateRequestDetails: webPush.generateRequestDetails,
      sendNotification: webPush.sendNotification.bind(webPush)
    };
  }
});

// artifacts/api-server/src/app.ts
var import_cors = __toESM(require_lib(), 1);
var import_pino_http = __toESM(require_logger(), 1);
import express from "express";
import path from "path";
import { existsSync } from "node:fs";

// artifacts/api-server/src/routes/index.ts
import { Router as Router23 } from "express";

// artifacts/api-server/src/routes/health.ts
import { Router } from "express";

// node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/helpers/util.js
var util;
(function(util2) {
  util2.assertEqual = (_) => {
  };
  function assertIs(_arg) {
  }
  util2.assertIs = assertIs;
  function assertNever(_x) {
    throw new Error();
  }
  util2.assertNever = assertNever;
  util2.arrayToEnum = (items) => {
    const obj = {};
    for (const item of items) {
      obj[item] = item;
    }
    return obj;
  };
  util2.getValidEnumValues = (obj) => {
    const validKeys = util2.objectKeys(obj).filter((k) => typeof obj[obj[k]] !== "number");
    const filtered = {};
    for (const k of validKeys) {
      filtered[k] = obj[k];
    }
    return util2.objectValues(filtered);
  };
  util2.objectValues = (obj) => {
    return util2.objectKeys(obj).map(function(e) {
      return obj[e];
    });
  };
  util2.objectKeys = typeof Object.keys === "function" ? (obj) => Object.keys(obj) : (object) => {
    const keys = [];
    for (const key in object) {
      if (Object.prototype.hasOwnProperty.call(object, key)) {
        keys.push(key);
      }
    }
    return keys;
  };
  util2.find = (arr, checker) => {
    for (const item of arr) {
      if (checker(item))
        return item;
    }
    return void 0;
  };
  util2.isInteger = typeof Number.isInteger === "function" ? (val) => Number.isInteger(val) : (val) => typeof val === "number" && Number.isFinite(val) && Math.floor(val) === val;
  function joinValues(array, separator = " | ") {
    return array.map((val) => typeof val === "string" ? `'${val}'` : val).join(separator);
  }
  util2.joinValues = joinValues;
  util2.jsonStringifyReplacer = (_, value) => {
    if (typeof value === "bigint") {
      return value.toString();
    }
    return value;
  };
})(util || (util = {}));
var objectUtil;
(function(objectUtil2) {
  objectUtil2.mergeShapes = (first, second) => {
    return {
      ...first,
      ...second
      // second overwrites first
    };
  };
})(objectUtil || (objectUtil = {}));
var ZodParsedType = util.arrayToEnum([
  "string",
  "nan",
  "number",
  "integer",
  "float",
  "boolean",
  "date",
  "bigint",
  "symbol",
  "function",
  "undefined",
  "null",
  "array",
  "object",
  "unknown",
  "promise",
  "void",
  "never",
  "map",
  "set"
]);
var getParsedType = (data) => {
  const t = typeof data;
  switch (t) {
    case "undefined":
      return ZodParsedType.undefined;
    case "string":
      return ZodParsedType.string;
    case "number":
      return Number.isNaN(data) ? ZodParsedType.nan : ZodParsedType.number;
    case "boolean":
      return ZodParsedType.boolean;
    case "function":
      return ZodParsedType.function;
    case "bigint":
      return ZodParsedType.bigint;
    case "symbol":
      return ZodParsedType.symbol;
    case "object":
      if (Array.isArray(data)) {
        return ZodParsedType.array;
      }
      if (data === null) {
        return ZodParsedType.null;
      }
      if (data.then && typeof data.then === "function" && data.catch && typeof data.catch === "function") {
        return ZodParsedType.promise;
      }
      if (typeof Map !== "undefined" && data instanceof Map) {
        return ZodParsedType.map;
      }
      if (typeof Set !== "undefined" && data instanceof Set) {
        return ZodParsedType.set;
      }
      if (typeof Date !== "undefined" && data instanceof Date) {
        return ZodParsedType.date;
      }
      return ZodParsedType.object;
    default:
      return ZodParsedType.unknown;
  }
};

// node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/ZodError.js
var ZodIssueCode = util.arrayToEnum([
  "invalid_type",
  "invalid_literal",
  "custom",
  "invalid_union",
  "invalid_union_discriminator",
  "invalid_enum_value",
  "unrecognized_keys",
  "invalid_arguments",
  "invalid_return_type",
  "invalid_date",
  "invalid_string",
  "too_small",
  "too_big",
  "invalid_intersection_types",
  "not_multiple_of",
  "not_finite"
]);
var ZodError = class _ZodError extends Error {
  get errors() {
    return this.issues;
  }
  constructor(issues) {
    super();
    this.issues = [];
    this.addIssue = (sub) => {
      this.issues = [...this.issues, sub];
    };
    this.addIssues = (subs = []) => {
      this.issues = [...this.issues, ...subs];
    };
    const actualProto = new.target.prototype;
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(this, actualProto);
    } else {
      this.__proto__ = actualProto;
    }
    this.name = "ZodError";
    this.issues = issues;
  }
  format(_mapper) {
    const mapper = _mapper || function(issue) {
      return issue.message;
    };
    const fieldErrors = { _errors: [] };
    const processError = (error) => {
      for (const issue of error.issues) {
        if (issue.code === "invalid_union") {
          issue.unionErrors.map(processError);
        } else if (issue.code === "invalid_return_type") {
          processError(issue.returnTypeError);
        } else if (issue.code === "invalid_arguments") {
          processError(issue.argumentsError);
        } else if (issue.path.length === 0) {
          fieldErrors._errors.push(mapper(issue));
        } else {
          let curr = fieldErrors;
          let i = 0;
          while (i < issue.path.length) {
            const el = issue.path[i];
            const terminal = i === issue.path.length - 1;
            if (!terminal) {
              curr[el] = curr[el] || { _errors: [] };
            } else {
              curr[el] = curr[el] || { _errors: [] };
              curr[el]._errors.push(mapper(issue));
            }
            curr = curr[el];
            i++;
          }
        }
      }
    };
    processError(this);
    return fieldErrors;
  }
  static assert(value) {
    if (!(value instanceof _ZodError)) {
      throw new Error(`Not a ZodError: ${value}`);
    }
  }
  toString() {
    return this.message;
  }
  get message() {
    return JSON.stringify(this.issues, util.jsonStringifyReplacer, 2);
  }
  get isEmpty() {
    return this.issues.length === 0;
  }
  flatten(mapper = (issue) => issue.message) {
    const fieldErrors = {};
    const formErrors = [];
    for (const sub of this.issues) {
      if (sub.path.length > 0) {
        const firstEl = sub.path[0];
        fieldErrors[firstEl] = fieldErrors[firstEl] || [];
        fieldErrors[firstEl].push(mapper(sub));
      } else {
        formErrors.push(mapper(sub));
      }
    }
    return { formErrors, fieldErrors };
  }
  get formErrors() {
    return this.flatten();
  }
};
ZodError.create = (issues) => {
  const error = new ZodError(issues);
  return error;
};

// node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/locales/en.js
var errorMap = (issue, _ctx) => {
  let message;
  switch (issue.code) {
    case ZodIssueCode.invalid_type:
      if (issue.received === ZodParsedType.undefined) {
        message = "Required";
      } else {
        message = `Expected ${issue.expected}, received ${issue.received}`;
      }
      break;
    case ZodIssueCode.invalid_literal:
      message = `Invalid literal value, expected ${JSON.stringify(issue.expected, util.jsonStringifyReplacer)}`;
      break;
    case ZodIssueCode.unrecognized_keys:
      message = `Unrecognized key(s) in object: ${util.joinValues(issue.keys, ", ")}`;
      break;
    case ZodIssueCode.invalid_union:
      message = `Invalid input`;
      break;
    case ZodIssueCode.invalid_union_discriminator:
      message = `Invalid discriminator value. Expected ${util.joinValues(issue.options)}`;
      break;
    case ZodIssueCode.invalid_enum_value:
      message = `Invalid enum value. Expected ${util.joinValues(issue.options)}, received '${issue.received}'`;
      break;
    case ZodIssueCode.invalid_arguments:
      message = `Invalid function arguments`;
      break;
    case ZodIssueCode.invalid_return_type:
      message = `Invalid function return type`;
      break;
    case ZodIssueCode.invalid_date:
      message = `Invalid date`;
      break;
    case ZodIssueCode.invalid_string:
      if (typeof issue.validation === "object") {
        if ("includes" in issue.validation) {
          message = `Invalid input: must include "${issue.validation.includes}"`;
          if (typeof issue.validation.position === "number") {
            message = `${message} at one or more positions greater than or equal to ${issue.validation.position}`;
          }
        } else if ("startsWith" in issue.validation) {
          message = `Invalid input: must start with "${issue.validation.startsWith}"`;
        } else if ("endsWith" in issue.validation) {
          message = `Invalid input: must end with "${issue.validation.endsWith}"`;
        } else {
          util.assertNever(issue.validation);
        }
      } else if (issue.validation !== "regex") {
        message = `Invalid ${issue.validation}`;
      } else {
        message = "Invalid";
      }
      break;
    case ZodIssueCode.too_small:
      if (issue.type === "array")
        message = `Array must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `more than`} ${issue.minimum} element(s)`;
      else if (issue.type === "string")
        message = `String must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `over`} ${issue.minimum} character(s)`;
      else if (issue.type === "number")
        message = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
      else if (issue.type === "bigint")
        message = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
      else if (issue.type === "date")
        message = `Date must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${new Date(Number(issue.minimum))}`;
      else
        message = "Invalid input";
      break;
    case ZodIssueCode.too_big:
      if (issue.type === "array")
        message = `Array must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `less than`} ${issue.maximum} element(s)`;
      else if (issue.type === "string")
        message = `String must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `under`} ${issue.maximum} character(s)`;
      else if (issue.type === "number")
        message = `Number must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
      else if (issue.type === "bigint")
        message = `BigInt must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
      else if (issue.type === "date")
        message = `Date must be ${issue.exact ? `exactly` : issue.inclusive ? `smaller than or equal to` : `smaller than`} ${new Date(Number(issue.maximum))}`;
      else
        message = "Invalid input";
      break;
    case ZodIssueCode.custom:
      message = `Invalid input`;
      break;
    case ZodIssueCode.invalid_intersection_types:
      message = `Intersection results could not be merged`;
      break;
    case ZodIssueCode.not_multiple_of:
      message = `Number must be a multiple of ${issue.multipleOf}`;
      break;
    case ZodIssueCode.not_finite:
      message = "Number must be finite";
      break;
    default:
      message = _ctx.defaultError;
      util.assertNever(issue);
  }
  return { message };
};
var en_default = errorMap;

// node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/errors.js
var overrideErrorMap = en_default;
function getErrorMap() {
  return overrideErrorMap;
}

// node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/helpers/parseUtil.js
var makeIssue = (params) => {
  const { data, path: path2, errorMaps, issueData } = params;
  const fullPath = [...path2, ...issueData.path || []];
  const fullIssue = {
    ...issueData,
    path: fullPath
  };
  if (issueData.message !== void 0) {
    return {
      ...issueData,
      path: fullPath,
      message: issueData.message
    };
  }
  let errorMessage = "";
  const maps = errorMaps.filter((m) => !!m).slice().reverse();
  for (const map of maps) {
    errorMessage = map(fullIssue, { data, defaultError: errorMessage }).message;
  }
  return {
    ...issueData,
    path: fullPath,
    message: errorMessage
  };
};
function addIssueToContext(ctx, issueData) {
  const overrideMap = getErrorMap();
  const issue = makeIssue({
    issueData,
    data: ctx.data,
    path: ctx.path,
    errorMaps: [
      ctx.common.contextualErrorMap,
      // contextual error map is first priority
      ctx.schemaErrorMap,
      // then schema-bound map if available
      overrideMap,
      // then global override map
      overrideMap === en_default ? void 0 : en_default
      // then global default map
    ].filter((x) => !!x)
  });
  ctx.common.issues.push(issue);
}
var ParseStatus = class _ParseStatus {
  constructor() {
    this.value = "valid";
  }
  dirty() {
    if (this.value === "valid")
      this.value = "dirty";
  }
  abort() {
    if (this.value !== "aborted")
      this.value = "aborted";
  }
  static mergeArray(status, results) {
    const arrayValue = [];
    for (const s of results) {
      if (s.status === "aborted")
        return INVALID;
      if (s.status === "dirty")
        status.dirty();
      arrayValue.push(s.value);
    }
    return { status: status.value, value: arrayValue };
  }
  static async mergeObjectAsync(status, pairs) {
    const syncPairs = [];
    for (const pair of pairs) {
      const key = await pair.key;
      const value = await pair.value;
      syncPairs.push({
        key,
        value
      });
    }
    return _ParseStatus.mergeObjectSync(status, syncPairs);
  }
  static mergeObjectSync(status, pairs) {
    const finalObject = {};
    for (const pair of pairs) {
      const { key, value } = pair;
      if (key.status === "aborted")
        return INVALID;
      if (value.status === "aborted")
        return INVALID;
      if (key.status === "dirty")
        status.dirty();
      if (value.status === "dirty")
        status.dirty();
      if (key.value !== "__proto__" && (typeof value.value !== "undefined" || pair.alwaysSet)) {
        finalObject[key.value] = value.value;
      }
    }
    return { status: status.value, value: finalObject };
  }
};
var INVALID = Object.freeze({
  status: "aborted"
});
var DIRTY = (value) => ({ status: "dirty", value });
var OK = (value) => ({ status: "valid", value });
var isAborted = (x) => x.status === "aborted";
var isDirty = (x) => x.status === "dirty";
var isValid = (x) => x.status === "valid";
var isAsync = (x) => typeof Promise !== "undefined" && x instanceof Promise;

// node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/helpers/errorUtil.js
var errorUtil;
(function(errorUtil2) {
  errorUtil2.errToObj = (message) => typeof message === "string" ? { message } : message || {};
  errorUtil2.toString = (message) => typeof message === "string" ? message : message?.message;
})(errorUtil || (errorUtil = {}));

// node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/types.js
var ParseInputLazyPath = class {
  constructor(parent, value, path2, key) {
    this._cachedPath = [];
    this.parent = parent;
    this.data = value;
    this._path = path2;
    this._key = key;
  }
  get path() {
    if (!this._cachedPath.length) {
      if (Array.isArray(this._key)) {
        this._cachedPath.push(...this._path, ...this._key);
      } else {
        this._cachedPath.push(...this._path, this._key);
      }
    }
    return this._cachedPath;
  }
};
var handleResult = (ctx, result) => {
  if (isValid(result)) {
    return { success: true, data: result.value };
  } else {
    if (!ctx.common.issues.length) {
      throw new Error("Validation failed but no issues detected.");
    }
    return {
      success: false,
      get error() {
        if (this._error)
          return this._error;
        const error = new ZodError(ctx.common.issues);
        this._error = error;
        return this._error;
      }
    };
  }
};
function processCreateParams(params) {
  if (!params)
    return {};
  const { errorMap: errorMap2, invalid_type_error, required_error, description } = params;
  if (errorMap2 && (invalid_type_error || required_error)) {
    throw new Error(`Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`);
  }
  if (errorMap2)
    return { errorMap: errorMap2, description };
  const customMap = (iss, ctx) => {
    const { message } = params;
    if (iss.code === "invalid_enum_value") {
      return { message: message ?? ctx.defaultError };
    }
    if (typeof ctx.data === "undefined") {
      return { message: message ?? required_error ?? ctx.defaultError };
    }
    if (iss.code !== "invalid_type")
      return { message: ctx.defaultError };
    return { message: message ?? invalid_type_error ?? ctx.defaultError };
  };
  return { errorMap: customMap, description };
}
var ZodType = class {
  get description() {
    return this._def.description;
  }
  _getType(input) {
    return getParsedType(input.data);
  }
  _getOrReturnCtx(input, ctx) {
    return ctx || {
      common: input.parent.common,
      data: input.data,
      parsedType: getParsedType(input.data),
      schemaErrorMap: this._def.errorMap,
      path: input.path,
      parent: input.parent
    };
  }
  _processInputParams(input) {
    return {
      status: new ParseStatus(),
      ctx: {
        common: input.parent.common,
        data: input.data,
        parsedType: getParsedType(input.data),
        schemaErrorMap: this._def.errorMap,
        path: input.path,
        parent: input.parent
      }
    };
  }
  _parseSync(input) {
    const result = this._parse(input);
    if (isAsync(result)) {
      throw new Error("Synchronous parse encountered promise.");
    }
    return result;
  }
  _parseAsync(input) {
    const result = this._parse(input);
    return Promise.resolve(result);
  }
  parse(data, params) {
    const result = this.safeParse(data, params);
    if (result.success)
      return result.data;
    throw result.error;
  }
  safeParse(data, params) {
    const ctx = {
      common: {
        issues: [],
        async: params?.async ?? false,
        contextualErrorMap: params?.errorMap
      },
      path: params?.path || [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    const result = this._parseSync({ data, path: ctx.path, parent: ctx });
    return handleResult(ctx, result);
  }
  "~validate"(data) {
    const ctx = {
      common: {
        issues: [],
        async: !!this["~standard"].async
      },
      path: [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    if (!this["~standard"].async) {
      try {
        const result = this._parseSync({ data, path: [], parent: ctx });
        return isValid(result) ? {
          value: result.value
        } : {
          issues: ctx.common.issues
        };
      } catch (err) {
        if (err?.message?.toLowerCase()?.includes("encountered")) {
          this["~standard"].async = true;
        }
        ctx.common = {
          issues: [],
          async: true
        };
      }
    }
    return this._parseAsync({ data, path: [], parent: ctx }).then((result) => isValid(result) ? {
      value: result.value
    } : {
      issues: ctx.common.issues
    });
  }
  async parseAsync(data, params) {
    const result = await this.safeParseAsync(data, params);
    if (result.success)
      return result.data;
    throw result.error;
  }
  async safeParseAsync(data, params) {
    const ctx = {
      common: {
        issues: [],
        contextualErrorMap: params?.errorMap,
        async: true
      },
      path: params?.path || [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    const maybeAsyncResult = this._parse({ data, path: ctx.path, parent: ctx });
    const result = await (isAsync(maybeAsyncResult) ? maybeAsyncResult : Promise.resolve(maybeAsyncResult));
    return handleResult(ctx, result);
  }
  refine(check, message) {
    const getIssueProperties = (val) => {
      if (typeof message === "string" || typeof message === "undefined") {
        return { message };
      } else if (typeof message === "function") {
        return message(val);
      } else {
        return message;
      }
    };
    return this._refinement((val, ctx) => {
      const result = check(val);
      const setError = () => ctx.addIssue({
        code: ZodIssueCode.custom,
        ...getIssueProperties(val)
      });
      if (typeof Promise !== "undefined" && result instanceof Promise) {
        return result.then((data) => {
          if (!data) {
            setError();
            return false;
          } else {
            return true;
          }
        });
      }
      if (!result) {
        setError();
        return false;
      } else {
        return true;
      }
    });
  }
  refinement(check, refinementData) {
    return this._refinement((val, ctx) => {
      if (!check(val)) {
        ctx.addIssue(typeof refinementData === "function" ? refinementData(val, ctx) : refinementData);
        return false;
      } else {
        return true;
      }
    });
  }
  _refinement(refinement) {
    return new ZodEffects({
      schema: this,
      typeName: ZodFirstPartyTypeKind.ZodEffects,
      effect: { type: "refinement", refinement }
    });
  }
  superRefine(refinement) {
    return this._refinement(refinement);
  }
  constructor(def) {
    this.spa = this.safeParseAsync;
    this._def = def;
    this.parse = this.parse.bind(this);
    this.safeParse = this.safeParse.bind(this);
    this.parseAsync = this.parseAsync.bind(this);
    this.safeParseAsync = this.safeParseAsync.bind(this);
    this.spa = this.spa.bind(this);
    this.refine = this.refine.bind(this);
    this.refinement = this.refinement.bind(this);
    this.superRefine = this.superRefine.bind(this);
    this.optional = this.optional.bind(this);
    this.nullable = this.nullable.bind(this);
    this.nullish = this.nullish.bind(this);
    this.array = this.array.bind(this);
    this.promise = this.promise.bind(this);
    this.or = this.or.bind(this);
    this.and = this.and.bind(this);
    this.transform = this.transform.bind(this);
    this.brand = this.brand.bind(this);
    this.default = this.default.bind(this);
    this.catch = this.catch.bind(this);
    this.describe = this.describe.bind(this);
    this.pipe = this.pipe.bind(this);
    this.readonly = this.readonly.bind(this);
    this.isNullable = this.isNullable.bind(this);
    this.isOptional = this.isOptional.bind(this);
    this["~standard"] = {
      version: 1,
      vendor: "zod",
      validate: (data) => this["~validate"](data)
    };
  }
  optional() {
    return ZodOptional.create(this, this._def);
  }
  nullable() {
    return ZodNullable.create(this, this._def);
  }
  nullish() {
    return this.nullable().optional();
  }
  array() {
    return ZodArray.create(this);
  }
  promise() {
    return ZodPromise.create(this, this._def);
  }
  or(option) {
    return ZodUnion.create([this, option], this._def);
  }
  and(incoming) {
    return ZodIntersection.create(this, incoming, this._def);
  }
  transform(transform) {
    return new ZodEffects({
      ...processCreateParams(this._def),
      schema: this,
      typeName: ZodFirstPartyTypeKind.ZodEffects,
      effect: { type: "transform", transform }
    });
  }
  default(def) {
    const defaultValueFunc = typeof def === "function" ? def : () => def;
    return new ZodDefault({
      ...processCreateParams(this._def),
      innerType: this,
      defaultValue: defaultValueFunc,
      typeName: ZodFirstPartyTypeKind.ZodDefault
    });
  }
  brand() {
    return new ZodBranded({
      typeName: ZodFirstPartyTypeKind.ZodBranded,
      type: this,
      ...processCreateParams(this._def)
    });
  }
  catch(def) {
    const catchValueFunc = typeof def === "function" ? def : () => def;
    return new ZodCatch({
      ...processCreateParams(this._def),
      innerType: this,
      catchValue: catchValueFunc,
      typeName: ZodFirstPartyTypeKind.ZodCatch
    });
  }
  describe(description) {
    const This = this.constructor;
    return new This({
      ...this._def,
      description
    });
  }
  pipe(target) {
    return ZodPipeline.create(this, target);
  }
  readonly() {
    return ZodReadonly.create(this);
  }
  isOptional() {
    return this.safeParse(void 0).success;
  }
  isNullable() {
    return this.safeParse(null).success;
  }
};
var cuidRegex = /^c[^\s-]{8,}$/i;
var cuid2Regex = /^[0-9a-z]+$/;
var ulidRegex = /^[0-9A-HJKMNP-TV-Z]{26}$/i;
var uuidRegex = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i;
var nanoidRegex = /^[a-z0-9_-]{21}$/i;
var jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/;
var durationRegex = /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/;
var emailRegex = /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i;
var _emojiRegex = `^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$`;
var emojiRegex;
var ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
var ipv4CidrRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/;
var ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
var ipv6CidrRegex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/;
var base64Regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
var base64urlRegex = /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/;
var dateRegexSource = `((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))`;
var dateRegex = new RegExp(`^${dateRegexSource}$`);
function timeRegexSource(args) {
  let secondsRegexSource = `[0-5]\\d`;
  if (args.precision) {
    secondsRegexSource = `${secondsRegexSource}\\.\\d{${args.precision}}`;
  } else if (args.precision == null) {
    secondsRegexSource = `${secondsRegexSource}(\\.\\d+)?`;
  }
  const secondsQuantifier = args.precision ? "+" : "?";
  return `([01]\\d|2[0-3]):[0-5]\\d(:${secondsRegexSource})${secondsQuantifier}`;
}
function timeRegex(args) {
  return new RegExp(`^${timeRegexSource(args)}$`);
}
function datetimeRegex(args) {
  let regex = `${dateRegexSource}T${timeRegexSource(args)}`;
  const opts = [];
  opts.push(args.local ? `Z?` : `Z`);
  if (args.offset)
    opts.push(`([+-]\\d{2}:?\\d{2})`);
  regex = `${regex}(${opts.join("|")})`;
  return new RegExp(`^${regex}$`);
}
function isValidIP(ip, version2) {
  if ((version2 === "v4" || !version2) && ipv4Regex.test(ip)) {
    return true;
  }
  if ((version2 === "v6" || !version2) && ipv6Regex.test(ip)) {
    return true;
  }
  return false;
}
function isValidJWT(jwt, alg) {
  if (!jwtRegex.test(jwt))
    return false;
  try {
    const [header] = jwt.split(".");
    if (!header)
      return false;
    const base64 = header.replace(/-/g, "+").replace(/_/g, "/").padEnd(header.length + (4 - header.length % 4) % 4, "=");
    const decoded = JSON.parse(atob(base64));
    if (typeof decoded !== "object" || decoded === null)
      return false;
    if ("typ" in decoded && decoded?.typ !== "JWT")
      return false;
    if (!decoded.alg)
      return false;
    if (alg && decoded.alg !== alg)
      return false;
    return true;
  } catch {
    return false;
  }
}
function isValidCidr(ip, version2) {
  if ((version2 === "v4" || !version2) && ipv4CidrRegex.test(ip)) {
    return true;
  }
  if ((version2 === "v6" || !version2) && ipv6CidrRegex.test(ip)) {
    return true;
  }
  return false;
}
var ZodString = class _ZodString extends ZodType {
  _parse(input) {
    if (this._def.coerce) {
      input.data = String(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.string) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.string,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    const status = new ParseStatus();
    let ctx = void 0;
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        if (input.data.length < check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            minimum: check.value,
            type: "string",
            inclusive: true,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        if (input.data.length > check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            maximum: check.value,
            type: "string",
            inclusive: true,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "length") {
        const tooBig = input.data.length > check.value;
        const tooSmall = input.data.length < check.value;
        if (tooBig || tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          if (tooBig) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_big,
              maximum: check.value,
              type: "string",
              inclusive: true,
              exact: true,
              message: check.message
            });
          } else if (tooSmall) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_small,
              minimum: check.value,
              type: "string",
              inclusive: true,
              exact: true,
              message: check.message
            });
          }
          status.dirty();
        }
      } else if (check.kind === "email") {
        if (!emailRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "email",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "emoji") {
        if (!emojiRegex) {
          emojiRegex = new RegExp(_emojiRegex, "u");
        }
        if (!emojiRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "emoji",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "uuid") {
        if (!uuidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "uuid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "nanoid") {
        if (!nanoidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "nanoid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "cuid") {
        if (!cuidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cuid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "cuid2") {
        if (!cuid2Regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cuid2",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "ulid") {
        if (!ulidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "ulid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "url") {
        try {
          new URL(input.data);
        } catch {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "url",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "regex") {
        check.regex.lastIndex = 0;
        const testResult = check.regex.test(input.data);
        if (!testResult) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "regex",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "trim") {
        input.data = input.data.trim();
      } else if (check.kind === "includes") {
        if (!input.data.includes(check.value, check.position)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { includes: check.value, position: check.position },
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "toLowerCase") {
        input.data = input.data.toLowerCase();
      } else if (check.kind === "toUpperCase") {
        input.data = input.data.toUpperCase();
      } else if (check.kind === "startsWith") {
        if (!input.data.startsWith(check.value)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { startsWith: check.value },
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "endsWith") {
        if (!input.data.endsWith(check.value)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { endsWith: check.value },
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "datetime") {
        const regex = datetimeRegex(check);
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "datetime",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "date") {
        const regex = dateRegex;
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "date",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "time") {
        const regex = timeRegex(check);
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "time",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "duration") {
        if (!durationRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "duration",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "ip") {
        if (!isValidIP(input.data, check.version)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "ip",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "jwt") {
        if (!isValidJWT(input.data, check.alg)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "jwt",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "cidr") {
        if (!isValidCidr(input.data, check.version)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cidr",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "base64") {
        if (!base64Regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "base64",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "base64url") {
        if (!base64urlRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "base64url",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return { status: status.value, value: input.data };
  }
  _regex(regex, validation, message) {
    return this.refinement((data) => regex.test(data), {
      validation,
      code: ZodIssueCode.invalid_string,
      ...errorUtil.errToObj(message)
    });
  }
  _addCheck(check) {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  email(message) {
    return this._addCheck({ kind: "email", ...errorUtil.errToObj(message) });
  }
  url(message) {
    return this._addCheck({ kind: "url", ...errorUtil.errToObj(message) });
  }
  emoji(message) {
    return this._addCheck({ kind: "emoji", ...errorUtil.errToObj(message) });
  }
  uuid(message) {
    return this._addCheck({ kind: "uuid", ...errorUtil.errToObj(message) });
  }
  nanoid(message) {
    return this._addCheck({ kind: "nanoid", ...errorUtil.errToObj(message) });
  }
  cuid(message) {
    return this._addCheck({ kind: "cuid", ...errorUtil.errToObj(message) });
  }
  cuid2(message) {
    return this._addCheck({ kind: "cuid2", ...errorUtil.errToObj(message) });
  }
  ulid(message) {
    return this._addCheck({ kind: "ulid", ...errorUtil.errToObj(message) });
  }
  base64(message) {
    return this._addCheck({ kind: "base64", ...errorUtil.errToObj(message) });
  }
  base64url(message) {
    return this._addCheck({
      kind: "base64url",
      ...errorUtil.errToObj(message)
    });
  }
  jwt(options) {
    return this._addCheck({ kind: "jwt", ...errorUtil.errToObj(options) });
  }
  ip(options) {
    return this._addCheck({ kind: "ip", ...errorUtil.errToObj(options) });
  }
  cidr(options) {
    return this._addCheck({ kind: "cidr", ...errorUtil.errToObj(options) });
  }
  datetime(options) {
    if (typeof options === "string") {
      return this._addCheck({
        kind: "datetime",
        precision: null,
        offset: false,
        local: false,
        message: options
      });
    }
    return this._addCheck({
      kind: "datetime",
      precision: typeof options?.precision === "undefined" ? null : options?.precision,
      offset: options?.offset ?? false,
      local: options?.local ?? false,
      ...errorUtil.errToObj(options?.message)
    });
  }
  date(message) {
    return this._addCheck({ kind: "date", message });
  }
  time(options) {
    if (typeof options === "string") {
      return this._addCheck({
        kind: "time",
        precision: null,
        message: options
      });
    }
    return this._addCheck({
      kind: "time",
      precision: typeof options?.precision === "undefined" ? null : options?.precision,
      ...errorUtil.errToObj(options?.message)
    });
  }
  duration(message) {
    return this._addCheck({ kind: "duration", ...errorUtil.errToObj(message) });
  }
  regex(regex, message) {
    return this._addCheck({
      kind: "regex",
      regex,
      ...errorUtil.errToObj(message)
    });
  }
  includes(value, options) {
    return this._addCheck({
      kind: "includes",
      value,
      position: options?.position,
      ...errorUtil.errToObj(options?.message)
    });
  }
  startsWith(value, message) {
    return this._addCheck({
      kind: "startsWith",
      value,
      ...errorUtil.errToObj(message)
    });
  }
  endsWith(value, message) {
    return this._addCheck({
      kind: "endsWith",
      value,
      ...errorUtil.errToObj(message)
    });
  }
  min(minLength, message) {
    return this._addCheck({
      kind: "min",
      value: minLength,
      ...errorUtil.errToObj(message)
    });
  }
  max(maxLength, message) {
    return this._addCheck({
      kind: "max",
      value: maxLength,
      ...errorUtil.errToObj(message)
    });
  }
  length(len, message) {
    return this._addCheck({
      kind: "length",
      value: len,
      ...errorUtil.errToObj(message)
    });
  }
  /**
   * Equivalent to `.min(1)`
   */
  nonempty(message) {
    return this.min(1, errorUtil.errToObj(message));
  }
  trim() {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "trim" }]
    });
  }
  toLowerCase() {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "toLowerCase" }]
    });
  }
  toUpperCase() {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "toUpperCase" }]
    });
  }
  get isDatetime() {
    return !!this._def.checks.find((ch) => ch.kind === "datetime");
  }
  get isDate() {
    return !!this._def.checks.find((ch) => ch.kind === "date");
  }
  get isTime() {
    return !!this._def.checks.find((ch) => ch.kind === "time");
  }
  get isDuration() {
    return !!this._def.checks.find((ch) => ch.kind === "duration");
  }
  get isEmail() {
    return !!this._def.checks.find((ch) => ch.kind === "email");
  }
  get isURL() {
    return !!this._def.checks.find((ch) => ch.kind === "url");
  }
  get isEmoji() {
    return !!this._def.checks.find((ch) => ch.kind === "emoji");
  }
  get isUUID() {
    return !!this._def.checks.find((ch) => ch.kind === "uuid");
  }
  get isNANOID() {
    return !!this._def.checks.find((ch) => ch.kind === "nanoid");
  }
  get isCUID() {
    return !!this._def.checks.find((ch) => ch.kind === "cuid");
  }
  get isCUID2() {
    return !!this._def.checks.find((ch) => ch.kind === "cuid2");
  }
  get isULID() {
    return !!this._def.checks.find((ch) => ch.kind === "ulid");
  }
  get isIP() {
    return !!this._def.checks.find((ch) => ch.kind === "ip");
  }
  get isCIDR() {
    return !!this._def.checks.find((ch) => ch.kind === "cidr");
  }
  get isBase64() {
    return !!this._def.checks.find((ch) => ch.kind === "base64");
  }
  get isBase64url() {
    return !!this._def.checks.find((ch) => ch.kind === "base64url");
  }
  get minLength() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxLength() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
};
ZodString.create = (params) => {
  return new ZodString({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodString,
    coerce: params?.coerce ?? false,
    ...processCreateParams(params)
  });
};
function floatSafeRemainder(val, step) {
  const valDecCount = (val.toString().split(".")[1] || "").length;
  const stepDecCount = (step.toString().split(".")[1] || "").length;
  const decCount = valDecCount > stepDecCount ? valDecCount : stepDecCount;
  const valInt = Number.parseInt(val.toFixed(decCount).replace(".", ""));
  const stepInt = Number.parseInt(step.toFixed(decCount).replace(".", ""));
  return valInt % stepInt / 10 ** decCount;
}
var ZodNumber = class _ZodNumber extends ZodType {
  constructor() {
    super(...arguments);
    this.min = this.gte;
    this.max = this.lte;
    this.step = this.multipleOf;
  }
  _parse(input) {
    if (this._def.coerce) {
      input.data = Number(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.number) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.number,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    let ctx = void 0;
    const status = new ParseStatus();
    for (const check of this._def.checks) {
      if (check.kind === "int") {
        if (!util.isInteger(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: "integer",
            received: "float",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "min") {
        const tooSmall = check.inclusive ? input.data < check.value : input.data <= check.value;
        if (tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            minimum: check.value,
            type: "number",
            inclusive: check.inclusive,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        const tooBig = check.inclusive ? input.data > check.value : input.data >= check.value;
        if (tooBig) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            maximum: check.value,
            type: "number",
            inclusive: check.inclusive,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "multipleOf") {
        if (floatSafeRemainder(input.data, check.value) !== 0) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_multiple_of,
            multipleOf: check.value,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "finite") {
        if (!Number.isFinite(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_finite,
            message: check.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return { status: status.value, value: input.data };
  }
  gte(value, message) {
    return this.setLimit("min", value, true, errorUtil.toString(message));
  }
  gt(value, message) {
    return this.setLimit("min", value, false, errorUtil.toString(message));
  }
  lte(value, message) {
    return this.setLimit("max", value, true, errorUtil.toString(message));
  }
  lt(value, message) {
    return this.setLimit("max", value, false, errorUtil.toString(message));
  }
  setLimit(kind, value, inclusive, message) {
    return new _ZodNumber({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind,
          value,
          inclusive,
          message: errorUtil.toString(message)
        }
      ]
    });
  }
  _addCheck(check) {
    return new _ZodNumber({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  int(message) {
    return this._addCheck({
      kind: "int",
      message: errorUtil.toString(message)
    });
  }
  positive(message) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  negative(message) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  nonpositive(message) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  nonnegative(message) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  multipleOf(value, message) {
    return this._addCheck({
      kind: "multipleOf",
      value,
      message: errorUtil.toString(message)
    });
  }
  finite(message) {
    return this._addCheck({
      kind: "finite",
      message: errorUtil.toString(message)
    });
  }
  safe(message) {
    return this._addCheck({
      kind: "min",
      inclusive: true,
      value: Number.MIN_SAFE_INTEGER,
      message: errorUtil.toString(message)
    })._addCheck({
      kind: "max",
      inclusive: true,
      value: Number.MAX_SAFE_INTEGER,
      message: errorUtil.toString(message)
    });
  }
  get minValue() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxValue() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
  get isInt() {
    return !!this._def.checks.find((ch) => ch.kind === "int" || ch.kind === "multipleOf" && util.isInteger(ch.value));
  }
  get isFinite() {
    let max = null;
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "finite" || ch.kind === "int" || ch.kind === "multipleOf") {
        return true;
      } else if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      } else if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return Number.isFinite(min) && Number.isFinite(max);
  }
};
ZodNumber.create = (params) => {
  return new ZodNumber({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodNumber,
    coerce: params?.coerce || false,
    ...processCreateParams(params)
  });
};
var ZodBigInt = class _ZodBigInt extends ZodType {
  constructor() {
    super(...arguments);
    this.min = this.gte;
    this.max = this.lte;
  }
  _parse(input) {
    if (this._def.coerce) {
      try {
        input.data = BigInt(input.data);
      } catch {
        return this._getInvalidInput(input);
      }
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.bigint) {
      return this._getInvalidInput(input);
    }
    let ctx = void 0;
    const status = new ParseStatus();
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        const tooSmall = check.inclusive ? input.data < check.value : input.data <= check.value;
        if (tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            type: "bigint",
            minimum: check.value,
            inclusive: check.inclusive,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        const tooBig = check.inclusive ? input.data > check.value : input.data >= check.value;
        if (tooBig) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            type: "bigint",
            maximum: check.value,
            inclusive: check.inclusive,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "multipleOf") {
        if (input.data % check.value !== BigInt(0)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_multiple_of,
            multipleOf: check.value,
            message: check.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return { status: status.value, value: input.data };
  }
  _getInvalidInput(input) {
    const ctx = this._getOrReturnCtx(input);
    addIssueToContext(ctx, {
      code: ZodIssueCode.invalid_type,
      expected: ZodParsedType.bigint,
      received: ctx.parsedType
    });
    return INVALID;
  }
  gte(value, message) {
    return this.setLimit("min", value, true, errorUtil.toString(message));
  }
  gt(value, message) {
    return this.setLimit("min", value, false, errorUtil.toString(message));
  }
  lte(value, message) {
    return this.setLimit("max", value, true, errorUtil.toString(message));
  }
  lt(value, message) {
    return this.setLimit("max", value, false, errorUtil.toString(message));
  }
  setLimit(kind, value, inclusive, message) {
    return new _ZodBigInt({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind,
          value,
          inclusive,
          message: errorUtil.toString(message)
        }
      ]
    });
  }
  _addCheck(check) {
    return new _ZodBigInt({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  positive(message) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  negative(message) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  nonpositive(message) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  nonnegative(message) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  multipleOf(value, message) {
    return this._addCheck({
      kind: "multipleOf",
      value,
      message: errorUtil.toString(message)
    });
  }
  get minValue() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxValue() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
};
ZodBigInt.create = (params) => {
  return new ZodBigInt({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodBigInt,
    coerce: params?.coerce ?? false,
    ...processCreateParams(params)
  });
};
var ZodBoolean = class extends ZodType {
  _parse(input) {
    if (this._def.coerce) {
      input.data = Boolean(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.boolean) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.boolean,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodBoolean.create = (params) => {
  return new ZodBoolean({
    typeName: ZodFirstPartyTypeKind.ZodBoolean,
    coerce: params?.coerce || false,
    ...processCreateParams(params)
  });
};
var ZodDate = class _ZodDate extends ZodType {
  _parse(input) {
    if (this._def.coerce) {
      input.data = new Date(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.date) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.date,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    if (Number.isNaN(input.data.getTime())) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_date
      });
      return INVALID;
    }
    const status = new ParseStatus();
    let ctx = void 0;
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        if (input.data.getTime() < check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            message: check.message,
            inclusive: true,
            exact: false,
            minimum: check.value,
            type: "date"
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        if (input.data.getTime() > check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            message: check.message,
            inclusive: true,
            exact: false,
            maximum: check.value,
            type: "date"
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return {
      status: status.value,
      value: new Date(input.data.getTime())
    };
  }
  _addCheck(check) {
    return new _ZodDate({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  min(minDate, message) {
    return this._addCheck({
      kind: "min",
      value: minDate.getTime(),
      message: errorUtil.toString(message)
    });
  }
  max(maxDate, message) {
    return this._addCheck({
      kind: "max",
      value: maxDate.getTime(),
      message: errorUtil.toString(message)
    });
  }
  get minDate() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min != null ? new Date(min) : null;
  }
  get maxDate() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max != null ? new Date(max) : null;
  }
};
ZodDate.create = (params) => {
  return new ZodDate({
    checks: [],
    coerce: params?.coerce || false,
    typeName: ZodFirstPartyTypeKind.ZodDate,
    ...processCreateParams(params)
  });
};
var ZodSymbol = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.symbol) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.symbol,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodSymbol.create = (params) => {
  return new ZodSymbol({
    typeName: ZodFirstPartyTypeKind.ZodSymbol,
    ...processCreateParams(params)
  });
};
var ZodUndefined = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.undefined) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.undefined,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodUndefined.create = (params) => {
  return new ZodUndefined({
    typeName: ZodFirstPartyTypeKind.ZodUndefined,
    ...processCreateParams(params)
  });
};
var ZodNull = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.null) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.null,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodNull.create = (params) => {
  return new ZodNull({
    typeName: ZodFirstPartyTypeKind.ZodNull,
    ...processCreateParams(params)
  });
};
var ZodAny = class extends ZodType {
  constructor() {
    super(...arguments);
    this._any = true;
  }
  _parse(input) {
    return OK(input.data);
  }
};
ZodAny.create = (params) => {
  return new ZodAny({
    typeName: ZodFirstPartyTypeKind.ZodAny,
    ...processCreateParams(params)
  });
};
var ZodUnknown = class extends ZodType {
  constructor() {
    super(...arguments);
    this._unknown = true;
  }
  _parse(input) {
    return OK(input.data);
  }
};
ZodUnknown.create = (params) => {
  return new ZodUnknown({
    typeName: ZodFirstPartyTypeKind.ZodUnknown,
    ...processCreateParams(params)
  });
};
var ZodNever = class extends ZodType {
  _parse(input) {
    const ctx = this._getOrReturnCtx(input);
    addIssueToContext(ctx, {
      code: ZodIssueCode.invalid_type,
      expected: ZodParsedType.never,
      received: ctx.parsedType
    });
    return INVALID;
  }
};
ZodNever.create = (params) => {
  return new ZodNever({
    typeName: ZodFirstPartyTypeKind.ZodNever,
    ...processCreateParams(params)
  });
};
var ZodVoid = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.undefined) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.void,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodVoid.create = (params) => {
  return new ZodVoid({
    typeName: ZodFirstPartyTypeKind.ZodVoid,
    ...processCreateParams(params)
  });
};
var ZodArray = class _ZodArray extends ZodType {
  _parse(input) {
    const { ctx, status } = this._processInputParams(input);
    const def = this._def;
    if (ctx.parsedType !== ZodParsedType.array) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.array,
        received: ctx.parsedType
      });
      return INVALID;
    }
    if (def.exactLength !== null) {
      const tooBig = ctx.data.length > def.exactLength.value;
      const tooSmall = ctx.data.length < def.exactLength.value;
      if (tooBig || tooSmall) {
        addIssueToContext(ctx, {
          code: tooBig ? ZodIssueCode.too_big : ZodIssueCode.too_small,
          minimum: tooSmall ? def.exactLength.value : void 0,
          maximum: tooBig ? def.exactLength.value : void 0,
          type: "array",
          inclusive: true,
          exact: true,
          message: def.exactLength.message
        });
        status.dirty();
      }
    }
    if (def.minLength !== null) {
      if (ctx.data.length < def.minLength.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_small,
          minimum: def.minLength.value,
          type: "array",
          inclusive: true,
          exact: false,
          message: def.minLength.message
        });
        status.dirty();
      }
    }
    if (def.maxLength !== null) {
      if (ctx.data.length > def.maxLength.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_big,
          maximum: def.maxLength.value,
          type: "array",
          inclusive: true,
          exact: false,
          message: def.maxLength.message
        });
        status.dirty();
      }
    }
    if (ctx.common.async) {
      return Promise.all([...ctx.data].map((item, i) => {
        return def.type._parseAsync(new ParseInputLazyPath(ctx, item, ctx.path, i));
      })).then((result2) => {
        return ParseStatus.mergeArray(status, result2);
      });
    }
    const result = [...ctx.data].map((item, i) => {
      return def.type._parseSync(new ParseInputLazyPath(ctx, item, ctx.path, i));
    });
    return ParseStatus.mergeArray(status, result);
  }
  get element() {
    return this._def.type;
  }
  min(minLength, message) {
    return new _ZodArray({
      ...this._def,
      minLength: { value: minLength, message: errorUtil.toString(message) }
    });
  }
  max(maxLength, message) {
    return new _ZodArray({
      ...this._def,
      maxLength: { value: maxLength, message: errorUtil.toString(message) }
    });
  }
  length(len, message) {
    return new _ZodArray({
      ...this._def,
      exactLength: { value: len, message: errorUtil.toString(message) }
    });
  }
  nonempty(message) {
    return this.min(1, message);
  }
};
ZodArray.create = (schema, params) => {
  return new ZodArray({
    type: schema,
    minLength: null,
    maxLength: null,
    exactLength: null,
    typeName: ZodFirstPartyTypeKind.ZodArray,
    ...processCreateParams(params)
  });
};
function deepPartialify(schema) {
  if (schema instanceof ZodObject) {
    const newShape = {};
    for (const key in schema.shape) {
      const fieldSchema = schema.shape[key];
      newShape[key] = ZodOptional.create(deepPartialify(fieldSchema));
    }
    return new ZodObject({
      ...schema._def,
      shape: () => newShape
    });
  } else if (schema instanceof ZodArray) {
    return new ZodArray({
      ...schema._def,
      type: deepPartialify(schema.element)
    });
  } else if (schema instanceof ZodOptional) {
    return ZodOptional.create(deepPartialify(schema.unwrap()));
  } else if (schema instanceof ZodNullable) {
    return ZodNullable.create(deepPartialify(schema.unwrap()));
  } else if (schema instanceof ZodTuple) {
    return ZodTuple.create(schema.items.map((item) => deepPartialify(item)));
  } else {
    return schema;
  }
}
var ZodObject = class _ZodObject extends ZodType {
  constructor() {
    super(...arguments);
    this._cached = null;
    this.nonstrict = this.passthrough;
    this.augment = this.extend;
  }
  _getCached() {
    if (this._cached !== null)
      return this._cached;
    const shape = this._def.shape();
    const keys = util.objectKeys(shape);
    this._cached = { shape, keys };
    return this._cached;
  }
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.object) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    const { status, ctx } = this._processInputParams(input);
    const { shape, keys: shapeKeys } = this._getCached();
    const extraKeys = [];
    if (!(this._def.catchall instanceof ZodNever && this._def.unknownKeys === "strip")) {
      for (const key in ctx.data) {
        if (!shapeKeys.includes(key)) {
          extraKeys.push(key);
        }
      }
    }
    const pairs = [];
    for (const key of shapeKeys) {
      const keyValidator = shape[key];
      const value = ctx.data[key];
      pairs.push({
        key: { status: "valid", value: key },
        value: keyValidator._parse(new ParseInputLazyPath(ctx, value, ctx.path, key)),
        alwaysSet: key in ctx.data
      });
    }
    if (this._def.catchall instanceof ZodNever) {
      const unknownKeys = this._def.unknownKeys;
      if (unknownKeys === "passthrough") {
        for (const key of extraKeys) {
          pairs.push({
            key: { status: "valid", value: key },
            value: { status: "valid", value: ctx.data[key] }
          });
        }
      } else if (unknownKeys === "strict") {
        if (extraKeys.length > 0) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.unrecognized_keys,
            keys: extraKeys
          });
          status.dirty();
        }
      } else if (unknownKeys === "strip") {
      } else {
        throw new Error(`Internal ZodObject error: invalid unknownKeys value.`);
      }
    } else {
      const catchall = this._def.catchall;
      for (const key of extraKeys) {
        const value = ctx.data[key];
        pairs.push({
          key: { status: "valid", value: key },
          value: catchall._parse(
            new ParseInputLazyPath(ctx, value, ctx.path, key)
            //, ctx.child(key), value, getParsedType(value)
          ),
          alwaysSet: key in ctx.data
        });
      }
    }
    if (ctx.common.async) {
      return Promise.resolve().then(async () => {
        const syncPairs = [];
        for (const pair of pairs) {
          const key = await pair.key;
          const value = await pair.value;
          syncPairs.push({
            key,
            value,
            alwaysSet: pair.alwaysSet
          });
        }
        return syncPairs;
      }).then((syncPairs) => {
        return ParseStatus.mergeObjectSync(status, syncPairs);
      });
    } else {
      return ParseStatus.mergeObjectSync(status, pairs);
    }
  }
  get shape() {
    return this._def.shape();
  }
  strict(message) {
    errorUtil.errToObj;
    return new _ZodObject({
      ...this._def,
      unknownKeys: "strict",
      ...message !== void 0 ? {
        errorMap: (issue, ctx) => {
          const defaultError = this._def.errorMap?.(issue, ctx).message ?? ctx.defaultError;
          if (issue.code === "unrecognized_keys")
            return {
              message: errorUtil.errToObj(message).message ?? defaultError
            };
          return {
            message: defaultError
          };
        }
      } : {}
    });
  }
  strip() {
    return new _ZodObject({
      ...this._def,
      unknownKeys: "strip"
    });
  }
  passthrough() {
    return new _ZodObject({
      ...this._def,
      unknownKeys: "passthrough"
    });
  }
  // const AugmentFactory =
  //   <Def extends ZodObjectDef>(def: Def) =>
  //   <Augmentation extends ZodRawShape>(
  //     augmentation: Augmentation
  //   ): ZodObject<
  //     extendShape<ReturnType<Def["shape"]>, Augmentation>,
  //     Def["unknownKeys"],
  //     Def["catchall"]
  //   > => {
  //     return new ZodObject({
  //       ...def,
  //       shape: () => ({
  //         ...def.shape(),
  //         ...augmentation,
  //       }),
  //     }) as any;
  //   };
  extend(augmentation) {
    return new _ZodObject({
      ...this._def,
      shape: () => ({
        ...this._def.shape(),
        ...augmentation
      })
    });
  }
  /**
   * Prior to zod@1.0.12 there was a bug in the
   * inferred type of merged objects. Please
   * upgrade if you are experiencing issues.
   */
  merge(merging) {
    const merged = new _ZodObject({
      unknownKeys: merging._def.unknownKeys,
      catchall: merging._def.catchall,
      shape: () => ({
        ...this._def.shape(),
        ...merging._def.shape()
      }),
      typeName: ZodFirstPartyTypeKind.ZodObject
    });
    return merged;
  }
  // merge<
  //   Incoming extends AnyZodObject,
  //   Augmentation extends Incoming["shape"],
  //   NewOutput extends {
  //     [k in keyof Augmentation | keyof Output]: k extends keyof Augmentation
  //       ? Augmentation[k]["_output"]
  //       : k extends keyof Output
  //       ? Output[k]
  //       : never;
  //   },
  //   NewInput extends {
  //     [k in keyof Augmentation | keyof Input]: k extends keyof Augmentation
  //       ? Augmentation[k]["_input"]
  //       : k extends keyof Input
  //       ? Input[k]
  //       : never;
  //   }
  // >(
  //   merging: Incoming
  // ): ZodObject<
  //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
  //   Incoming["_def"]["unknownKeys"],
  //   Incoming["_def"]["catchall"],
  //   NewOutput,
  //   NewInput
  // > {
  //   const merged: any = new ZodObject({
  //     unknownKeys: merging._def.unknownKeys,
  //     catchall: merging._def.catchall,
  //     shape: () =>
  //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
  //     typeName: ZodFirstPartyTypeKind.ZodObject,
  //   }) as any;
  //   return merged;
  // }
  setKey(key, schema) {
    return this.augment({ [key]: schema });
  }
  // merge<Incoming extends AnyZodObject>(
  //   merging: Incoming
  // ): //ZodObject<T & Incoming["_shape"], UnknownKeys, Catchall> = (merging) => {
  // ZodObject<
  //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
  //   Incoming["_def"]["unknownKeys"],
  //   Incoming["_def"]["catchall"]
  // > {
  //   // const mergedShape = objectUtil.mergeShapes(
  //   //   this._def.shape(),
  //   //   merging._def.shape()
  //   // );
  //   const merged: any = new ZodObject({
  //     unknownKeys: merging._def.unknownKeys,
  //     catchall: merging._def.catchall,
  //     shape: () =>
  //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
  //     typeName: ZodFirstPartyTypeKind.ZodObject,
  //   }) as any;
  //   return merged;
  // }
  catchall(index) {
    return new _ZodObject({
      ...this._def,
      catchall: index
    });
  }
  pick(mask) {
    const shape = {};
    for (const key of util.objectKeys(mask)) {
      if (mask[key] && this.shape[key]) {
        shape[key] = this.shape[key];
      }
    }
    return new _ZodObject({
      ...this._def,
      shape: () => shape
    });
  }
  omit(mask) {
    const shape = {};
    for (const key of util.objectKeys(this.shape)) {
      if (!mask[key]) {
        shape[key] = this.shape[key];
      }
    }
    return new _ZodObject({
      ...this._def,
      shape: () => shape
    });
  }
  /**
   * @deprecated
   */
  deepPartial() {
    return deepPartialify(this);
  }
  partial(mask) {
    const newShape = {};
    for (const key of util.objectKeys(this.shape)) {
      const fieldSchema = this.shape[key];
      if (mask && !mask[key]) {
        newShape[key] = fieldSchema;
      } else {
        newShape[key] = fieldSchema.optional();
      }
    }
    return new _ZodObject({
      ...this._def,
      shape: () => newShape
    });
  }
  required(mask) {
    const newShape = {};
    for (const key of util.objectKeys(this.shape)) {
      if (mask && !mask[key]) {
        newShape[key] = this.shape[key];
      } else {
        const fieldSchema = this.shape[key];
        let newField = fieldSchema;
        while (newField instanceof ZodOptional) {
          newField = newField._def.innerType;
        }
        newShape[key] = newField;
      }
    }
    return new _ZodObject({
      ...this._def,
      shape: () => newShape
    });
  }
  keyof() {
    return createZodEnum(util.objectKeys(this.shape));
  }
};
ZodObject.create = (shape, params) => {
  return new ZodObject({
    shape: () => shape,
    unknownKeys: "strip",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};
ZodObject.strictCreate = (shape, params) => {
  return new ZodObject({
    shape: () => shape,
    unknownKeys: "strict",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};
ZodObject.lazycreate = (shape, params) => {
  return new ZodObject({
    shape,
    unknownKeys: "strip",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};
var ZodUnion = class extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const options = this._def.options;
    function handleResults(results) {
      for (const result of results) {
        if (result.result.status === "valid") {
          return result.result;
        }
      }
      for (const result of results) {
        if (result.result.status === "dirty") {
          ctx.common.issues.push(...result.ctx.common.issues);
          return result.result;
        }
      }
      const unionErrors = results.map((result) => new ZodError(result.ctx.common.issues));
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union,
        unionErrors
      });
      return INVALID;
    }
    if (ctx.common.async) {
      return Promise.all(options.map(async (option) => {
        const childCtx = {
          ...ctx,
          common: {
            ...ctx.common,
            issues: []
          },
          parent: null
        };
        return {
          result: await option._parseAsync({
            data: ctx.data,
            path: ctx.path,
            parent: childCtx
          }),
          ctx: childCtx
        };
      })).then(handleResults);
    } else {
      let dirty = void 0;
      const issues = [];
      for (const option of options) {
        const childCtx = {
          ...ctx,
          common: {
            ...ctx.common,
            issues: []
          },
          parent: null
        };
        const result = option._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: childCtx
        });
        if (result.status === "valid") {
          return result;
        } else if (result.status === "dirty" && !dirty) {
          dirty = { result, ctx: childCtx };
        }
        if (childCtx.common.issues.length) {
          issues.push(childCtx.common.issues);
        }
      }
      if (dirty) {
        ctx.common.issues.push(...dirty.ctx.common.issues);
        return dirty.result;
      }
      const unionErrors = issues.map((issues2) => new ZodError(issues2));
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union,
        unionErrors
      });
      return INVALID;
    }
  }
  get options() {
    return this._def.options;
  }
};
ZodUnion.create = (types, params) => {
  return new ZodUnion({
    options: types,
    typeName: ZodFirstPartyTypeKind.ZodUnion,
    ...processCreateParams(params)
  });
};
var getDiscriminator = (type) => {
  if (type instanceof ZodLazy) {
    return getDiscriminator(type.schema);
  } else if (type instanceof ZodEffects) {
    return getDiscriminator(type.innerType());
  } else if (type instanceof ZodLiteral) {
    return [type.value];
  } else if (type instanceof ZodEnum) {
    return type.options;
  } else if (type instanceof ZodNativeEnum) {
    return util.objectValues(type.enum);
  } else if (type instanceof ZodDefault) {
    return getDiscriminator(type._def.innerType);
  } else if (type instanceof ZodUndefined) {
    return [void 0];
  } else if (type instanceof ZodNull) {
    return [null];
  } else if (type instanceof ZodOptional) {
    return [void 0, ...getDiscriminator(type.unwrap())];
  } else if (type instanceof ZodNullable) {
    return [null, ...getDiscriminator(type.unwrap())];
  } else if (type instanceof ZodBranded) {
    return getDiscriminator(type.unwrap());
  } else if (type instanceof ZodReadonly) {
    return getDiscriminator(type.unwrap());
  } else if (type instanceof ZodCatch) {
    return getDiscriminator(type._def.innerType);
  } else {
    return [];
  }
};
var ZodDiscriminatedUnion = class _ZodDiscriminatedUnion extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.object) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const discriminator = this.discriminator;
    const discriminatorValue = ctx.data[discriminator];
    const option = this.optionsMap.get(discriminatorValue);
    if (!option) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union_discriminator,
        options: Array.from(this.optionsMap.keys()),
        path: [discriminator]
      });
      return INVALID;
    }
    if (ctx.common.async) {
      return option._parseAsync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
    } else {
      return option._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
    }
  }
  get discriminator() {
    return this._def.discriminator;
  }
  get options() {
    return this._def.options;
  }
  get optionsMap() {
    return this._def.optionsMap;
  }
  /**
   * The constructor of the discriminated union schema. Its behaviour is very similar to that of the normal z.union() constructor.
   * However, it only allows a union of objects, all of which need to share a discriminator property. This property must
   * have a different value for each object in the union.
   * @param discriminator the name of the discriminator property
   * @param types an array of object schemas
   * @param params
   */
  static create(discriminator, options, params) {
    const optionsMap = /* @__PURE__ */ new Map();
    for (const type of options) {
      const discriminatorValues = getDiscriminator(type.shape[discriminator]);
      if (!discriminatorValues.length) {
        throw new Error(`A discriminator value for key \`${discriminator}\` could not be extracted from all schema options`);
      }
      for (const value of discriminatorValues) {
        if (optionsMap.has(value)) {
          throw new Error(`Discriminator property ${String(discriminator)} has duplicate value ${String(value)}`);
        }
        optionsMap.set(value, type);
      }
    }
    return new _ZodDiscriminatedUnion({
      typeName: ZodFirstPartyTypeKind.ZodDiscriminatedUnion,
      discriminator,
      options,
      optionsMap,
      ...processCreateParams(params)
    });
  }
};
function mergeValues(a, b) {
  const aType = getParsedType(a);
  const bType = getParsedType(b);
  if (a === b) {
    return { valid: true, data: a };
  } else if (aType === ZodParsedType.object && bType === ZodParsedType.object) {
    const bKeys = util.objectKeys(b);
    const sharedKeys = util.objectKeys(a).filter((key) => bKeys.indexOf(key) !== -1);
    const newObj = { ...a, ...b };
    for (const key of sharedKeys) {
      const sharedValue = mergeValues(a[key], b[key]);
      if (!sharedValue.valid) {
        return { valid: false };
      }
      newObj[key] = sharedValue.data;
    }
    return { valid: true, data: newObj };
  } else if (aType === ZodParsedType.array && bType === ZodParsedType.array) {
    if (a.length !== b.length) {
      return { valid: false };
    }
    const newArray = [];
    for (let index = 0; index < a.length; index++) {
      const itemA = a[index];
      const itemB = b[index];
      const sharedValue = mergeValues(itemA, itemB);
      if (!sharedValue.valid) {
        return { valid: false };
      }
      newArray.push(sharedValue.data);
    }
    return { valid: true, data: newArray };
  } else if (aType === ZodParsedType.date && bType === ZodParsedType.date && +a === +b) {
    return { valid: true, data: a };
  } else {
    return { valid: false };
  }
}
var ZodIntersection = class extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    const handleParsed = (parsedLeft, parsedRight) => {
      if (isAborted(parsedLeft) || isAborted(parsedRight)) {
        return INVALID;
      }
      const merged = mergeValues(parsedLeft.value, parsedRight.value);
      if (!merged.valid) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_intersection_types
        });
        return INVALID;
      }
      if (isDirty(parsedLeft) || isDirty(parsedRight)) {
        status.dirty();
      }
      return { status: status.value, value: merged.data };
    };
    if (ctx.common.async) {
      return Promise.all([
        this._def.left._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        }),
        this._def.right._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        })
      ]).then(([left, right]) => handleParsed(left, right));
    } else {
      return handleParsed(this._def.left._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      }), this._def.right._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      }));
    }
  }
};
ZodIntersection.create = (left, right, params) => {
  return new ZodIntersection({
    left,
    right,
    typeName: ZodFirstPartyTypeKind.ZodIntersection,
    ...processCreateParams(params)
  });
};
var ZodTuple = class _ZodTuple extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.array) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.array,
        received: ctx.parsedType
      });
      return INVALID;
    }
    if (ctx.data.length < this._def.items.length) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.too_small,
        minimum: this._def.items.length,
        inclusive: true,
        exact: false,
        type: "array"
      });
      return INVALID;
    }
    const rest = this._def.rest;
    if (!rest && ctx.data.length > this._def.items.length) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.too_big,
        maximum: this._def.items.length,
        inclusive: true,
        exact: false,
        type: "array"
      });
      status.dirty();
    }
    const items = [...ctx.data].map((item, itemIndex) => {
      const schema = this._def.items[itemIndex] || this._def.rest;
      if (!schema)
        return null;
      return schema._parse(new ParseInputLazyPath(ctx, item, ctx.path, itemIndex));
    }).filter((x) => !!x);
    if (ctx.common.async) {
      return Promise.all(items).then((results) => {
        return ParseStatus.mergeArray(status, results);
      });
    } else {
      return ParseStatus.mergeArray(status, items);
    }
  }
  get items() {
    return this._def.items;
  }
  rest(rest) {
    return new _ZodTuple({
      ...this._def,
      rest
    });
  }
};
ZodTuple.create = (schemas, params) => {
  if (!Array.isArray(schemas)) {
    throw new Error("You must pass an array of schemas to z.tuple([ ... ])");
  }
  return new ZodTuple({
    items: schemas,
    typeName: ZodFirstPartyTypeKind.ZodTuple,
    rest: null,
    ...processCreateParams(params)
  });
};
var ZodRecord = class _ZodRecord extends ZodType {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.object) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const pairs = [];
    const keyType = this._def.keyType;
    const valueType = this._def.valueType;
    for (const key in ctx.data) {
      pairs.push({
        key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, key)),
        value: valueType._parse(new ParseInputLazyPath(ctx, ctx.data[key], ctx.path, key)),
        alwaysSet: key in ctx.data
      });
    }
    if (ctx.common.async) {
      return ParseStatus.mergeObjectAsync(status, pairs);
    } else {
      return ParseStatus.mergeObjectSync(status, pairs);
    }
  }
  get element() {
    return this._def.valueType;
  }
  static create(first, second, third) {
    if (second instanceof ZodType) {
      return new _ZodRecord({
        keyType: first,
        valueType: second,
        typeName: ZodFirstPartyTypeKind.ZodRecord,
        ...processCreateParams(third)
      });
    }
    return new _ZodRecord({
      keyType: ZodString.create(),
      valueType: first,
      typeName: ZodFirstPartyTypeKind.ZodRecord,
      ...processCreateParams(second)
    });
  }
};
var ZodMap = class extends ZodType {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.map) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.map,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const keyType = this._def.keyType;
    const valueType = this._def.valueType;
    const pairs = [...ctx.data.entries()].map(([key, value], index) => {
      return {
        key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, [index, "key"])),
        value: valueType._parse(new ParseInputLazyPath(ctx, value, ctx.path, [index, "value"]))
      };
    });
    if (ctx.common.async) {
      const finalMap = /* @__PURE__ */ new Map();
      return Promise.resolve().then(async () => {
        for (const pair of pairs) {
          const key = await pair.key;
          const value = await pair.value;
          if (key.status === "aborted" || value.status === "aborted") {
            return INVALID;
          }
          if (key.status === "dirty" || value.status === "dirty") {
            status.dirty();
          }
          finalMap.set(key.value, value.value);
        }
        return { status: status.value, value: finalMap };
      });
    } else {
      const finalMap = /* @__PURE__ */ new Map();
      for (const pair of pairs) {
        const key = pair.key;
        const value = pair.value;
        if (key.status === "aborted" || value.status === "aborted") {
          return INVALID;
        }
        if (key.status === "dirty" || value.status === "dirty") {
          status.dirty();
        }
        finalMap.set(key.value, value.value);
      }
      return { status: status.value, value: finalMap };
    }
  }
};
ZodMap.create = (keyType, valueType, params) => {
  return new ZodMap({
    valueType,
    keyType,
    typeName: ZodFirstPartyTypeKind.ZodMap,
    ...processCreateParams(params)
  });
};
var ZodSet = class _ZodSet extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.set) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.set,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const def = this._def;
    if (def.minSize !== null) {
      if (ctx.data.size < def.minSize.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_small,
          minimum: def.minSize.value,
          type: "set",
          inclusive: true,
          exact: false,
          message: def.minSize.message
        });
        status.dirty();
      }
    }
    if (def.maxSize !== null) {
      if (ctx.data.size > def.maxSize.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_big,
          maximum: def.maxSize.value,
          type: "set",
          inclusive: true,
          exact: false,
          message: def.maxSize.message
        });
        status.dirty();
      }
    }
    const valueType = this._def.valueType;
    function finalizeSet(elements2) {
      const parsedSet = /* @__PURE__ */ new Set();
      for (const element of elements2) {
        if (element.status === "aborted")
          return INVALID;
        if (element.status === "dirty")
          status.dirty();
        parsedSet.add(element.value);
      }
      return { status: status.value, value: parsedSet };
    }
    const elements = [...ctx.data.values()].map((item, i) => valueType._parse(new ParseInputLazyPath(ctx, item, ctx.path, i)));
    if (ctx.common.async) {
      return Promise.all(elements).then((elements2) => finalizeSet(elements2));
    } else {
      return finalizeSet(elements);
    }
  }
  min(minSize, message) {
    return new _ZodSet({
      ...this._def,
      minSize: { value: minSize, message: errorUtil.toString(message) }
    });
  }
  max(maxSize, message) {
    return new _ZodSet({
      ...this._def,
      maxSize: { value: maxSize, message: errorUtil.toString(message) }
    });
  }
  size(size, message) {
    return this.min(size, message).max(size, message);
  }
  nonempty(message) {
    return this.min(1, message);
  }
};
ZodSet.create = (valueType, params) => {
  return new ZodSet({
    valueType,
    minSize: null,
    maxSize: null,
    typeName: ZodFirstPartyTypeKind.ZodSet,
    ...processCreateParams(params)
  });
};
var ZodFunction = class _ZodFunction extends ZodType {
  constructor() {
    super(...arguments);
    this.validate = this.implement;
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.function) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.function,
        received: ctx.parsedType
      });
      return INVALID;
    }
    function makeArgsIssue(args, error) {
      return makeIssue({
        data: args,
        path: ctx.path,
        errorMaps: [ctx.common.contextualErrorMap, ctx.schemaErrorMap, getErrorMap(), en_default].filter((x) => !!x),
        issueData: {
          code: ZodIssueCode.invalid_arguments,
          argumentsError: error
        }
      });
    }
    function makeReturnsIssue(returns, error) {
      return makeIssue({
        data: returns,
        path: ctx.path,
        errorMaps: [ctx.common.contextualErrorMap, ctx.schemaErrorMap, getErrorMap(), en_default].filter((x) => !!x),
        issueData: {
          code: ZodIssueCode.invalid_return_type,
          returnTypeError: error
        }
      });
    }
    const params = { errorMap: ctx.common.contextualErrorMap };
    const fn = ctx.data;
    if (this._def.returns instanceof ZodPromise) {
      const me = this;
      return OK(async function(...args) {
        const error = new ZodError([]);
        const parsedArgs = await me._def.args.parseAsync(args, params).catch((e) => {
          error.addIssue(makeArgsIssue(args, e));
          throw error;
        });
        const result = await Reflect.apply(fn, this, parsedArgs);
        const parsedReturns = await me._def.returns._def.type.parseAsync(result, params).catch((e) => {
          error.addIssue(makeReturnsIssue(result, e));
          throw error;
        });
        return parsedReturns;
      });
    } else {
      const me = this;
      return OK(function(...args) {
        const parsedArgs = me._def.args.safeParse(args, params);
        if (!parsedArgs.success) {
          throw new ZodError([makeArgsIssue(args, parsedArgs.error)]);
        }
        const result = Reflect.apply(fn, this, parsedArgs.data);
        const parsedReturns = me._def.returns.safeParse(result, params);
        if (!parsedReturns.success) {
          throw new ZodError([makeReturnsIssue(result, parsedReturns.error)]);
        }
        return parsedReturns.data;
      });
    }
  }
  parameters() {
    return this._def.args;
  }
  returnType() {
    return this._def.returns;
  }
  args(...items) {
    return new _ZodFunction({
      ...this._def,
      args: ZodTuple.create(items).rest(ZodUnknown.create())
    });
  }
  returns(returnType) {
    return new _ZodFunction({
      ...this._def,
      returns: returnType
    });
  }
  implement(func) {
    const validatedFunc = this.parse(func);
    return validatedFunc;
  }
  strictImplement(func) {
    const validatedFunc = this.parse(func);
    return validatedFunc;
  }
  static create(args, returns, params) {
    return new _ZodFunction({
      args: args ? args : ZodTuple.create([]).rest(ZodUnknown.create()),
      returns: returns || ZodUnknown.create(),
      typeName: ZodFirstPartyTypeKind.ZodFunction,
      ...processCreateParams(params)
    });
  }
};
var ZodLazy = class extends ZodType {
  get schema() {
    return this._def.getter();
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const lazySchema = this._def.getter();
    return lazySchema._parse({ data: ctx.data, path: ctx.path, parent: ctx });
  }
};
ZodLazy.create = (getter, params) => {
  return new ZodLazy({
    getter,
    typeName: ZodFirstPartyTypeKind.ZodLazy,
    ...processCreateParams(params)
  });
};
var ZodLiteral = class extends ZodType {
  _parse(input) {
    if (input.data !== this._def.value) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_literal,
        expected: this._def.value
      });
      return INVALID;
    }
    return { status: "valid", value: input.data };
  }
  get value() {
    return this._def.value;
  }
};
ZodLiteral.create = (value, params) => {
  return new ZodLiteral({
    value,
    typeName: ZodFirstPartyTypeKind.ZodLiteral,
    ...processCreateParams(params)
  });
};
function createZodEnum(values, params) {
  return new ZodEnum({
    values,
    typeName: ZodFirstPartyTypeKind.ZodEnum,
    ...processCreateParams(params)
  });
}
var ZodEnum = class _ZodEnum extends ZodType {
  _parse(input) {
    if (typeof input.data !== "string") {
      const ctx = this._getOrReturnCtx(input);
      const expectedValues = this._def.values;
      addIssueToContext(ctx, {
        expected: util.joinValues(expectedValues),
        received: ctx.parsedType,
        code: ZodIssueCode.invalid_type
      });
      return INVALID;
    }
    if (!this._cache) {
      this._cache = new Set(this._def.values);
    }
    if (!this._cache.has(input.data)) {
      const ctx = this._getOrReturnCtx(input);
      const expectedValues = this._def.values;
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_enum_value,
        options: expectedValues
      });
      return INVALID;
    }
    return OK(input.data);
  }
  get options() {
    return this._def.values;
  }
  get enum() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  get Values() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  get Enum() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  extract(values, newDef = this._def) {
    return _ZodEnum.create(values, {
      ...this._def,
      ...newDef
    });
  }
  exclude(values, newDef = this._def) {
    return _ZodEnum.create(this.options.filter((opt) => !values.includes(opt)), {
      ...this._def,
      ...newDef
    });
  }
};
ZodEnum.create = createZodEnum;
var ZodNativeEnum = class extends ZodType {
  _parse(input) {
    const nativeEnumValues = util.getValidEnumValues(this._def.values);
    const ctx = this._getOrReturnCtx(input);
    if (ctx.parsedType !== ZodParsedType.string && ctx.parsedType !== ZodParsedType.number) {
      const expectedValues = util.objectValues(nativeEnumValues);
      addIssueToContext(ctx, {
        expected: util.joinValues(expectedValues),
        received: ctx.parsedType,
        code: ZodIssueCode.invalid_type
      });
      return INVALID;
    }
    if (!this._cache) {
      this._cache = new Set(util.getValidEnumValues(this._def.values));
    }
    if (!this._cache.has(input.data)) {
      const expectedValues = util.objectValues(nativeEnumValues);
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_enum_value,
        options: expectedValues
      });
      return INVALID;
    }
    return OK(input.data);
  }
  get enum() {
    return this._def.values;
  }
};
ZodNativeEnum.create = (values, params) => {
  return new ZodNativeEnum({
    values,
    typeName: ZodFirstPartyTypeKind.ZodNativeEnum,
    ...processCreateParams(params)
  });
};
var ZodPromise = class extends ZodType {
  unwrap() {
    return this._def.type;
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.promise && ctx.common.async === false) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.promise,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const promisified = ctx.parsedType === ZodParsedType.promise ? ctx.data : Promise.resolve(ctx.data);
    return OK(promisified.then((data) => {
      return this._def.type.parseAsync(data, {
        path: ctx.path,
        errorMap: ctx.common.contextualErrorMap
      });
    }));
  }
};
ZodPromise.create = (schema, params) => {
  return new ZodPromise({
    type: schema,
    typeName: ZodFirstPartyTypeKind.ZodPromise,
    ...processCreateParams(params)
  });
};
var ZodEffects = class extends ZodType {
  innerType() {
    return this._def.schema;
  }
  sourceType() {
    return this._def.schema._def.typeName === ZodFirstPartyTypeKind.ZodEffects ? this._def.schema.sourceType() : this._def.schema;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    const effect = this._def.effect || null;
    const checkCtx = {
      addIssue: (arg) => {
        addIssueToContext(ctx, arg);
        if (arg.fatal) {
          status.abort();
        } else {
          status.dirty();
        }
      },
      get path() {
        return ctx.path;
      }
    };
    checkCtx.addIssue = checkCtx.addIssue.bind(checkCtx);
    if (effect.type === "preprocess") {
      const processed = effect.transform(ctx.data, checkCtx);
      if (ctx.common.async) {
        return Promise.resolve(processed).then(async (processed2) => {
          if (status.value === "aborted")
            return INVALID;
          const result = await this._def.schema._parseAsync({
            data: processed2,
            path: ctx.path,
            parent: ctx
          });
          if (result.status === "aborted")
            return INVALID;
          if (result.status === "dirty")
            return DIRTY(result.value);
          if (status.value === "dirty")
            return DIRTY(result.value);
          return result;
        });
      } else {
        if (status.value === "aborted")
          return INVALID;
        const result = this._def.schema._parseSync({
          data: processed,
          path: ctx.path,
          parent: ctx
        });
        if (result.status === "aborted")
          return INVALID;
        if (result.status === "dirty")
          return DIRTY(result.value);
        if (status.value === "dirty")
          return DIRTY(result.value);
        return result;
      }
    }
    if (effect.type === "refinement") {
      const executeRefinement = (acc) => {
        const result = effect.refinement(acc, checkCtx);
        if (ctx.common.async) {
          return Promise.resolve(result);
        }
        if (result instanceof Promise) {
          throw new Error("Async refinement encountered during synchronous parse operation. Use .parseAsync instead.");
        }
        return acc;
      };
      if (ctx.common.async === false) {
        const inner = this._def.schema._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (inner.status === "aborted")
          return INVALID;
        if (inner.status === "dirty")
          status.dirty();
        executeRefinement(inner.value);
        return { status: status.value, value: inner.value };
      } else {
        return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((inner) => {
          if (inner.status === "aborted")
            return INVALID;
          if (inner.status === "dirty")
            status.dirty();
          return executeRefinement(inner.value).then(() => {
            return { status: status.value, value: inner.value };
          });
        });
      }
    }
    if (effect.type === "transform") {
      if (ctx.common.async === false) {
        const base = this._def.schema._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (!isValid(base))
          return INVALID;
        const result = effect.transform(base.value, checkCtx);
        if (result instanceof Promise) {
          throw new Error(`Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.`);
        }
        return { status: status.value, value: result };
      } else {
        return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((base) => {
          if (!isValid(base))
            return INVALID;
          return Promise.resolve(effect.transform(base.value, checkCtx)).then((result) => ({
            status: status.value,
            value: result
          }));
        });
      }
    }
    util.assertNever(effect);
  }
};
ZodEffects.create = (schema, effect, params) => {
  return new ZodEffects({
    schema,
    typeName: ZodFirstPartyTypeKind.ZodEffects,
    effect,
    ...processCreateParams(params)
  });
};
ZodEffects.createWithPreprocess = (preprocess, schema, params) => {
  return new ZodEffects({
    schema,
    effect: { type: "preprocess", transform: preprocess },
    typeName: ZodFirstPartyTypeKind.ZodEffects,
    ...processCreateParams(params)
  });
};
var ZodOptional = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType === ZodParsedType.undefined) {
      return OK(void 0);
    }
    return this._def.innerType._parse(input);
  }
  unwrap() {
    return this._def.innerType;
  }
};
ZodOptional.create = (type, params) => {
  return new ZodOptional({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodOptional,
    ...processCreateParams(params)
  });
};
var ZodNullable = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType === ZodParsedType.null) {
      return OK(null);
    }
    return this._def.innerType._parse(input);
  }
  unwrap() {
    return this._def.innerType;
  }
};
ZodNullable.create = (type, params) => {
  return new ZodNullable({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodNullable,
    ...processCreateParams(params)
  });
};
var ZodDefault = class extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    let data = ctx.data;
    if (ctx.parsedType === ZodParsedType.undefined) {
      data = this._def.defaultValue();
    }
    return this._def.innerType._parse({
      data,
      path: ctx.path,
      parent: ctx
    });
  }
  removeDefault() {
    return this._def.innerType;
  }
};
ZodDefault.create = (type, params) => {
  return new ZodDefault({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodDefault,
    defaultValue: typeof params.default === "function" ? params.default : () => params.default,
    ...processCreateParams(params)
  });
};
var ZodCatch = class extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const newCtx = {
      ...ctx,
      common: {
        ...ctx.common,
        issues: []
      }
    };
    const result = this._def.innerType._parse({
      data: newCtx.data,
      path: newCtx.path,
      parent: {
        ...newCtx
      }
    });
    if (isAsync(result)) {
      return result.then((result2) => {
        return {
          status: "valid",
          value: result2.status === "valid" ? result2.value : this._def.catchValue({
            get error() {
              return new ZodError(newCtx.common.issues);
            },
            input: newCtx.data
          })
        };
      });
    } else {
      return {
        status: "valid",
        value: result.status === "valid" ? result.value : this._def.catchValue({
          get error() {
            return new ZodError(newCtx.common.issues);
          },
          input: newCtx.data
        })
      };
    }
  }
  removeCatch() {
    return this._def.innerType;
  }
};
ZodCatch.create = (type, params) => {
  return new ZodCatch({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodCatch,
    catchValue: typeof params.catch === "function" ? params.catch : () => params.catch,
    ...processCreateParams(params)
  });
};
var ZodNaN = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.nan) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.nan,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return { status: "valid", value: input.data };
  }
};
ZodNaN.create = (params) => {
  return new ZodNaN({
    typeName: ZodFirstPartyTypeKind.ZodNaN,
    ...processCreateParams(params)
  });
};
var ZodBranded = class extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const data = ctx.data;
    return this._def.type._parse({
      data,
      path: ctx.path,
      parent: ctx
    });
  }
  unwrap() {
    return this._def.type;
  }
};
var ZodPipeline = class _ZodPipeline extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.common.async) {
      const handleAsync = async () => {
        const inResult = await this._def.in._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (inResult.status === "aborted")
          return INVALID;
        if (inResult.status === "dirty") {
          status.dirty();
          return DIRTY(inResult.value);
        } else {
          return this._def.out._parseAsync({
            data: inResult.value,
            path: ctx.path,
            parent: ctx
          });
        }
      };
      return handleAsync();
    } else {
      const inResult = this._def.in._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
      if (inResult.status === "aborted")
        return INVALID;
      if (inResult.status === "dirty") {
        status.dirty();
        return {
          status: "dirty",
          value: inResult.value
        };
      } else {
        return this._def.out._parseSync({
          data: inResult.value,
          path: ctx.path,
          parent: ctx
        });
      }
    }
  }
  static create(a, b) {
    return new _ZodPipeline({
      in: a,
      out: b,
      typeName: ZodFirstPartyTypeKind.ZodPipeline
    });
  }
};
var ZodReadonly = class extends ZodType {
  _parse(input) {
    const result = this._def.innerType._parse(input);
    const freeze = (data) => {
      if (isValid(data)) {
        data.value = Object.freeze(data.value);
      }
      return data;
    };
    return isAsync(result) ? result.then((data) => freeze(data)) : freeze(result);
  }
  unwrap() {
    return this._def.innerType;
  }
};
ZodReadonly.create = (type, params) => {
  return new ZodReadonly({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodReadonly,
    ...processCreateParams(params)
  });
};
var late = {
  object: ZodObject.lazycreate
};
var ZodFirstPartyTypeKind;
(function(ZodFirstPartyTypeKind2) {
  ZodFirstPartyTypeKind2["ZodString"] = "ZodString";
  ZodFirstPartyTypeKind2["ZodNumber"] = "ZodNumber";
  ZodFirstPartyTypeKind2["ZodNaN"] = "ZodNaN";
  ZodFirstPartyTypeKind2["ZodBigInt"] = "ZodBigInt";
  ZodFirstPartyTypeKind2["ZodBoolean"] = "ZodBoolean";
  ZodFirstPartyTypeKind2["ZodDate"] = "ZodDate";
  ZodFirstPartyTypeKind2["ZodSymbol"] = "ZodSymbol";
  ZodFirstPartyTypeKind2["ZodUndefined"] = "ZodUndefined";
  ZodFirstPartyTypeKind2["ZodNull"] = "ZodNull";
  ZodFirstPartyTypeKind2["ZodAny"] = "ZodAny";
  ZodFirstPartyTypeKind2["ZodUnknown"] = "ZodUnknown";
  ZodFirstPartyTypeKind2["ZodNever"] = "ZodNever";
  ZodFirstPartyTypeKind2["ZodVoid"] = "ZodVoid";
  ZodFirstPartyTypeKind2["ZodArray"] = "ZodArray";
  ZodFirstPartyTypeKind2["ZodObject"] = "ZodObject";
  ZodFirstPartyTypeKind2["ZodUnion"] = "ZodUnion";
  ZodFirstPartyTypeKind2["ZodDiscriminatedUnion"] = "ZodDiscriminatedUnion";
  ZodFirstPartyTypeKind2["ZodIntersection"] = "ZodIntersection";
  ZodFirstPartyTypeKind2["ZodTuple"] = "ZodTuple";
  ZodFirstPartyTypeKind2["ZodRecord"] = "ZodRecord";
  ZodFirstPartyTypeKind2["ZodMap"] = "ZodMap";
  ZodFirstPartyTypeKind2["ZodSet"] = "ZodSet";
  ZodFirstPartyTypeKind2["ZodFunction"] = "ZodFunction";
  ZodFirstPartyTypeKind2["ZodLazy"] = "ZodLazy";
  ZodFirstPartyTypeKind2["ZodLiteral"] = "ZodLiteral";
  ZodFirstPartyTypeKind2["ZodEnum"] = "ZodEnum";
  ZodFirstPartyTypeKind2["ZodEffects"] = "ZodEffects";
  ZodFirstPartyTypeKind2["ZodNativeEnum"] = "ZodNativeEnum";
  ZodFirstPartyTypeKind2["ZodOptional"] = "ZodOptional";
  ZodFirstPartyTypeKind2["ZodNullable"] = "ZodNullable";
  ZodFirstPartyTypeKind2["ZodDefault"] = "ZodDefault";
  ZodFirstPartyTypeKind2["ZodCatch"] = "ZodCatch";
  ZodFirstPartyTypeKind2["ZodPromise"] = "ZodPromise";
  ZodFirstPartyTypeKind2["ZodBranded"] = "ZodBranded";
  ZodFirstPartyTypeKind2["ZodPipeline"] = "ZodPipeline";
  ZodFirstPartyTypeKind2["ZodReadonly"] = "ZodReadonly";
})(ZodFirstPartyTypeKind || (ZodFirstPartyTypeKind = {}));
var stringType = ZodString.create;
var numberType = ZodNumber.create;
var nanType = ZodNaN.create;
var bigIntType = ZodBigInt.create;
var booleanType = ZodBoolean.create;
var dateType = ZodDate.create;
var symbolType = ZodSymbol.create;
var undefinedType = ZodUndefined.create;
var nullType = ZodNull.create;
var anyType = ZodAny.create;
var unknownType = ZodUnknown.create;
var neverType = ZodNever.create;
var voidType = ZodVoid.create;
var arrayType = ZodArray.create;
var objectType = ZodObject.create;
var strictObjectType = ZodObject.strictCreate;
var unionType = ZodUnion.create;
var discriminatedUnionType = ZodDiscriminatedUnion.create;
var intersectionType = ZodIntersection.create;
var tupleType = ZodTuple.create;
var recordType = ZodRecord.create;
var mapType = ZodMap.create;
var setType = ZodSet.create;
var functionType = ZodFunction.create;
var lazyType = ZodLazy.create;
var literalType = ZodLiteral.create;
var enumType = ZodEnum.create;
var nativeEnumType = ZodNativeEnum.create;
var promiseType = ZodPromise.create;
var effectsType = ZodEffects.create;
var optionalType = ZodOptional.create;
var nullableType = ZodNullable.create;
var preprocessType = ZodEffects.createWithPreprocess;
var pipelineType = ZodPipeline.create;

// lib/api-zod/src/generated/api.ts
var HealthCheckResponse = objectType({
  status: stringType()
});

// node_modules/.pnpm/drizzle-orm@0.45.2_mysql2@3.22.3_@types+node@25.3.5_/node_modules/drizzle-orm/mysql2/driver.js
import { createPool } from "mysql2";

// node_modules/.pnpm/drizzle-orm@0.45.2_mysql2@3.22.3_@types+node@25.3.5_/node_modules/drizzle-orm/entity.js
var entityKind = /* @__PURE__ */ Symbol.for("drizzle:entityKind");
function is(value, type) {
  if (!value || typeof value !== "object") {
    return false;
  }
  if (value instanceof type) {
    return true;
  }
  if (!Object.prototype.hasOwnProperty.call(type, entityKind)) {
    throw new Error(
      `Class "${type.name ?? "<unknown>"}" doesn't look like a Drizzle entity. If this is incorrect and the class is provided by Drizzle, please report this as a bug.`
    );
  }
  let cls = Object.getPrototypeOf(value).constructor;
  if (cls) {
    while (cls) {
      if (entityKind in cls && cls[entityKind] === type[entityKind]) {
        return true;
      }
      cls = Object.getPrototypeOf(cls);
    }
  }
  return false;
}

// node_modules/.pnpm/drizzle-orm@0.45.2_mysql2@3.22.3_@types+node@25.3.5_/node_modules/drizzle-orm/logger.js
var ConsoleLogWriter = class {
  static [entityKind] = "ConsoleLogWriter";
  write(message) {
    console.log(message);
  }
};
var DefaultLogger = class {
  static [entityKind] = "DefaultLogger";
  writer;
  constructor(config) {
    this.writer = config?.writer ?? new ConsoleLogWriter();
  }
  logQuery(query, params) {
    const stringifiedParams = params.map((p) => {
      try {
        return JSON.stringify(p);
      } catch {
        return String(p);
      }
    });
    const paramsStr = stringifiedParams.length ? ` -- params: [${stringifiedParams.join(", ")}]` : "";
    this.writer.write(`Query: ${query}${paramsStr}`);
  }
};
var NoopLogger = class {
  static [entityKind] = "NoopLogger";
  logQuery() {
  }
};

// node_modules/.pnpm/drizzle-orm@0.45.2_mysql2@3.22.3_@types+node@25.3.5_/node_modules/drizzle-orm/column.js
var Column = class {
  constructor(table, config) {
    this.table = table;
    this.config = config;
    this.name = config.name;
    this.keyAsName = config.keyAsName;
    this.notNull = config.notNull;
    this.default = config.default;
    this.defaultFn = config.defaultFn;
    this.onUpdateFn = config.onUpdateFn;
    this.hasDefault = config.hasDefault;
    this.primary = config.primaryKey;
    this.isUnique = config.isUnique;
    this.uniqueName = config.uniqueName;
    this.uniqueType = config.uniqueType;
    this.dataType = config.dataType;
    this.columnType = config.columnType;
    this.generated = config.generated;
    this.generatedIdentity = config.generatedIdentity;
  }
  static [entityKind] = "Column";
  name;
  keyAsName;
  primary;
  notNull;
  default;
  defaultFn;
  onUpdateFn;
  hasDefault;
  isUnique;
  uniqueName;
  uniqueType;
  dataType;
  columnType;
  enumValues = void 0;
  generated = void 0;
  generatedIdentity = void 0;
  config;
  mapFromDriverValue(value) {
    return value;
  }
  mapToDriverValue(value) {
    return value;
  }
  // ** @internal */
  shouldDisableInsert() {
    return this.config.generated !== void 0 && this.config.generated.type !== "byDefault";
  }
};

// node_modules/.pnpm/drizzle-orm@0.45.2_mysql2@3.22.3_@types+node@25.3.5_/node_modules/drizzle-orm/column-builder.js
var ColumnBuilder = class {
  static [entityKind] = "ColumnBuilder";
  config;
  constructor(name, dataType, columnType) {
    this.config = {
      name,
      keyAsName: name === "",
      notNull: false,
      default: void 0,
      hasDefault: false,
      primaryKey: false,
      isUnique: false,
      uniqueName: void 0,
      uniqueType: void 0,
      dataType,
      columnType,
      generated: void 0
    };
  }
  /**
   * Changes the data type of the column. Commonly used with `json` columns. Also, useful for branded types.
   *
   * @example
   * ```ts
   * const users = pgTable('users', {
   * 	id: integer('id').$type<UserId>().primaryKey(),
   * 	details: json('details').$type<UserDetails>().notNull(),
   * });
   * ```
   */
  $type() {
    return this;
  }
  /**
   * Adds a `not null` clause to the column definition.
   *
   * Affects the `select` model of the table - columns *without* `not null` will be nullable on select.
   */
  notNull() {
    this.config.notNull = true;
    return this;
  }
  /**
   * Adds a `default <value>` clause to the column definition.
   *
   * Affects the `insert` model of the table - columns *with* `default` are optional on insert.
   *
   * If you need to set a dynamic default value, use {@link $defaultFn} instead.
   */
  default(value) {
    this.config.default = value;
    this.config.hasDefault = true;
    return this;
  }
  /**
   * Adds a dynamic default value to the column.
   * The function will be called when the row is inserted, and the returned value will be used as the column value.
   *
   * **Note:** This value does not affect the `drizzle-kit` behavior, it is only used at runtime in `drizzle-orm`.
   */
  $defaultFn(fn) {
    this.config.defaultFn = fn;
    this.config.hasDefault = true;
    return this;
  }
  /**
   * Alias for {@link $defaultFn}.
   */
  $default = this.$defaultFn;
  /**
   * Adds a dynamic update value to the column.
   * The function will be called when the row is updated, and the returned value will be used as the column value if none is provided.
   * If no `default` (or `$defaultFn`) value is provided, the function will be called when the row is inserted as well, and the returned value will be used as the column value.
   *
   * **Note:** This value does not affect the `drizzle-kit` behavior, it is only used at runtime in `drizzle-orm`.
   */
  $onUpdateFn(fn) {
    this.config.onUpdateFn = fn;
    this.config.hasDefault = true;
    return this;
  }
  /**
   * Alias for {@link $onUpdateFn}.
   */
  $onUpdate = this.$onUpdateFn;
  /**
   * Adds a `primary key` clause to the column definition. This implicitly makes the column `not null`.
   *
   * In SQLite, `integer primary key` implicitly makes the column auto-incrementing.
   */
  primaryKey() {
    this.config.primaryKey = true;
    this.config.notNull = true;
    return this;
  }
  /** @internal Sets the name of the column to the key within the table definition if a name was not given. */
  setName(name) {
    if (this.config.name !== "") return;
    this.config.name = name;
  }
};

// node_modules/.pnpm/drizzle-orm@0.45.2_mysql2@3.22.3_@types+node@25.3.5_/node_modules/drizzle-orm/table.utils.js
var TableName = /* @__PURE__ */ Symbol.for("drizzle:Name");

// node_modules/.pnpm/drizzle-orm@0.45.2_mysql2@3.22.3_@types+node@25.3.5_/node_modules/drizzle-orm/pg-core/foreign-keys.js
var ForeignKeyBuilder = class {
  static [entityKind] = "PgForeignKeyBuilder";
  /** @internal */
  reference;
  /** @internal */
  _onUpdate = "no action";
  /** @internal */
  _onDelete = "no action";
  constructor(config, actions) {
    this.reference = () => {
      const { name, columns, foreignColumns } = config();
      return { name, columns, foreignTable: foreignColumns[0].table, foreignColumns };
    };
    if (actions) {
      this._onUpdate = actions.onUpdate;
      this._onDelete = actions.onDelete;
    }
  }
  onUpdate(action) {
    this._onUpdate = action === void 0 ? "no action" : action;
    return this;
  }
  onDelete(action) {
    this._onDelete = action === void 0 ? "no action" : action;
    return this;
  }
  /** @internal */
  build(table) {
    return new ForeignKey(table, this);
  }
};
var ForeignKey = class {
  constructor(table, builder) {
    this.table = table;
    this.reference = builder.reference;
    this.onUpdate = builder._onUpdate;
    this.onDelete = builder._onDelete;
  }
  static [entityKind] = "PgForeignKey";
  reference;
  onUpdate;
  onDelete;
  getName() {
    const { name, columns, foreignColumns } = this.reference();
    const columnNames = columns.map((column) => column.name);
    const foreignColumnNames = foreignColumns.map((column) => column.name);
    const chunks = [
      this.table[TableName],
      ...columnNames,
      foreignColumns[0].table[TableName],
      ...foreignColumnNames
    ];
    return name ?? `${chunks.join("_")}_fk`;
  }
};

// node_modules/.pnpm/drizzle-orm@0.45.2_mysql2@3.22.3_@types+node@25.3.5_/node_modules/drizzle-orm/tracing-utils.js
function iife(fn, ...args) {
  return fn(...args);
}

// node_modules/.pnpm/drizzle-orm@0.45.2_mysql2@3.22.3_@types+node@25.3.5_/node_modules/drizzle-orm/pg-core/unique-constraint.js
function uniqueKeyName(table, columns) {
  return `${table[TableName]}_${columns.join("_")}_unique`;
}
var UniqueConstraintBuilder = class {
  constructor(columns, name) {
    this.name = name;
    this.columns = columns;
  }
  static [entityKind] = "PgUniqueConstraintBuilder";
  /** @internal */
  columns;
  /** @internal */
  nullsNotDistinctConfig = false;
  nullsNotDistinct() {
    this.nullsNotDistinctConfig = true;
    return this;
  }
  /** @internal */
  build(table) {
    return new UniqueConstraint(table, this.columns, this.nullsNotDistinctConfig, this.name);
  }
};
var UniqueOnConstraintBuilder = class {
  static [entityKind] = "PgUniqueOnConstraintBuilder";
  /** @internal */
  name;
  constructor(name) {
    this.name = name;
  }
  on(...columns) {
    return new UniqueConstraintBuilder(columns, this.name);
  }
};
var UniqueConstraint = class {
  constructor(table, columns, nullsNotDistinct, name) {
    this.table = table;
    this.columns = columns;
    this.name = name ?? uniqueKeyName(this.table, this.columns.map((column) => column.name));
    this.nullsNotDistinct = nullsNotDistinct;
  }
  static [entityKind] = "PgUniqueConstraint";
  columns;
  name;
  nullsNotDistinct = false;
  getName() {
    return this.name;
  }
};

// node_modules/.pnpm/drizzle-orm@0.45.2_mysql2@3.22.3_@types+node@25.3.5_/node_modules/drizzle-orm/pg-core/utils/array.js
function parsePgArrayValue(arrayString, startFrom, inQuotes) {
  for (let i = startFrom; i < arrayString.length; i++) {
    const char2 = arrayString[i];
    if (char2 === "\\") {
      i++;
      continue;
    }
    if (char2 === '"') {
      return [arrayString.slice(startFrom, i).replace(/\\/g, ""), i + 1];
    }
    if (inQuotes) {
      continue;
    }
    if (char2 === "," || char2 === "}") {
      return [arrayString.slice(startFrom, i).replace(/\\/g, ""), i];
    }
  }
  return [arrayString.slice(startFrom).replace(/\\/g, ""), arrayString.length];
}
function parsePgNestedArray(arrayString, startFrom = 0) {
  const result = [];
  let i = startFrom;
  let lastCharIsComma = false;
  while (i < arrayString.length) {
    const char2 = arrayString[i];
    if (char2 === ",") {
      if (lastCharIsComma || i === startFrom) {
        result.push("");
      }
      lastCharIsComma = true;
      i++;
      continue;
    }
    lastCharIsComma = false;
    if (char2 === "\\") {
      i += 2;
      continue;
    }
    if (char2 === '"') {
      const [value2, startFrom2] = parsePgArrayValue(arrayString, i + 1, true);
      result.push(value2);
      i = startFrom2;
      continue;
    }
    if (char2 === "}") {
      return [result, i + 1];
    }
    if (char2 === "{") {
      const [value2, startFrom2] = parsePgNestedArray(arrayString, i + 1);
      result.push(value2);
      i = startFrom2;
      continue;
    }
    const [value, newStartFrom] = parsePgArrayValue(arrayString, i, false);
    result.push(value);
    i = newStartFrom;
  }
  return [result, i];
}
function parsePgArray(arrayString) {
  const [result] = parsePgNestedArray(arrayString, 1);
  return result;
}
function makePgArray(array) {
  return `{${array.map((item) => {
    if (Array.isArray(item)) {
      return makePgArray(item);
    }
    if (typeof item === "string") {
      return `"${item.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
    }
    return `${item}`;
  }).join(",")}}`;
}

// node_modules/.pnpm/drizzle-orm@0.45.2_mysql2@3.22.3_@types+node@25.3.5_/node_modules/drizzle-orm/pg-core/columns/common.js
var PgColumnBuilder = class extends ColumnBuilder {
  foreignKeyConfigs = [];
  static [entityKind] = "PgColumnBuilder";
  array(size) {
    return new PgArrayBuilder(this.config.name, this, size);
  }
  references(ref, actions = {}) {
    this.foreignKeyConfigs.push({ ref, actions });
    return this;
  }
  unique(name, config) {
    this.config.isUnique = true;
    this.config.uniqueName = name;
    this.config.uniqueType = config?.nulls;
    return this;
  }
  generatedAlwaysAs(as) {
    this.config.generated = {
      as,
      type: "always",
      mode: "stored"
    };
    return this;
  }
  /** @internal */
  buildForeignKeys(column, table) {
    return this.foreignKeyConfigs.map(({ ref, actions }) => {
      return iife(
        (ref2, actions2) => {
          const builder = new ForeignKeyBuilder(() => {
            const foreignColumn = ref2();
            return { columns: [column], foreignColumns: [foreignColumn] };
          });
          if (actions2.onUpdate) {
            builder.onUpdate(actions2.onUpdate);
          }
          if (actions2.onDelete) {
            builder.onDelete(actions2.onDelete);
          }
          return builder.build(table);
        },
        ref,
        actions
      );
    });
  }
  /** @internal */
  buildExtraConfigColumn(table) {
    return new ExtraConfigColumn(table, this.config);
  }
};
var PgColumn = class extends Column {
  constructor(table, config) {
    if (!config.uniqueName) {
      config.uniqueName = uniqueKeyName(table, [config.name]);
    }
    super(table, config);
    this.table = table;
  }
  static [entityKind] = "PgColumn";
};
var ExtraConfigColumn = class extends PgColumn {
  static [entityKind] = "ExtraConfigColumn";
  getSQLType() {
    return this.getSQLType();
  }
  indexConfig = {
    order: this.config.order ?? "asc",
    nulls: this.config.nulls ?? "last",
    opClass: this.config.opClass
  };
  defaultConfig = {
    order: "asc",
    nulls: "last",
    opClass: void 0
  };
  asc() {
    this.indexConfig.order = "asc";
    return this;
  }
  desc() {
    this.indexConfig.order = "desc";
    return this;
  }
  nullsFirst() {
    this.indexConfig.nulls = "first";
    return this;
  }
  nullsLast() {
    this.indexConfig.nulls = "last";
    return this;
  }
  /**
   * ### PostgreSQL documentation quote
   *
   * > An operator class with optional parameters can be specified for each column of an index.
   * The operator class identifies the operators to be used by the index for that column.
   * For example, a B-tree index on four-byte integers would use the int4_ops class;
   * this operator class includes comparison functions for four-byte integers.
   * In practice the default operator class for the column's data type is usually sufficient.
   * The main point of having operator classes is that for some data types, there could be more than one meaningful ordering.
   * For example, we might want to sort a complex-number data type either by absolute value or by real part.
   * We could do this by defining two operator classes for the data type and then selecting the proper class when creating an index.
   * More information about operator classes check:
   *
   * ### Useful links
   * https://www.postgresql.org/docs/current/sql-createindex.html
   *
   * https://www.postgresql.org/docs/current/indexes-opclass.html
   *
   * https://www.postgresql.org/docs/current/xindex.html
   *
   * ### Additional types
   * If you have the `pg_vector` extension installed in your database, you can use the
   * `vector_l2_ops`, `vector_ip_ops`, `vector_cosine_ops`, `vector_l1_ops`, `bit_hamming_ops`, `bit_jaccard_ops`, `halfvec_l2_ops`, `sparsevec_l2_ops` options, which are predefined types.
   *
   * **You can always specify any string you want in the operator class, in case Drizzle doesn't have it natively in its types**
   *
   * @param opClass
   * @returns
   */
  op(opClass) {
    this.indexConfig.opClass = opClass;
    return this;
  }
};
var IndexedColumn = class {
  static [entityKind] = "IndexedColumn";
  constructor(name, keyAsName, type, indexConfig) {
    this.name = name;
    this.keyAsName = keyAsName;
    this.type = type;
    this.indexConfig = indexConfig;
  }
  name;
  keyAsName;
  type;
  indexConfig;
};
var PgArrayBuilder = class extends PgColumnBuilder {
  static [entityKind] = "PgArrayBuilder";
  constructor(name, baseBuilder, size) {
    super(name, "array", "PgArray");
    this.config.baseBuilder = baseBuilder;
    this.config.size = size;
  }
  /** @internal */
  build(table) {
    const baseColumn = this.config.baseBuilder.build(table);
    return new PgArray(
      table,
      this.config,
      baseColumn
    );
  }
};
var PgArray = class _PgArray extends PgColumn {
  constructor(table, config, baseColumn, range) {
    super(table, config);
    this.baseColumn = baseColumn;
    this.range = range;
    this.size = config.size;
  }
  size;
  static [entityKind] = "PgArray";
  getSQLType() {
    return `${this.baseColumn.getSQLType()}[${typeof this.size === "number" ? this.size : ""}]`;
  }
  mapFromDriverValue(value) {
    if (typeof value === "string") {
      value = parsePgArray(value);
    }
    return value.map((v) => this.baseColumn.mapFromDriverValue(v));
  }
  mapToDriverValue(value, isNestedArray = false) {
    const a = value.map(
      (v) => v === null ? null : is(this.baseColumn, _PgArray) ? this.baseColumn.mapToDriverValue(v, true) : this.baseColumn.mapToDriverValue(v)
    );
    if (isNestedArray) return a;
    return makePgArray(a);
  }
};

// node_modules/.pnpm/drizzle-orm@0.45.2_mysql2@3.22.3_@types+node@25.3.5_/node_modules/drizzle-orm/pg-core/columns/enum.js
var PgEnumObjectColumnBuilder = class extends PgColumnBuilder {
  static [entityKind] = "PgEnumObjectColumnBuilder";
  constructor(name, enumInstance) {
    super(name, "string", "PgEnumObjectColumn");
    this.config.enum = enumInstance;
  }
  /** @internal */
  build(table) {
    return new PgEnumObjectColumn(
      table,
      this.config
    );
  }
};
var PgEnumObjectColumn = class extends PgColumn {
  static [entityKind] = "PgEnumObjectColumn";
  enum;
  enumValues = this.config.enum.enumValues;
  constructor(table, config) {
    super(table, config);
    this.enum = config.enum;
  }
  getSQLType() {
    return this.enum.enumName;
  }
};
var isPgEnumSym = /* @__PURE__ */ Symbol.for("drizzle:isPgEnum");
function isPgEnum(obj) {
  return !!obj && typeof obj === "function" && isPgEnumSym in obj && obj[isPgEnumSym] === true;
}
var PgEnumColumnBuilder = class extends PgColumnBuilder {
  static [entityKind] = "PgEnumColumnBuilder";
  constructor(name, enumInstance) {
    super(name, "string", "PgEnumColumn");
    this.config.enum = enumInstance;
  }
  /** @internal */
  build(table) {
    return new PgEnumColumn(
      table,
      this.config
    );
  }
};
var PgEnumColumn = class extends PgColumn {
  static [entityKind] = "PgEnumColumn";
  enum = this.config.enum;
  enumValues = this.config.enum.enumValues;
  constructor(table, config) {
    super(table, config);
    this.enum = config.enum;
  }
  getSQLType() {
    return this.enum.enumName;
  }
};

// node_modules/.pnpm/drizzle-orm@0.45.2_mysql2@3.22.3_@types+node@25.3.5_/node_modules/drizzle-orm/subquery.js
var Subquery = class {
  static [entityKind] = "Subquery";
  constructor(sql2, fields, alias, isWith = false, usedTables = []) {
    this._ = {
      brand: "Subquery",
      sql: sql2,
      selectedFields: fields,
      alias,
      isWith,
      usedTables
    };
  }
  // getSQL(): SQL<unknown> {
  // 	return new SQL([this]);
  // }
};
var WithSubquery = class extends Subquery {
  static [entityKind] = "WithSubquery";
};

// node_modules/.pnpm/drizzle-orm@0.45.2_mysql2@3.22.3_@types+node@25.3.5_/node_modules/drizzle-orm/version.js
var version = "0.45.2";

// node_modules/.pnpm/drizzle-orm@0.45.2_mysql2@3.22.3_@types+node@25.3.5_/node_modules/drizzle-orm/tracing.js
var otel;
var rawTracer;
var tracer = {
  startActiveSpan(name, fn) {
    if (!otel) {
      return fn();
    }
    if (!rawTracer) {
      rawTracer = otel.trace.getTracer("drizzle-orm", version);
    }
    return iife(
      (otel2, rawTracer2) => rawTracer2.startActiveSpan(
        name,
        (span) => {
          try {
            return fn(span);
          } catch (e) {
            span.setStatus({
              code: otel2.SpanStatusCode.ERROR,
              message: e instanceof Error ? e.message : "Unknown error"
              // eslint-disable-line no-instanceof/no-instanceof
            });
            throw e;
          } finally {
            span.end();
          }
        }
      ),
      otel,
      rawTracer
    );
  }
};

// node_modules/.pnpm/drizzle-orm@0.45.2_mysql2@3.22.3_@types+node@25.3.5_/node_modules/drizzle-orm/view-common.js
var ViewBaseConfig = /* @__PURE__ */ Symbol.for("drizzle:ViewBaseConfig");

// node_modules/.pnpm/drizzle-orm@0.45.2_mysql2@3.22.3_@types+node@25.3.5_/node_modules/drizzle-orm/table.js
var Schema = /* @__PURE__ */ Symbol.for("drizzle:Schema");
var Columns = /* @__PURE__ */ Symbol.for("drizzle:Columns");
var ExtraConfigColumns = /* @__PURE__ */ Symbol.for("drizzle:ExtraConfigColumns");
var OriginalName = /* @__PURE__ */ Symbol.for("drizzle:OriginalName");
var BaseName = /* @__PURE__ */ Symbol.for("drizzle:BaseName");
var IsAlias = /* @__PURE__ */ Symbol.for("drizzle:IsAlias");
var ExtraConfigBuilder = /* @__PURE__ */ Symbol.for("drizzle:ExtraConfigBuilder");
var IsDrizzleTable = /* @__PURE__ */ Symbol.for("drizzle:IsDrizzleTable");
var Table = class {
  static [entityKind] = "Table";
  /** @internal */
  static Symbol = {
    Name: TableName,
    Schema,
    OriginalName,
    Columns,
    ExtraConfigColumns,
    BaseName,
    IsAlias,
    ExtraConfigBuilder
  };
  /**
   * @internal
   * Can be changed if the table is aliased.
   */
  [TableName];
  /**
   * @internal
   * Used to store the original name of the table, before any aliasing.
   */
  [OriginalName];
  /** @internal */
  [Schema];
  /** @internal */
  [Columns];
  /** @internal */
  [ExtraConfigColumns];
  /**
   *  @internal
   * Used to store the table name before the transformation via the `tableCreator` functions.
   */
  [BaseName];
  /** @internal */
  [IsAlias] = false;
  /** @internal */
  [IsDrizzleTable] = true;
  /** @internal */
  [ExtraConfigBuilder] = void 0;
  constructor(name, schema, baseName) {
    this[TableName] = this[OriginalName] = name;
    this[Schema] = schema;
    this[BaseName] = baseName;
  }
};
function getTableName(table) {
  return table[TableName];
}
function getTableUniqueName(table) {
  return `${table[Schema] ?? "public"}.${table[TableName]}`;
}

// node_modules/.pnpm/drizzle-orm@0.45.2_mysql2@3.22.3_@types+node@25.3.5_/node_modules/drizzle-orm/sql/sql.js
var FakePrimitiveParam = class {
  static [entityKind] = "FakePrimitiveParam";
};
function isSQLWrapper(value) {
  return value !== null && value !== void 0 && typeof value.getSQL === "function";
}
function mergeQueries(queries) {
  const result = { sql: "", params: [] };
  for (const query of queries) {
    result.sql += query.sql;
    result.params.push(...query.params);
    if (query.typings?.length) {
      if (!result.typings) {
        result.typings = [];
      }
      result.typings.push(...query.typings);
    }
  }
  return result;
}
var StringChunk = class {
  static [entityKind] = "StringChunk";
  value;
  constructor(value) {
    this.value = Array.isArray(value) ? value : [value];
  }
  getSQL() {
    return new SQL([this]);
  }
};
var SQL = class _SQL {
  constructor(queryChunks) {
    this.queryChunks = queryChunks;
    for (const chunk of queryChunks) {
      if (is(chunk, Table)) {
        const schemaName = chunk[Table.Symbol.Schema];
        this.usedTables.push(
          schemaName === void 0 ? chunk[Table.Symbol.Name] : schemaName + "." + chunk[Table.Symbol.Name]
        );
      }
    }
  }
  static [entityKind] = "SQL";
  /** @internal */
  decoder = noopDecoder;
  shouldInlineParams = false;
  /** @internal */
  usedTables = [];
  append(query) {
    this.queryChunks.push(...query.queryChunks);
    return this;
  }
  toQuery(config) {
    return tracer.startActiveSpan("drizzle.buildSQL", (span) => {
      const query = this.buildQueryFromSourceParams(this.queryChunks, config);
      span?.setAttributes({
        "drizzle.query.text": query.sql,
        "drizzle.query.params": JSON.stringify(query.params)
      });
      return query;
    });
  }
  buildQueryFromSourceParams(chunks, _config) {
    const config = Object.assign({}, _config, {
      inlineParams: _config.inlineParams || this.shouldInlineParams,
      paramStartIndex: _config.paramStartIndex || { value: 0 }
    });
    const {
      casing,
      escapeName,
      escapeParam,
      prepareTyping,
      inlineParams,
      paramStartIndex
    } = config;
    return mergeQueries(chunks.map((chunk) => {
      if (is(chunk, StringChunk)) {
        return { sql: chunk.value.join(""), params: [] };
      }
      if (is(chunk, Name)) {
        return { sql: escapeName(chunk.value), params: [] };
      }
      if (chunk === void 0) {
        return { sql: "", params: [] };
      }
      if (Array.isArray(chunk)) {
        const result = [new StringChunk("(")];
        for (const [i, p] of chunk.entries()) {
          result.push(p);
          if (i < chunk.length - 1) {
            result.push(new StringChunk(", "));
          }
        }
        result.push(new StringChunk(")"));
        return this.buildQueryFromSourceParams(result, config);
      }
      if (is(chunk, _SQL)) {
        return this.buildQueryFromSourceParams(chunk.queryChunks, {
          ...config,
          inlineParams: inlineParams || chunk.shouldInlineParams
        });
      }
      if (is(chunk, Table)) {
        const schemaName = chunk[Table.Symbol.Schema];
        const tableName = chunk[Table.Symbol.Name];
        return {
          sql: schemaName === void 0 || chunk[IsAlias] ? escapeName(tableName) : escapeName(schemaName) + "." + escapeName(tableName),
          params: []
        };
      }
      if (is(chunk, Column)) {
        const columnName = casing.getColumnCasing(chunk);
        if (_config.invokeSource === "indexes") {
          return { sql: escapeName(columnName), params: [] };
        }
        const schemaName = chunk.table[Table.Symbol.Schema];
        return {
          sql: chunk.table[IsAlias] || schemaName === void 0 ? escapeName(chunk.table[Table.Symbol.Name]) + "." + escapeName(columnName) : escapeName(schemaName) + "." + escapeName(chunk.table[Table.Symbol.Name]) + "." + escapeName(columnName),
          params: []
        };
      }
      if (is(chunk, View)) {
        const schemaName = chunk[ViewBaseConfig].schema;
        const viewName = chunk[ViewBaseConfig].name;
        return {
          sql: schemaName === void 0 || chunk[ViewBaseConfig].isAlias ? escapeName(viewName) : escapeName(schemaName) + "." + escapeName(viewName),
          params: []
        };
      }
      if (is(chunk, Param)) {
        if (is(chunk.value, Placeholder)) {
          return { sql: escapeParam(paramStartIndex.value++, chunk), params: [chunk], typings: ["none"] };
        }
        const mappedValue = chunk.value === null ? null : chunk.encoder.mapToDriverValue(chunk.value);
        if (is(mappedValue, _SQL)) {
          return this.buildQueryFromSourceParams([mappedValue], config);
        }
        if (inlineParams) {
          return { sql: this.mapInlineParam(mappedValue, config), params: [] };
        }
        let typings = ["none"];
        if (prepareTyping) {
          typings = [prepareTyping(chunk.encoder)];
        }
        return { sql: escapeParam(paramStartIndex.value++, mappedValue), params: [mappedValue], typings };
      }
      if (is(chunk, Placeholder)) {
        return { sql: escapeParam(paramStartIndex.value++, chunk), params: [chunk], typings: ["none"] };
      }
      if (is(chunk, _SQL.Aliased) && chunk.fieldAlias !== void 0) {
        return { sql: escapeName(chunk.fieldAlias), params: [] };
      }
      if (is(chunk, Subquery)) {
        if (chunk._.isWith) {
          return { sql: escapeName(chunk._.alias), params: [] };
        }
        return this.buildQueryFromSourceParams([
          new StringChunk("("),
          chunk._.sql,
          new StringChunk(") "),
          new Name(chunk._.alias)
        ], config);
      }
      if (isPgEnum(chunk)) {
        if (chunk.schema) {
          return { sql: escapeName(chunk.schema) + "." + escapeName(chunk.enumName), params: [] };
        }
        return { sql: escapeName(chunk.enumName), params: [] };
      }
      if (isSQLWrapper(chunk)) {
        if (chunk.shouldOmitSQLParens?.()) {
          return this.buildQueryFromSourceParams([chunk.getSQL()], config);
        }
        return this.buildQueryFromSourceParams([
          new StringChunk("("),
          chunk.getSQL(),
          new StringChunk(")")
        ], config);
      }
      if (inlineParams) {
        return { sql: this.mapInlineParam(chunk, config), params: [] };
      }
      return { sql: escapeParam(paramStartIndex.value++, chunk), params: [chunk], typings: ["none"] };
    }));
  }
  mapInlineParam(chunk, { escapeString }) {
    if (chunk === null) {
      return "null";
    }
    if (typeof chunk === "number" || typeof chunk === "boolean") {
      return chunk.toString();
    }
    if (typeof chunk === "string") {
      return escapeString(chunk);
    }
    if (typeof chunk === "object") {
      const mappedValueAsString = chunk.toString();
      if (mappedValueAsString === "[object Object]") {
        return escapeString(JSON.stringify(chunk));
      }
      return escapeString(mappedValueAsString);
    }
    throw new Error("Unexpected param value: " + chunk);
  }
  getSQL() {
    return this;
  }
  as(alias) {
    if (alias === void 0) {
      return this;
    }
    return new _SQL.Aliased(this, alias);
  }
  mapWith(decoder) {
    this.decoder = typeof decoder === "function" ? { mapFromDriverValue: decoder } : decoder;
    return this;
  }
  inlineParams() {
    this.shouldInlineParams = true;
    return this;
  }
  /**
   * This method is used to conditionally include a part of the query.
   *
   * @param condition - Condition to check
   * @returns itself if the condition is `true`, otherwise `undefined`
   */
  if(condition) {
    return condition ? this : void 0;
  }
};
var Name = class {
  constructor(value) {
    this.value = value;
  }
  static [entityKind] = "Name";
  brand;
  getSQL() {
    return new SQL([this]);
  }
};
function isDriverValueEncoder(value) {
  return typeof value === "object" && value !== null && "mapToDriverValue" in value && typeof value.mapToDriverValue === "function";
}
var noopDecoder = {
  mapFromDriverValue: (value) => value
};
var noopEncoder = {
  mapToDriverValue: (value) => value
};
var noopMapper = {
  ...noopDecoder,
  ...noopEncoder
};
var Param = class {
  /**
   * @param value - Parameter value
   * @param encoder - Encoder to convert the value to a driver parameter
   */
  constructor(value, encoder = noopEncoder) {
    this.value = value;
    this.encoder = encoder;
  }
  static [entityKind] = "Param";
  brand;
  getSQL() {
    return new SQL([this]);
  }
};
function sql(strings, ...params) {
  const queryChunks = [];
  if (params.length > 0 || strings.length > 0 && strings[0] !== "") {
    queryChunks.push(new StringChunk(strings[0]));
  }
  for (const [paramIndex, param2] of params.entries()) {
    queryChunks.push(param2, new StringChunk(strings[paramIndex + 1]));
  }
  return new SQL(queryChunks);
}
((sql2) => {
  function empty() {
    return new SQL([]);
  }
  sql2.empty = empty;
  function fromList(list) {
    return new SQL(list);
  }
  sql2.fromList = fromList;
  function raw(str) {
    return new SQL([new StringChunk(str)]);
  }
  sql2.raw = raw;
  function join(chunks, separator) {
    const result = [];
    for (const [i, chunk] of chunks.entries()) {
      if (i > 0 && separator !== void 0) {
        result.push(separator);
      }
      result.push(chunk);
    }
    return new SQL(result);
  }
  sql2.join = join;
  function identifier(value) {
    return new Name(value);
  }
  sql2.identifier = identifier;
  function placeholder2(name2) {
    return new Placeholder(name2);
  }
  sql2.placeholder = placeholder2;
  function param2(value, encoder) {
    return new Param(value, encoder);
  }
  sql2.param = param2;
})(sql || (sql = {}));
((SQL2) => {
  class Aliased {
    constructor(sql2, fieldAlias) {
      this.sql = sql2;
      this.fieldAlias = fieldAlias;
    }
    static [entityKind] = "SQL.Aliased";
    /** @internal */
    isSelectionField = false;
    getSQL() {
      return this.sql;
    }
    /** @internal */
    clone() {
      return new Aliased(this.sql, this.fieldAlias);
    }
  }
  SQL2.Aliased = Aliased;
})(SQL || (SQL = {}));
var Placeholder = class {
  constructor(name2) {
    this.name = name2;
  }
  static [entityKind] = "Placeholder";
  getSQL() {
    return new SQL([this]);
  }
};
function fillPlaceholders(params, values) {
  return params.map((p) => {
    if (is(p, Placeholder)) {
      if (!(p.name in values)) {
        throw new Error(`No value for placeholder "${p.name}" was provided`);
      }
      return values[p.name];
    }
    if (is(p, Param) && is(p.value, Placeholder)) {
      if (!(p.value.name in values)) {
        throw new Error(`No value for placeholder "${p.value.name}" was provided`);
      }
      return p.encoder.mapToDriverValue(values[p.value.name]);
    }
    return p;
  });
}
var IsDrizzleView = /* @__PURE__ */ Symbol.for("drizzle:IsDrizzleView");
var View = class {
  static [entityKind] = "View";
  /** @internal */
  [ViewBaseConfig];
  /** @internal */
  [IsDrizzleView] = true;
  constructor({ name: name2, schema, selectedFields, query }) {
    this[ViewBaseConfig] = {
      name: name2,
      originalName: name2,
      schema,
      selectedFields,
      query,
      isExisting: !query,
      isAlias: false
    };
  }
  getSQL() {
    return new SQL([this]);
  }
};
Column.prototype.getSQL = function() {
  return new SQL([this]);
};
Table.prototype.getSQL = function() {
  return new SQL([this]);
};
Subquery.prototype.getSQL = function() {
  return new SQL([this]);
};

// node_modules/.pnpm/drizzle-orm@0.45.2_mysql2@3.22.3_@types+node@25.3.5_/node_modules/drizzle-orm/alias.js
var ColumnAliasProxyHandler = class {
  constructor(table) {
    this.table = table;
  }
  static [entityKind] = "ColumnAliasProxyHandler";
  get(columnObj, prop) {
    if (prop === "table") {
      return this.table;
    }
    return columnObj[prop];
  }
};
var TableAliasProxyHandler = class {
  constructor(alias, replaceOriginalName) {
    this.alias = alias;
    this.replaceOriginalName = replaceOriginalName;
  }
  static [entityKind] = "TableAliasProxyHandler";
  get(target, prop) {
    if (prop === Table.Symbol.IsAlias) {
      return true;
    }
    if (prop === Table.Symbol.Name) {
      return this.alias;
    }
    if (this.replaceOriginalName && prop === Table.Symbol.OriginalName) {
      return this.alias;
    }
    if (prop === ViewBaseConfig) {
      return {
        ...target[ViewBaseConfig],
        name: this.alias,
        isAlias: true
      };
    }
    if (prop === Table.Symbol.Columns) {
      const columns = target[Table.Symbol.Columns];
      if (!columns) {
        return columns;
      }
      const proxiedColumns = {};
      Object.keys(columns).map((key) => {
        proxiedColumns[key] = new Proxy(
          columns[key],
          new ColumnAliasProxyHandler(new Proxy(target, this))
        );
      });
      return proxiedColumns;
    }
    const value = target[prop];
    if (is(value, Column)) {
      return new Proxy(value, new ColumnAliasProxyHandler(new Proxy(target, this)));
    }
    return value;
  }
};
var RelationTableAliasProxyHandler = class {
  constructor(alias) {
    this.alias = alias;
  }
  static [entityKind] = "RelationTableAliasProxyHandler";
  get(target, prop) {
    if (prop === "sourceTable") {
      return aliasedTable(target.sourceTable, this.alias);
    }
    return target[prop];
  }
};
function aliasedTable(table, tableAlias) {
  return new Proxy(table, new TableAliasProxyHandler(tableAlias, false));
}
function aliasedTableColumn(column, tableAlias) {
  return new Proxy(
    column,
    new ColumnAliasProxyHandler(new Proxy(column.table, new TableAliasProxyHandler(tableAlias, false)))
  );
}
function mapColumnsInAliasedSQLToAlias(query, alias) {
  return new SQL.Aliased(mapColumnsInSQLToAlias(query.sql, alias), query.fieldAlias);
}
function mapColumnsInSQLToAlias(query, alias) {
  return sql.join(query.queryChunks.map((c) => {
    if (is(c, Column)) {
      return aliasedTableColumn(c, alias);
    }
    if (is(c, SQL)) {
      return mapColumnsInSQLToAlias(c, alias);
    }
    if (is(c, SQL.Aliased)) {
      return mapColumnsInAliasedSQLToAlias(c, alias);
    }
    return c;
  }));
}

// node_modules/.pnpm/drizzle-orm@0.45.2_mysql2@3.22.3_@types+node@25.3.5_/node_modules/drizzle-orm/selection-proxy.js
var SelectionProxyHandler = class _SelectionProxyHandler {
  static [entityKind] = "SelectionProxyHandler";
  config;
  constructor(config) {
    this.config = { ...config };
  }
  get(subquery, prop) {
    if (prop === "_") {
      return {
        ...subquery["_"],
        selectedFields: new Proxy(
          subquery._.selectedFields,
          this
        )
      };
    }
    if (prop === ViewBaseConfig) {
      return {
        ...subquery[ViewBaseConfig],
        selectedFields: new Proxy(
          subquery[ViewBaseConfig].selectedFields,
          this
        )
      };
    }
    if (typeof prop === "symbol") {
      return subquery[prop];
    }
    const columns = is(subquery, Subquery) ? subquery._.selectedFields : is(subquery, View) ? subquery[ViewBaseConfig].selectedFields : subquery;
    const value = columns[prop];
    if (is(value, SQL.Aliased)) {
      if (this.config.sqlAliasedBehavior === "sql" && !value.isSelectionField) {
        return value.sql;
      }
      const newValue = value.clone();
      newValue.isSelectionField = true;
      return newValue;
    }
    if (is(value, SQL)) {
      if (this.config.sqlBehavior === "sql") {
        return value;
      }
      throw new Error(
        `You tried to reference "${prop}" field from a subquery, which is a raw SQL field, but it doesn't have an alias declared. Please add an alias to the field using ".as('alias')" method.`
      );
    }
    if (is(value, Column)) {
      if (this.config.alias) {
        return new Proxy(
          value,
          new ColumnAliasProxyHandler(
            new Proxy(
              value.table,
              new TableAliasProxyHandler(this.config.alias, this.config.replaceOriginalName ?? false)
            )
          )
        );
      }
      return value;
    }
    if (typeof value !== "object" || value === null) {
      return value;
    }
    return new Proxy(value, new _SelectionProxyHandler(this.config));
  }
};

// node_modules/.pnpm/drizzle-orm@0.45.2_mysql2@3.22.3_@types+node@25.3.5_/node_modules/drizzle-orm/mysql-core/query-builders/count.js
var MySqlCountBuilder = class _MySqlCountBuilder extends SQL {
  constructor(params) {
    super(_MySqlCountBuilder.buildEmbeddedCount(params.source, params.filters).queryChunks);
    this.params = params;
    this.mapWith(Number);
    this.session = params.session;
    this.sql = _MySqlCountBuilder.buildCount(
      params.source,
      params.filters
    );
  }
  sql;
  static [entityKind] = "MySqlCountBuilder";
  [Symbol.toStringTag] = "MySqlCountBuilder";
  session;
  static buildEmbeddedCount(source, filters) {
    return sql`(select count(*) from ${source}${sql.raw(" where ").if(filters)}${filters})`;
  }
  static buildCount(source, filters) {
    return sql`select count(*) as count from ${source}${sql.raw(" where ").if(filters)}${filters}`;
  }
  then(onfulfilled, onrejected) {
    return Promise.resolve(this.session.count(this.sql)).then(
      onfulfilled,
      onrejected
    );
  }
  catch(onRejected) {
    return this.then(void 0, onRejected);
  }
  finally(onFinally) {
    return this.then(
      (value) => {
        onFinally?.();
        return value;
      },
      (reason) => {
        onFinally?.();
        throw reason;
      }
    );
  }
};

// node_modules/.pnpm/drizzle-orm@0.45.2_mysql2@3.22.3_@types+node@25.3.5_/node_modules/drizzle-orm/query-promise.js
var QueryPromise = class {
  static [entityKind] = "QueryPromise";
  [Symbol.toStringTag] = "QueryPromise";
  catch(onRejected) {
    return this.then(void 0, onRejected);
  }
  finally(onFinally) {
    return this.then(
      (value) => {
        onFinally?.();
        return value;
      },
      (reason) => {
        onFinally?.();
        throw reason;
      }
    );
  }
  then(onFulfilled, onRejected) {
    return this.execute().then(onFulfilled, onRejected);
  }
};

// node_modules/.pnpm/drizzle-orm@0.45.2_mysql2@3.22.3_@types+node@25.3.5_/node_modules/drizzle-orm/errors.js
var DrizzleError = class extends Error {
  static [entityKind] = "DrizzleError";
  constructor({ message, cause }) {
    super(message);
    this.name = "DrizzleError";
    this.cause = cause;
  }
};
var DrizzleQueryError = class _DrizzleQueryError extends Error {
  constructor(query, params, cause) {
    super(`Failed query: ${query}
params: ${params}`);
    this.query = query;
    this.params = params;
    this.cause = cause;
    Error.captureStackTrace(this, _DrizzleQueryError);
    if (cause) this.cause = cause;
  }
};
var TransactionRollbackError = class extends DrizzleError {
  static [entityKind] = "TransactionRollbackError";
  constructor() {
    super({ message: "Rollback" });
  }
};

// node_modules/.pnpm/drizzle-orm@0.45.2_mysql2@3.22.3_@types+node@25.3.5_/node_modules/drizzle-orm/utils.js
function mapResultRow(columns, row, joinsNotNullableMap) {
  const nullifyMap = {};
  const result = columns.reduce(
    (result2, { path: path2, field }, columnIndex) => {
      let decoder;
      if (is(field, Column)) {
        decoder = field;
      } else if (is(field, SQL)) {
        decoder = field.decoder;
      } else if (is(field, Subquery)) {
        decoder = field._.sql.decoder;
      } else {
        decoder = field.sql.decoder;
      }
      let node = result2;
      for (const [pathChunkIndex, pathChunk] of path2.entries()) {
        if (pathChunkIndex < path2.length - 1) {
          if (!(pathChunk in node)) {
            node[pathChunk] = {};
          }
          node = node[pathChunk];
        } else {
          const rawValue = row[columnIndex];
          const value = node[pathChunk] = rawValue === null ? null : decoder.mapFromDriverValue(rawValue);
          if (joinsNotNullableMap && is(field, Column) && path2.length === 2) {
            const objectName = path2[0];
            if (!(objectName in nullifyMap)) {
              nullifyMap[objectName] = value === null ? getTableName(field.table) : false;
            } else if (typeof nullifyMap[objectName] === "string" && nullifyMap[objectName] !== getTableName(field.table)) {
              nullifyMap[objectName] = false;
            }
          }
        }
      }
      return result2;
    },
    {}
  );
  if (joinsNotNullableMap && Object.keys(nullifyMap).length > 0) {
    for (const [objectName, tableName] of Object.entries(nullifyMap)) {
      if (typeof tableName === "string" && !joinsNotNullableMap[tableName]) {
        result[objectName] = null;
      }
    }
  }
  return result;
}
function orderSelectedFields(fields, pathPrefix) {
  return Object.entries(fields).reduce((result, [name, field]) => {
    if (typeof name !== "string") {
      return result;
    }
    const newPath = pathPrefix ? [...pathPrefix, name] : [name];
    if (is(field, Column) || is(field, SQL) || is(field, SQL.Aliased) || is(field, Subquery)) {
      result.push({ path: newPath, field });
    } else if (is(field, Table)) {
      result.push(...orderSelectedFields(field[Table.Symbol.Columns], newPath));
    } else {
      result.push(...orderSelectedFields(field, newPath));
    }
    return result;
  }, []);
}
function haveSameKeys(left, right) {
  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);
  if (leftKeys.length !== rightKeys.length) {
    return false;
  }
  for (const [index, key] of leftKeys.entries()) {
    if (key !== rightKeys[index]) {
      return false;
    }
  }
  return true;
}
function mapUpdateSet(table, values) {
  const entries = Object.entries(values).filter(([, value]) => value !== void 0).map(([key, value]) => {
    if (is(value, SQL) || is(value, Column)) {
      return [key, value];
    } else {
      return [key, new Param(value, table[Table.Symbol.Columns][key])];
    }
  });
  if (entries.length === 0) {
    throw new Error("No values to set");
  }
  return Object.fromEntries(entries);
}
function applyMixins(baseClass, extendedClasses) {
  for (const extendedClass of extendedClasses) {
    for (const name of Object.getOwnPropertyNames(extendedClass.prototype)) {
      if (name === "constructor") continue;
      Object.defineProperty(
        baseClass.prototype,
        name,
        Object.getOwnPropertyDescriptor(extendedClass.prototype, name) || /* @__PURE__ */ Object.create(null)
      );
    }
  }
}
function getTableColumns(table) {
  return table[Table.Symbol.Columns];
}
function getTableLikeName(table) {
  return is(table, Subquery) ? table._.alias : is(table, View) ? table[ViewBaseConfig].name : is(table, SQL) ? void 0 : table[Table.Symbol.IsAlias] ? table[Table.Symbol.Name] : table[Table.Symbol.BaseName];
}
function getColumnNameAndConfig(a, b) {
  return {
    name: typeof a === "string" && a.length > 0 ? a : "",
    config: typeof a === "object" ? a : b
  };
}
function isConfig(data) {
  if (typeof data !== "object" || data === null) return false;
  if (data.constructor.name !== "Object") return false;
  if ("logger" in data) {
    const type = typeof data["logger"];
    if (type !== "boolean" && (type !== "object" || typeof data["logger"]["logQuery"] !== "function") && type !== "undefined") return false;
    return true;
  }
  if ("schema" in data) {
    const type = typeof data["schema"];
    if (type !== "object" && type !== "undefined") return false;
    return true;
  }
  if ("casing" in data) {
    const type = typeof data["casing"];
    if (type !== "string" && type !== "undefined") return false;
    return true;
  }
  if ("mode" in data) {
    if (data["mode"] !== "default" || data["mode"] !== "planetscale" || data["mode"] !== void 0) return false;
    return true;
  }
  if ("connection" in data) {
    const type = typeof data["connection"];
    if (type !== "string" && type !== "object" && type !== "undefined") return false;
    return true;
  }
  if ("client" in data) {
    const type = typeof data["client"];
    if (type !== "object" && type !== "function" && type !== "undefined") return false;
    return true;
  }
  if (Object.keys(data).length === 0) return true;
  return false;
}
var textDecoder = typeof TextDecoder === "undefined" ? null : new TextDecoder();

// node_modules/.pnpm/drizzle-orm@0.45.2_mysql2@3.22.3_@types+node@25.3.5_/node_modules/drizzle-orm/pg-core/table.js
var InlineForeignKeys = /* @__PURE__ */ Symbol.for("drizzle:PgInlineForeignKeys");
var EnableRLS = /* @__PURE__ */ Symbol.for("drizzle:EnableRLS");
var PgTable = class extends Table {
  static [entityKind] = "PgTable";
  /** @internal */
  static Symbol = Object.assign({}, Table.Symbol, {
    InlineForeignKeys,
    EnableRLS
  });
  /**@internal */
  [InlineForeignKeys] = [];
  /** @internal */
  [EnableRLS] = false;
  /** @internal */
  [Table.Symbol.ExtraConfigBuilder] = void 0;
  /** @internal */
  [Table.Symbol.ExtraConfigColumns] = {};
};

// node_modules/.pnpm/drizzle-orm@0.45.2_mysql2@3.22.3_@types+node@25.3.5_/node_modules/drizzle-orm/pg-core/primary-keys.js
var PrimaryKeyBuilder = class {
  static [entityKind] = "PgPrimaryKeyBuilder";
  /** @internal */
  columns;
  /** @internal */
  name;
  constructor(columns, name) {
    this.columns = columns;
    this.name = name;
  }
  /** @internal */
  build(table) {
    return new PrimaryKey(table, this.columns, this.name);
  }
};
var PrimaryKey = class {
  constructor(table, columns, name) {
    this.table = table;
    this.columns = columns;
    this.name = name;
  }
  static [entityKind] = "PgPrimaryKey";
  columns;
  name;
  getName() {
    return this.name ?? `${this.table[PgTable.Symbol.Name]}_${this.columns.map((column) => column.name).join("_")}_pk`;
  }
};

// node_modules/.pnpm/drizzle-orm@0.45.2_mysql2@3.22.3_@types+node@25.3.5_/node_modules/drizzle-orm/sql/expressions/conditions.js
function bindIfParam(value, column) {
  if (isDriverValueEncoder(column) && !isSQLWrapper(value) && !is(value, Param) && !is(value, Placeholder) && !is(value, Column) && !is(value, Table) && !is(value, View)) {
    return new Param(value, column);
  }
  return value;
}
var eq = (left, right) => {
  return sql`${left} = ${bindIfParam(right, left)}`;
};
var ne = (left, right) => {
  return sql`${left} <> ${bindIfParam(right, left)}`;
};
function and(...unfilteredConditions) {
  const conditions = unfilteredConditions.filter(
    (c) => c !== void 0
  );
  if (conditions.length === 0) {
    return void 0;
  }
  if (conditions.length === 1) {
    return new SQL(conditions);
  }
  return new SQL([
    new StringChunk("("),
    sql.join(conditions, new StringChunk(" and ")),
    new StringChunk(")")
  ]);
}
function or(...unfilteredConditions) {
  const conditions = unfilteredConditions.filter(
    (c) => c !== void 0
  );
  if (conditions.length === 0) {
    return void 0;
  }
  if (conditions.length === 1) {
    return new SQL(conditions);
  }
  return new SQL([
    new StringChunk("("),
    sql.join(conditions, new StringChunk(" or ")),
    new StringChunk(")")
  ]);
}
function not(condition) {
  return sql`not ${condition}`;
}
var gt = (left, right) => {
  return sql`${left} > ${bindIfParam(right, left)}`;
};
var gte = (left, right) => {
  return sql`${left} >= ${bindIfParam(right, left)}`;
};
var lt = (left, right) => {
  return sql`${left} < ${bindIfParam(right, left)}`;
};
var lte = (left, right) => {
  return sql`${left} <= ${bindIfParam(right, left)}`;
};
function inArray(column, values) {
  if (Array.isArray(values)) {
    if (values.length === 0) {
      return sql`false`;
    }
    return sql`${column} in ${values.map((v) => bindIfParam(v, column))}`;
  }
  return sql`${column} in ${bindIfParam(values, column)}`;
}
function notInArray(column, values) {
  if (Array.isArray(values)) {
    if (values.length === 0) {
      return sql`true`;
    }
    return sql`${column} not in ${values.map((v) => bindIfParam(v, column))}`;
  }
  return sql`${column} not in ${bindIfParam(values, column)}`;
}
function isNull(value) {
  return sql`${value} is null`;
}
function isNotNull(value) {
  return sql`${value} is not null`;
}
function exists(subquery) {
  return sql`exists ${subquery}`;
}
function notExists(subquery) {
  return sql`not exists ${subquery}`;
}
function between(column, min, max) {
  return sql`${column} between ${bindIfParam(min, column)} and ${bindIfParam(
    max,
    column
  )}`;
}
function notBetween(column, min, max) {
  return sql`${column} not between ${bindIfParam(
    min,
    column
  )} and ${bindIfParam(max, column)}`;
}
function like(column, value) {
  return sql`${column} like ${value}`;
}
function notLike(column, value) {
  return sql`${column} not like ${value}`;
}
function ilike(column, value) {
  return sql`${column} ilike ${value}`;
}
function notIlike(column, value) {
  return sql`${column} not ilike ${value}`;
}

// node_modules/.pnpm/drizzle-orm@0.45.2_mysql2@3.22.3_@types+node@25.3.5_/node_modules/drizzle-orm/sql/expressions/select.js
function asc(column) {
  return sql`${column} asc`;
}
function desc(column) {
  return sql`${column} desc`;
}

// node_modules/.pnpm/drizzle-orm@0.45.2_mysql2@3.22.3_@types+node@25.3.5_/node_modules/drizzle-orm/relations.js
var Relation = class {
  constructor(sourceTable, referencedTable, relationName) {
    this.sourceTable = sourceTable;
    this.referencedTable = referencedTable;
    this.relationName = relationName;
    this.referencedTableName = referencedTable[Table.Symbol.Name];
  }
  static [entityKind] = "Relation";
  referencedTableName;
  fieldName;
};
var Relations = class {
  constructor(table, config) {
    this.table = table;
    this.config = config;
  }
  static [entityKind] = "Relations";
};
var One = class _One extends Relation {
  constructor(sourceTable, referencedTable, config, isNullable) {
    super(sourceTable, referencedTable, config?.relationName);
    this.config = config;
    this.isNullable = isNullable;
  }
  static [entityKind] = "One";
  withFieldName(fieldName) {
    const relation = new _One(
      this.sourceTable,
      this.referencedTable,
      this.config,
      this.isNullable
    );
    relation.fieldName = fieldName;
    return relation;
  }
};
var Many = class _Many extends Relation {
  constructor(sourceTable, referencedTable, config) {
    super(sourceTable, referencedTable, config?.relationName);
    this.config = config;
  }
  static [entityKind] = "Many";
  withFieldName(fieldName) {
    const relation = new _Many(
      this.sourceTable,
      this.referencedTable,
      this.config
    );
    relation.fieldName = fieldName;
    return relation;
  }
};
function getOperators() {
  return {
    and,
    between,
    eq,
    exists,
    gt,
    gte,
    ilike,
    inArray,
    isNull,
    isNotNull,
    like,
    lt,
    lte,
    ne,
    not,
    notBetween,
    notExists,
    notLike,
    notIlike,
    notInArray,
    or,
    sql
  };
}
function getOrderByOperators() {
  return {
    sql,
    asc,
    desc
  };
}
function extractTablesRelationalConfig(schema, configHelpers) {
  if (Object.keys(schema).length === 1 && "default" in schema && !is(schema["default"], Table)) {
    schema = schema["default"];
  }
  const tableNamesMap = {};
  const relationsBuffer = {};
  const tablesConfig = {};
  for (const [key, value] of Object.entries(schema)) {
    if (is(value, Table)) {
      const dbName = getTableUniqueName(value);
      const bufferedRelations = relationsBuffer[dbName];
      tableNamesMap[dbName] = key;
      tablesConfig[key] = {
        tsName: key,
        dbName: value[Table.Symbol.Name],
        schema: value[Table.Symbol.Schema],
        columns: value[Table.Symbol.Columns],
        relations: bufferedRelations?.relations ?? {},
        primaryKey: bufferedRelations?.primaryKey ?? []
      };
      for (const column of Object.values(
        value[Table.Symbol.Columns]
      )) {
        if (column.primary) {
          tablesConfig[key].primaryKey.push(column);
        }
      }
      const extraConfig = value[Table.Symbol.ExtraConfigBuilder]?.(value[Table.Symbol.ExtraConfigColumns]);
      if (extraConfig) {
        for (const configEntry of Object.values(extraConfig)) {
          if (is(configEntry, PrimaryKeyBuilder)) {
            tablesConfig[key].primaryKey.push(...configEntry.columns);
          }
        }
      }
    } else if (is(value, Relations)) {
      const dbName = getTableUniqueName(value.table);
      const tableName = tableNamesMap[dbName];
      const relations2 = value.config(
        configHelpers(value.table)
      );
      let primaryKey;
      for (const [relationName, relation] of Object.entries(relations2)) {
        if (tableName) {
          const tableConfig = tablesConfig[tableName];
          tableConfig.relations[relationName] = relation;
          if (primaryKey) {
            tableConfig.primaryKey.push(...primaryKey);
          }
        } else {
          if (!(dbName in relationsBuffer)) {
            relationsBuffer[dbName] = {
              relations: {},
              primaryKey
            };
          }
          relationsBuffer[dbName].relations[relationName] = relation;
        }
      }
    }
  }
  return { tables: tablesConfig, tableNamesMap };
}
function createOne(sourceTable) {
  return function one(table, config) {
    return new One(
      sourceTable,
      table,
      config,
      config?.fields.reduce((res, f) => res && f.notNull, true) ?? false
    );
  };
}
function createMany(sourceTable) {
  return function many(referencedTable, config) {
    return new Many(sourceTable, referencedTable, config);
  };
}
function normalizeRelation(schema, tableNamesMap, relation) {
  if (is(relation, One) && relation.config) {
    return {
      fields: relation.config.fields,
      references: relation.config.references
    };
  }
  const referencedTableTsName = tableNamesMap[getTableUniqueName(relation.referencedTable)];
  if (!referencedTableTsName) {
    throw new Error(
      `Table "${relation.referencedTable[Table.Symbol.Name]}" not found in schema`
    );
  }
  const referencedTableConfig = schema[referencedTableTsName];
  if (!referencedTableConfig) {
    throw new Error(`Table "${referencedTableTsName}" not found in schema`);
  }
  const sourceTable = relation.sourceTable;
  const sourceTableTsName = tableNamesMap[getTableUniqueName(sourceTable)];
  if (!sourceTableTsName) {
    throw new Error(
      `Table "${sourceTable[Table.Symbol.Name]}" not found in schema`
    );
  }
  const reverseRelations = [];
  for (const referencedTableRelation of Object.values(
    referencedTableConfig.relations
  )) {
    if (relation.relationName && relation !== referencedTableRelation && referencedTableRelation.relationName === relation.relationName || !relation.relationName && referencedTableRelation.referencedTable === relation.sourceTable) {
      reverseRelations.push(referencedTableRelation);
    }
  }
  if (reverseRelations.length > 1) {
    throw relation.relationName ? new Error(
      `There are multiple relations with name "${relation.relationName}" in table "${referencedTableTsName}"`
    ) : new Error(
      `There are multiple relations between "${referencedTableTsName}" and "${relation.sourceTable[Table.Symbol.Name]}". Please specify relation name`
    );
  }
  if (reverseRelations[0] && is(reverseRelations[0], One) && reverseRelations[0].config) {
    return {
      fields: reverseRelations[0].config.references,
      references: reverseRelations[0].config.fields
    };
  }
  throw new Error(
    `There is not enough information to infer relation "${sourceTableTsName}.${relation.fieldName}"`
  );
}
function createTableRelationsHelpers(sourceTable) {
  return {
    one: createOne(sourceTable),
    many: createMany(sourceTable)
  };
}
function mapRelationalRow(tablesConfig, tableConfig, row, buildQueryResultSelection, mapColumnValue = (value) => value) {
  const result = {};
  for (const [
    selectionItemIndex,
    selectionItem
  ] of buildQueryResultSelection.entries()) {
    if (selectionItem.isJson) {
      const relation = tableConfig.relations[selectionItem.tsKey];
      const rawSubRows = row[selectionItemIndex];
      const subRows = typeof rawSubRows === "string" ? JSON.parse(rawSubRows) : rawSubRows;
      result[selectionItem.tsKey] = is(relation, One) ? subRows && mapRelationalRow(
        tablesConfig,
        tablesConfig[selectionItem.relationTableTsKey],
        subRows,
        selectionItem.selection,
        mapColumnValue
      ) : subRows.map(
        (subRow) => mapRelationalRow(
          tablesConfig,
          tablesConfig[selectionItem.relationTableTsKey],
          subRow,
          selectionItem.selection,
          mapColumnValue
        )
      );
    } else {
      const value = mapColumnValue(row[selectionItemIndex]);
      const field = selectionItem.field;
      let decoder;
      if (is(field, Column)) {
        decoder = field;
      } else if (is(field, SQL)) {
        decoder = field.decoder;
      } else {
        decoder = field.sql.decoder;
      }
      result[selectionItem.tsKey] = value === null ? null : decoder.mapFromDriverValue(value);
    }
  }
  return result;
}

// node_modules/.pnpm/drizzle-orm@0.45.2_mysql2@3.22.3_@types+node@25.3.5_/node_modules/drizzle-orm/mysql-core/foreign-keys.js
var ForeignKeyBuilder2 = class {
  static [entityKind] = "MySqlForeignKeyBuilder";
  /** @internal */
  reference;
  /** @internal */
  _onUpdate;
  /** @internal */
  _onDelete;
  constructor(config, actions) {
    this.reference = () => {
      const { name, columns, foreignColumns } = config();
      return { name, columns, foreignTable: foreignColumns[0].table, foreignColumns };
    };
    if (actions) {
      this._onUpdate = actions.onUpdate;
      this._onDelete = actions.onDelete;
    }
  }
  onUpdate(action) {
    this._onUpdate = action;
    return this;
  }
  onDelete(action) {
    this._onDelete = action;
    return this;
  }
  /** @internal */
  build(table) {
    return new ForeignKey2(table, this);
  }
};
var ForeignKey2 = class {
  constructor(table, builder) {
    this.table = table;
    this.reference = builder.reference;
    this.onUpdate = builder._onUpdate;
    this.onDelete = builder._onDelete;
  }
  static [entityKind] = "MySqlForeignKey";
  reference;
  onUpdate;
  onDelete;
  getName() {
    const { name, columns, foreignColumns } = this.reference();
    const columnNames = columns.map((column) => column.name);
    const foreignColumnNames = foreignColumns.map((column) => column.name);
    const chunks = [
      this.table[TableName],
      ...columnNames,
      foreignColumns[0].table[TableName],
      ...foreignColumnNames
    ];
    return name ?? `${chunks.join("_")}_fk`;
  }
};

// node_modules/.pnpm/drizzle-orm@0.45.2_mysql2@3.22.3_@types+node@25.3.5_/node_modules/drizzle-orm/mysql-core/unique-constraint.js
function uniqueKeyName2(table, columns) {
  return `${table[TableName]}_${columns.join("_")}_unique`;
}
var UniqueConstraintBuilder2 = class {
  constructor(columns, name) {
    this.name = name;
    this.columns = columns;
  }
  static [entityKind] = "MySqlUniqueConstraintBuilder";
  /** @internal */
  columns;
  /** @internal */
  build(table) {
    return new UniqueConstraint2(table, this.columns, this.name);
  }
};
var UniqueOnConstraintBuilder2 = class {
  static [entityKind] = "MySqlUniqueOnConstraintBuilder";
  /** @internal */
  name;
  constructor(name) {
    this.name = name;
  }
  on(...columns) {
    return new UniqueConstraintBuilder2(columns, this.name);
  }
};
var UniqueConstraint2 = class {
  constructor(table, columns, name) {
    this.table = table;
    this.columns = columns;
    this.name = name ?? uniqueKeyName2(this.table, this.columns.map((column) => column.name));
  }
  static [entityKind] = "MySqlUniqueConstraint";
  columns;
  name;
  nullsNotDistinct = false;
  getName() {
    return this.name;
  }
};

// node_modules/.pnpm/drizzle-orm@0.45.2_mysql2@3.22.3_@types+node@25.3.5_/node_modules/drizzle-orm/mysql-core/columns/common.js
var MySqlColumnBuilder = class extends ColumnBuilder {
  static [entityKind] = "MySqlColumnBuilder";
  foreignKeyConfigs = [];
  references(ref, actions = {}) {
    this.foreignKeyConfigs.push({ ref, actions });
    return this;
  }
  unique(name) {
    this.config.isUnique = true;
    this.config.uniqueName = name;
    return this;
  }
  generatedAlwaysAs(as, config) {
    this.config.generated = {
      as,
      type: "always",
      mode: config?.mode ?? "virtual"
    };
    return this;
  }
  /** @internal */
  buildForeignKeys(column, table) {
    return this.foreignKeyConfigs.map(({ ref, actions }) => {
      return ((ref2, actions2) => {
        const builder = new ForeignKeyBuilder2(() => {
          const foreignColumn = ref2();
          return { columns: [column], foreignColumns: [foreignColumn] };
        });
        if (actions2.onUpdate) {
          builder.onUpdate(actions2.onUpdate);
        }
        if (actions2.onDelete) {
          builder.onDelete(actions2.onDelete);
        }
        return builder.build(table);
      })(ref, actions);
    });
  }
};
var MySqlColumn = class extends Column {
  constructor(table, config) {
    if (!config.uniqueName) {
      config.uniqueName = uniqueKeyName2(table, [config.name]);
    }
    super(table, config);
    this.table = table;
  }
  static [entityKind] = "MySqlColumn";
};
var MySqlColumnBuilderWithAutoIncrement = class extends MySqlColumnBuilder {
  static [entityKind] = "MySqlColumnBuilderWithAutoIncrement";
  constructor(name, dataType, columnType) {
    super(name, dataType, columnType);
    this.config.autoIncrement = false;
  }
  autoincrement() {
    this.config.autoIncrement = true;
    this.config.hasDefault = true;
    return this;
  }
};
var MySqlColumnWithAutoIncrement = class extends MySqlColumn {
  static [entityKind] = "MySqlColumnWithAutoIncrement";
  autoIncrement = this.config.autoIncrement;
};

// node_modules/.pnpm/drizzle-orm@0.45.2_mysql2@3.22.3_@types+node@25.3.5_/node_modules/drizzle-orm/mysql-core/columns/bigint.js
var MySqlBigInt53Builder = class extends MySqlColumnBuilderWithAutoIncrement {
  static [entityKind] = "MySqlBigInt53Builder";
  constructor(name, unsigned = false) {
    super(name, "number", "MySqlBigInt53");
    this.config.unsigned = unsigned;
  }
  /** @internal */
  build(table) {
    return new MySqlBigInt53(
      table,
      this.config
    );
  }
};
var MySqlBigInt53 = class extends MySqlColumnWithAutoIncrement {
  static [entityKind] = "MySqlBigInt53";
  getSQLType() {
    return `bigint${this.config.unsigned ? " unsigned" : ""}`;
  }
  mapFromDriverValue(value) {
    if (typeof value === "number") {
      return value;
    }
    return Number(value);
  }
};
var MySqlBigInt64Builder = class extends MySqlColumnBuilderWithAutoIncrement {
  static [entityKind] = "MySqlBigInt64Builder";
  constructor(name, unsigned = false) {
    super(name, "bigint", "MySqlBigInt64");
    this.config.unsigned = unsigned;
  }
  /** @internal */
  build(table) {
    return new MySqlBigInt64(
      table,
      this.config
    );
  }
};
var MySqlBigInt64 = class extends MySqlColumnWithAutoIncrement {
  static [entityKind] = "MySqlBigInt64";
  getSQLType() {
    return `bigint${this.config.unsigned ? " unsigned" : ""}`;
  }
  // eslint-disable-next-line unicorn/prefer-native-coercion-functions
  mapFromDriverValue(value) {
    return BigInt(value);
  }
};
function bigint(a, b) {
  const { name, config } = getColumnNameAndConfig(a, b);
  if (config.mode === "number") {
    return new MySqlBigInt53Builder(name, config.unsigned);
  }
  return new MySqlBigInt64Builder(name, config.unsigned);
}

// node_modules/.pnpm/drizzle-orm@0.45.2_mysql2@3.22.3_@types+node@25.3.5_/node_modules/drizzle-orm/mysql-core/columns/binary.js
var MySqlBinaryBuilder = class extends MySqlColumnBuilder {
  static [entityKind] = "MySqlBinaryBuilder";
  constructor(name, length) {
    super(name, "string", "MySqlBinary");
    this.config.length = length;
  }
  /** @internal */
  build(table) {
    return new MySqlBinary(table, this.config);
  }
};
var MySqlBinary = class extends MySqlColumn {
  static [entityKind] = "MySqlBinary";
  length = this.config.length;
  mapFromDriverValue(value) {
    if (typeof value === "string") return value;
    if (Buffer.isBuffer(value)) return value.toString();
    const str = [];
    for (const v of value) {
      str.push(v === 49 ? "1" : "0");
    }
    return str.join("");
  }
  getSQLType() {
    return this.length === void 0 ? `binary` : `binary(${this.length})`;
  }
};
function binary(a, b = {}) {
  const { name, config } = getColumnNameAndConfig(a, b);
  return new MySqlBinaryBuilder(name, config.length);
}

// node_modules/.pnpm/drizzle-orm@0.45.2_mysql2@3.22.3_@types+node@25.3.5_/node_modules/drizzle-orm/mysql-core/columns/boolean.js
var MySqlBooleanBuilder = class extends MySqlColumnBuilder {
  static [entityKind] = "MySqlBooleanBuilder";
  constructor(name) {
    super(name, "boolean", "MySqlBoolean");
  }
  /** @internal */
  build(table) {
    return new MySqlBoolean(
      table,
      this.config
    );
  }
};
var MySqlBoolean = class extends MySqlColumn {
  static [entityKind] = "MySqlBoolean";
  getSQLType() {
    return "boolean";
  }
  mapFromDriverValue(value) {
    if (typeof value === "boolean") {
      return value;
    }
    return value === 1;
  }
};
function boolean(name) {
  return new MySqlBooleanBuilder(name ?? "");
}

// node_modules/.pnpm/drizzle-orm@0.45.2_mysql2@3.22.3_@types+node@25.3.5_/node_modules/drizzle-orm/mysql-core/columns/char.js
var MySqlCharBuilder = class extends MySqlColumnBuilder {
  static [entityKind] = "MySqlCharBuilder";
  constructor(name, config) {
    super(name, "string", "MySqlChar");
    this.config.length = config.length;
    this.config.enum = config.enum;
  }
  /** @internal */
  build(table) {
    return new MySqlChar(
      table,
      this.config
    );
  }
};
var MySqlChar = class extends MySqlColumn {
  static [entityKind] = "MySqlChar";
  length = this.config.length;
  enumValues = this.config.enum;
  getSQLType() {
    return this.length === void 0 ? `char` : `char(${this.length})`;
  }
};
function char(a, b = {}) {
  const { name, config } = getColumnNameAndConfig(a, b);
  return new MySqlCharBuilder(name, config);
}

// node_modules/.pnpm/drizzle-orm@0.45.2_mysql2@3.22.3_@types+node@25.3.5_/node_modules/drizzle-orm/mysql-core/columns/custom.js
var MySqlCustomColumnBuilder = class extends MySqlColumnBuilder {
  static [entityKind] = "MySqlCustomColumnBuilder";
  constructor(name, fieldConfig, customTypeParams) {
    super(name, "custom", "MySqlCustomColumn");
    this.config.fieldConfig = fieldConfig;
    this.config.customTypeParams = customTypeParams;
  }
  /** @internal */
  build(table) {
    return new MySqlCustomColumn(
      table,
      this.config
    );
  }
};
var MySqlCustomColumn = class extends MySqlColumn {
  static [entityKind] = "MySqlCustomColumn";
  sqlName;
  mapTo;
  mapFrom;
  constructor(table, config) {
    super(table, config);
    this.sqlName = config.customTypeParams.dataType(config.fieldConfig);
    this.mapTo = config.customTypeParams.toDriver;
    this.mapFrom = config.customTypeParams.fromDriver;
  }
  getSQLType() {
    return this.sqlName;
  }
  mapFromDriverValue(value) {
    return typeof this.mapFrom === "function" ? this.mapFrom(value) : value;
  }
  mapToDriverValue(value) {
    return typeof this.mapTo === "function" ? this.mapTo(value) : value;
  }
};
function customType(customTypeParams) {
  return (a, b) => {
    const { name, config } = getColumnNameAndConfig(a, b);
    return new MySqlCustomColumnBuilder(name, config, customTypeParams);
  };
}

// node_modules/.pnpm/drizzle-orm@0.45.2_mysql2@3.22.3_@types+node@25.3.5_/node_modules/drizzle-orm/mysql-core/columns/date.js
var MySqlDateBuilder = class extends MySqlColumnBuilder {
  static [entityKind] = "MySqlDateBuilder";
  constructor(name) {
    super(name, "date", "MySqlDate");
  }
  /** @internal */
  build(table) {
    return new MySqlDate(table, this.config);
  }
};
var MySqlDate = class extends MySqlColumn {
  static [entityKind] = "MySqlDate";
  constructor(table, config) {
    super(table, config);
  }
  getSQLType() {
    return `date`;
  }
  mapFromDriverValue(value) {
    return new Date(value);
  }
};
var MySqlDateStringBuilder = class extends MySqlColumnBuilder {
  static [entityKind] = "MySqlDateStringBuilder";
  constructor(name) {
    super(name, "string", "MySqlDateString");
  }
  /** @internal */
  build(table) {
    return new MySqlDateString(
      table,
      this.config
    );
  }
};
var MySqlDateString = class extends MySqlColumn {
  static [entityKind] = "MySqlDateString";
  constructor(table, config) {
    super(table, config);
  }
  getSQLType() {
    return `date`;
  }
};
function date(a, b) {
  const { name, config } = getColumnNameAndConfig(a, b);
  if (config?.mode === "string") {
    return new MySqlDateStringBuilder(name);
  }
  return new MySqlDateBuilder(name);
}

// node_modules/.pnpm/drizzle-orm@0.45.2_mysql2@3.22.3_@types+node@25.3.5_/node_modules/drizzle-orm/mysql-core/columns/datetime.js
var MySqlDateTimeBuilder = class extends MySqlColumnBuilder {
  static [entityKind] = "MySqlDateTimeBuilder";
  constructor(name, config) {
    super(name, "date", "MySqlDateTime");
    this.config.fsp = config?.fsp;
  }
  /** @internal */
  build(table) {
    return new MySqlDateTime(
      table,
      this.config
    );
  }
};
var MySqlDateTime = class extends MySqlColumn {
  static [entityKind] = "MySqlDateTime";
  fsp;
  constructor(table, config) {
    super(table, config);
    this.fsp = config.fsp;
  }
  getSQLType() {
    const precision = this.fsp === void 0 ? "" : `(${this.fsp})`;
    return `datetime${precision}`;
  }
  mapToDriverValue(value) {
    return value.toISOString().replace("T", " ").replace("Z", "");
  }
  mapFromDriverValue(value) {
    return /* @__PURE__ */ new Date(value.replace(" ", "T") + "Z");
  }
};
var MySqlDateTimeStringBuilder = class extends MySqlColumnBuilder {
  static [entityKind] = "MySqlDateTimeStringBuilder";
  constructor(name, config) {
    super(name, "string", "MySqlDateTimeString");
    this.config.fsp = config?.fsp;
  }
  /** @internal */
  build(table) {
    return new MySqlDateTimeString(
      table,
      this.config
    );
  }
};
var MySqlDateTimeString = class extends MySqlColumn {
  static [entityKind] = "MySqlDateTimeString";
  fsp;
  constructor(table, config) {
    super(table, config);
    this.fsp = config.fsp;
  }
  getSQLType() {
    const precision = this.fsp === void 0 ? "" : `(${this.fsp})`;
    return `datetime${precision}`;
  }
};
function datetime(a, b) {
  const { name, config } = getColumnNameAndConfig(a, b);
  if (config?.mode === "string") {
    return new MySqlDateTimeStringBuilder(name, config);
  }
  return new MySqlDateTimeBuilder(name, config);
}

// node_modules/.pnpm/drizzle-orm@0.45.2_mysql2@3.22.3_@types+node@25.3.5_/node_modules/drizzle-orm/mysql-core/columns/decimal.js
var MySqlDecimalBuilder = class extends MySqlColumnBuilderWithAutoIncrement {
  static [entityKind] = "MySqlDecimalBuilder";
  constructor(name, config) {
    super(name, "string", "MySqlDecimal");
    this.config.precision = config?.precision;
    this.config.scale = config?.scale;
    this.config.unsigned = config?.unsigned;
  }
  /** @internal */
  build(table) {
    return new MySqlDecimal(
      table,
      this.config
    );
  }
};
var MySqlDecimal = class extends MySqlColumnWithAutoIncrement {
  static [entityKind] = "MySqlDecimal";
  precision = this.config.precision;
  scale = this.config.scale;
  unsigned = this.config.unsigned;
  mapFromDriverValue(value) {
    if (typeof value === "string") return value;
    return String(value);
  }
  getSQLType() {
    let type = "";
    if (this.precision !== void 0 && this.scale !== void 0) {
      type += `decimal(${this.precision},${this.scale})`;
    } else if (this.precision === void 0) {
      type += "decimal";
    } else {
      type += `decimal(${this.precision})`;
    }
    type = type === "decimal(10,0)" || type === "decimal(10)" ? "decimal" : type;
    return this.unsigned ? `${type} unsigned` : type;
  }
};
var MySqlDecimalNumberBuilder = class extends MySqlColumnBuilderWithAutoIncrement {
  static [entityKind] = "MySqlDecimalNumberBuilder";
  constructor(name, config) {
    super(name, "number", "MySqlDecimalNumber");
    this.config.precision = config?.precision;
    this.config.scale = config?.scale;
    this.config.unsigned = config?.unsigned;
  }
  /** @internal */
  build(table) {
    return new MySqlDecimalNumber(
      table,
      this.config
    );
  }
};
var MySqlDecimalNumber = class extends MySqlColumnWithAutoIncrement {
  static [entityKind] = "MySqlDecimalNumber";
  precision = this.config.precision;
  scale = this.config.scale;
  unsigned = this.config.unsigned;
  mapFromDriverValue(value) {
    if (typeof value === "number") return value;
    return Number(value);
  }
  mapToDriverValue = String;
  getSQLType() {
    let type = "";
    if (this.precision !== void 0 && this.scale !== void 0) {
      type += `decimal(${this.precision},${this.scale})`;
    } else if (this.precision === void 0) {
      type += "decimal";
    } else {
      type += `decimal(${this.precision})`;
    }
    type = type === "decimal(10,0)" || type === "decimal(10)" ? "decimal" : type;
    return this.unsigned ? `${type} unsigned` : type;
  }
};
var MySqlDecimalBigIntBuilder = class extends MySqlColumnBuilderWithAutoIncrement {
  static [entityKind] = "MySqlDecimalBigIntBuilder";
  constructor(name, config) {
    super(name, "bigint", "MySqlDecimalBigInt");
    this.config.precision = config?.precision;
    this.config.scale = config?.scale;
    this.config.unsigned = config?.unsigned;
  }
  /** @internal */
  build(table) {
    return new MySqlDecimalBigInt(
      table,
      this.config
    );
  }
};
var MySqlDecimalBigInt = class extends MySqlColumnWithAutoIncrement {
  static [entityKind] = "MySqlDecimalBigInt";
  precision = this.config.precision;
  scale = this.config.scale;
  unsigned = this.config.unsigned;
  mapFromDriverValue = BigInt;
  mapToDriverValue = String;
  getSQLType() {
    let type = "";
    if (this.precision !== void 0 && this.scale !== void 0) {
      type += `decimal(${this.precision},${this.scale})`;
    } else if (this.precision === void 0) {
      type += "decimal";
    } else {
      type += `decimal(${this.precision})`;
    }
    type = type === "decimal(10,0)" || type === "decimal(10)" ? "decimal" : type;
    return this.unsigned ? `${type} unsigned` : type;
  }
};
function decimal(a, b = {}) {
  const { name, config } = getColumnNameAndConfig(a, b);
  const mode = config?.mode;
  return mode === "number" ? new MySqlDecimalNumberBuilder(name, config) : mode === "bigint" ? new MySqlDecimalBigIntBuilder(name, config) : new MySqlDecimalBuilder(name, config);
}

// node_modules/.pnpm/drizzle-orm@0.45.2_mysql2@3.22.3_@types+node@25.3.5_/node_modules/drizzle-orm/mysql-core/columns/double.js
var MySqlDoubleBuilder = class extends MySqlColumnBuilderWithAutoIncrement {
  static [entityKind] = "MySqlDoubleBuilder";
  constructor(name, config) {
    super(name, "number", "MySqlDouble");
    this.config.precision = config?.precision;
    this.config.scale = config?.scale;
    this.config.unsigned = config?.unsigned;
  }
  /** @internal */
  build(table) {
    return new MySqlDouble(table, this.config);
  }
};
var MySqlDouble = class extends MySqlColumnWithAutoIncrement {
  static [entityKind] = "MySqlDouble";
  precision = this.config.precision;
  scale = this.config.scale;
  unsigned = this.config.unsigned;
  getSQLType() {
    let type = "";
    if (this.precision !== void 0 && this.scale !== void 0) {
      type += `double(${this.precision},${this.scale})`;
    } else if (this.precision === void 0) {
      type += "double";
    } else {
      type += `double(${this.precision})`;
    }
    return this.unsigned ? `${type} unsigned` : type;
  }
};
function double(a, b) {
  const { name, config } = getColumnNameAndConfig(a, b);
  return new MySqlDoubleBuilder(name, config);
}

// node_modules/.pnpm/drizzle-orm@0.45.2_mysql2@3.22.3_@types+node@25.3.5_/node_modules/drizzle-orm/mysql-core/columns/enum.js
var MySqlEnumColumnBuilder = class extends MySqlColumnBuilder {
  static [entityKind] = "MySqlEnumColumnBuilder";
  constructor(name, values) {
    super(name, "string", "MySqlEnumColumn");
    this.config.enumValues = values;
  }
  /** @internal */
  build(table) {
    return new MySqlEnumColumn(
      table,
      this.config
    );
  }
};
var MySqlEnumColumn = class extends MySqlColumn {
  static [entityKind] = "MySqlEnumColumn";
  enumValues = this.config.enumValues;
  getSQLType() {
    return `enum(${this.enumValues.map((value) => `'${value}'`).join(",")})`;
  }
};
var MySqlEnumObjectColumnBuilder = class extends MySqlColumnBuilder {
  static [entityKind] = "MySqlEnumObjectColumnBuilder";
  constructor(name, values) {
    super(name, "string", "MySqlEnumObjectColumn");
    this.config.enumValues = values;
  }
  /** @internal */
  build(table) {
    return new MySqlEnumObjectColumn(
      table,
      this.config
    );
  }
};
var MySqlEnumObjectColumn = class extends MySqlColumn {
  static [entityKind] = "MySqlEnumObjectColumn";
  enumValues = this.config.enumValues;
  getSQLType() {
    return `enum(${this.enumValues.map((value) => `'${value}'`).join(",")})`;
  }
};
function mysqlEnum(a, b) {
  if (typeof a === "string" && Array.isArray(b) || Array.isArray(a)) {
    const name = typeof a === "string" && a.length > 0 ? a : "";
    const values = (typeof a === "string" ? b : a) ?? [];
    if (values.length === 0) {
      throw new Error(`You have an empty array for "${name}" enum values`);
    }
    return new MySqlEnumColumnBuilder(name, values);
  }
  if (typeof a === "string" && typeof b === "object" || typeof a === "object") {
    const name = typeof a === "object" ? "" : a;
    const values = typeof a === "object" ? Object.values(a) : typeof b === "object" ? Object.values(b) : [];
    if (values.length === 0) {
      throw new Error(`You have an empty array for "${name}" enum values`);
    }
    return new MySqlEnumObjectColumnBuilder(name, values);
  }
}

// node_modules/.pnpm/drizzle-orm@0.45.2_mysql2@3.22.3_@types+node@25.3.5_/node_modules/drizzle-orm/mysql-core/columns/float.js
var MySqlFloatBuilder = class extends MySqlColumnBuilderWithAutoIncrement {
  static [entityKind] = "MySqlFloatBuilder";
  constructor(name, config) {
    super(name, "number", "MySqlFloat");
    this.config.precision = config?.precision;
    this.config.scale = config?.scale;
    this.config.unsigned = config?.unsigned;
  }
  /** @internal */
  build(table) {
    return new MySqlFloat(table, this.config);
  }
};
var MySqlFloat = class extends MySqlColumnWithAutoIncrement {
  static [entityKind] = "MySqlFloat";
  precision = this.config.precision;
  scale = this.config.scale;
  unsigned = this.config.unsigned;
  getSQLType() {
    let type = "";
    if (this.precision !== void 0 && this.scale !== void 0) {
      type += `float(${this.precision},${this.scale})`;
    } else if (this.precision === void 0) {
      type += "float";
    } else {
      type += `float(${this.precision})`;
    }
    return this.unsigned ? `${type} unsigned` : type;
  }
};
function float(a, b) {
  const { name, config } = getColumnNameAndConfig(a, b);
  return new MySqlFloatBuilder(name, config);
}

// node_modules/.pnpm/drizzle-orm@0.45.2_mysql2@3.22.3_@types+node@25.3.5_/node_modules/drizzle-orm/mysql-core/columns/int.js
var MySqlIntBuilder = class extends MySqlColumnBuilderWithAutoIncrement {
  static [entityKind] = "MySqlIntBuilder";
  constructor(name, config) {
    super(name, "number", "MySqlInt");
    this.config.unsigned = config ? config.unsigned : false;
  }
  /** @internal */
  build(table) {
    return new MySqlInt(table, this.config);
  }
};
var MySqlInt = class extends MySqlColumnWithAutoIncrement {
  static [entityKind] = "MySqlInt";
  getSQLType() {
    return `int${this.config.unsigned ? " unsigned" : ""}`;
  }
  mapFromDriverValue(value) {
    if (typeof value === "string") {
      return Number(value);
    }
    return value;
  }
};
function int(a, b) {
  const { name, config } = getColumnNameAndConfig(a, b);
  return new MySqlIntBuilder(name, config);
}

// node_modules/.pnpm/drizzle-orm@0.45.2_mysql2@3.22.3_@types+node@25.3.5_/node_modules/drizzle-orm/mysql-core/columns/json.js
var MySqlJsonBuilder = class extends MySqlColumnBuilder {
  static [entityKind] = "MySqlJsonBuilder";
  constructor(name) {
    super(name, "json", "MySqlJson");
  }
  /** @internal */
  build(table) {
    return new MySqlJson(table, this.config);
  }
};
var MySqlJson = class extends MySqlColumn {
  static [entityKind] = "MySqlJson";
  getSQLType() {
    return "json";
  }
  mapToDriverValue(value) {
    return JSON.stringify(value);
  }
};
function json(name) {
  return new MySqlJsonBuilder(name ?? "");
}

// node_modules/.pnpm/drizzle-orm@0.45.2_mysql2@3.22.3_@types+node@25.3.5_/node_modules/drizzle-orm/mysql-core/columns/mediumint.js
var MySqlMediumIntBuilder = class extends MySqlColumnBuilderWithAutoIncrement {
  static [entityKind] = "MySqlMediumIntBuilder";
  constructor(name, config) {
    super(name, "number", "MySqlMediumInt");
    this.config.unsigned = config ? config.unsigned : false;
  }
  /** @internal */
  build(table) {
    return new MySqlMediumInt(
      table,
      this.config
    );
  }
};
var MySqlMediumInt = class extends MySqlColumnWithAutoIncrement {
  static [entityKind] = "MySqlMediumInt";
  getSQLType() {
    return `mediumint${this.config.unsigned ? " unsigned" : ""}`;
  }
  mapFromDriverValue(value) {
    if (typeof value === "string") {
      return Number(value);
    }
    return value;
  }
};
function mediumint(a, b) {
  const { name, config } = getColumnNameAndConfig(a, b);
  return new MySqlMediumIntBuilder(name, config);
}

// node_modules/.pnpm/drizzle-orm@0.45.2_mysql2@3.22.3_@types+node@25.3.5_/node_modules/drizzle-orm/mysql-core/columns/real.js
var MySqlRealBuilder = class extends MySqlColumnBuilderWithAutoIncrement {
  static [entityKind] = "MySqlRealBuilder";
  constructor(name, config) {
    super(name, "number", "MySqlReal");
    this.config.precision = config?.precision;
    this.config.scale = config?.scale;
  }
  /** @internal */
  build(table) {
    return new MySqlReal(table, this.config);
  }
};
var MySqlReal = class extends MySqlColumnWithAutoIncrement {
  static [entityKind] = "MySqlReal";
  precision = this.config.precision;
  scale = this.config.scale;
  getSQLType() {
    if (this.precision !== void 0 && this.scale !== void 0) {
      return `real(${this.precision}, ${this.scale})`;
    } else if (this.precision === void 0) {
      return "real";
    } else {
      return `real(${this.precision})`;
    }
  }
};
function real(a, b = {}) {
  const { name, config } = getColumnNameAndConfig(a, b);
  return new MySqlRealBuilder(name, config);
}

// node_modules/.pnpm/drizzle-orm@0.45.2_mysql2@3.22.3_@types+node@25.3.5_/node_modules/drizzle-orm/mysql-core/columns/serial.js
var MySqlSerialBuilder = class extends MySqlColumnBuilderWithAutoIncrement {
  static [entityKind] = "MySqlSerialBuilder";
  constructor(name) {
    super(name, "number", "MySqlSerial");
    this.config.hasDefault = true;
    this.config.autoIncrement = true;
  }
  /** @internal */
  build(table) {
    return new MySqlSerial(table, this.config);
  }
};
var MySqlSerial = class extends MySqlColumnWithAutoIncrement {
  static [entityKind] = "MySqlSerial";
  getSQLType() {
    return "serial";
  }
  mapFromDriverValue(value) {
    if (typeof value === "string") {
      return Number(value);
    }
    return value;
  }
};
function serial(name) {
  return new MySqlSerialBuilder(name ?? "");
}

// node_modules/.pnpm/drizzle-orm@0.45.2_mysql2@3.22.3_@types+node@25.3.5_/node_modules/drizzle-orm/mysql-core/columns/smallint.js
var MySqlSmallIntBuilder = class extends MySqlColumnBuilderWithAutoIncrement {
  static [entityKind] = "MySqlSmallIntBuilder";
  constructor(name, config) {
    super(name, "number", "MySqlSmallInt");
    this.config.unsigned = config ? config.unsigned : false;
  }
  /** @internal */
  build(table) {
    return new MySqlSmallInt(
      table,
      this.config
    );
  }
};
var MySqlSmallInt = class extends MySqlColumnWithAutoIncrement {
  static [entityKind] = "MySqlSmallInt";
  getSQLType() {
    return `smallint${this.config.unsigned ? " unsigned" : ""}`;
  }
  mapFromDriverValue(value) {
    if (typeof value === "string") {
      return Number(value);
    }
    return value;
  }
};
function smallint(a, b) {
  const { name, config } = getColumnNameAndConfig(a, b);
  return new MySqlSmallIntBuilder(name, config);
}

// node_modules/.pnpm/drizzle-orm@0.45.2_mysql2@3.22.3_@types+node@25.3.5_/node_modules/drizzle-orm/mysql-core/columns/text.js
var MySqlTextBuilder = class extends MySqlColumnBuilder {
  static [entityKind] = "MySqlTextBuilder";
  constructor(name, textType, config) {
    super(name, "string", "MySqlText");
    this.config.textType = textType;
    this.config.enumValues = config.enum;
  }
  /** @internal */
  build(table) {
    return new MySqlText(table, this.config);
  }
};
var MySqlText = class extends MySqlColumn {
  static [entityKind] = "MySqlText";
  textType = this.config.textType;
  enumValues = this.config.enumValues;
  getSQLType() {
    return this.textType;
  }
};
function text(a, b = {}) {
  const { name, config } = getColumnNameAndConfig(a, b);
  return new MySqlTextBuilder(name, "text", config);
}
function tinytext(a, b = {}) {
  const { name, config } = getColumnNameAndConfig(a, b);
  return new MySqlTextBuilder(name, "tinytext", config);
}
function mediumtext(a, b = {}) {
  const { name, config } = getColumnNameAndConfig(a, b);
  return new MySqlTextBuilder(name, "mediumtext", config);
}
function longtext(a, b = {}) {
  const { name, config } = getColumnNameAndConfig(a, b);
  return new MySqlTextBuilder(name, "longtext", config);
}

// node_modules/.pnpm/drizzle-orm@0.45.2_mysql2@3.22.3_@types+node@25.3.5_/node_modules/drizzle-orm/mysql-core/columns/time.js
var MySqlTimeBuilder = class extends MySqlColumnBuilder {
  static [entityKind] = "MySqlTimeBuilder";
  constructor(name, config) {
    super(name, "string", "MySqlTime");
    this.config.fsp = config?.fsp;
  }
  /** @internal */
  build(table) {
    return new MySqlTime(table, this.config);
  }
};
var MySqlTime = class extends MySqlColumn {
  static [entityKind] = "MySqlTime";
  fsp = this.config.fsp;
  getSQLType() {
    const precision = this.fsp === void 0 ? "" : `(${this.fsp})`;
    return `time${precision}`;
  }
};
function time(a, b) {
  const { name, config } = getColumnNameAndConfig(a, b);
  return new MySqlTimeBuilder(name, config);
}

// node_modules/.pnpm/drizzle-orm@0.45.2_mysql2@3.22.3_@types+node@25.3.5_/node_modules/drizzle-orm/mysql-core/columns/date.common.js
var MySqlDateColumnBaseBuilder = class extends MySqlColumnBuilder {
  static [entityKind] = "MySqlDateColumnBuilder";
  defaultNow() {
    return this.default(sql`(now())`);
  }
  // "on update now" also adds an implicit default value to the column - https://dev.mysql.com/doc/refman/8.0/en/timestamp-initialization.html
  onUpdateNow() {
    this.config.hasOnUpdateNow = true;
    this.config.hasDefault = true;
    return this;
  }
};
var MySqlDateBaseColumn = class extends MySqlColumn {
  static [entityKind] = "MySqlDateColumn";
  hasOnUpdateNow = this.config.hasOnUpdateNow;
};

// node_modules/.pnpm/drizzle-orm@0.45.2_mysql2@3.22.3_@types+node@25.3.5_/node_modules/drizzle-orm/mysql-core/columns/timestamp.js
var MySqlTimestampBuilder = class extends MySqlDateColumnBaseBuilder {
  static [entityKind] = "MySqlTimestampBuilder";
  constructor(name, config) {
    super(name, "date", "MySqlTimestamp");
    this.config.fsp = config?.fsp;
  }
  /** @internal */
  build(table) {
    return new MySqlTimestamp(
      table,
      this.config
    );
  }
};
var MySqlTimestamp = class extends MySqlDateBaseColumn {
  static [entityKind] = "MySqlTimestamp";
  fsp = this.config.fsp;
  getSQLType() {
    const precision = this.fsp === void 0 ? "" : `(${this.fsp})`;
    return `timestamp${precision}`;
  }
  mapFromDriverValue(value) {
    return /* @__PURE__ */ new Date(value + "+0000");
  }
  mapToDriverValue(value) {
    return value.toISOString().slice(0, -1).replace("T", " ");
  }
};
var MySqlTimestampStringBuilder = class extends MySqlDateColumnBaseBuilder {
  static [entityKind] = "MySqlTimestampStringBuilder";
  constructor(name, config) {
    super(name, "string", "MySqlTimestampString");
    this.config.fsp = config?.fsp;
  }
  /** @internal */
  build(table) {
    return new MySqlTimestampString(
      table,
      this.config
    );
  }
};
var MySqlTimestampString = class extends MySqlDateBaseColumn {
  static [entityKind] = "MySqlTimestampString";
  fsp = this.config.fsp;
  getSQLType() {
    const precision = this.fsp === void 0 ? "" : `(${this.fsp})`;
    return `timestamp${precision}`;
  }
};
function timestamp(a, b = {}) {
  const { name, config } = getColumnNameAndConfig(a, b);
  if (config?.mode === "string") {
    return new MySqlTimestampStringBuilder(name, config);
  }
  return new MySqlTimestampBuilder(name, config);
}

// node_modules/.pnpm/drizzle-orm@0.45.2_mysql2@3.22.3_@types+node@25.3.5_/node_modules/drizzle-orm/mysql-core/columns/tinyint.js
var MySqlTinyIntBuilder = class extends MySqlColumnBuilderWithAutoIncrement {
  static [entityKind] = "MySqlTinyIntBuilder";
  constructor(name, config) {
    super(name, "number", "MySqlTinyInt");
    this.config.unsigned = config ? config.unsigned : false;
  }
  /** @internal */
  build(table) {
    return new MySqlTinyInt(
      table,
      this.config
    );
  }
};
var MySqlTinyInt = class extends MySqlColumnWithAutoIncrement {
  static [entityKind] = "MySqlTinyInt";
  getSQLType() {
    return `tinyint${this.config.unsigned ? " unsigned" : ""}`;
  }
  mapFromDriverValue(value) {
    if (typeof value === "string") {
      return Number(value);
    }
    return value;
  }
};
function tinyint(a, b) {
  const { name, config } = getColumnNameAndConfig(a, b);
  return new MySqlTinyIntBuilder(name, config);
}

// node_modules/.pnpm/drizzle-orm@0.45.2_mysql2@3.22.3_@types+node@25.3.5_/node_modules/drizzle-orm/mysql-core/columns/varbinary.js
var MySqlVarBinaryBuilder = class extends MySqlColumnBuilder {
  static [entityKind] = "MySqlVarBinaryBuilder";
  /** @internal */
  constructor(name, config) {
    super(name, "string", "MySqlVarBinary");
    this.config.length = config?.length;
  }
  /** @internal */
  build(table) {
    return new MySqlVarBinary(
      table,
      this.config
    );
  }
};
var MySqlVarBinary = class extends MySqlColumn {
  static [entityKind] = "MySqlVarBinary";
  length = this.config.length;
  mapFromDriverValue(value) {
    if (typeof value === "string") return value;
    if (Buffer.isBuffer(value)) return value.toString();
    const str = [];
    for (const v of value) {
      str.push(v === 49 ? "1" : "0");
    }
    return str.join("");
  }
  getSQLType() {
    return this.length === void 0 ? `varbinary` : `varbinary(${this.length})`;
  }
};
function varbinary(a, b) {
  const { name, config } = getColumnNameAndConfig(a, b);
  return new MySqlVarBinaryBuilder(name, config);
}

// node_modules/.pnpm/drizzle-orm@0.45.2_mysql2@3.22.3_@types+node@25.3.5_/node_modules/drizzle-orm/mysql-core/columns/varchar.js
var MySqlVarCharBuilder = class extends MySqlColumnBuilder {
  static [entityKind] = "MySqlVarCharBuilder";
  /** @internal */
  constructor(name, config) {
    super(name, "string", "MySqlVarChar");
    this.config.length = config.length;
    this.config.enum = config.enum;
  }
  /** @internal */
  build(table) {
    return new MySqlVarChar(
      table,
      this.config
    );
  }
};
var MySqlVarChar = class extends MySqlColumn {
  static [entityKind] = "MySqlVarChar";
  length = this.config.length;
  enumValues = this.config.enum;
  getSQLType() {
    return this.length === void 0 ? `varchar` : `varchar(${this.length})`;
  }
};
function varchar(a, b) {
  const { name, config } = getColumnNameAndConfig(a, b);
  return new MySqlVarCharBuilder(name, config);
}

// node_modules/.pnpm/drizzle-orm@0.45.2_mysql2@3.22.3_@types+node@25.3.5_/node_modules/drizzle-orm/mysql-core/columns/year.js
var MySqlYearBuilder = class extends MySqlColumnBuilder {
  static [entityKind] = "MySqlYearBuilder";
  constructor(name) {
    super(name, "number", "MySqlYear");
  }
  /** @internal */
  build(table) {
    return new MySqlYear(table, this.config);
  }
};
var MySqlYear = class extends MySqlColumn {
  static [entityKind] = "MySqlYear";
  getSQLType() {
    return `year`;
  }
};
function year(name) {
  return new MySqlYearBuilder(name ?? "");
}

// node_modules/.pnpm/drizzle-orm@0.45.2_mysql2@3.22.3_@types+node@25.3.5_/node_modules/drizzle-orm/mysql-core/columns/all.js
function getMySqlColumnBuilders() {
  return {
    bigint,
    binary,
    boolean,
    char,
    customType,
    date,
    datetime,
    decimal,
    double,
    mysqlEnum,
    float,
    int,
    json,
    mediumint,
    real,
    serial,
    smallint,
    text,
    time,
    timestamp,
    tinyint,
    varbinary,
    varchar,
    year,
    longtext,
    mediumtext,
    tinytext
  };
}

// node_modules/.pnpm/drizzle-orm@0.45.2_mysql2@3.22.3_@types+node@25.3.5_/node_modules/drizzle-orm/mysql-core/table.js
var InlineForeignKeys2 = /* @__PURE__ */ Symbol.for("drizzle:MySqlInlineForeignKeys");
var MySqlTable = class extends Table {
  static [entityKind] = "MySqlTable";
  /** @internal */
  static Symbol = Object.assign({}, Table.Symbol, {
    InlineForeignKeys: InlineForeignKeys2
  });
  /** @internal */
  [Table.Symbol.Columns];
  /** @internal */
  [InlineForeignKeys2] = [];
  /** @internal */
  [Table.Symbol.ExtraConfigBuilder] = void 0;
};
function mysqlTableWithSchema(name, columns, extraConfig, schema, baseName = name) {
  const rawTable = new MySqlTable(name, schema, baseName);
  const parsedColumns = typeof columns === "function" ? columns(getMySqlColumnBuilders()) : columns;
  const builtColumns = Object.fromEntries(
    Object.entries(parsedColumns).map(([name2, colBuilderBase]) => {
      const colBuilder = colBuilderBase;
      colBuilder.setName(name2);
      const column = colBuilder.build(rawTable);
      rawTable[InlineForeignKeys2].push(...colBuilder.buildForeignKeys(column, rawTable));
      return [name2, column];
    })
  );
  const table = Object.assign(rawTable, builtColumns);
  table[Table.Symbol.Columns] = builtColumns;
  table[Table.Symbol.ExtraConfigColumns] = builtColumns;
  if (extraConfig) {
    table[MySqlTable.Symbol.ExtraConfigBuilder] = extraConfig;
  }
  return table;
}
var mysqlTable = (name, columns, extraConfig) => {
  return mysqlTableWithSchema(name, columns, extraConfig, void 0, name);
};

// node_modules/.pnpm/drizzle-orm@0.45.2_mysql2@3.22.3_@types+node@25.3.5_/node_modules/drizzle-orm/mysql-core/utils.js
function extractUsedTable(table) {
  if (is(table, MySqlTable)) {
    return [`${table[Table.Symbol.BaseName]}`];
  }
  if (is(table, Subquery)) {
    return table._.usedTables ?? [];
  }
  if (is(table, SQL)) {
    return table.usedTables ?? [];
  }
  return [];
}
function convertIndexToString(indexes) {
  return indexes.map((idx) => {
    return typeof idx === "object" ? idx.config.name : idx;
  });
}
function toArray(value) {
  return Array.isArray(value) ? value : [value];
}

// node_modules/.pnpm/drizzle-orm@0.45.2_mysql2@3.22.3_@types+node@25.3.5_/node_modules/drizzle-orm/mysql-core/query-builders/delete.js
var MySqlDeleteBase = class extends QueryPromise {
  constructor(table, session, dialect, withList) {
    super();
    this.table = table;
    this.session = session;
    this.dialect = dialect;
    this.config = { table, withList };
  }
  static [entityKind] = "MySqlDelete";
  config;
  /**
   * Adds a `where` clause to the query.
   *
   * Calling this method will delete only those rows that fulfill a specified condition.
   *
   * See docs: {@link https://orm.drizzle.team/docs/delete}
   *
   * @param where the `where` clause.
   *
   * @example
   * You can use conditional operators and `sql function` to filter the rows to be deleted.
   *
   * ```ts
   * // Delete all cars with green color
   * db.delete(cars).where(eq(cars.color, 'green'));
   * // or
   * db.delete(cars).where(sql`${cars.color} = 'green'`)
   * ```
   *
   * You can logically combine conditional operators with `and()` and `or()` operators:
   *
   * ```ts
   * // Delete all BMW cars with a green color
   * db.delete(cars).where(and(eq(cars.color, 'green'), eq(cars.brand, 'BMW')));
   *
   * // Delete all cars with the green or blue color
   * db.delete(cars).where(or(eq(cars.color, 'green'), eq(cars.color, 'blue')));
   * ```
   */
  where(where) {
    this.config.where = where;
    return this;
  }
  orderBy(...columns) {
    if (typeof columns[0] === "function") {
      const orderBy = columns[0](
        new Proxy(
          this.config.table[Table.Symbol.Columns],
          new SelectionProxyHandler({ sqlAliasedBehavior: "alias", sqlBehavior: "sql" })
        )
      );
      const orderByArray = Array.isArray(orderBy) ? orderBy : [orderBy];
      this.config.orderBy = orderByArray;
    } else {
      const orderByArray = columns;
      this.config.orderBy = orderByArray;
    }
    return this;
  }
  limit(limit) {
    this.config.limit = limit;
    return this;
  }
  /** @internal */
  getSQL() {
    return this.dialect.buildDeleteQuery(this.config);
  }
  toSQL() {
    const { typings: _typings, ...rest } = this.dialect.sqlToQuery(this.getSQL());
    return rest;
  }
  prepare() {
    return this.session.prepareQuery(
      this.dialect.sqlToQuery(this.getSQL()),
      this.config.returning,
      void 0,
      void 0,
      void 0,
      {
        type: "delete",
        tables: extractUsedTable(this.config.table)
      }
    );
  }
  execute = (placeholderValues) => {
    return this.prepare().execute(placeholderValues);
  };
  createIterator = () => {
    const self = this;
    return async function* (placeholderValues) {
      yield* self.prepare().iterator(placeholderValues);
    };
  };
  iterator = this.createIterator();
  $dynamic() {
    return this;
  }
};

// node_modules/.pnpm/drizzle-orm@0.45.2_mysql2@3.22.3_@types+node@25.3.5_/node_modules/drizzle-orm/casing.js
function toSnakeCase(input) {
  const words = input.replace(/['\u2019]/g, "").match(/[\da-z]+|[A-Z]+(?![a-z])|[A-Z][\da-z]+/g) ?? [];
  return words.map((word) => word.toLowerCase()).join("_");
}
function toCamelCase(input) {
  const words = input.replace(/['\u2019]/g, "").match(/[\da-z]+|[A-Z]+(?![a-z])|[A-Z][\da-z]+/g) ?? [];
  return words.reduce((acc, word, i) => {
    const formattedWord = i === 0 ? word.toLowerCase() : `${word[0].toUpperCase()}${word.slice(1)}`;
    return acc + formattedWord;
  }, "");
}
function noopCase(input) {
  return input;
}
var CasingCache = class {
  static [entityKind] = "CasingCache";
  /** @internal */
  cache = {};
  cachedTables = {};
  convert;
  constructor(casing) {
    this.convert = casing === "snake_case" ? toSnakeCase : casing === "camelCase" ? toCamelCase : noopCase;
  }
  getColumnCasing(column) {
    if (!column.keyAsName) return column.name;
    const schema = column.table[Table.Symbol.Schema] ?? "public";
    const tableName = column.table[Table.Symbol.OriginalName];
    const key = `${schema}.${tableName}.${column.name}`;
    if (!this.cache[key]) {
      this.cacheTable(column.table);
    }
    return this.cache[key];
  }
  cacheTable(table) {
    const schema = table[Table.Symbol.Schema] ?? "public";
    const tableName = table[Table.Symbol.OriginalName];
    const tableKey = `${schema}.${tableName}`;
    if (!this.cachedTables[tableKey]) {
      for (const column of Object.values(table[Table.Symbol.Columns])) {
        const columnKey = `${tableKey}.${column.name}`;
        this.cache[columnKey] = this.convert(column.name);
      }
      this.cachedTables[tableKey] = true;
    }
  }
  clearCache() {
    this.cache = {};
    this.cachedTables = {};
  }
};

// node_modules/.pnpm/drizzle-orm@0.45.2_mysql2@3.22.3_@types+node@25.3.5_/node_modules/drizzle-orm/mysql-core/view-base.js
var MySqlViewBase = class extends View {
  static [entityKind] = "MySqlViewBase";
};

// node_modules/.pnpm/drizzle-orm@0.45.2_mysql2@3.22.3_@types+node@25.3.5_/node_modules/drizzle-orm/mysql-core/dialect.js
var MySqlDialect = class {
  static [entityKind] = "MySqlDialect";
  /** @internal */
  casing;
  constructor(config) {
    this.casing = new CasingCache(config?.casing);
  }
  async migrate(migrations, session, config) {
    const migrationsTable = config.migrationsTable ?? "__drizzle_migrations";
    const migrationTableCreate = sql`
			create table if not exists ${sql.identifier(migrationsTable)} (
				id serial primary key,
				hash text not null,
				created_at bigint
			)
		`;
    await session.execute(migrationTableCreate);
    const dbMigrations = await session.all(
      sql`select id, hash, created_at from ${sql.identifier(migrationsTable)} order by created_at desc limit 1`
    );
    const lastDbMigration = dbMigrations[0];
    await session.transaction(async (tx) => {
      for (const migration of migrations) {
        if (!lastDbMigration || Number(lastDbMigration.created_at) < migration.folderMillis) {
          for (const stmt of migration.sql) {
            await tx.execute(sql.raw(stmt));
          }
          await tx.execute(
            sql`insert into ${sql.identifier(
              migrationsTable
            )} (\`hash\`, \`created_at\`) values(${migration.hash}, ${migration.folderMillis})`
          );
        }
      }
    });
  }
  escapeName(name) {
    return `\`${name.replace(/`/g, "``")}\``;
  }
  escapeParam(_num) {
    return `?`;
  }
  escapeString(str) {
    return `'${str.replace(/'/g, "''")}'`;
  }
  buildWithCTE(queries) {
    if (!queries?.length) return void 0;
    const withSqlChunks = [sql`with `];
    for (const [i, w] of queries.entries()) {
      withSqlChunks.push(sql`${sql.identifier(w._.alias)} as (${w._.sql})`);
      if (i < queries.length - 1) {
        withSqlChunks.push(sql`, `);
      }
    }
    withSqlChunks.push(sql` `);
    return sql.join(withSqlChunks);
  }
  buildDeleteQuery({
    table,
    where,
    returning,
    withList,
    limit,
    orderBy
  }) {
    const withSql = this.buildWithCTE(withList);
    const returningSql = returning ? sql` returning ${this.buildSelection(returning, { isSingleTable: true })}` : void 0;
    const whereSql = where ? sql` where ${where}` : void 0;
    const orderBySql = this.buildOrderBy(orderBy);
    const limitSql = this.buildLimit(limit);
    return sql`${withSql}delete from ${table}${whereSql}${orderBySql}${limitSql}${returningSql}`;
  }
  buildUpdateSet(table, set) {
    const tableColumns = table[Table.Symbol.Columns];
    const columnNames = Object.keys(tableColumns).filter(
      (colName) => set[colName] !== void 0 || tableColumns[colName]?.onUpdateFn !== void 0
    );
    const setSize = columnNames.length;
    return sql.join(
      columnNames.flatMap((colName, i) => {
        const col = tableColumns[colName];
        const onUpdateFnResult = col.onUpdateFn?.();
        const value = set[colName] ?? (is(onUpdateFnResult, SQL) ? onUpdateFnResult : sql.param(onUpdateFnResult, col));
        const res = sql`${sql.identifier(this.casing.getColumnCasing(col))} = ${value}`;
        if (i < setSize - 1) {
          return [res, sql.raw(", ")];
        }
        return [res];
      })
    );
  }
  buildUpdateQuery({
    table,
    set,
    where,
    returning,
    withList,
    limit,
    orderBy
  }) {
    const withSql = this.buildWithCTE(withList);
    const setSql = this.buildUpdateSet(table, set);
    const returningSql = returning ? sql` returning ${this.buildSelection(returning, { isSingleTable: true })}` : void 0;
    const whereSql = where ? sql` where ${where}` : void 0;
    const orderBySql = this.buildOrderBy(orderBy);
    const limitSql = this.buildLimit(limit);
    return sql`${withSql}update ${table} set ${setSql}${whereSql}${orderBySql}${limitSql}${returningSql}`;
  }
  /**
   * Builds selection SQL with provided fields/expressions
   *
   * Examples:
   *
   * `select <selection> from`
   *
   * `insert ... returning <selection>`
   *
   * If `isSingleTable` is true, then columns won't be prefixed with table name
   */
  buildSelection(fields, { isSingleTable = false } = {}) {
    const columnsLen = fields.length;
    const chunks = fields.flatMap(({ field }, i) => {
      const chunk = [];
      if (is(field, SQL.Aliased) && field.isSelectionField) {
        chunk.push(sql.identifier(field.fieldAlias));
      } else if (is(field, SQL.Aliased) || is(field, SQL)) {
        const query = is(field, SQL.Aliased) ? field.sql : field;
        if (isSingleTable) {
          chunk.push(
            new SQL(
              query.queryChunks.map((c) => {
                if (is(c, MySqlColumn)) {
                  return sql.identifier(this.casing.getColumnCasing(c));
                }
                return c;
              })
            )
          );
        } else {
          chunk.push(query);
        }
        if (is(field, SQL.Aliased)) {
          chunk.push(sql` as ${sql.identifier(field.fieldAlias)}`);
        }
      } else if (is(field, Column)) {
        if (isSingleTable) {
          chunk.push(sql.identifier(this.casing.getColumnCasing(field)));
        } else {
          chunk.push(field);
        }
      } else if (is(field, Subquery)) {
        const entries = Object.entries(field._.selectedFields);
        if (entries.length === 1) {
          const entry = entries[0][1];
          const fieldDecoder = is(entry, SQL) ? entry.decoder : is(entry, Column) ? { mapFromDriverValue: (v) => entry.mapFromDriverValue(v) } : entry.sql.decoder;
          if (fieldDecoder) {
            field._.sql.decoder = fieldDecoder;
          }
        }
        chunk.push(field);
      }
      if (i < columnsLen - 1) {
        chunk.push(sql`, `);
      }
      return chunk;
    });
    return sql.join(chunks);
  }
  buildLimit(limit) {
    return typeof limit === "object" || typeof limit === "number" && limit >= 0 ? sql` limit ${limit}` : void 0;
  }
  buildOrderBy(orderBy) {
    return orderBy && orderBy.length > 0 ? sql` order by ${sql.join(orderBy, sql`, `)}` : void 0;
  }
  buildIndex({
    indexes,
    indexFor
  }) {
    return indexes && indexes.length > 0 ? sql` ${sql.raw(indexFor)} INDEX (${sql.raw(indexes.join(`, `))})` : void 0;
  }
  buildSelectQuery({
    withList,
    fields,
    fieldsFlat,
    where,
    having,
    table,
    joins,
    orderBy,
    groupBy,
    limit,
    offset,
    lockingClause,
    distinct,
    setOperators,
    useIndex,
    forceIndex,
    ignoreIndex
  }) {
    const fieldsList = fieldsFlat ?? orderSelectedFields(fields);
    for (const f of fieldsList) {
      if (is(f.field, Column) && getTableName(f.field.table) !== (is(table, Subquery) ? table._.alias : is(table, MySqlViewBase) ? table[ViewBaseConfig].name : is(table, SQL) ? void 0 : getTableName(table)) && !((table2) => joins?.some(
        ({ alias }) => alias === (table2[Table.Symbol.IsAlias] ? getTableName(table2) : table2[Table.Symbol.BaseName])
      ))(f.field.table)) {
        const tableName = getTableName(f.field.table);
        throw new Error(
          `Your "${f.path.join(
            "->"
          )}" field references a column "${tableName}"."${f.field.name}", but the table "${tableName}" is not part of the query! Did you forget to join it?`
        );
      }
    }
    const isSingleTable = !joins || joins.length === 0;
    const withSql = this.buildWithCTE(withList);
    const distinctSql = distinct ? sql` distinct` : void 0;
    const selection = this.buildSelection(fieldsList, { isSingleTable });
    const tableSql = (() => {
      if (is(table, Table) && table[Table.Symbol.IsAlias]) {
        return sql`${sql`${sql.identifier(table[Table.Symbol.Schema] ?? "")}.`.if(table[Table.Symbol.Schema])}${sql.identifier(
          table[Table.Symbol.OriginalName]
        )} ${sql.identifier(table[Table.Symbol.Name])}`;
      }
      return table;
    })();
    const joinsArray = [];
    if (joins) {
      for (const [index, joinMeta] of joins.entries()) {
        if (index === 0) {
          joinsArray.push(sql` `);
        }
        const table2 = joinMeta.table;
        const lateralSql = joinMeta.lateral ? sql` lateral` : void 0;
        const onSql = joinMeta.on ? sql` on ${joinMeta.on}` : void 0;
        if (is(table2, MySqlTable)) {
          const tableName = table2[MySqlTable.Symbol.Name];
          const tableSchema = table2[MySqlTable.Symbol.Schema];
          const origTableName = table2[MySqlTable.Symbol.OriginalName];
          const alias = tableName === origTableName ? void 0 : joinMeta.alias;
          const useIndexSql2 = this.buildIndex({
            indexes: joinMeta.useIndex,
            indexFor: "USE"
          });
          const forceIndexSql2 = this.buildIndex({
            indexes: joinMeta.forceIndex,
            indexFor: "FORCE"
          });
          const ignoreIndexSql2 = this.buildIndex({
            indexes: joinMeta.ignoreIndex,
            indexFor: "IGNORE"
          });
          joinsArray.push(
            sql`${sql.raw(joinMeta.joinType)} join${lateralSql} ${tableSchema ? sql`${sql.identifier(tableSchema)}.` : void 0}${sql.identifier(origTableName)}${useIndexSql2}${forceIndexSql2}${ignoreIndexSql2}${alias && sql` ${sql.identifier(alias)}`}${onSql}`
          );
        } else if (is(table2, View)) {
          const viewName = table2[ViewBaseConfig].name;
          const viewSchema = table2[ViewBaseConfig].schema;
          const origViewName = table2[ViewBaseConfig].originalName;
          const alias = viewName === origViewName ? void 0 : joinMeta.alias;
          joinsArray.push(
            sql`${sql.raw(joinMeta.joinType)} join${lateralSql} ${viewSchema ? sql`${sql.identifier(viewSchema)}.` : void 0}${sql.identifier(origViewName)}${alias && sql` ${sql.identifier(alias)}`}${onSql}`
          );
        } else {
          joinsArray.push(
            sql`${sql.raw(joinMeta.joinType)} join${lateralSql} ${table2}${onSql}`
          );
        }
        if (index < joins.length - 1) {
          joinsArray.push(sql` `);
        }
      }
    }
    const joinsSql = sql.join(joinsArray);
    const whereSql = where ? sql` where ${where}` : void 0;
    const havingSql = having ? sql` having ${having}` : void 0;
    const orderBySql = this.buildOrderBy(orderBy);
    const groupBySql = groupBy && groupBy.length > 0 ? sql` group by ${sql.join(groupBy, sql`, `)}` : void 0;
    const limitSql = this.buildLimit(limit);
    const offsetSql = offset ? sql` offset ${offset}` : void 0;
    const useIndexSql = this.buildIndex({ indexes: useIndex, indexFor: "USE" });
    const forceIndexSql = this.buildIndex({
      indexes: forceIndex,
      indexFor: "FORCE"
    });
    const ignoreIndexSql = this.buildIndex({
      indexes: ignoreIndex,
      indexFor: "IGNORE"
    });
    let lockingClausesSql;
    if (lockingClause) {
      const { config, strength } = lockingClause;
      lockingClausesSql = sql` for ${sql.raw(strength)}`;
      if (config.noWait) {
        lockingClausesSql.append(sql` nowait`);
      } else if (config.skipLocked) {
        lockingClausesSql.append(sql` skip locked`);
      }
    }
    const finalQuery = sql`${withSql}select${distinctSql} ${selection} from ${tableSql}${useIndexSql}${forceIndexSql}${ignoreIndexSql}${joinsSql}${whereSql}${groupBySql}${havingSql}${orderBySql}${limitSql}${offsetSql}${lockingClausesSql}`;
    if (setOperators.length > 0) {
      return this.buildSetOperations(finalQuery, setOperators);
    }
    return finalQuery;
  }
  buildSetOperations(leftSelect, setOperators) {
    const [setOperator, ...rest] = setOperators;
    if (!setOperator) {
      throw new Error("Cannot pass undefined values to any set operator");
    }
    if (rest.length === 0) {
      return this.buildSetOperationQuery({ leftSelect, setOperator });
    }
    return this.buildSetOperations(
      this.buildSetOperationQuery({ leftSelect, setOperator }),
      rest
    );
  }
  buildSetOperationQuery({
    leftSelect,
    setOperator: { type, isAll, rightSelect, limit, orderBy, offset }
  }) {
    const leftChunk = sql`(${leftSelect.getSQL()}) `;
    const rightChunk = sql`(${rightSelect.getSQL()})`;
    let orderBySql;
    if (orderBy && orderBy.length > 0) {
      const orderByValues = [];
      for (const orderByUnit of orderBy) {
        if (is(orderByUnit, MySqlColumn)) {
          orderByValues.push(
            sql.identifier(this.casing.getColumnCasing(orderByUnit))
          );
        } else if (is(orderByUnit, SQL)) {
          for (let i = 0; i < orderByUnit.queryChunks.length; i++) {
            const chunk = orderByUnit.queryChunks[i];
            if (is(chunk, MySqlColumn)) {
              orderByUnit.queryChunks[i] = sql.identifier(
                this.casing.getColumnCasing(chunk)
              );
            }
          }
          orderByValues.push(sql`${orderByUnit}`);
        } else {
          orderByValues.push(sql`${orderByUnit}`);
        }
      }
      orderBySql = sql` order by ${sql.join(orderByValues, sql`, `)} `;
    }
    const limitSql = typeof limit === "object" || typeof limit === "number" && limit >= 0 ? sql` limit ${limit}` : void 0;
    const operatorChunk = sql.raw(`${type} ${isAll ? "all " : ""}`);
    const offsetSql = offset ? sql` offset ${offset}` : void 0;
    return sql`${leftChunk}${operatorChunk}${rightChunk}${orderBySql}${limitSql}${offsetSql}`;
  }
  buildInsertQuery({
    table,
    values: valuesOrSelect,
    ignore,
    onConflict,
    select
  }) {
    const valuesSqlList = [];
    const columns = table[Table.Symbol.Columns];
    const colEntries = Object.entries(columns).filter(
      ([_, col]) => !col.shouldDisableInsert()
    );
    const insertOrder = colEntries.map(([, column]) => sql.identifier(this.casing.getColumnCasing(column)));
    const generatedIdsResponse = [];
    if (select) {
      const select2 = valuesOrSelect;
      if (is(select2, SQL)) {
        valuesSqlList.push(select2);
      } else {
        valuesSqlList.push(select2.getSQL());
      }
    } else {
      const values = valuesOrSelect;
      valuesSqlList.push(sql.raw("values "));
      for (const [valueIndex, value] of values.entries()) {
        const generatedIds = {};
        const valueList = [];
        for (const [fieldName, col] of colEntries) {
          const colValue = value[fieldName];
          if (colValue === void 0 || is(colValue, Param) && colValue.value === void 0) {
            if (col.defaultFn !== void 0) {
              const defaultFnResult = col.defaultFn();
              generatedIds[fieldName] = defaultFnResult;
              const defaultValue = is(defaultFnResult, SQL) ? defaultFnResult : sql.param(defaultFnResult, col);
              valueList.push(defaultValue);
            } else if (!col.default && col.onUpdateFn !== void 0) {
              const onUpdateFnResult = col.onUpdateFn();
              const newValue = is(onUpdateFnResult, SQL) ? onUpdateFnResult : sql.param(onUpdateFnResult, col);
              valueList.push(newValue);
            } else {
              valueList.push(sql`default`);
            }
          } else {
            if (col.defaultFn && is(colValue, Param)) {
              generatedIds[fieldName] = colValue.value;
            }
            valueList.push(colValue);
          }
        }
        generatedIdsResponse.push(generatedIds);
        valuesSqlList.push(valueList);
        if (valueIndex < values.length - 1) {
          valuesSqlList.push(sql`, `);
        }
      }
    }
    const valuesSql = sql.join(valuesSqlList);
    const ignoreSql = ignore ? sql` ignore` : void 0;
    const onConflictSql = onConflict ? sql` on duplicate key ${onConflict}` : void 0;
    return {
      sql: sql`insert${ignoreSql} into ${table} ${insertOrder} ${valuesSql}${onConflictSql}`,
      generatedIds: generatedIdsResponse
    };
  }
  sqlToQuery(sql2, invokeSource) {
    return sql2.toQuery({
      casing: this.casing,
      escapeName: this.escapeName,
      escapeParam: this.escapeParam,
      escapeString: this.escapeString,
      invokeSource
    });
  }
  buildRelationalQuery({
    fullSchema,
    schema,
    tableNamesMap,
    table,
    tableConfig,
    queryConfig: config,
    tableAlias,
    nestedQueryRelation,
    joinOn
  }) {
    let selection = [];
    let limit, offset, orderBy, where;
    const joins = [];
    if (config === true) {
      const selectionEntries = Object.entries(tableConfig.columns);
      selection = selectionEntries.map(([key, value]) => ({
        dbKey: value.name,
        tsKey: key,
        field: aliasedTableColumn(value, tableAlias),
        relationTableTsKey: void 0,
        isJson: false,
        selection: []
      }));
    } else {
      const aliasedColumns = Object.fromEntries(
        Object.entries(tableConfig.columns).map(([key, value]) => [
          key,
          aliasedTableColumn(value, tableAlias)
        ])
      );
      if (config.where) {
        const whereSql = typeof config.where === "function" ? config.where(aliasedColumns, getOperators()) : config.where;
        where = whereSql && mapColumnsInSQLToAlias(whereSql, tableAlias);
      }
      const fieldsSelection = [];
      let selectedColumns = [];
      if (config.columns) {
        let isIncludeMode = false;
        for (const [field, value] of Object.entries(config.columns)) {
          if (value === void 0) {
            continue;
          }
          if (field in tableConfig.columns) {
            if (!isIncludeMode && value === true) {
              isIncludeMode = true;
            }
            selectedColumns.push(field);
          }
        }
        if (selectedColumns.length > 0) {
          selectedColumns = isIncludeMode ? selectedColumns.filter((c) => config.columns?.[c] === true) : Object.keys(tableConfig.columns).filter(
            (key) => !selectedColumns.includes(key)
          );
        }
      } else {
        selectedColumns = Object.keys(tableConfig.columns);
      }
      for (const field of selectedColumns) {
        const column = tableConfig.columns[field];
        fieldsSelection.push({ tsKey: field, value: column });
      }
      let selectedRelations = [];
      if (config.with) {
        selectedRelations = Object.entries(config.with).filter(
          (entry) => !!entry[1]
        ).map(([tsKey, queryConfig]) => ({
          tsKey,
          queryConfig,
          relation: tableConfig.relations[tsKey]
        }));
      }
      let extras;
      if (config.extras) {
        extras = typeof config.extras === "function" ? config.extras(aliasedColumns, { sql }) : config.extras;
        for (const [tsKey, value] of Object.entries(extras)) {
          fieldsSelection.push({
            tsKey,
            value: mapColumnsInAliasedSQLToAlias(value, tableAlias)
          });
        }
      }
      for (const { tsKey, value } of fieldsSelection) {
        selection.push({
          dbKey: is(value, SQL.Aliased) ? value.fieldAlias : tableConfig.columns[tsKey].name,
          tsKey,
          field: is(value, Column) ? aliasedTableColumn(value, tableAlias) : value,
          relationTableTsKey: void 0,
          isJson: false,
          selection: []
        });
      }
      let orderByOrig = typeof config.orderBy === "function" ? config.orderBy(aliasedColumns, getOrderByOperators()) : config.orderBy ?? [];
      if (!Array.isArray(orderByOrig)) {
        orderByOrig = [orderByOrig];
      }
      orderBy = orderByOrig.map((orderByValue) => {
        if (is(orderByValue, Column)) {
          return aliasedTableColumn(orderByValue, tableAlias);
        }
        return mapColumnsInSQLToAlias(orderByValue, tableAlias);
      });
      limit = config.limit;
      offset = config.offset;
      for (const {
        tsKey: selectedRelationTsKey,
        queryConfig: selectedRelationConfigValue,
        relation
      } of selectedRelations) {
        const normalizedRelation = normalizeRelation(
          schema,
          tableNamesMap,
          relation
        );
        const relationTableName = getTableUniqueName(relation.referencedTable);
        const relationTableTsName = tableNamesMap[relationTableName];
        const relationTableAlias = `${tableAlias}_${selectedRelationTsKey}`;
        const joinOn2 = and(
          ...normalizedRelation.fields.map(
            (field2, i) => eq(
              aliasedTableColumn(
                normalizedRelation.references[i],
                relationTableAlias
              ),
              aliasedTableColumn(field2, tableAlias)
            )
          )
        );
        const builtRelation = this.buildRelationalQuery({
          fullSchema,
          schema,
          tableNamesMap,
          table: fullSchema[relationTableTsName],
          tableConfig: schema[relationTableTsName],
          queryConfig: is(relation, One) ? selectedRelationConfigValue === true ? { limit: 1 } : { ...selectedRelationConfigValue, limit: 1 } : selectedRelationConfigValue,
          tableAlias: relationTableAlias,
          joinOn: joinOn2,
          nestedQueryRelation: relation
        });
        const field = sql`${sql.identifier(relationTableAlias)}.${sql.identifier("data")}`.as(
          selectedRelationTsKey
        );
        joins.push({
          on: sql`true`,
          table: new Subquery(builtRelation.sql, {}, relationTableAlias),
          alias: relationTableAlias,
          joinType: "left",
          lateral: true
        });
        selection.push({
          dbKey: selectedRelationTsKey,
          tsKey: selectedRelationTsKey,
          field,
          relationTableTsKey: relationTableTsName,
          isJson: true,
          selection: builtRelation.selection
        });
      }
    }
    if (selection.length === 0) {
      throw new DrizzleError({
        message: `No fields selected for table "${tableConfig.tsName}" ("${tableAlias}")`
      });
    }
    let result;
    where = and(joinOn, where);
    if (nestedQueryRelation) {
      let field = sql`json_array(${sql.join(
        selection.map(
          ({ field: field2, tsKey, isJson }) => isJson ? sql`${sql.identifier(`${tableAlias}_${tsKey}`)}.${sql.identifier("data")}` : is(field2, SQL.Aliased) ? field2.sql : field2
        ),
        sql`, `
      )})`;
      if (is(nestedQueryRelation, Many)) {
        field = sql`coalesce(json_arrayagg(${field}), json_array())`;
      }
      const nestedSelection = [
        {
          dbKey: "data",
          tsKey: "data",
          field: field.as("data"),
          isJson: true,
          relationTableTsKey: tableConfig.tsName,
          selection
        }
      ];
      const needsSubquery = limit !== void 0 || offset !== void 0 || (orderBy?.length ?? 0) > 0;
      if (needsSubquery) {
        result = this.buildSelectQuery({
          table: aliasedTable(table, tableAlias),
          fields: {},
          fieldsFlat: [
            {
              path: [],
              field: sql.raw("*")
            },
            ...(orderBy?.length ?? 0) > 0 ? [
              {
                path: [],
                field: sql`row_number() over (order by ${sql.join(orderBy, sql`, `)})`
              }
            ] : []
          ],
          where,
          limit,
          offset,
          setOperators: []
        });
        where = void 0;
        limit = void 0;
        offset = void 0;
        orderBy = void 0;
      } else {
        result = aliasedTable(table, tableAlias);
      }
      result = this.buildSelectQuery({
        table: is(result, MySqlTable) ? result : new Subquery(result, {}, tableAlias),
        fields: {},
        fieldsFlat: nestedSelection.map(({ field: field2 }) => ({
          path: [],
          field: is(field2, Column) ? aliasedTableColumn(field2, tableAlias) : field2
        })),
        joins,
        where,
        limit,
        offset,
        orderBy,
        setOperators: []
      });
    } else {
      result = this.buildSelectQuery({
        table: aliasedTable(table, tableAlias),
        fields: {},
        fieldsFlat: selection.map(({ field }) => ({
          path: [],
          field: is(field, Column) ? aliasedTableColumn(field, tableAlias) : field
        })),
        joins,
        where,
        limit,
        offset,
        orderBy,
        setOperators: []
      });
    }
    return {
      tableTsKey: tableConfig.tsName,
      sql: result,
      selection
    };
  }
  buildRelationalQueryWithoutLateralSubqueries({
    fullSchema,
    schema,
    tableNamesMap,
    table,
    tableConfig,
    queryConfig: config,
    tableAlias,
    nestedQueryRelation,
    joinOn
  }) {
    let selection = [];
    let limit, offset, orderBy = [], where;
    if (config === true) {
      const selectionEntries = Object.entries(tableConfig.columns);
      selection = selectionEntries.map(([key, value]) => ({
        dbKey: value.name,
        tsKey: key,
        field: aliasedTableColumn(value, tableAlias),
        relationTableTsKey: void 0,
        isJson: false,
        selection: []
      }));
    } else {
      const aliasedColumns = Object.fromEntries(
        Object.entries(tableConfig.columns).map(([key, value]) => [
          key,
          aliasedTableColumn(value, tableAlias)
        ])
      );
      if (config.where) {
        const whereSql = typeof config.where === "function" ? config.where(aliasedColumns, getOperators()) : config.where;
        where = whereSql && mapColumnsInSQLToAlias(whereSql, tableAlias);
      }
      const fieldsSelection = [];
      let selectedColumns = [];
      if (config.columns) {
        let isIncludeMode = false;
        for (const [field, value] of Object.entries(config.columns)) {
          if (value === void 0) {
            continue;
          }
          if (field in tableConfig.columns) {
            if (!isIncludeMode && value === true) {
              isIncludeMode = true;
            }
            selectedColumns.push(field);
          }
        }
        if (selectedColumns.length > 0) {
          selectedColumns = isIncludeMode ? selectedColumns.filter((c) => config.columns?.[c] === true) : Object.keys(tableConfig.columns).filter(
            (key) => !selectedColumns.includes(key)
          );
        }
      } else {
        selectedColumns = Object.keys(tableConfig.columns);
      }
      for (const field of selectedColumns) {
        const column = tableConfig.columns[field];
        fieldsSelection.push({ tsKey: field, value: column });
      }
      let selectedRelations = [];
      if (config.with) {
        selectedRelations = Object.entries(config.with).filter(
          (entry) => !!entry[1]
        ).map(([tsKey, queryConfig]) => ({
          tsKey,
          queryConfig,
          relation: tableConfig.relations[tsKey]
        }));
      }
      let extras;
      if (config.extras) {
        extras = typeof config.extras === "function" ? config.extras(aliasedColumns, { sql }) : config.extras;
        for (const [tsKey, value] of Object.entries(extras)) {
          fieldsSelection.push({
            tsKey,
            value: mapColumnsInAliasedSQLToAlias(value, tableAlias)
          });
        }
      }
      for (const { tsKey, value } of fieldsSelection) {
        selection.push({
          dbKey: is(value, SQL.Aliased) ? value.fieldAlias : tableConfig.columns[tsKey].name,
          tsKey,
          field: is(value, Column) ? aliasedTableColumn(value, tableAlias) : value,
          relationTableTsKey: void 0,
          isJson: false,
          selection: []
        });
      }
      let orderByOrig = typeof config.orderBy === "function" ? config.orderBy(aliasedColumns, getOrderByOperators()) : config.orderBy ?? [];
      if (!Array.isArray(orderByOrig)) {
        orderByOrig = [orderByOrig];
      }
      orderBy = orderByOrig.map((orderByValue) => {
        if (is(orderByValue, Column)) {
          return aliasedTableColumn(orderByValue, tableAlias);
        }
        return mapColumnsInSQLToAlias(orderByValue, tableAlias);
      });
      limit = config.limit;
      offset = config.offset;
      for (const {
        tsKey: selectedRelationTsKey,
        queryConfig: selectedRelationConfigValue,
        relation
      } of selectedRelations) {
        const normalizedRelation = normalizeRelation(
          schema,
          tableNamesMap,
          relation
        );
        const relationTableName = getTableUniqueName(relation.referencedTable);
        const relationTableTsName = tableNamesMap[relationTableName];
        const relationTableAlias = `${tableAlias}_${selectedRelationTsKey}`;
        const joinOn2 = and(
          ...normalizedRelation.fields.map(
            (field2, i) => eq(
              aliasedTableColumn(
                normalizedRelation.references[i],
                relationTableAlias
              ),
              aliasedTableColumn(field2, tableAlias)
            )
          )
        );
        const builtRelation = this.buildRelationalQueryWithoutLateralSubqueries(
          {
            fullSchema,
            schema,
            tableNamesMap,
            table: fullSchema[relationTableTsName],
            tableConfig: schema[relationTableTsName],
            queryConfig: is(relation, One) ? selectedRelationConfigValue === true ? { limit: 1 } : { ...selectedRelationConfigValue, limit: 1 } : selectedRelationConfigValue,
            tableAlias: relationTableAlias,
            joinOn: joinOn2,
            nestedQueryRelation: relation
          }
        );
        let fieldSql = sql`(${builtRelation.sql})`;
        if (is(relation, Many)) {
          fieldSql = sql`coalesce(${fieldSql}, json_array())`;
        }
        const field = fieldSql.as(selectedRelationTsKey);
        selection.push({
          dbKey: selectedRelationTsKey,
          tsKey: selectedRelationTsKey,
          field,
          relationTableTsKey: relationTableTsName,
          isJson: true,
          selection: builtRelation.selection
        });
      }
    }
    if (selection.length === 0) {
      throw new DrizzleError({
        message: `No fields selected for table "${tableConfig.tsName}" ("${tableAlias}"). You need to have at least one item in "columns", "with" or "extras". If you need to select all columns, omit the "columns" key or set it to undefined.`
      });
    }
    let result;
    where = and(joinOn, where);
    if (nestedQueryRelation) {
      let field = sql`json_array(${sql.join(
        selection.map(
          ({ field: field2 }) => is(field2, MySqlColumn) ? sql.identifier(this.casing.getColumnCasing(field2)) : is(field2, SQL.Aliased) ? field2.sql : field2
        ),
        sql`, `
      )})`;
      if (is(nestedQueryRelation, Many)) {
        field = sql`json_arrayagg(${field})`;
      }
      const nestedSelection = [
        {
          dbKey: "data",
          tsKey: "data",
          field,
          isJson: true,
          relationTableTsKey: tableConfig.tsName,
          selection
        }
      ];
      const needsSubquery = limit !== void 0 || offset !== void 0 || orderBy.length > 0;
      if (needsSubquery) {
        result = this.buildSelectQuery({
          table: aliasedTable(table, tableAlias),
          fields: {},
          fieldsFlat: [
            {
              path: [],
              field: sql.raw("*")
            },
            ...orderBy.length > 0 ? [
              {
                path: [],
                field: sql`row_number() over (order by ${sql.join(orderBy, sql`, `)})`
              }
            ] : []
          ],
          where,
          limit,
          offset,
          setOperators: []
        });
        where = void 0;
        limit = void 0;
        offset = void 0;
        orderBy = void 0;
      } else {
        result = aliasedTable(table, tableAlias);
      }
      result = this.buildSelectQuery({
        table: is(result, MySqlTable) ? result : new Subquery(result, {}, tableAlias),
        fields: {},
        fieldsFlat: nestedSelection.map(({ field: field2 }) => ({
          path: [],
          field: is(field2, Column) ? aliasedTableColumn(field2, tableAlias) : field2
        })),
        where,
        limit,
        offset,
        orderBy,
        setOperators: []
      });
    } else {
      result = this.buildSelectQuery({
        table: aliasedTable(table, tableAlias),
        fields: {},
        fieldsFlat: selection.map(({ field }) => ({
          path: [],
          field: is(field, Column) ? aliasedTableColumn(field, tableAlias) : field
        })),
        where,
        limit,
        offset,
        orderBy,
        setOperators: []
      });
    }
    return {
      tableTsKey: tableConfig.tsName,
      sql: result,
      selection
    };
  }
};

// node_modules/.pnpm/drizzle-orm@0.45.2_mysql2@3.22.3_@types+node@25.3.5_/node_modules/drizzle-orm/query-builders/query-builder.js
var TypedQueryBuilder = class {
  static [entityKind] = "TypedQueryBuilder";
  /** @internal */
  getSelectedFields() {
    return this._.selectedFields;
  }
};

// node_modules/.pnpm/drizzle-orm@0.45.2_mysql2@3.22.3_@types+node@25.3.5_/node_modules/drizzle-orm/mysql-core/query-builders/select.js
var MySqlSelectBuilder = class {
  static [entityKind] = "MySqlSelectBuilder";
  fields;
  session;
  dialect;
  withList = [];
  distinct;
  constructor(config) {
    this.fields = config.fields;
    this.session = config.session;
    this.dialect = config.dialect;
    if (config.withList) {
      this.withList = config.withList;
    }
    this.distinct = config.distinct;
  }
  from(source, onIndex) {
    const isPartialSelect = !!this.fields;
    let fields;
    if (this.fields) {
      fields = this.fields;
    } else if (is(source, Subquery)) {
      fields = Object.fromEntries(
        Object.keys(source._.selectedFields).map((key) => [key, source[key]])
      );
    } else if (is(source, MySqlViewBase)) {
      fields = source[ViewBaseConfig].selectedFields;
    } else if (is(source, SQL)) {
      fields = {};
    } else {
      fields = getTableColumns(source);
    }
    let useIndex = [];
    let forceIndex = [];
    let ignoreIndex = [];
    if (is(source, MySqlTable) && onIndex && typeof onIndex !== "string") {
      if (onIndex.useIndex) {
        useIndex = convertIndexToString(toArray(onIndex.useIndex));
      }
      if (onIndex.forceIndex) {
        forceIndex = convertIndexToString(toArray(onIndex.forceIndex));
      }
      if (onIndex.ignoreIndex) {
        ignoreIndex = convertIndexToString(toArray(onIndex.ignoreIndex));
      }
    }
    return new MySqlSelectBase(
      {
        table: source,
        fields,
        isPartialSelect,
        session: this.session,
        dialect: this.dialect,
        withList: this.withList,
        distinct: this.distinct,
        useIndex,
        forceIndex,
        ignoreIndex
      }
    );
  }
};
var MySqlSelectQueryBuilderBase = class extends TypedQueryBuilder {
  static [entityKind] = "MySqlSelectQueryBuilder";
  _;
  config;
  joinsNotNullableMap;
  tableName;
  isPartialSelect;
  /** @internal */
  session;
  dialect;
  cacheConfig = void 0;
  usedTables = /* @__PURE__ */ new Set();
  constructor({ table, fields, isPartialSelect, session, dialect, withList, distinct, useIndex, forceIndex, ignoreIndex }) {
    super();
    this.config = {
      withList,
      table,
      fields: { ...fields },
      distinct,
      setOperators: [],
      useIndex,
      forceIndex,
      ignoreIndex
    };
    this.isPartialSelect = isPartialSelect;
    this.session = session;
    this.dialect = dialect;
    this._ = {
      selectedFields: fields,
      config: this.config
    };
    this.tableName = getTableLikeName(table);
    this.joinsNotNullableMap = typeof this.tableName === "string" ? { [this.tableName]: true } : {};
    for (const item of extractUsedTable(table)) this.usedTables.add(item);
  }
  /** @internal */
  getUsedTables() {
    return [...this.usedTables];
  }
  createJoin(joinType, lateral) {
    return (table, a, b) => {
      const isCrossJoin = joinType === "cross";
      let on = isCrossJoin ? void 0 : a;
      const onIndex = isCrossJoin ? a : b;
      const baseTableName = this.tableName;
      const tableName = getTableLikeName(table);
      for (const item of extractUsedTable(table)) this.usedTables.add(item);
      if (typeof tableName === "string" && this.config.joins?.some((join) => join.alias === tableName)) {
        throw new Error(`Alias "${tableName}" is already used in this query`);
      }
      if (!this.isPartialSelect) {
        if (Object.keys(this.joinsNotNullableMap).length === 1 && typeof baseTableName === "string") {
          this.config.fields = {
            [baseTableName]: this.config.fields
          };
        }
        if (typeof tableName === "string" && !is(table, SQL)) {
          const selection = is(table, Subquery) ? table._.selectedFields : is(table, View) ? table[ViewBaseConfig].selectedFields : table[Table.Symbol.Columns];
          this.config.fields[tableName] = selection;
        }
      }
      if (typeof on === "function") {
        on = on(
          new Proxy(
            this.config.fields,
            new SelectionProxyHandler({ sqlAliasedBehavior: "sql", sqlBehavior: "sql" })
          )
        );
      }
      if (!this.config.joins) {
        this.config.joins = [];
      }
      let useIndex = [];
      let forceIndex = [];
      let ignoreIndex = [];
      if (is(table, MySqlTable) && onIndex && typeof onIndex !== "string") {
        if (onIndex.useIndex) {
          useIndex = convertIndexToString(toArray(onIndex.useIndex));
        }
        if (onIndex.forceIndex) {
          forceIndex = convertIndexToString(toArray(onIndex.forceIndex));
        }
        if (onIndex.ignoreIndex) {
          ignoreIndex = convertIndexToString(toArray(onIndex.ignoreIndex));
        }
      }
      this.config.joins.push({ on, table, joinType, alias: tableName, useIndex, forceIndex, ignoreIndex, lateral });
      if (typeof tableName === "string") {
        switch (joinType) {
          case "left": {
            this.joinsNotNullableMap[tableName] = false;
            break;
          }
          case "right": {
            this.joinsNotNullableMap = Object.fromEntries(
              Object.entries(this.joinsNotNullableMap).map(([key]) => [key, false])
            );
            this.joinsNotNullableMap[tableName] = true;
            break;
          }
          case "cross":
          case "inner": {
            this.joinsNotNullableMap[tableName] = true;
            break;
          }
        }
      }
      return this;
    };
  }
  /**
   * Executes a `left join` operation by adding another table to the current query.
   *
   * Calling this method associates each row of the table with the corresponding row from the joined table, if a match is found. If no matching row exists, it sets all columns of the joined table to null.
   *
   * See docs: {@link https://orm.drizzle.team/docs/joins#left-join}
   *
   * @param table the table to join.
   * @param on the `on` clause.
   * @param onIndex index hint.
   *
   * @example
   *
   * ```ts
   * // Select all users and their pets
   * const usersWithPets: { user: User; pets: Pet | null; }[] = await db.select()
   *   .from(users)
   *   .leftJoin(pets, eq(users.id, pets.ownerId))
   *
   * // Select userId and petId
   * const usersIdsAndPetIds: { userId: number; petId: number | null; }[] = await db.select({
   *   userId: users.id,
   *   petId: pets.id,
   * })
   *   .from(users)
   *   .leftJoin(pets, eq(users.id, pets.ownerId))
   *
   * // Select userId and petId with use index hint
   * const usersIdsAndPetIds: { userId: number; petId: number | null; }[] = await db.select({
   *   userId: users.id,
   *   petId: pets.id,
   * })
   *   .from(users)
   *   .leftJoin(pets, eq(users.id, pets.ownerId), {
   *     useIndex: ['pets_owner_id_index']
   * })
   * ```
   */
  leftJoin = this.createJoin("left", false);
  /**
   * Executes a `left join lateral` operation by adding subquery to the current query.
   *
   * A `lateral` join allows the right-hand expression to refer to columns from the left-hand side.
   *
   * Calling this method associates each row of the table with the corresponding row from the joined table, if a match is found. If no matching row exists, it sets all columns of the joined table to null.
   *
   * See docs: {@link https://orm.drizzle.team/docs/joins#left-join-lateral}
   *
   * @param table the subquery to join.
   * @param on the `on` clause.
   */
  leftJoinLateral = this.createJoin("left", true);
  /**
   * Executes a `right join` operation by adding another table to the current query.
   *
   * Calling this method associates each row of the joined table with the corresponding row from the main table, if a match is found. If no matching row exists, it sets all columns of the main table to null.
   *
   * See docs: {@link https://orm.drizzle.team/docs/joins#right-join}
   *
   * @param table the table to join.
   * @param on the `on` clause.
   * @param onIndex index hint.
   *
   * @example
   *
   * ```ts
   * // Select all users and their pets
   * const usersWithPets: { user: User | null; pets: Pet; }[] = await db.select()
   *   .from(users)
   *   .rightJoin(pets, eq(users.id, pets.ownerId))
   *
   * // Select userId and petId
   * const usersIdsAndPetIds: { userId: number | null; petId: number; }[] = await db.select({
   *   userId: users.id,
   *   petId: pets.id,
   * })
   *   .from(users)
   *   .rightJoin(pets, eq(users.id, pets.ownerId))
   *
   * // Select userId and petId with use index hint
   * const usersIdsAndPetIds: { userId: number; petId: number | null; }[] = await db.select({
   *   userId: users.id,
   *   petId: pets.id,
   * })
   *   .from(users)
   *   .leftJoin(pets, eq(users.id, pets.ownerId), {
   *     useIndex: ['pets_owner_id_index']
   * })
   * ```
   */
  rightJoin = this.createJoin("right", false);
  /**
   * Executes an `inner join` operation, creating a new table by combining rows from two tables that have matching values.
   *
   * Calling this method retrieves rows that have corresponding entries in both joined tables. Rows without matching entries in either table are excluded, resulting in a table that includes only matching pairs.
   *
   * See docs: {@link https://orm.drizzle.team/docs/joins#inner-join}
   *
   * @param table the table to join.
   * @param on the `on` clause.
   * @param onIndex index hint.
   *
   * @example
   *
   * ```ts
   * // Select all users and their pets
   * const usersWithPets: { user: User; pets: Pet; }[] = await db.select()
   *   .from(users)
   *   .innerJoin(pets, eq(users.id, pets.ownerId))
   *
   * // Select userId and petId
   * const usersIdsAndPetIds: { userId: number; petId: number; }[] = await db.select({
   *   userId: users.id,
   *   petId: pets.id,
   * })
   *   .from(users)
   *   .innerJoin(pets, eq(users.id, pets.ownerId))
   *
   * // Select userId and petId with use index hint
   * const usersIdsAndPetIds: { userId: number; petId: number | null; }[] = await db.select({
   *   userId: users.id,
   *   petId: pets.id,
   * })
   *   .from(users)
   *   .leftJoin(pets, eq(users.id, pets.ownerId), {
   *     useIndex: ['pets_owner_id_index']
   * })
   * ```
   */
  innerJoin = this.createJoin("inner", false);
  /**
   * Executes an `inner join lateral` operation, creating a new table by combining rows from two queries that have matching values.
   *
   * A `lateral` join allows the right-hand expression to refer to columns from the left-hand side.
   *
   * Calling this method retrieves rows that have corresponding entries in both joined tables. Rows without matching entries in either table are excluded, resulting in a table that includes only matching pairs.
   *
   * See docs: {@link https://orm.drizzle.team/docs/joins#inner-join-lateral}
   *
   * @param table the subquery to join.
   * @param on the `on` clause.
   */
  innerJoinLateral = this.createJoin("inner", true);
  /**
   * Executes a `cross join` operation by combining rows from two tables into a new table.
   *
   * Calling this method retrieves all rows from both main and joined tables, merging all rows from each table.
   *
   * See docs: {@link https://orm.drizzle.team/docs/joins#cross-join}
   *
   * @param table the table to join.
   * @param onIndex index hint.
   *
   * @example
   *
   * ```ts
   * // Select all users, each user with every pet
   * const usersWithPets: { user: User; pets: Pet; }[] = await db.select()
   *   .from(users)
   *   .crossJoin(pets)
   *
   * // Select userId and petId
   * const usersIdsAndPetIds: { userId: number; petId: number; }[] = await db.select({
   *   userId: users.id,
   *   petId: pets.id,
   * })
   *   .from(users)
   *   .crossJoin(pets)
   *
   * // Select userId and petId with use index hint
   * const usersIdsAndPetIds: { userId: number; petId: number; }[] = await db.select({
   *   userId: users.id,
   *   petId: pets.id,
   * })
   *   .from(users)
   *   .crossJoin(pets, {
   *     useIndex: ['pets_owner_id_index']
   * })
   * ```
   */
  crossJoin = this.createJoin("cross", false);
  /**
   * Executes a `cross join lateral` operation by combining rows from two queries into a new table.
   *
   * A `lateral` join allows the right-hand expression to refer to columns from the left-hand side.
   *
   * Calling this method retrieves all rows from both main and joined queries, merging all rows from each query.
   *
   * See docs: {@link https://orm.drizzle.team/docs/joins#cross-join-lateral}
   *
   * @param table the query to join.
   */
  crossJoinLateral = this.createJoin("cross", true);
  createSetOperator(type, isAll) {
    return (rightSelection) => {
      const rightSelect = typeof rightSelection === "function" ? rightSelection(getMySqlSetOperators()) : rightSelection;
      if (!haveSameKeys(this.getSelectedFields(), rightSelect.getSelectedFields())) {
        throw new Error(
          "Set operator error (union / intersect / except): selected fields are not the same or are in a different order"
        );
      }
      this.config.setOperators.push({ type, isAll, rightSelect });
      return this;
    };
  }
  /**
   * Adds `union` set operator to the query.
   *
   * Calling this method will combine the result sets of the `select` statements and remove any duplicate rows that appear across them.
   *
   * See docs: {@link https://orm.drizzle.team/docs/set-operations#union}
   *
   * @example
   *
   * ```ts
   * // Select all unique names from customers and users tables
   * await db.select({ name: users.name })
   *   .from(users)
   *   .union(
   *     db.select({ name: customers.name }).from(customers)
   *   );
   * // or
   * import { union } from 'drizzle-orm/mysql-core'
   *
   * await union(
   *   db.select({ name: users.name }).from(users),
   *   db.select({ name: customers.name }).from(customers)
   * );
   * ```
   */
  union = this.createSetOperator("union", false);
  /**
   * Adds `union all` set operator to the query.
   *
   * Calling this method will combine the result-set of the `select` statements and keep all duplicate rows that appear across them.
   *
   * See docs: {@link https://orm.drizzle.team/docs/set-operations#union-all}
   *
   * @example
   *
   * ```ts
   * // Select all transaction ids from both online and in-store sales
   * await db.select({ transaction: onlineSales.transactionId })
   *   .from(onlineSales)
   *   .unionAll(
   *     db.select({ transaction: inStoreSales.transactionId }).from(inStoreSales)
   *   );
   * // or
   * import { unionAll } from 'drizzle-orm/mysql-core'
   *
   * await unionAll(
   *   db.select({ transaction: onlineSales.transactionId }).from(onlineSales),
   *   db.select({ transaction: inStoreSales.transactionId }).from(inStoreSales)
   * );
   * ```
   */
  unionAll = this.createSetOperator("union", true);
  /**
   * Adds `intersect` set operator to the query.
   *
   * Calling this method will retain only the rows that are present in both result sets and eliminate duplicates.
   *
   * See docs: {@link https://orm.drizzle.team/docs/set-operations#intersect}
   *
   * @example
   *
   * ```ts
   * // Select course names that are offered in both departments A and B
   * await db.select({ courseName: depA.courseName })
   *   .from(depA)
   *   .intersect(
   *     db.select({ courseName: depB.courseName }).from(depB)
   *   );
   * // or
   * import { intersect } from 'drizzle-orm/mysql-core'
   *
   * await intersect(
   *   db.select({ courseName: depA.courseName }).from(depA),
   *   db.select({ courseName: depB.courseName }).from(depB)
   * );
   * ```
   */
  intersect = this.createSetOperator("intersect", false);
  /**
   * Adds `intersect all` set operator to the query.
   *
   * Calling this method will retain only the rows that are present in both result sets including all duplicates.
   *
   * See docs: {@link https://orm.drizzle.team/docs/set-operations#intersect-all}
   *
   * @example
   *
   * ```ts
   * // Select all products and quantities that are ordered by both regular and VIP customers
   * await db.select({
   *   productId: regularCustomerOrders.productId,
   *   quantityOrdered: regularCustomerOrders.quantityOrdered
   * })
   * .from(regularCustomerOrders)
   * .intersectAll(
   *   db.select({
   *     productId: vipCustomerOrders.productId,
   *     quantityOrdered: vipCustomerOrders.quantityOrdered
   *   })
   *   .from(vipCustomerOrders)
   * );
   * // or
   * import { intersectAll } from 'drizzle-orm/mysql-core'
   *
   * await intersectAll(
   *   db.select({
   *     productId: regularCustomerOrders.productId,
   *     quantityOrdered: regularCustomerOrders.quantityOrdered
   *   })
   *   .from(regularCustomerOrders),
   *   db.select({
   *     productId: vipCustomerOrders.productId,
   *     quantityOrdered: vipCustomerOrders.quantityOrdered
   *   })
   *   .from(vipCustomerOrders)
   * );
   * ```
   */
  intersectAll = this.createSetOperator("intersect", true);
  /**
   * Adds `except` set operator to the query.
   *
   * Calling this method will retrieve all unique rows from the left query, except for the rows that are present in the result set of the right query.
   *
   * See docs: {@link https://orm.drizzle.team/docs/set-operations#except}
   *
   * @example
   *
   * ```ts
   * // Select all courses offered in department A but not in department B
   * await db.select({ courseName: depA.courseName })
   *   .from(depA)
   *   .except(
   *     db.select({ courseName: depB.courseName }).from(depB)
   *   );
   * // or
   * import { except } from 'drizzle-orm/mysql-core'
   *
   * await except(
   *   db.select({ courseName: depA.courseName }).from(depA),
   *   db.select({ courseName: depB.courseName }).from(depB)
   * );
   * ```
   */
  except = this.createSetOperator("except", false);
  /**
   * Adds `except all` set operator to the query.
   *
   * Calling this method will retrieve all rows from the left query, except for the rows that are present in the result set of the right query.
   *
   * See docs: {@link https://orm.drizzle.team/docs/set-operations#except-all}
   *
   * @example
   *
   * ```ts
   * // Select all products that are ordered by regular customers but not by VIP customers
   * await db.select({
   *   productId: regularCustomerOrders.productId,
   *   quantityOrdered: regularCustomerOrders.quantityOrdered,
   * })
   * .from(regularCustomerOrders)
   * .exceptAll(
   *   db.select({
   *     productId: vipCustomerOrders.productId,
   *     quantityOrdered: vipCustomerOrders.quantityOrdered,
   *   })
   *   .from(vipCustomerOrders)
   * );
   * // or
   * import { exceptAll } from 'drizzle-orm/mysql-core'
   *
   * await exceptAll(
   *   db.select({
   *     productId: regularCustomerOrders.productId,
   *     quantityOrdered: regularCustomerOrders.quantityOrdered
   *   })
   *   .from(regularCustomerOrders),
   *   db.select({
   *     productId: vipCustomerOrders.productId,
   *     quantityOrdered: vipCustomerOrders.quantityOrdered
   *   })
   *   .from(vipCustomerOrders)
   * );
   * ```
   */
  exceptAll = this.createSetOperator("except", true);
  /** @internal */
  addSetOperators(setOperators) {
    this.config.setOperators.push(...setOperators);
    return this;
  }
  /**
   * Adds a `where` clause to the query.
   *
   * Calling this method will select only those rows that fulfill a specified condition.
   *
   * See docs: {@link https://orm.drizzle.team/docs/select#filtering}
   *
   * @param where the `where` clause.
   *
   * @example
   * You can use conditional operators and `sql function` to filter the rows to be selected.
   *
   * ```ts
   * // Select all cars with green color
   * await db.select().from(cars).where(eq(cars.color, 'green'));
   * // or
   * await db.select().from(cars).where(sql`${cars.color} = 'green'`)
   * ```
   *
   * You can logically combine conditional operators with `and()` and `or()` operators:
   *
   * ```ts
   * // Select all BMW cars with a green color
   * await db.select().from(cars).where(and(eq(cars.color, 'green'), eq(cars.brand, 'BMW')));
   *
   * // Select all cars with the green or blue color
   * await db.select().from(cars).where(or(eq(cars.color, 'green'), eq(cars.color, 'blue')));
   * ```
   */
  where(where) {
    if (typeof where === "function") {
      where = where(
        new Proxy(
          this.config.fields,
          new SelectionProxyHandler({ sqlAliasedBehavior: "sql", sqlBehavior: "sql" })
        )
      );
    }
    this.config.where = where;
    return this;
  }
  /**
   * Adds a `having` clause to the query.
   *
   * Calling this method will select only those rows that fulfill a specified condition. It is typically used with aggregate functions to filter the aggregated data based on a specified condition.
   *
   * See docs: {@link https://orm.drizzle.team/docs/select#aggregations}
   *
   * @param having the `having` clause.
   *
   * @example
   *
   * ```ts
   * // Select all brands with more than one car
   * await db.select({
   * 	brand: cars.brand,
   * 	count: sql<number>`cast(count(${cars.id}) as int)`,
   * })
   *   .from(cars)
   *   .groupBy(cars.brand)
   *   .having(({ count }) => gt(count, 1));
   * ```
   */
  having(having) {
    if (typeof having === "function") {
      having = having(
        new Proxy(
          this.config.fields,
          new SelectionProxyHandler({ sqlAliasedBehavior: "sql", sqlBehavior: "sql" })
        )
      );
    }
    this.config.having = having;
    return this;
  }
  groupBy(...columns) {
    if (typeof columns[0] === "function") {
      const groupBy = columns[0](
        new Proxy(
          this.config.fields,
          new SelectionProxyHandler({ sqlAliasedBehavior: "alias", sqlBehavior: "sql" })
        )
      );
      this.config.groupBy = Array.isArray(groupBy) ? groupBy : [groupBy];
    } else {
      this.config.groupBy = columns;
    }
    return this;
  }
  orderBy(...columns) {
    if (typeof columns[0] === "function") {
      const orderBy = columns[0](
        new Proxy(
          this.config.fields,
          new SelectionProxyHandler({ sqlAliasedBehavior: "alias", sqlBehavior: "sql" })
        )
      );
      const orderByArray = Array.isArray(orderBy) ? orderBy : [orderBy];
      if (this.config.setOperators.length > 0) {
        this.config.setOperators.at(-1).orderBy = orderByArray;
      } else {
        this.config.orderBy = orderByArray;
      }
    } else {
      const orderByArray = columns;
      if (this.config.setOperators.length > 0) {
        this.config.setOperators.at(-1).orderBy = orderByArray;
      } else {
        this.config.orderBy = orderByArray;
      }
    }
    return this;
  }
  /**
   * Adds a `limit` clause to the query.
   *
   * Calling this method will set the maximum number of rows that will be returned by this query.
   *
   * See docs: {@link https://orm.drizzle.team/docs/select#limit--offset}
   *
   * @param limit the `limit` clause.
   *
   * @example
   *
   * ```ts
   * // Get the first 10 people from this query.
   * await db.select().from(people).limit(10);
   * ```
   */
  limit(limit) {
    if (this.config.setOperators.length > 0) {
      this.config.setOperators.at(-1).limit = limit;
    } else {
      this.config.limit = limit;
    }
    return this;
  }
  /**
   * Adds an `offset` clause to the query.
   *
   * Calling this method will skip a number of rows when returning results from this query.
   *
   * See docs: {@link https://orm.drizzle.team/docs/select#limit--offset}
   *
   * @param offset the `offset` clause.
   *
   * @example
   *
   * ```ts
   * // Get the 10th-20th people from this query.
   * await db.select().from(people).offset(10).limit(10);
   * ```
   */
  offset(offset) {
    if (this.config.setOperators.length > 0) {
      this.config.setOperators.at(-1).offset = offset;
    } else {
      this.config.offset = offset;
    }
    return this;
  }
  /**
   * Adds a `for` clause to the query.
   *
   * Calling this method will specify a lock strength for this query that controls how strictly it acquires exclusive access to the rows being queried.
   *
   * See docs: {@link https://dev.mysql.com/doc/refman/8.0/en/innodb-locking-reads.html}
   *
   * @param strength the lock strength.
   * @param config the lock configuration.
   */
  for(strength, config = {}) {
    this.config.lockingClause = { strength, config };
    return this;
  }
  /** @internal */
  getSQL() {
    return this.dialect.buildSelectQuery(this.config);
  }
  toSQL() {
    const { typings: _typings, ...rest } = this.dialect.sqlToQuery(this.getSQL());
    return rest;
  }
  as(alias) {
    const usedTables = [];
    usedTables.push(...extractUsedTable(this.config.table));
    if (this.config.joins) {
      for (const it of this.config.joins) usedTables.push(...extractUsedTable(it.table));
    }
    return new Proxy(
      new Subquery(this.getSQL(), this.config.fields, alias, false, [...new Set(usedTables)]),
      new SelectionProxyHandler({ alias, sqlAliasedBehavior: "alias", sqlBehavior: "error" })
    );
  }
  /** @internal */
  getSelectedFields() {
    return new Proxy(
      this.config.fields,
      new SelectionProxyHandler({ alias: this.tableName, sqlAliasedBehavior: "alias", sqlBehavior: "error" })
    );
  }
  $dynamic() {
    return this;
  }
  $withCache(config) {
    this.cacheConfig = config === void 0 ? { config: {}, enable: true, autoInvalidate: true } : config === false ? { enable: false } : { enable: true, autoInvalidate: true, ...config };
    return this;
  }
};
var MySqlSelectBase = class extends MySqlSelectQueryBuilderBase {
  static [entityKind] = "MySqlSelect";
  prepare() {
    if (!this.session) {
      throw new Error("Cannot execute a query on a query builder. Please use a database instance instead.");
    }
    const fieldsList = orderSelectedFields(this.config.fields);
    const query = this.session.prepareQuery(this.dialect.sqlToQuery(this.getSQL()), fieldsList, void 0, void 0, void 0, {
      type: "select",
      tables: [...this.usedTables]
    }, this.cacheConfig);
    query.joinsNotNullableMap = this.joinsNotNullableMap;
    return query;
  }
  execute = (placeholderValues) => {
    return this.prepare().execute(placeholderValues);
  };
  createIterator = () => {
    const self = this;
    return async function* (placeholderValues) {
      yield* self.prepare().iterator(placeholderValues);
    };
  };
  iterator = this.createIterator();
};
applyMixins(MySqlSelectBase, [QueryPromise]);
function createSetOperator(type, isAll) {
  return (leftSelect, rightSelect, ...restSelects) => {
    const setOperators = [rightSelect, ...restSelects].map((select) => ({
      type,
      isAll,
      rightSelect: select
    }));
    for (const setOperator of setOperators) {
      if (!haveSameKeys(leftSelect.getSelectedFields(), setOperator.rightSelect.getSelectedFields())) {
        throw new Error(
          "Set operator error (union / intersect / except): selected fields are not the same or are in a different order"
        );
      }
    }
    return leftSelect.addSetOperators(setOperators);
  };
}
var getMySqlSetOperators = () => ({
  union,
  unionAll,
  intersect,
  intersectAll,
  except,
  exceptAll
});
var union = createSetOperator("union", false);
var unionAll = createSetOperator("union", true);
var intersect = createSetOperator("intersect", false);
var intersectAll = createSetOperator("intersect", true);
var except = createSetOperator("except", false);
var exceptAll = createSetOperator("except", true);

// node_modules/.pnpm/drizzle-orm@0.45.2_mysql2@3.22.3_@types+node@25.3.5_/node_modules/drizzle-orm/mysql-core/query-builders/query-builder.js
var QueryBuilder = class {
  static [entityKind] = "MySqlQueryBuilder";
  dialect;
  dialectConfig;
  constructor(dialect) {
    this.dialect = is(dialect, MySqlDialect) ? dialect : void 0;
    this.dialectConfig = is(dialect, MySqlDialect) ? void 0 : dialect;
  }
  $with = (alias, selection) => {
    const queryBuilder = this;
    const as = (qb) => {
      if (typeof qb === "function") {
        qb = qb(queryBuilder);
      }
      return new Proxy(
        new WithSubquery(
          qb.getSQL(),
          selection ?? ("getSelectedFields" in qb ? qb.getSelectedFields() ?? {} : {}),
          alias,
          true
        ),
        new SelectionProxyHandler({ alias, sqlAliasedBehavior: "alias", sqlBehavior: "error" })
      );
    };
    return { as };
  };
  with(...queries) {
    const self = this;
    function select(fields) {
      return new MySqlSelectBuilder({
        fields: fields ?? void 0,
        session: void 0,
        dialect: self.getDialect(),
        withList: queries
      });
    }
    function selectDistinct(fields) {
      return new MySqlSelectBuilder({
        fields: fields ?? void 0,
        session: void 0,
        dialect: self.getDialect(),
        withList: queries,
        distinct: true
      });
    }
    return { select, selectDistinct };
  }
  select(fields) {
    return new MySqlSelectBuilder({ fields: fields ?? void 0, session: void 0, dialect: this.getDialect() });
  }
  selectDistinct(fields) {
    return new MySqlSelectBuilder({
      fields: fields ?? void 0,
      session: void 0,
      dialect: this.getDialect(),
      distinct: true
    });
  }
  // Lazy load dialect to avoid circular dependency
  getDialect() {
    if (!this.dialect) {
      this.dialect = new MySqlDialect(this.dialectConfig);
    }
    return this.dialect;
  }
};

// node_modules/.pnpm/drizzle-orm@0.45.2_mysql2@3.22.3_@types+node@25.3.5_/node_modules/drizzle-orm/mysql-core/query-builders/insert.js
var MySqlInsertBuilder = class {
  constructor(table, session, dialect) {
    this.table = table;
    this.session = session;
    this.dialect = dialect;
  }
  static [entityKind] = "MySqlInsertBuilder";
  shouldIgnore = false;
  ignore() {
    this.shouldIgnore = true;
    return this;
  }
  values(values) {
    values = Array.isArray(values) ? values : [values];
    if (values.length === 0) {
      throw new Error("values() must be called with at least one value");
    }
    const mappedValues = values.map((entry) => {
      const result = {};
      const cols = this.table[Table.Symbol.Columns];
      for (const colKey of Object.keys(entry)) {
        const colValue = entry[colKey];
        result[colKey] = is(colValue, SQL) ? colValue : new Param(colValue, cols[colKey]);
      }
      return result;
    });
    return new MySqlInsertBase(this.table, mappedValues, this.shouldIgnore, this.session, this.dialect);
  }
  select(selectQuery) {
    const select = typeof selectQuery === "function" ? selectQuery(new QueryBuilder()) : selectQuery;
    if (!is(select, SQL) && !haveSameKeys(this.table[Columns], select._.selectedFields)) {
      throw new Error(
        "Insert select error: selected fields are not the same or are in a different order compared to the table definition"
      );
    }
    return new MySqlInsertBase(this.table, select, this.shouldIgnore, this.session, this.dialect, true);
  }
};
var MySqlInsertBase = class extends QueryPromise {
  constructor(table, values, ignore, session, dialect, select) {
    super();
    this.session = session;
    this.dialect = dialect;
    this.config = { table, values, select, ignore };
  }
  static [entityKind] = "MySqlInsert";
  config;
  cacheConfig;
  /**
   * Adds an `on duplicate key update` clause to the query.
   *
   * Calling this method will update the row if any unique index conflicts. MySQL will automatically determine the conflict target based on the primary key and unique indexes.
   *
   * See docs: {@link https://orm.drizzle.team/docs/insert#on-duplicate-key-update}
   *
   * @param config The `set` clause
   *
   * @example
   * ```ts
   * await db.insert(cars)
   *   .values({ id: 1, brand: 'BMW'})
   *   .onDuplicateKeyUpdate({ set: { brand: 'Porsche' }});
   * ```
   *
   * While MySQL does not directly support doing nothing on conflict, you can perform a no-op by setting any column's value to itself and achieve the same effect:
   *
   * ```ts
   * import { sql } from 'drizzle-orm';
   *
   * await db.insert(cars)
   *   .values({ id: 1, brand: 'BMW' })
   *   .onDuplicateKeyUpdate({ set: { id: sql`id` } });
   * ```
   */
  onDuplicateKeyUpdate(config) {
    const setSql = this.dialect.buildUpdateSet(this.config.table, mapUpdateSet(this.config.table, config.set));
    this.config.onConflict = sql`update ${setSql}`;
    return this;
  }
  $returningId() {
    const returning = [];
    for (const [key, value] of Object.entries(this.config.table[Table.Symbol.Columns])) {
      if (value.primary) {
        returning.push({ field: value, path: [key] });
      }
    }
    this.config.returning = returning;
    return this;
  }
  /** @internal */
  getSQL() {
    return this.dialect.buildInsertQuery(this.config).sql;
  }
  toSQL() {
    const { typings: _typings, ...rest } = this.dialect.sqlToQuery(this.getSQL());
    return rest;
  }
  prepare() {
    const { sql: sql2, generatedIds } = this.dialect.buildInsertQuery(this.config);
    return this.session.prepareQuery(
      this.dialect.sqlToQuery(sql2),
      void 0,
      void 0,
      generatedIds,
      this.config.returning,
      {
        type: "insert",
        tables: extractUsedTable(this.config.table)
      },
      this.cacheConfig
    );
  }
  execute = (placeholderValues) => {
    return this.prepare().execute(placeholderValues);
  };
  createIterator = () => {
    const self = this;
    return async function* (placeholderValues) {
      yield* self.prepare().iterator(placeholderValues);
    };
  };
  iterator = this.createIterator();
  $dynamic() {
    return this;
  }
};

// node_modules/.pnpm/drizzle-orm@0.45.2_mysql2@3.22.3_@types+node@25.3.5_/node_modules/drizzle-orm/mysql-core/query-builders/update.js
var MySqlUpdateBuilder = class {
  constructor(table, session, dialect, withList) {
    this.table = table;
    this.session = session;
    this.dialect = dialect;
    this.withList = withList;
  }
  static [entityKind] = "MySqlUpdateBuilder";
  set(values) {
    return new MySqlUpdateBase(this.table, mapUpdateSet(this.table, values), this.session, this.dialect, this.withList);
  }
};
var MySqlUpdateBase = class extends QueryPromise {
  constructor(table, set, session, dialect, withList) {
    super();
    this.session = session;
    this.dialect = dialect;
    this.config = { set, table, withList };
  }
  static [entityKind] = "MySqlUpdate";
  config;
  cacheConfig;
  /**
   * Adds a 'where' clause to the query.
   *
   * Calling this method will update only those rows that fulfill a specified condition.
   *
   * See docs: {@link https://orm.drizzle.team/docs/update}
   *
   * @param where the 'where' clause.
   *
   * @example
   * You can use conditional operators and `sql function` to filter the rows to be updated.
   *
   * ```ts
   * // Update all cars with green color
   * db.update(cars).set({ color: 'red' })
   *   .where(eq(cars.color, 'green'));
   * // or
   * db.update(cars).set({ color: 'red' })
   *   .where(sql`${cars.color} = 'green'`)
   * ```
   *
   * You can logically combine conditional operators with `and()` and `or()` operators:
   *
   * ```ts
   * // Update all BMW cars with a green color
   * db.update(cars).set({ color: 'red' })
   *   .where(and(eq(cars.color, 'green'), eq(cars.brand, 'BMW')));
   *
   * // Update all cars with the green or blue color
   * db.update(cars).set({ color: 'red' })
   *   .where(or(eq(cars.color, 'green'), eq(cars.color, 'blue')));
   * ```
   */
  where(where) {
    this.config.where = where;
    return this;
  }
  orderBy(...columns) {
    if (typeof columns[0] === "function") {
      const orderBy = columns[0](
        new Proxy(
          this.config.table[Table.Symbol.Columns],
          new SelectionProxyHandler({ sqlAliasedBehavior: "alias", sqlBehavior: "sql" })
        )
      );
      const orderByArray = Array.isArray(orderBy) ? orderBy : [orderBy];
      this.config.orderBy = orderByArray;
    } else {
      const orderByArray = columns;
      this.config.orderBy = orderByArray;
    }
    return this;
  }
  limit(limit) {
    this.config.limit = limit;
    return this;
  }
  /** @internal */
  getSQL() {
    return this.dialect.buildUpdateQuery(this.config);
  }
  toSQL() {
    const { typings: _typings, ...rest } = this.dialect.sqlToQuery(this.getSQL());
    return rest;
  }
  prepare() {
    return this.session.prepareQuery(
      this.dialect.sqlToQuery(this.getSQL()),
      void 0,
      void 0,
      void 0,
      this.config.returning,
      {
        type: "insert",
        tables: extractUsedTable(this.config.table)
      },
      this.cacheConfig
    );
  }
  execute = (placeholderValues) => {
    return this.prepare().execute(placeholderValues);
  };
  createIterator = () => {
    const self = this;
    return async function* (placeholderValues) {
      yield* self.prepare().iterator(placeholderValues);
    };
  };
  iterator = this.createIterator();
  $dynamic() {
    return this;
  }
};

// node_modules/.pnpm/drizzle-orm@0.45.2_mysql2@3.22.3_@types+node@25.3.5_/node_modules/drizzle-orm/mysql-core/query-builders/query.js
var RelationalQueryBuilder = class {
  constructor(fullSchema, schema, tableNamesMap, table, tableConfig, dialect, session, mode) {
    this.fullSchema = fullSchema;
    this.schema = schema;
    this.tableNamesMap = tableNamesMap;
    this.table = table;
    this.tableConfig = tableConfig;
    this.dialect = dialect;
    this.session = session;
    this.mode = mode;
  }
  static [entityKind] = "MySqlRelationalQueryBuilder";
  findMany(config) {
    return new MySqlRelationalQuery(
      this.fullSchema,
      this.schema,
      this.tableNamesMap,
      this.table,
      this.tableConfig,
      this.dialect,
      this.session,
      config ? config : {},
      "many",
      this.mode
    );
  }
  findFirst(config) {
    return new MySqlRelationalQuery(
      this.fullSchema,
      this.schema,
      this.tableNamesMap,
      this.table,
      this.tableConfig,
      this.dialect,
      this.session,
      config ? { ...config, limit: 1 } : { limit: 1 },
      "first",
      this.mode
    );
  }
};
var MySqlRelationalQuery = class extends QueryPromise {
  constructor(fullSchema, schema, tableNamesMap, table, tableConfig, dialect, session, config, queryMode, mode) {
    super();
    this.fullSchema = fullSchema;
    this.schema = schema;
    this.tableNamesMap = tableNamesMap;
    this.table = table;
    this.tableConfig = tableConfig;
    this.dialect = dialect;
    this.session = session;
    this.config = config;
    this.queryMode = queryMode;
    this.mode = mode;
  }
  static [entityKind] = "MySqlRelationalQuery";
  prepare() {
    const { query, builtQuery } = this._toSQL();
    return this.session.prepareQuery(
      builtQuery,
      void 0,
      (rawRows) => {
        const rows = rawRows.map((row) => mapRelationalRow(this.schema, this.tableConfig, row, query.selection));
        if (this.queryMode === "first") {
          return rows[0];
        }
        return rows;
      }
    );
  }
  _getQuery() {
    const query = this.mode === "planetscale" ? this.dialect.buildRelationalQueryWithoutLateralSubqueries({
      fullSchema: this.fullSchema,
      schema: this.schema,
      tableNamesMap: this.tableNamesMap,
      table: this.table,
      tableConfig: this.tableConfig,
      queryConfig: this.config,
      tableAlias: this.tableConfig.tsName
    }) : this.dialect.buildRelationalQuery({
      fullSchema: this.fullSchema,
      schema: this.schema,
      tableNamesMap: this.tableNamesMap,
      table: this.table,
      tableConfig: this.tableConfig,
      queryConfig: this.config,
      tableAlias: this.tableConfig.tsName
    });
    return query;
  }
  _toSQL() {
    const query = this._getQuery();
    const builtQuery = this.dialect.sqlToQuery(query.sql);
    return { builtQuery, query };
  }
  /** @internal */
  getSQL() {
    return this._getQuery().sql;
  }
  toSQL() {
    return this._toSQL().builtQuery;
  }
  execute() {
    return this.prepare().execute();
  }
};

// node_modules/.pnpm/drizzle-orm@0.45.2_mysql2@3.22.3_@types+node@25.3.5_/node_modules/drizzle-orm/mysql-core/db.js
var MySqlDatabase = class {
  constructor(dialect, session, schema, mode) {
    this.dialect = dialect;
    this.session = session;
    this.mode = mode;
    this._ = schema ? {
      schema: schema.schema,
      fullSchema: schema.fullSchema,
      tableNamesMap: schema.tableNamesMap
    } : {
      schema: void 0,
      fullSchema: {},
      tableNamesMap: {}
    };
    this.query = {};
    if (this._.schema) {
      for (const [tableName, columns] of Object.entries(this._.schema)) {
        this.query[tableName] = new RelationalQueryBuilder(
          schema.fullSchema,
          this._.schema,
          this._.tableNamesMap,
          schema.fullSchema[tableName],
          columns,
          dialect,
          session,
          this.mode
        );
      }
    }
    this.$cache = { invalidate: async (_params) => {
    } };
  }
  static [entityKind] = "MySqlDatabase";
  query;
  /**
   * Creates a subquery that defines a temporary named result set as a CTE.
   *
   * It is useful for breaking down complex queries into simpler parts and for reusing the result set in subsequent parts of the query.
   *
   * See docs: {@link https://orm.drizzle.team/docs/select#with-clause}
   *
   * @param alias The alias for the subquery.
   *
   * Failure to provide an alias will result in a DrizzleTypeError, preventing the subquery from being referenced in other queries.
   *
   * @example
   *
   * ```ts
   * // Create a subquery with alias 'sq' and use it in the select query
   * const sq = db.$with('sq').as(db.select().from(users).where(eq(users.id, 42)));
   *
   * const result = await db.with(sq).select().from(sq);
   * ```
   *
   * To select arbitrary SQL values as fields in a CTE and reference them in other CTEs or in the main query, you need to add aliases to them:
   *
   * ```ts
   * // Select an arbitrary SQL value as a field in a CTE and reference it in the main query
   * const sq = db.$with('sq').as(db.select({
   *   name: sql<string>`upper(${users.name})`.as('name'),
   * })
   * .from(users));
   *
   * const result = await db.with(sq).select({ name: sq.name }).from(sq);
   * ```
   */
  $with = (alias, selection) => {
    const self = this;
    const as = (qb) => {
      if (typeof qb === "function") {
        qb = qb(new QueryBuilder(self.dialect));
      }
      return new Proxy(
        new WithSubquery(
          qb.getSQL(),
          selection ?? ("getSelectedFields" in qb ? qb.getSelectedFields() ?? {} : {}),
          alias,
          true
        ),
        new SelectionProxyHandler({ alias, sqlAliasedBehavior: "alias", sqlBehavior: "error" })
      );
    };
    return { as };
  };
  $count(source, filters) {
    return new MySqlCountBuilder({ source, filters, session: this.session });
  }
  $cache;
  /**
   * Incorporates a previously defined CTE (using `$with`) into the main query.
   *
   * This method allows the main query to reference a temporary named result set.
   *
   * See docs: {@link https://orm.drizzle.team/docs/select#with-clause}
   *
   * @param queries The CTEs to incorporate into the main query.
   *
   * @example
   *
   * ```ts
   * // Define a subquery 'sq' as a CTE using $with
   * const sq = db.$with('sq').as(db.select().from(users).where(eq(users.id, 42)));
   *
   * // Incorporate the CTE 'sq' into the main query and select from it
   * const result = await db.with(sq).select().from(sq);
   * ```
   */
  with(...queries) {
    const self = this;
    function select(fields) {
      return new MySqlSelectBuilder({
        fields: fields ?? void 0,
        session: self.session,
        dialect: self.dialect,
        withList: queries
      });
    }
    function selectDistinct(fields) {
      return new MySqlSelectBuilder({
        fields: fields ?? void 0,
        session: self.session,
        dialect: self.dialect,
        withList: queries,
        distinct: true
      });
    }
    function update(table) {
      return new MySqlUpdateBuilder(table, self.session, self.dialect, queries);
    }
    function delete_(table) {
      return new MySqlDeleteBase(table, self.session, self.dialect, queries);
    }
    return { select, selectDistinct, update, delete: delete_ };
  }
  select(fields) {
    return new MySqlSelectBuilder({ fields: fields ?? void 0, session: this.session, dialect: this.dialect });
  }
  selectDistinct(fields) {
    return new MySqlSelectBuilder({
      fields: fields ?? void 0,
      session: this.session,
      dialect: this.dialect,
      distinct: true
    });
  }
  /**
   * Creates an update query.
   *
   * Calling this method without `.where()` clause will update all rows in a table. The `.where()` clause specifies which rows should be updated.
   *
   * Use `.set()` method to specify which values to update.
   *
   * See docs: {@link https://orm.drizzle.team/docs/update}
   *
   * @param table The table to update.
   *
   * @example
   *
   * ```ts
   * // Update all rows in the 'cars' table
   * await db.update(cars).set({ color: 'red' });
   *
   * // Update rows with filters and conditions
   * await db.update(cars).set({ color: 'red' }).where(eq(cars.brand, 'BMW'));
   * ```
   */
  update(table) {
    return new MySqlUpdateBuilder(table, this.session, this.dialect);
  }
  /**
   * Creates an insert query.
   *
   * Calling this method will create new rows in a table. Use `.values()` method to specify which values to insert.
   *
   * See docs: {@link https://orm.drizzle.team/docs/insert}
   *
   * @param table The table to insert into.
   *
   * @example
   *
   * ```ts
   * // Insert one row
   * await db.insert(cars).values({ brand: 'BMW' });
   *
   * // Insert multiple rows
   * await db.insert(cars).values([{ brand: 'BMW' }, { brand: 'Porsche' }]);
   * ```
   */
  insert(table) {
    return new MySqlInsertBuilder(table, this.session, this.dialect);
  }
  /**
   * Creates a delete query.
   *
   * Calling this method without `.where()` clause will delete all rows in a table. The `.where()` clause specifies which rows should be deleted.
   *
   * See docs: {@link https://orm.drizzle.team/docs/delete}
   *
   * @param table The table to delete from.
   *
   * @example
   *
   * ```ts
   * // Delete all rows in the 'cars' table
   * await db.delete(cars);
   *
   * // Delete rows with filters and conditions
   * await db.delete(cars).where(eq(cars.color, 'green'));
   * ```
   */
  delete(table) {
    return new MySqlDeleteBase(table, this.session, this.dialect);
  }
  execute(query) {
    return this.session.execute(typeof query === "string" ? sql.raw(query) : query.getSQL());
  }
  transaction(transaction, config) {
    return this.session.transaction(transaction, config);
  }
};

// node_modules/.pnpm/drizzle-orm@0.45.2_mysql2@3.22.3_@types+node@25.3.5_/node_modules/drizzle-orm/mysql2/session.js
import { once } from "node:events";

// node_modules/.pnpm/drizzle-orm@0.45.2_mysql2@3.22.3_@types+node@25.3.5_/node_modules/drizzle-orm/cache/core/cache.js
var Cache = class {
  static [entityKind] = "Cache";
};
var NoopCache = class extends Cache {
  strategy() {
    return "all";
  }
  static [entityKind] = "NoopCache";
  async get(_key) {
    return void 0;
  }
  async put(_hashedQuery, _response, _tables, _config) {
  }
  async onMutate(_params) {
  }
};
async function hashQuery(sql2, params) {
  const dataToHash = `${sql2}-${JSON.stringify(params)}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(dataToHash);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = [...new Uint8Array(hashBuffer)];
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return hashHex;
}

// node_modules/.pnpm/drizzle-orm@0.45.2_mysql2@3.22.3_@types+node@25.3.5_/node_modules/drizzle-orm/mysql-core/session.js
var MySqlPreparedQuery = class {
  constructor(cache, queryMetadata, cacheConfig) {
    this.cache = cache;
    this.queryMetadata = queryMetadata;
    this.cacheConfig = cacheConfig;
    if (cache && cache.strategy() === "all" && cacheConfig === void 0) {
      this.cacheConfig = { enable: true, autoInvalidate: true };
    }
    if (!this.cacheConfig?.enable) {
      this.cacheConfig = void 0;
    }
  }
  static [entityKind] = "MySqlPreparedQuery";
  /** @internal */
  async queryWithCache(queryString, params, query) {
    if (this.cache === void 0 || is(this.cache, NoopCache) || this.queryMetadata === void 0) {
      try {
        return await query();
      } catch (e) {
        throw new DrizzleQueryError(queryString, params, e);
      }
    }
    if (this.cacheConfig && !this.cacheConfig.enable) {
      try {
        return await query();
      } catch (e) {
        throw new DrizzleQueryError(queryString, params, e);
      }
    }
    if ((this.queryMetadata.type === "insert" || this.queryMetadata.type === "update" || this.queryMetadata.type === "delete") && this.queryMetadata.tables.length > 0) {
      try {
        const [res] = await Promise.all([
          query(),
          this.cache.onMutate({ tables: this.queryMetadata.tables })
        ]);
        return res;
      } catch (e) {
        throw new DrizzleQueryError(queryString, params, e);
      }
    }
    if (!this.cacheConfig) {
      try {
        return await query();
      } catch (e) {
        throw new DrizzleQueryError(queryString, params, e);
      }
    }
    if (this.queryMetadata.type === "select") {
      const fromCache = await this.cache.get(
        this.cacheConfig.tag ?? await hashQuery(queryString, params),
        this.queryMetadata.tables,
        this.cacheConfig.tag !== void 0,
        this.cacheConfig.autoInvalidate
      );
      if (fromCache === void 0) {
        let result;
        try {
          result = await query();
        } catch (e) {
          throw new DrizzleQueryError(queryString, params, e);
        }
        await this.cache.put(
          this.cacheConfig.tag ?? await hashQuery(queryString, params),
          result,
          // make sure we send tables that were used in a query only if user wants to invalidate it on each write
          this.cacheConfig.autoInvalidate ? this.queryMetadata.tables : [],
          this.cacheConfig.tag !== void 0,
          this.cacheConfig.config
        );
        return result;
      }
      return fromCache;
    }
    try {
      return await query();
    } catch (e) {
      throw new DrizzleQueryError(queryString, params, e);
    }
  }
  /** @internal */
  joinsNotNullableMap;
};
var MySqlSession = class {
  constructor(dialect) {
    this.dialect = dialect;
  }
  static [entityKind] = "MySqlSession";
  execute(query) {
    return this.prepareQuery(
      this.dialect.sqlToQuery(query),
      void 0
    ).execute();
  }
  async count(sql2) {
    const res = await this.execute(sql2);
    return Number(
      res[0][0]["count"]
    );
  }
  getSetTransactionSQL(config) {
    const parts = [];
    if (config.isolationLevel) {
      parts.push(`isolation level ${config.isolationLevel}`);
    }
    return parts.length ? sql`set transaction ${sql.raw(parts.join(" "))}` : void 0;
  }
  getStartTransactionSQL(config) {
    const parts = [];
    if (config.withConsistentSnapshot) {
      parts.push("with consistent snapshot");
    }
    if (config.accessMode) {
      parts.push(config.accessMode);
    }
    return parts.length ? sql`start transaction ${sql.raw(parts.join(" "))}` : void 0;
  }
};
var MySqlTransaction = class extends MySqlDatabase {
  constructor(dialect, session, schema, nestedIndex, mode) {
    super(dialect, session, schema, mode);
    this.schema = schema;
    this.nestedIndex = nestedIndex;
  }
  static [entityKind] = "MySqlTransaction";
  rollback() {
    throw new TransactionRollbackError();
  }
};

// node_modules/.pnpm/drizzle-orm@0.45.2_mysql2@3.22.3_@types+node@25.3.5_/node_modules/drizzle-orm/mysql2/session.js
var MySql2PreparedQuery = class extends MySqlPreparedQuery {
  constructor(client, queryString, params, logger2, cache, queryMetadata, cacheConfig, fields, customResultMapper, generatedIds, returningIds) {
    super(cache, queryMetadata, cacheConfig);
    this.client = client;
    this.params = params;
    this.logger = logger2;
    this.fields = fields;
    this.customResultMapper = customResultMapper;
    this.generatedIds = generatedIds;
    this.returningIds = returningIds;
    this.rawQuery = {
      sql: queryString,
      // rowsAsArray: true,
      typeCast: function(field, next) {
        if (field.type === "TIMESTAMP" || field.type === "DATETIME" || field.type === "DATE") {
          return field.string();
        }
        return next();
      }
    };
    this.query = {
      sql: queryString,
      rowsAsArray: true,
      typeCast: function(field, next) {
        if (field.type === "TIMESTAMP" || field.type === "DATETIME" || field.type === "DATE") {
          return field.string();
        }
        return next();
      }
    };
  }
  static [entityKind] = "MySql2PreparedQuery";
  rawQuery;
  query;
  async execute(placeholderValues = {}) {
    const params = fillPlaceholders(this.params, placeholderValues);
    this.logger.logQuery(this.rawQuery.sql, params);
    const { fields, client, rawQuery, query, joinsNotNullableMap, customResultMapper, returningIds, generatedIds } = this;
    if (!fields && !customResultMapper) {
      const res = await this.queryWithCache(rawQuery.sql, params, async () => {
        return await client.query(rawQuery, params);
      });
      const insertId = res[0].insertId;
      const affectedRows = res[0].affectedRows;
      if (returningIds) {
        const returningResponse = [];
        let j = 0;
        for (let i = insertId; i < insertId + affectedRows; i++) {
          for (const column of returningIds) {
            const key = returningIds[0].path[0];
            if (is(column.field, Column)) {
              if (column.field.primary && column.field.autoIncrement) {
                returningResponse.push({ [key]: i });
              }
              if (column.field.defaultFn && generatedIds) {
                returningResponse.push({ [key]: generatedIds[j][key] });
              }
            }
          }
          j++;
        }
        return returningResponse;
      }
      return res;
    }
    const result = await this.queryWithCache(query.sql, params, async () => {
      return await client.query(query, params);
    });
    const rows = result[0];
    if (customResultMapper) {
      return customResultMapper(rows);
    }
    return rows.map((row) => mapResultRow(fields, row, joinsNotNullableMap));
  }
  async *iterator(placeholderValues = {}) {
    const params = fillPlaceholders(this.params, placeholderValues);
    const conn = (isPool(this.client) ? await this.client.getConnection() : this.client).connection;
    const { fields, query, rawQuery, joinsNotNullableMap, client, customResultMapper } = this;
    const hasRowsMapper = Boolean(fields || customResultMapper);
    const driverQuery = hasRowsMapper ? conn.query(query, params) : conn.query(rawQuery, params);
    const stream = driverQuery.stream();
    function dataListener() {
      stream.pause();
    }
    stream.on("data", dataListener);
    try {
      const onEnd = once(stream, "end");
      const onError = once(stream, "error");
      while (true) {
        stream.resume();
        const row = await Promise.race([onEnd, onError, new Promise((resolve) => stream.once("data", resolve))]);
        if (row === void 0 || Array.isArray(row) && row.length === 0) {
          break;
        } else if (row instanceof Error) {
          throw row;
        } else {
          if (hasRowsMapper) {
            if (customResultMapper) {
              const mappedRow = customResultMapper([row]);
              yield Array.isArray(mappedRow) ? mappedRow[0] : mappedRow;
            } else {
              yield mapResultRow(fields, row, joinsNotNullableMap);
            }
          } else {
            yield row;
          }
        }
      }
    } finally {
      stream.off("data", dataListener);
      if (isPool(client)) {
        conn.end();
      }
    }
  }
};
var MySql2Session = class _MySql2Session extends MySqlSession {
  constructor(client, dialect, schema, options) {
    super(dialect);
    this.client = client;
    this.schema = schema;
    this.options = options;
    this.logger = options.logger ?? new NoopLogger();
    this.cache = options.cache ?? new NoopCache();
    this.mode = options.mode;
  }
  static [entityKind] = "MySql2Session";
  logger;
  mode;
  cache;
  prepareQuery(query, fields, customResultMapper, generatedIds, returningIds, queryMetadata, cacheConfig) {
    return new MySql2PreparedQuery(
      this.client,
      query.sql,
      query.params,
      this.logger,
      this.cache,
      queryMetadata,
      cacheConfig,
      fields,
      customResultMapper,
      generatedIds,
      returningIds
    );
  }
  /**
   * @internal
   * What is its purpose?
   */
  async query(query, params) {
    this.logger.logQuery(query, params);
    const result = await this.client.query({
      sql: query,
      values: params,
      rowsAsArray: true,
      typeCast: function(field, next) {
        if (field.type === "TIMESTAMP" || field.type === "DATETIME" || field.type === "DATE") {
          return field.string();
        }
        return next();
      }
    });
    return result;
  }
  all(query) {
    const querySql = this.dialect.sqlToQuery(query);
    this.logger.logQuery(querySql.sql, querySql.params);
    return this.client.execute(querySql.sql, querySql.params).then((result) => result[0]);
  }
  async transaction(transaction, config) {
    const session = isPool(this.client) ? new _MySql2Session(
      await this.client.getConnection(),
      this.dialect,
      this.schema,
      this.options
    ) : this;
    const tx = new MySql2Transaction(
      this.dialect,
      session,
      this.schema,
      0,
      this.mode
    );
    if (config) {
      const setTransactionConfigSql = this.getSetTransactionSQL(config);
      if (setTransactionConfigSql) {
        await tx.execute(setTransactionConfigSql);
      }
      const startTransactionSql = this.getStartTransactionSQL(config);
      await (startTransactionSql ? tx.execute(startTransactionSql) : tx.execute(sql`begin`));
    } else {
      await tx.execute(sql`begin`);
    }
    try {
      const result = await transaction(tx);
      await tx.execute(sql`commit`);
      return result;
    } catch (err) {
      await tx.execute(sql`rollback`);
      throw err;
    } finally {
      if (isPool(this.client)) {
        session.client.release();
      }
    }
  }
};
var MySql2Transaction = class _MySql2Transaction extends MySqlTransaction {
  static [entityKind] = "MySql2Transaction";
  async transaction(transaction) {
    const savepointName = `sp${this.nestedIndex + 1}`;
    const tx = new _MySql2Transaction(
      this.dialect,
      this.session,
      this.schema,
      this.nestedIndex + 1,
      this.mode
    );
    await tx.execute(sql.raw(`savepoint ${savepointName}`));
    try {
      const result = await transaction(tx);
      await tx.execute(sql.raw(`release savepoint ${savepointName}`));
      return result;
    } catch (err) {
      await tx.execute(sql.raw(`rollback to savepoint ${savepointName}`));
      throw err;
    }
  }
};
function isPool(client) {
  return "getConnection" in client;
}

// node_modules/.pnpm/drizzle-orm@0.45.2_mysql2@3.22.3_@types+node@25.3.5_/node_modules/drizzle-orm/mysql2/driver.js
var MySql2Driver = class {
  constructor(client, dialect, options = {}) {
    this.client = client;
    this.dialect = dialect;
    this.options = options;
  }
  static [entityKind] = "MySql2Driver";
  createSession(schema, mode) {
    return new MySql2Session(this.client, this.dialect, schema, {
      logger: this.options.logger,
      mode,
      cache: this.options.cache
    });
  }
};
var MySql2Database = class extends MySqlDatabase {
  static [entityKind] = "MySql2Database";
};
function construct(client, config = {}) {
  const dialect = new MySqlDialect({ casing: config.casing });
  let logger2;
  if (config.logger === true) {
    logger2 = new DefaultLogger();
  } else if (config.logger !== false) {
    logger2 = config.logger;
  }
  const clientForInstance = isCallbackClient(client) ? client.promise() : client;
  let schema;
  if (config.schema) {
    if (config.mode === void 0) {
      throw new DrizzleError({
        message: 'You need to specify "mode": "planetscale" or "default" when providing a schema. Read more: https://orm.drizzle.team/docs/rqb#modes'
      });
    }
    const tablesConfig = extractTablesRelationalConfig(
      config.schema,
      createTableRelationsHelpers
    );
    schema = {
      fullSchema: config.schema,
      schema: tablesConfig.tables,
      tableNamesMap: tablesConfig.tableNamesMap
    };
  }
  const mode = config.mode ?? "default";
  const driver = new MySql2Driver(clientForInstance, dialect, { logger: logger2, cache: config.cache });
  const session = driver.createSession(schema, mode);
  const db2 = new MySql2Database(dialect, session, schema, mode);
  db2.$client = client;
  db2.$cache = config.cache;
  if (db2.$cache) {
    db2.$cache["invalidate"] = config.cache?.onMutate;
  }
  return db2;
}
function isCallbackClient(client) {
  return typeof client.promise === "function";
}
function drizzle(...params) {
  if (typeof params[0] === "string") {
    const connectionString = params[0];
    const instance = createPool({
      uri: connectionString
    });
    return construct(instance, params[1]);
  }
  if (isConfig(params[0])) {
    const { connection, client, ...drizzleConfig } = params[0];
    if (client) return construct(client, drizzleConfig);
    const instance = typeof connection === "string" ? createPool({
      uri: connection,
      supportBigNumbers: true
    }) : createPool(connection);
    const db2 = construct(instance, drizzleConfig);
    return db2;
  }
  return construct(params[0], params[1]);
}
((drizzle2) => {
  function mock(config) {
    return construct({}, config);
  }
  drizzle2.mock = mock;
})(drizzle || (drizzle = {}));

// lib/db/src/index.ts
import mysql from "mysql2/promise";

// lib/db/src/schema/index.ts
var schema_exports = {};
__export(schema_exports, {
  societyState: () => societyState
});

// lib/db/src/schema/state.ts
var societyState = mysqlTable("society_state", {
  key: varchar("key", { length: 255 }).primaryKey(),
  stateJson: longtext("state_json").notNull(),
  // TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  // defaultNow + onUpdateNow → MySQL gestisce il valore automaticamente
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow()
});

// lib/db/src/index.ts
function resolveDbUrl() {
  const raw = process.env.DATABASE_URL || "";
  if (!raw) return "mysql://localhost/placeholder";
  try {
    new URL(raw);
    return raw;
  } catch {
    return "mysql://localhost/placeholder";
  }
}
var pool = mysql.createPool(resolveDbUrl());
var db = drizzle(pool, { schema: schema_exports, mode: "default" });

// artifacts/api-server/src/routes/health.ts
var router = Router();
router.get("/healthz", (_req, res) => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json({ ...data, v: "2026-05-13-v4" });
});
router.get("/healthz/db", async (_req, res) => {
  const raw = process.env["DATABASE_URL"] ?? "";
  let host = "(not set)";
  if (raw) {
    try {
      const u = new URL(raw);
      host = `${u.hostname}:${u.port || 3306}/${u.pathname.slice(1)}`;
    } catch {
      host = "(invalid URL)";
    }
  }
  try {
    await pool.execute("SELECT 1");
    res.json({ db: "ok", host });
  } catch (e) {
    res.status(500).json({ db: "error", host, code: e?.code, message: e?.message?.slice(0, 120) });
  }
});
var health_default = router;

// artifacts/api-server/src/routes/state.ts
import { Router as Router2 } from "express";

// artifacts/api-server/src/lib/logger.ts
import pino from "pino";
var usePretty = process.env.NODE_ENV === "development";
var logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  redact: [
    "req.headers.authorization",
    "req.headers.cookie",
    "res.headers['set-cookie']"
  ],
  ...usePretty ? {
    transport: {
      target: "pino-pretty",
      options: { colorize: true }
    }
  } : {}
});

// artifacts/api-server/src/routes/state.ts
var router2 = Router2();
var CREATE_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS \`society_state\` (
    \`key\`      VARCHAR(255) PRIMARY KEY,
    state_json  LONGTEXT NOT NULL,
    is_demo     TINYINT(1) NOT NULL DEFAULT 0,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )
`;
var MIN_STATE_BYTES = 200;
function wouldDowngrade(newJson, existingJson) {
  try {
    const n = JSON.parse(newJson);
    const e = JSON.parse(existingJson);
    const existingHasRealData = Array.isArray(e.players) && e.players.length > 0 || Array.isArray(e.USERS_DB) && e.USERS_DB.length > 6 || typeof e.nextUserId === "number" && e.nextUserId > 7;
    const newIsEmpty = (!Array.isArray(n.players) || n.players.length === 0) && (!Array.isArray(n.USERS_DB) || n.USERS_DB.length <= 6) && (typeof n.nextUserId !== "number" || n.nextUserId <= 7);
    return existingHasRealData && newIsEmpty;
  } catch {
    return false;
  }
}
router2.get("/state/:key", async (req, res) => {
  try {
    await pool.execute(CREATE_TABLE_SQL);
    const [rows] = await pool.execute(
      "SELECT state_json, is_demo FROM `society_state` WHERE `key` = ?",
      [req.params.key]
    );
    if (!rows.length) return res.status(404).json({ error: "not found" });
    return res.json({
      key: req.params.key,
      stateJson: rows[0].state_json,
      isDemo: rows[0].is_demo === 1
    });
  } catch (e) {
    logger.error({ err: e }, "state GET failed");
    return res.status(500).json({ error: e?.sqlMessage ?? e?.code ?? "db_error" });
  }
});
router2.put("/state/:key", async (req, res) => {
  const { stateJson, isDemo } = req.body;
  if (typeof stateJson !== "string") {
    return res.status(400).json({ error: "stateJson must be a string" });
  }
  const isDemoWrite = isDemo === true;
  const isDemoVal = isDemoWrite ? 1 : 0;
  try {
    await pool.execute(CREATE_TABLE_SQL);
    const [existing] = await pool.execute(
      "SELECT state_json, LENGTH(state_json) as sz, is_demo FROM `society_state` WHERE `key` = ?",
      [req.params.key]
    );
    if (existing.length) {
      const existingSz = Number(existing[0].sz);
      const existingIsReal = existing[0].is_demo === 0;
      if (stateJson.length < MIN_STATE_BYTES && existingSz >= MIN_STATE_BYTES) {
        logger.warn(
          { key: req.params.key, newSize: stateJson.length, existingSize: existingSz },
          "PUT rejected: near-empty would overwrite real data"
        );
        return res.status(409).json({
          error: "would_overwrite_real_data",
          detail: "Il nuovo stato \xE8 troppo piccolo per sovrascrivere dati esistenti."
        });
      }
      if (isDemoWrite && existingIsReal) {
        logger.warn({ key: req.params.key }, "PUT rejected: demo write on real-data row");
        return res.status(409).json({
          error: "demo_cannot_overwrite_real",
          detail: "Dati demo non possono sovrascrivere dati reali."
        });
      }
      if (!isDemoWrite && existingIsReal && wouldDowngrade(stateJson, existing[0].state_json)) {
        logger.warn({ key: req.params.key }, "PUT rejected: would downgrade data");
        return res.status(409).json({
          error: "would_downgrade_data",
          detail: "Il nuovo stato ha meno dati di quelli esistenti. Operazione annullata."
        });
      }
    }
    await pool.execute(
      `INSERT INTO \`society_state\` (\`key\`, \`state_json\`, \`is_demo\`) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE
         \`state_json\` = ?,
         \`is_demo\`    = IF(\`is_demo\` = 0, 0, ?)`,
      [req.params.key, stateJson, isDemoVal, stateJson, isDemoVal]
    );
    return res.json({ key: req.params.key, updatedAt: (/* @__PURE__ */ new Date()).toISOString() });
  } catch (e) {
    logger.error({ err: e }, "state PUT failed");
    return res.status(500).json({ error: e?.sqlMessage ?? e?.code ?? "db_error" });
  }
});
var state_default = router2;

// artifacts/api-server/src/routes/login.ts
import { Router as Router3 } from "express";
var router3 = Router3();
var CREATE_TABLE_SQL2 = `
  CREATE TABLE IF NOT EXISTS \`society_state\` (
    \`key\`      VARCHAR(255) PRIMARY KEY,
    state_json  LONGTEXT NOT NULL,
    is_demo     TINYINT(1) NOT NULL DEFAULT 0,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )
`;
router3.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
    return res.status(400).json({ error: "missing_fields" });
  }
  const normalizedEmail = email.toLowerCase().trim();
  try {
    await pool.execute(CREATE_TABLE_SQL2);
    const [saRows] = await pool.execute(
      "SELECT state_json FROM `society_state` WHERE `key` = ?",
      ["fieldos_sa_v1"]
    );
    let societies = [];
    if (saRows.length) {
      try {
        const saState = JSON.parse(saRows[0].state_json);
        societies = Array.isArray(saState.saSocieties) ? saState.saSocieties : [];
      } catch {
      }
    }
    async function searchKey(stateKey, societyId) {
      const [stateRows] = await pool.execute(
        "SELECT state_json FROM `society_state` WHERE `key` = ?",
        [stateKey]
      );
      if (!stateRows.length) return null;
      let state;
      try {
        state = JSON.parse(stateRows[0].state_json);
      } catch {
        return null;
      }
      const users = state.USERS_DB || [];
      const user = users.find(
        (u) => typeof u.email === "string" && u.email.toLowerCase() === normalizedEmail && u.pass === password
      );
      if (!user) return null;
      return { state, stateKey, societyId, user, stateJson: stateRows[0].state_json };
    }
    const checkedKeys = /* @__PURE__ */ new Set();
    for (const soc of societies) {
      const stato = soc.stato ?? "attivo";
      const stateKey = soc.id === 0 ? "fieldos_state_v1" : `fieldos_state_soc_${soc.id}`;
      checkedKeys.add(stateKey);
      const found = await searchKey(stateKey, soc.id);
      if (!found) continue;
      if (found.user.stato === "sospeso") {
        return res.status(403).json({ error: "suspended" });
      }
      if (stato === "sospeso") {
        return res.status(403).json({ error: "society_suspended", message: "La societ\xE0 \xE8 sospesa. Contatta il supporto." });
      }
      if (stato === "archiviato") {
        return res.status(403).json({ error: "society_archived", message: "La societ\xE0 \xE8 archiviata. Contatta il supporto." });
      }
      if (stato === "eliminato") {
        return res.status(403).json({ error: "society_deleted", message: "La societ\xE0 \xE8 stata eliminata." });
      }
      const scadenzaDemo = soc.scadenzaDemo;
      const pianoSoc = soc.piano ?? "demo";
      if (pianoSoc === "demo" && scadenzaDemo && scadenzaDemo < Date.now()) {
        return res.status(403).json({ error: "demo_expired" });
      }
      logger.info({ email: normalizedEmail, societyId: soc.id, stateKey }, "login ok (SA-guided)");
      return res.json({ societyId: soc.id, stateKey, user: found.user, stateJson: found.stateJson });
    }
    const [allKeys] = await pool.execute(
      "SELECT `key` FROM `society_state` WHERE (`key` LIKE 'fieldos_state_soc_%' OR `key` = 'fieldos_state_v1') AND `key` NOT LIKE 'fieldos_demo%'"
    );
    for (const row of allKeys) {
      const stateKey = row.key;
      if (checkedKeys.has(stateKey)) continue;
      const socIdMatch = stateKey.match(/fieldos_state_soc_(\d+)$/);
      const societyId = socIdMatch ? parseInt(socIdMatch[1]) : 0;
      const found = await searchKey(stateKey, societyId);
      if (!found) continue;
      if (found.user.stato === "sospeso") {
        return res.status(403).json({ error: "suspended" });
      }
      logger.info({ email: normalizedEmail, societyId, stateKey }, "login ok (orphan-key fallback)");
      return res.json({ societyId, stateKey, user: found.user, stateJson: found.stateJson });
    }
    return res.status(401).json({ error: "invalid_credentials" });
  } catch (e) {
    logger.error({ err: e }, "login error");
    return res.status(500).json({ error: "server_error", detail: e?.message });
  }
});
var login_default = router3;

// artifacts/api-server/src/routes/auth.ts
import { Router as Router4 } from "express";
var router4 = Router4();
var CREATE_TABLE_SQL3 = `
  CREATE TABLE IF NOT EXISTS \`society_state\` (
    \`key\`      VARCHAR(255) PRIMARY KEY,
    state_json  LONGTEXT NOT NULL,
    is_demo     TINYINT(1) NOT NULL DEFAULT 0,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )
`;
router4.post("/auth/verify-code", async (req, res) => {
  const { code } = req.body;
  if (typeof code !== "string" || !code.trim()) {
    return res.status(400).json({ valid: false, error: "missing_code" });
  }
  const upperCode = code.trim().toUpperCase();
  try {
    await pool.execute(CREATE_TABLE_SQL3);
    const [rows] = await pool.execute(
      `SELECT \`key\`, state_json FROM \`society_state\`
       WHERE (\`key\` LIKE 'fieldos_state_soc_%' OR \`key\` = 'fieldos_state_v1')
         AND \`key\` NOT LIKE 'fieldos_demo%'`
    );
    for (const row of rows) {
      let state;
      try {
        state = JSON.parse(row.state_json);
      } catch {
        continue;
      }
      const rowCode = (state.codiceSocieta ?? "").trim().toUpperCase();
      if (!rowCode || rowCode !== upperCode) continue;
      const stateKey = row.key;
      let societyId = 0;
      const match = stateKey.match(/fieldos_state_soc_(\d+)$/);
      if (match) societyId = parseInt(match[1], 10);
      const societyName = state.nomeSocieta || "MyVivaio";
      logger.info({ code: upperCode, societyId, stateKey }, "verify-code: found");
      return res.json({ valid: true, societyId, stateKey, societyName });
    }
    logger.info({ code: upperCode }, "verify-code: not found");
    return res.json({ valid: false });
  } catch (e) {
    logger.error({ err: e }, "verify-code error");
    return res.status(500).json({ valid: false, error: "server_error" });
  }
});
var auth_default = router4;

// artifacts/api-server/src/routes/assist.ts
import { Router as Router5 } from "express";
var router5 = Router5();
var ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
var SYSTEM_PROMPT = `Sei l'assistente di MyVivaio, piattaforma italiana di gestione per societ\xE0 di calcio giovanile.
Rispondi in italiano semplice e diretto, massimo 3-4 frasi.
Conosci tutte le funzioni dell'app: rosa giocatori, presenze, convocazioni, comunicazioni, chat interna, campionati, tornei, amichevoli, calendario, quote, documenti, impostazioni.
Non inventare funzioni che non esistono. Se non sai rispondere, dillo chiaramente.`;
router5.post("/ai-assist", async (req, res) => {
  const { question, section, role } = req.body;
  if (typeof question !== "string" || !question.trim()) {
    return res.status(400).json({ error: "missing_question" });
  }
  const apiKey = process.env["ANTHROPIC_API_KEY"];
  if (!apiKey) {
    return res.status(503).json({ error: "ai_not_configured" });
  }
  const userMsg = [
    section ? `Sezione attiva: ${section}.` : "",
    role ? `Ruolo utente: ${role}.` : "",
    `Domanda: ${question.trim()}`
  ].filter(Boolean).join(" ");
  try {
    const response = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 512,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userMsg }]
      })
    });
    if (!response.ok) {
      const body = await response.text();
      logger.warn({ status: response.status, body }, "Anthropic API error");
      return res.status(502).json({ error: "ai_error", detail: body.slice(0, 200) });
    }
    const data = await response.json();
    const answer = data?.content?.[0]?.text ?? "";
    return res.json({ answer });
  } catch (e) {
    logger.error({ err: e }, "ai-assist fetch error");
    return res.status(500).json({ error: "server_error", detail: e?.message });
  }
});
var assist_default = router5;

// artifacts/api-server/src/routes/push.ts
var import_web_push = __toESM(require_src2(), 1);
import { Router as Router6 } from "express";
var router6 = Router6();
var VAPID_PUBLIC = process.env["VAPID_PUBLIC_KEY"] ?? "";
var VAPID_PRIVATE = process.env["VAPID_PRIVATE_KEY"] ?? "";
var VAPID_SUBJECT = process.env["VAPID_SUBJECT"] ?? "mailto:admin@myvivaio.app";
if (VAPID_PUBLIC && VAPID_PRIVATE) {
  import_web_push.default.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);
}
var CREATE_SUBS_TABLE = `
  CREATE TABLE IF NOT EXISTS \`push_subscriptions\` (
    \`id\`                INT AUTO_INCREMENT PRIMARY KEY,
    \`user_id\`           INT NOT NULL,
    \`society_key\`       VARCHAR(255) NOT NULL,
    \`subscription_json\` TEXT NOT NULL,
    \`updated_at\`        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY \`uq_user_society\` (\`user_id\`, \`society_key\`)
  )
`;
async function ensureTable() {
  await pool.execute(CREATE_SUBS_TABLE);
}
router6.get("/push/vapid-public", (_req, res) => {
  if (!VAPID_PUBLIC) return res.status(503).json({ error: "push_not_configured" });
  return res.json({ publicKey: VAPID_PUBLIC });
});
router6.post("/push/subscribe", async (req, res) => {
  const { userId, societyKey, subscription } = req.body;
  if (typeof userId !== "number" || typeof societyKey !== "string" || !societyKey || !subscription) {
    return res.status(400).json({ error: "missing_fields" });
  }
  try {
    await ensureTable();
    const subJson = JSON.stringify(subscription);
    await pool.execute(
      `INSERT INTO \`push_subscriptions\` (\`user_id\`, \`society_key\`, \`subscription_json\`)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE \`subscription_json\` = ?, \`updated_at\` = NOW()`,
      [userId, societyKey, subJson, subJson]
    );
    return res.json({ ok: true });
  } catch (e) {
    logger.error({ err: e }, "push subscribe error");
    return res.status(500).json({ error: "server_error", detail: e?.message });
  }
});
router6.post("/push/send", async (req, res) => {
  if (!VAPID_PUBLIC || !VAPID_PRIVATE) {
    return res.status(503).json({ error: "push_not_configured" });
  }
  const { userId, societyKey, notification } = req.body;
  if (typeof userId !== "number" || typeof societyKey !== "string" || !societyKey || !notification) {
    return res.status(400).json({ error: "missing_fields" });
  }
  try {
    await ensureTable();
    const [rows] = await pool.execute(
      "SELECT subscription_json FROM `push_subscriptions` WHERE `user_id` = ? AND `society_key` = ?",
      [userId, societyKey]
    );
    if (!rows.length) return res.json({ ok: true, sent: 0 });
    const payload = JSON.stringify(notification);
    let sent = 0;
    let expired = false;
    for (const row of rows) {
      let sub;
      try {
        sub = JSON.parse(row.subscription_json);
      } catch {
        continue;
      }
      try {
        await import_web_push.default.sendNotification(sub, payload);
        sent++;
      } catch (e) {
        if (e.statusCode === 410 || e.statusCode === 404) {
          expired = true;
          await pool.execute(
            "DELETE FROM `push_subscriptions` WHERE `user_id` = ? AND `society_key` = ?",
            [userId, societyKey]
          ).catch(() => {
          });
        } else {
          logger.warn({ err: e, userId }, "push send warning");
        }
      }
    }
    return res.json({ ok: true, sent, expired });
  } catch (e) {
    logger.error({ err: e }, "push send error");
    return res.status(500).json({ error: "server_error", detail: e?.message });
  }
});
var push_default = router6;

// artifacts/api-server/src/routes/upload.ts
import { Router as Router7 } from "express";
var router7 = Router7();
var CREATE_TABLE = `
  CREATE TABLE IF NOT EXISTS \`photo_uploads\` (
    \`id\`          INT AUTO_INCREMENT PRIMARY KEY,
    \`society_key\` VARCHAR(255) NOT NULL,
    \`photo_key\`   VARCHAR(255) NOT NULL,
    \`mime_type\`   VARCHAR(50)  NOT NULL DEFAULT 'image/jpeg',
    \`data\`        MEDIUMBLOB   NOT NULL,
    \`updated_at\`  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY \`uq_soc_photo\` (\`society_key\`, \`photo_key\`)
  )
`;
var _tableReady = false;
async function ensureTable2() {
  if (_tableReady) return;
  await pool.execute(CREATE_TABLE);
  _tableReady = true;
}
router7.post("/upload/photo", async (req, res) => {
  const { societyKey, photoKey, dataBase64 } = req.body;
  if (!societyKey || !photoKey || !dataBase64) {
    return res.status(400).json({ error: "missing_fields" });
  }
  let base64Data = dataBase64;
  let mime = "image/jpeg";
  const dataUriMatch = dataBase64.match(/^data:([^;]+);base64,(.+)$/s);
  if (dataUriMatch) {
    mime = dataUriMatch[1];
    base64Data = dataUriMatch[2];
  }
  if (base64Data.length > 28e5) {
    return res.status(413).json({ error: "photo_too_large" });
  }
  try {
    await ensureTable2();
    const buf = Buffer.from(base64Data, "base64");
    await pool.execute(
      `INSERT INTO \`photo_uploads\` (\`society_key\`, \`photo_key\`, \`mime_type\`, \`data\`)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE \`mime_type\` = VALUES(\`mime_type\`), \`data\` = VALUES(\`data\`)`,
      [societyKey, photoKey, mime, buf]
    );
    const url = `/api/photo/${encodeURIComponent(societyKey)}/${encodeURIComponent(photoKey)}`;
    logger.info({ societyKey, photoKey, bytes: buf.length }, "photo uploaded");
    return res.json({ ok: true, url });
  } catch (e) {
    logger.error({ err: e }, "photo upload error");
    return res.status(500).json({ error: "server_error", detail: e?.message });
  }
});
router7.get("/photo/:societyKey/:photoKey", async (req, res) => {
  try {
    await ensureTable2();
    const [rows] = await pool.execute(
      "SELECT mime_type, data FROM `photo_uploads` WHERE society_key = ? AND photo_key = ?",
      [req.params.societyKey, req.params.photoKey]
    );
    if (!rows.length) return res.status(404).send("Not found");
    res.setHeader("Content-Type", rows[0].mime_type || "image/jpeg");
    res.setHeader("Cache-Control", "public, max-age=86400, stale-while-revalidate=3600");
    return res.send(rows[0].data);
  } catch (e) {
    logger.error({ err: e }, "photo GET error");
    return res.status(500).send("Server error");
  }
});
router7.delete("/upload/photo/:societyKey/:photoKey", async (req, res) => {
  try {
    await ensureTable2();
    await pool.execute(
      "DELETE FROM `photo_uploads` WHERE society_key = ? AND photo_key = ?",
      [req.params.societyKey, req.params.photoKey]
    );
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: "server_error" });
  }
});
var upload_default = router7;

// artifacts/api-server/src/routes/public.ts
import { Router as Router8 } from "express";
var router8 = Router8();
var CREATE_TABLE_SQL4 = `
  CREATE TABLE IF NOT EXISTS \`society_state\` (
    \`key\`      VARCHAR(255) PRIMARY KEY,
    state_json  LONGTEXT NOT NULL,
    is_demo     TINYINT(1) NOT NULL DEFAULT 0,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )
`;
router8.get("/public/societies", async (req, res) => {
  const q = (req.query.q || "").trim().toLowerCase();
  try {
    await pool.execute(CREATE_TABLE_SQL4);
    const [rows] = await pool.execute(
      `SELECT \`key\`, state_json FROM \`society_state\`
       WHERE (\`key\` LIKE 'fieldos_state_soc_%' OR \`key\` = 'fieldos_state_v1')
         AND \`key\` NOT LIKE 'fieldos_demo%'`
    );
    const results = [];
    for (const row of rows) {
      let state;
      try {
        state = JSON.parse(row.state_json);
      } catch {
        continue;
      }
      if (state.ricercaPubblica === false) continue;
      const nome = state.nomeSocieta || "";
      if (!nome || nome.toLowerCase().includes("demo")) continue;
      if (q && !nome.toLowerCase().includes(q)) continue;
      let societyId = 0;
      const match = row.key.match(/fieldos_state_soc_(\d+)$/);
      if (match) societyId = parseInt(match[1], 10);
      const leveList = Array.isArray(state.leve) ? state.leve : [];
      results.push({
        id: societyId,
        nome,
        leveCount: leveList.length,
        leve: leveList
      });
    }
    results.sort((a, b) => a.nome.localeCompare(b.nome, "it"));
    return res.json({ societies: results });
  } catch (e) {
    logger.error({ err: e }, "public/societies error");
    return res.status(500).json({ error: "server_error" });
  }
});
router8.post("/public/join-request", async (req, res) => {
  const {
    societyId,
    nome,
    cogn,
    email,
    pass,
    titoloFamiliare,
    figlioDichiarato,
    messaggio
  } = req.body;
  if (!nome || !cogn || !email || !pass) {
    return res.status(400).json({ error: "missing_fields" });
  }
  const emailLower = email.toLowerCase().trim();
  const stateKey = societyId === 0 || societyId === "0" ? "fieldos_state_v1" : `fieldos_state_soc_${societyId}`;
  try {
    await pool.execute(CREATE_TABLE_SQL4);
    const [rows] = await pool.execute(
      "SELECT state_json FROM `society_state` WHERE `key` = ?",
      [stateKey]
    );
    if (!rows.length) {
      return res.status(404).json({ error: "society_not_found" });
    }
    let state;
    try {
      state = JSON.parse(rows[0].state_json);
    } catch {
      return res.status(500).json({ error: "state_parse_error" });
    }
    if (state.accettaRichieste === false) {
      return res.status(403).json({ error: "requests_disabled" });
    }
    const usersDB = Array.isArray(state.USERS_DB) ? state.USERS_DB : [];
    if (usersDB.find((u) => (u.email || "").toLowerCase() === emailLower)) {
      return res.status(409).json({ error: "email_already_exists" });
    }
    const pending = Array.isArray(state.pendingUsers) ? state.pendingUsers : [];
    if (pending.find((p) => (p.email || "").toLowerCase() === emailLower)) {
      return res.status(409).json({ error: "request_already_sent" });
    }
    const newId = typeof state.nextPendingUserId === "number" ? state.nextPendingUserId : pending.length + 1;
    const newRequest = {
      id: newId,
      nome: String(nome).trim(),
      cogn: String(cogn).trim(),
      email: emailLower,
      pass: String(pass),
      role: "genitore",
      titoloFamiliare: titoloFamiliare || "papa",
      figli: figlioDichiarato ? [String(figlioDichiarato).trim()] : [],
      figliIds: [],
      leva: "",
      messaggio: String(messaggio || "").trim(),
      fromSearch: true,
      ts: Date.now()
    };
    state.pendingUsers = [...pending, newRequest];
    state.nextPendingUserId = newId + 1;
    const notifiche = Array.isArray(state.notifiche) ? state.notifiche : [];
    let nextNotifId = typeof state.nextNotificaId === "number" ? state.nextNotificaId : notifiche.length + 1;
    usersDB.filter((u) => u.role === "admin" && u.stato === "attivo").forEach((adm) => {
      notifiche.push({
        id: nextNotifId++,
        toUserId: adm.id,
        type: "nuova_richiesta",
        title: "\u{1F4EC} Nuova richiesta di accesso",
        body: `${String(nome).trim()} ${String(cogn).trim()} vuole unirsi alla squadra`,
        ts: Date.now(),
        read: false
      });
    });
    state.notifiche = notifiche;
    state.nextNotificaId = nextNotifId;
    await pool.execute(
      "UPDATE `society_state` SET state_json = ? WHERE `key` = ?",
      [JSON.stringify(state), stateKey]
    );
    logger.info({ societyId, nome, cogn, email: emailLower }, "join-request submitted");
    return res.json({ ok: true });
  } catch (e) {
    logger.error({ err: e }, "join-request error");
    return res.status(500).json({ error: "server_error", detail: e?.message });
  }
});
router8.post("/public/forgot-password", async (req, res) => {
  const { email } = req.body;
  if (!email || typeof email !== "string") {
    return res.status(400).json({ error: "missing_fields" });
  }
  const emailLower = email.toLowerCase().trim();
  try {
    await pool.execute(CREATE_TABLE_SQL4);
    const [rows] = await pool.execute(
      `SELECT \`key\`, state_json FROM \`society_state\`
       WHERE (\`key\` LIKE 'fieldos_state_soc_%' OR \`key\` = 'fieldos_state_v1')
         AND \`key\` NOT LIKE 'fieldos_demo%'`
    );
    for (const row of rows) {
      let state;
      try {
        state = JSON.parse(row.state_json);
      } catch {
        continue;
      }
      const users = state.USERS_DB || [];
      const userIdx = users.findIndex((u) => (u.email || "").toLowerCase() === emailLower);
      if (userIdx === -1) continue;
      const user = users[userIdx];
      const tempPass = _generateTempPassword();
      user.pass = tempPass;
      user.tempPassword = true;
      await pool.execute(
        "UPDATE `society_state` SET state_json = ? WHERE `key` = ?",
        [JSON.stringify(state), row.key]
      );
      logger.info({ email: emailLower }, "forgot-password: temp password set");
      return res.json({ found: true, tempPass, nome: user.nome, cogn: user.cogn });
    }
    return res.json({ found: false });
  } catch (e) {
    logger.error({ err: e }, "forgot-password error");
    return res.status(500).json({ error: "server_error", detail: e?.message });
  }
});
function _generateTempPassword() {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghjkmnpqrstuvwxyz";
  const digits = "23456789";
  const special = "!@#$";
  const all = upper + lower + digits + special;
  const chars = [
    upper[Math.floor(Math.random() * upper.length)],
    lower[Math.floor(Math.random() * lower.length)],
    digits[Math.floor(Math.random() * digits.length)],
    special[Math.floor(Math.random() * special.length)]
  ];
  while (chars.length < 8) chars.push(all[Math.floor(Math.random() * all.length)]);
  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
}
var public_default = router8;

// artifacts/api-server/src/routes/v2/index.ts
import { Router as Router22 } from "express";

// artifacts/api-server/src/routes/v2/schema.ts
var SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS societies (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  nome            VARCHAR(255) NOT NULL,
  citta           VARCHAR(255),
  colore_primario VARCHAR(7)   DEFAULT '#1A7A4A',
  colore_accento  VARCHAR(7)   DEFAULT '#FFD93D',
  logo_url        TEXT,
  codice          VARCHAR(50)  UNIQUE,
  piano                  VARCHAR(50)  DEFAULT 'demo',
  subscription_status    VARCHAR(20)  DEFAULT 'demo',
  demo_scadenza          DATETIME,
  stato                  VARCHAR(20)  DEFAULT 'attiva',
  stripe_customer_id     VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  created_at             TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  society_id      INT          NOT NULL,
  nome            VARCHAR(255) NOT NULL,
  cognome         VARCHAR(255) NOT NULL,
  email           VARCHAR(255) NOT NULL,
  password_hash   VARCHAR(512) NOT NULL,
  ruolo           VARCHAR(50)  NOT NULL,
  leva            VARCHAR(100),
  stato           VARCHAR(20)  DEFAULT 'attivo',
  temp_password   BOOLEAN      DEFAULT FALSE,
  figli           TEXT,
  phone           VARCHAR(50),
  created_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_email_society (email, society_id),
  FOREIGN KEY (society_id) REFERENCES societies(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS players (
  id                   INT AUTO_INCREMENT PRIMARY KEY,
  society_id           INT          NOT NULL,
  nome                 VARCHAR(255) NOT NULL,
  cognome              VARCHAR(255) NOT NULL,
  soprannome           VARCHAR(255),
  numero               INT,
  ruolo_campo          VARCHAR(50),
  anno_nascita         INT,
  leva                 VARCHAR(100),
  telefono_genitore    VARCHAR(50),
  email_genitore       VARCHAR(255),
  note                 TEXT,
  foto_url             TEXT,
  created_at           TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (society_id) REFERENCES societies(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_players (
  user_id    INT NOT NULL,
  player_id  INT NOT NULL,
  PRIMARY KEY (user_id, player_id),
  FOREIGN KEY (user_id)   REFERENCES users(id)   ON DELETE CASCADE,
  FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS leve (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  society_id  INT          NOT NULL,
  nome        VARCHAR(100) NOT NULL,
  ordine      INT          DEFAULT 0,
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_leva (society_id, nome),
  FOREIGN KEY (society_id) REFERENCES societies(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS events (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  society_id  INT          NOT NULL,
  tipo        VARCHAR(50)  NOT NULL,
  titolo      VARCHAR(255) NOT NULL,
  leva        VARCHAR(100),
  luogo       VARCHAR(255),
  data_inizio DATE,
  ora_inizio  TIME,
  data_fine   DATE,
  ora_fine    TIME,
  note        TEXT,
  ricorrente  BOOLEAN      DEFAULT FALSE,
  freq        VARCHAR(50),
  giorni      VARCHAR(100),
  fino_al     DATE,
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (society_id) REFERENCES societies(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS presenze (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  player_id   INT          NOT NULL,
  event_id    INT          NOT NULL,
  stato       VARCHAR(20)  DEFAULT 'assente',
  nota        TEXT,
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_pres (player_id, event_id),
  FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
  FOREIGN KEY (event_id)  REFERENCES events(id)  ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS comunicazioni (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  society_id  INT          NOT NULL,
  autore_id   INT,
  tipo        VARCHAR(50),
  titolo      VARCHAR(255),
  testo       TEXT,
  bacheca     VARCHAR(100),
  leva        VARCHAR(100),
  urgente     BOOLEAN      DEFAULT FALSE,
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (society_id) REFERENCES societies(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS comunicazioni_reads (
  comunicazione_id  INT NOT NULL,
  user_id           INT NOT NULL,
  letto_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (comunicazione_id, user_id),
  FOREIGN KEY (comunicazione_id) REFERENCES comunicazioni(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id)          REFERENCES users(id)         ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  society_id  INT          NOT NULL,
  chat_id     VARCHAR(100) NOT NULL,
  autore_id   INT,
  testo       TEXT,
  foto_url    TEXT,
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_chat (society_id, chat_id, created_at),
  FOREIGN KEY (society_id) REFERENCES societies(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS quote (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  society_id  INT             NOT NULL,
  player_id   INT             NOT NULL,
  importo     DECIMAL(10, 2),
  scadenza    DATE,
  stato       VARCHAR(20)     DEFAULT 'in_attesa',
  leva        VARCHAR(100),
  stagione    VARCHAR(20),
  nota        TEXT,
  created_at  TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (society_id) REFERENCES societies(id) ON DELETE CASCADE,
  FOREIGN KEY (player_id)  REFERENCES players(id)   ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notifiche (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  society_id  INT          NOT NULL,
  user_id     INT,
  tipo        VARCHAR(50),
  titolo      VARCHAR(255),
  messaggio   TEXT,
  letto       BOOLEAN      DEFAULT FALSE,
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (society_id) REFERENCES societies(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  user_id         INT,
  society_key     VARCHAR(255),
  subscription    TEXT NOT NULL,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_push (user_id, society_key)
);
`;
var MIGRATIONS_SQL = `
ALTER TABLE societies ADD COLUMN subscription_status VARCHAR(20) DEFAULT 'demo';
ALTER TABLE users ADD COLUMN phone VARCHAR(50);
ALTER TABLE societies ADD COLUMN stripe_customer_id VARCHAR(255);
ALTER TABLE societies ADD COLUMN stripe_subscription_id VARCHAR(255)
`;
var SEED_SQL = `
INSERT IGNORE INTO societies (nome, citta, codice, piano, stato)
  VALUES ('Polis Genova', 'Genova', 'POLIS18', 'base', 'attiva');

INSERT IGNORE INTO societies (nome, citta, codice, piano, stato)
  VALUES ('Stella Azzurra Demo', 'Italia', 'STELLA25', 'demo', 'attiva');
`;

// artifacts/api-server/src/routes/v2/auth.ts
import { Router as Router9 } from "express";

// artifacts/api-server/src/lib/auth.ts
import { createHmac, pbkdf2Sync, randomBytes, timingSafeEqual } from "crypto";
var JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret-change-in-production";
var JWT_EXPIRY_SECONDS = 7 * 24 * 60 * 60;
function signJWT(payload) {
  const full = { ...payload, exp: Math.floor(Date.now() / 1e3) + JWT_EXPIRY_SECONDS };
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const body = Buffer.from(JSON.stringify(full)).toString("base64url");
  const sig = createHmac("sha256", JWT_SECRET).update(`${header}.${body}`).digest("base64url");
  return `${header}.${body}.${sig}`;
}
function verifyJWT(token) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [header, body, sig] = parts;
    const expected = createHmac("sha256", JWT_SECRET).update(`${header}.${body}`).digest("base64url");
    const sigBuf = Buffer.from(sig, "base64url");
    const expBuf = Buffer.from(expected, "base64url");
    if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) return null;
    const payload = JSON.parse(Buffer.from(body, "base64url").toString());
    if (payload.exp < Math.floor(Date.now() / 1e3)) return null;
    return payload;
  } catch {
    return null;
  }
}
function hashPassword(plain) {
  const salt = randomBytes(16).toString("hex");
  const hash = pbkdf2Sync(plain, salt, 1e5, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}
function verifyPassword(plain, stored) {
  try {
    if (!stored.includes(":")) {
      return plain === stored;
    }
    const [salt, hash] = stored.split(":");
    const attempt = pbkdf2Sync(plain, salt, 1e5, 64, "sha512").toString("hex");
    const hashBuf = Buffer.from(hash, "hex");
    const attemptBuf = Buffer.from(attempt, "hex");
    return hashBuf.length === attemptBuf.length && timingSafeEqual(hashBuf, attemptBuf);
  } catch {
    return false;
  }
}
function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }
  const payload = verifyJWT(auth.slice(7));
  if (!payload) {
    res.status(401).json({ error: "invalid_token" });
    return;
  }
  req.jwtUser = payload;
  next();
}
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.jwtUser) {
      res.status(401).json({ error: "unauthorized" });
      return;
    }
    if (!roles.includes(req.jwtUser.role)) {
      res.status(403).json({ error: "forbidden" });
      return;
    }
    next();
  };
}

// artifacts/api-server/src/routes/v2/auth.ts
var router9 = Router9();
router9.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "missing_fields" });
  const normalizedEmail = email.trim().toLowerCase();
  try {
    const [rows] = await pool.execute(
      `SELECT u.id, u.society_id, u.nome, u.cognome, u.email, u.password_hash,
              u.ruolo, u.leva, u.stato, u.temp_password, u.figli,
              s.nome AS society_nome, s.citta, s.colore_primario, s.colore_accento,
              s.codice, s.piano, s.stato AS society_stato, s.logo_url
       FROM users u
       JOIN societies s ON s.id = u.society_id
       WHERE LOWER(u.email) = ? AND u.stato = 'attivo' AND s.stato = 'attiva'
       LIMIT 1`,
      [normalizedEmail]
    );
    if (!rows.length) return res.status(401).json({ error: "invalid_credentials" });
    const user = rows[0];
    if (!verifyPassword(password, user.password_hash)) {
      return res.status(401).json({ error: "invalid_credentials" });
    }
    const token = signJWT({
      userId: user.id,
      societyId: user.society_id,
      role: user.ruolo,
      email: user.email
    });
    logger.info({ userId: user.id, societyId: user.society_id }, "v2 login ok");
    return res.json({
      token,
      user: {
        id: user.id,
        societyId: user.society_id,
        nome: user.nome,
        cognome: user.cognome,
        email: user.email,
        ruolo: user.ruolo,
        leva: user.leva,
        tempPassword: user.temp_password === 1,
        figli: user.figli ? JSON.parse(user.figli) : []
      },
      society: {
        id: user.society_id,
        nome: user.society_nome,
        citta: user.citta,
        colorePrimario: user.colore_primario,
        coloreAccento: user.colore_accento,
        codice: user.codice,
        piano: user.piano,
        logoUrl: user.logo_url
      }
    });
  } catch (e) {
    logger.error({ err: e }, "v2 login error");
    return res.status(500).json({ error: "server_error" });
  }
});
router9.post("/auth/register", async (req, res) => {
  const { code, nome, cognome, email, password } = req.body;
  if (!code || !nome || !cognome || !email || !password) {
    return res.status(400).json({ error: "missing_fields" });
  }
  if (password.length < 6) return res.status(400).json({ error: "password_too_short" });
  const normalizedEmail = email.trim().toLowerCase();
  const upperCode = code.trim().toUpperCase();
  try {
    const [socRows] = await pool.execute(
      "SELECT id, nome FROM societies WHERE UPPER(codice) = ? AND stato = 'attiva' LIMIT 1",
      [upperCode]
    );
    if (!socRows.length) return res.status(400).json({ error: "invalid_code" });
    const society = socRows[0];
    const [existing] = await pool.execute(
      "SELECT id FROM users WHERE LOWER(email) = ? AND society_id = ?",
      [normalizedEmail, society.id]
    );
    if (existing.length) return res.status(409).json({ error: "email_exists" });
    const hash = hashPassword(password);
    const [result] = await pool.execute(
      "INSERT INTO users (society_id, nome, cognome, email, password_hash, ruolo, stato) VALUES (?, ?, ?, ?, ?, 'genitore', 'pendente')",
      [society.id, nome.trim(), cognome.trim(), normalizedEmail, hash]
    );
    logger.info({ societyId: society.id, email: normalizedEmail }, "v2 register: pending approval");
    return res.status(201).json({ ok: true, societyName: society.nome, pending: true });
  } catch (e) {
    logger.error({ err: e }, "v2 register error");
    return res.status(500).json({ error: "server_error" });
  }
});
router9.post("/auth/verify-code", async (req, res) => {
  const { code } = req.body;
  if (!code?.trim()) return res.status(400).json({ valid: false, error: "missing_code" });
  const upperCode = code.trim().toUpperCase();
  try {
    const [rows] = await pool.execute(
      "SELECT id, nome FROM societies WHERE UPPER(codice) = ? AND stato = 'attiva' LIMIT 1",
      [upperCode]
    );
    if (rows.length) {
      return res.json({ valid: true, societyId: rows[0].id, societyName: rows[0].nome });
    }
    const [blobRows] = await pool.execute(
      `SELECT \`key\`, state_json FROM \`society_state\`
       WHERE (\`key\` LIKE 'fieldos_state_soc_%' OR \`key\` = 'fieldos_state_v1')
         AND \`key\` NOT LIKE 'fieldos_demo%'`
    );
    for (const row of blobRows) {
      let state;
      try {
        state = JSON.parse(row.state_json);
      } catch {
        continue;
      }
      const rowCode = (state.codiceSocieta ?? "").trim().toUpperCase();
      if (!rowCode || rowCode !== upperCode) continue;
      const stateKey = row.key;
      let societyId = 0;
      const match = stateKey.match(/fieldos_state_soc_(\d+)$/);
      if (match) societyId = parseInt(match[1], 10);
      return res.json({ valid: true, societyId, stateKey, societyName: state.nomeSocieta ?? "MyVivaio" });
    }
    return res.json({ valid: false });
  } catch (e) {
    logger.error({ err: e }, "v2 verify-code error");
    return res.status(500).json({ valid: false, error: "server_error" });
  }
});
router9.post("/auth/change-password", requireAuth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) return res.status(400).json({ error: "missing_fields" });
  if (newPassword.length < 6) return res.status(400).json({ error: "password_too_short" });
  const userId = req.jwtUser.userId;
  try {
    const [rows] = await pool.execute(
      "SELECT password_hash FROM users WHERE id = ?",
      [userId]
    );
    if (!rows.length) return res.status(404).json({ error: "not_found" });
    if (!verifyPassword(currentPassword, rows[0].password_hash)) {
      return res.status(401).json({ error: "wrong_current_password" });
    }
    await pool.execute(
      "UPDATE users SET password_hash = ?, temp_password = FALSE WHERE id = ?",
      [hashPassword(newPassword), userId]
    );
    return res.json({ ok: true });
  } catch (e) {
    logger.error({ err: e }, "change-password error");
    return res.status(500).json({ error: "server_error" });
  }
});
var auth_default2 = router9;

// artifacts/api-server/src/routes/v2/self-register.ts
import { Router as Router10 } from "express";

// artifacts/api-server/src/lib/email.ts
var RESEND_API = "https://api.resend.com/emails";
var FROM = "MyVivaio <noreply@myvivaio.app>";
var ADMIN_TO = "info@myvivaio.app";
async function sendMail(to, subject, html) {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    logger.warn("RESEND_API_KEY not set \u2014 email skipped");
    return;
  }
  const resp = await fetch(RESEND_API, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: FROM, to, subject, html })
  });
  if (!resp.ok) {
    const body = await resp.text().catch(() => "");
    throw new Error(`Resend ${resp.status}: ${body}`);
  }
}
async function sendWelcomeEmails(opts) {
  const { nome, cognome, email, phone, nomeSocieta, piano, demoExpires } = opts;
  const pianoLabel = piano === "mister" ? "Mister" : piano === "mister_pro" ? "Mister Pro" : "Societ\xE0";
  const dataReg = (/* @__PURE__ */ new Date()).toLocaleDateString("it-IT", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
  const waLink = phone ? `https://wa.me/${phone.replace(/\D/g, "")}` : null;
  const adminHtml = `
<div style="font-family:sans-serif;max-width:480px;color:#1e293b;">
  <h2 style="color:#1A7A4A;margin-bottom:4px;">\u{1F195} Nuova registrazione \u2014 MyVivaio</h2>
  <p style="color:#64748b;font-size:.85rem;margin-top:0;">${dataReg}</p>
  <table style="border-collapse:collapse;width:100%;margin-top:12px;">
    <tr style="border-bottom:1px solid #f1f5f9;">
      <td style="padding:8px 16px 8px 0;color:#64748b;font-size:.85rem;white-space:nowrap;">Nome</td>
      <td style="padding:8px 0;font-weight:700;">${nome} ${cognome}</td>
    </tr>
    <tr style="border-bottom:1px solid #f1f5f9;">
      <td style="padding:8px 16px 8px 0;color:#64748b;font-size:.85rem;">Email</td>
      <td style="padding:8px 0;"><a href="mailto:${email}" style="color:#1A7A4A;">${email}</a></td>
    </tr>
    <tr style="border-bottom:1px solid #f1f5f9;">
      <td style="padding:8px 16px 8px 0;color:#64748b;font-size:.85rem;">WhatsApp</td>
      <td style="padding:8px 0;">${waLink ? `<a href="${waLink}" style="color:#1A7A4A;font-weight:700;">${phone}</a>` : "\u2014"}</td>
    </tr>
    <tr style="border-bottom:1px solid #f1f5f9;">
      <td style="padding:8px 16px 8px 0;color:#64748b;font-size:.85rem;">Societ\xE0</td>
      <td style="padding:8px 0;font-weight:700;">${nomeSocieta}</td>
    </tr>
    <tr style="border-bottom:1px solid #f1f5f9;">
      <td style="padding:8px 16px 8px 0;color:#64748b;font-size:.85rem;">Piano</td>
      <td style="padding:8px 0;">${pianoLabel}</td>
    </tr>
    <tr>
      <td style="padding:8px 16px 8px 0;color:#64748b;font-size:.85rem;">Demo scade</td>
      <td style="padding:8px 0;">${demoExpires.toLocaleDateString("it-IT", { day: "2-digit", month: "long", year: "numeric" })}</td>
    </tr>
  </table>
  ${waLink ? `<p style="margin-top:20px;"><a href="${waLink}" style="background:#25d366;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:700;font-size:.9rem;">\u{1F4AC} Apri WhatsApp</a></p>` : ""}
</div>`;
  try {
    await sendMail(
      ADMIN_TO,
      `[MyVivaio] Nuova registrazione: ${nome} ${cognome} \u2014 ${nomeSocieta}`,
      adminHtml
    );
    logger.info({ email }, "admin notification sent");
  } catch (e) {
    logger.error({ err: e }, "email send failed (non-blocking)");
  }
}

// artifacts/api-server/src/routes/v2/self-register.ts
var router10 = Router10();
var DEMO_DAYS = {
  mister: 14,
  mister_pro: 14,
  societa: 10
};
var VALID_PIANI = /* @__PURE__ */ new Set(["mister", "mister_pro", "societa"]);
router10.post("/auth/self-register", async (req, res) => {
  const { nome, cognome, email, password, phone, nomeSocieta, citta, piano } = req.body;
  if (!nome?.trim() || !cognome?.trim() || !email?.trim() || !password || !nomeSocieta?.trim()) {
    return res.status(400).json({ error: "missing_fields" });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return res.status(400).json({ error: "invalid_email" });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: "password_too_short" });
  }
  const normalizedEmail = email.trim().toLowerCase();
  const pianoNorm = VALID_PIANI.has(piano ?? "") ? piano : "mister";
  const demoDays = DEMO_DAYS[pianoNorm] ?? 14;
  const demoExpires = new Date(Date.now() + demoDays * 24 * 60 * 60 * 1e3);
  const codice = _generateCode(nomeSocieta.trim());
  let conn = null;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();
    const [dup] = await conn.execute(
      "SELECT id FROM users WHERE LOWER(email) = ? LIMIT 1",
      [normalizedEmail]
    );
    if (dup.length) {
      await conn.rollback();
      return res.status(409).json({ error: "email_exists" });
    }
    const [socRes] = await conn.execute(
      `INSERT INTO societies
         (nome, citta, codice, piano, subscription_status, demo_scadenza, stato)
       VALUES (?, ?, ?, ?, 'demo', ?, 'attiva')`,
      [nomeSocieta.trim(), (citta ?? "").trim(), codice, pianoNorm, demoExpires]
    );
    const societyId = socRes.insertId;
    const hash = hashPassword(password);
    const [userRes] = await conn.execute(
      `INSERT INTO users
         (society_id, nome, cognome, email, password_hash, ruolo, stato, phone)
       VALUES (?, ?, ?, ?, ?, 'admin', 'attivo', ?)`,
      [societyId, nome.trim(), cognome.trim(), normalizedEmail, hash, (phone ?? "").trim()]
    );
    const userId = userRes.insertId;
    await conn.execute(
      "INSERT INTO leve (society_id, nome, ordine) VALUES (?, ?, 0)",
      [societyId, "Prima Squadra"]
    );
    await conn.commit();
    const token = signJWT({ userId, societyId, role: "admin", email: normalizedEmail });
    _superchatWebhook({ phone: (phone ?? "").trim(), nome: nome.trim(), email: normalizedEmail, piano: pianoNorm }).catch(() => {
    });
    sendWelcomeEmails({
      nome: nome.trim(),
      cognome: cognome.trim(),
      email: normalizedEmail,
      phone: (phone ?? "").trim(),
      nomeSocieta: nomeSocieta.trim(),
      piano: pianoNorm,
      demoExpires
    }).catch(() => {
    });
    logger.info({ userId, societyId, email: normalizedEmail, piano: pianoNorm }, "self-register ok");
    return res.status(201).json({
      token,
      user: {
        id: userId,
        societyId,
        nome: nome.trim(),
        cognome: cognome.trim(),
        email: normalizedEmail,
        ruolo: "admin"
      },
      society: {
        id: societyId,
        nome: nomeSocieta.trim(),
        citta: (citta ?? "").trim(),
        piano: pianoNorm,
        codice,
        demoExpires: demoExpires.toISOString(),
        demoDays
      }
    });
  } catch (e) {
    if (conn) await conn.rollback().catch(() => {
    });
    logger.error({ err: e }, "self-register error");
    return res.status(500).json({ error: "server_error", detail: e?.message });
  } finally {
    if (conn) conn.release();
  }
});
async function _superchatWebhook(opts) {
  const url = process.env.SUPERCHAT_WEBHOOK_URL;
  if (!url) return;
  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone: opts.phone, name: opts.nome, email: opts.email, piano: opts.piano })
  });
  if (!resp.ok) {
    logger.warn({ status: resp.status, email: opts.email }, "superchat webhook failed");
  } else {
    logger.info({ email: opts.email }, "superchat webhook ok");
  }
}
function _generateCode(nome) {
  const clean = nome.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 5).padEnd(3, "X");
  const rand = Math.floor(Math.random() * 900 + 100);
  return `${clean}${rand}`;
}
var self_register_default = router10;

// artifacts/api-server/src/routes/v2/society.ts
import { Router as Router11 } from "express";
var router11 = Router11();
router11.get("/society", requireAuth, async (req, res) => {
  const { societyId } = req.jwtUser;
  try {
    const [rows] = await pool.execute(
      "SELECT id, nome, citta, colore_primario, colore_accento, logo_url, codice, piano, demo_scadenza, stato, created_at FROM societies WHERE id = ?",
      [societyId]
    );
    if (!rows.length) return res.status(404).json({ error: "not_found" });
    return res.json(rows[0]);
  } catch (e) {
    logger.error({ err: e }, "GET society error");
    return res.status(500).json({ error: "server_error" });
  }
});
router11.put("/society", requireAuth, requireRole("admin"), async (req, res) => {
  const { societyId } = req.jwtUser;
  const { nome, citta, colorePrimario, coloreAccento, logoUrl, codice } = req.body;
  try {
    if (codice !== void 0) {
      const [conflict] = await pool.execute(
        "SELECT id FROM societies WHERE UPPER(codice) = UPPER(?) AND id != ?",
        [codice, societyId]
      );
      if (conflict.length) return res.status(409).json({ error: "codice_in_uso" });
    }
    await pool.execute(
      `UPDATE societies SET
        nome            = COALESCE(?, nome),
        citta           = COALESCE(?, citta),
        colore_primario = COALESCE(?, colore_primario),
        colore_accento  = COALESCE(?, colore_accento),
        logo_url        = COALESCE(?, logo_url),
        codice          = COALESCE(?, codice)
       WHERE id = ?`,
      [nome ?? null, citta ?? null, colorePrimario ?? null, coloreAccento ?? null, logoUrl ?? null, codice ?? null, societyId]
    );
    const [rows] = await pool.execute(
      "SELECT id, nome, citta, colore_primario, colore_accento, logo_url, codice, piano, stato FROM societies WHERE id = ?",
      [societyId]
    );
    return res.json(rows[0]);
  } catch (e) {
    logger.error({ err: e }, "PUT society error");
    return res.status(500).json({ error: "server_error" });
  }
});
var society_default = router11;

// artifacts/api-server/src/routes/v2/leve.ts
import { Router as Router12 } from "express";
var router12 = Router12();
router12.get("/leve", requireAuth, async (req, res) => {
  const { societyId } = req.jwtUser;
  try {
    const [rows] = await pool.execute(
      "SELECT id, nome, ordine FROM leve WHERE society_id = ? ORDER BY ordine, nome",
      [societyId]
    );
    return res.json(rows);
  } catch (e) {
    logger.error({ err: e }, "GET leve error");
    return res.status(500).json({ error: "server_error" });
  }
});
router12.post("/leve", requireAuth, requireRole("admin"), async (req, res) => {
  const { societyId } = req.jwtUser;
  const { nome, ordine } = req.body;
  if (!nome?.trim()) return res.status(400).json({ error: "nome_required" });
  try {
    const [result] = await pool.execute(
      "INSERT INTO leve (society_id, nome, ordine) VALUES (?, ?, ?)",
      [societyId, nome.trim(), ordine ?? 0]
    );
    return res.status(201).json({ id: result.insertId, nome: nome.trim(), ordine: ordine ?? 0 });
  } catch (e) {
    if (e?.code === "ER_DUP_ENTRY") return res.status(409).json({ error: "leva_exists" });
    logger.error({ err: e }, "POST leva error");
    return res.status(500).json({ error: "server_error" });
  }
});
router12.put("/leve/:id", requireAuth, requireRole("admin"), async (req, res) => {
  const { societyId } = req.jwtUser;
  const { nome, ordine } = req.body;
  try {
    const [result] = await pool.execute(
      "UPDATE leve SET nome = COALESCE(?, nome), ordine = COALESCE(?, ordine) WHERE id = ? AND society_id = ?",
      [nome ?? null, ordine ?? null, req.params.id, societyId]
    );
    if (!result.affectedRows) return res.status(404).json({ error: "not_found" });
    return res.json({ ok: true });
  } catch (e) {
    logger.error({ err: e }, "PUT leva error");
    return res.status(500).json({ error: "server_error" });
  }
});
router12.delete("/leve/:id", requireAuth, requireRole("admin"), async (req, res) => {
  const { societyId } = req.jwtUser;
  try {
    const [result] = await pool.execute(
      "DELETE FROM leve WHERE id = ? AND society_id = ?",
      [req.params.id, societyId]
    );
    if (!result.affectedRows) return res.status(404).json({ error: "not_found" });
    return res.json({ ok: true });
  } catch (e) {
    logger.error({ err: e }, "DELETE leva error");
    return res.status(500).json({ error: "server_error" });
  }
});
var leve_default = router12;

// artifacts/api-server/src/routes/v2/players.ts
import { Router as Router13 } from "express";
var router13 = Router13();
var ADMIN_ROLES = ["admin", "allenatore", "dirigente"];
router13.get("/players", requireAuth, async (req, res) => {
  const { societyId } = req.jwtUser;
  const leva = req.query.leva;
  try {
    const [rows] = await pool.execute(
      `SELECT p.id, p.nome, p.cognome, p.soprannome, p.numero, p.ruolo_campo,
              p.anno_nascita, p.leva, p.telefono_genitore, p.email_genitore,
              p.note, p.foto_url, p.created_at
       FROM players p
       WHERE p.society_id = ?
         ${leva ? "AND p.leva = ?" : ""}
       ORDER BY p.cognome, p.nome`,
      leva ? [societyId, leva] : [societyId]
    );
    return res.json(rows);
  } catch (e) {
    logger.error({ err: e }, "GET players error");
    return res.status(500).json({ error: "server_error" });
  }
});
router13.get("/players/:id", requireAuth, async (req, res) => {
  const { societyId } = req.jwtUser;
  try {
    const [rows] = await pool.execute(
      "SELECT * FROM players WHERE id = ? AND society_id = ?",
      [req.params.id, societyId]
    );
    if (!rows.length) return res.status(404).json({ error: "not_found" });
    return res.json(rows[0]);
  } catch (e) {
    logger.error({ err: e }, "GET player error");
    return res.status(500).json({ error: "server_error" });
  }
});
router13.post("/players", requireAuth, requireRole(...ADMIN_ROLES), async (req, res) => {
  const { societyId } = req.jwtUser;
  const {
    nome,
    cognome,
    soprannome,
    numero,
    ruoloCampo,
    annoNascita,
    leva,
    telefonoGenitore,
    emailGenitore,
    note
  } = req.body;
  if (!nome?.trim() || !cognome?.trim()) {
    return res.status(400).json({ error: "nome_cognome_required" });
  }
  try {
    const [result] = await pool.execute(
      `INSERT INTO players
        (society_id, nome, cognome, soprannome, numero, ruolo_campo, anno_nascita,
         leva, telefono_genitore, email_genitore, note)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        societyId,
        nome.trim(),
        cognome.trim(),
        soprannome ?? null,
        numero ?? null,
        ruoloCampo ?? null,
        annoNascita ?? null,
        leva ?? null,
        telefonoGenitore ?? null,
        emailGenitore ?? null,
        note ?? null
      ]
    );
    return res.status(201).json({ id: result.insertId });
  } catch (e) {
    logger.error({ err: e }, "POST player error");
    return res.status(500).json({ error: "server_error" });
  }
});
router13.put("/players/:id", requireAuth, requireRole(...ADMIN_ROLES), async (req, res) => {
  const { societyId } = req.jwtUser;
  const {
    nome,
    cognome,
    soprannome,
    numero,
    ruoloCampo,
    annoNascita,
    leva,
    telefonoGenitore,
    emailGenitore,
    note,
    fotoUrl
  } = req.body;
  try {
    const [result] = await pool.execute(
      `UPDATE players SET
        nome             = COALESCE(?, nome),
        cognome          = COALESCE(?, cognome),
        soprannome       = COALESCE(?, soprannome),
        numero           = COALESCE(?, numero),
        ruolo_campo      = COALESCE(?, ruolo_campo),
        anno_nascita     = COALESCE(?, anno_nascita),
        leva             = COALESCE(?, leva),
        telefono_genitore = COALESCE(?, telefono_genitore),
        email_genitore   = COALESCE(?, email_genitore),
        note             = COALESCE(?, note),
        foto_url         = COALESCE(?, foto_url)
       WHERE id = ? AND society_id = ?`,
      [
        nome ?? null,
        cognome ?? null,
        soprannome ?? null,
        numero ?? null,
        ruoloCampo ?? null,
        annoNascita ?? null,
        leva ?? null,
        telefonoGenitore ?? null,
        emailGenitore ?? null,
        note ?? null,
        fotoUrl ?? null,
        req.params.id,
        societyId
      ]
    );
    if (!result.affectedRows) return res.status(404).json({ error: "not_found" });
    return res.json({ ok: true });
  } catch (e) {
    logger.error({ err: e }, "PUT player error");
    return res.status(500).json({ error: "server_error" });
  }
});
router13.delete("/players/:id", requireAuth, requireRole("admin"), async (req, res) => {
  const { societyId } = req.jwtUser;
  try {
    const [result] = await pool.execute(
      "DELETE FROM players WHERE id = ? AND society_id = ?",
      [req.params.id, societyId]
    );
    if (!result.affectedRows) return res.status(404).json({ error: "not_found" });
    return res.json({ ok: true });
  } catch (e) {
    logger.error({ err: e }, "DELETE player error");
    return res.status(500).json({ error: "server_error" });
  }
});
var players_default = router13;

// artifacts/api-server/src/routes/v2/users.ts
import { Router as Router14 } from "express";
var router14 = Router14();
router14.get("/users", requireAuth, requireRole("admin"), async (req, res) => {
  const { societyId } = req.jwtUser;
  try {
    const [rows] = await pool.execute(
      `SELECT id, nome, cognome, email, ruolo, leva, stato, temp_password, figli, created_at
       FROM users WHERE society_id = ? ORDER BY cognome, nome`,
      [societyId]
    );
    return res.json(rows.map((u) => ({
      ...u,
      figli: u.figli ? JSON.parse(u.figli) : [],
      tempPassword: u.temp_password === 1
    })));
  } catch (e) {
    logger.error({ err: e }, "GET users error");
    return res.status(500).json({ error: "server_error" });
  }
});
router14.post("/users", requireAuth, requireRole("admin"), async (req, res) => {
  const { societyId } = req.jwtUser;
  const { nome, cognome, email, password, ruolo, leva, figli } = req.body;
  if (!nome || !cognome || !email || !password || !ruolo) {
    return res.status(400).json({ error: "missing_fields" });
  }
  const normalizedEmail = email.trim().toLowerCase();
  const hash = hashPassword(password);
  try {
    const [existing] = await pool.execute(
      "SELECT id FROM users WHERE LOWER(email) = ? AND society_id = ?",
      [normalizedEmail, societyId]
    );
    if (existing.length) return res.status(409).json({ error: "email_exists" });
    const [result] = await pool.execute(
      `INSERT INTO users (society_id, nome, cognome, email, password_hash, ruolo, leva, figli, temp_password)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
      [
        societyId,
        nome.trim(),
        cognome.trim(),
        normalizedEmail,
        hash,
        ruolo,
        leva ?? null,
        figli ? JSON.stringify(figli) : null
      ]
    );
    return res.status(201).json({ id: result.insertId });
  } catch (e) {
    logger.error({ err: e }, "POST user error");
    return res.status(500).json({ error: "server_error" });
  }
});
router14.put("/users/:id", requireAuth, requireRole("admin"), async (req, res) => {
  const { societyId } = req.jwtUser;
  const { nome, cognome, email, password, ruolo, leva, stato, figli } = req.body;
  try {
    const updates = [];
    const params = [];
    if (nome) {
      updates.push("nome = ?");
      params.push(nome.trim());
    }
    if (cognome) {
      updates.push("cognome = ?");
      params.push(cognome.trim());
    }
    if (email) {
      updates.push("email = ?");
      params.push(email.trim().toLowerCase());
    }
    if (ruolo) {
      updates.push("ruolo = ?");
      params.push(ruolo);
    }
    if (leva !== void 0) {
      updates.push("leva = ?");
      params.push(leva ?? null);
    }
    if (stato) {
      updates.push("stato = ?");
      params.push(stato);
    }
    if (figli !== void 0) {
      updates.push("figli = ?");
      params.push(figli ? JSON.stringify(figli) : null);
    }
    if (password) {
      updates.push("password_hash = ?");
      updates.push("temp_password = TRUE");
      params.push(hashPassword(password));
    }
    if (!updates.length) return res.status(400).json({ error: "nothing_to_update" });
    params.push(req.params.id, societyId);
    const [result] = await pool.execute(
      `UPDATE users SET ${updates.join(", ")} WHERE id = ? AND society_id = ?`,
      params
    );
    if (!result.affectedRows) return res.status(404).json({ error: "not_found" });
    return res.json({ ok: true });
  } catch (e) {
    logger.error({ err: e }, "PUT user error");
    return res.status(500).json({ error: "server_error" });
  }
});
router14.delete("/users/:id", requireAuth, requireRole("admin"), async (req, res) => {
  const { societyId, userId } = req.jwtUser;
  if (String(userId) === req.params.id) return res.status(400).json({ error: "cannot_delete_self" });
  try {
    const [result] = await pool.execute(
      "DELETE FROM users WHERE id = ? AND society_id = ?",
      [req.params.id, societyId]
    );
    if (!result.affectedRows) return res.status(404).json({ error: "not_found" });
    return res.json({ ok: true });
  } catch (e) {
    logger.error({ err: e }, "DELETE user error");
    return res.status(500).json({ error: "server_error" });
  }
});
router14.get("/users/pending", requireAuth, requireRole("admin"), async (req, res) => {
  const { societyId } = req.jwtUser;
  try {
    const [rows] = await pool.execute(
      "SELECT id, nome, cognome, email, created_at FROM users WHERE society_id = ? AND stato = 'pendente' ORDER BY created_at DESC",
      [societyId]
    );
    return res.json(rows);
  } catch (e) {
    return res.status(500).json({ error: "server_error" });
  }
});
router14.post("/users/:id/approve", requireAuth, requireRole("admin"), async (req, res) => {
  const { societyId } = req.jwtUser;
  const { ruolo, leva, figli } = req.body;
  try {
    const [result] = await pool.execute(
      `UPDATE users SET stato = 'attivo', ruolo = COALESCE(?, ruolo),
        leva = COALESCE(?, leva), figli = COALESCE(?, figli)
       WHERE id = ? AND society_id = ? AND stato = 'pendente'`,
      [ruolo ?? null, leva ?? null, figli ? JSON.stringify(figli) : null, req.params.id, societyId]
    );
    if (!result.affectedRows) return res.status(404).json({ error: "not_found" });
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: "server_error" });
  }
});
var users_default = router14;

// artifacts/api-server/src/routes/v2/events.ts
import { Router as Router15 } from "express";
var router15 = Router15();
var WRITE_ROLES = ["admin", "allenatore", "dirigente"];
router15.get("/events", requireAuth, async (req, res) => {
  const { societyId } = req.jwtUser;
  const { month, year: year2, leva } = req.query;
  let whereExtra = "";
  const params = [societyId];
  if (month && year2) {
    whereExtra += " AND MONTH(data_inizio) = ? AND YEAR(data_inizio) = ?";
    params.push(parseInt(month), parseInt(year2));
  }
  if (leva) {
    whereExtra += " AND (leva = ? OR leva IS NULL)";
    params.push(leva);
  }
  try {
    const [rows] = await pool.execute(
      `SELECT id, tipo, titolo, leva, luogo, data_inizio, ora_inizio, data_fine, ora_fine,
              note, ricorrente, freq, giorni, fino_al, created_at
       FROM events WHERE society_id = ?${whereExtra} ORDER BY data_inizio, ora_inizio`,
      params
    );
    return res.json(rows);
  } catch (e) {
    logger.error({ err: e }, "GET events error");
    return res.status(500).json({ error: "server_error" });
  }
});
router15.get("/events/:id", requireAuth, async (req, res) => {
  const { societyId } = req.jwtUser;
  try {
    const [rows] = await pool.execute(
      "SELECT * FROM events WHERE id = ? AND society_id = ?",
      [req.params.id, societyId]
    );
    if (!rows.length) return res.status(404).json({ error: "not_found" });
    return res.json(rows[0]);
  } catch (e) {
    return res.status(500).json({ error: "server_error" });
  }
});
router15.post("/events", requireAuth, requireRole(...WRITE_ROLES), async (req, res) => {
  const { societyId } = req.jwtUser;
  const {
    tipo,
    titolo,
    leva,
    luogo,
    dataInizio,
    oraInizio,
    dataFine,
    oraFine,
    note,
    ricorrente,
    freq,
    giorni,
    finoAl
  } = req.body;
  if (!tipo || !titolo) return res.status(400).json({ error: "tipo_titolo_required" });
  try {
    const [result] = await pool.execute(
      `INSERT INTO events (society_id, tipo, titolo, leva, luogo, data_inizio, ora_inizio,
                           data_fine, ora_fine, note, ricorrente, freq, giorni, fino_al)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        societyId,
        tipo,
        titolo,
        leva ?? null,
        luogo ?? null,
        dataInizio ?? null,
        oraInizio ?? null,
        dataFine ?? null,
        oraFine ?? null,
        note ?? null,
        ricorrente ? 1 : 0,
        freq ?? null,
        giorni ?? null,
        finoAl ?? null
      ]
    );
    return res.status(201).json({ id: result.insertId });
  } catch (e) {
    logger.error({ err: e }, "POST event error");
    return res.status(500).json({ error: "server_error" });
  }
});
router15.put("/events/:id", requireAuth, requireRole(...WRITE_ROLES), async (req, res) => {
  const { societyId } = req.jwtUser;
  const {
    tipo,
    titolo,
    leva,
    luogo,
    dataInizio,
    oraInizio,
    dataFine,
    oraFine,
    note,
    ricorrente,
    freq,
    giorni,
    finoAl
  } = req.body;
  try {
    const [result] = await pool.execute(
      `UPDATE events SET
        tipo        = COALESCE(?, tipo),
        titolo      = COALESCE(?, titolo),
        leva        = COALESCE(?, leva),
        luogo       = COALESCE(?, luogo),
        data_inizio = COALESCE(?, data_inizio),
        ora_inizio  = COALESCE(?, ora_inizio),
        data_fine   = COALESCE(?, data_fine),
        ora_fine    = COALESCE(?, ora_fine),
        note        = COALESCE(?, note),
        ricorrente  = COALESCE(?, ricorrente),
        freq        = COALESCE(?, freq),
        giorni      = COALESCE(?, giorni),
        fino_al     = COALESCE(?, fino_al)
       WHERE id = ? AND society_id = ?`,
      [
        tipo ?? null,
        titolo ?? null,
        leva ?? null,
        luogo ?? null,
        dataInizio ?? null,
        oraInizio ?? null,
        dataFine ?? null,
        oraFine ?? null,
        note ?? null,
        ricorrente != null ? ricorrente ? 1 : 0 : null,
        freq ?? null,
        giorni ?? null,
        finoAl ?? null,
        req.params.id,
        societyId
      ]
    );
    if (!result.affectedRows) return res.status(404).json({ error: "not_found" });
    return res.json({ ok: true });
  } catch (e) {
    logger.error({ err: e }, "PUT event error");
    return res.status(500).json({ error: "server_error" });
  }
});
router15.delete("/events/:id", requireAuth, requireRole(...WRITE_ROLES), async (req, res) => {
  const { societyId } = req.jwtUser;
  try {
    const [result] = await pool.execute(
      "DELETE FROM events WHERE id = ? AND society_id = ?",
      [req.params.id, societyId]
    );
    if (!result.affectedRows) return res.status(404).json({ error: "not_found" });
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: "server_error" });
  }
});
var events_default = router15;

// artifacts/api-server/src/routes/v2/presenze.ts
import { Router as Router16 } from "express";
var router16 = Router16();
router16.get("/presenze", requireAuth, async (req, res) => {
  const { societyId } = req.jwtUser;
  const { eventId } = req.query;
  if (!eventId) return res.status(400).json({ error: "eventId_required" });
  try {
    const [rows] = await pool.execute(
      `SELECT pr.id, pr.player_id, pr.event_id, pr.stato, pr.nota, pr.created_at,
              p.nome, p.cognome, p.numero, p.leva
       FROM presenze pr
       JOIN players p ON p.id = pr.player_id
       JOIN events e ON e.id = pr.event_id AND e.society_id = ?
       WHERE pr.event_id = ?
       ORDER BY p.cognome, p.nome`,
      [societyId, eventId]
    );
    return res.json(rows);
  } catch (e) {
    logger.error({ err: e }, "GET presenze error");
    return res.status(500).json({ error: "server_error" });
  }
});
router16.post("/presenze", requireAuth, requireRole("admin", "allenatore", "dirigente"), async (req, res) => {
  const { societyId } = req.jwtUser;
  const { playerId, eventId, stato, nota } = req.body;
  if (!playerId || !eventId || !stato) return res.status(400).json({ error: "missing_fields" });
  try {
    const [evCheck] = await pool.execute(
      "SELECT id FROM events WHERE id = ? AND society_id = ?",
      [eventId, societyId]
    );
    if (!evCheck.length) return res.status(403).json({ error: "forbidden" });
    await pool.execute(
      `INSERT INTO presenze (player_id, event_id, stato, nota)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE stato = VALUES(stato), nota = VALUES(nota)`,
      [playerId, eventId, stato, nota ?? null]
    );
    return res.json({ ok: true });
  } catch (e) {
    logger.error({ err: e }, "POST presenza error");
    return res.status(500).json({ error: "server_error" });
  }
});
router16.post("/presenze/bulk", requireAuth, requireRole("admin", "allenatore", "dirigente"), async (req, res) => {
  const { societyId } = req.jwtUser;
  const { eventId, presenze } = req.body;
  if (!eventId || !Array.isArray(presenze)) return res.status(400).json({ error: "missing_fields" });
  try {
    const [evCheck] = await pool.execute(
      "SELECT id FROM events WHERE id = ? AND society_id = ?",
      [eventId, societyId]
    );
    if (!evCheck.length) return res.status(403).json({ error: "forbidden" });
    if (!presenze.length) return res.json({ ok: true, updated: 0 });
    const values = presenze.map((p) => [p.playerId, eventId, p.stato, p.nota ?? null]);
    const placeholders = values.map(() => "(?, ?, ?, ?)").join(", ");
    const flat = values.flat();
    await pool.execute(
      `INSERT INTO presenze (player_id, event_id, stato, nota) VALUES ${placeholders}
       ON DUPLICATE KEY UPDATE stato = VALUES(stato), nota = VALUES(nota)`,
      flat
    );
    return res.json({ ok: true, updated: presenze.length });
  } catch (e) {
    logger.error({ err: e }, "POST presenze/bulk error");
    return res.status(500).json({ error: "server_error" });
  }
});
var presenze_default = router16;

// artifacts/api-server/src/routes/v2/comunicazioni.ts
import { Router as Router17 } from "express";
var router17 = Router17();
router17.get("/comunicazioni", requireAuth, async (req, res) => {
  const { societyId, userId } = req.jwtUser;
  const { leva, limit = "50", offset = "0" } = req.query;
  try {
    const [rows] = await pool.execute(
      `SELECT c.id, c.autore_id, c.tipo, c.titolo, c.testo, c.bacheca, c.leva,
              c.urgente, c.created_at,
              u.nome AS autore_nome, u.cognome AS autore_cognome,
              MAX(cr.letto_at) IS NOT NULL AS letto
       FROM comunicazioni c
       LEFT JOIN users u ON u.id = c.autore_id
       LEFT JOIN comunicazioni_reads cr ON cr.comunicazione_id = c.id AND cr.user_id = ?
       WHERE c.society_id = ?
         ${leva ? "AND (c.leva = ? OR c.leva IS NULL)" : ""}
       GROUP BY c.id
       ORDER BY c.created_at DESC
       LIMIT ? OFFSET ?`,
      leva ? [userId, societyId, leva, parseInt(limit), parseInt(offset)] : [userId, societyId, parseInt(limit), parseInt(offset)]
    );
    return res.json(rows);
  } catch (e) {
    logger.error({ err: e }, "GET comunicazioni error");
    return res.status(500).json({ error: "server_error" });
  }
});
router17.post("/comunicazioni", requireAuth, requireRole("admin", "allenatore", "dirigente"), async (req, res) => {
  const { societyId, userId } = req.jwtUser;
  const { tipo, titolo, testo, bacheca, leva, urgente } = req.body;
  if (!testo) return res.status(400).json({ error: "testo_required" });
  try {
    const [result] = await pool.execute(
      "INSERT INTO comunicazioni (society_id, autore_id, tipo, titolo, testo, bacheca, leva, urgente) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        societyId,
        userId,
        tipo ?? "comunicazione",
        titolo ?? null,
        testo,
        bacheca ?? "generale",
        leva ?? null,
        urgente ? 1 : 0
      ]
    );
    return res.status(201).json({ id: result.insertId });
  } catch (e) {
    logger.error({ err: e }, "POST comunicazione error");
    return res.status(500).json({ error: "server_error" });
  }
});
router17.post("/comunicazioni/:id/read", requireAuth, async (req, res) => {
  const { userId } = req.jwtUser;
  try {
    await pool.execute(
      "INSERT IGNORE INTO comunicazioni_reads (comunicazione_id, user_id) VALUES (?, ?)",
      [req.params.id, userId]
    );
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: "server_error" });
  }
});
router17.delete("/comunicazioni/:id", requireAuth, requireRole("admin"), async (req, res) => {
  const { societyId } = req.jwtUser;
  try {
    const [result] = await pool.execute(
      "DELETE FROM comunicazioni WHERE id = ? AND society_id = ?",
      [req.params.id, societyId]
    );
    if (!result.affectedRows) return res.status(404).json({ error: "not_found" });
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: "server_error" });
  }
});
var comunicazioni_default = router17;

// artifacts/api-server/src/routes/v2/chat.ts
import { Router as Router18 } from "express";
var router18 = Router18();
router18.get("/chat/:chatId/messages", requireAuth, async (req, res) => {
  const { societyId } = req.jwtUser;
  const { chatId } = req.params;
  const { limit = "50", before } = req.query;
  try {
    const [rows] = await pool.execute(
      `SELECT m.id, m.autore_id, m.testo, m.foto_url, m.created_at,
              u.nome AS autore_nome, u.cognome AS autore_cognome, u.ruolo AS autore_ruolo
       FROM chat_messages m
       LEFT JOIN users u ON u.id = m.autore_id
       WHERE m.society_id = ? AND m.chat_id = ?
         ${before ? "AND m.id < ?" : ""}
       ORDER BY m.created_at DESC
       LIMIT ?`,
      before ? [societyId, chatId, parseInt(before), parseInt(limit)] : [societyId, chatId, parseInt(limit)]
    );
    return res.json(rows.reverse());
  } catch (e) {
    logger.error({ err: e }, "GET chat messages error");
    return res.status(500).json({ error: "server_error" });
  }
});
router18.post("/chat/:chatId/messages", requireAuth, async (req, res) => {
  const { societyId, userId } = req.jwtUser;
  const { chatId } = req.params;
  const { testo, fotoUrl } = req.body;
  if (!testo?.trim() && !fotoUrl) return res.status(400).json({ error: "testo_or_foto_required" });
  try {
    const [result] = await pool.execute(
      "INSERT INTO chat_messages (society_id, chat_id, autore_id, testo, foto_url) VALUES (?, ?, ?, ?, ?)",
      [societyId, chatId, userId, testo?.trim() ?? null, fotoUrl ?? null]
    );
    return res.status(201).json({ id: result.insertId });
  } catch (e) {
    logger.error({ err: e }, "POST chat message error");
    return res.status(500).json({ error: "server_error" });
  }
});
var chat_default = router18;

// artifacts/api-server/src/routes/v2/quote.ts
import { Router as Router19 } from "express";
var router19 = Router19();
router19.get("/quote", requireAuth, requireRole("admin", "dirigente"), async (req, res) => {
  const { societyId } = req.jwtUser;
  const { leva, stato } = req.query;
  try {
    const [rows] = await pool.execute(
      `SELECT q.id, q.player_id, q.importo, q.scadenza, q.stato, q.leva, q.stagione, q.nota,
              p.nome, p.cognome
       FROM quote q
       JOIN players p ON p.id = q.player_id
       WHERE q.society_id = ?
         ${leva ? "AND q.leva = ?" : ""}
         ${stato ? "AND q.stato = ?" : ""}
       ORDER BY q.scadenza, p.cognome`,
      [societyId, ...leva ? [leva] : [], ...stato ? [stato] : []]
    );
    return res.json(rows);
  } catch (e) {
    logger.error({ err: e }, "GET quote error");
    return res.status(500).json({ error: "server_error" });
  }
});
router19.post("/quote", requireAuth, requireRole("admin", "dirigente"), async (req, res) => {
  const { societyId } = req.jwtUser;
  const { playerId, importo, scadenza, stato, leva, stagione, nota } = req.body;
  if (!playerId) return res.status(400).json({ error: "playerId_required" });
  try {
    const [result] = await pool.execute(
      "INSERT INTO quote (society_id, player_id, importo, scadenza, stato, leva, stagione, nota) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        societyId,
        playerId,
        importo ?? null,
        scadenza ?? null,
        stato ?? "in_attesa",
        leva ?? null,
        stagione ?? null,
        nota ?? null
      ]
    );
    return res.status(201).json({ id: result.insertId });
  } catch (e) {
    logger.error({ err: e }, "POST quota error");
    return res.status(500).json({ error: "server_error" });
  }
});
router19.put("/quote/:id", requireAuth, requireRole("admin", "dirigente"), async (req, res) => {
  const { societyId } = req.jwtUser;
  const { importo, scadenza, stato, nota } = req.body;
  try {
    const [result] = await pool.execute(
      `UPDATE quote SET
        importo  = COALESCE(?, importo),
        scadenza = COALESCE(?, scadenza),
        stato    = COALESCE(?, stato),
        nota     = COALESCE(?, nota)
       WHERE id = ? AND society_id = ?`,
      [
        importo ?? null,
        scadenza ?? null,
        stato ?? null,
        nota ?? null,
        req.params.id,
        societyId
      ]
    );
    if (!result.affectedRows) return res.status(404).json({ error: "not_found" });
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: "server_error" });
  }
});
router19.delete("/quote/:id", requireAuth, requireRole("admin", "dirigente"), async (req, res) => {
  const { societyId } = req.jwtUser;
  try {
    await pool.execute("DELETE FROM quote WHERE id = ? AND society_id = ?", [req.params.id, societyId]);
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: "server_error" });
  }
});
var quote_default = router19;

// artifacts/api-server/src/routes/v2/migrate.ts
import { Router as Router20 } from "express";
var router20 = Router20();
router20.post("/migrate", requireAuth, requireRole("admin"), async (req, res) => {
  const { societyId } = req.jwtUser;
  const blob = req.body;
  if (!blob || typeof blob !== "object") {
    return res.status(400).json({ error: "body_must_be_blob_json" });
  }
  const report = {};
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    if (blob.nomeSocieta || blob.coloriPrimari) {
      await conn.execute(
        `UPDATE societies SET
          nome            = COALESCE(?, nome),
          colore_primario = COALESCE(?, colore_primario),
          colore_accento  = COALESCE(?, colore_accento),
          codice          = COALESCE(NULLIF(?, ''), codice)
         WHERE id = ?`,
        [
          blob.nomeSocieta ?? null,
          blob.coloriPrimari ?? null,
          blob.coloriAccento ?? null,
          blob.codiceSocieta ?? null,
          societyId
        ]
      );
    }
    let leveCount = 0;
    if (Array.isArray(blob.leve)) {
      for (const l of blob.leve) {
        if (!l?.trim()) continue;
        await conn.execute(
          "INSERT IGNORE INTO leve (society_id, nome) VALUES (?, ?)",
          [societyId, l.trim()]
        );
        leveCount++;
      }
    }
    report.leve = leveCount;
    const userIdMap = /* @__PURE__ */ new Map();
    let usersCount = 0;
    if (Array.isArray(blob.USERS_DB)) {
      for (const u of blob.USERS_DB) {
        if (!u.email || !u.nome) continue;
        const normalEmail = u.email.toLowerCase().trim();
        const figli = Array.isArray(u.figli) ? u.figli : u.figlio ? [u.figlio] : [];
        const roleMap = {
          admin: "admin",
          allenatore: "allenatore",
          dirigente: "dirigente",
          genitore: "genitore",
          nonno: "nonno",
          giocatore: "giocatore"
        };
        const ruolo = roleMap[u.role] ?? "genitore";
        const pwdHash = u.pass && !u.pass.includes(":") ? hashPassword(u.pass) : u.pass ?? hashPassword("changeme");
        try {
          const [existing] = await conn.execute(
            "SELECT id FROM users WHERE LOWER(email) = ? AND society_id = ?",
            [normalEmail, societyId]
          );
          let dbId;
          if (existing.length) {
            dbId = existing[0].id;
            await conn.execute(
              "UPDATE users SET nome = ?, cognome = ?, ruolo = ?, leva = ?, stato = ?, figli = ?, temp_password = ? WHERE id = ?",
              [
                u.nome,
                u.cogn ?? "",
                ruolo,
                u.leva ?? null,
                u.stato === "sospeso" ? "sospeso" : "attivo",
                figli.length ? JSON.stringify(figli) : null,
                u.tempPassword ? 1 : 0,
                dbId
              ]
            );
          } else {
            const [ins] = await conn.execute(
              "INSERT INTO users (society_id, nome, cognome, email, password_hash, ruolo, leva, stato, figli, temp_password) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
              [
                societyId,
                u.nome,
                u.cogn ?? "",
                normalEmail,
                pwdHash,
                ruolo,
                u.leva ?? null,
                u.stato === "sospeso" ? "sospeso" : "attivo",
                figli.length ? JSON.stringify(figli) : null,
                u.tempPassword ? 1 : 0
              ]
            );
            dbId = ins.insertId;
            usersCount++;
          }
          userIdMap.set(u.id, dbId);
        } catch (e) {
          logger.warn({ email: normalEmail, err: e?.message }, "migrate: skip user");
        }
      }
    }
    report.users = usersCount;
    const playerIdMap = /* @__PURE__ */ new Map();
    let playersCount = 0;
    if (Array.isArray(blob.players)) {
      for (const p of blob.players) {
        if (!p.nome) continue;
        const [existing] = await conn.execute(
          "SELECT id FROM players WHERE society_id = ? AND nome = ? AND cognome = ? AND COALESCE(leva,'') = COALESCE(?,'') LIMIT 1",
          [societyId, p.nome, p.cogn ?? "", p.leva ?? null]
        );
        let dbId;
        if (existing.length) {
          dbId = existing[0].id;
        } else {
          const [ins] = await conn.execute(
            "INSERT INTO players (society_id, nome, cognome, soprannome, numero, ruolo_campo, anno_nascita, leva, telefono_genitore, email_genitore, note) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [
              societyId,
              p.nome,
              p.cogn ?? "",
              p.sopran ?? null,
              p.numero ?? null,
              p.ruolo ?? null,
              p.anno ?? null,
              p.leva ?? null,
              p.telGenitore ?? null,
              p.emailGenitore ?? null,
              p.note ?? null
            ]
          );
          dbId = ins.insertId;
          playersCount++;
        }
        playerIdMap.set(p.id, dbId);
      }
    }
    report.players = playersCount;
    const eventIdMap = /* @__PURE__ */ new Map();
    let eventsCount = 0;
    if (Array.isArray(blob.events)) {
      for (const e of blob.events) {
        if (!e.type) continue;
        const typeMap = {
          allenamento: "allenamento",
          partita: "partita",
          campionato: "partita",
          torneo: "torneo",
          altro: "altro",
          allenamento_portieri: "allenamento"
        };
        const tipo = typeMap[e.type] ?? e.type;
        const titolo = e.title ?? tipo;
        const [ins] = await conn.execute(
          "INSERT INTO events (society_id, tipo, titolo, leva, luogo, data_inizio, ora_inizio, data_fine, ora_fine, note, ricorrente, freq, giorni, fino_al) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
          [
            societyId,
            tipo,
            titolo,
            e.leva ?? null,
            e.luogo ?? null,
            e.date ?? null,
            e.start ?? null,
            e.endDate ?? null,
            e.end ?? null,
            e.note ?? null,
            e.recurring ? 1 : 0,
            e.freq ?? null,
            e.days ?? null,
            e.until ?? null
          ]
        );
        eventIdMap.set(e.id, ins.insertId);
        eventsCount++;
      }
    }
    report.events = eventsCount;
    let commCount = 0;
    if (Array.isArray(blob.comunicazioni)) {
      for (const c of blob.comunicazioni) {
        const body = c.testo ?? c.text ?? "";
        if (!body) continue;
        const authorDbId = c.userId ? userIdMap.get(c.userId) ?? null : null;
        await conn.execute(
          "INSERT INTO comunicazioni (society_id, autore_id, tipo, titolo, testo, bacheca, leva, urgente, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
          [
            societyId,
            authorDbId,
            c.tipo ?? "comunicazione",
            c.titolo ?? null,
            body,
            c.bacheca ?? "generale",
            c.leva ?? null,
            c.urgente ? 1 : 0,
            c.date ? new Date(c.date) : /* @__PURE__ */ new Date()
          ]
        );
        commCount++;
      }
    }
    report.comunicazioni = commCount;
    let chatCount = 0;
    if (blob.chatMessaggi && typeof blob.chatMessaggi === "object") {
      for (const [chatId, messages] of Object.entries(blob.chatMessaggi)) {
        if (!Array.isArray(messages)) continue;
        for (const m of messages) {
          const testo = m.testo ?? m.text ?? "";
          const authorDbId = m.autoreId ? userIdMap.get(m.autoreId) ?? null : null;
          await conn.execute(
            "INSERT INTO chat_messages (society_id, chat_id, autore_id, testo, foto_url, created_at) VALUES (?, ?, ?, ?, ?, ?)",
            [
              societyId,
              chatId,
              authorDbId,
              testo || null,
              m.foto ?? null,
              m.ts ? new Date(m.ts) : m.date ? new Date(m.date) : /* @__PURE__ */ new Date()
            ]
          );
          chatCount++;
        }
      }
    }
    report.chatMessages = chatCount;
    await conn.commit();
    logger.info({ societyId, report }, "v2 migrate: completed");
    return res.json({ ok: true, report });
  } catch (e) {
    await conn.rollback();
    logger.error({ err: e }, "v2 migrate error");
    return res.status(500).json({ error: "migrate_failed", detail: e?.message });
  } finally {
    conn.release();
  }
});
var migrate_default = router20;

// artifacts/api-server/src/routes/v2/stripe.ts
import { Router as Router21 } from "express";
import { createHmac as createHmac2, timingSafeEqual as timingSafeEqual2 } from "node:crypto";
var router21 = Router21();
var STRIPE_API = "https://api.stripe.com/v1";
var PRICE_ENV = {
  mister: { mensile: "STRIPE_PRICE_MISTER_MENSILE", annuale: "STRIPE_PRICE_MISTER_ANNUALE" },
  mister_pro: { mensile: "STRIPE_PRICE_MISTER_PRO_MENSILE", annuale: "STRIPE_PRICE_MISTER_PRO_ANNUALE" },
  societa: { mensile: "STRIPE_PRICE_SOCIETA_MENSILE", annuale: "STRIPE_PRICE_SOCIETA_ANNUALE" }
};
var PRORATA_PCT = {
  7: 100,
  // Agosto
  8: 92,
  // Settembre
  9: 83,
  // Ottobre
  10: 75,
  // Novembre
  11: 67,
  // Dicembre
  0: 58,
  // Gennaio
  1: 50,
  // Febbraio
  2: 42,
  // Marzo
  3: 33,
  // Aprile
  4: 25,
  // Maggio
  5: null,
  // Giugno — solo mensile
  6: null
  // Luglio  — solo mensile
};
function nextAugFirst() {
  const now = /* @__PURE__ */ new Date();
  const month = now.getUTCMonth();
  const day = now.getUTCDate();
  const isToday = month === 7 && day === 1;
  const anchorYear = month >= 7 && !isToday ? now.getUTCFullYear() + 1 : month < 7 ? now.getUTCFullYear() : now.getUTCFullYear() + 1;
  return Math.floor(Date.UTC(anchorYear, 7, 1) / 1e3);
}
function getPriceId(piano, intervallo) {
  return process.env[PRICE_ENV[piano]?.[intervallo] ?? ""] || null;
}
function priceIdToPiano(priceId) {
  for (const [piano, intervals] of Object.entries(PRICE_ENV)) {
    for (const envVar of Object.values(intervals)) {
      if (process.env[envVar] === priceId) return piano;
    }
  }
  return null;
}
function stripeEncode(obj) {
  return Object.entries(obj).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`).join("&");
}
async function stripePost(path2, params) {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY not set");
  const resp = await fetch(`${STRIPE_API}${path2}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: stripeEncode(params)
  });
  const data = await resp.json();
  if (!resp.ok) throw new Error(data?.error?.message ?? `Stripe ${resp.status}`);
  return data;
}
async function stripeGet(path2) {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY not set");
  const resp = await fetch(`${STRIPE_API}${path2}`, {
    headers: { Authorization: `Bearer ${key}` }
  });
  const data = await resp.json();
  if (!resp.ok) throw new Error(data?.error?.message ?? `Stripe ${resp.status}`);
  return data;
}
router21.post("/stripe/create-checkout", async (req, res) => {
  const { piano, intervallo, societyId, email } = req.body;
  if (!piano || !intervallo || !societyId) {
    return res.status(400).json({ error: "missing_fields" });
  }
  if (String(intervallo) === "annuale") {
    const month = (/* @__PURE__ */ new Date()).getUTCMonth();
    if (PRORATA_PCT[month] === null) {
      return res.status(400).json({
        error: "annual_not_available",
        detail: "Il piano annuale non \xE8 disponibile in giugno e luglio. Usa il piano mensile."
      });
    }
  }
  const priceId = getPriceId(String(piano), String(intervallo));
  if (!priceId) {
    return res.status(400).json({ error: "invalid_plan_or_interval" });
  }
  const appUrl = process.env.APP_URL ?? "https://workspacefieldos-production.up.railway.app";
  const params = {
    mode: "subscription",
    "payment_method_types[0]": "card",
    "line_items[0][price]": priceId,
    "line_items[0][quantity]": 1,
    "success_url": `${appUrl}/payment-success?piano=${encodeURIComponent(String(piano))}&intervallo=${encodeURIComponent(String(intervallo))}`,
    "cancel_url": `${appUrl}/subscribe`,
    "metadata[societyId]": String(societyId),
    "metadata[piano]": String(piano),
    "metadata[intervallo]": String(intervallo)
  };
  if (email) params["customer_email"] = String(email);
  if (String(intervallo) === "annuale") {
    params["subscription_data[billing_cycle_anchor]"] = nextAugFirst();
  }
  try {
    const session = await stripePost("/checkout/sessions", params);
    logger.info({ societyId, piano, intervallo }, "stripe checkout session created");
    return res.json({ url: session.url });
  } catch (e) {
    logger.error({ err: e }, "stripe create-checkout error");
    return res.status(500).json({ error: "stripe_error", detail: e?.message });
  }
});
router21.post("/stripe/webhook", async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    logger.warn("STRIPE_WEBHOOK_SECRET not set \u2014 webhook skipped");
    return res.sendStatus(200);
  }
  const rawBody = req.rawBody;
  if (!sig || !rawBody) {
    return res.status(400).json({ error: "missing_signature" });
  }
  const parts = Object.fromEntries(sig.split(",").map((p) => p.split("=")));
  const timestamp2 = parts["t"];
  const v1 = parts["v1"];
  if (!timestamp2 || !v1) {
    return res.status(400).json({ error: "invalid_signature_format" });
  }
  if (Math.abs(Date.now() / 1e3 - Number(timestamp2)) > 300) {
    return res.status(400).json({ error: "stale_event" });
  }
  const signedPayload = `${timestamp2}.${rawBody.toString("utf8")}`;
  const expected = createHmac2("sha256", secret).update(signedPayload).digest("hex");
  const expectedBuf = Buffer.from(expected, "hex");
  const receivedBuf = Buffer.from(v1, "hex");
  if (expectedBuf.length !== receivedBuf.length || !timingSafeEqual2(expectedBuf, receivedBuf)) {
    logger.warn({ sig }, "stripe webhook signature mismatch");
    return res.status(400).json({ error: "invalid_signature" });
  }
  const event = req.body;
  logger.info({ type: event?.type }, "stripe webhook received");
  if (event?.type === "checkout.session.completed") {
    const session = event.data?.object;
    const societyId = session?.metadata?.societyId;
    const piano = session?.metadata?.piano;
    const customerId = session?.customer;
    const subId = session?.subscription;
    if (societyId && customerId) {
      try {
        await pool.execute(
          `UPDATE societies
           SET subscription_status    = 'active',
               piano                  = COALESCE(?, piano),
               stripe_customer_id     = ?,
               stripe_subscription_id = ?
           WHERE id = ?`,
          [piano ?? null, customerId, subId ?? null, Number(societyId)]
        );
        logger.info({ societyId, customerId, piano }, "stripe: society activated");
      } catch (e) {
        logger.error({ err: e }, "stripe: DB update failed on checkout.session.completed");
      }
    }
  }
  if (event?.type === "customer.subscription.updated") {
    const sub = event.data?.object;
    const subId = sub?.id;
    const priceId = sub?.items?.data?.[0]?.price?.id;
    const piano = priceId ? priceIdToPiano(priceId) : null;
    const status = sub?.status;
    if (subId) {
      try {
        const dbStatus = status === "active" ? "active" : status === "past_due" ? "past_due" : "canceled";
        await pool.execute(
          `UPDATE societies
           SET subscription_status = ?,
               piano               = COALESCE(?, piano)
           WHERE stripe_subscription_id = ?`,
          [dbStatus, piano ?? null, subId]
        );
        logger.info({ subId, piano, status }, "stripe: subscription updated");
      } catch (e) {
        logger.error({ err: e }, "stripe: DB update failed on subscription.updated");
      }
    }
  }
  if (event?.type === "customer.subscription.deleted") {
    const sub = event.data?.object;
    const subId = sub?.id;
    if (subId) {
      try {
        await pool.execute(
          `UPDATE societies
           SET subscription_status = 'canceled'
           WHERE stripe_subscription_id = ?`,
          [subId]
        );
        logger.info({ subId }, "stripe: subscription canceled");
      } catch (e) {
        logger.error({ err: e }, "stripe: DB update failed on subscription.deleted");
      }
    }
  }
  return res.sendStatus(200);
});
router21.get("/stripe/subscription", async (req, res) => {
  const societyId = req.query.societyId;
  if (!societyId) return res.status(400).json({ error: "missing_societyId" });
  try {
    const [rows] = await pool.execute(
      `SELECT subscription_status, piano, stripe_subscription_id, stripe_customer_id, demo_scadenza
       FROM societies WHERE id = ?`,
      [Number(societyId)]
    );
    if (!rows.length) return res.status(404).json({ error: "society_not_found" });
    const soc = rows[0];
    let currentPeriodEnd = null;
    let cancelAtPeriodEnd = null;
    let intervallo = null;
    if (soc.stripe_subscription_id && process.env.STRIPE_SECRET_KEY) {
      try {
        const sub = await stripeGet(`/subscriptions/${soc.stripe_subscription_id}`);
        currentPeriodEnd = sub.current_period_end ?? null;
        cancelAtPeriodEnd = sub.cancel_at_period_end ?? null;
        const priceId = sub.items?.data?.[0]?.price?.id;
        if (priceId) {
          for (const [, intervals] of Object.entries(PRICE_ENV)) {
            if (process.env[intervals.mensile] === priceId) {
              intervallo = "mensile";
              break;
            }
            if (process.env[intervals.annuale] === priceId) {
              intervallo = "annuale";
              break;
            }
          }
        }
      } catch {
      }
    }
    return res.json({
      status: soc.subscription_status,
      piano: soc.piano,
      demoScadenza: soc.demo_scadenza,
      currentPeriodEnd,
      cancelAtPeriodEnd,
      intervallo
    });
  } catch (e) {
    logger.error({ err: e }, "stripe: subscription fetch error");
    return res.status(500).json({ error: "server_error" });
  }
});
router21.post("/stripe/customer-portal", async (req, res) => {
  const { societyId } = req.body;
  if (!societyId) return res.status(400).json({ error: "missing_societyId" });
  try {
    const [rows] = await pool.execute(
      `SELECT stripe_customer_id FROM societies WHERE id = ?`,
      [Number(societyId)]
    );
    const customerId = rows[0]?.stripe_customer_id;
    if (!customerId) return res.status(400).json({ error: "no_stripe_customer" });
    const appUrl = process.env.APP_URL ?? "https://workspacefieldos-production.up.railway.app";
    const session = await stripePost("/billing_portal/sessions", {
      customer: customerId,
      return_url: `${appUrl}/account`
    });
    logger.info({ societyId }, "stripe: customer portal session created");
    return res.json({ url: session.url });
  } catch (e) {
    logger.error({ err: e }, "stripe: customer-portal error");
    return res.status(500).json({ error: "stripe_error", detail: e?.message });
  }
});
router21.post("/stripe/cancel", async (req, res) => {
  const { societyId } = req.body;
  if (!societyId) return res.status(400).json({ error: "missing_societyId" });
  try {
    const [rows] = await pool.execute(
      `SELECT stripe_subscription_id FROM societies WHERE id = ?`,
      [Number(societyId)]
    );
    const subId = rows[0]?.stripe_subscription_id;
    if (!subId) return res.status(400).json({ error: "no_subscription" });
    await stripePost(`/subscriptions/${subId}`, { cancel_at_period_end: "true" });
    logger.info({ societyId, subId }, "stripe: subscription cancel_at_period_end set");
    return res.json({ ok: true });
  } catch (e) {
    logger.error({ err: e }, "stripe: cancel error");
    return res.status(500).json({ error: "stripe_error", detail: e?.message });
  }
});
var stripe_default = router21;

// artifacts/api-server/src/routes/v2/index.ts
var router22 = Router22();
var _schemaReady = false;
async function ensureSchema() {
  if (_schemaReady) return;
  const statements = SCHEMA_SQL.split(";").map((s) => s.trim()).filter(Boolean);
  for (const sql2 of statements) {
    await pool.execute(sql2);
  }
  const migrations = MIGRATIONS_SQL.split(";").map((s) => s.trim()).filter(Boolean);
  for (const sql2 of migrations) {
    await pool.execute(sql2).catch((e) => {
      if (e?.errno !== 1060) logger.warn({ errno: e?.errno, msg: e?.message?.slice(0, 80) }, "migration warning");
    });
  }
  const [rows] = await pool.execute("SELECT COUNT(*) AS n FROM societies");
  if (rows[0].n === 0) {
    const seeds = SEED_SQL.split(";").map((s) => s.trim()).filter(Boolean);
    for (const sql2 of seeds) {
      await pool.execute(sql2);
    }
    logger.info("v2: seed data inserted");
  }
  _schemaReady = true;
  logger.info("v2: schema ready");
}
router22.use(async (_req, _res, next) => {
  try {
    await ensureSchema();
    next();
  } catch (e) {
    logger.error({ err: e }, "v2: schema init failed");
    next();
  }
});
router22.use(auth_default2);
router22.use(self_register_default);
router22.use(society_default);
router22.use(leve_default);
router22.use(players_default);
router22.use(users_default);
router22.use(events_default);
router22.use(presenze_default);
router22.use(comunicazioni_default);
router22.use(chat_default);
router22.use(quote_default);
router22.use(migrate_default);
router22.use(stripe_default);
var v2_default = router22;

// artifacts/api-server/src/routes/index.ts
var router23 = Router23();
router23.use(health_default);
router23.use(login_default);
router23.use(auth_default);
router23.use(state_default);
router23.use(assist_default);
router23.use(push_default);
router23.use(upload_default);
router23.use(public_default);
router23.use("/v2", v2_default);
var routes_default = router23;

// artifacts/api-server/src/app.ts
var app = express();
app.use(
  (0, import_pino_http.default)({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0]
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode
        };
      }
    }
  })
);
app.use((0, import_cors.default)());
app.use(express.json({
  limit: "10mb",
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: true }));
app.use("/api", routes_default);
var staticDir = path.join(process.cwd(), "artifacts", "fieldos", "dist", "public");
if (existsSync(staticDir)) {
  app.use(express.static(staticDir));
  app.get("*path", (_req, res) => {
    res.sendFile(path.join(staticDir, "index.html"));
  });
}
var app_default = app;

// artifacts/api-server/src/index.ts
var rawPort = process.env["PORT"];
if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided."
  );
}
var port = Number(rawPort);
if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}
function startListening() {
  app_default.listen(port, (err) => {
    if (err) {
      logger.error({ err }, "Error listening on port");
      process.exit(1);
    }
    logger.info({ port }, "Server listening");
  });
}
async function ensureSchema2() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS \`society_state\` (
      \`key\`      VARCHAR(255) PRIMARY KEY,
      state_json  LONGTEXT NOT NULL,
      is_demo     TINYINT(1) NOT NULL DEFAULT 0,
      updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
  try {
    await pool.query(
      "ALTER TABLE `society_state` ADD COLUMN `is_demo` TINYINT(1) NOT NULL DEFAULT 0"
    );
    logger.info("DB: added is_demo column");
  } catch (e) {
    if (e?.errno !== 1060) logger.warn({ errno: e?.errno }, "DB: is_demo migration skipped");
  }
  logger.info("DB schema ready");
}
startListening();
if (process.env.DATABASE_URL) {
  ensureSchema2().catch((err) => {
    logger.error(
      { code: err?.code, sqlMessage: err?.sqlMessage, message: err?.message },
      "DB schema init failed"
    );
  });
} else {
  logger.warn(
    "DATABASE_URL not set \u2014 cross-device sync disabled"
  );
}
/*! Bundled license information:

object-assign/index.js:
  (*
  object-assign
  (c) Sindre Sorhus
  @license MIT
  *)

vary/index.js:
  (*!
   * vary
   * Copyright(c) 2014-2017 Douglas Christopher Wilson
   * MIT Licensed
   *)

safe-buffer/index.js:
  (*! safe-buffer. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> *)
*/
