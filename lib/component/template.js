var path = require('path');
var parse = require('./parse.js');
var insert = require('./insert.js');
/**
 * 模板的渲染
 * @param  {[String]} template  [模板内容]
 * @param  {[Object]} configData[渲染的数据]
 * @param  {[Array]}  compMap   [组件的映射表]
 * @param  {[String]} filePath  [渲染成功后，文件输入的路径]
 * @param  {[String]} prefix    [引入组件的前缀]
 * @return {[String]}           [渲染成功后的模板内容]
 */
module.exports = function(template, configData, compMap, filePath, routerContext, prefix = ''){
    template = template.replace(/\t/g, '  ').replace(/\n/g, '\\n').replace(/\r/g, '\\r');
    const config = {
        openTag : '<%',// 开始标志符
        closeTag : '%>', //结束标志符
        assignTag : '=', //赋值语句标志符
        componentTag : '#' //组件引入语句标志符
    };
    // 存放模板解析内容
    let _PARSE = [];
    // 初始化模板生成器
    let struct = [
        /*
            _OUT 存放解析的内容
            _COMP 存放需要引入的组件
            _VAR 存放需要插值的变量
            _RULES 存放要验证的规则
            prefix 组件的前缀
         */
        `try {
            var _OUT = [];
            var _COMP = [];
            var _VAR = [];
            var _RULES = [];
            var prefix = '${prefix}';`,
        '', // 放置模板生成器占位符
        `   var content = _OUT.join('');
            content = insetParse(content, _COMP, _VAR, _RULES, prefix);
            return content;
        } catch (e) {
            throw e;
        }`
    ];
            //content = compImport(content,_COMP);
    // 初始化模板变量
    _PARSE.push(parse.varParse(configData));
    struct[1] = _PARSE.join('');
    // 模板的解析
    struct[1] += parse.templateParse(template,config);
    // 定义解析函数
    let func = new Function('DATA','compMap','filePath','path','insetParse','varAnalysis','varToComp',struct.join(''));
    var content = func(configData,compMap,filePath,path, insert,parse.varAnalysis,parse.varToComp);

    return content;
};