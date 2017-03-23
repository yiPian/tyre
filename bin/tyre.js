#!/usr/bin/env node
var program = require('commander'),
    start = require('../lib/start');;

program
    .version(require('../package.json').version)
    .usage('[config path]')
    .parse(process.argv);
// 获得配置文件路径
var path = program.args[0];
if(!path) program.help();
// 开始执行
start(path);