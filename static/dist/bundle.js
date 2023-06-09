(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Router = void 0;
/**
 * APEE 路由管理模块
 * @author 欧阳鹏
 * @version 1.2.1
 * @link https://github.com/oyps/apee-router
 */
var ApeeRouter = /** @class */ (function () {
    /**
     * 实例化路由管理模块
     * @param options 配置选项
     */
    function ApeeRouter(options) {
        /** 路由列表 */
        this.routeList = {};
        /** 是否发生过 `hashChange` 事件 */
        this.hashChanged = false;
        if (options === null || options === void 0 ? void 0 : options.default)
            this.setDefaultRoute(options.default);
        if (options === null || options === void 0 ? void 0 : options.routeSet)
            this.setRouteOption(options.routeSet);
    }
    ApeeRouter.prototype.setRouteOption = function (routeSet) {
        var _this_1 = this;
        if (!Array.isArray(routeSet))
            throw new Error('routeSet 类型错误');
        routeSet.forEach(function (set) {
            if (typeof set == 'string')
                _this_1.set(set);
            else if (Array.isArray(set)) {
                if (set.length == 2 && typeof set[1] != 'string')
                    _this_1.set.apply(_this_1, set);
                else
                    _this_1.set(set);
            }
            else {
                throw new Error('routeSet 类型错误');
            }
        });
    };
    /**
     * 设置默认路由
     * @param _default 默认路由选项
     */
    ApeeRouter.prototype.setDefaultRoute = function (_default) {
        if (typeof _default == 'string')
            this.defaultRoute = this.set(_default)[0];
        else if (Array.isArray(_default))
            this.defaultRoute = this.set.apply(this, _default)[0];
        else
            throw new Error('default 选项类型错误');
    };
    /**
     * 设置路由
     * @param routeName 路由名称，可通过数组传入多个
     * @param routeEvent 路由事件，可通过数组传入多个
     */
    ApeeRouter.prototype.set = function (routeName, routeEvent) {
        var _a;
        var routeNames = Array.isArray(routeName) ? routeName : [routeName];
        var routes = [];
        for (var i = 0; i < routeNames.length; i++) {
            var routeName_1 = routeNames[i];
            var routeEvents = routeEvent ? Array.isArray(routeEvent) ? routeEvent : [routeEvent] : [];
            var route = this.routeList[routeName_1];
            // 路由已经存在，追加路由事件列表
            if (route) {
                (_a = route.event).push.apply(_a, routeEvents);
                routes.push(route);
                continue;
            }
            // 路由不存在，开始创建新路由
            var dom = this.getRouteDom(routeName_1);
            // 路由对应的 DOM 不存在
            if (!dom)
                throw new Error("data-route=\"".concat(routeName_1, "\" \u7684 HTML \u5143\u7D20\u6CA1\u6709\u627E\u5230"));
            // 创建新路由
            var newRoute = this.routeList[routeName_1] = {
                name: routeName_1,
                event: routeEvents,
                dom: dom,
                data: {},
                args: [],
                status: 0
            };
            routes.push(newRoute);
        }
        return routes;
    };
    ApeeRouter.prototype.getRouteDom = function (routeName, exclude) {
        if (exclude === void 0) { exclude = false; }
        var selector;
        if (exclude && routeName)
            selector = "[data-route]:not([data-route=\"".concat(routeName, "\"]");
        else
            selector = routeName ? "[data-route=\"".concat(routeName, "\"]") : '[data-route]';
        var result = document.querySelectorAll(selector);
        if (routeName && !exclude && result.length == 0)
            throw new Error("".concat(selector, " \u5143\u7D20\u4E0D\u5B58\u5728"));
        return routeName && !exclude ? result[0] : result;
    };
    /**
     * 载入路由
     * @param route 路由对象
     * @param args 路由参数
     */
    ApeeRouter.prototype.loadRoute = function (route, args) {
        var _this_1 = this;
        if (args === void 0) { args = []; }
        this.getRouteDom(route.name, true).forEach(function (dom) {
            dom.style.display = 'none';
        });
        this.getRouteDom(route.name).style.display = 'block';
        route.args = args;
        route.event.forEach(function (event) { return event(route, _this_1); });
    };
    /** 启动路由系统 */
    ApeeRouter.prototype.start = function () {
        var _this_1 = this;
        var _this = this;
        var listener = function (event) {
            if (event)
                _this_1.hashChanged = true;
            var newUrl = (event === null || event === void 0 ? void 0 : event.newURL) || location.href;
            var newHash = new URL(newUrl).hash;
            var args = newHash.split('/').slice(2);
            if (newHash == '')
                return _this.loadRoute(_this.defaultRoute, args);
            var routeName = newHash.split('/')[1];
            var route = _this.routeList[routeName];
            if (!route)
                return location.hash = '';
            _this.loadRoute(route, args);
        };
        if (!this.defaultRoute)
            this.setDefaultRoute('home');
        window.addEventListener('hashchange', listener);
        listener();
    };
    /**
     * 获取当前路由名称
     * @returns 当前路由名称
     * @since 1.1.18
     */
    ApeeRouter.prototype.getNowRouteName = function () {
        return location.hash == '' ? this.defaultRoute.name : location.hash.split('/')[1];
    };
    /** 工具类 */
    ApeeRouter.util = {
        /** 显示元素 */
        show: function (dom) {
            if (!dom)
                return;
            var doms = dom instanceof Node ? [dom] : dom;
            doms.forEach(function (dom) { return dom.style.display = 'block'; });
        },
        /** 隐藏 DOM */
        hide: function (dom) {
            if (!dom)
                return;
            var doms = dom instanceof Node ? [dom] : dom;
            doms.forEach(function (dom) { return dom.style.display = 'none'; });
        },
    };
    return ApeeRouter;
}());
exports.Router = ApeeRouter;
exports.default = ApeeRouter;

},{}],2:[function(require,module,exports){
var charenc = {
  // UTF-8 encoding
  utf8: {
    // Convert a string to a byte array
    stringToBytes: function(str) {
      return charenc.bin.stringToBytes(unescape(encodeURIComponent(str)));
    },

    // Convert a byte array to a string
    bytesToString: function(bytes) {
      return decodeURIComponent(escape(charenc.bin.bytesToString(bytes)));
    }
  },

  // Binary encoding
  bin: {
    // Convert a string to a byte array
    stringToBytes: function(str) {
      for (var bytes = [], i = 0; i < str.length; i++)
        bytes.push(str.charCodeAt(i) & 0xFF);
      return bytes;
    },

    // Convert a byte array to a string
    bytesToString: function(bytes) {
      for (var str = [], i = 0; i < bytes.length; i++)
        str.push(String.fromCharCode(bytes[i]));
      return str.join('');
    }
  }
};

module.exports = charenc;

},{}],3:[function(require,module,exports){
(function() {
  var base64map
      = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',

  crypt = {
    // Bit-wise rotation left
    rotl: function(n, b) {
      return (n << b) | (n >>> (32 - b));
    },

    // Bit-wise rotation right
    rotr: function(n, b) {
      return (n << (32 - b)) | (n >>> b);
    },

    // Swap big-endian to little-endian and vice versa
    endian: function(n) {
      // If number given, swap endian
      if (n.constructor == Number) {
        return crypt.rotl(n, 8) & 0x00FF00FF | crypt.rotl(n, 24) & 0xFF00FF00;
      }

      // Else, assume array and swap all items
      for (var i = 0; i < n.length; i++)
        n[i] = crypt.endian(n[i]);
      return n;
    },

    // Generate an array of any length of random bytes
    randomBytes: function(n) {
      for (var bytes = []; n > 0; n--)
        bytes.push(Math.floor(Math.random() * 256));
      return bytes;
    },

    // Convert a byte array to big-endian 32-bit words
    bytesToWords: function(bytes) {
      for (var words = [], i = 0, b = 0; i < bytes.length; i++, b += 8)
        words[b >>> 5] |= bytes[i] << (24 - b % 32);
      return words;
    },

    // Convert big-endian 32-bit words to a byte array
    wordsToBytes: function(words) {
      for (var bytes = [], b = 0; b < words.length * 32; b += 8)
        bytes.push((words[b >>> 5] >>> (24 - b % 32)) & 0xFF);
      return bytes;
    },

    // Convert a byte array to a hex string
    bytesToHex: function(bytes) {
      for (var hex = [], i = 0; i < bytes.length; i++) {
        hex.push((bytes[i] >>> 4).toString(16));
        hex.push((bytes[i] & 0xF).toString(16));
      }
      return hex.join('');
    },

    // Convert a hex string to a byte array
    hexToBytes: function(hex) {
      for (var bytes = [], c = 0; c < hex.length; c += 2)
        bytes.push(parseInt(hex.substr(c, 2), 16));
      return bytes;
    },

    // Convert a byte array to a base-64 string
    bytesToBase64: function(bytes) {
      for (var base64 = [], i = 0; i < bytes.length; i += 3) {
        var triplet = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
        for (var j = 0; j < 4; j++)
          if (i * 8 + j * 6 <= bytes.length * 8)
            base64.push(base64map.charAt((triplet >>> 6 * (3 - j)) & 0x3F));
          else
            base64.push('=');
      }
      return base64.join('');
    },

    // Convert a base-64 string to a byte array
    base64ToBytes: function(base64) {
      // Remove non-base-64 characters
      base64 = base64.replace(/[^A-Z0-9+\/]/ig, '');

      for (var bytes = [], i = 0, imod4 = 0; i < base64.length;
          imod4 = ++i % 4) {
        if (imod4 == 0) continue;
        bytes.push(((base64map.indexOf(base64.charAt(i - 1))
            & (Math.pow(2, -2 * imod4 + 8) - 1)) << (imod4 * 2))
            | (base64map.indexOf(base64.charAt(i)) >>> (6 - imod4 * 2)));
      }
      return bytes;
    }
  };

  module.exports = crypt;
})();

},{}],4:[function(require,module,exports){
/*!
 * Determine if an object is a Buffer
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */

// The _isBuffer check is for Safari 5-7 support, because it's missing
// Object.prototype.constructor. Remove this eventually
module.exports = function (obj) {
  return obj != null && (isBuffer(obj) || isSlowBuffer(obj) || !!obj._isBuffer)
}

function isBuffer (obj) {
  return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
}

// For Node v0.10 support. Remove this eventually.
function isSlowBuffer (obj) {
  return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isBuffer(obj.slice(0, 0))
}

},{}],5:[function(require,module,exports){
(function(){
  var crypt = require('crypt'),
      utf8 = require('charenc').utf8,
      isBuffer = require('is-buffer'),
      bin = require('charenc').bin,

  // The core
  md5 = function (message, options) {
    // Convert to byte array
    if (message.constructor == String)
      if (options && options.encoding === 'binary')
        message = bin.stringToBytes(message);
      else
        message = utf8.stringToBytes(message);
    else if (isBuffer(message))
      message = Array.prototype.slice.call(message, 0);
    else if (!Array.isArray(message) && message.constructor !== Uint8Array)
      message = message.toString();
    // else, assume byte array already

    var m = crypt.bytesToWords(message),
        l = message.length * 8,
        a =  1732584193,
        b = -271733879,
        c = -1732584194,
        d =  271733878;

    // Swap endian
    for (var i = 0; i < m.length; i++) {
      m[i] = ((m[i] <<  8) | (m[i] >>> 24)) & 0x00FF00FF |
             ((m[i] << 24) | (m[i] >>>  8)) & 0xFF00FF00;
    }

    // Padding
    m[l >>> 5] |= 0x80 << (l % 32);
    m[(((l + 64) >>> 9) << 4) + 14] = l;

    // Method shortcuts
    var FF = md5._ff,
        GG = md5._gg,
        HH = md5._hh,
        II = md5._ii;

    for (var i = 0; i < m.length; i += 16) {

      var aa = a,
          bb = b,
          cc = c,
          dd = d;

      a = FF(a, b, c, d, m[i+ 0],  7, -680876936);
      d = FF(d, a, b, c, m[i+ 1], 12, -389564586);
      c = FF(c, d, a, b, m[i+ 2], 17,  606105819);
      b = FF(b, c, d, a, m[i+ 3], 22, -1044525330);
      a = FF(a, b, c, d, m[i+ 4],  7, -176418897);
      d = FF(d, a, b, c, m[i+ 5], 12,  1200080426);
      c = FF(c, d, a, b, m[i+ 6], 17, -1473231341);
      b = FF(b, c, d, a, m[i+ 7], 22, -45705983);
      a = FF(a, b, c, d, m[i+ 8],  7,  1770035416);
      d = FF(d, a, b, c, m[i+ 9], 12, -1958414417);
      c = FF(c, d, a, b, m[i+10], 17, -42063);
      b = FF(b, c, d, a, m[i+11], 22, -1990404162);
      a = FF(a, b, c, d, m[i+12],  7,  1804603682);
      d = FF(d, a, b, c, m[i+13], 12, -40341101);
      c = FF(c, d, a, b, m[i+14], 17, -1502002290);
      b = FF(b, c, d, a, m[i+15], 22,  1236535329);

      a = GG(a, b, c, d, m[i+ 1],  5, -165796510);
      d = GG(d, a, b, c, m[i+ 6],  9, -1069501632);
      c = GG(c, d, a, b, m[i+11], 14,  643717713);
      b = GG(b, c, d, a, m[i+ 0], 20, -373897302);
      a = GG(a, b, c, d, m[i+ 5],  5, -701558691);
      d = GG(d, a, b, c, m[i+10],  9,  38016083);
      c = GG(c, d, a, b, m[i+15], 14, -660478335);
      b = GG(b, c, d, a, m[i+ 4], 20, -405537848);
      a = GG(a, b, c, d, m[i+ 9],  5,  568446438);
      d = GG(d, a, b, c, m[i+14],  9, -1019803690);
      c = GG(c, d, a, b, m[i+ 3], 14, -187363961);
      b = GG(b, c, d, a, m[i+ 8], 20,  1163531501);
      a = GG(a, b, c, d, m[i+13],  5, -1444681467);
      d = GG(d, a, b, c, m[i+ 2],  9, -51403784);
      c = GG(c, d, a, b, m[i+ 7], 14,  1735328473);
      b = GG(b, c, d, a, m[i+12], 20, -1926607734);

      a = HH(a, b, c, d, m[i+ 5],  4, -378558);
      d = HH(d, a, b, c, m[i+ 8], 11, -2022574463);
      c = HH(c, d, a, b, m[i+11], 16,  1839030562);
      b = HH(b, c, d, a, m[i+14], 23, -35309556);
      a = HH(a, b, c, d, m[i+ 1],  4, -1530992060);
      d = HH(d, a, b, c, m[i+ 4], 11,  1272893353);
      c = HH(c, d, a, b, m[i+ 7], 16, -155497632);
      b = HH(b, c, d, a, m[i+10], 23, -1094730640);
      a = HH(a, b, c, d, m[i+13],  4,  681279174);
      d = HH(d, a, b, c, m[i+ 0], 11, -358537222);
      c = HH(c, d, a, b, m[i+ 3], 16, -722521979);
      b = HH(b, c, d, a, m[i+ 6], 23,  76029189);
      a = HH(a, b, c, d, m[i+ 9],  4, -640364487);
      d = HH(d, a, b, c, m[i+12], 11, -421815835);
      c = HH(c, d, a, b, m[i+15], 16,  530742520);
      b = HH(b, c, d, a, m[i+ 2], 23, -995338651);

      a = II(a, b, c, d, m[i+ 0],  6, -198630844);
      d = II(d, a, b, c, m[i+ 7], 10,  1126891415);
      c = II(c, d, a, b, m[i+14], 15, -1416354905);
      b = II(b, c, d, a, m[i+ 5], 21, -57434055);
      a = II(a, b, c, d, m[i+12],  6,  1700485571);
      d = II(d, a, b, c, m[i+ 3], 10, -1894986606);
      c = II(c, d, a, b, m[i+10], 15, -1051523);
      b = II(b, c, d, a, m[i+ 1], 21, -2054922799);
      a = II(a, b, c, d, m[i+ 8],  6,  1873313359);
      d = II(d, a, b, c, m[i+15], 10, -30611744);
      c = II(c, d, a, b, m[i+ 6], 15, -1560198380);
      b = II(b, c, d, a, m[i+13], 21,  1309151649);
      a = II(a, b, c, d, m[i+ 4],  6, -145523070);
      d = II(d, a, b, c, m[i+11], 10, -1120210379);
      c = II(c, d, a, b, m[i+ 2], 15,  718787259);
      b = II(b, c, d, a, m[i+ 9], 21, -343485551);

      a = (a + aa) >>> 0;
      b = (b + bb) >>> 0;
      c = (c + cc) >>> 0;
      d = (d + dd) >>> 0;
    }

    return crypt.endian([a, b, c, d]);
  };

  // Auxiliary functions
  md5._ff  = function (a, b, c, d, x, s, t) {
    var n = a + (b & c | ~b & d) + (x >>> 0) + t;
    return ((n << s) | (n >>> (32 - s))) + b;
  };
  md5._gg  = function (a, b, c, d, x, s, t) {
    var n = a + (b & d | c & ~d) + (x >>> 0) + t;
    return ((n << s) | (n >>> (32 - s))) + b;
  };
  md5._hh  = function (a, b, c, d, x, s, t) {
    var n = a + (b ^ c ^ d) + (x >>> 0) + t;
    return ((n << s) | (n >>> (32 - s))) + b;
  };
  md5._ii  = function (a, b, c, d, x, s, t) {
    var n = a + (c ^ (b | ~d)) + (x >>> 0) + t;
    return ((n << s) | (n >>> (32 - s))) + b;
  };

  // Package private blocksize
  md5._blocksize = 16;
  md5._digestsize = 16;

  module.exports = function (message, options) {
    if (message === undefined || message === null)
      throw new Error('Illegal argument ' + message);

    var digestbytes = crypt.wordsToBytes(md5(message, options));
    return options && options.asBytes ? digestbytes :
        options && options.asString ? bin.bytesToString(digestbytes) :
        crypt.bytesToHex(digestbytes);
  };

})();

},{"charenc":2,"crypt":3,"is-buffer":4}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = exports.apiConfig = void 0;
/** API 接口配置 */
exports.apiConfig = {
    /** 网页标题获取，`=` 结尾，内置接口为 `/api/getTitle` */
    getTitle: 'https://get-html.9494666.xyz/?type=title&url=',
    /** 新增收藏 */
    add: '/api/add',
    /** 获取标签列表 */
    getTag: '/api/tagList',
    /** 登录接口 */
    login: '/api/login',
    /** 注册接口 */
    register: '/api/register',
    /** 发送验证码 */
    sendCode: '/api/sendCode',
    /** 加载标签列表，可搜索 */
    tagList: '/api/tagList',
    /** 加载收藏列表，可搜索 */
    collectList: '/api/collectList'
};
/** 网站配置 */
exports.config = {
    /** API 接口配置 */
    api: exports.apiConfig
};

},{}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
var apee_router_1 = require("apee-router");
var home_1 = require("./route/home");
var login_1 = require("./route/login");
var user_1 = require("./route/user");
var add_1 = require("./route/add");
var list_1 = require("./route/list");
var template_1 = require("./template");
exports.router = new apee_router_1.Router();
exports.router.set(['home', 'add', 'list', 'tag', 'user', 'login']);
exports.router.set('home', home_1.home);
exports.router.set('login', login_1.login);
exports.router.set('user', user_1.user);
exports.router.set('add', add_1.add);
exports.router.set('list', list_1.list);
exports.router.start();
(0, login_1.checkLogin)();
(0, template_1.loadTemplate)(exports.router);

},{"./route/add":8,"./route/home":9,"./route/list":10,"./route/login":11,"./route/user":12,"./template":13,"apee-router":1}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.add = void 0;
var util_1 = require("../util");
var config_1 = require("../config");
/** `hash = #/add` */
var add = function (route) {
    if (route.status == 0) {
        route.status = 1;
        /** 标签列表 */
        var tagList_1 = [];
        var elementGroup_1 = {
            input: {
                /** 网址输入框 */
                url: route.dom.querySelector('.input-url'),
                /** 标题输入框 */
                title: route.dom.querySelector('.input-title'),
                /** 标签输入框 */
                tag: route.dom.querySelector('.input-tag'),
            },
            textarea: {
                /** 描述文本输入框 */
                text: route.dom.querySelector('.input-text'),
            },
            button: {
                /** 按钮：获取 Origin */
                getOrigin: route.dom.querySelector('.get-origin'),
                /** 按钮：根据 URL 获取标题 */
                getTitle: route.dom.querySelector('.get-title'),
                /** 按钮：点击提交 */
                submit: route.dom.querySelector('.submit'),
                /** 按钮：点击重置 */
                reset: route.dom.querySelector('.reset'),
                /** 按钮：点击增加标签 */
                addTag: route.dom.querySelector('.add-tag')
            },
            div: {
                /** 当前已经插入的标签列表 */
                tagList: route.dom.querySelector('.tag-list'),
                /** 标签搜索结果列表 */
                searchResult: route.dom.querySelector('.search-result-list')
            }
        };
        // 设置单击事件：单击获取 Origin
        elementGroup_1.button.getOrigin.addEventListener('click', function () {
            var ele = elementGroup_1.input.url;
            ele.focus();
            try {
                ele.value = new URL(ele.value).origin;
            }
            catch (_a) { }
        });
        // 设置单击事件：单击根据 URL 获取标题
        elementGroup_1.button.getTitle.addEventListener('click', function () {
            var url = elementGroup_1.input.url.value;
            if (!(0, util_1.checkUrl)(url))
                return alert('输入的 URL 不合法');
            elementGroup_1.button.getTitle.setAttribute('disabled', 'disabled');
            elementGroup_1.button.getTitle.innerHTML = '正在抓取';
            var xhr = new XMLHttpRequest();
            xhr.open('GET', config_1.apiConfig.getTitle + encodeURIComponent(url));
            xhr.timeout = 5000;
            xhr.send();
            var endStatus = function () {
                elementGroup_1.button.getTitle.removeAttribute('disabled');
                elementGroup_1.button.getTitle.innerHTML = '自动抓取';
            };
            xhr.addEventListener('readystatechange', function () {
                if (xhr.status == 200 && xhr.readyState == xhr.DONE) {
                    var res = JSON.parse(xhr.responseText);
                    endStatus();
                    if (res.code == 200) {
                        elementGroup_1.input.title.value = res.data;
                        return;
                    }
                    alert(res.msg);
                }
            });
            xhr.onerror = xhr.ontimeout = endStatus;
        });
        // URL 输入框回车获取 Origin
        elementGroup_1.input.url.addEventListener('keyup', function (event) {
            if (event.key == 'Enter')
                elementGroup_1.button.getOrigin.click();
        });
        // 标题输入框回车根据 URL 获取标题
        elementGroup_1.input.title.addEventListener('keyup', function (event) {
            if (event.key == 'Enter')
                elementGroup_1.button.getTitle.click();
        });
        /** 标签列表为空时的提示元素 */
        var emptyTag_1 = document.createElement('button');
        emptyTag_1.setAttribute('class', 'btn w-100 border border-2');
        emptyTag_1.innerText = '当前标签列表为空';
        elementGroup_1.div.tagList.append(emptyTag_1);
        elementGroup_1.button.addTag.addEventListener('click', function () {
            insertTag_1();
            changeTagList_1();
        });
        /**
         * 生成新的标签 DOM
         * @param tag 标签名称
         * @param color 颜色代码
         * @returns 标签 DOM
         */
        var makeNewTag_1 = function (tag, color) {
            var newTagEle = document.createElement('div');
            newTagEle.classList.add('list-group-item', 'list-group-item-action', 'list-group-item-' + color);
            newTagEle.innerHTML = tag;
            return newTagEle;
        };
        /**
         * 向标签列表中插入新的标签
         * @param tag 标签名称
         */
        var insertTag_1 = function (tag) {
            elementGroup_1.input.tag.focus();
            var tagValue = elementGroup_1.input.tag.value;
            elementGroup_1.input.tag.value = '';
            if (typeof tag == 'undefined')
                tag = tagValue;
            if (tag.match(/^\s*$/))
                return;
            if (tagList_1.includes(tag))
                return;
            var newTagEle = makeNewTag_1(tag, 'success');
            tagList_1.push(tag);
            elementGroup_1.div.tagList.append(newTagEle);
            emptyTag_1.remove();
            newTagEle.addEventListener('click', function () {
                newTagEle.remove();
                var index = tagList_1.indexOf(tag);
                tagList_1.splice(index, 1);
                if (tagList_1.length == 0)
                    elementGroup_1.div.tagList.append(emptyTag_1);
            });
        };
        /** 定时器，用于标签输入框触发标签搜索时的节流 */
        var tagEditTimer_1;
        /** 用于搜索标签的 XHR 对象 */
        var tagSearchXhr_1 = new XMLHttpRequest();
        // 标签搜索完成事件
        tagSearchXhr_1.addEventListener('readystatechange', function () {
            if (tagSearchXhr_1.status == 200 && tagSearchXhr_1.readyState == tagSearchXhr_1.DONE) {
                var res = JSON.parse(tagSearchXhr_1.responseText);
                if (res.code == 200) {
                    var result = res.data;
                    if (result.length == 0) {
                        changeTagList_1();
                    }
                    else {
                        elementGroup_1.div.searchResult.innerHTML = '';
                        result.forEach(function (tag) {
                            var newTagEle = makeNewTag_1('推荐：' + tag, 'light');
                            elementGroup_1.div.searchResult.append(newTagEle);
                            newTagEle.addEventListener('click', function () {
                                changeTagList_1();
                                insertTag_1(tag);
                            });
                        });
                        changeSearchResult_1();
                    }
                    return;
                }
                alert(res.msg);
            }
        });
        /** 切换到标签列表显示 */
        var changeTagList_1 = function () {
            elementGroup_1.div.searchResult.style.display = 'none';
            elementGroup_1.div.tagList.style.display = 'block';
        };
        /** 切换到标签搜索结果列表 */
        var changeSearchResult_1 = function () {
            elementGroup_1.div.searchResult.style.display = 'block';
            elementGroup_1.div.tagList.style.display = 'none';
        };
        // 标签输入框的按键按下事件
        elementGroup_1.input.tag.addEventListener('keyup', function (event) {
            // 每次按下按钮，清除之前的定时器，生成新的定时器
            clearTimeout(tagEditTimer_1);
            // 回车时，插入新标签
            if (event.key == 'Enter')
                return elementGroup_1.button.addTag.click();
            /** 标签输入框的值 */
            var value = elementGroup_1.input.tag.value;
            // 输入框内容为空，立刻切换到标签列表
            if (value.length == 0)
                return changeTagList_1();
            tagEditTimer_1 = setTimeout(function () {
                tagSearchXhr_1.abort();
                tagSearchXhr_1.open('GET', "".concat(config_1.apiConfig.tagList, "?keyword=").concat(value));
                tagSearchXhr_1.send();
            }, 200);
        });
        /** 重置表单 */
        var reset_1 = function () {
            route.dom.querySelectorAll('input, textarea').forEach(function (ele) { return ele.value = ''; });
            elementGroup_1.div.tagList.innerHTML = '';
            elementGroup_1.div.tagList.append(emptyTag_1);
            tagList_1.splice(0, tagList_1.length);
        };
        // 设置点击重置表单事件
        elementGroup_1.button.reset.addEventListener('click', function () { return reset_1; });
        // 设置点击提交事件
        elementGroup_1.button.submit.addEventListener('click', function () {
            var url = elementGroup_1.input.url.value;
            var title = elementGroup_1.input.title.value;
            var text = elementGroup_1.textarea.text.value;
            if (!!url.match(/^\s*$/) && !!text.match(/^\s*$/)) {
                return alert('URL 和描述文本不能同时为空');
            }
            var xhr = new XMLHttpRequest();
            xhr.open('POST', config_1.apiConfig.add);
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            var params = new URLSearchParams();
            params.set('url', url);
            params.set('title', title);
            params.set('text', text);
            params.set('tagList', tagList_1.join('||'));
            xhr.send(params.toString());
            xhr.addEventListener('readystatechange', function () {
                if (xhr.status == 200 && xhr.readyState == xhr.DONE) {
                    var res = JSON.parse(xhr.responseText);
                    alert(res.msg);
                    if (res.code == 200) {
                        // 操作完成，重置表单
                        return reset_1();
                    }
                }
            });
        });
    }
};
exports.add = add;

},{"../config":6,"../util":14}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.home = void 0;
var home = function (route) {
    function loadDom() {
        var html = '';
        var boxEle = route.dom.querySelector('.btn-list');
        if (!boxEle)
            throw new Error(".btn-list \u5143\u7D20\u4E0D\u5B58\u5728");
        var list = [
            ['plus-square-dotted.svg', '新增收藏', 'add'],
            ['card-checklist.svg', '收藏列表', 'list'],
            ['tags.svg', '标签列表', 'tag'],
            ['person-gear.svg', '个人中心', 'user'],
        ];
        list.forEach(function (item) {
            html += "\n                <div class=\"col-sm-6 col-lg-4 col-xl-3 mb-4\">\n                    <div class=\"border border-3 shadow-sm rounded-4 card card-body\n                        hover-shadow flex-row align-items-center\" onclick=\"location.hash='#/".concat(item[2], "'\">\n                        <img src=\"/static/img/").concat(item[0], "\" class=\"mx-3 size-32\">\n                        <div class=\"fs-4\">").concat(item[1], "</div>\n                    </div>\n                </div>");
        });
        boxEle.innerHTML = html;
    }
    if (route.status == 0) {
        route.status = 1;
        loadDom();
    }
};
exports.home = home;

},{}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.list = void 0;
var config_1 = require("../config");
/** `hash = #/list` */
var list = function (route) {
    if (route.status == 0) {
        route.status = 1;
        var collectListEle_1 = route.dom.querySelector('.collect-list');
        var loadCollectList = function (page, pageSize, keyword) {
            if (page === void 0) { page = 0; }
            if (pageSize === void 0) { pageSize = 36; }
            if (keyword === void 0) { keyword = ''; }
            if (page == 0)
                collectListEle_1.innerHTML = '';
            var xhr = new XMLHttpRequest();
            var params = new URLSearchParams();
            params.set('page', page.toString());
            params.set('pageSize', pageSize.toString());
            params.set('keyword', keyword);
            xhr.open('GET', "".concat(config_1.apiConfig.collectList, "?").concat(params.toString()));
            xhr.send();
            xhr.addEventListener('readystatechange', function () {
                if (xhr.status == 200 && xhr.readyState == xhr.DONE) {
                    var res = JSON.parse(xhr.responseText);
                    if (res.code == 200) {
                        var list_1 = res.data;
                        var html_1 = '';
                        list_1.forEach(function (item) {
                            html_1 += "\n                                <div class=\"col-md-6 col-xl-4 h-100 mb-4\">\n                                    <div class=\"card card-body border border-2 rounded-4 hover-shadow shadow-sm list-group-item-action\">\n                                        <div class=\"fs-5 fw-bold mb-2\">".concat(item.title, "</div>\n                                        <div class=\"text-muted small\">").concat(item.url, "</div>\n                                        <div class=\"text-muted\">").concat(item.text, "</div>\n                                    </div>\n                                </div>");
                        });
                        collectListEle_1.innerHTML += html_1;
                        return;
                    }
                    alert(res.msg);
                }
            });
        };
        loadCollectList();
    }
};
exports.list = list;

},{"../config":6}],11:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.checkLogin = void 0;
var __1 = require("..");
var md5 = require("md5");
var util_1 = require("../util");
var config_1 = require("../config");
/**
 * 校验登录
 * @param event 事件对象
 *
 */
