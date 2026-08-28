/*!
 * mdui 1.0.2 (https://mdui.org)
 * Copyright 2016-2021 zdhxiong
 * Licensed under MIT
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.mdui = factory());
}(this, (function () { 'use strict';

  !function(){try{return new MouseEvent("test")}catch(e$1){}var e=function(e,t){t=t||{bubbles:!1,cancelable:!1};var n=document.createEvent("MouseEvent");return n.initMouseEvent(e,t.bubbles,t.cancelable,window,0,t.screenX||0,t.screenY||0,t.clientX||0,t.clientY||0,t.ctrlKey||!1,t.altKey||!1,t.shiftKey||!1,t.metaKey||!1,t.button||0,t.relatedTarget||null),n};e.prototype=Event.prototype,window.MouseEvent=e;}();

  !function(){function t(t,e){e=e||{bubbles:!1,cancelable:!1,detail:void 0};var n=document.createEvent("CustomEvent");return n.initCustomEvent(t,e.bubbles,e.cancelable,e.detail),n}"function"!=typeof window.CustomEvent&&(t.prototype=window.Event.prototype,window.CustomEvent=t);}();

  /**
   * @this {Promise}
   */
  function finallyConstructor(callback) {
    var constructor = this.constructor;
    return this.then(
      function(value) {
        // @ts-ignore
        return constructor.resolve(callback()).then(function() {
          return value;
        });
      },
      function(reason) {
        // @ts-ignore
        return constructor.resolve(callback()).then(function() {
          // @ts-ignore
          return constructor.reject(reason);
        });
      }
    );
  }

  function allSettled(arr) {
    var P = this;
    return new P(function(resolve, reject) {
      if (!(arr && typeof arr.length !== 'undefined')) {
        return reject(
          new TypeError(
            typeof arr +
              ' ' +
              arr +
              ' is not iterable(cannot read property Symbol(Symbol.iterator))'
          )
        );
      }
      var args = Array.prototype.slice.call(arr);
      if (args.length === 0) { return resolve([]); }
      var remaining = args.length;

      function res(i, val) {
        if (val && (typeof val === 'object' || typeof val === 'function')) {
          var then = val.then;
          if (typeof then === 'function') {
            then.call(
              val,
              function(val) {
                res(i, val);
              },
              function(e) {
                args[i] = { status: 'rejected', reason: e };
                if (--remaining === 0) {
                  resolve(args);
                }
              }
            );
            return;
          }
        }
        args[i] = { status: 'fulfilled', value: val };
        if (--remaining === 0) {
          resolve(args);
        }
      }

      for (var i = 0; i < args.length; i++) {
        res(i, args[i]);
      }
    });
  }

  // Store setTimeout reference so promise-polyfill will be unaffected by
  // other code modifying setTimeout (like sinon.useFakeTimers())
  var setTimeoutFunc = setTimeout;

  function isArray(x) {
    return Boolean(x && typeof x.length !== 'undefined');
  }

  function noop() {}

  // Polyfill for Function.prototype.bind
  function bind(fn, thisArg) {
    return function() {
      fn.apply(thisArg, arguments);
    };
  }

  /**
   * @constructor
   * @param {Function} fn
   */
  function Promise$1(fn) {
    if (!(this instanceof Promise$1))
      { throw new TypeError('Promises must be constructed via new'); }
    if (typeof fn !== 'function') { throw new TypeError('not a function'); }
    /** @type {!number} */
    this._state = 0;
    /** @type {!boolean} */
    this._handled = false;
    /** @type {Promise|undefined} */
    this._value = undefined;
    /** @type {!Array<!Function>} */
    this._deferreds = [];

    doResolve(fn, this);
  }

  function handle(self, deferred) {
    while (self._state === 3) {
      self = self._value;
    }
    if (self._state === 0) {
      self._deferreds.push(deferred);
      return;
    }
    self._handled = true;
    Promise$1._immediateFn(function() {
      var cb = self._state === 1 ? deferred.onFulfilled : deferred.onRejected;
      if (cb === null) {
        (self._state === 1 ? resolve : reject)(deferred.promise, self._value);
        return;
      }
      var ret;
      try {
        ret = cb(self._value);
      } catch (e) {
        reject(deferred.promise, e);
        return;
      }
      resolve(deferred.promise, ret);
    });
  }

  function resolve(self, newValue) {
    try {
      // Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
      if (newValue === self)
        { throw new TypeError('A promise cannot be resolved with itself.'); }
      if (
        newValue &&
        (typeof newValue === 'object' || typeof newValue === 'function')
      ) {
        var then = newValue.then;
        if (newValue instanceof Promise$1) {
          self._state = 3;
          self._value = newValue;
          finale(self);
          return;
        } else if (typeof then === 'function') {
          doResolve(bind(then, newValue), self);
          return;
        }
      }
      self._state = 1;
      self._value = newValue;
      finale(self);
    } catch (e) {
      reject(self, e);
    }
  }

  function reject(self, newValue) {
    self._state = 2;
    self._value = newValue;
    finale(self);
  }

  function finale(self) {
    if (self._state === 2 && self._deferreds.length === 0) {
      Promise$1._immediateFn(function() {
        if (!self._handled) {
          Promise$1._unhandledRejectionFn(self._value);
        }
      });
    }

    for (var i = 0, len = self._deferreds.length; i < len; i++) {
      handle(self, self._deferreds[i]);
    }
    self._deferreds = null;
  }

  /**
   * @constructor
   */
  function Handler(onFulfilled, onRejected, promise) {
    this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
    this.onRejected = typeof onRejected === 'function' ? onRejected : null;
    this.promise = promise;
  }

  /**
   * Take a potentially misbehaving resolver function and make sure
   * onFulfilled and onRejected are only called once.
   *
   * Makes no guarantees about asynchrony.
   */
  function doResolve(fn, self) {
    var done = false;
    try {
      fn(
        function(value) {
          if (done) { return; }
          done = true;
          resolve(self, value);
        },
        function(reason) {
          if (done) { return; }
          done = true;
          reject(self, reason);
        }
      );
    } catch (ex) {
      if (done) { return; }
      done = true;
      reject(self, ex);
    }
  }

  Promise$1.prototype['catch'] = function(onRejected) {
    return this.then(null, onRejected);
  };

  Promise$1.prototype.then = function(onFulfilled, onRejected) {
    // @ts-ignore
    var prom = new this.constructor(noop);

    handle(this, new Handler(onFulfilled, onRejected, prom));
    return prom;
  };

  Promise$1.prototype['finally'] = finallyConstructor;

  Promise$1.all = function(arr) {
    return new Promise$1(function(resolve, reject) {
      if (!isArray(arr)) {
        return reject(new TypeError('Promise.all accepts an array'));
      }

      var args = Array.prototype.slice.call(arr);
      if (args.length === 0) { return resolve([]); }
      var remaining = args.length;

      function res(i, val) {
        try {
          if (val && (typeof val === 'object' || typeof val === 'function')) {
            var then = val.then;
            if (typeof then === 'function') {
              then.call(
                val,
                function(val) {
                  res(i, val);
                },
                reject
              );
              return;
            }
          }
          args[i] = val;
          if (--remaining === 0) {
            resolve(args);
          }
        } catch (ex) {
          reject(ex);
        }
      }

      for (var i = 0; i < args.length; i++) {
        res(i, args[i]);
      }
    });
  };

  Promise$1.allSettled = allSettled;

  Promise$1.resolve = function(value) {
    if (value && typeof value === 'object' && value.constructor === Promise$1) {
      return value;
    }

    return new Promise$1(function(resolve) {
      resolve(value);
    });
  };

  Promise$1.reject = function(value) {
    return new Promise$1(function(resolve, reject) {
      reject(value);
    });
  };

  Promise$1.race = function(arr) {
    return new Promise$1(function(resolve, reject) {
      if (!isArray(arr)) {
        return reject(new TypeError('Promise.race accepts an array'));
      }

      for (var i = 0, len = arr.length; i < len; i++) {
        Promise$1.resolve(arr[i]).then(resolve, reject);
      }
    });
  };

  // Use polyfill for setImmediate for performance gains
  Promise$1._immediateFn =
    // @ts-ignore
    (typeof setImmediate === 'function' &&
      function(fn) {
        // @ts-ignore
        setImmediate(fn);
      }) ||
    function(fn) {
      setTimeoutFunc(fn, 0);
    };

  Promise$1._unhandledRejectionFn = function _unhandledRejectionFn(err) {
    if (typeof console !== 'undefined' && console) {
      console.warn('Possible Unhandled Promise Rejection:', err); // eslint-disable-line no-console
    }
  };

  /** @suppress {undefinedVars} */
  var globalNS = (function() {
    // the only reliable means to get the global object is
    // `Function('return this')()`
    // However, this causes CSP violations in Chrome apps.
    if (typeof self !== 'undefined') {
      return self;
    }
    if (typeof window !== 'undefined') {
      return window;
    }
    if (typeof global !== 'undefined') {
      return global;
    }
    throw new Error('unable to locate global object');
  })();

  // Expose the polyfill if Promise is undefined or set to a
  // non-function value. The latter can be due to a named HTMLElement
  // being exposed by browsers for legacy reasons.
  // https://github.com/taylorhakes/promise-polyfill/issues/114
  if (typeof globalNS['Promise'] !== 'function') {
    globalNS['Promise'] = Promise$1;
  } else if (!globalNS.Promise.prototype['finally']) {
    globalNS.Promise.prototype['finally'] = finallyConstructor;
  } else if (!globalNS.Promise.allSettled) {
    globalNS.Promise.allSettled = allSettled;
  }

  function isFunction(target) {
      return typeof target === 'function';
  }
  function isString(target) {
      return typeof target === 'string';
  }
  function isNumber(target) {
      return typeof target === 'number';
  }
  function isBoolean(target) {
      return typeof target === 'boolean';
  }
  function isUndefined(target) {
      return typeof target === 'undefined';
  }
  function isNull(target) {
      return target === null;
  }
  function isWindow(target) {
      return target instanceof Window;
  }
  function isDocument(target) {
      return target instanceof Document;
  }
  function isElement(target) {
      return target instanceof Element;
  }
  function isNode(target) {
      return target instanceof Node;
  }
  /**
   * 是否是 IE 浏览器
   */
  function isIE() {
      // @ts-ignore
      return !!window.document.documentMode;
  }
  function isArrayLike(target) {
      if (isFunction(target) || isWindow(target)) {
          return false;
      }
      return isNumber(target.length);
  }
  function isObjectLike(target) {
      return typeof target === 'object' && target !== null;
  }
  function toElement(target) {
      return isDocument(target) ? target.documentElement : target;
  }
  /**
   * 把用 - 分隔的字符串转为驼峰（如 box-sizing 转换为 boxSizing）
   * @param string
   */
  function toCamelCase(string) {
      return string
          .replace(/^-ms-/, 'ms-')
          .replace(/-([a-z])/g, function (_, letter) { return letter.toUpperCase(); });
  }
  /**
   * 把驼峰法转为用 - 分隔的字符串（如 boxSizing 转换为 box-sizing）
   * @param string
   */
  function toKebabCase(string) {
      return string.replace(/[A-Z]/g, function (replacer) { return '-' + replacer.toLowerCase(); });
  }
  /**
   * 获取元素的样式值
   * @param element
   * @param name
   */
  function getComputedStyleValue(element, name) {
      return window.getComputedStyle(element).getPropertyValue(toKebabCase(name));
  }
  /**
   * 检查元素的 box-sizing 是否是 border-box
   * @param element
   */
  function isBorderBox(element) {
      return getComputedStyleValue(element, 'box-sizing') === 'border-box';
  }
  /**
   * 获取元素的 padding, border, margin 宽度（两侧宽度的和，单位为px）
   * @param element
   * @param direction
   * @param extra
   */
  function getExtraWidth(element, direction, extra) {
      var position = direction === 'width' ? ['Left', 'Right'] : ['Top', 'Bottom'];
      return [0, 1].reduce(function (prev, _, index) {
          var prop = extra + position[index];
          if (extra === 'border') {
              prop += 'Width';
          }
          return prev + parseFloat(getComputedStyleValue(element, prop) || '0');
      }, 0);
  }
  /**
   * 获取元素的样式值，对 width 和 height 进行过处理
   * @param element
   * @param name
   */
  function getStyle(element, name) {
      // width、height 属性使用 getComputedStyle 得到的值不准确，需要使用 getBoundingClientRect 获取
      if (name === 'width' || name === 'height') {
          var valueNumber = element.getBoundingClientRect()[name];
          if (isBorderBox(element)) {
              return (valueNumber + "px");
          }
          return ((valueNumber -
              getExtraWidth(element, name, 'border') -
              getExtraWidth(element, name, 'padding')) + "px");
      }
      return getComputedStyleValue(element, name);
  }
  /**
   * 获取子节点组成的数组
   * @param target
   * @param parent
   */
  function getChildNodesArray(target, parent) {
      var tempParent = document.createElement(parent);
      tempParent.innerHTML = target;
      return [].slice.call(tempParent.childNodes);
  }
  /**
   * 始终返回 false 的函数
   */
  function returnFalse() {
      return false;
  }
  /**
   * 数值单位的 CSS 属性
   */
  var cssNumber = [
      'animationIterationCount',
      'columnCount',
      'fillOpacity',
      'flexGrow',
      'flexShrink',
      'fontWeight',
      'gridArea',
      'gridColumn',
      'gridColumnEnd',
      'gridColumnStart',
      'gridRow',
      'gridRowEnd',
      'gridRowStart',
      'lineHeight',
      'opacity',
      'order',
      'orphans',
      'widows',
      'zIndex',
      'zoom' ];

  function each(target, callback) {
      if (isArrayLike(target)) {
          for (var i = 0; i < target.length; i += 1) {
              if (callback.call(target[i], i, target[i]) === false) {
                  return target;
              }
          }
      }
      else {
          var keys = Object.keys(target);
          for (var i$1 = 0; i$1 < keys.length; i$1 += 1) {
              if (callback.call(target[keys[i$1]], keys[i$1], target[keys[i$1]]) === false) {
                  return target;
              }
          }
      }
      return target;
  }

  /**
   * 为了使用模块扩充，这里不能使用默认导出
   */
  var JQ = function JQ(arr) {
      var this$1 = this;

      this.length = 0;
      if (!arr) {
          return this;
      }
      each(arr, function (i, item) {
          // @ts-ignore
          this$1[i] = item;
      });
      this.length = arr.length;
      return this;
  };

  function get$() {
      var $ = function (selector) {
          if (!selector) {
              return new JQ();
          }
          // JQ
          if (selector instanceof JQ) {
              return selector;
          }
          // function
          if (isFunction(selector)) {
              if (/complete|loaded|interactive/.test(document.readyState) &&
                  document.body) {
                  selector.call(document, $);
              }
              else {
                  document.addEventListener('DOMContentLoaded', function () { return selector.call(document, $); }, false);
              }
              return new JQ([document]);
          }
          // String
          if (isString(selector)) {
              var html = selector.trim();
              // 根据 HTML 字符串创建 JQ 对象
              if (html[0] === '<' && html[html.length - 1] === '>') {
                  var toCreate = 'div';
                  var tags = {
                      li: 'ul',
                      tr: 'tbody',
                      td: 'tr',
                      th: 'tr',
                      tbody: 'table',
                      option: 'select',
                  };
                  each(tags, function (childTag, parentTag) {
                      if (html.indexOf(("<" + childTag)) === 0) {
                          toCreate = parentTag;
                          return false;
                      }
                      return;
                  });
                  return new JQ(getChildNodesArray(html, toCreate));
              }
              // 根据 CSS 选择器创建 JQ 对象
              var isIdSelector = selector[0] === '#' && !selector.match(/[ .<>:~]/);
              if (!isIdSelector) {
                  return new JQ(document.querySelectorAll(selector));
              }
              var element = document.getElementById(selector.slice(1));
              if (element) {
                  return new JQ([element]);
              }
              return new JQ();
          }
          if (isArrayLike(selector) && !isNode(selector)) {
              return new JQ(selector);
          }
          return new JQ([selector]);
      };
      $.fn = JQ.prototype;
      return $;
  }
  var $ = get$();

  // 避免页面加载完后直接执行css动画
  // https://css-tricks.com/transitions-only-after-page-load/
  setTimeout(function () { return $('body').addClass('mdui-loaded'); });
  var mdui = {
      $: $,
  };

  $.fn.each = function (callback) {
      return each(this, callback);
  };

  /**
   * 检查 container 元素内是否包含 contains 元素
   * @param container 父元素
   * @param contains 子元素
   * @example
  ```js
  contains( document, document.body ); // true
  contains( document.getElementById('test'), document ); // false
  contains( $('.container').get(0), $('.contains').get(0) ); // false
  ```
   */
  function contains(container, contains) {
      return container !== contains && toElement(container).contains(contains);
  }

  /**
   * 把第二个数组的元素追加到第一个数组中，并返回合并后的数组
   * @param first 第一个数组
   * @param second 该数组的元素将被追加到第一个数组中
   * @example
  ```js
  merge( [ 0, 1, 2 ], [ 2, 3, 4 ] )
  // [ 0, 1, 2, 2, 3, 4 ]
  ```
   */
  function merge(first, second) {
      each(second, function (_, value) {
          first.push(value);
      });
      return first;
  }

  $.fn.get = function (index) {
      return index === undefined
          ? [].slice.call(this)
          : this[index >= 0 ? index : index + this.length];
  };

  $.fn.find = function (selector) {
      var foundElements = [];
      this.each(function (_, element) {
          merge(foundElements, $(element.querySelectorAll(selector)).get());
      });
      return new JQ(foundElements);
  };

  // 存储事件
  var handlers = {};
  // 元素ID
  var mduiElementId = 1;
  /**
   * 为元素赋予一个唯一的ID
   */
  function getElementId(element) {
      var key = '_mduiEventId';
      // @ts-ignore
      if (!element[key]) {
          // @ts-ignore
          element[key] = ++mduiElementId;
      }
      // @ts-ignore
      return element[key];
  }
  /**
   * 解析事件名中的命名空间
   */
  function parse(type) {
      var parts = type.split('.');
      return {
          type: parts[0],
          ns: parts.slice(1).sort().join(' '),
      };
  }
  /**
   * 命名空间匹配规则
   */
  function matcherFor(ns) {
      return new RegExp('(?:^| )' + ns.replace(' ', ' .* ?') + '(?: |$)');
  }
  /**
   * 获取匹配的事件
   * @param element
   * @param type
   * @param func
   * @param selector
   */
  function getHandlers(element, type, func, selector) {
      var event = parse(type);
      return (handlers[getElementId(element)] || []).filter(function (handler) { return handler &&
          (!event.type || handler.type === event.type) &&
          (!event.ns || matcherFor(event.ns).test(handler.ns)) &&
          (!func || getElementId(handler.func) === getElementId(func)) &&
          (!selector || handler.selector === selector); });
  }
  /**
   * 添加事件监听
   * @param element
   * @param types
   * @param func
   * @param data
   * @param selector
   */
  function add(element, types, func, data, selector) {
      var elementId = getElementId(element);
      if (!handlers[elementId]) {
          handlers[elementId] = [];
      }
      // 传入 data.useCapture 来设置 useCapture: true
      var useCapture = false;
      if (isObjectLike(data) && data.useCapture) {
          useCapture = true;
      }
      types.split(' ').forEach(function (type) {
          if (!type) {
              return;
          }
          var event = parse(type);
          function callFn(e, elem) {
              // 因为鼠标事件模拟事件的 detail 属性是只读的，因此在 e._detail 中存储参数
              var result = func.apply(elem, 
              // @ts-ignore
              e._detail === undefined ? [e] : [e].concat(e._detail));
              if (result === false) {
                  e.preventDefault();
                  e.stopPropagation();
              }
          }
          function proxyFn(e) {
              // @ts-ignore
              if (e._ns && !matcherFor(e._ns).test(event.ns)) {
                  return;
              }
              // @ts-ignore
              e._data = data;
              if (selector) {
                  // 事件代理
                  $(element)
                      .find(selector)
                      .get()
                      .reverse()
                      .forEach(function (elem) {
                      if (elem === e.target ||
                          contains(elem, e.target)) {
                          callFn(e, elem);
                      }
                  });
              }
              else {
                  // 不使用事件代理
                  callFn(e, element);
              }
          }
          var handler = {
              type: event.type,
              ns: event.ns,
              func: func,
              selector: selector,
              id: handlers[elementId].length,
              proxy: proxyFn,
          };
          handlers[elementId].push(handler);
          element.addEventListener(handler.type, proxyFn, useCapture);
      });
  }
  /**
   * 移除事件监听
   * @param element
   * @param types
   * @param func
   * @param selector
   */
  function remove(element, types, func, selector) {
      var handlersInElement = handlers[getElementId(element)] || [];
      var removeEvent = function (handler) {
          delete handlersInElement[handler.id];
          element.removeEventListener(handler.type, handler.proxy, false);
      };
      if (!types) {
          handlersInElement.forEach(function (handler) { return removeEvent(handler); });
      }
      else {
          types.split(' ').forEach(function (type) {
              if (type) {
                  getHandlers(element, type, func, selector).forEach(function (handler) { return removeEvent(handler); });
              }
          });
      }
  }

  $.fn.trigger = function (type, extraParameters) {
      var event = parse(type);
      var eventObject;
      var eventParams = {
          bubbles: true,
          cancelable: true,
      };
      var isMouseEvent = ['click', 'mousedown', 'mouseup', 'mousemove'].indexOf(event.type) > -1;
      if (isMouseEvent) {
          // Note: MouseEvent 无法传入 detail 参数
          eventObject = new MouseEvent(event.type, eventParams);
      }
      else {
          eventParams.detail = extraParameters;
          eventObject = new CustomEvent(event.type, eventParams);
      }
      // @ts-ignore
      eventObject._detail = extraParameters;
      // @ts-ignore
      eventObject._ns = event.ns;
      return this.each(function () {
          this.dispatchEvent(eventObject);
      });
  };

  function extend(target, object1) {
      var objectN = [], len = arguments.length - 2;
      while ( len-- > 0 ) objectN[ len ] = arguments[ len + 2 ];

      objectN.unshift(object1);
      each(objectN, function (_, object) {
          each(object, function (prop, value) {
              if (!isUndefined(value)) {
                  target[prop] = value;
              }
          });
      });
      return target;
  }

  /**
   * 将数组或对象序列化，序列化后的字符串可作为 URL 查询字符串使用
   *
   * 若传入数组，则格式必须和 serializeArray 方法的返回值一样
   * @param obj 对象或数组
   * @example
  ```js
  param({ width: 1680, height: 1050 });
  // width=1680&height=1050
  ```
   * @example
  ```js
  param({ foo: { one: 1, two: 2 }})
  // foo[one]=1&foo[two]=2
  ```
   * @example
  ```js
  param({ids: [1, 2, 3]})
  // ids[]=1&ids[]=2&ids[]=3
  ```
   * @example
  ```js
  param([
    {"name":"name","value":"mdui"},
    {"name":"password","value":"123456"}
  ])
  // name=mdui&password=123456
  ```
   */
  function param(obj) {
      if (!isObjectLike(obj) && !Array.isArray(obj)) {
          return '';
      }
      var args = [];
      function destructure(key, value) {
          var keyTmp;
          if (isObjectLike(value)) {
              each(value, function (i, v) {
                  if (Array.isArray(value) && !isObjectLike(v)) {
                      keyTmp = '';
                  }
                  else {
                      keyTmp = i;
                  }
                  destructure((key + "[" + keyTmp + "]"), v);
              });
          }
          else {
              if (value == null || value === '') {
                  keyTmp = '=';
              }
              else {
                  keyTmp = "=" + (encodeURIComponent(value));
              }
              args.push(encodeURIComponent(key) + keyTmp);
          }
      }
      if (Array.isArray(obj)) {
          each(obj, function () {
              destructure(this.name, this.value);
          });
      }
      else {
          each(obj, destructure);
      }
      return args.join('&');
  }

  // 全局配置参数
  var globalOptions = {};
  // 全局事件名
  var ajaxEvents = {
      ajaxStart: 'start.mdui.ajax',
      ajaxSuccess: 'success.mdui.ajax',
      ajaxError: 'error.mdui.ajax',
      ajaxComplete: 'complete.mdui.ajax',
  };

  /**
   * 判断此请求方法是否通过查询字符串提交参数
   * @param method 请求方法，大写
   */
  function isQueryStringData(method) {
      return ['GET', 'HEAD'].indexOf(method) >= 0;
  }
  /**
   * 添加参数到 URL 上，且 URL 中不存在 ? 时，自动把第一个 & 替换为 ?
   * @param url
   * @param query
   */
  function appendQuery(url, query) {
      return (url + "&" + query).replace(/[&?]{1,2}/, '?');
  }
  /**
   * 合并请求参数，参数优先级：options > globalOptions > defaults
   * @param options
   */
  function mergeOptions(options) {
      // 默认参数
      var defaults = {
          url: '',
          method: 'GET',
          data: '',
          processData: true,
          async: true,
          cache: true,
          username: '',
          password: '',
          headers: {},
          xhrFields: {},
          statusCode: {},
          dataType: 'text',
          contentType: 'application/x-www-form-urlencoded',
          timeout: 0,
          global: true,
      };
      // globalOptions 中的回调函数不合并
      each(globalOptions, function (key, value) {
          var callbacks = [
              'beforeSend',
              'success',
              'error',
              'complete',
              'statusCode' ];
          // @ts-ignore
          if (callbacks.indexOf(key) < 0 && !isUndefined(value)) {
              defaults[key] = value;
          }
      });
      return extend({}, defaults, options);
  }
  /**
   * 发送 ajax 请求
   * @param options
   * @example
  ```js
  ajax({
    method: "POST",
    url: "some.php",
    data: { name: "John", location: "Boston" }
  }).then(function( msg ) {
    alert( "Data Saved: " + msg );
  });
  ```
   */
  function ajax(options) {
      // 是否已取消请求
      var isCanceled = false;
      // 事件参数
      var eventParams = {};
      // 参数合并
      var mergedOptions = mergeOptions(options);
      var url = mergedOptions.url || window.location.toString();
      var method = mergedOptions.method.toUpperCase();
      var data = mergedOptions.data;
      var processData = mergedOptions.processData;
      var async = mergedOptions.async;
      var cache = mergedOptions.cache;
      var username = mergedOptions.username;
      var password = mergedOptions.password;
      var headers = mergedOptions.headers;
      var xhrFields = mergedOptions.xhrFields;
      var statusCode = mergedOptions.statusCode;
      var dataType = mergedOptions.dataType;
      var contentType = mergedOptions.contentType;
      var timeout = mergedOptions.timeout;
      var global = mergedOptions.global;
      // 需要发送的数据
      // GET/HEAD 请求和 processData 为 true 时，转换为查询字符串格式，特殊格式不转换
      if (data &&
          (isQueryStringData(method) || processData) &&
          !isString(data) &&
          !(data instanceof ArrayBuffer) &&
          !(data instanceof Blob) &&
          !(data instanceof Document) &&
          !(data instanceof FormData)) {
          data = param(data);
      }
      // 对于 GET、HEAD 类型的请求，把 data 数据添加到 URL 中
      if (data && isQueryStringData(method)) {
          // 查询字符串拼接到 URL 中
          url = appendQuery(url, data);
          data = null;
      }
      /**
       * 触发事件和回调函数
       * @param event
       * @param params
       * @param callback
       * @param args
       */
      function trigger(event, params, callback) {
          var args = [], len = arguments.length - 3;
          while ( len-- > 0 ) args[ len ] = arguments[ len + 3 ];

          // 触发全局事件
          if (global) {
              $(document).trigger(event, params);
          }
          // 触发 ajax 回调和事件
          var result1;
          var result2;
          if (callback) {
              // 全局回调
              if (callback in globalOptions) {
                  // @ts-ignore
                  result1 = globalOptions[callback].apply(globalOptions, args);
              }
              // 自定义回调
              if (mergedOptions[callback]) {
                  // @ts-ignore
                  result2 = mergedOptions[callback].apply(mergedOptions, args);
              }
              // beforeSend 回调返回 false 时取消 ajax 请求
              if (callback === 'beforeSend' &&
                  (result1 === false || result2 === false)) {
                  isCanceled = true;
              }
          }
      }
      // XMLHttpRequest 请求
      function XHR() {
          var textStatus;
          return new Promise(function (resolve, reject) {
              // GET/HEAD 请求的缓存处理
              if (isQueryStringData(method) && !cache) {
                  url = appendQuery(url, ("_=" + (Date.now())));
              }
              // 创建 XHR
              var xhr = new XMLHttpRequest();
              xhr.open(method, url, async, username, password);
              if (contentType ||
                  (data && !isQueryStringData(method) && contentType !== false)) {
                  xhr.setRequestHeader('Content-Type', contentType);
              }
              // 设置 Accept
              if (dataType === 'json') {
                  xhr.setRequestHeader('Accept', 'application/json, text/javascript');
              }
              // 添加 headers
              if (headers) {
                  each(headers, function (key, value) {
                      // undefined 值不发送，string 和 null 需要发送
                      if (!isUndefined(value)) {
                          xhr.setRequestHeader(key, value + ''); // 把 null 转换成字符串
                      }
                  });
              }
              // 检查是否是跨域请求，跨域请求时不添加 X-Requested-With
              var crossDomain = /^([\w-]+:)?\/\/([^/]+)/.test(url) &&
                  RegExp.$2 !== window.location.host;
              if (!crossDomain) {
                  xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
              }
              if (xhrFields) {
                  each(xhrFields, function (key, value) {
                      // @ts-ignore
                      xhr[key] = value;
                  });
              }
              eventParams.xhr = xhr;
              eventParams.options = mergedOptions;
              var xhrTimeout;
              xhr.onload = function () {
                  if (xhrTimeout) {
                      clearTimeout(xhrTimeout);
                  }
                  // AJAX 返回的 HTTP 响应码是否表示成功
                  var isHttpStatusSuccess = (xhr.status >= 200 && xhr.status < 300) ||
                      xhr.status === 304 ||
                      xhr.status === 0;
                  var responseData;
                  if (isHttpStatusSuccess) {
                      if (xhr.status === 204 || method === 'HEAD') {
                          textStatus = 'nocontent';
                      }
                      else if (xhr.status === 304) {
                          textStatus = 'notmodified';
                      }
                      else {
                          textStatus = 'success';
                      }
                      if (dataType === 'json') {
                          try {
                              responseData =
                                  method === 'HEAD' ? undefined : JSON.parse(xhr.responseText);
                              eventParams.data = responseData;
                          }
                          catch (err) {
                              textStatus = 'parsererror';
                              trigger(ajaxEvents.ajaxError, eventParams, 'error', xhr, textStatus);
                              reject(new Error(textStatus));
                          }
                          if (textStatus !== 'parsererror') {
                              trigger(ajaxEvents.ajaxSuccess, eventParams, 'success', responseData, textStatus, xhr);
                              resolve(responseData);
                          }
                      }
                      else {
                          responseData =
                              method === 'HEAD'
                                  ? undefined
                                  : xhr.responseType === 'text' || xhr.responseType === ''
                                      ? xhr.responseText
                                      : xhr.response;
                          eventParams.data = responseData;
                          trigger(ajaxEvents.ajaxSuccess, eventParams, 'success', responseData, textStatus, xhr);
                          resolve(responseData);
                      }
                  }
                  else {
                      textStatus = 'error';
                      trigger(ajaxEvents.ajaxError, eventParams, 'error', xhr, textStatus);
                      reject(new Error(textStatus));
                  }
                  // statusCode
                  each([globalOptions.statusCode, statusCode], function (_, func) {
                      if (func && func[xhr.status]) {
                          if (isHttpStatusSuccess) {
                              func[xhr.status](responseData, textStatus, xhr);
                          }
                          else {
                              func[xhr.status](xhr, textStatus);
                          }
                      }
                  });
                  trigger(ajaxEvents.ajaxComplete, eventParams, 'complete', xhr, textStatus);
              };
              xhr.onerror = function () {
                  if (xhrTimeout) {
                      clearTimeout(xhrTimeout);
                  }
                  trigger(ajaxEvents.ajaxError, eventParams, 'error', xhr, xhr.statusText);
                  trigger(ajaxEvents.ajaxComplete, eventParams, 'complete', xhr, 'error');
                  reject(new Error(xhr.statusText));
              };
              xhr.onabort = function () {
                  var statusText = 'abort';
                  if (xhrTimeout) {
                      statusText = 'timeout';
                      clearTimeout(xhrTimeout);
                  }
                  trigger(ajaxEvents.ajaxError, eventParams, 'error', xhr, statusText);
                  trigger(ajaxEvents.ajaxComplete, eventParams, 'complete', xhr, statusText);
                  reject(new Error(statusText));
              };
              // ajax start 回调
              trigger(ajaxEvents.ajaxStart, eventParams, 'beforeSend', xhr);
              if (isCanceled) {
                  reject(new Error('cancel'));
                  return;
              }
              // Timeout
              if (timeout > 0) {
                  xhrTimeout = setTimeout(function () {
                      xhr.abort();
                  }, timeout);
              }
              // 发送 XHR
              xhr.send(data);
          });
      }
      return XHR();
  }

  $.ajax = ajax;

  /**
   * 为 Ajax 请求设置全局配置参数
   * @param options 键值对参数
   * @example
  ```js
  ajaxSetup({
    dataType: 'json',
    method: 'POST',
  });
  ```
   */
  function ajaxSetup(options) {
      return extend(globalOptions, options);
  }

  $.ajaxSetup = ajaxSetup;

  $.contains = contains;

  var dataNS = '_mduiElementDataStorage';

  /**
   * 在元素上设置键值对数据
   * @param element
   * @param object
   */
  function setObjectToElement(element, object) {
      // @ts-ignore
      if (!element[dataNS]) {
          // @ts-ignore
          element[dataNS] = {};
      }
      each(object, function (key, value) {
          // @ts-ignore
          element[dataNS][toCamelCase(key)] = value;
      });
  }
  function data(element, key, value) {
      var obj;

      // 根据键值对设置值
      // data(element, { 'key' : 'value' })
      if (isObjectLike(key)) {
          setObjectToElement(element, key);
          return key;
      }
      // 根据 key、value 设置值
      // data(element, 'key', 'value')
      if (!isUndefined(value)) {
          setObjectToElement(element, ( obj = {}, obj[key] = value, obj ));
          return value;
      }
      // 获取所有值
      // data(element)
      if (isUndefined(key)) {
          // @ts-ignore
          return element[dataNS] ? element[dataNS] : {};
      }
      // 从 dataNS 中获取指定值
      // data(element, 'key')
      key = toCamelCase(key);
      // @ts-ignore
      if (element[dataNS] && key in element[dataNS]) {
          // @ts-ignore
          return element[dataNS][key];
      }
      return undefined;
  }

  $.data = data;

  $.each = each;

  $.extend = function () {
      var this$1 = this;
      var objectN = [], len = arguments.length;
      while ( len-- ) objectN[ len ] = arguments[ len ];

      if (objectN.length === 1) {
          each(objectN[0], function (prop, value) {
              this$1[prop] = value;
          });
          return this;
      }
      return extend.apply(void 0, [ objectN.shift(), objectN.shift() ].concat( objectN ));
  };

  function map(elements, callback) {
      var ref;

      var value;
      var ret = [];
      each(elements, function (i, element) {
          value = callback.call(window, element, i);
          if (value != null) {
              ret.push(value);
          }
      });
      return (ref = []).concat.apply(ref, ret);
  }

  $.map = map;

  $.merge = merge;

  $.param = param;

  /**
   * 移除指定元素上存放的数据
   * @param element 存放数据的元素
   * @param name
   * 数据键名
   *
   * 若未指定键名，将移除元素上所有数据
   *
   * 多个键名可以用空格分隔，或者用数组表示多个键名
    @example
  ```js
  // 移除元素上键名为 name 的数据
  removeData(document.body, 'name');
  ```
   * @example
  ```js
  // 移除元素上键名为 name1 和 name2 的数据
  removeData(document.body, 'name1 name2');
  ```
   * @example
  ```js
  // 移除元素上键名为 name1 和 name2 的数据
  removeData(document.body, ['name1', 'name2']);
  ```
   * @example
  ```js
  // 移除元素上所有数据
  removeData(document.body);
  ```
   */
  function removeData(element, name) {
      // @ts-ignore
      if (!element[dataNS]) {
          return;
      }
      var remove = function (nameItem) {
          nameItem = toCamelCase(nameItem);
          // @ts-ignore
          if (element[dataNS][nameItem]) {
              // @ts-ignore
              element[dataNS][nameItem] = null;
              // @ts-ignore
              delete element[dataNS][nameItem];
          }
      };
      if (isUndefined(name)) {
          // @ts-ignore
          element[dataNS] = null;
          // @ts-ignore
          delete element[dataNS];
          // @ts-ignore
      }
      else if (isString(name)) {
          name
              .split(' ')
              .filter(function (nameItem) { return nameItem; })
              .forEach(function (nameItem) { return remove(nameItem); });
      }
      else {
          each(name, function (_, nameItem) { return remove(nameItem); });
      }
  }

  $.removeData = removeData;

  /**
   * 过滤掉数组中的重复元素
   * @param arr 数组
   * @example
  ```js
  unique([1, 2, 12, 3, 2, 1, 2, 1, 1]);
  // [1, 2, 12, 3]
  ```
   */
  function unique(arr) {
      var result = [];
      each(arr, function (_, val) {
          if (result.indexOf(val) === -1) {
              result.push(val);
          }
      });
      return result;
  }

  $.unique = unique;

  $.fn.add = function (selector) {
      return new JQ(unique(merge(this.get(), $(selector).get())));
  };

  each(['add', 'remove', 'toggle'], function (_, name) {
      $.fn[(name + "Class")] = function (className) {
          if (name === 'remove' && !arguments.length) {
              return this.each(function (_, element) {
                  element.setAttribute('class', '');
              });
          }
          return this.each(function (i, element) {
              if (!isElement(element)) {
                  return;
              }
              var classes = (isFunction(className)
                  ? className.call(element, i, element.getAttribute('class') || '')
                  : className)
                  .split(' ')
                  .filter(function (name) { return name; });
              each(classes, function (_, cls) {
                  element.classList[name](cls);
              });
          });
      };
  });

  each(['insertBefore', 'insertAfter'], function (nameIndex, name) {
      $.fn[name] = function (target) {
          var $element = nameIndex ? $(this.get().reverse()) : this; // 顺序和 jQuery 保持一致
          var $target = $(target);
          var result = [];
          $target.each(function (index, target) {
              if (!target.parentNode) {
                  return;
              }
              $element.each(function (_, element) {
                  var newItem = index
                      ? element.cloneNode(true)
                      : element;
                  var existingItem = nameIndex ? target.nextSibling : target;
                  result.push(newItem);
                  target.parentNode.insertBefore(newItem, existingItem);
              });
          });
          return $(nameIndex ? result.reverse() : result);
      };
  });

  /**
   * 是否不是 HTML 字符串（包裹在 <> 中）
   * @param target
   */
  function isPlainText(target) {
      return (isString(target) && (target[0] !== '<' || target[target.length - 1] !== '>'));
  }
  each(['before', 'after'], function (nameIndex, name) {
      $.fn[name] = function () {
          var args = [], len = arguments.length;
          while ( len-- ) args[ len ] = arguments[ len ];

          // after 方法，多个参数需要按参数顺序添加到元素后面，所以需要将参数顺序反向处理
          if (nameIndex === 1) {
              args = args.reverse();
          }
          return this.each(function (index, element) {
              var targets = isFunction(args[0])
                  ? [args[0].call(element, index, element.innerHTML)]
                  : args;
              each(targets, function (_, target) {
                  var $target;
                  if (isPlainText(target)) {
                      $target = $(getChildNodesArray(target, 'div'));
                  }
                  else if (index && isElement(target)) {
                      $target = $(target.cloneNode(true));
                  }
                  else {
                      $target = $(target);
                  }
                  $target[nameIndex ? 'insertAfter' : 'insertBefore'](element);
              });
          });
      };
  });

  $.fn.off = function (types, selector, callback) {
      var this$1 = this;

      // types 是对象
      if (isObjectLike(types)) {
          each(types, function (type, fn) {
              // this.off('click', undefined, function () {})
              // this.off('click', '.box', function () {})
              this$1.off(type, selector, fn);
          });
          return this;
      }
      // selector 不存在
      if (selector === false || isFunction(selector)) {
          callback = selector;
          selector = undefined;
          // this.off('click', undefined, function () {})
      }
      // callback 传入 `false`，相当于 `return false`
      if (callback === false) {
          callback = returnFalse;
      }
      return this.each(function () {
          remove(this, types, callback, selector);
      });
  };

  $.fn.on = function (types, selector, data, callback, one) {
      var this$1 = this;

      // types 可以是 type/func 对象
      if (isObjectLike(types)) {
          // (types-Object, selector, data)
          if (!isString(selector)) {
              // (types-Object, data)
              data = data || selector;
              selector = undefined;
          }
          each(types, function (type, fn) {
              // selector 和 data 都可能是 undefined
              // @ts-ignore
              this$1.on(type, selector, data, fn, one);
          });
          return this;
      }
      if (data == null && callback == null) {
          // (types, fn)
          callback = selector;
          data = selector = undefined;
      }
      else if (callback == null) {
          if (isString(selector)) {
              // (types, selector, fn)
              callback = data;
              data = undefined;
          }
          else {
              // (types, data, fn)
              callback = data;
              data = selector;
              selector = undefined;
          }
      }
      if (callback === false) {
          callback = returnFalse;
      }
      else if (!callback) {
          return this;
      }
      // $().one()
      if (one) {
          // eslint-disable-next-line @typescript-eslint/no-this-alias
          var _this = this;
          var origCallback = callback;
          callback = function (event) {
              _this.off(event.type, selector, callback);
              // eslint-disable-next-line prefer-rest-params
              return origCallback.apply(this, arguments);
          };
      }
      return this.each(function () {
          add(this, types, callback, data, selector);
      });
  };

  each(ajaxEvents, function (name, eventName) {
      $.fn[name] = function (fn) {
          return this.on(eventName, function (e, params) {
              fn(e, params.xhr, params.options, params.data);
          });
      };
  });

  $.fn.map = function (callback) {
      return new JQ(map(this, function (element, i) { return callback.call(element, i, element); }));
  };

  $.fn.clone = function () {
      return this.map(function () {
          return this.cloneNode(true);
      });
  };

  $.fn.is = function (selector) {
      var isMatched = false;
      if (isFunction(selector)) {
          this.each(function (index, element) {
              if (selector.call(element, index, element)) {
                  isMatched = true;
              }
          });
          return isMatched;
      }
      if (isString(selector)) {
          this.each(function (_, element) {
              if (isDocument(element) || isWindow(element)) {
                  return;
              }
              // @ts-ignore
              var matches = element.matches || element.msMatchesSelector;
              if (matches.call(element, selector)) {
                  isMatched = true;
              }
          });
          return isMatched;
      }
      var $compareWith = $(selector);
      this.each(function (_, element) {
          $compareWith.each(function (_, compare) {
              if (element === compare) {
                  isMatched = true;
              }
          });
      });
      return isMatched;
  };

  $.fn.remove = function (selector) {
      return this.each(function (_, element) {
          if (element.parentNode && (!selector || $(element).is(selector))) {
              element.parentNode.removeChild(element);
          }
      });
  };

  each(['prepend', 'append'], function (nameIndex, name) {
      $.fn[name] = function () {
          var args = [], len = arguments.length;
          while ( len-- ) args[ len ] = arguments[ len ];

          return this.each(function (index, element) {
              var ref;

              var childNodes = element.childNodes;
              var childLength = childNodes.length;
              var child = childLength
                  ? childNodes[nameIndex ? childLength - 1 : 0]
                  : document.createElement('div');
              if (!childLength) {
                  element.appendChild(child);
              }
              var contents = isFunction(args[0])
                  ? [args[0].call(element, index, element.innerHTML)]
                  : args;
              // 如果不是字符串，则仅第一个元素使用原始元素，其他的都克隆自第一个元素
              if (index) {
                  contents = contents.map(function (content) {
                      return isString(content) ? content : $(content).clone();
                  });
              }
              (ref = $(child))[nameIndex ? 'after' : 'before'].apply(ref, contents);
              if (!childLength) {
                  element.removeChild(child);
              }
          });
      };
  });

  each(['appendTo', 'prependTo'], function (nameIndex, name) {
      $.fn[name] = function (target) {
          var extraChilds = [];
          var $target = $(target).map(function (_, element) {
              var childNodes = element.childNodes;
              var childLength = childNodes.length;
              if (childLength) {
                  return childNodes[nameIndex ? 0 : childLength - 1];
              }
              var child = document.createElement('div');
              element.appendChild(child);
              extraChilds.push(child);
              return child;
          });
          var $result = this[nameIndex ? 'insertBefore' : 'insertAfter']($target);
          $(extraChilds).remove();
          return $result;
      };
  });

  each(['attr', 'prop', 'css'], function (nameIndex, name) {
      function set(element, key, value) {
          // 值为 undefined 时，不修改
          if (isUndefined(value)) {
              return;
          }
          switch (nameIndex) {
              // attr
              case 0:
                  if (isNull(value)) {
                      element.removeAttribute(key);
                  }
                  else {
                      element.setAttribute(key, value);
                  }
                  break;
              // prop
              case 1:
                  // @ts-ignore
                  element[key] = value;
                  break;
              // css
              default:
                  key = toCamelCase(key);
                  // @ts-ignore
                  element.style[key] = isNumber(value)
                      ? ("" + value + (cssNumber.indexOf(key) > -1 ? '' : 'px'))
                      : value;
                  break;
          }
      }
      function get(element, key) {
          switch (nameIndex) {
              // attr
              case 0:
                  // 属性不存在时，原生 getAttribute 方法返回 null，而 jquery 返回 undefined。这里和 jquery 保持一致
                  var value = element.getAttribute(key);
                  return isNull(value) ? undefined : value;
              // prop
              case 1:
                  // @ts-ignore
                  return element[key];
              // css
              default:
                  return getStyle(element, key);
          }
      }
      $.fn[name] = function (key, value) {
          var this$1 = this;

          if (isObjectLike(key)) {
              each(key, function (k, v) {
                  // @ts-ignore
                  this$1[name](k, v);
              });
              return this;
          }
          if (arguments.length === 1) {
              var element = this[0];
              return isElement(element) ? get(element, key) : undefined;
          }
          return this.each(function (i, element) {
              set(element, key, isFunction(value) ? value.call(element, i, get(element, key)) : value);
          });
      };
  });

  $.fn.children = function (selector) {
      var children = [];
      this.each(function (_, element) {
          each(element.childNodes, function (__, childNode) {
              if (!isElement(childNode)) {
                  return;
              }
              if (!selector || $(childNode).is(selector)) {
                  children.push(childNode);
              }
          });
      });
      return new JQ(unique(children));
  };

  $.fn.slice = function () {
      var args = [], len = arguments.length;
      while ( len-- ) args[ len ] = arguments[ len ];

      return new JQ([].slice.apply(this, args));
  };

  $.fn.eq = function (index) {
      var ret = index === -1 ? this.slice(index) : this.slice(index, +index + 1);
      return new JQ(ret);
  };

  function dir($elements, nameIndex, node, selector, filter) {
      var ret = [];
      var target;
      $elements.each(function (_, element) {
          target = element[node];
          // 不能包含最顶层的 document 元素
          while (target && isElement(target)) {
              // prevUntil, nextUntil, parentsUntil
              if (nameIndex === 2) {
                  if (selector && $(target).is(selector)) {
                      break;
                  }
                  if (!filter || $(target).is(filter)) {
                      ret.push(target);
                  }
              }
              // prev, next, parent
              else if (nameIndex === 0) {
                  if (!selector || $(target).is(selector)) {
                      ret.push(target);
                  }
                  break;
              }
              // prevAll, nextAll, parents
              else {
                  if (!selector || $(target).is(selector)) {
                      ret.push(target);
                  }
              }
              // @ts-ignore
              target = target[node];
          }
      });
      return new JQ(unique(ret));
  }

  each(['', 's', 'sUntil'], function (nameIndex, name) {
      $.fn[("parent" + name)] = function (selector, filter) {
          // parents、parentsUntil 需要把元素的顺序反向处理，以便和 jQuery 的结果一致
          var $nodes = !nameIndex ? this : $(this.get().reverse());
          return dir($nodes, nameIndex, 'parentNode', selector, filter);
      };
  });

  $.fn.closest = function (selector) {
      if (this.is(selector)) {
          return this;
      }
      var matched = [];
      this.parents().each(function (_, element) {
          if ($(element).is(selector)) {
              matched.push(element);
              return false;
          }
      });
      return new JQ(matched);
  };

  var rbrace = /^(?:{[\w\W]*\}|\[[\w\W]*\])$/;
  // 从 `data-*` 中获取的值，需要经过该函数转换
  function getData(value) {
      if (value === 'true') {
          return true;
      }
      if (value === 'false') {
          return false;
      }
      if (value === 'null') {
          return null;
      }
      if (value === +value + '') {
          return +value;
      }
      if (rbrace.test(value)) {
          return JSON.parse(value);
      }
      return value;
  }
  // 若 value 不存在，则从 `data-*` 中获取值
  function dataAttr(element, key, value) {
      if (isUndefined(value) && element.nodeType === 1) {
          var name = 'data-' + toKebabCase(key);
          value = element.getAttribute(name);
          if (isString(value)) {
              try {
                  value = getData(value);
              }
              catch (e) { }
          }
          else {
              value = undefined;
          }
      }
      return value;
  }
  $.fn.data = function (key, value) {
      // 获取所有值
      if (isUndefined(key)) {
          if (!this.length) {
              return undefined;
          }
          var element = this[0];
          var resultData = data(element);
          // window, document 上不存在 `data-*` 属性
          if (element.nodeType !== 1) {
              return resultData;
          }
          // 从 `data-*` 中获取值
          var attrs = element.attributes;
          var i = attrs.length;
          while (i--) {
              if (attrs[i]) {
                  var name = attrs[i].name;
                  if (name.indexOf('data-') === 0) {
                      name = toCamelCase(name.slice(5));
                      resultData[name] = dataAttr(element, name, resultData[name]);
                  }
              }
          }
          return resultData;
      }
      // 同时设置多个值
      if (isObjectLike(key)) {
          return this.each(function () {
              data(this, key);
          });
      }
      // value 传入了 undefined
      if (arguments.length === 2 && isUndefined(value)) {
          return this;
      }
      // 设置值
      if (!isUndefined(value)) {
          return this.each(function () {
              data(this, key, value);
          });
      }
      // 获取值
      if (!this.length) {
          return undefined;
      }
      return dataAttr(this[0], key, data(this[0], key));
  };

  $.fn.empty = function () {
      return this.each(function () {
          this.innerHTML = '';
      });
  };

  $.fn.extend = function (obj) {
      each(obj, function (prop, value) {
          // 在 JQ 对象上扩展方法时，需要自己添加 typescript 的类型定义
          $.fn[prop] = value;
      });
      return this;
  };

  $.fn.filter = function (selector) {
      if (isFunction(selector)) {
          return this.map(function (index, element) { return selector.call(element, index, element) ? element : undefined; });
      }
      if (isString(selector)) {
          return this.map(function (_, element) { return $(element).is(selector) ? element : undefined; });
      }
      var $selector = $(selector);
      return this.map(function (_, element) { return $selector.get().indexOf(element) > -1 ? element : undefined; });
  };

  $.fn.first = function () {
      return this.eq(0);
  };

  $.fn.has = function (selector) {
      var $targets = isString(selector) ? this.find(selector) : $(selector);
      var length = $targets.length;
      return this.map(function () {
          for (var i = 0; i < length; i += 1) {
              if (contains(this, $targets[i])) {
                  return this;
              }
          }
          return;
      });
  };

  $.fn.hasClass = function (className) {
      return this[0].classList.contains(className);
  };

  /**
   * 值上面的 padding、border、margin 处理
   * @param element
   * @param name
   * @param value
   * @param funcIndex
   * @param includeMargin
   * @param multiply
   */
  function handleExtraWidth(element, name, value, funcIndex, includeMargin, multiply) {
      // 获取元素的 padding, border, margin 宽度（两侧宽度的和）
      var getExtraWidthValue = function (extra) {
          return (getExtraWidth(element, name.toLowerCase(), extra) *
              multiply);
      };
      if (funcIndex === 2 && includeMargin) {
          value += getExtraWidthValue('margin');
      }
      if (isBorderBox(element)) {
          // IE 为 box-sizing: border-box 时，得到的值不含 border 和 padding，这里先修复
          // 仅获取时需要处理，multiply === 1 为 get
          if (isIE() && multiply === 1) {
              value += getExtraWidthValue('border');
              value += getExtraWidthValue('padding');
          }
          if (funcIndex === 0) {
              value -= getExtraWidthValue('border');
          }
          if (funcIndex === 1) {
              value -= getExtraWidthValue('border');
              value -= getExtraWidthValue('padding');
          }
      }
      else {
          if (funcIndex === 0) {
              value += getExtraWidthValue('padding');
          }
          if (funcIndex === 2) {
              value += getExtraWidthValue('border');
              value += getExtraWidthValue('padding');
          }
      }
      return value;
  }
  /**
   * 获取元素的样式值
   * @param element
   * @param name
   * @param funcIndex 0: innerWidth, innerHeight; 1: width, height; 2: outerWidth, outerHeight
   * @param includeMargin
   */
  function get(element, name, funcIndex, includeMargin) {
      var clientProp = "client" + name;
      var scrollProp = "scroll" + name;
      var offsetProp = "offset" + name;
      var innerProp = "inner" + name;
      // $(window).width()
      if (isWindow(element)) {
          // outerWidth, outerHeight 需要包含滚动条的宽度
          return funcIndex === 2
              ? element[innerProp]
              : toElement(document)[clientProp];
      }
      // $(document).width()
      if (isDocument(element)) {
          var doc = toElement(element);
          return Math.max(
          // @ts-ignore
          element.body[scrollProp], doc[scrollProp], 
          // @ts-ignore
          element.body[offsetProp], doc[offsetProp], doc[clientProp]);
      }
      var value = parseFloat(getComputedStyleValue(element, name.toLowerCase()) || '0');
      return handleExtraWidth(element, name, value, funcIndex, includeMargin, 1);
  }
  /**
   * 设置元素的样式值
   * @param element
   * @param elementIndex
   * @param name
   * @param funcIndex 0: innerWidth, innerHeight; 1: width, height; 2: outerWidth, outerHeight
   * @param includeMargin
   * @param value
   */
  function set(element, elementIndex, name, funcIndex, includeMargin, value) {
      var computedValue = isFunction(value)
          ? value.call(element, elementIndex, get(element, name, funcIndex, includeMargin))
          : value;
      if (computedValue == null) {
          return;
      }
      var $element = $(element);
      var dimension = name.toLowerCase();
      // 特殊的值，不需要计算 padding、border、margin
      if (['auto', 'inherit', ''].indexOf(computedValue) > -1) {
          $element.css(dimension, computedValue);
          return;
      }
      // 其他值保留原始单位。注意：如果不使用 px 作为单位，则算出的值一般是不准确的
      var suffix = computedValue.toString().replace(/\b[0-9.]*/, '');
      var numerical = parseFloat(computedValue);
      computedValue =
          handleExtraWidth(element, name, numerical, funcIndex, includeMargin, -1) +
              (suffix || 'px');
      $element.css(dimension, computedValue);
  }
  each(['Width', 'Height'], function (_, name) {
      each([("inner" + name), name.toLowerCase(), ("outer" + name)], function (funcIndex, funcName) {
          $.fn[funcName] = function (margin, value) {
              // 是否是赋值操作
              var isSet = arguments.length && (funcIndex < 2 || !isBoolean(margin));
              var includeMargin = margin === true || value === true;
              // 获取第一个元素的值
              if (!isSet) {
                  return this.length
                      ? get(this[0], name, funcIndex, includeMargin)
                      : undefined;
              }
              // 设置每个元素的值
              return this.each(function (index, element) { return set(element, index, name, funcIndex, includeMargin, margin); });
          };
      });
  });

  $.fn.hide = function () {
      return this.each(function () {
          this.style.display = 'none';
      });
  };

  each(['val', 'html', 'text'], function (nameIndex, name) {
      var props = {
          0: 'value',
          1: 'innerHTML',
          2: 'textContent',
      };
      var propName = props[nameIndex];
      function get($elements) {
          // text() 获取所有元素的文本
          if (nameIndex === 2) {
              // @ts-ignore
              return map($elements, function (element) { return toElement(element)[propName]; }).join('');
          }
          // 空集合时，val() 和 html() 返回 undefined
          if (!$elements.length) {
              return undefined;
          }
          // val() 和 html() 仅获取第一个元素的内容
          var firstElement = $elements[0];
          // select multiple 返回数组
          if (nameIndex === 0 && $(firstElement).is('select[multiple]')) {
              return map($(firstElement).find('option:checked'), function (element) { return element.value; });
          }
          // @ts-ignore
          return firstElement[propName];
      }
      function set(element, value) {
          // text() 和 html() 赋值为 undefined，则保持原内容不变
          // val() 赋值为 undefined 则赋值为空
          if (isUndefined(value)) {
              if (nameIndex !== 0) {
                  return;
              }
              value = '';
          }
          if (nameIndex === 1 && isElement(value)) {
              value = value.outerHTML;
          }
          // @ts-ignore
          element[propName] = value;
      }
      $.fn[name] = function (value) {
          // 获取值
          if (!arguments.length) {
              return get(this);
          }
          // 设置值
          return this.each(function (i, element) {
              var computedValue = isFunction(value)
                  ? value.call(element, i, get($(element)))
                  : value;
              // value 是数组，则选中数组中的元素，反选不在数组中的元素
              if (nameIndex === 0 && Array.isArray(computedValue)) {
                  // select[multiple]
                  if ($(element).is('select[multiple]')) {
                      map($(element).find('option'), function (option) { return (option.selected =
                          computedValue.indexOf(option.value) >
                              -1); });
                  }
                  // 其他 checkbox, radio 等元素
                  else {
                      element.checked =
                          computedValue.indexOf(element.value) > -1;
                  }
              }
              else {
                  set(element, computedValue);
              }
          });
      };
  });

  $.fn.index = function (selector) {
      if (!arguments.length) {
          return this.eq(0).parent().children().get().indexOf(this[0]);
      }
      if (isString(selector)) {
          return $(selector).get().indexOf(this[0]);
      }
      return this.get().indexOf($(selector)[0]);
  };

  $.fn.last = function () {
      return this.eq(-1);
  };

  each(['', 'All', 'Until'], function (nameIndex, name) {
      $.fn[("next" + name)] = function (selector, filter) {
          return dir(this, nameIndex, 'nextElementSibling', selector, filter);
      };
  });

  $.fn.not = function (selector) {
      var $excludes = this.filter(selector);
      return this.map(function (_, element) { return $excludes.index(element) > -1 ? undefined : element; });
  };

  /**
   * 返回最近的用于定位的父元素
   */
  $.fn.offsetParent = function () {
      return this.map(function () {
          var offsetParent = this.offsetParent;
          while (offsetParent && $(offsetParent).css('position') === 'static') {
              offsetParent = offsetParent.offsetParent;
          }
          return offsetParent || document.documentElement;
      });
  };

  function floatStyle($element, name) {
      return parseFloat($element.css(name));
  }
  $.fn.position = function () {
      if (!this.length) {
          return undefined;
      }
      var $element = this.eq(0);
      var currentOffset;
      var parentOffset = {
          left: 0,
          top: 0,
      };
      if ($element.css('position') === 'fixed') {
          currentOffset = $element[0].getBoundingClientRect();
      }
      else {
          currentOffset = $element.offset();
          var $offsetParent = $element.offsetParent();
          parentOffset = $offsetParent.offset();
          parentOffset.top += floatStyle($offsetParent, 'border-top-width');
          parentOffset.left += floatStyle($offsetParent, 'border-left-width');
      }
      return {
          top: currentOffset.top - parentOffset.top - floatStyle($element, 'margin-top'),
          left: currentOffset.left -
              parentOffset.left -
              floatStyle($element, 'margin-left'),
      };
  };

  function get$1(element) {
      if (!element.getClientRects().length) {
          return { top: 0, left: 0 };
      }
      var rect = element.getBoundingClientRect();
      var win = element.ownerDocument.defaultView;
      return {
          top: rect.top + win.pageYOffset,
          left: rect.left + win.pageXOffset,
      };
  }
  function set$1(element, value, index) {
      var $element = $(element);
      var position = $element.css('position');
      if (position === 'static') {
          $element.css('position', 'relative');
      }
      var currentOffset = get$1(element);
      var currentTopString = $element.css('top');
      var currentLeftString = $element.css('left');
      var currentTop;
      var currentLeft;
      var calculatePosition = (position === 'absolute' || position === 'fixed') &&
          (currentTopString + currentLeftString).indexOf('auto') > -1;
      if (calculatePosition) {
          var currentPosition = $element.position();
          currentTop = currentPosition.top;
          currentLeft = currentPosition.left;
      }
      else {
          currentTop = parseFloat(currentTopString);
          currentLeft = parseFloat(currentLeftString);
      }
      var computedValue = isFunction(value)
          ? value.call(element, index, extend({}, currentOffset))
          : value;
      $element.css({
          top: computedValue.top != null
              ? computedValue.top - currentOffset.top + currentTop
              : undefined,
          left: computedValue.left != null
              ? computedValue.left - currentOffset.left + currentLeft
              : undefined,
      });
  }
  $.fn.offset = function (value) {
      // 获取坐标
      if (!arguments.length) {
          if (!this.length) {
              return undefined;
          }
          return get$1(this[0]);
      }
      // 设置坐标
      return this.each(function (index) {
          set$1(this, value, index);
      });
  };

  $.fn.one = function (types, selector, data, callback) {
      // @ts-ignore
      return this.on(types, selector, data, callback, true);
  };

  each(['', 'All', 'Until'], function (nameIndex, name) {
      $.fn[("prev" + name)] = function (selector, filter) {
          // prevAll、prevUntil 需要把元素的顺序倒序处理，以便和 jQuery 的结果一致
          var $nodes = !nameIndex ? this : $(this.get().reverse());
          return dir($nodes, nameIndex, 'previousElementSibling', selector, filter);
      };
  });

  $.fn.removeAttr = function (attributeName) {
      var names = attributeName.split(' ').filter(function (name) { return name; });
      return this.each(function () {
          var this$1 = this;

          each(names, function (_, name) {
              this$1.removeAttribute(name);
          });
      });
  };

  $.fn.removeData = function (name) {
      return this.each(function () {
          removeData(this, name);
      });
  };

  $.fn.removeProp = function (name) {
      return this.each(function () {
          try {
              // @ts-ignore
              delete this[name];
          }
          catch (e) { }
      });
  };

  $.fn.replaceWith = function (newContent) {
      this.each(function (index, element) {
          var content = newContent;
          if (isFunction(content)) {
              content = content.call(element, index, element.innerHTML);
          }
          else if (index && !isString(content)) {
              content = $(content).clone();
          }
          $(element).before(content);
      });
      return this.remove();
  };

  $.fn.replaceAll = function (target) {
      var this$1 = this;

      return $(target).map(function (index, element) {
          $(element).replaceWith(index ? this$1.clone() : this$1);
          return this$1.get();
      });
  };

  /**
   * 将表单元素的值组合成键值对数组
   * @returns {Array}
   */
  $.fn.serializeArray = function () {
      var result = [];
      this.each(function (_, element) {
          var elements = element instanceof HTMLFormElement ? element.elements : [element];
          $(elements).each(function (_, element) {
              var $element = $(element);
              var type = element.type;
              var nodeName = element.nodeName.toLowerCase();
              if (nodeName !== 'fieldset' &&
                  element.name &&
                  !element.disabled &&
                  ['input', 'select', 'textarea', 'keygen'].indexOf(nodeName) > -1 &&
                  ['submit', 'button', 'image', 'reset', 'file'].indexOf(type) === -1 &&
                  (['radio', 'checkbox'].indexOf(type) === -1 ||
                      element.checked)) {
                  var value = $element.val();
                  var valueArr = Array.isArray(value) ? value : [value];
                  valueArr.forEach(function (value) {
                      result.push({
                          name: element.name,
                          value: value,
                      });
                  });
              }
          });
      });
      return result;
  };

  $.fn.serialize = function () {
      return param(this.serializeArray());
  };

  var elementDisplay = {};
  /**
   * 获取元素的初始 display 值，用于 .show() 方法
   * @param nodeName
   */
  function defaultDisplay(nodeName) {
      var element;
      var display;
      if (!elementDisplay[nodeName]) {
          element = document.createElement(nodeName);
          document.body.appendChild(element);
          display = getStyle(element, 'display');
          element.parentNode.removeChild(element);
          if (display === 'none') {
              display = 'block';
          }
          elementDisplay[nodeName] = display;
      }
      return elementDisplay[nodeName];
  }
  /**
   * 显示指定元素
   * @returns {JQ}
   */
  $.fn.show = function () {
      return this.each(function () {
          if (this.style.display === 'none') {
              this.style.display = '';
          }
          if (getStyle(this, 'display') === 'none') {
              this.style.display = defaultDisplay(this.nodeName);
          }
      });
  };

  /**
   * 取得同辈元素的集合
   * @param selector {String=}
   * @returns {JQ}
   */
  $.fn.siblings = function (selector) {
      return this.prevAll(selector).add(this.nextAll(selector));
  };

  /**
   * 切换元素的显示状态
   */
  $.fn.toggle = function () {
      return this.each(function () {
          getStyle(this, 'display') === 'none' ? $(this).show() : $(this).hide();
      });
  };

  $.fn.reflow = function () {
      return this.each(function () {
          return this.clientLeft;
      });
  };

  $.fn.transition = function (duration) {
      if (isNumber(duration)) {
          duration = duration + "ms";
      }
      return this.each(function () {
          this.style.webkitTransitionDuration = duration;
          this.style.transitionDuration = duration;
      });
  };

  $.fn.transitionEnd = function (callback) {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      var that = this;
      var events = ['webkitTransitionEnd', 'transitionend'];
      function fireCallback(e) {
          if (e.target !== this) {
              return;
          }
          // @ts-ignore
          callback.call(this, e);
          each(events, function (_, event) {
              that.off(event, fireCallback);
          });
      }
      each(events, function (_, event) {
          that.on(event, fireCallback);
      });
      return this;
  };

  $.fn.transformOrigin = function (transformOrigin) {
      return this.each(function () {
          this.style.webkitTransformOrigin = transformOrigin;
          this.style.transformOrigin = transformOrigin;
      });
  };

  $.fn.transform = function (transform) {
      return this.each(function () {
          this.style.webkitTransform = transform;
          this.style.transform = transform;
      });
  };

  /**
   * CSS 选择器和初始化函数组成的对象
   */
  var entries = {};
  /**
   * 注册并执行初始化函数
   * @param selector CSS 选择器
   * @param apiInit 初始化函数
   * @param i 元素索引
   * @param element 元素
   */
  function mutation(selector, apiInit, i, element) {
      var selectors = data(element, '_mdui_mutation');
      if (!selectors) {
          selectors = [];
          data(element, '_mdui_mutation', selectors);
      }
      if (selectors.indexOf(selector) === -1) {
          selectors.push(selector);
          apiInit.call(element, i, element);
      }
  }

  $.fn.mutation = function () {
      return this.each(function (i, element) {
          var $this = $(element);
          each(entries, function (selector, apiInit) {
              if ($this.is(selector)) {
                  mutation(selector, apiInit, i, element);
              }
              $this.find(selector).each(function (i, element) {
                  mutation(selector, apiInit, i, element);
              });
          });
      });
  };

  $.showOverlay = function (zIndex) {
      var $overlay = $('.mdui-overlay');
      if ($overlay.length) {
          $overlay.data('_overlay_is_deleted', false);
          if (!isUndefined(zIndex)) {
              $overlay.css('z-index', zIndex);
          }
      }
      else {
          if (isUndefined(zIndex)) {
              zIndex = 2000;
          }
          $overlay = $('<div class="mdui-overlay">')
              .appendTo(document.body)
              .reflow()
              .css('z-index', zIndex);
      }
      var level = $overlay.data('_overlay_level') || 0;
      return $overlay.data('_overlay_level', ++level).addClass('mdui-overlay-show');
  };

  $.hideOverlay = function (force) {
      if ( force === void 0 ) force = false;

      var $overlay = $('.mdui-overlay');
      if (!$overlay.length) {
          return;
      }
      var level = force ? 1 : $overlay.data('_overlay_level');
      if (level > 1) {
          $overlay.data('_overlay_level', --level);
          return;
      }
      $overlay
          .data('_overlay_level', 0)
          .removeClass('mdui-overlay-show')
          .data('_overlay_is_deleted', true)
          .transitionEnd(function () {
          if ($overlay.data('_overlay_is_deleted')) {
              $overlay.remove();
          }
      });
  };

  $.lockScreen = function () {
      var $body = $('body');
      // 不直接把 body 设为 box-sizing: border-box，避免污染全局样式
      var newBodyWidth = $body.width();
      var level = $body.data('_lockscreen_level') || 0;
      $body
          .addClass('mdui-locked')
          .width(newBodyWidth)
          .data('_lockscreen_level', ++level);
  };

  $.unlockScreen = function (force) {
      if ( force === void 0 ) force = false;

      var $body = $('body');
      var level = force ? 1 : $body.data('_lockscreen_level');
      if (level > 1) {
          $body.data('_lockscreen_level', --level);
          return;
      }
      $body.data('_lockscreen_level', 0).removeClass('mdui-locked').width('');
  };

  $.throttle = function (fn, delay) {
      if ( delay === void 0 ) delay = 16;

      var timer = null;
      return function () {
          var this$1 = this;
          var args = [], len = arguments.length;
          while ( len-- ) args[ len ] = arguments[ len ];

          if (isNull(timer)) {
              timer = setTimeout(function () {
                  fn.apply(this$1, args);
                  timer = null;
              }, delay);
          }
      };
  };

  var GUID = {};
  $.guid = function (name) {
      if (!isUndefined(name) && !isUndefined(GUID[name])) {
          return GUID[name];
      }
      function s4() {
          return Math.floor((1 + Math.random()) * 0x10000)
              .toString(16)
              .substring(1);
      }
      var guid = '_' +
          s4() +
          s4() +
          '-' +
          s4() +
          '-' +
          s4() +
          '-' +
          s4() +
          '-' +
          s4() +
          s4() +
          s4();
      if (!isUndefined(name)) {
          GUID[name] = guid;
      }
      return guid;
  };

  mdui.mutation = function (selector, apiInit) {
      if (isUndefined(selector) || isUndefined(apiInit)) {
          $(document).mutation();
          return;
      }
      entries[selector] = apiInit;
      $(selector).each(function (i, element) { return mutation(selector, apiInit, i, element); });
  };

  /**
   * 触发组件上的事件
   * @param eventName 事件名
   * @param componentName 组件名
   * @param target 在该元素上触发事件
   * @param instance 组件实例
   * @param parameters 事件参数
   */
  function componentEvent(eventName, componentName, target, instance, parameters) {
      if (!parameters) {
          parameters = {};
      }
      // @ts-ignore
      parameters.inst = instance;
      var fullEventName = eventName + ".mdui." + componentName;
      // jQuery 事件
      // @ts-ignore
      if (typeof jQuery !== 'undefined') {
          // @ts-ignore
          jQuery(target).trigger(fullEventName, parameters);
      }
      var $target = $(target);
      // mdui.jq 事件
      $target.trigger(fullEventName, parameters);
      var eventParams = {
          bubbles: true,
          cancelable: true,
          detail: parameters,
      };
      var eventObject = new CustomEvent(fullEventName, eventParams);
      // @ts-ignore
      eventObject._detail = parameters;
      $target[0].dispatchEvent(eventObject);
  }

  var $document = $(document);
  var $window = $(window);
  $('body');

  var DEFAULT_OPTIONS = {
      tolerance: 5,
      offset: 0,
      initialClass: 'mdui-headroom',
      pinnedClass: 'mdui-headroom-pinned-top',
      unpinnedClass: 'mdui-headroom-unpinned-top',
  };
  var Headroom = function Headroom(selector, options) {
      if ( options === void 0 ) options = {};

      /**
       * 配置参数
       */
      this.options = extend({}, DEFAULT_OPTIONS);
      /**
       * 当前 headroom 的状态
       */
      this.state = 'pinned';
      /**
       * 当前是否启用
       */
      this.isEnable = false;
      /**
       * 上次滚动后，垂直方向的距离
       */
      this.lastScrollY = 0;
      /**
       * AnimationFrame ID
       */
      this.rafId = 0;
      this.$element = $(selector).first();
      extend(this.options, options);
      // tolerance 参数若为数值，转换为对象
      var tolerance = this.options.tolerance;
      if (isNumber(tolerance)) {
          this.options.tolerance = {
              down: tolerance,
              up: tolerance,
          };
      }
      this.enable();
  };
  /**
   * 滚动时的处理
   */
  Headroom.prototype.onScroll = function onScroll () {
          var this$1 = this;

      this.rafId = window.requestAnimationFrame(function () {
          var currentScrollY = window.pageYOffset;
          var direction = currentScrollY > this$1.lastScrollY ? 'down' : 'up';
          var tolerance = this$1.options.tolerance[direction];
          var scrolled = Math.abs(currentScrollY - this$1.lastScrollY);
          var toleranceExceeded = scrolled >= tolerance;
          if (currentScrollY > this$1.lastScrollY &&
              currentScrollY >= this$1.options.offset &&
              toleranceExceeded) {
              this$1.unpin();
          }
          else if ((currentScrollY < this$1.lastScrollY && toleranceExceeded) ||
              currentScrollY <= this$1.options.offset) {
              this$1.pin();
          }
          this$1.lastScrollY = currentScrollY;
      });
  };
  /**
   * 触发组件事件
   * @param name
   */
  Headroom.prototype.triggerEvent = function triggerEvent (name) {
      componentEvent(name, 'headroom', this.$element, this);
  };
  /**
   * 动画结束的回调
   */
  Headroom.prototype.transitionEnd = function transitionEnd () {
      if (this.state === 'pinning') {
          this.state = 'pinned';
          this.triggerEvent('pinned');
      }
      if (this.state === 'unpinning') {
          this.state = 'unpinned';
          this.triggerEvent('unpinned');
      }
  };
  /**
   * 使元素固定住
   */
  Headroom.prototype.pin = function pin () {
          var this$1 = this;

      if (this.state === 'pinning' ||
          this.state === 'pinned' ||
          !this.$element.hasClass(this.options.initialClass)) {
          return;
      }
      this.triggerEvent('pin');
      this.state = 'pinning';
      this.$element
          .removeClass(this.options.unpinnedClass)
          .addClass(this.options.pinnedClass)
          .transitionEnd(function () { return this$1.transitionEnd(); });
  };
  /**
   * 使元素隐藏
   */
  Headroom.prototype.unpin = function unpin () {
          var this$1 = this;

      if (this.state === 'unpinning' ||
          this.state === 'unpinned' ||
          !this.$element.hasClass(this.options.initialClass)) {
          return;
      }
      this.triggerEvent('unpin');
      this.state = 'unpinning';
      this.$element
          .removeClass(this.options.pinnedClass)
          .addClass(this.options.unpinnedClass)
          .transitionEnd(function () { return this$1.transitionEnd(); });
  };
  /**
   * 启用 headroom 插件
   */
  Headroom.prototype.enable = function enable () {
          var this$1 = this;

      if (this.isEnable) {
          return;
      }
      this.isEnable = true;
      this.state = 'pinned';
      this.$element
          .addClass(this.options.initialClass)
          .removeClass(this.options.pinnedClass)
          .removeClass(this.options.unpinnedClass);
      this.lastScrollY = window.pageYOffset;
      $window.on('scroll', function () { return this$1.onScroll(); });
  };
  /**
   * 禁用 headroom 插件
   */
  Headroom.prototype.disable = function disable () {
          var this$1 = this;

      if (!this.isEnable) {
          return;
      }
      this.isEnable = false;
      this.$element
          .removeClass(this.options.initialClass)
          .removeClass(this.options.pinnedClass)
          .removeClass(this.options.unpinnedClass);
      $window.off('scroll', function () { return this$1.onScroll(); });
      window.cancelAnimationFrame(this.rafId);
  };
  /**
   * 获取当前状态。共包含四种状态：`pinning`、`pinned`、`unpinning`、`unpinned`
   */
  Headroom.prototype.getState = function getState () {
      return this.state;
  };
  mdui.Headroom = Headroom;

  /**
   * 解析 DATA API 参数
   * @param element 元素
   * @param name 属性名
   */
  function parseOptions(element, name) {
      var attr = $(element).attr(name);
      if (!attr) {
          return {};
      }
      return new Function('', ("var json = " + attr + "; return JSON.parse(JSON.stringify(json));"))();
  }

  var customAttr = 'mdui-headroom';
  $(function () {
      mdui.mutation(("[" + customAttr + "]"), function () {
          new mdui.Headroom(this, parseOptions(this, customAttr));
      });
  });

  var DEFAULT_OPTIONS$1 = {
      accordion: false,
  };
  var CollapseAbstract = function CollapseAbstract(selector, options) {
      if ( options === void 0 ) options = {};

      /**
       * 配置参数
       */
      this.options = extend({}, DEFAULT_OPTIONS$1);
      // CSS 类名
      var classPrefix = "mdui-" + (this.getNamespace()) + "-item";
      this.classItem = classPrefix;
      this.classItemOpen = classPrefix + "-open";
      this.classHeader = classPrefix + "-header";
      this.classBody = classPrefix + "-body";
      this.$element = $(selector).first();
      extend(this.options, options);
      this.bindEvent();
  };
  /**
   * 绑定事件
   */
  CollapseAbstract.prototype.bindEvent = function bindEvent () {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      var that = this;
      // 点击 header 时，打开/关闭 item
      this.$element.on('click', ("." + (this.classHeader)), function () {
          var $header = $(this);
          var $item = $header.parent();
          var $items = that.getItems();
          $items.each(function (_, item) {
              if ($item.is(item)) {
                  that.toggle(item);
              }
          });
      });
      // 点击关闭按钮时，关闭 item
      this.$element.on('click', ("[mdui-" + (this.getNamespace()) + "-item-close]"), function () {
          var $target = $(this);
          var $item = $target.parents(("." + (that.classItem))).first();
          that.close($item);
      });
  };
  /**
   * 指定 item 是否处于打开状态
   * @param $item
   */
  CollapseAbstract.prototype.isOpen = function isOpen ($item) {
      return $item.hasClass(this.classItemOpen);
  };
  /**
   * 获取所有 item
   */
  CollapseAbstract.prototype.getItems = function getItems () {
      return this.$element.children(("." + (this.classItem)));
  };
  /**
   * 获取指定 item
   * @param item
   */
  CollapseAbstract.prototype.getItem = function getItem (item) {
      if (isNumber(item)) {
          return this.getItems().eq(item);
      }
      return $(item).first();
  };
  /**
   * 触发组件事件
   * @param name 事件名
   * @param $item 事件触发的目标 item
   */
  CollapseAbstract.prototype.triggerEvent = function triggerEvent (name, $item) {
      componentEvent(name, this.getNamespace(), $item, this);
  };
  /**
   * 动画结束回调
   * @param $content body 元素
   * @param $item item 元素
   */
  CollapseAbstract.prototype.transitionEnd = function transitionEnd ($content, $item) {
      if (this.isOpen($item)) {
          $content.transition(0).height('auto').reflow().transition('');
          this.triggerEvent('opened', $item);
      }
      else {
          $content.height('');
          this.triggerEvent('closed', $item);
      }
  };
  /**
   * 打开指定面板项
   * @param item 面板项的索引号、或 CSS 选择器、或 DOM 元素、或 JQ 对象
   */
  CollapseAbstract.prototype.open = function open (item) {
          var this$1 = this;

      var $item = this.getItem(item);
      if (this.isOpen($item)) {
          return;
      }
      // 关闭其他项
      if (this.options.accordion) {
          this.$element.children(("." + (this.classItemOpen))).each(function (_, element) {
              var $element = $(element);
              if (!$element.is($item)) {
                  this$1.close($element);
              }
          });
      }
      var $content = $item.children(("." + (this.classBody)));
      $content
          .height($content[0].scrollHeight)
          .transitionEnd(function () { return this$1.transitionEnd($content, $item); });
      this.triggerEvent('open', $item);
      $item.addClass(this.classItemOpen);
  };
  /**
   * 关闭指定面板项
   * @param item 面板项的索引号、或 CSS 选择器、或 DOM 元素、或 JQ 对象
   */
  CollapseAbstract.prototype.close = function close (item) {
          var this$1 = this;

      var $item = this.getItem(item);
      if (!this.isOpen($item)) {
          return;
      }
      var $content = $item.children(("." + (this.classBody)));
      this.triggerEvent('close', $item);
      $item.removeClass(this.classItemOpen);
      $content
          .transition(0)
          .height($content[0].scrollHeight)
          .reflow()
          .transition('')
          .height('')
          .transitionEnd(function () { return this$1.transitionEnd($content, $item); });
  };
  /**
   * 切换指定面板项的打开状态
   * @param item 面板项的索引号、或 CSS 选择器、或 DOM 元素、或 JQ 对象
   */
  CollapseAbstract.prototype.toggle = function toggle (item) {
      var $item = this.getItem(item);
      this.isOpen($item) ? this.close($item) : this.open($item);
  };
  /**
   * 打开所有面板项
   */
  CollapseAbstract.prototype.openAll = function openAll () {
          var this$1 = this;

      this.getItems().each(function (_, element) { return this$1.open(element); });
  };
  /**
   * 关闭所有面板项
   */
  CollapseAbstract.prototype.closeAll = function closeAll () {
          var this$1 = this;

      this.getItems().each(function (_, element) { return this$1.close(element); });
  };

  var Collapse = /*@__PURE__*/(function (CollapseAbstract) {
      function Collapse () {
          CollapseAbstract.apply(this, arguments);
      }

      if ( CollapseAbstract ) Collapse.__proto__ = CollapseAbstract;
      Collapse.prototype = Object.create( CollapseAbstract && CollapseAbstract.prototype );
      Collapse.prototype.constructor = Collapse;

      Collapse.prototype.getNamespace = function getNamespace () {
          return 'collapse';
      };

      return Collapse;
  }(CollapseAbstract));
  mdui.Collapse = Collapse;

  var customAttr$1 = 'mdui-collapse';
  $(function () {
      mdui.mutation(("[" + customAttr$1 + "]"), function () {
          new mdui.Collapse(this, parseOptions(this, customAttr$1));
      });
  });

  var Panel = /*@__PURE__*/(function (CollapseAbstract) {
      function Panel () {
          CollapseAbstract.apply(this, arguments);
      }

      if ( CollapseAbstract ) Panel.__proto__ = CollapseAbstract;
      Panel.prototype = Object.create( CollapseAbstract && CollapseAbstract.prototype );
      Panel.prototype.constructor = Panel;

      Panel.prototype.getNamespace = function getNamespace () {
          return 'panel';
      };

      return Panel;
  }(CollapseAbstract));
  mdui.Panel = Panel;

  var customAttr$2 = 'mdui-panel';
  $(function () {
      mdui.mutation(("[" + customAttr$2 + "]"), function () {
          new mdui.Panel(this, parseOptions(this, customAttr$2));
      });
  });

  var Table = function Table(selector) {
      /**
       * 表头 tr 元素
       */
      this.$thRow = $();
      /**
       * 表格 body 中的 tr 元素
       */
      this.$tdRows = $();
      /**
       * 表头的 checkbox 元素
       */
      this.$thCheckbox = $();
      /**
       * 表格 body 中的 checkbox 元素
       */
      this.$tdCheckboxs = $();
      /**
       * 表格行是否可选择
       */
      this.selectable = false;
      /**
       * 已选中的行数
       */
      this.selectedRow = 0;
      this.$element = $(selector).first();
      this.init();
  };
  /**
   * 初始化表格
   */
  Table.prototype.init = function init () {
      this.$thRow = this.$element.find('thead tr');
      this.$tdRows = this.$element.find('tbody tr');
      this.selectable = this.$element.hasClass('mdui-table-selectable');
      this.updateThCheckbox();
      this.updateTdCheckbox();
      this.updateNumericCol();
  };
  /**
   * 生成 checkbox 的 HTML 结构
   * @param tag 标签名
   */
  Table.prototype.createCheckboxHTML = function createCheckboxHTML (tag) {
      return ("<" + tag + " class=\"mdui-table-cell-checkbox\">" +
          '<label class="mdui-checkbox">' +
          '<input type="checkbox"/>' +
          '<i class="mdui-checkbox-icon"></i>' +
          '</label>' +
          "</" + tag + ">");
  };
  /**
   * 更新表头 checkbox 的状态
   */
  Table.prototype.updateThCheckboxStatus = function updateThCheckboxStatus () {
      var checkbox = this.$thCheckbox[0];
      var selectedRow = this.selectedRow;
      var tdRowsLength = this.$tdRows.length;
      checkbox.checked = selectedRow === tdRowsLength;
      checkbox.indeterminate = !!selectedRow && selectedRow !== tdRowsLength;
  };
  /**
   * 更新表格行的 checkbox
   */
  Table.prototype.updateTdCheckbox = function updateTdCheckbox () {
          var this$1 = this;

      var rowSelectedClass = 'mdui-table-row-selected';
      this.$tdRows.each(function (_, row) {
          var $row = $(row);
          // 移除旧的 checkbox
          $row.find('.mdui-table-cell-checkbox').remove();
          if (!this$1.selectable) {
              return;
          }
          // 创建 DOM
          var $checkbox = $(this$1.createCheckboxHTML('td'))
              .prependTo($row)
              .find('input[type="checkbox"]');
          // 默认选中的行
          if ($row.hasClass(rowSelectedClass)) {
              $checkbox[0].checked = true;
              this$1.selectedRow++;
          }
          this$1.updateThCheckboxStatus();
          // 绑定事件
          $checkbox.on('change', function () {
              if ($checkbox[0].checked) {
                  $row.addClass(rowSelectedClass);
                  this$1.selectedRow++;
              }
              else {
                  $row.removeClass(rowSelectedClass);
                  this$1.selectedRow--;
              }
              this$1.updateThCheckboxStatus();
          });
          this$1.$tdCheckboxs = this$1.$tdCheckboxs.add($checkbox);
      });
  };
  /**
   * 更新表头的 checkbox
   */
  Table.prototype.updateThCheckbox = function updateThCheckbox () {
          var this$1 = this;

      // 移除旧的 checkbox
      this.$thRow.find('.mdui-table-cell-checkbox').remove();
      if (!this.selectable) {
          return;
      }
      this.$thCheckbox = $(this.createCheckboxHTML('th'))
          .prependTo(this.$thRow)
          .find('input[type="checkbox"]')
          .on('change', function () {
          var isCheckedAll = this$1.$thCheckbox[0].checked;
          this$1.selectedRow = isCheckedAll ? this$1.$tdRows.length : 0;
          this$1.$tdCheckboxs.each(function (_, checkbox) {
              checkbox.checked = isCheckedAll;
          });
          this$1.$tdRows.each(function (_, row) {
              isCheckedAll
                  ? $(row).addClass('mdui-table-row-selected')
                  : $(row).removeClass('mdui-table-row-selected');
          });
      });
  };
  /**
   * 更新数值列
   */
  Table.prototype.updateNumericCol = function updateNumericCol () {
          var this$1 = this;

      var numericClass = 'mdui-table-col-numeric';
      this.$thRow.find('th').each(function (i, th) {
          var isNumericCol = $(th).hasClass(numericClass);
          this$1.$tdRows.each(function (_, row) {
              var $td = $(row).find('td').eq(i);
              isNumericCol
                  ? $td.addClass(numericClass)
                  : $td.removeClass(numericClass);
          });
      });
  };
  var dataName = '_mdui_table';
  $(function () {
      mdui.mutation('.mdui-table', function () {
          var $element = $(this);
          if (!$element.data(dataName)) {
              $element.data(dataName, new Table($element));
          }
      });
  });
  mdui.updateTables = function (selector) {
      var $elements = isUndefined(selector) ? $('.mdui-table') : $(selector);
      $elements.each(function (_, element) {
          var $element = $(element);
          var instance = $element.data(dataName);
          if (instance) {
              instance.init();
          }
          else {
              $element.data(dataName, new Table($element));
          }
      });
  };

  /**
   * touch 事件后的 500ms 内禁用 mousedown 事件
   *
   * 不支持触控的屏幕上事件顺序为 mousedown -> mouseup -> click
   * 支持触控的屏幕上事件顺序为 touchstart -> touchend -> mousedown -> mouseup -> click
   *
   * 在每一个事件中都使用 TouchHandler.isAllow(event) 判断事件是否可执行
   * 在 touchstart 和 touchmove、touchend、touchcancel
   *
   * (function () {
   *   $document
   *     .on(start, function (e) {
   *       if (!isAllow(e)) {
   *         return;
   *       }
   *       register(e);
   *       console.log(e.type);
   *     })
   *     .on(move, function (e) {
   *       if (!isAllow(e)) {
   *         return;
   *       }
   *       console.log(e.type);
   *     })
   *     .on(end, function (e) {
   *       if (!isAllow(e)) {
   *         return;
   *       }
   *       console.log(e.type);
   *     })
   *     .on(unlock, register);
   * })();
   */
  var startEvent = 'touchstart mousedown';
  var moveEvent = 'touchmove mousemove';
  var endEvent = 'touchend mouseup';
  var cancelEvent = 'touchcancel mouseleave';
  var unlockEvent = 'touchend touchmove touchcancel';
  var touches = 0;
  /**
   * 该事件是否被允许，在执行事件前调用该方法判断事件是否可以执行
   * 若已触发 touch 事件，则阻止之后的鼠标事件
   * @param event
   */
  function isAllow(event) {
      return !(touches &&
          [
              'mousedown',
              'mouseup',
              'mousemove',
              'click',
              'mouseover',
              'mouseout',
              'mouseenter',
              'mouseleave' ].indexOf(event.type) > -1);
  }
  /**
   * 在 touchstart 和 touchmove、touchend、touchcancel 事件中调用该方法注册事件
   * @param event
   */
  function register(event) {
      if (event.type === 'touchstart') {
          // 触发了 touch 事件
          touches += 1;
      }
      else if (['touchmove', 'touchend', 'touchcancel'].indexOf(event.type) > -1) {
          // touch 事件结束 500ms 后解除对鼠标事件的阻止
          setTimeout(function () {
              if (touches) {
                  touches -= 1;
              }
          }, 500);
      }
  }

  /**
   * Inspired by https://github.com/nolimits4web/Framework7/blob/master/src/js/fast-clicks.js
   * https://github.com/nolimits4web/Framework7/blob/master/LICENSE
   *
   * Inspired by https://github.com/fians/Waves
   */
  /**
   * 显示涟漪动画
   * @param event
   * @param $ripple
   */
  function show(event, $ripple) {
      // 鼠标右键不产生涟漪
      if (event instanceof MouseEvent && event.button === 2) {
          return;
      }
      // 点击位置坐标
      var touchPosition = typeof TouchEvent !== 'undefined' &&
          event instanceof TouchEvent &&
          event.touches.length
          ? event.touches[0]
          : event;
      var touchStartX = touchPosition.pageX;
      var touchStartY = touchPosition.pageY;
      // 涟漪位置
      var offset = $ripple.offset();
      var height = $ripple.innerHeight();
      var width = $ripple.innerWidth();
      var center = {
          x: touchStartX - offset.left,
          y: touchStartY - offset.top,
      };
      var diameter = Math.max(Math.pow(Math.pow(height, 2) + Math.pow(width, 2), 0.5), 48);
      // 涟漪扩散动画
      var translate = "translate3d(" + (-center.x + width / 2) + "px," +
          (-center.y + height / 2) + "px, 0) scale(1)";
      // 涟漪的 DOM 结构，并缓存动画效果
      $("<div class=\"mdui-ripple-wave\" " +
          "style=\"width:" + diameter + "px;height:" + diameter + "px;" +
          "margin-top:-" + (diameter / 2) + "px;margin-left:-" + (diameter / 2) + "px;" +
          "left:" + (center.x) + "px;top:" + (center.y) + "px;\"></div>")
          .data('_ripple_wave_translate', translate)
          .prependTo($ripple)
          .reflow()
          .transform(translate);
  }
  /**
   * 隐藏并移除涟漪
   * @param $wave
   */
  function removeRipple($wave) {
      if (!$wave.length || $wave.data('_ripple_wave_removed')) {
          return;
      }
      $wave.data('_ripple_wave_removed', true);
      var removeTimer = setTimeout(function () { return $wave.remove(); }, 400);
      var translate = $wave.data('_ripple_wave_translate');
      $wave
          .addClass('mdui-ripple-wave-fill')
          .transform(translate.replace('scale(1)', 'scale(1.01)'))
          .transitionEnd(function () {
          clearTimeout(removeTimer);
          $wave
              .addClass('mdui-ripple-wave-out')
              .transform(translate.replace('scale(1)', 'scale(1.01)'));
          removeTimer = setTimeout(function () { return $wave.remove(); }, 700);
          setTimeout(function () {
              $wave.transitionEnd(function () {
                  clearTimeout(removeTimer);
                  $wave.remove();
              });
          }, 0);
      });
  }
  /**
   * 隐藏涟漪动画
   * @param this
   */
  function hide() {
      var $ripple = $(this);
      $ripple.children('.mdui-ripple-wave').each(function (_, wave) {
          removeRipple($(wave));
      });
      $ripple.off((moveEvent + " " + endEvent + " " + cancelEvent), hide);
  }
  /**
   * 显示涟漪，并绑定 touchend 等事件
   * @param event
   */
  function showRipple(event) {
      if (!isAllow(event)) {
          return;
      }
      register(event);
      // Chrome 59 点击滚动条时，会在 document 上触发事件
      if (event.target === document) {
          return;
      }
      var $target = $(event.target);
      // 获取含 .mdui-ripple 类的元素
      var $ripple = $target.hasClass('mdui-ripple')
          ? $target
          : $target.parents('.mdui-ripple').first();
      if (!$ripple.length) {
          return;
      }
      // 禁用状态的元素上不产生涟漪效果
      if ($ripple.prop('disabled') || !isUndefined($ripple.attr('disabled'))) {
          return;
      }
      if (event.type === 'touchstart') {
          var hidden = false;
          // touchstart 触发指定时间后开始涟漪动画，避免手指滑动时也触发涟漪
          var timer = setTimeout(function () {
              timer = 0;
              show(event, $ripple);
          }, 200);
          var hideRipple = function () {
              // 如果手指没有移动，且涟漪动画还没有开始，则开始涟漪动画
              if (timer) {
                  clearTimeout(timer);
                  timer = 0;
                  show(event, $ripple);
              }
              if (!hidden) {
                  hidden = true;
                  hide.call($ripple);
              }
          };
          // 手指移动后，移除涟漪动画
          var touchMove = function () {
              if (timer) {
                  clearTimeout(timer);
                  timer = 0;
              }
              hideRipple();
          };
          $ripple.on('touchmove', touchMove).on('touchend touchcancel', hideRipple);
      }
      else {
          show(event, $ripple);
          $ripple.on((moveEvent + " " + endEvent + " " + cancelEvent), hide);
      }
  }
  $(function () {
      $document.on(startEvent, showRipple).on(unlockEvent, register);
  });

  var defaultData = {
      reInit: false,
      domLoadedEvent: false,
  };
  /**
   * 输入框事件
   * @param event
   * @param data
   */
  function inputEvent(event, data) {
      if ( data === void 0 ) data = {};

      data = extend({}, defaultData, data);
      var input = event.target;
      var $input = $(input);
      var eventType = event.type;
      var value = $input.val();
      // 文本框类型
      var inputType = $input.attr('type') || '';
      if (['checkbox', 'button', 'submit', 'range', 'radio', 'image'].indexOf(inputType) > -1) {
          return;
      }
      var $textfield = $input.parent('.mdui-textfield');
      // 输入框是否聚焦
      if (eventType === 'focus') {
          $textfield.addClass('mdui-textfield-focus');
      }
      if (eventType === 'blur') {
          $textfield.removeClass('mdui-textfield-focus');
      }
      // 输入框是否为空
      if (eventType === 'blur' || eventType === 'input') {
          value
              ? $textfield.addClass('mdui-textfield-not-empty')
              : $textfield.removeClass('mdui-textfield-not-empty');
      }
      // 输入框是否禁用
      input.disabled
          ? $textfield.addClass('mdui-textfield-disabled')
          : $textfield.removeClass('mdui-textfield-disabled');
      // 表单验证
      if ((eventType === 'input' || eventType === 'blur') &&
          !data.domLoadedEvent &&
          input.validity) {
          input.validity.valid
              ? $textfield.removeClass('mdui-textfield-invalid-html5')
              : $textfield.addClass('mdui-textfield-invalid-html5');
      }
      // textarea 高度自动调整
      if ($input.is('textarea')) {
          // IE bug：textarea 的值仅为多个换行，不含其他内容时，textarea 的高度不准确
          //         此时，在计算高度前，在值的开头加入一个空格，计算完后，移除空格
          var inputValue = value;
          var hasExtraSpace = false;
          if (inputValue.replace(/[\r\n]/g, '') === '') {
              $input.val(' ' + inputValue);
              hasExtraSpace = true;
          }
          // 设置 textarea 高度
          $input.outerHeight('');
          var height = $input.outerHeight();
          var scrollHeight = input.scrollHeight;
          if (scrollHeight > height) {
              $input.outerHeight(scrollHeight);
          }
          // 计算完，还原 textarea 的值
          if (hasExtraSpace) {
              $input.val(inputValue);
          }
      }
      // 实时字数统计
      if (data.reInit) {
          $textfield.find('.mdui-textfield-counter').remove();
      }
      var maxLength = $input.attr('maxlength');
      if (maxLength) {
          if (data.reInit || data.domLoadedEvent) {
              $('<div class="mdui-textfield-counter">' +
                  "<span class=\"mdui-textfield-counter-inputed\"></span> / " + maxLength +
                  '</div>').appendTo($textfield);
          }
          $textfield
              .find('.mdui-textfield-counter-inputed')
              .text(value.length.toString());
      }
      // 含 帮助文本、错误提示、字数统计 时，增加文本框底部内边距
      if ($textfield.find('.mdui-textfield-helper').length ||
          $textfield.find('.mdui-textfield-error').length ||
          maxLength) {
          $textfield.addClass('mdui-textfield-has-bottom');
      }
  }
  $(function () {
      // 绑定事件
      $document.on('input focus blur', '.mdui-textfield-input', { useCapture: true }, inputEvent);
      // 可展开文本框展开
      $document.on('click', '.mdui-textfield-expandable .mdui-textfield-icon', function () {
          $(this)
              .parents('.mdui-textfield')
              .addClass('mdui-textfield-expanded')
              .find('.mdui-textfield-input')[0]
              .focus();
      });
      // 可展开文本框关闭
      $document.on('click', '.mdui-textfield-expanded .mdui-textfield-close', function () {
          $(this)
              .parents('.mdui-textfield')
              .removeClass('mdui-textfield-expanded')
              .find('.mdui-textfield-input')
              .val('');
      });
      /**
       * 初始化文本框
       */
      mdui.mutation('.mdui-textfield', function () {
          $(this).find('.mdui-textfield-input').trigger('input', {
              domLoadedEvent: true,
          });
      });
  });
  mdui.updateTextFields = function (selector) {
      var $elements = isUndefined(selector) ? $('.mdui-textfield') : $(selector);
      $elements.each(function (_, element) {
          $(element).find('.mdui-textfield-input').trigger('input', {
              reInit: true,
          });
      });
  };

  /**
   * 滑块的值改变后修改滑块样式
   * @param $slider
   */
  function updateValueStyle($slider) {
      var data = $slider.data();
      var $track = data._slider_$track;
      var $fill = data._slider_$fill;
      var $thumb = data._slider_$thumb;
      var $input = data._slider_$input;
      var min = data._slider_min;
      var max = data._slider_max;
      var isDisabled = data._slider_disabled;
      var isDiscrete = data._slider_discrete;
      var $thumbText = data._slider_$thumbText;
      var value = $input.val();
      var percent = ((value - min) / (max - min)) * 100;
      $fill.width((percent + "%"));
      $track.width(((100 - percent) + "%"));
      if (isDisabled) {
          $fill.css('padding-right', '6px');
          $track.css('padding-left', '6px');
      }
      $thumb.css('left', (percent + "%"));
      if (isDiscrete) {
          $thumbText.text(value);
      }
      percent === 0
          ? $slider.addClass('mdui-slider-zero')
          : $slider.removeClass('mdui-slider-zero');
  }
  /**
   * 重新初始化滑块
   * @param $slider
   */
  function reInit($slider) {
      var $track = $('<div class="mdui-slider-track"></div>');
      var $fill = $('<div class="mdui-slider-fill"></div>');
      var $thumb = $('<div class="mdui-slider-thumb"></div>');
      var $input = $slider.find('input[type="range"]');
      var isDisabled = $input[0].disabled;
      var isDiscrete = $slider.hasClass('mdui-slider-discrete');
      // 禁用状态
      isDisabled
          ? $slider.addClass('mdui-slider-disabled')
          : $slider.removeClass('mdui-slider-disabled');
      // 重新填充 HTML
      $slider.find('.mdui-slider-track').remove();
      $slider.find('.mdui-slider-fill').remove();
      $slider.find('.mdui-slider-thumb').remove();
      $slider.append($track).append($fill).append($thumb);
      // 间续型滑块
      var $thumbText = $();
      if (isDiscrete) {
          $thumbText = $('<span></span>');
          $thumb.empty().append($thumbText);
      }
      $slider.data('_slider_$track', $track);
      $slider.data('_slider_$fill', $fill);
      $slider.data('_slider_$thumb', $thumb);
      $slider.data('_slider_$input', $input);
      $slider.data('_slider_min', $input.attr('min'));
      $slider.data('_slider_max', $input.attr('max'));
      $slider.data('_slider_disabled', isDisabled);
      $slider.data('_slider_discrete', isDiscrete);
      $slider.data('_slider_$thumbText', $thumbText);
      // 设置默认值
      updateValueStyle($slider);
  }
  var rangeSelector = '.mdui-slider input[type="range"]';
  $(function () {
      // 滑块滑动事件
      $document.on('input change', rangeSelector, function () {
          var $slider = $(this).parent();
          updateValueStyle($slider);
      });
      // 开始触摸滑块事件
      $document.on(startEvent, rangeSelector, function (event) {
          if (!isAllow(event)) {
              return;
          }
          register(event);
          if (this.disabled) {
              return;
          }
          var $slider = $(this).parent();
          $slider.addClass('mdui-slider-focus');
      });
      // 结束触摸滑块事件
      $document.on(endEvent, rangeSelector, function (event) {
          if (!isAllow(event)) {
              return;
          }
          if (this.disabled) {
              return;
          }
          var $slider = $(this).parent();
          $slider.removeClass('mdui-slider-focus');
      });
      $document.on(unlockEvent, rangeSelector, register);
      /**
       * 初始化滑块
       */
      mdui.mutation('.mdui-slider', function () {
          reInit($(this));
      });
  });
  mdui.updateSliders = function (selector) {
      var $elements = isUndefined(selector) ? $('.mdui-slider') : $(selector);
      $elements.each(function (_, element) {
          reInit($(element));
      });
  };

  var DEFAULT_OPTIONS$2 = {
      trigger: 'hover',
  };
  var Fab = function Fab(selector, options) {
      var this$1 = this;
      if ( options === void 0 ) options = {};

      /**
       * 配置参数
       */
      this.options = extend({}, DEFAULT_OPTIONS$2);
      /**
       * 当前 fab 的状态
       */
      this.state = 'closed';
      this.$element = $(selector).first();
      extend(this.options, options);
      this.$btn = this.$element.find('.mdui-fab');
      this.$dial = this.$element.find('.mdui-fab-dial');
      this.$dialBtns = this.$dial.find('.mdui-fab');
      if (this.options.trigger === 'hover') {
          this.$btn.on('touchstart mouseenter', function () { return this$1.open(); });
          this.$element.on('mouseleave', function () { return this$1.close(); });
      }
      if (this.options.trigger === 'click') {
          this.$btn.on(startEvent, function () { return this$1.open(); });
      }
      // 触摸屏幕其他地方关闭快速拨号
      $document.on(startEvent, function (event) {
          if ($(event.target).parents('.mdui-fab-wrapper').length) {
              return;
          }
          this$1.close();
      });
  };
  /**
   * 触发组件事件
   * @param name
   */
  Fab.prototype.triggerEvent = function triggerEvent (name) {
      componentEvent(name, 'fab', this.$element, this);
  };
  /**
   * 当前是否为打开状态
   */
  Fab.prototype.isOpen = function isOpen () {
      return this.state === 'opening' || this.state === 'opened';
  };
  /**
   * 打开快速拨号菜单
   */
  Fab.prototype.open = function open () {
          var this$1 = this;

      if (this.isOpen()) {
          return;
      }
      // 为菜单中的按钮添加不同的 transition-delay
      this.$dialBtns.each(function (index, btn) {
          var delay = (15 * (this$1.$dialBtns.length - index)) + "ms";
          btn.style.transitionDelay = delay;
          btn.style.webkitTransitionDelay = delay;
      });
      this.$dial.css('height', 'auto').addClass('mdui-fab-dial-show');
      // 如果按钮中存在 .mdui-fab-opened 的图标，则进行图标切换
      if (this.$btn.find('.mdui-fab-opened').length) {
          this.$btn.addClass('mdui-fab-opened');
      }
      this.state = 'opening';
      this.triggerEvent('open');
      // 打开顺序为从下到上逐个打开，最上面的打开后才表示动画完成
      this.$dialBtns.first().transitionEnd(function () {
          if (this$1.$btn.hasClass('mdui-fab-opened')) {
              this$1.state = 'opened';
              this$1.triggerEvent('opened');
          }
      });
  };
  /**
   * 关闭快速拨号菜单
   */
  Fab.prototype.close = function close () {
          var this$1 = this;

      if (!this.isOpen()) {
          return;
      }
      // 为菜单中的按钮添加不同的 transition-delay
      this.$dialBtns.each(function (index, btn) {
          var delay = (15 * index) + "ms";
          btn.style.transitionDelay = delay;
          btn.style.webkitTransitionDelay = delay;
      });
      this.$dial.removeClass('mdui-fab-dial-show');
      this.$btn.removeClass('mdui-fab-opened');
      this.state = 'closing';
      this.triggerEvent('close');
      // 从上往下依次关闭，最后一个关闭后才表示动画完成
      this.$dialBtns.last().transitionEnd(function () {
          if (this$1.$btn.hasClass('mdui-fab-opened')) {
              return;
          }
          this$1.state = 'closed';
          this$1.triggerEvent('closed');
          this$1.$dial.css('height', 0);
      });
  };
  /**
   * 切换快速拨号菜单的打开状态
   */
  Fab.prototype.toggle = function toggle () {
      this.isOpen() ? this.close() : this.open();
  };
  /**
   * 以动画的形式显示整个浮动操作按钮
   */
  Fab.prototype.show = function show () {
      this.$element.removeClass('mdui-fab-hide');
  };
  /**
   * 以动画的形式隐藏整个浮动操作按钮
   */
  Fab.prototype.hide = function hide () {
      this.$element.addClass('mdui-fab-hide');
  };
  /**
   * 返回当前快速拨号菜单的打开状态。共包含四种状态：`opening`、`opened`、`closing`、`closed`
   */
  Fab.prototype.getState = function getState () {
      return this.state;
  };
  mdui.Fab = Fab;

  var customAttr$3 = 'mdui-fab';
  $(function () {
      // mouseenter 不冒泡，无法进行事件委托，这里用 mouseover 代替。
      // 不管是 click 、 mouseover 还是 touchstart ，都先初始化。
      $document.on('touchstart mousedown mouseover', ("[" + customAttr$3 + "]"), function () {
          new mdui.Fab(this, parseOptions(this, customAttr$3));
      });
  });

  /**
   * 最终生成的元素结构为：
   *  <select class="mdui-select" mdui-select="{position: 'top'}" style="display: none;"> // $native
   *    <option value="1">State 1</option>
   *    <option value="2">State 2</option>
   *    <option value="3" disabled="">State 3</option>
   *  </select>
   *  <div class="mdui-select mdui-select-position-top" style="" id="88dec0e4-d4a2-c6d0-0e7f-1ba4501e0553"> // $element
   *    <span class="mdui-select-selected">State 1</span> // $selected
   *    <div class="mdui-select-menu" style="transform-origin: center 100% 0px;"> // $menu
   *      <div class="mdui-select-menu-item mdui-ripple" selected="">State 1</div> // $items
   *      <div class="mdui-select-menu-item mdui-ripple">State 2</div>
   *      <div class="mdui-select-menu-item mdui-ripple" disabled="">State 3</div>
   *    </div>
   *  </div>
   */
  var DEFAULT_OPTIONS$3 = {
      position: 'auto',
      gutter: 16,
  };
  var Select = function Select(selector, options) {
      var this$1 = this;
      if ( options === void 0 ) options = {};

      /**
       * 生成的 `<div class="mdui-select">` 元素的 JQ 对象
       */
      this.$element = $();
      /**
       * 配置参数
       */
      this.options = extend({}, DEFAULT_OPTIONS$3);
      /**
       * select 的 size 属性的值，根据该值设置 select 的高度
       */
      this.size = 0;
      /**
       * 占位元素，显示已选中菜单项的文本
       */
      this.$selected = $();
      /**
       * 菜单项的外层元素的 JQ 对象
       */
      this.$menu = $();
      /**
       * 菜单项数组的 JQ 对象
       */
      this.$items = $();
      /**
       * 当前选中的菜单项的索引号
       */
      this.selectedIndex = 0;
      /**
       * 当前选中菜单项的文本
       */
      this.selectedText = '';
      /**
       * 当前选中菜单项的值
       */
      this.selectedValue = '';
      /**
       * 当前 select 的状态
       */
      this.state = 'closed';
      this.$native = $(selector).first();
      this.$native.hide();
      extend(this.options, options);
      // 为当前 select 生成唯一 ID
      this.uniqueID = $.guid();
      // 生成 select
      this.handleUpdate();
      // 点击 select 外面区域关闭
      $document.on('click touchstart', function (event) {
          var $target = $(event.target);
          if (this$1.isOpen() &&
              !$target.is(this$1.$element) &&
              !contains(this$1.$element[0], $target[0])) {
              this$1.close();
          }
      });
  };
  /**
   * 调整菜单位置
   */
  Select.prototype.readjustMenu = function readjustMenu () {
      var windowHeight = $window.height();
      // mdui-select 高度
      var elementHeight = this.$element.height();
      // 菜单项高度
      var $itemFirst = this.$items.first();
      var itemHeight = $itemFirst.height();
      var itemMargin = parseInt($itemFirst.css('margin-top'));
      // 菜单高度
      var menuWidth = this.$element.innerWidth() + 0.01; // 必须比真实宽度多一点，不然会出现省略号
      var menuHeight = itemHeight * this.size + itemMargin * 2;
      // mdui-select 在窗口中的位置
      var elementTop = this.$element[0].getBoundingClientRect().top;
      var transformOriginY;
      var menuMarginTop;
      if (this.options.position === 'bottom') {
          menuMarginTop = elementHeight;
          transformOriginY = '0px';
      }
      else if (this.options.position === 'top') {
          menuMarginTop = -menuHeight - 1;
          transformOriginY = '100%';
      }
      else {
          // 菜单高度不能超过窗口高度
          var menuMaxHeight = windowHeight - this.options.gutter * 2;
          if (menuHeight > menuMaxHeight) {
              menuHeight = menuMaxHeight;
          }
          // 菜单的 margin-top
          menuMarginTop = -(itemMargin +
              this.selectedIndex * itemHeight +
              (itemHeight - elementHeight) / 2);
          var menuMaxMarginTop = -(itemMargin +
              (this.size - 1) * itemHeight +
              (itemHeight - elementHeight) / 2);
          if (menuMarginTop < menuMaxMarginTop) {
              menuMarginTop = menuMaxMarginTop;
          }
          // 菜单不能超出窗口
          var menuTop = elementTop + menuMarginTop;
          if (menuTop < this.options.gutter) {
              // 不能超出窗口上方
              menuMarginTop = -(elementTop - this.options.gutter);
          }
          else if (menuTop + menuHeight + this.options.gutter > windowHeight) {
              // 不能超出窗口下方
              menuMarginTop = -(elementTop +
                  menuHeight +
                  this.options.gutter -
                  windowHeight);
          }
          // transform 的 Y 轴坐标
          transformOriginY = (this.selectedIndex * itemHeight + itemHeight / 2 + itemMargin) + "px";
      }
      // 设置样式
      this.$element.innerWidth(menuWidth);
      this.$menu
          .innerWidth(menuWidth)
          .height(menuHeight)
          .css({
          'margin-top': menuMarginTop + 'px',
          'transform-origin': 'center ' + transformOriginY + ' 0',
      });
  };
  /**
   * select 是否为打开状态
   */
  Select.prototype.isOpen = function isOpen () {
      return this.state === 'opening' || this.state === 'opened';
  };
  /**
   * 对原生 select 组件进行了修改后，需要调用该方法
   */
  Select.prototype.handleUpdate = function handleUpdate () {
          var this$1 = this;

      if (this.isOpen()) {
          this.close();
      }
      this.selectedValue = this.$native.val();
      var itemsData = [];
      this.$items = $();
      // 生成 HTML
      this.$native.find('option').each(function (index, option) {
          var text = option.textContent || '';
          var value = option.value;
          var disabled = option.disabled;
          var selected = this$1.selectedValue === value;
          itemsData.push({
              value: value,
              text: text,
              disabled: disabled,
              selected: selected,
              index: index,
          });
          if (selected) {
              this$1.selectedText = text;
              this$1.selectedIndex = index;
          }
          this$1.$items = this$1.$items.add('<div class="mdui-select-menu-item mdui-ripple"' +
              (disabled ? ' disabled' : '') +
              (selected ? ' selected' : '') +
              ">" + text + "</div>");
      });
      this.$selected = $(("<span class=\"mdui-select-selected\">" + (this.selectedText) + "</span>"));
      this.$element = $("<div class=\"mdui-select mdui-select-position-" + (this.options.position) + "\" " +
          "style=\"" + (this.$native.attr('style')) + "\" " +
          "id=\"" + (this.uniqueID) + "\"></div>")
          .show()
          .append(this.$selected);
      this.$menu = $('<div class="mdui-select-menu"></div>')
          .appendTo(this.$element)
          .append(this.$items);
      $(("#" + (this.uniqueID))).remove();
      this.$native.after(this.$element);
      // 根据 select 的 size 属性设置高度
      this.size = parseInt(this.$native.attr('size') || '0');
      if (this.size <= 0) {
          this.size = this.$items.length;
          if (this.size > 8) {
              this.size = 8;
          }
      }
      // 点击选项时关闭下拉菜单
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      var that = this;
      this.$items.on('click', function () {
          if (that.state === 'closing') {
              return;
          }
          var $item = $(this);
          var index = $item.index();
          var data = itemsData[index];
          if (data.disabled) {
              return;
          }
          that.$selected.text(data.text);
          that.$native.val(data.value);
          that.$items.removeAttr('selected');
          $item.attr('selected', '');
          that.selectedIndex = data.index;
          that.selectedValue = data.value;
          that.selectedText = data.text;
          that.$native.trigger('change');
          that.close();
      });
      // 点击 $element 时打开下拉菜单
      this.$element.on('click', function (event) {
          var $target = $(event.target);
          // 在菜单上点击时不打开
          if ($target.is('.mdui-select-menu') ||
              $target.is('.mdui-select-menu-item')) {
              return;
          }
          this$1.toggle();
      });
  };
  /**
   * 动画结束的回调
   */
  Select.prototype.transitionEnd = function transitionEnd () {
      this.$element.removeClass('mdui-select-closing');
      if (this.state === 'opening') {
          this.state = 'opened';
          this.triggerEvent('opened');
          this.$menu.css('overflow-y', 'auto');
      }
      if (this.state === 'closing') {
          this.state = 'closed';
          this.triggerEvent('closed');
          // 恢复样式
          this.$element.innerWidth('');
          this.$menu.css({
              'margin-top': '',
              height: '',
              width: '',
          });
      }
  };
  /**
   * 触发组件事件
   * @param name
   */
  Select.prototype.triggerEvent = function triggerEvent (name) {
      componentEvent(name, 'select', this.$native, this);
  };
  /**
   * 切换下拉菜单的打开状态
   */
  Select.prototype.toggle = function toggle () {
      this.isOpen() ? this.close() : this.open();
  };
  /**
   * 打开下拉菜单
   */
  Select.prototype.open = function open () {
          var this$1 = this;

      if (this.isOpen()) {
          return;
      }
      this.state = 'opening';
      this.triggerEvent('open');
      this.readjustMenu();
      this.$element.addClass('mdui-select-open');
      this.$menu.transitionEnd(function () { return this$1.transitionEnd(); });
  };
  /**
   * 关闭下拉菜单
   */
  Select.prototype.close = function close () {
          var this$1 = this;

      if (!this.isOpen()) {
          return;
      }
      this.state = 'closing';
      this.triggerEvent('close');
      this.$menu.css('overflow-y', '');
      this.$element
          .removeClass('mdui-select-open')
          .addClass('mdui-select-closing');
      this.$menu.transitionEnd(function () { return this$1.transitionEnd(); });
  };
  /**
   * 获取当前菜单的状态。共包含四种状态：`opening`、`opened`、`closing`、`closed`
   */
  Select.prototype.getState = function getState () {
      return this.state;
  };
  mdui.Select = Select;

  var customAttr$4 = 'mdui-select';
  $(function () {
      mdui.mutation(("[" + customAttr$4 + "]"), function () {
          new mdui.Select(this, parseOptions(this, customAttr$4));
      });
  });

  $(function () {
      // 滚动时隐藏应用栏
      mdui.mutation('.mdui-appbar-scroll-hide', function () {
          new mdui.Headroom(this);
      });
      // 滚动时只隐藏应用栏中的工具栏
      mdui.mutation('.mdui-appbar-scroll-toolbar-hide', function () {
          new mdui.Headroom(this, {
              pinnedClass: 'mdui-headroom-pinned-toolbar',
              unpinnedClass: 'mdui-headroom-unpinned-toolbar',
          });
      });
  });

  var DEFAULT_OPTIONS$4 = {
      trigger: 'click',
      loop: false,
  };
  var Tab = function Tab(selector, options) {
      var this$1 = this;
      if ( options === void 0 ) options = {};

      /**
       * 配置参数
       */
      this.options = extend({}, DEFAULT_OPTIONS$4);
      /**
       * 当前激活的 tab 的索引号。为 -1 时表示没有激活的选项卡，或不存在选项卡
       */
      this.activeIndex = -1;
      this.$element = $(selector).first();
      extend(this.options, options);
      this.$tabs = this.$element.children('a');
      this.$indicator = $('<div class="mdui-tab-indicator"></div>').appendTo(this.$element);
      // 根据 url hash 获取默认激活的选项卡
      var hash = window.location.hash;
      if (hash) {
          this.$tabs.each(function (index, tab) {
              if ($(tab).attr('href') === hash) {
                  this$1.activeIndex = index;
                  return false;
              }
              return true;
          });
      }
      // 含 .mdui-tab-active 的元素默认激活
      if (this.activeIndex === -1) {
          this.$tabs.each(function (index, tab) {
              if ($(tab).hasClass('mdui-tab-active')) {
                  this$1.activeIndex = index;
                  return false;
              }
              return true;
          });
      }
      // 存在选项卡时，默认激活第一个选项卡
      if (this.$tabs.length && this.activeIndex === -1) {
          this.activeIndex = 0;
      }
      // 设置激活状态选项卡
      this.setActive();
      // 监听窗口大小变化事件，调整指示器位置
      $window.on('resize', $.throttle(function () { return this$1.setIndicatorPosition(); }, 100));
      // 监听点击选项卡事件
      this.$tabs.each(function (_, tab) {
          this$1.bindTabEvent(tab);
      });
  };
  /**
   * 指定选项卡是否已禁用
   * @param $tab
   */
  Tab.prototype.isDisabled = function isDisabled ($tab) {
      return $tab.attr('disabled') !== undefined;
  };
  /**
   * 绑定在 Tab 上点击或悬浮的事件
   * @param tab
   */
  Tab.prototype.bindTabEvent = function bindTabEvent (tab) {
          var this$1 = this;

      var $tab = $(tab);
      // 点击或鼠标移入触发的事件
      var clickEvent = function () {
          // 禁用状态的选项卡无法选中
          if (this$1.isDisabled($tab)) {
              return false;
          }
          this$1.activeIndex = this$1.$tabs.index(tab);
          this$1.setActive();
      };
      // 无论 trigger 是 click 还是 hover，都会响应 click 事件
      $tab.on('click', clickEvent);
      // trigger 为 hover 时，额外响应 mouseenter 事件
      if (this.options.trigger === 'hover') {
          $tab.on('mouseenter', clickEvent);
      }
      // 阻止链接的默认点击动作
      $tab.on('click', function () {
          if (($tab.attr('href') || '').indexOf('#') === 0) {
              return false;
          }
      });
  };
  /**
   * 触发组件事件
   * @param name
   * @param $element
   * @param parameters
   */
  Tab.prototype.triggerEvent = function triggerEvent (name, $element, parameters) {
          if ( parameters === void 0 ) parameters = {};

      componentEvent(name, 'tab', $element, this, parameters);
  };
  /**
   * 设置激活状态的选项卡
   */
  Tab.prototype.setActive = function setActive () {
          var this$1 = this;

      this.$tabs.each(function (index, tab) {
          var $tab = $(tab);
          var targetId = $tab.attr('href') || '';
          // 设置选项卡激活状态
          if (index === this$1.activeIndex && !this$1.isDisabled($tab)) {
              if (!$tab.hasClass('mdui-tab-active')) {
                  this$1.triggerEvent('change', this$1.$element, {
                      index: this$1.activeIndex,
                      id: targetId.substr(1),
                  });
                  this$1.triggerEvent('show', $tab);
                  $tab.addClass('mdui-tab-active');
              }
              $(targetId).show();
              this$1.setIndicatorPosition();
          }
          else {
              $tab.removeClass('mdui-tab-active');
              $(targetId).hide();
          }
      });
  };
  /**
   * 设置选项卡指示器的位置
   */
  Tab.prototype.setIndicatorPosition = function setIndicatorPosition () {
      // 选项卡数量为 0 时，不显示指示器
      if (this.activeIndex === -1) {
          this.$indicator.css({
              left: 0,
              width: 0,
          });
          return;
      }
      var $activeTab = this.$tabs.eq(this.activeIndex);
      if (this.isDisabled($activeTab)) {
          return;
      }
      var activeTabOffset = $activeTab.offset();
      this.$indicator.css({
          left: ((activeTabOffset.left +
              this.$element[0].scrollLeft -
              this.$element[0].getBoundingClientRect().left) + "px"),
          width: (($activeTab.innerWidth()) + "px"),
      });
  };
  /**
   * 切换到下一个选项卡
   */
  Tab.prototype.next = function next () {
      if (this.activeIndex === -1) {
          return;
      }
      if (this.$tabs.length > this.activeIndex + 1) {
          this.activeIndex++;
      }
      else if (this.options.loop) {
          this.activeIndex = 0;
      }
      this.setActive();
  };
  /**
   * 切换到上一个选项卡
   */
  Tab.prototype.prev = function prev () {
      if (this.activeIndex === -1) {
          return;
      }
      if (this.activeIndex > 0) {
          this.activeIndex--;
      }
      else if (this.options.loop) {
          this.activeIndex = this.$tabs.length - 1;
      }
      this.setActive();
  };
  /**
   * 显示指定索引号、或指定id的选项卡
   * @param index 索引号、或id
   */
  Tab.prototype.show = function show (index) {
          var this$1 = this;

      if (this.activeIndex === -1) {
          return;
      }
      if (isNumber(index)) {
          this.activeIndex = index;
      }
      else {
          this.$tabs.each(function (i, tab) {
              if (tab.id === index) {
                  this$1.activeIndex = i;
                  return false;
              }
          });
      }
      this.setActive();
  };
  /**
   * 在父元素的宽度变化时，需要调用该方法重新调整指示器位置
   * 在添加或删除选项卡时，需要调用该方法
   */
  Tab.prototype.handleUpdate = function handleUpdate () {
          var this$1 = this;

      var $oldTabs = this.$tabs; // 旧的 tabs JQ对象
      var $newTabs = this.$element.children('a'); // 新的 tabs JQ对象
      var oldTabsElement = $oldTabs.get(); // 旧的 tabs 元素数组
      var newTabsElement = $newTabs.get(); // 新的 tabs 元素数组
      if (!$newTabs.length) {
          this.activeIndex = -1;
          this.$tabs = $newTabs;
          this.setIndicatorPosition();
          return;
      }
      // 重新遍历选项卡，找出新增的选项卡
      $newTabs.each(function (index, tab) {
          // 有新增的选项卡
          if (oldTabsElement.indexOf(tab) < 0) {
              this$1.bindTabEvent(tab);
              if (this$1.activeIndex === -1) {
                  this$1.activeIndex = 0;
              }
              else if (index <= this$1.activeIndex) {
                  this$1.activeIndex++;
              }
          }
      });
      // 找出被移除的选项卡
      $oldTabs.each(function (index, tab) {
          // 有被移除的选项卡
          if (newTabsElement.indexOf(tab) < 0) {
              if (index < this$1.activeIndex) {
                  this$1.activeIndex--;
              }
              else if (index === this$1.activeIndex) {
                  this$1.activeIndex = 0;
              }
          }
      });
      this.$tabs = $newTabs;
      this.setActive();
  };
  mdui.Tab = Tab;

  var customAttr$5 = 'mdui-tab';
  $(function () {
      mdui.mutation(("[" + customAttr$5 + "]"), function () {
          new mdui.Tab(this, parseOptions(this, customAttr$5));
      });
  });

  /**
   * 在桌面设备上默认显示抽屉栏，不显示遮罩层
   * 在手机和平板设备上默认不显示抽屉栏，始终显示遮罩层，且覆盖导航栏
   */
  var DEFAULT_OPTIONS$5 = {
      overlay: false,
      swipe: false,
  };
  var Drawer = function Drawer(selector, options) {
      var this$1 = this;
      if ( options === void 0 ) options = {};

      /**
       * 配置参数
       */
      this.options = extend({}, DEFAULT_OPTIONS$5);
      /**
       * 当前是否显示着遮罩层
       */
      this.overlay = false;
      this.$element = $(selector).first();
      extend(this.options, options);
      this.position = this.$element.hasClass('mdui-drawer-right')
          ? 'right'
          : 'left';
      if (this.$element.hasClass('mdui-drawer-close')) {
          this.state = 'closed';
      }
      else if (this.$element.hasClass('mdui-drawer-open')) {
          this.state = 'opened';
      }
      else if (this.isDesktop()) {
          this.state = 'opened';
      }
      else {
          this.state = 'closed';
      }
      // 浏览器窗口大小调整时
      $window.on('resize', $.throttle(function () {
          if (this$1.isDesktop()) {
              // 由手机平板切换到桌面时
              // 如果显示着遮罩，则隐藏遮罩
              if (this$1.overlay && !this$1.options.overlay) {
                  $.hideOverlay();
                  this$1.overlay = false;
                  $.unlockScreen();
              }
              // 没有强制关闭，则状态为打开状态
              if (!this$1.$element.hasClass('mdui-drawer-close')) {
                  this$1.state = 'opened';
              }
          }
          else if (!this$1.overlay && this$1.state === 'opened') {
              // 由桌面切换到手机平板时。如果抽屉栏是打开着的且没有遮罩层，则关闭抽屉栏
              if (this$1.$element.hasClass('mdui-drawer-open')) {
                  $.showOverlay();
                  this$1.overlay = true;
                  $.lockScreen();
                  $('.mdui-overlay').one('click', function () { return this$1.close(); });
              }
              else {
                  this$1.state = 'closed';
              }
          }
      }, 100));
      // 绑定关闭按钮事件
      this.$element.find('[mdui-drawer-close]').each(function (_, close) {
          $(close).on('click', function () { return this$1.close(); });
      });
      this.swipeSupport();
  };
  /**
   * 是否是桌面设备
   */
  Drawer.prototype.isDesktop = function isDesktop () {
      return $window.width() >= 1024;
  };
  /**
   * 滑动手势支持
   */
  Drawer.prototype.swipeSupport = function swipeSupport () {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      var that = this;
      // 抽屉栏滑动手势控制
      var openNavEventHandler;
      var touchStartX;
      var touchStartY;
      var swipeStartX;
      var swiping = null;
      var maybeSwiping = false;
      var $body = $('body');
      // 手势触发的范围
      var swipeAreaWidth = 24;
      function setPosition(translateX) {
          var rtlTranslateMultiplier = that.position === 'right' ? -1 : 1;
          var transformCSS = "translate(" + (-1 * rtlTranslateMultiplier * translateX) + "px, 0) !important;";
          var transitionCSS = 'initial !important;';
          that.$element.css('cssText', ("transform: " + transformCSS + "; transition: " + transitionCSS + ";"));
      }
      function cleanPosition() {
          that.$element[0].style.transform = '';
          that.$element[0].style.webkitTransform = '';
          that.$element[0].style.transition = '';
          that.$element[0].style.webkitTransition = '';
      }
      function getMaxTranslateX() {
          return that.$element.width() + 10;
      }
      function getTranslateX(currentX) {
          return Math.min(Math.max(swiping === 'closing'
              ? swipeStartX - currentX
              : getMaxTranslateX() + swipeStartX - currentX, 0), getMaxTranslateX());
      }
      function onBodyTouchEnd(event) {
          if (swiping) {
              var touchX = event.changedTouches[0].pageX;
              if (that.position === 'right') {
                  touchX = $body.width() - touchX;
              }
              var translateRatio = getTranslateX(touchX) / getMaxTranslateX();
              maybeSwiping = false;
              var swipingState = swiping;
              swiping = null;
              if (swipingState === 'opening') {
                  if (translateRatio < 0.92) {
                      cleanPosition();
                      that.open();
                  }
                  else {
                      cleanPosition();
                  }
              }
              else {
                  if (translateRatio > 0.08) {
                      cleanPosition();
                      that.close();
                  }
                  else {
                      cleanPosition();
                  }
              }
              $.unlockScreen();
          }
          else {
              maybeSwiping = false;
          }
          $body.off({
              // eslint-disable-next-line @typescript-eslint/no-use-before-define
              touchmove: onBodyTouchMove,
              touchend: onBodyTouchEnd,
              // eslint-disable-next-line @typescript-eslint/no-use-before-define
              touchcancel: onBodyTouchMove,
          });
      }
      function onBodyTouchMove(event) {
          var touchX = event.touches[0].pageX;
          if (that.position === 'right') {
              touchX = $body.width() - touchX;
          }
          var touchY = event.touches[0].pageY;
          if (swiping) {
              setPosition(getTranslateX(touchX));
          }
          else if (maybeSwiping) {
              var dXAbs = Math.abs(touchX - touchStartX);
              var dYAbs = Math.abs(touchY - touchStartY);
              var threshold = 8;
              if (dXAbs > threshold && dYAbs <= threshold) {
                  swipeStartX = touchX;
                  swiping = that.state === 'opened' ? 'closing' : 'opening';
                  $.lockScreen();
                  setPosition(getTranslateX(touchX));
              }
              else if (dXAbs <= threshold && dYAbs > threshold) {
                  onBodyTouchEnd();
              }
          }
      }
      function onBodyTouchStart(event) {
          touchStartX = event.touches[0].pageX;
          if (that.position === 'right') {
              touchStartX = $body.width() - touchStartX;
          }
          touchStartY = event.touches[0].pageY;
          if (that.state !== 'opened') {
              if (touchStartX > swipeAreaWidth ||
                  openNavEventHandler !== onBodyTouchStart) {
                  return;
              }
          }
          maybeSwiping = true;
          $body.on({
              touchmove: onBodyTouchMove,
              touchend: onBodyTouchEnd,
              touchcancel: onBodyTouchMove,
          });
      }
      function enableSwipeHandling() {
          if (!openNavEventHandler) {
              $body.on('touchstart', onBodyTouchStart);
              openNavEventHandler = onBodyTouchStart;
          }
      }
      if (this.options.swipe) {
          enableSwipeHandling();
      }
  };
  /**
   * 触发组件事件
   * @param name
   */
  Drawer.prototype.triggerEvent = function triggerEvent (name) {
      componentEvent(name, 'drawer', this.$element, this);
  };
  /**
   * 动画结束回调
   */
  Drawer.prototype.transitionEnd = function transitionEnd () {
      if (this.$element.hasClass('mdui-drawer-open')) {
          this.state = 'opened';
          this.triggerEvent('opened');
      }
      else {
          this.state = 'closed';
          this.triggerEvent('closed');
      }
  };
  /**
   * 是否处于打开状态
   */
  Drawer.prototype.isOpen = function isOpen () {
      return this.state === 'opening' || this.state === 'opened';
  };
  /**
   * 打开抽屉栏
   */
  Drawer.prototype.open = function open () {
          var this$1 = this;

      if (this.isOpen()) {
          return;
      }
      this.state = 'opening';
      this.triggerEvent('open');
      if (!this.options.overlay) {
          $('body').addClass(("mdui-drawer-body-" + (this.position)));
      }
      this.$element
          .removeClass('mdui-drawer-close')
          .addClass('mdui-drawer-open')
          .transitionEnd(function () { return this$1.transitionEnd(); });
      if (!this.isDesktop() || this.options.overlay) {
          this.overlay = true;
          $.showOverlay().one('click', function () { return this$1.close(); });
          $.lockScreen();
      }
  };
  /**
   * 关闭抽屉栏
   */
  Drawer.prototype.close = function close () {
          var this$1 = this;

      if (!this.isOpen()) {
          return;
      }
      this.state = 'closing';
      this.triggerEvent('close');
      if (!this.options.overlay) {
          $('body').removeClass(("mdui-drawer-body-" + (this.position)));
      }
      this.$element
          .addClass('mdui-drawer-close')
          .removeClass('mdui-drawer-open')
          .transitionEnd(function () { return this$1.transitionEnd(); });
      if (this.overlay) {
          $.hideOverlay();
          this.overlay = false;
          $.unlockScreen();
      }
  };
  /**
   * 切换抽屉栏打开/关闭状态
   */
  Drawer.prototype.toggle = function toggle () {
      this.isOpen() ? this.close() : this.open();
  };
  /**
   * 返回当前抽屉栏的状态。共包含四种状态：`opening`、`opened`、`closing`、`closed`
   */
  Drawer.prototype.getState = function getState () {
      return this.state;
  };
  mdui.Drawer = Drawer;

  var customAttr$6 = 'mdui-drawer';
  $(function () {
      mdui.mutation(("[" + customAttr$6 + "]"), function () {
          var $element = $(this);
          var options = parseOptions(this, customAttr$6);
          var selector = options.target;
          // @ts-ignore
          delete options.target;
          var $drawer = $(selector).first();
          var instance = new mdui.Drawer($drawer, options);
          $element.on('click', function () { return instance.toggle(); });
      });
  });

  var container = {};
  function queue(name, func) {
      if (isUndefined(container[name])) {
          container[name] = [];
      }
      if (isUndefined(func)) {
          return container[name];
      }
      container[name].push(func);
  }
  /**
   * 从队列中移除第一个函数，并执行该函数
   * @param name 队列满
   */
  function dequeue(name) {
      if (isUndefined(container[name])) {
          return;
      }
      if (!container[name].length) {
          return;
      }
      var func = container[name].shift();
      func();
  }

  var DEFAULT_OPTIONS$6 = {
      history: true,
      overlay: true,
      modal: false,
      closeOnEsc: true,
      closeOnCancel: true,
      closeOnConfirm: true,
      destroyOnClosed: false,
  };
  /**
   * 当前显示的对话框实例
   */
  var currentInst = null;
  /**
   * 队列名
   */
  var queueName = '_mdui_dialog';
  /**
   * 窗口是否已锁定
   */
  var isLockScreen = false;
  /**
   * 遮罩层元素
   */
  var $overlay;
  var Dialog = function Dialog(selector, options) {
      var this$1 = this;
      if ( options === void 0 ) options = {};

      /**
       * 配置参数
       */
      this.options = extend({}, DEFAULT_OPTIONS$6);
      /**
       * 当前 dialog 的状态
       */
      this.state = 'closed';
      /**
       * dialog 元素是否是动态添加的
       */
      this.append = false;
      this.$element = $(selector).first();
      // 如果对话框元素没有在当前文档中，则需要添加
      if (!contains(document.body, this.$element[0])) {
          this.append = true;
          $('body').append(this.$element);
      }
      extend(this.options, options);
      // 绑定取消按钮事件
      this.$element.find('[mdui-dialog-cancel]').each(function (_, cancel) {
          $(cancel).on('click', function () {
              this$1.triggerEvent('cancel');
              if (this$1.options.closeOnCancel) {
                  this$1.close();
              }
          });
      });
      // 绑定确认按钮事件
      this.$element.find('[mdui-dialog-confirm]').each(function (_, confirm) {
          $(confirm).on('click', function () {
              this$1.triggerEvent('confirm');
              if (this$1.options.closeOnConfirm) {
                  this$1.close();
              }
          });
      });
      // 绑定关闭按钮事件
      this.$element.find('[mdui-dialog-close]').each(function (_, close) {
          $(close).on('click', function () { return this$1.close(); });
      });
  };
  /**
   * 触发组件事件
   * @param name
   */
  Dialog.prototype.triggerEvent = function triggerEvent (name) {
      componentEvent(name, 'dialog', this.$element, this);
  };
  /**
   * 窗口宽度变化，或对话框内容变化时，调整对话框位置和对话框内的滚动条
   */
  Dialog.prototype.readjust = function readjust () {
      if (!currentInst) {
          return;
      }
      var $element = currentInst.$element;
      var $title = $element.children('.mdui-dialog-title');
      var $content = $element.children('.mdui-dialog-content');
      var $actions = $element.children('.mdui-dialog-actions');
      // 调整 dialog 的 top 和 height 值
      $element.height('');
      $content.height('');
      var elementHeight = $element.height();
      $element.css({
          top: ((($window.height() - elementHeight) / 2) + "px"),
          height: (elementHeight + "px"),
      });
      // 调整 mdui-dialog-content 的高度
      $content.innerHeight(elementHeight -
          ($title.innerHeight() || 0) -
          ($actions.innerHeight() || 0));
  };
  /**
   * hashchange 事件触发时关闭对话框
   */
  Dialog.prototype.hashchangeEvent = function hashchangeEvent () {
      if (window.location.hash.substring(1).indexOf('mdui-dialog') < 0) {
          currentInst.close(true);
      }
  };
  /**
   * 点击遮罩层关闭对话框
   * @param event
   */
  Dialog.prototype.overlayClick = function overlayClick (event) {
      if ($(event.target).hasClass('mdui-overlay') &&
          currentInst) {
          currentInst.close();
      }
  };
  /**
   * 动画结束回调
   */
  Dialog.prototype.transitionEnd = function transitionEnd () {
      if (this.$element.hasClass('mdui-dialog-open')) {
          this.state = 'opened';
          this.triggerEvent('opened');
      }
      else {
          this.state = 'closed';
          this.triggerEvent('closed');
          this.$element.hide();
          // 所有对话框都关闭，且当前没有打开的对话框时，解锁屏幕
          if (!queue(queueName).length && !currentInst && isLockScreen) {
              $.unlockScreen();
              isLockScreen = false;
          }
          $window.off('resize', $.throttle(this.readjust, 100));
          if (this.options.destroyOnClosed) {
              this.destroy();
          }
      }
  };
  /**
   * 打开指定对话框
   */
  Dialog.prototype.doOpen = function doOpen () {
          var this$1 = this;

      currentInst = this;
      if (!isLockScreen) {
          $.lockScreen();
          isLockScreen = true;
      }
      this.$element.show();
      this.readjust();
      $window.on('resize', $.throttle(this.readjust, 100));
      // 打开消息框
      this.state = 'opening';
      this.triggerEvent('open');
      this.$element
          .addClass('mdui-dialog-open')
          .transitionEnd(function () { return this$1.transitionEnd(); });
      // 不存在遮罩层元素时，添加遮罩层
      if (!$overlay) {
          $overlay = $.showOverlay(5100);
      }
      // 点击遮罩层时是否关闭对话框
      if (this.options.modal) {
          $overlay.off('click', this.overlayClick);
      }
      else {
          $overlay.on('click', this.overlayClick);
      }
      // 是否显示遮罩层，不显示时，把遮罩层背景透明
      $overlay.css('opacity', this.options.overlay ? '' : 0);
      if (this.options.history) {
          // 如果 hash 中原来就有 mdui-dialog，先删除，避免后退历史纪录后仍然有 mdui-dialog 导致无法关闭
          // 包括 mdui-dialog 和 &mdui-dialog 和 ?mdui-dialog
          var hash = window.location.hash.substring(1);
          if (hash.indexOf('mdui-dialog') > -1) {
              hash = hash.replace(/[&?]?mdui-dialog/g, '');
          }
          // 后退按钮关闭对话框
          if (hash) {
              window.location.hash = "" + hash + (hash.indexOf('?') > -1 ? '&' : '?') + "mdui-dialog";
          }
          else {
              window.location.hash = 'mdui-dialog';
          }
          $window.on('hashchange', this.hashchangeEvent);
      }
  };
  /**
   * 当前对话框是否为打开状态
   */
  Dialog.prototype.isOpen = function isOpen () {
      return this.state === 'opening' || this.state === 'opened';
  };
  /**
   * 打开对话框
   */
  Dialog.prototype.open = function open () {
          var this$1 = this;

      if (this.isOpen()) {
          return;
      }
      // 如果当前有正在打开或已经打开的对话框,或队列不为空，则先加入队列，等旧对话框开始关闭时再打开
      if ((currentInst &&
          (currentInst.state === 'opening' || currentInst.state === 'opened')) ||
          queue(queueName).length) {
          queue(queueName, function () { return this$1.doOpen(); });
          return;
      }
      this.doOpen();
  };
  /**
   * 关闭对话框
   */
  Dialog.prototype.close = function close (historyBack) {
          var this$1 = this;
          if ( historyBack === void 0 ) historyBack = false;

      // historyBack 是否需要后退历史纪录，默认为 `false`。该参数仅内部使用
      // 为 `false` 时是通过 js 关闭，需要后退一个历史记录
      // 为 `true` 时是通过后退按钮关闭，不需要后退历史记录
      // setTimeout 的作用是：
      // 当同时关闭一个对话框，并打开另一个对话框时，使打开对话框的操作先执行，以使需要打开的对话框先加入队列
      setTimeout(function () {
          if (!this$1.isOpen()) {
              return;
          }
          currentInst = null;
          this$1.state = 'closing';
          this$1.triggerEvent('close');
          // 所有对话框都关闭，且当前没有打开的对话框时，隐藏遮罩
          if (!queue(queueName).length && $overlay) {
              $.hideOverlay();
              $overlay = null;
              // 若仍存在遮罩，恢复遮罩的 z-index
              $('.mdui-overlay').css('z-index', 2000);
          }
          this$1.$element
              .removeClass('mdui-dialog-open')
              .transitionEnd(function () { return this$1.transitionEnd(); });
          if (this$1.options.history && !queue(queueName).length) {
              if (!historyBack) {
                  window.history.back();
              }
              $window.off('hashchange', this$1.hashchangeEvent);
          }
          // 关闭旧对话框，打开新对话框。
          // 加一点延迟，仅仅为了视觉效果更好。不加延时也不影响功能
          setTimeout(function () {
              dequeue(queueName);
          }, 100);
      });
  };
  /**
   * 切换对话框打开/关闭状态
   */
  Dialog.prototype.toggle = function toggle () {
      this.isOpen() ? this.close() : this.open();
  };
  /**
   * 获取对话框状态。共包含四种状态：`opening`、`opened`、`closing`、`closed`
   */
  Dialog.prototype.getState = function getState () {
      return this.state;
  };
  /**
   * 销毁对话框
   */
  Dialog.prototype.destroy = function destroy () {
      if (this.append) {
          this.$element.remove();
      }
      if (!queue(queueName).length && !currentInst) {
          if ($overlay) {
              $.hideOverlay();
              $overlay = null;
          }
          if (isLockScreen) {
              $.unlockScreen();
              isLockScreen = false;
          }
      }
  };
  /**
   * 对话框内容变化时，需要调用该方法来调整对话框位置和滚动条高度
   */
  Dialog.prototype.handleUpdate = function handleUpdate () {
      this.readjust();
  };

  // esc 按下时关闭对话框
  $document.on('keydown', function (event) {
      if (currentInst &&
          currentInst.options.closeOnEsc &&
          currentInst.state === 'opened' &&
          event.keyCode === 27) {
          currentInst.close();
      }
  });
  mdui.Dialog = Dialog;

  var customAttr$7 = 'mdui-dialog';
  var dataName$1 = '_mdui_dialog';
  $(function () {
      $document.on('click', ("[" + customAttr$7 + "]"), function () {
          var options = parseOptions(this, customAttr$7);
          var selector = options.target;
          // @ts-ignore
          delete options.target;
          var $dialog = $(selector).first();
          var instance = $dialog.data(dataName$1);
          if (!instance) {
              instance = new mdui.Dialog($dialog, options);
              $dialog.data(dataName$1, instance);
          }
          instance.open();
      });
  });

  var DEFAULT_BUTTON = {
      text: '',
      bold: false,
      close: true,
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      onClick: function () { },
  };
  var DEFAULT_OPTIONS$7 = {
      title: '',
      content: '',
      buttons: [],
      stackedButtons: false,
      cssClass: '',
      history: true,
      overlay: true,
      modal: false,
      closeOnEsc: true,
      destroyOnClosed: true,
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      onOpen: function () { },
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      onOpened: function () { },
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      onClose: function () { },
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      onClosed: function () { },
  };
  mdui.dialog = function (options) {
      var _a, _b;
      // 合并配置参数
      options = extend({}, DEFAULT_OPTIONS$7, options);
      each(options.buttons, function (i, button) {
          options.buttons[i] = extend({}, DEFAULT_BUTTON, button);
      });
      // 按钮的 HTML
      var buttonsHTML = '';
      if ((_a = options.buttons) === null || _a === void 0 ? void 0 : _a.length) {
          buttonsHTML = "<div class=\"mdui-dialog-actions" + (options.stackedButtons ? ' mdui-dialog-actions-stacked' : '') + "\">";
          each(options.buttons, function (_, button) {
              buttonsHTML +=
                  '<a href="javascript:void(0)" ' +
                      "class=\"mdui-btn mdui-ripple mdui-text-color-primary " + (button.bold ? 'mdui-btn-bold' : '') + "\">" + (button.text) + "</a>";
          });
          buttonsHTML += '</div>';
      }
      // Dialog 的 HTML
      var HTML = "<div class=\"mdui-dialog " + (options.cssClass) + "\">" +
          (options.title
              ? ("<div class=\"mdui-dialog-title\">" + (options.title) + "</div>")
              : '') +
          (options.content
              ? ("<div class=\"mdui-dialog-content\">" + (options.content) + "</div>")
              : '') +
          buttonsHTML +
          '</div>';
      // 实例化 Dialog
      var instance = new mdui.Dialog(HTML, {
          history: options.history,
          overlay: options.overlay,
          modal: options.modal,
          closeOnEsc: options.closeOnEsc,
          destroyOnClosed: options.destroyOnClosed,
      });
      // 绑定按钮事件
      if ((_b = options.buttons) === null || _b === void 0 ? void 0 : _b.length) {
          instance.$element
              .find('.mdui-dialog-actions .mdui-btn')
              .each(function (index, button) {
              $(button).on('click', function () {
                  options.buttons[index].onClick(instance);
                  if (options.buttons[index].close) {
                      instance.close();
                  }
              });
          });
      }
      // 绑定打开关闭事件
      instance.$element
          .on('open.mdui.dialog', function () {
          options.onOpen(instance);
      })
          .on('opened.mdui.dialog', function () {
          options.onOpened(instance);
      })
          .on('close.mdui.dialog', function () {
          options.onClose(instance);
      })
          .on('closed.mdui.dialog', function () {
          options.onClosed(instance);
      });
      instance.open();
      return instance;
  };

  var DEFAULT_OPTIONS$8 = {
      confirmText: 'ok',
      history: true,
      modal: false,
      closeOnEsc: true,
      closeOnConfirm: true,
  };
  mdui.alert = function (text, title, onConfirm, options) {
      if (isFunction(title)) {
          options = onConfirm;
          onConfirm = title;
          title = '';
      }
      if (isUndefined(onConfirm)) {
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          onConfirm = function () { };
      }
      if (isUndefined(options)) {
          options = {};
      }
      options = extend({}, DEFAULT_OPTIONS$8, options);
      return mdui.dialog({
          title: title,
          content: text,
          buttons: [
              {
                  text: options.confirmText,
                  bold: false,
                  close: options.closeOnConfirm,
                  onClick: onConfirm,
              } ],
          cssClass: 'mdui-dialog-alert',
          history: options.history,
          modal: options.modal,
          closeOnEsc: options.closeOnEsc,
      });
  };

  var DEFAULT_OPTIONS$9 = {
      confirmText: 'ok',
      cancelText: 'cancel',
      history: true,
      modal: false,
      closeOnEsc: true,
      closeOnCancel: true,
      closeOnConfirm: true,
  };
  mdui.confirm = function (text, title, onConfirm, onCancel, options) {
      if (isFunction(title)) {
          options = onCancel;
          onCancel = onConfirm;
          onConfirm = title;
          title = '';
      }
      if (isUndefined(onConfirm)) {
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          onConfirm = function () { };
      }
      if (isUndefined(onCancel)) {
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          onCancel = function () { };
      }
      if (isUndefined(options)) {
          options = {};
      }
      options = extend({}, DEFAULT_OPTIONS$9, options);
      return mdui.dialog({
          title: title,
          content: text,
          buttons: [
              {
                  text: options.cancelText,
                  bold: false,
                  close: options.closeOnCancel,
                  onClick: onCancel,
              },
              {
                  text: options.confirmText,
                  bold: false,
                  close: options.closeOnConfirm,
                  onClick: onConfirm,
              } ],
          cssClass: 'mdui-dialog-confirm',
          history: options.history,
          modal: options.modal,
          closeOnEsc: options.closeOnEsc,
      });
  };

  var DEFAULT_OPTIONS$a = {
      confirmText: 'ok',
      cancelText: 'cancel',
      history: true,
      modal: false,
      closeOnEsc: true,
      closeOnCancel: true,
      closeOnConfirm: true,
      type: 'text',
      maxlength: 0,
      defaultValue: '',
      confirmOnEnter: false,
  };
  mdui.prompt = function (label, title, onConfirm, onCancel, options) {
      if (isFunction(title)) {
          options = onCancel;
          onCancel = onConfirm;
          onConfirm = title;
          title = '';
      }
      if (isUndefined(onConfirm)) {
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          onConfirm = function () { };
      }
      if (isUndefined(onCancel)) {
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          onCancel = function () { };
      }
      if (isUndefined(options)) {
          options = {};
      }
      options = extend({}, DEFAULT_OPTIONS$a, options);
      var content = '<div class="mdui-textfield">' +
          (label ? ("<label class=\"mdui-textfield-label\">" + label + "</label>") : '') +
          (options.type === 'text'
              ? ("<input class=\"mdui-textfield-input\" type=\"text\" value=\"" + (options.defaultValue) + "\" " + (options.maxlength ? 'maxlength="' + options.maxlength + '"' : '') + "/>")
              : '') +
          (options.type === 'textarea'
              ? ("<textarea class=\"mdui-textfield-input\" " + (options.maxlength ? 'maxlength="' + options.maxlength + '"' : '') + ">" + (options.defaultValue) + "</textarea>")
              : '') +
          '</div>';
      var onCancelClick = function (dialog) {
          var value = dialog.$element.find('.mdui-textfield-input').val();
          onCancel(value, dialog);
      };
      var onConfirmClick = function (dialog) {
          var value = dialog.$element.find('.mdui-textfield-input').val();
          onConfirm(value, dialog);
      };
      return mdui.dialog({
          title: title,
          content: content,
          buttons: [
              {
                  text: options.cancelText,
                  bold: false,
                  close: options.closeOnCancel,
                  onClick: onCancelClick,
              },
              {
                  text: options.confirmText,
                  bold: false,
                  close: options.closeOnConfirm,
                  onClick: onConfirmClick,
              } ],
          cssClass: 'mdui-dialog-prompt',
          history: options.history,
          modal: options.modal,
          closeOnEsc: options.closeOnEsc,
          onOpen: function (dialog) {
              // 初始化输入框
              var $input = dialog.$element.find('.mdui-textfield-input');
              mdui.updateTextFields($input);
              // 聚焦到输入框
              $input[0].focus();
              // 捕捉文本框回车键，在单行文本框的情况下触发回调
              if (options.type !== 'textarea' && options.confirmOnEnter === true) {
                  $input.on('keydown', function (event) {
                      if (event.keyCode === 13) {
                          var value = dialog.$element.find('.mdui-textfield-input').val();
                          onConfirm(value, dialog);
                          if (options.closeOnConfirm) {
                              dialog.close();
                          }
                          return false;
                      }
                      return;
                  });
              }
              // 如果是多行输入框，监听输入框的 input 事件，更新对话框高度
              if (options.type === 'textarea') {
                  $input.on('input', function () { return dialog.handleUpdate(); });
              }
              // 有字符数限制时，加载完文本框后 DOM 会变化，需要更新对话框高度
              if (options.maxlength) {
                  dialog.handleUpdate();
              }
          },
      });
  };

  var DEFAULT_OPTIONS$b = {
      position: 'auto',
      delay: 0,
      content: '',
  };
  var Tooltip = function Tooltip(selector, options) {
      if ( options === void 0 ) options = {};

      /**
       * 配置参数
       */
      this.options = extend({}, DEFAULT_OPTIONS$b);
      /**
       * 当前 tooltip 的状态
       */
      this.state = 'closed';
      /**
       * setTimeout 的返回值
       */
      this.timeoutId = null;
      this.$target = $(selector).first();
      extend(this.options, options);
      // 创建 Tooltip HTML
      this.$element = $(("<div class=\"mdui-tooltip\" id=\"" + ($.guid()) + "\">" + (this.options.content) + "</div>")).appendTo(document.body);
      // 绑定事件。元素处于 disabled 状态时无法触发鼠标事件，为了统一，把 touch 事件也禁用
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      var that = this;
      this.$target
          .on('touchstart mouseenter', function (event) {
          if (that.isDisabled(this)) {
              return;
          }
          if (!isAllow(event)) {
              return;
          }
          register(event);
          that.open();
      })
          .on('touchend mouseleave', function (event) {
          if (that.isDisabled(this)) {
              return;
          }
          if (!isAllow(event)) {
              return;
          }
          that.close();
      })
          .on(unlockEvent, function (event) {
          if (that.isDisabled(this)) {
              return;
          }
          register(event);
      });
  };
  /**
   * 元素是否已禁用
   * @param element
   */
  Tooltip.prototype.isDisabled = function isDisabled (element) {
      return (element.disabled ||
          $(element).attr('disabled') !== undefined);
  };
  /**
   * 是否是桌面设备
   */
  Tooltip.prototype.isDesktop = function isDesktop () {
      return $window.width() > 1024;
  };
  /**
   * 设置 Tooltip 的位置
   */
  Tooltip.prototype.setPosition = function setPosition () {
      var marginLeft;
      var marginTop;
      // 触发的元素
      var targetProps = this.$target[0].getBoundingClientRect();
      // 触发的元素和 Tooltip 之间的距离
      var targetMargin = this.isDesktop() ? 14 : 24;
      // Tooltip 的宽度和高度
      var tooltipWidth = this.$element[0].offsetWidth;
      var tooltipHeight = this.$element[0].offsetHeight;
      // Tooltip 的方向
      var position = this.options.position;
      // 自动判断位置，加 2px，使 Tooltip 距离窗口边框至少有 2px 的间距
      if (position === 'auto') {
          if (targetProps.top +
              targetProps.height +
              targetMargin +
              tooltipHeight +
              2 <
              $window.height()) {
              position = 'bottom';
          }
          else if (targetMargin + tooltipHeight + 2 < targetProps.top) {
              position = 'top';
          }
          else if (targetMargin + tooltipWidth + 2 < targetProps.left) {
              position = 'left';
          }
          else if (targetProps.width + targetMargin + tooltipWidth + 2 <
              $window.width() - targetProps.left) {
              position = 'right';
          }
          else {
              position = 'bottom';
          }
      }
      // 设置位置
      switch (position) {
          case 'bottom':
              marginLeft = -1 * (tooltipWidth / 2);
              marginTop = targetProps.height / 2 + targetMargin;
              this.$element.transformOrigin('top center');
              break;
          case 'top':
              marginLeft = -1 * (tooltipWidth / 2);
              marginTop =
                  -1 * (tooltipHeight + targetProps.height / 2 + targetMargin);
              this.$element.transformOrigin('bottom center');
              break;
          case 'left':
              marginLeft = -1 * (tooltipWidth + targetProps.width / 2 + targetMargin);
              marginTop = -1 * (tooltipHeight / 2);
              this.$element.transformOrigin('center right');
              break;
          case 'right':
              marginLeft = targetProps.width / 2 + targetMargin;
              marginTop = -1 * (tooltipHeight / 2);
              this.$element.transformOrigin('center left');
              break;
      }
      var targetOffset = this.$target.offset();
      this.$element.css({
          top: ((targetOffset.top + targetProps.height / 2) + "px"),
          left: ((targetOffset.left + targetProps.width / 2) + "px"),
          'margin-left': (marginLeft + "px"),
          'margin-top': (marginTop + "px"),
      });
  };
  /**
   * 触发组件事件
   * @param name
   */
  Tooltip.prototype.triggerEvent = function triggerEvent (name) {
      componentEvent(name, 'tooltip', this.$target, this);
  };
  /**
   * 动画结束回调
   */
  Tooltip.prototype.transitionEnd = function transitionEnd () {
      if (this.$element.hasClass('mdui-tooltip-open')) {
          this.state = 'opened';
          this.triggerEvent('opened');
      }
      else {
          this.state = 'closed';
          this.triggerEvent('closed');
      }
  };
  /**
   * 当前 tooltip 是否为打开状态
   */
  Tooltip.prototype.isOpen = function isOpen () {
      return this.state === 'opening' || this.state === 'opened';
  };
  /**
   * 执行打开 tooltip
   */
  Tooltip.prototype.doOpen = function doOpen () {
          var this$1 = this;

      this.state = 'opening';
      this.triggerEvent('open');
      this.$element
          .addClass('mdui-tooltip-open')
          .transitionEnd(function () { return this$1.transitionEnd(); });
  };
  /**
   * 打开 Tooltip
   * @param options 允许每次打开时设置不同的参数
   */
  Tooltip.prototype.open = function open (options) {
          var this$1 = this;

      if (this.isOpen()) {
          return;
      }
      var oldOptions = extend({}, this.options);
      if (options) {
          extend(this.options, options);
      }
      // tooltip 的内容有更新
      if (oldOptions.content !== this.options.content) {
          this.$element.html(this.options.content);
      }
      this.setPosition();
      if (this.options.delay) {
          this.timeoutId = setTimeout(function () { return this$1.doOpen(); }, this.options.delay);
      }
      else {
          this.timeoutId = null;
          this.doOpen();
      }
  };
  /**
   * 关闭 Tooltip
   */
  Tooltip.prototype.close = function close () {
          var this$1 = this;

      if (this.timeoutId) {
          clearTimeout(this.timeoutId);
          this.timeoutId = null;
      }
      if (!this.isOpen()) {
          return;
      }
      this.state = 'closing';
      this.triggerEvent('close');
      this.$element
          .removeClass('mdui-tooltip-open')
          .transitionEnd(function () { return this$1.transitionEnd(); });
  };
  /**
   * 切换 Tooltip 的打开状态
   */
  Tooltip.prototype.toggle = function toggle () {
      this.isOpen() ? this.close() : this.open();
  };
  /**
   * 获取 Tooltip 状态。共包含四种状态：`opening`、`opened`、`closing`、`closed`
   */
  Tooltip.prototype.getState = function getState () {
      return this.state;
  };
  mdui.Tooltip = Tooltip;

  var customAttr$8 = 'mdui-tooltip';
  var dataName$2 = '_mdui_tooltip';
  $(function () {
      // mouseenter 不能冒泡，所以这里用 mouseover 代替
      $document.on('touchstart mouseover', ("[" + customAttr$8 + "]"), function () {
          var $target = $(this);
          var instance = $target.data(dataName$2);
          if (!instance) {
              instance = new mdui.Tooltip(this, parseOptions(this, customAttr$8));
              $target.data(dataName$2, instance);
          }
      });
  });

  var DEFAULT_OPTIONS$c = {
      message: '',
      timeout: 4000,
      position: 'bottom',
      buttonText: '',
      buttonColor: '',
      closeOnButtonClick: true,
      closeOnOutsideClick: true,
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      onClick: function () { },
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      onButtonClick: function () { },
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      onOpen: function () { },
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      onOpened: function () { },
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      onClose: function () { },
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      onClosed: function () { },
  };
  /**
   * 当前打开着的 Snackbar
   */
  var currentInst$1 = null;
  /**
   * 队列名
   */
  var queueName$1 = '_mdui_snackbar';
  var Snackbar = function Snackbar(options) {
      /**
       * 配置参数
       */
      this.options = extend({}, DEFAULT_OPTIONS$c);
      /**
       * 当前 Snackbar 的状态
       */
      this.state = 'closed';
      /**
       * setTimeout 的 ID
       */
      this.timeoutId = null;
      extend(this.options, options);
      // 按钮颜色
      var buttonColorStyle = '';
      var buttonColorClass = '';
      if (this.options.buttonColor.indexOf('#') === 0 ||
          this.options.buttonColor.indexOf('rgb') === 0) {
          buttonColorStyle = "style=\"color:" + (this.options.buttonColor) + "\"";
      }
      else if (this.options.buttonColor !== '') {
          buttonColorClass = "mdui-text-color-" + (this.options.buttonColor);
      }
      // 添加 HTML
      this.$element = $('<div class="mdui-snackbar">' +
          "<div class=\"mdui-snackbar-text\">" + (this.options.message) + "</div>" +
          (this.options.buttonText
              ? ("<a href=\"javascript:void(0)\" class=\"mdui-snackbar-action mdui-btn mdui-ripple mdui-ripple-white " + buttonColorClass + "\" " + buttonColorStyle + ">" + (this.options.buttonText) + "</a>")
              : '') +
          '</div>').appendTo(document.body);
      // 设置位置
      this.setPosition('close');
      this.$element.reflow().addClass(("mdui-snackbar-" + (this.options.position)));
  };
  /**
   * 点击 Snackbar 外面的区域关闭
   * @param event
   */
  Snackbar.prototype.closeOnOutsideClick = function closeOnOutsideClick (event) {
      var $target = $(event.target);
      if (!$target.hasClass('mdui-snackbar') &&
          !$target.parents('.mdui-snackbar').length) {
          currentInst$1.close();
      }
  };
  /**
   * 设置 Snackbar 的位置
   * @param state
   */
  Snackbar.prototype.setPosition = function setPosition (state) {
      var snackbarHeight = this.$element[0].clientHeight;
      var position = this.options.position;
      var translateX;
      var translateY;
      // translateX
      if (position === 'bottom' || position === 'top') {
          translateX = '-50%';
      }
      else {
          translateX = '0';
      }
      // translateY
      if (state === 'open') {
          translateY = '0';
      }
      else {
          if (position === 'bottom') {
              translateY = snackbarHeight;
          }
          if (position === 'top') {
              translateY = -snackbarHeight;
          }
          if (position === 'left-top' || position === 'right-top') {
              translateY = -snackbarHeight - 24;
          }
          if (position === 'left-bottom' || position === 'right-bottom') {
              translateY = snackbarHeight + 24;
          }
      }
      this.$element.transform(("translate(" + translateX + "," + translateY + "px"));
  };
  /**
   * 打开 Snackbar
   */
  Snackbar.prototype.open = function open () {
          var this$1 = this;

      if (this.state === 'opening' || this.state === 'opened') {
          return;
      }
      // 如果当前有正在显示的 Snackbar，则先加入队列，等旧 Snackbar 关闭后再打开
      if (currentInst$1) {
          queue(queueName$1, function () { return this$1.open(); });
          return;
      }
      currentInst$1 = this;
      // 开始打开
      this.state = 'opening';
      this.options.onOpen(this);
      this.setPosition('open');
      this.$element.transitionEnd(function () {
          if (this$1.state !== 'opening') {
              return;
          }
          this$1.state = 'opened';
          this$1.options.onOpened(this$1);
          // 有按钮时绑定事件
          if (this$1.options.buttonText) {
              this$1.$element.find('.mdui-snackbar-action').on('click', function () {
                  this$1.options.onButtonClick(this$1);
                  if (this$1.options.closeOnButtonClick) {
                      this$1.close();
                  }
              });
          }
          // 点击 snackbar 的事件
          this$1.$element.on('click', function (event) {
              if (!$(event.target).hasClass('mdui-snackbar-action')) {
                  this$1.options.onClick(this$1);
              }
          });
          // 点击 Snackbar 外面的区域关闭
          if (this$1.options.closeOnOutsideClick) {
              $document.on(startEvent, this$1.closeOnOutsideClick);
          }
          // 超时后自动关闭
          if (this$1.options.timeout) {
              this$1.timeoutId = setTimeout(function () { return this$1.close(); }, this$1.options.timeout);
          }
      });
  };
  /**
   * 关闭 Snackbar
   */
  Snackbar.prototype.close = function close () {
          var this$1 = this;

      if (this.state === 'closing' || this.state === 'closed') {
          return;
      }
      if (this.timeoutId) {
          clearTimeout(this.timeoutId);
      }
      if (this.options.closeOnOutsideClick) {
          $document.off(startEvent, this.closeOnOutsideClick);
      }
      this.state = 'closing';
      this.options.onClose(this);
      this.setPosition('close');
      this.$element.transitionEnd(function () {
          if (this$1.state !== 'closing') {
              return;
          }
          currentInst$1 = null;
          this$1.state = 'closed';
          this$1.options.onClosed(this$1);
          this$1.$element.remove();
          dequeue(queueName$1);
      });
  };
  mdui.snackbar = function (message, options) {
      if ( options === void 0 ) options = {};

      if (isString(message)) {
          options.message = message;
      }
      else {
          options = message;
      }
      var instance = new Snackbar(options);
      instance.open();
      return instance;
  };

  $(function () {
      // 切换导航项
      $document.on('click', '.mdui-bottom-nav>a', function () {
          var $item = $(this);
          var $bottomNav = $item.parent();
          $bottomNav.children('a').each(function (index, item) {
              var isThis = $item.is(item);
              if (isThis) {
                  componentEvent('change', 'bottomNav', $bottomNav[0], undefined, {
                      index: index,
                  });
              }
              isThis
                  ? $(item).addClass('mdui-bottom-nav-active')
                  : $(item).removeClass('mdui-bottom-nav-active');
          });
      });
      // 滚动时隐藏 mdui-bottom-nav-scroll-hide
      mdui.mutation('.mdui-bottom-nav-scroll-hide', function () {
          new mdui.Headroom(this, {
              pinnedClass: 'mdui-headroom-pinned-down',
              unpinnedClass: 'mdui-headroom-unpinned-down',
          });
      });
  });

  /**
   * layer 的 HTML 结构
   * @param index
   */
  function layerHTML(index) {
      if ( index === void 0 ) index = false;

      return ("<div class=\"mdui-spinner-layer " + (index ? ("mdui-spinner-layer-" + index) : '') + "\">" +
          '<div class="mdui-spinner-circle-clipper mdui-spinner-left">' +
          '<div class="mdui-spinner-circle"></div>' +
          '</div>' +
          '<div class="mdui-spinner-gap-patch">' +
          '<div class="mdui-spinner-circle"></div>' +
          '</div>' +
          '<div class="mdui-spinner-circle-clipper mdui-spinner-right">' +
          '<div class="mdui-spinner-circle"></div>' +
          '</div>' +
          '</div>');
  }
  /**
   * 填充 HTML
   * @param spinner
   */
  function fillHTML(spinner) {
      var $spinner = $(spinner);
      var layer = $spinner.hasClass('mdui-spinner-colorful')
          ? layerHTML(1) + layerHTML(2) + layerHTML(3) + layerHTML(4)
          : layerHTML();
      $spinner.html(layer);
  }
  $(function () {
      // 页面加载完后自动填充 HTML 结构
      mdui.mutation('.mdui-spinner', function () {
          fillHTML(this);
      });
  });
  mdui.updateSpinners = function (selector) {
      var $elements = isUndefined(selector) ? $('.mdui-spinner') : $(selector);
      $elements.each(function () {
          fillHTML(this);
      });
  };

  var DEFAULT_OPTIONS$d = {
      position: 'auto',
      align: 'auto',
      gutter: 16,
      fixed: false,
      covered: 'auto',
      subMenuTrigger: 'hover',
      subMenuDelay: 200,
  };
  var Menu = function Menu(anchorSelector, menuSelector, options) {
      var this$1 = this;
      if ( options === void 0 ) options = {};

      /**
       * 配置参数
       */
      this.options = extend({}, DEFAULT_OPTIONS$d);
      /**
       * 当前菜单状态
       */
      this.state = 'closed';
      this.$anchor = $(anchorSelector).first();
      this.$element = $(menuSelector).first();
      // 触发菜单的元素 和 菜单必须是同级的元素，否则菜单可能不能定位
      if (!this.$anchor.parent().is(this.$element.parent())) {
          throw new Error('anchorSelector and menuSelector must be siblings');
      }
      extend(this.options, options);
      // 是否是级联菜单
      this.isCascade = this.$element.hasClass('mdui-menu-cascade');
      // covered 参数处理
      this.isCovered =
          this.options.covered === 'auto' ? !this.isCascade : this.options.covered;
      // 点击触发菜单切换
      this.$anchor.on('click', function () { return this$1.toggle(); });
      // 点击菜单外面区域关闭菜单
      $document.on('click touchstart', function (event) {
          var $target = $(event.target);
          if (this$1.isOpen() &&
              !$target.is(this$1.$element) &&
              !contains(this$1.$element[0], $target[0]) &&
              !$target.is(this$1.$anchor) &&
              !contains(this$1.$anchor[0], $target[0])) {
              this$1.close();
          }
      });
      // 点击不含子菜单的菜单条目关闭菜单
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      var that = this;
      $document.on('click', '.mdui-menu-item', function () {
          var $item = $(this);
          if (!$item.find('.mdui-menu').length &&
              $item.attr('disabled') === undefined) {
              that.close();
          }
      });
      // 绑定点击或鼠标移入含子菜单的条目的事件
      this.bindSubMenuEvent();
      // 窗口大小变化时，重新调整菜单位置
      $window.on('resize', $.throttle(function () { return this$1.readjust(); }, 100));
  };
  /**
   * 是否为打开状态
   */
  Menu.prototype.isOpen = function isOpen () {
      return this.state === 'opening' || this.state === 'opened';
  };
  /**
   * 触发组件事件
   * @param name
   */
  Menu.prototype.triggerEvent = function triggerEvent (name) {
      componentEvent(name, 'menu', this.$element, this);
  };
  /**
   * 调整主菜单位置
   */
  Menu.prototype.readjust = function readjust () {
      var menuLeft;
      var menuTop;
      // 菜单位置和方向
      var position;
      var align;
      // window 窗口的宽度和高度
      var windowHeight = $window.height();
      var windowWidth = $window.width();
      // 配置参数
      var gutter = this.options.gutter;
      var isCovered = this.isCovered;
      var isFixed = this.options.fixed;
      // 动画方向参数
      var transformOriginX;
      var transformOriginY;
      // 菜单的原始宽度和高度
      var menuWidth = this.$element.width();
      var menuHeight = this.$element.height();
      // 触发菜单的元素在窗口中的位置
      var anchorRect = this.$anchor[0].getBoundingClientRect();
      var anchorTop = anchorRect.top;
      var anchorLeft = anchorRect.left;
      var anchorHeight = anchorRect.height;
      var anchorWidth = anchorRect.width;
      var anchorBottom = windowHeight - anchorTop - anchorHeight;
      var anchorRight = windowWidth - anchorLeft - anchorWidth;
      // 触发元素相对其拥有定位属性的父元素的位置
      var anchorOffsetTop = this.$anchor[0].offsetTop;
      var anchorOffsetLeft = this.$anchor[0].offsetLeft;
      // 自动判断菜单位置
      if (this.options.position === 'auto') {
          if (anchorBottom + (isCovered ? anchorHeight : 0) > menuHeight + gutter) {
              // 判断下方是否放得下菜单
              position = 'bottom';
          }
          else if (anchorTop + (isCovered ? anchorHeight : 0) >
              menuHeight + gutter) {
              // 判断上方是否放得下菜单
              position = 'top';
          }
          else {
              // 上下都放不下，居中显示
              position = 'center';
          }
      }
      else {
          position = this.options.position;
      }
      // 自动判断菜单对齐方式
      if (this.options.align === 'auto') {
          if (anchorRight + anchorWidth > menuWidth + gutter) {
              // 判断右侧是否放得下菜单
              align = 'left';
          }
          else if (anchorLeft + anchorWidth > menuWidth + gutter) {
              // 判断左侧是否放得下菜单
              align = 'right';
          }
          else {
              // 左右都放不下，居中显示
              align = 'center';
          }
      }
      else {
          align = this.options.align;
      }
      // 设置菜单位置
      if (position === 'bottom') {
          transformOriginY = '0';
          menuTop =
              (isCovered ? 0 : anchorHeight) +
                  (isFixed ? anchorTop : anchorOffsetTop);
      }
      else if (position === 'top') {
          transformOriginY = '100%';
          menuTop =
              (isCovered ? anchorHeight : 0) +
                  (isFixed ? anchorTop - menuHeight : anchorOffsetTop - menuHeight);
      }
      else {
          transformOriginY = '50%';
          // =====================在窗口中居中
          // 显示的菜单的高度，简单菜单高度不超过窗口高度，若超过了则在菜单内部显示滚动条
          // 级联菜单内部不允许出现滚动条
          var menuHeightTemp = menuHeight;
          // 简单菜单比窗口高时，限制菜单高度
          if (!this.isCascade) {
              if (menuHeight + gutter * 2 > windowHeight) {
                  menuHeightTemp = windowHeight - gutter * 2;
                  this.$element.height(menuHeightTemp);
              }
          }
          menuTop =
              (windowHeight - menuHeightTemp) / 2 +
                  (isFixed ? 0 : anchorOffsetTop - anchorTop);
      }
      this.$element.css('top', (menuTop + "px"));
      // 设置菜单对齐方式
      if (align === 'left') {
          transformOriginX = '0';
          menuLeft = isFixed ? anchorLeft : anchorOffsetLeft;
      }
      else if (align === 'right') {
          transformOriginX = '100%';
          menuLeft = isFixed
              ? anchorLeft + anchorWidth - menuWidth
              : anchorOffsetLeft + anchorWidth - menuWidth;
      }
      else {
          transformOriginX = '50%';
          //=======================在窗口中居中
          // 显示的菜单的宽度，菜单宽度不能超过窗口宽度
          var menuWidthTemp = menuWidth;
          // 菜单比窗口宽，限制菜单宽度
          if (menuWidth + gutter * 2 > windowWidth) {
              menuWidthTemp = windowWidth - gutter * 2;
              this.$element.width(menuWidthTemp);
          }
          menuLeft =
              (windowWidth - menuWidthTemp) / 2 +
                  (isFixed ? 0 : anchorOffsetLeft - anchorLeft);
      }
      this.$element.css('left', (menuLeft + "px"));
      // 设置菜单动画方向
      this.$element.transformOrigin((transformOriginX + " " + transformOriginY));
  };
  /**
   * 调整子菜单的位置
   * @param $submenu
   */
  Menu.prototype.readjustSubmenu = function readjustSubmenu ($submenu) {
      var $item = $submenu.parent('.mdui-menu-item');
      var submenuTop;
      var submenuLeft;
      // 子菜单位置和方向
      var position;
      var align;
      // window 窗口的宽度和高度
      var windowHeight = $window.height();
      var windowWidth = $window.width();
      // 动画方向参数
      var transformOriginX;
      var transformOriginY;
      // 子菜单的原始宽度和高度
      var submenuWidth = $submenu.width();
      var submenuHeight = $submenu.height();
      // 触发子菜单的菜单项的宽度高度
      var itemRect = $item[0].getBoundingClientRect();
      var itemWidth = itemRect.width;
      var itemHeight = itemRect.height;
      var itemLeft = itemRect.left;
      var itemTop = itemRect.top;
      // 判断菜单上下位置
      if (windowHeight - itemTop > submenuHeight) {
          // 判断下方是否放得下菜单
          position = 'bottom';
      }
      else if (itemTop + itemHeight > submenuHeight) {
          // 判断上方是否放得下菜单
          position = 'top';
      }
      else {
          // 默认放在下方
          position = 'bottom';
      }
      // 判断菜单左右位置
      if (windowWidth - itemLeft - itemWidth > submenuWidth) {
          // 判断右侧是否放得下菜单
          align = 'left';
      }
      else if (itemLeft > submenuWidth) {
          // 判断左侧是否放得下菜单
          align = 'right';
      }
      else {
          // 默认放在右侧
          align = 'left';
      }
      // 设置菜单位置
      if (position === 'bottom') {
          transformOriginY = '0';
          submenuTop = '0';
      }
      else if (position === 'top') {
          transformOriginY = '100%';
          submenuTop = -submenuHeight + itemHeight;
      }
      $submenu.css('top', (submenuTop + "px"));
      // 设置菜单对齐方式
      if (align === 'left') {
          transformOriginX = '0';
          submenuLeft = itemWidth;
      }
      else if (align === 'right') {
          transformOriginX = '100%';
          submenuLeft = -submenuWidth;
      }
      $submenu.css('left', (submenuLeft + "px"));
      // 设置菜单动画方向
      $submenu.transformOrigin((transformOriginX + " " + transformOriginY));
  };
  /**
   * 打开子菜单
   * @param $submenu
   */
  Menu.prototype.openSubMenu = function openSubMenu ($submenu) {
      this.readjustSubmenu($submenu);
      $submenu
          .addClass('mdui-menu-open')
          .parent('.mdui-menu-item')
          .addClass('mdui-menu-item-active');
  };
  /**
   * 关闭子菜单，及其嵌套的子菜单
   * @param $submenu
   */
  Menu.prototype.closeSubMenu = function closeSubMenu ($submenu) {
      // 关闭子菜单
      $submenu
          .removeClass('mdui-menu-open')
          .addClass('mdui-menu-closing')
          .transitionEnd(function () { return $submenu.removeClass('mdui-menu-closing'); })
          // 移除激活状态的样式
          .parent('.mdui-menu-item')
          .removeClass('mdui-menu-item-active');
      // 循环关闭嵌套的子菜单
      $submenu.find('.mdui-menu').each(function (_, menu) {
          var $subSubmenu = $(menu);
          $subSubmenu
              .removeClass('mdui-menu-open')
              .addClass('mdui-menu-closing')
              .transitionEnd(function () { return $subSubmenu.removeClass('mdui-menu-closing'); })
              .parent('.mdui-menu-item')
              .removeClass('mdui-menu-item-active');
      });
  };
  /**
   * 切换子菜单状态
   * @param $submenu
   */
  Menu.prototype.toggleSubMenu = function toggleSubMenu ($submenu) {
      $submenu.hasClass('mdui-menu-open')
          ? this.closeSubMenu($submenu)
          : this.openSubMenu($submenu);
  };
  /**
   * 绑定子菜单事件
   */
  Menu.prototype.bindSubMenuEvent = function bindSubMenuEvent () {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      var that = this;
      // 点击打开子菜单
      this.$element.on('click', '.mdui-menu-item', function (event) {
          var $item = $(this);
          var $target = $(event.target);
          // 禁用状态菜单不操作
          if ($item.attr('disabled') !== undefined) {
              return;
          }
          // 没有点击在子菜单的菜单项上时，不操作（点在了子菜单的空白区域、或分隔线上）
          if ($target.is('.mdui-menu') || $target.is('.mdui-divider')) {
              return;
          }
          // 阻止冒泡，点击菜单项时只在最后一级的 mdui-menu-item 上生效，不向上冒泡
          if (!$target.parents('.mdui-menu-item').first().is($item)) {
              return;
          }
          // 当前菜单的子菜单
          var $submenu = $item.children('.mdui-menu');
          // 先关闭除当前子菜单外的所有同级子菜单
          $item
              .parent('.mdui-menu')
              .children('.mdui-menu-item')
              .each(function (_, item) {
              var $tmpSubmenu = $(item).children('.mdui-menu');
              if ($tmpSubmenu.length &&
                  (!$submenu.length || !$tmpSubmenu.is($submenu))) {
                  that.closeSubMenu($tmpSubmenu);
              }
          });
          // 切换当前子菜单
          if ($submenu.length) {
              that.toggleSubMenu($submenu);
          }
      });
      if (this.options.subMenuTrigger === 'hover') {
          // 临时存储 setTimeout 对象
          var timeout = null;
          var timeoutOpen = null;
          this.$element.on('mouseover mouseout', '.mdui-menu-item', function (event) {
              var $item = $(this);
              var eventType = event.type;
              var $relatedTarget = $(event.relatedTarget);
              // 禁用状态的菜单不操作
              if ($item.attr('disabled') !== undefined) {
                  return;
              }
              // 用 mouseover 模拟 mouseenter
              if (eventType === 'mouseover') {
                  if (!$item.is($relatedTarget) &&
                      contains($item[0], $relatedTarget[0])) {
                      return;
                  }
              }
              // 用 mouseout 模拟 mouseleave
              else if (eventType === 'mouseout') {
                  if ($item.is($relatedTarget) ||
                      contains($item[0], $relatedTarget[0])) {
                      return;
                  }
              }
              // 当前菜单项下的子菜单，未必存在
              var $submenu = $item.children('.mdui-menu');
              // 鼠标移入菜单项时，显示菜单项下的子菜单
              if (eventType === 'mouseover') {
                  if ($submenu.length) {
                      // 当前子菜单准备打开时，如果当前子菜单正准备着关闭，不用再关闭了
                      var tmpClose = $submenu.data('timeoutClose.mdui.menu');
                      if (tmpClose) {
                          clearTimeout(tmpClose);
                      }
                      // 如果当前子菜单已经打开，不操作
                      if ($submenu.hasClass('mdui-menu-open')) {
                          return;
                      }
                      // 当前子菜单准备打开时，其他准备打开的子菜单不用再打开了
                      clearTimeout(timeoutOpen);
                      // 准备打开当前子菜单
                      timeout = timeoutOpen = setTimeout(function () { return that.openSubMenu($submenu); }, that.options.subMenuDelay);
                      $submenu.data('timeoutOpen.mdui.menu', timeout);
                  }
              }
              // 鼠标移出菜单项时，关闭菜单项下的子菜单
              else if (eventType === 'mouseout') {
                  if ($submenu.length) {
                      // 鼠标移出菜单项时，如果当前菜单项下的子菜单正准备打开，不用再打开了
                      var tmpOpen = $submenu.data('timeoutOpen.mdui.menu');
                      if (tmpOpen) {
                          clearTimeout(tmpOpen);
                      }
                      // 准备关闭当前子菜单
                      timeout = setTimeout(function () { return that.closeSubMenu($submenu); }, that.options.subMenuDelay);
                      $submenu.data('timeoutClose.mdui.menu', timeout);
                  }
              }
          });
      }
  };
  /**
   * 动画结束回调
   */
  Menu.prototype.transitionEnd = function transitionEnd () {
      this.$element.removeClass('mdui-menu-closing');
      if (this.state === 'opening') {
          this.state = 'opened';
          this.triggerEvent('opened');
      }
      if (this.state === 'closing') {
          this.state = 'closed';
          this.triggerEvent('closed');
          // 关闭后，恢复菜单样式到默认状态，并恢复 fixed 定位
          this.$element.css({
              top: '',
              left: '',
              width: '',
              position: 'fixed',
          });
      }
  };
  /**
   * 切换菜单状态
   */
  Menu.prototype.toggle = function toggle () {
      this.isOpen() ? this.close() : this.open();
  };
  /**
   * 打开菜单
   */
  Menu.prototype.open = function open () {
          var this$1 = this;

      if (this.isOpen()) {
          return;
      }
      this.state = 'opening';
      this.triggerEvent('open');
      this.readjust();
      this.$element
          // 菜单隐藏状态使用使用 fixed 定位。
          .css('position', this.options.fixed ? 'fixed' : 'absolute')
          .addClass('mdui-menu-open')
          .transitionEnd(function () { return this$1.transitionEnd(); });
  };
  /**
   * 关闭菜单
   */
  Menu.prototype.close = function close () {
          var this$1 = this;

      if (!this.isOpen()) {
          return;
      }
      this.state = 'closing';
      this.triggerEvent('close');
      // 菜单开始关闭时，关闭所有子菜单
      this.$element.find('.mdui-menu').each(function (_, submenu) {
          this$1.closeSubMenu($(submenu));
      });
      this.$element
          .removeClass('mdui-menu-open')
          .addClass('mdui-menu-closing')
          .transitionEnd(function () { return this$1.transitionEnd(); });
  };
  mdui.Menu = Menu;

  var customAttr$9 = 'mdui-menu';
  var dataName$3 = '_mdui_menu';
  $(function () {
      $document.on('click', ("[" + customAttr$9 + "]"), function () {
          var $this = $(this);
          var instance = $this.data(dataName$3);
          if (!instance) {
              var options = parseOptions(this, customAttr$9);
              var menuSelector = options.target;
              // @ts-ignore
              delete options.target;
              instance = new mdui.Menu($this, menuSelector, options);
              $this.data(dataName$3, instance);
              instance.toggle();
          }
      });
  });

  
  
  
  
  
  
  
  
  // === Monet Dynamic Theme Module ===
  (function() {
    var mdui_monet_bundle = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/monet.js
  var monet_exports = {};
  __export(monet_exports, {
    default: () => monet_default,
    monet: () => monet
  });

  // node_modules/@material/material-color-utilities/utils/math_utils.js
  function signum(num) {
    if (num < 0) {
      return -1;
    } else if (num === 0) {
      return 0;
    } else {
      return 1;
    }
  }
  function lerp(start, stop, amount) {
    return (1 - amount) * start + amount * stop;
  }
  function clampInt(min, max, input) {
    if (input < min) {
      return min;
    } else if (input > max) {
      return max;
    }
    return input;
  }
  function clampDouble(min, max, input) {
    if (input < min) {
      return min;
    } else if (input > max) {
      return max;
    }
    return input;
  }
  function sanitizeDegreesInt(degrees) {
    degrees = degrees % 360;
    if (degrees < 0) {
      degrees = degrees + 360;
    }
    return degrees;
  }
  function sanitizeDegreesDouble(degrees) {
    degrees = degrees % 360;
    if (degrees < 0) {
      degrees = degrees + 360;
    }
    return degrees;
  }
  function rotationDirection(from, to) {
    const increasingDifference = sanitizeDegreesDouble(to - from);
    return increasingDifference <= 180 ? 1 : -1;
  }
  function differenceDegrees(a, b) {
    return 180 - Math.abs(Math.abs(a - b) - 180);
  }
  function matrixMultiply(row, matrix) {
    const a = row[0] * matrix[0][0] + row[1] * matrix[0][1] + row[2] * matrix[0][2];
    const b = row[0] * matrix[1][0] + row[1] * matrix[1][1] + row[2] * matrix[1][2];
    const c = row[0] * matrix[2][0] + row[1] * matrix[2][1] + row[2] * matrix[2][2];
    return [a, b, c];
  }

  // node_modules/@material/material-color-utilities/utils/color_utils.js
  var SRGB_TO_XYZ = [
    [0.41233895, 0.35762064, 0.18051042],
    [0.2126, 0.7152, 0.0722],
    [0.01932141, 0.11916382, 0.95034478]
  ];
  var XYZ_TO_SRGB = [
    [
      3.2413774792388685,
      -1.5376652402851851,
      -0.49885366846268053
    ],
    [
      -0.9691452513005321,
      1.8758853451067872,
      0.04156585616912061
    ],
    [
      0.05562093689691305,
      -0.20395524564742123,
      1.0571799111220335
    ]
  ];
  var WHITE_POINT_D65 = [95.047, 100, 108.883];
  function argbFromRgb(red, green, blue) {
    return (255 << 24 | (red & 255) << 16 | (green & 255) << 8 | blue & 255) >>> 0;
  }
  function argbFromLinrgb(linrgb) {
    const r = delinearized(linrgb[0]);
    const g = delinearized(linrgb[1]);
    const b = delinearized(linrgb[2]);
    return argbFromRgb(r, g, b);
  }
  function alphaFromArgb(argb) {
    return argb >> 24 & 255;
  }
  function redFromArgb(argb) {
    return argb >> 16 & 255;
  }
  function greenFromArgb(argb) {
    return argb >> 8 & 255;
  }
  function blueFromArgb(argb) {
    return argb & 255;
  }
  function argbFromXyz(x, y, z) {
    const matrix = XYZ_TO_SRGB;
    const linearR = matrix[0][0] * x + matrix[0][1] * y + matrix[0][2] * z;
    const linearG = matrix[1][0] * x + matrix[1][1] * y + matrix[1][2] * z;
    const linearB = matrix[2][0] * x + matrix[2][1] * y + matrix[2][2] * z;
    const r = delinearized(linearR);
    const g = delinearized(linearG);
    const b = delinearized(linearB);
    return argbFromRgb(r, g, b);
  }
  function xyzFromArgb(argb) {
    const r = linearized(redFromArgb(argb));
    const g = linearized(greenFromArgb(argb));
    const b = linearized(blueFromArgb(argb));
    return matrixMultiply([r, g, b], SRGB_TO_XYZ);
  }
  function argbFromLab(l, a, b) {
    const whitePoint = WHITE_POINT_D65;
    const fy = (l + 16) / 116;
    const fx = a / 500 + fy;
    const fz = fy - b / 200;
    const xNormalized = labInvf(fx);
    const yNormalized = labInvf(fy);
    const zNormalized = labInvf(fz);
    const x = xNormalized * whitePoint[0];
    const y = yNormalized * whitePoint[1];
    const z = zNormalized * whitePoint[2];
    return argbFromXyz(x, y, z);
  }
  function labFromArgb(argb) {
    const linearR = linearized(redFromArgb(argb));
    const linearG = linearized(greenFromArgb(argb));
    const linearB = linearized(blueFromArgb(argb));
    const matrix = SRGB_TO_XYZ;
    const x = matrix[0][0] * linearR + matrix[0][1] * linearG + matrix[0][2] * linearB;
    const y = matrix[1][0] * linearR + matrix[1][1] * linearG + matrix[1][2] * linearB;
    const z = matrix[2][0] * linearR + matrix[2][1] * linearG + matrix[2][2] * linearB;
    const whitePoint = WHITE_POINT_D65;
    const xNormalized = x / whitePoint[0];
    const yNormalized = y / whitePoint[1];
    const zNormalized = z / whitePoint[2];
    const fx = labF(xNormalized);
    const fy = labF(yNormalized);
    const fz = labF(zNormalized);
    const l = 116 * fy - 16;
    const a = 500 * (fx - fy);
    const b = 200 * (fy - fz);
    return [l, a, b];
  }
  function argbFromLstar(lstar) {
    const y = yFromLstar(lstar);
    const component = delinearized(y);
    return argbFromRgb(component, component, component);
  }
  function lstarFromArgb(argb) {
    const y = xyzFromArgb(argb)[1];
    return 116 * labF(y / 100) - 16;
  }
  function yFromLstar(lstar) {
    return 100 * labInvf((lstar + 16) / 116);
  }
  function lstarFromY(y) {
    return labF(y / 100) * 116 - 16;
  }
  function linearized(rgbComponent) {
    const normalized = rgbComponent / 255;
    if (normalized <= 0.040449936) {
      return normalized / 12.92 * 100;
    } else {
      return Math.pow((normalized + 0.055) / 1.055, 2.4) * 100;
    }
  }
  function delinearized(rgbComponent) {
    const normalized = rgbComponent / 100;
    let delinearized2 = 0;
    if (normalized <= 31308e-7) {
      delinearized2 = normalized * 12.92;
    } else {
      delinearized2 = 1.055 * Math.pow(normalized, 1 / 2.4) - 0.055;
    }
    return clampInt(0, 255, Math.round(delinearized2 * 255));
  }
  function whitePointD65() {
    return WHITE_POINT_D65;
  }
  function labF(t) {
    const e = 216 / 24389;
    const kappa = 24389 / 27;
    if (t > e) {
      return Math.pow(t, 1 / 3);
    } else {
      return (kappa * t + 16) / 116;
    }
  }
  function labInvf(ft) {
    const e = 216 / 24389;
    const kappa = 24389 / 27;
    const ft3 = ft * ft * ft;
    if (ft3 > e) {
      return ft3;
    } else {
      return (116 * ft - 16) / kappa;
    }
  }

  // node_modules/@material/material-color-utilities/hct/viewing_conditions.js
  var ViewingConditions = class _ViewingConditions {
    /**
     * Create ViewingConditions from a simple, physically relevant, set of
     * parameters.
     *
     * @param whitePoint White point, measured in the XYZ color space.
     *     default = D65, or sunny day afternoon
     * @param adaptingLuminance The luminance of the adapting field. Informally,
     *     how bright it is in the room where the color is viewed. Can be
     *     calculated from lux by multiplying lux by 0.0586. default = 11.72,
     *     or 200 lux.
     * @param backgroundLstar The lightness of the area surrounding the color.
     *     measured by L* in L*a*b*. default = 50.0
     * @param surround A general description of the lighting surrounding the
     *     color. 0 is pitch dark, like watching a movie in a theater. 1.0 is a
     *     dimly light room, like watching TV at home at night. 2.0 means there
     *     is no difference between the lighting on the color and around it.
     *     default = 2.0
     * @param discountingIlluminant Whether the eye accounts for the tint of the
     *     ambient lighting, such as knowing an apple is still red in green light.
     *     default = false, the eye does not perform this process on
     *       self-luminous objects like displays.
     */
    static make(whitePoint = whitePointD65(), adaptingLuminance = 200 / Math.PI * yFromLstar(50) / 100, backgroundLstar = 50, surround = 2, discountingIlluminant = false) {
      const xyz = whitePoint;
      const rW = xyz[0] * 0.401288 + xyz[1] * 0.650173 + xyz[2] * -0.051461;
      const gW = xyz[0] * -0.250268 + xyz[1] * 1.204414 + xyz[2] * 0.045854;
      const bW = xyz[0] * -2079e-6 + xyz[1] * 0.048952 + xyz[2] * 0.953127;
      const f = 0.8 + surround / 10;
      const c = f >= 0.9 ? lerp(0.59, 0.69, (f - 0.9) * 10) : lerp(0.525, 0.59, (f - 0.8) * 10);
      let d = discountingIlluminant ? 1 : f * (1 - 1 / 3.6 * Math.exp((-adaptingLuminance - 42) / 92));
      d = d > 1 ? 1 : d < 0 ? 0 : d;
      const nc = f;
      const rgbD = [
        d * (100 / rW) + 1 - d,
        d * (100 / gW) + 1 - d,
        d * (100 / bW) + 1 - d
      ];
      const k = 1 / (5 * adaptingLuminance + 1);
      const k4 = k * k * k * k;
      const k4F = 1 - k4;
      const fl = k4 * adaptingLuminance + 0.1 * k4F * k4F * Math.cbrt(5 * adaptingLuminance);
      const n = yFromLstar(backgroundLstar) / whitePoint[1];
      const z = 1.48 + Math.sqrt(n);
      const nbb = 0.725 / Math.pow(n, 0.2);
      const ncb = nbb;
      const rgbAFactors = [
        Math.pow(fl * rgbD[0] * rW / 100, 0.42),
        Math.pow(fl * rgbD[1] * gW / 100, 0.42),
        Math.pow(fl * rgbD[2] * bW / 100, 0.42)
      ];
      const rgbA = [
        400 * rgbAFactors[0] / (rgbAFactors[0] + 27.13),
        400 * rgbAFactors[1] / (rgbAFactors[1] + 27.13),
        400 * rgbAFactors[2] / (rgbAFactors[2] + 27.13)
      ];
      const aw = (2 * rgbA[0] + rgbA[1] + 0.05 * rgbA[2]) * nbb;
      return new _ViewingConditions(n, aw, nbb, ncb, c, nc, rgbD, fl, Math.pow(fl, 0.25), z);
    }
    /**
     * Parameters are intermediate values of the CAM16 conversion process. Their
     * names are shorthand for technical color science terminology, this class
     * would not benefit from documenting them individually. A brief overview
     * is available in the CAM16 specification, and a complete overview requires
     * a color science textbook, such as Fairchild's Color Appearance Models.
     */
    constructor(n, aw, nbb, ncb, c, nc, rgbD, fl, fLRoot, z) {
      this.n = n;
      this.aw = aw;
      this.nbb = nbb;
      this.ncb = ncb;
      this.c = c;
      this.nc = nc;
      this.rgbD = rgbD;
      this.fl = fl;
      this.fLRoot = fLRoot;
      this.z = z;
    }
  };
  ViewingConditions.DEFAULT = ViewingConditions.make();

  // node_modules/@material/material-color-utilities/hct/cam16.js
  var Cam16 = class _Cam16 {
    /**
     * All of the CAM16 dimensions can be calculated from 3 of the dimensions, in
     * the following combinations:
     *      -  {j or q} and {c, m, or s} and hue
     *      - jstar, astar, bstar
     * Prefer using a static method that constructs from 3 of those dimensions.
     * This constructor is intended for those methods to use to return all
     * possible dimensions.
     *
     * @param hue
     * @param chroma informally, colorfulness / color intensity. like saturation
     *     in HSL, except perceptually accurate.
     * @param j lightness
     * @param q brightness; ratio of lightness to white point's lightness
     * @param m colorfulness
     * @param s saturation; ratio of chroma to white point's chroma
     * @param jstar CAM16-UCS J coordinate
     * @param astar CAM16-UCS a coordinate
     * @param bstar CAM16-UCS b coordinate
     */
    constructor(hue, chroma, j, q, m, s, jstar, astar, bstar) {
      this.hue = hue;
      this.chroma = chroma;
      this.j = j;
      this.q = q;
      this.m = m;
      this.s = s;
      this.jstar = jstar;
      this.astar = astar;
      this.bstar = bstar;
    }
    /**
     * CAM16 instances also have coordinates in the CAM16-UCS space, called J*,
     * a*, b*, or jstar, astar, bstar in code. CAM16-UCS is included in the CAM16
     * specification, and is used to measure distances between colors.
     */
    distance(other) {
      const dJ = this.jstar - other.jstar;
      const dA = this.astar - other.astar;
      const dB = this.bstar - other.bstar;
      const dEPrime = Math.sqrt(dJ * dJ + dA * dA + dB * dB);
      const dE = 1.41 * Math.pow(dEPrime, 0.63);
      return dE;
    }
    /**
     * @param argb ARGB representation of a color.
     * @return CAM16 color, assuming the color was viewed in default viewing
     *     conditions.
     */
    static fromInt(argb) {
      return _Cam16.fromIntInViewingConditions(argb, ViewingConditions.DEFAULT);
    }
    /**
     * @param argb ARGB representation of a color.
     * @param viewingConditions Information about the environment where the color
     *     was observed.
     * @return CAM16 color.
     */
    static fromIntInViewingConditions(argb, viewingConditions) {
      const red = (argb & 16711680) >> 16;
      const green = (argb & 65280) >> 8;
      const blue = argb & 255;
      const redL = linearized(red);
      const greenL = linearized(green);
      const blueL = linearized(blue);
      const x = 0.41233895 * redL + 0.35762064 * greenL + 0.18051042 * blueL;
      const y = 0.2126 * redL + 0.7152 * greenL + 0.0722 * blueL;
      const z = 0.01932141 * redL + 0.11916382 * greenL + 0.95034478 * blueL;
      const rC = 0.401288 * x + 0.650173 * y - 0.051461 * z;
      const gC = -0.250268 * x + 1.204414 * y + 0.045854 * z;
      const bC = -2079e-6 * x + 0.048952 * y + 0.953127 * z;
      const rD = viewingConditions.rgbD[0] * rC;
      const gD = viewingConditions.rgbD[1] * gC;
      const bD = viewingConditions.rgbD[2] * bC;
      const rAF = Math.pow(viewingConditions.fl * Math.abs(rD) / 100, 0.42);
      const gAF = Math.pow(viewingConditions.fl * Math.abs(gD) / 100, 0.42);
      const bAF = Math.pow(viewingConditions.fl * Math.abs(bD) / 100, 0.42);
      const rA = signum(rD) * 400 * rAF / (rAF + 27.13);
      const gA = signum(gD) * 400 * gAF / (gAF + 27.13);
      const bA = signum(bD) * 400 * bAF / (bAF + 27.13);
      const a = (11 * rA + -12 * gA + bA) / 11;
      const b = (rA + gA - 2 * bA) / 9;
      const u = (20 * rA + 20 * gA + 21 * bA) / 20;
      const p2 = (40 * rA + 20 * gA + bA) / 20;
      const atan2 = Math.atan2(b, a);
      const atanDegrees = atan2 * 180 / Math.PI;
      const hue = sanitizeDegreesDouble(atanDegrees);
      const hueRadians = hue * Math.PI / 180;
      const ac = p2 * viewingConditions.nbb;
      const j = 100 * Math.pow(ac / viewingConditions.aw, viewingConditions.c * viewingConditions.z);
      const q = 4 / viewingConditions.c * Math.sqrt(j / 100) * (viewingConditions.aw + 4) * viewingConditions.fLRoot;
      const huePrime = hue < 20.14 ? hue + 360 : hue;
      const eHue = 0.25 * (Math.cos(huePrime * Math.PI / 180 + 2) + 3.8);
      const p1 = 5e4 / 13 * eHue * viewingConditions.nc * viewingConditions.ncb;
      const t = p1 * Math.sqrt(a * a + b * b) / (u + 0.305);
      const alpha = Math.pow(t, 0.9) * Math.pow(1.64 - Math.pow(0.29, viewingConditions.n), 0.73);
      const c = alpha * Math.sqrt(j / 100);
      const m = c * viewingConditions.fLRoot;
      const s = 50 * Math.sqrt(alpha * viewingConditions.c / (viewingConditions.aw + 4));
      const jstar = (1 + 100 * 7e-3) * j / (1 + 7e-3 * j);
      const mstar = 1 / 0.0228 * Math.log(1 + 0.0228 * m);
      const astar = mstar * Math.cos(hueRadians);
      const bstar = mstar * Math.sin(hueRadians);
      return new _Cam16(hue, c, j, q, m, s, jstar, astar, bstar);
    }
    /**
     * @param j CAM16 lightness
     * @param c CAM16 chroma
     * @param h CAM16 hue
     */
    static fromJch(j, c, h) {
      return _Cam16.fromJchInViewingConditions(j, c, h, ViewingConditions.DEFAULT);
    }
    /**
     * @param j CAM16 lightness
     * @param c CAM16 chroma
     * @param h CAM16 hue
     * @param viewingConditions Information about the environment where the color
     *     was observed.
     */
    static fromJchInViewingConditions(j, c, h, viewingConditions) {
      const q = 4 / viewingConditions.c * Math.sqrt(j / 100) * (viewingConditions.aw + 4) * viewingConditions.fLRoot;
      const m = c * viewingConditions.fLRoot;
      const alpha = c / Math.sqrt(j / 100);
      const s = 50 * Math.sqrt(alpha * viewingConditions.c / (viewingConditions.aw + 4));
      const hueRadians = h * Math.PI / 180;
      const jstar = (1 + 100 * 7e-3) * j / (1 + 7e-3 * j);
      const mstar = 1 / 0.0228 * Math.log(1 + 0.0228 * m);
      const astar = mstar * Math.cos(hueRadians);
      const bstar = mstar * Math.sin(hueRadians);
      return new _Cam16(h, c, j, q, m, s, jstar, astar, bstar);
    }
    /**
     * @param jstar CAM16-UCS lightness.
     * @param astar CAM16-UCS a dimension. Like a* in L*a*b*, it is a Cartesian
     *     coordinate on the Y axis.
     * @param bstar CAM16-UCS b dimension. Like a* in L*a*b*, it is a Cartesian
     *     coordinate on the X axis.
     */
    static fromUcs(jstar, astar, bstar) {
      return _Cam16.fromUcsInViewingConditions(jstar, astar, bstar, ViewingConditions.DEFAULT);
    }
    /**
     * @param jstar CAM16-UCS lightness.
     * @param astar CAM16-UCS a dimension. Like a* in L*a*b*, it is a Cartesian
     *     coordinate on the Y axis.
     * @param bstar CAM16-UCS b dimension. Like a* in L*a*b*, it is a Cartesian
     *     coordinate on the X axis.
     * @param viewingConditions Information about the environment where the color
     *     was observed.
     */
    static fromUcsInViewingConditions(jstar, astar, bstar, viewingConditions) {
      const a = astar;
      const b = bstar;
      const m = Math.sqrt(a * a + b * b);
      const M = (Math.exp(m * 0.0228) - 1) / 0.0228;
      const c = M / viewingConditions.fLRoot;
      let h = Math.atan2(b, a) * (180 / Math.PI);
      if (h < 0) {
        h += 360;
      }
      const j = jstar / (1 - (jstar - 100) * 7e-3);
      return _Cam16.fromJchInViewingConditions(j, c, h, viewingConditions);
    }
    /**
     *  @return ARGB representation of color, assuming the color was viewed in
     *     default viewing conditions, which are near-identical to the default
     *     viewing conditions for sRGB.
     */
    toInt() {
      return this.viewed(ViewingConditions.DEFAULT);
    }
    /**
     * @param viewingConditions Information about the environment where the color
     *     will be viewed.
     * @return ARGB representation of color
     */
    viewed(viewingConditions) {
      const alpha = this.chroma === 0 || this.j === 0 ? 0 : this.chroma / Math.sqrt(this.j / 100);
      const t = Math.pow(alpha / Math.pow(1.64 - Math.pow(0.29, viewingConditions.n), 0.73), 1 / 0.9);
      const hRad = this.hue * Math.PI / 180;
      const eHue = 0.25 * (Math.cos(hRad + 2) + 3.8);
      const ac = viewingConditions.aw * Math.pow(this.j / 100, 1 / viewingConditions.c / viewingConditions.z);
      const p1 = eHue * (5e4 / 13) * viewingConditions.nc * viewingConditions.ncb;
      const p2 = ac / viewingConditions.nbb;
      const hSin = Math.sin(hRad);
      const hCos = Math.cos(hRad);
      const gamma = 23 * (p2 + 0.305) * t / (23 * p1 + 11 * t * hCos + 108 * t * hSin);
      const a = gamma * hCos;
      const b = gamma * hSin;
      const rA = (460 * p2 + 451 * a + 288 * b) / 1403;
      const gA = (460 * p2 - 891 * a - 261 * b) / 1403;
      const bA = (460 * p2 - 220 * a - 6300 * b) / 1403;
      const rCBase = Math.max(0, 27.13 * Math.abs(rA) / (400 - Math.abs(rA)));
      const rC = signum(rA) * (100 / viewingConditions.fl) * Math.pow(rCBase, 1 / 0.42);
      const gCBase = Math.max(0, 27.13 * Math.abs(gA) / (400 - Math.abs(gA)));
      const gC = signum(gA) * (100 / viewingConditions.fl) * Math.pow(gCBase, 1 / 0.42);
      const bCBase = Math.max(0, 27.13 * Math.abs(bA) / (400 - Math.abs(bA)));
      const bC = signum(bA) * (100 / viewingConditions.fl) * Math.pow(bCBase, 1 / 0.42);
      const rF = rC / viewingConditions.rgbD[0];
      const gF = gC / viewingConditions.rgbD[1];
      const bF = bC / viewingConditions.rgbD[2];
      const x = 1.86206786 * rF - 1.01125463 * gF + 0.14918677 * bF;
      const y = 0.38752654 * rF + 0.62144744 * gF - 897398e-8 * bF;
      const z = -0.0158415 * rF - 0.03412294 * gF + 1.04996444 * bF;
      const argb = argbFromXyz(x, y, z);
      return argb;
    }
    /// Given color expressed in XYZ and viewed in [viewingConditions], convert to
    /// CAM16.
    static fromXyzInViewingConditions(x, y, z, viewingConditions) {
      const rC = 0.401288 * x + 0.650173 * y - 0.051461 * z;
      const gC = -0.250268 * x + 1.204414 * y + 0.045854 * z;
      const bC = -2079e-6 * x + 0.048952 * y + 0.953127 * z;
      const rD = viewingConditions.rgbD[0] * rC;
      const gD = viewingConditions.rgbD[1] * gC;
      const bD = viewingConditions.rgbD[2] * bC;
      const rAF = Math.pow(viewingConditions.fl * Math.abs(rD) / 100, 0.42);
      const gAF = Math.pow(viewingConditions.fl * Math.abs(gD) / 100, 0.42);
      const bAF = Math.pow(viewingConditions.fl * Math.abs(bD) / 100, 0.42);
      const rA = signum(rD) * 400 * rAF / (rAF + 27.13);
      const gA = signum(gD) * 400 * gAF / (gAF + 27.13);
      const bA = signum(bD) * 400 * bAF / (bAF + 27.13);
      const a = (11 * rA + -12 * gA + bA) / 11;
      const b = (rA + gA - 2 * bA) / 9;
      const u = (20 * rA + 20 * gA + 21 * bA) / 20;
      const p2 = (40 * rA + 20 * gA + bA) / 20;
      const atan2 = Math.atan2(b, a);
      const atanDegrees = atan2 * 180 / Math.PI;
      const hue = atanDegrees < 0 ? atanDegrees + 360 : atanDegrees >= 360 ? atanDegrees - 360 : atanDegrees;
      const hueRadians = hue * Math.PI / 180;
      const ac = p2 * viewingConditions.nbb;
      const J = 100 * Math.pow(ac / viewingConditions.aw, viewingConditions.c * viewingConditions.z);
      const Q = 4 / viewingConditions.c * Math.sqrt(J / 100) * (viewingConditions.aw + 4) * viewingConditions.fLRoot;
      const huePrime = hue < 20.14 ? hue + 360 : hue;
      const eHue = 1 / 4 * (Math.cos(huePrime * Math.PI / 180 + 2) + 3.8);
      const p1 = 5e4 / 13 * eHue * viewingConditions.nc * viewingConditions.ncb;
      const t = p1 * Math.sqrt(a * a + b * b) / (u + 0.305);
      const alpha = Math.pow(t, 0.9) * Math.pow(1.64 - Math.pow(0.29, viewingConditions.n), 0.73);
      const C = alpha * Math.sqrt(J / 100);
      const M = C * viewingConditions.fLRoot;
      const s = 50 * Math.sqrt(alpha * viewingConditions.c / (viewingConditions.aw + 4));
      const jstar = (1 + 100 * 7e-3) * J / (1 + 7e-3 * J);
      const mstar = Math.log(1 + 0.0228 * M) / 0.0228;
      const astar = mstar * Math.cos(hueRadians);
      const bstar = mstar * Math.sin(hueRadians);
      return new _Cam16(hue, C, J, Q, M, s, jstar, astar, bstar);
    }
    /// XYZ representation of CAM16 seen in [viewingConditions].
    xyzInViewingConditions(viewingConditions) {
      const alpha = this.chroma === 0 || this.j === 0 ? 0 : this.chroma / Math.sqrt(this.j / 100);
      const t = Math.pow(alpha / Math.pow(1.64 - Math.pow(0.29, viewingConditions.n), 0.73), 1 / 0.9);
      const hRad = this.hue * Math.PI / 180;
      const eHue = 0.25 * (Math.cos(hRad + 2) + 3.8);
      const ac = viewingConditions.aw * Math.pow(this.j / 100, 1 / viewingConditions.c / viewingConditions.z);
      const p1 = eHue * (5e4 / 13) * viewingConditions.nc * viewingConditions.ncb;
      const p2 = ac / viewingConditions.nbb;
      const hSin = Math.sin(hRad);
      const hCos = Math.cos(hRad);
      const gamma = 23 * (p2 + 0.305) * t / (23 * p1 + 11 * t * hCos + 108 * t * hSin);
      const a = gamma * hCos;
      const b = gamma * hSin;
      const rA = (460 * p2 + 451 * a + 288 * b) / 1403;
      const gA = (460 * p2 - 891 * a - 261 * b) / 1403;
      const bA = (460 * p2 - 220 * a - 6300 * b) / 1403;
      const rCBase = Math.max(0, 27.13 * Math.abs(rA) / (400 - Math.abs(rA)));
      const rC = signum(rA) * (100 / viewingConditions.fl) * Math.pow(rCBase, 1 / 0.42);
      const gCBase = Math.max(0, 27.13 * Math.abs(gA) / (400 - Math.abs(gA)));
      const gC = signum(gA) * (100 / viewingConditions.fl) * Math.pow(gCBase, 1 / 0.42);
      const bCBase = Math.max(0, 27.13 * Math.abs(bA) / (400 - Math.abs(bA)));
      const bC = signum(bA) * (100 / viewingConditions.fl) * Math.pow(bCBase, 1 / 0.42);
      const rF = rC / viewingConditions.rgbD[0];
      const gF = gC / viewingConditions.rgbD[1];
      const bF = bC / viewingConditions.rgbD[2];
      const x = 1.86206786 * rF - 1.01125463 * gF + 0.14918677 * bF;
      const y = 0.38752654 * rF + 0.62144744 * gF - 897398e-8 * bF;
      const z = -0.0158415 * rF - 0.03412294 * gF + 1.04996444 * bF;
      return [x, y, z];
    }
  };

  // node_modules/@material/material-color-utilities/hct/hct_solver.js
  var HctSolver = class _HctSolver {
    /**
     * Sanitizes a small enough angle in radians.
     *
     * @param angle An angle in radians; must not deviate too much
     * from 0.
     * @return A coterminal angle between 0 and 2pi.
     */
    static sanitizeRadians(angle) {
      return (angle + Math.PI * 8) % (Math.PI * 2);
    }
    /**
     * Delinearizes an RGB component, returning a floating-point
     * number.
     *
     * @param rgbComponent 0.0 <= rgb_component <= 100.0, represents
     * linear R/G/B channel
     * @return 0.0 <= output <= 255.0, color channel converted to
     * regular RGB space
     */
    static trueDelinearized(rgbComponent) {
      const normalized = rgbComponent / 100;
      let delinearized2 = 0;
      if (normalized <= 31308e-7) {
        delinearized2 = normalized * 12.92;
      } else {
        delinearized2 = 1.055 * Math.pow(normalized, 1 / 2.4) - 0.055;
      }
      return delinearized2 * 255;
    }
    static chromaticAdaptation(component) {
      const af = Math.pow(Math.abs(component), 0.42);
      return signum(component) * 400 * af / (af + 27.13);
    }
    /**
     * Returns the hue of a linear RGB color in CAM16.
     *
     * @param linrgb The linear RGB coordinates of a color.
     * @return The hue of the color in CAM16, in radians.
     */
    static hueOf(linrgb) {
      const scaledDiscount = matrixMultiply(linrgb, _HctSolver.SCALED_DISCOUNT_FROM_LINRGB);
      const rA = _HctSolver.chromaticAdaptation(scaledDiscount[0]);
      const gA = _HctSolver.chromaticAdaptation(scaledDiscount[1]);
      const bA = _HctSolver.chromaticAdaptation(scaledDiscount[2]);
      const a = (11 * rA + -12 * gA + bA) / 11;
      const b = (rA + gA - 2 * bA) / 9;
      return Math.atan2(b, a);
    }
    static areInCyclicOrder(a, b, c) {
      const deltaAB = _HctSolver.sanitizeRadians(b - a);
      const deltaAC = _HctSolver.sanitizeRadians(c - a);
      return deltaAB < deltaAC;
    }
    /**
     * Solves the lerp equation.
     *
     * @param source The starting number.
     * @param mid The number in the middle.
     * @param target The ending number.
     * @return A number t such that lerp(source, target, t) = mid.
     */
    static intercept(source, mid, target) {
      return (mid - source) / (target - source);
    }
    static lerpPoint(source, t, target) {
      return [
        source[0] + (target[0] - source[0]) * t,
        source[1] + (target[1] - source[1]) * t,
        source[2] + (target[2] - source[2]) * t
      ];
    }
    /**
     * Intersects a segment with a plane.
     *
     * @param source The coordinates of point A.
     * @param coordinate The R-, G-, or B-coordinate of the plane.
     * @param target The coordinates of point B.
     * @param axis The axis the plane is perpendicular with. (0: R, 1:
     * G, 2: B)
     * @return The intersection point of the segment AB with the plane
     * R=coordinate, G=coordinate, or B=coordinate
     */
    static setCoordinate(source, coordinate, target, axis) {
      const t = _HctSolver.intercept(source[axis], coordinate, target[axis]);
      return _HctSolver.lerpPoint(source, t, target);
    }
    static isBounded(x) {
      return 0 <= x && x <= 100;
    }
    /**
     * Returns the nth possible vertex of the polygonal intersection.
     *
     * @param y The Y value of the plane.
     * @param n The zero-based index of the point. 0 <= n <= 11.
     * @return The nth possible vertex of the polygonal intersection
     * of the y plane and the RGB cube, in linear RGB coordinates, if
     * it exists. If this possible vertex lies outside of the cube,
     * [-1.0, -1.0, -1.0] is returned.
     */
    static nthVertex(y, n) {
      const kR = _HctSolver.Y_FROM_LINRGB[0];
      const kG = _HctSolver.Y_FROM_LINRGB[1];
      const kB = _HctSolver.Y_FROM_LINRGB[2];
      const coordA = n % 4 <= 1 ? 0 : 100;
      const coordB = n % 2 === 0 ? 0 : 100;
      if (n < 4) {
        const g = coordA;
        const b = coordB;
        const r = (y - g * kG - b * kB) / kR;
        if (_HctSolver.isBounded(r)) {
          return [r, g, b];
        } else {
          return [-1, -1, -1];
        }
      } else if (n < 8) {
        const b = coordA;
        const r = coordB;
        const g = (y - r * kR - b * kB) / kG;
        if (_HctSolver.isBounded(g)) {
          return [r, g, b];
        } else {
          return [-1, -1, -1];
        }
      } else {
        const r = coordA;
        const g = coordB;
        const b = (y - r * kR - g * kG) / kB;
        if (_HctSolver.isBounded(b)) {
          return [r, g, b];
        } else {
          return [-1, -1, -1];
        }
      }
    }
    /**
     * Finds the segment containing the desired color.
     *
     * @param y The Y value of the color.
     * @param targetHue The hue of the color.
     * @return A list of two sets of linear RGB coordinates, each
     * corresponding to an endpoint of the segment containing the
     * desired color.
     */
    static bisectToSegment(y, targetHue) {
      let left = [-1, -1, -1];
      let right = left;
      let leftHue = 0;
      let rightHue = 0;
      let initialized = false;
      let uncut = true;
      for (let n = 0; n < 12; n++) {
        const mid = _HctSolver.nthVertex(y, n);
        if (mid[0] < 0) {
          continue;
        }
        const midHue = _HctSolver.hueOf(mid);
        if (!initialized) {
          left = mid;
          right = mid;
          leftHue = midHue;
          rightHue = midHue;
          initialized = true;
          continue;
        }
        if (uncut || _HctSolver.areInCyclicOrder(leftHue, midHue, rightHue)) {
          uncut = false;
          if (_HctSolver.areInCyclicOrder(leftHue, targetHue, midHue)) {
            right = mid;
            rightHue = midHue;
          } else {
            left = mid;
            leftHue = midHue;
          }
        }
      }
      return [left, right];
    }
    static midpoint(a, b) {
      return [
        (a[0] + b[0]) / 2,
        (a[1] + b[1]) / 2,
        (a[2] + b[2]) / 2
      ];
    }
    static criticalPlaneBelow(x) {
      return Math.floor(x - 0.5);
    }
    static criticalPlaneAbove(x) {
      return Math.ceil(x - 0.5);
    }
    /**
     * Finds a color with the given Y and hue on the boundary of the
     * cube.
     *
     * @param y The Y value of the color.
     * @param targetHue The hue of the color.
     * @return The desired color, in linear RGB coordinates.
     */
    static bisectToLimit(y, targetHue) {
      const segment = _HctSolver.bisectToSegment(y, targetHue);
      let left = segment[0];
      let leftHue = _HctSolver.hueOf(left);
      let right = segment[1];
      for (let axis = 0; axis < 3; axis++) {
        if (left[axis] !== right[axis]) {
          let lPlane = -1;
          let rPlane = 255;
          if (left[axis] < right[axis]) {
            lPlane = _HctSolver.criticalPlaneBelow(_HctSolver.trueDelinearized(left[axis]));
            rPlane = _HctSolver.criticalPlaneAbove(_HctSolver.trueDelinearized(right[axis]));
          } else {
            lPlane = _HctSolver.criticalPlaneAbove(_HctSolver.trueDelinearized(left[axis]));
            rPlane = _HctSolver.criticalPlaneBelow(_HctSolver.trueDelinearized(right[axis]));
          }
          for (let i = 0; i < 8; i++) {
            if (Math.abs(rPlane - lPlane) <= 1) {
              break;
            } else {
              const mPlane = Math.floor((lPlane + rPlane) / 2);
              const midPlaneCoordinate = _HctSolver.CRITICAL_PLANES[mPlane];
              const mid = _HctSolver.setCoordinate(left, midPlaneCoordinate, right, axis);
              const midHue = _HctSolver.hueOf(mid);
              if (_HctSolver.areInCyclicOrder(leftHue, targetHue, midHue)) {
                right = mid;
                rPlane = mPlane;
              } else {
                left = mid;
                leftHue = midHue;
                lPlane = mPlane;
              }
            }
          }
        }
      }
      return _HctSolver.midpoint(left, right);
    }
    static inverseChromaticAdaptation(adapted) {
      const adaptedAbs = Math.abs(adapted);
      const base = Math.max(0, 27.13 * adaptedAbs / (400 - adaptedAbs));
      return signum(adapted) * Math.pow(base, 1 / 0.42);
    }
    /**
     * Finds a color with the given hue, chroma, and Y.
     *
     * @param hueRadians The desired hue in radians.
     * @param chroma The desired chroma.
     * @param y The desired Y.
     * @return The desired color as a hexadecimal integer, if found; 0
     * otherwise.
     */
    static findResultByJ(hueRadians, chroma, y) {
      let j = Math.sqrt(y) * 11;
      const viewingConditions = ViewingConditions.DEFAULT;
      const tInnerCoeff = 1 / Math.pow(1.64 - Math.pow(0.29, viewingConditions.n), 0.73);
      const eHue = 0.25 * (Math.cos(hueRadians + 2) + 3.8);
      const p1 = eHue * (5e4 / 13) * viewingConditions.nc * viewingConditions.ncb;
      const hSin = Math.sin(hueRadians);
      const hCos = Math.cos(hueRadians);
      for (let iterationRound = 0; iterationRound < 5; iterationRound++) {
        const jNormalized = j / 100;
        const alpha = chroma === 0 || j === 0 ? 0 : chroma / Math.sqrt(jNormalized);
        const t = Math.pow(alpha * tInnerCoeff, 1 / 0.9);
        const ac = viewingConditions.aw * Math.pow(jNormalized, 1 / viewingConditions.c / viewingConditions.z);
        const p2 = ac / viewingConditions.nbb;
        const gamma = 23 * (p2 + 0.305) * t / (23 * p1 + 11 * t * hCos + 108 * t * hSin);
        const a = gamma * hCos;
        const b = gamma * hSin;
        const rA = (460 * p2 + 451 * a + 288 * b) / 1403;
        const gA = (460 * p2 - 891 * a - 261 * b) / 1403;
        const bA = (460 * p2 - 220 * a - 6300 * b) / 1403;
        const rCScaled = _HctSolver.inverseChromaticAdaptation(rA);
        const gCScaled = _HctSolver.inverseChromaticAdaptation(gA);
        const bCScaled = _HctSolver.inverseChromaticAdaptation(bA);
        const linrgb = matrixMultiply([rCScaled, gCScaled, bCScaled], _HctSolver.LINRGB_FROM_SCALED_DISCOUNT);
        if (linrgb[0] < 0 || linrgb[1] < 0 || linrgb[2] < 0) {
          return 0;
        }
        const kR = _HctSolver.Y_FROM_LINRGB[0];
        const kG = _HctSolver.Y_FROM_LINRGB[1];
        const kB = _HctSolver.Y_FROM_LINRGB[2];
        const fnj = kR * linrgb[0] + kG * linrgb[1] + kB * linrgb[2];
        if (fnj <= 0) {
          return 0;
        }
        if (iterationRound === 4 || Math.abs(fnj - y) < 2e-3) {
          if (linrgb[0] > 100.01 || linrgb[1] > 100.01 || linrgb[2] > 100.01) {
            return 0;
          }
          return argbFromLinrgb(linrgb);
        }
        j = j - (fnj - y) * j / (2 * fnj);
      }
      return 0;
    }
    /**
     * Finds an sRGB color with the given hue, chroma, and L*, if
     * possible.
     *
     * @param hueDegrees The desired hue, in degrees.
     * @param chroma The desired chroma.
     * @param lstar The desired L*.
     * @return A hexadecimal representing the sRGB color. The color
     * has sufficiently close hue, chroma, and L* to the desired
     * values, if possible; otherwise, the hue and L* will be
     * sufficiently close, and chroma will be maximized.
     */
    static solveToInt(hueDegrees, chroma, lstar) {
      if (chroma < 1e-4 || lstar < 1e-4 || lstar > 99.9999) {
        return argbFromLstar(lstar);
      }
      hueDegrees = sanitizeDegreesDouble(hueDegrees);
      const hueRadians = hueDegrees / 180 * Math.PI;
      const y = yFromLstar(lstar);
      const exactAnswer = _HctSolver.findResultByJ(hueRadians, chroma, y);
      if (exactAnswer !== 0) {
        return exactAnswer;
      }
      const linrgb = _HctSolver.bisectToLimit(y, hueRadians);
      return argbFromLinrgb(linrgb);
    }
    /**
     * Finds an sRGB color with the given hue, chroma, and L*, if
     * possible.
     *
     * @param hueDegrees The desired hue, in degrees.
     * @param chroma The desired chroma.
     * @param lstar The desired L*.
     * @return An CAM16 object representing the sRGB color. The color
     * has sufficiently close hue, chroma, and L* to the desired
     * values, if possible; otherwise, the hue and L* will be
     * sufficiently close, and chroma will be maximized.
     */
    static solveToCam(hueDegrees, chroma, lstar) {
      return Cam16.fromInt(_HctSolver.solveToInt(hueDegrees, chroma, lstar));
    }
  };
  HctSolver.SCALED_DISCOUNT_FROM_LINRGB = [
    [
      0.001200833568784504,
      0.002389694492170889,
      2795742885861124e-19
    ],
    [
      5891086651375999e-19,
      0.0029785502573438758,
      3270666104008398e-19
    ],
    [
      10146692491640572e-20,
      5364214359186694e-19,
      0.0032979401770712076
    ]
  ];
  HctSolver.LINRGB_FROM_SCALED_DISCOUNT = [
    [
      1373.2198709594231,
      -1100.4251190754821,
      -7.278681089101213
    ],
    [
      -271.815969077903,
      559.6580465940733,
      -32.46047482791194
    ],
    [
      1.9622899599665666,
      -57.173814538844006,
      308.7233197812385
    ]
  ];
  HctSolver.Y_FROM_LINRGB = [0.2126, 0.7152, 0.0722];
  HctSolver.CRITICAL_PLANES = [
    0.015176349177441876,
    0.045529047532325624,
    0.07588174588720938,
    0.10623444424209313,
    0.13658714259697685,
    0.16693984095186062,
    0.19729253930674434,
    0.2276452376616281,
    0.2579979360165119,
    0.28835063437139563,
    0.3188300904430532,
    0.350925934958123,
    0.3848314933096426,
    0.42057480301049466,
    0.458183274052838,
    0.4976837250274023,
    0.5391024159806381,
    0.5824650784040898,
    0.6277969426914107,
    0.6751227633498623,
    0.7244668422128921,
    0.775853049866786,
    0.829304845476233,
    0.8848452951698498,
    0.942497089126609,
    1.0022825574869039,
    1.0642236851973577,
    1.1283421258858297,
    1.1946592148522128,
    1.2631959812511864,
    1.3339731595349034,
    1.407011200216447,
    1.4823302800086415,
    1.5599503113873272,
    1.6398909516233677,
    1.7221716113234105,
    1.8068114625156377,
    1.8938294463134073,
    1.9832442801866852,
    2.075074464868551,
    2.1693382909216234,
    2.2660538449872063,
    2.36523901573795,
    2.4669114995532007,
    2.5710888059345764,
    2.6777882626779785,
    2.7870270208169257,
    2.898822059350997,
    3.0131901897720907,
    3.1301480604002863,
    3.2497121605402226,
    3.3718988244681087,
    3.4967242352587946,
    3.624204428461639,
    3.754355295633311,
    3.887192587735158,
    4.022731918402185,
    4.160988767090289,
    4.301978482107941,
    4.445716283538092,
    4.592217266055746,
    4.741496401646282,
    4.893568542229298,
    5.048448422192488,
    5.20615066083972,
    5.3666897647573375,
    5.5300801301023865,
    5.696336044816294,
    5.865471690767354,
    6.037501145825082,
    6.212438385869475,
    6.390297286737924,
    6.571091626112461,
    6.7548350853498045,
    6.941541251256611,
    7.131223617812143,
    7.323895587840543,
    7.5195704746346665,
    7.7182615035334345,
    7.919981813454504,
    8.124744458384042,
    8.332562408825165,
    8.543448553206703,
    8.757415699253682,
    8.974476575321063,
    9.194643831691977,
    9.417930041841839,
    9.644347703669503,
    9.873909240696694,
    10.106627003236781,
    10.342513269534024,
    10.58158024687427,
    10.8238400726681,
    11.069304815507364,
    11.317986476196008,
    11.569896988756009,
    11.825048221409341,
    12.083451977536606,
    12.345119996613247,
    12.610063955123938,
    12.878295467455942,
    13.149826086772048,
    13.42466730586372,
    13.702830557985108,
    13.984327217668513,
    14.269168601521828,
    14.55736596900856,
    14.848930523210871,
    15.143873411576273,
    15.44220572664832,
    15.743938506781891,
    16.04908273684337,
    16.35764934889634,
    16.66964922287304,
    16.985093187232053,
    17.30399201960269,
    17.62635644741625,
    17.95219714852476,
    18.281524751807332,
    18.614349837764564,
    18.95068293910138,
    19.290534541298456,
    19.633915083172692,
    19.98083495742689,
    20.331304511189067,
    20.685334046541502,
    21.042933821039977,
    21.404114048223256,
    21.76888489811322,
    22.137256497705877,
    22.50923893145328,
    22.884842241736916,
    23.264076429332462,
    23.6469514538663,
    24.033477234264016,
    24.42366364919083,
    24.817520537484558,
    25.21505769858089,
    25.61628489293138,
    26.021211842414342,
    26.429848230738664,
    26.842203703840827,
    27.258287870275353,
    27.678110301598522,
    28.10168053274597,
    28.529008062403893,
    28.96010235337422,
    29.39497283293396,
    29.83362889318845,
    30.276079891419332,
    30.722335150426627,
    31.172403958865512,
    31.62629557157785,
    32.08401920991837,
    32.54558406207592,
    33.010999283389665,
    33.4802739966603,
    33.953417292456834,
    34.430438229418264,
    34.911345834551085,
    35.39614910352207,
    35.88485700094671,
    36.37747846067349,
    36.87402238606382,
    37.37449765026789,
    37.87891309649659,
    38.38727753828926,
    38.89959975977785,
    39.41588851594697,
    39.93615253289054,
    40.460400508064545,
    40.98864111053629,
    41.520882981230194,
    42.05713473317016,
    42.597404951718396,
    43.141702194811224,
    43.6900349931913,
    44.24241185063697,
    44.798841244188324,
    45.35933162437017,
    45.92389141541209,
    46.49252901546552,
    47.065252796817916,
    47.64207110610409,
    48.22299226451468,
    48.808024568002054,
    49.3971762874833,
    49.9904556690408,
    50.587870934119984,
    51.189430279724725,
    51.79514187861014,
    52.40501387947288,
    53.0190544071392,
    53.637271562750364,
    54.259673423945976,
    54.88626804504493,
    55.517063457223934,
    56.15206766869424,
    56.79128866487574,
    57.43473440856916,
    58.08241284012621,
    58.734331877617365,
    59.39049941699807,
    60.05092333227251,
    60.715611475655585,
    61.38457167773311,
    62.057811747619894,
    62.7353394731159,
    63.417162620860914,
    64.10328893648692,
    64.79372614476921,
    65.48848194977529,
    66.18756403501224,
    66.89098006357258,
    67.59873767827808,
    68.31084450182222,
    69.02730813691093,
    69.74813616640164,
    70.47333615344107,
    71.20291564160104,
    71.93688215501312,
    72.67524319850172,
    73.41800625771542,
    74.16517879925733,
    74.9167682708136,
    75.67278210128072,
    76.43322770089146,
    77.1981124613393,
    77.96744375590167,
    78.74122893956174,
    79.51947534912904,
    80.30219030335869,
    81.08938110306934,
    81.88105503125999,
    82.67721935322541,
    83.4778813166706,
    84.28304815182372,
    85.09272707154808,
    85.90692527145302,
    86.72564993000343,
    87.54890820862819,
    88.3767072518277,
    89.2090541872801,
    90.04595612594655,
    90.88742016217518,
    91.73345337380438,
    92.58406282226491,
    93.43925555268066,
    94.29903859396902,
    95.16341895893969,
    96.03240364439274,
    96.9059996312159,
    97.78421388448044,
    98.6670533535366,
    99.55452497210776
  ];

  // node_modules/@material/material-color-utilities/hct/hct.js
  var Hct = class _Hct {
    static from(hue, chroma, tone) {
      return new _Hct(HctSolver.solveToInt(hue, chroma, tone));
    }
    /**
     * @param argb ARGB representation of a color.
     * @return HCT representation of a color in default viewing conditions
     */
    static fromInt(argb) {
      return new _Hct(argb);
    }
    toInt() {
      return this.argb;
    }
    /**
     * A number, in degrees, representing ex. red, orange, yellow, etc.
     * Ranges from 0 <= hue < 360.
     */
    get hue() {
      return this.internalHue;
    }
    /**
     * @param newHue 0 <= newHue < 360; invalid values are corrected.
     * Chroma may decrease because chroma has a different maximum for any given
     * hue and tone.
     */
    set hue(newHue) {
      this.setInternalState(HctSolver.solveToInt(newHue, this.internalChroma, this.internalTone));
    }
    get chroma() {
      return this.internalChroma;
    }
    /**
     * @param newChroma 0 <= newChroma < ?
     * Chroma may decrease because chroma has a different maximum for any given
     * hue and tone.
     */
    set chroma(newChroma) {
      this.setInternalState(HctSolver.solveToInt(this.internalHue, newChroma, this.internalTone));
    }
    /** Lightness. Ranges from 0 to 100. */
    get tone() {
      return this.internalTone;
    }
    /**
     * @param newTone 0 <= newTone <= 100; invalid valids are corrected.
     * Chroma may decrease because chroma has a different maximum for any given
     * hue and tone.
     */
    set tone(newTone) {
      this.setInternalState(HctSolver.solveToInt(this.internalHue, this.internalChroma, newTone));
    }
    /** Sets a property of the Hct object. */
    setValue(propertyName, value) {
      this[propertyName] = value;
    }
    toString() {
      return `HCT(${this.hue.toFixed(0)}, ${this.chroma.toFixed(0)}, ${this.tone.toFixed(0)})`;
    }
    static isBlue(hue) {
      return hue >= 250 && hue < 270;
    }
    static isYellow(hue) {
      return hue >= 105 && hue < 125;
    }
    static isCyan(hue) {
      return hue >= 170 && hue < 207;
    }
    constructor(argb) {
      this.argb = argb;
      const cam = Cam16.fromInt(argb);
      this.internalHue = cam.hue;
      this.internalChroma = cam.chroma;
      this.internalTone = lstarFromArgb(argb);
      this.argb = argb;
    }
    setInternalState(argb) {
      const cam = Cam16.fromInt(argb);
      this.internalHue = cam.hue;
      this.internalChroma = cam.chroma;
      this.internalTone = lstarFromArgb(argb);
      this.argb = argb;
    }
    /**
     * Translates a color into different [ViewingConditions].
     *
     * Colors change appearance. They look different with lights on versus off,
     * the same color, as in hex code, on white looks different when on black.
     * This is called color relativity, most famously explicated by Josef Albers
     * in Interaction of Color.
     *
     * In color science, color appearance models can account for this and
     * calculate the appearance of a color in different settings. HCT is based on
     * CAM16, a color appearance model, and uses it to make these calculations.
     *
     * See [ViewingConditions.make] for parameters affecting color appearance.
     */
    inViewingConditions(vc) {
      const cam = Cam16.fromInt(this.toInt());
      const viewedInVc = cam.xyzInViewingConditions(vc);
      const recastInVc = Cam16.fromXyzInViewingConditions(viewedInVc[0], viewedInVc[1], viewedInVc[2], ViewingConditions.make());
      const recastHct = _Hct.from(recastInVc.hue, recastInVc.chroma, lstarFromY(viewedInVc[1]));
      return recastHct;
    }
  };

  // node_modules/@material/material-color-utilities/blend/blend.js
  var Blend = class _Blend {
    /**
     * Blend the design color's HCT hue towards the key color's HCT
     * hue, in a way that leaves the original color recognizable and
     * recognizably shifted towards the key color.
     *
     * @param designColor ARGB representation of an arbitrary color.
     * @param sourceColor ARGB representation of the main theme color.
     * @return The design color with a hue shifted towards the
     * system's color, a slightly warmer/cooler variant of the design
     * color's hue.
     */
    static harmonize(designColor, sourceColor) {
      const fromHct = Hct.fromInt(designColor);
      const toHct = Hct.fromInt(sourceColor);
      const differenceDegrees2 = differenceDegrees(fromHct.hue, toHct.hue);
      const rotationDegrees = Math.min(differenceDegrees2 * 0.5, 15);
      const outputHue = sanitizeDegreesDouble(fromHct.hue + rotationDegrees * rotationDirection(fromHct.hue, toHct.hue));
      return Hct.from(outputHue, fromHct.chroma, fromHct.tone).toInt();
    }
    /**
     * Blends hue from one color into another. The chroma and tone of
     * the original color are maintained.
     *
     * @param from ARGB representation of color
     * @param to ARGB representation of color
     * @param amount how much blending to perform; 0.0 >= and <= 1.0
     * @return from, with a hue blended towards to. Chroma and tone
     * are constant.
     */
    static hctHue(from, to, amount) {
      const ucs = _Blend.cam16Ucs(from, to, amount);
      const ucsCam = Cam16.fromInt(ucs);
      const fromCam = Cam16.fromInt(from);
      const blended = Hct.from(ucsCam.hue, fromCam.chroma, lstarFromArgb(from));
      return blended.toInt();
    }
    /**
     * Blend in CAM16-UCS space.
     *
     * @param from ARGB representation of color
     * @param to ARGB representation of color
     * @param amount how much blending to perform; 0.0 >= and <= 1.0
     * @return from, blended towards to. Hue, chroma, and tone will
     * change.
     */
    static cam16Ucs(from, to, amount) {
      const fromCam = Cam16.fromInt(from);
      const toCam = Cam16.fromInt(to);
      const fromJ = fromCam.jstar;
      const fromA = fromCam.astar;
      const fromB = fromCam.bstar;
      const toJ = toCam.jstar;
      const toA = toCam.astar;
      const toB = toCam.bstar;
      const jstar = fromJ + (toJ - fromJ) * amount;
      const astar = fromA + (toA - fromA) * amount;
      const bstar = fromB + (toB - fromB) * amount;
      return Cam16.fromUcs(jstar, astar, bstar).toInt();
    }
  };

  // node_modules/@material/material-color-utilities/contrast/contrast.js
  var Contrast = class _Contrast {
    /**
     * Returns a contrast ratio, which ranges from 1 to 21.
     *
     * @param toneA Tone between 0 and 100. Values outside will be clamped.
     * @param toneB Tone between 0 and 100. Values outside will be clamped.
     */
    static ratioOfTones(toneA, toneB) {
      toneA = clampDouble(0, 100, toneA);
      toneB = clampDouble(0, 100, toneB);
      return _Contrast.ratioOfYs(yFromLstar(toneA), yFromLstar(toneB));
    }
    static ratioOfYs(y1, y2) {
      const lighter = y1 > y2 ? y1 : y2;
      const darker = lighter === y2 ? y1 : y2;
      return (lighter + 5) / (darker + 5);
    }
    /**
     * Returns a tone >= tone parameter that ensures ratio parameter.
     * Return value is between 0 and 100.
     * Returns -1 if ratio cannot be achieved with tone parameter.
     *
     * @param tone Tone return value must contrast with.
     * Range is 0 to 100. Invalid values will result in -1 being returned.
     * @param ratio Contrast ratio of return value and tone.
     * Range is 1 to 21, invalid values have undefined behavior.
     */
    static lighter(tone, ratio) {
      if (tone < 0 || tone > 100) {
        return -1;
      }
      const darkY = yFromLstar(tone);
      const lightY = ratio * (darkY + 5) - 5;
      const realContrast = _Contrast.ratioOfYs(lightY, darkY);
      const delta = Math.abs(realContrast - ratio);
      if (realContrast < ratio && delta > 0.04) {
        return -1;
      }
      const returnValue = lstarFromY(lightY) + 0.4;
      if (returnValue < 0 || returnValue > 100) {
        return -1;
      }
      return returnValue;
    }
    /**
     * Returns a tone <= tone parameter that ensures ratio parameter.
     * Return value is between 0 and 100.
     * Returns -1 if ratio cannot be achieved with tone parameter.
     *
     * @param tone Tone return value must contrast with.
     * Range is 0 to 100. Invalid values will result in -1 being returned.
     * @param ratio Contrast ratio of return value and tone.
     * Range is 1 to 21, invalid values have undefined behavior.
     */
    static darker(tone, ratio) {
      if (tone < 0 || tone > 100) {
        return -1;
      }
      const lightY = yFromLstar(tone);
      const darkY = (lightY + 5) / ratio - 5;
      const realContrast = _Contrast.ratioOfYs(lightY, darkY);
      const delta = Math.abs(realContrast - ratio);
      if (realContrast < ratio && delta > 0.04) {
        return -1;
      }
      const returnValue = lstarFromY(darkY) - 0.4;
      if (returnValue < 0 || returnValue > 100) {
        return -1;
      }
      return returnValue;
    }
    /**
     * Returns a tone >= tone parameter that ensures ratio parameter.
     * Return value is between 0 and 100.
     * Returns 100 if ratio cannot be achieved with tone parameter.
     *
     * This method is unsafe because the returned value is guaranteed to be in
     * bounds for tone, i.e. between 0 and 100. However, that value may not reach
     * the ratio with tone. For example, there is no color lighter than T100.
     *
     * @param tone Tone return value must contrast with.
     * Range is 0 to 100. Invalid values will result in 100 being returned.
     * @param ratio Desired contrast ratio of return value and tone parameter.
     * Range is 1 to 21, invalid values have undefined behavior.
     */
    static lighterUnsafe(tone, ratio) {
      const lighterSafe = _Contrast.lighter(tone, ratio);
      return lighterSafe < 0 ? 100 : lighterSafe;
    }
    /**
     * Returns a tone >= tone parameter that ensures ratio parameter.
     * Return value is between 0 and 100.
     * Returns 100 if ratio cannot be achieved with tone parameter.
     *
     * This method is unsafe because the returned value is guaranteed to be in
     * bounds for tone, i.e. between 0 and 100. However, that value may not reach
     * the [ratio with [tone]. For example, there is no color darker than T0.
     *
     * @param tone Tone return value must contrast with.
     * Range is 0 to 100. Invalid values will result in 0 being returned.
     * @param ratio Desired contrast ratio of return value and tone parameter.
     * Range is 1 to 21, invalid values have undefined behavior.
     */
    static darkerUnsafe(tone, ratio) {
      const darkerSafe = _Contrast.darker(tone, ratio);
      return darkerSafe < 0 ? 0 : darkerSafe;
    }
  };

  // node_modules/@material/material-color-utilities/dislike/dislike_analyzer.js
  var DislikeAnalyzer = class _DislikeAnalyzer {
    /**
     * Returns true if a color is disliked.
     *
     * @param hct A color to be judged.
     * @return Whether the color is disliked.
     *
     * Disliked is defined as a dark yellow-green that is not neutral.
     */
    static isDisliked(hct) {
      const huePasses = Math.round(hct.hue) >= 90 && Math.round(hct.hue) <= 111;
      const chromaPasses = Math.round(hct.chroma) > 16;
      const tonePasses = Math.round(hct.tone) < 65;
      return huePasses && chromaPasses && tonePasses;
    }
    /**
     * If a color is disliked, lighten it to make it likable.
     *
     * @param hct A color to be judged.
     * @return A new color if the original color is disliked, or the original
     *   color if it is acceptable.
     */
    static fixIfDisliked(hct) {
      if (_DislikeAnalyzer.isDisliked(hct)) {
        return Hct.from(hct.hue, hct.chroma, 70);
      }
      return hct;
    }
  };

  // node_modules/@material/material-color-utilities/dynamiccolor/dynamic_color.js
  function validateExtendedColor(originalColor, specVersion, extendedColor) {
    if (originalColor.name !== extendedColor.name) {
      throw new Error(`Attempting to extend color ${originalColor.name} with color ${extendedColor.name} of different name for spec version ${specVersion}.`);
    }
    if (originalColor.isBackground !== extendedColor.isBackground) {
      throw new Error(`Attempting to extend color ${originalColor.name} as a ${originalColor.isBackground ? "background" : "foreground"} with color ${extendedColor.name} as a ${extendedColor.isBackground ? "background" : "foreground"} for spec version ${specVersion}.`);
    }
  }
  function extendSpecVersion(originlColor, specVersion, extendedColor) {
    validateExtendedColor(originlColor, specVersion, extendedColor);
    return DynamicColor.fromPalette({
      name: originlColor.name,
      palette: (s) => s.specVersion === specVersion ? extendedColor.palette(s) : originlColor.palette(s),
      tone: (s) => s.specVersion === specVersion ? extendedColor.tone(s) : originlColor.tone(s),
      isBackground: originlColor.isBackground,
      chromaMultiplier: (s) => {
        const chromaMultiplier = s.specVersion === specVersion ? extendedColor.chromaMultiplier : originlColor.chromaMultiplier;
        return chromaMultiplier !== void 0 ? chromaMultiplier(s) : 1;
      },
      background: (s) => {
        const background = s.specVersion === specVersion ? extendedColor.background : originlColor.background;
        return background !== void 0 ? background(s) : void 0;
      },
      secondBackground: (s) => {
        const secondBackground = s.specVersion === specVersion ? extendedColor.secondBackground : originlColor.secondBackground;
        return secondBackground !== void 0 ? secondBackground(s) : void 0;
      },
      contrastCurve: (s) => {
        const contrastCurve = s.specVersion === specVersion ? extendedColor.contrastCurve : originlColor.contrastCurve;
        return contrastCurve !== void 0 ? contrastCurve(s) : void 0;
      },
      toneDeltaPair: (s) => {
        const toneDeltaPair = s.specVersion === specVersion ? extendedColor.toneDeltaPair : originlColor.toneDeltaPair;
        return toneDeltaPair !== void 0 ? toneDeltaPair(s) : void 0;
      }
    });
  }
  var DynamicColor = class _DynamicColor {
    /**
     * Create a DynamicColor defined by a TonalPalette and HCT tone.
     *
     * @param args Functions with DynamicScheme as input. Must provide a palette
     *     and tone. May provide a background DynamicColor and ToneDeltaPair.
     */
    static fromPalette(args) {
      return new _DynamicColor(args.name ?? "", args.palette, args.tone ?? _DynamicColor.getInitialToneFromBackground(args.background), args.isBackground ?? false, args.chromaMultiplier, args.background, args.secondBackground, args.contrastCurve, args.toneDeltaPair);
    }
    static getInitialToneFromBackground(background) {
      if (background === void 0) {
        return (s) => 50;
      }
      return (s) => background(s) ? background(s).getTone(s) : 50;
    }
    /**
     * The base constructor for DynamicColor.
     *
     * _Strongly_ prefer using one of the convenience constructors. This class is
     * arguably too flexible to ensure it can support any scenario. Functional
     * arguments allow  overriding without risks that come with subclasses.
     *
     * For example, the default behavior of adjust tone at max contrast
     * to be at a 7.0 ratio with its background is principled and
     * matches accessibility guidance. That does not mean it's the desired
     * approach for _every_ design system, and every color pairing,
     * always, in every case.
     *
     * @param name The name of the dynamic color. Defaults to empty.
     * @param palette Function that provides a TonalPalette given DynamicScheme. A
     *     TonalPalette is defined by a hue and chroma, so this replaces the need
     *     to specify hue/chroma. By providing a tonal palette, when contrast
     *     adjustments are made, intended chroma can be preserved.
     * @param tone Function that provides a tone, given a DynamicScheme.
     * @param isBackground Whether this dynamic color is a background, with some
     *     other color as the foreground. Defaults to false.
     * @param chromaMultiplier A factor that multiplies the chroma for this color.
     * @param background The background of the dynamic color (as a function of a
     *     `DynamicScheme`), if it exists.
     * @param secondBackground A second background of the dynamic color (as a
     *     function of a `DynamicScheme`), if it exists.
     * @param contrastCurve A `ContrastCurve` object specifying how its contrast
     *     against its background should behave in various contrast levels
     *     options.
     * @param toneDeltaPair A `ToneDeltaPair` object specifying a tone delta
     *     constraint between two colors. One of them must be the color being
     *     constructed.
     */
    constructor(name, palette, tone, isBackground, chromaMultiplier, background, secondBackground, contrastCurve, toneDeltaPair) {
      this.name = name;
      this.palette = palette;
      this.tone = tone;
      this.isBackground = isBackground;
      this.chromaMultiplier = chromaMultiplier;
      this.background = background;
      this.secondBackground = secondBackground;
      this.contrastCurve = contrastCurve;
      this.toneDeltaPair = toneDeltaPair;
      this.hctCache = /* @__PURE__ */ new Map();
      if (!background && secondBackground) {
        throw new Error(`Color ${name} has secondBackgrounddefined, but background is not defined.`);
      }
      if (!background && contrastCurve) {
        throw new Error(`Color ${name} has contrastCurvedefined, but background is not defined.`);
      }
      if (background && !contrastCurve) {
        throw new Error(`Color ${name} has backgrounddefined, but contrastCurve is not defined.`);
      }
    }
    /**
     * Returns a deep copy of this DynamicColor.
     */
    clone() {
      return _DynamicColor.fromPalette({
        name: this.name,
        palette: this.palette,
        tone: this.tone,
        isBackground: this.isBackground,
        chromaMultiplier: this.chromaMultiplier,
        background: this.background,
        secondBackground: this.secondBackground,
        contrastCurve: this.contrastCurve,
        toneDeltaPair: this.toneDeltaPair
      });
    }
    /**
     * Clears the cache of HCT values for this color. For testing or debugging
     * purposes.
     */
    clearCache() {
      this.hctCache.clear();
    }
    /**
     * Returns a ARGB integer (i.e. a hex code).
     *
     * @param scheme Defines the conditions of the user interface, for example,
     *     whether or not it is dark mode or light mode, and what the desired
     *     contrast level is.
     */
    getArgb(scheme) {
      return this.getHct(scheme).toInt();
    }
    /**
     * Returns a color, expressed in the HCT color space, that this
     * DynamicColor is under the conditions in scheme.
     *
     * @param scheme Defines the conditions of the user interface, for example,
     *     whether or not it is dark mode or light mode, and what the desired
     *     contrast level is.
     */
    getHct(scheme) {
      const cachedAnswer = this.hctCache.get(scheme);
      if (cachedAnswer != null) {
        return cachedAnswer;
      }
      const answer = getSpec(scheme.specVersion).getHct(scheme, this);
      if (this.hctCache.size > 4) {
        this.hctCache.clear();
      }
      this.hctCache.set(scheme, answer);
      return answer;
    }
    /**
     * Returns a tone, T in the HCT color space, that this DynamicColor is under
     * the conditions in scheme.
     *
     * @param scheme Defines the conditions of the user interface, for example,
     *     whether or not it is dark mode or light mode, and what the desired
     *     contrast level is.
     */
    getTone(scheme) {
      return getSpec(scheme.specVersion).getTone(scheme, this);
    }
    /**
     * Given a background tone, finds a foreground tone, while ensuring they reach
     * a contrast ratio that is as close to [ratio] as possible.
     *
     * @param bgTone Tone in HCT. Range is 0 to 100, undefined behavior when it
     *     falls outside that range.
     * @param ratio The contrast ratio desired between bgTone and the return
     *     value.
     */
    static foregroundTone(bgTone, ratio) {
      const lighterTone = Contrast.lighterUnsafe(bgTone, ratio);
      const darkerTone = Contrast.darkerUnsafe(bgTone, ratio);
      const lighterRatio = Contrast.ratioOfTones(lighterTone, bgTone);
      const darkerRatio = Contrast.ratioOfTones(darkerTone, bgTone);
      const preferLighter = _DynamicColor.tonePrefersLightForeground(bgTone);
      if (preferLighter) {
        const negligibleDifference = Math.abs(lighterRatio - darkerRatio) < 0.1 && lighterRatio < ratio && darkerRatio < ratio;
        return lighterRatio >= ratio || lighterRatio >= darkerRatio || negligibleDifference ? lighterTone : darkerTone;
      } else {
        return darkerRatio >= ratio || darkerRatio >= lighterRatio ? darkerTone : lighterTone;
      }
    }
    /**
     * Returns whether [tone] prefers a light foreground.
     *
     * People prefer white foregrounds on ~T60-70. Observed over time, and also
     * by Andrew Somers during research for APCA.
     *
     * T60 used as to create the smallest discontinuity possible when skipping
     * down to T49 in order to ensure light foregrounds.
     * Since `tertiaryContainer` in dark monochrome scheme requires a tone of
     * 60, it should not be adjusted. Therefore, 60 is excluded here.
     */
    static tonePrefersLightForeground(tone) {
      return Math.round(tone) < 60;
    }
    /**
     * Returns whether [tone] can reach a contrast ratio of 4.5 with a lighter
     * color.
     */
    static toneAllowsLightForeground(tone) {
      return Math.round(tone) <= 49;
    }
    /**
     * Adjusts a tone such that white has 4.5 contrast, if the tone is
     * reasonably close to supporting it.
     */
    static enableLightForeground(tone) {
      if (_DynamicColor.tonePrefersLightForeground(tone) && !_DynamicColor.toneAllowsLightForeground(tone)) {
        return 49;
      }
      return tone;
    }
  };
  var ColorCalculationDelegateImpl2021 = class {
    getHct(scheme, color) {
      const tone = color.getTone(scheme);
      const palette = color.palette(scheme);
      return palette.getHct(tone);
    }
    getTone(scheme, color) {
      const decreasingContrast = scheme.contrastLevel < 0;
      const toneDeltaPair = color.toneDeltaPair ? color.toneDeltaPair(scheme) : void 0;
      if (toneDeltaPair) {
        const roleA = toneDeltaPair.roleA;
        const roleB = toneDeltaPair.roleB;
        const delta = toneDeltaPair.delta;
        const polarity = toneDeltaPair.polarity;
        const stayTogether = toneDeltaPair.stayTogether;
        const aIsNearer = polarity === "nearer" || polarity === "lighter" && !scheme.isDark || polarity === "darker" && scheme.isDark;
        const nearer = aIsNearer ? roleA : roleB;
        const farther = aIsNearer ? roleB : roleA;
        const amNearer = color.name === nearer.name;
        const expansionDir = scheme.isDark ? 1 : -1;
        let nTone = nearer.tone(scheme);
        let fTone = farther.tone(scheme);
        if (color.background && nearer.contrastCurve && farther.contrastCurve) {
          const bg = color.background(scheme);
          const nContrastCurve = nearer.contrastCurve(scheme);
          const fContrastCurve = farther.contrastCurve(scheme);
          if (bg && nContrastCurve && fContrastCurve) {
            const bgTone = bg.getTone(scheme);
            const nContrast = nContrastCurve.get(scheme.contrastLevel);
            const fContrast = fContrastCurve.get(scheme.contrastLevel);
            if (Contrast.ratioOfTones(bgTone, nTone) < nContrast) {
              nTone = DynamicColor.foregroundTone(bgTone, nContrast);
            }
            if (Contrast.ratioOfTones(bgTone, fTone) < fContrast) {
              fTone = DynamicColor.foregroundTone(bgTone, fContrast);
            }
            if (decreasingContrast) {
              nTone = DynamicColor.foregroundTone(bgTone, nContrast);
              fTone = DynamicColor.foregroundTone(bgTone, fContrast);
            }
          }
        }
        if ((fTone - nTone) * expansionDir < delta) {
          fTone = clampDouble(0, 100, nTone + delta * expansionDir);
          if ((fTone - nTone) * expansionDir >= delta) {
          } else {
            nTone = clampDouble(0, 100, fTone - delta * expansionDir);
          }
        }
        if (50 <= nTone && nTone < 60) {
          if (expansionDir > 0) {
            nTone = 60;
            fTone = Math.max(fTone, nTone + delta * expansionDir);
          } else {
            nTone = 49;
            fTone = Math.min(fTone, nTone + delta * expansionDir);
          }
        } else if (50 <= fTone && fTone < 60) {
          if (stayTogether) {
            if (expansionDir > 0) {
              nTone = 60;
              fTone = Math.max(fTone, nTone + delta * expansionDir);
            } else {
              nTone = 49;
              fTone = Math.min(fTone, nTone + delta * expansionDir);
            }
          } else {
            if (expansionDir > 0) {
              fTone = 60;
            } else {
              fTone = 49;
            }
          }
        }
        return amNearer ? nTone : fTone;
      } else {
        let answer = color.tone(scheme);
        if (color.background == void 0 || color.background(scheme) === void 0 || color.contrastCurve == void 0 || color.contrastCurve(scheme) === void 0) {
          return answer;
        }
        const bgTone = color.background(scheme).getTone(scheme);
        const desiredRatio = color.contrastCurve(scheme).get(scheme.contrastLevel);
        if (Contrast.ratioOfTones(bgTone, answer) >= desiredRatio) {
        } else {
          answer = DynamicColor.foregroundTone(bgTone, desiredRatio);
        }
        if (decreasingContrast) {
          answer = DynamicColor.foregroundTone(bgTone, desiredRatio);
        }
        if (color.isBackground && 50 <= answer && answer < 60) {
          if (Contrast.ratioOfTones(49, bgTone) >= desiredRatio) {
            answer = 49;
          } else {
            answer = 60;
          }
        }
        if (color.secondBackground == void 0 || color.secondBackground(scheme) === void 0) {
          return answer;
        }
        const [bg1, bg2] = [color.background, color.secondBackground];
        const [bgTone1, bgTone2] = [bg1(scheme).getTone(scheme), bg2(scheme).getTone(scheme)];
        const [upper, lower] = [Math.max(bgTone1, bgTone2), Math.min(bgTone1, bgTone2)];
        if (Contrast.ratioOfTones(upper, answer) >= desiredRatio && Contrast.ratioOfTones(lower, answer) >= desiredRatio) {
          return answer;
        }
        const lightOption = Contrast.lighter(upper, desiredRatio);
        const darkOption = Contrast.darker(lower, desiredRatio);
        const availables = [];
        if (lightOption !== -1)
          availables.push(lightOption);
        if (darkOption !== -1)
          availables.push(darkOption);
        const prefersLight = DynamicColor.tonePrefersLightForeground(bgTone1) || DynamicColor.tonePrefersLightForeground(bgTone2);
        if (prefersLight) {
          return lightOption < 0 ? 100 : lightOption;
        }
        if (availables.length === 1) {
          return availables[0];
        }
        return darkOption < 0 ? 0 : darkOption;
      }
    }
  };
  var ColorCalculationDelegateImpl2025 = class {
    getHct(scheme, color) {
      const palette = color.palette(scheme);
      const tone = color.getTone(scheme);
      const hue = palette.hue;
      const chroma = palette.chroma * (color.chromaMultiplier ? color.chromaMultiplier(scheme) : 1);
      return Hct.from(hue, chroma, tone);
    }
    getTone(scheme, color) {
      const toneDeltaPair = color.toneDeltaPair ? color.toneDeltaPair(scheme) : void 0;
      if (toneDeltaPair) {
        const roleA = toneDeltaPair.roleA;
        const roleB = toneDeltaPair.roleB;
        const polarity = toneDeltaPair.polarity;
        const constraint = toneDeltaPair.constraint;
        const absoluteDelta = polarity === "darker" || polarity === "relative_lighter" && scheme.isDark || polarity === "relative_darker" && !scheme.isDark ? -toneDeltaPair.delta : toneDeltaPair.delta;
        const amRoleA = color.name === roleA.name;
        const selfRole = amRoleA ? roleA : roleB;
        const refRole = amRoleA ? roleB : roleA;
        let selfTone = selfRole.tone(scheme);
        let refTone = refRole.getTone(scheme);
        const relativeDelta = absoluteDelta * (amRoleA ? 1 : -1);
        if (constraint === "exact") {
          selfTone = clampDouble(0, 100, refTone + relativeDelta);
        } else if (constraint === "nearer") {
          if (relativeDelta > 0) {
            selfTone = clampDouble(0, 100, clampDouble(refTone, refTone + relativeDelta, selfTone));
          } else {
            selfTone = clampDouble(0, 100, clampDouble(refTone + relativeDelta, refTone, selfTone));
          }
        } else if (constraint === "farther") {
          if (relativeDelta > 0) {
            selfTone = clampDouble(refTone + relativeDelta, 100, selfTone);
          } else {
            selfTone = clampDouble(0, refTone + relativeDelta, selfTone);
          }
        }
        if (color.background && color.contrastCurve) {
          const background = color.background(scheme);
          const contrastCurve = color.contrastCurve(scheme);
          if (background && contrastCurve) {
            const bgTone = background.getTone(scheme);
            const selfContrast = contrastCurve.get(scheme.contrastLevel);
            selfTone = Contrast.ratioOfTones(bgTone, selfTone) >= selfContrast && scheme.contrastLevel >= 0 ? selfTone : DynamicColor.foregroundTone(bgTone, selfContrast);
          }
        }
        if (color.isBackground && !color.name.endsWith("_fixed_dim")) {
          if (selfTone >= 57) {
            selfTone = clampDouble(65, 100, selfTone);
          } else {
            selfTone = clampDouble(0, 49, selfTone);
          }
        }
        return selfTone;
      } else {
        let answer = color.tone(scheme);
        if (color.background == void 0 || color.background(scheme) === void 0 || color.contrastCurve == void 0 || color.contrastCurve(scheme) === void 0) {
          return answer;
        }
        const bgTone = color.background(scheme).getTone(scheme);
        const desiredRatio = color.contrastCurve(scheme).get(scheme.contrastLevel);
        answer = Contrast.ratioOfTones(bgTone, answer) >= desiredRatio && scheme.contrastLevel >= 0 ? answer : DynamicColor.foregroundTone(bgTone, desiredRatio);
        if (color.isBackground && !color.name.endsWith("_fixed_dim")) {
          if (answer >= 57) {
            answer = clampDouble(65, 100, answer);
          } else {
            answer = clampDouble(0, 49, answer);
          }
        }
        if (color.secondBackground == void 0 || color.secondBackground(scheme) === void 0) {
          return answer;
        }
        const [bg1, bg2] = [color.background, color.secondBackground];
        const [bgTone1, bgTone2] = [bg1(scheme).getTone(scheme), bg2(scheme).getTone(scheme)];
        const [upper, lower] = [Math.max(bgTone1, bgTone2), Math.min(bgTone1, bgTone2)];
        if (Contrast.ratioOfTones(upper, answer) >= desiredRatio && Contrast.ratioOfTones(lower, answer) >= desiredRatio) {
          return answer;
        }
        const lightOption = Contrast.lighter(upper, desiredRatio);
        const darkOption = Contrast.darker(lower, desiredRatio);
        const availables = [];
        if (lightOption !== -1)
          availables.push(lightOption);
        if (darkOption !== -1)
          availables.push(darkOption);
        const prefersLight = DynamicColor.tonePrefersLightForeground(bgTone1) || DynamicColor.tonePrefersLightForeground(bgTone2);
        if (prefersLight) {
          return lightOption < 0 ? 100 : lightOption;
        }
        if (availables.length === 1) {
          return availables[0];
        }
        return darkOption < 0 ? 0 : darkOption;
      }
    }
  };
  var spec2021 = new ColorCalculationDelegateImpl2021();
  var spec2025 = new ColorCalculationDelegateImpl2025();
  function getSpec(specVersion) {
    return specVersion === "2025" ? spec2025 : spec2021;
  }

  // node_modules/@material/material-color-utilities/palettes/tonal_palette.js
  var TonalPalette = class _TonalPalette {
    /**
     * @param argb ARGB representation of a color
     * @return Tones matching that color's hue and chroma.
     */
    static fromInt(argb) {
      const hct = Hct.fromInt(argb);
      return _TonalPalette.fromHct(hct);
    }
    /**
     * @param hct Hct
     * @return Tones matching that color's hue and chroma.
     */
    static fromHct(hct) {
      return new _TonalPalette(hct.hue, hct.chroma, hct);
    }
    /**
     * @param hue HCT hue
     * @param chroma HCT chroma
     * @return Tones matching hue and chroma.
     */
    static fromHueAndChroma(hue, chroma) {
      const keyColor = new KeyColor(hue, chroma).create();
      return new _TonalPalette(hue, chroma, keyColor);
    }
    constructor(hue, chroma, keyColor) {
      this.hue = hue;
      this.chroma = chroma;
      this.keyColor = keyColor;
      this.cache = /* @__PURE__ */ new Map();
    }
    /**
     * @param tone HCT tone, measured from 0 to 100.
     * @return ARGB representation of a color with that tone.
     */
    tone(tone) {
      let argb = this.cache.get(tone);
      if (argb === void 0) {
        if (tone == 99 && Hct.isYellow(this.hue)) {
          argb = this.averageArgb(this.tone(98), this.tone(100));
        } else {
          argb = Hct.from(this.hue, this.chroma, tone).toInt();
        }
        this.cache.set(tone, argb);
      }
      return argb;
    }
    /**
     * @param tone HCT tone.
     * @return HCT representation of a color with that tone.
     */
    getHct(tone) {
      return Hct.fromInt(this.tone(tone));
    }
    averageArgb(argb1, argb2) {
      const red1 = argb1 >>> 16 & 255;
      const green1 = argb1 >>> 8 & 255;
      const blue1 = argb1 & 255;
      const red2 = argb2 >>> 16 & 255;
      const green2 = argb2 >>> 8 & 255;
      const blue2 = argb2 & 255;
      const red = Math.round((red1 + red2) / 2);
      const green = Math.round((green1 + green2) / 2);
      const blue = Math.round((blue1 + blue2) / 2);
      return (255 << 24 | (red & 255) << 16 | (green & 255) << 8 | blue & 255) >>> 0;
    }
  };
  var KeyColor = class {
    constructor(hue, requestedChroma) {
      this.hue = hue;
      this.requestedChroma = requestedChroma;
      this.chromaCache = /* @__PURE__ */ new Map();
      this.maxChromaValue = 200;
    }
    /**
     * Creates a key color from a [hue] and a [chroma].
     * The key color is the first tone, starting from T50, matching the given hue
     * and chroma.
     *
     * @return Key color [Hct]
     */
    create() {
      const pivotTone = 50;
      const toneStepSize = 1;
      const epsilon = 0.01;
      let lowerTone = 0;
      let upperTone = 100;
      while (lowerTone < upperTone) {
        const midTone = Math.floor((lowerTone + upperTone) / 2);
        const isAscending = this.maxChroma(midTone) < this.maxChroma(midTone + toneStepSize);
        const sufficientChroma = this.maxChroma(midTone) >= this.requestedChroma - epsilon;
        if (sufficientChroma) {
          if (Math.abs(lowerTone - pivotTone) < Math.abs(upperTone - pivotTone)) {
            upperTone = midTone;
          } else {
            if (lowerTone === midTone) {
              return Hct.from(this.hue, this.requestedChroma, lowerTone);
            }
            lowerTone = midTone;
          }
        } else {
          if (isAscending) {
            lowerTone = midTone + toneStepSize;
          } else {
            upperTone = midTone;
          }
        }
      }
      return Hct.from(this.hue, this.requestedChroma, lowerTone);
    }
    // Find the maximum chroma for a given tone
    maxChroma(tone) {
      if (this.chromaCache.has(tone)) {
        return this.chromaCache.get(tone);
      }
      const chroma = Hct.from(this.hue, this.maxChromaValue, tone).chroma;
      this.chromaCache.set(tone, chroma);
      return chroma;
    }
  };

  // node_modules/@material/material-color-utilities/temperature/temperature_cache.js
  var TemperatureCache = class _TemperatureCache {
    constructor(input) {
      this.input = input;
      this.hctsByTempCache = [];
      this.hctsByHueCache = [];
      this.tempsByHctCache = /* @__PURE__ */ new Map();
      this.inputRelativeTemperatureCache = -1;
      this.complementCache = null;
    }
    get hctsByTemp() {
      if (this.hctsByTempCache.length > 0) {
        return this.hctsByTempCache;
      }
      const hcts = this.hctsByHue.concat([this.input]);
      const temperaturesByHct = this.tempsByHct;
      hcts.sort((a, b) => temperaturesByHct.get(a) - temperaturesByHct.get(b));
      this.hctsByTempCache = hcts;
      return hcts;
    }
    get warmest() {
      return this.hctsByTemp[this.hctsByTemp.length - 1];
    }
    get coldest() {
      return this.hctsByTemp[0];
    }
    /**
     * A set of colors with differing hues, equidistant in temperature.
     *
     * In art, this is usually described as a set of 5 colors on a color wheel
     * divided into 12 sections. This method allows provision of either of those
     * values.
     *
     * Behavior is undefined when [count] or [divisions] is 0.
     * When divisions < count, colors repeat.
     *
     * [count] The number of colors to return, includes the input color.
     * [divisions] The number of divisions on the color wheel.
     */
    analogous(count = 5, divisions = 12) {
      const startHue = Math.round(this.input.hue);
      const startHct = this.hctsByHue[startHue];
      let lastTemp = this.relativeTemperature(startHct);
      const allColors = [startHct];
      let absoluteTotalTempDelta = 0;
      for (let i = 0; i < 360; i++) {
        const hue = sanitizeDegreesInt(startHue + i);
        const hct = this.hctsByHue[hue];
        const temp = this.relativeTemperature(hct);
        const tempDelta = Math.abs(temp - lastTemp);
        lastTemp = temp;
        absoluteTotalTempDelta += tempDelta;
      }
      let hueAddend = 1;
      const tempStep = absoluteTotalTempDelta / divisions;
      let totalTempDelta = 0;
      lastTemp = this.relativeTemperature(startHct);
      while (allColors.length < divisions) {
        const hue = sanitizeDegreesInt(startHue + hueAddend);
        const hct = this.hctsByHue[hue];
        const temp = this.relativeTemperature(hct);
        const tempDelta = Math.abs(temp - lastTemp);
        totalTempDelta += tempDelta;
        const desiredTotalTempDeltaForIndex = allColors.length * tempStep;
        let indexSatisfied = totalTempDelta >= desiredTotalTempDeltaForIndex;
        let indexAddend = 1;
        while (indexSatisfied && allColors.length < divisions) {
          allColors.push(hct);
          const desiredTotalTempDeltaForIndex2 = (allColors.length + indexAddend) * tempStep;
          indexSatisfied = totalTempDelta >= desiredTotalTempDeltaForIndex2;
          indexAddend++;
        }
        lastTemp = temp;
        hueAddend++;
        if (hueAddend > 360) {
          while (allColors.length < divisions) {
            allColors.push(hct);
          }
          break;
        }
      }
      const answers = [this.input];
      const increaseHueCount = Math.floor((count - 1) / 2);
      for (let i = 1; i < increaseHueCount + 1; i++) {
        let index = 0 - i;
        while (index < 0) {
          index = allColors.length + index;
        }
        if (index >= allColors.length) {
          index = index % allColors.length;
        }
        answers.splice(0, 0, allColors[index]);
      }
      const decreaseHueCount = count - increaseHueCount - 1;
      for (let i = 1; i < decreaseHueCount + 1; i++) {
        let index = i;
        while (index < 0) {
          index = allColors.length + index;
        }
        if (index >= allColors.length) {
          index = index % allColors.length;
        }
        answers.push(allColors[index]);
      }
      return answers;
    }
    /**
     * A color that complements the input color aesthetically.
     *
     * In art, this is usually described as being across the color wheel.
     * History of this shows intent as a color that is just as cool-warm as the
     * input color is warm-cool.
     */
    get complement() {
      if (this.complementCache != null) {
        return this.complementCache;
      }
      const coldestHue = this.coldest.hue;
      const coldestTemp = this.tempsByHct.get(this.coldest);
      const warmestHue = this.warmest.hue;
      const warmestTemp = this.tempsByHct.get(this.warmest);
      const range = warmestTemp - coldestTemp;
      const startHueIsColdestToWarmest = _TemperatureCache.isBetween(this.input.hue, coldestHue, warmestHue);
      const startHue = startHueIsColdestToWarmest ? warmestHue : coldestHue;
      const endHue = startHueIsColdestToWarmest ? coldestHue : warmestHue;
      const directionOfRotation = 1;
      let smallestError = 1e3;
      let answer = this.hctsByHue[Math.round(this.input.hue)];
      const complementRelativeTemp = 1 - this.inputRelativeTemperature;
      for (let hueAddend = 0; hueAddend <= 360; hueAddend += 1) {
        const hue = sanitizeDegreesDouble(startHue + directionOfRotation * hueAddend);
        if (!_TemperatureCache.isBetween(hue, startHue, endHue)) {
          continue;
        }
        const possibleAnswer = this.hctsByHue[Math.round(hue)];
        const relativeTemp = (this.tempsByHct.get(possibleAnswer) - coldestTemp) / range;
        const error = Math.abs(complementRelativeTemp - relativeTemp);
        if (error < smallestError) {
          smallestError = error;
          answer = possibleAnswer;
        }
      }
      this.complementCache = answer;
      return this.complementCache;
    }
    /**
     * Temperature relative to all colors with the same chroma and tone.
     * Value on a scale from 0 to 1.
     */
    relativeTemperature(hct) {
      const range = this.tempsByHct.get(this.warmest) - this.tempsByHct.get(this.coldest);
      const differenceFromColdest = this.tempsByHct.get(hct) - this.tempsByHct.get(this.coldest);
      if (range === 0) {
        return 0.5;
      }
      return differenceFromColdest / range;
    }
    /** Relative temperature of the input color. See [relativeTemperature]. */
    get inputRelativeTemperature() {
      if (this.inputRelativeTemperatureCache >= 0) {
        return this.inputRelativeTemperatureCache;
      }
      this.inputRelativeTemperatureCache = this.relativeTemperature(this.input);
      return this.inputRelativeTemperatureCache;
    }
    /** A Map with keys of HCTs in [hctsByTemp], values of raw temperature. */
    get tempsByHct() {
      if (this.tempsByHctCache.size > 0) {
        return this.tempsByHctCache;
      }
      const allHcts = this.hctsByHue.concat([this.input]);
      const temperaturesByHct = /* @__PURE__ */ new Map();
      for (const e of allHcts) {
        temperaturesByHct.set(e, _TemperatureCache.rawTemperature(e));
      }
      this.tempsByHctCache = temperaturesByHct;
      return temperaturesByHct;
    }
    /**
     * HCTs for all hues, with the same chroma/tone as the input.
     * Sorted ascending, hue 0 to 360.
     */
    get hctsByHue() {
      if (this.hctsByHueCache.length > 0) {
        return this.hctsByHueCache;
      }
      const hcts = [];
      for (let hue = 0; hue <= 360; hue += 1) {
        const colorAtHue = Hct.from(hue, this.input.chroma, this.input.tone);
        hcts.push(colorAtHue);
      }
      this.hctsByHueCache = hcts;
      return this.hctsByHueCache;
    }
    /** Determines if an angle is between two other angles, rotating clockwise. */
    static isBetween(angle, a, b) {
      if (a < b) {
        return a <= angle && angle <= b;
      }
      return a <= angle || angle <= b;
    }
    /**
     * Value representing cool-warm factor of a color.
     * Values below 0 are considered cool, above, warm.
     *
     * Color science has researched emotion and harmony, which art uses to select
     * colors. Warm-cool is the foundation of analogous and complementary colors.
     * See:
     * - Li-Chen Ou's Chapter 19 in Handbook of Color Psychology (2015).
     * - Josef Albers' Interaction of Color chapters 19 and 21.
     *
     * Implementation of Ou, Woodcock and Wright's algorithm, which uses
     * L*a*b* / LCH color space.
     * Return value has these properties:
     * - Values below 0 are cool, above 0 are warm.
     * - Lower bound: -0.52 - (chroma ^ 1.07 / 20). L*a*b* chroma is infinite.
     *   Assuming max of 130 chroma, -9.66.
     * - Upper bound: -0.52 + (chroma ^ 1.07 / 20). L*a*b* chroma is infinite.
     *   Assuming max of 130 chroma, 8.61.
     */
    static rawTemperature(color) {
      const lab = labFromArgb(color.toInt());
      const hue = sanitizeDegreesDouble(Math.atan2(lab[2], lab[1]) * 180 / Math.PI);
      const chroma = Math.sqrt(lab[1] * lab[1] + lab[2] * lab[2]);
      const temperature = -0.5 + 0.02 * Math.pow(chroma, 1.07) * Math.cos(sanitizeDegreesDouble(hue - 50) * Math.PI / 180);
      return temperature;
    }
  };

  // node_modules/@material/material-color-utilities/dynamiccolor/contrast_curve.js
  var ContrastCurve = class {
    /**
     * Creates a `ContrastCurve` object.
     *
     * @param low Value for contrast level -1.0
     * @param normal Value for contrast level 0.0
     * @param medium Value for contrast level 0.5
     * @param high Value for contrast level 1.0
     */
    constructor(low, normal, medium, high) {
      this.low = low;
      this.normal = normal;
      this.medium = medium;
      this.high = high;
    }
    /**
     * Returns the value at a given contrast level.
     *
     * @param contrastLevel The contrast level. 0.0 is the default (normal); -1.0
     *     is the lowest; 1.0 is the highest.
     * @return The value. For contrast ratios, a number between 1.0 and 21.0.
     */
    get(contrastLevel) {
      if (contrastLevel <= -1) {
        return this.low;
      } else if (contrastLevel < 0) {
        return lerp(this.low, this.normal, (contrastLevel - -1) / 1);
      } else if (contrastLevel < 0.5) {
        return lerp(this.normal, this.medium, (contrastLevel - 0) / 0.5);
      } else if (contrastLevel < 1) {
        return lerp(this.medium, this.high, (contrastLevel - 0.5) / 0.5);
      } else {
        return this.high;
      }
    }
  };

  // node_modules/@material/material-color-utilities/dynamiccolor/tone_delta_pair.js
  var ToneDeltaPair = class {
    /**
     * Documents a constraint in tone distance between two DynamicColors.
     *
     * The polarity is an adjective that describes "A", compared to "B".
     *
     * For instance, ToneDeltaPair(A, B, 15, 'darker', 'exact') states that
     * A's tone should be exactly 15 darker than B's.
     *
     * 'relative_darker' and 'relative_lighter' describes the tone adjustment
     * relative to the surface color trend (white in light mode; black in dark
     * mode). For instance, ToneDeltaPair(A, B, 10, 'relative_lighter',
     * 'farther') states that A should be at least 10 lighter than B in light
     * mode, and at least 10 darker than B in dark mode.
     *
     * @param roleA The first role in a pair.
     * @param roleB The second role in a pair.
     * @param delta Required difference between tones. Absolute value, negative
     * values have undefined behavior.
     * @param polarity The relative relation between tones of roleA and roleB,
     * as described above.
     * @param constraint How to fulfill the tone delta pair constraint.
     * @param stayTogether Whether these two roles should stay on the same side
     * of the "awkward zone" (T50-59). This is necessary for certain cases where
     * one role has two backgrounds.
     */
    constructor(roleA, roleB, delta, polarity, stayTogether, constraint) {
      this.roleA = roleA;
      this.roleB = roleB;
      this.delta = delta;
      this.polarity = polarity;
      this.stayTogether = stayTogether;
      this.constraint = constraint;
      this.constraint = constraint ?? "exact";
    }
  };

  // node_modules/@material/material-color-utilities/dynamiccolor/variant.js
  var Variant;
  (function(Variant2) {
    Variant2[Variant2["MONOCHROME"] = 0] = "MONOCHROME";
    Variant2[Variant2["NEUTRAL"] = 1] = "NEUTRAL";
    Variant2[Variant2["TONAL_SPOT"] = 2] = "TONAL_SPOT";
    Variant2[Variant2["VIBRANT"] = 3] = "VIBRANT";
    Variant2[Variant2["EXPRESSIVE"] = 4] = "EXPRESSIVE";
    Variant2[Variant2["FIDELITY"] = 5] = "FIDELITY";
    Variant2[Variant2["CONTENT"] = 6] = "CONTENT";
    Variant2[Variant2["RAINBOW"] = 7] = "RAINBOW";
    Variant2[Variant2["FRUIT_SALAD"] = 8] = "FRUIT_SALAD";
  })(Variant || (Variant = {}));

  // node_modules/@material/material-color-utilities/dynamiccolor/color_spec_2021.js
  function isFidelity(scheme) {
    return scheme.variant === Variant.FIDELITY || scheme.variant === Variant.CONTENT;
  }
  function isMonochrome(scheme) {
    return scheme.variant === Variant.MONOCHROME;
  }
  function findDesiredChromaByTone(hue, chroma, tone, byDecreasingTone) {
    let answer = tone;
    let closestToChroma = Hct.from(hue, chroma, tone);
    if (closestToChroma.chroma < chroma) {
      let chromaPeak = closestToChroma.chroma;
      while (closestToChroma.chroma < chroma) {
        answer += byDecreasingTone ? -1 : 1;
        const potentialSolution = Hct.from(hue, chroma, answer);
        if (chromaPeak > potentialSolution.chroma) {
          break;
        }
        if (Math.abs(potentialSolution.chroma - chroma) < 0.4) {
          break;
        }
        const potentialDelta = Math.abs(potentialSolution.chroma - chroma);
        const currentDelta = Math.abs(closestToChroma.chroma - chroma);
        if (potentialDelta < currentDelta) {
          closestToChroma = potentialSolution;
        }
        chromaPeak = Math.max(chromaPeak, potentialSolution.chroma);
      }
    }
    return answer;
  }
  var ColorSpecDelegateImpl2021 = class {
    ////////////////////////////////////////////////////////////////
    // Main Palettes                                              //
    ////////////////////////////////////////////////////////////////
    primaryPaletteKeyColor() {
      return DynamicColor.fromPalette({
        name: "primary_palette_key_color",
        palette: (s) => s.primaryPalette,
        tone: (s) => s.primaryPalette.keyColor.tone
      });
    }
    secondaryPaletteKeyColor() {
      return DynamicColor.fromPalette({
        name: "secondary_palette_key_color",
        palette: (s) => s.secondaryPalette,
        tone: (s) => s.secondaryPalette.keyColor.tone
      });
    }
    tertiaryPaletteKeyColor() {
      return DynamicColor.fromPalette({
        name: "tertiary_palette_key_color",
        palette: (s) => s.tertiaryPalette,
        tone: (s) => s.tertiaryPalette.keyColor.tone
      });
    }
    neutralPaletteKeyColor() {
      return DynamicColor.fromPalette({
        name: "neutral_palette_key_color",
        palette: (s) => s.neutralPalette,
        tone: (s) => s.neutralPalette.keyColor.tone
      });
    }
    neutralVariantPaletteKeyColor() {
      return DynamicColor.fromPalette({
        name: "neutral_variant_palette_key_color",
        palette: (s) => s.neutralVariantPalette,
        tone: (s) => s.neutralVariantPalette.keyColor.tone
      });
    }
    errorPaletteKeyColor() {
      return DynamicColor.fromPalette({
        name: "error_palette_key_color",
        palette: (s) => s.errorPalette,
        tone: (s) => s.errorPalette.keyColor.tone
      });
    }
    ////////////////////////////////////////////////////////////////
    // Surfaces [S]                                               //
    ////////////////////////////////////////////////////////////////
    background() {
      return DynamicColor.fromPalette({
        name: "background",
        palette: (s) => s.neutralPalette,
        tone: (s) => s.isDark ? 6 : 98,
        isBackground: true
      });
    }
    onBackground() {
      return DynamicColor.fromPalette({
        name: "on_background",
        palette: (s) => s.neutralPalette,
        tone: (s) => s.isDark ? 90 : 10,
        background: (s) => this.background(),
        contrastCurve: (s) => new ContrastCurve(3, 3, 4.5, 7)
      });
    }
    surface() {
      return DynamicColor.fromPalette({
        name: "surface",
        palette: (s) => s.neutralPalette,
        tone: (s) => s.isDark ? 6 : 98,
        isBackground: true
      });
    }
    surfaceDim() {
      return DynamicColor.fromPalette({
        name: "surface_dim",
        palette: (s) => s.neutralPalette,
        tone: (s) => s.isDark ? 6 : new ContrastCurve(87, 87, 80, 75).get(s.contrastLevel),
        isBackground: true
      });
    }
    surfaceBright() {
      return DynamicColor.fromPalette({
        name: "surface_bright",
        palette: (s) => s.neutralPalette,
        tone: (s) => s.isDark ? new ContrastCurve(24, 24, 29, 34).get(s.contrastLevel) : 98,
        isBackground: true
      });
    }
    surfaceContainerLowest() {
      return DynamicColor.fromPalette({
        name: "surface_container_lowest",
        palette: (s) => s.neutralPalette,
        tone: (s) => s.isDark ? new ContrastCurve(4, 4, 2, 0).get(s.contrastLevel) : 100,
        isBackground: true
      });
    }
    surfaceContainerLow() {
      return DynamicColor.fromPalette({
        name: "surface_container_low",
        palette: (s) => s.neutralPalette,
        tone: (s) => s.isDark ? new ContrastCurve(10, 10, 11, 12).get(s.contrastLevel) : new ContrastCurve(96, 96, 96, 95).get(s.contrastLevel),
        isBackground: true
      });
    }
    surfaceContainer() {
      return DynamicColor.fromPalette({
        name: "surface_container",
        palette: (s) => s.neutralPalette,
        tone: (s) => s.isDark ? new ContrastCurve(12, 12, 16, 20).get(s.contrastLevel) : new ContrastCurve(94, 94, 92, 90).get(s.contrastLevel),
        isBackground: true
      });
    }
    surfaceContainerHigh() {
      return DynamicColor.fromPalette({
        name: "surface_container_high",
        palette: (s) => s.neutralPalette,
        tone: (s) => s.isDark ? new ContrastCurve(17, 17, 21, 25).get(s.contrastLevel) : new ContrastCurve(92, 92, 88, 85).get(s.contrastLevel),
        isBackground: true
      });
    }
    surfaceContainerHighest() {
      return DynamicColor.fromPalette({
        name: "surface_container_highest",
        palette: (s) => s.neutralPalette,
        tone: (s) => s.isDark ? new ContrastCurve(22, 22, 26, 30).get(s.contrastLevel) : new ContrastCurve(90, 90, 84, 80).get(s.contrastLevel),
        isBackground: true
      });
    }
    onSurface() {
      return DynamicColor.fromPalette({
        name: "on_surface",
        palette: (s) => s.neutralPalette,
        tone: (s) => s.isDark ? 90 : 10,
        background: (s) => this.highestSurface(s),
        contrastCurve: (s) => new ContrastCurve(4.5, 7, 11, 21)
      });
    }
    surfaceVariant() {
      return DynamicColor.fromPalette({
        name: "surface_variant",
        palette: (s) => s.neutralVariantPalette,
        tone: (s) => s.isDark ? 30 : 90,
        isBackground: true
      });
    }
    onSurfaceVariant() {
      return DynamicColor.fromPalette({
        name: "on_surface_variant",
        palette: (s) => s.neutralVariantPalette,
        tone: (s) => s.isDark ? 80 : 30,
        background: (s) => this.highestSurface(s),
        contrastCurve: (s) => new ContrastCurve(3, 4.5, 7, 11)
      });
    }
    inverseSurface() {
      return DynamicColor.fromPalette({
        name: "inverse_surface",
        palette: (s) => s.neutralPalette,
        tone: (s) => s.isDark ? 90 : 20,
        isBackground: true
      });
    }
    inverseOnSurface() {
      return DynamicColor.fromPalette({
        name: "inverse_on_surface",
        palette: (s) => s.neutralPalette,
        tone: (s) => s.isDark ? 20 : 95,
        background: (s) => this.inverseSurface(),
        contrastCurve: (s) => new ContrastCurve(4.5, 7, 11, 21)
      });
    }
    outline() {
      return DynamicColor.fromPalette({
        name: "outline",
        palette: (s) => s.neutralVariantPalette,
        tone: (s) => s.isDark ? 60 : 50,
        background: (s) => this.highestSurface(s),
        contrastCurve: (s) => new ContrastCurve(1.5, 3, 4.5, 7)
      });
    }
    outlineVariant() {
      return DynamicColor.fromPalette({
        name: "outline_variant",
        palette: (s) => s.neutralVariantPalette,
        tone: (s) => s.isDark ? 30 : 80,
        background: (s) => this.highestSurface(s),
        contrastCurve: (s) => new ContrastCurve(1, 1, 3, 4.5)
      });
    }
    shadow() {
      return DynamicColor.fromPalette({
        name: "shadow",
        palette: (s) => s.neutralPalette,
        tone: (s) => 0
      });
    }
    scrim() {
      return DynamicColor.fromPalette({
        name: "scrim",
        palette: (s) => s.neutralPalette,
        tone: (s) => 0
      });
    }
    surfaceTint() {
      return DynamicColor.fromPalette({
        name: "surface_tint",
        palette: (s) => s.primaryPalette,
        tone: (s) => s.isDark ? 80 : 40,
        isBackground: true
      });
    }
    ////////////////////////////////////////////////////////////////
    // Primary [P].                                               //
    ////////////////////////////////////////////////////////////////
    primary() {
      return DynamicColor.fromPalette({
        name: "primary",
        palette: (s) => s.primaryPalette,
        tone: (s) => {
          if (isMonochrome(s)) {
            return s.isDark ? 100 : 0;
          }
          return s.isDark ? 80 : 40;
        },
        isBackground: true,
        background: (s) => this.highestSurface(s),
        contrastCurve: (s) => new ContrastCurve(3, 4.5, 7, 7),
        toneDeltaPair: (s) => new ToneDeltaPair(this.primaryContainer(), this.primary(), 10, "nearer", false)
      });
    }
    primaryDim() {
      return void 0;
    }
    onPrimary() {
      return DynamicColor.fromPalette({
        name: "on_primary",
        palette: (s) => s.primaryPalette,
        tone: (s) => {
          if (isMonochrome(s)) {
            return s.isDark ? 10 : 90;
          }
          return s.isDark ? 20 : 100;
        },
        background: (s) => this.primary(),
        contrastCurve: (s) => new ContrastCurve(4.5, 7, 11, 21)
      });
    }
    primaryContainer() {
      return DynamicColor.fromPalette({
        name: "primary_container",
        palette: (s) => s.primaryPalette,
        tone: (s) => {
          if (isFidelity(s)) {
            return s.sourceColorHct.tone;
          }
          if (isMonochrome(s)) {
            return s.isDark ? 85 : 25;
          }
          return s.isDark ? 30 : 90;
        },
        isBackground: true,
        background: (s) => this.highestSurface(s),
        contrastCurve: (s) => new ContrastCurve(1, 1, 3, 4.5),
        toneDeltaPair: (s) => new ToneDeltaPair(this.primaryContainer(), this.primary(), 10, "nearer", false)
      });
    }
    onPrimaryContainer() {
      return DynamicColor.fromPalette({
        name: "on_primary_container",
        palette: (s) => s.primaryPalette,
        tone: (s) => {
          if (isFidelity(s)) {
            return DynamicColor.foregroundTone(this.primaryContainer().tone(s), 4.5);
          }
          if (isMonochrome(s)) {
            return s.isDark ? 0 : 100;
          }
          return s.isDark ? 90 : 30;
        },
        background: (s) => this.primaryContainer(),
        contrastCurve: (s) => new ContrastCurve(3, 4.5, 7, 11)
      });
    }
    inversePrimary() {
      return DynamicColor.fromPalette({
        name: "inverse_primary",
        palette: (s) => s.primaryPalette,
        tone: (s) => s.isDark ? 40 : 80,
        background: (s) => this.inverseSurface(),
        contrastCurve: (s) => new ContrastCurve(3, 4.5, 7, 7)
      });
    }
    /////////////////////////////////////////////////////////////////
    // Secondary [Q].                                              //
    /////////////////////////////////////////////////////////////////
    secondary() {
      return DynamicColor.fromPalette({
        name: "secondary",
        palette: (s) => s.secondaryPalette,
        tone: (s) => s.isDark ? 80 : 40,
        isBackground: true,
        background: (s) => this.highestSurface(s),
        contrastCurve: (s) => new ContrastCurve(3, 4.5, 7, 7),
        toneDeltaPair: (s) => new ToneDeltaPair(this.secondaryContainer(), this.secondary(), 10, "nearer", false)
      });
    }
    secondaryDim() {
      return void 0;
    }
    onSecondary() {
      return DynamicColor.fromPalette({
        name: "on_secondary",
        palette: (s) => s.secondaryPalette,
        tone: (s) => {
          if (isMonochrome(s)) {
            return s.isDark ? 10 : 100;
          } else {
            return s.isDark ? 20 : 100;
          }
        },
        background: (s) => this.secondary(),
        contrastCurve: (s) => new ContrastCurve(4.5, 7, 11, 21)
      });
    }
    secondaryContainer() {
      return DynamicColor.fromPalette({
        name: "secondary_container",
        palette: (s) => s.secondaryPalette,
        tone: (s) => {
          const initialTone = s.isDark ? 30 : 90;
          if (isMonochrome(s)) {
            return s.isDark ? 30 : 85;
          }
          if (!isFidelity(s)) {
            return initialTone;
          }
          return findDesiredChromaByTone(s.secondaryPalette.hue, s.secondaryPalette.chroma, initialTone, s.isDark ? false : true);
        },
        isBackground: true,
        background: (s) => this.highestSurface(s),
        contrastCurve: (s) => new ContrastCurve(1, 1, 3, 4.5),
        toneDeltaPair: (s) => new ToneDeltaPair(this.secondaryContainer(), this.secondary(), 10, "nearer", false)
      });
    }
    onSecondaryContainer() {
      return DynamicColor.fromPalette({
        name: "on_secondary_container",
        palette: (s) => s.secondaryPalette,
        tone: (s) => {
          if (isMonochrome(s)) {
            return s.isDark ? 90 : 10;
          }
          if (!isFidelity(s)) {
            return s.isDark ? 90 : 30;
          }
          return DynamicColor.foregroundTone(this.secondaryContainer().tone(s), 4.5);
        },
        background: (s) => this.secondaryContainer(),
        contrastCurve: (s) => new ContrastCurve(3, 4.5, 7, 11)
      });
    }
    /////////////////////////////////////////////////////////////////
    // Tertiary [T].                                               //
    /////////////////////////////////////////////////////////////////
    tertiary() {
      return DynamicColor.fromPalette({
        name: "tertiary",
        palette: (s) => s.tertiaryPalette,
        tone: (s) => {
          if (isMonochrome(s)) {
            return s.isDark ? 90 : 25;
          }
          return s.isDark ? 80 : 40;
        },
        isBackground: true,
        background: (s) => this.highestSurface(s),
        contrastCurve: (s) => new ContrastCurve(3, 4.5, 7, 7),
        toneDeltaPair: (s) => new ToneDeltaPair(this.tertiaryContainer(), this.tertiary(), 10, "nearer", false)
      });
    }
    tertiaryDim() {
      return void 0;
    }
    onTertiary() {
      return DynamicColor.fromPalette({
        name: "on_tertiary",
        palette: (s) => s.tertiaryPalette,
        tone: (s) => {
          if (isMonochrome(s)) {
            return s.isDark ? 10 : 90;
          }
          return s.isDark ? 20 : 100;
        },
        background: (s) => this.tertiary(),
        contrastCurve: (s) => new ContrastCurve(4.5, 7, 11, 21)
      });
    }
    tertiaryContainer() {
      return DynamicColor.fromPalette({
        name: "tertiary_container",
        palette: (s) => s.tertiaryPalette,
        tone: (s) => {
          if (isMonochrome(s)) {
            return s.isDark ? 60 : 49;
          }
          if (!isFidelity(s)) {
            return s.isDark ? 30 : 90;
          }
          const proposedHct = s.tertiaryPalette.getHct(s.sourceColorHct.tone);
          return DislikeAnalyzer.fixIfDisliked(proposedHct).tone;
        },
        isBackground: true,
        background: (s) => this.highestSurface(s),
        contrastCurve: (s) => new ContrastCurve(1, 1, 3, 4.5),
        toneDeltaPair: (s) => new ToneDeltaPair(this.tertiaryContainer(), this.tertiary(), 10, "nearer", false)
      });
    }
    onTertiaryContainer() {
      return DynamicColor.fromPalette({
        name: "on_tertiary_container",
        palette: (s) => s.tertiaryPalette,
        tone: (s) => {
          if (isMonochrome(s)) {
            return s.isDark ? 0 : 100;
          }
          if (!isFidelity(s)) {
            return s.isDark ? 90 : 30;
          }
          return DynamicColor.foregroundTone(this.tertiaryContainer().tone(s), 4.5);
        },
        background: (s) => this.tertiaryContainer(),
        contrastCurve: (s) => new ContrastCurve(3, 4.5, 7, 11)
      });
    }
    //////////////////////////////////////////////////////////////////
    // Error [E].                                                   //
    //////////////////////////////////////////////////////////////////
    error() {
      return DynamicColor.fromPalette({
        name: "error",
        palette: (s) => s.errorPalette,
        tone: (s) => s.isDark ? 80 : 40,
        isBackground: true,
        background: (s) => this.highestSurface(s),
        contrastCurve: (s) => new ContrastCurve(3, 4.5, 7, 7),
        toneDeltaPair: (s) => new ToneDeltaPair(this.errorContainer(), this.error(), 10, "nearer", false)
      });
    }
    errorDim() {
      return void 0;
    }
    onError() {
      return DynamicColor.fromPalette({
        name: "on_error",
        palette: (s) => s.errorPalette,
        tone: (s) => s.isDark ? 20 : 100,
        background: (s) => this.error(),
        contrastCurve: (s) => new ContrastCurve(4.5, 7, 11, 21)
      });
    }
    errorContainer() {
      return DynamicColor.fromPalette({
        name: "error_container",
        palette: (s) => s.errorPalette,
        tone: (s) => s.isDark ? 30 : 90,
        isBackground: true,
        background: (s) => this.highestSurface(s),
        contrastCurve: (s) => new ContrastCurve(1, 1, 3, 4.5),
        toneDeltaPair: (s) => new ToneDeltaPair(this.errorContainer(), this.error(), 10, "nearer", false)
      });
    }
    onErrorContainer() {
      return DynamicColor.fromPalette({
        name: "on_error_container",
        palette: (s) => s.errorPalette,
        tone: (s) => {
          if (isMonochrome(s)) {
            return s.isDark ? 90 : 10;
          }
          return s.isDark ? 90 : 30;
        },
        background: (s) => this.errorContainer(),
        contrastCurve: (s) => new ContrastCurve(3, 4.5, 7, 11)
      });
    }
    //////////////////////////////////////////////////////////////////
    // Primary Fixed [PF]                                           //
    //////////////////////////////////////////////////////////////////
    primaryFixed() {
      return DynamicColor.fromPalette({
        name: "primary_fixed",
        palette: (s) => s.primaryPalette,
        tone: (s) => isMonochrome(s) ? 40 : 90,
        isBackground: true,
        background: (s) => this.highestSurface(s),
        contrastCurve: (s) => new ContrastCurve(1, 1, 3, 4.5),
        toneDeltaPair: (s) => new ToneDeltaPair(this.primaryFixed(), this.primaryFixedDim(), 10, "lighter", true)
      });
    }
    primaryFixedDim() {
      return DynamicColor.fromPalette({
        name: "primary_fixed_dim",
        palette: (s) => s.primaryPalette,
        tone: (s) => isMonochrome(s) ? 30 : 80,
        isBackground: true,
        background: (s) => this.highestSurface(s),
        contrastCurve: (s) => new ContrastCurve(1, 1, 3, 4.5),
        toneDeltaPair: (s) => new ToneDeltaPair(this.primaryFixed(), this.primaryFixedDim(), 10, "lighter", true)
      });
    }
    onPrimaryFixed() {
      return DynamicColor.fromPalette({
        name: "on_primary_fixed",
        palette: (s) => s.primaryPalette,
        tone: (s) => isMonochrome(s) ? 100 : 10,
        background: (s) => this.primaryFixedDim(),
        secondBackground: (s) => this.primaryFixed(),
        contrastCurve: (s) => new ContrastCurve(4.5, 7, 11, 21)
      });
    }
    onPrimaryFixedVariant() {
      return DynamicColor.fromPalette({
        name: "on_primary_fixed_variant",
        palette: (s) => s.primaryPalette,
        tone: (s) => isMonochrome(s) ? 90 : 30,
        background: (s) => this.primaryFixedDim(),
        secondBackground: (s) => this.primaryFixed(),
        contrastCurve: (s) => new ContrastCurve(3, 4.5, 7, 11)
      });
    }
    ///////////////////////////////////////////////////////////////////
    // Secondary Fixed [QF]                                          //
    ///////////////////////////////////////////////////////////////////
    secondaryFixed() {
      return DynamicColor.fromPalette({
        name: "secondary_fixed",
        palette: (s) => s.secondaryPalette,
        tone: (s) => isMonochrome(s) ? 80 : 90,
        isBackground: true,
        background: (s) => this.highestSurface(s),
        contrastCurve: (s) => new ContrastCurve(1, 1, 3, 4.5),
        toneDeltaPair: (s) => new ToneDeltaPair(this.secondaryFixed(), this.secondaryFixedDim(), 10, "lighter", true)
      });
    }
    secondaryFixedDim() {
      return DynamicColor.fromPalette({
        name: "secondary_fixed_dim",
        palette: (s) => s.secondaryPalette,
        tone: (s) => isMonochrome(s) ? 70 : 80,
        isBackground: true,
        background: (s) => this.highestSurface(s),
        contrastCurve: (s) => new ContrastCurve(1, 1, 3, 4.5),
        toneDeltaPair: (s) => new ToneDeltaPair(this.secondaryFixed(), this.secondaryFixedDim(), 10, "lighter", true)
      });
    }
    onSecondaryFixed() {
      return DynamicColor.fromPalette({
        name: "on_secondary_fixed",
        palette: (s) => s.secondaryPalette,
        tone: (s) => 10,
        background: (s) => this.secondaryFixedDim(),
        secondBackground: (s) => this.secondaryFixed(),
        contrastCurve: (s) => new ContrastCurve(4.5, 7, 11, 21)
      });
    }
    onSecondaryFixedVariant() {
      return DynamicColor.fromPalette({
        name: "on_secondary_fixed_variant",
        palette: (s) => s.secondaryPalette,
        tone: (s) => isMonochrome(s) ? 25 : 30,
        background: (s) => this.secondaryFixedDim(),
        secondBackground: (s) => this.secondaryFixed(),
        contrastCurve: (s) => new ContrastCurve(3, 4.5, 7, 11)
      });
    }
    /////////////////////////////////////////////////////////////////
    // Tertiary Fixed [TF]                                         //
    /////////////////////////////////////////////////////////////////
    tertiaryFixed() {
      return DynamicColor.fromPalette({
        name: "tertiary_fixed",
        palette: (s) => s.tertiaryPalette,
        tone: (s) => isMonochrome(s) ? 40 : 90,
        isBackground: true,
        background: (s) => this.highestSurface(s),
        contrastCurve: (s) => new ContrastCurve(1, 1, 3, 4.5),
        toneDeltaPair: (s) => new ToneDeltaPair(this.tertiaryFixed(), this.tertiaryFixedDim(), 10, "lighter", true)
      });
    }
    tertiaryFixedDim() {
      return DynamicColor.fromPalette({
        name: "tertiary_fixed_dim",
        palette: (s) => s.tertiaryPalette,
        tone: (s) => isMonochrome(s) ? 30 : 80,
        isBackground: true,
        background: (s) => this.highestSurface(s),
        contrastCurve: (s) => new ContrastCurve(1, 1, 3, 4.5),
        toneDeltaPair: (s) => new ToneDeltaPair(this.tertiaryFixed(), this.tertiaryFixedDim(), 10, "lighter", true)
      });
    }
    onTertiaryFixed() {
      return DynamicColor.fromPalette({
        name: "on_tertiary_fixed",
        palette: (s) => s.tertiaryPalette,
        tone: (s) => isMonochrome(s) ? 100 : 10,
        background: (s) => this.tertiaryFixedDim(),
        secondBackground: (s) => this.tertiaryFixed(),
        contrastCurve: (s) => new ContrastCurve(4.5, 7, 11, 21)
      });
    }
    onTertiaryFixedVariant() {
      return DynamicColor.fromPalette({
        name: "on_tertiary_fixed_variant",
        palette: (s) => s.tertiaryPalette,
        tone: (s) => isMonochrome(s) ? 90 : 30,
        background: (s) => this.tertiaryFixedDim(),
        secondBackground: (s) => this.tertiaryFixed(),
        contrastCurve: (s) => new ContrastCurve(3, 4.5, 7, 11)
      });
    }
    ////////////////////////////////////////////////////////////////
    // Other                                                      //
    ////////////////////////////////////////////////////////////////
    highestSurface(s) {
      return s.isDark ? this.surfaceBright() : this.surfaceDim();
    }
  };

  // node_modules/@material/material-color-utilities/dynamiccolor/color_spec_2025.js
  function tMaxC(palette, lowerBound = 0, upperBound = 100, chromaMultiplier = 1) {
    let answer = findBestToneForChroma(palette.hue, palette.chroma * chromaMultiplier, 100, true);
    return clampDouble(lowerBound, upperBound, answer);
  }
  function tMinC(palette, lowerBound = 0, upperBound = 100) {
    let answer = findBestToneForChroma(palette.hue, palette.chroma, 0, false);
    return clampDouble(lowerBound, upperBound, answer);
  }
  function findBestToneForChroma(hue, chroma, tone, byDecreasingTone) {
    let answer = tone;
    let bestCandidate = Hct.from(hue, chroma, answer);
    while (bestCandidate.chroma < chroma) {
      if (tone < 0 || tone > 100) {
        break;
      }
      tone += byDecreasingTone ? -1 : 1;
      const newCandidate = Hct.from(hue, chroma, tone);
      if (bestCandidate.chroma < newCandidate.chroma) {
        bestCandidate = newCandidate;
        answer = tone;
      }
    }
    return answer;
  }
  function getCurve(defaultContrast) {
    if (defaultContrast === 1.5) {
      return new ContrastCurve(1.5, 1.5, 3, 5.5);
    } else if (defaultContrast === 3) {
      return new ContrastCurve(3, 3, 4.5, 7);
    } else if (defaultContrast === 4.5) {
      return new ContrastCurve(4.5, 4.5, 7, 11);
    } else if (defaultContrast === 6) {
      return new ContrastCurve(6, 6, 7, 11);
    } else if (defaultContrast === 7) {
      return new ContrastCurve(7, 7, 11, 21);
    } else if (defaultContrast === 9) {
      return new ContrastCurve(9, 9, 11, 21);
    } else if (defaultContrast === 11) {
      return new ContrastCurve(11, 11, 21, 21);
    } else if (defaultContrast === 21) {
      return new ContrastCurve(21, 21, 21, 21);
    } else {
      return new ContrastCurve(defaultContrast, defaultContrast, 7, 21);
    }
  }
  var ColorSpecDelegateImpl2025 = class extends ColorSpecDelegateImpl2021 {
    ////////////////////////////////////////////////////////////////
    // Surfaces [S]                                               //
    ////////////////////////////////////////////////////////////////
    surface() {
      const color2025 = DynamicColor.fromPalette({
        name: "surface",
        palette: (s) => s.neutralPalette,
        tone: (s) => {
          super.surface().tone(s);
          if (s.platform === "phone") {
            if (s.isDark) {
              return 4;
            } else {
              if (Hct.isYellow(s.neutralPalette.hue)) {
                return 99;
              } else if (s.variant === Variant.VIBRANT) {
                return 97;
              } else {
                return 98;
              }
            }
          } else {
            return 0;
          }
        },
        isBackground: true
      });
      return extendSpecVersion(super.surface(), "2025", color2025);
    }
    surfaceDim() {
      const color2025 = DynamicColor.fromPalette({
        name: "surface_dim",
        palette: (s) => s.neutralPalette,
        tone: (s) => {
          if (s.isDark) {
            return 4;
          } else {
            if (Hct.isYellow(s.neutralPalette.hue)) {
              return 90;
            } else if (s.variant === Variant.VIBRANT) {
              return 85;
            } else {
              return 87;
            }
          }
        },
        isBackground: true,
        chromaMultiplier: (s) => {
          if (!s.isDark) {
            if (s.variant === Variant.NEUTRAL) {
              return 2.5;
            } else if (s.variant === Variant.TONAL_SPOT) {
              return 1.7;
            } else if (s.variant === Variant.EXPRESSIVE) {
              return Hct.isYellow(s.neutralPalette.hue) ? 2.7 : 1.75;
            } else if (s.variant === Variant.VIBRANT) {
              return 1.36;
            }
          }
          return 1;
        }
      });
      return extendSpecVersion(super.surfaceDim(), "2025", color2025);
    }
    surfaceBright() {
      const color2025 = DynamicColor.fromPalette({
        name: "surface_bright",
        palette: (s) => s.neutralPalette,
        tone: (s) => {
          if (s.isDark) {
            return 18;
          } else {
            if (Hct.isYellow(s.neutralPalette.hue)) {
              return 99;
            } else if (s.variant === Variant.VIBRANT) {
              return 97;
            } else {
              return 98;
            }
          }
        },
        isBackground: true,
        chromaMultiplier: (s) => {
          if (s.isDark) {
            if (s.variant === Variant.NEUTRAL) {
              return 2.5;
            } else if (s.variant === Variant.TONAL_SPOT) {
              return 1.7;
            } else if (s.variant === Variant.EXPRESSIVE) {
              return Hct.isYellow(s.neutralPalette.hue) ? 2.7 : 1.75;
            } else if (s.variant === Variant.VIBRANT) {
              return 1.36;
            }
          }
          return 1;
        }
      });
      return extendSpecVersion(super.surfaceBright(), "2025", color2025);
    }
    surfaceContainerLowest() {
      const color2025 = DynamicColor.fromPalette({
        name: "surface_container_lowest",
        palette: (s) => s.neutralPalette,
        tone: (s) => s.isDark ? 0 : 100,
        isBackground: true
      });
      return extendSpecVersion(super.surfaceContainerLowest(), "2025", color2025);
    }
    surfaceContainerLow() {
      const color2025 = DynamicColor.fromPalette({
        name: "surface_container_low",
        palette: (s) => s.neutralPalette,
        tone: (s) => {
          if (s.platform === "phone") {
            if (s.isDark) {
              return 6;
            } else {
              if (Hct.isYellow(s.neutralPalette.hue)) {
                return 98;
              } else if (s.variant === Variant.VIBRANT) {
                return 95;
              } else {
                return 96;
              }
            }
          } else {
            return 15;
          }
        },
        isBackground: true,
        chromaMultiplier: (s) => {
          if (s.platform === "phone") {
            if (s.variant === Variant.NEUTRAL) {
              return 1.3;
            } else if (s.variant === Variant.TONAL_SPOT) {
              return 1.25;
            } else if (s.variant === Variant.EXPRESSIVE) {
              return Hct.isYellow(s.neutralPalette.hue) ? 1.3 : 1.15;
            } else if (s.variant === Variant.VIBRANT) {
              return 1.08;
            }
          }
          return 1;
        }
      });
      return extendSpecVersion(super.surfaceContainerLow(), "2025", color2025);
    }
    surfaceContainer() {
      const color2025 = DynamicColor.fromPalette({
        name: "surface_container",
        palette: (s) => s.neutralPalette,
        tone: (s) => {
          if (s.platform === "phone") {
            if (s.isDark) {
              return 9;
            } else {
              if (Hct.isYellow(s.neutralPalette.hue)) {
                return 96;
              } else if (s.variant === Variant.VIBRANT) {
                return 92;
              } else {
                return 94;
              }
            }
          } else {
            return 20;
          }
        },
        isBackground: true,
        chromaMultiplier: (s) => {
          if (s.platform === "phone") {
            if (s.variant === Variant.NEUTRAL) {
              return 1.6;
            } else if (s.variant === Variant.TONAL_SPOT) {
              return 1.4;
            } else if (s.variant === Variant.EXPRESSIVE) {
              return Hct.isYellow(s.neutralPalette.hue) ? 1.6 : 1.3;
            } else if (s.variant === Variant.VIBRANT) {
              return 1.15;
            }
          }
          return 1;
        }
      });
      return extendSpecVersion(super.surfaceContainer(), "2025", color2025);
    }
    surfaceContainerHigh() {
      const color2025 = DynamicColor.fromPalette({
        name: "surface_container_high",
        palette: (s) => s.neutralPalette,
        tone: (s) => {
          if (s.platform === "phone") {
            if (s.isDark) {
              return 12;
            } else {
              if (Hct.isYellow(s.neutralPalette.hue)) {
                return 94;
              } else if (s.variant === Variant.VIBRANT) {
                return 90;
              } else {
                return 92;
              }
            }
          } else {
            return 25;
          }
        },
        isBackground: true,
        chromaMultiplier: (s) => {
          if (s.platform === "phone") {
            if (s.variant === Variant.NEUTRAL) {
              return 1.9;
            } else if (s.variant === Variant.TONAL_SPOT) {
              return 1.5;
            } else if (s.variant === Variant.EXPRESSIVE) {
              return Hct.isYellow(s.neutralPalette.hue) ? 1.95 : 1.45;
            } else if (s.variant === Variant.VIBRANT) {
              return 1.22;
            }
          }
          return 1;
        }
      });
      return extendSpecVersion(super.surfaceContainerHigh(), "2025", color2025);
    }
    surfaceContainerHighest() {
      const color2025 = DynamicColor.fromPalette({
        name: "surface_container_highest",
        palette: (s) => s.neutralPalette,
        tone: (s) => {
          if (s.isDark) {
            return 15;
          } else {
            if (Hct.isYellow(s.neutralPalette.hue)) {
              return 92;
            } else if (s.variant === Variant.VIBRANT) {
              return 88;
            } else {
              return 90;
            }
          }
        },
        isBackground: true,
        chromaMultiplier: (s) => {
          if (s.variant === Variant.NEUTRAL) {
            return 2.2;
          } else if (s.variant === Variant.TONAL_SPOT) {
            return 1.7;
          } else if (s.variant === Variant.EXPRESSIVE) {
            return Hct.isYellow(s.neutralPalette.hue) ? 2.3 : 1.6;
          } else if (s.variant === Variant.VIBRANT) {
            return 1.29;
          } else {
            return 1;
          }
        }
      });
      return extendSpecVersion(super.surfaceContainerHighest(), "2025", color2025);
    }
    onSurface() {
      const color2025 = DynamicColor.fromPalette({
        name: "on_surface",
        palette: (s) => s.neutralPalette,
        tone: (s) => {
          if (s.variant === Variant.VIBRANT) {
            return tMaxC(s.neutralPalette, 0, 100, 1.1);
          } else {
            return DynamicColor.getInitialToneFromBackground((s2) => s2.platform === "phone" ? this.highestSurface(s2) : this.surfaceContainerHigh())(s);
          }
        },
        chromaMultiplier: (s) => {
          if (s.platform === "phone") {
            if (s.variant === Variant.NEUTRAL) {
              return 2.2;
            } else if (s.variant === Variant.TONAL_SPOT) {
              return 1.7;
            } else if (s.variant === Variant.EXPRESSIVE) {
              return Hct.isYellow(s.neutralPalette.hue) ? s.isDark ? 3 : 2.3 : 1.6;
            }
          }
          return 1;
        },
        background: (s) => s.platform === "phone" ? this.highestSurface(s) : this.surfaceContainerHigh(),
        contrastCurve: (s) => s.isDark && s.platform === "phone" ? getCurve(11) : getCurve(9)
      });
      return extendSpecVersion(super.onSurface(), "2025", color2025);
    }
    onSurfaceVariant() {
      const color2025 = DynamicColor.fromPalette({
        name: "on_surface_variant",
        palette: (s) => s.neutralPalette,
        chromaMultiplier: (s) => {
          if (s.platform === "phone") {
            if (s.variant === Variant.NEUTRAL) {
              return 2.2;
            } else if (s.variant === Variant.TONAL_SPOT) {
              return 1.7;
            } else if (s.variant === Variant.EXPRESSIVE) {
              return Hct.isYellow(s.neutralPalette.hue) ? s.isDark ? 3 : 2.3 : 1.6;
            }
          }
          return 1;
        },
        background: (s) => s.platform === "phone" ? this.highestSurface(s) : this.surfaceContainerHigh(),
        contrastCurve: (s) => s.platform === "phone" ? s.isDark ? getCurve(6) : getCurve(4.5) : getCurve(7)
      });
      return extendSpecVersion(super.onSurfaceVariant(), "2025", color2025);
    }
    outline() {
      const color2025 = DynamicColor.fromPalette({
        name: "outline",
        palette: (s) => s.neutralPalette,
        chromaMultiplier: (s) => {
          if (s.platform === "phone") {
            if (s.variant === Variant.NEUTRAL) {
              return 2.2;
            } else if (s.variant === Variant.TONAL_SPOT) {
              return 1.7;
            } else if (s.variant === Variant.EXPRESSIVE) {
              return Hct.isYellow(s.neutralPalette.hue) ? s.isDark ? 3 : 2.3 : 1.6;
            }
          }
          return 1;
        },
        background: (s) => s.platform === "phone" ? this.highestSurface(s) : this.surfaceContainerHigh(),
        contrastCurve: (s) => s.platform === "phone" ? getCurve(3) : getCurve(4.5)
      });
      return extendSpecVersion(super.outline(), "2025", color2025);
    }
    outlineVariant() {
      const color2025 = DynamicColor.fromPalette({
        name: "outline_variant",
        palette: (s) => s.neutralPalette,
        chromaMultiplier: (s) => {
          if (s.platform === "phone") {
            if (s.variant === Variant.NEUTRAL) {
              return 2.2;
            } else if (s.variant === Variant.TONAL_SPOT) {
              return 1.7;
            } else if (s.variant === Variant.EXPRESSIVE) {
              return Hct.isYellow(s.neutralPalette.hue) ? s.isDark ? 3 : 2.3 : 1.6;
            }
          }
          return 1;
        },
        background: (s) => s.platform === "phone" ? this.highestSurface(s) : this.surfaceContainerHigh(),
        contrastCurve: (s) => s.platform === "phone" ? getCurve(1.5) : getCurve(3)
      });
      return extendSpecVersion(super.outlineVariant(), "2025", color2025);
    }
    inverseSurface() {
      const color2025 = DynamicColor.fromPalette({
        name: "inverse_surface",
        palette: (s) => s.neutralPalette,
        tone: (s) => s.isDark ? 98 : 4,
        isBackground: true
      });
      return extendSpecVersion(super.inverseSurface(), "2025", color2025);
    }
    inverseOnSurface() {
      const color2025 = DynamicColor.fromPalette({
        name: "inverse_on_surface",
        palette: (s) => s.neutralPalette,
        background: (s) => this.inverseSurface(),
        contrastCurve: (s) => getCurve(7)
      });
      return extendSpecVersion(super.inverseOnSurface(), "2025", color2025);
    }
    ////////////////////////////////////////////////////////////////
    // Primaries [P]                                              //
    ////////////////////////////////////////////////////////////////
    primary() {
      const color2025 = DynamicColor.fromPalette({
        name: "primary",
        palette: (s) => s.primaryPalette,
        tone: (s) => {
          if (s.variant === Variant.NEUTRAL) {
            if (s.platform === "phone") {
              return s.isDark ? 80 : 40;
            } else {
              return 90;
            }
          } else if (s.variant === Variant.TONAL_SPOT) {
            if (s.platform === "phone") {
              if (s.isDark) {
                return 80;
              } else {
                return tMaxC(s.primaryPalette);
              }
            } else {
              return tMaxC(s.primaryPalette, 0, 90);
            }
          } else if (s.variant === Variant.EXPRESSIVE) {
            if (s.platform === "phone") {
              return tMaxC(s.primaryPalette, 0, Hct.isYellow(s.primaryPalette.hue) ? 25 : Hct.isCyan(s.primaryPalette.hue) ? 88 : 98);
            } else {
              return tMaxC(s.primaryPalette);
            }
          } else {
            if (s.platform === "phone") {
              return tMaxC(s.primaryPalette, 0, Hct.isCyan(s.primaryPalette.hue) ? 88 : 98);
            } else {
              return tMaxC(s.primaryPalette);
            }
          }
        },
        isBackground: true,
        background: (s) => s.platform === "phone" ? this.highestSurface(s) : this.surfaceContainerHigh(),
        contrastCurve: (s) => s.platform === "phone" ? getCurve(4.5) : getCurve(7),
        toneDeltaPair: (s) => s.platform === "phone" ? new ToneDeltaPair(this.primaryContainer(), this.primary(), 5, "relative_lighter", true, "farther") : void 0
      });
      return extendSpecVersion(super.primary(), "2025", color2025);
    }
    primaryDim() {
      return DynamicColor.fromPalette({
        name: "primary_dim",
        palette: (s) => s.primaryPalette,
        tone: (s) => {
          if (s.variant === Variant.NEUTRAL) {
            return 85;
          } else if (s.variant === Variant.TONAL_SPOT) {
            return tMaxC(s.primaryPalette, 0, 90);
          } else {
            return tMaxC(s.primaryPalette);
          }
        },
        isBackground: true,
        background: (s) => this.surfaceContainerHigh(),
        contrastCurve: (s) => getCurve(4.5),
        toneDeltaPair: (s) => new ToneDeltaPair(this.primaryDim(), this.primary(), 5, "darker", true, "farther")
      });
    }
    onPrimary() {
      const color2025 = DynamicColor.fromPalette({
        name: "on_primary",
        palette: (s) => s.primaryPalette,
        background: (s) => s.platform === "phone" ? this.primary() : this.primaryDim(),
        contrastCurve: (s) => s.platform === "phone" ? getCurve(6) : getCurve(7)
      });
      return extendSpecVersion(super.onPrimary(), "2025", color2025);
    }
    primaryContainer() {
      const color2025 = DynamicColor.fromPalette({
        name: "primary_container",
        palette: (s) => s.primaryPalette,
        tone: (s) => {
          if (s.platform === "watch") {
            return 30;
          } else if (s.variant === Variant.NEUTRAL) {
            return s.isDark ? 30 : 90;
          } else if (s.variant === Variant.TONAL_SPOT) {
            return s.isDark ? tMinC(s.primaryPalette, 35, 93) : tMaxC(s.primaryPalette, 0, 90);
          } else if (s.variant === Variant.EXPRESSIVE) {
            return s.isDark ? tMaxC(s.primaryPalette, 30, 93) : tMaxC(s.primaryPalette, 78, Hct.isCyan(s.primaryPalette.hue) ? 88 : 90);
          } else {
            return s.isDark ? tMinC(s.primaryPalette, 66, 93) : tMaxC(s.primaryPalette, 66, Hct.isCyan(s.primaryPalette.hue) ? 88 : 93);
          }
        },
        isBackground: true,
        background: (s) => s.platform === "phone" ? this.highestSurface(s) : void 0,
        toneDeltaPair: (s) => s.platform === "phone" ? void 0 : new ToneDeltaPair(this.primaryContainer(), this.primaryDim(), 10, "darker", true, "farther"),
        contrastCurve: (s) => s.platform === "phone" && s.contrastLevel > 0 ? getCurve(1.5) : void 0
      });
      return extendSpecVersion(super.primaryContainer(), "2025", color2025);
    }
    onPrimaryContainer() {
      const color2025 = DynamicColor.fromPalette({
        name: "on_primary_container",
        palette: (s) => s.primaryPalette,
        background: (s) => this.primaryContainer(),
        contrastCurve: (s) => s.platform === "phone" ? getCurve(6) : getCurve(7)
      });
      return extendSpecVersion(super.onPrimaryContainer(), "2025", color2025);
    }
    primaryFixed() {
      const color2025 = DynamicColor.fromPalette({
        name: "primary_fixed",
        palette: (s) => s.primaryPalette,
        tone: (s) => {
          let tempS = Object.assign({}, s, { isDark: false, contrastLevel: 0 });
          return this.primaryContainer().getTone(tempS);
        },
        isBackground: true,
        background: (s) => s.platform === "phone" ? this.highestSurface(s) : void 0,
        contrastCurve: (s) => s.platform === "phone" && s.contrastLevel > 0 ? getCurve(1.5) : void 0
      });
      return extendSpecVersion(super.primaryFixed(), "2025", color2025);
    }
    primaryFixedDim() {
      const color2025 = DynamicColor.fromPalette({
        name: "primary_fixed_dim",
        palette: (s) => s.primaryPalette,
        tone: (s) => this.primaryFixed().getTone(s),
        isBackground: true,
        toneDeltaPair: (s) => new ToneDeltaPair(this.primaryFixedDim(), this.primaryFixed(), 5, "darker", true, "exact")
      });
      return extendSpecVersion(super.primaryFixedDim(), "2025", color2025);
    }
    onPrimaryFixed() {
      const color2025 = DynamicColor.fromPalette({
        name: "on_primary_fixed",
        palette: (s) => s.primaryPalette,
        background: (s) => this.primaryFixedDim(),
        contrastCurve: (s) => getCurve(7)
      });
      return extendSpecVersion(super.onPrimaryFixed(), "2025", color2025);
    }
    onPrimaryFixedVariant() {
      const color2025 = DynamicColor.fromPalette({
        name: "on_primary_fixed_variant",
        palette: (s) => s.primaryPalette,
        background: (s) => this.primaryFixedDim(),
        contrastCurve: (s) => getCurve(4.5)
      });
      return extendSpecVersion(super.onPrimaryFixedVariant(), "2025", color2025);
    }
    inversePrimary() {
      const color2025 = DynamicColor.fromPalette({
        name: "inverse_primary",
        palette: (s) => s.primaryPalette,
        tone: (s) => tMaxC(s.primaryPalette),
        background: (s) => this.inverseSurface(),
        contrastCurve: (s) => s.platform === "phone" ? getCurve(6) : getCurve(7)
      });
      return extendSpecVersion(super.inversePrimary(), "2025", color2025);
    }
    ////////////////////////////////////////////////////////////////
    // Secondaries [Q]                                            //
    ////////////////////////////////////////////////////////////////
    secondary() {
      const color2025 = DynamicColor.fromPalette({
        name: "secondary",
        palette: (s) => s.secondaryPalette,
        tone: (s) => {
          if (s.platform === "watch") {
            return s.variant === Variant.NEUTRAL ? 90 : tMaxC(s.secondaryPalette, 0, 90);
          } else if (s.variant === Variant.NEUTRAL) {
            return s.isDark ? tMinC(s.secondaryPalette, 0, 98) : tMaxC(s.secondaryPalette);
          } else if (s.variant === Variant.VIBRANT) {
            return tMaxC(s.secondaryPalette, 0, s.isDark ? 90 : 98);
          } else {
            return s.isDark ? 80 : tMaxC(s.secondaryPalette);
          }
        },
        isBackground: true,
        background: (s) => s.platform === "phone" ? this.highestSurface(s) : this.surfaceContainerHigh(),
        contrastCurve: (s) => s.platform === "phone" ? getCurve(4.5) : getCurve(7),
        toneDeltaPair: (s) => s.platform === "phone" ? new ToneDeltaPair(this.secondaryContainer(), this.secondary(), 5, "relative_lighter", true, "farther") : void 0
      });
      return extendSpecVersion(super.secondary(), "2025", color2025);
    }
    secondaryDim() {
      return DynamicColor.fromPalette({
        name: "secondary_dim",
        palette: (s) => s.secondaryPalette,
        tone: (s) => {
          if (s.variant === Variant.NEUTRAL) {
            return 85;
          } else {
            return tMaxC(s.secondaryPalette, 0, 90);
          }
        },
        isBackground: true,
        background: (s) => this.surfaceContainerHigh(),
        contrastCurve: (s) => getCurve(4.5),
        toneDeltaPair: (s) => new ToneDeltaPair(this.secondaryDim(), this.secondary(), 5, "darker", true, "farther")
      });
    }
    onSecondary() {
      const color2025 = DynamicColor.fromPalette({
        name: "on_secondary",
        palette: (s) => s.secondaryPalette,
        background: (s) => s.platform === "phone" ? this.secondary() : this.secondaryDim(),
        contrastCurve: (s) => s.platform === "phone" ? getCurve(6) : getCurve(7)
      });
      return extendSpecVersion(super.onSecondary(), "2025", color2025);
    }
    secondaryContainer() {
      const color2025 = DynamicColor.fromPalette({
        name: "secondary_container",
        palette: (s) => s.secondaryPalette,
        tone: (s) => {
          if (s.platform === "watch") {
            return 30;
          } else if (s.variant === Variant.VIBRANT) {
            return s.isDark ? tMinC(s.secondaryPalette, 30, 40) : tMaxC(s.secondaryPalette, 84, 90);
          } else if (s.variant === Variant.EXPRESSIVE) {
            return s.isDark ? 15 : tMaxC(s.secondaryPalette, 90, 95);
          } else {
            return s.isDark ? 25 : 90;
          }
        },
        isBackground: true,
        background: (s) => s.platform === "phone" ? this.highestSurface(s) : void 0,
        toneDeltaPair: (s) => s.platform === "watch" ? new ToneDeltaPair(this.secondaryContainer(), this.secondaryDim(), 10, "darker", true, "farther") : void 0,
        contrastCurve: (s) => s.platform === "phone" && s.contrastLevel > 0 ? getCurve(1.5) : void 0
      });
      return extendSpecVersion(super.secondaryContainer(), "2025", color2025);
    }
    onSecondaryContainer() {
      const color2025 = DynamicColor.fromPalette({
        name: "on_secondary_container",
        palette: (s) => s.secondaryPalette,
        background: (s) => this.secondaryContainer(),
        contrastCurve: (s) => s.platform === "phone" ? getCurve(6) : getCurve(7)
      });
      return extendSpecVersion(super.onSecondaryContainer(), "2025", color2025);
    }
    secondaryFixed() {
      const color2025 = DynamicColor.fromPalette({
        name: "secondary_fixed",
        palette: (s) => s.secondaryPalette,
        tone: (s) => {
          let tempS = Object.assign({}, s, { isDark: false, contrastLevel: 0 });
          return this.secondaryContainer().getTone(tempS);
        },
        isBackground: true,
        background: (s) => s.platform === "phone" ? this.highestSurface(s) : void 0,
        contrastCurve: (s) => s.platform === "phone" && s.contrastLevel > 0 ? getCurve(1.5) : void 0
      });
      return extendSpecVersion(super.secondaryFixed(), "2025", color2025);
    }
    secondaryFixedDim() {
      const color2025 = DynamicColor.fromPalette({
        name: "secondary_fixed_dim",
        palette: (s) => s.secondaryPalette,
        tone: (s) => this.secondaryFixed().getTone(s),
        isBackground: true,
        toneDeltaPair: (s) => new ToneDeltaPair(this.secondaryFixedDim(), this.secondaryFixed(), 5, "darker", true, "exact")
      });
      return extendSpecVersion(super.secondaryFixedDim(), "2025", color2025);
    }
    onSecondaryFixed() {
      const color2025 = DynamicColor.fromPalette({
        name: "on_secondary_fixed",
        palette: (s) => s.secondaryPalette,
        background: (s) => this.secondaryFixedDim(),
        contrastCurve: (s) => getCurve(7)
      });
      return extendSpecVersion(super.onSecondaryFixed(), "2025", color2025);
    }
    onSecondaryFixedVariant() {
      const color2025 = DynamicColor.fromPalette({
        name: "on_secondary_fixed_variant",
        palette: (s) => s.secondaryPalette,
        background: (s) => this.secondaryFixedDim(),
        contrastCurve: (s) => getCurve(4.5)
      });
      return extendSpecVersion(super.onSecondaryFixedVariant(), "2025", color2025);
    }
    ////////////////////////////////////////////////////////////////
    // Tertiaries [T]                                             //
    ////////////////////////////////////////////////////////////////
    tertiary() {
      const color2025 = DynamicColor.fromPalette({
        name: "tertiary",
        palette: (s) => s.tertiaryPalette,
        tone: (s) => {
          if (s.platform === "watch") {
            return s.variant === Variant.TONAL_SPOT ? tMaxC(s.tertiaryPalette, 0, 90) : tMaxC(s.tertiaryPalette);
          } else if (s.variant === Variant.EXPRESSIVE || s.variant === Variant.VIBRANT) {
            return tMaxC(s.tertiaryPalette, 0, Hct.isCyan(s.tertiaryPalette.hue) ? 88 : s.isDark ? 98 : 100);
          } else {
            return s.isDark ? tMaxC(s.tertiaryPalette, 0, 98) : tMaxC(s.tertiaryPalette);
          }
        },
        isBackground: true,
        background: (s) => s.platform === "phone" ? this.highestSurface(s) : this.surfaceContainerHigh(),
        contrastCurve: (s) => s.platform === "phone" ? getCurve(4.5) : getCurve(7),
        toneDeltaPair: (s) => s.platform === "phone" ? new ToneDeltaPair(this.tertiaryContainer(), this.tertiary(), 5, "relative_lighter", true, "farther") : void 0
      });
      return extendSpecVersion(super.tertiary(), "2025", color2025);
    }
    tertiaryDim() {
      return DynamicColor.fromPalette({
        name: "tertiary_dim",
        palette: (s) => s.tertiaryPalette,
        tone: (s) => {
          if (s.variant === Variant.TONAL_SPOT) {
            return tMaxC(s.tertiaryPalette, 0, 90);
          } else {
            return tMaxC(s.tertiaryPalette);
          }
        },
        isBackground: true,
        background: (s) => this.surfaceContainerHigh(),
        contrastCurve: (s) => getCurve(4.5),
        toneDeltaPair: (s) => new ToneDeltaPair(this.tertiaryDim(), this.tertiary(), 5, "darker", true, "farther")
      });
    }
    onTertiary() {
      const color2025 = DynamicColor.fromPalette({
        name: "on_tertiary",
        palette: (s) => s.tertiaryPalette,
        background: (s) => s.platform === "phone" ? this.tertiary() : this.tertiaryDim(),
        contrastCurve: (s) => s.platform === "phone" ? getCurve(6) : getCurve(7)
      });
      return extendSpecVersion(super.onTertiary(), "2025", color2025);
    }
    tertiaryContainer() {
      const color2025 = DynamicColor.fromPalette({
        name: "tertiary_container",
        palette: (s) => s.tertiaryPalette,
        tone: (s) => {
          if (s.platform === "watch") {
            return s.variant === Variant.TONAL_SPOT ? tMaxC(s.tertiaryPalette, 0, 90) : tMaxC(s.tertiaryPalette);
          } else {
            if (s.variant === Variant.NEUTRAL) {
              return s.isDark ? tMaxC(s.tertiaryPalette, 0, 93) : tMaxC(s.tertiaryPalette, 0, 96);
            } else if (s.variant === Variant.TONAL_SPOT) {
              return tMaxC(s.tertiaryPalette, 0, s.isDark ? 93 : 100);
            } else if (s.variant === Variant.EXPRESSIVE) {
              return tMaxC(s.tertiaryPalette, 75, Hct.isCyan(s.tertiaryPalette.hue) ? 88 : s.isDark ? 93 : 100);
            } else {
              return s.isDark ? tMaxC(s.tertiaryPalette, 0, 93) : tMaxC(s.tertiaryPalette, 72, 100);
            }
          }
        },
        isBackground: true,
        background: (s) => s.platform === "phone" ? this.highestSurface(s) : void 0,
        toneDeltaPair: (s) => s.platform === "watch" ? new ToneDeltaPair(this.tertiaryContainer(), this.tertiaryDim(), 10, "darker", true, "farther") : void 0,
        contrastCurve: (s) => s.platform === "phone" && s.contrastLevel > 0 ? getCurve(1.5) : void 0
      });
      return extendSpecVersion(super.tertiaryContainer(), "2025", color2025);
    }
    onTertiaryContainer() {
      const color2025 = DynamicColor.fromPalette({
        name: "on_tertiary_container",
        palette: (s) => s.tertiaryPalette,
        background: (s) => this.tertiaryContainer(),
        contrastCurve: (s) => s.platform === "phone" ? getCurve(6) : getCurve(7)
      });
      return extendSpecVersion(super.onTertiaryContainer(), "2025", color2025);
    }
    tertiaryFixed() {
      const color2025 = DynamicColor.fromPalette({
        name: "tertiary_fixed",
        palette: (s) => s.tertiaryPalette,
        tone: (s) => {
          let tempS = Object.assign({}, s, { isDark: false, contrastLevel: 0 });
          return this.tertiaryContainer().getTone(tempS);
        },
        isBackground: true,
        background: (s) => s.platform === "phone" ? this.highestSurface(s) : void 0,
        contrastCurve: (s) => s.platform === "phone" && s.contrastLevel > 0 ? getCurve(1.5) : void 0
      });
      return extendSpecVersion(super.tertiaryFixed(), "2025", color2025);
    }
    tertiaryFixedDim() {
      const color2025 = DynamicColor.fromPalette({
        name: "tertiary_fixed_dim",
        palette: (s) => s.tertiaryPalette,
        tone: (s) => this.tertiaryFixed().getTone(s),
        isBackground: true,
        toneDeltaPair: (s) => new ToneDeltaPair(this.tertiaryFixedDim(), this.tertiaryFixed(), 5, "darker", true, "exact")
      });
      return extendSpecVersion(super.tertiaryFixedDim(), "2025", color2025);
    }
    onTertiaryFixed() {
      const color2025 = DynamicColor.fromPalette({
        name: "on_tertiary_fixed",
        palette: (s) => s.tertiaryPalette,
        background: (s) => this.tertiaryFixedDim(),
        contrastCurve: (s) => getCurve(7)
      });
      return extendSpecVersion(super.onTertiaryFixed(), "2025", color2025);
    }
    onTertiaryFixedVariant() {
      const color2025 = DynamicColor.fromPalette({
        name: "on_tertiary_fixed_variant",
        palette: (s) => s.tertiaryPalette,
        background: (s) => this.tertiaryFixedDim(),
        contrastCurve: (s) => getCurve(4.5)
      });
      return extendSpecVersion(super.onTertiaryFixedVariant(), "2025", color2025);
    }
    ////////////////////////////////////////////////////////////////
    // Errors [E]                                                 //
    ////////////////////////////////////////////////////////////////
    error() {
      const color2025 = DynamicColor.fromPalette({
        name: "error",
        palette: (s) => s.errorPalette,
        tone: (s) => {
          if (s.platform === "phone") {
            return s.isDark ? tMinC(s.errorPalette, 0, 98) : tMaxC(s.errorPalette);
          } else {
            return tMinC(s.errorPalette);
          }
        },
        isBackground: true,
        background: (s) => s.platform === "phone" ? this.highestSurface(s) : this.surfaceContainerHigh(),
        contrastCurve: (s) => s.platform === "phone" ? getCurve(4.5) : getCurve(7),
        toneDeltaPair: (s) => s.platform === "phone" ? new ToneDeltaPair(this.errorContainer(), this.error(), 5, "relative_lighter", true, "farther") : void 0
      });
      return extendSpecVersion(super.error(), "2025", color2025);
    }
    errorDim() {
      return DynamicColor.fromPalette({
        name: "error_dim",
        palette: (s) => s.errorPalette,
        tone: (s) => tMinC(s.errorPalette),
        isBackground: true,
        background: (s) => this.surfaceContainerHigh(),
        contrastCurve: (s) => getCurve(4.5),
        toneDeltaPair: (s) => new ToneDeltaPair(this.errorDim(), this.error(), 5, "darker", true, "farther")
      });
    }
    onError() {
      const color2025 = DynamicColor.fromPalette({
        name: "on_error",
        palette: (s) => s.errorPalette,
        background: (s) => s.platform === "phone" ? this.error() : this.errorDim(),
        contrastCurve: (s) => s.platform === "phone" ? getCurve(6) : getCurve(7)
      });
      return extendSpecVersion(super.onError(), "2025", color2025);
    }
    errorContainer() {
      const color2025 = DynamicColor.fromPalette({
        name: "error_container",
        palette: (s) => s.errorPalette,
        tone: (s) => {
          if (s.platform === "watch") {
            return 30;
          } else {
            return s.isDark ? tMinC(s.errorPalette, 30, 93) : tMaxC(s.errorPalette, 0, 90);
          }
        },
        isBackground: true,
        background: (s) => s.platform === "phone" ? this.highestSurface(s) : void 0,
        toneDeltaPair: (s) => s.platform === "watch" ? new ToneDeltaPair(this.errorContainer(), this.errorDim(), 10, "darker", true, "farther") : void 0,
        contrastCurve: (s) => s.platform === "phone" && s.contrastLevel > 0 ? getCurve(1.5) : void 0
      });
      return extendSpecVersion(super.errorContainer(), "2025", color2025);
    }
    onErrorContainer() {
      const color2025 = DynamicColor.fromPalette({
        name: "on_error_container",
        palette: (s) => s.errorPalette,
        background: (s) => this.errorContainer(),
        contrastCurve: (s) => s.platform === "phone" ? getCurve(4.5) : getCurve(7)
      });
      return extendSpecVersion(super.onErrorContainer(), "2025", color2025);
    }
    /////////////////////////////////////////////////////////////////
    // Remapped Colors                                             //
    /////////////////////////////////////////////////////////////////
    surfaceVariant() {
      const color2025 = Object.assign(this.surfaceContainerHighest().clone(), { name: "surface_variant" });
      return extendSpecVersion(super.surfaceVariant(), "2025", color2025);
    }
    surfaceTint() {
      const color2025 = Object.assign(this.primary().clone(), { name: "surface_tint" });
      return extendSpecVersion(super.surfaceTint(), "2025", color2025);
    }
    background() {
      const color2025 = Object.assign(this.surface().clone(), { name: "background" });
      return extendSpecVersion(super.background(), "2025", color2025);
    }
    onBackground() {
      const color2025 = Object.assign(this.onSurface().clone(), {
        name: "on_background",
        tone: (s) => {
          return s.platform === "watch" ? 100 : this.onSurface().getTone(s);
        }
      });
      return extendSpecVersion(super.onBackground(), "2025", color2025);
    }
  };

  // node_modules/@material/material-color-utilities/dynamiccolor/material_dynamic_colors.js
  var MaterialDynamicColors = class _MaterialDynamicColors {
    constructor() {
      this.allColors = [
        this.background(),
        this.onBackground(),
        this.surface(),
        this.surfaceDim(),
        this.surfaceBright(),
        this.surfaceContainerLowest(),
        this.surfaceContainerLow(),
        this.surfaceContainer(),
        this.surfaceContainerHigh(),
        this.surfaceContainerHighest(),
        this.onSurface(),
        this.onSurfaceVariant(),
        this.outline(),
        this.outlineVariant(),
        this.inverseSurface(),
        this.inverseOnSurface(),
        this.primary(),
        this.primaryDim(),
        this.onPrimary(),
        this.primaryContainer(),
        this.onPrimaryContainer(),
        this.primaryFixed(),
        this.primaryFixedDim(),
        this.onPrimaryFixed(),
        this.onPrimaryFixedVariant(),
        this.inversePrimary(),
        this.secondary(),
        this.secondaryDim(),
        this.onSecondary(),
        this.secondaryContainer(),
        this.onSecondaryContainer(),
        this.secondaryFixed(),
        this.secondaryFixedDim(),
        this.onSecondaryFixed(),
        this.onSecondaryFixedVariant(),
        this.tertiary(),
        this.tertiaryDim(),
        this.onTertiary(),
        this.tertiaryContainer(),
        this.onTertiaryContainer(),
        this.tertiaryFixed(),
        this.tertiaryFixedDim(),
        this.onTertiaryFixed(),
        this.onTertiaryFixedVariant(),
        this.error(),
        this.errorDim(),
        this.onError(),
        this.errorContainer(),
        this.onErrorContainer()
      ].filter((c) => c !== void 0);
    }
    highestSurface(s) {
      return _MaterialDynamicColors.colorSpec.highestSurface(s);
    }
    ////////////////////////////////////////////////////////////////
    // Main Palettes                                              //
    ////////////////////////////////////////////////////////////////
    primaryPaletteKeyColor() {
      return _MaterialDynamicColors.colorSpec.primaryPaletteKeyColor();
    }
    secondaryPaletteKeyColor() {
      return _MaterialDynamicColors.colorSpec.secondaryPaletteKeyColor();
    }
    tertiaryPaletteKeyColor() {
      return _MaterialDynamicColors.colorSpec.tertiaryPaletteKeyColor();
    }
    neutralPaletteKeyColor() {
      return _MaterialDynamicColors.colorSpec.neutralPaletteKeyColor();
    }
    neutralVariantPaletteKeyColor() {
      return _MaterialDynamicColors.colorSpec.neutralVariantPaletteKeyColor();
    }
    errorPaletteKeyColor() {
      return _MaterialDynamicColors.colorSpec.errorPaletteKeyColor();
    }
    ////////////////////////////////////////////////////////////////
    // Surfaces [S]                                               //
    ////////////////////////////////////////////////////////////////
    background() {
      return _MaterialDynamicColors.colorSpec.background();
    }
    onBackground() {
      return _MaterialDynamicColors.colorSpec.onBackground();
    }
    surface() {
      return _MaterialDynamicColors.colorSpec.surface();
    }
    surfaceDim() {
      return _MaterialDynamicColors.colorSpec.surfaceDim();
    }
    surfaceBright() {
      return _MaterialDynamicColors.colorSpec.surfaceBright();
    }
    surfaceContainerLowest() {
      return _MaterialDynamicColors.colorSpec.surfaceContainerLowest();
    }
    surfaceContainerLow() {
      return _MaterialDynamicColors.colorSpec.surfaceContainerLow();
    }
    surfaceContainer() {
      return _MaterialDynamicColors.colorSpec.surfaceContainer();
    }
    surfaceContainerHigh() {
      return _MaterialDynamicColors.colorSpec.surfaceContainerHigh();
    }
    surfaceContainerHighest() {
      return _MaterialDynamicColors.colorSpec.surfaceContainerHighest();
    }
    onSurface() {
      return _MaterialDynamicColors.colorSpec.onSurface();
    }
    surfaceVariant() {
      return _MaterialDynamicColors.colorSpec.surfaceVariant();
    }
    onSurfaceVariant() {
      return _MaterialDynamicColors.colorSpec.onSurfaceVariant();
    }
    outline() {
      return _MaterialDynamicColors.colorSpec.outline();
    }
    outlineVariant() {
      return _MaterialDynamicColors.colorSpec.outlineVariant();
    }
    inverseSurface() {
      return _MaterialDynamicColors.colorSpec.inverseSurface();
    }
    inverseOnSurface() {
      return _MaterialDynamicColors.colorSpec.inverseOnSurface();
    }
    shadow() {
      return _MaterialDynamicColors.colorSpec.shadow();
    }
    scrim() {
      return _MaterialDynamicColors.colorSpec.scrim();
    }
    surfaceTint() {
      return _MaterialDynamicColors.colorSpec.surfaceTint();
    }
    ////////////////////////////////////////////////////////////////
    // Primaries [P]                                              //
    ////////////////////////////////////////////////////////////////
    primary() {
      return _MaterialDynamicColors.colorSpec.primary();
    }
    primaryDim() {
      return _MaterialDynamicColors.colorSpec.primaryDim();
    }
    onPrimary() {
      return _MaterialDynamicColors.colorSpec.onPrimary();
    }
    primaryContainer() {
      return _MaterialDynamicColors.colorSpec.primaryContainer();
    }
    onPrimaryContainer() {
      return _MaterialDynamicColors.colorSpec.onPrimaryContainer();
    }
    inversePrimary() {
      return _MaterialDynamicColors.colorSpec.inversePrimary();
    }
    /////////////////////////////////////////////////////////////////
    // Primary Fixed [PF]                                          //
    /////////////////////////////////////////////////////////////////
    primaryFixed() {
      return _MaterialDynamicColors.colorSpec.primaryFixed();
    }
    primaryFixedDim() {
      return _MaterialDynamicColors.colorSpec.primaryFixedDim();
    }
    onPrimaryFixed() {
      return _MaterialDynamicColors.colorSpec.onPrimaryFixed();
    }
    onPrimaryFixedVariant() {
      return _MaterialDynamicColors.colorSpec.onPrimaryFixedVariant();
    }
    ////////////////////////////////////////////////////////////////
    // Secondaries [Q]                                            //
    ////////////////////////////////////////////////////////////////
    secondary() {
      return _MaterialDynamicColors.colorSpec.secondary();
    }
    secondaryDim() {
      return _MaterialDynamicColors.colorSpec.secondaryDim();
    }
    onSecondary() {
      return _MaterialDynamicColors.colorSpec.onSecondary();
    }
    secondaryContainer() {
      return _MaterialDynamicColors.colorSpec.secondaryContainer();
    }
    onSecondaryContainer() {
      return _MaterialDynamicColors.colorSpec.onSecondaryContainer();
    }
    /////////////////////////////////////////////////////////////////
    // Secondary Fixed [QF]                                        //
    /////////////////////////////////////////////////////////////////
    secondaryFixed() {
      return _MaterialDynamicColors.colorSpec.secondaryFixed();
    }
    secondaryFixedDim() {
      return _MaterialDynamicColors.colorSpec.secondaryFixedDim();
    }
    onSecondaryFixed() {
      return _MaterialDynamicColors.colorSpec.onSecondaryFixed();
    }
    onSecondaryFixedVariant() {
      return _MaterialDynamicColors.colorSpec.onSecondaryFixedVariant();
    }
    ////////////////////////////////////////////////////////////////
    // Tertiaries [T]                                             //
    ////////////////////////////////////////////////////////////////
    tertiary() {
      return _MaterialDynamicColors.colorSpec.tertiary();
    }
    tertiaryDim() {
      return _MaterialDynamicColors.colorSpec.tertiaryDim();
    }
    onTertiary() {
      return _MaterialDynamicColors.colorSpec.onTertiary();
    }
    tertiaryContainer() {
      return _MaterialDynamicColors.colorSpec.tertiaryContainer();
    }
    onTertiaryContainer() {
      return _MaterialDynamicColors.colorSpec.onTertiaryContainer();
    }
    /////////////////////////////////////////////////////////////////
    // Tertiary Fixed [TF]                                         //
    /////////////////////////////////////////////////////////////////
    tertiaryFixed() {
      return _MaterialDynamicColors.colorSpec.tertiaryFixed();
    }
    tertiaryFixedDim() {
      return _MaterialDynamicColors.colorSpec.tertiaryFixedDim();
    }
    onTertiaryFixed() {
      return _MaterialDynamicColors.colorSpec.onTertiaryFixed();
    }
    onTertiaryFixedVariant() {
      return _MaterialDynamicColors.colorSpec.onTertiaryFixedVariant();
    }
    ////////////////////////////////////////////////////////////////
    // Errors [E]                                                 //
    ////////////////////////////////////////////////////////////////
    error() {
      return _MaterialDynamicColors.colorSpec.error();
    }
    errorDim() {
      return _MaterialDynamicColors.colorSpec.errorDim();
    }
    onError() {
      return _MaterialDynamicColors.colorSpec.onError();
    }
    errorContainer() {
      return _MaterialDynamicColors.colorSpec.errorContainer();
    }
    onErrorContainer() {
      return _MaterialDynamicColors.colorSpec.onErrorContainer();
    }
    // Static variables are deprecated. Use the instance methods to get correct
    // specs based on request.
    /** @deprecated Use highestSurface() instead. */
    static highestSurface(s) {
      return _MaterialDynamicColors.colorSpec.highestSurface(s);
    }
  };
  MaterialDynamicColors.contentAccentToneDelta = 15;
  MaterialDynamicColors.colorSpec = new ColorSpecDelegateImpl2025();
  MaterialDynamicColors.primaryPaletteKeyColor = MaterialDynamicColors.colorSpec.primaryPaletteKeyColor();
  MaterialDynamicColors.secondaryPaletteKeyColor = MaterialDynamicColors.colorSpec.secondaryPaletteKeyColor();
  MaterialDynamicColors.tertiaryPaletteKeyColor = MaterialDynamicColors.colorSpec.tertiaryPaletteKeyColor();
  MaterialDynamicColors.neutralPaletteKeyColor = MaterialDynamicColors.colorSpec.neutralPaletteKeyColor();
  MaterialDynamicColors.neutralVariantPaletteKeyColor = MaterialDynamicColors.colorSpec.neutralVariantPaletteKeyColor();
  MaterialDynamicColors.background = MaterialDynamicColors.colorSpec.background();
  MaterialDynamicColors.onBackground = MaterialDynamicColors.colorSpec.onBackground();
  MaterialDynamicColors.surface = MaterialDynamicColors.colorSpec.surface();
  MaterialDynamicColors.surfaceDim = MaterialDynamicColors.colorSpec.surfaceDim();
  MaterialDynamicColors.surfaceBright = MaterialDynamicColors.colorSpec.surfaceBright();
  MaterialDynamicColors.surfaceContainerLowest = MaterialDynamicColors.colorSpec.surfaceContainerLowest();
  MaterialDynamicColors.surfaceContainerLow = MaterialDynamicColors.colorSpec.surfaceContainerLow();
  MaterialDynamicColors.surfaceContainer = MaterialDynamicColors.colorSpec.surfaceContainer();
  MaterialDynamicColors.surfaceContainerHigh = MaterialDynamicColors.colorSpec.surfaceContainerHigh();
  MaterialDynamicColors.surfaceContainerHighest = MaterialDynamicColors.colorSpec.surfaceContainerHighest();
  MaterialDynamicColors.onSurface = MaterialDynamicColors.colorSpec.onSurface();
  MaterialDynamicColors.surfaceVariant = MaterialDynamicColors.colorSpec.surfaceVariant();
  MaterialDynamicColors.onSurfaceVariant = MaterialDynamicColors.colorSpec.onSurfaceVariant();
  MaterialDynamicColors.inverseSurface = MaterialDynamicColors.colorSpec.inverseSurface();
  MaterialDynamicColors.inverseOnSurface = MaterialDynamicColors.colorSpec.inverseOnSurface();
  MaterialDynamicColors.outline = MaterialDynamicColors.colorSpec.outline();
  MaterialDynamicColors.outlineVariant = MaterialDynamicColors.colorSpec.outlineVariant();
  MaterialDynamicColors.shadow = MaterialDynamicColors.colorSpec.shadow();
  MaterialDynamicColors.scrim = MaterialDynamicColors.colorSpec.scrim();
  MaterialDynamicColors.surfaceTint = MaterialDynamicColors.colorSpec.surfaceTint();
  MaterialDynamicColors.primary = MaterialDynamicColors.colorSpec.primary();
  MaterialDynamicColors.onPrimary = MaterialDynamicColors.colorSpec.onPrimary();
  MaterialDynamicColors.primaryContainer = MaterialDynamicColors.colorSpec.primaryContainer();
  MaterialDynamicColors.onPrimaryContainer = MaterialDynamicColors.colorSpec.onPrimaryContainer();
  MaterialDynamicColors.inversePrimary = MaterialDynamicColors.colorSpec.inversePrimary();
  MaterialDynamicColors.secondary = MaterialDynamicColors.colorSpec.secondary();
  MaterialDynamicColors.onSecondary = MaterialDynamicColors.colorSpec.onSecondary();
  MaterialDynamicColors.secondaryContainer = MaterialDynamicColors.colorSpec.secondaryContainer();
  MaterialDynamicColors.onSecondaryContainer = MaterialDynamicColors.colorSpec.onSecondaryContainer();
  MaterialDynamicColors.tertiary = MaterialDynamicColors.colorSpec.tertiary();
  MaterialDynamicColors.onTertiary = MaterialDynamicColors.colorSpec.onTertiary();
  MaterialDynamicColors.tertiaryContainer = MaterialDynamicColors.colorSpec.tertiaryContainer();
  MaterialDynamicColors.onTertiaryContainer = MaterialDynamicColors.colorSpec.onTertiaryContainer();
  MaterialDynamicColors.error = MaterialDynamicColors.colorSpec.error();
  MaterialDynamicColors.onError = MaterialDynamicColors.colorSpec.onError();
  MaterialDynamicColors.errorContainer = MaterialDynamicColors.colorSpec.errorContainer();
  MaterialDynamicColors.onErrorContainer = MaterialDynamicColors.colorSpec.onErrorContainer();
  MaterialDynamicColors.primaryFixed = MaterialDynamicColors.colorSpec.primaryFixed();
  MaterialDynamicColors.primaryFixedDim = MaterialDynamicColors.colorSpec.primaryFixedDim();
  MaterialDynamicColors.onPrimaryFixed = MaterialDynamicColors.colorSpec.onPrimaryFixed();
  MaterialDynamicColors.onPrimaryFixedVariant = MaterialDynamicColors.colorSpec.onPrimaryFixedVariant();
  MaterialDynamicColors.secondaryFixed = MaterialDynamicColors.colorSpec.secondaryFixed();
  MaterialDynamicColors.secondaryFixedDim = MaterialDynamicColors.colorSpec.secondaryFixedDim();
  MaterialDynamicColors.onSecondaryFixed = MaterialDynamicColors.colorSpec.onSecondaryFixed();
  MaterialDynamicColors.onSecondaryFixedVariant = MaterialDynamicColors.colorSpec.onSecondaryFixedVariant();
  MaterialDynamicColors.tertiaryFixed = MaterialDynamicColors.colorSpec.tertiaryFixed();
  MaterialDynamicColors.tertiaryFixedDim = MaterialDynamicColors.colorSpec.tertiaryFixedDim();
  MaterialDynamicColors.onTertiaryFixed = MaterialDynamicColors.colorSpec.onTertiaryFixed();
  MaterialDynamicColors.onTertiaryFixedVariant = MaterialDynamicColors.colorSpec.onTertiaryFixedVariant();

  // node_modules/@material/material-color-utilities/dynamiccolor/dynamic_scheme.js
  var DynamicScheme = class _DynamicScheme {
    static maybeFallbackSpecVersion(specVersion, variant) {
      switch (variant) {
        case Variant.EXPRESSIVE:
        case Variant.VIBRANT:
        case Variant.TONAL_SPOT:
        case Variant.NEUTRAL:
          return specVersion;
        default:
          return "2021";
      }
    }
    constructor(args) {
      this.sourceColorArgb = args.sourceColorHct.toInt();
      this.variant = args.variant;
      this.contrastLevel = args.contrastLevel;
      this.isDark = args.isDark;
      this.platform = args.platform ?? "phone";
      this.specVersion = _DynamicScheme.maybeFallbackSpecVersion(args.specVersion ?? "2021", this.variant);
      this.sourceColorHct = args.sourceColorHct;
      this.primaryPalette = args.primaryPalette ?? getSpec2(this.specVersion).getPrimaryPalette(this.variant, args.sourceColorHct, this.isDark, this.platform, this.contrastLevel);
      this.secondaryPalette = args.secondaryPalette ?? getSpec2(this.specVersion).getSecondaryPalette(this.variant, args.sourceColorHct, this.isDark, this.platform, this.contrastLevel);
      this.tertiaryPalette = args.tertiaryPalette ?? getSpec2(this.specVersion).getTertiaryPalette(this.variant, args.sourceColorHct, this.isDark, this.platform, this.contrastLevel);
      this.neutralPalette = args.neutralPalette ?? getSpec2(this.specVersion).getNeutralPalette(this.variant, args.sourceColorHct, this.isDark, this.platform, this.contrastLevel);
      this.neutralVariantPalette = args.neutralVariantPalette ?? getSpec2(this.specVersion).getNeutralVariantPalette(this.variant, args.sourceColorHct, this.isDark, this.platform, this.contrastLevel);
      this.errorPalette = args.errorPalette ?? getSpec2(this.specVersion).getErrorPalette(this.variant, args.sourceColorHct, this.isDark, this.platform, this.contrastLevel) ?? TonalPalette.fromHueAndChroma(25, 84);
      this.colors = new MaterialDynamicColors();
    }
    toString() {
      return `Scheme: variant=${Variant[this.variant]}, mode=${this.isDark ? "dark" : "light"}, platform=${this.platform}, contrastLevel=${this.contrastLevel.toFixed(1)}, seed=${this.sourceColorHct.toString()}, specVersion=${this.specVersion}`;
    }
    /**
     * Returns a new hue based on a piecewise function and input color hue.
     *
     * For example, for the following function:
     * result = 26 if 0 <= hue < 101
     * result = 39 if 101 <= hue < 210
     * result = 28 if 210 <= hue < 360
     *
     * call the function as:
     *
     * const hueBreakpoints = [0, 101, 210, 360];
     * const hues = [26, 39, 28];
     * const result = scheme.piecewise(hue, hueBreakpoints, hues);
     *
     * @param sourceColorHct The input value.
     * @param hueBreakpoints The breakpoints, in sorted order. No default lower or
     *     upper bounds are assumed.
     * @param hues The hues that should be applied when source color's hue is >=
     *     the same index in hueBrakpoints array, and < the hue at the next index
     *     in hueBrakpoints array. Otherwise, the source color's hue is returned.
     */
    static getPiecewiseHue(sourceColorHct, hueBreakpoints, hues) {
      const size = Math.min(hueBreakpoints.length - 1, hues.length);
      const sourceHue = sourceColorHct.hue;
      for (let i = 0; i < size; i++) {
        if (sourceHue >= hueBreakpoints[i] && sourceHue < hueBreakpoints[i + 1]) {
          return sanitizeDegreesDouble(hues[i]);
        }
      }
      return sourceHue;
    }
    /**
     * Returns a shifted hue based on a piecewise function and input color hue.
     *
     * For example, for the following function:
     * result = hue + 26 if 0 <= hue < 101
     * result = hue - 39 if 101 <= hue < 210
     * result = hue + 28 if 210 <= hue < 360
     *
     * call the function as:
     *
     * const hueBreakpoints = [0, 101, 210, 360];
     * const hues = [26, -39, 28];
     * const result = scheme.getRotatedHue(hue, hueBreakpoints, hues);
     *
     * @param sourceColorHct the source color of the theme, in HCT.
     * @param hueBreakpoints The "breakpoints", i.e. the hues at which a rotation
     *     should be apply. No default lower or upper bounds are assumed.
     * @param rotations The rotation that should be applied when source color's
     *     hue is >= the same index in hues array, and < the hue at the next
     *     index in hues array. Otherwise, the source color's hue is returned.
     */
    static getRotatedHue(sourceColorHct, hueBreakpoints, rotations) {
      let rotation = _DynamicScheme.getPiecewiseHue(sourceColorHct, hueBreakpoints, rotations);
      if (Math.min(hueBreakpoints.length - 1, rotations.length) <= 0) {
        rotation = 0;
      }
      return sanitizeDegreesDouble(sourceColorHct.hue + rotation);
    }
    getArgb(dynamicColor) {
      return dynamicColor.getArgb(this);
    }
    getHct(dynamicColor) {
      return dynamicColor.getHct(this);
    }
    // Palette key colors
    get primaryPaletteKeyColor() {
      return this.getArgb(this.colors.primaryPaletteKeyColor());
    }
    get secondaryPaletteKeyColor() {
      return this.getArgb(this.colors.secondaryPaletteKeyColor());
    }
    get tertiaryPaletteKeyColor() {
      return this.getArgb(this.colors.tertiaryPaletteKeyColor());
    }
    get neutralPaletteKeyColor() {
      return this.getArgb(this.colors.neutralPaletteKeyColor());
    }
    get neutralVariantPaletteKeyColor() {
      return this.getArgb(this.colors.neutralVariantPaletteKeyColor());
    }
    get errorPaletteKeyColor() {
      return this.getArgb(this.colors.errorPaletteKeyColor());
    }
    // Surface colors
    get background() {
      return this.getArgb(this.colors.background());
    }
    get onBackground() {
      return this.getArgb(this.colors.onBackground());
    }
    get surface() {
      return this.getArgb(this.colors.surface());
    }
    get surfaceDim() {
      return this.getArgb(this.colors.surfaceDim());
    }
    get surfaceBright() {
      return this.getArgb(this.colors.surfaceBright());
    }
    get surfaceContainerLowest() {
      return this.getArgb(this.colors.surfaceContainerLowest());
    }
    get surfaceContainerLow() {
      return this.getArgb(this.colors.surfaceContainerLow());
    }
    get surfaceContainer() {
      return this.getArgb(this.colors.surfaceContainer());
    }
    get surfaceContainerHigh() {
      return this.getArgb(this.colors.surfaceContainerHigh());
    }
    get surfaceContainerHighest() {
      return this.getArgb(this.colors.surfaceContainerHighest());
    }
    get onSurface() {
      return this.getArgb(this.colors.onSurface());
    }
    get surfaceVariant() {
      return this.getArgb(this.colors.surfaceVariant());
    }
    get onSurfaceVariant() {
      return this.getArgb(this.colors.onSurfaceVariant());
    }
    get inverseSurface() {
      return this.getArgb(this.colors.inverseSurface());
    }
    get inverseOnSurface() {
      return this.getArgb(this.colors.inverseOnSurface());
    }
    get outline() {
      return this.getArgb(this.colors.outline());
    }
    get outlineVariant() {
      return this.getArgb(this.colors.outlineVariant());
    }
    get shadow() {
      return this.getArgb(this.colors.shadow());
    }
    get scrim() {
      return this.getArgb(this.colors.scrim());
    }
    get surfaceTint() {
      return this.getArgb(this.colors.surfaceTint());
    }
    // Primary colors
    get primary() {
      return this.getArgb(this.colors.primary());
    }
    get primaryDim() {
      const primaryDim = this.colors.primaryDim();
      if (primaryDim === void 0) {
        throw new Error("`primaryDim` color is undefined prior to 2025 spec.");
      }
      return this.getArgb(primaryDim);
    }
    get onPrimary() {
      return this.getArgb(this.colors.onPrimary());
    }
    get primaryContainer() {
      return this.getArgb(this.colors.primaryContainer());
    }
    get onPrimaryContainer() {
      return this.getArgb(this.colors.onPrimaryContainer());
    }
    get primaryFixed() {
      return this.getArgb(this.colors.primaryFixed());
    }
    get primaryFixedDim() {
      return this.getArgb(this.colors.primaryFixedDim());
    }
    get onPrimaryFixed() {
      return this.getArgb(this.colors.onPrimaryFixed());
    }
    get onPrimaryFixedVariant() {
      return this.getArgb(this.colors.onPrimaryFixedVariant());
    }
    get inversePrimary() {
      return this.getArgb(this.colors.inversePrimary());
    }
    // Secondary colors
    get secondary() {
      return this.getArgb(this.colors.secondary());
    }
    get secondaryDim() {
      const secondaryDim = this.colors.secondaryDim();
      if (secondaryDim === void 0) {
        throw new Error("`secondaryDim` color is undefined prior to 2025 spec.");
      }
      return this.getArgb(secondaryDim);
    }
    get onSecondary() {
      return this.getArgb(this.colors.onSecondary());
    }
    get secondaryContainer() {
      return this.getArgb(this.colors.secondaryContainer());
    }
    get onSecondaryContainer() {
      return this.getArgb(this.colors.onSecondaryContainer());
    }
    get secondaryFixed() {
      return this.getArgb(this.colors.secondaryFixed());
    }
    get secondaryFixedDim() {
      return this.getArgb(this.colors.secondaryFixedDim());
    }
    get onSecondaryFixed() {
      return this.getArgb(this.colors.onSecondaryFixed());
    }
    get onSecondaryFixedVariant() {
      return this.getArgb(this.colors.onSecondaryFixedVariant());
    }
    // Tertiary colors
    get tertiary() {
      return this.getArgb(this.colors.tertiary());
    }
    get tertiaryDim() {
      const tertiaryDim = this.colors.tertiaryDim();
      if (tertiaryDim === void 0) {
        throw new Error("`tertiaryDim` color is undefined prior to 2025 spec.");
      }
      return this.getArgb(tertiaryDim);
    }
    get onTertiary() {
      return this.getArgb(this.colors.onTertiary());
    }
    get tertiaryContainer() {
      return this.getArgb(this.colors.tertiaryContainer());
    }
    get onTertiaryContainer() {
      return this.getArgb(this.colors.onTertiaryContainer());
    }
    get tertiaryFixed() {
      return this.getArgb(this.colors.tertiaryFixed());
    }
    get tertiaryFixedDim() {
      return this.getArgb(this.colors.tertiaryFixedDim());
    }
    get onTertiaryFixed() {
      return this.getArgb(this.colors.onTertiaryFixed());
    }
    get onTertiaryFixedVariant() {
      return this.getArgb(this.colors.onTertiaryFixedVariant());
    }
    // Error colors
    get error() {
      return this.getArgb(this.colors.error());
    }
    get errorDim() {
      const errorDim = this.colors.errorDim();
      if (errorDim === void 0) {
        throw new Error("`errorDim` color is undefined prior to 2025 spec.");
      }
      return this.getArgb(errorDim);
    }
    get onError() {
      return this.getArgb(this.colors.onError());
    }
    get errorContainer() {
      return this.getArgb(this.colors.errorContainer());
    }
    get onErrorContainer() {
      return this.getArgb(this.colors.onErrorContainer());
    }
  };
  DynamicScheme.DEFAULT_SPEC_VERSION = "2021";
  DynamicScheme.DEFAULT_PLATFORM = "phone";
  var DynamicSchemePalettesDelegateImpl2021 = class {
    //////////////////////////////////////////////////////////////////
    // Scheme Palettes                                              //
    //////////////////////////////////////////////////////////////////
    getPrimaryPalette(variant, sourceColorHct, isDark, platform, contrastLevel) {
      switch (variant) {
        case Variant.CONTENT:
        case Variant.FIDELITY:
          return TonalPalette.fromHueAndChroma(sourceColorHct.hue, sourceColorHct.chroma);
        case Variant.FRUIT_SALAD:
          return TonalPalette.fromHueAndChroma(sanitizeDegreesDouble(sourceColorHct.hue - 50), 48);
        case Variant.MONOCHROME:
          return TonalPalette.fromHueAndChroma(sourceColorHct.hue, 0);
        case Variant.NEUTRAL:
          return TonalPalette.fromHueAndChroma(sourceColorHct.hue, 12);
        case Variant.RAINBOW:
          return TonalPalette.fromHueAndChroma(sourceColorHct.hue, 48);
        case Variant.TONAL_SPOT:
          return TonalPalette.fromHueAndChroma(sourceColorHct.hue, 36);
        case Variant.EXPRESSIVE:
          return TonalPalette.fromHueAndChroma(sanitizeDegreesDouble(sourceColorHct.hue + 240), 40);
        case Variant.VIBRANT:
          return TonalPalette.fromHueAndChroma(sourceColorHct.hue, 200);
        default:
          throw new Error(`Unsupported variant: ${variant}`);
      }
    }
    getSecondaryPalette(variant, sourceColorHct, isDark, platform, contrastLevel) {
      switch (variant) {
        case Variant.CONTENT:
        case Variant.FIDELITY:
          return TonalPalette.fromHueAndChroma(sourceColorHct.hue, Math.max(sourceColorHct.chroma - 32, sourceColorHct.chroma * 0.5));
        case Variant.FRUIT_SALAD:
          return TonalPalette.fromHueAndChroma(sanitizeDegreesDouble(sourceColorHct.hue - 50), 36);
        case Variant.MONOCHROME:
          return TonalPalette.fromHueAndChroma(sourceColorHct.hue, 0);
        case Variant.NEUTRAL:
          return TonalPalette.fromHueAndChroma(sourceColorHct.hue, 8);
        case Variant.RAINBOW:
          return TonalPalette.fromHueAndChroma(sourceColorHct.hue, 16);
        case Variant.TONAL_SPOT:
          return TonalPalette.fromHueAndChroma(sourceColorHct.hue, 16);
        case Variant.EXPRESSIVE:
          return TonalPalette.fromHueAndChroma(DynamicScheme.getRotatedHue(sourceColorHct, [0, 21, 51, 121, 151, 191, 271, 321, 360], [45, 95, 45, 20, 45, 90, 45, 45, 45]), 24);
        case Variant.VIBRANT:
          return TonalPalette.fromHueAndChroma(DynamicScheme.getRotatedHue(sourceColorHct, [0, 41, 61, 101, 131, 181, 251, 301, 360], [18, 15, 10, 12, 15, 18, 15, 12, 12]), 24);
        default:
          throw new Error(`Unsupported variant: ${variant}`);
      }
    }
    getTertiaryPalette(variant, sourceColorHct, isDark, platform, contrastLevel) {
      switch (variant) {
        case Variant.CONTENT:
          return TonalPalette.fromHct(DislikeAnalyzer.fixIfDisliked(new TemperatureCache(sourceColorHct).analogous(
            /* count= */
            3,
            /* divisions= */
            6
          )[2]));
        case Variant.FIDELITY:
          return TonalPalette.fromHct(DislikeAnalyzer.fixIfDisliked(new TemperatureCache(sourceColorHct).complement));
        case Variant.FRUIT_SALAD:
          return TonalPalette.fromHueAndChroma(sourceColorHct.hue, 36);
        case Variant.MONOCHROME:
          return TonalPalette.fromHueAndChroma(sourceColorHct.hue, 0);
        case Variant.NEUTRAL:
          return TonalPalette.fromHueAndChroma(sourceColorHct.hue, 16);
        case Variant.RAINBOW:
        case Variant.TONAL_SPOT:
          return TonalPalette.fromHueAndChroma(sanitizeDegreesDouble(sourceColorHct.hue + 60), 24);
        case Variant.EXPRESSIVE:
          return TonalPalette.fromHueAndChroma(DynamicScheme.getRotatedHue(sourceColorHct, [0, 21, 51, 121, 151, 191, 271, 321, 360], [120, 120, 20, 45, 20, 15, 20, 120, 120]), 32);
        case Variant.VIBRANT:
          return TonalPalette.fromHueAndChroma(DynamicScheme.getRotatedHue(sourceColorHct, [0, 41, 61, 101, 131, 181, 251, 301, 360], [35, 30, 20, 25, 30, 35, 30, 25, 25]), 32);
        default:
          throw new Error(`Unsupported variant: ${variant}`);
      }
    }
    getNeutralPalette(variant, sourceColorHct, isDark, platform, contrastLevel) {
      switch (variant) {
        case Variant.CONTENT:
        case Variant.FIDELITY:
          return TonalPalette.fromHueAndChroma(sourceColorHct.hue, sourceColorHct.chroma / 8);
        case Variant.FRUIT_SALAD:
          return TonalPalette.fromHueAndChroma(sourceColorHct.hue, 10);
        case Variant.MONOCHROME:
          return TonalPalette.fromHueAndChroma(sourceColorHct.hue, 0);
        case Variant.NEUTRAL:
          return TonalPalette.fromHueAndChroma(sourceColorHct.hue, 2);
        case Variant.RAINBOW:
          return TonalPalette.fromHueAndChroma(sourceColorHct.hue, 0);
        case Variant.TONAL_SPOT:
          return TonalPalette.fromHueAndChroma(sourceColorHct.hue, 6);
        case Variant.EXPRESSIVE:
          return TonalPalette.fromHueAndChroma(sanitizeDegreesDouble(sourceColorHct.hue + 15), 8);
        case Variant.VIBRANT:
          return TonalPalette.fromHueAndChroma(sourceColorHct.hue, 10);
        default:
          throw new Error(`Unsupported variant: ${variant}`);
      }
    }
    getNeutralVariantPalette(variant, sourceColorHct, isDark, platform, contrastLevel) {
      switch (variant) {
        case Variant.CONTENT:
          return TonalPalette.fromHueAndChroma(sourceColorHct.hue, sourceColorHct.chroma / 8 + 4);
        case Variant.FIDELITY:
          return TonalPalette.fromHueAndChroma(sourceColorHct.hue, sourceColorHct.chroma / 8 + 4);
        case Variant.FRUIT_SALAD:
          return TonalPalette.fromHueAndChroma(sourceColorHct.hue, 16);
        case Variant.MONOCHROME:
          return TonalPalette.fromHueAndChroma(sourceColorHct.hue, 0);
        case Variant.NEUTRAL:
          return TonalPalette.fromHueAndChroma(sourceColorHct.hue, 2);
        case Variant.RAINBOW:
          return TonalPalette.fromHueAndChroma(sourceColorHct.hue, 0);
        case Variant.TONAL_SPOT:
          return TonalPalette.fromHueAndChroma(sourceColorHct.hue, 8);
        case Variant.EXPRESSIVE:
          return TonalPalette.fromHueAndChroma(sanitizeDegreesDouble(sourceColorHct.hue + 15), 12);
        case Variant.VIBRANT:
          return TonalPalette.fromHueAndChroma(sourceColorHct.hue, 12);
        default:
          throw new Error(`Unsupported variant: ${variant}`);
      }
    }
    getErrorPalette(variant, sourceColorHct, isDark, platform, contrastLevel) {
      return void 0;
    }
  };
  var DynamicSchemePalettesDelegateImpl2025 = class _DynamicSchemePalettesDelegateImpl2025 extends DynamicSchemePalettesDelegateImpl2021 {
    //////////////////////////////////////////////////////////////////
    // Scheme Palettes                                              //
    //////////////////////////////////////////////////////////////////
    getPrimaryPalette(variant, sourceColorHct, isDark, platform, contrastLevel) {
      switch (variant) {
        case Variant.NEUTRAL:
          return TonalPalette.fromHueAndChroma(sourceColorHct.hue, platform === "phone" ? Hct.isBlue(sourceColorHct.hue) ? 12 : 8 : Hct.isBlue(sourceColorHct.hue) ? 16 : 12);
        case Variant.TONAL_SPOT:
          return TonalPalette.fromHueAndChroma(sourceColorHct.hue, platform === "phone" && isDark ? 26 : 32);
        case Variant.EXPRESSIVE:
          return TonalPalette.fromHueAndChroma(sourceColorHct.hue, platform === "phone" ? isDark ? 36 : 48 : 40);
        case Variant.VIBRANT:
          return TonalPalette.fromHueAndChroma(sourceColorHct.hue, platform === "phone" ? 74 : 56);
        default:
          return super.getPrimaryPalette(variant, sourceColorHct, isDark, platform, contrastLevel);
      }
    }
    getSecondaryPalette(variant, sourceColorHct, isDark, platform, contrastLevel) {
      switch (variant) {
        case Variant.NEUTRAL:
          return TonalPalette.fromHueAndChroma(sourceColorHct.hue, platform === "phone" ? Hct.isBlue(sourceColorHct.hue) ? 6 : 4 : Hct.isBlue(sourceColorHct.hue) ? 10 : 6);
        case Variant.TONAL_SPOT:
          return TonalPalette.fromHueAndChroma(sourceColorHct.hue, 16);
        case Variant.EXPRESSIVE:
          return TonalPalette.fromHueAndChroma(DynamicScheme.getRotatedHue(sourceColorHct, [0, 105, 140, 204, 253, 278, 300, 333, 360], [-160, 155, -100, 96, -96, -156, -165, -160]), platform === "phone" ? isDark ? 16 : 24 : 24);
        case Variant.VIBRANT:
          return TonalPalette.fromHueAndChroma(DynamicScheme.getRotatedHue(sourceColorHct, [0, 38, 105, 140, 333, 360], [-14, 10, -14, 10, -14]), platform === "phone" ? 56 : 36);
        default:
          return super.getSecondaryPalette(variant, sourceColorHct, isDark, platform, contrastLevel);
      }
    }
    getTertiaryPalette(variant, sourceColorHct, isDark, platform, contrastLevel) {
      switch (variant) {
        case Variant.NEUTRAL:
          return TonalPalette.fromHueAndChroma(DynamicScheme.getRotatedHue(sourceColorHct, [0, 38, 105, 161, 204, 278, 333, 360], [-32, 26, 10, -39, 24, -15, -32]), platform === "phone" ? 20 : 36);
        case Variant.TONAL_SPOT:
          return TonalPalette.fromHueAndChroma(DynamicScheme.getRotatedHue(sourceColorHct, [0, 20, 71, 161, 333, 360], [-40, 48, -32, 40, -32]), platform === "phone" ? 28 : 32);
        case Variant.EXPRESSIVE:
          return TonalPalette.fromHueAndChroma(DynamicScheme.getRotatedHue(sourceColorHct, [0, 105, 140, 204, 253, 278, 300, 333, 360], [-165, 160, -105, 101, -101, -160, -170, -165]), 48);
        case Variant.VIBRANT:
          return TonalPalette.fromHueAndChroma(DynamicScheme.getRotatedHue(sourceColorHct, [0, 38, 71, 105, 140, 161, 253, 333, 360], [-72, 35, 24, -24, 62, 50, 62, -72]), 56);
        default:
          return super.getTertiaryPalette(variant, sourceColorHct, isDark, platform, contrastLevel);
      }
    }
    static getExpressiveNeutralHue(sourceColorHct) {
      const hue = DynamicScheme.getRotatedHue(sourceColorHct, [0, 71, 124, 253, 278, 300, 360], [10, 0, 10, 0, 10, 0]);
      return hue;
    }
    static getExpressiveNeutralChroma(sourceColorHct, isDark, platform) {
      const neutralHue = _DynamicSchemePalettesDelegateImpl2025.getExpressiveNeutralHue(sourceColorHct);
      return platform === "phone" ? isDark ? Hct.isYellow(neutralHue) ? 6 : 14 : 18 : 12;
    }
    static getVibrantNeutralHue(sourceColorHct) {
      return DynamicScheme.getRotatedHue(sourceColorHct, [0, 38, 105, 140, 333, 360], [-14, 10, -14, 10, -14]);
    }
    static getVibrantNeutralChroma(sourceColorHct, platform) {
      const neutralHue = _DynamicSchemePalettesDelegateImpl2025.getVibrantNeutralHue(sourceColorHct);
      return platform === "phone" ? 28 : Hct.isBlue(neutralHue) ? 28 : 20;
    }
    getNeutralPalette(variant, sourceColorHct, isDark, platform, contrastLevel) {
      switch (variant) {
        case Variant.NEUTRAL:
          return TonalPalette.fromHueAndChroma(sourceColorHct.hue, platform === "phone" ? 1.4 : 6);
        case Variant.TONAL_SPOT:
          return TonalPalette.fromHueAndChroma(sourceColorHct.hue, platform === "phone" ? 5 : 10);
        case Variant.EXPRESSIVE:
          return TonalPalette.fromHueAndChroma(_DynamicSchemePalettesDelegateImpl2025.getExpressiveNeutralHue(sourceColorHct), _DynamicSchemePalettesDelegateImpl2025.getExpressiveNeutralChroma(sourceColorHct, isDark, platform));
        case Variant.VIBRANT:
          return TonalPalette.fromHueAndChroma(_DynamicSchemePalettesDelegateImpl2025.getVibrantNeutralHue(sourceColorHct), _DynamicSchemePalettesDelegateImpl2025.getVibrantNeutralChroma(sourceColorHct, platform));
        default:
          return super.getNeutralPalette(variant, sourceColorHct, isDark, platform, contrastLevel);
      }
    }
    getNeutralVariantPalette(variant, sourceColorHct, isDark, platform, contrastLevel) {
      switch (variant) {
        case Variant.NEUTRAL:
          return TonalPalette.fromHueAndChroma(sourceColorHct.hue, (platform === "phone" ? 1.4 : 6) * 2.2);
        case Variant.TONAL_SPOT:
          return TonalPalette.fromHueAndChroma(sourceColorHct.hue, (platform === "phone" ? 5 : 10) * 1.7);
        case Variant.EXPRESSIVE:
          const expressiveNeutralHue = _DynamicSchemePalettesDelegateImpl2025.getExpressiveNeutralHue(sourceColorHct);
          const expressiveNeutralChroma = _DynamicSchemePalettesDelegateImpl2025.getExpressiveNeutralChroma(sourceColorHct, isDark, platform);
          return TonalPalette.fromHueAndChroma(expressiveNeutralHue, expressiveNeutralChroma * (expressiveNeutralHue >= 105 && expressiveNeutralHue < 125 ? 1.6 : 2.3));
        case Variant.VIBRANT:
          const vibrantNeutralHue = _DynamicSchemePalettesDelegateImpl2025.getVibrantNeutralHue(sourceColorHct);
          const vibrantNeutralChroma = _DynamicSchemePalettesDelegateImpl2025.getVibrantNeutralChroma(sourceColorHct, platform);
          return TonalPalette.fromHueAndChroma(vibrantNeutralHue, vibrantNeutralChroma * 1.29);
        default:
          return super.getNeutralVariantPalette(variant, sourceColorHct, isDark, platform, contrastLevel);
      }
    }
    getErrorPalette(variant, sourceColorHct, isDark, platform, contrastLevel) {
      const errorHue = DynamicScheme.getPiecewiseHue(sourceColorHct, [0, 3, 13, 23, 33, 43, 153, 273, 360], [12, 22, 32, 12, 22, 32, 22, 12]);
      switch (variant) {
        case Variant.NEUTRAL:
          return TonalPalette.fromHueAndChroma(errorHue, platform === "phone" ? 50 : 40);
        case Variant.TONAL_SPOT:
          return TonalPalette.fromHueAndChroma(errorHue, platform === "phone" ? 60 : 48);
        case Variant.EXPRESSIVE:
          return TonalPalette.fromHueAndChroma(errorHue, platform === "phone" ? 64 : 48);
        case Variant.VIBRANT:
          return TonalPalette.fromHueAndChroma(errorHue, platform === "phone" ? 80 : 60);
        default:
          return super.getErrorPalette(variant, sourceColorHct, isDark, platform, contrastLevel);
      }
    }
  };
  var spec20212 = new DynamicSchemePalettesDelegateImpl2021();
  var spec20252 = new DynamicSchemePalettesDelegateImpl2025();
  function getSpec2(specVersion) {
    return specVersion === "2025" ? spec20252 : spec20212;
  }

  // node_modules/@material/material-color-utilities/palettes/core_palette.js
  var CorePalette = class _CorePalette {
    /**
     * @param argb ARGB representation of a color
     *
     * @deprecated Use {@link DynamicScheme} for color scheme generation.
     * Use {@link CorePalettes} for core palettes container class.
     */
    static of(argb) {
      return new _CorePalette(argb, false);
    }
    /**
     * @param argb ARGB representation of a color
     *
     * @deprecated Use {@link DynamicScheme} for color scheme generation.
     * Use {@link CorePalettes} for core palettes container class.
     */
    static contentOf(argb) {
      return new _CorePalette(argb, true);
    }
    /**
     * Create a [CorePalette] from a set of colors
     *
     * @deprecated Use {@link DynamicScheme} for color scheme generation.
     * Use {@link CorePalettes} for core palettes container class.
     */
    static fromColors(colors) {
      return _CorePalette.createPaletteFromColors(false, colors);
    }
    /**
     * Create a content [CorePalette] from a set of colors
     *
     * @deprecated Use {@link DynamicScheme} for color scheme generation.
     * Use {@link CorePalettes} for core palettes container class.
     */
    static contentFromColors(colors) {
      return _CorePalette.createPaletteFromColors(true, colors);
    }
    static createPaletteFromColors(content, colors) {
      const palette = new _CorePalette(colors.primary, content);
      if (colors.secondary) {
        const p = new _CorePalette(colors.secondary, content);
        palette.a2 = p.a1;
      }
      if (colors.tertiary) {
        const p = new _CorePalette(colors.tertiary, content);
        palette.a3 = p.a1;
      }
      if (colors.error) {
        const p = new _CorePalette(colors.error, content);
        palette.error = p.a1;
      }
      if (colors.neutral) {
        const p = new _CorePalette(colors.neutral, content);
        palette.n1 = p.n1;
      }
      if (colors.neutralVariant) {
        const p = new _CorePalette(colors.neutralVariant, content);
        palette.n2 = p.n2;
      }
      return palette;
    }
    constructor(argb, isContent) {
      const hct = Hct.fromInt(argb);
      const hue = hct.hue;
      const chroma = hct.chroma;
      if (isContent) {
        this.a1 = TonalPalette.fromHueAndChroma(hue, chroma);
        this.a2 = TonalPalette.fromHueAndChroma(hue, chroma / 3);
        this.a3 = TonalPalette.fromHueAndChroma(hue + 60, chroma / 2);
        this.n1 = TonalPalette.fromHueAndChroma(hue, Math.min(chroma / 12, 4));
        this.n2 = TonalPalette.fromHueAndChroma(hue, Math.min(chroma / 6, 8));
      } else {
        this.a1 = TonalPalette.fromHueAndChroma(hue, Math.max(48, chroma));
        this.a2 = TonalPalette.fromHueAndChroma(hue, 16);
        this.a3 = TonalPalette.fromHueAndChroma(hue + 60, 24);
        this.n1 = TonalPalette.fromHueAndChroma(hue, 4);
        this.n2 = TonalPalette.fromHueAndChroma(hue, 8);
      }
      this.error = TonalPalette.fromHueAndChroma(25, 84);
    }
  };

  // node_modules/@material/material-color-utilities/quantize/lab_point_provider.js
  var LabPointProvider = class {
    /**
     * Convert a color represented in ARGB to a 3-element array of L*a*b*
     * coordinates of the color.
     */
    fromInt(argb) {
      return labFromArgb(argb);
    }
    /**
     * Convert a 3-element array to a color represented in ARGB.
     */
    toInt(point) {
      return argbFromLab(point[0], point[1], point[2]);
    }
    /**
     * Standard CIE 1976 delta E formula also takes the square root, unneeded
     * here. This method is used by quantization algorithms to compare distance,
     * and the relative ordering is the same, with or without a square root.
     *
     * This relatively minor optimization is helpful because this method is
     * called at least once for each pixel in an image.
     */
    distance(from, to) {
      const dL = from[0] - to[0];
      const dA = from[1] - to[1];
      const dB = from[2] - to[2];
      return dL * dL + dA * dA + dB * dB;
    }
  };

  // node_modules/@material/material-color-utilities/quantize/quantizer_wsmeans.js
  var MAX_ITERATIONS = 10;
  var MIN_MOVEMENT_DISTANCE = 3;
  var QuantizerWsmeans = class {
    /**
     * @param inputPixels Colors in ARGB format.
     * @param startingClusters Defines the initial state of the quantizer. Passing
     *     an empty array is fine, the implementation will create its own initial
     *     state that leads to reproducible results for the same inputs.
     *     Passing an array that is the result of Wu quantization leads to higher
     *     quality results.
     * @param maxColors The number of colors to divide the image into. A lower
     *     number of colors may be returned.
     * @return Colors in ARGB format.
     */
    static quantize(inputPixels, startingClusters, maxColors) {
      const pixelToCount = /* @__PURE__ */ new Map();
      const points = new Array();
      const pixels = new Array();
      const pointProvider = new LabPointProvider();
      let pointCount = 0;
      for (let i = 0; i < inputPixels.length; i++) {
        const inputPixel = inputPixels[i];
        const pixelCount = pixelToCount.get(inputPixel);
        if (pixelCount === void 0) {
          pointCount++;
          points.push(pointProvider.fromInt(inputPixel));
          pixels.push(inputPixel);
          pixelToCount.set(inputPixel, 1);
        } else {
          pixelToCount.set(inputPixel, pixelCount + 1);
        }
      }
      const counts = new Array();
      for (let i = 0; i < pointCount; i++) {
        const pixel = pixels[i];
        const count = pixelToCount.get(pixel);
        if (count !== void 0) {
          counts[i] = count;
        }
      }
      let clusterCount = Math.min(maxColors, pointCount);
      if (startingClusters.length > 0) {
        clusterCount = Math.min(clusterCount, startingClusters.length);
      }
      const clusters = new Array();
      for (let i = 0; i < startingClusters.length; i++) {
        clusters.push(pointProvider.fromInt(startingClusters[i]));
      }
      const additionalClustersNeeded = clusterCount - clusters.length;
      if (startingClusters.length === 0 && additionalClustersNeeded > 0) {
        for (let i = 0; i < additionalClustersNeeded; i++) {
          const l = Math.random() * 100;
          const a = Math.random() * (100 - -100 + 1) + -100;
          const b = Math.random() * (100 - -100 + 1) + -100;
          clusters.push(new Array(l, a, b));
        }
      }
      const clusterIndices = new Array();
      for (let i = 0; i < pointCount; i++) {
        clusterIndices.push(Math.floor(Math.random() * clusterCount));
      }
      const indexMatrix = new Array();
      for (let i = 0; i < clusterCount; i++) {
        indexMatrix.push(new Array());
        for (let j = 0; j < clusterCount; j++) {
          indexMatrix[i].push(0);
        }
      }
      const distanceToIndexMatrix = new Array();
      for (let i = 0; i < clusterCount; i++) {
        distanceToIndexMatrix.push(new Array());
        for (let j = 0; j < clusterCount; j++) {
          distanceToIndexMatrix[i].push(new DistanceAndIndex());
        }
      }
      const pixelCountSums = new Array();
      for (let i = 0; i < clusterCount; i++) {
        pixelCountSums.push(0);
      }
      for (let iteration = 0; iteration < MAX_ITERATIONS; iteration++) {
        for (let i = 0; i < clusterCount; i++) {
          for (let j = i + 1; j < clusterCount; j++) {
            const distance = pointProvider.distance(clusters[i], clusters[j]);
            distanceToIndexMatrix[j][i].distance = distance;
            distanceToIndexMatrix[j][i].index = i;
            distanceToIndexMatrix[i][j].distance = distance;
            distanceToIndexMatrix[i][j].index = j;
          }
          distanceToIndexMatrix[i].sort();
          for (let j = 0; j < clusterCount; j++) {
            indexMatrix[i][j] = distanceToIndexMatrix[i][j].index;
          }
        }
        let pointsMoved = 0;
        for (let i = 0; i < pointCount; i++) {
          const point = points[i];
          const previousClusterIndex = clusterIndices[i];
          const previousCluster = clusters[previousClusterIndex];
          const previousDistance = pointProvider.distance(point, previousCluster);
          let minimumDistance = previousDistance;
          let newClusterIndex = -1;
          for (let j = 0; j < clusterCount; j++) {
            if (distanceToIndexMatrix[previousClusterIndex][j].distance >= 4 * previousDistance) {
              continue;
            }
            const distance = pointProvider.distance(point, clusters[j]);
            if (distance < minimumDistance) {
              minimumDistance = distance;
              newClusterIndex = j;
            }
          }
          if (newClusterIndex !== -1) {
            const distanceChange = Math.abs(Math.sqrt(minimumDistance) - Math.sqrt(previousDistance));
            if (distanceChange > MIN_MOVEMENT_DISTANCE) {
              pointsMoved++;
              clusterIndices[i] = newClusterIndex;
            }
          }
        }
        if (pointsMoved === 0 && iteration !== 0) {
          break;
        }
        const componentASums = new Array(clusterCount).fill(0);
        const componentBSums = new Array(clusterCount).fill(0);
        const componentCSums = new Array(clusterCount).fill(0);
        for (let i = 0; i < clusterCount; i++) {
          pixelCountSums[i] = 0;
        }
        for (let i = 0; i < pointCount; i++) {
          const clusterIndex = clusterIndices[i];
          const point = points[i];
          const count = counts[i];
          pixelCountSums[clusterIndex] += count;
          componentASums[clusterIndex] += point[0] * count;
          componentBSums[clusterIndex] += point[1] * count;
          componentCSums[clusterIndex] += point[2] * count;
        }
        for (let i = 0; i < clusterCount; i++) {
          const count = pixelCountSums[i];
          if (count === 0) {
            clusters[i] = [0, 0, 0];
            continue;
          }
          const a = componentASums[i] / count;
          const b = componentBSums[i] / count;
          const c = componentCSums[i] / count;
          clusters[i] = [a, b, c];
        }
      }
      const argbToPopulation = /* @__PURE__ */ new Map();
      for (let i = 0; i < clusterCount; i++) {
        const count = pixelCountSums[i];
        if (count === 0) {
          continue;
        }
        const possibleNewCluster = pointProvider.toInt(clusters[i]);
        if (argbToPopulation.has(possibleNewCluster)) {
          continue;
        }
        argbToPopulation.set(possibleNewCluster, count);
      }
      return argbToPopulation;
    }
  };
  var DistanceAndIndex = class {
    constructor() {
      this.distance = -1;
      this.index = -1;
    }
  };

  // node_modules/@material/material-color-utilities/quantize/quantizer_map.js
  var QuantizerMap = class {
    /**
     * @param pixels Colors in ARGB format.
     * @return A Map with keys of ARGB colors, and values of the number of times
     *     the color appears in the image.
     */
    static quantize(pixels) {
      const countByColor = /* @__PURE__ */ new Map();
      for (let i = 0; i < pixels.length; i++) {
        const pixel = pixels[i];
        const alpha = alphaFromArgb(pixel);
        if (alpha < 255) {
          continue;
        }
        countByColor.set(pixel, (countByColor.get(pixel) ?? 0) + 1);
      }
      return countByColor;
    }
  };

  // node_modules/@material/material-color-utilities/quantize/quantizer_wu.js
  var INDEX_BITS = 5;
  var SIDE_LENGTH = 33;
  var TOTAL_SIZE = 35937;
  var directions = {
    RED: "red",
    GREEN: "green",
    BLUE: "blue"
  };
  var QuantizerWu = class {
    constructor(weights = [], momentsR = [], momentsG = [], momentsB = [], moments = [], cubes = []) {
      this.weights = weights;
      this.momentsR = momentsR;
      this.momentsG = momentsG;
      this.momentsB = momentsB;
      this.moments = moments;
      this.cubes = cubes;
    }
    /**
     * @param pixels Colors in ARGB format.
     * @param maxColors The number of colors to divide the image into. A lower
     *     number of colors may be returned.
     * @return Colors in ARGB format.
     */
    quantize(pixels, maxColors) {
      this.constructHistogram(pixels);
      this.computeMoments();
      const createBoxesResult = this.createBoxes(maxColors);
      const results = this.createResult(createBoxesResult.resultCount);
      return results;
    }
    constructHistogram(pixels) {
      this.weights = Array.from({ length: TOTAL_SIZE }).fill(0);
      this.momentsR = Array.from({ length: TOTAL_SIZE }).fill(0);
      this.momentsG = Array.from({ length: TOTAL_SIZE }).fill(0);
      this.momentsB = Array.from({ length: TOTAL_SIZE }).fill(0);
      this.moments = Array.from({ length: TOTAL_SIZE }).fill(0);
      const countByColor = QuantizerMap.quantize(pixels);
      for (const [pixel, count] of countByColor.entries()) {
        const red = redFromArgb(pixel);
        const green = greenFromArgb(pixel);
        const blue = blueFromArgb(pixel);
        const bitsToRemove = 8 - INDEX_BITS;
        const iR = (red >> bitsToRemove) + 1;
        const iG = (green >> bitsToRemove) + 1;
        const iB = (blue >> bitsToRemove) + 1;
        const index = this.getIndex(iR, iG, iB);
        this.weights[index] = (this.weights[index] ?? 0) + count;
        this.momentsR[index] += count * red;
        this.momentsG[index] += count * green;
        this.momentsB[index] += count * blue;
        this.moments[index] += count * (red * red + green * green + blue * blue);
      }
    }
    computeMoments() {
      for (let r = 1; r < SIDE_LENGTH; r++) {
        const area = Array.from({ length: SIDE_LENGTH }).fill(0);
        const areaR = Array.from({ length: SIDE_LENGTH }).fill(0);
        const areaG = Array.from({ length: SIDE_LENGTH }).fill(0);
        const areaB = Array.from({ length: SIDE_LENGTH }).fill(0);
        const area2 = Array.from({ length: SIDE_LENGTH }).fill(0);
        for (let g = 1; g < SIDE_LENGTH; g++) {
          let line = 0;
          let lineR = 0;
          let lineG = 0;
          let lineB = 0;
          let line2 = 0;
          for (let b = 1; b < SIDE_LENGTH; b++) {
            const index = this.getIndex(r, g, b);
            line += this.weights[index];
            lineR += this.momentsR[index];
            lineG += this.momentsG[index];
            lineB += this.momentsB[index];
            line2 += this.moments[index];
            area[b] += line;
            areaR[b] += lineR;
            areaG[b] += lineG;
            areaB[b] += lineB;
            area2[b] += line2;
            const previousIndex = this.getIndex(r - 1, g, b);
            this.weights[index] = this.weights[previousIndex] + area[b];
            this.momentsR[index] = this.momentsR[previousIndex] + areaR[b];
            this.momentsG[index] = this.momentsG[previousIndex] + areaG[b];
            this.momentsB[index] = this.momentsB[previousIndex] + areaB[b];
            this.moments[index] = this.moments[previousIndex] + area2[b];
          }
        }
      }
    }
    createBoxes(maxColors) {
      this.cubes = Array.from({ length: maxColors }).fill(0).map(() => new Box());
      const volumeVariance = Array.from({ length: maxColors }).fill(0);
      this.cubes[0].r0 = 0;
      this.cubes[0].g0 = 0;
      this.cubes[0].b0 = 0;
      this.cubes[0].r1 = SIDE_LENGTH - 1;
      this.cubes[0].g1 = SIDE_LENGTH - 1;
      this.cubes[0].b1 = SIDE_LENGTH - 1;
      let generatedColorCount = maxColors;
      let next = 0;
      for (let i = 1; i < maxColors; i++) {
        if (this.cut(this.cubes[next], this.cubes[i])) {
          volumeVariance[next] = this.cubes[next].vol > 1 ? this.variance(this.cubes[next]) : 0;
          volumeVariance[i] = this.cubes[i].vol > 1 ? this.variance(this.cubes[i]) : 0;
        } else {
          volumeVariance[next] = 0;
          i--;
        }
        next = 0;
        let temp = volumeVariance[0];
        for (let j = 1; j <= i; j++) {
          if (volumeVariance[j] > temp) {
            temp = volumeVariance[j];
            next = j;
          }
        }
        if (temp <= 0) {
          generatedColorCount = i + 1;
          break;
        }
      }
      return new CreateBoxesResult(maxColors, generatedColorCount);
    }
    createResult(colorCount) {
      const colors = [];
      for (let i = 0; i < colorCount; ++i) {
        const cube = this.cubes[i];
        const weight = this.volume(cube, this.weights);
        if (weight > 0) {
          const r = Math.round(this.volume(cube, this.momentsR) / weight);
          const g = Math.round(this.volume(cube, this.momentsG) / weight);
          const b = Math.round(this.volume(cube, this.momentsB) / weight);
          const color = 255 << 24 | (r & 255) << 16 | (g & 255) << 8 | b & 255;
          colors.push(color);
        }
      }
      return colors;
    }
    variance(cube) {
      const dr = this.volume(cube, this.momentsR);
      const dg = this.volume(cube, this.momentsG);
      const db = this.volume(cube, this.momentsB);
      const xx = this.moments[this.getIndex(cube.r1, cube.g1, cube.b1)] - this.moments[this.getIndex(cube.r1, cube.g1, cube.b0)] - this.moments[this.getIndex(cube.r1, cube.g0, cube.b1)] + this.moments[this.getIndex(cube.r1, cube.g0, cube.b0)] - this.moments[this.getIndex(cube.r0, cube.g1, cube.b1)] + this.moments[this.getIndex(cube.r0, cube.g1, cube.b0)] + this.moments[this.getIndex(cube.r0, cube.g0, cube.b1)] - this.moments[this.getIndex(cube.r0, cube.g0, cube.b0)];
      const hypotenuse = dr * dr + dg * dg + db * db;
      const volume = this.volume(cube, this.weights);
      return xx - hypotenuse / volume;
    }
    cut(one, two) {
      const wholeR = this.volume(one, this.momentsR);
      const wholeG = this.volume(one, this.momentsG);
      const wholeB = this.volume(one, this.momentsB);
      const wholeW = this.volume(one, this.weights);
      const maxRResult = this.maximize(one, directions.RED, one.r0 + 1, one.r1, wholeR, wholeG, wholeB, wholeW);
      const maxGResult = this.maximize(one, directions.GREEN, one.g0 + 1, one.g1, wholeR, wholeG, wholeB, wholeW);
      const maxBResult = this.maximize(one, directions.BLUE, one.b0 + 1, one.b1, wholeR, wholeG, wholeB, wholeW);
      let direction;
      const maxR = maxRResult.maximum;
      const maxG = maxGResult.maximum;
      const maxB = maxBResult.maximum;
      if (maxR >= maxG && maxR >= maxB) {
        if (maxRResult.cutLocation < 0) {
          return false;
        }
        direction = directions.RED;
      } else if (maxG >= maxR && maxG >= maxB) {
        direction = directions.GREEN;
      } else {
        direction = directions.BLUE;
      }
      two.r1 = one.r1;
      two.g1 = one.g1;
      two.b1 = one.b1;
      switch (direction) {
        case directions.RED:
          one.r1 = maxRResult.cutLocation;
          two.r0 = one.r1;
          two.g0 = one.g0;
          two.b0 = one.b0;
          break;
        case directions.GREEN:
          one.g1 = maxGResult.cutLocation;
          two.r0 = one.r0;
          two.g0 = one.g1;
          two.b0 = one.b0;
          break;
        case directions.BLUE:
          one.b1 = maxBResult.cutLocation;
          two.r0 = one.r0;
          two.g0 = one.g0;
          two.b0 = one.b1;
          break;
        default:
          throw new Error("unexpected direction " + direction);
      }
      one.vol = (one.r1 - one.r0) * (one.g1 - one.g0) * (one.b1 - one.b0);
      two.vol = (two.r1 - two.r0) * (two.g1 - two.g0) * (two.b1 - two.b0);
      return true;
    }
    maximize(cube, direction, first, last, wholeR, wholeG, wholeB, wholeW) {
      const bottomR = this.bottom(cube, direction, this.momentsR);
      const bottomG = this.bottom(cube, direction, this.momentsG);
      const bottomB = this.bottom(cube, direction, this.momentsB);
      const bottomW = this.bottom(cube, direction, this.weights);
      let max = 0;
      let cut = -1;
      let halfR = 0;
      let halfG = 0;
      let halfB = 0;
      let halfW = 0;
      for (let i = first; i < last; i++) {
        halfR = bottomR + this.top(cube, direction, i, this.momentsR);
        halfG = bottomG + this.top(cube, direction, i, this.momentsG);
        halfB = bottomB + this.top(cube, direction, i, this.momentsB);
        halfW = bottomW + this.top(cube, direction, i, this.weights);
        if (halfW === 0) {
          continue;
        }
        let tempNumerator = (halfR * halfR + halfG * halfG + halfB * halfB) * 1;
        let tempDenominator = halfW * 1;
        let temp = tempNumerator / tempDenominator;
        halfR = wholeR - halfR;
        halfG = wholeG - halfG;
        halfB = wholeB - halfB;
        halfW = wholeW - halfW;
        if (halfW === 0) {
          continue;
        }
        tempNumerator = (halfR * halfR + halfG * halfG + halfB * halfB) * 1;
        tempDenominator = halfW * 1;
        temp += tempNumerator / tempDenominator;
        if (temp > max) {
          max = temp;
          cut = i;
        }
      }
      return new MaximizeResult(cut, max);
    }
    volume(cube, moment) {
      return moment[this.getIndex(cube.r1, cube.g1, cube.b1)] - moment[this.getIndex(cube.r1, cube.g1, cube.b0)] - moment[this.getIndex(cube.r1, cube.g0, cube.b1)] + moment[this.getIndex(cube.r1, cube.g0, cube.b0)] - moment[this.getIndex(cube.r0, cube.g1, cube.b1)] + moment[this.getIndex(cube.r0, cube.g1, cube.b0)] + moment[this.getIndex(cube.r0, cube.g0, cube.b1)] - moment[this.getIndex(cube.r0, cube.g0, cube.b0)];
    }
    bottom(cube, direction, moment) {
      switch (direction) {
        case directions.RED:
          return -moment[this.getIndex(cube.r0, cube.g1, cube.b1)] + moment[this.getIndex(cube.r0, cube.g1, cube.b0)] + moment[this.getIndex(cube.r0, cube.g0, cube.b1)] - moment[this.getIndex(cube.r0, cube.g0, cube.b0)];
        case directions.GREEN:
          return -moment[this.getIndex(cube.r1, cube.g0, cube.b1)] + moment[this.getIndex(cube.r1, cube.g0, cube.b0)] + moment[this.getIndex(cube.r0, cube.g0, cube.b1)] - moment[this.getIndex(cube.r0, cube.g0, cube.b0)];
        case directions.BLUE:
          return -moment[this.getIndex(cube.r1, cube.g1, cube.b0)] + moment[this.getIndex(cube.r1, cube.g0, cube.b0)] + moment[this.getIndex(cube.r0, cube.g1, cube.b0)] - moment[this.getIndex(cube.r0, cube.g0, cube.b0)];
        default:
          throw new Error("unexpected direction $direction");
      }
    }
    top(cube, direction, position, moment) {
      switch (direction) {
        case directions.RED:
          return moment[this.getIndex(position, cube.g1, cube.b1)] - moment[this.getIndex(position, cube.g1, cube.b0)] - moment[this.getIndex(position, cube.g0, cube.b1)] + moment[this.getIndex(position, cube.g0, cube.b0)];
        case directions.GREEN:
          return moment[this.getIndex(cube.r1, position, cube.b1)] - moment[this.getIndex(cube.r1, position, cube.b0)] - moment[this.getIndex(cube.r0, position, cube.b1)] + moment[this.getIndex(cube.r0, position, cube.b0)];
        case directions.BLUE:
          return moment[this.getIndex(cube.r1, cube.g1, position)] - moment[this.getIndex(cube.r1, cube.g0, position)] - moment[this.getIndex(cube.r0, cube.g1, position)] + moment[this.getIndex(cube.r0, cube.g0, position)];
        default:
          throw new Error("unexpected direction $direction");
      }
    }
    getIndex(r, g, b) {
      return (r << INDEX_BITS * 2) + (r << INDEX_BITS + 1) + r + (g << INDEX_BITS) + g + b;
    }
  };
  var Box = class {
    constructor(r0 = 0, r1 = 0, g0 = 0, g1 = 0, b0 = 0, b1 = 0, vol = 0) {
      this.r0 = r0;
      this.r1 = r1;
      this.g0 = g0;
      this.g1 = g1;
      this.b0 = b0;
      this.b1 = b1;
      this.vol = vol;
    }
  };
  var CreateBoxesResult = class {
    /**
     * @param requestedCount how many colors the caller asked to be returned from
     *     quantization.
     * @param resultCount the actual number of colors achieved from quantization.
     *     May be lower than the requested count.
     */
    constructor(requestedCount, resultCount) {
      this.requestedCount = requestedCount;
      this.resultCount = resultCount;
    }
  };
  var MaximizeResult = class {
    constructor(cutLocation, maximum) {
      this.cutLocation = cutLocation;
      this.maximum = maximum;
    }
  };

  // node_modules/@material/material-color-utilities/quantize/quantizer_celebi.js
  var QuantizerCelebi = class {
    /**
     * @param pixels Colors in ARGB format.
     * @param maxColors The number of colors to divide the image into. A lower
     *     number of colors may be returned.
     * @return Map with keys of colors in ARGB format, and values of number of
     *     pixels in the original image that correspond to the color in the
     *     quantized image.
     */
    static quantize(pixels, maxColors) {
      const wu = new QuantizerWu();
      const wuResult = wu.quantize(pixels, maxColors);
      return QuantizerWsmeans.quantize(pixels, wuResult, maxColors);
    }
  };

  // node_modules/@material/material-color-utilities/scheme/scheme.js
  var Scheme = class _Scheme {
    get primary() {
      return this.props.primary;
    }
    get onPrimary() {
      return this.props.onPrimary;
    }
    get primaryContainer() {
      return this.props.primaryContainer;
    }
    get onPrimaryContainer() {
      return this.props.onPrimaryContainer;
    }
    get secondary() {
      return this.props.secondary;
    }
    get onSecondary() {
      return this.props.onSecondary;
    }
    get secondaryContainer() {
      return this.props.secondaryContainer;
    }
    get onSecondaryContainer() {
      return this.props.onSecondaryContainer;
    }
    get tertiary() {
      return this.props.tertiary;
    }
    get onTertiary() {
      return this.props.onTertiary;
    }
    get tertiaryContainer() {
      return this.props.tertiaryContainer;
    }
    get onTertiaryContainer() {
      return this.props.onTertiaryContainer;
    }
    get error() {
      return this.props.error;
    }
    get onError() {
      return this.props.onError;
    }
    get errorContainer() {
      return this.props.errorContainer;
    }
    get onErrorContainer() {
      return this.props.onErrorContainer;
    }
    get background() {
      return this.props.background;
    }
    get onBackground() {
      return this.props.onBackground;
    }
    get surface() {
      return this.props.surface;
    }
    get onSurface() {
      return this.props.onSurface;
    }
    get surfaceVariant() {
      return this.props.surfaceVariant;
    }
    get onSurfaceVariant() {
      return this.props.onSurfaceVariant;
    }
    get outline() {
      return this.props.outline;
    }
    get outlineVariant() {
      return this.props.outlineVariant;
    }
    get shadow() {
      return this.props.shadow;
    }
    get scrim() {
      return this.props.scrim;
    }
    get inverseSurface() {
      return this.props.inverseSurface;
    }
    get inverseOnSurface() {
      return this.props.inverseOnSurface;
    }
    get inversePrimary() {
      return this.props.inversePrimary;
    }
    /**
     * @param argb ARGB representation of a color.
     * @return Light Material color scheme, based on the color's hue.
     */
    static light(argb) {
      return _Scheme.lightFromCorePalette(CorePalette.of(argb));
    }
    /**
     * @param argb ARGB representation of a color.
     * @return Dark Material color scheme, based on the color's hue.
     */
    static dark(argb) {
      return _Scheme.darkFromCorePalette(CorePalette.of(argb));
    }
    /**
     * @param argb ARGB representation of a color.
     * @return Light Material content color scheme, based on the color's hue.
     */
    static lightContent(argb) {
      return _Scheme.lightFromCorePalette(CorePalette.contentOf(argb));
    }
    /**
     * @param argb ARGB representation of a color.
     * @return Dark Material content color scheme, based on the color's hue.
     */
    static darkContent(argb) {
      return _Scheme.darkFromCorePalette(CorePalette.contentOf(argb));
    }
    /**
     * Light scheme from core palette
     */
    static lightFromCorePalette(core) {
      return new _Scheme({
        primary: core.a1.tone(40),
        onPrimary: core.a1.tone(100),
        primaryContainer: core.a1.tone(90),
        onPrimaryContainer: core.a1.tone(10),
        secondary: core.a2.tone(40),
        onSecondary: core.a2.tone(100),
        secondaryContainer: core.a2.tone(90),
        onSecondaryContainer: core.a2.tone(10),
        tertiary: core.a3.tone(40),
        onTertiary: core.a3.tone(100),
        tertiaryContainer: core.a3.tone(90),
        onTertiaryContainer: core.a3.tone(10),
        error: core.error.tone(40),
        onError: core.error.tone(100),
        errorContainer: core.error.tone(90),
        onErrorContainer: core.error.tone(10),
        background: core.n1.tone(99),
        onBackground: core.n1.tone(10),
        surface: core.n1.tone(99),
        onSurface: core.n1.tone(10),
        surfaceVariant: core.n2.tone(90),
        onSurfaceVariant: core.n2.tone(30),
        outline: core.n2.tone(50),
        outlineVariant: core.n2.tone(80),
        shadow: core.n1.tone(0),
        scrim: core.n1.tone(0),
        inverseSurface: core.n1.tone(20),
        inverseOnSurface: core.n1.tone(95),
        inversePrimary: core.a1.tone(80)
      });
    }
    /**
     * Dark scheme from core palette
     */
    static darkFromCorePalette(core) {
      return new _Scheme({
        primary: core.a1.tone(80),
        onPrimary: core.a1.tone(20),
        primaryContainer: core.a1.tone(30),
        onPrimaryContainer: core.a1.tone(90),
        secondary: core.a2.tone(80),
        onSecondary: core.a2.tone(20),
        secondaryContainer: core.a2.tone(30),
        onSecondaryContainer: core.a2.tone(90),
        tertiary: core.a3.tone(80),
        onTertiary: core.a3.tone(20),
        tertiaryContainer: core.a3.tone(30),
        onTertiaryContainer: core.a3.tone(90),
        error: core.error.tone(80),
        onError: core.error.tone(20),
        errorContainer: core.error.tone(30),
        onErrorContainer: core.error.tone(80),
        background: core.n1.tone(10),
        onBackground: core.n1.tone(90),
        surface: core.n1.tone(10),
        onSurface: core.n1.tone(90),
        surfaceVariant: core.n2.tone(30),
        onSurfaceVariant: core.n2.tone(80),
        outline: core.n2.tone(60),
        outlineVariant: core.n2.tone(30),
        shadow: core.n1.tone(0),
        scrim: core.n1.tone(0),
        inverseSurface: core.n1.tone(90),
        inverseOnSurface: core.n1.tone(20),
        inversePrimary: core.a1.tone(40)
      });
    }
    constructor(props) {
      this.props = props;
    }
    toJSON() {
      return {
        ...this.props
      };
    }
  };

  // node_modules/@material/material-color-utilities/scheme/scheme_android.js
  var SchemeAndroid = class _SchemeAndroid {
    get colorAccentPrimary() {
      return this.props.colorAccentPrimary;
    }
    get colorAccentPrimaryVariant() {
      return this.props.colorAccentPrimaryVariant;
    }
    get colorAccentSecondary() {
      return this.props.colorAccentSecondary;
    }
    get colorAccentSecondaryVariant() {
      return this.props.colorAccentSecondaryVariant;
    }
    get colorAccentTertiary() {
      return this.props.colorAccentTertiary;
    }
    get colorAccentTertiaryVariant() {
      return this.props.colorAccentTertiaryVariant;
    }
    get textColorPrimary() {
      return this.props.textColorPrimary;
    }
    get textColorSecondary() {
      return this.props.textColorSecondary;
    }
    get textColorTertiary() {
      return this.props.textColorTertiary;
    }
    get textColorPrimaryInverse() {
      return this.props.textColorPrimaryInverse;
    }
    get textColorSecondaryInverse() {
      return this.props.textColorSecondaryInverse;
    }
    get textColorTertiaryInverse() {
      return this.props.textColorTertiaryInverse;
    }
    get colorBackground() {
      return this.props.colorBackground;
    }
    get colorBackgroundFloating() {
      return this.props.colorBackgroundFloating;
    }
    get colorSurface() {
      return this.props.colorSurface;
    }
    get colorSurfaceVariant() {
      return this.props.colorSurfaceVariant;
    }
    get colorSurfaceHighlight() {
      return this.props.colorSurfaceHighlight;
    }
    get surfaceHeader() {
      return this.props.surfaceHeader;
    }
    get underSurface() {
      return this.props.underSurface;
    }
    get offState() {
      return this.props.offState;
    }
    get accentSurface() {
      return this.props.accentSurface;
    }
    get textPrimaryOnAccent() {
      return this.props.textPrimaryOnAccent;
    }
    get textSecondaryOnAccent() {
      return this.props.textSecondaryOnAccent;
    }
    get volumeBackground() {
      return this.props.volumeBackground;
    }
    get scrim() {
      return this.props.scrim;
    }
    /**
     * @param argb ARGB representation of a color.
     * @return Light Material color scheme, based on the color's hue.
     */
    static light(argb) {
      const core = CorePalette.of(argb);
      return _SchemeAndroid.lightFromCorePalette(core);
    }
    /**
     * @param argb ARGB representation of a color.
     * @return Dark Material color scheme, based on the color's hue.
     */
    static dark(argb) {
      const core = CorePalette.of(argb);
      return _SchemeAndroid.darkFromCorePalette(core);
    }
    /**
     * @param argb ARGB representation of a color.
     * @return Light Android color scheme, based on the color's hue.
     */
    static lightContent(argb) {
      const core = CorePalette.contentOf(argb);
      return _SchemeAndroid.lightFromCorePalette(core);
    }
    /**
     * @param argb ARGB representation of a color.
     * @return Dark Android color scheme, based on the color's hue.
     */
    static darkContent(argb) {
      const core = CorePalette.contentOf(argb);
      return _SchemeAndroid.darkFromCorePalette(core);
    }
    /**
     * Light scheme from core palette
     */
    static lightFromCorePalette(core) {
      return new _SchemeAndroid({
        colorAccentPrimary: core.a1.tone(90),
        colorAccentPrimaryVariant: core.a1.tone(40),
        colorAccentSecondary: core.a2.tone(90),
        colorAccentSecondaryVariant: core.a2.tone(40),
        colorAccentTertiary: core.a3.tone(90),
        colorAccentTertiaryVariant: core.a3.tone(40),
        textColorPrimary: core.n1.tone(10),
        textColorSecondary: core.n2.tone(30),
        textColorTertiary: core.n2.tone(50),
        textColorPrimaryInverse: core.n1.tone(95),
        textColorSecondaryInverse: core.n1.tone(80),
        textColorTertiaryInverse: core.n1.tone(60),
        colorBackground: core.n1.tone(95),
        colorBackgroundFloating: core.n1.tone(98),
        colorSurface: core.n1.tone(98),
        colorSurfaceVariant: core.n1.tone(90),
        colorSurfaceHighlight: core.n1.tone(100),
        surfaceHeader: core.n1.tone(90),
        underSurface: core.n1.tone(0),
        offState: core.n1.tone(20),
        accentSurface: core.a2.tone(95),
        textPrimaryOnAccent: core.n1.tone(10),
        textSecondaryOnAccent: core.n2.tone(30),
        volumeBackground: core.n1.tone(25),
        scrim: core.n1.tone(80)
      });
    }
    /**
     * Dark scheme from core palette
     */
    static darkFromCorePalette(core) {
      return new _SchemeAndroid({
        colorAccentPrimary: core.a1.tone(90),
        colorAccentPrimaryVariant: core.a1.tone(70),
        colorAccentSecondary: core.a2.tone(90),
        colorAccentSecondaryVariant: core.a2.tone(70),
        colorAccentTertiary: core.a3.tone(90),
        colorAccentTertiaryVariant: core.a3.tone(70),
        textColorPrimary: core.n1.tone(95),
        textColorSecondary: core.n2.tone(80),
        textColorTertiary: core.n2.tone(60),
        textColorPrimaryInverse: core.n1.tone(10),
        textColorSecondaryInverse: core.n1.tone(30),
        textColorTertiaryInverse: core.n1.tone(50),
        colorBackground: core.n1.tone(10),
        colorBackgroundFloating: core.n1.tone(10),
        colorSurface: core.n1.tone(20),
        colorSurfaceVariant: core.n1.tone(30),
        colorSurfaceHighlight: core.n1.tone(35),
        surfaceHeader: core.n1.tone(30),
        underSurface: core.n1.tone(0),
        offState: core.n1.tone(20),
        accentSurface: core.a2.tone(95),
        textPrimaryOnAccent: core.n1.tone(10),
        textSecondaryOnAccent: core.n2.tone(30),
        volumeBackground: core.n1.tone(25),
        scrim: core.n1.tone(80)
      });
    }
    constructor(props) {
      this.props = props;
    }
    toJSON() {
      return { ...this.props };
    }
  };

  // node_modules/@material/material-color-utilities/scheme/scheme_content.js
  var SchemeContent = class extends DynamicScheme {
    constructor(sourceColorHct, isDark, contrastLevel, specVersion = DynamicScheme.DEFAULT_SPEC_VERSION, platform = DynamicScheme.DEFAULT_PLATFORM) {
      super({
        sourceColorHct,
        variant: Variant.CONTENT,
        contrastLevel,
        isDark,
        platform,
        specVersion
      });
    }
  };

  // node_modules/@material/material-color-utilities/scheme/scheme_expressive.js
  var SchemeExpressive = class extends DynamicScheme {
    constructor(sourceColorHct, isDark, contrastLevel, specVersion = DynamicScheme.DEFAULT_SPEC_VERSION, platform = DynamicScheme.DEFAULT_PLATFORM) {
      super({
        sourceColorHct,
        variant: Variant.EXPRESSIVE,
        contrastLevel,
        isDark,
        platform,
        specVersion
      });
    }
  };

  // node_modules/@material/material-color-utilities/scheme/scheme_fidelity.js
  var SchemeFidelity = class extends DynamicScheme {
    constructor(sourceColorHct, isDark, contrastLevel, specVersion = DynamicScheme.DEFAULT_SPEC_VERSION, platform = DynamicScheme.DEFAULT_PLATFORM) {
      super({
        sourceColorHct,
        variant: Variant.FIDELITY,
        contrastLevel,
        isDark,
        platform,
        specVersion
      });
    }
  };

  // node_modules/@material/material-color-utilities/scheme/scheme_fruit_salad.js
  var SchemeFruitSalad = class extends DynamicScheme {
    constructor(sourceColorHct, isDark, contrastLevel, specVersion = DynamicScheme.DEFAULT_SPEC_VERSION, platform = DynamicScheme.DEFAULT_PLATFORM) {
      super({
        sourceColorHct,
        variant: Variant.FRUIT_SALAD,
        contrastLevel,
        isDark,
        platform,
        specVersion
      });
    }
  };

  // node_modules/@material/material-color-utilities/scheme/scheme_monochrome.js
  var SchemeMonochrome = class extends DynamicScheme {
    constructor(sourceColorHct, isDark, contrastLevel, specVersion = DynamicScheme.DEFAULT_SPEC_VERSION, platform = DynamicScheme.DEFAULT_PLATFORM) {
      super({
        sourceColorHct,
        variant: Variant.MONOCHROME,
        contrastLevel,
        isDark,
        platform,
        specVersion
      });
    }
  };

  // node_modules/@material/material-color-utilities/scheme/scheme_neutral.js
  var SchemeNeutral = class extends DynamicScheme {
    constructor(sourceColorHct, isDark, contrastLevel, specVersion = DynamicScheme.DEFAULT_SPEC_VERSION, platform = DynamicScheme.DEFAULT_PLATFORM) {
      super({
        sourceColorHct,
        variant: Variant.NEUTRAL,
        contrastLevel,
        isDark,
        platform,
        specVersion
      });
    }
  };

  // node_modules/@material/material-color-utilities/scheme/scheme_rainbow.js
  var SchemeRainbow = class extends DynamicScheme {
    constructor(sourceColorHct, isDark, contrastLevel, specVersion = DynamicScheme.DEFAULT_SPEC_VERSION, platform = DynamicScheme.DEFAULT_PLATFORM) {
      super({
        sourceColorHct,
        variant: Variant.RAINBOW,
        contrastLevel,
        isDark,
        platform,
        specVersion
      });
    }
  };

  // node_modules/@material/material-color-utilities/scheme/scheme_tonal_spot.js
  var SchemeTonalSpot = class extends DynamicScheme {
    constructor(sourceColorHct, isDark, contrastLevel, specVersion = DynamicScheme.DEFAULT_SPEC_VERSION, platform = DynamicScheme.DEFAULT_PLATFORM) {
      super({
        sourceColorHct,
        variant: Variant.TONAL_SPOT,
        contrastLevel,
        isDark,
        platform,
        specVersion
      });
    }
  };

  // node_modules/@material/material-color-utilities/scheme/scheme_vibrant.js
  var SchemeVibrant = class extends DynamicScheme {
    constructor(sourceColorHct, isDark, contrastLevel, specVersion = DynamicScheme.DEFAULT_SPEC_VERSION, platform = DynamicScheme.DEFAULT_PLATFORM) {
      super({
        sourceColorHct,
        variant: Variant.VIBRANT,
        contrastLevel,
        isDark,
        platform,
        specVersion
      });
    }
  };

  // node_modules/@material/material-color-utilities/score/score.js
  var SCORE_OPTION_DEFAULTS = {
    desired: 4,
    fallbackColorARGB: 4282549748,
    filter: true
    // Avoid unsuitable colors.
  };
  function compare(a, b) {
    if (a.score > b.score) {
      return -1;
    } else if (a.score < b.score) {
      return 1;
    }
    return 0;
  }
  var Score = class _Score {
    constructor() {
    }
    /**
     * Given a map with keys of colors and values of how often the color appears,
     * rank the colors based on suitability for being used for a UI theme.
     *
     * @param colorsToPopulation map with keys of colors and values of how often
     *     the color appears, usually from a source image.
     * @param {ScoreOptions} options optional parameters.
     * @return Colors sorted by suitability for a UI theme. The most suitable
     *     color is the first item, the least suitable is the last. There will
     *     always be at least one color returned. If all the input colors
     *     were not suitable for a theme, a default fallback color will be
     *     provided, Google Blue.
     */
    static score(colorsToPopulation, options) {
      const { desired, fallbackColorARGB, filter } = { ...SCORE_OPTION_DEFAULTS, ...options };
      const colorsHct = [];
      const huePopulation = new Array(360).fill(0);
      let populationSum = 0;
      for (const [argb, population] of colorsToPopulation.entries()) {
        const hct = Hct.fromInt(argb);
        colorsHct.push(hct);
        const hue = Math.floor(hct.hue);
        huePopulation[hue] += population;
        populationSum += population;
      }
      const hueExcitedProportions = new Array(360).fill(0);
      for (let hue = 0; hue < 360; hue++) {
        const proportion = huePopulation[hue] / populationSum;
        for (let i = hue - 14; i < hue + 16; i++) {
          const neighborHue = sanitizeDegreesInt(i);
          hueExcitedProportions[neighborHue] += proportion;
        }
      }
      const scoredHct = new Array();
      for (const hct of colorsHct) {
        const hue = sanitizeDegreesInt(Math.round(hct.hue));
        const proportion = hueExcitedProportions[hue];
        if (filter && (hct.chroma < _Score.CUTOFF_CHROMA || proportion <= _Score.CUTOFF_EXCITED_PROPORTION)) {
          continue;
        }
        const proportionScore = proportion * 100 * _Score.WEIGHT_PROPORTION;
        const chromaWeight = hct.chroma < _Score.TARGET_CHROMA ? _Score.WEIGHT_CHROMA_BELOW : _Score.WEIGHT_CHROMA_ABOVE;
        const chromaScore = (hct.chroma - _Score.TARGET_CHROMA) * chromaWeight;
        const score = proportionScore + chromaScore;
        scoredHct.push({ hct, score });
      }
      scoredHct.sort(compare);
      const chosenColors = [];
      for (let differenceDegrees2 = 90; differenceDegrees2 >= 15; differenceDegrees2--) {
        chosenColors.length = 0;
        for (const { hct } of scoredHct) {
          const duplicateHue = chosenColors.find((chosenHct) => {
            return differenceDegrees(hct.hue, chosenHct.hue) < differenceDegrees2;
          });
          if (!duplicateHue) {
            chosenColors.push(hct);
          }
          if (chosenColors.length >= desired)
            break;
        }
        if (chosenColors.length >= desired)
          break;
      }
      const colors = [];
      if (chosenColors.length === 0) {
        colors.push(fallbackColorARGB);
      }
      for (const chosenHct of chosenColors) {
        colors.push(chosenHct.toInt());
      }
      return colors;
    }
  };
  Score.TARGET_CHROMA = 48;
  Score.WEIGHT_PROPORTION = 0.7;
  Score.WEIGHT_CHROMA_ABOVE = 0.3;
  Score.WEIGHT_CHROMA_BELOW = 0.1;
  Score.CUTOFF_CHROMA = 5;
  Score.CUTOFF_EXCITED_PROPORTION = 0.01;

  // node_modules/@material/material-color-utilities/utils/string_utils.js
  function hexFromArgb(argb) {
    const r = redFromArgb(argb);
    const g = greenFromArgb(argb);
    const b = blueFromArgb(argb);
    const outParts = [r.toString(16), g.toString(16), b.toString(16)];
    for (const [i, part] of outParts.entries()) {
      if (part.length === 1) {
        outParts[i] = "0" + part;
      }
    }
    return "#" + outParts.join("");
  }
  function argbFromHex(hex) {
    hex = hex.replace("#", "");
    const isThree = hex.length === 3;
    const isSix = hex.length === 6;
    const isEight = hex.length === 8;
    if (!isThree && !isSix && !isEight) {
      throw new Error("unexpected hex " + hex);
    }
    let r = 0;
    let g = 0;
    let b = 0;
    if (isThree) {
      r = parseIntHex(hex.slice(0, 1).repeat(2));
      g = parseIntHex(hex.slice(1, 2).repeat(2));
      b = parseIntHex(hex.slice(2, 3).repeat(2));
    } else if (isSix) {
      r = parseIntHex(hex.slice(0, 2));
      g = parseIntHex(hex.slice(2, 4));
      b = parseIntHex(hex.slice(4, 6));
    } else if (isEight) {
      r = parseIntHex(hex.slice(2, 4));
      g = parseIntHex(hex.slice(4, 6));
      b = parseIntHex(hex.slice(6, 8));
    }
    return (255 << 24 | (r & 255) << 16 | (g & 255) << 8 | b & 255) >>> 0;
  }
  function parseIntHex(value) {
    return parseInt(value, 16);
  }

  // node_modules/@material/material-color-utilities/utils/theme_utils.js
  function themeFromSourceColor(source, customColors = []) {
    const palette = CorePalette.of(source);
    return {
      source,
      schemes: {
        light: Scheme.light(source),
        dark: Scheme.dark(source)
      },
      palettes: {
        primary: palette.a1,
        secondary: palette.a2,
        tertiary: palette.a3,
        neutral: palette.n1,
        neutralVariant: palette.n2,
        error: palette.error
      },
      customColors: customColors.map((c) => customColor(source, c))
    };
  }
  function customColor(source, color) {
    let value = color.value;
    const from = value;
    const to = source;
    if (color.blend) {
      value = Blend.harmonize(from, to);
    }
    const palette = CorePalette.of(value);
    const tones = palette.a1;
    return {
      color,
      value,
      light: {
        color: tones.tone(40),
        onColor: tones.tone(100),
        colorContainer: tones.tone(90),
        onColorContainer: tones.tone(10)
      },
      dark: {
        color: tones.tone(80),
        onColor: tones.tone(20),
        colorContainer: tones.tone(30),
        onColorContainer: tones.tone(90)
      }
    };
  }

  // src/monet.js
  function rgbaFromArgb(argb, alpha = 1) {
    const r = argb >> 16 & 255;
    const g = argb >> 8 & 255;
    const b = argb & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  function parseColorToArgb(color) {
    if (typeof color === "number") {
      return color;
    }
    if (typeof color === "string") {
      const trimmed = color.trim();
      if (trimmed.startsWith("#")) {
        return argbFromHex(trimmed);
      }
      const rgbMatch = trimmed.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
      if (rgbMatch) {
        const r = parseInt(rgbMatch[1], 10);
        const g = parseInt(rgbMatch[2], 10);
        const b = parseInt(rgbMatch[3], 10);
        return 255 << 24 | r << 16 | g << 8 | b;
      }
      const hctMatch = trimmed.match(/^hct\((\d+),\s*(\d+),\s*(\d+)/i);
      if (hctMatch) {
        const hct = Hct.from(parseFloat(hctMatch[1]), parseFloat(hctMatch[2]), parseFloat(hctMatch[3]));
        return hct.toInt();
      }
      return argbFromHex(trimmed);
    }
    throw new Error("Unsupported color format: " + color);
  }
  function createMduiToneMap(palette, isDark = false) {
    return {
      50: hexFromArgb(palette.tone(95)),
      100: hexFromArgb(palette.tone(90)),
      200: hexFromArgb(palette.tone(80)),
      300: hexFromArgb(palette.tone(70)),
      400: hexFromArgb(palette.tone(60)),
      500: hexFromArgb(palette.tone(isDark ? 80 : 40)),
      600: hexFromArgb(palette.tone(isDark ? 70 : 35)),
      700: hexFromArgb(palette.tone(isDark ? 60 : 30)),
      800: hexFromArgb(palette.tone(isDark ? 50 : 20)),
      900: hexFromArgb(palette.tone(isDark ? 40 : 10)),
      a100: hexFromArgb(palette.tone(90)),
      a200: hexFromArgb(palette.tone(80)),
      a400: hexFromArgb(palette.tone(isDark ? 80 : 40)),
      a700: hexFromArgb(palette.tone(isDark ? 60 : 30))
    };
  }
  function createMd3Surfaces(palettes, isDark = false) {
    const n = palettes.neutral || palettes.neutral1;
    const nv = palettes.neutralVariant || palettes.neutral2 || palettes.neutral;
    if (!isDark) {
      return {
        surface: hexFromArgb(n.tone(98)),
        surfaceDim: hexFromArgb(n.tone(87)),
        surfaceBright: hexFromArgb(n.tone(98)),
        surfaceContainerLowest: hexFromArgb(n.tone(100)),
        surfaceContainerLow: hexFromArgb(n.tone(96)),
        surfaceContainer: hexFromArgb(n.tone(94)),
        surfaceContainerHigh: hexFromArgb(n.tone(92)),
        surfaceContainerHighest: hexFromArgb(n.tone(90)),
        onSurface: hexFromArgb(n.tone(10)),
        surfaceVariant: hexFromArgb(nv.tone(90)),
        onSurfaceVariant: hexFromArgb(nv.tone(30)),
        background: hexFromArgb(n.tone(98)),
        onBackground: hexFromArgb(n.tone(10)),
        outline: hexFromArgb(nv.tone(50)),
        outlineVariant: hexFromArgb(nv.tone(80))
      };
    } else {
      return {
        surface: hexFromArgb(n.tone(6)),
        surfaceDim: hexFromArgb(n.tone(6)),
        surfaceBright: hexFromArgb(n.tone(24)),
        surfaceContainerLowest: hexFromArgb(n.tone(4)),
        surfaceContainerLow: hexFromArgb(n.tone(10)),
        surfaceContainer: hexFromArgb(n.tone(12)),
        surfaceContainerHigh: hexFromArgb(n.tone(17)),
        surfaceContainerHighest: hexFromArgb(n.tone(22)),
        onSurface: hexFromArgb(n.tone(90)),
        surfaceVariant: hexFromArgb(nv.tone(30)),
        onSurfaceVariant: hexFromArgb(nv.tone(80)),
        background: hexFromArgb(n.tone(6)),
        onBackground: hexFromArgb(n.tone(90)),
        outline: hexFromArgb(nv.tone(60)),
        outlineVariant: hexFromArgb(nv.tone(30))
      };
    }
  }
  var variantConstructors = {
    tonal_spot: SchemeTonalSpot,
    vibrant: SchemeVibrant,
    expressive: SchemeExpressive,
    neutral: SchemeNeutral,
    spritz: SchemeNeutral,
    rainbow: SchemeRainbow,
    fruit_salad: SchemeFruitSalad,
    monochrome: SchemeMonochrome,
    content: SchemeContent,
    fidelity: SchemeFidelity,
    android: SchemeAndroid
  };
  var activeTheme = null;
  var activeSourceColors = { primary: "#3F51B5", secondary: null, tertiary: null };
  var activeColorMode = "single";
  var activeVariant = "tonal_spot";
  var activeIsDark = false;
  var monet = {
    argbFromHex,
    hexFromArgb,
    rgbaFromArgb,
    Hct,
    TonalPalette,
    /**
     * Normalize input into { primary, secondary, tertiary, mode }
     * @param {string|Array|Object} input
     */
    normalizeColors(input) {
      if (!input) return { primary: "#3F51B5", secondary: null, tertiary: null, mode: "single" };
      if (typeof input === "string" || typeof input === "number") {
        return { primary: input, secondary: null, tertiary: null, mode: "single" };
      }
      if (Array.isArray(input)) {
        const mode = input.length >= 3 ? "triple" : input.length === 2 ? "dual" : "single";
        return {
          primary: input[0] || "#3F51B5",
          secondary: input[1] || null,
          tertiary: input[2] || null,
          mode
        };
      }
      if (typeof input === "object") {
        let mode = input.mode;
        if (!mode) {
          mode = input.primary && input.secondary && input.tertiary ? "triple" : input.secondary ? "dual" : "single";
        }
        return {
          primary: input.primary || "#3F51B5",
          secondary: input.secondary || null,
          tertiary: input.tertiary || null,
          mode
        };
      }
      return { primary: "#3F51B5", secondary: null, tertiary: null, mode: "single" };
    },
    /**
     * Generate full Monet theme object supporting single, dual, or triple theme colors
     * @param {string|Array|Object} sourceInput - 1, 2, or 3 theme colors
     * @param {Object} [options] - variant: 'tonal_spot'|'vibrant'|'expressive'|'neutral'|'rainbow'|'fruit_salad'|'monochrome', contrastLevel: 0
     * @returns {Object} theme data including palettes, MD3 surfaces, schemes
     */
    generateTheme(sourceInput, options = {}) {
      const { variant = activeVariant || "tonal_spot", contrastLevel = 0 } = options;
      const norm = this.normalizeColors(sourceInput);
      const primaryArgb = parseColorToArgb(norm.primary);
      const primaryHct = Hct.fromInt(primaryArgb);
      let lightSchemeObj;
      let darkSchemeObj;
      const SchemeClass = variantConstructors[variant] || SchemeTonalSpot;
      try {
        lightSchemeObj = new SchemeClass(primaryHct, false, contrastLevel);
        darkSchemeObj = new SchemeClass(primaryHct, true, contrastLevel);
      } catch (e) {
        const fallback = themeFromSourceColor(primaryArgb);
        lightSchemeObj = fallback.schemes.light;
        darkSchemeObj = fallback.schemes.dark;
      }
      const palettes = {
        primary: TonalPalette.fromHueAndChroma(primaryHct.hue, Math.max(28, primaryHct.chroma)),
        secondary: TonalPalette.fromHueAndChroma(primaryHct.hue, 16),
        tertiary: TonalPalette.fromHueAndChroma((primaryHct.hue + 60) % 360, 24),
        neutral: TonalPalette.fromHueAndChroma(primaryHct.hue, 4),
        neutralVariant: TonalPalette.fromHueAndChroma(primaryHct.hue, 8)
      };
      if (norm.secondary) {
        const secArgb = parseColorToArgb(norm.secondary);
        const secHct = Hct.fromInt(secArgb);
        palettes.secondary = TonalPalette.fromHueAndChroma(secHct.hue, Math.max(16, secHct.chroma));
      }
      if (norm.tertiary) {
        const tertArgb = parseColorToArgb(norm.tertiary);
        const tertHct = Hct.fromInt(tertArgb);
        palettes.tertiary = TonalPalette.fromHueAndChroma(tertHct.hue, Math.max(24, tertHct.chroma));
      }
      palettes.accent1 = palettes.primary;
      palettes.accent2 = palettes.secondary;
      palettes.accent3 = palettes.tertiary;
      palettes.neutral1 = palettes.neutral;
      palettes.neutral2 = palettes.neutralVariant;
      const primaryHex = hexFromArgb(primaryArgb);
      const secondaryHex = norm.secondary ? hexFromArgb(parseColorToArgb(norm.secondary)) : hexFromArgb(palettes.secondary.tone(40));
      const tertiaryHex = norm.tertiary ? hexFromArgb(parseColorToArgb(norm.tertiary)) : hexFromArgb(palettes.tertiary.tone(40));
      const lightPrimaryMap = createMduiToneMap(palettes.primary, false);
      const darkPrimaryMap = createMduiToneMap(palettes.primary, true);
      const lightSecondaryMap = createMduiToneMap(palettes.secondary, false);
      const darkSecondaryMap = createMduiToneMap(palettes.secondary, true);
      const lightTertiaryMap = createMduiToneMap(palettes.tertiary, false);
      const darkTertiaryMap = createMduiToneMap(palettes.tertiary, true);
      const lightSurfaces = createMd3Surfaces(palettes, false);
      const darkSurfaces = createMd3Surfaces(palettes, true);
      const lightScheme = {
        primary: hexFromArgb(palettes.primary.tone(40)),
        onPrimary: hexFromArgb(palettes.primary.tone(100)),
        primaryContainer: hexFromArgb(palettes.primary.tone(90)),
        onPrimaryContainer: hexFromArgb(palettes.primary.tone(10)),
        secondary: hexFromArgb(palettes.secondary.tone(40)),
        onSecondary: hexFromArgb(palettes.secondary.tone(100)),
        secondaryContainer: hexFromArgb(palettes.secondary.tone(90)),
        onSecondaryContainer: hexFromArgb(palettes.secondary.tone(10)),
        tertiary: hexFromArgb(palettes.tertiary.tone(40)),
        onTertiary: hexFromArgb(palettes.tertiary.tone(100)),
        tertiaryContainer: hexFromArgb(palettes.tertiary.tone(90)),
        onTertiaryContainer: hexFromArgb(palettes.tertiary.tone(10)),
        ...lightSurfaces
      };
      const darkScheme = {
        primary: hexFromArgb(palettes.primary.tone(80)),
        onPrimary: hexFromArgb(palettes.primary.tone(20)),
        primaryContainer: hexFromArgb(palettes.primary.tone(30)),
        onPrimaryContainer: hexFromArgb(palettes.primary.tone(90)),
        secondary: hexFromArgb(palettes.secondary.tone(80)),
        onSecondary: hexFromArgb(palettes.secondary.tone(20)),
        secondaryContainer: hexFromArgb(palettes.secondary.tone(30)),
        onSecondaryContainer: hexFromArgb(palettes.secondary.tone(90)),
        tertiary: hexFromArgb(palettes.tertiary.tone(80)),
        onTertiary: hexFromArgb(palettes.tertiary.tone(20)),
        tertiaryContainer: hexFromArgb(palettes.tertiary.tone(30)),
        onTertiaryContainer: hexFromArgb(palettes.tertiary.tone(90)),
        ...darkSurfaces
      };
      return {
        sourceColor: primaryHex,
        sourceColors: {
          primary: primaryHex,
          secondary: secondaryHex,
          tertiary: tertiaryHex
        },
        colorMode: norm.mode,
        variant,
        palettes,
        schemes: {
          light: lightScheme,
          dark: darkScheme
        },
        surfaces: {
          light: lightSurfaces,
          dark: darkSurfaces
        },
        mduiTones: {
          light: {
            primary: lightPrimaryMap,
            secondary: lightSecondaryMap,
            tertiary: lightTertiaryMap,
            accent: lightTertiaryMap
          },
          dark: {
            primary: darkPrimaryMap,
            secondary: darkSecondaryMap,
            tertiary: darkTertiaryMap,
            accent: darkTertiaryMap
          }
        }
      };
    },
    /**
     * Set Monet seed color(s) and apply theme (Supports 1, 2, or 3 colors)
     * @param {string|Array|Object} colors - Single color, array (1..3 colors), or { primary, secondary, tertiary, mode }
     * @param {Object} [options] - Options: target, dark, variant, apply
     */
    setColor(colors, options = {}) {
      const {
        target = typeof document !== "undefined" ? document.documentElement : null,
        dark = activeIsDark,
        variant = activeVariant || "tonal_spot",
        apply = true
      } = options;
      const norm = this.normalizeColors(colors);
      activeSourceColors = norm;
      activeColorMode = norm.mode;
      activeVariant = variant;
      activeIsDark = Boolean(dark);
      const theme = this.generateTheme(norm, { variant });
      activeTheme = theme;
      if (apply && target) {
        this.applyTheme(theme, { target, dark: activeIsDark });
      }
      return theme;
    },
    /**
     * Convenience helpers
     */
    setSingleColor(primary, options = {}) {
      return this.setColor({ primary, secondary: null, tertiary: null, mode: "single" }, options);
    },
    setDualColors(primary, secondary, options = {}) {
      return this.setColor({ primary, secondary, tertiary: null, mode: "dual" }, options);
    },
    setTripleColors(primary, secondary, tertiary, options = {}) {
      return this.setColor({ primary, secondary, tertiary, mode: "triple" }, options);
    },
    /**
     * Set dynamic scheme variant (Android 13+)
     */
    setVariant(variant, target = typeof document !== "undefined" ? document.documentElement : null) {
      activeVariant = variant;
      if (activeSourceColors) {
        return this.setColor(activeSourceColors, { target, variant: activeVariant, dark: activeIsDark });
      }
    },
    /**
     * Extract Monet theme from image element, canvas or image URL
     * @param {HTMLImageElement|HTMLCanvasElement|string} imageSource
     * @param {Object} [options] - count: 1 | 2 | 3 (number of colors to extract), variant, dark
     * @returns {Promise<Object>}
     */
    async fromImage(imageSource, options = {}) {
      if (typeof document === "undefined") {
        throw new Error("fromImage requires browser environment");
      }
      const { count = 3, maxColors = 3, variant = activeVariant || "tonal_spot" } = options;
      const targetCount = count || maxColors || 3;
      let imgElement;
      if (typeof imageSource === "string") {
        imgElement = await new Promise((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = "Anonymous";
          img.onload = () => resolve(img);
          img.onerror = (e) => reject(new Error("Failed to load image for Monet color extraction: " + imageSource));
          img.src = imageSource;
        });
      } else {
        imgElement = imageSource;
      }
      let topColors = [];
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const maxDim = 128;
        const scale = Math.min(1, maxDim / Math.max(imgElement.width || 1, imgElement.height || 1));
        canvas.width = Math.max(1, Math.floor((imgElement.width || maxDim) * scale));
        canvas.height = Math.max(1, Math.floor((imgElement.height || maxDim) * scale));
        ctx.drawImage(imgElement, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = [];
        for (let i = 0; i < imageData.data.length; i += 4) {
          const r = imageData.data[i];
          const g = imageData.data[i + 1];
          const b = imageData.data[i + 2];
          const a = imageData.data[i + 3];
          if (a >= 255) {
            pixels.push(255 << 24 | r << 16 | g << 8 | b);
          }
        }
        const quantized = QuantizerCelebi.quantize(pixels, 128);
        const ranked = Score.score(quantized);
        topColors = ranked.slice(0, Math.min(3, targetCount)).map((argb) => hexFromArgb(argb));
      } catch (err) {
        topColors = ["#3F51B5"];
      }
      if (topColors.length === 0) topColors = ["#3F51B5"];
      const mode = targetCount === 1 ? "single" : targetCount === 2 ? "dual" : "triple";
      return this.setColor({
        primary: topColors[0],
        secondary: targetCount >= 2 ? topColors[1] || null : null,
        tertiary: targetCount >= 3 ? topColors[2] || null : null,
        mode
      }, { ...options, variant });
    },
    /**
     * Toggle or set dark mode for Monet theme
     */
    setDarkMode(isDark, target = typeof document !== "undefined" ? document.documentElement : null) {
      activeIsDark = Boolean(isDark);
      if (activeTheme && target) {
        this.applyTheme(activeTheme, { target, dark: activeIsDark });
      }
    },
    /**
     * Apply theme data as CSS variables to target DOM node
     */
    applyTheme(theme, options = {}) {
      const {
        target = typeof document !== "undefined" ? document.documentElement : null,
        dark = activeIsDark
      } = options;
      if (!target || !target.style) return;
      activeIsDark = Boolean(dark);
      const mode = activeIsDark ? "dark" : "light";
      const scheme = theme.schemes[mode];
      const tones = theme.mduiTones[mode];
      target.classList.add("mdui-theme-monet");
      if (activeIsDark) {
        target.classList.add("mdui-theme-layout-dark");
      } else {
        target.classList.remove("mdui-theme-layout-dark");
      }
      const style = target.style;
      style.setProperty("--mdui-monet-source", theme.sourceColor);
      style.setProperty("--mdui-monet-source-primary", theme.sourceColors.primary);
      style.setProperty("--mdui-monet-source-secondary", theme.sourceColors.secondary);
      style.setProperty("--mdui-monet-source-tertiary", theme.sourceColors.tertiary);
      style.setProperty("--mdui-monet-color-mode", theme.colorMode || "single");
      style.setProperty("--mdui-monet-variant", theme.variant || "tonal_spot");
      style.setProperty("--mdui-monet-mode", mode);
      for (const [role, hex] of Object.entries(scheme)) {
        const kebab = role.replace(/([A-Z])/g, "-$1").toLowerCase();
        style.setProperty(`--mdui-monet-${kebab}`, hex);
      }
      for (const [degree, hex] of Object.entries(tones.primary)) {
        style.setProperty(`--mdui-monet-primary-${degree}`, hex);
      }
      for (const [degree, hex] of Object.entries(tones.secondary)) {
        style.setProperty(`--mdui-monet-secondary-${degree}`, hex);
      }
      for (const [degree, hex] of Object.entries(tones.tertiary)) {
        style.setProperty(`--mdui-monet-tertiary-${degree}`, hex);
      }
      for (const [degree, hex] of Object.entries(tones.accent)) {
        style.setProperty(`--mdui-monet-accent-${degree}`, hex);
      }
      style.setProperty("--mdui-monet-primary-main", scheme.primary);
      style.setProperty("--mdui-monet-primary-contrast", scheme.onPrimary);
      style.setProperty("--mdui-monet-secondary-main", scheme.secondary);
      style.setProperty("--mdui-monet-secondary-contrast", scheme.onSecondary);
      style.setProperty("--mdui-monet-tertiary-main", scheme.tertiary);
      style.setProperty("--mdui-monet-tertiary-contrast", scheme.onTertiary);
      style.setProperty("--mdui-monet-accent-main", scheme.tertiary || scheme.secondary);
      style.setProperty("--mdui-monet-accent-contrast", scheme.onTertiary || scheme.onSecondary);
      style.setProperty("--mdui-monet-bg", scheme.background);
      style.setProperty("--mdui-monet-surface-bg", scheme.surfaceContainer || scheme.surface);
      style.setProperty("--mdui-monet-text-main", scheme.onSurface);
    },
    /**
     * Reset target and remove Monet theme (reverting to MD 19 colors)
     */
    reset(target = typeof document !== "undefined" ? document.documentElement : null) {
      if (!target || !target.style) return;
      target.classList.remove("mdui-theme-monet");
      const toRemove = [];
      for (let i = 0; i < target.style.length; i++) {
        const prop = target.style[i];
        if (prop && prop.startsWith("--mdui-monet-")) {
          toRemove.push(prop);
        }
      }
      toRemove.forEach((prop) => target.style.removeProperty(prop));
      activeTheme = null;
    },
    getTheme() {
      return activeTheme;
    },
    getSourceColors() {
      return activeSourceColors;
    },
    getColorMode() {
      return activeColorMode;
    },
    getVariant() {
      return activeVariant;
    },
    isDarkMode() {
      return activeIsDark;
    }
  };
  var monet_default = monet;
  return __toCommonJS(monet_exports);
})();
/*! Bundled license information:

@material/material-color-utilities/utils/math_utils.js:
@material/material-color-utilities/utils/color_utils.js:
@material/material-color-utilities/hct/viewing_conditions.js:
@material/material-color-utilities/hct/cam16.js:
@material/material-color-utilities/hct/hct_solver.js:
@material/material-color-utilities/hct/hct.js:
@material/material-color-utilities/blend/blend.js:
@material/material-color-utilities/palettes/tonal_palette.js:
@material/material-color-utilities/palettes/core_palette.js:
@material/material-color-utilities/quantize/lab_point_provider.js:
@material/material-color-utilities/quantize/quantizer_wsmeans.js:
@material/material-color-utilities/quantize/quantizer_map.js:
@material/material-color-utilities/quantize/quantizer_wu.js:
@material/material-color-utilities/quantize/quantizer_celebi.js:
@material/material-color-utilities/scheme/scheme.js:
@material/material-color-utilities/scheme/scheme_android.js:
@material/material-color-utilities/score/score.js:
@material/material-color-utilities/utils/string_utils.js:
@material/material-color-utilities/utils/image_utils.js:
@material/material-color-utilities/utils/theme_utils.js:
@material/material-color-utilities/index.js:
  (**
   * @license
   * Copyright 2021 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *      http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@material/material-color-utilities/contrast/contrast.js:
@material/material-color-utilities/dynamiccolor/dynamic_color.js:
@material/material-color-utilities/dynamiccolor/variant.js:
@material/material-color-utilities/dynamiccolor/material_dynamic_colors.js:
@material/material-color-utilities/dynamiccolor/dynamic_scheme.js:
@material/material-color-utilities/scheme/scheme_expressive.js:
@material/material-color-utilities/scheme/scheme_fruit_salad.js:
@material/material-color-utilities/scheme/scheme_monochrome.js:
@material/material-color-utilities/scheme/scheme_neutral.js:
@material/material-color-utilities/scheme/scheme_rainbow.js:
@material/material-color-utilities/scheme/scheme_tonal_spot.js:
@material/material-color-utilities/scheme/scheme_vibrant.js:
  (**
   * @license
   * Copyright 2022 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *      http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@material/material-color-utilities/dislike/dislike_analyzer.js:
@material/material-color-utilities/temperature/temperature_cache.js:
@material/material-color-utilities/dynamiccolor/contrast_curve.js:
@material/material-color-utilities/dynamiccolor/tone_delta_pair.js:
@material/material-color-utilities/scheme/scheme_content.js:
@material/material-color-utilities/scheme/scheme_fidelity.js:
  (**
   * @license
   * Copyright 2023 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *      http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@material/material-color-utilities/dynamiccolor/color_spec_2021.js:
@material/material-color-utilities/dynamiccolor/color_spec_2025.js:
  (**
   * @license
   * Copyright 2025 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *      http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
*/

    if (typeof mdui_monet_bundle !== 'undefined') {
      mdui.monet = mdui_monet_bundle.monet || mdui_monet_bundle.default || mdui_monet_bundle;
    }
  })();

  return mdui;

})));
//# sourceMappingURL=mdui.js.map
