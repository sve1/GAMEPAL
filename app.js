"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return e; }; var t, e = {}, r = Object.prototype, n = r.hasOwnProperty, o = Object.defineProperty || function (t, e, r) { t[e] = r.value; }, i = "function" == typeof Symbol ? Symbol : {}, a = i.iterator || "@@iterator", c = i.asyncIterator || "@@asyncIterator", u = i.toStringTag || "@@toStringTag"; function define(t, e, r) { return Object.defineProperty(t, e, { value: r, enumerable: !0, configurable: !0, writable: !0 }), t[e]; } try { define({}, ""); } catch (t) { define = function define(t, e, r) { return t[e] = r; }; } function wrap(t, e, r, n) { var i = e && e.prototype instanceof Generator ? e : Generator, a = Object.create(i.prototype), c = new Context(n || []); return o(a, "_invoke", { value: makeInvokeMethod(t, r, c) }), a; } function tryCatch(t, e, r) { try { return { type: "normal", arg: t.call(e, r) }; } catch (t) { return { type: "throw", arg: t }; } } e.wrap = wrap; var h = "suspendedStart", l = "suspendedYield", f = "executing", s = "completed", y = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var p = {}; define(p, a, function () { return this; }); var d = Object.getPrototypeOf, v = d && d(d(values([]))); v && v !== r && n.call(v, a) && (p = v); var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p); function defineIteratorMethods(t) { ["next", "throw", "return"].forEach(function (e) { define(t, e, function (t) { return this._invoke(e, t); }); }); } function AsyncIterator(t, e) { function invoke(r, o, i, a) { var c = tryCatch(t[r], t, o); if ("throw" !== c.type) { var u = c.arg, h = u.value; return h && "object" == _typeof(h) && n.call(h, "__await") ? e.resolve(h.__await).then(function (t) { invoke("next", t, i, a); }, function (t) { invoke("throw", t, i, a); }) : e.resolve(h).then(function (t) { u.value = t, i(u); }, function (t) { return invoke("throw", t, i, a); }); } a(c.arg); } var r; o(this, "_invoke", { value: function value(t, n) { function callInvokeWithMethodAndArg() { return new e(function (e, r) { invoke(t, n, e, r); }); } return r = r ? r.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(e, r, n) { var o = h; return function (i, a) { if (o === f) throw new Error("Generator is already running"); if (o === s) { if ("throw" === i) throw a; return { value: t, done: !0 }; } for (n.method = i, n.arg = a;;) { var c = n.delegate; if (c) { var u = maybeInvokeDelegate(c, n); if (u) { if (u === y) continue; return u; } } if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) { if (o === h) throw o = s, n.arg; n.dispatchException(n.arg); } else "return" === n.method && n.abrupt("return", n.arg); o = f; var p = tryCatch(e, r, n); if ("normal" === p.type) { if (o = n.done ? s : l, p.arg === y) continue; return { value: p.arg, done: n.done }; } "throw" === p.type && (o = s, n.method = "throw", n.arg = p.arg); } }; } function maybeInvokeDelegate(e, r) { var n = r.method, o = e.iterator[n]; if (o === t) return r.delegate = null, "throw" === n && e.iterator["return"] && (r.method = "return", r.arg = t, maybeInvokeDelegate(e, r), "throw" === r.method) || "return" !== n && (r.method = "throw", r.arg = new TypeError("The iterator does not provide a '" + n + "' method")), y; var i = tryCatch(o, e.iterator, r.arg); if ("throw" === i.type) return r.method = "throw", r.arg = i.arg, r.delegate = null, y; var a = i.arg; return a ? a.done ? (r[e.resultName] = a.value, r.next = e.nextLoc, "return" !== r.method && (r.method = "next", r.arg = t), r.delegate = null, y) : a : (r.method = "throw", r.arg = new TypeError("iterator result is not an object"), r.delegate = null, y); } function pushTryEntry(t) { var e = { tryLoc: t[0] }; 1 in t && (e.catchLoc = t[1]), 2 in t && (e.finallyLoc = t[2], e.afterLoc = t[3]), this.tryEntries.push(e); } function resetTryEntry(t) { var e = t.completion || {}; e.type = "normal", delete e.arg, t.completion = e; } function Context(t) { this.tryEntries = [{ tryLoc: "root" }], t.forEach(pushTryEntry, this), this.reset(!0); } function values(e) { if (e || "" === e) { var r = e[a]; if (r) return r.call(e); if ("function" == typeof e.next) return e; if (!isNaN(e.length)) { var o = -1, i = function next() { for (; ++o < e.length;) if (n.call(e, o)) return next.value = e[o], next.done = !1, next; return next.value = t, next.done = !0, next; }; return i.next = i; } } throw new TypeError(_typeof(e) + " is not iterable"); } return GeneratorFunction.prototype = GeneratorFunctionPrototype, o(g, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), o(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, "GeneratorFunction"), e.isGeneratorFunction = function (t) { var e = "function" == typeof t && t.constructor; return !!e && (e === GeneratorFunction || "GeneratorFunction" === (e.displayName || e.name)); }, e.mark = function (t) { return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, define(t, u, "GeneratorFunction")), t.prototype = Object.create(g), t; }, e.awrap = function (t) { return { __await: t }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c, function () { return this; }), e.AsyncIterator = AsyncIterator, e.async = function (t, r, n, o, i) { void 0 === i && (i = Promise); var a = new AsyncIterator(wrap(t, r, n, o), i); return e.isGeneratorFunction(r) ? a : a.next().then(function (t) { return t.done ? t.value : a.next(); }); }, defineIteratorMethods(g), define(g, u, "Generator"), define(g, a, function () { return this; }), define(g, "toString", function () { return "[object Generator]"; }), e.keys = function (t) { var e = Object(t), r = []; for (var n in e) r.push(n); return r.reverse(), function next() { for (; r.length;) { var t = r.pop(); if (t in e) return next.value = t, next.done = !1, next; } return next.done = !0, next; }; }, e.values = values, Context.prototype = { constructor: Context, reset: function reset(e) { if (this.prev = 0, this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(resetTryEntry), !e) for (var r in this) "t" === r.charAt(0) && n.call(this, r) && !isNaN(+r.slice(1)) && (this[r] = t); }, stop: function stop() { this.done = !0; var t = this.tryEntries[0].completion; if ("throw" === t.type) throw t.arg; return this.rval; }, dispatchException: function dispatchException(e) { if (this.done) throw e; var r = this; function handle(n, o) { return a.type = "throw", a.arg = e, r.next = n, o && (r.method = "next", r.arg = t), !!o; } for (var o = this.tryEntries.length - 1; o >= 0; --o) { var i = this.tryEntries[o], a = i.completion; if ("root" === i.tryLoc) return handle("end"); if (i.tryLoc <= this.prev) { var c = n.call(i, "catchLoc"), u = n.call(i, "finallyLoc"); if (c && u) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } else if (c) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); } else { if (!u) throw new Error("try statement without catch or finally"); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } } } }, abrupt: function abrupt(t, e) { for (var r = this.tryEntries.length - 1; r >= 0; --r) { var o = this.tryEntries[r]; if (o.tryLoc <= this.prev && n.call(o, "finallyLoc") && this.prev < o.finallyLoc) { var i = o; break; } } i && ("break" === t || "continue" === t) && i.tryLoc <= e && e <= i.finallyLoc && (i = null); var a = i ? i.completion : {}; return a.type = t, a.arg = e, i ? (this.method = "next", this.next = i.finallyLoc, y) : this.complete(a); }, complete: function complete(t, e) { if ("throw" === t.type) throw t.arg; return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && e && (this.next = e), y; }, finish: function finish(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.finallyLoc === t) return this.complete(r.completion, r.afterLoc), resetTryEntry(r), y; } }, "catch": function _catch(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.tryLoc === t) { var n = r.completion; if ("throw" === n.type) { var o = n.arg; resetTryEntry(r); } return o; } } throw new Error("illegal catch attempt"); }, delegateYield: function delegateYield(e, r, n) { return this.delegate = { iterator: values(e), resultName: r, nextLoc: n }, "next" === this.method && (this.arg = t), y; } }, e; }
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }
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
var STATES = {
  backlog: 'Quero jogar',
  playing: 'Jogando',
  paused: 'Em pausa',
  finished: 'Concluído',
  quit: 'Deixei de jogar'
};
var nowDate = function nowDate() {
  return new Date().toLocaleDateString('en-CA');
};
var dateLabel = function dateLabel(v) {
  return new Date(v).toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};
