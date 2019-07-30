/**
 * @description 用户行为日志，继承于日志基类MonitorBaseInfo
 */
import MonitorBaseLog from './base'
import SetCommonProperty from './SetCommonProperty'
import Utils from '../utils/utils'

var utils = new Utils()

function BehaviorInfo(uploadType, behaviorType, className, placeholder, inputValue, tagName, innerText) {
    SetCommonProperty.apply(this);
    this.uploadType = uploadType;
    // this.pageKey = utils.getPageKey();
    this.behaviorType = behaviorType;
    this.className = utils.base64EncodeUnicode(className);
    this.placeholder = utils.base64EncodeUnicode(placeholder);
    this.inputValue = utils.base64EncodeUnicode(inputValue);
    this.tagName = tagName;
    this.innerText = utils.base64EncodeUnicode(encodeURIComponent(innerText));
}

BehaviorInfo.prototype = new MonitorBaseLog();
export default BehaviorInfo