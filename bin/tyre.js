#!/usr/bin/env node
var program = require('commander'),
    start = require('../lib/start');;

program
    .version(require('../package.json').version)
    .usage('[config path]')
    .parse(process.argv);
// 获得配置文件路径
if(program.args.length < 1) program.help();
// 开始执行
start(program.args);