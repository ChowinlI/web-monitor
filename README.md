# web-monitor

## 安装
```
npm install
```

### 打包
```
npm run build
```

### script 标签引用

```
<script type="text/javascript" src="./webMonitor.js"></script>
```

### npm 安装及引用
```
npm install 61-webmonitor --save
```
```
import * as WebMonitor from '61-webmonitor'
```

### 初始化
```
var monitor = new WebMonitor();
monitor.init({
    id: 1，// 必填，项目id
    url: "http://example", // 必填,上报接口url
    user_id: "", // 可选，用户id
    auto: false, // 可选，是否自动上报,默认为true
    dalay: 2000, // 可选，自动上报定时，默认为2000
    ignores: [] // 可选，忽略的异常类型，默认为[]
})

/** 手动上报 */
monitor.report()

```
或者
```
var monitor = new WebMonitor({
    id: 1，// 必填，项目id
    url: "http://example", // 必填,上报接口url
    user_id: "", // 可选，用户id
    auto: false, // 可选，是否自动上报,默认为true
    dalay: 2000, // 可选，自动上报定时，默认为2000
    ignores: [] // 可选，忽略的异常类型，默认为[]
});

monitor.init()

/** 手动上报 */
monitor.report()
```

### 可忽略异常备注
```
'CUSTOMER_PV' // 用户访问日志类型

'LOAD_PAGE' // 用户加载页面信息类型

'HTTP_LOG' // 接口日志类型

'HTTP_ERROR' // 接口错误日志类型

'JS_ERROR' // js报错日志类型

'ELE_BEHAVIOR' // 用户的行为类型

'RESOURCE_LOAD' // 静态资源类型

'CUSTOMIZE_BEHAVIOR' // 用户自定义行为类型
```

### 相关参考及文章
1. [js前端页面探针](https://github.com/a597873885/webfunny_monitor)
2. [JS错误总结](https://segmentfault.com/a/1190000014672384)
