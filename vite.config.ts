import { resolve } from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/main.ts'), // エントリポイント
      name: 'vue-kirinukikun', // グローバル変数として公開するライブラリの変数名
      fileName: 'vue-kirinukikun-lib', // 生成するファイルのファイル名を指定します。
      formats: ['es', 'umd'], // 生成するモジュール形式を配列で指定します。デフォルトで['es', 'umd'] なのでこの場合はなくても大丈夫です。
    },
    rollupOptions: {
      // ライブラリにバンドルされるべきではない依存関係を
      // 外部化するようにします
      external: ['vue'],
      output: {
        // 外部化された依存関係のために UMD のビルドで使用する
        // グローバル変数を提供します
        globals: {
          vue: 'Vue'
        }
      }
    }
  },
  plugins: [vue()]
})
