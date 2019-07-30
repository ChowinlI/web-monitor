/**
 * @description web异常监控上报
 */
import MonitorUtils from './utils/utils'
import CustomerPV from './class/CustomerPV'
import LoadPageInfo from './class/LoadPageInfo'
import ResourceLoadInfo from './class/ResourceLoadInfo'
import JavaScriptErrorInfo from './class/JavaScriptErrorInfo'
import HttpLogInfo from './class/HttpLogInfo'
import BehaviorInfo from './class/BehaviorInfo'
import CONST from './utils/const'


var _window =
    typeof window !== 'undefined'
        ? window
        : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};


if (!localStorage) {
    _window.localStorage = new Object();
}

/** 全局变量 */

var defaultLocation = _window.location.href.split('?')[0].replace('#', ''); // 获取当前url

var timingObj = performance && performance.timing; // 页面加载对象的加载时间属性

var resourcesObj = (() => {
    if (performance && typeof performance.getEntries === 'function') {
        return performance.getEntries();
    }
    return null;
})(); // 获取页面加载的具体属性,当浏览器支持使用performance时可用

(function () {
    if (typeof _window.CustomEvent === "function") return false;

    function CustomEvent(event, params) {
        params = params || {bubbles: false, cancelable: false, detail: undefined};
        var evt = document.createEvent('CustomEvent');
        evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
        return evt;
    }

    CustomEvent.prototype = _window.Event.prototype;

    _window.CustomEvent = CustomEvent;
})();

/** 常量 */
const {CUSTOMER_PV, LOAD_PAGE, HTTP_LOG, HTTP_ERROR, JS_ERROR, ELE_BEHAVIOR, RESOURCE_LOAD, CUSTOMIZE_BEHAVIOR} = CONST;

// 获取当前页面的URL
const WEB_LOCATION = _window.location.href

// 实例化工具类
const utils = new MonitorUtils()

