const path = require("path");
const fse = require("fs-extra");
const glob = require("glob");
const minimatch = require("minimatch");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const sassJsonImporter = require("node-sass-json-importer");
const rtlcss = require('rtlcss');
const { ConcatSource } = require('webpack-sources');
const { forEachOfLimit } = require('async');
const cssnano = require('cssnano');


const ALIASES = {
    base: path.resolve(__dirname, "cartridges", "app_storefront_base", "cartridge", "client", "default"),
    brandcore: path.resolve(__dirname, "cartridges", "app_mouawad_core", "cartridge", "client", "default"),
    wishlist: path.resolve(__dirname, "cartridges", "plugin_wishlists", "cartridge", "client", "default"),
    applepay: path.resolve(__dirname, "cartridges", "plugin_applepay", "cartridge", "client", "default")
};

class WebpackRTLPlugin {
    constructor(options) {
      this.options = {
        filename: false,
        options: {},
        plugins: [],
        ...options
      }
    }

    apply(compiler) {
      compiler.hooks.emit.tapAsync("WebpackRTLPlugin", (compilation, callback) => {
        forEachOfLimit(compilation.chunks, 5, (chunk, key, cb) => {
          const rtlFiles = []
          let cssnanoPromise = Promise.resolve()

          chunk.files.forEach(asset => {
            const match = this.options.test ? new RegExp(this.options.test).test(asset) : true

            if (path.extname(asset) !== '.css') {
              return
            }

            const baseSource = compilation.assets[asset].source()
            let filename
            let rtlSource

            if (match) {
              rtlSource = rtlcss.process(baseSource, this.options.options, this.options.plugins)

              if (this.options.filename instanceof Array && this.options.filename.length === 2) {
                filename = asset.replace(this.options.filename[0], this.options.filename[1])
              }
              else if (this.options.filename) {
                filename = this.options.filename

                if (/\[contenthash]/.test(this.options.filename)) {
                  const hash = createHash('md5').update(rtlSource).digest('hex').substr(0, 10)
                  filename = filename.replace('[contenthash]', hash)
                }
                if (/\[id]/.test(this.options.filename)) {
                  filename = filename.replace('[id]', chunk.id)
                }
                if (/\[name]/.test(this.options.filename)) {
                  filename = filename.replace('[name]', chunk.name)
                }
                if (/\[file]/.test(this.options.filename)) {
                  filename = filename.replace('[file]', asset)
                }
                if (/\[filebase]/.test(this.options.filename)) {
                  filename = filename.replace('[filebase]', path.basename(asset))
                }
                if (/\[ext]/.test(this.options.filename)) {
                  filename = filename.replace('.[ext]', path.extname(asset))
                }
              }
              else {
                const newFilename = `${path.basename(asset, '.css')}.rtl`
                filename = asset.replace(path.basename(asset, '.css'), newFilename)
              }
            }

            if (this.options.minify !== false) {
              let nanoOptions = { from: undefined };
              let cssProcessorPluginOptions = this.options.cssProcessorPluginOptions || {};
              if (typeof this.options.minify === 'object') {
                nanoOptions = this.options.minify
              }

              cssnanoPromise = cssnanoPromise.then(() => {
                let minify = cssnano.process( baseSource, nanoOptions, cssProcessorPluginOptions).then(output => {
                  compilation.assets[asset] = new ConcatSource(output.css)
                });

                if (match) {
                  const rtlMinify = cssnano.process(rtlSource, nanoOptions, cssProcessorPluginOptions).then(output => {
                    compilation.assets[filename] = new ConcatSource(output.css)
                    rtlFiles.push(filename)
                  });

                  minify = Promise.all([minify, rtlMinify]);
                }

                return minify;
              })
            }
            else if (match) {
              compilation.assets[filename] = new ConcatSource(rtlSource)
              rtlFiles.push(filename)
            }
          })

          cssnanoPromise.then(() => {
            chunk.files.push.apply(chunk.files, rtlFiles)
            cb()
          })
        }, callback)
      })
    }
}
class PostBuildCleanUp {
    // Define `apply` as its prototype method which is supplied with compiler as its argument
    apply(compiler) {
        // Specify the event hook to attach to
        compiler.hooks.emit.tapAsync('PostCleanUpAssets', (compilation, callback) => {
            Object.keys(compilation.assets)
                .filter(asset => {
                    return ["*/css/**/*.js", "*/css/**/*.js.map"].some(pattern => {
                        return minimatch(asset, pattern);
                    });
                })
                .forEach(asset => {
                    delete compilation.assets[asset];
                });
            callback();
        });
    }
}

