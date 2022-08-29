const axios = require("axios");
const { RawSource } = require("webpack-sources");
const HtmlWebpackPlugin = require("html-webpack-plugin");

class WebpackCdnLocalPlugin {
  constructor(modules) {
    this.modules = modules || [];
  }

  apply(compiler) {
    const { output } = compiler.options;
    const cssOptions = WebpackCdnLocalPlugin._get(
      this.modules,
      output.publicPath,
      "localStyle",
      "style"
    );
    const jsOptions = WebpackCdnLocalPlugin._get(
      this.modules,
      output.publicPath,
      "localScript",
      "script"
    );

    compiler.hooks.compilation.tap("WebpackCdnLocalPlugin", (compilation) => {
      WebpackCdnLocalPlugin._setHtmlAssetsPlugin(
        compilation,
        cssOptions.map((p) => p.src),
        jsOptions.map((p) => p.src)
      );

      compilation.hooks.additionalAssets.tapPromise(
        "WebpackCdnLocalPlugin",
        async () => {
          await Promise.all([
            WebpackCdnLocalPlugin._setAssetsPlugin(compilation, cssOptions),
            WebpackCdnLocalPlugin._setAssetsPlugin(compilation, jsOptions),
          ]);
        }
      );
    });

    WebpackCdnLocalPlugin._setExternals(compiler, this.modules);
  }

  static _setExternals(compiler, modules) {
    const externals = compiler.options.externals || {};

    modules.forEach((p) => {
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
          const buffer = await WebpackCdnLocalPlugin._request(p.cdn);
          compilation.emitAsset(p.src, new RawSource(buffer));
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

  static async _request(link) {
    const response = await axios.get(link, { responseType: "arraybuffer" });
    return response.data;
  }

  static _getHtmlHook(compilation, v4Name, v3Name) {
    try {
      return (
        HtmlWebpackPlugin.getHooks(compilation)[v4Name] ||
        compilation.hooks[v3Name]
      );
    } catch (e) {
      return compilation.hooks[v3Name];
    }
  }
}

module.exports = WebpackCdnLocalPlugin;
