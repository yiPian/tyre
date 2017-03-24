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
/**
 * tyre的启动文件
 * @param  {[type]} path [tyre 的配置文件路径]
 * @return {[type]}      [description]
 */
module.exports = function(config){
    try {
        
        var compMap = [];// 定义组件映射表
        var tplMap = [];// .tpl与.json的配对表
        // 获取配置文件，所在的目录的绝对路径
        var dirpath = utils.dirPath(config);
        // 读取配置文件
        var configJson = utils.readJson(config);
        var prefix = '';//组件的前缀
        // 读取组件目录，形成映射表
        if(configJson.components && configJson.components.path){
            prefix  = configJson.components.prefix;
            compMap = utils.componentsMap(dirpath,configJson.components.path);
        }
        // 模板配对
        tplMap = utils.templateMap(dirpath,configJson.entry);

        // 路由文件的地址 
        var routerPath = path.join(dirpath,configJson.router);
        // console.log('routerPath',routerPath);
        // 读取路由的内容
        var routerContext = utils.readFile(routerPath);

        // 遍历配对表
        tplMap.forEach((obj) => { 
            //读取.tpl的内容
            var tplContent =  utils.readFile(obj.tpl);
            // .json挨个处理
            obj.json.forEach((jsonFile) => {
                // 读取json配置数据
                var jsonObj = utils.readJson(path.join(obj.path, jsonFile));
                // 文件输出路径
                var [outputDir, outputPath] = utils.makeFilePath(path.join(dirpath,configJson.output),jsonObj.output, jsonFile);
                //模板解析
                var tempStr = componetTemplate(tplContent,jsonObj,compMap,outputDir,routerContext,prefix);
                //模板文件的写入
                utils.write(outputPath,tempStr);
                // 路由的处理
                routerContext = routerInsert(routerContext, path.relative(routerPath,outputPath), jsonObj.router);
            });
        });
        //路由的写入
        utils.write(routerPath,routerContext);

    } catch (err) {
        console.error(err);
    }
}