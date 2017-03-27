 /**
 * 1、读取配置.json文件
 * 2、获取components信息，若有组件的配置信息，读取对应目录生成组件映射表
 *        映射表格式:
 *        [
 *            ComponentName : 'Component的绝对路径',...
 *        ]
 * 3、读取entry目录下.tpl和.json配对分组
 *        配对表格式
 *        [{
 *            path : '.tpl和.json所在目录的绝对路径',
 *            
 *        }]
 */
var utils = require('./utils.js');
var path = require('path');
var routerInsert = require('./router/insert.js');
var componetTemplate = require('./component/template.js');
var configInfo = {
    compMap : [],// 定义组件映射表
    tplMap : [],// .tpl与.json的配对表
    dirpath : '',// 获取配置文件，所在的目录的绝对路径
    output : '',// 输出路径
    prefix : '',//组件的前缀
    routerContext : '',  // 路由的内容
    routerPath : '' // 路由文件的路径
}
/**
 * 命令行多个参数的处理
 * @param  {[Array]} args [传入的命令行参数]
 * @return {[type]}      [description]
 */
let manyParamHandle = function (args) {
    configInfo.dirPath = process.cwd();//获得当前路径
    configInfo.output = path.join(configInfo.dirPath , '../');
    var obj = {
        path: configInfo.dirPath,
        tpl : '',//记录.tpl的路径
        json : [] //记录config.json的路径
    }
    for (var i in args) {
        var ext = path.extname(args[i]);//获得后缀名
        if(ext == '.tpl'){
            obj.tpl = args[i];
        }else if(ext == '.json'){
            obj.json.push(args[i]);
        }
    }
    configInfo.tplMap.push(obj);
}

/**
 * 配置文件参数的处理
 * @param  {[String]} config [配置文件路径]
 * @return {[Object]}        [配置信息对象]
 */
let configParamHandle = function (config) {
    if (path.extname(config) == '.json'){
        configInfo.dirpath = utils.dirPath(config);
        // 读取配置文件
        var configJson = utils.readJson(config);
        if (configJson.entry && configJson.output) {
            configInfo.output = configJson.output;
            // 读取组件目录，形成映射表
            if(configJson.components && configJson.components.path){
                configInfo.prefix  = configJson.components.prefix || '';
                configInfo.compMap = utils.componentsMap(configInfo.dirpath,configJson.components.path);
            }
            // 模板配对
            configInfo.tplMap = utils.templateMap(configInfo.dirpath,configJson.entry);
            // 路由的读取
            if (configJson.router) {
                configInfo.routerPath = path.join(configInfo.dirpath,configJson.router);
                configInfo.routerContext = utils.readFile(configInfo.routerPath);
            }
        } else {
            console.error('entry或output可能没有配置');
        }
    } else {
        console.error('没找到Json格式的配置文件');
    }
}
/**
 * tyre的启动文件
 * @param  {[type]} args [tyre 对应参数]
 */
module.exports = function(args){

    try {
        if(args.length == 1){
            configParamHandle(args[0]);
        } else {
            manyParamHandle(args);
        }
        // 遍历配对表
        configInfo.tplMap.forEach((obj) => { 
            //读取.tpl的内容
            var tplContent =  utils.readFile(obj.tpl);
            // .json挨个处理
            obj.json.forEach((jsonFile) => {
                // 读取json配置数据
                var jsonObj = utils.readJson(path.join(obj.path, jsonFile));
                // 文件输出路径
                var [outputDir, outputPath] = utils.makeFilePath(path.join(configInfo.dirpath,configInfo.output),jsonObj.output, jsonFile);
                //模板解析
                var tempStr = componetTemplate(tplContent,jsonObj,configInfo.compMap,outputDir,configInfo.routerContext,configInfo.prefix);
                //模板文件的写入
                utils.write(outputPath,tempStr);
                // 路由的处理
                if (configInfo.routerPath.length > 0){
                    configInfo.routerContext = routerInsert(configInfo.routerContext, path.relative(configInfo.routerPath,outputPath), jsonObj.router);
                }
            });
        });
        //路由的写入
        if (configInfo.routerPath.length > 0){
            utils.write(configInfo.routerPath,configInfo.routerContext);
        }
    } catch (err) {
        console.error(err);
    }
}