(function(global) {
  'use strict';
  if (global.$traceurRuntime) {
    return ;
  }
  var $Object = Object;
  var $TypeError = TypeError;
  var $create = $Object.create;
  var $defineProperties = $Object.defineProperties;
  var $defineProperty = $Object.defineProperty;
  var $freeze = $Object.freeze;
  var $getOwnPropertyDescriptor = $Object.getOwnPropertyDescriptor;
  var $getOwnPropertyNames = $Object.getOwnPropertyNames;
  var $keys = $Object.keys;
  var $hasOwnProperty = $Object.prototype.hasOwnProperty;
  var $toString = $Object.prototype.toString;
  var $preventExtensions = Object.preventExtensions;
  var $seal = Object.seal;
  var $isExtensible = Object.isExtensible;
  var $apply = Function.prototype.call.bind(Function.prototype.apply);
  function $bind(operand, thisArg, args) {
    var argArray = [thisArg];
    for (var i = 0; i < args.length; i++) {
      argArray[i + 1] = args[i];
    }
    var func = $apply(Function.prototype.bind, operand, argArray);
    return func;
  }
  function $construct(func, argArray) {
    var object = new ($bind(func, null, argArray));
    return object;
  }
  var counter = 0;
  function newUniqueString() {
    return '__$' + Math.floor(Math.random() * 1e9) + '$' + ++counter + '$__';
  }
  var privateNames = $create(null);
  function isPrivateName(s) {
    return privateNames[s];
  }
  function createPrivateName() {
    var s = newUniqueString();
    privateNames[s] = true;
    return s;
  }
  var CONTINUATION_TYPE = Object.create(null);
  function createContinuation(operand, thisArg, argsArray) {
    return [CONTINUATION_TYPE, operand, thisArg, argsArray];
  }
  function isContinuation(object) {
    return object && object[0] === CONTINUATION_TYPE;
  }
  var isTailRecursiveName = null;
  function setupProperTailCalls() {
    isTailRecursiveName = createPrivateName();
    Function.prototype.call = initTailRecursiveFunction(function call(thisArg) {
      var result = tailCall(function(thisArg) {
        var argArray = [];
        for (var i = 1; i < arguments.length; ++i) {
          argArray[i - 1] = arguments[i];
        }
        var continuation = createContinuation(this, thisArg, argArray);
        return continuation;
      }, this, arguments);
      return result;
    });
    Function.prototype.apply = initTailRecursiveFunction(function apply(thisArg, argArray) {
      var result = tailCall(function(thisArg, argArray) {
        var continuation = createContinuation(this, thisArg, argArray);
        return continuation;
      }, this, arguments);
      return result;
    });
  }
  function initTailRecursiveFunction(func) {
    if (isTailRecursiveName === null) {
      setupProperTailCalls();
    }
    func[isTailRecursiveName] = true;
    return func;
  }
  function isTailRecursive(func) {
    return !!func[isTailRecursiveName];
  }
  function tailCall(func, thisArg, argArray) {
    var continuation = argArray[0];
    if (isContinuation(continuation)) {
      continuation = $apply(func, thisArg, continuation[3]);
      return continuation;
    }
    continuation = createContinuation(func, thisArg, argArray);
    while (true) {
      if (isTailRecursive(func)) {
        continuation = $apply(func, continuation[2], [continuation]);
      } else {
        continuation = $apply(func, continuation[2], continuation[3]);
      }
      if (!isContinuation(continuation)) {
        return continuation;
      }
      func = continuation[1];
    }
  }
  function construct() {
    var object;
    if (isTailRecursive(this)) {
      object = $construct(this, [createContinuation(null, null, arguments)]);
    } else {
      object = $construct(this, arguments);
    }
    return object;
  }
  var $traceurRuntime = {
    initTailRecursiveFunction: initTailRecursiveFunction,
    call: tailCall,
    continuation: createContinuation,
    construct: construct
  };
  (function() {
    function nonEnum(value) {
      return {
        configurable: true,
        enumerable: false,
        value: value,
        writable: true
      };
    }
    var method = nonEnum;
    var symbolInternalProperty = newUniqueString();
    var symbolDescriptionProperty = newUniqueString();
    var symbolDataProperty = newUniqueString();
    var symbolValues = $create(null);
    function isShimSymbol(symbol) {
      return typeof symbol === 'object' && symbol instanceof SymbolValue;
    }
    function typeOf(v) {
      if (isShimSymbol(v))
        return 'symbol';
      return typeof v;
    }
    function Symbol(description) {
      var value = new SymbolValue(description);
      if (!(this instanceof Symbol))
        return value;
      throw new TypeError('Symbol cannot be new\'ed');
    }
    $defineProperty(Symbol.prototype, 'constructor', nonEnum(Symbol));
    $defineProperty(Symbol.prototype, 'toString', method(function() {
      var symbolValue = this[symbolDataProperty];
      return symbolValue[symbolInternalProperty];
    }));
    $defineProperty(Symbol.prototype, 'valueOf', method(function() {
      var symbolValue = this[symbolDataProperty];
      if (!symbolValue)
        throw TypeError('Conversion from symbol to string');
      if (!getOption('symbols'))
        return symbolValue[symbolInternalProperty];
      return symbolValue;
    }));
    function SymbolValue(description) {
      var key = newUniqueString();
      $defineProperty(this, symbolDataProperty, {value: this});
      $defineProperty(this, symbolInternalProperty, {value: key});
      $defineProperty(this, symbolDescriptionProperty, {value: description});
      freeze(this);
      symbolValues[key] = this;
    }
    $defineProperty(SymbolValue.prototype, 'constructor', nonEnum(Symbol));
    $defineProperty(SymbolValue.prototype, 'toString', {
      value: Symbol.prototype.toString,
      enumerable: false
    });
    $defineProperty(SymbolValue.prototype, 'valueOf', {
      value: Symbol.prototype.valueOf,
      enumerable: false
    });
    var hashProperty = createPrivateName();
    var hashPropertyDescriptor = {value: undefined};
    var hashObjectProperties = {
      hash: {value: undefined},
      self: {value: undefined}
    };
    var hashCounter = 0;
    function getOwnHashObject(object) {
      var hashObject = object[hashProperty];
      if (hashObject && hashObject.self === object)
        return hashObject;
      if ($isExtensible(object)) {
        hashObjectProperties.hash.value = hashCounter++;
        hashObjectProperties.self.value = object;
        hashPropertyDescriptor.value = $create(null, hashObjectProperties);
        $defineProperty(object, hashProperty, hashPropertyDescriptor);
        return hashPropertyDescriptor.value;
      }
      return undefined;
    }
    function freeze(object) {
      getOwnHashObject(object);
      return $freeze.apply(this, arguments);
    }
    function preventExtensions(object) {
      getOwnHashObject(object);
      return $preventExtensions.apply(this, arguments);
    }
    function seal(object) {
      getOwnHashObject(object);
      return $seal.apply(this, arguments);
    }
    freeze(SymbolValue.prototype);
    function isSymbolString(s) {
      return symbolValues[s] || privateNames[s];
    }
    function toProperty(name) {
      if (isShimSymbol(name))
        return name[symbolInternalProperty];
      return name;
    }
    function removeSymbolKeys(array) {
      var rv = [];
      for (var i = 0; i < array.length; i++) {
        if (!isSymbolString(array[i])) {
          rv.push(array[i]);
        }
      }
      return rv;
    }
    function getOwnPropertyNames(object) {
      return removeSymbolKeys($getOwnPropertyNames(object));
    }
    function keys(object) {
      return removeSymbolKeys($keys(object));
    }
    function getOwnPropertySymbols(object) {
      var rv = [];
      var names = $getOwnPropertyNames(object);
      for (var i = 0; i < names.length; i++) {
        var symbol = symbolValues[names[i]];
        if (symbol) {
          rv.push(symbol);
        }
      }
      return rv;
    }
    function getOwnPropertyDescriptor(object, name) {
      return $getOwnPropertyDescriptor(object, toProperty(name));
    }
    function hasOwnProperty(name) {
      return $hasOwnProperty.call(this, toProperty(name));
    }
    function getOption(name) {
      return global.$traceurRuntime.options[name];
    }
    function defineProperty(object, name, descriptor) {
      if (isShimSymbol(name)) {
        name = name[symbolInternalProperty];
      }
      $defineProperty(object, name, descriptor);
      return object;
    }
    function polyfillObject(Object) {
      $defineProperty(Object, 'defineProperty', {value: defineProperty});
      $defineProperty(Object, 'getOwnPropertyNames', {value: getOwnPropertyNames});
      $defineProperty(Object, 'getOwnPropertyDescriptor', {value: getOwnPropertyDescriptor});
      $defineProperty(Object.prototype, 'hasOwnProperty', {value: hasOwnProperty});
      $defineProperty(Object, 'freeze', {value: freeze});
      $defineProperty(Object, 'preventExtensions', {value: preventExtensions});
      $defineProperty(Object, 'seal', {value: seal});
      $defineProperty(Object, 'keys', {value: keys});
    }
    function exportStar(object) {
      for (var i = 1; i < arguments.length; i++) {
        var names = $getOwnPropertyNames(arguments[i]);
        for (var j = 0; j < names.length; j++) {
          var name = names[j];
          if (isSymbolString(name))
            continue;
          (function(mod, name) {
            $defineProperty(object, name, {
              get: function() {
                return mod[name];
              },
              enumerable: true
            });
          })(arguments[i], names[j]);
        }
      }
      return object;
    }
    function isObject(x) {
      return x != null && (typeof x === 'object' || typeof x === 'function');
    }
    function toObject(x) {
      if (x == null)
        throw $TypeError();
      return $Object(x);
    }
    function checkObjectCoercible(argument) {
      if (argument == null) {
        throw new TypeError('Value cannot be converted to an Object');
      }
      return argument;
    }
    function polyfillSymbol(global, Symbol) {
      if (!global.Symbol) {
        global.Symbol = Symbol;
        Object.getOwnPropertySymbols = getOwnPropertySymbols;
      }
      if (!global.Symbol.iterator) {
        global.Symbol.iterator = Symbol('Symbol.iterator');
      }
      if (!global.Symbol.observer) {
        global.Symbol.observer = Symbol('Symbol.observer');
      }
    }
    function setupGlobals(global) {
      polyfillSymbol(global, Symbol);
      global.Reflect = global.Reflect || {};
      global.Reflect.global = global.Reflect.global || global;
      polyfillObject(global.Object);
    }
    setupGlobals(global);
    global.$traceurRuntime = {
      call: tailCall,
      checkObjectCoercible: checkObjectCoercible,
      construct: construct,
      continuation: createContinuation,
      createPrivateName: createPrivateName,
      defineProperties: $defineProperties,
      defineProperty: $defineProperty,
      exportStar: exportStar,
      getOwnHashObject: getOwnHashObject,
      getOwnPropertyDescriptor: $getOwnPropertyDescriptor,
      getOwnPropertyNames: $getOwnPropertyNames,
      initTailRecursiveFunction: initTailRecursiveFunction,
      isObject: isObject,
      isPrivateName: isPrivateName,
      isSymbolString: isSymbolString,
      keys: $keys,
      options: {},
      setupGlobals: setupGlobals,
      toObject: toObject,
      toProperty: toProperty,
      typeof: typeOf
    };
  })();
})(typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : this);
(function() {
  function buildFromEncodedParts(opt_scheme, opt_userInfo, opt_domain, opt_port, opt_path, opt_queryData, opt_fragment) {
    var out = [];
    if (opt_scheme) {
      out.push(opt_scheme, ':');
    }
    if (opt_domain) {
      out.push('//');
      if (opt_userInfo) {
        out.push(opt_userInfo, '@');
      }
      out.push(opt_domain);
      if (opt_port) {
        out.push(':', opt_port);
      }
    }
    if (opt_path) {
      out.push(opt_path);
    }
    if (opt_queryData) {
      out.push('?', opt_queryData);
    }
    if (opt_fragment) {
      out.push('#', opt_fragment);
    }
    return out.join('');
  }
  ;
  var splitRe = new RegExp('^' + '(?:' + '([^:/?#.]+)' + ':)?' + '(?://' + '(?:([^/?#]*)@)?' + '([\\w\\d\\-\\u0100-\\uffff.%]*)' + '(?::([0-9]+))?' + ')?' + '([^?#]+)?' + '(?:\\?([^#]*))?' + '(?:#(.*))?' + '$');
  var ComponentIndex = {
    SCHEME: 1,
    USER_INFO: 2,
    DOMAIN: 3,
    PORT: 4,
    PATH: 5,
    QUERY_DATA: 6,
    FRAGMENT: 7
  };
  function split(uri) {
    return (uri.match(splitRe));
  }
  function removeDotSegments(path) {
    if (path === '/')
      return '/';
    var leadingSlash = path[0] === '/' ? '/' : '';
    var trailingSlash = path.slice(-1) === '/' ? '/' : '';
    var segments = path.split('/');
    var out = [];
    var up = 0;
    for (var pos = 0; pos < segments.length; pos++) {
      var segment = segments[pos];
      switch (segment) {
        case '':
        case '.':
          break;
        case '..':
          if (out.length)
            out.pop();
          else
            up++;
          break;
        default:
          out.push(segment);
      }
    }
    if (!leadingSlash) {
      while (up-- > 0) {
        out.unshift('..');
      }
      if (out.length === 0)
        out.push('.');
    }
    return leadingSlash + out.join('/') + trailingSlash;
  }
  function joinAndCanonicalizePath(parts) {
    var path = parts[ComponentIndex.PATH] || '';
    path = removeDotSegments(path);
    parts[ComponentIndex.PATH] = path;
    return buildFromEncodedParts(parts[ComponentIndex.SCHEME], parts[ComponentIndex.USER_INFO], parts[ComponentIndex.DOMAIN], parts[ComponentIndex.PORT], parts[ComponentIndex.PATH], parts[ComponentIndex.QUERY_DATA], parts[ComponentIndex.FRAGMENT]);
  }
  function canonicalizeUrl(url) {
    var parts = split(url);
    return joinAndCanonicalizePath(parts);
  }
  function resolveUrl(base, url) {
    var parts = split(url);
    var baseParts = split(base);
    if (parts[ComponentIndex.SCHEME]) {
      return joinAndCanonicalizePath(parts);
    } else {
      parts[ComponentIndex.SCHEME] = baseParts[ComponentIndex.SCHEME];
    }
    for (var i = ComponentIndex.SCHEME; i <= ComponentIndex.PORT; i++) {
      if (!parts[i]) {
        parts[i] = baseParts[i];
      }
    }
    if (parts[ComponentIndex.PATH][0] == '/') {
      return joinAndCanonicalizePath(parts);
    }
    var path = baseParts[ComponentIndex.PATH];
    var index = path.lastIndexOf('/');
    path = path.slice(0, index + 1) + parts[ComponentIndex.PATH];
    parts[ComponentIndex.PATH] = path;
    return joinAndCanonicalizePath(parts);
  }
  function isAbsolute(name) {
    if (!name)
      return false;
    if (name[0] === '/')
      return true;
    var parts = split(name);
    if (parts[ComponentIndex.SCHEME])
      return true;
    return false;
  }
  $traceurRuntime.canonicalizeUrl = canonicalizeUrl;
  $traceurRuntime.isAbsolute = isAbsolute;
  $traceurRuntime.removeDotSegments = removeDotSegments;
  $traceurRuntime.resolveUrl = resolveUrl;
})();
(function(global) {
  'use strict';
  var $__1 = $traceurRuntime,
      canonicalizeUrl = $__1.canonicalizeUrl,
      resolveUrl = $__1.resolveUrl,
      isAbsolute = $__1.isAbsolute;
  var moduleInstantiators = Object.create(null);
  var baseURL;
  if (global.location && global.location.href)
    baseURL = resolveUrl(global.location.href, './');
  else
    baseURL = '';
  function UncoatedModuleEntry(url, uncoatedModule) {
    this.url = url;
    this.value_ = uncoatedModule;
  }
  function ModuleEvaluationError(erroneousModuleName, cause) {
    this.message = this.constructor.name + ': ' + this.stripCause(cause) + ' in ' + erroneousModuleName;
    if (!(cause instanceof ModuleEvaluationError) && cause.stack)
      this.stack = this.stripStack(cause.stack);
    else
      this.stack = '';
  }
  ModuleEvaluationError.prototype = Object.create(Error.prototype);
  ModuleEvaluationError.prototype.constructor = ModuleEvaluationError;
  ModuleEvaluationError.prototype.stripError = function(message) {
    return message.replace(/.*Error:/, this.constructor.name + ':');
  };
  ModuleEvaluationError.prototype.stripCause = function(cause) {
    if (!cause)
      return '';
    if (!cause.message)
      return cause + '';
    return this.stripError(cause.message);
  };
  ModuleEvaluationError.prototype.loadedBy = function(moduleName) {
    this.stack += '\n loaded by ' + moduleName;
  };
  ModuleEvaluationError.prototype.stripStack = function(causeStack) {
    var stack = [];
    causeStack.split('\n').some((function(frame) {
      if (/UncoatedModuleInstantiator/.test(frame))
        return true;
      stack.push(frame);
    }));
    stack[0] = this.stripError(stack[0]);
    return stack.join('\n');
  };
  function beforeLines(lines, number) {
    var result = [];
    var first = number - 3;
    if (first < 0)
      first = 0;
    for (var i = first; i < number; i++) {
      result.push(lines[i]);
    }
    return result;
  }
  function afterLines(lines, number) {
    var last = number + 1;
    if (last > lines.length - 1)
      last = lines.length - 1;
    var result = [];
    for (var i = number; i <= last; i++) {
      result.push(lines[i]);
    }
    return result;
  }
  function columnSpacing(columns) {
    var result = '';
    for (var i = 0; i < columns - 1; i++) {
      result += '-';
    }
    return result;
  }
  function UncoatedModuleInstantiator(url, func) {
    UncoatedModuleEntry.call(this, url, null);
    this.func = func;
  }
  UncoatedModuleInstantiator.prototype = Object.create(UncoatedModuleEntry.prototype);
  UncoatedModuleInstantiator.prototype.getUncoatedModule = function() {
    if (this.value_)
      return this.value_;
    try {
      var relativeRequire;
      if (typeof $traceurRuntime !== undefined && $traceurRuntime.require) {
        relativeRequire = $traceurRuntime.require.bind(null, this.url);
      }
      return this.value_ = this.func.call(global, relativeRequire);
    } catch (ex) {
      if (ex instanceof ModuleEvaluationError) {
        ex.loadedBy(this.url);
        throw ex;
      }
      if (ex.stack) {
        var lines = this.func.toString().split('\n');
        var evaled = [];
        ex.stack.split('\n').some(function(frame) {
          if (frame.indexOf('UncoatedModuleInstantiator.getUncoatedModule') > 0)
            return true;
          var m = /(at\s[^\s]*\s).*>:(\d*):(\d*)\)/.exec(frame);
          if (m) {
            var line = parseInt(m[2], 10);
            evaled = evaled.concat(beforeLines(lines, line));
            evaled.push(columnSpacing(m[3]) + '^');
            evaled = evaled.concat(afterLines(lines, line));
            evaled.push('= = = = = = = = =');
          } else {
            evaled.push(frame);
          }
        });
        ex.stack = evaled.join('\n');
      }
      throw new ModuleEvaluationError(this.url, ex);
    }
  };
  function getUncoatedModuleInstantiator(name) {
    if (!name)
      return ;
    var url = ModuleStore.normalize(name);
    return moduleInstantiators[url];
  }
  ;
  var moduleInstances = Object.create(null);
  var liveModuleSentinel = {};
  function Module(uncoatedModule) {
    var isLive = arguments[1];
    var coatedModule = Object.create(null);
    Object.getOwnPropertyNames(uncoatedModule).forEach((function(name) {
      var getter,
          value;
      if (isLive === liveModuleSentinel) {
        var descr = Object.getOwnPropertyDescriptor(uncoatedModule, name);
        if (descr.get)
          getter = descr.get;
      }
      if (!getter) {
        value = uncoatedModule[name];
        getter = function() {
          return value;
        };
      }
      Object.defineProperty(coatedModule, name, {
        get: getter,
        enumerable: true
      });
    }));
    Object.preventExtensions(coatedModule);
    return coatedModule;
  }
  var ModuleStore = {
    normalize: function(name, refererName, refererAddress) {
      if (typeof name !== 'string')
        throw new TypeError('module name must be a string, not ' + typeof name);
      if (isAbsolute(name))
        return canonicalizeUrl(name);
      if (/[^\.]\/\.\.\//.test(name)) {
        throw new Error('module name embeds /../: ' + name);
      }
      if (name[0] === '.' && refererName)
        return resolveUrl(refererName, name);
      return canonicalizeUrl(name);
    },
    get: function(normalizedName) {
      var m = getUncoatedModuleInstantiator(normalizedName);
      if (!m)
        return undefined;
      var moduleInstance = moduleInstances[m.url];
      if (moduleInstance)
        return moduleInstance;
      moduleInstance = Module(m.getUncoatedModule(), liveModuleSentinel);
      return moduleInstances[m.url] = moduleInstance;
    },
    set: function(normalizedName, module) {
      normalizedName = String(normalizedName);
      moduleInstantiators[normalizedName] = new UncoatedModuleInstantiator(normalizedName, (function() {
        return module;
      }));
      moduleInstances[normalizedName] = module;
    },
    get baseURL() {
      return baseURL;
    },
    set baseURL(v) {
      baseURL = String(v);
    },
    registerModule: function(name, deps, func) {
      var normalizedName = ModuleStore.normalize(name);
      if (moduleInstantiators[normalizedName])
        throw new Error('duplicate module named ' + normalizedName);
      moduleInstantiators[normalizedName] = new UncoatedModuleInstantiator(normalizedName, func);
    },
    bundleStore: Object.create(null),
    register: function(name, deps, func) {
      if (!deps || !deps.length && !func.length) {
        this.registerModule(name, deps, func);
      } else {
        this.bundleStore[name] = {
          deps: deps,
          execute: function() {
            var $__0 = arguments;
            var depMap = {};
            deps.forEach((function(dep, index) {
              return depMap[dep] = $__0[index];
            }));
            var registryEntry = func.call(this, depMap);
            registryEntry.execute.call(this);
            return registryEntry.exports;
          }
        };
      }
    },
    getAnonymousModule: function(func) {
      return new Module(func.call(global), liveModuleSentinel);
    },
    getForTesting: function(name) {
      var $__0 = this;
      if (!this.testingPrefix_) {
        Object.keys(moduleInstances).some((function(key) {
          var m = /(traceur@[^\/]*\/)/.exec(key);
          if (m) {
            $__0.testingPrefix_ = m[1];
            return true;
          }
        }));
      }
      return this.get(this.testingPrefix_ + name);
    }
  };
  var moduleStoreModule = new Module({ModuleStore: ModuleStore});
  ModuleStore.set('@traceur/src/runtime/ModuleStore', moduleStoreModule);
  ModuleStore.set('@traceur/src/runtime/ModuleStore.js', moduleStoreModule);
  var setupGlobals = $traceurRuntime.setupGlobals;
  $traceurRuntime.setupGlobals = function(global) {
    setupGlobals(global);
  };
  $traceurRuntime.ModuleStore = ModuleStore;
  global.System = {
    register: ModuleStore.register.bind(ModuleStore),
    registerModule: ModuleStore.registerModule.bind(ModuleStore),
    get: ModuleStore.get,
    set: ModuleStore.set,
    normalize: ModuleStore.normalize
  };
  $traceurRuntime.getModuleImpl = function(name) {
    var instantiator = getUncoatedModuleInstantiator(name);
    return instantiator && instantiator.getUncoatedModule();
  };
})(typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : this);
System.registerModule("traceur-runtime@0.0.87/src/runtime/async.js", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.87/src/runtime/async.js";
  if (typeof $traceurRuntime !== 'object') {
    throw new Error('traceur runtime not found.');
  }
  var $createPrivateName = $traceurRuntime.createPrivateName;
  var $defineProperty = $traceurRuntime.defineProperty;
  var $defineProperties = $traceurRuntime.defineProperties;
  var $create = Object.create;
  var thisName = $createPrivateName();
  var argsName = $createPrivateName();
  var observeName = $createPrivateName();
  function AsyncGeneratorFunction() {}
  function AsyncGeneratorFunctionPrototype() {}
  AsyncGeneratorFunction.prototype = AsyncGeneratorFunctionPrototype;
  AsyncGeneratorFunctionPrototype.constructor = AsyncGeneratorFunction;
  $defineProperty(AsyncGeneratorFunctionPrototype, 'constructor', {enumerable: false});
  var AsyncGeneratorContext = function AsyncGeneratorContext(observer) {
    var $__0 = this;
    this.decoratedObserver = $traceurRuntime.createDecoratedGenerator(observer, (function() {
      $__0.done = true;
    }));
    this.done = false;
    this.inReturn = false;
  };
  ($traceurRuntime.createClass)(AsyncGeneratorContext, {
    throw: function(error) {
      if (!this.inReturn) {
        throw error;
      }
    },
    yield: function(value) {
      if (this.done) {
        this.inReturn = true;
        throw undefined;
      }
      var result;
      try {
        result = this.decoratedObserver.next(value);
      } catch (e) {
        this.done = true;
        throw e;
      }
      if (result === undefined) {
        return ;
      }
      if (result.done) {
        this.done = true;
        this.inReturn = true;
        throw undefined;
      }
      return result.value;
    },
    yieldFor: function(observable) {
      var ctx = this;
      return $traceurRuntime.observeForEach(observable[$traceurRuntime.toProperty(Symbol.observer)].bind(observable), function(value) {
        if (ctx.done) {
          this.return();
          return ;
        }
        var result;
        try {
          result = ctx.decoratedObserver.next(value);
        } catch (e) {
          ctx.done = true;
          throw e;
        }
        if (result === undefined) {
          return ;
        }
        if (result.done) {
          ctx.done = true;
        }
        return result;
      });
    }
  }, {});
  AsyncGeneratorFunctionPrototype.prototype[Symbol.observer] = function(observer) {
    var observe = this[observeName];
    var ctx = new AsyncGeneratorContext(observer);
    $traceurRuntime.schedule((function() {
      return observe(ctx);
    })).then((function(value) {
      if (!ctx.done) {
        ctx.decoratedObserver.return(value);
      }
    })).catch((function(error) {
      if (!ctx.done) {
        ctx.decoratedObserver.throw(error);
      }
    }));
    return ctx.decoratedObserver;
  };
  $defineProperty(AsyncGeneratorFunctionPrototype.prototype, Symbol.observer, {enumerable: false});
  function initAsyncGeneratorFunction(functionObject) {
    functionObject.prototype = $create(AsyncGeneratorFunctionPrototype.prototype);
    functionObject.__proto__ = AsyncGeneratorFunctionPrototype;
    return functionObject;
  }
  function createAsyncGeneratorInstance(observe, functionObject) {
    for (var args = [],
        $__2 = 2; $__2 < arguments.length; $__2++)
      args[$__2 - 2] = arguments[$__2];
    var object = $create(functionObject.prototype);
    object[thisName] = this;
    object[argsName] = args;
    object[observeName] = observe;
    return object;
  }
  function observeForEach(observe, next) {
    return new Promise((function(resolve, reject) {
      var generator = observe({
        next: function(value) {
          return next.call(generator, value);
        },
        throw: function(error) {
          reject(error);
        },
        return: function(value) {
          resolve(value);
        }
      });
    }));
  }
  function schedule(asyncF) {
    return Promise.resolve().then(asyncF);
  }
  var generator = Symbol();
  var onDone = Symbol();
  var DecoratedGenerator = function DecoratedGenerator(_generator, _onDone) {
    this[generator] = _generator;
    this[onDone] = _onDone;
  };
  ($traceurRuntime.createClass)(DecoratedGenerator, {
    next: function(value) {
      var result = this[generator].next(value);
      if (result !== undefined && result.done) {
        this[onDone].call(this);
      }
      return result;
    },
    throw: function(error) {
      this[onDone].call(this);
      return this[generator].throw(error);
    },
    return: function(value) {
      this[onDone].call(this);
      return this[generator].return(value);
    }
  }, {});
  function createDecoratedGenerator(generator, onDone) {
    return new DecoratedGenerator(generator, onDone);
  }
  $traceurRuntime.initAsyncGeneratorFunction = initAsyncGeneratorFunction;
  $traceurRuntime.createAsyncGeneratorInstance = createAsyncGeneratorInstance;
  $traceurRuntime.observeForEach = observeForEach;
  $traceurRuntime.schedule = schedule;
  $traceurRuntime.createDecoratedGenerator = createDecoratedGenerator;
  return {};
});
System.registerModule("traceur-runtime@0.0.87/src/runtime/classes.js", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.87/src/runtime/classes.js";
  var $Object = Object;
  var $TypeError = TypeError;
  var $create = $Object.create;
  var $defineProperties = $traceurRuntime.defineProperties;
  var $defineProperty = $traceurRuntime.defineProperty;
  var $getOwnPropertyDescriptor = $traceurRuntime.getOwnPropertyDescriptor;
  var $getOwnPropertyNames = $traceurRuntime.getOwnPropertyNames;
  var $getPrototypeOf = Object.getPrototypeOf;
  var $__0 = Object,
      getOwnPropertyNames = $__0.getOwnPropertyNames,
      getOwnPropertySymbols = $__0.getOwnPropertySymbols;
  function superDescriptor(homeObject, name) {
    var proto = $getPrototypeOf(homeObject);
    do {
      var result = $getOwnPropertyDescriptor(proto, name);
      if (result)
        return result;
      proto = $getPrototypeOf(proto);
    } while (proto);
    return undefined;
  }
  function superConstructor(ctor) {
    return ctor.__proto__;
  }
  function superGet(self, homeObject, name) {
    var descriptor = superDescriptor(homeObject, name);
    if (descriptor) {
      if (!descriptor.get)
        return descriptor.value;
      return descriptor.get.call(self);
    }
    return undefined;
  }
  function superSet(self, homeObject, name, value) {
    var descriptor = superDescriptor(homeObject, name);
    if (descriptor && descriptor.set) {
      descriptor.set.call(self, value);
      return value;
    }
    throw $TypeError(("super has no setter '" + name + "'."));
  }
  function getDescriptors(object) {
    var descriptors = {};
    var names = getOwnPropertyNames(object);
    for (var i = 0; i < names.length; i++) {
      var name = names[i];
      descriptors[name] = $getOwnPropertyDescriptor(object, name);
    }
    var symbols = getOwnPropertySymbols(object);
    for (var i = 0; i < symbols.length; i++) {
      var symbol = symbols[i];
      descriptors[$traceurRuntime.toProperty(symbol)] = $getOwnPropertyDescriptor(object, $traceurRuntime.toProperty(symbol));
    }
    return descriptors;
  }
  function createClass(ctor, object, staticObject, superClass) {
    $defineProperty(object, 'constructor', {
      value: ctor,
      configurable: true,
      enumerable: false,
      writable: true
    });
    if (arguments.length > 3) {
      if (typeof superClass === 'function')
        ctor.__proto__ = superClass;
      ctor.prototype = $create(getProtoParent(superClass), getDescriptors(object));
    } else {
      ctor.prototype = object;
    }
    $defineProperty(ctor, 'prototype', {
      configurable: false,
      writable: false
    });
    return $defineProperties(ctor, getDescriptors(staticObject));
  }
  function getProtoParent(superClass) {
    if (typeof superClass === 'function') {
      var prototype = superClass.prototype;
      if ($Object(prototype) === prototype || prototype === null)
        return superClass.prototype;
      throw new $TypeError('super prototype must be an Object or null');
    }
    if (superClass === null)
      return null;
    throw new $TypeError(("Super expression must either be null or a function, not " + typeof superClass + "."));
  }
  $traceurRuntime.createClass = createClass;
  $traceurRuntime.superConstructor = superConstructor;
  $traceurRuntime.superGet = superGet;
  $traceurRuntime.superSet = superSet;
  return {};
});
System.registerModule("traceur-runtime@0.0.87/src/runtime/destructuring.js", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.87/src/runtime/destructuring.js";
  function iteratorToArray(iter) {
    var rv = [];
    var i = 0;
    var tmp;
    while (!(tmp = iter.next()).done) {
      rv[i++] = tmp.value;
    }
    return rv;
  }
  $traceurRuntime.iteratorToArray = iteratorToArray;
  return {};
});
System.registerModule("traceur-runtime@0.0.87/src/runtime/generators.js", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.87/src/runtime/generators.js";
  if (typeof $traceurRuntime !== 'object') {
    throw new Error('traceur runtime not found.');
  }
  var createPrivateName = $traceurRuntime.createPrivateName;
  var $defineProperties = $traceurRuntime.defineProperties;
  var $defineProperty = $traceurRuntime.defineProperty;
  var $create = Object.create;
  var $TypeError = TypeError;
  function nonEnum(value) {
    return {
      configurable: true,
      enumerable: false,
      value: value,
      writable: true
    };
  }
  var ST_NEWBORN = 0;
  var ST_EXECUTING = 1;
  var ST_SUSPENDED = 2;
  var ST_CLOSED = 3;
  var END_STATE = -2;
  var RETHROW_STATE = -3;
  function getInternalError(state) {
    return new Error('Traceur compiler bug: invalid state in state machine: ' + state);
  }
  var RETURN_SENTINEL = {};
  function GeneratorContext() {
    this.state = 0;
    this.GState = ST_NEWBORN;
    this.storedException = undefined;
    this.finallyFallThrough = undefined;
    this.sent_ = undefined;
    this.returnValue = undefined;
    this.oldReturnValue = undefined;
    this.tryStack_ = [];
  }
  GeneratorContext.prototype = {
    pushTry: function(catchState, finallyState) {
      if (finallyState !== null) {
        var finallyFallThrough = null;
        for (var i = this.tryStack_.length - 1; i >= 0; i--) {
          if (this.tryStack_[i].catch !== undefined) {
            finallyFallThrough = this.tryStack_[i].catch;
            break;
          }
        }
        if (finallyFallThrough === null)
          finallyFallThrough = RETHROW_STATE;
        this.tryStack_.push({
          finally: finallyState,
          finallyFallThrough: finallyFallThrough
        });
      }
      if (catchState !== null) {
        this.tryStack_.push({catch: catchState});
      }
    },
    popTry: function() {
      this.tryStack_.pop();
    },
    maybeUncatchable: function() {
      if (this.storedException === RETURN_SENTINEL) {
        throw RETURN_SENTINEL;
      }
    },
    get sent() {
      this.maybeThrow();
      return this.sent_;
    },
    set sent(v) {
      this.sent_ = v;
    },
    get sentIgnoreThrow() {
      return this.sent_;
    },
    maybeThrow: function() {
      if (this.action === 'throw') {
        this.action = 'next';
        throw this.sent_;
      }
    },
    end: function() {
      switch (this.state) {
        case END_STATE:
          return this;
        case RETHROW_STATE:
          throw this.storedException;
        default:
          throw getInternalError(this.state);
      }
    },
    handleException: function(ex) {
      this.GState = ST_CLOSED;
      this.state = END_STATE;
      throw ex;
    },
    wrapYieldStar: function(iterator) {
      var ctx = this;
      return {
        next: function(v) {
          return iterator.next(v);
        },
        throw: function(e) {
          var result;
          if (e === RETURN_SENTINEL) {
            if (iterator.return) {
              result = iterator.return(ctx.returnValue);
              if (!result.done) {
                ctx.returnValue = ctx.oldReturnValue;
                return result;
              }
              ctx.returnValue = result.value;
            }
            throw e;
          }
          if (iterator.throw) {
            return iterator.throw(e);
          }
          iterator.return && iterator.return();
          throw $TypeError('Inner iterator does not have a throw method');
        }
      };
    }
  };
  function nextOrThrow(ctx, moveNext, action, x) {
    switch (ctx.GState) {
      case ST_EXECUTING:
        throw new Error(("\"" + action + "\" on executing generator"));
      case ST_CLOSED:
        if (action == 'next') {
          return {
            value: undefined,
            done: true
          };
        }
        if (x === RETURN_SENTINEL) {
          return {
            value: ctx.returnValue,
            done: true
          };
        }
        throw x;
      case ST_NEWBORN:
        if (action === 'throw') {
          ctx.GState = ST_CLOSED;
          if (x === RETURN_SENTINEL) {
            return {
              value: ctx.returnValue,
              done: true
            };
          }
          throw x;
        }
        if (x !== undefined)
          throw $TypeError('Sent value to newborn generator');
      case ST_SUSPENDED:
        ctx.GState = ST_EXECUTING;
        ctx.action = action;
        ctx.sent = x;
        var value;
        try {
          value = moveNext(ctx);
        } catch (ex) {
          if (ex === RETURN_SENTINEL) {
            value = ctx;
          } else {
            throw ex;
          }
        }
        var done = value === ctx;
        if (done)
          value = ctx.returnValue;
        ctx.GState = done ? ST_CLOSED : ST_SUSPENDED;
        return {
          value: value,
          done: done
        };
    }
  }
  var ctxName = createPrivateName();
  var moveNextName = createPrivateName();
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}
  GeneratorFunction.prototype = GeneratorFunctionPrototype;
  $defineProperty(GeneratorFunctionPrototype, 'constructor', nonEnum(GeneratorFunction));
  GeneratorFunctionPrototype.prototype = {
    constructor: GeneratorFunctionPrototype,
    next: function(v) {
      return nextOrThrow(this[ctxName], this[moveNextName], 'next', v);
    },
    throw: function(v) {
      return nextOrThrow(this[ctxName], this[moveNextName], 'throw', v);
    },
    return: function(v) {
      this[ctxName].oldReturnValue = this[ctxName].returnValue;
      this[ctxName].returnValue = v;
      return nextOrThrow(this[ctxName], this[moveNextName], 'throw', RETURN_SENTINEL);
    }
  };
  $defineProperties(GeneratorFunctionPrototype.prototype, {
    constructor: {enumerable: false},
    next: {enumerable: false},
    throw: {enumerable: false},
    return: {enumerable: false}
  });
  Object.defineProperty(GeneratorFunctionPrototype.prototype, Symbol.iterator, nonEnum(function() {
    return this;
  }));
  function createGeneratorInstance(innerFunction, functionObject, self) {
    var moveNext = getMoveNext(innerFunction, self);
    var ctx = new GeneratorContext();
    var object = $create(functionObject.prototype);
    object[ctxName] = ctx;
    object[moveNextName] = moveNext;
    return object;
  }
  function initGeneratorFunction(functionObject) {
    functionObject.prototype = $create(GeneratorFunctionPrototype.prototype);
    functionObject.__proto__ = GeneratorFunctionPrototype;
    return functionObject;
  }
  function AsyncFunctionContext() {
    GeneratorContext.call(this);
    this.err = undefined;
    var ctx = this;
    ctx.result = new Promise(function(resolve, reject) {
      ctx.resolve = resolve;
      ctx.reject = reject;
    });
  }
  AsyncFunctionContext.prototype = $create(GeneratorContext.prototype);
  AsyncFunctionContext.prototype.end = function() {
    switch (this.state) {
      case END_STATE:
        this.resolve(this.returnValue);
        break;
      case RETHROW_STATE:
        this.reject(this.storedException);
        break;
      default:
        this.reject(getInternalError(this.state));
    }
  };
  AsyncFunctionContext.prototype.handleException = function() {
    this.state = RETHROW_STATE;
  };
  function asyncWrap(innerFunction, self) {
    var moveNext = getMoveNext(innerFunction, self);
    var ctx = new AsyncFunctionContext();
    ctx.createCallback = function(newState) {
      return function(value) {
        ctx.state = newState;
        ctx.value = value;
        moveNext(ctx);
      };
    };
    ctx.errback = function(err) {
      handleCatch(ctx, err);
      moveNext(ctx);
    };
    moveNext(ctx);
    return ctx.result;
  }
  function getMoveNext(innerFunction, self) {
    return function(ctx) {
      while (true) {
        try {
          return innerFunction.call(self, ctx);
        } catch (ex) {
          handleCatch(ctx, ex);
        }
      }
    };
  }
  function handleCatch(ctx, ex) {
    ctx.storedException = ex;
    var last = ctx.tryStack_[ctx.tryStack_.length - 1];
    if (!last) {
      ctx.handleException(ex);
      return ;
    }
    ctx.state = last.catch !== undefined ? last.catch : last.finally;
    if (last.finallyFallThrough !== undefined)
      ctx.finallyFallThrough = last.finallyFallThrough;
  }
  $traceurRuntime.asyncWrap = asyncWrap;
  $traceurRuntime.initGeneratorFunction = initGeneratorFunction;
  $traceurRuntime.createGeneratorInstance = createGeneratorInstance;
  return {};
});
System.registerModule("traceur-runtime@0.0.87/src/runtime/relativeRequire.js", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.87/src/runtime/relativeRequire.js";
  var path;
  function relativeRequire(callerPath, requiredPath) {
    path = path || typeof require !== 'undefined' && require('path');
    function isDirectory(path) {
      return path.slice(-1) === '/';
    }
    function isAbsolute(path) {
      return path[0] === '/';
    }
    function isRelative(path) {
      return path[0] === '.';
    }
    if (isDirectory(requiredPath) || isAbsolute(requiredPath))
      return ;
    return isRelative(requiredPath) ? require(path.resolve(path.dirname(callerPath), requiredPath)) : require(requiredPath);
  }
  $traceurRuntime.require = relativeRequire;
  return {};
});
System.registerModule("traceur-runtime@0.0.87/src/runtime/spread.js", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.87/src/runtime/spread.js";
  function spread() {
    var rv = [],
        j = 0,
        iterResult;
    for (var i = 0; i < arguments.length; i++) {
      var valueToSpread = $traceurRuntime.checkObjectCoercible(arguments[i]);
      if (typeof valueToSpread[$traceurRuntime.toProperty(Symbol.iterator)] !== 'function') {
        throw new TypeError('Cannot spread non-iterable object.');
      }
      var iter = valueToSpread[$traceurRuntime.toProperty(Symbol.iterator)]();
      while (!(iterResult = iter.next()).done) {
        rv[j++] = iterResult.value;
      }
    }
    return rv;
  }
  $traceurRuntime.spread = spread;
  return {};
});
System.registerModule("traceur-runtime@0.0.87/src/runtime/type-assertions.js", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.87/src/runtime/type-assertions.js";
  var types = {
    any: {name: 'any'},
    boolean: {name: 'boolean'},
    number: {name: 'number'},
    string: {name: 'string'},
    symbol: {name: 'symbol'},
    void: {name: 'void'}
  };
  var GenericType = function GenericType(type, argumentTypes) {
    this.type = type;
    this.argumentTypes = argumentTypes;
  };
  ($traceurRuntime.createClass)(GenericType, {}, {});
  var typeRegister = Object.create(null);
  function genericType(type) {
    for (var argumentTypes = [],
        $__1 = 1; $__1 < arguments.length; $__1++)
      argumentTypes[$__1 - 1] = arguments[$__1];
    var typeMap = typeRegister;
    var key = $traceurRuntime.getOwnHashObject(type).hash;
    if (!typeMap[key]) {
      typeMap[key] = Object.create(null);
    }
    typeMap = typeMap[key];
    for (var i = 0; i < argumentTypes.length - 1; i++) {
      key = $traceurRuntime.getOwnHashObject(argumentTypes[i]).hash;
      if (!typeMap[key]) {
        typeMap[key] = Object.create(null);
      }
      typeMap = typeMap[key];
    }
    var tail = argumentTypes[argumentTypes.length - 1];
    key = $traceurRuntime.getOwnHashObject(tail).hash;
    if (!typeMap[key]) {
      typeMap[key] = new GenericType(type, argumentTypes);
    }
    return typeMap[key];
  }
  $traceurRuntime.GenericType = GenericType;
  $traceurRuntime.genericType = genericType;
  $traceurRuntime.type = types;
  return {};
});
System.registerModule("traceur-runtime@0.0.87/src/runtime/runtime-modules.js", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.87/src/runtime/runtime-modules.js";
  System.get("traceur-runtime@0.0.87/src/runtime/relativeRequire.js");
  System.get("traceur-runtime@0.0.87/src/runtime/spread.js");
  System.get("traceur-runtime@0.0.87/src/runtime/destructuring.js");
  System.get("traceur-runtime@0.0.87/src/runtime/classes.js");
  System.get("traceur-runtime@0.0.87/src/runtime/async.js");
  System.get("traceur-runtime@0.0.87/src/runtime/generators.js");
  System.get("traceur-runtime@0.0.87/src/runtime/type-assertions.js");
  return {};
});
System.get("traceur-runtime@0.0.87/src/runtime/runtime-modules.js" + '');
System.registerModule("traceur-runtime@0.0.87/src/runtime/polyfills/utils.js", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.87/src/runtime/polyfills/utils.js";
  var $ceil = Math.ceil;
  var $floor = Math.floor;
  var $isFinite = isFinite;
  var $isNaN = isNaN;
  var $pow = Math.pow;
  var $min = Math.min;
  var toObject = $traceurRuntime.toObject;
  function toUint32(x) {
    return x >>> 0;
  }
  function isObject(x) {
    return x && (typeof x === 'object' || typeof x === 'function');
  }
  function isCallable(x) {
    return typeof x === 'function';
  }
  function isNumber(x) {
    return typeof x === 'number';
  }
  function toInteger(x) {
    x = +x;
    if ($isNaN(x))
      return 0;
    if (x === 0 || !$isFinite(x))
      return x;
    return x > 0 ? $floor(x) : $ceil(x);
  }
  var MAX_SAFE_LENGTH = $pow(2, 53) - 1;
  function toLength(x) {
    var len = toInteger(x);
    return len < 0 ? 0 : $min(len, MAX_SAFE_LENGTH);
  }
  function checkIterable(x) {
    return !isObject(x) ? undefined : x[Symbol.iterator];
  }
  function isConstructor(x) {
    return isCallable(x);
  }
  function createIteratorResultObject(value, done) {
    return {
      value: value,
      done: done
    };
  }
  function maybeDefine(object, name, descr) {
    if (!(name in object)) {
      Object.defineProperty(object, name, descr);
    }
  }
  function maybeDefineMethod(object, name, value) {
    maybeDefine(object, name, {
      value: value,
      configurable: true,
      enumerable: false,
      writable: true
    });
  }
  function maybeDefineConst(object, name, value) {
    maybeDefine(object, name, {
      value: value,
      configurable: false,
      enumerable: false,
      writable: false
    });
  }
  function maybeAddFunctions(object, functions) {
    for (var i = 0; i < functions.length; i += 2) {
      var name = functions[i];
      var value = functions[i + 1];
      maybeDefineMethod(object, name, value);
    }
  }
  function maybeAddConsts(object, consts) {
    for (var i = 0; i < consts.length; i += 2) {
      var name = consts[i];
      var value = consts[i + 1];
      maybeDefineConst(object, name, value);
    }
  }
  function maybeAddIterator(object, func, Symbol) {
    if (!Symbol || !Symbol.iterator || object[Symbol.iterator])
      return ;
    if (object['@@iterator'])
      func = object['@@iterator'];
    Object.defineProperty(object, Symbol.iterator, {
      value: func,
      configurable: true,
      enumerable: false,
      writable: true
    });
  }
  var polyfills = [];
  function registerPolyfill(func) {
    polyfills.push(func);
  }
  function polyfillAll(global) {
    polyfills.forEach((function(f) {
      return f(global);
    }));
  }
  return {
    get toObject() {
      return toObject;
    },
    get toUint32() {
      return toUint32;
    },
    get isObject() {
      return isObject;
    },
    get isCallable() {
      return isCallable;
    },
    get isNumber() {
      return isNumber;
    },
    get toInteger() {
      return toInteger;
    },
    get toLength() {
      return toLength;
    },
    get checkIterable() {
      return checkIterable;
    },
    get isConstructor() {
      return isConstructor;
    },
    get createIteratorResultObject() {
      return createIteratorResultObject;
    },
    get maybeDefine() {
      return maybeDefine;
    },
    get maybeDefineMethod() {
      return maybeDefineMethod;
    },
    get maybeDefineConst() {
      return maybeDefineConst;
    },
    get maybeAddFunctions() {
      return maybeAddFunctions;
    },
    get maybeAddConsts() {
      return maybeAddConsts;
    },
    get maybeAddIterator() {
      return maybeAddIterator;
    },
    get registerPolyfill() {
      return registerPolyfill;
    },
    get polyfillAll() {
      return polyfillAll;
    }
  };
});
System.registerModule("traceur-runtime@0.0.87/src/runtime/polyfills/Map.js", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.87/src/runtime/polyfills/Map.js";
  var $__0 = System.get("traceur-runtime@0.0.87/src/runtime/polyfills/utils.js"),
      isObject = $__0.isObject,
      maybeAddIterator = $__0.maybeAddIterator,
      registerPolyfill = $__0.registerPolyfill;
  var getOwnHashObject = $traceurRuntime.getOwnHashObject;
  var $hasOwnProperty = Object.prototype.hasOwnProperty;
  var deletedSentinel = {};
  function lookupIndex(map, key) {
    if (isObject(key)) {
      var hashObject = getOwnHashObject(key);
      return hashObject && map.objectIndex_[hashObject.hash];
    }
    if (typeof key === 'string')
      return map.stringIndex_[key];
    return map.primitiveIndex_[key];
  }
  function initMap(map) {
    map.entries_ = [];
    map.objectIndex_ = Object.create(null);
    map.stringIndex_ = Object.create(null);
    map.primitiveIndex_ = Object.create(null);
    map.deletedCount_ = 0;
  }
  var Map = function Map() {
    var $__10,
        $__11;
    var iterable = arguments[0];
    if (!isObject(this))
      throw new TypeError('Map called on incompatible type');
    if ($hasOwnProperty.call(this, 'entries_')) {
      throw new TypeError('Map can not be reentrantly initialised');
    }
    initMap(this);
    if (iterable !== null && iterable !== undefined) {
      var $__5 = true;
      var $__6 = false;
      var $__7 = undefined;
      try {
        for (var $__3 = void 0,
            $__2 = (iterable)[$traceurRuntime.toProperty(Symbol.iterator)](); !($__5 = ($__3 = $__2.next()).done); $__5 = true) {
          var $__9 = $__3.value,
              key = ($__10 = $__9[$traceurRuntime.toProperty(Symbol.iterator)](), ($__11 = $__10.next()).done ? void 0 : $__11.value),
              value = ($__11 = $__10.next()).done ? void 0 : $__11.value;
          {
            this.set(key, value);
          }
        }
      } catch ($__8) {
        $__6 = true;
        $__7 = $__8;
      } finally {
        try {
          if (!$__5 && $__2.return != null) {
            $__2.return();
          }
        } finally {
          if ($__6) {
            throw $__7;
          }
        }
      }
    }
  };
  ($traceurRuntime.createClass)(Map, {
    get size() {
      return this.entries_.length / 2 - this.deletedCount_;
    },
    get: function(key) {
      var index = lookupIndex(this, key);
      if (index !== undefined)
        return this.entries_[index + 1];
    },
    set: function(key, value) {
      var objectMode = isObject(key);
      var stringMode = typeof key === 'string';
      var index = lookupIndex(this, key);
      if (index !== undefined) {
        this.entries_[index + 1] = value;
      } else {
        index = this.entries_.length;
        this.entries_[index] = key;
        this.entries_[index + 1] = value;
        if (objectMode) {
          var hashObject = getOwnHashObject(key);
          var hash = hashObject.hash;
          this.objectIndex_[hash] = index;
        } else if (stringMode) {
          this.stringIndex_[key] = index;
        } else {
          this.primitiveIndex_[key] = index;
        }
      }
      return this;
    },
    has: function(key) {
      return lookupIndex(this, key) !== undefined;
    },
    delete: function(key) {
      var objectMode = isObject(key);
      var stringMode = typeof key === 'string';
      var index;
      var hash;
      if (objectMode) {
        var hashObject = getOwnHashObject(key);
        if (hashObject) {
          index = this.objectIndex_[hash = hashObject.hash];
          delete this.objectIndex_[hash];
        }
      } else if (stringMode) {
        index = this.stringIndex_[key];
        delete this.stringIndex_[key];
      } else {
        index = this.primitiveIndex_[key];
        delete this.primitiveIndex_[key];
      }
      if (index !== undefined) {
        this.entries_[index] = deletedSentinel;
        this.entries_[index + 1] = undefined;
        this.deletedCount_++;
        return true;
      }
      return false;
    },
    clear: function() {
      initMap(this);
    },
    forEach: function(callbackFn) {
      var thisArg = arguments[1];
      for (var i = 0; i < this.entries_.length; i += 2) {
        var key = this.entries_[i];
        var value = this.entries_[i + 1];
        if (key === deletedSentinel)
          continue;
        callbackFn.call(thisArg, value, key, this);
      }
    },
    entries: $traceurRuntime.initGeneratorFunction(function $__12() {
      var i,
          key,
          value;
      return $traceurRuntime.createGeneratorInstance(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              i = 0;
              $ctx.state = 12;
              break;
            case 12:
              $ctx.state = (i < this.entries_.length) ? 8 : -2;
              break;
            case 4:
              i += 2;
              $ctx.state = 12;
              break;
            case 8:
              key = this.entries_[i];
              value = this.entries_[i + 1];
              $ctx.state = 9;
              break;
            case 9:
              $ctx.state = (key === deletedSentinel) ? 4 : 6;
              break;
            case 6:
              $ctx.state = 2;
              return [key, value];
            case 2:
              $ctx.maybeThrow();
              $ctx.state = 4;
              break;
            default:
              return $ctx.end();
          }
      }, $__12, this);
    }),
    keys: $traceurRuntime.initGeneratorFunction(function $__13() {
      var i,
          key,
          value;
      return $traceurRuntime.createGeneratorInstance(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              i = 0;
              $ctx.state = 12;
              break;
            case 12:
              $ctx.state = (i < this.entries_.length) ? 8 : -2;
              break;
            case 4:
              i += 2;
              $ctx.state = 12;
              break;
            case 8:
              key = this.entries_[i];
              value = this.entries_[i + 1];
              $ctx.state = 9;
              break;
            case 9:
              $ctx.state = (key === deletedSentinel) ? 4 : 6;
              break;
            case 6:
              $ctx.state = 2;
              return key;
            case 2:
              $ctx.maybeThrow();
              $ctx.state = 4;
              break;
            default:
              return $ctx.end();
          }
      }, $__13, this);
    }),
    values: $traceurRuntime.initGeneratorFunction(function $__14() {
      var i,
          key,
          value;
      return $traceurRuntime.createGeneratorInstance(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              i = 0;
              $ctx.state = 12;
              break;
            case 12:
              $ctx.state = (i < this.entries_.length) ? 8 : -2;
              break;
            case 4:
              i += 2;
              $ctx.state = 12;
              break;
            case 8:
              key = this.entries_[i];
              value = this.entries_[i + 1];
              $ctx.state = 9;
              break;
            case 9:
              $ctx.state = (key === deletedSentinel) ? 4 : 6;
              break;
            case 6:
              $ctx.state = 2;
              return value;
            case 2:
              $ctx.maybeThrow();
              $ctx.state = 4;
              break;
            default:
              return $ctx.end();
          }
      }, $__14, this);
    })
  }, {});
  Object.defineProperty(Map.prototype, Symbol.iterator, {
    configurable: true,
    writable: true,
    value: Map.prototype.entries
  });
  function polyfillMap(global) {
    var $__9 = global,
        Object = $__9.Object,
        Symbol = $__9.Symbol;
    if (!global.Map)
      global.Map = Map;
    var mapPrototype = global.Map.prototype;
    if (mapPrototype.entries === undefined)
      global.Map = Map;
    if (mapPrototype.entries) {
      maybeAddIterator(mapPrototype, mapPrototype.entries, Symbol);
      maybeAddIterator(Object.getPrototypeOf(new global.Map().entries()), function() {
        return this;
      }, Symbol);
    }
  }
  registerPolyfill(polyfillMap);
  return {
    get Map() {
      return Map;
    },
    get polyfillMap() {
      return polyfillMap;
    }
  };
});
System.get("traceur-runtime@0.0.87/src/runtime/polyfills/Map.js" + '');
System.registerModule("traceur-runtime@0.0.87/src/runtime/polyfills/Set.js", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.87/src/runtime/polyfills/Set.js";
  var $__0 = System.get("traceur-runtime@0.0.87/src/runtime/polyfills/utils.js"),
      isObject = $__0.isObject,
      maybeAddIterator = $__0.maybeAddIterator,
      registerPolyfill = $__0.registerPolyfill;
  var Map = System.get("traceur-runtime@0.0.87/src/runtime/polyfills/Map.js").Map;
  var getOwnHashObject = $traceurRuntime.getOwnHashObject;
  var $hasOwnProperty = Object.prototype.hasOwnProperty;
  function initSet(set) {
    set.map_ = new Map();
  }
  var Set = function Set() {
    var iterable = arguments[0];
    if (!isObject(this))
      throw new TypeError('Set called on incompatible type');
    if ($hasOwnProperty.call(this, 'map_')) {
      throw new TypeError('Set can not be reentrantly initialised');
    }
    initSet(this);
    if (iterable !== null && iterable !== undefined) {
      var $__7 = true;
      var $__8 = false;
      var $__9 = undefined;
      try {
        for (var $__5 = void 0,
            $__4 = (iterable)[$traceurRuntime.toProperty(Symbol.iterator)](); !($__7 = ($__5 = $__4.next()).done); $__7 = true) {
          var item = $__5.value;
          {
            this.add(item);
          }
        }
      } catch ($__10) {
        $__8 = true;
        $__9 = $__10;
      } finally {
        try {
          if (!$__7 && $__4.return != null) {
            $__4.return();
          }
        } finally {
          if ($__8) {
            throw $__9;
          }
        }
      }
    }
  };
  ($traceurRuntime.createClass)(Set, {
    get size() {
      return this.map_.size;
    },
    has: function(key) {
      return this.map_.has(key);
    },
    add: function(key) {
      this.map_.set(key, key);
      return this;
    },
    delete: function(key) {
      return this.map_.delete(key);
    },
    clear: function() {
      return this.map_.clear();
    },
    forEach: function(callbackFn) {
      var thisArg = arguments[1];
      var $__2 = this;
      return this.map_.forEach((function(value, key) {
        callbackFn.call(thisArg, key, key, $__2);
      }));
    },
    values: $traceurRuntime.initGeneratorFunction(function $__12() {
      var $__13,
          $__14;
      return $traceurRuntime.createGeneratorInstance(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              $__13 = $ctx.wrapYieldStar(this.map_.keys()[Symbol.iterator]());
              $ctx.sent = void 0;
              $ctx.action = 'next';
              $ctx.state = 12;
              break;
            case 12:
              $__14 = $__13[$ctx.action]($ctx.sentIgnoreThrow);
              $ctx.state = 9;
              break;
            case 9:
              $ctx.state = ($__14.done) ? 3 : 2;
              break;
            case 3:
              $ctx.sent = $__14.value;
              $ctx.state = -2;
              break;
            case 2:
              $ctx.state = 12;
              return $__14.value;
            default:
              return $ctx.end();
          }
      }, $__12, this);
    }),
    entries: $traceurRuntime.initGeneratorFunction(function $__15() {
      var $__16,
          $__17;
      return $traceurRuntime.createGeneratorInstance(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              $__16 = $ctx.wrapYieldStar(this.map_.entries()[Symbol.iterator]());
              $ctx.sent = void 0;
              $ctx.action = 'next';
              $ctx.state = 12;
              break;
            case 12:
              $__17 = $__16[$ctx.action]($ctx.sentIgnoreThrow);
              $ctx.state = 9;
              break;
            case 9:
              $ctx.state = ($__17.done) ? 3 : 2;
              break;
            case 3:
              $ctx.sent = $__17.value;
              $ctx.state = -2;
              break;
            case 2:
              $ctx.state = 12;
              return $__17.value;
            default:
              return $ctx.end();
          }
      }, $__15, this);
    })
  }, {});
  Object.defineProperty(Set.prototype, Symbol.iterator, {
    configurable: true,
    writable: true,
    value: Set.prototype.values
  });
  Object.defineProperty(Set.prototype, 'keys', {
    configurable: true,
    writable: true,
    value: Set.prototype.values
  });
  function polyfillSet(global) {
    var $__11 = global,
        Object = $__11.Object,
        Symbol = $__11.Symbol;
    if (!global.Set)
      global.Set = Set;
    var setPrototype = global.Set.prototype;
    if (setPrototype.values) {
      maybeAddIterator(setPrototype, setPrototype.values, Symbol);
      maybeAddIterator(Object.getPrototypeOf(new global.Set().values()), function() {
        return this;
      }, Symbol);
    }
  }
  registerPolyfill(polyfillSet);
  return {
    get Set() {
      return Set;
    },
    get polyfillSet() {
      return polyfillSet;
    }
  };
});
System.get("traceur-runtime@0.0.87/src/runtime/polyfills/Set.js" + '');
System.registerModule("traceur-runtime@0.0.87/node_modules/rsvp/lib/rsvp/asap.js", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.87/node_modules/rsvp/lib/rsvp/asap.js";
  var len = 0;
  function asap(callback, arg) {
    queue[len] = callback;
    queue[len + 1] = arg;
    len += 2;
    if (len === 2) {
      scheduleFlush();
    }
  }
  var $__default = asap;
  var browserGlobal = (typeof window !== 'undefined') ? window : {};
  var BrowserMutationObserver = browserGlobal.MutationObserver || browserGlobal.WebKitMutationObserver;
  var isWorker = typeof Uint8ClampedArray !== 'undefined' && typeof importScripts !== 'undefined' && typeof MessageChannel !== 'undefined';
  function useNextTick() {
    return function() {
      process.nextTick(flush);
    };
  }
  function useMutationObserver() {
    var iterations = 0;
    var observer = new BrowserMutationObserver(flush);
    var node = document.createTextNode('');
    observer.observe(node, {characterData: true});
    return function() {
      node.data = (iterations = ++iterations % 2);
    };
  }
  function useMessageChannel() {
    var channel = new MessageChannel();
    channel.port1.onmessage = flush;
    return function() {
      channel.port2.postMessage(0);
    };
  }
  function useSetTimeout() {
    return function() {
      setTimeout(flush, 1);
    };
  }
  var queue = new Array(1000);
  function flush() {
    for (var i = 0; i < len; i += 2) {
      var callback = queue[i];
      var arg = queue[i + 1];
      callback(arg);
      queue[i] = undefined;
      queue[i + 1] = undefined;
    }
    len = 0;
  }
  var scheduleFlush;
  if (typeof process !== 'undefined' && {}.toString.call(process) === '[object process]') {
    scheduleFlush = useNextTick();
  } else if (BrowserMutationObserver) {
    scheduleFlush = useMutationObserver();
  } else if (isWorker) {
    scheduleFlush = useMessageChannel();
  } else {
    scheduleFlush = useSetTimeout();
  }
  return {get default() {
      return $__default;
    }};
});
System.registerModule("traceur-runtime@0.0.87/src/runtime/polyfills/Promise.js", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.87/src/runtime/polyfills/Promise.js";
  var async = System.get("traceur-runtime@0.0.87/node_modules/rsvp/lib/rsvp/asap.js").default;
  var registerPolyfill = System.get("traceur-runtime@0.0.87/src/runtime/polyfills/utils.js").registerPolyfill;
  var promiseRaw = {};
  function isPromise(x) {
    return x && typeof x === 'object' && x.status_ !== undefined;
  }
  function idResolveHandler(x) {
    return x;
  }
  function idRejectHandler(x) {
    throw x;
  }
  function chain(promise) {
    var onResolve = arguments[1] !== (void 0) ? arguments[1] : idResolveHandler;
    var onReject = arguments[2] !== (void 0) ? arguments[2] : idRejectHandler;
    var deferred = getDeferred(promise.constructor);
    switch (promise.status_) {
      case undefined:
        throw TypeError;
      case 0:
        promise.onResolve_.push(onResolve, deferred);
        promise.onReject_.push(onReject, deferred);
        break;
      case +1:
        promiseEnqueue(promise.value_, [onResolve, deferred]);
        break;
      case -1:
        promiseEnqueue(promise.value_, [onReject, deferred]);
        break;
    }
    return deferred.promise;
  }
  function getDeferred(C) {
    if (this === $Promise) {
      var promise = promiseInit(new $Promise(promiseRaw));
      return {
        promise: promise,
        resolve: (function(x) {
          promiseResolve(promise, x);
        }),
        reject: (function(r) {
          promiseReject(promise, r);
        })
      };
    } else {
      var result = {};
      result.promise = new C((function(resolve, reject) {
        result.resolve = resolve;
        result.reject = reject;
      }));
      return result;
    }
  }
  function promiseSet(promise, status, value, onResolve, onReject) {
    promise.status_ = status;
    promise.value_ = value;
    promise.onResolve_ = onResolve;
    promise.onReject_ = onReject;
    return promise;
  }
  function promiseInit(promise) {
    return promiseSet(promise, 0, undefined, [], []);
  }
  var Promise = function Promise(resolver) {
    if (resolver === promiseRaw)
      return ;
    if (typeof resolver !== 'function')
      throw new TypeError;
    var promise = promiseInit(this);
    try {
      resolver((function(x) {
        promiseResolve(promise, x);
      }), (function(r) {
        promiseReject(promise, r);
      }));
    } catch (e) {
      promiseReject(promise, e);
    }
  };
  ($traceurRuntime.createClass)(Promise, {
    catch: function(onReject) {
      return this.then(undefined, onReject);
    },
    then: function(onResolve, onReject) {
      if (typeof onResolve !== 'function')
        onResolve = idResolveHandler;
      if (typeof onReject !== 'function')
        onReject = idRejectHandler;
      var that = this;
      var constructor = this.constructor;
      return chain(this, function(x) {
        x = promiseCoerce(constructor, x);
        return x === that ? onReject(new TypeError) : isPromise(x) ? x.then(onResolve, onReject) : onResolve(x);
      }, onReject);
    }
  }, {
    resolve: function(x) {
      if (this === $Promise) {
        if (isPromise(x)) {
          return x;
        }
        return promiseSet(new $Promise(promiseRaw), +1, x);
      } else {
        return new this(function(resolve, reject) {
          resolve(x);
        });
      }
    },
    reject: function(r) {
      if (this === $Promise) {
        return promiseSet(new $Promise(promiseRaw), -1, r);
      } else {
        return new this((function(resolve, reject) {
          reject(r);
        }));
      }
    },
    all: function(values) {
      var deferred = getDeferred(this);
      var resolutions = [];
      try {
        var makeCountdownFunction = function(i) {
          return (function(x) {
            resolutions[i] = x;
            if (--count === 0)
              deferred.resolve(resolutions);
          });
        };
        var count = 0;
        var i = 0;
        var $__6 = true;
        var $__7 = false;
        var $__8 = undefined;
        try {
          for (var $__4 = void 0,
              $__3 = (values)[$traceurRuntime.toProperty(Symbol.iterator)](); !($__6 = ($__4 = $__3.next()).done); $__6 = true) {
            var value = $__4.value;
            {
              var countdownFunction = makeCountdownFunction(i);
              this.resolve(value).then(countdownFunction, (function(r) {
                deferred.reject(r);
              }));
              ++i;
              ++count;
            }
          }
        } catch ($__9) {
          $__7 = true;
          $__8 = $__9;
        } finally {
          try {
            if (!$__6 && $__3.return != null) {
              $__3.return();
            }
          } finally {
            if ($__7) {
              throw $__8;
            }
          }
        }
        if (count === 0) {
          deferred.resolve(resolutions);
        }
      } catch (e) {
        deferred.reject(e);
      }
      return deferred.promise;
    },
    race: function(values) {
      var deferred = getDeferred(this);
      try {
        for (var i = 0; i < values.length; i++) {
          this.resolve(values[i]).then((function(x) {
            deferred.resolve(x);
          }), (function(r) {
            deferred.reject(r);
          }));
        }
      } catch (e) {
        deferred.reject(e);
      }
      return deferred.promise;
    }
  });
  var $Promise = Promise;
  var $PromiseReject = $Promise.reject;
  function promiseResolve(promise, x) {
    promiseDone(promise, +1, x, promise.onResolve_);
  }
  function promiseReject(promise, r) {
    promiseDone(promise, -1, r, promise.onReject_);
  }
  function promiseDone(promise, status, value, reactions) {
    if (promise.status_ !== 0)
      return ;
    promiseEnqueue(value, reactions);
    promiseSet(promise, status, value);
  }
  function promiseEnqueue(value, tasks) {
    async((function() {
      for (var i = 0; i < tasks.length; i += 2) {
        promiseHandle(value, tasks[i], tasks[i + 1]);
      }
    }));
  }
  function promiseHandle(value, handler, deferred) {
    try {
      var result = handler(value);
      if (result === deferred.promise)
        throw new TypeError;
      else if (isPromise(result))
        chain(result, deferred.resolve, deferred.reject);
      else
        deferred.resolve(result);
    } catch (e) {
      try {
        deferred.reject(e);
      } catch (e) {}
    }
  }
  var thenableSymbol = '@@thenable';
  function isObject(x) {
    return x && (typeof x === 'object' || typeof x === 'function');
  }
  function promiseCoerce(constructor, x) {
    if (!isPromise(x) && isObject(x)) {
      var then;
      try {
        then = x.then;
      } catch (r) {
        var promise = $PromiseReject.call(constructor, r);
        x[thenableSymbol] = promise;
        return promise;
      }
      if (typeof then === 'function') {
        var p = x[thenableSymbol];
        if (p) {
          return p;
        } else {
          var deferred = getDeferred(constructor);
          x[thenableSymbol] = deferred.promise;
          try {
            then.call(x, deferred.resolve, deferred.reject);
          } catch (r) {
            deferred.reject(r);
          }
          return deferred.promise;
        }
      }
    }
    return x;
  }
  function polyfillPromise(global) {
    if (!global.Promise)
      global.Promise = Promise;
  }
  registerPolyfill(polyfillPromise);
  return {
    get Promise() {
      return Promise;
    },
    get polyfillPromise() {
      return polyfillPromise;
    }
  };
});
System.get("traceur-runtime@0.0.87/src/runtime/polyfills/Promise.js" + '');
System.registerModule("traceur-runtime@0.0.87/src/runtime/polyfills/StringIterator.js", [], function() {
  "use strict";
  var $__2;
  var __moduleName = "traceur-runtime@0.0.87/src/runtime/polyfills/StringIterator.js";
  var $__0 = System.get("traceur-runtime@0.0.87/src/runtime/polyfills/utils.js"),
      createIteratorResultObject = $__0.createIteratorResultObject,
      isObject = $__0.isObject;
  var toProperty = $traceurRuntime.toProperty;
  var hasOwnProperty = Object.prototype.hasOwnProperty;
  var iteratedString = Symbol('iteratedString');
  var stringIteratorNextIndex = Symbol('stringIteratorNextIndex');
  var StringIterator = function StringIterator() {
    ;
  };
  ($traceurRuntime.createClass)(StringIterator, ($__2 = {}, Object.defineProperty($__2, "next", {
    value: function() {
      var o = this;
      if (!isObject(o) || !hasOwnProperty.call(o, iteratedString)) {
        throw new TypeError('this must be a StringIterator object');
      }
      var s = o[toProperty(iteratedString)];
      if (s === undefined) {
        return createIteratorResultObject(undefined, true);
      }
      var position = o[toProperty(stringIteratorNextIndex)];
      var len = s.length;
      if (position >= len) {
        o[toProperty(iteratedString)] = undefined;
        return createIteratorResultObject(undefined, true);
      }
      var first = s.charCodeAt(position);
      var resultString;
      if (first < 0xD800 || first > 0xDBFF || position + 1 === len) {
        resultString = String.fromCharCode(first);
      } else {
        var second = s.charCodeAt(position + 1);
        if (second < 0xDC00 || second > 0xDFFF) {
          resultString = String.fromCharCode(first);
        } else {
          resultString = String.fromCharCode(first) + String.fromCharCode(second);
        }
      }
      o[toProperty(stringIteratorNextIndex)] = position + resultString.length;
      return createIteratorResultObject(resultString, false);
    },
    configurable: true,
    enumerable: true,
    writable: true
  }), Object.defineProperty($__2, Symbol.iterator, {
    value: function() {
      return this;
    },
    configurable: true,
    enumerable: true,
    writable: true
  }), $__2), {});
  function createStringIterator(string) {
    var s = String(string);
    var iterator = Object.create(StringIterator.prototype);
    iterator[toProperty(iteratedString)] = s;
    iterator[toProperty(stringIteratorNextIndex)] = 0;
    return iterator;
  }
  return {get createStringIterator() {
      return createStringIterator;
    }};
});
System.registerModule("traceur-runtime@0.0.87/src/runtime/polyfills/String.js", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.87/src/runtime/polyfills/String.js";
  var createStringIterator = System.get("traceur-runtime@0.0.87/src/runtime/polyfills/StringIterator.js").createStringIterator;
  var $__1 = System.get("traceur-runtime@0.0.87/src/runtime/polyfills/utils.js"),
      maybeAddFunctions = $__1.maybeAddFunctions,
      maybeAddIterator = $__1.maybeAddIterator,
      registerPolyfill = $__1.registerPolyfill;
  var $toString = Object.prototype.toString;
  var $indexOf = String.prototype.indexOf;
  var $lastIndexOf = String.prototype.lastIndexOf;
  function startsWith(search) {
    var string = String(this);
    if (this == null || $toString.call(search) == '[object RegExp]') {
      throw TypeError();
    }
    var stringLength = string.length;
    var searchString = String(search);
    var searchLength = searchString.length;
    var position = arguments.length > 1 ? arguments[1] : undefined;
    var pos = position ? Number(position) : 0;
    if (isNaN(pos)) {
      pos = 0;
    }
    var start = Math.min(Math.max(pos, 0), stringLength);
    return $indexOf.call(string, searchString, pos) == start;
  }
  function endsWith(search) {
    var string = String(this);
    if (this == null || $toString.call(search) == '[object RegExp]') {
      throw TypeError();
    }
    var stringLength = string.length;
    var searchString = String(search);
    var searchLength = searchString.length;
    var pos = stringLength;
    if (arguments.length > 1) {
      var position = arguments[1];
      if (position !== undefined) {
        pos = position ? Number(position) : 0;
        if (isNaN(pos)) {
          pos = 0;
        }
      }
    }
    var end = Math.min(Math.max(pos, 0), stringLength);
    var start = end - searchLength;
    if (start < 0) {
      return false;
    }
    return $lastIndexOf.call(string, searchString, start) == start;
  }
  function includes(search) {
    if (this == null) {
      throw TypeError();
    }
    var string = String(this);
    if (search && $toString.call(search) == '[object RegExp]') {
      throw TypeError();
    }
    var stringLength = string.length;
    var searchString = String(search);
    var searchLength = searchString.length;
    var position = arguments.length > 1 ? arguments[1] : undefined;
    var pos = position ? Number(position) : 0;
    if (pos != pos) {
      pos = 0;
    }
    var start = Math.min(Math.max(pos, 0), stringLength);
    if (searchLength + start > stringLength) {
      return false;
    }
    return $indexOf.call(string, searchString, pos) != -1;
  }
  function repeat(count) {
    if (this == null) {
      throw TypeError();
    }
    var string = String(this);
    var n = count ? Number(count) : 0;
    if (isNaN(n)) {
      n = 0;
    }
    if (n < 0 || n == Infinity) {
      throw RangeError();
    }
    if (n == 0) {
      return '';
    }
    var result = '';
    while (n--) {
      result += string;
    }
    return result;
  }
  function codePointAt(position) {
    if (this == null) {
      throw TypeError();
    }
    var string = String(this);
    var size = string.length;
    var index = position ? Number(position) : 0;
    if (isNaN(index)) {
      index = 0;
    }
    if (index < 0 || index >= size) {
      return undefined;
    }
    var first = string.charCodeAt(index);
    var second;
    if (first >= 0xD800 && first <= 0xDBFF && size > index + 1) {
      second = string.charCodeAt(index + 1);
      if (second >= 0xDC00 && second <= 0xDFFF) {
        return (first - 0xD800) * 0x400 + second - 0xDC00 + 0x10000;
      }
    }
    return first;
  }
  function raw(callsite) {
    var raw = callsite.raw;
    var len = raw.length >>> 0;
    if (len === 0)
      return '';
    var s = '';
    var i = 0;
    while (true) {
      s += raw[i];
      if (i + 1 === len)
        return s;
      s += arguments[++i];
    }
  }
  function fromCodePoint(_) {
    var codeUnits = [];
    var floor = Math.floor;
    var highSurrogate;
    var lowSurrogate;
    var index = -1;
    var length = arguments.length;
    if (!length) {
      return '';
    }
    while (++index < length) {
      var codePoint = Number(arguments[index]);
      if (!isFinite(codePoint) || codePoint < 0 || codePoint > 0x10FFFF || floor(codePoint) != codePoint) {
        throw RangeError('Invalid code point: ' + codePoint);
      }
      if (codePoint <= 0xFFFF) {
        codeUnits.push(codePoint);
      } else {
        codePoint -= 0x10000;
        highSurrogate = (codePoint >> 10) + 0xD800;
        lowSurrogate = (codePoint % 0x400) + 0xDC00;
        codeUnits.push(highSurrogate, lowSurrogate);
      }
    }
    return String.fromCharCode.apply(null, codeUnits);
  }
  function stringPrototypeIterator() {
    var o = $traceurRuntime.checkObjectCoercible(this);
    var s = String(o);
    return createStringIterator(s);
  }
  function polyfillString(global) {
    var String = global.String;
    maybeAddFunctions(String.prototype, ['codePointAt', codePointAt, 'endsWith', endsWith, 'includes', includes, 'repeat', repeat, 'startsWith', startsWith]);
    maybeAddFunctions(String, ['fromCodePoint', fromCodePoint, 'raw', raw]);
    maybeAddIterator(String.prototype, stringPrototypeIterator, Symbol);
  }
  registerPolyfill(polyfillString);
  return {
    get startsWith() {
      return startsWith;
    },
    get endsWith() {
      return endsWith;
    },
    get includes() {
      return includes;
    },
    get repeat() {
      return repeat;
    },
    get codePointAt() {
      return codePointAt;
    },
    get raw() {
      return raw;
    },
    get fromCodePoint() {
      return fromCodePoint;
    },
    get stringPrototypeIterator() {
      return stringPrototypeIterator;
    },
    get polyfillString() {
      return polyfillString;
    }
  };
});
System.get("traceur-runtime@0.0.87/src/runtime/polyfills/String.js" + '');
System.registerModule("traceur-runtime@0.0.87/src/runtime/polyfills/ArrayIterator.js", [], function() {
  "use strict";
  var $__2;
  var __moduleName = "traceur-runtime@0.0.87/src/runtime/polyfills/ArrayIterator.js";
  var $__0 = System.get("traceur-runtime@0.0.87/src/runtime/polyfills/utils.js"),
      toObject = $__0.toObject,
      toUint32 = $__0.toUint32,
      createIteratorResultObject = $__0.createIteratorResultObject;
  var ARRAY_ITERATOR_KIND_KEYS = 1;
  var ARRAY_ITERATOR_KIND_VALUES = 2;
  var ARRAY_ITERATOR_KIND_ENTRIES = 3;
  var ArrayIterator = function ArrayIterator() {
    ;
  };
  ($traceurRuntime.createClass)(ArrayIterator, ($__2 = {}, Object.defineProperty($__2, "next", {
    value: function() {
      var iterator = toObject(this);
      var array = iterator.iteratorObject_;
      if (!array) {
        throw new TypeError('Object is not an ArrayIterator');
      }
      var index = iterator.arrayIteratorNextIndex_;
      var itemKind = iterator.arrayIterationKind_;
      var length = toUint32(array.length);
      if (index >= length) {
        iterator.arrayIteratorNextIndex_ = Infinity;
        return createIteratorResultObject(undefined, true);
      }
      iterator.arrayIteratorNextIndex_ = index + 1;
      if (itemKind == ARRAY_ITERATOR_KIND_VALUES)
        return createIteratorResultObject(array[index], false);
      if (itemKind == ARRAY_ITERATOR_KIND_ENTRIES)
        return createIteratorResultObject([index, array[index]], false);
      return createIteratorResultObject(index, false);
    },
    configurable: true,
    enumerable: true,
    writable: true
  }), Object.defineProperty($__2, Symbol.iterator, {
    value: function() {
      return this;
    },
    configurable: true,
    enumerable: true,
    writable: true
  }), $__2), {});
  function createArrayIterator(array, kind) {
    var object = toObject(array);
    var iterator = new ArrayIterator;
    iterator.iteratorObject_ = object;
    iterator.arrayIteratorNextIndex_ = 0;
    iterator.arrayIterationKind_ = kind;
    return iterator;
  }
  function entries() {
    return createArrayIterator(this, ARRAY_ITERATOR_KIND_ENTRIES);
  }
  function keys() {
    return createArrayIterator(this, ARRAY_ITERATOR_KIND_KEYS);
  }
  function values() {
    return createArrayIterator(this, ARRAY_ITERATOR_KIND_VALUES);
  }
  return {
    get entries() {
      return entries;
    },
    get keys() {
      return keys;
    },
    get values() {
      return values;
    }
  };
});
System.registerModule("traceur-runtime@0.0.87/src/runtime/polyfills/Array.js", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.87/src/runtime/polyfills/Array.js";
  var $__0 = System.get("traceur-runtime@0.0.87/src/runtime/polyfills/ArrayIterator.js"),
      entries = $__0.entries,
      keys = $__0.keys,
      jsValues = $__0.values;
  var $__1 = System.get("traceur-runtime@0.0.87/src/runtime/polyfills/utils.js"),
      checkIterable = $__1.checkIterable,
      isCallable = $__1.isCallable,
      isConstructor = $__1.isConstructor,
      maybeAddFunctions = $__1.maybeAddFunctions,
      maybeAddIterator = $__1.maybeAddIterator,
      registerPolyfill = $__1.registerPolyfill,
      toInteger = $__1.toInteger,
      toLength = $__1.toLength,
      toObject = $__1.toObject;
  function from(arrLike) {
    var mapFn = arguments[1];
    var thisArg = arguments[2];
    var C = this;
    var items = toObject(arrLike);
    var mapping = mapFn !== undefined;
    var k = 0;
    var arr,
        len;
    if (mapping && !isCallable(mapFn)) {
      throw TypeError();
    }
    if (checkIterable(items)) {
      arr = isConstructor(C) ? new C() : [];
      var $__5 = true;
      var $__6 = false;
      var $__7 = undefined;
      try {
        for (var $__3 = void 0,
            $__2 = (items)[$traceurRuntime.toProperty(Symbol.iterator)](); !($__5 = ($__3 = $__2.next()).done); $__5 = true) {
          var item = $__3.value;
          {
            if (mapping) {
              arr[k] = mapFn.call(thisArg, item, k);
            } else {
              arr[k] = item;
            }
            k++;
          }
        }
      } catch ($__8) {
        $__6 = true;
        $__7 = $__8;
      } finally {
        try {
          if (!$__5 && $__2.return != null) {
            $__2.return();
          }
        } finally {
          if ($__6) {
            throw $__7;
          }
        }
      }
      arr.length = k;
      return arr;
    }
    len = toLength(items.length);
    arr = isConstructor(C) ? new C(len) : new Array(len);
    for (; k < len; k++) {
      if (mapping) {
        arr[k] = typeof thisArg === 'undefined' ? mapFn(items[k], k) : mapFn.call(thisArg, items[k], k);
      } else {
        arr[k] = items[k];
      }
    }
    arr.length = len;
    return arr;
  }
  function of() {
    for (var items = [],
        $__9 = 0; $__9 < arguments.length; $__9++)
      items[$__9] = arguments[$__9];
    var C = this;
    var len = items.length;
    var arr = isConstructor(C) ? new C(len) : new Array(len);
    for (var k = 0; k < len; k++) {
      arr[k] = items[k];
    }
    arr.length = len;
    return arr;
  }
  function fill(value) {
    var start = arguments[1] !== (void 0) ? arguments[1] : 0;
    var end = arguments[2];
    var object = toObject(this);
    var len = toLength(object.length);
    var fillStart = toInteger(start);
    var fillEnd = end !== undefined ? toInteger(end) : len;
    fillStart = fillStart < 0 ? Math.max(len + fillStart, 0) : Math.min(fillStart, len);
    fillEnd = fillEnd < 0 ? Math.max(len + fillEnd, 0) : Math.min(fillEnd, len);
    while (fillStart < fillEnd) {
      object[fillStart] = value;
      fillStart++;
    }
    return object;
  }
  function find(predicate) {
    var thisArg = arguments[1];
    return findHelper(this, predicate, thisArg);
  }
  function findIndex(predicate) {
    var thisArg = arguments[1];
    return findHelper(this, predicate, thisArg, true);
  }
  function findHelper(self, predicate) {
    var thisArg = arguments[2];
    var returnIndex = arguments[3] !== (void 0) ? arguments[3] : false;
    var object = toObject(self);
    var len = toLength(object.length);
    if (!isCallable(predicate)) {
      throw TypeError();
    }
    for (var i = 0; i < len; i++) {
      var value = object[i];
      if (predicate.call(thisArg, value, i, object)) {
        return returnIndex ? i : value;
      }
    }
    return returnIndex ? -1 : undefined;
  }
  function polyfillArray(global) {
    var $__10 = global,
        Array = $__10.Array,
        Object = $__10.Object,
        Symbol = $__10.Symbol;
    var values = jsValues;
    if (Symbol && Symbol.iterator && Array.prototype[Symbol.iterator]) {
      values = Array.prototype[Symbol.iterator];
    }
    maybeAddFunctions(Array.prototype, ['entries', entries, 'keys', keys, 'values', values, 'fill', fill, 'find', find, 'findIndex', findIndex]);
    maybeAddFunctions(Array, ['from', from, 'of', of]);
    maybeAddIterator(Array.prototype, values, Symbol);
    maybeAddIterator(Object.getPrototypeOf([].values()), function() {
      return this;
    }, Symbol);
  }
  registerPolyfill(polyfillArray);
  return {
    get from() {
      return from;
    },
    get of() {
      return of;
    },
    get fill() {
      return fill;
    },
    get find() {
      return find;
    },
    get findIndex() {
      return findIndex;
    },
    get polyfillArray() {
      return polyfillArray;
    }
  };
});
System.get("traceur-runtime@0.0.87/src/runtime/polyfills/Array.js" + '');
System.registerModule("traceur-runtime@0.0.87/src/runtime/polyfills/Object.js", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.87/src/runtime/polyfills/Object.js";
  var $__0 = System.get("traceur-runtime@0.0.87/src/runtime/polyfills/utils.js"),
      maybeAddFunctions = $__0.maybeAddFunctions,
      registerPolyfill = $__0.registerPolyfill;
  var $__1 = $traceurRuntime,
      defineProperty = $__1.defineProperty,
      getOwnPropertyDescriptor = $__1.getOwnPropertyDescriptor,
      getOwnPropertyNames = $__1.getOwnPropertyNames,
      isPrivateName = $__1.isPrivateName,
      keys = $__1.keys;
  function is(left, right) {
    if (left === right)
      return left !== 0 || 1 / left === 1 / right;
    return left !== left && right !== right;
  }
  function assign(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      var props = source == null ? [] : keys(source);
      var p = void 0,
          length = props.length;
      for (p = 0; p < length; p++) {
        var name = props[p];
        if (isPrivateName(name))
          continue;
        target[name] = source[name];
      }
    }
    return target;
  }
  function mixin(target, source) {
    var props = getOwnPropertyNames(source);
    var p,
        descriptor,
        length = props.length;
    for (p = 0; p < length; p++) {
      var name = props[p];
      if (isPrivateName(name))
        continue;
      descriptor = getOwnPropertyDescriptor(source, props[p]);
      defineProperty(target, props[p], descriptor);
    }
    return target;
  }
  function polyfillObject(global) {
    var Object = global.Object;
    maybeAddFunctions(Object, ['assign', assign, 'is', is, 'mixin', mixin]);
  }
  registerPolyfill(polyfillObject);
  return {
    get is() {
      return is;
    },
    get assign() {
      return assign;
    },
    get mixin() {
      return mixin;
    },
    get polyfillObject() {
      return polyfillObject;
    }
  };
});
System.get("traceur-runtime@0.0.87/src/runtime/polyfills/Object.js" + '');
System.registerModule("traceur-runtime@0.0.87/src/runtime/polyfills/Number.js", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.87/src/runtime/polyfills/Number.js";
  var $__0 = System.get("traceur-runtime@0.0.87/src/runtime/polyfills/utils.js"),
      isNumber = $__0.isNumber,
      maybeAddConsts = $__0.maybeAddConsts,
      maybeAddFunctions = $__0.maybeAddFunctions,
      registerPolyfill = $__0.registerPolyfill,
      toInteger = $__0.toInteger;
  var $abs = Math.abs;
  var $isFinite = isFinite;
  var $isNaN = isNaN;
  var MAX_SAFE_INTEGER = Math.pow(2, 53) - 1;
  var MIN_SAFE_INTEGER = -Math.pow(2, 53) + 1;
  var EPSILON = Math.pow(2, -52);
  function NumberIsFinite(number) {
    return isNumber(number) && $isFinite(number);
  }
  ;
  function isInteger(number) {
    return NumberIsFinite(number) && toInteger(number) === number;
  }
  function NumberIsNaN(number) {
    return isNumber(number) && $isNaN(number);
  }
  ;
  function isSafeInteger(number) {
    if (NumberIsFinite(number)) {
      var integral = toInteger(number);
      if (integral === number)
        return $abs(integral) <= MAX_SAFE_INTEGER;
    }
    return false;
  }
  function polyfillNumber(global) {
    var Number = global.Number;
    maybeAddConsts(Number, ['MAX_SAFE_INTEGER', MAX_SAFE_INTEGER, 'MIN_SAFE_INTEGER', MIN_SAFE_INTEGER, 'EPSILON', EPSILON]);
    maybeAddFunctions(Number, ['isFinite', NumberIsFinite, 'isInteger', isInteger, 'isNaN', NumberIsNaN, 'isSafeInteger', isSafeInteger]);
  }
  registerPolyfill(polyfillNumber);
  return {
    get MAX_SAFE_INTEGER() {
      return MAX_SAFE_INTEGER;
    },
    get MIN_SAFE_INTEGER() {
      return MIN_SAFE_INTEGER;
    },
    get EPSILON() {
      return EPSILON;
    },
    get isFinite() {
      return NumberIsFinite;
    },
    get isInteger() {
      return isInteger;
    },
    get isNaN() {
      return NumberIsNaN;
    },
    get isSafeInteger() {
      return isSafeInteger;
    },
    get polyfillNumber() {
      return polyfillNumber;
    }
  };
});
System.get("traceur-runtime@0.0.87/src/runtime/polyfills/Number.js" + '');
System.registerModule("traceur-runtime@0.0.87/src/runtime/polyfills/fround.js", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.87/src/runtime/polyfills/fround.js";
  var $isFinite = isFinite;
  var $isNaN = isNaN;
  var $__0 = Math,
      LN2 = $__0.LN2,
      abs = $__0.abs,
      floor = $__0.floor,
      log = $__0.log,
      min = $__0.min,
      pow = $__0.pow;
  function packIEEE754(v, ebits, fbits) {
    var bias = (1 << (ebits - 1)) - 1,
        s,
        e,
        f,
        ln,
        i,
        bits,
        str,
        bytes;
    function roundToEven(n) {
      var w = floor(n),
          f = n - w;
      if (f < 0.5)
        return w;
      if (f > 0.5)
        return w + 1;
      return w % 2 ? w + 1 : w;
    }
    if (v !== v) {
      e = (1 << ebits) - 1;
      f = pow(2, fbits - 1);
      s = 0;
    } else if (v === Infinity || v === -Infinity) {
      e = (1 << ebits) - 1;
      f = 0;
      s = (v < 0) ? 1 : 0;
    } else if (v === 0) {
      e = 0;
      f = 0;
      s = (1 / v === -Infinity) ? 1 : 0;
    } else {
      s = v < 0;
      v = abs(v);
      if (v >= pow(2, 1 - bias)) {
        e = min(floor(log(v) / LN2), 1023);
        f = roundToEven(v / pow(2, e) * pow(2, fbits));
        if (f / pow(2, fbits) >= 2) {
          e = e + 1;
          f = 1;
        }
        if (e > bias) {
          e = (1 << ebits) - 1;
          f = 0;
        } else {
          e = e + bias;
          f = f - pow(2, fbits);
        }
      } else {
        e = 0;
        f = roundToEven(v / pow(2, 1 - bias - fbits));
      }
    }
    bits = [];
    for (i = fbits; i; i -= 1) {
      bits.push(f % 2 ? 1 : 0);
      f = floor(f / 2);
    }
    for (i = ebits; i; i -= 1) {
      bits.push(e % 2 ? 1 : 0);
      e = floor(e / 2);
    }
    bits.push(s ? 1 : 0);
    bits.reverse();
    str = bits.join('');
    bytes = [];
    while (str.length) {
      bytes.push(parseInt(str.substring(0, 8), 2));
      str = str.substring(8);
    }
    return bytes;
  }
  function unpackIEEE754(bytes, ebits, fbits) {
    var bits = [],
        i,
        j,
        b,
        str,
        bias,
        s,
        e,
        f;
    for (i = bytes.length; i; i -= 1) {
      b = bytes[i - 1];
      for (j = 8; j; j -= 1) {
        bits.push(b % 2 ? 1 : 0);
        b = b >> 1;
      }
    }
    bits.reverse();
    str = bits.join('');
    bias = (1 << (ebits - 1)) - 1;
    s = parseInt(str.substring(0, 1), 2) ? -1 : 1;
    e = parseInt(str.substring(1, 1 + ebits), 2);
    f = parseInt(str.substring(1 + ebits), 2);
    if (e === (1 << ebits) - 1) {
      return f !== 0 ? NaN : s * Infinity;
    } else if (e > 0) {
      return s * pow(2, e - bias) * (1 + f / pow(2, fbits));
    } else if (f !== 0) {
      return s * pow(2, -(bias - 1)) * (f / pow(2, fbits));
    } else {
      return s < 0 ? -0 : 0;
    }
  }
  function unpackF32(b) {
    return unpackIEEE754(b, 8, 23);
  }
  function packF32(v) {
    return packIEEE754(v, 8, 23);
  }
  function fround(x) {
    if (x === 0 || !$isFinite(x) || $isNaN(x)) {
      return x;
    }
    return unpackF32(packF32(Number(x)));
  }
  return {get fround() {
      return fround;
    }};
});
System.registerModule("traceur-runtime@0.0.87/src/runtime/polyfills/Math.js", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.87/src/runtime/polyfills/Math.js";
  var jsFround = System.get("traceur-runtime@0.0.87/src/runtime/polyfills/fround.js").fround;
  var $__1 = System.get("traceur-runtime@0.0.87/src/runtime/polyfills/utils.js"),
      maybeAddFunctions = $__1.maybeAddFunctions,
      registerPolyfill = $__1.registerPolyfill,
      toUint32 = $__1.toUint32;
  var $isFinite = isFinite;
  var $isNaN = isNaN;
  var $__2 = Math,
      abs = $__2.abs,
      ceil = $__2.ceil,
      exp = $__2.exp,
      floor = $__2.floor,
      log = $__2.log,
      pow = $__2.pow,
      sqrt = $__2.sqrt;
  function clz32(x) {
    x = toUint32(+x);
    if (x == 0)
      return 32;
    var result = 0;
    if ((x & 0xFFFF0000) === 0) {
      x <<= 16;
      result += 16;
    }
    ;
    if ((x & 0xFF000000) === 0) {
      x <<= 8;
      result += 8;
    }
    ;
    if ((x & 0xF0000000) === 0) {
      x <<= 4;
      result += 4;
    }
    ;
    if ((x & 0xC0000000) === 0) {
      x <<= 2;
      result += 2;
    }
    ;
    if ((x & 0x80000000) === 0) {
      x <<= 1;
      result += 1;
    }
    ;
    return result;
  }
  function imul(x, y) {
    x = toUint32(+x);
    y = toUint32(+y);
    var xh = (x >>> 16) & 0xffff;
    var xl = x & 0xffff;
    var yh = (y >>> 16) & 0xffff;
    var yl = y & 0xffff;
    return xl * yl + (((xh * yl + xl * yh) << 16) >>> 0) | 0;
  }
  function sign(x) {
    x = +x;
    if (x > 0)
      return 1;
    if (x < 0)
      return -1;
    return x;
  }
  function log10(x) {
    return log(x) * 0.434294481903251828;
  }
  function log2(x) {
    return log(x) * 1.442695040888963407;
  }
  function log1p(x) {
    x = +x;
    if (x < -1 || $isNaN(x)) {
      return NaN;
    }
    if (x === 0 || x === Infinity) {
      return x;
    }
    if (x === -1) {
      return -Infinity;
    }
    var result = 0;
    var n = 50;
    if (x < 0 || x > 1) {
      return log(1 + x);
    }
    for (var i = 1; i < n; i++) {
      if ((i % 2) === 0) {
        result -= pow(x, i) / i;
      } else {
        result += pow(x, i) / i;
      }
    }
    return result;
  }
  function expm1(x) {
    x = +x;
    if (x === -Infinity) {
      return -1;
    }
    if (!$isFinite(x) || x === 0) {
      return x;
    }
    return exp(x) - 1;
  }
  function cosh(x) {
    x = +x;
    if (x === 0) {
      return 1;
    }
    if ($isNaN(x)) {
      return NaN;
    }
    if (!$isFinite(x)) {
      return Infinity;
    }
    if (x < 0) {
      x = -x;
    }
    if (x > 21) {
      return exp(x) / 2;
    }
    return (exp(x) + exp(-x)) / 2;
  }
  function sinh(x) {
    x = +x;
    if (!$isFinite(x) || x === 0) {
      return x;
    }
    return (exp(x) - exp(-x)) / 2;
  }
  function tanh(x) {
    x = +x;
    if (x === 0)
      return x;
    if (!$isFinite(x))
      return sign(x);
    var exp1 = exp(x);
    var exp2 = exp(-x);
    return (exp1 - exp2) / (exp1 + exp2);
  }
  function acosh(x) {
    x = +x;
    if (x < 1)
      return NaN;
    if (!$isFinite(x))
      return x;
    return log(x + sqrt(x + 1) * sqrt(x - 1));
  }
  function asinh(x) {
    x = +x;
    if (x === 0 || !$isFinite(x))
      return x;
    if (x > 0)
      return log(x + sqrt(x * x + 1));
    return -log(-x + sqrt(x * x + 1));
  }
  function atanh(x) {
    x = +x;
    if (x === -1) {
      return -Infinity;
    }
    if (x === 1) {
      return Infinity;
    }
    if (x === 0) {
      return x;
    }
    if ($isNaN(x) || x < -1 || x > 1) {
      return NaN;
    }
    return 0.5 * log((1 + x) / (1 - x));
  }
  function hypot(x, y) {
    var length = arguments.length;
    var args = new Array(length);
    var max = 0;
    for (var i = 0; i < length; i++) {
      var n = arguments[i];
      n = +n;
      if (n === Infinity || n === -Infinity)
        return Infinity;
      n = abs(n);
      if (n > max)
        max = n;
      args[i] = n;
    }
    if (max === 0)
      max = 1;
    var sum = 0;
    var compensation = 0;
    for (var i = 0; i < length; i++) {
      var n = args[i] / max;
      var summand = n * n - compensation;
      var preliminary = sum + summand;
      compensation = (preliminary - sum) - summand;
      sum = preliminary;
    }
    return sqrt(sum) * max;
  }
  function trunc(x) {
    x = +x;
    if (x > 0)
      return floor(x);
    if (x < 0)
      return ceil(x);
    return x;
  }
  var fround,
      f32;
  if (typeof Float32Array === 'function') {
    f32 = new Float32Array(1);
    fround = function(x) {
      f32[0] = Number(x);
      return f32[0];
    };
  } else {
    fround = jsFround;
  }
  ;
  function cbrt(x) {
    x = +x;
    if (x === 0)
      return x;
    var negate = x < 0;
    if (negate)
      x = -x;
    var result = pow(x, 1 / 3);
    return negate ? -result : result;
  }
  function polyfillMath(global) {
    var Math = global.Math;
    maybeAddFunctions(Math, ['acosh', acosh, 'asinh', asinh, 'atanh', atanh, 'cbrt', cbrt, 'clz32', clz32, 'cosh', cosh, 'expm1', expm1, 'fround', fround, 'hypot', hypot, 'imul', imul, 'log10', log10, 'log1p', log1p, 'log2', log2, 'sign', sign, 'sinh', sinh, 'tanh', tanh, 'trunc', trunc]);
  }
  registerPolyfill(polyfillMath);
  return {
    get clz32() {
      return clz32;
    },
    get imul() {
      return imul;
    },
    get sign() {
      return sign;
    },
    get log10() {
      return log10;
    },
    get log2() {
      return log2;
    },
    get log1p() {
      return log1p;
    },
    get expm1() {
      return expm1;
    },
    get cosh() {
      return cosh;
    },
    get sinh() {
      return sinh;
    },
    get tanh() {
      return tanh;
    },
    get acosh() {
      return acosh;
    },
    get asinh() {
      return asinh;
    },
    get atanh() {
      return atanh;
    },
    get hypot() {
      return hypot;
    },
    get trunc() {
      return trunc;
    },
    get fround() {
      return fround;
    },
    get cbrt() {
      return cbrt;
    },
    get polyfillMath() {
      return polyfillMath;
    }
  };
});
System.get("traceur-runtime@0.0.87/src/runtime/polyfills/Math.js" + '');
System.registerModule("traceur-runtime@0.0.87/src/runtime/polyfills/polyfills.js", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.87/src/runtime/polyfills/polyfills.js";
  var polyfillAll = System.get("traceur-runtime@0.0.87/src/runtime/polyfills/utils.js").polyfillAll;
  polyfillAll(Reflect.global);
  var setupGlobals = $traceurRuntime.setupGlobals;
  $traceurRuntime.setupGlobals = function(global) {
    setupGlobals(global);
    polyfillAll(global);
  };
  return {};
});
System.get("traceur-runtime@0.0.87/src/runtime/polyfills/polyfills.js" + '');

/*!
 * Braintree End-to-End Encryption Library
 * https://www.braintreepayments.com
 * Copyright (c) 2009-2014 Braintree, a division of PayPal, Inc.
 *
 * JSBN
 * Copyright (c) 2005  Tom Wu
 *
 * Both Licensed under the MIT License.
 * http://opensource.org/licenses/MIT
 *
 * ASN.1 JavaScript decoder
 * Copyright (c) 2008-2009 Lapo Luchini <lapo@lapo.it>
 * Licensed under the ISC License.
 * http://opensource.org/licenses/ISC
 */
!function(){function t(e,n){e instanceof t?(this.enc=e.enc,this.pos=e.pos):(this.enc=e,this.pos=n)}function e(t,e,n,i,r){this.stream=t,this.header=e,this.length=n,this.tag=i,this.sub=r}function n(t){var e,n,i="";for(e=0;e+3<=t.length;e+=3)n=parseInt(t.substring(e,e+3),16),i+=ee.charAt(n>>6)+ee.charAt(63&n);for(e+1==t.length?(n=parseInt(t.substring(e,e+1),16),i+=ee.charAt(n<<2)):e+2==t.length&&(n=parseInt(t.substring(e,e+2),16),i+=ee.charAt(n>>2)+ee.charAt((3&n)<<4));(3&i.length)>0;)i+=ne;return i}function i(t){var e,n,i,r="",o=0;for(e=0;e<t.length&&t.charAt(e)!=ne;++e)i=ee.indexOf(t.charAt(e)),0>i||(0==o?(r+=u(i>>2),n=3&i,o=1):1==o?(r+=u(n<<2|i>>4),n=15&i,o=2):2==o?(r+=u(n),r+=u(i>>2),n=3&i,o=3):(r+=u(n<<2|i>>4),r+=u(15&i),o=0));return 1==o&&(r+=u(n<<2)),r}function r(t){var e,n=i(t),r=new Array;for(e=0;2*e<n.length;++e)r[e]=parseInt(n.substring(2*e,2*e+2),16);return r}function o(t,e,n){null!=t&&("number"==typeof t?this.fromNumber(t,e,n):null==e&&"string"!=typeof t?this.fromString(t,256):this.fromString(t,e))}function s(){return new o(null)}function a(t,e,n,i,r,o){for(;--o>=0;){var s=e*this[t++]+n[i]+r;r=Math.floor(s/67108864),n[i++]=67108863&s}return r}function c(t,e,n,i,r,o){for(var s=32767&e,a=e>>15;--o>=0;){var c=32767&this[t],h=this[t++]>>15,u=a*c+h*s;c=s*c+((32767&u)<<15)+n[i]+(1073741823&r),r=(c>>>30)+(u>>>15)+a*h+(r>>>30),n[i++]=1073741823&c}return r}function h(t,e,n,i,r,o){for(var s=16383&e,a=e>>14;--o>=0;){var c=16383&this[t],h=this[t++]>>14,u=a*c+h*s;c=s*c+((16383&u)<<14)+n[i]+r,r=(c>>28)+(u>>14)+a*h,n[i++]=268435455&c}return r}function u(t){return ce.charAt(t)}function l(t,e){var n=he[t.charCodeAt(e)];return null==n?-1:n}function p(t){for(var e=this.t-1;e>=0;--e)t[e]=this[e];t.t=this.t,t.s=this.s}function d(t){this.t=1,this.s=0>t?-1:0,t>0?this[0]=t:-1>t?this[0]=t+this.DV:this.t=0}function f(t){var e=s();return e.fromInt(t),e}function m(t,e){var n;if(16==e)n=4;else if(8==e)n=3;else if(256==e)n=8;else if(2==e)n=1;else if(32==e)n=5;else{if(4!=e)return this.fromRadix(t,e),void 0;n=2}this.t=0,this.s=0;for(var i=t.length,r=!1,s=0;--i>=0;){var a=8==n?255&t[i]:l(t,i);0>a?"-"==t.charAt(i)&&(r=!0):(r=!1,0==s?this[this.t++]=a:s+n>this.DB?(this[this.t-1]|=(a&(1<<this.DB-s)-1)<<s,this[this.t++]=a>>this.DB-s):this[this.t-1]|=a<<s,s+=n,s>=this.DB&&(s-=this.DB))}8==n&&0!=(128&t[0])&&(this.s=-1,s>0&&(this[this.t-1]|=(1<<this.DB-s)-1<<s)),this.clamp(),r&&o.ZERO.subTo(this,this)}function y(){for(var t=this.s&this.DM;this.t>0&&this[this.t-1]==t;)--this.t}function g(t){if(this.s<0)return"-"+this.negate().toString(t);var e;if(16==t)e=4;else if(8==t)e=3;else if(2==t)e=1;else if(32==t)e=5;else{if(4!=t)return this.toRadix(t);e=2}var n,i=(1<<e)-1,r=!1,o="",s=this.t,a=this.DB-s*this.DB%e;if(s-->0)for(a<this.DB&&(n=this[s]>>a)>0&&(r=!0,o=u(n));s>=0;)e>a?(n=(this[s]&(1<<a)-1)<<e-a,n|=this[--s]>>(a+=this.DB-e)):(n=this[s]>>(a-=e)&i,0>=a&&(a+=this.DB,--s)),n>0&&(r=!0),r&&(o+=u(n));return r?o:"0"}function b(){var t=s();return o.ZERO.subTo(this,t),t}function v(){return this.s<0?this.negate():this}function _(t){var e=this.s-t.s;if(0!=e)return e;var n=this.t;if(e=n-t.t,0!=e)return this.s<0?-e:e;for(;--n>=0;)if(0!=(e=this[n]-t[n]))return e;return 0}function w(t){var e,n=1;return 0!=(e=t>>>16)&&(t=e,n+=16),0!=(e=t>>8)&&(t=e,n+=8),0!=(e=t>>4)&&(t=e,n+=4),0!=(e=t>>2)&&(t=e,n+=2),0!=(e=t>>1)&&(t=e,n+=1),n}function E(){return this.t<=0?0:this.DB*(this.t-1)+w(this[this.t-1]^this.s&this.DM)}function x(t,e){var n;for(n=this.t-1;n>=0;--n)e[n+t]=this[n];for(n=t-1;n>=0;--n)e[n]=0;e.t=this.t+t,e.s=this.s}function S(t,e){for(var n=t;n<this.t;++n)e[n-t]=this[n];e.t=Math.max(this.t-t,0),e.s=this.s}function C(t,e){var n,i=t%this.DB,r=this.DB-i,o=(1<<r)-1,s=Math.floor(t/this.DB),a=this.s<<i&this.DM;for(n=this.t-1;n>=0;--n)e[n+s+1]=this[n]>>r|a,a=(this[n]&o)<<i;for(n=s-1;n>=0;--n)e[n]=0;e[s]=a,e.t=this.t+s+1,e.s=this.s,e.clamp()}function A(t,e){e.s=this.s;var n=Math.floor(t/this.DB);if(n>=this.t)return e.t=0,void 0;var i=t%this.DB,r=this.DB-i,o=(1<<i)-1;e[0]=this[n]>>i;for(var s=n+1;s<this.t;++s)e[s-n-1]|=(this[s]&o)<<r,e[s-n]=this[s]>>i;i>0&&(e[this.t-n-1]|=(this.s&o)<<r),e.t=this.t-n,e.clamp()}function T(t,e){for(var n=0,i=0,r=Math.min(t.t,this.t);r>n;)i+=this[n]-t[n],e[n++]=i&this.DM,i>>=this.DB;if(t.t<this.t){for(i-=t.s;n<this.t;)i+=this[n],e[n++]=i&this.DM,i>>=this.DB;i+=this.s}else{for(i+=this.s;n<t.t;)i-=t[n],e[n++]=i&this.DM,i>>=this.DB;i-=t.s}e.s=0>i?-1:0,-1>i?e[n++]=this.DV+i:i>0&&(e[n++]=i),e.t=n,e.clamp()}function P(t,e){var n=this.abs(),i=t.abs(),r=n.t;for(e.t=r+i.t;--r>=0;)e[r]=0;for(r=0;r<i.t;++r)e[r+n.t]=n.am(0,i[r],e,r,0,n.t);e.s=0,e.clamp(),this.s!=t.s&&o.ZERO.subTo(e,e)}function k(t){for(var e=this.abs(),n=t.t=2*e.t;--n>=0;)t[n]=0;for(n=0;n<e.t-1;++n){var i=e.am(n,e[n],t,2*n,0,1);(t[n+e.t]+=e.am(n+1,2*e[n],t,2*n+1,i,e.t-n-1))>=e.DV&&(t[n+e.t]-=e.DV,t[n+e.t+1]=1)}t.t>0&&(t[t.t-1]+=e.am(n,e[n],t,2*n,0,1)),t.s=0,t.clamp()}function U(t,e,n){var i=t.abs();if(!(i.t<=0)){var r=this.abs();if(r.t<i.t)return null!=e&&e.fromInt(0),null!=n&&this.copyTo(n),void 0;null==n&&(n=s());var a=s(),c=this.s,h=t.s,u=this.DB-w(i[i.t-1]);u>0?(i.lShiftTo(u,a),r.lShiftTo(u,n)):(i.copyTo(a),r.copyTo(n));var l=a.t,p=a[l-1];if(0!=p){var d=p*(1<<this.F1)+(l>1?a[l-2]>>this.F2:0),f=this.FV/d,m=(1<<this.F1)/d,y=1<<this.F2,g=n.t,b=g-l,v=null==e?s():e;for(a.dlShiftTo(b,v),n.compareTo(v)>=0&&(n[n.t++]=1,n.subTo(v,n)),o.ONE.dlShiftTo(l,v),v.subTo(a,a);a.t<l;)a[a.t++]=0;for(;--b>=0;){var _=n[--g]==p?this.DM:Math.floor(n[g]*f+(n[g-1]+y)*m);if((n[g]+=a.am(0,_,n,b,0,l))<_)for(a.dlShiftTo(b,v),n.subTo(v,n);n[g]<--_;)n.subTo(v,n)}null!=e&&(n.drShiftTo(l,e),c!=h&&o.ZERO.subTo(e,e)),n.t=l,n.clamp(),u>0&&n.rShiftTo(u,n),0>c&&o.ZERO.subTo(n,n)}}}function M(t){var e=s();return this.abs().divRemTo(t,null,e),this.s<0&&e.compareTo(o.ZERO)>0&&t.subTo(e,e),e}function I(t){this.m=t}function N(t){return t.s<0||t.compareTo(this.m)>=0?t.mod(this.m):t}function R(t){return t}function D(t){t.divRemTo(this.m,null,t)}function F(t,e,n){t.multiplyTo(e,n),this.reduce(n)}function O(t,e){t.squareTo(e),this.reduce(e)}function B(){if(this.t<1)return 0;var t=this[0];if(0==(1&t))return 0;var e=3&t;return e=e*(2-(15&t)*e)&15,e=e*(2-(255&t)*e)&255,e=e*(2-((65535&t)*e&65535))&65535,e=e*(2-t*e%this.DV)%this.DV,e>0?this.DV-e:-e}function L(t){this.m=t,this.mp=t.invDigit(),this.mpl=32767&this.mp,this.mph=this.mp>>15,this.um=(1<<t.DB-15)-1,this.mt2=2*t.t}function z(t){var e=s();return t.abs().dlShiftTo(this.m.t,e),e.divRemTo(this.m,null,e),t.s<0&&e.compareTo(o.ZERO)>0&&this.m.subTo(e,e),e}function j(t){var e=s();return t.copyTo(e),this.reduce(e),e}function V(t){for(;t.t<=this.mt2;)t[t.t++]=0;for(var e=0;e<this.m.t;++e){var n=32767&t[e],i=n*this.mpl+((n*this.mph+(t[e]>>15)*this.mpl&this.um)<<15)&t.DM;for(n=e+this.m.t,t[n]+=this.m.am(0,i,t,e,0,this.m.t);t[n]>=t.DV;)t[n]-=t.DV,t[++n]++}t.clamp(),t.drShiftTo(this.m.t,t),t.compareTo(this.m)>=0&&t.subTo(this.m,t)}function W(t,e){t.squareTo(e),this.reduce(e)}function q(t,e,n){t.multiplyTo(e,n),this.reduce(n)}function H(){return 0==(this.t>0?1&this[0]:this.s)}function Q(t,e){if(t>4294967295||1>t)return o.ONE;var n=s(),i=s(),r=e.convert(this),a=w(t)-1;for(r.copyTo(n);--a>=0;)if(e.sqrTo(n,i),(t&1<<a)>0)e.mulTo(i,r,n);else{var c=n;n=i,i=c}return e.revert(n)}function Y(t,e){var n;return n=256>t||e.isEven()?new I(e):new L(e),this.exp(t,n)}function Z(t,e){return new o(t,e)}function G(t,e){if(e<t.length+11)throw new Error("Message too long for RSA");for(var n=new Array,i=t.length-1;i>=0&&e>0;){var r=t.charCodeAt(i--);128>r?n[--e]=r:r>127&&2048>r?(n[--e]=63&r|128,n[--e]=r>>6|192):(n[--e]=63&r|128,n[--e]=r>>6&63|128,n[--e]=r>>12|224)}n[--e]=0;for(var s=0,a=0,c=0;e>2;)0==c&&(a=ue.random.randomWords(1,0)[0]),s=a>>c&255,c=(c+8)%32,0!=s&&(n[--e]=s);return n[--e]=2,n[--e]=0,new o(n)}function J(){this.n=null,this.e=0,this.d=null,this.p=null,this.q=null,this.dmp1=null,this.dmq1=null,this.coeff=null}function K(t,e){if(!(null!=t&&null!=e&&t.length>0&&e.length>0))throw new Error("Invalid RSA public key");this.n=Z(t,16),this.e=parseInt(e,16)}function X(t){return t.modPowInt(this.e,this.n)}function $(t){var e=G(t,this.n.bitLength()+7>>3);if(null==e)return null;var n=this.doPublic(e);if(null==n)return null;var i=n.toString(16);return 0==(1&i.length)?i:"0"+i}t.prototype.get=function(t){if(void 0==t&&(t=this.pos++),t>=this.enc.length)throw"Requesting byte offset "+t+" on a stream of length "+this.enc.length;return this.enc[t]},t.prototype.hexDigits="0123456789ABCDEF",t.prototype.hexByte=function(t){return this.hexDigits.charAt(t>>4&15)+this.hexDigits.charAt(15&t)},t.prototype.hexDump=function(t,e){for(var n="",i=t;e>i;++i)switch(n+=this.hexByte(this.get(i)),15&i){case 7:n+="  ";break;case 15:n+="\n";break;default:n+=" "}return n},t.prototype.parseStringISO=function(t,e){for(var n="",i=t;e>i;++i)n+=String.fromCharCode(this.get(i));return n},t.prototype.parseStringUTF=function(t,e){for(var n="",i=0,r=t;e>r;){var i=this.get(r++);n+=128>i?String.fromCharCode(i):i>191&&224>i?String.fromCharCode((31&i)<<6|63&this.get(r++)):String.fromCharCode((15&i)<<12|(63&this.get(r++))<<6|63&this.get(r++))}return n},t.prototype.reTime=/^((?:1[89]|2\d)?\d\d)(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])([01]\d|2[0-3])(?:([0-5]\d)(?:([0-5]\d)(?:[.,](\d{1,3}))?)?)?(Z|[-+](?:[0]\d|1[0-2])([0-5]\d)?)?$/,t.prototype.parseTime=function(t,e){var n=this.parseStringISO(t,e),i=this.reTime.exec(n);return i?(n=i[1]+"-"+i[2]+"-"+i[3]+" "+i[4],i[5]&&(n+=":"+i[5],i[6]&&(n+=":"+i[6],i[7]&&(n+="."+i[7]))),i[8]&&(n+=" UTC","Z"!=i[8]&&(n+=i[8],i[9]&&(n+=":"+i[9]))),n):"Unrecognized time: "+n},t.prototype.parseInteger=function(t,e){var n=e-t;if(n>4){n<<=3;var i=this.get(t);if(0==i)n-=8;else for(;128>i;)i<<=1,--n;return"("+n+" bit)"}for(var r=0,o=t;e>o;++o)r=r<<8|this.get(o);return r},t.prototype.parseBitString=function(t,e){var n=this.get(t),i=(e-t-1<<3)-n,r="("+i+" bit)";if(20>=i){var o=n;r+=" ";for(var s=e-1;s>t;--s){for(var a=this.get(s),c=o;8>c;++c)r+=a>>c&1?"1":"0";o=0}}return r},t.prototype.parseOctetString=function(t,e){var n=e-t,i="("+n+" byte) ";n>20&&(e=t+20);for(var r=t;e>r;++r)i+=this.hexByte(this.get(r));return n>20&&(i+=String.fromCharCode(8230)),i},t.prototype.parseOID=function(t,e){for(var n,i=0,r=0,o=t;e>o;++o){var s=this.get(o);i=i<<7|127&s,r+=7,128&s||(void 0==n?n=parseInt(i/40)+"."+i%40:n+="."+(r>=31?"bigint":i),i=r=0),n+=String.fromCharCode()}return n},e.prototype.typeName=function(){if(void 0==this.tag)return"unknown";var t=this.tag>>6,e=(this.tag>>5&1,31&this.tag);switch(t){case 0:switch(e){case 0:return"EOC";case 1:return"BOOLEAN";case 2:return"INTEGER";case 3:return"BIT_STRING";case 4:return"OCTET_STRING";case 5:return"NULL";case 6:return"OBJECT_IDENTIFIER";case 7:return"ObjectDescriptor";case 8:return"EXTERNAL";case 9:return"REAL";case 10:return"ENUMERATED";case 11:return"EMBEDDED_PDV";case 12:return"UTF8String";case 16:return"SEQUENCE";case 17:return"SET";case 18:return"NumericString";case 19:return"PrintableString";case 20:return"TeletexString";case 21:return"VideotexString";case 22:return"IA5String";case 23:return"UTCTime";case 24:return"GeneralizedTime";case 25:return"GraphicString";case 26:return"VisibleString";case 27:return"GeneralString";case 28:return"UniversalString";case 30:return"BMPString";default:return"Universal_"+e.toString(16)}case 1:return"Application_"+e.toString(16);case 2:return"["+e+"]";case 3:return"Private_"+e.toString(16)}},e.prototype.content=function(){if(void 0==this.tag)return null;var t=this.tag>>6;if(0!=t)return null==this.sub?null:"("+this.sub.length+")";var e=31&this.tag,n=this.posContent(),i=Math.abs(this.length);switch(e){case 1:return 0==this.stream.get(n)?"false":"true";case 2:return this.stream.parseInteger(n,n+i);case 3:return this.sub?"("+this.sub.length+" elem)":this.stream.parseBitString(n,n+i);case 4:return this.sub?"("+this.sub.length+" elem)":this.stream.parseOctetString(n,n+i);case 6:return this.stream.parseOID(n,n+i);case 16:case 17:return"("+this.sub.length+" elem)";case 12:return this.stream.parseStringUTF(n,n+i);case 18:case 19:case 20:case 21:case 22:case 26:return this.stream.parseStringISO(n,n+i);case 23:case 24:return this.stream.parseTime(n,n+i)}return null},e.prototype.toString=function(){return this.typeName()+"@"+this.stream.pos+"[header:"+this.header+",length:"+this.length+",sub:"+(null==this.sub?"null":this.sub.length)+"]"},e.prototype.print=function(t){if(void 0==t&&(t=""),document.writeln(t+this),null!=this.sub){t+="  ";for(var e=0,n=this.sub.length;n>e;++e)this.sub[e].print(t)}},e.prototype.toPrettyString=function(t){void 0==t&&(t="");var e=t+this.typeName()+" @"+this.stream.pos;if(this.length>=0&&(e+="+"),e+=this.length,32&this.tag?e+=" (constructed)":3!=this.tag&&4!=this.tag||null==this.sub||(e+=" (encapsulates)"),e+="\n",null!=this.sub){t+="  ";for(var n=0,i=this.sub.length;i>n;++n)e+=this.sub[n].toPrettyString(t)}return e},e.prototype.posStart=function(){return this.stream.pos},e.prototype.posContent=function(){return this.stream.pos+this.header},e.prototype.posEnd=function(){return this.stream.pos+this.header+Math.abs(this.length)},e.decodeLength=function(t){var e=t.get(),n=127&e;if(n==e)return n;if(n>3)throw"Length over 24 bits not supported at position "+(t.pos-1);if(0==n)return-1;e=0;for(var i=0;n>i;++i)e=e<<8|t.get();return e},e.hasContent=function(n,i,r){if(32&n)return!0;if(3>n||n>4)return!1;var o=new t(r);3==n&&o.get();var s=o.get();if(s>>6&1)return!1;try{var a=e.decodeLength(o);return o.pos-r.pos+a==i}catch(c){return!1}},e.decode=function(n){n instanceof t||(n=new t(n,0));var i=new t(n),r=n.get(),o=e.decodeLength(n),s=n.pos-i.pos,a=null;if(e.hasContent(r,o,n)){var c=n.pos;if(3==r&&n.get(),a=[],o>=0){for(var h=c+o;n.pos<h;)a[a.length]=e.decode(n);if(n.pos!=h)throw"Content size is not correct for container starting at offset "+c}else try{for(;;){var u=e.decode(n);if(0==u.tag)break;a[a.length]=u}o=c-n.pos}catch(l){throw"Exception while decoding undefined length content: "+l}}else n.pos+=o;return new e(i,s,o,r,a)};var te,ee="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",ne="=",ie=0xdeadbeefcafe,re=15715070==(16777215&ie);re&&"Microsoft Internet Explorer"==navigator.appName?(o.prototype.am=c,te=30):re&&"Netscape"!=navigator.appName?(o.prototype.am=a,te=26):(o.prototype.am=h,te=28),o.prototype.DB=te,o.prototype.DM=(1<<te)-1,o.prototype.DV=1<<te;var oe=52;o.prototype.FV=Math.pow(2,oe),o.prototype.F1=oe-te,o.prototype.F2=2*te-oe;var se,ae,ce="0123456789abcdefghijklmnopqrstuvwxyz",he=new Array;for(se="0".charCodeAt(0),ae=0;9>=ae;++ae)he[se++]=ae;for(se="a".charCodeAt(0),ae=10;36>ae;++ae)he[se++]=ae;for(se="A".charCodeAt(0),ae=10;36>ae;++ae)he[se++]=ae;I.prototype.convert=N,I.prototype.revert=R,I.prototype.reduce=D,I.prototype.mulTo=F,I.prototype.sqrTo=O,L.prototype.convert=z,L.prototype.revert=j,L.prototype.reduce=V,L.prototype.mulTo=q,L.prototype.sqrTo=W,o.prototype.copyTo=p,o.prototype.fromInt=d,o.prototype.fromString=m,o.prototype.clamp=y,o.prototype.dlShiftTo=x,o.prototype.drShiftTo=S,o.prototype.lShiftTo=C,o.prototype.rShiftTo=A,o.prototype.subTo=T,o.prototype.multiplyTo=P,o.prototype.squareTo=k,o.prototype.divRemTo=U,o.prototype.invDigit=B,o.prototype.isEven=H,o.prototype.exp=Q,o.prototype.toString=g,o.prototype.negate=b,o.prototype.abs=v,o.prototype.compareTo=_,o.prototype.bitLength=E,o.prototype.mod=M,o.prototype.modPowInt=Y,o.ZERO=f(0),o.ONE=f(1),J.prototype.doPublic=X,J.prototype.setPublic=K,J.prototype.encrypt=$;var ue={cipher:{},hash:{},keyexchange:{},mode:{},misc:{},codec:{},exception:{corrupt:function(t){this.toString=function(){return"CORRUPT: "+this.message},this.message=t},invalid:function(t){this.toString=function(){return"INVALID: "+this.message},this.message=t},bug:function(t){this.toString=function(){return"BUG: "+this.message},this.message=t},notReady:function(t){this.toString=function(){return"NOT READY: "+this.message},this.message=t}}};"undefined"!=typeof module&&module.exports&&(module.exports=ue),ue.cipher.aes=function(t){this._tables[0][0][0]||this._precompute();var e,n,i,r,o,s=this._tables[0][4],a=this._tables[1],c=t.length,h=1;if(4!==c&&6!==c&&8!==c)throw new ue.exception.invalid("invalid aes key size");for(this._key=[r=t.slice(0),o=[]],e=c;4*c+28>e;e++)i=r[e-1],(e%c===0||8===c&&e%c===4)&&(i=s[i>>>24]<<24^s[i>>16&255]<<16^s[i>>8&255]<<8^s[255&i],e%c===0&&(i=i<<8^i>>>24^h<<24,h=h<<1^283*(h>>7))),r[e]=r[e-c]^i;for(n=0;e;n++,e--)i=r[3&n?e:e-4],o[n]=4>=e||4>n?i:a[0][s[i>>>24]]^a[1][s[i>>16&255]]^a[2][s[i>>8&255]]^a[3][s[255&i]]},ue.cipher.aes.prototype={encrypt:function(t){return this._crypt(t,0)},decrypt:function(t){return this._crypt(t,1)},_tables:[[[],[],[],[],[]],[[],[],[],[],[]]],_precompute:function(){var t,e,n,i,r,o,s,a,c,h=this._tables[0],u=this._tables[1],l=h[4],p=u[4],d=[],f=[];for(t=0;256>t;t++)f[(d[t]=t<<1^283*(t>>7))^t]=t;for(e=n=0;!l[e];e^=i||1,n=f[n]||1)for(s=n^n<<1^n<<2^n<<3^n<<4,s=s>>8^255&s^99,l[e]=s,p[s]=e,o=d[r=d[i=d[e]]],c=16843009*o^65537*r^257*i^16843008*e,a=257*d[s]^16843008*s,t=0;4>t;t++)h[t][e]=a=a<<24^a>>>8,u[t][s]=c=c<<24^c>>>8;for(t=0;5>t;t++)h[t]=h[t].slice(0),u[t]=u[t].slice(0)},_crypt:function(t,e){if(4!==t.length)throw new ue.exception.invalid("invalid aes block size");var n,i,r,o,s=this._key[e],a=t[0]^s[0],c=t[e?3:1]^s[1],h=t[2]^s[2],u=t[e?1:3]^s[3],l=s.length/4-2,p=4,d=[0,0,0,0],f=this._tables[e],m=f[0],y=f[1],g=f[2],b=f[3],v=f[4];for(o=0;l>o;o++)n=m[a>>>24]^y[c>>16&255]^g[h>>8&255]^b[255&u]^s[p],i=m[c>>>24]^y[h>>16&255]^g[u>>8&255]^b[255&a]^s[p+1],r=m[h>>>24]^y[u>>16&255]^g[a>>8&255]^b[255&c]^s[p+2],u=m[u>>>24]^y[a>>16&255]^g[c>>8&255]^b[255&h]^s[p+3],p+=4,a=n,c=i,h=r;for(o=0;4>o;o++)d[e?3&-o:o]=v[a>>>24]<<24^v[c>>16&255]<<16^v[h>>8&255]<<8^v[255&u]^s[p++],n=a,a=c,c=h,h=u,u=n;return d}},ue.bitArray={bitSlice:function(t,e,n){return t=ue.bitArray._shiftRight(t.slice(e/32),32-(31&e)).slice(1),void 0===n?t:ue.bitArray.clamp(t,n-e)},extract:function(t,e,n){var i,r=Math.floor(-e-n&31);return i=-32&(e+n-1^e)?t[e/32|0]<<32-r^t[e/32+1|0]>>>r:t[e/32|0]>>>r,i&(1<<n)-1},concat:function(t,e){if(0===t.length||0===e.length)return t.concat(e);var n=t[t.length-1],i=ue.bitArray.getPartial(n);return 32===i?t.concat(e):ue.bitArray._shiftRight(e,i,0|n,t.slice(0,t.length-1))},bitLength:function(t){var e,n=t.length;return 0===n?0:(e=t[n-1],32*(n-1)+ue.bitArray.getPartial(e))},clamp:function(t,e){if(32*t.length<e)return t;t=t.slice(0,Math.ceil(e/32));var n=t.length;return e=31&e,n>0&&e&&(t[n-1]=ue.bitArray.partial(e,t[n-1]&2147483648>>e-1,1)),t},partial:function(t,e,n){return 32===t?e:(n?0|e:e<<32-t)+1099511627776*t},getPartial:function(t){return Math.round(t/1099511627776)||32},equal:function(t,e){if(ue.bitArray.bitLength(t)!==ue.bitArray.bitLength(e))return!1;var n,i=0;for(n=0;n<t.length;n++)i|=t[n]^e[n];return 0===i},_shiftRight:function(t,e,n,i){var r,o,s=0;for(void 0===i&&(i=[]);e>=32;e-=32)i.push(n),n=0;if(0===e)return i.concat(t);for(r=0;r<t.length;r++)i.push(n|t[r]>>>e),n=t[r]<<32-e;return s=t.length?t[t.length-1]:0,o=ue.bitArray.getPartial(s),i.push(ue.bitArray.partial(e+o&31,e+o>32?n:i.pop(),1)),i},_xor4:function(t,e){return[t[0]^e[0],t[1]^e[1],t[2]^e[2],t[3]^e[3]]}},ue.codec.hex={fromBits:function(t){var e,n="";for(e=0;e<t.length;e++)n+=((0|t[e])+0xf00000000000).toString(16).substr(4);return n.substr(0,ue.bitArray.bitLength(t)/4)},toBits:function(t){var e,n,i=[];for(t=t.replace(/\s|0x/g,""),n=t.length,t+="00000000",e=0;e<t.length;e+=8)i.push(0^parseInt(t.substr(e,8),16));return ue.bitArray.clamp(i,4*n)}},ue.codec.utf8String={fromBits:function(t){var e,n,i="",r=ue.bitArray.bitLength(t);for(e=0;r/8>e;e++)0===(3&e)&&(n=t[e/4]),i+=String.fromCharCode(n>>>24),n<<=8;return decodeURIComponent(escape(i))},toBits:function(t){t=unescape(encodeURIComponent(t));var e,n=[],i=0;for(e=0;e<t.length;e++)i=i<<8|t.charCodeAt(e),3===(3&e)&&(n.push(i),i=0);return 3&e&&n.push(ue.bitArray.partial(8*(3&e),i)),n}},ue.codec.base64={_chars:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",fromBits:function(t,e,n){var i,r="",o=0,s=ue.codec.base64._chars,a=0,c=ue.bitArray.bitLength(t);for(n&&(s=s.substr(0,62)+"-_"),i=0;6*r.length<c;)r+=s.charAt((a^t[i]>>>o)>>>26),6>o?(a=t[i]<<6-o,o+=26,i++):(a<<=6,o-=6);for(;3&r.length&&!e;)r+="=";return r},toBits:function(t,e){t=t.replace(/\s|=/g,"");var n,i,r=[],o=0,s=ue.codec.base64._chars,a=0;for(e&&(s=s.substr(0,62)+"-_"),n=0;n<t.length;n++){if(i=s.indexOf(t.charAt(n)),0>i)throw new ue.exception.invalid("this isn't base64!");o>26?(o-=26,r.push(a^i>>>o),a=i<<32-o):(o+=6,a^=i<<32-o)}return 56&o&&r.push(ue.bitArray.partial(56&o,a,1)),r}},ue.codec.base64url={fromBits:function(t){return ue.codec.base64.fromBits(t,1,1)},toBits:function(t){return ue.codec.base64.toBits(t,1)}},void 0===ue.beware&&(ue.beware={}),ue.beware["CBC mode is dangerous because it doesn't protect message integrity."]=function(){ue.mode.cbc={name:"cbc",encrypt:function(t,e,n,i){if(i&&i.length)throw new ue.exception.invalid("cbc can't authenticate data");if(128!==ue.bitArray.bitLength(n))throw new ue.exception.invalid("cbc iv must be 128 bits");var r,o=ue.bitArray,s=o._xor4,a=o.bitLength(e),c=0,h=[];if(7&a)throw new ue.exception.invalid("pkcs#5 padding only works for multiples of a byte");for(r=0;a>=c+128;r+=4,c+=128)n=t.encrypt(s(n,e.slice(r,r+4))),h.splice(r,0,n[0],n[1],n[2],n[3]);return a=16843009*(16-(a>>3&15)),n=t.encrypt(s(n,o.concat(e,[a,a,a,a]).slice(r,r+4))),h.splice(r,0,n[0],n[1],n[2],n[3]),h},decrypt:function(t,e,n,i){if(i&&i.length)throw new ue.exception.invalid("cbc can't authenticate data");if(128!==ue.bitArray.bitLength(n))throw new ue.exception.invalid("cbc iv must be 128 bits");if(127&ue.bitArray.bitLength(e)||!e.length)throw new ue.exception.corrupt("cbc ciphertext must be a positive multiple of the block size");var r,o,s,a=ue.bitArray,c=a._xor4,h=[];for(i=i||[],r=0;r<e.length;r+=4)o=e.slice(r,r+4),s=c(n,t.decrypt(o)),h.splice(r,0,s[0],s[1],s[2],s[3]),n=o;if(o=255&h[r-1],0==o||o>16)throw new ue.exception.corrupt("pkcs#5 padding corrupt");if(s=16843009*o,!a.equal(a.bitSlice([s,s,s,s],0,8*o),a.bitSlice(h,32*h.length-8*o,32*h.length)))throw new ue.exception.corrupt("pkcs#5 padding corrupt");return a.bitSlice(h,0,32*h.length-8*o)}}},ue.misc.hmac=function(t,e){this._hash=e=e||ue.hash.sha256;var n,i=[[],[]],r=e.prototype.blockSize/32;for(this._baseHash=[new e,new e],t.length>r&&(t=e.hash(t)),n=0;r>n;n++)i[0][n]=909522486^t[n],i[1][n]=1549556828^t[n];this._baseHash[0].update(i[0]),this._baseHash[1].update(i[1])},ue.misc.hmac.prototype.encrypt=ue.misc.hmac.prototype.mac=function(t,e){var n=new this._hash(this._baseHash[0]).update(t,e).finalize();return new this._hash(this._baseHash[1]).update(n).finalize()},ue.hash.sha256=function(t){this._key[0]||this._precompute(),t?(this._h=t._h.slice(0),this._buffer=t._buffer.slice(0),this._length=t._length):this.reset()},ue.hash.sha256.hash=function(t){return(new ue.hash.sha256).update(t).finalize()},ue.hash.sha256.prototype={blockSize:512,reset:function(){return this._h=this._init.slice(0),this._buffer=[],this._length=0,this},update:function(t){"string"==typeof t&&(t=ue.codec.utf8String.toBits(t));var e,n=this._buffer=ue.bitArray.concat(this._buffer,t),i=this._length,r=this._length=i+ue.bitArray.bitLength(t);for(e=512+i&-512;r>=e;e+=512)this._block(n.splice(0,16));return this},finalize:function(){var t,e=this._buffer,n=this._h;for(e=ue.bitArray.concat(e,[ue.bitArray.partial(1,1)]),t=e.length+2;15&t;t++)e.push(0);for(e.push(Math.floor(this._length/4294967296)),e.push(0|this._length);e.length;)this._block(e.splice(0,16));return this.reset(),n},_init:[],_key:[],_precompute:function(){function t(t){return 4294967296*(t-Math.floor(t))|0}var e,n=0,i=2;t:for(;64>n;i++){for(e=2;i>=e*e;e++)if(i%e===0)continue t;8>n&&(this._init[n]=t(Math.pow(i,.5))),this._key[n]=t(Math.pow(i,1/3)),n++}},_block:function(t){var e,n,i,r,o=t.slice(0),s=this._h,a=this._key,c=s[0],h=s[1],u=s[2],l=s[3],p=s[4],d=s[5],f=s[6],m=s[7];for(e=0;64>e;e++)16>e?n=o[e]:(i=o[e+1&15],r=o[e+14&15],n=o[15&e]=(i>>>7^i>>>18^i>>>3^i<<25^i<<14)+(r>>>17^r>>>19^r>>>10^r<<15^r<<13)+o[15&e]+o[e+9&15]|0),n=n+m+(p>>>6^p>>>11^p>>>25^p<<26^p<<21^p<<7)+(f^p&(d^f))+a[e],m=f,f=d,d=p,p=l+n|0,l=u,u=h,h=c,c=n+(h&u^l&(h^u))+(h>>>2^h>>>13^h>>>22^h<<30^h<<19^h<<10)|0;s[0]=s[0]+c|0,s[1]=s[1]+h|0,s[2]=s[2]+u|0,s[3]=s[3]+l|0,s[4]=s[4]+p|0,s[5]=s[5]+d|0,s[6]=s[6]+f|0,s[7]=s[7]+m|0}},ue.random={randomWords:function(t,e){var n,i,r=[],o=this.isReady(e);if(o===this._NOT_READY)throw new ue.exception.notReady("generator isn't seeded");for(o&this._REQUIRES_RESEED&&this._reseedFromPools(!(o&this._READY)),n=0;t>n;n+=4)(n+1)%this._MAX_WORDS_PER_BURST===0&&this._gate(),i=this._gen4words(),r.push(i[0],i[1],i[2],i[3]);return this._gate(),r.slice(0,t)},setDefaultParanoia:function(t){this._defaultParanoia=t},addEntropy:function(t,e,n){n=n||"user";var i,r,o,s=(new Date).valueOf(),a=this._robins[n],c=this.isReady(),h=0;switch(i=this._collectorIds[n],void 0===i&&(i=this._collectorIds[n]=this._collectorIdNext++),void 0===a&&(a=this._robins[n]=0),this._robins[n]=(this._robins[n]+1)%this._pools.length,typeof t){case"number":void 0===e&&(e=1),this._pools[a].update([i,this._eventId++,1,e,s,1,0|t]);break;case"object":var u=Object.prototype.toString.call(t);if("[object Uint32Array]"===u){for(o=[],r=0;r<t.length;r++)o.push(t[r]);t=o}else for("[object Array]"!==u&&(h=1),r=0;r<t.length&&!h;r++)"number"!=typeof t[r]&&(h=1);if(!h){if(void 0===e)for(e=0,r=0;r<t.length;r++)for(o=t[r];o>0;)e++,o>>>=1;this._pools[a].update([i,this._eventId++,2,e,s,t.length].concat(t))}break;case"string":void 0===e&&(e=t.length),this._pools[a].update([i,this._eventId++,3,e,s,t.length]),this._pools[a].update(t);break;default:h=1}if(h)throw new ue.exception.bug("random: addEntropy only supports number, array of numbers or string");this._poolEntropy[a]+=e,this._poolStrength+=e,c===this._NOT_READY&&(this.isReady()!==this._NOT_READY&&this._fireEvent("seeded",Math.max(this._strength,this._poolStrength)),this._fireEvent("progress",this.getProgress()))},isReady:function(t){var e=this._PARANOIA_LEVELS[void 0!==t?t:this._defaultParanoia];return this._strength&&this._strength>=e?this._poolEntropy[0]>this._BITS_PER_RESEED&&(new Date).valueOf()>this._nextReseed?this._REQUIRES_RESEED|this._READY:this._READY:this._poolStrength>=e?this._REQUIRES_RESEED|this._NOT_READY:this._NOT_READY},getProgress:function(t){var e=this._PARANOIA_LEVELS[t?t:this._defaultParanoia];return this._strength>=e?1:this._poolStrength>e?1:this._poolStrength/e},startCollectors:function(){if(!this._collectorsStarted){if(window.addEventListener)window.addEventListener("load",this._loadTimeCollector,!1),window.addEventListener("mousemove",this._mouseCollector,!1);else{if(!document.attachEvent)throw new ue.exception.bug("can't attach event");document.attachEvent("onload",this._loadTimeCollector),document.attachEvent("onmousemove",this._mouseCollector)}this._collectorsStarted=!0}},stopCollectors:function(){this._collectorsStarted&&(window.removeEventListener?(window.removeEventListener("load",this._loadTimeCollector,!1),window.removeEventListener("mousemove",this._mouseCollector,!1)):window.detachEvent&&(window.detachEvent("onload",this._loadTimeCollector),window.detachEvent("onmousemove",this._mouseCollector)),this._collectorsStarted=!1)},addEventListener:function(t,e){this._callbacks[t][this._callbackI++]=e},removeEventListener:function(t,e){var n,i,r=this._callbacks[t],o=[];for(i in r)r.hasOwnProperty(i)&&r[i]===e&&o.push(i);for(n=0;n<o.length;n++)i=o[n],delete r[i]},_pools:[new ue.hash.sha256],_poolEntropy:[0],_reseedCount:0,_robins:{},_eventId:0,_collectorIds:{},_collectorIdNext:0,_strength:0,_poolStrength:0,_nextReseed:0,_key:[0,0,0,0,0,0,0,0],_counter:[0,0,0,0],_cipher:void 0,_defaultParanoia:6,_collectorsStarted:!1,_callbacks:{progress:{},seeded:{}},_callbackI:0,_NOT_READY:0,_READY:1,_REQUIRES_RESEED:2,_MAX_WORDS_PER_BURST:65536,_PARANOIA_LEVELS:[0,48,64,96,128,192,256,384,512,768,1024],_MILLISECONDS_PER_RESEED:3e4,_BITS_PER_RESEED:80,_gen4words:function(){for(var t=0;4>t&&(this._counter[t]=this._counter[t]+1|0,!this._counter[t]);t++);return this._cipher.encrypt(this._counter)},_gate:function(){this._key=this._gen4words().concat(this._gen4words()),this._cipher=new ue.cipher.aes(this._key)},_reseed:function(t){this._key=ue.hash.sha256.hash(this._key.concat(t)),this._cipher=new ue.cipher.aes(this._key);for(var e=0;4>e&&(this._counter[e]=this._counter[e]+1|0,!this._counter[e]);e++);},_reseedFromPools:function(t){var e,n=[],i=0;for(this._nextReseed=n[0]=(new Date).valueOf()+this._MILLISECONDS_PER_RESEED,e=0;16>e;e++)n.push(4294967296*Math.random()|0);for(e=0;e<this._pools.length&&(n=n.concat(this._pools[e].finalize()),i+=this._poolEntropy[e],this._poolEntropy[e]=0,t||!(this._reseedCount&1<<e));e++);this._reseedCount>=1<<this._pools.length&&(this._pools.push(new ue.hash.sha256),this._poolEntropy.push(0)),this._poolStrength-=i,i>this._strength&&(this._strength=i),this._reseedCount++,this._reseed(n)},_mouseCollector:function(t){var e=t.x||t.clientX||t.offsetX||0,n=t.y||t.clientY||t.offsetY||0;ue.random.addEntropy([e,n],2,"mouse")},_loadTimeCollector:function(){ue.random.addEntropy((new Date).valueOf(),2,"loadtime")},_fireEvent:function(t,e){var n,i=ue.random._callbacks[t],r=[];for(n in i)i.hasOwnProperty(n)&&r.push(i[n]);for(n=0;n<r.length;n++)r[n](e)}},function(){try{var t=new Uint32Array(32);crypto.getRandomValues(t),ue.random.addEntropy(t,1024,"crypto.getRandomValues")}catch(e){}}(),function(){for(var t in ue.beware)ue.beware.hasOwnProperty(t)&&ue.beware[t]()}();var le={sjcl:ue,version:"1.3.10"};le.generateAesKey=function(){return{key:ue.random.randomWords(8,0),encrypt:function(t){return this.encryptWithIv(t,ue.random.randomWords(4,0))},encryptWithIv:function(t,e){var n=new ue.cipher.aes(this.key),i=ue.codec.utf8String.toBits(t),r=ue.mode.cbc.encrypt(n,i,e),o=ue.bitArray.concat(e,r);return ue.codec.base64.fromBits(o)}}},le.create=function(t){return new le.EncryptionClient(t)},le.EncryptionClient=function(t){var i=this,o=[];i.publicKey=t,i.version=le.version;var s=function(t,e){var n,i,r;n=document.createElement(t);for(i in e)e.hasOwnProperty(i)&&(r=e[i],n.setAttribute(i,r));return n},a=function(t){return window.jQuery&&t instanceof jQuery?t[0]:t.nodeType&&1===t.nodeType?t:document.getElementById(t)},c=function(t){var e,n,i,r,o=[];if("INTEGER"===t.typeName()&&(e=t.posContent(),n=t.posEnd(),i=t.stream.hexDump(e,n).replace(/[ \n]/g,""),o.push(i)),null!==t.sub)for(r=0;r<t.sub.length;r++)o=o.concat(c(t.sub[r]));return o},h=function(t){var e,n,i=[],r=t.children;for(n=0;n<r.length;n++)e=r[n],1===e.nodeType&&e.attributes["data-encrypted-name"]?i.push(e):e.children&&e.children.length>0&&(i=i.concat(h(e)));return i},u=function(){var n,i,o,s,a,h;try{a=r(t),n=e.decode(a)}catch(u){throw"Invalid encryption key. Please use the key labeled 'Client-Side Encryption Key'"}if(o=c(n),2!==o.length)throw"Invalid encryption key. Please use the key labeled 'Client-Side Encryption Key'";return s=o[0],i=o[1],h=new J,h.setPublic(s,i),h},l=function(){return{key:ue.random.randomWords(8,0),sign:function(t){var e=new ue.misc.hmac(this.key,ue.hash.sha256),n=e.encrypt(t);return ue.codec.base64.fromBits(n)}}};i.encrypt=function(t){var e=u(),r=le.generateAesKey(),o=l(),s=r.encrypt(t),a=o.sign(ue.codec.base64.toBits(s)),c=ue.bitArray.concat(r.key,o.key),h=ue.codec.base64.fromBits(c),p=e.encrypt(h),d="$bt4|javascript_"+i.version.replace(/\./g,"_")+"$",f=null;return p&&(f=n(p)),d+f+"$"+s+"$"+a},i.encryptForm=function(t){var e,n,r,c,u,l;for(t=a(t),l=h(t);o.length>0;){try{t.removeChild(o[0])}catch(p){}o.splice(0,1)}for(u=0;u<l.length;u++)e=l[u],r=e.getAttribute("data-encrypted-name"),n=i.encrypt(e.value),e.removeAttribute("name"),c=s("input",{value:n,type:"hidden",name:r}),o.push(c),t.appendChild(c)},i.onSubmitEncryptForm=function(t,e){var n;t=a(t),n=function(n){return i.encryptForm(t),e?e(n):n},window.jQuery?window.jQuery(t).submit(n):t.addEventListener?t.addEventListener("submit",n,!1):t.attachEvent&&t.attachEvent("onsubmit",n)},i.formEncrypter={encryptForm:i.encryptForm,extractForm:a,onSubmitEncryptForm:i.onSubmitEncryptForm},ue.random.startCollectors()
},window.Braintree=le}(),!function(t){if("object"==typeof exports)module.exports=t();else if("function"==typeof define&&define.amd)define(t);else{var e;"undefined"!=typeof window?e=window:"undefined"!=typeof global?e=global:"undefined"!=typeof self&&(e=self),e.braintree=t()}}(function(){return function t(e,n,i){function r(s,a){if(!n[s]){if(!e[s]){var c="function"==typeof require&&require;if(!a&&c)return c(s,!0);if(o)return o(s,!0);throw new Error("Cannot find module '"+s+"'")}var h=n[s]={exports:{}};e[s][0].call(h.exports,function(t){var n=e[s][1][t];return r(n?n:t)},h,h.exports,t,e,n,i)}return n[s].exports}for(var o="function"==typeof require&&require,s=0;s<i.length;s++)r(i[s]);return r}({1:[function(t,e){e.exports=t("./src/base.js")},{"./src/base.js":120}],2:[function(t,e){"use strict";function n(t,e){return t.status>=400?[t,null]:[null,e(t)]}function i(t){var e;this.attrs={},t.hasOwnProperty("sharedCustomerIdentifier")&&(this.attrs.sharedCustomerIdentifier=t.sharedCustomerIdentifier),e=s(t.clientToken),this.driver=t.driver||a,this.authUrl=e.authUrl,this.analyticsUrl=e.analytics?e.analytics.url:void 0,this.clientApiUrl=e.clientApiUrl,this.customerId=t.customerId,this.challenges=e.challenges,this.integration=t.integration||"",this.braintreeLibraryVersion=o=t.version||"",this.attrs.authorizationFingerprint=e.authorizationFingerprint,this.attrs.sharedCustomerIdentifierType=t.sharedCustomerIdentifierType,this.timeoutWatchers=[],this.requestTimeout=t.hasOwnProperty("timeout")?t.timeout:6e4}function r(t,e){var n,i={};for(n in t)t.hasOwnProperty(n)&&(i[n]=t[n]);for(n in e)e.hasOwnProperty(n)&&(i[n]=e[n]);return i}var o,s=t("./parse-client-token"),a=t("./jsonp-driver"),c=t("./util"),h=t("./sepa-mandate"),u=t("./sepa-bank-account"),l=t("./credit-card");i.prototype.requestWithTimeout=function(t,e,i,r,s){var a,c=this;e.braintreeLibraryVersion="braintree/web/"+o,e._meta={integration:this.integration},a=r(t,e,function(t,e){if(c.timeoutWatchers[e]){clearTimeout(c.timeoutWatchers[e]);var r=n(t,function(t){return i(t)});s.apply(null,r)}}),c.requestTimeout>0?this.timeoutWatchers[a]=setTimeout(function(){c.timeoutWatchers[a]=null,s.apply(null,[{errors:"Unknown error"},null])},c.requestTimeout):s.apply(null,[{errors:"Unknown error"},null])},i.prototype.post=function(t,e,n,i){this.requestWithTimeout(t,e,n,this.driver.post,i)},i.prototype.get=function(t,e,n,i){this.requestWithTimeout(t,e,n,this.driver.get,i)},i.prototype.put=function(t,e,n,i){this.requestWithTimeout(t,e,n,this.driver.put,i)},i.prototype.getCreditCards=function(t){this.get(c.joinUrlFragments([this.clientApiUrl,"v1","payment_methods"]),this.attrs,function(t){var e=0,n=t.paymentMethods.length,i=[];for(e;n>e;e++)i.push(new l(t.paymentMethods[e]));return i},t)},i.prototype.tokenizeCard=function(t,e){t.options={validate:!1},this.addCreditCard(t,function(t,n){n&&n.nonce?e(t,n.nonce):e("Unable to tokenize card.",null)})},i.prototype.addSEPAMandate=function(t,e){var n=r(this.attrs,{sepaMandate:t});this.post(c.joinUrlFragments([this.clientApiUrl,"v1","sepa_mandates.json"]),n,function(t){return new h(t.sepaMandates[0])},e)},i.prototype.acceptSEPAMandate=function(t,e){this.put(c.joinUrlFragments([this.clientApiUrl,"v1","sepa_mandates",t,"accept"]),this.attrs,function(t){return new u(t.sepaBankAccounts[0])},e)},i.prototype.getSEPAMandate=function(t,e){var n;n=t.paymentMethodToken?r(this.attrs,{paymentMethodToken:t.paymentMethodToken}):this.attrs,this.get(c.joinUrlFragments([this.clientApiUrl,"v1","sepa_mandates",t.mandateReferenceNumber||""]),n,function(t){return new h(t.sepaMandates[0])},e)},i.prototype.addCreditCard=function(t,e){var n=t.share;delete t.share;var i=r(this.attrs,{share:n,creditCard:t});this.post(c.joinUrlFragments([this.clientApiUrl,"v1","payment_methods/credit_cards"]),i,function(t){return new l(t.creditCards[0])},e)},i.prototype.unlockCreditCard=function(t,e,n){var i=r(this.attrs,{challengeResponses:e});this.put(c.joinUrlFragments([this.clientApiUrl,"v1","payment_methods/",t.nonce]),i,function(t){return new l(t.paymentMethods[0])},n)},i.prototype.sendAnalyticsEvents=function(t,e){var i,o,s,a=this,h=[];if(t=c.isArray(t)?t:[t],!this.analyticsUrl)return e&&e.apply(null,[null,{}]),void 0;for(var u in t)t.hasOwnProperty(u)&&h.push({kind:t[u]});i=this.analyticsUrl,o=r(this.attrs,{analytics:h}),s=this.driver.post(i,o,function(t,i){if(a.timeoutWatchers[i]){clearTimeout(a.timeoutWatchers[i]);var r=n(t,function(t){return t});e&&e.apply(null,r)}}),this.timeoutWatchers[s]=setTimeout(function(){a.timeoutWatchers[s]=null,e.apply(null,[{errors:"Unknown error"},null])},this.requestTimeout)},e.exports=i},{"./credit-card":3,"./jsonp-driver":4,"./parse-client-token":6,"./sepa-bank-account":8,"./sepa-mandate":9,"./util":10}],3:[function(t,e){"use strict";function n(t){for(var e=0;e<i.length;e++){var n=i[e];this[n]=t[n]}}var i=["billingAddress","branding","createdAt","createdAtMerchant","createdAtMerchantName","details","isLocked","lastUsedAt","lastUsedAtMerchant","lastUsedAtMerchantName","lastUsedByCurrentMerchant","nonce","securityQuestions","type"];e.exports=n},{}],4:[function(t,e){"use strict";function n(t,e,n){return o.get(t,e,n)}function i(t,e,n){return e._method="POST",o.get(t,e,n)}function r(t,e,n){return e._method="PUT",o.get(t,e,n)}var o=t("./jsonp");e.exports={get:n,post:i,put:r}},{"./jsonp":5}],5:[function(t,e){(function(n){function i(t,e){var n=document.createElement("script"),i=!1;n.src=t,n.async=!0;var r=e||l.error;"function"==typeof r&&(n.onerror=function(e){r({url:t,event:e})}),n.onload=n.onreadystatechange=function(){i||this.readyState&&"loaded"!==this.readyState&&"complete"!==this.readyState||(i=!0,n.onload=n.onreadystatechange=null,n&&n.parentNode&&n.parentNode.removeChild(n))},a||(a=document.getElementsByTagName("head")[0]),a.appendChild(n)}function r(t,e){var n,i,o,s=[];for(var o in t)t.hasOwnProperty(o)&&(i=t[o],n=e?c.isArray(t)?e+"[]":e+"["+o+"]":o,"object"==typeof i?s.push(r(i,n)):s.push(encodeURIComponent(n)+"="+encodeURIComponent(i)));return s.join("&")}function o(t,e,n,o){var s=-1===(t||"").indexOf("?")?"?":"&";o=o||l.callbackName||"callback";var a=o+"_json"+ ++h;return s+=r(e),u[a]=function(t){n(t,a);try{delete u[a]}catch(e){}u[a]=null},i(t+s+"&"+o+"="+a),a}function s(t){l=t}var a,c=t("./util"),h=0,u=n,l={};e.exports={get:o,init:s,stringify:r}}).call(this,"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{"./util":10}],6:[function(t,e){"use strict";function n(t){var e;if(!t)throw new Error("Braintree API Client Misconfigured: clientToken required.");if("object"==typeof t&&null!==t)e=t;else{try{t=window.atob(t)}catch(n){}try{e=JSON.parse(t)}catch(i){throw new Error("Braintree API Client Misconfigured: clientToken is invalid.")}}if(!e.hasOwnProperty("authUrl")||!e.hasOwnProperty("clientApiUrl"))throw new Error("Braintree API Client Misconfigured: clientToken is invalid.");return e}t("./polyfill"),e.exports=n},{"./polyfill":7}],7:[function(){(function(t){"use strict";t.atob=t.atob||function(t){var e=new RegExp("^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{4})([=]{1,2})?$"),n="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",i="";if(!e.test(t))throw new Error("Braintree API Client Misconfigured: clientToken is invalid.");var r=0;do{var o=n.indexOf(t.charAt(r++)),s=n.indexOf(t.charAt(r++)),a=n.indexOf(t.charAt(r++)),c=n.indexOf(t.charAt(r++)),h=(63&o)<<2|s>>4&3,u=(15&s)<<4|a>>2&15,l=(3&a)<<6|63&c;i+=String.fromCharCode(h)+(u?String.fromCharCode(u):"")+(l?String.fromCharCode(l):"")}while(r<t.length);return i}}).call(this,"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}],8:[function(t,e){"use strict";function n(t){for(var e=0;e<i.length;e++){var n=i[e];this[n]=t[n]}}var i=["bic","maskedIBAN","nonce","accountHolderName"];e.exports=n},{}],9:[function(t,e){"use strict";function n(t){for(var e=0;e<i.length;e++){var n=i[e];this[n]=t[n]}}var i=["accountHolderName","bic","longFormURL","mandateReferenceNumber","maskedIBAN","shortForm"];e.exports=n},{}],10:[function(t,e){"use strict";function n(t){var e,n,i=[];for(n=0;n<t.length;n++)e=t[n],"/"===e.charAt(e.length-1)&&(e=e.substring(0,e.length-1)),"/"===e.charAt(0)&&(e=e.substring(1)),i.push(e);return i.join("/")}function i(t){return t&&"object"==typeof t&&"number"==typeof t.length&&"[object Array]"===Object.prototype.toString.call(t)||!1}e.exports={joinUrlFragments:n,isArray:i}},{}],11:[function(t,e){"use strict";function n(t){return new i(t)}var i=t("./lib/client"),r=t("./lib/jsonp"),o=t("./lib/jsonp-driver"),s=t("./lib/util"),a=t("./lib/parse-client-token");e.exports={Client:i,configure:n,util:s,JSONP:r,JSONPDriver:o,parseClientToken:a}},{"./lib/client":2,"./lib/jsonp":5,"./lib/jsonp-driver":4,"./lib/parse-client-token":6,"./lib/util":10}],12:[function(t,e){e.exports=t(2)},{"./credit-card":13,"./jsonp-driver":14,"./parse-client-token":16,"./sepa-bank-account":18,"./sepa-mandate":19,"./util":20}],13:[function(t,e){e.exports=t(3)},{}],14:[function(t,e){e.exports=t(4)},{"./jsonp":15}],15:[function(t,e){e.exports=t(5)},{"./util":20}],16:[function(t,e){e.exports=t(6)},{"./polyfill":17}],17:[function(t,e){e.exports=t(7)},{}],18:[function(t,e){e.exports=t(8)},{}],19:[function(t,e){e.exports=t(9)},{}],20:[function(t,e){e.exports=t(10)},{}],21:[function(t,e){e.exports=t(11)},{"./lib/client":12,"./lib/jsonp":15,"./lib/jsonp-driver":14,"./lib/parse-client-token":16,"./lib/util":20}],22:[function(t,e){e.exports=t(2)},{"./credit-card":23,"./jsonp-driver":24,"./parse-client-token":26,"./sepa-bank-account":28,"./sepa-mandate":29,"./util":30}],23:[function(t,e){e.exports=t(3)},{}],24:[function(t,e){e.exports=t(4)},{"./jsonp":25}],25:[function(t,e){e.exports=t(5)},{"./util":30}],26:[function(t,e){e.exports=t(6)},{"./polyfill":27}],27:[function(t,e){e.exports=t(7)},{}],28:[function(t,e){e.exports=t(8)},{}],29:[function(t,e){e.exports=t(9)},{}],30:[function(t,e){e.exports=t(10)},{}],31:[function(t,e){e.exports=t(11)},{"./lib/client":22,"./lib/jsonp":25,"./lib/jsonp-driver":24,"./lib/parse-client-token":26,"./lib/util":30}],32:[function(t,e){"use strict";function n(t){this.host=t||window,this.handlers=[],i.addEventListener(this.host,"message",i.bind(this.receive,this))}var i=t("braintree-utilities");n.prototype.receive=function(t){var e,i,r,o;try{r=JSON.parse(t.data)}catch(s){return}for(o=r.type,i=new n.Message(this,t.source,r.data),e=0;e<this.handlers.length;e++)this.handlers[e].type===o&&this.handlers[e].handler(i)},n.prototype.send=function(t,e,n){t.postMessage(JSON.stringify({type:e,data:n}),"*")},n.prototype.register=function(t,e){this.handlers.push({type:t,handler:e})},n.prototype.unregister=function(t,e){for(var n=this.handlers.length-1;n>=0;n--)if(this.handlers[n].type===t&&this.handlers[n].handler===e)return this.handlers.splice(n,1)},n.Message=function(t,e,n){this.bus=t,this.source=e,this.content=n},n.Message.prototype.reply=function(t,e){this.bus.send(this.source,t,e)},e.exports=n},{"braintree-utilities":42}],33:[function(t,e){"use strict";function n(t,e){this.bus=t,this.target=e,this.handlers=[],this.bus.register("publish",i.bind(this._handleMessage,this))}var i=t("braintree-utilities");n.prototype._handleMessage=function(t){var e,n=t.content,i=this.handlers[n.channel];if("undefined"!=typeof i)for(e=0;e<i.length;e++)i[e](n.data)},n.prototype.publish=function(t,e){this.bus.send(this.target,"publish",{channel:t,data:e})},n.prototype.subscribe=function(t,e){this.handlers[t]=this.handlers[t]||[],this.handlers[t].push(e)},n.prototype.unsubscribe=function(t,e){var n,i=this.handlers[t];if("undefined"!=typeof i)for(n=0;n<i.length;n++)i[n]===e&&i.splice(n,1)},e.exports=n},{"braintree-utilities":42}],34:[function(t,e){"use strict";function n(t){this.bus=t,this.frames=[],this.handlers=[]}n.prototype.subscribe=function(t,e){this.handlers[t]=this.handlers[t]||[],this.handlers[t].push(e)},n.prototype.registerFrame=function(t){this.frames.push(t)},n.prototype.unregisterFrame=function(t){for(var e=0;e<this.frames.length;e++)this.frames[e]===t&&this.frames.splice(e,1)},n.prototype.publish=function(t,e){var n,i=this.handlers[t];if("undefined"!=typeof i)for(n=0;n<i.length;n++)i[n](e);for(n=0;n<this.frames.length;n++)this.bus.send(this.frames[n],"publish",{channel:t,data:e})},n.prototype.unsubscribe=function(t,e){var n,i=this.handlers[t];if("undefined"!=typeof i)for(n=0;n<i.length;n++)i[n]===e&&i.splice(n,1)},e.exports=n},{}],35:[function(t,e){"use strict";function n(t,e){this.bus=t,this.target=e||window.parent,this.counter=0,this.callbacks={},this.bus.register("rpc_response",i.bind(this._handleResponse,this))}var i=t("braintree-utilities");n.prototype._handleResponse=function(t){var e=t.content,n=this.callbacks[e.id];"function"==typeof n&&(n.apply(null,e.response),delete this.callbacks[e.id])},n.prototype.invoke=function(t,e,n){var i=this.counter++;this.callbacks[i]=n,this.bus.send(this.target,"rpc_request",{id:i,method:t,args:e})},e.exports=n},{"braintree-utilities":42}],36:[function(t,e){"use strict";function n(t){this.bus=t,this.methods={},this.bus.register("rpc_request",i.bind(this._handleRequest,this))}var i=t("braintree-utilities");n.prototype._handleRequest=function(t){var e,n=t.content,i=n.args||[],r=this.methods[n.method];"function"==typeof r&&(e=function(){t.reply("rpc_response",{id:n.id,response:Array.prototype.slice.call(arguments)})},i.push(e),r.apply(null,i))},n.prototype.define=function(t,e){this.methods[t]=e},e.exports=n},{"braintree-utilities":42}],37:[function(t,e){var n=t("./lib/message-bus"),i=t("./lib/pubsub-client"),r=t("./lib/pubsub-server"),o=t("./lib/rpc-client"),s=t("./lib/rpc-server");e.exports={MessageBus:n,PubsubClient:i,PubsubServer:r,RPCClient:o,RPCServer:s}},{"./lib/message-bus":32,"./lib/pubsub-client":33,"./lib/pubsub-server":34,"./lib/rpc-client":35,"./lib/rpc-server":36}],38:[function(t,e){"use strict";function n(t,e){if(e=e||"["+t+"] is not a valid DOM Element",t&&t.nodeType&&1===t.nodeType)return t;if(t&&window.jQuery&&t instanceof jQuery&&0!==t.length)return t[0];if("string"==typeof t&&document.getElementById(t))return document.getElementById(t);throw new Error(e)}e.exports={normalizeElement:n}},{}],39:[function(t,e){"use strict";function n(t,e,n){t.addEventListener?t.addEventListener(e,n,!1):t.attachEvent&&t.attachEvent("on"+e,n)}function i(t,e,n){t.removeEventListener?t.removeEventListener(e,n,!1):t.detachEvent&&t.detachEvent("on"+e,n)}e.exports={removeEventListener:i,addEventListener:n}},{}],40:[function(t,e){"use strict";function n(t){return"[object Function]"===Object.prototype.toString.call(t)}function i(t,e){return function(){t.apply(e,arguments)}}e.exports={bind:i,isFunction:n}},{}],41:[function(t,e){"use strict";function n(){return"https:"===window.location.protocol}function i(t){switch(t){case null:case void 0:return"";case!0:return"1";case!1:return"0";default:return encodeURIComponent(t)}}function r(t,e){var n,o,s=[];for(o in t)if(t.hasOwnProperty(o)){var a=t[o];n=e?e+"["+o+"]":o,"object"==typeof a?s.push(r(a,n)):void 0!==a&&null!==a&&s.push(i(n)+"="+i(a))}return s.join("&")}function o(t){for(var e={},n=t.split("&"),i=0;i<n.length;i++){var r=n[i].split("="),o=r[0],s=decodeURIComponent(r[1]);e[o]=s}return e}function s(t){var e=t.split("?");return 2!==e.length?{}:o(e[1])}e.exports={isBrowserHttps:n,makeQueryString:r,decodeQueryString:o,getParams:s}},{}],42:[function(t,e){var n=t("./lib/dom"),i=t("./lib/url"),r=t("./lib/fn"),o=t("./lib/events");e.exports={normalizeElement:n.normalizeElement,isBrowserHttps:i.isBrowserHttps,makeQueryString:i.makeQueryString,decodeQueryString:i.decodeQueryString,getParams:i.getParams,removeEventListener:o.removeEventListener,addEventListener:o.addEventListener,bind:r.bind,isFunction:r.isFunction}},{"./lib/dom":38,"./lib/events":39,"./lib/fn":40,"./lib/url":41}],43:[function(t,e){e.exports=t(38)},{}],44:[function(t,e){e.exports=t(39)},{}],45:[function(t,e){e.exports=t(40)},{}],46:[function(t,e){e.exports=t(41)},{}],47:[function(t,e){e.exports=t(42)},{"./lib/dom":43,"./lib/events":44,"./lib/fn":45,"./lib/url":46}],48:[function(t,e){function n(t){var e=window.getComputedStyle?getComputedStyle(t):t.currentStyle;return{overflow:e.overflow||"",height:t.style.height||""}}function i(){return{html:{node:document.documentElement,styles:n(document.documentElement)},body:{node:document.body,styles:n(document.body)}}}function r(t,e){e=e||{},this.clientToken=t,this.parsedClientToken=this._parseClientToken(t),this.parsedClientToken&&e.displayName&&(this.parsedClientToken.paypalDisplayName=e.displayName),this.locale=e.locale||"en",this.singleUse=e.singleUse||!1,this.demoMode=e.demo||!1,this.integration=e.integration||"",this.container=e.container,this.merchantPageDefaultStyles=null,this.paymentMethodNonceInputField=e.paymentMethodNonceInputField,this.frame=null,this.popup=null,this.communicationFrame=null,this.windowResizeListener=a.bind(this._handleWindowResize,this),this.insertFrameFunction=e.insertFrame,this.onSuccess=e.onSuccess,this.onCancelled=e.onCancelled,this.onUnsupported=e.onUnsupported,this.rpcServer=null,this.loggedInView=null,this.loggedOutView=null,this.insertUI=!0}var o=t("braintree-api"),s=t("braintree-rpc"),a=t("braintree-utilities"),c=t("./logged_in_view"),h=t("./logged_out_view"),u=t("../shared/util/browser"),l=t("../shared/util/dom"),p=t("../shared/constants"),d=t("../shared/util/util");r.prototype.initialize=function(){return this._isPayPalEnabled()?this._hasSecureBrowserProtocol()?(this._setupDomElements(),this._setupPaymentMethodNonceInputField(),this._setupViews(),this._setupRPCServer(),void 0):("function"==typeof this.onUnsupported&&this.onUnsupported(new Error("unsupported protocol detected")),void 0):("function"==typeof this.onUnsupported&&this.onUnsupported(new Error("PayPal is not enabled")),void 0)},r.prototype._isPayPalEnabled=function(){return!(!this.parsedClientToken||!this.parsedClientToken.paypalEnabled)},r.prototype._hasSecureBrowserProtocol=function(){return/https/.test(window.location.protocol)||this.parsedClientToken.paypalAllowHttp},r.prototype._canBeInitialized=function(){return this._isPayPalEnabled()&&this._hasSecureBrowserProtocol()},r.prototype._setupDomElements=function(){this.insertUI&&(this.container=a.normalizeElement(this.container))},r.prototype._setupPaymentMethodNonceInputField=function(){if(this.insertUI){var t=this.paymentMethodNonceInputField;a.isFunction(t)||(t=void 0!==t?a.normalizeElement(t):this._createPaymentMethodNonceInputField(),this.paymentMethodNonceInputField=t)}},r.prototype._setupViews=function(){this.insertUI&&(this.loggedInView=new c({container:this.container,assetsUrl:this.parsedClientToken.assetsUrl}),this.loggedOutView=new h({assetsUrl:this.parsedClientToken.assetsUrl,container:this.container}),a.addEventListener(this.loggedOutView.buttonNode,"click",a.bind(this._handleButtonClick,this)),a.addEventListener(this.loggedInView.logoutNode,"click",a.bind(this._handleLogout,this)))},r.prototype._setupRPCServer=function(){var t=new s.MessageBus(window);this.rpcServer=new s.RPCServer(t,window),this.rpcServer.define("closePayPalModal",a.bind(this._handleCloseMessage,this)),this.rpcServer.define("receivePayPalData",a.bind(this._handleSuccessfulAuthentication,this))},r.prototype._createFrameUrl=function(){var t="";return t+=this.parsedClientToken.assetsUrl+"/pwpp/"+p.VERSION+"/html/braintree-frame.html",t+="?locale="+this.locale,t+="&singleUse="+this.singleUse,t+="&demo="+this.demoMode,t+="&displayName="+encodeURIComponent(this.parsedClientToken.paypalDisplayName),t+="&clientApiUrl="+this.parsedClientToken.clientApiUrl,t+="&analyticsUrl="+this.parsedClientToken.analyticsUrl,t+="&authUrl="+this.parsedClientToken.authUrl,t+="&authorizationFingerprint="+this.parsedClientToken.authorizationFingerprint,t+="&paypalBaseUrl="+this.parsedClientToken.paypalBaseUrl,t+="&paypalClientId="+this.parsedClientToken.paypalClientId,t+="&paypalPrivacyUrl="+this.parsedClientToken.paypalPrivacyUrl,t+="&paypalUserAgreementUrl="+this.parsedClientToken.paypalUserAgreementUrl,t+="&offline="+this.parsedClientToken.paypalEnvironmentNoNetwork,t+="&integration="+this.integration},r.prototype._createPaymentMethodNonceInputField=function(){var t=document.createElement("input");return t.name="payment_method_nonce",t.type="hidden",this.container.appendChild(t)},r.prototype._createFrame=function(){var t=this._createFrameUrl(),e=document.createElement("iframe");return e.src=t,e.id=p.FRAME_NAME,e.name=p.FRAME_NAME,e.allowTransparency=!0,e.height="100%",e.width="100%",e.frameBorder=0,e.style.position=u.isMobile()?"absolute":"fixed",e.style.top=0,e.style.left=0,e.style.bottom=0,e.style.zIndex=20001,e.style.padding=0,e.style.margin=0,e.style.border=0,e.style.outline="none",e},r.prototype._removeFrame=function(t){t=t||document.body,this.frame&&t.contains(this.frame)&&(t.removeChild(this.frame),this._unlockMerchantWindowSize())},r.prototype._insertFrame=function(){this.insertFrameFunction?this.insertFrameFunction(this._createFrameUrl()):(this.frame=this._createFrame(),document.body.appendChild(this.frame)),this._lockMerchantWindowSize()},r.prototype._handleButtonClick=function(t){t.preventDefault?t.preventDefault():t.returnValue=!1,this._open()},r.prototype._setMerchantPageDefaultStyles=function(){this.merchantPageDefaultStyles=i()},r.prototype._open=function(){u.isPopupSupported()?this._openPopup():this._openModal()},r.prototype._close=function(){u.isPopupSupported()?this._closePopup():this._closeModal()},r.prototype._openModal=function(){this._removeFrame(),this._insertFrame()},r.prototype._openPopup=function(){var t=p.POPUP_NAME,e=p.POPUP_OPTIONS;return this.popup=window.open(this._createFrameUrl(),t,e),this.popup.focus(),this.popup},r.prototype._closeModal=function(){this._removeFrame()},r.prototype._closePopup=function(){this.popup&&(this.popup.close(),this.popup=null)},r.prototype._handleSuccessfulAuthentication=function(t,e){this._close(),a.isFunction(this.paymentMethodNonceInputField)?this.paymentMethodNonceInputField(t):(this._showLoggedInContent(e),this._setNonceInputValue(t)),a.isFunction(this.onSuccess)&&this.onSuccess(t,e)},r.prototype._lockMerchantWindowSize=function(){this._setMerchantPageDefaultStyles(),document.documentElement.style.overflow="hidden",document.body.style.height="100%",document.body.style.overflow="hidden",u.isMobile()&&(window.scrollTo(0,0),this._updateMerchantWindowHeight(document.documentElement.clientHeight),a.addEventListener("resize",this.windowResizeListener))},r.prototype._unlockMerchantWindowSize=function(){this.merchantPageDefaultStyles&&(document.documentElement.style.height=this.merchantPageDefaultStyles.html.styles.height,document.documentElement.style.overflow=this.merchantPageDefaultStyles.html.styles.overflow,document.body.style.height=this.merchantPageDefaultStyles.body.styles.height,document.body.style.overflow=this.merchantPageDefaultStyles.body.styles.overflow),a.removeEventListener("resize",this.windowResizeListener)},r.prototype._handleWindowResize=function(){this._updateMerchantWindowHeight(document.documentElement.clientHeight)},r.prototype._updateMerchantWindowHeight=function(t){document.documentElement.style.height=t+"px",this.frame.style.minHeight=t+"px"},r.prototype._handleCloseMessage=function(){this._removeFrame()},r.prototype._showLoggedInContent=function(t){this.loggedOutView.hide(),l.setTextContent(this.loggedInView.emailNode,t),this.loggedInView.show()},r.prototype._handleLogout=function(t){t.preventDefault?t.preventDefault():t.returnValue=!1,this.loggedInView.hide(),this.loggedOutView.show(),this._setNonceInputValue(""),a.isFunction(this.onCancelled)&&this.onCancelled()},r.prototype._setNonceInputValue=function(t){this.paymentMethodNonceInputField.value=t},r.prototype._parseClientToken=function(t){if(!t||0===t.length)throw new Error("clientToken not provided.");var e=o.parseClientToken(t);return e.paypalEnabled?{assetsUrl:e.paypal.assetsUrl,authUrl:e.authUrl,authorizationFingerprint:encodeURIComponent(e.authorizationFingerprint),analyticsUrl:encodeURIComponent(e.analytics?e.analytics.url:void 0),clientApiUrl:encodeURIComponent(e.clientApiUrl),paypalAllowHttp:d.castToBoolean(e.paypal.allowHttp),paypalBaseUrl:e.paypal.assetsUrl,paypalClientId:e.paypal.clientId,paypalDisplayName:e.paypal.displayName,paypalEnvironmentNoNetwork:d.castToBoolean(e.paypal.environmentNoNetwork),paypalPrivacyUrl:encodeURIComponent(e.paypal.privacyUrl),paypalUserAgreementUrl:encodeURIComponent(e.paypal.userAgreementUrl),paypalEnabled:d.castToBoolean(e.paypalEnabled)}:!1},e.exports=r},{"../shared/constants":51,"../shared/util/browser":56,"../shared/util/dom":57,"../shared/util/util":58,"./logged_in_view":49,"./logged_out_view":50,"braintree-api":31,"braintree-rpc":37,"braintree-utilities":47}],49:[function(t,e){function n(t){this.options=t,this.container=this.createViewContainer(),this.createPayPalName(),this.emailNode=this.createEmailNode(),this.logoutNode=this.createLogoutNode()}var i=t("../shared/constants");n.prototype.createViewContainer=function(){var t=document.createElement("div");t.id="braintree-paypal-loggedin";var e=["display: none","max-width: 500px","overflow: hidden","padding: 16px","background-image: url("+this.options.assetsUrl+"/pwpp/"+i.VERSION+"/images/paypal-small.png)","background-image: url("+this.options.assetsUrl+"/pwpp/"+i.VERSION+"/images/paypal-small.svg), none","background-position: 20px 50%","background-repeat: no-repeat","background-size: 13px 15px","border-top: 1px solid #d1d4d6","border-bottom: 1px solid #d1d4d6"].join(";");return t.style.cssText=e,this.options.container.appendChild(t),t},n.prototype.createPayPalName=function(){var t=document.createElement("span");t.id="bt-pp-name",t.innerHTML="PayPal";var e=["color: #283036","font-size: 13px","font-weight: 800",'font-family: "Helvetica Neue", Helvetica, Arial, sans-serif',"margin-left: 36px","-webkit-font-smoothing: antialiased","-moz-font-smoothing: antialiased","-ms-font-smoothing: antialiased","font-smoothing: antialiased"].join(";");return t.style.cssText=e,this.container.appendChild(t)},n.prototype.createEmailNode=function(){var t=document.createElement("span");t.id="bt-pp-email";var e=["color: #6e787f","font-size: 13px",'font-family: "Helvetica Neue", Helvetica, Arial, sans-serif',"margin-left: 5px","-webkit-font-smoothing: antialiased","-moz-font-smoothing: antialiased","-ms-font-smoothing: antialiased","font-smoothing: antialiased"].join(";");return t.style.cssText=e,this.container.appendChild(t)},n.prototype.createLogoutNode=function(){var t=document.createElement("button");t.id="bt-pp-cancel",t.innerHTML="Cancel";var e=["color: #3d95ce","font-size: 11px",'font-family: "Helvetica Neue", Helvetica, Arial, sans-serif',"line-height: 20px","margin: 0 0 0 25px","padding: 0","background-color: transparent","border: 0","cursor: pointer","text-decoration: underline","float: right","-webkit-font-smoothing: antialiased","-moz-font-smoothing: antialiased","-ms-font-smoothing: antialiased","font-smoothing: antialiased"].join(";");return t.style.cssText=e,this.container.appendChild(t)},n.prototype.show=function(){this.container.style.display="block"},n.prototype.hide=function(){this.container.style.display="none"},e.exports=n},{"../shared/constants":51}],50:[function(t,e){function n(t){this.options=t,this.assetsUrl=this.options.assetsUrl,this.container=this.createViewContainer(),this.buttonNode=this.createPayWithPayPalButton()}var i=t("../shared/constants");n.prototype.createViewContainer=function(){var t=document.createElement("div");return t.id="braintree-paypal-loggedout",this.options.container.appendChild(t),t},n.prototype.createPayWithPayPalButton=function(){var t=document.createElement("a");t.id="braintree-paypal-button",t.href="#";var e=["display: block","width: 115px","height: 44px","overflow: hidden"].join(";");t.style.cssText=e;var n=new Image;n.src=this.assetsUrl+"/pwpp/"+i.VERSION+"/images/pay-with-paypal.png",n.setAttribute("alt","Pay with PayPal");var r=["max-width: 100%","display: block","width: 100%","height: 100%","outline: none","border: 0"].join(";");return n.style.cssText=r,t.appendChild(n),this.container.appendChild(t)},n.prototype.show=function(){this.container.style.display="block"},n.prototype.hide=function(){this.container.style.display="none"},e.exports=n},{"../shared/constants":51}],51:[function(t,e,n){var i="1.1.2";n.VERSION=i,n.POPUP_NAME="braintree_paypal_popup",n.FRAME_NAME="braintree-paypal-frame",n.POPUP_PATH="/pwpp/"+i+"/html/braintree-frame.html",n.POPUP_OPTIONS="height=470,width=410,resizable=true"},{}],52:[function(t,e){function n(){return h.matchUserAgent("Android")&&!i()}function i(){return h.matchUserAgent("Chrome")||h.matchUserAgent("CriOS")}function r(){return h.matchUserAgent("Firefox")}function o(){return h.matchUserAgent("Trident")||h.matchUserAgent("MSIE")}function s(){return h.matchUserAgent("Opera")||h.matchUserAgent("OPR")}function a(){return s()&&!!window.operamini}function c(){return h.matchUserAgent("Safari")&&!i()&&!n()}var h=t("./useragent");e.exports={isAndroid:n,isChrome:i,isFirefox:r,isIE:o,isOpera:s,isOperaMini:a,isSafari:c}},{"./useragent":55}],53:[function(t,e){function n(){return!i()&&(s.isAndroid()||s.isIpod()||s.isIphone()||o.matchUserAgent("IEMobile"))}function i(){return s.isIpad()||s.isAndroid()&&!o.matchUserAgent("Mobile")}function r(){return!n()&&!i()}var o=t("./useragent"),s=t("./platform");e.exports={isMobile:n,isTablet:i,isDesktop:r}},{"./platform":54,"./useragent":55}],54:[function(t,e){function n(){return a.matchUserAgent("Android")}function i(){return a.matchUserAgent("iPad")}function r(){return a.matchUserAgent("iPod")}function o(){return a.matchUserAgent("iPhone")&&!r()}function s(){return i()||r()||o()}var a=t("./useragent");e.exports={isAndroid:n,isIpad:i,isIpod:r,isIphone:o,isIos:s}},{"./useragent":55}],55:[function(t,e,n){function i(){return o}function r(t){var e=n.getNativeUserAgent(),i=e.match(t);return i?!0:!1}var o=window.navigator.userAgent;n.getNativeUserAgent=i,n.matchUserAgent=r},{}],56:[function(t,e){function n(){return i()&&window.outerWidth<600}function i(){return p.test(l)}function r(){return!!window.postMessage}function o(){return a.isOpera()||a.isOperaMini()?!1:h.isIos()&&a.isSafari()?!0:c.isDesktop()&&(a.isChrome()||a.isFirefox()||a.isSafari()||u.matchUserAgent(/MSIE 10\.0/))?!0:!1}function s(t,e){e||(e={}),e.target=e.target||t.target||d,e.height=e.height||f,e.width=e.width||m;var n="undefined"!=typeof t.href?t.href:String(t),i=e.target||t.target,r=[];for(var o in e)if(e.hasOwnProperty(o))switch(o){case"width":case"height":case"top":case"left":r.push(o+"="+e[o]);break;case"target":case"noreferrer":break;default:r.push(o+"="+(e[o]?1:0))}var s=r.join(","),a=window.open(n,i,s);return a?(a.focus(),!1):!0}var a=t("../useragent/browser"),c=t("../useragent/device"),h=t("../useragent/platform"),u=t("../useragent/useragent"),l=window.navigator.userAgent,p=/[Mm]obi|tablet|iOS|Android|IEMobile|Windows\sPhone/,d="braintree_paypal_external_popup",f=600,m=800;e.exports={DEFAULT_POPUP_TARGET:d,DEFAULT_POPUP_HEIGHT:f,DEFAULT_POPUP_WIDTH:m,isMobile:n,isMobileDevice:i,detectedPostMessage:r,isPopupSupported:o,popup:s}},{"../useragent/browser":52,"../useragent/device":53,"../useragent/platform":54,"../useragent/useragent":55}],57:[function(t,e){function n(t,e){var n="innerText";document&&document.body&&"textContent"in document.body&&(n="textContent"),t[n]=e}e.exports={setTextContent:n}},{}],58:[function(t,e){function n(){for(var t="",e=0;32>e;e++){var n=Math.floor(16*Math.random());t+=n.toString(16)}return t}function i(t){return/^(true|1)$/i.test(t)}function r(t){return t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;").replace(/\'/g,"&apos;")}var o="function"==typeof String.prototype.trim?function(t){return t.trim()}:function(t){return t.replace(/^\s+|\s+$/,"")},s="function"==typeof window.btoa?function(t){return window.btoa(t)}:function(t){for(var e,n,i,r,o,s,a,c="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",h="",u=0;u<t.length;)e=t.charCodeAt(u++),n=t.charCodeAt(u++),i=t.charCodeAt(u++),r=e>>2,o=(3&e)<<4|n>>4,s=(15&n)<<2|i>>6,a=63&i,isNaN(n)?s=a=64:isNaN(i)&&(a=64),h=h+c.charAt(r)+c.charAt(o)+c.charAt(s)+c.charAt(a);
return h};e.exports={trim:o,btoa:s,generateUid:n,castToBoolean:i,htmlEscape:r}},{}],59:[function(t,e){e.exports=t(32)},{"braintree-utilities":69}],60:[function(t,e){e.exports=t(33)},{"braintree-utilities":69}],61:[function(t,e){e.exports=t(34)},{}],62:[function(t,e){e.exports=t(35)},{"braintree-utilities":69}],63:[function(t,e){e.exports=t(36)},{"braintree-utilities":69}],64:[function(t,e){e.exports=t(37)},{"./lib/message-bus":59,"./lib/pubsub-client":60,"./lib/pubsub-server":61,"./lib/rpc-client":62,"./lib/rpc-server":63}],65:[function(t,e){e.exports=t(38)},{}],66:[function(t,e){e.exports=t(39)},{}],67:[function(t,e){e.exports=t(40)},{}],68:[function(t,e){e.exports=t(41)},{}],69:[function(t,e){e.exports=t(42)},{"./lib/dom":65,"./lib/events":66,"./lib/fn":67,"./lib/url":68}],70:[function(t,e){"use strict";function n(t,e){if(e=e||"["+t+"] is not a valid DOM Element",t&&t.nodeType&&1===t.nodeType)return t;if(t&&window.jQuery&&(t instanceof jQuery||"jquery"in Object(t))&&0!==t.length)return t[0];if("string"==typeof t&&document.getElementById(t))return document.getElementById(t);throw new Error(e)}e.exports={normalizeElement:n}},{}],71:[function(t,e){"use strict";function n(t,e,n,i){t.addEventListener?t.addEventListener(e,n,i):t.attachEvent&&t.attachEvent("on"+e,n)}function i(t,e,n,i){t.removeEventListener?t.removeEventListener(e,n,i):t.detachEvent&&t.detachEvent("on"+e,n)}e.exports={addEventListener:n,removeEventListener:i}},{}],72:[function(t,e){"use strict";function n(t){return"[object Function]"===r.call(t)}function i(t,e){return function(){t.apply(e,arguments)}}var r=Object.prototype.toString;e.exports={bind:i,isFunction:n}},{}],73:[function(t,e){e.exports=t(41)},{}],74:[function(t,e,n){arguments[4][42][0].apply(n,arguments)},{"./lib/dom":70,"./lib/events":71,"./lib/fn":72,"./lib/url":73}],75:[function(t,e){"use strict";function n(t){this.apiClient=t}var i=["getCreditCards","unlockCreditCard","sendAnalyticsEvents"];n.prototype.attach=function(t){function e(e){t.define(e,function(){n.apiClient[e].apply(n.apiClient,arguments)})}var n=this,r=0,o=i.length;for(r;o>r;r++)e(i[r])},e.exports=n},{}],76:[function(t,e){"use strict";function n(t,e){var n=window.getComputedStyle?getComputedStyle(t):t.currentStyle;return n[e]}function i(){return{html:{height:s.style.height||"",overflow:n(s,"overflow"),position:n(s,"position")},body:{height:a.style.height||"",overflow:n(a,"overflow")}}}function r(){var t=/Android|iPhone|iPod|iPad/i.test(window.navigator.userAgent);return t}function o(t){var e,n,i;this.encodedClientToken=t.clientToken,this.paypalOptions=t.paypal,this.container=null,this.merchantFormManager=null,this.root=t.root,this.configurationRequests=[],this.braintreeApiClient=c.configure({clientToken:t.clientToken,integration:"dropin"}),this.paymentMethodNonceReceivedCallback=t.paymentMethodNonceReceived,this.clientToken=c.parseClientToken(t.clientToken),this.bus=new h.MessageBus(this.root),this.rpcServer=new h.RPCServer(this.bus),this.apiProxyServer=new l(this.braintreeApiClient),this.apiProxyServer.attach(this.rpcServer),e=t.inlineFramePath||this.clientToken.assetsUrl+"/dropin/"+y+"/inline_frame.html",n=t.modalFramePath||this.clientToken.assetsUrl+"/dropin/"+y+"/modal_frame.html",s=document.documentElement,a=document.body,this.frames={inline:this._createFrame(e),modal:this._createFrame(n)},this.container=u.normalizeElement(t.container,"Unable to find valid container."),i=u.normalizeElement(t.form||this._findClosest(this.container,"form")),this.merchantFormManager=new p({form:i,frames:this.frames,onSubmit:this.paymentMethodNonceReceivedCallback,apiClient:this.braintreeApiClient}).initialize(),this.clientToken.paypalEnabled&&this.clientToken.paypal&&(u.isBrowserHttps()||this.clientToken.paypal.allowHttp)&&this._configurePayPal(),this.braintreeApiClient.sendAnalyticsEvents("dropin.web.initialized")}var s,a,c=t("braintree-api"),h=t("braintree-rpc"),u=t("braintree-utilities"),l=t("./api_proxy_server"),p=t("./merchant_form_manager"),d=t("./frame_container"),f=t("../shared/paypal_service"),m=t("braintree-paypal/src/shared/util/browser"),y="1.1.2";o.prototype.initialize=function(){var t=this;this._initializeModal(),this.container.appendChild(this.frames.inline.element),a.appendChild(this.frames.modal.element),this.rpcServer.define("receiveSharedCustomerIdentifier",function(e){t.braintreeApiClient.attrs.sharedCustomerIdentifier=e,t.braintreeApiClient.attrs.sharedCustomerIdentifierType="browser_session_cookie_store";for(var n=0;n<t.configurationRequests.length;n++)t.configurationRequests[n](t.encodedClientToken);t.configurationRequests=[]}),this.rpcServer.define("getConfiguration",function(e){e({clientToken:t.encodedClientToken,merchantHttps:u.isBrowserHttps()})}),this.rpcServer.define("getPayPalOptions",function(e){e(t.paypalOptions)}),this.rpcServer.define("selectPaymentMethod",function(e){t.frames.modal.rpcClient.invoke("selectPaymentMethod",[e]),t._showModal()}),this.rpcServer.define("sendAddedPaymentMethod",function(e){t.merchantFormManager.writeNonce(e.nonce),t.frames.inline.rpcClient.invoke("receiveNewPaymentMethod",[e])}),this.rpcServer.define("sendUsedPaymentMethod",function(e){t.frames.inline.rpcClient.invoke("selectPaymentMethod",[e])}),this.rpcServer.define("sendUnlockedNonce",function(e){t.merchantFormManager.writeNonce(e)}),this.rpcServer.define("clearNonce",function(){t.merchantFormManager.writeNonce("")}),this.rpcServer.define("closeDropInModal",function(){t._hideModal()}),this.rpcServer.define("setInlineFrameHeight",function(e){t.frames.inline.element.style.height=e+"px"}),this.bus.register("ready",function(e){e.source===t.frames.inline.element.contentWindow?t.frames.inline.rpcClient=new h.RPCClient(t.bus,e.source):e.source===t.frames.modal.element.contentWindow&&(t.frames.modal.rpcClient=new h.RPCClient(t.bus,e.source))})},o.prototype._createFrame=function(t){return new d(t)},o.prototype._initializeModal=function(){this.frames.modal.element.style.display="none",this.frames.modal.element.style.position=r()?"absolute":"fixed",this.frames.modal.element.style.top="0",this.frames.modal.element.style.left="0",this.frames.modal.element.style.height="100%",this.frames.modal.element.style.width="100%"},o.prototype._lockMerchantWindowSize=function(){setTimeout(function(){s.style.overflow="hidden",a.style.overflow="hidden",a.style.height="100%",r()&&(s.style.position="relative",s.style.height=window.innerHeight+"px")},160)},o.prototype._unlockMerchantWindowSize=function(){var t=this.merchantPageDefaultStyles;a.style.height=t.body.height,a.style.overflow=t.body.overflow,s.style.overflow=t.html.overflow,r()&&(s.style.height=t.html.height,s.style.position=t.html.position)},o.prototype._showModal=function(){var t=this,e=this.frames.modal.element;this.merchantPageDefaultStyles=i(),e.style.display="block",this.frames.modal.rpcClient.invoke("open",[],function(){setTimeout(function(){t._lockMerchantWindowSize(),e.contentWindow.focus()},200)})},o.prototype._hideModal=function(){this._unlockMerchantWindowSize(),this.frames.modal.element.style.display="none"},o.prototype._configurePayPal=function(){m.isPopupSupported()||(this.ppClient=new f({clientToken:this.clientToken,paypal:this.paypalOptions}),this.rpcServer.define("openPayPalModal",u.bind(this.ppClient._openModal,this.ppClient))),this.rpcServer.define("receivePayPalData",u.bind(this._handlePayPalData,this))},o.prototype._handlePayPalData=function(t,e){this.merchantFormManager.writeNonce(t),this.frames.inline.rpcClient.invoke("receiveNewPaymentMethod",[{nonce:t,email:e}]),this.frames.modal.rpcClient.invoke("paypalViewClose")},o.prototype._findClosest=function(t,e){e=e.toUpperCase();do if(t.nodeName===e)return t;while(t=t.parentNode);throw"Unable to find a valid "+e},e.exports=o},{"../shared/paypal_service":80,"./api_proxy_server":75,"./frame_container":78,"./merchant_form_manager":79,"braintree-api":21,"braintree-paypal/src/shared/util/browser":56,"braintree-rpc":64,"braintree-utilities":74}],77:[function(t,e){"use strict";function n(t,e){e.clientToken=t;var n=new i(e);return n.initialize(),n}var i=t("./client"),r="1.1.2";e.exports={create:n,VERSION:r}},{"./client":76}],78:[function(t,e){"use strict";function n(t){this.element=document.createElement("iframe"),this.element.setAttribute("allowtransparency","true"),this.element.setAttribute("width","100%"),this.element.setAttribute("height","68"),this.element.setAttribute("style","-webkit-transition: height 210ms cubic-bezier(0.390, 0.575, 0.565, 1.000); -moz-transition: height 210ms cubic-bezier(0.390, 0.575, 0.565, 1.000); -ms-transition: height 210ms cubic-bezier(0.390, 0.575, 0.565, 1.000); -o-transition: height 210ms cubic-bezier(0.390, 0.575, 0.565, 1.000); transition: height 210ms cubic-bezier(0.390, 0.575, 0.565, 1.000);"),this.element.src=t,this.element.setAttribute("frameborder","0"),this.element.setAttribute("allowtransparency","true"),this.element.style.border="0",this.element.style.zIndex="9999"}e.exports=n},{}],79:[function(t,e){"use strict";function n(t){this.form=t.form,this.frames=t.frames,this.onSubmit=t.onSubmit,this.apiClient=t.apiClient}var i=t("braintree-utilities");n.prototype.initialize=function(){return this._isSubmitBased()&&this._setElements(),this._setEvents(),this},n.prototype.writeNonce=function(t){this.currentNonce=t},n.prototype._isSubmitBased=function(){return!this.onSubmit},n.prototype._isCallbackBased=function(){return!!this.onSubmit},n.prototype._setElements=function(){if(!this.form.payment_method_nonce){var t=document.createElement("input");t.type="hidden",t.name="payment_method_nonce",this.form.appendChild(t)}this.nonceField=this.form.payment_method_nonce},n.prototype._setEvents=function(){var t=this;i.addEventListener(this.form,"submit",function(){t._handleFormSubmit.apply(t,arguments)})},n.prototype._handleFormSubmit=function(t){this._shouldSubmit()||(t&&t.preventDefault?t.preventDefault():t.returnValue=!1,this.currentNonce?this._handleNonceReply(t):this.frames.inline.rpcClient.invoke("requestNonce",[],i.bind(function(e){this.writeNonce(e),this._handleNonceReply(t)},this)))},n.prototype._shouldSubmit=function(){return this._isCallbackBased()?!1:this.nonceField.value.length>0},n.prototype._handleNonceReply=function(t){this._isCallbackBased()?this.apiClient.sendAnalyticsEvents("dropin.web.end.callback",i.bind(function(){this.onSubmit(t,this.currentNonce),setTimeout(i.bind(function(){this.frames.inline.rpcClient.invoke("clearLoadingState")},this),200)},this)):this._triggerFormSubmission()},n.prototype._triggerFormSubmission=function(){this.nonceField.value=this.currentNonce,this.apiClient.sendAnalyticsEvents("dropin.web.end.auto-submit",i.bind(function(){"function"==typeof this.form.submit?this.form.submit():this.form.querySelector('[type="submit"]').click()},this))},e.exports=n},{"braintree-utilities":74}],80:[function(t,e){"use strict";function n(t){var e=t.clientToken,n=t.paypal||{},r=new i(e,{container:document.createElement("div"),displayName:n.displayName,locale:n.locale,singleUse:n.singleUse,onSuccess:n.onSuccess});return r.initialize(),r}var i=t("braintree-paypal/src/external/client");e.exports=n},{"braintree-paypal/src/external/client":48}],81:[function(t,e){"use strict";function n(t){if("object"==typeof t)return t;var e="payment_method_nonce";"string"==typeof t&&(e=t);var n=document.createElement("input");return n.name=e,n.type="hidden",n}function i(t){for(var e=t.getElementsByTagName("*"),n={},i=0;i<e.length;i++){var r=e[i].getAttribute("data-braintree-name");n[r]=!0}if(!n.number)throw'Unable to find an input with data-braintree-name="number" in your form. Please add one.';if(n.expiration_date){if(n.expiration_month||n.expiration_year)throw'You have inputs with data-braintree-name="expiration_date" AND data-braintree-name="expiration_(year|month)". Please use either "expiration_date" or "expiration_year" and "expiration_month".'}else{if(!n.expiration_month&&!n.expiration_year)throw'Unable to find an input with data-braintree-name="expiration_date" in your form. Please add one.';if(!n.expiration_month)throw'Unable to find an input with data-braintree-name="expiration_month" in your form. Please add one.';if(!n.expiration_year)throw'Unable to find an input with data-braintree-name="expiration_year" in your form. Please add one.'}}function r(t,e,n){this.client=t,this.htmlForm=e,this.paymentMethodNonce=n}r.setup=function(t,e){var o=document.getElementById(e.id);if(!o)throw'Unable to find form with id: "'+e.id+'"';i(o);var s=n(e.paymentMethodNonceInputField);o.appendChild(s);var a=new r(t,o,s);return a.hijackForm(),a},r.prototype.registerAsyncTaskOnSubmit=function(t,e){function n(n){n.preventDefault?n.preventDefault():n.returnValue=!1,e(function(){r(),t.submit&&("function"==typeof t.submit||t.submit.call)?t.submit():setTimeout(function(){t.querySelector('[type="submit"]').click()},1)})}function i(){t.addEventListener?t.addEventListener("submit",n):t.attachEvent&&t.attachEvent("onsubmit",n)}function r(){t.removeEventListener?t.removeEventListener("submit",n):t.detachEvent&&t.detachEvent("onsubmit",n)}i()},r.prototype.hijackForm=function(){var t=this;this.registerAsyncTaskOnSubmit(this.htmlForm,function(e){return t.paymentMethodNonce.value&&""!==t.paymentMethodNonce.value?(e(),void 0):(t.client.tokenizeCard(t.extractValues(t.htmlForm),function(n,i){if(n)throw"Unable to process payments at this time.";t.paymentMethodNonce.value=i,e()}),void 0)})},r.prototype.extractValues=function(t,e){e=e||{};var n,i,r=t.children;for(i=0;i<r.length;i++)if(n=r[i],1===n.nodeType&&n.attributes["data-braintree-name"]){var o=n.getAttribute("data-braintree-name");"postal_code"===o?e.billingAddress={postalCode:n.value}:e[o]=n.value,this.scrubAttributes(n)}else n.children&&n.children.length>0&&this.extractValues(n,e);return e},r.prototype.scrubAttributes=function(t){try{t.attributes.removeNamedItem("name")}catch(e){}},e.exports=r},{}],82:[function(t,e){e.exports=t(2)},{"./credit-card":83,"./jsonp-driver":84,"./parse-client-token":86,"./sepa-bank-account":88,"./sepa-mandate":89,"./util":90}],83:[function(t,e){e.exports=t(3)},{}],84:[function(t,e){e.exports=t(4)},{"./jsonp":85}],85:[function(t,e){e.exports=t(5)},{"./util":90}],86:[function(t,e){e.exports=t(6)},{"./polyfill":87}],87:[function(t,e){e.exports=t(7)},{}],88:[function(t,e){e.exports=t(8)},{}],89:[function(t,e){e.exports=t(9)},{}],90:[function(t,e){e.exports=t(10)},{}],91:[function(t,e){e.exports=t(11)},{"./lib/client":82,"./lib/jsonp":85,"./lib/jsonp-driver":84,"./lib/parse-client-token":86,"./lib/util":90}],92:[function(t,e){e.exports=t(32)},{"braintree-utilities":102}],93:[function(t,e){e.exports=t(33)},{"braintree-utilities":102}],94:[function(t,e){e.exports=t(34)},{}],95:[function(t,e){e.exports=t(35)},{"braintree-utilities":102}],96:[function(t,e){e.exports=t(36)},{"braintree-utilities":102}],97:[function(t,e){e.exports=t(37)},{"./lib/message-bus":92,"./lib/pubsub-client":93,"./lib/pubsub-server":94,"./lib/rpc-client":95,"./lib/rpc-server":96}],98:[function(t,e){e.exports=t(38)},{}],99:[function(t,e){e.exports=t(39)},{}],100:[function(t,e){e.exports=t(40)},{}],101:[function(t,e){e.exports=t(41)},{}],102:[function(t,e){e.exports=t(42)},{"./lib/dom":98,"./lib/events":99,"./lib/fn":100,"./lib/url":101}],103:[function(t,e){e.exports=t(38)},{}],104:[function(t,e){e.exports=t(39)},{}],105:[function(t,e){e.exports=t(40)},{}],106:[function(t,e){e.exports=t(41)},{}],107:[function(t,e){e.exports=t(42)},{"./lib/dom":103,"./lib/events":104,"./lib/fn":105,"./lib/url":106}],108:[function(t,e){e.exports=t(48)},{"../shared/constants":112,"../shared/util/browser":117,"../shared/util/dom":118,"../shared/util/util":119,"./logged_in_view":110,"./logged_out_view":111,"braintree-api":91,"braintree-rpc":97,"braintree-utilities":107}],109:[function(t,e){function n(t,e){if(!r.detectedPostMessage())return"function"==typeof e.onUnsupported&&e.onUnsupported(new Error("unsupported browser detected")),void 0;var n=new i(t,e);return n.initialize(),n}var i=t("./client"),r=t("../shared/util/browser"),o="1.1.2";e.exports={create:n,_browser:r,VERSION:o}},{"../shared/util/browser":117,"./client":108}],110:[function(t,e){e.exports=t(49)},{"../shared/constants":112}],111:[function(t,e){e.exports=t(50)},{"../shared/constants":112}],112:[function(t,e){e.exports=t(51)},{}],113:[function(t,e){e.exports=t(52)},{"./useragent":116}],114:[function(t,e){e.exports=t(53)},{"./platform":115,"./useragent":116}],115:[function(t,e){e.exports=t(54)},{"./useragent":116}],116:[function(t,e){e.exports=t(55)},{}],117:[function(t,e){e.exports=t(56)},{"../useragent/browser":113,"../useragent/device":114,"../useragent/platform":115,"../useragent/useragent":116}],118:[function(t,e){e.exports=t(57)},{}],119:[function(t,e){e.exports=t(58)},{}],120:[function(t,e){var n=t("braintree-api"),i=t("braintree-paypal"),r=t("braintree-dropin"),o=t("braintree-form"),s=function(t,e,s){if("dropin"===e||"paypal"===e){var a="paypal"===e?i:r;s.integration=e,a.create(t,s)}else{if("custom"!==e)throw new Error(e+" is an unsupported integration");var c=new n.Client({clientToken:t,integration:e}),h=o.setup(c,s);s.paypal&&(void 0==s.paypal.paymentMethodNonceInputField&&(s.paypal.paymentMethodNonceInputField=h.paymentMethodNonce),s.paypal.integration=e,i.create(t,s.paypal))}};e.exports={api:n,cse:Braintree,paypal:i,dropin:r,Form:o,setup:s,VERSION:"2.1.4"}},{"braintree-api":11,"braintree-dropin":77,"braintree-form":81,"braintree-paypal":109}]},{},[1])(1)});

/*!
 * Braintree Data
 * https://www.braintreepayments.com
 * Copyright (c) 2009-2014 Braintree, a division of PayPal, Inc.
 *
 * Licensed under the MIT License.
 * http://opensource.org/licenses/MIT
 */

(function(){"use strict";var sjcl={cipher:{},hash:{},keyexchange:{},mode:{},misc:{},codec:{},exception:{corrupt:function(message){this.toString=function(){return"CORRUPT: "+this.message;};this.message=message;},invalid:function(message){this.toString=function(){return"INVALID: "+this.message;};this.message=message;},bug:function(message){this.toString=function(){return"BUG: "+this.message;};this.message=message;},notReady:function(message){this.toString=function(){return"NOT READY: "+this.message;};this.message=message;}}};if(typeof module!='undefined'&&module.exports){module.exports=sjcl;}
    sjcl.bitArray={bitSlice:function(a,bstart,bend){a=sjcl.bitArray._shiftRight(a.slice(bstart/32),32-(bstart&31)).slice(1);return(bend===undefined)?a:sjcl.bitArray.clamp(a,bend-bstart);},extract:function(a,bstart,blength){var x,sh=Math.floor((-bstart-blength)&31);if((bstart+blength-1^bstart)&-32){x=(a[bstart/32|0]<<(32-sh))^(a[bstart/32+1|0]>>>sh);}else{x=a[bstart/32|0]>>>sh;}
        return x&((1<<blength)-1);},concat:function(a1,a2){if(a1.length===0||a2.length===0){return a1.concat(a2);}
        var out,i,last=a1[a1.length-1],shift=sjcl.bitArray.getPartial(last);if(shift===32){return a1.concat(a2);}else{return sjcl.bitArray._shiftRight(a2,shift,last|0,a1.slice(0,a1.length-1));}},bitLength:function(a){var l=a.length,x;if(l===0){return 0;}
        x=a[l-1];return(l-1)*32+sjcl.bitArray.getPartial(x);},clamp:function(a,len){if(a.length*32<len){return a;}
        a=a.slice(0,Math.ceil(len/32));var l=a.length;len=len&31;if(l>0&&len){a[l-1]=sjcl.bitArray.partial(len,a[l-1]&0x80000000>>(len-1),1);}
        return a;},partial:function(len,x,_end){if(len===32){return x;}
        return(_end?x|0:x<<(32-len))+len*0x10000000000;},getPartial:function(x){return Math.round(x/0x10000000000)||32;},equal:function(a,b){if(sjcl.bitArray.bitLength(a)!==sjcl.bitArray.bitLength(b)){return false;}
        var x=0,i;for(i=0;i<a.length;i++){x|=a[i]^b[i];}
        return(x===0);},_shiftRight:function(a,shift,carry,out){var i,last2=0,shift2;if(out===undefined){out=[];}
        for(;shift>=32;shift-=32){out.push(carry);carry=0;}
        if(shift===0){return out.concat(a);}
        for(i=0;i<a.length;i++){out.push(carry|a[i]>>>shift);carry=a[i]<<(32-shift);}
        last2=a.length?a[a.length-1]:0;shift2=sjcl.bitArray.getPartial(last2);out.push(sjcl.bitArray.partial(shift+shift2&31,(shift+shift2>32)?carry:out.pop(),1));return out;},_xor4:function(x,y){return[x[0]^y[0],x[1]^y[1],x[2]^y[2],x[3]^y[3]];}};sjcl.codec.hex={fromBits:function(arr){var out="",i,x;for(i=0;i<arr.length;i++){out+=((arr[i]|0)+0xF00000000000).toString(16).substr(4);}
        return out.substr(0,sjcl.bitArray.bitLength(arr)/4);},toBits:function(str){var i,out=[],len;str=str.replace(/\s|0x/g,"");len=str.length;str=str+"00000000";for(i=0;i<str.length;i+=8){out.push(parseInt(str.substr(i,8),16)^0);}
        return sjcl.bitArray.clamp(out,len*4);}};sjcl.hash.sha256=function(hash){if(!this._key[0]){this._precompute();}
        if(hash){this._h=hash._h.slice(0);this._buffer=hash._buffer.slice(0);this._length=hash._length;}else{this.reset();}};sjcl.hash.sha256.hash=function(data){return(new sjcl.hash.sha256()).update(data).finalize();};sjcl.hash.sha256.prototype={blockSize:512,reset:function(){this._h=this._init.slice(0);this._buffer=[];this._length=0;return this;},update:function(data){if(typeof data==="string"){data=sjcl.codec.utf8String.toBits(data);}
        var i,b=this._buffer=sjcl.bitArray.concat(this._buffer,data),ol=this._length,nl=this._length=ol+sjcl.bitArray.bitLength(data);for(i=512+ol&-512;i<=nl;i+=512){this._block(b.splice(0,16));}
        return this;},finalize:function(){var i,b=this._buffer,h=this._h;b=sjcl.bitArray.concat(b,[sjcl.bitArray.partial(1,1)]);for(i=b.length+2;i&15;i++){b.push(0);}
        b.push(Math.floor(this._length/0x100000000));b.push(this._length|0);while(b.length){this._block(b.splice(0,16));}
        this.reset();return h;},_init:[],_key:[],_precompute:function(){var i=0,prime=2,factor;function frac(x){return(x-Math.floor(x))*0x100000000|0;}
        outer:for(;i<64;prime++){for(factor=2;factor*factor<=prime;factor++){if(prime%factor===0){continue outer;}}
            if(i<8){this._init[i]=frac(Math.pow(prime,1/2));}
            this._key[i]=frac(Math.pow(prime,1/3));i++;}},_block:function(words){var i,tmp,a,b,w=words.slice(0),h=this._h,k=this._key,h0=h[0],h1=h[1],h2=h[2],h3=h[3],h4=h[4],h5=h[5],h6=h[6],h7=h[7];for(i=0;i<64;i++){if(i<16){tmp=w[i];}else{a=w[(i+1)&15];b=w[(i+14)&15];tmp=w[i&15]=((a>>>7^a>>>18^a>>>3^a<<25^a<<14)+
        (b>>>17^b>>>19^b>>>10^b<<15^b<<13)+
        w[i&15]+w[(i+9)&15])|0;}
        tmp=(tmp+h7+(h4>>>6^h4>>>11^h4>>>25^h4<<26^h4<<21^h4<<7)+(h6^h4&(h5^h6))+k[i]);h7=h6;h6=h5;h5=h4;h4=h3+tmp|0;h3=h2;h2=h1;h1=h0;h0=(tmp+((h1&h2)^(h3&(h1^h2)))+(h1>>>2^h1>>>13^h1>>>22^h1<<30^h1<<19^h1<<10))|0;}
        h[0]=h[0]+h0|0;h[1]=h[1]+h1|0;h[2]=h[2]+h2|0;h[3]=h[3]+h3|0;h[4]=h[4]+h4|0;h[5]=h[5]+h5|0;h[6]=h[6]+h6|0;h[7]=h[7]+h7|0;}};sjcl.cipher.aes=function(key){if(!this._tables[0][0][0]){this._precompute();}
        var i,j,tmp,encKey,decKey,sbox=this._tables[0][4],decTable=this._tables[1],keyLen=key.length,rcon=1;if(keyLen!==4&&keyLen!==6&&keyLen!==8){throw new sjcl.exception.invalid("invalid aes key size");}
        this._key=[encKey=key.slice(0),decKey=[]];for(i=keyLen;i<4*keyLen+28;i++){tmp=encKey[i-1];if(i%keyLen===0||(keyLen===8&&i%keyLen===4)){tmp=sbox[tmp>>>24]<<24^sbox[tmp>>16&255]<<16^sbox[tmp>>8&255]<<8^sbox[tmp&255];if(i%keyLen===0){tmp=tmp<<8^tmp>>>24^rcon<<24;rcon=rcon<<1^(rcon>>7)*283;}}
            encKey[i]=encKey[i-keyLen]^tmp;}
        for(j=0;i;j++,i--){tmp=encKey[j&3?i:i-4];if(i<=4||j<4){decKey[j]=tmp;}else{decKey[j]=decTable[0][sbox[tmp>>>24]]^decTable[1][sbox[tmp>>16&255]]^decTable[2][sbox[tmp>>8&255]]^decTable[3][sbox[tmp&255]];}}};sjcl.cipher.aes.prototype={encrypt:function(data){return this._crypt(data,0);},decrypt:function(data){return this._crypt(data,1);},_tables:[[[],[],[],[],[]],[[],[],[],[],[]]],_precompute:function(){var encTable=this._tables[0],decTable=this._tables[1],sbox=encTable[4],sboxInv=decTable[4],i,x,xInv,d=[],th=[],x2,x4,x8,s,tEnc,tDec;for(i=0;i<256;i++){th[(d[i]=i<<1^(i>>7)*283)^i]=i;}
        for(x=xInv=0;!sbox[x];x^=x2||1,xInv=th[xInv]||1){s=xInv^xInv<<1^xInv<<2^xInv<<3^xInv<<4;s=s>>8^s&255^99;sbox[x]=s;sboxInv[s]=x;x8=d[x4=d[x2=d[x]]];tDec=x8*0x1010101^x4*0x10001^x2*0x101^x*0x1010100;tEnc=d[s]*0x101^s*0x1010100;for(i=0;i<4;i++){encTable[i][x]=tEnc=tEnc<<24^tEnc>>>8;decTable[i][s]=tDec=tDec<<24^tDec>>>8;}}
        for(i=0;i<5;i++){encTable[i]=encTable[i].slice(0);decTable[i]=decTable[i].slice(0);}},_crypt:function(input,dir){if(input.length!==4){throw new sjcl.exception.invalid("invalid aes block size");}
        var key=this._key[dir],a=input[0]^key[0],b=input[dir?3:1]^key[1],c=input[2]^key[2],d=input[dir?1:3]^key[3],a2,b2,c2,nInnerRounds=key.length/4-2,i,kIndex=4,out=[0,0,0,0],table=this._tables[dir],t0=table[0],t1=table[1],t2=table[2],t3=table[3],sbox=table[4];for(i=0;i<nInnerRounds;i++){a2=t0[a>>>24]^t1[b>>16&255]^t2[c>>8&255]^t3[d&255]^key[kIndex];b2=t0[b>>>24]^t1[c>>16&255]^t2[d>>8&255]^t3[a&255]^key[kIndex+1];c2=t0[c>>>24]^t1[d>>16&255]^t2[a>>8&255]^t3[b&255]^key[kIndex+2];d=t0[d>>>24]^t1[a>>16&255]^t2[b>>8&255]^t3[c&255]^key[kIndex+3];kIndex+=4;a=a2;b=b2;c=c2;}
        for(i=0;i<4;i++){out[dir?3&-i:i]=sbox[a>>>24]<<24^sbox[b>>16&255]<<16^sbox[c>>8&255]<<8^sbox[d&255]^key[kIndex++];a2=a;a=b;b=c;c=d;d=a2;}
        return out;}};sjcl.random={randomWords:function(nwords,paranoia){var out=[],i,readiness=this.isReady(paranoia),g;if(readiness===this._NOT_READY){throw new sjcl.exception.notReady("generator isn't seeded");}else if(readiness&this._REQUIRES_RESEED){this._reseedFromPools(!(readiness&this._READY));}
        for(i=0;i<nwords;i+=4){if((i+1)%this._MAX_WORDS_PER_BURST===0){this._gate();}
            g=this._gen4words();out.push(g[0],g[1],g[2],g[3]);}
        this._gate();return out.slice(0,nwords);},setDefaultParanoia:function(paranoia){this._defaultParanoia=paranoia;},addEntropy:function(data,estimatedEntropy,source){source=source||"user";var id,i,tmp,t=(new Date()).valueOf(),robin=this._robins[source],oldReady=this.isReady(),err=0;id=this._collectorIds[source];if(id===undefined){id=this._collectorIds[source]=this._collectorIdNext++;}
        if(robin===undefined){robin=this._robins[source]=0;}
        this._robins[source]=(this._robins[source]+1)%this._pools.length;switch(typeof(data)){case"number":if(estimatedEntropy===undefined){estimatedEntropy=1;}
            this._pools[robin].update([id,this._eventId++,1,estimatedEntropy,t,1,data|0]);break;case"object":var objName=Object.prototype.toString.call(data);if(objName==="[object Uint32Array]"){tmp=[];for(i=0;i<data.length;i++){tmp.push(data[i]);}
            data=tmp;}else{if(objName!=="[object Array]"){err=1;}
            for(i=0;i<data.length&&!err;i++){if(typeof(data[i])!="number"){err=1;}}}
            if(!err){if(estimatedEntropy===undefined){estimatedEntropy=0;for(i=0;i<data.length;i++){tmp=data[i];while(tmp>0){estimatedEntropy++;tmp=tmp>>>1;}}}
                this._pools[robin].update([id,this._eventId++,2,estimatedEntropy,t,data.length].concat(data));}
            break;case"string":if(estimatedEntropy===undefined){estimatedEntropy=data.length;}
            this._pools[robin].update([id,this._eventId++,3,estimatedEntropy,t,data.length]);this._pools[robin].update(data);break;default:err=1;}
        if(err){throw new sjcl.exception.bug("random: addEntropy only supports number, array of numbers or string");}
        this._poolEntropy[robin]+=estimatedEntropy;this._poolStrength+=estimatedEntropy;if(oldReady===this._NOT_READY){if(this.isReady()!==this._NOT_READY){this._fireEvent("seeded",Math.max(this._strength,this._poolStrength));}
            this._fireEvent("progress",this.getProgress());}},isReady:function(paranoia){var entropyRequired=this._PARANOIA_LEVELS[(paranoia!==undefined)?paranoia:this._defaultParanoia];if(this._strength&&this._strength>=entropyRequired){return(this._poolEntropy[0]>this._BITS_PER_RESEED&&(new Date()).valueOf()>this._nextReseed)?this._REQUIRES_RESEED|this._READY:this._READY;}else{return(this._poolStrength>=entropyRequired)?this._REQUIRES_RESEED|this._NOT_READY:this._NOT_READY;}},getProgress:function(paranoia){var entropyRequired=this._PARANOIA_LEVELS[paranoia?paranoia:this._defaultParanoia];if(this._strength>=entropyRequired){return 1.0;}else{return(this._poolStrength>entropyRequired)?1.0:this._poolStrength/entropyRequired;}},startCollectors:function(){if(this._collectorsStarted){return;}
        if(window.addEventListener){window.addEventListener("load",this._loadTimeCollector,false);window.addEventListener("mousemove",this._mouseCollector,false);}else if(document.attachEvent){document.attachEvent("onload",this._loadTimeCollector);document.attachEvent("onmousemove",this._mouseCollector);}
        else{throw new sjcl.exception.bug("can't attach event");}
        this._collectorsStarted=true;},stopCollectors:function(){if(!this._collectorsStarted){return;}
        if(window.removeEventListener){window.removeEventListener("load",this._loadTimeCollector,false);window.removeEventListener("mousemove",this._mouseCollector,false);}else if(window.detachEvent){window.detachEvent("onload",this._loadTimeCollector);window.detachEvent("onmousemove",this._mouseCollector);}
        this._collectorsStarted=false;},addEventListener:function(name,callback){this._callbacks[name][this._callbackI++]=callback;},removeEventListener:function(name,cb){var i,j,cbs=this._callbacks[name],jsTemp=[];for(j in cbs){if(cbs.hasOwnProperty(j)&&cbs[j]===cb){jsTemp.push(j);}}
        for(i=0;i<jsTemp.length;i++){j=jsTemp[i];delete cbs[j];}},_pools:[new sjcl.hash.sha256()],_poolEntropy:[0],_reseedCount:0,_robins:{},_eventId:0,_collectorIds:{},_collectorIdNext:0,_strength:0,_poolStrength:0,_nextReseed:0,_key:[0,0,0,0,0,0,0,0],_counter:[0,0,0,0],_cipher:undefined,_defaultParanoia:6,_collectorsStarted:false,_callbacks:{progress:{},seeded:{}},_callbackI:0,_NOT_READY:0,_READY:1,_REQUIRES_RESEED:2,_MAX_WORDS_PER_BURST:65536,_PARANOIA_LEVELS:[0,48,64,96,128,192,256,384,512,768,1024],_MILLISECONDS_PER_RESEED:30000,_BITS_PER_RESEED:80,_gen4words:function(){for(var i=0;i<4;i++){this._counter[i]=this._counter[i]+1|0;if(this._counter[i]){break;}}
        return this._cipher.encrypt(this._counter);},_gate:function(){this._key=this._gen4words().concat(this._gen4words());this._cipher=new sjcl.cipher.aes(this._key);},_reseed:function(seedWords){this._key=sjcl.hash.sha256.hash(this._key.concat(seedWords));this._cipher=new sjcl.cipher.aes(this._key);for(var i=0;i<4;i++){this._counter[i]=this._counter[i]+1|0;if(this._counter[i]){break;}}},_reseedFromPools:function(full){var reseedData=[],strength=0,i;this._nextReseed=reseedData[0]=(new Date()).valueOf()+this._MILLISECONDS_PER_RESEED;for(i=0;i<16;i++){reseedData.push(Math.random()*0x100000000|0);}
        for(i=0;i<this._pools.length;i++){reseedData=reseedData.concat(this._pools[i].finalize());strength+=this._poolEntropy[i];this._poolEntropy[i]=0;if(!full&&(this._reseedCount&(1<<i))){break;}}
        if(this._reseedCount>=1<<this._pools.length){this._pools.push(new sjcl.hash.sha256());this._poolEntropy.push(0);}
        this._poolStrength-=strength;if(strength>this._strength){this._strength=strength;}
        this._reseedCount++;this._reseed(reseedData);},_mouseCollector:function(ev){var x=ev.x||ev.clientX||ev.offsetX||0,y=ev.y||ev.clientY||ev.offsetY||0;sjcl.random.addEntropy([x,y],2,"mouse");},_loadTimeCollector:function(ev){sjcl.random.addEntropy((new Date()).valueOf(),2,"loadtime");},_fireEvent:function(name,arg){var j,cbs=sjcl.random._callbacks[name],cbsTemp=[];for(j in cbs){if(cbs.hasOwnProperty(j)){cbsTemp.push(cbs[j]);}}
        for(j=0;j<cbsTemp.length;j++){cbsTemp[j](arg);}}};(function(){try{var ab=new Uint32Array(32);crypto.getRandomValues(ab);sjcl.random.addEntropy(ab,1024,"crypto.getRandomValues");}catch(e){}})();if(typeof JSON!=='object'){JSON={};}
    (function(){'use strict';function f(n){return n<10?'0'+n:n;}
        if(typeof Date.prototype.toJSON!=='function'){Date.prototype.toJSON=function(){return isFinite(this.valueOf())?this.getUTCFullYear()+'-'+
            f(this.getUTCMonth()+1)+'-'+
            f(this.getUTCDate())+'T'+
            f(this.getUTCHours())+':'+
            f(this.getUTCMinutes())+':'+
            f(this.getUTCSeconds())+'Z':null;};String.prototype.toJSON=Number.prototype.toJSON=Boolean.prototype.toJSON=function(){return this.valueOf();};}
        var cx=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,escapable=/[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,gap,indent,meta={'\b':'\\b','\t':'\\t','\n':'\\n','\f':'\\f','\r':'\\r','"':'\\"','\\':'\\\\'},rep;function quote(string){escapable.lastIndex=0;return escapable.test(string)?'"'+string.replace(escapable,function(a){var c=meta[a];return typeof c==='string'?c:'\\u'+('0000'+a.charCodeAt(0).toString(16)).slice(-4);})+'"':'"'+string+'"';}
        function str(key,holder){var i,k,v,length,mind=gap,partial,value=holder[key];if(value&&typeof value==='object'&&typeof value.toJSON==='function'){value=value.toJSON(key);}
            if(typeof rep==='function'){value=rep.call(holder,key,value);}
            switch(typeof value){case'string':return quote(value);case'number':return isFinite(value)?String(value):'null';case'boolean':case'null':return String(value);case'object':if(!value){return'null';}
                gap+=indent;partial=[];if(Object.prototype.toString.apply(value)==='[object Array]'){length=value.length;for(i=0;i<length;i+=1){partial[i]=str(i,value)||'null';}
                    v=partial.length===0?'[]':gap?'[\n'+gap+partial.join(',\n'+gap)+'\n'+mind+']':'['+partial.join(',')+']';gap=mind;return v;}
                if(rep&&typeof rep==='object'){length=rep.length;for(i=0;i<length;i+=1){if(typeof rep[i]==='string'){k=rep[i];v=str(k,value);if(v){partial.push(quote(k)+(gap?': ':':')+v);}}}}else{for(k in value){if(Object.prototype.hasOwnProperty.call(value,k)){v=str(k,value);if(v){partial.push(quote(k)+(gap?': ':':')+v);}}}}
                v=partial.length===0?'{}':gap?'{\n'+gap+partial.join(',\n'+gap)+'\n'+mind+'}':'{'+partial.join(',')+'}';gap=mind;return v;}}
        if(typeof JSON.stringify!=='function'){JSON.stringify=function(value,replacer,space){var i;gap='';indent='';if(typeof space==='number'){for(i=0;i<space;i+=1){indent+=' ';}}else if(typeof space==='string'){indent=space;}
            rep=replacer;if(replacer&&typeof replacer!=='function'&&(typeof replacer!=='object'||typeof replacer.length!=='number')){throw new Error('JSON.stringify');}
            return str('',{'':value});};}
        if(typeof JSON.parse!=='function'){JSON.parse=function(text,reviver){var j;function walk(holder,key){var k,v,value=holder[key];if(value&&typeof value==='object'){for(k in value){if(Object.prototype.hasOwnProperty.call(value,k)){v=walk(value,k);if(v!==undefined){value[k]=v;}else{delete value[k];}}}}
            return reviver.call(holder,key,value);}
            text=String(text);cx.lastIndex=0;if(cx.test(text)){text=text.replace(cx,function(a){return'\\u'+
                ('0000'+a.charCodeAt(0).toString(16)).slice(-4);});}
            if(/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,'@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,']').replace(/(?:^|:|,)(?:\s*\[)+/g,''))){j=eval('('+text+')');return typeof reviver==='function'?walk({'':j},''):j;}
            throw new SyntaxError('JSON.parse');};}}());sjcl.random.startCollectors();var BraintreeData={};BraintreeData.Environment=function(name,url,id){this.url=url,this.name=name,this.id=id,this.getId=function(){if(this.hasOwnProperty("customId")){return this.customId;}else{return this.id;}};this.withId=function(customId){this.customId=customId;return this;};};BraintreeData.iframeId="braintreeDataFrame";BraintreeData.collectionStarted=false;BraintreeData.environments={qa:new BraintreeData.Environment("qa","https://assets.qa.braintreegateway.com/data","600000"),sandbox:new BraintreeData.Environment("sandbox","https://assets.braintreegateway.com/sandbox/data","600000"),production:new BraintreeData.Environment("production","https://assets.braintreegateway.com/data","600000")};BraintreeData.setup=function(merchantPublicId,formId,env){this._setupCollector(env);this._setupForm(formId);BraintreeData.FraudNet.initialize();};BraintreeData._setupCollector=function(env){this.collectionStarted=true;this._initializeEnvironment(env);this._setupIFrame();};BraintreeData._setupForm=function(formId){var form=document.getElementById(formId);this._addHiddenField(form,"device_data",this._getDeviceData());};BraintreeData._getDeviceData=function(){if(this.collectionStarted){return JSON.stringify({device_session_id:this._getDeviceSessionId(),fraud_merchant_id:this.currentEnvironment.getId(),correlation_id:BraintreeData.FraudNet.getSessionId()});}else{throw("You must call setup or _setupCollector before _getDeviceData.");}}
    BraintreeData._addHiddenField=function(form,name,value){if(this._formHasInput(form,name))return;var hiddenField=document.createElement("input");hiddenField.type="hidden";hiddenField.name=name;hiddenField.id=name;hiddenField.value=value;form.appendChild(hiddenField);};BraintreeData._getDeviceSessionId=function(){var bits,hexString;if(this.deviceSessionId==undefined){bits=sjcl.random.randomWords(4,0);hexString=sjcl.codec.hex.fromBits(bits);this.deviceSessionId=hexString;}
        return this.deviceSessionId;};BraintreeData._setupIFrame=function(){var params,iframe,img,self=this;if(document.getElementById(BraintreeData.iframeId)){return;}
        params="?m="+this.currentEnvironment.getId()+"&s="+this._getDeviceSessionId();iframe=document.createElement("iframe");iframe.width=1;iframe.id=BraintreeData.iframeId;iframe.height=1;iframe.frameBorder=0;iframe.scrolling="no";document.body.appendChild(iframe);setTimeout(function(){iframe.src=self.currentEnvironment.url+"/logo.htm"+params;iframe.innerHTML="<img src=\""+self.currentEnvironment.url+"/logo.gif"+params+"\" />";},10);};BraintreeData._formHasInput=function(form,input_id){var children=form.getElementsByTagName("input");var hasInput=false;for(var i=0;i<children.length;i+=1){if(children[i].id==input_id){hasInput=true;break;}}
        return hasInput;};BraintreeData._initializeEnvironment=function(env){if(typeof(env)!=="undefined"&&env.hasOwnProperty("name")&&this.environments.hasOwnProperty(env.name)){this.currentEnvironment=this.environments[env.name];}else{throw(env+" is not a valid environment");}};BraintreeData.sjcl=sjcl;window.BraintreeData=BraintreeData;(function(window){var exports=BraintreeData.FraudNet={};var getSessionId=(function(){var id='';for(var i=0;i<32;i++){id+=Math.floor(Math.random()*16).toString(16);}
        return function(){return id;}})();var parameters={'f':getSessionId(),'s':'BRAINTREE_SIGNIN','b':getBeaconId()};function getBeaconId(){var sessionId=getSessionId();var timestamp=new Date().getTime()/1000;return'https://b.stats.paypal.com/counter.cgi'+'?i=127.0.0.1'+'&p='+sessionId+'&t='+timestamp+'&a=14';}
        function initialize(){createParameterBlock();createThirdPartyBlock();}
        function createParameterBlock(){var el=document.body.appendChild(document.createElement('script'));el.type='application/json';el.setAttribute('fncls','fnparams-dede7cc5-15fd-4c75-a9f4-36c430ee3a99');el.text=JSON.stringify(parameters);}
        function createThirdPartyBlock(){var scriptBaseURL='https://www.paypalobjects.com/webstatic/r/fb/';var dom,doc,where,iframe=document.createElement('iframe');iframe.src='javascript:false';iframe.title='';iframe.role='presentation';(iframe.frameElement||iframe).style.cssText='width: 0; height: 0; border: 0';where=document.getElementsByTagName('script');where=where[where.length-1];where.parentNode.insertBefore(iframe,where);try{doc=iframe.contentWindow.document;}catch(e){dom=document.domain;iframe.src='javascript:var d=document.open();d.domain="'+dom+'";void(0);';doc=iframe.contentWindow.document;}
            doc.open()._l=function(){var js=this.createElement('script');if(dom){this.domain=dom;}
                js.id='js-iframe-async';js.src=scriptBaseURL+'fb-all-prod.pp.min.js';this.body.appendChild(js);};doc.write('<body onload="document._l();">');doc.close();}
        exports.initialize=initialize;exports.getSessionId=getSessionId;})(this);if(typeof window.onBraintreeDataLoad==='function'){window.onBraintreeDataLoad();}})();
/**
 * Console
 *
 * @link https://github.com/theshock/console-cap
 *
 * @param    {Object}    console    Ссылка на console
 */
(function (console) {

    var i,
        global  = this,
        fnProto = Function.prototype,
        fnApply = fnProto.apply,
        fnBind  = fnProto.bind,
        bind    = function (context, fn) {
            return fnBind ?
                fnBind.call( fn, context ) :
                function () {
                    return fnApply.call( fn, context, arguments );
                };
        },
        methods = 'assert count debug dir dirxml error group groupCollapsed groupEnd info log markTimeline profile profileEnd table time timeEnd trace warn'.split(' '),
        emptyFn = function(){},
        empty   = {},
        timeCounters;

    for (i = methods.length; i--;) empty[methods[i]] = emptyFn;

    if (console) {
        
        if (!console.time) {
            console.timeCounters = timeCounters = {};
            
            console.time = function(name, reset){
                if (name) {
                    var time = +new Date, key = "KEY" + name.toString();
                    if (reset || !timeCounters[key]) timeCounters[key] = time;
                }
            };

            console.timeEnd = function(name){
                var diff,
                    time = +new Date,
                    key = "KEY" + name.toString(),
                    timeCounter = timeCounters[key];
                
                if (timeCounter) {
                    diff  = time - timeCounter;
                    console.info( name + ": " + diff + "ms" );
                    delete timeCounters[key];
                }
                return diff;
            };
        }
        
        for (i = methods.length; i--;) {
            console[methods[i]] = methods[i] in console ?
                bind(console, console[methods[i]]) : emptyFn;
        }
        console.disable = function () { global.console = empty;   };
          empty.enable  = function () { global.console = console; };
        
        empty.disable = console.enable = emptyFn;
        
    } else {
        console = global.console = empty;
        console.disable = console.enable = emptyFn;
    }

})( typeof console === 'undefined' ? null : console );

//console.disable();

/*\
|*|
|*|  :: cookies.js ::
|*|
|*|  A complete cookies reader/writer framework with full unicode support.
|*|
|*|  https://developer.mozilla.org/en-US/docs/DOM/document.cookie
|*|
|*|  This framework is released under the GNU Public License, version 3 or later.
|*|  http://www.gnu.org/licenses/gpl-3.0-standalone.html
|*|
|*|  Syntaxes:
|*|
|*|  * docCookies.setItem(name, value[, end[, path[, domain[, secure]]]])
|*|  * docCookies.getItem(name)
|*|  * docCookies.removeItem(name[, path], domain)
|*|  * docCookies.hasItem(name)
|*|  * docCookies.keys()
|*|
\*/

var docCookies = {
  getItem: function (sKey) {
    return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
  },
  setItem: function (sKey, sValue, vEnd, sPath, sDomain, bSecure) {
    if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) { return false; }
    var sExpires = "";
    if (vEnd) {
      switch (vEnd.constructor) {
        case Number:
          sExpires = vEnd === Infinity ? "; expires=Fri, 31 Dec 9999 23:59:59 GMT" : "; max-age=" + vEnd;
          break;
        case String:
          sExpires = "; expires=" + vEnd;
          break;
        case Date:
          sExpires = "; expires=" + vEnd.toUTCString();
          break;
      }
    }
    document.cookie = encodeURIComponent(sKey) + "=" + encodeURIComponent(sValue) + sExpires + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "") + (bSecure ? "; secure" : "");
    return true;
  },
  removeItem: function (sKey, sPath, sDomain) {
    if (!sKey || !this.hasItem(sKey)) { return false; }
    document.cookie = encodeURIComponent(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + ( sDomain ? "; domain=" + sDomain : "") + ( sPath ? "; path=" + sPath : "");
    return true;
  },
  hasItem: function (sKey) {
    return (new RegExp("(?:^|;\\s*)" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
  },
  keys: /* optional method: you can safely remove it! */ function () {
    var aKeys = document.cookie.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, "").split(/\s*(?:\=[^;]*)?;\s*/);
    for (var nIdx = 0; nIdx < aKeys.length; nIdx++) { aKeys[nIdx] = decodeURIComponent(aKeys[nIdx]); }
    return aKeys;
  }
};
/*! jQuery v2.1.1 | (c) 2005, 2014 jQuery Foundation, Inc. | jquery.org/license */
!function(a,b){"object"==typeof module&&"object"==typeof module.exports?module.exports=a.document?b(a,!0):function(a){if(!a.document)throw new Error("jQuery requires a window with a document");return b(a)}:b(a)}("undefined"!=typeof window?window:this,function(a,b){var c=[],d=c.slice,e=c.concat,f=c.push,g=c.indexOf,h={},i=h.toString,j=h.hasOwnProperty,k={},l=a.document,m="2.1.1",n=function(a,b){return new n.fn.init(a,b)},o=/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,p=/^-ms-/,q=/-([\da-z])/gi,r=function(a,b){return b.toUpperCase()};n.fn=n.prototype={jquery:m,constructor:n,selector:"",length:0,toArray:function(){return d.call(this)},get:function(a){return null!=a?0>a?this[a+this.length]:this[a]:d.call(this)},pushStack:function(a){var b=n.merge(this.constructor(),a);return b.prevObject=this,b.context=this.context,b},each:function(a,b){return n.each(this,a,b)},map:function(a){return this.pushStack(n.map(this,function(b,c){return a.call(b,c,b)}))},slice:function(){return this.pushStack(d.apply(this,arguments))},first:function(){return this.eq(0)},last:function(){return this.eq(-1)},eq:function(a){var b=this.length,c=+a+(0>a?b:0);return this.pushStack(c>=0&&b>c?[this[c]]:[])},end:function(){return this.prevObject||this.constructor(null)},push:f,sort:c.sort,splice:c.splice},n.extend=n.fn.extend=function(){var a,b,c,d,e,f,g=arguments[0]||{},h=1,i=arguments.length,j=!1;for("boolean"==typeof g&&(j=g,g=arguments[h]||{},h++),"object"==typeof g||n.isFunction(g)||(g={}),h===i&&(g=this,h--);i>h;h++)if(null!=(a=arguments[h]))for(b in a)c=g[b],d=a[b],g!==d&&(j&&d&&(n.isPlainObject(d)||(e=n.isArray(d)))?(e?(e=!1,f=c&&n.isArray(c)?c:[]):f=c&&n.isPlainObject(c)?c:{},g[b]=n.extend(j,f,d)):void 0!==d&&(g[b]=d));return g},n.extend({expando:"jQuery"+(m+Math.random()).replace(/\D/g,""),isReady:!0,error:function(a){throw new Error(a)},noop:function(){},isFunction:function(a){return"function"===n.type(a)},isArray:Array.isArray,isWindow:function(a){return null!=a&&a===a.window},isNumeric:function(a){return!n.isArray(a)&&a-parseFloat(a)>=0},isPlainObject:function(a){return"object"!==n.type(a)||a.nodeType||n.isWindow(a)?!1:a.constructor&&!j.call(a.constructor.prototype,"isPrototypeOf")?!1:!0},isEmptyObject:function(a){var b;for(b in a)return!1;return!0},type:function(a){return null==a?a+"":"object"==typeof a||"function"==typeof a?h[i.call(a)]||"object":typeof a},globalEval:function(a){var b,c=eval;a=n.trim(a),a&&(1===a.indexOf("use strict")?(b=l.createElement("script"),b.text=a,l.head.appendChild(b).parentNode.removeChild(b)):c(a))},camelCase:function(a){return a.replace(p,"ms-").replace(q,r)},nodeName:function(a,b){return a.nodeName&&a.nodeName.toLowerCase()===b.toLowerCase()},each:function(a,b,c){var d,e=0,f=a.length,g=s(a);if(c){if(g){for(;f>e;e++)if(d=b.apply(a[e],c),d===!1)break}else for(e in a)if(d=b.apply(a[e],c),d===!1)break}else if(g){for(;f>e;e++)if(d=b.call(a[e],e,a[e]),d===!1)break}else for(e in a)if(d=b.call(a[e],e,a[e]),d===!1)break;return a},trim:function(a){return null==a?"":(a+"").replace(o,"")},makeArray:function(a,b){var c=b||[];return null!=a&&(s(Object(a))?n.merge(c,"string"==typeof a?[a]:a):f.call(c,a)),c},inArray:function(a,b,c){return null==b?-1:g.call(b,a,c)},merge:function(a,b){for(var c=+b.length,d=0,e=a.length;c>d;d++)a[e++]=b[d];return a.length=e,a},grep:function(a,b,c){for(var d,e=[],f=0,g=a.length,h=!c;g>f;f++)d=!b(a[f],f),d!==h&&e.push(a[f]);return e},map:function(a,b,c){var d,f=0,g=a.length,h=s(a),i=[];if(h)for(;g>f;f++)d=b(a[f],f,c),null!=d&&i.push(d);else for(f in a)d=b(a[f],f,c),null!=d&&i.push(d);return e.apply([],i)},guid:1,proxy:function(a,b){var c,e,f;return"string"==typeof b&&(c=a[b],b=a,a=c),n.isFunction(a)?(e=d.call(arguments,2),f=function(){return a.apply(b||this,e.concat(d.call(arguments)))},f.guid=a.guid=a.guid||n.guid++,f):void 0},now:Date.now,support:k}),n.each("Boolean Number String Function Array Date RegExp Object Error".split(" "),function(a,b){h["[object "+b+"]"]=b.toLowerCase()});function s(a){var b=a.length,c=n.type(a);return"function"===c||n.isWindow(a)?!1:1===a.nodeType&&b?!0:"array"===c||0===b||"number"==typeof b&&b>0&&b-1 in a}var t=function(a){var b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u="sizzle"+-new Date,v=a.document,w=0,x=0,y=gb(),z=gb(),A=gb(),B=function(a,b){return a===b&&(l=!0),0},C="undefined",D=1<<31,E={}.hasOwnProperty,F=[],G=F.pop,H=F.push,I=F.push,J=F.slice,K=F.indexOf||function(a){for(var b=0,c=this.length;c>b;b++)if(this[b]===a)return b;return-1},L="checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",M="[\\x20\\t\\r\\n\\f]",N="(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",O=N.replace("w","w#"),P="\\["+M+"*("+N+")(?:"+M+"*([*^$|!~]?=)"+M+"*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|("+O+"))|)"+M+"*\\]",Q=":("+N+")(?:\\((('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|((?:\\\\.|[^\\\\()[\\]]|"+P+")*)|.*)\\)|)",R=new RegExp("^"+M+"+|((?:^|[^\\\\])(?:\\\\.)*)"+M+"+$","g"),S=new RegExp("^"+M+"*,"+M+"*"),T=new RegExp("^"+M+"*([>+~]|"+M+")"+M+"*"),U=new RegExp("="+M+"*([^\\]'\"]*?)"+M+"*\\]","g"),V=new RegExp(Q),W=new RegExp("^"+O+"$"),X={ID:new RegExp("^#("+N+")"),CLASS:new RegExp("^\\.("+N+")"),TAG:new RegExp("^("+N.replace("w","w*")+")"),ATTR:new RegExp("^"+P),PSEUDO:new RegExp("^"+Q),CHILD:new RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\("+M+"*(even|odd|(([+-]|)(\\d*)n|)"+M+"*(?:([+-]|)"+M+"*(\\d+)|))"+M+"*\\)|)","i"),bool:new RegExp("^(?:"+L+")$","i"),needsContext:new RegExp("^"+M+"*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\("+M+"*((?:-\\d)?\\d*)"+M+"*\\)|)(?=[^-]|$)","i")},Y=/^(?:input|select|textarea|button)$/i,Z=/^h\d$/i,$=/^[^{]+\{\s*\[native \w/,_=/^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,ab=/[+~]/,bb=/'|\\/g,cb=new RegExp("\\\\([\\da-f]{1,6}"+M+"?|("+M+")|.)","ig"),db=function(a,b,c){var d="0x"+b-65536;return d!==d||c?b:0>d?String.fromCharCode(d+65536):String.fromCharCode(d>>10|55296,1023&d|56320)};try{I.apply(F=J.call(v.childNodes),v.childNodes),F[v.childNodes.length].nodeType}catch(eb){I={apply:F.length?function(a,b){H.apply(a,J.call(b))}:function(a,b){var c=a.length,d=0;while(a[c++]=b[d++]);a.length=c-1}}}function fb(a,b,d,e){var f,h,j,k,l,o,r,s,w,x;if((b?b.ownerDocument||b:v)!==n&&m(b),b=b||n,d=d||[],!a||"string"!=typeof a)return d;if(1!==(k=b.nodeType)&&9!==k)return[];if(p&&!e){if(f=_.exec(a))if(j=f[1]){if(9===k){if(h=b.getElementById(j),!h||!h.parentNode)return d;if(h.id===j)return d.push(h),d}else if(b.ownerDocument&&(h=b.ownerDocument.getElementById(j))&&t(b,h)&&h.id===j)return d.push(h),d}else{if(f[2])return I.apply(d,b.getElementsByTagName(a)),d;if((j=f[3])&&c.getElementsByClassName&&b.getElementsByClassName)return I.apply(d,b.getElementsByClassName(j)),d}if(c.qsa&&(!q||!q.test(a))){if(s=r=u,w=b,x=9===k&&a,1===k&&"object"!==b.nodeName.toLowerCase()){o=g(a),(r=b.getAttribute("id"))?s=r.replace(bb,"\\$&"):b.setAttribute("id",s),s="[id='"+s+"'] ",l=o.length;while(l--)o[l]=s+qb(o[l]);w=ab.test(a)&&ob(b.parentNode)||b,x=o.join(",")}if(x)try{return I.apply(d,w.querySelectorAll(x)),d}catch(y){}finally{r||b.removeAttribute("id")}}}return i(a.replace(R,"$1"),b,d,e)}function gb(){var a=[];function b(c,e){return a.push(c+" ")>d.cacheLength&&delete b[a.shift()],b[c+" "]=e}return b}function hb(a){return a[u]=!0,a}function ib(a){var b=n.createElement("div");try{return!!a(b)}catch(c){return!1}finally{b.parentNode&&b.parentNode.removeChild(b),b=null}}function jb(a,b){var c=a.split("|"),e=a.length;while(e--)d.attrHandle[c[e]]=b}function kb(a,b){var c=b&&a,d=c&&1===a.nodeType&&1===b.nodeType&&(~b.sourceIndex||D)-(~a.sourceIndex||D);if(d)return d;if(c)while(c=c.nextSibling)if(c===b)return-1;return a?1:-1}function lb(a){return function(b){var c=b.nodeName.toLowerCase();return"input"===c&&b.type===a}}function mb(a){return function(b){var c=b.nodeName.toLowerCase();return("input"===c||"button"===c)&&b.type===a}}function nb(a){return hb(function(b){return b=+b,hb(function(c,d){var e,f=a([],c.length,b),g=f.length;while(g--)c[e=f[g]]&&(c[e]=!(d[e]=c[e]))})})}function ob(a){return a&&typeof a.getElementsByTagName!==C&&a}c=fb.support={},f=fb.isXML=function(a){var b=a&&(a.ownerDocument||a).documentElement;return b?"HTML"!==b.nodeName:!1},m=fb.setDocument=function(a){var b,e=a?a.ownerDocument||a:v,g=e.defaultView;return e!==n&&9===e.nodeType&&e.documentElement?(n=e,o=e.documentElement,p=!f(e),g&&g!==g.top&&(g.addEventListener?g.addEventListener("unload",function(){m()},!1):g.attachEvent&&g.attachEvent("onunload",function(){m()})),c.attributes=ib(function(a){return a.className="i",!a.getAttribute("className")}),c.getElementsByTagName=ib(function(a){return a.appendChild(e.createComment("")),!a.getElementsByTagName("*").length}),c.getElementsByClassName=$.test(e.getElementsByClassName)&&ib(function(a){return a.innerHTML="<div class='a'></div><div class='a i'></div>",a.firstChild.className="i",2===a.getElementsByClassName("i").length}),c.getById=ib(function(a){return o.appendChild(a).id=u,!e.getElementsByName||!e.getElementsByName(u).length}),c.getById?(d.find.ID=function(a,b){if(typeof b.getElementById!==C&&p){var c=b.getElementById(a);return c&&c.parentNode?[c]:[]}},d.filter.ID=function(a){var b=a.replace(cb,db);return function(a){return a.getAttribute("id")===b}}):(delete d.find.ID,d.filter.ID=function(a){var b=a.replace(cb,db);return function(a){var c=typeof a.getAttributeNode!==C&&a.getAttributeNode("id");return c&&c.value===b}}),d.find.TAG=c.getElementsByTagName?function(a,b){return typeof b.getElementsByTagName!==C?b.getElementsByTagName(a):void 0}:function(a,b){var c,d=[],e=0,f=b.getElementsByTagName(a);if("*"===a){while(c=f[e++])1===c.nodeType&&d.push(c);return d}return f},d.find.CLASS=c.getElementsByClassName&&function(a,b){return typeof b.getElementsByClassName!==C&&p?b.getElementsByClassName(a):void 0},r=[],q=[],(c.qsa=$.test(e.querySelectorAll))&&(ib(function(a){a.innerHTML="<select msallowclip=''><option selected=''></option></select>",a.querySelectorAll("[msallowclip^='']").length&&q.push("[*^$]="+M+"*(?:''|\"\")"),a.querySelectorAll("[selected]").length||q.push("\\["+M+"*(?:value|"+L+")"),a.querySelectorAll(":checked").length||q.push(":checked")}),ib(function(a){var b=e.createElement("input");b.setAttribute("type","hidden"),a.appendChild(b).setAttribute("name","D"),a.querySelectorAll("[name=d]").length&&q.push("name"+M+"*[*^$|!~]?="),a.querySelectorAll(":enabled").length||q.push(":enabled",":disabled"),a.querySelectorAll("*,:x"),q.push(",.*:")})),(c.matchesSelector=$.test(s=o.matches||o.webkitMatchesSelector||o.mozMatchesSelector||o.oMatchesSelector||o.msMatchesSelector))&&ib(function(a){c.disconnectedMatch=s.call(a,"div"),s.call(a,"[s!='']:x"),r.push("!=",Q)}),q=q.length&&new RegExp(q.join("|")),r=r.length&&new RegExp(r.join("|")),b=$.test(o.compareDocumentPosition),t=b||$.test(o.contains)?function(a,b){var c=9===a.nodeType?a.documentElement:a,d=b&&b.parentNode;return a===d||!(!d||1!==d.nodeType||!(c.contains?c.contains(d):a.compareDocumentPosition&&16&a.compareDocumentPosition(d)))}:function(a,b){if(b)while(b=b.parentNode)if(b===a)return!0;return!1},B=b?function(a,b){if(a===b)return l=!0,0;var d=!a.compareDocumentPosition-!b.compareDocumentPosition;return d?d:(d=(a.ownerDocument||a)===(b.ownerDocument||b)?a.compareDocumentPosition(b):1,1&d||!c.sortDetached&&b.compareDocumentPosition(a)===d?a===e||a.ownerDocument===v&&t(v,a)?-1:b===e||b.ownerDocument===v&&t(v,b)?1:k?K.call(k,a)-K.call(k,b):0:4&d?-1:1)}:function(a,b){if(a===b)return l=!0,0;var c,d=0,f=a.parentNode,g=b.parentNode,h=[a],i=[b];if(!f||!g)return a===e?-1:b===e?1:f?-1:g?1:k?K.call(k,a)-K.call(k,b):0;if(f===g)return kb(a,b);c=a;while(c=c.parentNode)h.unshift(c);c=b;while(c=c.parentNode)i.unshift(c);while(h[d]===i[d])d++;return d?kb(h[d],i[d]):h[d]===v?-1:i[d]===v?1:0},e):n},fb.matches=function(a,b){return fb(a,null,null,b)},fb.matchesSelector=function(a,b){if((a.ownerDocument||a)!==n&&m(a),b=b.replace(U,"='$1']"),!(!c.matchesSelector||!p||r&&r.test(b)||q&&q.test(b)))try{var d=s.call(a,b);if(d||c.disconnectedMatch||a.document&&11!==a.document.nodeType)return d}catch(e){}return fb(b,n,null,[a]).length>0},fb.contains=function(a,b){return(a.ownerDocument||a)!==n&&m(a),t(a,b)},fb.attr=function(a,b){(a.ownerDocument||a)!==n&&m(a);var e=d.attrHandle[b.toLowerCase()],f=e&&E.call(d.attrHandle,b.toLowerCase())?e(a,b,!p):void 0;return void 0!==f?f:c.attributes||!p?a.getAttribute(b):(f=a.getAttributeNode(b))&&f.specified?f.value:null},fb.error=function(a){throw new Error("Syntax error, unrecognized expression: "+a)},fb.uniqueSort=function(a){var b,d=[],e=0,f=0;if(l=!c.detectDuplicates,k=!c.sortStable&&a.slice(0),a.sort(B),l){while(b=a[f++])b===a[f]&&(e=d.push(f));while(e--)a.splice(d[e],1)}return k=null,a},e=fb.getText=function(a){var b,c="",d=0,f=a.nodeType;if(f){if(1===f||9===f||11===f){if("string"==typeof a.textContent)return a.textContent;for(a=a.firstChild;a;a=a.nextSibling)c+=e(a)}else if(3===f||4===f)return a.nodeValue}else while(b=a[d++])c+=e(b);return c},d=fb.selectors={cacheLength:50,createPseudo:hb,match:X,attrHandle:{},find:{},relative:{">":{dir:"parentNode",first:!0}," ":{dir:"parentNode"},"+":{dir:"previousSibling",first:!0},"~":{dir:"previousSibling"}},preFilter:{ATTR:function(a){return a[1]=a[1].replace(cb,db),a[3]=(a[3]||a[4]||a[5]||"").replace(cb,db),"~="===a[2]&&(a[3]=" "+a[3]+" "),a.slice(0,4)},CHILD:function(a){return a[1]=a[1].toLowerCase(),"nth"===a[1].slice(0,3)?(a[3]||fb.error(a[0]),a[4]=+(a[4]?a[5]+(a[6]||1):2*("even"===a[3]||"odd"===a[3])),a[5]=+(a[7]+a[8]||"odd"===a[3])):a[3]&&fb.error(a[0]),a},PSEUDO:function(a){var b,c=!a[6]&&a[2];return X.CHILD.test(a[0])?null:(a[3]?a[2]=a[4]||a[5]||"":c&&V.test(c)&&(b=g(c,!0))&&(b=c.indexOf(")",c.length-b)-c.length)&&(a[0]=a[0].slice(0,b),a[2]=c.slice(0,b)),a.slice(0,3))}},filter:{TAG:function(a){var b=a.replace(cb,db).toLowerCase();return"*"===a?function(){return!0}:function(a){return a.nodeName&&a.nodeName.toLowerCase()===b}},CLASS:function(a){var b=y[a+" "];return b||(b=new RegExp("(^|"+M+")"+a+"("+M+"|$)"))&&y(a,function(a){return b.test("string"==typeof a.className&&a.className||typeof a.getAttribute!==C&&a.getAttribute("class")||"")})},ATTR:function(a,b,c){return function(d){var e=fb.attr(d,a);return null==e?"!="===b:b?(e+="","="===b?e===c:"!="===b?e!==c:"^="===b?c&&0===e.indexOf(c):"*="===b?c&&e.indexOf(c)>-1:"$="===b?c&&e.slice(-c.length)===c:"~="===b?(" "+e+" ").indexOf(c)>-1:"|="===b?e===c||e.slice(0,c.length+1)===c+"-":!1):!0}},CHILD:function(a,b,c,d,e){var f="nth"!==a.slice(0,3),g="last"!==a.slice(-4),h="of-type"===b;return 1===d&&0===e?function(a){return!!a.parentNode}:function(b,c,i){var j,k,l,m,n,o,p=f!==g?"nextSibling":"previousSibling",q=b.parentNode,r=h&&b.nodeName.toLowerCase(),s=!i&&!h;if(q){if(f){while(p){l=b;while(l=l[p])if(h?l.nodeName.toLowerCase()===r:1===l.nodeType)return!1;o=p="only"===a&&!o&&"nextSibling"}return!0}if(o=[g?q.firstChild:q.lastChild],g&&s){k=q[u]||(q[u]={}),j=k[a]||[],n=j[0]===w&&j[1],m=j[0]===w&&j[2],l=n&&q.childNodes[n];while(l=++n&&l&&l[p]||(m=n=0)||o.pop())if(1===l.nodeType&&++m&&l===b){k[a]=[w,n,m];break}}else if(s&&(j=(b[u]||(b[u]={}))[a])&&j[0]===w)m=j[1];else while(l=++n&&l&&l[p]||(m=n=0)||o.pop())if((h?l.nodeName.toLowerCase()===r:1===l.nodeType)&&++m&&(s&&((l[u]||(l[u]={}))[a]=[w,m]),l===b))break;return m-=e,m===d||m%d===0&&m/d>=0}}},PSEUDO:function(a,b){var c,e=d.pseudos[a]||d.setFilters[a.toLowerCase()]||fb.error("unsupported pseudo: "+a);return e[u]?e(b):e.length>1?(c=[a,a,"",b],d.setFilters.hasOwnProperty(a.toLowerCase())?hb(function(a,c){var d,f=e(a,b),g=f.length;while(g--)d=K.call(a,f[g]),a[d]=!(c[d]=f[g])}):function(a){return e(a,0,c)}):e}},pseudos:{not:hb(function(a){var b=[],c=[],d=h(a.replace(R,"$1"));return d[u]?hb(function(a,b,c,e){var f,g=d(a,null,e,[]),h=a.length;while(h--)(f=g[h])&&(a[h]=!(b[h]=f))}):function(a,e,f){return b[0]=a,d(b,null,f,c),!c.pop()}}),has:hb(function(a){return function(b){return fb(a,b).length>0}}),contains:hb(function(a){return function(b){return(b.textContent||b.innerText||e(b)).indexOf(a)>-1}}),lang:hb(function(a){return W.test(a||"")||fb.error("unsupported lang: "+a),a=a.replace(cb,db).toLowerCase(),function(b){var c;do if(c=p?b.lang:b.getAttribute("xml:lang")||b.getAttribute("lang"))return c=c.toLowerCase(),c===a||0===c.indexOf(a+"-");while((b=b.parentNode)&&1===b.nodeType);return!1}}),target:function(b){var c=a.location&&a.location.hash;return c&&c.slice(1)===b.id},root:function(a){return a===o},focus:function(a){return a===n.activeElement&&(!n.hasFocus||n.hasFocus())&&!!(a.type||a.href||~a.tabIndex)},enabled:function(a){return a.disabled===!1},disabled:function(a){return a.disabled===!0},checked:function(a){var b=a.nodeName.toLowerCase();return"input"===b&&!!a.checked||"option"===b&&!!a.selected},selected:function(a){return a.parentNode&&a.parentNode.selectedIndex,a.selected===!0},empty:function(a){for(a=a.firstChild;a;a=a.nextSibling)if(a.nodeType<6)return!1;return!0},parent:function(a){return!d.pseudos.empty(a)},header:function(a){return Z.test(a.nodeName)},input:function(a){return Y.test(a.nodeName)},button:function(a){var b=a.nodeName.toLowerCase();return"input"===b&&"button"===a.type||"button"===b},text:function(a){var b;return"input"===a.nodeName.toLowerCase()&&"text"===a.type&&(null==(b=a.getAttribute("type"))||"text"===b.toLowerCase())},first:nb(function(){return[0]}),last:nb(function(a,b){return[b-1]}),eq:nb(function(a,b,c){return[0>c?c+b:c]}),even:nb(function(a,b){for(var c=0;b>c;c+=2)a.push(c);return a}),odd:nb(function(a,b){for(var c=1;b>c;c+=2)a.push(c);return a}),lt:nb(function(a,b,c){for(var d=0>c?c+b:c;--d>=0;)a.push(d);return a}),gt:nb(function(a,b,c){for(var d=0>c?c+b:c;++d<b;)a.push(d);return a})}},d.pseudos.nth=d.pseudos.eq;for(b in{radio:!0,checkbox:!0,file:!0,password:!0,image:!0})d.pseudos[b]=lb(b);for(b in{submit:!0,reset:!0})d.pseudos[b]=mb(b);function pb(){}pb.prototype=d.filters=d.pseudos,d.setFilters=new pb,g=fb.tokenize=function(a,b){var c,e,f,g,h,i,j,k=z[a+" "];if(k)return b?0:k.slice(0);h=a,i=[],j=d.preFilter;while(h){(!c||(e=S.exec(h)))&&(e&&(h=h.slice(e[0].length)||h),i.push(f=[])),c=!1,(e=T.exec(h))&&(c=e.shift(),f.push({value:c,type:e[0].replace(R," ")}),h=h.slice(c.length));for(g in d.filter)!(e=X[g].exec(h))||j[g]&&!(e=j[g](e))||(c=e.shift(),f.push({value:c,type:g,matches:e}),h=h.slice(c.length));if(!c)break}return b?h.length:h?fb.error(a):z(a,i).slice(0)};function qb(a){for(var b=0,c=a.length,d="";c>b;b++)d+=a[b].value;return d}function rb(a,b,c){var d=b.dir,e=c&&"parentNode"===d,f=x++;return b.first?function(b,c,f){while(b=b[d])if(1===b.nodeType||e)return a(b,c,f)}:function(b,c,g){var h,i,j=[w,f];if(g){while(b=b[d])if((1===b.nodeType||e)&&a(b,c,g))return!0}else while(b=b[d])if(1===b.nodeType||e){if(i=b[u]||(b[u]={}),(h=i[d])&&h[0]===w&&h[1]===f)return j[2]=h[2];if(i[d]=j,j[2]=a(b,c,g))return!0}}}function sb(a){return a.length>1?function(b,c,d){var e=a.length;while(e--)if(!a[e](b,c,d))return!1;return!0}:a[0]}function tb(a,b,c){for(var d=0,e=b.length;e>d;d++)fb(a,b[d],c);return c}function ub(a,b,c,d,e){for(var f,g=[],h=0,i=a.length,j=null!=b;i>h;h++)(f=a[h])&&(!c||c(f,d,e))&&(g.push(f),j&&b.push(h));return g}function vb(a,b,c,d,e,f){return d&&!d[u]&&(d=vb(d)),e&&!e[u]&&(e=vb(e,f)),hb(function(f,g,h,i){var j,k,l,m=[],n=[],o=g.length,p=f||tb(b||"*",h.nodeType?[h]:h,[]),q=!a||!f&&b?p:ub(p,m,a,h,i),r=c?e||(f?a:o||d)?[]:g:q;if(c&&c(q,r,h,i),d){j=ub(r,n),d(j,[],h,i),k=j.length;while(k--)(l=j[k])&&(r[n[k]]=!(q[n[k]]=l))}if(f){if(e||a){if(e){j=[],k=r.length;while(k--)(l=r[k])&&j.push(q[k]=l);e(null,r=[],j,i)}k=r.length;while(k--)(l=r[k])&&(j=e?K.call(f,l):m[k])>-1&&(f[j]=!(g[j]=l))}}else r=ub(r===g?r.splice(o,r.length):r),e?e(null,g,r,i):I.apply(g,r)})}function wb(a){for(var b,c,e,f=a.length,g=d.relative[a[0].type],h=g||d.relative[" "],i=g?1:0,k=rb(function(a){return a===b},h,!0),l=rb(function(a){return K.call(b,a)>-1},h,!0),m=[function(a,c,d){return!g&&(d||c!==j)||((b=c).nodeType?k(a,c,d):l(a,c,d))}];f>i;i++)if(c=d.relative[a[i].type])m=[rb(sb(m),c)];else{if(c=d.filter[a[i].type].apply(null,a[i].matches),c[u]){for(e=++i;f>e;e++)if(d.relative[a[e].type])break;return vb(i>1&&sb(m),i>1&&qb(a.slice(0,i-1).concat({value:" "===a[i-2].type?"*":""})).replace(R,"$1"),c,e>i&&wb(a.slice(i,e)),f>e&&wb(a=a.slice(e)),f>e&&qb(a))}m.push(c)}return sb(m)}function xb(a,b){var c=b.length>0,e=a.length>0,f=function(f,g,h,i,k){var l,m,o,p=0,q="0",r=f&&[],s=[],t=j,u=f||e&&d.find.TAG("*",k),v=w+=null==t?1:Math.random()||.1,x=u.length;for(k&&(j=g!==n&&g);q!==x&&null!=(l=u[q]);q++){if(e&&l){m=0;while(o=a[m++])if(o(l,g,h)){i.push(l);break}k&&(w=v)}c&&((l=!o&&l)&&p--,f&&r.push(l))}if(p+=q,c&&q!==p){m=0;while(o=b[m++])o(r,s,g,h);if(f){if(p>0)while(q--)r[q]||s[q]||(s[q]=G.call(i));s=ub(s)}I.apply(i,s),k&&!f&&s.length>0&&p+b.length>1&&fb.uniqueSort(i)}return k&&(w=v,j=t),r};return c?hb(f):f}return h=fb.compile=function(a,b){var c,d=[],e=[],f=A[a+" "];if(!f){b||(b=g(a)),c=b.length;while(c--)f=wb(b[c]),f[u]?d.push(f):e.push(f);f=A(a,xb(e,d)),f.selector=a}return f},i=fb.select=function(a,b,e,f){var i,j,k,l,m,n="function"==typeof a&&a,o=!f&&g(a=n.selector||a);if(e=e||[],1===o.length){if(j=o[0]=o[0].slice(0),j.length>2&&"ID"===(k=j[0]).type&&c.getById&&9===b.nodeType&&p&&d.relative[j[1].type]){if(b=(d.find.ID(k.matches[0].replace(cb,db),b)||[])[0],!b)return e;n&&(b=b.parentNode),a=a.slice(j.shift().value.length)}i=X.needsContext.test(a)?0:j.length;while(i--){if(k=j[i],d.relative[l=k.type])break;if((m=d.find[l])&&(f=m(k.matches[0].replace(cb,db),ab.test(j[0].type)&&ob(b.parentNode)||b))){if(j.splice(i,1),a=f.length&&qb(j),!a)return I.apply(e,f),e;break}}}return(n||h(a,o))(f,b,!p,e,ab.test(a)&&ob(b.parentNode)||b),e},c.sortStable=u.split("").sort(B).join("")===u,c.detectDuplicates=!!l,m(),c.sortDetached=ib(function(a){return 1&a.compareDocumentPosition(n.createElement("div"))}),ib(function(a){return a.innerHTML="<a href='#'></a>","#"===a.firstChild.getAttribute("href")})||jb("type|href|height|width",function(a,b,c){return c?void 0:a.getAttribute(b,"type"===b.toLowerCase()?1:2)}),c.attributes&&ib(function(a){return a.innerHTML="<input/>",a.firstChild.setAttribute("value",""),""===a.firstChild.getAttribute("value")})||jb("value",function(a,b,c){return c||"input"!==a.nodeName.toLowerCase()?void 0:a.defaultValue}),ib(function(a){return null==a.getAttribute("disabled")})||jb(L,function(a,b,c){var d;return c?void 0:a[b]===!0?b.toLowerCase():(d=a.getAttributeNode(b))&&d.specified?d.value:null}),fb}(a);n.find=t,n.expr=t.selectors,n.expr[":"]=n.expr.pseudos,n.unique=t.uniqueSort,n.text=t.getText,n.isXMLDoc=t.isXML,n.contains=t.contains;var u=n.expr.match.needsContext,v=/^<(\w+)\s*\/?>(?:<\/\1>|)$/,w=/^.[^:#\[\.,]*$/;function x(a,b,c){if(n.isFunction(b))return n.grep(a,function(a,d){return!!b.call(a,d,a)!==c});if(b.nodeType)return n.grep(a,function(a){return a===b!==c});if("string"==typeof b){if(w.test(b))return n.filter(b,a,c);b=n.filter(b,a)}return n.grep(a,function(a){return g.call(b,a)>=0!==c})}n.filter=function(a,b,c){var d=b[0];return c&&(a=":not("+a+")"),1===b.length&&1===d.nodeType?n.find.matchesSelector(d,a)?[d]:[]:n.find.matches(a,n.grep(b,function(a){return 1===a.nodeType}))},n.fn.extend({find:function(a){var b,c=this.length,d=[],e=this;if("string"!=typeof a)return this.pushStack(n(a).filter(function(){for(b=0;c>b;b++)if(n.contains(e[b],this))return!0}));for(b=0;c>b;b++)n.find(a,e[b],d);return d=this.pushStack(c>1?n.unique(d):d),d.selector=this.selector?this.selector+" "+a:a,d},filter:function(a){return this.pushStack(x(this,a||[],!1))},not:function(a){return this.pushStack(x(this,a||[],!0))},is:function(a){return!!x(this,"string"==typeof a&&u.test(a)?n(a):a||[],!1).length}});var y,z=/^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/,A=n.fn.init=function(a,b){var c,d;if(!a)return this;if("string"==typeof a){if(c="<"===a[0]&&">"===a[a.length-1]&&a.length>=3?[null,a,null]:z.exec(a),!c||!c[1]&&b)return!b||b.jquery?(b||y).find(a):this.constructor(b).find(a);if(c[1]){if(b=b instanceof n?b[0]:b,n.merge(this,n.parseHTML(c[1],b&&b.nodeType?b.ownerDocument||b:l,!0)),v.test(c[1])&&n.isPlainObject(b))for(c in b)n.isFunction(this[c])?this[c](b[c]):this.attr(c,b[c]);return this}return d=l.getElementById(c[2]),d&&d.parentNode&&(this.length=1,this[0]=d),this.context=l,this.selector=a,this}return a.nodeType?(this.context=this[0]=a,this.length=1,this):n.isFunction(a)?"undefined"!=typeof y.ready?y.ready(a):a(n):(void 0!==a.selector&&(this.selector=a.selector,this.context=a.context),n.makeArray(a,this))};A.prototype=n.fn,y=n(l);var B=/^(?:parents|prev(?:Until|All))/,C={children:!0,contents:!0,next:!0,prev:!0};n.extend({dir:function(a,b,c){var d=[],e=void 0!==c;while((a=a[b])&&9!==a.nodeType)if(1===a.nodeType){if(e&&n(a).is(c))break;d.push(a)}return d},sibling:function(a,b){for(var c=[];a;a=a.nextSibling)1===a.nodeType&&a!==b&&c.push(a);return c}}),n.fn.extend({has:function(a){var b=n(a,this),c=b.length;return this.filter(function(){for(var a=0;c>a;a++)if(n.contains(this,b[a]))return!0})},closest:function(a,b){for(var c,d=0,e=this.length,f=[],g=u.test(a)||"string"!=typeof a?n(a,b||this.context):0;e>d;d++)for(c=this[d];c&&c!==b;c=c.parentNode)if(c.nodeType<11&&(g?g.index(c)>-1:1===c.nodeType&&n.find.matchesSelector(c,a))){f.push(c);break}return this.pushStack(f.length>1?n.unique(f):f)},index:function(a){return a?"string"==typeof a?g.call(n(a),this[0]):g.call(this,a.jquery?a[0]:a):this[0]&&this[0].parentNode?this.first().prevAll().length:-1},add:function(a,b){return this.pushStack(n.unique(n.merge(this.get(),n(a,b))))},addBack:function(a){return this.add(null==a?this.prevObject:this.prevObject.filter(a))}});function D(a,b){while((a=a[b])&&1!==a.nodeType);return a}n.each({parent:function(a){var b=a.parentNode;return b&&11!==b.nodeType?b:null},parents:function(a){return n.dir(a,"parentNode")},parentsUntil:function(a,b,c){return n.dir(a,"parentNode",c)},next:function(a){return D(a,"nextSibling")},prev:function(a){return D(a,"previousSibling")},nextAll:function(a){return n.dir(a,"nextSibling")},prevAll:function(a){return n.dir(a,"previousSibling")},nextUntil:function(a,b,c){return n.dir(a,"nextSibling",c)},prevUntil:function(a,b,c){return n.dir(a,"previousSibling",c)},siblings:function(a){return n.sibling((a.parentNode||{}).firstChild,a)},children:function(a){return n.sibling(a.firstChild)},contents:function(a){return a.contentDocument||n.merge([],a.childNodes)}},function(a,b){n.fn[a]=function(c,d){var e=n.map(this,b,c);return"Until"!==a.slice(-5)&&(d=c),d&&"string"==typeof d&&(e=n.filter(d,e)),this.length>1&&(C[a]||n.unique(e),B.test(a)&&e.reverse()),this.pushStack(e)}});var E=/\S+/g,F={};function G(a){var b=F[a]={};return n.each(a.match(E)||[],function(a,c){b[c]=!0}),b}n.Callbacks=function(a){a="string"==typeof a?F[a]||G(a):n.extend({},a);var b,c,d,e,f,g,h=[],i=!a.once&&[],j=function(l){for(b=a.memory&&l,c=!0,g=e||0,e=0,f=h.length,d=!0;h&&f>g;g++)if(h[g].apply(l[0],l[1])===!1&&a.stopOnFalse){b=!1;break}d=!1,h&&(i?i.length&&j(i.shift()):b?h=[]:k.disable())},k={add:function(){if(h){var c=h.length;!function g(b){n.each(b,function(b,c){var d=n.type(c);"function"===d?a.unique&&k.has(c)||h.push(c):c&&c.length&&"string"!==d&&g(c)})}(arguments),d?f=h.length:b&&(e=c,j(b))}return this},remove:function(){return h&&n.each(arguments,function(a,b){var c;while((c=n.inArray(b,h,c))>-1)h.splice(c,1),d&&(f>=c&&f--,g>=c&&g--)}),this},has:function(a){return a?n.inArray(a,h)>-1:!(!h||!h.length)},empty:function(){return h=[],f=0,this},disable:function(){return h=i=b=void 0,this},disabled:function(){return!h},lock:function(){return i=void 0,b||k.disable(),this},locked:function(){return!i},fireWith:function(a,b){return!h||c&&!i||(b=b||[],b=[a,b.slice?b.slice():b],d?i.push(b):j(b)),this},fire:function(){return k.fireWith(this,arguments),this},fired:function(){return!!c}};return k},n.extend({Deferred:function(a){var b=[["resolve","done",n.Callbacks("once memory"),"resolved"],["reject","fail",n.Callbacks("once memory"),"rejected"],["notify","progress",n.Callbacks("memory")]],c="pending",d={state:function(){return c},always:function(){return e.done(arguments).fail(arguments),this},then:function(){var a=arguments;return n.Deferred(function(c){n.each(b,function(b,f){var g=n.isFunction(a[b])&&a[b];e[f[1]](function(){var a=g&&g.apply(this,arguments);a&&n.isFunction(a.promise)?a.promise().done(c.resolve).fail(c.reject).progress(c.notify):c[f[0]+"With"](this===d?c.promise():this,g?[a]:arguments)})}),a=null}).promise()},promise:function(a){return null!=a?n.extend(a,d):d}},e={};return d.pipe=d.then,n.each(b,function(a,f){var g=f[2],h=f[3];d[f[1]]=g.add,h&&g.add(function(){c=h},b[1^a][2].disable,b[2][2].lock),e[f[0]]=function(){return e[f[0]+"With"](this===e?d:this,arguments),this},e[f[0]+"With"]=g.fireWith}),d.promise(e),a&&a.call(e,e),e},when:function(a){var b=0,c=d.call(arguments),e=c.length,f=1!==e||a&&n.isFunction(a.promise)?e:0,g=1===f?a:n.Deferred(),h=function(a,b,c){return function(e){b[a]=this,c[a]=arguments.length>1?d.call(arguments):e,c===i?g.notifyWith(b,c):--f||g.resolveWith(b,c)}},i,j,k;if(e>1)for(i=new Array(e),j=new Array(e),k=new Array(e);e>b;b++)c[b]&&n.isFunction(c[b].promise)?c[b].promise().done(h(b,k,c)).fail(g.reject).progress(h(b,j,i)):--f;return f||g.resolveWith(k,c),g.promise()}});var H;n.fn.ready=function(a){return n.ready.promise().done(a),this},n.extend({isReady:!1,readyWait:1,holdReady:function(a){a?n.readyWait++:n.ready(!0)},ready:function(a){(a===!0?--n.readyWait:n.isReady)||(n.isReady=!0,a!==!0&&--n.readyWait>0||(H.resolveWith(l,[n]),n.fn.triggerHandler&&(n(l).triggerHandler("ready"),n(l).off("ready"))))}});function I(){l.removeEventListener("DOMContentLoaded",I,!1),a.removeEventListener("load",I,!1),n.ready()}n.ready.promise=function(b){return H||(H=n.Deferred(),"complete"===l.readyState?setTimeout(n.ready):(l.addEventListener("DOMContentLoaded",I,!1),a.addEventListener("load",I,!1))),H.promise(b)},n.ready.promise();var J=n.access=function(a,b,c,d,e,f,g){var h=0,i=a.length,j=null==c;if("object"===n.type(c)){e=!0;for(h in c)n.access(a,b,h,c[h],!0,f,g)}else if(void 0!==d&&(e=!0,n.isFunction(d)||(g=!0),j&&(g?(b.call(a,d),b=null):(j=b,b=function(a,b,c){return j.call(n(a),c)})),b))for(;i>h;h++)b(a[h],c,g?d:d.call(a[h],h,b(a[h],c)));return e?a:j?b.call(a):i?b(a[0],c):f};n.acceptData=function(a){return 1===a.nodeType||9===a.nodeType||!+a.nodeType};function K(){Object.defineProperty(this.cache={},0,{get:function(){return{}}}),this.expando=n.expando+Math.random()}K.uid=1,K.accepts=n.acceptData,K.prototype={key:function(a){if(!K.accepts(a))return 0;var b={},c=a[this.expando];if(!c){c=K.uid++;try{b[this.expando]={value:c},Object.defineProperties(a,b)}catch(d){b[this.expando]=c,n.extend(a,b)}}return this.cache[c]||(this.cache[c]={}),c},set:function(a,b,c){var d,e=this.key(a),f=this.cache[e];if("string"==typeof b)f[b]=c;else if(n.isEmptyObject(f))n.extend(this.cache[e],b);else for(d in b)f[d]=b[d];return f},get:function(a,b){var c=this.cache[this.key(a)];return void 0===b?c:c[b]},access:function(a,b,c){var d;return void 0===b||b&&"string"==typeof b&&void 0===c?(d=this.get(a,b),void 0!==d?d:this.get(a,n.camelCase(b))):(this.set(a,b,c),void 0!==c?c:b)},remove:function(a,b){var c,d,e,f=this.key(a),g=this.cache[f];if(void 0===b)this.cache[f]={};else{n.isArray(b)?d=b.concat(b.map(n.camelCase)):(e=n.camelCase(b),b in g?d=[b,e]:(d=e,d=d in g?[d]:d.match(E)||[])),c=d.length;while(c--)delete g[d[c]]}},hasData:function(a){return!n.isEmptyObject(this.cache[a[this.expando]]||{})},discard:function(a){a[this.expando]&&delete this.cache[a[this.expando]]}};var L=new K,M=new K,N=/^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,O=/([A-Z])/g;function P(a,b,c){var d;if(void 0===c&&1===a.nodeType)if(d="data-"+b.replace(O,"-$1").toLowerCase(),c=a.getAttribute(d),"string"==typeof c){try{c="true"===c?!0:"false"===c?!1:"null"===c?null:+c+""===c?+c:N.test(c)?n.parseJSON(c):c}catch(e){}M.set(a,b,c)}else c=void 0;return c}n.extend({hasData:function(a){return M.hasData(a)||L.hasData(a)},data:function(a,b,c){return M.access(a,b,c)},removeData:function(a,b){M.remove(a,b)
},_data:function(a,b,c){return L.access(a,b,c)},_removeData:function(a,b){L.remove(a,b)}}),n.fn.extend({data:function(a,b){var c,d,e,f=this[0],g=f&&f.attributes;if(void 0===a){if(this.length&&(e=M.get(f),1===f.nodeType&&!L.get(f,"hasDataAttrs"))){c=g.length;while(c--)g[c]&&(d=g[c].name,0===d.indexOf("data-")&&(d=n.camelCase(d.slice(5)),P(f,d,e[d])));L.set(f,"hasDataAttrs",!0)}return e}return"object"==typeof a?this.each(function(){M.set(this,a)}):J(this,function(b){var c,d=n.camelCase(a);if(f&&void 0===b){if(c=M.get(f,a),void 0!==c)return c;if(c=M.get(f,d),void 0!==c)return c;if(c=P(f,d,void 0),void 0!==c)return c}else this.each(function(){var c=M.get(this,d);M.set(this,d,b),-1!==a.indexOf("-")&&void 0!==c&&M.set(this,a,b)})},null,b,arguments.length>1,null,!0)},removeData:function(a){return this.each(function(){M.remove(this,a)})}}),n.extend({queue:function(a,b,c){var d;return a?(b=(b||"fx")+"queue",d=L.get(a,b),c&&(!d||n.isArray(c)?d=L.access(a,b,n.makeArray(c)):d.push(c)),d||[]):void 0},dequeue:function(a,b){b=b||"fx";var c=n.queue(a,b),d=c.length,e=c.shift(),f=n._queueHooks(a,b),g=function(){n.dequeue(a,b)};"inprogress"===e&&(e=c.shift(),d--),e&&("fx"===b&&c.unshift("inprogress"),delete f.stop,e.call(a,g,f)),!d&&f&&f.empty.fire()},_queueHooks:function(a,b){var c=b+"queueHooks";return L.get(a,c)||L.access(a,c,{empty:n.Callbacks("once memory").add(function(){L.remove(a,[b+"queue",c])})})}}),n.fn.extend({queue:function(a,b){var c=2;return"string"!=typeof a&&(b=a,a="fx",c--),arguments.length<c?n.queue(this[0],a):void 0===b?this:this.each(function(){var c=n.queue(this,a,b);n._queueHooks(this,a),"fx"===a&&"inprogress"!==c[0]&&n.dequeue(this,a)})},dequeue:function(a){return this.each(function(){n.dequeue(this,a)})},clearQueue:function(a){return this.queue(a||"fx",[])},promise:function(a,b){var c,d=1,e=n.Deferred(),f=this,g=this.length,h=function(){--d||e.resolveWith(f,[f])};"string"!=typeof a&&(b=a,a=void 0),a=a||"fx";while(g--)c=L.get(f[g],a+"queueHooks"),c&&c.empty&&(d++,c.empty.add(h));return h(),e.promise(b)}});var Q=/[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source,R=["Top","Right","Bottom","Left"],S=function(a,b){return a=b||a,"none"===n.css(a,"display")||!n.contains(a.ownerDocument,a)},T=/^(?:checkbox|radio)$/i;!function(){var a=l.createDocumentFragment(),b=a.appendChild(l.createElement("div")),c=l.createElement("input");c.setAttribute("type","radio"),c.setAttribute("checked","checked"),c.setAttribute("name","t"),b.appendChild(c),k.checkClone=b.cloneNode(!0).cloneNode(!0).lastChild.checked,b.innerHTML="<textarea>x</textarea>",k.noCloneChecked=!!b.cloneNode(!0).lastChild.defaultValue}();var U="undefined";k.focusinBubbles="onfocusin"in a;var V=/^key/,W=/^(?:mouse|pointer|contextmenu)|click/,X=/^(?:focusinfocus|focusoutblur)$/,Y=/^([^.]*)(?:\.(.+)|)$/;function Z(){return!0}function $(){return!1}function _(){try{return l.activeElement}catch(a){}}n.event={global:{},add:function(a,b,c,d,e){var f,g,h,i,j,k,l,m,o,p,q,r=L.get(a);if(r){c.handler&&(f=c,c=f.handler,e=f.selector),c.guid||(c.guid=n.guid++),(i=r.events)||(i=r.events={}),(g=r.handle)||(g=r.handle=function(b){return typeof n!==U&&n.event.triggered!==b.type?n.event.dispatch.apply(a,arguments):void 0}),b=(b||"").match(E)||[""],j=b.length;while(j--)h=Y.exec(b[j])||[],o=q=h[1],p=(h[2]||"").split(".").sort(),o&&(l=n.event.special[o]||{},o=(e?l.delegateType:l.bindType)||o,l=n.event.special[o]||{},k=n.extend({type:o,origType:q,data:d,handler:c,guid:c.guid,selector:e,needsContext:e&&n.expr.match.needsContext.test(e),namespace:p.join(".")},f),(m=i[o])||(m=i[o]=[],m.delegateCount=0,l.setup&&l.setup.call(a,d,p,g)!==!1||a.addEventListener&&a.addEventListener(o,g,!1)),l.add&&(l.add.call(a,k),k.handler.guid||(k.handler.guid=c.guid)),e?m.splice(m.delegateCount++,0,k):m.push(k),n.event.global[o]=!0)}},remove:function(a,b,c,d,e){var f,g,h,i,j,k,l,m,o,p,q,r=L.hasData(a)&&L.get(a);if(r&&(i=r.events)){b=(b||"").match(E)||[""],j=b.length;while(j--)if(h=Y.exec(b[j])||[],o=q=h[1],p=(h[2]||"").split(".").sort(),o){l=n.event.special[o]||{},o=(d?l.delegateType:l.bindType)||o,m=i[o]||[],h=h[2]&&new RegExp("(^|\\.)"+p.join("\\.(?:.*\\.|)")+"(\\.|$)"),g=f=m.length;while(f--)k=m[f],!e&&q!==k.origType||c&&c.guid!==k.guid||h&&!h.test(k.namespace)||d&&d!==k.selector&&("**"!==d||!k.selector)||(m.splice(f,1),k.selector&&m.delegateCount--,l.remove&&l.remove.call(a,k));g&&!m.length&&(l.teardown&&l.teardown.call(a,p,r.handle)!==!1||n.removeEvent(a,o,r.handle),delete i[o])}else for(o in i)n.event.remove(a,o+b[j],c,d,!0);n.isEmptyObject(i)&&(delete r.handle,L.remove(a,"events"))}},trigger:function(b,c,d,e){var f,g,h,i,k,m,o,p=[d||l],q=j.call(b,"type")?b.type:b,r=j.call(b,"namespace")?b.namespace.split("."):[];if(g=h=d=d||l,3!==d.nodeType&&8!==d.nodeType&&!X.test(q+n.event.triggered)&&(q.indexOf(".")>=0&&(r=q.split("."),q=r.shift(),r.sort()),k=q.indexOf(":")<0&&"on"+q,b=b[n.expando]?b:new n.Event(q,"object"==typeof b&&b),b.isTrigger=e?2:3,b.namespace=r.join("."),b.namespace_re=b.namespace?new RegExp("(^|\\.)"+r.join("\\.(?:.*\\.|)")+"(\\.|$)"):null,b.result=void 0,b.target||(b.target=d),c=null==c?[b]:n.makeArray(c,[b]),o=n.event.special[q]||{},e||!o.trigger||o.trigger.apply(d,c)!==!1)){if(!e&&!o.noBubble&&!n.isWindow(d)){for(i=o.delegateType||q,X.test(i+q)||(g=g.parentNode);g;g=g.parentNode)p.push(g),h=g;h===(d.ownerDocument||l)&&p.push(h.defaultView||h.parentWindow||a)}f=0;while((g=p[f++])&&!b.isPropagationStopped())b.type=f>1?i:o.bindType||q,m=(L.get(g,"events")||{})[b.type]&&L.get(g,"handle"),m&&m.apply(g,c),m=k&&g[k],m&&m.apply&&n.acceptData(g)&&(b.result=m.apply(g,c),b.result===!1&&b.preventDefault());return b.type=q,e||b.isDefaultPrevented()||o._default&&o._default.apply(p.pop(),c)!==!1||!n.acceptData(d)||k&&n.isFunction(d[q])&&!n.isWindow(d)&&(h=d[k],h&&(d[k]=null),n.event.triggered=q,d[q](),n.event.triggered=void 0,h&&(d[k]=h)),b.result}},dispatch:function(a){a=n.event.fix(a);var b,c,e,f,g,h=[],i=d.call(arguments),j=(L.get(this,"events")||{})[a.type]||[],k=n.event.special[a.type]||{};if(i[0]=a,a.delegateTarget=this,!k.preDispatch||k.preDispatch.call(this,a)!==!1){h=n.event.handlers.call(this,a,j),b=0;while((f=h[b++])&&!a.isPropagationStopped()){a.currentTarget=f.elem,c=0;while((g=f.handlers[c++])&&!a.isImmediatePropagationStopped())(!a.namespace_re||a.namespace_re.test(g.namespace))&&(a.handleObj=g,a.data=g.data,e=((n.event.special[g.origType]||{}).handle||g.handler).apply(f.elem,i),void 0!==e&&(a.result=e)===!1&&(a.preventDefault(),a.stopPropagation()))}return k.postDispatch&&k.postDispatch.call(this,a),a.result}},handlers:function(a,b){var c,d,e,f,g=[],h=b.delegateCount,i=a.target;if(h&&i.nodeType&&(!a.button||"click"!==a.type))for(;i!==this;i=i.parentNode||this)if(i.disabled!==!0||"click"!==a.type){for(d=[],c=0;h>c;c++)f=b[c],e=f.selector+" ",void 0===d[e]&&(d[e]=f.needsContext?n(e,this).index(i)>=0:n.find(e,this,null,[i]).length),d[e]&&d.push(f);d.length&&g.push({elem:i,handlers:d})}return h<b.length&&g.push({elem:this,handlers:b.slice(h)}),g},props:"altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),fixHooks:{},keyHooks:{props:"char charCode key keyCode".split(" "),filter:function(a,b){return null==a.which&&(a.which=null!=b.charCode?b.charCode:b.keyCode),a}},mouseHooks:{props:"button buttons clientX clientY offsetX offsetY pageX pageY screenX screenY toElement".split(" "),filter:function(a,b){var c,d,e,f=b.button;return null==a.pageX&&null!=b.clientX&&(c=a.target.ownerDocument||l,d=c.documentElement,e=c.body,a.pageX=b.clientX+(d&&d.scrollLeft||e&&e.scrollLeft||0)-(d&&d.clientLeft||e&&e.clientLeft||0),a.pageY=b.clientY+(d&&d.scrollTop||e&&e.scrollTop||0)-(d&&d.clientTop||e&&e.clientTop||0)),a.which||void 0===f||(a.which=1&f?1:2&f?3:4&f?2:0),a}},fix:function(a){if(a[n.expando])return a;var b,c,d,e=a.type,f=a,g=this.fixHooks[e];g||(this.fixHooks[e]=g=W.test(e)?this.mouseHooks:V.test(e)?this.keyHooks:{}),d=g.props?this.props.concat(g.props):this.props,a=new n.Event(f),b=d.length;while(b--)c=d[b],a[c]=f[c];return a.target||(a.target=l),3===a.target.nodeType&&(a.target=a.target.parentNode),g.filter?g.filter(a,f):a},special:{load:{noBubble:!0},focus:{trigger:function(){return this!==_()&&this.focus?(this.focus(),!1):void 0},delegateType:"focusin"},blur:{trigger:function(){return this===_()&&this.blur?(this.blur(),!1):void 0},delegateType:"focusout"},click:{trigger:function(){return"checkbox"===this.type&&this.click&&n.nodeName(this,"input")?(this.click(),!1):void 0},_default:function(a){return n.nodeName(a.target,"a")}},beforeunload:{postDispatch:function(a){void 0!==a.result&&a.originalEvent&&(a.originalEvent.returnValue=a.result)}}},simulate:function(a,b,c,d){var e=n.extend(new n.Event,c,{type:a,isSimulated:!0,originalEvent:{}});d?n.event.trigger(e,null,b):n.event.dispatch.call(b,e),e.isDefaultPrevented()&&c.preventDefault()}},n.removeEvent=function(a,b,c){a.removeEventListener&&a.removeEventListener(b,c,!1)},n.Event=function(a,b){return this instanceof n.Event?(a&&a.type?(this.originalEvent=a,this.type=a.type,this.isDefaultPrevented=a.defaultPrevented||void 0===a.defaultPrevented&&a.returnValue===!1?Z:$):this.type=a,b&&n.extend(this,b),this.timeStamp=a&&a.timeStamp||n.now(),void(this[n.expando]=!0)):new n.Event(a,b)},n.Event.prototype={isDefaultPrevented:$,isPropagationStopped:$,isImmediatePropagationStopped:$,preventDefault:function(){var a=this.originalEvent;this.isDefaultPrevented=Z,a&&a.preventDefault&&a.preventDefault()},stopPropagation:function(){var a=this.originalEvent;this.isPropagationStopped=Z,a&&a.stopPropagation&&a.stopPropagation()},stopImmediatePropagation:function(){var a=this.originalEvent;this.isImmediatePropagationStopped=Z,a&&a.stopImmediatePropagation&&a.stopImmediatePropagation(),this.stopPropagation()}},n.each({mouseenter:"mouseover",mouseleave:"mouseout",pointerenter:"pointerover",pointerleave:"pointerout"},function(a,b){n.event.special[a]={delegateType:b,bindType:b,handle:function(a){var c,d=this,e=a.relatedTarget,f=a.handleObj;return(!e||e!==d&&!n.contains(d,e))&&(a.type=f.origType,c=f.handler.apply(this,arguments),a.type=b),c}}}),k.focusinBubbles||n.each({focus:"focusin",blur:"focusout"},function(a,b){var c=function(a){n.event.simulate(b,a.target,n.event.fix(a),!0)};n.event.special[b]={setup:function(){var d=this.ownerDocument||this,e=L.access(d,b);e||d.addEventListener(a,c,!0),L.access(d,b,(e||0)+1)},teardown:function(){var d=this.ownerDocument||this,e=L.access(d,b)-1;e?L.access(d,b,e):(d.removeEventListener(a,c,!0),L.remove(d,b))}}}),n.fn.extend({on:function(a,b,c,d,e){var f,g;if("object"==typeof a){"string"!=typeof b&&(c=c||b,b=void 0);for(g in a)this.on(g,b,c,a[g],e);return this}if(null==c&&null==d?(d=b,c=b=void 0):null==d&&("string"==typeof b?(d=c,c=void 0):(d=c,c=b,b=void 0)),d===!1)d=$;else if(!d)return this;return 1===e&&(f=d,d=function(a){return n().off(a),f.apply(this,arguments)},d.guid=f.guid||(f.guid=n.guid++)),this.each(function(){n.event.add(this,a,d,c,b)})},one:function(a,b,c,d){return this.on(a,b,c,d,1)},off:function(a,b,c){var d,e;if(a&&a.preventDefault&&a.handleObj)return d=a.handleObj,n(a.delegateTarget).off(d.namespace?d.origType+"."+d.namespace:d.origType,d.selector,d.handler),this;if("object"==typeof a){for(e in a)this.off(e,b,a[e]);return this}return(b===!1||"function"==typeof b)&&(c=b,b=void 0),c===!1&&(c=$),this.each(function(){n.event.remove(this,a,c,b)})},trigger:function(a,b){return this.each(function(){n.event.trigger(a,b,this)})},triggerHandler:function(a,b){var c=this[0];return c?n.event.trigger(a,b,c,!0):void 0}});var ab=/<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,bb=/<([\w:]+)/,cb=/<|&#?\w+;/,db=/<(?:script|style|link)/i,eb=/checked\s*(?:[^=]|=\s*.checked.)/i,fb=/^$|\/(?:java|ecma)script/i,gb=/^true\/(.*)/,hb=/^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g,ib={option:[1,"<select multiple='multiple'>","</select>"],thead:[1,"<table>","</table>"],col:[2,"<table><colgroup>","</colgroup></table>"],tr:[2,"<table><tbody>","</tbody></table>"],td:[3,"<table><tbody><tr>","</tr></tbody></table>"],_default:[0,"",""]};ib.optgroup=ib.option,ib.tbody=ib.tfoot=ib.colgroup=ib.caption=ib.thead,ib.th=ib.td;function jb(a,b){return n.nodeName(a,"table")&&n.nodeName(11!==b.nodeType?b:b.firstChild,"tr")?a.getElementsByTagName("tbody")[0]||a.appendChild(a.ownerDocument.createElement("tbody")):a}function kb(a){return a.type=(null!==a.getAttribute("type"))+"/"+a.type,a}function lb(a){var b=gb.exec(a.type);return b?a.type=b[1]:a.removeAttribute("type"),a}function mb(a,b){for(var c=0,d=a.length;d>c;c++)L.set(a[c],"globalEval",!b||L.get(b[c],"globalEval"))}function nb(a,b){var c,d,e,f,g,h,i,j;if(1===b.nodeType){if(L.hasData(a)&&(f=L.access(a),g=L.set(b,f),j=f.events)){delete g.handle,g.events={};for(e in j)for(c=0,d=j[e].length;d>c;c++)n.event.add(b,e,j[e][c])}M.hasData(a)&&(h=M.access(a),i=n.extend({},h),M.set(b,i))}}function ob(a,b){var c=a.getElementsByTagName?a.getElementsByTagName(b||"*"):a.querySelectorAll?a.querySelectorAll(b||"*"):[];return void 0===b||b&&n.nodeName(a,b)?n.merge([a],c):c}function pb(a,b){var c=b.nodeName.toLowerCase();"input"===c&&T.test(a.type)?b.checked=a.checked:("input"===c||"textarea"===c)&&(b.defaultValue=a.defaultValue)}n.extend({clone:function(a,b,c){var d,e,f,g,h=a.cloneNode(!0),i=n.contains(a.ownerDocument,a);if(!(k.noCloneChecked||1!==a.nodeType&&11!==a.nodeType||n.isXMLDoc(a)))for(g=ob(h),f=ob(a),d=0,e=f.length;e>d;d++)pb(f[d],g[d]);if(b)if(c)for(f=f||ob(a),g=g||ob(h),d=0,e=f.length;e>d;d++)nb(f[d],g[d]);else nb(a,h);return g=ob(h,"script"),g.length>0&&mb(g,!i&&ob(a,"script")),h},buildFragment:function(a,b,c,d){for(var e,f,g,h,i,j,k=b.createDocumentFragment(),l=[],m=0,o=a.length;o>m;m++)if(e=a[m],e||0===e)if("object"===n.type(e))n.merge(l,e.nodeType?[e]:e);else if(cb.test(e)){f=f||k.appendChild(b.createElement("div")),g=(bb.exec(e)||["",""])[1].toLowerCase(),h=ib[g]||ib._default,f.innerHTML=h[1]+e.replace(ab,"<$1></$2>")+h[2],j=h[0];while(j--)f=f.lastChild;n.merge(l,f.childNodes),f=k.firstChild,f.textContent=""}else l.push(b.createTextNode(e));k.textContent="",m=0;while(e=l[m++])if((!d||-1===n.inArray(e,d))&&(i=n.contains(e.ownerDocument,e),f=ob(k.appendChild(e),"script"),i&&mb(f),c)){j=0;while(e=f[j++])fb.test(e.type||"")&&c.push(e)}return k},cleanData:function(a){for(var b,c,d,e,f=n.event.special,g=0;void 0!==(c=a[g]);g++){if(n.acceptData(c)&&(e=c[L.expando],e&&(b=L.cache[e]))){if(b.events)for(d in b.events)f[d]?n.event.remove(c,d):n.removeEvent(c,d,b.handle);L.cache[e]&&delete L.cache[e]}delete M.cache[c[M.expando]]}}}),n.fn.extend({text:function(a){return J(this,function(a){return void 0===a?n.text(this):this.empty().each(function(){(1===this.nodeType||11===this.nodeType||9===this.nodeType)&&(this.textContent=a)})},null,a,arguments.length)},append:function(){return this.domManip(arguments,function(a){if(1===this.nodeType||11===this.nodeType||9===this.nodeType){var b=jb(this,a);b.appendChild(a)}})},prepend:function(){return this.domManip(arguments,function(a){if(1===this.nodeType||11===this.nodeType||9===this.nodeType){var b=jb(this,a);b.insertBefore(a,b.firstChild)}})},before:function(){return this.domManip(arguments,function(a){this.parentNode&&this.parentNode.insertBefore(a,this)})},after:function(){return this.domManip(arguments,function(a){this.parentNode&&this.parentNode.insertBefore(a,this.nextSibling)})},remove:function(a,b){for(var c,d=a?n.filter(a,this):this,e=0;null!=(c=d[e]);e++)b||1!==c.nodeType||n.cleanData(ob(c)),c.parentNode&&(b&&n.contains(c.ownerDocument,c)&&mb(ob(c,"script")),c.parentNode.removeChild(c));return this},empty:function(){for(var a,b=0;null!=(a=this[b]);b++)1===a.nodeType&&(n.cleanData(ob(a,!1)),a.textContent="");return this},clone:function(a,b){return a=null==a?!1:a,b=null==b?a:b,this.map(function(){return n.clone(this,a,b)})},html:function(a){return J(this,function(a){var b=this[0]||{},c=0,d=this.length;if(void 0===a&&1===b.nodeType)return b.innerHTML;if("string"==typeof a&&!db.test(a)&&!ib[(bb.exec(a)||["",""])[1].toLowerCase()]){a=a.replace(ab,"<$1></$2>");try{for(;d>c;c++)b=this[c]||{},1===b.nodeType&&(n.cleanData(ob(b,!1)),b.innerHTML=a);b=0}catch(e){}}b&&this.empty().append(a)},null,a,arguments.length)},replaceWith:function(){var a=arguments[0];return this.domManip(arguments,function(b){a=this.parentNode,n.cleanData(ob(this)),a&&a.replaceChild(b,this)}),a&&(a.length||a.nodeType)?this:this.remove()},detach:function(a){return this.remove(a,!0)},domManip:function(a,b){a=e.apply([],a);var c,d,f,g,h,i,j=0,l=this.length,m=this,o=l-1,p=a[0],q=n.isFunction(p);if(q||l>1&&"string"==typeof p&&!k.checkClone&&eb.test(p))return this.each(function(c){var d=m.eq(c);q&&(a[0]=p.call(this,c,d.html())),d.domManip(a,b)});if(l&&(c=n.buildFragment(a,this[0].ownerDocument,!1,this),d=c.firstChild,1===c.childNodes.length&&(c=d),d)){for(f=n.map(ob(c,"script"),kb),g=f.length;l>j;j++)h=c,j!==o&&(h=n.clone(h,!0,!0),g&&n.merge(f,ob(h,"script"))),b.call(this[j],h,j);if(g)for(i=f[f.length-1].ownerDocument,n.map(f,lb),j=0;g>j;j++)h=f[j],fb.test(h.type||"")&&!L.access(h,"globalEval")&&n.contains(i,h)&&(h.src?n._evalUrl&&n._evalUrl(h.src):n.globalEval(h.textContent.replace(hb,"")))}return this}}),n.each({appendTo:"append",prependTo:"prepend",insertBefore:"before",insertAfter:"after",replaceAll:"replaceWith"},function(a,b){n.fn[a]=function(a){for(var c,d=[],e=n(a),g=e.length-1,h=0;g>=h;h++)c=h===g?this:this.clone(!0),n(e[h])[b](c),f.apply(d,c.get());return this.pushStack(d)}});var qb,rb={};function sb(b,c){var d,e=n(c.createElement(b)).appendTo(c.body),f=a.getDefaultComputedStyle&&(d=a.getDefaultComputedStyle(e[0]))?d.display:n.css(e[0],"display");return e.detach(),f}function tb(a){var b=l,c=rb[a];return c||(c=sb(a,b),"none"!==c&&c||(qb=(qb||n("<iframe frameborder='0' width='0' height='0'/>")).appendTo(b.documentElement),b=qb[0].contentDocument,b.write(),b.close(),c=sb(a,b),qb.detach()),rb[a]=c),c}var ub=/^margin/,vb=new RegExp("^("+Q+")(?!px)[a-z%]+$","i"),wb=function(a){return a.ownerDocument.defaultView.getComputedStyle(a,null)};function xb(a,b,c){var d,e,f,g,h=a.style;return c=c||wb(a),c&&(g=c.getPropertyValue(b)||c[b]),c&&(""!==g||n.contains(a.ownerDocument,a)||(g=n.style(a,b)),vb.test(g)&&ub.test(b)&&(d=h.width,e=h.minWidth,f=h.maxWidth,h.minWidth=h.maxWidth=h.width=g,g=c.width,h.width=d,h.minWidth=e,h.maxWidth=f)),void 0!==g?g+"":g}function yb(a,b){return{get:function(){return a()?void delete this.get:(this.get=b).apply(this,arguments)}}}!function(){var b,c,d=l.documentElement,e=l.createElement("div"),f=l.createElement("div");if(f.style){f.style.backgroundClip="content-box",f.cloneNode(!0).style.backgroundClip="",k.clearCloneStyle="content-box"===f.style.backgroundClip,e.style.cssText="border:0;width:0;height:0;top:0;left:-9999px;margin-top:1px;position:absolute",e.appendChild(f);function g(){f.style.cssText="-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;display:block;margin-top:1%;top:1%;border:1px;padding:1px;width:4px;position:absolute",f.innerHTML="",d.appendChild(e);var g=a.getComputedStyle(f,null);b="1%"!==g.top,c="4px"===g.width,d.removeChild(e)}a.getComputedStyle&&n.extend(k,{pixelPosition:function(){return g(),b},boxSizingReliable:function(){return null==c&&g(),c},reliableMarginRight:function(){var b,c=f.appendChild(l.createElement("div"));return c.style.cssText=f.style.cssText="-webkit-box-sizing:content-box;-moz-box-sizing:content-box;box-sizing:content-box;display:block;margin:0;border:0;padding:0",c.style.marginRight=c.style.width="0",f.style.width="1px",d.appendChild(e),b=!parseFloat(a.getComputedStyle(c,null).marginRight),d.removeChild(e),b}})}}(),n.swap=function(a,b,c,d){var e,f,g={};for(f in b)g[f]=a.style[f],a.style[f]=b[f];e=c.apply(a,d||[]);for(f in b)a.style[f]=g[f];return e};var zb=/^(none|table(?!-c[ea]).+)/,Ab=new RegExp("^("+Q+")(.*)$","i"),Bb=new RegExp("^([+-])=("+Q+")","i"),Cb={position:"absolute",visibility:"hidden",display:"block"},Db={letterSpacing:"0",fontWeight:"400"},Eb=["Webkit","O","Moz","ms"];function Fb(a,b){if(b in a)return b;var c=b[0].toUpperCase()+b.slice(1),d=b,e=Eb.length;while(e--)if(b=Eb[e]+c,b in a)return b;return d}function Gb(a,b,c){var d=Ab.exec(b);return d?Math.max(0,d[1]-(c||0))+(d[2]||"px"):b}function Hb(a,b,c,d,e){for(var f=c===(d?"border":"content")?4:"width"===b?1:0,g=0;4>f;f+=2)"margin"===c&&(g+=n.css(a,c+R[f],!0,e)),d?("content"===c&&(g-=n.css(a,"padding"+R[f],!0,e)),"margin"!==c&&(g-=n.css(a,"border"+R[f]+"Width",!0,e))):(g+=n.css(a,"padding"+R[f],!0,e),"padding"!==c&&(g+=n.css(a,"border"+R[f]+"Width",!0,e)));return g}function Ib(a,b,c){var d=!0,e="width"===b?a.offsetWidth:a.offsetHeight,f=wb(a),g="border-box"===n.css(a,"boxSizing",!1,f);if(0>=e||null==e){if(e=xb(a,b,f),(0>e||null==e)&&(e=a.style[b]),vb.test(e))return e;d=g&&(k.boxSizingReliable()||e===a.style[b]),e=parseFloat(e)||0}return e+Hb(a,b,c||(g?"border":"content"),d,f)+"px"}function Jb(a,b){for(var c,d,e,f=[],g=0,h=a.length;h>g;g++)d=a[g],d.style&&(f[g]=L.get(d,"olddisplay"),c=d.style.display,b?(f[g]||"none"!==c||(d.style.display=""),""===d.style.display&&S(d)&&(f[g]=L.access(d,"olddisplay",tb(d.nodeName)))):(e=S(d),"none"===c&&e||L.set(d,"olddisplay",e?c:n.css(d,"display"))));for(g=0;h>g;g++)d=a[g],d.style&&(b&&"none"!==d.style.display&&""!==d.style.display||(d.style.display=b?f[g]||"":"none"));return a}n.extend({cssHooks:{opacity:{get:function(a,b){if(b){var c=xb(a,"opacity");return""===c?"1":c}}}},cssNumber:{columnCount:!0,fillOpacity:!0,flexGrow:!0,flexShrink:!0,fontWeight:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,widows:!0,zIndex:!0,zoom:!0},cssProps:{"float":"cssFloat"},style:function(a,b,c,d){if(a&&3!==a.nodeType&&8!==a.nodeType&&a.style){var e,f,g,h=n.camelCase(b),i=a.style;return b=n.cssProps[h]||(n.cssProps[h]=Fb(i,h)),g=n.cssHooks[b]||n.cssHooks[h],void 0===c?g&&"get"in g&&void 0!==(e=g.get(a,!1,d))?e:i[b]:(f=typeof c,"string"===f&&(e=Bb.exec(c))&&(c=(e[1]+1)*e[2]+parseFloat(n.css(a,b)),f="number"),null!=c&&c===c&&("number"!==f||n.cssNumber[h]||(c+="px"),k.clearCloneStyle||""!==c||0!==b.indexOf("background")||(i[b]="inherit"),g&&"set"in g&&void 0===(c=g.set(a,c,d))||(i[b]=c)),void 0)}},css:function(a,b,c,d){var e,f,g,h=n.camelCase(b);return b=n.cssProps[h]||(n.cssProps[h]=Fb(a.style,h)),g=n.cssHooks[b]||n.cssHooks[h],g&&"get"in g&&(e=g.get(a,!0,c)),void 0===e&&(e=xb(a,b,d)),"normal"===e&&b in Db&&(e=Db[b]),""===c||c?(f=parseFloat(e),c===!0||n.isNumeric(f)?f||0:e):e}}),n.each(["height","width"],function(a,b){n.cssHooks[b]={get:function(a,c,d){return c?zb.test(n.css(a,"display"))&&0===a.offsetWidth?n.swap(a,Cb,function(){return Ib(a,b,d)}):Ib(a,b,d):void 0},set:function(a,c,d){var e=d&&wb(a);return Gb(a,c,d?Hb(a,b,d,"border-box"===n.css(a,"boxSizing",!1,e),e):0)}}}),n.cssHooks.marginRight=yb(k.reliableMarginRight,function(a,b){return b?n.swap(a,{display:"inline-block"},xb,[a,"marginRight"]):void 0}),n.each({margin:"",padding:"",border:"Width"},function(a,b){n.cssHooks[a+b]={expand:function(c){for(var d=0,e={},f="string"==typeof c?c.split(" "):[c];4>d;d++)e[a+R[d]+b]=f[d]||f[d-2]||f[0];return e}},ub.test(a)||(n.cssHooks[a+b].set=Gb)}),n.fn.extend({css:function(a,b){return J(this,function(a,b,c){var d,e,f={},g=0;if(n.isArray(b)){for(d=wb(a),e=b.length;e>g;g++)f[b[g]]=n.css(a,b[g],!1,d);return f}return void 0!==c?n.style(a,b,c):n.css(a,b)},a,b,arguments.length>1)},show:function(){return Jb(this,!0)},hide:function(){return Jb(this)},toggle:function(a){return"boolean"==typeof a?a?this.show():this.hide():this.each(function(){S(this)?n(this).show():n(this).hide()})}});function Kb(a,b,c,d,e){return new Kb.prototype.init(a,b,c,d,e)}n.Tween=Kb,Kb.prototype={constructor:Kb,init:function(a,b,c,d,e,f){this.elem=a,this.prop=c,this.easing=e||"swing",this.options=b,this.start=this.now=this.cur(),this.end=d,this.unit=f||(n.cssNumber[c]?"":"px")},cur:function(){var a=Kb.propHooks[this.prop];return a&&a.get?a.get(this):Kb.propHooks._default.get(this)},run:function(a){var b,c=Kb.propHooks[this.prop];return this.pos=b=this.options.duration?n.easing[this.easing](a,this.options.duration*a,0,1,this.options.duration):a,this.now=(this.end-this.start)*b+this.start,this.options.step&&this.options.step.call(this.elem,this.now,this),c&&c.set?c.set(this):Kb.propHooks._default.set(this),this}},Kb.prototype.init.prototype=Kb.prototype,Kb.propHooks={_default:{get:function(a){var b;return null==a.elem[a.prop]||a.elem.style&&null!=a.elem.style[a.prop]?(b=n.css(a.elem,a.prop,""),b&&"auto"!==b?b:0):a.elem[a.prop]},set:function(a){n.fx.step[a.prop]?n.fx.step[a.prop](a):a.elem.style&&(null!=a.elem.style[n.cssProps[a.prop]]||n.cssHooks[a.prop])?n.style(a.elem,a.prop,a.now+a.unit):a.elem[a.prop]=a.now}}},Kb.propHooks.scrollTop=Kb.propHooks.scrollLeft={set:function(a){a.elem.nodeType&&a.elem.parentNode&&(a.elem[a.prop]=a.now)}},n.easing={linear:function(a){return a},swing:function(a){return.5-Math.cos(a*Math.PI)/2}},n.fx=Kb.prototype.init,n.fx.step={};var Lb,Mb,Nb=/^(?:toggle|show|hide)$/,Ob=new RegExp("^(?:([+-])=|)("+Q+")([a-z%]*)$","i"),Pb=/queueHooks$/,Qb=[Vb],Rb={"*":[function(a,b){var c=this.createTween(a,b),d=c.cur(),e=Ob.exec(b),f=e&&e[3]||(n.cssNumber[a]?"":"px"),g=(n.cssNumber[a]||"px"!==f&&+d)&&Ob.exec(n.css(c.elem,a)),h=1,i=20;if(g&&g[3]!==f){f=f||g[3],e=e||[],g=+d||1;do h=h||".5",g/=h,n.style(c.elem,a,g+f);while(h!==(h=c.cur()/d)&&1!==h&&--i)}return e&&(g=c.start=+g||+d||0,c.unit=f,c.end=e[1]?g+(e[1]+1)*e[2]:+e[2]),c}]};function Sb(){return setTimeout(function(){Lb=void 0}),Lb=n.now()}function Tb(a,b){var c,d=0,e={height:a};for(b=b?1:0;4>d;d+=2-b)c=R[d],e["margin"+c]=e["padding"+c]=a;return b&&(e.opacity=e.width=a),e}function Ub(a,b,c){for(var d,e=(Rb[b]||[]).concat(Rb["*"]),f=0,g=e.length;g>f;f++)if(d=e[f].call(c,b,a))return d}function Vb(a,b,c){var d,e,f,g,h,i,j,k,l=this,m={},o=a.style,p=a.nodeType&&S(a),q=L.get(a,"fxshow");c.queue||(h=n._queueHooks(a,"fx"),null==h.unqueued&&(h.unqueued=0,i=h.empty.fire,h.empty.fire=function(){h.unqueued||i()}),h.unqueued++,l.always(function(){l.always(function(){h.unqueued--,n.queue(a,"fx").length||h.empty.fire()})})),1===a.nodeType&&("height"in b||"width"in b)&&(c.overflow=[o.overflow,o.overflowX,o.overflowY],j=n.css(a,"display"),k="none"===j?L.get(a,"olddisplay")||tb(a.nodeName):j,"inline"===k&&"none"===n.css(a,"float")&&(o.display="inline-block")),c.overflow&&(o.overflow="hidden",l.always(function(){o.overflow=c.overflow[0],o.overflowX=c.overflow[1],o.overflowY=c.overflow[2]}));for(d in b)if(e=b[d],Nb.exec(e)){if(delete b[d],f=f||"toggle"===e,e===(p?"hide":"show")){if("show"!==e||!q||void 0===q[d])continue;p=!0}m[d]=q&&q[d]||n.style(a,d)}else j=void 0;if(n.isEmptyObject(m))"inline"===("none"===j?tb(a.nodeName):j)&&(o.display=j);else{q?"hidden"in q&&(p=q.hidden):q=L.access(a,"fxshow",{}),f&&(q.hidden=!p),p?n(a).show():l.done(function(){n(a).hide()}),l.done(function(){var b;L.remove(a,"fxshow");for(b in m)n.style(a,b,m[b])});for(d in m)g=Ub(p?q[d]:0,d,l),d in q||(q[d]=g.start,p&&(g.end=g.start,g.start="width"===d||"height"===d?1:0))}}function Wb(a,b){var c,d,e,f,g;for(c in a)if(d=n.camelCase(c),e=b[d],f=a[c],n.isArray(f)&&(e=f[1],f=a[c]=f[0]),c!==d&&(a[d]=f,delete a[c]),g=n.cssHooks[d],g&&"expand"in g){f=g.expand(f),delete a[d];for(c in f)c in a||(a[c]=f[c],b[c]=e)}else b[d]=e}function Xb(a,b,c){var d,e,f=0,g=Qb.length,h=n.Deferred().always(function(){delete i.elem}),i=function(){if(e)return!1;for(var b=Lb||Sb(),c=Math.max(0,j.startTime+j.duration-b),d=c/j.duration||0,f=1-d,g=0,i=j.tweens.length;i>g;g++)j.tweens[g].run(f);return h.notifyWith(a,[j,f,c]),1>f&&i?c:(h.resolveWith(a,[j]),!1)},j=h.promise({elem:a,props:n.extend({},b),opts:n.extend(!0,{specialEasing:{}},c),originalProperties:b,originalOptions:c,startTime:Lb||Sb(),duration:c.duration,tweens:[],createTween:function(b,c){var d=n.Tween(a,j.opts,b,c,j.opts.specialEasing[b]||j.opts.easing);return j.tweens.push(d),d},stop:function(b){var c=0,d=b?j.tweens.length:0;if(e)return this;for(e=!0;d>c;c++)j.tweens[c].run(1);return b?h.resolveWith(a,[j,b]):h.rejectWith(a,[j,b]),this}}),k=j.props;for(Wb(k,j.opts.specialEasing);g>f;f++)if(d=Qb[f].call(j,a,k,j.opts))return d;return n.map(k,Ub,j),n.isFunction(j.opts.start)&&j.opts.start.call(a,j),n.fx.timer(n.extend(i,{elem:a,anim:j,queue:j.opts.queue})),j.progress(j.opts.progress).done(j.opts.done,j.opts.complete).fail(j.opts.fail).always(j.opts.always)}n.Animation=n.extend(Xb,{tweener:function(a,b){n.isFunction(a)?(b=a,a=["*"]):a=a.split(" ");for(var c,d=0,e=a.length;e>d;d++)c=a[d],Rb[c]=Rb[c]||[],Rb[c].unshift(b)},prefilter:function(a,b){b?Qb.unshift(a):Qb.push(a)}}),n.speed=function(a,b,c){var d=a&&"object"==typeof a?n.extend({},a):{complete:c||!c&&b||n.isFunction(a)&&a,duration:a,easing:c&&b||b&&!n.isFunction(b)&&b};return d.duration=n.fx.off?0:"number"==typeof d.duration?d.duration:d.duration in n.fx.speeds?n.fx.speeds[d.duration]:n.fx.speeds._default,(null==d.queue||d.queue===!0)&&(d.queue="fx"),d.old=d.complete,d.complete=function(){n.isFunction(d.old)&&d.old.call(this),d.queue&&n.dequeue(this,d.queue)},d},n.fn.extend({fadeTo:function(a,b,c,d){return this.filter(S).css("opacity",0).show().end().animate({opacity:b},a,c,d)},animate:function(a,b,c,d){var e=n.isEmptyObject(a),f=n.speed(b,c,d),g=function(){var b=Xb(this,n.extend({},a),f);(e||L.get(this,"finish"))&&b.stop(!0)};return g.finish=g,e||f.queue===!1?this.each(g):this.queue(f.queue,g)},stop:function(a,b,c){var d=function(a){var b=a.stop;delete a.stop,b(c)};return"string"!=typeof a&&(c=b,b=a,a=void 0),b&&a!==!1&&this.queue(a||"fx",[]),this.each(function(){var b=!0,e=null!=a&&a+"queueHooks",f=n.timers,g=L.get(this);if(e)g[e]&&g[e].stop&&d(g[e]);else for(e in g)g[e]&&g[e].stop&&Pb.test(e)&&d(g[e]);for(e=f.length;e--;)f[e].elem!==this||null!=a&&f[e].queue!==a||(f[e].anim.stop(c),b=!1,f.splice(e,1));(b||!c)&&n.dequeue(this,a)})},finish:function(a){return a!==!1&&(a=a||"fx"),this.each(function(){var b,c=L.get(this),d=c[a+"queue"],e=c[a+"queueHooks"],f=n.timers,g=d?d.length:0;for(c.finish=!0,n.queue(this,a,[]),e&&e.stop&&e.stop.call(this,!0),b=f.length;b--;)f[b].elem===this&&f[b].queue===a&&(f[b].anim.stop(!0),f.splice(b,1));for(b=0;g>b;b++)d[b]&&d[b].finish&&d[b].finish.call(this);delete c.finish})}}),n.each(["toggle","show","hide"],function(a,b){var c=n.fn[b];n.fn[b]=function(a,d,e){return null==a||"boolean"==typeof a?c.apply(this,arguments):this.animate(Tb(b,!0),a,d,e)}}),n.each({slideDown:Tb("show"),slideUp:Tb("hide"),slideToggle:Tb("toggle"),fadeIn:{opacity:"show"},fadeOut:{opacity:"hide"},fadeToggle:{opacity:"toggle"}},function(a,b){n.fn[a]=function(a,c,d){return this.animate(b,a,c,d)}}),n.timers=[],n.fx.tick=function(){var a,b=0,c=n.timers;for(Lb=n.now();b<c.length;b++)a=c[b],a()||c[b]!==a||c.splice(b--,1);c.length||n.fx.stop(),Lb=void 0},n.fx.timer=function(a){n.timers.push(a),a()?n.fx.start():n.timers.pop()},n.fx.interval=13,n.fx.start=function(){Mb||(Mb=setInterval(n.fx.tick,n.fx.interval))},n.fx.stop=function(){clearInterval(Mb),Mb=null},n.fx.speeds={slow:600,fast:200,_default:400},n.fn.delay=function(a,b){return a=n.fx?n.fx.speeds[a]||a:a,b=b||"fx",this.queue(b,function(b,c){var d=setTimeout(b,a);c.stop=function(){clearTimeout(d)}})},function(){var a=l.createElement("input"),b=l.createElement("select"),c=b.appendChild(l.createElement("option"));a.type="checkbox",k.checkOn=""!==a.value,k.optSelected=c.selected,b.disabled=!0,k.optDisabled=!c.disabled,a=l.createElement("input"),a.value="t",a.type="radio",k.radioValue="t"===a.value}();var Yb,Zb,$b=n.expr.attrHandle;n.fn.extend({attr:function(a,b){return J(this,n.attr,a,b,arguments.length>1)},removeAttr:function(a){return this.each(function(){n.removeAttr(this,a)})}}),n.extend({attr:function(a,b,c){var d,e,f=a.nodeType;if(a&&3!==f&&8!==f&&2!==f)return typeof a.getAttribute===U?n.prop(a,b,c):(1===f&&n.isXMLDoc(a)||(b=b.toLowerCase(),d=n.attrHooks[b]||(n.expr.match.bool.test(b)?Zb:Yb)),void 0===c?d&&"get"in d&&null!==(e=d.get(a,b))?e:(e=n.find.attr(a,b),null==e?void 0:e):null!==c?d&&"set"in d&&void 0!==(e=d.set(a,c,b))?e:(a.setAttribute(b,c+""),c):void n.removeAttr(a,b))
},removeAttr:function(a,b){var c,d,e=0,f=b&&b.match(E);if(f&&1===a.nodeType)while(c=f[e++])d=n.propFix[c]||c,n.expr.match.bool.test(c)&&(a[d]=!1),a.removeAttribute(c)},attrHooks:{type:{set:function(a,b){if(!k.radioValue&&"radio"===b&&n.nodeName(a,"input")){var c=a.value;return a.setAttribute("type",b),c&&(a.value=c),b}}}}}),Zb={set:function(a,b,c){return b===!1?n.removeAttr(a,c):a.setAttribute(c,c),c}},n.each(n.expr.match.bool.source.match(/\w+/g),function(a,b){var c=$b[b]||n.find.attr;$b[b]=function(a,b,d){var e,f;return d||(f=$b[b],$b[b]=e,e=null!=c(a,b,d)?b.toLowerCase():null,$b[b]=f),e}});var _b=/^(?:input|select|textarea|button)$/i;n.fn.extend({prop:function(a,b){return J(this,n.prop,a,b,arguments.length>1)},removeProp:function(a){return this.each(function(){delete this[n.propFix[a]||a]})}}),n.extend({propFix:{"for":"htmlFor","class":"className"},prop:function(a,b,c){var d,e,f,g=a.nodeType;if(a&&3!==g&&8!==g&&2!==g)return f=1!==g||!n.isXMLDoc(a),f&&(b=n.propFix[b]||b,e=n.propHooks[b]),void 0!==c?e&&"set"in e&&void 0!==(d=e.set(a,c,b))?d:a[b]=c:e&&"get"in e&&null!==(d=e.get(a,b))?d:a[b]},propHooks:{tabIndex:{get:function(a){return a.hasAttribute("tabindex")||_b.test(a.nodeName)||a.href?a.tabIndex:-1}}}}),k.optSelected||(n.propHooks.selected={get:function(a){var b=a.parentNode;return b&&b.parentNode&&b.parentNode.selectedIndex,null}}),n.each(["tabIndex","readOnly","maxLength","cellSpacing","cellPadding","rowSpan","colSpan","useMap","frameBorder","contentEditable"],function(){n.propFix[this.toLowerCase()]=this});var ac=/[\t\r\n\f]/g;n.fn.extend({addClass:function(a){var b,c,d,e,f,g,h="string"==typeof a&&a,i=0,j=this.length;if(n.isFunction(a))return this.each(function(b){n(this).addClass(a.call(this,b,this.className))});if(h)for(b=(a||"").match(E)||[];j>i;i++)if(c=this[i],d=1===c.nodeType&&(c.className?(" "+c.className+" ").replace(ac," "):" ")){f=0;while(e=b[f++])d.indexOf(" "+e+" ")<0&&(d+=e+" ");g=n.trim(d),c.className!==g&&(c.className=g)}return this},removeClass:function(a){var b,c,d,e,f,g,h=0===arguments.length||"string"==typeof a&&a,i=0,j=this.length;if(n.isFunction(a))return this.each(function(b){n(this).removeClass(a.call(this,b,this.className))});if(h)for(b=(a||"").match(E)||[];j>i;i++)if(c=this[i],d=1===c.nodeType&&(c.className?(" "+c.className+" ").replace(ac," "):"")){f=0;while(e=b[f++])while(d.indexOf(" "+e+" ")>=0)d=d.replace(" "+e+" "," ");g=a?n.trim(d):"",c.className!==g&&(c.className=g)}return this},toggleClass:function(a,b){var c=typeof a;return"boolean"==typeof b&&"string"===c?b?this.addClass(a):this.removeClass(a):this.each(n.isFunction(a)?function(c){n(this).toggleClass(a.call(this,c,this.className,b),b)}:function(){if("string"===c){var b,d=0,e=n(this),f=a.match(E)||[];while(b=f[d++])e.hasClass(b)?e.removeClass(b):e.addClass(b)}else(c===U||"boolean"===c)&&(this.className&&L.set(this,"__className__",this.className),this.className=this.className||a===!1?"":L.get(this,"__className__")||"")})},hasClass:function(a){for(var b=" "+a+" ",c=0,d=this.length;d>c;c++)if(1===this[c].nodeType&&(" "+this[c].className+" ").replace(ac," ").indexOf(b)>=0)return!0;return!1}});var bc=/\r/g;n.fn.extend({val:function(a){var b,c,d,e=this[0];{if(arguments.length)return d=n.isFunction(a),this.each(function(c){var e;1===this.nodeType&&(e=d?a.call(this,c,n(this).val()):a,null==e?e="":"number"==typeof e?e+="":n.isArray(e)&&(e=n.map(e,function(a){return null==a?"":a+""})),b=n.valHooks[this.type]||n.valHooks[this.nodeName.toLowerCase()],b&&"set"in b&&void 0!==b.set(this,e,"value")||(this.value=e))});if(e)return b=n.valHooks[e.type]||n.valHooks[e.nodeName.toLowerCase()],b&&"get"in b&&void 0!==(c=b.get(e,"value"))?c:(c=e.value,"string"==typeof c?c.replace(bc,""):null==c?"":c)}}}),n.extend({valHooks:{option:{get:function(a){var b=n.find.attr(a,"value");return null!=b?b:n.trim(n.text(a))}},select:{get:function(a){for(var b,c,d=a.options,e=a.selectedIndex,f="select-one"===a.type||0>e,g=f?null:[],h=f?e+1:d.length,i=0>e?h:f?e:0;h>i;i++)if(c=d[i],!(!c.selected&&i!==e||(k.optDisabled?c.disabled:null!==c.getAttribute("disabled"))||c.parentNode.disabled&&n.nodeName(c.parentNode,"optgroup"))){if(b=n(c).val(),f)return b;g.push(b)}return g},set:function(a,b){var c,d,e=a.options,f=n.makeArray(b),g=e.length;while(g--)d=e[g],(d.selected=n.inArray(d.value,f)>=0)&&(c=!0);return c||(a.selectedIndex=-1),f}}}}),n.each(["radio","checkbox"],function(){n.valHooks[this]={set:function(a,b){return n.isArray(b)?a.checked=n.inArray(n(a).val(),b)>=0:void 0}},k.checkOn||(n.valHooks[this].get=function(a){return null===a.getAttribute("value")?"on":a.value})}),n.each("blur focus focusin focusout load resize scroll unload click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup error contextmenu".split(" "),function(a,b){n.fn[b]=function(a,c){return arguments.length>0?this.on(b,null,a,c):this.trigger(b)}}),n.fn.extend({hover:function(a,b){return this.mouseenter(a).mouseleave(b||a)},bind:function(a,b,c){return this.on(a,null,b,c)},unbind:function(a,b){return this.off(a,null,b)},delegate:function(a,b,c,d){return this.on(b,a,c,d)},undelegate:function(a,b,c){return 1===arguments.length?this.off(a,"**"):this.off(b,a||"**",c)}});var cc=n.now(),dc=/\?/;n.parseJSON=function(a){return JSON.parse(a+"")},n.parseXML=function(a){var b,c;if(!a||"string"!=typeof a)return null;try{c=new DOMParser,b=c.parseFromString(a,"text/xml")}catch(d){b=void 0}return(!b||b.getElementsByTagName("parsererror").length)&&n.error("Invalid XML: "+a),b};var ec,fc,gc=/#.*$/,hc=/([?&])_=[^&]*/,ic=/^(.*?):[ \t]*([^\r\n]*)$/gm,jc=/^(?:about|app|app-storage|.+-extension|file|res|widget):$/,kc=/^(?:GET|HEAD)$/,lc=/^\/\//,mc=/^([\w.+-]+:)(?:\/\/(?:[^\/?#]*@|)([^\/?#:]*)(?::(\d+)|)|)/,nc={},oc={},pc="*/".concat("*");try{fc=location.href}catch(qc){fc=l.createElement("a"),fc.href="",fc=fc.href}ec=mc.exec(fc.toLowerCase())||[];function rc(a){return function(b,c){"string"!=typeof b&&(c=b,b="*");var d,e=0,f=b.toLowerCase().match(E)||[];if(n.isFunction(c))while(d=f[e++])"+"===d[0]?(d=d.slice(1)||"*",(a[d]=a[d]||[]).unshift(c)):(a[d]=a[d]||[]).push(c)}}function sc(a,b,c,d){var e={},f=a===oc;function g(h){var i;return e[h]=!0,n.each(a[h]||[],function(a,h){var j=h(b,c,d);return"string"!=typeof j||f||e[j]?f?!(i=j):void 0:(b.dataTypes.unshift(j),g(j),!1)}),i}return g(b.dataTypes[0])||!e["*"]&&g("*")}function tc(a,b){var c,d,e=n.ajaxSettings.flatOptions||{};for(c in b)void 0!==b[c]&&((e[c]?a:d||(d={}))[c]=b[c]);return d&&n.extend(!0,a,d),a}function uc(a,b,c){var d,e,f,g,h=a.contents,i=a.dataTypes;while("*"===i[0])i.shift(),void 0===d&&(d=a.mimeType||b.getResponseHeader("Content-Type"));if(d)for(e in h)if(h[e]&&h[e].test(d)){i.unshift(e);break}if(i[0]in c)f=i[0];else{for(e in c){if(!i[0]||a.converters[e+" "+i[0]]){f=e;break}g||(g=e)}f=f||g}return f?(f!==i[0]&&i.unshift(f),c[f]):void 0}function vc(a,b,c,d){var e,f,g,h,i,j={},k=a.dataTypes.slice();if(k[1])for(g in a.converters)j[g.toLowerCase()]=a.converters[g];f=k.shift();while(f)if(a.responseFields[f]&&(c[a.responseFields[f]]=b),!i&&d&&a.dataFilter&&(b=a.dataFilter(b,a.dataType)),i=f,f=k.shift())if("*"===f)f=i;else if("*"!==i&&i!==f){if(g=j[i+" "+f]||j["* "+f],!g)for(e in j)if(h=e.split(" "),h[1]===f&&(g=j[i+" "+h[0]]||j["* "+h[0]])){g===!0?g=j[e]:j[e]!==!0&&(f=h[0],k.unshift(h[1]));break}if(g!==!0)if(g&&a["throws"])b=g(b);else try{b=g(b)}catch(l){return{state:"parsererror",error:g?l:"No conversion from "+i+" to "+f}}}return{state:"success",data:b}}n.extend({active:0,lastModified:{},etag:{},ajaxSettings:{url:fc,type:"GET",isLocal:jc.test(ec[1]),global:!0,processData:!0,async:!0,contentType:"application/x-www-form-urlencoded; charset=UTF-8",accepts:{"*":pc,text:"text/plain",html:"text/html",xml:"application/xml, text/xml",json:"application/json, text/javascript"},contents:{xml:/xml/,html:/html/,json:/json/},responseFields:{xml:"responseXML",text:"responseText",json:"responseJSON"},converters:{"* text":String,"text html":!0,"text json":n.parseJSON,"text xml":n.parseXML},flatOptions:{url:!0,context:!0}},ajaxSetup:function(a,b){return b?tc(tc(a,n.ajaxSettings),b):tc(n.ajaxSettings,a)},ajaxPrefilter:rc(nc),ajaxTransport:rc(oc),ajax:function(a,b){"object"==typeof a&&(b=a,a=void 0),b=b||{};var c,d,e,f,g,h,i,j,k=n.ajaxSetup({},b),l=k.context||k,m=k.context&&(l.nodeType||l.jquery)?n(l):n.event,o=n.Deferred(),p=n.Callbacks("once memory"),q=k.statusCode||{},r={},s={},t=0,u="canceled",v={readyState:0,getResponseHeader:function(a){var b;if(2===t){if(!f){f={};while(b=ic.exec(e))f[b[1].toLowerCase()]=b[2]}b=f[a.toLowerCase()]}return null==b?null:b},getAllResponseHeaders:function(){return 2===t?e:null},setRequestHeader:function(a,b){var c=a.toLowerCase();return t||(a=s[c]=s[c]||a,r[a]=b),this},overrideMimeType:function(a){return t||(k.mimeType=a),this},statusCode:function(a){var b;if(a)if(2>t)for(b in a)q[b]=[q[b],a[b]];else v.always(a[v.status]);return this},abort:function(a){var b=a||u;return c&&c.abort(b),x(0,b),this}};if(o.promise(v).complete=p.add,v.success=v.done,v.error=v.fail,k.url=((a||k.url||fc)+"").replace(gc,"").replace(lc,ec[1]+"//"),k.type=b.method||b.type||k.method||k.type,k.dataTypes=n.trim(k.dataType||"*").toLowerCase().match(E)||[""],null==k.crossDomain&&(h=mc.exec(k.url.toLowerCase()),k.crossDomain=!(!h||h[1]===ec[1]&&h[2]===ec[2]&&(h[3]||("http:"===h[1]?"80":"443"))===(ec[3]||("http:"===ec[1]?"80":"443")))),k.data&&k.processData&&"string"!=typeof k.data&&(k.data=n.param(k.data,k.traditional)),sc(nc,k,b,v),2===t)return v;i=k.global,i&&0===n.active++&&n.event.trigger("ajaxStart"),k.type=k.type.toUpperCase(),k.hasContent=!kc.test(k.type),d=k.url,k.hasContent||(k.data&&(d=k.url+=(dc.test(d)?"&":"?")+k.data,delete k.data),k.cache===!1&&(k.url=hc.test(d)?d.replace(hc,"$1_="+cc++):d+(dc.test(d)?"&":"?")+"_="+cc++)),k.ifModified&&(n.lastModified[d]&&v.setRequestHeader("If-Modified-Since",n.lastModified[d]),n.etag[d]&&v.setRequestHeader("If-None-Match",n.etag[d])),(k.data&&k.hasContent&&k.contentType!==!1||b.contentType)&&v.setRequestHeader("Content-Type",k.contentType),v.setRequestHeader("Accept",k.dataTypes[0]&&k.accepts[k.dataTypes[0]]?k.accepts[k.dataTypes[0]]+("*"!==k.dataTypes[0]?", "+pc+"; q=0.01":""):k.accepts["*"]);for(j in k.headers)v.setRequestHeader(j,k.headers[j]);if(k.beforeSend&&(k.beforeSend.call(l,v,k)===!1||2===t))return v.abort();u="abort";for(j in{success:1,error:1,complete:1})v[j](k[j]);if(c=sc(oc,k,b,v)){v.readyState=1,i&&m.trigger("ajaxSend",[v,k]),k.async&&k.timeout>0&&(g=setTimeout(function(){v.abort("timeout")},k.timeout));try{t=1,c.send(r,x)}catch(w){if(!(2>t))throw w;x(-1,w)}}else x(-1,"No Transport");function x(a,b,f,h){var j,r,s,u,w,x=b;2!==t&&(t=2,g&&clearTimeout(g),c=void 0,e=h||"",v.readyState=a>0?4:0,j=a>=200&&300>a||304===a,f&&(u=uc(k,v,f)),u=vc(k,u,v,j),j?(k.ifModified&&(w=v.getResponseHeader("Last-Modified"),w&&(n.lastModified[d]=w),w=v.getResponseHeader("etag"),w&&(n.etag[d]=w)),204===a||"HEAD"===k.type?x="nocontent":304===a?x="notmodified":(x=u.state,r=u.data,s=u.error,j=!s)):(s=x,(a||!x)&&(x="error",0>a&&(a=0))),v.status=a,v.statusText=(b||x)+"",j?o.resolveWith(l,[r,x,v]):o.rejectWith(l,[v,x,s]),v.statusCode(q),q=void 0,i&&m.trigger(j?"ajaxSuccess":"ajaxError",[v,k,j?r:s]),p.fireWith(l,[v,x]),i&&(m.trigger("ajaxComplete",[v,k]),--n.active||n.event.trigger("ajaxStop")))}return v},getJSON:function(a,b,c){return n.get(a,b,c,"json")},getScript:function(a,b){return n.get(a,void 0,b,"script")}}),n.each(["get","post"],function(a,b){n[b]=function(a,c,d,e){return n.isFunction(c)&&(e=e||d,d=c,c=void 0),n.ajax({url:a,type:b,dataType:e,data:c,success:d})}}),n.each(["ajaxStart","ajaxStop","ajaxComplete","ajaxError","ajaxSuccess","ajaxSend"],function(a,b){n.fn[b]=function(a){return this.on(b,a)}}),n._evalUrl=function(a){return n.ajax({url:a,type:"GET",dataType:"script",async:!1,global:!1,"throws":!0})},n.fn.extend({wrapAll:function(a){var b;return n.isFunction(a)?this.each(function(b){n(this).wrapAll(a.call(this,b))}):(this[0]&&(b=n(a,this[0].ownerDocument).eq(0).clone(!0),this[0].parentNode&&b.insertBefore(this[0]),b.map(function(){var a=this;while(a.firstElementChild)a=a.firstElementChild;return a}).append(this)),this)},wrapInner:function(a){return this.each(n.isFunction(a)?function(b){n(this).wrapInner(a.call(this,b))}:function(){var b=n(this),c=b.contents();c.length?c.wrapAll(a):b.append(a)})},wrap:function(a){var b=n.isFunction(a);return this.each(function(c){n(this).wrapAll(b?a.call(this,c):a)})},unwrap:function(){return this.parent().each(function(){n.nodeName(this,"body")||n(this).replaceWith(this.childNodes)}).end()}}),n.expr.filters.hidden=function(a){return a.offsetWidth<=0&&a.offsetHeight<=0},n.expr.filters.visible=function(a){return!n.expr.filters.hidden(a)};var wc=/%20/g,xc=/\[\]$/,yc=/\r?\n/g,zc=/^(?:submit|button|image|reset|file)$/i,Ac=/^(?:input|select|textarea|keygen)/i;function Bc(a,b,c,d){var e;if(n.isArray(b))n.each(b,function(b,e){c||xc.test(a)?d(a,e):Bc(a+"["+("object"==typeof e?b:"")+"]",e,c,d)});else if(c||"object"!==n.type(b))d(a,b);else for(e in b)Bc(a+"["+e+"]",b[e],c,d)}n.param=function(a,b){var c,d=[],e=function(a,b){b=n.isFunction(b)?b():null==b?"":b,d[d.length]=encodeURIComponent(a)+"="+encodeURIComponent(b)};if(void 0===b&&(b=n.ajaxSettings&&n.ajaxSettings.traditional),n.isArray(a)||a.jquery&&!n.isPlainObject(a))n.each(a,function(){e(this.name,this.value)});else for(c in a)Bc(c,a[c],b,e);return d.join("&").replace(wc,"+")},n.fn.extend({serialize:function(){return n.param(this.serializeArray())},serializeArray:function(){return this.map(function(){var a=n.prop(this,"elements");return a?n.makeArray(a):this}).filter(function(){var a=this.type;return this.name&&!n(this).is(":disabled")&&Ac.test(this.nodeName)&&!zc.test(a)&&(this.checked||!T.test(a))}).map(function(a,b){var c=n(this).val();return null==c?null:n.isArray(c)?n.map(c,function(a){return{name:b.name,value:a.replace(yc,"\r\n")}}):{name:b.name,value:c.replace(yc,"\r\n")}}).get()}}),n.ajaxSettings.xhr=function(){try{return new XMLHttpRequest}catch(a){}};var Cc=0,Dc={},Ec={0:200,1223:204},Fc=n.ajaxSettings.xhr();a.ActiveXObject&&n(a).on("unload",function(){for(var a in Dc)Dc[a]()}),k.cors=!!Fc&&"withCredentials"in Fc,k.ajax=Fc=!!Fc,n.ajaxTransport(function(a){var b;return k.cors||Fc&&!a.crossDomain?{send:function(c,d){var e,f=a.xhr(),g=++Cc;if(f.open(a.type,a.url,a.async,a.username,a.password),a.xhrFields)for(e in a.xhrFields)f[e]=a.xhrFields[e];a.mimeType&&f.overrideMimeType&&f.overrideMimeType(a.mimeType),a.crossDomain||c["X-Requested-With"]||(c["X-Requested-With"]="XMLHttpRequest");for(e in c)f.setRequestHeader(e,c[e]);b=function(a){return function(){b&&(delete Dc[g],b=f.onload=f.onerror=null,"abort"===a?f.abort():"error"===a?d(f.status,f.statusText):d(Ec[f.status]||f.status,f.statusText,"string"==typeof f.responseText?{text:f.responseText}:void 0,f.getAllResponseHeaders()))}},f.onload=b(),f.onerror=b("error"),b=Dc[g]=b("abort");try{f.send(a.hasContent&&a.data||null)}catch(h){if(b)throw h}},abort:function(){b&&b()}}:void 0}),n.ajaxSetup({accepts:{script:"text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"},contents:{script:/(?:java|ecma)script/},converters:{"text script":function(a){return n.globalEval(a),a}}}),n.ajaxPrefilter("script",function(a){void 0===a.cache&&(a.cache=!1),a.crossDomain&&(a.type="GET")}),n.ajaxTransport("script",function(a){if(a.crossDomain){var b,c;return{send:function(d,e){b=n("<script>").prop({async:!0,charset:a.scriptCharset,src:a.url}).on("load error",c=function(a){b.remove(),c=null,a&&e("error"===a.type?404:200,a.type)}),l.head.appendChild(b[0])},abort:function(){c&&c()}}}});var Gc=[],Hc=/(=)\?(?=&|$)|\?\?/;n.ajaxSetup({jsonp:"callback",jsonpCallback:function(){var a=Gc.pop()||n.expando+"_"+cc++;return this[a]=!0,a}}),n.ajaxPrefilter("json jsonp",function(b,c,d){var e,f,g,h=b.jsonp!==!1&&(Hc.test(b.url)?"url":"string"==typeof b.data&&!(b.contentType||"").indexOf("application/x-www-form-urlencoded")&&Hc.test(b.data)&&"data");return h||"jsonp"===b.dataTypes[0]?(e=b.jsonpCallback=n.isFunction(b.jsonpCallback)?b.jsonpCallback():b.jsonpCallback,h?b[h]=b[h].replace(Hc,"$1"+e):b.jsonp!==!1&&(b.url+=(dc.test(b.url)?"&":"?")+b.jsonp+"="+e),b.converters["script json"]=function(){return g||n.error(e+" was not called"),g[0]},b.dataTypes[0]="json",f=a[e],a[e]=function(){g=arguments},d.always(function(){a[e]=f,b[e]&&(b.jsonpCallback=c.jsonpCallback,Gc.push(e)),g&&n.isFunction(f)&&f(g[0]),g=f=void 0}),"script"):void 0}),n.parseHTML=function(a,b,c){if(!a||"string"!=typeof a)return null;"boolean"==typeof b&&(c=b,b=!1),b=b||l;var d=v.exec(a),e=!c&&[];return d?[b.createElement(d[1])]:(d=n.buildFragment([a],b,e),e&&e.length&&n(e).remove(),n.merge([],d.childNodes))};var Ic=n.fn.load;n.fn.load=function(a,b,c){if("string"!=typeof a&&Ic)return Ic.apply(this,arguments);var d,e,f,g=this,h=a.indexOf(" ");return h>=0&&(d=n.trim(a.slice(h)),a=a.slice(0,h)),n.isFunction(b)?(c=b,b=void 0):b&&"object"==typeof b&&(e="POST"),g.length>0&&n.ajax({url:a,type:e,dataType:"html",data:b}).done(function(a){f=arguments,g.html(d?n("<div>").append(n.parseHTML(a)).find(d):a)}).complete(c&&function(a,b){g.each(c,f||[a.responseText,b,a])}),this},n.expr.filters.animated=function(a){return n.grep(n.timers,function(b){return a===b.elem}).length};var Jc=a.document.documentElement;function Kc(a){return n.isWindow(a)?a:9===a.nodeType&&a.defaultView}n.offset={setOffset:function(a,b,c){var d,e,f,g,h,i,j,k=n.css(a,"position"),l=n(a),m={};"static"===k&&(a.style.position="relative"),h=l.offset(),f=n.css(a,"top"),i=n.css(a,"left"),j=("absolute"===k||"fixed"===k)&&(f+i).indexOf("auto")>-1,j?(d=l.position(),g=d.top,e=d.left):(g=parseFloat(f)||0,e=parseFloat(i)||0),n.isFunction(b)&&(b=b.call(a,c,h)),null!=b.top&&(m.top=b.top-h.top+g),null!=b.left&&(m.left=b.left-h.left+e),"using"in b?b.using.call(a,m):l.css(m)}},n.fn.extend({offset:function(a){if(arguments.length)return void 0===a?this:this.each(function(b){n.offset.setOffset(this,a,b)});var b,c,d=this[0],e={top:0,left:0},f=d&&d.ownerDocument;if(f)return b=f.documentElement,n.contains(b,d)?(typeof d.getBoundingClientRect!==U&&(e=d.getBoundingClientRect()),c=Kc(f),{top:e.top+c.pageYOffset-b.clientTop,left:e.left+c.pageXOffset-b.clientLeft}):e},position:function(){if(this[0]){var a,b,c=this[0],d={top:0,left:0};return"fixed"===n.css(c,"position")?b=c.getBoundingClientRect():(a=this.offsetParent(),b=this.offset(),n.nodeName(a[0],"html")||(d=a.offset()),d.top+=n.css(a[0],"borderTopWidth",!0),d.left+=n.css(a[0],"borderLeftWidth",!0)),{top:b.top-d.top-n.css(c,"marginTop",!0),left:b.left-d.left-n.css(c,"marginLeft",!0)}}},offsetParent:function(){return this.map(function(){var a=this.offsetParent||Jc;while(a&&!n.nodeName(a,"html")&&"static"===n.css(a,"position"))a=a.offsetParent;return a||Jc})}}),n.each({scrollLeft:"pageXOffset",scrollTop:"pageYOffset"},function(b,c){var d="pageYOffset"===c;n.fn[b]=function(e){return J(this,function(b,e,f){var g=Kc(b);return void 0===f?g?g[c]:b[e]:void(g?g.scrollTo(d?a.pageXOffset:f,d?f:a.pageYOffset):b[e]=f)},b,e,arguments.length,null)}}),n.each(["top","left"],function(a,b){n.cssHooks[b]=yb(k.pixelPosition,function(a,c){return c?(c=xb(a,b),vb.test(c)?n(a).position()[b]+"px":c):void 0})}),n.each({Height:"height",Width:"width"},function(a,b){n.each({padding:"inner"+a,content:b,"":"outer"+a},function(c,d){n.fn[d]=function(d,e){var f=arguments.length&&(c||"boolean"!=typeof d),g=c||(d===!0||e===!0?"margin":"border");return J(this,function(b,c,d){var e;return n.isWindow(b)?b.document.documentElement["client"+a]:9===b.nodeType?(e=b.documentElement,Math.max(b.body["scroll"+a],e["scroll"+a],b.body["offset"+a],e["offset"+a],e["client"+a])):void 0===d?n.css(b,c,g):n.style(b,c,d,g)},b,f?d:void 0,f,null)}})}),n.fn.size=function(){return this.length},n.fn.andSelf=n.fn.addBack,"function"==typeof define&&define.amd&&define("jquery",[],function(){return n});var Lc=a.jQuery,Mc=a.$;return n.noConflict=function(b){return a.$===n&&(a.$=Mc),b&&a.jQuery===n&&(a.jQuery=Lc),n},typeof b===U&&(a.jQuery=a.$=n),n});

/*
 * jQuery Easing v1.3 - http://gsgd.co.uk/sandbox/jquery/easing/
 *
 * Uses the built in easing capabilities added In jQuery 1.1
 * to offer multiple easing options
 *
 * TERMS OF USE - jQuery Easing
 * 
 * Open source under the BSD License. 
 * 
 * Copyright Â© 2008 George McGinley Smith
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without modification, 
 * are permitted provided that the following conditions are met:
 * 
 * Redistributions of source code must retain the above copyright notice, this list of 
 * conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice, this list 
 * of conditions and the following disclaimer in the documentation and/or other materials 
 * provided with the distribution.
 * 
 * Neither the name of the author nor the names of contributors may be used to endorse 
 * or promote products derived from this software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY 
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
 *  COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 *  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
 *  GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED 
 * AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 *  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED 
 * OF THE POSSIBILITY OF SUCH DAMAGE. 
 *
*/

// t: current time, b: begInnIng value, c: change In value, d: duration
jQuery.easing['jswing'] = jQuery.easing['swing'];

jQuery.extend( jQuery.easing,
{
	def: 'easeOutQuad',
	swing: function (x, t, b, c, d) {
		//alert(jQuery.easing.default);
		return jQuery.easing[jQuery.easing.def](x, t, b, c, d);
	},
	easeInQuad: function (x, t, b, c, d) {
		return c*(t/=d)*t + b;
	},
	easeOutQuad: function (x, t, b, c, d) {
		return -c *(t/=d)*(t-2) + b;
	},
	easeInOutQuad: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t + b;
		return -c/2 * ((--t)*(t-2) - 1) + b;
	},
	easeInCubic: function (x, t, b, c, d) {
		return c*(t/=d)*t*t + b;
	},
	easeOutCubic: function (x, t, b, c, d) {
		return c*((t=t/d-1)*t*t + 1) + b;
	},
	easeInOutCubic: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t*t + b;
		return c/2*((t-=2)*t*t + 2) + b;
	},
	easeInQuart: function (x, t, b, c, d) {
		return c*(t/=d)*t*t*t + b;
	},
	easeOutQuart: function (x, t, b, c, d) {
		return -c * ((t=t/d-1)*t*t*t - 1) + b;
	},
	easeInOutQuart: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t*t*t + b;
		return -c/2 * ((t-=2)*t*t*t - 2) + b;
	},
	easeInQuint: function (x, t, b, c, d) {
		return c*(t/=d)*t*t*t*t + b;
	},
	easeOutQuint: function (x, t, b, c, d) {
		return c*((t=t/d-1)*t*t*t*t + 1) + b;
	},
	easeInOutQuint: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
		return c/2*((t-=2)*t*t*t*t + 2) + b;
	},
	easeInSine: function (x, t, b, c, d) {
		return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
	},
	easeOutSine: function (x, t, b, c, d) {
		return c * Math.sin(t/d * (Math.PI/2)) + b;
	},
	easeInOutSine: function (x, t, b, c, d) {
		return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
	},
	easeInExpo: function (x, t, b, c, d) {
		return (t==0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;
	},
	easeOutExpo: function (x, t, b, c, d) {
		return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
	},
	easeInOutExpo: function (x, t, b, c, d) {
		if (t==0) return b;
		if (t==d) return b+c;
		if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
		return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
	},
	easeInCirc: function (x, t, b, c, d) {
		return -c * (Math.sqrt(1 - (t/=d)*t) - 1) + b;
	},
	easeOutCirc: function (x, t, b, c, d) {
		return c * Math.sqrt(1 - (t=t/d-1)*t) + b;
	},
	easeInOutCirc: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
		return c/2 * (Math.sqrt(1 - (t-=2)*t) + 1) + b;
	},
	easeInElastic: function (x, t, b, c, d) {
		var s=1.70158;var p=0;var a=c;
		if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
		if (a < Math.abs(c)) { a=c; var s=p/4; }
		else var s = p/(2*Math.PI) * Math.asin (c/a);
		return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
	},
	easeOutElastic: function (x, t, b, c, d) {
		var s=1.70158;var p=0;var a=c;
		if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
		if (a < Math.abs(c)) { a=c; var s=p/4; }
		else var s = p/(2*Math.PI) * Math.asin (c/a);
		return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
	},
	easeInOutElastic: function (x, t, b, c, d) {
		var s=1.70158;var p=0;var a=c;
		if (t==0) return b;  if ((t/=d/2)==2) return b+c;  if (!p) p=d*(.3*1.5);
		if (a < Math.abs(c)) { a=c; var s=p/4; }
		else var s = p/(2*Math.PI) * Math.asin (c/a);
		if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
		return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )*.5 + c + b;
	},
	easeInBack: function (x, t, b, c, d, s) {
		if (s == undefined) s = 1.70158;
		return c*(t/=d)*t*((s+1)*t - s) + b;
	},
	easeOutBack: function (x, t, b, c, d, s) {
		if (s == undefined) s = 1.70158;
		return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
	},
	easeInOutBack: function (x, t, b, c, d, s) {
		if (s == undefined) s = 1.70158; 
		if ((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
		return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
	},
	easeInBounce: function (x, t, b, c, d) {
		return c - jQuery.easing.easeOutBounce (x, d-t, 0, c, d) + b;
	},
	easeOutBounce: function (x, t, b, c, d) {
		if ((t/=d) < (1/2.75)) {
			return c*(7.5625*t*t) + b;
		} else if (t < (2/2.75)) {
			return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
		} else if (t < (2.5/2.75)) {
			return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
		} else {
			return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
		}
	},
	easeInOutBounce: function (x, t, b, c, d) {
		if (t < d/2) return jQuery.easing.easeInBounce (x, t*2, 0, c, d) * .5 + b;
		return jQuery.easing.easeOutBounce (x, t*2-d, 0, c, d) * .5 + c*.5 + b;
	}
});
(function( window ) {
    var Tap = {};

    var utils = {};

    utils.attachEvent = function( element, eventName, callback ) {
        return element.addEventListener( eventName, callback, false );
    };

    utils.fireFakeEvent = function( e, eventName ) {
        return e.target.dispatchEvent( utils.createEvent( eventName ) );
    };

    utils.createEvent = function( name ) {
        var evnt = window.document.createEvent( 'HTMLEvents' );
        evnt.initEvent( name, true, true );
        evnt.eventName = name;

        return evnt;
    };

    utils.getRealEvent = function( e ) {
        return e.originalEvent && e.originalEvent.touches && e.originalEvent.touches.length ? e.originalEvent.touches[ 0 ] : e;
    };

    var eventMatrix = [{
        // Touchable devices
        test: ( 'propertyIsEnumerable' in window || 'hasOwnProperty' in document ) && ( window.propertyIsEnumerable( 'ontouchstart' ) || document.hasOwnProperty( 'ontouchstart') ),
        events: {
            start: 'touchstart',
            move: 'touchmove',
            end: 'touchend'
        }
    }, {
        // IE10
        test: window.navigator.msPointerEnabled,
        events: {
            start: 'MSPointerDown',
            move: 'MSPointerMove',
            end: 'MSPointerUp'
        }
    }, {
        // Modern device agnostic web
        test: window.navigator.pointerEnabled,
        events: {
            start: 'pointerdown',
            move: 'pointermove',
            end: 'pointerup'
        }
    }];

    Tap.options = {
        eventName: 'tap',
        fingerMaxOffset: 11
    };

    var attachDeviceEvent, init, handlers, deviceEvents,
        coords = {};

    attachDeviceEvent = function( eventName ) {
        return utils.attachEvent( document.body, deviceEvents[ eventName ], handlers[ eventName ] );
    };

    handlers = {
        start: function( e ) {
            e = utils.getRealEvent( e );

            coords.start = [ e.pageX, e.pageY ];
            coords.offset = [ 0, 0 ];
        },

        move: function( e ) {
            if (!coords['start'] && !coords['move']) return false;

            e = utils.getRealEvent( e );

            coords.move = [ e.pageX, e.pageY ];
            coords.offset = [
                Math.abs( coords.move[ 0 ] - coords.start[ 0 ] ),
                Math.abs( coords.move[ 1 ] - coords.start[ 1 ] )
            ];
        },

        end: function( e ) {
            e = utils.getRealEvent( e );

            if ( coords.offset[ 0 ] < Tap.options.fingerMaxOffset && coords.offset[ 1 ] < Tap.options.fingerMaxOffset && !utils.fireFakeEvent( e, Tap.options.eventName ) ) {
                if ( window.navigator.msPointerEnabled || window.navigator.pointerEnabled ) {
                    var preventDefault = function( clickEvent ) {
                        clickEvent.preventDefault();
                        e.target.removeEventListener( 'click', preventDefault );
                    };

                    e.target.addEventListener( 'click', preventDefault, false );
                }

                e.preventDefault();
            }

            coords = {};
        },

        click: function( e ) {
            if ( !utils.fireFakeEvent( e, Tap.options.eventName ) ) {
                return e.preventDefault();
            }
        }
    };

    init = function() {
        for ( var i = 0, l = eventMatrix.length; i < l; i++ ) {
            if ( eventMatrix[ i ].test ) {
                deviceEvents = eventMatrix[ i ].events;

                attachDeviceEvent( 'start' );
                attachDeviceEvent( 'move' );
                attachDeviceEvent( 'end' );

                return false;
            }
        }

        return utils.attachEvent( document.body, 'click', handlers[ 'click' ] );
    };

    utils.attachEvent( window, 'load', init );

    window.Tap = Tap;

})( window );
/*!

 Copyright (c) 2011 Peter van der Spek

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.

 */(function(a){function m(){if(!d){d=!0;for(var c in b)a(c).each(function(){var d,e;d=a(this),e=d.data("jqae"),(e.containerWidth!=d.width()||e.containerHeight!=d.height())&&f(d,b[c])});d=!1}}function l(a){b[a]&&(delete b[a],b.length||c&&(window.clearInterval(c),c=undefined))}function k(a,d){b[a]=d,c||(c=window.setInterval(function(){m()},200))}function j(){return this.nodeType===3}function i(b){if(b.contents().length){var c=b.contents(),d=c.eq(c.length-1);if(d.filter(j).length){var e=d.get(0).nodeValue;e=a.trim(e);if(e==""){d.remove();return!0}return!1}while(i(d));if(d.contents().length)return!1;d.remove();return!0}return!1}function h(a){if(a.contents().length){var b=a.contents(),c=b.eq(b.length-1);return c.filter(j).length?c:h(c)}a.append("");var b=a.contents();return b.eq(b.length-1)}function g(b){var c=h(b);if(c.length){var d=c.get(0).nodeValue,e=d.lastIndexOf(" ");e>-1?(d=a.trim(d.substring(0,e)),c.get(0).nodeValue=d):c.get(0).nodeValue="";return!0}return!1}function f(b,c){var d=b.data("jqae");d||(d={});var e=d.wrapperElement;e||(e=b.wrapInner("<div/>").find(">div"),e.css({margin:0,padding:0,border:0}));var f=e.data("jqae");f||(f={});var j=f.originalContent;j?e=f.originalContent.clone(!0).data("jqae",{originalContent:j}).replaceAll(e):e.data("jqae",{originalContent:e.clone(!0)}),b.data("jqae",{wrapperElement:e,containerWidth:b.width(),containerHeight:b.height()});var k=b.height(),l=(parseInt(b.css("padding-top"),10)||0)+(parseInt(b.css("border-top-width"),10)||0)-(e.offset().top-b.offset().top),m=!1,n=e;c.selector&&(n=a(e.find(c.selector).get().reverse())),n.each(function(){var b=a(this),d=b.text(),f=!1;if(e.innerHeight()-b.innerHeight()>k+l)b.remove();else{i(b);if(b.contents().length){m&&(h(b).get(0).nodeValue+=c.ellipsis,m=!1);while(e.innerHeight()>k+l){f=g(b);if(!f){m=!0,b.remove();break}i(b);if(b.contents().length)h(b).get(0).nodeValue+=c.ellipsis;else{m=!0,b.remove();break}}c.setTitle=="onEllipsis"&&f||c.setTitle=="always"?b.attr("title",d):c.setTitle!="never"&&b.removeAttr("title")}}})}var b={},c,d=!1,e={ellipsis:"...",setTitle:"never",live:!1};a.fn.ellipsis=function(b,c){var d,g;d=a(this),typeof b!="string"&&(c=b,b=undefined),g=a.extend({},e,c),g.selector=b,d.each(function(){var b=a(this);f(b,g)}),g.live?k(d.selector,g):l(d.selector);return this}})(jQuery)
/*
    json2.js
    2014-02-04

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    See http://www.JSON.org/js.html


    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html

    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.


    This file creates a global JSON object containing two methods: stringify
    and parse.

        JSON.stringify(value, replacer, space)
            value       any JavaScript value, usually an object or array.

            replacer    an optional parameter that determines how object
                        values are stringified for objects. It can be a
                        function or an array of strings.

            space       an optional parameter that specifies the indentation
                        of nested structures. If it is omitted, the text will
                        be packed without extra whitespace. If it is a number,
                        it will specify the number of spaces to indent at each
                        level. If it is a string (such as '\t' or '&nbsp;'),
                        it contains the characters used to indent at each level.

            This method produces a JSON text from a JavaScript value.

            When an object value is found, if the object contains a toJSON
            method, its toJSON method will be called and the result will be
            stringified. A toJSON method does not serialize: it returns the
            value represented by the name/value pair that should be serialized,
            or undefined if nothing should be serialized. The toJSON method
            will be passed the key associated with the value, and this will be
            bound to the value

            For example, this would serialize Dates as ISO strings.

                Date.prototype.toJSON = function (key) {
                    function f(n) {
                        // Format integers to have at least two digits.
                        return n < 10 ? '0' + n : n;
                    }

                    return this.getUTCFullYear()   + '-' +
                         f(this.getUTCMonth() + 1) + '-' +
                         f(this.getUTCDate())      + 'T' +
                         f(this.getUTCHours())     + ':' +
                         f(this.getUTCMinutes())   + ':' +
                         f(this.getUTCSeconds())   + 'Z';
                };

            You can provide an optional replacer method. It will be passed the
            key and value of each member, with this bound to the containing
            object. The value that is returned from your method will be
            serialized. If your method returns undefined, then the member will
            be excluded from the serialization.

            If the replacer parameter is an array of strings, then it will be
            used to select the members to be serialized. It filters the results
            such that only members with keys listed in the replacer array are
            stringified.

            Values that do not have JSON representations, such as undefined or
            functions, will not be serialized. Such values in objects will be
            dropped; in arrays they will be replaced with null. You can use
            a replacer function to replace those with JSON values.
            JSON.stringify(undefined) returns undefined.

            The optional space parameter produces a stringification of the
            value that is filled with line breaks and indentation to make it
            easier to read.

            If the space parameter is a non-empty string, then that string will
            be used for indentation. If the space parameter is a number, then
            the indentation will be that many spaces.

            Example:

            text = JSON.stringify(['e', {pluribus: 'unum'}]);
            // text is '["e",{"pluribus":"unum"}]'


            text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
            // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

            text = JSON.stringify([new Date()], function (key, value) {
                return this[key] instanceof Date ?
                    'Date(' + this[key] + ')' : value;
            });
            // text is '["Date(---current time---)"]'


        JSON.parse(text, reviver)
            This method parses a JSON text to produce an object or array.
            It can throw a SyntaxError exception.

            The optional reviver parameter is a function that can filter and
            transform the results. It receives each of the keys and values,
            and its return value is used instead of the original value.
            If it returns what it received, then the structure is not modified.
            If it returns undefined then the member is deleted.

            Example:

            // Parse the text. Values that look like ISO date strings will
            // be converted to Date objects.

            myData = JSON.parse(text, function (key, value) {
                var a;
                if (typeof value === 'string') {
                    a =
/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
                    if (a) {
                        return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
                            +a[5], +a[6]));
                    }
                }
                return value;
            });

            myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
                var d;
                if (typeof value === 'string' &&
                        value.slice(0, 5) === 'Date(' &&
                        value.slice(-1) === ')') {
                    d = new Date(value.slice(5, -1));
                    if (d) {
                        return d;
                    }
                }
                return value;
            });


    This is a reference implementation. You are free to copy, modify, or
    redistribute.
*/

/*jslint evil: true, regexp: true */

/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
    call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
    lastIndex, length, parse, prototype, push, replace, slice, stringify,
    test, toJSON, toString, valueOf
*/


// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.

if (typeof JSON !== 'object') {
    JSON = {};
}

(function () {
    'use strict';

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function () {

            return isFinite(this.valueOf())
                ? this.getUTCFullYear()     + '-' +
                    f(this.getUTCMonth() + 1) + '-' +
                    f(this.getUTCDate())      + 'T' +
                    f(this.getUTCHours())     + ':' +
                    f(this.getUTCMinutes())   + ':' +
                    f(this.getUTCSeconds())   + 'Z'
                : null;
        };

        String.prototype.toJSON      =
            Number.prototype.toJSON  =
            Boolean.prototype.toJSON = function () {
                return this.valueOf();
            };
    }

    var cx,
        escapable,
        gap,
        indent,
        meta,
        rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        escapable.lastIndex = 0;
        return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
            var c = meta[a];
            return typeof c === 'string'
                ? c
                : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"' : '"' + string + '"';
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
        case 'string':
            return quote(value);

        case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

            return isFinite(value) ? String(value) : 'null';

        case 'boolean':
        case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

            return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

        case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

            if (!value) {
                return 'null';
            }

// Make an array to hold the partial results of stringifying this object value.

            gap += indent;
            partial = [];

// Is the value an array?

            if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                v = partial.length === 0
                    ? '[]'
                    : gap
                    ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']'
                    : '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }

// If the replacer is an array, use it to select the members to be stringified.

            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    if (typeof rep[i] === 'string') {
                        k = rep[i];
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {

// Otherwise, iterate through all of the keys in the object.

                for (k in value) {
                    if (Object.prototype.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

            v = partial.length === 0
                ? '{}'
                : gap
                ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}'
                : '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        };
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                    typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

            return str('', {'': value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (/^[\],:{}\s]*$/
                    .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
                        .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                        .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function'
                    ? walk({'': j}, '')
                    : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }
}());

//! moment.js
//! version : 2.8.1
//! authors : Tim Wood, Iskren Chernev, Moment.js contributors
//! license : MIT
//! momentjs.com
(function(a){function b(a,b,c){switch(arguments.length){case 2:return null!=a?a:b;case 3:return null!=a?a:null!=b?b:c;default:throw new Error("Implement me")}}function c(){return{empty:!1,unusedTokens:[],unusedInput:[],overflow:-2,charsLeftOver:0,nullInput:!1,invalidMonth:null,invalidFormat:!1,userInvalidated:!1,iso:!1}}function d(a){rb.suppressDeprecationWarnings===!1&&"undefined"!=typeof console&&console.warn&&console.warn("Deprecation warning: "+a)}function e(a,b){var c=!0;return l(function(){return c&&(d(a),c=!1),b.apply(this,arguments)},b)}function f(a,b){nc[a]||(d(b),nc[a]=!0)}function g(a,b){return function(c){return o(a.call(this,c),b)}}function h(a,b){return function(c){return this.localeData().ordinal(a.call(this,c),b)}}function i(){}function j(a,b){b!==!1&&E(a),m(this,a),this._d=new Date(+a._d)}function k(a){var b=x(a),c=b.year||0,d=b.quarter||0,e=b.month||0,f=b.week||0,g=b.day||0,h=b.hour||0,i=b.minute||0,j=b.second||0,k=b.millisecond||0;this._milliseconds=+k+1e3*j+6e4*i+36e5*h,this._days=+g+7*f,this._months=+e+3*d+12*c,this._data={},this._locale=rb.localeData(),this._bubble()}function l(a,b){for(var c in b)b.hasOwnProperty(c)&&(a[c]=b[c]);return b.hasOwnProperty("toString")&&(a.toString=b.toString),b.hasOwnProperty("valueOf")&&(a.valueOf=b.valueOf),a}function m(a,b){var c,d,e;if("undefined"!=typeof b._isAMomentObject&&(a._isAMomentObject=b._isAMomentObject),"undefined"!=typeof b._i&&(a._i=b._i),"undefined"!=typeof b._f&&(a._f=b._f),"undefined"!=typeof b._l&&(a._l=b._l),"undefined"!=typeof b._strict&&(a._strict=b._strict),"undefined"!=typeof b._tzm&&(a._tzm=b._tzm),"undefined"!=typeof b._isUTC&&(a._isUTC=b._isUTC),"undefined"!=typeof b._offset&&(a._offset=b._offset),"undefined"!=typeof b._pf&&(a._pf=b._pf),"undefined"!=typeof b._locale&&(a._locale=b._locale),Fb.length>0)for(c in Fb)d=Fb[c],e=b[d],"undefined"!=typeof e&&(a[d]=e);return a}function n(a){return 0>a?Math.ceil(a):Math.floor(a)}function o(a,b,c){for(var d=""+Math.abs(a),e=a>=0;d.length<b;)d="0"+d;return(e?c?"+":"":"-")+d}function p(a,b){var c={milliseconds:0,months:0};return c.months=b.month()-a.month()+12*(b.year()-a.year()),a.clone().add(c.months,"M").isAfter(b)&&--c.months,c.milliseconds=+b-+a.clone().add(c.months,"M"),c}function q(a,b){var c;return b=J(b,a),a.isBefore(b)?c=p(a,b):(c=p(b,a),c.milliseconds=-c.milliseconds,c.months=-c.months),c}function r(a,b){return function(c,d){var e,g;return null===d||isNaN(+d)||(f(b,"moment()."+b+"(period, number) is deprecated. Please use moment()."+b+"(number, period)."),g=c,c=d,d=g),c="string"==typeof c?+c:c,e=rb.duration(c,d),s(this,e,a),this}}function s(a,b,c,d){var e=b._milliseconds,f=b._days,g=b._months;d=null==d?!0:d,e&&a._d.setTime(+a._d+e*c),f&&lb(a,"Date",kb(a,"Date")+f*c),g&&jb(a,kb(a,"Month")+g*c),d&&rb.updateOffset(a,f||g)}function t(a){return"[object Array]"===Object.prototype.toString.call(a)}function u(a){return"[object Date]"===Object.prototype.toString.call(a)||a instanceof Date}function v(a,b,c){var d,e=Math.min(a.length,b.length),f=Math.abs(a.length-b.length),g=0;for(d=0;e>d;d++)(c&&a[d]!==b[d]||!c&&z(a[d])!==z(b[d]))&&g++;return g+f}function w(a){if(a){var b=a.toLowerCase().replace(/(.)s$/,"$1");a=gc[a]||hc[b]||b}return a}function x(a){var b,c,d={};for(c in a)a.hasOwnProperty(c)&&(b=w(c),b&&(d[b]=a[c]));return d}function y(b){var c,d;if(0===b.indexOf("week"))c=7,d="day";else{if(0!==b.indexOf("month"))return;c=12,d="month"}rb[b]=function(e,f){var g,h,i=rb._locale[b],j=[];if("number"==typeof e&&(f=e,e=a),h=function(a){var b=rb().utc().set(d,a);return i.call(rb._locale,b,e||"")},null!=f)return h(f);for(g=0;c>g;g++)j.push(h(g));return j}}function z(a){var b=+a,c=0;return 0!==b&&isFinite(b)&&(c=b>=0?Math.floor(b):Math.ceil(b)),c}function A(a,b){return new Date(Date.UTC(a,b+1,0)).getUTCDate()}function B(a,b,c){return fb(rb([a,11,31+b-c]),b,c).week}function C(a){return D(a)?366:365}function D(a){return a%4===0&&a%100!==0||a%400===0}function E(a){var b;a._a&&-2===a._pf.overflow&&(b=a._a[yb]<0||a._a[yb]>11?yb:a._a[zb]<1||a._a[zb]>A(a._a[xb],a._a[yb])?zb:a._a[Ab]<0||a._a[Ab]>23?Ab:a._a[Bb]<0||a._a[Bb]>59?Bb:a._a[Cb]<0||a._a[Cb]>59?Cb:a._a[Db]<0||a._a[Db]>999?Db:-1,a._pf._overflowDayOfYear&&(xb>b||b>zb)&&(b=zb),a._pf.overflow=b)}function F(a){return null==a._isValid&&(a._isValid=!isNaN(a._d.getTime())&&a._pf.overflow<0&&!a._pf.empty&&!a._pf.invalidMonth&&!a._pf.nullInput&&!a._pf.invalidFormat&&!a._pf.userInvalidated,a._strict&&(a._isValid=a._isValid&&0===a._pf.charsLeftOver&&0===a._pf.unusedTokens.length)),a._isValid}function G(a){return a?a.toLowerCase().replace("_","-"):a}function H(a){for(var b,c,d,e,f=0;f<a.length;){for(e=G(a[f]).split("-"),b=e.length,c=G(a[f+1]),c=c?c.split("-"):null;b>0;){if(d=I(e.slice(0,b).join("-")))return d;if(c&&c.length>=b&&v(e,c,!0)>=b-1)break;b--}f++}return null}function I(a){var b=null;if(!Eb[a]&&Gb)try{b=rb.locale(),require("./locale/"+a),rb.locale(b)}catch(c){}return Eb[a]}function J(a,b){return b._isUTC?rb(a).zone(b._offset||0):rb(a).local()}function K(a){return a.match(/\[[\s\S]/)?a.replace(/^\[|\]$/g,""):a.replace(/\\/g,"")}function L(a){var b,c,d=a.match(Kb);for(b=0,c=d.length;c>b;b++)d[b]=mc[d[b]]?mc[d[b]]:K(d[b]);return function(e){var f="";for(b=0;c>b;b++)f+=d[b]instanceof Function?d[b].call(e,a):d[b];return f}}function M(a,b){return a.isValid()?(b=N(b,a.localeData()),ic[b]||(ic[b]=L(b)),ic[b](a)):a.localeData().invalidDate()}function N(a,b){function c(a){return b.longDateFormat(a)||a}var d=5;for(Lb.lastIndex=0;d>=0&&Lb.test(a);)a=a.replace(Lb,c),Lb.lastIndex=0,d-=1;return a}function O(a,b){var c,d=b._strict;switch(a){case"Q":return Wb;case"DDDD":return Yb;case"YYYY":case"GGGG":case"gggg":return d?Zb:Ob;case"Y":case"G":case"g":return _b;case"YYYYYY":case"YYYYY":case"GGGGG":case"ggggg":return d?$b:Pb;case"S":if(d)return Wb;case"SS":if(d)return Xb;case"SSS":if(d)return Yb;case"DDD":return Nb;case"MMM":case"MMMM":case"dd":case"ddd":case"dddd":return Rb;case"a":case"A":return b._locale._meridiemParse;case"X":return Ub;case"Z":case"ZZ":return Sb;case"T":return Tb;case"SSSS":return Qb;case"MM":case"DD":case"YY":case"GG":case"gg":case"HH":case"hh":case"mm":case"ss":case"ww":case"WW":return d?Xb:Mb;case"M":case"D":case"d":case"H":case"h":case"m":case"s":case"w":case"W":case"e":case"E":return Mb;case"Do":return Vb;default:return c=new RegExp(X(W(a.replace("\\","")),"i"))}}function P(a){a=a||"";var b=a.match(Sb)||[],c=b[b.length-1]||[],d=(c+"").match(ec)||["-",0,0],e=+(60*d[1])+z(d[2]);return"+"===d[0]?-e:e}function Q(a,b,c){var d,e=c._a;switch(a){case"Q":null!=b&&(e[yb]=3*(z(b)-1));break;case"M":case"MM":null!=b&&(e[yb]=z(b)-1);break;case"MMM":case"MMMM":d=c._locale.monthsParse(b),null!=d?e[yb]=d:c._pf.invalidMonth=b;break;case"D":case"DD":null!=b&&(e[zb]=z(b));break;case"Do":null!=b&&(e[zb]=z(parseInt(b,10)));break;case"DDD":case"DDDD":null!=b&&(c._dayOfYear=z(b));break;case"YY":e[xb]=rb.parseTwoDigitYear(b);break;case"YYYY":case"YYYYY":case"YYYYYY":e[xb]=z(b);break;case"a":case"A":c._isPm=c._locale.isPM(b);break;case"H":case"HH":case"h":case"hh":e[Ab]=z(b);break;case"m":case"mm":e[Bb]=z(b);break;case"s":case"ss":e[Cb]=z(b);break;case"S":case"SS":case"SSS":case"SSSS":e[Db]=z(1e3*("0."+b));break;case"X":c._d=new Date(1e3*parseFloat(b));break;case"Z":case"ZZ":c._useUTC=!0,c._tzm=P(b);break;case"dd":case"ddd":case"dddd":d=c._locale.weekdaysParse(b),null!=d?(c._w=c._w||{},c._w.d=d):c._pf.invalidWeekday=b;break;case"w":case"ww":case"W":case"WW":case"d":case"e":case"E":a=a.substr(0,1);case"gggg":case"GGGG":case"GGGGG":a=a.substr(0,2),b&&(c._w=c._w||{},c._w[a]=z(b));break;case"gg":case"GG":c._w=c._w||{},c._w[a]=rb.parseTwoDigitYear(b)}}function R(a){var c,d,e,f,g,h,i;c=a._w,null!=c.GG||null!=c.W||null!=c.E?(g=1,h=4,d=b(c.GG,a._a[xb],fb(rb(),1,4).year),e=b(c.W,1),f=b(c.E,1)):(g=a._locale._week.dow,h=a._locale._week.doy,d=b(c.gg,a._a[xb],fb(rb(),g,h).year),e=b(c.w,1),null!=c.d?(f=c.d,g>f&&++e):f=null!=c.e?c.e+g:g),i=gb(d,e,f,h,g),a._a[xb]=i.year,a._dayOfYear=i.dayOfYear}function S(a){var c,d,e,f,g=[];if(!a._d){for(e=U(a),a._w&&null==a._a[zb]&&null==a._a[yb]&&R(a),a._dayOfYear&&(f=b(a._a[xb],e[xb]),a._dayOfYear>C(f)&&(a._pf._overflowDayOfYear=!0),d=bb(f,0,a._dayOfYear),a._a[yb]=d.getUTCMonth(),a._a[zb]=d.getUTCDate()),c=0;3>c&&null==a._a[c];++c)a._a[c]=g[c]=e[c];for(;7>c;c++)a._a[c]=g[c]=null==a._a[c]?2===c?1:0:a._a[c];a._d=(a._useUTC?bb:ab).apply(null,g),null!=a._tzm&&a._d.setUTCMinutes(a._d.getUTCMinutes()+a._tzm)}}function T(a){var b;a._d||(b=x(a._i),a._a=[b.year,b.month,b.day,b.hour,b.minute,b.second,b.millisecond],S(a))}function U(a){var b=new Date;return a._useUTC?[b.getUTCFullYear(),b.getUTCMonth(),b.getUTCDate()]:[b.getFullYear(),b.getMonth(),b.getDate()]}function V(a){if(a._f===rb.ISO_8601)return void Z(a);a._a=[],a._pf.empty=!0;var b,c,d,e,f,g=""+a._i,h=g.length,i=0;for(d=N(a._f,a._locale).match(Kb)||[],b=0;b<d.length;b++)e=d[b],c=(g.match(O(e,a))||[])[0],c&&(f=g.substr(0,g.indexOf(c)),f.length>0&&a._pf.unusedInput.push(f),g=g.slice(g.indexOf(c)+c.length),i+=c.length),mc[e]?(c?a._pf.empty=!1:a._pf.unusedTokens.push(e),Q(e,c,a)):a._strict&&!c&&a._pf.unusedTokens.push(e);a._pf.charsLeftOver=h-i,g.length>0&&a._pf.unusedInput.push(g),a._isPm&&a._a[Ab]<12&&(a._a[Ab]+=12),a._isPm===!1&&12===a._a[Ab]&&(a._a[Ab]=0),S(a),E(a)}function W(a){return a.replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g,function(a,b,c,d,e){return b||c||d||e})}function X(a){return a.replace(/[-\/\\^$*+?.()|[\]{}]/g,"\\$&")}function Y(a){var b,d,e,f,g;if(0===a._f.length)return a._pf.invalidFormat=!0,void(a._d=new Date(0/0));for(f=0;f<a._f.length;f++)g=0,b=m({},a),b._pf=c(),b._f=a._f[f],V(b),F(b)&&(g+=b._pf.charsLeftOver,g+=10*b._pf.unusedTokens.length,b._pf.score=g,(null==e||e>g)&&(e=g,d=b));l(a,d||b)}function Z(a){var b,c,d=a._i,e=ac.exec(d);if(e){for(a._pf.iso=!0,b=0,c=cc.length;c>b;b++)if(cc[b][1].exec(d)){a._f=cc[b][0]+(e[6]||" ");break}for(b=0,c=dc.length;c>b;b++)if(dc[b][1].exec(d)){a._f+=dc[b][0];break}d.match(Sb)&&(a._f+="Z"),V(a)}else a._isValid=!1}function $(a){Z(a),a._isValid===!1&&(delete a._isValid,rb.createFromInputFallback(a))}function _(b){var c,d=b._i;d===a?b._d=new Date:u(d)?b._d=new Date(+d):null!==(c=Hb.exec(d))?b._d=new Date(+c[1]):"string"==typeof d?$(b):t(d)?(b._a=d.slice(0),S(b)):"object"==typeof d?T(b):"number"==typeof d?b._d=new Date(d):rb.createFromInputFallback(b)}function ab(a,b,c,d,e,f,g){var h=new Date(a,b,c,d,e,f,g);return 1970>a&&h.setFullYear(a),h}function bb(a){var b=new Date(Date.UTC.apply(null,arguments));return 1970>a&&b.setUTCFullYear(a),b}function cb(a,b){if("string"==typeof a)if(isNaN(a)){if(a=b.weekdaysParse(a),"number"!=typeof a)return null}else a=parseInt(a,10);return a}function db(a,b,c,d,e){return e.relativeTime(b||1,!!c,a,d)}function eb(a,b,c){var d=rb.duration(a).abs(),e=wb(d.as("s")),f=wb(d.as("m")),g=wb(d.as("h")),h=wb(d.as("d")),i=wb(d.as("M")),j=wb(d.as("y")),k=e<jc.s&&["s",e]||1===f&&["m"]||f<jc.m&&["mm",f]||1===g&&["h"]||g<jc.h&&["hh",g]||1===h&&["d"]||h<jc.d&&["dd",h]||1===i&&["M"]||i<jc.M&&["MM",i]||1===j&&["y"]||["yy",j];return k[2]=b,k[3]=+a>0,k[4]=c,db.apply({},k)}function fb(a,b,c){var d,e=c-b,f=c-a.day();return f>e&&(f-=7),e-7>f&&(f+=7),d=rb(a).add(f,"d"),{week:Math.ceil(d.dayOfYear()/7),year:d.year()}}function gb(a,b,c,d,e){var f,g,h=bb(a,0,1).getUTCDay();return h=0===h?7:h,c=null!=c?c:e,f=e-h+(h>d?7:0)-(e>h?7:0),g=7*(b-1)+(c-e)+f+1,{year:g>0?a:a-1,dayOfYear:g>0?g:C(a-1)+g}}function hb(b){var c=b._i,d=b._f;return b._locale=b._locale||rb.localeData(b._l),null===c||d===a&&""===c?rb.invalid({nullInput:!0}):("string"==typeof c&&(b._i=c=b._locale.preparse(c)),rb.isMoment(c)?new j(c,!0):(d?t(d)?Y(b):V(b):_(b),new j(b)))}function ib(a,b){var c,d;if(1===b.length&&t(b[0])&&(b=b[0]),!b.length)return rb();for(c=b[0],d=1;d<b.length;++d)b[d][a](c)&&(c=b[d]);return c}function jb(a,b){var c;return"string"==typeof b&&(b=a.localeData().monthsParse(b),"number"!=typeof b)?a:(c=Math.min(a.date(),A(a.year(),b)),a._d["set"+(a._isUTC?"UTC":"")+"Month"](b,c),a)}function kb(a,b){return a._d["get"+(a._isUTC?"UTC":"")+b]()}function lb(a,b,c){return"Month"===b?jb(a,c):a._d["set"+(a._isUTC?"UTC":"")+b](c)}function mb(a,b){return function(c){return null!=c?(lb(this,a,c),rb.updateOffset(this,b),this):kb(this,a)}}function nb(a){return 400*a/146097}function ob(a){return 146097*a/400}function pb(a){rb.duration.fn[a]=function(){return this._data[a]}}function qb(a){"undefined"==typeof ender&&(sb=vb.moment,vb.moment=a?e("Accessing Moment through the global scope is deprecated, and will be removed in an upcoming release.",rb):rb)}for(var rb,sb,tb,ub="2.8.1",vb="undefined"!=typeof global?global:this,wb=Math.round,xb=0,yb=1,zb=2,Ab=3,Bb=4,Cb=5,Db=6,Eb={},Fb=[],Gb="undefined"!=typeof module&&module.exports,Hb=/^\/?Date\((\-?\d+)/i,Ib=/(\-)?(?:(\d*)\.)?(\d+)\:(\d+)(?:\:(\d+)\.?(\d{3})?)?/,Jb=/^(-)?P(?:(?:([0-9,.]*)Y)?(?:([0-9,.]*)M)?(?:([0-9,.]*)D)?(?:T(?:([0-9,.]*)H)?(?:([0-9,.]*)M)?(?:([0-9,.]*)S)?)?|([0-9,.]*)W)$/,Kb=/(\[[^\[]*\])|(\\)?(Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Q|YYYYYY|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|mm?|ss?|S{1,4}|X|zz?|ZZ?|.)/g,Lb=/(\[[^\[]*\])|(\\)?(LT|LL?L?L?|l{1,4})/g,Mb=/\d\d?/,Nb=/\d{1,3}/,Ob=/\d{1,4}/,Pb=/[+\-]?\d{1,6}/,Qb=/\d+/,Rb=/[0-9]*['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF\/]+(\s*?[\u0600-\u06FF]+){1,2}/i,Sb=/Z|[\+\-]\d\d:?\d\d/gi,Tb=/T/i,Ub=/[\+\-]?\d+(\.\d{1,3})?/,Vb=/\d{1,2}/,Wb=/\d/,Xb=/\d\d/,Yb=/\d{3}/,Zb=/\d{4}/,$b=/[+-]?\d{6}/,_b=/[+-]?\d+/,ac=/^\s*(?:[+-]\d{6}|\d{4})-(?:(\d\d-\d\d)|(W\d\d$)|(W\d\d-\d)|(\d\d\d))((T| )(\d\d(:\d\d(:\d\d(\.\d+)?)?)?)?([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/,bc="YYYY-MM-DDTHH:mm:ssZ",cc=[["YYYYYY-MM-DD",/[+-]\d{6}-\d{2}-\d{2}/],["YYYY-MM-DD",/\d{4}-\d{2}-\d{2}/],["GGGG-[W]WW-E",/\d{4}-W\d{2}-\d/],["GGGG-[W]WW",/\d{4}-W\d{2}/],["YYYY-DDD",/\d{4}-\d{3}/]],dc=[["HH:mm:ss.SSSS",/(T| )\d\d:\d\d:\d\d\.\d+/],["HH:mm:ss",/(T| )\d\d:\d\d:\d\d/],["HH:mm",/(T| )\d\d:\d\d/],["HH",/(T| )\d\d/]],ec=/([\+\-]|\d\d)/gi,fc=("Date|Hours|Minutes|Seconds|Milliseconds".split("|"),{Milliseconds:1,Seconds:1e3,Minutes:6e4,Hours:36e5,Days:864e5,Months:2592e6,Years:31536e6}),gc={ms:"millisecond",s:"second",m:"minute",h:"hour",d:"day",D:"date",w:"week",W:"isoWeek",M:"month",Q:"quarter",y:"year",DDD:"dayOfYear",e:"weekday",E:"isoWeekday",gg:"weekYear",GG:"isoWeekYear"},hc={dayofyear:"dayOfYear",isoweekday:"isoWeekday",isoweek:"isoWeek",weekyear:"weekYear",isoweekyear:"isoWeekYear"},ic={},jc={s:45,m:45,h:22,d:26,M:11},kc="DDD w W M D d".split(" "),lc="M D H h m s w W".split(" "),mc={M:function(){return this.month()+1},MMM:function(a){return this.localeData().monthsShort(this,a)},MMMM:function(a){return this.localeData().months(this,a)},D:function(){return this.date()},DDD:function(){return this.dayOfYear()},d:function(){return this.day()},dd:function(a){return this.localeData().weekdaysMin(this,a)},ddd:function(a){return this.localeData().weekdaysShort(this,a)},dddd:function(a){return this.localeData().weekdays(this,a)},w:function(){return this.week()},W:function(){return this.isoWeek()},YY:function(){return o(this.year()%100,2)},YYYY:function(){return o(this.year(),4)},YYYYY:function(){return o(this.year(),5)},YYYYYY:function(){var a=this.year(),b=a>=0?"+":"-";return b+o(Math.abs(a),6)},gg:function(){return o(this.weekYear()%100,2)},gggg:function(){return o(this.weekYear(),4)},ggggg:function(){return o(this.weekYear(),5)},GG:function(){return o(this.isoWeekYear()%100,2)},GGGG:function(){return o(this.isoWeekYear(),4)},GGGGG:function(){return o(this.isoWeekYear(),5)},e:function(){return this.weekday()},E:function(){return this.isoWeekday()},a:function(){return this.localeData().meridiem(this.hours(),this.minutes(),!0)},A:function(){return this.localeData().meridiem(this.hours(),this.minutes(),!1)},H:function(){return this.hours()},h:function(){return this.hours()%12||12},m:function(){return this.minutes()},s:function(){return this.seconds()},S:function(){return z(this.milliseconds()/100)},SS:function(){return o(z(this.milliseconds()/10),2)},SSS:function(){return o(this.milliseconds(),3)},SSSS:function(){return o(this.milliseconds(),3)},Z:function(){var a=-this.zone(),b="+";return 0>a&&(a=-a,b="-"),b+o(z(a/60),2)+":"+o(z(a)%60,2)},ZZ:function(){var a=-this.zone(),b="+";return 0>a&&(a=-a,b="-"),b+o(z(a/60),2)+o(z(a)%60,2)},z:function(){return this.zoneAbbr()},zz:function(){return this.zoneName()},X:function(){return this.unix()},Q:function(){return this.quarter()}},nc={},oc=["months","monthsShort","weekdays","weekdaysShort","weekdaysMin"];kc.length;)tb=kc.pop(),mc[tb+"o"]=h(mc[tb],tb);for(;lc.length;)tb=lc.pop(),mc[tb+tb]=g(mc[tb],2);mc.DDDD=g(mc.DDD,3),l(i.prototype,{set:function(a){var b,c;for(c in a)b=a[c],"function"==typeof b?this[c]=b:this["_"+c]=b},_months:"January_February_March_April_May_June_July_August_September_October_November_December".split("_"),months:function(a){return this._months[a.month()]},_monthsShort:"Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec".split("_"),monthsShort:function(a){return this._monthsShort[a.month()]},monthsParse:function(a){var b,c,d;for(this._monthsParse||(this._monthsParse=[]),b=0;12>b;b++)if(this._monthsParse[b]||(c=rb.utc([2e3,b]),d="^"+this.months(c,"")+"|^"+this.monthsShort(c,""),this._monthsParse[b]=new RegExp(d.replace(".",""),"i")),this._monthsParse[b].test(a))return b},_weekdays:"Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),weekdays:function(a){return this._weekdays[a.day()]},_weekdaysShort:"Sun_Mon_Tue_Wed_Thu_Fri_Sat".split("_"),weekdaysShort:function(a){return this._weekdaysShort[a.day()]},_weekdaysMin:"Su_Mo_Tu_We_Th_Fr_Sa".split("_"),weekdaysMin:function(a){return this._weekdaysMin[a.day()]},weekdaysParse:function(a){var b,c,d;for(this._weekdaysParse||(this._weekdaysParse=[]),b=0;7>b;b++)if(this._weekdaysParse[b]||(c=rb([2e3,1]).day(b),d="^"+this.weekdays(c,"")+"|^"+this.weekdaysShort(c,"")+"|^"+this.weekdaysMin(c,""),this._weekdaysParse[b]=new RegExp(d.replace(".",""),"i")),this._weekdaysParse[b].test(a))return b},_longDateFormat:{LT:"h:mm A",L:"MM/DD/YYYY",LL:"MMMM D, YYYY",LLL:"MMMM D, YYYY LT",LLLL:"dddd, MMMM D, YYYY LT"},longDateFormat:function(a){var b=this._longDateFormat[a];return!b&&this._longDateFormat[a.toUpperCase()]&&(b=this._longDateFormat[a.toUpperCase()].replace(/MMMM|MM|DD|dddd/g,function(a){return a.slice(1)}),this._longDateFormat[a]=b),b},isPM:function(a){return"p"===(a+"").toLowerCase().charAt(0)},_meridiemParse:/[ap]\.?m?\.?/i,meridiem:function(a,b,c){return a>11?c?"pm":"PM":c?"am":"AM"},_calendar:{sameDay:"[Today at] LT",nextDay:"[Tomorrow at] LT",nextWeek:"dddd [at] LT",lastDay:"[Yesterday at] LT",lastWeek:"[Last] dddd [at] LT",sameElse:"L"},calendar:function(a,b){var c=this._calendar[a];return"function"==typeof c?c.apply(b):c},_relativeTime:{future:"in %s",past:"%s ago",s:"a few seconds",m:"a minute",mm:"%d minutes",h:"an hour",hh:"%d hours",d:"a day",dd:"%d days",M:"a month",MM:"%d months",y:"a year",yy:"%d years"},relativeTime:function(a,b,c,d){var e=this._relativeTime[c];return"function"==typeof e?e(a,b,c,d):e.replace(/%d/i,a)},pastFuture:function(a,b){var c=this._relativeTime[a>0?"future":"past"];return"function"==typeof c?c(b):c.replace(/%s/i,b)},ordinal:function(a){return this._ordinal.replace("%d",a)},_ordinal:"%d",preparse:function(a){return a},postformat:function(a){return a},week:function(a){return fb(a,this._week.dow,this._week.doy).week},_week:{dow:0,doy:6},_invalidDate:"Invalid date",invalidDate:function(){return this._invalidDate}}),rb=function(b,d,e,f){var g;return"boolean"==typeof e&&(f=e,e=a),g={},g._isAMomentObject=!0,g._i=b,g._f=d,g._l=e,g._strict=f,g._isUTC=!1,g._pf=c(),hb(g)},rb.suppressDeprecationWarnings=!1,rb.createFromInputFallback=e("moment construction falls back to js Date. This is discouraged and will be removed in upcoming major release. Please refer to https://github.com/moment/moment/issues/1407 for more info.",function(a){a._d=new Date(a._i)}),rb.min=function(){var a=[].slice.call(arguments,0);return ib("isBefore",a)},rb.max=function(){var a=[].slice.call(arguments,0);return ib("isAfter",a)},rb.utc=function(b,d,e,f){var g;return"boolean"==typeof e&&(f=e,e=a),g={},g._isAMomentObject=!0,g._useUTC=!0,g._isUTC=!0,g._l=e,g._i=b,g._f=d,g._strict=f,g._pf=c(),hb(g).utc()},rb.unix=function(a){return rb(1e3*a)},rb.duration=function(a,b){var c,d,e,f,g=a,h=null;return rb.isDuration(a)?g={ms:a._milliseconds,d:a._days,M:a._months}:"number"==typeof a?(g={},b?g[b]=a:g.milliseconds=a):(h=Ib.exec(a))?(c="-"===h[1]?-1:1,g={y:0,d:z(h[zb])*c,h:z(h[Ab])*c,m:z(h[Bb])*c,s:z(h[Cb])*c,ms:z(h[Db])*c}):(h=Jb.exec(a))?(c="-"===h[1]?-1:1,e=function(a){var b=a&&parseFloat(a.replace(",","."));return(isNaN(b)?0:b)*c},g={y:e(h[2]),M:e(h[3]),d:e(h[4]),h:e(h[5]),m:e(h[6]),s:e(h[7]),w:e(h[8])}):"object"==typeof g&&("from"in g||"to"in g)&&(f=q(rb(g.from),rb(g.to)),g={},g.ms=f.milliseconds,g.M=f.months),d=new k(g),rb.isDuration(a)&&a.hasOwnProperty("_locale")&&(d._locale=a._locale),d},rb.version=ub,rb.defaultFormat=bc,rb.ISO_8601=function(){},rb.momentProperties=Fb,rb.updateOffset=function(){},rb.relativeTimeThreshold=function(b,c){return jc[b]===a?!1:c===a?jc[b]:(jc[b]=c,!0)},rb.lang=e("moment.lang is deprecated. Use moment.locale instead.",function(a,b){return rb.locale(a,b)}),rb.locale=function(a,b){var c;return a&&(c="undefined"!=typeof b?rb.defineLocale(a,b):rb.localeData(a),c&&(rb.duration._locale=rb._locale=c)),rb._locale._abbr},rb.defineLocale=function(a,b){return null!==b?(b.abbr=a,Eb[a]||(Eb[a]=new i),Eb[a].set(b),rb.locale(a),Eb[a]):(delete Eb[a],null)},rb.langData=e("moment.langData is deprecated. Use moment.localeData instead.",function(a){return rb.localeData(a)}),rb.localeData=function(a){var b;if(a&&a._locale&&a._locale._abbr&&(a=a._locale._abbr),!a)return rb._locale;if(!t(a)){if(b=I(a))return b;a=[a]}return H(a)},rb.isMoment=function(a){return a instanceof j||null!=a&&a.hasOwnProperty("_isAMomentObject")},rb.isDuration=function(a){return a instanceof k};for(tb=oc.length-1;tb>=0;--tb)y(oc[tb]);rb.normalizeUnits=function(a){return w(a)},rb.invalid=function(a){var b=rb.utc(0/0);return null!=a?l(b._pf,a):b._pf.userInvalidated=!0,b},rb.parseZone=function(){return rb.apply(null,arguments).parseZone()},rb.parseTwoDigitYear=function(a){return z(a)+(z(a)>68?1900:2e3)},l(rb.fn=j.prototype,{clone:function(){return rb(this)},valueOf:function(){return+this._d+6e4*(this._offset||0)},unix:function(){return Math.floor(+this/1e3)},toString:function(){return this.clone().locale("en").format("ddd MMM DD YYYY HH:mm:ss [GMT]ZZ")},toDate:function(){return this._offset?new Date(+this):this._d},toISOString:function(){var a=rb(this).utc();return 0<a.year()&&a.year()<=9999?M(a,"YYYY-MM-DD[T]HH:mm:ss.SSS[Z]"):M(a,"YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]")},toArray:function(){var a=this;return[a.year(),a.month(),a.date(),a.hours(),a.minutes(),a.seconds(),a.milliseconds()]},isValid:function(){return F(this)},isDSTShifted:function(){return this._a?this.isValid()&&v(this._a,(this._isUTC?rb.utc(this._a):rb(this._a)).toArray())>0:!1},parsingFlags:function(){return l({},this._pf)},invalidAt:function(){return this._pf.overflow},utc:function(a){return this.zone(0,a)},local:function(a){return this._isUTC&&(this.zone(0,a),this._isUTC=!1,a&&this.add(this._d.getTimezoneOffset(),"m")),this},format:function(a){var b=M(this,a||rb.defaultFormat);return this.localeData().postformat(b)},add:r(1,"add"),subtract:r(-1,"subtract"),diff:function(a,b,c){var d,e,f=J(a,this),g=6e4*(this.zone()-f.zone());return b=w(b),"year"===b||"month"===b?(d=432e5*(this.daysInMonth()+f.daysInMonth()),e=12*(this.year()-f.year())+(this.month()-f.month()),e+=(this-rb(this).startOf("month")-(f-rb(f).startOf("month")))/d,e-=6e4*(this.zone()-rb(this).startOf("month").zone()-(f.zone()-rb(f).startOf("month").zone()))/d,"year"===b&&(e/=12)):(d=this-f,e="second"===b?d/1e3:"minute"===b?d/6e4:"hour"===b?d/36e5:"day"===b?(d-g)/864e5:"week"===b?(d-g)/6048e5:d),c?e:n(e)},from:function(a,b){return rb.duration({to:this,from:a}).locale(this.locale()).humanize(!b)},fromNow:function(a){return this.from(rb(),a)},calendar:function(a){var b=a||rb(),c=J(b,this).startOf("day"),d=this.diff(c,"days",!0),e=-6>d?"sameElse":-1>d?"lastWeek":0>d?"lastDay":1>d?"sameDay":2>d?"nextDay":7>d?"nextWeek":"sameElse";return this.format(this.localeData().calendar(e,this))},isLeapYear:function(){return D(this.year())},isDST:function(){return this.zone()<this.clone().month(0).zone()||this.zone()<this.clone().month(5).zone()},day:function(a){var b=this._isUTC?this._d.getUTCDay():this._d.getDay();return null!=a?(a=cb(a,this.localeData()),this.add(a-b,"d")):b},month:mb("Month",!0),startOf:function(a){switch(a=w(a)){case"year":this.month(0);case"quarter":case"month":this.date(1);case"week":case"isoWeek":case"day":this.hours(0);case"hour":this.minutes(0);case"minute":this.seconds(0);case"second":this.milliseconds(0)}return"week"===a?this.weekday(0):"isoWeek"===a&&this.isoWeekday(1),"quarter"===a&&this.month(3*Math.floor(this.month()/3)),this},endOf:function(a){return a=w(a),this.startOf(a).add(1,"isoWeek"===a?"week":a).subtract(1,"ms")},isAfter:function(a,b){return b="undefined"!=typeof b?b:"millisecond",+this.clone().startOf(b)>+rb(a).startOf(b)},isBefore:function(a,b){return b="undefined"!=typeof b?b:"millisecond",+this.clone().startOf(b)<+rb(a).startOf(b)},isSame:function(a,b){return b=b||"ms",+this.clone().startOf(b)===+J(a,this).startOf(b)},min:e("moment().min is deprecated, use moment.min instead. https://github.com/moment/moment/issues/1548",function(a){return a=rb.apply(null,arguments),this>a?this:a}),max:e("moment().max is deprecated, use moment.max instead. https://github.com/moment/moment/issues/1548",function(a){return a=rb.apply(null,arguments),a>this?this:a}),zone:function(a,b){var c,d=this._offset||0;return null==a?this._isUTC?d:this._d.getTimezoneOffset():("string"==typeof a&&(a=P(a)),Math.abs(a)<16&&(a=60*a),!this._isUTC&&b&&(c=this._d.getTimezoneOffset()),this._offset=a,this._isUTC=!0,null!=c&&this.subtract(c,"m"),d!==a&&(!b||this._changeInProgress?s(this,rb.duration(d-a,"m"),1,!1):this._changeInProgress||(this._changeInProgress=!0,rb.updateOffset(this,!0),this._changeInProgress=null)),this)},zoneAbbr:function(){return this._isUTC?"UTC":""},zoneName:function(){return this._isUTC?"Coordinated Universal Time":""},parseZone:function(){return this._tzm?this.zone(this._tzm):"string"==typeof this._i&&this.zone(this._i),this},hasAlignedHourOffset:function(a){return a=a?rb(a).zone():0,(this.zone()-a)%60===0},daysInMonth:function(){return A(this.year(),this.month())},dayOfYear:function(a){var b=wb((rb(this).startOf("day")-rb(this).startOf("year"))/864e5)+1;return null==a?b:this.add(a-b,"d")},quarter:function(a){return null==a?Math.ceil((this.month()+1)/3):this.month(3*(a-1)+this.month()%3)},weekYear:function(a){var b=fb(this,this.localeData()._week.dow,this.localeData()._week.doy).year;return null==a?b:this.add(a-b,"y")},isoWeekYear:function(a){var b=fb(this,1,4).year;return null==a?b:this.add(a-b,"y")},week:function(a){var b=this.localeData().week(this);return null==a?b:this.add(7*(a-b),"d")},isoWeek:function(a){var b=fb(this,1,4).week;return null==a?b:this.add(7*(a-b),"d")},weekday:function(a){var b=(this.day()+7-this.localeData()._week.dow)%7;return null==a?b:this.add(a-b,"d")},isoWeekday:function(a){return null==a?this.day()||7:this.day(this.day()%7?a:a-7)},isoWeeksInYear:function(){return B(this.year(),1,4)},weeksInYear:function(){var a=this.localeData()._week;return B(this.year(),a.dow,a.doy)},get:function(a){return a=w(a),this[a]()},set:function(a,b){return a=w(a),"function"==typeof this[a]&&this[a](b),this},locale:function(b){return b===a?this._locale._abbr:(this._locale=rb.localeData(b),this)},lang:e("moment().lang() is deprecated. Use moment().localeData() instead.",function(b){return b===a?this.localeData():(this._locale=rb.localeData(b),this)}),localeData:function(){return this._locale}}),rb.fn.millisecond=rb.fn.milliseconds=mb("Milliseconds",!1),rb.fn.second=rb.fn.seconds=mb("Seconds",!1),rb.fn.minute=rb.fn.minutes=mb("Minutes",!1),rb.fn.hour=rb.fn.hours=mb("Hours",!0),rb.fn.date=mb("Date",!0),rb.fn.dates=e("dates accessor is deprecated. Use date instead.",mb("Date",!0)),rb.fn.year=mb("FullYear",!0),rb.fn.years=e("years accessor is deprecated. Use year instead.",mb("FullYear",!0)),rb.fn.days=rb.fn.day,rb.fn.months=rb.fn.month,rb.fn.weeks=rb.fn.week,rb.fn.isoWeeks=rb.fn.isoWeek,rb.fn.quarters=rb.fn.quarter,rb.fn.toJSON=rb.fn.toISOString,l(rb.duration.fn=k.prototype,{_bubble:function(){var a,b,c,d=this._milliseconds,e=this._days,f=this._months,g=this._data,h=0;g.milliseconds=d%1e3,a=n(d/1e3),g.seconds=a%60,b=n(a/60),g.minutes=b%60,c=n(b/60),g.hours=c%24,e+=n(c/24),h=n(nb(e)),e-=n(ob(h)),f+=n(e/30),e%=30,h+=n(f/12),f%=12,g.days=e,g.months=f,g.years=h},abs:function(){return this._milliseconds=Math.abs(this._milliseconds),this._days=Math.abs(this._days),this._months=Math.abs(this._months),this._data.milliseconds=Math.abs(this._data.milliseconds),this._data.seconds=Math.abs(this._data.seconds),this._data.minutes=Math.abs(this._data.minutes),this._data.hours=Math.abs(this._data.hours),this._data.months=Math.abs(this._data.months),this._data.years=Math.abs(this._data.years),this},weeks:function(){return n(this.days()/7)},valueOf:function(){return this._milliseconds+864e5*this._days+this._months%12*2592e6+31536e6*z(this._months/12)},humanize:function(a){var b=eb(this,!a,this.localeData());return a&&(b=this.localeData().pastFuture(+this,b)),this.localeData().postformat(b)},add:function(a,b){var c=rb.duration(a,b);return this._milliseconds+=c._milliseconds,this._days+=c._days,this._months+=c._months,this._bubble(),this},subtract:function(a,b){var c=rb.duration(a,b);return this._milliseconds-=c._milliseconds,this._days-=c._days,this._months-=c._months,this._bubble(),this},get:function(a){return a=w(a),this[a.toLowerCase()+"s"]()},as:function(a){var b,c;if(a=w(a),b=this._days+this._milliseconds/864e5,"month"===a||"year"===a)return c=this._months+12*nb(b),"month"===a?c:c/12;switch(b+=ob(this._months/12),a){case"week":return b/7;case"day":return b;case"hour":return 24*b;case"minute":return 24*b*60;case"second":return 24*b*60*60;case"millisecond":return 24*b*60*60*1e3;default:throw new Error("Unknown unit "+a)}},lang:rb.fn.lang,locale:rb.fn.locale,toIsoString:e("toIsoString() is deprecated. Please use toISOString() instead (notice the capitals)",function(){return this.toISOString()}),toISOString:function(){var a=Math.abs(this.years()),b=Math.abs(this.months()),c=Math.abs(this.days()),d=Math.abs(this.hours()),e=Math.abs(this.minutes()),f=Math.abs(this.seconds()+this.milliseconds()/1e3);return this.asSeconds()?(this.asSeconds()<0?"-":"")+"P"+(a?a+"Y":"")+(b?b+"M":"")+(c?c+"D":"")+(d||e||f?"T":"")+(d?d+"H":"")+(e?e+"M":"")+(f?f+"S":""):"P0D"},localeData:function(){return this._locale}});for(tb in fc)fc.hasOwnProperty(tb)&&pb(tb.toLowerCase());rb.duration.fn.asMilliseconds=function(){return this.as("ms")},rb.duration.fn.asSeconds=function(){return this.as("s")},rb.duration.fn.asMinutes=function(){return this.as("m")},rb.duration.fn.asHours=function(){return this.as("h")},rb.duration.fn.asDays=function(){return this.as("d")},rb.duration.fn.asWeeks=function(){return this.as("weeks")},rb.duration.fn.asMonths=function(){return this.as("M")},rb.duration.fn.asYears=function(){return this.as("y")},rb.locale("en",{ordinal:function(a){var b=a%10,c=1===z(a%100/10)?"th":1===b?"st":2===b?"nd":3===b?"rd":"th";return a+c}}),Gb?module.exports=rb:"function"==typeof define&&define.amd?(define("moment",function(a,b,c){return c.config&&c.config()&&c.config().noGlobal===!0&&(vb.moment=sb),rb}),qb(!0)):qb()}).call(this);

// moment.js locale configuration
// locale : english !OVERRIDE

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define(['moment'], factory); // AMD
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment')); // Node
    } else {
        factory(window.moment); // Browser global
    }
}(function (moment) {
    return moment.defineLocale('en', {
        months : "January_February_March_April_May_June_July_August_September_October_November_December".split("_"),
        monthsShort : "Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec".split("_"),
        weekdays : "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),
        weekdaysShort : "Sun_Mon_Tue_Wed_Thu_Fri_Sat".split("_"),
        weekdaysMin : "Su_Mo_Tu_We_Th_Fr_Sa".split("_"),
        longDateFormat : {
            LT : "h:mm A",
            L : "DD/MM/YYYY",
            LL : "D MMMM YYYY",
            LLL : "D MMMM YYYY LT",
            LLLL : "dddd, D MMMM YYYY LT"
        },
        calendar : {
            sameDay : '[Today at] LT',
            nextDay : '[Tomorrow at] LT',
            nextWeek : 'dddd [at] LT',
            lastDay : '[Yesterday at] LT',
            lastWeek : '[Last] dddd [at] LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : "in %s",
            past : "%s ago",
            s : "now",
            m : "1 m",
            mm : "%d m",
            h : "1 h",
            hh : "%d h",
            d : "1 d",
            dd : "%d d",
            M : "1 mn",
            MM : "%d mn",
            y : "1 y",
            yy : "%d y"
        },
        ordinal : function (number) {
            var b = number % 10,
                output = (~~(number % 100 / 10) === 1) ? 'th' :
                (b === 1) ? 'st' :
                (b === 2) ? 'nd' :
                (b === 3) ? 'rd' : 'th';
            return number + output;
        },
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });
}));

// moment.js language configuration
// language : russian (ru)
// author : Viktorminator : https://github.com/Viktorminator
// Author : Menelion Elensúle : https://github.com/Oire

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define(['moment'], factory); // AMD
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment')); // Node
    } else {
        factory(window.moment); // Browser global
    }
}(function (moment) {
    function plural(word, num) {
        var forms = word.split('_');
        return num % 10 === 1 && num % 100 !== 11 ? forms[0] : (num % 10 >= 2 && num % 10 <= 4 && (num % 100 < 10 || num % 100 >= 20) ? forms[1] : forms[2]);
    }

    function relativeTimeWithPlural(number, withoutSuffix, key) {
      var format = {
        'mm': withoutSuffix ? 'мин_мин_мин' : 'мин_мин_мин',
        'hh': 'ч_ч_ч',
        'dd': 'д_д_д',
        'MM': 'мес_мес_мес',
        'yy': 'г_г_л'
      };
      if (key === 'm') {
        return withoutSuffix ? 'мин' : 'мин';
      }
      else {
        return number + ' ' + plural(format[key], +number);
      }
    }

    function monthsCaseReplace(m, format) {
        var months = {
                'nominative': 'январь_февраль_март_апрель_май_июнь_июль_август_сентябрь_октябрь_ноябрь_декабрь'.split('_'),
                'accusative': 'января_февраля_марта_апреля_мая_июня_июля_августа_сентября_октября_ноября_декабря'.split('_')
            },

            nounCase = (/D[oD]?(\[[^\[\]]*\]|\s+)+MMMM?/).test(format) ?
                'accusative' :
                'nominative';

        return months[nounCase][m.month()];
    }

    function monthsShortCaseReplace(m, format) {
        var monthsShort = {
                'nominative': 'янв_фев_мар_апр_май_июнь_июль_авг_сен_окт_ноя_дек'.split('_'),
                'accusative': 'янв_фев_мар_апр_мая_июня_июля_авг_сен_окт_ноя_дек'.split('_')
            },

            nounCase = (/D[oD]?(\[[^\[\]]*\]|\s+)+MMMM?/).test(format) ?
                'accusative' :
                'nominative';

        return monthsShort[nounCase][m.month()];
    }

    function weekdaysCaseReplace(m, format) {
        var weekdays = {
                'nominative': 'воскресенье_понедельник_вторник_среда_четверг_пятница_суббота'.split('_'),
                'accusative': 'воскресенье_понедельник_вторник_среду_четверг_пятницу_субботу'.split('_')
            },

            nounCase = (/\[ ?[Вв] ?(?:прошлую|следующую)? ?\] ?dddd/).test(format) ?
                'accusative' :
                'nominative';

        return weekdays[nounCase][m.day()];
    }

    return moment.defineLocale('ru', {
        months : monthsCaseReplace,
        monthsShort : monthsShortCaseReplace,
        weekdays : weekdaysCaseReplace,
        weekdaysShort : "вс_пн_вт_ср_чт_пт_сб".split("_"),
        weekdaysMin : "вс_пн_вт_ср_чт_пт_сб".split("_"),
        monthsParse : [/^янв/i, /^фев/i, /^мар/i, /^апр/i, /^ма[й|я]/i, /^июн/i, /^июл/i, /^авг/i, /^сен/i, /^окт/i, /^ноя/i, /^дек/i],
        longDateFormat : {
            LT : "HH:mm",
            L : "DD.MM.YYYY",
            LL : "D MMMM YYYY г.",
            LLL : "D MMMM YYYY г., LT",
            LLLL : "dddd, D MMMM YYYY г., LT"
        },
        calendar : {
            sameDay: '[Сегодня в] LT',
            nextDay: '[Завтра в] LT',
            lastDay: '[Вчера в] LT',
            nextWeek: function () {
                return this.day() === 2 ? '[Во] dddd [в] LT' : '[В] dddd [в] LT';
            },
            lastWeek: function () {
                switch (this.day()) {
                    case 0:
                        return '[В прошлое] dddd [в] LT';
                    case 1:
                    case 2:
                    case 4:
                        return '[В прошлый] dddd [в] LT';
                    case 3:
                    case 5:
                    case 6:
                        return '[В прошлую] dddd [в] LT';
                }
            },
            sameElse: 'L'
        },
        relativeTime : {
            future : "через %s",
            past : "%s назад",
            s : "сейчас",
            m : relativeTimeWithPlural,
            mm : relativeTimeWithPlural,
            h : "1 ч",
            hh : relativeTimeWithPlural,
            d : "1 д",
            dd : relativeTimeWithPlural,
            M : "1 м",
            MM : relativeTimeWithPlural,
            y : "1 г",
            yy : relativeTimeWithPlural
        },

        // M. E.: those two are virtually unused but a user might want to implement them for his/her website for some reason

        meridiem : function (hour, minute, isLower) {
            if (hour < 4) {
                return "ночи";
            } else if (hour < 12) {
                return "утра";
            } else if (hour < 17) {
                return "дня";
            } else {
                return "вечера";
            }
        },

        ordinal: function (number, period) {
            switch (period) {
                case 'M':
                case 'd':
                case 'DDD':
                    return number + '-й';
                case 'D':
                    return number + '-го';
                case 'w':
                case 'W':
                    return number + '-я';
                default:
                    return number;
            }
        },

        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 7  // The week that contains Jan 1st is the first week of the year.
        }
    });
}));

// moment.js locale configuration
// locale : spanish (es)
// author : Julio Napurí : https://github.com/julionc

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define(['moment'], factory); // AMD
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment')); // Node
    } else {
        factory(window.moment); // Browser global
    }
}(function (moment) {
    var monthsShortDot = "ene._feb._mar._abr._may._jun._jul._ago._sep._oct._nov._dic.".split("_"),
        monthsShort = "ene_feb_mar_abr_may_jun_jul_ago_sep_oct_nov_dic".split("_");

    return moment.defineLocale('es', {
        months : "enero_febrero_marzo_abril_mayo_junio_julio_agosto_septiembre_octubre_noviembre_diciembre".split("_"),
        monthsShort : function (m, format) {
            if (/-MMM-/.test(format)) {
                return monthsShort[m.month()];
            } else {
                return monthsShortDot[m.month()];
            }
        },
        weekdays : "domingo_lunes_martes_miércoles_jueves_viernes_sábado".split("_"),
        weekdaysShort : "dom._lun._mar._mié._jue._vie._sáb.".split("_"),
        weekdaysMin : "Do_Lu_Ma_Mi_Ju_Vi_Sá".split("_"),
        longDateFormat : {
            LT : "H:mm",
            L : "DD/MM/YYYY",
            LL : "D [de] MMMM [del] YYYY",
            LLL : "D [de] MMMM [del] YYYY LT",
            LLLL : "dddd, D [de] MMMM [del] YYYY LT"
        },
        calendar : {
            sameDay : function () {
                return '[hoy a la' + ((this.hours() !== 1) ? 's' : '') + '] LT';
            },
            nextDay : function () {
                return '[mañana a la' + ((this.hours() !== 1) ? 's' : '') + '] LT';
            },
            nextWeek : function () {
                return 'dddd [a la' + ((this.hours() !== 1) ? 's' : '') + '] LT';
            },
            lastDay : function () {
                return '[ayer a la' + ((this.hours() !== 1) ? 's' : '') + '] LT';
            },
            lastWeek : function () {
                return '[el] dddd [pasado a la' + ((this.hours() !== 1) ? 's' : '') + '] LT';
            },
            sameElse : 'L'
        },
        relativeTime : {
            future : "en %s",
            past : "hace %s",
            s : "ahora",
            m : "1 min",
            mm : "%d min",
            h : "una h",
            hh : "%d h",
            d : "un día",
            dd : "%d días",
            M : "un mes",
            MM : "%d meses",
            y : "un año",
            yy : "%d años"
        },
        ordinal : '%dº',
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });
}));

// moment.js locale configuration
// locale : turkish (tr)
// authors : Erhan Gundogan : https://github.com/erhangundogan,
//           Burak Yiğit Kaya: https://github.com/BYK

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define(['moment'], factory); // AMD
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment')); // Node
    } else {
        factory(window.moment); // Browser global
    }
}(function (moment) {
    var suffixes = {
        1: "'inci",
        5: "'inci",
        8: "'inci",
        70: "'inci",
        80: "'inci",

        2: "'nci",
        7: "'nci",
        20: "'nci",
        50: "'nci",

        3: "'üncü",
        4: "'üncü",
        100: "'üncü",

        6: "'ncı",

        9: "'uncu",
        10: "'uncu",
        30: "'uncu",

        60: "'ıncı",
        90: "'ıncı"
    };

    return moment.defineLocale('tr', {
        months : "Ocak_Şubat_Mart_Nisan_Mayıs_Haziran_Temmuz_Ağustos_Eylül_Ekim_Kasım_Aralık".split("_"),
        monthsShort : "Oca_Şub_Mar_Nis_May_Haz_Tem_Ağu_Eyl_Eki_Kas_Ara".split("_"),
        weekdays : "Pazar_Pazartesi_Salı_Çarşamba_Perşembe_Cuma_Cumartesi".split("_"),
        weekdaysShort : "Paz_Pts_Sal_Çar_Per_Cum_Cts".split("_"),
        weekdaysMin : "Pz_Pt_Sa_Ça_Pe_Cu_Ct".split("_"),
        longDateFormat : {
            LT : "HH:mm",
            L : "DD.MM.YYYY",
            LL : "D MMMM YYYY",
            LLL : "D MMMM YYYY LT",
            LLLL : "dddd, D MMMM YYYY LT"
        },
        calendar : {
            sameDay : '[bugün saat] LT',
            nextDay : '[yarın saat] LT',
            nextWeek : '[haftaya] dddd [saat] LT',
            lastDay : '[dün] LT',
            lastWeek : '[geçen hafta] dddd [saat] LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : "%s sonra",
            past : "%s önce",
            s : "şimdi",
            m : "1d",
            mm : "%dd",
            h : "1s",
            hh : "%ds",
            d : "1g",
            dd : "%dg",
            M : "1a",
            MM : "%da",
            y : "1y",
            yy : "%dy"
        },
        ordinal : function (number) {
            if (number === 0) {  // special case for zero
                return number + "'ıncı";
            }
            var a = number % 10,
                b = number % 100 - a,
                c = number >= 100 ? 100 : null;

            return number + (suffixes[a] || suffixes[b] || suffixes[c]);
        },
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 7  // The week that contains Jan 1st is the first week of the year.
        }
    });
}));

// moment.js locale configuration
// locale : swedish (sv)
// author : Jens Alm : https://github.com/ulmus

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define(['moment'], factory); // AMD
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment')); // Node
    } else {
        factory(window.moment); // Browser global
    }
}(function (moment) {
    return moment.defineLocale('sv', {
        months : "januari_februari_mars_april_maj_juni_juli_augusti_september_oktober_november_december".split("_"),
        monthsShort : "jan_feb_mar_apr_maj_jun_jul_aug_sep_okt_nov_dec".split("_"),
        weekdays : "söndag_måndag_tisdag_onsdag_torsdag_fredag_lördag".split("_"),
        weekdaysShort : "sön_mån_tis_ons_tor_fre_lör".split("_"),
        weekdaysMin : "sö_må_ti_on_to_fr_lö".split("_"),
        longDateFormat : {
            LT : "HH:mm",
            L : "YYYY-MM-DD",
            LL : "D MMMM YYYY",
            LLL : "D MMMM YYYY LT",
            LLLL : "dddd D MMMM YYYY LT"
        },
        calendar : {
            sameDay: '[Idag] LT',
            nextDay: '[Imorgon] LT',
            lastDay: '[Igår] LT',
            nextWeek: 'dddd LT',
            lastWeek: '[Förra] dddd[en] LT',
            sameElse: 'L'
        },
        relativeTime : {
            future : "om %s",
            past : "för %s sedan",
            s : "nu",
            m : "1m",
            mm : "%dm",
            h : "1t",
            hh : "%dt",
            d : "1d",
            dd : "%dd",
            M : "1mn",
            MM : "%dmn",
            y : "1å",
            yy : "%då"
        },
        ordinal : function (number) {
            var b = number % 10,
                output = (~~(number % 100 / 10) === 1) ? 'e' :
                (b === 1) ? 'a' :
                (b === 2) ? 'a' :
                (b === 3) ? 'e' : 'e';
            return number + output;
        },
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });
}));
/*!
 * mustache.js - Logic-less {{mustache}} templates with JavaScript
 * http://github.com/janl/mustache.js
 */

/*global define: false*/

(function (root, factory) {
  if (typeof exports === "object" && exports) {
    factory(exports); // CommonJS
  } else {
    var mustache = {};
    factory(mustache);
    if (typeof define === "function" && define.amd) {
      define(mustache); // AMD
    } else {
      root.Mustache = mustache; // <script>
    }
  }
}(this, function (mustache) {

  // Workaround for https://issues.apache.org/jira/browse/COUCHDB-577
  // See https://github.com/janl/mustache.js/issues/189
  var RegExp_test = RegExp.prototype.test;
  function testRegExp(re, string) {
    return RegExp_test.call(re, string);
  }

  var nonSpaceRe = /\S/;
  function isWhitespace(string) {
    return !testRegExp(nonSpaceRe, string);
  }

  var Object_toString = Object.prototype.toString;
  var isArray = Array.isArray || function (object) {
    return Object_toString.call(object) === '[object Array]';
  };

  function isFunction(object) {
    return typeof object === 'function';
  }

  function escapeRegExp(string) {
    return string.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");
  }

  var entityMap = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': '&quot;',
    "'": '&#39;',
    "/": '&#x2F;'
  };

  function escapeHtml(string) {
    return String(string).replace(/[&<>"'\/]/g, function (s) {
      return entityMap[s];
    });
  }

  function escapeTags(tags) {
    if (!isArray(tags) || tags.length !== 2) {
      throw new Error('Invalid tags: ' + tags);
    }

    return [
      new RegExp(escapeRegExp(tags[0]) + "\\s*"),
      new RegExp("\\s*" + escapeRegExp(tags[1]))
    ];
  }

  var whiteRe = /\s*/;
  var spaceRe = /\s+/;
  var equalsRe = /\s*=/;
  var curlyRe = /\s*\}/;
  var tagRe = /#|\^|\/|>|\{|&|=|!/;

  /**
   * Breaks up the given `template` string into a tree of tokens. If the `tags`
   * argument is given here it must be an array with two string values: the
   * opening and closing tags used in the template (e.g. [ "<%", "%>" ]). Of
   * course, the default is to use mustaches (i.e. mustache.tags).
   *
   * A token is an array with at least 4 elements. The first element is the
   * mustache symbol that was used inside the tag, e.g. "#" or "&". If the tag
   * did not contain a symbol (i.e. {{myValue}}) this element is "name". For
   * all text that appears outside a symbol this element is "text".
   *
   * The second element of a token is its "value". For mustache tags this is
   * whatever else was inside the tag besides the opening symbol. For text tokens
   * this is the text itself.
   *
   * The third and fourth elements of the token are the start and end indices,
   * respectively, of the token in the original template.
   *
   * Tokens that are the root node of a subtree contain two more elements: 1) an
   * array of tokens in the subtree and 2) the index in the original template at
   * which the closing tag for that section begins.
   */
  function parseTemplate(template, tags) {
    tags = tags || mustache.tags;
    template = template || '';

    if (typeof tags === 'string') {
      tags = tags.split(spaceRe);
    }

    var tagRes = escapeTags(tags);
    var scanner = new Scanner(template);

    var sections = [];     // Stack to hold section tokens
    var tokens = [];       // Buffer to hold the tokens
    var spaces = [];       // Indices of whitespace tokens on the current line
    var hasTag = false;    // Is there a {{tag}} on the current line?
    var nonSpace = false;  // Is there a non-space char on the current line?

    // Strips all whitespace tokens array for the current line
    // if there was a {{#tag}} on it and otherwise only space.
    function stripSpace() {
      if (hasTag && !nonSpace) {
        while (spaces.length) {
          delete tokens[spaces.pop()];
        }
      } else {
        spaces = [];
      }

      hasTag = false;
      nonSpace = false;
    }

    var start, type, value, chr, token, openSection;
    while (!scanner.eos()) {
      start = scanner.pos;

      // Match any text between tags.
      value = scanner.scanUntil(tagRes[0]);
      if (value) {
        for (var i = 0, len = value.length; i < len; ++i) {
          chr = value.charAt(i);

          if (isWhitespace(chr)) {
            spaces.push(tokens.length);
          } else {
            nonSpace = true;
          }

          tokens.push(['text', chr, start, start + 1]);
          start += 1;

          // Check for whitespace on the current line.
          if (chr === '\n') {
            stripSpace();
          }
        }
      }

      // Match the opening tag.
      if (!scanner.scan(tagRes[0])) break;
      hasTag = true;

      // Get the tag type.
      type = scanner.scan(tagRe) || 'name';
      scanner.scan(whiteRe);

      // Get the tag value.
      if (type === '=') {
        value = scanner.scanUntil(equalsRe);
        scanner.scan(equalsRe);
        scanner.scanUntil(tagRes[1]);
      } else if (type === '{') {
        value = scanner.scanUntil(new RegExp('\\s*' + escapeRegExp('}' + tags[1])));
        scanner.scan(curlyRe);
        scanner.scanUntil(tagRes[1]);
        type = '&';
      } else {
        value = scanner.scanUntil(tagRes[1]);
      }

      // Match the closing tag.
      if (!scanner.scan(tagRes[1])) {
        throw new Error('Unclosed tag at ' + scanner.pos);
      }

      token = [ type, value, start, scanner.pos ];
      tokens.push(token);

      if (type === '#' || type === '^') {
        sections.push(token);
      } else if (type === '/') {
        // Check section nesting.
        openSection = sections.pop();

        if (!openSection) {
          throw new Error('Unopened section "' + value + '" at ' + start);
        }
        if (openSection[1] !== value) {
          throw new Error('Unclosed section "' + openSection[1] + '" at ' + start);
        }
      } else if (type === 'name' || type === '{' || type === '&') {
        nonSpace = true;
      } else if (type === '=') {
        // Set the tags for the next time around.
        tagRes = escapeTags(tags = value.split(spaceRe));
      }
    }

    // Make sure there are no open sections when we're done.
    openSection = sections.pop();
    if (openSection) {
      throw new Error('Unclosed section "' + openSection[1] + '" at ' + scanner.pos);
    }

    return nestTokens(squashTokens(tokens));
  }

  /**
   * Combines the values of consecutive text tokens in the given `tokens` array
   * to a single token.
   */
  function squashTokens(tokens) {
    var squashedTokens = [];

    var token, lastToken;
    for (var i = 0, len = tokens.length; i < len; ++i) {
      token = tokens[i];

      if (token) {
        if (token[0] === 'text' && lastToken && lastToken[0] === 'text') {
          lastToken[1] += token[1];
          lastToken[3] = token[3];
        } else {
          squashedTokens.push(token);
          lastToken = token;
        }
      }
    }

    return squashedTokens;
  }

  /**
   * Forms the given array of `tokens` into a nested tree structure where
   * tokens that represent a section have two additional items: 1) an array of
   * all tokens that appear in that section and 2) the index in the original
   * template that represents the end of that section.
   */
  function nestTokens(tokens) {
    var nestedTokens = [];
    var collector = nestedTokens;
    var sections = [];

    var token, section;
    for (var i = 0, len = tokens.length; i < len; ++i) {
      token = tokens[i];

      switch (token[0]) {
      case '#':
      case '^':
        collector.push(token);
        sections.push(token);
        collector = token[4] = [];
        break;
      case '/':
        section = sections.pop();
        section[5] = token[2];
        collector = sections.length > 0 ? sections[sections.length - 1][4] : nestedTokens;
        break;
      default:
        collector.push(token);
      }
    }

    return nestedTokens;
  }

  /**
   * A simple string scanner that is used by the template parser to find
   * tokens in template strings.
   */
  function Scanner(string) {
    this.string = string;
    this.tail = string;
    this.pos = 0;
  }

  /**
   * Returns `true` if the tail is empty (end of string).
   */
  Scanner.prototype.eos = function () {
    return this.tail === "";
  };

  /**
   * Tries to match the given regular expression at the current position.
   * Returns the matched text if it can match, the empty string otherwise.
   */
  Scanner.prototype.scan = function (re) {
    var match = this.tail.match(re);

    if (match && match.index === 0) {
      var string = match[0];
      this.tail = this.tail.substring(string.length);
      this.pos += string.length;
      return string;
    }

    return "";
  };

  /**
   * Skips all text until the given regular expression can be matched. Returns
   * the skipped string, which is the entire tail if no match can be made.
   */
  Scanner.prototype.scanUntil = function (re) {
    var index = this.tail.search(re), match;

    switch (index) {
    case -1:
      match = this.tail;
      this.tail = "";
      break;
    case 0:
      match = "";
      break;
    default:
      match = this.tail.substring(0, index);
      this.tail = this.tail.substring(index);
    }

    this.pos += match.length;

    return match;
  };

  /**
   * Represents a rendering context by wrapping a view object and
   * maintaining a reference to the parent context.
   */
  function Context(view, parentContext) {
    this.view = view == null ? {} : view;
    this.cache = { '.': this.view };
    this.parent = parentContext;
  }

  /**
   * Creates a new context using the given view with this context
   * as the parent.
   */
  Context.prototype.push = function (view) {
    return new Context(view, this);
  };

  /**
   * Returns the value of the given name in this context, traversing
   * up the context hierarchy if the value is absent in this context's view.
   */
  Context.prototype.lookup = function (name) {
    var value;
    if (name in this.cache) {
      value = this.cache[name];
    } else {
      var context = this;

      while (context) {
        if (name.indexOf('.') > 0) {
          value = context.view;

          var names = name.split('.'), i = 0;
          while (value != null && i < names.length) {
            value = value[names[i++]];
          }
        } else {
          value = context.view[name];
        }

        if (value != null) break;

        context = context.parent;
      }

      this.cache[name] = value;
    }

    if (isFunction(value)) {
      value = value.call(this.view);
    }

    return value;
  };

  /**
   * A Writer knows how to take a stream of tokens and render them to a
   * string, given a context. It also maintains a cache of templates to
   * avoid the need to parse the same template twice.
   */
  function Writer() {
    this.cache = {};
  }

  /**
   * Clears all cached templates in this writer.
   */
  Writer.prototype.clearCache = function () {
    this.cache = {};
  };

  /**
   * Parses and caches the given `template` and returns the array of tokens
   * that is generated from the parse.
   */
  Writer.prototype.parse = function (template, tags) {
    var cache = this.cache;
    var tokens = cache[template];

    if (tokens == null) {
      tokens = cache[template] = parseTemplate(template, tags);
    }

    return tokens;
  };

  /**
   * High-level method that is used to render the given `template` with
   * the given `view`.
   *
   * The optional `partials` argument may be an object that contains the
   * names and templates of partials that are used in the template. It may
   * also be a function that is used to load partial templates on the fly
   * that takes a single argument: the name of the partial.
   */
  Writer.prototype.render = function (template, view, partials) {
    var tokens = this.parse(template);
    var context = (view instanceof Context) ? view : new Context(view);
    return this.renderTokens(tokens, context, partials, template);
  };

  /**
   * Low-level method that renders the given array of `tokens` using
   * the given `context` and `partials`.
   *
   * Note: The `originalTemplate` is only ever used to extract the portion
   * of the original template that was contained in a higher-order section.
   * If the template doesn't use higher-order sections, this argument may
   * be omitted.
   */
  Writer.prototype.renderTokens = function (tokens, context, partials, originalTemplate) {
    var buffer = '';

    // This function is used to render an arbitrary template
    // in the current context by higher-order sections.
    var self = this;
    function subRender(template) {
      return self.render(template, context, partials);
    }

    var token, value;
    for (var i = 0, len = tokens.length; i < len; ++i) {
      token = tokens[i];

      switch (token[0]) {
      case '#':
        value = context.lookup(token[1]);
        if (!value) continue;

        if (isArray(value)) {
          for (var j = 0, jlen = value.length; j < jlen; ++j) {
            buffer += this.renderTokens(token[4], context.push(value[j]), partials, originalTemplate);
          }
        } else if (typeof value === 'object' || typeof value === 'string') {
          buffer += this.renderTokens(token[4], context.push(value), partials, originalTemplate);
        } else if (isFunction(value)) {
          if (typeof originalTemplate !== 'string') {
            throw new Error('Cannot use higher-order sections without the original template');
          }

          // Extract the portion of the original template that the section contains.
          value = value.call(context.view, originalTemplate.slice(token[3], token[5]), subRender);

          if (value != null) buffer += value;
        } else {
          buffer += this.renderTokens(token[4], context, partials, originalTemplate);
        }

        break;
      case '^':
        value = context.lookup(token[1]);

        // Use JavaScript's definition of falsy. Include empty arrays.
        // See https://github.com/janl/mustache.js/issues/186
        if (!value || (isArray(value) && value.length === 0)) {
          buffer += this.renderTokens(token[4], context, partials, originalTemplate);
        }

        break;
      case '>':
        if (!partials) continue;
        value = isFunction(partials) ? partials(token[1]) : partials[token[1]];
        if (value != null) buffer += this.renderTokens(this.parse(value), context, partials, value);
        break;
      case '&':
        value = context.lookup(token[1]);
        if (value != null) buffer += value;
        break;
      case 'name':
        value = context.lookup(token[1]);
        if (value != null) buffer += mustache.escape(value);
        break;
      case 'text':
        buffer += token[1];
        break;
      }
    }

    return buffer;
  };

  mustache.name = "mustache.js";
  mustache.version = "0.8.1";
  mustache.tags = [ "{{", "}}" ];

  // All high-level mustache.* functions use this writer.
  var defaultWriter = new Writer();

  /**
   * Clears all cached templates in the default writer.
   */
  mustache.clearCache = function () {
    return defaultWriter.clearCache();
  };

  /**
   * Parses and caches the given template in the default writer and returns the
   * array of tokens it contains. Doing this ahead of time avoids the need to
   * parse templates on the fly as they are rendered.
   */
  mustache.parse = function (template, tags) {
    return defaultWriter.parse(template, tags);
  };

  /**
   * Renders the `template` with the given `view` and `partials` using the
   * default writer.
   */
  mustache.render = function (template, view, partials) {
    return defaultWriter.render(template, view, partials);
  };

  // This is here for backwards compatibility with 0.4.x.
  mustache.to_html = function (template, view, partials, send) {
    var result = mustache.render(template, view, partials);

    if (isFunction(send)) {
      send(result);
    } else {
      return result;
    }
  };

  // Export the escaping function so that the user may override it.
  // See https://github.com/janl/mustache.js/issues/244
  mustache.escape = escapeHtml;

  // Export these mainly for testing, but also for advanced usage.
  mustache.Scanner = Scanner;
  mustache.Context = Context;
  mustache.Writer = Writer;

}));

/**
 Radio.js - Chainable, Dependency Free Publish/Subscribe for Javascript
 http://radio.uxder.com
 Author: Scott Murphy 2011
 twitter: @hellocreation, github: uxder
 
 Permission is hereby granted, free of charge, to any person
 obtaining a copy of this software and associated documentation
 files (the "Software"), to deal in the Software without
 restriction, including without limitation the rights to use,
 copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the
 Software is furnished to do so, subject to the following
 conditions:
 
 The above copyright notice and this permission notice shall be
 included in all copies or substantial portions of the Software.
 
 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 OTHER DEALINGS IN THE SOFTWARE.
 */
// (function (name, global, definition) {
//   if (typeof module !== 'undefined') module.exports = definition(name, global);
//   else if (typeof define === 'function' && typeof define.amd  === 'object') define(definition);
//   else global[name] = definition(name, global);
// })('radio', this, function (name, global) {
window.radio = function (name, global) {

  "use strict";

  /**
   * Main Wrapper for radio.$ and create a function radio to accept the channelName
   * @param {String} channelName topic of event
   */
  function radio(channelName) {
    arguments.length ? radio.$.channel(channelName) : radio.$.reset();
    return radio.$;
  }

  radio.$ = {
    version: '0.2',
    channelName: "",
    channels: [],

    /**
     * Reset global state, by removing all channels
     * @example
     *    radio()
     */
    reset: function() {
      radio.$.channelName = "";
      radio.$.channels = [];
    },
 
    /**
     * Broadcast (publish)
     * Iterate through all listeners (callbacks) in current channel and pass arguments to subscribers
     * @param arguments data to be sent to listeners
     * @example
     *    //basic usage
     *    radio('channel1').broadcast('my message'); 
     *    //send an unlimited number of parameters
     *    radio('channel2').broadcast(param1, param2, param3 ... );
     */
    broadcast: function() {
      var i, c = this.channels[this.channelName],
        l = c.length,
        subscriber, callback, context;
      //iterate through current channel and run each subscriber
      for (i = 0; i < l; i++) {
        subscriber = c[i];
        //if subscriber was an array, set the callback and context.
        if ((typeof(subscriber) === 'object') && (subscriber.length)) {
          callback = subscriber[0];
          //if user set the context, set it to the context otherwise, it is a globally scoped function
          context = subscriber[1] || global;
        }
        callback.apply(context, arguments);
      }
      return this;
    },

    /**
     * Create the channel if it doesn't exist and set the current channel/event name
     * @param {String} name the name of the channel
     * @example
     *    radio('channel1');
     */
    channel: function(name) {
      var c = this.channels;
      //create a new channel if it doesn't exists
      if (!c[name]) c[name] = [];
      this.channelName = name;
      return this;
    },

    /**
     * Add Subscriber to channel
     * Take the arguments and add it to the this.channels array.
     * @param {Function|Array} arguments list of callbacks or arrays[callback, context] separated by commas
     * @example
     *      //basic usage
     *      var callback = function() {};
     *      radio('channel1').subscribe(callback); 
     *
     *      //subscribe an endless amount of callbacks
     *      radio('channel1').subscribe(callback, callback2, callback3 ...);
     *
     *      //adding callbacks with context
     *      radio('channel1').subscribe([callback, context],[callback1, context], callback3);
     *     
     *      //subscribe by chaining
     *      radio('channel1').subscribe(callback).radio('channel2').subscribe(callback).subscribe(callback2);
     */
    subscribe: function() {
      var a = arguments,
        c = this.channels[this.channelName],
        i, l = a.length,
        p, ai = [];

      //run through each arguments and subscribe it to the channel
      for (i = 0; i < l; i++) {
        ai = a[i];
        //if the user sent just a function, wrap the fucntion in an array [function]
        p = (typeof(ai) === "function") ? [ai] : ai;
        if ((typeof(p) === 'object') && (p.length)) c.push(p);
      }
      return this;
    },

    /**
     * Remove subscriber from channel
     * Take arguments with functions and unsubscribe it if there is a match against existing subscribers.
     * @param {Function} arguments callbacks separated by commas
     * @example
     *      //basic usage
     *      radio('channel1').unsubscribe(callback); 
     *      //you can unsubscribe as many callbacks as you want
     *      radio('channel1').unsubscribe(callback, callback2, callback3 ...);
     *       //removing callbacks with context is the same
     *      radio('channel1').subscribe([callback, context]).unsubscribe(callback);
     */
    unsubscribe: function() {
      var a = arguments,
        i, j, c = this.channels[this.channelName],
        l = a.length,
        cl = c.length,
        offset = 0,
        jo;
      //loop through each argument
      for (i = 0; i < l; i++) {
        //need to reset vars that change as the channel array items are removed
        offset = 0;
        cl = c.length;
        //loop through the channel
        for (j = 0; j < cl; j++) {
          jo = j - offset;
          //if there is a match with the argument and the channel function, unsubscribe it from the channel array
          if (c[jo][0] === a[i]) {
            //unsubscribe matched item from the channel array
            c.splice(jo, 1);
            offset++;
          }
        }
      }
      return this;
    }
  };

  return radio;
}('radio', this);
/**
 * Modules
 *
 * Copyright (c) 2013 Filatov Dmitry (dfilatov@yandex-team.ru)
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 *
 * @version 0.1.0
 */

(function(global) {

var undef,

    DECL_STATES = {
        NOT_RESOLVED : 'NOT_RESOLVED',
        IN_RESOLVING : 'IN_RESOLVING',
        RESOLVED     : 'RESOLVED'
    },

    /**
     * Creates a new instance of modular system
     * @returns {Object}
     */
    create = function() {
        var curOptions = {
                trackCircularDependencies : true,
                allowMultipleDeclarations : true
            },

            modulesStorage = {},
            waitForNextTick = false,
            pendingRequires = [],

            /**
             * Defines module
             * @param {String} name
             * @param {String[]} [deps]
             * @param {Function} declFn
             */
            define = function(name, deps, declFn) {
                if(!declFn) {
                    declFn = deps;
                    deps = [];
                }

                var module = modulesStorage[name];
                if(!module) {
                    module = modulesStorage[name] = {
                        name : name,
                        decl : undef
                    };
                }

                module.decl = {
                    name       : name,
                    prev       : module.decl,
                    fn         : declFn,
                    state      : DECL_STATES.NOT_RESOLVED,
                    deps       : deps,
                    dependents : [],
                    exports    : undef
                };
            },

            /**
             * Requires modules
             * @param {String|String[]} modules
             * @param {Function} cb
             * @param {Function} [errorCb]
             */
            require = function(modules, cb, errorCb) {
                if(typeof modules === 'string') {
                    modules = [modules];
                }

                if(!waitForNextTick) {
                    waitForNextTick = true;
                    nextTick(onNextTick);
                }

                pendingRequires.push({
                    deps : modules,
                    cb   : function(exports, error) {
                        if (error) {
                          (errorCb || onError)(error);
                        } else if (cb !== undefined) {
                          cb.apply(global, exports);
                        }
                    }
                });
            },

            /**
             * Returns state of module
             * @param {String} name
             * @returns {String} state, possible values are NOT_DEFINED, NOT_RESOLVED, IN_RESOLVING, RESOLVED
             */
            getState = function(name) {
                var module = modulesStorage[name];
                return module?
                    DECL_STATES[module.decl.state] :
                    'NOT_DEFINED';
            },

            /**
             * Returns whether the module is defined
             * @param {String} name
             * @returns {Boolean}
             */
            isDefined = function(name) {
                return !!modulesStorage[name];
            },

            /**
             * Sets options
             * @param {Object} options
             */
            setOptions = function(options) {
                for(var name in options) {
                    if(options.hasOwnProperty(name)) {
                        curOptions[name] = options[name];
                    }
                }
            },

            onNextTick = function() {
                waitForNextTick = false;
                applyRequires();
            },

            applyRequires = function() {
                var requiresToProcess = pendingRequires,
                    i = 0, require;

                pendingRequires = [];
                while(require = requiresToProcess[i++]) {
                    requireDeps(null, require.deps, [], require.cb);
                }
            },

            requireDeps = function(fromDecl, deps, path, cb) {
                var unresolvedDepsCnt = deps.length;
                if(!unresolvedDepsCnt) {
                    cb([]);
                }

                var decls = [],
                    onDeclResolved = function(_, error) {
                        if(error) {
                            cb(null, error);
                            return;
                        }

                        if(!--unresolvedDepsCnt) {
                            var exports = [],
                                i = 0, decl;
                            while(decl = decls[i++]) {
                                exports.push(decl.exports);
                            }
                            cb(exports);
                        }
                    },
                    i = 0, len = unresolvedDepsCnt,
                    dep, decl;

                while(i < len) {
                    dep = deps[i++];
                    if(typeof dep === 'string') {
                        if(!modulesStorage[dep]) {
                            cb(null, buildModuleNotFoundError(dep, fromDecl));
                            return;
                        }

                        decl = modulesStorage[dep].decl;
                    }
                    else {
                        decl = dep;
                    }

                    decls.push(decl);

                    startDeclResolving(decl, path, onDeclResolved);
                }
            },

            startDeclResolving = function(decl, path, cb) {
                if(decl.state === DECL_STATES.RESOLVED) {
                    cb(decl.exports);
                    return;
                }
                else if(decl.state === DECL_STATES.IN_RESOLVING) {
                    curOptions.trackCircularDependencies && isDependenceCircular(decl, path)?
                        cb(null, buildCircularDependenceError(decl, path)) :
                        decl.dependents.push(cb);
                    return;
                }

                decl.dependents.push(cb);

                if(decl.prev && !curOptions.allowMultipleDeclarations) {
                    provideError(decl, buildMultipleDeclarationError(decl));
                    return;
                }

                curOptions.trackCircularDependencies && (path = path.slice()).push(decl);

                var isProvided = false,
                    deps = decl.prev? decl.deps.concat([decl.prev]) : decl.deps;

                decl.state = DECL_STATES.IN_RESOLVING;
                requireDeps(
                    decl,
                    deps,
                    path,
                    function(depDeclsExports, error) {
                        if(error) {
                            provideError(decl, error);
                            return;
                        }

                        depDeclsExports.unshift(function(exports, error) {
                            if(isProvided) {
                                cb(null, buildDeclAreadyProvidedError(decl));
                                return;
                            }

                            isProvided = true;
                            error?
                                provideError(decl, error) :
                                provideDecl(decl, exports);
                        });

                        decl.fn.apply(
                            {
                                name   : decl.name,
                                deps   : decl.deps,
                                global : global
                            },
                            depDeclsExports);
                    });
            },

            provideDecl = function(decl, exports) {
                decl.exports = exports;
                decl.state = DECL_STATES.RESOLVED;

                var i = 0, dependent;
                while(dependent = decl.dependents[i++]) {
                    dependent(exports);
                }

                decl.dependents = undef;
            },

            provideError = function(decl, error) {
                decl.state = DECL_STATES.NOT_RESOLVED;

                var i = 0, dependent;
                while(dependent = decl.dependents[i++]) {
                    dependent(null, error);
                }

                decl.dependents = [];
            };

        return {
            create     : create,
            define     : define,
            require    : require,
            getState   : getState,
            isDefined  : isDefined,
            setOptions : setOptions
        };
    },

    onError = function(e) {
        nextTick(function() {
            throw e;
        });
    },

    buildModuleNotFoundError = function(name, decl) {
        return Error(decl?
            'Module "' + decl.name + '": can\'t resolve dependence "' + name + '"' :
            'Required module "' + name + '" can\'t be resolved');
    },

    buildCircularDependenceError = function(decl, path) {
        var strPath = [],
            i = 0, pathDecl;
        while(pathDecl = path[i++]) {
            strPath.push(pathDecl.name);
        }
        strPath.push(decl.name);

        return Error('Circular dependence has been detected: "' + strPath.join(' -> ') + '"');
    },

    buildDeclAreadyProvidedError = function(decl) {
        return Error('Declaration of module "' + decl.name + '" has already been provided');
    },

    buildMultipleDeclarationError = function(decl) {
        return Error('Multiple declarations of module "' + decl.name + '" have been detected');
    },

    isDependenceCircular = function(decl, path) {
        var i = 0, pathDecl;
        while(pathDecl = path[i++]) {
            if(decl === pathDecl) {
                return true;
            }
        }
        return false;
    },

    nextTick = (function() {
        var fns = [],
            enqueueFn = function(fn) {
                return fns.push(fn) === 1;
            },
            callFns = function() {
                var fnsToCall = fns, i = 0, len = fns.length;
                fns = [];
                while(i < len) {
                    fnsToCall[i++]();
                }
            };

        if(typeof process === 'object' && process.nextTick) { // nodejs
            return function(fn) {
                enqueueFn(fn) && process.nextTick(callFns);
            };
        }

        if(global.setImmediate) { // ie10
            return function(fn) {
                enqueueFn(fn) && global.setImmediate(callFns);
            };
        }

        if(global.postMessage && !global.opera) { // modern browsers
            var isPostMessageAsync = true;
            if(global.attachEvent) {
                var checkAsync = function() {
                        isPostMessageAsync = false;
                    };
                global.attachEvent('onmessage', checkAsync);
                global.postMessage('__checkAsync', '*');
                global.detachEvent('onmessage', checkAsync);
            }

            if(isPostMessageAsync) {
                var msg = '__modules' + (+new Date()),
                    onMessage = function(e) {
                        if(e.data === msg) {
                            e.stopPropagation && e.stopPropagation();
                            callFns();
                        }
                    };

                global.addEventListener?
                    global.addEventListener('message', onMessage, true) :
                    global.attachEvent('onmessage', onMessage);

                return function(fn) {
                    enqueueFn(fn) && global.postMessage(msg, '*');
                };
            }
        }

        var doc = global.document;
        if('onreadystatechange' in doc.createElement('script')) { // ie6-ie8
            var head = doc.getElementsByTagName('head')[0],
                createScript = function() {
                    var script = doc.createElement('script');
                    script.onreadystatechange = function() {
                        script.parentNode.removeChild(script);
                        script = script.onreadystatechange = null;
                        callFns();
                    };
                    head.appendChild(script);
                };

            return function(fn) {
                enqueueFn(fn) && createScript();
            };
        }

        return function(fn) { // old browsers
            enqueueFn(fn) && setTimeout(callFns, 0);
        };
    })();

if(typeof exports === 'object') {
    module.exports = create();
}
else {
    global.modules = create();
}

})(this);

/*!
    Autosize v1.18.9 - 2014-05-27
    Automatically adjust textarea height based on user input.
    (c) 2014 Jack Moore - http://www.jacklmoore.com/autosize
    license: http://www.opensource.org/licenses/mit-license.php
*/
(function ($) {
    var
    defaults = {
        className: 'autosizejs',
        id: 'autosizejs',
        append: '\n',
        callback: false,
        resizeDelay: 10,
        placeholder: true
    },

    // border:0 is unnecessary, but avoids a bug in Firefox on OSX
    copy = '<textarea tabindex="-1" style="position:absolute; top:-999px; left:0; right:auto; bottom:auto; border:0; padding: 0; -moz-box-sizing:content-box; -webkit-box-sizing:content-box; box-sizing:content-box; word-wrap:break-word; height:0 !important; min-height:0 !important; overflow:hidden; transition:none; -webkit-transition:none; -moz-transition:none;"/>',

    // line-height is conditionally included because IE7/IE8/old Opera do not return the correct value.
    typographyStyles = [
        'fontFamily',
        'fontSize',
        'fontWeight',
        'fontStyle',
        'letterSpacing',
        'textTransform',
        'wordSpacing',
        'textIndent'
    ],

    // to keep track which textarea is being mirrored when adjust() is called.
    mirrored,

    // the mirror element, which is used to calculate what size the mirrored element should be.
    mirror = $(copy).data('autosize', true)[0];

    // test that line-height can be accurately copied.
    mirror.style.lineHeight = '99px';
    if ($(mirror).css('lineHeight') === '99px') {
        typographyStyles.push('lineHeight');
    }
    mirror.style.lineHeight = '';

    $.fn.autosize = function (options) {
        if (!this.length) {
            return this;
        }

        options = $.extend({}, defaults, options || {});

        if (mirror.parentNode !== document.body) {
            $(document.body).append(mirror);
        }

        return this.each(function () {
            var
            ta = this,
            $ta = $(ta),
            maxHeight,
            minHeight,
            boxOffset = 0,
            callback = $.isFunction(options.callback),
            originalStyles = {
                height: ta.style.height,
                overflow: ta.style.overflow,
                overflowY: ta.style.overflowY,
                wordWrap: ta.style.wordWrap,
                resize: ta.style.resize
            },
            timeout,
            width = $ta.width(),
            taResize = $ta.css('resize');

            if ($ta.data('autosize')) {
                // exit if autosize has already been applied, or if the textarea is the mirror element.
                return;
            }
            $ta.data('autosize', true);

            if ($ta.css('box-sizing') === 'border-box' || $ta.css('-moz-box-sizing') === 'border-box' || $ta.css('-webkit-box-sizing') === 'border-box'){
                boxOffset = $ta.outerHeight() - $ta.height();
            }

            // IE8 and lower return 'auto', which parses to NaN, if no min-height is set.
            minHeight = minHeight = Math.min(parseInt($ta.css('minHeight'), 10) - boxOffset || 0, $ta.height());

            $ta.css({
                overflow: 'hidden',
                overflowY: 'hidden',
                wordWrap: 'break-word' // horizontal overflow is hidden, so break-word is necessary for handling words longer than the textarea width
            });

            if (taResize === 'vertical') {
                $ta.css('resize','none');
            } else if (taResize === 'both') {
                $ta.css('resize', 'horizontal');
            }

            // The mirror width must exactly match the textarea width, so using getBoundingClientRect because it doesn't round the sub-pixel value.
            // window.getComputedStyle, getBoundingClientRect returning a width are unsupported, but also unneeded in IE8 and lower.
            function setWidth() {
                var width;
                var style = window.getComputedStyle ? window.getComputedStyle(ta, null) : false;
                
                if (style) {

                    width = ta.getBoundingClientRect().width;

                    if (width === 0 || typeof width !== 'number') {
                        width = parseInt(style.width,10);
                    }

                    $.each(['paddingLeft', 'paddingRight', 'borderLeftWidth', 'borderRightWidth'], function(i,val){
                        width -= parseInt(style[val],10);
                    });
                } else {
                    width = $ta.width();
                }

                mirror.style.width = Math.max(width,0) + 'px';
            }

            function initMirror() {
                var styles = {};

                mirrored = ta;
                mirror.className = options.className;
                mirror.id = options.id;
                maxHeight = parseInt($ta.css('maxHeight'), 10);

                // mirror is a duplicate textarea located off-screen that
                // is automatically updated to contain the same text as the
                // original textarea.  mirror always has a height of 0.
                // This gives a cross-browser supported way getting the actual
                // height of the text, through the scrollTop property.
                $.each(typographyStyles, function(i,val){
                    styles[val] = $ta.css(val);
                });
                
                $(mirror).css(styles).attr('wrap', $ta.attr('wrap'));

                setWidth();

                // Chrome-specific fix:
                // When the textarea y-overflow is hidden, Chrome doesn't reflow the text to account for the space
                // made available by removing the scrollbar. This workaround triggers the reflow for Chrome.
                if (window.chrome) {
                    var width = ta.style.width;
                    ta.style.width = '0px';
                    var ignore = ta.offsetWidth;
                    ta.style.width = width;
                }
            }

            // Using mainly bare JS in this function because it is going
            // to fire very often while typing, and needs to very efficient.
            function adjust() {
                var height, original;

                if (mirrored !== ta) {
                    initMirror();
                } else {
                    setWidth();
                }

                if (!ta.value && options.placeholder) {
                    // If the textarea is empty, copy the placeholder text into 
                    // the mirror control and use that for sizing so that we 
                    // don't end up with placeholder getting trimmed.
                    mirror.value = ($ta.attr("placeholder") || '') + options.append;
                } else {
                    mirror.value = ta.value + options.append;
                }

                mirror.style.overflowY = ta.style.overflowY;
                original = parseInt(ta.style.height,10);

                // Setting scrollTop to zero is needed in IE8 and lower for the next step to be accurately applied
                mirror.scrollTop = 0;

                mirror.scrollTop = 9e4;

                // Using scrollTop rather than scrollHeight because scrollHeight is non-standard and includes padding.
                height = mirror.scrollTop - parseInt(mirror.style.lineHeight, 10);

                if (maxHeight && height > maxHeight) {
                    ta.style.overflowY = 'scroll';
                    height = maxHeight;
                } else {
                    ta.style.overflowY = 'hidden';
                    if (height < minHeight) {
                        height = minHeight;
                    }
                }

                height += boxOffset;

                if (original !== height) {
                    ta.style.height = height + 'px';
                    if (callback) {
                        options.callback.call(ta,ta);
                    }
                }
            }

            function resize () {
                clearTimeout(timeout);
                timeout = setTimeout(function(){
                    var newWidth = $ta.width();

                    if (newWidth !== width) {
                        width = newWidth;
                        adjust();
                    }
                }, parseInt(options.resizeDelay,10));
            }

            if ('onpropertychange' in ta) {
                if ('oninput' in ta) {
                    // Detects IE9.  IE9 does not fire onpropertychange or oninput for deletions,
                    // so binding to onkeyup to catch most of those occasions.  There is no way that I
                    // know of to detect something like 'cut' in IE9.
                    $ta.on('input.autosize keyup.autosize', adjust);
                } else {
                    // IE7 / IE8
                    $ta.on('propertychange.autosize', function(){
                        if(event.propertyName === 'value'){
                            adjust();
                        }
                    });
                }
            } else {
                // Modern Browsers
                $ta.on('input.autosize', adjust);
            }

            // Set options.resizeDelay to false if using fixed-width textarea elements.
            // Uses a timeout and width check to reduce the amount of times adjust needs to be called after window resize.

            if (options.resizeDelay !== false) {
                $(window).on('resize.autosize', resize);
            }

            // Event for manual triggering if needed.
            // Should only be needed when the value of the textarea is changed through JavaScript rather than user input.
            $ta.on('autosize.resize', adjust);

            // Event for manual triggering that also forces the styles to update as well.
            // Should only be needed if one of typography styles of the textarea change, and the textarea is already the target of the adjust method.
            $ta.on('autosize.resizeIncludeStyle', function() {
                mirrored = null;
                adjust();
            });

            $ta.on('autosize.destroy', function(){
                mirrored = null;
                clearTimeout(timeout);
                $(window).off('resize', resize);
                $ta
                    .off('autosize')
                    .off('.autosize')
                    .css(originalStyles)
                    .removeData('autosize');
            });

            // Call adjust in case the textarea already contains text.
            adjust();
        });
    };
}(window.jQuery || window.$)); // jQuery or jQuery-like library, such as Zepto
/*
 *	jQuery dotdotdot 1.6.16
 *
 *	Copyright (c) Fred Heusschen
 *	www.frebsite.nl
 *
 *	Plugin website:
 *	dotdotdot.frebsite.nl
 *
 *	Dual licensed under the MIT and GPL licenses.
 *	http://en.wikipedia.org/wiki/MIT_License
 *	http://en.wikipedia.org/wiki/GNU_General_Public_License
 */

(function( $, undef )
{
	if ( $.fn.dotdotdot )
	{
		return;
	}

	$.fn.dotdotdot = function( o )
	{
		if ( this.length == 0 )
		{
			$.fn.dotdotdot.debug( 'No element found for "' + this.selector + '".' );
			return this;
		}
		if ( this.length > 1 )
		{
			return this.each(
				function()
				{
					$(this).dotdotdot( o );
				}
			);
		}


		var $dot = this;

		if ( $dot.data( 'dotdotdot' ) )
		{
			$dot.trigger( 'destroy.dot' );
		}

		$dot.data( 'dotdotdot-style', $dot.attr( 'style' ) || '' );
		$dot.css( 'word-wrap', 'break-word' );
		if ($dot.css( 'white-space' ) === 'nowrap')
		{
			$dot.css( 'white-space', 'normal' );
		}

		$dot.bind_events = function()
		{
			$dot.bind(
				'update.dot',
				function( e, c )
				{
					e.preventDefault();
					e.stopPropagation();

					opts.maxHeight = ( typeof opts.height == 'number' )
						? opts.height
						: getTrueInnerHeight( $dot );

					opts.maxHeight += opts.tolerance;

					if ( typeof c != 'undefined' )
					{
						if ( typeof c == 'string' || c instanceof HTMLElement )
						{
					 		c = $('<div />').append( c ).contents();
						}
						if ( c instanceof $ )
						{
							orgContent = c;
						}
					}

					$inr = $dot.wrapInner( '<div class="dotdotdot" />' ).children();
					$inr.contents()
						.detach()
						.end()
						.append( orgContent.clone( true ) )
						.find( 'br' )
						.replaceWith( '  <br />  ' )
						.end()
						.css({
							'height'	: 'auto',
							'width'		: 'auto',
							'border'	: 'none',
							'padding'	: 0,
							'margin'	: 0
						});

					var after = false,
						trunc = false;

					if ( conf.afterElement )
					{
						after = conf.afterElement.clone( true );
					    after.show();
						conf.afterElement.detach();
					}

					if ( test( $inr, opts ) )
					{
						if ( opts.wrap == 'children' )
						{
							trunc = children( $inr, opts, after );
						}
						else
						{
							trunc = ellipsis( $inr, $dot, $inr, opts, after );
						}
					}
					$inr.replaceWith( $inr.contents() );
					$inr = null;

					if ( $.isFunction( opts.callback ) )
					{
						opts.callback.call( $dot[ 0 ], trunc, orgContent );
					}

					conf.isTruncated = trunc;
					return trunc;
				}

			).bind(
				'isTruncated.dot',
				function( e, fn )
				{
					e.preventDefault();
					e.stopPropagation();

					if ( typeof fn == 'function' )
					{
						fn.call( $dot[ 0 ], conf.isTruncated );
					}
					return conf.isTruncated;
				}

			).bind(
				'originalContent.dot',
				function( e, fn )
				{
					e.preventDefault();
					e.stopPropagation();

					if ( typeof fn == 'function' )
					{
						fn.call( $dot[ 0 ], orgContent );
					}
					return orgContent;
				}

			).bind(
				'destroy.dot',
				function( e )
				{
					e.preventDefault();
					e.stopPropagation();

					$dot.unwatch()
						.unbind_events()
						.contents()
						.detach()
						.end()
						.append( orgContent )
						.attr( 'style', $dot.data( 'dotdotdot-style' ) || '' )
						.data( 'dotdotdot', false );
				}
			);
			return $dot;
		};	//	/bind_events

		$dot.unbind_events = function()
		{
			$dot.unbind('.dot');
			return $dot;
		};	//	/unbind_events

		$dot.watch = function()
		{
			$dot.unwatch();
			if ( opts.watch == 'window' )
			{
				var $window = $(window),
					_wWidth = $window.width(),
					_wHeight = $window.height();

				$window.bind(
					'resize.dot' + conf.dotId,
					function()
					{
						if ( _wWidth != $window.width() || _wHeight != $window.height() || !opts.windowResizeFix )
						{
							_wWidth = $window.width();
							_wHeight = $window.height();

							if ( watchInt )
							{
								clearInterval( watchInt );
							}
							watchInt = setTimeout(
								function()
								{
									$dot.trigger( 'update.dot' );
								}, 100
							);
						}
					}
				);
			}
			else
			{
				watchOrg = getSizes( $dot );
				watchInt = setInterval(
					function()
					{
						if ( $dot.is( ':visible' ) )
						{
							var watchNew = getSizes( $dot );
							if ( watchOrg.width  != watchNew.width ||
								 watchOrg.height != watchNew.height )
							{
								$dot.trigger( 'update.dot' );
								watchOrg = watchNew;
							}
						}
					}, 500
				);
			}
			return $dot;
		};
		$dot.unwatch = function()
		{
			$(window).unbind( 'resize.dot' + conf.dotId );
			if ( watchInt )
			{
				clearInterval( watchInt );
			}
			return $dot;
		};

		var	orgContent	= $dot.contents(),
			opts 		= $.extend( true, {}, $.fn.dotdotdot.defaults, o ),
			conf		= {},
			watchOrg	= {},
			watchInt	= null,
			$inr		= null;


		if ( !( opts.lastCharacter.remove instanceof Array ) )
		{
			opts.lastCharacter.remove = $.fn.dotdotdot.defaultArrays.lastCharacter.remove;
		}
		if ( !( opts.lastCharacter.noEllipsis instanceof Array ) )
		{
			opts.lastCharacter.noEllipsis = $.fn.dotdotdot.defaultArrays.lastCharacter.noEllipsis;
		}


		conf.afterElement	= getElement( opts.after, $dot );
		conf.isTruncated	= false;
		conf.dotId			= dotId++;


		$dot.data( 'dotdotdot', true )
			.bind_events()
			.trigger( 'update.dot' );

		if ( opts.watch )
		{
			$dot.watch();
		}

		return $dot;
	};


	//	public
	$.fn.dotdotdot.defaults = {
		'ellipsis'			: '... ',
		'wrap'				: 'word',
		'fallbackToLetter'	: true,
		'lastCharacter'		: {},
		'tolerance'			: 0,
		'callback'			: null,
		'after'				: null,
		'height'			: null,
		'watch'				: false,
		'windowResizeFix'	: true
	};
	$.fn.dotdotdot.defaultArrays = {
		'lastCharacter'		: {
			'remove'			: [ ' ', '\u3000', ',', ';', '.', '!', '?' ],
			'noEllipsis'		: []
		}
	};
	$.fn.dotdotdot.debug = function( msg ) {};


	//	private
	var dotId = 1;

	function children( $elem, o, after )
	{
		var $elements 	= $elem.children(),
			isTruncated	= false;

		$elem.empty();

		for ( var a = 0, l = $elements.length; a < l; a++ )
		{
			var $e = $elements.eq( a );
			$elem.append( $e );
			if ( after )
			{
				$elem.append( after );
			}
			if ( test( $elem, o ) )
			{
				$e.remove();
				isTruncated = true;
				break;
			}
			else
			{
				if ( after )
				{
					after.detach();
				}
			}
		}
		return isTruncated;
	}
	function ellipsis( $elem, $d, $i, o, after )
	{
		var isTruncated	= false;

		//	Don't put the ellipsis directly inside these elements
		var notx = 'table, thead, tbody, tfoot, tr, col, colgroup, object, embed, param, ol, ul, dl, blockquote, select, optgroup, option, textarea, script, style';

		//	Don't remove these elements even if they are after the ellipsis
		var noty = 'script, .dotdotdot-keep';

		$elem
			.contents()
			.detach()
			.each(
				function()
				{

					var e	= this,
						$e	= $(e);

					if ( typeof e == 'undefined' || ( e.nodeType == 3 && $.trim( e.data ).length == 0 ) )
					{
						return true;
					}
					else if ( $e.is( noty ) )
					{
						$elem.append( $e );
					}
					else if ( isTruncated )
					{
						return true;
					}
					else
					{
						$elem.append( $e );
						if ( after )
						{
							$elem[ $elem.is( notx ) ? 'after' : 'append' ]( after );
						}
						if ( test( $i, o ) )
						{
							if ( e.nodeType == 3 ) // node is TEXT
							{
								isTruncated = ellipsisElement( $e, $d, $i, o, after );
							}
							else
							{
								isTruncated = ellipsis( $e, $d, $i, o, after );
							}

							if ( !isTruncated )
							{
								$e.detach();
								isTruncated = true;
							}
						}

						if ( !isTruncated )
						{
							if ( after )
							{
								after.detach();
							}
						}
					}
				}
			);

		return isTruncated;
	}
	function ellipsisElement( $e, $d, $i, o, after )
	{
		var e = $e[ 0 ];

		if ( !e )
		{
			return false;
		}

		var txt			= getTextContent( e ),
			space		= ( txt.indexOf(' ') !== -1 ) ? ' ' : '\u3000',
			separator	= ( o.wrap == 'letter' ) ? '' : space,
			textArr		= txt.split( separator ),
			position 	= -1,
			midPos		= -1,
			startPos	= 0,
			endPos		= textArr.length - 1;


		//	Only one word
		if ( o.fallbackToLetter && startPos == 0 && endPos == 0 )
		{
			separator	= '';
			textArr		= txt.split( separator );
			endPos		= textArr.length - 1;
		}

		while ( startPos <= endPos && !( startPos == 0 && endPos == 0 ) )
		{
			var m = Math.floor( ( startPos + endPos ) / 2 );
			if ( m == midPos )
			{
				break;
			}
			midPos = m;

			setTextContent( e, textArr.slice( 0, midPos + 1 ).join( separator ) + o.ellipsis );

			if ( !test( $i, o ) )
			{
				position = midPos;
				startPos = midPos;
			}
			else
			{
				endPos = midPos;

				//	Fallback to letter
				if (o.fallbackToLetter && startPos == 0 && endPos == 0 )
				{
					separator	= '';
					textArr		= textArr[ 0 ].split( separator );
					position	= -1;
					midPos		= -1;
					startPos	= 0;
					endPos		= textArr.length - 1;
				}
			}
		}

		if ( position != -1 && !( textArr.length == 1 && textArr[ 0 ].length == 0 ) )
		{
			txt = addEllipsis( textArr.slice( 0, position + 1 ).join( separator ), o );
			setTextContent( e, txt );
		}
		else
		{
			var $w = $e.parent();
			$e.detach();

			var afterLength = ( after && after.closest($w).length ) ? after.length : 0;

			if ( $w.contents().length > afterLength )
			{
				e = findLastTextNode( $w.contents().eq( -1 - afterLength ), $d );
			}
			else
			{
				e = findLastTextNode( $w, $d, true );
				if ( !afterLength )
				{
					$w.detach();
				}
			}
			if ( e )
			{
				txt = addEllipsis( getTextContent( e ), o );
				setTextContent( e, txt );
				if ( afterLength && after )
				{
					$(e).parent().append( after );
				}
			}
		}

		return true;
	}
	function test( $i, o )
	{
		return $i.innerHeight() > o.maxHeight;
	}
	function addEllipsis( txt, o )
	{
		while( $.inArray( txt.slice( -1 ), o.lastCharacter.remove ) > -1 )
		{
			txt = txt.slice( 0, -1 );
		}
		if ( $.inArray( txt.slice( -1 ), o.lastCharacter.noEllipsis ) < 0 )
		{
			txt += o.ellipsis;
		}
		return txt;
	}
	function getSizes( $d )
	{
		return {
			'width'	: $d.innerWidth(),
			'height': $d.innerHeight()
		};
	}
	function setTextContent( e, content )
	{
		if ( e.innerText )
		{
			e.innerText = content;
		}
		else if ( e.nodeValue )
		{
			e.nodeValue = content;
		}
		else if (e.textContent)
		{
			e.textContent = content;
		}

	}
	function getTextContent( e )
	{
		if ( e.innerText )
		{
			return e.innerText;
		}
		else if ( e.nodeValue )
		{
			return e.nodeValue;
		}
		else if ( e.textContent )
		{
			return e.textContent;
		}
		else
		{
			return "";
		}
	}
	function getPrevNode( n )
	{
		do
		{
			n = n.previousSibling;
		}
		while ( n && n.nodeType !== 1 && n.nodeType !== 3 );

		return n;
	}
	function findLastTextNode( $el, $top, excludeCurrent )
	{
		var e = $el && $el[ 0 ], p;
		if ( e )
		{
			if ( !excludeCurrent )
			{
				if ( e.nodeType === 3 )
				{
					return e;
				}
				if ( $.trim( $el.text() ) )
				{
					return findLastTextNode( $el.contents().last(), $top );
				}
			}
			p = getPrevNode( e );
			while ( !p )
			{
				$el = $el.parent();
				if ( $el.is( $top ) || !$el.length )
				{
					return false;
				}
				p = getPrevNode( $el[0] );
			}
			if ( p )
			{
				return findLastTextNode( $(p), $top );
			}
		}
		return false;
	}
	function getElement( e, $i )
	{
		if ( !e )
		{
			return false;
		}
		if ( typeof e === 'string' )
		{
			e = $(e, $i);
			return ( e.length )
				? e
				: false;
		}
		return !e.jquery
			? false
			: e;
	}
	function getTrueInnerHeight( $el )
	{
		var h = $el.innerHeight(),
			a = [ 'paddingTop', 'paddingBottom' ];

		for ( var z = 0, l = a.length; z < l; z++ )
		{
			var m = parseInt( $el.css( a[ z ] ), 10 );
			if ( isNaN( m ) )
			{
				m = 0;
			}
			h -= m;
		}
		return h;
	}


	//	override jQuery.html
	var _orgHtml = $.fn.html;
	$.fn.html = function( str )
	{
		if ( str != undef && !$.isFunction( str ) && this.data( 'dotdotdot' ) )
		{
			return this.trigger( 'update', [ str ] );
		}
		return _orgHtml.apply( this, arguments );
	};


	//	override jQuery.text
	var _orgText = $.fn.text;
	$.fn.text = function( str )
	{
		if ( str != undef && !$.isFunction( str ) && this.data( 'dotdotdot' ) )
		{
			str = $( '<div />' ).text( str ).html();
			return this.trigger( 'update', [ str ] );
		}
		return _orgText.apply( this, arguments );
	};


})( jQuery );
/*! Copyright Twitter Inc. and other contributors. Licensed under MIT */
var twemoji=function(){"use strict";var twemoji={base:(location.protocol==="https:"?"https:":"http:")+"//twemoji.maxcdn.com/",ext:".png",size:"36x36",className:"emoji",convert:{fromCodePoint:fromCodePoint,toCodePoint:toCodePoint},onerror:function onerror(){if(this.parentNode){this.parentNode.replaceChild(createText(this.alt),this)}},parse:parse,replace:replace,test:test},re=/((?:\ud83c\udde8\ud83c\uddf3|\ud83c\uddfa\ud83c\uddf8|\ud83c\uddf7\ud83c\uddfa|\ud83c\uddf0\ud83c\uddf7|\ud83c\uddef\ud83c\uddf5|\ud83c\uddee\ud83c\uddf9|\ud83c\uddec\ud83c\udde7|\ud83c\uddeb\ud83c\uddf7|\ud83c\uddea\ud83c\uddf8|\ud83c\udde9\ud83c\uddea|\u0039\ufe0f?\u20e3|\u0038\ufe0f?\u20e3|\u0037\ufe0f?\u20e3|\u0036\ufe0f?\u20e3|\u0035\ufe0f?\u20e3|\u0034\ufe0f?\u20e3|\u0033\ufe0f?\u20e3|\u0032\ufe0f?\u20e3|\u0031\ufe0f?\u20e3|\u0030\ufe0f?\u20e3|\u0023\ufe0f?\u20e3|\ud83d\udeb3|\ud83d\udeb1|\ud83d\udeb0|\ud83d\udeaf|\ud83d\udeae|\ud83d\udea6|\ud83d\udea3|\ud83d\udea1|\ud83d\udea0|\ud83d\ude9f|\ud83d\ude9e|\ud83d\ude9d|\ud83d\ude9c|\ud83d\ude9b|\ud83d\ude98|\ud83d\ude96|\ud83d\ude94|\ud83d\ude90|\ud83d\ude8e|\ud83d\ude8d|\ud83d\ude8b|\ud83d\ude8a|\ud83d\ude88|\ud83d\ude86|\ud83d\ude82|\ud83d\ude81|\ud83d\ude36|\ud83d\ude34|\ud83d\ude2f|\ud83d\ude2e|\ud83d\ude2c|\ud83d\ude27|\ud83d\ude26|\ud83d\ude1f|\ud83d\ude1b|\ud83d\ude19|\ud83d\ude17|\ud83d\ude15|\ud83d\ude11|\ud83d\ude10|\ud83d\ude0e|\ud83d\ude08|\ud83d\ude07|\ud83d\ude00|\ud83d\udd67|\ud83d\udd66|\ud83d\udd65|\ud83d\udd64|\ud83d\udd63|\ud83d\udd62|\ud83d\udd61|\ud83d\udd60|\ud83d\udd5f|\ud83d\udd5e|\ud83d\udd5d|\ud83d\udd5c|\ud83d\udd2d|\ud83d\udd2c|\ud83d\udd15|\ud83d\udd09|\ud83d\udd08|\ud83d\udd07|\ud83d\udd06|\ud83d\udd05|\ud83d\udd04|\ud83d\udd02|\ud83d\udd01|\ud83d\udd00|\ud83d\udcf5|\ud83d\udcef|\ud83d\udced|\ud83d\udcec|\ud83d\udcb7|\ud83d\udcb6|\ud83d\udcad|\ud83d\udc6d|\ud83d\udc6c|\ud83d\udc65|\ud83d\udc2a|\ud83d\udc16|\ud83d\udc15|\ud83d\udc13|\ud83d\udc10|\ud83d\udc0f|\ud83d\udc0b|\ud83d\udc0a|\ud83d\udc09|\ud83d\udc08|\ud83d\udc07|\ud83d\udc06|\ud83d\udc05|\ud83d\udc04|\ud83d\udc03|\ud83d\udc02|\ud83d\udc01|\ud83d\udc00|\ud83c\udfe4|\ud83c\udfc9|\ud83c\udfc7|\ud83c\udf7c|\ud83c\udf50|\ud83c\udf4b|\ud83c\udf33|\ud83c\udf32|\ud83c\udf1e|\ud83c\udf1d|\ud83c\udf1c|\ud83c\udf1a|\ud83c\udf18|\ud83c\udccf|\ud83c\udd70|\ud83c\udd71|\ud83c\udd7e|\ud83c\udd8e|\ud83c\udd91|\ud83c\udd92|\ud83c\udd93|\ud83c\udd94|\ud83c\udd95|\ud83c\udd96|\ud83c\udd97|\ud83c\udd98|\ud83c\udd99|\ud83c\udd9a|\ud83d\udc77|\ud83d\udec5|\ud83d\udec4|\ud83d\udec3|\ud83d\udec2|\ud83d\udec1|\ud83d\udebf|\ud83d\udeb8|\ud83d\udeb7|\ud83d\udeb5|\ud83c\ude01|\ud83c\ude02|\ud83c\ude32|\ud83c\ude33|\ud83c\ude34|\ud83c\ude35|\ud83c\ude36|\ud83c\ude37|\ud83c\ude38|\ud83c\ude39|\ud83c\ude3a|\ud83c\ude50|\ud83c\ude51|\ud83c\udf00|\ud83c\udf01|\ud83c\udf02|\ud83c\udf03|\ud83c\udf04|\ud83c\udf05|\ud83c\udf06|\ud83c\udf07|\ud83c\udf08|\ud83c\udf09|\ud83c\udf0a|\ud83c\udf0b|\ud83c\udf0c|\ud83c\udf0f|\ud83c\udf11|\ud83c\udf13|\ud83c\udf14|\ud83c\udf15|\ud83c\udf19|\ud83c\udf1b|\ud83c\udf1f|\ud83c\udf20|\ud83c\udf30|\ud83c\udf31|\ud83c\udf34|\ud83c\udf35|\ud83c\udf37|\ud83c\udf38|\ud83c\udf39|\ud83c\udf3a|\ud83c\udf3b|\ud83c\udf3c|\ud83c\udf3d|\ud83c\udf3e|\ud83c\udf3f|\ud83c\udf40|\ud83c\udf41|\ud83c\udf42|\ud83c\udf43|\ud83c\udf44|\ud83c\udf45|\ud83c\udf46|\ud83c\udf47|\ud83c\udf48|\ud83c\udf49|\ud83c\udf4a|\ud83c\udf4c|\ud83c\udf4d|\ud83c\udf4e|\ud83c\udf4f|\ud83c\udf51|\ud83c\udf52|\ud83c\udf53|\ud83c\udf54|\ud83c\udf55|\ud83c\udf56|\ud83c\udf57|\ud83c\udf58|\ud83c\udf59|\ud83c\udf5a|\ud83c\udf5b|\ud83c\udf5c|\ud83c\udf5d|\ud83c\udf5e|\ud83c\udf5f|\ud83c\udf60|\ud83c\udf61|\ud83c\udf62|\ud83c\udf63|\ud83c\udf64|\ud83c\udf65|\ud83c\udf66|\ud83c\udf67|\ud83c\udf68|\ud83c\udf69|\ud83c\udf6a|\ud83c\udf6b|\ud83c\udf6c|\ud83c\udf6d|\ud83c\udf6e|\ud83c\udf6f|\ud83c\udf70|\ud83c\udf71|\ud83c\udf72|\ud83c\udf73|\ud83c\udf74|\ud83c\udf75|\ud83c\udf76|\ud83c\udf77|\ud83c\udf78|\ud83c\udf79|\ud83c\udf7a|\ud83c\udf7b|\ud83c\udf80|\ud83c\udf81|\ud83c\udf82|\ud83c\udf83|\ud83c\udf84|\ud83c\udf85|\ud83c\udf86|\ud83c\udf87|\ud83c\udf88|\ud83c\udf89|\ud83c\udf8a|\ud83c\udf8b|\ud83c\udf8c|\ud83c\udf8d|\ud83c\udf8e|\ud83c\udf8f|\ud83c\udf90|\ud83c\udf91|\ud83c\udf92|\ud83c\udf93|\ud83c\udfa0|\ud83c\udfa1|\ud83c\udfa2|\ud83c\udfa3|\ud83c\udfa4|\ud83c\udfa5|\ud83c\udfa6|\ud83c\udfa7|\ud83c\udfa8|\ud83c\udfa9|\ud83c\udfaa|\ud83c\udfab|\ud83c\udfac|\ud83c\udfad|\ud83c\udfae|\ud83c\udfaf|\ud83c\udfb0|\ud83c\udfb1|\ud83c\udfb2|\ud83c\udfb3|\ud83c\udfb4|\ud83c\udfb5|\ud83c\udfb6|\ud83c\udfb7|\ud83c\udfb8|\ud83c\udfb9|\ud83c\udfba|\ud83c\udfbb|\ud83c\udfbc|\ud83c\udfbd|\ud83c\udfbe|\ud83c\udfbf|\ud83c\udfc0|\ud83c\udfc1|\ud83c\udfc2|\ud83c\udfc3|\ud83c\udfc4|\ud83c\udfc6|\ud83c\udfc8|\ud83c\udfca|\ud83c\udfe0|\ud83c\udfe1|\ud83c\udfe2|\ud83c\udfe3|\ud83c\udfe5|\ud83c\udfe6|\ud83c\udfe7|\ud83c\udfe8|\ud83c\udfe9|\ud83c\udfea|\ud83c\udfeb|\ud83c\udfec|\ud83c\udfed|\ud83c\udfee|\ud83c\udfef|\ud83c\udff0|\ud83d\udc0c|\ud83d\udc0d|\ud83d\udc0e|\ud83d\udc11|\ud83d\udc12|\ud83d\udc14|\ud83d\udc17|\ud83d\udc18|\ud83d\udc19|\ud83d\udc1a|\ud83d\udc1b|\ud83d\udc1c|\ud83d\udc1d|\ud83d\udc1e|\ud83d\udc1f|\ud83d\udc20|\ud83d\udc21|\ud83d\udc22|\ud83d\udc23|\ud83d\udc24|\ud83d\udc25|\ud83d\udc26|\ud83d\udc27|\ud83d\udc28|\ud83d\udc29|\ud83d\udc2b|\ud83d\udc2c|\ud83d\udc2d|\ud83d\udc2e|\ud83d\udc2f|\ud83d\udc30|\ud83d\udc31|\ud83d\udc32|\ud83d\udc33|\ud83d\udc34|\ud83d\udc35|\ud83d\udc36|\ud83d\udc37|\ud83d\udc38|\ud83d\udc39|\ud83d\udc3a|\ud83d\udc3b|\ud83d\udc3c|\ud83d\udc3d|\ud83d\udc3e|\ud83d\udc40|\ud83d\udc42|\ud83d\udc43|\ud83d\udc44|\ud83d\udc45|\ud83d\udc46|\ud83d\udc47|\ud83d\udc48|\ud83d\udc49|\ud83d\udc4a|\ud83d\udc4b|\ud83d\udc4c|\ud83d\udc4d|\ud83d\udc4e|\ud83d\udc4f|\ud83d\udc50|\ud83d\udc51|\ud83d\udc52|\ud83d\udc53|\ud83d\udc54|\ud83d\udc55|\ud83d\udc56|\ud83d\udc57|\ud83d\udc58|\ud83d\udc59|\ud83d\udc5a|\ud83d\udc5b|\ud83d\udc5c|\ud83d\udc5d|\ud83d\udc5e|\ud83d\udc5f|\ud83d\udc60|\ud83d\udc61|\ud83d\udc62|\ud83d\udc63|\ud83d\udc64|\ud83d\udc66|\ud83d\udc67|\ud83d\udc68|\ud83d\udc69|\ud83d\udc6a|\ud83d\udc6b|\ud83d\udc6e|\ud83d\udc6f|\ud83d\udc70|\ud83d\udc71|\ud83d\udc72|\ud83d\udc73|\ud83d\udc74|\ud83d\udc75|\ud83d\udc76|\ud83d\udeb4|\ud83d\udc78|\ud83d\udc79|\ud83d\udc7a|\ud83d\udc7b|\ud83d\udc7c|\ud83d\udc7d|\ud83d\udc7e|\ud83d\udc7f|\ud83d\udc80|\ud83d\udc81|\ud83d\udc82|\ud83d\udc83|\ud83d\udc84|\ud83d\udc85|\ud83d\udc86|\ud83d\udc87|\ud83d\udc88|\ud83d\udc89|\ud83d\udc8a|\ud83d\udc8b|\ud83d\udc8c|\ud83d\udc8d|\ud83d\udc8e|\ud83d\udc8f|\ud83d\udc90|\ud83d\udc91|\ud83d\udc92|\ud83d\udc93|\ud83d\udc94|\ud83d\udc95|\ud83d\udc96|\ud83d\udc97|\ud83d\udc98|\ud83d\udc99|\ud83d\udc9a|\ud83d\udc9b|\ud83d\udc9c|\ud83d\udc9d|\ud83d\udc9e|\ud83d\udc9f|\ud83d\udca0|\ud83d\udca1|\ud83d\udca2|\ud83d\udca3|\ud83d\udca4|\ud83d\udca5|\ud83d\udca6|\ud83d\udca7|\ud83d\udca8|\ud83d\udca9|\ud83d\udcaa|\ud83d\udcab|\ud83d\udcac|\ud83d\udcae|\ud83d\udcaf|\ud83d\udcb0|\ud83d\udcb1|\ud83d\udcb2|\ud83d\udcb3|\ud83d\udcb4|\ud83d\udcb5|\ud83d\udcb8|\ud83d\udcb9|\ud83d\udcba|\ud83d\udcbb|\ud83d\udcbc|\ud83d\udcbd|\ud83d\udcbe|\ud83d\udcbf|\ud83d\udcc0|\ud83d\udcc1|\ud83d\udcc2|\ud83d\udcc3|\ud83d\udcc4|\ud83d\udcc5|\ud83d\udcc6|\ud83d\udcc7|\ud83d\udcc8|\ud83d\udcc9|\ud83d\udcca|\ud83d\udccb|\ud83d\udccc|\ud83d\udccd|\ud83d\udcce|\ud83d\udccf|\ud83d\udcd0|\ud83d\udcd1|\ud83d\udcd2|\ud83d\udcd3|\ud83d\udcd4|\ud83d\udcd5|\ud83d\udcd6|\ud83d\udcd7|\ud83d\udcd8|\ud83d\udcd9|\ud83d\udcda|\ud83d\udcdb|\ud83d\udcdc|\ud83d\udcdd|\ud83d\udcde|\ud83d\udcdf|\ud83d\udce0|\ud83d\udce1|\ud83d\udce2|\ud83d\udce3|\ud83d\udce4|\ud83d\udce5|\ud83d\udce6|\ud83d\udce7|\ud83d\udce8|\ud83d\udce9|\ud83d\udcea|\ud83d\udceb|\ud83d\udcee|\ud83d\udcf0|\ud83d\udcf1|\ud83d\udcf2|\ud83d\udcf3|\ud83d\udcf4|\ud83d\udcf6|\ud83d\udcf7|\ud83d\udcf9|\ud83d\udcfa|\ud83d\udcfb|\ud83d\udcfc|\ud83d\udd03|\ud83d\udd0a|\ud83d\udd0b|\ud83d\udd0c|\ud83d\udd0d|\ud83d\udd0e|\ud83d\udd0f|\ud83d\udd10|\ud83d\udd11|\ud83d\udd12|\ud83d\udd13|\ud83d\udd14|\ud83d\udd16|\ud83d\udd17|\ud83d\udd18|\ud83d\udd19|\ud83d\udd1a|\ud83d\udd1b|\ud83d\udd1c|\ud83d\udd1d|\ud83d\udd1e|\ud83d\udd1f|\ud83d\udd20|\ud83d\udd21|\ud83d\udd22|\ud83d\udd23|\ud83d\udd24|\ud83d\udd25|\ud83d\udd26|\ud83d\udd27|\ud83d\udd28|\ud83d\udd29|\ud83d\udd2a|\ud83d\udd2b|\ud83d\udd2e|\ud83d\udd2f|\ud83d\udd30|\ud83d\udd31|\ud83d\udd32|\ud83d\udd33|\ud83d\udd34|\ud83d\udd35|\ud83d\udd36|\ud83d\udd37|\ud83d\udd38|\ud83d\udd39|\ud83d\udd3a|\ud83d\udd3b|\ud83d\udd3c|\ud83d\udd3d|\ud83d\udd50|\ud83d\udd51|\ud83d\udd52|\ud83d\udd53|\ud83d\udd54|\ud83d\udd55|\ud83d\udd56|\ud83d\udd57|\ud83d\udd58|\ud83d\udd59|\ud83d\udd5a|\ud83d\udd5b|\ud83d\uddfb|\ud83d\uddfc|\ud83d\uddfd|\ud83d\uddfe|\ud83d\uddff|\ud83d\ude01|\ud83d\ude02|\ud83d\ude03|\ud83d\ude04|\ud83d\ude05|\ud83d\ude06|\ud83d\ude09|\ud83d\ude0a|\ud83d\ude0b|\ud83d\ude0c|\ud83d\ude0d|\ud83d\ude0f|\ud83d\ude12|\ud83d\ude13|\ud83d\ude14|\ud83d\ude16|\ud83d\ude18|\ud83d\ude1a|\ud83d\ude1c|\ud83d\ude1d|\ud83d\ude1e|\ud83d\ude20|\ud83d\ude21|\ud83d\ude22|\ud83d\ude23|\ud83d\ude24|\ud83d\ude25|\ud83d\ude28|\ud83d\ude29|\ud83d\ude2a|\ud83d\ude2b|\ud83d\ude2d|\ud83d\ude30|\ud83d\ude31|\ud83d\ude32|\ud83d\ude33|\ud83d\ude35|\ud83d\ude37|\ud83d\ude38|\ud83d\ude39|\ud83d\ude3a|\ud83d\ude3b|\ud83d\ude3c|\ud83d\ude3d|\ud83d\ude3e|\ud83d\ude3f|\ud83d\ude40|\ud83d\ude45|\ud83d\ude46|\ud83d\ude47|\ud83d\ude48|\ud83d\ude49|\ud83d\ude4a|\ud83d\ude4b|\ud83d\ude4c|\ud83d\ude4d|\ud83d\ude4e|\ud83d\ude4f|\ud83d\ude80|\ud83d\ude83|\ud83d\ude84|\ud83d\ude85|\ud83d\ude87|\ud83d\ude89|\ud83d\ude8c|\ud83d\ude8f|\ud83d\ude91|\ud83d\ude92|\ud83d\ude93|\ud83d\ude95|\ud83d\ude97|\ud83d\ude99|\ud83d\ude9a|\ud83d\udea2|\ud83d\udea4|\ud83d\udea5|\ud83d\udea7|\ud83d\udea8|\ud83d\udea9|\ud83d\udeaa|\ud83d\udeab|\ud83d\udeac|\ud83d\udead|\ud83d\udeb2|\ud83d\udeb6|\ud83d\udeb9|\ud83d\udeba|\ud83d\udebb|\ud83d\udebc|\ud83d\udebd|\ud83d\udebe|\ud83d\udec0|\ud83c\udde6|\ud83c\udde7|\ud83c\udde8|\ud83c\udde9|\ud83c\uddea|\ud83c\uddeb|\ud83c\uddec|\ud83c\udded|\ud83c\uddee|\ud83c\uddef|\ud83c\uddf0|\ud83c\uddf1|\ud83c\uddf2|\ud83c\uddf3|\ud83c\uddf4|\ud83c\uddf5|\ud83c\uddf6|\ud83c\uddf7|\ud83c\uddf8|\ud83c\uddf9|\ud83c\uddfa|\ud83c\uddfb|\ud83c\uddfc|\ud83c\uddfd|\ud83c\uddfe|\ud83c\uddff|\ud83c\udf0d|\ud83c\udf0e|\ud83c\udf10|\ud83c\udf12|\ud83c\udf16|\ud83c\udf17|\ue50a|\u3030|\u27b0|\u2797|\u2796|\u2795|\u2755|\u2754|\u2753|\u274e|\u274c|\u2728|\u270b|\u270a|\u2705|\u26ce|\u23f3|\u23f0|\u23ec|\u23eb|\u23ea|\u23e9|\u2122|\u27bf|\u00a9|\u00ae)|(?:(?:\ud83c\udc04|\ud83c\udd7f|\ud83c\ude1a|\ud83c\ude2f|\u3299|\u303d|\u2b55|\u2b50|\u2b1c|\u2b1b|\u2b07|\u2b06|\u2b05|\u2935|\u2934|\u27a1|\u2764|\u2757|\u2747|\u2744|\u2734|\u2733|\u2716|\u2714|\u2712|\u270f|\u270c|\u2709|\u2708|\u2702|\u26fd|\u26fa|\u26f5|\u26f3|\u26f2|\u26ea|\u26d4|\u26c5|\u26c4|\u26be|\u26bd|\u26ab|\u26aa|\u26a1|\u26a0|\u2693|\u267f|\u267b|\u3297|\u2666|\u2665|\u2663|\u2660|\u2653|\u2652|\u2651|\u2650|\u264f|\u264e|\u264d|\u264c|\u264b|\u264a|\u2649|\u2648|\u263a|\u261d|\u2615|\u2614|\u2611|\u260e|\u2601|\u2600|\u25fe|\u25fd|\u25fc|\u25fb|\u25c0|\u25b6|\u25ab|\u25aa|\u24c2|\u231b|\u231a|\u21aa|\u21a9|\u2199|\u2198|\u2197|\u2196|\u2195|\u2194|\u2139|\u2049|\u203c|\u2668)([\uFE0E\uFE0F]?)))/g,shouldntBeParsed=/IFRAME|NOFRAMES|NOSCRIPT|SCRIPT|SELECT|STYLE|TEXTAREA/,fromCharCode=String.fromCharCode;return twemoji;function createText(text){return document.createTextNode(text)}function defaultImageSrcGenerator(icon,options){return"".concat(options.base,options.size,"/",icon,options.ext)}function grabAllTextNodes(node,allText){var childNodes=node.childNodes,length=childNodes.length,subnode,nodeType;while(length--){subnode=childNodes[length];nodeType=subnode.nodeType;if(nodeType===3){allText.push(subnode)}else if(nodeType===1&&!shouldntBeParsed.test(subnode.nodeName)){grabAllTextNodes(subnode,allText)}}return allText}function grabTheRightIcon(icon,variant){return toCodePoint(variant==="️"?icon.slice(0,-1):icon.length===3&&icon.charAt(1)==="️"?icon.charAt(0)+icon.charAt(2):icon)}function parseNode(node,options){var allText=grabAllTextNodes(node,[]),length=allText.length,modified,fragment,subnode,text,match,i,index,img,alt,icon,variant,src;while(length--){modified=false;fragment=document.createDocumentFragment();subnode=allText[length];text=subnode.nodeValue;i=0;while(match=re.exec(text)){index=match.index;if(index!==i){fragment.appendChild(createText(text.slice(i,index)))}alt=match[0];icon=match[1];variant=match[2];i=index+alt.length;if(variant!=="︎"){src=options.callback(grabTheRightIcon(icon,variant),options,variant);if(src){img=new Image;img.onerror=twemoji.onerror;img.className=options.className;img.setAttribute("draggable","false");img.alt=alt;img.src=src;modified=true;fragment.appendChild(img)}}if(!img)fragment.appendChild(createText(alt));img=null}if(modified){if(i<text.length){fragment.appendChild(createText(text.slice(i)))}subnode.parentNode.replaceChild(fragment,subnode)}}return node}function parseString(str,options){return replace(str,function(match,icon,variant){var src;if(variant!=="︎"){src=options.callback(grabTheRightIcon(icon,variant),options,variant);if(src){match="<img ".concat('class="',options.className,'" ','draggable="false" ','alt="',match,'" ','src="',src,'"',">")}}return match})}function toSizeSquaredAsset(value){return typeof value==="number"?value+"x"+value:value}function fromCodePoint(codepoint){var code=typeof codepoint==="string"?parseInt(codepoint,16):codepoint;if(code<65536){return fromCharCode(code)}code-=65536;return fromCharCode(55296+(code>>10),56320+(code&1023))}function parse(what,how){if(!how||typeof how==="function"){how={callback:how}}return(typeof what==="string"?parseString:parseNode)(what,{callback:how.callback||defaultImageSrcGenerator,base:typeof how.base==="string"?how.base:twemoji.base,ext:how.ext||twemoji.ext,size:how.folder||toSizeSquaredAsset(how.size||twemoji.size),className:how.className||twemoji.className})}function replace(text,callback){return String(text).replace(re,callback)}function test(text){re.lastIndex=0;var result=re.test(text);re.lastIndex=0;return result}function toCodePoint(unicodeSurrogates,sep){var r=[],c=0,p=0,i=0;while(i<unicodeSurrogates.length){c=unicodeSurrogates.charCodeAt(i++);if(p){r.push((65536+(p-55296<<10)+(c-56320)).toString(16));p=0}else if(55296<=c&&c<=56319){p=c}else{r.push(c.toString(16))}}return r.join(sep||"-")}}();
/**
 * @fileOverview Создание и расширение неймспейса. Создание модулей tools, features, modules
 */

/**
 * @param       {Object}     window     Ссылка на window
 * @param       {Object}     document   Ссылка на document
 * @param       {Object}     modules    Ссылка на модульную систему YModules
 */
(function ( window, document, modules, undefined ) {

    var
        /**
         * Функция расширения нэймспейса проекта
         *
         * @alias   BM.tools.extendApp
         * 
         * @param   {string}    ns_string    Строка отображающая глубину вложенности модуля
         * @return  {Object}                 Созданный модуль в нэймспейсе
         */
        extendApp = function extendApp( ns_string ) {
            window.BM = window.BM || {};

            var
                parts = ns_string.split('.'),
                parent = window.BM,
                pl, i;
            // end of vars

            if ( parts[0] === 'BM' ) {
                parts = parts.slice(1);
            }

            pl = parts.length;

            for ( i = 0; i < pl; i++ ) {
                //create a property if it doesnt exist  
                if ( typeof parent[parts[i]] === 'undefined' ) {
                    parent[parts[i]] = {};
                }

                parent = parent[parts[i]];
            }

            return parent;
        },


        moduleBM = function( provide ) {
            var
                /**
                 * Bookmate root namespace
                 * 
                 * @namespace BM
                 */
                BM = extendApp('BM');
            // end of vars

            provide(BM);
        },


        /**
         * Bookmate config namespace
         *
         * @alias       BM.config
         * @memberOf    BM
         * @namespace   BM.config
         */
        config = extendApp('BM.config'),

        moduleConfig = function( provide ) {
            provide(config);
        },

        /**
         * Bookmate features namespace
         *
         * @alias       BM.features
         * @memberOf    BM
         * @namespace   BM.features
         */
        features = extendApp('BM.features'),

        moduleFeatures = function( provide ) {    
            provide(features);
        },

        /**
         * Bookmate modules namespace
         *
         * @alias       BM.modules
         * @memberOf    BM
         * @namespace   BM.modules
         */
        modulesNs = extendApp('BM.modules'),

        moduleModules = function( provide ) {
            provide(modulesNs);
        },

        /**
         * Bookmate tools namespace
         *
         * @alias       BM.tools
         * @memberOf    BM
         * @namespace   BM.tools
         */
        tools = extendApp('BM.tools'),

        moduleTools = function( provide ) {    
            provide(tools);
        };
    // end of vars

    tools.extendApp = extendApp;

    /**
     * Bookmate root namespace
     */
    modules.define(
        'BM',           // Module name
        [],             // Dependies
        moduleBM        // Module realization
    );

    /**
     * Bookmate tools namespace
     */
    modules.define(
        'tools',        // Module name
        [],             // Dependies
        moduleTools     // Module realization
    );

    /**
     * Bookmate features namespace
     */
    modules.define(
        'features',     // Module name
        [],             // Dependies
        moduleFeatures  // Module realization
    );

    /**
     * Bookmate modules namespace
     */
    modules.define(
        'modules',      // Module name
        [],             // Dependies
        moduleModules   // Module realization
    );

    /**
     * Bookmate configuratiuon namespace
     */
    modules.define(
        'config',       // Module name
        [],             // Dependies
        moduleConfig    // Module realization
    );
}(
    this,
    this.document,
    this.modules
));
/**
 * @fileOverview Определение текущего AB тестирования
 */

/**
 *
 * @param       {Object}     window         Ссылка на window
 * @param       {Object}     document       Ссылка на document
 * @param       {function}   $              Ссылка на jQuery
 * @param       {Function}   modules        Ссылка на modules
 * @param       {Object}     docCookies     Ссылка на docCookies
 */
(function ( window, document, $, modules, docCookies ) {
    'use strict';

    var
        /**
         * Реализация модуля abTestDetect
         * 
         * @param       {Function}  provide     Ассинхронный экспорт модуля
         * @param       {Object}    modules     Ссылка на нэймспейс BM.modules
         * @param       {Object}    config      Ссылка на нэймспейс BM.config
         */
        abTestDetectModule = function( provide, modules, config ) {
            var
                /**
                 * 
                 * @memberOf    BM.modules
                 *
                 * @see         {@link module:abTestDetect}  Описание модуля abTestDetect
                 */
                abTestDetect = (function() {
                    var
                        /**
                         * =======================
                         * === Private Methods ===
                         * =======================
                         */
                        
                        /**
                         * Получение списка текущих AB тестов
                         *
                         * @memberOf    module:abTestDetect#
                         * @private
                         * 
                         * @return      {array}
                         */
                        nowABtests = function nowABtests() {
                            var
                                mainConfig = config.mainConfig || {},
                                tests = mainConfig.abTests || [];
                            // end of vars

                            return tests;
                        },

                        /**
                         * Проверка существования теста по имени
                         *
                         * @memberOf    module:abTestDetect#
                         * @private
                         *
                         * @param       {string}    abTestName  Имя AB теста
                         * 
                         * @return      {boolean}
                         */
                        isTest = function isTest( abTestName ) {
                            var
                                tests = nowABtests();
                            // end of vars

                            return docCookies.hasItem(abTestName);
                        },

                        /**
                         * ======================
                         * === Public Methods ===
                         * ======================
                         */


                        /**
                         * Получение значения AB теста по имени
                         *
                         * @memberOf    module:abTestDetect#
                         * @public
                         *
                         * @param       {string}    abTestName  Имя AB теста
                         * 
                         * @return      {*}                     Значение AB теста
                         */
                        getTestValue = function getTestValue( abTestName ) {
                            if ( !isTest(abTestName) ) {
                                return false;
                            }

                            return docCookies.getItem(abTestName);
                        };
                    // end of vars

                    return {
                        getTestValue: getTestValue
                    };
                }());
            // end of vars


            // Export
            modules.abTestDetect = abTestDetect;
            provide(abTestDetect);
        };
    // end of vars


    /**
     * Модуль определения текущих AB тестов
     *
     * @requires    jQuery
     * @requires    modules
     * 
     * @module      abTestDetect
     */
    modules.define(
        'abTestDetect',             // Module name
        ['modules', 'config'],      // Dependies
        abTestDetectModule          // Module realization
    );
}(
    this,
    this.document,
    this.jQuery,
    this.modules,
    this.docCookies
));
/**
 * @fileOverview Первоначальные настройки AJAX jQuery
 */

/**
 *
 * @param       {Object}     window     Ссылка на window
 * @param       {Object}     document   Ссылка на document
 * @param       {function}   $          Ссылка на jQuery
 */
(function ( window, document, $ ) {
    /**
     * Общие настройки AJAX
     *
     * @requires    jQuery
     */
    $.ajaxSetup({
        
        timeout: 30000,

        statusCode: {
            404: function() {
                var
                    ajaxUrl = this.url,
                    data = {
                        event: 'ajax_error',
                        type: '404 ошибка',
                        ajaxUrl: ajaxUrl
                    };
                // end of vars

                /** log error */
            },

            401: function() {
                /** auth log error */
            },

            500: function() {
                var
                    ajaxUrl = this.url,
                    data = {
                        event: 'ajax_error',
                        type: '500 ошибка',
                        ajaxUrl: ajaxUrl
                    };
                // end of vars

                /** log error */
            },

            503: function() {
                var
                    ajaxUrl = this.url,
                    data = {
                        event: 'ajax_error',
                        type: '503 ошибка',
                        ajaxUrl: ajaxUrl
                    };
                // end of vars

                /** log error */
            },

            504: function() {
                var
                    ajaxUrl = this.url,
                    data = {
                        event: 'ajax_error',
                        type: '504 ошибка',
                        ajaxUrl: ajaxUrl
                    };
                // end of vars

                /** log error */
            }
        },

        error: function ( jqXHR, textStatus, errorThrown ) {
            var
                ajaxUrl = this.url,
                data = {
                    event: 'ajax_error',
                    type: 'неизвестная ajax ошибка',
                    ajaxUrl: ajaxUrl
                };
            // end of vars
            
            if ( jqXHR.statusText === 'error' ) {
                /** log error */
            } else if ( textStatus === 'timeout' ) {
                return;
            }
        }
    });
}(this, this.document, this.jQuery));
/**
 * @fileOverview Конфигурация пришедшая с сервера
 */

/**
 * @param       {Object}    window      Ссылка на window
 * @param       {Object}    document    Ссылка на document
 * @param       {Object}    BM          Ссылка на Bookmate namespace
 * @param       {Object}    JSON        Ссылка JSON библиотеку
 */
(function ( window, document, BM, JSON ) {
    var
        /**
         * @alias BM.config
         */
        config = BM.config = BM.config || {},
        mainConfig = document.body.getAttribute('data-config'),

        /**
         * Конфигурация с сервера
         *
         * @alias       BM.config.mainConfig
         * @requires    JSON
         * @type        {Object}
         */
        parsedMainConfig = JSON.parse(mainConfig) || {},

        /**
         * Конфигурация с сервера
         *
         * @alias       BM.config.updateMainConfig
         *
         * @param       {callback} [callback] Колбек, в который сработает после получения ответа от сервера
         * @type        {Object}
         */
        updateMainConfig = function(callback) {
            var
                updateCallback = BM.tools.isFunction(callback) ? callback : function() {};
            // end of vars

            $.ajax({
                url : '/frontend_config',
                dataType : 'json',
                success : function(response) {
                    try {
                        document.body.setAttribute('data-config', JSON.strigify(response));
                    } catch (e) { }

                    config.mainConfig = response;

                    updateCallback(response);
                },
                error: function() {
                    updateCallback(false);
                }
            });
        };
    // end of vars

    config.updateMainConfig = updateMainConfig;
    config.mainConfig = parsedMainConfig;

    config.isDevelopment = function() {
        return config.mainConfig.environment === 'development';
    };

    config.isProduction = function() {
        return config.mainConfig.environment === 'production';
    };

    config.isStaging = function() {
        return config.mainConfig.environment === 'staging';
    };

}(
    this,
    this.document,
    this.BM || {},
    this.JSON
));
/**
 * @fileOverview Определение дебаг режима приложения
 */

/**
 * @param       {Object}     window     Ссылка на window
 * @param       {Object}     document   Ссылка на document
 * @param       {Object}     BM         Ссылка на Bookmate namespace
 * @param       {Object}     JSON       Ссылка JSON библиотеку
 */
(function ( window, document, BM, JSON ) {
    var
        /**
         * @alias   BM.config
         */
        config = BM.config = BM.config || {},
        mainConfig = document.body.getAttribute('data-config'),

        /**
         * Конфигурация с сервера
         * 
         * @requires    JSON
         * @type        {Object}
         */
        parsedMainConfig = JSON.parse(mainConfig) || {},
        configDebug = parsedMainConfig.debug || false,

        debug = false;
    // end of vars
    
    if ( configDebug || document.location.search.match(/jsdbg/) ) {
        debug = true;
    }

    /**
     * Находится ли приложение в debug режиме
     *
     * @alias    BM.config.debug
     * @type     {boolean}
     */
    config.debug = debug;

}(
    this,
    this.document,
    this.BM || {},
    this.JSON
));
/**
 * @fileOverview Вспомогательные функции для проверок переменных
 */

/**
 * @param       {Object}    window      Ссылка на window
 * @param       {Object}    document    Ссылка на document
 * @param       {Object}    BM          Ссылка на Bookmate namespace
 */
(function (window, document, navigator, BM, undefined) {
  var
    /**
     * @alias       BM.tools.client
     */
    Breakpoint = {
      MOBILE: 639
    },

    tools = BM.tools = BM.tools || {},

    reload = function () {
      window.location.reload();
    },

    client = BM.tools.client = BM.tools.client || {},

    isWindows = function () {
      return navigator.appVersion.indexOf("Win") !== -1;
    },

    isMacOS = function () {
      return navigator.appVersion.indexOf("Mac") !== -1;
    },

    isUnix = function () {
      return navigator.appVersion.indexOf("X11") !== -1;
    },

    isLinux = function () {
      return navigator.appVersion.indexOf("Linux") !== -1;
    },

    isTouch = function () {
      return 'ontouchstart' in window || navigator.msMaxTouchPoints !== undefined;
    },

    isDesktop = function() {
      return !isTouch();
    },

    isiOS = function () {
      return ( /(iPad|iPhone|iPod)/g.test(window.navigator.userAgent) );
    },

    isAndroid = function () {
      return ( window.navigator.userAgent.toLowerCase().indexOf('android') !== -1 );
    },

    isWindowsPhone = function () {
      return ( window.navigator.userAgent.match(/Windows Phone/i) );
    },

    isBreakpointMobile = function () {
      return $(window).width() <= Breakpoint.MOBILE;
    };
  // end of vars

  tools.reload = reload;

  client.isWindows = isWindows;
  client.isMacOS = isMacOS;
  client.isUnix = isUnix;
  client.isLinux = isLinux;
  client.isTouch = isTouch;
  client.isiOS = isiOS;
  client.isAndroid = isAndroid;
  client.isWindowsPhone = isWindowsPhone;
  client.isBreakpointMobile = isBreakpointMobile;

}(
  this,
  this.document,
  this.navigator,
  this.BM = this.BM || {}
));
/**
 * @fileOverview Клонирование объектов
 */

/**
 * @param       {Object}    window      Ссылка на window
 * @param       {Object}    document    Ссылка на document
 * @param       {Object}    BM          Ссылка на Bookmate namespace
 */
(function ( window, document, BM ) {
    var
        /**
         * @alias       BM.tools
         */
        tools = BM.tools = BM.tools || {},

        /**
         * Clone object
         *
         * @alias    BM.tools.clone
         * 
         * @param    {Object}    obj
         * @return   {Object}
         */
        clone = function clone( obj ) {
            var copy,
                attr,
                i,
                len;
            
            // Handle the 3 simple types, and null or undefined
            if ( obj === null || typeof obj !== 'object' ) {
                return obj;
            }
            
            // Handle Date
            if ( obj instanceof Date ) {
                copy = new Date();
                copy.setTime(obj.getTime());

                return copy;
            }
            
            // Handle Array
            if ( obj instanceof Array ) {
                copy = [];
                
                for ( i = 0, len = obj.length; i < len; i++ ) {
                    copy[i] = clone(obj[i]);
                }
                
                return copy;
            }
            
            // Handle Object
            if ( obj instanceof Object ) {
                copy = {};
                
                for ( attr in obj ) {
                    if ( obj.hasOwnProperty(attr) ) {
                        copy[attr] = clone(obj[attr]);
                    }
                }
                
                return copy;
            }
        };
    // end of vars

    tools.clone = clone;
}(
    this,
    this.document,
    this.BM = this.BM || {}
));
function debounce(fn, delay) {
  var timer = null;
  return function () {
    var context = this, args = arguments;
    clearTimeout(timer);
    timer = setTimeout(function () {
      fn.apply(context, args);
    }, delay);
  };
}

(function(window, document, BM){

  var tools = BM.tools = BM.tools || {};

  var slice = Array.prototype.slice;

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  var delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){
      return func.apply(null, args);
    }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  var defer = function(func) {
    return delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
  };

  tools.defer = defer;

})(
  this,
  this.document,
  this.BM = this.BM || {}
);

(function ( window, document, BM, $ ) {
    BM.tools = BM.tools || {};

    BM.tools.domHelper = {

        tojQueryObject : function(element) {
            if (typeof element === 'string') {
                return $(element);
            } else if (element instanceof window.HTMLElement) {
                return $(element);
            } else if (element instanceof $) {
                return element;
            } else {
                return null;
            }
        }

    };

}(
        this,
        this.document,
        this.BM = this.BM || {},
        this.jQuery
    ));
/**
 * @fileOverview Реализация наследования
 */

/**
 * @param       {Object}    window      Ссылка на window
 * @param       {Object}    document    Ссылка на document
 * @param       {Object}    modules     Ссылка на модульную систему YModules
 */
(function ( window, document, modules ) {
    var
        /**
         * @param       {Function}  provide     Ассинхронный экспорт модуля
         */
        extendModule = function( provide ) {
            var
                extend = function extend( parent ) {
                    var
                        f = function() {},
                        c = function() {
                            return this.initialize.apply(this, arguments);
                        };
                    // end of vars
                    
                    f.prototype = parent.prototype;
                    c.prototype = new f();
                    c.prototype.constructor = c;
                    c.superclass = f.prototype;

                    return c;
                };
            // end of vars


            // Export
            provide(extend);
        };
    // end of vars


    /**
     * Модуль реализации наследования
     * 
     * @module      extend
     */
    modules.define(
        'extend',        // Module name
        [],              // Dependies
        extendModule     // Module realization
    );

}(
    this,
    this.document,
    this.modules
));
function dataURItoBlob(dataURI) {
  // convert base64 to raw binary data held in a string
  // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
  var byteString = atob(dataURI.split(',')[1]);

  // separate out the mime component
  var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]

  // write the bytes of the string to an ArrayBuffer
  var ab = new ArrayBuffer(byteString.length);
  var ia = new Uint8Array(ab);
  for (var i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }

  try {
    return new Blob([ab], {type: mimeString});
  } catch (e) {
    // The BlobBuilder API has been deprecated in favour of Blob, but older
    // browsers don't know about the Blob constructor
    // IE10 also supports BlobBuilder, but since the `Blob` constructor
    //  also works, there's no need to add `MSBlobBuilder`.
    var BlobBuilder = window.WebKitBlobBuilder || window.MozBlobBuilder;
    var bb = new BlobBuilder();
    bb.append(ab);
    return bb.getBlob(mimeString);
  }
}

(function(window){
    var tools = BM.tools = BM.tools || {}

    tools.debounce = function(func, wait, immediate) {
        var timeout;
        return function() {
            var context = this, args = arguments;
            var later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    };
}(this));
(function ( window, document, BM, undefined ) {
    var tools = BM.tools = BM.tools || {},

        isUndefined = function isUndefined( obj ) {
            if ( typeof obj === 'undefined' ) {
                return true;
            }

            return false;
        },

        isNull = function isNull( obj ) {
            if ( tools.isUndefined ( obj ) ) {
                return true;
            }

            if ( obj === null ) {
                return true;
            }

            return false;
        },

        isPresent = function(obj) {
          return !tools.isUndefined(obj) && !tools.isNull(obj);
        },

        isNumber = function isNumber( obj ) {
            if ( typeof obj === 'number' ) {
                return true;
            }

            return false;
        },

        isPowerOfTwo = function isPowerOfTwo( n ) {
            if ( tools.isNumber( n ) ) {
                return (n !== 0) && ((n & (n - 1)) === 0);
            }
            else {
                return false;
            }
        },

        isObject = function isObject( obj ) {
            if ( obj === null ) {
                return false;
            }

            if ( typeof obj !== 'object' ) {
                return false;
            }

            return true;
        },

        isRegExp = function isRegExp( obj ) {
            return Object.prototype.toString.call(obj) === '[object RegExp]';
        },

        isArray = function isArray(obj) {
            return Object.prototype.toString.call(obj) === '[object Array]';
        },

        isString = function isString( obj ) {
            if ( typeof obj === 'string' ) {
                return true;
            }

            return false;
        },

        isFunction = function isFunction( obj ) {
            return !!(obj && obj.constructor && obj.call && obj.apply);
        },

        isConstructor = function isConstructor( obj ) {
            return !!(tools.isFunction(obj) && obj.superclass);
        },

        isInstance = function isInstance( obj ) {
            if ( tools.isNull(obj) ) {
                return false;
            }

            if ( tools.isConstructor(obj) ) {
                return false;
            }

            if ( !tools.isObject(obj) ) {
                return false;
            }

            return true;
        },

        isInstanceOf = function isInstanceOf( obj, classObj ) {
            if ( obj instanceof classObj ) {
                return true;
            }

            return false;
        },

        isNaN = function isNaN( obj ) {
            return obj !== obj;
        },

        isElement = function isElement( obj ) {
            return !!(obj && obj.nodeType === 1);
        },

        isDate = function isDate( obj ) {
            return !!(obj && obj.getTimezoneOffset && obj.setUTCFullYear);
        },

        isBoolean = function isBoolean( obj ) {
            return (typeof obj === 'boolean');
        },

        isEqual = function isEqual( a, b ) {
            var
                atype,
                btype,
                aKeys,
                bKeys,
                key;
            // end of vars
            
            // Check object identity.
            if ( a === b ) {
                return true;
            }
            // Different types?
            atype = typeof(a);
            btype = typeof(b);

            if ( atype !== btype ) {
                return false;
            }
            // Basic equality test (watch out for coercions).
            if ( a === b ) {
                return true;
            }
            // One is falsy and the other truthy.
            if ( (!a && b) || (a && !b) ) {
                return false;
            }
            // Check dates' integer values.
            if ( tools.isDate(a) && tools.isDate(b) ) {
                return a.getTime() === b.getTime();
            }
            // Both are NaN?
            if ( tools.isNaN(a) && tools.isNaN(b) ) {
                return false;
            }
            // If a is not an object by this point, we can't handle it.
            if ( atype !== 'object' ) {
                return false;
            }
            // Check for different array lengths before comparing contents.
            if ( a.length && (a.length !== b.length) ) {
                return false;
            }
            // if is a DOM elements and is not '==' then false
            if ( tools.isElement(a) || tools.isElement(b) ) {
                return false;
            }
            // Nothing else worked, deep compare the contents.
            
            aKeys = tools.keys(a);
            bKeys = tools.keys(b);

            // Different object sizes?
            if ( aKeys.length !== bKeys.length ) {
                return false;
            }
            // Recursive comparison of contents.
            for ( key in a ) {
                if ( !(key in b ) || !tools.isEqual(a[key], b[key])) {
                    return false;
                }
            }

            return true;
        },

        isEmpty = function(obj) {
            if (!isObject(obj)) {
                return;
            }
            if (isArray(obj)) {
                return obj.length > 0;
            }
            var prop, hasOwnProp = Object.prototype.hasOwnProperty;
            for (prop in obj) {
                if (hasOwnProp.call(obj, prop)) {
                    return false;
                }
            }
            return true;
        };
    // end of vars

    tools.isUndefined   = isUndefined;
    tools.isNull        = isNull;
    tools.isPresent     = isPresent;
    tools.isNumber      = isNumber;
    tools.isPowerOfTwo  = isPowerOfTwo;
    tools.isObject      = isObject;
    tools.isRegExp      = isRegExp;
    tools.isArray       = Array.isArray || isArray;
    tools.isString      = isString;
    tools.isFunction    = isFunction;
    tools.isConstructor = isConstructor;
    tools.isInstance    = isInstance;
    tools.isInstanceOf  = isInstanceOf;
    tools.isNaN         = isNaN;
    tools.isElement     = isElement;
    tools.isDate        = isDate;
    tools.isBoolean     = isBoolean;
    tools.isEqual       = isEqual;
    tools.isEmpty       = isEmpty;

}(
    this,
    this.document,
    this.BM = this.BM || {}
));
/**
 * @param       {Object}    window      Ссылка на window
 * @param       {Object}    document    Ссылка на document
 * @param       {Object}    BM          Ссылка на Bookmate namespace
 */
(function ( window, document, BM ) {
    var
        /**
         * @alias       BM.tools
         */
        tools = BM.tools = BM.tools || {},

        /**
         * Метод возвращает массив из имен всех собственных аттрибутов объекта.
         * 
         * @alias    BM.tools.keys
         * 
         * @param    {*}            obj
         * @return   {string[]}
         */
        keys = function keys( obj ) {
            var
                keysArray = [],
                key,
                hop = Object.prototype.hasOwnProperty;
            // end of vars

            for ( key in obj ) {
                if ( hop.call(obj, key) ) {
                    keysArray[keysArray.length] = key;
                }
            }

            return keysArray;
        };
    // end of vars

    tools.keys = Object.keys || keys;

}(
    this,
    this.document,
    this.BM = this.BM || {}
));
/**
 * @file Загрузчик скриптов
 */

/**
 * @param       {Object}    window      Ссылка на window
 * @param       {Object}    document    Ссылка на document
 * @param       {Object}    BM          Ссылка на Bookmate namespace
 */
(function ( window, document, BM ) {
    var
        tools = BM.tools = BM.tools || {},
        config = BM.config = BM.config || {},

        /**
         * Script loader
         *
         * @memberOf    BM.tools
         * @alias       BM.tools.loadScripts
         *
         * @param       {string}    templateType    Имя шаблона который необходимо загрузить
         */
        loadScripts = function loadScripts( templateType ) {
            var
                loadConfig = config.loadScriptsConfig;
            // end of vars

            if ( loadConfig.hasOwnProperty(templateType) ) {
                loadConfig[templateType]();
            } else {
                loadConfig['default']();
            }
        };
    // end of vars

    tools.loadScripts = loadScripts;
}(
    this,
    this.document,
    this.BM = this.BM || {}
));

/**
 * @fileOverview Логирование на сервер
 */

/**
 * @param    {Object}    window     Ссылка на window
 * @param    {Object}    document   Ссылка на document
 * @param    {Object}    BM         Ссылка на Bookmate namespace
 */
(function ( window, document, BM ) {
    var
        /**
         * @alias       BM.tools
         */
        tools = BM.tools = BM.tools || {},

        /**
         * Логирование данных с клиента на сервер
         * 
         * @alias    BM.tools.logToServer
         * 
         * @param    {Object}    data    Данные отсылаемые на сервер
         */
        logToServer = function logToServer( data ) {
            var
                s = document.createElement('script'),
                l = document.getElementsByTagName('script')[0],
                key;
            // end of vars

            s.type = 'text/javascript';
            s.async = true;
            s.src = '/log-json';

            for ( key in data ) {
                if ( data.hasOwnProperty(key) ) {
                    s.src += ( s.src.indexOf('?') !== -1 ) ? '&' : '?';
                    s.src += key+'='+data[key];
                }
            }

            l.parentNode.insertBefore(s, l);
        };
    // end of vars

    tools.logToServer = logToServer;

}(
    this,
    this.document,
    this.BM = this.BM || {}
));
/**
 * @fileOverview Функция создания примесей
 */

/**
 * @param       {Object}    window      Ссылка на window
 * @param       {Object}    document    Ссылка на document
 * @param       {Object}    BM          Ссылка на Bookmate namespace
 */
(function ( window, document, BM ) {
    var
        /**
         * @alias       BM.tools
         */
            tools = BM.tools = BM.tools || {},

        /**
         * Примешивает реализацию к объекту
         *
         * @alias    BM.tools.mixin
         *
         * @param    {Object}    obj              Объект, к которому примешивается имплементация
         * @param    {Object}    implementation   Примешиваемая имплементация
         */
            mixin = function mixin( obj, implementation ) {
            var
                prop,
                iprop,
                descr,
                getter,
                setter,
                oldImplementation;
            // end of vars

            for ( prop in implementation ) {
                if ( !implementation.hasOwnProperty( prop ) ) {
                    continue;
                }

                if ( Object.defineProperty ) {
                    descr = Object.getOwnPropertyDescriptor(implementation,prop);
                    if ( descr ) {
                        getter = descr.get;
                        setter = descr.set;
                    } else {
                        getter = undefined;
                        setter = undefined;
                    }
                    if ( getter || setter ) {
                        Object.defineProperty(obj,prop,{
                            get : getter,
                            set : setter
                        });
                        continue;
                    }
                }

                iprop = implementation[prop];

                // ссылки на функции просто копируются
                if ( tools.isFunction(iprop) ) {

                    obj[prop] = iprop;

                    // элементы также просто копируем
                } else if ( tools.isElement(iprop) ) {

                    obj[prop] = iprop;

                    // с объектами работает более тонко
                } else if ( tools.isObject(iprop) ) {

                    // регулярные выражения копируем, как ссылку
                    if ( tools.isRegExp(iprop) ) {

                        obj[prop] = iprop;

                    } else if ( tools.isConstructor() ) {
                        obj[prop] = iprop;

                        // ссылки на массивы просто сохраняет
                    } else if ( tools.isArray(iprop) ) {
                        obj[prop] = iprop;

                        // объект-экземпляры классов тоже
                    } else if ( tools.isInstance(iprop) ) {
                        obj[prop] = iprop;

                        // ссылки на jQuery instances просто копируются
                    } else if ( iprop instanceof tools.$ ) {

                        obj[prop] = iprop;

                        // обычные объекты js аккуратно копируем
                    } else {

                        // если объект не был создан, то создаем его
                        if ( tools.isUndefined(obj[prop]) ) {

                            obj[prop] = {};

                            // если на этом месте не объект, а еще что-то
                            // то создаем объект
                        } else if ( !tools.isObject(obj[prop]) ) {

                            obj[prop] = {};

                            // если объект на самом деле не принадлежит нам,
                            // то создаем новый объект, а старый копируем в него
                        } else if ( !obj.hasOwnProperty( prop ) ) {

                            oldImplementation = obj[prop];
                            obj[prop] = {};
                            tools.mixin(obj[prop],oldImplementation);
                        }

                        // примешиваем объект
                        tools.mixin(obj[prop],iprop);
                    }

                    // значения просто копируются
                } else {
                    obj[prop] = iprop;
                }
            }

            return obj;
        };
    // end of vars

    tools.mixin = mixin;
}(
        this,
        this.document,
        this.BM = this.BM || {}
    ));

(function(window, modules, BM){

  var tools = BM.tools = BM.tools || {};

  tools.rubyHashString2JSON = function(hash_string){
    return JSON.parse(hash_string.replace(/=>/g, ':;').replace(/:/g, '"').replace(/;/g, ':'));
  };

})(
  this,
  this.modules,
  this.BM = this.BM || {}
);
/**
 * @fileOverview Реализация модуля для работы с Local Storage
 * 
 * @param       {Object}     window         Ссылка на window
 * @param       {Object}     document       Ссылка на document
 * @param       {Object}     modules        Ссылка на модульную систему YModules
 * @param       {Object}     docCookies     Ссылка на docCookies
 * @param       {Object}     localStorage   Ссылка на localStorage
 */
(function ( window, document, modules, docCookies, localStorage, undefined ) {
    'use strict';


    var
        /**
         * @param       {Function}  provide     Ассинхронный экспорт модуля
         * @param       {Object}    tools       Ссылка на нэймспейс BM.tools
         */
        moduleStorage = function( provide, tools ) {


            /**
             * Модуль вспомогательных функций для работы с Local Storage
             *
             * @memberOf    BM.tools
             *
             * @see         {@link module:storage}  Описание модуля storage
             */
            var storage = (function() {
                var
                    /**
                     * Есть ли поддержка local storage в браузере
                     * 
                     * @memberOf    module:storage#
                     * @private
                     * 
                     * @type        {Boolean}
                     */
                    availableLocalStorage = (function availableLocalStorage() {
                        try {
                            return 'localStorage' in window && window.localStorage !== null;
                        } catch ( e ) {
                            return false;
                        }
                    }()),

                    /**
                     * ======================
                     * === Public Methods ===
                     * ======================
                     */
                    
                    /**
                     * Получение значения по ключу
                     *
                     * @memberOf    module:storage#
                     * @public
                     * 
                     * @param       {String}     key    Ключ
                     *
                     * @return      {String|Object}     Значение ключа
                     */
                    getItem = function getItem( key ) {
                        var
                            res;
                        // end of vars

                        if ( availableLocalStorage ) {
                            // Если localStorage поддерживается
                            res = localStorageMethods.getItem(key);
                        } else {
                            // Если localStorage не поддерживается
                            res = cookieMethods.getItem(key);
                        }

                        try {
                            return JSON.parse(res);
                        } catch ( e ) {
                            return res;
                        }
                    },

                    /**
                     * Установка заначения по ключу
                     *
                     * @memberOf    module:storage#
                     * @public
                     * 
                     * @param       {String}            key     Ключ
                     * @param       {String|Object}     value   Значение
                     *
                     * @return      {Boolean}                   Флаг успешности записи данных в хранилище
                     */
                    setItem = function setItem( key, value ) {
                        if ( typeof value === 'object' ) {
                            value = JSON.stringify(value);
                        }

                        if ( availableLocalStorage ) {
                            // Если localStorage поддерживается
                            return localStorageMethods.setItem(key, value);
                        } else {
                            // Если localStorage не поддерживается
                            return cookieMethods.setItem(key, value);
                        }

                        return true;
                    },

                    /**
                     * Удаление значения по ключу
                     * 
                     * @memberOf    module:storage#
                     * @public
                     * 
                     * @param       {String}     key    Ключ
                     *
                     * @return      {Boolean}
                     */
                    removeItem = function removeItem( key ) {
                        if ( availableLocalStorage ) {
                            // Если localStorage поддерживается
                            return localStorageMethods.removeItem(key);
                        } else {
                            // Если localStorage не поддерживается
                            return cookieMethods.removeItem(key);
                        }
                    },

                    /**
                     * Очистка хранилища
                     * 
                     * @memberOf    module:storage#
                     * @public
                     */
                    clearStorage = function clearStorage() {
                        if ( availableLocalStorage ) {
                            // Если localStorage поддерживается
                            localStorageMethods.clearStorage();
                        } else {
                            // Если localStorage не поддерживается
                            cookieMethods.clearStorage();
                        }
                    },


                    /**
                     * =======================
                     * === Private Methods ===
                     * =======================
                     */
                    
                    /**
                     * Обертка вокруг методов localeStorage
                     *
                     * @memberOf    module:storage#
                     * @private
                     * 
                     * @type        {Object}
                     */
                    localStorageMethods = {
                        /**
                         * Получение значения по ключу
                         *
                         * @param       {String}     key    Ключ
                         *
                         * @return      {String}            Значение ключа
                         */
                        getItem: function getItem( key ) {
                            return localStorage.getItem(key);
                        },

                        /**
                         * Установка заначения по ключу
                         *
                         * @param       {String}            key    Ключ
                         * @param       {String|Object}     value  Значение
                         *
                         * @return      {boolean}           Флаг успешности записи данных в хранилище
                         */
                        setItem: function setItem( key, value ) {
                            try {
                                localStorage.setItem(key, value);

                                return true;
                            } catch ( e ) {
                                return false;
                            }
                        },

                        /**
                         * Удаление значения по ключу
                         * 
                         * @param       {String}     key    Ключ
                         *
                         * @return      {Boolean}
                         */
                        removeItem: function removeItem( key ) {
                            try {
                                localStorage.removeItem(key);

                                return true;
                            } catch ( e ) {
                                return false;
                            }
                        },

                        /**
                         * Очистка хранилища
                         */
                        clearStorage: function clearStorage() {
                            localStorage.clear();
                        }
                    },

                    /**
                     * Обертка вокруг cookies для имитирования работы локального хранилища в куках
                     *
                     * @memberOf    module:storage#
                     * @private
                     *
                     * @type        {Object}
                     */
                    cookieMethods = {
                        _defaultPrefix: 'bm_storage_',
                        /**
                         * Получение значения по ключу
                         *
                         * @param       {String}     key    Ключ
                         *
                         * @return      {String}            Значение ключа
                         */
                        getItem: function( key ) {
                            var
                                newKey = cookieMethods._defaultPrefix + key;
                            // end of vars
                            
                            return docCookies.getItem(newKey);
                        },

                        /**
                         * Установка заначения по ключу
                         *
                         * @param       {String}            key    Ключ
                         * @param       {String|Object}     value  Значение
                         *
                         * @return      {boolean}           Флаг успешности записи данных в хранилище
                         */
                        setItem: function( key, value ) {
                            var
                                newKey = cookieMethods._defaultPrefix + key;
                            // end of vars
                            
                            return docCookies.setItem(newKey, value, 4*7*24*60*60, '/' );
                        },

                        /**
                         * Удаление значения по ключу
                         * 
                         * @param       {String}     key    Ключ
                         *
                         * @return      {Boolean}
                         */
                        removeItem: function( key ) {
                            var
                                newKey = cookieMethods._defaultPrefix + key;
                            // end of vars
                            
                            return docCookies.setItem(newKey, 0, 0, '/' );
                        },

                        /**
                         * Очистка хранилища
                         */
                        clearStorage: function() {
                            return;
                        }
                    };
                // end of vars


                return {
                    getItem: getItem,
                    setItem: setItem,
                    removeItem: removeItem,
                    clearStorage: clearStorage
                };
            }());

            tools.storage = storage;


            // Export
            provide(storage);
        };
    // end of vars


    /**
     * Модуль вспомогательных функций для работы с Local Storage
     * @module      storage
     */
    modules.define(
        'storage',      // Module name
        ['tools'],      // Dependies
        moduleStorage   // Module realization
    );

}(
    this,
    this.document,
    this.modules,
    this.docCookies,
    this.localStorage || null
));
(function(window, document, BM) {

  var tools = BM.tools = BM.tools || {};

  // From Underscore 1.7.0
  //
  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  // NB: `oldSettings` only exists for backwards compatibility.

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys;
    // nativeBind         = FuncProto.bind;

  // Is a given variable an object?
  _.isObject = function(obj) {
    var type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
  };

  // Retrieve the names of an object's properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = function(obj) {
    if (!_.isObject(obj)) return [];
    if (nativeKeys) return nativeKeys(obj);
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys.push(key);
    return keys;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function(obj) {
    var result = {};
    var keys = _.keys(obj);
    for (var i = 0, length = keys.length; i < length; i++) {
      result[obj[keys[i]]] = keys[i];
    }
    return result;
  };

  // List of HTML entities for escaping.
  var escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '`': '&#x60;'
  };

  var unescapeMap = _.invert(escapeMap);

  var escaper = /\\|'|\r|\n|\u2028|\u2029/g;

  var escapeChar = function(match) {
    return '\\' + escapes[match];
  };

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  var createEscaper = function(map) {
    var escaper = function(match) {
      return map[match];
    };
    // Regexes for identifying a key that needs to be escaped
    var source = '(?:' + _.keys(map).join('|') + ')';
    var testRegexp = RegExp(source);
    var replaceRegexp = RegExp(source, 'g');
    return function(string) {
      string = string == null ? '' : '' + string;
      return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
    };
  };
  _.escape = createEscaper(escapeMap);
  _.unescape = createEscaper(unescapeMap);

  // Fill in a given object with default properties.
  _.defaults = function(obj) {
    if (!_.isObject(obj)) return obj;
    for (var i = 1, length = arguments.length; i < length; i++) {
      var source = arguments[i];
      for (var prop in source) {
        if (obj[prop] === void 0) obj[prop] = source[prop];
      }
    }
    return obj;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  var template = function(text, settings, oldSettings) {
    if (!settings && oldSettings) settings = oldSettings;
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset).replace(escaper, escapeChar);
      index = offset + match.length;

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      } else if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      } else if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }

      // Adobe VMs need the match returned to produce the correct offest.
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + 'return __p;\n';

    try {
      var render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled source as a convenience for precompilation.
    var argument = settings.variable || 'obj';
    template.source = 'function(' + argument + '){\n' + source + '}';

    return template;
  };

  tools.template = template;

})(
  this,
  this.document,
  this.BM = this.BM || {}
);
/**
 * Модуль для опредления бразуера
 *
 * @module      browser
 *
 * @param    {Object}    window     Ссылка на window
 * @param    {Object}    document   Ссылка на document
 * @param    {Object}    BM         Ссылка на Bookmate namespace
 */
(function ( window, document, BM ) {
    var
        features  = BM.features  = BM.features  || {},
        browserDetection = (function () {
            var
                ua = navigator.userAgent,
                gecko = /Gecko\//.test(ua) ? ua.match(/; rv:1\.(\d+?)\.(\d)/) : 0,
                webkit = /AppleWebKit/.test(ua), safari = webkit && /Safari\//.test(ua),
                ie = 0 /*@cc_on + @_jscript_version * 10 % 10 @*/;
            // end of vars

            return {
                ie: ie >= 5 ? ie : 0,
                gecko: gecko ? '1.' + gecko.slice(1).join('.') : 0,
                firefox: gecko ? (gecko[1] == 9 ? 3 : gecko[1] == 8 && gecko[2] > 0 ? 2 : 0) : 0,
                opera: window.opera && opera.version ? opera.version()[0] : 0,
                webkit: webkit ? 0:0,//ua.match(/AppleWebKit\/(\d+?\.\d+?\s)/)[1] : 0,
                safari: safari && /Version\//.test(ua) ? ua.match(/Version\/(\d{1})/)[1] : 0,
                chrome: safari && /Chrome\//.test(ua) ? ua.match(/Chrome\/(\d+?\.\d)/)[1] : 0
            };
        }());
    // end of vars


    /**
     * Модуль для опредления бразуера
     *
     * @memberOf    BM.features
     * @see         {@link module:browser}  Описание модуля browser
     */
    features.browser = {

        /**
         * Является ли клиент Internet Explorer'ом. Можно указать точную версию браузера.
         *
         * @memberof    module:browser#
         *
         * @param       {Number}    [ver]
         * @return      {Boolean}
         */
        isIE : function( ver ) {
            return !BM.tools.isUndefined(ver) ? browserDetection.ie === ver : browserDetection.ie !== 0;
        },

        /**
         * Клиент работает на движке Gecko, или нет. Можно указать точную версию движка.
         *
         * @memberof    module:browser#
         *
         * @param       {Number}    [ver]
         * @return      {Boolean}
         */
        isGecko : function( ver ) {
            return !BM.tools.isUndefined(ver) ? browserDetection.gecko === ver : browserDetection.gecko !== 0;
        },

        /**
         * Является ли клиент Firefix'ом. Можно указать точную версию браузера.
         *
         * @memberof    module:browser#
         *
         * @param       {Number}    [ver]
         * @return      {Boolean}
         */
        isFirefox : function( ver ) {
            return !BM.tools.isUndefined(ver) ? browserDetection.firefox === ver : browserDetection.firefox !== 0;
        },

        /**
         * Является ли клиент Opera. Можно указать точную версию браузера.
         *
         * @memberof    module:browser#
         *
         * @param       {Number}    [ver]
         * @return      {Boolean}
         */
        isOpera : function( ver ) {
            return !BM.tools.isUndefined(ver) ? browserDetection.opera === ver : browserDetection.opera !== 0;
        },

        /**
         * Клиент работает на движке WebKit, или нет. Можно указать точную версию движка.
         *
         * @memberof    module:browser#
         *
         * @param       {Number}    [ver]
         * @return      {Boolean}
         */
        isWebKit : function( ver ) {
            return !BM.tools.isUndefined(ver) ? browserDetection.webkit === ver : browserDetection.webkit !== 0;
        },

        /**
         * Является ли клиент Safari. Можно указать точную версию браузера.
         *
         * @memberof    module:browser#
         *
         * @param       {Number}    [ver]
         * @return      {Boolean}
         */
        isSafari : function( ver ) {
            return !BM.tools.isUndefined(ver) ? browserDetection.safari === ver : browserDetection.safari !== 0;
        },

        /**
         * Является ли клиент Chrome'ом. Можно указать точную версию браузера.
         *
         * @memberof    module:browser#
         *
         * @param       {Number}    [ver]
         * @return      {Boolean}
         */
        isChrome : function( ver ) {
            return !BM.tools.isUndefined(ver) ? browserDetection.chrome === ver : browserDetection.chrome !== 0;
        },

        /**
         * Клиент работает на движке Blink, или нет.
         *
         * @memberof    module:browser#
         *
         * @return      {Boolean}
         */
        isBlink : function() {
            return features.browser.isChrome && browserDetection.chrome >= 28;
        }
    };

}(
    this,
    this.document,
    this.BM = this.BM || {}
));
(function (window, document, BM, undefined) {
  "use strict";

  var user = BM.user = BM.user || {},

    isUserPresent = function () {
      return BM.config.mainConfig.userInfo.hasOwnProperty('login');
    },

    getUserLogin = function () {
      if (!isUserPresent()) {
        return null;
      }
      return BM.config.mainConfig.userInfo.login;
    },

    avatarUrl = function () {
      if (!isUserPresent()) {
        return null;
      }
      return BM.config.mainConfig.userInfo.avatar_url;
    },

    api4Attributes = function () {
      if (!isUserPresent()) {
        return null;
      }
      return BM.config.mainConfig.userInfo;
    },

    getViewingUserLogin = function () {
      var login = BM.config.mainConfig.viewingUser.login;
      if (BM.config && BM.config.mainConfig && login) {
        return window.location.href.indexOf(login) >= 0 ? login : undefined;
      }
    },

    _isSubscription = function (type) {
      var config = BM.config.mainConfig,
        result = false;

      if (config && config.userInfo && config.userInfo.subscriptions) {
        config.userInfo.subscriptions.forEach(function (subscription) {
          if (subscription['kind'] === type && subscription['expires_at'] * 1000 > new Date().getTime()) {
            result = true;
          }
        });
      }

      return result;
    },

    _isSubscriptionExisted = function (type) {
      return type !== undefined ? getSubscription(type) !== null : false;
    },

    isSubscriptionDefaultExisted = function () {
      return _isSubscriptionExisted('default');
    },

    isSubscriptionPremiumExisted = function () {
      return _isSubscriptionExisted('premium');
    },

    getSubscription = function (type) {
      var config = BM.config.mainConfig,
        result = null;

      if (config && config.userInfo && config.userInfo.subscriptions) {
        config.userInfo.subscriptions.forEach(function (subscription) {
          if (subscription.kind === type) {
            result = subscription;
          }
        });
      }
      return result;
    },

    getHighestSubscription = function () {
      var config = BM.config.mainConfig,
        levels = [],
        result = null;

      if (BM.user.isUserPresent() && config.userInfo && config.userInfo.subscriptions) {
        levels = $.map(config.userInfo.subscriptions, function (subscription) {
          if (subscription['expires_at'] * 1000 > new Date().getTime()) {
            return subscription['kind'];
          }
        });
      } else {
        return null;
      }

      if (levels.indexOf('premium') !== -1) {
        result = 'premium';
      } else if (levels.indexOf('default') !== -1) {
        result = 'default';
      } else {
        result = 'any';
      }

      return result;
    },

    isSubscriptionPremium = function () {
      return _isSubscription('premium') || (_isSubscription('default') && _isSubscription('booster'));
    },

    isSubscriptionBooster = function () {
      return _isSubscription('booster');
    },

    isSubscriptionDefault = function () {
      return _isSubscription('default') || _isSubscription('booster');
    },

    isSubscriptionDefaultIOS = function () {
      return _isSubscription('default-ios');
    },

    anySubscriptionPresent = function () {
      return isSubscriptionDefault() || isSubscriptionPremium();
    },

    isRecurrentDefaultActive = function () {
      return isRecurrentActive('default');
    },

    isRecurrentPremiumActive = function () {
      return isRecurrentActive('premium');
    },

    isRecurrentActive = function (kind) {
      var config = BM.config.mainConfig,
        result = false;

      if (config && config.userInfo && config.userInfo.subscriptions) {
        config.userInfo.subscriptions.forEach(function (level) {
          if (level['kind'] === kind && level['active_recurrent'] === true) {
            result = true;
          }
        });
      }
      return result;
    },

    getSubscriptionCoutryCode = function () {
      var config = BM.config.mainConfig;
      if (config && config.userInfo) {
        return config.userInfo.subscriptionCountryCode;
      }
    },

    getLocale = function () {
      if (BM && BM.config && BM.config.mainConfig) {
        return BM.config.mainConfig.locale;
      }
    },

    isLocaleRu = function () {
      return user.getLocale() === 'ru';
    },

    isLocaleEn = function () {
      return user.getLocale() === 'en';
    };

  user.isUserPresent                = isUserPresent;
  user.getLogin                     = getUserLogin;
  user.getViewingUserLogin          = getViewingUserLogin;
  user.avatarUrl                    = avatarUrl;
  user.api4Attributes               = api4Attributes;

  user.getSubscription              = getSubscription;
  user.isSubscriptionPremium        = isSubscriptionPremium;
  user.isSubscriptionBooster        = isSubscriptionBooster;
  user.isSubscriptionDefault        = isSubscriptionDefault;
  user.isSubscriptionDefaultExisted = isSubscriptionDefaultExisted;
  user.isSubscriptionPremiumExisted = isSubscriptionPremiumExisted;
  user.isSubscriptionDefaultIOS     = isSubscriptionDefaultIOS;
  user.isRecurrentDefaultActive     = isRecurrentDefaultActive;
  user.isRecurrentPremiumActive     = isRecurrentPremiumActive;
  user.getHighestSubscription       = getHighestSubscription;
  user.anySubscriptionPresent       = anySubscriptionPresent;

  user.getSubscriptionCoutryCode    = getSubscriptionCoutryCode;
  user.getLocale                    = getLocale;
  user.isLocaleRu                   = isLocaleRu;
  user.isLocaleEn                   = isLocaleEn;

}(
    this,
    this.document,
    this.BM = this.BM || {}
  ));

(function (window, modules, BM) {

  var baseClassModule = function (provide) {

    var instanceCounter = 0;

    var BaseClass = (function () {
      function BaseClass() {
        // enforces new
        if (!(this instanceof BaseClass)) {
          return new BaseClass(arguments);
        }
        // constructor body

        this.initialize.apply(this, arguments);
      }

      BM.tools.mixin(BaseClass.prototype, {
        initialize : function () {
          this._instanceId       = ++instanceCounter;
          this._registeredEvents = [];
        },
        destroy : function () {

        },
        getInstanceId : function () {
          return this._instanceId;
        },
        _registerEvent : function(event) {
            if (!BM.tools.isUndefined(event) && BM.tools.isInstanceOf(event, BaseClass)) {
              this._pushRegisteredEvent(event);
            }
        },
        _isEventRegistered : function(event) {
            return this._registeredEvents.indexOf(event.getInstanceId()) !== -1;
        },
        _pushRegisteredEvent : function(event) {
          if (!this._isEventRegistered(event)) {
            this._registeredEvents.push(event.getInstanceId());
          }
        }
      });

      return BaseClass;

    }());

    provide(BaseClass);
  };

  modules.define(
    'baseClass',        // Module name
    [],                 // Dependies
    baseClassModule     // Module realization
  );

}(this, this.modules, this.BM));
(function(window, modules, $, BM){

    modules.define('Event', ['extend', 'baseClass'], function(provide, extend, BaseClass){

        var Event = extend(BaseClass),

            $class = Event,
            $super = $class.superclass;

        BM.tools.mixin($class.prototype, {

            initialize : function(config) {
              $super.initialize.apply(this, arguments);

              this._data = {};

              if (!BM.tools.isUndefined(config) && !BM.tools.isUndefined(config.data)) {
                this.setData(config.data);
              }
            },

          setData : function(obj) {
              if (BM.tools.isObject(obj)) {
                BM.tools.mixin(this._data, obj);
              }
          },

          getData : function() {
            return this._data();
          }

        });

        provide(Event);
    });

}(this, this.modules, this.jQuery, this.BM));
(function ( window, document, modules, $, radio, BM, undefined ) {
  'use strict';

  modules.define( 'popupBaseClass', ['basePubSub', 'extend', 'tools'], function( provide, PubSub, extend, tools ) {
    var $window = $(window),
      popupCounter = 0,
      popups = [],

      PopupBaseClass = extend(PubSub),

      $class = PopupBaseClass,
      $super = $class.superclass,

      template =
        '<div class="bookmate-popup bm-popup" hidden="hidden" visible="false">' +
          '<div class="bookmate-popup-overlay bm-popup-overlay"></div>' +
          '<div class="bookmate-popup-content-wrapper bm-popup-content-wrapper" role="overlay">' +
          '<div class="bookmate-popup-content bm-popup-content" role="content"></div>' +
          '</div>' +
          '</div>',

      closeButtonTemplate = '<div class="bookmate-popup-button-close bm-popup-button-close"></div>',

      historyBackTemplate = '<div class="bookmate-popup-button-close bm-popup-button-back"></div>',

      historyControls = false,

      _popupExist = function( popup ) {
        var l = popups.length,
          i;

        for ( i = 0; i < l; ++i ) {
          if ( popups[i] === popup ) {
            return i;
          }
        }

        return false;
      },

      registerPopup = function( popup ) {
        if ( _popupExist(popup) === false ) {
          popups.push(popup);
        }
      },

      unregisterPopup = function(popup ) {
        var index;

        if ( (index = _popupExist(popup)) !== false ) {
          popups.splice(index, 1);
        }
      },

      hideAllPopups   = function(exceptPopup, options) {
        var l = popups.length,
          i, silent = false;

        if (!BM.tools.isUndefined(options)) {
          if (BM.tools.isBoolean(options.silent)) {
            silent = options.silent;
          }
        }

        for ( i = 0; i < l; ++i ) {
          if (popups[i] !== exceptPopup) {
            if (popups[i] instanceof PopupBaseClass && popups[i].isVisible()) {
              popups[i].hide(silent);
            }
          }
        }
      },

      updateVisiblePopups = function() {
        var l = popups.length,
          i;

        for ( i = 0; i < l; ++i ) {
          if (popups[i] instanceof PopupBaseClass && popups[i].isVisible()) {
            popups[i].update();
          }
        }
      };

    $class.dispatcher = new PubSub();

    $window.on('resize', function() {
      updateVisiblePopups();
    });

    $window.on('keyup', function(event) {
      if (event && event.keyCode && event.keyCode == 27) {
        hideAllPopups();
      }
    });

    BM.tools.mixin($class, {
      hideAll : function (silent) {
        hideAllPopups(null, {
          silent: silent
        });
      },
      destroyAll : function(silent) {
        hideAllPopups(null, {
          silent: silent
        });
        popups.forEach(function(popup){
          popup.destroy();
        });
      },
      anyVisible : function () {
        var result = false;
        popups.forEach(function (popup) {
          if (popup.isVisible()) {
            result = true;
          }
        });
        return result;
      },
      enableHistoryControls : function() {
        historyControls = true;
        popups.forEach(function(popup){
          popup.enableHistoryControls();
        });
      },
      disableHistoryControls : function() {
        historyControls = false;
        popups.forEach(function(popup){
          popup.disableHistoryControls();
        });
      }
    });

    BM.tools.mixin($class.prototype, {
      initialize : function(options) {
        $super.initialize.apply(this, arguments);

        this._content             = '';
        this._backgroundClickHide = true;
        this._blockMouseMove      = true;
        this._isVisible           = false;
        this._useTemplate         = false;
        this._showButtonClose     = true;
        this._animationsEnabled   = true;
        this._historyControls     = historyControls;
        this._stopHistoryOnClose  = false;

        this._initialBodyOverflowValue = null;

        this._element            = this._createPopupElement();
        this.$elem               = this._element;
        this._elementBody        = $('body');
        this._elementRoot        = this._element;
        this._elementOverlay     = this._element.find('[role=overlay]');
        this._elementContent     = this._element.find('[role=content]');
        this._elementButtonClose = this._element.find('[role=button-close]');

        this._contentClassName   = null;

        popupCounter += 1;
        this._uniqueToken = 'bookmate-popup-' + popupCounter + new Date().getTime();

        this.setConfig(options);

        if (this._useTemplate) {
          this._content = this._getTemplateContent();
          this._appendContent();
        }

        this._setupEvents();
        registerPopup(this);
      },

      setConfig : function(options) {
        if (!tools.isUndefined(options)) {
          if (!tools.isUndefined(options.useTemplate)) {
            this._useTemplate = options.useTemplate;
          }
          if (!tools.isUndefined(options.content)) {
            this._content = options.content;
            this._appendContent();
          }
          if (tools.isBoolean(options.backgroundClickHide)) {
            this.setOnBackgroundClickHide(options.backgroundClickHide);
          }
          if (!tools.isUndefined(options.contentClassName)) {
            this._contentClassName = options.contentClassName;
          }
          if (!tools.isUndefined(options.showButtonClose)) {
            this._showButtonClose = options.showButtonClose;
          }
          if (!tools.isUndefined(options.rootClassName)) {
            if (typeof options.rootClassName === 'string') {

            }
            this._rootClassName = options.rootClassName;
            this.setRootClassName(options.rootClassName);
          }
          if (!BM.tools.isUndefined(options.stopHistoryOnClose)) {
            this._stopHistoryOnClose = options.stopHistoryOnClose;
          }
        }
      },

      setOnBackgroundClickHide : function(bool) {
        if (typeof bool !== 'undefined') {
          if (bool) {
            this._backgroundClickHide = true;
          } else {
            this._backgroundClickHide = false;
          }
        }
      },

      setRootClassName : function(rootClassName) {
        var me = this;
        if (!tools.isUndefined(rootClassName)) {
          if (tools.isString(rootClassName)) {
            rootClassName = [rootClassName];
          }
          rootClassName.forEach(function(className){
            if (!me._element.hasClass(className)) {
              me._element.addClass(className);
            }
          });
        }
      },

      setAnimationsEnabled : function(bool) {
        this._animationsEnabled = !!bool;
      },

      _appendContent : function() {
        this._elementContent.html('');

        if (this._showButtonClose) {
          this._elementButtonClose = $(closeButtonTemplate);
          this._elementContent.append(this._elementButtonClose);
        }

        this._elementContent.append(this._content);
      },

      _createPopupElement : function() {
        return $(this._getBaseTemplate());
      },

      _getBaseTemplate : function() {
        return template;
      },

      _setupEvents : function() {
        var me = this,
          clickEvent = BM.tools.client.isTouch() ? 'tap' : 'click';

        this._elementOverlay.on(clickEvent, function(event) {
          me._onOverlayClick(event);
        });
        this._elementOverlay.on('mousemove', function(event) {
          me._onRootMouseMove(event);
        });
        this._elementRoot.on('mousewheel', function(event) {
          me._onRootMouseWheel(event);
        });
        this._elementRoot.on('keyup keydown keypress', function(event) {
          me._onRootKeyAction(event);
        });
        this._elementContent.on(clickEvent, function(event) {
          me._onContentClick(event);
        });
        this._elementButtonClose.on(clickEvent, function(event) {
          me._onButtonCloseClick(event);
        });

        /*$(window).bind('resize', function() {
         me._onWindowResize();
         });*/
      },

      _onOverlayClick : function(event) {
        if (this._backgroundClickHide) {
          this.hide();

          if (this._stopHistoryOnClose) {
            $class.dispatcher._notify('stop-history-request');
          }
        }
      },

      _onRootMouseMove : function(event) {
        if (this._blockMouseMove) {
          event.stopPropagation();
        }
      },

      _onRootMouseWheel : function(event) {
        event.stopPropagation();
      },

      _onRootKeyAction : function(event) {
        event.stopPropagation();
      },

      _onContentClick : function(event) {
        event.stopPropagation();
      },

      _onButtonCloseClick : function(event) {
        this.hide();
      },

      /*_onWindowResize : function() {
       this._calculateContentPosition();
       },*/

      show : function() {
        if (this._isVisible) {
          return;
        }

        this._preparePopup();
        this._appendIntoBody();
        this.updateLayout();

        this._show();
        this._blockBodyScrolling();

        this._notify('show');
        if ( radio ) {
          radio('bookmate-popup-show').broadcast();
        }
      },

      _appendIntoBody : function() {
        this._elementBody.append(this._elementRoot);
      },

      _show : function() {
        hideAllPopups(this, {silent: true});
        this._elementRoot.attr('visible', 'true');
        this._isVisible = true;
        this._elementRoot.focus();
      },

      hide : function(silent, config) {
        var me = this;
        if (this._isVisible) {
          this._hide({
            callback : function() {
              if (silent !== true) {
                //me.trigger('hide');
                if ( radio ) {
                  radio('bookmate-popup-hide').broadcast();
                }
              }
            },
            options : config || {}
          });
          if (silent !== true) {
            this._notify('hide');
          }
        }
      },

      _hide : function(config) {
        var me = this,
          animation = config.options && config.options.animation !== undefined ? !!config.options.animation : true;

        this._unblockBodyScrolling();

        if (this._isAnimationEnabled() && animation) {
          this._elementOverlay.animationEnd(function(){
            me._elementOverlay.unbindAnimationEnd();

            me._elementRoot.removeAttr('visible');
            me._elementRoot.attr('hidden', 'hidden');
            if (config.callback) {
              config.callback();
            }
          });
          this._elementRoot.attr('visible', 'false');
          this._isVisible = false;
        } else {
          this._elementRoot.attr('visible', 'false');
          this._elementRoot.removeAttr('visible');
          this._elementRoot.attr('hidden', 'hidden');
          if (config.callback) {
            config.callback();
          }
          this._isVisible = false;
        }
      },

      isVisible : function() {
        return this._isVisible;
      },

      _preparePopup : function() {
        this._elementRoot.removeAttr('visible');
        this._elementRoot.removeAttr('hidden');
      },

      _blockBodyScrolling : function() {
        this._initialBodyOverflowValue = this._elementBody.css('overflow');
        this._elementBody.css('overflow', 'hidden');
      },

      _unblockBodyScrolling : function () {
        this._elementBody.css('overflow', this._initialBodyOverflowValue)
      },

      updateLayout : function() {
        this._updateContentClassName();
        //this._updateRootClassName();
        this._calculateContentPosition();
        this._updateHistoryControls();
      },

      /*_updateRootClassName : function() {
       if (this._rootClassName && !this._element.hasClass(this.rootClassName)) {

       }
       },*/

      _updateContentClassName : function() {
        if (this._contentClassName && !this._elementContent.hasClass(this._contentClassName)) {
          this._elementContent.addClass(this._contentClassName);
        }
      },

      update : function() {
        this._calculateContentPosition();
      },

      _calculateContentPosition : function() {
        var resolvedHeight = $window.height() + 'px';

        this._elementOverlay.css({
          'height'      : resolvedHeight,
          'line-height' : resolvedHeight
        });
      },

      _updateHistoryControls: function () {
        if (this._historyControls) {
          this.$elem.addClass('m-history-controls-enabled');
        } else {
          this.$elem.removeClass('m-history-controls-enabled');
        }
      },

      _isAnimationEnabled: function () {
        if (this._element.hasClass('m-version-2') && !BM.tools.client.isBreakpointMobile() && this._animationsEnabled === true) {
          return true;
        }
        return false;
      },

      _getTemplateName: function () {
        // override by children
      },

      _getTemplateContent: function () {
        return $('#' + this._getTemplateName()).html();
      },

      showButtonClose: function () {
        if (this._showButtonClose) {
          this._elementButtonClose.removeAttr('data-visible');
        }
      },

      hideButtonClose : function() {
        if (this._showButtonClose) {
          this._elementButtonClose.attr('data-visible', 'false');
        }
      },

      enableHistoryControls : function() {
        this._historyControls = true;
        this.updateLayout();
      },

      disableHistoryControls : function() {
        this._historyControls = false;
        this.updateLayout();
      },

      destroy : function() {
        this.remove();
        $super.destroy.apply(this, arguments);
      },

      remove : function() {
        unregisterPopup(this);
        this.$elem.off();
        this.$elem.remove();
        this.$elem = null;
      }
    });

    provide(PopupBaseClass);

  } );

}( this, this.document, this.modules, this.jQuery, this.radio, this.BM ));
(function(window, modules, BM, $){

  modules.define('basePubSub', ['baseClass', 'extend'], function(provide, baseClass, extend){

    var PubSub = extend(baseClass),

        $class = PubSub,
        $super = $class.superclass;

    BM.tools.mixin($class.prototype, {

      initialize : function() {
        this._events   = [];
        this._sniffers = [];

        $super.initialize.apply(this, arguments);
      },

      _notify : function(event) {
        if (!this._eventExists(event)) {
          if (this._sniffers.length > 0) {
            this._notifySniffers(event, Array.prototype.slice.call(arguments, 1));
          }
          return;
        }
        var me      = this,
            args    = Array.prototype.slice.call(arguments, 1),
            events  = this._getEventObject(event),
            removed = false;

        events.forEach(function(event){
          if (args.length > 0) {
            event.callback.apply(event.context, args);
          } else {
            event.callback.call(event.context);
          }

          if (BM.tools.isNumber(event.times)) {
            event.times -= 1;
            if (event.times <= 0) {
              me.off(event.event, event.callback, event.context);
              removed = true;
            }
          }
        });

        if (!removed) {
          this._notifySniffers(event, args);
        }
      },

      _notifySniffers : function(event, args) {
        this._sniffers.forEach(function(sniffer){
          var events = sniffer._getEventObject(event);
          events.forEach(function(event){
            if (BM.tools.isNumber(event.times)) {
              return;
            }

            if (args.length > 0) {
              event.callback.apply(null, args);
            } else {
              event.callback.call(null);
            }
          });
        });
      },

      on : function(event, callback, context) {
        if (!BM.tools.isPresent(event) && !BM.tools.isPresent(callback)) {
          return;
        }

        if (BM.tools.isArray(event)) {
          event.forEach(function(eventName) {
            this._pushEvent(eventName, callback, context);
          }.bind(this));
        } else if (BM.tools.isString(event)) {
          if (event.indexOf(' ') !== -1) {
            event = event.split(' ');
            event.forEach(function(eventName) {
              this._pushEvent(eventName, callback, context);
            }.bind(this));
          } else {
            this._pushEvent(event, callback, context);
          }
        }
      },

      _pushEvent : function(event, callback, context) {
        this._events.push({
          event: event,
          callback: callback,
          context: context
        });
      },

      once : function(event, callback, context) {
        if (event === undefined || callback === undefined) {
          return;
        }

        this._events.push({
          event: event,
          callback: callback,
          context: context,
          times: 1
        });
      },

      off : function(event, callback, context) {
        if (arguments.length === 0) {
          this._events.length = 0;
          this._events = [];
          return;
        }

        if (!this._eventExists(event)) {
          return;
        }

        var i, l = this._events.length,
            eventObject;
        for (i = 0; i < l; ++i) {
          eventObject = this._events[i];

          if (!BM.tools.isUndefined(callback) && !BM.tools.isUndefined(context)) {
            if (eventObject.event === event && eventObject.callback === callback && eventObject.context === context) {
              this._events.splice(i, 1);
              return;
            }
          } else if (!BM.tools.isUndefined(callback) && BM.tools.isUndefined(context)) {
            if (eventObject.event === event && eventObject.callback === callback) {
              this._events.splice(i, 1);
              return;
            }
          } else if (!BM.tools.isUndefined(event)) {
            if (eventObject.event === event) {
              this._events.splice(i, 1);
              return;
              }
          }
        }
      },

      sniff : function(pubSubInstance) {
        if (!BM.tools.isUndefined(pubSubInstance) && (pubSubInstance instanceof PubSub)) {
          pubSubInstance.addSniffer(this);
        }
      },

      unsniff : function(pubSubInstance) {
        if (!BM.tools.isUndefined(pubSubInstance) && (pubSubInstance instanceof PubSub)) {
          pubSubInstance.removeSniffer(this);
        }
      },

      addSniffer : function(sniffer) {
        if (!this._snifferExists(sniffer) && sniffer !== this) {
          this._sniffers.push(sniffer);
        }
      },

      removeSniffer : function(sniffer) {
        var i, l = this._sniffers.length;
        for (i = 0; i < l; ++i) {
          if (this._sniffers[i] === sniffer) {
            this._sniffers.splice(i, 1);
            break;
          }
        }
      },

      _snifferExists : function(pubSubInstance) {
        var i, l = this._sniffers.length;
        for (i = 0; i < l; ++i) {
          if (this._sniffers[i] === pubSubInstance) {
            return true;
          }
        }
        return false;
      },

      destroy : function() {
        var me = this;
        this._events.length = 0;
        this._events = null;
        this._sniffers.forEach(function(sniffer){
            me.unsniff(sniffer);
        });
        this._sniffers.length = 0;
        this._sniffers = null;

        $super.destroy.apply(this, arguments);
      },

      _getEventObject : function(event) {
        var i, l = this._events.length,
            events = [];
        for (i = 0; i < l; ++i) {
          if (this._events[i].event === event) {
            events.push(this._events[i]);
          }
        }
        return events;
      },

      _eventExists : function(event) {
        var i, l = this._events.length;
        for (i = 0; i < l; ++i) {
          if (this._events[i].event === event) {
            return true;
          }
        }
        return false;
        }

    });

    provide(PubSub);

  });

}(this, this.modules, this.BM, this.jQuery));
(function(window, modules, BM, $){

    modules.define('baseView', ['basePubSub', 'extend'], function(provide, PubSub, extend){

        var BaseView = extend(PubSub),

            $class = BaseView,
            $super = $class.superclass;

        BM.tools.mixin($class.prototype, {

            initialize : function(config) {
                $super.initialize.apply(this, arguments);

                this._config = {};

                this.$elem = null;
                if (config && config.element) {
                    if (config.element instanceof $) {
                        if (config.element.length < 1) {
                            this._createElementFromTemplate();
                            return;
                        }
                    }
                    this.$elem = this._toJQueryObject(config.element);
                }
                if (!this.$elem || (config && config.useTemplateForced)) {
                    this._createElementFromTemplate();
                }

                this._defineFastProps();
            },

            _defineFastProps : function() {
              if (!this.el) {
                  Object.defineProperty(this, 'el', {
                    get : function() {
                        return !BM.tools.isNull(this.$elem) && this.$elem.length > 0 ? this.$elem : null;
                    }
                  })
              }
            },

            _toJQueryObject : function(element) {
                var $res = null;
                if (element) {
                    if (element instanceof $) {
                        $res = element;
                    } else if (element instanceof HTMLElement) {
                        $res = $(element);
                    } else if (typeof element === 'string') {
                        $res = $(element);
                    }
                }

                if ($res && $res.length > 0) {
                    return $res;
                }
                return null;
            },

            _createElementFromTemplate : function() {
                var templateName =  this._getTemplateName();
                this.$elem = $($('#' + templateName).html());
            },

            render: function(){
                var templateName = this._getTemplateName();
                var template = $('#'+templateName).html().replace(/&lt;%=/g, '<%=').replace(/%&gt;/g, '%>');
                var templateCompiled = BM.tools.template(template);
                this.$elem = $(templateCompiled({data: this.config.data}));
            },

            _parseConfig : function() {
                if (BM.tools.isUndefined(this._config)) {
                    this._config = {};
                }
                var dataConfig = this._parseDataConfig();
                if (BM.tools.isObject(dataConfig)) {
                    BM.tools.mixin(this._config, dataConfig);
                }
            },

            _parseDataConfig : function() {
                var dataConfig = {};
                try {
                    dataConfig = JSON.parse(this.$elem.attr('data-config'));

                    if (dataConfig['library_card']) {
                        dataConfig['libraryCard'] = dataConfig['library_card'];
                        delete dataConfig['library_card'];
                    }

                    if (dataConfig['read_button']) {
                        dataConfig['readButton'] = dataConfig['read_button'];
                        delete dataConfig['read_button'];
                    }
                } catch (e) { }

                return dataConfig;
            },

            /* Has to be overrided by children classes */
            _getTemplateName : function() {
                return '';
            },

            getElement : function() {
                return this.$elem;
            },

            _createElement : function() {
                this.$elem = $($('#' + this._getTemplateName()).html());
            },

            destroy : function() {
                this.$elem.off();
                this.$elem.remove();
                this.$elem = null;
                this._config = null;
                $super.destroy.apply(this, arguments);
            }

        });

        provide(BaseView);

    });

}(this, this.modules, this.BM, this.jQuery));
/*! jQuery Migrate v1.2.1 | (c) 2005, 2013 jQuery Foundation, Inc. and other contributors | jquery.org/license */
jQuery.migrateMute===void 0&&(jQuery.migrateMute=!0),function(e,t,n){function r(n){var r=t.console;i[n]||(i[n]=!0,e.migrateWarnings.push(n),r&&r.warn&&!e.migrateMute&&(r.warn("JQMIGRATE: "+n),e.migrateTrace&&r.trace&&r.trace()))}function a(t,a,i,o){if(Object.defineProperty)try{return Object.defineProperty(t,a,{configurable:!0,enumerable:!0,get:function(){return r(o),i},set:function(e){r(o),i=e}}),n}catch(s){}e._definePropertyBroken=!0,t[a]=i}var i={};e.migrateWarnings=[],!e.migrateMute&&t.console&&t.console.log&&t.console.log("JQMIGRATE: Logging is active"),e.migrateTrace===n&&(e.migrateTrace=!0),e.migrateReset=function(){i={},e.migrateWarnings.length=0},"BackCompat"===document.compatMode&&r("jQuery is not compatible with Quirks Mode");var o=e("<input/>",{size:1}).attr("size")&&e.attrFn,s=e.attr,u=e.attrHooks.value&&e.attrHooks.value.get||function(){return null},c=e.attrHooks.value&&e.attrHooks.value.set||function(){return n},l=/^(?:input|button)$/i,d=/^[238]$/,p=/^(?:autofocus|autoplay|async|checked|controls|defer|disabled|hidden|loop|multiple|open|readonly|required|scoped|selected)$/i,f=/^(?:checked|selected)$/i;a(e,"attrFn",o||{},"jQuery.attrFn is deprecated"),e.attr=function(t,a,i,u){var c=a.toLowerCase(),g=t&&t.nodeType;return u&&(4>s.length&&r("jQuery.fn.attr( props, pass ) is deprecated"),t&&!d.test(g)&&(o?a in o:e.isFunction(e.fn[a])))?e(t)[a](i):("type"===a&&i!==n&&l.test(t.nodeName)&&t.parentNode&&r("Can't change the 'type' of an input or button in IE 6/7/8"),!e.attrHooks[c]&&p.test(c)&&(e.attrHooks[c]={get:function(t,r){var a,i=e.prop(t,r);return i===!0||"boolean"!=typeof i&&(a=t.getAttributeNode(r))&&a.nodeValue!==!1?r.toLowerCase():n},set:function(t,n,r){var a;return n===!1?e.removeAttr(t,r):(a=e.propFix[r]||r,a in t&&(t[a]=!0),t.setAttribute(r,r.toLowerCase())),r}},f.test(c)&&r("jQuery.fn.attr('"+c+"') may use property instead of attribute")),s.call(e,t,a,i))},e.attrHooks.value={get:function(e,t){var n=(e.nodeName||"").toLowerCase();return"button"===n?u.apply(this,arguments):("input"!==n&&"option"!==n&&r("jQuery.fn.attr('value') no longer gets properties"),t in e?e.value:null)},set:function(e,t){var a=(e.nodeName||"").toLowerCase();return"button"===a?c.apply(this,arguments):("input"!==a&&"option"!==a&&r("jQuery.fn.attr('value', val) no longer sets properties"),e.value=t,n)}};var g,h,v=e.fn.init,m=e.parseJSON,y=/^([^<]*)(<[\w\W]+>)([^>]*)$/;e.fn.init=function(t,n,a){var i;return t&&"string"==typeof t&&!e.isPlainObject(n)&&(i=y.exec(e.trim(t)))&&i[0]&&("<"!==t.charAt(0)&&r("$(html) HTML strings must start with '<' character"),i[3]&&r("$(html) HTML text after last tag is ignored"),"#"===i[0].charAt(0)&&(r("HTML string cannot start with a '#' character"),e.error("JQMIGRATE: Invalid selector string (XSS)")),n&&n.context&&(n=n.context),e.parseHTML)?v.call(this,e.parseHTML(i[2],n,!0),n,a):v.apply(this,arguments)},e.fn.init.prototype=e.fn,e.parseJSON=function(e){return e||null===e?m.apply(this,arguments):(r("jQuery.parseJSON requires a valid JSON string"),null)},e.uaMatch=function(e){e=e.toLowerCase();var t=/(chrome)[ \/]([\w.]+)/.exec(e)||/(webkit)[ \/]([\w.]+)/.exec(e)||/(opera)(?:.*version|)[ \/]([\w.]+)/.exec(e)||/(msie) ([\w.]+)/.exec(e)||0>e.indexOf("compatible")&&/(mozilla)(?:.*? rv:([\w.]+)|)/.exec(e)||[];return{browser:t[1]||"",version:t[2]||"0"}},e.browser||(g=e.uaMatch(navigator.userAgent),h={},g.browser&&(h[g.browser]=!0,h.version=g.version),h.chrome?h.webkit=!0:h.webkit&&(h.safari=!0),e.browser=h),a(e,"browser",e.browser,"jQuery.browser is deprecated"),e.sub=function(){function t(e,n){return new t.fn.init(e,n)}e.extend(!0,t,this),t.superclass=this,t.fn=t.prototype=this(),t.fn.constructor=t,t.sub=this.sub,t.fn.init=function(r,a){return a&&a instanceof e&&!(a instanceof t)&&(a=t(a)),e.fn.init.call(this,r,a,n)},t.fn.init.prototype=t.fn;var n=t(document);return r("jQuery.sub() is deprecated"),t},e.ajaxSetup({converters:{"text json":e.parseJSON}});var b=e.fn.data;e.fn.data=function(t){var a,i,o=this[0];return!o||"events"!==t||1!==arguments.length||(a=e.data(o,t),i=e._data(o,t),a!==n&&a!==i||i===n)?b.apply(this,arguments):(r("Use of jQuery.fn.data('events') is deprecated"),i)};var j=/\/(java|ecma)script/i,w=e.fn.andSelf||e.fn.addBack;e.fn.andSelf=function(){return r("jQuery.fn.andSelf() replaced by jQuery.fn.addBack()"),w.apply(this,arguments)},e.clean||(e.clean=function(t,a,i,o){a=a||document,a=!a.nodeType&&a[0]||a,a=a.ownerDocument||a,r("jQuery.clean() is deprecated");var s,u,c,l,d=[];if(e.merge(d,e.buildFragment(t,a).childNodes),i)for(c=function(e){return!e.type||j.test(e.type)?o?o.push(e.parentNode?e.parentNode.removeChild(e):e):i.appendChild(e):n},s=0;null!=(u=d[s]);s++)e.nodeName(u,"script")&&c(u)||(i.appendChild(u),u.getElementsByTagName!==n&&(l=e.grep(e.merge([],u.getElementsByTagName("script")),c),d.splice.apply(d,[s+1,0].concat(l)),s+=l.length));return d});var Q=e.event.add,x=e.event.remove,k=e.event.trigger,N=e.fn.toggle,T=e.fn.live,M=e.fn.die,S="ajaxStart|ajaxStop|ajaxSend|ajaxComplete|ajaxError|ajaxSuccess",C=RegExp("\\b(?:"+S+")\\b"),H=/(?:^|\s)hover(\.\S+|)\b/,A=function(t){return"string"!=typeof t||e.event.special.hover?t:(H.test(t)&&r("'hover' pseudo-event is deprecated, use 'mouseenter mouseleave'"),t&&t.replace(H,"mouseenter$1 mouseleave$1"))};e.event.props&&"attrChange"!==e.event.props[0]&&e.event.props.unshift("attrChange","attrName","relatedNode","srcElement"),e.event.dispatch&&a(e.event,"handle",e.event.dispatch,"jQuery.event.handle is undocumented and deprecated"),e.event.add=function(e,t,n,a,i){e!==document&&C.test(t)&&r("AJAX events should be attached to document: "+t),Q.call(this,e,A(t||""),n,a,i)},e.event.remove=function(e,t,n,r,a){x.call(this,e,A(t)||"",n,r,a)},e.fn.error=function(){var e=Array.prototype.slice.call(arguments,0);return r("jQuery.fn.error() is deprecated"),e.splice(0,0,"error"),arguments.length?this.bind.apply(this,e):(this.triggerHandler.apply(this,e),this)},e.fn.toggle=function(t,n){if(!e.isFunction(t)||!e.isFunction(n))return N.apply(this,arguments);r("jQuery.fn.toggle(handler, handler...) is deprecated");var a=arguments,i=t.guid||e.guid++,o=0,s=function(n){var r=(e._data(this,"lastToggle"+t.guid)||0)%o;return e._data(this,"lastToggle"+t.guid,r+1),n.preventDefault(),a[r].apply(this,arguments)||!1};for(s.guid=i;a.length>o;)a[o++].guid=i;return this.click(s)},e.fn.live=function(t,n,a){return r("jQuery.fn.live() is deprecated"),T?T.apply(this,arguments):(e(this.context).on(t,this.selector,n,a),this)},e.fn.die=function(t,n){return r("jQuery.fn.die() is deprecated"),M?M.apply(this,arguments):(e(this.context).off(t,this.selector||"**",n),this)},e.event.trigger=function(e,t,n,a){return n||C.test(e)||r("Global events are undocumented and deprecated"),k.call(this,e,t,n||document,a)},e.each(S.split("|"),function(t,n){e.event.special[n]={setup:function(){var t=this;return t!==document&&(e.event.add(document,n+"."+e.guid,function(){e.event.trigger(n,null,t,!0)}),e._data(this,n,e.guid++)),!1},teardown:function(){return this!==document&&e.event.remove(document,n+"."+e._data(this,n)),!1}}})}(jQuery,window);
/*! jQuery UI - v1.10.4 - 2014-02-18
* http://jqueryui.com
* Includes: jquery.ui.core.js, jquery.ui.widget.js
* Copyright 2014 jQuery Foundation and other contributors; Licensed MIT */

(function( $, undefined ) {

var uuid = 0,
	runiqueId = /^ui-id-\d+$/;

// $.ui might exist from components with no dependencies, e.g., $.ui.position
$.ui = $.ui || {};

$.extend( $.ui, {
	version: "1.10.4",

	keyCode: {
		BACKSPACE: 8,
		COMMA: 188,
		DELETE: 46,
		DOWN: 40,
		END: 35,
		ENTER: 13,
		ESCAPE: 27,
		HOME: 36,
		LEFT: 37,
		NUMPAD_ADD: 107,
		NUMPAD_DECIMAL: 110,
		NUMPAD_DIVIDE: 111,
		NUMPAD_ENTER: 108,
		NUMPAD_MULTIPLY: 106,
		NUMPAD_SUBTRACT: 109,
		PAGE_DOWN: 34,
		PAGE_UP: 33,
		PERIOD: 190,
		RIGHT: 39,
		SPACE: 32,
		TAB: 9,
		UP: 38
	}
});

// plugins
$.fn.extend({
	focus: (function( orig ) {
		return function( delay, fn ) {
			return typeof delay === "number" ?
				this.each(function() {
					var elem = this;
					setTimeout(function() {
						$( elem ).focus();
						if ( fn ) {
							fn.call( elem );
						}
					}, delay );
				}) :
				orig.apply( this, arguments );
		};
	})( $.fn.focus ),

	scrollParent: function() {
		var scrollParent;
		if (($.ui.ie && (/(static|relative)/).test(this.css("position"))) || (/absolute/).test(this.css("position"))) {
			scrollParent = this.parents().filter(function() {
				return (/(relative|absolute|fixed)/).test($.css(this,"position")) && (/(auto|scroll)/).test($.css(this,"overflow")+$.css(this,"overflow-y")+$.css(this,"overflow-x"));
			}).eq(0);
		} else {
			scrollParent = this.parents().filter(function() {
				return (/(auto|scroll)/).test($.css(this,"overflow")+$.css(this,"overflow-y")+$.css(this,"overflow-x"));
			}).eq(0);
		}

		return (/fixed/).test(this.css("position")) || !scrollParent.length ? $(document) : scrollParent;
	},

	zIndex: function( zIndex ) {
		if ( zIndex !== undefined ) {
			return this.css( "zIndex", zIndex );
		}

		if ( this.length ) {
			var elem = $( this[ 0 ] ), position, value;
			while ( elem.length && elem[ 0 ] !== document ) {
				// Ignore z-index if position is set to a value where z-index is ignored by the browser
				// This makes behavior of this function consistent across browsers
				// WebKit always returns auto if the element is positioned
				position = elem.css( "position" );
				if ( position === "absolute" || position === "relative" || position === "fixed" ) {
					// IE returns 0 when zIndex is not specified
					// other browsers return a string
					// we ignore the case of nested elements with an explicit value of 0
					// <div style="z-index: -10;"><div style="z-index: 0;"></div></div>
					value = parseInt( elem.css( "zIndex" ), 10 );
					if ( !isNaN( value ) && value !== 0 ) {
						return value;
					}
				}
				elem = elem.parent();
			}
		}

		return 0;
	},

	uniqueId: function() {
		return this.each(function() {
			if ( !this.id ) {
				this.id = "ui-id-" + (++uuid);
			}
		});
	},

	removeUniqueId: function() {
		return this.each(function() {
			if ( runiqueId.test( this.id ) ) {
				$( this ).removeAttr( "id" );
			}
		});
	}
});

// selectors
function focusable( element, isTabIndexNotNaN ) {
	var map, mapName, img,
		nodeName = element.nodeName.toLowerCase();
	if ( "area" === nodeName ) {
		map = element.parentNode;
		mapName = map.name;
		if ( !element.href || !mapName || map.nodeName.toLowerCase() !== "map" ) {
			return false;
		}
		img = $( "img[usemap=#" + mapName + "]" )[0];
		return !!img && visible( img );
	}
	return ( /input|select|textarea|button|object/.test( nodeName ) ?
		!element.disabled :
		"a" === nodeName ?
			element.href || isTabIndexNotNaN :
			isTabIndexNotNaN) &&
		// the element and all of its ancestors must be visible
		visible( element );
}

function visible( element ) {
	return $.expr.filters.visible( element ) &&
		!$( element ).parents().addBack().filter(function() {
			return $.css( this, "visibility" ) === "hidden";
		}).length;
}

$.extend( $.expr[ ":" ], {
	data: $.expr.createPseudo ?
		$.expr.createPseudo(function( dataName ) {
			return function( elem ) {
				return !!$.data( elem, dataName );
			};
		}) :
		// support: jQuery <1.8
		function( elem, i, match ) {
			return !!$.data( elem, match[ 3 ] );
		},

	focusable: function( element ) {
		return focusable( element, !isNaN( $.attr( element, "tabindex" ) ) );
	},

	tabbable: function( element ) {
		var tabIndex = $.attr( element, "tabindex" ),
			isTabIndexNaN = isNaN( tabIndex );
		return ( isTabIndexNaN || tabIndex >= 0 ) && focusable( element, !isTabIndexNaN );
	}
});

// support: jQuery <1.8
if ( !$( "<a>" ).outerWidth( 1 ).jquery ) {
	$.each( [ "Width", "Height" ], function( i, name ) {
		var side = name === "Width" ? [ "Left", "Right" ] : [ "Top", "Bottom" ],
			type = name.toLowerCase(),
			orig = {
				innerWidth: $.fn.innerWidth,
				innerHeight: $.fn.innerHeight,
				outerWidth: $.fn.outerWidth,
				outerHeight: $.fn.outerHeight
			};

		function reduce( elem, size, border, margin ) {
			$.each( side, function() {
				size -= parseFloat( $.css( elem, "padding" + this ) ) || 0;
				if ( border ) {
					size -= parseFloat( $.css( elem, "border" + this + "Width" ) ) || 0;
				}
				if ( margin ) {
					size -= parseFloat( $.css( elem, "margin" + this ) ) || 0;
				}
			});
			return size;
		}

		$.fn[ "inner" + name ] = function( size ) {
			if ( size === undefined ) {
				return orig[ "inner" + name ].call( this );
			}

			return this.each(function() {
				$( this ).css( type, reduce( this, size ) + "px" );
			});
		};

		$.fn[ "outer" + name] = function( size, margin ) {
			if ( typeof size !== "number" ) {
				return orig[ "outer" + name ].call( this, size );
			}

			return this.each(function() {
				$( this).css( type, reduce( this, size, true, margin ) + "px" );
			});
		};
	});
}

// support: jQuery <1.8
if ( !$.fn.addBack ) {
	$.fn.addBack = function( selector ) {
		return this.add( selector == null ?
			this.prevObject : this.prevObject.filter( selector )
		);
	};
}

// support: jQuery 1.6.1, 1.6.2 (http://bugs.jquery.com/ticket/9413)
if ( $( "<a>" ).data( "a-b", "a" ).removeData( "a-b" ).data( "a-b" ) ) {
	$.fn.removeData = (function( removeData ) {
		return function( key ) {
			if ( arguments.length ) {
				return removeData.call( this, $.camelCase( key ) );
			} else {
				return removeData.call( this );
			}
		};
	})( $.fn.removeData );
}





// deprecated
$.ui.ie = !!/msie [\w.]+/.exec( navigator.userAgent.toLowerCase() );

$.support.selectstart = "onselectstart" in document.createElement( "div" );
$.fn.extend({
	disableSelection: function() {
		return this.bind( ( $.support.selectstart ? "selectstart" : "mousedown" ) +
			".ui-disableSelection", function( event ) {
				event.preventDefault();
			});
	},

	enableSelection: function() {
		return this.unbind( ".ui-disableSelection" );
	}
});

$.extend( $.ui, {
	// $.ui.plugin is deprecated. Use $.widget() extensions instead.
	plugin: {
		add: function( module, option, set ) {
			var i,
				proto = $.ui[ module ].prototype;
			for ( i in set ) {
				proto.plugins[ i ] = proto.plugins[ i ] || [];
				proto.plugins[ i ].push( [ option, set[ i ] ] );
			}
		},
		call: function( instance, name, args ) {
			var i,
				set = instance.plugins[ name ];
			if ( !set || !instance.element[ 0 ].parentNode || instance.element[ 0 ].parentNode.nodeType === 11 ) {
				return;
			}

			for ( i = 0; i < set.length; i++ ) {
				if ( instance.options[ set[ i ][ 0 ] ] ) {
					set[ i ][ 1 ].apply( instance.element, args );
				}
			}
		}
	},

	// only used by resizable
	hasScroll: function( el, a ) {

		//If overflow is hidden, the element might have extra content, but the user wants to hide it
		if ( $( el ).css( "overflow" ) === "hidden") {
			return false;
		}

		var scroll = ( a && a === "left" ) ? "scrollLeft" : "scrollTop",
			has = false;

		if ( el[ scroll ] > 0 ) {
			return true;
		}

		// TODO: determine which cases actually cause this to happen
		// if the element doesn't have the scroll set, see if it's possible to
		// set the scroll
		el[ scroll ] = 1;
		has = ( el[ scroll ] > 0 );
		el[ scroll ] = 0;
		return has;
	}
});

})( jQuery );
(function( $, undefined ) {

var uuid = 0,
	slice = Array.prototype.slice,
	_cleanData = $.cleanData;
$.cleanData = function( elems ) {
	for ( var i = 0, elem; (elem = elems[i]) != null; i++ ) {
		try {
			$( elem ).triggerHandler( "remove" );
		// http://bugs.jquery.com/ticket/8235
		} catch( e ) {}
	}
	_cleanData( elems );
};

$.widget = function( name, base, prototype ) {
	var fullName, existingConstructor, constructor, basePrototype,
		// proxiedPrototype allows the provided prototype to remain unmodified
		// so that it can be used as a mixin for multiple widgets (#8876)
		proxiedPrototype = {},
		namespace = name.split( "." )[ 0 ];

	name = name.split( "." )[ 1 ];
	fullName = namespace + "-" + name;

	if ( !prototype ) {
		prototype = base;
		base = $.Widget;
	}

	// create selector for plugin
	$.expr[ ":" ][ fullName.toLowerCase() ] = function( elem ) {
		return !!$.data( elem, fullName );
	};

	$[ namespace ] = $[ namespace ] || {};
	existingConstructor = $[ namespace ][ name ];
	constructor = $[ namespace ][ name ] = function( options, element ) {
		// allow instantiation without "new" keyword
		if ( !this._createWidget ) {
			return new constructor( options, element );
		}

		// allow instantiation without initializing for simple inheritance
		// must use "new" keyword (the code above always passes args)
		if ( arguments.length ) {
			this._createWidget( options, element );
		}
	};
	// extend with the existing constructor to carry over any static properties
	$.extend( constructor, existingConstructor, {
		version: prototype.version,
		// copy the object used to create the prototype in case we need to
		// redefine the widget later
		_proto: $.extend( {}, prototype ),
		// track widgets that inherit from this widget in case this widget is
		// redefined after a widget inherits from it
		_childConstructors: []
	});

	basePrototype = new base();
	// we need to make the options hash a property directly on the new instance
	// otherwise we'll modify the options hash on the prototype that we're
	// inheriting from
	basePrototype.options = $.widget.extend( {}, basePrototype.options );
	$.each( prototype, function( prop, value ) {
		if ( !$.isFunction( value ) ) {
			proxiedPrototype[ prop ] = value;
			return;
		}
		proxiedPrototype[ prop ] = (function() {
			var _super = function() {
					return base.prototype[ prop ].apply( this, arguments );
				},
				_superApply = function( args ) {
					return base.prototype[ prop ].apply( this, args );
				};
			return function() {
				var __super = this._super,
					__superApply = this._superApply,
					returnValue;

				this._super = _super;
				this._superApply = _superApply;

				returnValue = value.apply( this, arguments );

				this._super = __super;
				this._superApply = __superApply;

				return returnValue;
			};
		})();
	});
	constructor.prototype = $.widget.extend( basePrototype, {
		// TODO: remove support for widgetEventPrefix
		// always use the name + a colon as the prefix, e.g., draggable:start
		// don't prefix for widgets that aren't DOM-based
		widgetEventPrefix: existingConstructor ? (basePrototype.widgetEventPrefix || name) : name
	}, proxiedPrototype, {
		constructor: constructor,
		namespace: namespace,
		widgetName: name,
		widgetFullName: fullName
	});

	// If this widget is being redefined then we need to find all widgets that
	// are inheriting from it and redefine all of them so that they inherit from
	// the new version of this widget. We're essentially trying to replace one
	// level in the prototype chain.
	if ( existingConstructor ) {
		$.each( existingConstructor._childConstructors, function( i, child ) {
			var childPrototype = child.prototype;

			// redefine the child widget using the same prototype that was
			// originally used, but inherit from the new version of the base
			$.widget( childPrototype.namespace + "." + childPrototype.widgetName, constructor, child._proto );
		});
		// remove the list of existing child constructors from the old constructor
		// so the old child constructors can be garbage collected
		delete existingConstructor._childConstructors;
	} else {
		base._childConstructors.push( constructor );
	}

	$.widget.bridge( name, constructor );
};

$.widget.extend = function( target ) {
	var input = slice.call( arguments, 1 ),
		inputIndex = 0,
		inputLength = input.length,
		key,
		value;
	for ( ; inputIndex < inputLength; inputIndex++ ) {
		for ( key in input[ inputIndex ] ) {
			value = input[ inputIndex ][ key ];
			if ( input[ inputIndex ].hasOwnProperty( key ) && value !== undefined ) {
				// Clone objects
				if ( $.isPlainObject( value ) ) {
					target[ key ] = $.isPlainObject( target[ key ] ) ?
						$.widget.extend( {}, target[ key ], value ) :
						// Don't extend strings, arrays, etc. with objects
						$.widget.extend( {}, value );
				// Copy everything else by reference
				} else {
					target[ key ] = value;
				}
			}
		}
	}
	return target;
};

$.widget.bridge = function( name, object ) {
	var fullName = object.prototype.widgetFullName || name;
	$.fn[ name ] = function( options ) {
		var isMethodCall = typeof options === "string",
			args = slice.call( arguments, 1 ),
			returnValue = this;

		// allow multiple hashes to be passed on init
		options = !isMethodCall && args.length ?
			$.widget.extend.apply( null, [ options ].concat(args) ) :
			options;

		if ( isMethodCall ) {
			this.each(function() {
				var methodValue,
					instance = $.data( this, fullName );
				if ( !instance ) {
					return $.error( "cannot call methods on " + name + " prior to initialization; " +
						"attempted to call method '" + options + "'" );
				}
				if ( !$.isFunction( instance[options] ) || options.charAt( 0 ) === "_" ) {
					return $.error( "no such method '" + options + "' for " + name + " widget instance" );
				}
				methodValue = instance[ options ].apply( instance, args );
				if ( methodValue !== instance && methodValue !== undefined ) {
					returnValue = methodValue && methodValue.jquery ?
						returnValue.pushStack( methodValue.get() ) :
						methodValue;
					return false;
				}
			});
		} else {
			this.each(function() {
				var instance = $.data( this, fullName );
				if ( instance ) {
					instance.option( options || {} )._init();
				} else {
					$.data( this, fullName, new object( options, this ) );
				}
			});
		}

		return returnValue;
	};
};

$.Widget = function( /* options, element */ ) {};
$.Widget._childConstructors = [];

$.Widget.prototype = {
	widgetName: "widget",
	widgetEventPrefix: "",
	defaultElement: "<div>",
	options: {
		disabled: false,

		// callbacks
		create: null
	},
	_createWidget: function( options, element ) {
		element = $( element || this.defaultElement || this )[ 0 ];
		this.element = $( element );
		this.uuid = uuid++;
		this.eventNamespace = "." + this.widgetName + this.uuid;
		this.options = $.widget.extend( {},
			this.options,
			this._getCreateOptions(),
			options );

		this.bindings = $();
		this.hoverable = $();
		this.focusable = $();

		if ( element !== this ) {
			$.data( element, this.widgetFullName, this );
			this._on( true, this.element, {
				remove: function( event ) {
					if ( event.target === element ) {
						this.destroy();
					}
				}
			});
			this.document = $( element.style ?
				// element within the document
				element.ownerDocument :
				// element is window or document
				element.document || element );
			this.window = $( this.document[0].defaultView || this.document[0].parentWindow );
		}

		this._create();
		this._trigger( "create", null, this._getCreateEventData() );
		this._init();
	},
	_getCreateOptions: $.noop,
	_getCreateEventData: $.noop,
	_create: $.noop,
	_init: $.noop,

	destroy: function() {
		this._destroy();
		// we can probably remove the unbind calls in 2.0
		// all event bindings should go through this._on()
		this.element
			.unbind( this.eventNamespace )
			// 1.9 BC for #7810
			// TODO remove dual storage
			.removeData( this.widgetName )
			.removeData( this.widgetFullName )
			// support: jquery <1.6.3
			// http://bugs.jquery.com/ticket/9413
			.removeData( $.camelCase( this.widgetFullName ) );
		this.widget()
			.unbind( this.eventNamespace )
			.removeAttr( "aria-disabled" )
			.removeClass(
				this.widgetFullName + "-disabled " +
				"ui-state-disabled" );

		// clean up events and states
		this.bindings.unbind( this.eventNamespace );
		this.hoverable.removeClass( "ui-state-hover" );
		this.focusable.removeClass( "ui-state-focus" );
	},
	_destroy: $.noop,

	widget: function() {
		return this.element;
	},

	option: function( key, value ) {
		var options = key,
			parts,
			curOption,
			i;

		if ( arguments.length === 0 ) {
			// don't return a reference to the internal hash
			return $.widget.extend( {}, this.options );
		}

		if ( typeof key === "string" ) {
			// handle nested keys, e.g., "foo.bar" => { foo: { bar: ___ } }
			options = {};
			parts = key.split( "." );
			key = parts.shift();
			if ( parts.length ) {
				curOption = options[ key ] = $.widget.extend( {}, this.options[ key ] );
				for ( i = 0; i < parts.length - 1; i++ ) {
					curOption[ parts[ i ] ] = curOption[ parts[ i ] ] || {};
					curOption = curOption[ parts[ i ] ];
				}
				key = parts.pop();
				if ( arguments.length === 1 ) {
					return curOption[ key ] === undefined ? null : curOption[ key ];
				}
				curOption[ key ] = value;
			} else {
				if ( arguments.length === 1 ) {
					return this.options[ key ] === undefined ? null : this.options[ key ];
				}
				options[ key ] = value;
			}
		}

		this._setOptions( options );

		return this;
	},
	_setOptions: function( options ) {
		var key;

		for ( key in options ) {
			this._setOption( key, options[ key ] );
		}

		return this;
	},
	_setOption: function( key, value ) {
		this.options[ key ] = value;

		if ( key === "disabled" ) {
			this.widget()
				.toggleClass( this.widgetFullName + "-disabled ui-state-disabled", !!value )
				.attr( "aria-disabled", value );
			this.hoverable.removeClass( "ui-state-hover" );
			this.focusable.removeClass( "ui-state-focus" );
		}

		return this;
	},

	enable: function() {
		return this._setOption( "disabled", false );
	},
	disable: function() {
		return this._setOption( "disabled", true );
	},

	_on: function( suppressDisabledCheck, element, handlers ) {
		var delegateElement,
			instance = this;

		// no suppressDisabledCheck flag, shuffle arguments
		if ( typeof suppressDisabledCheck !== "boolean" ) {
			handlers = element;
			element = suppressDisabledCheck;
			suppressDisabledCheck = false;
		}

		// no element argument, shuffle and use this.element
		if ( !handlers ) {
			handlers = element;
			element = this.element;
			delegateElement = this.widget();
		} else {
			// accept selectors, DOM elements
			element = delegateElement = $( element );
			this.bindings = this.bindings.add( element );
		}

		$.each( handlers, function( event, handler ) {
			function handlerProxy() {
				// allow widgets to customize the disabled handling
				// - disabled as an array instead of boolean
				// - disabled class as method for disabling individual parts
				if ( !suppressDisabledCheck &&
						( instance.options.disabled === true ||
							$( this ).hasClass( "ui-state-disabled" ) ) ) {
					return;
				}
				return ( typeof handler === "string" ? instance[ handler ] : handler )
					.apply( instance, arguments );
			}

			// copy the guid so direct unbinding works
			if ( typeof handler !== "string" ) {
				handlerProxy.guid = handler.guid =
					handler.guid || handlerProxy.guid || $.guid++;
			}

			var match = event.match( /^(\w+)\s*(.*)$/ ),
				eventName = match[1] + instance.eventNamespace,
				selector = match[2];
			if ( selector ) {
				delegateElement.delegate( selector, eventName, handlerProxy );
			} else {
				element.bind( eventName, handlerProxy );
			}
		});
	},

	_off: function( element, eventName ) {
		eventName = (eventName || "").split( " " ).join( this.eventNamespace + " " ) + this.eventNamespace;
		element.unbind( eventName ).undelegate( eventName );
	},

	_delay: function( handler, delay ) {
		function handlerProxy() {
			return ( typeof handler === "string" ? instance[ handler ] : handler )
				.apply( instance, arguments );
		}
		var instance = this;
		return setTimeout( handlerProxy, delay || 0 );
	},

	_hoverable: function( element ) {
		this.hoverable = this.hoverable.add( element );
		this._on( element, {
			mouseenter: function( event ) {
				$( event.currentTarget ).addClass( "ui-state-hover" );
			},
			mouseleave: function( event ) {
				$( event.currentTarget ).removeClass( "ui-state-hover" );
			}
		});
	},

	_focusable: function( element ) {
		this.focusable = this.focusable.add( element );
		this._on( element, {
			focusin: function( event ) {
				$( event.currentTarget ).addClass( "ui-state-focus" );
			},
			focusout: function( event ) {
				$( event.currentTarget ).removeClass( "ui-state-focus" );
			}
		});
	},

	_trigger: function( type, event, data ) {
		var prop, orig,
			callback = this.options[ type ];

		data = data || {};
		event = $.Event( event );
		event.type = ( type === this.widgetEventPrefix ?
			type :
			this.widgetEventPrefix + type ).toLowerCase();
		// the original event may come from any element
		// so we need to reset the target on the new event
		event.target = this.element[ 0 ];

		// copy original event properties over to the new event
		orig = event.originalEvent;
		if ( orig ) {
			for ( prop in orig ) {
				if ( !( prop in event ) ) {
					event[ prop ] = orig[ prop ];
				}
			}
		}

		this.element.trigger( event, data );
		return !( $.isFunction( callback ) &&
			callback.apply( this.element[0], [ event ].concat( data ) ) === false ||
			event.isDefaultPrevented() );
	}
};

$.each( { show: "fadeIn", hide: "fadeOut" }, function( method, defaultEffect ) {
	$.Widget.prototype[ "_" + method ] = function( element, options, callback ) {
		if ( typeof options === "string" ) {
			options = { effect: options };
		}
		var hasOptions,
			effectName = !options ?
				method :
				options === true || typeof options === "number" ?
					defaultEffect :
					options.effect || defaultEffect;
		options = options || {};
		if ( typeof options === "number" ) {
			options = { duration: options };
		}
		hasOptions = !$.isEmptyObject( options );
		options.complete = callback;
		if ( options.delay ) {
			element.delay( options.delay );
		}
		if ( hasOptions && $.effects && $.effects.effect[ effectName ] ) {
			element[ method ]( options );
		} else if ( effectName !== method && element[ effectName ] ) {
			element[ effectName ]( options.duration, options.easing, callback );
		} else {
			element.queue(function( next ) {
				$( this )[ method ]();
				if ( callback ) {
					callback.call( element[ 0 ] );
				}
				next();
			});
		}
	};
});

})( jQuery );
(function(root, $){
    'use strict';

    var animationEndEvents = 'animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd';

    $.fn.animationEnd = function(callback) {
        return this.each(function(){
            var $this = $(this);
            $this.off(animationEndEvents);
            $this.on(animationEndEvents, function() {
                if (typeof callback == 'function') {
                    callback.call(this);
                }
            });
        });
    };

    $.fn.unbindAnimationEnd = function() {
        this.off(animationEndEvents);
    };

}(this, jQuery));
/**
* Condense 0.1 - Condense and expand text heavy elements
*
* (c) 2008 Joseph Sillitoe
* Dual licensed under the MIT License (MIT-LICENSE) and GPL License,version 2 (GPL-LICENSE). 
*/
 
/*
* jQuery plugin
*
* usage:
*  
*   $(document).ready(function(){     
*     $('#example1').condense();
*   });
*
* Options:
*  condensedLength: Target length of condensed element. Default: 200  
*  minTrail: Minimun length of the trailing text. Default: 20
*  delim: Delimiter used for finding the break point. Default: " " - {space}
*  moreText: Text used for the more control. Default: [more]  
*  lessText: Text used for the less control. Default: [less]  
*  ellipsis: Text added to condensed element. Default:  ( ... )  
*  moreSpeed: Animation Speed for expanding. Default: "normal"  
*  lessSpeed: Animation Speed for condensing. Default: "normal"
*  easing: Easing algorith. Default: "linear"
*/

(function($) {

  // plugin definition
  $.fn.condense = function(options) {
    
    $.metadata ? debug('metadata plugin detected') : debug('metadata plugin not present');//detect the metadata plugin?

    var opts = $.extend({}, $.fn.condense.defaults, options); // build main options before element iteration

    // iterate each matched element
    return this.each(function() {
        $this = $(this);

      // support metadata plugin (v2.0)
        var o = $.metadata ? $.extend({}, opts, $this.metadata()) : opts; // build element specific options
     
      debug('Condensing ['+$this.text().length+']: '+$this.text());
      
      var clone = cloneCondensed($this,o);

      if (clone){
        var controlMore, controlLess;
        // id attribute switch.  make sure that the visible elem keeps the original id (if set).
        $this.attr('id') ? $this.attr('id','condensed_'+$this.attr('id')) : false;

        if (!opts.controls) {
          controlMore = " <div class='condense_control condense_control_more' style='cursor:pointer;'>"+o.moreText+"</div>";
          controlLess = " <div class='condense_control condense_control_less' style='cursor:pointer;'>"+o.lessText+"</div>";
          clone.append(o.ellipsis + controlMore);
          $this.after(clone).hide().append(controlLess);

          $('.condense_control_more',clone).click(function(){
            debug('moreControl clicked.');
            triggerExpand($(this),o)
          });

          $('.condense_control_less',$this).click(function(){
            debug('lessControl clicked.');
            triggerCondense($(this),o)
          });
        } else {
          controlMore = opts.controls.more;
          controlLess = opts.controls.less;

          clone.removeClass('original').addClass('condensed').append(o.ellipsis);
          $this.after(clone).hide();

          controlMore.removeClass('hidden');

          controlMore.click(function(e){
            e.preventDefault();

            debug('moreControl clicked.');
            triggerExpandControls($(this),o);
          });

          controlLess.click(function(e){
            e.preventDefault();
            
            debug('lessControl clicked.');
            triggerCondenseControls($(this),o);
          });
        }
      }

      });
  };

  function cloneCondensed(elem, opts){
    // Try to clone and condense the element.  if not possible because of the length/minTrail options, return false.
    // also, dont count tag declarations as part of the text length.
    // check the length of the text first, return false if too short.
    if ($.trim(elem.text()).length <= opts.condensedLength + opts.minTrail){
      debug('element too short: skipping.');
      return false;
    } 

    var fullbody = $.trim(elem.html());
    var fulltext = $.trim(elem.text());
    var delim = opts.delim; 
    var clone = elem.clone();
    var delta = 0;

    do {
      // find the location of the next potential break-point.
      var loc = findDelimiterLocation(fullbody, opts.delim, (opts.condensedLength + delta));
      //set the html of the clone to the substring html of the original
      clone.html($.trim(fullbody.substring(0,(loc+1))));
      var cloneTextLength = clone.text().length;
      var cloneHtmlLength = clone.html().length;
      delta = clone.html().length - cloneTextLength; 
      debug ("condensing... [html-length:"+cloneHtmlLength+" text-length:"+cloneTextLength+" delta: "+delta+" break-point: "+loc+"]");
    //is the length of the clone text long enough?
    }while(clone.text().length < opts.condensedLength )

    //  after skipping ahead to the delimiter, do we still have enough trailing text?
    if ((fulltext.length - cloneTextLength) < opts.minTrail){
      debug('not enough trailing text: skipping.');
      return false;
    }

    debug('clone condensed. [text-length:'+cloneTextLength+']');
    return clone;
  }


  function findDelimiterLocation(html, delim, startpos){
    // find the location inside the html of the delimiter, starting at the specified length.
    var foundDelim = false;
    var loc = startpos;    
    do {
      var loc = html.indexOf(delim, loc);
      if (loc < 0){
        debug ("No delimiter found.");
        return html.length;
      } // if there is no delimiter found, just return the length of the entire html string.
      foundDelim = true;
      while (isInsideTag(html, loc)) {
        // if we are inside a tag, this delim doesn't count.  keep looking...      
        loc++;
        foundDelim = false;
      }
    }while(!foundDelim)
    debug ("Delimiter found in html at: "+loc);
    return loc;
  }


  function isInsideTag(html, loc){
    return (html.indexOf('>',loc) < html.indexOf('<',loc));
  }


  function triggerCondense(control, opts){
    debug('Condense Trigger: '+control.html());  
    var orig = control.parent(); // The original element will be the control's immediate parent.
    var condensed = orig.next(); // The condensed element will be the original immediate next sibling.    
    condensed.show();    
    var con_w  = condensed.width();
    var con_h = condensed.height();
    condensed.hide(); //briefly flashed the condensed element so we can get the target width/height
    var orig_w  = orig.width();
    var orig_h = orig.height();
    orig.animate({height:con_h, width:con_w, opacity: 1}, opts.lessSpeed, opts.easing,
      function(){
        orig.height(orig_h).width(orig_w).hide();
        condensed.show(); 
      });
  }


  function triggerExpand(control, opts){
    debug('Expand Trigger: '+control.html());    
    var condensed = control.parent(); // The condensed element will be the control's immediate parent.
    var orig = condensed.prev(); // The original element will be the condensed immediate previous sibling.
    orig.show();
    var orig_w  = orig.width();
    var orig_h = orig.height();
    orig.width(condensed.width()+"px").height(condensed.height()+"px"); 
    condensed.hide();
    orig.animate({height:orig_h, width:orig_w, opacity: 1}, opts.moreSpeed, opts.easing);
    if(condensed.attr('id')){
      var idAttr = condensed.attr('id');
      condensed.attr('id','condensed_'+idAttr);
      orig.attr('id',idAttr);
    } 
  }

  function triggerCondenseControls(control, opts){
    var $el = control.closest('.bm-bookshelf-book-item-desc');
    var $more = $el.find('.bm-bookshelf-book-item-tools-annotation-more');
    var orig = $el.find('.original'); // The original element will be the control's immediate parent.
    var condensed = $el.find('.condensed'); // The condensed element will be the original immediate next sibling.    
    condensed.show();    
    var con_w  = condensed.width();
    var con_h = condensed.height();
    $more.removeClass('hidden');
    control.addClass('hidden');
    condensed.hide(); //briefly flashed the condensed element so we can get the target width/height
    var orig_w  = orig.width();
    var orig_h = orig.height();
    orig.animate({height:con_h, width:con_w, opacity: 1}, opts.lessSpeed, opts.easing,
      function(){
        orig.height(orig_h).width(orig_w).hide();
        condensed.show();
      });
  }


  function triggerExpandControls(control, opts){
    var $el = control.closest('.bm-bookshelf-book-item-desc');
    var $less = $el.find('.bm-bookshelf-book-item-tools-annotation-less');
    var orig = $el.find('.original'); // The original element will be the control's immediate parent.
    var condensed = $el.find('.condensed'); // The condensed element will be the original immediate next sibling.    
    orig.show();
    var orig_w  = orig.width();
    var orig_h = orig.height();
    control.addClass('hidden');
    $less.removeClass('hidden');
    orig.width(condensed.width()+"px").height(condensed.height()+"px"); 
    condensed.hide();
    orig.animate({height:orig_h, width:orig_w, opacity: 1}, opts.moreSpeed, opts.easing);
    if(condensed.attr('id')){
      var idAttr = condensed.attr('id');
      condensed.attr('id','condensed_'+idAttr);
      orig.attr('id',idAttr);
    } 
  }


  /**
   * private function for debugging
   */
  // function debug($obj){if (window.console && window.console.log){window.console.log($obj);}};
  function debug($obj){};


  // plugin defaults
  $.fn.condense.defaults = {
    condensedLength: 200,  
    minTrail: 20,
    delim: " ",
    moreText: "[more]",  
    lessText: "[less]",  
    ellipsis: " ( ... )",  
    moreSpeed: "normal",  
    lessSpeed: "normal",
    easing: "linear"
  };

})(jQuery);
/*
 * Lazy Load - jQuery plugin for lazy loading images
 *
 * Copyright (c) 2007-2013 Mika Tuupola
 *
 * Licensed under the MIT license:
 *   http://www.opensource.org/licenses/mit-license.php
 *
 * Project home:
 *   http://www.appelsiini.net/projects/lazyload
 *
 * Version:  1.9.3
 *
 */

(function($, window, document, undefined) {
    var $window = $(window);

    $.fn.lazyload = function(options) {
        var elements = this;
        var $container;
        var settings = {
            threshold       : 0,
            failure_limit   : 0,
            event           : "scroll",
            effect          : "show",
            container       : window,
            data_attribute  : "original",
            skip_invisible  : true,
            appear          : null,
            load            : null,
            error           : null,
            placeholder     : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAANSURBVBhXYzh8+PB/AAffA0nNPuCLAAAAAElFTkSuQmCC"
        };

        function update() {
            var counter = 0;

            elements.each(function() {
                var $this = $(this);
                if (settings.skip_invisible && !$this.is(":visible")) {
                    return;
                }
                if ($.abovethetop(this, settings) ||
                    $.leftofbegin(this, settings)) {
                        /* Nothing. */
                } else if (!$.belowthefold(this, settings) &&
                    !$.rightoffold(this, settings)) {
                        $this.trigger("appear");
                        /* if we found an image we'll load, reset the counter */
                        counter = 0;
                } else {
                    if (++counter > settings.failure_limit) {
                        return false;
                    }
                }
            });

        }

        if(options) {
            /* Maintain BC for a couple of versions. */
            if (undefined !== options.failurelimit) {
                options.failure_limit = options.failurelimit;
                delete options.failurelimit;
            }
            if (undefined !== options.effectspeed) {
                options.effect_speed = options.effectspeed;
                delete options.effectspeed;
            }

            $.extend(settings, options);
        }

        /* Cache container as jQuery as object. */
        $container = (settings.container === undefined ||
                      settings.container === window) ? $window : $(settings.container);

        /* Fire one scroll event per scroll. Not one scroll event per image. */
        if (0 === settings.event.indexOf("scroll")) {
            $container.bind(settings.event, function() {
                return update();
            });
        }

        this.each(function() {
            var self = this;
            var $self = $(self);

            self.loaded = false;

            /* If no src attribute given use data:uri. */
            if ($self.attr("src") === undefined || $self.attr("src") === false) {
                if ($self.is("img")) {
                    $self.attr("src", settings.placeholder);
                }
            }

            /* When appear is triggered load original image. */
            $self.one("appear", function() {
                if (!this.loaded) {
                    if (settings.appear) {
                        var elements_left = elements.length;
                        settings.appear.call(self, elements_left, settings);
                    }
                    $("<img />")
                        .bind("load", function() {

                            var original = $self.attr("data-" + settings.data_attribute);
                            $self.hide();
                            if ($self.is("img")) {
                                $self.attr("src", original);
                            } else {
                                $self.css("background-image", "url('" + original + "')");
                            }
                            $self[settings.effect](settings.effect_speed);

                            self.loaded = true;

                            /* Remove image from array so it is not looped next time. */
                            var temp = $.grep(elements, function(element) {
                                return !element.loaded;
                            });
                            elements = $(temp);

                            if (settings.load) {
                                var elements_left = elements.length;
                                settings.load.call(self, elements_left, settings);
                            }
                        })
                        .bind("error", function() {
                            if (settings.error) {
                                var elements_left = elements.length;
                                settings.error.call(self, elements_left, settings);
                            }
                        })
                        .attr("src", $self.attr("data-" + settings.data_attribute));
                }
            });

            /* When wanted event is triggered load original image */
            /* by triggering appear.                              */
            if (0 !== settings.event.indexOf("scroll")) {
                $self.bind(settings.event, function() {
                    if (!self.loaded) {
                        $self.trigger("appear");
                    }
                });
            }
        });

        /* Check if something appears when window is resized. */
        $window.bind("resize", function() {
            update();
        });

        /* With IOS5 force loading images when navigating with back button. */
        /* Non optimal workaround. */
        if ((/(?:iphone|ipod|ipad).*os 5/gi).test(navigator.appVersion)) {
            $window.bind("pageshow", function(event) {
                if (event.originalEvent && event.originalEvent.persisted) {
                    elements.each(function() {
                        $(this).trigger("appear");
                    });
                }
            });
        }

        /* Force initial check if images should appear. */
        $(document).ready(function() {
            update();
        });

        return this;
    };

    /* Convenience methods in jQuery namespace.           */
    /* Use as  $.belowthefold(element, {threshold : 100, container : window}) */

    $.belowthefold = function(element, settings) {
        var fold;

        if (settings.container === undefined || settings.container === window) {
            fold = (window.innerHeight ? window.innerHeight : $window.height()) + $window.scrollTop();
        } else {
            fold = $(settings.container).offset().top + $(settings.container).height();
        }

        return fold <= $(element).offset().top - settings.threshold;
    };

    $.rightoffold = function(element, settings) {
        var fold;

        if (settings.container === undefined || settings.container === window) {
            fold = $window.width() + $window.scrollLeft();
        } else {
            fold = $(settings.container).offset().left + $(settings.container).width();
        }

        return fold <= $(element).offset().left - settings.threshold;
    };

    $.abovethetop = function(element, settings) {
        var fold;

        if (settings.container === undefined || settings.container === window) {
            fold = $window.scrollTop();
        } else {
            fold = $(settings.container).offset().top;
        }

        return fold >= $(element).offset().top + settings.threshold  + $(element).height();
    };

    $.leftofbegin = function(element, settings) {
        var fold;

        if (settings.container === undefined || settings.container === window) {
            fold = $window.scrollLeft();
        } else {
            fold = $(settings.container).offset().left;
        }

        return fold >= $(element).offset().left + settings.threshold + $(element).width();
    };

    $.inviewport = function(element, settings) {
         return !$.rightoffold(element, settings) && !$.leftofbegin(element, settings) &&
                !$.belowthefold(element, settings) && !$.abovethetop(element, settings);
     };

    /* Custom selectors for your convenience.   */
    /* Use as $("img:below-the-fold").something() or */
    /* $("img").filter(":below-the-fold").something() which is faster */

    $.extend($.expr[":"], {
        "below-the-fold" : function(a) { return $.belowthefold(a, {threshold : 0}); },
        "above-the-top"  : function(a) { return !$.belowthefold(a, {threshold : 0}); },
        "right-of-screen": function(a) { return $.rightoffold(a, {threshold : 0}); },
        "left-of-screen" : function(a) { return !$.rightoffold(a, {threshold : 0}); },
        "in-viewport"    : function(a) { return $.inviewport(a, {threshold : 0}); },
        /* Maintain BC for couple of versions. */
        "above-the-fold" : function(a) { return !$.belowthefold(a, {threshold : 0}); },
        "right-of-fold"  : function(a) { return $.rightoffold(a, {threshold : 0}); },
        "left-of-fold"   : function(a) { return !$.rightoffold(a, {threshold : 0}); }
    });

})(jQuery, window, document);

/*
    Masked Input plugin for jQuery
    Copyright (c) 2007-2013 Josh Bush (digitalbush.com)
    Licensed under the MIT license (http://digitalbush.com/projects/masked-input-plugin/#license)
    Version: 1.3.1
*/
(function($) {
    function getPasteEvent() {
        var el = document.createElement('input'),
            name = 'onpaste';
        el.setAttribute(name, '');
        return (typeof el[name] === 'function')?'paste':'input';
    }

    var pasteEventName = getPasteEvent() + ".mask",
        ua = navigator.userAgent,
        iPhone = /iphone/i.test(ua),
        android=/android/i.test(ua),
        caretTimeoutId;

    $.mask = {
        //Predefined character definitions
        definitions: {
            // '0': "[0-9]",
            'a': "[A-Za-z]",
            '*': "[A-Za-z0-9]"
        },
        dataName: "rawMaskFn",
        placeholder: '_'
    };

    $.fn.extend({
        //Helper Function for Caret positioning
        caret: function(begin, end) {
            var range;

            if (this.length === 0 || this.is(":hidden")) {
                return;
            }

            if (typeof begin == 'number') {
                end = (typeof end === 'number') ? end : begin;
                return this.each(function() {
                    if (this.setSelectionRange) {
                        this.setSelectionRange(begin, end);
                    } else if (this.createTextRange) {
                        range = this.createTextRange();
                        range.collapse(true);
                        range.moveEnd('character', end);
                        range.moveStart('character', begin);
                        range.select();
                    }
                });
            } else {
                if (this[0].setSelectionRange) {
                    begin = this[0].selectionStart;
                    end = this[0].selectionEnd;
                } else if (document.selection && document.selection.createRange) {
                    range = document.selection.createRange();
                    begin = 0 - range.duplicate().moveStart('character', -100000);
                    end = begin + range.text.length;
                }
                return { begin: begin, end: end };
            }
        },
        unmask: function() {
            return this.trigger("unmask");
        },
        mask: function(mask, settings) {
            var input,
                defs,
                tests,
                partialPosition,
                firstNonMaskPos,
                len;

            if (!mask && this.length > 0) {
                input = $(this[0]);
                return input.data($.mask.dataName)();
            }
            settings = $.extend({
                placeholder: $.mask.placeholder, // Load default placeholder
                completed: null
            }, settings);


            defs = $.mask.definitions;
            tests = [];
            partialPosition = len = mask.length;
            firstNonMaskPos = null;

            $.each(mask.split(""), function(i, c) {
                if (c == '?') {
                    len--;
                    partialPosition = i;
                } else if (defs[c]) {
                    tests.push(new RegExp(defs[c]));
                    if (firstNonMaskPos === null) {
                        firstNonMaskPos = tests.length - 1;
                    }
                } else {
                    tests.push(null);
                }
            });

            return this.trigger("unmask").each(function() {
                var input = $(this),
                    buffer = $.map(
                    mask.split(""),
                    function(c, i) {
                        if (c != '?') {
                            return defs[c] ? settings.placeholder : c;
                        }
                    }),
                    focusText = input.val();

                function seekNext(pos) {
                    while (++pos < len && !tests[pos]){};
                    return pos;
                }

                function seekPrev(pos) {
                    while (--pos >= 0 && !tests[pos]){};
                    return pos;
                }

                function shiftL(begin,end) {
                    var i,
                        j;

                    if (begin<0) {
                        return;
                    }

                    for (i = begin, j = seekNext(end); i < len; i++) {
                        if (tests[i]) {
                            if (j < len && tests[i].test(buffer[j])) {
                                buffer[i] = buffer[j];
                                buffer[j] = settings.placeholder;
                            } else {
                                break;
                            }

                            j = seekNext(j);
                        }
                    }
                    writeBuffer();
                    input.caret(Math.max(firstNonMaskPos, begin));
                }

                function shiftR(pos) {
                    var i,
                        c,
                        j,
                        t;

                    for (i = pos, c = settings.placeholder; i < len; i++) {
                        if (tests[i]) {
                            j = seekNext(i);
                            t = buffer[i];
                            buffer[i] = c;
                            if (j < len && tests[j].test(t)) {
                                c = t;
                            } else {
                                break;
                            }
                        }
                    }
                }

                function keydownEvent(e) {
                    var k = e.which,
                        pos,
                        begin,
                        end;

                    //backspace, delete, and escape get special treatment
                    if (k === 8 || k === 46 || (iPhone && k === 127)) {
                        pos = input.caret();
                        begin = pos.begin;
                        end = pos.end;

                        if (end - begin === 0) {
                            begin=k!==46?seekPrev(begin):(end=seekNext(begin-1));
                            end=k===46?seekNext(end):end;
                        }
                        clearBuffer(begin, end);
                        shiftL(begin, end - 1);

                        e.preventDefault();
                    } else if (k == 27) {//escape
                        input.val(focusText);
                        input.caret(0, checkVal());
                        e.preventDefault();
                    }
                }

                function keypressEvent(e) {
                    var k = e.which,
                        pos = input.caret(),
                        p,
                        c,
                        next;

                    if (e.ctrlKey || e.altKey || e.metaKey || k < 32) {//Ignore
                        return;
                    } else if (k) {
                        if (pos.end - pos.begin !== 0){
                            clearBuffer(pos.begin, pos.end);
                            shiftL(pos.begin, pos.end-1);
                        }

                        p = seekNext(pos.begin - 1);
                        if (p < len) {
                            c = String.fromCharCode(k);
                            if (tests[p].test(c)) {
                                shiftR(p);

                                buffer[p] = c;
                                writeBuffer();
                                next = seekNext(p);

                                if(android){
                                    setTimeout($.proxy($.fn.caret,input,next),0);
                                }else{
                                    input.caret(next);
                                }

                                if (settings.completed && next >= len) {
                                    settings.completed.call(input);
                                }
                            }
                        }
                        e.preventDefault();
                    }
                }

                function clearBuffer(start, end) {
                    var i;
                    for (i = start; i < end && i < len; i++) {
                        if (tests[i]) {
                            buffer[i] = settings.placeholder;
                        }
                    }
                }

                function writeBuffer() { input.val(buffer.join('')); }

                function checkVal(allow) {
                    //try to place characters where they belong
                    var test = input.val(),
                        lastMatch = -1,
                        i,
                        c;

                    for (i = 0, pos = 0; i < len; i++) {
                        if (tests[i]) {
                            buffer[i] = settings.placeholder;
                            while (pos++ < test.length) {
                                c = test.charAt(pos - 1);
                                if (tests[i].test(c)) {
                                    buffer[i] = c;
                                    lastMatch = i;
                                    break;
                                }
                            }
                            if (pos > test.length) {
                                break;
                            }
                        } else if (buffer[i] === test.charAt(pos) && i !== partialPosition) {
                            pos++;
                            lastMatch = i;
                        }
                    }
                    if (allow) {
                        writeBuffer();
                    } else if (lastMatch + 1 < partialPosition) {
                        input.val("");
                        clearBuffer(0, len);
                    } else {
                        writeBuffer();
                        input.val(input.val().substring(0, lastMatch + 1));
                    }
                    return (partialPosition ? i : firstNonMaskPos);
                }

                input.data($.mask.dataName,function(){
                    return $.map(buffer, function(c, i) {
                        return tests[i]&&c!=settings.placeholder ? c : null;
                    }).join('');
                });

                if (!input.attr("readonly"))
                    input
                    .one("unmask", function() {
                        input
                            .unbind(".mask")
                            .removeData($.mask.dataName);
                    })
                    .bind("focus.mask", function() {
                        clearTimeout(caretTimeoutId);
                        var pos,
                            moveCaret;

                        focusText = input.val();
                        pos = checkVal();
                        
                        caretTimeoutId = setTimeout(function(){
                            writeBuffer();
                            if (pos == mask.length) {
                                input.caret(0, pos);
                            } else {
                                input.caret(pos);
                            }
                        }, 10);
                    })
                    .bind("blur.mask", function() {
                        checkVal();
                        if (input.val() != focusText)
                            input.change();
                    })
                    .bind("keydown.mask", keydownEvent)
                    .bind("keypress.mask", keypressEvent)
                    .bind(pasteEventName, function() {
                        setTimeout(function() { 
                            var pos=checkVal(true);
                            input.caret(pos); 
                            if (settings.completed && pos == input.val().length)
                                settings.completed.call(input);
                        }, 0);
                    });
                checkVal(); //Perform initial check for existing values
            });
        }
    });
})(jQuery);
!function(e){function t(t,n,r){var i=t[n];if(!i)return;t[n]=function(){return arguments[r]=arguments[r].replace(/@([\w\u00c0-\uFFFF\-]+)/g,'[role~="$1"]'),i.apply(t,arguments)},e.extend(t[n],i)}function n(t,n){var r,i=[],s=e.trim(t).split(/\s+/);for(var o=0;o<s.length;o++)r=s[o],!~e.inArray(r,i)&&(!n||!~e.inArray(r,n))&&i.push(r);return i}t(e,"find",0),t(e,"multiFilter",0),t(e.find,"matchesSelector",1),t(e.find,"matches",0),e.extend(e.fn,{roles:function(){return n(this.attr("role"))},hasRole:function(e){var t=n(e);for(var r=0;r<t.length;r++)if(!this.is("@"+t[r]))return!1;return!0},addRole:function(t){return this.hasRole(t)?this:this.each(function(r,i){var s=e(i);s.attr("role",n(s.attr("role")+" "+t).join(" "))})},removeRole:function(t){return this.hasRole(t)?this.each(function(r,i){var s=e(i);s.attr("role",n(s.attr("role"),n(t)).join(" "))}):this},toggleRole:function(e){var t=n(e);for(var r=0;r<t.length;r++)this[this.hasRole(t[r])?"removeRole":"addRole"].call(this,t[r]);return this}})}(jQuery);
/*!
 * jQuery.ScrollTo
 * Copyright (c) 2007-2013 Ariel Flesler - aflesler<a>gmail<d>com | http://flesler.blogspot.com
 * Dual licensed under MIT and GPL.
 *
 * @projectDescription Easy element scrolling using jQuery.
 * http://flesler.blogspot.com/2007/10/jqueryscrollto.html
 * @author Ariel Flesler
 * @version 1.4.5
 *
 * @id jQuery.scrollTo
 * @id jQuery.fn.scrollTo
 * @param {String, Number, DOMElement, jQuery, Object} target Where to scroll the matched elements.
 *	  The different options for target are:
 *		- A number position (will be applied to all axes).
 *		- A string position ('44', '100px', '+=90', etc ) will be applied to all axes
 *		- A jQuery/DOM element ( logically, child of the element to scroll )
 *		- A string selector, that will be relative to the element to scroll ( 'li:eq(2)', etc )
 *		- A hash { top:x, left:y }, x and y can be any kind of number/string like above.
 *		- A percentage of the container's dimension/s, for example: 50% to go to the middle.
 *		- The string 'max' for go-to-end.
 * @param {Number, Function} duration The OVERALL length of the animation, this argument can be the settings object instead.
 * @param {Object,Function} settings Optional set of settings or the onAfter callback.
 *	 @option {String} axis Which axis must be scrolled, use 'x', 'y', 'xy' or 'yx'.
 *	 @option {Number, Function} duration The OVERALL length of the animation.
 *	 @option {String} easing The easing method for the animation.
 *	 @option {Boolean} margin If true, the margin of the target element will be deducted from the final position.
 *	 @option {Object, Number} offset Add/deduct from the end position. One number for both axes or { top:x, left:y }.
 *	 @option {Object, Number} over Add/deduct the height/width multiplied by 'over', can be { top:x, left:y } when using both axes.
 *	 @option {Boolean} queue If true, and both axis are given, the 2nd axis will only be animated after the first one ends.
 *	 @option {Function} onAfter Function to be called after the scrolling ends.
 *	 @option {Function} onAfterFirst If queuing is activated, this function will be called after the first scrolling ends.
 * @return {jQuery} Returns the same jQuery object, for chaining.
 *
 * @desc Scroll to a fixed position
 * @example $('div').scrollTo( 340 );
 *
 * @desc Scroll relatively to the actual position
 * @example $('div').scrollTo( '+=340px', { axis:'y' } );
 *
 * @desc Scroll using a selector (relative to the scrolled element)
 * @example $('div').scrollTo( 'p.paragraph:eq(2)', 500, { easing:'swing', queue:true, axis:'xy' } );
 *
 * @desc Scroll to a DOM element (same for jQuery object)
 * @example var second_child = document.getElementById('container').firstChild.nextSibling;
 *			$('#container').scrollTo( second_child, { duration:500, axis:'x', onAfter:function(){
 *				alert('scrolled!!');
 *			}});
 *
 * @desc Scroll on both axes, to different values
 * @example $('div').scrollTo( { top: 300, left:'+=200' }, { axis:'xy', offset:-20 } );
 */

;(function( $ ){

    var $scrollTo = $.scrollTo = function( target, duration, settings ){
        $(window).scrollTo( target, duration, settings );
    };

    $scrollTo.defaults = {
        axis:'xy',
        duration: parseFloat($.fn.jquery) >= 1.3 ? 0 : 1,
        limit:true
    };

    // Returns the element that needs to be animated to scroll the window.
    // Kept for backwards compatibility (specially for localScroll & serialScroll)
    $scrollTo.window = function( scope ){
        return $(window)._scrollable();
    };

    // Hack, hack, hack :)
    // Returns the real elements to scroll (supports window/iframes, documents and regular nodes)
    $.fn._scrollable = function(){
        return this.map(function(){
            var elem = this,
                isWin = !elem.nodeName || $.inArray( elem.nodeName.toLowerCase(), ['iframe','#document','html','body'] ) != -1;

            if( !isWin )
                return elem;

            var doc = (elem.contentWindow || elem).document || elem.ownerDocument || elem;

            return /webkit/i.test(navigator.userAgent) || doc.compatMode == 'BackCompat' ?
                doc.body :
                doc.documentElement;
        });
    };

    $.fn.scrollTo = function( target, duration, settings ){
        if( typeof duration == 'object' ){
            settings = duration;
            duration = 0;
        }
        if( typeof settings == 'function' )
            settings = { onAfter:settings };

        if( target == 'max' )
            target = 9e9;

        settings = $.extend( {}, $scrollTo.defaults, settings );
        // Speed is still recognized for backwards compatibility
        duration = duration || settings.duration;
        // Make sure the settings are given right
        settings.queue = settings.queue && settings.axis.length > 1;

        if( settings.queue )
        // Let's keep the overall duration
            duration /= 2;
        settings.offset = both( settings.offset );
        settings.over = both( settings.over );

        return this._scrollable().each(function(){
            // Null target yields nothing, just like jQuery does
            if (target == null) return;

            var elem = this,
                $elem = $(elem),
                targ = target, toff, attr = {},
                win = $elem.is('html,body');

            switch( typeof targ ){
                // A number will pass the regex
                case 'number':
                case 'string':
                    if( /^([+-]=?)?\d+(\.\d+)?(px|%)?$/.test(targ) ){
                        targ = both( targ );
                        // We are done
                        break;
                    }
                    // Relative selector, no break!
                    targ = $(targ,this);
                    if (!targ.length) return;
                case 'object':
                    // DOMElement / jQuery
                    if( targ.is || targ.style )
                    // Get the real position of the target
                        toff = (targ = $(targ)).offset();
            }
            $.each( settings.axis.split(''), function( i, axis ){
                var Pos	= axis == 'x' ? 'Left' : 'Top',
                    pos = Pos.toLowerCase(),
                    key = 'scroll' + Pos,
                    old = elem[key],
                    max = $scrollTo.max(elem, axis);

                if( toff ){// jQuery / DOMElement
                    attr[key] = toff[pos] + ( win ? 0 : old - $elem.offset()[pos] );

                    // If it's a dom element, reduce the margin
                    if( settings.margin ){
                        attr[key] -= parseInt(targ.css('margin'+Pos)) || 0;
                        attr[key] -= parseInt(targ.css('border'+Pos+'Width')) || 0;
                    }

                    attr[key] += settings.offset[pos] || 0;

                    if( settings.over[pos] )
                    // Scroll to a fraction of its width/height
                        attr[key] += targ[axis=='x'?'width':'height']() * settings.over[pos];
                }else{
                    var val = targ[pos];
                    // Handle percentage values
                    attr[key] = val.slice && val.slice(-1) == '%' ?
                        parseFloat(val) / 100 * max
                        : val;
                }

                // Number or 'number'
                if( settings.limit && /^\d+$/.test(attr[key]) )
                // Check the limits
                    attr[key] = attr[key] <= 0 ? 0 : Math.min( attr[key], max );

                // Queueing axes
                if( !i && settings.queue ){
                    // Don't waste time animating, if there's no need.
                    if( old != attr[key] )
                    // Intermediate animation
                        animate( settings.onAfterFirst );
                    // Don't animate this axis again in the next iteration.
                    delete attr[key];
                }
            });

            animate( settings.onAfter );

            function animate( callback ){
                $elem.animate( attr, duration, settings.easing, callback && function(){
                    callback.call(this, target, settings);
                });
            };

        }).end();
    };

    // Max scrolling position, works on quirks mode
    // It only fails (not too badly) on IE, quirks mode.
    $scrollTo.max = function( elem, axis ){
        var Dim = axis == 'x' ? 'Width' : 'Height',
            scroll = 'scroll'+Dim;

        if( !$(elem).is('html,body') )
            return elem[scroll] - $(elem)[Dim.toLowerCase()]();

        var size = 'client' + Dim,
            html = elem.ownerDocument.documentElement,
            body = elem.ownerDocument.body;

        return Math.max( html[scroll], body[scroll] )
            - Math.min( html[size]  , body[size]   );
    };

    function both( val ){
        return typeof val == 'object' ? val : { top:val, left:val };
    };

})( jQuery );
(function(root, $){
    'use strict';

    var transitionEndEvents = 'transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd';

    $.fn.transitionEnd = function(callback) {
        return this.each(function(){
            var $this = $(this);
            $this.off(transitionEndEvents);
            $this.on(transitionEndEvents, function() {
                if (typeof callback == 'function') {
                    callback.call(this);
                }
            });
        });
    };

    $.fn.unbindTransitionEnd = function() {
        this.off(transitionEndEvents);
    };

}(this, jQuery));
(function(root, $){
    'use strict';

    $.fn.transitionFadeOut = function(options, callback) {

        var animationOptions = {
                transitionProps : 'opacity',
                delay           : '0.3s',
                animationType   : 'ease'
            },
            hasOwnProp = Object.prototype.hasOwnProperty,
            objProp, cssProp = '';

        if (typeof options === 'function') {
            callback = options;
        } else if (typeof options === 'object') {
            $.extend(animationOptions, options);
        }

        for (objProp in animationOptions) {
            if (hasOwnProp.call(animationOptions, objProp)) {
                cssProp += animationOptions[objProp] + ' ';
            }
        }

        return this.each(function(){
            var $this = $(this);

            $this.css('opacity', '1');
            $this.transitionEnd(function() {
                $this.unbindTransitionEnd();
                $this.css('display', 'none');

                if (typeof callback === 'function') {
                    callback();
                }

            });
            $this.css({
                'transition' : cssProp,
                'opacity' : '0'
            });

        });
    };

    $.fn.transitionFadeIn = function() {
        return this.each(function(){
            var $this = $(this);

            $this.css('display', 'block');
            $this.css('opacity', '0');
            $this.offsetHeight;

            $this.transitionEnd(function() {
                $this.unbindTransitionEnd();
                $this.css('display', 'block');

            });
            $this.css({
                'opacity' : '1'
            });

        });
    };

}(this, jQuery));
/**
 * jquery.meio.mask.js
 * @author: fabiomcosta
 * @version: 1.1.14
 *
 * Created by Fabio M. Costa on 2008-09-16. Please report any bug at http://www.meiocodigo.com
 *
 * Copyright (c) 2008 Fabio M. Costa http://www.meiocodigo.com
 *
 * The MIT License (http://www.opensource.org/licenses/mit-license.php)
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */

(function($) {

    // https://github.com/jquery/jquery-migrate/blob/master/src/core.js#L50
    if (!$.browser) {
        var uaMatch = function(ua) {
            ua = ua.toLowerCase();

            var match = /(chrome)[ \/]([\w.]+)/.exec(ua) || /(webkit)[ \/]([\w.]+)/.exec(ua) || /(opera)(?:.*version|)[ \/]([\w.]+)/.exec(ua) || /(msie) ([\w.]+)/.exec(ua) || ua.indexOf('compatible') < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec(ua) || [];

            return match[2] || '0';
        };

        $.browser = {
            mozilla: /mozilla/.test(navigator.userAgent.toLowerCase()) && !/webkit/.test(navigator.userAgent.toLowerCase()),
            webkit: /webkit/.test(navigator.userAgent.toLowerCase()),
            opera: /opera/.test(navigator.userAgent.toLowerCase()),
            msie: /msie/.test(navigator.userAgent.toLowerCase()),
            android: (navigator.userAgent.toLowerCase().indexOf('mozilla/5.0') > -1 && navigator.userAgent.toLowerCase().indexOf('android ') > -1 && navigator.userAgent.toLowerCase().indexOf('applewebkit') > -1),
            version: uaMatch(navigator.userAgent)
        };
    }

    var isMobile = (window.orientation != null);

    // browsers like firefox2 and before and opera doesnt have the onPaste event, but the paste feature can be done with the onInput event.
    var pasteEvent = (($.browser.opera || ($.browser.mozilla && parseFloat($.browser.version.substr(0, 3)) < 1.9)) ? 'input' : 'paste');

    // the timeout is set because we can't get the value from the input without it
    var pasteHandler = function(e) {
        e = $.event.fix(e || window.event);
        e.type = 'paste';
        var el = e.target;

        setTimeout(function() {
            $.event.dispatch.call(el, e);
        }, 1);
    };

    $.event.special.paste = {
        setup: function() {
            if (this.addEventListener) this.addEventListener(pasteEvent, pasteHandler, false);
            else if (this.attachEvent) this.attachEvent('on' + pasteEvent, pasteHandler);
        },

        teardown: function() {
            if (this.removeEventListener) this.removeEventListener(pasteEvent, pasteHandler, false);
            else if (this.detachEvent) this.detachEvent('on' + pasteEvent, pasteHandler);
        }
    };

    $.extend({
        mask: {

            // the mask rules. You may add yours!
            // number rules will be overwritten
            rules: {
                'z': /[a-z]/,
                'Z': /[A-Z]/,
                'a': /[a-zA-Z]/,
                '*': /[0-9a-zA-Z]/,
                '@': /[0-9a-zA-ZçÇáàãâéèêíìóòôõúùü]/
            },

            // these keys will be ignored by the mask.
            // all these numbers where obtained on the keydown event
            keyRepresentation: {
                8: 'backspace',
                9: 'tab',
                13: 'enter',
                16: 'shift',
                17: 'control',
                18: 'alt',
                27: 'esc',
                33: 'page up',
                34: 'page down',
                35: 'end',
                36: 'home',
                37: 'left',
                38: 'up',
                39: 'right',
                40: 'down',
                45: 'insert',
                46: 'delete',
                116: 'f5',
                123: 'f12',
                224: 'command'
            },

            signals: {
                '+': '',
                '-': '-'
            },

            // default settings for the plugin
            options: {
                attr: 'alt', // an attr to look for the mask name or the mask itself
                mask: null, // the mask to be used on the input
                type: 'fixed', // the mask of this mask
                maxLength: -1, // the maxLength of the mask
                defaultValue: '', // the default value for this input
                signal: false, // this should not be set, to use signal at masks put the signal you want ('-' or '+') at the default value of this mask.
                // See the defined masks for a better understanding.

                textAlign: true, // use false to not use text-align on any mask (at least not by the plugin, you may apply it using css)
                selectCharsOnFocus: true, // select all chars from input on its focus
                autoTab: true, // auto focus the next form element when you type the mask completely
                setSize: false, // sets the input size based on the length of the mask (work with fixed and reverse masks only)
                fixedChars: '[(),.:/ -]', // fixed chars to be used on the masks. You may change it for your needs!

                onInvalid: function() {},
                onValid: function() {},
                onOverflow: function() {},
                onFocus: function(input, evt) {},
                onBlur: function(input, evt) {}
            },

            // masks. You may add yours!
            // Ex: $.fn.setMask.masks.msk = {mask: '999'}
            // and then if the 'attr' options value is 'alt', your input should look like:
            // <input type="text" name="some_name" id="some_name" alt="msk" />
            masks: {
                'phone': {
                    mask: '(99) 9999-9999'
                },
                'phone-us': {
                    mask: '(999) 999-9999'
                },
                'cpf': {
                    mask: '999.999.999-99'
                }, // cadastro nacional de pessoa fisica (kind of a brazillian ssn)
                'cnpj': {
                    mask: '99.999.999/9999-99'
                },
                'date': {
                    mask: '39/19/9999'
                }, // uk date
                'date-us': {
                    mask: '19/39/9999'
                },
                'cep': {
                    mask: '99999-999'
                },
                'time': {
                    mask: '29:59'
                },
                'cc': {
                    mask: '9999 9999 9999 9999'
                }, // credit card
                'integer': {
                    mask: '999.999.999.999',
                    type: 'reverse'
                },
                'decimal': {
                    mask: '99,999.999.999.999',
                    type: 'reverse',
                    defaultValue: '000'
                },
                'decimal-us': {
                    mask: '99.999,999,999,999',
                    type: 'reverse',
                    defaultValue: '000'
                },
                'signed-decimal': {
                    mask: '99,999.999.999.999',
                    type: 'reverse',
                    defaultValue: '+000'
                },
                'signed-decimal-us': {
                    mask: '99,999.999.999.999',
                    type: 'reverse',
                    defaultValue: '+000'
                }
            },

            init: function() {
                // if has not inited...
                if (!this.hasInit) {

                    var self = this,
                        i,
                        keyRep = this.keyRepresentation;

                    this.ignore = false;

                    // constructs number rules
                    for (i = 0; i <= 9; i++) this.rules[i] = new RegExp('[0-' + i + ']');

                    this.keyRep = keyRep;
                    // ignore keys array creation for iphone or the normal ones
                    this.ignoreKeys = [];
                    $.each(keyRep, function(key) {
                        self.ignoreKeys.push(parseInt(key, 10));
                    });

                    this.hasInit = true;
                }
            },

            set: function(el, options) {

                var maskObj = this,
                    $el = $(el),
                    mlStr = 'maxLength';

                options = options || {};
                this.init();

                return $el.each(function() {

                    if (options.attr) maskObj.options.attr = options.attr;

                    var $this = $(this),
                        o = $.extend({}, maskObj.options),
                        attrValue = $this.attr(o.attr),
                        tmpMask = '';

                    // then we look for the 'attr' option
                    tmpMask = (typeof options == 'string') ? options : (attrValue !== '') ? attrValue : null;
                    if (tmpMask) o.mask = tmpMask;

                    // then we see if it's a defined mask
                    if (maskObj.masks[tmpMask]) o = $.extend(o, maskObj.masks[tmpMask]);

                    // then it looks if the options is an object, if it is we will overwrite the actual options
                    if (typeof options == 'object' && options.constructor != Array) o = $.extend(o, options);

                    //then we look for some metadata on the input
                    if ($.metadata) o = $.extend(o, $this.metadata());

                    if (o.mask != null) {

                        // prevents javascript automatic type convertion
                        o.mask += '';

                        if ($this.data('mask')) maskObj.unset($this);

                        var defaultValue = o.defaultValue,
                            reverse = (o.type === 'reverse'),
                            fixedCharsRegG = new RegExp(o.fixedChars, 'g');

                        if (o.maxLength === -1) o.maxLength = $this.attr(mlStr);

                        o = $.extend({}, o, {
                            fixedCharsReg: new RegExp(o.fixedChars),
                            fixedCharsRegG: fixedCharsRegG,
                            maskArray: o.mask.split(''),
                            maskNonFixedCharsArray: o.mask.replace(fixedCharsRegG, '').split('')
                        });

                        // setSize option (this is kept when the mask is removed)
                        if ((o.type == 'fixed' || reverse) && o.setSize && !$this.attr('size')) $this.attr('size', o.mask.length);

                        // sets text-align right for reverse masks
                        if (reverse && o.textAlign) $this.css('text-align', 'right');

                        if (this.value !== '' || defaultValue !== '') {
                            // apply mask to the current value of the input or to the default value
                            var val = maskObj.string((this.value !== '') ? this.value : defaultValue, o);
                            //setting defaultValue fixes the reset button from the form
                            this.defaultValue = val;
                            $this.val(val);
                        }

                        // compatibility patch for infinite mask, that is now repeat
                        if (o.type == 'infinite') o.type = 'repeat';

                        $this.data('mask', o);

                        // removes the maxLength attribute (it will be set again if you use the unset method)
                        $this.removeAttr(mlStr);

                        // setting the input events
                        $this.bind('keydown.mask', {
                            func: maskObj._onKeyDown,
                            thisObj: maskObj
                        }, maskObj._onMask)
                            .bind('keypress.mask', {
                            func: maskObj._onKeyPress,
                            thisObj: maskObj
                        }, maskObj._onMask)
                            .bind('keyup.mask', {
                            func: maskObj._onKeyUp,
                            thisObj: maskObj
                        }, maskObj._onMask)
                            .bind('paste.mask', {
                            func: maskObj._onPaste,
                            thisObj: maskObj
                        }, maskObj._onMask)
                            .bind('drop.mask', {
                            func: maskObj._onPaste,
                            thisObj: maskObj
                        }, maskObj._onMask)
                            .bind('focus.mask', maskObj._onFocus)
                            .bind('blur.mask', maskObj._onBlur)
                            .bind('change.mask', maskObj._onChange);
                    }
                });
            },

            //unsets the mask from el
            unset: function(el) {
                var $el = $(el);

                return $el.each(function() {
                    var $this = $(this);
                    if ($this.data('mask')) {
                        var maxLength = $this.data('mask').maxLength;
                        if (maxLength != -1) $this.attr('maxLength', maxLength);
                        $this.unbind('.mask')
                            .removeData('mask');
                    }
                });
            },

            //masks a string
            string: function(str, options) {
                this.init();
                var o = {};
                if (typeof str != 'string') str = String(str);
                switch (typeof options) {
                    case 'string':
                        // then we see if it's a defined mask
                        if (this.masks[options]) o = $.extend(o, this.masks[options]);
                        else o.mask = options;
                        break;
                    case 'object':
                        o = options;
                }
                if (!o.fixedChars) o.fixedChars = this.options.fixedChars;

                var fixedCharsReg = new RegExp(o.fixedChars),
                    fixedCharsRegG = new RegExp(o.fixedChars, 'g');

                // insert signal if any
                if ((o.type === 'reverse') && o.defaultValue) {
                    if (typeof this.signals[o.defaultValue.charAt(0)] != 'undefined') {
                        var maybeASignal = str.charAt(0);
                        o.signal = (typeof this.signals[maybeASignal] != 'undefined') ? this.signals[maybeASignal] : this.signals[o.defaultValue.charAt(0)];
                        o.defaultValue = o.defaultValue.substring(1);
                    }
                }

                return this.__maskArray(str.split(''),
                o.mask.replace(fixedCharsRegG, '').split(''),
                o.mask.split(''),
                o.type,
                o.maxLength,
                o.defaultValue,
                fixedCharsReg,
                o.signal);
            },

            // all the 3 events below are here just to fix the change event on reversed masks.
            // It isn't fired in cases that the keypress event returns false (needed).
            _onFocus: function(e) {
                var $this = $(this),
                    dataObj = $this.data('mask');
                dataObj.inputFocusValue = $this.val();
                dataObj.changed = false;
                if (dataObj.selectCharsOnFocus) $this.select();
                // trigger mask function
                dataObj.onFocus(this, e);
            },

            _onBlur: function(e) {
                var $this = $(this),
                    dataObj = $this.data('mask');
                if (dataObj.inputFocusValue != $this.val() && !dataObj.changed) $this.trigger('change');
                // trigger  mask function
                dataObj.onBlur(this, e);
            },

            _onChange: function(e) {
                $(this).data('mask').changed = true;
            },

            _onMask: function(e) {
                var thisObj = e.data.thisObj,
                    o = {};

                o._this = e.target;
                o.$this = $(o._this);
                o.data = o.$this.data('mask');

                if (o.$this.attr('readonly') || !o.data) {
                    return true;
                }

                o[o.data.type] = true;
                o.value = o.$this.val();
                o.nKey = thisObj.__getKeyNumber(e);
                o.range = thisObj.__getRange(o._this);
                o.valueArray = o.value.split('');
                return e.data.func.call(thisObj, e, o);
            },

            _onKeyDown: function(e, o) {
                // lets say keypress at desktop == keydown at iphone (theres no keypress at iphone)
                this.ignore = $.inArray(o.nKey, this.ignoreKeys) > -1 || ((e.ctrlKey || e.metaKey || e.altKey) && e.key);
                if (this.ignore) {
                    var rep = this.keyRep[o.nKey];
                    o.data.onValid.call(o._this, rep || '', o.nKey);
                }
                return true;
            },

            _onKeyUp: function(e, o) {
                //9=TAB_KEY 16=SHIFT_KEY
                //this is a little bug, when you go to an input with tab key
                //it would remove the range selected by default, and that's not a desired behavior
                if (o.nKey === 9 || o.nKey === 16 || (o.nKey >= 37 && o.nKey <= 40)) return true;

                if (o.repeat) {
                    this.__autoTab(o);
                    return true;
                }

                return this._onPaste(e, o);
            },

            _onPaste: function(e, o) {
                // changes the signal at the data obj from the input
                if (o.reverse) this.__changeSignal(e.type, o);

                var $thisVal = this.__maskArray(
                o.valueArray,
                o.data.maskNonFixedCharsArray,
                o.data.maskArray,
                o.data.type,
                o.data.maxLength,
                o.data.defaultValue,
                o.data.fixedCharsReg,
                o.data.signal);

                o.$this.val($thisVal);
                // this makes the caret stay at first position when
                // the user removes all values in an input and the plugin adds the default value to it (if it haves one).
                if (!o.reverse && o.data.defaultValue.length && (o.range.start === o.range.end)) this.__setRange(o._this, o.range.start, o.range.end);

                //fix so ie's and safari's caret won't go to the end of the input value.
                if (($.browser.msie || $.browser.safari) && !o.reverse) this.__setRange(o._this, o.range.start, o.range.end);

                if (this.ignore) return true;

                this.__autoTab(o);
                return true;
            },

            _onKeyPress: function(e, o) {

                if (this.ignore) return true;

                // changes the signal at the data obj from the input
                if (o.reverse) this.__changeSignal(e.type, o);

                var c = String.fromCharCode(o.nKey),
                    rangeStart = o.range.start,
                    rawValue = o.value,
                    maskArray = o.data.maskArray;

                if (o.reverse) {
                    // the input value from the range start to the value start
                    var valueStart = rawValue.substr(0, rangeStart),
                        // the input value from the range end to the value end
                        valueEnd = rawValue.substr(o.range.end, rawValue.length);

                    rawValue = valueStart + c + valueEnd;
                    //necessary, if not decremented you will be able to input just the mask.length-1 if signal!=''
                    //ex: mask:99,999.999.999 you will be able to input 99,999.999.99
                    if (o.data.signal && (rangeStart - o.data.signal.length > 0)) {
                        rangeStart -= o.data.signal.length;
                    }
                }

                var valueArray = rawValue.replace(o.data.fixedCharsRegG, '').split(''),
                    // searches for fixed chars begining from the range start position, till it finds a non fixed
                    extraPos = this.__extraPositionsTill(rangeStart, maskArray, o.data.fixedCharsReg);

                o.rsEp = rangeStart + extraPos;

                if (o.repeat) {
                    o.rsEp = 0;
                }

                // if the rule for this character doesnt exist (value.length is bigger than mask.length)
                // added a verification for maxLength in the case of the repeat type mask
                if (!this.rules[maskArray[o.rsEp]] || (o.data.maxLength != -1 && valueArray.length >= o.data.maxLength && o.repeat)) {
                    // auto focus on the next input of the current form
                    o.data.onOverflow.call(o._this, c, o.nKey);
                    return false;
                }

                // if the new character is not obeying the law...
                else if (!this.rules[maskArray[o.rsEp]].test(c)) {
                    o.data.onInvalid.call(o._this, c, o.nKey);
                    return false;
                } else {
                    o.data.onValid.call(o._this, c, o.nKey);
                }

                var $thisVal = this.__maskArray(
                valueArray,
                o.data.maskNonFixedCharsArray,
                maskArray,
                o.data.type,
                o.data.maxLength,
                o.data.defaultValue,
                o.data.fixedCharsReg,
                o.data.signal,
                extraPos);

                if (!o.repeat) {
                    o.$this.val($thisVal);
                }

                return (o.reverse) ? this._keyPressReverse(e, o) : (o.fixed) ? this._keyPressFixed(e, o) : true;
            },

            _keyPressFixed: function(e, o) {

                if (o.range.start == o.range.end) {
                    // the 0 thing is because theres an unwanted behavior when you put a default
                    // value on a fixed mask and you select the value from the input the range would go to the
                    // end of the string when you enter a char. with this it will overwrite the first char wich is a better behavior.
                    // opera fix, cant have range value bigger than value length, i think it loops thought the input value...
                    if ((o.rsEp === 0 && o.value.length === 0) || o.rsEp < o.value.length) this.__setRange(o._this, o.rsEp, o.rsEp + 1);
                } else this.__setRange(o._this, o.range.start, o.range.end);

                return true;
            },

            _keyPressReverse: function(e, o) {
                // fix for ie
                // this bug was pointed by Pedro Martins
                // it fixes a strange behavior that ie was having after a char was inputted in a text input that
                // had its content selected by any range
                if ($.browser.msie && ((o.range.start === 0 && o.range.end === 0) || o.range.start != o.range.end)) this.__setRange(o._this, o.value.length);
                return false;
            },

            __autoTab: function(o) {
                if (o.data.autoTab && (
                (
                o.$this.val().length >= o.data.maskArray.length && !o.repeat) || (
                o.data.maxLength != -1 && o.valueArray.length >= o.data.maxLength && o.repeat))) {
                    var nextEl = this.__getNextInput(o._this, o.data.autoTab);
                    if (nextEl) {
                        o.$this.trigger('blur');
                        nextEl.focus().select();
                    }
                }
            },

            // changes the signal at the data obj from the input
            __changeSignal: function(eventType, o) {
                if (o.data.signal !== false) {
                    var inputChar = (eventType === 'paste') ? o.value.charAt(0) : String.fromCharCode(o.nKey);
                    if (this.signals && (typeof this.signals[inputChar] !== 'undefined')) {
                        o.data.signal = this.signals[inputChar];
                    }
                }
            },

            __getKeyNumber: function(e) {
                return (e.charCode || e.keyCode || e.which);
            },

            // this function is totaly specific to be used with this plugin, youll never need it
            // it gets the array representing an unmasked string and masks it depending on the type of the mask
            __maskArray: function(valueArray, maskNonFixedCharsArray, maskArray, type, maxlength, defaultValue, fixedCharsReg, signal, extraPos) {
                if (type === 'reverse') valueArray.reverse();
                valueArray = this.__removeInvalidChars(valueArray, maskNonFixedCharsArray, type === 'repeat' || type === 'infinite');
                if (defaultValue) valueArray = this.__applyDefaultValue.call(valueArray, defaultValue);
                valueArray = this.__applyMask(valueArray, maskArray, extraPos, fixedCharsReg);
                switch (type) {
                    case 'reverse':
                        valueArray.reverse();
                        return (signal || '') + valueArray.join('').substring(valueArray.length - maskArray.length);
                    case 'infinite':
                    case 'repeat':
                        var joinedValue = valueArray.join('');
                        return (maxlength !== -1 && valueArray.length >= maxlength) ? joinedValue.substring(0, maxlength) : joinedValue;
                    default:
                        return valueArray.join('').substring(0, maskArray.length);
                }
                return '';
            },

            // applyes the default value to the result string
            __applyDefaultValue: function(defaultValue) {
                var defLen = defaultValue.length,
                    thisLen = this.length,
                    i;
                //removes the leading chars
                for (i = thisLen - 1; i >= 0; i--) {
                    if (this[i] == defaultValue.charAt(0)) {
                        this.pop();
                    } else break;
                }
                // apply the default value
                for (i = 0; i < defLen; i++) if (!this[i]) {
                    this[i] = defaultValue.charAt(i);
                }

                return this;
            },

            // Removes values that doesnt match the mask from the valueArray
            // Returns the array without the invalid chars.
            __removeInvalidChars: function(valueArray, maskNonFixedCharsArray, repeatType) {
                // removes invalid chars
                for (var i = 0, y = 0; i < valueArray.length; i++) {
                    if (maskNonFixedCharsArray[y] && this.rules[maskNonFixedCharsArray[y]] && !this.rules[maskNonFixedCharsArray[y]].test(valueArray[i])) {
                        valueArray.splice(i, 1);
                        if (!repeatType) y--;
                        i--;
                    }
                    if (!repeatType) y++;
                }
                return valueArray;
            },

            // Apply the current input mask to the valueArray and returns it.
            __applyMask: function(valueArray, maskArray, plus, fixedCharsReg) {
                if (typeof plus == 'undefined') plus = 0;
                // apply the current mask to the array of chars
                for (var i = 0; i < valueArray.length + plus; i++) {
                    if (maskArray[i] && fixedCharsReg.test(maskArray[i])) valueArray.splice(i, 0, maskArray[i]);
                }
                return valueArray;
            },

            // searches for fixed chars begining from the range start position, till it finds a non fixed
            __extraPositionsTill: function(rangeStart, maskArray, fixedCharsReg) {
                var extraPos = 0;
                while (fixedCharsReg.test(maskArray[rangeStart++])) {
                    extraPos++;
                }
                return extraPos;
            },

            __getNextInput: function(input, selector) {
                var form = input.form;

                if (form == null) {
                    return null;
                }

                var formEls = form.elements,
                    initialInputIndex = $.inArray(input, formEls) + 1,
                    len = formEls.length,
                    $input = null,
                    i;

                // look for next input on the form of the pased input
                for (i = initialInputIndex; i < len; i++) {
                    $input = $(formEls[i]);
                    if (this.__isNextInput($input, selector)) {
                        return $input;
                    }
                }

                var forms = document.forms,
                    initialFormIndex = $.inArray(input.form, forms) + 1,
                    y, tmpFormEls, _len = forms.length;
                // look for the next forms for the next input
                for (y = initialFormIndex; y < _len; y++) {
                    tmpFormEls = forms[y].elements;
                    len = tmpFormEls.length;
                    for (i = 0; i < len; i++) {
                        $input = $(tmpFormEls[i]);
                        if (this.__isNextInput($input, selector)) {
                            return $input;
                        }
                    }
                }
                return null;
            },

            __isNextInput: function($formEl, selector) {
                var formEl = $formEl.get(0);
                return formEl && (formEl.offsetWidth > 0 || formEl.offsetHeight > 0) && formEl.nodeName != 'FIELDSET' && (selector === true || (typeof selector == 'string' && $formEl.is(selector)));
            },

            // http://www.bazon.net/mishoo/articles.epl?art_id=1292
            __setRange: function(input, start, end) {
                if (typeof end == 'undefined') {
                    end = start;
                }
                if (input.setSelectionRange) {
                    input.setSelectionRange(start, end);
                } else {
                    // assumed IE
                    var range = input.createTextRange();
                    range.collapse();
                    range.moveStart('character', start);
                    range.moveEnd('character', end - start);
                    range.select();
                }
            },

            // adaptation from http://digitarald.de/project/autocompleter/
            __getRange: function(input) {
                if (!$.browser.msie && !$.browser.android) return {
                    start: input.selectionStart,
                    end: input.selectionEnd
                };
                var pos = {
                    start: 0,
                    end: 0
                },
                range = document.selection.createRange();
                pos.start = 0 - range.duplicate().moveStart('character', - 100000);
                pos.end = pos.start + range.text.length;
                return pos;
            },

            //deprecated
            unmaskedVal: function(el) {
                return $(el).val().replace($.mask.fixedCharsRegG, '');
            }

        }
    });

    $.fn.extend({
        setMask: function(options) {
            return $.mask.set(this, options);
        },
        unsetMask: function() {
            return $.mask.unset(this);
        },
        //deprecated
        unmaskedVal: function() {
            return $.mask.unmaskedVal(this[0]);
        }
    });
})(jQuery);
(function($, undefined) {

/**
 * Unobtrusive scripting adapter for jQuery
 * https://github.com/rails/jquery-ujs
 *
 * Requires jQuery 1.8.0 or later.
 *
 * Released under the MIT license
 *
 */

  // Cut down on the number of issues from people inadvertently including jquery_ujs twice
  // by detecting and raising an error when it happens.
  if ( $.rails !== undefined ) {
    $.error('jquery-ujs has already been loaded!');
  }

  // Shorthand to make it a little easier to call public rails functions from within rails.js
  var rails;
  var $document = $(document);

  $.rails = rails = {
    // Link elements bound by jquery-ujs
    linkClickSelector: 'a[data-confirm], a[data-method], a[data-remote], a[data-disable-with], a[data-disable]',

    // Button elements bound by jquery-ujs
    buttonClickSelector: 'button[data-remote], button[data-confirm]',

    // Select elements bound by jquery-ujs
    inputChangeSelector: 'select[data-remote], input[data-remote], textarea[data-remote]',

    // Form elements bound by jquery-ujs
    formSubmitSelector: 'form',

    // Form input elements bound by jquery-ujs
    formInputClickSelector: 'form input[type=submit], form input[type=image], form button[type=submit], form button:not([type]), input[type=submit][form], input[type=image][form], button[type=submit][form], button[form]:not([type])',

    // Form input elements disabled during form submission
    disableSelector: 'input[data-disable-with]:enabled, button[data-disable-with]:enabled, textarea[data-disable-with]:enabled, input[data-disable]:enabled, button[data-disable]:enabled, textarea[data-disable]:enabled',

    // Form input elements re-enabled after form submission
    enableSelector: 'input[data-disable-with]:disabled, button[data-disable-with]:disabled, textarea[data-disable-with]:disabled, input[data-disable]:disabled, button[data-disable]:disabled, textarea[data-disable]:disabled',

    // Form required input elements
    requiredInputSelector: 'input[name][required]:not([disabled]),textarea[name][required]:not([disabled])',

    // Form file input elements
    fileInputSelector: 'input[type=file]',

    // Link onClick disable selector with possible reenable after remote submission
    linkDisableSelector: 'a[data-disable-with], a[data-disable]',

    // Button onClick disable selector with possible reenable after remote submission
    buttonDisableSelector: 'button[data-remote][data-disable-with], button[data-remote][data-disable]',

    // Make sure that every Ajax request sends the CSRF token
    CSRFProtection: function(xhr) {
      var token = $('meta[name="csrf-token"]').attr('content');
      if (token) xhr.setRequestHeader('X-CSRF-Token', token);
    },

    // making sure that all forms have actual up-to-date token(cached forms contain old one)
    refreshCSRFTokens: function(){
      var csrfToken = $('meta[name=csrf-token]').attr('content');
      var csrfParam = $('meta[name=csrf-param]').attr('content');
      $('form input[name="' + csrfParam + '"]').val(csrfToken);
    },

    // Triggers an event on an element and returns false if the event result is false
    fire: function(obj, name, data) {
      var event = $.Event(name);
      obj.trigger(event, data);
      return event.result !== false;
    },

    // Default confirm dialog, may be overridden with custom confirm dialog in $.rails.confirm
    confirm: function(message) {
      return confirm(message);
    },

    // Default ajax function, may be overridden with custom function in $.rails.ajax
    ajax: function(options) {
      return $.ajax(options);
    },

    // Default way to get an element's href. May be overridden at $.rails.href.
    href: function(element) {
      return element.attr('href');
    },

    // Submits "remote" forms and links with ajax
    handleRemote: function(element) {
      var method, url, data, elCrossDomain, crossDomain, withCredentials, dataType, options;

      if (rails.fire(element, 'ajax:before')) {
        elCrossDomain = element.data('cross-domain');
        crossDomain = elCrossDomain === undefined ? null : elCrossDomain;
        withCredentials = element.data('with-credentials') || null;
        dataType = element.data('type') || ($.ajaxSettings && $.ajaxSettings.dataType);

        if (element.is('form')) {
          method = element.attr('method');
          url = element.attr('action');
          data = element.serializeArray();
          // memoized value from clicked submit button
          var button = element.data('ujs:submit-button');
          if (button) {
            data.push(button);
            element.data('ujs:submit-button', null);
          }
        } else if (element.is(rails.inputChangeSelector)) {
          method = element.data('method');
          url = element.data('url');
          data = element.serialize();
          if (element.data('params')) data = data + "&" + element.data('params');
        } else if (element.is(rails.buttonClickSelector)) {
          method = element.data('method') || 'get';
          url = element.data('url');
          data = element.serialize();
          if (element.data('params')) data = data + "&" + element.data('params');
        } else {
          method = element.data('method');
          url = rails.href(element);
          data = element.data('params') || null;
        }

        options = {
          type: method || 'GET', data: data, dataType: dataType,
          // stopping the "ajax:beforeSend" event will cancel the ajax request
          beforeSend: function(xhr, settings) {
            if (settings.dataType === undefined) {
              xhr.setRequestHeader('accept', '*/*;q=0.5, ' + settings.accepts.script);
            }
            if (rails.fire(element, 'ajax:beforeSend', [xhr, settings])) {
              element.trigger('ajax:send', xhr);
            } else {
              return false;
            }
          },
          success: function(data, status, xhr) {
            element.trigger('ajax:success', [data, status, xhr]);
          },
          complete: function(xhr, status) {
            element.trigger('ajax:complete', [xhr, status]);
          },
          error: function(xhr, status, error) {
            element.trigger('ajax:error', [xhr, status, error]);
          },
          crossDomain: crossDomain
        };

        // There is no withCredentials for IE6-8 when
        // "Enable native XMLHTTP support" is disabled
        if (withCredentials) {
          options.xhrFields = {
            withCredentials: withCredentials
          };
        }

        // Only pass url to `ajax` options if not blank
        if (url) { options.url = url; }

        return rails.ajax(options);
      } else {
        return false;
      }
    },

    // Handles "data-method" on links such as:
    // <a href="/users/5" data-method="delete" rel="nofollow" data-confirm="Are you sure?">Delete</a>
    handleMethod: function(link) {
      var href = rails.href(link),
        method = link.data('method'),
        target = link.attr('target'),
        csrfToken = $('meta[name=csrf-token]').attr('content'),
        csrfParam = $('meta[name=csrf-param]').attr('content'),
        form = $('<form method="post" action="' + href + '"></form>'),
        metadataInput = '<input name="_method" value="' + method + '" type="hidden" />';

      if (csrfParam !== undefined && csrfToken !== undefined) {
        metadataInput += '<input name="' + csrfParam + '" value="' + csrfToken + '" type="hidden" />';
      }

      if (target) { form.attr('target', target); }

      form.hide().append(metadataInput).appendTo('body');
      form.submit();
    },

    // Helper function that returns form elements that match the specified CSS selector
    // If form is actually a "form" element this will return associated elements outside the from that have
    // the html form attribute set
    formElements: function(form, selector) {
      return form.is('form') ? $(form[0].elements).filter(selector) : form.find(selector);
    },

    /* Disables form elements:
      - Caches element value in 'ujs:enable-with' data store
      - Replaces element text with value of 'data-disable-with' attribute
      - Sets disabled property to true
    */
    disableFormElements: function(form) {
      rails.formElements(form, rails.disableSelector).each(function() {
        rails.disableFormElement($(this));
      });
    },

    disableFormElement: function(element) {
      var method, replacement;

      method = element.is('button') ? 'html' : 'val';
      replacement = element.data('disable-with');

      element.data('ujs:enable-with', element[method]());
      if (replacement !== undefined) {
        element[method](replacement);
      }

      element.prop('disabled', true);
    },

    /* Re-enables disabled form elements:
      - Replaces element text with cached value from 'ujs:enable-with' data store (created in `disableFormElements`)
      - Sets disabled property to false
    */
    enableFormElements: function(form) {
      rails.formElements(form, rails.enableSelector).each(function() {
        rails.enableFormElement($(this));
      });
    },

    enableFormElement: function(element) {
      var method = element.is('button') ? 'html' : 'val';
      if (element.data('ujs:enable-with')) element[method](element.data('ujs:enable-with'));
      element.prop('disabled', false);
    },

   /* For 'data-confirm' attribute:
      - Fires `confirm` event
      - Shows the confirmation dialog
      - Fires the `confirm:complete` event

      Returns `true` if no function stops the chain and user chose yes; `false` otherwise.
      Attaching a handler to the element's `confirm` event that returns a `falsy` value cancels the confirmation dialog.
      Attaching a handler to the element's `confirm:complete` event that returns a `falsy` value makes this function
      return false. The `confirm:complete` event is fired whether or not the user answered true or false to the dialog.
   */
    allowAction: function(element) {
      var message = element.data('confirm'),
          answer = false, callback;
      if (!message) { return true; }

      if (rails.fire(element, 'confirm')) {
        answer = rails.confirm(message);
        callback = rails.fire(element, 'confirm:complete', [answer]);
      }
      return answer && callback;
    },

    // Helper function which checks for blank inputs in a form that match the specified CSS selector
    blankInputs: function(form, specifiedSelector, nonBlank) {
      var inputs = $(), input, valueToCheck,
          selector = specifiedSelector || 'input,textarea',
          allInputs = form.find(selector);

      allInputs.each(function() {
        input = $(this);
        valueToCheck = input.is('input[type=checkbox],input[type=radio]') ? input.is(':checked') : input.val();
        // If nonBlank and valueToCheck are both truthy, or nonBlank and valueToCheck are both falsey
        if (!valueToCheck === !nonBlank) {

          // Don't count unchecked required radio if other radio with same name is checked
          if (input.is('input[type=radio]') && allInputs.filter('input[type=radio]:checked[name="' + input.attr('name') + '"]').length) {
            return true; // Skip to next input
          }

          inputs = inputs.add(input);
        }
      });
      return inputs.length ? inputs : false;
    },

    // Helper function which checks for non-blank inputs in a form that match the specified CSS selector
    nonBlankInputs: function(form, specifiedSelector) {
      return rails.blankInputs(form, specifiedSelector, true); // true specifies nonBlank
    },

    // Helper function, needed to provide consistent behavior in IE
    stopEverything: function(e) {
      $(e.target).trigger('ujs:everythingStopped');
      e.stopImmediatePropagation();
      return false;
    },

    //  replace element's html with the 'data-disable-with' after storing original html
    //  and prevent clicking on it
    disableElement: function(element) {
      var replacement = element.data('disable-with');

      element.data('ujs:enable-with', element.html()); // store enabled state
      if (replacement !== undefined) {
        element.html(replacement);
      }

      element.bind('click.railsDisable', function(e) { // prevent further clicking
        return rails.stopEverything(e);
      });
    },

    // restore element to its original state which was disabled by 'disableElement' above
    enableElement: function(element) {
      if (element.data('ujs:enable-with') !== undefined) {
        element.html(element.data('ujs:enable-with')); // set to old enabled state
        element.removeData('ujs:enable-with'); // clean up cache
      }
      element.unbind('click.railsDisable'); // enable element
    }
  };

  if (rails.fire($document, 'rails:attachBindings')) {

    $.ajaxPrefilter(function(options, originalOptions, xhr){ if ( !options.crossDomain ) { rails.CSRFProtection(xhr); }});

    $document.delegate(rails.linkDisableSelector, 'ajax:complete', function() {
        rails.enableElement($(this));
    });

    $document.delegate(rails.buttonDisableSelector, 'ajax:complete', function() {
        rails.enableFormElement($(this));
    });

    $document.delegate(rails.linkClickSelector, 'click.rails', function(e) {
      var link = $(this), method = link.data('method'), data = link.data('params'), metaClick = e.metaKey || e.ctrlKey;
      if (!rails.allowAction(link)) return rails.stopEverything(e);

      if (!metaClick && link.is(rails.linkDisableSelector)) rails.disableElement(link);

      if (link.data('remote') !== undefined) {
        if (metaClick && (!method || method === 'GET') && !data) { return true; }

        var handleRemote = rails.handleRemote(link);
        // response from rails.handleRemote() will either be false or a deferred object promise.
        if (handleRemote === false) {
          rails.enableElement(link);
        } else {
          handleRemote.error( function() { rails.enableElement(link); } );
        }
        return false;

      } else if (link.data('method')) {
        rails.handleMethod(link);
        return false;
      }
    });

    $document.delegate(rails.buttonClickSelector, 'click.rails', function(e) {
      var button = $(this);
      if (!rails.allowAction(button)) return rails.stopEverything(e);

      if (button.is(rails.buttonDisableSelector)) rails.disableFormElement(button);

      var handleRemote = rails.handleRemote(button);
      // response from rails.handleRemote() will either be false or a deferred object promise.
      if (handleRemote === false) {
        rails.enableFormElement(button);
      } else {
        handleRemote.error( function() { rails.enableFormElement(button); } );
      }
      return false;
    });

    $document.delegate(rails.inputChangeSelector, 'change.rails', function(e) {
      var link = $(this);
      if (!rails.allowAction(link)) return rails.stopEverything(e);

      rails.handleRemote(link);
      return false;
    });

    $document.delegate(rails.formSubmitSelector, 'submit.rails', function(e) {
      var form = $(this),
        remote = form.data('remote') !== undefined,
        blankRequiredInputs,
        nonBlankFileInputs;

      if (!rails.allowAction(form)) return rails.stopEverything(e);

      // skip other logic when required values are missing or file upload is present
      if (form.attr('novalidate') == undefined) {
        blankRequiredInputs = rails.blankInputs(form, rails.requiredInputSelector);
        if (blankRequiredInputs && rails.fire(form, 'ajax:aborted:required', [blankRequiredInputs])) {
          return rails.stopEverything(e);
        }
      }

      if (remote) {
        nonBlankFileInputs = rails.nonBlankInputs(form, rails.fileInputSelector);
        if (nonBlankFileInputs) {
          // slight timeout so that the submit button gets properly serialized
          // (make it easy for event handler to serialize form without disabled values)
          setTimeout(function(){ rails.disableFormElements(form); }, 13);
          var aborted = rails.fire(form, 'ajax:aborted:file', [nonBlankFileInputs]);

          // re-enable form elements if event bindings return false (canceling normal form submission)
          if (!aborted) { setTimeout(function(){ rails.enableFormElements(form); }, 13); }

          return aborted;
        }

        rails.handleRemote(form);
        return false;

      } else {
        // slight timeout so that the submit button gets properly serialized
        setTimeout(function(){ rails.disableFormElements(form); }, 13);
      }
    });

    $document.delegate(rails.formInputClickSelector, 'click.rails', function(event) {
      var button = $(this);

      if (!rails.allowAction(button)) return rails.stopEverything(event);

      // register the pressed submit button
      var name = button.attr('name'),
        data = name ? {name:name, value:button.val()} : null;

      button.closest('form').data('ujs:submit-button', data);
    });

    $document.delegate(rails.formSubmitSelector, 'ajax:send.rails', function(event) {
      if (this == event.target) rails.disableFormElements($(this));
    });

    $document.delegate(rails.formSubmitSelector, 'ajax:complete.rails', function(event) {
      if (this == event.target) rails.enableFormElements($(this));
    });

    $(function(){
      rails.refreshCSRFTokens();
    });
  }

})( jQuery );

/**
*   @name                           Elastic
*   @descripton                     Elastic is jQuery plugin that grow and shrink your textareas automatically
*   @version                        1.6.11
*   @requires                       jQuery 1.2.6+
*
*   @author                         Jan Jarfalk
*   @author-email                   jan.jarfalk@unwrongest.com
*   @author-website                 http://www.unwrongest.com
*
*   @licence                        MIT License - http://www.opensource.org/licenses/mit-license.php
*/

(function($){ 
    "use strict";

    jQuery.fn.extend({  
        elastic: function() {
        
            //  We will create a div clone of the textarea
            //  by copying these attributes from the textarea to the div.
            var mimics = [
                'paddingTop',
                'paddingRight',
                'paddingBottom',
                'paddingLeft',
                'fontSize',
                'lineHeight',
                'fontFamily',
                'width',
                'fontWeight',
                'border-top-width',
                'border-right-width',
                'border-bottom-width',
                'border-left-width',
                'borderTopStyle',
                'borderTopColor',
                'borderRightStyle',
                'borderRightColor',
                'borderBottomStyle',
                'borderBottomColor',
                'borderLeftStyle',
                'borderLeftColor'
                ];
            
            return this.each( function() {

                // Elastic only works on textareas
                if ( this.type !== 'textarea' ) {
                    return false;
                }
                    
            var $textarea   = jQuery(this),
                $twin       = jQuery('<div />').css({
                    'position'      : 'absolute',
                    'display'       : 'none',
                    'word-wrap'     : 'break-word',
                    'white-space'   :'pre-wrap'
                }),
                lineHeight  = parseInt($textarea.css('line-height'),10) || parseInt($textarea.css('font-size'),'10'),
                minheight   = lineHeight,
                maxheight   = parseInt($textarea.css('max-height'),10) || Number.MAX_VALUE,
                goalheight  = 0;
                
                // Opera returns max-height of -1 if not set
                if (maxheight < 0) { maxheight = Number.MAX_VALUE; }
                    
                // Append the twin to the DOM
                // We are going to meassure the height of this, not the textarea.
                $twin.appendTo($textarea.parent());
                
                // Copy the essential styles (mimics) from the textarea to the twin
                var i = mimics.length;
                while(i--){
                    $twin.css(mimics[i].toString(),$textarea.css(mimics[i].toString()));
                }
                
                // Updates the width of the twin. (solution for textareas with widths in percent)
                function setTwinWidth(){
                    var curatedWidth = Math.floor(parseInt($textarea.width(),10));
                    if($twin.width() !== curatedWidth){
                        $twin.css({'width': curatedWidth + 'px'});
                        
                        // Update height of textarea
                        update(true);
                    }
                }
                
                // Sets a given height and overflow state on the textarea
                function setHeightAndOverflow(height, overflow){
                
                    var curratedHeight = Math.floor(parseInt(height,10));
                    if($textarea.height() !== curratedHeight){
                        $textarea.css({'height': curratedHeight + 'px','overflow':overflow});
                    }
                }
                
                // This function will update the height of the textarea if necessary 
                function update(forced) {
                    
                    // Get curated content from the textarea.
                    var textareaContent = $textarea.val().replace(/&/g,'&amp;').replace(/ {2}/g, '&nbsp;').replace(/<|>/g, '&gt;').replace(/\n/g, '<br />');
                    
                    // Compare curated content with curated twin.
                    var twinContent = $twin.html().replace(/<br>/ig,'<br />');
                    
                    if(forced || textareaContent+'&nbsp;' !== twinContent){
                    
                        // Add an extra white space so new rows are added when you are at the end of a row.
                        $twin.html(textareaContent+'&nbsp;');
                        
                        // Change textarea height if twin plus the height of one line differs more than 3 pixel from textarea height
                        if(Math.abs($twin.height() - $textarea.height()) > 3){
                            
                            var goalheight = $twin.height();
                            if(goalheight >= maxheight) {
                                setHeightAndOverflow(maxheight + 6,'auto');
                            } else if(goalheight <= minheight) {
                                setHeightAndOverflow(minheight + 6,'hidden');
                            } else {
                                setHeightAndOverflow(goalheight + 6,'hidden');
                            }
                            
                        }
                        
                    }
                    
                }
                
                // Hide scrollbars
                $textarea.css({'overflow':'hidden'});
                
                // Update textarea size on keyup, change, cut and paste
                $textarea.bind('keyup change cut paste', function(){
                    update(); 
                });
                
                // Update width of twin if browser or textarea is resized (solution for textareas with widths in percent)
                $(window).bind('resize', setTwinWidth);
                $textarea.bind('resize', setTwinWidth);
                $textarea.bind('update', update);
                
                // Compact textarea on blur
                // $textarea.bind('blur',function(){
                //     if($twin.height() < maxheight){
                //         if($twin.height() > minheight) {
                //             $textarea.height($twin.height());
                //         } else {
                //             $textarea.height(minheight);
                //         }
                //     }
                // });
                
                // And this line is to catch the browser paste event
                $textarea.bind('input paste',function(e){ setTimeout( update, 250); });             
                
                // Run update once when elastic is initialized
                update();
                
            });
            
        } 
    }); 
})(jQuery);
(function(window) {

  BM = window.BM || {};
  BM.helper = BM.helper || {};
  BM.helper.asset = BM.helper.asset || {};


  BM.tools.mixin(BM.helper.asset, {

    path: function (path) {
      if (path) {
        /*if (BM.config.isProduction()) {
         return 'https://bookmate.com' + path;
         } else {
         return path;
         }*/
        return path;
      }
      return '';
    }

  });

}(this));
(function(window, BM){

    BM = window.BM || {};
    BM.helper = BM.helper || {};
    BM.helper.braintree = BM.helper.braintree || {};


    BM.tools.mixin(BM.helper.braintree, {

        merchantId : function() {
            if (BM.helper.env.isProduction()) {
                return 'd8h943sx2q7g29mm';
            } else {
                return '8tz37b4jh2tfr9vf';
            }
        },

        braintreeDataEnvironment : function() {
            if (!BM.tools.isUndefined(window.BraintreeData)) {
                if (BM.helper.env.isProduction()) {
                    return BraintreeData.environments.production;
                } else {
                    return BraintreeData.environments.sandbox;
                }
            }
            return null;
        },

        deviceData : function() {
            var form, id, deviceData;
            if (!BM.tools.isUndefined(window.BraintreeData)) {
                form = document.createElement('form');
                id = 'braintree-devide-data-form-dummy-' + parseInt(Math.random() * 1000000, 10);
                form.id = id;
                document.body.appendChild(form);
                BraintreeData.setup(BM.helper.braintree.merchantId(), id, BM.helper.braintree.braintreeDataEnvironment());
                deviceData = form.querySelector('#device_data').getAttribute('value');
                try {
                    return JSON.parse(deviceData);
                } catch (e) {
                    return deviceData;
                }
            }
            return null;
        }

    });


}(this, this.BM));
(function(window, BM){

  BM = window.BM || {};
  BM.helper = BM.helper || {};
  BM.helper.browser = BM.helper.browser || {};


  BM.tools.mixin(BM.helper.browser, {

    triggerRerender : function() {
      try {
        document.body.offsetHeight = document.body.offsetHeight;
      } catch (e) {}
    }

  });

}(this, this.BM));
(function(window, BM){

    BM = window.BM || {};
    BM.helper = BM.helper || {};
    BM.helper.country = BM.helper.country || {};


    BM.tools.mixin(BM.helper.country, {

        isSingapore : function() {
            return !BM.tools.isNull(BM.config.mainConfig.country) && BM.config.mainConfig.country === 'sg';
        },

        isEstonia : function() {
            return !BM.tools.isNull(BM.config.mainConfig.country) && BM.config.mainConfig.country === 'ee';
        }

    });


}(this, this.BM));
(function(window, BM){

  BM = window.BM || {};
  BM.helper = BM.helper || {};
  BM.helper.data = BM.helper.data || {};


  BM.tools.mixin(BM.helper.data, {
    isValidUUID : function(uuid) {
      if (BM.tools.isString(uuid)) {
        if (uuid.length < 6 || uuid.length > 10) {
          return false;
        }
        if (['recent', 'all', 'finished', 'not_finished', 'uploads', 'quotes'].indexOf(uuid) !== -1) {
          return false;
        }
        return true;
      }
      return false;
    }
  });


}(this, this.BM));

(function(window, BM){

    BM = window.BM || {};
    BM.helper = BM.helper || {};
    BM.helper.env = BM.helper.env || {};


    BM.tools.mixin(BM.helper.env, {

        isStaging : function() {
            return BM.config.mainConfig.environment === 'staging';
        },

        isDevelopment : function() {
            return BM.config.mainConfig.environment === 'development';
        },

        isProduction : function() {
            return BM.config.mainConfig.environment === 'production';
        },

        getEnvironment : function() {
            return BM.config.mainConfig.environment;
        }

    });


}(this, this.BM));
(function(window, $, BM){

    BM = window.BM || {};
    BM.helper = BM.helper || {};
    BM.helper.event = BM.helper.event || {};

    var clickEventName = BM.tools.client.isTouch() ? 'tap' : 'click';

    BM.tools.mixin(BM.helper.event, {

        clickName : function() {
            return clickEventName;
        },

        isMouseLeftClick : function(event) {
            if (!BM.tools.isUndefined(event) && BM.tools.isNumber(event.which)) {
                return event.which === 1;
            }
        },

        isMouseMiddleClick : function(event) {
            if (!BM.tools.isUndefined(event) && BM.tools.isNumber(event.which)) {
                return event.which === 2;
            }
        },

        isMouseRightClick : function(event) {
            if (!BM.tools.isUndefined(event) && BM.tools.isNumber(event.which)) {
                return event.which === 3;
            }
        },

        isClickWithCtrl : function(event) {
            if (!BM.tools.isUndefined(event)) {
                if ( (!BM.tools.isUndefined(event.ctrlKey) && event.ctrlKey === true) || (!BM.tools.isUndefined(event.metaKey) && event.metaKey === true) ) {
                    return true;
                }
            }
            return false;
        },

        isSimpleMouseLeftClick : function(event) {
          return BM.helper.event.isMouseLeftClick(event) && !BM.helper.event.isClickWithCtrl(event);
        }

    });

}(this, this.jQuery, this.BM));
(function(window, BM){

    BM = window.BM || {};
    BM.helper = BM.helper || {};
    BM.helper.history = BM.helper.history || {};


    BM.tools.mixin(BM.helper.history, {

        getPopupQuoteState : function(login, uuid) {
            return {
                type  : 'popupQuote',
                uuid  : uuid,
                login : login
            };
        }

    });


}(this, this.BM));
(function (window, BM) {

  BM = window.BM || {};
  BM.helper = BM.helper || {};
  BM.helper.link = BM.helper.link || {};


  BM.tools.mixin(BM.helper.link, {

    book: function (bookUuid) {
      return '/books/' + bookUuid;
    },

    quote: function (quoteUuid, userLogin) {
      if (BM.tools.isUndefined(userLogin)) {
        userLogin = BM.user.getLogin();
      }
      return '/' + userLogin + '/quotes/' + quoteUuid;
    },

    userQuotes: function (userLogin) {
      return '/' + userLogin + '/quotes';
    },

    libraryCard : function(login, uuid) {
      return '/' + login + '/' + uuid;
    },

    toAbsolute: function (link) {
      if (!BM.tools.isString(link)) {
        return null;
      }
      if (link.slice(0, 4) !== 'http') {
        if (link[0] !== '/' || link[0] !== '\\') {
          link = '/' + link;
        }
        link = window.location.origin + link;
      }
      return link;
    },

    appendParam: function (link, params) {
      if (!BM.tools.isString(link) && !BM.tools.isPresent(params)) {
        return link;
      }
      if (BM.tools.isString(params)) {
        if (params[0] === '&' || params[0] === '?') {
          params = params.slice(1);
        }
      }

      if (BM.tools.isObject(params)) {
        params = window.jQuery.param(params);
      }

      if (link.indexOf('?') !== -1) {
        link += '&' + params;
      } else {
        link += '?' + params;
      }

      return link;
    }

  });

}(this, this.BM));
(function(window, BM){

  BM = window.BM || {};
  BM.helper = BM.helper || {};
  BM.helper.page = BM.helper.page || {};


  BM.tools.mixin(BM.helper.page, {

    isMyRecentPage : function() {
      return window.location.pathname === '/' + BM.user.getLogin() + '/recent';
    },

    isOthersRecentPage : function() {
      return (window.location.pathname === '/' + BM.user.getViewingUserLogin() + '/recent') && BM.user.getLogin() !== BM.user.getViewingUserLogin();
    }

  });

}(this, this.BM));
(function(window, BM){

  BM = window.BM || {};
  BM.helper = BM.helper || {};
  BM.helper.pageTitle = BM.helper.pageTitle || {};

  var initialTitle = document.title,
      titles = [initialTitle],
      helper = BM.helper.pageTitle;

  var template = null,
      preloadTemplate = function() {
        if (BM.tools.isNull(template)) {
          template = $($('#bm-page-titles-container').html());
        }
      };

  BM.tools.mixin(helper, {

    push : function(title) {
      if (BM.tools.isString(title)) {
        titles.push(title);
        document.title = title;
      }
    },

    pop : function() {
      if (titles.length <= 1) {
        return titles[0];
      }
      var title = titles.pop();
      document.title = titles[titles.length - 1];
      return title;
    },

    reset : function() {
        if (titles.length > 0) {
          document.title = titles[0];
          titles.length = 0;
          titles = [initialTitle];
        }
    },

    getQuotePageTitle : function(bookTitle) {
      preloadTemplate();
      window.t = template;
      return template.find('@bm-quote-page-title').data('content').replace('%{quote_source}', BM.helper.text.sliceBookTitle(bookTitle, 150));
    },

    pushQuotePageTitle : function(bookTitle) {
        helper.push(helper.getQuotePageTitle(bookTitle));
    },

    getBookPageTitle : function(bookTitle) {
      preloadTemplate();
      return template.find('@bm-book-page-title').data('content').replace('%{book_title}', BM.helper.text.sliceBookTitle(bookTitle, 150));
    },

    pushBookPageTitle : function(bookTitle) {
      helper.push(helper.getBookPageTitle(bookTitle));
    }

  });

}(this, this.BM));
(function(window, BM, $, radio, modules){

    BM = window.BM || {};
    BM.helper = BM.helper || {};
    BM.helper.subscription = {};

    modules.require(['basePubSub', 'extend'], function(PubSub, extend){

        BM.helper.subscription = new PubSub();

        var productLevels = null,

            _getPrice = function(options) {
                var result = null;
                productLevels.forEach(function(method) {
                    method['levels'].forEach(function(level){
                        level['products'].forEach(function(product){
                            //if (level === options)
                            if (method['payment_system'] === options.paymentMethod &&
                                level['kind'] === options.kind &&
                                product['duration'] === options.duration) {

                                if (options.withCurrency) {
                                    result = _formatPriceWithCurrency(product['price']);
                                } else {
                                    result = _parsePrice(product['price']);
                                }
                            }
                        });
                    });
                });
                return result;
            },

            _formatToEUR = function(price) {
                return '€' + price;
            },

            _formatToUSD = function(price) {
                return '$' + price;
            },

            _formatToRUB = function(price) {
                if (BM.user.isLocaleRu()) {
                    return price + ' р.';
                } else {
                    return price + ' rub.';
                }
            },

            _formatToSGD = function(price) {
                return price + ' SGD';
            },

            _formatToGBP = function(price) {
                return '£' + price;
            },

            _formatPriceWithCurrency = function(price, discount) {
                if (BM.tools.isNull(price)) {
                    return;
                }
                if (_isPriceInRub(price)) {
                    return _formatToRUB(_parsePrice(price, false, discount));
                }
                if (_isPriceInUsd(price)) {
                    return _formatToUSD(_parsePrice(price, true, discount));
                }
                if (_isPriceInSgd(price)) {
                    return  _formatToSGD(_parsePrice(price, true, discount));
                }
                if (_isPriceInEur(price)) {
                    return _formatToEUR(_parsePrice(price, true, discount));
                }
                if (_isPriceInGBP(price)) {
                    return _formatToGBP(_parsePrice(price, true, discount));
                }

            },

            _getCurrency = function(price) {
                if (BM.tools.isUndefined(price) || BM.tools.isNull(price)) {
                    return;
                }
                if (_isPriceInRub(price)) {
                    return 'RUB';
                }
                if (_isPriceInUsd(price)) {
                    return 'USD';
                }
                if (_isPriceInSgd(price)) {
                    return 'SGD';
                }
                if (_isPriceInEur(price)) {
                    return 'EUR';
                }
                if (_isPriceInGBP(price)) {
                    return 'GBP';
                }
            },

            _toCurrency = function(price, currency) {
                if (BM.tools.isNull(price)) {
                    return;
                }
                if (currency === 'RUB') {
                    return _formatToRUB(price);
                }
                if (currency === 'USD') {
                    return _formatToUSD(price);
                }
                if (currency === 'SGD') {
                    return  _formatToSGD(price);
                }
                if (currency === 'EUR') {
                    return _formatToEUR(price);
                }
                if (currency === 'GBP') {
                    return _formatToGBP(price);
                }
            },

            _isPriceInRub = function(price) {
                if (!BM.tools.isNull(price)) {
                    return price.indexOf('RUB') !== -1 || price.indexOf('р.') !== -1 || price.indexOf('rub.') !== -1;
                }
            },

            _isPriceInUsd = function(price) {
                if (!BM.tools.isNull(price)) {
                    return price.indexOf('$') !== -1 || price.indexOf('USD') !== -1;
                }
            },

            _isPriceInSgd = function(price) {
                if (!BM.tools.isNull(price)) {
                    return price.indexOf('SGD') !== -1;
                }
            },

            _parsePrice = function(price, float, discount) {
                if (!BM.tools.isNull(price)) {
                    price = parseFloat(price.replace(/[a-z $]/ig, ''));

                    if (discount) {
                      price = price - price / 100 * discount;
                    }

                    return float ? Math.ceil(price * 100) / 100 : Math.ceil(price);

                    /*if (float) {
                        return parseFloat(price.replace(/[a-z $]/ig, ''));
                    } else {
                        return parseInt(price.replace(/[a-z $]/ig, ''), 10);
                    }*/
                }
            },

            _isPriceInEur = function(price) {
                if (!BM.tools.isNull(price)) {
                    return price.indexOf('€') !== -1 || price.indexOf('EUR') !== -1;
                }
            },

            _isPriceInGBP = function(price) {
                if (!BM.tools.isNull(price)) {
                    return price.indexOf('£') !== -1 || price.indexOf('GBP') !== -1;
                }
            };


        BM.tools.mixin(BM.helper.subscription, {

            fetchPrices : function() {
                var callbackSuccess, callbackError, forced;

                if (!BM.tools.isFunction(arguments[0])) {
                    return;
                } else {
                    callbackSuccess = arguments[0];

                    if (BM.tools.isFunction(arguments[1])) {
                        callbackError = arguments[1];
                    } else {
                        forced = arguments[1];
                    }
                }


                if (!BM.tools.isNull(productLevels) && forced !== true) {
                    callbackSuccess(productLevels);
                    return;
                }

                var me   = this,
                    requestUrl = '/a/4/billing/web/product_levels.json';

                if (BM.user.getSubscriptionCoutryCode()) {
                    requestUrl += '?subscription_country=' + BM.user.getSubscriptionCoutryCode();
                }


                $.ajax({
                    url: requestUrl,
                    type: 'get',
                    dataType: 'json',
                    success : function(data) {
                        productLevels = data;
                        BM.helper.subscription._notify('prices-fetched');
                        if (BM.tools.isFunction(callbackSuccess)) {
                            callbackSuccess(data);
                        }
                    },
                    error : function() {
                        if (callbackError) {
                            callbackError();
                        }
                    }
                });
            },

            getPrice : function(kind, duration, options) {
                var paymentMethod = 'visa',
                    withCurrency = true,
                    result = null,
                    keepFloats = false,
                    discount = 0;

                if (!kind || !duration) {
                    return null;
                }

                if (!BM.tools.isUndefined(options)) {
                    if (!BM.tools.isUndefined(options.paymentMethod)) {
                        paymentMethod = options.paymentMethod;
                    }
                    if (!BM.tools.isUndefined(options.withCurrency)) {
                        withCurrency = options.withCurrency;
                    }
                    if (!BM.tools.isUndefined(options.keepFloats)) {
                        keepFloats = options.keepFloats;
                    }
                    if (!BM.tools.isUndefined(options.discount) && BM.tools.isNumber(options.discount)) {
                        discount = options.discount;
                    }
                }

                productLevels.forEach(function(method) {
                    method['levels'].forEach(function(level){
                        level['products'].forEach(function(product){
                            //if (level === options)
                            if (method['payment_system'] === paymentMethod && level['kind'] === kind && product['duration'] === duration) {
                                if (withCurrency) {
                                    result = _formatPriceWithCurrency(product['price'], discount);
                                } else {
                                    result = _parsePrice(product['price'], keepFloats, discount);
                                }
                            }
                        });
                    });
                });

                return result;

            },

            toCurrency : function(price, currency) {
                return _toCurrency(price, currency);
            },

            getCurrency : function(price) {
                return _getCurrency(price);
            },

            getPriceAsInt : function(kind, duration, options) {
                options = options || {};
                options.withCurrency = false;
                return BM.helper.subscription.getPrice(kind, duration, options);
            }

        });


        radio('bm-product-levels-update').subscribe(function(data){
            productLevels = data;
            BM.helper.subscription._notify('prices-fetched');
        });

    });


}(this, this.BM, this.jQuery, this.radio, this.modules));

(function(window, BM){

  BM = window.BM || {};
  BM.helper = BM.helper || {};
  BM.helper.text = BM.helper.text || {};


  BM.tools.mixin(BM.helper.text, {

    slice : function(text, maxLength, options) {
      var dots = false,
          tmp;

      if (!BM.tools.isUndefined(options)) {
        if (!BM.tools.isUndefined(options.dots)) {
          dots = options.dots;
        }
      }

      if (BM.tools.isString(text) && BM.tools.isNumber(maxLength)) {
        text = text.trim();
        if (text.length <= maxLength) {
          return text;
        }
        text = text.slice(0, maxLength);
        if (text.lastIndexOf(' ') !== -1) {
          text = text.slice(0, text.lastIndexOf(' '));
          tmp = text.split(' ');
          if (tmp[tmp.length - 1].length < 3) {
            tmp.splice(tmp.length - 1, 1);
          }
          tmp[tmp.length - 1] = '...';
          text = tmp.join(' ');
        } else {
          if (dots) {
            text = text.slice(0, text.length - 3) + '...';
          }
        }
      }
      return text;
    },

    sliceBookTitle : function(bookTitle, maxLength) {
      if (BM.tools.isString(bookTitle) && !BM.tools.isNull(maxLength)) {
        if (bookTitle.length > maxLength) {
          if (bookTitle[0] === '(' && bookTitle[bookTitle.length - 1] === ')') {
            bookTitle = bookTitle.slice(1, bookTitle.length - 1);
          }
          bookTitle = bookTitle.replace(/ ?\([^)]+\) ?/ig, ' ');

          if (bookTitle.length <= maxLength) {
            return bookTitle;
          }

          bookTitle = bookTitle.trim().slice(0, maxLength);

          if (bookTitle[0] === '(') {
            bookTitle = bookTitle.slice(1, bookTitle.length);
          }

          if (bookTitle.indexOf('.') !== -1) {
            bookTitle.lastIndexOf('.');
            bookTitle = bookTitle.slice(0, bookTitle.lastIndexOf('.'));
          } else if (bookTitle.indexOf(':') !== -1) {
            bookTitle = bookTitle.slice(0, bookTitle.lastIndexOf(':'));
          } else {
            bookTitle = bookTitle.split(' ');
            if (bookTitle[bookTitle.length - 1].length >= 3) {
              bookTitle[bookTitle.length - 1] = '...';
            } else {
              bookTitle.splice(bookTitle.length - 1, 1);
              bookTitle[bookTitle.length - 1] = '...';
            }
            bookTitle = bookTitle.join(' ');
          }
          return bookTitle;

        } else {
          return bookTitle;
        }
      }
      return bookTitle;
    }

  });


}(this, this.BM));
(function(window, BM, twemoji) {

  BM = window.BM || {};
  BM.lib = BM.lib || {};
  BM.lib.emoji = {};

  var emojiSupported = (function() {
      var node = document.createElement('canvas');
      if (!node.getContext || !node.getContext('2d') ||
        typeof node.getContext('2d').fillText !== 'function')
        return false;
      var ctx = node.getContext('2d');
      ctx.textBaseline = 'top';
      ctx.font = '32px Arial';
      ctx.fillText('\ud83d\ude03', 0, 0);
      return ctx.getImageData(16, 16, 1, 1).data[0] !== 0;
    }());


  BM.tools.mixin(BM.lib.emoji, {

    supported : function() {
      return emojiSupported;
    },

    replace : function(obj, force) {
      if (!BM.tools.isPresent(obj)) {
        return;
      }
      if (BM.lib.emoji.supported() && force !== true) {
        return;
      }

      if (BM.tools.isString(obj)) {
        return twemoji.parse(obj);
      } else if (BM.tools.isPresent(window.jQuery) && BM.tools.isInstanceOf(obj, window.jQuery)) {
        obj.html(twemoji.parse(obj.html()));
      } else if (BM.tools.isInstanceOf(obj, window.HTMLElement)) {
        obj.innerHTML = twemoji.parse(obj.innerHTML);
      }
    }

  });

}(this, this.BM, this.twemoji));
/**
 * @param       {Object}    window      Ссылка на window
 * @param       {Object}    document    Ссылка на document
 */
(function ( window, document ) {
    if ( Array.prototype.forEach ) {
        return;
    }
    
    Array.prototype.forEach = function( fn, scope ) {
        var
            i;
        // end of vars

        for ( i = 0, len = this.length; i < len; ++i ) {
            if (i in this) {
                fn.call(scope, this[i], i, this);
            }
        }
    };

}(
    this,
    this.document
));
(function(window, modules, $, BM){

  modules.define('RouterWeb',
  [
    'extend',
    'basePubSub',
    'popupBaseClass',
    'ampersandRouter',
    'ampersandState'
  ],
  function(
    provide,
    extend,
    PubSub,
    PopupBase,
    ARouter,
    AState
  ){

    var RouterWeb = extend(PubSub),

        $class = RouterWeb,
        $super = $class.superclass,

        $window = $(window);

    BM.tools.mixin($class.prototype, {

      initialize : function(config) {
        $super.initialize.apply(this, arguments);

        this._router                      = null;
        this._state                       = null;
        this._lastData                    = null;
        this._initialLocation             = window.location.pathname;
        this._initialTitle                = window.document.title;

        this._popupQuoteClass             = null;
        this._popupQuoteHandler           = null;
        this._popupDocumentClass          = null;
        this._popupDocumentHandler        = null;

        this._initRouter();
        this._initState();
        this._setupEvents();

        this._init();
      },

      _initRouter : function() {
        var self = this;
        this._router = new (ARouter.extend({
          routes: {
            ':login/quotes/:uuid': 'quote',
            'books/:uuid': "books",
            ':login/:uuid': 'libraryCard',
            '*other': 'other'
          },

          quote : function(login, uuid) {
            self._onQuoteRoute.apply(self, arguments);
          },

          books: function(uuid) {
            self._onBooksRoute.apply(self, arguments);
          },

          libraryCard : function(login, uuid) {
            self._onLibraryCardRoute.apply(self, arguments);
          },

          other: function() {
            self._onOtherRoute.apply(self, arguments);
          }
        }))();
      },

      _beforeRoute : function() {
        if (PopupBase.anyVisible()) {
          PopupBase.enableHistoryControls();
          PopupBase.hideAll(true);
        }
      },

      _onQuoteRoute : function(login, uuid) {
        this._beforeRoute();
        if (!this._isInitialUrl()) {
          this._showPopupQuote({
            uuid: uuid
          });
        }
      },

      _onBooksRoute : function(uuid) {
        this._beforeRoute();
        if (!this._isInitialUrl()) {
          this._showPopupDocument({
            book: {
              uuid: uuid
            }
          });
        }
      },

      _onLibraryCardRoute : function(login, uuid) {
        if (this._isLCLoginRegistered(login) && BM.helper.data.isValidUUID(uuid)) {
          this._showPopupDocument({
            libraryCard: {
              uuid: uuid
            }
          });
        } else {
          this._onOtherRoute();
        }
      },

      _onOtherRoute : function() {
        this._clear();
      },

      _registerLibraryCardLogin : function(login) {
        var logins = this._getRegisteredLCLogins();
        if (logins.indexOf(login) === -1) {
          logins.push(login);
        }
        this._setRegisteredLCLogins(logins);
      },

      _isLCLoginRegistered : function(login) {
        var logins = this._getRegisteredLCLogins();
        return logins.indexOf(login) !== -1;
      },

      _getRegisteredLCLogins : function() {
        if (!window.localStorage.getItem('registredLCLogins')) {
          this._setRegisteredLCLogins([]);
        }
        return JSON.parse(window.localStorage.getItem('registredLCLogins'));
      },

      _setRegisteredLCLogins : function(logins) {
        window.localStorage.setItem('registredLCLogins', JSON.stringify(logins));
      },

      _isInitialUrl : function() {
        return window.location.pathname === this._initialLocation;
      },

      getInitialLocation : function() {
        return this._initialLocation;
      },

      _showPopupDocument : function(config) {
        var self = this;

        if (BM.tools.isNull(this._popupDocumentClass)) {
          modules.require('DocumentPopup', function(PopupDocument) {
            self._popupDocumentClass = PopupDocument;
            self._initPopupDocument(config);
            self._popupDocumentHandler.openModal(config);
          });
        } else {
          this._initPopupDocument(config);
          this._popupDocumentHandler.openModal(config);
        }
      },

      _initPopupDocument : function(config) {
        this._destroyPopupDocument();
        this._popupDocumentHandler = new this._popupDocumentClass(config);
        this._popupDocumentHandler.on('fetch-success', function(data) {
          this._onPopupDocumentFetched(data);
        }.bind(this));
        this._popupDocumentHandler.on('hide', function() {
          this._onPopupHide();
        }.bind(this));
        this._popupDocumentHandler.on('history-back-click', function() {
          this._onPopupHistoryBackClick();
        }.bind(this));
      },

      _onPopupDocumentFetched : function(data) {
        try {
          BM.helper.pageTitle.pushBookPageTitle(data.title);
        } catch (e) {}

      },

      _destroyPopupDocument : function() {
        if (!BM.tools.isNull(this._popupDocumentHandler) && (BM.tools.isInstanceOf(this._popupDocumentHandler, this._popupDocumentClass))) {
          this._popupDocumentHandler.destroy();
          this._popupDocumentHandler = null;
        }
      },

      _showPopupQuote : function(config) {
        var self = this;

        if (BM.tools.isNull(this._popupQuoteClass)) {
          modules.require('modulePopupQuote', function(PopupQuote) {
            self._popupQuoteClass = PopupQuote;
            self._initPopupQuote(config);
            self._popupQuoteHandler.show();
          });
        } else {
          this._initPopupQuote(config);
          this._popupQuoteHandler.show();
        }
      },

      _initPopupQuote : function(config) {
        this._destroyPopupQuote();
        this._popupQuoteHandler = new this._popupQuoteClass(config);
        this._popupQuoteHandler.on('fetched', function(data) {
          this._onPopupQuoteFetched(data);
        }.bind(this));
        this._popupQuoteHandler.on('hide', function() {
          this._onPopupHide();
        }.bind(this));
        this._popupQuoteHandler.on('button-back-click', function() {
          this._onPopupHistoryBackClick();
        }.bind(this));
      },

      _destroyPopupQuote : function() {
        if (!BM.tools.isNull(this._popupQuoteHandler) && (BM.tools.isInstanceOf(this._popupQuoteHandler, this._popupQuoteClass))) {
          this._popupQuoteHandler.destroy();
          this._popupQuoteHandler = null;
        }
      },

      _onPopupQuoteFetched : function(data) {
        try {
          BM.helper.pageTitle.pushQuotePageTitle(data.document.title);
        } catch (e) {}
      },

      _onPopupHide : function() {
        this._clearStateObject();

        BM.helper.pageTitle.reset();
        this.navigate(this._initialLocation, {trigger: true, state: null});
        PopupBase.hideAll(true);

      },

      _onPopupHistoryBackClick : function() {

        this.back();
      },

      /*back: function() {
          window.history.back();
          this._state.configHistory.pop();
      },*/

      _unbindAll : function() {
        if (!BM.tools.isNull(this._popupQuoteHandler)) {
          this._popupQuoteHandler.off('hide');
        }
        if (!BM.tools.isNull(this._popupDocumentHandler)) {
          this._popupDocumentHandler.off('hide');
        }
      },

      _initState : function() {
        var me = this,
          State = AState.extend({
          props: {
            config: 'object',
            configHistory: 'array'
          }
        });
        this._state = new State({
          config: {},
          configHistory: []
        });

        this._state.on('change', function() {
          me._onStateChange();
        });
      },

      _setupEvents : function() {
        var self = this;
        PopupBase.dispatcher.on('stop-history-request', function() {
            self._onStopHistoryRequest();
        });
      },

      _onStopHistoryRequest : function() {
        this.back();
        this.stop();
      },

      _onStateChange : function() {
        this._state.configHistory.push(this._state.config);

        switch (this._state.config.type) {
          case 'popup-quote':
            this._onPopupQuoteStateChange();
            break;

          case 'popup-document':
            this._onPopupDocumentStateChange();
            break;
        }
      },

      _clear : function() {
        this._unbindAll();
        this._clearStateObject();

        PopupBase.hideAll(true);
        PopupBase.disableHistoryControls();

        if (this._isInitialUrl()) {
          BM.helper.pageTitle.reset();
        }
      },

      _clearStateObject : function() {
        if (BM.tools.isPresent(this._state)) {
          this._state.set('config', {}, {silent: true});
        }
      },

      _onPopupQuoteStateChange : function() {
        if (this._state.config.data.uuid && this._state.config.data.login) {
          this.navigateToQuotePage(
            this._state.config.data.uuid,
            this._state.config.data.login
          );
        }
      },

      _onPopupDocumentStateChange : function() {
        if (!BM.tools.isUndefined(this._state.config.data.bookUuid) && !BM.tools.isUndefined(this._state.config.data.documentUuid)) {
          this.navigateToBookPage(
            this._state.config.data.bookUuid
          );
        }
      },

      _init : function() {
        try {
          this._router.history.start({
            pushState: true,
            silent: true
          });
        } catch (e) {

        }
      },

      stop : function() {
        if (!BM.tools.isNull(this._router)) {
          try {
            this._router.history.stop();
          } catch (e) {}
        }
      },

      back : function() {
        /*var config;
        if (this._state.configHistory.length > 0) {
          config = this._state.configHistory.pop();
          this._state.set('config', config, { silent: true });
          window.history.back();
        } else {
          this.navigate(this._initialLocation);
        }*/
        if (this._isInitialUrl()) {
          BM.helper.pageTitle.reset();
        } else {
          BM.helper.pageTitle.pop();
        }
        window.history.back();
      },

      navigateToQuotePage : function(uuid, login) {
        return this.navigate(
          BM.helper.link.quote(uuid, login)
        );
      },

      navigateToBookPage : function(bookUuid) {
        return this.navigate(
          BM.helper.link.book(bookUuid)
        );
      },

      navigateToLibraryCardPage : function(login, uuid) {
        if (BM.helper.data.isValidUUID(uuid)) {
          this._registerLibraryCardLogin(login);
          return this.navigate(
            BM.helper.link.libraryCard(login, uuid)
          );
        }
      },

      navigate : function(url, options) {
        var trigger = true,
            state   = undefined,
            data    = {};

        if (!BM.tools.isUndefined(options)) {
          if (!BM.tools.isUndefined(options.trigger)) {
            trigger = options.trigger;
          }
          if (!BM.tools.isUndefined(options.data)) {
            data = options.data;
            if (!BM.tools.isNull(this._lastData) && BM.tools.isObject(this._lastData.modal)) {
              this._lastData.modal.off('hide');
              this._lastData = null;
            }
            this._lastData = data;
          }
          if (!BM.tools.isUndefined(options.state)) {
            state = options.state;
          }
        }

        if (!BM.tools.isNull(this._router)) {
          this._router.navigate(url, {
            trigger: trigger,
            state: state
          });
        }
      },

      getState : function() {
        return this._state;
      },

      setState : function(data) {
        if (!BM.tools.isNull(this._state)) {
          this._state.set('config', data);
        }
      },

      getRouter : function() {
        return this._router;
      },

      pushStatePopupQuote : function(config, options) {
        /*if (!BM.tools.isUndefined(options))  {
          if (!BM.tools.isUndefined(options.context)) {
            this._lastMixpanelContext = options.context;
          }
        }*/
        if (!BM.tools.isUndefined(config)) {
          this._state.set('config', {
            type: 'popup-quote',
            data: config
          });
        }
      },

      pushStatePopupDocument : function(config, options) {
        if (!BM.tools.isUndefined(options))  {
          if (!BM.tools.isUndefined(options.context)) {
            this._lastMixpanelContext = options.context;
          }
        }
        if (!BM.tools.isUndefined(config)) {
          this._state.set('config', {
            type: 'popup-document',
            data: config
          });
        }
      },

      _pushConfigHistory : function() {

      },

      getInitialLocation : function() {
        return this._initialLocation;
      }

    });

    var routerWebInstance = new RouterWeb();

    $window.on('popstate', function(event) {
      if (BM.tools.isNull(event.originalEvent.state)) {
        if (window.location.pathname !== routerWebInstance.getInitialLocation()) {
          window.location.reload();
        }
      } else {
        /*routerWebInstance.navigate(event);*/
        //routerWebInstance.navigate(window.location.pathname);

        BM.helper.pageTitle.pop();
      }
    });

    provide(routerWebInstance);
  });

}(this, this.modules, this.jQuery, this.BM));

/*! selectize.js - v0.11.2 | https://github.com/brianreavis/selectize.js | Apache License (v2) */
!function(a,b){"function"==typeof define&&define.amd?define("sifter",b):"object"==typeof exports?module.exports=b():a.Sifter=b()}(this,function(){var a=function(a,b){this.items=a,this.settings=b||{diacritics:!0}};a.prototype.tokenize=function(a){if(a=d(String(a||"").toLowerCase()),!a||!a.length)return[];var b,c,f,h,i=[],j=a.split(/ +/);for(b=0,c=j.length;c>b;b++){if(f=e(j[b]),this.settings.diacritics)for(h in g)g.hasOwnProperty(h)&&(f=f.replace(new RegExp(h,"g"),g[h]));i.push({string:j[b],regex:new RegExp(f,"i")})}return i},a.prototype.iterator=function(a,b){var c;c=f(a)?Array.prototype.forEach||function(a){for(var b=0,c=this.length;c>b;b++)a(this[b],b,this)}:function(a){for(var b in this)this.hasOwnProperty(b)&&a(this[b],b,this)},c.apply(a,[b])},a.prototype.getScoreFunction=function(a,b){var c,d,e,f;c=this,a=c.prepareSearch(a,b),e=a.tokens,d=a.options.fields,f=e.length;var g=function(a,b){var c,d;return a?(a=String(a||""),d=a.search(b.regex),-1===d?0:(c=b.string.length/a.length,0===d&&(c+=.5),c)):0},h=function(){var a=d.length;return a?1===a?function(a,b){return g(b[d[0]],a)}:function(b,c){for(var e=0,f=0;a>e;e++)f+=g(c[d[e]],b);return f/a}:function(){return 0}}();return f?1===f?function(a){return h(e[0],a)}:"and"===a.options.conjunction?function(a){for(var b,c=0,d=0;f>c;c++){if(b=h(e[c],a),0>=b)return 0;d+=b}return d/f}:function(a){for(var b=0,c=0;f>b;b++)c+=h(e[b],a);return c/f}:function(){return 0}},a.prototype.getSortFunction=function(a,c){var d,e,f,g,h,i,j,k,l,m,n;if(f=this,a=f.prepareSearch(a,c),n=!a.query&&c.sort_empty||c.sort,l=function(a,b){return"$score"===a?b.score:f.items[b.id][a]},h=[],n)for(d=0,e=n.length;e>d;d++)(a.query||"$score"!==n[d].field)&&h.push(n[d]);if(a.query){for(m=!0,d=0,e=h.length;e>d;d++)if("$score"===h[d].field){m=!1;break}m&&h.unshift({field:"$score",direction:"desc"})}else for(d=0,e=h.length;e>d;d++)if("$score"===h[d].field){h.splice(d,1);break}for(k=[],d=0,e=h.length;e>d;d++)k.push("desc"===h[d].direction?-1:1);return i=h.length,i?1===i?(g=h[0].field,j=k[0],function(a,c){return j*b(l(g,a),l(g,c))}):function(a,c){var d,e,f;for(d=0;i>d;d++)if(f=h[d].field,e=k[d]*b(l(f,a),l(f,c)))return e;return 0}:null},a.prototype.prepareSearch=function(a,b){if("object"==typeof a)return a;b=c({},b);var d=b.fields,e=b.sort,g=b.sort_empty;return d&&!f(d)&&(b.fields=[d]),e&&!f(e)&&(b.sort=[e]),g&&!f(g)&&(b.sort_empty=[g]),{options:b,query:String(a||"").toLowerCase(),tokens:this.tokenize(a),total:0,items:[]}},a.prototype.search=function(a,b){var c,d,e,f,g=this;return d=this.prepareSearch(a,b),b=d.options,a=d.query,f=b.score||g.getScoreFunction(d),a.length?g.iterator(g.items,function(a,e){c=f(a),(b.filter===!1||c>0)&&d.items.push({score:c,id:e})}):g.iterator(g.items,function(a,b){d.items.push({score:1,id:b})}),e=g.getSortFunction(d,b),e&&d.items.sort(e),d.total=d.items.length,"number"==typeof b.limit&&(d.items=d.items.slice(0,b.limit)),d};var b=function(a,b){return"number"==typeof a&&"number"==typeof b?a>b?1:b>a?-1:0:(a=String(a||"").toLowerCase(),b=String(b||"").toLowerCase(),a>b?1:b>a?-1:0)},c=function(a){var b,c,d,e;for(b=1,c=arguments.length;c>b;b++)if(e=arguments[b])for(d in e)e.hasOwnProperty(d)&&(a[d]=e[d]);return a},d=function(a){return(a+"").replace(/^\s+|\s+$|/g,"")},e=function(a){return(a+"").replace(/([.?*+^$[\]\\(){}|-])/g,"\\$1")},f=Array.isArray||$&&$.isArray||function(a){return"[object Array]"===Object.prototype.toString.call(a)},g={a:"[aÀÁÂÃÄÅàáâãäåĀā]",c:"[cÇçćĆčČ]",d:"[dđĐďĎ]",e:"[eÈÉÊËèéêëěĚĒē]",i:"[iÌÍÎÏìíîïĪī]",n:"[nÑñňŇ]",o:"[oÒÓÔÕÕÖØòóôõöøŌō]",r:"[rřŘ]",s:"[sŠš]",t:"[tťŤ]",u:"[uÙÚÛÜùúûüůŮŪū]",y:"[yŸÿýÝ]",z:"[zŽž]"};return a}),function(a,b){"function"==typeof define&&define.amd?define("microplugin",b):"object"==typeof exports?module.exports=b():a.MicroPlugin=b()}(this,function(){var a={};a.mixin=function(a){a.plugins={},a.prototype.initializePlugins=function(a){var c,d,e,f=this,g=[];if(f.plugins={names:[],settings:{},requested:{},loaded:{}},b.isArray(a))for(c=0,d=a.length;d>c;c++)"string"==typeof a[c]?g.push(a[c]):(f.plugins.settings[a[c].name]=a[c].options,g.push(a[c].name));else if(a)for(e in a)a.hasOwnProperty(e)&&(f.plugins.settings[e]=a[e],g.push(e));for(;g.length;)f.require(g.shift())},a.prototype.loadPlugin=function(b){var c=this,d=c.plugins,e=a.plugins[b];if(!a.plugins.hasOwnProperty(b))throw new Error('Unable to find "'+b+'" plugin');d.requested[b]=!0,d.loaded[b]=e.fn.apply(c,[c.plugins.settings[b]||{}]),d.names.push(b)},a.prototype.require=function(a){var b=this,c=b.plugins;if(!b.plugins.loaded.hasOwnProperty(a)){if(c.requested[a])throw new Error('Plugin has circular dependency ("'+a+'")');b.loadPlugin(a)}return c.loaded[a]},a.define=function(b,c){a.plugins[b]={name:b,fn:c}}};var b={isArray:Array.isArray||function(a){return"[object Array]"===Object.prototype.toString.call(a)}};return a}),function(a,b){"function"==typeof define&&define.amd?define("selectize",["jquery","sifter","microplugin"],b):"object"==typeof exports?module.exports=b(require("jquery"),require("sifter"),require("microplugin")):a.Selectize=b(a.jQuery,a.Sifter,a.MicroPlugin)}(this,function(a,b,c){"use strict";var d=function(a,b){if("string"!=typeof b||b.length){var c="string"==typeof b?new RegExp(b,"i"):b,d=function(a){var b=0;if(3===a.nodeType){var e=a.data.search(c);if(e>=0&&a.data.length>0){var f=a.data.match(c),g=document.createElement("span");g.className="highlight";var h=a.splitText(e),i=(h.splitText(f[0].length),h.cloneNode(!0));g.appendChild(i),h.parentNode.replaceChild(g,h),b=1}}else if(1===a.nodeType&&a.childNodes&&!/(script|style)/i.test(a.tagName))for(var j=0;j<a.childNodes.length;++j)j+=d(a.childNodes[j]);return b};return a.each(function(){d(this)})}},e=function(){};e.prototype={on:function(a,b){this._events=this._events||{},this._events[a]=this._events[a]||[],this._events[a].push(b)},off:function(a,b){var c=arguments.length;return 0===c?delete this._events:1===c?delete this._events[a]:(this._events=this._events||{},void(a in this._events!=!1&&this._events[a].splice(this._events[a].indexOf(b),1)))},trigger:function(a){if(this._events=this._events||{},a in this._events!=!1)for(var b=0;b<this._events[a].length;b++)this._events[a][b].apply(this,Array.prototype.slice.call(arguments,1))}},e.mixin=function(a){for(var b=["on","off","trigger"],c=0;c<b.length;c++)a.prototype[b[c]]=e.prototype[b[c]]};var f=/Mac/.test(navigator.userAgent),g=65,h=13,i=27,j=37,k=38,l=80,m=39,n=40,o=78,p=8,q=46,r=16,s=f?91:17,t=f?18:17,u=9,v=1,w=2,x=function(a){return"undefined"!=typeof a},y=function(a){return"undefined"==typeof a||null===a?null:"boolean"==typeof a?a?"1":"0":a+""},z=function(a){return(a+"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")},A=function(a){return(a+"").replace(/\$/g,"$$$$")},B={};B.before=function(a,b,c){var d=a[b];a[b]=function(){return c.apply(a,arguments),d.apply(a,arguments)}},B.after=function(a,b,c){var d=a[b];a[b]=function(){var b=d.apply(a,arguments);return c.apply(a,arguments),b}};var C=function(b,c){if(!a.isArray(c))return c;var d,e,f={};for(d=0,e=c.length;e>d;d++)c[d].hasOwnProperty(b)&&(f[c[d][b]]=c[d]);return f},D=function(a){var b=!1;return function(){b||(b=!0,a.apply(this,arguments))}},E=function(a,b){var c;return function(){var d=this,e=arguments;window.clearTimeout(c),c=window.setTimeout(function(){a.apply(d,e)},b)}},F=function(a,b,c){var d,e=a.trigger,f={};a.trigger=function(){var c=arguments[0];return-1===b.indexOf(c)?e.apply(a,arguments):void(f[c]=arguments)},c.apply(a,[]),a.trigger=e;for(d in f)f.hasOwnProperty(d)&&e.apply(a,f[d])},G=function(a,b,c,d){a.on(b,c,function(b){for(var c=b.target;c&&c.parentNode!==a[0];)c=c.parentNode;return b.currentTarget=c,d.apply(this,[b])})},H=function(a){var b={};if("selectionStart"in a)b.start=a.selectionStart,b.length=a.selectionEnd-b.start;else if(document.selection){a.focus();var c=document.selection.createRange(),d=document.selection.createRange().text.length;c.moveStart("character",-a.value.length),b.start=c.text.length-d,b.length=d}return b},I=function(a,b,c){var d,e,f={};if(c)for(d=0,e=c.length;e>d;d++)f[c[d]]=a.css(c[d]);else f=a.css();b.css(f)},J=function(b,c){if(!b)return 0;var d=a("<test>").css({position:"absolute",top:-99999,left:-99999,width:"auto",padding:0,whiteSpace:"pre"}).text(b).appendTo("body");I(c,d,["letterSpacing","fontSize","fontFamily","fontWeight","textTransform"]);var e=d.width();return d.remove(),e},K=function(a){var b=null,c=function(c,d){var e,f,g,h,i,j,k,l;c=c||window.event||{},d=d||{},c.metaKey||c.altKey||(d.force||a.data("grow")!==!1)&&(e=a.val(),c.type&&"keydown"===c.type.toLowerCase()&&(f=c.keyCode,g=f>=97&&122>=f||f>=65&&90>=f||f>=48&&57>=f||32===f,f===q||f===p?(l=H(a[0]),l.length?e=e.substring(0,l.start)+e.substring(l.start+l.length):f===p&&l.start?e=e.substring(0,l.start-1)+e.substring(l.start+1):f===q&&"undefined"!=typeof l.start&&(e=e.substring(0,l.start)+e.substring(l.start+1))):g&&(j=c.shiftKey,k=String.fromCharCode(c.keyCode),k=j?k.toUpperCase():k.toLowerCase(),e+=k)),h=a.attr("placeholder"),!e&&h&&(e=h),i=J(e,a)+4,i!==b&&(b=i,a.width(i),a.triggerHandler("resize")))};a.on("keydown keyup update blur",c),c()},L=function(c,d){var e,f,g=this;f=c[0],f.selectize=g;var h=window.getComputedStyle&&window.getComputedStyle(f,null);e=h?h.getPropertyValue("direction"):f.currentStyle&&f.currentStyle.direction,e=e||c.parents("[dir]:first").attr("dir")||"",a.extend(g,{settings:d,$input:c,tagType:"select"===f.tagName.toLowerCase()?v:w,rtl:/rtl/i.test(e),eventNS:".selectize"+ ++L.count,highlightedValue:null,isOpen:!1,isDisabled:!1,isRequired:c.is("[required]"),isInvalid:!1,isLocked:!1,isFocused:!1,isInputHidden:!1,isSetup:!1,isShiftDown:!1,isCmdDown:!1,isCtrlDown:!1,ignoreFocus:!1,ignoreBlur:!1,ignoreHover:!1,hasOptions:!1,currentResults:null,lastValue:"",caretPos:0,loading:0,loadedSearches:{},$activeOption:null,$activeItems:[],optgroups:{},options:{},userOptions:{},items:[],renderCache:{},onSearchChange:null===d.loadThrottle?g.onSearchChange:E(g.onSearchChange,d.loadThrottle)}),g.sifter=new b(this.options,{diacritics:d.diacritics}),a.extend(g.options,C(d.valueField,d.options)),delete g.settings.options,a.extend(g.optgroups,C(d.optgroupValueField,d.optgroups)),delete g.settings.optgroups,g.settings.mode=g.settings.mode||(1===g.settings.maxItems?"single":"multi"),"boolean"!=typeof g.settings.hideSelected&&(g.settings.hideSelected="multi"===g.settings.mode),g.initializePlugins(g.settings.plugins),g.setupCallbacks(),g.setupTemplates(),g.setup()};return e.mixin(L),c.mixin(L),a.extend(L.prototype,{setup:function(){var b,c,d,e,g,h,i,j,k,l,m=this,n=m.settings,o=m.eventNS,p=a(window),q=a(document),u=m.$input;i=m.settings.mode,j=u.attr("tabindex")||"",k=u.attr("class")||"",b=a("<div>").addClass(n.wrapperClass).addClass(k).addClass(i),c=a("<div>").addClass(n.inputClass).addClass("items").appendTo(b),d=a('<input type="text" autocomplete="off" />').appendTo(c).attr("tabindex",j),h=a(n.dropdownParent||b),e=a("<div>").addClass(n.dropdownClass).addClass(i).hide().appendTo(h),g=a("<div>").addClass(n.dropdownContentClass).appendTo(e),m.settings.copyClassesToDropdown&&e.addClass(k),b.css({width:u[0].style.width}),m.plugins.names.length&&(l="plugin-"+m.plugins.names.join(" plugin-"),b.addClass(l),e.addClass(l)),(null===n.maxItems||n.maxItems>1)&&m.tagType===v&&u.attr("multiple","multiple"),m.settings.placeholder&&d.attr("placeholder",n.placeholder),u.attr("autocorrect")&&d.attr("autocorrect",u.attr("autocorrect")),u.attr("autocapitalize")&&d.attr("autocapitalize",u.attr("autocapitalize")),m.$wrapper=b,m.$control=c,m.$control_input=d,m.$dropdown=e,m.$dropdown_content=g,e.on("mouseenter","[data-selectable]",function(){return m.onOptionHover.apply(m,arguments)}),e.on("mousedown","[data-selectable]",function(){return m.onOptionSelect.apply(m,arguments)}),G(c,"mousedown","*:not(input)",function(){return m.onItemSelect.apply(m,arguments)}),K(d),c.on({mousedown:function(){return m.onMouseDown.apply(m,arguments)},click:function(){return m.onClick.apply(m,arguments)}}),d.on({mousedown:function(a){a.stopPropagation()},keydown:function(){return m.onKeyDown.apply(m,arguments)},keyup:function(){return m.onKeyUp.apply(m,arguments)},keypress:function(){return m.onKeyPress.apply(m,arguments)},resize:function(){m.positionDropdown.apply(m,[])},blur:function(){return m.onBlur.apply(m,arguments)},focus:function(){return m.ignoreBlur=!1,m.onFocus.apply(m,arguments)},paste:function(){return m.onPaste.apply(m,arguments)}}),q.on("keydown"+o,function(a){m.isCmdDown=a[f?"metaKey":"ctrlKey"],m.isCtrlDown=a[f?"altKey":"ctrlKey"],m.isShiftDown=a.shiftKey}),q.on("keyup"+o,function(a){a.keyCode===t&&(m.isCtrlDown=!1),a.keyCode===r&&(m.isShiftDown=!1),a.keyCode===s&&(m.isCmdDown=!1)}),q.on("mousedown"+o,function(a){if(m.isFocused){if(a.target===m.$dropdown[0]||a.target.parentNode===m.$dropdown[0])return!1;m.$control.has(a.target).length||a.target===m.$control[0]||m.blur()}}),p.on(["scroll"+o,"resize"+o].join(" "),function(){m.isOpen&&m.positionDropdown.apply(m,arguments)}),p.on("mousemove"+o,function(){m.ignoreHover=!1}),this.revertSettings={$children:u.children().detach(),tabindex:u.attr("tabindex")},u.attr("tabindex",-1).hide().after(m.$wrapper),a.isArray(n.items)&&(m.setValue(n.items),delete n.items),u[0].validity&&u.on("invalid"+o,function(a){a.preventDefault(),m.isInvalid=!0,m.refreshState()}),m.updateOriginalInput(),m.refreshItems(),m.refreshState(),m.updatePlaceholder(),m.isSetup=!0,u.is(":disabled")&&m.disable(),m.on("change",this.onChange),u.data("selectize",m),u.addClass("selectized"),m.trigger("initialize"),n.preload===!0&&m.onSearchChange("")},setupTemplates:function(){var b=this,c=b.settings.labelField,d=b.settings.optgroupLabelField,e={optgroup:function(a){return'<div class="optgroup">'+a.html+"</div>"},optgroup_header:function(a,b){return'<div class="optgroup-header">'+b(a[d])+"</div>"},option:function(a,b){return'<div class="option">'+b(a[c])+"</div>"},item:function(a,b){return'<div class="item">'+b(a[c])+"</div>"},option_create:function(a,b){return'<div class="create">Add <strong>'+b(a.input)+"</strong>&hellip;</div>"}};b.settings.render=a.extend({},e,b.settings.render)},setupCallbacks:function(){var a,b,c={initialize:"onInitialize",change:"onChange",item_add:"onItemAdd",item_remove:"onItemRemove",clear:"onClear",option_add:"onOptionAdd",option_remove:"onOptionRemove",option_clear:"onOptionClear",dropdown_open:"onDropdownOpen",dropdown_close:"onDropdownClose",type:"onType",load:"onLoad"};for(a in c)c.hasOwnProperty(a)&&(b=this.settings[c[a]],b&&this.on(a,b))},onClick:function(a){var b=this;b.isFocused||(b.focus(),a.preventDefault())},onMouseDown:function(b){{var c=this,d=b.isDefaultPrevented();a(b.target)}if(c.isFocused){if(b.target!==c.$control_input[0])return"single"===c.settings.mode?c.isOpen?c.close():c.open():d||c.setActiveItem(null),!1}else d||window.setTimeout(function(){c.focus()},0)},onChange:function(){this.$input.trigger("change")},onPaste:function(a){var b=this;(b.isFull()||b.isInputHidden||b.isLocked)&&a.preventDefault()},onKeyPress:function(a){if(this.isLocked)return a&&a.preventDefault();var b=String.fromCharCode(a.keyCode||a.which);return this.settings.create&&b===this.settings.delimiter?(this.createItem(),a.preventDefault(),!1):void 0},onKeyDown:function(a){var b=(a.target===this.$control_input[0],this);if(b.isLocked)return void(a.keyCode!==u&&a.preventDefault());switch(a.keyCode){case g:if(b.isCmdDown)return void b.selectAll();break;case i:return void b.close();case o:if(!a.ctrlKey||a.altKey)break;case n:if(!b.isOpen&&b.hasOptions)b.open();else if(b.$activeOption){b.ignoreHover=!0;var c=b.getAdjacentOption(b.$activeOption,1);c.length&&b.setActiveOption(c,!0,!0)}return void a.preventDefault();case l:if(!a.ctrlKey||a.altKey)break;case k:if(b.$activeOption){b.ignoreHover=!0;var d=b.getAdjacentOption(b.$activeOption,-1);d.length&&b.setActiveOption(d,!0,!0)}return void a.preventDefault();case h:return b.isOpen&&b.$activeOption&&b.onOptionSelect({currentTarget:b.$activeOption}),void a.preventDefault();case j:return void b.advanceSelection(-1,a);case m:return void b.advanceSelection(1,a);case u:return b.settings.selectOnTab&&b.isOpen&&b.$activeOption&&(b.onOptionSelect({currentTarget:b.$activeOption}),a.preventDefault()),void(b.settings.create&&b.createItem()&&a.preventDefault());case p:case q:return void b.deleteSelection(a)}return!b.isFull()&&!b.isInputHidden||(f?a.metaKey:a.ctrlKey)?void 0:void a.preventDefault()},onKeyUp:function(a){var b=this;if(b.isLocked)return a&&a.preventDefault();var c=b.$control_input.val()||"";b.lastValue!==c&&(b.lastValue=c,b.onSearchChange(c),b.refreshOptions(),b.trigger("type",c))},onSearchChange:function(a){var b=this,c=b.settings.load;c&&(b.loadedSearches.hasOwnProperty(a)||(b.loadedSearches[a]=!0,b.load(function(d){c.apply(b,[a,d])})))},onFocus:function(a){var b=this;return b.isFocused=!0,b.isDisabled?(b.blur(),a&&a.preventDefault(),!1):void(b.ignoreFocus||("focus"===b.settings.preload&&b.onSearchChange(""),b.$activeItems.length||(b.showInput(),b.setActiveItem(null),b.refreshOptions(!!b.settings.openOnFocus)),b.refreshState()))},onBlur:function(a){var b=this;if(b.isFocused=!1,!b.ignoreFocus){if(!b.ignoreBlur&&document.activeElement===b.$dropdown_content[0])return b.ignoreBlur=!0,void b.onFocus(a);b.settings.create&&b.settings.createOnBlur&&b.createItem(!1),b.close(),b.setTextboxValue(""),b.setActiveItem(null),b.setActiveOption(null),b.setCaret(b.items.length),b.refreshState()}},onOptionHover:function(a){this.ignoreHover||this.setActiveOption(a.currentTarget,!1)},onOptionSelect:function(b){var c,d,e=this;b.preventDefault&&(b.preventDefault(),b.stopPropagation()),d=a(b.currentTarget),d.hasClass("create")?e.createItem():(c=d.attr("data-value"),"undefined"!=typeof c&&(e.lastQuery=null,e.setTextboxValue(""),e.addItem(c),!e.settings.hideSelected&&b.type&&/mouse/.test(b.type)&&e.setActiveOption(e.getOption(c))))},onItemSelect:function(a){var b=this;b.isLocked||"multi"===b.settings.mode&&(a.preventDefault(),b.setActiveItem(a.currentTarget,a))},load:function(a){var b=this,c=b.$wrapper.addClass("loading");b.loading++,a.apply(b,[function(a){b.loading=Math.max(b.loading-1,0),a&&a.length&&(b.addOption(a),b.refreshOptions(b.isFocused&&!b.isInputHidden)),b.loading||c.removeClass("loading"),b.trigger("load",a)}])},setTextboxValue:function(a){var b=this.$control_input,c=b.val()!==a;c&&(b.val(a).triggerHandler("update"),this.lastValue=a)},getValue:function(){return this.tagType===v&&this.$input.attr("multiple")?this.items:this.items.join(this.settings.delimiter)},setValue:function(a){F(this,["change"],function(){this.clear(),this.addItems(a)})},setActiveItem:function(b,c){var d,e,f,g,h,i,j,k,l=this;if("single"!==l.settings.mode){if(b=a(b),!b.length)return a(l.$activeItems).removeClass("active"),l.$activeItems=[],void(l.isFocused&&l.showInput());if(d=c&&c.type.toLowerCase(),"mousedown"===d&&l.isShiftDown&&l.$activeItems.length){for(k=l.$control.children(".active:last"),g=Array.prototype.indexOf.apply(l.$control[0].childNodes,[k[0]]),h=Array.prototype.indexOf.apply(l.$control[0].childNodes,[b[0]]),g>h&&(j=g,g=h,h=j),e=g;h>=e;e++)i=l.$control[0].childNodes[e],-1===l.$activeItems.indexOf(i)&&(a(i).addClass("active"),l.$activeItems.push(i));c.preventDefault()}else"mousedown"===d&&l.isCtrlDown||"keydown"===d&&this.isShiftDown?b.hasClass("active")?(f=l.$activeItems.indexOf(b[0]),l.$activeItems.splice(f,1),b.removeClass("active")):l.$activeItems.push(b.addClass("active")[0]):(a(l.$activeItems).removeClass("active"),l.$activeItems=[b.addClass("active")[0]]);l.hideInput(),this.isFocused||l.focus()}},setActiveOption:function(b,c,d){var e,f,g,h,i,j=this;j.$activeOption&&j.$activeOption.removeClass("active"),j.$activeOption=null,b=a(b),b.length&&(j.$activeOption=b.addClass("active"),(c||!x(c))&&(e=j.$dropdown_content.height(),f=j.$activeOption.outerHeight(!0),c=j.$dropdown_content.scrollTop()||0,g=j.$activeOption.offset().top-j.$dropdown_content.offset().top+c,h=g,i=g-e+f,g+f>e+c?j.$dropdown_content.stop().animate({scrollTop:i},d?j.settings.scrollDuration:0):c>g&&j.$dropdown_content.stop().animate({scrollTop:h},d?j.settings.scrollDuration:0)))},selectAll:function(){var a=this;"single"!==a.settings.mode&&(a.$activeItems=Array.prototype.slice.apply(a.$control.children(":not(input)").addClass("active")),a.$activeItems.length&&(a.hideInput(),a.close()),a.focus())},hideInput:function(){var a=this;a.setTextboxValue(""),a.$control_input.css({opacity:0,position:"absolute",left:a.rtl?1e4:-1e4}),a.isInputHidden=!0},showInput:function(){this.$control_input.css({opacity:1,position:"relative",left:0}),this.isInputHidden=!1},focus:function(){var a=this;a.isDisabled||(a.ignoreFocus=!0,a.$control_input[0].focus(),window.setTimeout(function(){a.ignoreFocus=!1,a.onFocus()},0))},blur:function(){this.$control_input.trigger("blur")},getScoreFunction:function(a){return this.sifter.getScoreFunction(a,this.getSearchOptions())},getSearchOptions:function(){var a=this.settings,b=a.sortField;return"string"==typeof b&&(b={field:b}),{fields:a.searchField,conjunction:a.searchConjunction,sort:b}},search:function(b){var c,d,e,f=this,g=f.settings,h=this.getSearchOptions();if(g.score&&(e=f.settings.score.apply(this,[b]),"function"!=typeof e))throw new Error('Selectize "score" setting must be a function that returns a function');if(b!==f.lastQuery?(f.lastQuery=b,d=f.sifter.search(b,a.extend(h,{score:e})),f.currentResults=d):d=a.extend(!0,{},f.currentResults),g.hideSelected)for(c=d.items.length-1;c>=0;c--)-1!==f.items.indexOf(y(d.items[c].id))&&d.items.splice(c,1);return d},refreshOptions:function(b){var c,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s;"undefined"==typeof b&&(b=!0);var t=this,u=a.trim(t.$control_input.val()),v=t.search(u),w=t.$dropdown_content,x=t.$activeOption&&y(t.$activeOption.attr("data-value"));if(g=v.items.length,"number"==typeof t.settings.maxOptions&&(g=Math.min(g,t.settings.maxOptions)),h={},t.settings.optgroupOrder)for(i=t.settings.optgroupOrder,c=0;c<i.length;c++)h[i[c]]=[];else i=[];for(c=0;g>c;c++)for(j=t.options[v.items[c].id],k=t.render("option",j),l=j[t.settings.optgroupField]||"",m=a.isArray(l)?l:[l],e=0,f=m&&m.length;f>e;e++)l=m[e],t.optgroups.hasOwnProperty(l)||(l=""),h.hasOwnProperty(l)||(h[l]=[],i.push(l)),h[l].push(k);for(n=[],c=0,g=i.length;g>c;c++)l=i[c],t.optgroups.hasOwnProperty(l)&&h[l].length?(o=t.render("optgroup_header",t.optgroups[l])||"",o+=h[l].join(""),n.push(t.render("optgroup",a.extend({},t.optgroups[l],{html:o})))):n.push(h[l].join(""));if(w.html(n.join("")),t.settings.highlight&&v.query.length&&v.tokens.length)for(c=0,g=v.tokens.length;g>c;c++)d(w,v.tokens[c].regex);if(!t.settings.hideSelected)for(c=0,g=t.items.length;g>c;c++)t.getOption(t.items[c]).addClass("selected");p=t.canCreate(u),p&&(w.prepend(t.render("option_create",{input:u})),s=a(w[0].childNodes[0])),t.hasOptions=v.items.length>0||p,t.hasOptions?(v.items.length>0?(r=x&&t.getOption(x),r&&r.length?q=r:"single"===t.settings.mode&&t.items.length&&(q=t.getOption(t.items[0])),q&&q.length||(q=s&&!t.settings.addPrecedence?t.getAdjacentOption(s,1):w.find("[data-selectable]:first"))):q=s,t.setActiveOption(q),b&&!t.isOpen&&t.open()):(t.setActiveOption(null),b&&t.isOpen&&t.close())},addOption:function(b){var c,d,e,f=this;if(a.isArray(b))for(c=0,d=b.length;d>c;c++)f.addOption(b[c]);else e=y(b[f.settings.valueField]),"string"!=typeof e||f.options.hasOwnProperty(e)||(f.userOptions[e]=!0,f.options[e]=b,f.lastQuery=null,f.trigger("option_add",e,b))},addOptionGroup:function(a,b){this.optgroups[a]=b,this.trigger("optgroup_add",a,b)},updateOption:function(b,c){var d,e,f,g,h,i,j=this;if(b=y(b),f=y(c[j.settings.valueField]),null!==b&&j.options.hasOwnProperty(b)){if("string"!=typeof f)throw new Error("Value must be set in option data");f!==b&&(delete j.options[b],g=j.items.indexOf(b),-1!==g&&j.items.splice(g,1,f)),j.options[f]=c,h=j.renderCache.item,i=j.renderCache.option,h&&(delete h[b],delete h[f]),i&&(delete i[b],delete i[f]),-1!==j.items.indexOf(f)&&(d=j.getItem(b),e=a(j.render("item",c)),d.hasClass("active")&&e.addClass("active"),d.replaceWith(e)),j.lastQuery=null,j.isOpen&&j.refreshOptions(!1)}},removeOption:function(a){var b=this;a=y(a);var c=b.renderCache.item,d=b.renderCache.option;c&&delete c[a],d&&delete d[a],delete b.userOptions[a],delete b.options[a],b.lastQuery=null,b.trigger("option_remove",a),b.removeItem(a)},clearOptions:function(){var a=this;a.loadedSearches={},a.userOptions={},a.renderCache={},a.options=a.sifter.items={},a.lastQuery=null,a.trigger("option_clear"),a.clear()},getOption:function(a){return this.getElementWithValue(a,this.$dropdown_content.find("[data-selectable]"))},getAdjacentOption:function(b,c){var d=this.$dropdown.find("[data-selectable]"),e=d.index(b)+c;return e>=0&&e<d.length?d.eq(e):a()},getElementWithValue:function(b,c){if(b=y(b),"undefined"!=typeof b&&null!==b)for(var d=0,e=c.length;e>d;d++)if(c[d].getAttribute("data-value")===b)return a(c[d]);return a()},getItem:function(a){return this.getElementWithValue(a,this.$control.children())},addItems:function(b){for(var c=a.isArray(b)?b:[b],d=0,e=c.length;e>d;d++)this.isPending=e-1>d,this.addItem(c[d])},addItem:function(b){F(this,["change"],function(){var c,d,e,f,g,h=this,i=h.settings.mode;return b=y(b),-1!==h.items.indexOf(b)?void("single"===i&&h.close()):void(h.options.hasOwnProperty(b)&&("single"===i&&h.clear(),"multi"===i&&h.isFull()||(c=a(h.render("item",h.options[b])),g=h.isFull(),h.items.splice(h.caretPos,0,b),h.insertAtCaret(c),(!h.isPending||!g&&h.isFull())&&h.refreshState(),h.isSetup&&(e=h.$dropdown_content.find("[data-selectable]"),h.isPending||(d=h.getOption(b),f=h.getAdjacentOption(d,1).attr("data-value"),h.refreshOptions(h.isFocused&&"single"!==i),f&&h.setActiveOption(h.getOption(f))),!e.length||h.isFull()?h.close():h.positionDropdown(),h.updatePlaceholder(),h.trigger("item_add",b,c),h.updateOriginalInput()))))})},removeItem:function(a){var b,c,d,e=this;b="object"==typeof a?a:e.getItem(a),a=y(b.attr("data-value")),c=e.items.indexOf(a),-1!==c&&(b.remove(),b.hasClass("active")&&(d=e.$activeItems.indexOf(b[0]),e.$activeItems.splice(d,1)),e.items.splice(c,1),e.lastQuery=null,!e.settings.persist&&e.userOptions.hasOwnProperty(a)&&e.removeOption(a),c<e.caretPos&&e.setCaret(e.caretPos-1),e.refreshState(),e.updatePlaceholder(),e.updateOriginalInput(),e.positionDropdown(),e.trigger("item_remove",a))},createItem:function(b){var c=this,d=a.trim(c.$control_input.val()||""),e=c.caretPos;if(!c.canCreate(d))return!1;c.lock(),"undefined"==typeof b&&(b=!0);var f="function"==typeof c.settings.create?this.settings.create:function(a){var b={};return b[c.settings.labelField]=a,b[c.settings.valueField]=a,b},g=D(function(a){if(c.unlock(),a&&"object"==typeof a){var d=y(a[c.settings.valueField]);"string"==typeof d&&(c.setTextboxValue(""),c.addOption(a),c.setCaret(e),c.addItem(d),c.refreshOptions(b&&"single"!==c.settings.mode))}}),h=f.apply(this,[d,g]);return"undefined"!=typeof h&&g(h),!0},refreshItems:function(){if(this.lastQuery=null,this.isSetup)for(var a=0;a<this.items.length;a++)this.addItem(this.items);this.refreshState(),this.updateOriginalInput()},refreshState:function(){var a,b=this;b.isRequired&&(b.items.length&&(b.isInvalid=!1),b.$control_input.prop("required",a)),b.refreshClasses()},refreshClasses:function(){var b=this,c=b.isFull(),d=b.isLocked;b.$wrapper.toggleClass("rtl",b.rtl),b.$control.toggleClass("focus",b.isFocused).toggleClass("disabled",b.isDisabled).toggleClass("required",b.isRequired).toggleClass("invalid",b.isInvalid).toggleClass("locked",d).toggleClass("full",c).toggleClass("not-full",!c).toggleClass("input-active",b.isFocused&&!b.isInputHidden).toggleClass("dropdown-active",b.isOpen).toggleClass("has-options",!a.isEmptyObject(b.options)).toggleClass("has-items",b.items.length>0),b.$control_input.data("grow",!c&&!d)},isFull:function(){return null!==this.settings.maxItems&&this.items.length>=this.settings.maxItems},updateOriginalInput:function(){var a,b,c,d=this;if(d.tagType===v){for(c=[],a=0,b=d.items.length;b>a;a++)c.push('<option value="'+z(d.items[a])+'" selected="selected"></option>');c.length||this.$input.attr("multiple")||c.push('<option value="" selected="selected"></option>'),d.$input.html(c.join(""))}else d.$input.val(d.getValue()),d.$input.attr("value",d.$input.val());d.isSetup&&d.trigger("change",d.$input.val())},updatePlaceholder:function(){if(this.settings.placeholder){var a=this.$control_input;this.items.length?a.removeAttr("placeholder"):a.attr("placeholder",this.settings.placeholder),a.triggerHandler("update",{force:!0})}},open:function(){var a=this;a.isLocked||a.isOpen||"multi"===a.settings.mode&&a.isFull()||(a.focus(),a.isOpen=!0,a.refreshState(),a.$dropdown.css({visibility:"hidden",display:"block"}),a.positionDropdown(),a.$dropdown.css({visibility:"visible"}),a.trigger("dropdown_open",a.$dropdown))},close:function(){var a=this,b=a.isOpen;"single"===a.settings.mode&&a.items.length&&a.hideInput(),a.isOpen=!1,a.$dropdown.hide(),a.setActiveOption(null),a.refreshState(),b&&a.trigger("dropdown_close",a.$dropdown)},positionDropdown:function(){var a=this.$control,b="body"===this.settings.dropdownParent?a.offset():a.position();b.top+=a.outerHeight(!0),this.$dropdown.css({width:a.outerWidth(),top:b.top,left:b.left})},clear:function(){var a=this;a.items.length&&(a.$control.children(":not(input)").remove(),a.items=[],a.lastQuery=null,a.setCaret(0),a.setActiveItem(null),a.updatePlaceholder(),a.updateOriginalInput(),a.refreshState(),a.showInput(),a.trigger("clear"))},insertAtCaret:function(b){var c=Math.min(this.caretPos,this.items.length);0===c?this.$control.prepend(b):a(this.$control[0].childNodes[c]).before(b),this.setCaret(c+1)},deleteSelection:function(b){var c,d,e,f,g,h,i,j,k,l=this;if(e=b&&b.keyCode===p?-1:1,f=H(l.$control_input[0]),l.$activeOption&&!l.settings.hideSelected&&(i=l.getAdjacentOption(l.$activeOption,-1).attr("data-value")),g=[],l.$activeItems.length){for(k=l.$control.children(".active:"+(e>0?"last":"first")),h=l.$control.children(":not(input)").index(k),e>0&&h++,c=0,d=l.$activeItems.length;d>c;c++)g.push(a(l.$activeItems[c]).attr("data-value"));b&&(b.preventDefault(),b.stopPropagation())}else(l.isFocused||"single"===l.settings.mode)&&l.items.length&&(0>e&&0===f.start&&0===f.length?g.push(l.items[l.caretPos-1]):e>0&&f.start===l.$control_input.val().length&&g.push(l.items[l.caretPos]));if(!g.length||"function"==typeof l.settings.onDelete&&l.settings.onDelete.apply(l,[g])===!1)return!1;for("undefined"!=typeof h&&l.setCaret(h);g.length;)l.removeItem(g.pop());return l.showInput(),l.positionDropdown(),l.refreshOptions(!0),i&&(j=l.getOption(i),j.length&&l.setActiveOption(j)),!0},advanceSelection:function(a,b){var c,d,e,f,g,h,i=this;0!==a&&(i.rtl&&(a*=-1),c=a>0?"last":"first",d=H(i.$control_input[0]),i.isFocused&&!i.isInputHidden?(f=i.$control_input.val().length,g=0>a?0===d.start&&0===d.length:d.start===f,g&&!f&&i.advanceCaret(a,b)):(h=i.$control.children(".active:"+c),h.length&&(e=i.$control.children(":not(input)").index(h),i.setActiveItem(null),i.setCaret(a>0?e+1:e))))},advanceCaret:function(a,b){var c,d,e=this;0!==a&&(c=a>0?"next":"prev",e.isShiftDown?(d=e.$control_input[c](),d.length&&(e.hideInput(),e.setActiveItem(d),b&&b.preventDefault())):e.setCaret(e.caretPos+a))},setCaret:function(b){var c=this;if(b="single"===c.settings.mode?c.items.length:Math.max(0,Math.min(c.items.length,b)),!c.isPending){var d,e,f,g;for(f=c.$control.children(":not(input)"),d=0,e=f.length;e>d;d++)g=a(f[d]).detach(),b>d?c.$control_input.before(g):c.$control.append(g)}c.caretPos=b},lock:function(){this.close(),this.isLocked=!0,this.refreshState()},unlock:function(){this.isLocked=!1,this.refreshState()},disable:function(){var a=this;a.$input.prop("disabled",!0),a.isDisabled=!0,a.lock()},enable:function(){var a=this;a.$input.prop("disabled",!1),a.isDisabled=!1,a.unlock()},destroy:function(){var b=this,c=b.eventNS,d=b.revertSettings;b.trigger("destroy"),b.off(),b.$wrapper.remove(),b.$dropdown.remove(),b.$input.html("").append(d.$children).removeAttr("tabindex").removeClass("selectized").attr({tabindex:d.tabindex}).show(),b.$control_input.removeData("grow"),b.$input.removeData("selectize"),a(window).off(c),a(document).off(c),a(document.body).off(c),delete b.$input[0].selectize
},render:function(a,b){var c,d,e="",f=!1,g=this,h=/^[\t ]*<([a-z][a-z0-9\-_]*(?:\:[a-z][a-z0-9\-_]*)?)/i;return("option"===a||"item"===a)&&(c=y(b[g.settings.valueField]),f=!!c),f&&(x(g.renderCache[a])||(g.renderCache[a]={}),g.renderCache[a].hasOwnProperty(c))?g.renderCache[a][c]:(e=g.settings.render[a].apply(this,[b,z]),("option"===a||"option_create"===a)&&(e=e.replace(h,"<$1 data-selectable")),"optgroup"===a&&(d=b[g.settings.optgroupValueField]||"",e=e.replace(h,'<$1 data-group="'+A(z(d))+'"')),("option"===a||"item"===a)&&(e=e.replace(h,'<$1 data-value="'+A(z(c||""))+'"')),f&&(g.renderCache[a][c]=e),e)},clearCache:function(a){var b=this;"undefined"==typeof a?b.renderCache={}:delete b.renderCache[a]},canCreate:function(a){var b=this;if(!b.settings.create)return!1;var c=b.settings.createFilter;return!(!a.length||"function"==typeof c&&!c.apply(b,[a])||"string"==typeof c&&!new RegExp(c).test(a)||c instanceof RegExp&&!c.test(a))}}),L.count=0,L.defaults={plugins:[],delimiter:",",persist:!0,diacritics:!0,create:!1,createOnBlur:!1,createFilter:null,highlight:!0,openOnFocus:!0,maxOptions:1e3,maxItems:null,hideSelected:null,addPrecedence:!1,selectOnTab:!1,preload:!1,allowEmptyOption:!1,scrollDuration:60,loadThrottle:300,dataAttr:"data-data",optgroupField:"optgroup",valueField:"value",labelField:"text",optgroupLabelField:"label",optgroupValueField:"value",optgroupOrder:null,sortField:"$order",searchField:["text"],searchConjunction:"and",mode:null,wrapperClass:"selectize-control",inputClass:"selectize-input",dropdownClass:"selectize-dropdown",dropdownContentClass:"selectize-dropdown-content",dropdownParent:null,copyClassesToDropdown:!0,render:{}},a.fn.selectize=function(b){var c=a.fn.selectize.defaults,d=a.extend({},c,b),e=d.dataAttr,f=d.labelField,g=d.valueField,h=d.optgroupField,i=d.optgroupLabelField,j=d.optgroupValueField,k=function(b,c){var e,h,i,j,k=a.trim(b.val()||"");if(d.allowEmptyOption||k.length){for(i=k.split(d.delimiter),e=0,h=i.length;h>e;e++)j={},j[f]=i[e],j[g]=i[e],c.options[i[e]]=j;c.items=i}},l=function(b,c){var k,l,m,n,o=0,p=c.options,q=function(a){var b=e&&a.attr(e);return"string"==typeof b&&b.length?JSON.parse(b):null},r=function(b,e){var i,j;if(b=a(b),i=b.attr("value")||"",i.length||d.allowEmptyOption){if(p.hasOwnProperty(i))return void(e&&(p[i].optgroup?a.isArray(p[i].optgroup)?p[i].optgroup.push(e):p[i].optgroup=[p[i].optgroup,e]:p[i].optgroup=e));j=q(b)||{},j[f]=j[f]||b.text(),j[g]=j[g]||i,j[h]=j[h]||e,j.$order=++o,p[i]=j,b.is(":selected")&&c.items.push(i)}},s=function(b){var d,e,f,g,h;for(b=a(b),f=b.attr("label"),f&&(g=q(b)||{},g[i]=f,g[j]=f,c.optgroups[f]=g),h=a("option",b),d=0,e=h.length;e>d;d++)r(h[d],f)};for(c.maxItems=b.attr("multiple")?null:1,n=b.children(),k=0,l=n.length;l>k;k++)m=n[k].tagName.toLowerCase(),"optgroup"===m?s(n[k]):"option"===m&&r(n[k])};return this.each(function(){if(!this.selectize){var e,f=a(this),g=this.tagName.toLowerCase(),h=f.attr("placeholder")||f.attr("data-placeholder");h||d.allowEmptyOption||(h=f.children('option[value=""]').text());var i={placeholder:h,options:{},optgroups:{},items:[]};"select"===g?l(f,i):k(f,i),e=new L(f,a.extend(!0,{},c,i,b))}})},a.fn.selectize.defaults=L.defaults,L.define("drag_drop",function(){if(!a.fn.sortable)throw new Error('The "drag_drop" plugin requires jQuery UI "sortable".');if("multi"===this.settings.mode){var b=this;b.lock=function(){var a=b.lock;return function(){var c=b.$control.data("sortable");return c&&c.disable(),a.apply(b,arguments)}}(),b.unlock=function(){var a=b.unlock;return function(){var c=b.$control.data("sortable");return c&&c.enable(),a.apply(b,arguments)}}(),b.setup=function(){var c=b.setup;return function(){c.apply(this,arguments);var d=b.$control.sortable({items:"[data-value]",forcePlaceholderSize:!0,disabled:b.isLocked,start:function(a,b){b.placeholder.css("width",b.helper.css("width")),d.css({overflow:"visible"})},stop:function(){d.css({overflow:"hidden"});var c=b.$activeItems?b.$activeItems.slice():null,e=[];d.children("[data-value]").each(function(){e.push(a(this).attr("data-value"))}),b.setValue(e),b.setActiveItem(c)}})}}()}}),L.define("dropdown_header",function(b){var c=this;b=a.extend({title:"Untitled",headerClass:"selectize-dropdown-header",titleRowClass:"selectize-dropdown-header-title",labelClass:"selectize-dropdown-header-label",closeClass:"selectize-dropdown-header-close",html:function(a){return'<div class="'+a.headerClass+'"><div class="'+a.titleRowClass+'"><span class="'+a.labelClass+'">'+a.title+'</span><a href="javascript:void(0)" class="'+a.closeClass+'">&times;</a></div></div>'}},b),c.setup=function(){var d=c.setup;return function(){d.apply(c,arguments),c.$dropdown_header=a(b.html(b)),c.$dropdown.prepend(c.$dropdown_header)}}()}),L.define("optgroup_columns",function(b){var c=this;b=a.extend({equalizeWidth:!0,equalizeHeight:!0},b),this.getAdjacentOption=function(b,c){var d=b.closest("[data-group]").find("[data-selectable]"),e=d.index(b)+c;return e>=0&&e<d.length?d.eq(e):a()},this.onKeyDown=function(){var a=c.onKeyDown;return function(b){var d,e,f,g;return!this.isOpen||b.keyCode!==j&&b.keyCode!==m?a.apply(this,arguments):(c.ignoreHover=!0,g=this.$activeOption.closest("[data-group]"),d=g.find("[data-selectable]").index(this.$activeOption),g=b.keyCode===j?g.prev("[data-group]"):g.next("[data-group]"),f=g.find("[data-selectable]"),e=f.eq(Math.min(f.length-1,d)),void(e.length&&this.setActiveOption(e)))}}();var d=function(){var a,b=d.width,c=document;return"undefined"==typeof b&&(a=c.createElement("div"),a.innerHTML='<div style="width:50px;height:50px;position:absolute;left:-50px;top:-50px;overflow:auto;"><div style="width:1px;height:100px;"></div></div>',a=a.firstChild,c.body.appendChild(a),b=d.width=a.offsetWidth-a.clientWidth,c.body.removeChild(a)),b},e=function(){var e,f,g,h,i,j,k;if(k=a("[data-group]",c.$dropdown_content),f=k.length,f&&c.$dropdown_content.width()){if(b.equalizeHeight){for(g=0,e=0;f>e;e++)g=Math.max(g,k.eq(e).height());k.css({height:g})}b.equalizeWidth&&(j=c.$dropdown_content.innerWidth()-d(),h=Math.round(j/f),k.css({width:h}),f>1&&(i=j-h*(f-1),k.eq(f-1).css({width:i})))}};(b.equalizeHeight||b.equalizeWidth)&&(B.after(this,"positionDropdown",e),B.after(this,"refreshOptions",e))}),L.define("remove_button",function(b){if("single"!==this.settings.mode){b=a.extend({label:"&times;",title:"Remove",className:"remove",append:!0},b);var c=this,d='<a href="javascript:void(0)" class="'+b.className+'" tabindex="-1" title="'+z(b.title)+'">'+b.label+"</a>",e=function(a,b){var c=a.search(/(<\/[^>]+>\s*)$/);return a.substring(0,c)+b+a.substring(c)};this.setup=function(){var f=c.setup;return function(){if(b.append){var g=c.settings.render.item;c.settings.render.item=function(){return e(g.apply(this,arguments),d)}}f.apply(this,arguments),this.$control.on("click","."+b.className,function(b){if(b.preventDefault(),!c.isLocked){var d=a(b.currentTarget).parent();c.setActiveItem(d),c.deleteSelection()&&c.setCaret(c.items.length)}})}}()}}),L.define("restore_on_backspace",function(a){var b=this;a.text=a.text||function(a){return a[this.settings.labelField]},this.onKeyDown=function(){var c=b.onKeyDown;return function(b){var d,e;return b.keyCode===p&&""===this.$control_input.val()&&!this.$activeItems.length&&(d=this.caretPos-1,d>=0&&d<this.items.length)?(e=this.options[this.items[d]],this.deleteSelection(b)&&(this.setTextboxValue(a.text.apply(this,[e])),this.refreshOptions(!0)),void b.preventDefault()):c.apply(this,arguments)}}()}),L});
/*! skrollr 0.6.26 (2014-06-08) | Alexander Prinzhorn - https://github.com/Prinzhorn/skrollr | Free to use under terms of MIT license */
(function(e,t,r){"use strict";function n(r){if(o=t.documentElement,a=t.body,K(),it=this,r=r||{},ut=r.constants||{},r.easing)for(var n in r.easing)U[n]=r.easing[n];yt=r.edgeStrategy||"set",ct={beforerender:r.beforerender,render:r.render,keyframe:r.keyframe},ft=r.forceHeight!==!1,ft&&(Vt=r.scale||1),mt=r.mobileDeceleration||x,dt=r.smoothScrolling!==!1,gt=r.smoothScrollingDuration||E,vt={targetTop:it.getScrollTop()},Gt=(r.mobileCheck||function(){return/Android|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent||navigator.vendor||e.opera)})(),Gt?(st=t.getElementById("skrollr-body"),st&&at(),X(),Dt(o,[y,S],[T])):Dt(o,[y,b],[T]),it.refresh(),St(e,"resize orientationchange",function(){var e=o.clientWidth,t=o.clientHeight;(t!==$t||e!==Mt)&&($t=t,Mt=e,_t=!0)});var i=Y();return function l(){Z(),bt=i(l)}(),it}var o,a,i={get:function(){return it},init:function(e){return it||new n(e)},VERSION:"0.6.26"},l=Object.prototype.hasOwnProperty,s=e.Math,c=e.getComputedStyle,f="touchstart",u="touchmove",m="touchcancel",p="touchend",d="skrollable",g=d+"-before",v=d+"-between",h=d+"-after",y="skrollr",T="no-"+y,b=y+"-desktop",S=y+"-mobile",k="linear",w=1e3,x=.004,E=200,A="start",F="end",C="center",D="bottom",H="___skrollable_id",I=/^(?:input|textarea|button|select)$/i,P=/^\s+|\s+$/g,N=/^data(?:-(_\w+))?(?:-?(-?\d*\.?\d+p?))?(?:-?(start|end|top|center|bottom))?(?:-?(top|center|bottom))?$/,O=/\s*(@?[\w\-\[\]]+)\s*:\s*(.+?)\s*(?:;|$)/gi,V=/^(@?[a-z\-]+)\[(\w+)\]$/,z=/-([a-z0-9_])/g,q=function(e,t){return t.toUpperCase()},L=/[\-+]?[\d]*\.?[\d]+/g,M=/\{\?\}/g,$=/rgba?\(\s*-?\d+\s*,\s*-?\d+\s*,\s*-?\d+/g,_=/[a-z\-]+-gradient/g,B="",G="",K=function(){var e=/^(?:O|Moz|webkit|ms)|(?:-(?:o|moz|webkit|ms)-)/;if(c){var t=c(a,null);for(var n in t)if(B=n.match(e)||+n==n&&t[n].match(e))break;if(!B)return B=G="",r;B=B[0],"-"===B.slice(0,1)?(G=B,B={"-webkit-":"webkit","-moz-":"Moz","-ms-":"ms","-o-":"O"}[B]):G="-"+B.toLowerCase()+"-"}},Y=function(){var t=e.requestAnimationFrame||e[B.toLowerCase()+"RequestAnimationFrame"],r=Pt();return(Gt||!t)&&(t=function(t){var n=Pt()-r,o=s.max(0,1e3/60-n);return e.setTimeout(function(){r=Pt(),t()},o)}),t},R=function(){var t=e.cancelAnimationFrame||e[B.toLowerCase()+"CancelAnimationFrame"];return(Gt||!t)&&(t=function(t){return e.clearTimeout(t)}),t},U={begin:function(){return 0},end:function(){return 1},linear:function(e){return e},quadratic:function(e){return e*e},cubic:function(e){return e*e*e},swing:function(e){return-s.cos(e*s.PI)/2+.5},sqrt:function(e){return s.sqrt(e)},outCubic:function(e){return s.pow(e-1,3)+1},bounce:function(e){var t;if(.5083>=e)t=3;else if(.8489>=e)t=9;else if(.96208>=e)t=27;else{if(!(.99981>=e))return 1;t=91}return 1-s.abs(3*s.cos(1.028*e*t)/t)}};n.prototype.refresh=function(e){var n,o,a=!1;for(e===r?(a=!0,lt=[],Bt=0,e=t.getElementsByTagName("*")):e.length===r&&(e=[e]),n=0,o=e.length;o>n;n++){var i=e[n],l=i,s=[],c=dt,f=yt,u=!1;if(a&&H in i&&delete i[H],i.attributes){for(var m=0,p=i.attributes.length;p>m;m++){var g=i.attributes[m];if("data-anchor-target"!==g.name)if("data-smooth-scrolling"!==g.name)if("data-edge-strategy"!==g.name)if("data-emit-events"!==g.name){var v=g.name.match(N);if(null!==v){var h={props:g.value,element:i,eventType:g.name.replace(z,q)};s.push(h);var y=v[1];y&&(h.constant=y.substr(1));var T=v[2];/p$/.test(T)?(h.isPercentage=!0,h.offset=(0|T.slice(0,-1))/100):h.offset=0|T;var b=v[3],S=v[4]||b;b&&b!==A&&b!==F?(h.mode="relative",h.anchors=[b,S]):(h.mode="absolute",b===F?h.isEnd=!0:h.isPercentage||(h.offset=h.offset*Vt))}}else u=!0;else f=g.value;else c="off"!==g.value;else if(l=t.querySelector(g.value),null===l)throw'Unable to find anchor target "'+g.value+'"'}if(s.length){var k,w,x;!a&&H in i?(x=i[H],k=lt[x].styleAttr,w=lt[x].classAttr):(x=i[H]=Bt++,k=i.style.cssText,w=Ct(i)),lt[x]={element:i,styleAttr:k,classAttr:w,anchorTarget:l,keyFrames:s,smoothScrolling:c,edgeStrategy:f,emitEvents:u,lastFrameIndex:-1},Dt(i,[d],[])}}}for(Et(),n=0,o=e.length;o>n;n++){var E=lt[e[n][H]];E!==r&&(J(E),et(E))}return it},n.prototype.relativeToAbsolute=function(e,t,r){var n=o.clientHeight,a=e.getBoundingClientRect(),i=a.top,l=a.bottom-a.top;return t===D?i-=n:t===C&&(i-=n/2),r===D?i+=l:r===C&&(i+=l/2),i+=it.getScrollTop(),0|i+.5},n.prototype.animateTo=function(e,t){t=t||{};var n=Pt(),o=it.getScrollTop();return pt={startTop:o,topDiff:e-o,targetTop:e,duration:t.duration||w,startTime:n,endTime:n+(t.duration||w),easing:U[t.easing||k],done:t.done},pt.topDiff||(pt.done&&pt.done.call(it,!1),pt=r),it},n.prototype.stopAnimateTo=function(){pt&&pt.done&&pt.done.call(it,!0),pt=r},n.prototype.isAnimatingTo=function(){return!!pt},n.prototype.isMobile=function(){return Gt},n.prototype.setScrollTop=function(t,r){return ht=r===!0,Gt?Kt=s.min(s.max(t,0),Ot):e.scrollTo(0,t),it},n.prototype.getScrollTop=function(){return Gt?Kt:e.pageYOffset||o.scrollTop||a.scrollTop||0},n.prototype.getMaxScrollTop=function(){return Ot},n.prototype.on=function(e,t){return ct[e]=t,it},n.prototype.off=function(e){return delete ct[e],it},n.prototype.destroy=function(){var e=R();e(bt),wt(),Dt(o,[T],[y,b,S]);for(var t=0,n=lt.length;n>t;t++)ot(lt[t].element);o.style.overflow=a.style.overflow="",o.style.height=a.style.height="",st&&i.setStyle(st,"transform","none"),it=r,st=r,ct=r,ft=r,Ot=0,Vt=1,ut=r,mt=r,zt="down",qt=-1,Mt=0,$t=0,_t=!1,pt=r,dt=r,gt=r,vt=r,ht=r,Bt=0,yt=r,Gt=!1,Kt=0,Tt=r};var X=function(){var n,i,l,c,d,g,v,h,y,T,b,S;St(o,[f,u,m,p].join(" "),function(e){var o=e.changedTouches[0];for(c=e.target;3===c.nodeType;)c=c.parentNode;switch(d=o.clientY,g=o.clientX,T=e.timeStamp,I.test(c.tagName)||e.preventDefault(),e.type){case f:n&&n.blur(),it.stopAnimateTo(),n=c,i=v=d,l=g,y=T;break;case u:I.test(c.tagName)&&t.activeElement!==c&&e.preventDefault(),h=d-v,S=T-b,it.setScrollTop(Kt-h,!0),v=d,b=T;break;default:case m:case p:var a=i-d,k=l-g,w=k*k+a*a;if(49>w){if(!I.test(n.tagName)){n.focus();var x=t.createEvent("MouseEvents");x.initMouseEvent("click",!0,!0,e.view,1,o.screenX,o.screenY,o.clientX,o.clientY,e.ctrlKey,e.altKey,e.shiftKey,e.metaKey,0,null),n.dispatchEvent(x)}return}n=r;var E=h/S;E=s.max(s.min(E,3),-3);var A=s.abs(E/mt),F=E*A+.5*mt*A*A,C=it.getScrollTop()-F,D=0;C>Ot?(D=(Ot-C)/F,C=Ot):0>C&&(D=-C/F,C=0),A*=1-D,it.animateTo(0|C+.5,{easing:"outCubic",duration:A})}}),e.scrollTo(0,0),o.style.overflow=a.style.overflow="hidden"},j=function(){var e,t,r,n,a,i,l,c,f,u,m,p=o.clientHeight,d=At();for(c=0,f=lt.length;f>c;c++)for(e=lt[c],t=e.element,r=e.anchorTarget,n=e.keyFrames,a=0,i=n.length;i>a;a++)l=n[a],u=l.offset,m=d[l.constant]||0,l.frame=u,l.isPercentage&&(u*=p,l.frame=u),"relative"===l.mode&&(ot(t),l.frame=it.relativeToAbsolute(r,l.anchors[0],l.anchors[1])-u,ot(t,!0)),l.frame+=m,ft&&!l.isEnd&&l.frame>Ot&&(Ot=l.frame);for(Ot=s.max(Ot,Ft()),c=0,f=lt.length;f>c;c++){for(e=lt[c],n=e.keyFrames,a=0,i=n.length;i>a;a++)l=n[a],m=d[l.constant]||0,l.isEnd&&(l.frame=Ot-l.offset+m);e.keyFrames.sort(Nt)}},W=function(e,t){for(var r=0,n=lt.length;n>r;r++){var o,a,s=lt[r],c=s.element,f=s.smoothScrolling?e:t,u=s.keyFrames,m=u.length,p=u[0],y=u[u.length-1],T=p.frame>f,b=f>y.frame,S=T?p:y,k=s.emitEvents,w=s.lastFrameIndex;if(T||b){if(T&&-1===s.edge||b&&1===s.edge)continue;switch(T?(Dt(c,[g],[h,v]),k&&w>-1&&(xt(c,p.eventType,zt),s.lastFrameIndex=-1)):(Dt(c,[h],[g,v]),k&&m>w&&(xt(c,y.eventType,zt),s.lastFrameIndex=m)),s.edge=T?-1:1,s.edgeStrategy){case"reset":ot(c);continue;case"ease":f=S.frame;break;default:case"set":var x=S.props;for(o in x)l.call(x,o)&&(a=nt(x[o].value),0===o.indexOf("@")?c.setAttribute(o.substr(1),a):i.setStyle(c,o,a));continue}}else 0!==s.edge&&(Dt(c,[d,v],[g,h]),s.edge=0);for(var E=0;m-1>E;E++)if(f>=u[E].frame&&u[E+1].frame>=f){var A=u[E],F=u[E+1];for(o in A.props)if(l.call(A.props,o)){var C=(f-A.frame)/(F.frame-A.frame);C=A.props[o].easing(C),a=rt(A.props[o].value,F.props[o].value,C),a=nt(a),0===o.indexOf("@")?c.setAttribute(o.substr(1),a):i.setStyle(c,o,a)}k&&w!==E&&("down"===zt?xt(c,A.eventType,zt):xt(c,F.eventType,zt),s.lastFrameIndex=E);break}}},Z=function(){_t&&(_t=!1,Et());var e,t,n=it.getScrollTop(),o=Pt();if(pt)o>=pt.endTime?(n=pt.targetTop,e=pt.done,pt=r):(t=pt.easing((o-pt.startTime)/pt.duration),n=0|pt.startTop+t*pt.topDiff),it.setScrollTop(n,!0);else if(!ht){var a=vt.targetTop-n;a&&(vt={startTop:qt,topDiff:n-qt,targetTop:n,startTime:Lt,endTime:Lt+gt}),vt.endTime>=o&&(t=U.sqrt((o-vt.startTime)/gt),n=0|vt.startTop+t*vt.topDiff)}if(Gt&&st&&i.setStyle(st,"transform","translate(0, "+-Kt+"px) "+Tt),ht||qt!==n){zt=n>qt?"down":qt>n?"up":zt,ht=!1;var l={curTop:n,lastTop:qt,maxTop:Ot,direction:zt},s=ct.beforerender&&ct.beforerender.call(it,l);s!==!1&&(W(n,it.getScrollTop()),qt=n,ct.render&&ct.render.call(it,l)),e&&e.call(it,!1)}Lt=o},J=function(e){for(var t=0,r=e.keyFrames.length;r>t;t++){for(var n,o,a,i,l=e.keyFrames[t],s={};null!==(i=O.exec(l.props));)a=i[1],o=i[2],n=a.match(V),null!==n?(a=n[1],n=n[2]):n=k,o=o.indexOf("!")?Q(o):[o.slice(1)],s[a]={value:o,easing:U[n]};l.props=s}},Q=function(e){var t=[];return $.lastIndex=0,e=e.replace($,function(e){return e.replace(L,function(e){return 100*(e/255)+"%"})}),G&&(_.lastIndex=0,e=e.replace(_,function(e){return G+e})),e=e.replace(L,function(e){return t.push(+e),"{?}"}),t.unshift(e),t},et=function(e){var t,r,n={};for(t=0,r=e.keyFrames.length;r>t;t++)tt(e.keyFrames[t],n);for(n={},t=e.keyFrames.length-1;t>=0;t--)tt(e.keyFrames[t],n)},tt=function(e,t){var r;for(r in t)l.call(e.props,r)||(e.props[r]=t[r]);for(r in e.props)t[r]=e.props[r]},rt=function(e,t,r){var n,o=e.length;if(o!==t.length)throw"Can't interpolate between \""+e[0]+'" and "'+t[0]+'"';var a=[e[0]];for(n=1;o>n;n++)a[n]=e[n]+(t[n]-e[n])*r;return a},nt=function(e){var t=1;return M.lastIndex=0,e[0].replace(M,function(){return e[t++]})},ot=function(e,t){e=[].concat(e);for(var r,n,o=0,a=e.length;a>o;o++)n=e[o],r=lt[n[H]],r&&(t?(n.style.cssText=r.dirtyStyleAttr,Dt(n,r.dirtyClassAttr)):(r.dirtyStyleAttr=n.style.cssText,r.dirtyClassAttr=Ct(n),n.style.cssText=r.styleAttr,Dt(n,r.classAttr)))},at=function(){Tt="translateZ(0)",i.setStyle(st,"transform",Tt);var e=c(st),t=e.getPropertyValue("transform"),r=e.getPropertyValue(G+"transform"),n=t&&"none"!==t||r&&"none"!==r;n||(Tt="")};i.setStyle=function(e,t,r){var n=e.style;if(t=t.replace(z,q).replace("-",""),"zIndex"===t)n[t]=isNaN(r)?r:""+(0|r);else if("float"===t)n.styleFloat=n.cssFloat=r;else try{B&&(n[B+t.slice(0,1).toUpperCase()+t.slice(1)]=r),n[t]=r}catch(o){}};var it,lt,st,ct,ft,ut,mt,pt,dt,gt,vt,ht,yt,Tt,bt,St=i.addEvent=function(t,r,n){var o=function(t){return t=t||e.event,t.target||(t.target=t.srcElement),t.preventDefault||(t.preventDefault=function(){t.returnValue=!1,t.defaultPrevented=!0}),n.call(this,t)};r=r.split(" ");for(var a,i=0,l=r.length;l>i;i++)a=r[i],t.addEventListener?t.addEventListener(a,n,!1):t.attachEvent("on"+a,o),Yt.push({element:t,name:a,listener:n})},kt=i.removeEvent=function(e,t,r){t=t.split(" ");for(var n=0,o=t.length;o>n;n++)e.removeEventListener?e.removeEventListener(t[n],r,!1):e.detachEvent("on"+t[n],r)},wt=function(){for(var e,t=0,r=Yt.length;r>t;t++)e=Yt[t],kt(e.element,e.name,e.listener);Yt=[]},xt=function(e,t,r){ct.keyframe&&ct.keyframe.call(it,e,t,r)},Et=function(){var e=it.getScrollTop();Ot=0,ft&&!Gt&&(a.style.height=""),j(),ft&&!Gt&&(a.style.height=Ot+o.clientHeight+"px"),Gt?it.setScrollTop(s.min(it.getScrollTop(),Ot)):it.setScrollTop(e,!0),ht=!0},At=function(){var e,t,r=o.clientHeight,n={};for(e in ut)t=ut[e],"function"==typeof t?t=t.call(it):/p$/.test(t)&&(t=t.slice(0,-1)/100*r),n[e]=t;return n},Ft=function(){var e=st&&st.offsetHeight||0,t=s.max(e,a.scrollHeight,a.offsetHeight,o.scrollHeight,o.offsetHeight,o.clientHeight);return t-o.clientHeight},Ct=function(t){var r="className";return e.SVGElement&&t instanceof e.SVGElement&&(t=t[r],r="baseVal"),t[r]},Dt=function(t,n,o){var a="className";if(e.SVGElement&&t instanceof e.SVGElement&&(t=t[a],a="baseVal"),o===r)return t[a]=n,r;for(var i=t[a],l=0,s=o.length;s>l;l++)i=It(i).replace(It(o[l])," ");i=Ht(i);for(var c=0,f=n.length;f>c;c++)-1===It(i).indexOf(It(n[c]))&&(i+=" "+n[c]);t[a]=Ht(i)},Ht=function(e){return e.replace(P,"")},It=function(e){return" "+e+" "},Pt=Date.now||function(){return+new Date},Nt=function(e,t){return e.frame-t.frame},Ot=0,Vt=1,zt="down",qt=-1,Lt=Pt(),Mt=0,$t=0,_t=!1,Bt=0,Gt=!1,Kt=0,Yt=[];"function"==typeof define&&define.amd?define("skrollr",function(){return i}):"undefined"!=typeof module&&module.exports?module.exports=i:e.skrollr=i})(window,document);
//     Underscore.js 1.7.0
//     http://underscorejs.org
//     (c) 2009-2014 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `exports` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var
    push             = ArrayProto.push,
    slice            = ArrayProto.slice,
    concat           = ArrayProto.concat,
    toString         = ObjProto.toString,
    hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind;

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = '1.7.0';

  // Internal function that returns an efficient (for current engines) version
  // of the passed-in callback, to be repeatedly applied in other Underscore
  // functions.
  var createCallback = function(func, context, argCount) {
    if (context === void 0) return func;
    switch (argCount == null ? 3 : argCount) {
      case 1: return function(value) {
        return func.call(context, value);
      };
      case 2: return function(value, other) {
        return func.call(context, value, other);
      };
      case 3: return function(value, index, collection) {
        return func.call(context, value, index, collection);
      };
      case 4: return function(accumulator, value, index, collection) {
        return func.call(context, accumulator, value, index, collection);
      };
    }
    return function() {
      return func.apply(context, arguments);
    };
  };

  // A mostly-internal function to generate callbacks that can be applied
  // to each element in a collection, returning the desired result — either
  // identity, an arbitrary callback, a property matcher, or a property accessor.
  _.iteratee = function(value, context, argCount) {
    if (value == null) return _.identity;
    if (_.isFunction(value)) return createCallback(value, context, argCount);
    if (_.isObject(value)) return _.matches(value);
    return _.property(value);
  };

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles raw objects in addition to array-likes. Treats all
  // sparse array-likes as if they were dense.
  _.each = _.forEach = function(obj, iteratee, context) {
    if (obj == null) return obj;
    iteratee = createCallback(iteratee, context);
    var i, length = obj.length;
    if (length === +length) {
      for (i = 0; i < length; i++) {
        iteratee(obj[i], i, obj);
      }
    } else {
      var keys = _.keys(obj);
      for (i = 0, length = keys.length; i < length; i++) {
        iteratee(obj[keys[i]], keys[i], obj);
      }
    }
    return obj;
  };

  // Return the results of applying the iteratee to each element.
  _.map = _.collect = function(obj, iteratee, context) {
    if (obj == null) return [];
    iteratee = _.iteratee(iteratee, context);
    var keys = obj.length !== +obj.length && _.keys(obj),
        length = (keys || obj).length,
        results = Array(length),
        currentKey;
    for (var index = 0; index < length; index++) {
      currentKey = keys ? keys[index] : index;
      results[index] = iteratee(obj[currentKey], currentKey, obj);
    }
    return results;
  };

  var reduceError = 'Reduce of empty array with no initial value';

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`.
  _.reduce = _.foldl = _.inject = function(obj, iteratee, memo, context) {
    if (obj == null) obj = [];
    iteratee = createCallback(iteratee, context, 4);
    var keys = obj.length !== +obj.length && _.keys(obj),
        length = (keys || obj).length,
        index = 0, currentKey;
    if (arguments.length < 3) {
      if (!length) throw new TypeError(reduceError);
      memo = obj[keys ? keys[index++] : index++];
    }
    for (; index < length; index++) {
      currentKey = keys ? keys[index] : index;
      memo = iteratee(memo, obj[currentKey], currentKey, obj);
    }
    return memo;
  };

  // The right-associative version of reduce, also known as `foldr`.
  _.reduceRight = _.foldr = function(obj, iteratee, memo, context) {
    if (obj == null) obj = [];
    iteratee = createCallback(iteratee, context, 4);
    var keys = obj.length !== + obj.length && _.keys(obj),
        index = (keys || obj).length,
        currentKey;
    if (arguments.length < 3) {
      if (!index) throw new TypeError(reduceError);
      memo = obj[keys ? keys[--index] : --index];
    }
    while (index--) {
      currentKey = keys ? keys[index] : index;
      memo = iteratee(memo, obj[currentKey], currentKey, obj);
    }
    return memo;
  };

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, predicate, context) {
    var result;
    predicate = _.iteratee(predicate, context);
    _.some(obj, function(value, index, list) {
      if (predicate(value, index, list)) {
        result = value;
        return true;
      }
    });
    return result;
  };

  // Return all the elements that pass a truth test.
  // Aliased as `select`.
  _.filter = _.select = function(obj, predicate, context) {
    var results = [];
    if (obj == null) return results;
    predicate = _.iteratee(predicate, context);
    _.each(obj, function(value, index, list) {
      if (predicate(value, index, list)) results.push(value);
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, predicate, context) {
    return _.filter(obj, _.negate(_.iteratee(predicate)), context);
  };

  // Determine whether all of the elements match a truth test.
  // Aliased as `all`.
  _.every = _.all = function(obj, predicate, context) {
    if (obj == null) return true;
    predicate = _.iteratee(predicate, context);
    var keys = obj.length !== +obj.length && _.keys(obj),
        length = (keys || obj).length,
        index, currentKey;
    for (index = 0; index < length; index++) {
      currentKey = keys ? keys[index] : index;
      if (!predicate(obj[currentKey], currentKey, obj)) return false;
    }
    return true;
  };

  // Determine if at least one element in the object matches a truth test.
  // Aliased as `any`.
  _.some = _.any = function(obj, predicate, context) {
    if (obj == null) return false;
    predicate = _.iteratee(predicate, context);
    var keys = obj.length !== +obj.length && _.keys(obj),
        length = (keys || obj).length,
        index, currentKey;
    for (index = 0; index < length; index++) {
      currentKey = keys ? keys[index] : index;
      if (predicate(obj[currentKey], currentKey, obj)) return true;
    }
    return false;
  };

  // Determine if the array or object contains a given value (using `===`).
  // Aliased as `include`.
  _.contains = _.include = function(obj, target) {
    if (obj == null) return false;
    if (obj.length !== +obj.length) obj = _.values(obj);
    return _.indexOf(obj, target) >= 0;
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    var isFunc = _.isFunction(method);
    return _.map(obj, function(value) {
      return (isFunc ? method : value[method]).apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, _.property(key));
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  _.where = function(obj, attrs) {
    return _.filter(obj, _.matches(attrs));
  };

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  _.findWhere = function(obj, attrs) {
    return _.find(obj, _.matches(attrs));
  };

  // Return the maximum element (or element-based computation).
  _.max = function(obj, iteratee, context) {
    var result = -Infinity, lastComputed = -Infinity,
        value, computed;
    if (iteratee == null && obj != null) {
      obj = obj.length === +obj.length ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value > result) {
          result = value;
        }
      }
    } else {
      iteratee = _.iteratee(iteratee, context);
      _.each(obj, function(value, index, list) {
        computed = iteratee(value, index, list);
        if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iteratee, context) {
    var result = Infinity, lastComputed = Infinity,
        value, computed;
    if (iteratee == null && obj != null) {
      obj = obj.length === +obj.length ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value < result) {
          result = value;
        }
      }
    } else {
      iteratee = _.iteratee(iteratee, context);
      _.each(obj, function(value, index, list) {
        computed = iteratee(value, index, list);
        if (computed < lastComputed || computed === Infinity && result === Infinity) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Shuffle a collection, using the modern version of the
  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
  _.shuffle = function(obj) {
    var set = obj && obj.length === +obj.length ? obj : _.values(obj);
    var length = set.length;
    var shuffled = Array(length);
    for (var index = 0, rand; index < length; index++) {
      rand = _.random(0, index);
      if (rand !== index) shuffled[index] = shuffled[rand];
      shuffled[rand] = set[index];
    }
    return shuffled;
  };

  // Sample **n** random values from a collection.
  // If **n** is not specified, returns a single random element.
  // The internal `guard` argument allows it to work with `map`.
  _.sample = function(obj, n, guard) {
    if (n == null || guard) {
      if (obj.length !== +obj.length) obj = _.values(obj);
      return obj[_.random(obj.length - 1)];
    }
    return _.shuffle(obj).slice(0, Math.max(0, n));
  };

  // Sort the object's values by a criterion produced by an iteratee.
  _.sortBy = function(obj, iteratee, context) {
    iteratee = _.iteratee(iteratee, context);
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value: value,
        index: index,
        criteria: iteratee(value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index - right.index;
    }), 'value');
  };

  // An internal function used for aggregate "group by" operations.
  var group = function(behavior) {
    return function(obj, iteratee, context) {
      var result = {};
      iteratee = _.iteratee(iteratee, context);
      _.each(obj, function(value, index) {
        var key = iteratee(value, index, obj);
        behavior(result, value, key);
      });
      return result;
    };
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = group(function(result, value, key) {
    if (_.has(result, key)) result[key].push(value); else result[key] = [value];
  });

  // Indexes the object's values by a criterion, similar to `groupBy`, but for
  // when you know that your index values will be unique.
  _.indexBy = group(function(result, value, key) {
    result[key] = value;
  });

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = group(function(result, value, key) {
    if (_.has(result, key)) result[key]++; else result[key] = 1;
  });

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iteratee, context) {
    iteratee = _.iteratee(iteratee, context, 1);
    var value = iteratee(obj);
    var low = 0, high = array.length;
    while (low < high) {
      var mid = low + high >>> 1;
      if (iteratee(array[mid]) < value) low = mid + 1; else high = mid;
    }
    return low;
  };

  // Safely create a real, live array from anything iterable.
  _.toArray = function(obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    if (obj.length === +obj.length) return _.map(obj, _.identity);
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    if (obj == null) return 0;
    return obj.length === +obj.length ? obj.length : _.keys(obj).length;
  };

  // Split a collection into two arrays: one whose elements all satisfy the given
  // predicate, and one whose elements all do not satisfy the predicate.
  _.partition = function(obj, predicate, context) {
    predicate = _.iteratee(predicate, context);
    var pass = [], fail = [];
    _.each(obj, function(value, key, obj) {
      (predicate(value, key, obj) ? pass : fail).push(value);
    });
    return [pass, fail];
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[0];
    if (n < 0) return [];
    return slice.call(array, 0, n);
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N. The **guard** check allows it to work with
  // `_.map`.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array. The **guard** check allows it to work with `_.map`.
  _.last = function(array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[array.length - 1];
    return slice.call(array, Math.max(array.length - n, 0));
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array. The **guard**
  // check allows it to work with `_.map`.
  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, n == null || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, _.identity);
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, strict, output) {
    if (shallow && _.every(input, _.isArray)) {
      return concat.apply(output, input);
    }
    for (var i = 0, length = input.length; i < length; i++) {
      var value = input[i];
      if (!_.isArray(value) && !_.isArguments(value)) {
        if (!strict) output.push(value);
      } else if (shallow) {
        push.apply(output, value);
      } else {
        flatten(value, shallow, strict, output);
      }
    }
    return output;
  };

  // Flatten out an array, either recursively (by default), or just one level.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, false, []);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iteratee, context) {
    if (array == null) return [];
    if (!_.isBoolean(isSorted)) {
      context = iteratee;
      iteratee = isSorted;
      isSorted = false;
    }
    if (iteratee != null) iteratee = _.iteratee(iteratee, context);
    var result = [];
    var seen = [];
    for (var i = 0, length = array.length; i < length; i++) {
      var value = array[i];
      if (isSorted) {
        if (!i || seen !== value) result.push(value);
        seen = value;
      } else if (iteratee) {
        var computed = iteratee(value, i, array);
        if (_.indexOf(seen, computed) < 0) {
          seen.push(computed);
          result.push(value);
        }
      } else if (_.indexOf(result, value) < 0) {
        result.push(value);
      }
    }
    return result;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(flatten(arguments, true, true, []));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    if (array == null) return [];
    var result = [];
    var argsLength = arguments.length;
    for (var i = 0, length = array.length; i < length; i++) {
      var item = array[i];
      if (_.contains(result, item)) continue;
      for (var j = 1; j < argsLength; j++) {
        if (!_.contains(arguments[j], item)) break;
      }
      if (j === argsLength) result.push(item);
    }
    return result;
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = flatten(slice.call(arguments, 1), true, true, []);
    return _.filter(array, function(value){
      return !_.contains(rest, value);
    });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function(array) {
    if (array == null) return [];
    var length = _.max(arguments, 'length').length;
    var results = Array(length);
    for (var i = 0; i < length; i++) {
      results[i] = _.pluck(arguments, i);
    }
    return results;
  };

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values.
  _.object = function(list, values) {
    if (list == null) return {};
    var result = {};
    for (var i = 0, length = list.length; i < length; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // Return the position of the first occurrence of an item in an array,
  // or -1 if the item is not included in the array.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = function(array, item, isSorted) {
    if (array == null) return -1;
    var i = 0, length = array.length;
    if (isSorted) {
      if (typeof isSorted == 'number') {
        i = isSorted < 0 ? Math.max(0, length + isSorted) : isSorted;
      } else {
        i = _.sortedIndex(array, item);
        return array[i] === item ? i : -1;
      }
    }
    for (; i < length; i++) if (array[i] === item) return i;
    return -1;
  };

  _.lastIndexOf = function(array, item, from) {
    if (array == null) return -1;
    var idx = array.length;
    if (typeof from == 'number') {
      idx = from < 0 ? idx + from + 1 : Math.min(idx, from + 1);
    }
    while (--idx >= 0) if (array[idx] === item) return idx;
    return -1;
  };

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (arguments.length <= 1) {
      stop = start || 0;
      start = 0;
    }
    step = step || 1;

    var length = Math.max(Math.ceil((stop - start) / step), 0);
    var range = Array(length);

    for (var idx = 0; idx < length; idx++, start += step) {
      range[idx] = start;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Reusable constructor function for prototype setting.
  var Ctor = function(){};

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  _.bind = function(func, context) {
    var args, bound;
    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError('Bind must be called on a function');
    args = slice.call(arguments, 2);
    bound = function() {
      if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));
      Ctor.prototype = func.prototype;
      var self = new Ctor;
      Ctor.prototype = null;
      var result = func.apply(self, args.concat(slice.call(arguments)));
      if (_.isObject(result)) return result;
      return self;
    };
    return bound;
  };

  // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context. _ acts
  // as a placeholder, allowing any combination of arguments to be pre-filled.
  _.partial = function(func) {
    var boundArgs = slice.call(arguments, 1);
    return function() {
      var position = 0;
      var args = boundArgs.slice();
      for (var i = 0, length = args.length; i < length; i++) {
        if (args[i] === _) args[i] = arguments[position++];
      }
      while (position < arguments.length) args.push(arguments[position++]);
      return func.apply(this, args);
    };
  };

  // Bind a number of an object's methods to that object. Remaining arguments
  // are the method names to be bound. Useful for ensuring that all callbacks
  // defined on an object belong to it.
  _.bindAll = function(obj) {
    var i, length = arguments.length, key;
    if (length <= 1) throw new Error('bindAll must be passed function names');
    for (i = 1; i < length; i++) {
      key = arguments[i];
      obj[key] = _.bind(obj[key], obj);
    }
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memoize = function(key) {
      var cache = memoize.cache;
      var address = hasher ? hasher.apply(this, arguments) : key;
      if (!_.has(cache, address)) cache[address] = func.apply(this, arguments);
      return cache[address];
    };
    memoize.cache = {};
    return memoize;
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){
      return func.apply(null, args);
    }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = function(func) {
    return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
  };

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time. Normally, the throttled function will run
  // as much as it can, without ever going more than once per `wait` duration;
  // but if you'd like to disable the execution on the leading edge, pass
  // `{leading: false}`. To disable execution on the trailing edge, ditto.
  _.throttle = function(func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    if (!options) options = {};
    var later = function() {
      previous = options.leading === false ? 0 : _.now();
      timeout = null;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    };
    return function() {
      var now = _.now();
      if (!previous && options.leading === false) previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0 || remaining > wait) {
        clearTimeout(timeout);
        timeout = null;
        previous = now;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout, args, context, timestamp, result;

    var later = function() {
      var last = _.now() - timestamp;

      if (last < wait && last > 0) {
        timeout = setTimeout(later, wait - last);
      } else {
        timeout = null;
        if (!immediate) {
          result = func.apply(context, args);
          if (!timeout) context = args = null;
        }
      }
    };

    return function() {
      context = this;
      args = arguments;
      timestamp = _.now();
      var callNow = immediate && !timeout;
      if (!timeout) timeout = setTimeout(later, wait);
      if (callNow) {
        result = func.apply(context, args);
        context = args = null;
      }

      return result;
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return _.partial(wrapper, func);
  };

  // Returns a negated version of the passed-in predicate.
  _.negate = function(predicate) {
    return function() {
      return !predicate.apply(this, arguments);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var args = arguments;
    var start = args.length - 1;
    return function() {
      var i = start;
      var result = args[start].apply(this, arguments);
      while (i--) result = args[i].call(this, result);
      return result;
    };
  };

  // Returns a function that will only be executed after being called N times.
  _.after = function(times, func) {
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Returns a function that will only be executed before being called N times.
  _.before = function(times, func) {
    var memo;
    return function() {
      if (--times > 0) {
        memo = func.apply(this, arguments);
      } else {
        func = null;
      }
      return memo;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = _.partial(_.before, 2);

  // Object Functions
  // ----------------

  // Retrieve the names of an object's properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = function(obj) {
    if (!_.isObject(obj)) return [];
    if (nativeKeys) return nativeKeys(obj);
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys.push(key);
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var values = Array(length);
    for (var i = 0; i < length; i++) {
      values[i] = obj[keys[i]];
    }
    return values;
  };

  // Convert an object into a list of `[key, value]` pairs.
  _.pairs = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var pairs = Array(length);
    for (var i = 0; i < length; i++) {
      pairs[i] = [keys[i], obj[keys[i]]];
    }
    return pairs;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function(obj) {
    var result = {};
    var keys = _.keys(obj);
    for (var i = 0, length = keys.length; i < length; i++) {
      result[obj[keys[i]]] = keys[i];
    }
    return result;
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = function(obj) {
    if (!_.isObject(obj)) return obj;
    var source, prop;
    for (var i = 1, length = arguments.length; i < length; i++) {
      source = arguments[i];
      for (prop in source) {
        if (hasOwnProperty.call(source, prop)) {
            obj[prop] = source[prop];
        }
      }
    }
    return obj;
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(obj, iteratee, context) {
    var result = {}, key;
    if (obj == null) return result;
    if (_.isFunction(iteratee)) {
      iteratee = createCallback(iteratee, context);
      for (key in obj) {
        var value = obj[key];
        if (iteratee(value, key, obj)) result[key] = value;
      }
    } else {
      var keys = concat.apply([], slice.call(arguments, 1));
      obj = new Object(obj);
      for (var i = 0, length = keys.length; i < length; i++) {
        key = keys[i];
        if (key in obj) result[key] = obj[key];
      }
    }
    return result;
  };

   // Return a copy of the object without the blacklisted properties.
  _.omit = function(obj, iteratee, context) {
    if (_.isFunction(iteratee)) {
      iteratee = _.negate(iteratee);
    } else {
      var keys = _.map(concat.apply([], slice.call(arguments, 1)), String);
      iteratee = function(value, key) {
        return !_.contains(keys, key);
      };
    }
    return _.pick(obj, iteratee, context);
  };

  // Fill in a given object with default properties.
  _.defaults = function(obj) {
    if (!_.isObject(obj)) return obj;
    for (var i = 1, length = arguments.length; i < length; i++) {
      var source = arguments[i];
      for (var prop in source) {
        if (obj[prop] === void 0) obj[prop] = source[prop];
      }
    }
    return obj;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Internal recursive comparison function for `isEqual`.
  var eq = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) return a !== 0 || 1 / a === 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className !== toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, regular expressions, dates, and booleans are compared by value.
      case '[object RegExp]':
      // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return '' + a === '' + b;
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive.
        // Object(NaN) is equivalent to NaN
        if (+a !== +a) return +b !== +b;
        // An `egal` comparison is performed for other numeric values.
        return +a === 0 ? 1 / +a === 1 / b : +a === +b;
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a === +b;
    }
    if (typeof a != 'object' || typeof b != 'object') return false;
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] === a) return bStack[length] === b;
    }
    // Objects with different constructors are not equivalent, but `Object`s
    // from different frames are.
    var aCtor = a.constructor, bCtor = b.constructor;
    if (
      aCtor !== bCtor &&
      // Handle Object.create(x) cases
      'constructor' in a && 'constructor' in b &&
      !(_.isFunction(aCtor) && aCtor instanceof aCtor &&
        _.isFunction(bCtor) && bCtor instanceof bCtor)
    ) {
      return false;
    }
    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);
    var size, result;
    // Recursively compare objects and arrays.
    if (className === '[object Array]') {
      // Compare array lengths to determine if a deep comparison is necessary.
      size = a.length;
      result = size === b.length;
      if (result) {
        // Deep compare the contents, ignoring non-numeric properties.
        while (size--) {
          if (!(result = eq(a[size], b[size], aStack, bStack))) break;
        }
      }
    } else {
      // Deep compare objects.
      var keys = _.keys(a), key;
      size = keys.length;
      // Ensure that both objects contain the same number of properties before comparing deep equality.
      result = _.keys(b).length === size;
      if (result) {
        while (size--) {
          // Deep compare each member
          key = keys[size];
          if (!(result = _.has(b, key) && eq(a[key], b[key], aStack, bStack))) break;
        }
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return result;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b, [], []);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (_.isArray(obj) || _.isString(obj) || _.isArguments(obj)) return obj.length === 0;
    for (var key in obj) if (_.has(obj, key)) return false;
    return true;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) === '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    var type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp.
  _.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) === '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return _.has(obj, 'callee');
    };
  }

  // Optimize `isFunction` if appropriate. Work around an IE 11 bug.
  if (typeof /./ !== 'function') {
    _.isFunction = function(obj) {
      return typeof obj == 'function' || false;
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return isFinite(obj) && !isNaN(parseFloat(obj));
  };

  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
  _.isNaN = function(obj) {
    return _.isNumber(obj) && obj !== +obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, key) {
    return obj != null && hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iteratees.
  _.identity = function(value) {
    return value;
  };

  // Predicate-generating functions. Often useful outside of Underscore.
  _.constant = function(value) {
    return function() {
      return value;
    };
  };

  _.noop = function(){};

  _.property = function(key) {
    return function(obj) {
      return obj[key];
    };
  };

  // Returns a predicate for checking whether an object has a given set of `key:value` pairs.
  _.matches = function(attrs) {
    var pairs = _.pairs(attrs), length = pairs.length;
    return function(obj) {
      if (obj == null) return !length;
      obj = new Object(obj);
      for (var i = 0; i < length; i++) {
        var pair = pairs[i], key = pair[0];
        if (pair[1] !== obj[key] || !(key in obj)) return false;
      }
      return true;
    };
  };

  // Run a function **n** times.
  _.times = function(n, iteratee, context) {
    var accum = Array(Math.max(0, n));
    iteratee = createCallback(iteratee, context, 1);
    for (var i = 0; i < n; i++) accum[i] = iteratee(i);
    return accum;
  };

  // Return a random integer between min and max (inclusive).
  _.random = function(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  // A (possibly faster) way to get the current timestamp as an integer.
  _.now = Date.now || function() {
    return new Date().getTime();
  };

   // List of HTML entities for escaping.
  var escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '`': '&#x60;'
  };
  var unescapeMap = _.invert(escapeMap);

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  var createEscaper = function(map) {
    var escaper = function(match) {
      return map[match];
    };
    // Regexes for identifying a key that needs to be escaped
    var source = '(?:' + _.keys(map).join('|') + ')';
    var testRegexp = RegExp(source);
    var replaceRegexp = RegExp(source, 'g');
    return function(string) {
      string = string == null ? '' : '' + string;
      return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
    };
  };
  _.escape = createEscaper(escapeMap);
  _.unescape = createEscaper(unescapeMap);

  // If the value of the named `property` is a function then invoke it with the
  // `object` as context; otherwise, return it.
  _.result = function(object, property) {
    if (object == null) return void 0;
    var value = object[property];
    return _.isFunction(value) ? object[property]() : value;
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'":      "'",
    '\\':     '\\',
    '\r':     'r',
    '\n':     'n',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escaper = /\\|'|\r|\n|\u2028|\u2029/g;

  var escapeChar = function(match) {
    return '\\' + escapes[match];
  };

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  // NB: `oldSettings` only exists for backwards compatibility.
  _.template = function(text, settings, oldSettings) {
    if (!settings && oldSettings) settings = oldSettings;
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset).replace(escaper, escapeChar);
      index = offset + match.length;

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      } else if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      } else if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }

      // Adobe VMs need the match returned to produce the correct offest.
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + 'return __p;\n';

    try {
      var render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled source as a convenience for precompilation.
    var argument = settings.variable || 'obj';
    template.source = 'function(' + argument + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function. Start chaining a wrapped Underscore object.
  _.chain = function(obj) {
    var instance = _(obj);
    instance._chain = true;
    return instance;
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var result = function(obj) {
    return this._chain ? _(obj).chain() : obj;
  };

  // Add your own custom functions to the Underscore object.
  _.mixin = function(obj) {
    _.each(_.functions(obj), function(name) {
      var func = _[name] = obj[name];
      _.prototype[name] = function() {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return result.call(this, func.apply(_, args));
      };
    });
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  _.each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name === 'shift' || name === 'splice') && obj.length === 0) delete obj[0];
      return result.call(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  _.each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      return result.call(this, method.apply(this._wrapped, arguments));
    };
  });

  // Extracts the result from a wrapped and chained object.
  _.prototype.value = function() {
    return this._wrapped;
  };

  // AMD registration happens at the end for compatibility with AMD loaders
  // that may not enforce next-turn semantics on modules. Even though general
  // practice for AMD registration is to be anonymous, underscore registers
  // as a named module because, like jQuery, it is a base library that is
  // popular enough to be bundled in a third party lib, but not be part of
  // an AMD load request. Those cases could generate an error when an
  // anonymous define() is called outside of a loader request.
  if (typeof define === 'function' && define.amd) {
    define('underscore', [], function() {
      return _;
    });
  }
}.call(this));