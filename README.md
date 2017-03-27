## Tyre
> 共通性vue组件生成工具

### 背景

在开发一些管理系统时，会有这样的场景：好几个 “ 筛选＋结果列表” 这样的页面，这些页面的逻辑都大致相同，只是筛选条件不同，以及结果列表展示的字段也不同。从开发上来说，这属于重复性的工作。Tyre就是为了减少这样重复性工作的工具。

### 前提

Tyre基于ES6语法以及Vue框架，所以生成的标准文件是ES6语法的.vue文件。

Tyre的目的是解决 多个共通性页面 重复性工作的工具。所以，没有共同性的话，不怎么适用。

### 示例

**1.安装**

```
npm install tyre -g
```

**2.创建模板文件**

创建生成vue组件的模板文件 template.tpl ，使用<% %>作为占位符用于解析

```
<template>
    <h1> <%= title %> </h1>
    <div>
    <% if (true) { %>
        <%# input %>
    <% } %>
    </div>
</template>
```


**3.创建数据配置文件**

模板声明好了，需要data.json来配置相应的变量，作为数据依据

```
{
    "title" : "Hello Tyre",
    "input" : {
        "name" : "input",
        "value" : "val",
        "default" : "hello"
    }
}
```
完成以上步骤后通过命令行执行

```
tyre template.tpl data.json
```
执行完成后，将生成对应的data.vue文件

data.vue内容如下:

```
 <template>
    <h1> <%= title %> </h1>
    <div>
    <% if (true) { %>
        <%# input %>
    <% } %>
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
```

**tyre文档:** [https://yipian.gitbooks.io/tyre/content/](https://yipian.gitbooks.io/tyre/content/)