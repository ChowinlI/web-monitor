/**
 * @description JS错误日志，继承于日志基类MonitorBaseInfo
 */
import MonitorBaseLog from './base'
import SetCommonProperty from './SetCommonProperty'
import Utils from '../utils/utils'

var utils = new Utils()


function JavaScriptErrorInfo(uploadType, infoType, errorMsg, errorStack, rowNumber, colNumber) {
    SetCommonProperty.apply(this);
    this.uploadType = uploadType;
    this.infoType = infoType;
    // this.pageKey = utils.getPageKey();  // 用于区分页面，所对应唯一的标识，每个新页面对应一个值
    this.errorMessage = utils.base64EncodeUnicode(errorMsg);
    this.errorStack = utils.base64EncodeUnicode(errorStack);
    this.rowNumber = rowNumber;
    this.colNumber = colNumber;
}

JavaScriptErrorInfo.prototype = new MonitorBaseLog();
export default JavaScriptErrorInfo