class WebpackBundle {
    static forCartridge(cartridgeName) {

        const devMode = process.env.NODE_ENV !== "production";
        const cartridgesPath = path.resolve(__dirname, "cartridges");

        const clientPath = path.resolve(cartridgesPath, cartridgeName, "cartridge/client");
        if (!fse.existsSync(clientPath)) {
            return;
        }
        var bundles = [];
        const jsBundle = {}, scssBundle = {};
        jsBundle.entry = {};
        scssBundle.entry = {};

        glob.sync(path.resolve(clientPath, "*", "js", "*.js")).forEach(f => {
            const key = path.join(path.dirname(path.relative(clientPath, f)), path.basename(f, ".js"));
            jsBundle.entry[key] = f;
        });

        glob.sync(path.resolve(clientPath, "*", "scss", "**", "*.scss"))
            .filter(f => !path.basename(f).startsWith("_"))
            .forEach(f => {
                const key = path.join(path.dirname(path.relative(clientPath, f)).replace('scss', 'css'), path.basename(f, ".scss"));
                scssBundle.entry[key] = f;
            });
        var output = {
            path: path.resolve(cartridgesPath, cartridgeName, "cartridge/static")
        };

        jsBundle.output = output;
        scssBundle.output = output;
        // JS bundle module
        jsBundle.module = {
            rules: [
                {
                    test: /\.(js|jsx)$/,
                    use: [
                        'cache-loader',
                        {
                            loader: "babel-loader",
                            options: {
                                compact: false,
                                babelrc: false,
                                presets: ["@babel/preset-env"],
                                plugins: [
                                    "@babel/plugin-proposal-object-rest-spread"
                                ],
                                cacheDirectory: true
                            }
                        }
                    ]
                }
            ]
        };

        //SCSS bundle module

        scssBundle.module = {
            rules: [
                {
                    test: /\.(sa|sc|c)ss$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        { loader: "css-loader", options: { url: false, sourceMap: devMode } },
                        {
                            loader: 'postcss-loader', // Run post css actions
                            options: {
                              plugins: function () { // post css plugins, can be exported to postcss.config.js
                                return [
                                  require('autoprefixer')({
                                      remove:false
                                  })
                                ];
                              }
                            }
                        },
                        {
                            loader: "sass-loader",
                            options: {
                                importer: sassJsonImporter(),
                                includePaths: [
                                    path.resolve(__dirname, "node_modules"),
                                    path.resolve(__dirname, "node_modules", "flag-icon-css", "sass")
                                ],
                                sourceMap: devMode
                            }
                        }
                    ]
                }
            ]
        };
        var jsBundleAlias = {};
        var scssBundleAlias = {};
        Object.keys(ALIASES).forEach((key) => {
            jsBundleAlias[key] = path.resolve(ALIASES[key], "js");
            scssBundleAlias[key] = path.resolve(ALIASES[key], "scss");
        });
        jsBundle.resolve = {
            modules: ["node_modules", path.resolve(__dirname, "cartridges")],
            alias: jsBundleAlias
        };

        scssBundle.resolve = {
            modules: ["node_modules", path.resolve(__dirname, "cartridges")],
            alias: scssBundleAlias
        };

        jsBundle.plugins = [
            new CleanWebpackPlugin(["static/**/js"], {
                root: path.resolve(cartridgesPath, cartridgeName, "cartridge"),
                verbose: true
            })
        ];

        scssBundle.plugins = [
            new CleanWebpackPlugin(["static/**/css"], {
                root: path.resolve(cartridgesPath, cartridgeName, "cartridge"),
                verbose: true
            }),
            new MiniCssExtractPlugin({
                filename: '[name].css'
            }),
            new WebpackRTLPlugin({
                filename: [/(default)/i, 'ar'],
                minify: !devMode,
                cssProcessorPluginOptions: {
                    preset: ["default", { colormin: false }]
                }
            }),
            new PostBuildCleanUp()
        ];


        if (devMode) {
            jsBundle.mode = "development";
            jsBundle.devtool = "cheap-module-eval-source-map";
            scssBundle.mode = "development";
            scssBundle.devtool = "source-map";
        } else {
            jsBundle.mode = "production";
            jsBundle.devtool = false;
            jsBundle.optimization = {
                minimizer: [
                    new UglifyJsPlugin({
                        cache: true,
                        parallel: true,
                        sourceMap: false
                    })
                ]
            };
            scssBundle.mode = "none";
            scssBundle.devtool = false;
        }

        jsBundle.performance = { hints: false };
        scssBundle.performance = { hints: false };
        if (Object.keys(jsBundle.entry).length) {
            bundles.push(jsBundle);
        }
        if (Object.keys(scssBundle.entry).length) {
            bundles.push(scssBundle);
        }
        return bundles;
    }
}
/**
 * Add cartridges to CARTRIDGES_TO_BUILD
 * If plugin_ cartridge is added to project and has JS, SCSS add ALIAS for front end build if one of brand cartridges or refapp requires it.
 * See plugin_wishlist or plugin_applepay and relevant JS, SCSS files in brand cartridges have to be updated based on newly added plugin cartridge
 */

const CARTRIDGES_TO_BUILD = [
    "app_mouawad_core"
];
const PIPELINES = [];

CARTRIDGES_TO_BUILD.forEach((cartridge) => {
    WebpackBundle.forCartridge(cartridge).forEach((bundle) => {
        PIPELINES.push(bundle);
    });
});
module.exports = PIPELINES;
