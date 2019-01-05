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