function checkLogin(event) {
    /** 校验失败 */
    function notLogin() {
        var nowRouteName = __1.router.getNowRouteName();
        if (nowRouteName != 'login')
            location.hash = '/login';
        return false;
    }
    /** 校验成功 */
    function hasLogin() {
        var nowRouteName = __1.router.getNowRouteName();
        if (nowRouteName == 'login')
            location.hash = '';
        return true;
    }
    if (typeof event == 'undefined')
        addEventListener('hashchange', checkLogin);
    var localExpires = localStorage.getItem('expires');
    var nowTimeStamp = new Date().getTime();
    if (!localExpires || parseInt(localExpires) < nowTimeStamp)
        return notLogin();
    return hasLogin();
}
exports.checkLogin = checkLogin;
/** 登录面板 */
var loginBox = document.querySelector('.login-box');
/** 登录面板表单 */
var loginForm = {
    /** 用户名或邮箱输入 */
    username: loginBox.querySelector('.input-username'),
    /** 密码输入 */
    password: loginBox.querySelector('.input-password'),
    /** 验证码输入 */
    verCode: loginBox.querySelector('.input-vercode'),
    /** 获取验证码按钮 */
    getVerCode: loginBox.querySelector('.get-vercode'),
    /** 登录按钮 */
    login: loginBox.querySelector('.click-login')
};
/** 注册面板 */
var registerBox = document.querySelector('.register-box');
/** 注册面板表单 */
var registerForm = {
    /** 用户名输入 */
    username: registerBox.querySelector('.input-username'),
    /** 密码输入 */
    password: registerBox.querySelector('.input-password'),
    /** 重复输入密码 */
    repeatPassword: registerBox.querySelector('.input-repeat-password'),
    /** 邮箱地址 */
    email: registerBox.querySelector('.input-email'),
    /** 验证码输入 */
    verCode: registerBox.querySelector('.input-vercode'),
    /** 获取验证码按钮 */
    getVerCode: registerBox.querySelector('.get-vercode'),
    /** 注册按钮 */
    register: registerBox.querySelector('.click-register'),
};
var login = function (route) {
    if (route.args[0] == 'register') {
        loginBox.style.display = 'none';
        registerBox.style.display = 'block';
    }
    else {
        loginBox.style.display = 'block';
        registerBox.style.display = 'none';
    }
    if (route.status == 0) {
        route.status = 1;
        // 单击注册事件
        registerForm.register.addEventListener('click', clickRegister);
        // 单击获取验证码事件
        registerForm.getVerCode.addEventListener('click', function () {
            var email = registerForm.email.value;
            if (!(0, util_1.checkEmail)(email))
                return alert('请输入正确的邮箱');
            sendVerCode(registerForm, email);
        });
        loginForm.login.addEventListener('click', clickLogin);
        loginForm.getVerCode.addEventListener('click', function () {
            var username = loginForm.username.value;
            if (username.match(/^\s*$/))
                return alert('用户名或邮箱不能为空');
            sendVerCode(loginForm, username, true);
        });
    }
};
exports.login = login;
/** 点击登录事件 */
function clickLogin() {
    var username = loginForm.username.value;
    var password = loginForm.password.value;
    var verCode = loginForm.verCode.value;
    if (username.match(/^\s*$/))
        return alert('用户名或邮箱不能为空');
    console.log(password.match(/^\s*$/));
    if (password.length == 0)
        return alert('密码不能为空');
    if (verCode.match(/^\s*$/))
        return alert('验证码不能为空');
    var xhr = new XMLHttpRequest();
    xhr.open('POST', config_1.apiConfig.login);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    var params = new URLSearchParams();
    params.set('username', username);
    params.set('passwordMd5', md5(password));
    params.set('verCode', verCode);
    xhr.send(params.toString());
    xhr.addEventListener('readystatechange', function () {
        if (xhr.status == 200 && xhr.readyState == xhr.DONE) {
            var res = JSON.parse(xhr.responseText);
            if (res.code == 200) {
                alert('登录成功');
                var expires = res.data.expires;
                localStorage.setItem('expires', expires);
                location.hash = '';
                return;
            }
            alert(res.msg);
        }
    });
}
/**
 * 点击发送验证码
 * @param form 表单元素集合
 * @param userOrEmail 用户名或邮箱
 * @param login 是否是登录模式
 */
