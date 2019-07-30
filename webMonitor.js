(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.WebMonitor = factory());
}(this, function () { 'use strict';

  function _typeof(obj) {
    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  /**
   * @description 基础工具类
   */
  var MonitorUtils = function MonitorUtils() {
    /**
     * @description 扩展对象属性
     * @param src 原对象
     * @param source 新对象
     * @returns {*} 扩展后的对象
     */
    this.extendConfig = function (src, source) {
      for (var key in source) {
        src[key] = source[key];
      }

      return src;
    };
    /**
     * @description 获取项目的 uuid
     * @returns {string} uuid
     */
    // this.getUuid = function () {
    //     var timeStamp = new Date().getTime()
    //     return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    //         var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    //         return v.toString(16);
    //     }) + "-" + timeStamp;
    // };

    /**
     * @description 获取用户的唯一标识
     */
    // this.getCustomerKey = function () {
    //     var customerKey = this.getUuid();
    //     var reg = /[0-9a-z]{8}(-[0-9a-z]{4}){3}-[0-9a-z]{12}-\d{13}/g
    //     if (!localStorage.monitorCustomerKey) {
    //         localStorage.monitorCustomerKey = customerKey;
    //     } else if (localStorage.monitorCustomerKey.length > 50 || !reg.test(localStorage.monitorCustomerKey)) {
    //         localStorage.monitorCustomerKey = customerKey;
    //     }
    //     return localStorage.monitorCustomerKey;
    // };

    /**
     * @description 获取页面的唯一标识
     */
    // this.getPageKey = function () {
    //     var pageKey = this.getUuid();
    //     if (!localStorage.monitorPageKey) localStorage.monitorPageKey = pageKey;
    //     return localStorage.monitorPageKey;
    // };

    /**
     * @description 设置页面的唯一标识
     */
    // this.setPageKey = function () {
    //     localStorage.monitorPageKey = this.getUuid();
    // };


    this.addLoadEvent = function (func) {
      var orgOnload = window.onload;

      if (typeof window.onload != "function") {
        window.onload = func;
      } else {
        orgOnload();
        func();
      }
    };
    /**
     * @description   封装简易的ajax请求
     * @param method  请求类型(大写)  GET/POST
     * @param url     请求URL
     * @param param   请求参数
     * @param successCallback  成功回调方法
     * @param failCallback   失败回调方法
     */


    this.ajax = function (method, url, param, successCallback, failCallback) {
      var xmlHttp = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
      xmlHttp.open(method, url, true);
      xmlHttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

      xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
          var res = JSON.parse(xmlHttp.responseText);
          typeof successCallback == 'function' && successCallback(res);
        } else {
          typeof failCallback == 'function' && failCallback();
        }
      };

      xmlHttp.send("data=" + JSON.stringify(param));
    };
    /**
     * @description 获取设备信息
     */


    this.getDevice = function () {
      var device = {};
      var ua = navigator.userAgent;
      var android = ua.match(/(Android);?[\s\/]+([\d.]+)?/);
      var ipad = ua.match(/(iPad).*OS\s([\d_]+)/);
      var ipod = ua.match(/(iPod)(.*OS\s([\d_]+))?/);
      var iphone = !ipad && ua.match(/(iPhone\sOS)\s([\d_]+)/);
      var mobileInfo = ua.match(/Android\s[\S\s]+Build\//);
      device.ios = device.android = device.iphone = device.ipad = device.androidChrome = false;
      device.isWeixin = /MicroMessenger/i.test(ua);
      device.os = "web";
      device.deviceName = "PC"; // Android

      if (android) {
        device.os = 'android';
        device.osVersion = android[2];
        device.android = true;
        device.androidChrome = ua.toLowerCase().indexOf('chrome') >= 0;
      }

      if (ipad || iphone || ipod) {
        device.os = 'ios';
        device.ios = true;
      } // iOS


      if (iphone && !ipod) {
        device.osVersion = iphone[2].replace(/_/g, '.');
        device.iphone = true;
      }

      if (ipad) {
        device.osVersion = ipad[2].replace(/_/g, '.');
        device.ipad = true;
      }

      if (ipod) {
        device.osVersion = ipod[3] ? ipod[3].replace(/_/g, '.') : null;
        device.iphone = true;
      } // iOS 8+ changed UA


      if (device.ios && device.osVersion && ua.indexOf('Version/') >= 0) {
        if (device.osVersion.split('.')[0] === '10') {
          device.osVersion = ua.toLowerCase().split('version/')[1].split(' ')[0];
        }
      } // 如果是ios, deviceName 就设置为iphone，根据分辨率区别型号


      if (device.iphone) {
        device.deviceName = "iphone";
        var screenWidth = window.screen.width;
        var screenHeight = window.screen.height;

        if (screenWidth === 320 && screenHeight === 480) {
          device.deviceName = "iphone 4";
        } else if (screenWidth === 320 && screenHeight === 568) {
          device.deviceName = "iphone 5/SE";
        } else if (screenWidth === 375 && screenHeight === 667) {
          device.deviceName = "iphone 6/7/8";
        } else if (screenWidth === 414 && screenHeight === 736) {
          device.deviceName = "iphone 6/7/8 Plus";
        } else if (screenWidth === 375 && screenHeight === 812) {
          device.deviceName = "iphone X/S/Max";
        }
      } else if (device.ipad) {
        device.deviceName = "ipad";
      } else if (mobileInfo) {
        var info = mobileInfo[0];
        var deviceName = info.split(';')[1].replace(/Build\//g, "");
        device.deviceName = deviceName.replace(/(^\s*)|(\s*$)/g, "");
      } // 浏览器模式, 获取浏览器信息
      // TODO 需要补充更多的浏览器类型进来


      var agent = ua.toLowerCase();
      var regStr_ie = /msie [\d.]+;/gi;
      var regStr_ff = /firefox\/[\d.]+/gi;
      var regStr_chrome = /chrome\/[\d.]+/gi;
      var regStr_saf = /safari\/[\d.]+/gi;
      var regStr_wx = /MicroMessenger\/[\d.]+/gi;
      var regStr_edge = /edge\/[\d.]+/gi;
      device.browserName = '未知';

      if (agent.indexOf("micromessenger") > 0) {
        // MicroMessenger 微信环境
        var browserInfo = agent.match(regStr_wx)[0];
        device.browserName = browserInfo.split('/')[0];
        device.browserVersion = browserInfo.split('/')[1];
      } else if (agent.indexOf("msie") > 0) {
        // IE
        var browserInfo = agent.match(regStr_ie)[0];
        device.browserName = browserInfo.split('/')[0];
        device.browserVersion = browserInfo.split('/')[1];
      } else if (agent.indexOf("firefox") > 0) {
        // firefox 火狐
        var browserInfo = agent.match(regStr_ff)[0];
        device.browserName = browserInfo.split('/')[0];
        device.browserVersion = browserInfo.split('/')[1];
      } else if (agent.indexOf("safari") > 0 && agent.indexOf("chrome") < 0) {
        // Safari 苹果
        var browserInfo = agent.match(regStr_saf)[0];
        device.browserName = browserInfo.split('/')[0];
        device.browserVersion = browserInfo.split('/')[1];
      } else if (agent.indexOf('edge') > 0 && agent.indexOf("safari") > 0 && agent.indexOf("chrome") > 0) {
        // IE edge
        var browserInfo = agent.match(regStr_edge)[0];
        device.browserName = browserInfo.split('/')[0];
        device.browserVersion = browserInfo.split('/')[1];
      } else if (agent.indexOf("chrome") > 0) {
        // Chrome 谷歌
        var browserInfo = agent.match(regStr_chrome)[0];
        device.browserName = browserInfo.split('/')[0];
        device.browserVersion = browserInfo.split('/')[1];
      } else {
        device.browserName = '';
        device.browserVersion = '';
      } // Webview


      device.webView = (iphone || ipad || ipod) && ua.match(/.*AppleWebKit(?!.*Safari)/i); // Export object

      return device;
    };

    this.loadJs = function (url, callback) {
      var script = document.createElement('script');
      script.async = 1;
      script.src = url;
      script.onload = callback;
      var dom = document.getElementsByTagName('script')[0];
      dom.parentNode.insertBefore(script, dom);
      return dom;
    };
    /**
     * @description 创建一个base64编码的字符串
     * @param str
     * @returns {string|*}
     */


    this.base64EncodeUnicode = function (str) {
      try {
        return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function (match, p1) {
          return String.fromCharCode("0x" + p1);
        }));
      } catch (e) {
        return str;
      }
    };
  };

  /**
   * @description 公用常量
   */
  var CUSTOMER_PV = 'CUSTOMER_PV'; // 用户访问日志类型

  var LOAD_PAGE = 'LOAD_PAGE'; // 用户加载页面信息类型

  var HTTP_LOG = 'HTTP_LOG'; // 接口日志类型

  var HTTP_ERROR = 'HTTP_ERROR'; // 接口错误日志类型

  var JS_ERROR = 'JS_ERROR'; // js报错日志类型

  var ELE_BEHAVIOR = 'ELE_BEHAVIOR'; // 用户的行为类型

  var RESOURCE_LOAD = 'RESOURCE_LOAD'; // 静态资源类型

  var CUSTOMIZE_BEHAVIOR = 'CUSTOMIZE_BEHAVIOR'; // 用户自定义行为类型

  var CONST = {
    CUSTOMER_PV: CUSTOMER_PV,
    LOAD_PAGE: LOAD_PAGE,
    HTTP_LOG: HTTP_LOG,
    HTTP_ERROR: HTTP_ERROR,
    JS_ERROR: JS_ERROR,
    ELE_BEHAVIOR: ELE_BEHAVIOR,
    RESOURCE_LOAD: RESOURCE_LOAD,
    CUSTOMIZE_BEHAVIOR: CUSTOMIZE_BEHAVIOR
  };

  /**
   * @description 异常日志基类
   */

  function MonitorBaseLog() {
    this.handleLogInfo = function (type, logInfo) {
      var tempString = localStorage[type] ? localStorage[type] : '';

      switch (type) {
        case CONST.ELE_BEHAVIOR:
          localStorage[CONST.ELE_BEHAVIOR] = tempString + JSON.stringify(logInfo) + '\n';
          break;

        case CONST.JS_ERROR:
          localStorage[CONST.JS_ERROR] = tempString + JSON.stringify(logInfo) + '\n';
          break;

        case CONST.HTTP_LOG:
          localStorage[CONST.HTTP_LOG] = tempString + JSON.stringify(logInfo) + '\n';
          break;

        case CONST.CUSTOMER_PV:
          localStorage[CONST.CUSTOMER_PV] = tempString + JSON.stringify(logInfo) + '\n';
          break;

        case CONST.LOAD_PAGE:
          localStorage[CONST.LOAD_PAGE] = tempString + JSON.stringify(logInfo) + '\n';
          break;

        case CONST.RESOURCE_LOAD:
          localStorage[CONST.RESOURCE_LOAD] = tempString + JSON.stringify(logInfo) + '\n';
          break;

        case CONST.CUSTOMIZE_BEHAVIOR:
          localStorage[CONST.CUSTOMIZE_BEHAVIOR] = tempString + JSON.stringify(logInfo) + '\n';
          break;

        default:
          break;
      }
    };
  }

  /**
   * @description 设置日志对象类的通用属性
   */
  var utils = new MonitorUtils();
  var DEVICE_INFO = utils.getDevice();

  function SetCommonProperty() {
    this.happenTime = new Date().getTime(); // 日志发生时间

    this.simpleUrl = window.location.href.split('?')[0].replace('#', ''); // 页面的url

    this.completeUrl = utils.base64EncodeUnicode(encodeURIComponent(window.location.href)); // 页面的完整url包含携带的参数

    this.deviceName = DEVICE_INFO.deviceName;
    this.os = DEVICE_INFO.os + (DEVICE_INFO.osVersion ? " " + DEVICE_INFO.osVersion : "");
    this.browserName = DEVICE_INFO.browserName;
    this.browserVersion = DEVICE_INFO.browserVersion; // this.customerKey = utils.getCustomerKey();
    // 用户自定义信息， 由开发者主动传入， 便于对线上问题进行准确定位
    // var wmUserInfo = USER_INFO;
    // this.userId = utils.base64EncodeUnicode(wmUserInfo.userId || "");
    // this.firstUserParam = utils.base64EncodeUnicode(wmUserInfo.wm_version || "");
    // this.secondUserParam = utils.base64EncodeUnicode(wmUserInfo.secondUserParam || "");
  }

  /**
   * @description 用户访问日志（PV），继承于日志基类
   */

  function CustomerPV(uploadType, loadType, loadTime) {
    SetCommonProperty.apply(this);
    this.uploadType = uploadType; // this.pageKey = utils.getPageKey();  // 用于区分页面，所对应唯一的标识，每个新页面对应一个值

    this.loadType = loadType; // 用以区分首次加载

    this.loadTime = loadTime; // 加载时间
  }

  CustomerPV.prototype = new MonitorBaseLog();

  /**
   * @description 用户加载页面的信息日志，继承于日志基类MonitorBaseLog
   */

  function LoadPageInfo(uploadType, loadType, loadPage, domReady, redirect, lookupDomain, ttfb, request, loadEvent, appcache, unloadEvent, connect) {
    SetCommonProperty.apply(this);
    this.uploadType = uploadType; // this.pageKey = utils.getPageKey();

    this.loadType = loadType;
    this.loadPage = loadPage;
    this.domReady = domReady;
    this.redirect = redirect;
    this.lookupDomain = lookupDomain;
    this.ttfb = ttfb;
    this.request = request;
    this.loadEvent = loadEvent;
    this.appcache = appcache;
    this.unloadEvent = unloadEvent;
    this.connect = connect;
  }

  LoadPageInfo.prototype = new MonitorBaseLog();

  /**
   * @description 页面静态资源加载错误统计，继承于日志基类MonitorBaseInfo
   */
  var utils$1 = new MonitorUtils();

  function ResourceLoadInfo(uploadType, url, elementType, status) {
    SetCommonProperty.apply(this);
    this.uploadType = uploadType; // this.pageKey = utils.getPageKey();

    this.elementType = elementType;
    this.sourceUrl = utils$1.base64EncodeUnicode(encodeURIComponent(url));
    this.status = status; // 资源加载状态： 0/失败、1/成功
  }

  ResourceLoadInfo.prototype = new MonitorBaseLog();

  /**
   * @description JS错误日志，继承于日志基类MonitorBaseInfo
   */
  var utils$2 = new MonitorUtils();

  function JavaScriptErrorInfo(uploadType, infoType, errorMsg, errorStack, rowNumber, colNumber) {
    SetCommonProperty.apply(this);
    this.uploadType = uploadType;
    this.infoType = infoType; // this.pageKey = utils.getPageKey();  // 用于区分页面，所对应唯一的标识，每个新页面对应一个值

    this.errorMessage = utils$2.base64EncodeUnicode(errorMsg);
    this.errorStack = utils$2.base64EncodeUnicode(errorStack);
    this.rowNumber = rowNumber;
    this.colNumber = colNumber;
  }

  JavaScriptErrorInfo.prototype = new MonitorBaseLog();

  /**
   * @description 接口请求日志，继承于日志基类MonitorBaseInfo
   */
  var utils$3 = new MonitorUtils();

  function HttpLogInfo(uploadType, url, status, statusText, statusResult, currentTime, loadTime) {
    SetCommonProperty.apply(this);
    this.uploadType = uploadType; // 上传类型
    // this.pageKey = utils.getPageKey();

    this.httpUrl = utils$3.base64EncodeUnicode(encodeURIComponent(url)); // 请求地址

    this.status = status; // 接口状态

    this.statusText = statusText; // 状态描述

    this.statusResult = statusResult; // 区分发起和返回状态

    this.happenTime = currentTime; // 客户端发送时间

    this.loadTime = loadTime; // 接口请求耗时
  }

  HttpLogInfo.prototype = new MonitorBaseLog();

  /**
   * @description 用户行为日志，继承于日志基类MonitorBaseInfo
   */
  var utils$4 = new MonitorUtils();

  function BehaviorInfo(uploadType, behaviorType, className, placeholder, inputValue, tagName, innerText) {
    SetCommonProperty.apply(this);
    this.uploadType = uploadType; // this.pageKey = utils.getPageKey();

    this.behaviorType = behaviorType;
    this.className = utils$4.base64EncodeUnicode(className);
    this.placeholder = utils$4.base64EncodeUnicode(placeholder);
    this.inputValue = utils$4.base64EncodeUnicode(inputValue);
    this.tagName = tagName;
    this.innerText = utils$4.base64EncodeUnicode(encodeURIComponent(innerText));
  }

  BehaviorInfo.prototype = new MonitorBaseLog();

  var _window = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

  if (!localStorage) {
    _window.localStorage = new Object();
  }
  /** 全局变量 */


  var defaultLocation = _window.location.href.split('?')[0].replace('#', ''); // 获取当前url


  var timingObj = performance && performance.timing; // 页面加载对象的加载时间属性

  var resourcesObj = function () {
    if (performance && typeof performance.getEntries === 'function') {
      return performance.getEntries();
    }

    return null;
  }(); // 获取页面加载的具体属性,当浏览器支持使用performance时可用


  (function () {
    if (typeof _window.CustomEvent === "function") return false;

    function CustomEvent(event, params) {
      params = params || {
        bubbles: false,
        cancelable: false,
        detail: undefined
      };
      var evt = document.createEvent('CustomEvent');
      evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
      return evt;
    }

    CustomEvent.prototype = _window.Event.prototype;
    _window.CustomEvent = CustomEvent;
  })();
  /** 常量 */


  var CUSTOMER_PV$1 = CONST.CUSTOMER_PV,
      LOAD_PAGE$1 = CONST.LOAD_PAGE,
      HTTP_LOG$1 = CONST.HTTP_LOG,
      HTTP_ERROR$1 = CONST.HTTP_ERROR,
      JS_ERROR$1 = CONST.JS_ERROR,
      ELE_BEHAVIOR$1 = CONST.ELE_BEHAVIOR,
      RESOURCE_LOAD$1 = CONST.RESOURCE_LOAD,
      CUSTOMIZE_BEHAVIOR$1 = CONST.CUSTOMIZE_BEHAVIOR; // 获取当前页面的URL

  var WEB_LOCATION = _window.location.href; // 实例化工具类

  var utils$5 = new MonitorUtils();

  var WebMonitor = function WebMonitor() {
    var obj = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var _config = {
      id: 0,
      // 上报 id
      version: 0,
      // 项目版本
      url: "",
      // 上报接口url
      user_id: "",
      //用户id
      ignores: [],
      // 忽略某个类型的监控
      auto: true,
      // 是否自动上报
      delay: 2000 // 延迟上报 auto 为 true 时有效

    };
    _config = utils$5.extendConfig(_config, obj);
    var _typeList = [ELE_BEHAVIOR$1, JS_ERROR$1, HTTP_LOG$1, CUSTOMER_PV$1, LOAD_PAGE$1, RESOURCE_LOAD$1, CUSTOMIZE_BEHAVIOR$1];
    /**
     * @description 初始化
     * @param options 初始化配置
     */

    this.init = function () {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var config = _config = utils$5.extendConfig(_config, options);

      if (!config.url || !config.id) {
        //如果缺少上报id和上报接口的url,则不作收集和上报处理
        return console.log("缺少webMonitor配置参数url或id，监控未开启");
      } else {
        try {
          // 排除监听配置中ignores项目
          _typeList = _typeList.filter(function (item) {
            return config.ignores.indexOf(item) < 0;
          });
          var that = this; // 启动监控

          recordResourceError(); //监控资源加载错误

          recordPV(); //监控用户访问（PV）

          recordLoadPage(); //监控页面加载

          recordBehavior({
            record: 1
          }); //监控用户行为

          recordJavaScriptError(); //监控js异常及错误

          recordHttpLog(); //监控http请求日志

          console.log('The WebMonitor is on...');

          if (config.auto) {
            /**
             * 添加一个定时器，进行数据的上传
             * 每1个周期进行一次URL是否变化的检测
             * 每5个周期进行一次数据的检查并上传
             */
            var timeCount = 0;
            setInterval(function () {
              checkUrlChange();

              if (timeCount >= 5) {
                that.report();
                timeCount = 0;
              }

              timeCount++;
            }, config.delay);
          }
        } catch (e) {
          console.error("监控代码异常：", e);
        }
      }
    };
    /**
     * 用户手动上报
     */


    this.report = function () {
      var typeList = _typeList;
      var config = _config;
      var logInfo = "";

      for (var i = 0; i < typeList.length; i++) {
        logInfo += localStorage[typeList[i]] || "";
      }

      if (logInfo.length > 0) {
        (function () {
          var logInfoStr = logInfo.split('\n');
          logInfoStr.pop();

          var _loop = function _loop(j) {
            _report(config, logInfoStr[j]).then(function (res) {
              if (j === logInfoStr.length - 1) {
                for (var k = 0; k < typeList.length; k++) {
                  localStorage[typeList[k]] = "";
                }
              }
            })["catch"](function (rej) {
              console.log('上传失败');
            });
          };

          for (var j = 0; j < logInfoStr.length; j++) {
            _loop(j);
          }
        })();
      }
    };
    /**
     * @description 监听页面的url是否发生改变
     */


    function checkUrlChange() {
      var webLocation = _window.location.href.split('?')[0].replace('#', ''); // 如果url变化了， 就把defaultLocation记录为新的url，并重新设置pageKey


      if (defaultLocation != webLocation) {
        recordPV();
        defaultLocation = webLocation;
      }
    }
    /**
     * @description 监控用户访问记录
     */

    function recordPV() {
      // utils.setPageKey();
      var loadType = "load";

      if (resourcesObj) {
        if (resourcesObj[0] && resourcesObj[0].type === 'navigate') {
          loadType = "load";
        } else {
          loadType = "reload";
        }
      }

      var customerPv = new CustomerPV(CUSTOMER_PV$1, loadType, 0);
      customerPv.handleLogInfo(CUSTOMER_PV$1, customerPv);
    }
    /**
     * @description 用户加载页面监控,仅当浏览器支持 window.performance 时使用
     */

    function recordLoadPage() {
      utils$5.addLoadEvent(function () {
        if (resourcesObj) {
          var loadType = "load";

          if (resourcesObj[0] && resourcesObj[0].type === 'navigate') {
            loadType = "load";
          } else {
            loadType = "reload";
          }

          var t = timingObj;
          var loadPageInfo = new LoadPageInfo(LOAD_PAGE$1); // 页面加载类型， 区分第一次load还是reload

          loadPageInfo.loadType = loadType; // 页面加载完成的时间

          loadPageInfo.loadPage = t.loadEventEnd - t.navigationStart; // 解析 DOM 树结构的时间

          loadPageInfo.domReady = t.domComplete - t.responseEnd; // 重定向的时间

          loadPageInfo.redirect = t.redirectEnd - t.redirectStart; //DNS 查询时间

          loadPageInfo.lookupDomain = t.domainLookupEnd - t.domainLookupStart; // Time To First Byte，读取页面第一个字节的时间

          loadPageInfo.ttfb = t.responseStart - t.navigationStart; // 内容加载完成的时间

          loadPageInfo.request = t.responseEnd - t.requestStart; // 执行 onload 回调函数的时间

          loadPageInfo.loadEvent = t.loadEventEnd - t.loadEventStart; // DNS 缓存时间

          loadPageInfo.appcache = t.domainLookupStart - t.fetchStart; // 卸载页面的时间

          loadPageInfo.unloadEvent = t.unloadEventEnd - t.unloadEventStart; // TCP 建立连接完成握手的时间

          loadPageInfo.connect = t.connectEnd - t.connectStart;
          loadPageInfo.handleLogInfo(LOAD_PAGE$1, loadPageInfo);
        }
      });
    }
    /**
     * @description 监控静态资源加载异常,当浏览器不支持 window.performance.getEntries() 时使用该方法
     */

    function recordResourceError() {
      _window.addEventListener('error', function (error) {
        var target = error.target || error.srcElement;
        var isElementTarget = target instanceof HTMLScriptElement || target instanceof HTMLLinkElement || target instanceof HTMLImageElement;
        if (!isElementTarget) return; // 如果是资源加载以外的js异常，则不再此处理

        var typeName = target.localName; //资源标签名称

        var sourceUrl = "";

        if (typeName === "link") {
          sourceUrl = target.href;
        } else if (typeName === "script") {
          sourceUrl = target.src;
        } else if (typeName === "img") {
          sourceUrl = target.src;
        }

        var resourceLoadInfo = new ResourceLoadInfo(RESOURCE_LOAD$1, sourceUrl, typeName, "0");
        resourceLoadInfo.handleLogInfo(RESOURCE_LOAD$1, resourceLoadInfo);
      }, true);
    }
    /**
     * @description 处理由监控捕获到的js异常的错误信息
     * @param infoType 错误监听类型
     * @param origin_errorMsg 错误消息
     * @param origin_url 错误地址
     * @param origin_lineNumber 行号
     * @param origin_columnNumber 列号
     * @param origin_errorObj 错误堆栈
     */

    function processJavaScriptErrorInfo(infoType, origin_errorMsg, origin_url, origin_lineNumber, origin_columnNumber, origin_errorObj) {
      // 记录js错误前，检查一下url记录是否变化
      checkUrlChange();
      var errorMsg = origin_errorMsg ? origin_errorMsg : '';
      var errorObj = origin_errorObj ? origin_errorObj : '';
      var errorType = "";

      if (errorMsg) {
        if (typeof errorObj === 'string') {
          errorType = errorObj.split(": ")[0].replace('"', "");
        } else {
          var errorStackStr = JSON.stringify(errorObj);
          errorType = errorStackStr.split(": ")[0].replace('"', "");
        }
      }

      var javaScriptErrorInfo = new JavaScriptErrorInfo(JS_ERROR$1, infoType, errorType + ": " + errorMsg, errorObj, origin_lineNumber, origin_columnNumber);
      javaScriptErrorInfo.handleLogInfo(JS_ERROR$1, javaScriptErrorInfo);
    }
    /**
     * @description 监控页面js异常
     */

    function recordJavaScriptError() {
      // TODO 重写 console.error
      var orgConsoleError = console.error;

      console.error = function (tempErrorMsg) {
        var errorMsg = arguments[0] && arguments[0].message || tempErrorMsg;
        var lineNumber = 0;
        var columnNumber = 0;
        var errorObj = arguments[0] && arguments[0].stack;

        if (!errorObj) {
          processJavaScriptErrorInfo("console_error", errorMsg, WEB_LOCATION, lineNumber, columnNumber, "CustomizeError: " + errorMsg);
        } else {
          processJavaScriptErrorInfo("console_error", errorMsg, WEB_LOCATION, lineNumber, columnNumber, errorObj);
        }

        return orgConsoleError.apply(console, arguments);
      }; // TODO 重写 window.onerror 监听js异常


      _window.onerror = function (errorMsg, url, lineNumber, columnNumber, errorObj) {
        var errorStack = errorObj ? errorObj.stack : null;
        processJavaScriptErrorInfo("on_error", errorMsg, url, lineNumber, columnNumber, errorStack);
      }; // TODO 重写onunhandledrejection 监听未被catch的Promise异常


      _window.onunhandledrejection = function (e) {
        var errorMsg = "";
        var errorStack = "";

        if (_typeof(e.reason) === "object") {
          errorMsg = e.reason.message;
          errorStack = e.reason.stack;
        } else {
          errorMsg = e.reason;
          errorStack = "";
        }

        processJavaScriptErrorInfo("onunhandledrejection", errorMsg, WEB_LOCATION, 0, 0, "UncaughtInPromiseError: " + errorStack);
      };
    }
    /**
     * @description 监控用户点击行为
     * @param project 项目详情
     */

    function recordBehavior(project) {
      // 行为记录开关
      if (project && project.record && project.record === 1) {
        // 记录行为前，检查一下url记录是否变化
        checkUrlChange(); // 户点击页面的元素的行为数据

        document.onclick = function (e) {
          var className = "";
          var placeholder = "";
          var inputValue = "";
          var tagName = e.target.tagName;
          var innerText = "";

          if (tagName != "svg" && tagName != "use") {
            //记录点击的节点信息
            className = e.target.className;
            placeholder = e.target.placeholder || "";
            inputValue = e.target.value || "";
            innerText = e.target.innerText ? e.target.innerText.replace(/\s*/g, "") : ""; // 如果点击的元素内容过长，则部分截取

            if (innerText.length > 200) innerText = innerText.substring(0, 20) + "......";
            innerText = innerText.replace(/\s/g, '');
          }

          var behaviorInfo = new BehaviorInfo(ELE_BEHAVIOR$1, "click", className, placeholder, inputValue, tagName, innerText);
          behaviorInfo.handleLogInfo(ELE_BEHAVIOR$1, behaviorInfo);
        };
      }
    }
    /** 监控fetch请求 */

    function recordFetchLog() {
      if (!_window.fetch) return;
      var orgFetch = _window.fetch;

      _window.fetch = function () {
        return orgFetch.apply(this, arguments).then(function (res) {
          if (!res.ok) {
            // True if status is HTTP 2xx
            var currentTime = new Date().getTime();
            var httpLogInfo = new HttpLogInfo(HTTP_LOG$1, res.url, res.status, res.statusText, HTTP_ERROR$1, currentTime, 0);
            httpLogInfo.handleLogInfo(HTTP_LOG$1, httpLogInfo);
          }
        })["catch"](function (error) {
          var errorMsg = "";
          var errorStack = "";

          if (_typeof(error) === "object") {
            errorMsg = error.message;
            errorStack = error.stack;
          } else {
            errorMsg = error;
            errorStack = "";
          }

          processJavaScriptErrorInfo("syntax_error", errorMsg, WEB_LOCATION, 0, 0, "UncaughtInPromiseError: " + errorStack);
        });
      };
    }
    /**
     * @description 接口请求监控
     */


    function recordHttpLog() {
      // 如果是文件类型的地址，则忽略
      var protocol = _window.location.protocol;
      if (protocol === 'file:') return; // 处理fetch

      recordFetchLog(); // 处理XMLHttpRequest

      if (!_window.XMLHttpRequest) {
        return;
      }

      var xmlhttp = _window.XMLHttpRequest;
      var orgSend = xmlhttp.prototype.send;

      var handleEvent = function handleEvent(event) {
        if (event && event.currentTarget && event.currentTarget.status !== 200) {
          var currentTime = new Date().getTime();
          var httpLogInfo = new HttpLogInfo(HTTP_LOG$1, event.target.responseURL, event.target.status, event.target.statusText, HTTP_ERROR$1, currentTime, 0);
          httpLogInfo.handleLogInfo(HTTP_LOG$1, httpLogInfo);
        }
      }; // TODO 重写send方法


      xmlhttp.prototype.send = function () {
        if (this['addEventListener']) {
          this['addEventListener']('error', handleEvent);
          this['addEventListener']('load', handleEvent);
          this['addEventListener']('abort', handleEvent);
        } else {
          var orgStateChange = this['onreadystatechange'];

          this['onreadystatechange'] = function (event) {
            if (this.readyState === 4) {
              handleEvent(event);
            }

            orgStateChange && orgStateChange.apply(this, arguments);
          };
        }

        return orgSend.apply(this, arguments);
      };
    }
    /**
     * @description 上报异常日志
     * @param url 上报异常日志的url
     * @param params array 异常日志数组
     * @param callback 上报完成后的回调
     */

    function _report() {
      var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var params = arguments.length > 1 ? arguments[1] : undefined;
      return new Promise(function (resolve, reject) {
        var img = new Image(); // 非图片链接，所以返回一个错误事件

        img.onerror = function () {
          resolve();
        };

        img.src = "".concat(config.url, "?logs=").concat(params, "&timestamp=").concat(new Date().getTime(), "&id=").concat(config.id, "&version=").concat(config.version, "&user_id=").concat(config.user_id);
      });
    }
  };

  return WebMonitor;

}));