var WebMonitor = function (obj = {}) {
    var _config = {
        id: 0, // 上报 id
        version: 0, // 项目版本
        url: "", // 上报接口url
        user_id: "", //用户id
        ignores: [], // 忽略某个类型的监控
        auto: true, // 是否自动上报
        delay: 2000, // 延迟上报 auto 为 true 时有效
    };
    _config = utils.extendConfig(_config, obj)
    var _typeList = [ELE_BEHAVIOR, JS_ERROR, HTTP_LOG, CUSTOMER_PV, LOAD_PAGE, RESOURCE_LOAD, CUSTOMIZE_BEHAVIOR];

    /**
     * @description 初始化
     * @param options 初始化配置
     */
    this.init = function (options = {}) {
        var config = _config = utils.extendConfig(_config, options)
        if(!config.url || !config.id){ //如果缺少上报id和上报接口的url,则不作收集和上报处理
            return console.log("缺少webMonitor配置参数url或id，监控未开启")
        } else {
            try {
                // 排除监听配置中ignores项目
                _typeList = _typeList.filter(function (item) {
                    return config.ignores.indexOf(item) < 0
                })
                var that = this;
                // 启动监控
                recordResourceError();  //监控资源加载错误
                recordPV();  //监控用户访问（PV）
                recordLoadPage();  //监控页面加载
                recordBehavior({record: 1}); //监控用户行为
                recordJavaScriptError();  //监控js异常及错误
                recordHttpLog();  //监控http请求日志
                console.log('The WebMonitor is on...');

                if(config.auto){
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
        let typeList = _typeList;
        let config = _config;
        let logInfo = "";
        for (let i = 0; i < typeList.length; i++) {
            logInfo += (localStorage[typeList[i]] || "");
        }
        if (logInfo.length > 0) {
            let logInfoStr = logInfo.split('\n');
            logInfoStr.pop();
            for (let j = 0; j < logInfoStr.length; j++) {
                _report(config, logInfoStr[j]).then(res => {
                    if (j === logInfoStr.length - 1) {
                        for (let k = 0; k < typeList.length; k++) {
                            localStorage[typeList[k]] = "";
                        }
                    }
                }).catch(rej => {
                    console.log('上传失败')
                })
            }
        }
    };

    /**
     * @description 监听页面的url是否发生改变
     */
    function checkUrlChange() {
        var webLocation = _window.location.href.split('?')[0].replace('#', '');
        // 如果url变化了， 就把defaultLocation记录为新的url，并重新设置pageKey
        if (defaultLocation != webLocation) {
            recordPV();
            defaultLocation = webLocation;
        }
    };

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
        var customerPv = new CustomerPV(CUSTOMER_PV, loadType, 0);
        customerPv.handleLogInfo(CUSTOMER_PV, customerPv);
    };

    /**
     * @description 用户加载页面监控,仅当浏览器支持 window.performance 时使用
     */
    function recordLoadPage() {
        utils.addLoadEvent(function () {
            if (resourcesObj) {
                var loadType = "load";
                if (resourcesObj[0] && resourcesObj[0].type === 'navigate') {
                    loadType = "load";
                } else {
                    loadType = "reload";
                }

                var t = timingObj;
                var loadPageInfo = new LoadPageInfo(LOAD_PAGE);
                // 页面加载类型， 区分第一次load还是reload
                loadPageInfo.loadType = loadType;

                // 页面加载完成的时间
                loadPageInfo.loadPage = t.loadEventEnd - t.navigationStart;

                // 解析 DOM 树结构的时间
                loadPageInfo.domReady = t.domComplete - t.responseEnd;

                // 重定向的时间
                loadPageInfo.redirect = t.redirectEnd - t.redirectStart;

                //DNS 查询时间
                loadPageInfo.lookupDomain = t.domainLookupEnd - t.domainLookupStart;

                // Time To First Byte，读取页面第一个字节的时间
                loadPageInfo.ttfb = t.responseStart - t.navigationStart;

                // 内容加载完成的时间
                loadPageInfo.request = t.responseEnd - t.requestStart;

                // 执行 onload 回调函数的时间
                loadPageInfo.loadEvent = t.loadEventEnd - t.loadEventStart;

                // DNS 缓存时间
                loadPageInfo.appcache = t.domainLookupStart - t.fetchStart;

                // 卸载页面的时间
                loadPageInfo.unloadEvent = t.unloadEventEnd - t.unloadEventStart;

                // TCP 建立连接完成握手的时间
                loadPageInfo.connect = t.connectEnd - t.connectStart;

                loadPageInfo.handleLogInfo(LOAD_PAGE, loadPageInfo);
            }
        })
    };

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
            var resourceLoadInfo = new ResourceLoadInfo(RESOURCE_LOAD, sourceUrl, typeName, "0");
            resourceLoadInfo.handleLogInfo(RESOURCE_LOAD, resourceLoadInfo);
        }, true)
    };

    /**
     * @description 监控静态资源加载异常，当浏览器支持 window.performance.getEntries() 时使用该方法
     */
    function performanceGetEntries() {
        // 监控资源是否加载成功，当资源加载失败时，作js错误进行上报处理
        if (_window.performance && typeof _window.performance.getEntries === "function") {
            //获取静态资源加载列表
            var entries = _window.performance.getEntries();
            // script文件
            var scriptArray = entries.filter(function (el) {
                return el.initiatorType === "script";
            })
            // link标签
            var linkArray = entries.filter(function (el) {
                return el.initiatorType === "link";
            })
            // img标签
            var imgArray = entries.filter(function (el) {
                return el.initiatorType === "img";
            })

            // 获取页面上所有的script标签, 并筛选出没有成功加载的script资源
            var scripts = [];
            var scriptObjects = document.getElementsByTagName("script");
            for (let i = 0; i < scriptObjects.length; i++) {
                if (scriptObjects[i].src) {
                    scripts.push(scriptObjects[i].src);
                }
            }
            var errorScripts = scripts.filter(function (script) {
                var flag = true;
                for (let i = 0; i < scriptArray.length; i++) {
                    if (scriptArray[i].name === script) {
                        flag = false;
                        break;
                    }
                }
                return flag;
            });

            // 获取页面上所有的link标签，并筛选出没有成功加载的link资源
            var links = [];
            var linkObjects = document.getElementsByTagName("link");
            for (let i = 0; i < linkObjects.length; i++) {
                if (linkObjects[i].href) {
                    links.push(linkObjects[i].href);
                }
            }
            var errorLinks = links.filter(function (link) {
                var flag = true;
                for (var i = 0; i < linkArray.length; i++) {
                    if (linkArray[i].name === link) {
                        flag = false;
                        break;
                    }
                }
                return flag;
            });

            // 获取页面上所有的img标签，并筛选出没有成功加载的img资源
            var imgs = [];
            var imgObjects = document.getElementsByTagName("img");
            for (var i = 0; i < linkObjects.length; i++) {
                if (imgObjects[i].src) {
                    imgs.push(linkObjects[i].src);
                }
            }
            var errorImgs = imgs.filter(function (img) {
                var flag = true;
                for (var i = 0; i < imgArray.length; i++) {
                    if (imgArray[i].name === img) {
                        flag = false;
                        break;
                    }
                }
                return flag;
            });

            for (let m = 0; m < errorScripts.length; m++) {
                let resourceLoadInfo = new ResourceLoadInfo(RESOURCE_LOAD, errorScripts[m], "script", "0");
                resourceLoadInfo.handleLogInfo(RESOURCE_LOAD, resourceLoadInfo);
            }
            for (let m = 0; m < errorLinks.length; m++) {
                let resourceLoadInfo = new ResourceLoadInfo(RESOURCE_LOAD, errorLinks[m], "link", "0");
                resourceLoadInfo.handleLogInfo(RESOURCE_LOAD, resourceLoadInfo);
            }
            for (let m = 0; m < errorImgs.length; m++) {
                let resourceLoadInfo = new ResourceLoadInfo(RESOURCE_LOAD, errorImgs[m], "img", "0");
                resourceLoadInfo.handleLogInfo(RESOURCE_LOAD, resourceLoadInfo);
            }

        }
    };

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
                var errorStackStr = JSON.stringify(errorObj)
                errorType = errorStackStr.split(": ")[0].replace('"', "");
            }
        }
        var javaScriptErrorInfo = new JavaScriptErrorInfo(JS_ERROR, infoType, errorType + ": " + errorMsg, errorObj, origin_lineNumber, origin_columnNumber);
        javaScriptErrorInfo.handleLogInfo(JS_ERROR, javaScriptErrorInfo);
    };

    /**
     * @description 监控页面js异常
     */
    function recordJavaScriptError() {
        // TODO 重写 console.error
        var orgConsoleError = console.error;
        
        console.error = function (tempErrorMsg) {
            var errorMsg = (arguments[0] && arguments[0].message) || tempErrorMsg;
            var lineNumber = 0;
            var columnNumber = 0;
            var errorObj = arguments[0] && arguments[0].stack;
            if (!errorObj) {
                processJavaScriptErrorInfo("console_error", errorMsg, WEB_LOCATION, lineNumber, columnNumber, "CustomizeError: " + errorMsg);
            } else {
                processJavaScriptErrorInfo("console_error", errorMsg, WEB_LOCATION, lineNumber, columnNumber, errorObj);
            }
            return orgConsoleError.apply(console, arguments);
        }

        // TODO 重写 window.onerror 监听js异常
        _window.onerror = function (errorMsg, url, lineNumber, columnNumber, errorObj) {
            var errorStack = errorObj ? errorObj.stack : null;
            processJavaScriptErrorInfo("on_error", errorMsg, url, lineNumber, columnNumber, errorStack);
        };

        // TODO 重写onunhandledrejection 监听未被catch的Promise异常
        _window.onunhandledrejection = function (e) {
            var errorMsg = "";
            var errorStack = "";
            if (typeof e.reason === "object") {
                errorMsg = e.reason.message;
                errorStack = e.reason.stack;
            } else {
                errorMsg = e.reason;
                errorStack = "";
            }
            processJavaScriptErrorInfo("onunhandledrejection", errorMsg, WEB_LOCATION, 0, 0, "UncaughtInPromiseError: " + errorStack);
        }
    };

    /**
     * @description 监控用户点击行为
     * @param project 项目详情
     */
    function recordBehavior(project) {
        // 行为记录开关
        if (project && project.record && project.record === 1) {
            // 记录行为前，检查一下url记录是否变化
            checkUrlChange();
            // 户点击页面的元素的行为数据
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
                    innerText = e.target.innerText ? e.target.innerText.replace(/\s*/g, "") : "";
                    // 如果点击的元素内容过长，则部分截取
                    if (innerText.length > 200) innerText = innerText.substring(0, 20) + "......";
                    innerText = innerText.replace(/\s/g, '');
                }
                var behaviorInfo = new BehaviorInfo(ELE_BEHAVIOR, "click", className, placeholder, inputValue, tagName, innerText);
                behaviorInfo.handleLogInfo(ELE_BEHAVIOR, behaviorInfo);
            }
        }
    };

    /** 监控fetch请求 */
    function recordFetchLog() {
        if (!_window.fetch) return;
        let orgFetch = _window.fetch;
        _window.fetch = function () {
            return orgFetch.apply(this, arguments)
                .then(res => {
                    if (!res.ok) { // True if status is HTTP 2xx
                        var currentTime = new Date().getTime()
                        var httpLogInfo = new HttpLogInfo(HTTP_LOG, res.url, res.status, res.statusText, HTTP_ERROR, currentTime, 0);
                        httpLogInfo.handleLogInfo(HTTP_LOG, httpLogInfo);
                    }
                }).catch(error => {
                    var errorMsg = "";
                    var errorStack = "";
                    if (typeof error === "object") {
                        errorMsg = error.message;
                        errorStack = error.stack;
                    } else {
                        errorMsg = error;
                        errorStack = "";
                    }
                    processJavaScriptErrorInfo("syntax_error", errorMsg, WEB_LOCATION, 0, 0, "UncaughtInPromiseError: " + errorStack);
                })
        }
    }

    /**
     * @description 接口请求监控
     */
    function recordHttpLog(){
        // 如果是文件类型的地址，则忽略
        var protocol = _window.location.protocol;
        if (protocol === 'file:') return;

        // 处理fetch
        recordFetchLog();

        // 处理XMLHttpRequest
        if (!_window.XMLHttpRequest) {
            return;
        }
        var xmlhttp = _window.XMLHttpRequest;
        var orgSend = xmlhttp.prototype.send;
        var handleEvent = function (event) {
            if (event && event.currentTarget && event.currentTarget.status !== 200) {
                var currentTime = new Date().getTime()
                var httpLogInfo = new HttpLogInfo(HTTP_LOG, event.target.responseURL, event.target.status, event.target.statusText, HTTP_ERROR, currentTime, 0);
                httpLogInfo.handleLogInfo(HTTP_LOG, httpLogInfo);
            }
        }

        // TODO 重写send方法
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
        }
    };

    /**
     * @description 上报异常日志
     * @param url 上报异常日志的url
     * @param params array 异常日志数组
     * @param callback 上报完成后的回调
     */
    function _report(config={}, params) {
        return new Promise((resolve, reject) => {
            var img = new Image();
            // 非图片链接，所以返回一个错误事件
            img.onerror = function(){
                resolve()
            }
            img.src = `${config.url}?logs=${params}&timestamp=${new Date().getTime()}&id=${config.id}&version=${config.version}&user_id=${config.user_id}`;
        })
    }
}

export default WebMonitor