function sendVerCode(form, userOrEmail, login) {
    if (login === void 0) { login = false; }
    form.getVerCode.setAttribute('disabled', 'disabled');
    form.getVerCode.innerHTML = '正在发送';
    /** 修改倒计时 */
    function loading(num) {
        form.getVerCode.innerHTML = "".concat(num, " \u79D2");
    }
    /** 结束倒计时 */
    function end(timer) {
        clearInterval(timer);
        form.getVerCode.innerHTML = '获取验证码';
        form.getVerCode.removeAttribute('disabled');
    }
    var xhr = new XMLHttpRequest();
    xhr.open('GET', "".concat(config_1.apiConfig.sendCode, "?to=").concat(userOrEmail, "&login=").concat(login));
    xhr.send();
    xhr.addEventListener('readystatechange', function () {
        if (xhr.status == 200 && xhr.readyState == xhr.DONE) {
            var res = JSON.parse(xhr.responseText);
            if (res.code == 200) {
                var timeLong_1 = 60;
                var timer_1 = setInterval(function () {
                    loading(timeLong_1);
                    if (timeLong_1-- == 0)
                        end(timer_1);
                }, 1000);
                return;
            }
            end();
            alert(res.msg);
        }
    });
}
/** 单击注册事件 */
function clickRegister() {
    var username = registerForm.username.value;
    var password = registerForm.password.value;
    var repeatPassword = registerForm.repeatPassword.value;
    var verCode = registerForm.verCode.value;
    var email = registerForm.email.value;
    if (!username.match(/^\w{4,20}$/))
        return alert('用户名必须是 4-20 位的数字、字母、下划线任意组合');
    if (!password.match(/^\S{6,20}$/))
        return alert('密码必须是 6-20 位字符串');
    if (password != repeatPassword)
        return alert('两次输入的密码不一致，请检查后重新输入');
    if (!(0, util_1.checkEmail)(email))
        return alert('输入的邮箱格式错误，请检查后重新输入');
    if (verCode.match(/^\s*$/))
        return alert('验证码不能为空');
    var xhr = new XMLHttpRequest();
    xhr.open('POST', config_1.apiConfig.register);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    var params = new URLSearchParams();
    params.set('username', username);
    params.set('passwordMd5', md5(password));
    params.set('email', email);
    params.set('verCode', verCode);
    xhr.send(params.toString());
    xhr.addEventListener('readystatechange', function () {
        if (xhr.status == 200 && xhr.readyState == xhr.DONE) {
            var res = JSON.parse(xhr.responseText);
            if (res.code == 200) {
                alert('注册成功，点击确定将自动登录');
                var expires = res.data.expires;
                localStorage.setItem('expires', expires);
                location.hash = '';
                return;
            }
            alert(res.msg);
        }
    });
}

},{"..":7,"../config":6,"../util":14,"md5":5}],12:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.user = void 0;
var user = function (route) {
    if (route.status == 0) {
        route.status = 1;
        var clickLogout = route.dom.querySelector('.click-logout');
        clickLogout.addEventListener('click', function () {
            localStorage.removeItem('expires');
            location.href = '/logout';
        });
    }
};
exports.user = user;

},{}],13:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadTemplate = void 0;
function loadTemplate(router) {
    loadBackNav(router);
    loadSubTitle();
}
exports.loadTemplate = loadTemplate;
/**
 * 加载带返回按钮的顶栏
 * @param router 路由管理器对象，用于实现返回上一级历史记录
 * @param isRow 是否使用响应式栅栏
 */
