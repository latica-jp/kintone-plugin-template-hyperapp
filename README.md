プロジェクトの作成

```
npx @kintone/create-plugin kintone-plugin-template
cd kintone-plugin-template
yarn
```

.gitignore の作成

```
brew install gibo
gibo dump node visualstudiocode >> .gitignore
```

.gitignore にパッケージングしたプラグインファイルが出力されるフォルダを追加

```
### packaged plugin files
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

