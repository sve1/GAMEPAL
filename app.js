"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return e; }; var t, e = {}, r = Object.prototype, n = r.hasOwnProperty, o = Object.defineProperty || function (t, e, r) { t[e] = r.value; }, i = "function" == typeof Symbol ? Symbol : {}, a = i.iterator || "@@iterator", c = i.asyncIterator || "@@asyncIterator", u = i.toStringTag || "@@toStringTag"; function define(t, e, r) { return Object.defineProperty(t, e, { value: r, enumerable: !0, configurable: !0, writable: !0 }), t[e]; } try { define({}, ""); } catch (t) { define = function define(t, e, r) { return t[e] = r; }; } function wrap(t, e, r, n) { var i = e && e.prototype instanceof Generator ? e : Generator, a = Object.create(i.prototype), c = new Context(n || []); return o(a, "_invoke", { value: makeInvokeMethod(t, r, c) }), a; } function tryCatch(t, e, r) { try { return { type: "normal", arg: t.call(e, r) }; } catch (t) { return { type: "throw", arg: t }; } } e.wrap = wrap; var h = "suspendedStart", l = "suspendedYield", f = "executing", s = "completed", y = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var p = {}; define(p, a, function () { return this; }); var d = Object.getPrototypeOf, v = d && d(d(values([]))); v && v !== r && n.call(v, a) && (p = v); var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p); function defineIteratorMethods(t) { ["next", "throw", "return"].forEach(function (e) { define(t, e, function (t) { return this._invoke(e, t); }); }); } function AsyncIterator(t, e) { function invoke(r, o, i, a) { var c = tryCatch(t[r], t, o); if ("throw" !== c.type) { var u = c.arg, h = u.value; return h && "object" == _typeof(h) && n.call(h, "__await") ? e.resolve(h.__await).then(function (t) { invoke("next", t, i, a); }, function (t) { invoke("throw", t, i, a); }) : e.resolve(h).then(function (t) { u.value = t, i(u); }, function (t) { return invoke("throw", t, i, a); }); } a(c.arg); } var r; o(this, "_invoke", { value: function value(t, n) { function callInvokeWithMethodAndArg() { return new e(function (e, r) { invoke(t, n, e, r); }); } return r = r ? r.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(e, r, n) { var o = h; return function (i, a) { if (o === f) throw new Error("Generator is already running"); if (o === s) { if ("throw" === i) throw a; return { value: t, done: !0 }; } for (n.method = i, n.arg = a;;) { var c = n.delegate; if (c) { var u = maybeInvokeDelegate(c, n); if (u) { if (u === y) continue; return u; } } if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) { if (o === h) throw o = s, n.arg; n.dispatchException(n.arg); } else "return" === n.method && n.abrupt("return", n.arg); o = f; var p = tryCatch(e, r, n); if ("normal" === p.type) { if (o = n.done ? s : l, p.arg === y) continue; return { value: p.arg, done: n.done }; } "throw" === p.type && (o = s, n.method = "throw", n.arg = p.arg); } }; } function maybeInvokeDelegate(e, r) { var n = r.method, o = e.iterator[n]; if (o === t) return r.delegate = null, "throw" === n && e.iterator["return"] && (r.method = "return", r.arg = t, maybeInvokeDelegate(e, r), "throw" === r.method) || "return" !== n && (r.method = "throw", r.arg = new TypeError("The iterator does not provide a '" + n + "' method")), y; var i = tryCatch(o, e.iterator, r.arg); if ("throw" === i.type) return r.method = "throw", r.arg = i.arg, r.delegate = null, y; var a = i.arg; return a ? a.done ? (r[e.resultName] = a.value, r.next = e.nextLoc, "return" !== r.method && (r.method = "next", r.arg = t), r.delegate = null, y) : a : (r.method = "throw", r.arg = new TypeError("iterator result is not an object"), r.delegate = null, y); } function pushTryEntry(t) { var e = { tryLoc: t[0] }; 1 in t && (e.catchLoc = t[1]), 2 in t && (e.finallyLoc = t[2], e.afterLoc = t[3]), this.tryEntries.push(e); } function resetTryEntry(t) { var e = t.completion || {}; e.type = "normal", delete e.arg, t.completion = e; } function Context(t) { this.tryEntries = [{ tryLoc: "root" }], t.forEach(pushTryEntry, this), this.reset(!0); } function values(e) { if (e || "" === e) { var r = e[a]; if (r) return r.call(e); if ("function" == typeof e.next) return e; if (!isNaN(e.length)) { var o = -1, i = function next() { for (; ++o < e.length;) if (n.call(e, o)) return next.value = e[o], next.done = !1, next; return next.value = t, next.done = !0, next; }; return i.next = i; } } throw new TypeError(_typeof(e) + " is not iterable"); } return GeneratorFunction.prototype = GeneratorFunctionPrototype, o(g, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), o(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, "GeneratorFunction"), e.isGeneratorFunction = function (t) { var e = "function" == typeof t && t.constructor; return !!e && (e === GeneratorFunction || "GeneratorFunction" === (e.displayName || e.name)); }, e.mark = function (t) { return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, define(t, u, "GeneratorFunction")), t.prototype = Object.create(g), t; }, e.awrap = function (t) { return { __await: t }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c, function () { return this; }), e.AsyncIterator = AsyncIterator, e.async = function (t, r, n, o, i) { void 0 === i && (i = Promise); var a = new AsyncIterator(wrap(t, r, n, o), i); return e.isGeneratorFunction(r) ? a : a.next().then(function (t) { return t.done ? t.value : a.next(); }); }, defineIteratorMethods(g), define(g, u, "Generator"), define(g, a, function () { return this; }), define(g, "toString", function () { return "[object Generator]"; }), e.keys = function (t) { var e = Object(t), r = []; for (var n in e) r.push(n); return r.reverse(), function next() { for (; r.length;) { var t = r.pop(); if (t in e) return next.value = t, next.done = !1, next; } return next.done = !0, next; }; }, e.values = values, Context.prototype = { constructor: Context, reset: function reset(e) { if (this.prev = 0, this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(resetTryEntry), !e) for (var r in this) "t" === r.charAt(0) && n.call(this, r) && !isNaN(+r.slice(1)) && (this[r] = t); }, stop: function stop() { this.done = !0; var t = this.tryEntries[0].completion; if ("throw" === t.type) throw t.arg; return this.rval; }, dispatchException: function dispatchException(e) { if (this.done) throw e; var r = this; function handle(n, o) { return a.type = "throw", a.arg = e, r.next = n, o && (r.method = "next", r.arg = t), !!o; } for (var o = this.tryEntries.length - 1; o >= 0; --o) { var i = this.tryEntries[o], a = i.completion; if ("root" === i.tryLoc) return handle("end"); if (i.tryLoc <= this.prev) { var c = n.call(i, "catchLoc"), u = n.call(i, "finallyLoc"); if (c && u) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } else if (c) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); } else { if (!u) throw new Error("try statement without catch or finally"); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } } } }, abrupt: function abrupt(t, e) { for (var r = this.tryEntries.length - 1; r >= 0; --r) { var o = this.tryEntries[r]; if (o.tryLoc <= this.prev && n.call(o, "finallyLoc") && this.prev < o.finallyLoc) { var i = o; break; } } i && ("break" === t || "continue" === t) && i.tryLoc <= e && e <= i.finallyLoc && (i = null); var a = i ? i.completion : {}; return a.type = t, a.arg = e, i ? (this.method = "next", this.next = i.finallyLoc, y) : this.complete(a); }, complete: function complete(t, e) { if ("throw" === t.type) throw t.arg; return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && e && (this.next = e), y; }, finish: function finish(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.finallyLoc === t) return this.complete(r.completion, r.afterLoc), resetTryEntry(r), y; } }, "catch": function _catch(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.tryLoc === t) { var n = r.completion; if ("throw" === n.type) { var o = n.arg; resetTryEntry(r); } return o; } } throw new Error("illegal catch attempt"); }, delegateYield: function delegateYield(e, r, n) { return this.delegate = { iterator: values(e), resultName: r, nextLoc: n }, "next" === this.method && (this.arg = t), y; } }, e; }
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : String(i); }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
var overviewCache = new Map();
function GameOverview(_ref) {
  var _trailers$clip, _trailers$clip2, _trailers$clip3, _trailers$clip4;
  var game = _ref.game,
    rawgKey = _ref.rawgKey;
  var _useState = useState(game),
    _useState2 = _slicedToArray(_useState, 2),
    info = _useState2[0],
    setInfo = _useState2[1],
    _useState3 = useState(false),
    _useState4 = _slicedToArray(_useState3, 2),
    loading = _useState4[0],
    setLoading = _useState4[1],
    _useState5 = useState(''),
    _useState6 = _slicedToArray(_useState5, 2),
    problem = _useState6[0],
    setProblem = _useState6[1],
    _useState7 = useState([]),
    _useState8 = _slicedToArray(_useState7, 2),
    mediaErrors = _useState8[0],
    setMediaErrors = _useState8[1],
    _useState9 = useState(0),
    _useState10 = _slicedToArray(_useState9, 2),
    attempt = _useState10[0],
    setAttempt = _useState10[1],
    _useState11 = useState(null),
    _useState12 = _slicedToArray(_useState11, 2),
    shot = _useState12[0],
    setShot = _useState12[1],
    _useState13 = useState(0),
    _useState14 = _slicedToArray(_useState13, 2),
    clip = _useState14[0],
    setClip = _useState14[1];
  var manual = String(game.id).startsWith('manual-');
  useEffect(function () {
    if (manual || !rawgKey) return;
    var controller = new AbortController();
    var mounted = true;
    var cacheKey = String(game.id);
    var cached = overviewCache.get(cacheKey);
    if (cached && attempt === 0) {
      setInfo(cached.info);
      setMediaErrors(cached.errors);
      return function () {
        return controller.abort();
      };
    }
    setLoading(true);
    setProblem('');
    setMediaErrors([]);
    var timer = setTimeout(function () {
      return controller.abort();
    }, 20000);
    fetchGameOverview(game.id, rawgKey, controller.signal).then(function (result) {
      if (!mounted) return;
      var merged = _objectSpread(_objectSpread({}, game), result.info);
      setInfo(merged);
      setMediaErrors(result.errors);
      if (!result.errors.length) overviewCache.set(cacheKey, {
        info: merged,
        errors: []
      });
    })["catch"](function (e) {
      if (mounted) setProblem(e.name === 'AbortError' ? 'Request timed out. Please try again.' : e.message);
    })["finally"](function () {
      clearTimeout(timer);
      if (mounted) setLoading(false);
    });
    return function () {
      mounted = false;
      clearTimeout(timer);
      controller.abort();
    };
  }, [game.id, rawgKey, attempt]);
  var platforms = info.platformDetails || String(info.platforms || '').split(', ').filter(Boolean).map(function (name) {
    return {
      name: name
    };
  });
  var screenshots = (info.screenshots || []).filter(function (s) {
    return safeMediaUrl(s.image);
  });
  var trailers = (info.trailers || []).filter(function (t) {
    var _t$data, _t$data2;
    return safeMediaUrl(((_t$data = t.data) === null || _t$data === void 0 ? void 0 : _t$data.max) || ((_t$data2 = t.data) === null || _t$data2 === void 0 ? void 0 : _t$data2['480']));
  });
  var facts = [['Release date', info.releaseDate ? dateLabel(info.releaseDate + 'T12:00:00') : info.released], ['Developer', info.developers], ['Publisher', info.publishers], ['Genres', info.genres], ['Age rating', info.esrb], ['Metacritic', info.metacritic ? String(info.metacritic) + '/100' : null], ['Nota RAWG', info.rating && info.rating !== 'N/A' ? info.rating + '/5' : null]].filter(function (_ref2) {
    var _ref3 = _slicedToArray(_ref2, 2),
      v = _ref3[1];
    return v;
  });
  return /*#__PURE__*/React.createElement("div", {
    className: "overview"
  }, loading && /*#__PURE__*/React.createElement("div", {
    className: "detail-loading",
    role: "status"
  }, "Loading game details\u2026"), problem && /*#__PURE__*/React.createElement("div", {
    className: "notice",
    role: "alert"
  }, problem, /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setAttempt(function (a) {
        return a + 1;
      });
    }
  }, "Try again")), !manual && !rawgKey && /*#__PURE__*/React.createElement("p", {
    className: "media-notice"
  }, "Set your RAWG key in Profile to load details and media."), /*#__PURE__*/React.createElement("section", {
    className: "synopsis"
  }, /*#__PURE__*/React.createElement("h2", null, "Synopsis"), /*#__PURE__*/React.createElement("p", null, info.description || (loading ? 'Loading synopsis…' : 'No synopsis available for this game.'))), platforms.length > 0 && /*#__PURE__*/React.createElement("section", null, /*#__PURE__*/React.createElement("h2", null, "Platforms"), /*#__PURE__*/React.createElement("div", {
    className: "platform-chips"
  }, platforms.map(function (p) {
    return /*#__PURE__*/React.createElement("span", {
      key: p.name
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "gamepad"
    }), p.name, p.released_at && /*#__PURE__*/React.createElement("small", null, p.released_at.slice(0, 4)));
  }))), facts.length > 0 && /*#__PURE__*/React.createElement("dl", {
    className: "game-facts"
  }, facts.map(function (_ref4) {
    var _ref5 = _slicedToArray(_ref4, 2),
      label = _ref5[0],
      value = _ref5[1];
    return /*#__PURE__*/React.createElement("div", {
      key: label
    }, /*#__PURE__*/React.createElement("dt", null, label), /*#__PURE__*/React.createElement("dd", null, value));
  })), trailers.length > 0 && /*#__PURE__*/React.createElement("section", {
    className: "trailer-section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "section-heading"
  }, /*#__PURE__*/React.createElement("h2", null, "Trailers"), /*#__PURE__*/React.createElement(Icon, {
    name: "play"
  })), /*#__PURE__*/React.createElement("video", {
    key: ((_trailers$clip = trailers[clip]) === null || _trailers$clip === void 0 ? void 0 : _trailers$clip.id) || clip,
    controls: true,
    playsInline: true,
    preload: "none",
    poster: safeMediaUrl((_trailers$clip2 = trailers[clip]) === null || _trailers$clip2 === void 0 ? void 0 : _trailers$clip2.preview),
    src: safeMediaUrl(((_trailers$clip3 = trailers[clip]) === null || _trailers$clip3 === void 0 || (_trailers$clip3 = _trailers$clip3.data) === null || _trailers$clip3 === void 0 ? void 0 : _trailers$clip3.max) || ((_trailers$clip4 = trailers[clip]) === null || _trailers$clip4 === void 0 || (_trailers$clip4 = _trailers$clip4.data) === null || _trailers$clip4 === void 0 ? void 0 : _trailers$clip4['480'])),
    onError: function onError() {
      return setMediaErrors(function (a) {
        return _toConsumableArray(new Set([].concat(_toConsumableArray(a), ['Unable to play this trailer.'])));
      });
    }
  }, "Your browser does not support this video."), trailers.length > 1 && /*#__PURE__*/React.createElement("div", {
    className: "trailer-picker"
  }, trailers.map(function (t, i) {
    return /*#__PURE__*/React.createElement("button", {
      key: t.id || i,
      className: i === clip ? 'active' : '',
      onClick: function onClick() {
        return setClip(i);
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "play"
    }), t.name || 'Trailer ' + (i + 1));
  }))), screenshots.length > 0 && /*#__PURE__*/React.createElement("section", null, /*#__PURE__*/React.createElement("h2", null, "Gallery"), /*#__PURE__*/React.createElement("div", {
    className: "screenshot-grid"
  }, screenshots.map(function (s, i) {
    return /*#__PURE__*/React.createElement("button", {
      key: s.id || i,
      "aria-label": 'Enlarge screenshot ' + (i + 1),
      onClick: function onClick() {
        return setShot(shot === i ? null : i);
      },
      "aria-expanded": shot === i
    }, /*#__PURE__*/React.createElement("img", {
      src: safeMediaUrl(s.image),
      alt: 'Screenshot ' + (i + 1) + ' de ' + game.name,
      loading: "lazy"
    }));
  })), shot !== null && screenshots[shot] && /*#__PURE__*/React.createElement("div", {
    className: "expanded-shot"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setShot(null);
    },
    "aria-label": "Close image"
  }, "\xD7"), /*#__PURE__*/React.createElement("img", {
    src: safeMediaUrl(screenshots[shot].image),
    alt: 'Enlarged screenshot of ' + game.name
  }))), !loading && !problem && !manual && rawgKey && !trailers.length && /*#__PURE__*/React.createElement("p", {
    className: "media-notice"
  }, mediaErrors.some(function (e) {
    return e.includes('trailers');
  }) ? 'Trailers unavailable for this request.' : 'No trailer available on RAWG for this game.'), !loading && mediaErrors.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "media-notice",
    role: "status"
  }, "Some media could not be loaded. ", /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setAttempt(function (a) {
        return a + 1;
      });
    }
  }, "Retry media")), (info.tags || []).length > 0 && /*#__PURE__*/React.createElement("section", null, /*#__PURE__*/React.createElement("h2", null, "Features"), /*#__PURE__*/React.createElement("div", {
    className: "tags"
  }, info.tags.map(function (t) {
    return /*#__PURE__*/React.createElement("span", {
      key: t
    }, t);
  }))), safeMediaUrl(info.website) && /*#__PURE__*/React.createElement("a", {
    className: "external-game",
    href: safeMediaUrl(info.website),
    target: "_blank",
    rel: "noopener noreferrer"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "explore"
  }), "Official website"), /*#__PURE__*/React.createElement("p", {
    className: "attribution"
  }, "Date and media: ", /*#__PURE__*/React.createElement("a", {
    href: "https://rawg.io",
    target: "_blank",
    rel: "noopener noreferrer"
  }, "RAWG")));
}
var STATES = {
  backlog: 'Backlog',
  playing: 'Playing',
  paused: 'Paused',
  finished: 'Completed',
  quit: 'Stopped'
};
var nowDate = function nowDate() {
  return new Date().toLocaleDateString('en-CA');
};
var dateLabel = function dateLabel(v) {
  return new Date(v).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};
