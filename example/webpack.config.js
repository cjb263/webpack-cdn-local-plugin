const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const WebpackCdnLocalPlugin = require("../");

module.exports = {
  mode: process.env.NODE_ENV || "development",
  entry: path.join(__dirname, "index.js"),
  output: {
    publicPath: "./",
    path: path.join(process.cwd(), "dist"),
    filename: "js/index.js",
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: "index.html",
      inject: "body",
    }),
    new WebpackCdnLocalPlugin([
      {
        name: "vue1",
        var: "Vue1",
        style: "https://unpkg.com/element-ui/lib/theme-chalk/index.css",
        script: "https://unpkg.zhimg.com/vue@2.6.14/dist/vue.min.js",
      },
      {
        name: "vue2",
        var: "Vue2",
        localStyle: "css/element-ui2.min.css",
        localScript: "js/vue2.min.js",
      },
      {
        name: "vue3",
        var: "Vue3",
        style: "https://unpkg.com/element-ui/lib/theme-chalk/index.css",
        localStyle: "css/element-ui3.min.css",
        script: "https://unpkg.zhimg.com/vue@2.6.14/dist/vue.min.js",
        localScript: "js/vue3.min.js",
      },
    ]),
  ],
};
