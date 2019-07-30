/**
 * @description 页面静态资源加载错误统计，继承于日志基类MonitorBaseInfo
 */
import MonitorBaseLog from './base'
import SetCommonProperty from './SetCommonProperty'
import Utils from '../utils/utils'

var utils = new Utils()

function ResourceLoadInfo(uploadType, url, elementType, status) {
    SetCommonProperty.apply(this);
    this.uploadType = uploadType;
    // this.pageKey = utils.getPageKey();
    this.elementType = elementType;
    this.sourceUrl = utils.base64EncodeUnicode(encodeURIComponent(url));
    this.status = status;  // 资源加载状态： 0/失败、1/成功
}

ResourceLoadInfo.prototype = new MonitorBaseLog();
export default ResourceLoadInfo