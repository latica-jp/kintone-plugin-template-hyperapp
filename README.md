# kintone プラグイン開発テンプレート

kintone 公式から配布されている create-plugin パッケージは node 環境を使用したモダンな kintone プラグイン開発環境を提供しています。

このテンプレートは create-plugin パッケージで作成したプロジェクトに latica が以下の手順で webpack + babel による ES6 対応などを加えたものです。

## プラグインプロジェクトの作成

create-plugin パッケージを使用してプロジェクトを作成します。

```
npx @kintone/create-plugin kintone-plugin-template
cd kintone-plugin-template
yarn
```

`.gitignore` を生成します。

```
brew install gibo
gibo dump node visualstudiocode >> .gitignore
```

`.gitignore` にパッケージングしたプラグインファイルが出力されるフォルダを追加します。

```
### packaged plugin files
dist/
```

ESLint を削除、Prettier を追加します。

```
rm .eslintrc.js
yarn remove eslint
yarn remove eslint-config-kintone
yarn add --dev prettier
```

`.prerrierrc` ファイルを追加します。

```
{
  "singleQuote": true,
  "trailingComma": "es5"
}
```

## Webpack 環境の構築

[こちらの記事](https://qiita.com/yamaryu0508/items/fa68fb83dabd04fae3cc)を参考にいくらかの追加／修正事項を入れて Webpack 環境を構築します。

必要なパッケージをインストールします。

```
yarn add --dev webpack webpack-cli
yarn add --dev @babel/core @babel/preset-env babel-loader
yarn add --dev @kintone/webpack-plugin-kintone-plugin
yarn add --dev core-js
```

`webpack.config.js` ファイルを作成します。

前述の記事からの主な変更点は下記のとおりです。

- 出力パスを変更
- @babel/preset-env の設定に以下を追加
  - 対応ブラウザを指定
  - 必要な polyfill のみ含める
  - Tree Shaking を有効にする
- jQuery は外部モジュールから読み込む

```
const webpack = require('webpack');
const path = require('path');
const kintonePlugin = require('@kintone/webpack-plugin-kintone-plugin');

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
    new kintonePlugin({
      manifestJSONPath: './src/manifest.json',
      privateKeyPath: './private.ppk',
      pluginZipPath: './dist/plugin.zip',
    }),
    // import なしにモジュールをロードする
    // see: https://webpack.js.org/plugins/provide-plugin/
    new webpack.ProvidePlugin({
      $: 'jquery',
    }),
  ],
  // jQuery を外部モジュールからロードする
  // see: https://webpack.js.org/configuration/externals/#externals
  externals: {
    jquery: 'jQuery',
  },
};
```

`package.json` ファイルの `scripts` セクションを改変します。

webpack による js ファイルのトランスパイル処理が入るため、必要なスクリプトを追加します。

また、もとのスクリプトはコードの改変を watch してパッケージングとアップロードを自動化することを意図しているので、トランスパイルも含めた入れた自動プロセスを作成します。

```
  "scripts": {
    "start": "node scripts/npm-start.js",
    "upload": "env-cmd ./.env kintone-plugin-uploader dist/plugin.zip --watch --waiting-dialog-ms 3000",
    "develop": "npm-run-all \"babel -- --watch\" \"package -- --watch\"",
    "build": "npm-run-all babel package",
    "babel": "webpack --mode development",
    "package": "kintone-plugin-packer --ppk private.ppk --out dist/plugin.zip src"
  },
```

`start` スクリプトは npm-run-all パッケージを使用して `develop` と `upload` を実行しています。そこで、`develop` スクリプトを改変して babel によるとトランスパイルと kintone-plugin-packer によるパッケージングを行うようにします。この際、並行ではなく順次実行を行います。

なお、`npm run build -- --watch` のような指定方法は、`--` につづくコマンドラインオプションを `build` スクリプトに渡します。 

また、plugin-uploader はアップロード先を環境変数で指定できるようになっていますので、プラグインのアップロードに先立って `.env` ファイルから環境変数を読み込むようにします。前提として env-cmd パッケージのインストールが必要です。

```
yarn add --dev env-cmd
```

`.env ` ファイルを作成します。

```
KINTONE_DOMAIN=domain.cybozu.com
KINTONE_USERNAME=username
KINTONE_PASSWORD=password
```

