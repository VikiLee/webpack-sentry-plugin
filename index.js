const SentryPlugin = require('@sentry/webpack-plugin');
const InjectPlugin = require('webpack-inject-plugin').default;
const Joi = require('joi');

class SentryWebpackPlugin {
  constructor(options) {
    this.options = options;
    this.validateOptions();
  }
  validateOptions() {
    const schema = Joi.object({
      dns: Joi.string().uri().required(),
      release: Joi.string().required(),
      config: Joi.object(),
      test: Joi.boolean()
    });
    const value = schema.validate(this.options);
    if (value.error) {
      throw new Error(value.error)
    }
  }

  apply(compiler) {
    const webpackOptions = compiler.options;
    const pluginOptions = this.options;
    const test = pluginOptions.test || false; // test设为true的情况下，不验证任何环境

    // 默认只有生产环境才上报 如果配置了test 则都会上报
    if (!test && webpackOptions.mode !== 'production') {
      return;
    }
    
    const code = `
      var Sentry = require('@sentry/browser');
      var config = Object.assign({
          dsn: '${pluginOptions.dns}',
          release: '${pluginOptions.release}'
        }, 
        ${JSON.stringify(pluginOptions.config ? pluginOptions.config : {})},
        {  
          ${pluginOptions.config.beforeSend ? pluginOptions.config.beforeSend.toString() : ''}
        }
      );
      Sentry.init(config);
    `;
    compiler.options.plugins.push(
      new InjectPlugin(() => `${code}`)
    )

    if (webpackOptions.mode === 'production' 
      && webpackOptions.devtool && webpackOptions.devtool.indexOf('source-map') > -1) {
        compiler.hooks.emit.tap('sentryPlugin', (compilation) => {
          const sentryPlugin = new SentryPlugin({
            release: pluginOptions.release,
            include: webpackOptions.output.path,
            urlPrefix: `~/`,
            ignoreFile: '.sentrycliignore',
            ignore: ['node_modules', 'webpack.config.js'],
            debug: true
          });
          sentryPlugin.apply(compiler);
        })
    
        compiler.hooks.done.tap('sentryPlugin', () => {
          const { rm } = require('shelljs');
          const { output: { path } } = webpackOptions;
          try {
            rm('-rf', `${path}/**/*.map`);
          } catch (err) {
            console.warning(err)
          }
        })
    }
  }
}

module.exports = SentryWebpackPlugin