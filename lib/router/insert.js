var path = require('path');

/**
 * 路由的插值
 * @param  {[String]} context     [路由配置文件的内容]
 * @param  {[String]} filepath    [组件的路径]
 * @param  {[Object]} routerInfo  [已配置好的组件信息]
 * @return {[type]}               [description]
 */
module.exports = function (context, filepath, routerInfo = {}){
    var filename = path.basename(filepath,path.extname(filepath));
    if (!routerInfo.name) {
        routerInfo.name = filename;
    } else {
        filename = routerInfo.name;
    }
    if(!routerInfo.path){
        routerInfo.path = '/' + filename;
    }
    if(!routerInfo.component){
        routerInfo.component = filename;
    }
    //组件注册 
    var compStr =  routerInfo.component ? routerInfo.component : filename;
    delete routerInfo.component;
    // 组件引入字符
    var impStr = '\nimport ' + compStr + ' from \'' + filepath.replace('../','').replace('./','') + '\'\n';
    context = context.replace(impStr,'');//原有的移除掉
    // 组件注册字符串
    var regStr =  JSON.stringify(routerInfo);
    regStr = regStr.substring(0,regStr.lastIndexOf('}'));
    regStr = '\n\t\t' + regStr +  ',component:' + compStr + '},\n';
    context = context.replace(regStr,'');//原有的移除掉
    // 引入的插入
    var index = context.indexOf('Vue.use(Router)');
    var tmp = context.substring(0,index);
    context = context.replace(tmp, tmp + impStr);
    // 注册的插入
    index = context.indexOf('routes: [') + 'routes: ['.length;
    tmp = context.substring(index);
    context = context.replace(tmp, regStr + tmp);
    return context;
}
