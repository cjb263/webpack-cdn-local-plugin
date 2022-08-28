const http = require("http");
const https = require("https");
const HtmlWebpackPlugin = require("html-webpack-plugin");

class WebpackCdnLocalPlugin {
  constructor(modules) {
    this.modules = modules || [];
  }

  apply(compiler) {
    const { output } = compiler.options;
    compiler.hooks.compilation.tap("WebpackCdnLocalPlugin", (compilation) => {
      const cssOptions = WebpackCdnLocalPlugin._get(this.modules, output.publicPath, "localStyle", "style");
      const jsOptions = WebpackCdnLocalPlugin._get(this.modules, output.publicPath, "localScript", "script");

      const css = cssOptions.map((p) => p.src);
      const js = jsOptions.map((p) => p.src);
      WebpackCdnLocalPlugin._setHtmlAssetsPlugin(compilation, css, js);

      compilation.hooks.additionalAssets.tapAsync("WebpackCdnLocalPlugin", async (callback) => {
        await Promise.all([
          WebpackCdnLocalPlugin._setAssetsPlugin(compilation, cssOptions),
          WebpackCdnLocalPlugin._setAssetsPlugin(compilation, jsOptions),
        ]);

        callback();
      });
    });

    const externals = compiler.options.externals || {};

    this.modules.forEach((p) => {
      if (p.localScript || p.script) externals[p.name] = p.var || p.name;
    });

    compiler.options.externals = externals;
  }

  static _setHtmlAssetsPlugin(compilation, css, js) {
    WebpackCdnLocalPlugin._getHtmlHook(
      compilation,
      "beforeAssetTagGeneration",
      "htmlWebpackPluginBeforeHtmlGeneration"
    ).tapAsync("WebpackCdnLocalPlugin", (data, callback) => {
      data.assets.css = css.concat(data.assets.css);
      data.assets.js = js.concat(data.assets.js);
      callback(null, data);
    });
  }

  static async _setAssetsPlugin(compilation, options) {
    await Promise.all(
      options
        .filter((p) => p.cdn)
        .map(async (p) => {
          const fileText = await WebpackCdnLocalPlugin._request(p.cdn);
          compilation.assets[p.src] = {
            source: () => new Buffer.from(fileText),
          };
        })
    );
  }

  static _get(modules, publicPath, localScript, script) {
    return modules
      .filter((p) => p[localScript] || p[script])
      .map((p) => {
        const cdn = p[script];
        const path = p[localScript];
        const src = path ? publicPath + path : cdn;
        if (/^https?/gi.test(cdn) && path) {
          return { src, cdn };
        }
        return { src };
      });
  }

  static _request(link) {
    return new Promise((resolve, reject) => {
      const request = /https:/.test(link) ? https : http;
      request.get(link, (res) => {
        res.on("data", (data) => resolve(data));
        res.on("error", (error) => reject(error));
      });
    });
  }

  static _getHtmlHook(compilation, v4Name, v3Name) {
    try {
      return HtmlWebpackPlugin.getHooks(compilation)[v4Name] || compilation.hooks[v3Name];
    } catch (e) {
      return compilation.hooks[v3Name];
    }
  }
}

module.exports = WebpackCdnLocalPlugin;
