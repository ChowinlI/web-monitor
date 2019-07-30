/**
 * @description 用户加载页面的信息日志，继承于日志基类MonitorBaseLog
 */
import MonitorBaseLog from './base'
import SetCommonProperty from './SetCommonProperty'

function LoadPageInfo(uploadType, loadType, loadPage, domReady, redirect, lookupDomain, ttfb, request, loadEvent, appcache, unloadEvent, connect) {
    SetCommonProperty.apply(this);
    this.uploadType = uploadType;
    // this.pageKey = utils.getPageKey();
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
export default LoadPageInfo