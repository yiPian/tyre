/**
 * 辅助模板解析的工具库
 * @type {Object}
 */
var _PARSE_ = {
    /**
     * 将配置的数据转为模板变量
     * @param  {[Array]} configData [配置数据]
     * @return {[String]}           [模板变量解析字符串]
     */
    varParse : function (configData) {
        let vars = [];
        Object.keys(configData).forEach((name) => {
            vars.push(`var ${name} = DATA['${name}'];`);
        });
        return vars.join('');
    },
    /**
     * 模板的解析处理
     * @param  {[String]} tpl    [模板内容]
     * @param  {[Object]} config [配置内容]
     * @return {[type]}     [description]
     */
    templateParse : function (tpl, config) {
        let content = [];// 存放模板解析内容
        let beg = 0;// 解析文段起始位置
        let stmbeg = 0;// 表达式起始位置
        let stmend = 0;// 表达式结束位置
        let preCode = '';// 表达式前的代码
        let endCode = '';//最后一段代码
        let stmJs = '';// 表达式
        let len = tpl.length;

        while (beg < len) {
            // 搜索语句开始符
            stmbeg = tpl.indexOf(config.openTag, beg);
            if (stmbeg === -1) {// 到达最后一段代码
                endCode = tpl.substr(beg);
                content.push('_OUT.push(\`' + endCode + '\`);');
                break;
            }else {// 开始符之前代码
                preCode = tpl.substring(beg, stmbeg);
                content.push(`_OUT.push(\`${preCode}\`);`);
            }

            // 搜索结束符
            stmend = tpl.indexOf(config.closeTag, stmbeg);
            if(stmend === -1){// 没有结束符
                break;
            }
            // 表达式与标志符的解析
            var charAt = tpl.charAt(stmbeg + config.openTag.length); 
            [stmbeg, stmend, stmJs] = this.charParse(tpl, charAt, stmbeg, stmend, config);
            content.push(stmJs);
            beg = stmend + config.closeTag.length;
        }
        return content.join('');
    },
    /**
     * 表达式与标志符号的处理
     * @param  {[String]} tpl    [模板内容]
     * @param  {[String]} char   [标志符]
     * @param  {[Number]} stmbeg [开始解析的位置]
     * @param  {[Number]} stmend [结束解析的位置]
     * @param  {[Object]} config [配置内容]
     * @return {[Array]}         [解析后的相关信息]
     */
    charParse : function (tpl, char, stmbeg, stmend, config){
        let txt = '';// 匹配到的内容
        // 匹配赋值标识符与组件引入符号
        if (char === config.assignTag || char === config.componentTag){   
            // 组装完整标志符
            let tag = config.openTag;
            tag += char === config.assignTag ? config.assignTag : config.componentTag;
            // 计算字符截取起始位置
            stmbeg = tpl.indexOf(tag, stmbeg);
            stmend = tpl.indexOf(config.closeTag, stmbeg);
            // 匹配字符
            txt = tpl.substring(stmbeg, stmend).replace(tag,'');
            stmbeg +=  txt.length;
            // 若是组件引用，进行组件模板的解析
            if(char === config.componentTag){
                // console.log('---> 组件插入',txt);
                txt = this.compParse(txt);
                // txt = '_OUT.push('+ txt +');';
            }else{// 赋值语句
                txt = '_OUT.push(`${'+ txt +'}`);';
            }
        } else { // 语法处理
            txt = tpl.substring(stmbeg + config.openTag.length, stmend);
        }
        return [stmbeg, stmend, txt];
    },
    /**
     * 组件引入语句解析
     * @param  {[String]} txt [用于解析的字符]
     * @return {[String]}     [解析后的字符]
     */
    compParse : function(txt) {
        txt = txt.trim();
        let endIndex = txt.indexOf('/');//记录结束符号"/"的位置
        txt = txt.replace('/','');
        // 变量组装key=>value信息值传入
        var varStr = '[';
        // 参数变量分隔
        txt.split('|').forEach((item, i) => {
            if(i > 0){
                varStr += ',';
            }
            varStr += `{
                k : '${item}',
                v : ${item}
            }`;
        });
        varStr += ']';
        // console.log("--> varStr",varStr);
        //对象性 组件插入处理
        // if(splitArr.length == 1 && endIndex != 0){
        //     txt = _PARSE_.compObjParse(splitArr[0],endIndex);
        // } else {
        //     txt = _PARSE_.compVarParse(txt, splitArr, endIndex);
        // }
        txt = 'var compInfo = varAnalysis(' + varStr + ');' + 
              'varToComp(compInfo,'+endIndex+',filePath,path,compMap,_COMP,_VAR,_OUT,_RULES,prefix);';
        return  txt;
    },
    /**
     * 变量的解析
     * @param  {[Array]} varArr [解析插值变量的数组]
     * @return {[String]}       [插值转为组件字符串]
     */
    varAnalysis : function(varArr){
        // console.log('--> varStr',varArr);
        var obj = {};
        
        if (typeof varArr[0]['v'] == 'object'){ // 对象型组件插值
            obj = varArr[0]['v'];
            // _PARSE_.varToComp(varArr[0]['v']);
        } else { // 变量型组件插值
            // 将散乱的插值，转为规格对象 格式 {name:...,value:...,default:...,submit:...,}
            obj = { name : varArr[0]['v']};
            varArr.forEach((item, i) => {
                if(i > 0){
                    var keyName = _PARSE_.findKey(item.k);
                    obj[keyName] = item.v;
                }
            });
            // _PARSE_.varToComp(varArr[0]['v']);
        }
            // console.log('---->>> obj',obj);
        return obj;
    },
    /**
     * 插值变量转为组件
     * @param  {[type]} obj [description]
     * @return {[type]}     [description]
     */
    varToComp : function(compObj,endIndex,filePath,path,compMap,_COMP,_VAR,_OUT,_RULES,prefix=''){
        if(endIndex == 0){
            _OUT.push('</' + compObj['name'] + '>');
            return;
        }
        var compName = '';
        var compAttr = '';
        var varInfo = {value:'',submit:'',default:''};
        for (var k in compObj) {
            switch (k) {
                case 'name':
                    compName = compObj[k];
                    if (!_COMP[compName] && compMap[compName]) {
                        _COMP[compName] = path.relative(filePath,compMap[compName]);
                        if(_COMP[compName].indexOf('../') < 0){
                            _COMP[compName] = './' + _COMP[compName];
                        }
                        //加上前缀
                        if(prefix.length > 0){
                            compName = prefix + '-' + compName;
                        }
                    }
                    break;
                case 'value':
                    compAttr += ' v-model="';  
                    if(compObj.submit === true || compObj.submit === 'true'){
                        compAttr += 'formData.';
                    }
                    compAttr += compObj[k] + '"';
                    varInfo.value = compObj[k];
                    break;
                case 'default':
                    varInfo.default = compObj[k];
                    break;
                case 'submit':
                    varInfo.submit = compObj[k];
                    break;
                case 'rules':
                    _RULES.push({
                        k : compObj.value,
                        v : JSON.stringify(compObj[k])
                    })
                    break;
                default :
                    compAttr += ' ' + k + '="' + compObj[k] + '"';
                    break;
            }
        }
        _VAR.push(varInfo);
        _OUT.push('<' + compName + compAttr + '>');
        if(endIndex > 0){
            _OUT.push('</' + compName + '>');
        }
    },
    /**
     * 在表达式中找到表达式的key name
     * @param  {[String]} str [表达式字符串]
     * @return {[String]}     [key]
     */
    findKey : function(str){
        str = str.trim();
        str = str.replace(/\'/g,'').replace(/\"/g,'');
        var beg = 0;
        var end = str.length;
        var i_1 = str.lastIndexOf(']');
        var i_2 = str.lastIndexOf('.');
        if (i_1 > i_2) { // 下表引用
            beg = str.lastIndexOf('[');
            end -= 1;
        } else { // 属性引用
            beg = i_2;
        }
        str = str.substring(beg + 1,end);
        return str;
    }
}

module.exports = _PARSE_;