function Icon(_ref) {
  var name = _ref.name;
  var paths = {
    home: 'M3 10l9-7 9 7v11h-6v-7H9v7H3z',
    library: 'M4 3v18M9 3v18M14 3v18M18 4l4 16',
    journal: 'M5 3h14v18H5zM9 8h6M9 12h6M9 16h3',
    explore: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18M16 8l-3 5-5 3 3-5z',
    profile: 'M16 7a4 4 0 1 0-8 0 4 4 0 0 0 8 0M4 21v-2a8 8 0 0 1 16 0v2',
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
  var _useState = useState(function () {
      return load(STORAGE_KEY, {});
    }),
    _useState2 = _slicedToArray(_useState, 2),
    library = _useState2[0],
    setLibrary = _useState2[1],
    _useState3 = useState(function () {
      return load(SETTINGS_KEY, {});
    }),
    _useState4 = _slicedToArray(_useState3, 2),
    settings = _useState4[0],
    setSettings = _useState4[1],
    _useState5 = useState(function () {
      return load(USER_KEY, {
        name: 'Viajante'
      });
    }),
    _useState6 = _slicedToArray(_useState5, 2),
    user = _useState6[0],
    setUser = _useState6[1];
  var _useState7 = useState('home'),
    _useState8 = _slicedToArray(_useState7, 2),
    view = _useState8[0],
    setView = _useState8[1],
    _useState9 = useState(null),
    _useState10 = _slicedToArray(_useState9, 2),
    selected = _useState10[0],
    setSelected = _useState10[1],
    _useState11 = useState(''),
    _useState12 = _slicedToArray(_useState11, 2),
    query = _useState12[0],
    setQuery = _useState12[1],
    _useState13 = useState('all'),
    _useState14 = _slicedToArray(_useState13, 2),
    filter = _useState14[0],
    setFilter = _useState14[1],
    _useState15 = useState(''),
    _useState16 = _slicedToArray(_useState15, 2),
    platform = _useState16[0],
    setPlatform = _useState16[1],
    _useState17 = useState('recent'),
    _useState18 = _slicedToArray(_useState17, 2),
    sort = _useState18[0],
    setSort = _useState18[1],
    _useState19 = useState(false),
    _useState20 = _slicedToArray(_useState19, 2),
    list = _useState20[0],
    setList = _useState20[1],
    _useState21 = useState([]),
    _useState22 = _slicedToArray(_useState21, 2),
    results = _useState22[0],
    setResults = _useState22[1],
    _useState23 = useState(false),
    _useState24 = _slicedToArray(_useState23, 2),
    busy = _useState24[0],
    setBusy = _useState24[1],
    _useState25 = useState(''),
    _useState26 = _slicedToArray(_useState25, 2),
    error = _useState26[0],
    setError = _useState26[1],
    _useState27 = useState(''),
    _useState28 = _slicedToArray(_useState27, 2),
    toast = _useState28[0],
    setToast = _useState28[1],
    _useState29 = useState(null),
    _useState30 = _slicedToArray(_useState29, 2),
    undo = _useState30[0],
    setUndo = _useState30[1],
    _useState31 = useState(''),
    _useState32 = _slicedToArray(_useState31, 2),
    collection = _useState32[0],
    setCollection = _useState32[1],
    _useState33 = useState(function () {
      return load('journey_collections_v1', []);
    }),
    _useState34 = _slicedToArray(_useState33, 2),
    collections = _useState34[0],
    setCollections = _useState34[1];
  var _useState35 = useState(null),
    _useState36 = _slicedToArray(_useState35, 2),
    modal = _useState36[0],
    setModal = _useState36[1],
    _useState37 = useState('journey'),
    _useState38 = _slicedToArray(_useState37, 2),
    tab = _useState38[0],
    setTab = _useState38[1],
    _useState39 = useState(false),
    _useState40 = _slicedToArray(_useState39, 2),
    ai = _useState40[0],
    setAi = _useState40[1],
    _useState41 = useState(''),
    _useState42 = _slicedToArray(_useState41, 2),
    prompt = _useState42[0],
    setPrompt = _useState42[1],
    _useState43 = useState(''),
    _useState44 = _slicedToArray(_useState43, 2),
    reply = _useState44[0],
    setReply = _useState44[1],
    _useState45 = useState(false),
    _useState46 = _slicedToArray(_useState45, 2),
    aiBusy = _useState46[0],
    setAiBusy = _useState46[1],
    _useState47 = useState(function () {
      return load(CHAT_KEY, []);
    }),
    _useState48 = _slicedToArray(_useState47, 2),
    history = _useState48[0],
    setHistory = _useState48[1];
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
            journey: j.title || 'Primeira jornada'
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
      setToast('Não foi possível salvar. Exporte um backup e libere espaço no dispositivo.');
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
      setToast('Jornada atualizada.');
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
    })))) setToast('Adicionado à sua biblioteca.');
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
    if (!selected && !modal && !ai) return;
    previousFocus.current = document.activeElement;
    var key = function key(e) {
      if (e.key === 'Escape') {
        setSelected(null);
        setModal(null);
        setAi(false);
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
  }, [!!selected, !!modal, ai]);
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
    _search = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee3(e) {
      return _regeneratorRuntime().wrap(function _callee3$(_context3) {
        while (1) switch (_context3.prev = _context3.next) {
          case 0:
            e === null || e === void 0 || e.preventDefault();
            if (query.trim()) {
              _context3.next = 3;
              break;
            }
            return _context3.abrupt("return");
          case 3:
            setError('');
            setBusy(true);
            _context3.prev = 5;
            if (settings.rawgKey) {
              _context3.next = 8;
              break;
            }
            throw Error('Adicione sua chave RAWG no Perfil para pesquisar o catálogo. Você também pode cadastrar um jogo manualmente.');
          case 8:
            _context3.t0 = setResults;
            _context3.next = 11;
            return searchGames({
              query: query.trim(),
              pageSize: 24
            }, settings.rawgKey);
          case 11:
            _context3.t1 = _context3.sent;
            (0, _context3.t0)(_context3.t1);
            _context3.next = 18;
            break;
          case 15:
            _context3.prev = 15;
            _context3.t2 = _context3["catch"](5);
            setError(_context3.t2.message);
          case 18:
            _context3.prev = 18;
            setBusy(false);
            return _context3.finish(18);
          case 21:
          case "end":
            return _context3.stop();
        }
      }, _callee3, null, [[5, 15, 18, 21]]);
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
    _restore = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee4(file) {
      var data;
      return _regeneratorRuntime().wrap(function _callee4$(_context4) {
        while (1) switch (_context4.prev = _context4.next) {
          case 0:
            if (file) {
              _context4.next = 2;
              break;
            }
            return _context4.abrupt("return");
          case 2:
            _context4.prev = 2;
            _context4.t0 = JSON;
            _context4.next = 6;
            return file.text();
          case 6:
            _context4.t1 = _context4.sent;
            data = _context4.t0.parse.call(_context4.t0, _context4.t1);
            if (!(data.format !== 'journey' || data.version !== 1 || !data.library || _typeof(data.library) !== 'object' || Array.isArray(data.library) || Object.entries(data.library).some(function (_ref14) {
              var _ref15 = _slicedToArray(_ref14, 2),
                id = _ref15[0],
                e = _ref15[1];
              return !(e !== null && e !== void 0 && e.game) || String(e.game.id) !== id || typeof e.game.name !== 'string' || !STATES[e.status] || e.journeys && !Array.isArray(e.journeys);
            }))) {
              _context4.next = 10;
              break;
            }
            throw Error('Arquivo de backup inválido.');
          case 10:
            setModal({
              type: 'restore',
              data: data
            });
            _context4.next = 16;
            break;
          case 13:
            _context4.prev = 13;
            _context4.t2 = _context4["catch"](2);
            setToast(_context4.t2.message);
          case 16:
            restoreRef.current.value = '';
          case 17:
          case "end":
            return _context4.stop();
        }
      }, _callee4, null, [[2, 13]]);
    }));
    return _restore.apply(this, arguments);
  }
  function ask(_x3) {
    return _ask.apply(this, arguments);
  }
  function _ask() {
    _ask = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee5(e) {
      var context, messages, answer, next;
      return _regeneratorRuntime().wrap(function _callee5$(_context5) {
        while (1) switch (_context5.prev = _context5.next) {
          case 0:
            e.preventDefault();
            if (settings.groqKey) {
              _context5.next = 4;
              break;
            }
            setReply('Configure sua chave Groq no Perfil para conversar com o PIXEL.');
            return _context5.abrupt("return");
          case 4:
            setAiBusy(true);
            _context5.prev = 5;
            context = selected ? library[selected.id] : entries.map(function (e) {
              return {
                name: e.game.name,
                status: e.status
              };
            });
            messages = history.concat({
              role: 'user',
              content: prompt
            }).slice(-12);
            _context5.next = 10;
            return callGroq(messages, 'Você é PIXEL, um companheiro de jogos calmo e prestativo no Journey. Responda em português em texto simples. Preferência de spoilers: ' + (settings.spoilers || 'Sem spoilers') + '. Use somente os registros fornecidos ao resumir progresso; não invente sessões ou acontecimentos. Não afirme alterar dados. Contexto: ' + JSON.stringify(context), settings.groqKey);
          case 10:
            answer = _context5.sent;
            setReply(answer);
            next = messages.concat({
              role: 'assistant',
              content: answer
            });
            setHistory(next);
            save(CHAT_KEY, next);
            setPrompt('');
            _context5.next = 21;
            break;
          case 18:
            _context5.prev = 18;
            _context5.t0 = _context5["catch"](5);
            setReply(_context5.t0.message);
          case 21:
            _context5.prev = 21;
            setAiBusy(false);
            return _context5.finish(21);
          case 24:
          case "end":
            return _context5.stop();
        }
      }, _callee5, null, [[5, 18, 21, 24]]);
    }));
    return _ask.apply(this, arguments);
  }
  function card(e) {
    var g = e.game || e;
    return /*#__PURE__*/React.createElement("button", {
      className: "game",
      key: g.id,
      onClick: function onClick() {
        setSelected(g);
        setTab('journey');
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
    }, /*#__PURE__*/React.createElement("h3", null, g.name), /*#__PURE__*/React.createElement("p", null, e.platform || g.genres || g.released || 'Sua próxima aventura')));
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
    }, "Encontrar um jogo \u2192"));
  }
  var entry = selected && library[selected.id],
    journeys = (entry === null || entry === void 0 ? void 0 : entry.journeys) || [{
      id: 'original',
      title: 'Primeira jornada',
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
    }
  }, "journey", /*#__PURE__*/React.createElement("span", null, "\u2197")), /*#__PURE__*/React.createElement("div", {
    className: "nav-caption"
  }, "SEU UNIVERSO DE JOGOS"), /*#__PURE__*/React.createElement("nav", null, [['home', 'Início'], ['library', 'Biblioteca'], ['journal', 'Diário'], ['explore', 'Explorar'], ['profile', 'Perfil']].map(function (_ref2) {
    var _ref3 = _slicedToArray(_ref2, 2),
      v = _ref3[0],
      label = _ref3[1];
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
  }, /*#__PURE__*/React.createElement("p", null, "Uma hist\xF3ria de cada vez."), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return nav('profile');
    },
    className: "avatar-row"
  }, /*#__PURE__*/React.createElement("b", null, ((user === null || user === void 0 ? void 0 : user.name) || 'V')[0]), /*#__PURE__*/React.createElement("span", null, (user === null || user === void 0 ? void 0 : user.name) || 'Viajante', /*#__PURE__*/React.createElement("small", null, "Minha jornada"))))), /*#__PURE__*/React.createElement("main", null, /*#__PURE__*/React.createElement("header", null, /*#__PURE__*/React.createElement("span", null, {
    home: 'O próximo capítulo é seu.',
    library: 'Todos os mundos que você guarda.',
    journal: 'Pequenos registros. Grandes histórias.',
    explore: 'Encontre sua próxima aventura.',
    profile: 'Sua história, até aqui.'
  }[view]), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      setAi(true);
      setReply('');
    },
    className: "pixel"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "spark"
  }), " PIXEL")), view === 'home' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "page-title"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "SEU PONTO DE PARTIDA"), /*#__PURE__*/React.createElement("h1", null, "Continue sua jornada", /*#__PURE__*/React.createElement("span", null, ".")), /*#__PURE__*/React.createElement("p", null, "Bom te ver, ", (user === null || user === void 0 ? void 0 : user.name) || 'Viajante', ". H\xE1 mundos esperando por voc\xEA."))), hero ? /*#__PURE__*/React.createElement("section", {
    className: "hero"
  }, hero.game.cover && /*#__PURE__*/React.createElement("img", {
    src: hero.game.cover,
    alt: ""
  }), /*#__PURE__*/React.createElement("div", {
    className: "hero-content"
  }, /*#__PURE__*/React.createElement("small", null, STATES[hero.status], " \xB7 ", hero.platform || 'Sua biblioteca'), /*#__PURE__*/React.createElement("h2", null, hero.game.name), /*#__PURE__*/React.createElement("p", null, hero.where || 'Cada sessão escreve um novo capítulo da sua história.'), /*#__PURE__*/React.createElement("button", {
    className: "primary",
    onClick: function onClick() {
      setSelected(hero.game);
      setTab('journey');
    }
  }, "Continuar jornada \u2197"))) : /*#__PURE__*/React.createElement("section", {
    className: "hero welcome"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hero-content"
  }, /*#__PURE__*/React.createElement("small", null, "UM NOVO COME\xC7O"), /*#__PURE__*/React.createElement("h2", null, "Todo grande jogo", /*#__PURE__*/React.createElement("br", null), "deixa uma hist\xF3ria."), /*#__PURE__*/React.createElement("p", null, "Guarde a sua. Comece pelo que voc\xEA est\xE1 jogando agora."), /*#__PURE__*/React.createElement("button", {
    className: "primary",
    onClick: function onClick() {
      return nav('explore');
    }
  }, "Come\xE7ar minha jornada \u2197")), /*#__PURE__*/React.createElement("div", {
    className: "orbit",
    "aria-hidden": "true"
  }, "J")), /*#__PURE__*/React.createElement("div", {
    className: "section-heading"
  }, /*#__PURE__*/React.createElement("h2", null, "Em seus controles"), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return nav('library');
    }
  }, "Ver biblioteca \u2197")), playing.length ? /*#__PURE__*/React.createElement("div", {
    className: "grid"
  }, playing.map(card)) : /*#__PURE__*/React.createElement("div", {
    className: "panel"
  }, /*#__PURE__*/React.createElement("p", null, "Marque um jogo como \u201CJogando\u201D para encontr\xE1-lo aqui.")), /*#__PURE__*/React.createElement("div", {
    className: "two-col"
  }, /*#__PURE__*/React.createElement("section", {
    className: "panel"
  }, /*#__PURE__*/React.createElement("small", null, "\xDALTIMA MEM\xD3RIA"), sessions[0] ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("h2", null, sessions[0].game.name), /*#__PURE__*/React.createElement("p", null, sessions[0].text || 'Uma nova sessão registrada.'), /*#__PURE__*/React.createElement("small", null, dateLabel(sessions[0].date + 'T12:00:00')), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return nav('journal');
    }
  }, "Abrir di\xE1rio \u2197")) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("h2", null, "O que ficou com voc\xEA?"), /*#__PURE__*/React.createElement("p", null, "Uma descoberta, uma batalha ou aquele cen\xE1rio. Seu di\xE1rio come\xE7a com uma lembran\xE7a."))), /*#__PURE__*/React.createElement("section", {
    className: "panel"
  }, /*#__PURE__*/React.createElement("small", null, "PR\xD3XIMOS CAP\xCDTULOS"), entries.filter(function (e) {
    return e.status === 'backlog';
  }).slice(0, 3).map(function (e) {
    return /*#__PURE__*/React.createElement("button", {
      className: "next-game",
      key: e.game.id,
      onClick: function onClick() {
        return setSelected(e.game);
      }
    }, e.game.name, /*#__PURE__*/React.createElement("span", null, "\u2197"));
  }), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return nav('explore');
    }
  }, "Explorar possibilidades \u2192")))), view === 'library' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "page-title"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "SEUS MUNDOS"), /*#__PURE__*/React.createElement("h1", null, "Biblioteca", /*#__PURE__*/React.createElement("span", null, ".")), /*#__PURE__*/React.createElement("p", null, entries.length, " jogos. Incont\xE1veis hist\xF3rias.")), /*#__PURE__*/React.createElement("button", {
    className: "primary",
    onClick: function onClick() {
      return setModal({
        type: 'manual'
      });
    }
  }, "+ Adicionar jogo")), /*#__PURE__*/React.createElement("div", {
    className: "tabs"
  }, [['all', 'Todos']].concat(_toConsumableArray(Object.entries(STATES))).map(function (_ref4) {
    var _ref5 = _slicedToArray(_ref4, 2),
      v = _ref5[0],
      l = _ref5[1];
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
    "aria-label": "Buscar na biblioteca",
    placeholder: "Buscar nos seus jogos\u2026",
    value: query,
    onChange: function onChange(e) {
      return setQuery(e.target.value);
    }
  }), /*#__PURE__*/React.createElement("select", {
    "aria-label": "Plataforma",
    value: platform,
    onChange: function onChange(e) {
      return setPlatform(e.target.value);
    }
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "Todas as plataformas"), _toConsumableArray(new Set(entries.map(function (e) {
    return e.platform;
  }).filter(Boolean))).map(function (p) {
    return /*#__PURE__*/React.createElement("option", {
      key: p
    }, p);
  })), /*#__PURE__*/React.createElement("select", {
    "aria-label": "Ordena\xE7\xE3o",
    value: sort,
    onChange: function onChange(e) {
      return setSort(e.target.value);
    }
  }, /*#__PURE__*/React.createElement("option", {
    value: "recent"
  }, "Recentes"), /*#__PURE__*/React.createElement("option", {
    value: "name"
  }, "Nome A\u2013Z"), /*#__PURE__*/React.createElement("option", {
    value: "rating"
  }, "Minha nota")), /*#__PURE__*/React.createElement("button", {
    "aria-pressed": list,
    onClick: function onClick() {
      return setList(!list);
    }
  }, list ? 'Grade' : 'Lista')), /*#__PURE__*/React.createElement("div", {
    className: "collections"
  }, /*#__PURE__*/React.createElement("button", {
    className: !collection ? 'active' : '',
    onClick: function onClick() {
      return setCollection('');
    }
  }, "Todas as cole\xE7\xF5es"), collections.map(function (c) {
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
  }, "+ Cole\xE7\xE3o")), filtered.length ? /*#__PURE__*/React.createElement("div", {
    className: 'grid ' + (list ? 'list' : '')
  }, filtered.map(card)) : empty('Um espaço para suas histórias', 'Adicione seu primeiro jogo ou ajuste os filtros.')), view === 'journal' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "page-title"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "SEU \xC1LBUM DE MEM\xD3RIAS"), /*#__PURE__*/React.createElement("h1", null, "Di\xE1rio", /*#__PURE__*/React.createElement("span", null, ".")), /*#__PURE__*/React.createElement("p", null, "O que voc\xEA jogou. O que voc\xEA sentiu. O que ficou."))), sessions.length ? /*#__PURE__*/React.createElement("div", {
    className: "timeline"
  }, sessions.map(function (s, i) {
    return /*#__PURE__*/React.createElement("article", {
      className: "memory",
      key: s.id + '-' + i
    }, /*#__PURE__*/React.createElement("small", null, dateLabel(s.date + 'T12:00:00'), " \xB7 ", s.minutes ? s.minutes + ' min' : 'Sem duração', " \xB7 ", s.journey), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        return setSelected(s.game);
      }
    }, /*#__PURE__*/React.createElement("h2", null, s.game.name, " \u2197")), s.text && /*#__PURE__*/React.createElement("p", null, s.text), s.image && /*#__PURE__*/React.createElement("img", {
      src: s.image,
      alt: 'Memória de ' + s.game.name
    }));
  })) : empty('Sua história merece ser lembrada', 'Abra um jogo da biblioteca e registre sua primeira sessão.')), view === 'explore' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "page-title"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "AL\xC9M DO PR\xD3XIMO HORIZONTE"), /*#__PURE__*/React.createElement("h1", null, "Explorar", /*#__PURE__*/React.createElement("span", null, ".")), /*#__PURE__*/React.createElement("p", null, "Qual mundo voc\xEA quer conhecer agora?")), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setModal({
        type: 'manual'
      });
    }
  }, "Cadastrar manualmente \u2197")), /*#__PURE__*/React.createElement("form", {
    className: "searchbar",
    onSubmit: search
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "explore"
  }), /*#__PURE__*/React.createElement("input", {
    "aria-label": "Nome do jogo",
    placeholder: "Busque um jogo, uma nova hist\xF3ria\u2026",
    value: query,
    onChange: function onChange(e) {
      return setQuery(e.target.value);
    }
  }), /*#__PURE__*/React.createElement("button", {
    className: "primary",
    disabled: busy
  }, busy ? 'Buscando…' : 'Buscar')), error && /*#__PURE__*/React.createElement("p", {
    className: "notice",
    role: "alert"
  }, error), results.length ? /*#__PURE__*/React.createElement("div", {
    className: "grid"
  }, results.map(card)) : !busy && empty('Há um mundo para cada momento', 'Pesquise pelo nome de um jogo ou registre um título manualmente.', /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setModal({
        type: 'manual'
      });
    }
  }, "+ Cadastrar jogo")), /*#__PURE__*/React.createElement("p", {
    className: "attribution"
  }, "Cat\xE1logo e imagens: RAWG. Registros pessoais ficam neste dispositivo.")), view === 'profile' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "page-title"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("small", null, "O JOGADOR POR TR\xC1S DAS HIST\xD3RIAS"), /*#__PURE__*/React.createElement("h1", null, (user === null || user === void 0 ? void 0 : user.name) || 'Viajante', /*#__PURE__*/React.createElement("span", null, ".")), /*#__PURE__*/React.createElement("p", null, "Cada mundo visitado faz parte de voc\xEA."))), /*#__PURE__*/React.createElement("div", {
    className: "stats"
  }, [[entries.length, 'na biblioteca'], [entries.filter(function (e) {
    return e.status === 'finished';
  }).length, 'concluídos'], [sessions.length, 'memórias'], [(sessions.reduce(function (n, s) {
    return n + (+s.minutes || 0);
  }, 0) / 60).toFixed(1) + 'h', 'registradas']].map(function (_ref6) {
    var _ref7 = _slicedToArray(_ref6, 2),
      n = _ref7[0],
      l = _ref7[1];
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
          name: f.get('name').trim() || 'Viajante'
        }),
        s = _objectSpread(_objectSpread({}, settings), {}, {
          groqKey: f.get('groq').trim(),
          rawgKey: f.get('rawg').trim(),
          spoilers: f.get('spoilers')
        });
      try {
        localStorage.setItem(USER_KEY, JSON.stringify(u));
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
        setUser(u);
        setSettings(s);
        setToast('Preferências salvas.');
      } catch (e) {
        setToast('Não foi possível salvar as preferências.');
      }
    }
  }, /*#__PURE__*/React.createElement("h2", null, "Seu espa\xE7o"), /*#__PURE__*/React.createElement("label", null, "Como podemos chamar voc\xEA?", /*#__PURE__*/React.createElement("input", {
    name: "name",
    defaultValue: user === null || user === void 0 ? void 0 : user.name,
    maxLength: "80"
  })), /*#__PURE__*/React.createElement("label", null, "Spoilers", /*#__PURE__*/React.createElement("select", {
    name: "spoilers",
    defaultValue: settings.spoilers || 'Sem spoilers'
  }, /*#__PURE__*/React.createElement("option", null, "Sem spoilers"), /*#__PURE__*/React.createElement("option", null, "Dicas leves"), /*#__PURE__*/React.createElement("option", null, "Resposta completa"))), /*#__PURE__*/React.createElement("label", null, "Chave RAWG \xB7 cat\xE1logo", /*#__PURE__*/React.createElement("input", {
    name: "rawg",
    type: "password",
    autoComplete: "off",
    defaultValue: settings.rawgKey
  })), /*#__PURE__*/React.createElement("label", null, "Chave Groq \xB7 PIXEL", /*#__PURE__*/React.createElement("input", {
    name: "groq",
    type: "password",
    autoComplete: "off",
    defaultValue: settings.groqKey
  })), /*#__PURE__*/React.createElement("p", null, "Chaves guardadas neste navegador e enviadas apenas ao respectivo provedor ao usar o recurso. Biblioteca e di\xE1rio funcionam sem IA."), /*#__PURE__*/React.createElement("p", null, "Ao conversar, sua pergunta e o contexto do jogo aberto (ou os nomes e estados da biblioteca) s\xE3o enviados \xE0 Groq."), /*#__PURE__*/React.createElement("button", {
    className: "primary"
  }, "Salvar prefer\xEAncias")), /*#__PURE__*/React.createElement("div", {
    className: "panel"
  }, /*#__PURE__*/React.createElement("h2", null, "Suas mem\xF3rias, com voc\xEA."), /*#__PURE__*/React.createElement("p", null, "Exporte um backup antes de trocar de aparelho ou limpar os dados do navegador. O arquivo inclui biblioteca, jornadas, imagens e cole\xE7\xF5es; n\xE3o inclui chaves de API."), /*#__PURE__*/React.createElement("button", {
    className: "primary",
    onClick: backup
  }, "Exportar backup"), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return restoreRef.current.click();
    }
  }, "Importar backup"), /*#__PURE__*/React.createElement("input", {
    ref: restoreRef,
    type: "file",
    accept: "application/json",
    hidden: true,
    onChange: function onChange(e) {
      return restore(e.target.files[0]);
    }
  }), /*#__PURE__*/React.createElement("hr", null), /*#__PURE__*/React.createElement("h2", null, "Seu ano em jogos"), /*#__PURE__*/React.createElement("p", null, entries.filter(function (e) {
    return e.status === 'finished' && new Date(e.updatedAt).getFullYear() === new Date().getFullYear();
  }).length, " jogos conclu\xEDdos ou atualizados como conclu\xEDdos neste ano."), /*#__PURE__*/React.createElement("p", null, "G\xEAneros na sua biblioteca: ", _toConsumableArray(new Set(entries.flatMap(function (e) {
    return (e.game.genres || '').split(', ').filter(Boolean);
  }))).slice(0, 6).join(' · ') || 'Suas preferências começam a aparecer conforme você adiciona jogos.'), /*#__PURE__*/React.createElement("small", null, "Journey \xB7 suas hist\xF3rias nos jogos"))))), selected && /*#__PURE__*/React.createElement("div", {
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
    "aria-label": "Fechar jogo",
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
  }, !entry ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("p", null, "Adicione \xE0 biblioteca para come\xE7ar a guardar sua hist\xF3ria."), /*#__PURE__*/React.createElement("button", {
    className: "primary",
    onClick: function onClick() {
      return add(selected);
    }
  }, "+ Adicionar \xE0 biblioteca")) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "tabs"
  }, [['journey', 'Minha jornada'], ['about', 'Sobre'], ['memories', 'Memórias']].map(function (_ref8) {
    var _ref9 = _slicedToArray(_ref8, 2),
      v = _ref9[0],
      l = _ref9[1];
    return /*#__PURE__*/React.createElement("button", {
      key: v,
      className: tab === v ? 'active' : '',
      onClick: function onClick() {
        return setTab(v);
      }
    }, l);
  })), tab === 'journey' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "toolbar"
  }, /*#__PURE__*/React.createElement("select", {
    "aria-label": "Status da jornada",
    value: entry.status,
    onChange: function onChange(e) {
      return change(selected.id, {
        status: e.target.value
      });
    }
  }, Object.entries(STATES).map(function (_ref10) {
    var _ref11 = _slicedToArray(_ref10, 2),
      v = _ref11[0],
      l = _ref11[1];
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
  }, "+ Registrar sess\xE3o")), /*#__PURE__*/React.createElement("form", {
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
  }, /*#__PURE__*/React.createElement("label", null, "Onde voc\xEA est\xE1 jogando?", /*#__PURE__*/React.createElement("input", {
    name: "platform",
    list: "platforms",
    defaultValue: entry.platform || '',
    placeholder: "Escolha ou digite sua plataforma"
  }), /*#__PURE__*/React.createElement("datalist", {
    id: "platforms"
  }, PLATFORMS_LIST.map(function (p) {
    return /*#__PURE__*/React.createElement("option", {
      key: p
    }, p);
  }))), /*#__PURE__*/React.createElement("div", {
    className: "two-col"
  }, /*#__PURE__*/React.createElement("label", null, "Acesso", /*#__PURE__*/React.createElement("select", {
    name: "access",
    defaultValue: entry.access || 'Tenho'
  }, ['Tenho', 'Assinatura', 'Emprestado', 'Desejo comprar'].map(function (x) {
    return /*#__PURE__*/React.createElement("option", {
      key: x
    }, x);
  }))), /*#__PURE__*/React.createElement("label", null, "Conclus\xE3o", /*#__PURE__*/React.createElement("select", {
    name: "completion",
    defaultValue: entry.completion || ''
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "Ainda em jornada"), ['História concluída', '100%', 'Platinado', 'Jogo contínuo'].map(function (x) {
    return /*#__PURE__*/React.createElement("option", {
      key: x
    }, x);
  })))), /*#__PURE__*/React.createElement("label", null, "Onde parei", /*#__PURE__*/React.createElement("textarea", {
    name: "where",
    defaultValue: entry.where || '',
    placeholder: "Deixe uma pista para quando voltar\u2026",
    maxLength: "4000"
  })), /*#__PURE__*/React.createElement("div", {
    className: "two-col"
  }, /*#__PURE__*/React.createElement("label", null, "Comecei em", /*#__PURE__*/React.createElement("input", {
    type: "date",
    name: "start",
    defaultValue: entry.startDate || ''
  })), /*#__PURE__*/React.createElement("label", null, "Terminei em", /*#__PURE__*/React.createElement("input", {
    type: "date",
    name: "end",
    defaultValue: entry.endDate || ''
  }))), /*#__PURE__*/React.createElement("label", null, "Minha nota \xB7 0 a 10", /*#__PURE__*/React.createElement("input", {
    name: "rating",
    type: "number",
    min: "0",
    max: "10",
    step: "0.5",
    defaultValue: (_entry$rating = entry.rating) !== null && _entry$rating !== void 0 ? _entry$rating : ''
  })), /*#__PURE__*/React.createElement("label", null, "O que ficou comigo", /*#__PURE__*/React.createElement("textarea", {
    name: "note",
    defaultValue: entry.note || '',
    placeholder: "Sua impress\xE3o, momento favorito ou vontade de voltar\u2026",
    maxLength: "8000"
  })), collections.length > 0 && /*#__PURE__*/React.createElement("fieldset", null, /*#__PURE__*/React.createElement("legend", null, "Cole\xE7\xF5es"), collections.map(function (c) {
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
  }, "Salvar minha jornada")), /*#__PURE__*/React.createElement("hr", null), /*#__PURE__*/React.createElement("div", {
    className: "toolbar"
  }, /*#__PURE__*/React.createElement("select", {
    "aria-label": "Selecionar campanha",
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
  }, "+ Nova campanha / replay")), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      setAi(true);
      setReply('');
      setPrompt('Me ajude a retomar este jogo usando minhas anotações.');
    }
  }, "Consultar o PIXEL \u2197")), tab === 'about' && /*#__PURE__*/React.createElement("div", {
    className: "panel"
  }, /*#__PURE__*/React.createElement("h2", null, "Sobre este mundo"), /*#__PURE__*/React.createElement("p", null, selected.description || 'Abra os detalhes do catálogo para consultar a sinopse e as informações do jogo.'), /*#__PURE__*/React.createElement("p", null, "Plataformas do cat\xE1logo: ", selected.platforms || 'Não informadas'), settings.rawgKey && !String(selected.id).startsWith('manual-') && /*#__PURE__*/React.createElement("button", {
    disabled: busy,
    onClick: /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
      return _regeneratorRuntime().wrap(function _callee$(_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            setBusy(true);
            _context.prev = 1;
            _context.t0 = setSelected;
            _context.t1 = _objectSpread;
            _context.t2 = _objectSpread({}, selected);
            _context.next = 7;
            return fetchGameDetail(selected.id, settings.rawgKey);
          case 7:
            _context.t3 = _context.sent;
            _context.t4 = (0, _context.t1)(_context.t2, _context.t3);
            (0, _context.t0)(_context.t4);
            _context.next = 15;
            break;
          case 12:
            _context.prev = 12;
            _context.t5 = _context["catch"](1);
            setToast('Não foi possível carregar os detalhes. Tente novamente.');
          case 15:
            _context.prev = 15;
            setBusy(false);
            return _context.finish(15);
          case 18:
          case "end":
            return _context.stop();
        }
      }, _callee, null, [[1, 12, 15, 18]]);
    }))
  }, busy ? 'Carregando…' : 'Carregar detalhes RAWG')), tab === 'memories' && (sessions.filter(function (s) {
    return s.game.id === selected.id;
  }).length ? sessions.filter(function (s) {
    return s.game.id === selected.id;
  }).map(function (s, i) {
    return /*#__PURE__*/React.createElement("article", {
      className: "memory",
      key: i
    }, /*#__PURE__*/React.createElement("small", null, dateLabel(s.date + 'T12:00:00'), " \xB7 ", s.journey, " \xB7 ", s.minutes || 0, " min"), /*#__PURE__*/React.createElement("p", null, s.text), s.image && /*#__PURE__*/React.createElement("img", {
      src: s.image,
      alt: "Mem\xF3ria do jogo"
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
    }, "Editar registro"));
  }) : /*#__PURE__*/React.createElement("p", {
    className: "empty"
  }, "Registre sua primeira sess\xE3o para guardar uma mem\xF3ria.")))))), modal && /*#__PURE__*/React.createElement("div", {
    className: "backdrop top"
  }, /*#__PURE__*/React.createElement("section", {
    className: "dialog compact",
    role: "dialog",
    "aria-modal": "true",
    "aria-label": "Registrar no Journey"
  }, /*#__PURE__*/React.createElement("button", {
    className: "close",
    "aria-label": "Fechar registro",
    onClick: function onClick() {
      return setModal(null);
    }
  }, "\xD7"), modal.type === 'restore' ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("h2", null, "Importar suas jornadas?"), /*#__PURE__*/React.createElement("p", null, "Os jogos do arquivo ser\xE3o mesclados com a biblioteca. Em jogos com o mesmo identificador, prevalece o backup. Exporte seus dados atuais antes de continuar."), /*#__PURE__*/React.createElement("button", {
    onClick: backup
  }, "Exportar dados atuais"), /*#__PURE__*/React.createElement("button", {
    className: "primary",
    onClick: function onClick() {
      if (persist(_objectSpread(_objectSpread({}, library), modal.data.library))) {
        var c = _toConsumableArray(new Set([].concat(_toConsumableArray(collections), _toConsumableArray((modal.data.collections || []).filter(function (x) {
          return typeof x === 'string';
        })))));
        setCollections(c);
        save('journey_collections_v1', c);
        setModal(null);
        setToast('Backup importado.');
      }
    }
  }, "Importar e mesclar")) : /*#__PURE__*/React.createElement("form", {
    className: "form",
    onSubmit: ( /*#__PURE__*/function () {
      var _ref13 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2(e) {
        var f, name, _name, next, en, js, j, _modal$session, _fileRef$current, _modal$session2, image, file, _en, _js, session;
        return _regeneratorRuntime().wrap(function _callee2$(_context2) {
          while (1) switch (_context2.prev = _context2.next) {
            case 0:
              e.preventDefault();
              f = new FormData(e.currentTarget);
              if (!(modal.type === 'manual')) {
                _context2.next = 8;
                break;
              }
              name = f.get('name').trim();
              if (name) {
                _context2.next = 6;
                break;
              }
              return _context2.abrupt("return");
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
                _context2.next = 14;
                break;
              }
              _name = f.get('name').trim();
              if (_name) {
                _context2.next = 12;
                break;
              }
              return _context2.abrupt("return");
            case 12:
              next = _toConsumableArray(new Set([].concat(_toConsumableArray(collections), [_name])));
              try {
                localStorage.setItem('journey_collections_v1', JSON.stringify(next));
                setCollections(next);
                setModal(null);
              } catch (e) {
                setToast('Não foi possível salvar.');
              }
            case 14:
              if (modal.type === 'replay') {
                en = library[modal.id], js = en.journeys || [{
                  id: 'original',
                  title: 'Primeira jornada',
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
                _context2.next = 28;
                break;
              }
              image = ((_modal$session = modal.session) === null || _modal$session === void 0 ? void 0 : _modal$session.image) || '';
              file = (_fileRef$current = fileRef.current) === null || _fileRef$current === void 0 ? void 0 : _fileRef$current.files[0];
              if (!file) {
                _context2.next = 25;
                break;
              }
              if (!(!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 1500000)) {
                _context2.next = 22;
                break;
              }
              setToast('Escolha uma imagem JPG, PNG ou WebP de até 1,5 MB.');
              return _context2.abrupt("return");
            case 22:
              _context2.next = 24;
              return new Promise(function (resolve, reject) {
                var r = new FileReader();
                r.onload = function () {
                  return resolve(r.result);
                };
                r.onerror = reject;
                r.readAsDataURL(file);
              });
            case 24:
              image = _context2.sent;
            case 25:
              _en = library[modal.id], _js = _en.journeys || [{
                id: 'original',
                title: 'Primeira jornada',
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
                setToast('Memória guardada.');
              }
            case 28:
            case "end":
              return _context2.stop();
          }
        }, _callee2);
      }));
      return function (_x4) {
        return _ref13.apply(this, arguments);
      };
    }())
  }, /*#__PURE__*/React.createElement("small", null, "ESCREVA SEU PR\xD3XIMO CAP\xCDTULO"), /*#__PURE__*/React.createElement("h2", null, {
    manual: 'Adicionar um mundo',
    collection: 'Nova coleção',
    replay: 'Uma nova jornada',
    session: 'Guardar uma memória'
  }[modal.type]), modal.type === 'session' ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("label", null, "Data", /*#__PURE__*/React.createElement("input", {
    name: "date",
    type: "date",
    defaultValue: ((_modal$session3 = modal.session) === null || _modal$session3 === void 0 ? void 0 : _modal$session3.date) || nowDate(),
    required: true
  })), /*#__PURE__*/React.createElement("label", null, "Tempo jogado \xB7 minutos", /*#__PURE__*/React.createElement("input", {
    name: "minutes",
    type: "number",
    min: "0",
    max: "1440",
    defaultValue: ((_modal$session4 = modal.session) === null || _modal$session4 === void 0 ? void 0 : _modal$session4.minutes) || ''
  })), /*#__PURE__*/React.createElement("label", null, "O que aconteceu?", /*#__PURE__*/React.createElement("textarea", {
    name: "text",
    maxLength: "8000",
    defaultValue: ((_modal$session5 = modal.session) === null || _modal$session5 === void 0 ? void 0 : _modal$session5.text) || '',
    placeholder: "Uma descoberta, um desafio ou como voc\xEA se sentiu\u2026"
  })), /*#__PURE__*/React.createElement("label", null, "Screenshot \xB7 opcional", /*#__PURE__*/React.createElement("input", {
    ref: fileRef,
    type: "file",
    accept: "image/png,image/jpeg,image/webp"
  })), /*#__PURE__*/React.createElement("p", null, "At\xE9 1,5 MB por imagem. Exporte backups para preservar suas mem\xF3rias.")) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("label", null, "Nome", /*#__PURE__*/React.createElement("input", {
    name: "name",
    required: true,
    maxLength: "160",
    autoFocus: true,
    placeholder: modal.type === 'collection' ? 'Favoritos da vida' : modal.type === 'replay' ? 'Segunda campanha · PC' : 'Nome do jogo'
  })), modal.type === 'manual' && /*#__PURE__*/React.createElement("label", null, "G\xEAnero \xB7 opcional", /*#__PURE__*/React.createElement("input", {
    name: "genre",
    maxLength: "100",
    placeholder: "RPG, aventura\u2026"
  }))), /*#__PURE__*/React.createElement("button", {
    className: "primary"
  }, modal.type === 'session' ? 'Guardar memória' : 'Salvar')))), ai && /*#__PURE__*/React.createElement("div", {
    className: "backdrop top"
  }, /*#__PURE__*/React.createElement("section", {
    className: "dialog compact",
    role: "dialog",
    "aria-modal": "true",
    "aria-label": "Conversar com PIXEL"
  }, /*#__PURE__*/React.createElement("button", {
    className: "close",
    "aria-label": "Fechar PIXEL",
    onClick: function onClick() {
      return setAi(false);
    }
  }, "\xD7"), /*#__PURE__*/React.createElement("small", null, "SEU COMPANHEIRO DE JORNADA"), /*#__PURE__*/React.createElement("h2", null, "Um momento com PIXEL."), /*#__PURE__*/React.createElement("p", null, selected ? 'Conversando sobre ' + selected.name : 'Encontre seu próximo jogo ou converse sobre sua biblioteca.'), /*#__PURE__*/React.createElement("small", null, settings.spoilers || 'Sem spoilers'), /*#__PURE__*/React.createElement("div", {
    className: "ai-reply",
    "aria-live": "polite"
  }, aiBusy ? 'Pensando na sua jornada…' : reply || 'O que vamos descobrir hoje?'), /*#__PURE__*/React.createElement("form", {
    className: "form",
    onSubmit: ask
  }, /*#__PURE__*/React.createElement("label", null, "Sua mensagem", /*#__PURE__*/React.createElement("textarea", {
    required: true,
    value: prompt,
    onChange: function onChange(e) {
      return setPrompt(e.target.value);
    },
    maxLength: "4000"
  })), /*#__PURE__*/React.createElement("button", {
    className: "primary",
    disabled: aiBusy
  }, "Enviar ao PIXEL \u2192")), /*#__PURE__*/React.createElement("small", null, "Respostas de IA podem conter erros. O PIXEL n\xE3o altera seus registros."))), toast && /*#__PURE__*/React.createElement("div", {
    className: "toast",
    role: "status"
  }, toast, undo && /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      if (persist(undo)) {
        setUndo(null);
        setToast('Alteração desfeita.');
      }
    }
  }, "Desfazer"), /*#__PURE__*/React.createElement("button", {
    "aria-label": "Dispensar mensagem",
    onClick: function onClick() {
      return setToast('');
    }
  }, "\xD7")));
}
ReactDOM.createRoot(document.getElementById('root')).render( /*#__PURE__*/React.createElement(Journey, null));
