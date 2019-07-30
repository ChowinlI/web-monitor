/**
 * @description 异常日志基类
 */
import CONST from '../utils/const'

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
    }
}

export default MonitorBaseLog