function Icon(_ref6) {
  var name = _ref6.name;
  var paths = {
    home: 'M3 10l9-7 9 7v11h-6v-7H9v7H3z',
    library: 'M4 3v18M9 3v18M14 3v18M18 4l4 16',
    journal: 'M5 3h14v18H5zM9 8h6M9 12h6M9 16h3',
    explore: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18M16 8l-3 5-5 3 3-5z',
    profile: 'M16 7a4 4 0 1 0-8 0 4 4 0 0 0 8 0M4 21v-2a8 8 0 0 1 16 0v2',
    play: 'M9 5l11 7-11 7z',
    gamepad: 'M7 7h10a4 4 0 0 1 4 4l1 7c0 3-4 3-6-1H8c-2 4-6 4-6 1l1-7a4 4 0 0 1 4-4M6 12h6M9 9v6M16 11h.01M19 14h.01',
    plus: 'M12 5v14M5 12h14',
    chevron: 'M9 5l7 7-7 7',
    search: 'M20 20l-5-5M17 10a7 7 0 1 0-14 0 7 7 0 0 0 14 0',
    spark: 'M12 3l2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5z'
  };
  return /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.5",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("path", {
    d: paths[name] || paths.spark
  }));
}
function Journey() {
  var _entry$rating, _modal$session3, _modal$session4, _modal$session5;
  var _useState15 = useState(function () {
      return load(STORAGE_KEY, {});
    }),
    _useState16 = _slicedToArray(_useState15, 2),
    library = _useState16[0],
    setLibrary = _useState16[1],
    _useState17 = useState(function () {
      return load(SETTINGS_KEY, {});
    }),
    _useState18 = _slicedToArray(_useState17, 2),
    settings = _useState18[0],
    setSettings = _useState18[1],
    _useState19 = useState(function () {
      return load(USER_KEY, {
        name: 'Player'
      });
    }),
    _useState20 = _slicedToArray(_useState19, 2),
    user = _useState20[0],
    setUser = _useState20[1];
  var _useState21 = useState('home'),
    _useState22 = _slicedToArray(_useState21, 2),
    view = _useState22[0],
    setView = _useState22[1],
    _useState23 = useState(null),
    _useState24 = _slicedToArray(_useState23, 2),
    selected = _useState24[0],
    setSelected = _useState24[1],
    _useState25 = useState(''),
    _useState26 = _slicedToArray(_useState25, 2),
    query = _useState26[0],
    setQuery = _useState26[1],
    _useState27 = useState('all'),
    _useState28 = _slicedToArray(_useState27, 2),
    filter = _useState28[0],
    setFilter = _useState28[1],
    _useState29 = useState(''),
    _useState30 = _slicedToArray(_useState29, 2),
    platform = _useState30[0],
    setPlatform = _useState30[1],
    _useState31 = useState('recent'),
    _useState32 = _slicedToArray(_useState31, 2),
    sort = _useState32[0],
    setSort = _useState32[1],
    _useState33 = useState(false),
    _useState34 = _slicedToArray(_useState33, 2),
    list = _useState34[0],
    setList = _useState34[1],
    _useState35 = useState([]),
    _useState36 = _slicedToArray(_useState35, 2),
    results = _useState36[0],
    setResults = _useState36[1],
    _useState37 = useState(false),
    _useState38 = _slicedToArray(_useState37, 2),
    busy = _useState38[0],
    setBusy = _useState38[1],
    _useState39 = useState(''),
    _useState40 = _slicedToArray(_useState39, 2),
    error = _useState40[0],
    setError = _useState40[1],
    _useState41 = useState(''),
    _useState42 = _slicedToArray(_useState41, 2),
    toast = _useState42[0],
    setToast = _useState42[1],
    _useState43 = useState(null),
    _useState44 = _slicedToArray(_useState43, 2),
    undo = _useState44[0],
    setUndo = _useState44[1],
    _useState45 = useState(''),
    _useState46 = _slicedToArray(_useState45, 2),
    collection = _useState46[0],
    setCollection = _useState46[1],
    _useState47 = useState(function () {
      return load('journey_collections_v1', []);
    }),
    _useState48 = _slicedToArray(_useState47, 2),
    collections = _useState48[0],
    setCollections = _useState48[1];
  var _useState49 = useState(null),
    _useState50 = _slicedToArray(_useState49, 2),
    modal = _useState50[0],
    setModal = _useState50[1],
    _useState51 = useState('about'),
    _useState52 = _slicedToArray(_useState51, 2),
    tab = _useState52[0],
    setTab = _useState52[1];
  var fileRef = useRef(),
    restoreRef = useRef(),
    previousFocus = useRef();
  var entries = Object.values(library).filter(function (e) {
      return e && e.game;
    }),
    sessions = entries.flatMap(function (e) {
      return (e.journeys || [{
        id: 'original',
        sessions: e.sessions || []
      }]).flatMap(function (j) {
        return (j.sessions || []).map(function (s) {
          return _objectSpread(_objectSpread({}, s), {}, {
            game: e.game,
            journey: j.title || 'First playthrough'
          });
        });
      });
    }).sort(function (a, b) {
      return b.date.localeCompare(a.date) || b.id - a.id;
    });
  var playing = entries.filter(function (e) {
      return e.status === 'playing';
    }).sort(function (a, b) {
      return b.updatedAt - a.updatedAt;
    }),
    hero = playing[0] || entries.slice().sort(function (a, b) {
      return b.updatedAt - a.updatedAt;
    })[0];
  function persist(next) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setLibrary(next);
      return true;
    } catch (e) {
      setToast('Unable to save. Export a backup and free up device storage.');
      return false;
    }
  }
  function change(id, patch) {
    var old = library;
    var e = old[id];
    if (!e) return;
    if (persist(_objectSpread(_objectSpread({}, old), {}, _defineProperty({}, id, _objectSpread(_objectSpread(_objectSpread({}, e), patch), {}, {
      updatedAt: Date.now()
    }))))) {
      setUndo(old);
      setToast('Journey updated.');
    }
  }
  function add(game) {
    if (library[game.id]) {
      setSelected(game);
      return;
    }
    var t = Date.now();
    if (persist(_objectSpread(_objectSpread({}, library), {}, _defineProperty({}, game.id, {
      game: game,
      status: 'backlog',
      createdAt: t,
      updatedAt: t
    })))) setToast('Added to your library.');
    setSelected(game);
  }
  useEffect(function () {
    var _window$__hideSplash, _window;
    (_window$__hideSplash = (_window = window).__hideSplash) === null || _window$__hideSplash === void 0 || _window$__hideSplash.call(_window);
    var hash = function hash() {
      var v = location.hash.slice(1);
      if (['home', 'library', 'journal', 'explore', 'profile'].includes(v)) setView(v);
    };
    hash();
    window.addEventListener('hashchange', hash);
    return function () {
      return window.removeEventListener('hashchange', hash);
    };
  }, []);
  useEffect(function () {
    if (!toast) return;
    var t = setTimeout(function () {
      return setToast('');
    }, 7000);
    return function () {
      return clearTimeout(t);
    };
  }, [toast]);
  useEffect(function () {
    var _Array$from$pop;
    if (!selected && !modal) return;
    previousFocus.current = document.activeElement;
    var key = function key(e) {
      if (e.key === 'Escape') {
        setSelected(null);
        setModal(null);
      }
      if (e.key === 'Tab') {
        var box = Array.from(document.querySelectorAll('[role="dialog"]')).pop();
        var focus = box === null || box === void 0 ? void 0 : box.querySelectorAll('button,input,select,textarea,a[href]');
        if (!(focus !== null && focus !== void 0 && focus.length)) return;
        var first = focus[0],
          last = focus[focus.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', key);
    (_Array$from$pop = Array.from(document.querySelectorAll('[role="dialog"]')).pop()) === null || _Array$from$pop === void 0 || (_Array$from$pop = _Array$from$pop.querySelector('button')) === null || _Array$from$pop === void 0 || _Array$from$pop.focus();
    return function () {
      var _previousFocus$curren;
      document.removeEventListener('keydown', key);
      (_previousFocus$curren = previousFocus.current) === null || _previousFocus$curren === void 0 || _previousFocus$curren.focus();
    };
  }, [!!selected, !!modal]);
  function nav(v) {
    setView(v);
    location.hash = v;
    setQuery('');
    setCollection('');
    window.scrollTo(0, 0);
  }
  function search(_x) {
    return _search.apply(this, arguments);
  }
  function _search() {
    _search = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2(e) {
      return _regeneratorRuntime().wrap(function _callee2$(_context2) {
        while (1) switch (_context2.prev = _context2.next) {
          case 0:
            e === null || e === void 0 || e.preventDefault();
            if (query.trim()) {
              _context2.next = 3;
              break;
            }
            return _context2.abrupt("return");
          case 3:
            setError('');
            setBusy(true);
            _context2.prev = 5;
            if (settings.rawgKey) {
              _context2.next = 8;
              break;
            }
            throw Error('Set your RAWG key in Profile to search the catalog, or add a game manually.');
          case 8:
            _context2.t0 = setResults;
            _context2.next = 11;
            return searchGames({
              query: query.trim(),
              pageSize: 24
            }, settings.rawgKey);
          case 11:
            _context2.t1 = _context2.sent;
            (0, _context2.t0)(_context2.t1);
            _context2.next = 18;
            break;
          case 15:
            _context2.prev = 15;
            _context2.t2 = _context2["catch"](5);
            setError(_context2.t2.message);
          case 18:
            _context2.prev = 18;
            setBusy(false);
            return _context2.finish(18);
          case 21:
          case "end":
            return _context2.stop();
        }
      }, _callee2, null, [[5, 15, 18, 21]]);
    }));
    return _search.apply(this, arguments);
  }
  function backup() {
    var data = {
      format: 'journey',
      version: 1,
      exportedAt: new Date().toISOString(),
      library: library,
      collections: collections,
      user: user
    };
    var url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json'
    }));
    var a = document.createElement('a');
    a.href = url;
    a.download = 'journey-backup-' + nowDate() + '.json';
    a.click();
    setTimeout(function () {
      return URL.revokeObjectURL(url);
    }, 1000);
  }
  function restore(_x2) {
    return _restore.apply(this, arguments);
  }
  function _restore() {
    _restore = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee3(file) {
      var data;
      return _regeneratorRuntime().wrap(function _callee3$(_context3) {
        while (1) switch (_context3.prev = _context3.next) {
          case 0:
            if (file) {
              _context3.next = 2;
              break;
            }
            return _context3.abrupt("return");
          case 2:
            _context3.prev = 2;
            _context3.t0 = JSON;
            _context3.next = 6;
            return file.text();
          case 6:
            _context3.t1 = _context3.sent;
            data = _context3.t0.parse.call(_context3.t0, _context3.t1);
            if (!(data.format !== 'journey' || data.version !== 1 || !data.library || _typeof(data.library) !== 'object' || Array.isArray(data.library) || Object.entries(data.library).some(function (_ref18) {
              var _ref19 = _slicedToArray(_ref18, 2),
                id = _ref19[0],
                e = _ref19[1];
              return !(e !== null && e !== void 0 && e.game) || String(e.game.id) !== id || typeof e.game.name !== 'string' || !STATES[e.status] || e.journeys && !Array.isArray(e.journeys);
            }))) {
              _context3.next = 10;
              break;
            }
            throw Error('Invalid backup file.');
          case 10:
            setModal({
              type: 'restore',
              data: data
            });
            _context3.next = 16;
            break;
          case 13:
            _context3.prev = 13;
            _context3.t2 = _context3["catch"](2);
            setToast(_context3.t2.message);
          case 16:
            restoreRef.current.value = '';
          case 17:
          case "end":
            return _context3.stop();
        }
      }, _callee3, null, [[2, 13]]);
    }));
    return _restore.apply(this, arguments);
  }
  function card(e) {
    var g = e.game || e;
    return /*#__PURE__*/React.createElement("button", {
      className: "game",
      key: g.id,
      onClick: function onClick() {
        setSelected(g);
        setTab('about');
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "cover"
    }, g.cover ? /*#__PURE__*/React.createElement("img", {
      src: g.cover,
      alt: "",
      loading: "lazy",
      onError: function onError(e) {
        return e.currentTarget.style.display = 'none';
      }
    }) : /*#__PURE__*/React.createElement("span", null, "J"), e.status && /*#__PURE__*/React.createElement("span", {
      className: 'badge ' + e.status
    }, STATES[e.status])), /*#__PURE__*/React.createElement("div", {
      className: "game-info"
    }, /*#__PURE__*/React.createElement("h3", null, g.name), /*#__PURE__*/React.createElement("p", null, e.platform || g.developers || g.released || '')));
  }
  function empty(title, desc, action) {
    return /*#__PURE__*/React.createElement("div", {
      className: "empty"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "explore"
    }), /*#__PURE__*/React.createElement("h2", null, title), /*#__PURE__*/React.createElement("p", null, desc), action || /*#__PURE__*/React.createElement("button", {
      className: "primary",
      onClick: function onClick() {
        return nav('explore');
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "gamepad"
    }), " Add game"));
  }
  var entry = selected && library[selected.id],
    journeys = (entry === null || entry === void 0 ? void 0 : entry.journeys) || [{
      id: 'original',
      title: 'First playthrough',
      sessions: (entry === null || entry === void 0 ? void 0 : entry.sessions) || []
    }],
    active = journeys.find(function (j) {
      return j.id === (entry === null || entry === void 0 ? void 0 : entry.activeJourney);
    }) || journeys[0];
  var filtered = entries.filter(function (e) {
    return (filter === 'all' || e.status === filter) && (!platform || e.platform === platform) && (!collection || (e.collections || []).includes(collection)) && e.game.name.toLowerCase().includes(query.toLowerCase());
  }).sort(function (a, b) {
    return sort === 'name' ? a.game.name.localeCompare(b.game.name) : sort === 'rating' ? (b.rating || 0) - (a.rating || 0) : b.updatedAt - a.updatedAt;
  });
  return /*#__PURE__*/React.createElement("div", {
    className: "app"
  }, /*#__PURE__*/React.createElement("aside", null, /*#__PURE__*/React.createElement("a", {
    className: "wordmark",
    href: "#home",
    onClick: function onClick() {
      return nav('home');
    },
    "aria-label": "Journey \u2014 Home"
  }, /*#__PURE__*/React.createElement("img", {
    src: "icons/icon.svg?v=journey-3",
    alt: ""
  }), "journey"), /*#__PURE__*/React.createElement("nav", null, [['home', 'Home'], ['library', 'Library'], ['journal', 'Journal'], ['explore', 'Explore'], ['profile', 'Profile']].map(function (_ref7) {
    var _ref8 = _slicedToArray(_ref7, 2),
      v = _ref8[0],
      label = _ref8[1];
    return /*#__PURE__*/React.createElement("button", {
      key: v,
      "aria-current": view === v ? 'page' : undefined,
      className: view === v ? 'active' : '',
      onClick: function onClick() {
        return nav(v);
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: v
    }), /*#__PURE__*/React.createElement("span", null, label));
  })), /*#__PURE__*/React.createElement("div", {
    className: "sidebar-bottom"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return nav('profile');
    },
    className: "avatar-row"
  }, /*#__PURE__*/React.createElement("b", null, ((user === null || user === void 0 ? void 0 : user.name) || 'V')[0]), /*#__PURE__*/React.createElement("span", null, (user === null || user === void 0 ? void 0 : user.name) || 'Player')))), /*#__PURE__*/React.createElement("main", null, /*#__PURE__*/React.createElement("header", {
    className: "mobile-brand"
  }, /*#__PURE__*/React.createElement("a", {
    href: "#home",
    onClick: function onClick() {
      return nav('home');
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "icons/icon.svg?v=journey-3",
    alt: ""
  }), "journey")), view === 'home' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "page-title home-title"
  }, /*#__PURE__*/React.createElement("h1", null, "Your games"), /*#__PURE__*/React.createElement("button", {
    "aria-label": "Add game",
    className: "icon-button",
    onClick: function onClick() {
      return nav('explore');
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "plus"
  }))), hero ? /*#__PURE__*/React.createElement("section", {
    className: "hero"
  }, hero.game.cover && /*#__PURE__*/React.createElement("img", {
    src: hero.game.cover,
    alt: ""
  }), /*#__PURE__*/React.createElement("div", {
    className: "hero-content"
  }, /*#__PURE__*/React.createElement("small", null, STATES[hero.status]), /*#__PURE__*/React.createElement("h2", null, hero.game.name), /*#__PURE__*/React.createElement("button", {
    className: "primary game-action",
    onClick: function onClick() {
      setSelected(hero.game);
      setTab('about');
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "play"
  }), hero.status === 'playing' ? 'Continue journey' : 'View game'))) : empty('Your library starts here', '', /*#__PURE__*/React.createElement("button", {
    className: "primary game-action",
    onClick: function onClick() {
      return nav('explore');
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "gamepad"
  }), "Add game")), playing.length > 0 && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "section-heading"
  }, /*#__PURE__*/React.createElement("h2", null, "Playing"), /*#__PURE__*/React.createElement("button", {
    "aria-label": "Ver biblioteca",
    onClick: function onClick() {
      return nav('library');
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "library"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "grid"
  }, playing.map(card))), entries.some(function (e) {
    return e.status === 'backlog';
  }) && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "section-heading"
  }, /*#__PURE__*/React.createElement("h2", null, "Backlog")), /*#__PURE__*/React.createElement("div", {
    className: "grid"
  }, entries.filter(function (e) {
    return e.status === 'backlog';
  }).map(card))), entries.some(function (e) {
    return e.status === 'finished';
  }) && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "section-heading"
  }, /*#__PURE__*/React.createElement("h2", null, "Completed")), /*#__PURE__*/React.createElement("div", {
    className: "grid"
  }, entries.filter(function (e) {
    return e.status === 'finished';
  }).slice(0, 6).map(card)))), view === 'library' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "page-title"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", null, "Library"), /*#__PURE__*/React.createElement("p", null, entries.length, " ", entries.length === 1 ? 'game' : 'games')), /*#__PURE__*/React.createElement("button", {
    className: "primary",
    onClick: function onClick() {
      return setModal({
        type: 'manual'
      });
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "plus"
  }), "Add game")), /*#__PURE__*/React.createElement("div", {
    className: "tabs"
  }, [['all', 'All']].concat(_toConsumableArray(Object.entries(STATES))).map(function (_ref9) {
    var _ref10 = _slicedToArray(_ref9, 2),
      v = _ref10[0],
      l = _ref10[1];
    return /*#__PURE__*/React.createElement("button", {
      className: filter === v ? 'active' : '',
      key: v,
      onClick: function onClick() {
        return setFilter(v);
      }
    }, l, " ", /*#__PURE__*/React.createElement("small", null, v === 'all' ? entries.length : entries.filter(function (e) {
      return e.status === v;
    }).length));
  })), /*#__PURE__*/React.createElement("div", {
    className: "toolbar"
  }, /*#__PURE__*/React.createElement("input", {
    "aria-label": "Search library",
    placeholder: "Search your games\u2026",
    value: query,
    onChange: function onChange(e) {
      return setQuery(e.target.value);
    }
  }), /*#__PURE__*/React.createElement("select", {
    "aria-label": "Platform",
    value: platform,
    onChange: function onChange(e) {
      return setPlatform(e.target.value);
    }
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "All platforms"), _toConsumableArray(new Set(entries.map(function (e) {
    return e.platform;
  }).filter(Boolean))).map(function (p) {
    return /*#__PURE__*/React.createElement("option", {
      key: p
    }, p);
  })), /*#__PURE__*/React.createElement("select", {
    "aria-label": "Sort by",
    value: sort,
    onChange: function onChange(e) {
      return setSort(e.target.value);
    }
  }, /*#__PURE__*/React.createElement("option", {
    value: "recent"
  }, "Recently updated"), /*#__PURE__*/React.createElement("option", {
    value: "name"
  }, "Name A\u2013Z"), /*#__PURE__*/React.createElement("option", {
    value: "rating"
  }, "My rating")), /*#__PURE__*/React.createElement("button", {
    "aria-pressed": list,
    onClick: function onClick() {
      return setList(!list);
    }
  }, list ? 'Grid' : 'List')), /*#__PURE__*/React.createElement("div", {
    className: "collections"
  }, /*#__PURE__*/React.createElement("button", {
    className: !collection ? 'active' : '',
    onClick: function onClick() {
      return setCollection('');
    }
  }, "All collections"), collections.map(function (c) {
    return /*#__PURE__*/React.createElement("button", {
      key: c,
      className: collection === c ? 'active' : '',
      onClick: function onClick() {
        return setCollection(c);
      }
    }, c);
  }), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setModal({
        type: 'collection'
      });
    }
  }, "+ Collection")), filtered.length ? /*#__PURE__*/React.createElement("div", {
    className: 'grid ' + (list ? 'list' : '')
  }, filtered.map(card)) : empty('A space for your games', 'Add a game or adjust your filters.')), view === 'journal' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "page-title"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", null, "Journal", /*#__PURE__*/React.createElement("span", null, ".")))), sessions.length ? /*#__PURE__*/React.createElement("div", {
    className: "timeline"
  }, sessions.map(function (s, i) {
    return /*#__PURE__*/React.createElement("article", {
      className: "memory",
      key: s.id + '-' + i
    }, /*#__PURE__*/React.createElement("small", null, dateLabel(s.date + 'T12:00:00'), " \xB7 ", s.minutes ? s.minutes + ' min' : 'No duration', " \xB7 ", s.journey), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        return setSelected(s.game);
      }
    }, /*#__PURE__*/React.createElement("h2", null, s.game.name)), s.text && /*#__PURE__*/React.createElement("p", null, s.text), s.image && /*#__PURE__*/React.createElement("img", {
      src: s.image,
      alt: 'Memory of ' + s.game.name
    }));
  })) : empty('Your story starts here', 'Open a game to log your first session.')), view === 'explore' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "page-title"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", null, "Explore", /*#__PURE__*/React.createElement("span", null, "."))), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setModal({
        type: 'manual'
      });
    }
  }, "Add manually")), /*#__PURE__*/React.createElement("form", {
    className: "searchbar",
    onSubmit: search
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "explore"
  }), /*#__PURE__*/React.createElement("input", {
    "aria-label": "Game title",
    placeholder: "Search for a game\u2026",
    value: query,
    onChange: function onChange(e) {
      return setQuery(e.target.value);
    }
  }), /*#__PURE__*/React.createElement("button", {
    className: "primary",
    disabled: busy
  }, busy ? 'Searching…' : 'Search')), error && /*#__PURE__*/React.createElement("p", {
    className: "notice",
    role: "alert"
  }, error), results.length ? /*#__PURE__*/React.createElement("div", {
    className: "grid"
  }, results.map(card)) : !busy && empty('Find your next game', 'Search by title or add a game manually.', /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setModal({
        type: 'manual'
      });
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "plus"
  }), "Add game")), /*#__PURE__*/React.createElement("p", {
    className: "attribution"
  }, "Catalog and images: RAWG. Your entries stay on this device.")), view === 'profile' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "page-title"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", null, (user === null || user === void 0 ? void 0 : user.name) || 'Player', /*#__PURE__*/React.createElement("span", null, ".")))), /*#__PURE__*/React.createElement("div", {
    className: "stats"
  }, [[entries.length, 'in library'], [entries.filter(function (e) {
    return e.status === 'finished';
  }).length, 'completed'], [sessions.length, 'memories'], [(sessions.reduce(function (n, s) {
    return n + (+s.minutes || 0);
  }, 0) / 60).toFixed(1) + 'h', 'logged']].map(function (_ref11) {
    var _ref12 = _slicedToArray(_ref11, 2),
      n = _ref12[0],
      l = _ref12[1];
    return /*#__PURE__*/React.createElement("div", {
      className: "panel",
      key: l
    }, /*#__PURE__*/React.createElement("strong", null, n), /*#__PURE__*/React.createElement("p", null, l));
  })), /*#__PURE__*/React.createElement("div", {
    className: "two-col"
  }, /*#__PURE__*/React.createElement("form", {
    className: "panel form",
    onSubmit: function onSubmit(e) {
      e.preventDefault();
      var f = new FormData(e.currentTarget);
      var u = _objectSpread(_objectSpread({}, user), {}, {
          name: f.get('name').trim() || 'Player'
        }),
        s = _objectSpread(_objectSpread({}, settings), {}, {
          rawgKey: f.get('rawg').trim()
        });
      delete s.groqKey;
      delete s.spoilers;
      try {
        localStorage.setItem(USER_KEY, JSON.stringify(u));
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
        setUser(u);
        setSettings(s);
        setToast('Settings saved.');
      } catch (e) {
        setToast('Unable to save settings.');
      }
    }
  }, /*#__PURE__*/React.createElement("h2", null, "Settings"), /*#__PURE__*/React.createElement("label", null, "Display name", /*#__PURE__*/React.createElement("input", {
    name: "name",
    defaultValue: user === null || user === void 0 ? void 0 : user.name,
    maxLength: "80"
  })), /*#__PURE__*/React.createElement("label", null, "RAWG API key", /*#__PURE__*/React.createElement("input", {
    name: "rawg",
    type: "password",
    autoComplete: "off",
    defaultValue: settings.rawgKey
  })), /*#__PURE__*/React.createElement("p", null, "Your RAWG key stays in this browser and is used only for catalog requests."), /*#__PURE__*/React.createElement("button", {
    className: "primary"
  }, "Save settings")), /*#__PURE__*/React.createElement("div", {
    className: "panel"
  }, /*#__PURE__*/React.createElement("h2", null, "Your memories, backed up."), /*#__PURE__*/React.createElement("p", null, "Export a backup before switching devices or clearing browser data. Includes games, playthroughs, images and collections. API keys are excluded."), /*#__PURE__*/React.createElement("button", {
    className: "primary",
    onClick: backup
  }, "Export backup"), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return restoreRef.current.click();
    }
  }, "Import backup"), /*#__PURE__*/React.createElement("input", {
    ref: restoreRef,
    type: "file",
    accept: "application/json",
    hidden: true,
    onChange: function onChange(e) {
      return restore(e.target.files[0]);
    }
  }), /*#__PURE__*/React.createElement("hr", null), /*#__PURE__*/React.createElement("h2", null, "Your year in games"), /*#__PURE__*/React.createElement("p", null, entries.filter(function (e) {
    return e.status === 'finished' && new Date(e.updatedAt).getFullYear() === new Date().getFullYear();
  }).length, " games marked or updated as completed this year."), /*#__PURE__*/React.createElement("p", null, "Library genres: ", _toConsumableArray(new Set(entries.flatMap(function (e) {
    return (e.game.genres || '').split(', ').filter(Boolean);
  }))).slice(0, 6).join(' · ') || 'Add games to discover your favorite genres.'), /*#__PURE__*/React.createElement("small", null, "Journey \xB7 your stories in games"))))), selected && !modal && /*#__PURE__*/React.createElement("div", {
    className: "backdrop",
    onClick: function onClick(e) {
      return e.target === e.currentTarget && setSelected(null);
    }
  }, /*#__PURE__*/React.createElement("section", {
    className: "dialog detail",
    role: "dialog",
    "aria-modal": "true",
    "aria-label": selected.name
  }, /*#__PURE__*/React.createElement("button", {
    className: "close",
    "aria-label": "Close game",
    onClick: function onClick() {
      return setSelected(null);
    }
  }, "\xD7"), /*#__PURE__*/React.createElement("div", {
    className: "detail-hero"
  }, selected.cover && /*#__PURE__*/React.createElement("img", {
    src: selected.cover,
    alt: ""
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, entry ? STATES[entry.status] : 'UM NOVO MUNDO'), /*#__PURE__*/React.createElement("h1", null, selected.name), /*#__PURE__*/React.createElement("p", null, selected.genres, " \xB7 ", selected.released))), /*#__PURE__*/React.createElement("div", {
    className: "detail-body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "tabs"
  }, [['about', 'Overview']].concat(_toConsumableArray(entry ? [['journey', 'My journey'], ['memories', 'Memories']] : [])).map(function (_ref13) {
    var _ref14 = _slicedToArray(_ref13, 2),
      v = _ref14[0],
      l = _ref14[1];
    return /*#__PURE__*/React.createElement("button", {
      key: v,
      className: tab === v ? 'active' : '',
      onClick: function onClick() {
        return setTab(v);
      }
    }, l);
  })), !entry && /*#__PURE__*/React.createElement("button", {
    className: "primary game-action add-library",
    onClick: function onClick() {
      return add(selected);
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "plus"
  }), "Add to library"), /*#__PURE__*/React.createElement(React.Fragment, null, tab === 'journey' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "toolbar"
  }, /*#__PURE__*/React.createElement("select", {
    "aria-label": "Play status",
    value: entry.status,
    onChange: function onChange(e) {
      return change(selected.id, {
        status: e.target.value
      });
    }
  }, Object.entries(STATES).map(function (_ref15) {
    var _ref16 = _slicedToArray(_ref15, 2),
      v = _ref16[0],
      l = _ref16[1];
    return /*#__PURE__*/React.createElement("option", {
      key: v,
      value: v
    }, l);
  })), /*#__PURE__*/React.createElement("button", {
    className: "primary",
    onClick: function onClick() {
      return setModal({
        type: 'session',
        id: selected.id,
        journey: active.id
      });
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "play"
  }), "Log session")), /*#__PURE__*/React.createElement("form", {
    key: selected.id + '-' + entry.updatedAt,
    className: "form",
    onSubmit: function onSubmit(e) {
      e.preventDefault();
      var f = new FormData(e.currentTarget);
      change(selected.id, {
        platform: f.get('platform'),
        access: f.get('access'),
        completion: f.get('completion'),
        where: f.get('where'),
        note: f.get('note'),
        rating: f.get('rating') ? +f.get('rating') : null,
        startDate: f.get('start'),
        endDate: f.get('end'),
        collections: f.getAll('collections')
      });
    }
  }, /*#__PURE__*/React.createElement("label", null, "Your platform", /*#__PURE__*/React.createElement("input", {
    name: "platform",
    list: "platforms",
    defaultValue: entry.platform || '',
    placeholder: "Choose or enter a platform"
  }), /*#__PURE__*/React.createElement("datalist", {
    id: "platforms"
  }, PLATFORMS_LIST.map(function (p) {
    return /*#__PURE__*/React.createElement("option", {
      key: p
    }, p);
  }))), /*#__PURE__*/React.createElement("div", {
    className: "two-col"
  }, /*#__PURE__*/React.createElement("label", null, "Access", /*#__PURE__*/React.createElement("select", {
    name: "access",
    defaultValue: entry.access || 'Owned'
  }, ['Owned', 'Subscription', 'Borrowed', 'Want to buy'].map(function (x) {
    return /*#__PURE__*/React.createElement("option", {
      key: x
    }, x);
  }))), /*#__PURE__*/React.createElement("label", null, "Completion", /*#__PURE__*/React.createElement("select", {
    name: "completion",
    defaultValue: entry.completion || ''
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "In progress"), ['Story completed', '100%', 'Platinum', 'Ongoing game'].map(function (x) {
    return /*#__PURE__*/React.createElement("option", {
      key: x
    }, x);
  })))), /*#__PURE__*/React.createElement("label", null, "Where I left off", /*#__PURE__*/React.createElement("textarea", {
    name: "where",
    defaultValue: entry.where || '',
    placeholder: "Leave a note for next time\u2026",
    maxLength: "4000"
  })), /*#__PURE__*/React.createElement("div", {
    className: "two-col"
  }, /*#__PURE__*/React.createElement("label", null, "Started on", /*#__PURE__*/React.createElement("input", {
    type: "date",
    name: "start",
    defaultValue: entry.startDate || ''
  })), /*#__PURE__*/React.createElement("label", null, "Finished on", /*#__PURE__*/React.createElement("input", {
    type: "date",
    name: "end",
    defaultValue: entry.endDate || ''
  }))), /*#__PURE__*/React.createElement("label", null, "My rating \xB7 0 a 10", /*#__PURE__*/React.createElement("input", {
    name: "rating",
    type: "number",
    min: "0",
    max: "10",
    step: "0.5",
    defaultValue: (_entry$rating = entry.rating) !== null && _entry$rating !== void 0 ? _entry$rating : ''
  })), /*#__PURE__*/React.createElement("label", null, "My thoughts", /*#__PURE__*/React.createElement("textarea", {
    name: "note",
    defaultValue: entry.note || '',
    placeholder: "Your thoughts, favorite moment, or reason to return\u2026",
    maxLength: "8000"
  })), collections.length > 0 && /*#__PURE__*/React.createElement("fieldset", null, /*#__PURE__*/React.createElement("legend", null, "Collections"), collections.map(function (c) {
    return /*#__PURE__*/React.createElement("label", {
      className: "check",
      key: c
    }, /*#__PURE__*/React.createElement("input", {
      name: "collections",
      type: "checkbox",
      value: c,
      defaultChecked: (entry.collections || []).includes(c)
    }), c);
  })), /*#__PURE__*/React.createElement("button", {
    className: "primary"
  }, "Save journey")), /*#__PURE__*/React.createElement("hr", null), /*#__PURE__*/React.createElement("div", {
    className: "toolbar"
  }, /*#__PURE__*/React.createElement("select", {
    "aria-label": "Select playthrough",
    value: active.id,
    onChange: function onChange(e) {
      return change(selected.id, {
        activeJourney: e.target.value
      });
    }
  }, journeys.map(function (j) {
    return /*#__PURE__*/React.createElement("option", {
      key: j.id,
      value: j.id
    }, j.title);
  })), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setModal({
        type: 'replay',
        id: selected.id
      });
    }
  }, "+ New playthrough"))), tab === 'about' && /*#__PURE__*/React.createElement(GameOverview, {
    key: selected.id,
    game: selected,
    rawgKey: settings.rawgKey
  }), tab === 'memories' && (sessions.filter(function (s) {
    return s.game.id === selected.id;
  }).length ? sessions.filter(function (s) {
    return s.game.id === selected.id;
  }).map(function (s, i) {
    return /*#__PURE__*/React.createElement("article", {
      className: "memory",
      key: i
    }, /*#__PURE__*/React.createElement("small", null, dateLabel(s.date + 'T12:00:00'), " \xB7 ", s.journey, " \xB7 ", s.minutes || 0, " min"), /*#__PURE__*/React.createElement("p", null, s.text), s.image && /*#__PURE__*/React.createElement("img", {
      src: s.image,
      alt: "Game memory"
    }), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        var _journeys$find;
        return setModal({
          type: 'session',
          id: selected.id,
          journey: ((_journeys$find = journeys.find(function (j) {
            return (j.sessions || []).some(function (x) {
              return x.id === s.id;
            });
          })) === null || _journeys$find === void 0 ? void 0 : _journeys$find.id) || 'original',
          session: s
        });
      }
    }, "Edit entry"));
  }) : /*#__PURE__*/React.createElement("p", {
    className: "empty"
  }, "Log your first session to save a memory.")))))), modal && /*#__PURE__*/React.createElement("div", {
    className: "backdrop top"
  }, /*#__PURE__*/React.createElement("section", {
    className: "dialog compact",
    role: "dialog",
    "aria-modal": "true",
    "aria-label": "Save to Journey"
  }, /*#__PURE__*/React.createElement("button", {
    className: "close",
    "aria-label": "Close form",
    onClick: function onClick() {
      return setModal(null);
    }
  }, "\xD7"), modal.type === 'restore' ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("h2", null, "Import your journeys?"), /*#__PURE__*/React.createElement("p", null, "Games will be merged into your library. For matching IDs, the backup takes priority. Export your current data first."), /*#__PURE__*/React.createElement("button", {
    onClick: backup
  }, "Export current data"), /*#__PURE__*/React.createElement("button", {
    className: "primary",
    onClick: function onClick() {
      if (persist(_objectSpread(_objectSpread({}, library), modal.data.library))) {
        var c = _toConsumableArray(new Set([].concat(_toConsumableArray(collections), _toConsumableArray((modal.data.collections || []).filter(function (x) {
          return typeof x === 'string';
        })))));
        setCollections(c);
        save('journey_collections_v1', c);
        setModal(null);
        setToast('Backup imported.');
      }
    }
  }, "Import and merge")) : /*#__PURE__*/React.createElement("form", {
    className: "form",
    onSubmit: ( /*#__PURE__*/function () {
      var _ref17 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(e) {
        var f, name, _name, next, en, js, j, _modal$session, _fileRef$current, _modal$session2, image, file, _en, _js, session;
        return _regeneratorRuntime().wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              e.preventDefault();
              f = new FormData(e.currentTarget);
              if (!(modal.type === 'manual')) {
                _context.next = 8;
                break;
              }
              name = f.get('name').trim();
              if (name) {
                _context.next = 6;
                break;
              }
              return _context.abrupt("return");
            case 6:
              add({
                id: 'manual-' + Date.now(),
                name: name,
                cover: '',
                genres: f.get('genre'),
                released: '',
                platforms: ''
              });
              setModal(null);
            case 8:
              if (!(modal.type === 'collection')) {
                _context.next = 14;
                break;
              }
              _name = f.get('name').trim();
              if (_name) {
                _context.next = 12;
                break;
              }
              return _context.abrupt("return");
            case 12:
              next = _toConsumableArray(new Set([].concat(_toConsumableArray(collections), [_name])));
              try {
                localStorage.setItem('journey_collections_v1', JSON.stringify(next));
                setCollections(next);
                setModal(null);
              } catch (e) {
                setToast('Unable to save.');
              }
            case 14:
              if (modal.type === 'replay') {
                en = library[modal.id], js = en.journeys || [{
                  id: 'original',
                  title: 'First playthrough',
                  sessions: en.sessions || []
                }], j = {
                  id: String(Date.now()),
                  title: f.get('name').trim() || 'Replay',
                  sessions: []
                };
                change(modal.id, {
                  journeys: [].concat(_toConsumableArray(js), [j]),
                  activeJourney: j.id
                });
                setModal(null);
              }
              if (!(modal.type === 'session')) {
                _context.next = 28;
                break;
              }
              image = ((_modal$session = modal.session) === null || _modal$session === void 0 ? void 0 : _modal$session.image) || '';
              file = (_fileRef$current = fileRef.current) === null || _fileRef$current === void 0 ? void 0 : _fileRef$current.files[0];
              if (!file) {
                _context.next = 25;
                break;
              }
              if (!(!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 1500000)) {
                _context.next = 22;
                break;
              }
              setToast('Choose a JPG, PNG or WebP image up to 1.5 MB.');
              return _context.abrupt("return");
            case 22:
              _context.next = 24;
              return new Promise(function (resolve, reject) {
                var r = new FileReader();
                r.onload = function () {
                  return resolve(r.result);
                };
                r.onerror = reject;
                r.readAsDateURL(file);
              });
            case 24:
              image = _context.sent;
            case 25:
              _en = library[modal.id], _js = _en.journeys || [{
                id: 'original',
                title: 'First playthrough',
                sessions: _en.sessions || []
              }];
              session = {
                id: ((_modal$session2 = modal.session) === null || _modal$session2 === void 0 ? void 0 : _modal$session2.id) || Date.now(),
                date: f.get('date'),
                minutes: +f.get('minutes') || 0,
                text: f.get('text').trim(),
                image: image
              };
              if (persist(_objectSpread(_objectSpread({}, library), {}, _defineProperty({}, modal.id, _objectSpread(_objectSpread({}, _en), {}, {
                updatedAt: Date.now(),
                journeys: _js.map(function (j) {
                  return j.id === modal.journey ? _objectSpread(_objectSpread({}, j), {}, {
                    sessions: [].concat(_toConsumableArray((j.sessions || []).filter(function (s) {
                      return s.id !== session.id;
                    })), [session])
                  }) : j;
                })
              }))))) {
                setModal(null);
                setToast('Memory saved.');
              }
            case 28:
            case "end":
              return _context.stop();
          }
        }, _callee);
      }));
      return function (_x3) {
        return _ref17.apply(this, arguments);
      };
    }())
  }, /*#__PURE__*/React.createElement("h2", null, {
    manual: 'Add a game',
    collection: 'New collection',
    replay: 'New playthrough',
    session: 'Log a session'
  }[modal.type]), modal.type === 'session' ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("label", null, "Date", /*#__PURE__*/React.createElement("input", {
    name: "date",
    type: "date",
    defaultValue: ((_modal$session3 = modal.session) === null || _modal$session3 === void 0 ? void 0 : _modal$session3.date) || nowDate(),
    required: true
  })), /*#__PURE__*/React.createElement("label", null, "Time played \xB7 minutes", /*#__PURE__*/React.createElement("input", {
    name: "minutes",
    type: "number",
    min: "0",
    max: "1440",
    defaultValue: ((_modal$session4 = modal.session) === null || _modal$session4 === void 0 ? void 0 : _modal$session4.minutes) || ''
  })), /*#__PURE__*/React.createElement("label", null, "What happened?", /*#__PURE__*/React.createElement("textarea", {
    name: "text",
    maxLength: "8000",
    defaultValue: ((_modal$session5 = modal.session) === null || _modal$session5 === void 0 ? void 0 : _modal$session5.text) || '',
    placeholder: "A discovery, a challenge, or how you felt\u2026"
  })), /*#__PURE__*/React.createElement("label", null, "Screenshot \xB7 optional", /*#__PURE__*/React.createElement("input", {
    ref: fileRef,
    type: "file",
    accept: "image/png,image/jpeg,image/webp"
  })), /*#__PURE__*/React.createElement("p", null, "Up to 1.5 MB per image. Export backups to preserve your memories.")) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("label", null, "Name", /*#__PURE__*/React.createElement("input", {
    name: "name",
    required: true,
    maxLength: "160",
    autoFocus: true,
    placeholder: modal.type === 'collection' ? 'Favoritos da vida' : modal.type === 'replay' ? 'Segunda campanha · PC' : 'Game title'
  })), modal.type === 'manual' && /*#__PURE__*/React.createElement("label", null, "Genre \xB7 optional", /*#__PURE__*/React.createElement("input", {
    name: "genre",
    maxLength: "100",
    placeholder: "RPG, adventure\u2026"
  }))), /*#__PURE__*/React.createElement("button", {
    className: "primary"
  }, modal.type === 'session' ? 'Save memory' : 'Save')))), toast && /*#__PURE__*/React.createElement("div", {
    className: "toast",
    role: "status"
  }, toast, undo && /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      if (persist(undo)) {
        setUndo(null);
        setToast('Change undone.');
      }
    }
  }, "Undo"), /*#__PURE__*/React.createElement("button", {
    "aria-label": "Dismiss message",
    onClick: function onClick() {
      return setToast('');
    }
  }, "\xD7")));
}
ReactDOM.createRoot(document.getElementById('root')).render( /*#__PURE__*/React.createElement(Journey, null));
