/**
 * @description 接口请求日志，继承于日志基类MonitorBaseInfo
 */
import MonitorBaseLog from './base'
import SetCommonProperty from './SetCommonProperty'
import Utils from '../utils/utils'

var utils = new Utils()

function HttpLogInfo(uploadType, url, status, statusText, statusResult, currentTime, loadTime) {
    SetCommonProperty.apply(this);
    this.uploadType = uploadType;  // 上传类型
    // this.pageKey = utils.getPageKey();
    this.httpUrl = utils.base64EncodeUnicode(encodeURIComponent(url)); // 请求地址
    this.status = status; // 接口状态
    this.statusText = statusText; // 状态描述
    this.statusResult = statusResult; // 区分发起和返回状态
    this.happenTime = currentTime;  // 客户端发送时间
    this.loadTime = loadTime; // 接口请求耗时
}
HttpLogInfo.prototype = new MonitorBaseLog();
export default HttpLogInfo