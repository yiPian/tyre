
const _REG = {// 匹配规则
    // <script>脚本匹配规则
    script : /\<script\>([\s\S]+)?\<\/script\>/,
    // export default {}匹配
    expo : /export default[\s]*\{([\s\S]+)?\}/,
    // data () {} 匹配规则
    // data : /data[\s]*\(\)[\s]*\{[\s]*return[\s]*\{([\s\S]+)?\}/,
    data : /data[\s]*\(\)[\s]*\{[\s]*return[\s]*\{([\s\S]+)?(?=\})/,
    // formData: {} 匹配规则
    form : /formData[\s]*\:[\s]*\{([\s\S]+)?(\})/,
    // rules: {} 匹配规则
    rules : /rules[\s]*\:[\s]*\{([\s\S]+)?(\}.*?)/,
    // componemts : {} 匹配规则
    comp : /components[\s]*\:[\s]*\{([\s\S]+)?(\})/
};
const _COMPSTR = `
    components: {
    },`;
const _FORMSTR = `formData: {
            },`;
const _RULESSTR = `rules: {
            },`;
const _DATASTR = `
    data () {
        return {
            ${_FORMSTR}
            ${_RULESSTR}
        }
    },`;
const _EXPOSTR = '\nexport default {'+ _DATASTR + _COMPSTR + '\n}';
const _SCRIPTSTR = '\n<script>' + _EXPOSTR + '\n</script>';

/**
 * [获取正则规则到的文本]
 * @param  {[String]} txt [要过滤的文本]
 * @param  {[Reg]}    reg [匹配规则]
 * @return {[String]}     [匹配到的文本]
 */
let regFilter = function(txt, reg){
    var index = txt.search(reg);
    if(index >= 0){
        var tmp = txt.replace(reg,'');
        var len = txt.length - tmp.length;
        txt = txt.substring(index,len + index);
    }
    return txt;
}

/**
 * 组件module对象中缺值匹配的处理
 * @param  {[type]} txt [验证的文本]
 * @param  {[type]} reg [匹配规则]
 * @param  {[type]} rep [要替换内容的规则]
 * @param  {[type]} str [累加的文本]
 * @return {[type]}     [description]
 */
let regModule = function (txt, reg, rep, str) {
    var regRs = reg.exec(txt);
    if (!regRs) {
        if (rep) {
            var tmp = regFilter(txt, rep);
            var repRs = tmp.match(rep);
            tmp = tmp.replace(repRs[1], str + repRs[1]);
            txt = txt.replace(rep,tmp);
        } else {
            txt += str;
        }
    }
    return txt;
}
/**
 * [组件的插入]
 * @param  {[String]} txt [处理插值的内容]
 * @param  {[Array]}  arr [插入的组件列表]
 * @return {[String]}     [插值完成后的内容]
 */
let compInsert = function (txt, arr, prefix) {
    var imp = '\n';//import 的内容
    var reg = '\n\t\t';//组件注册的内容
    for (var k in arr) {
        imp += 'import ' + prefix  + k + ' from \'' + arr[k] + '\'\n';
        reg += prefix + k + ', ';
    }

    // import 的插入
    var tmp = regFilter(txt, _REG.expo);
    imp += tmp;
    txt = txt.replace(tmp, imp);

    // 组件注册
    tmp = regFilter(txt, _REG.comp);
    reg = 'components: {' + reg + tmp.replace(/components[\s]*\:[\s]*\{/, '');
    txt = txt.replace(tmp, reg);

    return txt;
}
/**
 * [绑定字段的注入]
 * @param  {[String]} txt [处理插值的内容]
 * @param  {[Array]}  arr [插入字段的列表]
 * @return {[String]}     [插值完成后的内容]
 */
let varibleInsert = function (txt, arr){
    var sub = '';//formData中的字段
    var ord = '';//普通绑定字段
    var info = {};// 绑定字段信息
    var def = '';//默认值
    for (var i in arr) {
        info = arr[i];
        def =  (info.default != 'undefined' && info.default.length > 0) ? info.default : '';
        if ((info.submit === true || info.submit === 'true' || info.submit === 'TRUE') && sub.indexOf(info.value) < 0) {
            sub += '\n\t\t\t\t' + info.value + ': \'' + def + '\',';
        } else if (ord.indexOf(info.value) < 0) {
            ord +=  '\n\t\t\t' + info.value + ': \'' + def + '\',';
        }
    }

    // formData中插入字段
    var tmp = regFilter(txt, _REG.form);
    sub = 'formData: {' + sub + tmp.replace(/formData[\s]*\:[\s]*\{/,'');
    txt = txt.replace(tmp, sub);

    // 普通绑定插入字段
    tmp = regFilter(txt, _REG.form);
    ord += '\n\t\t\t' + tmp;
    txt = txt.replace(tmp, ord);

    return txt;
}
/**
 * [验证规则的插入]
 * @param  {[String]} txt [处理插值的内容]
 * @param  {[Array]}  arr [插入规则的列表]
 * @return {[String]}     [插值完成后的内容]
 */
let rulesInsert = function (txt, arr) {
    var rules = ''; // 规则内容
    for (var k in arr) {
        rules += '\n\t\t\t\t' + arr[k]['k'] + ': ' + arr[k]['v'] + ', ';
    }
    var tmp = regFilter(txt, _REG.rules);
    rules = '\n\t\t\trules: {' + rules + tmp.replace(/rules[\s]*\:[\s]*\{/, '');
    txt = txt.replace(tmp, rules);
    return txt;
}

/**
 * 组件的插值
 * @param  {[String]} txt   [处理插值的内容]
 * @param  {[Array]}  _COMP [插入的组件列表]
 * @param  {[Array]}  _VAR  [插入的变量列表]
 * @param  {[String]} prefix    [引入组件的前缀]
 * @return {[String]}       [插值完成后的内容]
 */
module.exports = function(txt, _COMP, _VAR, _RULES , prefix = ''){
        // script的匹配
        txt = regModule(txt, _REG.script, null, _SCRIPTSTR);
        // export的匹配
        txt = regModule(txt, _REG.expo, _REG.script, _EXPOSTR);
        // components的匹配
        txt = regModule(txt, _REG.comp, _REG.expo, _COMPSTR);
        // data的匹配
        txt = regModule(txt, _REG.data, _REG.expo, _DATASTR);
        // rules的匹配
        txt = regModule(txt, _REG.rules, _REG.data, _RULESSTR);
        // formdata的匹配
        txt = regModule(txt, _REG.form, _REG.data, _FORMSTR);

        // 组件插值处理
        txt = compInsert(txt, _COMP, prefix);
        // 绑定字段的插入处理
        txt = varibleInsert(txt, _VAR);
        // 验证规则的插入处理
        txt = rulesInsert(txt, _RULES);
        return txt;
}