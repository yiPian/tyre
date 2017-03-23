# Tyre 工具是根据模板配置和数据配置 生成对应vue组件的工具
### 相关配置参数如下

<pre><code>
{
    "entry" : "template.tpl与config.json的所在目录",
    "output" : "生成的.vue文件输出目录",
    "components" : {
        "path" : "现有组件所在目录，读取映射表时使用",
        "prefix" : "引用组件的前缀"
    }
}
</code></pre>