const webpack = require('webpack');
const path = require('path');
const KintonePlugin = require('@kintone/webpack-plugin-kintone-plugin');

module.exports = {
  mode: 'development', // ビルド時の process.env.NODE_ENV を development に設定
  entry: {
    desktop: './src/js/desktop.js', // デスクトップ用
    config: './src/js/config.js', // プラグイン設定画面用
  }, // entry は エントリポイント、context はエントリポイントになるファイルが含まれるパス
  output: {
    path: path.resolve(__dirname, 'src', 'dist'), // src と同一階層に dist を作成してそちらを設定
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          presets: [
            [
              '@babel/preset-env',
              {
                targets: {
                  browsers: ['last 1 versions', 'iOS 10-12'],
                },
                // 必要な polyfill を自動で入れてくれるモード
                // see: https://qiita.com/shisama/items/88080011bbc69e3e620b
                // yarn add --dev core-js が必要！
                useBuiltIns: 'usage',
                // Tree Shaking を有効にするのに必要
                // https://qiita.com/soarflat/items/755bbbcd6eb81bd128c4
                modules: false,
              },
            ],
          ],
        },
      },
    ],
  },
  plugins: [
    // import なしに jQuery モジュールをロードする
    // see: https://webpack.js.org/plugins/provide-plugin/
    new webpack.ProvidePlugin({
      $: 'jquery',
    }),
    new KintonePlugin({
      manifestJSONPath: './src/manifest.json',
      privateKeyPath: './private.ppk',
      pluginZipPath: './dist/plugin.zip',
    }),
  ],
  // jQuery を外部モジュールからロードする
  // see: https://webpack.js.org/configuration/externals/#externals
  externals: {
    jquery: 'jQuery',
  },
};
