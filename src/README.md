# 開発向けREADME

viteのライブラリモードを利用してのコンポーネントライブラリの開発・公開についての説明。
Viteのライブラリモードについては下記記事を参照してください。

[Vue3 + vite + TypeScriptで作ったコンポーネントをnpmに公開してみる](https://qiita.com/Tukudanium/items/d429aca28619026c67a3)

## 環境

TypeScript
Vue.js
Vite
Node.js

## セットアップ

前提：Node.jsがインストール済みであること

コードをクローン

↓

```bash
yarn install
```

デバッグ、ビルド、デプロイについては下記開発手順で説明。

## 開発手順

### 通常のVueとしてテストする

`main.ts`

```ts:
import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

createApp(App).mount('#app')

// import TextItem from "./components/TextItem.vue";
// export { TextItem };
```

`App.vue`

```ts:
<script setup lang="ts">
<script setup lang="ts">
  import TextItem from "./components/kirinukikun.vue"; // コンポーネントファイルのテスト
</script>
```

この状態で

```bash
yarn dev
```

通常のVueアプリケーションとして起動できる。基本はこの状態で開発する。

### ビルドしてnpmパッケージを作成

`main.ts`

```ts:
// import { createApp } from 'vue'
// import './style.css'
// import App from './App.vue'

// createApp(App).mount('#app')

import TextItem from "./components/kirinukikun.vue";
export { TextItem };
```

この状態で

```bash
yarn build
```

をすることで、`main.ts`内でエクスポートされている要素（このライブラリの場合、`kirinukikun.vue`）がNPMパッケージとしてビルドされ、distファイル内に展開される。

### ビルドしたnpmパッケージのテスト

`App.vue`

```ts
<script setup lang="ts">
<script setup lang="ts">
  import { TextItem } from "vue-kirinukikun";// npmパッケージのテスト
</script>
```

この状態で

```bash
npm link
```

```bash
npm link vue-kirinukikun
```

をすることで、ビルドによってdistファイル内に展開されたファイルが `node_modules`配下にインストールされ、NPMパッケージと同様に利用できるようになる。

### npmパッケージのデプロイ

[ビルドしてnpmパッケージを作成](###ビルドしてnpmパッケージを作成)と同じ状態にした後、`package.json`のバージョン情報を更新。

`package.json`

```ts
{
  "name": "vue-kirinukikun",
  "private": false,
  "version": "1.1.0", // バージョン情報
  "type": "module",
~~~
```

メジャーバージョンアップを行わない場合、変更しなくとも自動でマイナーバージョンが上がる。

### npm上から公開したパッケージをインストール

いったん、[ビルドしたnpmパッケージのテスト](### ビルドしたnpmパッケージのテスト)でインストールしたビルドファイルのパッケージをリセットする。

```bash
yarn install
```

そうしたらインストール。

```bash
yarn add vue-kirinukikun
```

問題なくデプロイできていれば、`node_modules`配下にインストールされる。
