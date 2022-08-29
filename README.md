# webpack-cdn-local-plugin

适用于 webpack4 以上，基于 HtmlWebpackPlugin 插件。

一个 webpack 插件，将外部 cdn 下载到本地并注入页面。

### 安装

npm

```bash
npm install webpack-cdn-local-plugin --save-dev
```

或 yarn

```bash
yarn add webpack-cdn-local-plugin --dev
```

### 基础用法

```javascript
const WebpackCdnLocalPlugin = require('webpack-cdn-local-plugin')

module.exports = {
  // ...
  chainWebpack(config) {
    config.when(process.env.NODE_ENV === 'production', config => {
      config.plugin('WebpackCdnLocalPlugin').use(WebpackCdnLocalPlugin, [[
        {
          name: 'vue',
          var: 'Vue',
          script: 'https://unpkg.com/vue@2.6.14/dist/vue.min.js',
        },
        {
          name: 'vue-router',
          var: 'VueRouter',
          localScript: 'static/js/vue-router.min.js',
        },
        {
          name: 'element-ui',
          var: 'ELEMENT',
          style: 'https://unpkg.com/element-ui@2.15.9/lib/theme-chalk/index.css',
          localStyle: 'static/css/element-ui.min.css',
          script: 'https://unpkg.com/element-ui@2.15.6/lib/index.js',
          localScript: 'static/js/element-ui.min.js',
        },
      ]])
    })
  }
  // ...
};
```

### 生成的html

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>Index</title>
    <link href="/static/css/element-ui.min.css" rel="stylesheet">
  </head>
  <body>
    <script type="text/javascript" src="https://unpkg.com/vue@2.6.14/dist/vue.min.js"></script>
    <script type="text/javascript" src="/static/js/vue-router.min.js"></script>
    <script type="text/javascript" src="https://unpkg.com/element-ui@2.15.6/lib/index.js"></script>
    <script type="text/javascript" src="/static/js/bundle.js"></script>
  </body>
</html>
```

### 配置

`name`: `string`

外部模块的名称

`var`: `string`(可选)

模块的全局变量 不指定默认为`name`的值

`style`: `string`(可选)

外部css文件cdn链接

`localStyle`: `string`(可选)

本地css文件路径

`script`: `string`(可选)

外部js文件cdn链接

`localScript`: `string`(可选)

本地js文件路径

### 说明

同时配置`style`和`localStyle`时 将下载`style`文件到`localStyle`指定的路径

`script`和`localScript`同上

不配置`script`和`localScript`时 将不进行构建忽略


### 贡献

这个插件主要是为了满足个人需求，由于本人实力有限，目前只能完成这么多。

如果你在使用过程中碰到了什么问题，欢迎 [issues](/../../issues) 和 [pull requests](/../../pulls)。