## wepack-sentry-plugin
用于集成sentry的webpack插件  
1、自动初始化sentry  
2、如果你生成了sourcemap文件，自动上传sourcemap到sentry，并且上传完会删除soucemap文件

### usage
```
const SentryPlugin = require('webpack-sentry-plugin');

module.exports = {
  plugins: [
    new SentryPlugin({
      dns: 'https://ba4exxxxxx@xxxx/xxxx', // sentry client keys of your projct
      release: 'c31e0bc068df1xxxxxx',
      config: {
        ignoreErrors: [
          'Network Error',
          /timeout of \d+ms exceeded/
        ]
      } //其他的sentry初始化配置
    })
  ]
};
```
创建.sentryclirc文件，以便插件上传sourcemap文件到sentry，
```
[auth]
token=xxxx

[defaults]
url=xxxx
org=xxxx
project=xxxx

[log]
level=info
```
把token和project替换成你自己的。
### Options
属性 | 描述  | 类型
---|---|---
dns | client keys | string
release | sentry上报异常的项目release号，如c31e0bc06... | string
config | sentry初始化其他的配置，点击[这里](https://docs.sentry.io/error-reporting/configuration/?platform=javascript)查看详情 | object
test | 默认情况下，只有生产环境才会上报，如果你想开发环境也上报，可以配置为true | boolean