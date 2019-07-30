/**
 * @description 设置日志对象类的通用属性
 */

import Utils from '../utils/utils'

var utils = new Utils()
const DEVICE_INFO = utils.getDevice();

function SetCommonProperty() {
    this.happenTime = new Date().getTime(); // 日志发生时间
    this.simpleUrl = window.location.href.split('?')[0].replace('#', ''); // 页面的url
    this.completeUrl = utils.base64EncodeUnicode(encodeURIComponent(window.location.href)); // 页面的完整url包含携带的参数
    this.deviceName = DEVICE_INFO.deviceName;
    this.os = DEVICE_INFO.os + (DEVICE_INFO.osVersion ? " " + DEVICE_INFO.osVersion : "");
    this.browserName = DEVICE_INFO.browserName;
    this.browserVersion = DEVICE_INFO.browserVersion;
    // this.customerKey = utils.getCustomerKey();
    // 用户自定义信息， 由开发者主动传入， 便于对线上问题进行准确定位
    // var wmUserInfo = USER_INFO;
    // this.userId = utils.base64EncodeUnicode(wmUserInfo.userId || "");
    // this.firstUserParam = utils.base64EncodeUnicode(wmUserInfo.wm_version || "");
    // this.secondUserParam = utils.base64EncodeUnicode(wmUserInfo.secondUserParam || "");
}

export default SetCommonProperty