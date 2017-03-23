var fs = require('fs-extra');
var path = require('path');
/**
 * 文件的读取逻辑，处理对应不同的数据格式
 */
module.exports = {
    /**
     * 获得当前文件所在目录
     * @param  {[type]} file [文件路径]
     * @return {[type]}      [所在的绝对路径]
     */
    dirPath : function(file) {
        return path.resolve(file).replace(path.basename(file),'');
    },
    /**
     * 读取JSON文件
     * @param  {[type]} file [文件路径]
     * @return {[type]}     [json对象]
     */
    readJson : function(file) {
        //使用同步读取，由外部处理异常监听
        return fs.readJsonSync(file);
    },
    /**
     * 读取文件
     * @param  {[type]} file [文件路径]
     * @return {[type]}      [读取到的内容]
     */
    readFile : function(file){
        return fs.readFileSync(file,'utf-8');
    },
    /**
     * [文件输出路径的组装]
     * @param  {[String]} dir      [目录路径]
     * @param  {[String]} output   [输出目录]
     * @param  {[String]} fileName [文件名称]
     * @return {[String]}          [组装后的文件完整路径]
     */
    makeFilePath : function (dir, output = '', fileName) {
        
        if(output.length > 0){
            if(output.indexOf('.') < 0){
                fileName = path.basename(fileName,'.json');//文件名称
                output += path.sep + fileName + '.vue';
            }
        }else{
            output = fileName;
        }
        var filePath = path.join(dir, output);
        dir = filePath.replace(path.basename(filePath),'');
        return [dir, filePath];
    },
    /**
     * 读取组件目录形成映射表
     * @param  {[type]} dir [参照的绝对路径]
     * @param  {[type]} compDir [要读取的组件目录的相对路径]
     * @return {[type]}     [映射表]
     */
    componentsMap : function(dir, compDir) {
        var fileArr = [];//组件映射表
        // 读取文件
        var readFile = function(dir, filename){
            // 组件目录的绝对路径
            var pathName = path.join(dir,filename);
            fs.readdirSync(pathName).forEach(function(f){
                var filePath = path.join(pathName,f);// 文件绝对路径
                var statInfo = fs.statSync(filePath);
                if(statInfo.isFile() && path.extname(f) == '.vue'){// 获取vue文件
                    fileArr[path.basename(f,'.vue')] = filePath;
                }else if(statInfo.isDirectory()){// 目录
                    readFile(pathName,f);
                }
            });
        };
        readFile(dir, compDir);
        return fileArr;
    },
    /**
     * 读取配置，形成配对表
     * @param  {[type]} dir    [参照的绝对路径]
     * @param  {[type]} tplDir [模板所在的目录]
     * @return {[type]}        [模板json配对表]
     */
    templateMap : function(dir, tplDir){
        var fileArr = [];//组件配对表
         // 读取文件
        var readFile = function(dir, filename){
            // 组件目录的绝对路径
            var pathName = path.join(dir,filename);
            var obj = {
                path:pathName,
                tpl : '',//记录.tpl的路径
                json : [] //记录config.json的路径
            }
            fs.readdirSync(pathName).forEach(function(f){
                var filePath = path.join(pathName,f);// 文件绝对路径
                var statInfo = fs.statSync(filePath);
                var ext = path.extname(f);//获得后缀名
                if(statInfo.isFile()){// 获取vue文件
                    if(ext == '.tpl'){
                        obj.tpl = filePath;
                    }else if(ext == '.json'){
                        obj.json.push(f);
                    }
                }else if(statInfo.isDirectory()){// 目录
                    readFile(pathName,f);
                }
            });
            if(obj.tpl.length > 0){
                fileArr.push(obj);
            }
        };
        readFile(dir, tplDir);
        return fileArr;
    },
    /**
     * [文件的写入]
     * @param  {[type]} filePath [文件写入路径]
     * @param  {[type]} data     [写入数据]
     * @return {[type]}          [description]
     */
    write : function (filePath, data) {
        fs.outputFile(filePath,data,function(err){
            if(err)
                console.error(err);
            else
                console.log('success:',filePath);
        });
    }
}