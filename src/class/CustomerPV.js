/**
 * @description 用户访问日志（PV），继承于日志基类
 */
import MonitorBaseLog from './base'
import SetCommonProperty from './SetCommonProperty'


function CustomerPV(uploadType, loadType, loadTime) {
    SetCommonProperty.apply(this);
    this.uploadType = uploadType;
    // this.pageKey = utils.getPageKey();  // 用于区分页面，所对应唯一的标识，每个新页面对应一个值
    this.loadType = loadType;  // 用以区分首次加载
    this.loadTime = loadTime; // 加载时间
}

CustomerPV.prototype = new MonitorBaseLog();
export default CustomerPV