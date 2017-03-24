1.安装
<pre><code>
npm install tyre -g
</code></pre>

2.创建模板文件

创建生成vue组件的模板文件 template.tpl ，使用<% %>作为占位符用于解析

# template.tpl
<pre><code>
<template>
    <h1> <%= title %> </h1>
    <div>
    <% if (true) { %>    
        <%# input %>
    <% } %>
    </div>
</template>
</code></pre>

3.创建数据配置文件

模板声明好了，需要data.json来配置相应的变量，作为数据依据

# data.json

<pre><code>
{
    "title" : "Hello Tyre",
    "input" : {
        "name" : "input",
        "value" : "val",
        "default" : "hello"
    }
}
</code></pre>
完成以上步骤后通过命令行执行

# 执行tyre命令
<pre><code>
tyre template.tpl data.json
</code></pre>
执行完成后，将生成对应的data.vue文件

结果如下:

# data.vue
<pre><code>
<template>
    <h1> Hello Tyre </h1>
    <div> 
        <input v-model="val">
    </div>
</template>
<script>
    export default {
        data () {
            return {
                val : 'hello'
            }
        }
    }
</script>
</code></pre>