function loadBackNav(router) {
    /** 返回上一级事件 */
    var backEvent = function () {
        // 如果发生过 hashChange 事件，则返回上一级，否则转到空路由
        if (router.hashChanged)
            history.back();
        else
            location.hash = '';
    };
    document.querySelectorAll('back-nav').forEach(function (ele) {
        var _a;
        var title = ele.innerHTML;
        var newEle = document.createElement('div');
        newEle.classList.add('d-flex', 'mb-4', 'align-items-center');
        newEle.innerHTML = "\n            <img src=\"/static/img/arrow-left-circle.svg\" class=\"cursor-pointer size-32 back-btn\">\n            <div class=\"fs-3 fw-bold ms-3\">".concat(title, "</div>");
        (_a = newEle.querySelector('.back-btn')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', backEvent);
        ele.replaceWith(newEle);
    });
    document.querySelectorAll('back-nav-row').forEach(function (ele) {
        var _a;
        var title = ele.innerHTML;
        var newEle = document.createElement('dvi');
        newEle.classList.add('row');
        var html = "\n            <div class=\"col-xl-8 col-lg-7 col-md-6\">\n                <div class=\"d-flex mb-4 align-items-center back-nav\">\n                    <img src=\"/static/img/arrow-left-circle.svg\" class=\"cursor-pointer size-32 back-btn\">\n                    <div class=\"fs-3 fw-bold ms-3\">".concat(title, "</div>\n                </div>\n            </div>\n            <div class=\"col-xl-4 col-lg-5 col-md-6 mb-4\">\n                <div class=\"input-group shadow-sm rounded input-group\">\n                    <input type=\"text\" placeholder=\"\u8BF7\u8F93\u5165\u641C\u7D22\u5173\u952E\u8BCD\" class=\"form-control\">\n                    <button class=\"btn btn-success\">\u641C\u7D22</button>\n                </div>\n            </div>");
        newEle.innerHTML = html;
        (_a = newEle.querySelector('.back-btn')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', backEvent);
        ele.replaceWith(newEle);
    });
}
/** 加载带图标的小标题 */
function loadSubTitle() {
    document.querySelectorAll('sub-title').forEach(function (ele) {
        var title = ele.innerHTML;
        var newEle = document.createElement('div');
        newEle.classList.add('d-flex', 'mb-4', 'align-items-center');
        newEle.innerHTML = "\n            <img src=\"/static/img/tags.svg\" class=\"cursor-pointer size-20 back-btn\">\n            <div class=\"fs-5 fw-bold ms-2\">".concat(title, "</div>");
        ele.replaceWith(newEle);
    });
}

},{}],14:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkUrl = exports.checkEmail = void 0;
/** 校验邮箱 */
function checkEmail(email) {
    return email.match(/^[\w.%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/);
}
exports.checkEmail = checkEmail;
/** 校验 URL */
function checkUrl(url) {
    try {
        new URL(url);
        return true;
    }
    catch (_a) {
        return false;
    }
}
exports.checkUrl = checkUrl;

},{}]},{},[7]);
