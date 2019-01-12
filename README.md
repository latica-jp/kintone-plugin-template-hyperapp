# kintone プラグイン開発テンプレート with HyperApp

kintone 公式から配布されている create-plugin パッケージは node 環境を使用したモダンな kintone プラグイン開発環境を提供しています。

このテンプレートは create-plugin パッケージで作成したプロジェクトに webpack + babel による ES6 対応などを加えたものです。

また、設定画面の表示や動作に超軽量な View ライブラリである [HyperApp](https://github.com/jorgebucaran/hyperapp) を使用しています。

## 使いかた

```
git clone https://github.com/latica-jp/kintone-plugin-template.git sample
cd sample
yarn
```
`.env` ファイルを作成し、kintone プラグインのアップロード情報を入力します。

```
KINTONE_DOMAIN=domain.cybozu.com
KINTONE_USERNAME=username
KINTONE_PASSWORD=password
```

プラグインのビルド（コードのプリコンパイル、プラグインのパッケージング）は下記のコマンドを入力します。

```
yarn build
```

プラグインのアップロードは、下記のコマンドを入力します。

```
yarn upload
```

下記のコマンドを入力すると、ソースコードの変更を検知して自動的にビルドとアップロードを行います。開発時に便利です。

```
yarn start
```

## このテンプレートの作成過程

このテンプレートは create-plugin パッケージで作成したプロジェクトに latica が以下の手順で webpack + babel による ES6 対応などを加えたものです。

### プラグインプロジェクトの作成

create-plugin パッケージを使用してプロジェクトを作成

```
npx @kintone/create-plugin kintone-plugin-template
cd kintone-plugin-template
yarn
```

`.gitignore` を生成

```
brew install gibo
gibo dump node visualstudiocode >> .gitignore
```

`.gitignore` にパッケージングしたプラグインファイルが出力されるフォルダを追加

```
dist/
```

ESLint を削除、Prettier を追加

```
rm .eslintrc.js
yarn remove eslint
yarn remove eslint-config-kintone
yarn add --dev prettier
```

`.prerrierrc` ファイルを追加

```
{
  "singleQuote": true,
  "trailingComma": "es5"
}
```

### Webpack 環境の構築

[こちらの記事](https://qiita.com/yamaryu0508/items/fa68fb83dabd04fae3cc)を参考にいくらかの追加／修正事項を入れて Webpack 環境を構築

必要なパッケージをインストール

```
yarn add --dev webpack webpack-cli
yarn add --dev @babel/core @babel/preset-env babel-loader
yarn add --dev @kintone/webpack-plugin-kintone-plugin
yarn add --dev core-js
```

`webpack.config.js` ファイルを作成

前述の記事からの主な変更点は下記のとおり

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

プラグインのマニフェストファイル `src/manifest.json` を修正して、パッケージ対象コードをソースコードではなくトランスパイルしたコードにする

```
  "desktop": {
    "js": [
      "https://js.cybozu.com/jquery/3.3.1/jquery.min.js",
      "dist/desktop.js"
    ],
```

```
  "config": {
    "html": "html/config.html",
    "js": [
      "https://js.cybozu.com/jquery/3.3.1/jquery.min.js",
      "dist/config.js"
    ],
```

なお、出力先の `src/dist` ディレクトリは `.gitignore` ですでに `dist/` が指定されているため、改めての指定は不要。

`package.json` ファイルの `scripts` セクションを改変

- `build` を webpack に変更
- 初回ビルド時にプラグインのキーファイルを生成する必要があるので、必要なスクリプト `prepare`を追加
- `npm run build -- --watch` のような指定方法は、`--` につづくコマンドラインオプションを `build` スクリプトに渡す

```
  "scripts": {
    "start": "node scripts/npm-start.js",
    "prepare": "node scripts/checkKeyFile.js",
    "upload": "env-cmd ./.env kintone-plugin-uploader dist/plugin.zip --watch --waiting-dialog-ms 3000",
    "develop": "npm run build -- --watch",
    "build": "webpack"
  },
```

また、plugin-uploader はアップロード先を環境変数で指定できるようになっているので、プラグインのアップロードに先立って `.env` ファイルから環境変数を読み込むようにする。前提として env-cmd パッケージのインストールが必要

```
yarn add --dev env-cmd
```

`.env ` ファイルを作成

```
KINTONE_DOMAIN=domain.cybozu.com
KINTONE_USERNAME=username
KINTONE_PASSWORD=password
```

## Hyperapp

Hyperapp は非常に軽量な JavaScript View ライブラリです。

kintone のカスタマイズやプラグイン開発において、画面表示や動作にフロントエンド用のフレームワークを使用したいケースがあります。この場合、Vue や React を使用するケースが多いようです。

kintone のカスタマイズやプラグイン開発は、アプリケーションとしては比較的、小規模なものが多いと考えられます。こうしたニーズに対して、ここでは非常に軽量で導入が容易な Hyperapp の利用を提案しています。

なお、Hyperapp は軽量ですが、kintone プラグインの容量制限を考慮して外部ライブラリとして読みこんでいます。

### Hyperapp 対応に必要な作業

JSX をトランスパイルするための babel プラグインを追加

```
yarn add --dev @babel/plugin-transform-react-jsx
```

`config.html`：hyperapp の描画ルートを定義

```
<div id="kintone-plugin-config"></div>
```

`manifest.json`：hyperapp のライブラリを追加

```
  "desktop": {
    "js": [
      "https://js.cybozu.com/jquery/3.3.1/jquery.min.js",
      "https://cdnjs.cloudflare.com/ajax/libs/hyperapp/1.2.9/hyperapp.js",
      "dist/desktop.js"
    ...
  "config": {
    "html": "html/config.html",
    "js": [
      "https://js.cybozu.com/jquery/3.3.1/jquery.min.js",
      "https://cdnjs.cloudflare.com/ajax/libs/hyperapp/1.2.9/hyperapp.js",
    ...
```

`webpack.config.js`：JSX のトランスパイル、Hyperapp を外部モジュールとして定義

```js
module.exports = {
  ...
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          ...
          // jsx を hyperapp 仕様に変換
          // see: https://github.com/jorgebucaran/hyperapp
          plugins: [
            [
              '@babel/plugin-transform-react-jsx',
              {
                pragma: 'h',
              },
            ],
          ],
        },
      },
    ],
  },
  ...
  externals: {
    jquery: 'jQuery',
    hyperapp: 'hyperapp',
  },
};

```

`config.html`：hyperapp の View を表示する要素のみ

```jsx
<div id="kintone-plugin-config"></div>
```

`config.js`：hyperapp の `state`、`actions` を定義。設定画面はコンポーネントとして切り出し

```jsx
// jQuery, hyperapp は webpack がロード
import Config from './components/Config';

const PLUGIN_ID = kintone.$PLUGIN_ID;

const config = kintone.plugin.app.getConfig(PLUGIN_ID);

const getSettingsUrl = () => {
  return '/k/admin/app/flow?app=' + kintone.app.getId();
};

const setConfig = state => {
  kintone.plugin.app.setConfig({ message: state.message }, () => {
    alert('Please update the app!');
    window.location.href = getSettingsUrl();
  });
};

const state = {
  message: config.message,
};

const actions = {
  messageChanged: event => ({ message: event.target.value }),
  submit: () => state => setConfig(state),
};

hyperapp.app(
  state,
  actions,
  Config,
  document.getElementById('kintone-plugin-config')
);

```

`components/Config.js`：コンポーネント化した設定画面

```jsx
import { h } from 'hyperapp';

const Config = (state, actions) => (
  <section class="settings">
    <h2 class="settings-heading">Settings for kintone-plugin-template</h2>
    <p class="kintoneplugin-desc">
      This message is displayed on the app page after the app has been updated.
    </p>
    <p class="kintoneplugin-row">
      <label for="message">
        Message:
        <input
          type="text"
          value={state.message}
          onchange={actions.messageChanged}
          class="js-text-message kintoneplugin-input-text"
        />
      </label>
    </p>
    <p class="kintoneplugin-row">
      <button class="kintoneplugin-button-normal" onclick={actions.submit}>
        Save
      </button>
    </p>
  </section>
);

export default Config;
```

`desktop.js`：一覧への表示画面

```jsx
// jQuery, hyperapp は webpack がロード
import Message from './components/Message';

const PLUGIN_ID = kintone.$PLUGIN_ID;
const config = kintone.plugin.app.getConfig(PLUGIN_ID);

const state = { message: config.message };

kintone.events.on('app.record.index.show', () => {
  const spaceElement = kintone.app.getHeaderSpaceElement();
  hyperapp.app(state, {}, Message, spaceElement);
});
```

`components/Message.js`：コンポーネント化したメッセージ

```jsx
import { h } from 'hyperapp';

const Message = state => (
  <div>
    <h3 class="plugin-space-heading">Hello, kintone plugin!</h3>
    <p class="plugin-space-message">{state.message}</p>
  </div>
);

export default Message;
```
